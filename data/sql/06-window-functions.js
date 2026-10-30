/**
 * Sage — SQL Topic 06: Window Functions & Analytical SQL
 */

(function () {
  'use strict';

  SAGE.registerTopic({
    id: 'sql-window-functions',
    title: 'Window Functions, Ranking & Running Totals',
    subject: 'sql',
    module: 'Advanced SQL',
    description: 'The OVER clause, PARTITION BY, ROW_NUMBER vs RANK vs DENSE_RANK, LAG/LEAD offset metrics, and rolling window frames.',
    difficulty: 'Intermediate',
    readTime: '17 min read',

    overview: {
      definition: 'A Window Function performs a calculation across a set of table rows that are related to the current row, returning a value for every single row without collapsing the dataset. Unlike `GROUP BY` which aggregates multiple rows into one, window functions preserve individual row identity, allowing running totals, moving averages, top-N per category, and inter-row comparisons (`LEAD`/`LAG`).',
      mentalModel: 'Think of looking at your bank statement. Each row is a transaction. A `GROUP BY` would collapse your entire statement into a single total number. A Window Function looks at each transaction row while sliding a magnifying glass (`OVER`) over all previous transactions to calculate your running account balance alongside each purchase.'
    },

    terminology: [
      {
        term: '`OVER ()` Clause',
        definition: 'The syntax signaling a window calculation. Configured with `PARTITION BY`, `ORDER BY`, and an optional window frame specification.'
      },
      {
        term: '`PARTITION BY`',
        definition: 'Divides rows into groups (partitions) where the window function calculation resets for each distinct group.'
      },
      {
        term: 'Window Frame (`ROWS BETWEEN ...`)',
        definition: 'Specifies which rows within the partition are included in the calculation relative to the current row (e.g. `ROWS BETWEEN 2 PRECEDING AND CURRENT ROW`).'
      },
      {
        term: '`ROW_NUMBER()` vs `RANK()` vs `DENSE_RANK()`',
        definition: '`ROW_NUMBER` gives consecutive integers (1, 2, 3, 4). `RANK` gives identical ranks on ties, skipping next numbers (1, 2, 2, 4). `DENSE_RANK` gives identical ranks on ties without skipping (1, 2, 2, 3).'
      },
      {
        term: '`LAG()` / `LEAD()`',
        definition: 'Accesses a column value from a previous (`LAG`) or subsequent (`LEAD`) row within the partition without self-joining.'
      }
    ],

    explanation: [
      {
        heading: '1. Why Window Functions Outperform Self-Joins',
        content: 'Before window functions, calculating running totals or comparing a row to the previous day required slow, complex self-joins: <code>FROM sales s1 JOIN sales s2 ON s1.id >= s2.id</code> (O(N&sup2;) quadratic complexity).<br>Window functions compute running totals and row offsets in a single sorted stream pass (<strong>O(N log N)</strong> sort followed by O(N) linear evaluation).'
      },
      {
        heading: '2. The Default Window Frame Hazard: `RANGE` vs `ROWS`',
        content: 'When you write <code>ORDER BY date</code> inside an <code>OVER()</code> clause, PostgreSQL defaults to:<br><code>RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW</code><br>Because it uses <code>RANGE</code>, if multiple rows share the <strong>exact same date</strong>, PostgreSQL groups them together, adding their amounts all at once! If you want a strict row-by-row cumulative sum, explicitly declare:<br><code>ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW</code>.'
      },
      {
        heading: '3. Top-N Per Category Pattern',
        content: `To find the top 3 highest-earning employees per department, wrap a <code>DENSE_RANK()</code> in a CTE or subquery:<br><pre><code>WITH ranked_staff AS (
    SELECT name, department, salary,
           DENSE_RANK() OVER (PARTITION BY department ORDER BY salary DESC) as rank_num
    FROM employees
)
SELECT * FROM ranked_staff WHERE rank_num <= 3;</code></pre>Window functions cannot be used directly inside \`WHERE\` clauses because windowing executes <em>after</em> WHERE filtering.`
      }
    ],

    syntax: {
      pattern: `-- General Window Function Syntax
SELECT
    id, category, amount,
    
    -- 1. Ranking within Category
    ROW_NUMBER() OVER (PARTITION BY category ORDER BY amount DESC) AS row_num,
    DENSE_RANK() OVER (PARTITION BY category ORDER BY amount DESC) AS dense_rnk,
    
    -- 2. Running Total with explicit frame
    SUM(amount) OVER (
        PARTITION BY category
        ORDER BY created_at
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS running_category_total,
    
    -- 3. Previous Value Delta
    amount - LAG(amount, 1, 0) OVER (PARTITION BY category ORDER BY created_at) AS amount_diff
FROM transactions;`,
      components: [
        { part: 'func() OVER (...)', meaning: 'Invokes analytical function over window partition' },
        { part: 'PARTITION BY col', meaning: 'Resets calculation boundaries for each unique value of col' },
        { part: 'ORDER BY col', meaning: 'Defines ordering of rows inside the active window partition' },
        { part: 'LAG(col, offset, default)', meaning: 'Pulls value from offset rows earlier in the window' }
      ]
    },

    examples: [
      {
        title: 'Running Totals, 7-Day Moving Averages & Month-Over-Month Growth',
        description: 'Demonstrating running balances, moving averages, and LAG calculations on daily revenue.',
        code: `-- 1. Schema setup
CREATE TABLE daily_revenue (
    record_date DATE PRIMARY KEY,
    revenue NUMERIC(10, 2) NOT NULL
);

INSERT INTO daily_revenue (record_date, revenue) VALUES
('2024-01-01', 1200.00),
('2024-01-02', 1500.00),
('2024-01-03', 1800.00),
('2024-01-04', 1100.00),
('2024-01-05', 2100.00);

-- 2. Analytical Window Query
SELECT
    record_date,
    revenue,
    
    -- Running Cumulative Total
    SUM(revenue) OVER (
        ORDER BY record_date
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS cumulative_revenue,
    
    -- 3-Day Moving Average (Current day + 2 preceding days)
    ROUND(AVG(revenue) OVER (
        ORDER BY record_date
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ), 2) AS moving_avg_3day,
    
    -- Day-Over-Day Dollar Growth
    revenue - LAG(revenue, 1) OVER (ORDER BY record_date) AS day_growth
FROM daily_revenue
ORDER BY record_date;`,
        output: ` record_date | revenue | cumulative_revenue | moving_avg_3day | day_growth 
-------------+---------+--------------------+-----------------+------------
 2024-01-01  | 1200.00 |            1200.00 |         1200.00 |       NULL
 2024-01-02  | 1500.00 |            2700.00 |         1350.00 |     300.00
 2024-01-03  | 1800.00 |            4500.00 |         1500.00 |     300.00
 2024-01-04  | 1100.00 |            5600.00 |         1466.67 |    -700.00
 2024-01-05  | 2100.00 |            7700.00 |         1666.67 |    1000.00
(5 rows)`,
        explanation: [
          'Line 18-22: `SUM(revenue) OVER ... ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW` calculates the cumulative running sum step by step.',
          'Line 25-28: `ROWS BETWEEN 2 PRECEDING AND CURRENT ROW` computes the 3-day rolling smoothing window.',
          'Line 31: `LAG(revenue, 1)` accesses yesterday\'s revenue, returning NULL on day 1 because no preceding row exists.'
        ]
      }
    ],

    notes: [
      {
        type: 'warning',
        title: 'Window Functions Are Forbidden in `WHERE` and `HAVING`',
        body: 'Writing `WHERE ROW_NUMBER() OVER (...) = 1` raises a syntax error! In SQL logical order of operations, window functions are evaluated in the `SELECT` phase, which happens AFTER `WHERE` and `HAVING`. Wrap the query in a CTE or subquery to filter by rank.'
      },
      {
        type: 'info',
        title: 'Named Windows (`WINDOW` Clause)',
        body: 'If multiple window functions share the exact same configuration, use a named window: `SELECT SUM(x) OVER w, AVG(x) OVER w FROM t WINDOW w AS (PARTITION BY dept ORDER BY date);`.'
      },
      {
        type: 'tip',
        title: '`LEAD` / `LAG` Default Fallback Value',
        body: '`LAG(col, 1, 0)` allows you to supply a fallback value (like 0) instead of receiving NULL when no preceding row exists.'
      }
    ],

    commonMistakes: [
      {
        mistake: 'Using `ROW_NUMBER()` When Ranking Has Ties That Must Be Preserved',
        incorrectCode: `-- If two candidates tie with score 99, ROW_NUMBER arbitrarily assigns 1 and 2:
ROW_NUMBER() OVER (ORDER BY score DESC)`,
        correctCode: `-- DENSE_RANK assigns 1 to both tied candidates, and 2 to the next:
DENSE_RANK() OVER (ORDER BY score DESC)`,
        why: '`ROW_NUMBER()` is non-deterministic for ties unless an additional tie-breaker column is added to the `ORDER BY` clause.'
      },
      {
        mistake: 'Confusing `GROUP BY` with `PARTITION BY`',
        incorrectCode: `-- If you want to retain every individual order row while seeing category totals:
SELECT order_id, category, SUM(amount)
FROM orders
GROUP BY category; -- ERROR! order_id must appear in GROUP BY!`,
        correctCode: `-- Use PARTITION BY to preserve individual rows:
SELECT order_id, category, amount,
       SUM(amount) OVER (PARTITION BY category) AS category_total
FROM orders;`,
        why: '`GROUP BY` collapses rows into a summary; `PARTITION BY` inside a window function leaves every individual row intact.'
      }
    ],

    comparisons: [
      {
        title: 'ROW_NUMBER vs RANK vs DENSE_RANK on Scores: [100, 90, 90, 80]',
        headers: ['Function', 'Score 100', 'Score 90 (First)', 'Score 90 (Second)', 'Score 80'],
        rows: [
          ['`ROW_NUMBER()`', '1', '2', '3 (Arbitrary tie-break)', '4'],
          ['`RANK()`', '1', '2 (Tied)', '2 (Tied)', '4 (Rank 3 skipped)'],
          ['`DENSE_RANK()`', '1', '2 (Tied)', '2 (Tied)', '3 (No gap)']
        ]
      }
    ],

    questions: [
      {
        question: 'Why can you not use a window function in an SQL `WHERE` clause?',
        answer: 'Because `WHERE` filters rows before window functions are calculated.',
        explanation: 'In SQL execution order, `WHERE` runs near the beginning. Window functions run during `SELECT` projection. Filter window results using an outer CTE or subquery.'
      },
      {
        question: 'What is the purpose of `LAG(column, offset)`?',
        answer: 'To access a value from a previous row within the same window partition.',
        explanation: 'It avoids expensive self-joins when calculating period-over-period differences, velocities, or streaks.'
      }
    ],

    practice: [
      {
        id: 'sql-win-ex1',
        title: 'Top Earner Per Department with DENSE_RANK',
        difficulty: 'Intermediate',
        prompt: 'Given a table `employees (emp_id, name, department_id, salary)`, write a query that returns the highest-paid employee(s) in each department. If multiple employees tie for highest salary in a department, return all of them.',
        starterCode: `-- Write your Top-N window query
pass;`,
        solution: `WITH ranked_employees AS (
    SELECT
        emp_id,
        name,
        department_id,
        salary,
        DENSE_RANK() OVER (
            PARTITION BY department_id
            ORDER BY salary DESC
        ) AS salary_rank
    FROM employees
)
SELECT emp_id, name, department_id, salary
FROM ranked_employees
WHERE salary_rank = 1
ORDER BY department_id;`,
        explanation: '`DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC)` assigns rank 1 to all tied top earners in each department. Filtering by `salary_rank = 1` in the outer query retrieves the leaders.'
      }
    ],

    references: [
      {
        title: 'PostgreSQL Documentation: Window Functions',
        type: 'Official Docs',
        url: 'https://www.postgresql.org/docs/current/tutorial-window.html'
      },
      {
        title: 'PostgreSQL Documentation: Window Function Syntax & Frames',
        type: 'Official Docs',
        url: 'https://www.postgresql.org/docs/current/sql-expressions.html#SYNTAX-WINDOW-FUNCTIONS'
      }
    ]
  });

})();
