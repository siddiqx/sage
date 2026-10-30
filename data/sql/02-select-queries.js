/**
 * Sage — SQL Topic 02: SELECT, Filtering & Sorting
 */

(function () {
  'use strict';

  SAGE.registerTopic({
    id: 'sql-select-queries',
    title: 'SELECT Queries, Three-Valued Logic & Pagination',
    subject: 'sql',
    module: 'Querying Fundamentals',
    description: 'SQL logical execution order, three-valued boolean logic (NULL semantics), case-insensitive ILIKE, NULLS LAST sorting, and keyset pagination.',
    difficulty: 'Beginner',
    readTime: '14 min read',

    overview: {
      definition: 'The `SELECT` statement is the core querying mechanism of SQL. Although written starting with `SELECT`, SQL queries are processed logically in a distinct order: `FROM` -> `WHERE` -> `GROUP BY` -> `HAVING` -> `SELECT` -> `DISTINCT` -> `ORDER BY` -> `LIMIT`. Understanding this execution pipeline is essential for writing performant queries, resolving column alias scopes, and mastering SQL\'s Three-Valued Boolean Logic.',
      mentalModel: 'Think of a SQL query as an industrial water purification funnel. Water first enters the system from reservoirs (`FROM`). Coarse filters remove unwanted debris (`WHERE`). Clean water is then packaged into bottles with labels (`SELECT`). Finally, the bottles are arranged in sorted crates (`ORDER BY`), and the top N crates are loaded onto the truck (`LIMIT`).'
    },

    terminology: [
      {
        term: 'Logical Execution Order',
        definition: 'The sequence in which the SQL engine evaluates query clauses: FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> DISTINCT -> ORDER BY -> LIMIT.'
      },
      {
        term: 'Three-Valued Logic (3VL)',
        definition: 'SQL boolean evaluation results in `TRUE`, `FALSE`, or `UNKNOWN`. Any comparison with `NULL` (e.g. `col = NULL`) yields `UNKNOWN`, which is treated as not true.'
      },
      {
        term: '`ILIKE`',
        definition: 'PostgreSQL-specific pattern matching operator performing case-insensitive text matching (equivalent to `LOWER(col) LIKE LOWER(pattern)`).'
      },
      {
        term: '`NULLS FIRST / NULLS LAST`',
        definition: 'Explicit sorting clauses specifying where NULL values appear in an `ORDER BY` clause, avoiding engine-default inconsistencies.'
      },
      {
        term: 'Keyset Pagination (Seek Method)',
        definition: 'A high-performance pagination technique (`WHERE id > :last_seen_id LIMIT 20`) replacing slow, high-offset scans (`OFFSET 100000`).'
      }
    ],

    explanation: [
      {
        heading: '1. Why You Cannot Use SELECT Aliases in the WHERE Clause',
        content: 'A classic beginner confusion is writing: <code>SELECT salary * 12 AS annual_salary FROM emp WHERE annual_salary > 100000</code>. This fails with an error: <code>column "annual_salary" does not exist</code>.<br>This occurs because the <code>WHERE</code> filtering phase executes <strong>before</strong> the <code>SELECT</code> projection phase. The alias <code>annual_salary</code> has not been created yet when <code>WHERE</code> is evaluating rows!'
      },
      {
        heading: '2. The Three-Valued Logic Trap (`NULL` Semantics)',
        content: 'In SQL, <code>NULL</code> represents an unknown value, not zero or an empty string.<br><ul><li><code>NULL = NULL</code> evaluates to <strong>UNKNOWN</strong>, not TRUE.</li><li><code>NULL != 5</code> evaluates to <strong>UNKNOWN</strong>, not TRUE.</li><li>Because <code>WHERE</code> filters accept only rows evaluating strictly to <code>TRUE</code>, rows where the condition is <code>UNKNOWN</code> are discarded!</li></ul>To test for missing values, you must always write <code>col IS NULL</code> or <code>col IS NOT NULL</code>.'
      },
      {
        heading: '3. Keyset Pagination vs OFFSET/LIMIT',
        content: 'When you execute <code>SELECT * FROM logs ORDER BY id LIMIT 20 OFFSET 500000;</code>, PostgreSQL must scan, sort, and discard 500,000 physical rows before returning the 20 results (O(N) time).<br>With <strong>Keyset Pagination</strong>: <code>SELECT * FROM logs WHERE id > 500000 ORDER BY id LIMIT 20;</code>, the B-Tree index jumps directly to row 500,001 in <strong>O(log N) constant time</strong>, instantly retrieving the batch.'
      }
    ],

    syntax: {
      pattern: `-- Standard SELECT Statement Architecture
SELECT DISTINCT
    column_1,
    expression AS alias_name
FROM table_name
WHERE boolean_condition
  AND col_text ILIKE 'prefix%'
  AND nullable_col IS NOT NULL
ORDER BY
    column_1 ASC,
    expression DESC NULLS LAST
LIMIT 25 OFFSET 0;`,
      components: [
        { part: 'SELECT ... FROM', meaning: 'Projects specified columns from the source table' },
        { part: 'WHERE cond', meaning: 'Filters candidate rows before grouping or projection' },
        { part: 'col ILIKE \'%pattern%\'', meaning: 'PostgreSQL case-insensitive wildcard matching' },
        { part: 'ORDER BY ... NULLS LAST', meaning: 'Guarantees NULL values appear at the end of sorted results' },
        { part: 'LIMIT n', meaning: 'Restricts the maximum number of rows returned' }
      ]
    },

    examples: [
      {
        title: 'Three-Valued Logic, Case-Insensitive Filtering, and Keyset Pagination',
        description: 'Demonstrating NULL comparisons, ILIKE search, and high-performance keyset paging.',
        code: `-- 1. Schema setup
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    price NUMERIC(10, 2),
    is_discontinued BOOLEAN DEFAULT FALSE
);

INSERT INTO products (name, category, price) VALUES
('Quantum Laptop', 'Computers', 1299.99),
('Ergonomic Mouse', 'Accessories', 49.99),
('Mechanical Keyboard', 'Accessories', 119.50),
('Cloud Server Voucher', NULL, 250.00),
('USB-C Cable', 'Accessories', NULL);

-- 2. Demonstrating Three-Valued Logic
-- Notice: price != 100 will NOT return the USB-C Cable because NULL != 100 is UNKNOWN!
SELECT name, price FROM products WHERE price != 100.00;

-- 3. Case-Insensitive ILIKE Search & Explicit NULL Placement
SELECT product_id, name, category, price
FROM products
WHERE name ILIKE '%board%' OR category IS NULL
ORDER BY price DESC NULLS LAST;

-- 4. Fast Keyset Pagination Example
SELECT product_id, name, price
FROM products
WHERE product_id > 2
ORDER BY product_id ASC
LIMIT 2;`,
        output: `name          |  price  
---------------------+---------
 Quantum Laptop      | 1299.99
 Ergonomic Mouse     |   49.99
 Mechanical Keyboard |  119.50
 Cloud Server Voucher|  250.00
(4 rows -- USB-C Cable omitted because NULL != 100 evaluates to UNKNOWN!)

 product_id |         name         |  category   | price  
------------+----------------------+-------------+--------
          4 | Cloud Server Voucher | NULL        | 250.00
          3 | Mechanical Keyboard  | Accessories | 119.50
(2 rows)

 product_id |        name         | price  
------------+---------------------+--------
          3 | Mechanical Keyboard | 119.50
          4 | Cloud Server Voucher| 250.00
(2 rows)`,
        explanation: [
          'Line 17: Query demonstrates Three-Valued Logic: the row with `price = NULL` is excluded because `NULL != 100.00` evaluates to UNKNOWN.',
          'Line 20-23: `ILIKE \'%board%\'` matches "Mechanical Keyboard" regardless of capitalization. `NULLS LAST` places missing prices at the bottom.',
          'Line 26-29: `WHERE product_id > 2 LIMIT 2` demonstrates keyset pagination, bypassing OFFSET overhead.'
        ]
      }
    ],

    notes: [
      {
        type: 'warning',
        title: 'Never Use `col = NULL`',
        body: 'Writing `WHERE status = NULL` will never return any rows! Always write `WHERE status IS NULL`.'
      },
      {
        type: 'info',
        title: 'Avoid `SELECT *` in Production APIs',
        body: 'Always specify exact column names. `SELECT *` breaks frontend parsers when new columns are added, prevents index-only scans, and causes unnecessary network serialization overhead.'
      },
      {
        type: 'tip',
        title: '`BETWEEN` is Inclusive',
        body: '`price BETWEEN 10 AND 50` is inclusive: it translates to `price >= 10 AND price <= 50`.'
      }
    ],

    commonMistakes: [
      {
        mistake: 'Referencing a SELECT Alias in the WHERE Clause',
        incorrectCode: `-- ERROR: column "discounted_price" does not exist
SELECT name, price * 0.9 AS discounted_price
FROM products
WHERE discounted_price < 50;`,
        correctCode: `-- Option 1: Repeat the arithmetic expression
SELECT name, price * 0.9 AS discounted_price
FROM products
WHERE (price * 0.9) < 50;

-- Option 2: Wrap in a CTE or subquery
WITH pricing AS (
    SELECT name, price * 0.9 AS discounted_price FROM products
)
SELECT * FROM pricing WHERE discounted_price < 50;`,
        why: 'In SQL logical order of operations, `WHERE` is evaluated before `SELECT` aliases are defined.'
      },
      {
        mistake: 'Using `NOT IN` with Subqueries Containing NULLs',
        incorrectCode: `-- If subquery returns ANY NULL value, NOT IN returns 0 rows!
SELECT * FROM users
WHERE user_id NOT IN (SELECT supervisor_id FROM employees);`,
        correctCode: `-- Safe: Use NOT EXISTS
SELECT u.* FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM employees e WHERE e.supervisor_id = u.user_id
);`,
        why: 'If the subquery contains a single `NULL`, `x NOT IN (..., NULL)` evaluates to `UNKNOWN` for all rows, causing the entire query to return zero results.'
      }
    ],

    comparisons: [
      {
        title: 'Keyset Pagination vs OFFSET/LIMIT',
        headers: ['Property', 'Keyset Pagination (`WHERE id > last_id LIMIT n`)', 'OFFSET Pagination (`LIMIT n OFFSET k`)'],
        rows: [
          ['Performance at Page 10,000', 'Constant O(log N) B-Tree seek time', 'Linear O(N) scan through 10,000 rows'],
          ['Data Drift Stability', 'Stable: New insertions do not duplicate records', 'Unstable: New inserts cause rows to shift between pages'],
          ['Random Page Jumping', 'Requires sequential seeking', 'Directly supports jumping to arbitrary page numbers']
        ]
      }
    ],

    questions: [
      {
        question: 'What is the logical order of operations in an SQL SELECT query?',
        answer: 'FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> DISTINCT -> ORDER BY -> LIMIT.',
        explanation: 'Understanding this pipeline explains why WHERE cannot access SELECT aliases, but ORDER BY can.'
      },
      {
        question: 'Why does `SELECT * FROM table WHERE col = NULL;` return 0 rows even when `col` contains NULLs?',
        answer: 'Because comparing any value to NULL using `=` evaluates to UNKNOWN, which is rejected by WHERE.',
        explanation: 'NULL represents an unknown state, so two unknown values cannot be confirmed equal. You must use `col IS NULL`.'
      }
    ],

    practice: [
      {
        id: 'sql-sel-ex1',
        title: 'Paginated Inventory Search',
        difficulty: 'Beginner',
        prompt: 'Given an `items` table with columns `(item_id, title, category, price, stock)`, write a query that selects active items where category is either \'Electronics\' or \'Hardware\', title contains \'Pro\' (case-insensitive), and stock is greater than 0. Sort by price descending with NULL prices last, limiting to the first 10 items.',
        starterCode: `-- Write your SELECT query
pass;`,
        solution: `SELECT item_id, title, category, price, stock
FROM items
WHERE category IN ('Electronics', 'Hardware')
  AND title ILIKE '%Pro%'
  AND stock > 0
ORDER BY price DESC NULLS LAST
LIMIT 10;`,
        explanation: 'Combines `category IN (...)`, `ILIKE \'%Pro%\'`, and explicit `ORDER BY price DESC NULLS LAST LIMIT 10`.'
      }
    ],

    references: [
      {
        title: 'PostgreSQL Documentation: Queries — SELECT',
        type: 'Official Docs',
        url: 'https://www.postgresql.org/docs/current/queries-select-lists.html'
      },
      {
        title: 'Use The Index, Luke: No Offset Pagination',
        type: 'Article',
        url: 'https://use-the-index-luke.com/no-offset'
      }
    ]
  });

})();
