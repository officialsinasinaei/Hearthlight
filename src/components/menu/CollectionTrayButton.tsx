import { motion } from 'motion/react';
import { CARD_POOL } from '../../engine/cards';
import { CollectionTomeIcon, FannedCardsIcon } from './MenuIcons';

interface CollectionTrayButtonProps {
  onCollectionClick: () => void;
}

export function CollectionTrayButton({ onCollectionClick }: CollectionTrayButtonProps) {
  return (
    <div className="relative z-10 -mt-2 flex flex-col items-center select-none">
      {/* Recessed Wooden Pedestal Drawer housing the button */}
      <div className="relative px-5 pt-3 pb-3.5 rounded-b-[24px] bg-gradient-to-b from-[#3a2212] via-[#24130a] to-[#150a04] border-x-4 border-b-4 border-[#8e632b] shadow-[0_16px_36px_rgba(0,0,0,0.9),inset_0_6px_12px_rgba(0,0,0,0.9)]">
        
        {/* Brass Side Drawer Brackets */}
        <div className="absolute -left-2.5 bottom-1.5 w-3.5 h-8 rounded-l bg-gradient-to-b from-[#fae6a2] via-[#b6852f] to-[#5a390e] border border-[#fffae0]/40 shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
        <div className="absolute -right-2.5 bottom-1.5 w-3.5 h-8 rounded-r bg-gradient-to-b from-[#fae6a2] via-[#b6852f] to-[#5a390e] border border-[#fffae0]/40 shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />

        {/* Expanded My Collection Drawer Button */}
        <motion.button
          type="button"
          whileHover={{ y: 2 }}
          whileTap={{ scale: 0.985, y: 3 }}
          transition={{ type: 'spring', stiffness: 450, damping: 28 }}
          onClick={onCollectionClick}
          className="group relative w-72 sm:w-88 h-16 rounded-xl p-1 bg-gradient-to-b from-[#f3d387] via-[#9e6d2b] to-[#52330b] shadow-[0_6px_16px_rgba(0,0,0,0.7)] cursor-pointer focus:outline-none"
        >
          {/* Inner Stone / Dark Leather Inlay Plate */}
          <div className="relative w-full h-full rounded-[9px] bg-gradient-to-b from-[#3d2f25] via-[#281f18] to-[#19130f] px-5 flex items-center justify-between overflow-hidden shadow-[inset_0_2px_3px_rgba(255,255,255,0.18),inset_0_-4px_8px_rgba(0,0,0,0.85)] border border-[#c89d46]/25 group-hover:from-[#49392e] group-hover:via-[#31271f] transition-colors">
            
            {/* Subtle Metallic Hover Shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#fae6a2]/8 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />

            {/* Left Icon: Bespoke Leather & Brass Tome */}
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-b from-[#3a2514] to-[#1c1007] p-0.5 shadow-md flex items-center justify-center border border-[#c89d46]/40">
                <div className="w-full h-full rounded-[6px] bg-[#140b05] flex items-center justify-center">
                  <CollectionTomeIcon className="w-6 h-6 drop-shadow" />
                </div>
              </div>

              <div className="text-left">
                <div className="text-lg sm:text-xl font-extrabold tracking-wide text-[#f7eedc] text-letterpress group-hover:text-white transition-colors">
                  My Collection
                </div>
                <div className="text-[11px] font-semibold text-[#cbbba0]/70 tracking-wider uppercase">
                  Decks &amp; Card Library
                </div>
              </div>
            </div>

            {/* Right Card Count Pill Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#120904]/80 border border-[#b8863b]/35 text-[#f5df96] text-xs font-black tabular-nums shadow-[inset_0_1px_3px_rgba(0,0,0,0.9)]">
              <FannedCardsIcon className="w-3.5 h-3.5" />
              <span>{CARD_POOL.length}</span>
            </div>
          </div>
        </motion.button>
      </div>
    </div>
  );
}
