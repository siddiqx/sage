/**
 * Sage — Python Topic 08: Tuples & Immutability
 */

(function () {
  'use strict';

  SAGE.registerTopic({
    id: 'py-tuples',
    title: 'Tuples, Immutability & Named Records',
    subject: 'python',
    module: 'Data Structures',
    description: 'Tuple immutability, conditional hashability, memory optimization, unpacking semantics, and typing.NamedTuple records.',
    difficulty: 'Beginner',
    readTime: '13 min read',

    overview: {
      definition: 'A tuple is an ordered, immutable sequence of elements. While lists represent variable-length collections of typically homogeneous items, tuples are traditionally used as fixed-length heterogeneous records (e.g., database rows, coordinates, key-value pairs). Because tuples cannot change size after allocation, they are memory-efficient and conditionally hashable.',
      mentalModel: 'Think of a tuple as a sealed, tamper-proof envelope containing specific data slots. Once the envelope is glued shut, no slots can be added, removed, or swapped. However, if an object inside a slot is mutable (like a list), the contents of that list can still change while the envelope\'s pointer remains constant.'
    },

    terminology: [
      {
        term: 'Immutability',
        definition: 'Once created, the memory pointers inside a tuple cannot be reassigned or deleted. Attempts to do `t[0] = x` raise a TypeError.'
      },
      {
        term: 'Conditional Hashability',
        definition: 'A tuple is hashable (and can be used as a dictionary key or set element) IF AND ONLY IF every element inside the tuple is also hashable.'
      },
      {
        term: 'Single-Element Tuple Gotcha',
        definition: 'A single item inside parentheses `(42)` is an integer. To define a 1-item tuple, a trailing comma is required: `(42,)`.'
      },
      {
        term: 'Tuple Packing & Unpacking',
        definition: 'Values separated by commas are automatically packed into a tuple; unpacking assigns elements directly to individual variable targets.'
      },
      {
        term: '`NamedTuple`',
        definition: 'A tuple subclass (from `collections` or `typing`) that allows fields to be accessed by attribute name (e.g. `point.x`) as well as index, with zero memory overhead over regular tuples.'
      }
    ],

    explanation: [
      {
        heading: '1. Why Use Tuples Instead of Lists?',
        content: 'There are three major architectural reasons to choose tuples:<br><ul><li><strong>Safety & Defensive Programming:</strong> Tuples guarantee that data passed to functions or threads cannot be accidentally modified.</li><li><strong>Memory & Performance:</strong> Because tuples have a fixed size, CPython does not allocate a resizing buffer. Tuples take less memory and CPython maintains a freelist for rapid allocation of small tuples.</li><li><strong>Dictionary Keys:</strong> Tuples containing immutable values can be hashed, making them ideal for composite database keys or memoization caches (e.g., <code>cache[(user_id, date)] = result</code>).</li></ul>'
      },
      {
        heading: '2. The Mutation Paradox: Tuples Containing Mutable Objects',
        content: 'A common misconception is that a tuple makes its children immutable. It does not!<br>The tuple only locks its own array of memory pointers. If one of those pointers references a mutable list: <code>t = (1, [2, 3])</code>, the list itself can still be modified: <code>t[1].append(4)</code> is completely valid! However, because the list is unhashable, the entire tuple becomes unhashable.'
      },
      {
        heading: '3. Type-Safe Records with `typing.NamedTuple`',
        content: 'When tuples represent data records (like coordinates or database rows), indexing by numbers (`record[0]`, `record[1]`) leads to unreadable code. Use `typing.NamedTuple` to give fields readable names and static types while maintaining tuple immutability and unpacking support.'
      }
    ],

    syntax: {
      pattern: `# 1. Tuple Creation
empty_tuple = ()
single_item = (42,)          # Trailing comma is required!
record = ("Alice", 28, "Engineer")

# 2. Unpacking & Swapping
name, age, role = record
a, b = b, a                  # Atomic variable swap

# 3. NamedTuple Definition (Python 3.7+)
from typing import NamedTuple

class GeoCoordinate(NamedTuple):
    latitude: float
    longitude: float
    elevation_meters: float = 0.0`,
      components: [
        { part: '(val,)', meaning: 'Trailing comma distinguishes a 1-item tuple from parenthesized expressions' },
        { part: 'a, b = b, a', meaning: 'Tuple packing and unpacking swaps variables without temporary variables' },
        { part: 'NamedTuple', meaning: 'Creates an immutable record with named attribute access and static types' }
      ]
    },

    examples: [
      {
        title: 'Tuples as Dictionary Keys, Immutability Gotcha, and NamedTuple',
        description: 'Demonstrating composite dictionary keys, mutable objects inside tuples, and typed NamedTuples.',
        code: `import sys
from typing import NamedTuple

# 1. Tuples as Composite Dictionary Keys
flight_grid = {}
origin_destination = ("JFK", "LHR")
flight_grid[origin_destination] = 3450  # Distance in nautical miles
print(f"Distance for {origin_destination}: {flight_grid[('JFK', 'LHR')]} nm")

# 2. Single-element Tuple Syntax Trap
not_a_tuple = (100)
is_a_tuple = (100,)
print(f"\\ntype((100)):  {type(not_a_tuple).__name__}")
print(f"type((100,)): {type(is_a_tuple).__name__}")

# 3. Mutable Object Inside a Tuple
nested = (1, [2, 3])
print(f"\\nInitial nested tuple: {nested}")
nested[1].append(4)  # Mutating the list inside the tuple!
print(f"After nested list mutation: {nested}")

try:
    hash(nested)  # Fails!
except TypeError as err:
    print(f"Hash failed: {err}")

# 4. Modern NamedTuple
class ServerNode(NamedTuple):
    hostname: str
    ip_address: str
    port: int
    is_active: bool = True

node = ServerNode("prod-db-01", "10.0.1.50", 5432)
print(f"\\nServer Node: {node.hostname} at {node.ip_address}:{node.port}")
print(f"Unpacking works: {node[0]} == {node.hostname}")`,
        output: `Distance for ('JFK', 'LHR'): 3450 nm

type((100)):  int
type((100,)): tuple

Initial nested tuple: (1, [2, 3])
After nested list mutation: (1, [2, 3, 4])
Hash failed: unhashable type: 'list'

Server Node: prod-db-01 at 10.0.1.50:5432
Unpacking works: prod-db-01 == prod-db-01`,
        explanation: [
          'Line 5-8: Demonstrates composite keys: `("JFK", "LHR")` is hashable, making multi-dimensional indexing straightforward.',
          'Line 11-15: Highlights the classic trailing comma necessity for single-element tuples.',
          'Line 18-25: Explains how a mutable list inside a tuple can be modified, which immediately strips the tuple of its hashability.',
          'Line 28-36: `ServerNode` inherits tuple immutability and unpacking while providing dot-notation field access.'
        ]
      }
    ],

    notes: [
      {
        type: 'warning',
        title: 'The Augment Assignment Gotcha with Tuples',
        body: 'Writing `t = (1, [2]); t[1] += [3]` will actually modify the list AND raise a `TypeError: "tuple" object does not support item assignment`! This happens because `+=` modifies the list in place, but then attempts to re-assign the list pointer back into the immutable tuple slot.'
      },
      {
        type: 'info',
        title: 'Memory Overhead Comparison',
        body: 'An empty tuple takes 40 bytes in CPython; an empty list takes 56 bytes plus its resizing buffer. Tuples save substantial memory when storing millions of fixed records.'
      },
      {
        type: 'tip',
        title: 'NamedTuple vs Dataclass(frozen=True)',
        body: 'Both offer immutable records, but `NamedTuple` is a true tuple (supports tuple indexing and unpacking with minimal memory). `dataclass(frozen=True)` is a standard Python class with more flexibility for custom inheritance.'
      }
    ],

    commonMistakes: [
      {
        mistake: 'Forgetting the Trailing Comma on 1-Item Tuples',
        incorrectCode: `# Bug: Evaluates as a simple string, not a tuple!
roles = ("admin")
# len(roles) is 5 (counts characters: 'a', 'd', 'm', 'i', 'n')`,
        correctCode: `# Correct: Trailing comma defines a 1-tuple
roles = ("admin",)
# len(roles) is 1`,
        why: 'In Python syntax, parentheses are used for expression grouping. The comma `,` is what actually constructs a tuple in memory.'
      },
      {
        mistake: 'Attempting to Use a Tuple with Nested Lists as a Dict Key',
        incorrectCode: `cache = {}
key = ("user_10", ["permission_a", "permission_b"])
# TypeError: unhashable type: 'list'
cache[key] = True`,
        correctCode: `# Ensure all nested elements are immutable
key = ("user_10", ("permission_a", "permission_b"))
cache[key] = True`,
        why: 'Dictionary keys must have a stable hash value. If any element within a tuple is mutable, the hash cannot be computed.'
      }
    ],

    comparisons: [
      {
        title: 'Tuples vs Lists vs NamedTuples',
        headers: ['Property', 'Tuple (`tuple`)', 'List (`list`)', 'NamedTuple (`NamedTuple`)'],
        rows: [
          ['Mutability', 'Immutable', 'Mutable', 'Immutable'],
          ['Memory Size', 'Minimal (fixed buffer)', 'Higher (over-allocated buffer)', 'Minimal (identical to tuple)'],
          ['Attribute Access', 'Index only (`t[0]`)', 'Index only (`lst[0]`)', 'Named dot-access (`t.field`) & index'],
          ['Dictionary Key', 'Yes (if contents hashable)', 'No (Unhashable)', 'Yes (if contents hashable)']
        ]
      }
    ],

    questions: [
      {
        question: 'Can a tuple be modified after it is created?',
        answer: 'No, the tuple\'s pointer array is strictly immutable.',
        explanation: 'You cannot add, remove, or swap elements. However, if an object referenced by the tuple is itself mutable (such as a list), the contents of that child object can change.'
      },
      {
        question: 'Why does `x = (42)` have type `int` while `x = (42,)` has type `tuple`?',
        answer: 'Because parentheses without commas represent algebraic grouping.',
        explanation: 'Python uses commas to define tuple sequences. Parentheses are only required for precedence disambiguation or creating empty tuples `()`.'
      }
    ],

    practice: [
      {
        id: 'py-tup-ex1',
        title: 'Geographic Distance Record with NamedTuple',
        difficulty: 'Beginner',
        prompt: 'Define a `NamedTuple` called `Point2D` with integer coordinates `x` and `y`. Write a function `manhattan_distance(p1: Point2D, p2: Point2D) -> int` that calculates `|x1 - x2| + |y1 - y2|`.',
        starterCode: `from typing import NamedTuple

# Define Point2D and distance function
pass`,
        solution: `from typing import NamedTuple

class Point2D(NamedTuple):
    x: int
    y: int

def manhattan_distance(p1: Point2D, p2: Point2D) -> int:
    return abs(p1.x - p2.x) + abs(p1.y - p2.y)`,
        explanation: '`Point2D` provides clean attribute access `p1.x` and `p1.y` while retaining the immutability and lightweight memory footprint of standard tuples.'
      }
    ],

    references: [
      {
        title: 'Python Documentation: Tuples and Sequences',
        type: 'Official Docs',
        url: 'https://docs.python.org/3/tutorial/datastructures.html#tuples-and-sequences'
      },
      {
        title: 'Python typing.NamedTuple Specification',
        type: 'Official Docs',
        url: 'https://docs.python.org/3/library/typing.html#typing.NamedTuple'
      }
    ]
  });

})();
