import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTabStore, type Tab } from '../../stores/tabStore';

interface TabContextMenuProps {
  x: number;
  y: number;
  tab: Tab;
  onClose: () => void;
}

export function TabContextMenu({ x, y, tab, onClose }: TabContextMenuProps) {
  const { t } = useTranslation();
  const { tabs, removeTab, renameTab, toggleLock, duplicateTab } = useTabStore();
  const menuRef = useRef<HTMLDivElement>(null);
  const [renaming, setRenaming] = useState(false);
  const [nameInput, setNameInput] = useState(tab.name);

  const canDelete = tabs.length > 1;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const handleRename = () => {
    const trimmed = nameInput.trim();
    if (trimmed && trimmed !== tab.name) {
      renameTab(tab.id, trimmed);
    }
    onClose();
  };

  const itemClass = 'w-full px-3 py-1.5 text-left text-sm transition-colors';
  const enabledClass = `${itemClass} text-[var(--color-text)] hover:bg-[var(--color-surface-light)]`;
  const disabledClass = `${itemClass} text-[var(--color-text-muted)]/40 cursor-not-allowed`;

  return (
    <div
      ref={menuRef}
      className="fixed bg-[var(--color-surface)] border border-[var(--color-surface-light)] rounded-lg shadow-xl py-1 z-[100] min-w-[160px]"
      style={{ left: x, top: y }}
    >
      {renaming ? (
        <div className="px-3 py-1.5">
          <input
            autoFocus
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') onClose();
            }}
            onBlur={handleRename}
            className="w-full px-2 py-1 text-sm bg-[var(--color-background)] border border-[var(--color-surface-light)] rounded text-[var(--color-text)] focus:outline-none focus:border-[var(--color-gold)]"
          />
        </div>
      ) : (
        <>
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
          <button
            onClick={() => setRenaming(true)}
            className={enabledClass}
          >
            {t('tabs.contextMenu.rename')}
          </button>
          <hr className="my-1 border-[var(--color-surface-light)]" />
          <button
            onClick={() => { if (canDelete) { removeTab(tab.id); onClose(); } }}
            className={canDelete ? `${itemClass} text-red-400 hover:bg-[var(--color-surface-light)]` : disabledClass}
            disabled={!canDelete}
          >
            {t('tabs.contextMenu.delete')}
          </button>
        </>
      )}
    </div>
  );
}
