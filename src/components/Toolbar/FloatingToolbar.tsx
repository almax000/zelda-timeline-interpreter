import { useState } from 'react';
import { useStore } from 'zustand';
import { useTranslation } from 'react-i18next';
import { getCanvasStore } from '../../stores/canvasRegistry';
import { useTabStore } from '../../stores/tabStore';
import { useAnnotationStore } from '../../stores/annotationStore';
import { useUIStore } from '../../stores/uiStore';
import { ConfirmDialog } from '../UI/ConfirmDialog';

// --- Icons ---

function IconLock() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function IconUnlock() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
  );
}

function IconCursor() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
      <path d="m13 13 6 6" />
    </svg>
  );
}

function IconAnnotate() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="shrink-0">
      <path d="M8 1 L15 8 L8 15 L1 8 Z" fill="var(--color-surface)" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M8 4 L12 8 L8 12 L4 8 Z" fill="currentColor"/>
    </svg>
  );
}

function IconSplit() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="14" rx="1" />
      <path d="M3 5L6 5L3 8Z" fill="currentColor" opacity="0.5" stroke="none" />
      <path d="M21 5L18 5L21 8Z" fill="currentColor" opacity="0.5" stroke="none" />
      <path d="M3 19L6 19L3 16Z" fill="currentColor" opacity="0.5" stroke="none" />
      <path d="M21 19L18 19L21 16Z" fill="currentColor" opacity="0.5" stroke="none" />
    </svg>
  );
}

function IconText() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 7 4 4 20 4 20 7" />
      <line x1="9" y1="20" x2="15" y2="20" />
      <line x1="12" y1="4" x2="12" y2="20" />
    </svg>
  );
}

function IconUndo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
    </svg>
  );
}

function IconRedo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 7v6h-6" />
      <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

function IconEraser() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
      <path d="M22 21H7" />
      <path d="m5 11 9 9" />
    </svg>
  );
}

function IconLaser() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"
        stroke="currentColor" />
      <circle cx="19.5" cy="4.5" r="2" fill="#ADFF2F" stroke="none" />
      <circle cx="19.5" cy="4.5" r="4" fill="#ADFF2F" opacity="0.3" stroke="none" />
    </svg>
  );
}

function PenIcon({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-[var(--color-surface-light)] mx-0.5" />;
}

// --- Main component ---

export function FloatingToolbar() {
  const { t } = useTranslation();
  const [showClearDialog, setShowClearDialog] = useState(false);

  const activeTabId = useTabStore((s) => s.activeTabId);
  const activeTab = useTabStore((s) => s.tabs.find((tab) => tab.id === s.activeTabId));
  const toggleLock = useTabStore((s) => s.toggleLock);
  const isLocked = activeTab?.isLocked ?? false;

  const store = getCanvasStore(activeTabId);
  const clearTimeline = store((s) => s.clearTimeline);

  const {
    isAnnotationMode, tool, color,
    setAnnotationMode, setTool, setColor,
  } = useAnnotationStore();

  const { activeTool, setActiveTool, resetTool } = useUIStore();

  const undo = useStore(store.temporal, (s) => s.undo);
  const redo = useStore(store.temporal, (s) => s.redo);
  const canUndo = useStore(store.temporal, (s) => s.pastStates.length > 0);
  const canRedo = useStore(store.temporal, (s) => s.futureStates.length > 0);

  const handleClear = () => {
    clearTimeline();
    setShowClearDialog(false);
  };

  const handleSelectTool = () => {
    resetTool();
    setAnnotationMode(false);
  };

  const handleAnnotateTool = () => {
    setActiveTool('annotate');
    setAnnotationMode(false);
  };

  const handleSplitTool = () => {
    setActiveTool('split');
    setAnnotationMode(false);
  };

  const handleTextTool = () => {
    setActiveTool('text');
    setAnnotationMode(false);
  };

  const handlePenToggle = () => {
    if (activeTool === 'pen') {
      setAnnotationMode(false);
      resetTool();
    } else {
      setAnnotationMode(true);
      setTool('pen');
      setColor(color || '#EF4444');
      setActiveTool('pen');
    }
  };

  const handleEraserClick = () => {
    if (isAnnotationMode && tool === 'eraser') {
      setAnnotationMode(false);
      resetTool();
    } else {
      setAnnotationMode(true);
      setTool('eraser');
      setActiveTool('eraser');
    }
  };

  const handleLaserClick = () => {
    if (isAnnotationMode && tool === 'laser') {
      setAnnotationMode(false);
      resetTool();
    } else {
      setAnnotationMode(true);
      setTool('laser');
      setActiveTool('laser');
    }
  };

  const btn = 'w-[30px] h-[30px] flex items-center justify-center rounded-md transition-colors';
  const btnMuted = `${btn} text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-light)]`;
  const btnActive = `${btn} bg-[var(--color-gold)]/15 text-[var(--color-gold)]`;
  const btnDisabled = `${btn} text-[var(--color-text-muted)]/30 cursor-not-allowed`;

  const disabledClass = isLocked ? 'opacity-40 pointer-events-none' : '';

  return (
    <>
      <div className="pointer-events-auto flex items-center gap-0.5 px-2 py-1.5 bg-[var(--color-surface)]/90 backdrop-blur-sm rounded-xl shadow-xl border border-[var(--color-surface-light)]">
        {/* Lock toggle — always clickable */}
        <button
          onClick={() => toggleLock(activeTabId)}
          className={isLocked
            ? `${btn} text-[var(--color-gold)] bg-[var(--color-gold)]/15`
            : btnMuted
          }
          title={isLocked ? t('tabs.contextMenu.unlock') : t('tabs.contextMenu.lock')}
          data-testid="toolbar-lock"
        >
          {isLocked ? <IconLock /> : <IconUnlock />}
        </button>

        <Divider />

        {/* === Mode + Placement tools (Select, Annotate, Split, Text) === */}
        <div className={`flex items-center gap-0.5 ${disabledClass}`}>
          <button
            onClick={handleSelectTool}
            className={activeTool === 'select' && !isAnnotationMode ? btnActive : btnMuted}
            title={t('toolbar.select')}
            data-testid="toolbar-select"
          >
            <IconCursor />
          </button>

          <button
            onClick={handleAnnotateTool}
            className={activeTool === 'annotate' ? btnActive : btnMuted}
            title={t('toolbar.annotate')}
            data-testid="toolbar-annotate"
          >
            <IconAnnotate />
          </button>

          <button
            onClick={handleSplitTool}
            className={activeTool === 'split' ? btnActive : btnMuted}
            title={t('toolbar.split')}
            data-testid="toolbar-split"
          >
            <IconSplit />
          </button>

          <button
            onClick={handleTextTool}
            className={activeTool === 'text' ? btnActive : btnMuted}
            title={t('toolbar.text')}
            data-testid="toolbar-text"
          >
            <IconText />
          </button>
        </div>

        <Divider />

        {/* === Draw/Eraser/Laser group === */}
        <div className={`flex items-center gap-0.5 ${disabledClass}`}>
          {/* Pen toggle */}
          <button
            onClick={handlePenToggle}
            className={`${activeTool === 'pen' ? btnActive : btnMuted} relative`}
            title={t('toolbar.draw')}
            data-testid="toolbar-draw"
          >
            <PenIcon color={isAnnotationMode && tool === 'pen' ? color : 'currentColor'} />
            {isAnnotationMode && tool === 'pen' && (
              <span className="absolute bottom-0.5 left-1.5 right-1.5 h-0.5 rounded-full" style={{ backgroundColor: color }} />
            )}
          </button>

          {/* Eraser */}
          <button
            onClick={handleEraserClick}
            className={activeTool === 'eraser' ? btnActive : btnMuted}
            title={t('toolbar.eraser')}
            data-testid="toolbar-eraser"
          >
            <IconEraser />
          </button>

          {/* Laser */}
          <button
            onClick={handleLaserClick}
            className={`${activeTool === 'laser' ? btnActive : btnMuted} relative`}
            title={t('toolbar.laser')}
            data-testid="toolbar-laser"
          >
            <IconLaser />
            {activeTool === 'laser' && (
              <span className="absolute bottom-0.5 left-1.5 right-1.5 h-0.5 rounded-full" style={{ backgroundColor: '#ADFF2F' }} />
            )}
          </button>
        </div>

        <Divider />

        {/* === Actions === */}
        <div className={`flex items-center gap-0.5 ${disabledClass}`}>
          <button onClick={() => undo()} disabled={!canUndo} className={canUndo ? btnMuted : btnDisabled} title={t('toolbar.undo')}>
            <IconUndo />
          </button>
          <button onClick={() => redo()} disabled={!canRedo} className={canRedo ? btnMuted : btnDisabled} title={t('toolbar.redo')}>
            <IconRedo />
          </button>
          <button
            onClick={() => setShowClearDialog(true)}
            className={`${btn} text-[var(--color-text-muted)] hover:text-red-400 hover:bg-[var(--color-surface-light)]`}
            title={t('toolbar.clear')}
          >
            <IconTrash />
          </button>
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
