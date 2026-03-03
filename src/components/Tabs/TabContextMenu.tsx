import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTabStore, type Tab } from '../../stores/tabStore';
import { ConfirmDialog } from '../UI';

interface TabContextMenuProps {
  x: number;
  y: number;
  tab: Tab;
  onClose: () => void;
}

export function TabContextMenu({ x, y, tab, onClose }: TabContextMenuProps) {
  const { t } = useTranslation();
  const { tabs, removeTab, toggleLock, duplicateTab } = useTabStore();
  const menuRef = useRef<HTMLDivElement>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const canDelete = tabs.length > 1;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        if (!showDeleteDialog) onClose();
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !showDeleteDialog) onClose();
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [onClose, showDeleteDialog]);

  const itemClass = 'w-full px-3 py-1.5 text-left text-sm transition-colors';
  const enabledClass = `${itemClass} text-[var(--color-text)] hover:bg-[var(--color-surface-light)]`;
  const disabledClass = `${itemClass} text-[var(--color-text-muted)]/40 cursor-not-allowed`;

  return (
    <>
      <div
        ref={menuRef}
        className="fixed bg-[var(--color-surface)] border border-[var(--color-surface-light)] rounded-lg shadow-xl py-1 z-[100] min-w-[160px]"
        style={{ left: x, top: y }}
      >
        <button
          onClick={() => { toggleLock(tab.id); onClose(); }}
          className={enabledClass}
        >
          {tab.isLocked ? t('tabs.contextMenu.unlock') : t('tabs.contextMenu.lock')}
        </button>
        <button
          onClick={() => { duplicateTab(tab.id); onClose(); }}
          className={enabledClass}
        >
          {t('tabs.contextMenu.duplicateToEdit')}
        </button>
        <hr className="my-1 border-[var(--color-surface-light)]" />
        <button
          onClick={() => { if (canDelete) setShowDeleteDialog(true); }}
          className={canDelete ? `${itemClass} text-red-400 hover:bg-[var(--color-surface-light)]` : disabledClass}
          disabled={!canDelete}
        >
          {t('tabs.contextMenu.delete')}
        </button>
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title={t('dialog.deleteTabConfirm.title')}
        message={t('dialog.deleteTabConfirm.message')}
        confirmLabel={t('dialog.deleteTabConfirm.confirm')}
        cancelLabel={t('dialog.deleteTabConfirm.cancel')}
        onConfirm={() => { removeTab(tab.id); onClose(); }}
        onCancel={() => setShowDeleteDialog(false)}
        variant="danger"
      />
    </>
  );
}
