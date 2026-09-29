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
  Command,
  Globe,
  SlidersHorizontal,
} from 'lucide-react';
import { UserRole } from '../../types';
import { GlobalSearchModal } from './GlobalSearchModal';

interface ShellProps {
  children: React.ReactNode;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const Shell: React.FC<ShellProps> = ({ children, currentRole, onRoleChange }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);

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
        { label: 'Role Dashboard', path: getDashboardPath(), icon: LayoutDashboard },
        { label: 'Product Story (Home)', path: '/', icon: Globe },
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

  return (
    <div className="flex min-h-screen bg-[#050315] text-slate-100">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-800/80 bg-[#080a14]">
        {/* Brand Header */}
        <Link to="/" className="flex h-16 items-center gap-3 border-b border-slate-800/80 px-6 hover:bg-slate-900/40 transition-colors">
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
        </Link>

        {/* Role Switcher Pill */}
        <div className="p-4 pb-2">
          <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            <span>Active Persona</span>
            <SlidersHorizontal className="h-3 w-3 text-slate-400" />
          </div>
          <div className="relative">
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
              className="w-full appearance-none rounded-lg border border-slate-700/80 bg-slate-900/90 px-3 py-2 pr-8 text-xs font-medium text-slate-200 shadow-sm focus:border-cyan-500 focus:outline-none cursor-pointer"
            >
              <option value="FRAUD_ANALYST">Fraud Analyst (Financial)</option>
              <option value="INTERNAL_AUDITOR">Internal Auditor (Employee)</option>
              <option value="COMPLIANCE_HEAD">Compliance Head (Executive)</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-slate-400" />
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-5 overflow-y-auto px-4 py-2">
          {navGroups.map((group) => (
            <div key={group.group}>
              <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">{group.group}</div>
              <div className="mt-1 space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.path === '/'
                      ? location.pathname === '/'
                      : location.pathname === item.path ||
                        (item.path.startsWith('/dashboard') && location.pathname.startsWith('/dashboard'));
                  return (
                    <Link
                      key={item.label}
                      to={item.path}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                        isActive
                          ? 'border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 shadow-sm'
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
        <div className="border-t border-slate-800/80 p-4 bg-[#060710]">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-medium">Pipeline: Active</span>
            </div>
            <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-300">v1.1.0</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-400">Deterministic Tiering & SHA-256 Validated</div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex flex-1 flex-col pl-64">
        {/* Top Navbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-800/80 bg-[#080a14]/90 px-8 backdrop-blur-md">
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
            {/* Persona Indicator Badge */}
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
              className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-950/40 px-3 py-1.5 text-xs font-medium text-rose-300 transition-colors hover:bg-rose-900/40"
            >
              <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
              <span>Priority Alerts</span>
            </Link>

            {/* User Profile */}
            <div className="flex items-center gap-2.5 border-l border-slate-800 pl-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-700 to-indigo-900 text-xs font-bold text-white border border-indigo-500/30">
                IN
              </div>
              <div className="hidden text-left lg:block">
                <div className="text-xs font-medium text-slate-200">Investigator 01</div>
                <div className="text-[10px] text-slate-400">Financial Crime SOC</div>
              </div>
            </div>
          </div>
        </header>

        {/* Workspace Body */}
        <main className="flex-1">{children}</main>
      </div>

      {/* Global Command Palette Modal */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
};
