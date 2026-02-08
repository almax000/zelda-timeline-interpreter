import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { BranchType } from '../../types/timeline';

const branchOptions: { type: BranchType; color: string }[] = [
  { type: 'main', color: 'var(--color-branch-main)' },
  { type: 'fallen', color: 'var(--color-branch-fallen)' },
  { type: 'child', color: 'var(--color-branch-child)' },
  { type: 'adult', color: 'var(--color-branch-adult)' },
];

interface ContextMenuProps {
  x: number;
  y: number;
  type: 'node' | 'edge' | 'pane';
  edgeBranchType?: BranchType;
  edgeLabel?: string;
  onDelete: () => void;
  onChangeBranch?: (branchType: BranchType) => void;
  onChangeLabel?: (label: string) => void;
  onAddEvent?: () => void;
  onClose: () => void;
}

export function ContextMenu({
  x,
  y,
  type,
  edgeBranchType,
  edgeLabel,
  onDelete,
  onChangeBranch,
  onChangeLabel,
  onAddEvent,
  onClose,
}: ContextMenuProps) {
  const { t } = useTranslation();
  const [editingLabel, setEditingLabel] = useState(false);
  const [labelValue, setLabelValue] = useState(edgeLabel || '');
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingLabel && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingLabel]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleLabelSubmit = () => {
    onChangeLabel?.(labelValue);
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-[var(--color-surface)] border border-[var(--color-surface-light)] rounded-lg shadow-xl py-1 min-w-[180px]"
      style={{ left: x, top: y }}
    >
      {type === 'pane' && (
        <button
          onClick={() => { onAddEvent?.(); onClose(); }}
          className="w-full px-4 py-2 text-left text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-light)] flex items-center gap-2"
        >
          {t('contextMenu.addEvent')}
        </button>
      )}

      {(type === 'node' || type === 'edge') && (
        <button
          onClick={() => { onDelete(); onClose(); }}
          className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-[var(--color-surface-light)] flex items-center gap-2"
        >
          {t('contextMenu.delete')}
        </button>
      )}

      {type === 'edge' && (
        <>
          <hr className="my-1 border-[var(--color-surface-light)]" />
          <div className="px-4 py-2">
            <p className="text-xs text-[var(--color-text-muted)] mb-2">
              {t('contextMenu.changeBranch')}
            </p>
            <div className="flex gap-2">
              {branchOptions.map(({ type: bt, color }) => (
                <button
                  key={bt}
                  onClick={() => { onChangeBranch?.(bt); onClose(); }}
                  className="w-6 h-6 rounded-full border-2 transition-all"
                  style={{
                    backgroundColor: color,
                    borderColor: bt === edgeBranchType ? 'white' : 'transparent',
                    boxShadow: bt === edgeBranchType ? `0 0 8px ${color}` : 'none',
                  }}
                  title={t(`branch.${bt}`)}
                />
              ))}
            </div>
          </div>

          <hr className="my-1 border-[var(--color-surface-light)]" />
          {editingLabel ? (
            <div className="px-4 py-2 flex gap-2">
              <input
                ref={inputRef}
                value={labelValue}
                onChange={(e) => setLabelValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleLabelSubmit();
                  if (e.key === 'Escape') onClose();
                }}
                className="flex-1 bg-[var(--color-background)] border border-[var(--color-surface-light)] rounded px-2 py-1 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)]"
                placeholder="Label..."
              />
              <button
                onClick={handleLabelSubmit}
                className="px-2 py-1 text-xs bg-[var(--color-gold)] text-[var(--color-background)] rounded font-medium"
              >
                OK
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditingLabel(true)}
              className="w-full px-4 py-2 text-left text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-light)]"
            >
              {edgeLabel ? t('contextMenu.editLabel') : t('contextMenu.addLabel')}
            </button>
          )}
        </>
      )}
    </div>
  );
}
