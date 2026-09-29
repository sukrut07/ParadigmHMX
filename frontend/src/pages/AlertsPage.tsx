import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  Filter,
  Search,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Flame,
  FileCheck2,
  Sliders,
  ChevronRight,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { getAlerts, getAlertDetail } from '../services/api';
import { AlertListItem, AlertDetail, RiskTier } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { EvidencePanel } from '../components/investigation/EvidencePanel';

export const AlertsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [alerts, setAlerts] = useState<AlertListItem[]>([]);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [selectedAlertDetail, setSelectedAlertDetail] = useState<AlertDetail | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters from URL search params
  const tierFilter = searchParams.get('tier') || '';
  const statusFilter = searchParams.get('status') || '';
  const signalFilter = searchParams.get('signal_type') || '';
  const [searchTerm, setSearchTerm] = useState('');

  const loadAlerts = async () => {
    try {
      setLoadingList(true);
      setError(null);
      const res = await getAlerts({
        tier: tierFilter || undefined,
        status: statusFilter || undefined,
      });
      setAlerts(res);

      // Auto-select priority alert if none selected or current selection is not in list
      if (res.length > 0) {
        const currentSelected = selectedAlertId ? res.find((a) => a.id === selectedAlertId) : null;
        const toSelect = currentSelected || res.find((a) => a.tier === 'CRITICAL') || res[0];
        setSelectedAlertId(toSelect.id);
        loadAlertDetail(toSelect.id);
      } else {
        setSelectedAlertId(null);
        setSelectedAlertDetail(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch alert queue');
    } finally {
      setLoadingList(false);
    }
  };

  const loadAlertDetail = async (alertId: string) => {
    try {
      setLoadingDetail(true);
      const detail = await getAlertDetail(alertId);
      setSelectedAlertDetail(detail);
    } catch (err: any) {
      console.error('Failed to load alert detail for side panel:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [tierFilter, statusFilter, signalFilter]);

  const handleSelectAlert = (alertId: string) => {
    setSelectedAlertId(alertId);
    loadAlertDetail(alertId);
  };

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
      if (
        !a.title.toLowerCase().includes(signalFilter.toLowerCase()) &&
        !a.summary.toLowerCase().includes(signalFilter.toLowerCase())
      ) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-[#0d0f17] px-6 py-3 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider text-cyan-400 uppercase">
              Triage Queue & Evidence Panel
            </span>
            <span className="text-xs text-slate-400">Deterministic Prioritization</span>
          </div>
          <h1 className="mt-0.5 text-base font-bold text-slate-100">
            Correlated Financial & Insider Alerts
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {selectedAlertId && (
            <button
              onClick={() => navigate(`/investigations/${selectedAlertId}`)}
              className="flex items-center gap-1.5 rounded-lg bg-cyan-600/90 hover:bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors"
            >
              <span>3-Screen Forensic Workspace</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          )}

          <button
            onClick={loadAlerts}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-700 hover:text-slate-100 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: Left Alert Queue (7 cols), Right Mandatory Evidence/Explanation Panel (5 cols) */}
      <div className="grid grid-cols-12 flex-1 overflow-hidden">
        {/* Left Column: Filter Bar & Alert Queue */}
        <div className="col-span-7 border-r border-slate-800/80 flex flex-col bg-[#0b0d14] overflow-hidden">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-800/80 bg-slate-900/40 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search alert, employee, account..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-56 rounded-lg border border-slate-800 bg-slate-950 pl-8 pr-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              {/* Tier Filter */}
              <select
                value={tierFilter}
                onChange={(e) => updateFilter('tier', e.target.value)}
                className="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs font-mono text-slate-300 focus:border-cyan-500 focus:outline-none"
              >
                <option value="">All Tiers</option>
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => updateFilter('status', e.target.value)}
                className="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs font-mono text-slate-300 focus:border-cyan-500 focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="OPEN">OPEN</option>
                <option value="IN_REVIEW">IN REVIEW</option>
                <option value="ESCALATED">ESCALATED</option>
                <option value="CLOSED">CLOSED</option>
              </select>

              {signalFilter && (
                <div className="flex items-center gap-1 rounded bg-cyan-950/60 border border-cyan-500/40 px-2 py-0.5 text-xs text-cyan-300">
                  <span>{signalFilter}</span>
                  <button onClick={() => updateFilter('signal_type', '')} className="ml-1 text-cyan-400 hover:text-white">
                    ✕
                  </button>
                </div>
              )}
            </div>

            <span className="text-[11px] font-mono text-slate-400">
              <strong>{filteredAlerts.length}</strong> alerts
            </span>
          </div>

          {/* Alerts List Scroll Area */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 custom-scrollbar">
            {loadingList ? (
              <div className="flex h-64 items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
                  <span className="text-xs text-slate-400">Loading alerts queue...</span>
                </div>
              </div>
            ) : filteredAlerts.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center p-6 text-center text-slate-400">
                <AlertTriangle className="h-8 w-8 text-slate-500 mb-2" />
                <span className="text-sm font-semibold text-slate-300">No alerts match the selected criteria.</span>
                <p className="mt-1 text-xs text-slate-500">Try clearing filters or search terms.</p>
              </div>
            ) : (
              filteredAlerts.map((alert) => {
                const isSelected = selectedAlertId === alert.id;
                return (
                  <div
                    key={alert.id}
                    onClick={() => handleSelectAlert(alert.id)}
                    className={`cursor-pointer p-4 transition-all duration-150 ${
                      isSelected
                        ? 'border-l-4 border-cyan-500 bg-cyan-950/20 shadow-inner'
                        : 'hover:bg-slate-900/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <RiskBadge tier={alert.tier} size="sm" pulsing={alert.tier === 'CRITICAL'} />
                        <span className="font-mono text-xs font-bold text-cyan-400">{alert.id}</span>
                      </div>
                      <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono uppercase text-slate-300">
                        {alert.status}
                      </span>
                    </div>

                    <h3 className="mt-1.5 text-xs font-semibold text-slate-200 line-clamp-1">{alert.title}</h3>
                    <p className="mt-1 text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{alert.summary}</p>

                    <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
                      <div className="flex items-center gap-2">
                        {alert.employee_id ? (
                          <span className="rounded bg-orange-950/60 border border-orange-500/30 px-1.5 py-0.5 text-orange-300">
                            Emp: {alert.employee_id}
                          </span>
                        ) : (
                          <span className="text-slate-600">No Staff Tag</span>
                        )}

                        {alert.account_id && (
                          <span className="rounded bg-cyan-950/60 border border-cyan-500/30 px-1.5 py-0.5 text-cyan-300">
                            Acc: {alert.account_id}
                          </span>
                        )}
                      </div>

                      <span className="text-slate-500 text-[10px]">
                        {alert.created_at ? new Date(alert.created_at).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: MANDATORY EVIDENCE & EXPLANATION PANEL (Alongside every alert) */}
        <div className="col-span-5 flex flex-col bg-[#090a0f] overflow-hidden">
          {/* Evidence Panel Header */}
          <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-2.5 bg-slate-900/50">
            <div className="flex items-center gap-2">
              <FileCheck2 className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Mandatory Evidence & Explanation Panel
              </span>
            </div>
            {selectedAlertDetail && (
              <button
                onClick={() => navigate(`/investigations/${selectedAlertDetail.id}`)}
                className="flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300"
                title="Open full interactive Cytoscape network graph and activity timeline"
              >
                <span>Full Graph</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Evidence Panel Body */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {loadingDetail ? (
              <div className="flex h-64 items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
                  <span className="text-xs text-slate-400">Loading evidence dossier...</span>
                </div>
              </div>
            ) : selectedAlertDetail ? (
              <EvidencePanel
                alert={selectedAlertDetail}
                onCaseCreated={(newCase) => {
                  loadAlerts();
                }}
              />
            ) : (
              <div className="flex h-64 flex-col items-center justify-center p-6 text-center text-slate-500 text-xs">
                Select an alert from the queue to view its mandatory evidence and explainability dossier.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
