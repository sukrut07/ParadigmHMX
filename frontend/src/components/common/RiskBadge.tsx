import React from 'react';
import { RiskTier } from '../../types';

interface RiskBadgeProps {
  tier: RiskTier | string;
  size?: 'sm' | 'md' | 'lg';
  pulsing?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ tier, size = 'md', pulsing = false }) => {
  const upper = (tier || 'LOW').toUpperCase();

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 font-bold',
  }[size];

  const colorStyles: Record<string, string> = {
    CRITICAL: 'bg-red-950/70 text-red-400 border border-red-500/50 shadow-sm shadow-red-950',
    HIGH: 'bg-orange-950/70 text-orange-400 border border-orange-500/50 shadow-sm shadow-orange-950',
    MEDIUM: 'bg-yellow-950/70 text-yellow-400 border border-yellow-500/50',
    LOW: 'bg-blue-950/70 text-blue-400 border border-blue-500/40',
  };

  const style = colorStyles[upper] || 'bg-slate-900 text-slate-300 border border-slate-700';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md tracking-wider uppercase ${sizeClasses} ${style}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          upper === 'CRITICAL' ? 'bg-red-400' :
          upper === 'HIGH' ? 'bg-orange-400' :
          upper === 'MEDIUM' ? 'bg-yellow-400' : 'bg-blue-400'
        } ${pulsing && upper === 'CRITICAL' ? 'animate-ping' : ''}`}
      />
      {upper}
    </span>
  );
};
