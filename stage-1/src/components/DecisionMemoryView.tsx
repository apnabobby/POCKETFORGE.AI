/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  HelpCircle,
  Search,
  BookOpen,
  GitCommit,
  GitPullRequest,
  AlertCircle,
  FileText,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  Database,
  Code2,
} from 'lucide-react';
import { DecisionRecord, EvidenceSource } from '../types/decisionMemory';
import { globalDecisionMemory } from '../services/decisionMemory';

export const DecisionMemoryView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeQueryText, setActiveQueryText] = useState<string>('Why do we use integer paise instead of floating-point numbers?');
  const [queryResult, setQueryResult] = useState(() => globalDecisionMemory.queryDecisions('Why do we use integer paise instead of floating-point numbers?'));
  const [selectedDecisionId, setSelectedDecisionId] = useState<string>('DEC-001');

  const suggestedQuestions = [
    'Why do we use integer paise instead of floating-point numbers?',
    'Why did we implement mutex locking instead of optimistic concurrency?',
    'Why is an idempotency key store required for transfers?',
    'Why do we need atomic snapshot rollbacks on mid-transaction crash?',
    'Why is the verification agent decoupled from the implementation agent?',
  ];

  const handleRunSearch = (queryText: string) => {
    setActiveQueryText(queryText);
    const result = globalDecisionMemory.queryDecisions(queryText);
    setQueryResult(result);
    if (result.matchedDecisions.length > 0) {
      setSelectedDecisionId(result.matchedDecisions[0].id);
    }
  };

  const getSourceIcon = (type: EvidenceSource['type']) => {
    switch (type) {
      case 'commit':
        return <GitCommit className="w-3.5 h-3.5 text-cyan-400" />;
      case 'pull_request':
        return <GitPullRequest className="w-3.5 h-3.5 text-purple-400" />;
      case 'issue':
        return <AlertCircle className="w-3.5 h-3.5 text-amber-400" />;
      case 'design_doc':
        return <FileText className="w-3.5 h-3.5 text-emerald-400" />;
      case 'discussion':
        return <MessageSquare className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  const selectedDecision = queryResult.matchedDecisions.find(d => d.id === selectedDecisionId) || queryResult.matchedDecisions[0];

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header Banner */}
      <div className="p-4 rounded-lg border border-slate-800 bg-[#0c1220]/90">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-semibold text-slate-200 tracking-wide uppercase font-mono">
                Decision Memory AI — Architectural Reasoning Engine
              </h2>
              <span className="text-[10px] text-emerald-400 border border-emerald-800/80 bg-emerald-950/40 px-2 py-0.5 rounded font-bold">
                OFFLINE COMPLIANT &bull; LOCAL DETERMINISTIC EVIDENCE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-sans">
              Understand not just <strong>WHAT</strong> the code does, but <strong>WHY</strong> the decision was made, alternatives rejected, and verified git/issue evidence.
            </p>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-3">
            <span>Evidence Corpus: <strong className="text-cyan-400">5 Sealed Records</strong></span>
            <span>&bull;</span>
            <span>Zero Network Dependency: <strong className="text-emerald-400">100%</strong></span>
          </div>
        </div>
      </div>

      {/* Query Search Bar */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && searchQuery.trim() && handleRunSearch(searchQuery)}
              placeholder="Ask a technical question (e.g. 'Why integer paise?' or 'Why mutex lock?')..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono shadow-inner"
            />
          </div>
          <button
            onClick={() => searchQuery.trim() && handleRunSearch(searchQuery)}
            className="px-4 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-md shadow-cyan-950/50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Search Decision Memory</span>
          </button>
        </div>

        {/* Suggested Queries */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
          <span className="text-slate-500 shrink-0">Sample Questions:</span>
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSearchQuery(q);
                handleRunSearch(q);
              }}
              className="px-2.5 py-1 rounded bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-cyan-300 hover:border-slate-700 transition-colors cursor-pointer shrink-0 font-sans"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Layout: Decisions on Left, Deep Explanation on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Matched Decisions List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Relevant Decisions ({queryResult.matchedDecisions.length})</span>
            <span className="text-cyan-400">{queryResult.retrievedEvidenceCount} Evidence Citations</span>
          </div>

          <div className="space-y-2.5">
            {queryResult.matchedDecisions.map((decision) => {
              const isSelected = selectedDecision?.id === decision.id;

              return (
                <div
                  key={decision.id}
                  onClick={() => setSelectedDecisionId(decision.id)}
                  className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-950/20 ring-1 ring-cyan-500/50 shadow-md'
                      : 'border-slate-800 bg-[#0d1424]/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-cyan-400 font-bold text-[11px]">{decision.id}</span>
                    <span className="text-[10px] text-emerald-400 border border-emerald-800/80 bg-emerald-950/40 px-1.5 py-0.2 rounded font-bold">
                      {decision.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-200 text-xs font-sans line-clamp-1">
                    {decision.topic}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-sans mt-1 line-clamp-2">
                    {decision.question}
                  </p>
                  <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                    <span>{decision.supportingEvidence.length} Sources</span>
                    <span className="text-cyan-400 font-sans font-semibold">Inspect Reasoning ➔</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Structured Explanation (8 cols) */}
        {selectedDecision && (
          <div className="lg:col-span-8 space-y-4">
            <div className="p-5 rounded-lg border border-slate-800 bg-[#0d1424]/90 space-y-5">
              {/* Question & Topic Header */}
              <div className="border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-[11px] uppercase mb-1">
                  <span>{selectedDecision.id}</span>
                  <span>&bull;</span>
                  <span>Impact: {selectedDecision.impactArea}</span>
                </div>
                <h3 className="text-base font-bold text-white font-sans">
                  {selectedDecision.question}
                </h3>
              </div>

              {/* 1. What Decision Was Made */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>1. What Decision Was Made</span>
                </div>
                <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/60 text-emerald-100 font-sans text-xs leading-relaxed">
                  {selectedDecision.decisionMade}
                </div>
              </div>

              {/* 2. Why It Was Made (Architectural Rationale) */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  <span>2. Why It Was Made (The Problem &amp; Invariants)</span>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-200 font-sans text-xs leading-relaxed space-y-2">
                  <p>{selectedDecision.whyMade}</p>
                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Protected Invariants:</span>
                    {selectedDecision.invariantsProtected.map((inv, i) => (
                      <span key={i} className="text-[10px] text-cyan-300 bg-cyan-950/60 border border-cyan-800 px-2 py-0.5 rounded font-mono">
                        {inv}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Alternatives Considered & Why Rejected */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <XCircle className="w-4 h-4" />
                  <span>3. Alternatives Considered &amp; Why They Were Rejected</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedDecision.alternativesConsidered.map((alt, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-rose-950/15 border border-rose-800/50 space-y-1.5">
                      <div className="font-bold text-rose-300 font-sans text-xs">
                        {alt.name}
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans">
                        {alt.description}
                      </p>
                      <div className="pt-1.5 border-t border-rose-900/40 text-[11px] text-rose-200/90 font-sans">
                        <strong className="text-rose-400 font-mono text-[10px] uppercase block">Why Rejected:</strong>
                        {alt.whyRejected}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Supporting Evidence Citations (Commits, PRs, Issues) */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <GitCommit className="w-4 h-4" />
                  <span>4. Supporting Evidence &amp; Citations</span>
                </div>
                <div className="space-y-2">
                  {selectedDecision.supportingEvidence.map((ev) => (
                    <div key={ev.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-2">
                          {getSourceIcon(ev.type)}
                          <span className="font-bold text-slate-200">{ev.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">{ev.date}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400">
                        <span>Ref: <strong className="text-cyan-400">{ev.reference}</strong></span>
                        <span>&bull;</span>
                        <span>Author: {ev.author}</span>
                      </div>
                      <pre className="p-2 rounded bg-slate-900 border border-slate-800 text-[10.5px] text-cyan-200/90 overflow-x-auto font-mono">
                        {ev.snippet}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
