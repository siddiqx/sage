/**
 * Sage — Python Topic 17: Iterators, Generators & Itertools
 */

(function () {
  'use strict';

  SAGE.registerTopic({
    id: 'py-iterators-generators',
    title: 'Iterators, Generators & Itertools Pipelines',
    subject: 'python',
    module: 'Advanced Python',
    description: 'The iterator protocol (__iter__ / __next__), generator state machines, yield from delegation, coroutines (.send), and itertools.',
    difficulty: 'Advanced',
    readTime: '16 min read',

    overview: {
      definition: 'The Iterator Protocol is the foundational mechanism powering all iteration in Python. An iterable is an object that returns an iterator via `iter(obj)`. An iterator is a stateful object that yields values one at a time via `next(it)`, raising `StopIteration` when exhausted. Generators are syntactically concise functions containing the `yield` keyword that automatically implement the iterator protocol as resumable execution frames.',
      mentalModel: 'Think of a generator as a paused tape recorder. When you call the function, the tape does not play. Calling `next()` plays the tape until it encounters a `yield` sign, where it pauses, transmits the current value, and freezes its entire local variable stack in memory until the caller requests the next item.'
    },

    terminology: [
      {
        term: 'Iterable vs Iterator',
        definition: 'An Iterable implements `__iter__()` returning a new iterator (e.g. list, dict). An Iterator implements `__next__()` and `__iter__()` (returning `self`).'
      },
      {
        term: '`yield` Keyword',
        definition: 'Suspends function execution, returns an intermediate value to the caller, and retains the function\'s active stack frame and local variables.'
      },
      {
        term: '`yield from` (PEP 380)',
        definition: 'Transparently delegates iteration to a sub-generator or iterable, forwarding values, exceptions, and return values bidirectionally.'
      },
      {
        term: 'Generator Execution Frame (`PyGenObject`)',
        definition: 'In CPython, a generator preserves its frame object (`f_lasti` instruction pointer, fast locals array) on the heap across pauses.'
      },
      {
        term: '`generator.send(value)`',
        definition: 'Resumes a suspended generator while passing a value into the generator expression where `yield` paused.'
      }
    ],

    explanation: [
      {
        heading: '1. The Two-Method Iterator Protocol',
        content: 'To turn any class into a custom iterator, implement two methods:<br><ul><li><code>__iter__(self)</code>: Returns the iterator object itself (<code>return self</code>).</li><li><code>__next__(self)</code>: Computes and returns the next value. When no items remain, it must raise <code>StopIteration</code>.</li></ul>Python\'s <code>for</code> loop catches <code>StopIteration</code> automatically, completing the loop without errors.'
      },
      {
        heading: '2. The State Machine Architecture of Generators',
        content: 'A standard function executes from the first line to the <code>return</code> statement and destroys its stack frame. In contrast, a generator function:<br><ol><li>Compiles with the <code>CO_GENERATOR</code> flag.</li><li>When called, it returns a <code>generator</code> object without executing any code.</li><li>Calling <code>next()</code> advances execution until <code>yield</code> is reached.</li><li>The frame freezes: local variables, loop state, and the instruction counter are preserved in heap memory until the next <code>next()</code> call.</li></ol>'
      },
      {
        heading: '3. Streaming Big Data with `itertools`',
        content: 'The built-in <code>itertools</code> module provides C-speed streaming combinators for infinite sequences and batch processing:<br><ul><li><code>itertools.islice(gen, start, stop)</code>: Slices an infinite generator lazily without creating intermediate lists.</li><li><code>itertools.chain(iter1, iter2)</code>: Consecutively chains multiple streams into one.</li><li><code>itertools.groupby(data, key)</code>: Groups consecutive records sharing a common key.</li></ul>'
      }
    ],

    syntax: {
      pattern: `# 1. Generator Function with yield
def countdown_stream(start: int):
    while start > 0:
        yield start
        start -= 1

# 2. Delegation with yield from
def chained_stream(seq1, seq2):
    yield from seq1
    yield from seq2

# 3. Two-Way Coroutine Communication (.send)
def running_average():
    total = 0.0
    count = 0
    average = None
    while True:
        # yield returns average, and receives new input from .send()
        val = yield average
        if val is None: break
        total += val
        count += 1
        average = total / count`,
      components: [
        { part: 'yield value', meaning: 'Suspends execution and yields intermediate value to caller' },
        { part: 'yield from sub_iterable', meaning: 'Delegates iteration transparently to a nested generator' },
        { part: 'gen.send(value)', meaning: 'Resumes generator and assigns value to the yield expression' }
      ]
    },

    examples: [
      {
        title: 'Custom Infinite Fibonacci Iterator & Bidirectional Averaging Coroutine',
        description: 'Demonstrating custom iterator protocol, generator state machines, and .send() coroutine communication.',
        code: `import itertools

# 1. Custom Class Implementing Iterator Protocol
class FibonacciSequence:
    def __init__(self, limit: int = 10):
        self.limit = limit
        self.count = 0
        self.a, self.b = 0, 1
        
    def __iter__(self):
        return self
        
    def __next__(self) -> int:
        if self.count >= self.limit:
            raise StopIteration
        val = self.a
        self.a, self.b = self.b, self.a + self.b
        self.count += 1
        return val

fibs = list(FibonacciSequence(8))
print(f"Fibonacci (First 8): {fibs}")

# 2. Bidirectional Data Streaming via generator.send()
def live_telemetry_monitor():
    sample_count = 0
    running_max = float('-inf')
    
    print("[MONITOR] Initialized. Waiting for sensor input...")
    while True:
        # Pauses here: yields running_max, receives reading from caller
        reading = yield running_max
        if reading is None:
            break
        sample_count += 1
        if reading > running_max:
            running_max = reading

# Initialize coroutine
monitor = live_telemetry_monitor()
next(monitor)  # Prime the generator to the first yield statement

print("\\n--- Streaming Telemetry ---")
print(f"Sent 120.5 -> Running Max: {monitor.send(120.5)}")
print(f"Sent 95.0  -> Running Max: {monitor.send(95.0)}")
print(f"Sent 145.2 -> Running Max: {monitor.send(145.2)}")

# 3. itertools.islice on infinite generator
def infinite_integers():
    n = 1
    while True:
        yield n
        n += 1

first_five_odds = list(itertools.islice((x for x in infinite_integers() if x % 2 != 0), 5))
print(f"\\nFirst 5 odds from infinite stream: {first_five_odds}")`,
        output: `Fibonacci (First 8): [0, 1, 1, 2, 3, 5, 8, 13]
[MONITOR] Initialized. Waiting for sensor input...

--- Streaming Telemetry ---
Sent 120.5 -> Running Max: 120.5
Sent 95.0  -> Running Max: 120.5
Sent 145.2 -> Running Max: 145.2

First 5 odds from infinite stream: [1, 3, 5, 7, 9]`,
        explanation: [
          'Line 4-19: Class implementing `__iter__` and `__next__` raising `StopIteration` when `self.count >= self.limit`.',
          'Line 24-34: `live_telemetry_monitor` acts as a consumer coroutine. `next(monitor)` primes it up to the first `yield`.',
          'Line 39-41: Calling `monitor.send(val)` passes new data directly into the waiting `yield` expression.',
          'Line 49-51: `itertools.islice` extracts exactly 5 elements from an infinite sequence in constant memory.'
        ]
      }
    ],

    notes: [
      {
        type: 'warning',
        title: 'Generators Are Single-Use Only',
        body: 'Once a generator raises `StopIteration`, it is exhausted. Attempting to iterate over it a second time yields 0 items! If you need to re-read elements, store them in a list or create a fresh generator.'
      },
      {
        type: 'info',
        title: 'Priming Coroutines Before Calling `.send()`',
        body: 'A newly created generator cannot receive data via `.send(value)` immediately. You must call `next(gen)` or `gen.send(None)` first to advance execution to the first `yield` expression.'
      },
      {
        type: 'tip',
        title: '`yield from` Handles Sub-Generator Return Values',
        body: 'In Python, `yield from sub_gen()` not only forwards all yields, but it also captures any return value: `result = yield from sub_gen()`.'
      }
    ],

    commonMistakes: [
      {
        mistake: 'Assuming a Generator Function Executes Upon Calling It',
        incorrectCode: `def log_start():
    print("Execution beginning...")
    yield 1

# Bug: Calling the function does NOT print anything!
gen = log_start()`,
        correctCode: `# Must call next() or iterate over it to start execution
gen = log_start()
first_val = next(gen)  # Prints: "Execution beginning..."`,
        why: 'Calling a generator function merely instantiates the generator object. No code inside the function runs until `next()` is called.'
      },
      {
        mistake: 'Trying to Re-Iterate Over an Exhausted Generator',
        incorrectCode: `data_gen = (x * 2 for x in [1, 2, 3])
print(list(data_gen))  # [2, 4, 6]
print(list(data_gen))  # Bug: [] (Exhausted, returns empty list!)`,
        correctCode: `# Define a function that returns a new generator each time
def get_stream():
    return (x * 2 for x in [1, 2, 3])`,
        why: 'Generators maintain internal state. Once exhausted, they remain at the end of their instruction stream.'
      }
    ],

    comparisons: [
      {
        title: 'Regular Functions vs Generator Functions',
        headers: ['Feature', 'Regular Function (`def ... return`)', 'Generator Function (`def ... yield`)'],
        rows: [
          ['Exit Mechanism', '`return` (destroys active stack frame)', '`yield` (suspends and preserves stack frame)'],
          ['Memory Usage', 'High (returns complete collection in RAM)', 'O(1) constant (yields 1 element on demand)'],
          ['Reusability', 'Re-executes each time invoked', 'Exhausts after reaching end of sequence'],
          ['Infinite Sequences', 'Impossible (triggers OutOfMemoryError)', 'Fully supported (lazy on-demand evaluation)']
        ]
      }
    ],

    questions: [
      {
        question: 'What exception must an iterator\'s `__next__()` method raise when no more elements exist?',
        answer: '`StopIteration`',
        explanation: 'Python\'s iteration protocols look specifically for `StopIteration` to conclude loops cleanly.'
      },
      {
        question: 'What is the primary architectural purpose of the `yield from` keyword?',
        answer: 'To transparently delegate iteration to an inner sub-generator or iterable.',
        explanation: 'It automatically handles forwarding values, catching exceptions, and capturing sub-generator return values without manual while loops.'
      }
    ],

    practice: [
      {
        id: 'py-it-ex1',
        title: 'Chunked Batch Generator for Large Datasets',
        difficulty: 'Advanced',
        prompt: 'Write a generator function `chunked(iterable, chunk_size: int)` that yields consecutive slices of `chunk_size` elements from any arbitrary iterable without converting the entire source into a list.',
        starterCode: `def chunked(iterable, chunk_size: int):
    # Your code here
    pass`,
        solution: `import itertools

def chunked(iterable, chunk_size: int):
    iterator = iter(iterable)
    while True:
        chunk = list(itertools.islice(iterator, chunk_size))
        if not chunk:
            break
        yield chunk`,
        explanation: '`itertools.islice` reads up to `chunk_size` items from the iterator. When the iterator is exhausted, `chunk` is empty and the while loop terminates cleanly.'
      }
    ],

    references: [
      {
        title: 'Python Documentation: Iterators and Generators',
        type: 'Official Docs',
        url: 'https://docs.python.org/3/tutorial/classes.html#iterators'
      },
      {
        title: 'Python Documentation: itertools — Functions creating iterators for efficient looping',
        type: 'Official Docs',
        url: 'https://docs.python.org/3/library/itertools.html'
      }
    ]
  });

})();
