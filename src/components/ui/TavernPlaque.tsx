import React from 'react';
import { cn } from '../../utils/cn';

export interface TavernPlaqueProps {
  label?: React.ReactNode;
  value?: React.ReactNode;
  children?: React.ReactNode;
  variant?: 'slate' | 'gold' | 'wood';
  size?: 'sm' | 'md';
  className?: string;
  dataTestId?: string;
}

const VARIANT_STYLES = {
  slate: 'bg-[#1d150f] border-[#8e6328]/80 shadow-[inset_0_1px_3px_rgba(0,0,0,0.85),0_1px_2px_rgba(0,0,0,0.3)]',
  gold: 'bg-gradient-to-b from-[#2e1d0f] via-[#1a1007] to-[#120803] border-[#f5c451] shadow-[0_2px_8px_rgba(0,0,0,0.6)]',
  wood: 'bg-[#0f0804] border-[#4a2e12] shadow-[inset_0_2px_4px_rgba(0,0,0,0.85)]',
};

const SIZE_STYLES = {
  sm: 'px-1 md:px-1.5 py-[1px] md:py-0.5 rounded-[4px] text-[7px] md:text-[9.5px]',
  md: 'px-2.5 py-1 rounded-md text-xs',
};

export function TavernPlaque({
  label,
  value,
  children,
  variant = 'slate',
  size = 'sm',
  className,
  dataTestId,
}: TavernPlaqueProps) {
  return (
    <div
      data-testid={dataTestId}
      className={cn(
        'inline-flex items-center gap-1 border max-w-full w-fit whitespace-nowrap select-none',
        VARIANT_STYLES[variant],
        SIZE_STYLES[size],
        className
      )}
    >
      {label && (
        <span className="font-serif font-extrabold uppercase tracking-[0.01em] md:tracking-wider text-[#d6cfc4] leading-none whitespace-nowrap">
          {label}
        </span>
      )}
      {value && (
        <strong className="font-mono font-black text-[#f5c451] leading-none whitespace-nowrap">
          {value}
        </strong>
      )}
      {children}
    </div>
  );
}
