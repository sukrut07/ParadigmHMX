import React, { useEffect, useRef } from 'react';
import cytoscape, { Core } from 'cytoscape';
import { ZoomIn, ZoomOut, Maximize2, RefreshCw } from 'lucide-react';
import { GraphData } from '../../types';

interface CytoscapeGraphProps {
  data: GraphData | null;
  onNodeSelect?: (nodeData: any) => void;
  height?: string;
}

export const CytoscapeGraph: React.FC<CytoscapeGraphProps> = ({
  data,
  onNodeSelect,
  height = '480px',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);

  useEffect(() => {
    if (!containerRef.current || !data) return;

    // Transform elements into Cytoscape format if needed
    const elements: any[] = [];

    (data.elements?.nodes || []).forEach((n) => {
      elements.push({
        group: 'nodes',
        data: {
          id: n.data.id,
          label: n.data.label || n.data.id,
          type: String(n.data.type || 'account').toLowerCase(),
          risk: n.data.risk || 'LOW',
          sublabel: n.data.sublabel || '',
        },
      });
    });

    (data.elements?.edges || []).forEach((e) => {
      elements.push({
        group: 'edges',
        data: {
          id: e.data.id || `${e.data.source}-${e.data.target}`,
          source: e.data.source,
          target: e.data.target,
          type: String(e.data.type || e.data.relationship || 'TRANSFER').toUpperCase(),
          relationship: e.data.relationship || '',
          label: e.data.label || e.data.relationship || '',
          amount: e.data.amount,
        },
      });
    });

    // Initialize Cytoscape
    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#1e293b',
            'border-width': 2,
            'border-color': '#475569',
            'color': '#f8fafc',
            'label': 'data(label)',
            'font-size': '11px',
            'font-family': 'monospace',
            'text-valign': 'bottom',
            'text-margin-y': 6,
            'text-background-opacity': 0.85,
            'text-background-color': '#090a0f',
            'text-background-padding': '3px',
            'text-background-shape': 'roundrectangle',
            'width': 36,
            'height': 36,
          },
        },
        {
          selector: 'node[type = "employee"]',
          style: {
            'background-color': '#7c2d12',
            'border-color': '#f97316',
            'border-width': 3,
            'shape': 'hexagon',
            'width': 44,
            'height': 44,
          },
        },
        {
          selector: 'node[type = "account"]',
          style: {
            'background-color': '#083344',
            'border-color': '#06b6d4',
            'border-width': 2,
            'shape': 'roundrectangle',
            'width': 38,
            'height': 38,
          },
        },
        {
          selector: 'node[type = "customer"]',
          style: {
            'background-color': '#2e1065',
            'border-color': '#a855f7',
            'border-width': 2,
            'shape': 'ellipse',
            'width': 36,
            'height': 36,
          },
        },
        {
          selector: 'node[type = "transaction"]',
          style: {
            'background-color': '#064e3b',
            'border-color': '#10b981',
            'shape': 'diamond',
            'width': 34,
            'height': 34,
          },
        },
        {
          selector: 'node[risk = "CRITICAL"]',
          style: {
            'border-color': '#ef4444',
            'border-width': 4,
          },
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#334155',
            'target-arrow-color': '#64748b',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-size': '9px',
            'color': '#94a3b8',
            'text-rotation': 'autorotate',
            'text-background-opacity': 0.85,
            'text-background-color': '#090a0f',
            'text-background-padding': '2px',
          },
        },
        {
          selector: 'edge[type = "TRANSFER"], edge[label *= "₹"]',
          style: {
            'width': 3,
            'line-color': '#06b6d4',
            'target-arrow-color': '#06b6d4',
            'target-arrow-shape': 'triangle',
            'color': '#67e8f9',
            'font-weight': 'bold',
          },
        },
        {
          selector: 'edge[label *= "CIRCULAR"], edge[relationship *= "CIRCULAR"]',
          style: {
            'width': 4,
            'line-color': '#f43f5e',
            'target-arrow-color': '#f43f5e',
            'color': '#fda4af',
            'line-style': 'solid',
          },
        },
        {
          selector: 'edge[type = "ACCESSED"], edge[type = "EDITED"], edge[label *= "OVERRIDE"], edge[label *= "EDIT"]',
          style: {
            'width': 3,
            'line-color': '#f97316',
            'target-arrow-color': '#f97316',
            'line-style': 'dashed',
            'color': '#fdba74',
          },
        },
        {
          selector: 'edge[type = "OWNS"]',
          style: {
            'width': 2,
            'line-color': '#a855f7',
            'target-arrow-color': '#a855f7',
            'line-style': 'dotted',
            'color': '#d8b4fe',
          },
        },
        {
          selector: 'node:selected',
          style: {
            'border-color': '#38bdf8',
            'border-width': 4,
          },
        },
      ],
      layout: {
        name: 'breadthfirst',
        directed: true,
        padding: 40,
        spacingFactor: 1.3,
        animate: true,
      },
    });

    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      if (onNodeSelect) {
        onNodeSelect(node.data());
      }
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
    };
  }, [data]);

  const handleZoomIn = () => cyRef.current?.zoom(cyRef.current.zoom() * 1.25);
  const handleZoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() * 0.8);
  const handleFit = () => cyRef.current?.fit(undefined, 30);
  const handleReset = () => {
    cyRef.current?.layout({ name: 'breadthfirst', directed: true, padding: 40 }).run();
    cyRef.current?.fit();
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#090b10]">
      {/* Controls Bar */}
      <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-900/90 p-1 shadow-md backdrop-blur-md">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="rounded p-1 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="rounded p-1 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          onClick={handleFit}
          title="Fit to Screen"
          className="rounded p-1 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
        <button
          onClick={handleReset}
          title="Reset Layout"
          className="rounded p-1 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Graph Visual Legend */}
      <div className="absolute bottom-3 left-3 z-10 flex flex-wrap items-center gap-3 rounded-lg border border-slate-800/90 bg-slate-950/80 px-3 py-1.5 text-[10px] font-mono text-slate-300 backdrop-blur-sm">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded bg-orange-600 border border-orange-400"></span>
          <span>Employee</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded bg-cyan-900 border border-cyan-400"></span>
          <span>Account</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-purple-900 border border-purple-400"></span>
          <span>Customer</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1 w-3 bg-cyan-400"></span>
          <span>Money Flow (₹)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-0.5 w-3 border-t-2 border-dashed border-orange-400"></span>
          <span>Staff Action/Edit</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1 w-3 bg-rose-500"></span>
          <span>Circular Loop</span>
        </div>
      </div>

      {/* Graph Canvas */}
      <div ref={containerRef} style={{ height }} className="w-full h-full" />
    </div>
  );
};
