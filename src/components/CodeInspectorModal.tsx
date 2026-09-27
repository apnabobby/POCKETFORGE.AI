/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { VULNERABLE_CODE_SNIPPET, REPAIRED_CODE_SNIPPET } from '../services/factoryOrchestrator';
import { Code, X, ShieldAlert, ShieldCheck, Check, Copy } from 'lucide-react';

interface CodeInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePhase?: 'vulnerable' | 'repaired';
}

export const CodeInspectorModal: React.FC<CodeInspectorModalProps> = ({
  isOpen,
  onClose,
  activePhase = 'repaired',
}) => {
  const [viewMode, setViewMode] = useState<'diff' | 'vulnerable' | 'repaired'>('diff');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0b0f1d] border border-slate-700 rounded-xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-mono">
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-[#0e1424] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Code className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-100 text-sm">
              Code Inspector: Autonomous Synthesis & Security Patch Diff
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-900 rounded p-1 border border-slate-800 text-xs">
              <button
                onClick={() => setViewMode('diff')}
                className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                  viewMode === 'diff' ? 'bg-slate-800 text-cyan-300 font-bold' : 'text-slate-400'
                }`}
              >
                Side-by-Side Diff
              </button>
              <button
                onClick={() => setViewMode('vulnerable')}
                className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                  viewMode === 'vulnerable' ? 'bg-rose-950 text-rose-300 font-bold' : 'text-slate-400'
                }`}
              >
                Vulnerable v1.0
              </button>
              <button
                onClick={() => setViewMode('repaired')}
                className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                  viewMode === 'repaired' ? 'bg-emerald-950 text-emerald-300 font-bold' : 'text-slate-400'
                }`}
              >
                Repaired v1.1
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white cursor-pointer ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 text-xs space-y-4">
          {/* Explanation Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-800/60 text-rose-200">
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Agent 3 (Builder) Initial Flaw</span>
              </div>
              <p className="text-[11px] text-rose-300/90 font-sans">
                The initial code had a non-atomic balance check with simulated I/O delay before debiting. Simultaneous requests read stale balances, allowing Alice to double-spend ₹800 twice from a ₹1000 balance!
              </p>
            </div>

            <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/60 text-emerald-200">
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Agent 6 (Repair) Synthesized Fix</span>
              </div>
              <p className="text-[11px] text-emerald-300/90 font-sans">
                The Repair agent injected fine-grained serializable mutex locks per wallet, added an atomic check-and-set idempotency store, enforced integer minor units (paise), and added automated rollback checkpoints.
              </p>
            </div>
          </div>

          {/* Code Viewer Container */}
          {viewMode === 'diff' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="px-3 py-1.5 bg-rose-950/40 border border-rose-800/80 rounded-t text-rose-300 font-bold text-[11px] flex items-center justify-between">
                  <span>BASELINE V1.0 (VULNERABLE)</span>
                  <span className="text-[10px] text-rose-400 font-normal">Race Condition Present</span>
                </div>
                <pre className="p-4 bg-slate-950 border border-slate-800 rounded-b overflow-x-auto text-[11px] text-rose-200/90 leading-relaxed max-h-[380px]">
                  {VULNERABLE_CODE_SNIPPET}
                </pre>
              </div>

              <div>
                <div className="px-3 py-1.5 bg-emerald-950/40 border border-emerald-800/80 rounded-t text-emerald-300 font-bold text-[11px] flex items-center justify-between">
                  <span>SECURITY PATCH V1.1 (REPAIRED)</span>
                  <span className="text-[10px] text-emerald-400 font-normal">Mutex Lock + Idempotency</span>
                </div>
                <pre className="p-4 bg-slate-950 border border-slate-800 rounded-b overflow-x-auto text-[11px] text-emerald-200/90 leading-relaxed max-h-[380px]">
                  {REPAIRED_CODE_SNIPPET}
                </pre>
              </div>
            </div>
          ) : viewMode === 'vulnerable' ? (
            <div>
              <pre className="p-4 bg-slate-950 border border-slate-800 rounded text-rose-200 leading-relaxed overflow-x-auto max-h-[440px]">
                {VULNERABLE_CODE_SNIPPET}
              </pre>
            </div>
          ) : (
            <div>
              <pre className="p-4 bg-slate-950 border border-slate-800 rounded text-emerald-200 leading-relaxed overflow-x-auto max-h-[440px]">
                {REPAIRED_CODE_SNIPPET}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-[#0e1424] border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Invariants: Zero Double Spending · Conservation of Total Money · Zero Float Drift</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer font-sans"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
