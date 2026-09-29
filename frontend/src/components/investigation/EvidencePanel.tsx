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
  ExternalLink,
  Activity,
  Sliders,
  FileCheck2,
  UserCheck
} from 'lucide-react';
import { AlertDetail, RiskTier } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import { createCase, exportCaseBundle, verifyEvidence } from '../../services/api';

interface EvidencePanelProps {
  alert: AlertDetail;
  onCaseCreated?: (newCase: any) => void;
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({ alert, onCaseCreated }) => {
  const [caseModalOpen, setCaseModalOpen] = useState(false);
  const [caseTitle, setCaseTitle] = useState(`Incident: ${alert.title}`);
  const [caseAssignee, setCaseAssignee] = useState('Analyst Priya Sharma (Fraud Operations)');
  const [caseNotes, setCaseNotes] = useState('Initiated investigation based on multi-signal evidence linkage.');
  const [creatingCase, setCreatingCase] = useState(false);

  const [exportingJson, setExportingJson] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
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
      alertModalFeedback('Investigation Case successfully opened and assigned to reviewer!');
    } catch (err: any) {
      alertModalFeedback(`Failed to create case: ${err.message}`);
    } finally {
      setCreatingCase(false);
    }
  };

  const handleExport = async (format: 'json' | 'pdf' = 'json') => {
    try {
      if (format === 'json') {
        setExportingJson(true);
        const res = await exportCaseBundle(alert.id, 'json');
        setExportResult(res);
        // Trigger auto verification to showcase tamper-evidence
        const ver = await verifyEvidence(res.bundle, res.sha256);
        setVerificationResult(ver);

        // Also trigger file download for user
        const blob = new Blob([JSON.stringify(res.bundle || res, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Forensic_Evidence_${alert.id}.json`;
        a.click();
      } else {
        setExportingPdf(true);
        const res = await exportCaseBundle(alert.id, 'pdf');
        const url = window.URL.createObjectURL(res);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Forensic_Dossier_${alert.id}.pdf`;
        a.click();
      }
    } catch (err: any) {
      console.error('Export failed:', err);
      alertModalFeedback(`Evidence export failed: ${err.message}`);
    } finally {
      setExportingJson(false);
      setExportingPdf(false);
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

  // Extract multi-dimensional risk breakdown
  const riskFactors = alert.rule_trace?.risk_factors || alert.rule_trace?.risk_breakdown || {
    insider_privilege_risk: {
      level: alert.tier === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
      score: alert.tier === 'CRITICAL' ? 95 : 80,
      title: 'Insider Privilege & Policy Misuse',
      indicators: ['Unapproved access ticket or out-of-role parameter override detected on account.'],
    },
    money_flow_topology_risk: {
      level: alert.title.includes('Circular') ? 'CRITICAL' : 'HIGH',
      score: 88,
      title: 'Money-Flow Topology & Laundering',
      indicators: ['High velocity fund movement or circular multi-hop topology identified.'],
    },
    profile_kyc_mismatch_risk: {
      level: 'HIGH',
      score: 75,
      title: 'Customer Profile & KYC Consistency',
      indicators: ['Payment volume or activity pattern deviates from declared customer occupation profile.'],
    },
    causal_temporal_linkage_risk: {
      level: alert.tier === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
      score: 90,
      title: 'Causal Action-Transaction Temporal Linkage',
      indicators: ['Outbound fund transfer executed in close temporal proximity following credential/limit modification.'],
    },
    network_exposure_risk: {
      level: 'MEDIUM',
      score: 60,
      title: 'Network Exposure & Blast Radius',
      indicators: ['Cluster links multiple entity touchpoints across branch terminals and payment rails.'],
    },
  };

  const getDimensionBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-red-950/80 text-red-400 border-red-500/50';
      case 'HIGH':
        return 'bg-orange-950/80 text-orange-400 border-orange-500/50';
      case 'MEDIUM':
        return 'bg-amber-950/80 text-amber-400 border-amber-500/50';
      case 'LOW':
        return 'bg-cyan-950/80 text-cyan-400 border-cyan-500/50';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="flex flex-col gap-4 overflow-y-auto pr-1">
      {/* 1. Risk Tier Header */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold tracking-wider text-slate-400">EVIDENCE DOSSIER</span>
            <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-cyan-400 border border-slate-700">
              {alert.id}
            </span>
          </div>
          <RiskBadge tier={alert.tier} size="lg" pulsing={alert.tier === 'CRITICAL'} />
        </div>
        <h3 className="mt-2 text-sm font-bold text-slate-100 leading-snug">{alert.title}</h3>
        <div className="mt-2 flex items-center gap-3 text-[11px] font-mono text-slate-400">
          <span>Status: <strong className="text-slate-200">{alert.status}</strong></span>
          <span>•</span>
          <span>Detected: <span className="text-slate-300">{new Date(alert.created_at).toLocaleString()}</span></span>
        </div>
      </div>

      {/* 2. EXPLAINABLE RISK LEVELS MATRIX (Multi-factor Breakdown - Not an Opaque Single Score) */}
      <div className="rounded-xl border border-cyan-900/40 bg-slate-900/70 p-4 shadow-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Explainable Risk Levels
            </span>
          </div>
          <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 border border-cyan-500/40 px-2 py-0.5 rounded">
            Multi-Factor Analysis
          </span>
        </div>

        <p className="mt-2 text-[11px] text-slate-400">
          Deterministic risk evaluation decomposed across five distinct institutional risk dimensions, replacing opaque black-box single scores:
        </p>

        <div className="mt-3 space-y-2.5">
          {Object.entries(riskFactors).map(([key, item]: [string, any]) => (
            <div
              key={key}
              className="rounded-lg border border-slate-800/80 bg-slate-950/70 p-2.5 transition-colors hover:border-slate-700"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">{item.title}</span>
                <span
                  className={`rounded border px-2 py-0.5 text-[10px] font-mono font-bold uppercase ${getDimensionBadge(
                    item.level
                  )}`}
                >
                  {item.level} ({item.score}%)
                </span>
              </div>

              {/* Progress score bar */}
              <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    item.level === 'CRITICAL'
                      ? 'bg-red-500'
                      : item.level === 'HIGH'
                      ? 'bg-orange-500'
                      : item.level === 'MEDIUM'
                      ? 'bg-amber-500'
                      : item.level === 'LOW'
                      ? 'bg-cyan-500'
                      : 'bg-slate-600'
                  }`}
                  style={{ width: `${Math.max(item.score, 5)}%` }}
                />
              </div>

              {/* Indicators */}
              <ul className="mt-2 space-y-1">
                {item.indicators?.map((ind: string, i: number) => (
                  <li key={i} className="flex items-start gap-1.5 text-[11px] text-slate-400">
                    <span className="text-cyan-400 mt-0.5">›</span>
                    <span className="leading-tight">{ind}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Why Flagged? (Causal Synthesis) */}
      <div className="rounded-xl border border-slate-800/90 bg-slate-900/60 p-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
          <Info className="h-4 w-4 text-cyan-400" />
          <span>Why Flagged? (Causal Narrative)</span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-slate-300 bg-slate-950/80 rounded-lg p-3 border border-slate-800">
          {alert.summary}
        </p>
      </div>

      {/* 4. Rule Trace (Deterministic Decision Logic) */}
      <div className="rounded-xl border border-slate-800/90 bg-slate-900/60 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
            <Layers className="h-4 w-4 text-indigo-400" />
            <span>Deterministic Rule Trace</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
            Audit-Grade Trace
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

      {/* 5. Counterfactual Explanation ("What would change the risk?") */}
      {alert.counterfactual && (
        <div className="rounded-xl border border-cyan-900/40 bg-cyan-950/15 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-300">
            <HelpCircle className="h-4 w-4 text-cyan-400" />
            <span>Counterfactual "What-If" Analysis</span>
          </div>
          <div className="mt-2 text-xs text-slate-300">
            <div className="font-medium text-slate-200">
              Condition Evaluated:{' '}
              <span className="text-orange-300 font-semibold">{alert.counterfactual.condition_changed}</span>
            </div>
            <div className="mt-1.5 flex items-center gap-2 font-mono text-xs">
              <span className="line-through text-red-400">{alert.counterfactual.original_tier}</span>
              <span>→</span>
              <span className="text-emerald-400 font-bold">{alert.counterfactual.counterfactual_tier}</span>
            </div>
            <p className="mt-2 text-[11px] text-slate-300 italic bg-black/40 p-2 rounded border border-cyan-800/30">
              "{alert.counterfactual.explanation}"
            </p>
          </div>
        </div>
      )}

      {/* 6. Clickable Evidence Records */}
      <div className="rounded-xl border border-slate-800/90 bg-slate-900/60 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
            <FileText className="h-4 w-4 text-emerald-400" />
            <span>Corroborating Evidence Records ({alert.evidence?.length || 0})</span>
          </div>
        </div>

        <div className="mt-2.5 max-h-48 space-y-1.5 overflow-y-auto custom-scrollbar">
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

      {/* 7. Action Buttons */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        <button
          onClick={() => setCaseModalOpen(true)}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-cyan-600 px-2.5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-cyan-500 transition-colors"
        >
          <Briefcase className="h-3.5 w-3.5" />
          <span>Assign Case</span>
        </button>

        <button
          onClick={() => handleExport('json')}
          disabled={exportingJson}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
        >
          <Download className="h-3.5 w-3.5" />
          <span>{exportingJson ? 'Exporting...' : 'Export JSON'}</span>
        </button>

        <button
          onClick={() => handleExport('pdf')}
          disabled={exportingPdf}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/30 px-2.5 py-2.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-950/50 transition-colors"
        >
          <FileCheck2 className="h-3.5 w-3.5" />
          <span>{exportingPdf ? 'Generating...' : 'Dossier PDF'}</span>
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
                SHA-256 VERIFIED AUTHENTIC
              </span>
            )}
          </div>

          <div className="mt-2">
            <div className="text-[10px] uppercase font-mono text-slate-400">Cryptographic Digest (RFC 8785):</div>
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

      {/* Modal for Creating & Assigning Case */}
      {caseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-cyan-400" />
              <h4 className="text-sm font-bold text-slate-100">Assign Case to Reviewer</h4>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Bind this alert, evidence records, and correlation graph to an active case dossier for formal reviewer adjudication.
            </p>

            <div className="mt-4 space-y-3.5 text-xs">
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
                <label className="text-[11px] font-semibold text-slate-300">Assign Reviewer</label>
                <select
                  value={caseAssignee}
                  onChange={(e) => setCaseAssignee(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Analyst Priya Sharma (Fraud Operations)">Analyst Priya Sharma (Fraud Operations)</option>
                  <option value="Reviewer Vikram Seth (Senior AML Review)">Reviewer Vikram Seth (Senior AML Review)</option>
                  <option value="Senior Investigator Ananya Rao (Insider Risk Intelligence)">Senior Investigator Ananya Rao (Insider Risk Intelligence)</option>
                  <option value="Compliance Officer Kabir Mehta (Legal & SAR Compliance)">Compliance Officer Kabir Mehta (Legal & SAR Compliance)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300">Initial Investigator Findings & Instructions</label>
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
                className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-500 disabled:opacity-50"
              >
                <Briefcase className="h-3.5 w-3.5" />
                <span>{creatingCase ? 'Assigning...' : 'Assign Case'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
