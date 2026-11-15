import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useCollectionStore } from '../../store/useCollectionStore';
import { CardImage, TavernButton, TavernPlaque } from '../ui';

export function CardInspectModal() {
  const inspectedCard = useCollectionStore((s) => s.inspectedCard);
  const setInspectedCard = useCollectionStore((s) => s.setInspectedCard);
  const editingDeckId = useCollectionStore((s) => s.editingDeckId);
  const decks = useCollectionStore((s) => s.decks);
  const addCardToDeck = useCollectionStore((s) => s.addCardToDeck);
  const removeCardFromDeck = useCollectionStore((s) => s.removeCardFromDeck);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { stiffness: 220, damping: 20 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [16, -16]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-16, 16]), springConfig);

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
        <motion.div
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
          className="relative h-[clamp(210px,76dvh,380px)] aspect-[5/7] shrink-0 flex items-center justify-center group"
        >
          <motion.div
            style={{
              background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.06) 40%, transparent 70%)`,
            }}
            className="absolute inset-0 rounded-3xl pointer-events-none z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          />

          <CardImage card={inspectedCard} size="inspect" />
        </motion.div>

        <div className="w-full max-w-[320px] sm:max-w-sm p-3.5 sm:p-4 rounded-2xl bg-gradient-to-b from-[#2a170c] via-[#1d1007] to-[#120803] border-2 border-[#8e6129]/70 shadow-[0_20px_40px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.12)] text-center relative shrink min-w-0">
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

            <TavernButton
              variant="icon"
              onClick={() => setInspectedCard(null)}
              aria-label="Close Inspector"
              className="ml-1"
            >
              ✕
            </TavernButton>
          </div>

          {inspectedCard.flavorText && (
            <div
              data-testid="flavor-text"
              className="mt-3 p-3 rounded-xl bg-[#140a04] border border-[#5a3915]/60 shadow-[inset_0_1px_4px_rgba(0,0,0,0.85)]"
            >
              <p className="text-xs italic text-[#e6ded4] font-serif leading-relaxed px-2 drop-shadow-xs">
                &ldquo;{inspectedCard.flavorText}&rdquo;
              </p>
            </div>
          )}

          {editingDeckId && (
            <div className="mt-3.5 pt-3 border-t border-[#5a3915]/80 flex items-center justify-between gap-3">
              <TavernPlaque
                label="In Deck:"
                value={`${countInDeck} / ${maxCopies}`}
                size="md"
                className="px-3 py-1 rounded-[6px]"
              />

              <div className="flex items-center gap-2">
                <TavernButton
                  variant="danger"
                  size="sm"
                  disabled={countInDeck <= 0}
                  onClick={() => removeCardFromDeck(inspectedCard.id)}
                >
                  - Remove
                </TavernButton>

                <TavernButton
                  variant="primary"
                  size="sm"
                  disabled={isCapped || (isFull && countInDeck === 0)}
                  onClick={() => addCardToDeck(inspectedCard.id)}
                >
                  + Add to Deck
                </TavernButton>
              </div>
            </div>
          )}

          <div className="mt-3 text-[11px] font-medium text-stone-400">
            Click anywhere or press ✕ to close
          </div>
        </div>
      </div>
    </div>
  );
}
