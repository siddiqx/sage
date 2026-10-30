# Operating Systems: Three Easy Pieces (OSTEP) — Curriculum & Reading Guide

> **Authors:** Remzi H. Arpaci-Dusseau and Andrea C. Arpaci-Dusseau (University of Wisconsin-Madison)  
> **Official Web Platform:** [pages.cs.wisc.edu/~remzi/OSTEP/](https://pages.cs.wisc.edu/~remzi/OSTEP/)  
> **Homework & Code Simulations:** [github.com/remzi-arpacidusseau/ostep-homework](https://github.com/remzi-arpacidusseau/ostep-homework)  
> **Lab Projects Repository:** [github.com/remzi-arpacidusseau/ostep-projects](https://github.com/remzi-arpacidusseau/ostep-projects)  
> **Acquisition Policy & Licensing:** The authors provide free, authorized PDF downloads for every individual chapter on their website for student self-study. To respect the authors' explicit copyright policy and protect their commercial print edition, this library maintains this structured study syllabus linking directly to the canonical chapter PDFs rather than generating an unauthorized combined PDF.

---

## 1. Architectural Conceptual Model

The text organizes the vast domain of modern operating systems around three fundamental conceptual abstractions—the "Three Easy Pieces":

```
+------------------------------------------------------------------------+
|                          1. VIRTUALIZATION                             |
|  CPU Virtualization: Processes, Scheduling, Direct Execution           |
|  Memory Virtualization: Address Spaces, Paging, TLBs, Swapping         |
+------------------------------------------------------------------------+
|                           2. CONCURRENCY                               |
|  Threads, Mutex Locks, Condition Variables, Semaphores, Deadlocks      |
+------------------------------------------------------------------------+
|                           3. PERSISTENCE                               |
|  I/O Hardware, Disks & SSDs, File Systems, Crash Consistency, RAID     |
+------------------------------------------------------------------------+
```

---

## 2. Chapter Syllabus & Direct Reading Links

### Introduction
- [Chapter 2: Introduction to Operating Systems](https://pages.cs.wisc.edu/~remzi/OSTEP/intro.pdf) — Virtualizing the CPU and memory, concurrency, persistence, and OS design goals.

---

### Piece 1: Virtualization

#### Part I: CPU Virtualization
| Chapter | Topic & Concepts | Canonical Link |
|---|---|---|
| **Ch. 4** | The Abstraction: The Process | [cpu-intro.pdf](https://pages.cs.wisc.edu/~remzi/OSTEP/cpu-intro.pdf) |
| **Ch. 5** | Interlude: Process API (`fork`, `exec`, `wait`) | [cpu-api.pdf](https://pages.cs.wisc.edu/~remzi/OSTEP/cpu-api.pdf) |
| **Ch. 6** | Mechanism: Limited Direct Execution (User/Kernel modes, syscalls) | [cpu-mechanisms.pdf](https://pages.cs.wisc.edu/~remzi/OSTEP/cpu-mechanisms.pdf) |
| **Ch. 7** | Scheduling: Introduction (FIFO, SJF, STCF, Round Robin) | [cpu-sched.pdf](https://pages.cs.wisc.edu/~remzi/OSTEP/cpu-sched.pdf) |
| **Ch. 8** | Scheduling: Multi-Level Feedback Queue (MLFQ) | [cpu-sched-mlfq.pdf](https://pages.cs.wisc.edu/~remzi/OSTEP/cpu-sched-mlfq.pdf) |
| **Ch. 9** | Scheduling: Proportional Share (Lottery & Stride Scheduling) | [cpu-sched-lottery.pdf](https://pages.cs.wisc.edu/~remzi/OSTEP/cpu-sched-lottery.pdf) |
| **Ch. 10** | Multiprocessor Scheduling (Cache affinity, SQMS vs. MQMS) | [cpu-sched-multi.pdf](https://pages.cs.wisc.edu/~remzi/OSTEP/cpu-sched-multi.pdf) |

#### Part II: Memory Virtualization
| Chapter | Topic & Concepts | Canonical Link |
|---|---|---|
| **Ch. 13** | The Abstraction: Address Spaces | [vm-intro.pdf](https://pages.cs.wisc.edu/~remzi/OSTEP/vm-intro.pdf) |
| **Ch. 14** | Interlude: Memory API (`malloc`, `free`, memory leaks, segfaults) | [vm-api.pdf](https://pages.cs.wisc.edu/~remzi/OSTEP/vm-api.pdf) |
| **Ch. 15** | Mechanism: Address Translation (Base and Bounds registers) | [vm-mechanism.pdf](https://pages.cs.wisc.edu/~remzi/OSTEP/vm-mechanism.pdf) |
| **Ch. 16** | Segmentation (Internal vs. external fragmentation) | [vm-segmentation.pdf](https://pages.cs.wisc.edu/~remzi/OSTEP/vm-segmentation.pdf) |
| **Ch. 17** | Free-Space Management (Splitting, coalescing, best-fit, first-fit) | [vm-freespace.pdf](https://pages.cs.wisc.edu/~remzi/OSTEP/vm-freespace.pdf) |
| **Ch. 18** | Paging: Introduction (Page tables, VPN to PFN translation) | [vm-paging.pdf](https://pages.cs.wisc.edu/~remzi/OSTEP/vm-paging.pdf) |
| **Ch. 19** | Paging: Faster Translations (TLBs, hit rates, hardware vs. OS refill) | [vm-tlbs.pdf](https://pages.cs.wisc.edu/~remzi/OSTEP/vm-tlbs.pdf) |
| **Ch. 20** | Paging: Smaller Tables (Multi-level page tables, inverted tables) | [vm-smalltables.pdf](https://pages.cs.wisc.edu/~remzi/OSTEP/vm-smalltables.pdf) |
| **Ch. 21** | Beyond Physical Memory: Mechanisms (Swap space, page faults) | [vm-beyondphys.pdf](https://pages.cs.wisc.edu/~remzi/OSTEP/vm-beyondphys.pdf) |
| **Ch. 22** | Beyond Physical Memory: Policies (FIFO, Random, LRU, Clock algorithm) | [vm-beyondphys-policy.pdf](https://pages.cs.wisc.edu/~remzi/OSTEP/vm-beyondphys-policy.pdf) |
| **Ch. 23** | Complete Virtual Memory Systems (VAX/VMS and Linux VM) | [vm-complete.pdf](https://pages.cs.wisc.edu/~remzi/OSTEP/vm-complete.pdf) |

---

### Piece 2: Concurrency

| Chapter | Topic & Concepts | Canonical Link |
|---|---|---|
| **Ch. 26** | Concurrency: An Introduction (Shared state, race conditions) | [threads-intro.pdf](https://pages.cs.wisc.edu/~remzi/OSTEP/threads-intro.pdf) |
| **Ch. 27** | Interlude: Thread API (`pthread_create`, `pthread_join`) | [threads-api.pdf](https://pages.cs.wisc.edu/~remzi/OSTEP/threads-api.pdf) |
| **Ch. 28** | Locks (Test-and-set, compare-and-swap, spinlocks, ticket locks) | [threads-locks.pdf](https://pages.cs.wisc.edu/~remzi/OSTEP/threads-locks.pdf) |
| **Ch. 29** | Locked Data Structures (Concurrent counters, linked lists, queues, hash tables) | [threads-locks-usage.pdf](https://pages.cs.wisc.edu/~remzi/OSTEP/threads-locks-usage.pdf) |
| **Ch. 30** | Condition Variables (`wait`, `signal`, producer/consumer queue) | [threads-cv.pdf](https://pages.cs.wisc.edu/~remzi/OSTEP/threads-cv.pdf) |
| **Ch. 31** | Semaphores (Binary semaphores, counting semaphores, reader-writer lock) | [threads-sema.pdf](https://pages.cs.wisc.edu/~remzi/OSTEP/threads-sema.pdf) |
| **Ch. 32** | Common Concurrency Bugs (Non-deadlock bugs, deadlock conditions & prevention) | [threads-bugs.pdf](https://pages.cs.wisc.edu/~remzi/OSTEP/threads-bugs.pdf) |
| **Ch. 33** | Event-based Concurrency (`select`, `epoll`, asynchronous I/O) | [threads-events.pdf](https://pages.cs.wisc.edu/~remzi/OSTEP/threads-events.pdf) |

---

### Piece 3: Persistence

| Chapter | Topic & Concepts | Canonical Link |
|---|---|---|
| **Ch. 36** | I/O Devices (Canonical device interface, polling vs. interrupts, DMA) | [file-devices.pdf](https://pages.cs.wisc.edu/~remzi/OSTEP/file-devices.pdf) |
| **Ch. 37** | Hard Disk Drives (Seek time, rotational latency, track skew) | [file-disks.pdf](https://pages.cs.wisc.edu/~remzi/OSTEP/file-disks.pdf) |
| **Ch. 38** | Redundant Arrays of Inexpensive Disks (RAID 0, 1, 4, 5 parity) | [file-raid.pdf](https://pages.cs.wisc.edu/~remzi/OSTEP/file-raid.pdf) |
| **Ch. 39** | Interlude: Files and Directories (`open`, `read`, `write`, `fsync`, `stat`) | [file-intro.pdf](https://pages.cs.wisc.edu/~remzi/OSTEP/file-intro.pdf) |
| **Ch. 40** | File System Implementation (Inodes, data blocks, indirect pointers) | [file-implementation.pdf](https://pages.cs.wisc.edu/~remzi/OSTEP/file-implementation.pdf) |
| **Ch. 41** | Locality and The Fast File System (FFS cylinder groups) | [file-ffs.pdf](https://pages.cs.wisc.edu/~remzi/OSTEP/file-ffs.pdf) |
| **Ch. 42** | Crash Consistency: FSCK and Journaling (Write-ahead logging) | [file-journaling.pdf](https://pages.cs.wisc.edu/~remzi/OSTEP/file-journaling.pdf) |
| **Ch. 43** | Log-Structured File Systems (LFS garbage collection and checkpoints) | [file-lfs.pdf](https://pages.cs.wisc.edu/~remzi/OSTEP/file-lfs.pdf) |
| **Ch. 44** | Flash-based SSDs (Flash translation layer FTL, wear leveling) | [file-ssd.pdf](https://pages.cs.wisc.edu/~remzi/OSTEP/file-ssd.pdf) |
| **Ch. 48** | Distributed Systems (RPC, failure models, network file system NFS) | [dist-intro.pdf](https://pages.cs.wisc.edu/~remzi/OSTEP/dist-intro.pdf) |

---

## 3. Recommended Practical Study Plan

1. **Virtualization Deep Dive (Weeks 1–3):** Complete Chapters 4–8 (Processes and scheduling) and Chapters 13–20 (Address spaces and multi-level paging). Run the Python simulator scripts in the `ostep-homework` repository to observe TLB miss costs and page replacement behavior.
2. **Concurrency Mastery (Weeks 4–6):** Read Chapters 26–32. Implement synchronization primitives in C using POSIX pthreads. Build a bounded buffer producer-consumer queue using condition variables and semaphores.
3. **Storage & Systems (Weeks 7–8):** Read Chapters 38–43. Study journaling mechanisms and write-ahead logs, directly connecting to the durability guarantees ($D$ in ACID) covered in `D:\Learning\Databases\PostgreSQL\PDFs\PostgreSQL-16-Documentation.pdf`.
