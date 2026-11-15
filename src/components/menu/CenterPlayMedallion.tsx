import { useState } from 'react';
import { motion } from 'motion/react';
import { PlayCrestIcon } from './MenuIcons';

interface CenterPlayMedallionProps {
  onPlayClick: () => void;
}

export function CenterPlayMedallion({ onPlayClick }: CenterPlayMedallionProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative flex items-center justify-center select-none">
      {/* Outer Recessed Walnut & Dark Bronze Socket: Fluid scaling */}
      <div className="relative w-[clamp(130px,36dvh,260px)] h-[clamp(130px,36dvh,260px)] rounded-full p-2 sm:p-3.5 bg-gradient-to-b from-[#2a1a0f] via-[#1a0f08] to-[#3a2414] shadow-[inset_0_8px_24px_rgba(0,0,0,0.95),0_6px_20px_rgba(0,0,0,0.7)] border-2 border-[#573919]/60 flex items-center justify-center">
        
        {/* Tier 1: Brushed Heavy Brass Bezel Ring */}
        <div className="w-full h-full rounded-full p-1.5 sm:p-2.5 bg-gradient-to-b from-[#f7e49e] via-[#c6973e] to-[#59390e] shadow-[0_6px_16px_rgba(0,0,0,0.75),inset_0_2px_3px_rgba(255,255,255,0.75)] flex items-center justify-center">
          
          {/* Tier 2: Recessed Dark Joinery Channel */}
          <div className="w-full h-full rounded-full p-1 bg-gradient-to-b from-[#180f08] to-[#301c0d] shadow-[inset_0_2px_5px_rgba(0,0,0,0.9)] flex items-center justify-center">
            
            {/* Main Interactive Enamel & Brass Dial */}
            <motion.button
              type="button"
              aria-label="Enter Play Arena"
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
              whileHover={{ scale: 1.025 }}
              whileTap={{ scale: 0.975, y: 2 }}
              transition={{ type: 'spring', stiffness: 450, damping: 28 }}
              onClick={onPlayClick}
              className="group relative w-full h-full rounded-full overflow-hidden cursor-pointer focus:outline-none shadow-[inset_0_3px_10px_rgba(255,255,255,0.3),inset_0_-8px_20px_rgba(0,0,0,0.8),0_10px_24px_rgba(0,0,0,0.65)] border border-[#e8c068]/60"
            >
              {/* Deep Royal-Indigo Concave Enamel Core */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,_#213c75_0%,_#14244a_48%,_#0c152d_82%,_#060a16_100%)] transition-transform duration-500 group-hover:scale-105" />

              {/* Inlaid Delicate Brass Runic Compass Circles */}
              <div className="absolute inset-2 sm:inset-3 rounded-full border border-dashed border-[#f5df96]/25 pointer-events-none" />
              <div className="absolute inset-4 sm:inset-6 rounded-full border border-[#f5df96]/20 pointer-events-none" />

              {/* Glass / Enamel Specular Highlight Arc */}
              <div className="absolute -top-1/2 -left-1/4 w-[150%] h-full rounded-full bg-gradient-to-b from-white/20 to-transparent rotate-[-12deg] pointer-events-none" />

              {/* Centerpiece Content */}
              <div className="relative z-10 flex flex-col items-center justify-center h-full px-2 sm:px-4 text-center">
                {/* Bespoke Crossed Blades & Rune Crest */}
                <motion.div
                  animate={{ y: isHovered ? -2 : 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="mb-0.5"
                >
                  <PlayCrestIcon className="w-[clamp(18px,5.2dvh,42px)] h-[clamp(18px,5.2dvh,42px)] drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]" />
                </motion.div>

                {/* Authoritative Warm Ivory Title */}
                <span className="text-[clamp(0.95rem,4.4dvh,2.25rem)] font-black tracking-widest uppercase text-[#f7eedc] text-letterpress-deep leading-none">
                  Play
                </span>

                {/* Refined, Quiet Subtitle (No AI Slop / No Neon Pill) */}
                <span className="mt-0.5 sm:mt-1 text-[clamp(5.5px,1.25dvh,9.5px)] font-extrabold tracking-[0.03em] md:tracking-[0.08em] uppercase text-[#cbbba0]/80 whitespace-nowrap text-center">
                  Casual &amp; Ranked
                </span>
              </div>
            </motion.button>
          </div>
        </div>

        {/* 4 Compass Brass Rivets on the Medallion Frame */}
        <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-gradient-to-b from-[#fffae0] via-[#c8983e] to-[#4e320c] border border-[#301c05] shadow-[0_1px_2px_rgba(0,0,0,0.9)] absolute top-1.5 sm:top-2 left-1/2 -translate-x-1/2" />
        <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-gradient-to-b from-[#fffae0] via-[#c8983e] to-[#4e320c] border border-[#301c05] shadow-[0_1px_2px_rgba(0,0,0,0.9)] absolute bottom-1.5 sm:bottom-2 left-1/2 -translate-x-1/2" />
        <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-gradient-to-b from-[#fffae0] via-[#c8983e] to-[#4e320c] border border-[#301c05] shadow-[0_1px_2px_rgba(0,0,0,0.9)] absolute left-1.5 sm:left-2 top-1/2 -translate-y-1/2" />
        <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-gradient-to-b from-[#fffae0] via-[#c8983e] to-[#4e320c] border border-[#301c05] shadow-[0_1px_2px_rgba(0,0,0,0.9)] absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2" />
      </div>
    </div>
  );
}
