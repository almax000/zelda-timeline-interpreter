import { useTranslation } from 'react-i18next';
import { TriforceIcon } from './TriforceIcon';

interface WelcomeScreenProps {
  onLoadOfficial: () => void;
  onStartBlank: () => void;
}

export function WelcomeScreen({ onLoadOfficial, onStartBlank }: WelcomeScreenProps) {
  const { t } = useTranslation();

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
      <div className="flex flex-col items-center gap-6 p-8 rounded-2xl bg-[var(--color-surface)]/80 backdrop-blur-sm border border-[var(--color-surface-light)] shadow-2xl max-w-md text-center">
        <TriforceIcon size={40} className="text-[var(--color-gold)] opacity-80" />

        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-[var(--color-text)]">
            {t('welcome.title')}
          </h2>
          <p className="text-sm text-[var(--color-text-muted)]">
            {t('welcome.subtitle')}
          </p>
        </div>

        <div className="pointer-events-auto flex gap-3">
          <button
            onClick={onLoadOfficial}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--color-gold)] text-[var(--color-background)] hover:brightness-110 transition-all"
          >
            {t('welcome.loadOfficial')}
          </button>
          <button
            onClick={onStartBlank}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-[var(--color-surface-light)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-text-muted)] transition-all"
          >
            {t('welcome.startBlank')}
          </button>
        </div>

        <div className="flex gap-6 text-xs text-[var(--color-text-muted)]/60">
          <span>← {t('welcome.hintSidebar')}</span>
          <span>{t('welcome.hintCanvas')} ↓</span>
          <span>{t('welcome.hintToolbar')} →</span>
        </div>
      </div>
    </div>
  );
}
