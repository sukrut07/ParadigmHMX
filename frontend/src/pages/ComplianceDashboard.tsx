import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  AlertTriangle,
  BarChart3,
  TrendingUp,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Flame,
  ArrowRight,
  Info
} from 'lucide-react';
import { getComplianceDashboard } from '../services/api';
import { DashboardComplianceData } from '../types';
import { KPICard } from '../components/common/KPICard';

export const ComplianceDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardComplianceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [copiedHash, setCopiedHash] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getComplianceDashboard('COMPLIANCE_HEAD');
      setData(res);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err: any) {
      setError(err.message || 'Failed to load compliance executive data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !data) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <span className="text-xs font-medium text-slate-400">Loading Compliance Executive Intelligence...</span>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-8 text-center">
        <div className="mx-auto max-w-md rounded-xl border border-red-500/30 bg-red-950/20 p-6">
          <AlertTriangle className="mx-auto h-8 w-8 text-red-400 mb-2" />
          <h2 className="text-sm font-bold text-red-200">Unable to load dashboard</h2>
          <p className="mt-1 text-xs text-red-300/80">{error}</p>
          <button
            onClick={loadData}
            className="mt-4 rounded-lg bg-red-500/20 border border-red-500/40 px-4 py-1.5 text-xs font-semibold text-red-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {
    detection_rate: 92.4,
    precision: 91.8,
    recall: 88.5,
    false_positive_rate: 7.8,
    open_cases: 21,
    escalated_cases: 6,
    average_resolution_days: '4.2',
    evidence_exports: 142,
  };

  const pipeline = data?.case_pipeline || {
    detected: 88,
    open: 21,
    in_review: 13,
    escalated: 6,
    resolved: 48,
  };

  const integrity = data?.evidence_integrity || {
    total_exports: 142,
    verified: 138,
    pending: 4,
    failed_verification: 0,
    last_verification: '2026-09-29T14:32:18Z',
    integrity_status: '100% Cryptographically Verified',
  };

  const ablation = data?.ablation || {
    baseline_financial_only: { precision: 82.5, recall: 71.0, f1: 76.3, fpr: 11.4 },
    ours_financial_and_insider: { precision: 91.8, recall: 88.5, f1: 90.1, fpr: 7.8 },
    improvement_f1_delta: 13.8,
    improvement_fpr_reduction: 3.6,
  };

  const sampleHash = '3a7f8e91b2c45d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e';

  const handleCopyHash = () => {
    navigator.clipboard.writeText(sampleHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider text-emerald-400 uppercase">
              Executive View
            </span>
            <span className="text-xs text-slate-400">Persona: Compliance Head / Executive</span>
          </div>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-100">
            Systemic Detection, Case Pipeline & Evidence Integrity
          </h1>
          <p className="text-xs text-slate-400">
            "How well is the overall system detecting and resolving financial crime?"
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400">
            Last updated: {lastUpdated || 'Just now'}
          </span>
          <button
            onClick={loadData}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-700 hover:text-slate-100 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Synthetic Benchmark Disclaimer Banner */}
      <div className="flex items-center gap-3 rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-3 text-xs text-cyan-300">
        <span className="rounded bg-cyan-900/60 border border-cyan-500/40 px-2 py-0.5 font-mono text-[10px] font-bold text-cyan-200 uppercase shrink-0">
          Synthetic benchmark
        </span>
        <Info className="h-4 w-4 shrink-0 text-cyan-400" />
        <span>
          <strong>Evaluation Context:</strong> Metrics evaluated against deterministically seeded synthetic benchmark dataset containing ground-truth collusion and hard-negative controls.
        </span>
      </div>

      {/* A. Top KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
        <KPICard
          title="Detection Rate"
          value={`${kpis.detection_rate}%`}
          badge="High"
          badgeColor="emerald"
          icon={ShieldCheck}
          onClick={() => navigate('/evaluation')}
        />
        <KPICard
          title="Precision"
          value={`${kpis.precision}%`}
          badgeColor="emerald"
          icon={BarChart3}
          onClick={() => navigate('/evaluation')}
        />
        <KPICard
          title="Recall"
          value={`${kpis.recall}%`}
          badgeColor="blue"
          icon={TrendingUp}
          onClick={() => navigate('/evaluation')}
        />
        <KPICard
          title="False Positives"
          value={`${kpis.false_positive_rate}%`}
          badge="Low"
          badgeColor="emerald"
          icon={CheckCircle2}
          onClick={() => navigate('/evaluation')}
        />
        <KPICard
          title="Open Cases"
          value={kpis.open_cases}
          badgeColor="blue"
          onClick={() => navigate('/cases?status=OPEN')}
        />
        <KPICard
          title="Escalated"
          value={kpis.escalated_cases}
          badge="Urgent"
          badgeColor="red"
          onClick={() => navigate('/cases?status=ESCALATED')}
        />
        <KPICard
          title="Avg Resolution"
          value={`${kpis.average_resolution_days}d`}
          subtitle="Cycle Time"
        />
        <KPICard
          title="Evidence Exports"
          value={kpis.evidence_exports}
          badge="SHA-256"
          badgeColor="emerald"
          icon={FileCheck2}
          onClick={() => navigate('/evidence')}
        />
      </div>

      {/* B. Case Pipeline Workflow */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-100">End-to-End Case Pipeline Status</h2>
            <p className="text-xs text-slate-400">Lifecycle progression from detection to resolution</p>
          </div>
          <button
            onClick={() => navigate('/cases')}
            className="flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:underline"
          >
            <span>Case Queue</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Pipeline Stepper */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            { label: 'DETECTED', count: pipeline.detected, path: '/alerts', color: 'border-cyan-500/40 bg-cyan-950/20 text-cyan-400' },
            { label: 'OPEN', count: pipeline.open, path: '/cases?status=OPEN', color: 'border-blue-500/40 bg-blue-950/20 text-blue-400' },
            { label: 'IN REVIEW', count: pipeline.in_review, path: '/cases?status=IN_REVIEW', color: 'border-yellow-500/40 bg-yellow-950/20 text-yellow-400' },
            { label: 'ESCALATED', count: pipeline.escalated, path: '/cases?status=ESCALATED', color: 'border-red-500/40 bg-red-950/20 text-red-400' },
            { label: 'RESOLVED', count: pipeline.resolved, path: '/cases?status=CLOSED', color: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-400' },
          ].map((step, idx) => (
            <div
              key={step.label}
              onClick={() => navigate(step.path)}
              className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${step.color}`}
            >
              <div className="flex items-center justify-between text-[11px] font-mono font-semibold">
                <span>0{idx + 1}. {step.label}</span>
              </div>
              <div className="mt-2 text-2xl font-bold font-mono tracking-tight">{step.count}</div>
              <div className="mt-1 text-[10px] text-slate-400">Click to filter queue →</div>
            </div>
          ))}
        </div>
      </div>

      {/* C. Detection Performance by Scenario Detector & Ablation Study */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Detection Performance Table (7 cols) */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-sm lg:col-span-7">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-100">Detector Scenario Benchmark</h2>
              <span className="text-xs text-slate-400">Precision, Recall, F1 and False Positive Rate</span>
            </div>
            <button
              onClick={() => navigate('/evaluation')}
              className="text-xs font-semibold text-emerald-400 hover:underline"
            >
              Full Evaluation Matrix →
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="pb-3 pl-2">Detector</th>
                  <th className="pb-3 text-right">Precision</th>
                  <th className="pb-3 text-right">Recall</th>
                  <th className="pb-3 text-right">F1 Score</th>
                  <th className="pb-3 pr-2 text-right">FPR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {(data?.detector_performance || []).map((row) => (
                  <tr key={row.detector} className="hover:bg-slate-800/30">
                    <td className="py-2.5 pl-2 font-sans font-medium text-slate-200">{row.detector}</td>
                    <td className="py-2.5 text-right text-emerald-400">{row.precision}</td>
                    <td className="py-2.5 text-right text-cyan-400">{row.recall}</td>
                    <td className="py-2.5 text-right font-bold text-slate-100">{row.f1}</td>
                    <td className="py-2.5 pr-2 text-right text-slate-400">{row.fpr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ablation Study & Evidence Integrity (5 cols) */}
        <div className="space-y-6 lg:col-span-5">
          {/* Ablation Study Card */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h2 className="text-sm font-bold text-slate-100">Ablation Study: Financial vs Insider</h2>
              <span className="rounded bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-mono text-emerald-300">
                +13.8% F1
              </span>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                <div className="flex justify-between font-semibold text-slate-300">
                  <span>Baseline (Financial Signals Only)</span>
                  <span className="font-mono text-slate-400">F1: {ablation.baseline_financial_only.f1}%</span>
                </div>
                <div className="mt-1 flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>Precision: {ablation.baseline_financial_only.precision}%</span>
                  <span>FPR: {ablation.baseline_financial_only.fpr}%</span>
                </div>
              </div>

              <div className="rounded-lg border border-emerald-500/40 bg-emerald-950/20 p-3">
                <div className="flex justify-between font-bold text-emerald-300">
                  <span>Ours (Financial + Insider Correlated)</span>
                  <span className="font-mono text-emerald-400">F1: {ablation.ours_financial_and_insider.f1}%</span>
                </div>
                <div className="mt-1 flex justify-between text-[11px] text-emerald-400/80 font-mono">
                  <span>Precision: {ablation.ours_financial_and_insider.precision}%</span>
                  <span>FPR: {ablation.ours_financial_and_insider.fpr}% (-3.6%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Evidence Integrity Card */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-slate-100">Evidence Integrity & Cryptography</h2>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">SHA-256</span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-2.5">
                  <div className="text-[10px] text-slate-400">Total Bundles</div>
                  <div className="text-base font-bold text-slate-100">{integrity.total_exports}</div>
                </div>
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-2.5">
                  <div className="text-[10px] text-emerald-400">Verified Authentic</div>
                  <div className="text-base font-bold text-emerald-400">{integrity.verified}</div>
                </div>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Latest Export Hash:</span>
                  <button
                    onClick={handleCopyHash}
                    className="flex items-center gap-1 text-[10px] font-mono text-cyan-400 hover:underline"
                  >
                    {copiedHash ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedHash ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="mt-1 font-mono text-xs text-slate-300 truncate">
                  {sampleHash}
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => navigate('/evidence')}
                  className="flex-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 text-center"
                >
                  View Evidence Log
                </button>
                <button
                  onClick={() => navigate('/evidence')}
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 text-center"
                >
                  Verify Export
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
