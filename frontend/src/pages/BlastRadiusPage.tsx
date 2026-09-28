import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Layers,
  ArrowLeft,
  ShieldAlert,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Filter,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { getEmployeeBlastRadius } from '../services/api';
import { EmployeeBlastRadius, GraphData } from '../types';
import { CytoscapeGraph } from '../components/graph/CytoscapeGraph';
import { RiskBadge } from '../components/common/RiskBadge';

export const BlastRadiusPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<EmployeeBlastRadius | null>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const res = await getEmployeeBlastRadius(id!);
        setData(res);

        // Build focused subgraph from blast radius elements
        const nodes: any[] = [
          {
            data: {
              id: res.employee.id,
              label: `${res.employee.id} (${res.role_name})`,
              type: 'employee',
              risk: res.risk_level,
              sublabel: `Branch: ${res.employee.branch_id}`,
            },
          },
        ];

        const edges: any[] = [];

        // Add accounts touched
        res.accounts_touched.forEach((accId) => {
          const isSuspicious = res.suspicious_accounts.includes(accId);
          nodes.push({
            data: {
              id: accId,
              label: accId,
              type: 'account',
              risk: isSuspicious ? 'CRITICAL' : 'LOW',
              sublabel: isSuspicious ? 'Suspicious Linked' : 'Touched Account',
            },
          });

          edges.push({
            data: {
              id: `${res.employee.id}->${accId}`,
              source: res.employee.id,
              target: accId,
              label: 'accessed / modified',
            },
          });
        });

        // Add downstream transactions following actions
        (res.transactions_following_actions || []).forEach((tx) => {
          const txNodeId = tx.transaction_id;
          nodes.push({
            data: {
              id: txNodeId,
              label: `₹${(tx.amount / 100000).toFixed(1)}L`,
              type: 'transaction',
              risk: 'HIGH',
              sublabel: tx.channel,
            },
          });

          edges.push({
            data: {
              id: `${tx.from_account}->${txNodeId}`,
              source: tx.from_account,
              target: txNodeId,
              label: 'transferred',
              amount: tx.amount,
            },
          });

          if (tx.to_account) {
            if (!nodes.find((n) => n.data.id === tx.to_account)) {
              nodes.push({
                data: {
                  id: tx.to_account,
                  label: tx.to_account,
                  type: 'account',
                  risk: 'HIGH',
                  sublabel: 'Beneficiary Account',
                },
              });
            }
            edges.push({
              data: {
                id: `${txNodeId}->${tx.to_account}`,
                source: txNodeId,
                target: tx.to_account,
                label: 'credited_to',
              },
            });
          }
        });

        setGraphData({
          elements: { nodes, edges },
          focus_entities: [res.employee.id],
          total_nodes: nodes.length,
          total_edges: edges.length,
        });
      } catch (err: any) {
        setError(err.message || 'Failed to construct blast radius subgraph');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-[#0d0f17] px-6 py-3 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/employees/${id}`)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/80 text-slate-400 hover:border-slate-700 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-semibold text-indigo-400">BLAST RADIUS</span>
            <span className="font-mono text-sm font-bold text-slate-100">{id}</span>
            {data && <RiskBadge tier={data.risk_level} size="md" pulsing={data.risk_level === 'CRITICAL'} />}
            <span className="text-xs text-slate-400">
              Interactive multi-hop impact subgraph
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {data && data.alerts_involved.length > 0 && (
            <button
              onClick={() => navigate(`/investigations/${data.alerts_involved[0]}`)}
              className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-cyan-500 shadow-lg shadow-cyan-900/30"
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Investigate Alert ({data.alerts_involved[0]})</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Canvas Area */}
      {loading ? (
        <div className="flex flex-1 items-center justify-center bg-[#090a0f]">
          <div className="flex flex-col items-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            <span className="text-xs text-slate-400">Constructing bounded subgraph...</span>
          </div>
        </div>
      ) : error || !graphData ? (
        <div className="flex flex-1 items-center justify-center bg-[#090a0f] p-6">
          <div className="max-w-md rounded-xl border border-red-500/30 bg-red-950/20 p-6 text-center">
            <AlertTriangle className="mx-auto h-8 w-8 text-red-400 mb-2" />
            <h3 className="text-sm font-bold text-red-200">Unable to load blast radius</h3>
            <p className="mt-1 text-xs text-red-300/80">{error}</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 relative overflow-hidden bg-[#090a0f]">
          {/* Cytoscape Canvas */}
          <div className="flex-1 h-full">
            <CytoscapeGraph
              data={graphData}
              height="100%"
              onNodeSelect={(n) => setSelectedNode(n)}
            />
          </div>

          {/* Floating Subgraph Info Overlay */}
          <div className="absolute top-4 left-4 z-10 rounded-xl border border-slate-800/80 bg-slate-900/90 p-3.5 backdrop-blur-md text-xs shadow-xl space-y-1.5 max-w-xs">
            <div className="font-bold text-slate-200">Impact Subgraph Summary</div>
            <div className="text-[11px] text-slate-400">
              Accounts touched: <strong className="text-slate-200">{data?.accounts_touched.length}</strong>
            </div>
            <div className="text-[11px] text-slate-400">
              Downstream transactions: <strong className="text-red-400">{data?.transactions_following_actions.length}</strong>
            </div>
            <div className="text-[11px] text-slate-400">
              Risk exposure: <strong className="text-red-400">{data?.risk_level}</strong>
            </div>
          </div>

          {/* Node Inspector Drawer */}
          {selectedNode && (
            <div className="absolute bottom-4 right-4 z-10 w-80 rounded-xl border border-slate-800/90 bg-slate-900/95 p-4 backdrop-blur-md text-xs shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-cyan-400">{selectedNode.id}</span>
                  <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] uppercase text-slate-300">
                    {selectedNode.type}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-slate-400 hover:text-slate-200"
                >
                  ✕
                </button>
              </div>

              <div className="mt-2 space-y-1 text-slate-300">
                {selectedNode.sublabel && (
                  <p className="text-[11px] text-slate-400">{selectedNode.sublabel}</p>
                )}
                {selectedNode.type === 'account' && (
                  <button
                    onClick={() => navigate(`/accounts?search=${selectedNode.id}`)}
                    className="mt-2 flex items-center gap-1 text-[11px] font-medium text-cyan-400 hover:underline"
                  >
                    View Account Ledger <ExternalLink className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
