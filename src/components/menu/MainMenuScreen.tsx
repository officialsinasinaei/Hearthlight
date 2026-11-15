import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useAppStore } from '../../store/useAppStore';
import { CenterPlayMedallion } from './CenterPlayMedallion';
import { CollectionTrayButton } from './CollectionTrayButton';
import { BottomHudBar } from './BottomHudBar';
import { FriendsDrawer } from './FriendsDrawer';
import { SettingsModal } from './SettingsModal';
import { BrassCornerBracket } from './MenuIcons';
import { useViewportStage } from '../layout/LandscapeViewportShell';
import { normalizePointerCoords } from '../../utils/pointerCoords';

export function MainMenuScreen() {
  const navigateTo = useAppStore((s) => s.navigateTo);
  const showToast = useAppStore((s) => s.showToast);
  const { isRotatedPortrait } = useViewportStage();

  // Subtle 3D Mouse Parallax for the Central Box
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 180, damping: 26 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [3.2, -3.2]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-4.2, 4.2]), springConfig);

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const coords = normalizePointerCoords(e.clientX, e.clientY, isRotatedPortrait);
    const stageLeft = isRotatedPortrait ? rect.top : rect.left;
    const stageTop = isRotatedPortrait ? window.innerWidth - rect.right : rect.top;
    const stageWidth = isRotatedPortrait ? rect.height : rect.width;
    const stageHeight = isRotatedPortrait ? rect.width : rect.height;

    mouseX.set((coords.x - stageLeft) / (stageWidth || 1) - 0.5);
    mouseY.set((coords.y - stageTop) / (stageHeight || 1) - 0.5);
  }

  function handlePointerLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative w-full h-full overflow-hidden flex flex-col items-center justify-center select-none bg-[#120a06]"
      style={{
        perspective: '1400px',
        paddingTop: 'var(--sat)',
        paddingRight: 'var(--sar)',
        paddingBottom: 'var(--sab)',
        paddingLeft: 'var(--sal)',
      }}
    >
      {/* STATIC SVG FILTER DEFINITIONS (Rasterized once for zero GPU load) */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <filter id="velvet-textile-weave">
          <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="2" result="noise" />
          <feColorMatrix type="matrix" values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.038 0" />
        </filter>
      </svg>

      {/* LAYER 1: Deep Mahogany / Walnut Tabletop with Warm Hearth Lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#3e2415_0%,_#1f1109_58%,_#0d0603_100%)]" />
      
      {/* Faint Horizontal Wood Plank Grooves */}
      <div
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(0,0,0,0.4) 0px, rgba(0,0,0,0.4) 2px, transparent 2px, transparent 56px)',
        }}
      />

      {/* LAYER 2: Draped Royal-Navy Velvet Table Runner with Stitched Gold Trim (Option A: -2.5deg) */}
      <div className="absolute inset-x-[-12%] h-[68%] -rotate-[2.5deg] pointer-events-none flex items-center justify-center">
        {/* Physical Drop Shadow cast onto the wooden table surface */}
        <div className="relative w-full h-full shadow-[0_24px_50px_rgba(0,0,0,0.85)] flex items-center justify-center">
          {/* Main Velvet Cloth Body with Fabric Fold Highlights & Shadow Troughs */}
          <div
            className="relative w-full h-full border-y-[4px] sm:border-y-[6px] border-[#a97f35] overflow-hidden"
            style={{
              background:
                'linear-gradient(180deg, #0e182f 0%, #152549 22%, #0e182f 48%, #172952 75%, #091020 100%)',
              boxShadow: 'inset 0 10px 30px rgba(0,0,0,0.7), inset 0 -10px 30px rgba(0,0,0,0.7)',
            }}
          >
            {/* Subtle Diagonal Cloth Ripple Folds */}
            <div
              className="absolute inset-0 opacity-30 pointer-events-none"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(115deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 40px, rgba(0,0,0,0.25) 40px, rgba(0,0,0,0.25) 120px)',
              }}
            />

            {/* Static Textile Weave Grain Overlay */}
            <div
              className="absolute inset-0 pointer-events-none mix-blend-overlay"
              style={{ filter: 'url(#velvet-textile-weave)' }}
            />

            {/* Top Metallic Gold Double-Stitch Line */}
            <div className="absolute inset-x-0 top-1 h-[2px] border-b border-dashed border-[#fae6a2]/40" />
            
            {/* Bottom Metallic Gold Double-Stitch Line */}
            <div className="absolute inset-x-0 bottom-1 h-[2px] border-t border-dashed border-[#fae6a2]/40" />

            {/* Central Hearth Radial Glow Reflected on Velvet */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(56,189,248,0.12),_transparent_65%)]" />
          </div>
        </div>
      </div>

      {/* LAYER 3: The Central Hearthstone Relic Box + Attached My Collection Drawer */}
      <motion.div
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="relative z-10 flex flex-col items-center select-none"
      >
        {/* THE MAIN ORNATE WALNUT BOX: Fluid Viewport-Bounded Scaling with Harmonious Desktop Aspect Ratio */}
        <div
          data-testid="main-menu-box"
          className="relative w-[min(76vw,600px)] h-[clamp(170px,50dvh,380px)] aspect-[1.62/1] max-w-[min(78vw,600px)] rounded-[20px] sm:rounded-[24px] p-2.5 sm:p-4 bg-gradient-to-b from-[#7a4b22] via-[#4d2c13] to-[#2d180a] shadow-[0_24px_60px_rgba(0,0,0,0.95),inset_0_2px_4px_rgba(255,230,175,0.35)] border-3 sm:border-4 border-[#9e6f30] flex items-center justify-center"
        >
          
          {/* 4 Sculpted Brushed-Brass Corner Hardware Brackets wrapping the rounded corners */}
          <BrassCornerBracket position="top-left" className="top-0 left-0 scale-75 sm:scale-100" />
          <BrassCornerBracket position="top-right" className="top-0 right-0 scale-75 sm:scale-100" />
          <BrassCornerBracket position="bottom-left" className="bottom-0 left-0 scale-75 sm:scale-100" />
          <BrassCornerBracket position="bottom-right" className="bottom-0 right-0 scale-75 sm:scale-100" />

          {/* Inner Recessed Walnut Cabinet Panel */}
          <div className="relative w-full h-full rounded-[14px] sm:rounded-[16px] bg-gradient-to-b from-[#563417] via-[#3a200d] to-[#241307] shadow-[inset_0_12px_30px_rgba(0,0,0,0.9)] border border-[#b8863b]/50 sm:border-2 overflow-hidden flex items-center justify-center">
            
            {/* Center Vertical Cabinet Door Seam */}
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1 sm:w-1.5 bg-black/75 shadow-[0_0_8px_rgba(0,0,0,0.95)] pointer-events-none" />

            {/* Inlaid Delicate Brass Wire Perimeter */}
            <div className="absolute inset-4 sm:inset-7 rounded-xl border border-[#c89d46]/25 pointer-events-none" />
            <div className="absolute inset-6 sm:inset-9 rounded-lg border border-[#c89d46]/15 pointer-events-none" />

            {/* 4 Corner Brass Filigree Wire Arcs */}
            <div className="absolute top-2 left-2 sm:top-4 sm:left-4 w-12 h-12 sm:w-20 sm:h-20 rounded-br-full border-r-2 border-b-2 border-[#c89d46]/30 pointer-events-none" />
            <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-12 h-12 sm:w-20 sm:h-20 rounded-bl-full border-l-2 border-b-2 border-[#c89d46]/30 pointer-events-none" />
            <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 w-12 h-12 sm:w-20 sm:h-20 rounded-tr-full border-r-2 border-t-2 border-[#c89d46]/30 pointer-events-none" />
            <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 w-12 h-12 sm:w-20 sm:h-20 rounded-tl-full border-l-2 border-t-2 border-[#c89d46]/30 pointer-events-none" />

            {/* THE CENTERPIECE CIRCULAR PLAY MEDALLION */}
            <CenterPlayMedallion
              onPlayClick={() =>
                showToast('The Tavern Arena is preparing for battle! 1v1 Battlefields will arrive in a future update.')
              }
            />
          </div>
        </div>

        {/* THE LOWER ATTACHED MY COLLECTION DRAWER */}
        <CollectionTrayButton onCollectionClick={() => navigateTo('COLLECTION')} />
      </motion.div>

      {/* LAYER 4: Bottom Corner HUD (Friends Crest, Minted Gold, Machined Cog) & Overlays */}
      <BottomHudBar />
      <FriendsDrawer />
      <SettingsModal />
    </div>
  );
}
