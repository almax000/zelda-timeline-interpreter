import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { encodeTimeline } from '../../utils/sharing';
import { getCanvasStore } from '../../stores/canvasRegistry';
import { useTabStore } from '../../stores/tabStore';

function IconShare() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}

export function ShareButton() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<'idle' | 'copied' | 'too-large'>('idle');

  const activeTabId = useTabStore((state) => state.activeTabId);
  const store = getCanvasStore(activeTabId);
  const nodes = store((s) => s.nodes);
  const edges = store((s) => s.edges);

  const handleShare = async () => {
    const url = encodeTimeline(nodes, edges);
    if (!url) {
      setStatus('too-large');
      setTimeout(() => setStatus('idle'), 3000);
      return;
    }
    await navigator.clipboard.writeText(url);
    setStatus('copied');
    setTimeout(() => setStatus('idle'), 1500);
  };

  const label =
    status === 'copied'
      ? t('toolbar.shareCopied')
      : status === 'too-large'
        ? 'Too large'
        : t('toolbar.share');

  return (
    <button
      onClick={handleShare}
      className="pointer-events-auto px-2.5 py-1 text-sm rounded-lg font-medium flex items-center gap-1.5 bg-[var(--color-surface)]/90 backdrop-blur-sm border border-[var(--color-surface-light)] text-[var(--color-text)] hover:bg-[var(--color-surface-light)] transition-colors shadow-lg"
    >
      <IconShare />
      {label}
    </button>
  );
}
