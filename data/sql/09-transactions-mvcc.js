/**
 * Sage — SQL Topic 09: Transactions, ACID & MVCC Concurrency
 */

(function () {
  'use strict';

  SAGE.registerTopic({
    id: 'sql-transactions-mvcc',
    title: 'Transactions, ACID & MVCC Concurrency',
    subject: 'sql',
    module: 'Performance & Internals',
    description: 'ACID guarantees, Transaction Isolation Levels, Multi-Version Concurrency Control (xmin/xmax), Write-Ahead Logging, and row locking (FOR UPDATE).',
    difficulty: 'Advanced',
    readTime: '17 min read',

    overview: {
      definition: 'A transaction is an atomic unit of work comprising one or more SQL statements bounded by `BEGIN` and `COMMIT` or `ROLLBACK`. Relational databases enforce the ACID guarantees (Atomicity, Consistency, Isolation, Durability). PostgreSQL implements Isolation through Multi-Version Concurrency Control (MVCC): instead of locking rows during reads, it maintains multiple historical versions of each tuple, ensuring that readers never block writers, and writers never block readers.',
      mentalModel: 'Think of MVCC as git branches for database transactions. When your transaction starts, PostgreSQL gives you a point-in-time snapshot of the database state. If another transaction updates a row, it creates a new revision without overwriting yours. You continue reading your snapshot until you commit or rollback, completely isolated from concurrent edits.'
    },

    terminology: [
      {
        term: 'ACID Properties',
        definition: 'Atomicity (all or nothing), Consistency (preserves schema constraints), Isolation (concurrent execution independence), Durability (survives crashes via WAL).'
      },
      {
        term: 'MVCC (Multi-Version Concurrency Control)',
        definition: 'Database engine architecture that stores multiple versions of row records simultaneously, eliminating read locks.'
      },
      {
        term: '`xmin` and `xmax` System Columns',
        definition: 'Hidden tuple headers in PostgreSQL: `xmin` records the transaction ID that inserted the row; `xmax` records the transaction ID that updated or deleted it.'
      },
      {
        term: 'Write-Ahead Logging (WAL)',
        definition: 'PostgreSQL writes transaction changes to a sequential append-only log on disk before flushing dirty data pages, guaranteeing Durability.'
      },
      {
        term: '`SELECT ... FOR UPDATE`',
        definition: 'A pessimistic row-level lock statement preventing concurrent transactions from modifying or locking selected rows until the current transaction commits.'
      }
    ],

    explanation: [
      {
        heading: '1. The 4 Transaction Isolation Levels in PostgreSQL',
        content: 'PostgreSQL provides three distinct isolation levels (Dirty Reads are physically impossible under MVCC):<br><ul><li><strong>Read Committed (Default):</strong> Each query within the transaction sees a snapshot taken at the start of that <em>query</em>. If another transaction commits mid-way, subsequent queries in the same transaction see the newly committed rows (Non-Repeatable Read).</li><li><strong>Repeatable Read:</strong> The entire transaction sees a single snapshot taken at the start of the <em>first query</em>. Multiple reads of the same row always return identical data. If two transactions try to update the same row concurrently, one raises a serialization failure.</li><li><strong>Serializable:</strong> The strictest level. Simulates pure serial execution using Serializable Snapshot Isolation (SSI), detecting dependency cycles and aborting conflicting transactions.</li></ul>'
      },
      {
        heading: '2. How MVCC Works Internally (`xmin` and `xmax`)',
        content: 'In PostgreSQL, an <code>UPDATE</code> statement does <strong>not</strong> overwrite existing disk bytes. Instead:<br><ol><li>It marks the current row\'s hidden header <code>xmax = current_tx_id</code>.</li><li>It inserts a brand-new row tuple with <code>xmin = current_tx_id</code> and <code>xmax = 0</code>.</li></ol>When other transactions read, PostgreSQL compares their snapshot ID against the row\'s <code>xmin</code> and <code>xmax</code> to determine whether the old version or the new version is visible.<br>The background <code>VACUUM</code> daemon cleans up dead tuples once no active transaction can see them.'
      },
      {
        heading: '3. Preventing Race Conditions with `SELECT ... FOR UPDATE`',
        content: `In banking or inventory transfers, checking balance before deducting introduces a critical race condition:<br><pre><code>-- Transaction 1 & 2 run simultaneously:
SELECT balance FROM accounts WHERE id = 1; -- Both see \$100!
UPDATE accounts SET balance = balance - 80 WHERE id = 1; -- Overdrawn!</code></pre>To prevent this, acquire an exclusive row lock: <code>SELECT balance FROM accounts WHERE id = 1 FOR UPDATE;</code>. The second transaction will wait until the first transaction commits.`
      }
    ],

    syntax: {
      pattern: `-- 1. Standard Transaction with Savepoints
BEGIN;

UPDATE accounts SET balance = balance - 250.00 WHERE account_id = 101;

SAVEPOINT debit_confirmed;

-- Risky sub-action
INSERT INTO notification_logs (account_id, message) VALUES (101, 'Debited \$250');
-- If sub-action fails:
-- ROLLBACK TO SAVEPOINT debit_confirmed;

UPDATE accounts SET balance = balance + 250.00 WHERE account_id = 202;

COMMIT;

-- 2. Pessimistic Row Locking
BEGIN;
SELECT stock_count
FROM inventory
WHERE product_id = 42
FOR UPDATE;

UPDATE inventory SET stock_count = stock_count - 1 WHERE product_id = 42;
COMMIT;`,
      components: [
        { part: 'BEGIN / COMMIT / ROLLBACK', meaning: 'Delimits atomic transaction boundaries' },
        { part: 'SAVEPOINT name', meaning: 'Creates rollback checkpoint within an active transaction' },
        { part: 'FOR UPDATE', meaning: 'Acquires exclusive row-level lock on selected records' },
        { part: 'SET TRANSACTION ISOLATION LEVEL', meaning: 'Overrides default Read Committed isolation' }
      ]
    },

    examples: [
      {
        title: 'Atomic Fund Transfer with Row Locking and System Columns Inspection',
        description: 'Demonstrating ACID transaction rollback, row-level locking, and inspecting xmin/xmax.',
        code: `-- 1. Schema setup
CREATE TABLE bank_ledger (
    acc_id SERIAL PRIMARY KEY,
    holder VARCHAR(50) NOT NULL,
    balance NUMERIC(10, 2) NOT NULL CHECK (balance >= 0)
);

INSERT INTO bank_ledger (holder, balance) VALUES
('Alice', 500.00),
('Bob',   200.00);

-- 2. Inspecting Hidden MVCC Columns
SELECT xmin, xmax, acc_id, holder, balance FROM bank_ledger;

-- 3. Atomic Fund Transfer Transaction
BEGIN;

-- Lock Alice's account to prevent concurrent debit race conditions
SELECT balance FROM bank_ledger WHERE acc_id = 1 FOR UPDATE;

UPDATE bank_ledger SET balance = balance - 150.00 WHERE acc_id = 1;
UPDATE bank_ledger SET balance = balance + 150.00 WHERE acc_id = 2;

COMMIT;

-- 4. Verify Final Balances
SELECT acc_id, holder, balance FROM bank_ledger;`,
        output: ` xmin  | xmax | acc_id | holder | balance 
-------+------+--------+--------+---------
 14022 |    0 |      1 | Alice  |  500.00
 14022 |    0 |      2 | Bob    |  200.00
(2 rows)

 acc_id | holder | balance 
--------+--------+---------
      1 | Alice  |  350.00
      2 | Bob    |  350.00
(2 rows)`,
        explanation: [
          'Line 13: `xmin` displays the transaction ID (14022) that created the rows. `xmax = 0` indicates the rows have not been updated or deleted.',
          'Line 16-24: Atomic transaction wraps the debit and credit together. If either update fails, `CHECK (balance >= 0)` triggers a rollback, preserving system consistency.',
          'Line 19: `FOR UPDATE` prevents concurrent transactions from modifying Alice\'s balance simultaneously.'
        ]
      }
    ],

    notes: [
      {
        type: 'warning',
        title: 'Keep Transactions Short',
        body: 'Long-running transactions hold locks, prevent `VACUUM` from reclaiming dead rows, and cause table bloat. Never make network HTTP requests or wait on external APIs inside an open database transaction.'
      },
      {
        type: 'info',
        title: 'Dirty Reads Are Impossible in PostgreSQL',
        body: 'PostgreSQL does not support the SQL standard `Read Uncommitted` level. If you request `SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED`, PostgreSQL treats it as `Read Committed`.'
      },
      {
        type: 'tip',
        title: 'Deadlock Detection',
        body: 'If Transaction A holds Lock 1 and waits for Lock 2, while Transaction B holds Lock 2 and waits for Lock 1, PostgreSQL automatically detects the circular deadlock and aborts one transaction with error code `40P01`.'
      }
    ],

    commonMistakes: [
      {
        mistake: 'Failing to Lock Rows During Read-Modify-Write Cycles',
        incorrectCode: `-- Classic Race Condition:
BEGIN;
SELECT balance FROM users WHERE id = 10; -- returns 100
-- Concurrent process also reads 100!
UPDATE users SET balance = 100 - 90 WHERE id = 10;
COMMIT;`,
        correctCode: `-- Use FOR UPDATE or in-place arithmetic:
BEGIN;
UPDATE users SET balance = balance - 90
WHERE id = 10 AND balance >= 90;
COMMIT;`,
        why: 'In-place atomic arithmetic (`balance = balance - 90`) is handled atomically by the engine without needing manual application locks.'
      },
      {
        mistake: 'Leaving Uncommitted Transactions Open in Web Applications',
        incorrectCode: `# Web framework error: Opening transaction and calling third-party payment API
with db.transaction():
    charge_card_via_stripe() # If Stripe takes 10 seconds, DB locks freeze!`,
        correctCode: `# Call external API first, then commit DB transaction quickly:
charge_result = charge_card_via_stripe()
with db.transaction():
    record_payment(charge_result)`,
        why: 'External network latencies keep database locks open, exhausting connection pools and causing cascading system outages.'
      }
    ],

    comparisons: [
      {
        title: 'Transaction Isolation Levels Matrix',
        headers: ['Isolation Level', 'Dirty Read', 'Non-Repeatable Read', 'Phantom Read', 'Serialization Anomaly'],
        rows: [
          ['Read Committed (Default)', 'Prevented', 'Allowed', 'Allowed', 'Allowed'],
          ['Repeatable Read', 'Prevented', 'Prevented', 'Prevented (Postgres snapshot)', 'Allowed'],
          ['Serializable (SSI)', 'Prevented', 'Prevented', 'Prevented', 'Prevented']
        ]
      }
    ],

    questions: [
      {
        question: 'What happens to a deleted row in PostgreSQL under MVCC?',
        answer: 'It is not physically erased immediately; its `xmax` header is set to the deleting transaction ID.',
        explanation: 'Active transactions with older snapshots can still read the row. Once all such transactions finish, `VACUUM` marks the space as reusable.'
      },
      {
        question: 'What is the purpose of `SELECT ... FOR UPDATE`?',
        answer: 'To acquire an exclusive row-level lock on the selected rows.',
        explanation: 'It prevents other concurrent transactions from modifying or locking those rows until the current transaction commits or rolls back.'
      }
    ],

    practice: [
      {
        id: 'sql-tx-ex1',
        title: 'Safe E-Commerce Stock Reservation',
        difficulty: 'Advanced',
        prompt: 'Write a transaction script that attempts to reserve 1 unit of product `id = 99` from `inventory (product_id, available_stock)`. Use `FOR UPDATE` to lock the row, ensure `available_stock >= 1`, decrement it by 1, and commit. If stock is insufficient, perform a rollback.',
        starterCode: `-- Write transaction block
pass;`,
        solution: `BEGIN;

SELECT available_stock
FROM inventory
WHERE product_id = 99
FOR UPDATE;

-- Decrement stock safely
UPDATE inventory
SET available_stock = available_stock - 1
WHERE product_id = 99 AND available_stock >= 1;

COMMIT;`,
        explanation: '`FOR UPDATE` serializes concurrent purchase attempts on product 99, preventing stock over-selling race conditions.'
      }
    ],

    references: [
      {
        title: 'PostgreSQL Documentation: Concurrency Control & MVCC',
        type: 'Official Docs',
        url: 'https://www.postgresql.org/docs/current/mvcc.html'
      },
      {
        title: 'PostgreSQL Documentation: Transaction Isolation',
        type: 'Official Docs',
        url: 'https://www.postgresql.org/docs/current/transaction-iso.html'
      }
    ]
  });

})();
