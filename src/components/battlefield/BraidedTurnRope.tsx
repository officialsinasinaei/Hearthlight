import React from 'react';

interface BraidedTurnRopeProps {
  timeRemaining: number;
  totalDuration?: number;
}

export const BraidedTurnRope: React.FC<BraidedTurnRopeProps> = ({
  timeRemaining,
  totalDuration = 20,
}) => {
  const progress = Math.max(0, Math.min(1, timeRemaining / totalDuration));
  const ropePercent = progress * 100;

  return (
    <div
      data-testid="turn-rope"
      className="absolute inset-x-6 sm:inset-x-12 h-6 flex items-center pointer-events-none z-30"
    >
      {/* Recessed Dark Ash Groove */}
      <div
        data-testid="charred-ash-trail"
        className="w-full h-3 rounded-full bg-[#120a06] border border-[#2b180d] shadow-[inset_0_2px_6px_rgba(0,0,0,0.9),0_1px_2px_rgba(255,255,255,0.05)] relative overflow-visible flex items-center"
      >
        {/* Ash Layer with Charcoal Specks */}
        <div
          className="absolute inset-0 rounded-full opacity-60 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, #2e1d13 1px, transparent 2px), radial-gradient(circle at 60% 30%, #1f120a 1.5px, transparent 2px)`,
            backgroundSize: '16px 12px',
          }}
        />

        {/* Smoldering Ember Trail behind the flame */}
        <div
          className="absolute left-0 h-full rounded-l-full bg-gradient-to-r from-transparent via-[#451408] to-[#801c05] opacity-50"
          style={{ width: `${ropePercent}%` }}
        />

        {/* Dynamic Braided Hemp Rope */}
        <div
          className="h-full relative overflow-visible transition-all duration-1000 ease-linear flex items-center"
          style={{ width: `${ropePercent}%` }}
        >
          {/* SVG Multi-Strand Twisted Hemp Rope */}
          <svg
            data-testid="braided-hemp-rope"
            className="w-full h-3 filter drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)]"
            preserveAspectRatio="none"
          >
            <defs>
              <pattern
                id="hempRopePattern"
                width="18"
                height="12"
                patternUnits="userSpaceOnUse"
              >
                {/* 3-Strand Twisted Hemp Strands */}
                <path
                  d="M 0 0 Q 4 6 9 12 M 9 0 Q 13 6 18 12 M -9 0 Q -5 6 0 12"
                  stroke="#593b1d"
                  strokeWidth="3.5"
                  fill="none"
                />
                <path
                  d="M 2 0 Q 6 6 11 12 M 11 0 Q 15 6 20 12 M -7 0 Q -3 6 2 12"
                  stroke="#b3874b"
                  strokeWidth="2.5"
                  fill="none"
                />
                <path
                  d="M 3 0 Q 7 6 12 12 M 12 0 Q 16 6 21 12 M -6 0 Q -2 6 3 12"
                  stroke="#e2bb7b"
                  strokeWidth="1.2"
                  fill="none"
                />
                {/* Dark crevice shadows */}
                <line x1="0" y1="0" x2="0" y2="12" stroke="#2b1a0d" strokeWidth="1" />
                <line x1="9" y1="0" x2="9" y2="12" stroke="#2b1a0d" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" rx="3" fill="url(#hempRopePattern)" />
          </svg>

          {/* Incandescent Glowing Ember Core at Live Burn Tip */}
          <div
            data-testid="rope-ember-tip"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-6 h-6 flex items-center justify-center pointer-events-none z-40"
          >
            {/* Ambient Radial Heat Sheen on Sandstone */}
            <div className="absolute w-20 h-16 rounded-full bg-gradient-to-r from-orange-600/35 via-amber-500/25 to-transparent blur-md -translate-x-3 pointer-events-none animate-pulse" />

            {/* Ember Core */}
            <div className="relative w-4 h-4 rounded-full bg-gradient-to-tr from-[#ff3300] via-[#ff8800] to-[#fff4cc] shadow-[0_0_14px_#ff5500,0_0_24px_#ff9900,0_0_4px_#ffffff] animate-pulse">
              {/* Inner Hot Center */}
              <div className="absolute inset-0.5 rounded-full bg-[#ffeedd] blur-[0.6px]" />
            </div>

            {/* Rising Sparks and Wisps */}
            <div className="absolute -top-3 right-0 w-1.5 h-1.5 rounded-full bg-yellow-300 shadow-[0_0_6px_#f59e0b] animate-bounce opacity-80" />
            <div
              className="absolute -top-5 right-2 w-1 h-1 rounded-full bg-orange-400 shadow-[0_0_4px_#ea580c] opacity-75"
              style={{
                animation: 'pulse 0.8s infinite alternate',
              }}
            />
            <div
              className="absolute -top-2 left-0 w-1 h-1 rounded-full bg-amber-200 shadow-[0_0_4px_#fde68a] opacity-90"
              style={{
                animation: 'ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
