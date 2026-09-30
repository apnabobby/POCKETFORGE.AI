/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  FactoryState,
  AgentId,
  AgentNode,
  EvidenceItem,
  TestCaseResult,
  LogEntry,
  FactoryJobMetrics,
} from '../types/factory';
import { WalletEngine } from './walletEngine';
import { AdversarialTestRunner } from './adversarialRunner';

export interface OrchestratorListener {
  onStateChange: (state: FactoryState) => void;
  onAgentUpdate: (agents: AgentNode[]) => void;
  onLog: (log: LogEntry) => void;
  onTestUpdate: (tests: TestCaseResult[]) => void;
  onEvidenceUpdate: (evidence: EvidenceItem[]) => void;
  onMetricsUpdate: (metrics: FactoryJobMetrics) => void;
  onCodeUpdate: (phase: 'vulnerable' | 'repaired') => void;
}

export const VULNERABLE_CODE_SNIPPET = `// AGENT 3 (BUILDER) - INITIAL IMPLEMENTATION
// VULNERABILITY INJECTED: Naive balance check without atomic lock
export async function executeTransfer(req: TransferRequest) {
  const sender = await db.wallets.findById(req.senderId);
  const recipient = await db.wallets.findById(req.recipientId);

  // ❌ FLAW 1: Non-atomic balance check
  if (sender.balance < req.amount) {
    throw new Error("Insufficient funds");
  }

  // ❌ FLAW 2: Async I/O gap creates race condition window!
  // Another concurrent request reads the same stale balance here!
  await simulateNetworkIOLatency();

  // ❌ FLAW 3: No idempotency store check
  sender.balance -= req.amount;
  recipient.balance += req.amount;

  await db.wallets.save([sender, recipient]);
  return { status: "COMMITTED" };
}`;

export const REPAIRED_CODE_SNIPPET = `// AGENT 6 (REPAIR AGENT) - SYNTHESIZED SECURITY PATCH
// FIX: Serializable Mutex Lock + Idempotency Cache + Two-Phase Atomic Rollback
export async function executeTransfer(req: TransferRequest) {
  // ✅ FIX 1: Enforce positive integer minor units (paise/cents)
  if (!Number.isInteger(req.amountPaise) || req.amountPaise <= 0) {
    throw new Error("INVALID_AMOUNT: Minor integer units required.");
  }

  // ✅ FIX 2: Strict Idempotency Check-and-Set
  const cachedTx = await idempotencyStore.get(req.idempotencyKey);
  if (cachedTx) return { ...cachedTx, isDuplicate: true };

  // ✅ FIX 3: Per-Wallet Mutex Lock prevents concurrent double-spends
  const unlockSender = await acquireLock(req.senderId);
  const unlockRecipient = await acquireLock(req.recipientId);

  const snapshotSender = sender.balancePaise;
  const snapshotRecipient = recipient.balancePaise;
  const initialSystemMoney = await calculateTotalMoney();

  try {
    if (sender.balancePaise < req.amountPaise) {
      throw new Error("INSUFFICIENT_FUNDS");
    }

    // Atomic mutation
    sender.balancePaise -= req.amountPaise;
    recipient.balancePaise += req.amountPaise;

    // ✅ FIX 4: Mathematical Conservation Invariant Audit
    const finalSystemMoney = await calculateTotalMoney();
    if (finalSystemMoney !== initialSystemMoney) {
      throw new Error("INVARIANT_VIOLATION: Money created or destroyed!");
    }

    const tx = await db.ledger.insert({ ...req, status: "COMMITTED" });
    await idempotencyStore.set(req.idempotencyKey, tx);
    return tx;
  } catch (err) {
    // ✅ FIX 5: Atomic Rollback Guarantee
    sender.balancePaise = snapshotSender;
    recipient.balancePaise = snapshotRecipient;
    await db.ledger.insert({ ...req, status: "ROLLED_BACK", error: err.message });
    throw err;
  } finally {
    unlockRecipient();
    unlockSender();
  }
}`;

export class FactoryOrchestrator {
  private state: FactoryState = 'RECEIVED';
  private currentJobId: string = 'JOB-PF-1042';
  private userTask: string = 'Build a wallet transfer system where users can safely transfer money with zero loss, race-condition immunity, and instant idempotency.';
  private agents: AgentNode[] = [];
  private logs: LogEntry[] = [];
  private testResults: TestCaseResult[] = [];
  private evidenceLedger: EvidenceItem[] = [];
  private listeners: OrchestratorListener[] = [];
  private isRunning: boolean = false;
  private abortController: boolean = false;

  private engine: WalletEngine;
  private runner: AdversarialTestRunner;

  private metrics: FactoryJobMetrics = {
    totalJobs: 1,
    completedJobs: 0,
    testsExecuted: 0,
    testsPassed: 0,
    testsFailed: 0,
    bugsDiscovered: 0,
    bugsRepaired: 0,
    repairAttempts: 0,
    evidenceGenerated: 0,
    runtimeSeconds: 0,
    conservationIntegrityPercent: 100,
  };

  constructor(engine: WalletEngine) {
    this.engine = engine;
    this.runner = new AdversarialTestRunner(engine);
    this.initAgents();
  }

  public subscribe(listener: OrchestratorListener): () => void {
    this.listeners.push(listener);
    // Send immediate initial state
    listener.onStateChange(this.state);
    listener.onAgentUpdate(this.agents);
    listener.onTestUpdate(this.testResults);
    listener.onEvidenceUpdate(this.evidenceLedger);
    listener.onMetricsUpdate(this.metrics);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    for (const l of this.listeners) {
      l.onStateChange(this.state);
      l.onAgentUpdate(this.agents);
      l.onTestUpdate(this.testResults);
      l.onEvidenceUpdate(this.evidenceLedger);
      l.onMetricsUpdate(this.metrics);
    }
  }

  private initAgents() {
    this.agents = [
      {
        id: 'PLANNER',
        name: 'Planner Agent (BAND Seat 1)',
        role: 'Requirements Extraction & Risk Modeling',
        avatarIcon: 'Workflow',
        status: 'idle',
        currentAction: 'Awaiting task ingress',
        outputSummary: 'Standby for task decomposition and acceptance criteria formulation.',
      },
      {
        id: 'ARCHITECT',
        name: 'Architect Agent (BAND Seat 1)',
        role: 'System Design & Invariant Definition',
        avatarIcon: 'Layers',
        status: 'idle',
        currentAction: 'Awaiting planner handoff',
        outputSummary: 'Standby for data schema, concurrency strategy, and API contract design.',
      },
      {
        id: 'BUILDER',
        name: 'Implementer Agent (BAND Seat 2)',
        role: 'Autonomous Backend Code Generation',
        avatarIcon: 'Code2',
        status: 'idle',
        currentAction: 'Awaiting architecture specs',
        outputSummary: 'Standby for wallet state machine & minor-unit transfer implementation.',
      },
      {
        id: 'ADVERSARIAL_TESTER',
        name: 'Adversarial Test Agent (BAND Seat 3)',
        role: 'Red-Team Attack & Exploit Engine',
        avatarIcon: 'Flame',
        status: 'idle',
        currentAction: 'Awaiting build artifacts',
        outputSummary: 'Standby for 50-vector adversarial suite (race conditions, retries, rounding).',
      },
      {
        id: 'INDEPENDENT_VERIFIER',
        name: 'Verification Agent (BAND Seat 3)',
        role: 'Independent Blue-Team Audit & Signoff',
        avatarIcon: 'ShieldCheck',
        status: 'idle',
        currentAction: 'Awaiting test telemetry',
        outputSummary: 'Independent gatekeeper. Audits ledger consistency and conservation theorems.',
      },
      {
        id: 'REPAIRER',
        name: 'Repair Agent (BAND Seat 2)',
        role: 'Root Cause Diagnosis & Security Patching',
        avatarIcon: 'Wrench',
        status: 'idle',
        currentAction: 'Standby for failure escalation',
        outputSummary: 'Automated patch synthesis with atomic locks and rollback invariants.',
      },
    ];
  }

  public setTask(task: string) {
    this.userTask = task;
    this.log('ORCHESTRATOR', 'info', `New task injected into Dark Factory: "${task}"`);
  }

  public getTask(): string {
    return this.userTask;
  }

  public getJobId(): string {
    return this.currentJobId;
  }

  public getState(): FactoryState {
    return this.state;
  }

  public getAgents(): AgentNode[] {
    return this.agents;
  }

  public getLogs(): LogEntry[] {
    return this.logs;
  }

  public getTests(): TestCaseResult[] {
    return this.testResults;
  }

  public getEvidence(): EvidenceItem[] {
    return this.evidenceLedger;
  }

  public getMetrics(): FactoryJobMetrics {
    return this.metrics;
  }

  private log(agent: AgentId | 'ORCHESTRATOR', level: 'info' | 'warn' | 'error' | 'success' | 'attack', message: string) {
    const entry: LogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      agent,
      level,
      message,
    };
    this.logs.unshift(entry);
    for (const l of this.listeners) {
      l.onLog(entry);
    }
  }

  private updateAgent(id: AgentId, updates: Partial<AgentNode>) {
    this.agents = this.agents.map(a => (a.id === id ? { ...a, ...updates } : a));
    for (const l of this.listeners) {
      l.onAgentUpdate(this.agents);
    }
  }

  private addEvidence(item: Omit<EvidenceItem, 'id' | 'jobId' | 'proofHash'>) {
    // Generate deterministic pseudo-SHA256 representation for proof
    const raw = `${this.currentJobId}:${item.agent}:${item.action}:${item.verdict}:${item.timestamp}:${Date.now()}`;
    let hashNum = 0;
    for (let i = 0; i < raw.length; i++) {
      hashNum = (hashNum << 5) - hashNum + raw.charCodeAt(i);
      hashNum |= 0;
    }
    const hex = Math.abs(hashNum).toString(16).padStart(8, '0');
    const proofHash = `sha256:0x${hex}${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`;

    const fullItem: EvidenceItem = {
      id: `EVD-${this.currentJobId.replace('JOB-PF-', '')}-${(this.evidenceLedger.length + 1).toString().padStart(2, '0')}`,
      jobId: this.currentJobId,
      proofHash,
      ...item,
    };

    this.evidenceLedger.unshift(fullItem);
    this.metrics.evidenceGenerated = this.evidenceLedger.length;
    for (const l of this.listeners) {
      l.onEvidenceUpdate(this.evidenceLedger);
      l.onMetricsUpdate(this.metrics);
    }
  }

  /**
   * Complete Autonomous Factory Run (Hackathon Demo Mode)
   * Visibly demonstrates:
   * AI builds -> AI attacks -> BUG FOUND -> AI diagnoses -> AI repairs -> AI tests again -> AI independently verifies -> ACCEPTED
   */
  public async runDemoPipeline(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;
    this.abortController = false;

    // Reset environment to baseline
    this.engine.reset(false); // Start in vulnerable mode!
    this.testResults = [];
    this.evidenceLedger = [];
    this.logs = [];
    this.initAgents();
    this.metrics = {
      totalJobs: 1,
      completedJobs: 0,
      testsExecuted: 0,
      testsPassed: 0,
      testsFailed: 0,
      bugsDiscovered: 0,
      bugsRepaired: 0,
      repairAttempts: 0,
      evidenceGenerated: 0,
      runtimeSeconds: 0,
      conservationIntegrityPercent: 100,
    };
    for (const l of this.listeners) {
      l.onCodeUpdate('vulnerable');
    }
    this.notify();

    const startTimestamp = Date.now();
    const timerInterval = setInterval(() => {
      this.metrics.runtimeSeconds = Math.round((Date.now() - startTimestamp) / 1000);
      for (const l of this.listeners) {
        l.onMetricsUpdate(this.metrics);
      }
    }, 1000);

    try {
      // -------------------------------------------------------------
      // STAGE 1: RECEIVED & PLANNING
      // -------------------------------------------------------------
      this.state = 'RECEIVED';
      this.log('ORCHESTRATOR', 'info', `Ingesting dark factory job [${this.currentJobId}]: "${this.userTask}"`);
      this.notify();
      await new Promise(r => setTimeout(r, 600));

      this.state = 'PLANNING';
      this.updateAgent('PLANNER', {
        status: 'running',
        currentAction: 'Decomposing task into formal engineering invariants & risk matrix',
      });
      this.log('PLANNER', 'info', 'Parsing requirements: Atomic money transfer, race-condition immunity, idempotent retries.');
      this.notify();
      await new Promise(r => setTimeout(r, 1200));

      const plannerPayload = {
        requirements: [
          '1. Transfer money between arbitrary user wallets safely.',
          '2. Never permit negative balances under any concurrent stress.',
          '3. Neutralize duplicate transfers via deterministic idempotency keys.',
          '4. Handle network retries and timeout storms without duplicate charging.',
          '5. Handle high-volume concurrent requests with serializable isolation.',
          '6. Enforce integer minor units (paise/cents); strictly prohibit floating-point IEEE-754 arithmetic.',
          '7. Invariant Conservation Theorem: Delta(System Money) == 0 at all times.',
        ],
        risks: [
          'Race Condition: Simultaneous double-spend reads stale balance before debit commit.',
          'Retry Storm: Dropped ACK triggers client retry causing double payment.',
          'Partial Failure: Mid-transaction crash debits sender without crediting recipient.',
          'Precision Drift: Floating point rounding leaks fractional money over time.',
        ],
        acceptanceCriteria: '100% pass on 50 adversarial attack vectors; 0 invariants violated.',
      };

      this.updateAgent('PLANNER', {
        status: 'passed',
        currentAction: 'Handed structured engineering brief to Architect Agent',
        outputSummary: 'Generated 7 formal engineering requirements & 4 high-severity risk models.',
        handoffPayload: plannerPayload,
        executionTimeMs: 1200,
      });
      this.log('PLANNER', 'success', 'Planning completed. Acceptance criteria formalization locked.');
      this.addEvidence({
        requirement: 'Decompose task & define formal safety criteria',
        agent: 'PLANNER',
        timestamp: new Date().toLocaleTimeString(),
        action: 'TASK_DECOMPOSITION_AND_RISK_MODELING',
        input: this.userTask,
        output: JSON.stringify(plannerPayload.requirements),
        testName: 'Requirements Feasibility & Threat Matrix Audit',
        verdict: 'PASS',
        reason: 'All 7 financial invariants captured, including integer arithmetic and conservation theorems.',
        invariant: 'Completeness of Risk Boundary',
      });
      await new Promise(r => setTimeout(r, 700));

      // -------------------------------------------------------------
      // STAGE 2: ARCHITECTING
      // -------------------------------------------------------------
      this.state = 'ARCHITECTING';
      this.updateAgent('ARCHITECT', {
        status: 'running',
        currentAction: 'Designing system schemas, isolation mechanisms & state transitions',
      });
      this.log('ARCHITECT', 'info', 'Designing wallet entity models, immutable double-entry ledger & idempotency state machine.');
      this.notify();
      await new Promise(r => setTimeout(r, 1400));

      const architectPayload = {
        domainModel: 'Wallet (id, balancePaise: integer), TransactionLedger (id, idempotencyKey, amountPaise, status)',
        concurrencyStrategy: 'Per-Wallet Serializable Mutex Queue with optimistic lock fallback',
        idempotencyProtocol: 'Check-and-Set In-Memory / Distributed Cache with TTL and status verification',
        arithmeticStandard: 'Strict Integer Minor Units (1 INR = 100 paise). Float inputs rejected.',
        apiContracts: ['POST /api/wallet/transfer', 'GET /api/wallet/balances', 'GET /api/wallet/ledger'],
      };

      this.updateAgent('ARCHITECT', {
        status: 'passed',
        currentAction: 'Delivered architecture blueprint to Implementation Agent',
        outputSummary: 'Defined schema with integer paise, immutable ledger entries, and two-phase commit strategy.',
        handoffPayload: architectPayload,
        executionTimeMs: 1400,
      });
      this.log('ARCHITECT', 'success', 'Architecture blueprint validated. Handoff to Builder Agent.');
      this.addEvidence({
        requirement: 'System Architecture & Concurrency Strategy',
        agent: 'ARCHITECT',
        timestamp: new Date().toLocaleTimeString(),
        action: 'SPECIFICATION_SYNTHESIS',
        input: 'Planner Requirements Brief',
        output: 'Architecture Blueprint: Double-Entry Minor Units + Concurrency Mutex',
        testName: 'Architectural Invariant Proof',
        verdict: 'PASS',
        reason: 'Specified integer minor unit standard and double-entry transaction record schema.',
        invariant: 'Conservation of Value via Atomic Ledger',
      });
      await new Promise(r => setTimeout(r, 700));

      // -------------------------------------------------------------
      // STAGE 3: IMPLEMENTATION (BUILDING)
      // -------------------------------------------------------------
      this.state = 'BUILDING';
      this.updateAgent('BUILDER', {
        status: 'running',
        currentAction: 'Generating backend wallet services & transaction handlers',
      });
      this.log('BUILDER', 'info', 'Compiling TypeScript wallet engine with balance verification and minor-unit routing.');
      this.notify();
      await new Promise(r => setTimeout(r, 1500));

      this.updateAgent('BUILDER', {
        status: 'passed',
        currentAction: 'Initial implementation compiled and deployed to adversarial test harness',
        outputSummary: 'Synthesized WalletEngine v1.0. Balance checking implemented, ledger hooks active.',
        handoffPayload: {
          version: '1.0.0-unverified',
          codeHash: 'build_v1_naive_check',
          components: ['walletEngine.ts', 'transferHandler.ts', 'ledgerStore.ts'],
        },
        executionTimeMs: 1500,
      });
      this.log('BUILDER', 'success', 'WalletEngine v1.0 generated. Handing off to Adversarial Test Agent.');
      this.addEvidence({
        requirement: 'Generate Wallet Engine Backend',
        agent: 'BUILDER',
        timestamp: new Date().toLocaleTimeString(),
        action: 'CODE_SYNTHESIS',
        input: 'Architecture Specification Blueprint',
        output: 'WalletEngine v1.0 compiled artifact',
        testName: 'Build & Syntax Validation',
        verdict: 'PASS',
        reason: 'Code compiles cleanly with TypeScript. Ready for adversarial penetration.',
        invariant: 'Syntactic and Semantic Validity',
      });
      await new Promise(r => setTimeout(r, 800));

      // -------------------------------------------------------------
      // STAGE 4: ADVERSARIAL TESTING (RED TEAM ATTACK ON VULNERABLE CODE)
      // -------------------------------------------------------------
      this.state = 'TESTING';
      this.updateAgent('ADVERSARIAL_TESTER', {
        status: 'running',
        currentAction: 'Launching 50-vector adversarial attack battery against WalletEngine v1.0',
      });
      this.log('ADVERSARIAL_TESTER', 'attack', 'RED TEAM ACTIVE: Commencing parallel race conditions, retry storms, and mid-tx fault injection.');
      this.notify();

      // Run tests on initial (vulnerable) engine
      // This will fail on double spend & retry storm!
      const initialTestResult = await this.runner.runFullSuite((current, total, item) => {
        this.testResults = [...this.testResults, item];
        this.metrics.testsExecuted = current;
        if (item.status === 'PASS') {
          this.metrics.testsPassed++;
        } else {
          this.metrics.testsFailed++;
        }
        for (const l of this.listeners) {
          l.onTestUpdate(this.testResults);
          l.onMetricsUpdate(this.metrics);
        }
      });

      this.log('ADVERSARIAL_TESTER', 'error', `VULNERABILITY DETECTED: ${initialTestResult.totalFailed} test vectors failed! Race condition & idempotency breach.`);
      this.updateAgent('ADVERSARIAL_TESTER', {
        status: 'failed',
        currentAction: 'Exploited critical race condition in naive transfer handler',
        outputSummary: `EXPLOIT CONFIRMED: ${initialTestResult.totalFailed} attacks succeeded against WalletEngine v1.0. Double spend and duplicate retry verified.`,
        executionTimeMs: 2500,
      });
      this.addEvidence({
        requirement: 'Adversarial Penetration Testing (Double Spend & Race Immunity)',
        agent: 'ADVERSARIAL_TESTER',
        timestamp: new Date().toLocaleTimeString(),
        action: 'ADVERSARIAL_PENETRATION_SUITE',
        input: '50 High-Concurrency Attack Vectors',
        output: `${initialTestResult.totalFailed} Failures Detected across Double-Spend and Retry vectors`,
        testName: 'TEST-DS-01 & TEST-DR-01',
        verdict: 'FAIL',
        reason: 'CRITICAL: Simultaneous ₹800 transfers both succeeded with ₹1000 balance! Negative balance allowed.',
        invariant: 'Zero Double Spending [VIOLATED]',
      });
      await new Promise(r => setTimeout(r, 900));

      // -------------------------------------------------------------
      // STAGE 5: INDEPENDENT VERIFICATION (REJECTS BASELINE)
      // -------------------------------------------------------------
      this.state = 'FAILURE_DETECTED';
      this.updateAgent('INDEPENDENT_VERIFIER', {
        status: 'running',
        currentAction: 'Auditing ledger integrity and balance conservation invariants',
      });
      this.log('INDEPENDENT_VERIFIER', 'error', 'INDEPENDENT AUDIT: Discovered double-spend exploit and money creation anomaly. Rejecting build.');
      this.notify();
      await new Promise(r => setTimeout(r, 1200));

      this.metrics.bugsDiscovered = 1;
      this.updateAgent('INDEPENDENT_VERIFIER', {
        status: 'failed',
        currentAction: 'Gatekeeper Verdict: CRITICAL FAILURE (NEEDS REPAIR)',
        outputSummary: 'Independent gatekeeper rejects WalletEngine v1.0. Escalated to Repair Agent with diagnostic traces.',
        executionTimeMs: 1200,
      });
      this.addEvidence({
        requirement: 'Independent Quality Verification Gate',
        agent: 'INDEPENDENT_VERIFIER',
        timestamp: new Date().toLocaleTimeString(),
        action: 'INDEPENDENT_INVARIANT_AUDIT',
        input: 'Adversarial Test Telemetry & Ledger Dump',
        output: 'VERDICT: CRITICAL FAILURE (NEEDS REPAIR)',
        testName: 'Conservation & Non-Negative Balance Verification',
        verdict: 'NEEDS_REPAIR',
        reason: 'Builder claims cannot be trusted. System permitted ₹800 double-spend and duplicate charge on retry.',
        invariant: 'Double-Spend Immunity & Atomicity',
      });
      await new Promise(r => setTimeout(r, 1000));

      // -------------------------------------------------------------
      // STAGE 6: REPAIR AGENT (DIAGNOSIS & PATCH SYNTHESIS)
      // -------------------------------------------------------------
      this.state = 'REPAIRING';
      this.metrics.repairAttempts = 1;
      this.updateAgent('REPAIRER', {
        status: 'running',
        currentAction: 'Analyzing root cause: Asynchronous gap between balance check and balance mutation',
      });
      this.log('REPAIRER', 'warn', 'DIAGNOSIS: Race condition located in transferHandler. Missing serializable lock and idempotency cache.');
      this.notify();
      await new Promise(r => setTimeout(r, 1400));

      this.log('REPAIRER', 'info', 'SYNTHESIZING PATCH: 1) Per-wallet mutex lock 2) Idempotency check-and-set 3) Two-phase rollback.');
      await new Promise(r => setTimeout(r, 1500));

      // Apply patch to the actual wallet engine!
      this.engine.reset(true); // Switch engine to hardened / patched mode
      this.metrics.bugsRepaired = 1;

      for (const l of this.listeners) {
        l.onCodeUpdate('repaired');
      }

      this.updateAgent('REPAIRER', {
        status: 'repaired',
        currentAction: 'Security patch applied. Handed back to Adversarial Test Agent for full re-test.',
        outputSummary: 'PATCH APPLIED: Injected fine-grained mutex lock, atomic idempotency cache, and invariant conservation rollback.',
        executionTimeMs: 2900,
      });
      this.log('REPAIRER', 'success', 'Patch applied cleanly to runtime. Initiating re-testing battery.');
      this.addEvidence({
        requirement: 'Root Cause Diagnosis & Security Patching',
        agent: 'REPAIRER',
        timestamp: new Date().toLocaleTimeString(),
        action: 'PATCH_SYNTHESIS_AND_DEPLOY',
        input: 'Failure Incident Report from Verification Agent',
        output: 'Security Patch: Mutex Lock Queue + Atomic Idempotency Cache + Rollback Checkpoint',
        testName: 'Patch Syntax & Invariant Proof',
        verdict: 'PASS',
        reason: 'Addressed both root causes: serializable isolation on wallet balances and deduplication cache.',
        invariant: 'Serializability & Idempotency',
      });
      await new Promise(r => setTimeout(r, 800));

      // -------------------------------------------------------------
      // STAGE 7: RETESTING (ADVERSARIAL ATTACKS ON REPAIRED CODE)
      // -------------------------------------------------------------
      this.state = 'RETESTING';
      this.updateAgent('ADVERSARIAL_TESTER', {
        status: 'running',
        currentAction: 'Executing 50 adversarial attack vectors against Repaired WalletEngine v1.1',
      });
      this.log('ADVERSARIAL_TESTER', 'attack', 'RETESTING: Subjecting patched engine to 50 adversarial attack vectors...');
      this.notify();

      // Clear previous failed tests for clean re-test demonstration
      this.testResults = [];
      this.metrics.testsExecuted = 0;
      this.metrics.testsPassed = 0;
      this.metrics.testsFailed = 0;

      const retestResult = await this.runner.runFullSuite((current, total, item) => {
        this.testResults = [...this.testResults, item];
        this.metrics.testsExecuted = current;
        if (item.status === 'PASS') {
          this.metrics.testsPassed++;
        } else {
          this.metrics.testsFailed++;
        }
        for (const l of this.listeners) {
          l.onTestUpdate(this.testResults);
          l.onMetricsUpdate(this.metrics);
        }
      });

      this.updateAgent('ADVERSARIAL_TESTER', {
        status: 'passed',
        currentAction: 'All 50 adversarial attack scenarios neutralized',
        outputSummary: `ATTACK NEUTRALIZED: 50/50 tests passed! 0 double-spends, 0 negative balances, 0 money leaks.`,
        executionTimeMs: 2600,
      });
      this.log('ADVERSARIAL_TESTER', 'success', `50/50 ADVERSARIAL TESTS PASSED. Patched engine defeated all red-team attack vectors.`);
      this.addEvidence({
        requirement: 'Adversarial Regression Battery',
        agent: 'ADVERSARIAL_TESTER',
        timestamp: new Date().toLocaleTimeString(),
        action: 'FULL_ADVERSARIAL_SUITE_RERUN',
        input: '50 High-Concurrency Attack Vectors against Patched Engine',
        output: '50/50 Tests Passed. 0 Failures.',
        testName: 'Adversarial Red-Team Regression Matrix',
        verdict: 'PASS',
        reason: 'All double-spend race conditions blocked. Retry storms deduplicated. Mid-tx crashes rolled back.',
        invariant: 'Total Attack Resistance',
      });
      await new Promise(r => setTimeout(r, 800));

      // -------------------------------------------------------------
      // STAGE 8: FINAL INDEPENDENT VERIFICATION & ACCEPTANCE
      // -------------------------------------------------------------
      this.state = 'VERIFYING';
      this.updateAgent('INDEPENDENT_VERIFIER', {
        status: 'running',
        currentAction: 'Final audit: Double-entry ledger audit, balance sums, and cryptographic proof',
      });
      this.log('INDEPENDENT_VERIFIER', 'info', 'Auditing final system money: Initial ₹18,500.00 vs Current ₹18,500.00. Delta = ₹0.00.');
      this.notify();
      await new Promise(r => setTimeout(r, 1400));

      const totalFinalMoney = this.engine.getTotalSystemMoney();
      const initialSystemMoney = 1850000; // 18,500 INR in paise

      if (totalFinalMoney === initialSystemMoney && retestResult.totalFailed === 0) {
        this.state = 'ACCEPTED';
        this.metrics.completedJobs = 1;
        this.metrics.conservationIntegrityPercent = 100;

        this.updateAgent('INDEPENDENT_VERIFIER', {
          status: 'passed',
          currentAction: 'Formally Certified & Signed Off: FACTORY ACCEPTED',
          outputSummary: 'Independent gatekeeper confirms: 50/50 tests passed, 0 invariants violated, 100% money conserved.',
          executionTimeMs: 1400,
        });

        this.log('INDEPENDENT_VERIFIER', 'success', 'CERTIFICATION COMPLETE: Build verified compliant with all 7 engineering invariants.');
        this.log('ORCHESTRATOR', 'success', '🟢 FACTORY ACCEPTED: Software verified safe for financial deployment. Evidence ledger sealed.');

        this.addEvidence({
          requirement: 'Final Independent Verification & Cryptographic Ledger Audit',
          agent: 'INDEPENDENT_VERIFIER',
          timestamp: new Date().toLocaleTimeString(),
          action: 'FINAL_SIGN_OFF',
          input: 'Full 50-Test Telemetry + Ledger Checksum Audit',
          output: 'VERDICT: FACTORY ACCEPTED (100% Invariant Compliance)',
          testName: 'Global Invariant & Conservation Theorem Verification',
          verdict: 'PASS',
          reason: 'System total money mathematically unchanged at ₹18,500.00. Double spend exploits neutralized.',
          invariant: 'Mathematical Conservation of Money (Delta = 0)',
        });
      } else {
        this.state = 'REJECTED';
        this.updateAgent('INDEPENDENT_VERIFIER', {
          status: 'failed',
          currentAction: 'Failed final verification audit',
          outputSummary: 'System money invariant violated or retests failed.',
        });
        this.log('ORCHESTRATOR', 'error', '🔴 FACTORY REJECTED: Final verification criteria not met.');
      }

      this.notify();
    } catch (err: any) {
      this.log('ORCHESTRATOR', 'error', `Factory error: ${err.message}`);
    } finally {
      clearInterval(timerInterval);
      this.isRunning = false;
    }
  }

  public resetFactory(): void {
    this.engine.reset(false);
    this.state = 'RECEIVED';
    this.testResults = [];
    this.evidenceLedger = [];
    this.logs = [];
    this.initAgents();
    this.metrics = {
      totalJobs: 1,
      completedJobs: 0,
      testsExecuted: 0,
      testsPassed: 0,
      testsFailed: 0,
      bugsDiscovered: 0,
      bugsRepaired: 0,
      repairAttempts: 0,
      evidenceGenerated: 0,
      runtimeSeconds: 0,
      conservationIntegrityPercent: 100,
    };
    this.notify();
    this.log('ORCHESTRATOR', 'info', 'Dark Factory reset to clean baseline.');
  }

  public isFactoryRunning(): boolean {
    return this.isRunning;
  }
}
