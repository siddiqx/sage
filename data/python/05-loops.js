/**
 * Sage — Python Topic 05: Iteration & Loop Control
 */

(function () {
  'use strict';

  SAGE.registerTopic({
    id: 'py-loops',
    title: 'Loops, Iteration & Loop-Else Semantics',
    subject: 'python',
    module: 'Foundations',
    description: 'for loops, while loops, break/continue, the unique loop-else construct, enumerate(), zip(), and iteration hazards.',
    difficulty: 'Beginner',
    readTime: '14 min read',

    overview: {
      definition: 'Loops allow repeated execution of code blocks. Python does not have traditional C-style index-counter loops (`for (int i=0; i<n; i++)`); instead, Python\'s `for` loop is a generic iterator loop that consumes items from any iterable object via the iterator protocol. Python also features `while` loops and an often misunderstood `for...else` construct.',
      mentalModel: 'Think of a Python `for` loop as a conveyor belt worker. It does not count indices; it asks the conveyor belt (`iterable`) for the "next item" until the belt raises a `StopIteration` signal. The loop `else` block acts as a "no break occurred" completion handler.'
    },

    terminology: [
      {
        term: 'Iterable',
        definition: 'Any Python object capable of returning its members one at a time (implements `__iter__()` or `__getitem__()`). Examples: list, str, dict, tuple, set, range.'
      },
      {
        term: 'Loop `else` Block',
        definition: 'A block attached to `for` or `while` that executes ONLY when the loop terminates naturally, and is SKIPPED if terminated by `break`.'
      },
      {
        term: '`enumerate()`',
        definition: 'A built-in generator function yielding `(index, item)` tuples from an iterable, avoiding manual counter tracking.'
      },
      {
        term: '`zip(*iterables)`',
        definition: 'Aggregates elements from multiple iterables in lockstep into tuples. In Python 3.10+, `strict=True` raises a ValueError if lengths differ.'
      },
      {
        term: '`break` vs `continue`',
        definition: '`break` immediately exits the loop. `continue` skips the rest of the current iteration and jumps to the next iteration.'
      }
    ],

    explanation: [
      {
        heading: '1. The Mechanism of the `for` Loop',
        content: 'When you write <code>for item in collection:</code>, Python executes these steps under the hood:<br><ol><li>Calls <code>iter(collection)</code> to obtain an iterator object.</li><li>Repeatedly calls <code>next(iterator)</code> to fetch the next value.</li><li>Assigns that value to <code>item</code> and runs the block.</li><li>Catches the built-in <code>StopIteration</code> exception to cleanly terminate the loop without crashing.</li></ol>'
      },
      {
        heading: '2. The `for...else` Construct: When Does `else` Run?',
        content: 'In Python, loops can have an <code>else:</code> clause. The name can be counter-intuitive: think of it as <code>nobreak:</code>.<br><ul><li>The <code>else</code> block runs if the loop exhausts all elements naturally.</li><li>The <code>else</code> block is <strong>skipped</strong> if the loop is terminated early by a <code>break</code> statement.</li></ul>This eliminates the need for boolean flags like <code>found = False</code> when searching through collections.'
      },
      {
        heading: '3. Lockstep Iteration with `zip()` and `enumerate()`',
        content: 'Never use <code>for i in range(len(lst)):</code> when you need both elements and indices. Use <code>enumerate(lst)</code>.<br>When iterating through parallel collections, use <code>zip(names, ages, strict=True)</code>. The <code>strict=True</code> flag (Python 3.10+) protects against silent data loss when collections have mismatched lengths.'
      }
    ],

    syntax: {
      pattern: `# 1. for-else search pattern
for item in collection:
    if matches(item):
        found_item = item
        break
else:
    # Executes only if NO break occurred!
    handle_not_found()

# 2. enumerate with custom start
for index, item in enumerate(collection, start=1):
    print(f"#{index}: {item}")

# 3. zip with strict length checking
for name, score in zip(names, scores, strict=True):
    print(f"{name}: {score}")`,
      components: [
        { part: 'for item in iterable:', meaning: 'Fetches items via iterator protocol until StopIteration' },
        { part: 'else: (after loop)', meaning: 'Executes if loop completed without encountering break' },
        { part: 'enumerate(seq, start=1)', meaning: 'Generates (counter, value) tuples starting from given integer' },
        { part: 'zip(a, b, strict=True)', meaning: 'Pairs elements in parallel, ensuring identical lengths' }
      ]
    },

    examples: [
      {
        title: 'Prime Number Verification Using `for...else`',
        description: 'Using loop-else to detect prime numbers without maintaining boolean flag variables.',
        code: `def check_prime(n: int) -> None:
    if n < 2:
        print(f"{n} is not prime.")
        return
        
    # Check divisors from 2 up to floor(sqrt(n)) + 1
    limit = int(n ** 0.5) + 1
    for divisor in range(2, limit):
        if n % divisor == 0:
            print(f"{n} is composite ({divisor} * {n // divisor} = {n})")
            break
    else:
        # Runs ONLY if no divisor triggered the break!
        print(f"{n} is a prime number!")

check_prime(17)
check_prime(35)
check_prime(97)

# Enumerate and Zip demonstration
players = ["Alice", "Bob", "Charlie"]
scores = [95, 88, 92]

print("\\n--- Leaderboard ---")
for rank, (player, score) in enumerate(zip(players, scores, strict=True), start=1):
    print(f"Rank {rank}: {player} with {score} pts")`,
        output: `17 is a prime number!
35 is composite (5 * 7 = 35)
97 is a prime number!

--- Leaderboard ---
Rank 1: Alice with 95 pts
Rank 2: Bob with 88 pts
Rank 3: Charlie with 92 pts`,
        explanation: [
          'Line 7-11: Tests potential divisors up to the square root of `n`. If a factor is found, `break` terminates the loop.',
          'Line 12-14: The `else` block runs only if the loop exhausted all numbers without hitting `break`, proving `n` is prime.',
          'Line 24: Combines `enumerate` and `zip(..., strict=True)` to produce rank numbers and unpack paired tuples cleanly.'
        ]
      }
    ],

    notes: [
      {
        type: 'warning',
        title: 'Modifying a List While Iterating Over It',
        body: 'Never remove or append items to a list while iterating over it with `for item in lst:`. Modifying the underlying list shifts indices and causes items to be skipped silently. Iterate over a slice copy `lst[:]` or use a list comprehension.'
      },
      {
        type: 'tip',
        title: 'Prefer `zip(strict=True)` in Python 3.10+',
        body: 'By default, `zip()` silently truncates at the length of the shortest iterable. Using `strict=True` ensures mismatched datasets raise an informative error immediately.'
      },
      {
        type: 'info',
        title: '`range()` is Memory Efficient',
        body: 'In Python 3, `range(1_000_000)` does not allocate 1 million integers in memory. It is a lightweight lazy sequence object that computes values on demand.'
      }
    ],

    commonMistakes: [
      {
        mistake: 'Mutating a Collection During Direct Iteration',
        incorrectCode: `# Bug: Skips elements!
numbers = [1, 2, 3, 4, 5, 6]
for num in numbers:
    if num % 2 == 0:
        numbers.remove(num)
# numbers is [1, 3, 5] by coincidence, but with consecutive evens it breaks!`,
        correctCode: `# Correct: List comprehension or iterating over a copy
numbers = [num for num in numbers if num % 2 != 0]
# Or: for num in numbers[:]: numbers.remove(num)`,
        why: 'Removing an item shifts subsequent elements to the left. The loop iterator advances by index, skipping the element that slid into the deleted item\'s position.'
      },
      {
        mistake: 'Using `range(len(collection))` Instead of `enumerate()`',
        incorrectCode: `for i in range(len(names)):
    print(i, names[i])`,
        correctCode: `for i, name in enumerate(names):
    print(i, name)`,
        why: '`enumerate` is faster, avoids repeated indexing lookups (`names[i]`), and is far more readable and idiomatic.'
      }
    ],

    comparisons: [
      {
        title: 'for Loop vs while Loop',
        headers: ['Feature', '`for` Loop', '`while` Loop'],
        rows: [
          ['Termination Condition', 'Exhausts iterable or encounters break', 'Boolean condition becomes False or break'],
          ['Risk of Infinite Loop', 'Near zero (finite iterables)', 'High (if state variable is not updated)'],
          ['Best Use Case', 'Iterating over known sequences, files, collections', 'Polling, state machines, waiting for events/signals']
        ]
      }
    ],

    questions: [
      {
        question: 'Under what exact condition does the `else` block of a Python loop execute?',
        answer: 'When the loop completes without encountering a `break` statement.',
        explanation: 'If a `while` condition becomes False, or a `for` loop reaches the end of its iterable, the `else` block executes. If `break` is executed, the `else` block is bypassed.'
      },
      {
        question: 'What is the memory footprint of `range(0, 10_000_000)`?',
        answer: 'Constant O(1) memory (only storing start, stop, and step integers).',
        explanation: 'A `range` object generates integers on the fly using arithmetic arithmetic arithmetic rather than holding an array in memory.'
      }
    ],

    practice: [
      {
        id: 'py-loop-ex1',
        title: 'Find First Duplicate with Loop-Else',
        difficulty: 'Beginner',
        prompt: 'Write a function `find_first_duplicate(items: list) -> any` that finds and returns the first duplicate item using a set for O(1) lookups. If all items are unique, use a `for...else` block to return `None`.',
        starterCode: `def find_first_duplicate(items: list):
    # Your code here
    pass`,
        solution: `def find_first_duplicate(items: list):
    seen = set()
    for item in items:
        if item in seen:
            return item
        seen.add(item)
    else:
        return None`,
        explanation: 'The set `seen` tracks items in O(1) lookup time. The loop returns immediately on the first duplicate; if no duplicate is found, the `else` block returns None.'
      }
    ],

    references: [
      {
        title: 'Python Tutorial: for Statements & break/else',
        type: 'Official Docs',
        url: 'https://docs.python.org/3/tutorial/controlflow.html#for-statements'
      },
      {
        title: 'Python Documentation: Built-in Functions (enumerate & zip)',
        type: 'Official Docs',
        url: 'https://docs.python.org/3/library/functions.html#enumerate'
      }
    ]
  });

})();
