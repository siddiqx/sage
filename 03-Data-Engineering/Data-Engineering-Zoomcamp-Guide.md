# Data Engineering Zoomcamp: Curriculum & Study Guide

## 1. Purpose
The Data Engineering Zoomcamp (DataTalksClub) is an open-source, production-oriented course covering the full modern data engineering lifecycle—from containerized extraction to warehouse modeling, batch processing, and streaming architectures.

- **Repository Location:** [`D:\Learning\Data-Engineering\Fundamentals\Projects\Data-Engineering-Zoomcamp\`](file:///D:/Learning/Data-Engineering/Fundamentals/Projects/Data-Engineering-Zoomcamp/)
- **Course Edition:** 2026 Cohort Update
- **License:** Apache License 2.0

---

## 2. Prerequisites
- **Python:** Basic scripting, virtual environments, `requests`, and `pandas` dataframes.
- **SQL:** Fundamental queries (`SELECT`, `JOIN`, `GROUP BY`, aggregations).
- **Command Line:** Basic shell navigation, environment variables, and SSH concepts.

---

## 3. What You Will Learn
- **Infrastructure as Code:** Provisioning cloud storage and analytical warehouses using Terraform.
- **Workflow Orchestration:** Scheduling, dependency tracking, and automated retries using Kestra and Apache Airflow.
- **Data Warehousing:** Partitioning, clustering, and cost optimization in Google BigQuery or Snowflake.
- **Analytics Engineering:** Transforming raw data into business-ready dimensional marts using dbt.
- **Distributed Computing:** Processing large datasets across clusters using Apache Spark.
- **Real-Time Streaming:** Ingesting and processing continuous event streams using Apache Kafka.

---

## 4. Repository Structure: Where to Start & What to Ignore

```
Data-Engineering-Zoomcamp/
├── 01-docker-terraform/       <-- MODULE 1: Docker, Postgres ingestion, Terraform basics
├── 02-workflow-orchestration/ <-- MODULE 2: Kestra / Mage pipeline DAGs & schedules
├── 03-data-warehouse/         <-- MODULE 3: BigQuery / Snowflake partitioning & clustering
├── 04-analytics-engineering/  <-- MODULE 4: dbt data modeling (staging, intermediate, marts)
├── 05-batch-processing/       <-- MODULE 5: Apache Spark, PySpark, RDDs, Catalyst optimizer
├── 06-streaming/              <-- MODULE 6: Kafka topics, producers, consumers, Faust/Flink
├── projects/                  <-- CAPSTONE: Real-world portfolio project specifications
├── cohorts/                   <-- Cohort-specific schedules, homeworks, and Q&A transcripts
├── .github/                   <-- IGNORE: Upstream CI/CD workflows and automated graders
└── scripts/                   <-- IGNORE: Upstream course maintenance scripts
```

### Files Beginners Can Initially Ignore
- `.github/`: Automatic homework grading bots and issue templates.
- `cohorts/`: Historical homework deadlines and Zoom transcript logs.
- Cloud deployment scripts requiring active credit cards or paid GCP/AWS credentials.

---

## 5. Module-by-Module Study Plan

```
Ingestion (Module 1)  ──>  Orchestration (Module 2)  ──>  Data Lake & Warehouse (Module 3)
      │
      ▼
Analytics Engineering (Module 4)  ──>  Batch Compute (Module 5)  ──>  Streaming (Module 6)
```

### Module 1: Containerization & Infrastructure as Code (`01-docker-terraform/`)
- **Key Concepts:** Docker images, multi-container networks (`docker-compose`), running local PostgreSQL, Terraform providers, state files, and resource declarations (`main.tf`, `variables.tf`).
- **Files to Inspect:** `01-docker-terraform/docker/Dockerfile` and `01-docker-terraform/terraform/main.tf`.

### Module 2: Workflow Orchestration (`02-workflow-orchestration/`)
- **Key Concepts:** Directed Acyclic Graphs (DAGs), task dependencies, parameterization, backfilling, idempotent execution, and handling pipeline failures.
- **Files to Inspect:** Read the workflow YAML flows in `02-workflow-orchestration/kestra/flows/`.

### Module 3: Data Warehousing (`03-data-warehouse/`)
- **Key Concepts:** OLAP vs. OLTP, columnar storage (Parquet/ORC), table partitioning (by date or integer range), and clustering (sorting within partitions to minimize scan bytes).
- **Files to Inspect:** SQL queries in `03-data-warehouse/big_query.sql`.

### Module 4: Analytics Engineering with dbt (`04-analytics-engineering/`)
- **Key Concepts:** Modular data modeling (Staging $\rightarrow$ Core/Marts), Jinja templating, testing (`unique`, `not_null`, `relationships`), and documentation generation.
- **Files to Inspect:** Read the model definitions in `04-analytics-engineering/taxi_rides_ny/models/`.

### Module 5: Batch Processing with Apache Spark (`05-batch-processing/`)
- **Key Concepts:** Distributed dataframes, lazy evaluation, transformations vs. actions, shuffle partitions, join strategies (broadcast vs. sort-merge join), and the Catalyst query optimizer.
- **Files to Inspect:** Jupyter notebooks in `05-batch-processing/code/`.

### Module 6: Stream Processing (`06-streaming/`)
- **Key Concepts:** Event streams, Kafka brokers, topics, partitions, consumer groups, exactly-once vs. at-least-once semantics, and windowed aggregations.
- **Files to Inspect:** Python producer and consumer scripts in `06-streaming/python/`.

---

## 6. How to Study Safely Offline
- **Read the Code and Architectural Patterns:** The code scripts, Dockerfiles, Terraform configs, and dbt models are self-documenting. You can trace how data moves through each stage without spinning up cloud accounts.
- **Local Practice:** Run Python transformations and SQL queries locally using SQLite or local PostgreSQL before attempting cloud deployments.

---

## 7. Common Difficulties for Beginners
- **Confusing ETL with ELT:** Traditional ETL transformed data before loading it into storage. Modern data engineering loads raw data into cloud object storage first (Data Lake), then uses tools like dbt to transform it in place inside the analytical warehouse (ELT).
- **Overlooking Idempotency:** A pipeline must be idempotent: running the exact same pipeline twice for the same date must produce the exact same result without duplicate rows. Always use deterministic partition replacements or staging tables.

---

## 8. Companion Materials in this Library
- [`dbt-Jaffle-Shop-Guide.md`](file:///D:/Learning/Data-Engineering/ETL-ELT/Notes/dbt-Jaffle-Shop-Guide.md) — Hands-on dbt project architecture.
- [`Spark-Architecture-Guide.md`](file:///D:/Learning/Data-Engineering/Spark/Resources/Spark-Architecture-Guide.md) — Deep dive into Spark internals.
- [`Airflow-Architecture-Guide.md`](file:///D:/Learning/Data-Engineering/Airflow/Resources/Airflow-Architecture-Guide.md) — Workflow orchestration fundamentals.
- [`MapReduce-Reading-Guide.md`](file:///D:/Learning/Data-Engineering/Streaming/Notes/MapReduce-Reading-Guide.md) — Foundational distributed computing paper.
- [`Data-Engineering-Books.md`](file:///D:/Learning/Data-Engineering/Fundamentals/Resources/Data-Engineering-Books.md) — Recommended textbooks with ISBNs.
