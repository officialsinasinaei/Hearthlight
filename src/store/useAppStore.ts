import { create } from 'zustand';

export type AppScreen = 'MAIN_MENU' | 'COLLECTION' | 'BATTLEFIELD';

export interface FriendEntry {
  id: string;
  name: string;
  tag: string;
  status: 'ONLINE' | 'IN_MATCH' | 'AWAY';
  activity: string;
  avatarEmoji: string;
}

export interface GameSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  enableScreenShake: boolean;
  highContrastCards: boolean;
}

interface AppStoreState {
  currentScreen: AppScreen;
  isTransitioning: boolean;
  gold: number;
  friends: FriendEntry[];
  isFriendsOpen: boolean;
  isSettingsOpen: boolean;
  settings: GameSettings;
  isFindingOpponentOpen: boolean;
  toastMessage: string | null;

  // Actions
  navigateTo: (screen: AppScreen) => void;
  openFindingOpponent: () => void;
  closeFindingOpponent: () => void;
  toggleFriends: (force?: boolean) => void;
  toggleSettings: (force?: boolean) => void;
  updateSettings: (partial: Partial<GameSettings>) => void;
  addGold: (amount: number) => void;
  showToast: (message: string) => void;
}

const INITIAL_FRIENDS: FriendEntry[] = [
  {
    id: 'f-1',
    name: 'Jaina Proudmoore',
    tag: '#1042',
    status: 'IN_MATCH',
    activity: 'In Match — Turn 6',
    avatarEmoji: '🧙♀️',
  },
  {
    id: 'f-2',
    name: 'Uther Lightbringer',
    tag: '#8821',
    status: 'ONLINE',
    activity: 'Browsing Collection',
    avatarEmoji: '🛡️',
  },
  {
    id: 'f-3',
    name: 'Rexxar',
    tag: '#3319',
    status: 'ONLINE',
    activity: 'In Main Menu',
    avatarEmoji: '🏹',
  },
];

export const useAppStore = create<AppStoreState>((set) => ({
  currentScreen: 'MAIN_MENU',
  isTransitioning: false,
  gold: 120,
  friends: INITIAL_FRIENDS,
  isFriendsOpen: false,
  isSettingsOpen: false,
  settings: {
    masterVolume: 85,
    musicVolume: 70,
    sfxVolume: 90,
    enableScreenShake: true,
    highContrastCards: false,
  },
  isFindingOpponentOpen: false,
  toastMessage: null,

  openFindingOpponent: () =>
    set({ isFindingOpponentOpen: true, isFriendsOpen: false, isSettingsOpen: false }),

  closeFindingOpponent: () =>
    set({ isFindingOpponentOpen: false }),

  showToast: (message) => {
    set({ toastMessage: message });
    setTimeout(() => {
      set((state) => (state.toastMessage === message ? { toastMessage: null } : {}));
    }, 3500);
  },

  navigateTo: (screen) => {
    set({ isTransitioning: true, isFriendsOpen: false, isSettingsOpen: false });
    setTimeout(() => {
      set({ currentScreen: screen, isTransitioning: false });
    }, 280);
  },

  toggleFriends: (force) =>
    set((state) => ({
      isFriendsOpen: typeof force === 'boolean' ? force : !state.isFriendsOpen,
      isSettingsOpen: false,
    })),

  toggleSettings: (force) =>
    set((state) => ({
      isSettingsOpen: typeof force === 'boolean' ? force : !state.isSettingsOpen,
      isFriendsOpen: false,
    })),

  updateSettings: (partial) =>
    set((state) => ({
      settings: { ...state.settings, ...partial },
    })),

  addGold: (amount) =>
    set((state) => ({
      gold: Math.max(0, state.gold + amount),
    })),
}));
