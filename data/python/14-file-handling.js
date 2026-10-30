/**
 * Sage — Python Topic 14: File Handling, Context Managers & Pathlib
 */

(function () {
  'use strict';

  SAGE.registerTopic({
    id: 'py-file-handling',
    title: 'File I/O, Context Managers & Pathlib',
    subject: 'python',
    module: 'Robust Programming & I/O',
    description: 'Modern filesystem operations with pathlib, explicit UTF-8 encodings, context manager mechanics (__enter__/__exit__), and contextlib.',
    difficulty: 'Intermediate',
    readTime: '15 min read',

    overview: {
      definition: 'File handling in modern Python combines object-oriented filesystem paths (`pathlib.Path`), explicit stream encodings (`encoding="utf-8"`), and deterministic resource management via context managers (`with` statements). Context managers guarantee that operating system file descriptors, locks, and network sockets are closed immediately upon block exit, even if unhandled exceptions occur.',
      mentalModel: 'Think of a context manager as an automated security door with an entrance protocol (`__enter__`) and an exit protocol (`__exit__`). Once you step through the door with `with`, the room ensures that when you leave—whether through the exit or by tripping an emergency alarm (exception)—the door firmly locks itself and powers down all connected equipment.'
    },

    terminology: [
      {
        term: 'Context Manager',
        definition: 'An object implementing `__enter__()` and `__exit__()` that manages the setup and teardown lifecycle around a block of code via the `with` statement.'
      },
      {
        term: '`pathlib.Path`',
        definition: 'Modern object-oriented filesystem path library (PEP 428) replacing legacy string-based `os.path` functions.'
      },
      {
        term: 'Encoding Trap (`encoding="utf-8"`)',
        definition: 'On Windows, `open()` historically defaults to legacy code pages (e.g. `cp1252`). Always specify `encoding="utf-8"` to prevent UnicodeDecodeError on international text.'
      },
      {
        term: '`contextlib.contextmanager`',
        definition: 'A utility decorator that turns a generator function into a full context manager using a single `yield` statement.'
      },
      {
        term: 'File Modes (`r`, `w`, `a`, `x`, `b`)',
        definition: '`r`=read, `w`=truncate/write, `a`=append, `x`=exclusive creation (fails if file exists), `b`=binary mode (bytes, no encoding).'
      }
    ],

    explanation: [
      {
        heading: '1. Modern Path Operations: `pathlib` Over `os.path`',
        content: 'Historically, Python used strings and <code>os.path.join(a, b)</code>. Modern Python uses <code>pathlib.Path</code>, which overrides the division operator <code>/</code> to construct paths cleanly across operating systems:<br><ul><li><code>base = Path("data") / "logs" / "app.log"</code></li><li>Convenience methods: <code>base.read_text(encoding="utf-8")</code> and <code>base.write_text("content", encoding="utf-8")</code> handle opening, reading/writing, and closing automatically.</li><li>Searching: <code>list(Path("src").glob("**/*.py"))</code> recursively matches files.</li></ul>'
      },
      {
        heading: '2. The Context Manager Protocol (`__enter__` & `__exit__`)',
        content: 'When you execute <code>with ManagedResource() as res:</code>:<br><ol><li>Python calls <code>res.__enter__()</code>, assigning the return value to the <code>as</code> variable.</li><li>The nested code executes.</li><li>When leaving the block (either naturally or via error), Python calls <code>res.__exit__(exc_type, exc_val, exc_tb)</code>.</li></ol>If <code>__exit__</code> returns <code>True</code>, it suppresses any raised exception; returning <code>None</code> or <code>False</code> allows the exception to propagate.'
      },
      {
        heading: '3. Clean Context Managers with `@contextlib.contextmanager`',
        content: `Instead of creating a full class with <code>__enter__</code> and <code>__exit__</code> methods, use the <code>@contextmanager</code> decorator:<br><pre><code>@contextmanager
def temporary_lock(lock):
    lock.acquire()
    try:
        yield lock
    finally:
        lock.release()</code></pre>Code before <code>yield</code> is the setup (enter); code in <code>finally</code> is the teardown (exit).`
      }
    ],

    syntax: {
      pattern: `# 1. Modern File I/O with pathlib and Context Manager
from pathlib import Path

file_path = Path("reports") / "summary.txt"
file_path.parent.mkdir(parents=True, exist_ok=True)

with file_path.open("w", encoding="utf-8") as f:
    f.write("System Status: OK\\n")

# 2. Reading Lines with Memory Efficiency
with file_path.open("r", encoding="utf-8") as f:
    for line in f:   # Iterates lazily line by line!
        process(line.strip())

# 3. Custom Context Manager via Class
class ExecutionTimer:
    def __enter__(self):
        self.start = time.perf_counter()
        return self
        
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.elapsed = time.perf_counter() - self.start
        print(f"Elapsed: {self.elapsed:.4f}s")`,
      components: [
        { part: 'with open(...) as f:', meaning: 'Context manager guaranteeing f.close() on block exit' },
        { part: 'encoding="utf-8"', meaning: 'Guarantees uniform cross-platform Unicode text decoding' },
        { part: 'path / "subfolder"', meaning: 'Object-oriented path composition using division operator' },
        { part: '__enter__ and __exit__', meaning: 'Dunder methods defining the context management protocol' }
      ]
    },

    examples: [
      {
        title: 'Custom Database Transaction Context Manager & Pathlib Walk',
        description: 'Demonstrating custom context manager rollbacks, pathlib operations, and line iteration.',
        code: `import time
from contextlib import contextmanager
from pathlib import Path

# 1. Custom Transaction Rollback Context Manager
class MockDatabaseTransaction:
    def __init__(self, connection_name: str):
        self.connection = connection_name
        self.operations = []
        
    def __enter__(self):
        print(f"[DB] BEGIN TRANSACTION on {self.connection}")
        return self
        
    def execute(self, sql: str):
        print(f"  [EXEC] {sql}")
        self.operations.append(sql)
        
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            print(f"[DB] ERROR: {exc_val}. Executing ROLLBACK for {len(self.operations)} actions!")
            return False  # Propagate exception
        else:
            print(f"[DB] COMMIT TRANSACTION on {self.connection} ({len(self.operations)} actions saved).")
            return True

# Test Successful Transaction
with MockDatabaseTransaction("primary_db") as tx:
    tx.execute("INSERT INTO users VALUES (1, 'Alice')")
    tx.execute("UPDATE stats SET logins = logins + 1")

# Test Failed Transaction Triggering Rollback
try:
    with MockDatabaseTransaction("primary_db") as tx:
        tx.execute("INSERT INTO accounts VALUES (10, 500)")
        raise RuntimeError("Network timeout while querying ledger")
except RuntimeError as err:
    print(f"Caught expected error: {err}")

# 2. Pathlib Directory Operations
current_dir = Path(".")
py_files = list(current_dir.glob("*.py"))
print(f"\\nFound {len(py_files)} python files in current working dir.")`,
        output: `[DB] BEGIN TRANSACTION on primary_db
  [EXEC] INSERT INTO users VALUES (1, 'Alice')
  [EXEC] UPDATE stats SET logins = logins + 1
[DB] COMMIT TRANSACTION on primary_db (2 actions saved).

[DB] BEGIN TRANSACTION on primary_db
  [EXEC] INSERT INTO accounts VALUES (10, 500)
[DB] ERROR: Network timeout while querying ledger. Executing ROLLBACK for 1 actions!
Caught expected error: Network timeout while querying ledger

Found 0 python files in current working dir.`,
        explanation: [
          'Line 6-27: Custom context manager handles transactional consistency: commits if block succeeds, rolls back if an error occurs.',
          'Line 21: `exc_type is not None` checks if an exception occurred. Returning `False` allows the caller to catch it.',
          'Line 43-45: Demonstrates `Path.glob()` for pattern-based filesystem search.'
        ]
      }
    ],

    notes: [
      {
        type: 'warning',
        title: 'Always Specify `encoding="utf-8"`',
        body: 'On Windows, Python historically defaulted to system-locale ANSI encodings (cp1252). Always pass `encoding="utf-8"` explicitly into `open()` to ensure cross-platform compatibility.'
      },
      {
        type: 'info',
        title: 'Iterate Over Files Directly (Lazy Streaming)',
        body: 'Never call `f.readlines()` on huge files because it reads the entire file into RAM at once. Use `for line in f:` to stream the file line by line with minimal memory usage.'
      },
      {
        type: 'tip',
        title: 'Multiple Context Managers in One `with`',
        body: 'You can combine multiple context managers in a single statement: `with open("in.txt") as f_in, open("out.txt", "w") as f_out:`. In Python 3.10+, parentheses are supported across multiple lines.'
      }
    ],

    commonMistakes: [
      {
        mistake: 'Opening Files Without the `with` Statement',
        incorrectCode: `# Dangerous: If an error occurs between open and close, file descriptor leaks!
f = open("data.txt", "r")
content = process_data(f.read())
f.close()`,
        correctCode: `# Safe: File descriptor closed automatically even on error
with open("data.txt", "r", encoding="utf-8") as f:
    content = process_data(f.read())`,
        why: 'If `process_data()` raises an exception, `f.close()` will never be reached, leaving the file descriptor locked by the operating system.'
      },
      {
        mistake: 'Using String Concatenation for File Paths Instead of Pathlib',
        incorrectCode: `# Prone to slash errors across Windows (\\) vs Linux (/)
path = folder + "/" + "sub" + "/" + filename`,
        correctCode: `# Clean, cross-platform Pathlib operator
from pathlib import Path
path = Path(folder) / "sub" / filename`,
        why: '`pathlib.Path` handles operating system path separator differences automatically, preventing invalid slashes on Windows.'
      }
    ],

    comparisons: [
      {
        title: 'pathlib.Path vs os.path',
        headers: ['Feature', '`pathlib.Path` (Modern Python 3.4+)', '`os.path` (Legacy)'],
        rows: [
          ['Data Model', 'First-class Path objects with rich methods', 'Raw strings with function calls'],
          ['Path Joining', '`Path("dir") / "file.txt"`', '`os.path.join("dir", "file.txt")`'],
          ['Read / Write', '`p.read_text()` / `p.write_text()`', 'Requires manual `open()` / `close()`'],
          ['Pattern Matching', '`p.glob("**/*.json")`', 'Requires `glob.glob()` module import']
        ]
      }
    ],

    questions: [
      {
        question: 'What are the parameters passed to the `__exit__` method of a context manager?',
        answer: '`(exc_type, exc_val, exc_tb)`',
        explanation: 'The exception class, exception instance, and traceback object. If the block executed without errors, all three arguments are `None`.'
      },
      {
        question: 'Why should you avoid `f.readlines()` when processing large files?',
        answer: 'It reads the entire file into RAM as a list, leading to out-of-memory errors.',
        explanation: 'Iterating with `for line in f:` reads lines lazily one at a time using an internal buffer, maintaining constant O(1) memory usage.'
      }
    ],

    practice: [
      {
        id: 'py-file-ex1',
        title: 'Temporary Working Directory Context Manager',
        difficulty: 'Intermediate',
        prompt: 'Use `contextlib.contextmanager` to write a context manager `temporary_directory(path: Path)` that ensures a directory exists, yields its path for work, and cleans it up after exiting.',
        starterCode: `from contextlib import contextmanager
from pathlib import Path
import shutil

@contextmanager
def temporary_directory(path: Path):
    # Your code here
    pass`,
        solution: `from contextlib import contextmanager
from pathlib import Path
import shutil

@contextmanager
def temporary_directory(path: Path):
    path.mkdir(parents=True, exist_ok=True)
    try:
        yield path
    finally:
        if path.exists():
            shutil.rmtree(path)`,
        explanation: 'The code before `yield` sets up the directory. The `finally` block guarantees directory deletion even if the enclosed code raises an unhandled error.'
      }
    ],

    references: [
      {
        title: 'Python Documentation: pathlib — Object-oriented filesystem paths',
        type: 'Official Docs',
        url: 'https://docs.python.org/3/library/pathlib.html'
      },
      {
        title: 'Python Documentation: contextlib — Utilities for with-statement contexts',
        type: 'Official Docs',
        url: 'https://docs.python.org/3/library/contextlib.html'
      }
    ]
  });

})();
