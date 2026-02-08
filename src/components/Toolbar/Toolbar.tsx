import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BranchSelector } from './BranchSelector';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ExportMenu } from './ExportMenu';
import { getCanvasStore } from '../../stores/canvasRegistry';
import { useTabStore } from '../../stores/tabStore';
import { useAnnotationStore } from '../../stores/annotationStore';
import { ConfirmDialog } from '../UI/ConfirmDialog';

const COLORS = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E',
  '#3B82F6', '#A855F7', '#EC4899', '#F8FAFC',
];

// --- SVG Icons (Lucide-style, 20×20, stroke=currentColor, strokeWidth=2) ---
function IconPencil() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
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
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
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

export function Toolbar() {
  const { t } = useTranslation();
  const [showClearDialog, setShowClearDialog] = useState(false);
  const { tabs, activeTabId, addTab, removeTab, setActiveTab, renameTab } = useTabStore();
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

  // Tab rename state
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingTabId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingTabId]);

  const handleDoubleClick = (tabId: string, currentName: string) => {
    setEditingTabId(tabId);
    setEditValue(currentName);
  };

  const handleRenameSubmit = () => {
    if (editingTabId && editValue.trim()) {
      renameTab(editingTabId, editValue.trim());
    }
    setEditingTabId(null);
  };

  const handleClear = () => {
    clearTimeline();
    setShowClearDialog(false);
  };

  const handlePenClick = () => {
    if (isAnnotationMode && tool === 'pen') {
      setAnnotationMode(false);
    } else {
      setAnnotationMode(true);
      setTool('pen');
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

  const hasStrokes = useAnnotationStore((s) => (s.strokes.get(activeTabId)?.length ?? 0) > 0);

  const btnBase = 'p-1.5 rounded-lg transition-colors';
  const btnMuted = `${btnBase} text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-light)]`;
  const btnActive = `${btnBase} bg-[var(--color-gold)] text-[var(--color-background)]`;
  const btnDisabled = `${btnBase} text-[var(--color-text-muted)] opacity-30 cursor-not-allowed`;

  return (
    <>
      <div className="h-12 bg-[var(--color-surface)] border-b border-[var(--color-surface-light)] px-3 flex items-center gap-1">
        {/* ===== LEFT: Logo + Tabs ===== */}
        <div className="flex items-center gap-2 min-w-0 shrink-0">
          <h1 className="text-xl tracking-wider text-[var(--color-gold)] shrink-0" style={{ fontFamily: "'Hylia Serif', serif" }}>
            ZTI
          </h1>
          <div className="w-px h-6 bg-[var(--color-surface-light)]" />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-0.5 min-w-0 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              onDoubleClick={() => handleDoubleClick(tab.id, tab.name)}
              className={`
                group flex items-center gap-1 px-2.5 py-1 text-xs rounded-md cursor-pointer transition-colors select-none shrink-0
                ${activeTabId === tab.id
                  ? 'bg-[var(--color-surface-light)] text-[var(--color-gold)] font-medium'
                  : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-light)]/50 hover:text-[var(--color-text)]'
                }
              `}
            >
              {editingTabId === tab.id ? (
                <input
                  ref={inputRef}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={handleRenameSubmit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRenameSubmit();
                    if (e.key === 'Escape') setEditingTabId(null);
                  }}
                  className="bg-transparent border-b border-[var(--color-gold)] outline-none text-xs w-20 text-[var(--color-text)]"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="truncate max-w-[100px]">{tab.name}</span>
              )}

              {tabs.length > 1 && activeTabId === tab.id && editingTabId !== tab.id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTab(tab.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-[var(--color-text-muted)] hover:text-red-400 transition-opacity text-[10px] leading-none ml-0.5"
                  title="Close tab"
                >
                  ×
                </button>
              )}
            </div>
          ))}

          <button
            onClick={addTab}
            disabled={tabs.length >= 10}
            className="px-1.5 py-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-gold)] hover:bg-[var(--color-surface-light)]/50 rounded-md transition-colors shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
            title="New canvas"
          >
            +
          </button>
        </div>

        {/* Spacer */}
        <div className="flex-1 min-w-2" />

        {/* ===== CENTER-LEFT: Branch + Drawing Tools ===== */}
        <div className="hidden md:flex items-center gap-1.5 shrink-0">
          <BranchSelector />
          <div className="w-px h-6 bg-[var(--color-surface-light)] mx-0.5" />

          {/* Pen */}
          <button
            onClick={handlePenClick}
            className={isAnnotationMode && tool === 'pen' ? btnActive : btnMuted}
            title="Pen"
          >
            <IconPencil />
          </button>

          {/* Eraser */}
          <button
            onClick={handleEraserClick}
            className={isAnnotationMode && tool === 'eraser' ? btnActive : btnMuted}
            title="Eraser"
          >
            <IconEraser />
          </button>

          {/* Colors - show when annotation mode is on */}
          {isAnnotationMode && (
            <>
              <div className="w-px h-5 bg-[var(--color-surface-light)] mx-0.5" />
              <div className="flex gap-0.5">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-4 h-4 rounded-full border-2 transition-all ${
                      color === c ? 'scale-125 border-white' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="w-px h-5 bg-[var(--color-surface-light)] mx-0.5" />
              {/* Width slider */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-[var(--color-text-muted)] w-5 text-right">{strokeWidth}px</span>
                <input
                  type="range"
                  min={1}
                  max={8}
                  value={strokeWidth}
                  onChange={(e) => setStrokeWidth(Number(e.target.value))}
                  className="w-14 h-1 accent-[var(--color-gold)]"
                />
              </div>
            </>
          )}

          {/* Clear strokes */}
          {hasStrokes && (
            <button
              onClick={() => clearStrokes(activeTabId)}
              className={`${btnBase} text-red-400 hover:bg-[var(--color-surface-light)]`}
              title="Clear strokes"
            >
              <IconClearStrokes />
            </button>
          )}
        </div>

        <div className="w-px h-6 bg-[var(--color-surface-light)] mx-1 hidden md:block" />

        {/* ===== CENTER-RIGHT: Undo/Redo + Clear Timeline ===== */}
        <div className="hidden md:flex items-center gap-0.5 shrink-0">
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
          <div className="w-px h-5 bg-[var(--color-surface-light)] mx-0.5" />
          <button
            onClick={() => setShowClearDialog(true)}
            className={`${btnBase} text-[var(--color-text-muted)] hover:text-red-400 hover:bg-[var(--color-surface-light)]`}
            title="Clear timeline"
          >
            <IconTrash />
          </button>
        </div>

        <div className="w-px h-6 bg-[var(--color-surface-light)] mx-1 hidden md:block" />

        {/* ===== RIGHT: Language + Export ===== */}
        <div className="flex items-center gap-2 shrink-0">
          <LanguageSwitcher />
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
