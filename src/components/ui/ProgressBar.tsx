import { getUtilisationColor } from '../../utils';

interface ProgressBarProps {
  percentage: number;
  showLabel?: boolean;
  className?: string;
}

export default function ProgressBar({
  percentage,
  showLabel = false,
  className = '',
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percentage));
  const colorClass = getUtilisationColor(clamped);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex-1 h-2 bg-navy-500 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-text-secondary min-w-[36px] text-right">
          {Math.round(clamped)}%
        </span>
      )}
    </div>
  );
}
