import React from 'react';

interface SettingsCogMedallionProps {
  onClick: () => void;
}

export const SettingsCogMedallion: React.FC<SettingsCogMedallionProps> = ({ onClick }) => {
  return (
    <div className="flex-shrink-0 mb-2 z-30 select-none">
      <button
        type="button"
        data-testid="battlefield-menu-button"
        data-menu-test="battle-menu-button"
        onClick={onClick}
        title="Game Menu & Options"
        className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full p-0.5 bg-gradient-to-br from-[#4a2e16] via-[#2c180b] to-[#140a04] border-2 border-[#8e6129] shadow-[0_4px_16px_rgba(0,0,0,0.9),inset_0_2px_4px_rgba(255,255,255,0.2)] flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 hover:border-[#f5c451] active:scale-95 group"
      >
        {/* Recessed Walnut Core with Brushed Brass Bevel */}
        <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#1f1208] via-[#2a170b] to-[#150a04] border border-[#6b471c] shadow-inner flex items-center justify-center">
          {/* Ornate Brass Cog SVG */}
          <svg
            className="w-6 h-6 text-[#d4af37] group-hover:text-[#fef08a] transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 15a3 3 0 100-6 3 3 0 000 6zm-1.5-12.75a1.5 1.5 0 013 0v.684a7.514 7.514 0 012.355.975l.484-.484a1.5 1.5 0 012.121 2.121l-.484.484c.42.715.753 1.51.975 2.355h.684a1.5 1.5 0 010 3h-.684a7.514 7.514 0 01-.975 2.355l.484.484a1.5 1.5 0 01-2.121 2.121l-.484-.484a7.514 7.514 0 01-2.355.975v.684a1.5 1.5 0 01-3 0v-.684a7.514 7.514 0 01-2.355-.975l-.484.484a1.5 1.5 0 01-2.121-2.121l.484-.484a7.514 7.514 0 01-.975-2.355H2.25a1.5 1.5 0 010-3h.684a7.514 7.514 0 01.975-2.355l-.484-.484a1.5 1.5 0 012.121-2.121l.484.484a7.514 7.514 0 012.355-.975V2.25z"
            />
          </svg>
        </div>
      </button>
    </div>
  );
};
