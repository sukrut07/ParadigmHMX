import React from 'react';
import { LucideIcon } from 'lucide-react';
import { AnimatedNumber } from '../motion/AnimatedNumber';

interface KPICardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  subtitle?: string;
  badge?: string;
  badgeColor?: 'red' | 'orange' | 'yellow' | 'blue' | 'emerald';
  trend?: string;
  onClick?: () => void;
  className?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  icon: Icon,
  subtitle,
  badge,
  badgeColor = 'blue',
  trend,
  onClick,
  className = '',
}) => {
  const badgeClasses = {
    red: 'bg-red-500/10 text-red-400 border-red-500/30',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    blue: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  }[badgeColor];

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border border-slate-800/80 bg-[#0c0e1a] p-4 shadow-lg backdrop-blur-sm transition-all duration-200 hover:border-slate-700 hover:bg-[#121526] ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</span>
        {Icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800/60 text-slate-300">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-slate-100">
          {typeof value === 'number' ? <AnimatedNumber value={value} /> : value}
        </span>
        {badge && (
          <span className={`inline-flex rounded border px-1.5 py-0.5 text-[10px] font-medium ${badgeClasses}`}>
            {badge}
          </span>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
          {subtitle && <span>{subtitle}</span>}
          {trend && <span className="font-medium text-emerald-400">{trend}</span>}
        </div>
      )}
    </div>
  );
};
