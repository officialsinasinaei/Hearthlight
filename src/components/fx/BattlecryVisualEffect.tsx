import React from 'react';
import { motion } from 'motion/react';
import type { VisualEffectEvent } from './types.ts';

export const BattlecryVisualEffect: React.FC<{ effect: VisualEffectEvent }> = ({ effect }) => {
  const { startX, startY, targetX = startX, targetY = startY, durationMs = 550 } = effect;

  const dx = targetX - startX;
  const dy = targetY - startY;
  const hasTargetOffset = Math.hypot(dx, dy) > 20;
  const flightDuration = Math.max(0.18, (durationMs * 0.4) / 1000);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* 1. Radiant Golden Beam / Summoning Ray */}
      <motion.div
        data-testid="spell-projectile"
        initial={{ x: startX, y: startY, scale: 0.5, opacity: 0.2 }}
        animate={{
          x: hasTargetOffset ? [startX, startX + dx * 0.5, targetX] : startX,
          y: hasTargetOffset ? [startY, startY + dy * 0.5 - 20, targetY] : [startY, startY - 30],
          scale: [0.6, 1.3, 1],
          opacity: [0.5, 1, 0.85],
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
          filter: 'drop-shadow(0 0 18px rgba(245, 158, 11, 0.95)) drop-shadow(0 0 32px rgba(254, 240, 138, 0.9))',
        }}
        className="z-50 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      >
        <div className="relative flex items-center justify-center pointer-events-none">
          {/* Golden Aura Ring */}
          <div className="w-16 h-16 rounded-full border-2 border-amber-300 bg-radial from-amber-400/40 to-transparent blur-[2px] animate-pulse pointer-events-none" />

          {/* Central Golden Starburst Crest */}
          <svg viewBox="0 0 40 40" className="w-10 h-10 absolute pointer-events-none" fill="none">
            <polygon
              points="20,2 24,14 36,14 26,22 30,34 20,26 10,34 14,22 4,14 16,14"
              fill="#fef08a"
              stroke="#f59e0b"
              strokeWidth="1.5"
            />
            <circle cx="20" cy="20" r="5" fill="#ffffff" />
          </svg>
        </div>
      </motion.div>

      {/* 2. Radiant Golden Shockwave Flare Radiating from Minion to Target / Drop Point */}
      <div
        data-testid="spell-impact"
        style={{
          position: 'fixed',
          left: `${targetX}px`,
          top: `${targetY}px`,
        }}
        className="z-50 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      >
        <div className="relative w-44 h-44 flex items-center justify-center pointer-events-none">
          {/* Concentric Golden Shockwave Rings */}
          <motion.div
            initial={{ scale: 0.2, opacity: 0.95 }}
            animate={{ scale: [0.2, 1.8, 2.3], opacity: [0.95, 0.75, 0] }}
            transition={{ duration: 0.45, ease: 'easeOut', delay: flightDuration * 0.7 }}
            className="absolute inset-0 rounded-full border-4 border-amber-400 bg-radial from-amber-300/40 via-yellow-600/20 to-transparent blur-sm"
          />
          <motion.div
            initial={{ scale: 0.1, opacity: 1 }}
            animate={{ scale: [0.1, 1.4, 1.75], opacity: [1, 0.85, 0] }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: flightDuration * 0.8 }}
            className="absolute inset-4 rounded-full border-2 border-yellow-200 bg-amber-200/30"
          />

          {/* Golden Sunburst Rays */}
          <motion.div
            initial={{ scale: 0.3, rotate: 0, opacity: 0 }}
            animate={{
              scale: [0.3, 1.35, 1.1],
              rotate: [0, 45],
              opacity: [0, 1, 0],
            }}
            transition={{ duration: 0.45, ease: 'easeOut', delay: flightDuration * 0.75 }}
            style={{ filter: 'drop-shadow(0 0 25px #fbbf24) drop-shadow(0 0 50px #f59e0b)' }}
            className="relative w-32 h-32 flex items-center justify-center pointer-events-none"
          >
            <svg viewBox="0 0 100 100" className="w-full h-full pointer-events-none" fill="none">
              <circle cx="50" cy="50" r="16" fill="#ffffff" />
              <circle cx="50" cy="50" r="28" stroke="#fef08a" strokeWidth="2" strokeDasharray="4 4" />
              {/* 12 Sunburst Rays */}
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((ang, i) => (
                <line
                  key={i}
                  x1="50"
                  y1="22"
                  x2="50"
                  y2="6"
                  stroke={i % 2 === 0 ? '#fef08a' : '#f59e0b'}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  transform={`rotate(${ang} 50 50)`}
                />
              ))}
            </svg>
          </motion.div>

          {/* Heroic Golden Sparks Bursting Outward */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const dist = 65 + (i % 3) * 16;
            return (
              <motion.div
                key={i}
                initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                animate={{
                  x: Math.cos(angle) * dist,
                  y: Math.sin(angle) * dist,
                  scale: [1, 1.4, 0],
                  opacity: [1, 0.9, 0],
                }}
                transition={{
                  duration: 0.4,
                  delay: flightDuration * 0.8,
                  ease: 'easeOut',
                }}
                className="absolute w-2.5 h-2.5 rounded-full bg-amber-100 shadow-[0_0_12px_#fbbf24]"
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
