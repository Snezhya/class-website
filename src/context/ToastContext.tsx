import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { softSpring, tweenSmooth } from '../utils/animationConfig';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);

    // Auto remove after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-terminal-green" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-terminal-red" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-terminal-yellow" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-terminal-blue" />;
    }
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      
      {/* Toast Portal Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1, transition: softSpring }}
              exit={{ opacity: 0, y: 12, scale: 0.97, transition: tweenSmooth(0.35) }}
              className="glass-panel p-4 rounded-xl flex items-start justify-between gap-3 shadow-xl pointer-events-auto overflow-hidden border border-brand-700 bg-brand-900/90"
            >
              {/* Type Border Highlight */}
              <div className={`absolute top-0 left-0 bottom-0 w-1 ${
                t.type === 'success' ? 'bg-terminal-green' :
                t.type === 'error' ? 'bg-terminal-red' :
                t.type === 'warning' ? 'bg-terminal-yellow' :
                'bg-terminal-blue'
              }`} />
              
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getIcon(t.type)}</div>
                <div className="text-sm font-medium text-white select-none">{t.message}</div>
              </div>

              <button 
                onClick={() => removeToast(t.id)}
                className="text-slate-500 hover:text-slate-300 transition-colors p-0.5 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
