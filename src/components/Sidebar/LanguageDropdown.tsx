import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../../stores/settingsStore';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
  { code: 'zh-CN', label: '简体中文' },
  { code: 'zh-TW', label: '繁體中文' },
] as const;

function GlobeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}

export function LanguageDropdown() {
  const { i18n } = useTranslation();
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setPopoverOpen(false);
      }
    };
    if (popoverOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [popoverOpen]);

  const handleChange = (lang: 'en' | 'ja' | 'zh-CN' | 'zh-TW') => {
    i18n.changeLanguage(lang);
    setLanguage(lang);
    setPopoverOpen(false);
  };

  const currentLabel = languages.find((l) => l.code === i18n.language)?.label ?? 'English';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setPopoverOpen(!popoverOpen)}
        className="w-7 h-7 flex items-center justify-center rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-light)] transition-colors"
        title={currentLabel}
      >
        <GlobeIcon />
      </button>
      {popoverOpen && (
        <div className="absolute left-0 top-full mt-1 w-36 bg-[var(--color-surface)] border border-[var(--color-surface-light)] rounded-lg shadow-xl py-1 z-50">
          {languages.map(({ code, label }) => (
            <button
              key={code}
              onClick={() => handleChange(code)}
              className={`w-full px-3 py-1.5 text-left text-sm transition-colors ${
                i18n.language === code
                  ? 'text-[var(--color-gold)] bg-[var(--color-surface-light)]'
                  : 'text-[var(--color-text)] hover:bg-[var(--color-surface-light)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
