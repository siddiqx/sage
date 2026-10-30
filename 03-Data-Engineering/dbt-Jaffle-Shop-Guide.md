# dbt Jaffle Shop: Analytics Engineering & Modeling Guide

## 1. Purpose
`jaffle_shop` is the canonical reference project maintained by dbt Labs. It demonstrates how to apply software engineering best practices—modularity, version control, automated testing, and CI/CD—to SQL data transformation pipelines.

- **Repository Location:** [`D:\Learning\Data-Engineering\ETL-ELT\Projects\dbt-Jaffle-Shop\`](file:///D:/Learning/Data-Engineering/ETL-ELT/Projects/dbt-Jaffle-Shop/)
- **License:** Apache License 2.0

---

## 2. Prerequisites
- **SQL Mastery:** Multi-table `JOIN`, Common Table Expressions (`WITH ... AS`), and `GROUP BY` aggregations.
- **Relational Concepts:** Primary keys, foreign keys, and grain of a dataset.

---

## 3. What You Will Learn
- The dbt transformation paradigm: Transforming data in-warehouse using pure `SELECT` statements (no manual `CREATE TABLE AS` or `INSERT INTO` boilerplate).
- Dimensional modeling: Designing Kimball-style Conformed Dimensions (`dim_customers`) and Fact Tables (`fct_orders`).
- Layered modeling architecture: Staging layer $\rightarrow$ Intermediate layer $\rightarrow$ Marts layer.
- Lineage graph resolution: Using `{{ ref('model_name') }}` to dynamically build Directed Acyclic Graphs (DAGs) of table dependencies.
- Data quality testing: Declarative testing (`unique`, `not_null`, `accepted_values`, `relationships`) in YAML.

---

## 4. Repository Structure: Where to Start

```
dbt-Jaffle-Shop/
├── dbt_project.yml          <-- READ FIRST: Project configurations and materialization rules
├── models/
│   ├── staging/             <-- LAYER 1: Raw data cleaning, renaming, casting (Views)
│   │   ├── stg_customers.sql
│   │   ├── stg_orders.sql
│   │   ├── stg_payments.sql
│   │   └── schema.yml       (Staging documentation and raw column tests)
│   └── marts/
│       └── core/            <-- LAYER 2: Business-ready Dimensional & Fact models (Tables)
│           ├── dim_customers.sql
│           ├── fct_orders.sql
│           └── core.yml     (Business metrics documentation and mart tests)
├── seeds/                   <-- Raw test data CSVs (raw_customers.csv, raw_orders.csv)
├── tests/                   <-- Custom singular SQL assertion tests
└── README.md                <-- Upstream overview
```

---

## 5. Modeling Architecture & Data Flow

```
[seeds: raw CSVs]
        │
        ▼
[Staging Layer (Views)]
  • stg_customers.sql   (renames id -> customer_id, casts types)
  • stg_orders.sql      (cleans status strings, parses dates)
  • stg_payments.sql    (converts cents to dollars)
        │
        ▼  {{ ref('stg_...') }} macro
[Marts Layer (Tables)]
  • dim_customers.sql   (aggregates lifetime spend, first/last order dates)
  • fct_orders.sql      (joins orders with payments for revenue grain)
```

### Staging Layer Philosophy (`models/staging/`)
- **1-to-1 with source tables:** Staging models clean and normalize raw source tables without altering the underlying grain or performing complex multi-table joins.
- **Renaming and Casting:** Converts source column names into consistent business names (e.g., renaming raw `id` to `customer_id`).
- **Materialization:** Typically materialized as lightweight `view`s to avoid redundant data storage.

### Marts Layer Philosophy (`models/marts/`)
- **Business-facing data:** Models intended for business analysts, dashboards (PowerBI, Tableau), and machine learning pipelines.
- **Dimensional Modeling:**
  - **Dimensions (`dim_`):** Who, what, where (e.g., `dim_customers` contains customer demographics, lifetime value, order counts).
  - **Facts (`fct_`):** Measurements and business events (e.g., `fct_orders` contains order amounts, status, timestamps).
- **Materialization:** Typically materialized as physical `table`s for fast analytical querying.

---

## 6. How dbt Generates Dependency Lineage

Instead of hardcoding table names like `FROM analytics.public.stg_orders`, dbt uses the `{{ ref() }}` macro:

```sql
-- Inside dim_customers.sql
with customers as (
    select * from {{ ref('stg_customers') }}
),
orders as (
    select * from {{ ref('stg_orders') }}
)
...
```

When dbt runs:
1. It parses all `{{ ref() }}` calls across all models.
2. It automatically builds the execution dependency graph (DAG).
3. It guarantees that `stg_customers` is built before `dim_customers` begins execution.
4. It resolves the exact database, schema, and environment prefixes automatically.

---

## 7. Automated Data Quality Testing (`schema.yml`)

In dbt, tests are declared in YAML files alongside the SQL models:

```yaml
version: 2

models:
  - name: stg_customers
    columns:
      - name: customer_id
        tests:
          - unique
          - not_null

  - name: fct_orders
    columns:
      - name: customer_id
        tests:
          - relationships:
              to: ref('dim_customers')
              field: customer_id
```

These declarative tests prevent dirty data, orphan records, and null primary keys from ever reaching downstream business intelligence dashboards.

---

## 8. Common Mistakes When Learning dbt
- **Doing business joins in the Staging layer:** Joining customers and orders inside `stg_orders.sql` violates staging modularity. Staging is for 1:1 cleaning; marts are for joins.
- **Writing DDL statements manually:** Never write `CREATE TABLE` inside dbt models. dbt manages table creation, updates, and indexing automatically.
- **Skipping tests:** Un-tested data models inevitably produce silent pipeline regressions. Always test primary keys for `unique` and `not_null`.

---

## 9. Companion Materials in this Library
- [`Data-Engineering-Zoomcamp-Guide.md`](file:///D:/Learning/Data-Engineering/Fundamentals/Notes/Data-Engineering-Zoomcamp-Guide.md) — How dbt fits into end-to-end data pipelines.
- [`Data-Engineering-Books.md`](file:///D:/Learning/Data-Engineering/Fundamentals/Resources/Data-Engineering-Books.md) — Kimball dimensional modeling references.
- [`PostgreSQL-16-Documentation.pdf`](file:///D:/Learning/Databases/PostgreSQL/PDFs/PostgreSQL-16-Documentation.pdf) — Relational engine executing dbt queries.
