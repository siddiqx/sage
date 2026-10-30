/**
 * Sage — SQL Topic 08: Indexes, B-Trees & Query Optimization
 */

(function () {
  'use strict';

  SAGE.registerTopic({
    id: 'sql-indexing',
    title: 'Indexing Internals, B-Trees & EXPLAIN ANALYZE',
    subject: 'sql',
    module: 'Performance & Internals',
    description: 'B-Tree architecture, GIN/BRIN index types, partial and covering indexes (INCLUDE), and dissecting EXPLAIN (ANALYZE, BUFFERS) execution plans.',
    difficulty: 'Advanced',
    readTime: '17 min read',

    overview: {
      definition: 'An index is a redundant secondary data structure that stores sorted column values and pointers to physical heap disk pages (tuples). Without an index, the database engine must execute a Sequential Scan (full table scan), reading every block from disk. By leveraging balanced tree (B-Tree), inverted (GIN), or block range (BRIN) structures, the engine reduces lookup time from O(N) to O(log N) seeks.',
      mentalModel: 'Think of a table as an 800-page encyclopedia. A Sequential Scan is reading every page from page 1 to 800 to find references to "Quantum Physics". An Index is the alphabetical index at the back of the book: it tells you the exact page numbers in 3 seconds, allowing you to jump directly to the target paragraphs.'
    },

    terminology: [
      {
        term: 'B-Tree Index',
        definition: 'The default self-balancing search tree in PostgreSQL. Supports equality (`=`), range queries (`<, <=, >, >=`), and `ORDER BY` operations in O(log N) time.'
      },
      {
        term: 'GIN (Generalized Inverted Index)',
        definition: 'An inverted index mapping elements inside composite types (JSONB keys/values, arrays, full-text words) to the rows containing them.'
      },
      {
        term: 'BRIN (Block Range Index)',
        definition: 'Lightweight index for massive tables where physical disk order correlates with column values (e.g. auto-increment IDs, timestamps).'
      },
      {
        term: 'Covering Index (`INCLUDE`)',
        definition: 'An index that stores extra non-key payload columns in leaf pages, enabling Index-Only Scans that skip the table heap entirely.'
      },
      {
        term: 'Partial Index',
        definition: 'An index built over a subset of rows defined by a `WHERE` clause (e.g. `CREATE INDEX ... WHERE status = \'pending\'`), saving memory and write overhead.'
      }
    ],

    explanation: [
      {
        heading: '1. B-Tree Architecture: Why It Rules Relational Databases',
        content: 'A B-Tree consists of a Root page, Internal Branch pages, and Leaf pages:<br><ul><li><strong>High Branching Factor:</strong> Each 8 KB disk page holds hundreds of keys. A 3-level B-Tree can index tens of millions of rows in just 3 page reads!</li><li><strong>Doubly-Linked Leaf Nodes:</strong> All leaf pages are connected by forward and backward pointers. Once the start of a range is found, range queries (<code>WHERE date BETWEEN a AND b</code>) simply stream along the leaf chain without traversing back up the tree.</li></ul>'
      },
      {
        heading: '2. The 3 Types of Scans in `EXPLAIN ANALYZE`',
        content: 'When inspecting execution plans via <code>EXPLAIN (ANALYZE, BUFFERS)</code>:<br><ol><li><strong>Seq Scan (Sequential Scan):</strong> Reads every disk page sequentially. Normal for small tables, but disastrous for large tables.</li><li><strong>Index Scan:</strong> Traverses the B-Tree to find the row pointer (TID: Block + Offset), then reads the actual row from the heap page.</li><li><strong>Bitmap Index Scan + Bitmap Heap Scan:</strong> Used when many rows match. It gathers matching TIDs into a memory bitmap first, sorts them physically by disk block order, and reads pages sequentially to prevent random disk head thrashing.</li><li><strong>Index-Only Scan:</strong> The Holy Grail. All requested columns are present in the index itself; PostgreSQL never touches the table heap!</li></ol>'
      },
      {
        heading: '3. Expression & Partial Indexes',
        content: 'If your query searches by lowercased email: <code>WHERE LOWER(email) = \'user@example.com\'</code>, a standard index on <code>email</code> will <strong>never</strong> be used! You must create an <strong>Expression Index</strong>:<br><code>CREATE INDEX idx_users_lower_email ON users (LOWER(email));</code><br><br>Similarly, if 99% of orders are \'COMPLETED\' and you only care about processing \'PENDING\' orders, create a <strong>Partial Index</strong>:<br><code>CREATE INDEX idx_pending_orders ON orders (created_at) WHERE status = \'PENDING\';</code>'
      }
    ],

    syntax: {
      pattern: `-- 1. Standard B-Tree Composite Index
CREATE INDEX idx_orders_cust_date ON orders (customer_id, order_date DESC);

-- 2. Covering Index for Index-Only Scans
CREATE INDEX idx_users_email_covering ON users (email) INCLUDE (name, role);

-- 3. Partial Index (Tiny size, low maintenance)
CREATE INDEX idx_active_tasks ON tasks (priority, due_date) WHERE is_completed = FALSE;

-- 4. Expression Index
CREATE INDEX idx_users_lower_username ON users (LOWER(username));

-- 5. Dissecting Query Plan
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT email, name FROM users WHERE email = 'test@example.com';`,
      components: [
        { part: 'CREATE INDEX ... (col1, col2)', meaning: 'Composite index ordered by col1 then col2' },
        { part: 'INCLUDE (extra_col)', meaning: 'Stores payload columns on leaf pages for Index-Only scans' },
        { part: 'WHERE condition', meaning: 'Partial index indexing only rows matching the predicate' },
        { part: 'EXPLAIN (ANALYZE, BUFFERS)', meaning: 'Executes query and displays actual time, buffers hit, and plan tree' }
      ]
    },

    examples: [
      {
        title: 'Verifying Index-Only Scan with Covering Index and EXPLAIN',
        description: 'Creating a table, testing query execution plans, and verifying an Index-Only Scan using INCLUDE.',
        code: `-- 1. Schema setup
CREATE TABLE customer_accounts (
    account_id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    account_status VARCHAR(20) NOT NULL,
    balance NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Insert dummy dataset
INSERT INTO customer_accounts (email, account_status, balance)
SELECT
    'user_' || i || '@example.com',
    CASE WHEN i % 20 = 0 THEN 'PENDING' ELSE 'ACTIVE' END,
    (i * 10.50)::NUMERIC(12, 2)
FROM generate_series(1, 10000) AS i;

-- 2. Create a Partial Index for PENDING accounts
CREATE INDEX idx_pending_accounts ON customer_accounts (created_at)
WHERE account_status = 'PENDING';

-- 3. Create a Covering Index for instant email authentication
CREATE INDEX idx_account_auth ON customer_accounts (email)
INCLUDE (account_status, balance);

-- 4. Inspect Execution Plan with EXPLAIN
EXPLAIN (ANALYZE, COSTS OFF)
SELECT account_status, balance
FROM customer_accounts
WHERE email = 'user_500@example.com';`,
        output: `                               QUERY PLAN                                
-------------------------------------------------------------------------
 Index Only Scan using idx_account_auth on customer_accounts (actual time=0.032..0.034 rows=1 loops=1)
   Index Cond: (email = 'user_500@example.com'::text)
   Heap Fetches: 0
 Planning Time: 0.125 ms
 Execution Time: 0.052 ms
(5 rows)`,
        explanation: [
          'Line 20-21: The partial index `idx_pending_accounts` indexes only the 500 rows where `account_status = \'PENDING\'`, saving 95% disk space.',
          'Line 24-25: `idx_account_auth` includes `account_status` and `balance` in the leaf nodes.',
          'Line 28-31: The plan confirms `Index Only Scan` with `Heap Fetches: 0`, meaning the query executed in 0.052 ms without touching the table heap on disk.'
        ]
      }
    ],

    notes: [
      {
        type: 'warning',
        title: 'Indexes Are Not Free',
        body: 'Every index added to a table slows down `INSERT`, `UPDATE`, and `DELETE` statements because every index tree must be updated and re-balanced on write. Maintain only indexes that support critical query paths.'
      },
      {
        type: 'info',
        title: 'Left-to-Right Composite Index Rule',
        body: 'An index on `(A, B)` can accelerate queries filtering on `WHERE A = 1` or `WHERE A = 1 AND B = 2`. It CANNOT accelerate queries filtering ONLY on `WHERE B = 2` because the index is sorted by A first!'
      },
      {
        type: 'tip',
        title: 'PostgreSQL Auto-Vacuum & Visibility Map',
        body: 'Index-Only Scans rely on the table\'s Visibility Map. If vacuuming has not cleared dead tuples from a page, PostgreSQL must fetch the heap page (`Heap Fetches > 0`) to confirm row visibility.'
      }
    ],

    commonMistakes: [
      {
        mistake: 'Applying Functions to Indexed Columns in WHERE Clauses',
        incorrectCode: `-- Standard index on created_at is IGNORED because of DATE() function wrap!
SELECT * FROM logs
WHERE DATE(created_at) = '2024-01-01';`,
        correctCode: `-- Re-write as an sargable range query to utilize the index:
SELECT * FROM logs
WHERE created_at >= '2024-01-01 00:00:00'
  AND created_at <  '2024-01-02 00:00:00';`,
        why: 'Wrapping a column in a function (`DATE(col)`, `LOWER(col)`) prevents the B-Tree from performing direct value comparisons, forcing a full table scan.'
      },
      {
        mistake: 'Indexing Low-Cardinality Columns (e.g. Booleans or Gender)',
        incorrectCode: `-- Waste of memory: Index on boolean with 50/50 distribution
CREATE INDEX idx_users_active ON users (is_active);`,
        correctCode: `-- If searching for a rare state, use a Partial Index:
CREATE INDEX idx_inactive_users ON users (user_id) WHERE is_active = FALSE;`,
        why: 'When a column has low cardinality (e.g. 50% True, 50% False), reading through the index is slower than a direct sequential scan. The query planner will simply ignore the index.'
      }
    ],

    comparisons: [
      {
        title: 'PostgreSQL Index Types Comparison',
        headers: ['Index Type', 'Supported Operators', 'Best Data Types', 'Storage Overhead'],
        rows: [
          ['B-Tree', '`=, <, <=, >, >=`, `ORDER BY`', 'Scalars (Numbers, Text, Timestamps)', 'Moderate (proportional to entries)'],
          ['GIN', '`@>, ?, ?|, ?&` (contains, overlaps)', 'JSONB, Arrays, Full-text vectors', 'High (indexes every sub-element)'],
          ['BRIN', '`=, <, <=, >, >=` (monotonically sorted)', 'Large append-only logs, sensor telemetry', 'Extremely Small (< 1% of B-Tree size)']
        ]
      }
    ],

    questions: [
      {
        question: 'What is an Index-Only Scan and how do you achieve it?',
        answer: 'A scan where the database retrieves all requested columns directly from the index without reading the table heap.',
        explanation: 'Achieved by including all filtered and selected columns in the index using composite keys or the `INCLUDE (...)` clause.'
      },
      {
        question: 'Why does an index on `(last_name, first_name)` not accelerate `WHERE first_name = \'John\'`?',
        answer: 'Because composite B-Trees are sorted hierarchically from left to right.',
        explanation: 'Searching for `first_name` alone without `last_name` is like looking for "John" in a phone book ordered by surname—you must scan the entire book.'
      }
    ],

    practice: [
      {
        id: 'sql-idx-ex1',
        title: 'Optimize an Un-indexed Slow Query',
        difficulty: 'Advanced',
        prompt: 'Given a 5,000,000-row `audit_events` table queried with: `SELECT event_id, payload FROM audit_events WHERE tenant_id = 42 AND severity = \'CRITICAL\' ORDER BY created_at DESC LIMIT 20;`, write the optimal composite DDL index definition to accelerate this exact query.',
        starterCode: `-- Write DDL index statement
pass;`,
        solution: `CREATE INDEX idx_audit_events_lookup
ON audit_events (tenant_id, severity, created_at DESC)
INCLUDE (payload);`,
        explanation: 'Equality columns (`tenant_id, severity`) come first, followed by the sorting column (`created_at DESC`), with `payload` included to enable an Index-Only Scan.'
      }
    ],

    references: [
      {
        title: 'PostgreSQL Documentation: Index Types & B-Trees',
        type: 'Official Docs',
        url: 'https://www.postgresql.org/docs/current/indexes-types.html'
      },
      {
        title: 'Use The Index, Luke: A Guide to Database Performance',
        type: 'Article',
        url: 'https://use-the-index-luke.com/'
      }
    ]
  });

})();
