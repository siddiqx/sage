/**
 * Sage — Python Topic 19: Advanced Python Concepts & Runtime Architecture
 */

(function () {
  'use strict';

  SAGE.registerTopic({
    id: 'py-advanced',
    title: 'Advanced Python: Slots, Descriptors & Concurrency',
    subject: 'python',
    module: 'Advanced Python',
    description: 'Memory optimization with __slots__, the descriptor protocol, metaclasses vs __init_subclass__, the GIL, threading, multiprocessing, and asyncio.',
    difficulty: 'Advanced',
    readTime: '18 min read',

    overview: {
      definition: 'Advanced Python encompasses the underlying runtime mechanics that power modern frameworks and high-performance systems. This includes eliminating instance dictionary overhead with `__slots__`, implementing attribute access hooks via the Descriptor Protocol, customizing class construction with `__init_subclass__`, and navigating Python\'s concurrency paradigms (GIL, threading, multiprocessing, and asyncio).',
      mentalModel: 'Think of the standard Python instance as an open backpack with a dictionary inside (`__dict__`) where anyone can toss arbitrary new items at runtime. Using `__slots__` replaces the messy backpack with a precisely molded tray holding fixed hardware slots. The Descriptor Protocol acts as an interceptor chip installed in the tray that controls reads and writes.'
    },

    terminology: [
      {
        term: '`__slots__`',
        definition: 'A class-level declaration that replaces dynamic instance `__dict__` and `__weakref__` with a fixed-size C array of pointers, slashing memory consumption by 40–60%.'
      },
      {
        term: 'Descriptor Protocol',
        definition: 'An object attribute that implements `__get__()`, `__set__()`, or `__delete__()`. Powers `@property`, methods, `classmethod`, and ORM fields.'
      },
      {
        term: '`__set_name__` (PEP 487)',
        definition: 'Called automatically when the enclosing class is constructed, informing descriptors of the exact attribute name they were assigned to.'
      },
      {
        term: 'GIL (Global Interpreter Lock)',
        definition: 'A mutex in CPython that prevents multiple native OS threads from executing Python bytecode simultaneously, protecting CPython memory structures.'
      },
      {
        term: '`asyncio` Event Loop',
        definition: 'A single-threaded, cooperative scheduling engine that executes coroutines (`async/await`) concurrently via OS I/O multiplexing (epoll/kqueue/IOCP).'
      }
    ],

    explanation: [
      {
        heading: '1. Memory Optimization with `__slots__`',
        content: `By default, every Python instance carries its own <code>__dict__</code> to allow dynamic attribute assignment (<code>obj.anything = 10</code>). In systems creating millions of objects, this dictionary consumes massive memory.<br><pre><code>class Point:
    __slots__ = ("x", "y")  # No __dict__ allocated!
    def __init__(self, x, y):
        self.x = x
        self.y = y</code></pre>This reduces per-instance memory overhead from ~152 bytes down to ~48 bytes and speeds up attribute access.`
      },
      {
        heading: '2. The Descriptor Protocol: The Engine Behind Properties and ORMs',
        content: 'Whenever you write <code>obj.attr</code>, Python calls <code>type(obj).__dict__["attr"].__get__(obj, type(obj))</code>.<br>If an object defines <code>__get__</code> and <code>__set__</code>, it is a <strong>Data Descriptor</strong>. Descriptors take precedence over instance dictionaries, allowing developers to build reusable validators, lazy properties, and database column mappings cleanly without boilerplate.'
      },
      {
        heading: '3. Navigating Python Concurrency: Threads vs Processes vs Asyncio',
        content: 'Choosing the right concurrency model is critical:<br><ul><li><strong>I/O-Bound (Network/Disk):</strong> Use <code>asyncio</code> for thousands of concurrent sockets with minimal memory, or <code>threading</code> for legacy synchronous libraries. The GIL is released during OS I/O operations!</li><li><strong>CPU-Bound (Number Crunching/ML):</strong> Use <code>multiprocessing</code> or <code>concurrent.futures.ProcessPoolExecutor</code> to spawn separate OS processes with independent GILs across multiple CPU cores.</li><li><strong>Python 3.13 Free-Threaded (PEP 703):</strong> An experimental build of CPython that disables the GIL entirely, enabling true multi-threaded CPU parallel execution.</li></ul>'
      }
    ],

    syntax: {
      pattern: `# 1. Memory-Optimized Slots
class UserRecord:
    __slots__ = ("id", "username", "email")

# 2. Reusable Type-Validated Descriptor
class ValidatedString:
    def __set_name__(self, owner, name):
        self.private_name = f"_{name}"

    def __get__(self, instance, owner):
        if instance is None: return self
        return getattr(instance, self.private_name, None)

    def __set__(self, instance, value):
        if not isinstance(value, str):
            raise TypeError("Value must be a string")
        setattr(instance, self.private_name, value)

# 3. Asyncio Coroutine
import asyncio

async def fetch_payload(url: str) -> dict:
    await asyncio.sleep(0.1) # Non-blocking I/O simulation
    return {"status": 200}`,
      components: [
        { part: '__slots__ = (...)', meaning: 'Disables instance __dict__, allocating fixed C pointer slots' },
        { part: '__get__ and __set__', meaning: 'Hooks attribute read/write access on instance level' },
        { part: '__set_name__(owner, name)', meaning: 'Automatically captures the field name in the enclosing class' },
        { part: 'async def / await', meaning: 'Defines coroutine yielding execution back to the asyncio event loop' }
      ]
    },

    examples: [
      {
        title: 'High-Performance Slots Memory Benchmark & Custom Descriptor Validator',
        description: 'Demonstrating memory savings of __slots__ and building an integer range descriptor.',
        code: `import sys
import asyncio

# 1. Custom Descriptor Validator
class IntegerRange:
    def __init__(self, min_val: int, max_val: int):
        self.min_val = min_val
        self.max_val = max_val

    def __set_name__(self, owner, name):
        self.name = name
        self.storage_name = f"_{name}"

    def __get__(self, instance, owner):
        if instance is None:
            return self
        return getattr(instance, self.storage_name)

    def __set__(self, instance, value):
        if not isinstance(value, int):
            raise TypeError(f"'{self.name}' must be an integer, got {type(value).__name__}")
        if not (self.min_val <= value <= self.max_val):
            raise ValueError(f"'{self.name}' ({value}) outside range [{self.min_val}, {self.max_val}]")
        setattr(instance, self.storage_name, value)

class GameCharacter:
    level = IntegerRange(1, 100)
    health = IntegerRange(0, 1000)

    def __init__(self, name: str, level: int, health: int):
        self.name = name
        self.level = level
        self.health = health

hero = GameCharacter("Aragorn", level=50, health=850)
print(f"Character: {hero.name}, Level: {hero.level}, HP: {hero.health}")

try:
    hero.level = 150  # Out of range!
except ValueError as err:
    print(f"Validation Caught: {err}")

# 2. Asyncio Concurrent Task Gathering
async def worker(task_id: int):
    await asyncio.sleep(0.05)
    return f"Task-{task_id} OK"

async def run_async_pipeline():
    results = await asyncio.gather(*(worker(i) for i in range(3)))
    print(f"\\nAsync Results: {results}")

asyncio.run(run_async_pipeline())`,
        output: `Character: Aragorn, Level: 50, HP: 850
Validation Caught: 'level' (150) outside range [1, 100]

Async Results: ['Task-0 OK', 'Task-1 OK', 'Task-2 OK']`,
        explanation: [
          'Line 5-23: `IntegerRange` is a reusable data descriptor. `__set_name__` automatically records `storage_name = "_level"`.',
          'Line 26-28: `GameCharacter` specifies validation rules declaratively without repetitive getter/setter boilerplates.',
          'Line 46-52: Demonstrates `asyncio.gather()` executing multiple cooperative coroutines concurrently on a single event loop.'
        ]
      }
    ],

    notes: [
      {
        type: 'warning',
        title: 'Slots Prevent Dynamic Attribute Creation',
        body: 'Classes with `__slots__` cannot have arbitrary new attributes added at runtime (e.g. `hero.magic = 50` raises an `AttributeError`).'
      },
      {
        type: 'info',
        title: 'The GIL Does Not Block I/O',
        body: 'When a Python thread makes a blocking system call (like reading a socket, reading a disk file, or executing NumPy C routines), the thread automatically releases the GIL, allowing other Python threads to execute.'
      },
      {
        type: 'tip',
        title: 'Prefer `__init_subclass__` Over Metaclasses',
        body: 'For 95% of use cases where developers used to write complex Metaclasses (to validate subclasses or register plugins), modern Python (PEP 487) provides `def __init_subclass__(cls, **kwargs):` which is simpler and more maintainable.'
      }
    ],

    commonMistakes: [
      {
        mistake: 'Using `threading` for CPU-Bound Computational Work in Python',
        incorrectCode: `# CPU-bound calculation running in 4 threads:
threads = [Thread(target=heavy_math) for _ in range(4)]
for t in threads: t.start()
# Runs SLOWER than a single thread due to GIL contention!`,
        correctCode: `# Use multiprocessing or ProcessPoolExecutor for true multi-core parallel CPU work:
from concurrent.futures import ProcessPoolExecutor
with ProcessPoolExecutor() as executor:
    results = list(executor.map(heavy_math, data_chunks))`,
        why: 'The CPython GIL permits only one thread to execute Python bytecode at any instant. Multi-threading CPU work adds context switching overhead without enabling parallel CPU cores.'
      },
      {
        mistake: 'Blocking the Asyncio Event Loop with Synchronous Calls',
        incorrectCode: `async def handle_request():
    # Disaster: time.sleep() blocks the ENTIRE event loop for ALL users!
    time.sleep(2.0)
    return "Done"`,
        correctCode: `async def handle_request():
    # Non-blocking yield back to loop
    await asyncio.sleep(2.0)
    return "Done"`,
        why: 'Asyncio is single-threaded cooperative multitasking. Calling synchronous blocking functions (`time.sleep`, `requests.get`) freezes the event loop, starving all other concurrent coroutines.'
      }
    ],

    comparisons: [
      {
        title: 'Python Concurrency Models',
        headers: ['Model', 'Execution Entity', 'Parallelism Type', 'Best For'],
        rows: [
          ['`threading`', 'OS Threads (Single Process)', 'Concurrent (GIL bound)', 'I/O-bound tasks with blocking libraries'],
          ['`multiprocessing`', 'Separate OS Processes', 'True Parallel (Multi-core)', 'CPU-bound computation, data science, image processing'],
          ['`asyncio`', 'Coroutines on Single Thread', 'Cooperative Concurrency', 'High-throughput network I/O, WebSockets, microservices']
        ]
      }
    ],

    questions: [
      {
        question: 'How does `__slots__` reduce memory usage in Python classes?',
        answer: 'By preventing the creation of the instance `__dict__` and allocating a compact fixed-size C array of pointers instead.',
        explanation: 'Standard instance dictionaries have hash table overhead. `__slots__` allocates only the specific pointer offsets needed.'
      },
      {
        question: 'What is the purpose of the `__set_name__` method in the Descriptor Protocol?',
        answer: 'It automatically informs the descriptor of the attribute name it was assigned to on the class.',
        explanation: 'Introduced in PEP 487, it eliminates the need to pass attribute names manually into descriptor constructors.'
      }
    ],

    practice: [
      {
        id: 'py-adv-ex1',
        title: 'Auto-Registering Subclass Plugin Architecture',
        difficulty: 'Advanced',
        prompt: 'Use `__init_subclass__` to build a base class `Plugin` that automatically maintains a registry dictionary `Plugin.registry: dict[str, type]` of all defined subclasses using their `name` class attribute.',
        starterCode: `class Plugin:
    registry = {}
    name = "base"
    # Implement __init_subclass__
    pass`,
        solution: `class Plugin:
    registry: dict[str, type] = {}
    name: str = "base"

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        if hasattr(cls, "name") and cls.name != "base":
            cls.registry[cls.name] = cls

# Subclasses auto-register upon definition
class AudioPlugin(Plugin):
    name = "audio"

class VideoPlugin(Plugin):
    name = "video"`,
        explanation: '`__init_subclass__` runs automatically whenever a subclass is created, enabling clean plugin discovery without complex metaclass machinery.'
      }
    ],

    references: [
      {
        title: 'Python Documentation: Descriptor HowTo Guide',
        type: 'Official Docs',
        url: 'https://docs.python.org/3/howto/descriptor.html'
      },
      {
        title: 'Python Documentation: asyncio — Asynchronous I/O',
        type: 'Official Docs',
        url: 'https://docs.python.org/3/library/asyncio.html'
      }
    ]
  });

})();
