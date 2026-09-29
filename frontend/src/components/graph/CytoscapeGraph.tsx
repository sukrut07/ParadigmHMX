import React, { useEffect, useRef, useState } from 'react';
import cytoscape, { Core } from 'cytoscape';
import { ZoomIn, ZoomOut, Maximize2, RefreshCw } from 'lucide-react';
import { GraphData } from '../../types';

interface CytoscapeGraphProps {
  data: GraphData | null;
  onNodeSelect?: (nodeData: any) => void;
  onEdgeSelect?: (edgeData: any) => void;
  filterType?: string;
  height?: string;
}

export const CytoscapeGraph: React.FC<CytoscapeGraphProps> = ({
  data,
  onNodeSelect,
  onEdgeSelect,
  filterType = 'ALL',
  height = '100%',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !data) return;
    setIsReady(false);

    // Support both data.elements?.nodes and data.nodes
    const rawNodes = data.elements?.nodes || (data as any).nodes || [];
    const rawEdges = data.elements?.edges || (data as any).edges || [];

    const elements: any[] = [];

    // Filter nodes if filterType is set
    const allowedType = filterType.toUpperCase();

    rawNodes.forEach((n: any) => {
      const nodeData = n.data || n;
      const type = String(nodeData.type || 'account').toLowerCase();
      
      // Filter logic
      if (allowedType !== 'ALL') {
        if (allowedType === 'EMPLOYEE' && type !== 'employee') return;
        if (allowedType === 'ACCOUNT' && type !== 'account') return;
        if (allowedType === 'CUSTOMER' && type !== 'customer') return;
        if (allowedType === 'TRANSACTION' && type !== 'transaction') return;
      }

      elements.push({
        group: 'nodes',
        data: {
          id: nodeData.id,
          label: nodeData.label || nodeData.id,
          type: type,
          risk: nodeData.risk || (nodeData.is_suspicious ? 'CRITICAL' : 'LOW'),
          sublabel: nodeData.sublabel || '',
          properties: nodeData.properties || {},
        },
      });
    });

    const activeNodeIds = new Set(elements.map((el) => el.data.id));

    rawEdges.forEach((e: any, idx: number) => {
      const edgeData = e.data || e;
      const source = edgeData.source;
      const target = edgeData.target;

      // Only add edge if both endpoints exist in filtered graph
      if (!activeNodeIds.has(source) || !activeNodeIds.has(target)) return;

      const edgeType = String(edgeData.type || edgeData.relationship || 'TRANSFER').toUpperCase();

      if (allowedType === 'ACTIONS') {
        if (!edgeType.includes('ACCESS') && !edgeType.includes('EDIT') && !edgeType.includes('OVERRIDE')) return;
      }

      elements.push({
        group: 'edges',
        data: {
          id: edgeData.id || `${source}-${target}-${edgeType}-${idx}`,
          source: source,
          target: target,
          type: edgeType,
          relationship: edgeData.relationship || edgeType,
          label: edgeData.label || edgeData.relationship || edgeType,
          amount: edgeData.amount || edgeData.properties?.amount,
          timestamp: edgeData.timestamp || edgeData.properties?.timestamp,
          properties: edgeData.properties || {},
        },
      });
    });

    // Initialize Cytoscape with Analytical Light Canvas Design
    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#FFFFFF',
            'border-width': 2,
            'border-color': '#B8C6BD',
            'color': '#17221C',
            'label': 'data(label)',
            'font-size': '11px',
            'font-family': 'monospace',
            'font-weight': 'bold',
            'text-valign': 'bottom',
            'text-margin-y': 6,
            'text-background-opacity': 0.95,
            'text-background-color': '#FFFFFF',
            'text-background-padding': '3px',
            'text-background-shape': 'roundrectangle',
            'text-border-width': 1,
            'text-border-color': '#D7E0DA',
            'width': 38,
            'height': 38,
          },
        },
        // Employee: bg #E8F6EE, border #20A36A, text #123B2A
        {
          selector: 'node[type = "employee"]',
          style: {
            'background-color': '#E8F6EE',
            'border-color': '#20A36A',
            'border-width': 2.5,
            'color': '#123B2A',
            'shape': 'hexagon',
            'width': 44,
            'height': 44,
          },
        },
        // Account: bg #EAF4FB, border #328CCB, text #164765
        {
          selector: 'node[type = "account"]',
          style: {
            'background-color': '#EAF4FB',
            'border-color': '#328CCB',
            'border-width': 2,
            'color': '#164765',
            'shape': 'roundrectangle',
            'width': 40,
            'height': 40,
          },
        },
        // Customer: bg #F1ECFF, border #8064D8, text #433477
        {
          selector: 'node[type = "customer"]',
          style: {
            'background-color': '#F1ECFF',
            'border-color': '#8064D8',
            'border-width': 2,
            'color': '#433477',
            'shape': 'ellipse',
            'width': 38,
            'height': 38,
          },
        },
        // Transaction: bg #FFF5DF, border #D89A24, text #6F4B0B
        {
          selector: 'node[type = "transaction"]',
          style: {
            'background-color': '#FFF5DF',
            'border-color': '#D89A24',
            'border-width': 2,
            'color': '#6F4B0B',
            'shape': 'diamond',
            'width': 36,
            'height': 36,
          },
        },
        // Alert / Risk critical highlight
        {
          selector: 'node[risk = "CRITICAL"]',
          style: {
            'border-color': '#D64545',
            'border-width': 3.5,
          },
        },
        // Edges: subtle neutral #83928A
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#83928A',
            'target-arrow-color': '#83928A',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-size': '9px',
            'font-family': 'monospace',
            'color': '#425148',
            'text-rotation': 'autorotate',
            'text-background-opacity': 0.95,
            'text-background-color': '#FFFFFF',
            'text-background-padding': '2px',
            'text-border-width': 1,
            'text-border-color': '#D7E0DA',
          },
        },
        // Money Flow: #328CCB
        {
          selector: 'edge[type = "TRANSFER"], edge[label *= "₹"]',
          style: {
            'width': 3,
            'line-color': '#328CCB',
            'target-arrow-color': '#328CCB',
            'target-arrow-shape': 'triangle',
            'color': '#164765',
            'font-weight': 'bold',
          },
        },
        // Circular Loop / Suspicious: #D64545
        {
          selector: 'edge[label *= "CIRCULAR"], edge[relationship *= "CIRCULAR"]',
          style: {
            'width': 3.5,
            'line-color': '#D64545',
            'target-arrow-color': '#D64545',
            'color': '#8F1D1D',
            'line-style': 'solid',
            'font-weight': 'bold',
          },
        },
        // Staff Action / EDITED: #D89A24
        {
          selector: 'edge[type = "EDITED"], edge[label *= "EDIT"]',
          style: {
            'width': 2.5,
            'line-color': '#D89A24',
            'target-arrow-color': '#D89A24',
            'line-style': 'dashed',
            'color': '#6F4B0B',
            'font-weight': 'bold',
          },
        },
        // Privilege Action / OVERRIDE: #E27B35
        {
          selector: 'edge[type = "ACCESSED"], edge[label *= "OVERRIDE"]',
          style: {
            'width': 2.5,
            'line-color': '#E27B35',
            'target-arrow-color': '#E27B35',
            'line-style': 'dashed',
            'color': '#A34800',
            'font-weight': 'bold',
          },
        },
        // OWNS: #8064D8
        {
          selector: 'edge[type = "OWNS"]',
          style: {
            'width': 2,
            'line-color': '#8064D8',
            'target-arrow-color': '#8064D8',
            'line-style': 'dotted',
            'color': '#433477',
          },
        },
        // Selected node
        {
          selector: 'node:selected',
          style: {
            'border-color': '#176044',
            'border-width': 4,
          },
        },
        // Selected edge
        {
          selector: 'edge:selected',
          style: {
            'line-color': '#176044',
            'target-arrow-color': '#176044',
            'width': 4,
          },
        },
      ],
      layout: {
        name: 'breadthfirst',
        directed: true,
        padding: 50,
        spacingFactor: 1.3,
        animate: false,
      },
    });

    cy.ready(() => {
      cy.fit(undefined, 48);
      cy.center();
      setIsReady(true);
    });

    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      if (onNodeSelect) {
        onNodeSelect(node.data());
      }
    });

    cy.on('tap', 'edge', (evt) => {
      const edge = evt.target;
      if (onEdgeSelect) {
        onEdgeSelect(edge.data());
      }
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
    };
  }, [data, filterType]);

  const handleZoomIn = () => cyRef.current?.zoom(cyRef.current.zoom() * 1.25);
  const handleZoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() * 0.8);
  const handleFit = () => {
    cyRef.current?.fit(undefined, 48);
    cyRef.current?.center();
  };
  const handleReset = () => {
    if (!cyRef.current) return;
    cyRef.current.layout({ name: 'breadthfirst', directed: true, padding: 50, spacingFactor: 1.3, animate: false }).run();
    cyRef.current.fit(undefined, 48);
    cyRef.current.center();
  };

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{
        backgroundColor: '#F8FAF9',
        backgroundImage: `
          linear-gradient(to right, #E7ECE9 1px, transparent 1px),
          linear-gradient(to bottom, #E7ECE9 1px, transparent 1px)
        `,
        backgroundSize: '24px 24px',
      }}
    >
      {/* Controls Bar - Compact Top-Right White Buttons */}
      <div className="absolute right-4 top-4 z-10 flex items-center gap-1 rounded-lg border border-[#D7E0DA] bg-[#FFFFFF] p-1 shadow-xs">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="rounded p-1.5 text-[#17221C] hover:bg-[#F1F5F2] transition-colors cursor-pointer"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="rounded p-1.5 text-[#17221C] hover:bg-[#F1F5F2] transition-colors cursor-pointer"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          onClick={handleFit}
          title="Fit to Screen"
          className="rounded p-1.5 text-[#17221C] hover:bg-[#F1F5F2] transition-colors cursor-pointer"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
        <button
          onClick={handleReset}
          title="Reset Layout"
          className="rounded p-1.5 text-[#17221C] hover:bg-[#F1F5F2] transition-colors cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Graph Visual Legend - High Contrast Clean Analytical Card */}
      <div className="absolute bottom-4 left-4 z-10 flex flex-wrap items-center gap-3.5 rounded-lg border border-[#D7E0DA] bg-[#FFFFFF]/95 px-3.5 py-2 text-[11px] font-mono text-[#17221C] shadow-sm backdrop-blur-xs">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-[#E8F6EE] border border-[#20A36A]"></span>
          <span className="font-semibold text-[#123B2A]">Employee</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-[#EAF4FB] border border-[#328CCB]"></span>
          <span className="font-semibold text-[#164765]">Account</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#F1ECFF] border border-[#8064D8]"></span>
          <span className="font-semibold text-[#433477]">Customer</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rotate-45 bg-[#FFF5DF] border border-[#D89A24]"></span>
          <span className="font-semibold text-[#6F4B0B]">Transaction</span>
        </div>
        <span className="text-[#D7E0DA]">|</span>
        <div className="flex items-center gap-1.5">
          <span className="h-1 w-3 bg-[#328CCB]"></span>
          <span className="text-[#425148]">Money Flow</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-0.5 w-3 border-t-2 border-dashed border-[#D89A24]"></span>
          <span className="text-[#425148]">Staff Action</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-0.5 w-3 border-t-2 border-dashed border-[#E27B35]"></span>
          <span className="text-[#425148]">Privilege Action</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1 w-3 bg-[#D64545]"></span>
          <span className="text-[#8F1D1D] font-semibold">Suspicious Loop</span>
        </div>
      </div>

      {/* Graph Canvas with smooth centered fade-in */}
      <div
        ref={containerRef}
        style={{
          height,
          opacity: isReady ? 1 : 0,
          transition: 'opacity 0.25s ease-out',
        }}
        className="w-full h-full"
      />
    </div>
  );
};
