import React from 'react';
import type { BattleHero } from '../../engine/battleEngine.ts';

interface HeroPortraitMedallionProps {
  hero: BattleHero;
  isPlayer: boolean;
  isPlayerTurn: boolean;
  isCompact?: boolean;
  onHeroPointerEnter?: () => void;
  onHeroPointerLeave?: () => void;
  onHeroPointerUp?: () => void;
  onHeroClick?: () => void;
  onHeroPowerPointerDown?: (e: React.PointerEvent<HTMLButtonElement>) => void;
}

export const HeroPortraitMedallion: React.FC<HeroPortraitMedallionProps> = ({
  hero,
  isPlayer,
  isPlayerTurn,
  isCompact = false,
  onHeroPointerEnter,
  onHeroPointerLeave,
  onHeroPointerUp,
  onHeroClick,
  onHeroPowerPointerDown,
}) => {
  const canUseHeroPower =
    isPlayer && isPlayerTurn && !hero.heroPowerUsed && hero.mana >= hero.heroPowerCost;

  return (
    <div className={`flex items-center ${isCompact ? 'gap-2' : 'gap-4'} flex-shrink-0 z-20 select-none`}>
      {/* Gilded-Arch Portrait Medallion Container */}
      <div
        data-testid={`${hero.id}-hero`}
        data-target-id={hero.id}
        onPointerEnter={onHeroPointerEnter}
        onPointerLeave={onHeroPointerLeave}
        onPointerUp={onHeroPointerUp}
        onClick={onHeroClick}
        className={`relative ${
          isCompact ? 'w-[54px] h-[66px]' : 'w-[88px] h-[104px]'
        } flex items-center justify-center cursor-crosshair group hover:scale-105 transition-transform`}
      >
        {/* Recessed Floor Shadow */}
        <div className="absolute inset-0 rounded-[24px] bg-black/60 blur-md -z-10 pointer-events-none" />

        {/* Sculpted Gilded Arch Frame */}
        <div
          className={`w-full h-full ${
            isCompact ? 'rounded-[18px] border-2' : 'rounded-[28px] border-4'
          } border-[#c59b27] bg-[#1a120b] shadow-[0_6px_20px_rgba(0,0,0,0.95),inset_0_2px_4px_rgba(255,255,255,0.3)] overflow-hidden flex items-center justify-center relative`}
        >
          <img
            src={hero.portraitUrl}
            alt={hero.name}
            className="w-full h-full object-cover object-top select-none pointer-events-none"
          />

          {/* Golden Arch Bezel Sheen */}
          <div className="absolute inset-0 rounded-[20px] border border-amber-300/30 pointer-events-none" />
        </div>

        {/* Raised Crimson Blood-Drop Health Gem (Outside Overflow) */}
        <div
          title={`Health: ${hero.hp}/${hero.maxHp}`}
          className={`absolute ${
            isCompact ? '-bottom-1 -right-1.5 w-[30px] h-[36px]' : '-bottom-2 -right-3 w-[44px] h-[52px]'
          } z-30 rounded-b-full bg-gradient-to-b from-[#dc2626] via-[#991b1b] to-[#450a0a] border-2 border-[#fca5a5] flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.95),inset_0_2px_3px_rgba(255,255,255,0.4)]`}
        >
          <span
            data-testid={`${hero.id}-hero-hp`}
            className={`${
              isCompact ? 'text-xs' : 'text-xl'
            } font-black font-serif text-white tabular-nums drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]`}
          >
            {hero.hp}
          </span>
        </div>

        {/* Armored Crest Shield (Visible when Armor > 0) */}
        {hero.armor > 0 && (
          <div
            title={`Armor: ${hero.armor}`}
            className={`absolute ${
              isCompact ? '-bottom-1 -left-1.5 w-[26px] h-[32px]' : '-bottom-2 -left-3 w-[40px] h-[48px]'
            } z-30 rounded-b-lg bg-gradient-to-b from-[#94a3b8] via-[#64748b] to-[#334155] border-2 border-[#f8fafc] flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.95)]`}
          >
            <span
              className={`${
                isCompact ? 'text-[9px]' : 'text-sm'
              } font-black text-white font-serif tabular-nums drop-shadow`}
            >
              {hero.armor}
            </span>
          </div>
        )}
      </div>

      {/* Docked Circular Hero Power Medallion */}
      <button
        type="button"
        data-testid={isPlayer ? 'player-hero-power' : undefined}
        onPointerDown={onHeroPowerPointerDown}
        disabled={!canUseHeroPower}
        aria-disabled={!canUseHeroPower}
        title={`${hero.heroPowerName} (${hero.heroPowerCost} Mana)`}
        className={`relative ${
          isCompact ? 'w-[38px] h-[38px] border-2' : 'w-[58px] h-[58px] border-3'
        } rounded-full transition-all transform ${
          canUseHeroPower
            ? 'border-emerald-400 shadow-[0_0_20px_rgba(34,197,94,0.9)] cursor-pointer hover:scale-105 active:scale-95'
            : 'border-[#5c3e21] opacity-65 cursor-not-allowed'
        }`}
      >
        {/* Power Artwork */}
        <div className="w-full h-full rounded-full overflow-hidden bg-[#160e08] shadow-inner">
          <img
            src={hero.heroPowerUrl}
            alt={hero.heroPowerName}
            className={`w-full h-full object-cover select-none pointer-events-none transition-all ${
              hero.heroPowerUsed ? 'grayscale brightness-40' : ''
            }`}
          />
        </div>

        {/* 2-Mana Cost Sapphire Gem */}
        <div
          className={`absolute -top-1 left-1/2 -translate-x-1/2 ${
            isCompact ? 'px-1 py-0.2 text-[8px]' : 'px-2 py-0.5 text-xs'
          } rounded-full bg-blue-600 border border-blue-200 font-black text-white font-serif tabular-nums shadow`}
        >
          {hero.heroPowerCost}
        </div>
      </button>
    </div>
  );
};
