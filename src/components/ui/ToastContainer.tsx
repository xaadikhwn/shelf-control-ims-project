import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useUI } from '../../context/UIContext';

export default function ToastContainer() {
  const { toasts, removeToast } = useUI();

  if (toasts.length === 0) return null;

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
    error: <AlertCircle className="w-5 h-5 text-red-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
  };

  const borders = {
    success: 'border-l-emerald-500',
    error: 'border-l-red-500',
    warning: 'border-l-amber-500',
    info: 'border-l-blue-500',
  };

  return (
    <div className="fixed top-4 right-4 z-[60] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast-enter pointer-events-auto bg-navy-800 border border-navy-500/50 border-l-4 ${borders[toast.type]} rounded-lg p-4 shadow-xl flex items-start gap-3`}
        >
          <span className="flex-shrink-0 mt-0.5">{icons[toast.type]}</span>
          <p className="text-sm text-text-primary flex-1">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 text-text-muted hover:text-text-primary transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
