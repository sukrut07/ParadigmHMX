import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  Filter,
  Search,
  ArrowUpDown,
  RefreshCw,
  ExternalLink,
  Flame,
  ShieldAlert
} from 'lucide-react';
import { getAlerts } from '../services/api';
import { AlertListItem, RiskTier } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';

export const AlertsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [alerts, setAlerts] = useState<AlertListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters from URL search params
  const tierFilter = searchParams.get('tier') || '';
  const statusFilter = searchParams.get('status') || '';
  const signalFilter = searchParams.get('signal_type') || '';
  const [searchTerm, setSearchTerm] = useState('');

  const loadAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAlerts({
        tier: tierFilter || undefined,
        status: statusFilter || undefined,
      });
      setAlerts(res);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch alert queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [tierFilter, statusFilter, signalFilter]);

  const updateFilter = (key: string, val: string) => {
    const next = new URLSearchParams(searchParams);
    if (val) {
      next.set(key, val);
    } else {
      next.delete(key);
    }
    setSearchParams(next);
  };

  const filteredAlerts = alerts.filter((a) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        a.id.toLowerCase().includes(q) ||
        a.title.toLowerCase().includes(q) ||
        (a.employee_id && a.employee_id.toLowerCase().includes(q)) ||
        (a.account_id && a.account_id.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (signalFilter) {
      if (!a.title.toLowerCase().includes(signalFilter.toLowerCase()) && !a.summary.toLowerCase().includes(signalFilter.toLowerCase())) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider text-cyan-400 uppercase">
              Alert Queue
            </span>
            <span className="text-xs text-slate-400">Deterministic Prioritization</span>
          </div>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-100">
            Correlated Financial & Insider Alerts
          </h1>
          <p className="text-xs text-slate-400">
            Triaged incidents ranked by risk tier and multi-hop entity linkage
          </p>
        </div>

        <button
          onClick={loadAlerts}
          className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-700 hover:text-slate-100 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800/80 bg-slate-900/60 p-3.5 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Term Input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search alert, employee, account..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 rounded-lg border border-slate-800 bg-slate-950/80 pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Tier Filter */}
          <select
            value={tierFilter}
            onChange={(e) => updateFilter('tier', e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-1.5 text-xs font-mono text-slate-300 focus:border-cyan-500 focus:outline-none"
          >
            <option value="">All Risk Tiers</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => updateFilter('status', e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-1.5 text-xs font-mono text-slate-300 focus:border-cyan-500 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">OPEN</option>
            <option value="IN_REVIEW">IN REVIEW</option>
            <option value="ESCALATED">ESCALATED</option>
            <option value="CLOSED">CLOSED</option>
          </select>

          {signalFilter && (
            <div className="flex items-center gap-1 rounded bg-cyan-950/60 border border-cyan-500/40 px-2 py-1 text-xs text-cyan-300">
              <span>Signal: {signalFilter}</span>
              <button
                onClick={() => updateFilter('signal_type', '')}
                className="ml-1 text-cyan-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        <div className="text-xs font-mono text-slate-400">
          Showing <strong>{filteredAlerts.length}</strong> alerts
        </div>
      </div>

      {/* Alerts Table */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
              <span className="text-xs text-slate-400">Loading alerts...</span>
            </div>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center p-6 text-center text-slate-400">
            <AlertTriangle className="h-8 w-8 text-slate-500 mb-2" />
            <span className="text-sm font-semibold text-slate-300">No alerts match the selected criteria.</span>
            <p className="mt-1 text-xs text-slate-500">Try clearing filters or search terms.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3 pl-4">Tier</th>
                  <th className="py-3">Alert ID</th>
                  <th className="py-3">Incident Summary</th>
                  <th className="py-3">Linked Employee</th>
                  <th className="py-3">Target Account</th>
                  <th className="py-3">Status</th>
                  <th className="py-3">Detected</th>
                  <th className="py-3 pr-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredAlerts.map((alert) => (
                  <tr
                    key={alert.id}
                    onClick={() => navigate(`/investigations/${alert.id}`)}
                    className="cursor-pointer transition-colors hover:bg-slate-800/40"
                  >
                    <td className="py-3.5 pl-4 font-sans">
                      <RiskBadge tier={alert.tier} size="sm" pulsing={alert.tier === 'CRITICAL'} />
                    </td>
                    <td className="py-3.5 font-bold text-cyan-400">{alert.id}</td>
                    <td className="py-3.5 font-sans text-slate-200 max-w-sm truncate" title={alert.title}>
                      {alert.title}
                    </td>
                    <td className="py-3.5 text-slate-300">
                      {alert.employee_id ? (
                        <span className="rounded bg-orange-950/60 border border-orange-500/30 px-1.5 py-0.5 text-orange-400">
                          {alert.employee_id}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="py-3.5 text-slate-300">
                      {alert.account_id ? (
                        <span className="rounded bg-cyan-950/60 border border-cyan-500/30 px-1.5 py-0.5 text-cyan-400">
                          {alert.account_id}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="py-3.5 font-sans">
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] uppercase text-slate-300">
                        {alert.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-400 text-[11px]">
                      {alert.created_at ? new Date(alert.created_at).toLocaleDateString() : 'Recent'}
                    </td>
                    <td className="py-3.5 pr-4 text-right font-sans">
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
        )}
      </div>
    </div>
  );
};
