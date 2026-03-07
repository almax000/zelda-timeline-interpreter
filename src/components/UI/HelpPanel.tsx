import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '../../stores/uiStore';

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent);
const mod = isMac ? '\u2318' : 'Ctrl';

type TabKey = 'navigation' | 'editing' | 'tools';

export function HelpPanel() {
  const { t } = useTranslation();
  const isOpen = useUIStore((s) => s.isHelpOpen);
  const setHelpOpen = useUIStore((s) => s.setHelpOpen);
  const [activeTab, setActiveTab] = useState<TabKey>('navigation');

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setHelpOpen(false);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, setHelpOpen]);

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'navigation', label: t('help.navigation') },
    { key: 'editing', label: t('help.editing') },
    { key: 'tools', label: t('help.tools') },
  ];

  return (
    <div className={`fixed bottom-3 left-1/2 -translate-x-1/2 z-40 transition-all duration-200 ${isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-3 pointer-events-none'}`}>
      <div className="bg-[var(--color-surface)] border border-[var(--color-surface-light)] rounded-xl shadow-2xl overflow-hidden min-w-[480px] max-w-[600px]">
        <div className="flex items-center justify-between px-3 pt-2 pb-1 border-b border-[var(--color-surface-light)]">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.key
                    ? 'bg-[var(--color-gold)]/15 text-[var(--color-gold)]'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setHelpOpen(false)}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors text-sm leading-none px-1"
          >
            &times;
          </button>
        </div>

        <div className="px-4 py-2 max-h-[200px] overflow-y-auto">
          {activeTab === 'navigation' && (
            <div className="grid grid-cols-2 gap-x-6 gap-y-1">
              <Row keys={t('help.scrollWheel')} action={t('help.panCanvas')} />
              <Row keys={`${mod} + ${t('help.scrollWheel')}`} action={t('help.zoomInOut')} />
              <Row keys={`Space + ${t('help.drag')}`} action={t('help.panCanvas')} />
              <Row keys={t('help.middleClickDrag')} action={t('help.panCanvas')} />
            </div>
          )}

          {activeTab === 'editing' && (
            <div className="grid grid-cols-2 gap-x-6 gap-y-1">
              <Row keys={`Shift + ${t('help.drag')}`} action={t('help.constrainAxis')} />
              <Row keys={t('help.rightClickLabel')} action={t('help.contextMenu')} />
              <Row keys={`${mod}+Z`} action={t('help.undo')} />
              <Row keys={`${mod}+Shift+Z`} action={t('help.redo')} />
              <Row keys={`${mod}+D`} action={t('help.duplicate')} />
              <Row keys={`${mod}+A`} action={t('contextMenu.selectAll')} />
              <Row keys="Delete" action={t('help.deleteSelected')} />
            </div>
          )}

          {activeTab === 'tools' && (
            <div className="grid grid-cols-2 gap-x-6 gap-y-1">
              <Row keys="V" action={t('toolbar.select')} />
              <Row keys="D" action={t('toolbar.annotate')} />
              <Row keys="B" action={t('toolbar.split')} />
              <Row keys="T" action={t('toolbar.text')} />
              <Row keys="P" action={t('toolbar.draw')} />
              <Row keys="E" action={t('toolbar.eraser')} />
              <Row keys="L" action={t('toolbar.laser')} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ keys, action }: { keys: string; action: string }) {
  return (
    <div className="flex items-center justify-between text-sm py-0.5">
      <span className="text-[var(--color-text-muted)] text-sm">{action}</span>
      <kbd className="ml-3 px-1.5 py-0.5 bg-[var(--color-surface-light)] border border-[var(--color-surface-light)] rounded text-xs font-mono text-[var(--color-text)] whitespace-nowrap">
        {keys}
      </kbd>
    </div>
  );
}
