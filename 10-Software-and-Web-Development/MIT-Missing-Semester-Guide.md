# MIT The Missing Semester of Your CS Education: Guide & Syllabus

> **Instructors:** Anish Athalye, Jon Gjengset, and Jose Javier Gonzalez Ortiz  
> **Institution:** Massachusetts Institute of Technology (MIT CSAIL)  
> **Course Website:** [missing.csail.mit.edu](https://missing.csail.mit.edu/)  
> **Lecture Recordings:** [YouTube: MIT The Missing Semester](https://www.youtube.com/playlist?list=PLyzOVJj3bHQuloKGG59rS43e29ro7I56J)  
> **License:** Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International ([CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/))  
> **Curatorial Context:** CS curriculums focus extensively on algorithms, discrete math, and formal theories while often omitting the practical toolchain required to build software effectively. This guide synthesizes the practical engineering competencies taught in MIT's acclaimed course.

---

## 1. Toolchain Hierarchy

```
+------------------------------------------------------------------------+
|                          ENVIRONMENT & WORKFLOW                        |
|        Dotfiles | SSH Remote Work | Terminal Multiplexers (tmux)       |
+------------------------------------------------------------------------+
|                            CODE & DATA WRANGLING                       |
|         Vim / Neovim | Regex | Stream Editors (sed, awk, jq)           |
+------------------------------------------------------------------------+
|                            PIPELINES & AUTOMATION                      |
|            Bash Scripting | Shell Pipes & Redirections | xargs         |
+------------------------------------------------------------------------+
|                          INSPECTION & OPTIMIZATION                     |
|           Git Internals | Profilers (Flamegraphs) | GDB / strace       |
+------------------------------------------------------------------------+
```

---

## 2. Lecture Breakdown & Practical Competencies

### Lecture 1: Course Overview + The Shell
- **URL:** [missing.csail.mit.edu/2020/course-shell/](https://missing.csail.mit.edu/2020/course-shell/)
- **Core Concepts:**
  - Standard streams: `stdin` (0), `stdout` (1), `stderr` (2).
  - Stream redirection: `>`, `>>`, `2>`, `&>`, and `<`.
  - Pipelines: composing small, single-purpose UNIX utilities via `|`.
  - Filesystem permissions: User/Group/Other, read/write/execute bits (`chmod`, `chown`).
  - Environment variables: `$PATH`, export mechanics, shell initialization files (`.bashrc`, `.zshrc`).

### Lecture 2: Shell Tools and Scripting
- **URL:** [missing.csail.mit.edu/2020/shell-tools/](https://missing.csail.mit.edu/2020/shell-tools/)
- **Core Concepts:**
  - Shell scripting: shebang (`#!/usr/bin/env bash`), exit codes (`$?`, `set -euo pipefail`).
  - Special variables: `$0` (script name), `$1`–`$9` (args), `$@` (all args), `$#` (arg count).
  - Globbing and pattern matching: `*`, `?`, `{a,b,c}` expansion.
  - Search tools: `find` vs. modern `fd`, `grep` vs. modern `ripgrep` (`rg`).
  - Pipeline execution: passing filenames safely with `find -print0 | xargs -0`.
  - Interactive history and fuzzy finding: `fzf`, `history`, `Ctrl+R`.

### Lecture 3: Editors (Vim)
- **URL:** [missing.csail.mit.edu/2020/editors/](https://missing.csail.mit.edu/2020/editors/)
- **Core Concepts:**
  - Modal editing philosophy: Normal, Insert, Visual, Visual Block, and Command-line modes.
  - Grammar of editing: `[operator][count][motion]` (e.g., `d3w` = delete 3 words, `ci"` = change inside quotes).
  - Buffers, windows, and tabs.
  - Registers, persistent undo, macros (`q[reg]...q` and `@[reg]`), and configuration.

### Lecture 4: Data Wrangling
- **URL:** [missing.csail.mit.edu/2020/data-wrangling/](https://missing.csail.mit.edu/2020/data-wrangling/)
- **Core Concepts:**
  - Regular expressions: capture groups, character classes, quantifiers, lookahead/lookbehind.
  - Stream editor `sed`: substitution patterns (`sed -E 's/pattern/replacement/g'`).
  - Record processor `awk`: pattern-action statements, field variables (`$1`, `$2`), custom aggregations.
  - JSON parsing on the CLI: `jq` filters, mapping, and array manipulations.
  - Tabular CLI analysis: `sort`, `uniq -c`, `wc -l`, `cut`, `paste`.

### Lecture 5: Command-line Environment
- **URL:** [missing.csail.mit.edu/2020/command-line/](https://missing.csail.mit.edu/2020/command-line/)
- **Core Concepts:**
  - Job control: foreground, background (`&`), suspending (`Ctrl+Z`), resuming (`fg`, `bg`), jobs list.
  - Signals: `SIGINT` (Ctrl+C), `SIGQUIT` (Ctrl+\), `SIGTSTP` (Ctrl+Z), `SIGKILL` (9), `SIGTERM` (15).
  - Terminal multiplexing with `tmux`: sessions, windows, split panes, detaching and attaching.
  - Dotfiles management: Git tracking, symbolic links (`stow`).
  - SSH: key pairs (ed25519), SSH agent, config files (`~/.ssh/config`), local/remote port forwarding (`-L`, `-R`).

### Lecture 6: Version Control (Git)
- **URL:** [missing.csail.mit.edu/2020/version-control/](https://missing.csail.mit.edu/2020/version-control/)
- **Core Concepts:**
  - Git's data model: Directed Acyclic Graph (DAG) of immutable snapshots.
  - Object store: blobs, trees, commits, and annotated tags addressed by SHA-1/SHA-256 hashes.
  - Working directory vs. Staging area (Index) vs. Repository (`HEAD`).
  - Advanced operations: interactive rebase (`git rebase -i`), cherry-picking, `git bisect` for regression identification, `git reflog` for disaster recovery.

### Lecture 7: Debugging and Profiling
- **URL:** [missing.csail.mit.edu/2020/debugging-profiling/](https://missing.csail.mit.edu/2020/debugging-profiling/)
- **Core Concepts:**
  - Logging levels and system logs: `journalctl`, `dmesg`.
  - Interactive debuggers: `gdb`, `lldb`, Python `pdb` / `ipdb` breakpoints.
  - System call inspection: `strace` (tracing kernel interactions), `lsof` (list open files and sockets).
  - CPU profiling: sampling profilers, call graphs, and flamegraphs (`perf`, Python `cProfile`).
  - Memory profiling: tracking leaks and allocations (`valgrind`, `heaptrack`).

### Lecture 8: Metaprogramming & Build Systems
- **URL:** [missing.csail.mit.edu/2020/metaprogramming/](https://missing.csail.mit.edu/2020/metaprogramming/)
- **Core Concepts:**
  - Dependency-based build execution: Makefiles (`target: prerequisites ; recipe`), CMake.
  - Continuous integration: automated linting, test execution, and deployment pipelines (GitHub Actions).

### Lecture 9: Security and Cryptography
- **URL:** [missing.csail.mit.edu/2020/security-and-cryptography/](https://missing.csail.mit.edu/2020/security-and-cryptography/)
- **Core Concepts:**
  - Symmetric encryption (AES) vs. Asymmetric encryption (RSA, ECC).
  - Cryptographic hash functions: collision resistance, preimage resistance (SHA-256).
  - Key derivation functions (PBKDF2, Argon2) and password hashing with salt.
  - Digital signatures and Public Key Infrastructure (PKI, X.509, TLS certificates).

---

## 3. Library Integration & Practice Plan

1. **Terminal Fluency:** Practice shell pipelines using the datasets in `D:\Learning\Databases\PostgreSQL\Resources\Pagila-Sample-Database\`. Use `grep`, `awk`, and `sed` to filter CSV/SQL dumps directly on the command line.
2. **Git DAG Internals:** Read `D:\Learning\Software-Engineering\PDFs\Pro-Git-2nd-Edition.pdf` Chapter 10 (Git Internals) in parallel with Lecture 6 to inspect `.git/objects/` directly.
3. **Reproducible Tooling:** Maintain automated dotfiles and scripting best practices across all software development workflows in this library.
