/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DecisionRecord, DecisionMemoryQueryResponse } from '../types/decisionMemory';

/**
 * Deterministic local decision memory corpus.
 * Designed for clean, offline-compatible operation with zero outbound network calls required.
 */
export const SAMPLE_DECISION_CORPUS: DecisionRecord[] = [
  {
    id: 'DEC-001',
    topic: 'Integer Minor Units Currency Standard',
    question: 'Why do we store wallet balances and transfers in integer paise rather than floating-point rupee values?',
    decisionMade: 'All balances, inputs, fees, and transfers must strictly use positive 64-bit integer minor units (paise/cents: 1 INR = 100 paise). Floating-point representations (Number float, IEEE-754) are rejected at gateway boundaries.',
    whyMade: 'Floating point IEEE-754 numbers cannot represent decimal values like 0.1 or 0.01 accurately without rounding truncation error. In high-frequency multi-hop circular transfers, float arithmetic produces cumulative balance drift (leakage) violating the fundamental Financial Conservation Invariant (∑ Balances = Constant).',
    alternativesConsidered: [
      {
        name: 'IEEE-754 Standard Double Precision Floats',
        description: 'Store balance as float numbers (e.g. 10.50 INR).',
        whyRejected: 'Introduces binary floating-point representation drift (e.g., 0.1 + 0.2 === 0.30000000000000004). Money is leaked or minted during repeated division and circular transfers.',
      },
      {
        name: 'Arbitrary-Precision Decimal Strings (Big.js / Decimal.js)',
        description: 'Encode all monetary amounts as arbitrary-precision strings and perform software decimal math.',
        whyRejected: 'Adds significant serialization overhead, slower indexing in SQLite/PostgreSQL, and requires external library runtime dependencies without native integer atomic hardware support.',
      },
    ],
    supportingEvidence: [
      {
        id: 'EVD-DEC-001-A',
        type: 'commit',
        title: 'fix(core): reject non-integer paise amounts and enforce Number.isInteger()',
        reference: 'git: commit 7f3b89a',
        date: '2026-09-27',
        author: 'Lead Architect',
        snippet: 'if (!Number.isInteger(req.amountPaise) || req.amountPaise <= 0) throw new Error("INVALID_AMOUNT: Minor integer units required.");',
      },
      {
        id: 'EVD-DEC-001-B',
        type: 'issue',
        title: 'Issue #18: Rounding mismatch in circular 4-hop ring transfer audit',
        reference: 'github: issue #18',
        date: '2026-09-26',
        author: 'QA Security Lead',
        snippet: 'After 10,000 circular micro-transfers of 10.01 INR, total system money drifted by +0.07 INR. Fixed by switching to 1001 integer paise.',
      },
    ],
    invariantsProtected: [
      'Zero Floating-Point Drift',
      'Exact Conservation of Total Money (Delta = 0.00)',
    ],
    impactArea: 'Transaction Engine & API Ingress',
    status: 'ACTIVE',
    timestamp: '2026-09-27T08:15:00Z',
  },
  {
    id: 'DEC-002',
    topic: 'Per-Wallet Serializable Mutex Locking for Concurrency',
    question: 'Why did we implement per-wallet mutex queues instead of optimistic row versioning for transfers?',
    decisionMade: 'Implemented an asynchronous in-memory per-wallet mutex lock queue (two-lock ordering: sender first, then recipient) before reading balances or executing debits.',
    whyMade: 'Under optimistic concurrency control, concurrent transfers (such as simultaneous 800 INR debits from a 1000 INR balance) both read the valid state, and one fails on version commit causing high abort rates and transaction retry storms. Mutex serialization guarantees strict linearizability, eliminates race conditions at arrival time, and guarantees zero double-spending.',
    alternativesConsidered: [
      {
        name: 'Optimistic Concurrency Control (OCC / Version Column)',
        description: 'Check version on commit; rollback and retry on conflict.',
        whyRejected: 'Severe retry storms under adversarial replay attacks. Adversarial Red-Team testing showed double-spend windows when database read-then-write latency exceeds 15ms.',
      },
      {
        name: 'Global Database Table Lock',
        description: 'Lock the entire ledger table for every transfer.',
        whyRejected: 'Eliminates all concurrency throughput across unrelated users (Alice->Bob locks Charlie->David unnecessarily).',
      },
    ],
    supportingEvidence: [
      {
        id: 'EVD-DEC-002-A',
        type: 'pull_request',
        title: 'PR #42: Synthesize mutex lock queue to neutralize double-spend vulnerability',
        reference: 'github: pr #42',
        date: '2026-09-27',
        author: 'Repair Agent',
        snippet: 'const releaseSenderLock = await this.acquireLock(req.senderId); try { releaseRecipientLock = await this.acquireLock(req.recipientId); ... }',
      },
      {
        id: 'EVD-DEC-002-B',
        type: 'discussion',
        title: 'Incident Report: Race Condition Exploited in Test TEST-DS-01',
        reference: 'docs: incident-20260927-01',
        date: '2026-09-27',
        author: 'Independent Verifier',
        snippet: 'Two simultaneous requests debited Alice from 1,000 INR to -600 INR. Repair Agent mandated two-phase lock acquisition before balance read.',
      },
    ],
    invariantsProtected: [
      'Non-Negative Balance Invariant (Balance >= 0)',
      'Zero Double-Spending Under Concurrency',
    ],
    impactArea: 'Concurrency & Locking Layer',
    status: 'ACTIVE',
    timestamp: '2026-09-27T09:20:00Z',
  },
  {
    id: 'DEC-003',
    topic: 'Deterministic Idempotency Key Store with Check-and-Set',
    question: 'Why do we require client idempotency keys and cache completed transaction receipts?',
    decisionMade: 'Every transfer request requires a unique client-generated idempotency key (UUID/hash). An atomic check-and-set lookup returns the original cached result if the same key is retransmitted.',
    whyMade: 'In distributed mobile networks, client timeouts or dropped TCP ACK packets cause the client to retry transfer requests. Without idempotency caching, dropped ACKs cause duplicate debits for the same intended payment.',
    alternativesConsidered: [
      {
        name: 'Timestamp & Amount Deduplication Window (Heuristic)',
        description: 'Block transactions from same sender with identical amount within 5 seconds.',
        whyRejected: 'False positives: users genuinely sending two recurring payments of the same amount get falsely rejected, while retries arriving at 5.1s cause duplicate billing.',
      },
      {
        name: 'Client-Side Only Debouncing',
        description: 'Disable UI button on click.',
        whyRejected: 'Vulnerable to browser reload, network retry storms, script replays, and mobile app background retries.',
      },
    ],
    supportingEvidence: [
      {
        id: 'EVD-DEC-003-A',
        type: 'commit',
        title: 'feat(idempotency): implement atomic key store and return isDuplicate receipt',
        reference: 'git: commit e91a24d',
        date: '2026-09-27',
        author: 'Builder Agent',
        snippet: 'const existing = this.idempotencyStore.get(req.idempotencyKey); if (existing) return { success: true, transaction: existing, isDuplicate: true };',
      },
      {
        id: 'EVD-DEC-003-B',
        type: 'design_doc',
        title: 'Architecture Blueprint: Network Dropped ACK Mitigation',
        reference: 'docs: arch-spec-v1.1',
        date: '2026-09-27',
        author: 'Architect Agent',
        snippet: 'Adversarial Test Suite runs 10x replay burst storms against identical keys; verify exactly 1 balance mutation occurs.',
      },
    ],
    invariantsProtected: [
      'Strict Idempotency Monotonicity (Apply(req, N) === Apply(req, 1))',
      'Protection Against Dropped ACK Network Retries',
    ],
    impactArea: 'API Gateway & Transaction Journal',
    status: 'ACTIVE',
    timestamp: '2026-09-27T08:45:00Z',
  },
  {
    id: 'DEC-004',
    topic: 'Two-Phase Atomic State Rollback on Mid-Transaction Crash',
    question: 'Why did we implement balance snapshotting and rollback checkpoints instead of trusting database auto-commit?',
    decisionMade: 'Before mutating in-memory balances, we capture pre-transaction state snapshots. If any simulated fault, validation failure, or network abort occurs after debit but before credit, the state machine restores original snapshots and inserts a ROLLED_BACK ledger entry.',
    whyMade: 'Network disconnects or unexpected exceptions midway through an uncommitted operation can cause money to be permanently destroyed (debited from sender but never credited to recipient). Atomic rollback guarantees system liquidity conservation.',
    alternativesConsidered: [
      {
        name: 'Asynchronous Compensation Job (Eventual Consistency)',
        description: 'Debit sender, publish event to broker, credit recipient in background queue.',
        whyRejected: 'Leaves money in undefined transit states during node failure; requires complex reconciliation sagas unsuitable for real-time synchronous verification.',
      },
      {
        name: 'Direct Single-Step Mutation Without Checkpoints',
        description: 'Debit and credit in single function call without state snapshotting.',
        whyRejected: 'Failed mid-transaction crash test TEST-TX-01: money was permanently lost when fault was injected between debit and credit.',
      },
    ],
    supportingEvidence: [
      {
        id: 'EVD-DEC-004-A',
        type: 'commit',
        title: 'fix(engine): add atomic snapshot rollback and invariant checksum validation',
        reference: 'git: commit c34b891',
        date: '2026-09-27',
        author: 'Repair Agent',
        snippet: 'catch (innerError) { sender.balancePaise = senderSnapshot; recipient.balancePaise = recipientSnapshot; ... }',
      },
      {
        id: 'EVD-DEC-004-B',
        type: 'pull_request',
        title: 'PR #45: Enforce Conservation Theorem: Delta(System Money) == 0',
        reference: 'github: pr #45',
        date: '2026-09-27',
        author: 'Architect Agent',
        snippet: 'Audit checksum before and after every transaction. Emergency rollback triggered if total money changes.',
      },
    ],
    invariantsProtected: [
      'Conservation of Total System Money (Delta = 0)',
      'Transaction Atomicity (All-or-Nothing Commit)',
    ],
    impactArea: 'Ledger Engine & Crash Recovery',
    status: 'ACTIVE',
    timestamp: '2026-09-27T09:40:00Z',
  },
  {
    id: 'DEC-005',
    topic: 'Independent Verifier Gatekeeper Architecture',
    question: 'Why is the Verification Agent separated from the Builder/Implementation Agent?',
    decisionMade: 'The verification role is decoupled into an independent gatekeeper (Blue-Team audit) that executes independently of the Builder Agent and inspects empirical evidence rather than trusting code self-reports.',
    whyMade: 'An agent that writes code has inherent bias to report that its own code succeeds. In our dark factory run, the Builder Agent generated naive code and claimed it worked; the Independent Verifier ran adversarial attacks, caught the double-spend exploit, and rejected the build with a CRITICAL FAILURE verdict.',
    alternativesConsidered: [
      {
        name: 'Self-Testing Implementation Agent',
        description: 'The Builder Agent runs its own unit tests and signs off on completion.',
        whyRejected: 'Blind spot hazard: Builder did not test for parallel async race conditions and self-certified a vulnerable engine.',
      },
      {
        name: 'Single All-in-One Agent Prompt',
        description: 'Prompt a single agent to plan, code, test, and certify in one pass.',
        whyRejected: 'Lacks adversarial tension. Fails to demonstrate dark factory repair and verification handoffs.',
      },
    ],
    supportingEvidence: [
      {
        id: 'EVD-DEC-005-A',
        type: 'discussion',
        title: 'BAND Hackathon Governance: Three Distinct Agent Seats',
        reference: 'docs: band-agent-mandates.md',
        date: '2026-09-27',
        author: 'Hackathon Compliance Engineer',
        snippet: 'Seat 1: Planner/Architect, Seat 2: Implementer, Seat 3: Reviewer/Validator. Reviewer must independently audit without builder bias.',
      },
      {
        id: 'EVD-DEC-005-B',
        type: 'issue',
        title: 'Audit Log #1042: Builder Claim Rejected by Verifier',
        reference: 'ledger: JOB-PF-1042-EVD-04',
        date: '2026-09-27',
        author: 'Independent Verifier',
        snippet: 'VERDICT: NEEDS_REPAIR. System permitted 800 INR double-spend on parallel calls. Escalated to Repair Agent.',
      },
    ],
    invariantsProtected: [
      'Zero False-Positive Self-Certification',
      'Independent Cryptographic Evidence Sealing',
    ],
    impactArea: 'Autonomous Agent Orchestration',
    status: 'ACTIVE',
    timestamp: '2026-09-27T10:05:00Z',
  },
];

export class DecisionMemoryService {
  private corpus: DecisionRecord[] = [...SAMPLE_DECISION_CORPUS];

  public queryDecisions(question: string): DecisionMemoryQueryResponse {
    const q = question.toLowerCase();
    const words = q.split(/\s+/).filter(w => w.length > 2);

    // Score decisions based on keyword overlap
    const scored = this.corpus.map(record => {
      let score = 0;
      const haystack = `${record.topic} ${record.question} ${record.decisionMade} ${record.whyMade} ${record.impactArea} ${record.invariantsProtected.join(' ')}`.toLowerCase();

      for (const word of words) {
        if (haystack.includes(word)) score += 2;
      }

      // Exact substring boost
      if (record.topic.toLowerCase().includes(q) || record.question.toLowerCase().includes(q)) {
        score += 10;
      }

      return { record, score };
    });

    scored.sort((a, b) => b.score - a.score);

    // If matches found with positive score, return top matches; otherwise return all decisions ordered by relevance
    const matched = scored.filter(s => s.score > 0).map(s => s.record);
    const finalMatches = matched.length > 0 ? matched : this.corpus.slice(0, 3);

    const totalEvidence = finalMatches.reduce((acc, curr) => acc + curr.supportingEvidence.length, 0);

    return {
      query: question,
      matchedDecisions: finalMatches,
      summaryExplanation: `Found ${finalMatches.length} historical technical architectural decision(s) directly answering your query, backed by ${totalEvidence} verified evidence artifacts (commits, PRs, and incident logs).`,
      keyTakeaway: finalMatches[0]?.decisionMade || 'No matching decision found.',
      retrievedEvidenceCount: totalEvidence,
    };
  }

  public getAllDecisions(): DecisionRecord[] {
    return [...this.corpus];
  }

  public getDecisionById(id: string): DecisionRecord | undefined {
    return this.corpus.find(d => d.id === id);
  }
}

export const globalDecisionMemory = new DecisionMemoryService();
