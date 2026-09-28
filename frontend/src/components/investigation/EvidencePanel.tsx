import React, { useState } from 'react';
import {
  ShieldAlert,
  Info,
  Layers,
  FileText,
  HelpCircle,
  Briefcase,
  Download,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';
import { AlertDetail } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import { createCase, exportCaseBundle, verifyEvidence } from '../../services/api';

interface EvidencePanelProps {
  alert: AlertDetail;
  onCaseCreated?: (newCase: any) => void;
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({ alert, onCaseCreated }) => {
  const [caseModalOpen, setCaseModalOpen] = useState(false);
  const [caseTitle, setCaseTitle] = useState(`Incident: ${alert.title}`);
  const [caseAssignee, setCaseAssignee] = useState('Analyst 07');
  const [caseNotes, setCaseNotes] = useState('Initiated investigation based on deterministic evidence linkage.');
  const [creatingCase, setCreatingCase] = useState(false);

  const [exporting, setExporting] = useState(false);
  const [exportResult, setExportResult] = useState<{ sha256?: string; bundle?: any } | null>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  const handleCreateCase = async () => {
    try {
      setCreatingCase(true);
      const res = await createCase({
        alert_id: alert.id,
        title: caseTitle,
        priority: alert.tier,
        assigned_to: caseAssignee,
        notes: caseNotes,
      });
      setCaseModalOpen(false);
      if (onCaseCreated) onCaseCreated(res);
      alertModalFeedback('Case successfully opened and assigned!');
    } catch (err: any) {
      alertModalFeedback(`Failed to create case: ${err.message}`);
    } finally {
      setCreatingCase(false);
    }
  };

  const handleExport = async (format: 'json' | 'pdf' = 'json') => {
    try {
      setExporting(true);
      const res = await exportCaseBundle(alert.id, format);
      if (format === 'json') {
        setExportResult(res);
        // Trigger auto verification to showcase tamper-evidence
        const ver = await verifyEvidence(res.bundle, res.sha256);
        setVerificationResult(ver);
      } else {
        const url = window.URL.createObjectURL(res);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Evidence_Bundle_${alert.id}.pdf`;
        a.click();
      }
    } catch (err: any) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  const handleCopyHash = () => {
    if (exportResult?.sha256) {
      navigator.clipboard.writeText(exportResult.sha256);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  const alertModalFeedback = (msg: string) => {
    window.alert(msg);
  };

  return (
    <div className="flex flex-col gap-5 overflow-y-auto pr-1">
      {/* 1. Risk Tier Header */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg backdrop-blur-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-semibold text-slate-400">ALERT DOSSIER</span>
          <RiskBadge tier={alert.tier} size="lg" pulsing={alert.tier === 'CRITICAL'} />
        </div>
        <h3 className="mt-2 text-sm font-bold text-slate-100 leading-snug">{alert.title}</h3>
        <div className="mt-2 flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <span>ID: {alert.id}</span>
          <span>•</span>
          <span>Status: {alert.status}</span>
        </div>
      </div>

      {/* 2. Why Flagged? */}
      <div className="rounded-xl border border-slate-800/90 bg-slate-900/60 p-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
          <Info className="h-4 w-4 text-cyan-400" />
          <span>Why Flagged?</span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-slate-300 bg-slate-950/60 rounded-lg p-3 border border-slate-800">
          {alert.summary}
        </p>
      </div>

      {/* 3. Rule Trace (Deterministic Decision Logic) */}
      <div className="rounded-xl border border-slate-800/90 bg-slate-900/60 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
            <Layers className="h-4 w-4 text-indigo-400" />
            <span>Deterministic Rule Trace</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
            Audit-Grade
          </span>
        </div>

        <div className="mt-3 space-y-2">
          {alert.rule_trace?.rules?.map((rule, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-slate-800 bg-slate-950/80 p-2.5 text-xs text-slate-300"
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-cyan-300">{rule.name}</span>
                <span className="font-mono text-[10px] text-slate-400">{rule.rule}</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400 leading-normal">{rule.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Counterfactual Explanation ("What would change the risk?") */}
      {alert.counterfactual && (
        <div className="rounded-xl border border-cyan-900/40 bg-cyan-950/15 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-300">
            <HelpCircle className="h-4 w-4 text-cyan-400" />
            <span>Counterfactual Analysis</span>
          </div>
          <div className="mt-2 text-xs text-slate-300">
            <div className="font-medium text-slate-200">
              Condition Evaluated:{' '}
              <span className="text-orange-300">{alert.counterfactual.condition_changed}</span>
            </div>
            <div className="mt-1 flex items-center gap-2 font-mono text-xs">
              <span className="line-through text-red-400">{alert.counterfactual.original_tier}</span>
              <span>→</span>
              <span className="text-emerald-400 font-bold">{alert.counterfactual.counterfactual_tier}</span>
            </div>
            <p className="mt-2 text-[11px] text-slate-300 italic bg-black/30 p-2 rounded border border-cyan-800/30">
              "{alert.counterfactual.explanation}"
            </p>
          </div>
        </div>
      )}

      {/* 5. Clickable Evidence Records */}
      <div className="rounded-xl border border-slate-800/90 bg-slate-900/60 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
            <FileText className="h-4 w-4 text-emerald-400" />
            <span>Evidence Records ({alert.evidence?.length || 0})</span>
          </div>
        </div>

        <div className="mt-2.5 max-h-48 space-y-1.5 overflow-y-auto">
          {alert.evidence?.map((ev, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-950/60 px-3 py-2 text-xs hover:border-slate-700"
            >
              <div>
                <span className="font-mono text-cyan-400 font-medium">{ev.record_id}</span>
                <span className="ml-2 text-slate-400 text-[11px]">({ev.record_type})</span>
                <div className="text-[11px] text-slate-300">{ev.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Primary Action Buttons */}
      <div className="grid grid-cols-2 gap-2.5 pt-1">
        <button
          onClick={() => setCaseModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-lg bg-cyan-600 px-3 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-cyan-500 transition-colors"
        >
          <Briefcase className="h-4 w-4" />
          <span>Open Case</span>
        </button>

        <button
          onClick={() => handleExport('json')}
          disabled={exporting}
          className="flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>{exporting ? 'Exporting...' : 'Export Bundle'}</span>
        </button>
      </div>

      {/* Export & SHA-256 Tamper Verification Box */}
      {exportResult && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 text-xs shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>Evidence Package Exported</span>
            </div>
            {verificationResult?.valid && (
              <span className="rounded bg-emerald-900/80 border border-emerald-500/50 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                SHA-256 VALID
              </span>
            )}
          </div>

          <div className="mt-2">
            <div className="text-[10px] uppercase font-mono text-slate-400">Cryptographic Digest:</div>
            <div className="mt-1 flex items-center gap-2 rounded bg-black/60 p-2 font-mono text-[10px] text-slate-200">
              <span className="truncate">{exportResult.sha256}</span>
              <button
                onClick={handleCopyHash}
                title="Copy SHA-256"
                className="shrink-0 rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                {copiedHash ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Creating Case */}
      {caseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <h4 className="text-sm font-bold text-slate-100">Create Investigation Case</h4>
            <p className="mt-1 text-xs text-slate-400">
              Bind this alert, evidence records, and correlation graph to an active case dossier.
            </p>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-slate-300">Case Title</label>
                <input
                  type="text"
                  value={caseTitle}
                  onChange={(e) => setCaseTitle(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300">Assignee</label>
                <input
                  type="text"
                  value={caseAssignee}
                  onChange={(e) => setCaseAssignee(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300">Initial Investigator Notes</label>
                <textarea
                  rows={3}
                  value={caseNotes}
                  onChange={(e) => setCaseNotes(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <button
                onClick={() => setCaseModalOpen(false)}
                className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCase}
                disabled={creatingCase}
                className="rounded-lg bg-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-500"
              >
                {creatingCase ? 'Creating...' : 'Create Case'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
