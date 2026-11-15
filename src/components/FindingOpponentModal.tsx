import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../store/useAppStore';
import { useCollectionStore } from '../store/useCollectionStore';
import { useBattleStore } from '../store/useBattleStore';
import { playRatchetTick, playOpponentLockedChime } from '../utils/tavernAudio';

// The authentic Hearthstone titles pool
// Index 4 is the locked target "Worthy Opponent", flanked exactly as in the original game (full_035.png)
const TITLES_ORDER = [
  'Your Old Roommate',
  'Dastardly Death Knight',
  'Coffee Addict',
  'Brand New Player',
  'Worthy Opponent', // INDEX 4 is target
  'Fiscally responsible mime',
  'Gourd critic',
  'Easy Pickings',
  'Nose and mouth breather',
  'Wombat Warlock',
  'Cheery Innkeeper',
  'Card Shark',
  'Salty Pirate',
  'Murloc Whisperer',
  'Starving Buzzard',
  'Sneaky Rogue',
  'Arcane Apprentice',
  'Guild Master',
];

const TARGET_INDEX = 4; // 'Worthy Opponent'
const TOTAL_TITLES = TITLES_ORDER.length;
const FACET_HEIGHT = 32; // pixels per facet on cylinder surface
const DRUM_RADIUS = 95; // cylinder radius in pixels
const TOTAL_CYCLE_HEIGHT = TOTAL_TITLES * FACET_HEIGHT;

export function FindingOpponentModal() {
  const isOpen = useAppStore((s) => s.isFindingOpponentOpen);
  const closeFindingOpponent = useAppStore((s) => s.closeFindingOpponent);
  const showToast = useAppStore((s) => s.showToast);

  const [isLocked, setIsLocked] = useState(false);
  const [activeSlotIndex, setActiveSlotIndex] = useState(TARGET_INDEX);
  const [showGoldFlash, setShowGoldFlash] = useState(false);

  // Animation and DOM refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const facetRefs = useRef<(HTMLDivElement | null)[]>(
    Array.from({ length: TOTAL_TITLES }, () => null)
  );
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const lastTickFacetRef = useRef<number>(-1);
  const lastTickTimeRef = useRef<number>(0);

  // Reset state when modal opens
  useEffect(() => {
    if (!isOpen) {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      return;
    }

    setIsLocked(false);
    setShowGoldFlash(false);
    setActiveSlotIndex(TARGET_INDEX);
    startTimeRef.current = null;
    lastTickFacetRef.current = -1;
    lastTickTimeRef.current = 0;

    // Sparks particles state
    interface Spark {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      size: number;
      color: string;
    }
    const sparks: Spark[] = [];

    // Target absolute offset to land on TARGET_INDEX at end
    // Total spin duration ~ 3.4s (2.1s fast + 1.3s deceleration)
    const fullSpins = 16;
    const targetOffset = fullSpins * TOTAL_CYCLE_HEIGHT + TARGET_INDEX * FACET_HEIGHT;

    const FAST_DURATION = 2100; // 0.0s - 2.1s
    const DECEL_DURATION = 1300; // 2.1s - 3.4s
    const TOTAL_SPIN_TIME = FAST_DURATION + DECEL_DURATION; // 3.4s

    const distanceDecel = targetOffset * 0.32;
    const distanceFast = targetOffset - distanceDecel;
    const vFast = distanceFast / FAST_DURATION;

    const canvas = canvasRef.current;
    const ctx = canvas ? canvas.getContext('2d') : null;

    let isComplete = false;

    const updateFrame = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;

      let currentOffset = 0;
      let currentSpeed = 0; // px/ms

      if (elapsed < FAST_DURATION) {
        // Fast spin
        currentOffset = elapsed * vFast;
        currentSpeed = vFast;
      } else if (elapsed < TOTAL_SPIN_TIME) {
        // Deceleration with subtle spring overshoot
        const decelProgress = (elapsed - FAST_DURATION) / DECEL_DURATION;
        const easeOut = 1 - Math.pow(1 - decelProgress, 3.2);

        let bounce = 0;
        if (decelProgress > 0.85) {
          const bp = (decelProgress - 0.85) / 0.15;
          bounce = Math.sin(bp * Math.PI) * 4.5 * (1 - bp);
        }

        currentOffset = distanceFast + distanceDecel * easeOut + bounce;
        currentSpeed = vFast * Math.pow(1 - decelProgress, 2.2);
      } else {
        // Locked
        currentOffset = targetOffset;
        currentSpeed = 0;
      }

      // Audio ticks
      const now = performance.now();
      const currentFacetIdx = Math.floor(((currentOffset % TOTAL_CYCLE_HEIGHT) + FACET_HEIGHT / 2) / FACET_HEIGHT) % TOTAL_TITLES;

      if (currentSpeed > 0.05) {
        if (elapsed < FAST_DURATION) {
          if (now - lastTickTimeRef.current > 38) {
            lastTickTimeRef.current = now;
            playRatchetTick(0.95 + Math.random() * 0.25);
          }
        } else {
          if (currentFacetIdx !== lastTickFacetRef.current) {
            lastTickFacetRef.current = currentFacetIdx;
            const pitchFactor = 0.9 + (1 - (elapsed - FAST_DURATION) / DECEL_DURATION) * 0.3;
            playRatchetTick(pitchFactor);
          }
        }
      }

      // 3D Cylindrical Facet Positioning
      const centerFacetFloat = (currentOffset / FACET_HEIGHT);
      let closestToCenterIdx = TARGET_INDEX;
      let minAngularDist = Infinity;

      for (let i = 0; i < TOTAL_TITLES; i++) {
        const el = facetRefs.current[i];
        if (!el) continue;

        let distFromCenter = ((i - centerFacetFloat) % TOTAL_TITLES) * FACET_HEIGHT;
        while (distFromCenter < -TOTAL_CYCLE_HEIGHT / 2) distFromCenter += TOTAL_CYCLE_HEIGHT;
        while (distFromCenter > TOTAL_CYCLE_HEIGHT / 2) distFromCenter -= TOTAL_CYCLE_HEIGHT;

        const theta = distFromCenter / DRUM_RADIUS; // in radians
        const absTheta = Math.abs(theta);

        if (absTheta < minAngularDist) {
          minAngularDist = absTheta;
          closestToCenterIdx = i;
        }

        // Clip facets on backside of cylinder (|theta| > PI/2 - 0.05)
        if (absTheta > Math.PI / 2 - 0.05) {
          el.style.display = 'none';
          continue;
        }

        el.style.display = 'flex';
        const sinT = Math.sin(theta);
        const cosT = Math.cos(theta);
        const yPos = sinT * DRUM_RADIUS;
        const scaleY = Math.max(0.45, cosT);
        const rotXDeg = -theta * (180 / Math.PI);
        const shadow = (1 - cosT) * 0.88;

        el.style.transform = `translateY(${yPos.toFixed(1)}px) scaleY(${scaleY.toFixed(3)}) rotateX(${rotXDeg.toFixed(1)}deg)`;

        const shadowEl = el.firstElementChild as HTMLDivElement | null;
        if (shadowEl) {
          shadowEl.style.backgroundColor = `rgba(0, 0, 0, ${shadow.toFixed(3)})`;
        }
      }

      setActiveSlotIndex(elapsed >= TOTAL_SPIN_TIME ? TARGET_INDEX : closestToCenterIdx);

      // Canvas Spark Emitter
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const leftTipX = 42;
        const rightTipX = canvas.width - 42;
        const tipY = canvas.height / 2;

        if (currentSpeed > 0.3) {
          const emitCount = currentSpeed > 1.2 ? 3 : 1;
          for (let s = 0; s < emitCount; s++) {
            // Left pointer sparks
            sparks.push({
              x: leftTipX + Math.random() * 4,
              y: tipY + (Math.random() * 8 - 4),
              vx: 0.8 + Math.random() * 2.4,
              vy: Math.random() * 3 - 1.5,
              life: 0,
              maxLife: 18 + Math.random() * 14,
              size: 1.5 + Math.random() * 2.2,
              color: Math.random() > 0.4 ? '#fff082' : '#ff9500',
            });
            // Right pointer sparks
            sparks.push({
              x: rightTipX - Math.random() * 4,
              y: tipY + (Math.random() * 8 - 4),
              vx: -(0.8 + Math.random() * 2.4),
              vy: Math.random() * 3 - 1.5,
              life: 0,
              maxLife: 18 + Math.random() * 14,
              size: 1.5 + Math.random() * 2.2,
              color: Math.random() > 0.4 ? '#fff082' : '#ff9500',
            });
          }
        }

        // Draw and update sparks
        for (let s = sparks.length - 1; s >= 0; s--) {
          const sp = sparks[s];
          sp.life += 1;
          sp.x += sp.vx;
          sp.y += sp.vy;
          sp.vy += 0.12; // gravity
          sp.vx *= 0.97;

          const progress = sp.life / sp.maxLife;
          if (progress >= 1) {
            sparks.splice(s, 1);
            continue;
          }

          const alpha = 1 - progress;
          ctx.save();
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, sp.size * (1 - progress * 0.5), 0, Math.PI * 2);
          ctx.fillStyle = sp.color;
          ctx.globalAlpha = alpha;
          ctx.shadowBlur = 6;
          ctx.shadowColor = '#ffa000';
          ctx.fill();
          ctx.restore();
        }
      }

      // Check for lock-in trigger
      if (elapsed >= TOTAL_SPIN_TIME && !isComplete) {
        isComplete = true;
        setIsLocked(true);
        setShowGoldFlash(true);
        playOpponentLockedChime();

        // Hold showcase state for 1.5s, then smoothly dismiss modal and transition to BATTLEFIELD
        setTimeout(() => {
          closeFindingOpponent();
          const activeDeck = useCollectionStore.getState().getActiveValidDeck();
          useBattleStore.getState().startMatch(activeDeck);
          useAppStore.getState().navigateTo('BATTLEFIELD');
        }, 1500);
      }

      if (!isComplete) {
        animFrameRef.current = requestAnimationFrame(updateFrame);
      }
    };

    animFrameRef.current = requestAnimationFrame(updateFrame);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isOpen, closeFindingOpponent, showToast]);

  if (!isOpen) return null;

  return createPortal(
    <div
      data-testid="finding-opponent-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/80 backdrop-blur-md select-none overflow-hidden"
      style={{
        paddingTop: 'max(4px, var(--sat, 0px))',
        paddingBottom: 'max(4px, var(--sab, 0px))',
      }}
    >
      {/* Outer Scale Wrapper: Fits 100% inside 667x375 with authentic tavern aspect ratio */}
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 8 }}
        transition={{ type: 'spring', stiffness: 350, damping: 26 }}
        className="relative flex flex-col items-center w-[min(82vw,480px)] max-h-[92dvh]"
        style={{
          transformOrigin: 'center center',
        }}
      >
        {/* ======================================================== */}
        {/* ORGANIC GNARLED VINES & EMERALD LEAVES (Inline SVG)       */}
        {/* Strictly wraps outer stone rim without overlapping header */}
        {/* ======================================================== */}

        {/* TOP-RIGHT ROOT BRANCH: Gnarled oak root emerging from behind the right bracket */}
        <svg
          className="absolute -top-3 -right-2 w-38 h-30 sm:w-44 sm:h-36 pointer-events-none z-15 drop-shadow-[0_8px_16px_rgba(0,0,0,0.95)]"
          viewBox="0 0 200 150"
          fill="none"
        >
          <defs>
            <linearGradient id="oakBarkMain" x1="0%" y1="20%" x2="100%" y2="80%">
              <stop offset="0%" stopColor="#8c5c2d" />
              <stop offset="35%" stopColor="#5e3919" />
              <stop offset="70%" stopColor="#43260e" />
              <stop offset="100%" stopColor="#251305" />
            </linearGradient>
            <linearGradient id="oakBarkHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#b37d44" />
              <stop offset="50%" stopColor="#734720" />
              <stop offset="100%" stopColor="#3d210b" />
            </linearGradient>
            <linearGradient id="emeraldLeafSunlit" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a8ec4b" />
              <stop offset="45%" stopColor="#5ea91f" />
              <stop offset="85%" stopColor="#35660d" />
              <stop offset="100%" stopColor="#1a3306" />
            </linearGradient>
            <linearGradient id="emeraldLeafDeep" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7ecb30" />
              <stop offset="55%" stopColor="#417c14" />
              <stop offset="100%" stopColor="#193606" />
            </linearGradient>
          </defs>

          {/* Main oak branch arching over top-right stone shoulder without touching plaque */}
          <path
            d="M 52 64 C 80 44, 115 32, 148 26 C 168 22, 186 28, 194 36 C 197 40, 195 48, 187 52 C 176 56, 160 52, 142 54 C 114 58, 92 68, 68 84 C 56 90, 48 82, 52 64 Z"
            fill="url(#oakBarkMain)"
            stroke="#1c0e04"
            strokeWidth="2.2"
          />
          {/* Bark texture ridge line */}
          <path
            d="M 68 56 C 100 40, 130 30, 162 28 C 176 27, 186 30, 190 34"
            fill="none"
            stroke="url(#oakBarkHighlight)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Secondary Sub-Branch reaching downward hugging outer right stone edge */}
          <path
            d="M 152 38 C 166 49, 175 70, 182 96 C 187 112, 190 122, 195 125 C 198 127, 200 123, 198 118 C 193 104, 186 86, 177 64 C 169 48, 162 42, 152 38 Z"
            fill="url(#oakBarkMain)"
            stroke="#1c0e04"
            strokeWidth="1.8"
          />

          {/* Tendril curl */}
          <path
            d="M 175 24 C 188 12, 196 15, 196 24 C 196 30, 190 32, 185 29"
            fill="none"
            stroke="#477a1a"
            strokeWidth="3.2"
            strokeLinecap="round"
          />

          {/* Emerald Leaves */}
          {/* Leaf 1 (Top curl) */}
          <g>
            <path
              d="M 178 18 C 184 4, 196 6, 190 18 C 185 25, 180 22, 178 18 Z"
              fill="url(#emeraldLeafSunlit)"
              stroke="#132704"
              strokeWidth="1"
            />
            <path d="M 180 18 Q 186 12 192 10" stroke="#baf266" strokeWidth="0.8" strokeLinecap="round" fill="none" />
          </g>

          {/* Leaf 2 (Shoulder crest) */}
          <g>
            <path
              d="M 125 24 C 126 8, 108 2, 102 14 C 98 24, 115 28, 125 24 Z"
              fill="url(#emeraldLeafDeep)"
              stroke="#132704"
              strokeWidth="1"
            />
          </g>

          {/* Leaf 3 (Branch node) */}
          <g>
            <path
              d="M 152 38 C 168 32, 176 46, 164 54 C 154 58, 146 46, 152 38 Z"
              fill="url(#emeraldLeafSunlit)"
              stroke="#132704"
              strokeWidth="1"
            />
          </g>

          {/* Leaf 4 (Right side dangling) */}
          <g>
            <path
              d="M 178 86 C 194 85, 200 98, 186 106 C 174 110, 170 96, 178 86 Z"
              fill="url(#emeraldLeafDeep)"
              stroke="#132704"
              strokeWidth="1"
            />
          </g>
        </svg>

        {/* BOTTOM-LEFT VINE LOOP: Gnarled woody vine wrapping around corner */}
        <svg
          className="absolute -bottom-4 -left-4 w-36 h-44 sm:w-42 sm:h-50 pointer-events-none z-30 drop-shadow-[0_8px_16px_rgba(0,0,0,0.95)]"
          viewBox="0 0 150 180"
          fill="none"
        >
          <defs>
            <linearGradient id="vineWoodMain" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8c5c2d" />
              <stop offset="40%" stopColor="#5e3919" />
              <stop offset="80%" stopColor="#43260e" />
              <stop offset="100%" stopColor="#251305" />
            </linearGradient>
            <linearGradient id="vineWoodLight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#b37d44" />
              <stop offset="60%" stopColor="#734720" />
              <stop offset="100%" stopColor="#3d210b" />
            </linearGradient>
          </defs>

          {/* Climbing vine loop wrapping over corner bevel */}
          <path
            d="M 45 170 C 22 155, 10 130, 14 105 C 18 80, 32 60, 42 35 C 46 25, 47 14, 42 6 C 39 1, 32 3, 30 9 C 24 26, 10 55, 6 88 C 2 122, 12 156, 38 175 Z"
            fill="url(#vineWoodMain)"
            stroke="#1b0c03"
            strokeWidth="2"
          />
          <path
            d="M 34 162 C 18 144, 15 114, 18 88 C 22 62, 34 44, 40 24"
            fill="none"
            stroke="url(#vineWoodLight)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Tendril loop */}
          <path
            d="M 36 50 C 22 45, 12 32, 18 20 C 24 10, 36 13, 34 23"
            fill="none"
            stroke="#477a1a"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Emerald Leaves */}
          <g>
            <path
              d="M 38 28 C 50 14, 62 20, 52 35 C 44 44, 35 36, 38 28 Z"
              fill="url(#emeraldLeafSunlit)"
              stroke="#132704"
              strokeWidth="1"
            />
          </g>
          <g>
            <path
              d="M 12 95 C -1 82, -6 98, 4 106 C 13 114, 19 104, 12 95 Z"
              fill="url(#emeraldLeafDeep)"
              stroke="#132704"
              strokeWidth="1"
            />
          </g>
          <g>
            <path
              d="M 30 140 C 16 132, 10 146, 22 155 C 32 161, 38 150, 30 140 Z"
              fill="url(#emeraldLeafSunlit)"
              stroke="#132704"
              strokeWidth="1"
            />
          </g>
        </svg>

        {/* ======================================================== */}
        {/* TOP HEADER PLAQUE: Riveted bracket with parchment        */}
        {/* ======================================================== */}
        <div
          data-testid="finding-opponent-header"
          className="relative z-25 -mb-2 sm:-mb-2.5 flex items-center justify-center"
        >
          <div className="relative px-6 sm:px-12 py-1 sm:py-2 rounded-t-lg bg-gradient-to-b from-[#4d5057] via-[#313338] to-[#1e1f23] border-t-2 border-x-2 border-[#6c7078] shadow-[0_4px_12px_rgba(0,0,0,0.85)] flex items-center justify-center">
            {/* Left Slotted Screw Bolt */}
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-gradient-to-br from-[#8d939e] to-[#25282f] border border-[#141518] shadow-[0_1px_2px_rgba(0,0,0,0.9)] flex items-center justify-center">
              <span className="w-1.5 h-[1px] bg-[#141518]" />
            </div>

            {/* Inlaid Golden Parchment Header Nameplate */}
            <div className="px-5 sm:px-8 py-0.5 sm:py-1 rounded bg-gradient-to-b from-[#ddca99] via-[#cdb37d] to-[#b3965b] border border-[#7a5e2f] shadow-[inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-2px_4px_rgba(0,0,0,0.5)]">
              <h2
                className="text-[clamp(11px,2.2dvh,15px)] font-bold tracking-wide text-[#24160b] text-center drop-shadow-[0_1px_0_rgba(255,255,255,0.4)] whitespace-nowrap"
                style={{ fontFamily: "'Cinzel', 'Georgia', 'Times New Roman', serif" }}
              >
                Finding Opponent
              </h2>
            </div>

            {/* Right Slotted Screw Bolt */}
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-gradient-to-br from-[#8d939e] to-[#25282f] border border-[#141518] shadow-[0_1px_2px_rgba(0,0,0,0.9)] flex items-center justify-center">
              <span className="w-1.5 h-[1px] bg-[#141518]" />
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* MAIN STEPPED DARK-IRON & SLATE CASING                    */}
        {/* ======================================================== */}
        <div
          className="relative w-full p-2 sm:p-3 bg-gradient-to-b from-[#3c3e45] via-[#26272d] to-[#18191e] border-2 sm:border-3 border-[#545863] shadow-[0_20px_45px_rgba(0,0,0,0.95),inset_0_2px_4px_rgba(255,255,255,0.22)] flex flex-col items-center"
          style={{
            clipPath:
              'polygon(20px 0%, calc(100% - 20px) 0%, 100% 20px, 100% calc(100% - 20px), calc(100% - 20px) 100%, 20px 100%, 0% calc(100% - 20px), 0% 20px)',
          }}
        >
          {/* Inner Recessed Slate Panel with Chamfered Steps */}
          <div
            className="relative w-full p-1.5 sm:p-2.5 bg-gradient-to-b from-[#27282e] to-[#151619] border border-[#1c1d22] shadow-[inset_0_8px_24px_rgba(0,0,0,0.95)] flex flex-col items-center"
            style={{
              clipPath:
                'polygon(14px 0%, calc(100% - 14px) 0%, 100% 14px, 100% calc(100% - 14px), calc(100% - 14px) 100%, 14px 100%, 0% calc(100% - 14px), 0% 14px)',
            }}
          >
            {/* Side Relief Panels with Etched Scrollwork Filigree */}
            <div className="absolute inset-y-3 left-2.5 w-8 sm:w-12 pointer-events-none opacity-25 flex flex-col justify-around items-center">
              <svg viewBox="0 0 40 120" className="w-full h-full" fill="none" stroke="#e0e0e0" strokeWidth="1.6">
                <path d="M 20 8 C 36 24, 4 46, 20 60 C 36 74, 4 96, 20 112" />
                <circle cx="20" cy="14" r="3.2" fill="#e0e0e0" />
                <circle cx="20" cy="60" r="3.2" fill="#e0e0e0" />
                <circle cx="20" cy="106" r="3.2" fill="#e0e0e0" />
              </svg>
            </div>
            <div className="absolute inset-y-3 right-2.5 w-8 sm:w-12 pointer-events-none opacity-25 flex flex-col justify-around items-center scale-x-[-1]">
              <svg viewBox="0 0 40 120" className="w-full h-full" fill="none" stroke="#e0e0e0" strokeWidth="1.6">
                <path d="M 20 8 C 36 24, 4 46, 20 60 C 36 74, 4 96, 20 112" />
                <circle cx="20" cy="14" r="3.2" fill="#e0e0e0" />
                <circle cx="20" cy="60" r="3.2" fill="#e0e0e0" />
                <circle cx="20" cy="106" r="3.2" fill="#e0e0e0" />
              </svg>
            </div>

            {/* ======================================================== */}
            {/* SPINNER DRUM APERTURE & HEAVY SCULPTED BRASS BEZEL       */}
            {/* Responsive clamp height fits 100% inside 375px viewport  */}
            {/* ======================================================== */}
            <div
              data-testid="spinner-drum"
              className="relative w-full max-w-[390px] rounded-lg p-1.5 sm:p-2 bg-gradient-to-b from-[#f3d37a] via-[#c4973c] to-[#604010] shadow-[0_6px_16px_rgba(0,0,0,0.85),inset_0_2px_4px_rgba(255,255,255,0.7)] flex items-center justify-center"
            >
              {/* Recessed Dark Channel */}
              <div className="relative w-full h-[clamp(118px,33dvh,168px)] rounded overflow-hidden bg-[#160404] shadow-[inset_0_12px_28px_rgba(0,0,0,0.98),0_2px_6px_rgba(0,0,0,0.8)] border border-[#3b2308]">
                {/* Cylindrical Drum Content Window */}
                <div
                  className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden"
                  style={{ perspective: '320px' }}
                >
                  {/* 3D Cylindrical Crimson Facets */}
                  <div className="relative w-full h-full flex flex-col items-center justify-center">
                    {TITLES_ORDER.map((title, idx) => {
                      const isTarget = idx === TARGET_INDEX;
                      const isActive = isLocked ? isTarget : idx === activeSlotIndex;

                      return (
                        <div
                          key={idx}
                          ref={(el) => {
                            facetRefs.current[idx] = el;
                          }}
                          data-testid={isActive ? 'spinner-active-slot' : undefined}
                          className={`absolute left-0 right-0 h-[30px] sm:h-[32px] flex items-center justify-center px-4 will-change-transform ${
                            isActive
                              ? 'bg-gradient-to-r from-[#6e0c0c] via-[#a31515] to-[#6e0c0c] border-y border-[#ffd700] shadow-[0_0_14px_rgba(255,215,0,0.45)] z-10'
                              : 'bg-gradient-to-r from-[#440909] via-[#660e0e] to-[#440909] border-y border-[#3a0808]/70'
                          }`}
                          style={{
                            transformOrigin: 'center center',
                          }}
                        >
                          {/* Curvature Shadow Overlay */}
                          <div className="absolute inset-0 pointer-events-none transition-colors duration-75" />

                          {/* Title Typography */}
                          <span
                            className={`relative z-10 font-bold tracking-wide text-center whitespace-nowrap ${
                              isActive
                                ? 'text-[clamp(11px,2.3dvh,15.5px)] text-[#fffdf2]'
                                : 'text-[clamp(9.5px,1.9dvh,13px)] text-[#cca87c]/90'
                            }`}
                            style={{
                              fontFamily: "'Cinzel', 'Georgia', 'Times New Roman', serif",
                              textShadow: isActive
                                ? '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 3px 6px rgba(0,0,0,0.95)'
                                : '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 2px 4px rgba(0,0,0,0.85)',
                            }}
                          >
                            {title}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* High-Speed Motion Blur Streaks (Active during fast spinning) */}
                  <div
                    className={`absolute inset-0 pointer-events-none transition-opacity duration-300 z-15 ${
                      isLocked ? 'opacity-0' : 'opacity-90'
                    }`}
                    style={{
                      background:
                        'repeating-linear-gradient(90deg, transparent 0px, transparent 4px, rgba(0,0,0,0.32) 4px, rgba(0,0,0,0.32) 6px)',
                    }}
                  />

                  {/* Twin Vertical Ruby Specular Highlights (from full_001.png) */}
                  <div
                    className={`absolute inset-y-0 left-[26%] w-2 sm:w-3 bg-gradient-to-r from-transparent via-[#ff4a4a]/75 to-transparent pointer-events-none z-15 transition-opacity duration-300 ${
                      isLocked ? 'opacity-30' : 'opacity-95'
                    }`}
                  />
                  <div
                    className={`absolute inset-y-0 right-[26%] w-2 sm:w-3 bg-gradient-to-r from-transparent via-[#ff4a4a]/75 to-transparent pointer-events-none z-15 transition-opacity duration-300 ${
                      isLocked ? 'opacity-30' : 'opacity-95'
                    }`}
                  />

                  {/* Cylindrical Top & Bottom Deep Shadow Vignettes */}
                  <div className="absolute inset-x-0 top-0 h-9 bg-gradient-to-b from-black via-black/85 to-transparent pointer-events-none z-16" />
                  <div className="absolute inset-x-0 bottom-0 h-9 bg-gradient-to-t from-black via-black/85 to-transparent pointer-events-none z-16" />

                  {/* Horizontal Center Brass Slot Rails - strictly aligned at top-1/2 -translate-y-1/2 */}
                  <div className="absolute inset-x-0 top-1/2 -translate-y-[16px] h-[2px] bg-gradient-to-r from-[#946e27] via-[#ffd768] to-[#946e27] shadow-[0_1px_3px_rgba(0,0,0,0.9)] z-20 pointer-events-none" />
                  <div className="absolute inset-x-0 top-1/2 translate-y-[14px] h-[2px] bg-gradient-to-r from-[#946e27] via-[#ffd768] to-[#946e27] shadow-[0_1px_3px_rgba(0,0,0,0.9)] z-20 pointer-events-none" />

                  {/* Gold Lock-In Radiance Flash */}
                  <AnimatePresence>
                    {showGoldFlash && (
                      <motion.div
                        initial={{ opacity: 0.95 }}
                        animate={{ opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.65 }}
                        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,235,140,0.9)_0%,_rgba(255,180,30,0.4)_50%,_transparent_75%)] pointer-events-none z-25"
                      />
                    )}
                  </AnimatePresence>
                </div>

                {/* ======================================================== */}
                {/* TWIN GOLD WEDGE POINTERS & SIDE BRACKETS                */}
                {/* ======================================================== */}
                <div
                  data-testid="spinner-pointers"
                  className="absolute inset-0 pointer-events-none z-30"
                >
                  {/* Left Side Iron Housing & 3D Gold Pointer */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center">
                    <div className="w-4 sm:w-6 h-9 sm:h-12 rounded-r-md bg-gradient-to-r from-[#202124] to-[#40434b] border-y border-r border-[#696d77] shadow-[2px_2px_6px_rgba(0,0,0,0.9)] flex items-center justify-center">
                      <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-gradient-to-br from-[#8e939d] to-[#1c1d22] border border-[#101114]" />
                    </div>

                    {/* 3D Pyramidal Gold Wedge Pointer pointing RIGHT */}
                    <div className="relative -ml-1 flex items-center drop-shadow-[0_3px_6px_rgba(0,0,0,0.9)]">
                      <svg viewBox="0 0 34 30" className="w-5 sm:w-7 h-5 sm:h-7">
                        <defs>
                          <linearGradient id="goldWedgeTopL" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#fff5b8" />
                            <stop offset="100%" stopColor="#dca838" />
                          </linearGradient>
                          <linearGradient id="goldWedgeBotL" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#9e6e18" />
                            <stop offset="100%" stopColor="#573807" />
                          </linearGradient>
                        </defs>
                        <polygon points="0,0 32,15 0,15" fill="url(#goldWedgeTopL)" />
                        <polygon points="0,15 32,15 0,30" fill="url(#goldWedgeBotL)" />
                        <line x1="0" y1="15" x2="32" y2="15" stroke="#ffe891" strokeWidth="1" />
                        <line x1="0" y1="0" x2="32" y2="15" stroke="#684209" strokeWidth="1" />
                        <line x1="0" y1="30" x2="32" y2="15" stroke="#3d2503" strokeWidth="1" />
                      </svg>
                    </div>
                  </div>

                  {/* Right Side Iron Housing & 3D Gold Pointer */}
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center flex-row-reverse">
                    <div className="w-4 sm:w-6 h-9 sm:h-12 rounded-l-md bg-gradient-to-l from-[#202124] to-[#40434b] border-y border-l border-[#696d77] shadow-[-2px_2px_6px_rgba(0,0,0,0.9)] flex items-center justify-center">
                      <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-gradient-to-br from-[#8e939d] to-[#1c1d22] border border-[#101114]" />
                    </div>

                    {/* 3D Pyramidal Gold Wedge Pointer pointing LEFT */}
                    <div className="relative -mr-1 flex items-center drop-shadow-[0_3px_6px_rgba(0,0,0,0.9)]">
                      <svg viewBox="0 0 34 30" className="w-5 sm:w-7 h-5 sm:h-7">
                        <defs>
                          <linearGradient id="goldWedgeTopR" x1="1" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#fff5b8" />
                            <stop offset="100%" stopColor="#dca838" />
                          </linearGradient>
                          <linearGradient id="goldWedgeBotR" x1="1" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#9e6e18" />
                            <stop offset="100%" stopColor="#573807" />
                          </linearGradient>
                        </defs>
                        <polygon points="34,0 2,15 34,15" fill="url(#goldWedgeTopR)" />
                        <polygon points="34,15 2,15 34,30" fill="url(#goldWedgeBotR)" />
                        <line x1="34" y1="15" x2="2" y2="15" stroke="#ffe891" strokeWidth="1" />
                        <line x1="34" y1="0" x2="2" y2="15" stroke="#684209" strokeWidth="1" />
                        <line x1="34" y1="30" x2="2" y2="15" stroke="#3d2503" strokeWidth="1" />
                      </svg>
                    </div>
                  </div>

                  {/* Canvas for Particle Sparks Flying from Pointer Tips */}
                  <canvas
                    ref={canvasRef}
                    width={390}
                    height={168}
                    className="absolute inset-0 w-full h-full pointer-events-none z-35"
                  />
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* PINNED PARCHMENT TIP BAR                                 */}
            {/* ======================================================== */}
            <div
              data-testid="spinner-tip-bar"
              className="relative mt-1.5 sm:mt-2.5 w-full max-w-[390px] px-4 py-1 sm:py-1.5 rounded bg-gradient-to-b from-[#d5bf88] via-[#c6ad74] to-[#af9358] border border-[#7e602e] shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_2px_6px_rgba(0,0,0,0.7)] flex items-center justify-center text-center"
            >
              {/* Left Pin Rivet */}
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-gradient-to-br from-[#f8e7a6] via-[#b38634] to-[#4a320c] border border-[#2b1b04] shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />

              <p
                className="font-bold text-[clamp(9.5px,1.6dvh,12.5px)] text-[#2c1c0e] tracking-wide leading-tight px-3 drop-shadow-[0_1px_0_rgba(255,255,255,0.35)]"
                style={{ fontFamily: "'Cinzel', 'Georgia', 'Times New Roman', serif" }}
              >
                In Standard, new strategies are constantly evolving.
              </p>

              {/* Right Pin Rivet */}
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-gradient-to-br from-[#f8e7a6] via-[#b38634] to-[#4a320c] border border-[#2b1b04] shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* BOTTOM CANCEL SOCKET & RETRACTING BUTTON                 */}
        {/* ======================================================== */}
        <div className="relative -mt-1.5 sm:-mt-2 z-20 flex items-center justify-center">
          {/* Heavy Dark-Iron Retraction Socket */}
          <div className="relative w-28 sm:w-36 h-8 sm:h-11 rounded-b-xl bg-gradient-to-b from-[#28292f] via-[#1d1e22] to-[#121316] border-b-2 border-x-2 border-[#545763] shadow-[0_6px_16px_rgba(0,0,0,0.92)] flex items-center justify-center overflow-hidden">
            {/* Left Socket Bolt */}
            <div className="absolute left-1.5 sm:left-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-gradient-to-br from-[#8d939e] to-[#25282f] border border-[#141518] shadow-[0_1px_2px_rgba(0,0,0,0.9)] flex items-center justify-center">
              <span className="w-1.5 h-[1px] bg-[#141518]" />
            </div>

            {/* Recessed Socket Cavity */}
            <div className="relative w-20 sm:w-26 h-6 sm:h-7.5 rounded-lg bg-[#0e0f12] shadow-[inset_0_3px_8px_rgba(0,0,0,0.95)] flex items-center justify-center overflow-hidden">
              {/* Retractable Gold-Beveled Cancel Button */}
              <button
                type="button"
                data-testid="cancel-matchmaking-button"
                data-retracted={isLocked ? 'true' : 'false'}
                onClick={closeFindingOpponent}
                disabled={isLocked}
                className="group relative px-4 sm:px-6 py-0.5 sm:py-1 rounded-md bg-gradient-to-b from-[#f9ecd2] via-[#e2cba2] to-[#c7ad7e] border border-[#a17a37] shadow-[inset_0_1px_2px_rgba(255,255,255,0.7),0_2px_5px_rgba(0,0,0,0.8)] cursor-pointer focus:outline-none transition-all duration-300"
                style={{
                  transform: isLocked ? 'translateY(36px)' : 'translateY(0px)',
                  opacity: isLocked ? 0 : 1,
                  pointerEvents: isLocked ? 'none' : 'auto',
                }}
              >
                <span
                  className="font-bold text-[clamp(10.5px,1.8dvh,13.5px)] text-[#3a200d] tracking-wider group-hover:text-[#211105]"
                  style={{ fontFamily: "'Cinzel', 'Georgia', 'Times New Roman', serif" }}
                >
                  Cancel
                </span>
              </button>
            </div>

            {/* Right Socket Bolt */}
            <span className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-gradient-to-br from-[#8d939e] to-[#25282f] border border-[#141518] shadow-[0_1px_2px_rgba(0,0,0,0.9)] flex items-center justify-center">
              <span className="w-1.5 h-[1px] bg-[#141518]" />
            </span>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
