/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Layers, ShieldCheck, Database, GitCommit, Lock, CheckCircle2 } from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  const invariants = [
    {
      title: '1. Conservation of Total Money Invariant',
      formula: '∑(Balance_u(t)) = ∑(Balance_u(0)) = Constant (₹18,500.00)',
      description: 'Money cannot be created out of nothing, nor destroyed by unhandled network crashes. Every single paise debited must equal the exact paise credited.',
      guarantee: 'Formally audited after every transaction and verified by Independent Verifier.',
    },
    {
      title: '2. Non-Negative Balance Invariant',
      formula: '∀ u ∈ Users, Balance_u(t) ≥ 0',
      description: 'Under zero circumstances may a user account balance drop below zero. Double-spend race conditions attempting parallel overdrafts are serialized and rejected.',
      guarantee: 'Enforced via per-wallet serializable mutex lock queues.',
    },
    {
      title: '3. Atomic Double-Entry Ledger Invariant',
      formula: 'Debit(Sender) + Credit(Recipient) = 0 (Two-Phase Commit)',
      description: 'Transactions are not treated as independent writes. If any network, database, or validation fault occurs between steps, the entire transaction is rolled back cleanly.',
      guarantee: 'State machine: PENDING ➔ HELD ➔ COMMITTED | ROLLED_BACK.',
    },
    {
      title: '4. Strict Idempotency Monotonicity',
      formula: 'Apply(Request_k, N times) ≡ Apply(Request_k, 1 time)',
      description: 'Network timeout storms, dropped ACKs, or client retry spam return the deterministic cached receipt without repeating financial balance mutation.',
      guarantee: 'Atomic check-and-set idempotency store with TTL hash verification.',
    },
    {
      title: '5. Integer Minor-Unit Non-Float Arithmetic',
      formula: 'Amount ∈ ℤ+ (Paise / Minor Units, 1 INR = 100 paise)',
      description: 'Strict prohibition of IEEE-754 floating-point numbers. Fractional rupee inputs are parsed into discrete minor units at gateway boundary to eliminate epsilon drift.',
      guarantee: 'Number.isInteger() gating and integer arithmetic throughout.',
    },
  ];

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Top Banner */}
      <div className="p-4 rounded-lg border border-slate-800 bg-[#0c1220]/90">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wide">
            System Architecture & Financial Invariant Proofs
          </h2>
        </div>
        <p className="text-xs text-slate-400 font-sans mt-1">
          Designed by Agent 2 (Architect) and verified by Agent 5 (Independent Verifier). These mathematical invariants govern all automated dark factory builds.
        </p>
      </div>

      {/* 5 Formal Invariants */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
          Core Mathematical Invariants (The Invariant Shield)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {invariants.map((inv, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border border-slate-800 bg-[#0e1424]/80 space-y-2 ${
                idx === 0 ? 'md:col-span-2 border-cyan-800/60 bg-cyan-950/15' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 text-sm font-sans">{inv.title}</span>
                <span className="text-[10px] text-emerald-400 border border-emerald-800/80 bg-emerald-950/40 px-1.5 py-0.5 rounded font-bold">
                  PROVEN
                </span>
              </div>

              <div className="p-2 rounded bg-slate-950 border border-slate-800/80 text-cyan-300 font-semibold text-xs">
                {inv.formula}
              </div>

              <p className="text-slate-400 font-sans text-xs">{inv.description}</p>

              <div className="pt-2 border-t border-slate-800/60 text-[11px] text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{inv.guarantee}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Architecture Schemas & State Machine Diagram */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Domain Data Schemas */}
        <div className="p-4 rounded-lg border border-slate-800 bg-[#0c1220]/90 space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-bold uppercase text-xs">
            <Database className="w-4 h-4" />
            <span>Database Domain Models</span>
          </div>

          <div className="space-y-2 text-[11px]">
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-300 font-bold block mb-1">TABLE: Wallets</span>
              <ul className="text-slate-400 space-y-0.5 pl-3 list-disc">
                <li><code className="text-cyan-400">id</code>: UUID (Primary Key)</li>
                <li><code className="text-cyan-400">balancePaise</code>: BigInt (Integer Minor Units ≥ 0)</li>
                <li><code className="text-cyan-400">version</code>: Int (Optimistic concurrency version)</li>
              </ul>
            </div>

            <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-300 font-bold block mb-1">TABLE: Immutable Ledger</span>
              <ul className="text-slate-400 space-y-0.5 pl-3 list-disc">
                <li><code className="text-cyan-400">id</code>: UUID (Append-only journal)</li>
                <li><code className="text-cyan-400">idempotencyKey</code>: String (Unique constraint)</li>
                <li><code className="text-cyan-400">amountPaise</code>: BigInt (Positive integer)</li>
                <li><code className="text-cyan-400">status</code>: COMMITTED | ROLLED_BACK</li>
                <li><code className="text-cyan-400">systemChecksum</code>: BigInt (Total system snapshot)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* State Machine */}
        <div className="p-4 rounded-lg border border-slate-800 bg-[#0c1220]/90 space-y-3">
          <div className="flex items-center gap-2 text-purple-400 font-bold uppercase text-xs">
            <GitCommit className="w-4 h-4" />
            <span>Two-Phase Atomic State Machine</span>
          </div>

          <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-3 text-[11px]">
            <div className="flex items-center justify-between text-slate-300">
              <span className="px-2 py-1 rounded bg-slate-900 border border-slate-700">1. INGRESS</span>
              <span className="text-slate-500">➔</span>
              <span className="px-2 py-1 rounded bg-amber-950 border border-amber-800 text-amber-300">2. MUTEX ACQUIRED</span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span className="px-2 py-1 rounded bg-amber-950 border border-amber-800 text-amber-300">2. MUTEX ACQUIRED</span>
              <span className="text-slate-500">➔</span>
              <span className="px-2 py-1 rounded bg-indigo-950 border border-indigo-800 text-indigo-300">3. ATOMIC DEBIT/CREDIT</span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span className="px-2 py-1 rounded bg-indigo-950 border border-indigo-800 text-indigo-300">3. INVARIANT AUDIT</span>
              <span className="text-slate-500">➔</span>
              <div className="space-y-1">
                <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 block text-center">
                  COMMITTED ✓
                </span>
                <span className="px-2 py-0.5 rounded bg-rose-950 border border-rose-800 text-rose-300 block text-center">
                  ROLLED_BACK ↩
                </span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 font-sans">
            Guarantees that even if an execution thread crashes midway between debit and credit, the system restores the exact sender snapshot with zero leakage.
          </div>
        </div>
      </div>
    </div>
  );
};
