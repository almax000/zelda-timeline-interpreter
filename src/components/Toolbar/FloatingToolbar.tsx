import { useState } from 'react';
import { useStore } from 'zustand';
import { useTranslation } from 'react-i18next';
import { getCanvasStore } from '../../stores/canvasRegistry';
import { useTabStore } from '../../stores/tabStore';
import { useAnnotationStore } from '../../stores/annotationStore';
import { useUIStore } from '../../stores/uiStore';
import { ConfirmDialog } from '../UI/ConfirmDialog';
import { Tooltip } from '../UI/Tooltip';
import {
  IconLock, IconUnlock, IconCursor, IconAnnotate, IconSplit, IconText,
  IconUndo, IconRedo, IconTrash, IconEraser, IconLaser, IconGrid, PenIcon, Divider,
} from './icons';
import { useSettingsStore } from '../../stores/settingsStore';

const isMac = navigator.platform.toUpperCase().includes('MAC');
const mod = isMac ? '\u2318' : 'Ctrl+';

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

  const { activeTool, setActiveTool, resetTool, isHelpOpen, toggleHelp } = useUIStore();
  const snapToGrid = useSettingsStore((s) => s.snapToGrid);
  const setSnapToGrid = useSettingsStore((s) => s.setSnapToGrid);

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
      <div data-onboarding="toolbar" className="pointer-events-auto flex items-center gap-0.5 px-2 py-1.5 bg-[var(--color-surface)]/90 backdrop-blur-sm rounded-xl shadow-xl border border-[var(--color-surface-light)]">
        {/* Lock toggle — always clickable */}
        <Tooltip label={isLocked ? t('tabs.contextMenu.unlock') : t('tabs.contextMenu.lock')}>
          <button
            onClick={() => toggleLock(activeTabId)}
            className={isLocked
              ? `${btn} text-[var(--color-gold)] bg-[var(--color-gold)]/15`
              : btnMuted
            }
            data-testid="toolbar-lock"
          >
            {isLocked ? <IconLock /> : <IconUnlock />}
          </button>
        </Tooltip>

        {/* Snap to grid toggle */}
        <Tooltip label={t('settings.snapToGrid')} shortcut="G">
          <button
            onClick={() => setSnapToGrid(!snapToGrid)}
            className={snapToGrid ? btnActive : btnMuted}
            data-testid="toolbar-grid"
          >
            <IconGrid />
          </button>
        </Tooltip>

        <Divider />

        {/* === Mode + Placement tools (Select, Annotate, Split, Text) === */}
        <div className={`flex items-center gap-0.5 ${disabledClass}`}>
          <Tooltip label={t('toolbar.select')} shortcut="V">
            <button
              onClick={handleSelectTool}
              className={activeTool === 'select' && !isAnnotationMode ? btnActive : btnMuted}
              data-testid="toolbar-select"
            >
              <IconCursor />
            </button>
          </Tooltip>

          <Tooltip label={t('toolbar.annotate')} shortcut="D">
            <button
              onClick={handleAnnotateTool}
              className={activeTool === 'annotate' ? btnActive : btnMuted}
              data-testid="toolbar-annotate"
            >
              <IconAnnotate />
            </button>
          </Tooltip>

          <Tooltip label={t('toolbar.split')} shortcut="B">
            <button
              onClick={handleSplitTool}
              className={activeTool === 'split' ? btnActive : btnMuted}
              data-testid="toolbar-split"
            >
              <IconSplit />
            </button>
          </Tooltip>

          <Tooltip label={t('toolbar.text')} shortcut="T">
            <button
              onClick={handleTextTool}
              className={activeTool === 'text' ? btnActive : btnMuted}
              data-testid="toolbar-text"
            >
              <IconText />
            </button>
          </Tooltip>
        </div>

        <Divider />

        {/* === Draw/Eraser/Laser group === */}
        <div className={`flex items-center gap-0.5 ${disabledClass}`}>
          {/* Pen toggle */}
          <Tooltip label={t('toolbar.draw')} shortcut="P">
            <button
              onClick={handlePenToggle}
              className={`${activeTool === 'pen' ? btnActive : btnMuted} relative`}
              data-testid="toolbar-draw"
            >
              <PenIcon color={isAnnotationMode && tool === 'pen' ? color : 'currentColor'} />
              {isAnnotationMode && tool === 'pen' && (
                <span className="absolute bottom-0.5 left-1.5 right-1.5 h-0.5 rounded-full" style={{ backgroundColor: color }} />
              )}
            </button>
          </Tooltip>

          {/* Eraser */}
          <Tooltip label={t('toolbar.eraser')} shortcut="E">
            <button
              onClick={handleEraserClick}
              className={activeTool === 'eraser' ? btnActive : btnMuted}
              data-testid="toolbar-eraser"
            >
              <IconEraser />
            </button>
          </Tooltip>

          {/* Laser */}
          <Tooltip label={t('toolbar.laser')} shortcut="L">
            <button
              onClick={handleLaserClick}
              className={`${activeTool === 'laser' ? btnActive : btnMuted} relative`}
              data-testid="toolbar-laser"
            >
              <IconLaser />
              {activeTool === 'laser' && (
                <span className="absolute bottom-0.5 left-1.5 right-1.5 h-0.5 rounded-full" style={{ backgroundColor: '#ADFF2F' }} />
              )}
            </button>
          </Tooltip>
        </div>

        <Divider />

        {/* === Actions === */}
        <div className={`flex items-center gap-0.5 ${disabledClass}`}>
          <Tooltip label={t('toolbar.undo')} shortcut={`${mod}Z`}>
            <button onClick={() => undo()} disabled={!canUndo} className={canUndo ? btnMuted : btnDisabled}>
              <IconUndo />
            </button>
          </Tooltip>
          <Tooltip label={t('toolbar.redo')} shortcut={`${mod}\u21e7Z`}>
            <button onClick={() => redo()} disabled={!canRedo} className={canRedo ? btnMuted : btnDisabled}>
              <IconRedo />
            </button>
          </Tooltip>
          <Tooltip label={t('toolbar.clear')}>
            <button
              onClick={() => setShowClearDialog(true)}
              className={`${btn} text-[var(--color-text-muted)] hover:text-red-400 hover:bg-[var(--color-surface-light)]`}
              data-testid="toolbar-clear"
            >
              <IconTrash />
            </button>
          </Tooltip>
        </div>

        <Divider />

        {/* === Help === */}
        <Tooltip label={t('help.title')} shortcut="H">
          <button
            onClick={toggleHelp}
            className={isHelpOpen ? btnActive : btnMuted}
            data-testid="toolbar-help"
          >
            <span className="text-sm font-bold leading-none">?</span>
          </button>
        </Tooltip>
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
