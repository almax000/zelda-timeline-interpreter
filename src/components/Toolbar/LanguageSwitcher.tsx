import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../../stores/settingsStore';

const languages = [
  { code: 'en', label: 'EN' },
  { code: 'ja', label: '日本語' },
  { code: 'zh-CN', label: '中文' },
] as const;

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const setLanguage = useSettingsStore((state) => state.setLanguage);

  const handleChange = (lang: 'en' | 'ja' | 'zh-CN') => {
    i18n.changeLanguage(lang);
    setLanguage(lang);
  };

  return (
    <div className="flex gap-1">
      {languages.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => handleChange(code)}
          className={`
            px-2 py-1 text-xs rounded transition-colors
            ${i18n.language === code
              ? 'bg-[var(--color-gold)] text-[var(--color-background)] font-medium'
              : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-light)]'
            }
          `}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
