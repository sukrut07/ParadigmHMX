import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Flame,
  ShieldAlert,
  Users,
  Briefcase,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Activity,
  ChevronRight,
  X,
  CreditCard,
  Building,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
} from 'recharts';
import { getFraudDashboard, getAlertTrend } from '../services/api';
import { DashboardFraudData, RiskTier } from '../types';
import { KPICard } from '../components/common/KPICard';
import { RiskBadge } from '../components/common/RiskBadge';

function Section({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #D7E0DA',
        borderRadius: 12,
        padding: 20,
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  action,
}: {
  icon?: React.ComponentType<any>;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 16,
        paddingBottom: 14,
        borderBottom: '1px solid #E7ECE9',
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {Icon && <Icon size={15} color="#176044" />}
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#17221C' }}>{title}</h2>
        </div>
        {subtitle && <p style={{ margin: '3px 0 0', fontSize: 12, color: '#68766E' }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export const FraudDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardFraudData | null>(null);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [trendMetric, setTrendMetric] = useState<'all' | 'CRITICAL' | 'HIGH' | 'MEDIUM'>('all');
  const [entityTab, setEntityTab] = useState<'employees' | 'accounts'>('employees');
  const [selectedEntity, setSelectedEntity] = useState<any | null>(null);
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

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !data) {
    return (
      <div style={{ display: 'flex', height: 'calc(100vh - 60px)', alignItems: 'center', justifyContent: 'center', background: '#F7F9F7' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: '2px solid #D7E0DA',
              borderTopColor: '#176044',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <span style={{ fontSize: 13, color: '#68766E', fontWeight: 600 }}>Loading Fraud Analyst Intelligence...</span>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div style={{ padding: 32, maxWidth: 480, margin: '60px auto' }}>
        <div style={{ background: '#FDECEC', border: '1px solid #F3B5B0', borderRadius: 12, padding: 24, textAlign: 'center' }}>
          <AlertTriangle size={28} color="#B42318" style={{ margin: '0 auto 8px' }} />
          <div style={{ fontWeight: 700, color: '#B42318', marginBottom: 6 }}>Unable to load dashboard</div>
          <div style={{ fontSize: 13, color: '#B42318', marginBottom: 16 }}>{error}</div>
          <button
            onClick={loadData}
            style={{
              padding: '8px 20px',
              borderRadius: 8,
              background: '#B42318',
              color: '#fff',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {
    critical_alerts: 0,
    high_alerts: 0,
    medium_alerts: 0,
    low_alerts: 0,
    open_cases: 0,
    unassigned_alerts: 0,
    suspicious_employees: 0,
    suspicious_accounts: 0,
    alerts_today: 0,
  };

  const riskDist = data?.risk_distribution || { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  const signalDist = data?.signal_distribution || {};
  const totalAlerts = Object.values(riskDist).reduce((a, b) => a + b, 0) || 1;

  // Donut chart dataset
  const donutData = [
    { name: 'Critical', value: riskDist.CRITICAL || 0, tier: 'CRITICAL', color: '#B42318' },
    { name: 'High', value: riskDist.HIGH || 0, tier: 'HIGH', color: '#A34800' },
    { name: 'Medium', value: riskDist.MEDIUM || 0, tier: 'MEDIUM', color: '#D97706' },
    { name: 'Low', value: riskDist.LOW || 0, tier: 'LOW', color: '#16A34A' },
  ].filter((d) => d.value > 0);

  // Top Signals Dataset
  const signalChartData = Object.entries(signalDist)
    .map(([key, count]) => ({
      rawKey: key,
      name: key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      count: Number(count),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Top Entities Dataset
  const topEntitiesList = (entityTab === 'employees' ? data?.top_entities?.employees : data?.top_entities?.accounts) || [];
  const entityChartData = topEntitiesList.slice(0, 5).map((e: any) => ({
    id: e.id,
    risk: e.risk,
    weight: e.weight || (e.risk === 'CRITICAL' ? 95 : e.risk === 'HIGH' ? 75 : 50),
    raw: e,
  }));

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1400, margin: '0 auto', background: '#F7F9F7', minHeight: 'calc(100vh - 3.75rem)' }}>
      {/* ── Page Header ─────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '3px 10px',
                borderRadius: 5,
                background: '#FDECEC',
                color: '#B42318',
                border: '1px solid #F3B5B0',
              }}
            >
              Operational
            </span>
            <span style={{ fontSize: 12, color: '#68766E' }}>Fraud Analyst · Financial Crime SOC</span>
          </div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', color: '#17221C' }}>
            Financial Activity &amp; Alert Prioritization
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#68766E', fontStyle: 'italic' }}>
            "What suspicious financial activity needs my attention right now?"
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {lastUpdated && (
            <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#68766E' }}>
              Updated {lastUpdated}
            </span>
          )}
          <button
            onClick={loadData}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 8,
              background: '#FFFFFF',
              border: '1px solid #D7E0DA',
              fontSize: 12,
              fontWeight: 600,
              color: '#425148',
              cursor: 'pointer',
              transition: 'border-color 0.15s',
              fontFamily: 'inherit',
            }}
          >
            <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : undefined }} />
            Refresh
          </button>
          <button
            onClick={() => navigate('/alerts?tier=CRITICAL')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: 8,
              background: '#176044',
              color: '#fff',
              border: 'none',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              boxShadow: '0 2px 6px rgba(23,96,68,0.2)',
            }}
          >
            <AlertTriangle size={13} /> View Alert Queue
          </button>
        </div>
      </div>

      {/* ── 1. Compact Primary Focus KPIs (Section 6.1) ───────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
        <KPICard
          title="Critical"
          value={kpis.critical_alerts}
          badge="Urgent"
          badgeColor="red"
          icon={Flame}
          onClick={() => navigate('/alerts?tier=CRITICAL')}
          accentColor="#B42318"
        />
        <KPICard
          title="High"
          value={kpis.high_alerts}
          badge="High"
          badgeColor="orange"
          icon={ShieldAlert}
          onClick={() => navigate('/alerts?tier=HIGH')}
          accentColor="#A34800"
        />
        <KPICard
          title="Open Cases"
          value={kpis.open_cases}
          badge="Active"
          badgeColor="blue"
          icon={Briefcase}
          onClick={() => navigate('/cases?status=OPEN')}
        />
        <KPICard
          title="Unassigned"
          value={kpis.unassigned_alerts}
          subtitle="Awaiting triage & case assignment"
          icon={Activity}
          onClick={() => navigate('/alerts?status=OPEN')}
        />
      </div>

      {/* ── 2. VISUALIZATION ROW 1: Risk Donut + Alert Volume Area Chart ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 16, marginBottom: 20 }}>
        {/* Risk Distribution Donut Chart (Section 7) */}
        <Section>
          <SectionHeader
            icon={ShieldAlert}
            title="Risk Tier Distribution"
            subtitle="Click slice to filter alert queue directly"
          />
          <div style={{ display: 'flex', alignItems: 'center', height: 180 }}>
            <div style={{ width: '50%', height: '100%', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={3}
                    cursor="pointer"
                    onClick={(entry: any) => navigate(`/alerts?tier=${entry.tier || entry.name}`)}
                  >
                    {donutData.map((d) => (
                      <Cell key={d.tier} fill={d.color} stroke="#FFFFFF" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any, name: any) => [`${val} alerts`, name]}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#D7E0DA',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                }}
              >
                <span style={{ fontSize: 18, fontWeight: 800, color: '#17221C', fontFamily: 'JetBrains Mono, monospace' }}>
                  {totalAlerts}
                </span>
                <span style={{ fontSize: 10, color: '#68766E', textTransform: 'uppercase', fontWeight: 700 }}>
                  Alerts
                </span>
              </div>
            </div>

            {/* Clickable Legend */}
            <div style={{ width: '50%', display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 12 }}>
              {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as RiskTier[]).map((tier) => {
                const count = riskDist[tier] || 0;
                const pct = Math.round((count / totalAlerts) * 100);
                const colorMap: Record<string, string> = {
                  CRITICAL: '#B42318',
                  HIGH: '#A34800',
                  MEDIUM: '#D97706',
                  LOW: '#16A34A',
                };
                return (
                  <div
                    key={tier}
                    onClick={() => navigate(`/alerts?tier=${tier}`)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '4px 8px',
                      borderRadius: 6,
                      cursor: 'pointer',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#F1F5F2')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: colorMap[tier] }} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#17221C' }}>{tier}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'JetBrains Mono, monospace' }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: colorMap[tier] }}>{count}</span>
                      <span style={{ fontSize: 10, color: '#68766E' }}>({pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Section>

        {/* Alert Volume Time-Series Area Chart (Section 8) */}
        <Section>
          <SectionHeader
            icon={TrendingUp}
            title="Alert Volume Time-Series"
            subtitle="Correlated daily generation rate across threat tiers"
            action={
              <div style={{ display: 'flex', gap: 2, background: '#F1F5F2', borderRadius: 7, padding: 2 }}>
                {[
                  { id: 'all', label: 'All' },
                  { id: 'CRITICAL', label: 'Crit' },
                  { id: 'HIGH', label: 'High' },
                  { id: 'MEDIUM', label: 'Med' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setTrendMetric(f.id as any)}
                    style={{
                      padding: '3px 9px',
                      borderRadius: 5,
                      border: 'none',
                      fontSize: 10,
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: 'JetBrains Mono, monospace',
                      background: trendMetric === f.id ? '#FFFFFF' : 'transparent',
                      color: trendMetric === f.id ? '#176044' : '#68766E',
                      boxShadow: trendMetric === f.id ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            }
          />
          <div style={{ height: 180, width: '100%' }}>
            {trendData.length === 0 ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#68766E', fontSize: 12 }}>
                No historical trend data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#176044" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#176044" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCrit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#B42318" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#B42318" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7ECE9" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#68766E', fontFamily: 'JetBrains Mono, monospace' }}
                    axisLine={{ stroke: '#D7E0DA' }}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#68766E', fontFamily: 'JetBrains Mono, monospace' }}
                    axisLine={{ stroke: '#D7E0DA' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#D7E0DA',
                      borderRadius: 8,
                      fontSize: 12,
                      fontFamily: 'JetBrains Mono, monospace',
                    }}
                  />
                  {trendMetric === 'all' && (
                    <Area type="monotone" dataKey="total" stroke="#176044" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" name="Total Alerts" />
                  )}
                  {(trendMetric === 'all' || trendMetric === 'CRITICAL') && (
                    <Area type="monotone" dataKey="CRITICAL" stroke="#B42318" strokeWidth={2} fillOpacity={1} fill="url(#colorCrit)" name="Critical" />
                  )}
                  {(trendMetric === 'all' || trendMetric === 'HIGH') && (
                    <Area type="monotone" dataKey="HIGH" stroke="#A34800" strokeWidth={1.5} fill="transparent" name="High" />
                  )}
                  {(trendMetric === 'all' || trendMetric === 'MEDIUM') && (
                    <Area type="monotone" dataKey="MEDIUM" stroke="#D97706" strokeWidth={1.5} fill="transparent" name="Medium" />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Section>
      </div>

      {/* ── 3. VISUALIZATION ROW 2: Horizontal Bar Charts (Signals & Entities) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        {/* Top Suspicious Signal Types (Section 9) */}
        <Section>
          <SectionHeader
            icon={Activity}
            title="Top Suspicious Signal Types"
            subtitle="Click bar to filter alert queue by detection signal"
          />
          <div style={{ height: 190, width: '100%' }}>
            {signalChartData.length === 0 ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#68766E', fontSize: 12 }}>
                No active signals detected.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={signalChartData}
                  layout="vertical"
                  margin={{ top: 4, right: 30, left: 10, bottom: 0 }}
                  onClick={(state: any) => {
                    if (state?.activePayload && state.activePayload.length > 0) {
                      const item = state.activePayload[0].payload;
                      navigate(`/alerts?signal_type=${item.rawKey}`);
                    }
                  }}
                  cursor="pointer"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7ECE9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#68766E' }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 11, fill: '#17221C', fontWeight: 600 }}
                    width={130}
                    axisLine={{ stroke: '#D7E0DA' }}
                  />
                  <Tooltip
                    formatter={(val: any) => [`${val} alerts triggered`, 'Count']}
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#D7E0DA', borderRadius: 8, fontSize: 12 }}
                  />
                  <Bar dataKey="count" fill="#176044" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Section>

        {/* Top Risk Entities Bar Chart (Section 10) */}
        <Section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid #E7ECE9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={15} color="#176044" />
              <div>
                <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#17221C' }}>Top Risk Entities</h2>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: '#68766E' }}>Click bar to open contextual intelligence drawer</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 2, background: '#F1F5F2', borderRadius: 7, padding: 2 }}>
              {(['employees', 'accounts'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setEntityTab(tab)}
                  style={{
                    padding: '3px 10px',
                    borderRadius: 5,
                    border: 'none',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    background: entityTab === tab ? '#FFFFFF' : 'transparent',
                    color: entityTab === tab ? '#176044' : '#68766E',
                    boxShadow: entityTab === tab ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                    textTransform: 'capitalize',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div style={{ height: 180, width: '100%' }}>
            {entityChartData.length === 0 ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#68766E', fontSize: 12 }}>
                No elevated risk entities.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={entityChartData}
                  layout="vertical"
                  margin={{ top: 4, right: 30, left: 10, bottom: 0 }}
                  onClick={(state: any) => {
                    if (state?.activePayload && state.activePayload.length > 0) {
                      const item = state.activePayload[0].payload;
                      setSelectedEntity(item.raw);
                    }
                  }}
                  cursor="pointer"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7ECE9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#68766E' }} />
                  <YAxis
                    dataKey="id"
                    type="category"
                    tick={{ fontSize: 11, fill: '#17221C', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}
                    width={90}
                    axisLine={{ stroke: '#D7E0DA' }}
                  />
                  <Tooltip
                    formatter={(val: any, _, item: any) => [`Risk Weight: ${val} (${item.payload.risk})`, 'Risk Weight']}
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#D7E0DA', borderRadius: 8, fontSize: 12 }}
                  />
                  <Bar
                    dataKey="weight"
                    radius={[0, 4, 4, 0]}
                    fill="#B42318"
                  >
                    {entityChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.risk === 'CRITICAL' ? '#B42318' : entry.risk === 'HIGH' ? '#A34800' : '#176044'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Section>
      </div>

      {/* ── 4. PRIMARY WORK QUEUE: Priority Financial Alerts ─────────── */}
      <Section>
        <SectionHeader
          icon={AlertTriangle}
          title="Priority Financial &amp; Correlation Alerts"
          subtitle="Ranked deterministically by risk tier and correlation urgency"
          action={
            <button
              onClick={() => navigate('/alerts')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                fontWeight: 600,
                color: '#176044',
                background: '#EAF7F0',
                border: '1px solid #B8DCC8',
                borderRadius: 7,
                padding: '6px 14px',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <span>View Full Alert Queue ({totalAlerts})</span>
              <ArrowRight size={13} />
            </button>
          }
        />

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #D7E0DA' }}>
                {['Risk Tier', 'Alert ID', 'Entity Connection', 'Anomaly Focus', 'Signals', 'Status', ''].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '0 12px 10px',
                      textAlign: 'left',
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.07em',
                      textTransform: 'uppercase',
                      color: '#68766E',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data?.priority_alerts || []).map((alert) => (
                <tr
                  key={alert.id}
                  onClick={() => navigate(`/investigations/${alert.id}`)}
                  style={{
                    borderBottom: '1px solid #E7ECE9',
                    cursor: 'pointer',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#F1F5F2')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                >
                  <td style={{ padding: '12px 12px' }}>
                    <RiskBadge tier={alert.tier} size="sm" pulsing={alert.tier === 'CRITICAL'} />
                  </td>
                  <td
                    style={{
                      padding: '12px 12px',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontWeight: 700,
                      color: '#176044',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {alert.id}
                  </td>
                  <td style={{ padding: '12px 12px', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {alert.employee_id ? (
                        <span
                          style={{
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: 11,
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: 5,
                            background: '#FFF0E8',
                            color: '#A34800',
                            border: '1px solid #F1C29E',
                          }}
                        >
                          {alert.employee_id}
                        </span>
                      ) : (
                        <span style={{ color: '#68766E' }}>—</span>
                      )}
                      <span style={{ color: '#68766E', fontSize: 11 }}>→</span>
                      {alert.account_id ? (
                        <span
                          style={{
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: 11,
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: 5,
                            background: '#FFF7E8',
                            color: '#8A5A00',
                            border: '1px solid #E9CF8B',
                          }}
                        >
                          {alert.account_id}
                        </span>
                      ) : (
                        <span style={{ color: '#68766E' }}>—</span>
                      )}
                    </div>
                  </td>
                  <td
                    style={{
                      padding: '12px 12px',
                      maxWidth: 320,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: '#17221C',
                      fontWeight: 500,
                    }}
                    title={alert.title}
                  >
                    {alert.title}
                  </td>
                  <td style={{ padding: '12px 12px', whiteSpace: 'nowrap' }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontFamily: 'JetBrains Mono, monospace',
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: 4,
                        background: '#F1F5F2',
                        border: '1px solid #D7E0DA',
                        color: '#176044',
                      }}
                    >
                      {alert.signal_count} signals
                    </span>
                  </td>
                  <td style={{ padding: '12px 12px', whiteSpace: 'nowrap' }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        padding: '2px 8px',
                        borderRadius: 5,
                        background: '#F1F5F2',
                        color: '#68766E',
                        border: '1px solid #D7E0DA',
                      }}
                    >
                      {alert.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/investigations/${alert.id}`);
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '6px 14px',
                        borderRadius: 7,
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        background: '#176044',
                        color: '#ffffff',
                        border: 'none',
                        boxShadow: '0 2px 6px rgba(23,96,68,0.2)',
                      }}
                    >
                      <span>Investigate</span>
                      <ChevronRight size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!data?.priority_alerts || data.priority_alerts.length === 0) && (
            <div style={{ textAlign: 'center', padding: '36px 0', color: '#68766E', fontSize: 13 }}>
              Pipeline clear — no unassigned high or critical priority alerts.
            </div>
          )}
        </div>
      </Section>

      {/* ── 5. Contextual Entity Detail Drawer (Section 10) ─────────── */}
      {selectedEntity && (
        <div
          style={{
            position: 'fixed',
            right: 24,
            bottom: 24,
            width: 340,
            background: '#FFFFFF',
            border: '1px solid #D7E0DA',
            borderRadius: 12,
            boxShadow: '0 12px 36px rgba(0,0,0,0.15)',
            zIndex: 40,
            padding: 18,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E7ECE9', paddingBottom: 10, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {selectedEntity.id.startsWith('EMP') ? <Users size={16} color="#176044" /> : <CreditCard size={16} color="#176044" />}
              <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: '#17221C' }}>
                {selectedEntity.id}
              </span>
            </div>
            <button
              onClick={() => setSelectedEntity(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#68766E' }}
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#68766E' }}>Assigned Risk Tier:</span>
              <RiskBadge tier={selectedEntity.risk} size="sm" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#68766E' }}>Anomaly Weight:</span>
              <span style={{ fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{selectedEntity.weight || 85}/100</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#68766E' }}>Linked Alerts:</span>
              <span style={{ fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{selectedEntity.alert_count || 3}</span>
            </div>

            <button
              onClick={() => {
                if (selectedEntity.id.startsWith('EMP')) {
                  navigate(`/employees/${selectedEntity.id}`);
                } else {
                  navigate(`/accounts?search=${selectedEntity.id}`);
                }
              }}
              style={{
                marginTop: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 8,
                background: '#176044',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              <span>{selectedEntity.id.startsWith('EMP') ? 'View Employee Surveillance →' : 'View Account Ledger →'}</span>
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
