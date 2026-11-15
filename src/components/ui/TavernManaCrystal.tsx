import { cn } from '../../utils/cn';

export interface TavernManaCrystalButtonProps {
  val: string | number;
  isActive: boolean;
  onClick: () => void;
  className?: string;
}

export function TavernManaCrystalButton({
  val,
  isActive,
  onClick,
  className,
}: TavernManaCrystalButtonProps) {
  const isAll = val === 'All';
  const label = isAll ? 'ALL' : val === 7 ? '7+' : String(val);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative w-6 h-6 min-w-[24px] min-h-[24px] flex items-center justify-center transition-all cursor-pointer select-none',
        isActive
          ? 'scale-115 z-10 drop-shadow-[0_0_12px_rgba(56,189,248,0.95)]'
          : 'hover:scale-105 opacity-85 hover:opacity-100',
        className
      )}
      aria-pressed={isActive}
      aria-label={`${label} Mana`}
    >
      <svg viewBox="0 0 36 36" className="w-full h-full" fill="none">
        <defs>
          <linearGradient id={`activeTopFacet-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#bae6fd" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
          <linearGradient id={`activeMidFacet-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <linearGradient id={`activeBotFacet-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e40af" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <radialGradient id={`activeCenterGlow-${label}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="65%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </radialGradient>

          <linearGradient id={`inactiveTopFacet-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3a2e20" />
            <stop offset="100%" stopColor="#251d14" />
          </linearGradient>
          <linearGradient id={`inactiveMidFacet-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#251e17" />
            <stop offset="100%" stopColor="#14100c" />
          </linearGradient>
          <linearGradient id={`inactiveBotFacet-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#17120e" />
            <stop offset="100%" stopColor="#0b0806" />
          </linearGradient>
        </defs>

        {isActive ? (
          <>
            <polygon points="18,1 32,9 32,27 18,35 4,27 4,9" fill="none" stroke="#93c5fd" strokeWidth="1.2" />
            <polygon points="18,2 31,9.5 24,14 18,9 12,14 5,9.5" fill={`url(#activeTopFacet-${label})`} />
            <polygon points="5,9.5 12,14 12,22 5,26.5" fill={`url(#activeMidFacet-${label})`} />
            <polygon points="31,9.5 31,26.5 24,22 24,14" fill={`url(#activeMidFacet-${label})`} />
            <polygon points="5,26.5 12,22 18,27 18,34" fill={`url(#activeBotFacet-${label})`} />
            <polygon points="31,26.5 18,34 18,27 24,22" fill={`url(#activeBotFacet-${label})`} />
            <polygon points="18,9 24,14 24,22 18,27 12,22 12,14" fill={`url(#activeCenterGlow-${label})`} />
            <polygon points="18,3 22,8 18,9 14,8" fill="#ffffff" fillOpacity="0.85" />
          </>
        ) : (
          <>
            <polygon points="18,1 32,9 32,27 18,35 4,27 4,9" fill="none" stroke="#5e462b" strokeWidth="0.8" strokeOpacity="0.8" />
            <polygon points="18,2 31,9.5 24,14 18,9 12,14 5,9.5" fill={`url(#inactiveTopFacet-${label})`} />
            <polygon points="5,9.5 12,14 12,22 5,26.5" fill={`url(#inactiveMidFacet-${label})`} />
            <polygon points="31,9.5 31,26.5 24,22 24,14" fill={`url(#inactiveMidFacet-${label})`} />
            <polygon points="5,26.5 12,22 18,27 18,34" fill={`url(#inactiveBotFacet-${label})`} />
            <polygon points="31,26.5 18,34 18,27 24,22" fill={`url(#inactiveBotFacet-${label})`} />
            <polygon points="18,9 24,14 24,22 18,27 12,22 12,14" fill="#17120e" />
          </>
        )}
      </svg>

      <span
        className={cn(
          'absolute font-black select-none leading-none',
          isAll ? 'text-[8px] sm:text-[9px] tracking-tight' : 'text-[11px] sm:text-xs',
          isActive ? 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]' : 'text-[#9e8b75] drop-shadow-[0_1px_1px_rgba(0,0,0,0.85)]'
        )}
      >
        {label}
      </span>
    </button>
  );
}

export function ManaCostBadge({
  cost,
  size = 'md',
  className,
}: {
  cost: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeStyles = {
    sm: 'w-5 h-5 text-[11px]',
    md: 'w-6 h-6 sm:w-7 sm:h-7 text-xs sm:text-sm',
    lg: 'w-8 h-8 text-sm',
  };

  return (
    <div
      className={cn(
        'rounded-full bg-gradient-to-b from-[#38bdf8] via-[#1d4ed8] to-[#0c1a38] border border-[#e0f2fe] text-white font-black flex items-center justify-center shadow drop-shadow-sm select-none',
        sizeStyles[size],
        className
      )}
    >
      {cost}
    </div>
  );
}
