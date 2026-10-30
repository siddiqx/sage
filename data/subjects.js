/**
 * Sage — Personal Knowledge Website
 * Core Subject Taxonomy & Metadata
 */

(function () {
  'use strict';

  const SUBJECTS = [
    {
      id: 'python',
      name: 'Python',
      title: 'Python Programming & Engineering',
      icon: '🐍',
      description: 'Core syntax, data structures, functional patterns, object-oriented design, standard library, and production practices.'
    },
    {
      id: 'sql',
      name: 'SQL & Databases',
      title: 'SQL, PostgreSQL & Relational Engineering',
      icon: '🗄️',
      description: 'Relational data modeling, schema design, complex analytical queries, B-Tree and GIN indexing, execution plans, and MVCC concurrency.'
    },
    {
      id: 'data-engineering',
      name: 'Data Engineering',
      title: 'Data Engineering & Distributed Systems',
      icon: '⚡',
      description: 'ETL/ELT data pipelines, dimensional modeling, data warehousing, Apache Spark, distributed streaming with Kafka, and orchestration.'
    },
    {
      id: 'cloud',
      name: 'Cloud Computing',
      title: 'Cloud Architecture & Microsoft Azure',
      icon: '☁️',
      description: 'Cloud fundamentals, well-architected framework, Azure data services, medallion lakehouse architecture, governance, and identity security.'
    },
    {
      id: 'ai-ml',
      name: 'AI & Machine Learning',
      title: 'Artificial Intelligence & Deep Learning',
      icon: '🧠',
      description: 'Mathematical foundations of ML, gradient descent, deep neural networks, transformer architectures, LLMs, and Retrieval-Augmented Generation.'
    },
    {
      id: 'ai-automation',
      name: 'AI Automation',
      title: 'Autonomous Agents & AI Workflows',
      icon: '🤖',
      description: 'Multi-agent orchestration, ReAct tool-use loops, Model Context Protocol (MCP), structured reasoning pipelines, and workflow automation.'
    },
    {
      id: 'mathematics',
      name: 'Mathematics',
      title: 'Mathematics for Computing & Science',
      icon: '📐',
      description: 'Single and multivariable calculus, linear algebra and matrix decompositions, probability, statistics, and discrete mathematics for CS.'
    },
    {
      id: 'computer-science',
      name: 'Computer Science',
      title: 'Computer Systems & Fundamental CS',
      icon: '💻',
      description: 'Data structures & algorithms, operating system virtualization, memory management, concurrency, persistence, and TCP/IP network protocol layers.'
    },
    {
      id: 'blockchain',
      name: 'Blockchain',
      title: 'Blockchain Systems & Solidity Development',
      icon: '⛓️',
      description: 'Cryptographic primitives, consensus mechanics, Ethereum Virtual Machine (EVM) architecture, Solidity contract programming, and security auditing.'
    },
    {
      id: 'physics',
      name: 'Physics',
      title: 'Classical & Modern Physics',
      icon: '⚛️',
      description: 'Newtonian mechanics, work and energy conservation, oscillations and wave phenomena, thermodynamics, electromagnetism, and modern physics.'
    },
    {
      id: 'software-dev',
      name: 'Software Development',
      title: 'Software Engineering & Modern Tooling',
      icon: '🛠️',
      description: 'Modern JavaScript (ES6+), generic TypeScript, Git version control internals, Unix shell programming, clean architecture, and software design principles.'
    }
  ];

  SUBJECTS.forEach(sub => SAGE.registerSubject(sub));

})();
