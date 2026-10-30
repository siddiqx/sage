# Automate the Boring Stuff with Python: Practical Study Guide & Curriculum

**Catalog Path:** `D:\Learning\Programming\Python\Notes\Automate-the-Boring-Stuff-Study-Guide.md`  
**Target Book:** *Automate the Boring Stuff with Python* (2nd Edition) by Al Sweigart (No Starch Press)  
**Canonical Online Resource:** [automatetheboringstuff.com](https://automatetheboringstuff.com/)  
**License Notice:** The complete text is provided free for online personal reading under Creative Commons Attribution-NonCommercial-ShareAlike 3.0 (CC BY-NC-SA 3.0). To respect publisher copyright, standalone PDF downloads are not distributed; this guide provides a structured learning syllabus linking directly to the canonical web chapters.

---

## 1. Curriculum Overview & Learning Philosophy

While traditional computer science curricula emphasize abstract data structures and algorithm proofs, *Automate the Boring Stuff with Python* focuses entirely on practical utility: writing small, pragmatic scripts that eliminate repetitive digital labor.

### Target Prerequisites
* Basic familiarity with using an operating system (navigating directories, opening a command terminal).
* No prior programming experience required.
* Python 3.10+ runtime installed.

---

## 2. Structured Learning Roadmap

```
Phase 1: Language Primitives (Chapters 1–6)
   └── Variables, Flow Control, Functions, Lists, Dictionaries, String Manipulation
Phase 2: Text Processing & Verification (Chapters 7–8)
   └── Regular Expressions (Pattern Matching) & PyInputPlus (Input Validation)
Phase 3: System Automation & File Management (Chapters 9–11)
   └── pathlib/os Operations, zipfile Compression, shutil, Logging & Assertions
Phase 4: Document & Data Extraction (Chapters 12–16)
   └── Web Scraping (requests/bs4), Excel (openpyxl), CSV, JSON, PDF, Word
Phase 5: Task Orchestration & GUI Control (Chapters 17–20)
   └── time/datetime Scheduling, SMTP Email Alerts, PyAutoGUI Automation
```

---

## 3. Chapter-by-Chapter Syllabus with Canonical Links & Practical Exercises

### Part I: Python Programming Basics

#### [Chapter 1: Python Basics](https://automatetheboringstuff.com/2e/chapter1/)
* **Concepts:** Expressions, integer and float arithmetic, string concatenation, variable assignment, and standard I/O (`print()`, `input()`, `len()`).
* **Practical Exercise:** Write a command-line script that calculates age in days and predicts retirement countdowns based on user input.

#### [Chapter 2: Flow Control](https://automatetheboringstuff.com/2e/chapter2/)
* **Concepts:** Boolean operators (`and`, `or`, `not`), comparison operators, `if`/`elif`/`else` branching, `while` loops, `for` loops with `range()`, and `break`/`continue` loop controls.
* **Practical Exercise:** Implement a guess-the-number game with randomized targets and attempt limits.

#### [Chapter 3: Functions](https://automatetheboringstuff.com/2e/chapter3/)
* **Concepts:** Defining custom functions with `def`, return values, the `None` object, keyword arguments, local vs. global scope, and `try`/`except` exception handling.
* **Practical Exercise:** Implement the Collatz Sequence generator: write a function `collatz(number)` that returns `number // 2` if even, or `3 * number + 1` if odd, iterating until the sequence reaches 1.

#### [Chapter 4: Lists](https://automatetheboringstuff.com/2e/chapter4/)
* **Concepts:** Indexing, slicing, list iteration, `in`/`not in` operators, multiple assignment, augmented assignment, methods (`append()`, `insert()`, `sort()`), list references, and `copy.deepcopy()`.
* **Practical Exercise:** Write a comma-separator formatter function that accepts any list of strings and formats it into a grammatically correct sentence (`'apples, bananas, and tofu'`).

#### [Chapter 5: Dictionaries and Structuring Data](https://automatetheboringstuff.com/2e/chapter5/)
* **Concepts:** Key-value mappings, `keys()`, `values()`, `items()`, `get()` with fallback defaults, `setdefault()`, and nested data structures.
* **Practical Exercise:** Build a Fantasy Game Inventory tracker with functions to display inventory summaries and update counts from loot drops.

#### [Chapter 6: Manipulating Strings](https://automatetheboringstuff.com/2e/chapter6/)
* **Concepts:** Escape characters, raw strings (`r''`), multiline strings (`'''`), string methods (`upper()`, `lower()`, `isupper()`, `startswith()`, `join()`, `split()`), and string justification (`rjust()`, `ljust()`, `center()`).
* **Practical Exercise:** Build a table printer that takes a list of lists of strings and displays them in a clean, column-aligned grid.

---

### Part II: Automating Practical Tasks

#### [Chapter 7: Pattern Matching with Regular Expressions](https://automatetheboringstuff.com/2e/chapter7/)
* **Concepts:** The `re` module, Regex syntax, character classes, shorthand codes (`\d`, `\w`, `\s`), greedy vs. non-greedy matching, `sub()` for substitution, and verbose regex mode (`re.VERBOSE`).
* **Practical Project:** **Clipboard Phone & Email Extractor:** Create a script that reads clipboard contents (`pyperclip`), identifies all phone numbers and email addresses via regex, and writes formatted matches back to the clipboard.

#### [Chapter 8: Input Validation](https://automatetheboringstuff.com/2e/chapter8/)
* **Concepts:** Building resilient user interfaces with `PyInputPlus` (`inputNum()`, `inputStr()`, `inputYesNo()`), handling timeouts, retry limits, and custom regex validation.
* **Practical Project:** **Automated Sandwich Maker:** Build an interactive ordering prompt that validates ingredients, calculates costs, and handles order confirmations without crashes.

#### [Chapter 9: Reading and Writing Files](https://automatetheboringstuff.com/2e/chapter9/)
* **Concepts:** The modern `pathlib.Path` module, relative vs. absolute paths, creating directories (`Path.mkdir()`), file sizes (`os.path.getsize()`), reading and writing text files, and persistent variable storage via `shelve`.
* **Practical Project:** **Random Quiz Generator:** Create a script that generates 35 distinct randomized geography quiz files and corresponding answer keys for classroom distribution.

#### [Chapter 10: Organizing Files](https://automatetheboringstuff.com/2e/chapter10/)
* **Concepts:** The `shutil` module: copying, moving, renaming, and deleting files and trees. Safe deletion via `send2trash`. Traversing directory trees with `os.walk()`. Creating and reading ZIP archives with `zipfile`.
* **Practical Project:** **Selective Archiver & Backup:** Write a script that walks through a directory hierarchy, locates all files with a specific extension (e.g., `.csv` or `.pdf`), and packages them into a timestamped ZIP archive.

#### [Chapter 11: Debugging](https://automatetheboringstuff.com/2e/chapter11/)
* **Concepts:** Raising custom exceptions, using `assert` statements for sanity checks, configuring the `logging` module (debug, info, warning, error, critical), and interactive breakpoint debugging.
* **Practical Exercise:** Convert an existing script from print-statement debugging to a production logging configuration that logs to both a local file and console.

#### [Chapter 12: Web Scraping](https://automatetheboringstuff.com/2e/chapter12/)
* **Concepts:** Opening browsers via `webbrowser`, fetching HTTP pages with `requests`, inspecting status codes (`raise_for_status()`), parsing HTML via `BeautifulSoup`, and browser automation via `selenium`.
* **Practical Project:** **Automated Documentation Downloader:** Write a scraper that searches an educational index, identifies all article links, and downloads their text locally for offline reading.

#### [Chapter 13: Working with Excel Spreadsheets](https://automatetheboringstuff.com/2e/chapter13/)
* **Concepts:** Reading `.xlsx` documents with `openpyxl`, navigating sheets, columns, and rows, cell objects, formulas, formatting styles, and generating charts.
* **Practical Project:** **Multiplication Table & Census Data Extractor:** Read a 70,000-row census spreadsheet and aggregate total populations and tract counts by county into a structured report.

#### [Chapter 14: Working with Google Sheets](https://automatetheboringstuff.com/2e/chapter14/)
* **Concepts:** Authenticating with Google Drive and Sheets APIs via `ezsheets`, reading and writing cells, downloading sheets in CSV/PDF format.

#### [Chapter 15: Working with PDF and Word Documents](https://automatetheboringstuff.com/2e/chapter15/)
* **Concepts:** Extracting text and metadata with `pypdf`, rotating pages, overlaying watermarks, encrypting/decrypting PDFs, and generating Word `.docx` documents with `python-docx`.
* **Practical Project:** **PDF Watermarking Tool:** Combine an official cover page and transparent watermark over a collection of unformatted documents.

#### [Chapter 16: Working with CSV Files and JSON Data](https://automatetheboringstuff.com/2e/chapter16/)
* **Concepts:** Reading and writing CSVs via `csv.reader` and `csv.writer`, handling delimiters and headers with `csv.DictReader`, and serializing/deserializing API responses with `json.loads()` and `json.dumps()`.
* **Practical Project:** **API Weather & Market Fetcher:** Query a public REST API, extract JSON payloads, and generate clean CSV summary tables.

#### [Chapter 17: Keeping Time, Scheduling Tasks, and Launching Programs](https://automatetheboringstuff.com/2e/chapter17/)
* **Concepts:** The `time` and `datetime` modules, `timedelta` arithmetic, multi-threading with `threading.Thread`, and launching external processes via `subprocess.Popen`.

#### [Chapter 18: Sending Email and Text Messages](https://automatetheboringstuff.com/2e/chapter18/)
* **Concepts:** Sending automated notification emails via `smtplib`, retrieving emails with `imapclient`, and SMS integration with `twilio`.

#### [Chapter 19: Manipulating Images](https://automatetheboringstuff.com/2e/chapter19/)
* **Concepts:** Image processing with Pillow (`PIL`), cropping, resizing, rotating, color adjustments, and batch thumbnail generation.

#### [Chapter 20: Controlling the Keyboard and Mouse with GUI Automation](https://automatetheboringstuff.com/2e/chapter20/)
* **Concepts:** Automating desktop clicks, keystrokes, and form filling using `pyautogui`, image recognition on screen, and safety failsafes (`pyautogui.FAILSAFE`).
