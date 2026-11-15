import React, { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useCollectionStore } from '../../store/useCollectionStore';

export function CardInspectModal() {
  const inspectedCard = useCollectionStore((s) => s.inspectedCard);
  const setInspectedCard = useCollectionStore((s) => s.setInspectedCard);
  const editingDeckId = useCollectionStore((s) => s.editingDeckId);
  const decks = useCollectionStore((s) => s.decks);
  const addCardToDeck = useCollectionStore((s) => s.addCardToDeck);
  const removeCardFromDeck = useCollectionStore((s) => s.removeCardFromDeck);

  const [imgStatus, setImgStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  // 3D Pointer Tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { stiffness: 220, damping: 20 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [16, -16]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-16, 16]), springConfig);

  // Dynamic light sheen across card surface
  const glareX = useSpring(useTransform(mouseX, [-0.5, 0.5], [0, 100]), springConfig);
  const glareY = useSpring(useTransform(mouseY, [-0.5, 0.5], [0, 100]), springConfig);

  if (!inspectedCard) return null;

  const activeDeck = decks.find((d) => d.id === editingDeckId);
  const countInDeck = activeDeck?.cards[inspectedCard.id] || 0;
  const maxCopies = inspectedCard.rarity === 'LEGENDARY' ? 1 : 2;
  const isCapped = countInDeck >= maxCopies;
  const isFull = (activeDeck?.totalCount || 0) >= 30;

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handlePointerLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <div
      onClick={() => setInspectedCard(null)}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none cursor-pointer overflow-hidden"
      data-testid="card-inspect-modal"
      aria-modal="true"
      role="dialog"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-3xl w-full flex flex-row items-center justify-center gap-4 sm:gap-6 cursor-default my-auto py-1 px-2"
      >
        {/* 3D Tilted Card Presentation Container */}
        <motion.div
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
          className="relative h-[clamp(210px,76dvh,380px)] aspect-[5/7] shrink-0 flex items-center justify-center group"
        >
          {/* Dynamic Light Sheen / Specular Glare */}
          <motion.div
            style={{
              background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.06) 40%, transparent 70%)`,
            }}
            className="absolute inset-0 rounded-3xl pointer-events-none z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          />

          {/* Fallback Canvas - ONLY rendered if image is NOT loaded */}
          {imgStatus !== 'loaded' && (
            <div className="absolute inset-0 rounded-2xl p-4 flex flex-col justify-between bg-gradient-to-b from-[#2a170b] to-[#120803] border-3 border-[#8e6129] shadow-[0_20px_50px_rgba(0,0,0,0.95)] text-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-b from-sky-400 to-blue-800 text-white font-black text-sm flex items-center justify-center border border-white shadow">
                {inspectedCard.cost}
              </div>
              <div className="my-auto flex flex-col items-center">
                <div className="relative w-8 h-8 flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#93c5fd]/80" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polygon points="12,2 22,12 12,22 2,12" stroke="currentColor" strokeWidth="1.2" />
                    <polygon points="12,5 19,12 12,19 5,12" stroke="#60a5fa" strokeWidth="0.8" fill="rgba(59, 130, 246, 0.2)" />
                    <circle cx="12" cy="12" r="2.5" fill="#93c5fd" />
                    <circle cx="12" cy="12" r="1" fill="#ffffff" />
                  </svg>
                </div>
                <h3 className="text-sm font-black text-[#fae6a2] mt-1 font-serif">{inspectedCard.name}</h3>
                <p
                  className="text-[10px] text-stone-300 mt-1 px-2 leading-tight"
                  dangerouslySetInnerHTML={{ __html: inspectedCard.text }}
                />
              </div>
            </div>
          )}

          {/* High-Resolution Local & CDN Card Art */}
          <img
            src={`/art/cards/${inspectedCard.id}.png`}
            alt={inspectedCard.name}
            loading="eager"
            decoding="sync"
            onLoad={() => setImgStatus('loaded')}
            onError={(e) => {
              if (inspectedCard.imageUrl && e.currentTarget.src !== inspectedCard.imageUrl) {
                e.currentTarget.src = inspectedCard.imageUrl;
              } else {
                setImgStatus('error');
              }
            }}
            className={`w-full h-full object-contain pointer-events-none drop-shadow-[0_28px_50px_rgba(0,0,0,0.92)] transition-opacity duration-200 ${
              imgStatus === 'loaded' ? 'opacity-100' : 'opacity-0 absolute inset-0'
            }`}
          />
        </motion.div>

        {/* Narrative Flavor Text & Context Plaque (Zero Redundant Stats) */}
        <div className="w-full max-w-[320px] sm:max-w-sm p-3.5 sm:p-4 rounded-2xl bg-gradient-to-b from-[#2a170c] via-[#1d1007] to-[#120803] border-2 border-[#8e6129]/70 shadow-[0_20px_40px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.12)] text-center relative shrink min-w-0">
          
          {/* Top Header Row: Name, optional Tribe & Close Button */}
          <div className="flex items-center justify-between pb-2 border-b border-[#5a3915]/80">
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-[#fae6a2] font-serif tracking-wide drop-shadow">
                {inspectedCard.name}
              </h3>
              {inspectedCard.tribe && (
                <span className="px-2 py-0.5 rounded-md bg-[#241a12] border border-[#a8824b]/50 text-[#fae6a2] text-[10px] font-bold uppercase tracking-wider">
                  {inspectedCard.tribe}
                </span>
              )}
            </div>
            
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setInspectedCard(null)}
              aria-label="Close Inspector"
              className="w-6 h-6 rounded-full bg-[#1a0e06] border border-[#8e6328]/70 text-[#fae6a2] hover:bg-[#381e0e] hover:border-[#fae6a2] flex items-center justify-center text-xs font-black transition-all cursor-pointer shadow-xs ml-1"
            >
              ✕
            </button>
          </div>

          {/* Flavor Text Plaque */}
          {inspectedCard.flavorText && (
            <div data-testid="flavor-text" className="mt-3 p-3 rounded-xl bg-[#140a04] border border-[#5a3915]/60 shadow-[inset_0_1px_4px_rgba(0,0,0,0.85)]">
              <p className="text-xs italic text-[#e6ded4] font-serif leading-relaxed px-2 drop-shadow-xs">
                &ldquo;{inspectedCard.flavorText}&rdquo;
              </p>
            </div>
          )}

          {/* Deck Building Actions (when Deck Editor is open) */}
          {editingDeckId && (
            <div className="mt-3.5 pt-3 border-t border-[#5a3915]/80 flex items-center justify-between gap-3">
              {/* Recessed status plaque */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] bg-[#1d150f] border border-[#8e6328]/70 shadow-[inset_0_1px_3px_rgba(0,0,0,0.85)]">
                <span className="text-xs font-serif uppercase tracking-wider text-[#d6cfc4]">In Deck:</span>
                <strong className="font-mono text-xs font-black text-[#f5c451]">
                  {countInDeck} / {maxCopies}
                </strong>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={countInDeck <= 0}
                  onClick={() => removeCardFromDeck(inspectedCard.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow ${
                    countInDeck > 0
                      ? 'bg-gradient-to-b from-rose-900 to-rose-950 border border-rose-500/60 text-rose-100 hover:brightness-115 active:scale-95 cursor-pointer'
                      : 'bg-stone-900/60 text-stone-600 border border-stone-800 cursor-not-allowed'
                  }`}
                >
                  - Remove
                </button>

                <button
                  type="button"
                  disabled={isCapped || (isFull && countInDeck === 0)}
                  onClick={() => addCardToDeck(inspectedCard.id)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all shadow-[0_2px_8px_rgba(0,0,0,0.6)] ${
                    !isCapped && (!isFull || countInDeck > 0)
                      ? 'bg-gradient-to-b from-[#f7e2a4] via-[#c99a42] to-[#7a4f18] border border-[#fff2c2]/80 text-[#1a0e05] hover:brightness-115 active:scale-95 cursor-pointer'
                      : 'bg-stone-900/60 text-stone-600 border border-stone-800 cursor-not-allowed'
                  }`}
                >
                  + Add to Deck
                </button>
              </div>
            </div>
          )}

          {/* Dismissal footer */}
          <div className="mt-3 text-[11px] font-medium text-stone-400">
            Click anywhere or press ✕ to close
          </div>
        </div>
      </div>
    </div>
  );
}
