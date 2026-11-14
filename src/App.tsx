import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, Shield, Swords, Sparkles } from 'lucide-react';
import { useAppStore } from './store/useAppStore';
import { MainMenuScreen } from './components/menu/MainMenuScreen';
import { CARD_POOL } from './engine/cards';

export default function App() {
  const currentScreen = useAppStore((s) => s.currentScreen);
  const navigateTo = useAppStore((s) => s.navigateTo);

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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25 }}
            className="w-screen h-screen bg-[radial-gradient(ellipse_at_top,_#332419_0%,_#140e0a_100%)] text-amber-50 flex flex-col p-6 sm:p-10 overflow-y-auto"
          >
            <div className="max-w-5xl w-full mx-auto">
              <div className="flex items-center justify-between pb-6 border-b border-amber-500/25">
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-amber-100">
                    My Collection
                  </h1>
                  <p className="text-sm text-amber-200/70">
                    Browse your unlocked Hearthlight cards and build custom decks
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigateTo('MAIN_MENU')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-b from-amber-500 to-amber-700 text-stone-950 font-extrabold text-sm shadow-lg cursor-pointer hover:brightness-110"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Box
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mt-8">
                {CARD_POOL.map((card) => (
                  <div
                    key={card.id}
                    className="rounded-2xl bg-stone-900/90 border-2 border-amber-500/30 p-5 flex flex-col justify-between shadow-xl hover:border-amber-400/70 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-9 h-9 rounded-full bg-gradient-to-b from-sky-400 to-blue-700 border-2 border-sky-200 text-white font-black text-base flex items-center justify-center shadow">
                        {card.cost}
                      </span>
                      <span className="text-3xl">{card.artEmoji}</span>
                    </div>
                    <div className="my-4">
                      <div className="font-extrabold text-amber-100 text-base">{card.name}</div>
                      <div
                        className="text-xs text-stone-300 mt-1.5 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: card.text }}
                      />
                    </div>
                    {card.type === 'MINION' ? (
                      <div className="flex justify-between items-center pt-3 border-t border-white/10 text-sm font-black">
                        <span className="flex items-center gap-1.5 text-amber-400">
                          <Swords className="w-4 h-4" /> {card.attack}
                        </span>
                        <span className="flex items-center gap-1.5 text-rose-400">
                          <Shield className="w-4 h-4" /> {card.health}
                        </span>
                      </div>
                    ) : (
                      <div className="pt-3 border-t border-white/10 text-xs font-bold uppercase tracking-wider text-sky-300">
                        Spell Card
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
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
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-b from-sky-400 to-blue-700 flex items-center justify-center shadow-lg border border-sky-200 mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-black text-amber-100">
                Match Arena Ready
              </h2>
              <p className="text-sm text-amber-200/70 mt-2">
                The Main Menu Box transition is wired up. Next phase will mount the live 1v1 Tavern Board &amp; Curved Hand Fan right inside this view.
              </p>
              <button
                type="button"
                onClick={() => navigateTo('MAIN_MENU')}
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-b from-amber-500 to-amber-700 text-stone-950 font-extrabold text-sm shadow-lg cursor-pointer hover:brightness-110"
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
