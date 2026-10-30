/**
 * Sage — SQL Topic 07: Data Types, Constraints & Schema Integrity
 */

(function () {
  'use strict';

  SAGE.registerTopic({
    id: 'sql-constraints',
    title: 'Data Types, Constraints & Defensive Schema Design',
    subject: 'sql',
    module: 'Schema Architecture',
    description: 'PostgreSQL data types (NUMERIC vs FLOAT, TIMESTAMPTZ vs TIMESTAMP, UUID), CHECK constraints, generated columns, and foreign key action rules.',
    difficulty: 'Intermediate',
    readTime: '15 min read',

    overview: {
      definition: 'Data types and constraints form the first line of defense in database architecture, enforcing domain rules and business invariants directly at the storage engine level. By embedding constraints (`NOT NULL`, `CHECK`, `UNIQUE`, `FOREIGN KEY`) into table schemas, the database guarantees data consistency regardless of software bugs or conflicting application updates.',
      mentalModel: 'Think of constraints as automated physical sorting sieves built into a pipeline. If a coin is the wrong diameter (type mismatch) or foreign material enters the chute (CHECK constraint violation), the sieve physically blocks it from entering the vault, guaranteeing that bad data can never corrupt the storage engine.'
    },

    terminology: [
      {
        term: '`NUMERIC(precision, scale)`',
        definition: 'Exact user-specified precision decimal type (up to 131,072 digits before decimal point). Essential for monetary transactions.'
      },
      {
        term: '`TIMESTAMPTZ`',
        definition: 'Timestamp with time zone. In PostgreSQL, it stores the time internally in UTC, converting to the client\'s session timezone on display.'
      },
      {
        term: '`CHECK` Constraint',
        definition: 'An expression constraint that must evaluate to TRUE (or NULL) for every inserted or updated row (e.g. `CHECK (end_date >= start_date)`).'
      },
      {
        term: 'Referential Actions (`ON DELETE / ON UPDATE`)',
        definition: 'Rules specifying behavior when a parent row is modified: `CASCADE` (delete child), `RESTRICT` (block parent delete), `SET NULL`, `SET DEFAULT`.'
      },
      {
        term: 'Generated Columns (`GENERATED ALWAYS AS`)',
        definition: 'Columns computed automatically from other columns in the same row, stored on disk (`STORED`) with zero application computation overhead.'
      }
    ],

    explanation: [
      {
        heading: '1. Timestamp Gotchas: `TIMESTAMPTZ` vs `TIMESTAMP`',
        content: 'Always use <code>TIMESTAMPTZ</code> (Timestamp with time zone) in production databases:<br><ul><li><code>TIMESTAMP</code> (without timezone) stores naive local date and time. It does not record whether the time was UTC, EST, or IST, creating catastrophic bugs during daylight saving time transitions.</li><li><code>TIMESTAMPTZ</code> normalizes incoming dates to UTC internally, and converts to the connection\'s local timezone on readout.</li></ul>'
      },
      {
        heading: '2. Multi-Column `CHECK` Constraints and Business Logic',
        content: `A \`CHECK\` constraint can compare multiple columns within the same row:<br><pre><code>CREATE TABLE hotel_reservations (
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    adults INTEGER NOT NULL CHECK (adults >= 1),
    CONSTRAINT valid_dates CHECK (check_out > check_in)
);</code></pre>This ensures that reservation check-outs are strictly after check-ins at the database level.`
      },
      {
        heading: '3. Generated Stored Columns (PostgreSQL 12+)',
        content: `Generated columns compute values automatically and can be indexed like regular columns:<br><pre><code>CREATE TABLE invoice_items (
    unit_price NUMERIC(10, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    total_price NUMERIC(10, 2) GENERATED ALWAYS AS (unit_price * quantity) STORED
);</code></pre>This eliminates redundant calculations in application queries while guaranteeing total price consistency.`
      }
    ],

    syntax: {
      pattern: `-- Complete Defensive DDL Table Pattern
CREATE TABLE subscriptions (
    subscription_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tier VARCHAR(20) NOT NULL CHECK (tier IN ('free', 'pro', 'enterprise')),
    monthly_price NUMERIC(8, 2) NOT NULL CHECK (monthly_price >= 0),
    annual_discount NUMERIC(3, 2) DEFAULT 0.0 CHECK (annual_discount BETWEEN 0.0 AND 1.0),
    effective_annual_price NUMERIC(8, 2) GENERATED ALWAYS AS (
        (monthly_price * 12) * (1.0 - annual_discount)
    ) STORED,
    starts_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ends_at TIMESTAMPTZ,
    CONSTRAINT valid_subscription_window CHECK (ends_at IS NULL OR ends_at > starts_at)
);`,
      components: [
        { part: 'gen_random_uuid()', meaning: 'Cryptographically secure Version 4 UUID generator' },
        { part: 'CHECK (tier IN (...))', meaning: 'Enforces enumeration boundaries without requiring external enum types' },
        { part: 'GENERATED ALWAYS AS (...) STORED', meaning: 'Automatically computed stored column' },
        { part: 'CONSTRAINT name CHECK (...)', meaning: 'Named table-level multi-column constraint' }
      ]
    },

    examples: [
      {
        title: 'Defensive E-Commerce Schema with UUIDs and Generated Columns',
        description: 'Demonstrating UUID primary keys, CHECK constraints, and generated columns.',
        code: `-- 1. Schema setup
CREATE TABLE store_orders (
    order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_email VARCHAR(255) NOT NULL CHECK (customer_email LIKE '%@%._%'),
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    tax_rate NUMERIC(4, 3) NOT NULL CHECK (tax_rate BETWEEN 0.0 AND 0.300),
    total_tax NUMERIC(10, 2) GENERATED ALWAYS AS (ROUND(subtotal * tax_rate, 2)) STORED,
    final_total NUMERIC(10, 2) GENERATED ALWAYS AS (subtotal + ROUND(subtotal * tax_rate, 2)) STORED,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Insert valid order
INSERT INTO store_orders (customer_email, subtotal, tax_rate)
VALUES ('buyer@example.com', 199.99, 0.0825);

-- 3. Query generated totals
SELECT customer_email, subtotal, total_tax, final_total
FROM store_orders;`,
        output: `  customer_email   | subtotal | total_tax | final_total 
-------------------+----------+-----------+-------------
 buyer@example.com |   199.99 |     16.50 |      216.49
(1 row)`,
        explanation: [
          'Line 3: `gen_random_uuid()` generates collision-proof 128-bit identifiers without central locking.',
          'Line 4: `CHECK (customer_email LIKE \'%@%._%\')` provides basic email format validation.',
          'Line 7-8: `total_tax` and `final_total` are computed automatically upon insert and stored on disk for instant reading.'
        ]
      }
    ],

    notes: [
      {
        type: 'warning',
        title: 'Check Constraints and NULL Values',
        body: 'A `CHECK` constraint passes if the condition evaluates to `TRUE` OR `NULL`! If a column is nullable, a check like `CHECK (discount < 100)` will succeed on NULL rows unless you add `NOT NULL`.'
      },
      {
        type: 'info',
        title: 'UUID v4 vs Serial / BigInt',
        body: 'Surrogate integer keys (`BIGSERIAL`) are compact (8 bytes) and sequential (great for B-Tree indexing). UUIDs (16 bytes) prevent enumeration attacks in public URLs (e.g. `/orders/1`, `/orders/2`) and can be generated by client applications before inserting.'
      },
      {
        type: 'tip',
        title: 'Name Your Constraints',
        body: 'Always name table constraints explicitly: `CONSTRAINT check_positive_price CHECK (price > 0)`. When a violation occurs, the database logs the exact name, making debugging instantaneous.'
      }
    ],

    commonMistakes: [
      {
        mistake: 'Using `TIMESTAMP WITHOUT TIME ZONE` for Global Applications',
        incorrectCode: `CREATE TABLE audit_logs (
    event_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Drops timezone context!
);`,
        correctCode: `CREATE TABLE audit_logs (
    event_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP  -- Normalized to UTC!
);`,
        why: 'Without timezone offsets, daylight saving time shifts create duplicate hours (1:30 AM occurs twice during fall-back), corrupting chronological order.'
      },
      {
        mistake: 'Using VARCHAR(255) Arbitrarily in PostgreSQL',
        incorrectCode: `name VARCHAR(255)  -- Legacy MySQL convention with no technical benefit in Postgres`,
        correctCode: `name TEXT  -- Or VARCHAR(100) if an actual business constraint exists`,
        why: 'In PostgreSQL, `TEXT` and `VARCHAR(n)` use the exact same underlying storage format (`varlena`). Restricting length to 255 adds no performance benefit unless an actual business requirement demands it.'
      }
    ],

    comparisons: [
      {
        title: 'PostgreSQL Numeric Types Comparison',
        headers: ['Type', 'Storage Size', 'Precision Type', 'Best For'],
        rows: [
          ['`NUMERIC` / `DECIMAL`', 'Variable (up to 131K digits)', 'Exact fixed-point (decimal)', 'Currency, banking, tax ledgers'],
          ['`DOUBLE PRECISION` / `FLOAT8`', '8 bytes', 'Inexact IEEE 754 (binary)', 'Scientific computing, telemetry, physics, ML'],
          ['`BIGINT`', '8 bytes', 'Exact signed integer (-9 to +9 Quintillion)', 'High-volume transaction IDs, counters']
        ]
      }
    ],

    questions: [
      {
        question: 'Why should monetary currency never be stored in a `FLOAT` or `DOUBLE PRECISION` column?',
        answer: 'Because floating-point numbers cannot represent exact decimal fractions in binary, leading to accumulated rounding errors.',
        explanation: 'Always use `NUMERIC` or `DECIMAL` for exact fractional math in financial ledgers.'
      },
      {
        question: 'Under what evaluation result will a CHECK constraint fail and raise an error in SQL?',
        answer: 'Only when the expression evaluates strictly to `FALSE`.',
        explanation: 'If the expression evaluates to `TRUE` or `UNKNOWN` (NULL), the CHECK constraint passes.'
      }
    ],

    practice: [
      {
        id: 'sql-con-ex1',
        title: 'Event Booking Schema with Date Checks',
        difficulty: 'Intermediate',
        prompt: 'Create a table `conference_rooms` with an integer primary key, a room name, and max capacity (must be at least 5). Then create a `room_bookings` table with a foreign key to `conference_rooms` that cascades deletes, a booking date, start time, end time, and a table-level CHECK constraint verifying that end time is greater than start time.',
        starterCode: `-- Write DDL statements
pass;`,
        solution: `CREATE TABLE conference_rooms (
    room_id SERIAL PRIMARY KEY,
    room_name VARCHAR(100) NOT NULL UNIQUE,
    capacity INTEGER NOT NULL CHECK (capacity >= 5)
);

CREATE TABLE room_bookings (
    booking_id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL REFERENCES conference_rooms(room_id) ON DELETE CASCADE,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    CONSTRAINT valid_meeting_time CHECK (end_time > start_time)
);`,
        explanation: 'Enforces capacity minimums on the parent room and verifies chronological time intervals on child bookings.'
      }
    ],

    references: [
      {
        title: 'PostgreSQL Documentation: Data Types',
        type: 'Official Docs',
        url: 'https://www.postgresql.org/docs/current/datatype.html'
      },
      {
        title: 'PostgreSQL Documentation: Constraints',
        type: 'Official Docs',
        url: 'https://www.postgresql.org/docs/current/ddl-constraints.html'
      }
    ]
  });

})();
