import React from 'react';
import { clsx } from 'clsx';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  gradient?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'purple';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  gradient = 'indigo',
  onClick,
}) => {
  const gradients = {
    indigo: 'from-indigo-500/10 via-indigo-500/5 to-transparent border-indigo-500/20 text-indigo-400',
    emerald: 'from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/20 text-emerald-400',
    amber: 'from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/20 text-amber-400',
    rose: 'from-rose-500/10 via-rose-500/5 to-transparent border-rose-500/20 text-rose-400',
    cyan: 'from-cyan-500/10 via-cyan-500/5 to-transparent border-cyan-500/20 text-cyan-400',
    purple: 'from-purple-500/10 via-purple-500/5 to-transparent border-purple-500/20 text-purple-400',
  };

  const iconBgs = {
    indigo: 'bg-indigo-500/20 text-indigo-300 ring-indigo-500/30',
    emerald: 'bg-emerald-500/20 text-emerald-300 ring-emerald-500/30',
    amber: 'bg-amber-500/20 text-amber-300 ring-amber-500/30',
    rose: 'bg-rose-500/20 text-rose-300 ring-rose-500/30',
    cyan: 'bg-cyan-500/20 text-cyan-300 ring-cyan-500/30',
    purple: 'bg-purple-500/20 text-purple-300 ring-purple-500/30',
  };

  return (
    <div
      onClick={onClick}
      className={clsx(
        'relative overflow-hidden rounded-2xl border bg-gradient-to-br bg-slate-900/90 p-5 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-slate-700/80',
        gradients[gradient],
        onClick && 'cursor-pointer'
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="mt-2 text-2xl font-extrabold tracking-tight text-white">{value}</h3>
          {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
        </div>
        <div className={clsx('rounded-xl p-3 ring-1 shadow-inner', iconBgs[gradient])}>
          {icon}
        </div>
      </div>

      {trend && (
        <div className="mt-4 flex items-center gap-1.5 text-xs font-medium">
          <span
            className={clsx(
              'px-2 py-0.5 rounded-full font-bold',
              trend.isPositive !== false ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            )}
          >
            {trend.value}
          </span>
          <span className="text-slate-400">vs bulan lalu</span>
        </div>
      )}
    </div>
  );
};
