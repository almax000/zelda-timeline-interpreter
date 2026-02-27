import { useTranslation } from 'react-i18next';
import { TimelineIcon } from './TimelineIcon';

interface WelcomeScreenProps {
  onLoadOfficial: () => void;
  onStartBlank: () => void;
}

function MiniTimelinePreview() {
  return (
    <svg viewBox="0 0 120 60" width="120" height="60" fill="none" className="opacity-60">
      <line x1="10" y1="30" x2="40" y2="30" stroke="var(--color-gold)" strokeWidth="1.5" />
      <line x1="40" y1="30" x2="70" y2="16" stroke="var(--color-gold)" strokeWidth="1.5" />
      <line x1="40" y1="30" x2="70" y2="44" stroke="var(--color-gold)" strokeWidth="1.5" />
      <line x1="70" y1="16" x2="100" y2="16" stroke="var(--color-gold)" strokeWidth="1.5" />
      <line x1="70" y1="44" x2="100" y2="44" stroke="var(--color-gold)" strokeWidth="1.5" />
      <circle cx="10" cy="30" r="3" fill="var(--color-gold)" />
      <circle cx="40" cy="30" r="3" fill="var(--color-gold)" />
      <circle cx="70" cy="16" r="2.5" fill="var(--color-gold)" />
      <circle cx="70" cy="44" r="2.5" fill="var(--color-gold)" />
      <circle cx="100" cy="16" r="2.5" fill="var(--color-gold)" />
      <circle cx="100" cy="44" r="2.5" fill="var(--color-gold)" />
    </svg>
  );
}

export function WelcomeScreen({ onLoadOfficial, onStartBlank }: WelcomeScreenProps) {
  const { t } = useTranslation();

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
      <div
        className="flex flex-col items-center gap-8 p-10 rounded-2xl bg-[var(--color-surface)]/80 backdrop-blur-sm border border-[var(--color-surface-light)] shadow-2xl max-w-lg text-center"
        style={{ animation: 'welcome-in 400ms ease-out both' }}
      >
        <TimelineIcon size={44} className="text-[var(--color-gold)] opacity-80" />

        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold text-[var(--color-text)]">
            {t('welcome.title')}
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
            {t('welcome.subtitle')}
          </p>
        </div>

        <div className="pointer-events-auto flex gap-4">
          {/* Official Timeline card */}
          <button
            onClick={onLoadOfficial}
            className="group flex flex-col items-center gap-3 p-5 rounded-xl border border-[var(--color-gold)]/30 bg-[var(--color-gold)]/5 hover:bg-[var(--color-gold)]/15 hover:border-[var(--color-gold)]/60 transition-all w-44"
          >
            <MiniTimelinePreview />
            <span className="text-sm font-medium text-[var(--color-gold)] group-hover:brightness-110">
              {t('welcome.loadOfficial')}
            </span>
          </button>

          {/* Start Blank card */}
          <button
            onClick={onStartBlank}
            className="group flex flex-col items-center gap-3 p-5 rounded-xl border border-dashed border-[var(--color-surface-light)] hover:border-[var(--color-text-muted)] transition-all w-44"
          >
            <div className="w-[120px] h-[60px] flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-[var(--color-text-muted)] opacity-50 group-hover:opacity-80 transition-opacity">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <span className="text-sm font-medium text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] transition-colors">
              {t('welcome.startBlank')}
            </span>
          </button>
        </div>

        <div className="flex gap-8 text-[11px] text-[var(--color-text-muted)]/40 tracking-wide">
          <span>← {t('welcome.hintSidebar')}</span>
          <span>{t('welcome.hintCanvas')} ↓</span>
          <span>{t('welcome.hintToolbar')} →</span>
        </div>
      </div>
    </div>
  );
}
