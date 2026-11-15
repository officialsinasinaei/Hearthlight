import { AnimatePresence, motion } from 'motion/react';
import { useAppStore } from './store/useAppStore';
import { MainMenuScreen } from './components/menu/MainMenuScreen';
import { CollectionScreen } from './components/collection/CollectionScreen';
import { BattlefieldScreen } from './components/battlefield/BattlefieldScreen';
import { LandscapeViewportShell } from './components/layout/LandscapeViewportShell';
import { TavernToast } from './components/ui';
import { FindingOpponentModal } from './components/FindingOpponentModal';

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

          {currentScreen === 'BATTLEFIELD' && (
            <motion.div
              key="battlefield"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.25 }}
              className="w-full h-full"
            >
              <BattlefieldScreen />
            </motion.div>
          )}
        </AnimatePresence>

        <TavernToast message={toastMessage} />
        <FindingOpponentModal />
      </div>
    </LandscapeViewportShell>
  );
}
