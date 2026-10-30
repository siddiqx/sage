/**
 * Sage — SQL Topic 01: Database Concepts & Relational Architecture
 */

(function () {
  'use strict';

  SAGE.registerTopic({
    id: 'sql-db-concepts',
    title: 'Database Architecture & The Relational Model',
    subject: 'sql',
    module: 'Foundations',
    description: 'Relational algebra, tables, tuples, attributes, primary/foreign keys, entity-relationship modeling, and normalization.',
    difficulty: 'Beginner',
    readTime: '13 min read',

    overview: {
      definition: 'A Relational Database Management System (RDBMS) stores data structured into two-dimensional tables (relations) consisting of rows (tuples) and columns (attributes), governed by relational algebra as formulated by Edgar F. Codd. Data relationships are enforced through primary and foreign key constraints rather than raw physical pointers, ensuring data integrity, mathematical consistency, and declarative query execution via SQL.',
      mentalModel: 'Think of a relational database as a synchronized registry of distinct ledger books (tables). Each row is an immutable record with a unique ticket number (Primary Key). Instead of copying customer names into every sales entry, the sales ledger simply records the customer\'s ticket number (Foreign Key), establishing an unbreakable relationship verified by the database engine.'
    },

    terminology: [
      {
        term: 'Relation / Table',
        definition: 'A named two-dimensional structure containing a set of rows and columns representing a specific entity (e.g. `users`, `orders`).'
      },
      {
        term: 'Tuple / Row',
        definition: 'A single record in a table containing a specific instance of data across all defined attributes.'
      },
      {
        term: 'Attribute / Column',
        definition: 'A named field within a table holding data of a strictly defined type (e.g. `email VARCHAR(255)`).'
      },
      {
        term: 'Primary Key (PK)',
        definition: 'A column or combination of columns that uniquely identifies each row in a table. Must be UNIQUE and NOT NULL.'
      },
      {
        term: 'Foreign Key (FK)',
        definition: 'A column that references the primary key of another table, establishing a referential constraint enforced by the engine.'
      },
      {
        term: 'Normalization (1NF, 2NF, 3NF)',
        definition: 'The mathematical design process of organizing tables to eliminate data redundancy and prevent insertion, update, and deletion anomalies.'
      }
    ],

    explanation: [
      {
        heading: '1. Relational Integrity: Primary & Foreign Keys',
        content: 'Relational databases enforce data consistency through two foundational constraints:<br><ul><li><strong>Entity Integrity:</strong> Every table must have a Primary Key that cannot be null. This guarantees every record is uniquely addressable.</li><li><strong>Referential Integrity:</strong> A Foreign Key links a child record to a parent record. If a foreign key contains a value, that value <em>must</em> exist in the referenced parent table. The database prevents orphan records by rejecting invalid inserts or cascades deletions.</li></ul>'
      },
      {
        heading: '2. Normalization Fundamentals (1NF, 2NF, 3NF)',
        content: 'Database normalization reduces duplicate data across tables:<br><ol><li><strong>First Normal Form (1NF):</strong> Atomic values (no arrays or comma-separated lists in a single cell) and unique row identification.</li><li><strong>Second Normal Form (2NF):</strong> Satisfies 1NF, and all non-key columns depend on the <em>entire</em> primary key (eliminates partial key dependencies in composite keys).</li><li><strong>Third Normal Form (3NF):</strong> Satisfies 2NF, and all non-key columns depend <em>only</em> on the primary key, with no transitive dependencies (column A determines column B, which determines column C).</li></ol>'
      },
      {
        heading: '3. Declarative vs Imperative: What vs How',
        content: 'Unlike Python, where you write explicit instructions on <em>how</em> to iterate through data, SQL is a <strong>declarative</strong> language. You specify <em>what</em> data you want (e.g., "all orders from 2024 with total > $100"), and the database query planner (Cost-Based Optimizer) calculates the most efficient physical execution plan (index scans, hash joins, or nested loops) using statistical table histograms.'
      }
    ],

    syntax: {
      pattern: `-- Table Creation with Primary and Foreign Keys
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    order_date DATE DEFAULT CURRENT_DATE
);`,
      components: [
        { part: 'SERIAL / BIGSERIAL', meaning: 'Auto-incrementing integer sequence for surrogate primary keys' },
        { part: 'REFERENCES table(col)', meaning: 'Enforces foreign key referential integrity constraint' },
        { part: 'ON DELETE CASCADE', meaning: 'Automatically deletes child rows when the parent record is deleted' },
        { part: 'CHECK (condition)', meaning: 'Integrity rule ensuring column values meet specified logic' }
      ]
    },

    examples: [
      {
        title: 'Relational Schema Modeling & Foreign Key Integrity Checks',
        description: 'Creating related tables, testing foreign key constraints, and observing referential cascade behavior.',
        code: `-- 1. Schema setup
CREATE TABLE departments (
    dept_id SERIAL PRIMARY KEY,
    dept_name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE employees (
    emp_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    salary NUMERIC(10, 2) NOT NULL CHECK (salary > 0),
    dept_id INTEGER REFERENCES departments(dept_id) ON DELETE RESTRICT
);

-- 2. Insert valid data
INSERT INTO departments (dept_name) VALUES ('Engineering'), ('Operations');
INSERT INTO employees (name, salary, dept_id) VALUES ('Alice', 120000.00, 1);
INSERT INTO employees (name, salary, dept_id) VALUES ('Bob', 95000.00, 1);

-- 3. Attempting to insert an invalid Foreign Key:
-- Fails with: KeyError violation!
-- INSERT INTO employees (name, salary, dept_id) VALUES ('Eve', 70000, 999);

-- 4. Inspecting relational join
SELECT e.emp_id, e.name, e.salary, d.dept_name
FROM employees e
JOIN departments d ON e.dept_id = d.dept_id;`,
        output: `emp_id | name  |  salary   |  dept_name  
--------+-------+-----------+-------------
      1 | Alice | 120000.00 | Engineering
      2 | Bob   |  95000.00 | Engineering
(2 rows)`,
        explanation: [
          'Line 2-5: Defines the parent `departments` table with a unique string name constraint.',
          'Line 7-12: The child `employees` table establishes `REFERENCES departments(dept_id) ON DELETE RESTRICT` to prevent deleting departments that have active staff.',
          'Line 24-26: `JOIN` connects child rows to parent rows using foreign-to-primary key equivalence.'
        ]
      }
    ],

    notes: [
      {
        type: 'info',
        title: 'Surrogate Keys vs Natural Keys',
        body: 'A natural key is a real-world attribute that is inherently unique (like an email or National ID). A surrogate key is an arbitrary synthetic integer or UUID generated purely for the database. Modern schema designs favor surrogate keys (`SERIAL` or `UUID`) to isolate relational joins from mutable real-world identifiers.'
      },
      {
        type: 'warning',
        title: 'Beware Cascade Deletions in Production',
        body: '`ON DELETE CASCADE` automatically wipes out child rows when a parent is deleted. In financial or auditing schemas, prefer `ON DELETE RESTRICT` or soft deletions (`is_deleted = TRUE`) to avoid accidental catastrophic data loss.'
      },
      {
        type: 'tip',
        title: 'Always Index Foreign Key Columns',
        body: 'Most relational engines do NOT automatically create an index on foreign key columns. If you join on `child.parent_id` frequently, explicitly add `CREATE INDEX idx_child_parent_id ON child(parent_id);`.'
      }
    ],

    commonMistakes: [
      {
        mistake: 'Storing Comma-Separated Values in a Single Column (1NF Violation)',
        incorrectCode: `-- Flawed schema violating 1NF:
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    tags VARCHAR(255)  -- Storing "admin,editor,billing"
);`,
        correctCode: `-- Correct normalized schema:
CREATE TABLE users (id SERIAL PRIMARY KEY, name VARCHAR(100));
CREATE TABLE tags (id SERIAL PRIMARY KEY, tag_name VARCHAR(50) UNIQUE);
CREATE TABLE user_tags (
    user_id INT REFERENCES users(id),
    tag_id INT REFERENCES tags(id),
    PRIMARY KEY (user_id, tag_id)
);`,
        why: 'Storing delimited lists makes queries slow, prevents index usage, makes joins impossible, and breaks data integrity.'
      },
      {
        mistake: 'Using Floating Point (`FLOAT`, `REAL`) for Currency',
        incorrectCode: `CREATE TABLE orders (
    total FLOAT  -- IEEE 754 precision errors will corrupt ledger totals!
);`,
        correctCode: `CREATE TABLE orders (
    total NUMERIC(12, 2)  -- Exact fixed-point arithmetic
);`,
        why: 'Binary floating-point types (`FLOAT`, `DOUBLE PRECISION`) cannot represent exact decimal currency values. Always use `NUMERIC` or `DECIMAL` for financial records.'
      }
    ],

    comparisons: [
      {
        title: 'Relational (RDBMS) vs Non-Relational (NoSQL)',
        headers: ['Dimension', 'Relational (PostgreSQL / MySQL)', 'Document NoSQL (MongoDB / DynamoDB)'],
        rows: [
          ['Data Model', 'Strict normalized tables with schema constraints', 'Flexible nested JSON-like documents'],
          ['Query Language', 'Standard Declarative SQL', 'Proprietary APIs / JSON filters'],
          ['ACID Guarantees', 'Full multi-row ACID transactions', 'Often single-document ACID, eventual consistency across collections'],
          ['Scaling Model', 'Vertical scaling (CPU/RAM) + read replicas', 'Horizontal sharding across distributed clusters']
        ]
      }
    ],

    questions: [
      {
        question: 'What is the difference between a Primary Key and a Unique constraint?',
        answer: 'A Primary Key cannot contain NULL values, whereas a Unique constraint allows NULLs (and in PostgreSQL, multiple NULLs unless specified NULLS NOT DISTINCT).',
        explanation: 'A table can have only one Primary Key, but multiple Unique constraints.'
      },
      {
        question: 'What is Third Normal Form (3NF)?',
        answer: 'A table is in 3NF if it is in 2NF and no non-key attribute is transitively dependent on the primary key.',
        explanation: 'Every non-key attribute must depend directly on the primary key, the whole primary key, and nothing but the primary key.'
      }
    ],

    practice: [
      {
        id: 'sql-db-ex1',
        title: 'Design a Normalized E-Commerce Order Schema',
        difficulty: 'Beginner',
        prompt: 'Write SQL DDL statements to create: (1) an `authors` table with `author_id` and `name`, (2) a `books` table with `book_id`, `title`, and `price` (must be positive), and (3) a foreign key link from `books` to `authors` ensuring deleting an author is blocked if they have published books.',
        starterCode: `-- Write DDL statements for authors and books
pass;`,
        solution: `CREATE TABLE authors (
    author_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL
);

CREATE TABLE books (
    book_id SERIAL PRIMARY KEY,
    author_id INTEGER NOT NULL REFERENCES authors(author_id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    price NUMERIC(8, 2) NOT NULL CHECK (price > 0)
);`,
        explanation: '`REFERENCES authors(author_id) ON DELETE RESTRICT` guarantees author records cannot be deleted while books reference them.'
      }
    ],

    references: [
      {
        title: 'PostgreSQL Documentation: DDL & Constraints',
        type: 'Official Docs',
        url: 'https://www.postgresql.org/docs/current/ddl-constraints.html'
      },
      {
        title: 'A Relational Model of Data for Large Shared Data Banks (E.F. Codd, 1970)',
        type: 'Paper',
        url: 'https://dl.acm.org/doi/10.1145/362384.362685'
      }
    ]
  });

})();
