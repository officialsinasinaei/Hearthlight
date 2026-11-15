import React from 'react';
import { cn } from '../../utils/cn';

export type TavernButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'icon';
export type TavernButtonSize = 'sm' | 'md' | 'lg';

export interface TavernButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: TavernButtonVariant;
  size?: TavernButtonSize;
}

const VARIANT_STYLES: Record<TavernButtonVariant, string> = {
  primary:
    'bg-gradient-to-b from-[#f7e0a3] via-[#cda043] to-[#7e5118] text-stone-950 border-t border-[#fffbe6] border-b-2 border-[#54330a] shadow-[0_2px_8px_rgba(0,0,0,0.6)] hover:brightness-110 active:translate-y-0.5 font-black uppercase tracking-wider',
  secondary:
    'bg-gradient-to-b from-[#3a2213] to-[#1c0f06] border border-[#8e6129]/60 text-[#f5e2b3] shadow hover:text-white hover:border-[#fae6a2] active:translate-y-0.5 font-bold uppercase tracking-wider transition-colors',
  danger:
    'bg-gradient-to-b from-[#3d1217] via-[#2c0c10] to-[#1a0709] border-t border-[#7f1d1d]/60 border-b-2 border-[#120406] text-rose-300 shadow hover:text-white hover:border-rose-500/70 active:translate-y-0.5 font-bold uppercase tracking-wider transition-colors',
  ghost:
    'bg-stone-800/90 text-stone-300 border border-stone-700 shadow hover:bg-stone-700 hover:text-white active:translate-y-0.5 font-bold uppercase tracking-wider transition-colors',
  icon:
    'w-6 h-6 rounded-full bg-[#1a0e06] border border-[#8e6328]/70 text-[#fae6a2] hover:bg-[#381e0e] hover:border-[#fae6a2] flex items-center justify-center text-xs font-black transition-all shadow-xs',
};

const SIZE_STYLES: Record<TavernButtonSize, string> = {
  sm: 'py-1 px-2.5 text-[10px] rounded-lg min-h-[30px]',
  md: 'py-1.5 px-4 text-xs rounded-xl min-h-[36px]',
  lg: 'py-2.5 px-6 text-sm rounded-xl min-h-[44px]',
};

export function TavernButton({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className,
  type = 'button',
  ...props
}: TavernButtonProps) {
  const isIcon = variant === 'icon';

  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 transition-all select-none',
        VARIANT_STYLES[variant],
        !isIcon && SIZE_STYLES[size],
        disabled && 'opacity-50 cursor-not-allowed filter grayscale-[40%] hover:brightness-100 active:translate-y-0',
        !disabled && 'cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
