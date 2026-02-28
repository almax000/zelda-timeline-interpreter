import { useState, useCallback } from 'react';
import { STORAGE_KEYS } from '../constants';

function getStoredComplete(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE) === 'true';
  } catch {
    return false;
  }
}

function getDismissedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE + '-dismissed');
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

export function useOnboarding(tooltipIds: string[]) {
  const [isComplete, setIsComplete] = useState(getStoredComplete);
  const [dismissedIds, setDismissedIds] = useState(getDismissedIds);

  const dismissTooltip = useCallback((id: string) => {
    setDismissedIds((prev) => {
      const next = new Set(prev);
      next.add(id);

      try {
        localStorage.setItem(
          STORAGE_KEYS.ONBOARDING_COMPLETE + '-dismissed',
          JSON.stringify([...next]),
        );
      } catch { /* ignore */ }

      if (tooltipIds.every((tid) => next.has(tid))) {
        setIsComplete(true);
        try {
          localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');
        } catch { /* ignore */ }
      }

      return next;
    });
  }, [tooltipIds]);

  return { isComplete, dismissedIds, dismissTooltip };
}
