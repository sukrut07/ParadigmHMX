import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  ExternalLink,
  Search,
  Download,
  Eye,
  CheckCircle2,
  X,
  FileCode,
  ArrowRight
} from 'lucide-react';
import { verifyEvidence, getCases, getAlerts } from '../services/api';

interface EvidenceRecord {
  id: string;
  case_id: string;
  alert_id: string;
  entity: string;
  created_at: string;
  type: string;
  hash: string;
  status: 'VERIFIED' | 'TAMPERED' | 'PENDING';
  records_count: number;
}

export const EvidencePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [activeView, setActiveView] = useState<'archive' | 'verifier'>('archive');
  const [searchTerm, setSearchTerm] = useState('');
  const [integrityFilter, setIntegrityFilter] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<EvidenceRecord | null>(null);
  const [showJsonBundle, setShowJsonBundle] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  // Verifier tool state
  const [bundleText, setBundleText] = useState<string>(
    JSON.stringify(
      {
        bundle_id: 'EV-00192',
        case_id: 'CASE-102',
        alert_id: 'ALERT-4AFA236D',
        generated_at: '2026-09-29T12:22:00Z',
        entity_trace: {
          employee_id: 'EMP-017',
          account_id: 'ACC-0231',
          transaction_id: 'TX-982134',
        },
        evidence_records: [
          { type: 'ACCESS_LOG', id: 'ACC-LOG-8812', action: 'LOOKUP_ACCOUNT' },
          { type: 'ACCOUNT_CHANGE', id: 'CHG-9921', field: 'daily_limit', new_value: 2000000 },
          { type: 'TRANSACTION', id: 'TX-982134', amount: 1500000, channel: 'RTGS' },
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
  const [verificationResult, setVerificationResult] = useState<{
    valid: boolean;
    calculated_hash?: string;
    message?: string;
  } | null>(null);

  // Seeded historical records (Section 34 & 35)
  const [evidenceList] = useState<EvidenceRecord[]>([
    {
      id: 'EV-00192',
      case_id: 'CASE-102',
      alert_id: 'ALERT-4AFA236D',
      entity: 'EMP-017 → ACC-0231',
      created_at: '2026-09-29T12:22:00Z',
      type: 'Canonical Bundle',
      hash: '3a7f8e91b2c45d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e',
      status: 'VERIFIED',
      records_count: 7,
    },
    {
      id: 'EV-00191',
      case_id: 'CASE-089',
      alert_id: 'ALERT-8831A12C',
      entity: 'EMP-022 → ACC-9738',
      created_at: '2026-09-28T16:45:00Z',
      type: 'Canonical Bundle',
      hash: '9f8e7d6c5b4a3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
      status: 'VERIFIED',
      records_count: 5,
    },
    {
      id: 'EV-00190',
      case_id: 'CASE-071',
      alert_id: 'ALERT-11029F9E',
      entity: 'EMP-009 → Bulk (14 Acc)',
      created_at: '2026-09-27T11:15:00Z',
      type: 'Audit Trace Log',
      hash: '4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c',
      status: 'VERIFIED',
      records_count: 14,
    },
    {
      id: 'EV-00189',
      case_id: 'CASE-065',
      alert_id: 'ALERT-6623BC14',
      entity: 'ACC-0912 (Rapid Pass)',
      created_at: '2026-09-26T14:30:00Z',
      type: 'Canonical Bundle',
      hash: '5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d',
      status: 'VERIFIED',
      records_count: 4,
    },
    {
      id: 'EV-00188',
      case_id: 'CASE-042',
      alert_id: 'ALERT-9941EE82',
      entity: 'EMP-011 → ACC-5412',
      created_at: '2026-09-25T09:12:00Z',
      type: 'Canonical Bundle',
      hash: '6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e',
      status: 'VERIFIED',
      records_count: 6,
    },
  ]);

  const filteredEvidence = evidenceList.filter((ev) => {
    if (integrityFilter && ev.status !== integrityFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        ev.id.toLowerCase().includes(q) ||
        ev.case_id.toLowerCase().includes(q) ||
        ev.alert_id.toLowerCase().includes(q) ||
        ev.entity.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleVerify = async () => {
    try {
      setVerifying(true);
      setVerificationResult(null);

      let parsedBundle: any;
      try {
        parsedBundle = JSON.parse(bundleText);
      } catch {
        throw new Error('Invalid JSON format in Evidence Package text field');
      }

      const res = await verifyEvidence(parsedBundle, expectedHash.trim());
      setVerificationResult(res);
    } catch (err: any) {
      setVerificationResult({
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

  const handleCopyHash = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-3.75rem)] bg-[#F7F9F7] p-6 space-y-6 max-w-7xl w-full mx-auto">
      {/* ── 1. Page Header ────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#D7E0DA] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-[#E8F4ED] border border-[#BBDCCA] px-2.5 py-0.5 text-[10px] font-mono font-bold tracking-wider text-[#176044] uppercase">
              Forensic Evidence Center
            </span>
            <span className="text-xs text-[#68766E] font-mono">Cryptographic Non-Repudiation Archive</span>
          </div>
          <h1 className="mt-1 text-xl font-black tracking-tight text-[#17221C]">
            Evidence Center &amp; Canonical Archive
          </h1>
          <p className="text-xs text-[#425148] mt-0.5">
            Immutable regulatory proof packages, SHA-256 digital seals, and tamper-evident audit trails
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('archive')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
              activeView === 'archive'
                ? 'bg-[#176044] text-white border-[#176044] shadow-xs'
                : 'bg-[#FFFFFF] text-[#425148] border-[#D7E0DA] hover:bg-[#F1F5F2]'
            }`}
          >
            Evidence Archive
          </button>
          <button
            onClick={() => setActiveView('verifier')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
              activeView === 'verifier'
                ? 'bg-[#176044] text-white border-[#176044] shadow-xs'
                : 'bg-[#FFFFFF] text-[#425148] border-[#D7E0DA] hover:bg-[#F1F5F2]'
            }`}
          >
            Live Verifier Tool
          </button>
        </div>
      </div>

      {/* ── 2. VIEW 1: EVIDENCE ARCHIVE (Sections 34, 35 & 45) ─────────── */}
      {activeView === 'archive' && (
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#D7E0DA] bg-[#FFFFFF] p-3.5 shadow-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#68766E]" />
                <input
                  type="text"
                  placeholder="Search Evidence ID, Case, Alert, Entity..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-72 rounded-lg border border-[#D7E0DA] bg-[#FFFFFF] pl-9 pr-3 py-1.5 text-xs text-[#17221C] placeholder-[#68766E] focus:border-[#176044] focus:outline-none"
                />
              </div>

              <select
                value={integrityFilter}
                onChange={(e) => setIntegrityFilter(e.target.value)}
                className="rounded-lg border border-[#D7E0DA] bg-[#FFFFFF] px-3 py-1.5 text-xs font-semibold text-[#17221C] focus:border-[#176044] focus:outline-none cursor-pointer"
              >
                <option value="">All Integrity Statuses</option>
                <option value="VERIFIED">SHA-256 Verified ✓</option>
                <option value="PENDING">Pending Verification</option>
                <option value="TAMPERED">Tamper Detected ⚠</option>
              </select>
            </div>

            <div className="text-xs font-mono text-[#68766E]">
              Archived <strong>{filteredEvidence.length}</strong> immutable bundles
            </div>
          </div>

          {/* Historical Evidence Table (Section 34) */}
          <div className="rounded-xl border border-[#D7E0DA] bg-[#FFFFFF] shadow-xs overflow-hidden">
            <div className="border-b border-[#D7E0DA] bg-[#F7F9F7] px-4 py-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#17221C]">
                Cryptographic Evidence Ledger
              </span>
              <span className="text-xs font-mono text-[#176044] font-bold">
                100% Cryptographically Sealed
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#D7E0DA] bg-[#FFFFFF] text-[10px] font-bold uppercase tracking-wider text-[#68766E]">
                  <tr>
                    <th className="py-3 pl-4">Evidence ID</th>
                    <th className="py-3">Linked Case</th>
                    <th className="py-3">Originating Alert</th>
                    <th className="py-3">Target Entity Trace</th>
                    <th className="py-3">Artifact Type</th>
                    <th className="py-3">Integrity Seal</th>
                    <th className="py-3">Date Sealed</th>
                    <th className="py-3 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D7E0DA]">
                  {filteredEvidence.map((ev) => (
                    <tr
                      key={ev.id}
                      onClick={() => {
                        setSelectedRecord(ev);
                        setShowJsonBundle(false);
                      }}
                      className="hover:bg-[#F7F9F7] transition-colors cursor-pointer"
                    >
                      <td className="py-3 pl-4 font-mono font-bold text-[#176044]">
                        {ev.id}
                      </td>
                      <td className="py-3 font-mono font-semibold text-[#17221C]">
                        {ev.case_id}
                      </td>
                      <td className="py-3 font-mono text-[#68766E]">
                        {ev.alert_id}
                      </td>
                      <td className="py-3 font-mono text-xs text-[#17221C]">
                        {ev.entity}
                      </td>
                      <td className="py-3 text-[#425148]">
                        <span className="rounded bg-[#F1F5F2] border border-[#D7E0DA] px-2 py-0.5 font-mono text-[10px] text-[#17221C]">
                          {ev.type} ({ev.records_count} records)
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="inline-flex items-center gap-1 rounded bg-[#EAF7F0] border border-[#B8DCC8] text-[#176044] px-2 py-0.5 font-mono text-[10px] font-bold">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>SHA-256 ✓</span>
                        </span>
                      </td>
                      <td className="py-3 font-mono text-[11px] text-[#68766E]">
                        {new Date(ev.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              setSelectedRecord(ev);
                              setShowJsonBundle(false);
                            }}
                            className="rounded border border-[#D7E0DA] bg-[#FFFFFF] px-2.5 py-1 text-[11px] font-bold text-[#176044] hover:bg-[#E8F4ED] transition-colors cursor-pointer"
                          >
                            Summary →
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. VIEW 2: LIVE VERIFIER TOOL ─────────────────────────────── */}
      {activeView === 'verifier' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="rounded-xl border border-[#D7E0DA] bg-[#FFFFFF] p-5 shadow-xs lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between border-b border-[#D7E0DA] pb-3">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-[#176044]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#17221C]">
                  Live Package Hash Verifier
                </h2>
              </div>
              <button
                onClick={handleTamperSimulation}
                className="text-xs font-bold text-[#B42318] hover:underline cursor-pointer"
              >
                Simulate Data Tampering →
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#68766E]">
                Canonical Evidence Package (JSON)
              </label>
              <textarea
                rows={9}
                value={bundleText}
                onChange={(e) => setBundleText(e.target.value)}
                className="w-full rounded-lg border border-[#D7E0DA] bg-[#F7F9F7] p-3 font-mono text-xs text-[#17221C] focus:border-[#176044] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#68766E]">
                Expected SHA-256 Digest Hash
              </label>
              <input
                type="text"
                value={expectedHash}
                onChange={(e) => setExpectedHash(e.target.value)}
                className="w-full rounded-lg border border-[#D7E0DA] bg-[#F7F9F7] px-3 py-2 font-mono text-xs text-[#17221C] focus:border-[#176044] focus:outline-none"
              />
            </div>

            <button
              onClick={handleVerify}
              disabled={verifying}
              className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold text-white shadow-xs cursor-pointer disabled:opacity-50"
              style={{ background: '#176044' }}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>{verifying ? 'Computing SHA-256 Hash...' : 'Verify Cryptographic Integrity'}</span>
            </button>
          </div>

          <div className="rounded-xl border border-[#D7E0DA] bg-[#FFFFFF] p-5 shadow-xs lg:col-span-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#17221C] border-b border-[#D7E0DA] pb-3">
              Verification Outcome
            </h3>

            {!verificationResult ? (
              <div className="py-16 text-center text-[#68766E]">
                Enter or edit a package and click "Verify Cryptographic Integrity" to inspect hash matches.
              </div>
            ) : verificationResult.valid ? (
              <div className="rounded-xl border border-[#BBDCCA] bg-[#E8F4ED] p-4 text-center space-y-2">
                <CheckCircle2 className="h-8 w-8 text-[#176044] mx-auto" />
                <h4 className="text-sm font-bold text-[#176044]">Integrity Verified</h4>
                <p className="text-xs text-[#17221C]">
                  Canonical SHA-256 matches expected state. Package has not been altered since generation.
                </p>
                <div className="mt-2 font-mono text-[10px] text-[#425148] break-all bg-white p-2 rounded border border-[#BBDCCA]">
                  {verificationResult.calculated_hash || expectedHash}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-[#F3B5B0] bg-[#FDECEC] p-4 text-center space-y-2">
                <AlertTriangle className="h-8 w-8 text-[#B42318] mx-auto" />
                <h4 className="text-sm font-bold text-[#B42318]">Tamper Warning Detected</h4>
                <p className="text-xs text-[#B42318]">
                  Computed SHA-256 digest does not match expected hash. One or more bytes have been modified!
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 4. CONTEXTUAL EVIDENCE SUMMARY DRAWER (Section 35) ─────────── */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity">
          <div className="w-full max-w-xl bg-[#FFFFFF] border-l border-[#D7E0DA] h-full shadow-2xl flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#D7E0DA] p-5 bg-[#F7F9F7]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#176044]">{selectedRecord.id}</span>
                  <span className="rounded bg-[#EAF7F0] border border-[#B8DCC8] text-[#176044] px-2 py-0.5 font-mono text-[10px] font-bold">
                    SHA-256 VERIFIED ✓
                  </span>
                </div>
                <h2 className="mt-1 text-base font-extrabold text-[#17221C]">
                  Evidence Package Dossier
                </h2>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#D7E0DA] bg-[#FFFFFF] text-[#68766E] hover:text-[#17221C] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1">
              {/* Evidence Overview */}
              <div className="rounded-xl border border-[#D7E0DA] bg-[#F7F9F7] p-4">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#68766E] mb-3">
                  Bundle Metadata
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#68766E]">Linked Case:</span>
                    <div className="font-mono font-bold text-[#17221C]">{selectedRecord.case_id}</div>
                  </div>
                  <div>
                    <span className="text-[#68766E]">Originating Alert:</span>
                    <div className="font-mono font-bold text-[#17221C]">{selectedRecord.alert_id}</div>
                  </div>
                  <div>
                    <span className="text-[#68766E]">Target Entity Trace:</span>
                    <div className="font-semibold text-[#176044]">{selectedRecord.entity}</div>
                  </div>
                  <div>
                    <span className="text-[#68766E]">Sealed Timestamp:</span>
                    <div className="font-mono text-[#17221C]">{new Date(selectedRecord.created_at).toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* SHA-256 Digest Box */}
              <div className="rounded-xl border border-[#D7E0DA] bg-[#FFFFFF] p-4 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#68766E]">
                    Digital Fingerprint (SHA-256)
                  </span>
                  <button
                    onClick={() => handleCopyHash(selectedRecord.hash)}
                    className="flex items-center gap-1 text-[11px] text-[#176044] hover:underline cursor-pointer"
                  >
                    {copiedHash ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedHash ? 'Copied' : 'Copy Hash'}</span>
                  </button>
                </div>
                <div className="p-2.5 rounded bg-[#F7F9F7] border border-[#D7E0DA] font-mono text-[10px] text-[#17221C] break-all">
                  {selectedRecord.hash}
                </div>
              </div>

              {/* Progressive Disclosure: Canonical JSON (Section 35) */}
              <div className="rounded-xl border border-[#D7E0DA] bg-[#FFFFFF] p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode className="h-4 w-4 text-[#176044]" />
                    <span className="text-xs font-bold text-[#17221C]">Canonical Evidence Content</span>
                  </div>
                  <button
                    onClick={() => setShowJsonBundle(!showJsonBundle)}
                    className="text-xs font-bold text-[#176044] hover:underline cursor-pointer"
                  >
                    {showJsonBundle ? 'Hide JSON' : 'View Canonical Bundle'}
                  </button>
                </div>

                {showJsonBundle && (
                  <pre className="p-3 rounded-lg bg-[#F7F9F7] border border-[#D7E0DA] font-mono text-[11px] text-[#17221C] overflow-x-auto max-h-64">
                    {bundleText}
                  </pre>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => navigate(`/investigations/${selectedRecord.alert_id}`)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold text-white shadow-xs cursor-pointer"
                  style={{ background: '#176044' }}
                >
                  <span>Open Investigation →</span>
                </button>
                <button
                  onClick={() => navigate('/cases')}
                  className="rounded-lg border border-[#D7E0DA] bg-[#FFFFFF] px-4 py-2.5 text-xs font-bold text-[#17221C] hover:bg-[#F1F5F2] cursor-pointer"
                >
                  View Case
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
