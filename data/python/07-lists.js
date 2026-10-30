/**
 * Sage — Python Topic 07: Lists & Dynamic Arrays
 */

(function () {
  'use strict';

  SAGE.registerTopic({
    id: 'py-lists',
    title: 'Lists & Dynamic Arrays',
    subject: 'python',
    module: 'Data Structures',
    description: 'Dynamic array memory architecture, amortized O(1) appending, slicing, Timsort mechanics, shallow vs deep copying, and mutable reference hazards.',
    difficulty: 'Beginner',
    readTime: '16 min read',

    overview: {
      definition: 'A Python list is a mutable, ordered sequence of heterogeneous object references implemented internally as a dynamic array (`PyListObject` in CPython). Unlike fixed-size arrays in C or Java, Python lists dynamically resize their underlying contiguous buffer of pointers as items are appended or removed.',
      mentalModel: 'Imagine a list not as a box of items, but as a contiguous tray of index slots numbered 0 to N-1. Each slot holds a 64-bit memory pointer to an object located elsewhere in the heap. The tray itself is pre-allocated with extra empty slots so that adding an item to the end usually just fills an existing slot (amortized O(1) time).'
    },

    terminology: [
      {
        term: 'Contiguous Array of Pointers',
        definition: 'In CPython, a list does not store raw objects contiguously; it stores contiguous memory addresses pointing to Python objects anywhere on the heap.'
      },
      {
        term: 'Over-Allocation Strategy',
        definition: 'To achieve amortized O(1) append times, CPython allocates more slots than requested (growth pattern: 0, 4, 8, 16, 25, 35, 46, 58, 72...). Resizing happens geometrically.'
      },
      {
        term: 'Amortized Time Complexity',
        definition: 'While a single append that triggers a memory re-allocation takes O(N) time, across a sequence of N appends, the average time per append is strictly O(1).'
      },
      {
        term: 'Shallow Copy vs Deep Copy',
        definition: 'A shallow copy (`lst.copy()`) creates a new list tray pointing to the exact same child objects. A deep copy (`copy.deepcopy()`) recursively clones all nested objects.'
      },
      {
        term: 'Timsort / Powersort',
        definition: 'Python\'s highly optimized hybrid sorting algorithm (merge sort + insertion sort), with O(N log N) worst-case and O(N) best-case on partially sorted data.'
      }
    ],

    explanation: [
      {
        heading: '1. Memory Architecture & Big-O Time Complexity',
        content: 'Because a Python list is backed by a contiguous array of pointers in memory:<br><ul><li><strong>Indexing (<code>lst[i]</code>):</strong> <code>O(1)</code> instant access via pointer arithmetic (base address + index * pointer size).</li><li><strong>Append (<code>lst.append(x)</code>):</strong> <code>Amortized O(1)</code> because the pre-allocated buffer absorbs most additions.</li><li><strong>Pop from End (<code>lst.pop()</code>):</strong> <code>O(1)</code> constant time.</li><li><strong>Insert or Delete at Beginning (<code>lst.insert(0, x)</code>, <code>lst.pop(0)</code>):</strong> <code>O(N)</code> linear time because all subsequent pointers in memory must be shifted left or right. Use <code>collections.deque</code> for double-ended queues!</li><li><strong>Search by Value (<code>x in lst</code>, <code>lst.index(x)</code>):</strong> <code>O(N)</code> sequential scan.</li></ul>'
      },
      {
        heading: '2. Sorting: In-Place (`.sort()`) vs Pure Function (`sorted()`)',
        content: 'Python provides two sorting mechanisms:<br><ul><li><code>lst.sort()</code>: Sorts the list <strong>in place</strong>. It mutates the existing list and returns <code>None</code> to prevent accidental reassignment (e.g. <code>x = lst.sort()</code> sets x to None!).</li><li><code>sorted(lst)</code>: Returns a <strong>new</strong> sorted list without altering the original list.</li></ul>Both methods accept <code>reverse=True</code> and a <code>key=lambda x: ...</code> transformation function.'
      },
      {
        heading: '3. Extended Unpacking (PEP 3132)',
        content: `Python supports starred unpacking to cleanly partition lists into head, body, and tail components:<br><pre><code>first, *middle, last = [10, 20, 30, 40, 50]
# first = 10, middle = [20, 30, 40], last = 50</code></pre>`
      }
    ],

    syntax: {
      pattern: `# 1. Creation & Access
items = [1, "two", 3.0, True]
first_item = items[0]
last_item = items[-1]

# 2. Modifying Elements
items.append(4)               # Append to end O(1)
items.extend([5, 6])          # Extend multiple O(K)
popped = items.pop()          # Remove from end O(1)

# 3. Sorting with Custom Keys
items.sort(key=lambda x: x["score"], reverse=True)
new_sorted = sorted(items, key=len)

# 4. Extended Unpacking
head, *tail = items`,
      components: [
        { part: 'lst.append(x)', meaning: 'Adds item to end of list in amortized O(1) time' },
        { part: 'lst.extend(iterable)', meaning: 'Appends all items from iterable into list in O(K) time' },
        { part: 'lst.sort(key=...)', meaning: 'In-place Timsort mutating the list; returns None' },
        { part: 'head, *tail = seq', meaning: 'Captures first item and packs remaining items into a new list' }
      ]
    },

    examples: [
      {
        title: 'Complete List Lifecycle: Resizing, Sorting, and Deep Copying',
        description: 'Demonstrating list operations, custom lambda sorting, memory aliasing gotchas, and deep cloning.',
        code: `import copy
import sys

# 1. Inspecting CPython Over-Allocation
sample_list = []
print(f"Empty list overhead: {sys.getsizeof(sample_list)} bytes")

allocated_sizes = []
for i in range(15):
    sample_list.append(i)
    allocated_sizes.append(sys.getsizeof(sample_list))

print(f"Size progression after 15 appends: {allocated_sizes}")

# 2. In-Place Sorting vs sorted() with Custom Key
students = [
    {"name": "Charlie", "gpa": 3.85, "age": 22},
    {"name": "Alice",   "gpa": 3.95, "age": 20},
    {"name": "Bob",     "gpa": 3.70, "age": 21}
]

# Sort by GPA descending
students.sort(key=lambda s: s["gpa"], reverse=True)
print("\\n--- Sorted by GPA (In-Place) ---")
for s in students:
    print(f"  {s['name']}: GPA {s['gpa']}")

# 3. Shallow Copy vs Deep Copy Gotcha
original_matrix = [[1, 2], [3, 4]]
shallow_matrix = original_matrix.copy()
deep_matrix = copy.deepcopy(original_matrix)

# Mutate nested sub-list in original
original_matrix[0][0] = 999

print("\\n--- Mutation Effects ---")
print(f"Original: {original_matrix}")
print(f"Shallow:  {shallow_matrix} (Inner list mutated because pointer is shared!)")
print(f"Deep:     {deep_matrix} (Unaffected because all nodes were cloned)")`,
        output: `Empty list overhead: 56 bytes
Size progression after 15 appends: [88, 88, 88, 88, 120, 120, 120, 120, 184, 184, 184, 184, 184, 184, 184]

--- Sorted by GPA (In-Place) ---
  Alice: GPA 3.95
  Charlie: GPA 3.85
  Bob: GPA 3.7

--- Mutation Effects ---
Original: [[999, 2], [3, 4]]
Shallow:  [[999, 2], [3, 4]] (Inner list mutated because pointer is shared!)
Deep:     [[1, 2], [3, 4]] (Unaffected because all nodes were cloned)`,
        explanation: [
          'Line 6-12: Demonstrates CPython geometric over-allocation: the byte size stays at 88 for 4 items, then jumps to 120, then 184.',
          'Line 15-22: `students.sort()` mutates the list using a lambda extractor key, returning `None`.',
          'Line 25-28: `shallow_matrix` creates a new outer list tray, but the pointers inside still point to the same child sub-lists `[1, 2]`.',
          'Line 31-36: Modifying `original_matrix[0][0]` alters the shared child list in `shallow_matrix`, but `deep_matrix` remains pristine.'
        ]
      }
    ],

    notes: [
      {
        type: 'warning',
        title: '`.sort()` Returns None',
        body: 'Writing `my_list = my_list.sort()` is a notorious beginner trap that destroys your data by setting `my_list = None`. Either call `my_list.sort()` alone, or write `my_list = sorted(my_list)`.'
      },
      {
        type: 'info',
        title: 'Negative Indexing Boundary',
        body: 'Negative indices wrap around from the end: `lst[-1]` is the last item, `lst[-len(lst)]` is the first item. Any index `< -len(lst)` raises an `IndexError`.'
      },
      {
        type: 'tip',
        title: 'Use Deque for FIFO Queues',
        body: 'If your algorithm needs frequent `insert(0, x)` or `pop(0)`, do not use a list (O(N) time). Import `from collections import deque`, which offers O(1) double-ended operations via a doubly linked block buffer.'
      }
    ],

    commonMistakes: [
      {
        mistake: 'Multiplying Nested Lists (List of Lists Aliasing)',
        incorrectCode: `# Bug: Creates 3 references to the EXACT SAME inner list!
matrix = [[0] * 3] * 3
matrix[0][0] = 1
# matrix is now [[1, 0, 0], [1, 0, 0], [1, 0, 0]]!`,
        correctCode: `# Correct: Use a list comprehension to allocate distinct sub-lists
matrix = [[0] * 3 for _ in range(3)]
matrix[0][0] = 1
# matrix is [[1, 0, 0], [0, 0, 0], [0, 0, 0]]`,
        why: 'The `*` repetition operator copies object references. For nested mutable lists, it duplicates the pointer to the same child list 3 times.'
      },
      {
        mistake: 'Using a Mutable List as a Default Parameter',
        incorrectCode: `# Bug: Default list is created ONCE when the function is defined!
def append_item(val, target=[]):
    target.append(val)
    return target

print(append_item(1))  # [1]
print(append_item(2))  # [1, 2] -- Accidental shared state!`,
        correctCode: `# Correct: Use None as default sentinel
def append_item(val, target=None):
    if target is None:
        target = []
    target.append(val)
    return target`,
        why: 'In Python, default parameter expressions are evaluated once at function definition time, not every time the function is called.'
      }
    ],

    comparisons: [
      {
        title: 'List vs Tuple vs Set vs Deque',
        headers: ['Data Structure', 'Order Preserved?', 'Mutable?', 'Average Lookup Time', 'Best Use Case'],
        rows: [
          ['List (`[]`)', 'Yes (indexed)', 'Yes', 'O(1) index, O(N) value', 'General-purpose dynamic sequences'],
          ['Tuple (`()`)', 'Yes (indexed)', 'No (immutable)', 'O(1) index, O(N) value', 'Fixed records, dictionary keys, constants'],
          ['Set (`{}`)', 'No (hash-based)', 'Yes', 'O(1) value lookup', 'Deduplication, membership checks, set math'],
          ['Deque (`deque`)', 'Yes (double-ended)', 'Yes', 'O(1) head/tail push/pop', 'FIFO queues, LIFO stacks, sliding windows']
        ]
      }
    ],

    questions: [
      {
        question: 'Why is `lst.insert(0, val)` an O(N) operation while `lst.append(val)` is amortized O(1)?',
        answer: 'Because inserting at index 0 requires shifting every existing pointer in memory right by one position.',
        explanation: 'A list is a contiguous memory array. Adding at the front displaces all N existing items. Appending at the end uses pre-allocated trailing capacity without moving prior items.'
      },
      {
        question: 'What is the value of `a = [1, 2, 3]; b = a; b.append(4); print(a)` and why?',
        answer: '`[1, 2, 3, 4]`',
        explanation: 'Assignment `b = a` does not copy the list; it binds `b` to the exact same list object in memory. Mutating `b` mutates the underlying list referenced by `a`.'
      }
    ],

    practice: [
      {
        id: 'py-list-ex1',
        title: 'Rotate List Right by K Positions',
        difficulty: 'Beginner',
        prompt: 'Write a function `rotate_right(nums: list[int], k: int) -> list[int]` that rotates a list to the right by `k` steps using list slicing without modifying the original list. For example: `[1, 2, 3, 4, 5]` with `k=2` becomes `[4, 5, 1, 2, 3]`.',
        starterCode: `def rotate_right(nums: list[int], k: int) -> list[int]:
    # Your code here
    pass`,
        solution: `def rotate_right(nums: list[int], k: int) -> list[int]:
    if not nums:
        return []
    # Normalize k to handle rotations larger than list length
    k = k % len(nums)
    if k == 0:
        return nums.copy()
    return nums[-k:] + nums[:-k]`,
        explanation: '`nums[-k:]` extracts the last k elements, and `nums[:-k]` extracts all elements before them. Concatenating the two slices produces the rotated list in O(N) time.'
      }
    ],

    references: [
      {
        title: 'Python Documentation: Data Structures — More on Lists',
        type: 'Official Docs',
        url: 'https://docs.python.org/3/tutorial/datastructures.html#more-on-lists'
      },
      {
        title: 'CPython Internal List Implementation Details',
        type: 'Official Docs',
        url: 'https://github.com/python/cpython/blob/main/Objects/listobject.c'
      }
    ]
  });

})();
