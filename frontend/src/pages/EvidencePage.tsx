import React, { useState } from 'react';
import {
  FileCheck2,
  ShieldCheck,
  ShieldAlert,
  Copy,
  Check,
  AlertTriangle,
  RefreshCw,
  Upload,
  Lock,
  ExternalLink
} from 'lucide-react';
import { verifyEvidence } from '../services/api';

export const EvidencePage: React.FC = () => {
  const [bundleText, setBundleText] = useState<string>(
    JSON.stringify(
      {
        bundle_id: 'EV-BUNDLE-2031',
        case_id: 'CASE-001',
        alert_id: 'ALT-PRIMARY',
        generated_at: '2026-09-29T14:32:18Z',
        evidence_records: [
          { type: 'ACCESS_LOG', id: 'ACC-LOG-8812', action: 'LOOKUP_ACCOUNT' },
          { type: 'TRANSACTION', id: 'TX-CIRC-01', amount: 980000 },
        ],
      },
      null,
      2
    )
  );

  const [expectedHash, setExpectedHash] = useState<string>(
    '3a7f8e91b2c45d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e'
  );

  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<{
    valid: boolean;
    calculated_hash?: string;
    expected_hash?: string;
    message?: string;
  } | null>(null);

  const [copiedHash, setCopiedHash] = useState(false);

  const handleVerify = async () => {
    try {
      setVerifying(true);
      setResult(null);

      let parsedBundle: any;
      try {
        parsedBundle = JSON.parse(bundleText);
      } catch (e) {
        throw new Error('Invalid JSON format in Evidence Package text field');
      }

      const res = await verifyEvidence(parsedBundle, expectedHash.trim());
      setResult(res);
    } catch (err: any) {
      setResult({
        valid: false,
        message: err.message || 'Verification failed',
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleTamperSimulation = () => {
    try {
      const parsed = JSON.parse(bundleText);
      parsed.evidence_records.push({ type: 'TRANSACTION', id: 'TX-TAMPERED-99', amount: 500000 });
      setBundleText(JSON.stringify(parsed, null, 2));
    } catch {
      setBundleText(bundleText + '\n// Tampered payload injection');
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider text-emerald-400 uppercase">
              Integrity Center
            </span>
            <span className="text-xs text-slate-400">Cryptographic Verification</span>
          </div>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-100">
            Tamper-Evident Evidence Verification
          </h1>
          <p className="text-xs text-slate-400">
            Independent proof of non-repudiation using canonical JSON and SHA-256 digital fingerprinting
          </p>
        </div>
      </div>

      {/* Main Grid: Verification Tool (7 cols) + Verification Log (5 cols) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Tool (7 cols) */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-sm lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-slate-100">Live Package Verification Tool</h2>
            </div>
            <button
              onClick={handleTamperSimulation}
              className="text-[11px] font-mono text-orange-400 hover:underline"
              title="Inject malicious change to trigger hash mismatch"
            >
              Simulate Data Tampering →
            </button>
          </div>

          {/* Bundle JSON Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Canonical Evidence Bundle (JSON)
            </label>
            <textarea
              rows={8}
              value={bundleText}
              onChange={(e) => setBundleText(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-300 focus:border-emerald-500 focus:outline-none custom-scrollbar"
            />
          </div>

          {/* Expected Hash Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Expected SHA-256 Digest Hash
            </label>
            <input
              type="text"
              value={expectedHash}
              onChange={(e) => setExpectedHash(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 font-mono text-xs text-slate-300 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleVerify}
              disabled={verifying}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow-lg shadow-emerald-900/30 disabled:opacity-50"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>{verifying ? 'Calculating SHA-256...' : 'Verify Cryptographic Authenticity'}</span>
            </button>
          </div>

          {/* Verification Result Banner */}
          {result && (
            <div
              className={`rounded-xl border p-4 text-xs ${
                result.valid
                  ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300'
                  : 'border-red-500/40 bg-red-950/20 text-red-300'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                {result.valid ? (
                  <>
                    <ShieldCheck className="h-5 w-5 text-emerald-400" />
                    <span>Cryptographic Verification Passed</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="h-5 w-5 text-red-400" />
                    <span>Tamper Detection Alert: Hash Mismatch</span>
                  </>
                )}
              </div>
              <p className="mt-1 text-slate-300">{result.message}</p>
              {result.calculated_hash && (
                <div className="mt-2 text-[11px] font-mono text-slate-400">
                  Calculated Digest: <span className="text-slate-200">{result.calculated_hash}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Verification Audit Log (5 cols) */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-sm lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <FileCheck2 className="h-4 w-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-slate-100">Recent Verification Log</h2>
            </div>
            <span className="text-[10px] font-mono text-emerald-400">AUDIT LOGGED</span>
          </div>

          <div className="space-y-3">
            {[
              { id: 'VER-001', bundle: 'EV-BUNDLE-2031', valid: true, time: '14:32:18', actor: 'Compliance Officer 01' },
              { id: 'VER-002', bundle: 'EV-BUNDLE-2029', valid: true, time: '12:15:02', actor: 'Lead Auditor 04' },
              { id: 'VER-003', bundle: 'EV-BUNDLE-2025', valid: true, time: '09:44:50', actor: 'Analyst 07' },
              { id: 'VER-004', bundle: 'EV-BUNDLE-2018', valid: true, time: 'Yesterday', actor: 'Compliance Officer 01' },
            ].map((log) => (
              <div
                key={log.id}
                className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-xs font-mono"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{log.bundle}</span>
                  <span className="rounded bg-emerald-950/80 border border-emerald-500/40 px-1.5 py-0.5 text-[10px] text-emerald-400">
                    AUTHENTIC
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Auditor: {log.actor}</span>
                  <span>{log.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
