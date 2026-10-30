# Mastering Ethereum: Syllabus & Reading Guide

> **Reference Work:** *Mastering Ethereum: Building Smart Contracts and DApps*  
> **Authors:** Andreas M. Antonopoulos and Dr. Gavin Wood  
> **Canonical Repository:** [github.com/ethereumbook/ethereumbook](https://github.com/ethereumbook/ethereumbook)  
> **License:** Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International ([CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/))  
> **Acquisition Policy Note:** The authors make the complete text freely accessible for reading via GitHub Markdown. In compliance with the Non-Commercial No-Derivatives license, this library provides a structured study syllabus and canonical chapter links rather than an unauthorized derivative PDF compilation.

---

## 1. Curriculum Overview

*Mastering Ethereum* is the definitive technical guide to the Ethereum protocol, the Ethereum Virtual Machine (EVM), and smart contract development. Written by Andreas M. Antonopoulos and Ethereum co-founder Gavin Wood, it serves as the foundational text for engineers transitioning from traditional software systems to decentralized computation.

```
+-----------------------------------------------------------------------+
|                         APPLICATION LAYER                            |
|          Web3 Frontends (Viem / Ethers) | DApps | Oracles            |
+-----------------------------------------------------------------------+
|                         CONTRACT LAYER                                |
|        Solidity / Vyper Contracts | ERC-20 / ERC-721 Standards        |
+-----------------------------------------------------------------------+
|                        VIRTUAL MACHINE LAYER                          |
|             EVM: Stack (1024) | Memory | Persistent Storage           |
+-----------------------------------------------------------------------+
|                          CONSENSUS LAYER                              |
|           Proof of Stake (Beacon Chain) | Gas Metering | State Trie   |
+-----------------------------------------------------------------------+
```

---

## 2. Chapter-by-Chapter Syllabus

### Chapter 1 — What Is Ethereum?
- **Source:** [01what-is.asciidoc](https://github.com/ethereumbook/ethereumbook/blob/develop/01what-is.asciidoc)
- **Key Concepts:**
  - Comparison with Bitcoin: Turing completeness vs. UTXO scripting.
  - The World Computer abstraction: deterministic state transitions.
  - Components of the Ethereum system: P2P network, consensus rules, transactions, EVM.

### Chapter 2 — Ethereum Basics
- **Source:** [02intro.asciidoc](https://github.com/ethereumbook/ethereumbook/blob/develop/02intro.asciidoc)
- **Key Concepts:**
  - Ether denominations: Wei, Gwei, Ether ($10^{18}$ Wei).
  - Externally Owned Accounts (EOAs) vs. Contract Accounts.
  - Lifecycle of a simple smart contract: write, compile, deploy, call.

### Chapter 3 — Ethereum Clients
- **Source:** [03clients.asciidoc](https://github.com/ethereumbook/ethereumbook/blob/develop/03clients.asciidoc)
- **Key Concepts:**
  - Execution clients: Geth (Go-Ethereum), Nethermind, Besu, Erigon.
  - Consensus clients: Prysm, Lighthouse, Teku, Lodestar.
  - JSON-RPC interface and engine API communication.
  - Sync modes: Full sync, Snap sync, State sync.

### Chapter 4 — Cryptography
- **Source:** [04keys-addresses.asciidoc](https://github.com/ethereumbook/ethereumbook/blob/develop/04keys-addresses.asciidoc)
- **Key Concepts:**
  - Public-key cryptography: Elliptic Curve Cryptography on `secp256k1`.
  - Private keys ($k \in [1, n-1]$) and public keys ($K = k \times G$).
  - Keccak-256 cryptographic hash function (distinguished from NIST SHA-3).
  - Ethereum address derivation: rightmost 20 bytes of $\text{Keccak-256}(K_{uncompressed})$.
  - EIP-55 checksummed hexadecimal addresses.

### Chapter 5 — Wallets
- **Source:** [05wallets.asciidoc](https://github.com/ethereumbook/ethereumbook/blob/develop/05wallets.asciidoc)
- **Key Concepts:**
  - Non-deterministic (Type 1) vs. Deterministic (Seeded) wallets.
  - BIP-39 mnemonic seed phrases (12–24 word dictionary encoding).
  - BIP-32 and BIP-44 hierarchical deterministic (HD) wallet derivation paths (`m/44'/60'/0'/0/i`).

### Chapter 6 — Transactions
- **Source:** [06transactions.asciidoc](https://github.com/ethereumbook/ethereumbook/blob/develop/06transactions.asciidoc)
- **Key Concepts:**
  - Transaction fields: Nonce, Gas Price, Gas Limit, To, Value, Data, v/r/s signatures.
  - EIP-1559 transaction model: Base Fee (burned), Max Priority Fee (miner/validator tip), Max Fee.
  - Nonce management: preventing replay attacks, transaction ordering, and replacement/cancellation.

### Chapter 7 — Smart Contracts and Solidity
- **Source:** [07smart-contracts-solidity.asciidoc](https://github.com/ethereumbook/ethereumbook/blob/develop/07smart-contracts-solidity.asciidoc)
- **Key Concepts:**
  - Solidity contract layout: SPDX license identifier, `pragma`, state variables, functions.
  - Visibility specifiers: `public`, `external`, `internal`, `private`.
  - Mutability: `view`, `pure`, `payable`, non-payable.
  - Function modifiers and custom error definitions (`revert CustomError()`).
  - ABI (Application Binary Interface) specification and function selector calculation ($\text{Keccak-256}(\text{"transfer(address,uint256)"})[0..3]$).

### Chapter 8 — Smart Contract Security
- **Source:** [08smart-contracts-security.asciidoc](https://github.com/ethereumbook/ethereumbook/blob/develop/08smart-contracts-security.asciidoc)
- **Key Concepts:**
  - Classic attack vectors: Reentrancy, arithmetic overflows/underflows, delegatecall injection.
  - Denial of Service (DoS) via gas exhaustion or unexpected revert.
  - Defensive design: Checks-Effects-Interactions (CEI) pattern, pull vs. push payments, circuit breakers (pausability).

### Chapter 9 — Tokens
- **Source:** [09tokens.asciidoc](https://github.com/ethereumbook/ethereumbook/blob/develop/09tokens.asciidoc)
- **Key Concepts:**
  - ERC-20: Fungible token standard (`totalSupply`, `balanceOf`, `transfer`, `approve`, `transferFrom`).
  - ERC-721: Non-fungible token (NFT) standard (`ownerOf`, `safeTransferFrom`, token URIs).
  - ERC-1155: Multi-token standard (batch transfers, gas efficiency).

### Chapter 10 — Oracles
- **Source:** [10oracles.asciidoc](https://github.com/ethereumbook/ethereumbook/blob/develop/10oracles.asciidoc)
- **Key Concepts:**
  - The Oracle Problem: why blockchains cannot access off-chain data deterministically.
  - Oracle architectures: centralized, multi-sig consensus, decentralized networks (Chainlink).
  - Spot price manipulation vs. TWAP (Time-Weighted Average Price) oracles.

### Chapter 11 — Decentralized Applications (DApps)
- **Source:** [11dapps.asciidoc](https://github.com/ethereumbook/ethereumbook/blob/develop/11dapps.asciidoc)
- **Key Concepts:**
  - DApp stack: frontend UI, Web3 provider (MetaMask, Rabby), decentralized storage (IPFS, Arweave).
  - Contract events and indexing (The Graph, subgraphs).

### Chapter 12 — Decentralized Autonomous Organizations (DAOs)
- **Source:** [12daos.asciidoc](https://github.com/ethereumbook/ethereumbook/blob/develop/12daos.asciidoc)
- **Key Concepts:**
  - Governance mechanisms: token-weighted voting, quadratic voting, optimistic governance.
  - Time-locks, multi-signature execution (Safe), and the lesson of The DAO hack (2016).

### Chapter 13 — The Ethereum Virtual Machine (EVM)
- **Source:** [13evm.asciidoc](https://github.com/ethereumbook/ethereumbook/blob/develop/13evm.asciidoc)
- **Key Concepts:**
  - EVM architecture: quasi-Turing complete, word size (256-bit / 32 bytes).
  - Data locations:
    - Stack: 1,024 elements max, 256 bits each. Only top 16 elements accessible (`dup1`–`dup16`, `swap1`–`swap16`).
    - Memory: volatile byte array, quadratic gas expansion cost.
    - Storage: persistent key-value store ($2^{256}$ 32-byte slots), highest gas cost (`sstore` / `sload`).
    - Calldata: non-modifiable, read-only transaction payload.
  - Gas schedule: opcode metering, out-of-gas reverts, state refund changes.

### Chapter 14 — Consensus
- **Source:** [14consensus.asciidoc](https://github.com/ethereumbook/ethereumbook/blob/develop/14consensus.asciidoc)
- **Key Concepts:**
  - Transition from Ethash Proof-of-Work to Proof-of-Stake (The Merge, September 2022).
  - Beacon Chain consensus: Validators (32 ETH stake), epochs (32 slots of 12 seconds), attestation.
  - Finality: Casper FFG (Friendly Finality Gadget) and LMD-GHOST fork-choice rule.
  - Slashing conditions: double signing, surround voting.

---

## 3. Recommended Study Roadmap

1. **Foundations (Weeks 1–2):** Chapters 1, 2, 4, 6. Focus on cryptography, address generation, transactions, and gas accounting.
2. **Contract Engineering (Weeks 3–4):** Chapters 7, 9. Implement ERC-20 and ERC-721 token patterns using the OpenZeppelin contracts in `D:\Learning\Blockchain\Solidity\Programs\OpenZeppelin-Contracts\`.
3. **Security & Auditing (Weeks 5–6):** Chapters 8, 10. Study vulnerability post-mortems and read `D:\Learning\Blockchain\Solidity\Notes\Smart-Contract-Security-Practices.md`.
4. **EVM Internals (Weeks 7–8):** Chapters 13, 14. Understand storage layout (slot packing), opcode execution costs, and modern PoS consensus mechanics.
