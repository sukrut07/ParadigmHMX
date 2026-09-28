import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Search,
  Filter,
  RefreshCw,
  Plus,
  MessageSquare,
  FileCheck2,
  Download,
  AlertTriangle,
  Clock,
  User,
  ArrowRight,
  Send
} from 'lucide-react';
import { getCases, getCase, updateCase, addCaseNote, exportCaseBundle } from '../services/api';
import { Case } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';

export const CasesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [exporting, setExporting] = useState(false);

  const statusFilter = searchParams.get('status') || '';
  const [searchTerm, setSearchTerm] = useState('');

  const loadCases = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getCases(statusFilter || undefined);
      setCases(res);
      if (res.length > 0 && !selectedCase) {
        setSelectedCase(res[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load case files');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, [statusFilter]);

  const updateStatusFilter = (st: string) => {
    const next = new URLSearchParams(searchParams);
    if (st) next.set('status', st);
    else next.delete('status');
    setSearchParams(next);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedCase) return;
    try {
      const updated = await updateCase(selectedCase.id, { status: newStatus });
      setSelectedCase(updated);
      setCases((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
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
      setExporting(true);
      const res = await exportCaseBundle(selectedCase.id, format);
      if (format === 'json') {
        const blob = new Blob([JSON.stringify(res, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Case_Evidence_${selectedCase.id}.json`;
        a.click();
      } else {
        const url = URL.createObjectURL(res);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Case_Dossier_${selectedCase.id}.pdf`;
        a.click();
      }
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    } finally {
      setExporting(false);
    }
  };

  const filteredCases = cases.filter((c) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        c.id.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        (c.alert_id && c.alert_id.toLowerCase().includes(q))
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
              Operations
            </span>
            <span className="text-xs text-slate-400">Formal Case Management</span>
          </div>
          <h1 className="mt-0.5 text-base font-bold text-slate-100">
            Case Files & Adjudication Pipeline
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
                placeholder="Search case ID, title, alert..."
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
                    onClick={() => setSelectedCase(c)}
                    className={`cursor-pointer p-4 transition-all ${
                      isSelected
                        ? 'border-l-2 border-cyan-500 bg-cyan-950/20'
                        : 'hover:bg-slate-900/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-cyan-400">{c.id}</span>
                      <RiskBadge tier={c.priority} size="sm" />
                    </div>
                    <h3 className="mt-1 text-xs font-semibold text-slate-200 line-clamp-1">{c.title}</h3>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>Alert: {c.alert_id}</span>
                      <span className="rounded bg-slate-800 px-1.5 py-0.5 uppercase text-slate-300">
                        {c.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Case Detail & Adjudication */}
        <div className="col-span-7 flex flex-col bg-[#090a0f] overflow-hidden">
          {selectedCase ? (
            <div className="flex flex-col h-full overflow-y-auto p-6 space-y-6 custom-scrollbar">
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
                  <h2 className="mt-1 text-base font-bold text-slate-100">{selectedCase.title}</h2>
                  <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                    <span>Assigned to: <strong className="text-slate-200">{selectedCase.assigned_to || 'Analyst 07'}</strong></span>
                    <span>·</span>
                    <span>Created: {new Date(selectedCase.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExport('json')}
                    disabled={exporting}
                    className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Export JSON</span>
                  </button>
                  <button
                    onClick={() => handleExport('pdf')}
                    disabled={exporting}
                    className="flex items-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-950/20 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-950/40"
                  >
                    <FileCheck2 className="h-3.5 w-3.5" />
                    <span>Dossier PDF</span>
                  </button>
                </div>
              </div>

              {/* Linked Alert Reference Card */}
              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <div>
                  <span className="text-[11px] font-mono text-slate-400">ORIGINATING ALERT</span>
                  <div className="mt-1 font-mono text-sm font-bold text-cyan-300">{selectedCase.alert_id}</div>
                </div>
                <button
                  onClick={() => navigate(`/investigations/${selectedCase.alert_id}`)}
                  className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-cyan-500 shadow-md shadow-cyan-900/30"
                >
                  <span>Open in Investigation Workspace</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Status Transition Selector */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                <span className="text-xs font-bold text-slate-200">Adjudication Lifecycle</span>
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
                      onClick={() => handleStatusChange(btn.st)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                        selectedCase.status === btn.st
                          ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Investigation Notes Thread */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                  <MessageSquare className="h-4 w-4 text-cyan-400" />
                  <span className="text-xs font-bold text-slate-200">Investigator Notes & Audit Thread</span>
                </div>

                <div className="space-y-3 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                  {(selectedCase.notes_json || []).length === 0 ? (
                    <div className="text-xs text-slate-500 py-2">No notes added yet.</div>
                  ) : (
                    selectedCase.notes_json?.map((note, idx) => (
                      <div key={note.id || idx} className="rounded-lg border border-slate-800/60 bg-slate-950/60 p-3 text-xs">
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                          <span className="font-semibold text-slate-200">{note.author}</span>
                          <span>{new Date(note.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="mt-1 text-slate-300">{note.text}</p>
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
                    className="flex items-center gap-1 rounded-lg bg-cyan-600 px-3 py-2 text-xs font-bold text-white hover:bg-cyan-500 disabled:opacity-50"
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
    </div>
  );
};
