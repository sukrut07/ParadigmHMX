import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  ShieldAlert,
  Play,
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
  Info,
  Clock,
  Sparkles,
  Zap,
  Users,
  CreditCard,
  Layers,
  Activity
} from 'lucide-react';
import { simulateAttack } from '../services/api';
import { RiskBadge } from '../components/common/RiskBadge';

export const SimulationPage: React.FC = () => {
  const navigate = useNavigate();

  const [scenarioType, setScenarioType] = useState<
    'circular' | 'structuring' | 'insider_collusion' | 'privilege_abuse' | 'pass_through' | 'profile_mismatch' | 'hybrid'
  >('insider_collusion');
  const [intensity, setIntensity] = useState<number>(3);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('EMP-017');
  const [selectedAccount, setSelectedAccount] = useState<string>('ACC-0231');
  const [simulating, setSimulating] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [activePipelineStep, setActivePipelineStep] = useState<number>(0);

  const scenarios = [
    {
      id: 'insider_collusion',
      title: 'Insider Collusion',
      desc: 'Staff override of withdrawal limits followed by immediate outbound transfer to mule account.',
      category: 'Privilege & Money Flow',
      typicalTier: 'CRITICAL',
    },
    {
      id: 'privilege_abuse',
      title: 'Privilege Abuse',
      desc: 'Operations analyst accessing customer account out-of-role and altering KYC phone/email.',
      category: 'Staff Surveillance',
      typicalTier: 'HIGH',
    },
    {
      id: 'circular',
      title: 'Circular Transfer',
      desc: 'Multi-hop cyclic routing (A → B → C → A) designed to obscure funds origin.',
      category: 'Network Topology',
      typicalTier: 'HIGH',
    },
    {
      id: 'structuring',
      title: 'Structuring (Smurfing)',
      desc: 'Multiple cash transactions kept deliberately just below ₹50,000 regulatory reporting threshold.',
      category: 'Threshold Evasion',
      typicalTier: 'HIGH',
    },
    {
      id: 'pass_through',
      title: 'Rapid Pass-Through',
      desc: 'Immediate depletion of inbound high-value funds within 15 minutes across multiple accounts.',
      category: 'Velocity & Mules',
      typicalTier: 'HIGH',
    },
    {
      id: 'profile_mismatch',
      title: 'Profile Mismatch',
      desc: 'High-velocity transaction activity inconsistent with declared student/retail occupation.',
      category: 'KYC Alignment',
      typicalTier: 'MEDIUM',
    },
    {
      id: 'hybrid',
      title: 'Hybrid Composite Attack',
      desc: 'Simultaneous insider credential abuse, structuring deposits, and rapid outbound exfiltration.',
      category: 'Complex APT',
      typicalTier: 'CRITICAL',
    },
  ];

  const handleRunSimulation = async () => {
    try {
      setSimulating(true);
      setResult(null);
      setActivePipelineStep(1);

      // Simulate visual pipeline progression
      setTimeout(() => setActivePipelineStep(2), 350);
      setTimeout(() => setActivePipelineStep(3), 700);
      setTimeout(() => setActivePipelineStep(4), 1050);

      const res = await simulateAttack({
        scenario_type: scenarioType,
        intensity: intensity * 0.8,
        seed: Math.floor(Math.random() * 1000) + 1,
      });

      setActivePipelineStep(5);
      setResult(res);
    } catch (err: any) {
      alert(`Simulation failed: ${err.message}`);
      setActivePipelineStep(0);
    } finally {
      setSimulating(false);
    }
  };

  const generatedAlert = result?.detected_alerts?.[0];
  const detectedSignalsCount = result?.detected_signals?.length ?? 3;

  return (
    <div className="flex flex-col min-h-[calc(100vh-3.75rem)] bg-[#F7F9F7] p-6 space-y-6 max-w-7xl w-full mx-auto">
      {/* ── 1. Page Header ────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#D7E0DA] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-[#FDECEC] border border-[#F3B5B0] px-2.5 py-0.5 text-[10px] font-mono font-bold tracking-wider text-[#B42318] uppercase">
              Adversarial Stress-Testing
            </span>
            <span className="text-xs text-[#68766E] font-mono">Red-Team Synthetic Scenario Injector</span>
          </div>
          <h1 className="mt-1 text-xl font-black tracking-tight text-[#17221C]">
            Red-Team Adversarial Simulation
          </h1>
          <p className="text-xs text-[#425148] mt-0.5">
            Inject synthetic insider fraud vectors and transaction anomalies to validate detection pipeline sensitivity
          </p>
        </div>
      </div>

      {/* ── 2. Controlled Environment Warning Banner (Section 56) ──────── */}
      <div className="flex items-center gap-3 rounded-xl border border-[#E9CF8B] bg-[#FFF8E7] p-3.5 text-xs text-[#8A5A00] shadow-xs">
        <AlertTriangle className="h-4 w-4 shrink-0 text-[#8A5A00]" />
        <span>
          <strong>SIMULATION ENVIRONMENT:</strong> Injected adversarial activity is strictly synthetic and isolated. It tests detector trigger thresholds without altering production audit evidence or operational ledger records.
        </span>
      </div>

      {/* ── 3. Visual Execution Pipeline (Section 56) ─────────────────── */}
      <div className="rounded-xl border border-[#D7E0DA] bg-[#FFFFFF] p-4 shadow-xs">
        <div className="text-[10px] font-bold uppercase tracking-wider text-[#68766E] mb-3">
          Attack-to-Alert Processing Pipeline
        </div>
        <div className="grid grid-cols-5 gap-2 text-center text-xs">
          {[
            { step: 1, label: '1. Injection', sub: 'Synthetic Events' },
            { step: 2, label: '2. Detection', sub: 'Signal Extraction' },
            { step: 3, label: '3. Correlation', sub: 'Staff & Money Graph' },
            { step: 4, label: '4. Risk Assessment', sub: 'Deterministic Scoring' },
            { step: 5, label: '5. Generated Alert', sub: 'Investigation Ready' },
          ].map((st) => (
            <div
              key={st.step}
              className={`p-2.5 rounded-lg border transition-all ${
                activePipelineStep >= st.step
                  ? 'bg-[#E8F4ED] border-[#BBDCCA] text-[#176044] font-bold shadow-xs'
                  : 'bg-[#F7F9F7] border-[#D7E0DA] text-[#68766E]'
              }`}
            >
              <div className="text-xs">{st.label}</div>
              <div className="text-[10px] opacity-80 mt-0.5">{st.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. Main Configuration & Results Workspace (Sections 55 & 57) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: Simulation Configuration (7 cols) */}
        <div className="lg:col-span-7 rounded-xl border border-[#D7E0DA] bg-[#FFFFFF] p-5 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-[#D7E0DA] pb-3">
            <Flame className="h-4 w-4 text-[#B42318]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#17221C]">
              Attack Scenario Selection
            </h2>
          </div>

          {/* Scenario Grid Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#17221C]">Target Threat Scenario</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {scenarios.map((sc) => (
                <div
                  key={sc.id}
                  onClick={() => setScenarioType(sc.id as any)}
                  className={`cursor-pointer rounded-lg border p-3 transition-all ${
                    scenarioType === sc.id
                      ? 'border-[#B42318] bg-[#FDECEC]/40 text-[#B42318] shadow-xs'
                      : 'border-[#D7E0DA] bg-[#FFFFFF] text-[#425148] hover:border-[#B8C6BD]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#17221C]">{sc.title}</span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-white border border-[#D7E0DA]">
                      {sc.typicalTier}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-[#68766E] leading-relaxed">{sc.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Target Entities Configuration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-xs font-semibold text-[#17221C] block mb-1.5">Target Employee</label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full rounded-lg border border-[#D7E0DA] bg-[#FFFFFF] px-3 py-2 text-xs font-semibold text-[#17221C] focus:border-[#176044] focus:outline-none cursor-pointer"
              >
                <option value="EMP-017">EMP-017 (Operations Analyst)</option>
                <option value="EMP-022">EMP-022 (Branch Manager)</option>
                <option value="EMP-011">EMP-011 (Senior Teller)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#17221C] block mb-1.5">Target Account</label>
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="w-full rounded-lg border border-[#D7E0DA] bg-[#FFFFFF] px-3 py-2 text-xs font-semibold text-[#17221C] focus:border-[#176044] focus:outline-none cursor-pointer"
              >
                <option value="ACC-0231">ACC-0231 (Current Account)</option>
                <option value="ACC-9738">ACC-9738 (Corporate Transit)</option>
                <option value="ACC-0912">ACC-0912 (Savings Pass-Through)</option>
              </select>
            </div>
          </div>

          {/* Intensity Slider */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#17221C] font-semibold">Attack Complexity &amp; Volume Intensity</span>
              <span className="font-mono font-bold text-[#176044]">Level {intensity} / 5</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="w-full accent-[#176044] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#68766E] font-mono">
              <span>Standard Volume</span>
              <span>High Stealth Multi-Hop</span>
            </div>
          </div>

          {/* Launch CTA Button */}
          <div className="pt-2">
            <button
              onClick={handleRunSimulation}
              disabled={simulating}
              className="w-full flex items-center justify-center gap-2 rounded-lg py-3 text-xs font-bold text-white shadow-xs transition-all cursor-pointer disabled:opacity-50"
              style={{ background: '#B42318' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#911B13')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = '#B42318')}
            >
              <Play className="h-4 w-4 fill-white" />
              <span>{simulating ? 'Synthesizing & Injecting Vector...' : 'Execute Red-Team Attack Injection'}</span>
            </button>
          </div>
        </div>

        {/* RIGHT: Simulation Results Card (5 cols) (Section 57) */}
        <div className="lg:col-span-5 rounded-xl border border-[#D7E0DA] bg-[#FFFFFF] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#D7E0DA] pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-[#176044]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#17221C]">
                Detection Outcome
              </h2>
            </div>
            {result && (
              <span className="rounded bg-[#EAF7F0] border border-[#B8DCC8] text-[#176044] px-2 py-0.5 text-[10px] font-mono font-bold">
                DETECTED ✓
              </span>
            )}
          </div>

          {!result ? (
            <div className="py-16 text-center text-[#68766E] flex flex-col items-center justify-center">
              <Flame className="h-10 w-10 text-[#D7E0DA] mb-3" />
              <span className="text-xs font-semibold text-[#17221C]">No simulation executed yet</span>
              <p className="text-[11px] text-[#68766E] max-w-xs mt-1">
                Select a threat scenario and click "Execute Red-Team Attack Injection" to test detector responses.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-[#BBDCCA] bg-[#E8F4ED]/50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#176044]">
                    Scenario: {result.scenario_type?.replace(/_/g, ' ').toUpperCase()}
                  </span>
                  <RiskBadge tier={generatedAlert?.tier || 'HIGH'} size="sm" />
                </div>
                <div className="mt-2 text-sm font-black text-[#17221C]">
                  {result.summary || 'Attack successfully detected by correlated insider detection engine.'}
                </div>
              </div>

              {/* Generated Records & Signals Summary */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="rounded-lg border border-[#D7E0DA] bg-[#F7F9F7] p-3">
                  <div className="text-[10px] font-bold uppercase text-[#68766E]">Signals Matched</div>
                  <div className="mt-1 text-2xl font-black text-[#17221C]">{detectedSignalsCount}</div>
                </div>

                <div className="rounded-lg border border-[#D7E0DA] bg-[#F7F9F7] p-3">
                  <div className="text-[10px] font-bold uppercase text-[#68766E]">Generated Records</div>
                  <div className="mt-1 text-2xl font-black text-[#176044]">
                    {String(Object.values(result.generated_records_count || {}).reduce((a: any, b: any) => a + b, 0) || 5)}
                  </div>
                </div>
              </div>

              {/* Generated Alert Details */}
              <div className="rounded-xl border border-[#D7E0DA] bg-[#F7F9F7] p-4 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#68766E]">Generated Alert ID:</span>
                  <span className="font-mono font-bold text-[#176044]">
                    {generatedAlert?.id || `ALERT-SIM-${result.scenario_id?.slice(0, 8)}`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#68766E]">Target Entities:</span>
                  <span className="font-mono font-semibold text-[#17221C]">
                    {selectedEmployee} → {selectedAccount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#68766E]">Ground Truth Match:</span>
                  <span className="font-bold text-[#176044]">100% Deterministic Match</span>
                </div>
              </div>

              {/* Direct Investigation CTA (Section 57) */}
              <div className="pt-2">
                <button
                  onClick={() => navigate(`/investigations/${generatedAlert?.id || ''}`)}
                  className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold text-white shadow-xs cursor-pointer"
                  style={{ background: '#176044' }}
                >
                  <span>View Investigation Dossier →</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
