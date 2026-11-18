import React, { useState, useEffect, useRef } from 'react';
import { useBattleStore } from '../../store/useBattleStore.ts';
import { MulliganOverlay } from './MulliganOverlay.tsx';
import { TargetingArrowOverlay } from './TargetingArrowOverlay.tsx';
import { DiscoverOverlay } from './DiscoverOverlay.tsx';
import { MatchResultModal } from './MatchResultModal.tsx';
import { BraidedTurnRope } from './BraidedTurnRope.tsx';
import { DeckPile3D } from './DeckPile3D.tsx';
import { EndTurnSwitch } from './EndTurnSwitch.tsx';
import { HistoryRail } from './HistoryRail.tsx';
import { BoardMinion } from './BoardMinion.tsx';
import { HeroPortraitMedallion } from './HeroPortraitMedallion.tsx';
import { CarvedManaTray } from './CarvedManaTray.tsx';
import { SettingsCogMedallion } from './SettingsCogMedallion.tsx';
import { getStagePointerCoords } from '../../utils/pointerCoords.ts';
import { resolveCardEffect } from '../../engine/cardEffects.ts';
import { useViewportStage } from '../layout/LandscapeViewportShell.tsx';

interface MinionDragState {
  cardId: string;
  cardName: string;
  definitionId: string;
  cost: number;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  isOverFriendlyBoard: boolean;
  dropIndex: number;
}

export const BattlefieldScreen: React.FC = () => {
  const battle = useBattleStore((s) => s.battle);
  const isMenuOpen = useBattleStore((s) => s.isMenuOpen);
  const toggleMenu = useBattleStore((s) => s.toggleMenu);
  const concede = useBattleStore((s) => s.concede);
  const endTurn = useBattleStore((s) => s.endTurn);
  const playCard = useBattleStore((s) => s.playCard);

  // Targeting actions from store
  const startTargeting = useBattleStore((s) => s.startTargeting);
  const commitTargeting = useBattleStore((s) => s.commitTargeting);
  const setHoveredTarget = useBattleStore((s) => s.setHoveredTarget);

  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [minionDrag, setMinionDrag] = useState<MinionDragState | null>(null);
  const [slamEffect, setSlamEffect] = useState<{ x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const playerBoardRef = useRef<HTMLDivElement>(null);

  // Responsive stage height detection
  const { stageHeight } = useViewportStage();
  const isCompact = stageHeight < 540;

  // Detect forced portrait mode for coordinate normalization
  const isForcedPortrait =
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('landscape-forced-portrait');

  // Ref to hold minionDrag state for global event listeners
  const minionDragRef = useRef<MinionDragState | null>(null);
  useEffect(() => {
    minionDragRef.current = minionDrag;
  }, [minionDrag]);

  // Global pointer move and up handlers when targeting or dragging minions
  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent | PointerEvent) => {
      const coords = getStagePointerCoords(e, isForcedPortrait);

      // 1. Update targeting coords if active
      const state = useBattleStore.getState();
      if (state.isTargeting) {
        state.updateTargetCoords(coords.x, coords.y);
      }

      // 2. Update minion drag if active
      const curDrag = minionDragRef.current;
      if (curDrag && playerBoardRef.current) {
        const boardRect = playerBoardRef.current.getBoundingClientRect();
        // Generous vertical drop buffer around the friendly board row
        const isOver =
          coords.x >= boardRect.left - 40 &&
          coords.x <= boardRect.right + 40 &&
          coords.y >= boardRect.top - 40 &&
          coords.y <= boardRect.bottom + 60;

        // Calculate drop slot index based on minion centers
        const curBoard = useBattleStore.getState().battle?.player.board || [];
        let dropIdx = curBoard.length;

        if (curBoard.length > 0) {
          const minionEls = playerBoardRef.current.querySelectorAll('[data-testid="board-minion"]');
          for (let i = 0; i < minionEls.length; i++) {
            const mRect = minionEls[i].getBoundingClientRect();
            const centerX = mRect.left + mRect.width / 2;
            if (coords.x < centerX) {
              dropIdx = i;
              break;
            }
          }
        }

        setMinionDrag({
          ...curDrag,
          currentX: coords.x,
          currentY: coords.y,
          isOverFriendlyBoard: isOver,
          dropIndex: dropIdx,
        });
      }
    };

    const handleUp = (e: MouseEvent | TouchEvent | PointerEvent) => {
      // 1. Handle targeting commit/cancel
      const state = useBattleStore.getState();
      if (state.isTargeting) {
        let clientX = 0;
        let clientY = 0;
        if ('changedTouches' in e && e.changedTouches.length > 0) {
          clientX = e.changedTouches[0].clientX;
          clientY = e.changedTouches[0].clientY;
        } else if ('clientX' in e) {
          clientX = e.clientX;
          clientY = e.clientY;
        }

        const targetEl = document.elementFromPoint(clientX, clientY);
        const targetDrop = targetEl?.closest('[data-target-id]');
        const targetId = targetDrop?.getAttribute('data-target-id');

        if (targetId) {
          state.commitTargeting(targetId);
        } else {
          state.cancelTargeting();
        }
      }

      // 2. Handle minion drag release (Drop on friendly board or glide back)
      const curDrag = minionDragRef.current;
      if (curDrag) {
        if (curDrag.isOverFriendlyBoard) {
          // Play minion into exact slot index
          playCard(curDrag.cardId, undefined, curDrag.dropIndex);
          // Trigger board slam shockwave
          setSlamEffect({ x: curDrag.currentX, y: curDrag.currentY });
          setTimeout(() => setSlamEffect(null), 500);
        }
        setMinionDrag(null);
      }
    };

    window.addEventListener('pointermove', handleMove, true);
    window.addEventListener('pointerup', handleUp, true);
    window.addEventListener('mousemove', handleMove, true);
    window.addEventListener('mouseup', handleUp, true);
    window.addEventListener('touchmove', handleMove, true);
    window.addEventListener('touchend', handleUp, true);

    document.addEventListener('pointerup', handleUp, true);
    document.addEventListener('mouseup', handleUp, true);

    return () => {
      window.removeEventListener('pointermove', handleMove, true);
      window.removeEventListener('pointerup', handleUp, true);
      window.removeEventListener('mousemove', handleMove, true);
      window.removeEventListener('mouseup', handleUp, true);
      window.removeEventListener('touchmove', handleMove, true);
      window.removeEventListener('touchend', handleUp, true);

      document.removeEventListener('pointerup', handleUp, true);
      document.removeEventListener('mouseup', handleUp, true);
    };
  }, [isForcedPortrait, playCard]);

  if (!battle) return null;

  const isPlayerTurn = battle.activePlayer === 'player' && battle.phase === 'ACTION';
  const player = battle.player;
  const opponent = battle.opponent;

  // Determine if player has playable actions for EndTurn switch state
  const hasPlayableCards = player.hand.some((c) => player.mana >= c.cost);
  const canUsePower = !player.heroPowerUsed && player.mana >= player.heroPowerCost;
  const canMinionAttack = player.board.some((m) => !m.isExhausted && !m.isFrozen && m.attack > 0);
  const hasPlayableActions = isPlayerTurn && (hasPlayableCards || canUsePower || canMinionAttack);

  // Handlers for starting attacks / hero powers
  const handleHeroPowerPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!isPlayerTurn || player.heroPowerUsed || player.mana < player.heroPowerCost) return;
    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    } catch {
      // safe
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;
    startTargeting({ type: 'HERO_POWER', id: 'hero_power', name: 'Fireblast' }, startX, startY);
  };

  const handleMinionPointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    minionId: string,
    minionName: string
  ) => {
    e.preventDefault();
    const minion = player.board.find((m) => m.instanceId === minionId);
    if (!isPlayerTurn || !minion || minion.isExhausted || minion.isFrozen || minion.attack <= 0) return;
    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    } catch {
      // safe
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;
    startTargeting({ type: 'MINION_ATTACK', id: minionId, name: minionName }, startX, startY);
  };

  // Card interaction: drag-and-drop for minions, targeting arrow for spells needing targets
  const handleCardPointerDown = (e: React.PointerEvent<HTMLDivElement>, cardId: string) => {
    e.preventDefault();
    if (!isPlayerTurn) return;
    const card = player.hand.find((c) => c.instanceId === cardId);
    if (!card || player.mana < card.cost) return;

    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    } catch {
      // safe
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;

    const effect = resolveCardEffect({
      name: card.name,
      text: card.text,
      cost: card.cost,
      type: card.type,
    });

    if (card.type === 'SPELL' && effect.needsTarget) {
      // Targeted spell uses targeting arrow
      startTargeting({ type: 'SPELL', id: cardId, name: card.name }, startX, startY);
    } else {
      // Minion or non-targeted spell uses drag-and-drop placement
      setMinionDrag({
        cardId: card.instanceId,
        cardName: card.name,
        definitionId: card.definitionId,
        cost: card.cost,
        startX,
        startY,
        currentX: startX,
        currentY: startY,
        isOverFriendlyBoard: false,
        dropIndex: player.board.length,
      });
    }
  };

  // Quick-play click fallback (accessibility / direct tap)
  const handleCardClick = (cardId: string) => {
    if (!isPlayerTurn) return;
    const card = player.hand.find((c) => c.instanceId === cardId);
    if (!card || player.mana < card.cost) return;

    const effect = resolveCardEffect({
      name: card.name,
      text: card.text,
      cost: card.cost,
      type: card.type,
    });

    if (!effect.needsTarget) {
      playCard(cardId, undefined, player.board.length);
    }
  };

  return (
    <div
      ref={containerRef}
      data-testid="battlefield-screen"
      className="relative w-full h-full select-none overflow-hidden flex flex-col justify-between font-sans text-stone-100 bg-[#160e08]"
      style={{
        backgroundImage: `
          radial-gradient(ellipse at 50% 50%, rgba(92, 70, 48, 0.45) 0%, rgba(20, 13, 8, 0.98) 90%),
          linear-gradient(135deg, #1f140c 0%, #0e0704 100%)
        `,
      }}
    >
      {/* Inline SVG Filter for Sandstone Mineral Texture */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <filter id="hearth-sandstone-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.8  0 0 0 0 0.65  0 0 0 0 0.5  0 0 0 0.035 0"
          />
        </filter>
      </svg>

      {/* Carved Tavern Oak & Walnut Arena Table Frame */}
      <div className="absolute inset-2 sm:inset-3 rounded-[32px] sm:rounded-[44px] pointer-events-none z-0 border-[8px] sm:border-[12px] border-[#29180d] bg-gradient-to-b from-[#24170e] via-[#1a0f07] to-[#120a05] shadow-[inset_0_0_60px_rgba(0,0,0,0.95),0_0_40px_rgba(0,0,0,0.98)] overflow-hidden">
        {/* Recessed Weathered Sandstone Arena Floor */}
        <div
          className="w-full h-full opacity-95 relative"
          style={{
            background:
              'radial-gradient(ellipse at 50% 50%, #66492f 0%, #50351f 40%, #352112 75%, #1c1007 100%)',
          }}
        >
          {/* Mineral Grain Filter Overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-45 mix-blend-overlay"
            style={{ filter: 'url(#hearth-sandstone-grain)' }}
          />

          {/* Directional Top-Down Tavern Warm Lighting Sheen */}
          <div
            className="absolute inset-x-0 top-0 h-28 pointer-events-none"
            style={{
              background:
                'linear-gradient(180deg, rgba(254, 240, 138, 0.09) 0%, rgba(245, 158, 11, 0.03) 60%, transparent 100%)',
            }}
          />

          {/* Corner Table Braziers Casting Warm Candlelit Pools */}
          <div className="absolute top-2 left-2 w-32 h-32 rounded-full bg-radial from-amber-500/25 via-orange-600/10 to-transparent blur-2xl pointer-events-none animate-pulse" />
          <div className="absolute top-2 right-2 w-32 h-32 rounded-full bg-radial from-amber-500/25 via-orange-600/10 to-transparent blur-2xl pointer-events-none animate-pulse" />
          <div className="absolute bottom-2 left-2 w-32 h-32 rounded-full bg-radial from-amber-500/25 via-orange-600/10 to-transparent blur-2xl pointer-events-none animate-pulse" />
          <div className="absolute bottom-2 right-2 w-32 h-32 rounded-full bg-radial from-amber-500/25 via-orange-600/10 to-transparent blur-2xl pointer-events-none animate-pulse" />

          {/* Diagonal Weathered Sandstone Etchings */}
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(0,0,0,0.6) 40px, rgba(0,0,0,0.6) 42px)',
            }}
          />

          {/* Carved Runic Arena Center Inlay SVG */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-80 sm:h-80 pointer-events-none opacity-40">
            <svg className="w-full h-full text-[#d4af37]" viewBox="0 0 200 200" fill="none">
              <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
              <circle cx="100" cy="100" r="75" stroke="currentColor" strokeWidth="1" />
              <polygon points="100,28 172,100 100,172 28,100" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
              <polygon points="100,38 162,100 100,162 38,100" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
              <circle cx="100" cy="100" r="50" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="100" cy="100" r="30" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
              {/* Radial Rune Notches */}
              <line x1="100" y1="5" x2="100" y2="25" stroke="currentColor" strokeWidth="1.5" />
              <line x1="100" y1="175" x2="100" y2="195" stroke="currentColor" strokeWidth="1.5" />
              <line x1="5" y1="100" x2="25" y2="100" stroke="currentColor" strokeWidth="1.5" />
              <line x1="175" y1="100" x2="195" y2="100" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>

          {/* Center Seam Dividing Horizontal Groove with Iron Rivets */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 bg-[#170e06] border-y border-[#3d2413] shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] opacity-80" />
        </div>
      </div>

      {/* Sculpted Brushed-Brass Corner Hardware with Iron Rivets */}
      <svg
        className="absolute top-2.5 left-2.5 w-16 h-16 sm:w-20 sm:h-20 text-[#c59b27] pointer-events-none z-10 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
        viewBox="0 0 64 64"
        fill="currentColor"
      >
        <path
          d="M 4 4 L 38 4 C 40 4 41 6 40 8 L 36 12 C 34 14 30 16 26 16 L 16 16 C 16 26 14 30 12 36 L 8 40 C 6 41 4 40 4 38 Z"
          fill="url(#brassCornerGrad)"
        />
        <circle cx="10" cy="10" r="3" fill="#1f140a" stroke="#eab308" strokeWidth="1" />
        <circle cx="28" cy="10" r="2.5" fill="#1f140a" stroke="#ca8a04" strokeWidth="0.8" />
        <circle cx="10" cy="28" r="2.5" fill="#1f140a" stroke="#ca8a04" strokeWidth="0.8" />
        <defs>
          <linearGradient id="brassCornerGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="40%" stopColor="#d4af37" />
            <stop offset="80%" stopColor="#855812" />
            <stop offset="100%" stopColor="#533408" />
          </linearGradient>
        </defs>
      </svg>

      <svg
        className="absolute top-2.5 right-2.5 w-16 h-16 sm:w-20 sm:h-20 text-[#c59b27] pointer-events-none z-10 transform scale-x-[-1] filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
        viewBox="0 0 64 64"
        fill="currentColor"
      >
        <path
          d="M 4 4 L 38 4 C 40 4 41 6 40 8 L 36 12 C 34 14 30 16 26 16 L 16 16 C 16 26 14 30 12 36 L 8 40 C 6 41 4 40 4 38 Z"
          fill="url(#brassCornerGrad)"
        />
        <circle cx="10" cy="10" r="3" fill="#1f140a" stroke="#eab308" strokeWidth="1" />
        <circle cx="28" cy="10" r="2.5" fill="#1f140a" stroke="#ca8a04" strokeWidth="0.8" />
        <circle cx="10" cy="28" r="2.5" fill="#1f140a" stroke="#ca8a04" strokeWidth="0.8" />
      </svg>

      <svg
        className="absolute bottom-2.5 left-2.5 w-16 h-16 sm:w-20 sm:h-20 text-[#c59b27] pointer-events-none z-10 transform scale-y-[-1] filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
        viewBox="0 0 64 64"
        fill="currentColor"
      >
        <path
          d="M 4 4 L 38 4 C 40 4 41 6 40 8 L 36 12 C 34 14 30 16 26 16 L 16 16 C 16 26 14 30 12 36 L 8 40 C 6 41 4 40 4 38 Z"
          fill="url(#brassCornerGrad)"
        />
        <circle cx="10" cy="10" r="3" fill="#1f140a" stroke="#eab308" strokeWidth="1" />
        <circle cx="28" cy="10" r="2.5" fill="#1f140a" stroke="#ca8a04" strokeWidth="0.8" />
        <circle cx="10" cy="28" r="2.5" fill="#1f140a" stroke="#ca8a04" strokeWidth="0.8" />
      </svg>

      <svg
        className="absolute bottom-2.5 right-2.5 w-16 h-16 sm:w-20 sm:h-20 text-[#c59b27] pointer-events-none z-10 transform scale-x-[-1] scale-y-[-1] filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
        viewBox="0 0 64 64"
        fill="currentColor"
      >
        <path
          d="M 4 4 L 38 4 C 40 4 41 6 40 8 L 36 12 C 34 14 30 16 26 16 L 16 16 C 16 26 14 30 12 36 L 8 40 C 6 41 4 40 4 38 Z"
          fill="url(#brassCornerGrad)"
        />
        <circle cx="10" cy="10" r="3" fill="#1f140a" stroke="#eab308" strokeWidth="1" />
        <circle cx="28" cy="10" r="2.5" fill="#1f140a" stroke="#ca8a04" strokeWidth="0.8" />
        <circle cx="10" cy="28" r="2.5" fill="#1f140a" stroke="#ca8a04" strokeWidth="0.8" />
      </svg>

      {/* Left Carved History Scroll Rail */}
      <HistoryRail history={battle.history} />

      {/* Opponent Area (Top) */}
      <div className="relative z-10 flex flex-col items-center pt-0.5 sm:pt-2 w-full flex-shrink-0">
        {/* Opponent Face-down Hand Fan */}
        <div className="flex justify-center -space-x-2 sm:-space-x-3 h-7 sm:h-11 overflow-visible mb-0.5">
          {opponent.hand.map((card, idx) => (
            <div
              key={card.instanceId}
              className="w-7 sm:w-11 h-10 sm:h-15 rounded-md sm:rounded-lg bg-gradient-to-b from-[#1c2c47] via-[#101b2f] to-[#0a1220] border sm:border-2 border-amber-600/70 shadow-lg transform hover:-translate-y-1 transition-transform flex items-center justify-center select-none"
              style={{
                transform: `rotate(${(idx - (opponent.hand.length - 1) / 2) * 4}deg)`,
              }}
            >
              <div className="w-3.5 h-3.5 sm:w-5 sm:h-5 rounded-full border border-amber-400 bg-amber-500/20 flex items-center justify-center text-[7px] sm:text-[10px] text-amber-300 shadow">
                🌀
              </div>
            </div>
          ))}
        </div>

        {/* Opponent Hero Medallion Cluster */}
        <HeroPortraitMedallion
          hero={opponent}
          isPlayer={false}
          isPlayerTurn={isPlayerTurn}
          isCompact={isCompact}
          onHeroPointerEnter={() => setHoveredTarget('opponent')}
          onHeroPointerLeave={() => setHoveredTarget(null)}
          onHeroPointerUp={() => {
            if (useBattleStore.getState().isTargeting) commitTargeting('opponent');
          }}
          onHeroClick={() => {
            if (useBattleStore.getState().isTargeting) commitTargeting('opponent');
          }}
        />
      </div>

      {/* Center Battlefield Board (Cracked Sandstone Arena) */}
      <div className="relative z-10 flex-1 min-h-0 w-full max-w-5xl mx-auto flex flex-col justify-around py-0.5 sm:py-1 px-6 sm:px-14">
        {/* Opponent Minions Row (Max 7) */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-4 min-h-[50px] sm:min-h-[96px] w-full">
          {opponent.board.map((minion) => (
            <BoardMinion
              key={minion.instanceId}
              minion={minion}
              isFriendly={false}
              canAttack={false}
              isCompact={isCompact}
              onPointerEnter={() => setHoveredTarget(minion.instanceId)}
              onPointerLeave={() => setHoveredTarget(null)}
              onPointerUp={() => {
                if (useBattleStore.getState().isTargeting) commitTargeting(minion.instanceId);
              }}
              onClick={() => {
                if (useBattleStore.getState().isTargeting) commitTargeting(minion.instanceId);
              }}
            />
          ))}
        </div>

        {/* Center Split & Burning Hemp Fuse Rope */}
        <div className="relative w-full h-2.5 sm:h-4 my-0.5 flex items-center justify-center">
          {battle.isRopeBurning && (
            <BraidedTurnRope timeRemaining={battle.turnTimeRemaining} totalDuration={20} />
          )}
        </div>

        {/* Player Friendly Minions Row (Max 7) & Live Drag Dropzone */}
        <div
          ref={playerBoardRef}
          data-testid="player-board-dropzone"
          className={`relative flex items-center justify-center gap-1.5 sm:gap-4 min-h-[50px] sm:min-h-[96px] w-full rounded-xl sm:rounded-2xl mb-1.5 sm:mb-0 pb-1 transition-all duration-200 ${
            minionDrag?.isOverFriendlyBoard
              ? 'bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,0.16)_0%,transparent_72%)] shadow-[0_0_35px_rgba(245,158,11,0.2)]'
              : ''
          }`}
        >
          {player.board.map((minion, idx) => {
            const canAttack = isPlayerTurn && !minion.isExhausted && !minion.isFrozen && minion.attack > 0;
            // Slot parting offset during minion drag
            let partingTransform = '';
            if (minionDrag?.isOverFriendlyBoard) {
              if (idx < minionDrag.dropIndex) {
                partingTransform = 'translateX(-22px)';
              } else {
                partingTransform = 'translateX(22px)';
              }
            }

            return (
              <React.Fragment key={minion.instanceId}>
                {/* Slot Parting Indicator if hovering before this minion */}
                {minionDrag?.isOverFriendlyBoard && minionDrag.dropIndex === idx && (
                  <div
                    data-testid="minion-slot-parting-indicator"
                    className="w-10 sm:w-16 h-14 sm:h-22 rounded-xl flex items-center justify-center flex-shrink-0 mx-0.5 sm:mx-1 pointer-events-none"
                  >
                    <div className="relative w-full h-full flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full bg-amber-400/15 blur-[6px] animate-pulse" />
                      <svg
                        viewBox="0 0 64 88"
                        className="w-full h-full filter drop-shadow-[0_0_10px_rgba(245,158,11,0.85)] drop-shadow-[0_0_4px_rgba(251,191,36,0.95)]"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <ellipse
                          cx="32"
                          cy="44"
                          rx="28"
                          ry="38"
                          stroke="#f59e0b"
                          strokeWidth="1.5"
                          strokeDasharray="4 3"
                          opacity="0.75"
                        />
                        <ellipse
                          cx="32"
                          cy="44"
                          rx="20"
                          ry="28"
                          stroke="#fbbf24"
                          strokeWidth="2"
                        />
                        <polygon
                          points="32,26 44,44 32,62 20,44"
                          fill="rgba(245,158,11,0.25)"
                          stroke="#fde68a"
                          strokeWidth="2"
                          strokeLinejoin="round"
                        />
                        <circle cx="32" cy="18" r="2.5" fill="#fde68a" />
                        <circle cx="32" cy="70" r="2.5" fill="#fde68a" />
                        <circle cx="14" cy="44" r="2" fill="#fde68a" />
                        <circle cx="50" cy="44" r="2" fill="#fde68a" />
                        <circle cx="32" cy="44" r="3" fill="#fffbeb" />
                      </svg>
                    </div>
                  </div>
                )}

                <div
                  style={{
                    transform: partingTransform,
                    transition: 'transform 0.18s cubic-bezier(0.2, 0.8, 0.2, 1)',
                  }}
                >
                  <BoardMinion
                    minion={minion}
                    isFriendly={true}
                    canAttack={canAttack}
                    isCompact={isCompact}
                    onPointerDown={(e) =>
                      handleMinionPointerDown(e, minion.instanceId, minion.name)
                    }
                    onPointerEnter={() => setHoveredTarget(minion.instanceId)}
                    onPointerLeave={() => setHoveredTarget(null)}
                    onPointerUp={() => {
                      if (useBattleStore.getState().isTargeting) commitTargeting(minion.instanceId);
                    }}
                    onClick={() => {
                      if (useBattleStore.getState().isTargeting) commitTargeting(minion.instanceId);
                    }}
                  />
                </div>
              </React.Fragment>
            );
          })}

          {/* Slot Parting Indicator if hovering at the very end of board */}
          {minionDrag?.isOverFriendlyBoard && minionDrag.dropIndex === player.board.length && (
            <div
              data-testid="minion-slot-parting-indicator"
              className="w-10 sm:w-16 h-14 sm:h-22 rounded-xl flex items-center justify-center flex-shrink-0 mx-0.5 sm:mx-1 pointer-events-none"
            >
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-amber-400/15 blur-[6px] animate-pulse" />
                <svg
                  viewBox="0 0 64 88"
                  className="w-full h-full filter drop-shadow-[0_0_10px_rgba(245,158,11,0.85)] drop-shadow-[0_0_4px_rgba(251,191,36,0.95)]"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <ellipse
                    cx="32"
                    cy="44"
                    rx="28"
                    ry="38"
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                    opacity="0.75"
                  />
                  <ellipse
                    cx="32"
                    cy="44"
                    rx="20"
                    ry="28"
                    stroke="#fbbf24"
                    strokeWidth="2"
                  />
                  <polygon
                    points="32,26 44,44 32,62 20,44"
                    fill="rgba(245,158,11,0.25)"
                    stroke="#fde68a"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <circle cx="32" cy="18" r="2.5" fill="#fde68a" />
                  <circle cx="32" cy="70" r="2.5" fill="#fde68a" />
                  <circle cx="14" cy="44" r="2" fill="#fde68a" />
                  <circle cx="50" cy="44" r="2" fill="#fde68a" />
                  <circle cx="32" cy="44" r="3" fill="#fffbeb" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Rail Mechanics: 3D Decks & Mechanical End Turn Switch */}
      <div className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-1 sm:gap-4">
        {/* Opponent 3D Deck Pile */}
        <DeckPile3D count={opponent.deck.length} owner="opponent" isCompact={isCompact} />

        {/* Mechanical End Turn Switch */}
        <EndTurnSwitch
          isPlayerTurn={isPlayerTurn}
          hasPlayableActions={hasPlayableActions}
          isCompact={isCompact}
          onEndTurn={() => endTurn()}
        />

        {/* Player 3D Deck Pile */}
        <DeckPile3D count={player.deck.length} owner="player" isCompact={isCompact} />
      </div>

      {/* Bottom Area: Hero Cluster, Borderless Hand Fan, Single Settings Medallion */}
      <div
        className={`relative z-10 flex flex-row items-end justify-between ${
          isCompact ? '-bottom-4 pb-0' : '-bottom-2 pb-1'
        } px-2 sm:px-10 w-full flex-shrink-0`}
      >
        {/* Player Hero Cluster (Gilded Arch Medallion + Carved Mana Tray) */}
        <div className="flex items-center gap-1.5 sm:gap-4 mb-0.5 sm:mb-1 flex-shrink-0 z-20">
          <HeroPortraitMedallion
            hero={player}
            isPlayer={true}
            isPlayerTurn={isPlayerTurn}
            isCompact={isCompact}
            onHeroPointerEnter={() => setHoveredTarget('player')}
            onHeroPointerLeave={() => setHoveredTarget(null)}
            onHeroPointerUp={() => {
              if (useBattleStore.getState().isTargeting) commitTargeting('player');
            }}
            onHeroClick={() => {
              if (useBattleStore.getState().isTargeting) commitTargeting('player');
            }}
            onHeroPowerPointerDown={handleHeroPowerPointerDown}
          />

          <CarvedManaTray mana={player.mana} maxMana={player.maxMana} />
        </div>

        {/* Borderless Curved Hand Fan */}
        <div
          data-testid="player-hand-fan"
          className={`flex-1 flex justify-center ${
            isCompact ? '-space-x-5 h-[76px]' : '-space-x-10 h-[146px]'
          } overflow-visible max-w-2xl px-1 sm:px-2 z-10`}
        >
          {player.hand.map((card, idx) => {
            const isPlayable = isPlayerTurn && player.mana >= card.cost;
            const rot = (idx - (player.hand.length - 1) / 2) * 3;
            const isHovered = hoveredCardId === card.instanceId;
            const isBeingDragged = minionDrag?.cardId === card.instanceId;

            return (
              <div
                key={card.instanceId}
                data-testid="hand-card"
                data-card-type={card.type}
                onPointerDown={(e) => handleCardPointerDown(e, card.instanceId)}
                onClick={() => handleCardClick(card.instanceId)}
                onMouseEnter={() => setHoveredCardId(card.instanceId)}
                onMouseLeave={() => setHoveredCardId(null)}
                style={{
                  border: 'none',
                  borderWidth: '0px',
                  backgroundColor: 'transparent',
                  transform: isBeingDragged
                    ? 'translateY(60px) scale(0.85) opacity(0.3)'
                    : isHovered
                    ? isCompact
                      ? 'translateY(-10px) scale(1.1) rotate(0deg)'
                      : 'translateY(-28px) scale(1.25) rotate(0deg)'
                    : `rotate(${rot}deg)`,
                  zIndex: isHovered ? 40 : idx + 10,
                  opacity: isBeingDragged ? 0.3 : 1,
                  transition: isBeingDragged
                    ? 'none'
                    : 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), filter 0.2s ease',
                }}
                className={`relative ${
                  isCompact ? 'w-[50px] h-[70px]' : 'w-[102px] h-[144px]'
                } flex-shrink-0 flex items-center justify-center select-none cursor-pointer ${
                  isPlayable
                    ? 'filter drop-shadow-[0_0_12px_rgba(16,185,129,0.92)] drop-shadow-[0_0_4px_rgba(52,211,153,0.85)] drop-shadow-[0_8px_14px_rgba(0,0,0,0.7)]'
                    : 'filter drop-shadow-[0_8px_14px_rgba(0,0,0,0.7)]'
                }`}
              >
                <img
                  src={`/art/cards/${card.definitionId}.png`}
                  alt={card.name}
                  className="w-full h-full object-contain select-none pointer-events-none"
                />
              </div>
            );
          })}
        </div>

        {/* Single Bottom-Right Settings Cog Medallion */}
        <SettingsCogMedallion onClick={() => toggleMenu()} />
      </div>

      {/* Floating Card Drag Preview when Dragging Minion */}
      {minionDrag && (
        <div
          className="fixed pointer-events-none z-50 flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${minionDrag.currentX}px`,
            top: `${minionDrag.currentY}px`,
            transform: `translate(-50%, -50%) scale(1.15) rotate(${Math.max(
              -12,
              Math.min(12, (minionDrag.currentX - minionDrag.startX) * 0.08)
            )}deg)`,
            filter:
              'drop-shadow(0 20px 35px rgba(0,0,0,0.9)) drop-shadow(0 0 15px rgba(245,158,11,0.6))',
          }}
        >
          <div className="w-28 sm:w-32 h-40 sm:h-46">
            <img
              src={`/art/cards/${minionDrag.definitionId}.png`}
              alt={minionDrag.cardName}
              className="w-full h-full object-contain select-none pointer-events-none"
            />
          </div>
        </div>
      )}

      {/* Physical Board Slam Dust Ring Shockwave Effect */}
      {slamEffect && (
        <div
          className="fixed pointer-events-none z-40 transform -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${slamEffect.x}px`, top: `${slamEffect.y}px` }}
        >
          <div className="w-28 h-28 rounded-full border-2 border-amber-400/80 bg-amber-400/20 animate-ping" />
        </div>
      )}

      {/* In-Game Menu Modal */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-[#1c120b] border-4 border-[#8e6129] shadow-[0_0_50px_rgba(0,0,0,0.95)] max-w-sm w-full animate-scaleIn">
            <h3 className="text-3xl font-serif font-black text-amber-200 uppercase tracking-wider drop-shadow">
              Game Menu
            </h3>
            <p className="text-xs font-serif text-stone-400 text-center mb-2">
              Match in progress against Archmage Bot.
            </p>
            <button
              type="button"
              data-testid="concede-button"
              onClick={() => concede()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-red-800 via-red-700 to-red-800 hover:from-red-700 hover:to-red-600 border-2 border-red-400 font-serif font-black text-base text-white tracking-wider uppercase shadow-lg transition-all cursor-pointer"
            >
              Concede Match
            </button>
            <button
              type="button"
              onClick={() => toggleMenu(false)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-stone-800 via-stone-700 to-stone-800 hover:from-stone-700 hover:to-stone-600 border-2 border-stone-600 font-serif font-black text-base text-amber-100 tracking-wider uppercase shadow-lg transition-all cursor-pointer"
            >
              Resume Game
            </button>
          </div>
        </div>
      )}

      {/* Overlays */}
      <MulliganOverlay />
      <TargetingArrowOverlay />
      <DiscoverOverlay />
      <MatchResultModal />
    </div>
  );
};
