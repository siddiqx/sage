# Python Programming Study & Practice Guide

This guide brings together the official documentation navigation strategy, hands-on coding practice through Exercism, and recommended learning pathways into one coherent reference.

---

## 1. Official Documentation & Offline Reference

The complete official Python 3.14 documentation is available locally for offline browsing:
- **Location:** [`Documentation/`](Documentation/)
- **Starting Page:** Double-click [`Documentation/index.html`](Documentation/index.html) to open the home page in Edge, Chrome, or Firefox.
- **Search:** The offline documentation includes an embedded search bar (powered by JavaScript) that works completely offline.
- **Alphabetical Index:** Open [`Documentation/genindex.html`](Documentation/genindex.html) to look up any function, class, method, or exception.

### Key Sections to Study
1. **The Python Tutorial (`Documentation/tutorial/index.html`):**
   - Section 3: Informal Introduction (numbers, strings, lists).
   - Section 4: Control Flow (`for`, `range`, `match`/`case`, functions).
   - Section 5: Data Structures (list comprehensions, tuples, sets, dicts).
   - Section 9: Classes & OOP (inheritance, iterators, generators).
2. **The Standard Library (`Documentation/library/index.html`):**
   - Essential modules: `pathlib`, `collections`, `itertools`, `json`, `csv`, `dataclasses`.
3. **The Language Reference (`Documentation/reference/index.html`):**
   - Section 3: *Data Model* (dunder methods `__getitem__`, `__iter__`, `__enter__`, `__exit__`).

---

## 2. Hands-on Practice Track: Exercism

The Exercism Python Track is located in [`Practice/Exercism-Python-Track/`](Practice/Exercism-Python-Track/).

### How to Progress Through the Exercises
1. **Concept Exercises (`Practice/Exercism-Python-Track/exercises/concept/`):**
   - Start here. Read `.docs/introduction.md` in each folder, review `.docs/instructions.md`, and write your solution in `<exercise_name>.py`.
   - Recommended order:
     1. `guidos-gorgeous-lasagna` — Functions and docstrings.
     2. `ghost-gobble-arcade-game` — Boolean logic.
     3. `card-games` — Lists and indexing.
     4. `chaitanas-colossal-coaster` — List mutation (`append`, `pop`).
     5. `tisbury-treasure-hunt` — Tuples and unpacking.
     6. `inventory-management` — Dictionaries.
     7. `cater-waiter` — Sets and uniqueness.
     8. `ellens-alien-game` — Classes and methods.
2. **Practice Exercises (`Practice/Exercism-Python-Track/exercises/practice/`):**
   - Solve standalone challenges: `two-fer`, `raindrops`, `leap`, `pangram`, `isogram`, and `word-count`.
3. **Files to Ignore:**
   - Ignore `.github/`, `bin/`, and `.meta/` directories; these are upstream CI automation files.

---

## 3. Recommended Study Order
- **Phase 1 (Weeks 1–2):** Official Tutorial + Exercism Concept Exercises (1–5).
- **Phase 2 (Weeks 3–4):** Study [`Automate-the-Boring-Stuff.md`](Automate-the-Boring-Stuff.md) for filesystem and string scripting.
- **Phase 3 (Weeks 5–6):** Standard Library deep dive (`collections`, `itertools`, `pathlib`) + Exercism Practice Exercises.
- **Phase 4 (Weeks 7+):** Python Data Model (`Documentation/reference/datamodel.html`).
