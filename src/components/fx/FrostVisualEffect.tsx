import React from 'react';
import { motion } from 'motion/react';
import type { VisualEffectEvent } from './types.ts';

export const FrostVisualEffect: React.FC<{ effect: VisualEffectEvent }> = ({ effect }) => {
  const { startX, startY, targetX = startX, targetY = startY, isAoE, durationMs = 550 } = effect;

  const dx = targetX - startX;
  const dy = targetY - startY;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  const flightDuration = Math.max(0.2, (durationMs * 0.45) / 1000);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* 1. Crystalline Ice Shard Projectile */}
      <motion.div
        data-testid="spell-projectile"
        initial={{ x: startX, y: startY, scale: 0.6, opacity: 0.2 }}
        animate={{
          x: [startX, startX + dx * 0.5, targetX],
          y: [startY, startY + dy * 0.5 - 25, targetY],
          scale: [0.7, 1.2, 1],
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
          filter: 'drop-shadow(0 0 16px rgba(56, 189, 248, 0.95)) drop-shadow(0 0 28px rgba(186, 230, 253, 0.9))',
        }}
        className="z-50 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      >
        <div style={{ transform: `rotate(${angle}deg)` }} className="relative flex items-center justify-center pointer-events-none">
          {/* Frost Mist Trail */}
          <div className="absolute right-2 w-20 h-5 bg-gradient-to-l from-cyan-300 via-sky-500/70 to-transparent rounded-full blur-[3px] opacity-85 pointer-events-none" />

          {/* Icy Dust Particles Trailing */}
          {[-10, -20, -32].map((offset, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-cyan-100 shadow-[0_0_8px_#38bdf8] animate-ping opacity-80 pointer-events-none"
              style={{
                right: `${18 - offset}px`,
                top: `${(i % 2 === 0 ? 1 : -1) * (3 + i * 2)}px`,
                animationDuration: `${0.35 + i * 0.08}s`,
              }}
            />
          ))}

          {/* Faceted Crystalline Ice Shard Spear */}
          <svg viewBox="0 0 54 26" className="w-14 h-7 relative z-10 pointer-events-none" fill="none">
            <defs>
              <linearGradient id="frostShardGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="60%" stopColor="#bae6fd" />
                <stop offset="100%" stopColor="#ffffff" />
              </linearGradient>
            </defs>
            {/* Main Diamond Lance */}
            <polygon points="50,13 18,2 2,13 18,24" fill="url(#frostShardGrad)" opacity="0.95" />
            {/* Upper Facet */}
            <polygon points="50,13 18,2 18,13" fill="#ffffff" opacity="0.9" />
            {/* Lower Facet */}
            <polygon points="50,13 18,24 18,13" fill="#0284c7" opacity="0.75" />
            {/* Rear Shards */}
            <polygon points="22,13 6,6 10,13" fill="#e0f2fe" opacity="0.8" />
            <polygon points="22,13 6,20 10,13" fill="#0369a1" opacity="0.8" />
          </svg>
        </div>
      </motion.div>

      {/* 2. Frost Impact / Shatter */}
      <div
        data-testid="spell-impact"
        style={{
          position: 'fixed',
          left: isAoE ? '50%' : `${targetX}px`,
          top: isAoE ? '35%' : `${targetY}px`,
        }}
        className="z-50 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      >
        {isAoE ? (
          /* Howling Blizzard Storm for AoE (Blizzard, Foreboding Freeze) */
          <div className="relative w-[680px] max-w-[90vw] h-52 flex items-center justify-center">
            {/* Blizzard Swirling Cold Mist Floor */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [0.8, 1.1, 1], opacity: [0, 0.85, 0.7, 0] }}
              transition={{ duration: durationMs / 1000, ease: 'easeOut' }}
              className="absolute inset-0 rounded-3xl bg-radial from-cyan-500/35 via-sky-800/25 to-transparent blur-xl"
            />

            {/* Whistling Frost Wind Gusts */}
            {[-180, -90, 0, 90, 180].map((xOff, idx) => (
              <motion.div
                key={idx}
                initial={{ x: xOff - 80, opacity: 0 }}
                animate={{ x: [xOff - 80, xOff + 80], opacity: [0, 0.9, 0] }}
                transition={{
                  duration: 0.45,
                  delay: idx * 0.06,
                  ease: 'easeInOut',
                }}
                className="absolute h-1 w-36 bg-gradient-to-r from-transparent via-cyan-200 to-transparent blur-[1px]"
                style={{ top: `${30 + (idx % 3) * 35}px` }}
              />
            ))}

            {/* Swirling Dancing Ice Crystals & Snowflakes */}
            {Array.from({ length: 18 }).map((_, i) => {
              const startPosX = (i - 9) * 32;
              return (
                <motion.div
                  key={i}
                  initial={{
                    x: startPosX,
                    y: -40,
                    rotate: 0,
                    scale: 0.4,
                    opacity: 0,
                  }}
                  animate={{
                    y: [-40, 80 + (i % 4) * 20],
                    x: [startPosX, startPosX + (i % 2 === 0 ? 35 : -35)],
                    rotate: [0, (i % 2 === 0 ? 180 : -180)],
                    scale: [0.4, 1.2, 0.8],
                    opacity: [0, 1, 0.8, 0],
                  }}
                  transition={{
                    duration: 0.5,
                    delay: (i * 0.02) % 0.25,
                    ease: 'easeOut',
                  }}
                  style={{ filter: 'drop-shadow(0 0 10px #38bdf8)' }}
                  className="absolute pointer-events-none"
                >
                  <svg viewBox="0 0 24 24" className="w-6 h-6 pointer-events-none" fill="none">
                    <line x1="12" y1="2" x2="12" y2="22" stroke="#e0f2fe" strokeWidth="2" strokeLinecap="round" />
                    <line x1="2" y1="12" x2="22" y2="12" stroke="#e0f2fe" strokeWidth="2" strokeLinecap="round" />
                    <line x1="5" y1="5" x2="19" y2="19" stroke="#bae6fd" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="5" y1="19" x2="19" y2="5" stroke="#bae6fd" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="12" cy="12" r="2.5" fill="#ffffff" />
                  </svg>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* Single Target Frozen Shatter Shockwave (Frostbolt, Cold Snap, Deep Freeze) */
          <div className="relative w-40 h-40 flex items-center justify-center">
            {/* Concentric Frost Shockwave Ring */}
            <motion.div
              initial={{ scale: 0.2, opacity: 0.95 }}
              animate={{ scale: [0.2, 1.7, 2.1], opacity: [0.95, 0.8, 0] }}
              transition={{ duration: 0.45, ease: 'easeOut', delay: flightDuration * 0.7 }}
              className="absolute inset-0 rounded-full border-4 border-cyan-300 bg-radial from-cyan-400/40 via-sky-600/20 to-transparent blur-sm"
            />
            <motion.div
              initial={{ scale: 0.1, opacity: 1 }}
              animate={{ scale: [0.1, 1.3, 1.6], opacity: [1, 0.85, 0] }}
              transition={{ duration: 0.4, ease: 'easeOut', delay: flightDuration * 0.8 }}
              className="absolute inset-4 rounded-full border-2 border-white bg-cyan-200/30"
            />

            {/* Central Glacial Shatter Nova */}
            <motion.div
              initial={{ scale: 0.3, rotate: 0, opacity: 0 }}
              animate={{
                scale: [0.3, 1.35, 1.1],
                rotate: [0, 30],
                opacity: [0, 1, 0],
              }}
              transition={{ duration: 0.45, ease: 'easeOut', delay: flightDuration * 0.75 }}
              style={{ filter: 'drop-shadow(0 0 25px #00f0ff) drop-shadow(0 0 45px #38bdf8)' }}
              className="relative w-28 h-28 flex items-center justify-center pointer-events-none"
            >
              <svg viewBox="0 0 80 80" className="w-full h-full pointer-events-none" fill="none">
                {/* Center Ice Jewel */}
                <polygon points="40,24 54,40 40,56 26,40" fill="#ffffff" />
                {/* 8 Radial Sharp Ice Shards */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((ang, idx) => (
                  <polygon
                    key={idx}
                    points="40,40 37,12 40,4 43,12"
                    fill={idx % 2 === 0 ? '#ffffff' : '#7dd3fc'}
                    stroke="#0284c7"
                    strokeWidth="0.75"
                    transform={`rotate(${ang} 40 40)`}
                  />
                ))}
              </svg>
            </motion.div>

            {/* Flying Shattered Glacial Shards */}
            {Array.from({ length: 10 }).map((_, i) => {
              const shardAngle = (i / 10) * Math.PI * 2;
              const shardDist = 60 + (i % 3) * 18;
              return (
                <motion.div
                  key={i}
                  initial={{ x: 0, y: 0, scale: 1, opacity: 1, rotate: 0 }}
                  animate={{
                    x: Math.cos(shardAngle) * shardDist,
                    y: Math.sin(shardAngle) * shardDist,
                    rotate: [0, 120],
                    scale: [1, 1.2, 0],
                    opacity: [1, 0.9, 0],
                  }}
                  transition={{
                    duration: 0.4,
                    delay: flightDuration * 0.8,
                    ease: 'easeOut',
                  }}
                  className="absolute w-3 h-3 flex items-center justify-center"
                >
                  <div className="w-2.5 h-2.5 rotate-45 bg-gradient-to-tr from-cyan-300 to-white shadow-[0_0_8px_#38bdf8]" />
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
