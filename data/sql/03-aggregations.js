/**
 * Sage — SQL Topic 03: Aggregations, GROUP BY & HAVING
 */

(function () {
  'use strict';

  SAGE.registerTopic({
    id: 'sql-aggregations',
    title: 'Aggregations, GROUP BY & The HAVING Clause',
    subject: 'sql',
    module: 'Querying Fundamentals',
    description: 'COUNT(*) vs COUNT(col), aggregate functions, pre vs post filtering (WHERE vs HAVING), and PostgreSQL FILTER (WHERE ...).',
    difficulty: 'Beginner',
    readTime: '14 min read',

    overview: {
      definition: 'Aggregation collapses multiple rows into a single summary row by applying mathematical reducer functions (`COUNT`, `SUM`, `AVG`, `MIN`, `MAX`). The `GROUP BY` clause groups rows sharing common attribute values before applying aggregates. The `HAVING` clause filters those aggregated groups, distinguishing itself from `WHERE`, which filters individual rows before grouping occurs.',
      mentalModel: 'Think of grouping and aggregation as sorting incoming mail into postal bins (`GROUP BY postal_code`). The `WHERE` clause rejects damaged envelopes before they enter the sorting room. Once all envelopes are sorted into their bins, an aggregate function counts or weighs the contents of each bin. Finally, `HAVING` rejects bins that hold fewer than 100 letters.'
    },

    terminology: [
      {
        term: 'Aggregate Function',
        definition: 'A function that computes a single scalar value from a set of input column values (e.g. `SUM`, `AVG`, `COUNT`, `MIN`, `MAX`).'
      },
      {
        term: '`COUNT(*)` vs `COUNT(col)`',
        definition: '`COUNT(*)` returns the total number of rows in the group (including rows where columns are NULL). `COUNT(col)` counts ONLY rows where `col` is NOT NULL.'
      },
      {
        term: '`GROUP BY`',
        definition: 'Divides table rows into groups where every row in a group shares identical values across the specified grouping columns.'
      },
      {
        term: '`HAVING` Clause',
        definition: 'Filters grouped summary records based on aggregate conditions (e.g. `HAVING COUNT(*) > 5`). Cannot be used without an aggregate or GROUP BY.'
      },
      {
        term: 'Aggregate `FILTER` Clause',
        definition: 'PostgreSQL syntax: `agg_func() FILTER (WHERE condition)` computing an aggregate over a subset of rows without requiring cumbersome `CASE` expressions.'
      }
    ],

    explanation: [
      {
        heading: '1. The Golden Rule of `GROUP BY`',
        content: 'When writing a query with <code>GROUP BY</code>, every single column appearing in the <code>SELECT</code> list must be either:<br><ol><li>Explicitly listed in the <code>GROUP BY</code> clause, OR</li><li>Enclosed inside an aggregate function (e.g. <code>SUM(col)</code>, <code>MAX(col)</code>).</li></ol>If you try to select an unaggregated column that isn\'t in the GROUP BY, PostgreSQL raises an error because that column could hold multiple conflicting values for a single group.'
      },
      {
        heading: '2. The Difference Between `WHERE` and `HAVING`',
        content: '<ul><li><code>WHERE</code> filters <strong>individual rows</strong> before groups are created. It cannot reference aggregate functions (e.g. <code>WHERE COUNT(*) > 10</code> is invalid!).</li><li><code>HAVING</code> filters <strong>summary groups</strong> after grouping and aggregation have completed.</li></ul>Placing row-level conditions in <code>WHERE</code> is faster because it discards unwanted rows before grouping hash tables are allocated in RAM.'
      },
      {
        heading: '3. Modern Conditional Aggregation: The `FILTER` Clause',
        content: 'In standard SQL, counting specific conditions required verbose <code>CASE</code> statements:<br><code>SUM(CASE WHEN status = \'active\' THEN 1 ELSE 0 END)</code><br><br>PostgreSQL supports the cleaner, standard SQL:2003 <code>FILTER</code> clause:<br><code>COUNT(*) FILTER (WHERE status = \'active\')</code><br>This is faster, more legible, and allows combining multiple independent metrics in a single scan.'
      }
    ],

    syntax: {
      pattern: `-- Standard Aggregation Query Structure
SELECT
    department_id,
    COUNT(*) AS total_employees,
    COUNT(bonus) AS employees_with_bonus,
    ROUND(AVG(salary), 2) AS average_salary,
    COUNT(*) FILTER (WHERE salary > 100000) AS high_earners
FROM employees
WHERE is_active = TRUE            -- Pre-grouping row filter
GROUP BY department_id
HAVING COUNT(*) >= 5              -- Post-grouping aggregate filter
ORDER BY average_salary DESC;`,
      components: [
        { part: 'COUNT(*)', meaning: 'Counts total physical rows in group, including NULL rows' },
        { part: 'COUNT(col)', meaning: 'Counts rows where col is strictly NOT NULL' },
        { part: 'GROUP BY col', meaning: 'Partitions rows into distinct groups' },
        { part: 'HAVING agg_condition', meaning: 'Filters aggregated groups after reduction' },
        { part: 'FILTER (WHERE cond)', meaning: 'Applies conditional filter to an individual aggregate function' }
      ]
    },

    examples: [
      {
        title: 'Sales Metrics by Category Using Modern Aggregate FILTER Clauses',
        description: 'Demonstrating COUNT differences, GROUP BY rules, and PostgreSQL FILTER clauses.',
        code: `-- 1. Schema setup
CREATE TABLE sales (
    sale_id SERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    discount NUMERIC(10, 2), -- May be NULL
    region VARCHAR(20) NOT NULL
);

INSERT INTO sales (category, amount, discount, region) VALUES
('Hardware', 500.00, 50.00, 'US-East'),
('Hardware', 250.00, NULL,  'US-West'),
('Hardware', 800.00, 100.0, 'US-East'),
('Software', 120.00, 10.00, 'US-East'),
('Software', 300.00, NULL,  'US-East'),
('SaaS',      45.00, NULL,  'US-West');

-- 2. Comprehensive Aggregation Query
SELECT
    category,
    COUNT(*) AS total_transactions,
    COUNT(discount) AS discounted_transactions,
    SUM(amount) AS gross_revenue,
    ROUND(AVG(amount), 2) AS avg_sale,
    COUNT(*) FILTER (WHERE region = 'US-East') AS east_coast_sales
FROM sales
GROUP BY category
HAVING SUM(amount) > 200.00
ORDER BY gross_revenue DESC;`,
        output: ` category | total_transactions | discounted_transactions | gross_revenue | avg_sale | east_coast_sales 
----------+--------------------+-------------------------+---------------+----------+------------------
 Hardware |                  3 |                       2 |       1550.00 |   516.67 |                2
 Software |                  2 |                       1 |        420.00 |   210.00 |                2
(2 rows -- 'SaaS' excluded by HAVING SUM(amount) > 200.00)`,
        explanation: [
          'Line 19: `COUNT(*)` returns 3 for Hardware; `COUNT(discount)` returns 2 because one row has a NULL discount.',
          'Line 23: `COUNT(*) FILTER (WHERE region = \'US-East\')` computes regional volume directly within the category summary.',
          'Line 26: `HAVING SUM(amount) > 200.00` filters out the \'SaaS\' category after calculating its sum ($45.00).'
        ]
      }
    ],

    notes: [
      {
        type: 'warning',
        title: '`AVG()` Ignores NULL Values',
        body: '`AVG(col)` divides the sum by `COUNT(col)`, NOT by `COUNT(*)`. If rows contain NULLs, the average is calculated over only the non-null rows. Use `COALESCE(col, 0)` if NULL should be treated as zero in the average.'
      },
      {
        type: 'info',
        title: '`GROUP BY 1, 2` Positional Shorthand',
        body: 'You can write `GROUP BY 1, 2` referring to the ordinal positions in the SELECT clause. While convenient for interactive exploration in psql, always write out explicit column names in production code for clarity.'
      },
      {
        type: 'tip',
        title: '`COUNT(DISTINCT col)`',
        body: 'Calculates the number of unique non-null values in a group: `COUNT(DISTINCT customer_id)`. Note that `COUNT(DISTINCT)` cannot be used with the `FILTER` clause in standard PostgreSQL.'
      }
    ],

    commonMistakes: [
      {
        mistake: 'Selecting Non-Aggregated Columns Omitted from GROUP BY',
        incorrectCode: `-- ERROR: column "orders.order_date" must appear in the GROUP BY clause or be used in an aggregate function
SELECT customer_id, order_date, SUM(total)
FROM orders
GROUP BY customer_id;`,
        correctCode: `-- Include all non-aggregated columns in GROUP BY or use MAX/MIN:
SELECT customer_id, MAX(order_date) AS latest_order, SUM(total)
FROM orders
GROUP BY customer_id;`,
        why: 'A single customer might have 5 orders with different dates. The database cannot guess which date to show unless instructed via an aggregate function like `MAX()`.'
      },
      {
        mistake: 'Placing Row Filters in HAVING Instead of WHERE',
        incorrectCode: `-- Slower: Groups ALL rows first, then filters!
SELECT department_id, COUNT(*)
FROM employees
GROUP BY department_id
HAVING is_active = TRUE;`,
        correctCode: `-- Faster: Filters rows BEFORE allocating grouping memory
SELECT department_id, COUNT(*)
FROM employees
WHERE is_active = TRUE
GROUP BY department_id;`,
        why: 'Row-level conditions in `WHERE` reduce the dataset before grouping, decreasing CPU and memory consumption.'
      }
    ],

    comparisons: [
      {
        title: 'WHERE vs HAVING Clauses',
        headers: ['Property', '`WHERE` Clause', '`HAVING` Clause'],
        rows: [
          ['Timing', 'Evaluated BEFORE grouping occurs', 'Evaluated AFTER grouping and reduction occurs'],
          ['Target', 'Individual rows', 'Grouped summary records'],
          ['Aggregates Allowed?', 'No (raises syntax error)', 'Yes (e.g. `HAVING COUNT(*) > 5`)'],
          ['Index Utilization', 'Can utilize table indexes to seek rows', 'Cannot use indexes (scans computed groups)']
        ]
      }
    ],

    questions: [
      {
        question: 'What is the functional difference between `COUNT(*)` and `COUNT(column)`?',
        answer: '`COUNT(*)` counts all physical rows in the group, whereas `COUNT(column)` counts only rows where `column` is NOT NULL.',
        explanation: 'If a group has 5 rows and 2 have NULL in `email`, `COUNT(*)` is 5 and `COUNT(email)` is 3.'
      },
      {
        question: 'Can you use aggregate functions like `AVG()` in a WHERE clause?',
        answer: 'No, aggregate functions are disallowed in WHERE clauses.',
        explanation: '`WHERE` filters individual rows before aggregate calculations are computed. Use `HAVING` or a subquery/CTE instead.'
      }
    ],

    practice: [
      {
        id: 'sql-agg-ex1',
        title: 'Customer Order Frequency & Average Value',
        difficulty: 'Beginner',
        prompt: 'Given an `orders` table with columns `(order_id, customer_id, total_amount, status)`, write a query that returns the `customer_id`, total number of orders, and average order value (rounded to 2 decimals) for COMPLETED orders only, keeping only customers with at least 3 completed orders.',
        starterCode: `-- Write your aggregation query
pass;`,
        solution: `SELECT
    customer_id,
    COUNT(*) AS total_orders,
    ROUND(AVG(total_amount), 2) AS average_order_value
FROM orders
WHERE status = 'COMPLETED'
GROUP BY customer_id
HAVING COUNT(*) >= 3
ORDER BY total_orders DESC;`,
        explanation: '`WHERE status = \'COMPLETED\'` discards non-completed orders before grouping. `HAVING COUNT(*) >= 3` retains only high-frequency customers.'
      }
    ],

    references: [
      {
        title: 'PostgreSQL Documentation: Aggregate Functions',
        type: 'Official Docs',
        url: 'https://www.postgresql.org/docs/current/functions-aggregate.html'
      },
      {
        title: 'PostgreSQL Documentation: GROUP BY and HAVING Clauses',
        type: 'Official Docs',
        url: 'https://www.postgresql.org/docs/current/queries-table-expressions.html#QUERIES-GROUP'
      }
    ]
  });

})();
