/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AgentNode, AgentId, FactoryState } from '../types/factory';
import {
  Workflow,
  Layers,
  Code2,
  Flame,
  ShieldCheck,
  Wrench,
  CheckCircle2,
  AlertOctagon,
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  FileCode,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

interface AgentPipelineProps {
  agents: AgentNode[];
  currentState: FactoryState;
  onOpenCode: () => void;
}

export const AgentPipeline: React.FC<AgentPipelineProps> = ({
  agents,
  currentState,
  onOpenCode,
}) => {
  const [selectedAgentId, setSelectedAgentId] = useState<AgentId | null>(null);

  const getAgentIcon = (id: AgentId) => {
    switch (id) {
      case 'PLANNER':
        return <Workflow className="w-5 h-5 text-cyan-400" />;
      case 'ARCHITECT':
        return <Layers className="w-5 h-5 text-indigo-400" />;
      case 'BUILDER':
        return <Code2 className="w-5 h-5 text-blue-400" />;
      case 'ADVERSARIAL_TESTER':
        return <Flame className="w-5 h-5 text-amber-400" />;
      case 'INDEPENDENT_VERIFIER':
        return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      case 'REPAIRER':
        return <Wrench className="w-5 h-5 text-purple-400" />;
    }
  };

  const getStatusBadge = (status: AgentNode['status']) => {
    switch (status) {
      case 'running':
        return (
          <span className="flex items-center gap-1.5 text-[11px] font-mono font-medium text-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            RUNNING
          </span>
        );
      case 'passed':
        return (
          <span className="flex items-center gap-1.5 text-[11px] font-mono font-medium text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            PASSED
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center gap-1.5 text-[11px] font-mono font-medium text-rose-400">
            <AlertOctagon className="w-3.5 h-3.5" />
            FAILED
          </span>
        );
      case 'repaired':
        return (
          <span className="flex items-center gap-1.5 text-[11px] font-mono font-medium text-purple-300">
            <Sparkles className="w-3.5 h-3.5" />
            REPAIRED
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 text-[11px] font-mono font-medium text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            WAITING
          </span>
        );
    }
  };

  const selectedAgent = agents.find(a => a.id === selectedAgentId);

  return (
    <div className="space-y-4">
      {/* Visual Pipeline Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-200 tracking-wide uppercase font-mono">
            Autonomous Agent Orchestration Graph
          </h2>
          <p className="text-xs text-slate-400">
            Self-directed pipeline with autonomous agent handoffs, adversarial attack validation, and failure repair.
          </p>
        </div>
        <div className="text-xs font-mono text-slate-400 flex items-center gap-3">
          <span>Handoff protocol: <strong className="text-cyan-400">Typed Contracts</strong></span>
          <span>·</span>
          <span>Verification: <strong className="text-emerald-400">Independent Blue-Team</strong></span>
        </div>
      </div>

      {/* Grid of 6 Specialized Agents */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {agents.map((agent, index) => {
          const isSelected = selectedAgentId === agent.id;
          const isRunning = agent.status === 'running';
          const isFailed = agent.status === 'failed';
          const isRepaired = agent.status === 'repaired';

          let borderClass = 'border-slate-800 bg-[#0e1424]/70';
          if (isRunning) borderClass = 'border-amber-500/80 bg-amber-950/20 shadow-lg shadow-amber-950/20 ring-1 ring-amber-500/50';
          if (isFailed) borderClass = 'border-rose-600/80 bg-rose-950/25 shadow-lg shadow-rose-950/30 ring-1 ring-rose-500/50';
          if (isRepaired) borderClass = 'border-purple-500/80 bg-purple-950/20 shadow-lg shadow-purple-950/20 ring-1 ring-purple-500/50';
          if (isSelected) borderClass += ' ring-2 ring-cyan-500';

          return (
            <div
              key={agent.id}
              onClick={() => setSelectedAgentId(isSelected ? null : agent.id)}
              className={`p-4 rounded-lg border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${borderClass} hover:border-slate-700`}
            >
              {/* Top: Agent Header */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-md bg-slate-900 border border-slate-700/60">
                      {getAgentIcon(agent.id)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-slate-500">0{index + 1}.</span>
                        <h3 className="text-sm font-semibold text-white tracking-tight">{agent.name}</h3>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans">{agent.role}</p>
                    </div>
                  </div>
                  <div>{getStatusBadge(agent.status)}</div>
                </div>

                {/* Middle: Active Action / Output */}
                <div className="mt-3 text-xs bg-slate-950/60 p-2.5 rounded border border-slate-800/80 font-mono">
                  <div className="text-[10px] uppercase text-slate-500 font-semibold mb-1 flex items-center justify-between">
                    <span>Current Operation</span>
                    {agent.executionTimeMs && (
                      <span className="text-slate-400">{agent.executionTimeMs}ms</span>
                    )}
                  </div>
                  <p className="text-slate-200 line-clamp-2">{agent.currentAction}</p>
                </div>
              </div>

              {/* Bottom: Summary footer & inspect trigger */}
              <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                <span className="line-clamp-1 text-slate-400 italic">
                  {agent.outputSummary}
                </span>
                <span className="text-cyan-400 font-mono ml-2 shrink-0">
                  {isSelected ? 'Collapse' : 'Inspect'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Agent Detailed Handoff Payload Drawer */}
      {selectedAgent && (
        <div className="p-4 rounded-lg border border-slate-800 bg-[#0a0f1e] text-xs font-mono">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 font-bold">{selectedAgent.name}</span>
              <span className="text-slate-500">· Handoff Payload & Invariant Records</span>
            </div>
            <button
              onClick={() => setSelectedAgentId(null)}
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              ✕ Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-slate-400 block mb-1 font-semibold uppercase text-[10px]">
                Agent Output Summary
              </span>
              <div className="p-3 rounded bg-slate-950 border border-slate-800 text-slate-300">
                {selectedAgent.outputSummary}
              </div>
            </div>
            <div>
              <span className="text-slate-400 block mb-1 font-semibold uppercase text-[10px]">
                Structured Handoff Data (JSON)
              </span>
              <pre className="p-3 rounded bg-slate-950 border border-slate-800 text-cyan-300 overflow-x-auto max-h-40">
                {JSON.stringify(selectedAgent.handoffPayload || { status: selectedAgent.status, action: selectedAgent.currentAction }, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
