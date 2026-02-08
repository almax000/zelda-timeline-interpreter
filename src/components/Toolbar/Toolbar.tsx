import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ExportMenu } from './ExportMenu';

export function Toolbar() {
  const { t } = useTranslation();

  return (
    <div className="h-12 bg-[var(--color-surface)] border-b border-[var(--color-surface-light)] px-4 flex items-center">
      {/* Left: Logo + Full Title */}
      <div className="flex items-center gap-3 min-w-0">
        <h1
          className="text-xl tracking-wider text-[var(--color-gold)] shrink-0"
          style={{ fontFamily: "'Hylia Serif', serif" }}
        >
          ZTI
        </h1>
        <span className="text-sm text-[var(--color-text-muted)] truncate hidden sm:block">
          {t('app.title')}
        </span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right: Language + Export */}
      <div className="flex items-center gap-2 shrink-0">
        <LanguageSwitcher />
        <ExportMenu />
      </div>
    </div>
  );
}
