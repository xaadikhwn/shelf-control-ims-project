import type { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  children: ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-navy-800 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap';

  const variants = {
    primary:
      'bg-accent-blue hover:bg-accent-blue-dark text-white focus:ring-accent-blue shadow-lg shadow-accent-blue/20 hover:shadow-accent-blue/30',
    secondary:
      'bg-navy-600 hover:bg-navy-500 text-text-primary border border-navy-400 focus:ring-navy-400',
    ghost:
      'bg-transparent hover:bg-navy-700 text-text-secondary hover:text-text-primary focus:ring-navy-500',
    danger:
      'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-lg shadow-red-600/20',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-2.5 text-base',
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
}
