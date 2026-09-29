import React from 'react';
import { RiskTier } from '../../types';

interface RiskBadgeProps {
  tier: RiskTier | string;
  size?: 'sm' | 'md' | 'lg';
  pulsing?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ tier, size = 'md', pulsing = false }) => {
  const upper = (tier || 'LOW').toUpperCase();

  const sizeStyle = {
    sm: { fontSize: 10, padding: '2px 8px' },
    md: { fontSize: 11, padding: '3px 10px' },
    lg: { fontSize: 12, padding: '4px 12px' },
  }[size];

  const tierStyles: Record<string, { bg: string; color: string; border: string; dot: string }> = {
    CRITICAL: { bg: 'var(--risk-critical-bg)', color: 'var(--risk-critical-text)', border: 'var(--risk-critical-border)', dot: 'var(--risk-critical)' },
    HIGH:     { bg: 'var(--risk-high-bg)',      color: 'var(--risk-high-text)',     border: 'var(--risk-high-border)',    dot: 'var(--risk-high)' },
    MEDIUM:   { bg: 'var(--risk-medium-bg)',    color: 'var(--risk-medium-text)',   border: 'var(--risk-medium-border)',  dot: 'var(--risk-medium)' },
    LOW:      { bg: 'var(--risk-low-bg)',       color: 'var(--risk-low-text)',      border: 'var(--risk-low-border)',     dot: 'var(--risk-low)' },
  };

  const ts = tierStyles[upper] || { bg: 'var(--surface-subtle)', color: 'var(--text-muted)', border: 'var(--surface-border)', dot: 'var(--text-muted)' };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        borderRadius: 6,
        fontWeight: 700,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        background: ts.bg,
        color: ts.color,
        border: `1px solid ${ts.border}`,
        fontFamily: 'inherit',
        ...sizeStyle,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: ts.dot,
          flexShrink: 0,
          animation: pulsing && upper === 'CRITICAL' ? 'pulse-dot 1.5s infinite' : undefined,
        }}
      />
      {upper}
    </span>
  );
};
