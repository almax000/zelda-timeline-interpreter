import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { STORAGE_KEYS } from '../../constants';
import { modKey, type TipConfig } from '../../tips/tipRegistry';
import { useUIStore } from '../../stores/uiStore';

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
  const isHelpOpen = useUIStore((s) => s.isHelpOpen);
  const [dismissedId, setDismissedId] = useState<string | null>(null);
  const prevTipIdRef = useRef(tipConfig?.id);

  if (tipConfig?.id !== prevTipIdRef.current) {
    prevTipIdRef.current = tipConfig?.id;
    if (dismissedId !== null) {
      setDismissedId(null);
    }
  }

  if (!tipConfig || dismissedId === tipConfig.id) return null;

  const handleDismiss = () => {
    markSeen(tipConfig.id);
    setDismissedId(tipConfig.id);
  };

  const message = (t(tipConfig.i18nKey) as string).replace(/\{\{mod\}\}/g, modKey);

  return (
    <div className={`absolute left-1/2 -translate-x-1/2 z-40 animate-fade-in transition-[bottom] duration-200 ${isHelpOpen ? 'bottom-[160px]' : 'bottom-14'}`}>
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
