/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TestCaseResult, TestCategory } from '../types/factory';
import { WalletEngine } from './walletEngine';

export interface TestSuiteProgressCallback {
  (currentTest: number, totalTests: number, testResult: TestCaseResult): void;
}

export class AdversarialTestRunner {
  private engine: WalletEngine;

  constructor(engine: WalletEngine) {
    this.engine = engine;
  }

  /**
   * Runs the full battery of 50 adversarial attack tests
   */
  public async runFullSuite(
    onProgress?: TestSuiteProgressCallback
  ): Promise<{ results: TestCaseResult[]; totalPassed: number; totalFailed: number }> {
    const results: TestCaseResult[] = [];
    const totalCount = 50;
    let index = 0;

    // Helper to log and append
    const recordResult = (res: TestCaseResult) => {
      index++;
      results.push(res);
      if (onProgress) {
        onProgress(index, totalCount, res);
      }
    };

    // ---------------------------------------------------------
    // 1. DOUBLE SPENDING ATTACKS (5 tests)
    // ---------------------------------------------------------
    for (let i = 1; i <= 5; i++) {
      const initialSystemMoney = this.engine.getTotalSystemMoney();
      const startTime = performance.now();

      // Alice (1000000 paise = ₹10,000) or test with an explicit ₹1000 wallet
      // Let's create an adversarial scenario where Alice tries to spend 80% twice concurrently
      const alice = this.engine.getUser('usr_alice')!;
      const targetAmount = Math.floor(alice.balancePaise * 0.8); // 80% of balance

      const key1 = `idemp_double_1_${Date.now()}_${i}`;
      const key2 = `idemp_double_2_${Date.now()}_${i}`;

      // Launch both requests concurrently without waiting
      const promise1 = this.engine.executeTransfer({
        idempotencyKey: key1,
        senderId: 'usr_alice',
        recipientId: 'usr_bob',
        amountPaise: targetAmount,
      });

      const promise2 = this.engine.executeTransfer({
        idempotencyKey: key2,
        senderId: 'usr_alice',
        recipientId: 'usr_charlie',
        amountPaise: targetAmount,
      });

      const [res1, res2] = await Promise.all([promise1, promise2]);
      const finalAlice = this.engine.getUser('usr_alice')!;
      const finalSystemMoney = this.engine.getTotalSystemMoney();
      const durationMs = Math.round(performance.now() - startTime);

      // Both shouldn't succeed if targetAmount * 2 > initial Alice balance
      const bothSucceeded = res1.success && res2.success;
      const negativeBalance = finalAlice.balancePaise < 0;
      const passed = !bothSucceeded && !negativeBalance;

      recordResult({
        id: `TEST-DS-0${i}`,
        category: 'DOUBLE_SPENDING',
        name: `Double-Spend Race: 2x Parallel ₹${(targetAmount / 100).toFixed(2)} [Run ${i}]`,
        description: `Alice transfers ₹${(targetAmount / 100).toFixed(2)} to Bob and Charlie simultaneously. Only one must succeed.`,
        status: passed ? 'PASS' : 'FAIL',
        initialSystemMoney,
        finalSystemMoney,
        durationMs,
        timestamp: new Date().toISOString(),
        attackVector: 'Parallel asynchronous race condition on debit check',
        invariantVerified: finalSystemMoney === initialSystemMoney && finalAlice.balancePaise >= 0,
        details: passed
          ? `SUCCESS: Exactly one transfer accepted. Alice balance: ₹${(finalAlice.balancePaise / 100).toFixed(2)}.`
          : `CRITICAL FAILURE: Double-spend permitted! Both transactions committed. Alice balance fell to ₹${(finalAlice.balancePaise / 100).toFixed(2)}!`,
      });
      await new Promise(r => setTimeout(r, 10));
    }

    // ---------------------------------------------------------
    // 2. DUPLICATE RETRY STORMS (5 tests)
    // ---------------------------------------------------------
    for (let i = 1; i <= 5; i++) {
      const initialSystemMoney = this.engine.getTotalSystemMoney();
      const startTime = performance.now();
      const sharedKey = `idemp_retry_storm_${i}_${Date.now()}`;
      const amount = 50000; // ₹500.00

      // Send initial request
      const firstResult = await this.engine.executeTransfer({
        idempotencyKey: sharedKey,
        senderId: 'usr_bob',
        recipientId: 'usr_charlie',
        amountPaise: amount,
      });

      // Simulate network timeout retry: send same key 5 more times
      let duplicateApplies = 0;
      for (let retry = 0; retry < 5; retry++) {
        const retryRes = await this.engine.executeTransfer({
          idempotencyKey: sharedKey,
          senderId: 'usr_bob',
          recipientId: 'usr_charlie',
          amountPaise: amount,
        });
        if (retryRes.success && !retryRes.isDuplicate) {
          duplicateApplies++;
        }
      }

      const finalSystemMoney = this.engine.getTotalSystemMoney();
      const durationMs = Math.round(performance.now() - startTime);
      const passed = duplicateApplies === 0 && firstResult.success;

      recordResult({
        id: `TEST-DR-0${i}`,
        category: 'DUPLICATE_RETRY',
        name: `Idempotency Network Timeout & Replay Storm [Run ${i}]`,
        description: `Sent 5 repeated retries with key '${sharedKey.substring(0, 16)}...'. Must apply exactly once.`,
        status: passed ? 'PASS' : 'FAIL',
        initialSystemMoney,
        finalSystemMoney,
        durationMs,
        timestamp: new Date().toISOString(),
        attackVector: 'Simulated TCP dropped ACK packet replay attack',
        invariantVerified: finalSystemMoney === initialSystemMoney,
        details: passed
          ? 'SUCCESS: Idempotency cached. 5 retries returned deduplicated receipt without balance re-mutation.'
          : 'CRITICAL FAILURE: Duplicate payment executed! Balance mutated multiple times.',
      });
      await new Promise(r => setTimeout(r, 10));
    }

    // ---------------------------------------------------------
    // 3. CONCURRENT TRANSFERS HIGH VOLUME (10 tests)
    // ---------------------------------------------------------
    for (let i = 1; i <= 10; i++) {
      const initialSystemMoney = this.engine.getTotalSystemMoney();
      const startTime = performance.now();

      // Launch 10 simultaneous transfers back and forth
      const promises: Promise<any>[] = [];
      for (let k = 0; k < 6; k++) {
        promises.push(
          this.engine.executeTransfer({
            idempotencyKey: `idemp_swarm_${i}_${k}_${Date.now()}`,
            senderId: k % 2 === 0 ? 'usr_alice' : 'usr_bob',
            recipientId: k % 2 === 0 ? 'usr_david' : 'usr_charlie',
            amountPaise: 2500 + k * 100, // ₹25 - ₹30
          })
        );
      }

      await Promise.all(promises);
      const finalSystemMoney = this.engine.getTotalSystemMoney();
      const durationMs = Math.round(performance.now() - startTime);

      const passed = finalSystemMoney === initialSystemMoney;

      recordResult({
        id: `TEST-CT-${i < 10 ? '0' + i : i}`,
        category: 'CONCURRENT_TRANSFERS',
        name: `High-Concurrency Interleaved Swarm [Batch ${i}]`,
        description: `Executed 6 parallel multi-user transactions across Alice, Bob, Charlie, David.`,
        status: passed ? 'PASS' : 'FAIL',
        initialSystemMoney,
        finalSystemMoney,
        durationMs,
        timestamp: new Date().toISOString(),
        attackVector: 'Multi-threaded interleaved debit/credit lock contention',
        invariantVerified: finalSystemMoney === initialSystemMoney,
        details: passed
          ? `SUCCESS: Concurrency isolation preserved. Zero leaks. System money conserved at ₹${(finalSystemMoney / 100).toFixed(2)}.`
          : `FAILURE: System money changed from ₹${(initialSystemMoney / 100).toFixed(2)} to ₹${(finalSystemMoney / 100).toFixed(2)}!`,
      });
      await new Promise(r => setTimeout(r, 10));
    }

    // ---------------------------------------------------------
    // 4. ROUNDING & MINOR UNIT PRECISION (10 tests)
    // ---------------------------------------------------------
    const fractionalPointers = [1, 99, 1001, 1099, 50, 49, 13, 87, 999, 7];
    for (let i = 0; i < 10; i++) {
      const initialSystemMoney = this.engine.getTotalSystemMoney();
      const startTime = performance.now();
      const paiseValue = fractionalPointers[i]; // e.g. 1 paise (₹0.01), 99 paise (₹0.99), 1001 paise (₹10.01)

      const res = await this.engine.executeTransfer({
        idempotencyKey: `idemp_round_${i}_${Date.now()}`,
        senderId: 'usr_alice',
        recipientId: 'usr_david',
        amountPaise: paiseValue,
      });

      const finalSystemMoney = this.engine.getTotalSystemMoney();
      const durationMs = Math.round(performance.now() - startTime);
      const passed = res.success && finalSystemMoney === initialSystemMoney;

      recordResult({
        id: `TEST-RD-${i < 9 ? '0' + (i + 1) : i + 1}`,
        category: 'ROUNDING',
        name: `Micro-Unit Non-Float Arithmetic: ₹${(paiseValue / 100).toFixed(2)} (${paiseValue} paise)`,
        description: `Verifies zero IEEE-754 floating point epsilon error for micro-transactions.`,
        status: passed ? 'PASS' : 'FAIL',
        initialSystemMoney,
        finalSystemMoney,
        durationMs,
        timestamp: new Date().toISOString(),
        attackVector: 'Float IEEE-754 epsilon precision degradation probe',
        invariantVerified: finalSystemMoney === initialSystemMoney,
        details: passed
          ? `SUCCESS: Exact integer paise arithmetic applied without floating-point drift.`
          : `FAILURE: Rounding mismatch or transfer rejected.`,
      });
      await new Promise(r => setTimeout(r, 8));
    }

    // ---------------------------------------------------------
    // 5. INSUFFICIENT BALANCE REJECTION (5 tests)
    // ---------------------------------------------------------
    for (let i = 1; i <= 5; i++) {
      const initialSystemMoney = this.engine.getTotalSystemMoney();
      const startTime = performance.now();
      const david = this.engine.getUser('usr_david')!;
      const excessAmount = david.balancePaise + 1000000; // David balance + ₹10,000

      const res = await this.engine.executeTransfer({
        idempotencyKey: `idemp_insuf_${i}_${Date.now()}`,
        senderId: 'usr_david',
        recipientId: 'usr_alice',
        amountPaise: excessAmount,
      });

      const finalDavid = this.engine.getUser('usr_david')!;
      const finalSystemMoney = this.engine.getTotalSystemMoney();
      const durationMs = Math.round(performance.now() - startTime);

      // Must be rejected and balance must not drop
      const passed = !res.success && finalDavid.balancePaise === david.balancePaise;

      recordResult({
        id: `TEST-IB-0${i}`,
        category: 'INSUFFICIENT_BALANCE',
        name: `Overdraft Rejection: Attempted ₹${(excessAmount / 100).toFixed(2)} with balance ₹${(david.balancePaise / 100).toFixed(2)}`,
        description: `David attempts transfer exceeding available balance. Must be rejected cleanly.`,
        status: passed ? 'PASS' : 'FAIL',
        initialSystemMoney,
        finalSystemMoney,
        durationMs,
        timestamp: new Date().toISOString(),
        attackVector: 'Negative balance overdraft penetration test',
        invariantVerified: finalDavid.balancePaise >= 0 && finalSystemMoney === initialSystemMoney,
        details: passed
          ? `SUCCESS: Overdraft blocked with error '${res.error?.substring(0, 35)}...'. Balance untouched.`
          : `FAILURE: Overdraft accepted or balance corrupted!`,
      });
      await new Promise(r => setTimeout(r, 8));
    }

    // ---------------------------------------------------------
    // 6. MID-TRANSACTION FAILURE / ATOMICITY (5 tests)
    // ---------------------------------------------------------
    for (let i = 1; i <= 5; i++) {
      const initialSystemMoney = this.engine.getTotalSystemMoney();
      const startTime = performance.now();
      const amount = 30000; // ₹300.00

      const res = await this.engine.executeTransfer({
        idempotencyKey: `idemp_crash_${i}_${Date.now()}`,
        senderId: 'usr_bob',
        recipientId: 'usr_alice',
        amountPaise: amount,
        simulateMidTxFailure: true,
      });

      const finalSystemMoney = this.engine.getTotalSystemMoney();
      const durationMs = Math.round(performance.now() - startTime);

      // In patched mode: failure is caught, balance rolled back, system money conserved!
      // In vulnerable mode: debit happens, credit fails, money is permanently destroyed!
      const passed = !res.success && finalSystemMoney === initialSystemMoney;

      recordResult({
        id: `TEST-TX-0${i}`,
        category: 'FAILURE_MID_TX',
        name: `Database/Network Crash Mid-Transfer [Fault Injection ${i}]`,
        description: `Injected crash after debit step before credit step. System must roll back atomically.`,
        status: passed ? 'PASS' : 'FAIL',
        initialSystemMoney,
        finalSystemMoney,
        durationMs,
        timestamp: new Date().toISOString(),
        attackVector: 'Simulated connection severance during two-phase commit',
        invariantVerified: finalSystemMoney === initialSystemMoney,
        details: passed
          ? 'SUCCESS: Atomic rollback executed cleanly. Debit reversed, zero money lost.'
          : 'CRITICAL FAILURE: Money destroyed! Sender debited without recipient credit; no rollback applied.',
      });
      await new Promise(r => setTimeout(r, 10));
    }

    // ---------------------------------------------------------
    // 7. REPEATED REQUEST STORM (5 tests)
    // ---------------------------------------------------------
    for (let i = 1; i <= 5; i++) {
      const initialSystemMoney = this.engine.getTotalSystemMoney();
      const startTime = performance.now();
      const stormKey = `storm_key_${i}_${Date.now()}`;
      const amount = 15000; // ₹150.00

      // Fire 10 simultaneous identical calls
      const burst = Array.from({ length: 10 }).map(() =>
        this.engine.executeTransfer({
          idempotencyKey: stormKey,
          senderId: 'usr_charlie',
          recipientId: 'usr_bob',
          amountPaise: amount,
        })
      );

      const stormResults = await Promise.all(burst);
      const successfulApplies = stormResults.filter(r => r.success && !r.isDuplicate).length;
      const finalSystemMoney = this.engine.getTotalSystemMoney();
      const durationMs = Math.round(performance.now() - startTime);

      const passed = successfulApplies === 1 && finalSystemMoney === initialSystemMoney;

      recordResult({
        id: `TEST-ST-0${i}`,
        category: 'REQUEST_STORM',
        name: `10x Concurrent Burst Replay Storm [Burst ${i}]`,
        description: `10 parallel identical requests fired simultaneously with key '${stormKey.substring(0, 14)}...'.`,
        status: passed ? 'PASS' : 'FAIL',
        initialSystemMoney,
        finalSystemMoney,
        durationMs,
        timestamp: new Date().toISOString(),
        attackVector: 'Distributed replay DDoS on transfer endpoint',
        invariantVerified: finalSystemMoney === initialSystemMoney,
        details: passed
          ? `SUCCESS: Exactly 1 transaction applied, 9 duplicate calls returned idempotency response.`
          : `FAILURE: Storm caused ${successfulApplies} independent transaction applications!`,
      });
      await new Promise(r => setTimeout(r, 10));
    }

    // ---------------------------------------------------------
    // 8. MONEY CONSERVATION THEOREM AUDIT (5 tests)
    // ---------------------------------------------------------
    for (let i = 1; i <= 5; i++) {
      const initialSystemMoney = this.engine.getTotalSystemMoney();
      const startTime = performance.now();

      // Perform a series of circular transfers: Alice -> Bob -> Charlie -> David -> Alice
      await this.engine.executeTransfer({
        idempotencyKey: `circ_1_${i}_${Date.now()}`,
        senderId: 'usr_alice',
        recipientId: 'usr_bob',
        amountPaise: 10000,
      });
      await this.engine.executeTransfer({
        idempotencyKey: `circ_2_${i}_${Date.now()}`,
        senderId: 'usr_bob',
        recipientId: 'usr_charlie',
        amountPaise: 10000,
      });
      await this.engine.executeTransfer({
        idempotencyKey: `circ_3_${i}_${Date.now()}`,
        senderId: 'usr_charlie',
        recipientId: 'usr_david',
        amountPaise: 10000,
      });
      await this.engine.executeTransfer({
        idempotencyKey: `circ_4_${i}_${Date.now()}`,
        senderId: 'usr_david',
        recipientId: 'usr_alice',
        amountPaise: 10000,
      });

      const finalSystemMoney = this.engine.getTotalSystemMoney();
      const durationMs = Math.round(performance.now() - startTime);

      const delta = Math.abs(finalSystemMoney - initialSystemMoney);
      const passed = delta === 0;

      recordResult({
        id: `TEST-MC-0${i}`,
        category: 'MONEY_CONSERVATION',
        name: `Total System Value Invariant Theorem [Audit ${i}]`,
        description: `Circular 4-hop ring transfer audit. Delta(System Money) must equal 0.00 paise.`,
        status: passed ? 'PASS' : 'FAIL',
        initialSystemMoney,
        finalSystemMoney,
        durationMs,
        timestamp: new Date().toISOString(),
        attackVector: 'Closed-loop multi-hop liquidity equilibrium audit',
        invariantVerified: delta === 0,
        details: passed
          ? `SUCCESS: Invariant Verified. Delta = ₹0.00. System money conserved at ₹${(finalSystemMoney / 100).toFixed(2)}.`
          : `CRITICAL INVARIANT BREACH: Total system money altered by ₹${(delta / 100).toFixed(2)}!`,
      });
      await new Promise(r => setTimeout(r, 10));
    }

    const totalPassed = results.filter(r => r.status === 'PASS').length;
    const totalFailed = results.filter(r => r.status === 'FAIL').length;

    return { results, totalPassed, totalFailed };
  }
}
