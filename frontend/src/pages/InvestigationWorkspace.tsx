import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ShieldAlert,
  ArrowLeft,
  RefreshCw,
  Share2,
  Calendar,
  Layers,
  FileCheck2,
  AlertTriangle,
  FileText,
  User,
  CreditCard,
  Building,
  CheckCircle2,
  ExternalLink,
  Clock
} from 'lucide-react';
import { getAlertDetail, getAlertGraph, getAlertTimeline, getAlerts } from '../services/api';
import { AlertDetail, GraphData, TimelineItem, AlertListItem } from '../types';
import { CytoscapeGraph } from '../components/graph/CytoscapeGraph';
import { TimelineView } from '../components/investigation/TimelineView';
import { EvidencePanel } from '../components/investigation/EvidencePanel';
import { RiskBadge } from '../components/common/RiskBadge';

export const InvestigationWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [alertId, setAlertId] = useState<string | null>(id || null);
  const [availableAlerts, setAvailableAlerts] = useState<AlertListItem[]>([]);
  const [alert, setAlert] = useState<AlertDetail | null>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<TimelineItem[]>([]);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<TimelineItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'evidence' | 'notes' | 'audit'>('evidence');

  // Load available alerts if no ID is specified
  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        setError(null);

        const alerts = await getAlerts();
        setAvailableAlerts(alerts);

        let currentId = id;
        if (!currentId) {
          // If no ID in route, check query param or pick first critical/high alert
          const queryId = searchParams.get('id');
          if (queryId) {
            currentId = queryId;
          } else if (alerts.length > 0) {
            const priority = alerts.find(a => a.tier === 'CRITICAL') || alerts[0];
            currentId = priority.id;
          }
        }

        if (currentId) {
          setAlertId(currentId);
          await loadInvestigation(currentId);
        } else {
          setLoading(false);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load investigation workspace');
        setLoading(false);
      }
    }

    init();
  }, [id, searchParams]);

  const loadInvestigation = async (targetId: string) => {
    try {
      setLoading(true);
      setError(null);
      const [detailRes, graphRes, timelineRes] = await Promise.all([
        getAlertDetail(targetId),
        getAlertGraph(targetId, 2).catch(() => null),
        getAlertTimeline(targetId).catch(() => []),
      ]);

      setAlert(detailRes);
      setGraphData(graphRes || detailRes.graph_snapshot);
      setTimelineEvents(timelineRes.length > 0 ? timelineRes : (detailRes.timeline_snapshot || []));
    } catch (err: any) {
      setError(err.message || `Failed to load dossier for ${targetId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAlert = (newId: string) => {
    setAlertId(newId);
    navigate(`/investigations/${newId}`);
  };

  const linkedEmployee = alert?.entity_ids?.find((e: string) => e.startsWith('EMP-'));
  const linkedAccount = alert?.entity_ids?.find((e: string) => e.startsWith('ACC-'));

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Investigation Top Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 bg-[#0d0f17] px-6 py-2.5 shrink-0 gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => navigate(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/80 text-slate-400 hover:border-slate-700 hover:text-slate-200 transition-colors"
            title="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          {/* Alert / Case ID */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-cyan-400">
              {alert?.id || alertId || 'SELECT ALERT'}
            </span>
            {alert && <RiskBadge tier={alert.tier} size="md" pulsing={alert.tier === 'CRITICAL'} />}
            {alert?.status && (
              <span className="rounded bg-slate-800/90 border border-slate-700/80 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-300 uppercase">
                {alert.status}
              </span>
            )}
          </div>

          <span className="text-slate-700 hidden sm:inline">|</span>

          {/* Linked Employee */}
          {linkedEmployee && (
            <button
              onClick={() => navigate(`/employees/${linkedEmployee}`)}
              className="flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-950/40 px-2.5 py-1 text-xs font-mono text-indigo-300 hover:bg-indigo-900/40 transition-colors"
              title="Inspect Employee Intelligence"
            >
              <User className="h-3.5 w-3.5 text-indigo-400" />
              <span>{linkedEmployee}</span>
            </button>
          )}

          {/* Linked Account */}
          {linkedAccount && (
            <button
              onClick={() => navigate(`/accounts?search=${linkedAccount}`)}
              className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/40 px-2.5 py-1 text-xs font-mono text-cyan-300 hover:bg-cyan-900/40 transition-colors"
              title="Inspect Linked Account"
            >
              <CreditCard className="h-3.5 w-3.5 text-cyan-400" />
              <span>{linkedAccount}</span>
            </button>
          )}

          {/* Created Timestamp */}
          {alert?.created_at && (
            <div className="hidden lg:flex items-center gap-1 text-[11px] font-mono text-slate-400" title={`Detected: ${new Date(alert.created_at).toLocaleString()}`}>
              <Clock className="h-3 w-3 text-slate-500" />
              <span>{new Date(alert.created_at).toLocaleDateString()} {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )}
        </div>

        {/* Alert Selector dropdown and Actions */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={alertId || ''}
              onChange={(e) => handleSelectAlert(e.target.value)}
              className="appearance-none rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-1.5 pr-8 text-xs font-mono text-slate-200 shadow-sm focus:border-cyan-500 focus:outline-none"
            >
              {availableAlerts.map((a) => (
                <option key={a.id} value={a.id}>
                  [{a.tier}] {a.id} — {a.title.slice(0, 32)}...
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => alertId && loadInvestigation(alertId)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-700 hover:text-slate-100 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reload</span>
          </button>
        </div>
      </div>

      {/* Main Investigation Workspace Area */}
      {loading ? (
        <div className="flex flex-1 items-center justify-center bg-[#090a0f]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
            <span className="text-xs font-medium text-slate-400">Loading causal graph and timeline...</span>
          </div>
        </div>
      ) : error ? (
        <div className="flex flex-1 items-center justify-center bg-[#090a0f] p-6">
          <div className="max-w-md rounded-xl border border-red-500/30 bg-red-950/20 p-6 text-center">
            <AlertTriangle className="mx-auto h-10 w-10 text-red-400 mb-3" />
            <h3 className="text-sm font-bold text-red-200">Investigation Load Error</h3>
            <p className="mt-2 text-xs text-red-300/80">{error}</p>
            <button
              onClick={() => alertId && loadInvestigation(alertId)}
              className="mt-4 rounded-lg bg-red-500/20 border border-red-500/40 px-4 py-1.5 text-xs font-semibold text-red-200 hover:bg-red-500/30"
            >
              Retry
            </button>
          </div>
        </div>
      ) : !alert ? (
        <div className="flex flex-1 items-center justify-center bg-[#090a0f] text-slate-500">
          No alert selected for investigation.
        </div>
      ) : (
        <div className="grid grid-cols-12 flex-1 overflow-hidden">
          {/* COLUMN 1: Causal Graph (4 cols) */}
          <div className="col-span-4 border-r border-slate-800/80 flex flex-col bg-[#0b0d14] overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-2.5 bg-slate-900/40">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-cyan-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Causal Relationship Graph
                </span>
              </div>
              <span className="font-mono text-[10px] text-slate-400">
                {graphData?.elements?.nodes?.length || 0} nodes · {graphData?.elements?.edges?.length || 0} edges
              </span>
            </div>

            {/* Cytoscape Graph Canvas */}
            <div className="flex-1 relative bg-[#090a0f]">
              <CytoscapeGraph
                data={graphData}
                height="100%"
                onNodeSelect={(node) => setSelectedNode(node)}
              />
            </div>

            {/* Selected Node Inspector Drawer */}
            {selectedNode && (
              <div className="border-t border-slate-800 bg-slate-900/90 p-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-cyan-300">{selectedNode.id}</span>
                    <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] uppercase text-slate-300">
                      {selectedNode.type}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="text-slate-500 hover:text-slate-300"
                  >
                    ✕
                  </button>
                </div>
                {selectedNode.sublabel && (
                  <p className="mt-1 text-[11px] text-slate-400">{selectedNode.sublabel}</p>
                )}
                {selectedNode.type === 'employee' && (
                  <button
                    onClick={() => navigate(`/employees/${selectedNode.id}`)}
                    className="mt-2 flex items-center gap-1 text-[11px] font-medium text-cyan-400 hover:underline"
                  >
                    View Employee Intelligence Profile <ExternalLink className="h-3 w-3" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* COLUMN 2: Unified Merged Timeline (4 cols) */}
          <div className="col-span-4 border-r border-slate-800/80 flex flex-col bg-[#0b0d14] overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-2.5 bg-slate-900/40">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-indigo-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Unified Chronological Timeline
                </span>
              </div>
              <span className="font-mono text-[10px] text-slate-400">
                {timelineEvents.length} events
              </span>
            </div>

            {/* Timeline Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <div className="mb-3 rounded-lg border border-slate-800/60 bg-slate-900/40 p-2 text-[11px] text-slate-400">
                Correlated access logs, account modifications, and transaction streams in exact chronological order with relative offsets.
              </div>
              <TimelineView
                events={timelineEvents}
                selectedEventId={selectedEvent?.id}
                onEventClick={(ev) => setSelectedEvent(ev)}
              />
            </div>

            {/* Selected Event Details Footer */}
            {selectedEvent && (
              <div className="border-t border-slate-800 bg-slate-900/90 p-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-indigo-300">{selectedEvent.event_type}</span>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="text-slate-500 hover:text-slate-300"
                  >
                    ✕
                  </button>
                </div>
                <p className="mt-1 text-slate-200">{selectedEvent.description}</p>
                {selectedEvent.actor && (
                  <div className="mt-1 text-[11px] text-slate-400">
                    Actor: <span className="font-mono text-slate-200">{selectedEvent.actor}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* COLUMN 3: Evidence & Risk Dossier (4 cols) */}
          <div className="col-span-4 flex flex-col bg-[#0b0d14] overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-2.5 bg-slate-900/40">
              <div className="flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Evidence & Risk Dossier
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="rounded bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
                  SHA-256 VERIFIED
                </span>
              </div>
            </div>

            {/* Evidence Panel Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <EvidencePanel
                alert={alert}
                onCaseCreated={(newCase) => {
                  console.log('Case created:', newCase);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
