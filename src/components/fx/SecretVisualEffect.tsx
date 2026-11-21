import React from 'react';
import { motion } from 'motion/react';
import type { VisualEffectEvent } from './types.ts';

export const SecretVisualEffect: React.FC<{ effect: VisualEffectEvent }> = ({ effect }) => {
  const { startX, startY, targetX = startX, targetY = startY, durationMs = 550 } = effect;

  const dx = targetX - startX;
  const dy = targetY - startY;
  const flightDuration = Math.max(0.22, (durationMs * 0.5) / 1000);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* 1. Swirling Mystic Runic Vortex Ascending toward Hero Portrait Crest */}
      <motion.div
        data-testid="spell-projectile"
        initial={{ x: startX, y: startY, scale: 0.6, opacity: 0.2 }}
        animate={{
          x: [startX, startX + dx * 0.6, targetX],
          y: [startY, startY + dy * 0.4, targetY],
          scale: [0.6, 1.25, 1],
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
          filter: 'drop-shadow(0 0 20px rgba(217, 70, 239, 0.95)) drop-shadow(0 0 35px rgba(245, 158, 11, 0.8))',
        }}
        className="z-50 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      >
        <div className="relative w-24 h-24 flex items-center justify-center pointer-events-none">
          {/* Rotating Outer Spiral Arms */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <svg viewBox="0 0 100 100" className="w-full h-full pointer-events-none" fill="none">
              <defs>
                <linearGradient id="vortexGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="50%" stopColor="#d946ef" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="42" stroke="url(#vortexGrad)" strokeWidth="2.5" strokeDasharray="12 6" />
              <circle cx="50" cy="50" r="30" stroke="#fef08a" strokeWidth="1.5" strokeDasharray="8 4" opacity="0.8" />
            </svg>
          </motion.div>

          {/* Orbiting Golden Glyphs */}
          {[0, 120, 240].map((deg, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-amber-300 shadow-[0_0_8px_#f59e0b]"
              style={{
                transform: `rotate(${deg}deg) translate(34px)`,
              }}
            />
          ))}

          {/* Central Question Mark / Secret Glyph Medallion */}
          <div className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-purple-900 via-fuchsia-700 to-amber-500 border-2 border-amber-300 shadow-lg flex items-center justify-center">
            <span className="text-xl font-black font-serif text-amber-200 filter drop-shadow">
              ?
            </span>
          </div>
        </div>
      </motion.div>

      {/* 2. Locking Onto Hero Portrait Crest Impact */}
      <div
        data-testid="spell-impact"
        style={{
          position: 'fixed',
          left: `${targetX}px`,
          top: `${targetY}px`,
        }}
        className="z-50 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      >
        <div className="relative w-36 h-36 flex items-center justify-center pointer-events-none">
          {/* Concentric Mystic Lock-in Flash Rings */}
          <motion.div
            initial={{ scale: 0.2, opacity: 0.95 }}
            animate={{ scale: [0.2, 1.6, 2.0], opacity: [0.95, 0.8, 0] }}
            transition={{ duration: 0.45, ease: 'easeOut', delay: flightDuration * 0.7 }}
            className="absolute inset-0 rounded-full border-4 border-amber-400 bg-radial from-fuchsia-500/40 via-purple-700/25 to-transparent blur-sm"
          />
          <motion.div
            initial={{ scale: 0.1, opacity: 1 }}
            animate={{ scale: [0.1, 1.3, 1.6], opacity: [1, 0.85, 0] }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: flightDuration * 0.8 }}
            className="absolute inset-3 rounded-full border-2 border-fuchsia-300 bg-amber-300/30"
          />

          {/* Mystic Rune Medallion Snap Lock Flare */}
          <motion.div
            initial={{ scale: 0.3, rotate: -45, opacity: 0 }}
            animate={{
              scale: [0.3, 1.3, 1.05],
              rotate: [-45, 0],
              opacity: [0, 1, 0],
            }}
            transition={{ duration: 0.45, ease: 'easeOut', delay: flightDuration * 0.75 }}
            style={{ filter: 'drop-shadow(0 0 25px #d946ef) drop-shadow(0 0 45px #fbbf24)' }}
            className="relative w-24 h-24 flex items-center justify-center pointer-events-none"
          >
            <svg viewBox="0 0 80 80" className="w-full h-full pointer-events-none" fill="none">
              <circle cx="40" cy="40" r="34" stroke="#fbbf24" strokeWidth="2.5" />
              <polygon points="40,12 68,60 12,60" stroke="#f472b6" strokeWidth="2" fill="rgba(217,70,239,0.2)" />
              <circle cx="40" cy="40" r="14" fill="#a855f7" />
              <circle cx="40" cy="40" r="6" fill="#fef08a" />
            </svg>
          </motion.div>

          {/* Golden Sparkles Radiating As Secret Settles */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            const dist = 52 + (i % 2) * 14;
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
                className="absolute w-2 h-2 rounded-full bg-amber-200 shadow-[0_0_10px_#f59e0b]"
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
