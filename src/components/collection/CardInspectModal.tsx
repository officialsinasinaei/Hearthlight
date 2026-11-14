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
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [14, -14]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-14, 14]), springConfig);

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
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-lg w-full flex flex-col items-center cursor-default"
      >
        {/* 3D Tilted Card Container */}
        <motion.div
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
          className="relative w-72 sm:w-80 h-[430px] sm:h-[470px] flex items-center justify-center"
        >
          {/* Fallback Canvas - ONLY rendered if image is NOT loaded */}
          {imgStatus !== 'loaded' && (
            <div className="absolute inset-0 rounded-3xl p-4 flex flex-col justify-between bg-gradient-to-b from-[#2a170b] to-[#120803] border-4 border-[#8e6129] shadow-[0_30px_70px_rgba(0,0,0,0.95)] text-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-b from-sky-400 to-blue-800 text-white font-black text-lg flex items-center justify-center border-2 border-white shadow">
                {inspectedCard.cost}
              </div>
              <div className="my-auto flex flex-col items-center">
                <svg className="w-12 h-12 text-amber-300/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                </svg>
                <h3 className="text-base font-black text-[#fae6a2] mt-2 font-serif">{inspectedCard.name}</h3>
                <p
                  className="text-xs text-stone-300 mt-2 px-2"
                  dangerouslySetInnerHTML={{ __html: inspectedCard.text }}
                />
              </div>
            </div>
          )}

          {/* High-Resolution CloudFront Card Art - cleanly isolated with drop shadow and NO underlying bleed-through */}
          {inspectedCard.imageUrl && (
            <img
              src={inspectedCard.imageUrl}
              alt={inspectedCard.name}
              onLoad={() => setImgStatus('loaded')}
              onError={() => setImgStatus('error')}
              className={`w-full h-full object-contain pointer-events-none drop-shadow-[0_25px_45px_rgba(0,0,0,0.85)] transition-opacity duration-200 ${
                imgStatus === 'loaded' ? 'opacity-100' : 'opacity-0 absolute inset-0'
              }`}
            />
          )}
        </motion.div>

        {/* Card Details & Flavor Text Plaque */}
        <div className="mt-4 max-w-md w-full p-4 rounded-2xl bg-gradient-to-b from-[#2a170c] to-[#140b05] border-2 border-[#8e6129]/60 shadow-xl text-center">
          <div className="flex items-center justify-between text-xs font-bold text-[#c89d46] pb-2 border-b border-[#5a3915]">
            <span className="uppercase">{inspectedCard.type}</span>
            <span className="uppercase font-black text-[#fae6a2]">{inspectedCard.rarity}</span>
            <span>Mana: {inspectedCard.cost}</span>
          </div>

          {inspectedCard.flavorText && (
            <p className="text-xs italic text-stone-300 mt-2.5 px-2">
              &ldquo;{inspectedCard.flavorText}&rdquo;
            </p>
          )}

          {/* Deck Building Actions (if Deck Editor is open) */}
          {editingDeckId && (
            <div className="mt-3 pt-3 border-t border-[#5a3915] flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-[#fae6a2]">
                In Deck: <strong className="text-white">{countInDeck} / {maxCopies}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={countInDeck <= 0}
                  onClick={() => removeCardFromDeck(inspectedCard.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    countInDeck > 0
                      ? 'bg-rose-950/80 border border-rose-500/50 text-rose-200 hover:bg-rose-900 cursor-pointer'
                      : 'bg-stone-800 text-stone-600 border border-stone-700 cursor-not-allowed'
                  }`}
                >
                  - Remove
                </button>

                <button
                  type="button"
                  disabled={isCapped || (isFull && countInDeck === 0)}
                  onClick={() => addCardToDeck(inspectedCard.id)}
                  className={`px-4 py-1 rounded-lg text-xs font-black uppercase tracking-wider shadow transition-all ${
                    !isCapped && (!isFull || countInDeck > 0)
                      ? 'bg-gradient-to-b from-[#f3d387] to-[#8e6129] text-stone-950 hover:brightness-110 cursor-pointer'
                      : 'bg-stone-800 text-stone-600 border border-stone-700 cursor-not-allowed'
                  }`}
                >
                  + Add to Deck
                </button>
              </div>
            </div>
          )}

          {/* Close hint */}
          <button
            type="button"
            onClick={() => setInspectedCard(null)}
            className="mt-3 text-xs font-bold text-stone-400 hover:text-white cursor-pointer"
          >
            Click anywhere to close
          </button>
        </div>
      </div>
    </div>
  );
}
