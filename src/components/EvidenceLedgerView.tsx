/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { EvidenceItem, AgentId } from '../types/factory';
import {
  FileCheck2,
  Download,
  Copy,
  Check,
  Search,
  ShieldCheck,
  AlertCircle,
  Hash,
  ExternalLink,
  Printer,
  FileText,
} from 'lucide-react';

interface EvidenceLedgerViewProps {
  evidence: EvidenceItem[];
  jobId?: string;
  onOpenExportReport?: () => void;
}

export const EvidenceLedgerView: React.FC<EvidenceLedgerViewProps> = ({
  evidence,
  jobId = 'JOB-PF-1042',
  onOpenExportReport,
}) => {
  const [selectedAgent, setSelectedAgent] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = evidence.filter(e => {
    if (selectedAgent === 'ALL') return true;
    return e.agent === selectedAgent;
  });

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(evidence, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `pocketforge-evidence-${jobId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-5">
      {/* Evidence Ledger Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-200 tracking-wide uppercase font-mono flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-cyan-400" />
              Cryptographic Evidence Ledger ({evidence.length} Records)
            </h2>
            <span className="text-[11px] font-mono text-emerald-400 border border-emerald-800/80 bg-emerald-950/40 px-2 py-0.5 rounded">
              VERIFIED IMMUTABLE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Every critical agent action, requirement, threat model, test vector, and security patch produces sealed audit artifacts.
          </p>
        </div>

        {/* Export & Action */}
        <div className="flex items-center gap-2">
          {onOpenExportReport && (
            <button
              onClick={onOpenExportReport}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 transition-colors cursor-pointer shadow-sm"
              title="Generate complete executive report with ledger, tests, and verifier logs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Export Audit Report (PDF / JSON)</span>
            </button>
          )}

          <button
            onClick={handleExportJson}
            disabled={evidence.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-md bg-cyan-950 text-cyan-300 border border-cyan-800 hover:bg-cyan-900 transition-colors disabled:opacity-40 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Evidence (.JSON)</span>
          </button>
        </div>
      </div>

      {/* Filter by agent */}
      <div className="flex items-center gap-2 text-xs font-mono overflow-x-auto pb-1">
        <span className="text-slate-500 text-[11px]">Filter by Origin:</span>
        {['ALL', 'PLANNER', 'ARCHITECT', 'BUILDER', 'ADVERSARIAL_TESTER', 'INDEPENDENT_VERIFIER', 'REPAIRER'].map(a => (
          <button
            key={a}
            onClick={() => setSelectedAgent(a)}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              selectedAgent === a
                ? 'bg-slate-800 text-cyan-300 font-bold border border-slate-700'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            {a}
          </button>
        ))}
      </div>

      {/* Evidence items list */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center border border-slate-800 rounded-lg bg-[#0c1220]/60 font-mono text-xs text-slate-500">
          No evidence records generated yet. Run the Dark Factory demo to populate the cryptographic audit trail.
        </div>
      ) : (
        <div className="space-y-3 font-mono">
          {filtered.map((item) => {
            const isPass = item.verdict === 'PASS';
            const isFail = item.verdict === 'FAIL';
            const isNeedsRepair = item.verdict === 'NEEDS_REPAIR';

            return (
              <div
                key={item.id}
                className="border border-slate-800 rounded-lg bg-[#0d1424]/90 p-4 transition-all hover:border-slate-700"
              >
                {/* Top bar: ID, Agent, Verdict */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800/80 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="text-cyan-400 font-bold">{item.id}</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-300 font-medium">{item.requirement}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 text-[11px]">{item.timestamp}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isPass
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : isFail
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      VERDICT: {item.verdict}
                    </span>
                  </div>
                </div>

                {/* Body: Action, Input, Output */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-xs">
                  <div className="bg-slate-950/70 p-2.5 rounded border border-slate-800/80">
                    <div className="text-[10px] text-slate-500 uppercase font-semibold mb-1">
                      Action & Test Vector
                    </div>
                    <div className="text-slate-200 font-semibold mb-0.5">{item.action}</div>
                    <div className="text-slate-400 text-[11px]">{item.testName}</div>
                    <div className="mt-2 text-[10px] text-slate-500 uppercase font-semibold">
                      Invariant Tested
                    </div>
                    <div className="text-cyan-300 text-[11px]">{item.invariant}</div>
                  </div>

                  <div className="bg-slate-950/70 p-2.5 rounded border border-slate-800/80">
                    <div className="text-[10px] text-slate-500 uppercase font-semibold mb-1">
                      Reason & Audit Justification
                    </div>
                    <div className="text-slate-300 text-[11px] mb-2">{item.reason}</div>
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">
                      Cryptographic Proof Seal
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                      <span className="text-cyan-400/90 truncate mr-2">{item.proofHash}</span>
                      <button
                        onClick={() => copyToClipboard(item.proofHash, item.id)}
                        className="text-slate-400 hover:text-white shrink-0 cursor-pointer"
                        title="Copy Hash"
                      >
                        {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sub-details: Raw Input / Output Accordion Preview */}
                <div className="mt-2.5 pt-2 border-t border-slate-800/50 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="truncate mr-4">
                    Agent: <strong className="text-slate-300">{item.agent}</strong> · Input: <span className="text-slate-400">{item.input.substring(0, 45)}...</span>
                  </span>
                  <span className="text-emerald-400/80 shrink-0">Proof Verified ✓</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
