import React from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { TavernButton } from './TavernButton';
import { cn } from '../../utils/cn';

export interface TavernModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  backdropClassName?: string;
  showCloseButton?: boolean;
  dataTestId?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '3xl' | '5xl';
}

const MAX_WIDTHS = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '3xl': 'max-w-3xl',
  '5xl': 'max-w-5xl',
};

export function TavernModal({
  isOpen,
  onClose,
  title,
  children,
  className,
  backdropClassName,
  showCloseButton = true,
  dataTestId = 'tavern-modal',
  maxWidth = 'md',
}: TavernModalProps) {
  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="tavern-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          data-testid={dataTestId}
          aria-modal="true"
          role="dialog"
          className={cn(
            'fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none overflow-hidden cursor-pointer',
            backdropClassName
          )}
        >
          <motion.div
            key="tavern-modal-card"
            initial={{ scale: 0.94, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.94, y: 10, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: '#1d1007' }}
            className={cn(
              'relative w-full rounded-2xl bg-[#1d1007] bg-gradient-to-b from-[#2b180d] via-[#1d1007] to-[#140a05] border-2 border-[#8e6129] shadow-[0_25px_60px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.12)] p-4 sm:p-5 cursor-default',
              MAX_WIDTHS[maxWidth],
              className
            )}
          >
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#5a3915]/80">
                {title && (
                  <h3 className="text-base sm:text-lg font-black text-[#fae6a2] font-serif tracking-wide drop-shadow uppercase">
                    {title}
                  </h3>
                )}
                {showCloseButton && (
                  <TavernButton
                    variant="icon"
                    onClick={onClose}
                    aria-label="Close"
                    className="ml-auto"
                  >
                    ✕
                  </TavernButton>
                )}
              </div>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
