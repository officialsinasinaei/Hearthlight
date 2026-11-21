import React from 'react';
import { motion } from 'motion/react';
import type { VisualEffectEvent } from './types.ts';

export const FireVisualEffect: React.FC<{ effect: VisualEffectEvent }> = ({ effect }) => {
  const { startX, startY, targetX = startX, targetY = startY, isAoE, durationMs = 550 } = effect;

  const dx = targetX - startX;
  const dy = targetY - startY;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  const flightDuration = Math.max(0.2, (durationMs * 0.45) / 1000);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* 1. Fire Projectile */}
      <motion.div
        data-testid="spell-projectile"
        initial={{ x: startX, y: startY, scale: 0.6, opacity: 0.2 }}
        animate={{
          x: [startX, startX + dx * 0.5, targetX],
          y: [startY, startY + dy * 0.5 - 30, targetY],
          scale: [0.7, 1.25, 1],
          opacity: [0.4, 1, 0.8],
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
          filter: 'drop-shadow(0 0 16px rgba(255, 68, 0, 0.95)) drop-shadow(0 0 30px rgba(245, 158, 11, 0.8))',
        }}
        className="z-50 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      >
        <div style={{ transform: `rotate(${angle}deg)` }} className="relative flex items-center justify-center pointer-events-none">
          {/* Flame Tail / Streak */}
          <div className="absolute right-3 w-16 h-5 bg-gradient-to-l from-amber-400 via-orange-600 to-transparent rounded-full blur-[2px] opacity-80 animate-pulse pointer-events-none" />

          {/* Embers Trailing Behind */}
          {[-12, -22, -34].map((offset, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-amber-300 animate-ping opacity-75 pointer-events-none"
              style={{
                right: `${20 - offset}px`,
                top: `${(i % 2 === 0 ? 1 : -1) * (4 + i * 2)}px`,
                animationDuration: `${0.3 + i * 0.1}s`,
              }}
            />
          ))}

          {/* Fiery Ball Core */}
          <svg viewBox="0 0 48 48" className="w-12 h-12 relative z-10 pointer-events-none" fill="none">
            <defs>
              <radialGradient id="fireBallGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="25%" stopColor="#fef08a" />
                <stop offset="55%" stopColor="#f97316" />
                <stop offset="85%" stopColor="#dc2626" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>
            <circle cx="24" cy="24" r="20" fill="url(#fireBallGrad)" />
            {/* Inner flame tongues */}
            <path
              d="M24 6 C28 14 36 18 36 26 C36 34 29 40 24 40 C19 40 12 34 12 26 C12 18 20 14 24 6 Z"
              fill="#fbbf24"
              opacity="0.9"
            />
            <path
              d="M24 12 C26 17 31 20 31 26 C31 31 27 35 24 35 C21 35 17 31 17 26 C17 20 22 17 24 12 Z"
              fill="#ffffff"
              opacity="0.95"
            />
          </svg>
        </div>
      </motion.div>

      {/* 2. Fire Impact / Explosion */}
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
          /* Sweeping Flame Inferno for AoE (Flamestrike, Scorching Winds) */
          <div className="relative w-[650px] max-w-[90vw] h-48 flex items-center justify-center">
            {/* Ground Fire Fissure Glow */}
            <motion.div
              initial={{ scaleX: 0.1, opacity: 0 }}
              animate={{ scaleX: [0.2, 1.1, 1], opacity: [0, 1, 0.9, 0] }}
              transition={{ duration: durationMs / 1000, ease: 'easeOut' }}
              className="absolute inset-x-0 bottom-4 h-8 bg-gradient-to-r from-transparent via-orange-600 to-transparent blur-md"
            />

            {/* Rising Inferno Fire Pillars */}
            {[-220, -140, -60, 20, 100, 180, 240].map((xOffset, idx) => (
              <motion.div
                key={idx}
                initial={{ y: 40, scaleY: 0.2, opacity: 0 }}
                animate={{
                  y: [30, -20, -40],
                  scaleY: [0.3, 1.3, 1.1],
                  opacity: [0, 1, 0.8, 0],
                }}
                transition={{
                  duration: 0.45,
                  delay: 0.05 + idx * 0.04,
                  ease: 'easeOut',
                }}
                style={{
                  position: 'absolute',
                  left: `calc(50% + ${xOffset}px)`,
                  bottom: '10px',
                  filter: 'drop-shadow(0 0 20px #ea580c) drop-shadow(0 0 35px #dc2626)',
                }}
                className="w-16 h-36 origin-bottom -translate-x-1/2 pointer-events-none"
              >
                <svg viewBox="0 0 60 140" className="w-full h-full pointer-events-none" fill="none">
                  <path
                    d="M30 0 C45 35 55 75 50 110 C46 130 38 140 30 140 C22 140 14 130 10 110 C5 75 15 35 30 0 Z"
                    fill="url(#pillarGrad)"
                  />
                  <path
                    d="M30 25 C40 50 45 80 42 110 C39 125 34 135 30 135 C26 135 21 125 18 110 C15 80 20 50 30 25 Z"
                    fill="#fef08a"
                    opacity="0.85"
                  />
                  <defs>
                    <linearGradient id="pillarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="20%" stopColor="#fde047" />
                      <stop offset="50%" stopColor="#f97316" />
                      <stop offset="85%" stopColor="#dc2626" />
                      <stop offset="100%" stopColor="#7f1d1d" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>
            ))}

            {/* Rising Sparks and Embers */}
            {Array.from({ length: 14 }).map((_, i) => {
              const sparkScale = 0.6 + ((i * 7) % 5) * 0.12;
              const sparkYDelta = -120 - ((i * 13) % 45);
              const sparkXDelta = (i - 7) * 35 + (((i * 17) % 40) - 20);
              const sparkDelay = ((i * 23) % 20) * 0.01;
              return (
                <motion.div
                  key={i}
                  initial={{
                    x: (i - 7) * 35,
                    y: 40,
                    opacity: 1,
                    scale: sparkScale,
                  }}
                  animate={{
                    y: sparkYDelta,
                    x: sparkXDelta,
                    opacity: [1, 1, 0],
                  }}
                  transition={{
                    duration: 0.5,
                    delay: sparkDelay,
                    ease: 'easeOut',
                  }}
                  className="absolute w-2 h-2 rounded-full bg-amber-300 shadow-[0_0_8px_#f59e0b]"
                />
              );
            })}
          </div>
        ) : (
          /* Single Target Fireball / Pyroblast Impact Blast */
          <div className="relative w-40 h-40 flex items-center justify-center">
            {/* Concentric Expanding Scorched Blast Rings */}
            <motion.div
              initial={{ scale: 0.2, opacity: 0.9 }}
              animate={{ scale: [0.2, 1.8, 2.2], opacity: [0.9, 0.7, 0] }}
              transition={{ duration: 0.45, ease: 'easeOut', delay: flightDuration * 0.7 }}
              className="absolute inset-0 rounded-full border-4 border-amber-400 bg-radial from-orange-500/50 via-red-600/30 to-transparent blur-sm"
            />
            <motion.div
              initial={{ scale: 0.1, opacity: 1 }}
              animate={{ scale: [0.1, 1.4, 1.7], opacity: [1, 0.8, 0] }}
              transition={{ duration: 0.4, ease: 'easeOut', delay: flightDuration * 0.8 }}
              className="absolute inset-4 rounded-full border-2 border-red-500 bg-amber-300/40"
            />

            {/* Scorched Radial Explosion Blast Core */}
            <motion.div
              initial={{ scale: 0.3, rotate: 0, opacity: 0 }}
              animate={{
                scale: [0.4, 1.4, 1.1],
                rotate: [0, 45],
                opacity: [0, 1, 0],
              }}
              transition={{ duration: 0.45, ease: 'easeOut', delay: flightDuration * 0.75 }}
              style={{ filter: 'drop-shadow(0 0 25px #ff4500) drop-shadow(0 0 50px #dc2626)' }}
              className="relative w-28 h-28 flex items-center justify-center pointer-events-none"
            >
              <svg viewBox="0 0 100 100" className="w-full h-full pointer-events-none" fill="none">
                <circle cx="50" cy="50" r="30" fill="#fef08a" />
                {/* 8 explosion flame bursts */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((ang, idx) => (
                  <path
                    key={idx}
                    d="M50 50 L46 15 Q50 0 54 15 Z"
                    fill={idx % 2 === 0 ? '#f97316' : '#ef4444'}
                    transform={`rotate(${ang} 50 50)`}
                  />
                ))}
              </svg>
            </motion.div>

            {/* Exploding Ember Sparks Flying Outward */}
            {Array.from({ length: 12 }).map((_, i) => {
              const sparkAngle = (i / 12) * Math.PI * 2;
              const sparkDist = 65 + (i % 3) * 15;
              return (
                <motion.div
                  key={i}
                  initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                  animate={{
                    x: Math.cos(sparkAngle) * sparkDist,
                    y: Math.sin(sparkAngle) * sparkDist,
                    scale: [1, 1.3, 0],
                    opacity: [1, 0.9, 0],
                  }}
                  transition={{
                    duration: 0.4,
                    delay: flightDuration * 0.8,
                    ease: 'easeOut',
                  }}
                  className="absolute w-2.5 h-2.5 rounded-full bg-amber-200 shadow-[0_0_10px_#f97316]"
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
