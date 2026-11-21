import React from 'react';
import { motion } from 'motion/react';
import type { VisualEffectEvent } from './types.ts';

export const ArcaneVisualEffect: React.FC<{ effect: VisualEffectEvent }> = ({ effect }) => {
  const { startX, startY, targetX = startX, targetY = startY, isAoE, durationMs = 550 } = effect;

  const dx = targetX - startX;
  const dy = targetY - startY;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  const flightDuration = Math.max(0.2, (durationMs * 0.45) / 1000);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* 1. Arcane Violet Starburst Bolt */}
      <motion.div
        data-testid="spell-projectile"
        initial={{ x: startX, y: startY, scale: 0.5, opacity: 0.2 }}
        animate={{
          x: [startX, startX + dx * 0.5 + (isAoE ? 20 : 0), targetX],
          y: [startY, startY + dy * 0.5 - 35, targetY],
          scale: [0.6, 1.3, 1],
          opacity: [0.4, 1, 0.9],
        }}
        transition={{
          duration: flightDuration,
          ease: [0.16, 1, 0.3, 1],
        }}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          transformOrigin: 'center center',
          filter: 'drop-shadow(0 0 18px rgba(168, 85, 247, 0.95)) drop-shadow(0 0 32px rgba(236, 72, 153, 0.9))',
        }}
        className="z-50 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      >
        <div style={{ transform: `rotate(${angle}deg)` }} className="relative flex items-center justify-center pointer-events-none">
          {/* Stardust Stream Tail */}
          <div className="absolute right-3 w-20 h-5 bg-gradient-to-l from-fuchsia-400 via-purple-600/80 to-transparent rounded-full blur-[2px] opacity-85 animate-pulse pointer-events-none" />

          {/* Stardust Sparkles Trailing */}
          {[-12, -24, -36].map((offset, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-pink-200 shadow-[0_0_8px_#c084fc] animate-ping opacity-85 pointer-events-none"
              style={{
                right: `${20 - offset}px`,
                top: `${(i % 2 === 0 ? 1 : -1) * (4 + i * 2)}px`,
                animationDuration: `${0.3 + i * 0.08}s`,
              }}
            />
          ))}

          {/* Kirin Tor Arcane Starburst Core */}
          <svg viewBox="0 0 50 50" className="w-12 h-12 relative z-10 pointer-events-none" fill="none">
            <defs>
              <radialGradient id="arcaneCoreGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="30%" stopColor="#f472b6" />
                <stop offset="65%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#6b21a8" />
              </radialGradient>
            </defs>
            {/* Outer Diamond Rune Halo */}
            <rect
              x="12"
              y="12"
              width="26"
              height="26"
              rx="4"
              transform="rotate(45 25 25)"
              stroke="#e879f9"
              strokeWidth="1.5"
              fill="none"
              opacity="0.8"
            />
            {/* Glowing Orb */}
            <circle cx="25" cy="25" r="14" fill="url(#arcaneCoreGrad)" />
            {/* 4 Point Star Core */}
            <path
              d="M25 10 L28 22 L40 25 L28 28 L25 40 L22 28 L10 25 L22 22 Z"
              fill="#ffffff"
              opacity="0.95"
            />
          </svg>
        </div>
      </motion.div>

      {/* 2. Arcane Impact / Kirin Tor Glyph Flare */}
      <div
        data-testid="spell-impact"
        style={{
          position: 'fixed',
          left: isAoE ? '50%' : `${targetX}px`,
          top: isAoE ? '40%' : `${targetY}px`,
        }}
        className="z-50 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      >
        {isAoE ? (
          /* Celestial Starfall / Arcane Barrage for AoE (Astral Rain, Arcane Missiles) */
          <div className="relative w-[650px] max-w-[90vw] h-48 flex items-center justify-center">
            {/* Arcane Leyline Ground Aura */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [0.8, 1.15, 1], opacity: [0, 0.9, 0.75, 0] }}
              transition={{ duration: durationMs / 1000, ease: 'easeOut' }}
              className="absolute inset-0 rounded-3xl bg-radial from-purple-500/35 via-fuchsia-800/20 to-transparent blur-xl"
            />

            {/* Falling Starburst Streaks */}
            {[-200, -120, -40, 40, 120, 200].map((xOff, idx) => (
              <motion.div
                key={idx}
                initial={{
                  x: xOff - 30,
                  y: -60,
                  opacity: 0,
                  scale: 0.5,
                }}
                animate={{
                  x: [xOff - 30, xOff],
                  y: [-60, 40],
                  opacity: [0, 1, 0.8, 0],
                  scale: [0.5, 1.3, 0.8],
                }}
                transition={{
                  duration: 0.45,
                  delay: idx * 0.05,
                  ease: 'easeOut',
                }}
                style={{
                  position: 'absolute',
                  filter: 'drop-shadow(0 0 16px #c084fc)',
                }}
              >
                <div className="relative w-8 h-8 flex items-center justify-center pointer-events-none">
                  <div className="absolute inset-0 rounded-full bg-fuchsia-400/40 blur-[4px] animate-ping pointer-events-none" />
                  <svg viewBox="0 0 32 32" className="w-8 h-8 pointer-events-none" fill="none">
                    <circle cx="16" cy="16" r="6" fill="#ffffff" />
                    <path
                      d="M16 2 L19 13 L30 16 L19 19 L16 30 L13 19 L2 16 L13 13 Z"
                      fill="#e879f9"
                    />
                  </svg>
                </div>
              </motion.div>
            ))}

            {/* Pulsing Kirin Tor Eye Glyph In Center */}
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: [0.4, 1.2, 1], opacity: [0, 0.95, 0] }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="relative w-28 h-28 flex items-center justify-center pointer-events-none"
            >
              <svg viewBox="0 0 100 100" className="w-full h-full pointer-events-none" fill="none">
                <circle cx="50" cy="50" r="44" stroke="#d946ef" strokeWidth="2" strokeDasharray="4 2" />
                <circle cx="50" cy="50" r="32" stroke="#a855f7" strokeWidth="1.5" />
                <polygon points="50,18 78,66 22,66" stroke="#f472b6" strokeWidth="1.5" fill="none" />
                <polygon points="50,82 78,34 22,34" stroke="#f472b6" strokeWidth="1.5" fill="none" />
                <circle cx="50" cy="50" r="8" fill="#ffffff" />
              </svg>
            </motion.div>
          </div>
        ) : (
          /* Single Target Arcane Flare & Kirin Tor Rune Burst */
          <div className="relative w-40 h-40 flex items-center justify-center">
            {/* Concentric Mana Shockwave Rings */}
            <motion.div
              initial={{ scale: 0.2, opacity: 0.95 }}
              animate={{ scale: [0.2, 1.75, 2.15], opacity: [0.95, 0.75, 0] }}
              transition={{ duration: 0.45, ease: 'easeOut', delay: flightDuration * 0.7 }}
              className="absolute inset-0 rounded-full border-4 border-fuchsia-400 bg-radial from-purple-500/40 via-pink-600/25 to-transparent blur-sm"
            />
            <motion.div
              initial={{ scale: 0.1, opacity: 1 }}
              animate={{ scale: [0.1, 1.35, 1.65], opacity: [1, 0.85, 0] }}
              transition={{ duration: 0.4, ease: 'easeOut', delay: flightDuration * 0.8 }}
              className="absolute inset-4 rounded-full border-2 border-purple-300 bg-fuchsia-300/30"
            />

            {/* Pulsing Kirin Tor Hexagram Rune Glyph */}
            <motion.div
              initial={{ scale: 0.3, rotate: 0, opacity: 0 }}
              animate={{
                scale: [0.3, 1.35, 1.1],
                rotate: [0, 60],
                opacity: [0, 1, 0],
              }}
              transition={{ duration: 0.45, ease: 'easeOut', delay: flightDuration * 0.75 }}
              style={{ filter: 'drop-shadow(0 0 25px #c084fc) drop-shadow(0 0 45px #a855f7)' }}
              className="relative w-28 h-28 flex items-center justify-center pointer-events-none"
            >
              <svg viewBox="0 0 100 100" className="w-full h-full pointer-events-none" fill="none">
                <circle cx="50" cy="50" r="42" stroke="#e879f9" strokeWidth="2" strokeDasharray="6 3" />
                <polygon points="50,15 80,68 20,68" stroke="#f472b6" strokeWidth="2" fill="rgba(168,85,247,0.15)" />
                <polygon points="50,85 80,32 20,32" stroke="#f472b6" strokeWidth="2" fill="rgba(168,85,247,0.15)" />
                <circle cx="50" cy="50" r="10" fill="#ffffff" />
                {/* 6 orbital runic dots */}
                {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                  <circle
                    key={i}
                    cx={50 + Math.cos((deg * Math.PI) / 180) * 36}
                    cy={50 + Math.sin((deg * Math.PI) / 180) * 36}
                    r="3.5"
                    fill="#fef08a"
                  />
                ))}
              </svg>
            </motion.div>

            {/* Arcane Starburst Flares Flying Outward */}
            {Array.from({ length: 10 }).map((_, i) => {
              const flareAngle = (i / 10) * Math.PI * 2;
              const flareDist = 60 + (i % 2) * 20;
              return (
                <motion.div
                  key={i}
                  initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                  animate={{
                    x: Math.cos(flareAngle) * flareDist,
                    y: Math.sin(flareAngle) * flareDist,
                    scale: [1, 1.4, 0],
                    opacity: [1, 0.9, 0],
                  }}
                  transition={{
                    duration: 0.4,
                    delay: flightDuration * 0.8,
                    ease: 'easeOut',
                  }}
                  className="absolute w-2.5 h-2.5 rounded-full bg-pink-100 shadow-[0_0_12px_#ec4899]"
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
