import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BranchSelector } from './BranchSelector';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ExportMenu } from './ExportMenu';
import { useTimelineStore } from '../../stores/timelineStore';
import { ConfirmDialog } from '../UI/ConfirmDialog';
import { officialTimelineNodes, officialTimelineEdges } from '../../data/officialTimeline';

export function Toolbar() {
  const { t } = useTranslation();
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showLoadOfficialDialog, setShowLoadOfficialDialog] = useState(false);
  const clearTimeline = useTimelineStore((state) => state.clearTimeline);
  const loadTimeline = useTimelineStore((state) => state.loadTimeline);

  const { undo, redo, pastStates, futureStates } = useTimelineStore.temporal.getState();
  const canUndo = pastStates.length > 0;
  const canRedo = futureStates.length > 0;

  const handleClear = () => {
    clearTimeline();
    setShowClearDialog(false);
  };

  const handleLoadOfficial = () => {
    loadTimeline(officialTimelineNodes, officialTimelineEdges);
    setShowLoadOfficialDialog(false);
  };

  return (
    <>
      <div className="h-14 bg-[var(--color-surface)] border-b border-[var(--color-surface-light)] px-4 flex items-center justify-between">
        {/* Left side - Title */}
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold text-[var(--color-gold)]">
            {t('app.title')}
          </h1>
          <span className="text-xs text-[var(--color-text-muted)] hidden sm:block">
            {t('app.subtitle')}
          </span>
        </div>

        {/* Center - Branch selector */}
        <div className="hidden md:flex items-center gap-2">
          <BranchSelector />
          <div className="flex gap-1 ml-2">
            <button
              onClick={() => undo()}
              disabled={!canUndo}
              className="px-2 py-1 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-surface-light)] rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title={t('toolbar.undo')}
            >
              ↩
            </button>
            <button
              onClick={() => redo()}
              disabled={!canRedo}
              className="px-2 py-1 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-surface-light)] rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title={t('toolbar.redo')}
            >
              ↪
            </button>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher />

          <button
            onClick={() => setShowLoadOfficialDialog(true)}
            className="px-3 py-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-light)] rounded-lg transition-colors hidden sm:block"
          >
            {t('toolbar.loadOfficial')}
          </button>

          <button
            onClick={() => setShowClearDialog(true)}
            className="px-3 py-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-light)] rounded-lg transition-colors"
          >
            {t('toolbar.clear')}
          </button>

          <ExportMenu />
        </div>
      </div>

      <ConfirmDialog
        isOpen={showClearDialog}
        title={t('dialog.clearConfirm.title')}
        message={t('dialog.clearConfirm.message')}
        confirmLabel={t('dialog.clearConfirm.confirm')}
        cancelLabel={t('dialog.clearConfirm.cancel')}
        onConfirm={handleClear}
        onCancel={() => setShowClearDialog(false)}
        variant="danger"
      />

      <ConfirmDialog
        isOpen={showLoadOfficialDialog}
        title={t('dialog.loadOfficialConfirm.title')}
        message={t('dialog.loadOfficialConfirm.message')}
        confirmLabel={t('dialog.loadOfficialConfirm.confirm')}
        cancelLabel={t('dialog.loadOfficialConfirm.cancel')}
        onConfirm={handleLoadOfficial}
        onCancel={() => setShowLoadOfficialDialog(false)}
      />
    </>
  );
}
