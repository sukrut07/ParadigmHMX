import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Network,
  ArrowLeft,
  RefreshCw,
  User,
  CreditCard,
  Building,
  ArrowRightLeft,
  ExternalLink,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  Info,
  Clock,
  Layers,
  FileCheck2,
  Filter,
  CheckCircle2,
  X
} from 'lucide-react';
import { getAlertDetail, getAlertGraph, getAlerts } from '../services/api';
import { AlertDetail, GraphData, AlertListItem } from '../types';
import { CytoscapeGraph } from '../components/graph/CytoscapeGraph';
import { RiskBadge } from '../components/common/RiskBadge';

export const CaseGraphPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [alertId, setAlertId] = useState<string | null>(id || null);
  const [availableAlerts, setAvailableAlerts] = useState<AlertListItem[]>([]);
  const [alert, setAlert] = useState<AlertDetail | null>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [selectedEdge, setSelectedEdge] = useState<any>(null);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [contextPanelOpen, setContextPanelOpen] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        setError(null);

        const alerts = await getAlerts();
        setAvailableAlerts(alerts);

        let currentId = id;
        if (!currentId) {
          const queryId = searchParams.get('alert') || searchParams.get('id');
          if (queryId) {
            currentId = queryId;
          } else if (alerts.length > 0) {
            const priority = alerts.find((a) => a.tier === 'CRITICAL') || alerts[0];
            currentId = priority.id;
          }
        }

        if (currentId) {
          setAlertId(currentId);
          await loadCaseGraph(currentId);
        } else {
          setLoading(false);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load case relationship graph');
        setLoading(false);
      }
    }

    init();
  }, [id, searchParams]);

  const loadCaseGraph = async (targetId: string) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedNode(null);
      setSelectedEdge(null);

      const [detailRes, graphRes] = await Promise.all([
        getAlertDetail(targetId),
        getAlertGraph(targetId, 2).catch(() => null),
      ]);

      setAlert(detailRes);
      // Ensure graph data is normalized
      const activeGraph = graphRes || detailRes.graph_snapshot;
      setGraphData(activeGraph);
    } catch (err: any) {
      setError(err.message || `Failed to load graph for alert ${targetId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAlert = (newId: string) => {
    setAlertId(newId);
    navigate(`/case-graph?alert=${newId}`);
  };

  const linkedEmployee = alert?.entity_ids?.find((e: string) => e.startsWith('EMP-'));
  const linkedAccount = alert?.entity_ids?.find((e: string) => e.startsWith('ACC-'));

  const nodeCount = graphData?.total_nodes || graphData?.elements?.nodes?.length || 0;
  const edgeCount = graphData?.total_edges || graphData?.elements?.edges?.length || 0;

  return (
    <div className="flex flex-col h-[calc(100vh-3.75rem)] overflow-hidden bg-[#F8FAF9]">
      {/* ── 1. Top Header Bar ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#D7E0DA] bg-[#FFFFFF] px-6 py-2.5 shrink-0 gap-3 shadow-xs">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Back link to Investigation Dossier */}
          <button
            onClick={() => navigate(alertId ? `/investigations/${alertId}` : '/investigations')}
            className="flex items-center gap-1.5 rounded-lg border border-[#D7E0DA] bg-[#F1F5F2] px-2.5 py-1.5 text-xs font-semibold text-[#176044] hover:bg-[#E5F4EC] transition-colors cursor-pointer"
            title="Return to evidence dossier"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Investigation</span>
          </button>

          <span className="text-[#D7E0DA] hidden sm:inline">|</span>

          {/* Page Title & Alert Badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#17221C]">
              CASE GRAPH
            </span>
            <span className="font-mono text-xs font-bold bg-[#F1F5F2] text-[#17221C] border border-[#D7E0DA] px-2 py-0.5 rounded">
              {alert?.id || alertId || 'SELECT ALERT'}
            </span>
            {alert && <RiskBadge tier={alert.tier} size="sm" pulsing={alert.tier === 'CRITICAL'} />}
            {alert?.status && (
              <span className="rounded bg-[#FFF8E7] border border-[#E9CF8B] px-2 py-0.5 text-[10px] font-mono font-bold text-[#8A5A00] uppercase">
                {alert.status}
              </span>
            )}
          </div>

          <span className="text-[#D7E0DA] hidden md:inline">|</span>

          {/* Primary Linked Entities */}
          {linkedEmployee && (
            <button
              onClick={() => navigate(`/employees/${linkedEmployee}`)}
              className="hidden sm:flex items-center gap-1.5 rounded-lg border border-[#B8DCC8] bg-[#E8F6EE] px-2 py-0.5 text-xs font-mono font-bold text-[#123B2A] hover:bg-[#D5EBDD] transition-colors cursor-pointer"
            >
              <User className="h-3 w-3 text-[#20A36A]" />
              <span>{linkedEmployee}</span>
            </button>
          )}

          {linkedAccount && (
            <button
              onClick={() => navigate(`/accounts?search=${linkedAccount}`)}
              className="hidden sm:flex items-center gap-1.5 rounded-lg border border-[#328CCB]/40 bg-[#EAF4FB] px-2 py-0.5 text-xs font-mono font-bold text-[#164765] hover:bg-[#D5EBFB] transition-colors cursor-pointer"
            >
              <CreditCard className="h-3 w-3 text-[#328CCB]" />
              <span>{linkedAccount}</span>
            </button>
          )}
        </div>

        {/* Right: Alert Selector & Reload */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <select
              value={alertId || ''}
              onChange={(e) => handleSelectAlert(e.target.value)}
              className="appearance-none rounded-lg border border-[#D7E0DA] bg-[#FFFFFF] px-3.5 py-1.5 pr-8 text-xs font-mono font-semibold text-[#17221C] shadow-xs focus:border-[#176044] focus:outline-none cursor-pointer"
            >
              {availableAlerts.map((a) => (
                <option key={a.id} value={a.id}>
                  [{a.tier}] {a.id} — {a.title.slice(0, 32)}...
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => alertId && loadCaseGraph(alertId)}
            className="flex items-center gap-1.5 rounded-lg border border-[#D7E0DA] bg-[#FFFFFF] px-3 py-1.5 text-xs font-bold text-[#17221C] hover:bg-[#F1F5F2] hover:border-[#B8C6BD] transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5 text-[#425148]" />
            <span>Reload</span>
          </button>

          {/* Toggle Case Context Panel */}
          <button
            onClick={() => setContextPanelOpen((prev) => !prev)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              contextPanelOpen
                ? 'border-[#B8DCC8] bg-[#E8F6EE] text-[#176044]'
                : 'border-[#D7E0DA] bg-[#FFFFFF] text-[#425148] hover:bg-[#F1F5F2]'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Context</span>
          </button>
        </div>
      </div>

      {/* ── 2. Entity Filter Toolbar ─────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-[#D7E0DA] bg-[#FFFFFF] px-6 py-2 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#68766E] mr-2 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" />
            <span>Filters:</span>
          </span>

          {[
            { id: 'ALL', label: 'All Entities' },
            { id: 'EMPLOYEE', label: 'Employees' },
            { id: 'ACCOUNT', label: 'Accounts' },
            { id: 'CUSTOMER', label: 'Customers' },
            { id: 'TRANSACTION', label: 'Transactions' },
            { id: 'ACTIONS', label: 'Staff Actions Only' },
          ].map((tab) => {
            const isActive = filterType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#176044] text-white shadow-xs'
                    : 'bg-[#F1F5F2] text-[#425148] hover:bg-[#EAF1EC]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="font-mono text-xs text-[#68766E] font-medium hidden md:block">
          {nodeCount} connected entities · {edgeCount} relationships
        </div>
      </div>

      {/* ── 3. Interactive Visual Canvas Area ────────────────────────── */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* Main Graph Area */}
        <div className="flex-1 relative h-full">
          {loading ? (
            <div className="flex h-full w-full items-center justify-center bg-[#F8FAF9]">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#176044] border-t-transparent" />
                <span className="text-xs font-semibold text-[#425148]">Tracing causal relationships...</span>
              </div>
            </div>
          ) : error ? (
            <div className="flex h-full w-full items-center justify-center bg-[#F8FAF9] p-6">
              <div className="max-w-md rounded-xl border border-[#F3B5B0] bg-[#FDECEC] p-6 text-center shadow-xs">
                <AlertTriangle className="mx-auto h-10 w-10 text-[#B42318] mb-3" />
                <h3 className="text-sm font-bold text-[#B42318]">Graph Generation Error</h3>
                <p className="mt-2 text-xs text-[#B42318]/90">{error}</p>
                <button
                  onClick={() => alertId && loadCaseGraph(alertId)}
                  className="mt-4 rounded-lg bg-[#B42318] text-white px-4 py-1.5 text-xs font-bold hover:bg-[#911B13] cursor-pointer"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : nodeCount === 0 ? (
            /* Clean Empty Graph State as per Section 25 */
            <div className="flex h-full w-full items-center justify-center bg-[#F8FAF9] p-6">
              <div className="max-w-md rounded-xl border border-[#D7E0DA] bg-[#FFFFFF] p-8 text-center shadow-xs">
                <Network className="mx-auto h-10 w-10 text-[#8A958E] mb-3" />
                <h3 className="text-sm font-bold text-[#17221C] uppercase tracking-wider">
                  No Relationships Available
                </h3>
                <p className="mt-2 text-xs text-[#68766E] leading-relaxed">
                  This alert does not currently contain enough linked entities to construct a relationship graph.
                </p>
                <button
                  onClick={() => alertId && navigate(`/investigations/${alertId}`)}
                  className="mt-4 rounded-lg px-4 py-2 text-xs font-bold text-white transition-colors cursor-pointer"
                  style={{ background: '#176044' }}
                >
                  View Source Events &amp; Evidence
                </button>
              </div>
            </div>
          ) : (
            <CytoscapeGraph
              data={graphData}
              filterType={filterType}
              onNodeSelect={(node) => {
                setSelectedNode(node);
                setSelectedEdge(null);
              }}
              onEdgeSelect={(edge) => {
                setSelectedEdge(edge);
                setSelectedNode(null);
              }}
              height="100%"
            />
          )}

          {/* Node Inspector Floating Drawer */}
          {selectedNode && (
            <div className="absolute left-6 top-6 z-20 w-80 rounded-xl border border-[#D7E0DA] bg-[#FFFFFF] p-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#D7E0DA] pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-extrabold text-sm text-[#176044]">{selectedNode.id}</span>
                  <span className="rounded bg-[#F1F5F2] border border-[#D7E0DA] px-2 py-0.5 text-[10px] uppercase font-bold text-[#17221C]">
                    {selectedNode.type}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-[#68766E] hover:text-[#17221C] cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 space-y-2 text-xs">
                {selectedNode.sublabel && (
                  <div className="text-[11px] text-[#425148] font-medium bg-[#F1F5F2] p-2 rounded">
                    {selectedNode.sublabel}
                  </div>
                )}

                {selectedNode.type === 'employee' && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[#68766E]">Role:</span>
                      <span className="font-bold text-[#17221C]">{selectedNode.properties?.role_id || 'Staff'}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[#68766E]">Branch:</span>
                      <span className="font-bold text-[#17221C]">{selectedNode.properties?.branch_id || 'Branch BR-01'}</span>
                    </div>
                    <button
                      onClick={() => navigate(`/employees/${selectedNode.id}`)}
                      className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-lg border border-[#B8DCC8] bg-[#E8F6EE] px-3 py-2 text-xs font-bold text-[#176044] hover:bg-[#D5EBDD] cursor-pointer"
                    >
                      <span>VIEW EMPLOYEE PROFILE →</span>
                    </button>
                  </div>
                )}

                {selectedNode.type === 'account' && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[#68766E]">Status:</span>
                      <span className="font-bold text-[#17221C]">{selectedNode.properties?.status || 'ACTIVE'}</span>
                    </div>
                    {selectedNode.properties?.daily_limit && (
                      <div className="flex justify-between text-[11px]">
                        <span className="text-[#68766E]">Daily Limit:</span>
                        <span className="font-bold text-[#17221C]">₹{Number(selectedNode.properties.daily_limit).toLocaleString()}</span>
                      </div>
                    )}
                    <button
                      onClick={() => navigate(`/accounts?search=${selectedNode.id}`)}
                      className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-lg border border-[#328CCB]/40 bg-[#EAF4FB] px-3 py-2 text-xs font-bold text-[#164765] hover:bg-[#D5EBFB] cursor-pointer"
                    >
                      <span>VIEW ACCOUNT LEDGER →</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Edge Inspector Floating Drawer */}
          {selectedEdge && (
            <div className="absolute left-6 top-6 z-20 w-84 rounded-xl border border-[#D7E0DA] bg-[#FFFFFF] p-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#D7E0DA] pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold uppercase text-[#17221C]">RELATIONSHIP EVIDENCE</span>
                  <span className="rounded bg-[#EAF7F0] border border-[#B8DCC8] px-2 py-0.5 text-[10px] font-mono font-bold text-[#176044]">
                    {selectedEdge.type}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedEdge(null)}
                  className="text-[#68766E] hover:text-[#17221C] cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#68766E]">Action / Label:</span>
                  <span className="font-bold text-[#17221C]">{selectedEdge.label || selectedEdge.relationship}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#68766E]">Source Entity:</span>
                  <span className="font-mono font-bold text-[#176044]">{selectedEdge.source}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#68766E]">Target Entity:</span>
                  <span className="font-mono font-bold text-[#176044]">{selectedEdge.target}</span>
                </div>
                {selectedEdge.amount && (
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#68766E]">Transfer Amount:</span>
                    <span className="font-mono font-extrabold text-[#17221C]">₹{Number(selectedEdge.amount).toLocaleString()}</span>
                  </div>
                )}
                {selectedEdge.timestamp && (
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#68766E]">Timestamp:</span>
                    <span className="font-mono text-[#425148]">{new Date(selectedEdge.timestamp).toLocaleTimeString()}</span>
                  </div>
                )}

                <div className="mt-3 pt-2 border-t border-[#D7E0DA] text-[11px] text-[#68766E]">
                  Verified chronological record linking staff activity with ledger interaction.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── 4. Collapsible Case Context Panel ───────────────────────── */}
        {contextPanelOpen && (
          <aside className="w-80 border-l border-[#D7E0DA] bg-[#FFFFFF] flex flex-col h-full overflow-y-auto shrink-0 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#D7E0DA] px-4 py-3 bg-[#FFFFFF]">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-[#176044]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#17221C]">
                  CASE CONTEXT
                </span>
              </div>
              <button
                onClick={() => setContextPanelOpen(false)}
                className="text-[#68766E] hover:text-[#17221C] cursor-pointer"
                title="Collapse Panel"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 space-y-4 text-xs">
              {/* Alert Summary Box */}
              <div className="rounded-lg border border-[#D7E0DA] bg-[#F1F5F2] p-3">
                <div className="text-[10px] font-mono font-bold uppercase text-[#68766E]">Alert Focus</div>
                <div className="mt-1 font-bold text-[#17221C] text-sm leading-snug">{alert?.title}</div>
                <div className="mt-2 text-[11px] text-[#425148] leading-relaxed">
                  {alert?.summary?.slice(0, 160)}...
                </div>
              </div>

              {/* Context Entity Counters */}
              <div className="space-y-2 border-t border-[#D7E0DA] pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-[#68766E]">Primary Employee</span>
                  <span className="font-mono font-bold text-[#176044]">{linkedEmployee || 'EMP-017'}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#68766E]">Primary Account</span>
                  <span className="font-mono font-bold text-[#176044]">{linkedAccount || 'ACC-9738FBB'}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#68766E]">Connected Entities</span>
                  <span className="font-extrabold text-[#17221C]">{nodeCount}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#68766E]">Relationships</span>
                  <span className="font-extrabold text-[#17221C]">{edgeCount}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#68766E]">Risk Signals</span>
                  <span className="font-extrabold text-[#17221C]">{alert?.signal_ids?.length || 4}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#68766E]">Adjudication State</span>
                  <span className="rounded bg-[#FFF8E7] border border-[#E9CF8B] px-2 py-0.5 text-[10px] font-bold text-[#8A5A00]">
                    {alert?.status || 'OPEN'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-[#D7E0DA]">
                <button
                  onClick={() => alertId && navigate(`/investigations/${alertId}`)}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-[#D7E0DA] bg-[#FFFFFF] px-3 py-2 text-xs font-bold text-[#17221C] hover:bg-[#F1F5F2] transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Return to Evidence Dossier</span>
                </button>

                <button
                  onClick={() => navigate('/cases')}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-white transition-colors cursor-pointer"
                  style={{ background: '#176044' }}
                >
                  <FileCheck2 className="h-3.5 w-3.5" />
                  <span>Case Management</span>
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
