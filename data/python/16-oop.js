/**
 * Sage — Python Topic 16: Object-Oriented Programming
 */

(function () {
  'use strict';

  SAGE.registerTopic({
    id: 'py-oop',
    title: 'Object-Oriented Programming & The Python Data Model',
    subject: 'python',
    module: 'Object-Oriented Programming',
    description: 'Classes, instances, the explicit self, dunder methods (__repr__, __eq__), inheritance, super(), MRO (C3 linearization), @property, and @classmethod.',
    difficulty: 'Intermediate',
    readTime: '17 min read',

    overview: {
      definition: 'Object-Oriented Programming (OOP) in Python models real-world entities through classes that bundle state (attributes) and behavior (methods). In Python, everything—including functions, integers, and classes themselves—is an object. Python\'s OOP is driven by the Python Data Model: special double-underscore ("dunder") methods that allow custom user classes to hook cleanly into language operators, iteration, and built-ins.',
      mentalModel: 'Think of a class as an architectural blueprint, and an instance as a physical house built from that blueprint. In Python, methods are plain functions stored on the class blueprint. When you call `house.turn_lights_on()`, Python translates it directly into `House.turn_lights_on(house)`, explicitly passing the physical house as the first argument (`self`).'
    },

    terminology: [
      {
        term: '`self`',
        definition: 'An explicit reference to the current instance of the class passed as the first parameter to instance methods. (By convention named `self`, though syntactically any valid identifier).'
      },
      {
        term: 'Dunder Methods (Magic Methods)',
        definition: 'Special methods with leading and trailing double underscores (e.g. `__init__`, `__repr__`, `__len__`) that define how objects behave with operators and built-in functions.'
      },
      {
        term: 'MRO (Method Resolution Order)',
        definition: 'The deterministic order in which Python searches base classes for attributes and methods, computed via the C3 Linearization algorithm. Visible via `Class.__mro__`.'
      },
      {
        term: '`super()`',
        definition: 'A proxy object that delegates method calls to the next class in the active instance\'s MRO, essential for clean cooperative multiple inheritance.'
      },
      {
        term: '`@property`',
        definition: 'A built-in decorator implementing the descriptor protocol to expose getter, setter, and deleter methods with clean attribute-access syntax (`obj.x` instead of `obj.get_x()`).'
      }
    ],

    explanation: [
      {
        heading: '1. The Explicit `self` and Instance Construction (`__new__` vs `__init__`)',
        content: 'When you create an object: <code>obj = Car("Model S")</code>, Python executes two phases:<br><ol><li><code>Car.__new__(Car, ...)</code>: Allocates the raw instance in memory.</li><li><code>Car.__init__(obj, "Model S")</code>: Initializes the instance attributes.</li></ol>Unlike C++ or Java where <code>this</code> is an implicit hidden keyword, Python requires <code>self</code> to be declared explicitly in method signatures, reinforcing the Zen of Python principle: <em>"Explicit is better than implicit."</em>'
      },
      {
        heading: '2. The Data Model: `__repr__` vs `__str__` and Operator Overloading',
        content: 'Always define <code>__repr__</code> on your custom classes:<br><ul><li><code>__repr__</code>: Unambiguous representation for developers and debuggers (ideally valid Python code that could recreate the object: <code>Point(x=10, y=20)</code>).</li><li><code>__str__</code>: Readable string representation for end users. If <code>__str__</code> is omitted, Python falls back to <code>__repr__</code> automatically.</li></ul>Implementing <code>__eq__</code>, <code>__hash__</code>, <code>__len__</code>, or <code>__getitem__</code> allows your custom classes to integrate with Python language features seamlessly.'
      },
      {
        heading: '3. Method Resolution Order (MRO) and Cooperative Multiple Inheritance',
        content: 'Python supports multiple inheritance using the C3 Linearization algorithm to compute a monotonic Method Resolution Order (MRO).<br>When calling <code>super().__init__()</code>, Python does not simply invoke the immediate parent; it advances to the <strong>next class in the instance\'s MRO chain</strong>. Inspecting <code>SubClass.__mro__</code> confirms the exact lookup sequence, preventing diamond inheritance ambiguities.'
      }
    ],

    syntax: {
      pattern: `# 1. Comprehensive Class Definition
class BankAccount:
    # Class attribute shared across all instances
    interest_rate: float = 0.05

    def __init__(self, owner: str, balance: float = 0.0):
        # Instance attributes
        self.owner = owner
        self._balance = max(0.0, balance)

    # 2. Getter & Setter via @property
    @property
    def balance(self) -> float:
        return self._balance

    @balance.setter
    def balance(self, value: float):
        if value < 0:
            raise ValueError("Balance cannot be negative")
        self._balance = value

    # 3. Class Method (Alternative Constructor)
    @classmethod
    def from_csv(cls, data_line: str):
        owner, bal = data_line.split(",")
        return cls(owner.strip(), float(bal.strip()))

    # 4. Developer Representation
    def __repr__(self) -> str:
        return f"BankAccount(owner={self.owner!r}, balance={self._balance})"`,
      components: [
        { part: 'def __init__(self, ...):', meaning: 'Initializer method setting up instance-specific attributes' },
        { part: '@property / @x.setter', meaning: 'Encapsulates field access with validation while keeping dot syntax' },
        { part: '@classmethod def func(cls):', meaning: 'Receives the class object cls; used for factory constructors' },
        { part: '__repr__(self):', meaning: 'Developer string representation for debugging and logging' }
      ]
    },

    examples: [
      {
        title: 'Vector Math Class Overloading Arithmetic & MRO Inspection',
        description: 'Demonstrating operator overloading (+, ==), property validation, and multiple inheritance MRO.',
        code: `import math

# 1. Custom Class with Operator Overloading
class Vector2D:
    def __init__(self, x: float, y: float):
        self.x = float(x)
        self.y = float(y)
        
    def __repr__(self) -> str:
        return f"Vector2D({self.x}, {self.y})"
        
    def __add__(self, other: "Vector2D") -> "Vector2D":
        if not isinstance(other, Vector2D):
            return NotImplemented
        return Vector2D(self.x + other.x, self.y + other.y)
        
    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Vector2D):
            return NotImplemented
        return math.isclose(self.x, other.x) and math.isclose(self.y, other.y)
        
    def magnitude(self) -> float:
        return math.hypot(self.x, self.y)

v1 = Vector2D(3, 4)
v2 = Vector2D(1, 2)
v3 = v1 + v2
print(f"Vector Addition: {v1} + {v2} = {v3}")
print(f"Magnitude of v1: {v1.magnitude():.2f}")
print(f"Equality check: {v1 == Vector2D(3.0, 4.0)}")

# 2. Multiple Inheritance and MRO
class BaseService:
    def execute(self):
        print("BaseService.execute")

class LoggingMixin:
    def execute(self):
        print("[LOG] Starting execution...")
        super().execute()
        print("[LOG] Finished execution.")

class AuditedService(LoggingMixin, BaseService):
    pass

service = AuditedService()
print("\\n--- Cooperative Inheritance Call ---")
service.execute()

print(f"\\nMRO Chain: {[cls.__name__ for cls in AuditedService.__mro__]}")`,
        output: `Vector Addition: Vector2D(3.0, 4.0) + Vector2D(1.0, 2.0) = Vector2D(4.0, 6.0)
Magnitude of v1: 5.00
Equality check: True

--- Cooperative Inheritance Call ---
[LOG] Starting execution...
BaseService.execute
[LOG] Finished execution.

MRO Chain: ['AuditedService', 'LoggingMixin', 'BaseService', 'object']`,
        explanation: [
          'Line 11-19: `__add__` and `__eq__` overload `+` and `==` operators. Returning `NotImplemented` allows Python to check right-hand reflection methods.',
          'Line 30-36: `LoggingMixin` calls `super().execute()`, delegating cleanly to the next class in the active MRO.',
          'Line 45: `AuditedService.__mro__` shows the C3 linearization resolution path: AuditedService -> LoggingMixin -> BaseService -> object.'
        ]
      }
    ],

    notes: [
      {
        type: 'info',
        title: 'Return `NotImplemented` for Unknown Types in Operators',
        body: 'When overloading operators like `__add__` or `__eq__`, return `NotImplemented` (not an error) if the `other` argument is of an unexpected type. This allows Python to try the reflected method (e.g. `__radd__`) on the other operand.'
      },
      {
        type: 'warning',
        title: 'Class Attributes vs Instance Attributes',
        body: 'Attributes defined at the class body level are shared across all instances. If you assign a mutable list as a class attribute, all instances share and mutate that same list!'
      },
      {
        type: 'tip',
        title: 'Private Attributes: Name Mangling (`__var`)',
        body: 'A single underscore `_var` is a convention signaling "internal use". A double underscore `__var` triggers CPython name mangling (renamed to `_ClassName__var`) to prevent accidental subclass overrides.'
      }
    ],

    commonMistakes: [
      {
        mistake: 'Using Mutable Class Attributes Instead of Instance Attributes',
        incorrectCode: `# Bug: items is shared across ALL instances!
class Cart:
    items = []  # Class attribute!

c1 = Cart()
c1.items.append("Laptop")
c2 = Cart()
# c2.items also contains "Laptop"!`,
        correctCode: `# Correct: Initialize inside __init__
class Cart:
    def __init__(self):
        self.items = []`,
        why: 'Class attributes are created once when the class definition is parsed. All instances reference the identical list object.'
      },
      {
        mistake: 'Calling Superclass Methods by Hardcoded Name Instead of `super()`',
        incorrectCode: `class Child(Parent):
    def __init__(self, x):
        Parent.__init__(self, x)  # Brittle and breaks multiple inheritance MRO!`,
        correctCode: `class Child(Parent):
    def __init__(self, x):
        super().__init__(x)  # Follows cooperative MRO dynamically`,
        why: 'Hardcoding `Parent.__init__` bypasses C3 linearization, causing diamond inheritance hierarchies to execute parent constructors multiple times or miss mixins.'
      }
    ],

    comparisons: [
      {
        title: 'Method Types in Python Classes',
        headers: ['Method Decorator', 'First Parameter', 'Access Scope', 'Typical Use Case'],
        rows: [
          ['Instance Method (None)', '`self`', 'Instance state (`self.*`) & class state', 'Standard business logic modifying instance data'],
          ['`@classmethod`', '`cls`', 'Class state (`cls.*`), cannot access instance', 'Alternative factory constructors (`from_json`)'],
          ['`@staticmethod`', 'None', 'Neither instance nor class state', 'Pure utility functions logically grouped within class namespace']
        ]
      }
    ],

    questions: [
      {
        question: 'What is the difference between `__str__` and `__repr__` in Python?',
        answer: '`__repr__` is for developers/debugging (unambiguous representation); `__str__` is for end users (readable text).',
        explanation: 'If `__str__` is missing, Python falls back to `__repr__`. Always implement `__repr__` first.'
      },
      {
        question: 'How does Python determine method lookup order in multiple inheritance?',
        answer: 'Through C3 Linearization (visible via `Class.__mro__`).',
        explanation: 'It guarantees monotonicity and preserves local precedence order across complex class hierarchies.'
      }
    ],

    practice: [
      {
        id: 'py-oop-ex1',
        title: 'Temperature Converter with @property Validation',
        difficulty: 'Intermediate',
        prompt: 'Create a class `Temperature` that stores temperature internally in Kelvin. Expose a property `celsius` with a getter and setter that converts between Celsius and Kelvin (`K = C + 273.15`). In the setter, raise a `ValueError` if the temperature is set below absolute zero (-273.15 °C).',
        starterCode: `class Temperature:
    # Your code here
    pass`,
        solution: `class Temperature:
    ABSOLUTE_ZERO_C: float = -273.15

    def __init__(self, celsius: float = 0.0):
        self.celsius = celsius  # Invokes property setter for validation

    @property
    def celsius(self) -> float:
        return self._kelvin + self.ABSOLUTE_ZERO_C

    @celsius.setter
    def celsius(self, value: float):
        if value < self.ABSOLUTE_ZERO_C:
            raise ValueError(f"Temperature {value}°C is below absolute zero (-273.15°C)")
        self._kelvin = value - self.ABSOLUTE_ZERO_C

    def __repr__(self) -> str:
        return f"Temperature(celsius={self.celsius:.2f})"` ,
        explanation: 'The `@celsius.setter` validates the temperature boundary upon initialization and reassignment, keeping the internal storage normalized to Kelvin.'
      }
    ],

    references: [
      {
        title: 'Python Documentation: Classes & The Data Model',
        type: 'Official Docs',
        url: 'https://docs.python.org/3/reference/datamodel.html'
      },
      {
        title: 'The Python 2.3 Method Resolution Order (C3 Linearization)',
        type: 'Official Docs',
        url: 'https://www.python.org/download/releases/2.3/mro/'
      }
    ]
  });

})();
