/**
 * Sage — Python Topic 09: Sets, Hash Tables & Set Operations
 */

(function () {
  'use strict';

  SAGE.registerTopic({
    id: 'py-sets',
    title: 'Sets, Hash Tables & Set Algebra',
    subject: 'python',
    module: 'Data Structures',
    description: 'Hash table internals, O(1) membership testing, mathematical set algebra, deduplication, and frozenset immutability.',
    difficulty: 'Beginner',
    readTime: '14 min read',

    overview: {
      definition: 'A Python set is a mutable, unordered collection of distinct, hashable objects implemented internally as a hash table with dummy collision slots. Sets provide average O(1) constant-time membership testing (`x in s`), additions, and removals. Python also provides an immutable counterpart, `frozenset`.',
      mentalModel: 'Think of a set as a dictionary that stores only keys without any associated values. When you check `item in my_set`, Python calculates `hash(item)`, maps it directly to a bucket index in memory, and immediately verifies if the element exists in O(1) time without scanning through other elements.'
    },

    terminology: [
      {
        term: 'Hash Table with Open Addressing',
        definition: 'CPython sets resolve hash collisions using open addressing with a pseudo-random perturbation sequence to probe subsequent slots.'
      },
      {
        term: 'Hashability',
        definition: 'An object is hashable if it has an invariant hash value across its lifetime (`__hash__()`) and can be compared for equality (`__eq__()`). Mutable containers (lists, dicts, sets) are unhashable.'
      },
      {
        term: '`frozenset`',
        definition: 'An immutable version of a set. Because it cannot be modified after instantiation, it is hashable and can be stored inside another set or used as a dictionary key.'
      },
      {
        term: 'Symmetric Difference (`^`)',
        definition: 'Mathematical set operation returning elements present in either set, but NOT in both (the opposite of intersection).'
      },
      {
        term: 'Empty Set Literal Trap',
        definition: '`{}` constructs an empty dictionary in Python. To instantiate an empty set, you must call the constructor `set()`.'
      }
    ],

    explanation: [
      {
        heading: '1. Why Sets Provide Instant O(1) Membership Testing',
        content: 'Searching for an item in a list with 1,000,000 items requires checking every element one by one (O(N) linear time). In contrast, checking <code>x in my_set</code> computes the 64-bit integer hash of <code>x</code>, masks it to the table size, and checks that exact memory slot in <strong>O(1) constant time</strong> regardless of whether the set contains 10 or 10,000,000 elements.'
      },
      {
        heading: '2. Mathematical Set Operations: Operators vs Methods',
        content: 'Python supports both symbolic operators and named methods for set algebra:<br><ul><li><strong>Union:</strong> <code>a | b</code> or <code>a.union(b)</code> (all elements from either set).</li><li><strong>Intersection:</strong> <code>a & b</code> or <code>a.intersection(b)</code> (elements present in both sets).</li><li><strong>Difference:</strong> <code>a - b</code> or <code>a.difference(b)</code> (elements in `a` but not in `b`).</li><li><strong>Symmetric Difference:</strong> <code>a ^ b</code> (elements in exactly one set).</li></ul>Crucial distinction: Operators (like <code>|</code>) require both operands to be sets, whereas methods (like <code>a.union(iterable)</code>) accept any iterable (lists, tuples, generators).'
      },
      {
        heading: '3. When to Use `frozenset`',
        content: 'Because standard sets are mutable, you cannot create a "set of sets": <code>{{1, 2}, {3, 4}}</code> will raise <code>TypeError: unhashable type: \'set\'</code>.<br>To nest sets or use a set as a cache key, wrap the inner collections in <code>frozenset({1, 2})</code>.'
      }
    ],

    syntax: {
      pattern: `# 1. Creation
empty_set = set()           # NOT {}!
unique_nums = {1, 2, 3, 3, 2}  # Evaluates to {1, 2, 3}

# 2. Mathematical Set Algebra
union_set        = set_a | set_b
intersection_set = set_a & set_b
difference_set   = set_a - set_b
sym_diff_set     = set_a ^ set_b

# 3. Subsets & Disjoint Checks
is_subset = set_a <= set_b   # or set_a.issubset(set_b)
is_disjoint = set_a.isdisjoint(set_b)

# 4. Immutable frozenset
immutable_key = frozenset(["admin", "editor"])`,
      components: [
        { part: 'set()', meaning: 'Required constructor for empty sets ({} creates a dict)' },
        { part: 'a & b', meaning: 'Intersection: elements shared by both sets' },
        { part: 'a - b', meaning: 'Difference: elements in a with all elements in b removed' },
        { part: 'frozenset(seq)', meaning: 'Immutable, hashable set suitable as dictionary key or set element' }
      ]
    },

    examples: [
      {
        title: 'Auditing User Permissions with Set Algebra',
        description: 'Using union, difference, and intersection to calculate effective access permissions and security diffs.',
        code: `admin_permissions = {"read", "write", "delete", "audit", "billing"}
user_permissions = {"read", "write", "comment"}

# 1. Intersection: Shared permissions
shared = admin_permissions & user_permissions
print(f"Shared capabilities: {shared}")

# 2. Difference: Exclusive to Admin
admin_only = admin_permissions - user_permissions
print(f"Admin-exclusive:     {admin_only}")

# 3. Symmetric Difference: Unique to either role, but not both
divergent = admin_permissions ^ user_permissions
print(f"Divergent permissions: {divergent}")

# 4. Subset Check
standard_role = {"read", "comment"}
print(f"Is standard_role a subset of user_permissions? {standard_role <= user_permissions}")

# 5. frozenset as Cache Key
role_cache = {}
role_combination = frozenset(["analyst", "viewer"])
role_cache[role_combination] = "Read-Only Reporting Dashboard"
print(f"Cached dashboard: {role_cache[frozenset(['viewer', 'analyst'])]}")`,
        output: `Shared capabilities: {'read', 'write'}
Admin-exclusive:     {'audit', 'billing', 'delete'}
Divergent permissions: {'comment', 'audit', 'billing', 'delete'}
Is standard_role a subset of user_permissions? True
Cached dashboard: Read-Only Reporting Dashboard`,
        explanation: [
          'Line 5: `&` isolates capabilities granted to both roles in a single O(min(len(A), len(B))) operation.',
          'Line 9: `-` calculates security deltas to verify what permissions standard users lack.',
          'Line 13: `^` identifies divergent privileges across roles.',
          'Line 17: `<= (issubset)` performs rapid permission boundary checks.',
          'Line 21-24: `frozenset` orders elements identically by hash, ensuring order-independent cache lookup.'
        ]
      }
    ],

    notes: [
      {
        type: 'warning',
        title: 'Sets Do Not Preserve Order',
        body: 'Although Python 3.7+ preserves insertion order in dictionaries, sets do NOT guarantee element order! If you need ordered unique elements, use `dict.fromkeys(iterable)`.'
      },
      {
        type: 'info',
        title: '`set.discard()` vs `set.remove()`',
        body: '`set.remove(x)` raises a `KeyError` if `x` is not present in the set. `set.discard(x)` removes `x` if present and silently does nothing if absent.'
      },
      {
        type: 'tip',
        title: 'Deduplicating While Preserving Order',
        body: 'Writing `list(set(items))` removes duplicates but scrambles item order. To deduplicate while preserving original sequence order: `list(dict.fromkeys(items))`.'
      }
    ],

    commonMistakes: [
      {
        mistake: 'Using `{}` to Create an Empty Set',
        incorrectCode: `# Bug: Creates an empty dict, NOT a set!
s = {}
s.add(10)  # AttributeError: 'dict' object has no attribute 'add'`,
        correctCode: `# Correct: Explicit constructor
s = set()
s.add(10)`,
        why: 'In Python grammar, `{}` was historically reserved for empty dictionaries before sets were added to the language.'
      },
      {
        mistake: 'Attempting to Add Mutable Objects (Lists or Dictionaries) to a Set',
        incorrectCode: `# TypeError: unhashable type: 'list'
visited_paths = set()
visited_paths.add(["step1", "step2"])`,
        correctCode: `# Convert list to an immutable tuple first
visited_paths = set()
visited_paths.add(("step1", "step2"))`,
        why: 'Sets compute hash buckets based on object hashes. Because lists can be mutated in place, their hash would change dynamically, breaking hash table integrity.'
      }
    ],

    comparisons: [
      {
        title: 'Set Operators vs Set Methods',
        headers: ['Feature', 'Set Operators (`|`, `&`, `-`, `^`)', 'Set Methods (`.union()`, `.intersection()`, etc.)'],
        rows: [
          ['Argument Types', 'Both sides MUST be set/frozenset instances', 'Accepts any iterable (list, tuple, string, generator)'],
          ['Syntax Example', '`set_a | set_b`', '`set_a.union([1, 2, 3])`'],
          ['Readability', 'Mathematical, concise', 'Explicit, readable in complex pipelines']
        ]
      }
    ],

    questions: [
      {
        question: 'Why is `x in set_obj` average O(1) time complexity while `x in list_obj` is O(N)?',
        answer: 'Sets use a hash table to jump directly to the target memory bucket, whereas lists scan sequentially from index 0.',
        explanation: 'Computing the hash of an object gives the direct bucket location in memory, eliminating the need to examine other elements.'
      },
      {
        question: 'How do you create an empty set in Python?',
        answer: '`set()`',
        explanation: '`{}` evaluates to an empty dictionary (`dict`), while `set()` invokes the set type constructor.'
      }
    ],

    practice: [
      {
        id: 'py-set-ex1',
        title: 'Find Common and Unique Words Across Two Documents',
        difficulty: 'Beginner',
        prompt: 'Given two text strings `doc1` and `doc2`, write a function `text_diff(doc1: str, doc2: str) -> tuple[set, set]` that returns a tuple containing: (1) words appearing in both documents, and (2) words appearing in doc1 but not doc2 (ignoring case).',
        starterCode: `def text_diff(doc1: str, doc2: str) -> tuple[set[str], set[str]]:
    # Your code here
    pass`,
        solution: `def text_diff(doc1: str, doc2: str) -> tuple[set[str], set[str]]:
    words1 = set(doc1.lower().split())
    words2 = set(doc2.lower().split())
    
    common = words1 & words2
    exclusive_to_doc1 = words1 - words2
    return common, exclusive_to_doc1`,
        explanation: 'Splitting lowercased strings into sets deduplicates the words. `&` finds common words and `-` identifies words exclusive to the first document in linear time.'
      }
    ],

    references: [
      {
        title: 'Python Documentation: Set Types — set, frozenset',
        type: 'Official Docs',
        url: 'https://docs.python.org/3/library/stdtypes.html#set-types-set-frozenset'
      },
      {
        title: 'CPython Set Implementation Details',
        type: 'Official Docs',
        url: 'https://github.com/python/cpython/blob/main/Objects/setobject.c'
      }
    ]
  });

})();
