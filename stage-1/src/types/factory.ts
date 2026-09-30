/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type FactoryState =
  | 'RECEIVED'
  | 'PLANNING'
  | 'ARCHITECTING'
  | 'BUILDING'
  | 'TESTING'
  | 'FAILURE_DETECTED'
  | 'REPAIRING'
  | 'RETESTING'
  | 'VERIFYING'
  | 'ACCEPTED'
  | 'REJECTED';

export type AgentId =
  | 'PLANNER'
  | 'ARCHITECT'
  | 'BUILDER'
  | 'ADVERSARIAL_TESTER'
  | 'INDEPENDENT_VERIFIER'
  | 'REPAIRER';

export type AgentStatus = 'idle' | 'running' | 'passed' | 'failed' | 'repaired';

export interface AgentNode {
  id: AgentId;
  name: string;
  role: string;
  avatarIcon: string;
  status: AgentStatus;
  currentAction: string;
  outputSummary: string;
  handoffPayload?: any;
  executionTimeMs?: number;
}

export interface EvidenceItem {
  id: string;
  jobId: string;
  requirement: string;
  agent: AgentId;
  timestamp: string;
  action: string;
  input: string;
  output: string;
  testName: string;
  verdict: 'PASS' | 'FAIL' | 'NEEDS_REPAIR';
  reason: string;
  proofHash: string;
  invariant: string;
}

export type TestCategory =
  | 'DOUBLE_SPENDING'
  | 'DUPLICATE_RETRY'
  | 'CONCURRENT_TRANSFERS'
  | 'ROUNDING'
  | 'INSUFFICIENT_BALANCE'
  | 'FAILURE_MID_TX'
  | 'REQUEST_STORM'
  | 'MONEY_CONSERVATION';

export interface TestCaseResult {
  id: string;
  category: TestCategory;
  name: string;
  description: string;
  status: 'PASS' | 'FAIL' | 'RUNNING' | 'PENDING';
  initialSystemMoney: number; // in paise
  finalSystemMoney: number;   // in paise
  details: string;
  timestamp: string;
  durationMs: number;
  attackVector: string;
  invariantVerified: boolean;
}

export interface WalletUser {
  id: string;
  name: string;
  email: string;
  balancePaise: number;
  initialBalancePaise: number;
}

export interface TransactionRecord {
  id: string;
  idempotencyKey: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  amountPaise: number;
  status:
    | 'COMMITTED'
    | 'ROLLED_BACK'
    | 'REJECTED_INSUFFICIENT_FUNDS'
    | 'REJECTED_DUPLICATE'
    | 'REJECTED_CONCURRENCY_VIOLATION'
    | 'VULNERABILITY_DOUBLE_SPENT';
  timestamp: string;
  systemMoneyChecksumBefore: number;
  systemMoneyChecksumAfter: number;
  enginePhase: 'vulnerable' | 'repaired';
  reasonNote?: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  agent: AgentId | 'ORCHESTRATOR';
  level: 'info' | 'warn' | 'error' | 'success' | 'attack';
  message: string;
}

export interface FactoryJobMetrics {
  totalJobs: number;
  completedJobs: number;
  testsExecuted: number;
  testsPassed: number;
  testsFailed: number;
  bugsDiscovered: number;
  bugsRepaired: number;
  repairAttempts: number;
  evidenceGenerated: number;
  runtimeSeconds: number;
  conservationIntegrityPercent: number;
}
