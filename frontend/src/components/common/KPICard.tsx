import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  subtitle?: string;
  badge?: string;
  badgeColor?: 'red' | 'orange' | 'yellow' | 'blue' | 'green' | 'emerald';
  trend?: string;
  trendUp?: boolean;
  onClick?: () => void;
  accentColor?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  icon: Icon,
  subtitle,
  badge,
  badgeColor = 'blue',
  trend,
  trendUp,
  onClick,
  accentColor,
}) => {
  const badgeStyles: Record<string, { bg: string; color: string; border: string }> = {
    red:    { bg: 'var(--risk-critical-bg)',  color: 'var(--risk-critical)',  border: 'var(--risk-critical-border)' },
    orange: { bg: 'var(--risk-high-bg)',      color: 'var(--risk-high)',      border: 'var(--risk-high-border)' },
    yellow: { bg: 'var(--risk-medium-bg)',    color: 'var(--risk-medium)',    border: 'var(--risk-medium-border)' },
    blue:   { bg: 'var(--risk-medium-bg)',    color: 'var(--risk-medium)',    border: 'var(--risk-medium-border)' },
    green:  { bg: 'var(--risk-low-bg)',       color: 'var(--risk-low)',       border: 'var(--risk-low-border)' },
    emerald:{ bg: 'var(--risk-low-bg)',       color: 'var(--risk-low)',       border: 'var(--risk-low-border)' },
  };
  const bs = badgeStyles[badgeColor] || badgeStyles.blue;

  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative',
        background: 'var(--surface-raised)',
        border: '1px solid var(--surface-border)',
        borderRadius: 12,
        padding: '20px 20px 16px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.2s, transform 0.15s, border-color 0.15s',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
          (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(14,31,22,0.1)';
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--forest-pale)';
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = '';
        (e.currentTarget as HTMLElement).style.boxShadow = '';
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--surface-border)';
      }}
    >
      {/* Accent top bar */}
      {accentColor && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: accentColor, borderRadius: '12px 12px 0 0' }} />
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          {title}
        </span>
        {Icon && (
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--forest-ghost)', border: '1px solid var(--forest-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon size={15} color="var(--forest-primary)" />
          </div>
        )}
      </div>

      <div style={{ marginTop: 12, display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)', lineHeight: 1 }}>
          {value}
        </span>
        {badge && (
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', padding: '2px 8px', borderRadius: 5, background: bs.bg, color: bs.color, border: `1px solid ${bs.border}` }}>
            {badge}
          </span>
        )}
      </div>

      {(subtitle || trend) && (
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {subtitle && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{subtitle}</span>}
          {trend && (
            <span style={{ fontSize: 11, fontWeight: 600, color: trendUp === false ? 'var(--risk-critical)' : 'var(--risk-low)' }}>
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
