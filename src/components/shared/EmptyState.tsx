import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon: Icon = AlertCircle
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-brand-800 rounded-xl bg-brand-950/20 max-w-md mx-auto my-6 select-none font-mono">
      <div className="w-12 h-12 rounded-lg bg-brand-900/50 border border-brand-800 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-slate-500" />
      </div>
      
      <h3 className="text-sm font-semibold text-white mb-1.5 uppercase tracking-wider">{title}</h3>
      <p className="text-xs text-slate-500 mb-6 max-w-[280px] leading-relaxed font-sans">{description}</p>
      
      {actionText && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
