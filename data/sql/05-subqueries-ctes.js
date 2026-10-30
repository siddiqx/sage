/**
 * Sage — SQL Topic 05: Subqueries, Correlated Queries & CTEs
 */

(function () {
  'use strict';

  SAGE.registerTopic({
    id: 'sql-subqueries-ctes',
    title: 'Subqueries, Correlated Queries & Recursive CTEs',
    subject: 'sql',
    module: 'Advanced SQL',
    description: 'Scalar and derived subqueries, correlated EXISTS vs IN, Common Table Expressions (WITH), inlining optimization, and recursive tree traversal.',
    difficulty: 'Intermediate',
    readTime: '16 min read',

    overview: {
      definition: 'Subqueries are nested SQL queries enclosed in parentheses that supply data to an outer query. Common Table Expressions (CTEs), defined with the `WITH` keyword, assign temporary names to subquery results, modularizing complex analytical queries into readable, sequential blocks. Recursive CTEs (`WITH RECURSIVE`) enable graph and tree traversal within pure SQL.',
      mentalModel: 'Think of subqueries as nested algebraic equations: `y = f(g(x))` where the inner function `g(x)` executes first. A CTE is equivalent to creating named intermediate variables in code (`step_1 = fetch_data(); final = process(step_1)`), turning deeply indented nested SQL into a clean, readable pipeline.'
    },

    terminology: [
      {
        term: 'Scalar Subquery',
        definition: 'A subquery that evaluates to a single row and single column (1x1 value), usable anywhere a literal value is expected.'
      },
      {
        term: 'Correlated Subquery',
        definition: 'A subquery that references columns from the outer query, evaluating once for every candidate row evaluated by the outer query.'
      },
      {
        term: 'Common Table Expression (CTE)',
        definition: 'A named temporary result set defined at the beginning of a query with `WITH cte_name AS (...)` for modularity and readability.'
      },
      {
        term: 'Recursive CTE (`WITH RECURSIVE`)',
        definition: 'A CTE that references its own output, combining an anchor query and a recursive step via `UNION ALL` to traverse hierarchical trees and graphs.'
      },
      {
        term: '`AS MATERIALIZED` (PostgreSQL 12+)',
        definition: 'Forces the query engine to evaluate a CTE once and store it in temporary memory as an optimization fence, preventing the planner from inlining it.'
      }
    ],

    explanation: [
      {
        heading: '1. `EXISTS` vs `IN`: The Safety and Performance Advantage',
        content: 'When testing whether matching rows exist in another table, prefer <code>EXISTS</code> over <code>IN</code>:<br><ul><li><code>EXISTS (SELECT 1 FROM ...)</code>: The engine stops scanning the inner table as soon as the first matching row is found (short-circuit boolean evaluation).</li><li><code>NOT IN</code> Trap: If the inner subquery returns even a single <code>NULL</code>, <code>NOT IN</code> evaluates to <code>UNKNOWN</code> for every row, returning zero results. <code>NOT EXISTS</code> handles NULLs safely and correctly.</li></ul>'
      },
      {
        heading: '2. Modularizing Code with Common Table Expressions (CTEs)',
        content: `Instead of deeply nesting subqueries inside <code>FROM</code> clauses (derived tables), CTEs structure analytical pipelines cleanly:<br><pre><code>WITH regional_revenue AS (
    SELECT region, SUM(amount) AS total_rev FROM sales GROUP BY region
),
average_revenue AS (
    SELECT AVG(total_rev) AS avg_rev FROM regional_revenue
)
SELECT * FROM regional_revenue WHERE total_rev > (SELECT avg_rev FROM average_revenue);</code></pre>`
      },
      {
        heading: '3. Recursive CTEs for Hierarchical Tree Traversal',
        content: 'To query hierarchical structures (organizational management trees, threaded comments, folder directories), use <code>WITH RECURSIVE</code>:<br><ol><li><strong>Anchor Member:</strong> The base query returning the root nodes (e.g. employees with <code>manager_id IS NULL</code>).</li><li><strong>UNION ALL:</strong> Combines intermediate iterations.</li><li><strong>Recursive Member:</strong> References the CTE itself, joining the previous iteration\'s results against the child nodes until no new rows are produced.</li></ol>'
      }
    ],

    syntax: {
      pattern: `-- 1. Standard CTE Pipeline
WITH active_users AS (
    SELECT user_id, email FROM users WHERE is_active = TRUE
),
user_order_summary AS (
    SELECT user_id, COUNT(*) AS order_count, SUM(total) AS total_spent
    FROM orders
    GROUP BY user_id
)
SELECT u.email, s.order_count, s.total_spent
FROM active_users u
JOIN user_order_summary s ON u.user_id = s.user_id;

-- 2. Recursive Hierarchy Traversal
WITH RECURSIVE org_chart AS (
    -- Anchor Member (Top-level managers)
    SELECT emp_id, name, manager_id, 1 AS depth
    FROM employees
    WHERE manager_id IS NULL
    
    UNION ALL
    
    -- Recursive Member (Direct reports)
    SELECT e.emp_id, e.name, e.manager_id, o.depth + 1
    FROM employees e
    JOIN org_chart o ON e.manager_id = o.emp_id
)
SELECT * FROM org_chart ORDER BY depth, emp_id;`,
      components: [
        { part: 'WITH cte_name AS (...)', meaning: 'Defines modular named query available to downstream clauses' },
        { part: 'WITH RECURSIVE', meaning: 'Enables self-referential recursive iteration for graph/tree walking' },
        { part: 'EXISTS (SELECT 1 ...)', meaning: 'Short-circuit check returning TRUE if at least one row matches' }
      ]
    },

    examples: [
      {
        title: 'Organizational Tree Traversal with Recursive CTE and Correlated Subquery',
        description: 'Demonstrating tree depth traversal with recursive CTE and finding above-average employees per department.',
        code: `-- 1. Schema setup
CREATE TABLE employees (
    emp_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    department VARCHAR(50) NOT NULL,
    salary NUMERIC(10, 2) NOT NULL,
    manager_id INTEGER REFERENCES employees(emp_id)
);

INSERT INTO employees (name, department, salary, manager_id) VALUES
('CEO Elena',     'Executive',   250000, NULL),
('VP Marcus',     'Engineering', 160000, 1),
('VP Sarah',      'Product',     150000, 1),
('Lead Dev Dan',  'Engineering', 120000, 2),
('Junior Dev Amy','Engineering',  75000, 4);

-- 2. Correlated Subquery: Employees earning above their own department average
SELECT e.name, e.department, e.salary
FROM employees e
WHERE e.salary > (
    SELECT AVG(d.salary)
    FROM employees d
    WHERE d.department = e.department
);

-- 3. Recursive CTE: Full Management Chain and Depth
WITH RECURSIVE management_tree AS (
    -- Base anchor: CEO
    SELECT emp_id, name, manager_id, 1 AS level, CAST(name AS VARCHAR(255)) AS path
    FROM employees
    WHERE manager_id IS NULL
    
    UNION ALL
    
    -- Recursive step: Direct reports
    SELECT e.emp_id, e.name, e.manager_id, m.level + 1, CAST(m.path || ' -> ' || e.name AS VARCHAR(255))
    FROM employees e
    JOIN management_tree m ON e.manager_id = m.emp_id
)
SELECT level, name, path
FROM management_tree
ORDER BY level, emp_id;`,
        output: `     name     | department  |  salary   
--------------+-------------+-----------
 Lead Dev Dan | Engineering | 120000.00
(1 row -- Dan earns 120k vs Engineering department average of 118.3k)

 level |      name      |                       path                       
-------+----------------+--------------------------------------------------
     1 | CEO Elena      | CEO Elena
     2 | VP Marcus      | CEO Elena -> VP Marcus
     2 | VP Sarah       | CEO Elena -> VP Sarah
     3 | Lead Dev Dan   | CEO Elena -> VP Marcus -> Lead Dev Dan
     4 | Junior Dev Amy | CEO Elena -> VP Marcus -> Lead Dev Dan -> Junior Dev Amy
(5 rows)`,
        explanation: [
          'Line 16-22: Correlated subquery evaluates `WHERE d.department = e.department`, recalculating the average per department for each outer employee.',
          'Line 25-40: `WITH RECURSIVE` starts with the CEO at `level = 1` and iteratively joins direct reports, tracking tree hierarchy and lineage paths.'
        ]
      }
    ],

    notes: [
      {
        type: 'info',
        title: 'CTE Inlining in PostgreSQL 12+',
        body: 'In older PostgreSQL versions, CTEs were always materialized (evaluated into memory). In PostgreSQL 12+, CTEs are automatically inlined into the main query plan unless recursive or marked `AS MATERIALIZED`.'
      },
      {
        type: 'warning',
        title: 'Infinite Loop Risk in Recursive CTEs',
        body: 'If your data contains cycles (e.g. Employee A reports to B, who reports to A), a recursive CTE will run infinitely until query timeout or disk memory exhaustion. Use `CYCLE` detection (PostgreSQL 14+) or an iteration limit counter (`WHERE level < 50`).'
      },
      {
        type: 'tip',
        title: 'Writable CTEs (`RETURNING`)',
        body: 'PostgreSQL allows `INSERT`, `UPDATE`, and `DELETE` inside CTEs: `WITH moved_rows AS (DELETE FROM raw_logs RETURNING *) INSERT INTO archive_logs SELECT * FROM moved_rows;`.'
      }
    ],

    commonMistakes: [
      {
        mistake: 'Using `NOT IN` When Subqueries May Return NULL',
        incorrectCode: `-- Returns ZERO rows if ANY department has a NULL manager_id!
SELECT * FROM departments
WHERE manager_id NOT IN (SELECT emp_id FROM employees);`,
        correctCode: `-- Always safe with NULLs: Use NOT EXISTS
SELECT d.* FROM departments d
WHERE NOT EXISTS (
    SELECT 1 FROM employees e WHERE e.emp_id = d.manager_id
);`,
        why: 'In Three-Valued Logic, `id NOT IN (1, 2, NULL)` evaluates to `UNKNOWN`, causing the outer WHERE filter to reject every row.'
      },
      {
        mistake: 'Scalar Subquery Returning More Than 1 Row',
        incorrectCode: `-- ERROR: more than one row returned by a subquery used as an expression
SELECT name, (SELECT salary FROM employees) FROM departments;`,
        correctCode: `-- Use aggregates or limit to guarantee a single scalar value:
SELECT name, (SELECT MAX(salary) FROM employees) FROM departments;`,
        why: 'A scalar subquery in a SELECT or WHERE expression must strictly return at most 1 row and 1 column.'
      }
    ],

    comparisons: [
      {
        title: 'Subqueries vs CTEs (Common Table Expressions)',
        headers: ['Dimension', 'Subquery (Derived Table)', 'CTE (`WITH ... AS`)'],
        rows: [
          ['Readability', 'Poor: Nested inside parentheses, reads from inside out', 'High: Top-down sequential data pipeline'],
          ['Reusability', 'Must be copy-pasted if needed multiple times', 'Can be referenced multiple times within the query'],
          ['Recursion Support', 'No', 'Yes (`WITH RECURSIVE`)'],
          ['Writable Modifications', 'No (read-only)', 'Yes (PostgreSQL supports data-modifying CTEs)']
        ]
      }
    ],

    questions: [
      {
        question: 'What is the danger of using `NOT IN (subquery)` compared to `NOT EXISTS`?',
        answer: 'If the subquery returns even a single NULL value, `NOT IN` evaluates to UNKNOWN for all rows, returning an empty result set.',
        explanation: '`NOT EXISTS` evaluates row existence directly and is unaffected by NULLs inside the subquery result columns.'
      },
      {
        question: 'What are the two mandatory components of a `WITH RECURSIVE` CTE in SQL?',
        answer: 'An Anchor Member (base query) and a Recursive Member, combined with `UNION ALL`.',
        explanation: 'The anchor query sets the initial dataset, and the recursive query joins against the intermediate results until no new rows are produced.'
      }
    ],

    practice: [
      {
        id: 'sql-cte-ex1',
        title: 'Department Salary Benchmarker with CTE',
        difficulty: 'Intermediate',
        prompt: 'Given an `employees` table `(emp_id, name, department_id, salary)`, write a CTE query that calculates the average salary per department, and returns all employees whose salary exceeds their department average by more than $10,000.',
        starterCode: `-- Write your CTE query
pass;`,
        solution: `WITH dept_averages AS (
    SELECT
        department_id,
        AVG(salary) AS avg_salary
    FROM employees
    GROUP BY department_id
)
SELECT
    e.emp_id,
    e.name,
    e.department_id,
    e.salary,
    ROUND(da.avg_salary, 2) AS dept_avg,
    ROUND(e.salary - da.avg_salary, 2) AS salary_surplus
FROM employees e
JOIN dept_averages da ON e.department_id = da.department_id
WHERE e.salary > (da.avg_salary + 10000)
ORDER BY salary_surplus DESC;`,
        explanation: 'The CTE `dept_averages` pre-calculates department averages once. The main query joins it back to filter employees earning $10k+ above their department baseline.'
      }
    ],

    references: [
      {
        title: 'PostgreSQL Documentation: WITH Queries (Common Table Expressions)',
        type: 'Official Docs',
        url: 'https://www.postgresql.org/docs/current/queries-with.html'
      },
      {
        title: 'PostgreSQL Documentation: Subqueries',
        type: 'Official Docs',
        url: 'https://www.postgresql.org/docs/current/functions-subquery.html'
      }
    ]
  });

})();
