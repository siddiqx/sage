/**
 * Sage — Python Topic 02: Variables, Memory References & Primitive Types
 */

(function () {
  'use strict';

  SAGE.registerTopic({
    id: 'py-variables-types',
    title: 'Variables, References & Primitive Types',
    subject: 'python',
    module: 'Foundations',
    description: 'Python\'s object reference model, integer interning, IEEE 754 floats, boolean logic, NoneType, and value vs identity comparisons.',
    difficulty: 'Beginner',
    readTime: '14 min read',

    overview: {
      definition: 'In Python, variables are not memory containers that hold raw binary values. Instead, every variable is a reference (pointer) bound to a fully formed Python object located in heap memory. Primitive data types in Python (int, float, bool, str, NoneType) are all first-class objects with methods, headers, and reference counts.',
      mentalModel: 'Think of variables as adhesive name tags attached to balloons. Multiple name tags (a, b) can be stuck onto the exact same physical balloon (object in memory). Reassigning a variable does not overwrite the old object; it simply detaches the name tag and sticks it onto a newly created or different balloon.'
    },

    terminology: [
      {
        term: 'Object Identity (`id()`)',
        definition: 'An integer representing the unique memory address of an object for its entire lifetime. In CPython, `id(x)` is the physical memory pointer address.'
      },
      {
        term: 'Identity (`is`) vs Equality (`==`)',
        definition: '`==` checks value equivalence (whether two objects have the same data). `is` checks memory identity (whether both variables point to the exact same memory address).'
      },
      {
        term: 'Immutability',
        definition: 'An object whose internal state and value cannot be altered after creation. All primitive types in Python (int, float, bool, str, tuple, frozenset) are immutable.'
      },
      {
        term: 'Integer Interning',
        definition: 'CPython pre-allocates an array of small integer objects in memory between -5 and 256. Reusing these numbers references the pre-existing singleton instances.'
      },
      {
        term: 'NoneType / None',
        definition: 'A singleton object representing the intentional absence of a value. Evaluates to False in boolean contexts.'
      }
    ],

    explanation: [
      {
        heading: '1. The Python Object Model: Everything is an Object',
        content: 'Even a simple number like <code>x = 42</code> is a complete C structure (<code>PyLongObject</code> in CPython). It contains a reference count (ob_refcnt), an object type pointer (ob_type), and an array of digits representing the magnitude. Because Python integers have arbitrary precision, they can expand dynamically in memory without arithmetic overflow errors.'
      },
      {
        heading: '2. Identity vs Equality: The Critical Distinction',
        content: 'Understanding the difference between <code>==</code> and <code>is</code> is vital:<br><ul><li><code>a == b</code> calls <code>a.__eq__(b)</code> to evaluate whether the contents match.</li><li><code>a is b</code> evaluates <code>id(a) == id(b)</code>, confirming that both variables reference the identical address in RAM.</li></ul>Always use <code>is None</code> rather than <code>== None</code> because <code>None</code> is guaranteed to be a singleton in Python, and custom classes can override <code>__eq__</code>.'
      },
      {
        heading: '3. Floating-Point Numbers and Representation Inexactness',
        content: 'Python floats are standard 64-bit double-precision IEEE 754 values. Because fractional numbers like 0.1 cannot be represented exactly in binary floating-point, calculations like <code>0.1 + 0.2</code> yield <code>0.30000000000000004</code>. When testing float equality, never use <code>==</code>; use <code>math.isclose(a, b)</code> or the <code>decimal.Decimal</code> class for financial computations.'
      }
    ],

    syntax: {
      pattern: `# Variable Assignment & Type Annotations
variable_name: type = value

# Identity vs Equality Check
is_identical: bool = (a is b)
is_equal: bool = (a == b)

# Safe Float Comparison
import math
matches: bool = math.isclose(x, y, rel_tol=1e-9)`,
      components: [
        { part: 'a: int = 100', meaning: 'Variable assignment with optional static type annotation' },
        { part: 'a is b', meaning: 'Identity check comparing underlying memory addresses' },
        { part: 'math.isclose(x, y)', meaning: 'Tolerance-based equality check for IEEE 754 floats' },
        { part: 'x is None', meaning: 'Canonical singleton identity comparison for None' }
      ]
    },

    examples: [
      {
        title: 'Inspecting Memory Addresses, Interning, and Float Precision',
        description: 'Demonstrating object identity, integer caching, and safe floating-point calculations.',
        code: `import math
from decimal import Decimal

# 1. Object Identity & Reassignment
x = 1000
y = 1000
print(f"x == y: {x == y} (Values match)")
print(f"x is y: {x is y} (Different heap allocations)")

# 2. Small Integer Interning (-5 to 256)
a = 250
b = 250
print(f"a is b: {a is b} (Cached CPython singleton)")

# 3. Float Precision Gotcha
f1 = 0.1 + 0.2
f2 = 0.3
print(f"0.1 + 0.2 == 0.3: {f1 == f2}")
print(f"Actual sum: {f1:.17f}")
print(f"math.isclose(f1, f2): {math.isclose(f1, f2)}")

# 4. Financial Precision with Decimal
d1 = Decimal("0.1")
d2 = Decimal("0.2")
print(f"Decimal exact sum: {d1 + d2} == Decimal('0.3'): {d1 + d2 == Decimal('0.3')}")`,
        output: `x == y: True (Values match)
x is y: False (Different heap allocations)
a is b: True (Cached CPython singleton)
0.1 + 0.2 == 0.3: False
Actual sum: 0.30000000000000004
math.isclose(f1, f2): True
Decimal exact sum: 0.3 == Decimal('0.3'): True`,
        explanation: [
          'Line 5-8: `1000` exceeds the pre-allocated integer cache, so separate heap objects are created; values match but `is` is False.',
          'Line 11-14: `250` falls inside the interned range (-5 to 256), so CPython reuses the exact same singleton instance.',
          'Line 17-21: IEEE 754 binary floating-point representation cannot represent 0.1 exactly. `math.isclose()` handles the tolerance margin.',
          'Line 24-26: `Decimal` uses base-10 arithmetic, providing exact numbers required for currency and banking.'
        ]
      }
    ],

    notes: [
      {
        type: 'info',
        title: 'Arbitrary Precision Integers',
        body: 'Unlike C or Java where integers overflow at 32-bit (2.14B) or 64-bit bounds, Python 3 integers automatically scale to the limits of available computer RAM.'
      },
      {
        type: 'warning',
        title: 'Comparing to None',
        body: 'Always use `if x is None:` or `if x is not None:`. Do not use `== None` because custom classes can define `__eq__` to return unexpected truths.'
      },
      {
        type: 'tip',
        title: 'Use Underscores in Numeric Literals',
        body: 'You can write large numbers with underscores for readability: `population = 8_000_000_000`. Python ignores underscores in numbers.'
      }
    ],

    commonMistakes: [
      {
        mistake: 'Using `is` Instead of `==` for String or Number Comparisons',
        incorrectCode: `# Bug: Might be True in small tests due to interning, but fails unpredictably
user_input = input("Enter command: ")  # user types "exit"
if user_input is "exit":
    print("Exiting...")`,
        correctCode: `# Correct: Value equality
user_input = input("Enter command: ")
if user_input == "exit":
    print("Exiting...")`,
        why: '`is` tests whether two variables point to the same memory address. Dynamically created strings are not guaranteed to be interned, causing `is` to evaluate to False even when the string characters are identical.'
      },
      {
        mistake: 'Passing Floats into Decimal Constructor as Float Literals',
        incorrectCode: `# Decimal inherits the float's IEEE representation error
bad_dec = Decimal(0.1)`,
        correctCode: `# Pass as string to preserve human decimal representation
good_dec = Decimal("0.1")`,
        why: 'Passing `0.1` as a float converts the already imprecise float binary representation into Decimal, preserving the decimal artifact.'
      }
    ],

    comparisons: [
      {
        title: 'Python Primitive Data Types Overview',
        headers: ['Type', 'Mutability', 'Description', 'Literal Example'],
        rows: [
          ['int', 'Immutable', 'Arbitrary-precision signed integer', '42, -999, 1_000_000'],
          ['float', 'Immutable', '64-bit IEEE 754 double precision', '3.14159, -0.001, 2.5e-4'],
          ['bool', 'Immutable', 'Boolean truth value (subclass of int)', 'True, False'],
          ['str', 'Immutable', 'Unicode text sequence (UTF-8 in memory)', '"hello", \'python\''],
          ['NoneType', 'Immutable', 'Unique singleton representing empty state', 'None']
        ]
      }
    ],

    questions: [
      {
        question: 'Why does `a = 5; b = 5; a is b` evaluate to True in Python?',
        answer: 'Due to CPython small integer interning.',
        explanation: 'CPython pre-allocates small integers from -5 to 256 at startup. When code references `5`, both `a` and `b` are assigned the memory pointer of that singleton instance.'
      },
      {
        question: 'How do you check if variable `result` is of type integer without breaking inheritance?',
        answer: 'Using `isinstance(result, int)`.',
        explanation: '`isinstance(x, T)` is preferred over `type(x) == T` because it supports subclasses (e.g. `isinstance(True, int)` is True because bool inherits from int).'
      }
    ],

    practice: [
      {
        id: 'py-var-ex1',
        title: 'Safe Numerical Validation & Swapping',
        difficulty: 'Beginner',
        prompt: 'Given two float variables `val1` and `val2`, write a function that swaps their values without a temporary variable, and checks if their product is approximately equal to a target float within a 1e-6 tolerance.',
        starterCode: `import math

def swap_and_check(val1: float, val2: float, target: float) -> tuple[float, float, bool]:
    # Your code here
    pass`,
        solution: `import math

def swap_and_check(val1: float, val2: float, target: float) -> tuple[float, float, bool]:
    # Tuple packing and unpacking swap
    val1, val2 = val2, val1
    
    product = val1 * val2
    is_approx = math.isclose(product, target, rel_tol=1e-6)
    return val1, val2, is_approx`,
        explanation: 'Python enables tuple packing and unpacking (`val1, val2 = val2, val1`) to swap variables atomically without temporary variables. `math.isclose` provides safe float tolerance checking.'
      }
    ],

    references: [
      {
        title: 'Official Python Documentation: Built-in Numeric Types',
        type: 'Official Docs',
        url: 'https://docs.python.org/3/library/stdtypes.html#numeric-types-int-float-complex'
      },
      {
        title: 'Python decimal — Decimal fixed point and floating point arithmetic',
        type: 'Official Docs',
        url: 'https://docs.python.org/3/library/decimal.html'
      }
    ]
  });

})();
