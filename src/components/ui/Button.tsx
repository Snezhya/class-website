import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'terminal';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  children,
  icon: Icon,
  className = '',
  disabled,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-brand-500 hover:bg-brand-400 text-white shadow-lg hover:shadow-brand-500/25 border border-brand-400/20';
      case 'danger':
        return 'bg-terminal-red/10 hover:bg-terminal-red/20 text-terminal-red border border-terminal-red/35';
      case 'ghost':
        return 'hover:bg-brand-800/40 text-slate-400 hover:text-white border border-transparent';
      case 'terminal':
        return 'font-mono bg-terminal-dark border border-brand-700/60 text-terminal-green hover:border-terminal-green/50 hover:bg-brand-900/60 shadow-inner';
      case 'secondary':
      default:
        return 'bg-brand-800/40 hover:bg-brand-700/50 text-slate-200 border border-brand-700/50 hover:border-brand-500/30';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-xs rounded-lg';
      case 'lg':
        return 'px-6 py-3 text-base rounded-xl';
      case 'md':
      default:
        return 'px-4 py-2 text-sm rounded-lg';
    }
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-sans font-medium transition-all duration-200 select-none active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none ${getVariantStyles()} ${getSizeStyles()} ${className}`}
      disabled={disabled}
      {...props}
    >
      {Icon && <Icon className={`w-4 h-4 ${variant === 'terminal' ? 'text-terminal-green' : ''}`} />}
      <span>{children}</span>
    </button>
  );
};
