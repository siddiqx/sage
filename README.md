# Sage — Personal Knowledge Website

> **A permanent personal knowledge website and technical reference system across 11 engineering disciplines.**

Sage delivers structured, accurate, and comprehensive educational content directly on the website—eliminating the need to dig through raw PDF textbooks, disjointed Markdown files, or scattered repositories.

Designed for distraction-free study alongside YouTube lectures and real-world coding.

---

## 🧭 Quick Start

Open **[`index.html`](index.html)** or **[`START-HERE.html`](START-HERE.html)** in any modern web browser:

```powershell
# Open directly in your default browser (100% offline, zero dependencies)
Start-Process "index.html"
```

Or run via an optional lightweight local web server:

```bash
python -m http.server 8000
# Open http://localhost:8000 in your browser
```

---

## 🏛️ Architecture & Content Organization

Sage organizes knowledge into a strict, navigable hierarchy:

$$\text{Subject} \longrightarrow \text{Module} \longrightarrow \text{Topic} \longrightarrow \text{Subtopic}$$

### Standard Topic Knowledge Contract
Every educational topic page is complete and self-contained, featuring:

1. **A. Overview:** Concise, accurate conceptual definition and architectural mental model.
2. **B. Key Terminology:** Technical dictionary of keywords, opcodes, algorithms, and concepts.
3. **C. In-Depth Explanation:** Progressive pedagogical explanation from foundational mechanics to advanced internals.
4. **D. Syntax & Structure:** Exact syntax patterns with breakdown tables of each component.
5. **E. Code Examples:** Complete, runnable programs with real terminal outputs and line-by-line execution walkthroughs.
6. **F. Important Notes:** Practical rules, edge cases, and performance limitations.
7. **G. Common Mistakes:** Frequent misconceptions showing side-by-side **Incorrect vs. Correct** code diffs and why they fail.
8. **H. Concept Comparisons:** Side-by-side evaluation tables comparing related paradigms.
9. **I. Test Your Knowledge:** Interactive Q&A accordions testing comprehension with hidden answers and explanations.
10. **J. Practice Exercises:** Graded problems (Beginner / Intermediate / Advanced) with hidden verified solutions.
11. **K. Supplementary References:** Curated links to official documentation and recommended YouTube lectures.

---

## 📚 Core Disciplines & Priority Curricula

| Subject | Modules Covered | Status |
|---|---|---|
| **🐍 Python** | Foundations, Data Structures, Functions & Comprehensions, Robust I/O, OOP, Advanced Python (19 Topics) | **Complete & In-Depth** |
| **🗄️ SQL & Databases** | Foundations, Querying, Aggregations, Joins, Subqueries & CTEs, Window Functions, Constraints, Indexes, Transactions & MVCC, Postgres Internals (10 Topics) | **Complete & In-Depth** |
| **⚡ Data Engineering** | Pipelines, ETL/ELT Paradigms, Medallion Lakehouses, Star Schemas, Columnar Storage | **Foundations Active** |
| **☁️ Cloud Computing** | Azure Core Services, IaaS vs PaaS vs Serverless, Availability Zones, Shared Responsibility | **Foundations Active** |
| **🧠 AI & Machine Learning** | Loss Functions, Gradient Descent Optimization, Backpropagation, Neural Networks | **Foundations Active** |
| **🤖 AI Automation** | Autonomous Agents, ReAct Loops, Tool Calling Schemas, Model Context Protocol (MCP) | **Foundations Active** |
| **📐 Mathematics** | Linear Algebra, Vector Spaces, Dot Products, Matrices, Eigenvalues & Eigenvectors | **Foundations Active** |
| **💻 Computer Science** | Operating Systems, Virtual Memory Paging, Context Switches, Mutexes & Concurrency | **Foundations Active** |
| **⛓️ Blockchain** | Ethereum Virtual Machine (EVM), Gas Mechanics, Solidity Contracts, Reentrancy Security | **Foundations Active** |
| **⚛️ Physics** | Classical Mechanics, Newton's Laws, Work-Energy Theorem, Conservative Forces | **Foundations Active** |
| **🛠️ Software Development** | TypeScript Generics, Generic Constraints (`extends`), Mapped Types, Clean Architecture | **Foundations Active** |

---

## ⚡ Learning Features

- **Global Full-Text Search (`Ctrl+K` / `/`):** Instant fuzzy search across subjects, topics, definitions, and terminology.
- **Bookmarks System:** Save any topic with 1-click for rapid revision (persisted in browser local storage).
- **Mastery Tracking:** Checkbox tracking to monitor reading and study progress across subjects.
- **Dark & Light Modes:** Seamless theme switching with smooth transitions and persistent state.
- **On-This-Page Table of Contents:** Scroll-spy navigation linking to individual topic sections.
- **Zero Build Tool Overhead:** Pure modular JavaScript with zero `npm` dependency chains, guaranteed to open cleanly via `file:///` without CORS errors.

---

## 📜 Repository Structure

```text
D:\Learning\
├── index.html                  # Main application entry point
├── START-HERE.html             # Local Windows entry point (identical mirror)
├── README.md                   # Platform documentation
├── MANIFEST.jsonl              # Resource catalog
│
├── assets/
│   ├── css/
│   │   ├── main.css            # Design tokens, typography, dark/light themes
│   │   └── components.css      # Sidebar, cards, code blocks, accordions, search modal
│   └── js/
│       ├── app.js              # State manager (localStorage, themes, bookmarks)
│       ├── search.js           # Client-side full-text search engine
│       ├── render.js           # Reusable UI component renderers
│       └── router.js           # Hash-based routing (#/subject/topic)
│
├── data/
│   ├── subjects.js             # 11 subject definitions and taxonomy
│   ├── python/                 # 19 in-depth topic modules (01 to 19)
│   ├── sql/                    # 10 in-depth topic modules (01 to 10)
│   └── curricula.js            # Curricula for remaining 9 disciplines
│
└── [Subject Archive Folders]   # Preserved reference textbooks and offline materials
```
