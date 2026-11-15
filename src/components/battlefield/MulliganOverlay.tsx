import React, { useState } from 'react';
import { useBattleStore } from '../../store/useBattleStore.ts';
import { playRatchetTick } from '../../utils/tavernAudio.ts';

const KEYWORD_DESCRIPTIONS: Record<string, string> = {
  Battlecry: 'Does something when you play it from your hand.',
  Freeze: 'Frozen characters lose their next attack.',
  Taunt: 'Enemies must attack this minion.',
  'Divine Shield': 'The first time this minion takes damage, ignore it.',
  'Spell Damage': 'Your damage spells deal additional damage.',
  Lifesteal: 'Damage dealt also heals your hero.',
  Rush: 'Can attack minions immediately.',
  Charge: 'Can attack immediately.',
  Windfury: 'Can attack twice each turn.',
  Deathrattle: 'Does something when this minion dies.',
  Secret: 'Hidden until a specific action triggers it on your opponent’s turn.',
  Discover: 'Choose one of three random cards to add to your hand.',
};



export const MulliganOverlay: React.FC = () => {
  const battle = useBattleStore((s) => s.battle);
  const confirmMulligan = useBattleStore((s) => s.confirmMulligan);

  const [replacedIds, setReplacedIds] = useState<string[]>([]);

  if (!battle || battle.phase !== 'MULLIGAN') return null;

  const cards = battle.player.hand;

  const toggleReplace = (id: string) => {
    playRatchetTick(1.1);
    setReplacedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleConfirm = () => {
    confirmMulligan(replacedIds);
  };

  // Extract keywords present on the offered mulligan cards
  const allDetectedKeywords = new Set<string>();
  cards.forEach((c) => {
    const textLower = (c.text || '').toLowerCase();
    if (textLower.includes('battlecry')) allDetectedKeywords.add('Battlecry');
    if (textLower.includes('freeze')) allDetectedKeywords.add('Freeze');
    if (textLower.includes('taunt')) allDetectedKeywords.add('Taunt');
    if (textLower.includes('divine shield')) allDetectedKeywords.add('Divine Shield');
    if (textLower.includes('spell damage')) allDetectedKeywords.add('Spell Damage');
    if (textLower.includes('deathrattle')) allDetectedKeywords.add('Deathrattle');
    if (textLower.includes('secret')) allDetectedKeywords.add('Secret');
    if (textLower.includes('discover')) allDetectedKeywords.add('Discover');
  });

  return (
    <div
      data-testid="mulligan-overlay"
      className="fixed inset-0 z-40 flex flex-col items-center justify-between py-6 px-4 select-none bg-black/75 backdrop-blur-[2px] overflow-hidden animate-fadeIn"
    >
      {/* Top Banner Ribbon (Matching Hearthstone Reference Image 1) */}
      <div className="relative mt-2 flex flex-col items-center animate-slideDown">
        <div className="relative px-14 py-3 rounded-full bg-gradient-to-r from-amber-950 via-amber-800 to-amber-950 border-2 border-amber-400 shadow-[0_0_35px_rgba(59,130,246,0.6)] backdrop-blur-sm">
          {/* Decorative Corner Orbs */}
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 border-amber-300 bg-amber-900 shadow-md" />
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 border-amber-300 bg-amber-900 shadow-md" />

          <h1 className="text-3xl sm:text-4xl font-serif font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-yellow-200 to-amber-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] text-center">
            Starting Hand
          </h1>
          <p className="text-sm sm:text-base font-serif font-semibold text-amber-300/90 tracking-wide text-center mt-0.5">
            Keep or Replace Cards
          </p>
        </div>
      </div>

      {/* Main Center Area: Cards Lineup with Keyword Tooltips to the right (Ref Image 1) */}
      <div className="relative flex flex-row items-center justify-center gap-6 sm:gap-10 my-auto px-4 max-w-6xl w-full">
        {/* Cards Row */}
        <div className="flex flex-row items-center justify-center gap-4 sm:gap-8">
          {cards.map((card) => {
            const isReplaced = replacedIds.includes(card.instanceId);
            return (
              <div
                key={card.instanceId}
                data-testid="mulligan-card"
                onClick={() => toggleReplace(card.instanceId)}
                className={`relative cursor-pointer transition-all duration-200 transform group ${
                  isReplaced
                    ? 'scale-95 brightness-75'
                    : 'hover:scale-105 hover:-translate-y-2'
                }`}
              >
                {/* Full-Bleed Hearthstone Card Artwork with Crisp Silhouette */}
                <div
                  className={`relative w-44 sm:w-52 h-64 sm:h-76 rounded-[28px] transition-all duration-300 flex items-center justify-center ${
                    isReplaced
                      ? 'ring-4 ring-red-600 shadow-[0_0_25px_rgba(220,38,38,0.85)]'
                      : 'ring-4 ring-emerald-400 shadow-[0_0_30px_rgba(34,197,94,0.95)]'
                  }`}
                >
                  <img
                    src={`/art/cards/${card.definitionId}.png`}
                    alt={card.name}
                    className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.9)] select-none pointer-events-none"
                  />

                  {/* Stamped Red 'X' for Replace (Matches Hearthstone Ref Image 1) */}
                  {isReplaced && (
                    <div
                      data-testid="mulligan-replace-x"
                      className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 animate-scaleIn"
                    >
                      <svg
                        viewBox="0 0 100 100"
                        className="w-40 h-40 filter drop-shadow-[0_0_15px_rgba(239,68,68,0.95)]"
                      >
                        <path
                          d="M 22 14 L 50 42 L 78 14 L 86 22 L 58 50 L 86 78 L 78 86 L 50 58 L 22 86 L 14 78 L 42 50 L 14 22 Z"
                          fill="#dc2626"
                          stroke="#fef2f2"
                          strokeWidth="3.5"
                        />
                        <path
                          d="M 24 18 L 50 44 L 76 18 L 82 24 L 56 50 L 82 76 L 76 82 L 50 56 L 24 82 L 18 76 L 44 50 L 18 24 Z"
                          fill="#b91c1c"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side Keyword Tooltip Plaques (Matches Hearthstone Ref Image 1) */}
        {allDetectedKeywords.size > 0 && (
          <div className="hidden md:flex flex-col gap-3 max-w-xs animate-fadeIn">
            {Array.from(allDetectedKeywords).map((kw) => (
              <div
                key={kw}
                className="flex flex-col p-3 rounded-xl bg-gradient-to-b from-stone-900 to-stone-950 border-2 border-stone-600 shadow-2xl text-left"
              >
                <span className="text-sm font-serif font-black text-amber-300 drop-shadow">
                  {kw}
                </span>
                <span className="text-xs font-sans text-stone-200 leading-snug mt-1">
                  {KEYWORD_DESCRIPTIONS[kw] || 'Special card keyword effect.'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Confirm Button */}
      <div className="mb-4 animate-slideUp">
        <button
          type="button"
          data-testid="mulligan-confirm-button"
          onClick={handleConfirm}
          className="relative group px-14 py-3.5 rounded-full font-serif font-black text-xl text-white tracking-widest uppercase transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-[0_0_35px_rgba(59,130,246,0.9)] border-2 border-cyan-300/90 bg-gradient-to-r from-blue-700 via-cyan-600 to-blue-700 hover:from-blue-600 hover:via-cyan-500 hover:to-blue-600 cursor-pointer"
        >
          <span className="relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            Confirm
          </span>
          <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-white/20 to-white/40 pointer-events-none" />
        </button>
      </div>
    </div>
  );
};
