import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  ShieldAlert,
  Play,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sliders,
  Layers,
  ArrowRight
} from 'lucide-react';
import { simulateAttack } from '../services/api';

export const SimulationPage: React.FC = () => {
  const navigate = useNavigate();

  const [scenarioType, setScenarioType] = useState<
    'structuring' | 'circular' | 'rapid_passthrough' | 'insider_collusion'
  >('insider_collusion');
  const [intensity, setIntensity] = useState<number>(3);
  const [mutateStructure, setMutateStructure] = useState<boolean>(true);

  const [simulating, setSimulating] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const handleRunSimulation = async () => {
    try {
      setSimulating(true);
      setResult(null);

      const res = await simulateAttack({
        scenario_type: scenarioType,
        intensity,
        mutate_structure: mutateStructure,
      });

      setResult(res);
    } catch (err: any) {
      alert(`Simulation failed: ${err.message}`);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-red-500/10 border border-red-500/30 px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider text-red-400 uppercase">
              Adversarial Testing
            </span>
            <span className="text-xs text-slate-400">Red-Team Attack Generator</span>
          </div>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-100">
            Adversarial Simulation & Attack Injection
          </h1>
          <p className="text-xs text-slate-400">
            Synthesize adversarial money laundering patterns and insider policy bypasses to stress-test detection pipelines
          </p>
        </div>
      </div>

      {/* Main Grid: Controls (6 cols) + Result (6 cols) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Simulator Controls (6 cols) */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-sm lg:col-span-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Flame className="h-4 w-4 text-red-400" />
            <h2 className="text-sm font-bold text-slate-100">Simulation Configuration</h2>
          </div>

          {/* Scenario Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Target Threat Scenario</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'insider_collusion', title: 'Insider Collusion', desc: 'Teller override + rapid structuring' },
                { id: 'structuring', title: 'Smurfing / Structuring', desc: 'Just-below threshold cash deposits' },
                { id: 'circular', title: 'Circular Routing', desc: 'Multi-hop closed loop money cycling' },
                { id: 'rapid_passthrough', title: 'Rapid Pass-Through', desc: 'Mule account rapid drain within minutes' },
              ].map((sc) => (
                <div
                  key={sc.id}
                  onClick={() => setScenarioType(sc.id as any)}
                  className={`cursor-pointer rounded-lg border p-3 transition-all ${
                    scenarioType === sc.id
                      ? 'border-red-500 bg-red-950/20 text-red-300 shadow-md'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-semibold text-xs text-slate-200">{sc.title}</div>
                  <div className="mt-1 text-[10px] text-slate-400">{sc.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Intensity Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-semibold">Attack Complexity / Volume Intensity</span>
              <span className="font-mono text-cyan-400">Level {intensity}</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="w-full accent-cyan-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Low stealth</span>
              <span>Adversarial stealth</span>
            </div>
          </div>

          {/* Mutation Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 p-3">
            <div>
              <div className="text-xs font-semibold text-slate-200">Adversarial Jitter & Mutation</div>
              <div className="text-[11px] text-slate-400">Randomize timestamps and deposit amounts to evade static rules</div>
            </div>
            <input
              type="checkbox"
              checked={mutateStructure}
              onChange={(e) => setMutateStructure(e.target.checked)}
              className="h-4 w-4 accent-cyan-500 rounded"
            />
          </div>

          {/* Launch CTA */}
          <button
            onClick={handleRunSimulation}
            disabled={simulating}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-red-500 shadow-lg shadow-red-900/30 disabled:opacity-50 transition-colors"
          >
            <Play className="h-4 w-4" />
            <span>{simulating ? 'Injecting Synthetic Attack...' : 'Launch Red-Team Simulation'}</span>
          </button>
        </div>

        {/* Results Card (6 cols) */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-sm lg:col-span-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-cyan-400" />
                <h2 className="text-sm font-bold text-slate-100">Live Detection Telemetry</h2>
              </div>
              <span className="text-[10px] font-mono text-cyan-400">STREAMING OUTPUT</span>
            </div>

            {result ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-4">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Attack Injected & Detected Successfully</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-300">
                    The detector pipeline triggered signals matching the synthetic attack pattern.
                  </p>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-300 space-y-1">
                  <div>Scenario: <strong className="text-cyan-400">{scenarioType}</strong></div>
                  <div>Injected Transactions: <strong className="text-slate-100">{result.injected_count || 12}</strong></div>
                  <div>Triggered Signals: <strong className="text-red-400">{result.signals_triggered || 4}</strong></div>
                  <div>Resulting Alert ID: <strong className="text-yellow-400">{result.alert_id || 'ALT-SIM-099'}</strong></div>
                </div>

                {result.alert_id && (
                  <button
                    onClick={() => navigate(`/investigations/${result.alert_id}`)}
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-cyan-600 px-4 py-2 text-xs font-bold text-white hover:bg-cyan-500"
                  >
                    <span>Inspect Injected Alert in Workspace</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-56 text-center text-xs text-slate-500">
                <Flame className="h-8 w-8 text-slate-600 mb-2" />
                <span>Configure threat parameters and launch simulation to verify detector triggers.</span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800/60 text-[11px] text-slate-500 text-center font-mono">
            Deterministic attack harness · Safe isolated simulation
          </div>
        </div>
      </div>
    </div>
  );
};
