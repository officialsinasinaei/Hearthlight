import { CardRarity } from '../../engine/types';

export interface RarityConfig {
  label: string;
  textColor: string;
  facetTopL: string;
  facetTopR: string;
  facetBotL: string;
  facetBotR: string;
  stroke: string;
  glow: string;
}

const RARITY_CONFIGS: Record<CardRarity, RarityConfig> = {
  COMMON: {
    label: 'Common',
    textColor: '#d6cfc4',
    facetTopL: '#e6ded4',
    facetTopR: '#d6cfc4',
    facetBotL: '#9d9387',
    facetBotR: '#70685e',
    stroke: '#423b32',
    glow: 'rgba(214, 207, 196, 0.45)',
  },
  RARE: {
    label: 'Rare',
    textColor: '#69b4ff',
    facetTopL: '#9ecaff',
    facetTopR: '#69b4ff',
    facetBotL: '#2570e3',
    facetBotR: '#1148ab',
    stroke: '#0d3278',
    glow: 'rgba(105, 180, 255, 0.6)',
  },
  EPIC: {
    label: 'Epic',
    textColor: '#c58aff',
    facetTopL: '#deb3ff',
    facetTopR: '#c58aff',
    facetBotL: '#9438d8',
    facetBotR: '#5c1696',
    stroke: '#3b0b63',
    glow: 'rgba(197, 138, 255, 0.6)',
  },
  LEGENDARY: {
    label: 'Legendary',
    textColor: '#f5c451',
    facetTopL: '#ffec9e',
    facetTopR: '#f5c451',
    facetBotL: '#d97c11',
    facetBotR: '#8a4800',
    stroke: '#5c2d00',
    glow: 'rgba(245, 196, 81, 0.65)',
  },
};

export function RarityGemIcon({ rarity, size = 11 }: { rarity: CardRarity; size?: number }) {
  const cfg = RARITY_CONFIGS[rarity] || RARITY_CONFIGS.COMMON;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className="shrink-0"
      style={{ filter: `drop-shadow(0 0 3px ${cfg.glow})` }}
      aria-hidden="true"
    >
      <polygon points="8,1 14,5.5 8,15 2,5.5" stroke={cfg.stroke} strokeWidth="0.8" />
      <polygon points="8,1 2,5.5 8,6.5" fill={cfg.facetTopL} />
      <polygon points="8,1 14,5.5 8,6.5" fill={cfg.facetTopR} />
      <polygon points="2,5.5 8,15 8,6.5" fill={cfg.facetBotL} />
      <polygon points="14,5.5 8,15 8,6.5" fill={cfg.facetBotR} />
      <polygon points="8,2.2 11,5.5 8,8.2 5,5.5" fill="rgba(255, 255, 255, 0.45)" />
      <circle cx="7.2" cy="4.2" r="0.9" fill="#ffffff" fillOpacity="0.85" />
    </svg>
  );
}

export function RarityBadge({ rarity, className = '' }: { rarity: CardRarity; className?: string }) {
  const cfg = RARITY_CONFIGS[rarity] || RARITY_CONFIGS.COMMON;

  return (
    <div
      data-testid="rarity-badge"
      className={`inline-flex items-center gap-0.5 md:gap-1 px-1 md:px-2 py-[1px] md:py-0.5 rounded-[4px] bg-[#1d150f] border border-[#8e6328]/60 shadow-[inset_0_1px_3px_rgba(0,0,0,0.85),0_1px_2px_rgba(0,0,0,0.35)] max-w-full w-fit whitespace-nowrap ${className}`}
    >
      <RarityGemIcon rarity={rarity} size={6.5} />
      <span
        className="font-serif text-[7px] md:text-[9.5px] font-extrabold uppercase tracking-[0.01em] md:tracking-wider leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)] whitespace-nowrap"
        style={{ color: cfg.textColor }}
      >
        {cfg.label}
      </span>
    </div>
  );
}
