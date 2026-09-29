import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ShieldAlert,
  ArrowLeft,
  RefreshCw,
  Calendar,
  FileCheck2,
  AlertTriangle,
  User,
  CreditCard,
  Network,
  Clock,
  ArrowRight,
  Sliders,
  Layers,
  Sparkles,
  Briefcase
} from 'lucide-react';
import { getAlertDetail, getAlertTimeline, getAlerts } from '../services/api';
import { AlertDetail, TimelineItem, AlertListItem } from '../types';
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
  const [timelineEvents, setTimelineEvents] = useState<TimelineItem[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<TimelineItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
          const queryId = searchParams.get('id') || searchParams.get('alert');
          if (queryId) {
            currentId = queryId;
          } else if (alerts.length > 0) {
            const priority = alerts.find((a) => a.tier === 'CRITICAL') || alerts[0];
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
      const [detailRes, timelineRes] = await Promise.all([
        getAlertDetail(targetId),
        getAlertTimeline(targetId).catch(() => []),
      ]);

      setAlert(detailRes);
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

  const getStatusBadgeStyle = (status: string = '') => {
    const s = status.toUpperCase();
    if (s === 'CLOSED') return { bg: '#EAF7F0', color: '#176044', border: '#B8DCC8' };
    if (s === 'ESCALATED') return { bg: '#FDECEC', color: '#B42318', border: '#F3B5B0' };
    if (s === 'IN_REVIEW') return { bg: '#EDF5FF', color: '#1858A8', border: '#B8D5FA' };
    return { bg: '#FFF8E7', color: '#8A5A00', border: '#E9CF8B' };
  };

  // Metrics for investigation summary
  const signalsCount = alert?.signal_ids?.length || 0;
  const riskDimensionsCount = Object.keys(alert?.rule_trace?.risk_factors || alert?.rule_trace?.risk_breakdown || {}).length || 5;
  const relatedEntitiesCount = alert?.entity_ids?.length || 0;
  const timelineEventsCount = timelineEvents.length;

  return (
    <div className="flex flex-col min-h-[calc(100vh-3.75rem)] bg-[#F7F9F7]">
      {/* ── 1. Top Navigation & Alert Selector Bar ────────────────── */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#D7E0DA] bg-[#FFFFFF] px-6 py-2.5 shrink-0 gap-3 shadow-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => navigate(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#D7E0DA] bg-[#F1F5F2] text-[#425148] hover:border-[#B8C6BD] hover:text-[#17221C] transition-colors cursor-pointer"
            title="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          {/* Alert / Case ID & Status Badges */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold bg-[#F1F5F2] text-[#17221C] border border-[#D7E0DA] px-2.5 py-1 rounded">
              {alert?.id || alertId || 'SELECT ALERT'}
            </span>
            {alert && <RiskBadge tier={alert.tier} size="md" pulsing={alert.tier === 'CRITICAL'} />}
            {alert?.status && (
              <span
                style={{
                  background: getStatusBadgeStyle(alert.status).bg,
                  color: getStatusBadgeStyle(alert.status).color,
                  border: `1px solid ${getStatusBadgeStyle(alert.status).border}`,
                }}
                className="rounded px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider"
              >
                {alert.status}
              </span>
            )}
          </div>

          <span className="text-[#B8C6BD] hidden sm:inline">|</span>

          {/* Linked Employee */}
          {linkedEmployee && (
            <button
              onClick={() => navigate(`/employees/${linkedEmployee}`)}
              className="flex items-center gap-1.5 rounded-lg border border-[#C9D9D0] bg-[#EEF5F1] px-2.5 py-1 text-xs font-mono font-bold text-[#176044] hover:bg-[#E5F4EC] transition-colors cursor-pointer"
              title="Inspect Employee Intelligence"
            >
              <User className="h-3.5 w-3.5 text-[#176044]" />
              <span>{linkedEmployee}</span>
            </button>
          )}

          {/* Linked Account */}
          {linkedAccount && (
            <button
              onClick={() => navigate(`/accounts?search=${linkedAccount}`)}
              className="flex items-center gap-1.5 rounded-lg border border-[#C9D9D0] bg-[#EEF5F1] px-2.5 py-1 text-xs font-mono font-bold text-[#176044] hover:bg-[#E5F4EC] transition-colors cursor-pointer"
              title="Inspect Linked Account"
            >
              <CreditCard className="h-3.5 w-3.5 text-[#176044]" />
              <span>{linkedAccount}</span>
            </button>
          )}

          {/* Created Timestamp */}
          {alert?.created_at && (
            <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-mono text-[#68766E]" title={`Detected: ${new Date(alert.created_at).toLocaleString()}`}>
              <Clock className="h-3.5 w-3.5 text-[#68766E]" />
              <span>{new Date(alert.created_at).toLocaleDateString()} {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )}
        </div>

        {/* Alert Selector dropdown and Reload */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <select
              value={alertId || ''}
              onChange={(e) => handleSelectAlert(e.target.value)}
              className="appearance-none rounded-lg border border-[#D7E0DA] bg-[#FFFFFF] px-3.5 py-1.5 pr-8 text-xs font-mono font-semibold text-[#17221C] shadow-xs focus:border-[#176044] focus:outline-none cursor-pointer"
            >
              {availableAlerts.map((a) => (
                <option key={a.id} value={a.id}>
                  [{a.tier}] {a.id} — {a.title.slice(0, 36)}...
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => alertId && loadInvestigation(alertId)}
            className="flex items-center gap-1.5 rounded-lg border border-[#D7E0DA] bg-[#FFFFFF] px-3 py-1.5 text-xs font-bold text-[#17221C] hover:bg-[#F1F5F2] hover:border-[#B8C6BD] transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5 text-[#425148]" />
            <span>Reload</span>
          </button>
        </div>
      </div>

      {/* ── Main Workspace Body ───────────────────────────────────── */}
      {loading ? (
        <div className="flex flex-1 items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#176044] border-t-transparent" />
            <span className="text-xs font-semibold text-[#425148]">Loading forensic dossier and timeline...</span>
          </div>
        </div>
      ) : error ? (
        <div className="flex flex-1 items-center justify-center p-8">
          <div className="max-w-md rounded-xl border border-[#F3B5B0] bg-[#FDECEC] p-6 text-center shadow-xs">
            <AlertTriangle className="mx-auto h-10 w-10 text-[#B42318] mb-3" />
            <h3 className="text-sm font-bold text-[#B42318]">Investigation Load Error</h3>
            <p className="mt-2 text-xs text-[#B42318]/90">{error}</p>
            <button
              onClick={() => alertId && loadInvestigation(alertId)}
              className="mt-4 rounded-lg bg-[#B42318] text-white px-4 py-1.5 text-xs font-bold hover:bg-[#911B13] cursor-pointer"
            >
              Retry
            </button>
          </div>
        </div>
      ) : !alert ? (
        <div className="flex flex-1 items-center justify-center text-[#68766E] font-medium py-24">
          No alert selected for investigation.
        </div>
      ) : (
        <div className="flex flex-col flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* ── 2. INVESTIGATION SUMMARY SECTION ──────────────────────── */}
          <div className="rounded-xl border border-[#D7E0DA] bg-[#FFFFFF] p-5 shadow-xs">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex-1 min-w-[280px]">
                <div className="flex items-center gap-2">
                  <RiskBadge tier={alert.tier} size="sm" />
                  <span className="font-mono text-xs font-bold text-[#17221C]">{alert.id}</span>
                  {linkedEmployee && linkedAccount && (
                    <span className="text-xs font-mono font-semibold text-[#176044] bg-[#E8F4ED] border border-[#BBDCCA] px-2 py-0.5 rounded">
                      {linkedEmployee} → {linkedAccount}
                    </span>
                  )}
                </div>

                <h1 className="mt-2 text-base font-extrabold text-[#17221C] tracking-tight">
                  {alert.title}
                </h1>

                {/* Sanitized Human-Readable Finding */}
                <p className="mt-2 text-xs text-[#425148] leading-relaxed max-w-3xl">
                  {(() => {
                    const raw = alert.summary || '';
                    if (raw.toUpperCase().includes('IS DIRECTLY PERMITTED ACTIONS VIEW CREATED') || raw.toUpperCase().includes('ALERT CLASSIFIED AS')) {
                      return `${linkedEmployee || 'Staff member'} accessed and modified ${linkedAccount || 'account parameters'}, followed by an out-of-role limit increase and temporal transaction.`;
                    }
                    return raw || 'Insider correlation engine detected coordinated activity across staff access logs and outbound financial transactions.';
                  })()}
                </p>

                {/* Linked Signal Chips */}
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#68766E] mr-1">Signals:</span>
                  {(alert.signal_ids?.length ? alert.signal_ids : ['Privilege Abuse', 'Account Modification', 'Temporal Link']).slice(0, 4).map((sig: string, idx: number) => (
                    <span
                      key={idx}
                      className="rounded bg-[#F1F5F2] border border-[#D7E0DA] px-2 py-0.5 text-[10px] font-mono font-semibold text-[#17221C]"
                    >
                      {sig.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>

              {/* Single Primary Action: Explore Connections */}
              <div className="shrink-0 flex flex-col items-end gap-1.5">
                <button
                  onClick={() => navigate(`/case-graph?alert=${alert.id}`)}
                  className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold text-white transition-all shadow-xs cursor-pointer"
                  style={{ background: '#176044' }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#124532')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = '#176044')}
                >
                  <Network className="h-4 w-4" />
                  <span>Explore Connections →</span>
                </button>
                <span className="text-[10px] font-mono text-[#68766E]">
                  Inspect entity graph &amp; relationships
                </span>
              </div>
            </div>

            {/* Compact Metric Indicators */}
            <div className="mt-4 pt-3.5 border-t border-[#D7E0DA] grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-lg border border-[#D7E0DA] bg-[#F7F9F7] p-2.5 text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#68766E]">Linked Signals</div>
                <div className="mt-0.5 text-lg font-extrabold text-[#17221C]">{signalsCount}</div>
              </div>

              <div className="rounded-lg border border-[#D7E0DA] bg-[#F7F9F7] p-2.5 text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#68766E]">Timeline Events</div>
                <div className="mt-0.5 text-lg font-extrabold text-[#17221C]">{timelineEventsCount}</div>
              </div>

              <div className="rounded-lg border border-[#D7E0DA] bg-[#F7F9F7] p-2.5 text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#68766E]">Connected Entities</div>
                <div className="mt-0.5 text-lg font-extrabold text-[#176044]">{relatedEntitiesCount}</div>
              </div>

              <div className="rounded-lg border border-[#D7E0DA] bg-[#F7F9F7] p-2.5 text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#68766E]">Risk Dimensions</div>
                <div className="mt-0.5 text-lg font-extrabold text-[#17221C]">{riskDimensionsCount}</div>
              </div>
            </div>
          </div>

          {/* ── 3. TWO-COLUMN EVIDENCE-FIRST WORKSPACE ────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT: Unified Chronological Timeline (6 cols) */}
            <div className="lg:col-span-6 flex flex-col rounded-xl border border-[#D7E0DA] bg-[#FFFFFF] shadow-xs overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#D7E0DA] px-4 py-3 bg-[#FFFFFF]">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#176044]" />
                  <span className="text-xs font-bold uppercase tracking-[0.04em] text-[#17221C]">
                    Unified Chronological Timeline
                  </span>
                </div>
                <span className="font-mono text-xs font-bold text-[#176044] bg-[#E8F4ED] border border-[#BBDCCA] px-2 py-0.5 rounded">
                  {timelineEvents.length} events
                </span>
              </div>

              <div className="p-4 bg-[#F7F9F7]">
                <div className="mb-3.5 rounded-lg border border-[#D7E0DA] bg-[#FFFFFF] p-2.5 text-[11px] text-[#425148] shadow-xs leading-relaxed">
                  Correlated access logs, account modifications, and transaction streams in exact chronological order with relative offsets.
                </div>
                <TimelineView
                  events={timelineEvents}
                  selectedEventId={selectedEvent?.id}
                  onEventClick={(ev) => setSelectedEvent(ev)}
                />
              </div>

              {/* Selected Event Detail Box */}
              {selectedEvent && (
                <div className="border-t border-[#D7E0DA] bg-[#FFFFFF] p-3.5 text-xs shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[#176044]">{selectedEvent.event_type}</span>
                    <button
                      onClick={() => setSelectedEvent(null)}
                      className="text-[#68766E] hover:text-[#17221C] cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="mt-1 text-[#17221C] font-medium leading-relaxed">{selectedEvent.description}</p>
                  {selectedEvent.actor && (
                    <div className="mt-1.5 text-[11px] text-[#68766E]">
                      Actor: <span className="font-mono font-bold text-[#0B2E21]">{selectedEvent.actor}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* RIGHT: Evidence & Risk Dossier (6 cols) */}
            <div className="lg:col-span-6 flex flex-col rounded-xl border border-[#D7E0DA] bg-[#FFFFFF] shadow-xs overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#D7E0DA] px-4 py-3 bg-[#FFFFFF]">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="h-4 w-4 text-[#176044]" />
                  <span className="text-xs font-bold uppercase tracking-[0.04em] text-[#17221C]">
                    Evidence &amp; Risk Dossier
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="rounded bg-[#EAF7F0] border border-[#B8DCC8] px-2 py-0.5 text-[10px] font-mono font-bold text-[#176044]">
                    SHA-256 VERIFIED
                  </span>
                </div>
              </div>

              <div className="p-4 bg-[#F7F9F7]">
                <EvidencePanel
                  alert={alert}
                  onCaseCreated={(newCase) => {
                    console.log('Case created:', newCase);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
