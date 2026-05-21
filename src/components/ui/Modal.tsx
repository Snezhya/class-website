import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { overlayPop } from '../../utils/motionVariants';
import { tweenSmooth } from '../../utils/animationConfig';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md'
}) => {
  // ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'max-w-md';
      case 'lg':
        return 'max-w-3xl';
      case 'xl':
        return 'max-w-5xl';
      case 'md':
      default:
        return 'max-w-xl';
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6"
          role="presentation"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={tweenSmooth(0.4)}
            onClick={onClose}
            className="absolute inset-0 bg-brand-950/85 backdrop-blur-sm"
            aria-hidden
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            variants={overlayPop}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full ${getSizeClass()} bg-brand-900 border border-brand-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[min(90vh,900px)] z-10 mx-auto`}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-brand-800 bg-brand-950/20 shrink-0">
              {title ? (
                <h3 className="text-lg font-display font-medium text-white pr-4">{title}</h3>
              ) : (
                <div />
              )}
              <button
                type="button"
                onClick={onClose}
                className="text-slate-500 hover:text-slate-300 p-1.5 rounded-lg hover:bg-brand-800/40 transition-all shrink-0"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 min-h-0 font-sans text-slate-300">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
