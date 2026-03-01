import { getCanvasStore } from '../stores/canvasRegistry';
import { useTabStore } from '../stores/tabStore';
import { useCounters } from '../tips/interactionCounters';
import { evaluateTips, type TipConfig, type TipContext } from '../tips/tipRegistry';
import { STORAGE_KEYS } from '../constants';

function getSeenHints(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HINTS_SEEN);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export function useTips(tabId: string, welcomeDismissed: boolean): TipConfig | null {
  const store = getCanvasStore(tabId);
  const nodeCount = store((s) => s.nodes.length);
  const edgeCount = store((s) => s.edges.length);
  const hasSelection = store((s) => s.nodes.some((n) => n.selected));
  const tabCount = useTabStore((s) => s.tabs.length);
  const counters = useCounters();

  const seen = getSeenHints();

  const ctx: TipContext = {
    nodeCount,
    edgeCount,
    tabCount,
    hasSelection,
    welcomeDismissed,
    counters,
  };

  return evaluateTips(ctx, seen);
}
