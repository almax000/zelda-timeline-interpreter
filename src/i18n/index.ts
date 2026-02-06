import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from '../../public/locales/en/translation.json';
import jaTranslation from '../../public/locales/ja/translation.json';
import zhCNTranslation from '../../public/locales/zh-CN/translation.json';
import zhTWTranslation from '../../public/locales/zh-TW/translation.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enTranslation },
    ja: { translation: jaTranslation },
    'zh-CN': { translation: zhCNTranslation },
    'zh-TW': { translation: zhTWTranslation },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
