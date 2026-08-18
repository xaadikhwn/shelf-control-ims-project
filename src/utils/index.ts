/**
 * Format a number as GBP currency.
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format a date string to "DD MMM YYYY" format.
 * If already in that format, returns as-is.
 */
export const formatDate = (dateStr: string): string => {
  // If already formatted (e.g. "28 Dec 2024"), return as-is
  if (/^\d{1,2}\s\w{3}\s\d{4}$/.test(dateStr)) return dateStr;

  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Returns Tailwind classes for a given status string.
 */
export const getStatusColor = (
  status: string
): { bg: string; text: string } => {
  const s = status.toLowerCase().replace(/\s+/g, '-');

  const colorMap: Record<string, { bg: string; text: string }> = {
    // Green statuses
    active: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
    paid: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
    delivered: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
    approved: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
    'in-stock': { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },

    // Amber statuses
    pending: { bg: 'bg-amber-500/15', text: 'text-amber-400' },
    warning: { bg: 'bg-amber-500/15', text: 'text-amber-400' },
    'low-stock': { bg: 'bg-amber-500/15', text: 'text-amber-400' },
    processing: { bg: 'bg-amber-500/15', text: 'text-amber-400' },

    // Red statuses
    overdue: { bg: 'bg-red-500/15', text: 'text-red-400' },
    rejected: { bg: 'bg-red-500/15', text: 'text-red-400' },
    'out-of-stock': { bg: 'bg-red-500/15', text: 'text-red-400' },
    cancelled: { bg: 'bg-red-500/15', text: 'text-red-400' },
    refunded: { bg: 'bg-red-500/15', text: 'text-red-400' },

    // Blue/Indigo statuses
    shipped: { bg: 'bg-blue-500/15', text: 'text-blue-400' },
    credit: { bg: 'bg-indigo-500/15', text: 'text-indigo-400' },
  };

  return colorMap[s] || { bg: 'bg-gray-500/15', text: 'text-gray-400' };
};

/**
 * Returns a color class for credit utilisation percentage.
 */
export const getUtilisationColor = (percentage: number): string => {
  if (percentage >= 75) return 'bg-red-500';
  if (percentage >= 50) return 'bg-amber-500';
  return 'bg-emerald-500';
};

/**
 * Returns a color class for stock quantity display.
 */
export const getStockQtyColor = (qty: number, reorderPoint: number): string => {
  if (qty === 0) return 'text-red-400';
  if (qty < reorderPoint) return 'text-amber-400';
  return 'text-emerald-400';
};
