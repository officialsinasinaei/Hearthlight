import { AnimatePresence, motion } from 'motion/react';
import { useAppStore } from './store/useAppStore';
import { MainMenuScreen } from './components/menu/MainMenuScreen';
import { CollectionScreen } from './components/collection/CollectionScreen';
import { LandscapeViewportShell } from './components/layout/LandscapeViewportShell';
import { PlayCrestIcon } from './components/menu/MenuIcons';

export default function App() {
  const currentScreen = useAppStore((s) => s.currentScreen);
  const toastMessage = useAppStore((s) => s.toastMessage);

  return (
    <LandscapeViewportShell>
      <div className="w-full h-full overflow-hidden bg-[#140e0a] relative">
        <AnimatePresence mode="wait">
          {currentScreen === 'MAIN_MENU' && (
            <motion.div
              key="main-menu"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.04 }}
              transition={{ duration: 0.25 }}
              className="w-full h-full"
            >
              <MainMenuScreen />
            </motion.div>
          )}

          {currentScreen === 'COLLECTION' && (
            <motion.div
              key="collection"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.25 }}
              className="w-full h-full"
            >
              <CollectionScreen />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Tavern Toast Notification */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              key="tavern-toast"
              data-testid="tavern-toast"
              role="status"
              aria-live="polite"
              initial={{ opacity: 0, y: -24, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
              className="absolute top-3 sm:top-5 left-1/2 -translate-x-1/2 z-50 pointer-events-none max-w-[90vw] sm:max-w-md"
            >
              <div className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl bg-gradient-to-b from-[#2c180d] via-[#1d1007] to-[#120803] border-2 border-[#d4af37] shadow-[0_12px_32px_rgba(0,0,0,0.95),0_0_20px_rgba(212,175,55,0.25)] flex items-center gap-2.5">
                <PlayCrestIcon className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
                <span className="font-serif text-xs sm:text-sm font-bold text-[#fef3c7] leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                  {toastMessage}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </LandscapeViewportShell>
  );
}
