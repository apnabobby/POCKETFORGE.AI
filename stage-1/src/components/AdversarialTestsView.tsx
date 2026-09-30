/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TestCaseResult, TestCategory } from '../types/factory';
import { ThreatIntelligenceHeatmap } from './ThreatIntelligenceHeatmap';
import {
  Flame,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  ShieldCheck,
  Zap,
  Activity,
} from 'lucide-react';

interface AdversarialTestsViewProps {
  tests: TestCaseResult[];
  onTriggerManualAttack?: (category: TestCategory) => void;
}

export const AdversarialTestsView: React.FC<AdversarialTestsViewProps> = ({
  tests,
  onTriggerManualAttack,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories: { key: TestCategory | 'ALL'; title: string; desc: string }[] = [
    { key: 'ALL', title: 'All Vectors (50)', desc: 'Full automated red-team battery' },
    { key: 'DOUBLE_SPENDING', title: 'Double Spend', desc: 'Parallel 2x 80% balance debit race condition' },
    { key: 'DUPLICATE_RETRY', title: 'Duplicate Retry', desc: 'Simulated dropped ACK & 5x idempotency storm' },
    { key: 'CONCURRENT_TRANSFERS', title: 'Concurrency', desc: 'Interleaved multi-wallet high volume stress' },
    { key: 'ROUNDING', title: 'Rounding / Minor Units', desc: 'Micro-paise non-float precision invariants' },
    { key: 'INSUFFICIENT_BALANCE', title: 'Insufficient Funds', desc: 'Overdraft penetration and negative balance block' },
    { key: 'FAILURE_MID_TX', title: 'Atomicity / Mid-Tx Crash', desc: 'Fault injection between debit and credit' },
    { key: 'REQUEST_STORM', title: 'Request Storm', desc: '10x concurrent burst replay with identical key' },
    { key: 'MONEY_CONSERVATION', title: 'Money Conservation', desc: 'Closed-loop multi-hop total money sum theorem' },
  ];

  // Category stats calculation
  const getCategoryStats = (cat: TestCategory) => {
    const catTests = tests.filter(t => t.category === cat);
    const passed = catTests.filter(t => t.status === 'PASS').length;
    const failed = catTests.filter(t => t.status === 'FAIL').length;
    return { total: catTests.length, passed, failed };
  };

  const filteredTests = tests.filter(test => {
    const matchesCategory = selectedCategory === 'ALL' || test.category === selectedCategory;
    const matchesSearch =
      test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.attackVector.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-5">
      {/* 1. Threat Intelligence Heatmap Component */}
      <ThreatIntelligenceHeatmap
        tests={tests}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
      />

      {/* Overview header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-200 tracking-wide uppercase font-mono flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            Adversarial Test Execution Log ({filteredTests.length} Tests)
          </h2>
          <p className="text-xs text-slate-400">
            Automated red-team agents bombard the wallet service with race conditions, retry storms, and precision attacks.
          </p>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search 50 attack vectors..."
              className="bg-slate-900 border border-slate-700/80 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 w-56 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Category Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-2.5">
        {categories.filter(c => c.key !== 'ALL').map(cat => {
          const stats = getCategoryStats(cat.key as TestCategory);
          const hasFailed = stats.failed > 0;
          const hasRun = stats.total > 0;
          const isSelected = selectedCategory === cat.key;

          return (
            <div
              key={cat.key}
              onClick={() => setSelectedCategory(isSelected ? 'ALL' : cat.key)}
              className={`p-3 rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? 'border-cyan-500 bg-cyan-950/20'
                  : hasFailed
                  ? 'border-rose-700/80 bg-rose-950/20'
                  : hasRun
                  ? 'border-emerald-800/80 bg-emerald-950/15'
                  : 'border-slate-800 bg-[#0c1220]/70'
              } hover:border-slate-700`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-200">{cat.title}</span>
                {hasRun ? (
                  hasFailed ? (
                    <span className="text-[11px] font-mono text-rose-400 font-bold flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> {stats.failed} FAIL
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> PASS
                    </span>
                  )
                ) : (
                  <span className="text-[11px] font-mono text-slate-500">PENDING</span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1">{cat.desc}</p>
              <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>Total: {stats.total} runs</span>
                <span className={hasFailed ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                  {stats.passed}/{stats.total} passing
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Category Filter Pills / Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono">
        <span className="text-slate-500 text-[11px] mr-1 flex items-center gap-1">
          <Filter className="w-3 h-3" /> Filter:
        </span>
        {categories.map(c => (
          <button
            key={c.key}
            onClick={() => setSelectedCategory(c.key)}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer shrink-0 ${
              selectedCategory === c.key
                ? 'bg-cyan-900/60 text-cyan-200 border border-cyan-700 font-semibold'
                : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            {c.title}
          </button>
        ))}
      </div>

      {/* Tests Results List */}
      <div className="border border-slate-800 rounded-lg overflow-hidden bg-[#0c1220]/80">
        <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-4">
            <span>SHOWING {filteredTests.length} TEST CASES</span>
            <span>·</span>
            <span>STATUS BREAKDOWN: {filteredTests.filter(t => t.status === 'PASS').length} Passed, {filteredTests.filter(t => t.status === 'FAIL').length} Failed</span>
          </div>
          <span>MONEY CONSERVATION CHECKS: ACTIVE</span>
        </div>

        {filteredTests.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-slate-500">
            No adversarial test results recorded yet. Click [RUN FACTORY DEMO] to execute the 50-attack suite.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60 max-h-[460px] overflow-y-auto font-mono text-xs">
            {filteredTests.map((test) => {
              const isPass = test.status === 'PASS';
              const isFail = test.status === 'FAIL';

              return (
                <div
                  key={test.id}
                  className={`p-3.5 transition-colors ${
                    isFail
                      ? 'bg-rose-950/20 hover:bg-rose-950/30'
                      : 'hover:bg-slate-850/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          isPass
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                        }`}>
                          {test.status}
                        </span>
                        <span className="text-slate-400 font-bold">{test.id}</span>
                        <span className="text-slate-200 font-semibold">{test.name}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans">{test.description}</p>
                      <div className="text-[11px] text-slate-500 flex items-center gap-3">
                        <span>Attack vector: <strong className="text-amber-400/90">{test.attackVector}</strong></span>
                        <span>·</span>
                        <span>Duration: {test.durationMs}ms</span>
                        <span>·</span>
                        <span>System Money Checksum: <strong className="text-cyan-400">₹{(test.finalSystemMoney / 100).toFixed(2)}</strong></span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className={`text-[11px] font-semibold ${
                        isPass ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {isPass ? 'INVARIANT VERIFIED' : 'CRITICAL BREACH'}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        {test.timestamp.split('T')[1]?.substring(0, 8)}
                      </div>
                    </div>
                  </div>

                  {/* Detail banner */}
                  <div className={`mt-2 p-2 rounded text-[11px] ${
                    isPass
                      ? 'bg-slate-900/60 text-slate-300 border border-slate-800'
                      : 'bg-rose-950/40 text-rose-200 border border-rose-800/80 font-semibold'
                  }`}>
                    {test.details}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
