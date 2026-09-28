import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  ShieldAlert,
  Clock,
  AlertTriangle,
  Building2,
  TrendingUp,
  RefreshCw,
  Eye,
  Edit3,
  SlidersHorizontal,
  ChevronRight,
  Info,
  ExternalLink
} from 'lucide-react';
import { getAuditDashboard } from '../services/api';
import { DashboardAuditData } from '../types';
import { KPICard } from '../components/common/KPICard';
import { RiskBadge } from '../components/common/RiskBadge';

export const AuditDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardAuditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAuditDashboard('INTERNAL_AUDITOR');
      setData(res);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err: any) {
      setError(err.message || 'Failed to load internal audit operational data');
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
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <span className="text-xs font-medium text-slate-400">Loading Internal Audit Intelligence...</span>
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
    critical_employees: 0,
    high_risk_employees: 0,
    off_hours_events: 0,
    privilege_violations: 0,
    bulk_lookup_anomalies: 0,
    account_modifications: 0,
    employees_monitored: 0,
    linked_financial_alerts: 0,
  };

  const anomalies = data?.behaviour_anomalies || {
    off_hours: 0,
    bulk_lookup: 0,
    overrides: 0,
    kyc_edits: 0,
    limit_changes: 0,
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider text-indigo-400 uppercase">
              Insider Risk Intelligence
            </span>
            <span className="text-xs text-slate-400">Persona: Internal-Audit Reviewer</span>
          </div>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-100">
            Employee Intelligence & Behavioural Deviations
          </h1>
          <p className="text-xs text-slate-400">
            "Which employees are behaving abnormally, and what financial activity is connected to them?"
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

      {/* A. Employee Risk KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
        <KPICard
          title="Critical Emps"
          value={kpis.critical_employees}
          badge="Urgent"
          badgeColor="red"
          icon={ShieldAlert}
          onClick={() => navigate('/employees')}
        />
        <KPICard
          title="High-Risk Emps"
          value={kpis.high_risk_employees}
          badgeColor="orange"
          icon={Users}
          onClick={() => navigate('/employees')}
        />
        <KPICard
          title="Off-Hours Events"
          value={kpis.off_hours_events}
          badgeColor="yellow"
          icon={Clock}
        />
        <KPICard
          title="Privilege Abuse"
          value={kpis.privilege_violations}
          badgeColor="red"
          icon={AlertTriangle}
        />
        <KPICard
          title="Bulk Lookups"
          value={kpis.bulk_lookup_anomalies}
          badgeColor="orange"
          icon={Eye}
        />
        <KPICard
          title="Account Edits"
          value={kpis.account_modifications}
          badgeColor="blue"
          icon={Edit3}
        />
        <KPICard
          title="Monitored Staff"
          value={kpis.employees_monitored}
          subtitle="Active Profiles"
          icon={Users}
        />
        <KPICard
          title="Linked Alerts"
          value={kpis.linked_financial_alerts}
          badgeColor="red"
          icon={TrendingUp}
          onClick={() => navigate('/alerts')}
        />
      </div>

      {/* B. Behaviour Anomalies & Top Peer Deviations */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Behaviour Anomalies Breakdown (6 cols) */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-sm lg:col-span-6">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-indigo-400" />
              <h2 className="text-sm font-bold text-slate-100">Behavioural Anomalies Detected</h2>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Total Count</span>
          </div>

          <div className="mt-4 space-y-3.5">
            {[
              { label: 'Off-Hours Accesses', count: anomalies.off_hours, max: 50, color: 'bg-orange-500' },
              { label: 'Bulk Account Lookups', count: anomalies.bulk_lookup, max: 30, color: 'bg-red-500' },
              { label: 'Unauthorized Overrides', count: anomalies.overrides, max: 20, color: 'bg-red-500' },
              { label: 'KYC & Profile Edits', count: anomalies.kyc_edits, max: 25, color: 'bg-indigo-500' },
              { label: 'Transaction Limit Increases', count: anomalies.limit_changes, max: 15, color: 'bg-cyan-500' },
            ].map((item) => {
              const pct = Math.min(100, Math.round((item.count / item.max) * 100));
              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">{item.label}</span>
                    <span className="font-mono font-bold text-slate-100">{item.count}</span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-950 border border-slate-800/60">
                    <div
                      style={{ width: `${pct}%` }}
                      className={`h-full ${item.color} transition-all duration-500`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Peer Deviations (6 cols) */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-sm lg:col-span-6">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-400" />
              <h2 className="text-sm font-bold text-slate-100">Top Peer Deviations</h2>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400" title="Statistical z-score over role-based peer median">
              <Info className="h-3.5 w-3.5 text-indigo-400" />
              <span>Standard Deviations (σ)</span>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {(data?.top_deviations || []).map((dev) => (
              <div
                key={dev.employee_id}
                onClick={() => navigate(`/employees/${dev.employee_id}`)}
                className="group cursor-pointer rounded-lg border border-slate-800/60 bg-slate-950/40 p-3 transition-colors hover:border-indigo-500/50 hover:bg-slate-900"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-indigo-300">{dev.employee_id}</span>
                    <span className="text-xs text-slate-400">({dev.role})</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-red-400 rounded bg-red-950/60 border border-red-500/30 px-2 py-0.5">
                    {dev.deviation_sigma}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Lookups: <strong className="text-slate-200">{dev.lookups}</strong></span>
                  <span>Peer Median: <strong className="text-slate-300">{Math.round(dev.peer_mean)}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* C. Branch Risk Overview */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-indigo-400" />
            <h2 className="text-sm font-bold text-slate-100">Branch Insider Risk Indices</h2>
          </div>
          <span className="text-xs text-slate-400">Aggregated by operational units</span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Object.entries(data?.branch_risk || {}).map(([branchId, info]) => (
            <div
              key={branchId}
              className="rounded-lg border border-slate-800/60 bg-slate-950/60 p-4 transition-colors hover:border-slate-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-200">{info.name}</h3>
                  <span className="font-mono text-xs text-slate-400">{branchId}</span>
                </div>
                <RiskBadge tier={info.risk} size="sm" />
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-slate-800/60 pt-2 text-xs font-mono text-slate-300">
                <span>Active Alerts: <strong className="text-red-400">{info.active_alerts}</strong></span>
                <span>Anomalies: <strong className="text-yellow-400">{info.anomalies}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* D. Employee Risk Table */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-100">Monitored Employee Risk Matrix</h2>
            <p className="text-xs text-slate-400">
              Aggregated access logs, policy deviations, and financial alert linkages
            </p>
          </div>
          <button
            onClick={() => navigate('/employees')}
            className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:underline"
          >
            <span>View All Staff</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="pb-3 pl-3">Employee</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Branch</th>
                <th className="pb-3">Risk Tier</th>
                <th className="pb-3 text-right">Access Events</th>
                <th className="pb-3 text-right">Modifications</th>
                <th className="pb-3 text-right">Overrides</th>
                <th className="pb-3 text-right">Off-Hours</th>
                <th className="pb-3 text-right">Linked Alerts</th>
                <th className="pb-3 pr-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {(data?.employee_table || []).map((row) => (
                <tr
                  key={row.employee_id}
                  onClick={() => navigate(`/employees/${row.employee_id}`)}
                  className="cursor-pointer transition-colors hover:bg-slate-800/40"
                >
                  <td className="py-3 pl-3">
                    <span className="font-semibold text-indigo-400">{row.employee_id}</span>
                  </td>
                  <td className="py-3 font-sans text-slate-300">{row.role}</td>
                  <td className="py-3 font-sans text-slate-300">{row.branch_id}</td>
                  <td className="py-3 font-sans">
                    <RiskBadge tier={row.risk} size="sm" />
                  </td>
                  <td className="py-3 text-right text-slate-200">{row.access_count}</td>
                  <td className="py-3 text-right text-slate-200">{row.modifications}</td>
                  <td className="py-3 text-right text-slate-200">{row.overrides}</td>
                  <td className="py-3 text-right text-slate-200">{row.off_hours}</td>
                  <td className="py-3 text-right font-bold text-red-400">{row.linked_alerts_count}</td>
                  <td className="py-3 pr-3 text-right font-sans">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/employees/${row.employee_id}`);
                      }}
                      className="rounded bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-1 text-[11px] font-semibold text-indigo-300 hover:bg-indigo-500/20"
                    >
                      Intelligence
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
