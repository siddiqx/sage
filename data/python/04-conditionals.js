/**
 * Sage — Python Topic 04: Conditional Statements & Pattern Matching
 */

(function () {
  'use strict';

  SAGE.registerTopic({
    id: 'py-conditionals',
    title: 'Conditionals & Structural Pattern Matching',
    subject: 'python',
    module: 'Foundations',
    description: 'Truth value testing, ternary expressions, and structural pattern matching (match-case) in modern Python.',
    difficulty: 'Beginner',
    readTime: '13 min read',

    overview: {
      definition: 'Conditional statements direct the flow of execution based on boolean truth evaluations. Beyond traditional `if-elif-else` branching and ternary expressions (`a if cond else b`), Python 3.10 introduced Structural Pattern Matching (`match-case`), allowing powerful destructuring of data structures, sequence unpacking, and guard conditions.',
      mentalModel: 'Think of conditional branching as railroad track switches. In standard `if-else`, paths are chosen based on a boolean condition. In structural pattern matching (`match-case`), the switch selects tracks by inspecting both the shape (structure) and the content of the data simultaneously.'
    },

    terminology: [
      {
        term: 'Truth Value Testing',
        definition: 'Any Python object can be tested for truth value. Python calls `obj.__bool__()` first; if not defined, it checks `obj.__len__() != 0`.'
      },
      {
        term: 'Falsy Values',
        definition: 'Objects that evaluate to False in conditions: `None`, `False`, numeric zeros (`0`, `0.0`, `0j`), empty collections (`""`, `()`, `[]`, `{}`, `set()`, `range(0)`).'
      },
      {
        term: 'Ternary Expression',
        definition: 'Inline conditional expression with syntax `value_if_true if condition else value_if_false`.'
      },
      {
        term: 'Structural Pattern Matching (`match`)',
        definition: 'Pattern-matching syntax (PEP 634) comparing an expression against patterns with destructuring and variable binding.'
      },
      {
        term: 'Guard Clause (`if`)',
        definition: 'An additional boolean check added to a `case` pattern that must also be true for the match to succeed.'
      }
    ],

    explanation: [
      {
        heading: '1. Truth Value Testing and Pythonic Conditions',
        content: 'In Python, you do not need to check `if len(items) > 0:` or `if flag == True:`. Instead, rely on truth value testing:<br><ul><li><code>if items:</code> is True if the list has elements; False if empty.</li><li><code>if not items:</code> cleanly checks for emptiness.</li></ul>When Python evaluates an object in a conditional statement, it invokes <code>__bool__()</code>. If that method is missing, Python falls back to <code>__len__()</code>.'
      },
      {
        heading: '2. Ternary Conditional Operator',
        content: 'Python supports inline conditional expressions: <code>status = "Active" if user.is_logged_in else "Offline"</code>. Unlike C-family ternary operators (<code>cond ? a : b</code>), Python places the true value first, reading naturally like an English sentence.'
      },
      {
        heading: '3. Structural Pattern Matching (`match ... case`)',
        content: `Introduced in Python 3.10, <code>match-case</code> is far more capable than traditional switch statements. It can destructure sequences, match dictionaries by key existence, bind variables, and evaluate guard clauses:<br><pre><code>match command:
    case ["move", ("left" | "right") as direction, int(steps)]:
        walk(direction, steps)
    case {"action": "quit"}:
        exit()
    case _:
        print("Unknown command")</code></pre>`
      }
    ],

    syntax: {
      pattern: `# 1. Traditional if-elif-else
if condition_1:
    execute_branch_1()
elif condition_2:
    execute_branch_2()
else:
    execute_default()

# 2. Ternary Expression
result = true_value if condition else false_value

# 3. Structural Pattern Matching
match expression:
    case pattern_1 if guard_condition:
        action_1()
    case [head, *tail]:
        action_sequence()
    case _:
        default_fallback()`,
      components: [
        { part: 'if / elif / else', meaning: 'Sequential conditional evaluation blocks' },
        { part: 'a if cond else b', meaning: 'Single-line conditional expression' },
        { part: 'match expr:', meaning: 'Target expression for structural pattern matching' },
        { part: 'case _:', meaning: 'Wildcard pattern that catches all unmatched values' }
      ]
    },

    examples: [
      {
        title: 'API Request Router Using Pattern Matching & Guards',
        description: 'Handling different JSON-like data payloads cleanly using match-case destructuring and guard clauses.',
        code: `def route_request(payload: dict) -> str:
    match payload:
        case {"action": "auth", "token": str(token)} if len(token) >= 32:
            return f"Authenticated successfully with 32+ byte token"
        case {"action": "auth"}:
            return "Auth rejected: Token missing or too short"
        case {"action": "query", "tables": [str(first_table), *other_tables]}:
            count = len(other_tables) + 1
            return f"Querying {first_table} and {len(other_tables)} additional tables (Total: {count})"
        case {"action": "shutdown"}:
            return "Server initiating graceful shutdown..."
        case _:
            return "Invalid request schema"

# Testing various payloads
print(route_request({"action": "auth", "token": "a" * 32}))
print(route_request({"action": "auth", "token": "short"}))
print(route_request({"action": "query", "tables": ["users", "orders", "analytics"]}))
print(route_request({"invalid": "schema"}))`,
        output: `Authenticated successfully with 32+ byte token
Auth rejected: Token missing or too short
Querying users and 2 additional tables (Total: 3)
Invalid request schema`,
        explanation: [
          'Line 3: Matches a dictionary containing "action": "auth" and extracts the token, guarded by `len(token) >= 32`.',
          'Line 7: Destructures a sequence of tables, capturing the first into `first_table` and remaining items into `*other_tables`.',
          'Line 11: Wildcard `case _` serves as safe default fallback for any unhandled schemas.'
        ]
      }
    ],

    notes: [
      {
        type: 'info',
        title: 'Custom Truthiness in Classes',
        body: 'Implement `def __bool__(self):` in your class to customize how instances evaluate in boolean contexts (e.g. returning False if a custom buffer is empty).'
      },
      {
        type: 'warning',
        title: 'Avoid Comparing Explicitly to True or False',
        body: 'Never write `if flag == True:`. Simply write `if flag:`. Checking `== True` fails for other truthy objects like non-empty lists.'
      },
      {
        type: 'tip',
        title: 'Variable Binding in Pattern Matching',
        body: 'In `case [x, y]:`, variables `x` and `y` are bound to the matched values in scope. If you match against a constant, qualify it with an enum or dot notation (e.g., `case Status.SUCCESS:`).'
      }
    ],

    commonMistakes: [
      {
        mistake: 'Using Multiple `if` Statements Instead of `elif`',
        incorrectCode: `# Bug: Evaluates both branches if condition_1 changes state!
if score >= 90:
    grade = "A"
if score >= 80:  # Runs even if grade was already "A", overwriting it!
    grade = "B"`,
        correctCode: `# Correct: Exclusive mutual branches
if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"`,
        why: 'Independent `if` statements always evaluate consecutively. `elif` guarantees that at most one branch in the chain executes.'
      },
      {
        mistake: 'Checking Emptiness with `len(lst) == 0` Instead of Pythonic Truthiness',
        incorrectCode: `if len(user_list) == 0:
    print("No users")`,
        correctCode: `if not user_list:
    print("No users")`,
        why: '`if not user_list:` is faster and idiomatic in Python. It avoids calling `len()` and directly queries the collection\'s truthiness.'
      }
    ],

    comparisons: [
      {
        title: 'if-elif-else Chains vs match-case',
        headers: ['Feature', 'if-elif-else Chains', 'match-case (Structural Pattern Matching)'],
        rows: [
          ['Python Version', 'All versions', 'Python 3.10+'],
          ['Best Use Case', 'Simple boolean checks and numeric range comparisons', 'Complex nested structures, AST nodes, and API payload routing'],
          ['Destructuring', 'Manual extraction required', 'Automatic pattern matching and variable binding'],
          ['Readability', 'Can become deeply nested and repetitive', 'Flat, clear, declarative patterns']
        ]
      }
    ],

    questions: [
      {
        question: 'What is the truth value of an empty dictionary `{}` and why?',
        answer: 'False.',
        explanation: 'In Python, all empty built-in collections (dict, list, tuple, set, str) have a length of 0 and evaluate to False in truth testing.'
      },
      {
        question: 'In `match-case`, what does the wildcard `case _:` represent?',
        answer: 'The default catch-all branch.',
        explanation: 'The underscore `_` acts as a wildcard that matches any value without binding it to a variable, equivalent to a `default:` block in other languages.'
      }
    ],

    practice: [
      {
        id: 'py-cond-ex1',
        title: 'CLI Command Parser with Pattern Matching',
        difficulty: 'Beginner',
        prompt: 'Write a function `parse_command(tokens: list[str]) -> str` using structural pattern matching that handles:\n1. ["help"] -> "Displaying manual"\n2. ["load", filename] -> f"Loading file: {filename}"\n3. ["set", key, value] -> f"Setting {key} = {value}"\n4. Any other list -> "Invalid command"',
        starterCode: `def parse_command(tokens: list[str]) -> str:
    # Use match-case
    pass`,
        solution: `def parse_command(tokens: list[str]) -> str:
    match tokens:
        case ["help"]:
            return "Displaying manual"
        case ["load", str(filename)]:
            return f"Loading file: {filename}"
        case ["set", str(key), str(value)]:
            return f"Setting {key} = {value}"
        case _:
            return "Invalid command"`,
        explanation: 'Structural pattern matching inspects sequence length and type constraints simultaneously, binding the filename, key, and value dynamically.'
      }
    ],

    references: [
      {
        title: 'Python Documentation: Structural Pattern Matching Tutorial',
        type: 'Official Docs',
        url: 'https://docs.python.org/3/tutorial/controlflow.html#match-statements'
      },
      {
        title: 'PEP 636 — Structural Pattern Matching: Tutorial',
        type: 'Official Docs',
        url: 'https://peps.python.org/pep-0636/'
      }
    ]
  });

})();
