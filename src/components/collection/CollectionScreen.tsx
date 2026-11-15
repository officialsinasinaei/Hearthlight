import { motion, AnimatePresence } from 'motion/react';
import { useCollectionStore } from '../../store/useCollectionStore';
import { CollectionBookView } from './CollectionBookView';
import { CollectionSidebar } from './CollectionSidebar';
import { HeroSelectView } from './HeroSelectView';
import { CardInspectModal } from './CardInspectModal';

export function CollectionScreen() {
  const isHeroSelectOpen = useCollectionStore((s) => s.isHeroSelectOpen);
  const inspectedCard = useCollectionStore((s) => s.inspectedCard);

  return (
    <div
      className="relative w-full h-full overflow-hidden bg-[#140b05] text-[#f7eedc] flex select-none"
      style={{
        paddingTop: 'var(--sat)',
        paddingRight: 'var(--sar)',
        paddingBottom: 'var(--sab)',
        paddingLeft: 'var(--sal)',
      }}
    >
      {/* Background Tabletop & Warm Hearth Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#3b2214_0%,_#1e1008_60%,_#0d0603_100%)] pointer-events-none" />
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(0,0,0,0.3) 0px, rgba(0,0,0,0.3) 2px, transparent 2px, transparent 52px)',
        }}
      />

      {/* Main Content Area: Proportional Two-Column Split */}
      <div className="relative z-10 flex-1 flex h-full overflow-hidden min-w-0">
        {/* Left & Center: The Open Collection Tome */}
        <CollectionBookView />

        {/* Right: Decks List & Deck Builder Sidebar */}
        <CollectionSidebar />
      </div>

      {/* Choose Your Hero Overlay Screen */}
      <AnimatePresence>
        {isHeroSelectOpen && <HeroSelectView />}
      </AnimatePresence>

      {/* Centered Card Inspect Modal */}
      <AnimatePresence>
        {inspectedCard && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
          >
            <CardInspectModal />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
