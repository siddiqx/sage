# Autonomous AI Agents, Multi-Agent Graphs & MCP Architecture Guide

This guide consolidates modern agentic AI design patterns, stateful execution graphs (LangGraph), and the open standard for tool integration (Model Context Protocol).

---

## 1. Anthropic's Core Agent Design Patterns

Anthropic's research emphasizes that simple, deterministic workflows outperform complex, unconstrained autonomous loops in reliability, latency, and cost.

```
Pattern 1: Prompt Chaining
   [Input] ──> [LLM Call 1] ──> [Gate / Parse] ──> [LLM Call 2] ──> [Output]

Pattern 2: Routing
                    ┌──> [Classifier: Route A] ──> [Specialized Model A]
   [User Request] ──┤
                    └──> [Classifier: Route B] ──> [Specialized Model B]

Pattern 3: Orchestrator-Workers
                            ┌──> [Worker 1: Subtask A] ──┐
   [Orchestrator LLM] ──────┼──> [Worker 2: Subtask B] ──┼──> [Synthesizer LLM]
                            └──> [Worker 3: Subtask C] ──┘

Pattern 4: Evaluator-Optimizer
   [Generator LLM: Draft] ──> [Evaluator LLM: Critiques & Pass/Fail] ──> (Loop until pass)
```

### Key Engineering Invariant
- **Start with Workflows Before Building Agents:** Use deterministic code to coordinate pipelines whenever possible. Reserve autonomous agent decision loops strictly for open-ended tasks where the execution path cannot be predicted in advance.

---

## 2. Stateful Cyclical Graphs: LangGraph Architecture

While standard DAG orchestrators (like Airflow) forbid cycles, autonomous agents fundamentally require **loops** (e.g., executing a tool, observing the output, and deciding whether to run another tool).

LangGraph models agents as cyclical state machines:
1. **Shared State Schema:** A central TypedDict or Pydantic model passed to every node.
2. **Channel Reducers:** Define how new data updates existing state (e.g., `messages: Annotated[list, add_messages]` appends conversation steps rather than overwriting the entire history).
3. **Conditional Edges:** Dynamic routing functions that inspect the latest state (e.g., checking if the model requested a tool call) and direct execution to either the `tools` node or the `END` node.
4. **Human-in-the-Loop Checkpoints:** Persistent thread checkpoints that pause execution before destructive actions (like sending an email or executing a transaction), allowing human approval.

---

## 3. Model Context Protocol (MCP) Standard

Developed by Anthropic, the **Model Context Protocol (MCP)** is an open JSON-RPC 2.0 standard that separates AI client applications from backend data sources and tools.

```
[Host / Client: Claude Desktop / IDE]
          │  JSON-RPC 2.0 (stdio or SSE)
          ▼
[MCP Server: GitHub / PostgreSQL / Slack / Local Files]
   ├── Prompts: Standardized prompt templates
   ├── Resources: Passive data streams (file contents, logs, DB records)
   └── Tools: Callable functions with executable side effects
```

### Protocol Mechanics
- **Stdio Transport:** Ideal for local client tools (spawns server subprocess; communicates via standard input/output).
- **SSE (Server-Sent Events) Transport:** Ideal for remote cloud microservices over HTTP.
- **Security Invariant:** MCP servers declare tool schemas using JSON Schema. The AI model requests tool execution, but the client application controls authorization and execution.

---

## 4. Reading & Implementation Roadmap
1. **Design First:** Read Section 1 to select the simplest pattern that solves your automation problem.
2. **State Management:** Use LangGraph when your agent requires cycles, memory persistence, or human intervention.
3. **Integration Standard:** Implement MCP servers whenever you expose internal data or APIs to AI assistants.
