import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getCanvasStore } from '../../stores/canvasRegistry';
import { useTabStore } from '../../stores/tabStore';
import { useAnnotationStore } from '../../stores/annotationStore';
import { useUIStore } from '../../stores/uiStore';
import { ConfirmDialog } from '../UI/ConfirmDialog';
import { ToolbarPopover } from './ToolbarPopover';

const PEN_COLORS = ['#EF4444', '#F97316', '#EAB308', '#22C55E'];
const MORE_COLORS = ['#3B82F6', '#A855F7', '#EC4899', '#F8FAFC'];
const WIDTHS = [2, 4, 6, 8];

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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20V10" />
      <circle cx="12" cy="6" r="2" />
      <path d="M4 20h16" />
    </svg>
  );
}

function IconSplit() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v6" />
      <path d="M12 15v6" />
      <path d="M6 15l6-6 6 6" />
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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v4" />
      <path d="m4.93 4.93 2.83 2.83" />
      <path d="M2 12h4" />
      <path d="m4.93 19.07 2.83-2.83" />
      <path d="M12 18v4" />
      <path d="m16.24 16.24 2.83 2.83" />
      <path d="M18 12h4" />
      <path d="m16.24 7.76 2.83-2.83" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconClearStrokes() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
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

function IconChevron() {
  return (
    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-[var(--color-surface-light)] mx-0.5" />;
}

// --- Main component ---

type PopoverName = 'draw' | 'branch' | null;

export function FloatingToolbar() {
  const { t } = useTranslation();
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [openPopover, setOpenPopover] = useState<PopoverName>(null);

  const activeTabId = useTabStore((s) => s.activeTabId);
  const activeTab = useTabStore((s) => s.tabs.find((tab) => tab.id === s.activeTabId));
  const toggleLock = useTabStore((s) => s.toggleLock);
  const isLocked = activeTab?.isLocked ?? false;

  const store = getCanvasStore(activeTabId);
  const clearTimeline = store((s) => s.clearTimeline);
  const selectedBranchType = store((s) => s.selectedBranchType);
  const setSelectedBranchType = store((s) => s.setSelectedBranchType);

  const {
    isAnnotationMode, tool, color, strokeWidth,
    setAnnotationMode, setTool, setColor, setStrokeWidth,
    clearStrokes,
  } = useAnnotationStore();

  const { activeTool, setActiveTool, resetTool } = useUIStore();

  const { undo, redo, pastStates, futureStates } = store.temporal.getState();
  const canUndo = pastStates.length > 0;
  const canRedo = futureStates.length > 0;
  const hasStrokes = useAnnotationStore((s) => (s.strokes.get(activeTabId)?.length ?? 0) > 0);

  const togglePopover = useCallback((name: PopoverName) => {
    setOpenPopover((prev) => (prev === name ? null : name));
  }, []);

  const closePopover = useCallback(() => setOpenPopover(null), []);

  const handleClear = () => {
    clearTimeline();
    setShowClearDialog(false);
  };

  const handleSelectTool = () => {
    resetTool();
    setAnnotationMode(false);
    closePopover();
  };

  const handleAnnotateTool = () => {
    setActiveTool('annotate');
    setAnnotationMode(false);
    closePopover();
  };

  const handleSplitTool = () => {
    setActiveTool('split');
    setAnnotationMode(false);
    closePopover();
  };

  const handleTextTool = () => {
    setActiveTool('text');
    setAnnotationMode(false);
    closePopover();
  };

  const handlePenClick = (penColor: string) => {
    if (isAnnotationMode && tool === 'pen' && color === penColor) {
      setAnnotationMode(false);
      resetTool();
    } else {
      setAnnotationMode(true);
      setTool('pen');
      setColor(penColor);
      setActiveTool('pen');
    }
    closePopover();
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
    closePopover();
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
    closePopover();
  };

  const handleBranchSelect = (type: 'main' | 'fallen' | 'child' | 'adult') => {
    setSelectedBranchType(type);
    closePopover();
  };

  const branchTypes = [
    { type: 'main' as const, color: 'var(--color-branch-main)' },
    { type: 'fallen' as const, color: 'var(--color-branch-fallen)' },
    { type: 'child' as const, color: 'var(--color-branch-child)' },
    { type: 'adult' as const, color: 'var(--color-branch-adult)' },
  ];

  const btn = 'w-[30px] h-[30px] flex items-center justify-center rounded-md transition-colors';
  const btnMuted = `${btn} text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-light)]`;
  const btnActive = `${btn} bg-[var(--color-gold)]/15 text-[var(--color-gold)]`;
  const btnDisabled = `${btn} text-[var(--color-text-muted)]/30 cursor-not-allowed`;

  const disabledClass = isLocked ? 'opacity-40 pointer-events-none' : '';

  // Current branch color for indicator
  const currentBranchColor = branchTypes.find((b) => b.type === selectedBranchType)?.color ?? 'var(--color-branch-main)';

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

        {/* === Mode buttons (disabled when locked) === */}
        <div className={`flex items-center gap-0.5 ${disabledClass}`}>
          {/* Select */}
          <button
            onClick={handleSelectTool}
            className={activeTool === 'select' && !isAnnotationMode ? btnActive : btnMuted}
            title={t('toolbar.select')}
            data-testid="toolbar-select"
          >
            <IconCursor />
          </button>

          {/* Annotate */}
          <button
            onClick={handleAnnotateTool}
            className={activeTool === 'annotate' ? btnActive : btnMuted}
            title={t('toolbar.annotate')}
            data-testid="toolbar-annotate"
          >
            <IconAnnotate />
          </button>
        </div>

        <Divider />

        {/* === Placement tools (disabled when locked) === */}
        <div className={`flex items-center gap-0.5 ${disabledClass}`}>
          {/* Split */}
          <button
            onClick={handleSplitTool}
            className={activeTool === 'split' ? btnActive : btnMuted}
            title={t('toolbar.split')}
            data-testid="toolbar-split"
          >
            <IconSplit />
          </button>

          {/* Text */}
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

        {/* === Draw/Eraser/Laser group (disabled when locked) === */}
        <div className={`flex items-center gap-0.5 ${disabledClass}`}>
          {/* Draw popover */}
          <ToolbarPopover
            isOpen={openPopover === 'draw'}
            onToggle={() => togglePopover('draw')}
            onClose={closePopover}
            trigger={
              <button
                className={`${activeTool === 'pen' ? btnActive : btnMuted} relative`}
                title={t('toolbar.draw')}
                data-testid="toolbar-draw"
              >
                <PenIcon color={isAnnotationMode && tool === 'pen' ? color : 'currentColor'} />
                {isAnnotationMode && tool === 'pen' && (
                  <span className="absolute bottom-0.5 left-1.5 right-1.5 h-0.5 rounded-full" style={{ backgroundColor: color }} />
                )}
                <IconChevron />
              </button>
            }
          >
            <div className="flex flex-col gap-1">
              {/* Color rows */}
              <div className="flex gap-0.5">
                {PEN_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => handlePenClick(c)}
                    className={`${btn} relative hover:bg-[var(--color-surface-light)]`}
                    title="Pen"
                  >
                    <PenIcon color={c} />
                    {isAnnotationMode && tool === 'pen' && color === c && (
                      <span className="absolute bottom-0.5 left-1.5 right-1.5 h-0.5 rounded-full" style={{ backgroundColor: c }} />
                    )}
                  </button>
                ))}
              </div>
              <div className="flex gap-0.5">
                {MORE_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => handlePenClick(c)}
                    className={`${btn} relative hover:bg-[var(--color-surface-light)]`}
                    title="Pen"
                  >
                    <PenIcon color={c} />
                    {isAnnotationMode && tool === 'pen' && color === c && (
                      <span className="absolute bottom-0.5 left-1.5 right-1.5 h-0.5 rounded-full" style={{ backgroundColor: c }} />
                    )}
                  </button>
                ))}
              </div>
              {/* Width selector */}
              <div className="flex gap-0.5 border-t border-[var(--color-surface-light)] pt-1">
                {WIDTHS.map((w) => (
                  <button
                    key={w}
                    onClick={() => setStrokeWidth(w)}
                    className={`${btn} ${strokeWidth === w ? 'bg-[var(--color-surface-light)]' : 'hover:bg-[var(--color-surface-light)]'}`}
                    title={`${w}px`}
                  >
                    <span className="rounded-full bg-[var(--color-text)]/60" style={{ width: w + 2, height: w + 2 }} />
                  </button>
                ))}
              </div>
              {/* Clear strokes */}
              {hasStrokes && (
                <div className="flex gap-0.5 border-t border-[var(--color-surface-light)] pt-1">
                  <button
                    onClick={() => clearStrokes(activeTabId)}
                    className={`${btn} text-red-400 hover:bg-[var(--color-surface-light)]`}
                    title="Clear strokes"
                  >
                    <IconClearStrokes />
                  </button>
                </div>
              )}
            </div>
          </ToolbarPopover>

          {/* Eraser — standalone */}
          <button
            onClick={handleEraserClick}
            className={activeTool === 'eraser' ? btnActive : btnMuted}
            title={t('toolbar.eraser')}
            data-testid="toolbar-eraser"
          >
            <IconEraser />
          </button>

          {/* Laser — standalone */}
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

        {/* === Branch popover (disabled when locked) === */}
        <div className={`flex items-center gap-0.5 ${disabledClass}`}>
          <ToolbarPopover
            isOpen={openPopover === 'branch'}
            onToggle={() => togglePopover('branch')}
            onClose={closePopover}
            trigger={
              <button
                className={`${btnMuted} relative`}
                title={t('toolbar.branch')}
                data-testid="toolbar-branch"
              >
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: currentBranchColor }}
                />
                <IconChevron />
              </button>
            }
          >
            {branchTypes.map(({ type, color: c }) => (
              <button
                key={type}
                onClick={() => handleBranchSelect(type)}
                className={`${btn} hover:bg-[var(--color-surface-light)]`}
                title={t(`branch.${type}`)}
              >
                <span
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: c,
                    boxShadow: selectedBranchType === type ? `0 0 0 2px var(--color-surface), 0 0 0 3px ${c}` : 'none',
                  }}
                />
              </button>
            ))}
          </ToolbarPopover>
        </div>

        <Divider />

        {/* === Actions (disabled when locked) === */}
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
