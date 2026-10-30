# Deep Learning, Transformers & LLM Reading Guide

This guide unifies the four foundational machine learning and AI texts in this folder into a single, cohesive reading curriculum.

---

## 1. The Four Foundational Texts

1. [`Mathematics-for-Machine-Learning.pdf`](Mathematics-for-Machine-Learning.pdf) — Deisenroth et al. (Cambridge University Press).
2. [`Understanding-Deep-Learning.pdf`](Understanding-Deep-Learning.pdf) — Simon J.D. Prince (MIT Press).
3. [`Attention-Is-All-You-Need.pdf`](Attention-Is-All-You-Need.pdf) — Vaswani et al. (NeurIPS 2017).
4. [`Retrieval-Augmented-Generation.pdf`](Retrieval-Augmented-Generation.pdf) — Patrick Lewis et al. (NeurIPS 2020).

---

## 2. Conceptual Progression Map

```
Foundational Math (Deisenroth)
   ├── Linear Algebra: Orthogonal Projections (Ch 3) & SVD (Ch 4)
   └── Multivariate Calculus: Jacobians & Gradients (Ch 5)
         │
         ▼
Neural Network Dynamics (Prince)
   ├── Shallow Networks: Piecewise linear function approximation (Ch 3)
   ├── Deep Networks & Residuals: Skip connections prevent vanishing gradients (Ch 4 & 11)
   └── Optimization: Loss landscapes and Adam optimizer (Ch 6)
         │
         ▼
The Transformer Architecture (Vaswani)
   ├── Scaled Dot-Product Attention: Softmax(QK^T / √d_k) * V (Section 3.2.1)
   ├── Multi-Head Attention: Attending to distinct subspaces simultaneously (Section 3.2.2)
   └── Positional Encodings: Injecting sequence order into permutation-invariant models (Section 3.5)
         │
         ▼
External Grounding & RAG (Lewis)
   ├── Parametric Memory (Model Weights) vs Non-Parametric Memory (Vector Index)
   ├── Dense Passage Retrieval (DPR) & Maximum Inner Product Search (MIPS)
   └── Eliminating Hallucinations through Retrieved Ground Truth
```

---

## 3. High-Yield Reading Points by Document

### A. *Mathematics for Machine Learning* (Deisenroth et al.)
- **Focus:** Chapter 3 (*Analytic Geometry*) and Chapter 4 (*Matrix Decompositions*).
- **Core Insight:** Linear regression is not an ad-hoc formula; it is the orthogonal projection of an outcome vector onto the column space of the feature matrix. Singular Value Decomposition ($A = U \Sigma V^T$) reveals the fundamental geometry of data compression and PCA.

### B. *Understanding Deep Learning* (Simon J.D. Prince)
- **Focus:** Chapters 3, 4, 6, 7, 11, and 12.
- **Core Insight:** Neural networks with ReLU activations are continuous piecewise linear function approximators. Depth is exponentially more efficient than width because $K$ layers create $O(2^K)$ linear partition regions. Residual connections ($y = F(x) + x$) provide an unhindered highway for backpropagation.

### C. *Attention Is All You Need* (Vaswani et al.)
- **Focus:** Section 3 (*Model Architecture*).
- **Core Insight:** By eliminating recurrent loops, sequence tokens can be processed simultaneously via matrix multiplication on GPUs. Dividing dot products by $\sqrt{d_k}$ prevents the softmax function from saturating into regions with vanishing gradients.

### D. *Retrieval-Augmented Generation for NLP* (Lewis et al.)
- **Focus:** Section 2 (*Methods*).
- **Core Insight:** Decoupling linguistic generation (the parametric model) from factual knowledge storage (the external vector index) allows updating an AI system's facts in real time without expensive model retraining.

---

## 4. Recommended Study Sequence
- **Weeks 1–2:** Review vector projections and matrix calculus in *Mathematics for Machine Learning*.
- **Weeks 3–4:** Study Chapters 3, 4, 6, and 11 in *Understanding Deep Learning*.
- **Weeks 5–6:** Read *Attention Is All You Need* alongside Chapter 12 of *Understanding Deep Learning*.
- **Weeks 7–8:** Read *Retrieval-Augmented Generation* and advance to [`AI-Agents-and-Workflows-Guide.md`](AI-Agents-and-Workflows-Guide.md).
