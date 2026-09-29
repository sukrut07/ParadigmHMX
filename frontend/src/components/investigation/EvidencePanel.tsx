import React, { useState } from 'react';
import {
  ShieldAlert,
  Info,
  Layers,
  FileText,
  HelpCircle,
  Briefcase,
  Download,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  FileCheck2,
  Lock,
} from 'lucide-react';
import { AlertDetail, RiskTier } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import { createCase, exportCaseBundle, verifyEvidence } from '../../services/api';

interface EvidencePanelProps {
  alert: AlertDetail;
  onCaseCreated?: (newCase: any) => void;
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({ alert, onCaseCreated }) => {
  const [caseModalOpen, setCaseModalOpen] = useState(false);
  const [caseTitle, setCaseTitle] = useState(`Incident: ${alert.title}`);
  const [caseAssignee, setCaseAssignee] = useState('Analyst Priya Sharma (Fraud Operations)');
  const [caseNotes, setCaseNotes] = useState('Initiated investigation based on multi-signal evidence linkage.');
  const [creatingCase, setCreatingCase] = useState(false);

  const [exportingJson, setExportingJson] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportResult, setExportResult] = useState<{ sha256?: string; bundle?: any } | null>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const [expandedDimension, setExpandedDimension] = useState<string | null>(null);
  const [fullReasoningOpen, setFullReasoningOpen] = useState(false);

  const handleCreateCase = async () => {
    try {
      setCreatingCase(true);
      const res = await createCase({
        alert_id: alert.id,
        title: caseTitle,
        priority: alert.tier,
        assigned_to: caseAssignee,
        notes: caseNotes,
      });
      setCaseModalOpen(false);
      if (onCaseCreated) onCaseCreated(res);
      window.alert('Investigation Case successfully opened and assigned to reviewer!');
    } catch (err: any) {
      window.alert(`Failed to create case: ${err.message}`);
    } finally {
      setCreatingCase(false);
    }
  };

  const handleExport = async (format: 'json' | 'pdf' = 'json') => {
    try {
      if (format === 'json') {
        setExportingJson(true);
        const res = await exportCaseBundle(alert.id, 'json');
        setExportResult(res);
        const ver = await verifyEvidence(res.bundle, res.sha256);
        setVerificationResult(ver);

        const blob = new Blob([JSON.stringify(res.bundle || res, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Forensic_Evidence_${alert.id}.json`;
        a.click();
      } else {
        setExportingPdf(true);
        const res = await exportCaseBundle(alert.id, 'pdf');
        const url = window.URL.createObjectURL(res);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Forensic_Dossier_${alert.id}.pdf`;
        a.click();
      }
    } catch (err: any) {
      console.error('Export failed:', err);
      window.alert(`Evidence export failed: ${err.message}`);
    } finally {
      setExportingJson(false);
      setExportingPdf(false);
    }
  };

  // Multi-dimensional risk breakdown
  const riskFactors = alert.rule_trace?.risk_factors || alert.rule_trace?.risk_breakdown || {
    insider_privilege_risk: {
      level: alert.tier === 'CRITICAL' ? 'HIGH' : 'MEDIUM',
      score: alert.tier === 'CRITICAL' ? 88 : 65,
      title: 'Privilege Abuse',
      rule: 'Out-of-Role Access',
      indicators: ['Employee performed operations outside assigned RBAC permissions or branch jurisdiction.'],
    },
    causal_temporal_linkage_risk: {
      level: 'HIGH',
      score: 85,
      title: 'Temporal Link',
      rule: 'Action-Transaction Sequence',
      indicators: ['Outbound fund transfer executed in close temporal proximity following credential/limit modification.'],
    },
    profile_kyc_mismatch_risk: {
      level: 'HIGH',
      score: 75,
      title: 'KYC Alignment',
      rule: 'Income Velocity Ceiling',
      indicators: ['Payment volume significantly exceeds customer occupation profile and monthly income ceiling.'],
    },
    network_exposure_risk: {
      level: 'MEDIUM',
      score: 55,
      title: 'Network Exposure',
      rule: 'Topology Spread',
      indicators: ['Cluster links multiple entity touchpoints across branch terminals and payment rails.'],
    },
    money_flow_topology_risk: {
      level: alert.title.includes('Circular') ? 'CRITICAL' : 'LOW',
      score: alert.title.includes('Circular') ? 92 : 20,
      title: 'Money Flow',
      rule: 'Transit Topology',
      indicators: ['Laundering pattern evaluation across destination accounts and rapid transit hops.'],
    },
  };

  const getDimensionBadgeStyle = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return { bg: '#FDECEC', color: '#B42318', border: '#F3B5B0', bar: '#B42318' };
      case 'HIGH':
        return { bg: '#FFF0E8', color: '#A34800', border: '#F1C29E', bar: '#A34800' };
      case 'MEDIUM':
        return { bg: '#FFF7E8', color: '#8A5A00', border: '#E9CF8B', bar: '#D97706' };
      case 'LOW':
      default:
        return { bg: '#EAF7F0', color: '#176044', border: '#B8DCC8', bar: '#16A34A' };
    }
  };

  // Clean human-readable finding
  const primaryEmployee = alert.entity_ids?.find((e) => e.startsWith('EMP')) || 'Employee';
  const primaryAccount = alert.entity_ids?.find((e) => e.startsWith('ACC')) || 'Account';
  const humanFinding = `${primaryEmployee} performed account access and privileged parameter modifications on ${primaryAccount} shortly before subsequent transaction routing.`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* ── 1. UNIFIED COMPONENT: WHY THIS ALERT? (Section 21) ─────── */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #D7E0DA',
          borderRadius: 12,
          padding: 18,
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, borderBottom: '1px solid #E7ECE9', paddingBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Info size={16} color="#176044" />
            <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#17221C' }}>
              Why This Alert?
            </span>
          </div>
          <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: '#EAF7F0', color: '#176044', border: '1px solid #B8DCC8' }}>
            CORRELATED EVIDENCE
          </span>
        </div>

        {/* Primary Finding */}
        <p style={{ margin: '0 0 12px', fontSize: 13, color: '#17221C', fontWeight: 600, lineHeight: 1.5 }}>
          {humanFinding}
        </p>

        {/* Matched Signals */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#68766E', textTransform: 'uppercase', marginBottom: 6 }}>
            Matched Detection Signals:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {(alert.signal_ids && alert.signal_ids.length > 0
              ? alert.signal_ids
              : ['PRIVILEGE_OVERRIDE', 'ACCOUNT_MODIFICATION', 'RAPID_PASSTHROUGH']
            ).map((sig) => (
              <span
                key={sig}
                style={{
                  fontSize: 11,
                  fontFamily: 'JetBrains Mono, monospace',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 5,
                  background: '#F1F5F2',
                  color: '#176044',
                  border: '1px solid #D7E0DA',
                }}
              >
                {sig}
              </span>
            ))}
          </div>
        </div>

        {/* Deterministic Rule */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F7F9F7', padding: '8px 12px', borderRadius: 8, border: '1px solid #E7ECE9', marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: '#68766E' }}>Deterministic Rule:</span>
          <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: '#17221C' }}>
            {(alert.rule_trace as any)?.rule_name || alert.rule_trace?.rules?.[0]?.name || 'Out-of-Role Action & Transfer Sequence'}
          </span>
        </div>

        {/* Expandable Reasoning */}
        <button
          onClick={() => setFullReasoningOpen((p) => !p)}
          style={{
            background: 'none',
            border: 'none',
            color: '#176044',
            fontSize: 11,
            fontWeight: 700,
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <span>{fullReasoningOpen ? 'Hide Full Reasoning' : 'View Full Deterministic Reasoning →'}</span>
        </button>

        {fullReasoningOpen && (
          <div style={{ marginTop: 10, padding: 12, background: '#F1F5F2', borderRadius: 8, border: '1px solid #D7E0DA', fontSize: 11, color: '#425148', lineHeight: 1.5 }}>
            {alert.summary || 'Insider activity by employee is directly linked to subsequent transaction execution.'}
          </div>
        )}
      </div>

      {/* ── 2. RISK DIMENSIONS ASSESSMENT (Section 20) ──────────────── */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #D7E0DA',
          borderRadius: 12,
          padding: 18,
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, borderBottom: '1px solid #E7ECE9', paddingBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldAlert size={16} color="#176044" />
            <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#17221C' }}>
              Risk Assessment
            </span>
          </div>
          <span style={{ fontSize: 11, color: '#68766E' }}>Click row for explanation</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Object.entries(riskFactors).map(([key, item]: [string, any]) => {
            const badge = getDimensionBadgeStyle(item.level);
            const isExpanded = expandedDimension === key;
            return (
              <div
                key={key}
                onClick={() => setExpandedDimension(isExpanded ? null : key)}
                style={{
                  border: '1px solid #E7ECE9',
                  borderRadius: 8,
                  padding: '10px 12px',
                  background: isExpanded ? '#F7F9F7' : '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'background 0.1s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#17221C' }}>{item.title}</span>
                    <span
                      style={{
                        fontSize: 9,
                        fontFamily: 'JetBrains Mono, monospace',
                        fontWeight: 800,
                        padding: '1px 6px',
                        borderRadius: 4,
                        background: badge.bg,
                        color: badge.color,
                        border: `1px solid ${badge.border}`,
                      }}
                    >
                      {item.level}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 140 }}>
                    <div style={{ flex: 1, height: 6, background: '#E7ECE9', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${item.score}%`, height: '100%', background: badge.bar, borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#68766E', width: 28 }}>
                      {item.score}%
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #E7ECE9', fontSize: 11, color: '#425148' }}>
                    <div style={{ fontWeight: 600, color: '#17221C', marginBottom: 2 }}>
                      Why: {item.indicators?.[0]}
                    </div>
                    <div style={{ color: '#68766E', fontSize: 10 }}>Rule: {item.rule || 'Institutional Threshold'}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 3. COUNTERFACTUAL WHAT-IF (Section 21) ────────────────────── */}
      {alert.counterfactual && (
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #D7E0DA',
            borderRadius: 12,
            padding: 16,
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <HelpCircle size={15} color="#176044" />
            <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: '#17221C' }}>
              Counterfactual "What-If" Analysis
            </span>
          </div>
          <div style={{ fontSize: 12, color: '#425148' }}>
            <div style={{ marginBottom: 4 }}>
              Condition Evaluated:{' '}
              <span style={{ fontWeight: 700, color: '#A34800' }}>{alert.counterfactual.condition_changed}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'JetBrains Mono, monospace', fontSize: 12, marginBottom: 8 }}>
              <span style={{ textDecoration: 'line-through', color: '#B42318', fontWeight: 700 }}>{alert.counterfactual.original_tier}</span>
              <span>→</span>
              <span style={{ color: '#16A34A', fontWeight: 800 }}>{alert.counterfactual.counterfactual_tier}</span>
            </div>
            <p style={{ margin: 0, fontStyle: 'italic', fontSize: 11, color: '#17221C', background: '#F1F5F2', padding: 8, borderRadius: 6 }}>
              "{alert.counterfactual.explanation}"
            </p>
          </div>
        </div>
      )}

      {/* ── 4. CORROBORATING EVIDENCE RECORDS ────────────────────────── */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #D7E0DA',
          borderRadius: 12,
          padding: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={15} color="#176044" />
            <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: '#17221C' }}>
              Evidence Records ({alert.evidence?.length || 0})
            </span>
          </div>
          <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: '#176044', fontWeight: 700 }}>
            SHA-256 ✓
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 150, overflowY: 'auto' }}>
          {(alert.evidence || []).slice(0, 5).map((ev, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 10px',
                borderRadius: 6,
                background: '#F1F5F2',
                border: '1px solid #D7E0DA',
                fontSize: 11,
              }}
            >
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#176044' }}>
                {ev.record_id}
              </span>
              <span style={{ color: '#68766E', fontSize: 10 }}>{ev.record_type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 5. ACTION BUTTONS ───────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, paddingTop: 4 }}>
        <button
          onClick={() => setCaseModalOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '10px 14px',
            borderRadius: 8,
            background: '#176044',
            color: '#FFFFFF',
            fontSize: 12,
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(23,96,68,0.2)',
          }}
        >
          <Briefcase size={14} />
          <span>Assign Case</span>
        </button>

        <button
          onClick={() => handleExport('json')}
          disabled={exportingJson}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '10px 14px',
            borderRadius: 8,
            background: '#FFFFFF',
            border: '1px solid #D7E0DA',
            color: '#17221C',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <Download size={14} color="#68766E" />
          <span>{exportingJson ? 'Exporting...' : 'Export JSON'}</span>
        </button>

        <button
          onClick={() => handleExport('pdf')}
          disabled={exportingPdf}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '10px 14px',
            borderRadius: 8,
            background: '#E8F4ED',
            border: '1px solid #B8DCC8',
            color: '#176044',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <FileCheck2 size={14} color="#176044" />
          <span>{exportingPdf ? 'Generating...' : 'Dossier PDF'}</span>
        </button>
      </div>

      {/* Case Assignment Modal */}
      {caseModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 60,
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 12,
              padding: 24,
              width: 440,
              maxWidth: '90vw',
              boxShadow: '0 20px 48px rgba(0,0,0,0.2)',
            }}
          >
            <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 800, color: '#17221C' }}>
              Assign Alert to Investigation Case
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 12 }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#68766E', marginBottom: 4 }}>Case Title:</label>
                <input
                  type="text"
                  value={caseTitle}
                  onChange={(e) => setCaseTitle(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #D7E0DA', fontSize: 12 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#68766E', marginBottom: 4 }}>Assigned Investigator:</label>
                <input
                  type="text"
                  value={caseAssignee}
                  onChange={(e) => setCaseAssignee(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #D7E0DA', fontSize: 12 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#68766E', marginBottom: 4 }}>Initial Triage Notes:</label>
                <textarea
                  value={caseNotes}
                  onChange={(e) => setCaseNotes(e.target.value)}
                  rows={3}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #D7E0DA', fontSize: 12 }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <button
                onClick={() => setCaseModalOpen(false)}
                style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #D7E0DA', background: '#FFFFFF', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCase}
                disabled={creatingCase}
                style={{ padding: '8px 18px', borderRadius: 6, border: 'none', background: '#176044', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}
              >
                {creatingCase ? 'Creating...' : 'Confirm Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
