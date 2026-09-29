import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Shield,
  Activity,
  Layers,
  Lock,
  Search,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  AlertTriangle,
  UserCheck,
  FileCheck2,
  GitBranch,
  Network,
  Users,
  Eye,
  Clock,
  Database,
  Smartphone,
  CreditCard,
  FileText,
  Binary,
} from 'lucide-react';
import { InsiderTraceLogo } from '../../components/common/InsiderTraceLogo';

/* ─── Window Vanta Declaration ───────────────────────────────────── */
declare global {
  interface Window {
    VANTA?: {
      WAVES?: (opts: Record<string, unknown>) => {
        destroy: () => void;
      };
    };
  }
}

/* ─── Structured Content Object for InsiderTrace ─────────────────── */
const landingContent = {
  metadata: {
    title: 'InsiderTrace — Financial Crime & Insider Risk Intelligence',
    eyebrow: '[ FINANCIAL CRIME × INSIDER RISK ]',
  },
  hero: {
    headlineLine1: 'Explore',
    headlineLine2: 'Entity Links',
    headlineCopyright: '',
    supportingText:
      'InsiderTrace connects employee activity, account changes and transaction networks to uncover suspicious patterns that isolated monitoring can miss.',
    secondarySupporting:
      'From access logs and permissions to money flows and account changes, every alert is backed by the events and evidence that caused it.',
    primaryCta: 'Open Investigation',
    primaryCtaLink: '/dashboard/fraud',
    secondaryCta: 'How It Works',
    secondaryCtaTarget: 'how-it-works',
    sideCard: {
      alertId: 'ALERT / AL-10291',
      riskTier: 'CRITICAL RISK',
      title: 'Connected anomaly',
      entityPath: 'EMP-017 → ACC-0231 → ACC-0912',
      eventSummary: 'Employee activity linked to an unusual account change and subsequent money movement.',
      integritySeal: '5 signals matched · Evidence linked',
    },
    capabilities: [
      {
        number: '01',
        title: '9 Detection Signals',
        description: 'Circular transfers, transaction splitting, privilege abuse, profile mismatch and related anomalies.',
      },
      {
        number: '02',
        title: '5 Risk Dimensions',
        description: 'Privilege, money flow, profile mismatch, temporal linkage and network exposure.',
      },
      {
        number: '03',
        title: 'Evidence First',
        description: 'Every alert shows the signals, events and evidence behind the decision.',
      },
    ],
  },
  problem: {
    eyebrow: 'THE PROBLEM',
    headline: 'Suspicious activity rarely appears in one place.',
    body: 'A transaction can look normal in isolation. An employee access event can look legitimate on its own. An account change may appear routine. The risk emerges when these events are connected.',
    columns: [
      {
        title: 'TRANSACTION',
        subtitle: 'What moved?',
        items: ['Amount & Currency', 'Source Entity', 'Destination Entity', 'Execution Channel', 'Timestamp'],
        accent: '#10b981',
      },
      {
        title: 'EMPLOYEE ACTIVITY',
        subtitle: 'Who acted?',
        items: ['Employee Identifier', 'Assigned Role', 'Permissions Exercised', 'Access Vector', 'Device & Branch'],
        accent: '#8b5cf6',
      },
      {
        title: 'CONTEXT',
        subtitle: 'What happened around it?',
        items: ['Account Limit Changes', 'Customer Profile / KYC', 'Historical Activity', 'Related Counterparties', 'Multi-Hop Flow'],
        accent: '#0ea5e9',
      },
    ],
    conclusion:
      'InsiderTrace brings these signals together so investigators can Explore Entity Links instead of reviewing isolated events.',
    nodes: [
      { label: 'Access & Identity', desc: 'Who held privileged access?' },
      { label: 'Account Topology', desc: 'Which accounts were altered?' },
      { label: 'Transaction Flows', desc: 'Where did the funds travel?' },
      { label: 'Evidence Dossier', desc: 'How is the chain verified?' },
    ],
  },
  howItWorks: {
    eyebrow: 'HOW INSIDERTRACE WORKS',
    headline: 'From raw events to evidence-backed investigation.',
    steps: [
      {
        num: '01',
        title: 'INGEST',
        mainText: 'Bring together the operational and financial events needed for investigation.',
        items: [
          'Employee activity',
          'Access logs',
          'Account changes',
          'Transactions',
          'Customer profiles',
          'Devices',
        ],
        concludingLine: 'One investigation starts with many sources.',
      },
      {
        num: '02',
        title: 'DETECT',
        mainText: 'Identify suspicious signals before they disappear inside isolated records.',
        items: [
          'Circular transfers',
          'Transaction splitting',
          'Rapid pass-through',
          'Profile mismatch',
          'Privilege abuse',
          'Off-hours activity',
          'Out-of-role access',
          'Bulk account lookup',
          'Action → transaction linkage',
        ],
        concludingLine: 'Individual signals become investigation candidates.',
      },
      {
        num: '03',
        title: 'CORRELATE',
        mainText: 'Connect people, accounts, actions and transactions across time.',
        items: [
          'Employee',
          'Account',
          'Customer',
          'Transaction',
          'Device',
          'Branch',
          'Counterparty',
        ],
        concludingLine: 'The relationship between events can matter more than any single event.',
      },
      {
        num: '04',
        title: 'EVALUATE',
        mainText: 'Assess connected anomalies across multiple dimensions of risk.',
        items: [
          'Insider Privilege',
          'Money Flow',
          'Profile / KYC',
          'Temporal Linkage',
          'Network Exposure',
        ],
        concludingLine: 'Risk is evaluated from connected evidence, not one isolated number.',
      },
      {
        num: '05',
        title: 'EXPLAIN',
        mainText: 'Show investigators exactly why an alert was generated.',
        items: [
          'Triggering events',
          'Detected signals',
          'Matched rules',
          'Connected entities',
          'Timeline',
          'Supporting evidence',
        ],
        concludingLine: 'Every alert should answer: What happened? Why was it flagged?',
      },
      {
        num: '06',
        title: 'INVESTIGATE',
        mainText: 'Follow the activity through the graph, timeline and surrounding context.',
        items: [
          'Money-flow graph',
          'Activity timeline',
          'Employee profile',
          'Account context',
          'Blast radius',
          'Related entities',
        ],
        concludingLine: 'Move from an alert to an investigation.',
      },
      {
        num: '07',
        title: 'EVIDENCE',
        mainText: 'Preserve the investigation trail and make the supporting evidence reviewable.',
        items: [
          'Alert explanation',
          'Timeline',
          'Graph context',
          'Source events',
          'Investigation notes',
          'Evidence export',
          'Integrity verification',
        ],
        concludingLine: 'Turn the investigation into a traceable evidence record.',
      },
    ],
  },
  detectors: {
    eyebrow: 'WHAT WE LOOK FOR',
    headline: 'Patterns become visible when events are connected.',
    items: [
      {
        id: '01',
        title: 'Circular Transfer',
        desc: 'Detect money moving through connected accounts and returning to the original network.',
        tag: 'Topology',
      },
      {
        id: '02',
        title: 'Transaction Splitting',
        desc: 'Identify repeated transfers that collectively form an unusual movement of funds.',
        tag: 'Structuring',
      },
      {
        id: '03',
        title: 'Rapid Pass-Through',
        desc: 'Surface funds that move quickly through intermediary accounts with minimal dwell time.',
        tag: 'Velocity',
      },
      {
        id: '04',
        title: 'Privilege Abuse',
        desc: 'Identify employee activity that exceeds normal role or permission patterns.',
        tag: 'Insider',
      },
      {
        id: '05',
        title: 'Action → Transaction',
        desc: 'Connect account access or modification events with transactions that immediately follow them.',
        tag: 'Linkage',
      },
      {
        id: '06',
        title: 'Profile Mismatch',
        desc: 'Compare transaction behaviour with known customer and account characteristics.',
        tag: 'Profile / KYC',
      },
      {
        id: '07',
        title: 'Off-Hours Activity',
        desc: 'Identify administrative access and overrides outside expected operational windows.',
        tag: 'Temporal',
      },
      {
        id: '08',
        title: 'Bulk Account Lookup',
        desc: 'Surface unusual employee access across multiple unrelated customer accounts.',
        tag: 'Surveillance',
      },
      {
        id: '09',
        title: 'Network Exposure',
        desc: 'Identify connected accounts, employees, devices and counterparties surrounding a suspicious event.',
        tag: 'Exposure',
      },
    ],
  },
  explainable: {
    eyebrow: 'EXPLAINABLE ALERTS',
    headline: 'Never just show the score. Show the evidence.',
    supporting:
      'Every alert answers three questions: What happened? Why was it flagged? What evidence supports it?',
    sampleAlert: {
      id: '#AL-10291',
      tier: 'CRITICAL',
      summary: 'Connected anomaly detected across employee privileges and split downstream transfers.',
      timeline: [
        { time: '10:42', event: 'EMP-017 accessed ACC-0231 via internal portal' },
        { time: '10:43', event: 'Transfer limit changed ₹50K → ₹5L with manager override' },
        { time: '10:46', event: '₹4.8L transferred ACC-0231 → ACC-0912' },
        { time: '10:49', event: 'Funds moved onward to ACC-1044 within 3 minutes' },
      ],
      signals: [
        'Privilege change override',
        'Action-to-transaction linkage',
        'Rapid pass-through flow',
        'Circular flow relationship',
        'Employee-account relationship',
      ],
      dimensions: [
        { name: 'Insider Privilege', level: 'HIGH' },
        { name: 'Money Flow', level: 'HIGH' },
        { name: 'Temporal Linkage', level: 'HIGH' },
        { name: 'Profile Mismatch', level: 'MEDIUM' },
        { name: 'Network Exposure', level: 'HIGH' },
      ],
      decision: 'CRITICAL',
      reason:
        'Multiple correlated signals were detected across employee activity, account changes and connected transactions.',
    },
  },
  dataInputs: {
    eyebrow: 'DATA INGESTION ARCHITECTURE',
    headline: 'What does InsiderTrace actually use?',
    subline: 'Integrates institutional transaction, access and operational data feeds without intercepting payment execution.',
    inputs: [
      {
        icon: UserCheck,
        title: 'EMPLOYEE DATA',
        fields: ['Role & Department', 'Branch Location', 'Assigned Permissions', 'Employment Status'],
      },
      {
        icon: Clock,
        title: 'ACCESS LOGS',
        fields: ['Employee Identifier', 'Target Account', 'Action Taken', 'Timestamp & Vector'],
      },
      {
        icon: Layers,
        title: 'ACCOUNT CHANGES',
        fields: ['Limit Alterations', 'KYC Updates', 'Contact Modifications', 'Acting User & Time'],
      },
      {
        icon: CreditCard,
        title: 'TRANSACTIONS',
        fields: ['Transfer Amount', 'Source Entity', 'Destination Entity', 'Channel & Method'],
      },
      {
        icon: FileText,
        title: 'CUSTOMER PROFILE',
        fields: ['Declared Income', 'Occupation Type', 'Normal Corridor', 'Account Tenure'],
      },
      {
        icon: Smartphone,
        title: 'DEVICE ACTIVITY',
        fields: ['Device Fingerprint', 'Associated Employee', 'Known Location', 'Session Context'],
      },
    ],
    centralNote: 'These inputs are correlated — not evaluated in isolation.',
  },
  caseManagement: {
    eyebrow: 'OPERATIONAL ADJUDICATION',
    headline: 'From alert to structured investigation.',
    description:
      'Move a suspicious alert into a structured case, assign it to a reviewer, add investigation notes and preserve the evidence trail.',
    stages: ['ALERT', 'REVIEW', 'ASSIGN', 'INVESTIGATE', 'ESCALATE', 'CLOSE'],
    statuses: ['OPEN', 'IN REVIEW', 'ESCALATED', 'CLOSED — CONFIRMED', 'CLOSED — FALSE POSITIVE'],
    evidenceDossier: [
      'Access Log Manifest',
      'Account Modification Event',
      'Transaction Ledger Records',
      'Device Session Context',
      '5-Dimension Risk Explanation',
      'Chronological Timeline',
      'Cytoscape Graph Context',
    ],
    integrity: 'SHA-256 Integrity Verified · Tamper-Evident Dossier',
  },
  finalCta: {
    headline: 'Investigate the connection.',
    copy: 'Connect employee activity, account changes and transaction networks into one evidence-first investigation workflow.',
    primaryButton: 'Open Investigation',
    primaryLink: '/dashboard/fraud',
    secondaryButton: 'Explore Detection',
    secondaryLink: '/alerts',
  },
  footer: {
    brandName: 'InsiderTrace',
    tagline: 'Evidence-first financial crime and insider-risk investigation.',
    navColumns: [
      {
        title: 'Platform',
        links: [
          { label: 'Fraud Desk', path: '/dashboard/fraud' },
          { label: 'Audit Desk', path: '/dashboard/audit' },
          { label: 'Compliance Desk', path: '/dashboard/compliance' },
          { label: 'Live Alerts', path: '/alerts' },
        ],
      },
      {
        title: 'Investigation',
        links: [
          { label: 'Fraud Analyst Dashboard', path: '/dashboard/fraud' },
          { label: 'Evidence Ledger', path: '/evidence' },
          { label: 'Red-Team Simulator', path: '/simulation' },
          { label: 'Evaluation Benchmarks', path: '/evaluation' },
        ],
      },
      {
        title: 'Governance',
        links: [
          { label: 'SHA-256 Audit Verification', path: '/evidence' },
          { label: 'Deterministic Rule Engine', path: '/alerts' },
          { label: 'Employee Surveillance', path: '/employees' },
          { label: 'Mule & Account Ledger', path: '/accounts' },
        ],
      },
    ],
    copyright: '© 2026 INSIDERTRACE. ALL RIGHTS RESERVED.',
    systemStatus: 'EVIDENCE INTEGRITY ENGINE · DETERMINISTIC AUDIT v2.4',
  },
};

/* ─── Smooth Parallax Hook with requestAnimationFrame ────────────── */
function useScrollY() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return scrollY;
}

/* ─── Scroll-Reveal Hook for Section Animations ──────────────────── */
function useScrollReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ─── Custom Icons ───────────────────────────────────────────────── */
function PurpleStaircaseIcon() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 9px)',
        gridTemplateRows: 'repeat(3, 9px)',
        gap: 3,
        width: 33,
        height: 33,
      }}
    >
      <div style={{ gridColumn: 1, gridRow: 3, background: '#10b981', borderRadius: 2 }} />
      <div style={{ gridColumn: 2, gridRow: 2, background: '#34d399', borderRadius: 2 }} />
      <div style={{ gridColumn: 3, gridRow: 1, background: '#6ee7b7', borderRadius: 2 }} />
    </div>
  );
}

function StarburstIcon({ size = 20, color = '#ffffff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="2.5" fill={color} />
      <path d="M12 2V6M12 18V22M2 12H6M18 12H22" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function DottedRingIcon({ size = 22, color = '#ffffff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" fill={color} />
      <circle cx="12" cy="12" r="7" stroke={color} strokeWidth="1.6" strokeDasharray="2 3" />
      <circle cx="12" cy="12" r="10.5" stroke={color} strokeWidth="1.2" strokeDasharray="3 4" opacity="0.8" />
    </svg>
  );
}

function ConcentricIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="4" fill="#0E1F16" />
      <circle cx="16" cy="16" r="8" stroke="#0E1F16" strokeWidth="1.8" />
      <circle cx="16" cy="16" r="12" stroke="#0E1F16" strokeWidth="1.4" opacity="0.6" />
      <circle cx="16" cy="16" r="15" stroke="#0E1F16" strokeWidth="1" opacity="0.3" />
    </svg>
  );
}

function HalftoneGridIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="10" cy="10" r="2.2" fill="#0E1F16" />
      <circle cx="16" cy="10" r="2.2" fill="#0E1F16" />
      <circle cx="22" cy="10" r="2.2" fill="#0E1F16" />
      <circle cx="10" cy="16" r="2.6" fill="#0E1F16" />
      <circle cx="16" cy="16" r="3" fill="#0E1F16" />
      <circle cx="22" cy="16" r="2.6" fill="#0E1F16" />
      <circle cx="10" cy="22" r="2.2" fill="#0E1F16" />
      <circle cx="16" cy="22" r="2.2" fill="#0E1F16" />
      <circle cx="22" cy="22" r="2.2" fill="#0E1F16" />
    </svg>
  );
}

function HourglassPolygonIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M9 8H23L16 16L23 24H9L16 16L9 8Z" fill="#0E1F16" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MAIN LANDING PAGE COMPONENT
───────────────────────────────────────────────────────────────── */
export const LandingPage: React.FC = () => {
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffect = useRef<{ destroy: () => void } | null>(null);
  const scrollY = useScrollY();
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'FRAUD' | 'AUDIT' | 'COMPLIANCE'>('FRAUD');
  const [activeWorkflowStage, setActiveWorkflowStage] = useState(0);
  const [isWorkflowPaused, setIsWorkflowPaused] = useState(false);

  const secProblem = useScrollReveal();
  const secHowItWorks = useScrollReveal();
  const secDetectors = useScrollReveal();
  const secExplainable = useScrollReveal();
  const secDataInputs = useScrollReveal();
  const secCaseManagement = useScrollReveal();
  const secWorkspaces = useScrollReveal();

  /* ─── 5-Second Hidden Auto-Advance Timer for How It Works Section ─── */
  useEffect(() => {
    if (!secHowItWorks.visible || isWorkflowPaused) return;

    const timer = setTimeout(() => {
      setActiveWorkflowStage((prev) => (prev + 1) % landingContent.howItWorks.steps.length);
    }, 5000);

    return () => clearTimeout(timer);
  }, [activeWorkflowStage, secHowItWorks.visible, isWorkflowPaused]);

  /* ─── Vanta WAVES Initialization with color: 0x62005 ────────────── */
  useEffect(() => {
    let checkInterval: ReturnType<typeof setInterval> | null = null;

    const initVanta = () => {
      if (vantaEffect.current) return;
      if (vantaRef.current && window.VANTA && typeof window.VANTA.WAVES === 'function') {
        try {
          vantaEffect.current = window.VANTA.WAVES({
            el: vantaRef.current,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.0,
            minWidth: 200.0,
            scale: 1.0,
            scaleMobile: 1.0,
            color: 0x62005, // deep forest olive-green tone
            shininess: 42.0,
            waveHeight: 19.0,
            waveSpeed: 0.72,
            zoom: 0.76,
          });
        } catch (err) {
          console.warn('Vanta initialization notice:', err);
        }
      }
    };

    initVanta();

    if (!vantaEffect.current) {
      checkInterval = setInterval(() => {
        if (window.VANTA && typeof window.VANTA.WAVES === 'function') {
          initVanta();
          if (checkInterval) clearInterval(checkInterval);
        }
      }, 100);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      if (vantaEffect.current) {
        try {
          vantaEffect.current.destroy();
        } catch {
          // ignore cleanup errors
        }
        vantaEffect.current = null;
      }
    };
  }, []);

  const navScrolled = scrollY > 40;

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        color: '#0e1f16',
        overflowX: 'hidden',
        fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* ─── SECTION 1: HERO VIEWPORT (100vh with Vanta WAVES) ────── */}
      <section
        id="platform"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '100%',
          height: '100vh',
          minHeight: 740,
          overflow: 'hidden',
          contain: 'paint',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* Vanta Canvas Background with Parallax - Constrained strictly to 100% width */}
        <div
          ref={vantaRef}
          style={{
            position: 'absolute',
            top: -60,
            bottom: -60,
            left: 0,
            right: 0,
            width: '100%',
            maxWidth: '100%',
            transform: `translateY(${scrollY * 0.16}px)`,
            transition: 'transform 0.05s ease-out',
            zIndex: 0,
          }}
        />

        {/* Vertical striated moire texture overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.035) 0px, rgba(255, 255, 255, 0.035) 1.5px, transparent 1.5px, transparent 18px)',
            pointerEvents: 'none',
            zIndex: 1,
            opacity: 0.85,
          }}
        />

        {/* Subtle top vignette for nav legibility - NO white bottom blur */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to bottom, rgba(5, 18, 9, 0.42) 0%, transparent 24%)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        {/* ─── TOP NAVIGATION BAR ─────────────────────────────────── */}
        <nav
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            height: 72,
            maxWidth: '100vw',
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 clamp(16px, 4vw, 56px)',
            background: navScrolled ? 'rgba(7, 24, 13, 0.88)' : 'transparent',
            backdropFilter: navScrolled ? 'blur(20px)' : 'none',
            WebkitBackdropFilter: navScrolled ? 'blur(20px)' : 'none',
            borderBottom: navScrolled
              ? '1px solid rgba(255, 255, 255, 0.08)'
              : '1px solid transparent',
            transition: 'background 0.3s ease, border-color 0.3s ease',
          }}
        >
          {/* Left: Brand Mark & Wordmark */}
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              textDecoration: 'none',
              color: '#ffffff',
            }}
          >
            <InsiderTraceLogo size={28} />
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                  color: '#ffffff',
                }}
              >
                INSIDER<span style={{ color: '#34d399' }}>TRACE</span>
              </span>
            </div>
          </Link>

          {/* Center: Navigation Links */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 32,
            }}
            className="hidden md:flex"
          >
            {[
              { label: 'Platform', id: 'platform' },
              { label: 'How It Works', id: 'how-it-works' },
              { label: 'Investigations', id: 'investigations' },
              { label: 'Detection', id: 'detection' },
              { label: 'Evidence', id: 'evidence' },
            ].map((item) => (
              <a
                key={item.label}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToId(item.id);
                }}
                style={{
                  color: 'rgba(255, 255, 255, 0.75)',
                  fontSize: 14,
                  fontWeight: 500,
                  textDecoration: 'none',
                  letterSpacing: '-0.01em',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#ffffff')}
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = 'rgba(255, 255, 255, 0.75)')
                }
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Right: Status Indicator Pill + Open Investigation Button */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              borderRadius: 999,
              padding: '4px 5px 4px 14px',
              gap: 12,
              boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#34d399',
                  boxShadow: '0 0 8px #34d399',
                }}
              />
              <div className="hidden sm:flex" style={{ flexDirection: 'column' }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#ffffff',
                    lineHeight: 1.1,
                    letterSpacing: '-0.01em',
                  }}
                >
                  LIVE MONITORING
                </span>
                <span
                  style={{
                    fontSize: 9,
                    color: 'rgba(255, 255, 255, 0.65)',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                >
                  Evidence-first
                </span>
              </div>
            </div>

            <Link
              to="/dashboard/fraud"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px 18px',
                borderRadius: 999,
                background: '#0a140d',
                color: '#ffffff',
                fontSize: 12,
                fontWeight: 600,
                textDecoration: 'none',
                letterSpacing: '-0.01em',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.35)',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = '#152b1b';
                el.style.transform = 'scale(1.03)';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = '#0a140d';
                el.style.transform = '';
              }}
            >
              Open Investigation
            </Link>
          </div>
        </nav>

        {/* ─── HERO CONTENT AREA WITH PARALLAX ─────────────────────── */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '100px clamp(24px, 5vw, 68px) 52px',
          }}
        >
          {/* Bottom-left: Monumental Headline */}
          <div
            style={{
              maxWidth: 780,
              transform: `translateY(${scrollY * -0.12}px)`,
              transition: 'transform 0.05s ease-out',
            }}
          >
            {/* Micro-label: [ INSIDERTRACE / FINANCIAL CRIME INTELLIGENCE ] */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 16,
                fontSize: 11,
                fontFamily: "'JetBrains Mono', 'Plus Jakarta Sans', monospace",
                fontWeight: 600,
                letterSpacing: '0.12em',
                color: 'rgba(255, 255, 255, 0.78)',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#10b981',
                  boxShadow: '0 0 8px #10b981',
                }}
              />
              {landingContent.metadata.eyebrow}
            </div>

            <h1
              style={{
                margin: '0 0 28px',
                fontSize: 'clamp(44px, 8.5vw, 114px)',
                fontWeight: 700,
                lineHeight: 0.94,
                letterSpacing: '-0.045em',
                color: '#ffffff',
                fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
              }}
            >
              {landingContent.hero.headlineLine1}
              <br />
              {landingContent.hero.headlineLine2}
              {landingContent.hero.headlineCopyright ? (
                <span
                  style={{
                    fontSize: '0.36em',
                    verticalAlign: 'super',
                    fontWeight: 400,
                    marginLeft: 4,
                    opacity: 0.85,
                    color: '#34d399',
                  }}
                >
                  {landingContent.hero.headlineCopyright}
                </span>
              ) : null}
            </h1>

            {/* Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <Link
                to={landingContent.hero.primaryCtaLink}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '11px 24px',
                  borderRadius: 999,
                  background: '#ffffff',
                  color: '#062005',
                  fontSize: 13,
                  fontWeight: 700,
                  textDecoration: 'none',
                  letterSpacing: '-0.01em',
                  boxShadow: '0 4px 20px rgba(255, 255, 255, 0.2)',
                  transition: 'transform 0.15s ease',
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.transform = '')}
              >
                <span>{landingContent.hero.primaryCta}</span>
                <ArrowRight size={14} color="#062005" />
              </Link>

              <button
                type="button"
                onClick={() => scrollToId(landingContent.hero.secondaryCtaTarget)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '11px 20px',
                  borderRadius: 999,
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: 13,
                  fontWeight: 600,
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  cursor: 'pointer',
                  letterSpacing: '-0.01em',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(255, 255, 255, 0.14)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(255, 255, 255, 0.08)')}
              >
                <span>{landingContent.hero.secondaryCta}</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Top-Right & Right Column: Floating Investigation Card + Capabilities */}
          <div
            style={{
              position: 'absolute',
              top: '18%',
              right: 'clamp(24px, 5vw, 72px)',
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
              width: 280,
              maxWidth: 'calc(100vw - 48px)',
              transform: `translateY(${scrollY * 0.1}px)`,
              transition: 'transform 0.05s ease-out',
            }}
          >
            {/* The Signature Floating Investigation Card */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: 20,
                padding: '22px 22px',
                boxShadow: '0 24px 60px rgba(0, 0, 0, 0.32), 0 4px 16px rgba(0, 0, 0, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.95)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              {/* Top row: Stepped indicator + Alert ID */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <PurpleStaircaseIcon />
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    color: '#64748b',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                >
                  {landingContent.hero.sideCard.alertId}
                </span>
              </div>

              {/* Card Body */}
              <div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '2px 8px',
                    borderRadius: 4,
                    background: 'rgba(220, 38, 38, 0.1)',
                    color: '#dc2626',
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    marginBottom: 6,
                  }}
                >
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#dc2626' }} />
                  {landingContent.hero.sideCard.riskTier}
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: '#0e1f16',
                    lineHeight: 1.2,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {landingContent.hero.sideCard.title}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    fontFamily: 'JetBrains Mono, monospace',
                    color: '#047857',
                    marginTop: 4,
                    fontWeight: 600,
                  }}
                >
                  {landingContent.hero.sideCard.entityPath}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: '#64748b',
                    marginTop: 6,
                    lineHeight: 1.45,
                  }}
                >
                  {landingContent.hero.sideCard.eventSummary}
                </div>
              </div>

              {/* Card Footer Integrity Tag */}
              <div
                style={{
                  borderTop: '1px solid #f1f5f2',
                  paddingTop: 8,
                  fontSize: 10,
                  color: '#059669',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <CheckCircle2 size={12} color="#059669" />
                <span>{landingContent.hero.sideCard.integritySeal}</span>
              </div>
            </div>

            {/* Right Capabilities Stack */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingLeft: 4 }}>
              {landingContent.hero.capabilities.map((cap) => (
                <div key={cap.number} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: 'JetBrains Mono, monospace',
                      color: '#34d399',
                      fontWeight: 700,
                      marginTop: 2,
                    }}
                  >
                    {cap.number}
                  </span>
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: '#ffffff',
                        lineHeight: 1.2,
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {cap.title}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: 'rgba(255, 255, 255, 0.7)',
                        marginTop: 2,
                        lineHeight: 1.45,
                      }}
                    >
                      {cap.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── SCROLL TO EXPLORE INDICATOR ──────────────────────────── */}
        <button
          type="button"
          onClick={() => {
            const nextSec = document.getElementById('problem') || document.getElementById('how-it-works');
            if (nextSec) {
              nextSec.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          aria-label="Scroll to explore more"
          style={{
            position: 'absolute',
            bottom: 'clamp(14px, 2.5vh, 24px)',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 12,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            padding: '6px 14px',
            color: 'rgba(255, 255, 255, 0.55)',
            transition: 'color 0.2s ease, opacity 0.2s ease',
            textDecoration: 'none',
            outline: 'none',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = '#34d399';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = 'rgba(255, 255, 255, 0.55)';
          }}
          onFocus={(e) => {
            (e.currentTarget as HTMLElement).style.color = '#34d399';
          }}
          onBlur={(e) => {
            (e.currentTarget as HTMLElement).style.color = 'rgba(255, 255, 255, 0.55)';
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontFamily: "'JetBrains Mono', 'Plus Jakarta Sans', monospace",
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              lineHeight: 1,
            }}
          >
            SCROLL TO EXPLORE
          </span>
          <ChevronDown
            size={13}
            strokeWidth={1.8}
            className="hero-scroll-indicator-arrow"
          />
        </button>

        {/* Crisp horizontal separation line / breakpoint between hero and downward section */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 1,
            background: 'rgba(255, 255, 255, 0.18)',
            boxShadow: '0 1px 0 rgba(0, 0, 0, 0.08)',
            zIndex: 10,
          }}
        />
      </section>

      {/* ─── SECTION 2: THE PROBLEM ("SUSPICIOUS ACTIVITY RARELY APPEARS IN ONE PLACE") ────── */}
      <section
        id="problem"
        style={{
          background: '#ffffff',
          padding: '96px clamp(24px, 5vw, 68px)',
          textAlign: 'center',
          borderTop: '1px solid #e2e8e0',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div
          ref={secProblem.ref}
          style={{
            maxWidth: 1080,
            margin: '0 auto',
            opacity: secProblem.visible ? 1 : 0,
            transform: secProblem.visible ? 'none' : 'translateY(36px)',
            transition: 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Eyebrow badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 16px',
              borderRadius: 999,
              background: '#f1f5f2',
              border: '1px solid #dce4de',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#153e28',
              marginBottom: 24,
            }}
          >
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#22c55e',
                boxShadow: '0 0 8px #22c55e',
              }}
            />
            {landingContent.problem.eyebrow}
          </div>

          {/* Heading */}
          <h2
            style={{
              margin: '0 auto 20px',
              fontSize: 'clamp(30px, 4.2vw, 50px)',
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              color: '#0e1f16',
              maxWidth: 760,
              textWrap: 'balance',
            }}
          >
            {landingContent.problem.headline}
          </h2>

          <p
            style={{
              fontSize: 16,
              lineHeight: 1.65,
              color: '#475569',
              maxWidth: 680,
              margin: '0 auto 56px',
            }}
          >
            {landingContent.problem.body}
          </p>

          {/* 3 Columns: Transaction, Employee Activity, Context */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 24,
              textAlign: 'left',
              marginBottom: 56,
            }}
          >
            {landingContent.problem.columns.map((col) => (
              <div
                key={col.title}
                style={{
                  background: '#f8faf7',
                  border: '1px solid #e2e8df',
                  borderRadius: 18,
                  padding: '28px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      color: col.accent,
                      textTransform: 'uppercase',
                      marginBottom: 4,
                    }}
                  >
                    {col.title}
                  </div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: '#0e1f16',
                      marginBottom: 18,
                      letterSpacing: '-0.015em',
                    }}
                  >
                    {col.subtitle}
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {col.items.map((it) => (
                      <li key={it} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#334155' }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: col.accent }} />
                        {it}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Concluding Central Statement */}
          <div
            style={{
              background: '#0e1f16',
              color: '#ffffff',
              borderRadius: 16,
              padding: '28px 32px',
              maxWidth: 820,
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 20,
              textAlign: 'left',
            }}
          >
            <div style={{ flex: 1, minWidth: 260 }}>
              <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.5, color: '#e2f0e6' }}>
                {landingContent.problem.conclusion}
              </div>
            </div>
            <Link
              to="/case-graph"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 20px',
                borderRadius: 999,
                background: '#34d399',
                color: '#062005',
                fontSize: 13,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              <span>Explore Entity Links</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── SECTION 3: HOW IT WORKS (FULL-SCREEN INTERACTIVE PRODUCT STORY) ── */}
      <section
        id="how-it-works"
        style={{
          background: '#080c09',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 'clamp(54px, 7vh, 84px) clamp(20px, 4vw, 56px)',
          color: '#ffffff',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          position: 'relative',
          zIndex: 2,
          boxSizing: 'border-box',
        }}
        onMouseEnter={() => setIsWorkflowPaused(true)}
        onMouseLeave={() => setIsWorkflowPaused(false)}
      >
        <div
          ref={secHowItWorks.ref}
          style={{
            maxWidth: 1240,
            width: '100%',
            margin: '0 auto',
            opacity: secHowItWorks.visible ? 1 : 0,
            transform: secHowItWorks.visible ? 'none' : 'translateY(24px)',
            transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Section Header */}
          <div style={{ textAlign: 'center', marginBottom: 'clamp(24px, 3.5vh, 36px)' }}>
            <span
              style={{
                display: 'inline-block',
                fontSize: 11,
                fontFamily: "'JetBrains Mono', monospace",
                color: '#34d399',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: 8,
              }}
            >
              {landingContent.howItWorks.eyebrow}
            </span>
            <h2
              style={{
                margin: '0 auto',
                maxWidth: 780,
                fontSize: 'clamp(26px, 3.4vw, 42px)',
                fontWeight: 700,
                lineHeight: 1.2,
                letterSpacing: '-0.03em',
                color: '#ffffff',
                textWrap: 'balance',
              }}
            >
              {landingContent.howItWorks.headline}
            </h2>
          </div>

          {/* Interactive 7-Stage Pipeline Navigation */}
          <div
            style={{
              width: '100%',
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              padding: '6px 0 10px',
            }}
            role="tablist"
            aria-label="How InsiderTrace Works Workflow Stages"
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                minWidth: 860,
                padding: '0 8px',
              }}
            >
              {landingContent.howItWorks.steps.map((st, idx) => {
                const isActive = activeWorkflowStage === idx;
                return (
                  <React.Fragment key={st.num}>
                    {/* Interactive Stage Tab Button */}
                    <button
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      id={`workflow-stage-${st.num}`}
                      onClick={() => setActiveWorkflowStage(idx)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        flexShrink: 0,
                        padding: '6px 10px 10px',
                        borderRadius: 8,
                        outline: 'none',
                        position: 'relative',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          fontFamily: "'JetBrains Mono', monospace",
                          fontWeight: 700,
                          color: isActive ? '#34d399' : 'rgba(52, 211, 153, 0.45)',
                          letterSpacing: '0.08em',
                          marginBottom: 6,
                          transition: 'color 0.2s ease',
                        }}
                      >
                        {st.num}
                      </span>
                      <span
                        style={{
                          fontSize: 'clamp(14px, 1.25vw, 17px)',
                          fontWeight: isActive ? 800 : 600,
                          color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.65)',
                          letterSpacing: '0.04em',
                          fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
                          whiteSpace: 'nowrap',
                          transition: 'color 0.2s ease',
                        }}
                      >
                        {st.title}
                      </span>

                      {/* Active Stage Indicator Line / Glow */}
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: '12%',
                          right: '12%',
                          height: 2.5,
                          borderRadius: 2,
                          background: isActive ? '#34d399' : 'transparent',
                          boxShadow: isActive ? '0 0 10px rgba(52, 211, 153, 0.85)' : 'none',
                          transition: 'all 0.25s ease',
                        }}
                      />
                    </button>

                    {/* Subtle Pipeline Arrow / Connector */}
                    {idx < landingContent.howItWorks.steps.length - 1 && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          flex: 1,
                          minWidth: 20,
                          padding: '0 6px',
                          opacity: 0.85,
                          userSelect: 'none',
                        }}
                      >
                        <div
                          style={{
                            height: 1.5,
                            flex: 1,
                            background:
                              idx < activeWorkflowStage
                                ? 'rgba(52, 211, 153, 0.75)'
                                : 'rgba(255, 255, 255, 0.16)',
                            transition: 'background 0.3s ease',
                          }}
                        />
                        <svg
                          width="8"
                          height="10"
                          viewBox="0 0 8 10"
                          fill="none"
                          style={{ flexShrink: 0, marginLeft: 1 }}
                        >
                          <path
                            d="M1.5 1.5L6 5L1.5 8.5"
                            stroke={idx < activeWorkflowStage ? '#34d399' : 'rgba(255, 255, 255, 0.28)'}
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ transition: 'stroke 0.3s ease' }}
                          />
                        </svg>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Thin Horizontal Progress Indicator */}
          <div
            style={{
              maxWidth: 1200,
              margin: '8px auto clamp(24px, 3.5vh, 36px)',
              height: 2,
              background: 'rgba(255, 255, 255, 0.08)',
              position: 'relative',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${((activeWorkflowStage + 1) / landingContent.howItWorks.steps.length) * 100}%`,
                background: 'linear-gradient(90deg, #10b981, #34d399)',
                boxShadow: '0 0 10px rgba(52, 211, 153, 0.7)',
                transition: 'width 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          </div>

          {/* Selected Stage Explanation Information Display Area */}
          {(() => {
            const currentStep = landingContent.howItWorks.steps[activeWorkflowStage];
            return (
              <div
                key={activeWorkflowStage}
                className="workflow-stage-detail"
                style={{
                  maxWidth: 1080,
                  margin: '0 auto',
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 20,
                  padding: 'clamp(24px, 3.5vh, 36px) clamp(24px, 4vw, 44px)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: 'clamp(20px, 4vw, 48px)',
                  alignItems: 'start',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                }}
              >
                {/* Left Column: Step Counter + Stage Title */}
                <div>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 11,
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 700,
                      color: '#34d399',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: '#10b981',
                        boxShadow: '0 0 8px #10b981',
                      }}
                    />
                    <span>0{activeWorkflowStage + 1} / 07</span>
                  </div>
                  <h3
                    style={{
                      margin: '0 0 8px',
                      fontSize: 'clamp(32px, 3.4vw, 44px)',
                      fontWeight: 800,
                      letterSpacing: '-0.025em',
                      color: '#ffffff',
                      lineHeight: 1.05,
                      fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
                    }}
                  >
                    {currentStep.title}
                  </h3>
                  <div
                    style={{
                      fontSize: 12,
                      fontFamily: "'JetBrains Mono', monospace",
                      color: 'rgba(255, 255, 255, 0.45)',
                      letterSpacing: '0.04em',
                    }}
                  >
                    STAGE 0{activeWorkflowStage + 1} OF 07
                  </div>
                </div>

                {/* Right Column: Main Explanation + Entity/Signal Chips + Concluding Line */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 'clamp(15px, 1.4vw, 17px)',
                      color: 'rgba(230, 245, 236, 0.94)',
                      lineHeight: 1.62,
                      fontWeight: 400,
                    }}
                  >
                    {currentStep.mainText}
                  </p>

                  {/* Supporting Chips / Tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {currentStep.items.map((item) => (
                      <span
                        key={item}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          fontSize: 12,
                          fontFamily: "'JetBrains Mono', 'Plus Jakarta Sans', monospace",
                          fontWeight: 500,
                          color: '#e2f4ea',
                          background: 'rgba(52, 211, 153, 0.08)',
                          border: '1px solid rgba(52, 211, 153, 0.22)',
                          borderRadius: 6,
                          padding: '4px 11px',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>

                  {/* Concluding Takeaway Line */}
                  <div
                    style={{
                      fontSize: 13,
                      fontStyle: 'italic',
                      color: '#34d399',
                      opacity: 0.88,
                      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                      paddingTop: 14,
                      lineHeight: 1.5,
                    }}
                  >
                    {currentStep.concludingLine}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* ─── SECTION 4: DETECTION ENGINES (WHAT WE LOOK FOR) ─────── */}
      <section
        id="detection"
        style={{
          background: '#ffffff',
          padding: '96px clamp(24px, 5vw, 68px) 100px',
          borderBottom: '1px solid #e5ebe2',
        }}
      >
        <div
          ref={secDetectors.ref}
          style={{
            maxWidth: 1120,
            margin: '0 auto',
            opacity: secDetectors.visible ? 1 : 0,
            transform: secDetectors.visible ? 'none' : 'translateY(36px)',
            transition: 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <span
              style={{
                fontSize: 11,
                fontFamily: 'JetBrains Mono, monospace',
                color: '#059669',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              {landingContent.detectors.eyebrow}
            </span>
            <h2
              style={{
                margin: '12px auto 0',
                fontSize: 'clamp(28px, 4vw, 46px)',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                color: '#0e1f16',
                maxWidth: 680,
                textWrap: 'balance',
              }}
            >
              {landingContent.detectors.headline}
            </h2>
          </div>

          {/* 9 Detector Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
              gap: 22,
            }}
          >
            {landingContent.detectors.items.map((det) => (
              <div
                key={det.id}
                style={{
                  background: '#f8faf7',
                  border: '1px solid #e2e8df',
                  borderRadius: 16,
                  padding: '26px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = 'translateY(-3px)';
                  el.style.boxShadow = '0 12px 32px rgba(0,0,0,0.06)';
                  el.style.borderColor = '#cbd5e1';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = '';
                  el.style.boxShadow = '';
                  el.style.borderColor = '#e2e8df';
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 12,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontFamily: 'JetBrains Mono, monospace',
                        fontWeight: 700,
                        color: '#64748b',
                      }}
                    >
                      DETECTOR {det.id}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 4,
                        background: '#e2e8f0',
                        color: '#334155',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {det.tag}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 17,
                      fontWeight: 700,
                      color: '#0e1f16',
                      marginBottom: 8,
                      letterSpacing: '-0.015em',
                    }}
                  >
                    {det.title}
                  </div>
                  <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.55 }}>
                    {det.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 5: EXPLAINABLE ALERTS ("NEVER JUST SHOW THE SCORE") ─── */}
      <section
        id="explainability"
        style={{
          background: '#070b08',
          padding: '110px clamp(24px, 5vw, 68px)',
          color: '#ffffff',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div
          ref={secExplainable.ref}
          style={{
            maxWidth: 1120,
            margin: '0 auto',
            opacity: secExplainable.visible ? 1 : 0,
            transform: secExplainable.visible ? 'none' : 'translateY(36px)',
            transition: 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span
              style={{
                fontSize: 11,
                fontFamily: 'JetBrains Mono, monospace',
                color: '#34d399',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              {landingContent.explainable.eyebrow}
            </span>
            <h2
              style={{
                margin: '12px auto 14px',
                fontSize: 'clamp(28px, 4vw, 46px)',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                color: '#ffffff',
                maxWidth: 680,
                textWrap: 'balance',
              }}
            >
              {landingContent.explainable.headline}
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(230, 245, 236, 0.7)', maxWidth: 560, margin: '0 auto' }}>
              {landingContent.explainable.supporting}
            </p>
          </div>

          {/* Interactive Explainable Alert Card */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.035)',
              borderRadius: 20,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '36px 32px',
              maxWidth: 920,
              margin: '0 auto',
              boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
            }}
          >
            {/* Alert Header row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 16,
                paddingBottom: 22,
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      fontSize: 15,
                      fontWeight: 800,
                      fontFamily: 'JetBrains Mono, monospace',
                      color: '#ffffff',
                    }}
                  >
                    {landingContent.explainable.sampleAlert.id}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: 4,
                      background: 'rgba(239, 68, 68, 0.2)',
                      color: '#f87171',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      letterSpacing: '0.06em',
                    }}
                  >
                    ● {landingContent.explainable.sampleAlert.tier}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: 'rgba(230, 245, 236, 0.75)', marginTop: 4 }}>
                  {landingContent.explainable.sampleAlert.summary}
                </div>
              </div>

              <div
                style={{
                  fontSize: 11,
                  fontFamily: 'JetBrains Mono, monospace',
                  color: '#34d399',
                  background: 'rgba(16, 185, 129, 0.12)',
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                }}
              >
                DECISION: {landingContent.explainable.sampleAlert.decision}
              </div>
            </div>

            {/* 3-Way Breakdown: Timeline, Signals, Risk Dimensions */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 28,
                paddingTop: 24,
              }}
            >
              {/* Timeline */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#34d399', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 12 }}>
                  CHRONOLOGICAL SEQUENCE
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {landingContent.explainable.sampleAlert.timeline.map((item) => (
                    <div key={item.time} style={{ fontSize: 12, lineHeight: 1.45 }}>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#93c5fd', fontWeight: 600, marginRight: 8 }}>
                        {item.time}
                      </span>
                      <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{item.event}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Signals Matched */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#34d399', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 12 }}>
                  SIGNALS TRIGGERED
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {landingContent.explainable.sampleAlert.signals.map((sig) => (
                    <div key={sig} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'rgba(255, 255, 255, 0.85)' }}>
                      <CheckCircle2 size={13} color="#34d399" />
                      <span>{sig}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5 Risk Dimensions */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#34d399', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 12 }}>
                  5 RISK DIMENSIONS
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {landingContent.explainable.sampleAlert.dimensions.map((dim) => (
                    <div key={dim.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                      <span style={{ color: 'rgba(230, 245, 236, 0.75)' }}>{dim.name}</span>
                      <span
                        style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontWeight: 700,
                          fontSize: 10,
                          padding: '2px 6px',
                          borderRadius: 3,
                          background: dim.level === 'HIGH' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                          color: dim.level === 'HIGH' ? '#f87171' : '#fde047',
                        }}
                      >
                        {dim.level}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Decision explanation note */}
            <div
              style={{
                marginTop: 24,
                padding: '14px 18px',
                borderRadius: 10,
                background: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                fontSize: 12,
                color: 'rgba(230, 245, 236, 0.8)',
                lineHeight: 1.5,
              }}
            >
              <strong style={{ color: '#ffffff' }}>Explanation: </strong>
              {landingContent.explainable.sampleAlert.reason}
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 6: DATA INGESTION ARCHITECTURE ───────────────── */}
      <section
        id="data-inputs"
        style={{
          background: '#ffffff',
          padding: '110px clamp(24px, 5vw, 68px)',
          borderBottom: '1px solid #e5ebe2',
        }}
      >
        <div
          ref={secDataInputs.ref}
          style={{
            maxWidth: 1120,
            margin: '0 auto',
            opacity: secDataInputs.visible ? 1 : 0,
            transform: secDataInputs.visible ? 'none' : 'translateY(36px)',
            transition: 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span
              style={{
                fontSize: 11,
                fontFamily: 'JetBrains Mono, monospace',
                color: '#059669',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              {landingContent.dataInputs.eyebrow}
            </span>
            <h2
              style={{
                margin: '12px auto 14px',
                fontSize: 'clamp(28px, 4vw, 46px)',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                color: '#0e1f16',
                maxWidth: 680,
                textWrap: 'balance',
              }}
            >
              {landingContent.dataInputs.headline}
            </h2>
            <p style={{ fontSize: 14, color: '#64748b', maxWidth: 640, margin: '0 auto' }}>
              {landingContent.dataInputs.subline}
            </p>
          </div>

          {/* 6 Ingestion Data Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
              gap: 20,
              marginBottom: 44,
            }}
          >
            {landingContent.dataInputs.inputs.map((inp) => {
              const IconComponent = inp.icon;
              return (
                <div
                  key={inp.title}
                  style={{
                    background: '#f8faf7',
                    border: '1px solid #e2e8df',
                    borderRadius: 16,
                    padding: '24px 22px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: '#e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconComponent size={16} color="#0f172a" />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0e1f16' }}>{inp.title}</span>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {inp.fields.map((fld) => (
                      <li key={fld} style={{ fontSize: 12, color: '#475569', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#94a3b8' }} />
                        {fld}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Central Architecture Anchor Note */}
          <div
            style={{
              textAlign: 'center',
              fontSize: 14,
              fontWeight: 600,
              color: '#0e1f16',
              padding: '16px 24px',
              borderRadius: 999,
              background: '#f1f5f2',
              display: 'inline-block',
              margin: '0 auto',
            }}
          >
            {landingContent.dataInputs.centralNote}
          </div>
        </div>
      </section>

      {/* ─── SECTION 7: CASE MANAGEMENT & EVIDENCE DOSSIER ──────── */}
      <section
        id="evidence"
        style={{
          background: '#f8faf7',
          padding: '110px clamp(24px, 5vw, 68px)',
          borderBottom: '1px solid #e5ebe2',
        }}
      >
        <div
          ref={secCaseManagement.ref}
          style={{
            maxWidth: 1120,
            margin: '0 auto',
            opacity: secCaseManagement.visible ? 1 : 0,
            transform: secCaseManagement.visible ? 'none' : 'translateY(36px)',
            transition: 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span
              style={{
                fontSize: 11,
                fontFamily: 'JetBrains Mono, monospace',
                color: '#059669',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              {landingContent.caseManagement.eyebrow}
            </span>
            <h2
              style={{
                margin: '12px auto 14px',
                fontSize: 'clamp(28px, 4vw, 46px)',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                color: '#0e1f16',
                maxWidth: 680,
                textWrap: 'balance',
              }}
            >
              {landingContent.caseManagement.headline}
            </h2>
            <p style={{ fontSize: 15, color: '#475569', maxWidth: 620, margin: '0 auto' }}>
              {landingContent.caseManagement.description}
            </p>
          </div>

          {/* Workflow Stepper: ALERT → REVIEW → ASSIGN → INVESTIGATE → ESCALATE → CLOSE */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: 8,
              marginBottom: 48,
            }}
          >
            {landingContent.caseManagement.stages.map((stage, idx, arr) => (
              <React.Fragment key={stage}>
                <div
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    background: '#ffffff',
                    border: '1px solid #e2e8df',
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    color: '#0e1f16',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                >
                  {stage}
                </div>
                {idx < arr.length - 1 && (
                  <div style={{ color: '#94a3b8' }}>
                    <ChevronRight size={14} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Evidence Dossier Container */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: 20,
              padding: '32px 32px',
              border: '1px solid #e2e8df',
              maxWidth: 820,
              margin: '0 auto',
              boxShadow: '0 12px 36px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0e1f16' }}>
                Included in Evidence Export
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontFamily: 'JetBrains Mono, monospace',
                  color: '#059669',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Lock size={12} />
                {landingContent.caseManagement.integrity}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              {landingContent.caseManagement.evidenceDossier.map((dossierItem) => (
                <div
                  key={dossierItem}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: '#f8faf7',
                    border: '1px solid #eef2eb',
                    fontSize: 12,
                    fontWeight: 500,
                    color: '#334155',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <FileCheck2 size={14} color="#059669" />
                  <span>{dossierItem}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 8: INVESTIGATION WORKSPACES (PERSONAS) ──────── */}
      <section
        id="investigations"
        style={{
          background: '#ffffff',
          padding: '110px clamp(24px, 5vw, 68px)',
        }}
      >
        <div
          ref={secWorkspaces.ref}
          style={{
            maxWidth: 1120,
            margin: '0 auto',
            opacity: secWorkspaces.visible ? 1 : 0,
            transform: secWorkspaces.visible ? 'none' : 'translateY(36px)',
            transition: 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Header row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 24,
              marginBottom: 48,
            }}
          >
            <div>
              <span
                style={{
                  fontSize: 11,
                  fontFamily: 'JetBrains Mono, monospace',
                  color: '#64748b',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                ROLE-BASED WORKSPACES
              </span>
              <h2
                style={{
                  fontSize: 'clamp(28px, 4vw, 46px)',
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                  color: '#0e1f16',
                  lineHeight: 1.15,
                  margin: '8px 0 0',
                }}
              >
                Three distinct investigation desks.
                <br />
                One connected graph.
              </h2>
            </div>

            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: 8 }}>
              {(['FRAUD', 'AUDIT', 'COMPLIANCE'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveWorkspaceTab(tab)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    border: 'none',
                    background: activeWorkspaceTab === tab ? '#0e1f16' : '#f1f5f2',
                    color: activeWorkspaceTab === tab ? '#ffffff' : '#64748b',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tab === 'FRAUD' ? 'Fraud Desk' : tab === 'AUDIT' ? 'Audit Desk' : 'Compliance Desk'}
                </button>
              ))}
            </div>
          </div>

          {/* 3 Workspaces Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 24,
            }}
          >
            {[
              {
                role: 'Fraud Analyst Desk',
                question: 'What demands urgent operational triage?',
                path: '/dashboard/fraud',
                accent: '#10b981',
                stat: 'Real-Time Triage & Blast Radius',
              },
              {
                role: 'Internal Auditor Desk',
                question: 'Which employees exhibit privilege drift?',
                path: '/dashboard/audit',
                accent: '#8b5cf6',
                stat: 'Staff Surveillance & Overrides',
              },
              {
                role: 'Compliance Officer Desk',
                question: 'Are our regulatory pipelines and SARs sound?',
                path: '/dashboard/compliance',
                accent: '#0ea5e9',
                stat: 'Automated SAR & Pipeline SLA',
              },
            ].map((ws) => (
              <Link
                key={ws.role}
                to={ws.path}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '32px 28px',
                  borderRadius: 18,
                  background: '#f8faf7',
                  border: '1px solid #e2e8df',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'transform 0.22s, box-shadow 0.22s, border-color 0.22s',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = 'translateY(-4px)';
                  el.style.boxShadow = '0 16px 40px rgba(0, 0, 0, 0.08)';
                  el.style.borderColor = ws.accent;
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = '';
                  el.style.boxShadow = '';
                  el.style.borderColor = '#e2e8df';
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 11,
                      fontWeight: 700,
                      color: ws.accent,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      marginBottom: 16,
                    }}
                  >
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: ws.accent }} />
                    {ws.stat}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#0e1f16', marginBottom: 8 }}>
                    {ws.role}
                  </div>
                  <div style={{ fontSize: 14, color: '#64748b', fontStyle: 'italic', lineHeight: 1.5, marginBottom: 24 }}>
                    "{ws.question}"
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#0e1f16',
                  }}
                >
                  <span>Open workspace</span>
                  <ArrowUpRight size={14} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 9: DARK CLOSING CTA & FOOTER ────────────────── */}
      <footer
        style={{
          background: '#070b08',
          color: '#ffffff',
          padding: '100px clamp(24px, 5vw, 68px) 48px',
        }}
      >
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          {/* Top Banner: Final CTA */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 36,
              paddingBottom: 64,
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div>
              <h2
                style={{
                  margin: '0 0 12px',
                  fontSize: 'clamp(28px, 4vw, 44px)',
                  fontWeight: 700,
                  lineHeight: 1.15,
                  letterSpacing: '-0.03em',
                  color: '#ffffff',
                }}
              >
                {landingContent.finalCta.headline}
              </h2>
              <p
                style={{
                  fontSize: 15,
                  color: 'rgba(230, 245, 236, 0.7)',
                  maxWidth: 540,
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                {landingContent.finalCta.copy}
              </p>
            </div>

            {/* Direct Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <Link
                to={landingContent.finalCta.primaryLink}
                style={{
                  padding: '12px 28px',
                  borderRadius: 999,
                  background: '#ffffff',
                  color: '#070b08',
                  fontSize: 13,
                  fontWeight: 700,
                  textDecoration: 'none',
                  letterSpacing: '-0.01em',
                  transition: 'transform 0.15s ease',
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.transform = 'scale(1.03)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.transform = '')}
              >
                {landingContent.finalCta.primaryButton}
              </Link>

              <Link
                to={landingContent.finalCta.secondaryLink}
                style={{
                  padding: '12px 22px',
                  borderRadius: 999,
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: 'none',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(255, 255, 255, 0.14)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(255, 255, 255, 0.08)')}
              >
                {landingContent.finalCta.secondaryButton}
              </Link>
            </div>
          </div>

          {/* Links Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 36,
              padding: '56px 0',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <InsiderTraceLogo size={22} />
                <span style={{ fontSize: 15, fontWeight: 700, color: '#ffffff' }}>
                  {landingContent.footer.brandName}
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.5)', lineHeight: 1.6 }}>
                {landingContent.footer.tagline}
              </div>
            </div>

            {landingContent.footer.navColumns.map((col) => (
              <div key={col.title}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.4)',
                    textTransform: 'uppercase',
                    marginBottom: 14,
                    letterSpacing: '0.06em',
                  }}
                >
                  {col.title}
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    fontSize: 13,
                    color: 'rgba(255,255,255,0.7)',
                  }}
                >
                  {col.links.map((lnk) => (
                    <Link
                      key={lnk.label}
                      to={lnk.path}
                      style={{ color: 'inherit', textDecoration: 'none' }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#34d399')}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)')}
                    >
                      {lnk.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Copyright bar */}
          <div
            style={{
              paddingTop: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 11,
              color: 'rgba(255, 255, 255, 0.4)',
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            <span>{landingContent.footer.copyright}</span>
            <span>{landingContent.footer.systemStatus}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
