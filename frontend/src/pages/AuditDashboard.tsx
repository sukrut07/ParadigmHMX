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
  ArrowRight,
  Activity,
  Briefcase,
  FileCheck2,
  CheckCircle2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell
} from 'recharts';
import { getAuditDashboard, getAlerts, getTransactions } from '../services/api';
import { DashboardAuditData } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';

export const AuditDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardAuditData | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [auditRes, txRes] = await Promise.all([
        getAuditDashboard('INTERNAL_AUDITOR'),
        getTransactions({ limit: 10 }).catch(() => []),
      ]);
      setData(auditRes);
      setTransactions(txRes);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err: any) {
      setError(err.message || 'Failed to load internal audit operational data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const kpis = data?.kpis || {
    critical_employees: 1,
    high_risk_employees: 2,
    privilege_violations: 6,
    linked_financial_alerts: 4,
    employees_monitored: 36,
  };

  // Recharts Horizontal Bar Chart for Behavioural Deviations (Section 38)
  const behaviourDeviationsData = [
    { name: 'Bulk Lookups', count: data?.behaviour_anomalies?.bulk_lookup || 34, color: '#A34800' },
    { name: 'Privilege Abuse', count: kpis.privilege_violations || 18, color: '#B42318' },
    { name: 'Account Edits', count: data?.behaviour_anomalies?.overrides || 14, color: '#8A5A00' },
    { name: 'KYC Edits', count: data?.behaviour_anomalies?.kyc_edits || 9, color: '#1858A8' },
    { name: 'Off-Hours Events', count: data?.behaviour_anomalies?.off_hours || 4, color: '#176044' },
  ];

  // Recharts Transaction Trend Line Chart (Section 42)
  const transactionTrendData = [
    { date: '23 Sep', volume: 450000, alerts: 1 },
    { date: '24 Sep', volume: 680000, alerts: 0 },
    { date: '25 Sep', volume: 320000, alerts: 1 },
    { date: '26 Sep', volume: 920000, alerts: 2 },
    { date: '27 Sep', volume: 580000, alerts: 1 },
    { date: '28 Sep', volume: 1450000, alerts: 3 },
    { date: '29 Sep', volume: 1820000, alerts: 4 },
  ];

  if (loading && !data) {
    return (
      <div className="flex h-[calc(100vh-3.75rem)] items-center justify-center bg-[#F7F9F7]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#176044] border-t-transparent" />
          <span className="text-xs font-semibold text-[#425148]">Loading Internal Audit Intelligence...</span>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-8 max-w-md mx-auto my-16">
        <div className="rounded-xl border border-[#F3B5B0] bg-[#FDECEC] p-6 text-center shadow-xs">
          <AlertTriangle className="mx-auto h-10 w-10 text-[#B42318] mb-3" />
          <h3 className="text-sm font-bold text-[#B42318]">Internal Audit Load Error</h3>
          <p className="mt-2 text-xs text-[#B42318]/90">{error}</p>
          <button
            onClick={loadData}
            className="mt-4 rounded-lg bg-[#B42318] text-white px-4 py-1.5 text-xs font-bold hover:bg-[#911B13] cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-3.75rem)] bg-[#F7F9F7] p-6 space-y-6 max-w-7xl w-full mx-auto">
      {/* ── 1. Page Header ────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#D7E0DA] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-[#E8F4ED] border border-[#BBDCCA] px-2.5 py-0.5 text-[10px] font-mono font-bold tracking-wider text-[#176044] uppercase">
              Internal Audit Operations
            </span>
            <span className="text-xs text-[#68766E] font-mono">
              Surveillance of Monitored Bank Personnel
            </span>
          </div>
          <h1 className="mt-1 text-xl font-black tracking-tight text-[#17221C]">
            Internal Auditor Workspace
          </h1>
          <p className="text-xs text-[#425148] mt-0.5">
            Identify insider behavioral deviations, out-of-role privilege execution, and cross-account footprint
          </p>
        </div>

        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-[11px] font-mono text-[#68766E] hidden sm:inline">
              Synced: {lastUpdated}
            </span>
          )}
          <button
            onClick={loadData}
            className="flex items-center gap-1.5 rounded-lg border border-[#D7E0DA] bg-[#FFFFFF] px-3 py-1.5 text-xs font-bold text-[#17221C] hover:bg-[#F1F5F2] hover:border-[#B8C6BD] transition-colors cursor-pointer shadow-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-[#425148] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ── 2. Compact Top Row KPIs (Section 37) ──────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => navigate('/employees?tab=employees&risk=CRITICAL')}
          className="rounded-xl border border-[#D7E0DA] bg-[#FFFFFF] p-4 shadow-xs hover:border-[#B42318] transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#68766E]">Critical Employees</span>
            <span className="h-2 w-2 rounded-full bg-[#B42318]" />
          </div>
          <div className="mt-2 text-2xl font-black text-[#B42318]">{kpis.critical_employees}</div>
          <div className="mt-1 text-[11px] text-[#68766E] flex items-center justify-between">
            <span>Severe deviation active</span>
            <span className="font-bold text-[#176044]">EMP-017 →</span>
          </div>
        </div>

        <div
          onClick={() => navigate('/employees?tab=employees&risk=HIGH')}
          className="rounded-xl border border-[#D7E0DA] bg-[#FFFFFF] p-4 shadow-xs hover:border-[#A34800] transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#68766E]">High-Risk Employees</span>
            <span className="h-2 w-2 rounded-full bg-[#A34800]" />
          </div>
          <div className="mt-2 text-2xl font-black text-[#A34800]">{kpis.high_risk_employees}</div>
          <div className="mt-1 text-[11px] text-[#68766E] flex items-center justify-between">
            <span>Elevated peer delta</span>
            <span className="font-bold text-[#176044]">EMP-022 →</span>
          </div>
        </div>

        <div
          onClick={() => navigate('/privilege')}
          className="rounded-xl border border-[#D7E0DA] bg-[#FFFFFF] p-4 shadow-xs hover:border-[#176044] transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#68766E]">Privilege Events</span>
            <ShieldAlert className="h-3.5 w-3.5 text-[#176044]" />
          </div>
          <div className="mt-2 text-2xl font-black text-[#17221C]">{kpis.privilege_violations}</div>
          <div className="mt-1 text-[11px] text-[#68766E] flex items-center justify-between">
            <span>Out-of-role actions</span>
            <span className="font-bold text-[#176044]">Audit →</span>
          </div>
        </div>

        <div
          onClick={() => navigate('/alerts')}
          className="rounded-xl border border-[#D7E0DA] bg-[#FFFFFF] p-4 shadow-xs hover:border-[#176044] transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#68766E]">Linked Alerts</span>
            <span className="h-2 w-2 rounded-full bg-[#176044]" />
          </div>
          <div className="mt-2 text-2xl font-black text-[#176044]">{kpis.linked_financial_alerts}</div>
          <div className="mt-1 text-[11px] text-[#68766E] flex items-center justify-between">
            <span>Financial correlation</span>
            <span className="font-bold text-[#176044]">Queue →</span>
          </div>
        </div>
      </div>

      {/* ── 3. Visual Charts Grid (Sections 38 & 42) ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Behavioural Deviations Horizontal Bar Chart (6 cols) */}
        <div className="lg:col-span-6 rounded-xl border border-[#D7E0DA] bg-[#FFFFFF] p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#D7E0DA] pb-3 mb-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#17221C]">
                Behavioural Deviations Breakdown
              </h3>
              <p className="text-[11px] text-[#68766E] mt-0.5">
                Frequency of flagged staff anomalous activities
              </p>
            </div>
            <button
              onClick={() => navigate('/behaviour')}
              className="text-xs font-bold text-[#176044] hover:underline cursor-pointer"
            >
              Full Behaviour →
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={behaviourDeviationsData}
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                onClick={(ev: any) => {
                  if (ev && ev.activePayload && ev.activePayload.length > 0) {
                    navigate('/behaviour');
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5ECE7" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#68766E' }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#17221C', fontWeight: 600 }} width={110} />
                <Tooltip
                  contentStyle={{
                    background: '#FFFFFF',
                    border: '1px solid #D7E0DA',
                    borderRadius: 8,
                    fontSize: 12,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                  formatter={(val: any) => [`${val} occurrences`, 'Incident Count']}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} cursor="pointer">
                  {behaviourDeviationsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RIGHT: Transaction Activity Trend Line Chart (6 cols) */}
        <div className="lg:col-span-6 rounded-xl border border-[#D7E0DA] bg-[#FFFFFF] p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#D7E0DA] pb-3 mb-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#17221C]">
                Connected Transaction Velocity
              </h3>
              <p className="text-[11px] text-[#68766E] mt-0.5">
                Financial transfers linked to monitored employee modifications
              </p>
            </div>
            <button
              onClick={() => navigate('/transactions')}
              className="text-xs font-bold text-[#176044] hover:underline cursor-pointer"
            >
              Transactions →
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={transactionTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5ECE7" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#68766E' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#68766E' }}
                  tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
                />
                <Tooltip
                  contentStyle={{
                    background: '#FFFFFF',
                    border: '1px solid #D7E0DA',
                    borderRadius: 8,
                    fontSize: 12,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Settled Outflow']}
                />
                <Line
                  type="monotone"
                  dataKey="volume"
                  stroke="#176044"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#176044' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── 4. High-Risk Employees Priority Surveillance Table ────────── */}
      <div className="rounded-xl border border-[#D7E0DA] bg-[#FFFFFF] shadow-xs overflow-hidden">
        <div className="border-b border-[#D7E0DA] bg-[#F7F9F7] px-4 py-3 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#17221C]">
              Priority Monitored Staff Under Audit
            </span>
            <p className="text-[11px] text-[#68766E] mt-0.5">
              Ranked by risk tier and deviation sigma score
            </p>
          </div>
          <button
            onClick={() => navigate('/employees')}
            className="flex items-center gap-1 text-xs font-bold text-[#176044] hover:underline cursor-pointer"
          >
            <span>View All Employees ({kpis.employees_monitored})</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#D7E0DA] bg-[#FFFFFF] text-[10px] font-bold uppercase tracking-wider text-[#68766E]">
              <tr>
                <th className="py-3 pl-4">Staff ID</th>
                <th className="py-3">Role</th>
                <th className="py-3">Branch</th>
                <th className="py-3">Risk Assessment</th>
                <th className="py-3">Lookups</th>
                <th className="py-3">Overrides</th>
                <th className="py-3">Linked Alerts</th>
                <th className="py-3">Sigma Score</th>
                <th className="py-3 pr-4 text-right">Audit Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D7E0DA]">
              {(data?.employee_table?.slice(0, 5) || [
                { employee_id: 'EMP-017', role: 'Operations Analyst', branch_id: 'BR-01', risk: 'CRITICAL', access_count: 82, overrides: 6, linked_alerts_count: 2, deviation_sigma: '+3.4σ' },
                { employee_id: 'EMP-022', role: 'Branch Manager', branch_id: 'BR-01', risk: 'HIGH', access_count: 54, overrides: 4, linked_alerts_count: 1, deviation_sigma: '+2.1σ' },
                { employee_id: 'EMP-009', role: 'Senior Teller', branch_id: 'BR-02', risk: 'MEDIUM', access_count: 38, overrides: 1, linked_alerts_count: 0, deviation_sigma: '+1.6σ' },
                { employee_id: 'EMP-011', role: 'Relationship Mgr', branch_id: 'BR-02', risk: 'MEDIUM', access_count: 29, overrides: 0, linked_alerts_count: 1, deviation_sigma: '+1.2σ' },
              ]).map((emp: any) => (
                <tr
                  key={emp.employee_id}
                  className="hover:bg-[#F7F9F7] transition-colors cursor-pointer"
                  onClick={() => navigate(`/employees/${emp.employee_id}`)}
                >
                  <td className="py-3 pl-4 font-mono font-bold text-[#176044]">
                    {emp.employee_id}
                  </td>
                  <td className="py-3 text-[#17221C] font-semibold">
                    {emp.role}
                  </td>
                  <td className="py-3 font-mono text-[#68766E]">
                    {emp.branch_id}
                  </td>
                  <td className="py-3">
                    <RiskBadge tier={emp.risk} size="sm" />
                  </td>
                  <td className="py-3 font-mono font-bold text-[#17221C]">
                    {emp.access_count}
                  </td>
                  <td className="py-3 font-mono font-bold text-[#B42318]">
                    {emp.overrides}
                  </td>
                  <td className="py-3 font-mono text-xs">
                    {emp.linked_alerts_count > 0 ? (
                      <span className="font-bold text-[#B42318]">{emp.linked_alerts_count}</span>
                    ) : (
                      <span className="text-[#68766E]">0</span>
                    )}
                  </td>
                  <td className="py-3 font-mono font-black text-xs text-[#B42318]">
                    {emp.deviation_sigma}
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => navigate(`/employees/${emp.employee_id}`)}
                        className="rounded border border-[#D7E0DA] bg-[#FFFFFF] px-2.5 py-1 text-[11px] font-bold text-[#176044] hover:bg-[#E8F4ED] transition-colors cursor-pointer"
                      >
                        Profile →
                      </button>
                      <button
                        onClick={() => navigate(`/case-graph?employee=${emp.employee_id}`)}
                        className="rounded border border-[#D7E0DA] bg-[#FFFFFF] px-2.5 py-1 text-[11px] font-bold text-[#425148] hover:bg-[#F1F5F2] transition-colors cursor-pointer"
                      >
                        Graph
                      </button>
                    </div>
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
