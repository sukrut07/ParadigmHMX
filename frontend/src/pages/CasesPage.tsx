import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  RefreshCw,
  MessageSquare,
  FileCheck2,
  Download,
  Send,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User
} from 'lucide-react';
import { getCases, getCase, updateCase, addCaseNote, exportCaseBundle, getAlertDetail } from '../services/api';
import { Case, AlertDetail } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';

const AVAILABLE_REVIEWERS = [
  'Priya Sharma (Fraud Operations)',
  'Vikram Seth (Senior AML Review)',
  'Ananya Rao (Insider Risk Intelligence)',
  'Kabir Mehta (Legal & Compliance)',
];

export const CasesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [linkedAlert, setLinkedAlert] = useState<AlertDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingAlert, setLoadingAlert] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [exportingJson, setExportingJson] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [assigningReviewer, setAssigningReviewer] = useState(false);

  // Closure modal state
  const [closureModalOpen, setClosureModalOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string>('');
  const [closureReason, setClosureReason] = useState('');
  const [closureNote, setClosureNote] = useState('');

  const statusFilter = searchParams.get('status') || '';
  const [searchTerm, setSearchTerm] = useState('');

  const loadCases = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getCases(statusFilter || undefined);
      setCases(res);
      if (res.length > 0) {
        const curr = selectedCase ? res.find((c) => c.id === selectedCase.id) || res[0] : res[0];
        setSelectedCase(curr);
        loadLinkedAlert(curr.alert_id);
      } else {
        setSelectedCase(null);
        setLinkedAlert(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load case files');
    } finally {
      setLoading(false);
    }
  };

  const loadLinkedAlert = async (alertId: string) => {
    if (!alertId) return;
    try {
      setLoadingAlert(true);
      const detail = await getAlertDetail(alertId);
      setLinkedAlert(detail);
    } catch (err) {
      console.error('Failed to load linked alert for case:', err);
    } finally {
      setLoadingAlert(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, [statusFilter]);

  const handleSelectCase = (c: Case) => {
    setSelectedCase(c);
    loadLinkedAlert(c.alert_id);
  };

  const updateStatusFilter = (st: string) => {
    const next = new URLSearchParams(searchParams);
    if (st) next.set('status', st);
    else next.delete('status');
    setSearchParams(next);
  };

  const handleAssignReviewer = async (newAssignee: string) => {
    if (!selectedCase) return;
    try {
      setAssigningReviewer(true);
      const updated = await updateCase(selectedCase.id, {
        assigned_to: newAssignee,
      });
      setSelectedCase(updated);
      setCases((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    } catch (err: any) {
      alert(`Assignment failed: ${err.message}`);
    } finally {
      setAssigningReviewer(false);
    }
  };

  const handleStatusChangeClick = (newStatus: string) => {
    if (!selectedCase) return;
    if (newStatus === 'CLOSED_CONFIRMED' || newStatus === 'CLOSED_FALSE_POSITIVE' || newStatus === 'CLOSED') {
      setPendingStatus(newStatus);
      setClosureReason('Investigation complete - confirmed fraud signatures matched');
      setClosureNote('');
      setClosureModalOpen(true);
    } else {
      executeStatusTransition(newStatus);
    }
  };

  const executeStatusTransition = async (newStatus: string, reason?: string, note?: string) => {
    if (!selectedCase) return;
    try {
      const updated = await updateCase(selectedCase.id, {
        status: newStatus,
        closure_reason: reason,
        note: note,
      });
      setSelectedCase(updated);
      setCases((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setClosureModalOpen(false);
    } catch (err: any) {
      alert(`Failed to transition case status: ${err.message}`);
    }
  };

  const handleAddNote = async () => {
    if (!selectedCase || !newNote.trim()) return;
    try {
      setAddingNote(true);
      await addCaseNote(selectedCase.id, newNote.trim());
      const refreshed = await getCase(selectedCase.id);
      setSelectedCase(refreshed);
      setCases((prev) => prev.map((c) => (c.id === refreshed.id ? refreshed : c)));
      setNewNote('');
    } catch (err: any) {
      alert(`Failed to add note: ${err.message}`);
    } finally {
      setAddingNote(false);
    }
  };

  const handleExport = async (format: 'json' | 'pdf') => {
    if (!selectedCase) return;
    try {
      if (format === 'json') {
        setExportingJson(true);
        const bundle = await exportCaseBundle(selectedCase.id, 'json');
        const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `case_${selectedCase.id}_canonical_evidence.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        setExportingPdf(true);
        const blob = await exportCaseBundle(selectedCase.id, 'pdf');
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `case_${selectedCase.id}_forensic_dossier.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    } finally {
      setExportingJson(false);
      setExportingPdf(false);
    }
  };

  const filteredCases = cases.filter((c) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        c.id.toLowerCase().includes(q) ||
        (c.title && c.title.toLowerCase().includes(q)) ||
        (c.alert_id && c.alert_id.toLowerCase().includes(q)) ||
        (c.assigned_to && c.assigned_to.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Lifecycle stage mapping (Section 33)
  const getLifecycleStage = (status?: string) => {
    const s = (status || '').toUpperCase();
    if (s.startsWith('CLOSED')) return 4;
    if (s === 'ESCALATED') return 3;
    if (s === 'IN_REVIEW') return 2;
    if (s === 'OPEN') return 1;
    return 0; // DETECTED
  };

  const currentStage = getLifecycleStage(selectedCase?.status);

  return (
    <div className="flex flex-col h-[calc(100vh-3.75rem)] bg-[#F7F9F7] overflow-hidden">
      {/* ── Top Header ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-[#D7E0DA] bg-[#FFFFFF] px-6 py-3 shrink-0 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-[#E8F4ED] border border-[#BBDCCA] px-2.5 py-0.5 text-[10px] font-mono font-bold tracking-wider text-[#176044] uppercase">
              Adjudication Operations
            </span>
            <span className="text-xs text-[#68766E] font-mono">Case Assignment &amp; Escalation</span>
          </div>
          <h1 className="mt-0.5 text-base font-black text-[#17221C]">
            Case Management Center
          </h1>
        </div>

        <button
          onClick={loadCases}
          className="flex items-center gap-1.5 rounded-lg border border-[#D7E0DA] bg-[#FFFFFF] px-3 py-1.5 text-xs font-bold text-[#17221C] hover:bg-[#F1F5F2] hover:border-[#B8C6BD] transition-colors cursor-pointer shadow-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-[#425148] ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="bg-[#FDECEC] border-b border-[#F3B5B0] px-6 py-2 text-xs text-[#B42318] flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-[#B42318] hover:underline">✕</button>
        </div>
      )}

      {/* ── Split Layout: Left Cases Queue (5 cols), Right Workspace (7 cols) ── */}
      <div className="grid grid-cols-12 flex-1 overflow-hidden">
        {/* Left Column: Case Queue */}
        <div className="col-span-12 md:col-span-5 border-r border-[#D7E0DA] flex flex-col bg-[#FFFFFF] overflow-hidden">
          {/* Status Filter Tabs & Search */}
          <div className="p-3 border-b border-[#D7E0DA] space-y-2.5 bg-[#F7F9F7]">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#68766E]" />
              <input
                type="text"
                placeholder="Search case ID, title, reviewer, alert..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-[#D7E0DA] bg-[#FFFFFF] pl-9 pr-3 py-1.5 text-xs text-[#17221C] placeholder-[#68766E] focus:border-[#176044] focus:outline-none"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-1 text-[11px] font-mono">
              {[
                { label: 'ALL', val: '' },
                { label: 'OPEN', val: 'OPEN' },
                { label: 'IN REVIEW', val: 'IN_REVIEW' },
                { label: 'ESCALATED', val: 'ESCALATED' },
                { label: 'CLOSED', val: 'CLOSED' },
              ].map((pill) => (
                <button
                  key={pill.label}
                  onClick={() => updateStatusFilter(pill.val)}
                  className={`rounded px-2.5 py-1 transition-all cursor-pointer font-bold ${
                    statusFilter === pill.val
                      ? 'bg-[#176044] text-white shadow-xs'
                      : 'bg-[#FFFFFF] text-[#425148] border border-[#D7E0DA] hover:bg-[#F1F5F2]'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cases Scroll Area */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#D7E0DA]">
            {loading ? (
              <div className="flex h-40 items-center justify-center text-xs text-[#68766E]">
                Loading cases...
              </div>
            ) : filteredCases.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#68766E]">
                No cases found matching filter.
              </div>
            ) : (
              filteredCases.map((c) => {
                const isSelected = selectedCase?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => handleSelectCase(c)}
                    className={`cursor-pointer p-4 transition-all ${
                      isSelected
                        ? 'border-l-4 border-[#176044] bg-[#E8F4ED]/50'
                        : 'hover:bg-[#F7F9F7]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <RiskBadge tier={c.priority} size="sm" />
                        <span className="font-mono text-xs font-bold text-[#176044]">{c.id}</span>
                      </div>
                      <span className="rounded bg-[#F1F5F2] border border-[#D7E0DA] px-2 py-0.5 text-[10px] font-mono font-bold uppercase text-[#17221C]">
                        {c.status}
                      </span>
                    </div>

                    <h3 className="mt-1.5 text-xs font-semibold text-[#17221C] line-clamp-1">
                      {c.title || `Case ${c.id}`}
                    </h3>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-[#68766E] font-mono">
                      <span>Alert: {c.alert_id}</span>
                      <span className="text-[#17221C] font-semibold truncate max-w-[150px]">
                        👤 {c.assigned_to || c.assignee_id || 'Unassigned'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Case Detail, Lifecycle & Adjudication */}
        <div className="col-span-12 md:col-span-7 flex flex-col bg-[#F7F9F7] overflow-hidden">
          {selectedCase ? (
            <div className="flex flex-col h-full overflow-y-auto p-6 space-y-5">
              {/* 1. Case Header & Export Buttons */}
              <div className="rounded-xl border border-[#D7E0DA] bg-[#FFFFFF] p-5 shadow-xs">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#176044]">{selectedCase.id}</span>
                      <RiskBadge tier={selectedCase.priority} size="md" />
                      <span className="rounded bg-[#F1F5F2] border border-[#D7E0DA] px-2 py-0.5 text-[10px] font-mono font-bold uppercase text-[#17221C]">
                        {selectedCase.status}
                      </span>
                    </div>
                    <h2 className="mt-2 text-base font-black text-[#17221C]">
                      {selectedCase.title || `Investigation Case ${selectedCase.id}`}
                    </h2>
                    <div className="mt-1 flex items-center gap-3 text-xs text-[#68766E]">
                      <span>Opened: {new Date(selectedCase.created_at).toLocaleDateString()}</span>
                      {selectedCase.closed_at && (
                        <span>· Closed: {new Date(selectedCase.closed_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleExport('json')}
                      disabled={exportingJson}
                      className="flex items-center gap-1.5 rounded-lg border border-[#D7E0DA] bg-[#FFFFFF] px-3 py-1.5 text-xs font-bold text-[#17221C] hover:bg-[#F1F5F2] transition-colors cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>{exportingJson ? 'Exporting...' : 'Export JSON'}</span>
                    </button>
                    <button
                      onClick={() => handleExport('pdf')}
                      disabled={exportingPdf}
                      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-white transition-all shadow-xs cursor-pointer"
                      style={{ background: '#176044' }}
                    >
                      <FileCheck2 className="h-3.5 w-3.5" />
                      <span>{exportingPdf ? 'Generating...' : 'Dossier PDF'}</span>
                    </button>
                  </div>
                </div>

                {/* 2. Visual Case Lifecycle Progress Bar (Section 33) */}
                <div className="mt-5 pt-4 border-t border-[#D7E0DA]">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#68766E] mb-2.5">
                    Case Lifecycle Progression
                  </div>
                  <div className="grid grid-cols-5 gap-2 text-center text-xs">
                    {[
                      { idx: 0, label: 'DETECTED' },
                      { idx: 1, label: 'OPEN' },
                      { idx: 2, label: 'IN REVIEW' },
                      { idx: 3, label: 'ESCALATED' },
                      { idx: 4, label: 'RESOLVED' },
                    ].map((step) => {
                      const isActive = currentStage >= step.idx;
                      const isCurrent = currentStage === step.idx;
                      return (
                        <div
                          key={step.idx}
                          className={`p-2 rounded-lg border text-[11px] font-mono font-bold transition-all ${
                            isCurrent
                              ? 'bg-[#176044] text-white border-[#176044] shadow-xs'
                              : isActive
                              ? 'bg-[#E8F4ED] text-[#176044] border-[#BBDCCA]'
                              : 'bg-[#F7F9F7] text-[#68766E] border-[#D7E0DA]'
                          }`}
                        >
                          {step.label}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 3. Reviewer Assignment & Status Actions */}
              <div className="rounded-xl border border-[#D7E0DA] bg-[#FFFFFF] p-4 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D7E0DA] pb-3">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-[#176044]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#17221C]">
                      Case Assignment &amp; Adjudication Actions
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-[11px] font-semibold text-[#68766E] block mb-1.5">Assigned Investigator:</label>
                    <select
                      value={selectedCase.assigned_to || selectedCase.assignee_id || AVAILABLE_REVIEWERS[0]}
                      onChange={(e) => handleAssignReviewer(e.target.value)}
                      disabled={assigningReviewer}
                      className="w-full rounded-lg border border-[#D7E0DA] bg-[#FFFFFF] px-3 py-2 text-xs font-semibold text-[#17221C] focus:border-[#176044] focus:outline-none cursor-pointer"
                    >
                      {AVAILABLE_REVIEWERS.map((rev) => (
                        <option key={rev} value={rev}>{rev}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#68766E] block mb-1.5">Change Case Status:</label>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => handleStatusChangeClick('IN_REVIEW')}
                        className="rounded px-2.5 py-1.5 text-[11px] font-bold border border-[#D7E0DA] bg-[#FFFFFF] text-[#17221C] hover:bg-[#F1F5F2] cursor-pointer"
                      >
                        In Review
                      </button>
                      <button
                        onClick={() => handleStatusChangeClick('ESCALATED')}
                        className="rounded px-2.5 py-1.5 text-[11px] font-bold border border-[#F3B5B0] bg-[#FDECEC] text-[#B42318] hover:bg-[#FCD8D8] cursor-pointer"
                      >
                        Escalate
                      </button>
                      <button
                        onClick={() => handleStatusChangeClick('CLOSED_CONFIRMED')}
                        className="rounded px-2.5 py-1.5 text-[11px] font-bold border border-[#BBDCCA] bg-[#E8F4ED] text-[#176044] hover:bg-[#D5EFE0] cursor-pointer"
                      >
                        Close (Confirmed)
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Linked Alert & Full Workspace CTA */}
              <div className="rounded-xl border border-[#D7E0DA] bg-[#FFFFFF] p-4 shadow-xs flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#68766E]">Linked Forensic Dossier</div>
                  <div className="text-xs font-bold text-[#17221C] mt-0.5">{selectedCase.alert_id}</div>
                </div>

                <button
                  onClick={() => navigate(`/investigations/${selectedCase.alert_id}`)}
                  className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold text-white shadow-xs cursor-pointer"
                  style={{ background: '#176044' }}
                >
                  <span>Open Investigation →</span>
                </button>
              </div>

              {/* 5. Case Notes & Activity Stream */}
              <div className="rounded-xl border border-[#D7E0DA] bg-[#FFFFFF] p-4 shadow-xs space-y-3">
                <div className="flex items-center gap-2 border-b border-[#D7E0DA] pb-2.5">
                  <MessageSquare className="h-4 w-4 text-[#176044]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#17221C]">
                    Adjudication Notes &amp; Observations
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add investigation note or regulatory finding..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                      className="flex-1 rounded-lg border border-[#D7E0DA] bg-[#FFFFFF] px-3 py-2 text-xs text-[#17221C] placeholder-[#68766E] focus:border-[#176044] focus:outline-none"
                    />
                    <button
                      onClick={handleAddNote}
                      disabled={addingNote || !newNote.trim()}
                      className="rounded-lg bg-[#176044] px-4 py-2 text-xs font-bold text-white hover:bg-[#124532] disabled:opacity-50 cursor-pointer"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-[#68766E]">
              Select a case file from the queue to adjudicate.
            </div>
          )}
        </div>
      </div>

      {/* Closure Confirmation Modal */}
      {closureModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl border border-[#D7E0DA] bg-[#FFFFFF] p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-[#17221C]">Confirm Case Closure</h3>
            <p className="text-xs text-[#425148]">
              Are you sure you want to mark this case as <strong>{pendingStatus}</strong>?
            </p>
            <textarea
              placeholder="Mandatory closure reason & formal justification..."
              value={closureReason}
              onChange={(e) => setClosureReason(e.target.value)}
              className="w-full rounded-lg border border-[#D7E0DA] p-3 text-xs text-[#17221C] focus:border-[#176044] focus:outline-none h-24"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setClosureModalOpen(false)}
                className="rounded-lg border border-[#D7E0DA] px-3.5 py-1.5 text-xs font-semibold text-[#68766E] hover:bg-[#F1F5F2]"
              >
                Cancel
              </button>
              <button
                onClick={() => executeStatusTransition(pendingStatus, closureReason, closureNote)}
                disabled={!closureReason.trim()}
                className="rounded-lg bg-[#176044] text-white px-4 py-1.5 text-xs font-bold hover:bg-[#124532] disabled:opacity-50"
              >
                Confirm Closure
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
