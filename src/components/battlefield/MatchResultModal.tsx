import React from 'react';
import { useBattleStore } from '../../store/useBattleStore.ts';
import { useAppStore } from '../../store/useAppStore.ts';

export const MatchResultModal: React.FC = () => {
  const battle = useBattleStore((s) => s.battle);
  const navigateTo = useAppStore((s) => s.navigateTo);

  if (!battle || battle.phase !== 'GAME_OVER' || !battle.winner) return null;

  const isVictory = battle.winner === 'player';

  const handleReturnToMenu = () => {
    navigateTo('MAIN_MENU');
  };

  return (
    <div
      data-testid="match-result-modal"
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none animate-fadeIn"
    >
      <div className="relative flex flex-col items-center max-w-md w-full p-8 rounded-3xl bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 border-4 border-amber-600/70 shadow-[0_0_60px_rgba(0,0,0,0.9)] text-center animate-scaleIn">
        {/* Glow backdrop aura */}
        <div
          className={`absolute -inset-4 rounded-full blur-2xl opacity-40 pointer-events-none ${
            isVictory ? 'bg-amber-400' : 'bg-red-600'
          }`}
        />

        {/* Banner Crest */}
        <div className="relative mb-6">
          <div
            className={`w-32 h-32 rounded-full flex items-center justify-center border-4 shadow-2xl ${
              isVictory
                ? 'bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 border-yellow-200 shadow-yellow-500/50'
                : 'bg-gradient-to-tr from-red-950 via-red-800 to-stone-900 border-red-500 shadow-red-900/60'
            }`}
          >
            <span className="text-6xl drop-shadow-lg">
              {isVictory ? '👑' : '💀'}
            </span>
          </div>
        </div>

        {/* Title */}
        <h2
          className={`text-4xl sm:text-5xl font-serif font-black tracking-wider uppercase drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] mb-2 ${
            isVictory
              ? 'text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-yellow-300 to-amber-500'
              : 'text-transparent bg-clip-text bg-gradient-to-b from-red-200 via-red-500 to-red-800'
          }`}
        >
          {isVictory ? 'Victory!' : 'Defeat!'}
        </h2>

        {/* Subtitle */}
        <p className="text-base font-serif text-stone-300 mb-8 max-w-xs">
          {isVictory
            ? 'The Archmage stands triumphant in the arcane arena!'
            : 'Your spells were extinguished... Retreat to the tavern and regroup!'}
        </p>

        {/* Return Button */}
        <button
          type="button"
          data-testid="return-to-menu-button"
          onClick={handleReturnToMenu}
          className="relative px-8 py-3.5 rounded-full font-serif font-bold text-lg text-amber-100 tracking-wider uppercase transition-all duration-200 transform hover:scale-105 active:scale-95 border-2 border-amber-400/80 bg-gradient-to-r from-amber-800 via-amber-700 to-amber-900 hover:from-amber-700 hover:to-amber-800 shadow-[0_0_25px_rgba(217,119,6,0.6)]"
        >
          Return to Menu
        </button>
      </div>
    </div>
  );
};
