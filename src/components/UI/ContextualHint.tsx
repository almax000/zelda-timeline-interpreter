import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { STORAGE_KEYS } from '../../constants';

type HintId = 'rightClick' | 'branchColors' | 'dragGames';

function getSeenHints(): Set<HintId> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HINTS_SEEN);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function markSeen(id: HintId) {
  const seen = getSeenHints();
  seen.add(id);
  localStorage.setItem(STORAGE_KEYS.HINTS_SEEN, JSON.stringify([...seen]));
}

interface ContextualHintProps {
  hintId: HintId;
  visible: boolean;
}

export function ContextualHint({ hintId, visible }: ContextualHintProps) {
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(() => getSeenHints().has(hintId));

  useEffect(() => {
    setDismissed(getSeenHints().has(hintId));
  }, [hintId]);

  if (dismissed || !visible) return null;

  const handleDismiss = () => {
    markSeen(hintId);
    setDismissed(true);
  };

  return (
    <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-40 animate-fade-in">
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-gold)]/30 shadow-lg text-sm">
        <span className="text-[var(--color-text-muted)]">
          {t(`hints.${hintId}`)}
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
