import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Search,
  LayoutDashboard,
  AlertTriangle,
  Network,
  Users,
  CreditCard,
  Briefcase,
  FileCheck2,
  BarChart3,
  Flame,
  ChevronDown,
  Sparkles,
  Command,
  X,
  ArrowRight,
  ShieldCheck,
  Building2,
  Clock
} from 'lucide-react';
import { UserRole } from '../../types';

interface ShellProps {
  children: React.ReactNode;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const Shell: React.FC<ShellProps> = ({ children, currentRole, onRoleChange }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Keyboard shortcut Cmd/Ctrl + K for global search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getDashboardPath = () => {
    if (currentRole === 'FRAUD_ANALYST') return '/dashboard/fraud';
    if (currentRole === 'INTERNAL_AUDITOR') return '/dashboard/audit';
    return '/dashboard/compliance';
  };

  const navGroups = [
    {
      group: 'OVERVIEW',
      items: [
        { label: 'Dashboard', path: getDashboardPath(), icon: LayoutDashboard },
      ],
    },
    {
      group: 'INVESTIGATE',
      items: [
        { label: 'Alert Queue', path: '/alerts', icon: AlertTriangle },
        { label: 'Investigations', path: '/investigations', icon: Network },
      ],
    },
    {
      group: 'ENTITIES',
      items: [
        { label: 'Employees & Risk', path: '/employees', icon: Users },
        { label: 'Accounts & Mules', path: '/accounts', icon: CreditCard },
      ],
    },
    {
      group: 'OPERATIONS',
      items: [
        { label: 'Case Management', path: '/cases', icon: Briefcase },
        { label: 'Evidence Center', path: '/evidence', icon: FileCheck2 },
      ],
    },
    {
      group: 'ANALYTICS',
      items: [
        { label: 'Evaluation Metrics', path: '/evaluation', icon: BarChart3 },
        { label: 'Red-Team Simulator', path: '/simulation', icon: Flame },
      ],
    },
  ];

  // Search shortcuts
  const quickSearches = [
    { type: 'EMPLOYEE', id: 'EMP-017', desc: 'Critical Risk Teller (Collusion)', path: '/employees/EMP-017' },
    { type: 'EMPLOYEE', id: 'EMP-022', desc: 'Operations Officer (Bulk Lookup Anomaly)', path: '/employees/EMP-022' },
    { type: 'ACCOUNT', id: 'ACC-0231', desc: 'Compromised Target Account', path: '/accounts?search=ACC-0231' },
    { type: 'ACCOUNT', id: 'ACC-8801', desc: 'Circular Transfer Ring Account', path: '/accounts?search=ACC-8801' },
    { type: 'ACCOUNT', id: 'ACC-PAYROLL-01', desc: 'Corporate Payroll (Hard Negative)', path: '/accounts?search=ACC-PAYROLL-01' },
    { type: 'ALERT', id: 'ALERT-PRIMARY', desc: 'Demo Primary Investigation', path: '/investigations' },
  ];

  const filteredSearches = quickSearches.filter(
    (item) =>
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#090a0f] text-slate-100">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-800/80 bg-[#0d0f17]">
        {/* Brand Header */}
        <div className="flex h-16 items-center gap-3 border-b border-slate-800/80 px-6">
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

        {/* Role Switcher Pill */}
        <div className="p-4 pb-2">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Active Persona</label>
          <div className="relative mt-1.5">
            <select
              value={currentRole}
              onChange={(e) => {
                const newRole = e.target.value as UserRole;
                onRoleChange(newRole);
                if (location.pathname.startsWith('/dashboard')) {
                  if (newRole === 'FRAUD_ANALYST') navigate('/dashboard/fraud');
                  else if (newRole === 'INTERNAL_AUDITOR') navigate('/dashboard/audit');
                  else navigate('/dashboard/compliance');
                }
              }}
              className="w-full appearance-none rounded-lg border border-slate-700/80 bg-slate-900/80 px-3 py-2 pr-8 text-xs font-medium text-slate-200 shadow-sm focus:border-cyan-500 focus:outline-none"
            >
              <option value="FRAUD_ANALYST">Fraud Analyst (Financial)</option>
              <option value="INTERNAL_AUDITOR">Internal Auditor (Employee)</option>
              <option value="COMPLIANCE_HEAD">Compliance Head (Executive)</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-slate-400" />
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-2">
          {navGroups.map((group) => (
            <div key={group.group}>
              <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">{group.group}</div>
              <div className="mt-1 space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    location.pathname === item.path ||
                    (item.path.startsWith('/dashboard') && location.pathname.startsWith('/dashboard'));
                  return (
                    <Link
                      key={item.label}
                      to={item.path}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                        isActive
                          ? 'border border-cyan-500/30 bg-cyan-950/40 text-cyan-300'
                          : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Engine Status Footer */}
        <div className="border-t border-slate-800/80 p-4">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Engine: Active</span>
            </div>
            <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-300">v1.0.0</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-400">Deterministic Tiering & SHA-256 Validated</div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex flex-1 flex-col pl-64">
        {/* Top Navbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-800/80 bg-[#0d0f17]/90 px-8 backdrop-blur-md">
          {/* Quick Search Button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/60 px-3.5 py-1.5 text-xs text-slate-400 transition-colors hover:border-slate-700 hover:text-slate-300"
          >
            <Search className="h-4 w-4 text-slate-400" />
            <span>Search employee, account, alert, transaction...</span>
            <kbd className="ml-4 flex items-center gap-0.5 rounded border border-slate-700 bg-slate-800/80 px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
              <Command className="h-3 w-3" /> K
            </kbd>
          </button>

          {/* Right Controls */}
          <div className="flex items-center gap-4">
            {/* Persona Badge */}
            <div className="hidden items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-3 py-1 text-xs md:flex">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              <span className="text-slate-300">
                {currentRole === 'FRAUD_ANALYST'
                  ? 'Fraud Analyst View'
                  : currentRole === 'INTERNAL_AUDITOR'
                  ? 'Internal Audit View'
                  : 'Compliance Executive'}
              </span>
            </div>

            {/* Quick Demo Primary Investigation Link */}
            <Link
              to="/alerts"
              className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-950/40 px-3 py-1.5 text-xs font-medium text-red-300 transition-colors hover:bg-red-900/40"
            >
              <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
              <span>Priority Alerts</span>
            </Link>

            {/* User Profile */}
            <div className="flex items-center gap-2.5 border-l border-slate-800 pl-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-slate-200">
                JD
              </div>
              <div className="hidden text-left lg:block">
                <div className="text-xs font-medium text-slate-200">Analyst 07</div>
                <div className="text-[10px] text-slate-400">Financial Crime SOC</div>
              </div>
            </div>
          </div>
        </header>

        {/* Workspace Body */}
        <main className="flex-1 p-8">{children}</main>
      </div>

      {/* Global Command Palette Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-4 pt-20 backdrop-blur-sm">
          <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
            {/* Input Bar */}
            <div className="flex items-center border-b border-slate-800 px-4 py-3">
              <Search className="h-5 w-5 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search by Employee ID, Account, Scenario, or Alert..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ml-3 flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-400 focus:outline-none"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Result Suggestions */}
            <div className="max-h-80 overflow-y-auto p-2">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Quick Jump & Benchmarks
              </div>
              {filteredSearches.length > 0 ? (
                filteredSearches.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSearchOpen(false);
                      navigate(item.path);
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-xs transition-colors hover:bg-slate-800/80"
                  >
                    <div className="flex items-center gap-3">
                      <span className="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-cyan-400">
                        {item.type}
                      </span>
                      <div>
                        <div className="font-semibold text-slate-200">{item.id}</div>
                        <div className="text-[11px] text-slate-400">{item.desc}</div>
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                  </button>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">No matching entities found.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
