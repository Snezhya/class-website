import React from 'react';
import { MotionCard } from '../motion/MotionCard';
import { prefersReducedMotion } from '../../utils/galleryUtils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'terminal';
  title?: string;
  terminalTitle?: string;
  onClick?: () => void;
  /** Framer: hover ringan pada kartu */
  motion?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  title,
  terminalTitle = 'system_terminal.sh',
  onClick,
  motion: useMotion = false,
  ...props
}) => {
  const getBaseClass = () => {
    switch (variant) {
      case 'glass':
        return 'glass-card backdrop-blur-md rounded-xl';
      case 'terminal':
        return 'bg-brand-950 border border-brand-700/60 rounded-xl overflow-hidden shadow-2xl';
      case 'default':
      default:
        return 'bg-brand-800/40 border border-brand-700/50 rounded-xl shadow-lg';
    }
  };

  if (variant === 'terminal') {
    return (
      <div 
        className={`${getBaseClass()} ${className}`} 
        onClick={onClick}
        {...props}
      >
        {/* Terminal Header Bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-brand-800 bg-brand-950/90 select-none">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-terminal-red/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-terminal-yellow/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-terminal-green/80 inline-block" />
          </div>
          <span className="text-xs font-mono text-slate-500">{terminalTitle}</span>
          <div className="w-[52px]" /> {/* Spacer for symmetry */}
        </div>
        
        {/* Terminal Contents */}
        <div className="p-5 font-mono text-sm leading-relaxed text-slate-300">
          {children}
        </div>
      </div>
    );
  }

  const body = (
    <>
      {title && (
        <div className="mb-4 border-b border-brand-700/30 pb-3 flex justify-between items-center">
          <h3 className="text-lg font-display font-medium text-white">{title}</h3>
        </div>
      )}
      {children}
    </>
  );

  const base = `${getBaseClass()} p-5 transition-all duration-500 ease-out ${onClick ? 'cursor-pointer hover:border-brand-500/30' : ''} ${className}`;

  if (useMotion && !prefersReducedMotion()) {
    return (
      <MotionCard className={base} onClick={onClick} {...props}>
        {body}
      </MotionCard>
    );
  }

  return (
    <div className={base} onClick={onClick} {...props}>
      {body}
    </div>
  );
};
