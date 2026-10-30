/**
 * Sage — SQL Topic 04: Relational Joins & Engine Execution Algorithms
 */

(function () {
  'use strict';

  SAGE.registerTopic({
    id: 'sql-joins',
    title: 'Relational Joins & Query Engine Algorithms',
    subject: 'sql',
    module: 'Querying Fundamentals',
    description: 'INNER, LEFT, RIGHT, FULL, and CROSS joins, ON vs WHERE placement hazards, and physical engine algorithms (Nested Loop, Hash, Merge Join).',
    difficulty: 'Intermediate',
    readTime: '15 min read',

    overview: {
      definition: 'Joins combine rows from two or more tables based on a related column, implementing the relational algebra operations of Cartesian products, theta joins, and equijoins. PostgreSQL evaluates joins logically by testing the `ON` condition, and physically by selecting the optimal execution algorithm (Nested Loop, Hash Join, or Merge Join) based on table statistics and available indexes.',
      mentalModel: 'Think of joining two tables as combining two halves of a torn receipt. An `INNER JOIN` only keeps pairs where both halves match. A `LEFT JOIN` keeps all left halves, filling in the missing right side with blank paper (`NULL`) if the matching receipt half was lost.'
    },

    terminology: [
      {
        term: '`INNER JOIN`',
        definition: 'Returns rows where the join condition is satisfied in both tables. Unmatched rows from both sides are discarded.'
      },
      {
        term: '`LEFT [OUTER] JOIN`',
        definition: 'Returns all rows from the left table; matching rows from the right table are populated, and unmatched right columns are filled with `NULL`.'
      },
      {
        term: '`FULL [OUTER] JOIN`',
        definition: 'Combines the results of both LEFT and RIGHT joins, returning all rows from both tables with `NULL` wherever a match is missing.'
      },
      {
        term: '`CROSS JOIN`',
        definition: 'Produces the Cartesian product of two tables, matching every row of table A with every row of table B (output size: M * N).'
      },
      {
        term: 'Hash Join Algorithm',
        definition: 'PostgreSQL builds an in-memory hash table from the smaller relation, then scans the larger relation, probing the hash table in O(M + N) time.'
      }
    ],

    explanation: [
      {
        heading: '1. The Critical Distinction: Filter in `ON` vs Filter in `WHERE`',
        content: 'When writing an outer join (e.g. <code>LEFT JOIN</code>), the placement of conditions dramatically alters results:<br><ul><li><strong>Condition in `ON`:</strong> <code>LEFT JOIN orders o ON o.customer_id = c.id AND o.status = \'PAID\'</code>. The filter is applied <em>during</em> the join. Customers with no paid orders are still preserved in the output with NULLs.</li><li><strong>Condition in `WHERE`:</strong> <code>LEFT JOIN orders o ON o.customer_id = c.id WHERE o.status = \'PAID\'</code>. The filter executes <em>after</em> the join. Because <code>NULL = \'PAID\'</code> evaluates to UNKNOWN, all customers without orders are discarded, accidentally converting your LEFT JOIN into an INNER JOIN!</li></ul>'
      },
      {
        heading: '2. Finding Missing Records (The Anti-Join Pattern)',
        content: `To find records in Table A that have no corresponding record in Table B (e.g. "customers who have never placed an order"), use a <code>LEFT JOIN</code> combined with <code>WHERE right_table.pk IS NULL</code>:<br><pre><code>SELECT c.customer_id, c.name
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
WHERE o.order_id IS NULL;</code></pre>`
      },
      {
        heading: '3. Physical Join Algorithms Inside PostgreSQL',
        content: 'PostgreSQL\'s cost-based query planner chooses between three physical join strategies:<br><ol><li><strong>Nested Loop Join:</strong> For every row in the outer table, scans the inner table (optimal when the inner table has an index on the join key and the outer table is small).</li><li><strong>Hash Join:</strong> Hashes the join key of the smaller table into memory (<code>work_mem</code>), then streams the larger table against it in linear O(N) time.</li><li><strong>Merge Join:</strong> Requires both inputs to be sorted by the join key (via an index or explicit sort), then zips them together in a single pass.</li></ol>'
      }
    ],

    syntax: {
      pattern: `-- 1. Inner Join with Column Aliases
SELECT c.name, o.order_id, o.total_amount
FROM customers c
INNER JOIN orders o ON c.customer_id = o.customer_id;

-- 2. Left Outer Join with Anti-Join Filter
SELECT c.name, c.email
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
WHERE o.order_id IS NULL;  -- Isolates customers with 0 orders

-- 3. Multi-Table Join Pipeline
SELECT
    u.username,
    r.role_name,
    d.department_name
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
LEFT JOIN departments d ON u.dept_id = d.id;`,
      components: [
        { part: 'FROM a JOIN b ON a.k = b.k', meaning: 'Standard inner join matching records on key equality' },
        { part: 'LEFT JOIN ... WHERE b.k IS NULL', meaning: 'Anti-join pattern finding records in a that lack matches in b' },
        { part: 'CROSS JOIN b', meaning: 'Generates all possible combinations (Cartesian product)' }
      ]
    },

    examples: [
      {
        title: 'Comparing Inner, Left, Full Joins & Finding Missing Relations',
        description: 'Demonstrating join variations across customers, orders, and anti-join queries.',
        code: `-- 1. Schema setup
CREATE TABLE clients (
    client_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE invoices (
    invoice_id SERIAL PRIMARY KEY,
    client_id INTEGER, -- Nullable to allow orphan invoices
    amount NUMERIC(10, 2) NOT NULL
);

INSERT INTO clients (name) VALUES ('Acme Corp'), ('Globex'), ('Initech');
INSERT INTO invoices (client_id, amount) VALUES (1, 1500.00), (1, 2200.00), (2, 850.00), (NULL, 400.00);

-- 2. LEFT JOIN: All clients, showing NULL for Initech (no invoices)
SELECT c.name, i.invoice_id, i.amount
FROM clients c
LEFT JOIN invoices i ON c.client_id = i.client_id;

-- 3. FULL OUTER JOIN: Shows Initech (no invoice) AND invoice #4 (no client)
SELECT c.name, i.invoice_id, i.amount
FROM clients c
FULL OUTER JOIN invoices i ON c.client_id = i.client_id;

-- 4. ANTI-JOIN: Find clients who have ZERO invoices
SELECT c.client_id, c.name
FROM clients c
LEFT JOIN invoices i ON c.client_id = i.client_id
WHERE i.invoice_id IS NULL;`,
        output: `  name   | invoice_id | amount  
---------+------------+---------
 Acme Corp|          1 | 1500.00
 Acme Corp|          2 | 2200.00
 Globex   |          3 |  850.00
 Initech  |       NULL |    NULL
(4 rows)

  name   | invoice_id | amount  
---------+------------+---------
 Acme Corp|          1 | 1500.00
 Acme Corp|          2 | 2200.00
 Globex   |          3 |  850.00
 Initech  |       NULL |    NULL
 NULL     |          4 |  400.00
(5 rows)

 client_id |  name   
-----------+---------
         3 | Initech
(1 row)`,
        explanation: [
          'Line 16-18: `LEFT JOIN` preserves Initech, displaying `NULL` for invoice attributes.',
          'Line 21-23: `FULL OUTER JOIN` reveals both Initech (unmatched client) and invoice #4 (unmatched invoice).',
          'Line 26-29: `WHERE i.invoice_id IS NULL` isolates clients with 0 invoices, completing the anti-join pattern.'
        ]
      }
    ],

    notes: [
      {
        type: 'warning',
        title: 'Accidental Cartesian Explosion with Cross Joins',
        body: 'Omitting the `ON` condition or writing `FROM table_a, table_b` without a `WHERE` clause creates a full Cartesian product. Joining two tables with 100,000 rows each produces 10,000,000,000 rows, exhausting server memory.'
      },
      {
        type: 'info',
        title: 'USING (column_name) Shorthand',
        body: 'If both tables share the identical column name for the join key, you can write `JOIN orders USING (customer_id)` instead of `ON customers.customer_id = orders.customer_id`.'
      },
      {
        type: 'tip',
        title: 'Natural Joins Should Be Avoided in Production',
        body: '`NATURAL JOIN` automatically joins on all columns sharing the same name. If an engineer adds an `updated_at` column to both tables, the join condition silently changes, breaking application queries.'
      }
    ],

    commonMistakes: [
      {
        mistake: 'Accidentally Converting a LEFT JOIN into an INNER JOIN via the WHERE Clause',
        incorrectCode: `-- Intended to keep all clients, but WHERE o.status = 'PAID' discards clients with no orders!
SELECT c.name, o.total
FROM clients c
LEFT JOIN orders o ON c.client_id = o.client_id
WHERE o.status = 'PAID';`,
        correctCode: `-- Move the filter into the ON clause:
SELECT c.name, o.total
FROM clients c
LEFT JOIN orders o ON c.client_id = o.client_id AND o.status = 'PAID';`,
        why: 'In the incorrect code, clients with no orders produce `NULL` for `o.status`. Because `NULL = \'PAID\'` evaluates to UNKNOWN, the `WHERE` clause discards them, defeating the LEFT JOIN.'
      },
      {
        mistake: 'Using Comma Joins (Implicit Joins) from Legacy SQL-89',
        incorrectCode: `SELECT *
FROM users u, orders o, items i
WHERE u.id = o.user_id AND o.id = i.order_id;`,
        correctCode: `SELECT *
FROM users u
JOIN orders o ON u.id = o.user_id
JOIN items i ON o.id = i.order_id;`,
        why: 'Explicit `JOIN ... ON` syntax (SQL-92) separates join conditions from filtering logic, preventing accidental Cartesian products.'
      }
    ],

    comparisons: [
      {
        title: 'PostgreSQL Physical Join Algorithms',
        headers: ['Algorithm', 'Best Workload', 'Memory Footprint', 'Index Requirement'],
        rows: [
          ['Nested Loop', 'Small outer table, indexed inner table lookup', 'Minimal (O(1))', 'High (inner table should have index)'],
          ['Hash Join', 'Medium to large unindexed equijoins', 'Requires `work_mem` for hash table', 'No index required'],
          ['Merge Join', 'Large inputs already sorted by join key (e.g. via index)', 'Low memory (streaming cursor)', 'Requires inputs to be sorted']
        ]
      }
    ],

    questions: [
      {
        question: 'How do you perform an anti-join in SQL to find rows in table A that have no match in table B?',
        answer: 'Use `LEFT JOIN table_b ON ... WHERE table_b.primary_key IS NULL`.',
        explanation: 'The LEFT JOIN pairs unmatched rows with NULLs; testing `IS NULL` on the non-nullable primary key isolates records with no relation.'
      },
      {
        question: 'Why does placing a condition on a right-hand table in the WHERE clause turn a LEFT JOIN into an INNER JOIN?',
        answer: 'Because unmatched left rows have NULL for right-table columns, and any standard equality filter on NULL evaluates to UNKNOWN, discarding the row.',
        explanation: 'Move right-table filters into the `ON` clause to preserve unmatched left rows.'
      }
    ],

    practice: [
      {
        id: 'sql-join-ex1',
        title: 'Unsold Inventory Report with Anti-Join',
        difficulty: 'Intermediate',
        prompt: 'Given tables `products (product_id, name, price)` and `order_items (order_id, product_id, quantity)`, write a query that returns the `product_id` and `name` of all products that have NEVER been ordered, sorted by name alphabetically.',
        starterCode: `-- Write your anti-join query
pass;`,
        solution: `SELECT p.product_id, p.name
FROM products p
LEFT JOIN order_items oi ON p.product_id = oi.product_id
WHERE oi.product_id IS NULL
ORDER BY p.name ASC;`,
        explanation: 'The `LEFT JOIN` matches all products against order items. Unsold products have `NULL` in `oi.product_id`, which is isolated by `WHERE oi.product_id IS NULL`.'
      }
    ],

    references: [
      {
        title: 'PostgreSQL Documentation: Table Expressions — Joins',
        type: 'Official Docs',
        url: 'https://www.postgresql.org/docs/current/queries-table-expressions.html#QUERIES-FROM'
      },
      {
        title: 'PostgreSQL Planner: Understanding Joins and EXPLAIN',
        type: 'Official Docs',
        url: 'https://www.postgresql.org/docs/current/using-explain.html'
      }
    ]
  });

})();
