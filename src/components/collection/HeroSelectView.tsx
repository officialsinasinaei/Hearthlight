import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useCollectionStore } from '../../store/useCollectionStore';

interface HeroClassInfo {
  id: string;
  name: string;
  isPlayable: boolean;
  renderIcon: (className: string) => React.ReactNode;
}

const HERO_CLASSES: HeroClassInfo[] = [
  {
    id: 'warrior',
    name: 'Warrior',
    isPlayable: false,
    renderIcon: (cls) => (
      <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
        <path d="M6.92 5L5 6.92l5.79 5.79-1.41 1.41 1.41 1.41 1.41-1.41L18 20l1.92-1.92L6.92 5zM19.92 5.08L18 3.16l-5.79 5.79 1.41 1.41-1.41 1.41-1.41-1.41L5 16.08l1.92 1.92L19.92 5.08z" />
      </svg>
    ),
  },
  {
    id: 'shaman',
    name: 'Shaman',
    isPlayable: false,
    renderIcon: (cls) => (
      <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
        <path d="M11 21h-1l1-7H7.5c-.88 0-.33-.75-.31-.78C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.13-5.9 10.36z" />
      </svg>
    ),
  },
  {
    id: 'rogue',
    name: 'Rogue',
    isPlayable: false,
    renderIcon: (cls) => (
      <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.7 4.3a1 1 0 00-1.4 0l-3.3 3.3 1.4 1.4 3.3-3.3a1 1 0 000-1.4zm-6.1 6.1l-1.4-1.4-7.5 7.5V19h2.5l6.4-6.4z" />
      </svg>
    ),
  },
  {
    id: 'paladin',
    name: 'Paladin',
    isPlayable: false,
    renderIcon: (cls) => (
      <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm0 18c-3.75-1-6-4.9-6-8.91V6.3l6-2.25 6 2.25v4.79c0 4.01-2.25 7.91-6 8.91z" />
      </svg>
    ),
  },
  {
    id: 'hunter',
    name: 'Hunter',
    isPlayable: false,
    renderIcon: (cls) => (
      <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
        <path d="M2.05 13.05a9.99 9.99 0 0012.9 8.9l-1.45-1.45a8 8 0 01-9.9-9.9l-1.55-1.55v4zm17.9-2.1a9.99 9.99 0 00-12.9-8.9l1.45 1.45a8 8 0 019.9 9.9l1.55 1.55v-4zM21 3l-8.5 8.5 1.5 1.5L22.5 4.5 21 3z" />
      </svg>
    ),
  },
  {
    id: 'druid',
    name: 'Druid',
    isPlayable: false,
    renderIcon: (cls) => (
      <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
        <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66C7.5 17.5 9.5 13.5 17 11V8zm0-6C10 2 5 7 5 14c0 .8.1 1.6.3 2.3A12.02 12.02 0 0117 2z" />
      </svg>
    ),
  },
  {
    id: 'warlock',
    name: 'Warlock',
    isPlayable: false,
    renderIcon: (cls) => (
      <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2a9 9 0 00-9 9c0 3.6 2.1 6.7 5.2 8.1L7 21h10l-1.2-1.9c3.1-1.4 5.2-4.5 5.2-8.1a9 9 0 00-9-9zm-3 9a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm6 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm-3 5c-2 0-3-1-3-1h6s-1 1-3 1z" />
      </svg>
    ),
  },
  {
    id: 'mage',
    name: 'Mage',
    isPlayable: true,
    renderIcon: (cls) => (
      <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l2.4 4.8 5.3.8-3.8 3.7.9 5.3-4.8-2.5-4.8 2.5.9-5.3-3.8-3.7 5.3-.8L12 2zm0 4.2L10.7 8.9l-3 .4 2.2 2.1-.5 3 2.6-1.4 2.6 1.4-.5-3 2.2-2.1-3-.4L12 6.2z" />
      </svg>
    ),
  },
  {
    id: 'priest',
    name: 'Priest',
    isPlayable: false,
    renderIcon: (cls) => (
      <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2a4 4 0 00-4 4c0 1.9 1.3 3.5 3 3.9V13H8v2h3v7h2v-7h3v-2h-3V9.9c1.7-.4 3-2 3-3.9a4 4 0 00-4-4zm0 6a2 2 0 110-4 2 2 0 010 4z" />
      </svg>
    ),
  },
];

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
      showToast('Only Mage is playable in the current version.');
      setTimeout(() => setShakeClass(null), 500);
    }
  }

  function handleChooseJaina() {
    createMageDeck();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      {/* Outer Carved Wood Chamber */}
      <div className="relative w-full max-w-5xl h-[88vh] max-h-[700px] rounded-3xl bg-gradient-to-b from-[#3a2213] via-[#24130a] to-[#140b05] border-4 border-[#8e6129] shadow-[0_25px_80px_rgba(0,0,0,0.95)] flex overflow-hidden">
        
        {/* LEFT SECTION: 3x3 CHOOSE YOUR HERO GRID */}
        <div className="flex-1 flex flex-col justify-between p-6 sm:p-8 border-r-4 border-[#8e6129]/60">
          
          {/* Top Plaque Header: "Choose Your Hero" */}
          <div className="flex items-center justify-center">
            <div className="px-10 py-2 rounded-xl bg-gradient-to-b from-[#2b180d] to-[#120803] border-2 border-[#a2845c] shadow-lg">
              <h2 className="text-xl sm:text-2xl font-black text-[#fae6a2] tracking-wider uppercase font-serif">
                Choose Your Hero
              </h2>
            </div>
          </div>

          {/* 3x3 Grid of Hero Frames */}
          <div className="grid grid-cols-3 gap-4 sm:gap-6 my-auto max-w-lg mx-auto w-full">
            {HERO_CLASSES.map((hero) => {
              const isSelectedMage = hero.id === 'mage';
              const isShaking = shakeClass === hero.id;

              return (
                <motion.div
                  key={hero.id}
                  animate={isShaking ? { x: [-6, 6, -4, 4, 0] } : {}}
                  transition={{ duration: 0.4 }}
                  onClick={() => handleHeroClick(hero)}
                  className={`relative h-28 sm:h-32 rounded-2xl p-1 cursor-pointer transition-all duration-200 ${
                    isSelectedMage
                      ? 'ring-4 ring-sky-400 shadow-[0_0_25px_#38bdf8] scale-[1.04]'
                      : 'opacity-75 hover:opacity-95'
                  }`}
                >
                  {/* Hero Card Frame */}
                  <div
                    className={`relative w-full h-full rounded-xl overflow-hidden flex flex-col items-center justify-between p-2.5 border-2 ${
                      isSelectedMage
                        ? 'bg-gradient-to-b from-sky-950 via-[#1e345e] to-[#0d1830] border-sky-300'
                        : 'bg-gradient-to-b from-[#281f18] to-[#160f0b] border-[#5e4735]'
                    }`}
                  >
                    {/* Hero Icon Emblem (Clean SVG) */}
                    <div className="my-auto">
                      {hero.renderIcon(
                        isSelectedMage
                          ? 'w-10 h-10 text-sky-300 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]'
                          : 'w-8 h-8 text-[#9f8974]'
                      )}
                    </div>

                    {/* Class Name Banner with High Contrast */}
                    <div
                      className={`w-full py-0.5 rounded text-center text-xs font-black tracking-wide uppercase ${
                        isSelectedMage
                          ? 'bg-sky-600 text-white shadow'
                          : 'bg-[#1b130e] text-[#d6c4b2] border border-[#594231]'
                      }`}
                    >
                      {hero.name}
                    </div>

                    {/* "Coming Soon" Badge for Locked Heroes */}
                    {!hero.isPlayable && (
                      <div className="absolute inset-0 bg-black/65 backdrop-blur-[1px] flex flex-col items-center justify-center p-1 gap-1">
                        <svg className="w-4 h-4 text-amber-400/90 mb-0.5" viewBox="0 0 24 24" fill="currentColor">
                          <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
                        </svg>
                        <span className="px-2 py-0.5 rounded bg-black/90 border border-amber-500/60 text-[10px] font-black text-amber-200 tracking-wider uppercase shadow">
                          Coming Soon
                        </span>
                        <span className="text-[11px] font-black text-[#d6c4b2] tracking-wider uppercase mt-0.5">
                          {hero.name}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Bottom Spacing Spacer */}
          <div className="h-4" />
        </div>

        {/* RIGHT SECTION: JAINA PEDESTAL & CHOOSE BUTTON */}
        <div className="w-80 sm:w-96 bg-[radial-gradient(ellipse_at_center,_#5a1818_0%,_#320b0b_60%,_#160404_100%)] p-6 flex flex-col items-center justify-between relative overflow-hidden">
          
          {/* Subtle Red Fabric Drape Texture */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_rgba(244,63,94,0.15),_transparent_70%)] pointer-events-none" />

          {/* Hero Pedestal Arch Frame */}
          <div className="relative mt-4 flex flex-col items-center">
            
            {/* Jaina Portrait Frame */}
            <div className="relative w-44 h-56 rounded-t-full rounded-b-3xl bg-gradient-to-b from-[#fae6a2] via-[#b6852f] to-[#5a390e] p-2 shadow-[0_12px_30px_rgba(0,0,0,0.85)] border-2 border-[#fff0c2]">
              <div className="relative w-full h-full rounded-t-full rounded-b-2xl overflow-hidden bg-sky-950 border border-black flex items-center justify-center">
                {/* Jaina Avatar / Official Portrait Image */}
                <img
                  src="https://art.hearthstonejson.com/v1/render/latest/enUS/512x/HERO_08.png"
                  alt="Jaina Proudmoore"
                  onLoad={() => setJainaLoaded(true)}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    setJainaLoaded(false);
                  }}
                  className={`w-full h-full object-cover transition-opacity duration-200 ${
                    jainaLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                />

                {/* SVG Silhouette Fallback if image not yet loaded or offline */}
                {!jainaLoaded && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-gradient-to-b from-sky-900 to-indigo-950">
                    <svg className="w-16 h-16 text-sky-300 drop-shadow" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2a5 5 0 00-5 5c0 2.2 1.4 4.1 3.4 4.7-3.7 1-6.4 4.4-6.4 8.3h16c0-3.9-2.7-7.3-6.4-8.3 2-.6 3.4-2.5 3.4-4.7a5 5 0 00-5-5zm0 2a3 3 0 110 6 3 3 0 010-6z" />
                    </svg>
                    <span className="text-xs font-bold text-sky-200 mt-2">Jaina Proudmoore</span>
                  </div>
                )}
              </div>

              {/* Fireblast Hero Power Badge Overlapping Bottom-Right */}
              <div
                title="Fireblast: 2 Mana Hero Power — Deal 1 damage."
                className="absolute -bottom-3 -right-3 w-18 h-18 rounded-full bg-gradient-to-b from-[#fae6a2] via-[#b6852f] to-[#5a390e] p-1 shadow-[0_6px_16px_rgba(0,0,0,0.9)] border-2 border-[#fff0c2] flex items-center justify-center cursor-help group z-10"
              >
                <div className="relative w-full h-full rounded-full bg-[#1b0a04] border border-[#ff8c00] flex items-center justify-center overflow-hidden">
                  {/* Official Fireblast Artwork */}
                  <img
                    src="https://art.hearthstonejson.com/v1/render/latest/enUS/512x/CS2_034.png"
                    alt="Fireblast"
                    onLoad={() => setFireblastLoaded(true)}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      setFireblastLoaded(false);
                    }}
                    className={`w-full h-full object-cover scale-110 transition-opacity duration-200 ${
                      fireblastLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                  />

                  {/* Arcane Flame SVG fallback */}
                  {!fireblastLoaded && (
                    <svg className="w-8 h-8 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8 6 6 9 6 13a6 6 0 0012 0c0-4-2-7-6-11zm0 15a3 3 0 01-3-3c0-1.5 1-3 3-5 2 2 3 3.5 3 5a3 3 0 01-3 3z" />
                    </svg>
                  )}

                  {/* Mana Cost Gem cleanly positioned at top-right */}
                  <div className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-gradient-to-b from-sky-400 to-blue-800 border border-sky-100 text-white font-black text-[10px] flex items-center justify-center shadow">
                    2
                  </div>
                </div>
              </div>
            </div>

            {/* Hero Name Ribbon */}
            <div className="mt-4 px-6 py-1 rounded-lg bg-gradient-to-b from-[#2b180d] to-[#120803] border border-[#fae6a2]/60 shadow text-center">
              <h3 className="text-base font-black text-[#fae6a2] tracking-wider uppercase font-serif">
                Jaina Proudmoore
              </h3>
              <p className="text-[10px] font-bold text-[#c89d46] uppercase">Mage Hero</p>
            </div>
          </div>

          {/* Action Buttons: Big Circular "Choose" Button & Back Button */}
          <div className="w-full flex flex-col items-center gap-3">
            {/* Circular Choose Confirmation Button */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleChooseJaina}
              className="relative w-36 h-36 rounded-full p-2 bg-gradient-to-b from-[#fae6a2] via-[#b6852f] to-[#4e2f0a] shadow-[0_10px_25px_rgba(0,0,0,0.9)] cursor-pointer focus:outline-none ring-2 ring-sky-300"
            >
              <div className="w-full h-full rounded-full bg-[radial-gradient(circle_at_50%_35%,_#38bdf8_0%,_#1d4ed8_55%,_#0c1a38_100%)] flex flex-col items-center justify-center border-2 border-sky-200/60 shadow-inner">
                <span className="text-2xl font-black text-white uppercase tracking-wider drop-shadow">
                  Choose
                </span>
                <span className="text-[10px] font-bold text-sky-200 uppercase tracking-widest mt-0.5">
                  Start Deck
                </span>
              </div>
            </motion.button>

            {/* Back Button */}
            <button
              type="button"
              onClick={() => setHeroSelectOpen(false)}
              className="px-6 py-1.5 rounded-xl bg-gradient-to-b from-[#2b180d] to-[#120803] border border-[#8e6129]/60 text-[#f5e2b3] font-bold text-xs uppercase tracking-wider hover:text-white hover:border-[#fae6a2] cursor-pointer"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
