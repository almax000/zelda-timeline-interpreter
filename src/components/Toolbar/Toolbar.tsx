import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BranchSelector } from './BranchSelector';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ExportMenu } from './ExportMenu';
import { useTimelineStore } from '../../stores/timelineStore';
import { ConfirmDialog } from '../UI/ConfirmDialog';

export function Toolbar() {
  const { t } = useTranslation();
  const [showClearDialog, setShowClearDialog] = useState(false);
  const clearTimeline = useTimelineStore((state) => state.clearTimeline);

  const handleClear = () => {
    clearTimeline();
    setShowClearDialog(false);
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
        <div className="hidden md:flex">
          <BranchSelector />
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher />

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
    </>
  );
}
