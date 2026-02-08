import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getCanvasStore } from '../../stores/canvasRegistry';
import { useTabStore } from '../../stores/tabStore';
import { useAnnotationStore } from '../../stores/annotationStore';
import { ConfirmDialog } from '../UI/ConfirmDialog';

const COLORS = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E',
  '#3B82F6', '#A855F7', '#EC4899', '#F8FAFC',
];

const WIDTHS = [2, 4, 6, 8];

// --- SVG Icons ---
function IconUndo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
    </svg>
  );
}

function IconRedo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 7v6h-6" />
      <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

function IconEraser() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
      <path d="M22 21H7" />
      <path d="m5 11 9 9" />
    </svg>
  );
}

function IconClearStrokes() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  );
}

function PenIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

export function FloatingToolbar() {
  const { t } = useTranslation();
  const [showClearDialog, setShowClearDialog] = useState(false);
  const activeTabId = useTabStore((state) => state.activeTabId);
  const store = getCanvasStore(activeTabId);
  const clearTimeline = store((state) => state.clearTimeline);

  const {
    isAnnotationMode, tool, color, strokeWidth,
    setAnnotationMode, setTool, setColor, setStrokeWidth,
    clearStrokes,
  } = useAnnotationStore();

  const { undo, redo, pastStates, futureStates } = store.temporal.getState();
  const canUndo = pastStates.length > 0;
  const canRedo = futureStates.length > 0;
  const hasStrokes = useAnnotationStore((s) => (s.strokes.get(activeTabId)?.length ?? 0) > 0);

  const handleClear = () => {
    clearTimeline();
    setShowClearDialog(false);
  };

  const handlePenClick = (penColor: string) => {
    if (isAnnotationMode && tool === 'pen' && color === penColor) {
      setAnnotationMode(false);
    } else {
      setAnnotationMode(true);
      setTool('pen');
      setColor(penColor);
    }
  };

  const handleEraserClick = () => {
    if (isAnnotationMode && tool === 'eraser') {
      setAnnotationMode(false);
    } else {
      setAnnotationMode(true);
      setTool('eraser');
    }
  };

  const btnBase = 'w-9 h-9 flex items-center justify-center rounded-lg transition-colors';
  const btnMuted = `${btnBase} text-white/60 hover:text-white hover:bg-white/10`;
  const btnActive = `${btnBase} bg-[var(--color-gold)] text-[var(--color-background)]`;
  const btnDisabled = `${btnBase} text-white/20 cursor-not-allowed`;

  return (
    <>
      <div
        className="fixed top-14 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 px-3 py-1.5 rounded-xl shadow-lg"
        style={{
          backgroundColor: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        {/* Group 1: Undo / Redo / Clear Timeline */}
        <button
          onClick={() => undo()}
          disabled={!canUndo}
          className={canUndo ? btnMuted : btnDisabled}
          title={t('toolbar.undo')}
        >
          <IconUndo />
        </button>
        <button
          onClick={() => redo()}
          disabled={!canRedo}
          className={canRedo ? btnMuted : btnDisabled}
          title={t('toolbar.redo')}
        >
          <IconRedo />
        </button>
        <button
          onClick={() => setShowClearDialog(true)}
          className={`${btnBase} text-white/60 hover:text-red-400 hover:bg-white/10`}
          title={t('toolbar.clear')}
        >
          <IconTrash />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-white/15 mx-1" />

        {/* Group 2: Colored Pens */}
        {COLORS.map((c) => {
          const isActive = isAnnotationMode && tool === 'pen' && color === c;
          return (
            <button
              key={c}
              onClick={() => handlePenClick(c)}
              className={`${btnBase} relative hover:bg-white/10`}
              title={`Pen`}
            >
              <PenIcon color={c} />
              {isActive && (
                <span
                  className="absolute bottom-0.5 left-2 right-2 h-0.5 rounded-full"
                  style={{ backgroundColor: c }}
                />
              )}
            </button>
          );
        })}

        {/* Divider */}
        <div className="w-px h-6 bg-white/15 mx-1" />

        {/* Group 3: Stroke Width */}
        {WIDTHS.map((w) => {
          const isActive = strokeWidth === w;
          return (
            <button
              key={w}
              onClick={() => setStrokeWidth(w)}
              className={`${btnBase} ${isActive ? 'bg-white/20' : 'hover:bg-white/10'}`}
              title={`${w}px`}
            >
              <span
                className="rounded-full bg-white/80"
                style={{ width: w + 4, height: w + 4 }}
              />
            </button>
          );
        })}

        {/* Divider */}
        <div className="w-px h-6 bg-white/15 mx-1" />

        {/* Group 4: Eraser + Clear Strokes */}
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
            className={`${btnBase} text-red-400 hover:bg-white/10`}
            title="Clear strokes"
          >
            <IconClearStrokes />
          </button>
        )}
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
