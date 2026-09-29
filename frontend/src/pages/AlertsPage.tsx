import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  Search,
  RefreshCw,
  ExternalLink,
  FileCheck2,
  ChevronRight,
  Circle,
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

  const tierFilter = searchParams.get('tier') || '';
  const statusFilter = searchParams.get('status') || '';
  const signalFilter = searchParams.get('signal_type') || '';
  const [searchTerm, setSearchTerm] = useState('');

  const loadAlerts = async () => {
    try {
      setLoadingList(true);
      setError(null);
      const res = await getAlerts({ tier: tierFilter || undefined, status: statusFilter || undefined });
      setAlerts(res);
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
      console.error('Failed to load alert detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => { loadAlerts(); }, [tierFilter, statusFilter, signalFilter]);

  const handleSelectAlert = (alertId: string) => {
    setSelectedAlertId(alertId);
    loadAlertDetail(alertId);
  };

  const updateFilter = (key: string, val: string) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set(key, val); else next.delete(key);
    setSearchParams(next);
  };

  const filteredAlerts = alerts.filter((a) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match = a.id.toLowerCase().includes(q) || a.title.toLowerCase().includes(q) ||
        (a.employee_id && a.employee_id.toLowerCase().includes(q)) ||
        (a.account_id && a.account_id.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (signalFilter) {
      if (!a.title.toLowerCase().includes(signalFilter.toLowerCase()) &&
          !a.summary.toLowerCase().includes(signalFilter.toLowerCase())) return false;
    }
    return true;
  });

  const inputStyle: React.CSSProperties = {
    padding: '6px 10px',
    borderRadius: 7,
    border: '1px solid var(--surface-border)',
    background: 'var(--surface-raised)',
    fontSize: 12,
    color: 'var(--text-primary)',
    outline: 'none',
    fontFamily: 'inherit',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)', overflow: 'hidden', background: 'var(--surface-page)' }}>

      {/* ── Header ──────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', borderBottom: '1px solid var(--surface-border)', background: 'var(--surface-raised)', flexShrink: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '2px 8px', borderRadius: 5, background: 'var(--forest-ghost)', color: 'var(--forest-primary)', border: '1px solid var(--forest-pale)' }}>
              Triage Queue · Evidence Panel
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Deterministic Prioritization</span>
          </div>
          <h1 style={{ margin: 0, fontSize: 16, fontWeight: 800, letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>
            Correlated Financial &amp; Insider Alerts
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {selectedAlertId && (
            <button
              onClick={() => navigate(`/investigations/${selectedAlertId}`)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, background: 'var(--forest-primary)', color: '#fff', border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Full Investigation Workspace <ExternalLink size={12} />
            </button>
          )}
          <button
            onClick={loadAlerts}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 8, background: 'var(--surface-subtle)', border: '1px solid var(--surface-border)', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {/* ── Split layout ─────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', flex: 1, overflow: 'hidden' }}>

        {/* ── LEFT: Alert Queue ────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--surface-border)', overflow: 'hidden', background: 'var(--surface-page)' }}>

          {/* Filter bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '10px 16px', borderBottom: '1px solid var(--surface-border)', background: 'var(--surface-raised)', flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Search */}
              <div style={{ position: 'relative' }}>
                <Search size={13} color="var(--text-muted)" style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search alert, employee, account..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: 28, width: 220 }}
                />
              </div>

              {/* Tier filter */}
              <select
                value={tierFilter}
                onChange={(e) => updateFilter('tier', e.target.value)}
                style={inputStyle}
              >
                <option value="">All Tiers</option>
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => updateFilter('status', e.target.value)}
                style={inputStyle}
              >
                <option value="">All Statuses</option>
                <option value="OPEN">OPEN</option>
                <option value="IN_REVIEW">IN REVIEW</option>
                <option value="ESCALATED">ESCALATED</option>
                <option value="CLOSED">CLOSED</option>
              </select>

              {signalFilter && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 5, background: 'var(--forest-ghost)', border: '1px solid var(--forest-pale)', fontSize: 11, color: 'var(--forest-primary)' }}>
                  <span>{signalFilter}</span>
                  <button onClick={() => updateFilter('signal_type', '')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--forest-primary)', fontFamily: 'inherit', lineHeight: 1 }}>✕</button>
                </div>
              )}
            </div>
            <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>{filteredAlerts.length}</strong> alerts
            </span>
          </div>

          {/* Alert list */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loadingList ? (
              <div style={{ display: 'flex', height: 200, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--forest-pale)', borderTopColor: 'var(--forest-primary)', animation: 'spin 0.8s linear infinite' }} />
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Loading alert queue...</span>
              </div>
            ) : filteredAlerts.length === 0 ? (
              <div style={{ display: 'flex', height: 200, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--text-muted)' }}>
                <AlertTriangle size={24} />
                <span style={{ fontSize: 13, fontWeight: 600 }}>No alerts match filters</span>
                <span style={{ fontSize: 12 }}>Try clearing filters or search terms.</span>
              </div>
            ) : filteredAlerts.map((alert) => {
              const isSelected = selectedAlertId === alert.id;
              return (
                <div
                  key={alert.id}
                  onClick={() => handleSelectAlert(alert.id)}
                  style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid var(--surface-divider)',
                    cursor: 'pointer',
                    borderLeft: `3px solid ${isSelected ? 'var(--forest-primary)' : 'transparent'}`,
                    background: isSelected ? 'var(--forest-ghost)' : 'transparent',
                    transition: 'background 0.1s, border-left-color 0.15s',
                  }}
                  onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'var(--surface-subtle)'; }}
                  onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <RiskBadge tier={alert.tier} size="sm" pulsing={alert.tier === 'CRITICAL'} />
                      <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: 'var(--forest-primary)' }}>{alert.id}</span>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', padding: '2px 7px', borderRadius: 4, background: 'var(--surface-subtle)', color: 'var(--text-muted)', border: '1px solid var(--surface-border)' }}>
                      {alert.status}
                    </span>
                  </div>

                  <h3 style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{alert.title}</h3>
                  <p style={{ margin: '0 0 8px', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{alert.summary}</p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {alert.employee_id && (
                        <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: 'var(--risk-high-bg)', color: 'var(--risk-high-text)', border: '1px solid var(--risk-high-border)' }}>
                          {alert.employee_id}
                        </span>
                      )}
                      {alert.account_id && (
                        <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: 'var(--risk-medium-bg)', color: 'var(--risk-medium-text)', border: '1px solid var(--risk-medium-border)' }}>
                          {alert.account_id}
                        </span>
                      )}
                      {!alert.employee_id && !alert.account_id && (
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>No entity tag</span>
                      )}
                    </div>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                      {alert.created_at ? new Date(alert.created_at).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT: Evidence & Explanation Panel ──────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--surface-page)', overflow: 'hidden' }}>
          {/* Panel Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--surface-border)', background: 'var(--surface-raised)', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileCheck2 size={14} color="var(--risk-low)" />
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-primary)' }}>
                Evidence &amp; Explanation Panel
              </span>
            </div>
            {selectedAlertDetail && (
              <button
                onClick={() => navigate(`/investigations/${selectedAlertDetail.id}`)}
                style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: 'var(--forest-sage)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Full Graph <ChevronRight size={13} />
              </button>
            )}
          </div>

          {/* Panel Body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
            {loadingDetail ? (
              <div style={{ display: 'flex', height: 200, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--forest-pale)', borderTopColor: 'var(--forest-primary)', animation: 'spin 0.8s linear infinite' }} />
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Loading evidence dossier...</span>
              </div>
            ) : selectedAlertDetail ? (
              <EvidencePanel
                alert={selectedAlertDetail}
                onCaseCreated={() => { loadAlerts(); }}
              />
            ) : (
              <div style={{ display: 'flex', height: 200, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--text-muted)', textAlign: 'center', padding: 24 }}>
                <Circle size={28} color="var(--surface-border)" />
                <span style={{ fontSize: 13, fontWeight: 600 }}>No alert selected</span>
                <span style={{ fontSize: 12 }}>Select an alert from the queue to view its evidence and explainability dossier.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
