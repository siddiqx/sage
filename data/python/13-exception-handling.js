/**
 * Sage — Python Topic 13: Exception Handling & Robust Programming
 */

(function () {
  'use strict';

  SAGE.registerTopic({
    id: 'py-exception-handling',
    title: 'Exception Handling, EAFP & Exception Groups',
    subject: 'python',
    module: 'Robust Programming & I/O',
    description: 'The EAFP philosophy, try-except-else-finally lifecycle, exception chaining (raise from), custom hierarchy, and Python 3.11+ ExceptionGroups.',
    difficulty: 'Intermediate',
    readTime: '15 min read',

    overview: {
      definition: 'Exceptions are first-class runtime objects raised when errors or unusual events interrupt standard program execution. Python strongly embraces the EAFP philosophy ("Easier to Ask for Forgiveness than Permission"), preferring code that attempts an operation inside a `try` block over defensive pre-checking with `if` conditions (LBYL: "Look Before You Leap").',
      mentalModel: 'Think of an exception as an emergency flare shot up from a failing line of code. It immediately halts normal execution and bubbles upward through the call stack until an enclosing `try-except` net catches it. If no net matches, the Python runtime prints a traceback and exits.'
    },

    terminology: [
      {
        term: 'EAFP vs LBYL',
        definition: 'EAFP ("Easier to Ask for Forgiveness than Permission") executes first and catches failure. LBYL ("Look Before You Leap") checks conditions explicitly before acting (prone to race conditions).'
      },
      {
        term: 'The `else` Block',
        definition: 'In `try-except-else-finally`, the `else` clause runs ONLY if the `try` block completed successfully without raising an exception.'
      },
      {
        term: 'The `finally` Block',
        definition: 'Executes unconditionally whether an exception was raised, caught, uncaught, or avoided via `return`, guaranteeing resource cleanup.'
      },
      {
        term: 'Exception Chaining (`raise ... from`)',
        definition: 'PEP 3134 syntax connecting an original low-level exception to a high-level application error via `__cause__`.'
      },
      {
        term: '`ExceptionGroup` & `except*` (Python 3.11+)',
        definition: 'Allows multiple unrelated exceptions occurring simultaneously (e.g. concurrent tasks in asyncio) to be bundled and caught selectively.'
      }
    ],

    explanation: [
      {
        heading: '1. Why EAFP is Preferred in Python',
        content: 'Consider reading a key from a dictionary:<br><ul><li><strong>LBYL:</strong> <code>if "key" in data: return data["key"]</code> (requires two hash lookups: one for <code>in</code> and one for <code>[]</code>). In multi-threaded programs or file systems, the resource could be deleted between the check and the read (Time-of-Check to Time-of-Use race condition).</li><li><strong>EAFP:</strong> <code>try: return data["key"] except KeyError: return default</code> (only one lookup, faster in normal paths, and immune to TOCTOU race conditions).</li></ul>'
      },
      {
        heading: '2. The 4-Part Structure: `try`, `except`, `else`, `finally`',
        content: 'Keep <code>try</code> blocks minimal to avoid accidentally masking bugs:<br><ul><li><code>try</code>: Put ONLY the specific line that might legitimately fail.</li><li><code>except SpecificError as err</code>: Handle the exact expected error.</li><li><code>else</code>: Put code that depends on the <code>try</code> block succeeding (prevents catching errors in the success logic!).</li><li><code>finally</code>: Teardown logic (closing files, releasing locks).</li></ul>'
      },
      {
        heading: '3. Never Use Bare `except:` or Catch `BaseException`',
        content: 'Writing <code>except:</code> or <code>except BaseException:</code> catches everything, including <code>KeyboardInterrupt</code> (preventing users from stopping your program with Ctrl+C) and <code>SystemExit</code> (breaking <code>sys.exit()</code>).<br>Always catch specific exceptions or <code>except Exception:</code> if catching all standard application errors.'
      }
    ],

    syntax: {
      pattern: `# 1. Full Exception Handling Flow
try:
    risky_operation()
except (ValueError, TypeError) as err:
    handle_client_error(err)
except SpecificServiceError as err:
    # Explicit Exception Chaining
    raise ApplicationError("Operation failed") from err
else:
    # Executes ONLY if try raised NO exceptions
    process_success()
finally:
    # Executes UNCONDITIONALLY (even on return/error)
    cleanup_resources()

# 2. Custom Exception Hierarchy
class DatabaseError(Exception):
    """Base exception for database domain."""
    pass

class RecordNotFoundError(DatabaseError):
    """Raised when record ID is not found."""
    pass`,
      components: [
        { part: 'try ... except E as e:', meaning: 'Catches exception class E and binds instance to e' },
        { part: 'else:', meaning: 'Runs only if try block executed without any exceptions' },
        { part: 'finally:', meaning: 'Runs unconditionally for cleanup before function exits' },
        { part: 'raise NewError() from orig_error', meaning: 'Chains exceptions to preserve original traceback' }
      ]
    },

    examples: [
      {
        title: 'Production Exception Workflow with Custom Hierarchy & Chaining',
        description: 'Demonstrating custom exceptions, raise-from chaining, else blocks, and guaranteed finally cleanup.',
        code: `import logging

# 1. Domain-Specific Exception Hierarchy
class PaymentServiceError(Exception):
    """Base exception for payment domain."""
    pass

class InsufficientFundsError(PaymentServiceError):
    def __init__(self, requested: float, available: float):
        super().__init__(f"Requested \${requested:.2f}, but only \${available:.2f} available.")
        self.requested = requested
        self.available = available

# 2. Complete try-except-else-finally workflow
def execute_transfer(account_balance: float, amount: float) -> float:
    connection_open = True
    print("[INIT] Payment gateway session opened.")
    
    try:
        if amount <= 0:
            raise ValueError("Transfer amount must be strictly positive.")
        if amount > account_balance:
            raise InsufficientFundsError(amount, account_balance)
            
        account_balance -= amount
        
    except ValueError as err:
        print(f"[RECOVERED] Input validation error: {err}")
        return account_balance
        
    except InsufficientFundsError as err:
        print(f"[REJECTED] {err}")
        # Chain into high-level service error
        raise PaymentServiceError("Transaction declined by gateway policy") from err
        
    else:
        print(f"[SUCCESS] Transfer approved! Remaining balance: \${account_balance:.2f}")
        return account_balance
        
    finally:
        connection_open = False
        print("[CLEANUP] Payment gateway session safely closed.\\n")

# Test Successful Run
bal = execute_transfer(500.0, 150.0)

# Test Handled Input Error
bal = execute_transfer(bal, -50.0)

# Test Chained Domain Error
try:
    execute_transfer(bal, 900.0)
except PaymentServiceError as err:
    print(f"Caught high-level error: {err}")
    print(f"Original root cause (__cause__): {err.__cause__}")`,
        output: `[INIT] Payment gateway session opened.
[SUCCESS] Transfer approved! Remaining balance: \$350.00
[CLEANUP] Payment gateway session safely closed.

[INIT] Payment gateway session opened.
[RECOVERED] Input validation error: Transfer amount must be strictly positive.
[CLEANUP] Payment gateway session safely closed.

[INIT] Payment gateway session opened.
[REJECTED] Requested \$900.00, but only \$350.00 available.
[CLEANUP] Payment gateway session safely closed.

Caught high-level error: Transaction declined by gateway policy
Original root cause (__cause__): Requested \$900.00, but only \$350.00 available.`,
        explanation: [
          'Line 4-11: Custom domain exception hierarchy inheriting from `Exception` with domain-specific metadata attributes.',
          'Line 14-41: Demonstrates that `finally` runs unconditionally across all three scenarios (success, caught error, and re-raised error).',
          'Line 32-34: `raise PaymentServiceError from err` cleanly connects the low-level cause to the higher-level architecture exception.',
          'Line 53-55: Shows that calling code can inspect `err.__cause__` to access the exact root cause.'
        ]
      }
    ],

    notes: [
      {
        type: 'warning',
        title: 'Never Catch Bare `except:`',
        body: 'A bare `except:` catches `KeyboardInterrupt` and `SystemExit`, disabling Ctrl+C interrupt signals. Always specify `except Exception:` at the broadest.'
      },
      {
        type: 'info',
        title: 'Return in Finally Overrides Everything',
        body: 'If a `finally` block executes an explicit `return` statement, any exception raised in the `try` block is silently discarded! Never return from inside `finally`.'
      },
      {
        type: 'tip',
        title: 'The Purpose of the `else` Clause',
        body: 'The `else` block runs only if `try` succeeds. Placing dependent code in `else` prevents catching unintended errors from that downstream logic.'
      }
    ],

    commonMistakes: [
      {
        mistake: 'Silent Exception Swallowing (`except: pass`)',
        incorrectCode: `# The cardinal sin of Python programming:
try:
    process_critical_data()
except Exception:
    pass  # Silent failure: bugs and data corruption go undetected!`,
        correctCode: `# Log the error or handle it explicitly
import logging

try:
    process_critical_data()
except Exception as err:
    logging.exception("Data processing failure: %s", err)
    raise`,
        why: 'Silently passing on exceptions conceals SyntaxErrors, TypeErrors, and logical failures, leaving systems in corrupt or inconsistent states.'
      },
      {
        mistake: 'Catching Exceptions Too Broadly and Masking NameErrors',
        incorrectCode: `try:
    # Typo: config_path is misspelled
    path = confg_path
    data = load_json(path)
except Exception:
    data = {}  # Hides the NameError typo!`,
        correctCode: `path = config_path  # Outside try block
try:
    data = load_json(path)
except (FileNotFoundError, json.JSONDecodeError):
    data = {}`,
        why: 'Keep `try` blocks narrow. Catching broad exceptions masks spelling mistakes and programming errors as operational failures.'
      }
    ],

    comparisons: [
      {
        title: 'EAFP vs LBYL Comparison',
        headers: ['Philosophy', 'Sample Code', 'Pros', 'Cons'],
        rows: [
          ['EAFP (Python Default)', '`try: v = d[k] except KeyError: v = default`', 'Faster on success, prevents race conditions', 'Slower if exceptions occur constantly'],
          ['LBYL (Traditional C/Java)', '`if k in d: v = d[k] else: v = default`', 'Explicit conditions', 'Requires redundant checks, prone to TOCTOU race conditions']
        ]
      }
    ],

    questions: [
      {
        question: 'What is the key difference between `except Exception:` and `except BaseException:`?',
        answer: '`BaseException` catches system-exiting signals (`KeyboardInterrupt`, `SystemExit`), while `Exception` only catches non-system-exiting application errors.',
        explanation: 'Inheritance tree: `BaseException` is the root parent of `Exception`, `KeyboardInterrupt`, `SystemExit`, and `GeneratorExit`.'
      },
      {
        question: 'When does the `else` block execute in a `try...except...else...finally` statement?',
        answer: 'Only when the `try` block completes successfully without raising any exceptions.',
        explanation: 'If an exception is raised in `try` (even if handled in `except`), the `else` block is skipped.'
      }
    ],

    practice: [
      {
        id: 'py-exc-ex1',
        title: 'Safe Integer Parser with Exception Chaining',
        difficulty: 'Intermediate',
        prompt: 'Define a custom exception `InvalidPortError(Exception)`. Write a function `parse_port(port_str: str) -> int` that parses a port number, verifies it is an integer between 1 and 65535, and raises `InvalidPortError` chained to any underlying `ValueError`.',
        starterCode: `class InvalidPortError(Exception):
    pass

def parse_port(port_str: str) -> int:
    # Your code here
    pass`,
        solution: `class InvalidPortError(Exception):
    pass

def parse_port(port_str: str) -> int:
    try:
        port = int(port_str)
    except ValueError as err:
        raise InvalidPortError(f"Port '{port_str}' is not a valid integer") from err
        
    if not (1 <= port <= 65535):
        raise InvalidPortError(f"Port {port} is out of allowable range (1-65535)")
        
    return port`,
        explanation: '`raise InvalidPortError(...) from err` preserves the original `ValueError` traceback in `__cause__`, providing full auditability.'
      }
    ],

    references: [
      {
        title: 'Python Documentation: Errors and Exceptions',
        type: 'Official Docs',
        url: 'https://docs.python.org/3/tutorial/errors.html'
      },
      {
        title: 'PEP 3134 — Exception Chaining and Embedded Tracebacks',
        type: 'Official Docs',
        url: 'https://peps.python.org/pep-3134/'
      }
    ]
  });

})();
