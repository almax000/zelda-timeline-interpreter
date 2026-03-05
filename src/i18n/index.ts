import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from '../../public/locales/en/translation.json';
import jaTranslation from '../../public/locales/ja/translation.json';
import zhCNTranslation from '../../public/locales/zh-CN/translation.json';
import zhTWTranslation from '../../public/locales/zh-TW/translation.json';
import { useSettingsStore } from '../stores/settingsStore';
import { STORAGE_KEYS } from '../constants';

const SUPPORTED_LANGUAGES = ['en', 'ja', 'zh-CN', 'zh-TW'];

function detectBrowserLanguage(): string | null {
  const browserLang = navigator.language;
  if (!browserLang) return null;

  // Exact match
  if (SUPPORTED_LANGUAGES.includes(browserLang)) return browserLang;

  // zh-Hans → zh-CN, zh-Hant → zh-TW
  if (browserLang.startsWith('zh-Hans')) return 'zh-CN';
  if (browserLang.startsWith('zh-Hant')) return 'zh-TW';

  // Prefix match (e.g. "en-US" → "en", "ja-JP" → "ja")
  const prefix = browserLang.split('-')[0];
  if (SUPPORTED_LANGUAGES.includes(prefix)) return prefix;

  // zh without region → default to zh-CN
  if (prefix === 'zh') return 'zh-CN';

  return null;
}

function hasPersistedLanguage(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      const lang = JSON.parse(raw)?.state?.language;
      if (SUPPORTED_LANGUAGES.includes(lang)) return true;
    }
  } catch { /* ignore */ }
  return false;
}

function getPersistedLanguage(): string {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      const lang = JSON.parse(raw)?.state?.language;
      if (SUPPORTED_LANGUAGES.includes(lang)) return lang;
    }
  } catch { /* ignore */ }
  return 'en';
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enTranslation },
    ja: { translation: jaTranslation },
    'zh-CN': { translation: zhCNTranslation },
    'zh-TW': { translation: zhTWTranslation },
  },
  lng: getPersistedLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export async function initLanguage(): Promise<void> {
  if (hasPersistedLanguage()) return;

  const browserLang = detectBrowserLanguage();
  if (browserLang) {
    if (browserLang !== 'en') {
      await i18n.changeLanguage(browserLang);
      useSettingsStore.getState().setLanguage(browserLang as 'en' | 'ja' | 'zh-CN' | 'zh-TW');
    }
    return;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch('/api/geo', { signal: controller.signal });
    clearTimeout(timeoutId);
    const { lang } = await res.json();
    if (SUPPORTED_LANGUAGES.includes(lang) && lang !== 'en') {
      await i18n.changeLanguage(lang);
      useSettingsStore.getState().setLanguage(lang as 'en' | 'ja' | 'zh-CN' | 'zh-TW');
    }
  } catch { /* fallback: stay on 'en' */ }
}

export default i18n;
