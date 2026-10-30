/**
 * Sage — Python Topic 06: Strings, Formatting & Encodings
 */

(function () {
  'use strict';

  SAGE.registerTopic({
    id: 'py-strings',
    title: 'Strings, Encodings & Modern Formatting',
    subject: 'python',
    module: 'Data Structures',
    description: 'Unicode in Python 3 (PEP 393), string immutability, slicing mechanics, f-string power features, and bytes encoding.',
    difficulty: 'Beginner',
    readTime: '15 min read',

    overview: {
      definition: 'A string (`str`) in Python is an immutable sequence of Unicode code points. Python 3 handles Unicode transparently through PEP 393 (Flexible String Representation), dynamically choosing 1, 2, or 4 bytes per character in memory depending on the maximum character ord in the string. Strings cannot be mutated in place; any transformation creates a new string object.',
      mentalModel: 'Think of a Python string as a read-only ribbon of characters indexed from `0` to `len - 1` (forward) and `-1` to `-len` (backward). Because strings are immutable, modifying a character requires creating an entirely new ribbon. For high-volume concatenation, using `" ".join()` allocates the total memory upfront in a single O(N) pass, unlike repeated `+=` which repeatedly reallocates memory.'
    },

    terminology: [
      {
        term: 'PEP 393 (Flexible String Representation)',
        definition: 'CPython optimization where strings containing only ASCII use 1 byte/char (Latin-1); if code points up to U+FFFF exist, it uses 2 bytes (UCS-2); above that (emojis), it uses 4 bytes (UCS-4).'
      },
      {
        term: 'Slicing (`[start:stop:step]`)',
        definition: 'Extracting a sub-sequence from index `start` up to (but excluding) `stop`, advancing by `step` increments.'
      },
      {
        term: 'f-String (Formatted String Literal)',
        definition: 'Strings prefixed with `f` (PEP 498) that evaluate expressions inside `{}` at runtime with format specifications.'
      },
      {
        term: 'Self-Documenting Expressions (`f"{x=}"`)',
        definition: 'Introduced in Python 3.8, appending `=` inside an f-string prints the expression text followed by its evaluated value.'
      },
      {
        term: '`str` vs `bytes`',
        definition: '`str` represents human text (Unicode code points). `bytes` represents raw binary data (integers 0–255). Text is transformed to bytes via `.encode("utf-8")` and restored via `.decode("utf-8")`.'
      }
    ],

    explanation: [
      {
        heading: '1. Slicing Syntax and Negative Indexing',
        content: 'Python slicing syntax is <code>sequence[start:stop:step]</code>:<br><ul><li><code>start</code> is inclusive; <code>stop</code> is exclusive.</li><li>Omitted values default to: start = 0, stop = len, step = 1.</li><li>Negative indices count from the right: <code>-1</code> is the final character.</li><li>Reversing a string is idiomatic using a negative step: <code>s[::-1]</code>.</li></ul>Slicing never raises an <code>IndexError</code> if the indices are out of bounds; it simply clips to the available string boundaries.'
      },
      {
        heading: '2. Modern f-String Formatting Specifications',
        content: 'f-Strings are evaluated at runtime and are faster than <code>str.format()</code> and <code>%</code> formatting. You can specify alignment, zero-padding, float rounding, and thousands separators:<br><ul><li><code>f"{value:.2f}"</code> — Rounds to 2 decimal places.</li><li><code>f"{num:,}"</code> — Adds comma thousands separators: <code>1,000,000</code>.</li><li><code>f"{text:>15}"</code> — Right-aligns text in a 15-character field.</li><li><code>f"{debug_var=}"</code> — Outputs <code>debug_var=42</code> for instant logging.</li></ul>'
      },
      {
        heading: '3. String Concatenation Performance: `+=` vs `join()`',
        content: 'Because strings are immutable, writing <code>s += char</code> in a loop creates a new string object on every iteration, leading to catastrophic <strong>O(N&sup2;) quadratic complexity</strong>.<br>The Pythonic approach is to accumulate pieces into a list and combine them with <code>"".join(list_of_strings)</code>, which computes total memory requirements and executes in <strong>O(N) linear time</strong>.'
      }
    ],

    syntax: {
      pattern: `# 1. Slicing Patterns
substring = s[start:stop:step]
reversed_str = s[::-1]

# 2. Modern f-Strings with Formatting
formatted = f"{val:.2f} | {count:>5} | {total:,}"
debug_log = f"{user_id=} | {status=}"

# 3. High Performance Concatenation
result_text = "".join(list_of_tokens)

# 4. Encoding / Decoding
binary_payload: bytes = text.encode("utf-8")
decoded_text: str = binary_payload.decode("utf-8")`,
      components: [
        { part: 's[start:stop:step]', meaning: 'Sub-sequence extraction; stop bound is non-inclusive' },
        { part: 'f"{x=}"', meaning: 'Debug f-string formatting printing variable name and value' },
        { part: '"".join(list)', meaning: 'Linear O(N) concatenation of string sequences' },
        { part: 'text.encode("utf-8")', meaning: 'Converts Unicode text code points into raw UTF-8 bytes' }
      ]
    },

    examples: [
      {
        title: 'String Slicing, Advanced f-Strings, and Encoding',
        description: 'Demonstrating formatting specifiers, text reversal, and bytes transformations.',
        code: `import datetime

# 1. Slicing and Reversal
text = "SageKnowledgeBase"
print(f"Original: {text}")
print(f"Prefix (0:4):    '{text[0:4]}'")
print(f"Suffix (-4:):    '{text[-4:]}'")
print(f"Every 2nd char:  '{text[::2]}'")
print(f"Reversed:        '{text[::-1]}'")

# 2. f-String Formatting Specifiers
balance = 12450.856
discount = 0.15
account_id = 42

print("\\n--- Account Summary ---")
print(f"Account:   {account_id:06d}")          # Zero-padded 6 digits
print(f"Balance:   \${balance:,.2f}")           # Currency with commas & 2 decimals
print(f"Discount:  {discount:.1%}")            # Percentage formatting
print(f"{balance=}, {account_id=}")            # Self-documenting debug

# 3. Unicode and Bytes Encoding
greeting = "Hello, 世界 🌍"
encoded_bytes = greeting.encode("utf-8")
print(f"\\nUnicode String: {greeting} (Length: {len(greeting)} chars)")
print(f"UTF-8 Bytes:     {encoded_bytes} (Length: {len(encoded_bytes)} bytes)")
print(f"Decoded:         {encoded_bytes.decode('utf-8')}")`,
        output: `Original: SageKnowledgeBase
Prefix (0:4):    'Sage'
Suffix (-4:):    'Base'
Every 2nd char:  'Sgkoldeae'
Reversed:        'esaBegdelwonKegaS'

--- Account Summary ---
Account:   000042
Balance:   \$12,450.86
Discount:  15.0%
balance=12450.856, account_id=42

Unicode String: Hello, 世界 🌍 (Length: 11 chars)
UTF-8 Bytes:     b'Hello, \\xe4\\xb8\\x96\\xe7\\x95\\x8c \\xf0\\x9f\\x8c\\x8d' (Length: 18 bytes)
Decoded:         Hello, 世界 🌍`,
        explanation: [
          'Line 4-9: Demonstrates non-destructive slicing and `[::-1]` idiomatic sequence reversal.',
          'Line 16-19: Shows `:06d` zero-padding, `:,.2f` financial rounding, and `:.1%` percentage scaling.',
          'Line 20: Python 3.8+ `f"{var=}"` prints name and value together for clean debugging.',
          'Line 23-26: Highlights difference between character length (`len(greeting)` is 11) and byte size (`len(encoded_bytes)` is 18 due to multi-byte UTF-8 code points).'
        ]
      }
    ],

    notes: [
      {
        type: 'warning',
        title: 'String Slicing Out of Bounds',
        body: '`text[100]` raises an `IndexError`, but `text[10:100]` will safely return whatever slice exists without raising an error.'
      },
      {
        type: 'info',
        title: 'Raw Strings `r"..."` for Paths and Regex',
        body: 'Use raw strings `r"C:\\Users\\name"` or `r"\\d+\\.\\d+"` so backslashes are treated as literal characters rather than escape sequences (`\\n`, `\\t`).'
      },
      {
        type: 'tip',
        title: '`str.partition()` vs `str.split()`',
        body: 'When splitting on the first occurrence of a delimiter (e.g. `key=val`), `k, sep, v = s.partition("=")` is faster than `split()` and guarantees a 3-element tuple.'
      }
    ],

    commonMistakes: [
      {
        mistake: 'Repeated String Concatenation Inside Loops',
        incorrectCode: `# O(N^2) Performance Disaster: Allocates N new strings
result = ""
for word in large_word_list:
    result += word + " "`,
        correctCode: `# O(N) Optimal: Allocates buffer once
result = " ".join(large_word_list)`,
        why: 'Strings are immutable. Each `+=` allocates a new memory block and copies all previous characters into it, resulting in quadratic slowdowns with large datasets.'
      },
      {
        mistake: 'Conflating Unicode `str` with Binary `bytes`',
        incorrectCode: `# TypeError: can't concat str to bytes
data = b"HTTP/1.1 200 OK\\r\\n"
header = "Content-Type: text/plain\\r\\n"
response = data + header`,
        correctCode: `# Must encode str to bytes first
response = data + header.encode("utf-8")`,
        why: 'In Python 3, text and raw binary are strictly separated types. They cannot be concatenated without explicit encoding or decoding.'
      }
    ],

    comparisons: [
      {
        title: 'Python String Formatting Comparison',
        headers: ['Method', 'Syntax Example', 'Performance', 'Python Version'],
        rows: [
          ['f-Strings (PEP 498)', 'f"Val: {x:.2f}"', 'Fastest (bytecode evaluated)', 'Python 3.6+ (Recommended)'],
          ['`str.format()`', '"Val: {:.2f}".format(x)', 'Moderate (function call overhead)', 'Python 2.6+ / 3.0+'],
          ['% Formatter (printf style)', '"Val: %.2f" % x', 'Slow, limited type safety', 'Legacy Python 2/3']
        ]
      }
    ],

    questions: [
      {
        question: 'Why does `s = "python"; s[0] = "P"` raise a TypeError?',
        answer: 'Because Python strings are strictly immutable.',
        explanation: 'Individual characters inside a string cannot be modified in place. You must create a new string: `s = "P" + s[1:]`.'
      },
      {
        question: 'What is the purpose of the `f"{x=}"` syntax introduced in Python 3.8?',
        answer: 'Self-documenting debug logging.',
        explanation: 'It automatically outputs the variable or expression name followed by an equals sign and its runtime value (e.g. `x=10`).'
      }
    ],

    practice: [
      {
        id: 'py-str-ex1',
        title: 'Slugify URL Formatter',
        difficulty: 'Beginner',
        prompt: 'Write a function `slugify(title: str) -> str` that converts a title string into a URL slug: lowercased, stripped of leading/trailing whitespace, and replacing all spaces with hyphens `-`.',
        starterCode: `def slugify(title: str) -> str:
    # Your code here
    pass`,
        solution: `def slugify(title: str) -> str:
    cleaned = title.strip().lower()
    # Split on whitespace to handle multiple spaces cleanly, then join with hyphen
    return "-".join(cleaned.split())`,
        explanation: '`cleaned.split()` without arguments splits on consecutive whitespace characters automatically, avoiding double hyphens when multiple spaces exist.'
      }
    ],

    references: [
      {
        title: 'Python Documentation: Text Sequence Type — str',
        type: 'Official Docs',
        url: 'https://docs.python.org/3/library/stdtypes.html#text-sequence-type-str'
      },
      {
        title: 'PEP 498 — Formatted String Literals (f-strings)',
        type: 'Official Docs',
        url: 'https://peps.python.org/pep-0498/'
      }
    ]
  });

})();
