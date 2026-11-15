import React from 'react';

interface CarvedManaTrayProps {
  mana: number;
  maxMana: number;
}

export const CarvedManaTray: React.FC<CarvedManaTrayProps> = ({ mana, maxMana }) => {
  return (
    <div
      data-testid="mana-crystal-tray"
      className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1 sm:py-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#161a22] via-[#0f131a] to-[#161a22] border sm:border-2 border-[#7c5421] shadow-[inset_0_2px_6px_rgba(0,0,0,0.9),0_4px_12px_rgba(0,0,0,0.85)] select-none"
    >
      {/* Individual Faceted Sapphire Mana Crystals */}
      <div className="flex items-center gap-0.5 sm:gap-1">
        {Array.from({ length: 10 }).map((_, idx) => {
          const isAvailable = idx < mana;
          const isUnlocked = idx < maxMana;
          if (!isUnlocked) return null;

          return (
            <div
              key={idx}
              title={`Mana Crystal ${idx + 1}: ${isAvailable ? 'Ready' : 'Spent'}`}
              className="relative w-3 h-4 sm:w-4 sm:h-5 flex items-center justify-center"
            >
              {isAvailable ? (
                /* Glowing Faceted Sapphire Crystal */
                <svg
                  className="w-full h-full filter drop-shadow-[0_0_6px_#38bdf8] animate-pulse"
                  viewBox="0 0 16 20"
                  fill="none"
                >
                  <polygon
                    points="8,1 15,6 15,14 8,19 1,14 1,6"
                    fill="url(#manaSapphireGrad)"
                    stroke="#bae6fd"
                    strokeWidth="1"
                  />
                  <polygon
                    points="8,4 12,7 12,13 8,16 4,13 4,7"
                    fill="url(#manaHighlightGrad)"
                    opacity="0.8"
                  />
                  <defs>
                    <linearGradient id="manaSapphireGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="50%" stopColor="#2563eb" />
                      <stop offset="100%" stopColor="#1e3a8a" />
                    </linearGradient>
                    <linearGradient id="manaHighlightGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.2" />
                    </linearGradient>
                  </defs>
                </svg>
              ) : (
                /* Empty Carved Socket in Slate */
                <svg className="w-full h-full opacity-35" viewBox="0 0 16 20" fill="none">
                  <polygon
                    points="8,1 15,6 15,14 8,19 1,14 1,6"
                    fill="#0f172a"
                    stroke="#334155"
                    strokeWidth="1"
                  />
                </svg>
              )}
            </div>
          );
        })}
      </div>

      {/* Numeric Readout in Crisp Sapphire-Gold */}
      <span className="text-xs sm:text-sm font-serif font-black text-sky-200 ml-1.5 tabular-nums drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
        {mana}/{maxMana}
      </span>
    </div>
  );
};
