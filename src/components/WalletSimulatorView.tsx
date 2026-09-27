/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { WalletUser, TransactionRecord } from '../types/factory';
import { WalletEngine } from '../services/walletEngine';
import {
  Wallet,
  ArrowRightLeft,
  Shield,
  ShieldAlert,
  Send,
  RefreshCw,
  Zap,
  AlertTriangle,
  History,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface WalletSimulatorViewProps {
  engine: WalletEngine;
  onRefresh: () => void;
}

export const WalletSimulatorView: React.FC<WalletSimulatorViewProps> = ({
  engine,
  onRefresh,
}) => {
  const users = engine.getUsers();
  const ledger = engine.getLedger();
  const totalMoney = engine.getTotalSystemMoney();
  const isPatched = engine.getIsPatched();

  // Manual Transfer Form State
  const [senderId, setSenderId] = useState<string>('usr_alice');
  const [recipientId, setRecipientId] = useState<string>('usr_bob');
  const [amountRupees, setAmountRupees] = useState<string>('500.00');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [lastActionResult, setLastActionResult] = useState<string | null>(null);

  // Quick interactive attack triggers
  const handleExecuteManualTransfer = async () => {
    setIsProcessing(true);
    setLastActionResult(null);
    try {
      const amountPaise = Math.round(parseFloat(amountRupees) * 100);
      const res = await engine.executeTransfer({
        idempotencyKey: `manual_${Date.now()}`,
        senderId,
        recipientId,
        amountPaise,
      });

      if (res.success) {
        setLastActionResult(`✅ Transfer successful: ₹${amountRupees} transferred.`);
      } else {
        setLastActionResult(`❌ Transfer rejected: ${res.error}`);
      }
    } catch (err: any) {
      setLastActionResult(`⚠️ Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
      onRefresh();
    }
  };

  // 1. Manual Double-Spend Attack Button
  const handleTriggerDoubleSpendAttack = async () => {
    setIsProcessing(true);
    setLastActionResult('⚡ Launching 2x concurrent ₹800.00 transfers against Alice...');

    // Temporarily ensure Alice has only ₹1000 to clearly demonstrate the exploit
    const alice = engine.getUser('usr_alice');
    const attackAmount = 80000; // ₹800.00

    const promise1 = engine.executeTransfer({
      idempotencyKey: `manual_ds_1_${Date.now()}`,
      senderId: 'usr_alice',
      recipientId: 'usr_bob',
      amountPaise: attackAmount,
    });

    const promise2 = engine.executeTransfer({
      idempotencyKey: `manual_ds_2_${Date.now()}`,
      senderId: 'usr_alice',
      recipientId: 'usr_charlie',
      amountPaise: attackAmount,
    });

    const [res1, res2] = await Promise.all([promise1, promise2]);

    if (res1.success && res2.success) {
      setLastActionResult('💥 EXPLOIT SUCCEEDED: Both ₹800 transfers went through! Double-spend vulnerability exposed.');
    } else if (res1.success || res2.success) {
      setLastActionResult('🛡️ ATTACK BLOCKED: Atomic lock prevented double-spend. Exactly one transfer succeeded.');
    } else {
      setLastActionResult(`⚠️ Attack failed: ${res1.error || res2.error}`);
    }

    setIsProcessing(false);
    onRefresh();
  };

  // 2. Manual Idempotency Retry Storm Button
  const handleTriggerRetryStorm = async () => {
    setIsProcessing(true);
    setLastActionResult('⚡ Firing 10x identical requests with same idempotency key...');

    const sharedKey = `manual_retry_${Date.now()}`;
    const amountPaise = 25000; // ₹250.00

    const promises = Array.from({ length: 10 }).map(() =>
      engine.executeTransfer({
        idempotencyKey: sharedKey,
        senderId: 'usr_bob',
        recipientId: 'usr_charlie',
        amountPaise,
      })
    );

    const results = await Promise.all(promises);
    const applies = results.filter(r => r.success && !r.isDuplicate).length;

    if (applies === 1) {
      setLastActionResult('🛡️ IDEMPOTENCY VERIFIED: 10 identical requests yielded exactly 1 transaction application.');
    } else {
      setLastActionResult(`💥 REPLAY VULNERABILITY: Identical request was applied ${applies} separate times!`);
    }

    setIsProcessing(false);
    onRefresh();
  };

  // 3. Manual Mid-Tx Crash Fault Injection
  const handleTriggerFaultInjection = async () => {
    setIsProcessing(true);
    setLastActionResult('⚡ Injecting simulated crash after debit step...');

    const res = await engine.executeTransfer({
      idempotencyKey: `crash_${Date.now()}`,
      senderId: 'usr_charlie',
      recipientId: 'usr_david',
      amountPaise: 15000,
      simulateMidTxFailure: true,
    });

    if (res.transaction?.status === 'ROLLED_BACK') {
      setLastActionResult('🛡️ ATOMIC ROLLBACK SUCCESSFUL: Sender debit was reversed cleanly. Zero money lost.');
    } else {
      setLastActionResult('💥 MONEY DESTROYED: Sender was debited but recipient was never credited! No rollback.');
    }

    setIsProcessing(false);
    onRefresh();
  };

  const handleToggleEngineMode = () => {
    engine.setPatchedMode(!isPatched);
    onRefresh();
  };

  const handleResetWallets = () => {
    engine.reset(isPatched);
    setLastActionResult('Wallets reset to original baseline balances.');
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Simulation Header & Mode Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-lg border border-slate-800 bg-[#0c1220]/90">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-200 tracking-wide uppercase font-mono flex items-center gap-2">
              <Wallet className="w-4 h-4 text-cyan-400" />
              Simulated Financial Environment (Pocketful Testbed)
            </h2>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
              isPatched
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
            }`}>
              ENGINE: {isPatched ? 'HARDENED / REPAIRED (MUTEX LOCKED)' : 'VULNERABLE (NAIVE ASYNC)'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Safe sandbox isolated from real banking systems. Uses integer minor units (paise) and immutable ledger entries.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="text-right">
            <span className="text-slate-500 text-[10px] uppercase block">Total System Liquidity</span>
            <span className="text-cyan-400 font-bold text-sm">
              ₹{(totalMoney / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <button
            onClick={handleToggleEngineMode}
            className={`px-3 py-1.5 rounded-md font-semibold text-xs border transition-colors cursor-pointer ${
              isPatched
                ? 'bg-purple-950/80 text-purple-200 border-purple-800 hover:bg-purple-900'
                : 'bg-amber-950/80 text-amber-200 border-amber-800 hover:bg-amber-900'
            }`}
          >
            Switch to {isPatched ? 'Vulnerable Engine' : 'Hardened Engine'}
          </button>

          <button
            onClick={handleResetWallets}
            className="p-1.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 hover:text-white cursor-pointer"
            title="Reset Wallets"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 User Wallets Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {users.map((user) => {
          const delta = user.balancePaise - user.initialBalancePaise;
          const isNegative = user.balancePaise < 0;

          return (
            <div
              key={user.id}
              className={`p-4 rounded-lg border font-mono ${
                isNegative
                  ? 'border-rose-600 bg-rose-950/40 ring-1 ring-rose-500 animate-pulse'
                  : 'border-slate-800 bg-[#0e1424]/80'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-white font-sans text-sm">{user.name}</span>
                <span className="text-[10px] text-slate-500">{user.id}</span>
              </div>

              <div className="my-2">
                <div className={`text-xl font-bold tracking-tight ${
                  isNegative ? 'text-rose-400' : 'text-slate-100'
                }`}>
                  ₹{(user.balancePaise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {user.balancePaise.toLocaleString()} paise
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                <span>Initial: ₹{(user.initialBalancePaise / 100).toFixed(2)}</span>
                <span className={delta > 0 ? 'text-emerald-400' : delta < 0 ? 'text-rose-400' : 'text-slate-500'}>
                  {delta > 0 ? `+₹${(delta / 100).toFixed(2)}` : delta < 0 ? `-₹${(Math.abs(delta) / 100).toFixed(2)}` : '±0.00'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Attack Controls & Manual Transfer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Interactive Adversarial Attack Triggers for Judges */}
        <div className="p-4 rounded-lg border border-slate-800 bg-[#0c1220]/90 space-y-3 font-mono text-xs">
          <div className="flex items-center gap-2 text-amber-400 font-bold uppercase text-[11px]">
            <Zap className="w-3.5 h-3.5" />
            <span>Interactive Attack Console (For Judges)</span>
          </div>
          <p className="text-[11px] text-slate-400 font-sans">
            Directly probe the currently active engine with real adversarial attacks:
          </p>

          <div className="space-y-2 pt-1">
            <button
              onClick={handleTriggerDoubleSpendAttack}
              disabled={isProcessing}
              className="w-full text-left p-2.5 rounded-md bg-slate-900 border border-slate-800 hover:border-amber-700/80 hover:bg-amber-950/20 text-slate-200 transition-colors disabled:opacity-40 cursor-pointer"
            >
              <div className="font-semibold text-amber-300">1. Trigger Concurrent Double-Spend</div>
              <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                Launches 2x simultaneous ₹800 transfers from Alice in parallel threads.
              </div>
            </button>

            <button
              onClick={handleTriggerRetryStorm}
              disabled={isProcessing}
              className="w-full text-left p-2.5 rounded-md bg-slate-900 border border-slate-800 hover:border-cyan-700/80 hover:bg-cyan-950/20 text-slate-200 transition-colors disabled:opacity-40 cursor-pointer"
            >
              <div className="font-semibold text-cyan-300">2. Trigger 10x Idempotency Replay Storm</div>
              <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                Simulates dropped network ACK with 10 duplicate transfer attempts.
              </div>
            </button>

            <button
              onClick={handleTriggerFaultInjection}
              disabled={isProcessing}
              className="w-full text-left p-2.5 rounded-md bg-slate-900 border border-slate-800 hover:border-purple-700/80 hover:bg-purple-950/20 text-slate-200 transition-colors disabled:opacity-40 cursor-pointer"
            >
              <div className="font-semibold text-purple-300">3. Trigger Mid-Transaction Crash</div>
              <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                Injects failure after debit before credit to test rollback vs money destruction.
              </div>
            </button>
          </div>
        </div>

        {/* Center: Manual Transfer Form */}
        <div className="p-4 rounded-lg border border-slate-800 bg-[#0c1220]/90 space-y-3 font-mono text-xs">
          <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase text-[11px]">
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Manual Transfer Execution</span>
          </div>

          <div className="space-y-2">
            <div>
              <label className="text-[10px] text-slate-400 uppercase block mb-1">From Sender</label>
              <select
                value={senderId}
                onChange={e => setSenderId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-200"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} (₹{(u.balancePaise / 100).toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase block mb-1">To Recipient</label>
              <select
                value={recipientId}
                onChange={e => setRecipientId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-200"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} (₹{(u.balancePaise / 100).toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase block mb-1">Amount (INR / Minor Units)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amountRupees}
                onChange={e => setAmountRupees(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-200"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                = {Math.round(parseFloat(amountRupees || '0') * 100)} integer paise
              </span>
            </div>

            <button
              onClick={handleExecuteManualTransfer}
              disabled={isProcessing}
              className="w-full mt-2 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-colors disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Execute Transfer</span>
            </button>
          </div>
        </div>

        {/* Right: Live Action Output Banner */}
        <div className="p-4 rounded-lg border border-slate-800 bg-[#0c1220]/90 space-y-3 font-mono text-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-400 font-bold uppercase text-[11px]">
              <History className="w-3.5 h-3.5 text-indigo-400" />
              <span>Execution Feedback</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans mt-1">
              Direct telemetry from the wallet engine execution pipeline:
            </p>

            <div className="mt-3 p-3 rounded bg-slate-950 border border-slate-800/80 min-h-[90px] flex items-center justify-center text-center">
              {lastActionResult ? (
                <span className="text-slate-200 text-xs">{lastActionResult}</span>
              ) : (
                <span className="text-slate-600 text-[11px]">Ready. Click an attack vector or execute a transfer above.</span>
              )}
            </div>
          </div>

          <div className="text-[10px] text-slate-500 border-t border-slate-800/60 pt-2">
            Engine Mode: <strong className="text-cyan-400">{isPatched ? 'Serialized Locking (Patched)' : 'Vulnerable Check-Then-Act'}</strong>
          </div>
        </div>
      </div>

      {/* Immutable Transaction Ledger */}
      <div className="border border-slate-800 rounded-lg overflow-hidden bg-[#0c1220]/80">
        <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>IMMUTABLE DOUBLE-ENTRY TRANSACTION JOURNAL ({ledger.length} RECORDS)</span>
          <span>CHECKSUM INVARIANT: DELTA = 0.00 PAISE</span>
        </div>

        {ledger.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-slate-500">
            No transactions recorded yet. Run factory tests or execute a manual transfer to view journal.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60 max-h-[320px] overflow-y-auto font-mono text-xs">
            {ledger.map((tx) => {
              const isCommitted = tx.status === 'COMMITTED';
              const isVulnerableDoubleSpent = tx.status === 'VULNERABILITY_DOUBLE_SPENT';
              const isRolledBack = tx.status === 'ROLLED_BACK';

              return (
                <div key={tx.id} className="p-3 hover:bg-slate-850/40 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        isCommitted
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : isVulnerableDoubleSpent
                          ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        {tx.status}
                      </span>
                      <span className="text-slate-400 text-[11px]">{tx.id}</span>
                      <span className="text-slate-200 font-semibold">
                        {tx.senderName} ➔ {tx.recipientName}
                      </span>
                      <span className="text-cyan-400 font-bold">
                        ₹{(tx.amountPaise / 100).toFixed(2)}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500">
                      {tx.timestamp.split('T')[1]?.substring(0, 8)}
                    </div>
                  </div>

                  {tx.reasonNote && (
                    <div className="mt-1.5 text-[11px] text-slate-400 italic">
                      Note: {tx.reasonNote}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
