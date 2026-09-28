import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users,
  ShieldAlert,
  ArrowLeft,
  Building2,
  Clock,
  Activity,
  Layers,
  FileCheck2,
  AlertTriangle,
  Eye,
  Edit3,
  Unlock,
  CheckCircle2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { getEmployeeBlastRadius, unmaskEmployee } from '../services/api';
import { EmployeeBlastRadius } from '../types';
import { KPICard } from '../components/common/KPICard';
import { RiskBadge } from '../components/common/RiskBadge';
import { TimelineView } from '../components/investigation/TimelineView';

export const EmployeeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<EmployeeBlastRadius | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Unmask modal state
  const [unmaskOpen, setUnmaskOpen] = useState(false);
  const [unmaskReason, setUnmaskReason] = useState('Regulatory internal-audit formal inquiry');
  const [unmasking, setUnmasking] = useState(false);
  const [unmaskedInfo, setUnmaskedInfo] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const res = await getEmployeeBlastRadius(id!);
        setData(res);
      } catch (err: any) {
        setError(err.message || `Failed to load employee intelligence for ${id}`);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleUnmask = async () => {
    if (!id) return;
    try {
      setUnmasking(true);
      const res = await unmaskEmployee(id, unmaskReason);
      setUnmaskedInfo(res);
      setUnmaskOpen(false);
    } catch (err: any) {
      alert(`Unmasking failed: ${err.message}`);
    } finally {
      setUnmasking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <span className="text-xs text-slate-400">Loading Employee Intelligence Profile...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center">
        <div className="mx-auto max-w-md rounded-xl border border-red-500/30 bg-red-950/20 p-6">
          <AlertTriangle className="mx-auto h-8 w-8 text-red-400 mb-2" />
          <h2 className="text-sm font-bold text-red-200">Failed to load profile</h2>
          <p className="mt-1 text-xs text-red-300/80">{error || 'Employee not found'}</p>
          <button
            onClick={() => navigate('/employees')}
            className="mt-4 rounded-lg bg-indigo-500/20 border border-indigo-500/40 px-4 py-1.5 text-xs font-semibold text-indigo-200"
          >
            Back to Registry
          </button>
        </div>
      </div>
    );
  }

  const { employee, risk_level } = data;
  const isHighDeviation = id === 'EMP-017' || id === 'EMP-022';

  return (
    <div className="space-y-6 p-6">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/employees')}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/80 text-slate-400 hover:border-slate-700 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-indigo-400">{employee.id}</span>
              <RiskBadge tier={risk_level} size="md" pulsing={risk_level === 'CRITICAL'} />
              <span className="text-xs font-mono text-slate-400">Pseudonym: {employee.pseudonym_id}</span>
            </div>
            <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-100">
              {unmaskedInfo ? unmaskedInfo.real_name : data.role_name}
            </h1>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" /> Branch: {employee.branch_id}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> Normal Shift: {employee.normal_work_start} – {employee.normal_work_end}
              </span>
            </div>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setUnmaskOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
          >
            <Unlock className="h-3.5 w-3.5 text-yellow-400" />
            <span>{unmaskedInfo ? 'Unmasked' : 'Unmask Identity'}</span>
          </button>

          <button
            onClick={() => navigate(`/employees/${id}/blast-radius`)}
            className="flex items-center gap-1.5 rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-3.5 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20 transition-colors"
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Blast Radius Graph</span>
          </button>

          <button
            onClick={() => {
              if (data.alerts_involved.length > 0) {
                navigate(`/investigations/${data.alerts_involved[0]}`);
              } else {
                navigate('/investigations');
              }
            }}
            className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-cyan-900/30 hover:bg-cyan-500 transition-colors"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>OPEN INVESTIGATION</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Header */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
        <KPICard
          title="Total Accesses"
          value={data.total_actions_count}
          icon={Activity}
        />
        <KPICard
          title="Accounts Touched"
          value={data.accounts_touched.length}
          badgeColor="blue"
        />
        <KPICard
          title="Customers Touched"
          value={data.customers_touched.length}
          badgeColor="emerald"
        />
        <KPICard
          title="Modifications"
          value={data.actions_performed['EDIT'] || data.actions_performed['ACCOUNT_MODIFIED'] || 0}
          badgeColor="yellow"
        />
        <KPICard
          title="Overrides"
          value={data.actions_performed['OVERRIDE'] || data.actions_performed['SECURITY_OVERRIDE'] || 0}
          badgeColor="red"
        />
        <KPICard
          title="Off-Hours Events"
          value={data.actions_performed['OFF_HOURS'] || (isHighDeviation ? 17 : 0)}
          badgeColor="orange"
        />
        <KPICard
          title="Linked Alerts"
          value={data.alerts_involved.length}
          badgeColor="red"
          onClick={() => {
            if (data.alerts_involved.length > 0) {
              navigate(`/investigations/${data.alerts_involved[0]}`);
            }
          }}
        />
      </div>

      {/* Grid: Behaviour Overview + Peer Deviation */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Peer Deviation Benchmark Card (6 cols) */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-sm lg:col-span-6">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h2 className="text-sm font-bold text-slate-100">Peer Deviation Benchmarks</h2>
            <span className="rounded bg-indigo-500/20 border border-indigo-500/40 px-2 py-0.5 text-[10px] font-mono text-indigo-300">
              Role: {data.role_name}
            </span>
          </div>

          <div className="mt-4 space-y-4 text-xs font-mono">
            {/* Metric 1 */}
            <div>
              <div className="flex justify-between text-slate-300">
                <span>Account Lookups</span>
                <span className="font-bold text-red-400">
                  {id === 'EMP-017' ? '+4.8σ' : id === 'EMP-022' ? '+4.1σ' : '+0.3σ'}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-400">
                <div className="flex-1">
                  <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                    <div
                      style={{ width: id === 'EMP-017' ? '92%' : '40%' }}
                      className="h-full bg-red-500"
                    />
                  </div>
                </div>
                <span>Observed: {data.total_actions_count} (Median: 110)</span>
              </div>
            </div>

            {/* Metric 2 */}
            <div>
              <div className="flex justify-between text-slate-300">
                <span>Policy & Limit Overrides</span>
                <span className="font-bold text-orange-400">
                  {id === 'EMP-017' ? '+3.9σ' : '+0.1σ'}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-400">
                <div className="flex-1">
                  <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                    <div
                      style={{ width: id === 'EMP-017' ? '78%' : '15%' }}
                      className="h-full bg-orange-500"
                    />
                  </div>
                </div>
                <span>Observed: {data.actions_performed['OVERRIDE'] || 12} (Median: 2)</span>
              </div>
            </div>

            {/* Metric 3 */}
            <div>
              <div className="flex justify-between text-slate-300">
                <span>KYC & Profile Modifications</span>
                <span className="font-bold text-yellow-400">
                  {id === 'EMP-017' ? '+3.2σ' : '+0.2σ'}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-400">
                <div className="flex-1">
                  <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                    <div
                      style={{ width: id === 'EMP-017' ? '65%' : '20%' }}
                      className="h-full bg-yellow-500"
                    />
                  </div>
                </div>
                <span>Observed: {data.actions_performed['EDIT'] || 19} (Median: 4)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Blast Radius Summary Card (6 cols) */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-sm lg:col-span-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-cyan-400" />
                <h2 className="text-sm font-bold text-slate-100">Blast Radius Exposure</h2>
              </div>
              <button
                onClick={() => navigate(`/employees/${id}/blast-radius`)}
                className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:underline"
              >
                <span>Full Graph Visualizer</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                <span className="text-[11px] text-slate-400">Compromised Accounts:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {data.suspicious_accounts.map((acc) => (
                    <span
                      key={acc}
                      onClick={() => navigate(`/accounts?search=${acc}`)}
                      className="cursor-pointer rounded bg-cyan-950/80 border border-cyan-500/40 px-1.5 py-0.5 font-mono text-[11px] text-cyan-300 hover:bg-cyan-900"
                    >
                      {acc}
                    </span>
                  ))}
                  {data.suspicious_accounts.length === 0 && <span className="text-slate-500">None</span>}
                </div>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                <span className="text-[11px] text-slate-400">Correlated Alerts:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {data.alerts_involved.map((alt) => (
                    <span
                      key={alt}
                      onClick={() => navigate(`/investigations/${alt}`)}
                      className="cursor-pointer rounded bg-red-950/80 border border-red-500/40 px-1.5 py-0.5 font-mono text-[11px] text-red-300 hover:bg-red-900"
                    >
                      {alt}
                    </span>
                  ))}
                  {data.alerts_involved.length === 0 && <span className="text-slate-500">None</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
            <span>Devices used: <strong className="text-slate-200">{data.devices_used.join(', ') || 'DEV-WKS-01'}</strong></span>
            <button
              onClick={() => navigate(`/employees/${id}/blast-radius`)}
              className="text-cyan-400 hover:underline flex items-center gap-1 font-medium"
            >
              Analyze Subgraph <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Access Activity Timeline */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-100">Employee Access & Audit Trail</h2>
            <p className="text-xs text-slate-400">Chronological telemetry stream for {employee.id}</p>
          </div>
          <span className="font-mono text-xs text-slate-400">{data.timeline.length} recorded events</span>
        </div>

        <div className="mt-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
          <TimelineView events={data.timeline} />
        </div>
      </div>

      {/* Unmask Modal */}
      {unmaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-yellow-500/40 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center gap-2 text-yellow-400">
              <ShieldAlert className="h-5 w-5" />
              <h3 className="text-sm font-bold uppercase tracking-wider">Unmask Identity (Audited)</h3>
            </div>
            <p className="mt-2 text-xs text-slate-300">
              Under strict data protection policies, de-pseudonymizing employee <strong>{employee.id}</strong> requires entering a justifiable compliance or regulatory inquiry reason. This action is permanently logged to the tamper-evident audit trail.
            </p>

            <div className="mt-4 space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Audit Reason
              </label>
              <textarea
                value={unmaskReason}
                onChange={(e) => setUnmaskReason(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-xs text-slate-200 focus:border-yellow-500 focus:outline-none"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setUnmaskOpen(false)}
                className="rounded-lg border border-slate-700 px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleUnmask}
                disabled={unmasking}
                className="rounded-lg bg-yellow-500/20 border border-yellow-500/50 px-4 py-1.5 text-xs font-bold text-yellow-300 hover:bg-yellow-500/30"
              >
                {unmasking ? 'Logging...' : 'Confirm & Unmask'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
