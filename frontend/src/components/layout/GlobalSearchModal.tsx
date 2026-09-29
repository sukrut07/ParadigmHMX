import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  Users,
  CreditCard,
  AlertTriangle,
  Briefcase,
  ArrowRight,
  Sparkles,
  Command,
  Flame,
  Network
} from 'lucide-react';
import { getAlerts, getEmployees, getCases, getAccounts } from '../../services/api';

interface SearchResultItem {
  id: string;
  type: 'EMPLOYEE' | 'ACCOUNT' | 'ALERT' | 'CASE' | 'ACTION';
  title: string;
  subtitle: string;
  path: string;
  risk?: string;
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Pre-configured instant navigation actions
  const defaultItems: SearchResultItem[] = [
    {
      id: 'ACTION-1',
      type: 'ACTION',
      title: 'Flagship Collusion Investigation (EMP-017)',
      subtitle: 'Jump straight to the multi-hop circular laundering investigation',
      path: '/investigations',
      risk: 'CRITICAL',
    },
    {
      id: 'EMP-017',
      type: 'EMPLOYEE',
      title: 'EMP-017 (Teller - Collusion Suspect)',
      subtitle: 'Branch BR-01 • Limit override & unauthorized contact edits',
      path: '/employees/EMP-017',
      risk: 'CRITICAL',
    },
    {
      id: 'EMP-022',
      type: 'EMPLOYEE',
      title: 'EMP-022 (Operations Analyst)',
      subtitle: 'Branch BR-02 • 42 bulk lookups in 3h (z-score > 3.5)',
      path: '/employees/EMP-022',
      risk: 'MEDIUM',
    },
    {
      id: 'ACC-0231',
      type: 'ACCOUNT',
      title: 'ACC-0231 (Compromised Target Account)',
      subtitle: 'Customer CUST-0102 • ₹9.8L outbound dissipation',
      path: '/accounts?search=ACC-0231',
      risk: 'CRITICAL',
    },
    {
      id: 'ACC-7701',
      type: 'ACCOUNT',
      title: 'ACC-7701 (Structuring / Splitting Source)',
      subtitle: 'Customer CUST-0024 • 4 transfers sub-₹50k within 2h',
      path: '/accounts?search=ACC-7701',
      risk: 'HIGH',
    },
    {
      id: 'ACC-PAYROLL-01',
      type: 'ACCOUNT',
      title: 'ACC-PAYROLL-01 (Corporate Payroll - Benign)',
      subtitle: 'Hard negative control • 30 employee recipients monthly',
      path: '/accounts?search=ACC-PAYROLL-01',
      risk: 'LOW',
    },
    {
      id: 'ACTION-2',
      type: 'ACTION',
      title: 'Adversary Red-Team Simulation',
      subtitle: 'Synthesize live fraud attack typologies in memory',
      path: '/simulation',
    },
    {
      id: 'ACTION-3',
      type: 'ACTION',
      title: 'Compliance & Evaluation Benchmark',
      subtitle: 'View precision, recall, F1, and FPR metrics against ground truth',
      path: '/evaluation',
    },
  ];

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setResults(defaultItems);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults(defaultItems);
      return;
    }

    const q = query.toLowerCase();
    const filteredDefaults = defaultItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q)
    );

    // Debounced search against live API
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const [alerts, employees, cases] = await Promise.allSettled([
          getAlerts(),
          getEmployees(),
          getCases(),
        ]);

        const dynamicItems: SearchResultItem[] = [];

        if (alerts.status === 'fulfilled' && Array.isArray(alerts.value)) {
          alerts.value
            .filter((a) => a.id.toLowerCase().includes(q) || a.title.toLowerCase().includes(q))
            .slice(0, 4)
            .forEach((a) => {
              dynamicItems.push({
                id: a.id,
                type: 'ALERT',
                title: a.title,
                subtitle: `${a.id} • ${a.tier} Risk Tier • ${a.status}`,
                path: `/investigations/${a.id}`,
                risk: a.tier,
              });
            });
        }

        if (employees.status === 'fulfilled' && Array.isArray(employees.value)) {
          employees.value
            .filter((e) => e.id.toLowerCase().includes(q) || e.pseudonym_id.toLowerCase().includes(q))
            .slice(0, 3)
            .forEach((e) => {
              dynamicItems.push({
                id: e.id,
                type: 'EMPLOYEE',
                title: `${e.id} (${e.pseudonym_id})`,
                subtitle: `Branch ${e.branch_id} • Shift: ${e.normal_work_start}-${e.normal_work_end}`,
                path: `/employees/${e.id}`,
              });
            });
        }

        if (cases.status === 'fulfilled' && Array.isArray(cases.value)) {
          cases.value
            .filter((c) => c.id.toLowerCase().includes(q) || c.title.toLowerCase().includes(q))
            .slice(0, 3)
            .forEach((c) => {
              dynamicItems.push({
                id: c.id,
                type: 'CASE',
                title: `${c.id}: ${c.title}`,
                subtitle: `Assigned: ${c.assigned_to || c.assignee_id || 'Unassigned'} • Status: ${c.status}`,
                path: `/cases?id=${c.id}`,
                risk: c.priority,
              });
            });
        }

        // Combine unique
        const combined = [...filteredDefaults];
        const existingIds = new Set(combined.map((x) => x.id));
        dynamicItems.forEach((item) => {
          if (!existingIds.has(item.id)) {
            combined.push(item);
            existingIds.add(item.id);
          }
        });

        setResults(combined);
        setSelectedIndex(0);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const handleSelect = (item: SearchResultItem) => {
    onClose();
    navigate(item.path);
  };

  const getTypeIcon = (type: SearchResultItem['type']) => {
    switch (type) {
      case 'EMPLOYEE':
        return <Users className="h-4 w-4 text-purple-400" />;
      case 'ACCOUNT':
        return <CreditCard className="h-4 w-4 text-cyan-400" />;
      case 'ALERT':
        return <AlertTriangle className="h-4 w-4 text-rose-400" />;
      case 'CASE':
        return <Briefcase className="h-4 w-4 text-amber-400" />;
      case 'ACTION':
      default:
        return <Sparkles className="h-4 w-4 text-indigo-400" />;
    }
  };

  const getRiskBadge = (risk?: string) => {
    if (!risk) return null;
    const colors: Record<string, string> = {
      CRITICAL: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      HIGH: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
      MEDIUM: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      LOW: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    };
    return (
      <span
        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
          colors[risk] || 'bg-slate-700/30 text-slate-300 border-slate-600/30'
        }`}
      >
        {risk}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-2xl rounded-xl border border-slate-800 bg-[#0c0e18] shadow-2xl shadow-indigo-950/40 overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center border-b border-slate-800 px-4 py-3.5 bg-slate-900/60">
          <Search className="h-5 w-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search across employees, accounts, alerts, cases, or actions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent px-3 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />
          {loading && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent mr-2" />
          )}
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[420px] overflow-y-auto p-2 divide-y divide-slate-800/40">
          {results.length === 0 ? (
            <div className="py-12 text-center">
              <Search className="mx-auto h-8 w-8 text-slate-400" />
              <p className="mt-2 text-sm text-slate-400">No matching entities found for "{query}"</p>
              <p className="text-xs text-slate-400">Try searching for EMP-017, ACC-0231, or ALT-</p>
            </div>
          ) : (
            results.map((item, idx) => (
              <div
                key={`${item.type}-${item.id}-${idx}`}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`flex items-center justify-between rounded-lg px-3 py-2.5 cursor-pointer transition-colors ${
                  selectedIndex === idx
                    ? 'bg-indigo-600/15 border border-indigo-500/30 text-white'
                    : 'hover:bg-slate-800/50 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-800/70 border border-slate-700/50">
                    {getTypeIcon(item.type)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold truncate text-slate-100">{item.title}</span>
                      {getRiskBadge(item.risk)}
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-1 py-0.2 rounded bg-slate-800/60">
                        {item.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{item.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-slate-400 shrink-0 ml-3">
                  {selectedIndex === idx && (
                    <span className="text-[10px] font-mono text-indigo-400 mr-1">Press Enter</span>
                  )}
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between border-t border-slate-800 px-4 py-2 bg-slate-950/70 text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-300">↑↓</kbd> Navigate
            </span>
            <span>
              <kbd className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-300">↵</kbd> Select
            </span>
            <span>
              <kbd className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-300">ESC</kbd> Close
            </span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <Command className="h-3 w-3" />
            <span>+ K</span>
          </div>
        </div>
      </div>
    </div>
  );
};
