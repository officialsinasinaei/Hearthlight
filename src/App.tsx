import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';
import { useAppStore } from './store/useAppStore';
import { useCollectionStore } from './store/useCollectionStore';
import { MainMenuScreen } from './components/menu/MainMenuScreen';
import { CollectionScreen } from './components/collection/CollectionScreen';

export default function App() {
  const currentScreen = useAppStore((s) => s.currentScreen);
  const navigateTo = useAppStore((s) => s.navigateTo);
  const getActiveValidDeck = useCollectionStore((s) => s.getActiveValidDeck);

  const activeValidDeck = getActiveValidDeck();

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#140e0a]">
      <AnimatePresence mode="wait">
        {currentScreen === 'MAIN_MENU' && (
          <motion.div
            key="main-menu"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.25 }}
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
            className="w-screen h-screen"
          >
            <CollectionScreen />
          </motion.div>
        )}

        {currentScreen === 'PLAY_MATCH' && (
          <motion.div
            key="play-match"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            className="w-screen h-screen bg-[radial-gradient(ellipse_at_center,_#2c2119_0%,_#120d0a_100%)] text-amber-50 flex flex-col items-center justify-center p-6"
          >
            <div className="max-w-lg w-full rounded-3xl bg-stone-900/90 border-2 border-amber-500/40 p-8 text-center shadow-2xl">
              {activeValidDeck ? (
                <>
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-b from-sky-400 to-blue-700 flex items-center justify-center shadow-lg border border-sky-200 mb-4">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-black text-amber-100">
                    Match Arena Ready
                  </h2>
                  <p className="text-sm text-amber-200/70 mt-2">
                    Playing with Active Deck: <strong className="text-amber-300 font-bold">{activeValidDeck.name}</strong> (30/30 Cards).
                  </p>
                  <p className="text-xs text-stone-400 mt-1">
                    The 1v1 Tavern Board &amp; Curved Hand Fan will mount in this view.
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-b from-rose-500 to-red-800 flex items-center justify-center shadow-lg border border-rose-200 mb-4">
                    <AlertCircle className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-black text-rose-200">
                    No Active 30-Card Deck
                  </h2>
                  <p className="text-sm text-stone-300 mt-2">
                    You need a complete 30-card Mage deck to enter the match arena.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigateTo('COLLECTION')}
                    className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-b from-amber-500 to-amber-700 text-stone-950 font-black text-sm shadow-lg hover:brightness-110 cursor-pointer"
                  >
                    Open My Collection
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => navigateTo('MAIN_MENU')}
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-b from-[#3a2213] to-[#1c0f06] border border-[#8e6129]/60 text-amber-200 font-extrabold text-sm shadow-lg cursor-pointer hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" /> Return to Main Menu
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
