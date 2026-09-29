import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  Search,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  User,
  CreditCard,
  Clock,
  ShieldAlert,
  ArrowRight,
  Layers,
  ChevronDown,
  Info,
} from 'lucide-react';
import { getAlerts, getAlertDetail } from '../services/api';
import { AlertListItem, AlertDetail, RiskTier } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';

export const AlertsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [alerts, setAlerts] = useState<AlertListItem[]>([]);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [selectedAlertDetail, setSelectedAlertDetail] = useState<AlertDetail | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [whyFlaggedOpen, setWhyFlaggedOpen] = useState(false);

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

  useEffect(() => {
    loadAlerts();
  }, [tierFilter, statusFilter, signalFilter]);

  const handleSelectAlert = (alertId: string) => {
    setSelectedAlertId(alertId);
    loadAlertDetail(alertId);
  };

  const updateFilter = (key: string, val: string) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set(key, val);
    else next.delete(key);
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
      )
        return false;
    }
    return true;
  });

  const cleanFinding = (text?: string) => {
    if (!text) return 'Insider activity pattern detected across staff access and accounts.';
    let t = text.replace(/alert classified as (critical|high|medium|low) because /gi, '');
    t = t.replace(/is directly permitted actions view created/gi, 'observed during privileged access');
    return t.charAt(0).toUpperCase() + t.slice(1);
  };

  const inputStyle: React.CSSProperties = {
    padding: '6px 10px',
    borderRadius: 7,
    border: '1px solid #D7E0DA',
    background: '#FFFFFF',
    fontSize: 12,
    color: '#17221C',
    outline: 'none',
    fontFamily: 'inherit',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 3.75rem)', overflow: 'hidden', background: '#F7F9F7' }}>
      {/* ── Top Header ────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 24px',
          borderBottom: '1px solid #D7E0DA',
          background: '#FFFFFF',
          flexShrink: 0,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '2px 8px',
                borderRadius: 5,
                background: '#FDECEC',
                color: '#B42318',
                border: '1px solid #F3B5B0',
              }}
            >
              Alert Queue
            </span>
            <span style={{ fontSize: 11, color: '#68766E' }}>Inbox Prioritization · Deterministic Triage</span>
          </div>
          <h1 style={{ margin: 0, fontSize: 16, fontWeight: 800, letterSpacing: '-0.01em', color: '#17221C' }}>
            Investigation Queue
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={loadAlerts}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 12px',
              borderRadius: 8,
              background: '#FFFFFF',
              border: '1px solid #D7E0DA',
              fontSize: 12,
              fontWeight: 600,
              color: '#425148',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <RefreshCw size={13} style={{ animation: loadingList ? 'spin 1s linear infinite' : undefined }} /> Refresh
          </button>
        </div>
      </div>

      {/* ── Split Layout: Gmail-style list -> detail ───────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', flex: 1, overflow: 'hidden' }}>
        {/* ── LEFT: Alert Queue List ────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid #D7E0DA', overflow: 'hidden', background: '#FFFFFF' }}>
          {/* Filter Toolbar */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              padding: '10px 16px',
              borderBottom: '1px solid #D7E0DA',
              background: '#FFFFFF',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Search size={13} color="#68766E" style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search alert, employee, account..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: 28, width: 220 }}
                />
              </div>

              <select value={tierFilter} onChange={(e) => updateFilter('tier', e.target.value)} style={inputStyle}>
                <option value="">All Tiers</option>
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>

              <select value={statusFilter} onChange={(e) => updateFilter('status', e.target.value)} style={inputStyle}>
                <option value="">All Statuses</option>
                <option value="OPEN">OPEN</option>
                <option value="IN_REVIEW">IN REVIEW</option>
                <option value="ESCALATED">ESCALATED</option>
                <option value="CLOSED">CLOSED</option>
              </select>

              {signalFilter && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '3px 10px',
                    borderRadius: 5,
                    background: '#EAF7F0',
                    border: '1px solid #B8DCC8',
                    fontSize: 11,
                    color: '#176044',
                  }}
                >
                  <span>{signalFilter}</span>
                  <button
                    onClick={() => updateFilter('signal_type', '')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#176044', lineHeight: 1 }}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#68766E' }}>
              <strong style={{ color: '#17221C' }}>{filteredAlerts.length}</strong> alerts
            </span>
          </div>

          {/* List Rows */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loadingList ? (
              <div style={{ display: 'flex', height: 200, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid #D7E0DA', borderTopColor: '#176044', animation: 'spin 0.8s linear infinite' }} />
                <span style={{ fontSize: 12, color: '#68766E' }}>Loading alert queue...</span>
              </div>
            ) : filteredAlerts.length === 0 ? (
              <div style={{ display: 'flex', height: 240, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#68766E' }}>
                <AlertTriangle size={24} color="#D7E0DA" />
                <span style={{ fontSize: 13, fontWeight: 700 }}>No alerts match filters</span>
                <span style={{ fontSize: 12 }}>Try clearing filters or search query.</span>
              </div>
            ) : (
              filteredAlerts.map((alert) => {
                const isSelected = selectedAlertId === alert.id;
                const dotColor =
                  alert.tier === 'CRITICAL'
                    ? '#B42318'
                    : alert.tier === 'HIGH'
                    ? '#A34800'
                    : alert.tier === 'MEDIUM'
                    ? '#D97706'
                    : '#16A34A';

                return (
                  <div
                    key={alert.id}
                    onClick={() => handleSelectAlert(alert.id)}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #E7ECE9',
                      cursor: 'pointer',
                      borderLeft: `3px solid ${isSelected ? '#176044' : 'transparent'}`,
                      background: isSelected ? '#EAF7F0' : '#FFFFFF',
                      transition: 'background 0.1s, border-left-color 0.1s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) (e.currentTarget as HTMLElement).style.background = '#F7F9F7';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) (e.currentTarget as HTMLElement).style.background = '#FFFFFF';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
                      {/* Severity Dot */}
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: dotColor,
                          flexShrink: 0,
                          boxShadow: alert.tier === 'CRITICAL' ? '0 0 0 2px rgba(180,35,24,0.2)' : 'none',
                        }}
                      />

                      {/* Entity Chips */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                        {alert.employee_id && (
                          <span
                            style={{
                              fontFamily: 'JetBrains Mono, monospace',
                              fontSize: 10,
                              fontWeight: 700,
                              padding: '1px 5px',
                              borderRadius: 4,
                              background: '#E8F6EE',
                              color: '#123B2A',
                              border: '1px solid #B8DCC8',
                            }}
                          >
                            {alert.employee_id}
                          </span>
                        )}
                        {alert.account_id && (
                          <span
                            style={{
                              fontFamily: 'JetBrains Mono, monospace',
                              fontSize: 10,
                              fontWeight: 700,
                              padding: '1px 5px',
                              borderRadius: 4,
                              background: '#EAF4FB',
                              color: '#164765',
                              border: '1px solid #B8D5FA',
                            }}
                          >
                            {alert.account_id}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: isSelected ? 700 : 600,
                            color: '#17221C',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {alert.title}
                        </div>
                      </div>
                    </div>

                    {/* Right side: Timestamp & Status */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                      <span
                        style={{
                          fontSize: 10,
                          fontFamily: 'JetBrains Mono, monospace',
                          color: '#68766E',
                        }}
                      >
                        {alert.created_at
                          ? new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '12:22 PM'}
                      </span>
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          padding: '2px 6px',
                          borderRadius: 4,
                          background: '#F1F5F2',
                          color: '#425148',
                          border: '1px solid #D7E0DA',
                        }}
                      >
                        {alert.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── RIGHT: Compact Investigation Detail Pane (Section 12) ── */}
        <div style={{ display: 'flex', flexDirection: 'column', background: '#F7F9F7', overflow: 'hidden' }}>
          {/* Header */}
          <div
            style={{
              padding: '14px 20px',
              borderBottom: '1px solid #D7E0DA',
              background: '#FFFFFF',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#68766E' }}>
              Alert Inspection
            </span>
            {selectedAlertDetail && (
              <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#176044', fontWeight: 700 }}>
                {selectedAlertDetail.id}
              </span>
            )}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
            {loadingDetail ? (
              <div style={{ display: 'flex', height: 240, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid #D7E0DA', borderTopColor: '#176044', animation: 'spin 0.8s linear infinite' }} />
                <span style={{ fontSize: 12, color: '#68766E' }}>Loading alert details...</span>
              </div>
            ) : selectedAlertDetail ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Main Card */}
                <div
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #D7E0DA',
                    borderRadius: 12,
                    padding: 20,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <RiskBadge tier={selectedAlertDetail.tier} size="md" pulsing={selectedAlertDetail.tier === 'CRITICAL'} />
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          fontFamily: 'JetBrains Mono, monospace',
                          padding: '2px 8px',
                          borderRadius: 4,
                          background: '#FFF7E8',
                          color: '#8A5A00',
                          border: '1px solid #E9CF8B',
                        }}
                      >
                        {selectedAlertDetail.status}
                      </span>
                    </div>
                    <span style={{ fontSize: 11, color: '#68766E', fontFamily: 'JetBrains Mono, monospace' }}>
                      {new Date(selectedAlertDetail.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h2 style={{ margin: '0 0 10px', fontSize: 16, fontWeight: 800, color: '#17221C', lineHeight: 1.3 }}>
                    {selectedAlertDetail.title}
                  </h2>

                  {/* Connected Entities */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                    {selectedAlertDetail.entity_ids?.map((e: string) => {
                      const isEmp = e.startsWith('EMP');
                      return (
                        <div
                          key={e}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '3px 8px',
                            borderRadius: 6,
                            background: isEmp ? '#E8F6EE' : '#EAF4FB',
                            border: `1px solid ${isEmp ? '#B8DCC8' : '#B8D5FA'}`,
                            fontSize: 11,
                            fontFamily: 'JetBrains Mono, monospace',
                            fontWeight: 700,
                            color: isEmp ? '#123B2A' : '#164765',
                          }}
                        >
                          {isEmp ? <User size={11} /> : <CreditCard size={11} />}
                          <span>{e}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Operational Summary */}
                  <p style={{ margin: 0, fontSize: 13, color: '#425148', lineHeight: 1.55 }}>
                    {cleanFinding(selectedAlertDetail.summary)}
                  </p>

                  {/* Big Primary Action: Investigate */}
                  <button
                    onClick={() => navigate(`/investigations/${selectedAlertDetail.id}`)}
                    style={{
                      marginTop: 18,
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      padding: '10px 16px',
                      borderRadius: 8,
                      background: '#176044',
                      color: '#FFFFFF',
                      fontSize: 13,
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(23,96,68,0.2)',
                    }}
                  >
                    <span>Investigate Alert</span>
                    <ArrowRight size={14} />
                  </button>
                </div>

                {/* Expandable Why Flagged Section */}
                <div
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #D7E0DA',
                    borderRadius: 12,
                    overflow: 'hidden',
                  }}
                >
                  <button
                    onClick={() => setWhyFlaggedOpen((p) => !p)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Info size={14} color="#176044" />
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#17221C' }}>
                        Why Flagged &amp; Detection Signals ({selectedAlertDetail.signal_ids?.length || 0})
                      </span>
                    </div>
                    <ChevronDown
                      size={14}
                      color="#68766E"
                      style={{ transform: whyFlaggedOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
                    />
                  </button>

                  {whyFlaggedOpen && (
                    <div style={{ padding: '0 16px 14px', borderTop: '1px solid #E7ECE9', paddingTop: 12, fontSize: 12 }}>
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#68766E', textTransform: 'uppercase', marginBottom: 6 }}>
                          Matched Signals:
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {selectedAlertDetail.signal_ids?.map((sig) => (
                            <span
                              key={sig}
                              style={{
                                fontSize: 11,
                                padding: '2px 8px',
                                borderRadius: 5,
                                background: '#F1F5F2',
                                border: '1px solid #D7E0DA',
                                color: '#176044',
                                fontFamily: 'JetBrains Mono, monospace',
                                fontWeight: 600,
                              }}
                            >
                              {sig}
                            </span>
                          ))}
                        </div>
                      </div>

                      {selectedAlertDetail.rule_trace && (
                        <div style={{ marginTop: 10, background: '#F7F9F7', padding: 10, borderRadius: 8, border: '1px solid #E7ECE9' }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: '#68766E', textTransform: 'uppercase' }}>
                            Deterministic Rule:
                          </div>
                          <div style={{ marginTop: 4, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#17221C', fontWeight: 600 }}>
                            {(selectedAlertDetail.rule_trace as any).rule_name || 'OUT_OF_ROLE_ACCESS_LINK'}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', height: 240, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#68766E', textAlign: 'center' }}>
                <ShieldAlert size={28} color="#D7E0DA" />
                <span style={{ fontSize: 13, fontWeight: 700 }}>Select an alert</span>
                <span style={{ fontSize: 12 }}>Choose an alert from the queue to view its findings and start investigation.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
