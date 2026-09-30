/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  FactoryState,
  AgentNode,
  EvidenceItem,
  TestCaseResult,
  LogEntry,
  FactoryJobMetrics,
} from './types/factory';
import { globalWalletEngine } from './services/walletEngine';
import { FactoryOrchestrator } from './services/factoryOrchestrator';
import { Header } from './components/Header';
import { AgentPipeline } from './components/AgentPipeline';
import { AdversarialTestsView } from './components/AdversarialTestsView';
import { EvidenceLedgerView } from './components/EvidenceLedgerView';
import { WalletSimulatorView } from './components/WalletSimulatorView';
import { ArchitectureView } from './components/ArchitectureView';
import { DecisionMemoryView } from './components/DecisionMemoryView';
import { LiveConsole } from './components/LiveConsole';
import { CodeInspectorModal } from './components/CodeInspectorModal';
import { CustomTaskModal } from './components/CustomTaskModal';
import { ExportAuditModal } from './components/ExportAuditModal';
import { AuditReportData } from './services/exportAuditReport';
import {
  CheckCircle2,
  AlertTriangle,
  Flame,
  ShieldCheck,
  Wrench,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Terminal,
  Activity,
  Layers,
} from 'lucide-react';

export default function App() {
  const orchestrator = useMemo(() => new FactoryOrchestrator(globalWalletEngine), []);

  const [state, setState] = useState<FactoryState>(orchestrator.getState());
  const [agents, setAgents] = useState<AgentNode[]>(orchestrator.getAgents());
  const [logs, setLogs] = useState<LogEntry[]>(orchestrator.getLogs());
  const [tests, setTests] = useState<TestCaseResult[]>(orchestrator.getTests());
  const [evidence, setEvidence] = useState<EvidenceItem[]>(orchestrator.getEvidence());
  const [metrics, setMetrics] = useState<FactoryJobMetrics>(orchestrator.getMetrics());

  const [activeTab, setActiveTab] = useState<string>('pipeline');
  const [isCodeModalOpen, setIsCodeModalOpen] = useState<boolean>(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [codePhase, setCodePhase] = useState<'vulnerable' | 'repaired'>('repaired');
  const [, setWalletRefreshKey] = useState<number>(0);

  // Subscribe to orchestrator lifecycle updates
  useEffect(() => {
    const unsubscribe = orchestrator.subscribe({
      onStateChange: (st) => setState(st),
      onAgentUpdate: (ag) => setAgents([...ag]),
      onLog: (lg) => setLogs((prev) => [lg, ...prev]),
      onTestUpdate: (ts) => setTests([...ts]),
      onEvidenceUpdate: (ev) => setEvidence([...ev]),
      onMetricsUpdate: (mt) => setMetrics({ ...mt }),
      onCodeUpdate: (phase) => setCodePhase(phase),
    });

    return unsubscribe;
  }, [orchestrator]);

  const handleRunDemo = () => {
    orchestrator.runDemoPipeline();
  };

  const handleReset = () => {
    orchestrator.resetFactory();
    setWalletRefreshKey(prev => prev + 1);
  };

  const handleApplyCustomTask = (task: string, triggerRun: boolean) => {
    orchestrator.setTask(task);
    if (triggerRun) {
      orchestrator.runDemoPipeline();
    }
  };

  const isRunning = orchestrator.isFactoryRunning();

  // Helper for Hero Banner state explanation
  const renderHeroBanner = () => {
    switch (state) {
      case 'RECEIVED':
        return (
          <div className="p-4 rounded-lg bg-cyan-950/30 border border-cyan-800/80 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <div>
                <span className="font-bold text-cyan-300">STAGE 0: TASK INGRESS RECEIVED</span>
                <p className="text-slate-300 text-[11px] font-sans mt-0.5">
                  Dark factory is primed with requirement: "{orchestrator.getTask()}". Click [RUN FACTORY DEMO] to start autonomous production.
                </p>
              </div>
            </div>
            <button
              onClick={handleRunDemo}
              disabled={isRunning}
              className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md cursor-pointer shrink-0"
            >
              RUN FACTORY DEMO
            </button>
          </div>
        );

      case 'PLANNING':
        return (
          <div className="p-4 rounded-lg bg-indigo-950/30 border border-indigo-800/80 flex items-center gap-3 text-xs font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
            <div>
              <span className="font-bold text-indigo-300">STAGE 1: PLANNER AGENT ACTIVE</span>
              <p className="text-slate-300 text-[11px] font-sans mt-0.5">
                Decomposing user brief into 7 formal financial invariants, risk models (race conditions, retry storms), and acceptance criteria.
              </p>
            </div>
          </div>
        );

      case 'ARCHITECTING':
        return (
          <div className="p-4 rounded-lg bg-indigo-950/30 border border-indigo-800/80 flex items-center gap-3 text-xs font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
            <div>
              <span className="font-bold text-indigo-300">STAGE 2: ARCHITECT AGENT ACTIVE</span>
              <p className="text-slate-300 text-[11px] font-sans mt-0.5">
                Designing domain schemas (Wallets, Immutable Ledger), two-phase commit state machine, and minor-unit integer arithmetic standard.
              </p>
            </div>
          </div>
        );

      case 'BUILDING':
        return (
          <div className="p-4 rounded-lg bg-blue-950/30 border border-blue-800/80 flex items-center gap-3 text-xs font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
            <div>
              <span className="font-bold text-blue-300">STAGE 3: IMPLEMENTATION AGENT (BUILDER) ACTIVE</span>
              <p className="text-slate-300 text-[11px] font-sans mt-0.5">
                Synthesizing WalletEngine v1.0 TypeScript backend code. Deploying compiled artifacts directly into red-team attack harness.
              </p>
            </div>
          </div>
        );

      case 'TESTING':
        return (
          <div className="p-4 rounded-lg bg-amber-950/30 border border-amber-800/80 flex items-center gap-3 text-xs font-mono">
            <Flame className="w-5 h-5 text-amber-400 animate-pulse shrink-0" />
            <div>
              <span className="font-bold text-amber-300">STAGE 4: ADVERSARIAL TEST AGENT ATTACKING</span>
              <p className="text-slate-300 text-[11px] font-sans mt-0.5">
                Bombarding WalletEngine v1.0 with 50 adversarial attack vectors: concurrent double-spends, retry storms, and mid-tx crashes.
              </p>
            </div>
          </div>
        );

      case 'FAILURE_DETECTED':
        return (
          <div className="p-4 rounded-lg bg-rose-950/40 border border-rose-700 flex items-center justify-between text-xs font-mono ring-1 ring-rose-500/50">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 animate-bounce shrink-0" />
              <div>
                <span className="font-bold text-rose-300">STAGE 5: CRITICAL VULNERABILITY DETECTED & VERIFIER REJECTION</span>
                <p className="text-rose-200 text-[11px] font-sans mt-0.5">
                  Adversarial Red-Team discovered a race condition! Two concurrent ₹800 transfers both succeeded with ₹1000 balance! Independent Verifier rejected baseline. Escalating to Repair Agent...
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsCodeModalOpen(true)}
              className="px-3 py-1.5 rounded bg-rose-900/80 text-rose-200 border border-rose-700 hover:bg-rose-800 transition-colors cursor-pointer shrink-0 text-xs"
            >
              Inspect Exploit Diff
            </button>
          </div>
        );

      case 'REPAIRING':
        return (
          <div className="p-4 rounded-lg bg-purple-950/40 border border-purple-700 flex items-center gap-3 text-xs font-mono">
            <Wrench className="w-5 h-5 text-purple-400 animate-spin shrink-0" />
            <div>
              <span className="font-bold text-purple-300">STAGE 6: REPAIR AGENT ACTIVE (AUTONOMOUS PATCH SYNTHESIS)</span>
              <p className="text-purple-200 text-[11px] font-sans mt-0.5">
                Diagnosing race condition root cause. Synthesizing patch: injecting per-wallet serializable mutex locks, atomic check-and-set idempotency store, and two-phase rollback handlers.
              </p>
            </div>
          </div>
        );

      case 'RETESTING':
        return (
          <div className="p-4 rounded-lg bg-amber-950/30 border border-amber-800/80 flex items-center gap-3 text-xs font-mono">
            <Flame className="w-5 h-5 text-amber-400 animate-pulse shrink-0" />
            <div>
              <span className="font-bold text-amber-300">STAGE 7: RETESTING PATCHED WALLET ENGINE</span>
              <p className="text-slate-300 text-[11px] font-sans mt-0.5">
                Adversarial red-team is re-executing all 50 attack vectors against the repaired WalletEngine v1.1 to confirm complete exploit neutralization.
              </p>
            </div>
          </div>
        );

      case 'VERIFYING':
        return (
          <div className="p-4 rounded-lg bg-blue-950/30 border border-blue-800/80 flex items-center gap-3 text-xs font-mono">
            <ShieldCheck className="w-5 h-5 text-blue-400 animate-pulse shrink-0" />
            <div>
              <span className="font-bold text-blue-300">STAGE 8: INDEPENDENT VERIFIER AUDIT & SIGN-OFF</span>
              <p className="text-slate-300 text-[11px] font-sans mt-0.5">
                Blue-team independent auditor inspecting ledger logs, confirming 0 money was created or destroyed (Delta = 0.00), and sealing the cryptographic Evidence Dossier.
              </p>
            </div>
          </div>
        );

      case 'ACCEPTED':
        return (
          <div className="p-4 rounded-lg bg-emerald-950/40 border border-emerald-700 flex flex-wrap items-center justify-between gap-3 text-xs font-mono ring-1 ring-emerald-500/50">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-300 text-sm">🟢 FACTORY ACCEPTED (CERTIFIED COMPLIANT)</span>
                  <span className="text-[10px] text-emerald-400 border border-emerald-700 bg-emerald-900/40 px-1.5 py-0.2 rounded font-bold">
                    50/50 TESTS PASSED
                  </span>
                </div>
                <p className="text-emerald-100 text-[11px] font-sans mt-0.5">
                  Autonomous production loop concluded: Build ➔ Attack ➔ Exploit Detected ➔ Auto-Repaired ➔ Retested ➔ Independently Verified. 0 double-spends, 0 negative balances, 100% money conserved!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsExportModalOpen(true)}
                className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md cursor-pointer text-xs flex items-center gap-1.5"
              >
                <span>Export Audit Report</span>
              </button>
              <button
                onClick={() => setActiveTab('evidence')}
                className="px-3 py-1.5 rounded bg-emerald-900/80 text-emerald-200 border border-emerald-700 hover:bg-emerald-800 transition-colors cursor-pointer text-xs"
              >
                Inspect Evidence Ledger
              </button>
              <button
                onClick={() => setIsCodeModalOpen(true)}
                className="px-3 py-1.5 rounded bg-slate-900 text-slate-200 border border-slate-700 hover:bg-slate-800 transition-colors cursor-pointer text-xs"
              >
                View Repaired Code
              </button>
            </div>
          </div>
        );

      case 'REJECTED':
        return (
          <div className="p-4 rounded-lg bg-rose-950/40 border border-rose-700 flex items-center gap-3 text-xs font-mono">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <span className="font-bold text-rose-300">🔴 FACTORY REJECTED</span>
              <p className="text-rose-200 text-[11px] font-sans mt-0.5">
                Build could not be verified safe within allowed repair attempts. Invariants breached.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const auditReportData: AuditReportData = {
    jobId: orchestrator.getJobId(),
    task: orchestrator.getTask(),
    factoryState: state,
    generatedAt: new Date().toLocaleString(),
    metrics,
    agents,
    evidence,
    testResults: tests,
    logs,
    totalSystemLiquidityPaise: globalWalletEngine.getTotalSystemMoney(),
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans bg-factory-grid">
      {/* Top Navigation & State Bar */}
      <Header
        state={state}
        metrics={metrics}
        isRunning={isRunning}
        onRunDemo={handleRunDemo}
        onReset={handleReset}
        onOpenCode={() => setIsCodeModalOpen(true)}
        onOpenCustomTask={() => setIsTaskModalOpen(true)}
        onOpenExportReport={() => setIsExportModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-6">
        {/* Dynamic State Hero Banner */}
        {renderHeroBanner()}

        {/* Tab 1: Factory Pipeline */}
        {activeTab === 'pipeline' && (
          <div className="space-y-6">
            {/* Active Task Prompt Summary Strip */}
            <div className="p-3.5 rounded-lg border border-slate-800 bg-[#0d1424]/90 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2.5">
                <span className="text-slate-500 font-bold uppercase text-[10px]">INGRESS TASK:</span>
                <span className="text-slate-200 font-semibold truncate max-w-xl">
                  "{orchestrator.getTask()}"
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <button
                  onClick={() => setIsTaskModalOpen(true)}
                  className="text-cyan-400 hover:text-cyan-300 cursor-pointer font-bold"
                >
                  Edit Task Brief ➔
                </button>
                <span className="text-slate-700">|</span>
                <button
                  onClick={() => setIsCodeModalOpen(true)}
                  className="text-indigo-400 hover:text-indigo-300 cursor-pointer font-bold"
                >
                  View Synthesized Code ➔
                </button>
                <span className="text-slate-700">|</span>
                <button
                  onClick={() => setIsExportModalOpen(true)}
                  className="text-emerald-400 hover:text-emerald-300 cursor-pointer font-bold"
                >
                  Export Report ➔
                </button>
              </div>
            </div>

            {/* Visual 6-Agent Orchestration Graph */}
            <AgentPipeline
              agents={agents}
              currentState={state}
              onOpenCode={() => setIsCodeModalOpen(true)}
            />

            {/* Quick Summary Grid of Hackathon Value */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3.5 rounded-lg border border-slate-800 bg-[#0c1220]/70 space-y-1">
                <div className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Adversarial Red-Teaming</span>
                </div>
                <div className="text-slate-200 font-semibold">50 Automated Attack Vectors</div>
                <p className="text-[11px] text-slate-400 font-sans">
                  Attacks race conditions, duplicate retries, rounding leaks, and mid-tx network cutoffs.
                </p>
              </div>

              <div className="p-3.5 rounded-lg border border-slate-800 bg-[#0c1220]/70 space-y-1">
                <div className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-purple-400" />
                  <span>Autonomous Self-Repair</span>
                </div>
                <div className="text-slate-200 font-semibold">Diagnosis ➔ Patch ➔ Retest</div>
                <p className="text-[11px] text-slate-400 font-sans">
                  When the red team broke the naive code, the Repair Agent diagnosed the race condition and injected mutex locks.
                </p>
              </div>

              <div className="p-3.5 rounded-lg border border-slate-800 bg-[#0c1220]/70 space-y-1">
                <div className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Independent Evidence</span>
                </div>
                <div className="text-slate-200 font-semibold">Sealed Cryptographic Audit</div>
                <p className="text-[11px] text-slate-400 font-sans">
                  The Verifier does not trust builder claims. Every invariant has SHA-256 proof hashes.
                </p>
              </div>
            </div>

            {/* Live Developer Console Stream */}
            <LiveConsole logs={logs} />
          </div>
        )}

        {/* Tab 2: Adversarial Tests View */}
        {activeTab === 'tests' && (
          <AdversarialTestsView
            tests={tests}
            onTriggerManualAttack={() => setActiveTab('wallet')}
          />
        )}

        {/* Tab 3: Evidence Ledger View */}
        {activeTab === 'evidence' && (
          <EvidenceLedgerView
            evidence={evidence}
            jobId={orchestrator.getJobId()}
            onOpenExportReport={() => setIsExportModalOpen(true)}
          />
        )}

        {/* Tab 4: Decision Memory View */}
        {activeTab === 'decisions' && (
          <DecisionMemoryView />
        )}

        {/* Tab 5: Wallet Simulator & Attack Playground */}
        {activeTab === 'wallet' && (
          <WalletSimulatorView
            engine={globalWalletEngine}
            onRefresh={() => setWalletRefreshKey(prev => prev + 1)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#070b16] py-3 px-4 sm:px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">PocketForge AI</span>
            <span>·</span>
            <span>Build an AI Dark Factory Challenge (Pocketful Track)</span>
          </div>
          <div>
            <span>Hackathon Prototype & Simulation Testbed</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <CodeInspectorModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
        activePhase={codePhase}
      />

      <CustomTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        currentTask={orchestrator.getTask()}
        onApplyTask={handleApplyCustomTask}
      />

      <ExportAuditModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        reportData={auditReportData}
      />
    </div>
  );
}
