# Database Indexing & Query Optimization: Use The Index, Luke! Study Guide

**Catalog Path:** `D:\Learning\Databases\SQL\Notes\Use-The-Index-Luke.md`  
**Reference Material:** Concepts distilled from Markus Winand's *Use The Index, Luke!* (`use-the-index-luke.com`)  
**Target Audience:** Software developers and data engineers writing SQL queries against relational databases (PostgreSQL, MySQL, Oracle, SQL Server).  
**License Notice:** Original technical study notes explaining relational index mechanics and execution operators.

---

## 1. The Anatomy of an Index

A database index is a redundant data structure designed to optimize search operations at the expense of write overhead (inserts, updates, deletes) and disk space.

### 1.1 The B-Tree (Balanced Tree)
The B-Tree is the default and most widely used index structure in relational databases:
* **Root Node:** Entry point for query searches. Contains keys and pointers to branch nodes.
* **Branch (Internal) Nodes:** Direct the search down the tree hierarchy based on key ranges.
* **Leaf Nodes:** Doubly linked list of nodes containing the indexed keys and corresponding tuple identifiers (`TID` / `ctid` pointing to the physical table heap row).
* **Search Complexity:** O(log N). An index tree with a depth of 3 or 4 can index tens of millions of records, requiring only 3–4 block reads to locate any row.

```
                  [ Root Node: 50 | 100 ]
                 /           |           \
       [ 10 | 30 ]      [ 60 | 80 ]      [ 110 | 150 ]   <-- Branch Nodes
      /     |     \    /     |     \    /      |      \
   [Leaf] [Leaf] [Leaf] [Leaf] [Leaf] [Leaf] [Leaf] [Leaf] <-- Leaf Nodes (Doubly Linked)
     │      │      │      │      │      │      │      │
     ▼      ▼      ▼      ▼      ▼      ▼      ▼      ▼
   [              Table Data Heap Pages                 ]
```

### 1.2 The Heap Table & Clustering
* Relational tables are unordered heaps of pages/blocks.
* When a query filters by a non-indexed column, the database engine must perform a **Sequential Scan** (`Seq Scan`), reading every page from disk.
* **Clustered Index / Index-Organized Table:** In PostgreSQL, the table is physically reordered to match an index via `CLUSTER table USING index;` (not maintained on subsequent inserts). In MySQL (InnoDB), the primary key *is* the clustered table heap.

---

## 2. Where & How Indexes Are Used

### 2.1 The WHERE Clause: Index Lookup Mechanics
An index is traversed in two phases:
1. **Index Search (Root to Leaf):** Tree traversal to find the first matching leaf node entry.
2. **Leaf Node Traversal (Index Scan):** Sequential scanning across leaf nodes following the doubly linked chain until the condition is no longer met.

### 2.2 Equality vs. Range Searches
* **Equality:** `WHERE status = 'ACTIVE'` hits a specific point in the index.
* **Range:** `WHERE created_at >= '2026-01-01' AND created_at < '2026-02-01'` traverses from the lower bound across adjacent leaf nodes.

### 2.3 The Concatenated (Composite) Index & Column Order
When indexing multiple columns (`CREATE INDEX idx ON orders (customer_id, order_date);`):
* **The Golden Rule:** The order of columns in the index declaration determines which queries can use it.
* Query `WHERE customer_id = 42 AND order_date > '2026-01-01'` uses the full index.
* Query `WHERE customer_id = 42` uses the index (leading column matched).
* Query `WHERE order_date > '2026-01-01'` **cannot** perform an efficient index tree search because the tree is sorted first by `customer_id`.

```
Index: (department_id, employee_id)
Valid:   WHERE department_id = 10 AND employee_id = 105   (Full index search)
Valid:   WHERE department_id = 10                         (Prefix index search)
Invalid: WHERE employee_id = 105                          (Skip scan or full index scan required)
```

---

## 3. Query Execution Plan Operators (PostgreSQL)

When running `EXPLAIN (ANALYZE, BUFFERS)` in PostgreSQL, look for these key operators:

| Operator | Mechanics | When Chosen | Performance Implication |
|---|---|---|---|
| **Seq Scan** | Sequential scan of all table blocks in the heap. | Small tables, high selectivity filters (>15-20% of rows), or missing index. | Slow on large tables; high I/O. |
| **Index Scan** | Traverses B-tree to leaf node, reads `ctid`, and immediately fetches the corresponding heap page. | High selectivity (<5% of rows), small result sets. | Fast for point queries; random I/O on heap if scattered. |
| **Index Only Scan** | Traverses B-tree and satisfies the entire query from leaf node data without touching table heap pages. | All referenced columns (filter + select) are in the index, and visibility map shows pages are all-visible. | Maximum performance; lowest possible I/O. |
| **Bitmap Index Scan + Bitmap Heap Scan** | Phase 1: Scans index and builds an in-memory bitmap of block offsets. Phase 2: Reads heap pages in physical sequential order. | Medium selectivity (5%–15% of rows), or combining multiple indexes via `BitmapAnd` / `BitmapOr`. | Replaces random heap I/O with sequential block reads. |

---

## 4. Index Anti-Patterns & Performance Traps

### 4.1 Wrapping Indexed Columns in Functions
```sql
-- BAD: Prevents B-tree index search because index contains raw 'created_at', not the truncated date
SELECT * FROM orders WHERE DATE(created_at) = '2026-10-29';

-- GOOD: SARGable (Search Argument Able) range comparison
SELECT * FROM orders WHERE created_at >= '2026-10-29 00:00:00' AND created_at < '2026-10-30 00:00:00';

-- ALTERNATIVE: Functional/Expression Index
CREATE INDEX idx_orders_date ON orders (DATE(created_at));
```

### 4.2 Leading Wildcard Matches
```sql
-- BAD: Cannot traverse B-tree index from root
SELECT * FROM users WHERE email LIKE '%@gmail.com';

-- GOOD: Traverses B-tree prefix
SELECT * FROM users WHERE email LIKE 'alice%';

-- ALTERNATIVE: Use Trigram (GIN) Index for arbitrary substring search in PostgreSQL
CREATE EXTENSION pg_trgm;
CREATE INDEX idx_users_email_trgm ON users USING gin (email gin_trgm_ops);
```

### 4.3 Implicit Type Conversions
If `phone_number` is stored as `VARCHAR` but queried with an unquoted integer (`WHERE phone_number = 1234567890`), PostgreSQL will implicitly cast the column `WHERE phone_number::integer = 1234567890`, disabling the standard B-tree index. Always match query literal types to column types.

---

## 5. Advanced Indexing Techniques

### 5.1 Partial (Filtered) Indexes
Index only a subset of table rows satisfying a predicate:
```sql
-- Perfect for queues, active flags, or soft-deleted tables
CREATE INDEX idx_unprocessed_jobs ON background_jobs (id) WHERE status = 'PENDING';
```
*Benefits:* Dramatically reduced index size, lower memory pressure, zero maintenance cost when modifying non-pending rows.

### 5.2 Covering Indexes (`INCLUDE` Clause)
Store extra non-key payload columns directly in leaf nodes without adding them to branch node sorting:
```sql
CREATE INDEX idx_users_lookup ON users (username) INCLUDE (email, created_at);
```
Enables **Index Only Scans** for `SELECT email, created_at FROM users WHERE username = 'bob'` without increasing B-tree height.
