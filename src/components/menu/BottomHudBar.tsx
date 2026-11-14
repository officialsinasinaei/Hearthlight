import { motion } from 'motion/react';
import { useAppStore } from '../../store/useAppStore';
import { FriendsCrestIcon, GoldCoinIcon, BrassCogIcon } from './MenuIcons';

export function BottomHudBar() {
  const gold = useAppStore((s) => s.gold);
  const friends = useAppStore((s) => s.friends);
  const isFriendsOpen = useAppStore((s) => s.isFriendsOpen);
  const isSettingsOpen = useAppStore((s) => s.isSettingsOpen);
  const toggleFriends = useAppStore((s) => s.toggleFriends);
  const toggleSettings = useAppStore((s) => s.toggleSettings);

  const onlineCount = friends.filter((f) => f.status !== 'AWAY').length;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 pointer-events-none px-6 py-4 flex items-end justify-between select-none">
      {/* BOTTOM-LEFT: Friends Button */}
      <div className="pointer-events-auto flex items-center gap-2">
        <motion.button
          type="button"
          whileHover={{ scale: 1.04, y: -1 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 450, damping: 28 }}
          onClick={() => toggleFriends()}
          className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border shadow-[0_6px_16px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)] cursor-pointer transition-colors ${
            isFriendsOpen
              ? 'bg-gradient-to-b from-[#4d2f17] to-[#25150a] border-[#e5b869] text-white'
              : 'bg-gradient-to-b from-[#281b12] to-[#140c07] border-[#b8863b]/35 text-[#f7eedc] hover:border-[#e5b869]/60'
          }`}
        >
          {/* Tavern Shield Emblem with Emerald Jewel Pip */}
          <div className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-[#140b05] border border-[#b8863b]/40">
            <FriendsCrestIcon className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#4ade80] ring-2 ring-[#140c07] shadow-[0_0_4px_#4ade80]" />
          </div>

          <span className="text-sm font-extrabold tabular-nums tracking-tight text-[#f7eedc]">
            {onlineCount}
          </span>
          <span className="text-xs font-semibold text-[#cbbba0]/70 hidden sm:inline">
            Friends
          </span>
        </motion.button>
      </div>

      {/* BOTTOM-RIGHT: Coin Counter + Settings Gear */}
      <div className="pointer-events-auto flex items-center gap-2.5">
        {/* Minted Gold Coin Tray */}
        <div
          title="Tavern Gold"
          className="flex items-center gap-2.5 pl-3.5 pr-2.5 py-1.5 rounded-xl bg-gradient-to-b from-[#24170f] to-[#120a06] border border-[#b8863b]/35 shadow-[0_6px_16px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(0,0,0,0.9)]"
        >
          <span className="text-sm font-black tracking-wide text-[#f7eedc] tabular-nums text-letterpress">
            {gold}
          </span>
          <GoldCoinIcon className="w-5 h-5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]" />
        </div>

        {/* Machined Brass Cog Settings Button */}
        <motion.button
          type="button"
          aria-label="Game Settings"
          whileHover={{ scale: 1.06, rotate: 24 }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onClick={() => toggleSettings()}
          className={`w-10 h-10 rounded-xl border flex items-center justify-center shadow-[0_6px_16px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)] cursor-pointer transition-colors ${
            isSettingsOpen
              ? 'bg-gradient-to-b from-[#4d2f17] to-[#25150a] border-[#e5b869] text-white'
              : 'bg-gradient-to-b from-[#281b12] to-[#140c07] border-[#b8863b]/35 text-[#f5df96] hover:text-white hover:border-[#e5b869]/60'
          }`}
        >
          <BrassCogIcon className="w-5 h-5 drop-shadow" />
        </motion.button>
      </div>
    </div>
  );
}
