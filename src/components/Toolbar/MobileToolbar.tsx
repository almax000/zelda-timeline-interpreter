import { useState } from 'react';
import { useStore } from 'zustand';
import { useTranslation } from 'react-i18next';
import { getCanvasStore } from '../../stores/canvasRegistry';
import { useTabStore } from '../../stores/tabStore';
import { useAnnotationStore } from '../../stores/annotationStore';
import { useUIStore } from '../../stores/uiStore';
import { ConfirmDialog } from '../UI/ConfirmDialog';
import {
  IconLock, IconUnlock, IconCursor, IconAnnotate, IconSplit, IconText,
  IconUndo, IconRedo, IconTrash, IconEraser, IconLaser, PenIcon,
} from './icons';

export function MobileToolbar() {
  const { t } = useTranslation();
  const [showMore, setShowMore] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);

  const activeTabId = useTabStore((s) => s.activeTabId);
  const activeTab = useTabStore((s) => s.tabs.find((tab) => tab.id === s.activeTabId));
  const toggleLock = useTabStore((s) => s.toggleLock);
  const isLocked = activeTab?.isLocked ?? false;

  const store = getCanvasStore(activeTabId);
  const clearTimeline = store((s) => s.clearTimeline);

  const { isAnnotationMode, tool, color, setAnnotationMode, setTool, setColor } = useAnnotationStore();
  const { activeTool, setActiveTool, resetTool, isHelpOpen, toggleHelp } = useUIStore();

  const undo = useStore(store.temporal, (s) => s.undo);
  const redo = useStore(store.temporal, (s) => s.redo);
  const canUndo = useStore(store.temporal, (s) => s.pastStates.length > 0);
  const canRedo = useStore(store.temporal, (s) => s.futureStates.length > 0);

  const handleSelectTool = () => { resetTool(); setAnnotationMode(false); setShowMore(false); };
  const handleAnnotateTool = () => { setActiveTool('annotate'); setAnnotationMode(false); setShowMore(false); };
  const handleSplitTool = () => { setActiveTool('split'); setAnnotationMode(false); setShowMore(false); };
  const handleTextTool = () => { setActiveTool('text'); setAnnotationMode(false); setShowMore(false); };

  const handlePenToggle = () => {
    if (activeTool === 'pen') { setAnnotationMode(false); resetTool(); }
    else { setAnnotationMode(true); setTool('pen'); setColor(color || '#EF4444'); setActiveTool('pen'); }
    setShowMore(false);
  };

  const handleEraserClick = () => {
    if (isAnnotationMode && tool === 'eraser') { setAnnotationMode(false); resetTool(); }
    else { setAnnotationMode(true); setTool('eraser'); setActiveTool('eraser'); }
    setShowMore(false);
  };

  const handleLaserClick = () => {
    if (isAnnotationMode && tool === 'laser') { setAnnotationMode(false); resetTool(); }
    else { setAnnotationMode(true); setTool('laser'); setActiveTool('laser'); }
    setShowMore(false);
  };

  const btn = 'w-9 h-9 flex items-center justify-center rounded-lg transition-colors';
  const btnMuted = `${btn} text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-light)]`;
  const btnActive = `${btn} bg-[var(--color-gold)]/15 text-[var(--color-gold)]`;
  const btnDisabled = `${btn} text-[var(--color-text-muted)]/30`;
  const disabledClass = isLocked ? 'opacity-40 pointer-events-none' : '';

  return (
    <>
      <div className="pointer-events-auto flex items-center gap-0.5 px-2 py-1 bg-[var(--color-surface)]/95 backdrop-blur-sm rounded-xl shadow-xl border border-[var(--color-surface-light)]">
        {/* Lock */}
        <button onClick={() => toggleLock(activeTabId)} className={isLocked ? btnActive : btnMuted} data-testid="toolbar-lock">
          {isLocked ? <IconLock /> : <IconUnlock />}
        </button>

        {/* Primary tools */}
        <div className={`flex items-center gap-0.5 ${disabledClass}`}>
          <button onClick={handleSelectTool} className={activeTool === 'select' && !isAnnotationMode ? btnActive : btnMuted} data-testid="toolbar-select">
            <IconCursor />
          </button>
          <button onClick={handlePenToggle} className={activeTool === 'pen' ? btnActive : btnMuted} data-testid="toolbar-draw">
            <PenIcon color={isAnnotationMode && tool === 'pen' ? color : 'currentColor'} />
          </button>
          <button onClick={handleEraserClick} className={activeTool === 'eraser' ? btnActive : btnMuted} data-testid="toolbar-eraser">
            <IconEraser />
          </button>
        </div>

        {/* Undo/Redo */}
        <div className={`flex items-center gap-0.5 ${disabledClass}`}>
          <button onClick={() => undo()} disabled={!canUndo} className={canUndo ? btnMuted : btnDisabled}>
            <IconUndo />
          </button>
          <button onClick={() => redo()} disabled={!canRedo} className={canRedo ? btnMuted : btnDisabled}>
            <IconRedo />
          </button>
        </div>

        {/* More */}
        <div className="relative">
          <button onClick={() => setShowMore(!showMore)} className={showMore ? btnActive : btnMuted} data-testid="toolbar-more">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </button>

          {showMore && (
            <div className="absolute bottom-full mb-2 right-0 flex flex-col gap-0.5 p-1.5 bg-[var(--color-surface)] border border-[var(--color-surface-light)] rounded-xl shadow-xl min-w-[140px]">
              <MoreItem icon={<IconAnnotate />} label={t('toolbar.annotate')} active={activeTool === 'annotate'} onClick={handleAnnotateTool} disabled={isLocked} />
              <MoreItem icon={<IconSplit />} label={t('toolbar.split')} active={activeTool === 'split'} onClick={handleSplitTool} disabled={isLocked} />
              <MoreItem icon={<IconText />} label={t('toolbar.text')} active={activeTool === 'text'} onClick={handleTextTool} disabled={isLocked} />
              <MoreItem icon={<IconLaser />} label={t('toolbar.laser')} active={activeTool === 'laser'} onClick={handleLaserClick} disabled={isLocked} />
              <MoreItem icon={<span className="text-sm font-bold">?</span>} label={t('help.title')} active={isHelpOpen} onClick={() => { toggleHelp(); setShowMore(false); }} />
              <hr className="my-0.5 border-[var(--color-surface-light)]" />
              <MoreItem
                icon={<IconTrash />}
                label={t('toolbar.clear')}
                onClick={() => { setShowClearDialog(true); setShowMore(false); }}
                danger
                disabled={isLocked}
              />
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showClearDialog}
        title={t('dialog.clearConfirm.title')}
        message={t('dialog.clearConfirm.message')}
        confirmLabel={t('dialog.clearConfirm.confirm')}
        cancelLabel={t('dialog.clearConfirm.cancel')}
        onConfirm={() => { clearTimeline(); setShowClearDialog(false); }}
        onCancel={() => setShowClearDialog(false)}
        variant="danger"
      />
    </>
  );
}

function MoreItem({ icon, label, active, onClick, danger, disabled }: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors w-full ${
        disabled ? 'opacity-40 pointer-events-none' :
        danger ? 'text-red-400 hover:bg-red-400/10' :
        active ? 'text-[var(--color-gold)] bg-[var(--color-gold)]/10' :
        'text-[var(--color-text)] hover:bg-[var(--color-surface-light)]'
      }`}
    >
      <span className="w-5 h-5 flex items-center justify-center">{icon}</span>
      {label}
    </button>
  );
}
