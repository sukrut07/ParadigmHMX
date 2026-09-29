import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldAlert,
  ArrowRight,
  Network,
  Clock,
  FileCheck2,
  CheckCircle2,
  Users,
  CreditCard,
  Sparkles,
  GitBranch,
  ShieldCheck,
  FileCode,
  ExternalLink
} from 'lucide-react';
import { ScrollReveal, AnimatedNumber } from '../../components/motion';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeStage, setActiveStage] = useState(0);

  // Auto-progress the hero graph path stage every 2.8s
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % 5);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const heroNodes = [
    { id: 'EMP-017', label: 'EMP-017', role: 'Branch Teller', type: 'employee', color: 'purple' },
    { id: 'ACC-0231', label: 'ACC-0231', role: 'Target Account', type: 'account', color: 'cyan' },
    { id: 'OVERRIDE', label: 'LIMIT BOOST', role: '₹5L → ₹15L Override', type: 'action', color: 'orange' },
    { id: 'OUTBOUND', label: '₹9,80,000', role: 'Rapid Outbound (UPI)', type: 'transaction', color: 'amber' },
    { id: 'MULES', label: 'ACC-0442 ➔ 0553', role: 'Mule Ring Loop', type: 'ring', color: 'rose' },
  ];

  const causalSteps = [
    {
      time: '14:02:18',
      offset: 'T + 0m',
      title: 'Out-of-Role Account View',
      badge: 'OUT_OF_ROLE_ACCESS',
      badgeColor: 'border-purple-500/40 text-purple-400 bg-purple-500/10',
      desc: 'EMP-017 (Teller, Branch BR-01) queries high-net-worth customer account ACC-0231 outside authorized branch jurisdiction.',
      actor: 'EMP-017',
    },
    {
      time: '14:08:44',
      offset: 'T + 6m',
      title: 'Unapproved Contact Phone Edit',
      badge: 'ACCOUNT_CHANGE',
      badgeColor: 'border-orange-500/40 text-orange-400 bg-orange-500/10',
      desc: 'Mobile contact number changed to unverified number (+91-98765-XXXXX) without secondary dual-control approval ticket.',
      actor: 'EMP-017',
    },
    {
      time: '14:17:02',
      offset: 'T + 14m',
      title: 'Daily Transfer Limit Boost Override',
      badge: 'PRIVILEGE_ABUSE',
      badgeColor: 'border-rose-500/40 text-rose-400 bg-rose-500/10',
      desc: 'Emergency manager bypass used to elevate daily outbound ceiling from ₹5,00,000 to ₹15,00,000.',
      actor: 'EMP-017',
    },
    {
      time: '14:31:22',
      offset: 'T + 29m',
      title: 'High-Velocity Outbound Drainage (₹4.8L)',
      badge: 'RAPID_PASSTHROUGH',
      badgeColor: 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10',
      desc: 'Immediate outbound UPI transfer of ₹4,80,000 routed to intermediary mule account ACC-0442.',
      actor: 'ACC-0231',
    },
    {
      time: '14:38:15',
      offset: 'T + 36m',
      title: 'Secondary Drainage & Mule Hop (₹4.7L)',
      badge: 'STRUCTURING',
      badgeColor: 'border-amber-500/40 text-amber-400 bg-amber-500/10',
      desc: 'Secondary outbound transfer of ₹4,70,000 followed by instant pass-through from ACC-0442 to ACC-0553.',
      actor: 'ACC-0442',
    },
    {
      time: '14:52:40',
      offset: 'T + 50m',
      title: 'Circular Return Loop Completed',
      badge: 'CIRCULAR_TRANSFER',
      badgeColor: 'border-rose-500/40 text-rose-400 bg-rose-500/10',
      desc: 'Funds returned to ACC-0231 completing a 3-hop circular loop ($A \\rightarrow B \\rightarrow C \\rightarrow A$) to obfuscate beneficiary origin.',
      actor: 'ACC-0553',
    },
  ];

  return (
    <div className="min-h-screen bg-[#050315] text-slate-100 selection:bg-indigo-600/30 selection:text-indigo-200">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#070814]/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white shadow-lg shadow-cyan-900/30">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold tracking-wider text-slate-100">
                <span>INSIDER</span>
                <span className="text-cyan-400">TRACE</span>
              </div>
              <div className="text-[10px] tracking-tight text-slate-400">Financial Crime & Insider Risk</div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs text-slate-400">
            <a href="#silo" className="hover:text-slate-200 transition-colors">The Silo</a>
            <a href="#linkage" className="hover:text-slate-200 transition-colors">Causal Link</a>
            <a href="#network" className="hover:text-slate-200 transition-colors">Money Network</a>
            <a href="#explainability" className="hover:text-slate-200 transition-colors">Explainable Risk</a>
            <a href="#proof" className="hover:text-slate-200 transition-colors">Evidence Export</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard/fraud')}
              className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <span>Personas</span>
            </button>
            <button
              onClick={() => navigate('/investigations')}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-900/30 hover:brightness-110 transition-all"
            >
              <span>Open Platform</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32 border-b border-slate-800/60">
        {/* Subtle radial ambient glow */}
        <div className="pointer-events-none absolute left-1/2 top-10 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-tr from-indigo-900/20 via-cyan-900/15 to-transparent blur-3xl" />

        <div className="mx-auto max-w-7xl px-6 relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-[11px] font-mono font-medium tracking-wide text-indigo-300">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
              FINANCIAL CRIME + INSIDER RISK INTELLIGENCE
            </div>

            <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Connect the person <br />
              <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-indigo-500 bg-clip-text text-transparent">
                to the money.
              </span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
              InsiderTrace correlates employee operational activity, security parameter changes, and suspicious transactions into evidence-backed, explainable investigations.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => navigate('/investigations')}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-950/50 hover:brightness-110 transition-all hover:scale-[1.02]"
              >
                <span>Open Investigation Workspace</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <a
                href="#linkage"
                className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-6 py-3.5 text-sm font-semibold text-slate-300 hover:border-slate-700 hover:text-white transition-all"
              >
                <span>See How It Works</span>
              </a>
            </div>

            {/* Quick Metrics Bar */}
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-6 border-t border-slate-800/80 text-left">
              <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/60">
                <div className="text-[11px] text-slate-400 uppercase font-mono">Detection Recall</div>
                <div className="text-xl font-bold text-emerald-400 mt-1">
                  <AnimatedNumber value={100} suffix="%" />
                </div>
                <div className="text-[10px] text-slate-400">Zero missed true positives</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/60">
                <div className="text-[11px] text-slate-400 uppercase font-mono">False Positive Rate</div>
                <div className="text-xl font-bold text-cyan-400 mt-1">
                  <AnimatedNumber value={9.38} decimals={2} suffix="%" />
                </div>
                <div className="text-[10px] text-slate-400">Tested on 32 hard negatives</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/60">
                <div className="text-[11px] text-slate-400 uppercase font-mono">F1-Score Lift</div>
                <div className="text-xl font-bold text-indigo-400 mt-1">
                  +<AnimatedNumber value={29.7} decimals={1} suffix="%" />
                </div>
                <div className="text-[10px] text-slate-400">vs financial-only AML</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/60">
                <div className="text-[11px] text-slate-400 uppercase font-mono">Risk Explanations</div>
                <div className="text-xl font-bold text-amber-400 mt-1">5 Tiers</div>
                <div className="text-[10px] text-slate-400">Deterministic breakdown</div>
              </div>
            </div>
          </div>

          {/* Interactive Hero Investigation Graph */}
          <div className="mt-14 mx-auto max-w-4xl rounded-2xl border border-slate-800 bg-[#090b16] p-6 shadow-2xl shadow-indigo-950/30">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                <span className="text-xs font-mono font-bold tracking-wider text-rose-400 uppercase">
                  Active Incident: ALT-2031 (Insider Collusion & Money Loop)
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Stage {activeStage + 1} of 5 • Dynamic Sequence
              </span>
            </div>

            {/* Stepper Progress Pipeline */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mt-6">
              {heroNodes.map((node, idx) => {
                const isActive = activeStage >= idx;
                const isCurrent = activeStage === idx;
                return (
                  <div
                    key={node.id}
                    onClick={() => setActiveStage(idx)}
                    className={`relative rounded-xl p-3 border transition-all cursor-pointer ${
                      isCurrent
                        ? 'border-cyan-500/80 bg-cyan-950/20 shadow-lg shadow-cyan-950/40 scale-102'
                        : isActive
                        ? 'border-indigo-500/40 bg-indigo-950/15'
                        : 'border-slate-800/70 bg-slate-900/30 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                      <span>STEP 0{idx + 1}</span>
                      {isActive && <CheckCircle2 className="h-3 w-3 text-cyan-400" />}
                    </div>
                    <div className="text-xs font-bold text-slate-100 font-mono">{node.label}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{node.role}</div>
                  </div>
                );
              })}
            </div>

            {/* Visual Flow Narrative Banner */}
            <div className="mt-6 rounded-xl bg-slate-950/70 border border-slate-800/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-indigo-400">
                  Correlated Causal Vector
                </div>
                <div className="text-xs font-semibold text-slate-200 mt-1">
                  EMP-017 (Teller) modified phone number + boosted limit on victim account ACC-0231; ₹9.8L drained to mule ring within 35 minutes.
                </div>
              </div>
              <button
                onClick={() => navigate('/investigations')}
                className="shrink-0 flex items-center gap-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/40 px-3 py-1.5 text-xs font-medium text-indigo-300 hover:bg-indigo-600/30 transition-colors"
              >
                <span>Inspect in Workspace</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: THE SILO ("Same Incident. Different Systems.") */}
      <section id="silo" className="py-20 border-b border-slate-800/60 bg-[#060713]">
        <div className="mx-auto max-w-7xl px-6">
          <ScrollReveal direction="up">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-[11px] font-mono font-bold tracking-wider text-indigo-400 uppercase">
                The Core Vulnerability
              </span>
              <h2 className="mt-2 text-3xl font-extrabold text-white tracking-tight">
                Same incident. Different systems.
              </h2>
              <p className="mt-3 text-sm text-slate-400">
                Financial institutions review internal staff access and external money movement in disjointed teams, hiding collusion and unauthorized account overrides.
              </p>
            </div>
          </ScrollReveal>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Silo 1: Transaction Monitoring */}
            <ScrollReveal direction="left" delayMs={100}>
              <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-cyan-950/20 to-slate-900/40 p-6 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-cyan-400" />
                      <span className="text-sm font-bold text-slate-100">Transaction Monitoring (AML)</span>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30">
                      External Flow
                    </span>
                  </div>
                  <p className="mt-4 text-xs text-slate-300 leading-relaxed">
                    Scrutinizes payment velocity, structuring thresholds, and mule hops between client accounts.
                  </p>
                  <div className="mt-4 space-y-2 font-mono text-xs">
                    <div className="p-2 rounded bg-slate-950/70 border border-slate-800/80 text-slate-300 flex items-center justify-between">
                      <span>₹4,80,000 Outbound UPI</span>
                      <span className="text-amber-400">Flagged (Passthrough)</span>
                    </div>
                    <div className="p-2 rounded bg-slate-950/70 border border-slate-800/80 text-slate-300 flex items-center justify-between">
                      <span>ACC-0442 ➔ ACC-0553</span>
                      <span className="text-rose-400">Circular Hop</span>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-3 border-t border-slate-800 text-[11px] text-rose-400 font-medium">
                  ⚠️ Blind to who edited the account limit or approved the transfer internally.
                </div>
              </div>
            </ScrollReveal>

            {/* Silo 2: Internal Audit / IAM */}
            <ScrollReveal direction="right" delayMs={200}>
              <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-b from-purple-950/20 to-slate-900/40 p-6 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-purple-400" />
                      <span className="text-sm font-bold text-slate-100">Employee Monitoring (IAM / UEBA)</span>
                    </div>
                    <span className="text-[10px] font-mono text-purple-400 uppercase px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30">
                      Internal Ops
                    </span>
                  </div>
                  <p className="mt-4 text-xs text-slate-300 leading-relaxed">
                    Audits core banking logins, unapproved customer lookups, and branch permission tickets.
                  </p>
                  <div className="mt-4 space-y-2 font-mono text-xs">
                    <div className="p-2 rounded bg-slate-950/70 border border-slate-800/80 text-slate-300 flex items-center justify-between">
                      <span>EMP-017 (Teller, BR-01)</span>
                      <span className="text-purple-400">Out-of-Role View</span>
                    </div>
                    <div className="p-2 rounded bg-slate-950/70 border border-slate-800/80 text-slate-300 flex items-center justify-between">
                      <span>Emergency Limit Boost</span>
                      <span className="text-amber-400">Override Logged</span>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-3 border-t border-slate-800 text-[11px] text-rose-400 font-medium">
                  ⚠️ Blind to downstream fund drainage or circular money laundering networks.
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Convergence Statement */}
          <div className="mt-10 max-w-xl mx-auto text-center rounded-xl bg-indigo-950/30 border border-indigo-500/30 p-4">
            <span className="text-xs font-mono font-bold text-indigo-300">
              INSIDERTRACE CONVERGENCE:
            </span>
            <p className="text-xs text-slate-300 mt-1">
              Connects the operator's unapproved modification directly to the rapid fund dissipation in a unified causal investigation.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2: THE LINK (Causal Timeline) */}
      <section id="linkage" className="py-20 border-b border-slate-800/60 bg-[#050315]">
        <div className="mx-auto max-w-7xl px-6">
          <ScrollReveal direction="up">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-[11px] font-mono font-bold tracking-wider text-cyan-400 uppercase">
                The Causal Connection
              </span>
              <h2 className="mt-2 text-3xl font-extrabold text-white tracking-tight">
                From internal access to fund dissipation
              </h2>
              <p className="mt-3 text-sm text-slate-400">
                Millisecond-accurate timeline linking operator actions, security parameter changes, and outbound transaction rails.
              </p>
            </div>
          </ScrollReveal>

          {/* Timeline Stream */}
          <div className="mt-14 max-w-3xl mx-auto relative border-l-2 border-slate-800 pl-6 space-y-8">
            {causalSteps.map((step, idx) => (
              <ScrollReveal key={step.time} direction="up" delayMs={idx * 80}>
                <div className="relative group">
                  {/* Dot on line */}
                  <div className="absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-[#050315] bg-cyan-500 group-hover:scale-125 transition-transform" />

                  <div className="rounded-xl border border-slate-800 bg-[#090b16] p-4 group-hover:border-slate-700 transition-colors">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800/70">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-200">{step.time}</span>
                        <span className="text-[10px] font-mono text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-950/30 border border-cyan-800/40">
                          {step.offset}
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${step.badgeColor}`}>
                        {step.badge}
                      </span>
                    </div>

                    <div className="mt-2 flex items-baseline justify-between">
                      <h4 className="text-sm font-semibold text-slate-100">{step.title}</h4>
                      <span className="text-xs font-mono text-slate-400">Actor: {step.actor}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: THE NETWORK (Money Flow & Graph) */}
      <section id="network" className="py-20 border-b border-slate-800/60 bg-[#060714]">
        <div className="mx-auto max-w-7xl px-6">
          <ScrollReveal direction="up">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-[11px] font-mono font-bold tracking-wider text-indigo-400 uppercase">
                Graph & Subgraph Intelligence
              </span>
              <h2 className="mt-2 text-3xl font-extrabold text-white tracking-tight">
                9 Specialized Signal Detectors
              </h2>
              <p className="mt-3 text-sm text-slate-400">
                Operating continuously across internal banking access logs, account parameters, and payment rails.
              </p>
            </div>
          </ScrollReveal>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Category 1 */}
            <div className="rounded-xl border border-cyan-500/20 bg-slate-900/30 p-5">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase mb-3">
                <CreditCard className="h-4 w-4" />
                <span>Financial Detectors</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <div>
                    <strong className="text-slate-100">Circular Transfer:</strong> Detects directed loops ($A \rightarrow B \rightarrow C \rightarrow A$) executed within 48h.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <div>
                    <strong className="text-slate-100">Structuring / Smurfing:</strong> Flags deliberate evasion of mandatory ₹50,000 threshold across $\ge 3$ transactions.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <div>
                    <strong className="text-slate-100">Rapid Passthrough:</strong> Mule behavior dissipating $\ge 85\%$ of lump-sum funds within 4 hours.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <div>
                    <strong className="text-slate-100">Profile Mismatch:</strong> Transfer volume &gt; 3.0× declared customer occupation income ceiling.
                  </div>
                </li>
              </ul>
            </div>

            {/* Category 2 */}
            <div className="rounded-xl border border-purple-500/20 bg-slate-900/30 p-5">
              <div className="flex items-center gap-2 text-purple-400 text-xs font-mono font-bold uppercase mb-3">
                <Users className="h-4 w-4" />
                <span>Insider Detectors</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">•</span>
                  <div>
                    <strong className="text-slate-100">Out-of-Role Access:</strong> Operations forbidden by RBAC or executed outside assigned branch jurisdiction.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">•</span>
                  <div>
                    <strong className="text-slate-100">Off-Hours Activity:</strong> Logins, edits, and approvals executed outside shift without emergency override tickets.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">•</span>
                  <div>
                    <strong className="text-slate-100">Bulk Account Lookup:</strong> Reconnaissance queries across &gt; 30 accounts in 24h (z-score &gt; 2.0).
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">•</span>
                  <div>
                    <strong className="text-slate-100">Privilege Abuse:</strong> Managerial overrides, unapproved limit raises exceeding peer baselines.
                  </div>
                </li>
              </ul>
            </div>

            {/* Category 3 */}
            <div className="rounded-xl border border-indigo-500/20 bg-slate-900/30 p-5">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-bold uppercase mb-3">
                <GitBranch className="h-4 w-4" />
                <span>Cross-Domain Linker</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold">•</span>
                  <div>
                    <strong className="text-slate-100">Action-Transaction Link:</strong> Bridges staff parameter edits (limit, phone, KYC) to rapid fund outflow within 24 hours.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold">•</span>
                  <div>
                    <strong className="text-slate-100">Shared Entity Clustering:</strong> Groups related employee terminals, accounts, and recipient mules.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold">•</span>
                  <div>
                    <strong className="text-slate-100">Blast Radius Discovery:</strong> Computes customer accounts and downstream volume touched by a suspect employee.
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: THE EXPLANATION (Deterministic Risk Levels) */}
      <section id="explainability" className="py-20 border-b border-slate-800/60 bg-[#050315]">
        <div className="mx-auto max-w-7xl px-6">
          <ScrollReveal direction="up">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-[11px] font-mono font-bold tracking-wider text-amber-400 uppercase">
                Explainable Risk Matrix
              </span>
              <h2 className="mt-2 text-3xl font-extrabold text-white tracking-tight">
                5 Deterministic Risk Dimensions
              </h2>
              <p className="mt-3 text-sm text-slate-400">
                No opaque single score. Reviewers understand exactly which risk factors contributed to the alert tier.
              </p>
            </div>
          </ScrollReveal>

          {/* Matrix Bars Preview */}
          <div className="mt-12 max-w-3xl mx-auto rounded-2xl border border-slate-800 bg-[#090b16] p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <span className="text-xs font-mono font-bold text-slate-300 uppercase">
                Example Risk Breakdown: Incident ALT-2031
              </span>
              <span className="text-xs font-bold text-rose-400 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30">
                Overall: CRITICAL
              </span>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-300">1. Insider Privilege Risk</span>
                  <span className="font-mono text-rose-400 font-bold">CRITICAL (92/100)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full w-[92%]" />
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Out-of-role branch access, daily limit boost override</div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-300">2. Money-Flow Topology Risk</span>
                  <span className="font-mono text-rose-400 font-bold">CRITICAL (88/100)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full w-[88%]" />
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Circular fund loop completed across 3 accounts ($A \rightarrow B \rightarrow C \rightarrow A$)</div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-300">3. Causal Temporal Linkage</span>
                  <span className="font-mono text-orange-400 font-bold">HIGH (78/100)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full w-[78%]" />
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Transfers occurred 14 min after emergency parameter change</div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-300">4. Profile / KYC Mismatch</span>
                  <span className="font-mono text-amber-400 font-bold">MEDIUM (55/100)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full w-[55%]" />
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Outflow exceeds declared monthly turnover ceiling by 2.4x</div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-300">5. Network Exposure / Blast Radius</span>
                  <span className="font-mono text-orange-400 font-bold">HIGH (72/100)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full w-[72%]" />
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Employee has touched 18 customer accounts in rolling 14-day window</div>
              </div>
            </div>

            {/* Counterfactual Card */}
            <div className="mt-6 rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-4">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-indigo-300 uppercase">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Counterfactual "What-If" Explanation</span>
              </div>
              <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                "If employee EMP-017 possessed Branch Manager jurisdiction and the emergency limit boost had authorized dual-signoff, overall risk drops from <strong>CRITICAL</strong> to <strong>LOW</strong>."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: THE INVESTIGATION (Workspace Preview) */}
      <section className="py-20 border-b border-slate-800/60 bg-[#060714]">
        <div className="mx-auto max-w-7xl px-6">
          <ScrollReveal direction="up">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-[11px] font-mono font-bold tracking-wider text-cyan-400 uppercase">
                Investigation Workspace
              </span>
              <h2 className="mt-2 text-3xl font-extrabold text-white tracking-tight">
                One incident. One timeline. One evidence trail.
              </h2>
              <p className="mt-3 text-sm text-slate-400">
                Desktop three-column workspace designed for rapid forensic triage and legally sound case adjudication.
              </p>
            </div>
          </ScrollReveal>

          <div className="mt-12 max-w-5xl mx-auto rounded-2xl border border-slate-800 bg-[#080912] p-4 shadow-2xl overflow-hidden">
            <div className="grid grid-cols-12 gap-3 text-xs">
              <div className="col-span-12 md:col-span-5 rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
                <div className="flex items-center gap-2 font-mono text-cyan-400 font-bold mb-2">
                  <Network className="h-4 w-4" />
                  <span>Interactive Graph</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Cytoscape network subgraphs rendering multi-hop circular loops, employee touchpoints, and transaction rails with directional arrows and rupee amounts.
                </p>
              </div>

              <div className="col-span-12 md:col-span-4 rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
                <div className="flex items-center gap-2 font-mono text-indigo-400 font-bold mb-2">
                  <Clock className="h-4 w-4" />
                  <span>Unified Timeline</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Relative offsets (T+0m, T+14m) unifying core banking audit logs, phone edits, limit overrides, and NEFT/RTGS transfers.
                </p>
              </div>

              <div className="col-span-12 md:col-span-3 rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
                <div className="flex items-center gap-2 font-mono text-rose-400 font-bold mb-2">
                  <FileCheck2 className="h-4 w-4" />
                  <span>Mandatory Evidence</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Deterministic risk matrix, rule conditions, counterfactuals, and one-click case creation permanently visible alongside every alert.
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800/80 text-center">
              <button
                onClick={() => navigate('/investigations')}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
              >
                <span>Launch Interactive Workspace</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: THE PROOF (Evidence & SHA-256) */}
      <section id="proof" className="py-20 border-b border-slate-800/60 bg-[#050315]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-4xl mx-auto rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/60 to-slate-950/80 p-8 sm:p-12 text-center">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 mb-6">
              <ShieldCheck className="h-6 w-6" />
            </div>

            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Every alert has evidence. Every export is verifiable.
            </h2>
            <p className="mt-3 text-sm text-slate-400 max-w-xl mx-auto">
              Export complete forensic dossiers in RFC 8785 canonical JSON or formatted ReportLab PDF, fingerprinted with SHA-256 digital seals for legal chain-of-custody.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => navigate('/dashboard/fraud')}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-950/50 hover:brightness-110 transition-all hover:scale-[1.02]"
              >
                <span>Start an Investigation</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigate('/evidence')}
                className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-6 py-3.5 text-sm font-semibold text-slate-300 hover:border-slate-700 hover:text-white transition-all"
              >
                <FileCode className="h-4 w-4 text-cyan-400" />
                <span>Inspect Evidence Center</span>
              </button>
            </div>

            {/* Persona Switcher Quick Links */}
            <div className="mt-10 pt-8 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              <div
                onClick={() => navigate('/dashboard/fraud')}
                className="p-3 rounded-lg border border-slate-800/70 bg-slate-900/30 hover:border-indigo-500/40 cursor-pointer transition-colors"
              >
                <div className="text-[10px] font-mono text-cyan-400 uppercase">Persona 1</div>
                <div className="text-xs font-bold text-slate-200 mt-0.5">Fraud Analyst</div>
                <div className="text-[11px] text-slate-400 mt-1">Priority queue, transaction anomalies, money flows</div>
              </div>

              <div
                onClick={() => navigate('/dashboard/audit')}
                className="p-3 rounded-lg border border-slate-800/70 bg-slate-900/30 hover:border-indigo-500/40 cursor-pointer transition-colors"
              >
                <div className="text-[10px] font-mono text-purple-400 uppercase">Persona 2</div>
                <div className="text-xs font-bold text-slate-200 mt-0.5">Internal Auditor</div>
                <div className="text-[11px] text-slate-400 mt-1">Staff peer deviations, off-hours access, blast radius</div>
              </div>

              <div
                onClick={() => navigate('/dashboard/compliance')}
                className="p-3 rounded-lg border border-slate-800/70 bg-slate-900/30 hover:border-indigo-500/40 cursor-pointer transition-colors"
              >
                <div className="text-[10px] font-mono text-amber-400 uppercase">Persona 3</div>
                <div className="text-xs font-bold text-slate-200 mt-0.5">Compliance Head</div>
                <div className="text-[11px] text-slate-400 mt-1">F1 metrics, 9.38% FPR on hard negatives, ablation lift</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-[#040210] border-t border-slate-800/60 text-xs text-slate-400">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">INSIDERTRACE</span>
            <span>•</span>
            <span>Evidence-First Financial Crime & Insider Risk Intelligence</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <a href="https://github.com/sukrut07/ParadigmHMX" target="_blank" rel="noreferrer" className="hover:text-slate-200 flex items-center gap-1">
              <span>GitHub</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            <span>•</span>
            <Link to="/investigations" className="hover:text-slate-200">Workspace</Link>
            <span>•</span>
            <Link to="/evaluation" className="hover:text-slate-200">Benchmark</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
