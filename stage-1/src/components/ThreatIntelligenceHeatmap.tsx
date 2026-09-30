/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TestCaseResult, TestCategory } from '../types/factory';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Layers,
  Zap,
  Info,
  ChevronRight,
  TrendingUp,
  Crosshair,
} from 'lucide-react';

interface ThreatVectorProfile {
  category: TestCategory;
  name: string;
  shortCode: string;
  plannedCount: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  severityScore: number; // 1-10
  cweMapping: string;
  attackSurface: string;
  financialImpact: string;
  defenseMechanism: string;
}

export const THREAT_PROFILES: ThreatVectorProfile[] = [
  {
    category: 'DOUBLE_SPENDING',
    name: 'Concurrent Double-Spend',
    shortCode: 'DS-RACE',
    plannedCount: 5,
    severity: 'CRITICAL',
    severityScore: 9.8,
    cweMapping: 'CWE-362 (Race Condition)',
    attackSurface: 'Parallel Transfer Ingress',
    financialImpact: 'Balance depletion into negative, arbitrary currency inflation',
    defenseMechanism: 'Per-wallet mutex lock queue (ordered sender -> receiver)',
  },
  {
    category: 'FAILURE_MID_TX',
    name: 'Mid-Transaction Crash / Atomicity',
    shortCode: 'ATOM-CRASH',
    plannedCount: 5,
    severity: 'CRITICAL',
    severityScore: 9.5,
    cweMapping: 'CWE-284 (Improper Access / Partial State)',
    attackSurface: 'Interrupted Ledger Write',
    financialImpact: 'Permanent destruction of funds (debited without credit)',
    defenseMechanism: 'Two-phase snapshot checkpoint & atomic rollback',
  },
  {
    category: 'MONEY_CONSERVATION',
    name: 'Closed-Loop Conservation Breach',
    shortCode: 'MONEY-SUM',
    plannedCount: 5,
    severity: 'CRITICAL',
    severityScore: 9.2,
    cweMapping: 'CWE-682 (Incorrect Calculation)',
    attackSurface: 'High-Volume Ring Transfers',
    financialImpact: 'Systemic liquidity drift (∑ Balances ≠ Constant)',
    defenseMechanism: 'Continuous pre/post transaction SHA-256 state checksum',
  },
  {
    category: 'DUPLICATE_RETRY',
    name: 'Dropped ACK Retry Replay',
    shortCode: 'RETRY-STORM',
    plannedCount: 5,
    severity: 'HIGH',
    severityScore: 8.4,
    cweMapping: 'CWE-294 (Authentication/Command Replay)',
    attackSurface: 'Client Retransmission Boundary',
    financialImpact: 'Unintended duplicate billing of customers',
    defenseMechanism: 'Check-and-set idempotency store returning cached receipts',
  },
  {
    category: 'CONCURRENT_TRANSFERS',
    name: 'Interleaved Multi-Wallet Contention',
    shortCode: 'BURST-CONTENT',
    plannedCount: 5,
    severity: 'HIGH',
    severityScore: 8.0,
    cweMapping: 'CWE-820 (Missing Synchronization)',
    attackSurface: 'Multi-User Concurrent Routing',
    financialImpact: 'Deadlocks, transaction timeouts, inconsistent state',
    defenseMechanism: 'Strict linearizable serialization per wallet pair',
  },
  {
    category: 'REQUEST_STORM',
    name: '10x Burst Idempotency Flooding',
    shortCode: 'IDEMP-FLOOD',
    plannedCount: 10,
    severity: 'HIGH',
    severityScore: 7.6,
    cweMapping: 'CWE-400 (Resource Exhaustion)',
    attackSurface: 'API Gateway Ingress',
    financialImpact: 'Duplicate execution window under load spikes',
    defenseMechanism: 'Synchronous atomic key check with short-circuit return',
  },
  {
    category: 'ROUNDING',
    name: 'Micro-Unit IEEE-754 Precision Drift',
    shortCode: 'FLOAT-ROUND',
    plannedCount: 10,
    severity: 'MEDIUM',
    severityScore: 6.8,
    cweMapping: 'CWE-1335 (Floating Point Inaccuracy)',
    attackSurface: 'Minor Unit Decimal Boundary',
    financialImpact: 'Sub-cent fractional leakage accumulating over time',
    defenseMechanism: 'Strict integer minor units (paise/cents) rejection of floats',
  },
  {
    category: 'INSUFFICIENT_BALANCE',
    name: 'Negative Balance / Overdraft Probe',
    shortCode: 'OVERDRAFT',
    plannedCount: 5,
    severity: 'MEDIUM',
    severityScore: 6.2,
    cweMapping: 'CWE-839 (Numeric Range Comparison)',
    attackSurface: 'Validation Gatekeeper',
    financialImpact: 'Unauthorized credit expansion beyond user reserves',
    defenseMechanism: 'Pre-flight integer balance invariant verification',
  },
];

interface ThreatIntelligenceHeatmapProps {
  tests: TestCaseResult[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const ThreatIntelligenceHeatmap: React.FC<ThreatIntelligenceHeatmapProps> = ({
  tests,
  selectedCategory,
  onSelectCategory,
}) => {
  const [hoveredProfile, setHoveredProfile] = useState<ThreatVectorProfile | null>(null);

  // Calculate real-time stats
  const totalTestsExecuted = tests.length;
  const totalFailed = tests.filter(t => t.status === 'FAIL').length;
  const totalPassed = tests.filter(t => t.status === 'PASS').length;

  const getVectorStats = (cat: TestCategory, plannedCount: number) => {
    const executed = tests.filter(t => t.category === cat);
    const count = executed.length;
    const passed = executed.filter(t => t.status === 'PASS').length;
    const failed = executed.filter(t => t.status === 'FAIL').length;
    const coveragePct = plannedCount > 0 ? Math.min(100, Math.round((count / plannedCount) * 100)) : 0;
    
    // Status color calculation
    let health: 'UNTESTED' | 'CRITICAL_FAIL' | 'PARTIAL_PASS' | 'SECURED' = 'UNTESTED';
    if (count > 0) {
      if (failed > 0) health = 'CRITICAL_FAIL';
      else if (coveragePct === 100) health = 'SECURED';
      else health = 'PARTIAL_PASS';
    }

    return { count, passed, failed, coveragePct, health };
  };

  const getHeatmapColor = (
    severityScore: number,
    health: 'UNTESTED' | 'CRITICAL_FAIL' | 'PARTIAL_PASS' | 'SECURED',
    isSelected: boolean
  ) => {
    if (health === 'CRITICAL_FAIL') {
      return {
        bg: isSelected ? 'bg-rose-900/60 ring-2 ring-rose-400' : 'bg-rose-950/40 hover:bg-rose-900/40 border-rose-700/80',
        text: 'text-rose-300',
        badge: 'bg-rose-900/80 text-rose-200 border-rose-600',
        intensity: 'animate-pulse border-rose-600',
        statusLabel: 'BREACH DETECTED',
      };
    }
    if (health === 'SECURED') {
      return {
        bg: isSelected ? 'bg-emerald-950/60 ring-2 ring-emerald-400' : 'bg-[#0d1f1c]/70 hover:bg-emerald-950/40 border-emerald-700/60',
        text: 'text-emerald-300',
        badge: 'bg-emerald-950 text-emerald-300 border-emerald-800',
        intensity: 'border-emerald-600/50',
        statusLabel: 'HARDENED & VERIFIED',
      };
    }
    if (health === 'PARTIAL_PASS') {
      return {
        bg: isSelected ? 'bg-amber-950/50 ring-2 ring-amber-400' : 'bg-amber-950/20 hover:bg-amber-950/30 border-amber-700/50',
        text: 'text-amber-300',
        badge: 'bg-amber-950 text-amber-300 border-amber-800',
        intensity: 'border-amber-600/50',
        statusLabel: 'IN PROGRESS',
      };
    }
    // Untested - heat by inherent severity
    if (severityScore >= 9.0) {
      return {
        bg: isSelected ? 'bg-slate-900 ring-2 ring-cyan-400' : 'bg-slate-900/70 hover:bg-slate-850 border-slate-800',
        text: 'text-slate-300',
        badge: 'bg-rose-950/40 text-rose-300 border-rose-900',
        intensity: 'border-slate-700',
        statusLabel: 'STANDBY',
      };
    }
    return {
      bg: isSelected ? 'bg-slate-900 ring-2 ring-cyan-400' : 'bg-slate-900/50 hover:bg-slate-850 border-slate-800',
      text: 'text-slate-400',
      badge: 'bg-slate-800 text-slate-300 border-slate-700',
      intensity: 'border-slate-800',
      statusLabel: 'STANDBY',
    };
  };

  const activeFocusProfile = hoveredProfile || THREAT_PROFILES.find(p => p.category === selectedCategory) || THREAT_PROFILES[0];
  const activeFocusStats = getVectorStats(activeFocusProfile.category, activeFocusProfile.plannedCount);

  return (
    <div className="border border-slate-800 rounded-xl bg-[#090d19]/95 overflow-hidden font-mono shadow-2xl space-y-4 p-4 sm:p-5">
      {/* Header and Telemetry */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
              Threat Intelligence Heatmap &amp; Vector Coverage
              <span className="text-[10px] text-cyan-300 border border-cyan-800/80 bg-cyan-950/40 px-2 py-0.5 rounded font-mono">
                50-VECTOR MATRIX
              </span>
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 font-sans mt-0.5">
            Severity-weighted vulnerability topology mapping CWE vectors against the wallet state engine.
          </p>
        </div>

        {/* Global Ingress Counters */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900/80 border border-slate-800">
            <span className="text-slate-500">COVERAGE:</span>
            <span className="font-bold text-cyan-400">
              {Math.min(100, Math.round((totalTestsExecuted / 50) * 100))}% ({totalTestsExecuted}/50)
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900/80 border border-slate-800">
            <span className="text-slate-500">FAILS:</span>
            <span className={`font-bold ${totalFailed > 0 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
              {totalFailed}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900/80 border border-slate-800">
            <span className="text-slate-500">DEFENSES:</span>
            <span className="font-bold text-emerald-400">
              {totalPassed} PASS
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Heatmap Tiles on Left, Threat Profile Inspector on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Heatmap Grid (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
              Attack Surface Vectors (Click tile to filter test results below)
            </span>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-rose-500" /> Critical / Fail</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-amber-500" /> High</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-500" /> Verified Pass</span>
            </div>
          </div>

          {/* 8 Vector Heatmap Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {THREAT_PROFILES.map((profile) => {
              const stats = getVectorStats(profile.category, profile.plannedCount);
              const isSelected = selectedCategory === profile.category;
              const styling = getHeatmapColor(profile.severityScore, stats.health, isSelected);

              return (
                <div
                  key={profile.category}
                  onClick={() => onSelectCategory(isSelected ? 'ALL' : profile.category)}
                  onMouseEnter={() => setHoveredProfile(profile)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between h-[120px] ${styling.bg} ${styling.intensity}`}
                >
                  {/* Top: ShortCode & Severity badge */}
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                        {profile.shortCode}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded border font-bold ${styling.badge}`}>
                        {profile.severityScore.toFixed(1)} / 10
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-100 font-sans line-clamp-1 leading-snug">
                      {profile.name}
                    </h4>
                    <span className="text-[9.5px] text-slate-400 line-clamp-1 font-mono">
                      {profile.cweMapping.split(' ')[0]}
                    </span>
                  </div>

                  {/* Bottom: Progress & Coverage */}
                  <div className="space-y-1 pt-2 border-t border-slate-800/60">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 font-mono">
                        {stats.count}/{profile.plannedCount} run
                      </span>
                      <span className={`font-bold ${styling.text}`}>
                        {stats.coveragePct}%
                      </span>
                    </div>
                    {/* Coverage Bar */}
                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          stats.failed > 0
                            ? 'bg-rose-500'
                            : stats.health === 'SECURED'
                            ? 'bg-emerald-400'
                            : stats.count > 0
                            ? 'bg-amber-400'
                            : 'bg-slate-700'
                        }`}
                        style={{ width: `${stats.coveragePct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Filter Reset */}
          {selectedCategory !== 'ALL' && (
            <div className="flex items-center justify-between text-xs px-2 py-1.5 bg-cyan-950/30 border border-cyan-800/60 rounded-md">
              <span className="text-cyan-300 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" /> Filtering test suite by vector: <strong>{selectedCategory}</strong>
              </span>
              <button
                onClick={() => onSelectCategory('ALL')}
                className="text-cyan-400 hover:text-white underline cursor-pointer text-[11px]"
              >
                Clear Vector Filter (Show All 50)
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Deep Threat Vector Profile Inspector (4 cols) */}
        <div className="lg:col-span-4 p-4 rounded-lg border border-slate-800 bg-[#0d1424]/90 flex flex-col justify-between space-y-3">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-3 h-3" /> Threat Profile Inspector
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                activeFocusProfile.severity === 'CRITICAL'
                  ? 'bg-rose-950 text-rose-300 border-rose-800'
                  : activeFocusProfile.severity === 'HIGH'
                  ? 'bg-amber-950 text-amber-300 border-amber-800'
                  : 'bg-blue-950 text-blue-300 border-blue-800'
              }`}>
                {activeFocusProfile.severity} ({activeFocusProfile.severityScore}/10)
              </span>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white font-sans">
                {activeFocusProfile.name}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                CWE Standard: <span className="text-cyan-300">{activeFocusProfile.cweMapping}</span>
              </p>
            </div>

            {/* Attack Surface & Impact */}
            <div className="space-y-2 pt-2 border-t border-slate-800 text-[11px]">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Attack Surface:</span>
                <span className="text-slate-200 font-sans">{activeFocusProfile.attackSurface}</span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Potential Financial Impact:</span>
                <span className="text-rose-300 font-sans leading-tight block">{activeFocusProfile.financialImpact}</span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Active Shield Defense:</span>
                <span className="text-emerald-300 font-sans leading-tight block">{activeFocusProfile.defenseMechanism}</span>
              </div>
            </div>
          </div>

          {/* Realtime Telemetry Status */}
          <div className="pt-2.5 border-t border-slate-800/80 bg-slate-950/60 p-2.5 rounded-md space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Execution Status:</span>
              <span className={`font-bold ${
                activeFocusStats.failed > 0
                  ? 'text-rose-400'
                  : activeFocusStats.count > 0
                  ? 'text-emerald-400'
                  : 'text-slate-500'
              }`}>
                {activeFocusStats.health}
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>Tests Executed:</span>
              <span className="text-slate-200 font-mono font-bold">
                {activeFocusStats.count} / {activeFocusProfile.plannedCount}
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>Pass Rate:</span>
              <span className="text-slate-200 font-mono font-bold">
                {activeFocusStats.count > 0
                  ? `${Math.round((activeFocusStats.passed / activeFocusStats.count) * 100)}%`
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
