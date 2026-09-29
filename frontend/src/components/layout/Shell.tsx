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
  Eye,
  Clock,
  Activity,
  Building2,
  CheckCircle2,
  TrendingUp,
  FileText,
} from 'lucide-react';
import { UserRole } from '../../types';
import { GlobalSearchModal } from './GlobalSearchModal';
import { InsiderTraceLogo } from '../common/InsiderTraceLogo';

interface ShellProps {
  children: React.ReactNode;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

const roleLabels: Record<UserRole, { label: string; abbr: string; question: string }> = {
  FRAUD_ANALYST: {
    label: 'Fraud Analyst',
    abbr: 'FA',
    question: 'What suspicious financial activity needs my attention right now?',
  },
  INTERNAL_AUDITOR: {
    label: 'Internal Auditor',
    abbr: 'IA',
    question: 'Which employee behaviours need review?',
  },
  COMPLIANCE_HEAD: {
    label: 'Compliance Head',
    abbr: 'CH',
    question: 'Is the overall detection/investigation system working?',
  },
  ADMIN: {
    label: 'Platform Admin',
    abbr: 'AD',
    question: 'Platform configuration and health',
  },
  ANALYST: {
    label: 'Fraud Analyst',
    abbr: 'FA',
    question: 'What suspicious financial activity needs my attention right now?',
  },
  AUDITOR: {
    label: 'Internal Auditor',
    abbr: 'IA',
    question: 'Which employee behaviours need review?',
  },
  REVIEWER: {
    label: 'Case Reviewer',
    abbr: 'CR',
    question: 'Pending case sign-offs and evidence',
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
    if (currentRole === 'FRAUD_ANALYST' || currentRole === 'ANALYST') return '/dashboard/fraud';
    if (currentRole === 'INTERNAL_AUDITOR' || currentRole === 'AUDITOR') return '/dashboard/audit';
    return '/dashboard/compliance';
  };

  /* ── Persona-Aware Task-Oriented Navigation Groups (Section 60) ── */
  const getNavGroups = () => {
    if (currentRole === 'INTERNAL_AUDITOR' || currentRole === 'AUDITOR') {
      return [
        {
          group: 'Overview',
          items: [
            { label: 'Dashboard', path: '/dashboard/audit', icon: LayoutDashboard },
          ],
        },
        {
          group: 'Employee Risk',
          items: [
            { label: 'Employees', path: '/employees', icon: Users },
            { label: 'Behaviour', path: '/behaviour', icon: Eye },
            { label: 'Privilege', path: '/privilege', icon: ShieldAlert },
          ],
        },
        {
          group: 'Activity',
          items: [
            { label: 'Accounts', path: '/accounts', icon: CreditCard },
            { label: 'Transactions', path: '/transactions', icon: Activity },
          ],
        },
        {
          group: 'Investigate',
          items: [
            { label: 'Employee Cases', path: '/cases?role=auditor', icon: Briefcase },
            { label: 'Case Graph', path: '/case-graph', icon: Network },
          ],
        },
        {
          group: 'Evidence',
          items: [
            { label: 'Evidence Center', path: '/evidence', icon: FileCheck2 },
          ],
        },
      ];
    }

    if (currentRole === 'COMPLIANCE_HEAD' || currentRole === 'REVIEWER') {
      return [
        {
          group: 'Overview',
          items: [
            { label: 'Dashboard', path: '/dashboard/compliance', icon: LayoutDashboard },
          ],
        },
        {
          group: 'Detection',
          items: [
            { label: 'Alert Pipeline', path: '/alerts', icon: AlertTriangle },
          ],
        },
        {
          group: 'Cases',
          items: [
            { label: 'Case Management', path: '/cases', icon: Briefcase },
          ],
        },
        {
          group: 'Evidence',
          items: [
            { label: 'Evidence Center', path: '/evidence', icon: FileCheck2 },
          ],
        },
        {
          group: 'Analytics',
          items: [
            { label: 'Evaluation & Reports', path: '/evaluation', icon: TrendingUp },
          ],
        },
        {
          group: 'Simulation',
          items: [
            { label: 'Red-Team Simulation', path: '/simulation', icon: Flame },
          ],
        },
      ];
    }

    // Default: FRAUD_ANALYST
    return [
      {
        group: 'Overview',
        items: [
          { label: 'Dashboard', path: '/dashboard/fraud', icon: LayoutDashboard },
        ],
      },
      {
        group: 'Investigate',
        items: [
          { label: 'Alert Queue', path: '/alerts', icon: AlertTriangle },
          { label: 'Investigations', path: '/investigations', icon: ShieldAlert },
          { label: 'Case Graph', path: '/case-graph', icon: Network },
        ],
      },
      {
        group: 'Entities',
        items: [
          { label: 'Accounts', path: '/accounts', icon: CreditCard },
          { label: 'Employees', path: '/employees', icon: Users },
          { label: 'Customers', path: '/customers', icon: Building2 },
        ],
      },
      {
        group: 'Cases',
        items: [
          { label: 'Case Management', path: '/cases', icon: Briefcase },
        ],
      },
      {
        group: 'Evidence',
        items: [
          { label: 'Evidence Center', path: '/evidence', icon: FileCheck2 },
        ],
      },
    ];
  };

  const navGroups = getNavGroups();

  const isActive = (path: string, exact?: boolean) => {
    const cleanPath = path.split('?')[0].split('#')[0];
    if (exact) return location.pathname === cleanPath;
    if (cleanPath === '/') return location.pathname === '/';
    if (cleanPath.startsWith('/dashboard')) return location.pathname === cleanPath;
    if (cleanPath === '/case-graph') return location.pathname.startsWith('/case-graph');
    if (cleanPath === '/investigations') return location.pathname.startsWith('/investigation') && !location.pathname.startsWith('/case-graph');
    return location.pathname === cleanPath || location.pathname.startsWith(cleanPath + '/');
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
          background: '#0B2E21',
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
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            textDecoration: 'none',
          }}
        >
          <InsiderTraceLogo size={28} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: '#FFFFFF' }}>
              INSIDER<span style={{ color: '#5FE0A2' }}>TRACE</span>
            </div>
            <div style={{ fontSize: 10, color: '#B9C9C0', marginTop: 1 }}>
              Financial Crime Intelligence
            </div>
          </div>
        </Link>

        {/* Persona Switcher */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8FA69A', marginBottom: 6 }}>
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
                background: '#153D2E',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 8,
                padding: '7px 32px 7px 10px',
                fontSize: 12,
                fontWeight: 600,
                color: '#FFFFFF',
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
              color="#B9C9C0"
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            />
          </div>
          <div style={{ marginTop: 6, fontSize: 11, color: '#8FA69A', fontStyle: 'italic' }}>
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
                  color: '#8FA69A',
                  padding: '0 8px',
                  marginBottom: 6,
                }}
              >
                {group.group}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path, (item as any).exact);
                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    className={`sidebar-nav-item ${active ? 'active' : ''}`}
                    style={{ marginBottom: 2 }}
                  >
                    <Icon size={15} style={{ flexShrink: 0, color: active ? '#5FE0A2' : '#B9C9C0' }} />
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
            borderTop: '1px solid rgba(255,255,255,0.08)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Circle size={7} fill="#5FE0A2" color="#5FE0A2" style={{ animation: 'pulse-dot 2s infinite' }} />
            <span style={{ fontSize: 11, color: '#B9C9C0', fontWeight: 500 }}>Pipeline Active</span>
          </div>
          <span
            style={{
              fontSize: 10,
              fontFamily: 'monospace',
              color: '#8FA69A',
              background: '#153D2E',
              padding: '2px 6px',
              borderRadius: 4,
              border: '1px solid rgba(255,255,255,0.1)',
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
            background: '#FFFFFF',
            borderBottom: '1px solid #D7E0DA',
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
              border: '1px solid #D7E0DA',
              background: '#F1F5F2',
              cursor: 'pointer',
              fontSize: 12,
              color: '#425148',
              transition: 'border-color 0.15s, box-shadow 0.15s',
              minWidth: 260,
            }}
          >
            <Search size={14} color="#68766E" />
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
                border: '1px solid #D7E0DA',
                background: '#FFFFFF',
                color: '#68766E',
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
                background: '#E8F4ED',
                border: '1px solid #BBDCCA',
                fontSize: 12,
                fontWeight: 600,
                color: '#176044',
              }}
            >
              <Circle size={7} fill="#176044" color="#176044" />
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
                background: '#FFF1F1',
                border: '1px solid #F1B8B3',
                fontSize: 12,
                fontWeight: 600,
                color: '#B42318',
                textDecoration: 'none',
                transition: 'background 0.15s',
              }}
            >
              <AlertTriangle size={13} color="#B42318" />
              Priority Alerts
            </Link>

            {/* User avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 16, borderLeft: '1px solid #D7E0DA' }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #176044, #20A36A)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#FFFFFF',
                  flexShrink: 0,
                }}
              >
                {role.abbr}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#17221C' }}>Investigator 01</div>
                <div style={{ fontSize: 10, color: '#68766E' }}>Financial Crime SOC</div>
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
