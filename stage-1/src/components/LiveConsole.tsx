/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { LogEntry } from '../types/factory';
import { Terminal, Trash2, Search, ChevronDown, ChevronUp } from 'lucide-react';

interface LiveConsoleProps {
  logs: LogEntry[];
  onClearLogs?: () => void;
}

export const LiveConsole: React.FC<LiveConsoleProps> = ({ logs, onClearLogs }) => {
  const [filter, setFilter] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredLogs = logs.filter(
    l =>
      l.message.toLowerCase().includes(filter.toLowerCase()) ||
      l.agent.toLowerCase().includes(filter.toLowerCase())
  );

  const getLogStyle = (level: LogEntry['level']) => {
    switch (level) {
      case 'attack':
        return 'text-amber-400 font-semibold';
      case 'error':
        return 'text-rose-400 font-bold';
      case 'warn':
        return 'text-yellow-300';
      case 'success':
        return 'text-emerald-400 font-semibold';
      default:
        return 'text-slate-300';
    }
  };

  const getAgentBadge = (agent: LogEntry['agent']) => {
    switch (agent) {
      case 'PLANNER':
        return 'text-cyan-400 border-cyan-800/80 bg-cyan-950/40';
      case 'ARCHITECT':
        return 'text-indigo-400 border-indigo-800/80 bg-indigo-950/40';
      case 'BUILDER':
        return 'text-blue-400 border-blue-800/80 bg-blue-950/40';
      case 'ADVERSARIAL_TESTER':
        return 'text-amber-400 border-amber-800/80 bg-amber-950/40';
      case 'INDEPENDENT_VERIFIER':
        return 'text-emerald-400 border-emerald-800/80 bg-emerald-950/40';
      case 'REPAIRER':
        return 'text-purple-300 border-purple-800/80 bg-purple-950/40';
      default:
        return 'text-slate-400 border-slate-700/80 bg-slate-900/60';
    }
  };

  return (
    <div className="border border-slate-800 rounded-lg overflow-hidden bg-[#070b14]/95 font-mono text-xs shadow-xl">
      {/* Console Top Bar */}
      <div className="px-4 py-2 bg-[#0b101c] border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold text-slate-200 uppercase text-[11px] tracking-wider">
            Live Factory Activity Stream ({logs.length} events)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3 h-3 text-slate-500 absolute left-2 top-2" />
            <input
              type="text"
              value={filter}
              onChange={e => setFilter(e.target.value)}
              placeholder="Filter logs..."
              className="bg-slate-900 border border-slate-800 rounded pl-7 pr-2 py-0.5 text-[11px] text-slate-300 focus:outline-none focus:border-cyan-500 w-36"
            />
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-400 hover:text-white cursor-pointer"
            title={isExpanded ? 'Collapse Console' : 'Expand Console'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Log Body */}
      {isExpanded && (
        <div
          ref={scrollRef}
          className="p-3 max-h-52 overflow-y-auto space-y-1.5 text-[11px] divide-y divide-slate-800/30"
        >
          {filteredLogs.length === 0 ? (
            <div className="py-6 text-center text-slate-600">
              Awaiting agent events... Click [RUN FACTORY DEMO] to initiate dark factory stream.
            </div>
          ) : (
            filteredLogs.map(entry => (
              <div key={entry.id} className="pt-1.5 flex items-start gap-2.5 leading-relaxed">
                <span className="text-slate-500 select-none shrink-0 font-mono">
                  [{entry.timestamp}]
                </span>

                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-bold border shrink-0 ${getAgentBadge(
                    entry.agent
                  )}`}
                >
                  {entry.agent}
                </span>

                <span className={`break-words ${getLogStyle(entry.level)}`}>
                  {entry.message}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
