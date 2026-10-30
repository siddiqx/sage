# Sage — Autonomous Offline Learning & Engineering Platform

A curated, self-contained offline learning curriculum and reference library across 10 core computer science and engineering disciplines.

Designed for deep, distraction-free study from foundational theory to production mastery.

---

## Quick Start

Open **[`START-HERE.html`](START-HERE.html)** in any modern web browser to access the interactive curriculum dashboard, offline documentation portals, study guides, textbooks, and practice labs.

```powershell
# Open the dashboard in your default browser
Start-Process "START-HERE.html"
```

---

## Curriculum Structure

The platform is structured into **10 core disciplines**, each organized sequentially into 4 progression phases:
1. **Phase 1: Foundations** — Core syntax, basic mechanics, schema definitions, and conceptual foundations.
2. **Phase 2: Core Concepts** — Data structures, relational algebra, distributed patterns, and design patterns.
3. **Phase 3: Advanced Topics** — Performance optimization, query tuning, internals, and architecture.
4. **Phase 4: Hands-On Mastery** — Production code, test-driven challenges, and open-source practice.

| Subject | Focus Areas | Key Resources |
|---|---|---|
| **01. Python** | Core syntax, data models, OOP, pytest, automation | Python Documentation, Automate the Boring Stuff, Exercism Track |
| **02. SQL & Databases** | Relational schemas, window functions, B-Trees, MVCC | PostgreSQL 16 Docs, Pagila Database Lab, SQL Optimization |
| **03. Data Engineering** | Dimensional modeling, batch/streaming, dbt, orchestration | Zoomcamp Lab, dbt Jaffle Shop, MapReduce, Spark Guides |
| **04. Cloud & Azure** | Medallion architecture, well-architected framework, security | Azure Architecture Guide, Enterprise Cloud Patterns |
| **05. AI & Automation** | Deep learning, neural networks, LLMs, AI agents | Understanding Deep Learning, Mathematics for ML, ReAct Guide |
| **06. Mathematics** | Calculus, linear algebra, discrete math, probability | Calculus Volumes 1–3, Mathematics Study Guide |
| **07. Computer Science** | Operating systems, concurrency, virtualization, TCP/IP | OSTEP OS Guide, Computer Networks Systems Approach |
| **08. Blockchain & Solidity** | EVM architecture, ERC standards, contract security | Mastering Ethereum, OpenZeppelin Contracts, Security Audits |
| **09. Physics** | Classical mechanics, thermodynamics, oscillations | University Physics Volumes 1–2, Physics Study Guide |
| **10. Software Development** | TypeScript, Git internals, UNIX environment | TypeScript Handbook, 190+ Type Challenges, Pro Git, MIT Missing Semester |

---

## Practice Labs & Submodules

The library includes 6 interactive open-source practice repositories configured as Git submodules:

- **Python:** [Exercism Python Track](https://github.com/exercism/python) (140+ problem-solving exercises)
- **SQL:** [Pagila Sample Database](https://github.com/devrimgunduz/pagila) (PostgreSQL schema and analytical dataset)
- **Data Engineering:** [Data Engineering Zoomcamp](https://github.com/DataTalksClub/data-engineering-zoomcamp) (End-to-end data pipelines)
- **Data Engineering:** [dbt Jaffle Shop](https://github.com/dbt-labs/jaffle_shop) (Production dbt modeling)
- **Blockchain:** [OpenZeppelin Contracts](https://github.com/OpenZeppelin/openzeppelin-contracts) (Audited smart contract libraries)
- **Web Development:** [TypeScript Type Challenges](https://github.com/type-challenges/type-challenges) (190+ type-level puzzles)

### Initializing Practice Labs on New Clones

When cloning this repository, initialize the practice repositories and synchronize their interactive portals:

```bash
git clone --recurse-submodules https://github.com/siddiqx/sage.git
cd sage
python setup_submodules.py
```

---

## Standards & Organization

- **Zero Clutter:** Unnecessary machine-readable build artifacts, redundant markdown files, and duplicate directories have been pruned.
- **Offline Reliability:** All documentation portals, textbook chapters, and guides function completely offline without external internet dependencies.
- **Strict Verification:** All internal cross-links and relative paths in `START-HERE.html` and documentation portals are tested and verified.
