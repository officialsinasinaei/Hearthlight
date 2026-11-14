import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useCollectionStore } from '../../store/useCollectionStore';

// ==========================================
// 1. BESPOKE CLASS CREST SVGS & WATERMARKS
// ==========================================

function WarriorCrest({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.7 3.3a1 1 0 00-1.4 0l-2.8 2.8-1.4-1.4-1.4 1.4 1.4 1.4-7.8 7.8-1.8-.6L3 16.2l3.8 3.8 1.5-1.5-.6-1.8 7.8-7.8 1.4 1.4 1.4-1.4-1.4-1.4 2.8-2.8a1 1 0 000-1.4z" />
      <path d="M4.3 3.3a1 1 0 011.4 0l2.8 2.8 1.4-1.4 1.4 1.4-1.4 1.4 7.8 7.8 1.8-.6L21 16.2l-3.8 3.8-1.5-1.5.6-1.8-7.8-7.8-1.4 1.4-1.4-1.4 1.4-1.4-2.8-2.8a1 1 0 010-1.4z" />
    </svg>
  );
}

function ShamanCrest({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11 21h-1l1-7H7.5c-.88 0-.33-.75-.31-.78C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.13-5.9 10.36z" />
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.2" fill="none" strokeDasharray="2.5 2.5" opacity="0.65" />
    </svg>
  );
}

function RogueCrest({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.7 4.3a1 1 0 00-1.4 0l-3.3 3.3 1.4 1.4 3.3-3.3a1 1 0 000-1.4zm-6.1 6.1l-1.4-1.4-7.5 7.5V19h2.5l6.4-6.4z" />
      <path d="M4.3 4.3a1 1 0 011.4 0l3.3 3.3-1.4 1.4-3.3-3.3a1 1 0 010-1.4zm6.1 6.1l1.4-1.4 7.5 7.5V19h-2.5l-6.4-6.4z" />
    </svg>
  );
}

function PaladinCrest({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L4 5.5v6c0 5.25 3.5 10.15 8 11.5 4.5-1.35 8-6.25 8-11.5v-6L12 2zm0 3.3l5.5 2.4v4.8c0 3.8-2.3 7.5-5.5 8.6-3.2-1.1-5.5-4.8-5.5-8.6v-4.8L12 5.3zm-1 3.7v3H8v2h3v5h2v-5h3v-2h-3V9h-2z" />
    </svg>
  );
}

function HunterCrest({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M2.05 13.05a9.99 9.99 0 0012.9 8.9l-1.45-1.45a8 8 0 01-9.9-9.9l-1.55-1.55v4zm17.9-2.1a9.99 9.99 0 00-12.9-8.9l1.45 1.45a8 8 0 019.9 9.9l1.55 1.55v-4zM21 3l-8.5 8.5 1.5 1.5L22.5 4.5 21 3z" />
    </svg>
  );
}

function DruidCrest({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66C7.5 17.5 9.5 13.5 17 11V8zm0-6C10 2 5 7 5 14c0 .8.1 1.6.3 2.3A12.02 12.02 0 0117 2z" />
      <path d="M7 8C16 10 18.1 16.17 20.18 21.34l-1.89.66C16.5 17.5 14.5 13.5 7 11V8zm0-6C14 2 19 7 19 14c0 .8-.1 1.6-.3 2.3A12.02 12.02 0 007 2z" opacity="0.6" />
    </svg>
  );
}

function WarlockCrest({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a9 9 0 00-9 9c0 3.6 2.1 6.7 5.2 8.1L7 21h10l-1.2-1.9c3.1-1.4 5.2-4.5 5.2-8.1a9 9 0 00-9-9zm-3 9a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm6 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm-3 5c-2 0-3-1-3-1h6s-1 1-3 1z" />
      <path d="M6 3c2 2 3 6 3 6s-4-2-4-4c0-1 .5-2 1-2zm12 0c-2 2-3 6-3 6s4-2 4-4c0-1-.5-2-1-2z" />
    </svg>
  );
}

function PriestCrest({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a4 4 0 00-4 4c0 1.9 1.3 3.5 3 3.9V13H8v2h3v7h2v-7h3v-2h-3V9.9c1.7-.4 3-2 3-3.9a4 4 0 00-4-4zm0 6a2 2 0 110-4 2 2 0 010 4z" />
      <path d="M4 12c1.5 1 3.5 1.5 5 1v-2c-1.5-.5-3-1.5-4-3v4zm16 0c-1.5 1-3.5 1.5-5 1v-2c1.5-.5 3-1.5 4-3v4z" opacity="0.6" />
    </svg>
  );
}

// Ornate Bespoke Mage Crest (Kirin Tor Arcane Eye & Starburst)
function BespokeMageCrest({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="mage-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff5d0" />
          <stop offset="35%" stopColor="#e5b450" />
          <stop offset="70%" stopColor="#966a1e" />
          <stop offset="100%" stopColor="#54370b" />
        </linearGradient>
        <radialGradient id="mage-iris-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="45%" stopColor="#7dd3fc" />
          <stop offset="85%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </radialGradient>
      </defs>
      {/* 8-Pointed Arcane Starburst Rays */}
      <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.85))">
        <polygon points="22,2 25.5,15 39,22 25.5,29 22,42 18.5,29 5,22 18.5,15" fill="url(#mage-gold-grad)" stroke="#3e2709" strokeWidth="0.8" />
        <polygon points="22,8 24.5,17 34,22 24.5,27 22,36 19.5,27 10,22 19.5,17" fill="#dca84c" opacity="0.85" />
      </g>
      {/* Outer Kirin Tor Arcane Eye Frame */}
      <path
        d="M9 22 C14 13 30 13 35 22 C30 31 14 31 9 22 Z"
        fill="#0b1429"
        stroke="url(#mage-gold-grad)"
        strokeWidth="1.5"
      />
      {/* Inner Arcane Eye Iris */}
      <ellipse cx="22" cy="22" rx="6.5" ry="6.5" fill="url(#mage-iris-grad)" stroke="#38bdf8" strokeWidth="0.8" />
      {/* Center Pupil Star */}
      <polygon points="22,17 23.5,20.5 27,22 23.5,23.5 22,27 20.5,23.5 17,22 20.5,20.5" fill="#ffffff" />
      {/* Specular Highlight */}
      <circle cx="20" cy="20" r="1.2" fill="#ffffff" />
    </svg>
  );
}

// Bespoke Wrought-Iron & Brass Lock Clasp
function WroughtIronBrassLock({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="iron-shackle-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#434954" />
          <stop offset="35%" stopColor="#7a8393" />
          <stop offset="70%" stopColor="#323742" />
          <stop offset="100%" stopColor="#1e2229" />
        </linearGradient>
        <linearGradient id="lock-brass-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fae6a2" />
          <stop offset="25%" stopColor="#dca84c" />
          <stop offset="70%" stopColor="#8d601b" />
          <stop offset="100%" stopColor="#4e330d" />
        </linearGradient>
        <linearGradient id="lock-plate-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2e2b27" />
          <stop offset="100%" stopColor="#171513" />
        </linearGradient>
      </defs>
      {/* Heavy Iron U-Shackle */}
      <path
        d="M10 16 V9 C10 5.686 12.686 3 16 3 C19.314 3 22 5.686 22 9 V16"
        stroke="url(#iron-shackle-grad)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Heavy Beveled Brass Lock Body */}
      <rect
        x="5"
        y="14"
        width="22"
        height="18"
        rx="3"
        fill="url(#lock-brass-grad)"
        stroke="#2d1c07"
        strokeWidth="1.2"
      />
      {/* Inlaid Dark Iron Core Plate */}
      <rect
        x="7.5"
        y="16.5"
        width="17"
        height="13"
        rx="2"
        fill="url(#lock-plate-grad)"
        stroke="#5a3f1a"
        strokeWidth="0.8"
      />
      {/* 4 Corner Brass Rivets */}
      <circle cx="9.5" cy="18.5" r="0.9" fill="#fae6a2" stroke="#362208" strokeWidth="0.4" />
      <circle cx="22.5" cy="18.5" r="0.9" fill="#fae6a2" stroke="#362208" strokeWidth="0.4" />
      <circle cx="9.5" cy="27.5" r="0.9" fill="#fae6a2" stroke="#362208" strokeWidth="0.4" />
      <circle cx="22.5" cy="27.5" r="0.9" fill="#fae6a2" stroke="#362208" strokeWidth="0.4" />
      {/* Keyhole */}
      <circle cx="16" cy="21.5" r="1.8" fill="#080604" />
      <polygon points="15,22 17,22 16.6,26.5 15.4,26.5" fill="#080604" />
    </svg>
  );
}

// ==========================================
// 2. HERO CLASSES DATA MODEL
// ==========================================

interface HeroClassInfo {
  id: string;
  name: string;
  isPlayable: boolean;
  renderWatermark: (className: string) => React.ReactNode;
}

const HERO_CLASSES: HeroClassInfo[] = [
  {
    id: 'warrior',
    name: 'Warrior',
    isPlayable: false,
    renderWatermark: (cls) => <WarriorCrest className={cls} />,
  },
  {
    id: 'shaman',
    name: 'Shaman',
    isPlayable: false,
    renderWatermark: (cls) => <ShamanCrest className={cls} />,
  },
  {
    id: 'rogue',
    name: 'Rogue',
    isPlayable: false,
    renderWatermark: (cls) => <RogueCrest className={cls} />,
  },
  {
    id: 'paladin',
    name: 'Paladin',
    isPlayable: false,
    renderWatermark: (cls) => <PaladinCrest className={cls} />,
  },
  {
    id: 'hunter',
    name: 'Hunter',
    isPlayable: false,
    renderWatermark: (cls) => <HunterCrest className={cls} />,
  },
  {
    id: 'druid',
    name: 'Druid',
    isPlayable: false,
    renderWatermark: (cls) => <DruidCrest className={cls} />,
  },
  {
    id: 'warlock',
    name: 'Warlock',
    isPlayable: false,
    renderWatermark: (cls) => <WarlockCrest className={cls} />,
  },
  {
    id: 'mage',
    name: 'Mage',
    isPlayable: true,
    renderWatermark: (cls) => <BespokeMageCrest className={cls} />,
  },
  {
    id: 'priest',
    name: 'Priest',
    isPlayable: false,
    renderWatermark: (cls) => <PriestCrest className={cls} />,
  },
];

// ==========================================
// 3. MAIN HERO SELECT VIEW COMPONENT
// ==========================================

// Official asset endpoints (supports pure illustration art with official render fallbacks)
const JAINA_ART_URL = 'https://art.hearthstonejson.com/v1/512x/HERO_08.jpg';
const JAINA_RENDER_FALLBACK = 'https://art.hearthstonejson.com/v1/render/latest/enUS/512x/HERO_08.png';

const FIREBLAST_ART_URL = 'https://art.hearthstonejson.com/v1/512x/CS2_034.jpg';
const FIREBLAST_RENDER_FALLBACK = 'https://art.hearthstonejson.com/v1/render/latest/enUS/512x/CS2_034.png';

export function HeroSelectView() {
  const setHeroSelectOpen = useCollectionStore((s) => s.setHeroSelectOpen);
  const createMageDeck = useCollectionStore((s) => s.createMageDeck);
  const showToast = useCollectionStore((s) => s.showToast);

  const [shakeClass, setShakeClass] = useState<string | null>(null);
  const [jainaLoaded, setJainaLoaded] = useState(false);
  const [fireblastLoaded, setFireblastLoaded] = useState(false);

  function handleHeroClick(hero: HeroClassInfo) {
    if (!hero.isPlayable) {
      setShakeClass(hero.id);
      showToast('Only Mage is playable in the current version');
      setTimeout(() => setShakeClass(null), 400);
    }
  }

  function handleChooseJaina() {
    createMageDeck();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      {/* Outer Carved Wood Chamber */}
      <div className="relative w-full max-w-5xl h-[88vh] max-h-[700px] rounded-3xl bg-gradient-to-b from-[#3a2213] via-[#24130a] to-[#140b05] border-4 border-[#8e6129] shadow-[0_25px_80px_rgba(0,0,0,0.95)] flex overflow-hidden">
        
        {/* ========================================================= */}
        {/* LEFT SECTION: 3x3 CHOOSE YOUR HERO GRID                   */}
        {/* ========================================================= */}
        <div className="flex-1 flex flex-col justify-between p-6 sm:p-8 border-r-4 border-[#8e6129]/60">
          
          {/* Top Plaque Header: "Choose Your Hero" */}
          <div className="flex items-center justify-center">
            <div className="px-10 py-2.5 rounded-xl bg-gradient-to-b from-[#2b180d] via-[#1c0e07] to-[#120803] border-2 border-[#a2845c] shadow-[0_6px_16px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.2)]">
              <h2 className="text-xl sm:text-2xl font-black text-[#fae6a2] tracking-wider uppercase font-serif text-letterpress">
                Choose Your Hero
              </h2>
            </div>
          </div>

          {/* 3x3 Grid of Hero Cards */}
          <div className="grid grid-cols-3 gap-3.5 sm:gap-5 my-auto max-w-lg mx-auto w-full">
            {HERO_CLASSES.map((hero) => {
              const isSelectedMage = hero.id === 'mage';
              const isShaking = shakeClass === hero.id;

              if (isSelectedMage) {
                // Active Mage Tile: Beveled brushed gold & royal indigo border, bespoke Kirin Tor crest, no cyan glow
                return (
                  <motion.div
                    key={hero.id}
                    whileHover={{ scale: 1.04 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="relative h-28 sm:h-32 rounded-2xl p-[2.5px] cursor-pointer transition-all duration-200 bg-gradient-to-b from-[#fce399] via-[#c8983e] to-[#59390e] shadow-[0_8px_24px_rgba(0,0,0,0.85),inset_0_1px_2px_rgba(255,255,255,0.7)] scale-[1.03]"
                  >
                    {/* Inlaid Joinery Channel */}
                    <div className="w-full h-full rounded-[13px] p-[1.5px] bg-[#140b05]">
                      {/* Royal Indigo Enamel Card Face with Inlaid Brass Frame */}
                      <div className="relative w-full h-full rounded-[11px] overflow-hidden flex flex-col items-center justify-between p-2 bg-[radial-gradient(ellipse_at_center,_#1d3566_0%,_#122346_60%,_#0b152d_100%)] border border-[#fae6a2]/40 shadow-[inset_0_1px_3px_rgba(255,255,255,0.3),inset_0_-4px_10px_rgba(0,0,0,0.8)]">
                        {/* Specular Inner Highlight Arc */}
                        <div className="absolute -top-8 -left-8 w-24 h-24 rounded-full bg-white/10 blur-sm pointer-events-none" />

                        {/* Bespoke Mage Class Crest */}
                        <div className="my-auto relative z-10">
                          <BespokeMageCrest className="w-11 h-11 sm:w-12 sm:h-12 drop-shadow-[0_4px_8px_rgba(0,0,0,0.85)]" />
                        </div>

                        {/* Inlaid Brushed Gold Class Banner */}
                        <div className="w-full py-0.5 rounded text-center text-xs font-black tracking-wider uppercase bg-gradient-to-b from-[#fce399] via-[#dca84c] to-[#7a4e13] text-[#1b0f04] shadow-[0_2px_4px_rgba(0,0,0,0.8)] border border-[#fffae0]/70 text-letterpress relative z-10">
                          {hero.name}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              }

              // Locked Hero Cards (8 classes): Engraved watermark, bespoke wrought-iron & brass lock clasp, single clean title, quiet Coming Soon badge
              return (
                <motion.div
                  key={hero.id}
                  data-testid={`hero-tile-${hero.id}`}
                  animate={isShaking ? { x: [-5, 5, -3, 3, 0] } : {}}
                  transition={{ duration: 0.35 }}
                  onClick={() => handleHeroClick(hero)}
                  className="relative h-28 sm:h-32 rounded-2xl p-[2px] cursor-pointer transition-all duration-200 bg-gradient-to-b from-[#3a281c] via-[#24170f] to-[#120a06] border border-[#503724] hover:border-[#7a5436] opacity-85 hover:opacity-100 shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
                >
                  <div className="relative w-full h-full rounded-xl overflow-hidden flex flex-col items-center justify-between p-2 bg-gradient-to-b from-[#221710] via-[#160d09] to-[#0d0705] border border-[#3d291b]">
                    {/* Subtle Engraved Class-Crest Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-45 overflow-hidden text-[#c89d46]">
                      {hero.renderWatermark('w-20 h-20 text-[#c89d46] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]')}
                    </div>

                    {/* Bespoke Wrought-Iron & Brass Lock Clasp + Quiet Coming Soon Badge */}
                    <div className="relative z-10 flex flex-col items-center justify-center my-auto gap-1">
                      <WroughtIronBrassLock className="w-7 h-7 sm:w-8 sm:h-8 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]" />
                      <span className="px-2 py-0.5 rounded bg-[#130b06]/95 border border-[#523b26] text-[9px] font-extrabold text-[#c89d46] uppercase tracking-wider shadow">
                        Coming Soon
                      </span>
                    </div>

                    {/* Single Clean Class Title (No Duplicated Ghosted Names) */}
                    <div className="w-full py-0.5 rounded text-center text-xs font-black tracking-wider uppercase bg-[#140b07] text-[#9f8b78] border border-[#3d291b] shadow-inner relative z-10">
                      {hero.name}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Bottom Balance Spacer */}
          <div className="h-2" />
        </div>

        {/* ========================================================= */}
        {/* RIGHT SECTION: JAINA SHOWCASE & CHOOSE MEDALLION          */}
        {/* ========================================================= */}
        <div className="w-80 sm:w-96 bg-[radial-gradient(ellipse_at_center,_#3e1814_0%,_#260d09_55%,_#130504_100%)] p-6 sm:p-7 flex flex-col items-center justify-center gap-4 sm:gap-5 relative overflow-hidden">
          
          {/* Subtle Warm Drape Vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,_rgba(244,63,94,0.12),_transparent_75%)] pointer-events-none" />

          {/* Top Section: Hero Pedestal (Portrait + Cleanly Docked Companion Hero Power Medallion) */}
          <div className="relative w-full flex flex-col items-center mt-1">
            
            {/* Side-by-Side Portrait & Docked Companion Medallion (Never Overlapping!) */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 w-full">
              
              {/* 1. Dedicated Ornate Gilded Arch Medallion for Jaina Portrait */}
              <div className="relative">
                {/* Arch Keystone Apex */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center">
                  <div className="w-4 h-4 rotate-45 bg-gradient-to-b from-[#fce399] via-[#c8983e] to-[#59390e] border border-[#2d1c06] shadow flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#4785ff] shadow-inner" />
                  </div>
                </div>

                {/* Outer Sculpted Heavy Brass Arch Frame */}
                <div className="relative w-36 h-48 sm:w-40 sm:h-52 rounded-t-full rounded-b-2xl p-[3px] bg-gradient-to-b from-[#fce399] via-[#c8983e] to-[#4e320c] shadow-[0_12px_30px_rgba(0,0,0,0.9),inset_0_2px_4px_rgba(255,255,255,0.7)] border border-[#fae6a2]/50">
                  
                  {/* Inlaid Dark Channel */}
                  <div className="w-full h-full rounded-t-full rounded-b-[14px] p-[2px] bg-gradient-to-b from-[#180e07] to-[#2c170a]">
                    
                    {/* Vault Face */}
                    <div className="relative w-full h-full rounded-t-full rounded-b-xl overflow-hidden bg-[#0d162d] border border-[#fae6a2]/30 flex items-center justify-center shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]">
                      {/* Jaina Official Portrait Artwork (Cleanly Cropped, Zero Stray Card Gems or Frame Artifacts) */}
                      <img
                        src={JAINA_ART_URL}
                        alt="Jaina Proudmoore"
                        onLoad={() => setJainaLoaded(true)}
                        onError={(e) => {
                          if (e.currentTarget.src !== JAINA_RENDER_FALLBACK) {
                            e.currentTarget.src = JAINA_RENDER_FALLBACK;
                            e.currentTarget.className = 'w-full h-full object-cover scale-[2.1] object-[50%_25%] transition-opacity duration-200 opacity-100';
                          } else {
                            e.currentTarget.style.display = 'none';
                            setJainaLoaded(false);
                          }
                        }}
                        className={`w-full h-full object-cover object-[50%_18%] scale-105 transition-opacity duration-200 ${
                          jainaLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                      />

                      {/* Silhouette Fallback */}
                      {!jainaLoaded && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-gradient-to-b from-[#101b38] to-[#070c1a]">
                          <BespokeMageCrest className="w-14 h-14 drop-shadow" />
                          <span className="text-xs font-bold text-sky-200 mt-2">Jaina Proudmoore</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Base Corner Rivets */}
                  <span className="absolute bottom-1 left-2 w-1.5 h-1.5 rounded-full bg-gradient-to-b from-[#fffae0] to-[#59390e] border border-[#2b1807]" />
                  <span className="absolute bottom-1 right-2 w-1.5 h-1.5 rounded-full bg-gradient-to-b from-[#fffae0] to-[#59390e] border border-[#2b1807]" />
                </div>
              </div>

              {/* 2. Docked Hero Power Companion Medallion ('Fireblast — 2') */}
              <div
                title="Fireblast: 2 Mana Hero Power — Deal 1 damage."
                className="flex flex-col items-center group cursor-help select-none"
              >
                {/* Companion Dial Socket */}
                <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full p-[2.5px] bg-gradient-to-b from-[#2a170d] to-[#120803] shadow-[0_8px_20px_rgba(0,0,0,0.85)] border border-[#523315] flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                  
                  {/* Sculpted Heavy Brass Bezel */}
                  <div className="w-full h-full rounded-full p-1 bg-gradient-to-b from-[#fce399] via-[#c8983e] to-[#4e320c] shadow-[inset_0_1px_2px_rgba(255,255,255,0.7)] flex items-center justify-center relative">
                    
                    {/* Dark Dial Face */}
                    <div className="w-full h-full rounded-full overflow-hidden bg-[#180a04] border border-[#ff8c00]/60 relative flex items-center justify-center shadow-inner">
                      {/* Official Fireblast Artwork */}
                      <img
                        src={FIREBLAST_ART_URL}
                        alt="Fireblast"
                        onLoad={() => setFireblastLoaded(true)}
                        onError={(e) => {
                          if (e.currentTarget.src !== FIREBLAST_RENDER_FALLBACK) {
                            e.currentTarget.src = FIREBLAST_RENDER_FALLBACK;
                            e.currentTarget.className = 'w-full h-full object-cover scale-[2.2] object-[50%_28%] transition-opacity duration-200 opacity-100';
                          } else {
                            e.currentTarget.style.display = 'none';
                            setFireblastLoaded(false);
                          }
                        }}
                        className={`w-full h-full object-cover scale-[1.35] object-center transition-opacity duration-200 ${
                          fireblastLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                      />

                      {/* Arcane Flame SVG fallback */}
                      {!fireblastLoaded && (
                        <svg className="w-7 h-7 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C8 6 6 9 6 13a6 6 0 0012 0c0-4-2-7-6-11zm0 15a3 3 0 01-3-3c0-1.5 1-3 3-5 2 2 3 3.5 3 5a3 3 0 01-3 3z" />
                        </svg>
                      )}
                    </div>

                    {/* Sculpted 2-Mana Blue Crystal Gem docked at top center */}
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-b from-[#38bdf8] via-[#1d4ed8] to-[#0c1a38] border-2 border-[#e0f2fe] text-white font-black text-[10px] sm:text-xs flex items-center justify-center shadow-[0_2px_6px_rgba(0,0,0,0.9)] z-20">
                      2
                    </div>
                  </div>
                </div>

                {/* Hero Power Plaque underneath companion dial */}
                <div className="mt-1.5 px-2.5 py-0.5 rounded bg-gradient-to-b from-[#25150c] to-[#100703] border border-[#8e6129]/60 shadow text-center">
                  <div className="text-[10px] sm:text-[11px] font-black text-[#fae6a2] uppercase tracking-wider text-letterpress">
                    Fireblast
                  </div>
                  <div className="text-[8px] sm:text-[9px] font-extrabold text-[#c89d46] uppercase">
                    2 Mana
                  </div>
                </div>
              </div>
            </div>

            {/* Beveled 'Jaina Proudmoore — Mage Hero' Nameplate */}
            <div className="mt-3.5 w-full max-w-[270px] rounded-lg p-[1.5px] bg-gradient-to-b from-[#fce399] via-[#c8983e] to-[#4e320c] shadow-[0_4px_12px_rgba(0,0,0,0.7)]">
              <div className="w-full rounded-[6px] py-1.5 px-4 bg-gradient-to-b from-[#27150a] via-[#170c05] to-[#201107] border border-[#e5b450]/30 flex flex-col items-center justify-center text-center relative overflow-hidden">
                {/* Specular sheen line */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#fae6a2]/60 to-transparent" />
                
                <h3 className="text-sm sm:text-base font-black text-[#fae6a2] tracking-wider uppercase font-serif text-letterpress">
                  Jaina Proudmoore
                </h3>
                <span className="text-[10px] font-extrabold text-[#cbbba0] tracking-[0.2em] uppercase">
                  Mage Hero
                </span>

                {/* Tiny brass corner rivets */}
                <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-gradient-to-b from-[#fae6a2] to-[#6a4212] border border-[#2d1b06]" />
                <span className="absolute right-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-gradient-to-b from-[#fae6a2] to-[#6a4212] border border-[#2d1b06]" />
              </div>
            </div>
          </div>

          {/* Bottom Action Section: Tactile Choose Medallion Button & Quiet Back Button */}
          <div className="w-full flex flex-col items-center gap-3">
            {/* Tactile Choose Medallion Button matching Main Menu Play Medallion styling */}
            <div className="relative flex items-center justify-center select-none">
              {/* Outer Recessed Socket */}
              <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full p-2.5 bg-gradient-to-b from-[#2a1a0f] via-[#1a0f08] to-[#3a2414] shadow-[inset_0_8px_20px_rgba(0,0,0,0.95),0_6px_20px_rgba(0,0,0,0.7)] border-2 border-[#573919]/60 flex items-center justify-center">
                
                {/* Tier 1: Brushed Heavy Brass Bezel Ring */}
                <div className="w-full h-full rounded-full p-2 bg-gradient-to-b from-[#f7e49e] via-[#c6973e] to-[#59390e] shadow-[0_6px_16px_rgba(0,0,0,0.75),inset_0_2px_3px_rgba(255,255,255,0.75)] flex items-center justify-center">
                  
                  {/* Tier 2: Recessed Dark Joinery Channel */}
                  <div className="w-full h-full rounded-full p-1 bg-gradient-to-b from-[#180f08] to-[#301c0d] shadow-[inset_0_2px_5px_rgba(0,0,0,0.9)] flex items-center justify-center">
                    
                    {/* Main Interactive Enamel & Brass Dial */}
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97, y: 2 }}
                      transition={{ type: 'spring', stiffness: 450, damping: 28 }}
                      onClick={handleChooseJaina}
                      className="group relative w-full h-full rounded-full overflow-hidden cursor-pointer focus:outline-none shadow-[inset_0_3px_10px_rgba(255,255,255,0.3),inset_0_-8px_20px_rgba(0,0,0,0.8),0_10px_24px_rgba(0,0,0,0.65)] border border-[#e8c068]/60"
                    >
                      {/* Deep Royal-Indigo Concave Enamel Core */}
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,_#213c75_0%,_#14244a_48%,_#0c152d_82%,_#060a16_100%)] transition-transform duration-500 group-hover:scale-105" />

                      {/* Inlaid Delicate Brass Runic Compass Circles */}
                      <div className="absolute inset-2 sm:inset-2.5 rounded-full border border-dashed border-[#f5df96]/25 pointer-events-none" />
                      <div className="absolute inset-4 sm:inset-5 rounded-full border border-[#f5df96]/20 pointer-events-none" />

                      {/* Glass / Enamel Specular Highlight Arc */}
                      <div className="absolute -top-1/2 -left-1/4 w-[150%] h-full rounded-full bg-gradient-to-b from-white/20 to-transparent rotate-[-12deg] pointer-events-none" />

                      {/* Centerpiece Content */}
                      <div className="relative z-10 flex flex-col items-center justify-center h-full px-2 text-center">
                        <span className="text-base sm:text-lg font-black tracking-wide uppercase text-[#f7eedc] text-letterpress-deep font-serif leading-tight">
                          Choose
                        </span>
                        <span className="mt-0.5 text-[9px] sm:text-[10px] font-extrabold tracking-[0.18em] uppercase text-[#cbbba0]/85">
                          Start Deck
                        </span>
                      </div>
                    </motion.button>
                  </div>
                </div>

                {/* 4 Compass Brass Rivets on the Medallion Frame */}
                <span className="w-2 h-2 rounded-full bg-gradient-to-b from-[#fffae0] via-[#c8983e] to-[#4e320c] border border-[#301c05] shadow absolute top-1 left-1/2 -translate-x-1/2" />
                <span className="w-2 h-2 rounded-full bg-gradient-to-b from-[#fffae0] via-[#c8983e] to-[#4e320c] border border-[#301c05] shadow absolute bottom-1 left-1/2 -translate-x-1/2" />
                <span className="w-2 h-2 rounded-full bg-gradient-to-b from-[#fffae0] via-[#c8983e] to-[#4e320c] border border-[#301c05] shadow absolute left-1 top-1/2 -translate-y-1/2" />
                <span className="w-2 h-2 rounded-full bg-gradient-to-b from-[#fffae0] via-[#c8983e] to-[#4e320c] border border-[#301c05] shadow absolute right-1 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Quiet Back Button */}
            <button
              type="button"
              onClick={() => setHeroSelectOpen(false)}
              className="px-8 py-1.5 rounded-xl bg-gradient-to-b from-[#2b180d] to-[#120803] border border-[#8e6129]/60 text-[#f5e2b3] font-bold text-xs uppercase tracking-widest hover:text-white hover:border-[#fae6a2] transition-colors cursor-pointer shadow active:translate-y-0.5"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
