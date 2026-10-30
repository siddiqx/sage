/**
 * Sage — Python Topic 03: Operators & Precedence
 */

(function () {
  'use strict';

  SAGE.registerTopic({
    id: 'py-operators',
    title: 'Operators, Precedence & Short-Circuiting',
    subject: 'python',
    module: 'Foundations',
    description: 'Arithmetic division nuances, chained comparisons, short-circuit logical evaluation, bitwise math, and the walrus operator (:=).',
    difficulty: 'Beginner',
    readTime: '13 min read',

    overview: {
      definition: 'Operators in Python are special symbols and keywords that perform computations on operands. Python operators map internally to special dunder methods on objects (e.g., `a + b` invokes `a.__add__(b)`). Python features unique operator semantics including floor division toward negative infinity, chained comparison evaluations, and value-returning short-circuit boolean logic.',
      mentalModel: 'Think of operators as syntactic wrappers around object method calls. In Python, logical operators (`and`, `or`) do not merely return `True` or `False`; they act as selector gates that return the exact operand value that determined the truth condition.'
    },

    terminology: [
      {
        term: 'Floor Division (`//`)',
        definition: 'Division that rounds down to the nearest lower integer (toward negative infinity), contrasting with C/Java which truncate toward zero.'
      },
      {
        term: 'Modulo (`%`)',
        definition: 'Returns the remainder after floor division: `r = a - (a // b) * b`. In Python, the remainder always takes the sign of the divisor `b`.'
      },
      {
        term: 'Short-Circuit Evaluation',
        definition: 'In `a and b`, if `a` is falsy, `b` is never evaluated and `a` is returned. In `a or b`, if `a` is truthy, `b` is never evaluated and `a` is returned.'
      },
      {
        term: 'Chained Comparison',
        definition: 'Python allows chained checks like `10 < x <= 50`, expanding to `10 < x and x <= 50`, evaluating `x` only once.'
      },
      {
        term: 'Walrus Operator (`:=`)',
        definition: 'Assignment expression (PEP 572) that assigns a value to a variable as part of a larger expression, avoiding duplicated computations.'
      }
    ],

    explanation: [
      {
        heading: '1. Division Nuances: True Division vs Floor Division',
        content: 'Python differentiates between true division (<code>/</code>) and floor division (<code>//</code>):<br><ul><li><code>/</code> always returns a <code>float</code>, even for integers: <code>6 / 2</code> evaluates to <code>3.0</code>.</li><li><code>//</code> computes the mathematical floor: <code>7 // 2</code> is <code>3</code>.</li><li>Crucially, with negative numbers: <code>-7 // 2</code> yields <code>-4</code> (not -3), because -3.5 rounds down toward negative infinity.</li></ul>'
      },
      {
        heading: '2. Value-Returning Logical Operators (`and`, `or`)',
        content: 'In Python, logical operators return the value of one of the operands, not a plain boolean:<br><ul><li><code>A or B</code>: Returns <code>A</code> if truthy, otherwise evaluates and returns <code>B</code>. Common idiom: <code>name = user_name or "Guest"</code>.</li><li><code>A and B</code>: Returns <code>A</code> if falsy, otherwise evaluates and returns <code>B</code>.</li></ul>Because of short-circuiting, expensive function calls or dangerous operations on the right side are skipped if the left side determines the outcome.'
      },
      {
        heading: '3. The Walrus Operator (`:=`) in Practice',
        content: 'The assignment expression <code>:=</code> allows you to compute and assign inside loops, conditions, and list comprehensions. For example, instead of reading a file block twice, you can assign inside a while loop: <code>while (chunk := file.read(1024)): process(chunk)</code>.'
      }
    ],

    syntax: {
      pattern: `# Floor & Modulo
floor_val = a // b
mod_val = a % b

# Chained Comparison
in_bounds = (min_val <= x <= max_val)

# Short-circuit Defaulting
display_name = input_name or "Anonymous"

# Walrus Assignment Expression
if (n := len(data)) > 100:
    print(f"Data is large: {n} items")`,
      components: [
        { part: 'a // b', meaning: 'Floor division rounding toward negative infinity' },
        { part: 'a % b', meaning: 'Remainder satisfying a = (a // b) * b + (a % b)' },
        { part: 'min <= x <= max', meaning: 'Chained comparison with short-circuit evaluation' },
        { part: 'var := expr', meaning: 'Walrus assignment operator evaluates and binds variable inline' }
      ]
    },

    examples: [
      {
        title: 'Floor Division, Modulo, and the Walrus Operator',
        description: 'Demonstrating negative number division, value-returning logical operators, and inline assignment.',
        code: `import math

# 1. Floor division with negative numbers
print(f" 7 // 2 = {7 // 2}")
print(f"-7 // 2 = {-7 // 2} (Floored toward -infinity)")
print(f"-7 %  2 = {-7 % 2}  (Remainder matches sign of divisor 2)")

# 2. Chained comparisons
val = 25
print(f"10 < {val} < 50: {10 < val < 50}")

# 3. Short-circuit value return
config_timeout = None
effective_timeout = config_timeout or 30
print(f"Effective timeout: {effective_timeout}")

# 4. Walrus operator in conditional
def get_user_records():
    return ["user1", "user2", "user3", "user4"]

if (count := len(get_user_records())) > 2:
    print(f"High traffic alert: {count} active users detected.")`,
        output: ` 7 // 2 = 3
-7 // 2 = -4 (Floored toward -infinity)
-7 %  2 = 1  (Remainder matches sign of divisor 2)
10 < 25 < 50: True
Effective timeout: 30
High traffic alert: 4 active users detected.`,
        explanation: [
          'Line 4-6: Demonstrates Python floor division mathematical definition vs languages that truncate toward zero.',
          'Line 9-10: `10 < val < 50` checks both bounds in a single concise statement without repeating `val`.',
          'Line 13-15: `config_timeout or 30` returns 30 because `None` is falsy.',
          'Line 18-22: `count := len(...)` assigns the count and checks the condition simultaneously.'
        ]
      }
    ],

    notes: [
      {
        type: 'info',
        title: 'Operator Precedence Hierarchy',
        body: 'Precedence from highest to lowest: `**` (exponentiation) -> `~, +, -` (unary) -> `*, /, //, %` -> `+, -` -> `<<, >>` -> `&` -> `^` -> `|` -> comparisons -> `not` -> `and` -> `or`.'
      },
      {
        type: 'warning',
        title: 'Beware Defaulting Zero with `or`',
        body: 'If 0 is a valid value, `x = user_input or 10` will replace 0 with 10 because 0 evaluates to False! Use `x = 10 if user_input is None else user_input` instead.'
      },
      {
        type: 'tip',
        title: 'Use Parentheses for Complex Expressions',
        body: 'Even when operator precedence is well-defined, explicit parentheses improve clarity and prevent team misinterpretation.'
      }
    ],

    commonMistakes: [
      {
        mistake: 'Using `or` for Default Values When Zero or False is Valid',
        incorrectCode: `# Bug: If count is 0 (valid), it gets overwritten by default 5
count = 0
items = count or 5  # items becomes 5!`,
        correctCode: `# Safe check for None explicitly
count = 0
items = 5 if count is None else count  # items stays 0`,
        why: 'In Python, `0`, `False`, `""`, and `[]` are all falsy. Using `or` treats all of them as missing values, unintentionally replacing valid zeros.'
      },
      {
        mistake: 'Overusing Bitwise Operators (&, |) Instead of Boolean (and, or)',
        incorrectCode: `# Bug: Evaluates both sides without short-circuiting!
if obj is not None & obj.is_valid():
    pass`,
        correctCode: `# Correct: Boolean short-circuiting
if obj is not None and obj.is_valid():
    pass`,
        why: '`&` is the bitwise AND operator, which has higher precedence than `is not` and does NOT short-circuit. If `obj` is None, `obj.is_valid()` will still execute and throw an AttributeError.'
      }
    ],

    comparisons: [
      {
        title: 'Boolean Operators vs Bitwise Operators',
        headers: ['Feature', 'Boolean (`and`, `or`, `not`)', 'Bitwise (`&`, `|`, `~`, `^`)'],
        rows: [
          ['Operands', 'Any Python object (truthy/falsy evaluation)', 'Integers (binary bit manipulation) or sets'],
          ['Short-Circuiting', 'Yes: Skips right operand if outcome is determined', 'No: Evaluates both operands completely'],
          ['Return Value', 'The value of the deciding operand', 'Computed integer or set object'],
          ['Use Case', 'Control flow and conditional logic', 'Flag masks, cryptography, low-level binary protocols']
        ]
      }
    ],

    questions: [
      {
        question: 'What is the evaluated result of `[] or "default" and [1, 2]`?',
        answer: '`[1, 2]`',
        explanation: 'Due to precedence, `and` binds tighter than `or`. First `"default" and [1, 2]` evaluates: since `"default"` is truthy, it returns `[1, 2]`. Then `[] or [1, 2]` evaluates: since `[]` is falsy, it returns `[1, 2]`.'
      },
      {
        question: 'Why does `-13 // 5` equal `-3` in Python instead of `-2`?',
        answer: 'Because Python performs mathematical floor division (toward -infinity).',
        explanation: '-13 / 5 is -2.6. Rounding down to the nearest lower integer produces -3.'
      }
    ],

    practice: [
      {
        id: 'py-op-ex1',
        title: 'Batch Data Processor with the Walrus Operator',
        difficulty: 'Beginner',
        prompt: 'Write a function `clean_and_filter(strings: list[str]) -> list[str]` that strips whitespace from each string and filters out empty strings using the walrus operator inside a list comprehension.',
        starterCode: `def clean_and_filter(strings: list[str]) -> list[str]:
    # Use walrus operator := inside comprehension
    pass`,
        solution: `def clean_and_filter(strings: list[str]) -> list[str]:
    return [cleaned for s in strings if (cleaned := s.strip())]`,
        explanation: '`(cleaned := s.strip())` strips each string once during the `if` condition check. If non-empty, it is included in the output without stripping a second time.'
      }
    ],

    references: [
      {
        title: 'Python Documentation: Expressions and Operator Precedence',
        type: 'Official Docs',
        url: 'https://docs.python.org/3/reference/expressions.html#operator-precedence'
      },
      {
        title: 'PEP 572 — Assignment Expressions (The Walrus Operator)',
        type: 'Official Docs',
        url: 'https://peps.python.org/pep-0572/'
      }
    ]
  });

})();
