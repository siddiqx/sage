/**
 * Sage — Python Topic 15: Modules, Packages & Import Machinery
 */

(function () {
  'use strict';

  SAGE.registerTopic({
    id: 'py-modules-packages',
    title: 'Modules, Packages & Import Machinery',
    subject: 'python',
    module: 'Robust Programming & I/O',
    description: 'The CPython import system, sys.modules cache, sys.path resolution order, circular import resolution, and __all__ exports.',
    difficulty: 'Intermediate',
    readTime: '14 min read',

    overview: {
      definition: 'A module in Python is simply a single `.py` source file containing executable code and definitions. A package is a directory containing modules, typically identified by an `__init__.py` file (or a native namespace package via PEP 420). Python\'s import machinery manages module discovery, compilation, caching, and execution in isolated namespaces.',
      mentalModel: 'Think of `sys.modules` as an address book of already loaded modules in RAM. When you type `import math`, Python first checks if "math" is in the address book. If it is, Python hands you the cached reference instantly without re-reading the file. If not, it searches the file paths in `sys.path`, loads the bytecode, executes it once, and records it in `sys.modules`.'
    },

    terminology: [
      {
        term: '`sys.modules`',
        definition: 'A dictionary acting as the global cache of all loaded modules. If a module exists in `sys.modules`, subsequent imports return the cached instance.'
      },
      {
        term: '`sys.path`',
        definition: 'A list of directory strings searched in order for modules: (1) directory containing the input script, (2) `PYTHONPATH` environment variables, (3) standard library, (4) site-packages (pip dependencies).'
      },
      {
        term: '`__init__.py`',
        definition: 'File that initializes a package directory, executes package-level setup, and defines exported symbols via `__all__`.'
      },
      {
        term: '`__all__`',
        definition: 'A list of string names defining what is exported when a consumer executes wildcard import `from module import *`.'
      },
      {
        term: 'Circular Import',
        definition: 'A deadlock condition where Module A imports Module B, and Module B imports Module A before Module A has finished defining its objects.'
      }
    ],

    explanation: [
      {
        heading: '1. The 4 Stages of the Import System',
        content: 'When an import statement is encountered, CPython executes four distinct phases:<br><ol><li><strong>Cache Lookup:</strong> Checks <code>sys.modules</code>. If present, returns immediately.</li><li><strong>Finders:</strong> Inspects paths in <code>sys.path</code> using finder classes to locate the source or bytecode file.</li><li><strong>Loaders:</strong> Compiles source to bytecode if needed and constructs a new empty module object.</li><li><strong>Execution:</strong> Runs the module code from top to bottom in its own isolated global namespace dict (<code>module.__dict__</code>).</li></ol>'
      },
      {
        heading: '2. Controlling Exports with `__all__`',
        content: `To prevent internal helper functions or foreign imported libraries from leaking into a package's public API, define the <code>__all__</code> list in your module or <code>__init__.py</code>:<br><pre><code>__all__ = ["PublicService", "connect"]

def PublicService(): pass
def connect(): pass
def _internal_helper(): pass # Excluded from wildcard import!</code></pre>`
      },
      {
        heading: '3. Resolving Circular Imports',
        content: 'If Module A imports Module B while Module B imports Module A, an <code>ImportError</code> or <code>AttributeError</code> occurs because one module is partially initialized.<br><br><strong>Solutions:</strong><br><ul><li><strong>Refactoring (Best Practice):</strong> Extract shared data models or constants into a third module (e.g. <code>models.py</code> or <code>types.py</code>) that both modules can import safely.</li><li><strong>Deferred Imports:</strong> Move <code>import B</code> inside the specific function that uses it, deferring execution until runtime after both modules have loaded.</li><li><strong>Import the Module, Not the Object:</strong> Write <code>import module_b; module_b.func()</code> rather than <code>from module_b import func</code>.</li></ul>'
      }
    ],

    syntax: {
      pattern: `# 1. Standard Absolute Imports
import math
from pathlib import Path
from services.auth import Authenticator

# 2. Package __init__.py Export Control
# my_package/__init__.py
from .client import APIClient
from .errors import APIError

__all__ = ["APIClient", "APIError"]

# 3. Dynamic Import at Runtime
import importlib
plugin = importlib.import_module("plugins.stripe_billing")`,
      components: [
        { part: 'import module', meaning: 'Binds module name to its isolated namespace' },
        { part: 'from pkg import symbol', meaning: 'Imports symbol directly into local caller namespace' },
        { part: '__all__ = [...]', meaning: 'Explicitly defines public export interface for wildcard imports' },
        { part: 'importlib.import_module()', meaning: 'Programmatically imports a module by string name' }
      ]
    },

    examples: [
      {
        title: 'Inspecting sys.modules and Dynamic Plugin Loading',
        description: 'Demonstrating module cache inspection and programmatic dynamic importing.',
        code: `import sys
import importlib

# 1. Inspecting sys.modules Cache
print(f"Total modules currently cached in RAM: {len(sys.modules)}")
print(f"Is 'json' loaded yet? {'json' in sys.modules}")

# Importing json dynamically
import json
print(f"Is 'json' loaded now? {'json' in sys.modules}")
print(f"File path of json module: {json.__file__}")

# 2. Inspecting Search Resolution Paths (sys.path)
print("\\n--- Python Search Paths (First 3) ---")
for idx, path in enumerate(sys.path[:3]):
    print(f"  [{idx}]: {path}")

# 3. Dynamic Module Import via importlib
module_name = "math"
math_module = importlib.import_module(module_name)
pi_val = getattr(math_module, "pi")
print(f"\\nDynamically loaded {module_name}.pi: {pi_val}")`,
        output: `Total modules currently cached in RAM: 82
Is 'json' loaded yet? False
Is 'json' loaded now? True
File path of json module: C:\\Users\\...\\lib\\json\\__init__.py

--- Python Search Paths (First 3) ---
  [0]: D:\\Learning
  [1]: C:\\Users\\...\\Python311\\python311.zip
  [2]: C:\\Users\\...\\Python311\\DLLs

Dynamically loaded math.pi: 3.141592653589793`,
        explanation: [
          'Line 6-12: Shows how `sys.modules` reflects cached modules. Once `json` is imported, its reference is permanently stored in memory.',
          'Line 16-18: `sys.path[0]` is always the directory of the running script, establishing local module resolution priority.',
          'Line 21-24: `importlib.import_module()` dynamically imports modules using strings, fundamental for plugin and driver architectures.'
        ]
      }
    ],

    notes: [
      {
        type: 'warning',
        title: 'Never Use `from module import *` in Production',
        body: 'Wildcard imports pollute the local namespace, obscure where names originated, and risk silently overwriting existing built-in functions.'
      },
      {
        type: 'info',
        title: 'Namespace Packages (PEP 420)',
        body: 'In Python 3.3+, a directory without an `__init__.py` file is treated as a native namespace package, allowing multiple directories across different paths to contribute to a single package name.'
      },
      {
        type: 'tip',
        title: 'Modules Run Only Once on Import',
        body: 'Top-level code in a module executes only on the initial import. Subsequent `import` statements across different files simply return the cached `sys.modules` entry without re-executing.'
      }
    ],

    commonMistakes: [
      {
        mistake: 'Naming Local Files After Standard Library Modules',
        incorrectCode: `# Created local file named 'math.py' or 'random.py'
import math  # Imports your own math.py instead of Python's standard math!
print(math.sqrt(16))  # AttributeError: module 'math' has no attribute 'sqrt'`,
        correctCode: `# Name files descriptively to avoid shadowing:
# math_calculations.py or random_picker.py`,
        why: 'Because `sys.path[0]` is the current directory, Python finds your local `math.py` before searching the standard library, completely shadowing the real module.'
      },
      {
        mistake: 'Directly Modifying `sys.path` with Hardcoded Machine Strings',
        incorrectCode: `import sys
sys.path.append("C:\\Users\\alice\\projects\\core")  # Breaks on any other machine!`,
        correctCode: `from pathlib import Path
import sys
# Dynamic resolution relative to current file
sys.path.append(str(Path(__file__).resolve().parent.parent / "core"))`,
        why: 'Hardcoded paths prevent code from running across different machines, CI/CD runners, and operating systems.'
      }
    ],

    comparisons: [
      {
        title: 'Absolute vs Relative Imports',
        headers: ['Type', 'Syntax Example', 'Best Practice / Use Case'],
        rows: [
          ['Absolute Import', '`from my_pkg.services import auth`', 'Preferred: Unambiguous, works from anywhere in the application'],
          ['Explicit Relative', '`from . import sibling` or `from ..core import db`', 'Useful inside deeply nested packages for self-contained portability'],
          ['Implicit Relative', '`import sibling` (Python 2 legacy)', 'Strictly forbidden and removed in Python 3']
        ]
      }
    ],

    questions: [
      {
        question: 'What happens if you import the same module multiple times in different parts of an application?',
        answer: 'The code executes only once; subsequent imports return the cached object from `sys.modules`.',
        explanation: 'CPython verifies `sys.modules` before initiating search and compilation, preventing duplicate execution and redundant memory allocation.'
      },
      {
        question: 'What is the primary role of the `__all__` variable in a Python module?',
        answer: 'To define the list of public symbols exported during a wildcard import (`from module import *`).',
        explanation: 'If `__all__` is omitted, wildcard imports copy all names that do not begin with an underscore `_`.'
      }
    ],

    practice: [
      {
        id: 'py-mod-ex1',
        title: 'Dynamic Plugin Loader',
        difficulty: 'Intermediate',
        prompt: 'Write a function `load_plugin_handler(plugin_name: str, handler_name: str)` that uses `importlib` to dynamically import the module named `plugin_name` and return the callable attribute named `handler_name`. If the module or handler does not exist, raise a custom `PluginLoadError`.',
        starterCode: `class PluginLoadError(Exception):
    pass

def load_plugin_handler(plugin_name: str, handler_name: str):
    # Your code here
    pass`,
        solution: `import importlib

class PluginLoadError(Exception):
    pass

def load_plugin_handler(plugin_name: str, handler_name: str):
    try:
        mod = importlib.import_module(plugin_name)
    except ModuleNotFoundError as err:
        raise PluginLoadError(f"Plugin module '{plugin_name}' not found") from err
        
    try:
        handler = getattr(mod, handler_name)
    except AttributeError as err:
        raise PluginLoadError(f"Handler '{handler_name}' not found in plugin '{plugin_name}'") from err
        
    if not callable(handler):
        raise PluginLoadError(f"Handler '{handler_name}' is not callable")
        
    return handler`,
        explanation: 'Combines `importlib.import_module` and `getattr` with custom exception chaining and `callable` verification.'
      }
    ],

    references: [
      {
        title: 'Python Documentation: The Import System',
        type: 'Official Docs',
        url: 'https://docs.python.org/3/reference/import.html'
      },
      {
        title: 'Python Documentation: importlib — The implementation of import',
        type: 'Official Docs',
        url: 'https://docs.python.org/3/library/importlib.html'
      }
    ]
  });

})();
