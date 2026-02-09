import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CoverRegion } from '../types/game';

type Language = 'en' | 'ja' | 'zh-CN' | 'zh-TW';

const languageToCoverRegion: Record<Language, CoverRegion> = {
  en: 'us',
  ja: 'jp',
  'zh-CN': 'us',
  'zh-TW': 'us',
};

interface SettingsStore {
  language: Language;
  coverRegion: CoverRegion;
  sidebarCollapsed: boolean;
  snapToGrid: boolean;

  // Actions
  setLanguage: (language: Language) => void;
  setCoverRegion: (region: CoverRegion) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSnapToGrid: (snap: boolean) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      language: 'en',
      coverRegion: 'us',
      sidebarCollapsed: false,
      snapToGrid: true,

      setLanguage: (language) => set({
        language,
        coverRegion: languageToCoverRegion[language],
      }),
      setCoverRegion: (region) => set({ coverRegion: region }),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setSnapToGrid: (snap) => set({ snapToGrid: snap }),
    }),
    {
      name: 'zelda-timeline-settings',
    }
  )
);
