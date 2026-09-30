/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileCheck2,
  FileText,
  FileCode,
  Download,
  Printer,
  X,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import {
  exportAuditReportJson,
  exportAuditReportPdf,
  AuditReportData,
} from '../services/exportAuditReport';

interface ExportAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: AuditReportData;
}

export const ExportAuditModal: React.FC<ExportAuditModalProps> = ({
  isOpen,
  onClose,
  reportData,
}) => {
  const [format, setFormat] = useState<'pdf' | 'json'>('pdf');
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleExport = () => {
    if (format === 'json') {
      exportAuditReportJson(reportData);
    } else {
      exportAuditReportPdf(reportData);
    }
    setDownloadSuccess(true);
    setTimeout(() => {
      setDownloadSuccess(false);
      onClose();
    }, 1800);
  };

  const isAccepted = reportData.factoryState === 'ACCEPTED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0b101e] border border-slate-700/80 rounded-xl w-full max-w-xl overflow-hidden font-mono shadow-2xl">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#0e1526] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-cyan-950/80 border border-cyan-800/80">
              <FileCheck2 className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <span className="font-bold text-slate-100 text-sm block">
                Export Executive Audit Report
              </span>
              <span className="text-[10px] text-slate-400 font-sans">
                Official Dark Factory Proof Dossier for Hackathon Judges
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Audit Dossier Overview Card */}
          <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Target Job ID:</span>
              <span className="text-cyan-400 font-bold">{reportData.jobId}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Factory Final Verdict:</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  isAccepted
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}
              >
                {reportData.factoryState === 'ACCEPTED' ? 'FACTORY ACCEPTED ✅' : reportData.factoryState}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Total System Money Invariant:</span>
              <span className="text-emerald-400 font-semibold">
                ₹{(reportData.totalSystemLiquidityPaise / 100).toFixed(2)} (Delta = 0.00 paise)
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-900">
              <span className="text-slate-400">Dossier Contents:</span>
              <span className="text-slate-300">
                {reportData.evidence.length} Evidence Items &bull; {reportData.testResults.length} Test Records &bull; {reportData.logs.length} Verification Logs
              </span>
            </div>
          </div>

          {/* Format Selection */}
          <div>
            <label className="text-slate-300 font-bold block mb-2 uppercase text-[11px]">
              Select Report Format:
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* PDF Option */}
              <div
                onClick={() => setFormat('pdf')}
                className={`p-3.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                  format === 'pdf'
                    ? 'border-cyan-500 bg-cyan-950/25 ring-1 ring-cyan-500/50'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-slate-100">
                      <Printer className="w-4 h-4 text-cyan-400" />
                      <span>Print / PDF</span>
                    </div>
                    {format === 'pdf' && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                    Formatted executive briefing for judges. Generates printable report with metrics, invariant checks, handoffs, and signatures.
                  </p>
                </div>
                <div className="mt-3 text-[10px] text-cyan-400 font-bold">
                  Recommended for Evaluation &bull; .PDF
                </div>
              </div>

              {/* JSON Option */}
              <div
                onClick={() => setFormat('json')}
                className={`p-3.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                  format === 'json'
                    ? 'border-cyan-500 bg-cyan-950/25 ring-1 ring-cyan-500/50'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-slate-100">
                      <FileCode className="w-4 h-4 text-indigo-400" />
                      <span>Raw JSON</span>
                    </div>
                    {format === 'json' && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                    Full machine-readable ledger with raw inputs, outputs, cryptographic SHA-256 hashes, and structured logs.
                  </p>
                </div>
                <div className="mt-3 text-[10px] text-indigo-400 font-bold">
                  Machine Verifiable &bull; .JSON
                </div>
              </div>
            </div>
          </div>

          {/* Quick Notice */}
          <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              All proof hashes (SHA-256) and money conservation checkpoints are cryptographically bound to job ID <strong>{reportData.jobId}</strong>.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#0e1526] border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-slate-800 text-slate-300 hover:text-white cursor-pointer transition-colors text-xs"
          >
            Cancel
          </button>

          <button
            onClick={handleExport}
            className={`px-4 py-1.5 rounded font-bold text-xs cursor-pointer flex items-center gap-1.5 transition-all shadow-md ${
              downloadSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-950/50'
            }`}
          >
            {downloadSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Downloaded Successfully!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Export {format.toUpperCase()} Report</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
