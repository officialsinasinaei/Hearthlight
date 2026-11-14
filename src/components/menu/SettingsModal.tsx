import { AnimatePresence, motion } from 'motion/react';
import { Volume2, Music, Sparkles, X, Coins } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export function SettingsModal() {
  const isSettingsOpen = useAppStore((s) => s.isSettingsOpen);
  const settings = useAppStore((s) => s.settings);
  const toggleSettings = useAppStore((s) => s.toggleSettings);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const addGold = useAppStore((s) => s.addGold);

  return (
    <AnimatePresence>
      {isSettingsOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => toggleSettings(false)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 12, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 12, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-gradient-to-b from-[#3a2a1d] via-[#241a12] to-[#17110c] p-1.5 border-2 border-amber-500/50 shadow-[0_25px_70px_rgba(0,0,0,0.9)]"
          >
            <div className="rounded-[20px] bg-[#1e1712] p-6 border border-amber-200/15">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-amber-500/20">
                <h2 className="text-xl font-black tracking-wide text-amber-100 uppercase">
                  Game Options
                </h2>
                <button
                  type="button"
                  onClick={() => toggleSettings(false)}
                  className="p-1.5 rounded-lg bg-stone-800/80 text-stone-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Controls */}
              <div className="mt-5 space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold text-amber-200 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Volume2 className="w-4 h-4 text-amber-400" /> Master Volume
                    </span>
                    <span>{settings.masterVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={settings.masterVolume}
                    onChange={(e) => updateSettings({ masterVolume: Number(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-amber-200 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Music className="w-4 h-4 text-sky-400" /> Tavern Music
                    </span>
                    <span>{settings.musicVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={settings.musicVolume}
                    onChange={(e) => updateSettings({ musicVolume: Number(e.target.value) })}
                    className="w-full accent-sky-400 cursor-pointer"
                  />
                </div>

                {/* Toggle Switches */}
                <div className="pt-2 space-y-2.5">
                  <label className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-white/5 cursor-pointer">
                    <span className="flex items-center gap-2 text-sm font-semibold text-amber-100">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Combat Impact Shake
                    </span>
                    <input
                      type="checkbox"
                      checked={settings.enableScreenShake}
                      onChange={(e) => updateSettings({ enableScreenShake: e.target.checked })}
                      className="w-4 h-4 accent-amber-500"
                    />
                  </label>
                </div>

                {/* Developer Sandbox Utility */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-stone-400">Sandbox Economy Test</span>
                  <button
                    type="button"
                    onClick={() => addGold(50)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 text-xs font-bold cursor-pointer"
                  >
                    <Coins className="w-3.5 h-3.5 text-amber-300" /> +50 Gold
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => toggleSettings(false)}
                className="mt-6 w-full py-2.5 rounded-xl bg-gradient-to-b from-amber-500 to-amber-700 text-stone-950 font-black text-sm uppercase tracking-wider shadow-lg hover:brightness-110 cursor-pointer"
              >
                Done
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
