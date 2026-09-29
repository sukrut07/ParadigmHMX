import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Flame,
  ShieldAlert,
  Users,
  CreditCard,
  Briefcase,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Activity,
  ChevronRight
} from 'lucide-react';
import { getFraudDashboard, getAlertTrend } from '../services/api';
import { DashboardFraudData, RiskTier } from '../types';
import { KPICard } from '../components/common/KPICard';
import { RiskBadge } from '../components/common/RiskBadge';

export const FraudDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardFraudData | null>(null);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [trendFilter, setTrendFilter] = useState<'24h' | '7d' | '30d'>('7d');
  const [entityTab, setEntityTab] = useState<'employees' | 'accounts'>('employees');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [fraudRes, trendRes] = await Promise.all([
        getFraudDashboard('FRAUD_ANALYST'),
        getAlertTrend().catch(() => []),
      ]);
      setData(fraudRes);
      setTrendData(trendRes);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err: any) {
      setError(err.message || 'Failed to load fraud operational data');
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
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
          <span className="text-xs font-medium text-slate-400">Loading Fraud Analyst Intelligence...</span>
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
    critical_alerts: 0,
    high_alerts: 0,
    medium_alerts: 0,
    low_alerts: 0,
    open_cases: 0,
    unassigned_alerts: 0,
    suspicious_employees: 0,
    suspicious_accounts: 0,
    alerts_today: 0,
  };

  const riskDist = data?.risk_distribution || {
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
  };

  const signalDist = data?.signal_distribution || {};

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-red-500/10 border border-red-500/30 px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider text-red-400 uppercase">
              Operational View
            </span>
            <span className="text-xs text-slate-400">Persona: Fraud Analyst</span>
          </div>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-100">
            Financial Activity & Alert Prioritization
          </h1>
          <p className="text-xs text-slate-400">
            "What suspicious financial activity needs my attention right now?"
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

      {/* A. Top KPI Cards (6-8 cards max) */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
        <KPICard
          title="Critical Alerts"
          value={kpis.critical_alerts}
          badge="Urgent"
          badgeColor="red"
          icon={Flame}
          onClick={() => navigate('/alerts?tier=CRITICAL')}
        />
        <KPICard
          title="High Alerts"
          value={kpis.high_alerts}
          badgeColor="orange"
          icon={ShieldAlert}
          onClick={() => navigate('/alerts?tier=HIGH')}
        />
        <KPICard
          title="Medium Alerts"
          value={kpis.medium_alerts}
          badgeColor="yellow"
          icon={AlertTriangle}
          onClick={() => navigate('/alerts?tier=MEDIUM')}
        />
        <KPICard
          title="Open Cases"
          value={kpis.open_cases}
          badgeColor="blue"
          icon={Briefcase}
          onClick={() => navigate('/cases?status=OPEN')}
        />
        <KPICard
          title="Unassigned"
          value={kpis.unassigned_alerts}
          subtitle="Alerts without case"
          icon={Activity}
          onClick={() => navigate('/alerts?status=OPEN')}
        />
        <KPICard
          title="Suspicious Emps"
          value={kpis.suspicious_employees}
          badgeColor="red"
          icon={Users}
          onClick={() => navigate('/employees')}
        />
        <KPICard
          title="Suspicious Accs"
          value={kpis.suspicious_accounts}
          badgeColor="blue"
          icon={CreditCard}
          onClick={() => navigate('/accounts')}
        />
      </div>

      {/* B. Alert Trend & Risk Distribution */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Alert Trend (8 cols) */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-sm lg:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-slate-100">Alert Trend Over Time</h2>
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 p-0.5 text-[11px] font-mono">
              {(['24h', '7d', '30d'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTrendFilter(filter)}
                  className={`rounded px-2.5 py-1 transition-colors ${
                    trendFilter === filter
                      ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {filter.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Trend Bar Chart Visualization */}
          <div className="mt-5 space-y-3">
            {trendData.length === 0 ? (
              <div className="flex h-40 items-center justify-center text-xs text-slate-500">
                No historical trend points recorded in database.
              </div>
            ) : (
              <div className="space-y-2">
                {trendData.slice(0, 6).map((item, idx) => {
                  const maxTotal = Math.max(...trendData.map((t) => t.total || 1), 1);
                  const critPct = (item.CRITICAL / maxTotal) * 100;
                  const highPct = (item.HIGH / maxTotal) * 100;
                  const medPct = (item.MEDIUM / maxTotal) * 100;

                  return (
                    <div key={idx} className="group">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-slate-300">{item.date}</span>
                        <div className="flex items-center gap-2 text-[11px] font-mono">
                          <span className="text-red-400">Crit: {item.CRITICAL}</span>
                          <span className="text-orange-400">High: {item.HIGH}</span>
                          <span className="text-yellow-400">Med: {item.MEDIUM}</span>
                          <span className="font-bold text-slate-200">Total: {item.total}</span>
                        </div>
                      </div>
                      <div className="mt-1 flex h-3.5 w-full overflow-hidden rounded bg-slate-950 border border-slate-800/80">
                        <div
                          style={{ width: `${critPct}%` }}
                          className="bg-red-500/80 hover:bg-red-500 transition-all"
                          title={`Critical: ${item.CRITICAL}`}
                        />
                        <div
                          style={{ width: `${highPct}%` }}
                          className="bg-orange-500/80 hover:bg-orange-500 transition-all"
                          title={`High: ${item.HIGH}`}
                        />
                        <div
                          style={{ width: `${medPct}%` }}
                          className="bg-yellow-500/80 hover:bg-yellow-500 transition-all"
                          title={`Medium: ${item.MEDIUM}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="flex items-center gap-4 pt-2 text-[11px] font-medium text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-red-500" /> Critical
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-orange-500" /> High
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-yellow-500" /> Medium
              </span>
            </div>
          </div>
        </div>

        {/* Risk Distribution (4 cols) */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-sm lg:col-span-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-slate-100">Risk Tier Distribution</h2>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as RiskTier[]).map((tier) => {
              const count = riskDist[tier] || 0;
              const total = Object.values(riskDist).reduce((a, b) => a + b, 0) || 1;
              const pct = Math.round((count / total) * 100);

              const barColor =
                tier === 'CRITICAL' ? 'bg-red-500' :
                tier === 'HIGH' ? 'bg-orange-500' :
                tier === 'MEDIUM' ? 'bg-yellow-500' : 'bg-cyan-500';

              return (
                <div
                  key={tier}
                  onClick={() => navigate(`/alerts?tier=${tier}`)}
                  className="group cursor-pointer rounded-lg p-2 transition-all hover:bg-slate-800/60"
                >
                  <div className="flex items-center justify-between text-xs">
                    <RiskBadge tier={tier} size="sm" />
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-200">{count}</span>
                      <span className="text-[11px] text-slate-400">({pct}%)</span>
                    </div>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-950 border border-slate-800/60">
                    <div
                      style={{ width: `${pct}%` }}
                      className={`h-full ${barColor} transition-all duration-500`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* C. Signal Distribution & Top Risk Entities */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Signal Distribution (6 cols) */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-sm lg:col-span-6">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-slate-100">Top Suspicious Signal Types</h2>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Correlated Detectors</span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5">
            {Object.entries(signalDist).map(([sigKey, count]) => {
              const formattedName = sigKey.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
              return (
                <div
                  key={sigKey}
                  onClick={() => navigate(`/alerts?signal_type=${sigKey}`)}
                  className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-800/80 bg-slate-950/60 px-3 py-2 text-xs transition-colors hover:border-cyan-500/50 hover:bg-slate-900"
                >
                  <span className="text-slate-300 truncate pr-2">{formattedName}</span>
                  <span className="font-mono font-bold text-cyan-400">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Risk Entities (6 cols) */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-sm lg:col-span-6">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-slate-100">Top Risk Entities</h2>
            </div>

            {/* Entity Tabs */}
            <div className="flex rounded-lg border border-slate-800 bg-slate-950 p-0.5 text-xs font-medium">
              <button
                onClick={() => setEntityTab('employees')}
                className={`rounded px-3 py-1 transition-colors ${
                  entityTab === 'employees' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
                }`}
              >
                Employees
              </button>
              <button
                onClick={() => setEntityTab('accounts')}
                className={`rounded px-3 py-1 transition-colors ${
                  entityTab === 'accounts' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
                }`}
              >
                Accounts
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {entityTab === 'employees' ? (
              (data?.top_entities?.employees || []).slice(0, 5).map((emp) => (
                <div
                  key={emp.id}
                  onClick={() => navigate(`/employees/${emp.id}`)}
                  className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-800/60 bg-slate-950/40 p-2.5 transition-colors hover:border-slate-700 hover:bg-slate-900"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-semibold text-cyan-300">{emp.id}</span>
                    <RiskBadge tier={emp.risk} size="sm" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-mono">Weight: {emp.weight}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                </div>
              ))
            ) : (
              (data?.top_entities?.accounts || []).slice(0, 5).map((acc) => (
                <div
                  key={acc.id}
                  onClick={() => navigate(`/accounts?search=${acc.id}`)}
                  className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-800/60 bg-slate-950/40 p-2.5 transition-colors hover:border-slate-700 hover:bg-slate-900"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-semibold text-cyan-300">{acc.id}</span>
                    <RiskBadge tier={acc.risk} size="sm" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-mono">Weight: {acc.weight}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* D. Priority Alerts List / Table */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-100">Priority Financial & Correlation Alerts</h2>
            <p className="text-xs text-slate-400">
              Ranked deterministically by risk tier (CRITICAL &gt; HIGH) and incident recency
            </p>
          </div>
          <button
            onClick={() => navigate('/alerts')}
            className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:underline"
          >
            <span>View All Alerts</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="pb-3 pl-3">Tier</th>
                <th className="pb-3">Alert ID</th>
                <th className="pb-3">Incident Summary</th>
                <th className="pb-3">Employee</th>
                <th className="pb-3">Account</th>
                <th className="pb-3">Signals</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 pr-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {(data?.priority_alerts || []).map((alert) => (
                <tr
                  key={alert.id}
                  onClick={() => navigate(`/investigations/${alert.id}`)}
                  className="cursor-pointer transition-colors hover:bg-slate-800/40"
                >
                  <td className="py-3 pl-3 font-sans">
                    <RiskBadge tier={alert.tier} size="sm" />
                  </td>
                  <td className="py-3 font-semibold text-cyan-400">{alert.id}</td>
                  <td className="py-3 font-sans text-slate-200 max-w-xs truncate" title={alert.title}>
                    {alert.title}
                  </td>
                  <td className="py-3 text-slate-300">
                    {alert.employee_id ? (
                      <span className="rounded bg-orange-950/60 border border-orange-500/30 px-1.5 py-0.5 text-orange-400">
                        {alert.employee_id}
                      </span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  <td className="py-3 text-slate-300">
                    {alert.account_id ? (
                      <span className="rounded bg-cyan-950/60 border border-cyan-500/30 px-1.5 py-0.5 text-cyan-400">
                        {alert.account_id}
                      </span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  <td className="py-3 text-slate-300">{alert.signal_count}</td>
                  <td className="py-3 font-sans">
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] uppercase text-slate-300">
                      {alert.status}
                    </span>
                  </td>
                  <td className="py-3 pr-3 text-right font-sans">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/investigations/${alert.id}`);
                      }}
                      className="rounded bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 text-[11px] font-semibold text-cyan-300 hover:bg-cyan-500/20"
                    >
                      Investigate
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
