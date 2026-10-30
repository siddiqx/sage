/**
 * Sage — Python Topic 10: Dictionaries & Hash Maps
 */

(function () {
  'use strict';

  SAGE.registerTopic({
    id: 'py-dictionaries',
    title: 'Dictionaries, Compact Hash Maps & Views',
    subject: 'python',
    module: 'Data Structures',
    description: 'Python\'s compact dictionary architecture, insertion-order guarantee, dynamic dictionary views, merging operators (|), and defaultdict.',
    difficulty: 'Beginner',
    readTime: '16 min read',

    overview: {
      definition: 'A dictionary (`dict`) in Python is an ordered, mutable mapping of unique, hashable keys to arbitrary value objects. Since Python 3.6 (and guaranteed in 3.7+), Python dictionaries use a revolutionary compact hash-table layout that preserves insertion order while reducing memory consumption by 20–25%. Dictionaries provide average O(1) time complexity for lookups, insertions, and deletions.',
      mentalModel: 'Think of a dictionary as two synchronized arrays: (1) a sparse hash index table containing integers, and (2) a dense, tightly packed entries array storing `[hash, key_pointer, value_pointer]` in the exact order they were inserted. Hash lookups jump to the index table to find the entry slot, preserving order without linked-list overhead.'
    },

    terminology: [
      {
        term: 'Compact Hash Table (PEP 468)',
        definition: 'CPython dictionary implementation that separates sparse hash indices from dense entries, saving memory and preserving chronological insertion order.'
      },
      {
        term: 'Dictionary Views (`keys()`, `values()`, `items()`)',
        definition: 'Dynamic window objects reflecting changes to the underlying dictionary immediately, without allocating separate copy lists.'
      },
      {
        term: 'Dictionary Merge (`|` and `|=`)',
        definition: 'Introduced in Python 3.9 (PEP 584), `d1 | d2` merges two dictionaries into a new dict; `d1 |= d2` updates `d1` in place.'
      },
      {
        term: '`collections.defaultdict`',
        definition: 'A dictionary subclass that calls a factory function (e.g. `list`, `int`) to automatically provide a default value when a missing key is accessed.'
      },
      {
        term: '`dict.setdefault(key, default)`',
        definition: 'If `key` is in the dictionary, returns its value; otherwise inserts `key` with value `default` and returns `default`.'
      }
    ],

    explanation: [
      {
        heading: '1. Compact Memory Architecture & Insertion Order',
        content: 'Before Python 3.6, dictionaries used a large sparse array where each row held <code>[hash, key, value]</code>. Most rows were empty memory slots, wasting 66% of table space.<br><br>The modern compact layout uses:<br><ul><li>A small array of 1-byte indices: <code>[-1, 0, -1, 1, -1]</code></li><li>A dense array of entries: <code>entries = [[h1, k1, v1], [h2, k2, v2]]</code></li></ul>Because new entries are always appended to the dense array, dictionaries naturally preserve insertion order with zero extra memory overhead!'
      },
      {
        heading: '2. Safe Access: `[]` vs `.get()` vs `defaultdict`',
        content: 'Accessing <code>d["missing"]</code> immediately raises a <code>KeyError</code>.<br><ul><li>Use <code>d.get(key, default)</code> when a missing key is expected and should fall back gracefully.</li><li>Use <code>d.setdefault(key, [])</code> when building groupings in basic scripts.</li><li>Use <code>collections.defaultdict(list)</code> in production code for grouping, which eliminates boilerplate if-checks entirely.</li></ul>'
      },
      {
        heading: '3. Modern Merging: The `|` Operator (Python 3.9+)',
        content: 'Python 3.9 introduced the union operators for dictionaries:<br><ul><li><code>combined = defaults | overrides</code> (Right side overrides left on collision).</li><li><code>config |= updates</code> (Updates config in place).</li></ul>This is cleaner and more readable than <code>{**d1, **d2}</code> and does not mutate variables like <code>d1.update(d2)</code>.'
      }
    ],

    syntax: {
      pattern: `# 1. Creation & Safe Access
user = {"id": 101, "name": "Alice"}
role = user.get("role", "viewer")     # Returns "viewer" instead of KeyError

# 2. Modern Dictionary Merge (Python 3.9+)
merged_config = default_config | user_overrides
default_config |= user_overrides      # In-place update

# 3. Dynamic Views
for key, val in user.items():
    print(f"{key}: {val}")

# 4. Grouping with defaultdict
from collections import defaultdict
grouped = defaultdict(list)
grouped["admins"].append("alice")     # Auto-creates empty list!`,
      components: [
        { part: 'd.get(key, default)', meaning: 'Safe lookup returning fallback default if key does not exist' },
        { part: 'd1 | d2', meaning: 'Creates new dictionary merging d1 and d2 (right-hand side wins collisions)' },
        { part: 'd.items()', meaning: 'Dynamic (key, value) view object reflecting changes in real time' },
        { part: 'defaultdict(factory)', meaning: 'Calls factory() on missing key access to initialize default values' }
      ]
    },

    examples: [
      {
        title: 'Grouping Records with defaultdict and Modern Dictionary Merging',
        description: 'Demonstrating grouped aggregations, dictionary views, and union operators.',
        code: `from collections import defaultdict

# 1. Grouping items by category with defaultdict
transactions = [
    {"category": "Hardware", "amount": 250},
    {"category": "Cloud",    "amount": 120},
    {"category": "Hardware", "amount": 80},
    {"category": "SaaS",     "amount": 45},
    {"category": "Cloud",    "amount": 310}
]

category_totals = defaultdict(float)
for tx in transactions:
    category_totals[tx["category"]] += tx["amount"]

print("--- Category Spending Totals ---")
for cat, total in category_totals.items():
    print(f"  {cat:<10}: \${total:,.2f}")

# 2. Modern Merge Operator (|)
base_settings = {"theme": "light", "notifications": True, "timeout": 30}
user_settings = {"theme": "dark", "timeout": 60}

# user_settings values overwrite base_settings
active_settings = base_settings | user_settings
print(f"\\nMerged Settings: {active_settings}")

# 3. Dynamic View Property
data = {"a": 1, "b": 2}
keys_view = data.keys()
print(f"\\nInitial keys view: {list(keys_view)}")
data["c"] = 3  # Mutating original dictionary
print(f"Updated keys view: {list(keys_view)} (View updated automatically!)")`,
        output: `--- Category Spending Totals ---
  Hardware  : \$330.00
  Cloud     : \$430.00
  SaaS      : \$45.00

Merged Settings: {'theme': 'dark', 'notifications': True, 'timeout': 60}

Initial keys view: ['a', 'b']
Updated keys view: ['a', 'b', 'c'] (View updated automatically!)`,
        explanation: [
          'Line 13-15: `defaultdict(float)` automatically initializes missing categories to 0.0 before adding amounts.',
          'Line 24-25: `base_settings | user_settings` creates a new dictionary where right-hand values win collisions.',
          'Line 28-32: Demonstrates that dictionary views (`keys()`) do not copy data; they dynamically mirror the underlying hash table.'
        ]
      }
    ],

    notes: [
      {
        type: 'info',
        title: 'Dictionary Keys Must Be Hashable',
        body: 'Keys can be strings, integers, floats, booleans, tuples (of immutable items), or custom objects implementing `__hash__` and `__eq__`. Lists, dicts, and sets CANNOT be keys.'
      },
      {
        type: 'warning',
        title: 'Modifying Keys While Iterating',
        body: 'Adding or deleting keys while iterating over `for k in d:` raises a `RuntimeError: dictionary changed size during iteration`. Iterate over `list(d.keys())` if you need to delete keys.'
      },
      {
        type: 'tip',
        title: 'Dictionary Comprehension',
        body: 'Transform dictionaries concisely: `{k: v * 2 for k, v in scores.items() if v >= 50}`.'
      }
    ],

    commonMistakes: [
      {
        mistake: 'Using `key in d.keys()` Instead of `key in d`',
        incorrectCode: `# Unnecessary method call and view lookup
if "user_id" in user_data.keys():
    pass`,
        correctCode: `# Direct dictionary membership test
if "user_id" in user_data:
    pass`,
        why: 'In Python, checking `key in d` queries the hash table directly in O(1) time without calling `.keys()`.'
      },
      {
        mistake: 'Mutating a Dictionary While Iterating Over It',
        incorrectCode: `# RuntimeError: dictionary changed size during iteration
for key in config:
    if key.startswith("temp_"):
        del config[key]`,
        correctCode: `# Iterate over a snapshot list of keys
for key in list(config.keys()):
    if key.startswith("temp_"):
        del config[key]`,
        why: 'Deleting an entry alters the internal table structure, invalidating active iterators.'
      }
    ],

    comparisons: [
      {
        title: 'Dictionary Access Patterns Comparison',
        headers: ['Pattern', 'Behavior on Missing Key', 'Mutates Dict?', 'Best Use Case'],
        rows: [
          ['`d[k]`', 'Raises `KeyError`', 'No', 'When key existence is a strict precondition'],
          ['`d.get(k, default)`', 'Returns `default` (or None)', 'No', 'Optional configuration or fallback values'],
          ['`d.setdefault(k, default)`', 'Inserts and returns `default`', 'Yes (if missing)', 'Simple one-off groupings'],
          ['`defaultdict(factory)`', 'Calls `factory()`, inserts and returns', 'Yes (on access)', 'Production aggregations, graphs, groupings']
        ]
      }
    ],

    questions: [
      {
        question: 'What ensures that Python dictionaries maintain insertion order in Python 3.7+?',
        answer: 'The compact hash table architecture.',
        explanation: 'Entries are appended to a dense array in the chronological order of insertion, while a separate sparse array stores indices into the entries table.'
      },
      {
        question: 'How do you safely merge two dictionaries `a` and `b` in Python 3.9+ so that `b` overrides `a`?',
        answer: '`merged = a | b`',
        explanation: 'The `|` operator creates a new dictionary combining both operands, with values from the right-hand operand (`b`) taking precedence for matching keys.'
      }
    ],

    practice: [
      {
        id: 'py-dict-ex1',
        title: 'Word Frequency Analyzer with Inverted Index',
        difficulty: 'Beginner',
        prompt: 'Write a function `build_inverted_index(documents: list[str]) -> dict[str, list[int]]` that takes a list of document strings and returns a dictionary mapping each lowercased word to a sorted list of unique document indices where that word appears.',
        starterCode: `from collections import defaultdict

def build_inverted_index(documents: list[str]) -> dict[str, list[int]]:
    # Your code here
    pass`,
        solution: `from collections import defaultdict

def build_inverted_index(documents: list[str]) -> dict[str, list[int]]:
    index = defaultdict(set)
    for doc_id, text in enumerate(documents):
        for word in text.lower().split():
            index[word].add(doc_id)
            
    # Convert sets to sorted lists
    return {word: sorted(doc_ids) for word, doc_ids in index.items()}`,
        explanation: 'Using `defaultdict(set)` automatically manages unique document IDs per word. The final dictionary comprehension converts sets into sorted lists.'
      }
    ],

    references: [
      {
        title: 'Python Documentation: Mapping Types — dict',
        type: 'Official Docs',
        url: 'https://docs.python.org/3/library/stdtypes.html#mapping-types-dict'
      },
      {
        title: 'PEP 584 — Add Union Operators To dict',
        type: 'Official Docs',
        url: 'https://peps.python.org/pep-0584/'
      }
    ]
  });

})();
