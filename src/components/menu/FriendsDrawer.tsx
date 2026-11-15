import { AnimatePresence, motion } from 'motion/react';
import { Swords, X, Circle } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export function FriendsDrawer() {
  const isFriendsOpen = useAppStore((s) => s.isFriendsOpen);
  const friends = useAppStore((s) => s.friends);
  const toggleFriends = useAppStore((s) => s.toggleFriends);
  const showToast = useAppStore((s) => s.showToast);

  return (
    <AnimatePresence>
      {isFriendsOpen && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          className="fixed left-5 bottom-16 z-40 w-80 rounded-2xl bg-gradient-to-b from-[#2d241e] to-[#181310] border-2 border-amber-500/45 shadow-[0_20px_50px_rgba(0,0,0,0.85)] overflow-hidden text-amber-50"
        >
          {/* Header */}
          <div className="px-4 py-3 bg-black/35 border-b border-amber-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-200">
                Friends List
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                {friends.length} Online
              </span>
            </div>
            <button
              type="button"
              onClick={() => toggleFriends(false)}
              className="text-stone-400 hover:text-white p-1 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Friends List */}
          <div className="p-3 space-y-2 max-h-72 overflow-y-auto">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-stone-900/75 border border-white/5 hover:border-amber-500/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-xl bg-stone-800 border border-amber-400/30 flex items-center justify-center text-xl">
                    {friend.avatarEmoji}
                    <Circle
                      className={`w-2.5 h-2.5 absolute -bottom-0.5 -right-0.5 fill-current ${
                        friend.status === 'IN_MATCH' ? 'text-sky-400' : 'text-emerald-400'
                      }`}
                    />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-amber-100 leading-tight">
                      {friend.name}
                      <span className="text-[11px] text-stone-400 font-normal ml-1">
                        {friend.tag}
                      </span>
                    </div>
                    <div className="text-xs text-amber-200/65 mt-0.5">{friend.activity}</div>
                  </div>
                </div>

                {/* Friendly Challenge Action */}
                <button
                  type="button"
                  title="Challenge to a Duel"
                  onClick={() => showToast('Friendly Duels will be available in a future update!')}
                  className="p-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/30 border border-amber-400/30 text-amber-200 cursor-pointer transition-colors"
                >
                  <Swords className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
