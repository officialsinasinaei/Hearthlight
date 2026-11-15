import { motion, AnimatePresence } from 'motion/react';
import { useCollectionStore } from '../../store/useCollectionStore';
import { CollectionBookView } from './CollectionBookView';
import { CollectionSidebar } from './CollectionSidebar';
import { HeroSelectView } from './HeroSelectView';
import { CardInspectModal } from './CardInspectModal';

export function CollectionScreen() {
  const isHeroSelectOpen = useCollectionStore((s) => s.isHeroSelectOpen);
  const inspectedCard = useCollectionStore((s) => s.inspectedCard);
  const toastMessage = useCollectionStore((s) => s.toastMessage);

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
        {isHeroSelectOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs"
          >
            <HeroSelectView />
          </motion.div>
        )}
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

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-2 rounded-xl bg-gradient-to-b from-[#2b180d] to-[#120803] border-2 border-[#fae6a2] text-[#f7eedc] text-xs font-black shadow-[0_10px_25px_rgba(0,0,0,0.9)]"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
