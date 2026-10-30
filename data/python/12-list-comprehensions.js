/**
 * Sage — Python Topic 12: Comprehensions & Generator Expressions
 */

(function () {
  'use strict';

  SAGE.registerTopic({
    id: 'py-comprehensions',
    title: 'Comprehensions & Generator Expressions',
    subject: 'python',
    module: 'Functions & Comprehensions',
    description: 'List, dictionary, and set comprehensions, lazy generator expressions, nested flattening, and CPython bytecode optimization.',
    difficulty: 'Intermediate',
    readTime: '13 min read',

    overview: {
      definition: 'Comprehensions provide a concise, declarative syntax for transforming, filtering, and mapping iterable sequences into new lists, dictionaries, sets, or generator streams. In CPython, comprehensions execute significantly faster than manual `for` loops with `.append()` calls because they optimize memory allocation and use specialized bytecode instructions (`LIST_APPEND`).',
      mentalModel: 'Think of a comprehension as an inline assembly line. Instead of manually picking up each part, inspecting it, and calling a method to put it in a box (`lst.append(x)`), the comprehension runs the entire conveyor filter directly in high-speed C bytecode, producing the completed collection in one seamless sweep.'
    },

    terminology: [
      {
        term: 'List Comprehension',
        definition: 'Syntactic construct: `[expression for item in iterable if condition]` evaluating to a newly allocated list.'
      },
      {
        term: 'Dictionary Comprehension',
        definition: 'Syntactic construct: `{key_expr: val_expr for item in iterable if condition}` evaluating to a newly allocated dictionary.'
      },
      {
        term: 'Set Comprehension',
        definition: 'Syntactic construct: `{expression for item in iterable if condition}` evaluating to a set with automatic deduplication.'
      },
      {
        term: 'Generator Expression',
        definition: 'Syntactic construct with parentheses: `(expr for item in iterable if condition)` producing a lazy iterator with O(1) memory footprint.'
      },
      {
        term: '`LIST_APPEND` Bytecode',
        definition: 'CPython opcode that appends directly to the evaluating list on the internal C stack without looking up the `.append` attribute on each iteration.'
      }
    ],

    explanation: [
      {
        heading: '1. Why Comprehensions Outperform Manual Loops',
        content: `When you write:<br><pre><code>result = []
for x in data:
    result.append(x * 2)</code></pre>Python must perform an attribute lookup for <code>.append</code> on every single iteration and execute standard function call stack frame overhead.<br><br>In contrast, <code>[x * 2 for x in data]</code> generates the dedicated CPython opcode <code>LIST_APPEND</code>, which pushes directly into the C array without Python-level method resolution, resulting in a <strong>20–35% speed improvement</strong>.`
      },
      {
        heading: '2. Filtering vs Transforming: Placement of `if`',
        content: 'Understanding where <code>if</code> goes in a comprehension is crucial:<br><ul><li><strong>Filtering (at the end):</strong> <code>[x for x in data if x > 0]</code> (excludes elements that don\'t match).</li><li><strong>Transforming / Ternary (at the beginning):</strong> <code>[x if x > 0 else 0 for x in data]</code> (keeps every item, replacing negatives with 0).</li><li><strong>Both:</strong> <code>[x if x > 0 else 0 for x in data if x is not None]</code>.</li></ul>'
      },
      {
        heading: '3. List Comprehension vs Generator Expression: The Memory Divide',
        content: 'If you are calculating a sum or searching for a single item, allocating a list of 10,000,000 integers wastes gigabytes of RAM. Use a generator expression with parentheses instead:<br><ul><li><code>sum([x * 2 for x in range(10_000_000)])</code> allocates ~80 MB in RAM.</li><li><code>sum(x * 2 for x in range(10_000_000))</code> uses <strong>constant O(1) memory</strong> (~100 bytes).</li></ul>'
      }
    ],

    syntax: {
      pattern: `# 1. List Comprehension with Filter
squares = [x**2 for x in numbers if x % 2 == 0]

# 2. Dictionary Comprehension
user_lookup = {u.id: u.name for u in users}

# 3. Set Comprehension (Deduplicated)
unique_domains = {email.split("@")[1] for email in emails}

# 4. Lazy Generator Expression (O(1) memory)
total_size = sum(file.size for file in files)`,
      components: [
        { part: '[expr for x in seq if cond]', meaning: 'Evaluates expr for each x in seq that satisfies cond' },
        { part: '{k: v for x in seq}', meaning: 'Constructs dictionary mapping k to v' },
        { part: '(expr for x in seq)', meaning: 'Generator expression evaluating lazily on demand' }
      ]
    },

    examples: [
      {
        title: 'Matrix Flattening and Memory Comparison',
        description: 'Demonstrating nested comprehensions, dictionary transformations, and generator memory efficiency.',
        code: `import sys

# 1. Flattening a 2D Matrix (Order of clauses matches nested loops)
matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]
# Equivalent to: for row in matrix: for val in row:
flattened = [val for row in matrix for val in row]
print(f"Flattened matrix: {flattened}")

# 2. Dictionary Comprehension (Inverting a mapping)
port_names = {"http": 80, "https": 443, "ssh": 22, "dns": 53}
ports_to_services = {port: service for service, port in port_names.items()}
print(f"Inverted port map: {ports_to_services}")

# 3. Memory Footprint: List Comprehension vs Generator Expression
list_comp = [x * 2 for x in range(100_000)]
gen_expr = (x * 2 for x in range(100_000))

print(f"\\nList Comprehension size: {sys.getsizeof(list_comp):,} bytes")
print(f"Generator Expression size: {sys.getsizeof(gen_expr):,} bytes (Constant!)")

# 4. Consuming Generator in sum() without redundant parentheses
total_sum = sum(x * 2 for x in range(100_000))
print(f"Computed sum from generator: {total_sum:,}")`,
        output: `Flattened matrix: [1, 2, 3, 4, 5, 6, 7, 8, 9]
Inverted port map: {80: 'http', 443: 'https', 22: 'ssh', 53: 'dns'}

List Comprehension size: 800,984 bytes
Generator Expression size: 104 bytes (Constant!)
Computed sum from generator: 9,999,900,000`,
        explanation: [
          'Line 10: In nested comprehensions, the order of `for` clauses strictly mirrors standard loop nesting: `for row in matrix:` followed by `for val in row:`.',
          'Line 14: Dictionary comprehensions can swap keys and values or compute derived lookups in a single pass.',
          'Line 17-21: Highlights that the list comprehension allocates ~800 KB of RAM immediately, while the generator expression uses 104 bytes regardless of sequence size.'
        ]
      }
    ],

    notes: [
      {
        type: 'warning',
        title: 'Readability First: Avoid 3+ Levels of Nesting',
        body: 'If a comprehension spans more than two lines or has complex nested logic, refactor it into standard `for` loops. The Zen of Python notes: "Readability counts."'
      },
      {
        type: 'tip',
        title: 'No Need for Extra Parentheses in Reductions',
        body: 'When passing a generator expression as the single argument to functions like `sum()`, `min()`, `max()`, or `any()`, omit outer parentheses: `sum(x for x in nums)`.'
      },
      {
        type: 'info',
        title: 'Comprehension Scope Isolation',
        body: 'In Python 3, comprehension loop variables (e.g. `x`) do not leak into the surrounding function scope, preventing accidental variable pollution.'
      }
    ],

    commonMistakes: [
      {
        mistake: 'Confusing Filter `if` with Ternary `if-else`',
        incorrectCode: `# SyntaxError: invalid syntax
evens = [x for x in nums if x % 2 == 0 else 0]`,
        correctCode: `# Ternary belongs at the front; filtering belongs at the end
classified = [x if x % 2 == 0 else 0 for x in nums]`,
        why: 'When providing an `else` branch, you are transforming every value (ternary expression), which must appear before the `for` clause.'
      },
      {
        mistake: 'Using a List Comprehension When Only Reductions Are Needed',
        incorrectCode: `# Allocates 1,000,000 item list in RAM just to check if any match
if any([x > 900_000 for x in range(1_000_000)]):
    pass`,
        correctCode: `# Generator expression short-circuits on first match without allocating list!
if any(x > 900_000 for x in range(1_000_000)):
    pass`,
        why: '`any()` short-circuits on the first `True`. Passing a list comprehension builds all 1,000,000 elements first, defeating short-circuit optimization.'
      }
    ],

    comparisons: [
      {
        title: 'List Comprehension vs Generator Expression',
        headers: ['Property', 'List Comprehension `[...]` ', 'Generator Expression `(...)`'],
        rows: [
          ['Evaluation', 'Eager (computes entire collection immediately)', 'Lazy (computes 1 item at a time on demand)'],
          ['Memory Complexity', 'O(N) linear memory', 'O(1) constant memory'],
          ['Indexing & Slicing', 'Supports indexing (`lst[0]`) and len', 'Cannot be indexed or measured with len()'],
          ['Reusability', 'Can be iterated multiple times', 'Exhausts after single iteration pass']
        ]
      }
    ],

    questions: [
      {
        question: 'Why does `[x for row in matrix for x in row]` flatten a 2D list in the correct order?',
        answer: 'Because the `for` clauses read in the same order as nested `for` statements.',
        explanation: 'The outer loop is `for row in matrix:`, followed by the inner loop `for x in row:`. The leading `x` is the output element.'
      },
      {
        question: 'What is the benefit of `sum(x for x in nums)` over `sum([x for x in nums])`?',
        answer: 'It avoids allocating intermediate list memory.',
        explanation: 'The generator expression yields each number lazily, computing the running sum in O(1) space.'
      }
    ],

    practice: [
      {
        id: 'py-comp-ex1',
        title: 'Transaction Categorizer with Dict Comprehension',
        difficulty: 'Intermediate',
        prompt: 'Given a list of transactions `[{"id": 1, "status": "APPROVED", "usd": 50}, ...]`, write a function `filter_approved(transactions: list[dict]) -> dict[int, float]` that returns a dictionary mapping `id` to `usd` for APPROVED transactions only.',
        starterCode: `def filter_approved(transactions: list[dict]) -> dict[int, float]:
    # Use dict comprehension
    pass`,
        solution: `def filter_approved(transactions: list[dict]) -> dict[int, float]:
    return {tx["id"]: float(tx["usd"]) for tx in transactions if tx.get("status") == "APPROVED"}`,
        explanation: 'Constructs the target dictionary in a single readable line, filtering by status and extracting id-to-amount pairs.'
      }
    ],

    references: [
      {
        title: 'Python Documentation: List Comprehensions',
        type: 'Official Docs',
        url: 'https://docs.python.org/3/tutorial/datastructures.html#list-comprehensions'
      },
      {
        title: 'PEP 289 — Generator Expressions',
        type: 'Official Docs',
        url: 'https://peps.python.org/pep-0289/'
      }
    ]
  });

})();
