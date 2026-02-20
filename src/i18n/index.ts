import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from '../../public/locales/en/translation.json';
import jaTranslation from '../../public/locales/ja/translation.json';
import zhCNTranslation from '../../public/locales/zh-CN/translation.json';
import zhTWTranslation from '../../public/locales/zh-TW/translation.json';

const SUPPORTED_LANGUAGES = ['en', 'ja', 'zh-CN', 'zh-TW'];

function getPersistedLanguage(): string {
  try {
    const raw = localStorage.getItem('zelda-timeline-settings');
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

export default i18n;
