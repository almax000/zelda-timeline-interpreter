import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CoverRegion } from '../types/game';
import { STORAGE_KEYS } from '../constants';

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
  snapToGrid: boolean;

  // Actions
  setLanguage: (language: Language) => void;
  setCoverRegion: (region: CoverRegion) => void;
  setSnapToGrid: (snap: boolean) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      language: 'en',
      coverRegion: 'us',
      snapToGrid: true,

      setLanguage: (language) => set({
        language,
        coverRegion: languageToCoverRegion[language],
      }),
      setCoverRegion: (region) => set({ coverRegion: region }),
      setSnapToGrid: (snap) => set({ snapToGrid: snap }),
    }),
    {
      name: STORAGE_KEYS.SETTINGS,
    }
  )
);
