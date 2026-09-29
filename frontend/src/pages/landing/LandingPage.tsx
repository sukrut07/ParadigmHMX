import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowRight, ArrowUpRight, Users, AlertTriangle, BarChart3, Network, FileCheck2 } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────
   BOKEH CANVAS — vertical light streak animation (Papersky-style)
───────────────────────────────────────────────────────────────── */
function BokehCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const stateRef = useRef<{ streaks: Streak[] }>({ streaks: [] });

  interface Streak {
    x: number;
    y: number;
    h: number;
    w: number;
    alpha: number;
    speed: number;
    hue: number;
    lightness: number;
    phase: number;
    drift: number;
  }

  const initStreaks = useCallback((W: number, H: number): Streak[] => {
    const count = 80;
    return Array.from({ length: count }, (_, i) => ({
      x: (W / count) * i + (Math.random() - 0.5) * (W / count) * 1.5,
      y: Math.random() * H * 2 - H * 0.5,
      h: 80 + Math.random() * 400,
      w: 1.5 + Math.random() * 8,
      alpha: 0.04 + Math.random() * 0.22,
      speed: 0.3 + Math.random() * 1.4,
      hue: 105 + Math.random() * 50,      // green range 105–155
      lightness: 28 + Math.random() * 28, // 28–56%
      phase: Math.random() * Math.PI * 2,
      drift: (Math.random() - 0.5) * 0.4,
    }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0, H = 0;
    const resize = () => {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
      stateRef.current.streaks = initStreaks(W, H);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let t = 0;
    const draw = () => {
      t += 0.008;

      // Dark green background
      ctx.fillStyle = '#080f0a';
      ctx.fillRect(0, 0, W, H);

      // Ambient depth gradient
      const radGrad = ctx.createRadialGradient(W * 0.5, H * 0.3, 0, W * 0.5, H * 0.5, W * 0.8);
      radGrad.addColorStop(0, 'rgba(30,60,20,0.35)');
      radGrad.addColorStop(1, 'rgba(2,8,4,0)');
      ctx.fillStyle = radGrad;
      ctx.fillRect(0, 0, W, H);

      stateRef.current.streaks.forEach((s) => {
        // Move streaks upward
        s.y -= s.speed;
        s.x += s.drift;
        if (s.y + s.h < -50) {
          s.y = H + 20;
          s.x = Math.random() * W;
        }
        if (s.x < -20) s.x = W + 20;
        if (s.x > W + 20) s.x = -20;

        const pulse = 0.7 + 0.3 * Math.sin(t * 1.8 + s.phase);
        const a = s.alpha * pulse;

        const grad = ctx.createLinearGradient(s.x, s.y, s.x, s.y + s.h);
        grad.addColorStop(0, `hsla(${s.hue},55%,${s.lightness}%,0)`);
        grad.addColorStop(0.2, `hsla(${s.hue},65%,${s.lightness + 12}%,${a})`);
        grad.addColorStop(0.5, `hsla(${s.hue},70%,${s.lightness + 18}%,${a * 1.3})`);
        grad.addColorStop(0.8, `hsla(${s.hue},65%,${s.lightness + 10}%,${a})`);
        grad.addColorStop(1, `hsla(${s.hue},55%,${s.lightness}%,0)`);

        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.beginPath();
        ctx.roundRect(s.x - s.w / 2, s.y, s.w, s.h, s.w / 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
      });

      // Vignette
      const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, W * 0.85);
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(1, 'rgba(0,0,0,0.72)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
    };
  }, [initStreaks]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
      }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────────
   PARALLAX HOOK
───────────────────────────────────────────────────────────────── */
function useParallax() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return scrollY;
}

/* ─────────────────────────────────────────────────────────────────
   SCROLL REVEAL
───────────────────────────────────────────────────────────────── */
function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ─────────────────────────────────────────────────────────────────
   FLOATING STAT CARD
───────────────────────────────────────────────────────────────── */
function FloatingCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(20px)',
        borderRadius: 16,
        padding: '20px 24px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.2)',
        border: '1px solid rgba(255,255,255,0.9)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   INLINE STAT (right side, no card bg)
───────────────────────────────────────────────────────────────── */
function GlassStat({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#a3e4b0', boxShadow: '0 0 8px #a3e4b0' }} />
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 3, letterSpacing: '0.03em' }}>{label}</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   FEATURE ROW (below hero)
───────────────────────────────────────────────────────────────── */
function FeatureRow({ icon: Icon, label, desc, accent }: { icon: React.ComponentType<any>; label: string; desc: string; accent: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 20,
        padding: '28px 32px',
        background: '#fff',
        borderRadius: 16,
        border: '1px solid #e8ece7',
        transition: 'box-shadow 0.2s, transform 0.2s',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(23,61,43,0.10)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = ''; (e.currentTarget as HTMLElement).style.transform = ''; }}
    >
      <div style={{ width: 44, height: 44, borderRadius: 12, background: accent + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={20} color={accent} />
      </div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#0e1f16', marginBottom: 6 }}>{label}</div>
        <div style={{ fontSize: 13, color: '#6b7e70', lineHeight: 1.6 }}>{desc}</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────── */
export const LandingPage: React.FC = () => {
  const scrollY = useParallax();
  const [navScrolled, setNavScrolled] = useState(false);
  const feat1 = useReveal();
  const feat2 = useReveal();

  useEffect(() => {
    setNavScrolled(scrollY > 40);
  }, [scrollY]);

  const personas = [
    { role: 'Fraud Analyst', question: 'What needs investigation now?', path: '/dashboard/fraud', icon: AlertTriangle, color: '#C92C2C' },
    { role: 'Internal Auditor', question: 'Which employees are high risk?', path: '/dashboard/audit', icon: Users, color: '#7C3AED' },
    { role: 'Compliance Head', question: 'Is the pipeline performing?', path: '/dashboard/compliance', icon: BarChart3, color: '#0369A1' },
  ];

  return (
    <div style={{ background: '#f7f8f3', overflowX: 'hidden' }}>

      {/* ── NAV ──────────────────────────────────────────── */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 48px',
          background: navScrolled ? 'rgba(8,15,10,0.72)' : 'transparent',
          backdropFilter: navScrolled ? 'blur(20px)' : 'none',
          transition: 'background 0.4s, backdrop-filter 0.4s',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, #3d6b50, #173d2b)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldAlert size={14} color="#fff" />
          </div>
          <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.08em', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
            INSIDER<span style={{ color: '#a3e4b0' }}>TRACE</span>
          </span>
        </div>

        {/* Links */}
        <div style={{ display: 'flex', gap: 36 }}>
          {['Platform', 'Detectors', 'Investigation', 'Evidence'].map((l) => (
            <span key={l} style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', cursor: 'pointer', transition: 'color 0.15s', letterSpacing: '0.01em' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
            >{l}</span>
          ))}
        </div>

        {/* CTA */}
        <Link
          to="/dashboard/fraud"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '9px 20px',
            borderRadius: 8,
            background: '#fff',
            color: '#0e1f16',
            fontSize: 13,
            fontWeight: 700,
            textDecoration: 'none',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}
        >
          Open Platform <ArrowRight size={13} />
        </Link>
      </nav>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section
        style={{
          position: 'relative',
          width: '100%',
          height: '100vh',
          minHeight: 680,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}
      >
        {/* Animated bokeh canvas */}
        <BokehCanvas />

        {/* Parallax overlay gradient — fades bottom to section below */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, transparent 50%, rgba(8,15,10,0.5) 85%, #f7f8f3 100%)',
            pointerEvents: 'none',
            transform: `translateY(${scrollY * 0.15}px)`,
            transition: 'transform 0s',
          }}
        />

        {/* ── Top-left label ─── */}
        <div
          style={{
            position: 'absolute',
            top: 88,
            left: 52,
            fontSize: 11,
            letterSpacing: '0.12em',
            color: 'rgba(255,255,255,0.45)',
            fontFamily: 'JetBrains Mono, monospace',
            transform: `translateY(${scrollY * 0.08}px)`,
          }}
        >
          [ INSIDERTRACE 2024 ]
        </div>

        {/* ── Right: floating cards ─── */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            right: 64,
            transform: `translateY(calc(-50% + ${scrollY * 0.12}px))`,
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            width: 240,
          }}
        >
          {/* Main card */}
          <FloatingCard>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #3d6b50, #173d2b)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldAlert size={14} color="#fff" />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#888', letterSpacing: '0.06em', fontFamily: 'JetBrains Mono, monospace' }}>ALERT-001</span>
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#C92C2C', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>CRITICAL</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0e1f16', lineHeight: 1.1, marginBottom: 4 }}>Insider Collusion</div>
            <div style={{ fontSize: 11, color: '#6b7e70' }}>EMP-017 · 36-min window · 5 events</div>
          </FloatingCard>

          {/* Stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingLeft: 6 }}>
            <GlassStat value="9 Detectors" label="Active rule-based engines" />
            <GlassStat value="100%" label="Evidence-backed alerts" />
          </div>
        </div>

        {/* ── Bottom-left: massive headline ─── */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            padding: '0 52px 64px',
            transform: `translateY(${scrollY * -0.05}px)`,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(64px, 10vw, 132px)',
              fontWeight: 900,
              lineHeight: 0.92,
              letterSpacing: '-0.04em',
              color: '#ffffff',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Detect<span style={{ color: '#a3e4b0' }}>©</span>
            <br />
            Financial
            <br />
            Crime.
          </h1>

          <div style={{ marginTop: 28, display: 'flex', alignItems: 'center', gap: 20 }}>
            <Link
              to="/dashboard/fraud"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '13px 28px',
                borderRadius: 10,
                background: '#fff',
                color: '#0e1f16',
                fontSize: 14,
                fontWeight: 700,
                textDecoration: 'none',
                transition: 'transform 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = ''}
            >
              Open Platform <ArrowRight size={15} />
            </Link>
            <Link
              to="/alerts"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
                fontWeight: 600,
                color: 'rgba(255,255,255,0.7)',
                textDecoration: 'none',
                borderBottom: '1px solid rgba(255,255,255,0.3)',
                paddingBottom: 2,
              }}
            >
              View alerts <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>

        {/* Scroll hint */}
        <div
          style={{
            position: 'absolute',
            bottom: 28,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            opacity: scrollY > 60 ? 0 : 0.5,
            transition: 'opacity 0.4s',
          }}
        >
          <div style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.4)', animation: 'scrollHint 1.8s ease-in-out infinite' }} />
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>scroll</span>
        </div>
      </section>

      {/* ── FEATURE STRIP ─────────────────────────────────── */}
      <section style={{ background: '#f7f8f3', padding: '80px 52px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          {/* Section label */}
          <div style={{ marginBottom: 48 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 999, background: '#ebf3ee', border: '1px solid #c8ddd2', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#173d2b', marginBottom: 16 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3d6b50' }} />
              Platform
            </div>
            <h2 style={{ margin: 0, fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#0e1f16', lineHeight: 1.08 }}>
              One graph.<br />Every connection.
            </h2>
          </div>

          {/* Feature grid */}
          <div
            ref={feat1.ref}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 16,
              opacity: feat1.visible ? 1 : 0,
              transform: feat1.visible ? 'none' : 'translateY(32px)',
              transition: 'opacity 0.7s, transform 0.7s',
            }}
          >
            <FeatureRow icon={Network} label="Causal Graph" desc="Cytoscape-powered entity network — employee → account → transaction, rendered in real time." accent="#173d2b" />
            <FeatureRow icon={AlertTriangle} label="9 Detectors" desc="Circular rings, transaction splitting, mule clusters, insider overrides — all deterministic." accent="#C92C2C" />
            <FeatureRow icon={FileCheck2} label="Evidence Panel" desc="SHA-256 verified audit chain attached to every alert. One-click export for legal review." accent="#0369A1" />
            <FeatureRow icon={Users} label="3 Persona Workspaces" desc="Fraud Analyst, Internal Auditor, Compliance Head — each gets their own operational question answered." accent="#7C3AED" />
          </div>
        </div>
      </section>

      {/* ── DARK PERSONA SECTION ─────────────────────────── */}
      <section style={{ background: '#0e1f16', padding: '80px 52px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div
            ref={feat2.ref}
            style={{
              opacity: feat2.visible ? 1 : 0,
              transform: feat2.visible ? 'none' : 'translateY(28px)',
              transition: 'opacity 0.7s, transform 0.7s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48, flexWrap: 'wrap', gap: 20 }}>
              <h2 style={{ margin: 0, fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#fff', lineHeight: 1.1 }}>
                Built for<br />three teams.
              </h2>
              <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.45)', maxWidth: 280, lineHeight: 1.6 }}>
                Each workspace answers a single precise operational question.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {personas.map((p, i) => (
                <Link
                  key={p.role}
                  to={p.path}
                  style={{
                    display: 'block',
                    padding: '28px 24px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 14,
                    textDecoration: 'none',
                    transition: 'background 0.2s, border-color 0.2s, transform 0.2s',
                    opacity: feat2.visible ? 1 : 0,
                    transitionDelay: feat2.visible ? `${i * 0.1}s` : '0s',
                  }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(255,255,255,0.08)'; el.style.borderColor = 'rgba(255,255,255,0.16)'; el.style.transform = 'translateY(-4px)'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(255,255,255,0.04)'; el.style.borderColor = 'rgba(255,255,255,0.08)'; el.style.transform = ''; }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: p.color + '20', border: `1px solid ${p.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <p.icon size={18} color={p.color} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 6 }}>{p.role}</div>
                  <div style={{ fontSize: 14, fontStyle: 'italic', color: 'rgba(255,255,255,0.5)', marginBottom: 16, lineHeight: 1.4 }}>"{p.question}"</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: '#a3e4b0' }}>
                    Open workspace <ArrowUpRight size={12} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── MINIMAL FOOTER CTA ───────────────────────────── */}
      <section
        style={{
          background: '#f7f8f3',
          padding: '80px 52px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 32,
          maxWidth: 1100,
          margin: '0 auto',
        }}
      >
        <div>
          <div style={{ fontSize: 'clamp(24px, 3vw, 40px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#0e1f16', lineHeight: 1.1, marginBottom: 12 }}>
            Start investigating.
          </div>
          <div style={{ fontSize: 13, color: '#6b7e70' }}>Deterministic · Explainable · Evidence-backed</div>
        </div>
        <Link
          to="/dashboard/fraud"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '16px 36px',
            borderRadius: 12,
            background: '#0e1f16',
            color: '#fff',
            fontSize: 15,
            fontWeight: 700,
            textDecoration: 'none',
            transition: 'transform 0.15s, box-shadow 0.2s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 40px rgba(14,31,22,0.25)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}
        >
          Launch Platform <ArrowRight size={16} />
        </Link>
      </section>

      {/* Footer bar */}
      <div style={{ borderTop: '1px solid #dde2d8', padding: '20px 52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: '#173d2b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldAlert size={11} color="#fff" />
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', color: '#0e1f16' }}>INSIDERTRACE</span>
        </div>
        <span style={{ fontSize: 11, color: '#9aad9e' }}>Deterministic tiering · SHA-256 validated · v1.1.0</span>
      </div>

      <style>{`
        @keyframes scrollHint {
          0%, 100% { transform: scaleY(1); opacity: 0.4; }
          50% { transform: scaleY(1.4); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
