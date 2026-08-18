import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';
import { getStatusColor } from '../../utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const { bg, text } = getStatusColor(status);
  const normalized = (status || '').toLowerCase();

  let Icon = CheckCircle2;
  if (normalized.includes('pending') || normalized.includes('processing')) {
    Icon = Clock;
  } else if (normalized.includes('warning') || normalized.includes('low') || normalized.includes('overdue')) {
    Icon = AlertTriangle;
  } else if (normalized.includes('out') || normalized.includes('rejected') || normalized.includes('inactive') || normalized.includes('cancelled')) {
    Icon = XCircle;
  } else if (normalized.includes('credit')) {
    Icon = CreditCard;
  } else if (normalized.includes('active') || normalized.includes('approved') || normalized.includes('paid') || normalized.includes('completed') || normalized.includes('in-stock')) {
    Icon = CheckCircle2;
  } else {
    Icon = ShieldCheck;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${bg} ${text} ${className}`}
    >
      <Icon className="w-3 h-3 flex-shrink-0" />
      <span>{status}</span>
    </span>
  );
}
