import { useEffect, useRef, useCallback, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  maxWidth?: string;
}

export default function Modal({
  isOpen,
  onClose,
  children,
  title,
  subtitle,
  icon,
  maxWidth = 'max-w-2xl',
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key !== 'Tab' || !contentRef.current) return;

      const focusable = contentRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    // Focus first focusable element
    setTimeout(() => {
      const firstFocusable = contentRef.current?.querySelector<HTMLElement>(
        'button, [href], input'
      );
      firstFocusable?.focus();
    }, 50);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) {
        onClose();
      }
    },
    [onClose]
  );

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Modal dialog'}
    >
      <div
        ref={contentRef}
        className={`${maxWidth} w-full bg-navy-800 border border-navy-500/50 rounded-xl shadow-2xl overflow-y-auto max-h-[90vh] transform transition-all`}
      >
        {/* Header */}
        {(title || subtitle) && (
          <div className="flex items-start justify-between p-5 border-b border-navy-500/50">
            <div className="flex items-center gap-3">
              {icon && (
                <div className="w-10 h-10 bg-accent-blue/10 rounded-lg flex items-center justify-center">
                  {icon}
                </div>
              )}
              <div>
                {title && (
                  <h2 className="text-lg font-bold text-text-primary">
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p className="text-xs text-text-muted font-mono mt-0.5">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-navy-600 transition-colors text-text-muted hover:text-text-primary"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
