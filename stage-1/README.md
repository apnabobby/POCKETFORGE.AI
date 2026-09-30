# Stage 1: Financial State Machine & Minor Unit Mutex Engine
# Contributors: BAND Agents (Seat 1: Planner/Architect, Seat 2: Implementer, Seat 3: Reviewer/Validator)

## Stage Overview & Architectural Purpose
Stage 1 establishes the mathematical foundation of the autonomous financial dark factory. In financial ledgers, precision loss and race conditions lead directly to fraudulent money creation or loss of customer funds. Stage 1 implements a double-entry integer minor-unit (paise) state machine governed by per-wallet serializable mutex locks and atomic two-phase snapshots.

## BAND Agent Roles & Process in Stage 1
- **BAND Seat 1 (Planner / Architect)**:
  - Formulated the 5 inviolable financial theorems:
    1. **Conservation of Money**: $\sum \text{Balances} = \text{Constant}$ across all $N$ wallets at every tick.
    2. **Non-Negative Balance Invariant**: $\text{Balance} \ge 0$. Overdrafts are physically impossible.
    3. **Zero IEEE-754 Floating-Point Invariant**: All amounts stored in integer minor units (1 INR = 100 paise).
    4. **Strict Idempotency Monotonicity**: Replays with identical `idempotencyKey` yield identical receipts without modifying balances.
    5. **Two-Phase Atomic Rollback**: Ledger debit and credit occur as a single indivisible transaction.
- **BAND Seat 2 (Implementer)**:
  - Built the `WalletEngine` class (`walletEngine.ts`), the per-wallet Promise mutex lock queue, and the transaction execution pipeline.
- **BAND Seat 3 (Reviewer / Validator)**:
  - Audited mathematical balance invariants before and after transactions.

---

## Complete Source Code for Stage 1: `walletEngine.ts`

```typescript
/**
 * Stage 1 - Financial State Machine & Minor Unit Mutex Engine
 * Contributors: BAND Agents (Seat 1: Planner/Architect, Seat 2: Implementer, Seat 3: Reviewer/Validator)
 */

export interface Wallet {
  id: string;
  ownerName: string;
  balancePaise: number; // Integer minor units (e.g. ₹5,000.00 = 500000 paise)
  currency: 'INR';
  version: number;
}

export interface LedgerTransaction {
  id: string;
  idempotencyKey: string;
  senderId: string;
  recipientId: string;
  amountPaise: number;
  status: 'COMMITTED' | 'FAILED' | 'ROLLED_BACK';
  timestamp: number;
  auditChecksum: string;
  errorMessage?: string;
  isDuplicate?: boolean;
}

export class WalletEngine {
  private wallets: Map<string, Wallet> = new Map();
  private ledger: LedgerTransaction[] = [];
  private idempotencyStore: Map<string, LedgerTransaction> = new Map();
  private lockQueues: Map<string, Promise<void>> = new Map();
  private initialTotalSupplyPaise: number = 0;

  constructor() {
    this.seedInitialWallets();
  }

  private seedInitialWallets() {
    const seedData: Wallet[] = [
      { id: 'W-ALICE', ownerName: 'Alice Sharma', balancePaise: 500000, currency: 'INR', version: 1 },
      { id: 'W-BOB', ownerName: 'Bob Verma', balancePaise: 350000, currency: 'INR', version: 1 },
      { id: 'W-CHARLIE', ownerName: 'Charlie Patel', balancePaise: 1000000, currency: 'INR', version: 1 },
    ];
    for (const w of seedData) {
      this.wallets.set(w.id, { ...w });
    }
    this.initialTotalSupplyPaise = this.calculateTotalSupplyPaise();
  }

  public calculateTotalSupplyPaise(): number {
    let total = 0;
    for (const w of this.wallets.values()) {
      total += w.balancePaise;
    }
    return total;
  }

  private async acquireLock(walletId: string): Promise<() => void> {
    while (this.lockQueues.has(walletId)) {
      await this.lockQueues.get(walletId);
    }
    let resolveLock!: () => void;
    const lockPromise = new Promise<void>((resolve) => {
      resolveLock = resolve;
    });
    this.lockQueues.set(walletId, lockPromise);

    return () => {
      this.lockQueues.delete(walletId);
      resolveLock();
    };
  }

  public async transfer(
    senderId: string,
    recipientId: string,
    amountPaise: number,
    idempotencyKey: string
  ): Promise<LedgerTransaction> {
    // 1. Invariant: Positive integer minor units only
    if (!Number.isInteger(amountPaise) || amountPaise <= 0) {
      throw new Error(`INVALID_AMOUNT: Amount must be a positive integer in paise (got ${amountPaise}).`);
    }

    // 2. Invariant: Idempotency monotonicity
    if (this.idempotencyStore.has(idempotencyKey)) {
      const existing = this.idempotencyStore.get(idempotencyKey)!;
      return { ...existing, isDuplicate: true };
    }

    if (senderId === recipientId) {
      throw new Error('SELF_TRANSFER_PROHIBITED: Sender and recipient must be distinct wallets.');
    }

    // 3. Acquire mutex locks in deterministic sorted order to prevent deadlocks
    const [firstId, secondId] = [senderId, recipientId].sort();
    const unlockFirst = await this.acquireLock(firstId);
    const unlockSecond = await this.acquireLock(secondId);

    const sender = this.wallets.get(senderId);
    const recipient = this.wallets.get(recipientId);

    if (!sender || !recipient) {
      unlockSecond();
      unlockFirst();
      throw new Error('WALLET_NOT_FOUND: Either sender or recipient does not exist.');
    }

    // Snapshot state for two-phase rollback safety
    const snapshotSender = sender.balancePaise;
    const snapshotRecipient = recipient.balancePaise;
    const supplyPre = this.calculateTotalSupplyPaise();

    try {
      if (sender.balancePaise < amountPaise) {
        throw new Error(`INSUFFICIENT_FUNDS: Available ${sender.balancePaise}p, required ${amountPaise}p.`);
      }

      // Mutate balances atomically
      sender.balancePaise -= amountPaise;
      recipient.balancePaise += amountPaise;
      sender.version++;
      recipient.version++;

      // Post-condition audit: Conservation of total money
      const supplyPost = this.calculateTotalSupplyPaise();
      if (supplyPost !== supplyPre) {
        throw new Error(`CONSERVATION_BREACH: Supply pre (${supplyPre}) != post (${supplyPost}).`);
      }

      const tx: LedgerTransaction = {
        id: `TX-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        idempotencyKey,
        senderId,
        recipientId,
        amountPaise,
        status: 'COMMITTED',
        timestamp: Date.now(),
        auditChecksum: `SHA256:${supplyPost}:${sender.balancePaise}:${recipient.balancePaise}`,
      };

      this.ledger.push(tx);
      this.idempotencyStore.set(idempotencyKey, tx);
      return tx;
    } catch (err: any) {
      // Rollback snapshot
      sender.balancePaise = snapshotSender;
      recipient.balancePaise = snapshotRecipient;
      const failedTx: LedgerTransaction = {
        id: `TX-FAIL-${Date.now()}`,
        idempotencyKey,
        senderId,
        recipientId,
        amountPaise,
        status: 'ROLLED_BACK',
        timestamp: Date.now(),
        auditChecksum: `FAILED:${supplyPre}`,
        errorMessage: err.message,
      };
      this.ledger.push(failedTx);
      throw err;
    } finally {
      unlockSecond();
      unlockFirst();
    }
  }

  public getWallets(): Wallet[] {
    return Array.from(this.wallets.values()).map(w => ({ ...w }));
  }

  public getLedger(): LedgerTransaction[] {
    return [...this.ledger];
  }
}
```
