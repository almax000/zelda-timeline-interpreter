import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CoverRegion } from '../types/game';

type Language = 'en' | 'ja' | 'zh-CN';

interface SettingsStore {
  language: Language;
  coverRegion: CoverRegion;
  showMinimap: boolean;
  snapToGrid: boolean;

  // Actions
  setLanguage: (language: Language) => void;
  setCoverRegion: (region: CoverRegion) => void;
  setShowMinimap: (show: boolean) => void;
  setSnapToGrid: (snap: boolean) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      language: 'en',
      coverRegion: 'us',
      showMinimap: true,
      snapToGrid: true,

      setLanguage: (language) => set({ language }),
      setCoverRegion: (region) => set({ coverRegion: region }),
      setShowMinimap: (show) => set({ showMinimap: show }),
      setSnapToGrid: (snap) => set({ snapToGrid: snap }),
    }),
    {
      name: 'zelda-timeline-settings',
    }
  )
);
