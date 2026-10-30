# Smart Contract Security Practices & Attack Vector Catalog

> **Reference Standard:** ConsenSys Smart Contract Best Practices & OpenZeppelin Security Guidelines  
> **Target Environment:** Ethereum Virtual Machine (EVM) | Solidity 0.8.x+  
> **Security Baseline:** In smart contract systems, code is immutable, transactions are irreversible, and the execution environment is completely adversarial. Defenses must be mathematical and structural.

---

## 1. Threat Model & Execution Invariants

1. **Permissionless Execution:** Anyone can call any public or external function with arbitrary calldata and gas allocations.
2. **Transparent State & Mempool:** All contract storage, internal variables, and pending unconfirmed transactions in the public mempool are visible to observers and MEV (Maximal Extractable Value) searchers.
3. **Control Handover on External Calls:** Any call that transfers Ether (`call{value: ...}("")`) or invokes an external contract transfers control to the recipient, allowing malicious contract code to execute before the initial transaction concludes.
4. **Atomicity:** An entire transaction succeeds or fails atomically. However, within a transaction, intermediate states can be observed and exploited by sub-calls.

---

## 2. Vulnerability Catalog & Defensive Patterns

### 2.1 Reentrancy

#### Mechanism
Reentrancy occurs when an external call to an untrusted contract allows the recipient to recursively call back into the calling contract (or a related contract sharing state) before the calling contract has updated its internal state.

```
VULNERABLE FLOW:
User -> withdraw() -> [Checks balance] -> [Sends ETH via call] -> Attacker fallback() -> withdraw() ...
```

#### Variants
- **Single-Function Reentrancy:** Recursive call into the same function that initiated the transfer.
- **Cross-Function Reentrancy:** Recursive call into a different function that relies on the same shared state (e.g., calling `transfer()` while inside `withdraw()`).
- **Read-Only / Cross-Contract Reentrancy:** The external call occurs during a state modification in Contract A. The callback queries Contract A's temporarily distorted view from Contract B (e.g., an AMM LP share calculation before reserves are updated).

#### Defensive Patterns
1. **Checks-Effects-Interactions (CEI) Pattern:**
   Always perform state modifications (Effects) *before* external interactions.

   ```solidity
   // CORRECT IMPLEMENTATION:
   function withdraw(uint256 amount) external {
       // 1. Checks
       if (balances[msg.sender] < amount) revert InsufficientBalance();

       // 2. Effects (Update state BEFORE external interaction)
       balances[msg.sender] -= amount;

       // 3. Interactions
       (bool success, ) = msg.sender.call{value: amount}("");
       if (!success) revert TransferFailed();
   }
   ```

2. **Reentrancy Mutex:**
   Use OpenZeppelin's `ReentrancyGuard` to enforce a reentrancy lock:
   ```solidity
   import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

   contract SecureVault is ReentrancyGuard {
       function withdraw() external nonReentrant {
           // Safe against recursive reentrancy
       }
   }
   ```
   *Note on modern EVM:* EIP-1153 introduces transient storage (`TSTORE` / `TLOAD`), which reduces the gas cost of reentrancy locks compared to persistent `SSTORE` locks.

---

### 2.2 Arithmetic Safety & Precision

#### Built-in Checked Arithmetic (Solidity >= 0.8.0)
Solidity 0.8.0 introduced automatic overflow and underflow checks that revert with a `Panic(0x11)` code.
- Explicit `SafeMath` libraries are obsolete in >= 0.8.0.
- Use `unchecked { ... }` blocks strictly when an operation is mathematically provable never to overflow (e.g., array index increment `for (uint256 i = 0; i < len; unchecked { ++i })`).

#### Integer Division Precision Loss
Solidity does not support floating-point numbers. Integer division truncates towards zero:
$$\frac{a \times b}{c} \quad \text{vs.} \quad \frac{a}{c} \times b$$
- **Rule:** Always multiply before dividing to preserve maximum precision:
  ```solidity
  // WRONG: Truncates to 0 if amount < 10000
  uint256 fee = (amount / 10000) * feeBps;

  // CORRECT: Multiplies first, then truncates once
  uint256 fee = (amount * feeBps) / 10000;
  ```

---

### 2.3 Access Control & Authorization

#### `tx.origin` Phishing Vulnerability
- Never use `tx.origin` for authorization. `tx.origin` returns the address that signed the original transaction, not the immediate caller (`msg.sender`).
- An attacker can trick a privileged user into calling a malicious contract, which then forwards the call to the vulnerable contract where `tx.origin == owner` evaluates to true.
- **Rule:** Use `msg.sender` for authorization checks.

#### Two-Step Ownership Transfers
- Transferring contract ownership directly to an incorrect address permanently locks protocol governance.
- **Rule:** Use OpenZeppelin's `Ownable2Step` pattern where the pending owner must explicitly call `acceptOwnership()` to finalize the transfer.

#### Unprotected Initializers in Upgradeable Proxies
- In proxy patterns (ERC-1967, UUPS), constructor logic does not run in the proxy storage context.
- Unprotected `initialize()` functions allow malicious actors to front-run deployment and claim ownership of proxy or logic contracts.
- **Rule:** Lock logic contracts using `_disableInitializers()` in the constructor.

---

### 2.4 Oracle Manipulation & Flash Loan Exploits

#### Mechanism
Flash loans permit borrowing millions in uncollateralized capital within a single transaction, provided the funds are returned before the transaction completes. Attackers use this temporary capital to radically distort automated market maker (AMM) spot prices.

#### Flawed Pattern
```solidity
// VULNERABLE: Direct spot price check via AMM reserves
uint256 price = pair.getReserves(); // Trivially manipulated via flash swap
```

#### Defenses
1. **Decentralized Off-Chain Oracles:** Use Chainlink price feeds with staleness checks:
   ```solidity
   (, int256 price, , uint256 updatedAt, ) = priceFeed.latestRoundData();
   if (price <= 0) revert InvalidPrice();
   if (block.timestamp - updatedAt > HEARTBEAT_THRESHOLD) revert StalePrice();
   ```
2. **Time-Weighted Average Price (TWAP):** Use multi-block or multi-period TWAP (e.g., Uniswap v3 TWAP) to make single-block price manipulation economically unviable.

---

### 2.5 Denial of Service (DoS)

#### Unbounded Loops & Block Gas Limits
- Iterating over dynamic, user-expandable arrays can exceed the Ethereum block gas limit (30,000,000 gas), freezing the contract.
- **Rule:** Bound array lengths or replace iterations with off-chain indexing and pagination.

#### Push vs. Pull Payments
- Pushing Ether or ERC-20 tokens to user addresses in a loop fails completely if even one recipient is a contract that rejects payments (`revert()`).
- **Rule:** Implement the **Pull over Push** pattern: record withdrawable balances in a mapping and require users to pull their own funds individually.

---

### 2.6 Front-Running and MEV Mitigation

- Transactions in the public mempool can be front-run, back-run, or sandwich-attacked.
- **Defenses:**
  - Slippage protection: Enforce explicit minimum output amounts (`minAmountOut`) on swaps.
  - Transaction deadlines: Require transactions to execute before a specified block timestamp (`deadline`).
  - Commit-Reveal Schemes: Submit a hash of the action first, followed by revealing the preimage in a subsequent block.
  - Private Transaction Routing: Submit critical transactions through builder endpoints (e.g., MEV-Share, Flashbots Protect) rather than public gossip nodes.

---

## 3. Smart Contract Verification Checklist

| Phase | Tool / Practice | Objective |
|---|---|---|
| **Static Analysis** | Slither (`slither .`) | Identify AST patterns, reentrancies, dead code, and uninitialized variables |
| **Linting** | Solhint | Enforce Solidity style guidelines and security rules |
| **Unit Testing** | Foundry / Hardhat | Validate function inputs, outputs, and edge cases |
| **Fuzz Testing** | Foundry (`testFuzz`) | Feed millions of randomized inputs to identify unexpected invariant violations |
| **Invariant Testing** | Foundry (`invariant_`) | Test multi-call sequences ensuring system conservation laws always hold |
| **Formal Verification** | Certora / SMTChecker | Mathematically prove contract specifications against all possible execution paths |
| **Pre-deployment** | Multi-sig Deployment | Enforce governance via Safe multisig with timelocks on privileged actions |
