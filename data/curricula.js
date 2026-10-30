/**
 * Sage — Curricula & Foundational Topics for Remaining Disciplines
 * Data Engineering, Cloud, AI & ML, AI Automation, Mathematics, CS, Blockchain, Physics, Software Dev
 */

(function () {
  'use strict';

  // 1. DATA ENGINEERING
  SAGE.registerTopic({
    id: 'de-fundamentals',
    title: 'Data Engineering Foundations & ETL/ELT Paradigms',
    subject: 'data-engineering',
    module: 'Pipelines & Architecture',
    description: 'Data architectures, OLTP vs OLAP, ETL vs ELT pipelines, medallion architecture, and data lakehouses.',
    difficulty: 'Beginner',
    readTime: '14 min read',
    overview: {
      definition: 'Data Engineering is the discipline of designing, building, and operating scalable systems that ingest, transform, clean, and deliver reliable data for analytics and machine learning. Modern architectures contrast OLTP transactional databases with OLAP analytical warehouses, shifting from legacy ETL (Extract, Transform, Load) to modern cloud ELT (Extract, Load, Transform).',
      mentalModel: 'Think of data engineering as municipal water infrastructure. Raw water from multiple rivers and reservoirs (databases, APIs, event streams) is collected in holding tanks (Data Lake). It is treated through successive filtration stages (Bronze -> Silver -> Gold Medallion architecture) until clean, pressurized drinking water flows reliably into household taps (BI dashboards and ML models).'
    },
    terminology: [
      { term: 'OLTP', definition: 'Online Transaction Processing: row-oriented databases optimized for fast, atomic CRUD transactions (PostgreSQL, MySQL).' },
      { term: 'OLAP', definition: 'Online Analytical Processing: columnar data warehouses optimized for aggregating millions of rows across few columns (Snowflake, BigQuery).' },
      { term: 'Medallion Architecture', definition: 'Data design pattern organizing data into Bronze (raw ingestion), Silver (cleaned/conformed), and Gold (business aggregated) layers.' }
    ],
    explanation: [
      {
        heading: 'ETL vs ELT Evolution',
        content: 'Historically, data pipelines used ETL because hardware storage and database compute were expensive. Transformations happened in external compute clusters before loading. With modern cloud warehouses (BigQuery, Snowflake) that scale storage and compute independently, ELT has become dominant: raw data is loaded directly, and SQL/dbt transforms it in-warehouse at massive parallel scale.'
      }
    ],
    syntax: {
      pattern: `-- Typical dbt / SQL Transformation Model in ELT
WITH bronze_source AS (
    SELECT * FROM {{ source('raw_events', 'clickstream') }}
),
silver_cleaned AS (
    SELECT
        user_id,
        event_name,
        CAST(event_timestamp AS TIMESTAMPTZ) AS event_time
    FROM bronze_source
    WHERE user_id IS NOT NULL
)
SELECT * FROM silver_cleaned;`,
      components: [
        { part: 'source()', meaning: 'dbt macro referencing raw bronze lakehouse table' },
        { part: 'silver_cleaned', meaning: 'In-warehouse SQL model producing structured, deduplicated tables' }
      ]
    },
    examples: [
      {
        title: 'Batch Ingestion Pipeline Pattern in Python',
        description: 'Streaming chunks from API into columnar Parquet storage.',
        code: `import pyarrow as pa
import pyarrow.parquet as pq

data = [
    {"event_id": 1, "user_id": "u101", "action": "login"},
    {"event_id": 2, "user_id": "u102", "action": "purchase"}
]

# Write to efficient columnar format
table = pa.Table.from_pylist(data)
pq.write_table(table, "events_bronze.parquet")
print(f"Stored {len(table)} events into columnar Parquet format.")`,
        output: `Stored 2 events into columnar Parquet format.`,
        explanation: ['Columnar storage formats like Parquet compress text and numbers efficiently by column, accelerating analytical query scans by 10-100x.']
      }
    ],
    notes: [
      { type: 'tip', title: 'Columnar Compression', body: 'Parquet and ORC formats store values by column rather than row, enabling dictionary encoding and run-length compression.' }
    ],
    commonMistakes: [
      {
        mistake: 'Running Heavy Analytical Aggregations on Primary OLTP Databases',
        incorrectCode: `-- Running full scans on primary transactional DB during business hours:
SELECT customer_id, SUM(total) FROM orders GROUP BY customer_id;`,
        correctCode: `-- Replicate to analytical warehouse or read replica:
-- Run heavy analytical queries on Snowflake, BigQuery, or ClickHouse`,
        why: 'OLTP databases use row-oriented storage. Analytical table scans consume CPU and memory, locking transactional tables needed for live customer orders.'
      }
    ],
    questions: [
      { question: 'Why is ELT preferred over ETL in modern cloud data stacks?', answer: 'Because cloud data warehouses provide scalable, separated compute engines capable of transforming petabytes of raw data using standard SQL.' }
    ],
    practice: [
      {
        id: 'de-p1', title: 'Design a Dimensional Star Schema', difficulty: 'Beginner',
        prompt: 'Define the grain and identify Fact and Dimension tables for an e-commerce sales model.',
        solution: 'Fact: `fact_orders` (order_id, date_key, customer_key, product_key, quantity, revenue). Dimensions: `dim_customers`, `dim_products`, `dim_date`.',
        explanation: 'Fact tables record measurable business events; dimension tables provide descriptive context for filtering and grouping.'
      }
    ],
    references: [
      { title: 'The Data Warehouse Toolkit (Ralph Kimball)', type: 'Book', url: 'https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/books/' }
    ]
  });

  // 2. CLOUD COMPUTING
  SAGE.registerTopic({
    id: 'cloud-fundamentals',
    title: 'Cloud Architecture & Microsoft Azure Core Services',
    subject: 'cloud',
    module: 'Cloud Architecture',
    description: 'Cloud deployment models, IaaS vs PaaS vs Serverless, Azure resource hierarchy, and high availability design.',
    difficulty: 'Beginner',
    readTime: '13 min read',
    overview: {
      definition: 'Cloud computing delivers on-demand computing services (compute, storage, databases, networking) over the internet on a pay-as-you-go pricing model. Core delivery models range from Infrastructure-as-a-Service (IaaS: Virtual Machines) to Platform-as-a-Service (PaaS: App Services, Managed DBs) and Serverless (Azure Functions).',
      mentalModel: 'Think of IaaS as renting a plot of land where you build and maintain the entire house yourself. PaaS is renting an apartment where plumbing and electrical infrastructure are handled by building management, and you only furnish the interior (your code). Serverless is staying in a hotel room where you only pay for the exact minutes you occupy the bed.'
    },
    terminology: [
      { term: 'IaaS (Infrastructure as a Service)', definition: 'Cloud provider provisions raw virtual machines, networking, and disks; user manages OS, patches, and runtime.' },
      { term: 'PaaS (Platform as a Service)', definition: 'Provider manages OS, hardware, and runtime; user deploys application code directly.' },
      { term: 'Availability Zone (AZ)', definition: 'Physically separated datacenters within an Azure region with independent power, cooling, and networking.' }
    ],
    explanation: [
      {
        heading: 'Azure Resource Management Hierarchy',
        content: 'Azure organizes all cloud resources into a strict 4-level management hierarchy: Management Groups -> Subscriptions -> Resource Groups -> Resources. Resource Groups act as lifecycle boundaries: deleting a resource group cleanly tears down all associated virtual machines, databases, and network adapters.'
      }
    ],
    syntax: {
      pattern: `# Azure CLI Resource Group & Storage Creation
az group create --name rg-production --location eastus
az storage account create \\
    --name mystorageprod42 \\
    --resource-group rg-production \\
    --location eastus \\
    --sku Standard_ZRS`,
      components: [
        { part: 'az group create', meaning: 'Allocates administrative boundary and lifecycle container' },
        { part: 'Standard_ZRS', meaning: 'Zone-Redundant Storage replicating data across 3 availability zones' }
      ]
    },
    examples: [
      {
        title: 'Azure CLI Storage & Identity Allocation',
        description: 'Creating resource group and inspecting location metadata.',
        code: `# Query available Azure regions with Availability Zones
az account list-locations --query "[?metadata.regionCategory=='Recommended'].{Name:name, Display:displayName}" -o table`,
        output: `Name         Display
-----------  -----------------
eastus       East US
eastus2      East US 2
westeurope   West Europe`,
        explanation: ['Selecting multi-zone regions guarantees 99.99% uptime SLAs for cloud compute and storage resources.']
      }
    ],
    notes: [
      { type: 'info', title: 'Shared Responsibility Model', body: 'In the cloud, security is shared: the provider secures the physical infrastructure (hardware, facilities, host virtualization), while the customer secures data, identity, and application code.' }
    ],
    commonMistakes: [
      {
        mistake: 'Hardcoding Credentials in Cloud Code Instead of Managed Identity',
        incorrectCode: `connection_string = "DefaultEndpointsProtocol=https;AccountName=prod;AccountKey=SECRET..."`,
        correctCode: `from azure.identity import DefaultAzureCredential
credential = DefaultAzureCredential()  # Uses Azure Managed Identity without secrets!`,
        why: 'Hardcoded secrets leak into git repositories. Azure Managed Identities eliminate credentials entirely by using Azure AD token exchange.'
      }
    ],
    questions: [
      { question: 'What is the advantage of Zone-Redundant Storage (ZRS) over Locally Redundant Storage (LRS)?', answer: 'ZRS replicates data across three separate physical datacenters within a region, surviving complete single-datacenter disasters.' }
    ],
    practice: [
      {
        id: 'cloud-p1', title: 'Map Application Architecture to Cloud Tiers', difficulty: 'Beginner',
        prompt: 'Given a web API requiring 99.95% uptime and automated scaling with zero OS maintenance, choose the appropriate Azure compute tier.',
        solution: 'Azure App Service (PaaS) or Azure Container Apps configured across Availability Zones.',
        explanation: 'PaaS handles OS patching and auto-scaling automatically without virtual machine management overhead.'
      }
    ],
    references: [
      { title: 'Microsoft Azure Well-Architected Framework', type: 'Official Docs', url: 'https://learn.microsoft.com/en-us/azure/well-architected/' }
    ]
  });

  // 3. AI & MACHINE LEARNING
  SAGE.registerTopic({
    id: 'ai-ml-fundamentals',
    title: 'Machine Learning Foundations & Neural Networks',
    subject: 'ai-ml',
    module: 'Foundations of AI',
    description: 'Loss functions, gradient descent optimization, backpropagation, and deep neural network feedforward mechanics.',
    difficulty: 'Intermediate',
    readTime: '15 min read',
    overview: {
      definition: 'Machine Learning (ML) is the computational study of algorithms that improve performance automatically through empirical data rather than explicit rule programming. Deep Learning uses deep neural networks parameterized by weights and biases, trained via gradient descent and backpropagation to minimize an empirical loss function.',
      mentalModel: 'Think of training a neural network as navigating a blindfolded hiker down a misty mountain (the loss surface) to find the lowest valley (minimum error). The hiker feels the slope beneath their feet (gradient) and takes a small step in the steepest downward direction (learning rate). Backpropagation is the communication cable that tells every joint in the hiker\'s legs how to adjust to take that step.'
    },
    terminology: [
      { term: 'Loss Function', definition: 'Mathematical metric quantifying the error between predicted outputs and ground-truth labels (e.g. Mean Squared Error, Cross-Entropy).' },
      { term: 'Gradient Descent', definition: 'First-order iterative optimization algorithm adjusting weights in the negative direction of the loss gradient: `w = w - lr * dL/dw`.' },
      { term: 'Backpropagation', definition: 'Efficient algorithm applying the calculus chain rule backward from the loss through network layers to calculate weight gradients.' }
    ],
    explanation: [
      {
        heading: 'Gradient Descent & Learning Rate Dynamics',
        content: 'Weights update according to: <code>w_new = w_old - learning_rate * (dL/dw)</code>.<br>If the learning rate is too small, convergence takes millions of iterations. If too large, the updates overshoot the valley, diverging into infinite loss values.'
      }
    ],
    syntax: {
      pattern: `# PyTorch Neural Network Definition
import torch.nn as nn

class MLPClassifier(nn.Module):
    def __init__(self, in_features: int, hidden_dim: int, num_classes: int):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(in_features, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, num_classes)
        )
        
    def forward(self, x):
        return self.net(x)`,
      components: [
        { part: 'nn.Linear(in, out)', meaning: 'Dense linear transformation: y = xW^T + b' },
        { part: 'nn.ReLU()', meaning: 'Non-linear activation function: f(x) = max(0, x)' }
      ]
    },
    examples: [
      {
        title: 'Single-Layer Perceptron Forward Pass in NumPy',
        description: 'Matrix multiplication and ReLU activation step by step.',
        code: `import numpy as np

def relu(x): return np.maximum(0, x)

X = np.array([[1.0, 2.0]])         # Input: 1 sample, 2 features
W = np.array([[0.5, -0.2],         # Weights: 2x2 matrix
              [0.8,  0.4]])
b = np.array([0.1, -0.5])          # Biases

z = np.dot(X, W) + b
a = relu(z)

print(f"Linear output (z):     {z}")
print(f"Activated output (a):  {a}")`,
        output: `Linear output (z):     [[2.2 0.1]]
Activated output (a):  [[2.2 0.1]]`,
        explanation: ['`np.dot(X, W) + b` computes the affine transformation, and `relu(z)` introduces non-linearity allowing the network to learn non-linear boundaries.']
      }
    ],
    notes: [
      { type: 'info', title: 'Why Non-Linear Activation Matters', body: 'Without non-linear activations (ReLU, GELU), stacking 100 linear layers collapses mathematically into a single linear matrix transformation: W3(W2(W1 * x)) = W_combined * x.' }
    ],
    commonMistakes: [
      {
        mistake: 'Failing to Zero Gradients in PyTorch Training Loops',
        incorrectCode: `loss.backward()
optimizer.step() # Bug: Gradients accumulate on every step!`,
        correctCode: `optimizer.zero_grad() # Clear previous gradients
loss.backward()
optimizer.step()`,
        why: 'In PyTorch, gradients accumulate by default (`+=`) to support gradient accumulation across micro-batches. Omitting `zero_grad()` compounds gradients, corrupting weight updates.'
      }
    ],
    questions: [
      { question: 'What is the vanishing gradient problem and how does ReLU mitigate it?', answer: 'Sigmoid/Tanh activations have derivative maximums of 0.25, causing gradients to shrink exponentially through deep layers. ReLU has a derivative of 1 for all positive values, preventing gradient decay.' }
    ],
    practice: [
      {
        id: 'ai-p1', title: 'Compute Mean Squared Error Derivative', difficulty: 'Intermediate',
        prompt: 'Given MSE loss `L = (1/N) * sum((y_pred - y_true)**2)`, calculate the partial derivative with respect to `y_pred`.',
        solution: '`dL/dy_pred = (2/N) * (y_pred - y_true)`',
        explanation: 'Applying the power rule to the squared difference yields `2 * (y_pred - y_true) / N`.'
      }
    ],
    references: [
      { title: 'Understanding Deep Learning (Simon J.D. Prince)', type: 'Book', url: 'https://udlbook.github.io/udlbook/' }
    ]
  });

  // 4. AI AUTOMATION
  SAGE.registerTopic({
    id: 'ai-auto-agents',
    title: 'Autonomous AI Agents, ReAct Loops & Tool Execution',
    subject: 'ai-automation',
    module: 'Agentic Systems',
    description: 'The ReAct prompting paradigm (Reason + Act), Model Context Protocol (MCP), structured tool schemas, and multi-agent coordination.',
    difficulty: 'Intermediate',
    readTime: '15 min read',
    overview: {
      definition: 'An Autonomous AI Agent is a software system where a Large Language Model (LLM) acts as a reasoning engine, interacting with its environment through continuous feedback loops: perceiving state, reasoning about goals, selecting and executing tools, and evaluating outcomes until a task objective is fulfilled.',
      mentalModel: 'Think of an LLM as a brilliant brain in a jar. By itself, it can only talk. An AI Agent connects the brain to eyes (retrieval systems, APIs) and hands (tools, shell execution, code interpreters), enabling it to observe reality, run commands, observe errors, and correct its actions until the job is done.'
    },
    terminology: [
      { term: 'ReAct (Reason + Act)', definition: 'Agent paradigm combining internal chain-of-thought reasoning with external tool action and observation steps.' },
      { term: 'Model Context Protocol (MCP)', definition: 'Open standard protocol enabling AI applications to discover and interact securely with external tools, prompts, and resources.' },
      { term: 'Tool / Function Calling', definition: 'Structured JSON Schema describing a callable function that an LLM can choose to invoke with generated argument payloads.' }
    ],
    explanation: [
      {
        heading: 'The ReAct Loop Mechanism',
        content: 'An agent operates in a cyclic loop:<br><ol><li><strong>Thought:</strong> The agent analyzes the user prompt, available tools, and conversational context to devise a plan.</li><li><strong>Action:</strong> The agent emits a tool call payload (e.g. <code>fetch_weather(city="Seattle")</code>).</li><li><strong>Observation:</strong> The execution runtime executes the tool and injects the output back into the conversation context.</li><li><strong>Iteration:</strong> The agent inspects the observation and repeats until producing the final answer.</li></ol>'
      }
    ],
    syntax: {
      pattern: `# JSON Schema Tool Definition for LLM Function Calling
TOOL_SCHEMA = {
    "type": "function",
    "function": {
        "name": "query_database",
        "description": "Executes read-only SQL queries against reporting database",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "SQL SELECT query string"}
            },
            "required": ["query"]
        }
    }
}`,
      components: [
        { part: 'name', meaning: 'Unique identifier the model uses to invoke the function' },
        { part: 'parameters', meaning: 'Standard JSON Schema specifying required and optional arguments' }
      ]
    },
    examples: [
      {
        title: 'ReAct Loop Implementation Pattern in Python',
        description: 'Simulating an autonomous agent loop with tool dispatch.',
        code: `def execute_tool(tool_name: str, args: dict) -> str:
    if tool_name == "calculator":
        return str(eval(args["expr"]))
    return "Error: Unknown tool"

# Simulated agent trace
print("THOUGHT: User needs to calculate compound interest for \$1,000 at 5% over 3 years.")
print("ACTION:  calculator({'expr': '1000 * (1.05 ** 3)'})")
observation = execute_tool("calculator", {"expr": "1000 * (1.05 ** 3)"})
print(f"OBSERVE: {observation}")
print(f"FINAL:   The total investment value will be \${float(observation):.2f}.")`,
        output: `THOUGHT: User needs to calculate compound interest for \$1,000 at 5% over 3 years.
ACTION:  calculator({'expr': '1000 * (1.05 ** 3)'})
OBSERVE: 1157.6250000000002
FINAL:   The total investment value will be \$1157.62.`,
        explanation: ['The agent inspects the user intent, isolates calculation to an external deterministic tool, and parses the observation into a natural language response.']
      }
    ],
    notes: [
      { type: 'warning', title: 'Preventing Infinite Agent Loops', body: 'Always set a maximum iteration limit (`max_iterations = 10`) on agent loops to prevent recursive model token burn when tools return persistent errors.' }
    ],
    commonMistakes: [
      {
        mistake: 'Failing to Handle Malformed JSON Tool Call Outputs',
        incorrectCode: `args = json.loads(model_response.tool_call.arguments) # Crashes if model emits partial JSON`,
        correctCode: `try:
    args = json.loads(model_response.tool_call.arguments)
except json.JSONDecodeError as err:
    # Send feedback back to model: "Tool arguments invalid JSON, please re-try"
    feed_error_to_model(err)`,
        why: 'LLMs can occasionally output truncated or unescaped JSON. Robust agent engines catch parse errors and prompt the model to correct its payload.'
      }
    ],
    questions: [
      { question: 'What is the role of the Model Context Protocol (MCP)?', answer: 'To provide a standardized client-server protocol for connecting AI models to local files, databases, and third-party developer tools.' }
    ],
    practice: [
      {
        id: 'auto-p1', title: 'Design a Weather Tool Schema', difficulty: 'Beginner',
        prompt: 'Create a JSON schema for a `get_weather` tool accepting a required `city` string and an optional `units` enum ("celsius" or "fahrenheit").',
        solution: '{"name": "get_weather", "parameters": {"type": "object", "properties": {"city": {"type": "string"}, "units": {"type": "string", "enum": ["celsius", "fahrenheit"]}}, "required": ["city"]}}',
        explanation: 'Specifies the contract the model uses to validate and emit tool call parameters.'
      }
    ],
    references: [
      { title: 'ReAct: Synergizing Reasoning and Acting in Language Models (Yao et al., 2022)', type: 'Paper', url: 'https://arxiv.org/abs/2210.03629' }
    ]
  });

  // 5. MATHEMATICS
  SAGE.registerTopic({
    id: 'math-linear-algebra',
    title: 'Linear Algebra: Vectors, Matrices & Transformations',
    subject: 'mathematics',
    module: 'Linear Algebra',
    description: 'Vector spaces, dot products, matrix multiplication, determinants, eigenvalues, eigenvectors, and geometric linear transformations.',
    difficulty: 'Intermediate',
    readTime: '15 min read',
    overview: {
      definition: 'Linear Algebra is the mathematical branch dealing with linear equations, vectors, vector spaces, and linear transformations between vector spaces. It forms the computational foundation of graphics, physics simulations, quantum mechanics, and machine learning neural networks.',
      mentalModel: 'Think of a matrix not as a static table of numbers, but as a dynamic dynamic spatial transformation. Multiplying a vector by a matrix moves, rotates, stretches, or shears space while keeping the origin fixed and keeping grid lines parallel and evenly spaced.'
    },
    terminology: [
      { term: 'Vector Space', definition: 'A set of vectors that can be added together and scaled by numbers (scalars), satisfying 8 vector space axioms.' },
      { term: 'Dot Product', definition: 'Algebraic operation taking two equal-length sequences of numbers and returning a single scalar: `u · v = |u||v| cos(θ)`.' },
      { term: 'Eigenvector & Eigenvalue', definition: 'An eigenvector `v` of matrix `A` is a non-zero vector that does not change direction when transformed by `A`: `A v = λ v` (where `λ` is the scalar eigenvalue).' }
    ],
    explanation: [
      {
        heading: 'Matrix Multiplication Mechanics',
        content: 'For matrix product <code>C = A · B</code>, the number of columns in <code>A</code> must match the number of rows in <code>B</code>. Each entry <code>C[i, j]</code> is the dot product of the i-th row of A and the j-th column of B.'
      }
    ],
    syntax: {
      pattern: `# Linear Algebra in Python (NumPy)
import numpy as np

# Vector Dot Product
u = np.array([1, 2, 3])
v = np.array([4, 5, 6])
dot_prod = np.dot(u, v)

# Matrix Multiplication
A = np.array([[1, 2], [3, 4]])
B = np.array([[5, 6], [7, 8]])
C = A @ B  # Matrix multiplication operator @`,
      components: [
        { part: 'u @ v', meaning: 'Python matrix multiplication operator (PEP 465)' },
        { part: 'np.linalg.eig(A)', meaning: 'Computes eigenvalues and eigenvectors of square matrix A' }
      ]
    },
    examples: [
      {
        title: 'Eigenvalue & Eigenvector Decomposition',
        description: 'Calculating eigenvalues and verifying A v = λ v.',
        code: `import numpy as np

A = np.array([[4, 1],
              [2, 3]])

eigenvalues, eigenvectors = np.linalg.eig(A)

print(f"Eigenvalues: {eigenvalues}")
# Verify first eigenpair: A @ v == lambda * v
v1 = eigenvectors[:, 0]
lambda1 = eigenvalues[0]

left = A @ v1
right = lambda1 * v1
print(f"A @ v:       {left}")
print(f"lambda * v:  {right}")
print(f"Matches?     {np.allclose(left, right)}")`,
        output: `Eigenvalues: [5. 2.]
A @ v:       [3.57770876 3.57770876]
lambda * v:  [3.57770876 3.57770876]
Matches?     True`,
        explanation: ['The transformation matrix `A` stretches eigenvector `v1` by factor 5 without rotating its spatial direction.']
      }
    ],
    notes: [
      { type: 'info', title: 'Determinant Meaning', body: 'The determinant of a 2x2 matrix represents the factor by which area is scaled under the transformation. If det(A) = 0, the matrix collapses space onto a line or point and is non-invertible (singular).' }
    ],
    commonMistakes: [
      {
        mistake: 'Using `*` Instead of `@` for Matrix Multiplication in Python',
        incorrectCode: `C = A * B  # Element-wise Hadamard product, NOT matrix multiplication!`,
        correctCode: `C = A @ B  # True matrix multiplication`,
        why: 'In NumPy, `*` multiplies corresponding elements `A[i,j] * B[i,j]`. Matrix multiplication requires the `@` operator or `np.matmul()`.'
      }
    ],
    questions: [
      { question: 'What does a matrix determinant of zero indicate?', answer: 'The matrix is singular and non-invertible, collapsing dimensions (e.g. area to zero).' }
    ],
    practice: [
      {
        id: 'math-p1', title: 'Calculate Dot Product and Orthogonality', difficulty: 'Beginner',
        prompt: 'Given vectors `u = [2, 3]` and `v = [-3, 2]`, calculate their dot product and determine if they are orthogonal.',
        solution: '`u · v = 2*(-3) + 3*2 = -6 + 6 = 0`. Since the dot product is 0, the vectors are orthogonal (perpendicular).',
        explanation: 'Two non-zero vectors are perpendicular if and only if their dot product equals zero.'
      }
    ],
    references: [
      { title: 'Linear Algebra Done Right (Sheldon Axler)', type: 'Book', url: 'https://linear.axler.net/' }
    ]
  });

  // 6. COMPUTER SCIENCE
  SAGE.registerTopic({
    id: 'cs-os-virtualization',
    title: 'Operating Systems: Virtualization & Concurrency',
    subject: 'computer-science',
    module: 'Computer Systems',
    description: 'CPU virtualization, virtual memory paging, process vs thread state, context switches, mutexes, and deadlocks.',
    difficulty: 'Intermediate',
    readTime: '16 min read',
    overview: {
      definition: 'Operating Systems manage computer hardware and provide a standardized abstraction layer for application software. Core operating system principles revolve around Virtualization (turning physical resources like CPUs and RAM into virtual instances), Concurrency (coordinating multiple simultaneous execution threads), and Persistence (managing reliable filesystem storage).',
      mentalModel: 'Think of the Operating System kernel as an air traffic controller. Multiple airplanes (processes) need access to the same runways (CPU cores) and terminals (RAM). The controller gives each airplane the illusion that it owns the entire airport, allocating runway time slices (scheduling) and private gates (virtual memory address spaces) while ensuring planes never collide.'
    },
    terminology: [
      { term: 'Process vs Thread', definition: 'A Process has its own isolated virtual memory address space. Threads within a process share the same memory space, code, and global data, but have independent execution stacks.' },
      { term: 'Virtual Memory & Paging', definition: 'Hardware memory management technique (MMU) translating virtual addresses into physical RAM frames in 4 KB pages, using page tables.' },
      { term: 'Context Switch', definition: 'The process of saving the CPU register state of a running process and loading the saved state of another process.' }
    ],
    explanation: [
      {
        heading: 'Virtual Memory Translation via Page Tables',
        content: 'When an application accesses memory address <code>0x0040A100</code>, the CPU\'s Memory Management Unit (MMU) intercepts the request. It looks up the Virtual Page Number in the process\'s Page Table, translating it to a Physical Frame Number in hardware RAM. If the page is not in RAM, the OS raises a <strong>Page Fault</strong>, loading the page from swap disk storage.'
      }
    ],
    syntax: {
      pattern: `// POSIX C Thread Creation & Mutex Lock
#include <pthread.h>

pthread_mutex_t lock = PTHREAD_MUTEX_INITIALIZER;
int shared_counter = 0;

void* worker(void* arg) {
    pthread_mutex_lock(&lock);
    shared_counter++; // Critical Section
    pthread_mutex_unlock(&lock);
    return NULL;
}`,
      components: [
        { part: 'pthread_mutex_lock', meaning: 'Acquires mutual exclusion lock, blocking other threads' },
        { part: 'Critical Section', meaning: 'Code accessing shared mutable state requiring exclusive access' }
      ]
    },
    examples: [
      {
        title: 'Race Condition Demonstration in Python',
        description: 'Observing shared memory corruption without synchronization.',
        code: `import threading

counter = 0

def increment():
    global counter
    for _ in range(100_000):
        # Non-atomic read-modify-write
        counter += 1

t1 = threading.Thread(target=increment)
t2 = threading.Thread(target=increment)

t1.start(); t2.start()
t1.join(); t2.join()

print(f"Final Counter: {counter} (Expected 200,000 without race conditions)")`,
        output: `Final Counter: 200000 (Protected by CPython GIL in simple integers, but corrupted in multi-core native threads)`,
        explanation: ['In multi-threaded C/C++ or multi-process systems without locks, concurrent interleaved reads and writes drop updates.']
      }
    ],
    notes: [
      { type: 'info', title: 'The Coffman Deadlock Conditions', body: 'A deadlock can occur only if all 4 Coffman conditions hold: (1) Mutual Exclusion, (2) Hold and Wait, (3) No Preemption, (4) Circular Wait. Breaking any one condition prevents deadlocks.' }
    ],
    commonMistakes: [
      {
        mistake: 'Acquiring Locks in Inconsistent Order Across Threads',
        incorrectCode: `// Thread 1 acquires A then B; Thread 2 acquires B then A -> DEADLOCK!`,
        correctCode: `// Always enforce global lock acquisition hierarchy: All threads acquire A before B`,
        why: 'Inconsistent lock ordering creates circular wait chains where Thread 1 waits for Lock B while holding Lock A, and Thread 2 waits for Lock A while holding Lock B.'
      }
    ],
    questions: [
      { question: 'What is a context switch and what overhead does it introduce?', answer: 'Saving CPU registers and switching memory address spaces (TLB cache flush), causing CPU cycle overhead.' }
    ],
    practice: [
      {
        id: 'cs-p1', title: 'Identify Page Table Number', difficulty: 'Beginner',
        prompt: 'In a 32-bit system with 4 KB (2^12 bytes) page sizes, how many bits represent the page offset and how many represent the page number?',
        solution: 'Page offset: 12 bits (2^12 = 4096). Page number: 32 - 12 = 20 bits (allowing 2^20 = 1,048,576 pages).',
        explanation: 'Virtual addresses are partitioned into upper Page Number bits and lower Offset bits within the page.'
      }
    ],
    references: [
      { title: 'Operating Systems: Three Easy Pieces (Remzi Arpaci-Dusseau)', type: 'Book', url: 'https://pages.cs.wisc.edu/~remzi/OSTEP/' }
    ]
  });

  // 7. BLOCKCHAIN
  SAGE.registerTopic({
    id: 'bc-solidity-contracts',
    title: 'Ethereum, EVM & Solidity Smart Contracts',
    subject: 'blockchain',
    module: 'Smart Contract Engineering',
    description: 'EVM stack architecture, gas mechanics, Solidity state variables, reentrancy vulnerabilities, and checks-effects-interactions.',
    difficulty: 'Intermediate',
    readTime: '16 min read',
    overview: {
      definition: 'The Ethereum Virtual Machine (EVM) is a quasi-Turing complete, sandboxed state machine that executes deterministic smart contracts across a distributed cryptographic consensus network. Solidity is the primary object-oriented language for writing contracts. Every computational opcode consumes a fee ("Gas") to prevent infinite loops and denial-of-service attacks.',
      mentalModel: 'Think of the EVM as a worldwide shared computer where state changes are recorded in an append-only cryptographic ledger. Every instruction (adding numbers, storing bytes) requires a meter token (Gas). If your code runs out of gas, all changes are rolled back automatically, while the gas spent is consumed by the miners/validators.'
    },
    terminology: [
      { term: 'Gas', definition: 'The fundamental unit of computational effort required to execute specific operations on the Ethereum network.' },
      { term: 'Storage vs Memory', definition: '`storage` is permanently written to the blockchain state (expensive). `memory` is temporary byte array storage discarded after transaction execution (cheap).' },
      { term: 'Reentrancy Attack', definition: 'Vulnerability where an external contract hijacks execution flow during an external call before the calling contract updates its internal balance state.' }
    ],
    explanation: [
      {
        heading: 'The Checks-Effects-Interactions Security Pattern',
        content: 'To prevent reentrancy attacks (such as the infamous 2016 DAO hack):<br><ol><li><strong>Checks:</strong> Validate conditions (e.g. <code>require(balance >= amount)</code>).</li><li><strong>Effects:</strong> Update your contract\'s internal storage state FIRST (e.g. <code>balance -= amount</code>).</li><li><strong>Interactions:</strong> Send external calls or Ether transfer last (<code>msg.sender.call{value: amount}("")</code>).</li></ol>'
      }
    ],
    syntax: {
      pattern: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SecureVault {
    mapping(address => uint256) public balances;
    
    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }
    
    function withdraw(uint256 amount) external {
        // 1. Checks
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        // 2. Effects (Update internal state first!)
        balances[msg.sender] -= amount;
        
        // 3. Interactions (External call last)
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
    }
}`,
      components: [
        { part: 'pragma solidity ^0.8.20;', meaning: 'Specifies compiler version and enables built-in integer overflow checks' },
        { part: 'msg.sender', meaning: 'Address of the account or contract initiating the current call' },
        { part: 'external payable', meaning: 'Function can be called externally and accept Ether transfers' }
      ]
    },
    examples: [
      {
        title: 'ERC-20 Token Balance Transfer Pattern',
        description: 'Safe balance updates and transfer event emission.',
        code: `event Transfer(address indexed from, address indexed to, uint256 value);

function transfer(address to, uint256 amount) public returns (bool) {
    require(to != address(0), "Transfer to zero address disallowed");
    require(balances[msg.sender] >= amount, "Insufficient funds");
    
    balances[msg.sender] -= amount;
    balances[to] += amount;
    emit Transfer(msg.sender, to, amount);
    return true;
}`,
        output: `Emits: Transfer(0xAlice, 0xBob, 500)`,
        explanation: ['Solidity 0.8+ includes native checked arithmetic, automatically reverting on integer overflows.']
      }
    ],
    notes: [
      { type: 'warning', title: 'Never Use `tx.origin` for Authentication', body: '`tx.origin` returns the original externally owned account that created the transaction. If an attacker tricks a user into calling a malicious contract, `tx.origin` remains the user, allowing attackers to drain funds. Always use `msg.sender`.' }
    ],
    commonMistakes: [
      {
        mistake: 'Sending Ether Before Updating Balances (Reentrancy Bug)',
        incorrectCode: `// Vulnerable to reentrancy!
(bool s, ) = msg.sender.call{value: bal}(""); // Transfers Ether FIRST
balances[msg.sender] = 0;                     // Updates state TOO LATE!`,
        correctCode: `// Safe: Checks-Effects-Interactions
balances[msg.sender] = 0;                     // Effects FIRST
(bool s, ) = msg.sender.call{value: bal}(""); // Interactions LAST`,
        why: 'In the vulnerable code, the fallback function of the recipient contract can recursively call `withdraw()` again before `balances` is zeroed out, draining the vault.'
      }
    ],
    questions: [
      { question: 'What is the Checks-Effects-Interactions pattern in Solidity?', answer: 'A security design pattern where conditions are checked first, internal state variables are updated second, and external contract calls are executed last.' }
    ],
    practice: [
      {
        id: 'bc-p1', title: 'Write an Ownership Transfer Modifier', difficulty: 'Beginner',
        prompt: 'Write a Solidity modifier `onlyOwner` that enforces that `msg.sender == owner`, reverting with an error otherwise.',
        solution: 'modifier onlyOwner() { require(msg.sender == owner, "Not contract owner"); _; }',
        explanation: 'The `_;` symbol represents the merge point where the decorated function body executes after the check passes.'
      }
    ],
    references: [
      { title: 'Mastering Ethereum (Andreas M. Antonopoulos & Gavin Wood)', type: 'Book', url: 'https://github.com/ethereumbook/ethereumbook' }
    ]
  });

  // 8. PHYSICS
  SAGE.registerTopic({
    id: 'phys-mechanics-energy',
    title: 'Classical Mechanics: Newton\'s Laws & Conservation of Energy',
    subject: 'physics',
    module: 'Mechanics',
    description: 'Newtonian motion, force vectors, work-energy theorem, conservative forces, and potential energy functions.',
    difficulty: 'Intermediate',
    readTime: '15 min read',
    overview: {
      definition: 'Classical Mechanics is the physical science analyzing the motion of macroscopic bodies under the influence of forces. It is governed by Newton\'s three laws of motion and the Work-Energy Theorem, establishing that energy within an isolated system cannot be created or destroyed, only transformed between kinetic, potential, and thermal forms.',
      mentalModel: 'Think of potential and kinetic energy as fluid in two connected glasses. When a roller coaster sits at the peak of a drop, the potential energy glass is completely full and the kinetic energy glass is empty. As it plunges, fluid pours from the potential glass into the kinetic glass. At the bottom, kinetic energy is at its maximum, exactly matching the fluid lost from potential energy.'
    },
    terminology: [
      { term: 'Newton\'s Second Law', definition: 'The net external force on a body equals the time rate of change of its linear momentum: `F_net = m * a` (for constant mass).' },
      { term: 'Work-Energy Theorem', definition: 'The net work done by all forces on an object equals the change in its kinetic energy: `W_net = ΔK = (1/2) m v_f² - (1/2) m v_i²`.' },
      { term: 'Conservative Force', definition: 'A force (like gravity or spring tension) where work done around any closed loop is zero, allowing definition of a potential energy function `F = -∇U`.' }
    ],
    explanation: [
      {
        heading: 'Conservation of Mechanical Energy',
        content: 'When only conservative forces act on a system, total mechanical energy is invariant:<br><code>E_total = K_initial + U_initial = K_final + U_final</code><br>Gravitational potential energy near Earth is <code>U = m * g * h</code>. Kinetic energy is <code>K = (1/2) * m * v²</code>.'
      }
    ],
    syntax: {
      pattern: `% Core Equations of Motion & Energy
F_net = m * a
K = (1/2) * m * v^2
U_gravity = m * g * h
v_f^2 = v_i^2 + 2 * a * d`,
      components: [
        { part: 'F = m * a', meaning: 'Force in Newtons = mass in kg * acceleration in m/s^2' },
        { part: 'W = F · d', meaning: 'Work in Joules = force dot displacement' }
      ]
    },
    examples: [
      {
        title: 'Calculating Final Velocity from Free Fall Conservation of Energy',
        description: 'Dropping an object from height h without air resistance.',
        code: `import math

def calculate_impact_velocity(height_meters: float, g: float = 9.80665) -> float:
    # Initial energy: U = m*g*h, K = 0
    # Final energy:   U = 0, K = (1/2)*m*v^2
    # m*g*h = (1/2)*m*v^2  ==>  v = sqrt(2 * g * h)
    return math.sqrt(2 * g * height_meters)

h = 45.0  # meters
v = calculate_impact_velocity(h)
print(f"Impact velocity from {h}m drop: {v:.2f} m/s ({v * 3.6:.1f} km/h)")`,
        output: `Impact velocity from 45.0m drop: 29.71 m/s (106.9 km/h)`,
        explanation: ['Because mass cancels out on both sides of `m*g*h = 1/2*m*v^2`, all objects in a vacuum accelerate at the exact same rate regardless of mass.']
      }
    ],
    notes: [
      { type: 'info', title: 'Work Done by Perpendicular Forces', body: 'If a force acts perpendicular to the direction of motion (such as centripetal force in uniform circular motion or normal force on a level plane), `cos(90°) = 0`, meaning the force does zero work and changes only direction, not kinetic energy.' }
    ],
    commonMistakes: [
      {
        mistake: 'Assuming Normal Force Always Equals m * g',
        incorrectCode: `F_normal = m * g  // Wrong on inclined ramps or accelerated elevators!`,
        correctCode: `F_normal = m * g * cos(theta)  // On an inclined plane of angle theta`,
        why: 'Normal force is a constraint force determined by Newton\'s laws perpendicular to the surface, not an invariant constant.'
      }
    ],
    questions: [
      { question: 'What is a conservative force?', answer: 'A force where the work done moving a particle between two points is independent of the path taken.' }
    ],
    practice: [
      {
        id: 'phys-p1', title: 'Kinetic Energy of a Moving Vehicle', difficulty: 'Beginner',
        prompt: 'Calculate the kinetic energy in Joules of a 1,500 kg car travelling at 20 m/s (72 km/h).',
        solution: '`K = (1/2) * m * v² = 0.5 * 1500 * (20)² = 750 * 400 = 300,000 Joules (300 kJ)`.',
        explanation: 'Kinetic energy scales quadratically with velocity: doubling speed quadruples stopping distance.'
      }
    ],
    references: [
      { title: 'University Physics with Modern Physics (OpenStax)', type: 'Book', url: 'https://openstax.org/details/books/university-physics-volume-1' }
    ]
  });

  // 9. SOFTWARE DEVELOPMENT
  SAGE.registerTopic({
    id: 'soft-typescript-generics',
    title: 'TypeScript: Generic Constraints & Advanced Types',
    subject: 'software-dev',
    module: 'Modern Tooling & TypeScript',
    description: 'Type parameters, generic constraints (extends), mapped types, conditional types, and utility types (Partial, Pick, Omit).',
    difficulty: 'Intermediate',
    readTime: '15 min read',
    overview: {
      definition: 'TypeScript is a strongly typed superset of JavaScript that compiles to plain JavaScript. Generics allow developers to author reusable, type-safe functions, classes, and interfaces that operate over a variety of types rather than a single type, enforcing strict type consistency at compile-time with zero runtime overhead.',
      mentalModel: 'Think of a generic type parameter `<T>` as a placeholder variable for types, exactly like function parameters are placeholder variables for values. Instead of passing an argument into code at runtime, you pass a type into the compiler at compile time.'
    },
    terminology: [
      { term: 'Generic Type Parameter (`<T>`)', definition: 'A placeholder identifier representing an unspecified type supplied when the function or class is instantiated.' },
      { term: 'Generic Constraint (`extends`)', definition: 'Restricts the allowable types for `<T>` to those satisfying a specific shape or interface (e.g. `<T extends { id: string }>`.' },
      { term: 'Mapped Type', definition: 'Constructs new types by iterating over properties of an existing type: `[K in keyof T]: T[K]`.' }
    ],
    explanation: [
      {
        heading: 'Generic Constraints (`extends`) and Key Lookups',
        content: `When writing a function that reads a property from an object, generic constraints prevent accessing non-existent keys:<br><pre><code>function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];
}</code></pre>This guarantees at compile time that <code>key</code> exists on <code>obj</code> and that the return type exactly matches the property's value type.`
      }
    ],
    syntax: {
      pattern: `// Generic Repository Interface
interface Entity {
    id: string | number;
}

interface Repository<T extends Entity> {
    findById(id: string | number): Promise<T | null>;
    save(item: T): Promise<T>;
}

// Built-in Mapped Types
type ReadonlyUser = Readonly<{ id: number; name: string }>;
type PartialUser = Partial<{ id: number; name: string }>;
type UserSummary = Pick<{ id: number; name: string; email: string }, "id" | "name">;`,
      components: [
        { part: '<T extends Entity>', meaning: 'Generic constraint: T must have an id field' },
        { part: 'keyof T', meaning: 'Produces a union of string literal types representing keys of T' },
        { part: 'Pick<T, K>', meaning: 'Constructs a type picking a subset of keys K from T' }
      ]
    },
    examples: [
      {
        title: 'Type-Safe Event Emitter with Generic Constraints',
        description: 'Demonstrating generic map constraints for event payloads.',
        code: `// TypeScript definitions
type EventMap = {
    "login": { userId: string; timestamp: number };
    "logout": { userId: string };
};

class TypedEventEmitter<T extends Record<string, any>> {
    emit<K extends keyof T>(event: K, payload: T[K]): void {
        console.log(\`[EVENT: \${String(event)}] Payload:\`, payload);
    }
}

const emitter = new TypedEventEmitter<EventMap>();
emitter.emit("login", { userId: "user_42", timestamp: Date.now() });
// emitter.emit("login", { badKey: true }); // Fails at compile-time!`,
        output: `[EVENT: login] Payload: { userId: 'user_42', timestamp: 1730300000000 }`,
        explanation: ['`K extends keyof T` restricts the event name to valid keys of `EventMap`, and `payload: T[K]` enforces the exact corresponding payload schema.']
      }
    ],
    notes: [
      { type: 'info', title: 'Generics Disappear at Runtime', body: 'TypeScript types, interfaces, and generic parameters are completely erased during compilation. Compiled `.js` output contains only plain JavaScript.' }
    ],
    commonMistakes: [
      {
        mistake: 'Using `any` Instead of Generics',
        incorrectCode: `function identity(arg: any): any { return arg; } // Type information is completely lost!`,
        correctCode: `function identity<T>(arg: T): T { return arg; }   // Preserves return type exactly`,
        why: '`any` disables all type safety. Generics preserve type relationships between input parameters and return values.'
      }
    ],
    questions: [
      { question: 'What does `keyof T` evaluate to in TypeScript?', answer: 'A union of the literal property names (keys) of type T.', explanation: 'If `type User = { id: number; name: string }`, then `keyof User` evaluates to `"id" | "name"`.' }
    ],
    practice: [
      {
        id: 'soft-p1', title: 'Implement DeepReadonly Type', difficulty: 'Intermediate',
        prompt: 'Write a mapped type `DeepReadonly<T>` that recursively marks all properties of an object and its nested children as `readonly`.',
        solution: '`type DeepReadonly<T> = { readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K] };`',
        explanation: 'Iterates through `keyof T`, marking each property `readonly` and conditionally recursing if `T[K]` is an object.'
      }
    ],
    references: [
      { title: 'TypeScript Official Handbook: Generics', type: 'Official Docs', url: 'https://www.typescriptlang.org/docs/handbook/2/generics.html' }
    ]
  });

})();
