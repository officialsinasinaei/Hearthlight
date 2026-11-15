import React from 'react';
import { useBattleStore } from '../../store/useBattleStore.ts';

export const TargetingArrowOverlay: React.FC = () => {
  const isTargeting = useBattleStore((s) => s.isTargeting);
  const targetingCoords = useBattleStore((s) => s.targetingCoords);

  if (!isTargeting || !targetingCoords) return null;

  const { startX, startY, currentX, currentY } = targetingCoords;

  const dx = currentX - startX;
  const dy = currentY - startY;
  const dist = Math.hypot(dx, dy);

  // Bezier control point offset (creates the classic curved arch)
  // Curving perpendicular to the main vector
  const normalX = -dy / (dist || 1);
  const normalY = dx / (dist || 1);
  const archStrength = Math.min(120, dist * 0.25);

  const cpX = (startX + currentX) / 2 + normalX * archStrength;
  const cpY = (startY + currentY) / 2 + normalY * archStrength - 30;

  const pathD = `M ${startX} ${startY} Q ${cpX} ${cpY} ${currentX} ${currentY}`;

  // Calculate chevrons along the curve
  const chevronCount = Math.max(3, Math.min(12, Math.floor(dist / 45)));
  const chevrons: Array<{ x: number; y: number; angle: number; scale: number }> = [];

  for (let i = 1; i < chevronCount; i++) {
    const t = i / chevronCount;
    // Quadratic bezier point B(t) = (1-t)^2 P0 + 2(1-t)t P1 + t^2 P2
    const bx = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * cpX + t * t * currentX;
    const by = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * cpY + t * t * currentY;

    // Derivative B'(t) = 2(1-t)(P1 - P0) + 2t(P2 - P1)
    const dtx = 2 * (1 - t) * (cpX - startX) + 2 * t * (currentX - cpX);
    const dty = 2 * (1 - t) * (cpY - startY) + 2 * t * (currentY - cpY);
    const angle = (Math.atan2(dty, dtx) * 180) / Math.PI;

    chevrons.push({
      x: bx,
      y: by,
      angle,
      scale: 0.7 + t * 0.5,
    });
  }

  return (
    <svg
      data-testid="targeting-arrow"
      className="fixed inset-0 w-full h-full pointer-events-none z-50 select-none overflow-visible"
    >
      <defs>
        {/* Glow Filters */}
        <filter id="crimsonGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="reticleGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
          <stop offset="70%" stopColor="#b91c1c" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#7f1d1d" stopOpacity="1" />
        </radialGradient>
      </defs>

      {/* Main Curve Shadow/Backdrop */}
      <path
        d={pathD}
        fill="none"
        stroke="rgba(0, 0, 0, 0.6)"
        strokeWidth="12"
        strokeLinecap="round"
      />

      {/* Outer Crimson Glow Path */}
      <path
        d={pathD}
        fill="none"
        stroke="#ef4444"
        strokeWidth="8"
        strokeLinecap="round"
        filter="url(#crimsonGlow)"
        opacity="0.9"
      />

      {/* Inner Hot Orange Core Path */}
      <path
        d={pathD}
        fill="none"
        stroke="#fde047"
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity="0.85"
      />

      {/* Animated Chevrons along curve */}
      {chevrons.map((ch, idx) => (
        <g
          key={idx}
          transform={`translate(${ch.x}, ${ch.y}) rotate(${ch.angle}) scale(${ch.scale})`}
        >
          <path
            d="M -12 -10 L 4 0 L -12 10 L -6 0 Z"
            fill="#ef4444"
            stroke="#fde047"
            strokeWidth="1.5"
            filter="drop-shadow(0 0 3px #dc2626)"
          />
        </g>
      ))}

      {/* Origin Ring */}
      <circle
        cx={startX}
        cy={startY}
        r="14"
        fill="none"
        stroke="#ef4444"
        strokeWidth="3"
        filter="url(#crimsonGlow)"
      />
      <circle cx={startX} cy={startY} r="6" fill="#fde047" />

      {/* Target Reticle at Endpoint */}
      <g
        data-testid="targeting-reticle"
        transform={`translate(${currentX}, ${currentY})`}
      >
        {/* Outer Pulsing Crosshair Ring */}
        <circle
          cx="0"
          cy="0"
          r="26"
          fill="url(#reticleGrad)"
          stroke="#f87171"
          strokeWidth="3"
          filter="url(#crimsonGlow)"
          className="animate-pulse"
        />

        {/* Inner concentric ring */}
        <circle
          cx="0"
          cy="0"
          r="16"
          fill="none"
          stroke="#fee2e2"
          strokeWidth="2"
        />

        {/* Crosshair Tick Marks */}
        <line x1="-34" y1="0" x2="-22" y2="0" stroke="#fca5a5" strokeWidth="3" strokeLinecap="round" />
        <line x1="22" y1="0" x2="34" y2="0" stroke="#fca5a5" strokeWidth="3" strokeLinecap="round" />
        <line x1="0" y1="-34" x2="0" y2="-22" stroke="#fca5a5" strokeWidth="3" strokeLinecap="round" />
        <line x1="0" y1="22" x2="0" y2="34" stroke="#fca5a5" strokeWidth="3" strokeLinecap="round" />

        {/* Center Skull / Danger Cross Marker */}
        <circle cx="0" cy="0" r="5" fill="#fef08a" />
        <path
          d="M -5 -5 L 5 5 M 5 -5 L -5 5"
          stroke="#7f1d1d"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
};
