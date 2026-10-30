/**
 * Sage — Python Topic 11: Functions, Scope & Parameter Mechanics
 */

(function () {
  'use strict';

  SAGE.registerTopic({
    id: 'py-functions',
    title: 'Functions, Scopes & Parameter Passing',
    subject: 'python',
    module: 'Functions & Comprehensions',
    description: 'Call-by-object-reference, the LEGB scope resolution rule, positional-only (/), keyword-only (*), and first-class higher-order functions.',
    difficulty: 'Intermediate',
    readTime: '15 min read',

    overview: {
      definition: 'Functions in Python are first-class citizen objects created with the `def` keyword or `lambda` expressions. Python uses "Call-by-Object-Reference" (or Call-by-Sharing) evaluation semantics: function arguments are assigned object references, meaning mutations to mutable arguments affect the caller, while reassignments remain local to the function.',
      mentalModel: 'Think of function parameters as new local name tags attached to the exact objects passed in from the caller. If the function mutates the object (e.g., `lst.append()`), the caller sees the change. If the function attaches the local name tag to a brand new object (`x = 10`), the caller\'s original binding remains untouched.'
    },

    terminology: [
      {
        term: 'Call-by-Sharing / Call-by-Object-Reference',
        definition: 'Parameter passing mechanism where the function receives a copy of the object reference, not a copy of the object itself.'
      },
      {
        term: 'LEGB Scope Rule',
        definition: 'Python variable resolution order: Local -> Enclosing (nested functions) -> Global (module level) -> Built-in.'
      },
      {
        term: 'Positional-Only Parameters (`/`)',
        definition: 'PEP 570 syntax where arguments before `/` cannot be passed using keyword names (e.g. `pow(x, y, /)`).'
      },
      {
        term: 'Keyword-Only Parameters (`*`)',
        definition: 'Parameters defined after a bare `*` or `*args` that MUST be passed with explicit keyword names (e.g. `sort(*, reverse=True)`).'
      },
      {
        term: '`*args` and `**kwargs`',
        definition: '`*args` collects arbitrary positional arguments into a tuple; `**kwargs` collects arbitrary keyword arguments into a dictionary.'
      }
    ],

    explanation: [
      {
        heading: '1. Parameter Passing Semantics: The Mutation Trap',
        content: 'Does Python pass by value or pass by reference? The answer is neither: it passes <strong>object references</strong>.<br><ul><li><strong>Immutable arguments (int, str, tuple):</strong> The function cannot mutate the object. Reassignment (<code>x = x + 1</code>) binds the local variable to a new object, leaving the caller unchanged.</li><li><strong>Mutable arguments (list, dict, set):</strong> In-place mutations (<code>arg.append(x)</code>) alter the caller\'s object in memory. Reassignment (<code>arg = [1, 2]</code>) breaks the link and does not affect the caller.</li></ul>'
      },
      {
        heading: '2. The LEGB Scope Resolution Hierarchy',
        content: 'When Python looks up a variable name, it searches four scopes in strict order:<br><ol><li><strong>L (Local):</strong> Names defined inside the active function body.</li><li><strong>E (Enclosing):</strong> Names in any outer enclosing functions (closures).</li><li><strong>G (Global):</strong> Names defined at the top level of the current module file.</li><li><strong>B (Built-in):</strong> Python\'s built-in namespace (<code>len</code>, <code>range</code>, <code>ValueError</code>).</li></ol>To modify a global variable inside a function, you must declare <code>global var_name</code>. To modify an enclosing variable inside a nested closure, declare <code>nonlocal var_name</code>.'
      },
      {
        heading: '3. Precision Signatures: `/` and `*` in Python 3.8+',
        content: `Modern Python allows strict API contract design in function signatures:<br><pre><code>def configure(name, /, mode="fast", *, timeout=30):
    pass</code></pre><ul><li><code>name</code> is <strong>positional-only</strong> (must be called as <code>configure("db")</code>, never <code>name="db"</code>).</li><li><code>mode</code> can be passed positionally or by keyword.</li><li><code>timeout</code> is <strong>keyword-only</strong> (must be called as <code>timeout=60</code>).</li></ul>`
      }
    ],

    syntax: {
      pattern: `# 1. Comprehensive Function Signature
def process_data(
    req_pos,              # Positional or keyword
    pos_only, /           # Positional ONLY (before /)
    standard="default",   # Standard parameter
    *args,                # Variable positional tuple
    kw_only: bool = True, # Keyword ONLY (after * or *args)
    **kwargs              # Variable keyword dictionary
) -> ReturnType:
    """Docstring explaining function purpose."""
    return result`,
      components: [
        { part: 'def func(/, *):', meaning: '/ enforces positional-only on left; * enforces keyword-only on right' },
        { part: '*args', meaning: 'Packs remaining positional arguments into a tuple' },
        { part: '**kwargs', meaning: 'Packs remaining keyword arguments into a dictionary' },
        { part: 'nonlocal x', meaning: 'Binds variable to the nearest enclosing non-global scope (closures)' }
      ]
    },

    examples: [
      {
        title: 'Modern Function Signatures and Scope Resolution',
        description: 'Demonstrating positional-only `/`, keyword-only `*`, and closure scoping with `nonlocal`.',
        code: `def build_query(
    table_name: str, /,                 # Positional only
    *columns: str,                      # Arbitrary column names
    distinct: bool = False,             # Keyword only
    limit: int = 100                    # Keyword only
) -> str:
    cols = ", ".join(columns) if columns else "*"
    dist = "DISTINCT " if distinct else ""
    return f"SELECT {dist}{cols} FROM {table_name} LIMIT {limit};"

# Valid invocations
print(build_query("users", "id", "email", distinct=True, limit=50))
print(build_query("orders", limit=10))

# 2. Closures and the nonlocal keyword
def make_accumulator(initial_value: int = 0):
    total = initial_value
    
    def add(amount: int) -> int:
        nonlocal total  # Modifies total in enclosing scope
        total += amount
        return total
        
    return add

acc = make_accumulator(100)
print(f"\\nAccumulator add 25: {acc(25)}")
print(f"Accumulator add 50: {acc(50)}")`,
        output: `SELECT DISTINCT id, email FROM users LIMIT 50;
SELECT * FROM orders LIMIT 10;

Accumulator add 25: 125
Accumulator add 50: 175`,
        explanation: [
          'Line 2: `table_name: str, /` prevents callers from invoking `build_query(table_name="users")`, shielding the internal parameter name from API breaking changes.',
          'Line 4-5: Parameters defined after `*columns` are strictly keyword-only.',
          'Line 15-23: `make_accumulator` creates a closure retaining `total` in its enclosing scope across multiple calls via `nonlocal`.'
        ]
      }
    ],

    notes: [
      {
        type: 'warning',
        title: 'Mutable Default Argument Hazard',
        body: 'Default parameter values are created once at compile time. Always use `def fn(items=None): if items is None: items = []`.'
      },
      {
        type: 'info',
        title: 'First-Class Functions',
        body: 'Functions can be assigned to variables, passed into other functions as arguments (higher-order functions), and stored inside data structures.'
      },
      {
        type: 'tip',
        title: 'Enforce Keyword Arguments for Readability',
        body: 'For boolean configuration flags (like `strict=True` or `debug=False`), declare them as keyword-only using `*, flag=False` so calls read explicitly: `run(debug=True)` rather than mysterious `run(True)`.'
      }
    ],

    commonMistakes: [
      {
        mistake: 'Reassigning a Global Variable Without the `global` Keyword',
        incorrectCode: `counter = 0

def increment():
    # UnboundLocalError: cannot access local variable 'counter' where it is not associated with a value
    counter += 1`,
        correctCode: `counter = 0

def increment():
    global counter
    counter += 1`,
        why: 'Python detects that `counter` is assigned inside `increment()`, marking it as a local variable. Because it is read before local assignment, Python raises an UnboundLocalError.'
      },
      {
        mistake: 'Using Default Mutable Arguments for Caching or Accumulation',
        incorrectCode: `def collect_data(data, cache={}):
    cache[len(cache)] = data
    return cache`,
        correctCode: `def collect_data(data, cache=None):
    if cache is None:
        cache = {}
    cache[len(cache)] = data
    return cache`,
        why: 'The dictionary `{}` is created once at definition time. All function invocations that omit `cache` will share and pollute the exact same dictionary in memory.'
      }
    ],

    comparisons: [
      {
        title: 'Parameter Kinds in Python Functions',
        headers: ['Syntax Position', 'Kind', 'Call Syntax Example'],
        rows: [
          ['Before `/`', 'Positional-only', '`func(10)` (keyword syntax disallowed)'],
          ['Between `/` and `*`', 'Positional or Keyword', '`func(10)` or `func(x=10)`'],
          ['After `*` or `*args`', 'Keyword-only', '`func(flag=True)` (positional disallowed)']
        ]
      }
    ],

    questions: [
      {
        question: 'What is the LEGB rule in Python variable scoping?',
        answer: 'Local -> Enclosing -> Global -> Built-in.',
        explanation: 'It defines the exact sequence Python uses to resolve identifiers in code.'
      },
      {
        question: 'Why does defining `def func(x, *, y=10)` make `y` keyword-only?',
        answer: 'The bare `*` signals that all subsequent parameters can only be passed by name.',
        explanation: 'Calling `func(1, 2)` raises a `TypeError: func() takes 1 positional argument but 2 were given`. It must be called as `func(1, y=2)`.'
      }
    ],

    practice: [
      {
        id: 'py-func-ex1',
        title: 'Configurable Retry Decorator Closure',
        difficulty: 'Intermediate',
        prompt: 'Write a higher-order function `create_multiplier(factor: float)` that returns a function which multiplies its input by `factor`. Enforce that `factor` must be passed positionally.',
        starterCode: `def create_multiplier(factor: float, /):
    # Return closure
    pass`,
        solution: `def create_multiplier(factor: float, /):
    def multiplier(number: float) -> float:
        return number * factor
    return multiplier`,
        explanation: '`create_multiplier` captures `factor` in the inner function\'s enclosing scope. The positional-only `/` guarantees clean invocation like `double = create_multiplier(2.0)`.'
      }
    ],

    references: [
      {
        title: 'Python Documentation: Defining Functions',
        type: 'Official Docs',
        url: 'https://docs.python.org/3/tutorial/controlflow.html#defining-functions'
      },
      {
        title: 'PEP 570 — Python Positional-Only Parameters',
        type: 'Official Docs',
        url: 'https://peps.python.org/pep-0570/'
      }
    ]
  });

})();
