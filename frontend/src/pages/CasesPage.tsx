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
} from 'lucide-react';
import { getCases, getCase, updateCase, addCaseNote, exportCaseBundle, getAlertDetail } from '../services/api';
import { Case, AlertDetail } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';

const AVAILABLE_REVIEWERS = [
  'Analyst Priya Sharma (Fraud Operations)',
  'Reviewer Vikram Seth (Senior AML Review)',
  'Senior Investigator Ananya Rao (Insider Risk Intelligence)',
  'Compliance Officer Kabir Mehta (Legal & SAR Compliance)',
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
    if (newStatus === 'CLOSED_CONFIRMED' || newStatus === 'CLOSED_FALSE_POSITIVE') {
      setPendingStatus(newStatus);
      setClosureReason('');
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
      alert(`Status update failed: ${err.message}`);
    }
  };

  const handleAddNote = async () => {
    if (!selectedCase || !newNote.trim()) return;
    try {
      setAddingNote(true);
      await addCaseNote(selectedCase.id, newNote);
      // Reload current case details
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

  const handleExport = async (format: 'json' | 'pdf' = 'json') => {
    if (!selectedCase) return;
    try {
      if (format === 'json') {
        setExportingJson(true);
        const res = await exportCaseBundle(selectedCase.id, 'json');
        const blob = new Blob([JSON.stringify(res.bundle || res, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Case_Evidence_${selectedCase.id}.json`;
        a.click();
      } else {
        setExportingPdf(true);
        const res = await exportCaseBundle(selectedCase.id, 'pdf');
        const url = URL.createObjectURL(res);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Case_Dossier_${selectedCase.id}.pdf`;
        a.click();
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
        (c.assigned_to && c.assigned_to.toLowerCase().includes(q)) ||
        (c.assignee_id && c.assignee_id.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-[#0d0f17] px-6 py-3 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider text-blue-400 uppercase">
              Adjudication Pipeline
            </span>
            <span className="text-xs text-slate-400">Reviewer Assignment & Case Tracking</span>
          </div>
          <h1 className="mt-0.5 text-base font-bold text-slate-100">
            Case Files & Evidence Export
          </h1>
        </div>

        <button
          onClick={loadCases}
          className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-700 hover:text-slate-100 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="bg-rose-500/10 border-b border-rose-500/30 px-6 py-2 text-xs text-rose-400 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-200">✕</button>
        </div>
      )}

      {/* Main Split Layout: Left Queue (5 cols), Right Detail (7 cols) */}
      <div className="grid grid-cols-12 flex-1 overflow-hidden">
        {/* Left Column: Case List */}
        <div className="col-span-5 border-r border-slate-800 flex flex-col bg-[#0b0d14] overflow-hidden">
          {/* Status Tabs & Search */}
          <div className="p-3 border-b border-slate-800 space-y-2 bg-slate-900/40">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search case ID, title, reviewer, alert..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
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
                  className={`rounded px-2.5 py-1 transition-colors ${
                    statusFilter === pill.val
                      ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cases Scroll Area */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 custom-scrollbar">
            {loading ? (
              <div className="flex h-40 items-center justify-center text-xs text-slate-400">
                Loading cases...
              </div>
            ) : filteredCases.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
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
                        ? 'border-l-4 border-cyan-500 bg-cyan-950/20'
                        : 'hover:bg-slate-900/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <RiskBadge tier={c.priority} size="sm" />
                        <span className="font-mono text-xs font-bold text-cyan-400">{c.id}</span>
                      </div>
                      <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono uppercase text-slate-300">
                        {c.status}
                      </span>
                    </div>

                    <h3 className="mt-1.5 text-xs font-semibold text-slate-200 line-clamp-1">
                      {c.title || `Case ${c.id}`}
                    </h3>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>Alert: {c.alert_id}</span>
                      <span className="text-slate-300 truncate max-w-[150px]">
                        👤 {c.assigned_to || c.assignee_id || 'Unassigned'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Case Detail, Reviewer Assignment & Adjudication */}
        <div className="col-span-7 flex flex-col bg-[#090a0f] overflow-hidden">
          {selectedCase ? (
            <div className="flex flex-col h-full overflow-y-auto p-6 space-y-5 custom-scrollbar">
              {/* Case Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-400">{selectedCase.id}</span>
                    <RiskBadge tier={selectedCase.priority} size="md" />
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-xs font-mono uppercase text-slate-300">
                      {selectedCase.status}
                    </span>
                  </div>
                  <h2 className="mt-1.5 text-base font-bold text-slate-100">
                    {selectedCase.title || `Investigation Case ${selectedCase.id}`}
                  </h2>
                  <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                    <span>Created: {new Date(selectedCase.created_at).toLocaleDateString()}</span>
                    {selectedCase.closed_at && (
                      <>
                        <span>·</span>
                        <span className="text-emerald-400">Closed: {new Date(selectedCase.closed_at).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions: Export Bundle */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExport('json')}
                    disabled={exportingJson}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>{exportingJson ? 'Exporting...' : 'Export JSON'}</span>
                  </button>
                  <button
                    onClick={() => handleExport('pdf')}
                    disabled={exportingPdf}
                    className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/30 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-950/50 transition-colors"
                  >
                    <FileCheck2 className="h-3.5 w-3.5" />
                    <span>{exportingPdf ? 'Generating...' : 'Dossier PDF'}</span>
                  </button>
                </div>
              </div>

              {/* REVIEWER ASSIGNMENT CARD */}
              <div className="rounded-xl border border-cyan-900/40 bg-slate-900/70 p-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-cyan-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Case Assignment & Reviewer
                    </span>
                  </div>
                  <span className="rounded bg-cyan-950/80 border border-cyan-500/40 px-2 py-0.5 text-[10px] font-mono text-cyan-300">
                    Active Adjudication
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex-1 min-w-[240px]">
                    <label className="text-[11px] font-semibold text-slate-400">Assigned Reviewer / Investigator:</label>
                    <select
                      value={selectedCase.assigned_to || selectedCase.assignee_id || AVAILABLE_REVIEWERS[0]}
                      onChange={(e) => handleAssignReviewer(e.target.value)}
                      disabled={assigningReviewer}
                      className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                    >
                      {AVAILABLE_REVIEWERS.map((rev) => (
                        <option key={rev} value={rev}>
                          {rev}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="text-[11px] text-slate-400">
                    <div>Adjudication Priority: <strong className="text-slate-200">{selectedCase.priority}</strong></div>
                    <div>Lifecycle Status: <strong className="text-cyan-400">{selectedCase.status}</strong></div>
                  </div>
                </div>
              </div>

              {/* LINKED ALERT & EVIDENCE SUMMARY */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-orange-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Linked Alert Dossier
                    </span>
                  </div>

                  <button
                    onClick={() => navigate(`/investigations/${selectedCase.alert_id}`)}
                    className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500 shadow-md transition-colors"
                  >
                    <span>Full Forensic Workspace (Graph & Timeline)</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                {loadingAlert ? (
                  <div className="text-xs text-slate-500 py-2">Loading originating alert details...</div>
                ) : linkedAlert ? (
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-cyan-400">{linkedAlert.id}</span>
                      <RiskBadge tier={linkedAlert.tier} size="sm" />
                      <span className="font-semibold text-slate-200">{linkedAlert.title}</span>
                    </div>

                    <p className="text-[11px] leading-relaxed text-slate-300 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                      {linkedAlert.summary}
                    </p>

                    {/* Multi-factor badges */}
                    {linkedAlert.rule_trace?.risk_factors && (
                      <div className="pt-1 flex flex-wrap gap-2 text-[10px] font-mono">
                        {Object.entries(linkedAlert.rule_trace.risk_factors).map(([k, item]: [string, any]) => (
                          <span
                            key={k}
                            className="rounded bg-slate-950 border border-slate-800 px-2 py-1 text-slate-300"
                          >
                            <span className="text-slate-500">{item.title}:</span>{' '}
                            <strong className="text-cyan-400">{item.level} ({item.score}%)</strong>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400">
                    Originating Alert: <span className="font-mono text-cyan-400">{selectedCase.alert_id}</span>
                  </div>
                )}
              </div>

              {/* Status Transition Selector */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                <span className="text-xs font-bold text-slate-200">Adjudication Lifecycle Transitions</span>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    { st: 'OPEN', label: 'Open' },
                    { st: 'IN_REVIEW', label: 'Move to In-Review' },
                    { st: 'ESCALATED', label: 'Escalate to Compliance' },
                    { st: 'CLOSED_CONFIRMED', label: 'Close (Confirmed Fraud)' },
                    { st: 'CLOSED_FALSE_POSITIVE', label: 'Close (False Positive)' },
                  ].map((btn) => (
                    <button
                      key={btn.st}
                      onClick={() => handleStatusChangeClick(btn.st)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                        selectedCase.status === btn.st
                          ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 shadow-sm'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>

                {selectedCase.closure_reason && (
                  <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-300">
                    <span className="text-[11px] font-mono uppercase text-slate-500">Documented Closure Reason:</span>
                    <p className="mt-0.5 text-slate-200">{selectedCase.closure_reason}</p>
                  </div>
                )}
              </div>

              {/* Investigation Notes Thread */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                  <MessageSquare className="h-4 w-4 text-cyan-400" />
                  <span className="text-xs font-bold text-slate-200">Investigator Notes & Audit Thread</span>
                </div>

                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                  {((selectedCase.notes || selectedCase.notes_json || []).length === 0) ? (
                    <div className="text-xs text-slate-500 py-2">No reviewer notes recorded yet.</div>
                  ) : (
                    (selectedCase.notes || selectedCase.notes_json || []).map((note, idx) => (
                      <div key={idx} className="rounded-lg border border-slate-800/60 bg-slate-950/60 p-3 text-xs">
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                          <span className="font-semibold text-slate-200">{note.author}</span>
                          <span>{new Date(note.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="mt-1 text-slate-300 leading-relaxed">{note.text}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Note Input */}
                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Add an investigation finding or compliance rationale..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                    className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                  <button
                    onClick={handleAddNote}
                    disabled={addingNote || !newNote.trim()}
                    className="flex items-center gap-1 rounded-lg bg-cyan-600 px-3 py-2 text-xs font-bold text-white hover:bg-cyan-500 disabled:opacity-50 transition-colors"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Post</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-slate-500">
              Select a case from the queue to view adjudication details.
            </div>
          )}
        </div>
      </div>

      {/* Closure Justification Modal */}
      {closureModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <h4 className="text-sm font-bold text-slate-100">
              Document Closure Justification ({pendingStatus})
            </h4>
            <p className="mt-1 text-xs text-slate-400">
              Regulatory compliance requires mandatory reviewer justification and documentation before resolving or dismissing cases.
            </p>

            <div className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-slate-300">Mandatory Closure Reason *</label>
                <textarea
                  rows={3}
                  placeholder="State the conclusive determination (e.g., 'Confirmed collusion between EMP-017 and mule accounts' or 'Verified legitimate client business disbursement')..."
                  value={closureReason}
                  onChange={(e) => setClosureReason(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300">Reviewer Audit Note (Optional)</label>
                <input
                  type="text"
                  placeholder="Additional audit trail notes..."
                  value={closureNote}
                  onChange={(e) => setClosureNote(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <button
                onClick={() => setClosureModalOpen(false)}
                className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => executeStatusTransition(pendingStatus, closureReason, closureNote)}
                disabled={!closureReason.trim() || closureReason.trim().length < 5}
                className="rounded-lg bg-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-500 disabled:opacity-50"
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
