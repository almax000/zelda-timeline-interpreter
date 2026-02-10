import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getCanvasStore } from '../../stores/canvasRegistry';
import { useTabStore } from '../../stores/tabStore';
import { useAnnotationStore } from '../../stores/annotationStore';
import { useUIStore } from '../../stores/uiStore';
import { ConfirmDialog } from '../UI/ConfirmDialog';

const PEN_COLORS = ['#EF4444', '#F97316', '#EAB308', '#22C55E'];
const MORE_COLORS = ['#3B82F6', '#A855F7', '#EC4899', '#F8FAFC'];
const WIDTHS = [2, 4, 6, 8];

function IconCursor() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
      <path d="m13 13 6 6" />
    </svg>
  );
}

function IconUndo() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
    </svg>
  );
}

function IconRedo() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

function IconRect() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  );
}

function IconCircle() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

function IconArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function IconLine() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20 20 4" />
    </svg>
  );
}

function IconMore() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="6" cy="12" r="1.5" />
      <circle cx="18" cy="12" r="1.5" />
    </svg>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-[var(--color-surface-light)] mx-0.5" />;
}

export function FloatingToolbar() {
  const { t } = useTranslation();
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showMoreColors, setShowMoreColors] = useState(false);
  const activeTabId = useTabStore((s) => s.activeTabId);
  const activeTab = useTabStore((s) => s.tabs.find((tab) => tab.id === s.activeTabId));
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

  const { activeTool, activeShapeTool, setActiveTool, setActiveShapeTool } = useUIStore();

  const { undo, redo, pastStates, futureStates } = store.temporal.getState();
  const canUndo = pastStates.length > 0;
  const canRedo = futureStates.length > 0;
  const hasStrokes = useAnnotationStore((s) => (s.strokes.get(activeTabId)?.length ?? 0) > 0);

  if (isLocked) return null;

  const handleClear = () => {
    clearTimeline();
    setShowClearDialog(false);
  };

  const handleSelectTool = () => {
    setActiveTool('select');
    setAnnotationMode(false);
  };

  const handlePenClick = (penColor: string) => {
    if (isAnnotationMode && tool === 'pen' && color === penColor) {
      setAnnotationMode(false);
      setActiveTool('select');
    } else {
      setAnnotationMode(true);
      setTool('pen');
      setColor(penColor);
      setActiveTool('pen');
    }
  };

  const handleEraserClick = () => {
    if (isAnnotationMode && tool === 'eraser') {
      setAnnotationMode(false);
      setActiveTool('select');
    } else {
      setAnnotationMode(true);
      setTool('eraser');
      setActiveTool('eraser');
    }
  };

  const handleShapeTool = (shape: 'rectangle' | 'circle' | 'arrow' | 'line') => {
    if (activeShapeTool === shape) {
      setActiveShapeTool(null);
    } else {
      setAnnotationMode(false);
      setActiveShapeTool(shape);
    }
  };

  const branchTypes = [
    { type: 'main' as const, color: 'var(--color-branch-main)' },
    { type: 'fallen' as const, color: 'var(--color-branch-fallen)' },
    { type: 'child' as const, color: 'var(--color-branch-child)' },
    { type: 'adult' as const, color: 'var(--color-branch-adult)' },
  ];

  const shapes = [
    { type: 'rectangle' as const, icon: <IconRect />, label: 'Rectangle' },
    { type: 'circle' as const, icon: <IconCircle />, label: 'Circle' },
    { type: 'arrow' as const, icon: <IconArrow />, label: 'Arrow' },
    { type: 'line' as const, icon: <IconLine />, label: 'Line' },
  ];

  const btn = 'w-[30px] h-[30px] flex items-center justify-center rounded-md transition-colors';
  const btnMuted = `${btn} text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-light)]`;
  const btnActive = `${btn} bg-[var(--color-gold)]/15 text-[var(--color-gold)]`;
  const btnDisabled = `${btn} text-[var(--color-text-muted)]/30 cursor-not-allowed`;

  return (
    <>
      <div className="pointer-events-auto flex items-center gap-0.5 px-2 py-1.5 bg-[var(--color-surface)]/90 backdrop-blur-sm rounded-xl shadow-xl border border-[var(--color-surface-light)]">
        {/* Select tool */}
        <button
          onClick={handleSelectTool}
          className={activeTool === 'select' && !isAnnotationMode ? btnActive : btnMuted}
          title={t('toolbar.select')}
        >
          <IconCursor />
        </button>

        <Divider />

        {/* Branch type selector */}
        {branchTypes.map(({ type, color: c }) => (
          <button
            key={type}
            onClick={() => setSelectedBranchType(type)}
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

        <Divider />

        {/* Shape tools */}
        {shapes.map(({ type, icon, label }) => (
          <button
            key={type}
            onClick={() => handleShapeTool(type)}
            className={activeShapeTool === type ? btnActive : btnMuted}
            title={label}
          >
            {icon}
          </button>
        ))}

        <Divider />

        {/* Pen colors */}
        {PEN_COLORS.map((c) => {
          const isActive = isAnnotationMode && tool === 'pen' && color === c;
          return (
            <button
              key={c}
              onClick={() => handlePenClick(c)}
              className={`${btn} relative hover:bg-[var(--color-surface-light)]`}
              title="Pen"
            >
              <PenIcon color={c} />
              {isActive && (
                <span className="absolute bottom-0.5 left-1.5 right-1.5 h-0.5 rounded-full" style={{ backgroundColor: c }} />
              )}
            </button>
          );
        })}

        {/* More colors popover */}
        <div className="relative">
          <button
            onClick={() => setShowMoreColors(!showMoreColors)}
            className={`${btn} text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-light)]`}
            title="More colors"
          >
            <IconMore />
          </button>
          {showMoreColors && (
            <div className="absolute bottom-full left-0 mb-1 flex gap-0.5 p-1.5 bg-[var(--color-surface)] border border-[var(--color-surface-light)] rounded-lg shadow-xl z-50">
              {MORE_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => { handlePenClick(c); setShowMoreColors(false); }}
                  className={`${btn} hover:bg-[var(--color-surface-light)]`}
                >
                  <PenIcon color={c} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Width selector (when pen active) */}
        {isAnnotationMode && tool === 'pen' && (
          <>
            <Divider />
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
          </>
        )}

        <Divider />

        {/* Eraser + Clear strokes */}
        <button
          onClick={handleEraserClick}
          className={isAnnotationMode && tool === 'eraser' ? btnActive : btnMuted}
          title="Eraser"
        >
          <IconEraser />
        </button>
        {hasStrokes && (
          <button
            onClick={() => clearStrokes(activeTabId)}
            className={`${btn} text-red-400 hover:bg-[var(--color-surface-light)]`}
            title="Clear strokes"
          >
            <IconClearStrokes />
          </button>
        )}

        <Divider />

        {/* Undo / Redo / Clear */}
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
