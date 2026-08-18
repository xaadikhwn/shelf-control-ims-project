import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: string;
  subtitle?: string;
  trend?: {
    text: string;
    type: 'up' | 'down' | 'warning' | 'info' | 'neutral';
  };
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  children?: ReactNode;
}

export default function KpiCard({
  label,
  value,
  subtitle,
  trend,
  icon: Icon,
  iconColor = 'text-accent-blue',
  iconBg = 'bg-accent-blue/10',
}: KpiCardProps) {
  const getTrendColor = () => {
    switch (trend?.type) {
      case 'up':
        return 'text-emerald-400';
      case 'down':
      case 'warning':
        return 'text-red-400';
      case 'info':
        return 'text-amber-400';
      default:
        return 'text-text-secondary';
    }
  };

  const getTrendIcon = () => {
    switch (trend?.type) {
      case 'up':
        return <TrendingUp className="w-3.5 h-3.5" />;
      case 'down':
      case 'warning':
        return <TrendingDown className="w-3.5 h-3.5" />;
      default:
        return <ArrowRight className="w-3.5 h-3.5 opacity-80" />;
    }
  };

  return (
    <div className="bg-navy-800 border border-navy-500/50 rounded-xl p-5 relative overflow-hidden group hover:border-navy-400/50 transition-colors duration-300">
      {/* Icon top-right */}
      <div
        className={`absolute top-4 right-4 w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center`}
      >
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>

      {/* Label */}
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-text-secondary mb-3">
        {label}
      </p>

      {/* Value */}
      <p className="text-2xl font-bold text-text-primary leading-tight mb-1">
        {value}
      </p>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-xs text-text-muted mb-1">{subtitle}</p>
      )}

      {/* Trend line */}
      {trend && (
        <div className={`flex items-center gap-2 text-xs font-medium mt-1 ${getTrendColor()}`}>
          {getTrendIcon()}
          <span>{trend.text}</span>
        </div>
      )}
    </div>
  );
}
