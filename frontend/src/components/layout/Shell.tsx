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
  Circle,
} from 'lucide-react';
import { UserRole } from '../../types';
import { GlobalSearchModal } from './GlobalSearchModal';

interface ShellProps {
  children: React.ReactNode;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

const roleLabels: Record<UserRole, { label: string; abbr: string; question: string }> = {
  FRAUD_ANALYST: {
    label: 'Fraud Analyst',
    abbr: 'FA',
    question: 'What should I investigate today?',
  },
  INTERNAL_AUDITOR: {
    label: 'Internal Auditor',
    abbr: 'IA',
    question: 'Which employees need review?',
  },
  COMPLIANCE_HEAD: {
    label: 'Compliance Head',
    abbr: 'CH',
    question: 'Is the pipeline performing?',
  },
};

export const Shell: React.FC<ShellProps> = ({ children, currentRole, onRoleChange }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setSearchOpen(false);
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
      group: 'Overview',
      items: [
        { label: 'Dashboard', path: getDashboardPath(), icon: LayoutDashboard },
        { label: 'Product Home', path: '/', icon: Globe, exact: true },
      ],
    },
    {
      group: 'Investigate',
      items: [
        { label: 'Alert Queue', path: '/alerts', icon: AlertTriangle },
        { label: 'Case Graph', path: '/investigations', icon: Network },
      ],
    },
    {
      group: 'Entities',
      items: [
        { label: 'Employees & Risk', path: '/employees', icon: Users },
        { label: 'Accounts & Mules', path: '/accounts', icon: CreditCard },
      ],
    },
    {
      group: 'Operations',
      items: [
        { label: 'Case Management', path: '/cases', icon: Briefcase },
        { label: 'Evidence Center', path: '/evidence', icon: FileCheck2 },
      ],
    },
    {
      group: 'Analytics',
      items: [
        { label: 'Evaluation', path: '/evaluation', icon: BarChart3 },
        { label: 'Red-Team Sim', path: '/simulation', icon: Flame },
      ],
    },
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    if (path === '/') return location.pathname === '/';
    if (path.startsWith('/dashboard')) return location.pathname.startsWith('/dashboard');
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const role = roleLabels[currentRole];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface-page)' }}>
      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside
        style={{
          position: 'fixed',
          inset: '0 auto 0 0',
          zIndex: 30,
          width: 232,
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--forest-deep)',
        }}
      >
        {/* Brand */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            height: 60,
            padding: '0 20px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, var(--forest-sage), var(--forest-mid))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ShieldAlert size={16} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: '#fff' }}>
              INSIDER<span style={{ color: 'var(--forest-pale)' }}>TRACE</span>
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>
              Financial Crime Intelligence
            </div>
          </div>
        </Link>

        {/* Persona Switcher */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>
            Active Persona
          </div>
          <div style={{ position: 'relative' }}>
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
              style={{
                width: '100%',
                appearance: 'none',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                padding: '7px 32px 7px 10px',
                fontSize: 12,
                fontWeight: 600,
                color: '#fff',
                cursor: 'pointer',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            >
              <option value="FRAUD_ANALYST">Fraud Analyst</option>
              <option value="INTERNAL_AUDITOR">Internal Auditor</option>
              <option value="COMPLIANCE_HEAD">Compliance Head</option>
            </select>
            <ChevronDown
              size={14}
              color="rgba(255,255,255,0.4)"
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            />
          </div>
          <div style={{ marginTop: 6, fontSize: 11, color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' }}>
            {role.question}
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 12px' }}>
          {navGroups.map((group) => (
            <div key={group.group} style={{ marginBottom: 20 }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.3)',
                  padding: '0 8px',
                  marginBottom: 4,
                }}
              >
                {group.group}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path, item.exact);
                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    className={`sidebar-nav-item ${active ? 'active' : ''}`}
                    style={{ marginBottom: 2 }}
                  >
                    <Icon size={15} style={{ flexShrink: 0 }} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer status */}
        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Circle size={7} fill="var(--forest-pale)" color="var(--forest-pale)" style={{ animation: 'pulse-dot 2s infinite' }} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Pipeline Active</span>
          </div>
          <span
            style={{
              fontSize: 10,
              fontFamily: 'monospace',
              color: 'rgba(255,255,255,0.3)',
              background: 'rgba(255,255,255,0.06)',
              padding: '2px 6px',
              borderRadius: 4,
            }}
          >
            v1.1.0
          </span>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingLeft: 232 }}>
        {/* Top Bar */}
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 20,
            height: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 28px',
            background: 'rgba(247,248,243,0.92)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--surface-border)',
          }}
        >
          {/* Search */}
          <button
            onClick={() => setSearchOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '7px 14px',
              borderRadius: 8,
              border: '1px solid var(--surface-border)',
              background: 'var(--surface-raised)',
              cursor: 'pointer',
              fontSize: 12,
              color: 'var(--text-muted)',
              transition: 'border-color 0.15s, box-shadow 0.15s',
              minWidth: 260,
            }}
          >
            <Search size={14} color="var(--text-muted)" />
            <span>Search employee, account, alert...</span>
            <kbd
              style={{
                marginLeft: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                padding: '2px 6px',
                fontSize: 10,
                fontFamily: 'monospace',
                borderRadius: 4,
                border: '1px solid var(--surface-border)',
                background: 'var(--surface-subtle)',
                color: 'var(--text-muted)',
              }}
            >
              <Command size={10} /> K
            </kbd>
          </button>

          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Active persona badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '5px 12px',
                borderRadius: 999,
                background: 'var(--forest-ghost)',
                border: '1px solid var(--forest-pale)',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--forest-primary)',
              }}
            >
              <Circle size={7} fill="var(--forest-sage)" color="var(--forest-sage)" />
              {role.label}
            </div>

            {/* Priority alerts CTA */}
            <Link
              to="/alerts"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 8,
                background: 'var(--risk-critical-bg)',
                border: '1px solid var(--risk-critical-border)',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--risk-critical)',
                textDecoration: 'none',
                transition: 'background 0.15s',
              }}
            >
              <AlertTriangle size={13} />
              Priority Alerts
            </Link>

            {/* User avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 16, borderLeft: '1px solid var(--surface-border)' }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--forest-primary), var(--forest-sage))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#fff',
                  flexShrink: 0,
                }}
              >
                {role.abbr}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Investigator 01</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Financial Crime SOC</div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main style={{ flex: 1 }}>{children}</main>
      </div>

      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
};
