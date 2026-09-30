/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sliders, X, Sparkles, Play, Check } from 'lucide-react';

interface CustomTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTask: string;
  onApplyTask: (task: string, triggerRun: boolean) => void;
}

export const CustomTaskModal: React.FC<CustomTaskModalProps> = ({
  isOpen,
  onClose,
  currentTask,
  onApplyTask,
}) => {
  const [taskInput, setTaskInput] = useState<string>(currentTask);

  if (!isOpen) return null;

  const presets = [
    {
      title: 'Decision Memory Inquiry: Integer Minor Units vs Floats',
      task: 'Retrieve technical decision rationale and historical git/issue evidence for why all wallet balances and operations use integer paise rather than floating-point IEEE-754 numbers.',
      badge: 'Decision Memory',
    },
    {
      title: 'Standard Venmo-Style Wallet Transfer (Default Challenge)',
      task: 'Build a wallet transfer system where users can safely transfer money with zero loss, race-condition immunity, and instant idempotency.',
      badge: 'Core Track',
    },
    {
      title: 'Fee-Splitting with Strict Integer Conservation',
      task: 'Implement fee splitting of 1.5% with minimum 10 paise fee ensuring total sender debit exactly matches receiver credit plus platform fee without integer truncation leakage.',
      badge: 'Advanced Math',
    },
    {
      title: 'Multi-Party Atomic Escrow & Timeout Rollback',
      task: 'Design an atomic multi-party escrow system where funds are held in state PENDING and auto-rollback to sender if confirmation packet drops within 300ms.',
      badge: 'State Machine',
    },
    {
      title: 'High-Throughput Batch Payout Swarm',
      task: 'Build a concurrent batch payout pipeline executing 50 simultaneous debit/credit transfers across multiple wallets with serializable isolation and zero double-spends.',
      badge: 'Concurrency',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0b0f1d] border border-slate-700 rounded-xl w-full max-w-2xl overflow-hidden font-mono shadow-2xl">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#0e1424] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-100 text-sm">
              Inject Custom Task into PocketForge Dark Factory
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          <div>
            <label className="text-slate-300 font-bold block mb-1">
              Software Engineering Task Brief:
            </label>
            <textarea
              rows={3}
              value={taskInput}
              onChange={e => setTaskInput(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:border-cyan-500 font-mono text-xs leading-relaxed"
              placeholder="Describe the financial software capability you want the dark factory to plan, code, attack, repair, and verify..."
            />
          </div>

          {/* Presets */}
          <div>
            <label className="text-slate-400 font-semibold uppercase text-[10px] block mb-2">
              Or Select a Curated Challenge Track Preset:
            </label>
            <div className="space-y-2">
              {presets.map((preset, i) => (
                <div
                  key={i}
                  onClick={() => setTaskInput(preset.task)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    taskInput === preset.task
                      ? 'border-cyan-500 bg-cyan-950/20'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-200 font-sans text-xs">
                      {preset.title}
                    </span>
                    <span className="text-[10px] text-cyan-400 border border-cyan-800/60 bg-cyan-950/50 px-1.5 py-0.2 rounded">
                      {preset.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans line-clamp-2">
                    {preset.task}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#0e1424] border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onApplyTask(taskInput, false);
                onClose();
              }}
              className="px-3 py-1.5 rounded bg-slate-800 border border-slate-700 text-slate-200 hover:text-white cursor-pointer"
            >
              Update Task Only
            </button>

            <button
              onClick={() => {
                onApplyTask(taskInput, true);
                onClose();
              }}
              className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-950/50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Deploy Task & Run Factory</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
