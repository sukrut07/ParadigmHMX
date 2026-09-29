import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Flame,
  ShieldAlert,
  Users,
  CreditCard,
  Briefcase,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Activity,
  ChevronRight,
  Circle,
} from 'lucide-react';
import { getFraudDashboard, getAlertTrend } from '../services/api';
import { DashboardFraudData, RiskTier } from '../types';
import { KPICard } from '../components/common/KPICard';
import { RiskBadge } from '../components/common/RiskBadge';

/* ── helpers ──────────────────────────────────────────────── */
const S: React.CSSProperties = {};

function Section({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: 'var(--surface-raised)', border: '1px solid var(--surface-border)', borderRadius: 12, padding: 20, ...style }}>
      {children}
    </div>
  );
}

function SectionHeader({ icon: Icon, title, subtitle, action }: { icon?: React.ComponentType<any>; title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid var(--surface-divider)' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {Icon && <Icon size={15} color="var(--forest-sage)" />}
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h2>
        </div>
        {subtitle && <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* ── component ────────────────────────────────────────────── */
export const FraudDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardFraudData | null>(null);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [trendFilter, setTrendFilter] = useState<'24h' | '7d' | '30d'>('7d');
  const [entityTab, setEntityTab] = useState<'employees' | 'accounts'>('employees');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [fraudRes, trendRes] = await Promise.all([
        getFraudDashboard('FRAUD_ANALYST'),
        getAlertTrend().catch(() => []),
      ]);
      setData(fraudRes);
      setTrendData(trendRes);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err: any) {
      setError(err.message || 'Failed to load fraud operational data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  if (loading && !data) {
    return (
      <div style={{ display: 'flex', height: 'calc(100vh - 60px)', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--forest-pale)', borderTopColor: 'var(--forest-primary)', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading Fraud Analyst Intelligence...</span>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div style={{ padding: 32, maxWidth: 480, margin: '60px auto' }}>
        <div style={{ background: 'var(--risk-critical-bg)', border: '1px solid var(--risk-critical-border)', borderRadius: 12, padding: 24, textAlign: 'center' }}>
          <AlertTriangle size={28} color="var(--risk-critical)" style={{ margin: '0 auto 8px' }} />
          <div style={{ fontWeight: 700, color: 'var(--risk-critical-text)', marginBottom: 6 }}>Unable to load dashboard</div>
          <div style={{ fontSize: 13, color: 'var(--risk-critical)', marginBottom: 16 }}>{error}</div>
          <button onClick={loadData} style={{ padding: '8px 20px', borderRadius: 8, background: 'var(--risk-critical)', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Retry</button>
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || { critical_alerts: 0, high_alerts: 0, medium_alerts: 0, low_alerts: 0, open_cases: 0, unassigned_alerts: 0, suspicious_employees: 0, suspicious_accounts: 0, alerts_today: 0 };
  const riskDist = data?.risk_distribution || { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  const signalDist = data?.signal_distribution || {};
  const totalAlerts = Object.values(riskDist).reduce((a, b) => a + b, 0) || 1;

  const tierColors: Record<string, string> = { CRITICAL: 'var(--risk-critical)', HIGH: 'var(--risk-high)', MEDIUM: 'var(--risk-medium)', LOW: 'var(--risk-low)' };

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1400, margin: '0 auto' }}>

      {/* ── Page Header ─────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 5, background: 'var(--risk-critical-bg)', color: 'var(--risk-critical)', border: '1px solid var(--risk-critical-border)' }}>
              Operational
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Fraud Analyst · Financial Crime SOC</span>
          </div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Financial Activity &amp; Alert Prioritization
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>
            "What suspicious financial activity needs my attention right now?"
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {lastUpdated && (
            <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)' }}>
              Updated {lastUpdated}
            </span>
          )}
          <button
            onClick={loadData}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, background: 'var(--surface-raised)', border: '1px solid var(--surface-border)', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer', transition: 'border-color 0.15s', fontFamily: 'inherit' }}
          >
            <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : undefined }} />
            Refresh
          </button>
          <button
            onClick={() => navigate('/alerts?tier=CRITICAL')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: 'var(--forest-primary)', color: '#fff', border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <AlertTriangle size={13} /> View Alert Queue
          </button>
        </div>
      </div>

      {/* ── A. KPI Row ───────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 12, marginBottom: 20 }}>
        <KPICard title="Critical Alerts" value={kpis.critical_alerts} badge="Urgent" badgeColor="red" icon={Flame} onClick={() => navigate('/alerts?tier=CRITICAL')} accentColor="var(--risk-critical)" />
        <KPICard title="High Alerts" value={kpis.high_alerts} badgeColor="orange" icon={ShieldAlert} onClick={() => navigate('/alerts?tier=HIGH')} accentColor="var(--risk-high)" />
        <KPICard title="Medium" value={kpis.medium_alerts} badgeColor="yellow" icon={AlertTriangle} onClick={() => navigate('/alerts?tier=MEDIUM')} accentColor="var(--risk-medium)" />
        <KPICard title="Open Cases" value={kpis.open_cases} badgeColor="blue" icon={Briefcase} onClick={() => navigate('/cases?status=OPEN')} />
        <KPICard title="Unassigned" value={kpis.unassigned_alerts} subtitle="Alerts without case" icon={Activity} onClick={() => navigate('/alerts?status=OPEN')} />
        <KPICard title="Risky Employees" value={kpis.suspicious_employees} badgeColor="red" icon={Users} onClick={() => navigate('/employees')} />
        <KPICard title="Risky Accounts" value={kpis.suspicious_accounts} badgeColor="blue" icon={CreditCard} onClick={() => navigate('/accounts')} />
      </div>

      {/* ── B. Trend + Risk Distribution ─────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* Trend */}
        <Section>
          <SectionHeader
            icon={TrendingUp}
            title="Alert Trend Over Time"
            subtitle="Volume by risk tier — ranked deterministically"
            action={
              <div style={{ display: 'flex', gap: 2, background: 'var(--surface-subtle)', borderRadius: 7, padding: 2 }}>
                {(['24h', '7d', '30d'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setTrendFilter(f)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 5,
                      border: 'none',
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'JetBrains Mono, monospace',
                      background: trendFilter === f ? 'var(--surface-raised)' : 'transparent',
                      color: trendFilter === f ? 'var(--forest-primary)' : 'var(--text-muted)',
                      boxShadow: trendFilter === f ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 0.15s',
                    }}
                  >
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
            }
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {trendData.length === 0 ? (
              <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                No trend data recorded yet.
              </div>
            ) : trendData.slice(0, 6).map((item, idx) => {
              const maxTotal = Math.max(...trendData.map((t) => t.total || 1), 1);
              const critPct = (item.CRITICAL / maxTotal) * 100;
              const highPct = (item.HIGH / maxTotal) * 100;
              const medPct = (item.MEDIUM / maxTotal) * 100;
              return (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-secondary)' }}>{item.date}</span>
                    <div style={{ display: 'flex', gap: 10, fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>
                      <span style={{ color: 'var(--risk-critical)' }}>C:{item.CRITICAL}</span>
                      <span style={{ color: 'var(--risk-high)' }}>H:{item.HIGH}</span>
                      <span style={{ color: 'var(--risk-medium)' }}>M:{item.MEDIUM}</span>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.total}</span>
                    </div>
                  </div>
                  <div style={{ height: 8, display: 'flex', borderRadius: 4, overflow: 'hidden', background: 'var(--surface-subtle)' }}>
                    <div style={{ width: `${critPct}%`, background: 'var(--risk-critical)', transition: 'width 0.5s' }} />
                    <div style={{ width: `${highPct}%`, background: 'var(--risk-high)', transition: 'width 0.5s' }} />
                    <div style={{ width: `${medPct}%`, background: 'var(--risk-medium)', transition: 'width 0.5s' }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--surface-divider)' }}>
            {[['Critical', 'var(--risk-critical)'], ['High', 'var(--risk-high)'], ['Medium', 'var(--risk-medium)']].map(([label, color]) => (
              <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-muted)' }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: color, display: 'inline-block' }} /> {label}
              </span>
            ))}
          </div>
        </Section>

        {/* Risk Distribution */}
        <Section>
          <SectionHeader icon={ShieldAlert} title="Risk Tier Distribution" subtitle="Click tier to filter alert queue" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as RiskTier[]).map((tier) => {
              const count = riskDist[tier] || 0;
              const pct = Math.round((count / totalAlerts) * 100);
              return (
                <div
                  key={tier}
                  onClick={() => navigate(`/alerts?tier=${tier}`)}
                  style={{ cursor: 'pointer', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--surface-divider)', transition: 'background 0.15s', background: 'transparent' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-subtle)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <RiskBadge tier={tier} size="sm" />
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace' }}>{count}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{pct}%</span>
                    </div>
                  </div>
                  <div style={{ height: 5, borderRadius: 3, background: 'var(--surface-subtle)', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: tierColors[tier], borderRadius: 3, transition: 'width 0.6s var(--ease-smooth)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      </div>

      {/* ── C. Signal Distribution + Entities ────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* Signal types */}
        <Section>
          <SectionHeader icon={Activity} title="Top Suspicious Signal Types" subtitle="Active detectors by incident count" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {Object.entries(signalDist).map(([sigKey, count]) => {
              const name = sigKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
              return (
                <div
                  key={sigKey}
                  onClick={() => navigate(`/alerts?signal_type=${sigKey}`)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--surface-border)', cursor: 'pointer', transition: 'border-color 0.15s, background 0.15s', background: 'var(--surface-page)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--forest-pale)'; (e.currentTarget as HTMLElement).style.background = 'var(--forest-ghost)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--surface-border)'; (e.currentTarget as HTMLElement).style.background = 'var(--surface-page)'; }}
                >
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>{name}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--forest-primary)', fontFamily: 'JetBrains Mono, monospace', flexShrink: 0 }}>{count as number}</span>
                </div>
              );
            })}
          </div>
        </Section>

        {/* Top entities */}
        <Section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid var(--surface-divider)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={15} color="var(--forest-sage)" />
              <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Top Risk Entities</h2>
            </div>
            <div style={{ display: 'flex', gap: 2, background: 'var(--surface-subtle)', borderRadius: 7, padding: 2 }}>
              {(['employees', 'accounts'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setEntityTab(tab)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: 5,
                    border: 'none',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    background: entityTab === tab ? 'var(--surface-raised)' : 'transparent',
                    color: entityTab === tab ? 'var(--forest-primary)' : 'var(--text-muted)',
                    boxShadow: entityTab === tab ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    textTransform: 'capitalize',
                    transition: 'all 0.15s',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {entityTab === 'employees'
              ? (data?.top_entities?.employees || []).slice(0, 5).map((emp) => (
                <div
                  key={emp.id}
                  onClick={() => navigate(`/employees/${emp.id}`)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--surface-border)', cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-subtle)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: 'var(--forest-primary)' }}>{emp.id}</span>
                    <RiskBadge tier={emp.risk} size="sm" />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>wt:{emp.weight}</span>
                    <ChevronRight size={14} color="var(--text-muted)" />
                  </div>
                </div>
              ))
              : (data?.top_entities?.accounts || []).slice(0, 5).map((acc) => (
                <div
                  key={acc.id}
                  onClick={() => navigate(`/accounts?search=${acc.id}`)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--surface-border)', cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-subtle)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: 'var(--forest-primary)' }}>{acc.id}</span>
                    <RiskBadge tier={acc.risk} size="sm" />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>wt:{acc.weight}</span>
                    <ChevronRight size={14} color="var(--text-muted)" />
                  </div>
                </div>
              ))
            }
          </div>
        </Section>
      </div>

      {/* ── D. Priority Alerts Table ──────────────────────── */}
      <Section>
        <SectionHeader
          icon={AlertTriangle}
          title="Priority Financial & Correlation Alerts"
          subtitle="Ranked deterministically by risk tier (CRITICAL → HIGH) and incident recency"
          action={
            <button
              onClick={() => navigate('/alerts')}
              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: 'var(--forest-sage)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              View All <ArrowRight size={13} />
            </button>
          }
        />

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
                {['Tier', 'Alert ID', 'Incident Summary', 'Employee', 'Account', 'Signals', 'Status', ''].map((h) => (
                  <th key={h} style={{ padding: '0 12px 10px', textAlign: 'left', fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data?.priority_alerts || []).map((alert, i) => (
                <tr
                  key={alert.id}
                  onClick={() => navigate(`/investigations/${alert.id}`)}
                  style={{ borderBottom: '1px solid var(--surface-divider)', cursor: 'pointer', transition: 'background 0.1s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-subtle)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}
                >
                  <td style={{ padding: '11px 12px' }}><RiskBadge tier={alert.tier} size="sm" pulsing={alert.tier === 'CRITICAL'} /></td>
                  <td style={{ padding: '11px 12px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: 'var(--forest-primary)', whiteSpace: 'nowrap' }}>{alert.id}</td>
                  <td style={{ padding: '11px 12px', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)' }} title={alert.title}>{alert.title}</td>
                  <td style={{ padding: '11px 12px' }}>
                    {alert.employee_id
                      ? <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 5, background: 'var(--risk-high-bg)', color: 'var(--risk-high-text)', border: '1px solid var(--risk-high-border)' }}>{alert.employee_id}</span>
                      : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                  </td>
                  <td style={{ padding: '11px 12px' }}>
                    {alert.account_id
                      ? <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 5, background: 'var(--risk-medium-bg)', color: 'var(--risk-medium-text)', border: '1px solid var(--risk-medium-border)' }}>{alert.account_id}</span>
                      : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                  </td>
                  <td style={{ padding: '11px 12px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: 'var(--text-secondary)' }}>{alert.signal_count}</td>
                  <td style={{ padding: '11px 12px' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', padding: '2px 8px', borderRadius: 5, background: 'var(--surface-subtle)', color: 'var(--text-muted)', border: '1px solid var(--surface-border)' }}>
                      {alert.status}
                    </span>
                  </td>
                  <td style={{ padding: '11px 12px', textAlign: 'right' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/investigations/${alert.id}`); }}
                      style={{ padding: '5px 12px', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', background: 'var(--forest-ghost)', color: 'var(--forest-primary)', border: '1px solid var(--forest-pale)', transition: 'background 0.15s' }}
                    >
                      Investigate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!data?.priority_alerts || data.priority_alerts.length === 0) && (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 13 }}>
              No priority alerts — pipeline is clear.
            </div>
          )}
        </div>
      </Section>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
