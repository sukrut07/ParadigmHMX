import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  ArrowRight,
  Network,
  Clock,
  FileCheck2,
  Users,
  CreditCard,
  GitBranch,
  ShieldCheck,
  AlertTriangle,
  BarChart3,
  ChevronRight,
  CheckCircle2,
  Circle,
  Zap,
  Eye,
  Lock,
  TrendingDown,
  ArrowUpRight,
} from 'lucide-react';

/* ── Hook: Intersection Observer reveal ─────────────────────── */
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ── Animated counter ───────────────────────────────────────── */
function AnimatedNumber({ target, suffix = '', prefix = '' }: { target: number; suffix?: string; prefix?: string }) {
  const [val, setVal] = useState(0);
  const { ref, visible } = useReveal(0.3);
  useEffect(() => {
    if (!visible) return;
    const duration = 1200;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(ease * target));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [visible, target]);
  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
}

/* ── Hero animated network graph ───────────────────────────── */
function HeroGraph({ active }: { active: number }) {
  const nodes = [
    { cx: 260, cy: 120, label: 'EMP-017', sub: 'Branch Teller', color: '#7C3AED' },
    { cx: 460, cy: 100, label: 'ACC-0231', sub: 'Target Account', color: '#0369A1' },
    { cx: 600, cy: 200, label: 'Override', sub: '₹5L → ₹15L', color: '#D97706' },
    { cx: 500, cy: 310, label: '₹9.8L', sub: 'UPI Outbound', color: '#C92C2C' },
    { cx: 300, cy: 300, label: 'Mule Ring', sub: 'ACC-0442→0553', color: '#C92C2C' },
  ];

  const edges = [
    { x1: 260, y1: 120, x2: 460, y2: 100 },
    { x1: 460, y1: 100, x2: 600, y2: 200 },
    { x1: 600, y1: 200, x2: 500, y2: 310 },
    { x1: 500, y1: 310, x2: 300, y2: 300 },
  ];

  return (
    <svg viewBox="0 0 760 430" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
      {/* Background grid */}
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(23,61,43,0.06)" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="760" height="430" fill="url(#grid)" rx="12" />

      {/* Edges */}
      {edges.map((e, i) => (
        <line
          key={i}
          x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
          stroke={i < active ? '#C92C2C' : 'rgba(23,61,43,0.15)'}
          strokeWidth={i < active ? 2 : 1}
          strokeDasharray={i < active ? '0' : '4 4'}
          style={{ transition: 'stroke 0.6s, stroke-width 0.4s' }}
        />
      ))}

      {/* Nodes */}
      {nodes.map((n, i) => {
        const lit = i <= active;
        return (
          <g key={n.label} style={{ transition: 'opacity 0.5s', opacity: lit ? 1 : 0.3 }}>
            <circle cx={n.cx} cy={n.cy} r={lit ? 36 : 28}
              fill={lit ? `${n.color}15` : 'rgba(23,61,43,0.04)'}
              stroke={lit ? n.color : 'rgba(23,61,43,0.15)'}
              strokeWidth={lit ? 2 : 1}
              style={{ transition: 'all 0.5s' }}
            />
            {lit && (
              <circle cx={n.cx} cy={n.cy} r={44}
                fill="none" stroke={n.color} strokeWidth={1} opacity={0.2}
                style={{ animation: 'pulse-dot 2s infinite' }}
              />
            )}
            <text x={n.cx} y={n.cy - 4} textAnchor="middle" fontSize={11} fontWeight="700" fill={lit ? n.color : 'rgba(23,61,43,0.4)'} fontFamily="Inter,sans-serif">
              {n.label}
            </text>
            <text x={n.cx} y={n.cy + 10} textAnchor="middle" fontSize={9} fill={lit ? 'rgba(14,31,22,0.55)' : 'rgba(23,61,43,0.3)'} fontFamily="Inter,sans-serif">
              {n.sub}
            </text>
          </g>
        );
      })}

      {/* Alert badge on critical path */}
      {active >= 4 && (
        <g>
          <rect x={60} y={360} width={160} height={44} rx={8}
            fill="#FEF2F2" stroke="#FECACA" strokeWidth={1} />
          <text x={80} y={378} fontSize={10} fontWeight="700" fill="#7F1D1D" fontFamily="Inter,sans-serif">⚠ CRITICAL ALERT</text>
          <text x={80} y={393} fontSize={9} fill="#991B1B" fontFamily="Inter,sans-serif">Insider Collusion Detected</text>
        </g>
      )}
    </svg>
  );
}

/* ── Main Landing Page ───────────────────────────────────────── */
export const LandingPage: React.FC = () => {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive((p) => (p + 1) % 6), 2400);
    return () => clearInterval(t);
  }, []);

  const detect1 = useReveal();
  const detect2 = useReveal();
  const detect3 = useReveal();
  const statsReveal = useReveal();
  const workReveal = useReveal();
  const caseReveal = useReveal();

  const detectors = [
    {
      group: 'Financial Crime',
      color: '#C92C2C',
      bg: '#FEF2F2',
      border: '#FECACA',
      items: [
        { name: 'Circular Transfer Ring', desc: 'Detects funds cycling through 3–12 intermediate accounts to obscure origin.' },
        { name: 'Transaction Splitting', desc: 'Identifies structuring — multiple sub-threshold transfers from a common source.' },
        { name: 'Rapid Pass-Through', desc: 'Flags accounts receiving and forwarding ≥90% of funds within 24 hours.' },
        { name: 'Mule Account Cluster', desc: 'Graph-based detection of coordinated dormant-to-active account behaviour.' },
      ],
    },
    {
      group: 'Insider Risk',
      color: '#7C3AED',
      bg: '#F5F3FF',
      border: '#DDD6FE',
      items: [
        { name: 'Out-of-Role Account Access', desc: 'Employee queries accounts outside their branch / authorized jurisdiction.' },
        { name: 'KYC Profile Tampering', desc: 'Contact, address, or KYC field edits without dual-control approval.' },
        { name: 'Privilege Abuse Override', desc: 'Emergency or manager-bypass limit elevation followed by anomalous outflow.' },
        { name: 'After-Hours Sensitive Access', desc: 'High-sensitivity data access outside rostered working hours.' },
      ],
    },
    {
      group: 'Cross-Domain Correlation',
      color: '#0369A1',
      bg: '#EFF6FF',
      border: '#BAE6FD',
      items: [
        { name: 'Temporal Access-to-Transfer Linkage', desc: 'Employee action within T±60 minutes of anomalous account transaction.' },
        { name: 'KYC Change → Transfer Correlation', desc: 'Contact modification preceding high-value outbound within a short window.' },
      ],
    },
  ];

  const riskFactors = [
    { label: 'Insider Privilege', icon: Lock, desc: 'Elevated permissions or emergency overrides used abnormally.' },
    { label: 'Money Flow', icon: TrendingDown, desc: 'Velocity, direction, and pattern of fund movement.' },
    { label: 'KYC Mismatch', icon: Eye, desc: 'Customer profile inconsistency with known-good baseline.' },
    { label: 'Temporal Linkage', icon: Clock, desc: 'Time proximity between employee action and financial event.' },
    { label: 'Network Exposure', icon: Network, desc: 'Connection to known mule accounts or flagged entities.' },
  ];

  const causalSteps = [
    { time: '14:02', badge: 'OUT_OF_ROLE_ACCESS', badgeColor: '#7C3AED', title: 'Out-of-Jurisdiction Account View', desc: 'EMP-017 (Teller, Branch BR-01) queries high-net-worth account ACC-0231 outside authorized branch.' },
    { time: '14:08', badge: 'KYC_TAMPERING', badgeColor: '#D97706', title: 'Unapproved Contact Edit', desc: 'Mobile number changed without dual-control approval. Unverified number: +91-98765-XXXXX.' },
    { time: '14:17', badge: 'PRIVILEGE_ABUSE', badgeColor: '#C92C2C', title: 'Limit Boost Override', desc: 'Emergency bypass elevates daily ceiling from ₹5,00,000 → ₹15,00,000 with no audit ticket.' },
    { time: '14:31', badge: 'RAPID_PASSTHROUGH', badgeColor: '#C92C2C', title: '₹4.8L Rapid Outbound', desc: 'Immediate UPI transfer of ₹4,80,000 routed to intermediary mule account ACC-0442.' },
    { time: '14:38', badge: 'MULE_CLUSTER', badgeColor: '#C92C2C', title: 'Secondary Hop — ₹4.7L', desc: 'Funds hop again to ACC-0553. Ring closes with ₹1L stub returned to origin shell.' },
  ];

  return (
    <div style={{ background: 'var(--surface-page)', color: 'var(--text-primary)', overflowX: 'hidden' }}>

      {/* ── NAV ─────────────────────────────────────────── */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 48px',
          background: 'rgba(247,248,243,0.92)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--surface-border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: 'linear-gradient(135deg, var(--forest-primary), var(--forest-sage))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldAlert size={15} color="#fff" />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.05em', color: 'var(--forest-primary)' }}>
            INSIDER<span style={{ color: 'var(--forest-sage)' }}>TRACE</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link
            to="/dashboard/fraud"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 18px',
              borderRadius: 8,
              background: 'var(--forest-primary)',
              color: '#fff',
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: 600,
              transition: 'background 0.2s',
            }}
          >
            Open Platform <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section
        className="hero-gradient"
        style={{
          paddingTop: 120,
          paddingBottom: 80,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        {/* Eyebrow */}
        <div
          className="animate-fade-up"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '5px 14px',
            borderRadius: 999,
            border: '1px solid var(--forest-pale)',
            background: 'var(--forest-ghost)',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--forest-primary)',
            marginBottom: 28,
          }}
        >
          <Circle size={7} fill="var(--forest-sage)" color="var(--forest-sage)" style={{ animation: 'pulse-dot 2s infinite' }} />
          Deterministic Financial Crime Intelligence
        </div>

        {/* Headline */}
        <h1
          className="animate-fade-up delay-100"
          style={{
            fontSize: 'clamp(36px, 5.5vw, 72px)',
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: '-0.03em',
            textAlign: 'center',
            color: 'var(--forest-deep)',
            maxWidth: 800,
            margin: '0 auto 24px',
          }}
        >
          Connect employee actions
          <br />
          to <span style={{ color: 'var(--forest-sage)' }}>financial crime</span>
        </h1>

        <p
          className="animate-fade-up delay-200"
          style={{
            fontSize: 18,
            lineHeight: 1.65,
            color: 'var(--text-secondary)',
            textAlign: 'center',
            maxWidth: 560,
            margin: '0 auto 40px',
          }}
        >
          InsiderTrace runs 9 deterministic detectors across employee access logs,
          account events, and transaction flows — surfacing the precise causal chain
          from insider action to money movement.
        </p>

        {/* CTAs */}
        <div className="animate-fade-up delay-300" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 64 }}>
          <Link to="/dashboard/fraud" className="btn-forest">
            Open Fraud Analyst Workspace <ArrowRight size={16} />
          </Link>
          <Link to="/alerts" className="btn-outline-forest">
            View Live Alerts
          </Link>
        </div>

        {/* Graph Card */}
        <div
          className="animate-fade-up delay-400"
          style={{
            width: '100%',
            maxWidth: 820,
            margin: '0 auto',
            padding: 24,
            background: 'var(--surface-raised)',
            border: '1px solid var(--surface-border)',
            borderRadius: 16,
            boxShadow: '0 24px 64px rgba(14,31,22,0.08), 0 4px 16px rgba(14,31,22,0.04)',
          }}
        >
          {/* Card header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>Insider Collusion Graph — Scenario 1</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>EMP-017 · ACC-0231 · Mule Ring · Live causal path</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, background: 'var(--risk-critical-bg)', border: '1px solid var(--risk-critical-border)' }}>
              <Circle size={7} fill="var(--risk-critical)" color="var(--risk-critical)" />
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--risk-critical)' }}>CRITICAL</span>
            </div>
          </div>
          <div style={{ height: 300 }}>
            <HeroGraph active={active} />
          </div>
          {/* Step indicators */}
          <div style={{ display: 'flex', gap: 4, marginTop: 16 }}>
            {[0,1,2,3,4].map((i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: 3,
                  borderRadius: 2,
                  background: i <= active ? 'var(--risk-critical)' : 'var(--surface-border)',
                  transition: 'background 0.4s',
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BELT ───────────────────────────────────── */}
      <section
        ref={statsReveal.ref}
        style={{
          background: 'var(--forest-primary)',
          padding: '52px 48px',
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 1,
          }}
        >
          {[
            { value: 9, suffix: '', label: 'Detection typologies', sub: 'across financial and insider domains' },
            { value: 5, suffix: '', label: 'Risk dimensions', sub: 'per alert — explainable, not opaque' },
            { value: 0, suffix: ' ms', label: 'ML inference delay', sub: 'fully deterministic rule engine' },
            { value: 100, suffix: '%', label: 'Evidence-backed', sub: 'every alert has a causal chain' },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                padding: '32px 40px',
                borderRight: i < 3 ? '1px solid rgba(255,255,255,0.08)' : undefined,
                opacity: statsReveal.visible ? 1 : 0,
                transform: statsReveal.visible ? 'none' : 'translateY(20px)',
                transition: `opacity 0.6s ${i * 0.1}s, transform 0.6s ${i * 0.1}s`,
              }}
            >
              <div style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800, color: 'var(--forest-pale)', lineHeight: 1 }}>
                {statsReveal.visible ? <AnimatedNumber target={stat.value} suffix={stat.suffix} /> : `0${stat.suffix}`}
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginTop: 8 }}>{stat.label}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{stat.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── DETECTORS SECTION ────────────────────────────── */}
      <section style={{ padding: '96px 48px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 64, maxWidth: 560 }}>
          <div className="badge-pill" style={{ background: 'var(--forest-ghost)', color: 'var(--forest-primary)', border: '1px solid var(--forest-pale)', marginBottom: 16 }}>
            Detection Engine
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, lineHeight: 1.12, letterSpacing: '-0.02em', margin: '0 0 16px' }}>
            9 detectors. One unified risk surface.
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.65, color: 'var(--text-secondary)', margin: 0 }}>
            Each detector is deterministic — no black-box ML. Every flag has a named rule,
            a threshold, and a traceable evidence record.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          {detectors.map((group, gi) => {
            const reveal = gi === 0 ? detect1 : gi === 1 ? detect2 : detect3;
            return (
              <div
                key={group.group}
                ref={reveal.ref}
                style={{
                  background: 'var(--surface-raised)',
                  border: '1px solid var(--surface-border)',
                  borderRadius: 12,
                  overflow: 'hidden',
                  opacity: reveal.visible ? 1 : 0,
                  transform: reveal.visible ? 'none' : 'translateY(24px)',
                  transition: 'opacity 0.6s, transform 0.6s',
                }}
              >
                {/* Group header */}
                <div
                  style={{
                    padding: '16px 20px',
                    background: group.bg,
                    borderBottom: `1px solid ${group.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: group.color,
                    }}
                  />
                  <span style={{ fontSize: 12, fontWeight: 700, color: group.color, letterSpacing: '0.04em' }}>
                    {group.group.toUpperCase()}
                  </span>
                </div>

                {/* Items */}
                <div style={{ padding: '8px 0' }}>
                  {group.items.map((item) => (
                    <div
                      key={item.name}
                      style={{
                        padding: '12px 20px',
                        borderBottom: '1px solid var(--surface-divider)',
                        transition: 'background 0.15s',
                        cursor: 'default',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <CheckCircle2 size={13} color={group.color} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: 'var(--text-muted)' }}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CAUSAL CHAIN WALKTHROUGH ──────────────────────── */}
      <section style={{ background: 'var(--forest-ghost)', padding: '96px 48px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'start' }}>

          {/* Left: copy */}
          <div ref={workReveal.ref} style={{ opacity: workReveal.visible ? 1 : 0, transform: workReveal.visible ? 'none' : 'translateX(-24px)', transition: 'opacity 0.7s, transform 0.7s' }}>
            <div className="badge-pill" style={{ background: 'var(--forest-ghost)', color: 'var(--forest-primary)', border: '1px solid var(--forest-pale)', marginBottom: 16 }}>
              Investigation Workspace
            </div>
            <h2 style={{ fontSize: 'clamp(24px, 3vw, 38px)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em', margin: '0 0 16px' }}>
              Every alert tells a story.<br />
              We show you the whole chapter.
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text-secondary)', margin: '0 0 28px' }}>
              InsiderTrace does not produce a single opaque score. For each alert,
              you see the exact causal chain: which employee action, which account event,
              which fund movement — and when.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { icon: GitBranch, label: 'Causal Graph', desc: 'Cytoscape-powered entity graph linking employee → account → transaction.' },
                { icon: Clock, label: 'Event Timeline', desc: 'Chronological sequence of access events and financial actions in one view.' },
                { icon: FileCheck2, label: 'Evidence Panel', desc: 'SHA-256 verified audit records attached to every alert — exportable.' },
              ].map((f) => (
                <div key={f.label} style={{ display: 'flex', gap: 14, padding: 16, borderRadius: 10, background: 'var(--surface-raised)', border: '1px solid var(--surface-border)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--forest-ghost)', border: '1px solid var(--forest-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <f.icon size={16} color="var(--forest-primary)" />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>{f.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <Link to="/investigations" className="btn-forest" style={{ marginTop: 28, alignSelf: 'flex-start' }}>
              Open Investigation Workspace <ChevronRight size={15} />
            </Link>
          </div>

          {/* Right: causal chain visual */}
          <div
            ref={caseReveal.ref}
            style={{
              opacity: caseReveal.visible ? 1 : 0,
              transform: caseReveal.visible ? 'none' : 'translateX(24px)',
              transition: 'opacity 0.7s 0.15s, transform 0.7s 0.15s',
            }}
          >
            <div style={{ background: 'var(--surface-raised)', border: '1px solid var(--surface-border)', borderRadius: 12, overflow: 'hidden' }}>
              {/* Panel header */}
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>Causal Chain — ALT-20240612-001</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>EMP-017 · 36-minute window · 5 events</div>
                </div>
                <div style={{ padding: '3px 10px', borderRadius: 999, background: 'var(--risk-critical-bg)', border: '1px solid var(--risk-critical-border)', fontSize: 11, fontWeight: 700, color: 'var(--risk-critical)' }}>
                  CRITICAL
                </div>
              </div>

              {/* Steps */}
              <div style={{ padding: '16px 20px' }}>
                {causalSteps.map((step, i) => (
                  <div key={i} className="causal-step" style={{ marginBottom: i < causalSteps.length - 1 ? 20 : 0 }}>
                    <div className="causal-step-dot" style={{ background: `${step.badgeColor}15`, border: `1.5px solid ${step.badgeColor}` }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: step.badgeColor }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)' }}>{step.time}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.04em', padding: '2px 7px', borderRadius: 4, background: `${step.badgeColor}12`, color: step.badgeColor }}>
                        {step.badge}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>{step.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{step.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── RISK DIMENSIONS ──────────────────────────────── */}
      <section style={{ padding: '96px 48px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div className="badge-pill" style={{ background: 'var(--forest-ghost)', color: 'var(--forest-primary)', border: '1px solid var(--forest-pale)', marginBottom: 16, display: 'inline-flex' }}>
            Five-Factor Risk Engine
          </div>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 40px)', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 12px' }}>
            Explainable by design.
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', margin: '0 auto', maxWidth: 480 }}>
            Every risk tier is a weighted aggregate of 5 named factors. No single-score black box.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
          {riskFactors.map((f, i) => (
            <div
              key={f.label}
              style={{
                padding: '24px 20px',
                background: 'var(--surface-raised)',
                border: '1px solid var(--surface-border)',
                borderRadius: 12,
                textAlign: 'center',
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--forest-ghost)', border: '1px solid var(--forest-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <f.icon size={18} color="var(--forest-primary)" />
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{f.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.55 }}>{f.desc}</div>
            </div>
          ))}
        </div>

        {/* Risk tier table */}
        <div style={{ marginTop: 40, background: 'var(--surface-raised)', border: '1px solid var(--surface-border)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--surface-border)', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Risk Tier Thresholds
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {[
              { tier: 'CRITICAL', range: '≥ 85', action: 'Immediate escalation + case creation', className: 'risk-critical' },
              { tier: 'HIGH', range: '65 – 84', action: 'Analyst review within 4 hours', className: 'risk-high' },
              { tier: 'MEDIUM', range: '40 – 64', action: 'Queue for next business day', className: 'risk-medium' },
              { tier: 'LOW', range: '< 40', action: 'Logged, no action required', className: 'risk-low' },
            ].map((t, i) => (
              <div
                key={t.tier}
                style={{
                  padding: '16px 20px',
                  borderRight: i < 3 ? '1px solid var(--surface-border)' : undefined,
                }}
              >
                <span className={t.className} style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, marginBottom: 8 }}>
                  {t.tier}
                </span>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>{t.range}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{t.action}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PERSONAS ─────────────────────────────────────── */}
      <section style={{ background: 'var(--forest-primary)', padding: '80px 48px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center', marginBottom: 52 }}>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 38px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', margin: '0 0 12px' }}>
            Built for three teams. One platform.
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', margin: 0 }}>
            Each persona gets a workspace answering their specific operational question.
          </p>
        </div>

        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            {
              role: 'Fraud Analyst',
              question: 'What should I investigate today?',
              icon: AlertTriangle,
              path: '/dashboard/fraud',
              items: ['Prioritised alert queue by CRITICAL→LOW', 'Top risky employees & accounts', 'Transaction velocity heatmap'],
            },
            {
              role: 'Internal Auditor',
              question: 'Which employees need review?',
              icon: Users,
              path: '/dashboard/audit',
              items: ['Employee risk ranking with access scores', 'Blast radius per high-risk employee', 'KYC tampering timeline'],
            },
            {
              role: 'Compliance Head',
              question: 'Is the pipeline performing?',
              icon: BarChart3,
              path: '/dashboard/compliance',
              items: ['Detection rate, FPR, precision metrics', 'Open case SLA compliance', 'Regulatory export readiness'],
            },
          ].map((persona) => (
            <Link
              key={persona.role}
              to={persona.path}
              style={{
                display: 'block',
                padding: 24,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                textDecoration: 'none',
                transition: 'background 0.2s, border-color 0.2s',
                color: 'inherit',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <persona.icon size={16} color="var(--forest-pale)" />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{persona.role}</div>
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--forest-pale)', marginBottom: 14, lineHeight: 1.4 }}>
                "{persona.question}"
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {persona.items.map((item) => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ChevronRight size={12} color="var(--forest-light)" />
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{item}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 16, fontSize: 12, fontWeight: 600, color: 'var(--forest-pale)' }}>
                Open workspace <ArrowUpRight size={13} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── EVIDENCE / AUDIT TRAIL ───────────────────────── */}
      <section style={{ padding: '80px 48px', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <div className="badge-pill" style={{ background: 'var(--forest-ghost)', color: 'var(--forest-primary)', border: '1px solid var(--forest-pale)', marginBottom: 16, display: 'inline-flex' }}>
          Evidence Integrity
        </div>
        <h2 style={{ fontSize: 'clamp(24px, 3vw, 40px)', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 16px' }}>
          Every alert. SHA-256 verified. Exportable.
        </h2>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.65 }}>
          InsiderTrace attaches a tamper-evident evidence record to each case.
          Export to JSON for legal review, regulatory submission, or SIEM integration.
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { icon: ShieldCheck, label: 'SHA-256 hash verified', desc: 'Per-record cryptographic integrity' },
            { icon: FileCheck2, label: 'Case-attached evidence', desc: 'Every alert carries its proof chain' },
            { icon: Zap, label: 'JSON / CSV export', desc: 'One-click for legal or compliance teams' },
          ].map((f) => (
            <div key={f.label} style={{ flex: '1 1 200px', maxWidth: 260, padding: '24px 20px', background: 'var(--surface-raised)', border: '1px solid var(--surface-border)', borderRadius: 12, textAlign: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--forest-ghost)', border: '1px solid var(--forest-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <f.icon size={18} color="var(--forest-primary)" />
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{f.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER CTA ───────────────────────────────────── */}
      <footer style={{ background: 'var(--forest-deep)', padding: '60px 48px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 32 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, var(--forest-sage), var(--forest-mid))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldAlert size={13} color="#fff" />
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: '0.05em' }}>INSIDERTRACE</span>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0, maxWidth: 360, lineHeight: 1.6 }}>
              Deterministic · Explainable · Evidence-backed financial crime investigation platform.
              Built on 9 rule-based detectors with no ML opacity.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
            <Link to="/dashboard/fraud" className="btn-forest" style={{ background: 'var(--forest-sage)' }}>
              Launch Platform <ArrowRight size={15} />
            </Link>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'right' }}>
              Deterministic tiering · SHA-256 validated · v1.1.0
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
