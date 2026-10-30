# Azure & Modern Cloud Architecture Guide

This guide covers cloud infrastructure fundamentals (AZ-900 baseline) and the modern evolution of enterprise cloud data platforms (Microsoft Fabric, OneLake, and the Medallion Architecture).

---

## 1. Cloud Infrastructure Foundations (AZ-900)

### Cloud Service Models
- **IaaS (Infrastructure as a Service):** Cloud provider manages physical hardware, cooling, and virtualization. You manage OS, patches, networking, and applications (e.g., Azure Virtual Machines).
- **PaaS (Platform as a Service):** Cloud provider manages OS, patching, and runtime environment. You manage application code and data (e.g., Azure App Service, Azure SQL Database).
- **SaaS (Software as a Service):** Cloud provider manages everything. You consume the software via browser or API (e.g., Microsoft 365, Power BI).

### Resiliency & Availability Hierarchy
```
Azure Geography (e.g., United States)
  └── Regional Pair (e.g., East US <--> West US: 300+ miles apart for disaster recovery)
        └── Region (Latency-defined perimeter with interconnected datacenters)
              └── Availability Zones (Physically separate datacenters with independent power/cooling)
```

- **Service Level Agreements (SLAs):** Financial guarantees of uptime (e.g., 99.9% = 8.76 hours downtime/year; 99.99% = 52.6 minutes downtime/year). Combining services in series multiplies their availabilities ($0.999 \times 0.999 = 0.998$).

---

## 2. Modern Enterprise Cloud Data Architecture: Microsoft Fabric

### Evolution Beyond Legacy Cloud Data (Retired DP-203 $\rightarrow$ Modern Fabric DP-600)
Traditional cloud data architectures required provisioning multiple disjoint services:
- Azure Synapse Analytics (Dedicated SQL Pools)
- Azure Data Factory (Pipelines & Integration Runtimes)
- Azure Databricks (Spark compute clusters)
- Azure Data Lake Storage Gen2 (Hierarchical object storage)

This created duplicate storage, siloed security models, and high operational overhead.

### The Unified OneLake Paradigm
Microsoft Fabric introduces **OneLake**—a single, unified SaaS data lake for an entire organization ("the OneDrive for data"):
1. **Single Copy of Data:** All compute engines (Fabric Spark, Fabric SQL Analytics Endpoint, Power BI Direct Lake) query the exact same files stored in OneLake without copying or moving data.
2. **Open Format (Delta Parquet):** All tables in OneLake are stored in open **Delta Lake** (columnar Parquet files accompanied by a JSON transaction log providing ACID guarantees).
3. **Direct Lake Mode:** Power BI queries OneLake Delta Parquet files directly in memory without importing data or translating DAX to slow SQL queries.

---

## 3. The Medallion Architecture (Bronze $\rightarrow$ Silver $\rightarrow$ Gold)

```
[Raw Sources: APIs, DBs] ──> [Bronze Layer (Raw Ingestion)]
                                        │
                                        ▼ (Clean, Deduplicate, Standardize)
                             [Silver Layer (Enriched & Conformed)]
                                        │
                                        ▼ (Aggregate, Star Schema, Business KPIs)
                             [Gold Layer (Marts & Power BI Direct Lake)]
```

1. **Bronze (Raw Zone):** Exact append-only replica of raw source data preserved in its original format with ingestion timestamps.
2. **Silver (Cleansed Zone):** Cleaned, filtered, deduplicated, and conformed data. Schema validation is enforced, types are cast, and nulls are handled.
3. **Gold (Curated Business Zone):** Dimensional star schemas (Fact and Dimension tables) ready for business intelligence consumption and reporting.

---

## 4. Recommended Study Sequence
1. **Infrastructure Fundamentals:** Master Azure regions, Availability Zones, RBAC (Role-Based Access Control), and cost governance (Tags, Budgets, Reservations).
2. **Analytical Storage:** Study Parquet and Delta Lake transaction logs.
3. **Unified Pipelines:** Learn how OneLake shortcuts connect external data (AWS S3, Google Cloud Storage) into unified analytical workspaces.
