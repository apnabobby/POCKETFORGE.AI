/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  FactoryState,
  FactoryJobMetrics,
} from '../types/factory';
import {
  Play,
  RotateCcw,
  Code,
  FileText,
  Sliders,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';

interface HeaderProps {
  state: FactoryState;
  metrics: FactoryJobMetrics;
  isRunning: boolean;
  onRunDemo: () => void;
  onReset: () => void;
  onOpenCode: () => void;
  onOpenCustomTask: () => void;
  onOpenExportReport?: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  state,
  metrics,
  isRunning,
  onRunDemo,
  onReset,
  onOpenCode,
  onOpenCustomTask,
  onOpenExportReport,
  activeTab,
  setActiveTab,
}) => {
  // Helper to color state badge
  const getStateBadge = (st: FactoryState) => {
    switch (st) {
      case 'RECEIVED':
      case 'PLANNING':
      case 'ARCHITECTING':
      case 'BUILDING':
        return {
          bg: 'bg-cyan-950/60 border-cyan-800 text-cyan-300',
          dot: 'bg-cyan-400 animate-pulse',
          label: st,
        };
      case 'TESTING':
      case 'RETESTING':
        return {
          bg: 'bg-amber-950/60 border-amber-800 text-amber-300',
          dot: 'bg-amber-400 animate-ping',
          label: st,
        };
      case 'FAILURE_DETECTED':
        return {
          bg: 'bg-rose-950/60 border-rose-800 text-rose-300',
          dot: 'bg-rose-500 animate-ping',
          label: 'CRITICAL FAILURE DETECTED',
        };
      case 'REPAIRING':
        return {
          bg: 'bg-purple-950/60 border-purple-800 text-purple-300',
          dot: 'bg-purple-400 animate-pulse',
          label: 'AI REPAIR IN PROGRESS',
        };
      case 'VERIFYING':
        return {
          bg: 'bg-blue-950/60 border-blue-800 text-blue-300',
          dot: 'bg-blue-400 animate-pulse',
          label: 'INDEPENDENT VERIFICATION',
        };
      case 'ACCEPTED':
        return {
          bg: 'bg-emerald-950/60 border-emerald-800 text-emerald-300',
          dot: 'bg-emerald-400',
          label: 'FACTORY ACCEPTED ✅',
        };
      case 'REJECTED':
        return {
          bg: 'bg-rose-950/60 border-rose-800 text-rose-300',
          dot: 'bg-rose-500',
          label: 'FACTORY REJECTED ❌',
        };
      default:
        return {
          bg: 'bg-slate-900 border-slate-700 text-slate-300',
          dot: 'bg-slate-500',
          label: st,
        };
    }
  };

  const badge = getStateBadge(state);

  return (
    <header className="border-b border-slate-800/80 bg-[#0a0f1d]/90 backdrop-blur-md sticky top-0 z-40">
      {/* Top Bar: Brand, State & Main Action */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-600 via-indigo-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-950/50 border border-cyan-400/30">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white font-mono">
                DECISION MEMORY<span className="text-cyan-400">.AI</span>
              </span>
              <span className="text-[11px] font-semibold text-slate-400 border border-slate-700/60 rounded px-1.5 py-0.2 bg-slate-900/60">
                POCKETFORGE CORE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Why code was written: architectural reasoning, rejected alternatives, and proof.
            </p>
          </div>
        </div>

        {/* Center: Prominent Factory State Machine Indicator */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md border text-xs font-mono font-medium ${badge.bg}`}
          >
            <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
            <span>STATE: {badge.label}</span>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenCustomTask}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-slate-800/90 text-slate-200 border border-slate-700/80 hover:bg-slate-750 hover:text-white disabled:opacity-40 transition-colors cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>Task Brief</span>
          </button>

          <button
            onClick={onOpenCode}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-slate-800/90 text-slate-200 border border-slate-700/80 hover:bg-slate-750 hover:text-white transition-colors cursor-pointer"
          >
            <Code className="w-3.5 h-3.5 text-indigo-400" />
            <span>Code Diff</span>
          </button>

          {onOpenExportReport && (
            <button
              onClick={onOpenExportReport}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-cyan-950/80 text-cyan-200 border border-cyan-800 hover:bg-cyan-900 hover:text-white transition-colors cursor-pointer"
              title="Export complete audit dossier for judges"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export Audit</span>
            </button>
          )}

          <button
            onClick={onReset}
            disabled={isRunning}
            className="p-1.5 text-xs font-medium rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60 hover:text-white disabled:opacity-40 transition-colors cursor-pointer"
            title="Reset Factory"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onRunDemo}
            disabled={isRunning}
            className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-md tracking-wide transition-all shadow-md cursor-pointer ${
              isRunning
                ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50 border border-emerald-400/40 animate-pulse hover:animate-none'
            }`}
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'FACTORY EXECUTING...' : 'RUN FACTORY DEMO'}</span>
          </button>
        </div>
      </div>

      {/* Metrics & Sub-Bar */}
      <div className="border-t border-slate-800/60 bg-[#070b16]/70 px-4 sm:px-6 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
          {/* Real-time telemetry items */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">TESTS:</span>
              <span className="font-semibold text-slate-200">
                {metrics.testsPassed}/{metrics.testsExecuted}
              </span>
              {metrics.testsFailed > 0 && (
                <span className="text-rose-400 font-bold">({metrics.testsFailed} failed)</span>
              )}
            </div>

            <span className="text-slate-700">|</span>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">BUGS FOUND:</span>
              <span className={`font-semibold ${metrics.bugsDiscovered > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                {metrics.bugsDiscovered}
              </span>
            </div>

            <span className="text-slate-700">|</span>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">AUTO-REPAIRED:</span>
              <span className={`font-semibold ${metrics.bugsRepaired > 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
                {metrics.bugsRepaired}
              </span>
            </div>

            <span className="text-slate-700">|</span>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">CONSERVATION:</span>
              <span className="font-semibold text-emerald-400">
                {metrics.conservationIntegrityPercent.toFixed(1)}%
              </span>
            </div>

            <span className="text-slate-700">|</span>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">EVIDENCE:</span>
              <span className="font-semibold text-cyan-400">
                {metrics.evidenceGenerated} Items
              </span>
            </div>

            <span className="text-slate-700">|</span>

            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{metrics.runtimeSeconds}s</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-md border border-slate-800">
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`px-3 py-1 rounded text-xs transition-colors cursor-pointer ${
                activeTab === 'pipeline'
                  ? 'bg-slate-800 text-cyan-300 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Factory Pipeline
            </button>
            <button
              onClick={() => setActiveTab('tests')}
              className={`px-3 py-1 rounded text-xs transition-colors cursor-pointer ${
                activeTab === 'tests'
                  ? 'bg-slate-800 text-cyan-300 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Adversarial Attacks ({metrics.testsExecuted})
            </button>
            <button
              onClick={() => setActiveTab('evidence')}
              className={`px-3 py-1 rounded text-xs transition-colors cursor-pointer ${
                activeTab === 'evidence'
                  ? 'bg-slate-800 text-cyan-300 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Evidence Ledger ({metrics.evidenceGenerated})
            </button>
            <button
              onClick={() => setActiveTab('decisions')}
              className={`px-3 py-1 rounded text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'decisions'
                  ? 'bg-cyan-900/80 text-cyan-200 font-bold border border-cyan-700 shadow-sm'
                  : 'text-cyan-400 hover:text-cyan-200'
              }`}
            >
              <span>Decision Memory</span>
            </button>
            <button
              onClick={() => setActiveTab('wallet')}
              className={`px-3 py-1 rounded text-xs transition-colors cursor-pointer ${
                activeTab === 'wallet'
                  ? 'bg-slate-800 text-cyan-300 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Wallet Simulator
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
