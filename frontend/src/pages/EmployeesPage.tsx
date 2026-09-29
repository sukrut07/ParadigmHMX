import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Users,
  Search,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Building2,
  Clock,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  AlertTriangle,
  Activity,
  Layers,
  CheckCircle2,
  Briefcase
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  Cell
} from 'recharts';
import { getEmployees, getAuditDashboard } from '../services/api';
import { Employee, DashboardAuditData } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';

interface EmployeesPageProps {
  initialTab?: 'employees' | 'behaviour' | 'privilege';
}

export const EmployeesPage: React.FC<EmployeesPageProps> = ({ initialTab = 'employees' }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active tab selection
  const queryTab = searchParams.get('tab') as 'employees' | 'behaviour' | 'privilege' | null;
  const [activeTab, setActiveTab] = useState<'employees' | 'behaviour' | 'privilege'>(queryTab || initialTab);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [auditData, setAuditData] = useState<DashboardAuditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState(searchParams.get('branch') || '');
  const [riskFilter, setRiskFilter] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [empRes, auditRes] = await Promise.all([
        getEmployees(),
        getAuditDashboard('INTERNAL_AUDITOR').catch(() => null),
      ]);
      setEmployees(empRes);
      setAuditData(auditRes);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch employee registry and audit telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleTabChange = (tab: 'employees' | 'behaviour' | 'privilege') => {
    setActiveTab(tab);
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set('tab', tab);
      return p;
    });
  };

  const roles = Array.from(new Set(employees.map((e) => e.role_id || 'Staff'))).filter(Boolean);
  const branches = Array.from(new Set(employees.map((e) => e.branch_id))).filter(Boolean);

  // Match audit table rows with employee list
  const auditMap = new Map<string, any>();
  if (auditData?.employee_table) {
    auditData.employee_table.forEach((row: any) => auditMap.set(row.employee_id, row));
  }

  const filteredEmployees = employees.filter((emp) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        emp.id.toLowerCase().includes(q) ||
        (emp.role_id && emp.role_id.toLowerCase().includes(q)) ||
        (emp.branch_id && emp.branch_id.toLowerCase().includes(q)) ||
        (emp.pseudonym_id && emp.pseudonym_id.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (branchFilter && emp.branch_id !== branchFilter) return false;
    if (roleFilter && emp.role_id !== roleFilter) return false;

    const auditInfo = auditMap.get(emp.id);
    const risk = auditInfo?.risk || (emp.id === 'EMP-017' ? 'CRITICAL' : emp.id === 'EMP-022' ? 'HIGH' : 'LOW');
    if (riskFilter && risk !== riskFilter) return false;

    return true;
  });

  // Selected Branch Drill-down calculation
  const selectedBranchData = branchFilter ? {
    branch_id: branchFilter,
    total_employees: employees.filter((e) => e.branch_id === branchFilter).length,
    high_risk_employees: employees.filter((e) => e.branch_id === branchFilter && (auditMap.get(e.id)?.risk === 'CRITICAL' || auditMap.get(e.id)?.risk === 'HIGH')).length,
    alerts: auditData?.branch_risk?.[branchFilter]?.active_alerts ?? 4,
    anomalies: auditData?.branch_risk?.[branchFilter]?.anomalies ?? 9,
    privilege_events: 6,
    account_changes: 9,
  } : null;

  // Behaviour deviation data for Recharts
  const behaviourDevData = (auditData?.top_deviations || [
    { employee_id: 'EMP-017', role: 'Operations Analyst', lookups: 82, peer_mean: 14.2 },
    { employee_id: 'EMP-022', role: 'Branch Manager', lookups: 54, peer_mean: 14.2 },
    { employee_id: 'EMP-009', role: 'Senior Teller', lookups: 38, peer_mean: 14.2 },
    { employee_id: 'EMP-011', role: 'Relationship Mgr', lookups: 29, peer_mean: 14.2 },
    { employee_id: 'EMP-004', role: 'Teller', lookups: 22, peer_mean: 14.2 },
  ]).map((d: any) => ({
    name: d.employee_id,
    role: d.role,
    Observed: d.lookups,
    PeerAverage: Math.round(d.peer_mean),
  }));

  // Privilege comparison data for Recharts (Assigned vs Observed)
  const privilegeComparisonData = [
    { category: 'Customer Record Lookups', Assigned: 40, Observed: 85 },
    { category: 'Account Modifications', Assigned: 10, Observed: 28 },
    { category: 'Privileged Overrides', Assigned: 2, Observed: 14 },
    { category: 'Off-Hours Operations', Assigned: 0, Observed: 8 },
    { category: 'Out-of-Role Approvals', Assigned: 0, Observed: 6 },
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-3.75rem)] bg-[#F7F9F7] p-6 space-y-6 max-w-7xl w-full mx-auto">
      {/* ── 1. Page Header ────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#D7E0DA] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-[#E8F4ED] border border-[#BBDCCA] px-2.5 py-0.5 text-[10px] font-mono font-bold tracking-wider text-[#176044] uppercase">
              Staff Risk Surveillance
            </span>
            <span className="text-xs text-[#68766E] font-mono">Internal Auditor Intelligence</span>
          </div>
          <h1 className="mt-1 text-xl font-black tracking-tight text-[#17221C]">
            Employee Risk, Behaviour &amp; Privilege
          </h1>
          <p className="text-xs text-[#425148] mt-0.5">
            Surveillance of monitored personnel, behavioural baseline deviations, and out-of-role privilege execution
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            className="flex items-center gap-1.5 rounded-lg border border-[#D7E0DA] bg-[#FFFFFF] px-3 py-1.5 text-xs font-bold text-[#17221C] hover:bg-[#F1F5F2] hover:border-[#B8C6BD] transition-colors cursor-pointer shadow-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-[#425148] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ── 2. Perspective Navigation Tabs ───────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-[#D7E0DA]">
        <button
          onClick={() => handleTabChange('employees')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'employees'
              ? 'border-[#176044] text-[#176044] bg-[#FFFFFF] rounded-t-lg'
              : 'border-transparent text-[#68766E] hover:text-[#17221C]'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Employees Registry</span>
          <span className="ml-1 rounded-full bg-[#F1F5F2] px-2 py-0.5 text-[10px] font-mono text-[#425148]">
            {employees.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange('behaviour')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'behaviour'
              ? 'border-[#176044] text-[#176044] bg-[#FFFFFF] rounded-t-lg'
              : 'border-transparent text-[#68766E] hover:text-[#17221C]'
          }`}
        >
          <Eye className="h-4 w-4" />
          <span>Behavioural Deviations</span>
          <span className="ml-1 rounded-full bg-[#FFF0E8] text-[#A34800] px-2 py-0.5 text-[10px] font-mono font-bold">
            {auditData?.top_deviations?.length || 5} active
          </span>
        </button>

        <button
          onClick={() => handleTabChange('privilege')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'privilege'
              ? 'border-[#176044] text-[#176044] bg-[#FFFFFF] rounded-t-lg'
              : 'border-transparent text-[#68766E] hover:text-[#17221C]'
          }`}
        >
          <ShieldAlert className="h-4 w-4" />
          <span>Privilege &amp; Permissions</span>
          <span className="ml-1 rounded-full bg-[#FDECEC] text-[#B42318] px-2 py-0.5 text-[10px] font-mono font-bold">
            {auditData?.kpis?.privilege_violations || 6} violations
          </span>
        </button>
      </div>

      {/* ── 3. TAB 1: EMPLOYEES REGISTRY ─────────────────────────────── */}
      {activeTab === 'employees' && (
        <div className="space-y-6">
          {/* Filter Bar with Branch Drill-Down */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#D7E0DA] bg-[#FFFFFF] p-3.5 shadow-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#68766E]" />
                <input
                  type="text"
                  placeholder="Search employee ID, role, branch..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 rounded-lg border border-[#D7E0DA] bg-[#FFFFFF] pl-9 pr-3 py-1.5 text-xs text-[#17221C] placeholder-[#68766E] focus:border-[#176044] focus:outline-none"
                />
              </div>

              {/* Role Filter */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="rounded-lg border border-[#D7E0DA] bg-[#FFFFFF] px-3 py-1.5 text-xs font-semibold text-[#17221C] focus:border-[#176044] focus:outline-none cursor-pointer"
              >
                <option value="">All Roles</option>
                {roles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>

              {/* Branch Filter */}
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="rounded-lg border border-[#D7E0DA] bg-[#FFFFFF] px-3 py-1.5 text-xs font-semibold text-[#17221C] focus:border-[#176044] focus:outline-none cursor-pointer"
              >
                <option value="">All Branches</option>
                {branches.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>

              {/* Risk Tier Filter */}
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="rounded-lg border border-[#D7E0DA] bg-[#FFFFFF] px-3 py-1.5 text-xs font-semibold text-[#17221C] focus:border-[#176044] focus:outline-none cursor-pointer"
              >
                <option value="">All Risk Tiers</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High Risk</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            <div className="text-xs font-mono text-[#68766E]">
              Showing <strong>{filteredEmployees.length}</strong> of {employees.length} personnel profiles
            </div>
          </div>

          {/* Branch Drill-Down Summary Card (Section 30) */}
          {selectedBranchData && (
            <div className="rounded-xl border border-[#BBDCCA] bg-[#E8F4ED]/60 p-4 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#BBDCCA] pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-[#176044]" />
                  <span className="font-extrabold text-sm text-[#17221C]">
                    BRANCH DRILL-DOWN: {selectedBranchData.branch_id}
                  </span>
                </div>
                <button
                  onClick={() => setBranchFilter('')}
                  className="text-xs text-[#176044] hover:underline font-semibold cursor-pointer"
                >
                  Clear branch filter
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                <div className="rounded-lg bg-[#FFFFFF] border border-[#D7E0DA] p-2.5">
                  <div className="text-[10px] font-bold uppercase text-[#68766E]">Employees</div>
                  <div className="text-lg font-black text-[#17221C]">{selectedBranchData.total_employees}</div>
                </div>
                <div className="rounded-lg bg-[#FFFFFF] border border-[#D7E0DA] p-2.5">
                  <div className="text-[10px] font-bold uppercase text-[#68766E]">High-Risk Staff</div>
                  <div className="text-lg font-black text-[#B42318]">{selectedBranchData.high_risk_employees}</div>
                </div>
                <div className="rounded-lg bg-[#FFFFFF] border border-[#D7E0DA] p-2.5">
                  <div className="text-[10px] font-bold uppercase text-[#68766E]">Active Alerts</div>
                  <div className="text-lg font-black text-[#A34800]">{selectedBranchData.alerts}</div>
                </div>
                <div className="rounded-lg bg-[#FFFFFF] border border-[#D7E0DA] p-2.5">
                  <div className="text-[10px] font-bold uppercase text-[#68766E]">Privilege Events</div>
                  <div className="text-lg font-black text-[#176044]">{selectedBranchData.privilege_events}</div>
                </div>
                <div className="rounded-lg bg-[#FFFFFF] border border-[#D7E0DA] p-2.5">
                  <div className="text-[10px] font-bold uppercase text-[#68766E]">Account Changes</div>
                  <div className="text-lg font-black text-[#17221C]">{selectedBranchData.account_changes}</div>
                </div>
              </div>
            </div>
          )}

          {/* Employees Table */}
          <div className="rounded-xl border border-[#D7E0DA] bg-[#FFFFFF] shadow-xs overflow-hidden">
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#176044] border-t-transparent" />
                  <span className="text-xs text-[#68766E]">Loading staff records...</span>
                </div>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center p-6 text-center text-[#68766E]">
                <Users className="h-8 w-8 text-[#B8C6BD] mb-2" />
                <span className="text-sm font-semibold text-[#17221C]">No employee records found.</span>
                <span className="text-xs mt-1">Try resetting filters to view all personnel.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#D7E0DA] bg-[#F7F9F7] text-[10px] font-bold uppercase tracking-wider text-[#68766E]">
                    <tr>
                      <th className="py-3 pl-4">Employee ID</th>
                      <th className="py-3">Pseudonym</th>
                      <th className="py-3">Role / Designation</th>
                      <th className="py-3">Branch Location</th>
                      <th className="py-3">Shift Hours</th>
                      <th className="py-3">Risk Assessment</th>
                      <th className="py-3">Peer Deviation</th>
                      <th className="py-3 pr-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D7E0DA]">
                    {filteredEmployees.map((emp) => {
                      const auditInfo = auditMap.get(emp.id);
                      const riskTier = auditInfo?.risk || (emp.id === 'EMP-017' ? 'CRITICAL' : emp.id === 'EMP-022' ? 'HIGH' : 'LOW');
                      const sigma = auditInfo?.deviation_sigma || (emp.id === 'EMP-017' ? '+3.4σ' : emp.id === 'EMP-022' ? '+2.1σ' : '0.0σ');

                      return (
                        <tr
                          key={emp.id}
                          className="hover:bg-[#F7F9F7] transition-colors cursor-pointer"
                          onClick={() => navigate(`/employees/${emp.id}`)}
                        >
                          <td className="py-3 pl-4 font-mono font-bold text-[#176044]">
                            {emp.id}
                          </td>
                          <td className="py-3 font-mono text-[#68766E]">
                            {emp.pseudonym_id}
                          </td>
                          <td className="py-3 font-semibold text-[#17221C]">
                            {emp.role_id || 'Staff'}
                          </td>
                          <td className="py-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setBranchFilter(emp.branch_id);
                              }}
                              className="inline-flex items-center gap-1 rounded bg-[#F1F5F2] border border-[#D7E0DA] px-2 py-0.5 font-mono text-[11px] font-semibold text-[#17221C] hover:border-[#176044]"
                            >
                              <Building2 className="h-3 w-3 text-[#68766E]" />
                              {emp.branch_id}
                            </button>
                          </td>
                          <td className="py-3 font-mono text-[11px] text-[#68766E]">
                            {emp.normal_work_start} – {emp.normal_work_end}
                          </td>
                          <td className="py-3">
                            <RiskBadge tier={riskTier} size="sm" />
                          </td>
                          <td className="py-3 font-mono font-bold text-xs">
                            <span className={sigma.startsWith('+') && parseFloat(sigma.replace('+', '')) >= 2.0 ? 'text-[#B42318]' : 'text-[#68766E]'}>
                              {sigma}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-right">
                            <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => navigate(`/employees/${emp.id}`)}
                                className="flex items-center gap-1 rounded border border-[#D7E0DA] bg-[#FFFFFF] px-2.5 py-1 text-[11px] font-bold text-[#176044] hover:bg-[#E8F4ED] transition-colors cursor-pointer"
                              >
                                <span>History</span>
                                <ArrowRight className="h-3 w-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 4. TAB 2: BEHAVIOURAL DEVIATIONS (Section 39) ─────────────── */}
      {activeTab === 'behaviour' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Visual Recharts Bar Chart: Peer Deviations (7 cols) */}
            <div className="lg:col-span-7 rounded-xl border border-[#D7E0DA] bg-[#FFFFFF] p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#D7E0DA] pb-3 mb-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#17221C]">
                    Peer Lookup Deviations (Observed vs Baseline)
                  </h3>
                  <p className="text-[11px] text-[#68766E] mt-0.5">
                    Customer record access volume compared against peer group baseline
                  </p>
                </div>
                <span className="rounded bg-[#FFF0E8] border border-[#F3C7B0] text-[#A34800] px-2 py-0.5 text-[10px] font-mono font-bold">
                  Top Anomaly Ranking
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={behaviourDevData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5ECE7" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#68766E' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#68766E' }} />
                    <Tooltip
                      contentStyle={{
                        background: '#FFFFFF',
                        border: '1px solid #D7E0DA',
                        borderRadius: 8,
                        fontSize: 12,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="Observed" fill="#A34800" radius={[4, 4, 0, 0]} name="Observed Lookups" />
                    <Bar dataKey="PeerAverage" fill="#B8C6BD" radius={[4, 4, 0, 0]} name="Peer Average" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Behavioural Anomalies Summary Box (5 cols) */}
            <div className="lg:col-span-5 rounded-xl border border-[#D7E0DA] bg-[#FFFFFF] p-5 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#17221C] border-b border-[#D7E0DA] pb-3 mb-3">
                  Institutional Anomaly Clusters
                </h3>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F7F9F7] border border-[#D7E0DA]">
                    <div className="flex items-center gap-2">
                      <Search className="h-3.5 w-3.5 text-[#176044]" />
                      <span className="text-xs font-semibold text-[#17221C]">Bulk Customer Record Lookups</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#17221C]">
                      {auditData?.behaviour_anomalies?.bulk_lookup ?? 34} events
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F7F9F7] border border-[#D7E0DA]">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-3.5 w-3.5 text-[#B42318]" />
                      <span className="text-xs font-semibold text-[#17221C]">Privilege Overrides</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#B42318]">
                      {auditData?.behaviour_anomalies?.overrides ?? 18} events
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F7F9F7] border border-[#D7E0DA]">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-[#A34800]" />
                      <span className="text-xs font-semibold text-[#17221C]">Off-Hours System Access</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#A34800]">
                      {auditData?.behaviour_anomalies?.off_hours ?? 8} events
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F7F9F7] border border-[#D7E0DA]">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="h-3.5 w-3.5 text-[#1858A8]" />
                      <span className="text-xs font-semibold text-[#17221C]">Critical Limit Modifications</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#1858A8]">
                      {auditData?.behaviour_anomalies?.limit_changes ?? 12} events
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#D7E0DA] flex items-center justify-between">
                <span className="text-xs text-[#68766E]">Need complete historical trace?</span>
                <button
                  onClick={() => navigate('/cases?role=auditor')}
                  className="flex items-center gap-1 text-xs font-bold text-[#176044] hover:underline cursor-pointer"
                >
                  <span>Open Auditor Cases</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>

          {/* High-Deviation Staff Table */}
          <div className="rounded-xl border border-[#D7E0DA] bg-[#FFFFFF] shadow-xs overflow-hidden">
            <div className="border-b border-[#D7E0DA] bg-[#F7F9F7] px-4 py-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#17221C]">
                Personnel With Active Behavioural Deviations (&gt; 1.5σ)
              </span>
              <span className="text-xs font-mono text-[#68766E]">
                Evaluated against 30-day rolling baseline
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#D7E0DA] bg-[#FFFFFF] text-[10px] font-bold uppercase tracking-wider text-[#68766E]">
                  <tr>
                    <th className="py-3 pl-4">Employee ID</th>
                    <th className="py-3">Role</th>
                    <th className="py-3">Observed Lookups</th>
                    <th className="py-3">Peer Group Baseline</th>
                    <th className="py-3">Sigma Deviation</th>
                    <th className="py-3">Primary Anomaly Signal</th>
                    <th className="py-3 pr-4 text-right">Adjudication</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D7E0DA]">
                  {(auditData?.top_deviations || []).map((dev: any, idx: number) => (
                    <tr key={idx} className="hover:bg-[#F7F9F7] transition-colors">
                      <td className="py-3 pl-4 font-mono font-bold text-[#176044]">
                        {dev.employee_id}
                      </td>
                      <td className="py-3 text-[#17221C] font-semibold">
                        {dev.role}
                      </td>
                      <td className="py-3 font-mono font-bold text-[#A34800]">
                        {dev.lookups}
                      </td>
                      <td className="py-3 font-mono text-[#68766E]">
                        {dev.peer_mean}
                      </td>
                      <td className="py-3 font-mono font-extrabold text-[#B42318]">
                        {dev.deviation_sigma}
                      </td>
                      <td className="py-3 text-xs text-[#425148]">
                        {dev.employee_id === 'EMP-017' ? 'Privilege Override & Rapid Exfiltration' : 'Uncorrelated Customer Lookups'}
                      </td>
                      <td className="py-3 pr-4 text-right">
                        <button
                          onClick={() => navigate(`/employees/${dev.employee_id}`)}
                          className="rounded border border-[#D7E0DA] bg-[#FFFFFF] px-2.5 py-1 text-[11px] font-bold text-[#176044] hover:bg-[#E8F4ED] transition-colors cursor-pointer"
                        >
                          Examine Profile →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. TAB 3: PRIVILEGE & PERMISSIONS (Section 40) ────────────── */}
      {activeTab === 'privilege' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Visual Recharts Grouped Bar Chart: Assigned vs Observed (7 cols) */}
            <div className="lg:col-span-7 rounded-xl border border-[#D7E0DA] bg-[#FFFFFF] p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#D7E0DA] pb-3 mb-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#17221C]">
                    Assigned vs. Observed Privilege Profile
                  </h3>
                  <p className="text-[11px] text-[#68766E] mt-0.5">
                    Comparison of permissible operational boundaries versus executed system actions
                  </p>
                </div>
                <span className="rounded bg-[#FDECEC] border border-[#F3B5B0] text-[#B42318] px-2 py-0.5 text-[10px] font-mono font-bold">
                  Excess Execution
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={privilegeComparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5ECE7" />
                    <XAxis
                      dataKey="category"
                      tick={{ fontSize: 10, fill: '#68766E' }}
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis tick={{ fontSize: 11, fill: '#68766E' }} />
                    <Tooltip
                      contentStyle={{
                        background: '#FFFFFF',
                        border: '1px solid #D7E0DA',
                        borderRadius: 8,
                        fontSize: 12,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      }}
                    />
                    <Legend verticalAlign="top" wrapperStyle={{ fontSize: 11, paddingBottom: 10 }} />
                    <Bar dataKey="Assigned" fill="#176044" radius={[4, 4, 0, 0]} name="Assigned Permission" />
                    <Bar dataKey="Observed" fill="#B42318" radius={[4, 4, 0, 0]} name="Observed Execution" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Privilege Risk Diagnostics Card (5 cols) */}
            <div className="lg:col-span-5 rounded-xl border border-[#D7E0DA] bg-[#FFFFFF] p-5 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#17221C] border-b border-[#D7E0DA] pb-3 mb-3">
                  Privilege Violation Metrics
                </h3>

                <div className="space-y-3">
                  <div className="rounded-lg border border-[#D7E0DA] bg-[#F7F9F7] p-3">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#68766E]">Out-of-Role Actions</div>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-2xl font-black text-[#B42318]">24</span>
                      <span className="text-xs text-[#68766E]">across 4 operational roles</span>
                    </div>
                    <p className="mt-1 text-[11px] text-[#425148]">
                      Tellers initiating limit increments and operations analysts overriding authorization blocks.
                    </p>
                  </div>

                  <div className="rounded-lg border border-[#D7E0DA] bg-[#F7F9F7] p-3">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#68766E]">Managerial Overrides</div>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-2xl font-black text-[#A34800]">18</span>
                      <span className="text-xs text-[#68766E]">flagged for absence of dual-control</span>
                    </div>
                    <p className="mt-1 text-[11px] text-[#425148]">
                      Override actions executed without required second-sign-off approval token.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#D7E0DA]">
                <button
                  onClick={() => navigate('/case-graph?view=privilege')}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold text-white shadow-xs cursor-pointer"
                  style={{ background: '#176044' }}
                >
                  <ShieldAlert className="h-3.5 w-3.5" />
                  <span>Inspect Privilege Blast Radius</span>
                </button>
              </div>
            </div>
          </div>

          {/* Privilege Events Surveillance Table */}
          <div className="rounded-xl border border-[#D7E0DA] bg-[#FFFFFF] shadow-xs overflow-hidden">
            <div className="border-b border-[#D7E0DA] bg-[#F7F9F7] px-4 py-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#17221C]">
                Monitored Privilege Audit Log
              </span>
              <span className="text-xs font-mono text-[#68766E]">
                Immutable system event log
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#D7E0DA] bg-[#FFFFFF] text-[10px] font-bold uppercase tracking-wider text-[#68766E]">
                  <tr>
                    <th className="py-3 pl-4">Staff Member</th>
                    <th className="py-3">Assigned Role</th>
                    <th className="py-3">Permitted Actions</th>
                    <th className="py-3">Observed Violation</th>
                    <th className="py-3">Target Account</th>
                    <th className="py-3">Status</th>
                    <th className="py-3 pr-4 text-right">Investigation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D7E0DA]">
                  <tr className="hover:bg-[#F7F9F7] transition-colors">
                    <td className="py-3 pl-4 font-mono font-bold text-[#176044]">EMP-017</td>
                    <td className="py-3 text-[#17221C] font-semibold">Operations Analyst</td>
                    <td className="py-3 font-mono text-[11px] text-[#68766E]">VIEW, SEARCH</td>
                    <td className="py-3 font-mono font-bold text-[#B42318]">OVERRIDE, LIMIT_CHANGE</td>
                    <td className="py-3 font-mono text-[#17221C]">ACC-0231</td>
                    <td className="py-3">
                      <span className="rounded bg-[#FDECEC] border border-[#F3B5B0] text-[#B42318] px-2 py-0.5 text-[10px] font-mono font-bold">
                        CRITICAL ALERT
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <button
                        onClick={() => navigate('/investigations')}
                        className="rounded border border-[#D7E0DA] bg-[#FFFFFF] px-2.5 py-1 text-[11px] font-bold text-[#176044] hover:bg-[#E8F4ED] transition-colors cursor-pointer"
                      >
                        Investigate Alert →
                      </button>
                    </td>
                  </tr>

                  <tr className="hover:bg-[#F7F9F7] transition-colors">
                    <td className="py-3 pl-4 font-mono font-bold text-[#176044]">EMP-022</td>
                    <td className="py-3 text-[#17221C] font-semibold">Branch Manager</td>
                    <td className="py-3 font-mono text-[11px] text-[#68766E]">APPROVE, VIEW</td>
                    <td className="py-3 font-mono font-bold text-[#A34800]">OFF_HOURS_ACCESS</td>
                    <td className="py-3 font-mono text-[#17221C]">ACC-9738</td>
                    <td className="py-3">
                      <span className="rounded bg-[#FFF0E8] border border-[#F3C7B0] text-[#A34800] px-2 py-0.5 text-[10px] font-mono font-bold">
                        HIGH RISK
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <button
                        onClick={() => navigate('/investigations')}
                        className="rounded border border-[#D7E0DA] bg-[#FFFFFF] px-2.5 py-1 text-[11px] font-bold text-[#176044] hover:bg-[#E8F4ED] transition-colors cursor-pointer"
                      >
                        Investigate Alert →
                      </button>
                    </td>
                  </tr>

                  <tr className="hover:bg-[#F7F9F7] transition-colors">
                    <td className="py-3 pl-4 font-mono font-bold text-[#176044]">EMP-009</td>
                    <td className="py-3 text-[#17221C] font-semibold">Senior Teller</td>
                    <td className="py-3 font-mono text-[11px] text-[#68766E]">LOOKUP, DEPOSIT</td>
                    <td className="py-3 font-mono font-bold text-[#8A5A00]">BULK_LOOKUP</td>
                    <td className="py-3 font-mono text-[#17221C]">14 Accounts</td>
                    <td className="py-3">
                      <span className="rounded bg-[#FFF7E8] border border-[#E9CF8B] text-[#8A5A00] px-2 py-0.5 text-[10px] font-mono font-bold">
                        MEDIUM RISK
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <button
                        onClick={() => navigate('/employees/EMP-009')}
                        className="rounded border border-[#D7E0DA] bg-[#FFFFFF] px-2.5 py-1 text-[11px] font-bold text-[#176044] hover:bg-[#E8F4ED] transition-colors cursor-pointer"
                      >
                        Examine Staff →
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
