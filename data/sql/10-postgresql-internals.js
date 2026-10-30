/**
 * Sage — SQL Topic 10: PostgreSQL-Specific Features & Advanced Internals
 */

(function () {
  'use strict';

  SAGE.registerTopic({
    id: 'sql-postgresql-internals',
    title: 'PostgreSQL Features: JSONB, Arrays & Lateral Joins',
    subject: 'sql',
    module: 'Advanced SQL',
    description: 'JSONB binary indexing (@>), native array types, LATERAL joins, full-text search (tsvector), and the PostgreSQL extension ecosystem.',
    difficulty: 'Advanced',
    readTime: '16 min read',

    overview: {
      definition: 'PostgreSQL is an object-relational database management system (ORDBMS) renowned for its advanced extensible type system. Beyond traditional SQL standards, PostgreSQL features high-performance binary JSON (`JSONB`) with GIN index support, native array columns, correlated `LATERAL` joins, built-in full-text search engines, and a rich extension architecture (`pg_trgm`, `postgis`).',
      mentalModel: 'Think of PostgreSQL as a hybrid database: it has the rock-solid ACID relational guarantees of a classical RDBMS, combined with the schema-less document flexibility of MongoDB (via `JSONB`) and the text-search capabilities of a search engine (via `tsvector` and `pg_trgm`), all within a single unified SQL engine.'
    },

    terminology: [
      {
        term: '`JSONB`',
        definition: 'Decomposed binary JSON storage format. Strips whitespace, eliminates duplicate keys, and supports GIN indexing and sub-millisecond key lookups.'
      },
      {
        term: '`->` vs `->>`',
        definition: '`->` extracts a JSON field/element as a `JSONB` object; `->>` extracts the value as plain `TEXT`.'
      },
      {
        term: '`LATERAL` Join',
        definition: 'Enables a subquery in the `FROM` or `JOIN` clause to reference columns from preceding tables, acting like an SQL `foreach` loop.'
      },
      {
        term: '`tsvector` & `tsquery`',
        definition: 'Data types for PostgreSQL Full-Text Search. `tsvector` stores normalized, stemmed lexemes; `tsquery` represents search terms matched with `@@`.'
      },
      {
        term: '`pg_trgm` Extension',
        definition: 'PostgreSQL extension that breaks strings into 3-character trigrams for fuzzy similarity searches and fast `LIKE \'%term%\'` queries.'
      }
    ],

    explanation: [
      {
        heading: '1. The Power of `JSONB` and GIN Indexing',
        content: `While <code>JSON</code> stores plain text (re-parsing on every read), <code>JSONB</code> parses JSON into binary key-value trees upon insertion.<br>With a GIN index on a JSONB column:<br><pre><code>CREATE INDEX idx_meta ON events USING gin (payload);
SELECT * FROM events WHERE payload @> \'{"status": "error", "severity": 5}\';</code></pre>PostgreSQL utilizes the GIN index to locate matching nested documents in sub-millisecond time without scanning the entire table.`
      },
      {
        heading: '2. `LATERAL` Joins: Correlated Subqueries in the FROM Clause',
        content: `In standard SQL, a subquery in \`FROM\` cannot reference columns from preceding tables. Adding the <code>LATERAL</code> keyword breaks this barrier, allowing the subquery to evaluate for each outer row:<br><pre><code>SELECT c.name, latest_order.*
FROM customers c
CROSS JOIN LATERAL (
    SELECT order_id, total, created_at
    FROM orders o
    WHERE o.customer_id = c.id
    ORDER BY created_at DESC
    LIMIT 2  -- Fetches the 2 latest orders for EACH customer!
) AS latest_order;</code></pre>`
      },
      {
        heading: '3. Full-Text Search with `tsvector` and `tsquery`',
        content: `Instead of slow, unindexed <code>LIKE '%apple%'</code> scans, PostgreSQL full-text search stems words (e.g. "running", "runs", "ran" all map to the root lexeme "run"):<br><pre><code>SELECT title FROM articles
WHERE to_tsvector('english', title || ' ' || body) @@ to_tsquery('english', 'quantum & computing');</code></pre>`
      }
    ],

    syntax: {
      pattern: `-- 1. JSONB Querying & Indexing
CREATE TABLE user_profiles (
    user_id SERIAL PRIMARY KEY,
    attributes JSONB NOT NULL
);
CREATE INDEX idx_user_attrs ON user_profiles USING gin (attributes);

-- Query with containment operator @>
SELECT attributes->>'name' AS name
FROM user_profiles
WHERE attributes @> '{"settings": {"dark_mode": true}}';

-- 2. Native Array Operations
SELECT id, tags
FROM blog_posts
WHERE 'postgres' = ANY(tags)
  AND tags && ARRAY['performance', 'indexing'];  -- Overlap operator

-- 3. Lateral Subquery (Top 1 per parent)
SELECT d.dept_name, top_earner.name, top_earner.salary
FROM departments d
LEFT JOIN LATERAL (
    SELECT name, salary FROM employees e
    WHERE e.dept_id = d.id ORDER BY salary DESC LIMIT 1
) AS top_earner ON TRUE;`,
      components: [
        { part: 'col @> jsonb_val', meaning: 'JSONB containment operator: checks if left JSONB contains right JSONB' },
        { part: 'jsonb_col->>\'key\'', meaning: 'Extracts JSON field as native text' },
        { part: 'val = ANY(array_col)', meaning: 'Checks if scalar value equals any element in the array' },
        { part: 'LEFT JOIN LATERAL (...) ON TRUE', meaning: 'Evaluates correlated subquery for each row of the outer table' }
      ]
    },

    examples: [
      {
        title: 'JSONB Containment Search & Lateral Top-Per-Category Query',
        description: 'Demonstrating JSONB queries, GIN index operators, and lateral joins.',
        code: `-- 1. Schema setup
CREATE TABLE hardware_devices (
    device_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    specs JSONB NOT NULL
);

INSERT INTO hardware_devices (name, specs) VALUES
('Server Alpha', '{"cpu": "Xeon", "ram_gb": 64, "ports": [22, 80, 443], "verified": true}'),
('Server Beta',  '{"cpu": "EPYC", "ram_gb": 128, "ports": [22, 443], "verified": true}'),
('Sensor Node',  '{"cpu": "ARM", "ram_gb": 4, "ports": [1883], "verified": false}');

-- 2. JSONB Text Extraction & Numeric Filtering
SELECT name, (specs->>'ram_gb')::INT AS ram
FROM hardware_devices
WHERE (specs->>'ram_gb')::INT >= 64;

-- 3. JSONB Containment Search (@>)
SELECT name, specs->>'cpu' AS cpu
FROM hardware_devices
WHERE specs @> '{"verified": true, "cpu": "EPYC"}';

-- 4. Unnesting Arrays from JSONB
SELECT name, jsonb_array_elements(specs->'ports') AS active_port
FROM hardware_devices
WHERE name = 'Server Alpha';`,
        output: `     name     | ram 
--------------+-----
 Server Alpha |  64
 Server Beta  | 128
(2 rows)

    name     | cpu  
-------------+------
 Server Beta | EPYC
(1 row)

     name     | active_port 
--------------+-------------
 Server Alpha | 22
 Server Alpha | 80
 Server Alpha | 443
(3 rows)`,
        explanation: [
          'Line 16-18: `specs->>\'ram_gb\'` extracts RAM as text, cast to an integer for numeric comparison.',
          'Line 21-23: Containment operator `@>` inspects the binary JSON tree, matching rows that have `verified: true` and `cpu: "EPYC"`.',
          'Line 26-28: `jsonb_array_elements` unpacks JSON arrays into individual rows.'
        ]
      }
    ],

    notes: [
      {
        type: 'info',
        title: 'JSON vs JSONB',
        body: 'Never use the `JSON` data type in PostgreSQL unless you strictly need to preserve exact whitespace or key duplicates for legal auditing. `JSONB` is faster, supports indexing, and requires less storage.'
      },
      {
        type: 'tip',
        title: '`jsonb_path_query` (SQL/JSON Standard)',
        body: 'PostgreSQL 12+ supports standard JSON Path queries: `jsonb_path_query(specs, \'$.ports[*] ? (@ > 80)\')`.'
      },
      {
        type: 'warning',
        title: 'Overusing JSONB Instead of Normalized Columns',
        body: 'Do not use JSONB as a replacement for standard database normalization. Columns that are frequently filtered, sorted, or joined with foreign keys should remain native SQL relational columns.'
      }
    ],

    commonMistakes: [
      {
        mistake: 'Using `->` Instead of `->>` in Text Comparisons',
        incorrectCode: `-- Bug: -> returns a JSONB string '"active"' (with quotes!), so comparison fails!
SELECT * FROM users WHERE profile->'status' = 'active';`,
        correctCode: `-- Correct: ->> returns plain text 'active'
SELECT * FROM users WHERE profile->>'status' = 'active';`,
        why: '`->` returns a `jsonb` object (which for strings includes literal JSON double quotes `\"active\"`). `->>` unquotes the value into standard text.'
      },
      {
        mistake: 'Attempting to Use B-Tree Index for JSONB Containment',
        incorrectCode: `CREATE INDEX idx_bad ON events (payload); -- B-Tree does NOT support @>!`,
        correctCode: `CREATE INDEX idx_good ON events USING gin (payload);`,
        why: 'B-Tree indexes only support scalar equality and ordering. GIN indexes are required to index internal JSON keys and array elements.'
      }
    ],

    comparisons: [
      {
        title: 'PostgreSQL JSON vs JSONB',
        headers: ['Feature', '`JSON` Type', '`JSONB` Type'],
        rows: [
          ['Storage Format', 'Exact text copy (preserves whitespace)', 'Decomposed binary format (optimized)'],
          ['Insert Speed', 'Slightly faster (no parsing overhead)', 'Slightly slower (parses into binary tree)'],
          ['Query Speed', 'Slow (re-parses on every read)', 'Instantaneous (reads pre-parsed binary)'],
          ['Index Support', 'Cannot be indexed with GIN', 'Full GIN index acceleration supported']
        ]
      }
    ],

    questions: [
      {
        question: 'What is the operational difference between the `->` and `->>` operators in PostgreSQL JSONB?',
        answer: '`->` returns the child as a `JSONB` object; `->>` returns the child as a plain unquoted `TEXT` string.',
        explanation: 'For example, `\'{"name": "Alice"}\'::jsonb -> \'name\'` is `\'"Alice"\'::jsonb`, while `->> \'name\'` is `\'Alice\'::text`.'
      },
      {
        question: 'Why are LATERAL joins useful in PostgreSQL?',
        answer: 'They allow a subquery in the `FROM` or `JOIN` clause to reference columns from preceding tables.',
        explanation: 'This enables fetching the top-N records per category, calling set-returning functions per row, or transforming nested arrays dynamically.'
      }
    ],

    practice: [
      {
        id: 'sql-adv-ex1',
        title: 'Top-3 Orders Per Customer Using LATERAL Join',
        difficulty: 'Advanced',
        prompt: 'Given tables `customers (id, name)` and `orders (id, customer_id, total, created_at)`, write a query using a `LEFT JOIN LATERAL` that returns each customer\'s name along with their 3 most recent orders (order id, total, and created_at). Customers with 0 orders must still appear.',
        starterCode: `-- Write your LATERAL query
pass;`,
        solution: `SELECT
    c.name AS customer_name,
    latest_orders.id AS order_id,
    latest_orders.total,
    latest_orders.created_at
FROM customers c
LEFT JOIN LATERAL (
    SELECT o.id, o.total, o.created_at
    FROM orders o
    WHERE o.customer_id = c.id
    ORDER BY o.created_at DESC
    LIMIT 3
) AS latest_orders ON TRUE
ORDER BY c.name, latest_orders.created_at DESC;`,
        explanation: '`LEFT JOIN LATERAL (...) ON TRUE` evaluates the correlated subquery for each customer row, fetching the 3 most recent orders while keeping customers who have zero orders.'
      }
    ],

    references: [
      {
        title: 'PostgreSQL Documentation: JSON Types & Functions',
        type: 'Official Docs',
        url: 'https://www.postgresql.org/docs/current/datatype-json.html'
      },
      {
        title: 'PostgreSQL Documentation: LATERAL Subqueries',
        type: 'Official Docs',
        url: 'https://www.postgresql.org/docs/current/queries-table-expressions.html#QUERIES-LATERAL'
      }
    ]
  });

})();
