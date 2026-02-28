import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { STORAGE_KEYS } from '../../constants';
import { modKey, type TipConfig } from '../../tips/tipRegistry';

function markSeen(id: string) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HINTS_SEEN);
    const seen: string[] = raw ? JSON.parse(raw) : [];
    if (!seen.includes(id)) {
      seen.push(id);
      localStorage.setItem(STORAGE_KEYS.HINTS_SEEN, JSON.stringify(seen));
    }
  } catch { /* ignore */ }
}

interface ContextualHintProps {
  tipConfig: TipConfig | null;
}

export function ContextualHint({ tipConfig }: ContextualHintProps) {
  const { t } = useTranslation();
  const [dismissedId, setDismissedId] = useState<string | null>(null);

  useEffect(() => {
    setDismissedId(null);
  }, [tipConfig?.id]);

  if (!tipConfig || dismissedId === tipConfig.id) return null;

  const handleDismiss = () => {
    markSeen(tipConfig.id);
    setDismissedId(tipConfig.id);
  };

  const message = (t(tipConfig.i18nKey) as string).replace(/\{\{mod\}\}/g, modKey);

  return (
    <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-40 animate-fade-in">
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-gold)]/30 shadow-lg text-sm">
        <span className="text-[var(--color-text-muted)]">
          {message}
        </span>
        <button
          onClick={handleDismiss}
          className="text-xs text-[var(--color-gold)] hover:text-[var(--color-text)] font-medium whitespace-nowrap transition-colors"
        >
          {t('hints.dismiss')}
        </button>
      </div>
    </div>
  );
}
