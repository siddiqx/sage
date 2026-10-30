# Distributed Computing & Orchestration: Apache Spark & Airflow

This guide synthesizes large-scale distributed batch compute (Apache Spark) and automated workflow orchestration (Apache Airflow) into a unified systems architecture reference.

---

## 1. Apache Spark: In-Memory Distributed Computing

Apache Spark is a unified analytics engine for large-scale distributed data processing. It replaces MapReduce's disk-bound intermediate writes with in-memory Directed Acyclic Graph (DAG) execution.

```
[Driver Program: SparkSession]
          │
          ├── (Cluster Manager: K8s / YARN / Standalone)
          │
          ├── Executor 1 (Worker Node): Task 1, Task 2 (Memory + Disk Cache)
          └── Executor 2 (Worker Node): Task 3, Task 4 (Memory + Disk Cache)
```

### Core Execution Concepts
1. **Transformations vs. Actions:**
   - **Transformations (Lazy):** `map()`, `filter()`, `select()`, `groupBy()`. Spark builds an execution plan but does not compute data until an action is called.
   - **Actions (Eager):** `count()`, `collect()`, `write()`, `show()`. Triggers computation across the cluster.
2. **Narrow vs. Wide Dependencies (The Shuffle):**
   - **Narrow (Fast, In-Memory):** Each partition of the parent RDD is used by at most one partition of the child RDD (e.g., `map()`, `filter()`). Executed in a single pipelined stage.
   - **Wide (High I/O, Network Shuffle):** Multiple child partitions depend on data across all parent partitions (e.g., `groupByKey()`, `join()`). Requires writing partition files to disk and transferring data over the network switches.

### The Spark Optimization Engines
- **Catalyst Optimizer:** Analyzes DataFrame relational trees and applies:
  - *Predicate Pushdown:* Pushes `WHERE` filters directly down to Parquet/ORC file readers before data is loaded into memory.
  - *Column Pruning:* Loads only referenced columns from columnar storage.
  - *Join Reordering:* Chooses Broadcast Hash Joins over Sort-Merge Joins when one table fits in executor memory.
- **Project Tungsten:**
  - Off-heap binary memory management (avoids Java Garbage Collection overhead).
  - Whole-Stage Code Generation (compiles multi-operator query plans into single optimized bytecode loops).

---

## 2. Apache Airflow: Workflow Orchestration & Scheduling

Apache Airflow is a platform to author, schedule, and monitor workflows programmatically as Directed Acyclic Graphs (DAGs).

```
[Webserver UI] <─── [Metadata Database: PostgreSQL] ───> [Scheduler]
                                                               │
                                                               ▼
                                                      [Executor: Celery / K8s]
                                                               │
                                                               ▼
                                                      [Worker Tasks]
```

### Modern TaskFlow API Pattern (`@dag` and `@task`)
Modern Airflow code uses Python decorators to simplify data dependencies and parameter passing:

```python
from datetime import datetime
from airflow.decorators import dag, task

@dag(
    schedule="@daily",
    start_date=datetime(2026, 1, 1),
    catchup=False,
    tags=["etl", "production"]
)
def daily_sales_pipeline():

    @task
    def extract_raw_orders() -> str:
        # Extract data to cloud object storage; return staging URI
        return "s3://landing-bucket/orders_2026_10_29.parquet"

    @task
    def transform_orders(landing_uri: str) -> str:
        # Run transformations via Spark or dbt
        return "s3://processed-bucket/orders_clean.parquet"

    @task
    def load_warehouse(processed_uri: str):
        # Load conformed data into Snowflake or BigQuery
        print(f"Loading {processed_uri} into analytics warehouse")

    raw_data = extract_raw_orders()
    clean_data = transform_orders(raw_data)
    load_warehouse(clean_data)

daily_sales_pipeline()
```

### Key Orchestration Invariants
1. **Idempotency:** Re-running a DAG run for `logical_date = 2026-10-29` must produce the exact same final warehouse state without duplicate records.
2. **Lightweight DAG Parsing:** Never write network requests, database connections, or heavy Python computations at the top level of a DAG file. The Airflow Scheduler parses DAG files continuously every few seconds; top-level work causes CPU starvation. Place all actual work inside `@task` functions or operators.

---

## 3. Practice & Course Links
- Practice hands-on Spark and orchestration DAGs in [`Practice/Data-Engineering-Zoomcamp/`](Practice/Data-Engineering-Zoomcamp/).
- Read the foundation paper: [`MapReduce-Simplified-Data-Processing.pdf`](MapReduce-Simplified-Data-Processing.pdf) and [`MapReduce-Reading-Guide.md`](MapReduce-Reading-Guide.md).
- Analytics engineering modeling: [`dbt-Jaffle-Shop-Guide.md`](dbt-Jaffle-Shop-Guide.md).
