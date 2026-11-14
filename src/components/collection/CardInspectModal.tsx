import React, { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useCollectionStore } from '../../store/useCollectionStore';
import { RarityBadge } from './HearthstoneCard';

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
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none cursor-pointer overflow-y-auto"
      aria-modal="true"
      role="dialog"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-lg w-full flex flex-col items-center cursor-default my-auto py-2"
      >
        {/* 3D Tilted Card Presentation Container */}
        <motion.div
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
          className="relative w-72 sm:w-80 h-[430px] sm:h-[470px] flex items-center justify-center group"
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
            <div className="absolute inset-0 rounded-3xl p-5 flex flex-col justify-between bg-gradient-to-b from-[#2a170b] to-[#120803] border-4 border-[#8e6129] shadow-[0_30px_70px_rgba(0,0,0,0.95)] text-center">
              <div className="w-11 h-11 rounded-full bg-gradient-to-b from-sky-400 to-blue-800 text-white font-black text-xl flex items-center justify-center border-2 border-white shadow">
                {inspectedCard.cost}
              </div>
              <div className="my-auto flex flex-col items-center">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="w-12 h-12 text-[#93c5fd]/80" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polygon points="12,2 22,12 12,22 2,12" stroke="currentColor" strokeWidth="1.2" />
                    <polygon points="12,5 19,12 12,19 5,12" stroke="#60a5fa" strokeWidth="0.8" fill="rgba(59, 130, 246, 0.2)" />
                    <circle cx="12" cy="12" r="2.5" fill="#93c5fd" />
                    <circle cx="12" cy="12" r="1" fill="#ffffff" />
                    <line x1="12" y1="2" x2="12" y2="6" stroke="#93c5fd" strokeWidth="1.2" strokeLinecap="round" />
                    <line x1="12" y1="18" x2="12" y2="22" stroke="#93c5fd" strokeWidth="1.2" strokeLinecap="round" />
                    <line x1="2" y1="12" x2="6" y2="12" stroke="#93c5fd" strokeWidth="1.2" strokeLinecap="round" />
                    <line x1="18" y1="12" x2="22" y2="12" stroke="#93c5fd" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                </div>
                <h3 className="text-lg font-black text-[#fae6a2] mt-2 font-serif">{inspectedCard.name}</h3>
                <p
                  className="text-xs text-stone-300 mt-2 px-3 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: inspectedCard.text }}
                />
              </div>
            </div>
          )}

          {/* High-Resolution CloudFront Card Art */}
          {inspectedCard.imageUrl && (
            <img
              src={inspectedCard.imageUrl}
              alt={inspectedCard.name}
              onLoad={() => setImgStatus('loaded')}
              onError={() => setImgStatus('error')}
              className={`w-full h-full object-contain pointer-events-none drop-shadow-[0_28px_50px_rgba(0,0,0,0.92)] transition-opacity duration-200 ${
                imgStatus === 'loaded' ? 'opacity-100' : 'opacity-0 absolute inset-0'
              }`}
            />
          )}

          {/* Legendary Dragon Crown */}
          {inspectedCard.rarity === 'LEGENDARY' && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 pointer-events-none z-20 flex items-center justify-center">
              <div className="px-3 py-0.5 rounded-full bg-gradient-to-b from-[#fde68a] via-[#f59e0b] to-[#78350f] border-2 border-[#fef3c7] shadow-[0_4px_10px_rgba(0,0,0,0.85)] text-xs font-black text-[#451a03] flex items-center gap-1">
                <span>★</span>
                <span className="text-[10px] uppercase tracking-wider font-extrabold">Legendary</span>
                <span>★</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Card Details & Flavor Text Plaque */}
        <div className="mt-3 sm:mt-4 max-w-md w-full p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#2a170c] via-[#1d1007] to-[#120803] border-2 border-[#8e6129]/70 shadow-[0_20px_40px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.12)] text-center relative">
          
          {/* Top Header Row: Name & Close Button */}
          <div className="flex items-center justify-between pb-2 border-b border-[#5a3915]/80">
            <h3 className="text-base sm:text-lg font-black text-[#fae6a2] font-serif tracking-wide drop-shadow">
              {inspectedCard.name}
            </h3>
            
            <div className="flex items-center gap-2">
              <RarityBadge rarity={inspectedCard.rarity} />
              
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
          </div>

          {/* Full Stats Row */}
          <div className="mt-2.5 flex items-center justify-center flex-wrap gap-2 sm:gap-3 text-xs font-bold">
            {/* Mana Gem */}
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-gradient-to-b from-[#1b3a6b] to-[#0d1e38] border border-[#3b82f6]/70 shadow text-white">
              <span className="text-[10px] uppercase tracking-wider text-sky-200">Mana</span>
              <strong className="text-sm font-black text-sky-100">{inspectedCard.cost}</strong>
            </div>

            {/* Card Type */}
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#1d150f] border border-[#8e6328]/60 shadow text-[#f5e2b3]">
              <span className="text-[10px] uppercase tracking-wider text-[#a8824b]">Type</span>
              <strong className="text-xs font-serif uppercase tracking-wider">{inspectedCard.type}</strong>
            </div>

            {/* Attack / Health (if Minion) */}
            {inspectedCard.type === 'MINION' && (
              <>
                {inspectedCard.attack !== undefined && (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-b from-[#5c1c11] to-[#2d0905] border border-rose-500/60 shadow text-white">
                    <span className="text-[10px] uppercase tracking-wider text-rose-300">⚔</span>
                    <strong className="text-sm font-black text-rose-100">{inspectedCard.attack}</strong>
                  </div>
                )}
                {inspectedCard.health !== undefined && (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-b from-[#0f4d22] to-[#06240f] border border-emerald-500/60 shadow text-white">
                    <span className="text-[10px] uppercase tracking-wider text-emerald-300">♥</span>
                    <strong className="text-sm font-black text-emerald-100">{inspectedCard.health}</strong>
                  </div>
                )}
              </>
            )}

            {/* Weapon Stats */}
            {inspectedCard.type === 'WEAPON' && (
              <>
                {inspectedCard.attack !== undefined && (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-b from-[#5c1c11] to-[#2d0905] border border-rose-500/60 shadow text-white">
                    <span className="text-[10px] uppercase text-rose-300">⚔</span>
                    <strong className="text-sm font-black text-rose-100">{inspectedCard.attack}</strong>
                  </div>
                )}
                {inspectedCard.durability !== undefined && (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-b from-[#4d3d0f] to-[#241c06] border border-amber-500/60 shadow text-white">
                    <span className="text-[10px] uppercase text-amber-300">🛡</span>
                    <strong className="text-sm font-black text-amber-100">{inspectedCard.durability}</strong>
                  </div>
                )}
              </>
            )}

            {/* Minion Tribe / Race if present */}
            {inspectedCard.tribe && (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#241a12] border border-[#a8824b]/50 shadow text-[#fae6a2] text-[10px] font-bold uppercase tracking-wider">
                {inspectedCard.tribe}
              </div>
            )}
          </div>

          {/* Flavor Text Plaque */}
          {inspectedCard.flavorText && (
            <div className="mt-3 p-2.5 rounded-xl bg-[#140a04] border border-[#5a3915]/60 shadow-[inset_0_1px_4px_rgba(0,0,0,0.85)]">
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
