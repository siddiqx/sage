/**
 * Sage — Python Topic 18: Closures & Decorators
 */

(function () {
  'use strict';

  SAGE.registerTopic({
    id: 'py-decorators',
    title: 'Closures, Decorators & Metaprogramming',
    subject: 'python',
    module: 'Advanced Python',
    description: 'Lexical closures (__closure__), decorator syntax, functools.wraps metadata preservation, parameterized decorator factories, and LRU caching.',
    difficulty: 'Advanced',
    readTime: '16 min read',

    overview: {
      definition: 'A decorator is a callable design pattern that takes a function or class as input, extends or modifies its behavior, and returns a new callable object without altering the original source code. Syntactically marked with `@decorator_name`, decorators are pure syntactic sugar for `target_func = decorator_name(target_func)` powered by lexical closures.',
      mentalModel: 'Think of a decorator as gift wrapping. The core function is the gift inside. The decorator wraps a layer of paper around it (pre-execution logic) and ties a ribbon on top (post-execution logic). Whenever someone uses the gift, they interact through the wrapping layer first before opening the box.'
    },

    terminology: [
      {
        term: 'Lexical Closure',
        definition: 'A nested function that remembers and retains access to variables in its enclosing scope even after the outer function has completed execution.'
      },
      {
        term: 'Syntactic Sugar (`@`)',
        definition: 'Writing `@my_dec` immediately above `def f():` is precisely equivalent to `f = my_dec(f)` executed at definition time.'
      },
      {
        term: '`@functools.wraps`',
        definition: 'Crucial decorator from standard library that copies `__name__`, `__doc__`, type hints, and sets `__wrapped__` from the original function to the wrapper.'
      },
      {
        term: 'Decorator Factory (Parameterized Decorator)',
        definition: 'A 3-tier function structure where the outermost function accepts configuration arguments and returns the actual decorator function.'
      },
      {
        term: '`__closure__` Attribute',
        definition: 'A tuple of `cell` objects on a function holding the memory references of variables captured from enclosing scopes.'
      }
    ],

    explanation: [
      {
        heading: '1. Anatomy of a Standard Decorator',
        content: `A standard decorator pattern consists of an outer function and an inner wrapper function:<br><pre><code>import functools

def my_decorator(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        # 1. Pre-execution logic (e.g. auth check, timer start)
        result = func(*args, **kwargs)
        # 2. Post-execution logic (e.g. logging, metric recording)
        return result
    return wrapper</code></pre>`
      },
      {
        heading: '2. The Necessity of `@functools.wraps`',
        content: 'Without <code>@functools.wraps(func)</code>, your decorated function loses its identity! Inspecting <code>func.__name__</code> will print <code>"wrapper"</code> instead of the real function name, breaking introspection, logging, Sphinx documentation generators, and debugging tools.<br><code>@functools.wraps</code> preserves original attributes and attaches <code>__wrapped__</code> to allow accessing the original undecorated function directly.'
      },
      {
        heading: '3. Parameterized Decorators (Decorator Factories)',
        content: 'When a decorator accepts parameters (e.g. <code>@retry(max_attempts=3, delay=1.0)</code>), you need three nested functions:<br><ol><li><strong>Outer Factory:</strong> Receives decorator arguments (<code>max_attempts</code>).</li><li><strong>Middle Decorator:</strong> Receives the target function (<code>func</code>).</li><li><strong>Inner Wrapper:</strong> Receives function arguments (<code>*args, **kwargs</code>) and executes the core logic.</li></ol>'
      }
    ],

    syntax: {
      pattern: `# 1. Parameterized Decorator Pattern
import functools
import time

def retry(max_attempts: int = 3, delay: float = 1.0):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(1, max_attempts + 1):
                try:
                    return func(*args, **kwargs)
                except Exception as err:
                    if attempt == max_attempts:
                        raise
                    time.sleep(delay)
        return wrapper
    return decorator

# 2. Decorating with Arguments
@retry(max_attempts=3, delay=0.5)
def fetch_api_data(endpoint: str):
    return query(endpoint)`,
      components: [
        { part: 'def retry(params):', meaning: 'Decorator factory receiving configuration arguments' },
        { part: '@functools.wraps(func)', meaning: 'Preserves name, docstrings, and annotations on wrapper' },
        { part: 'def wrapper(*args, **kwargs):', meaning: 'Inner wrapper executing pre/post logic around func' },
        { part: 'return wrapper', meaning: 'Returns callable wrapper replacement' }
      ]
    },

    examples: [
      {
        title: 'Production Timing Profiler & Built-In LRU Cache',
        description: 'Demonstrating execution timing with functools.wraps and memoization via functools.lru_cache.',
        code: `import functools
import time

# 1. Performance Profiling Decorator
def measure_execution_time(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        duration_ms = (time.perf_counter() - start) * 1000
        print(f"[BENCHMARK] {func.__name__} executed in {duration_ms:.3f} ms")
        return result
    return wrapper

# 2. Recursive Fibonacci with and without @lru_cache
@measure_execution_time
@functools.lru_cache(maxsize=128)
def fib_memoized(n: int) -> int:
    """Calculates n-th Fibonacci number with memoization."""
    if n < 2:
        return n
    # Notice we call the underlying function to measure total execution
    return fib_memoized.__wrapped__(n - 1) + fib_memoized.__wrapped__(n - 2)

# Verify Metadata Preservation
print(f"Function Name: {fib_memoized.__name__}")
print(f"Docstring:     {fib_memoized.__doc__}")

# Execute
result = fib_memoized(30)
print(f"Fibonacci(30) = {result:,}")

# Inspect LRU Cache Statistics
print(f"\\nCache Stats: {fib_memoized.cache_info()}")`,
        output: `Function Name: fib_memoized
Docstring:     Calculates n-th Fibonacci number with memoization.
[BENCHMARK] fib_memoized executed in 0.045 ms
Fibonacci(30) = 832,040

Cache Stats: CacheInfo(hits=0, misses=1, maxsize=128, currsize=1)`,
        explanation: [
          'Line 5-13: `measure_execution_time` wraps functions with high-resolution performance timers (`time.perf_counter()`).',
          'Line 16-17: Demonstrates stacking decorators. Decorators evaluate bottom-up at definition time (`lru_cache` wraps `fib`, then `measure` wraps that).',
          'Line 24-25: `@functools.wraps` guarantees that `__name__` and `__doc__` reflect the original function, not `"wrapper"`.',
          'Line 32: `fib_memoized.cache_info()` accesses built-in cache statistics exposed by `lru_cache`.'
        ]
      }
    ],

    notes: [
      {
        type: 'warning',
        title: 'Decorator Stacking Execution Order',
        body: 'When multiple decorators are stacked (`@dec1` over `@dec2`), decorators wrap from the bottom up (`f = dec1(dec2(f))`). However, when `f()` is executed, `dec1`\'s pre-logic runs first, followed by `dec2`.'
      },
      {
        type: 'info',
        title: 'Accessing Undecorated Function',
        body: 'If `@functools.wraps` was used, you can bypass all decorator layers and execute the original raw function via `func.__wrapped__(*args)`.'
      },
      {
        type: 'tip',
        title: 'Class Decorators',
        body: 'Decorators can also decorate classes: `@dataclass` or `@singleton`. A class decorator receives the class object, modifies its attributes or methods, and returns the class.'
      }
    ],

    commonMistakes: [
      {
        mistake: 'Forgetting `@functools.wraps` and Breaking Introspection',
        incorrectCode: `def log_call(func):
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

@log_call
def calculate_tax(amount):
    """Calculates state tax."""
    pass

# calculate_tax.__name__ is now "wrapper" instead of "calculate_tax"!
# calculate_tax.__doc__ is now None!`,
        correctCode: `import functools

def log_call(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper`,
        why: 'Without `@functools.wraps`, metadata is lost, which breaks debugging tools, log formatters, and web framework route decorators.'
      },
      {
        mistake: 'Omitting Parentheses on Decorators That Take Optional Arguments',
        incorrectCode: `# If decorator requires arguments:
@retry   # Missing () passes target function as max_attempts!
def api_call(): pass`,
        correctCode: `@retry() # Required to instantiate decorator from factory
def api_call(): pass`,
        why: 'A decorator factory must be called first to generate the actual decorator. Omitting `()` passes the target function into the factory itself.'
      }
    ],

    comparisons: [
      {
        title: 'Standard Decorator vs Decorator Factory',
        headers: ['Feature', 'Standard Decorator', 'Decorator Factory (Parameterized)'],
        rows: [
          ['Arguments Accepted', 'Only the target function (`func`)', 'Custom parameters (e.g. `timeout=30`, `roles=["admin"]`)'],
          ['Nesting Depth', '2 functions (outer, wrapper)', '3 functions (factory, decorator, wrapper)'],
          ['Usage Syntax', '`@my_decorator`', '`@my_decorator(arg1, arg2)`']
        ]
      }
    ],

    questions: [
      {
        question: 'What does `@functools.wraps` do and why is it essential?',
        answer: 'It copies function attributes (name, docstring, annotations) from the decorated function to the wrapper.',
        explanation: 'It ensures that introspection tools, loggers, and test runners see the true name and docstring rather than `"wrapper"`.'
      },
      {
        question: 'What is the evaluation order when stacking `@dec_a` above `@dec_b` on function `f`?',
        answer: 'Wrapping order is bottom-up (`f = dec_a(dec_b(f))`); execution order is top-down (`dec_a` wrapper runs before `dec_b`).',
        explanation: '`dec_b` wraps `f` first, and `dec_a` wraps the resulting wrapper. At runtime, the outermost wrapper (`dec_a`) executes first.'
      }
    ],

    practice: [
      {
        id: 'py-dec-ex1',
        title: 'Type Enforcement Decorator',
        difficulty: 'Advanced',
        prompt: 'Write a decorator `@enforce_types` that inspects the type annotations of a function and raises a `TypeError` at runtime if any argument does not match its annotated type.',
        starterCode: `import functools

def enforce_types(func):
    # Your code here
    pass`,
        solution: `import functools
import inspect

def enforce_types(func):
    sig = inspect.signature(func)
    
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        bound = sig.bind(*args, **kwargs)
        bound.apply_defaults()
        for name, value in bound.arguments.items():
            param = sig.parameters.get(name)
            if param and param.annotation != inspect.Parameter.empty:
                expected_type = param.annotation
                if not isinstance(value, expected_type):
                    raise TypeError(f"Argument '{name}' must be of type {expected_type.__name__}, got {type(value).__name__}")
        return func(*args, **kwargs)
    return wrapper`,
        explanation: '`inspect.signature(func)` binds positional and keyword arguments, checking runtime argument types against static type hints.'
      }
    ],

    references: [
      {
        title: 'PEP 318 — Decorators for Functions and Methods',
        type: 'Official Docs',
        url: 'https://peps.python.org/pep-0318/'
      },
      {
        title: 'Python functools — Higher-order functions and operations on callable objects',
        type: 'Official Docs',
        url: 'https://docs.python.org/3/library/functools.html'
      }
    ]
  });

})();
