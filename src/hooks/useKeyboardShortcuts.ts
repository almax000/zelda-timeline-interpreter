import { useEffect } from 'react';
import { getCanvasStore } from '../stores/canvasRegistry';
import { useTabStore } from '../stores/tabStore';
import { useUIStore, type ActiveTool } from '../stores/uiStore';
import { useAnnotationStore } from '../stores/annotationStore';
import { isInputFocused } from '../utils/dom';

const TOOL_KEYS: Record<string, ActiveTool> = {
  v: 'select',
  d: 'annotate',
  b: 'split',
  t: 'text',
  p: 'pen',
  e: 'eraser',
  l: 'laser',
};

const ANNOTATION_TOOLS = new Set<ActiveTool>(['pen', 'eraser', 'laser']);

export function useKeyboardShortcuts() {
  const activeTabId = useTabStore((state) => state.activeTabId);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Modifier shortcuts (Cmd+Z etc.) — always active
      if (e.metaKey || e.ctrlKey) {
        if (e.key === 'z') {
          e.preventDefault();
          const store = getCanvasStore(activeTabId);
          const { undo, redo } = store.temporal.getState();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
          return;
        }
        if (e.key === 'y') {
          e.preventDefault();
          const store = getCanvasStore(activeTabId);
          const { redo } = store.temporal.getState();
          redo();
          return;
        }
        if (e.key === 'd') {
          e.preventDefault();
          const tab = useTabStore.getState().tabs.find((t) => t.id === activeTabId);
          if (tab?.isLocked) return;
          const store = getCanvasStore(activeTabId);
          store.getState().duplicateSelected();
          return;
        }
        return;
      }

      // Single-key shortcuts — skip when typing or editing text
      if (isInputFocused()) return;
      if (useUIStore.getState().editingTextNodeId) return;

      // Skip when canvas is locked
      const tab = useTabStore.getState().tabs.find((t) => t.id === activeTabId);
      if (tab?.isLocked) return;

      const key = e.key.toLowerCase();

      // Escape → reset to select
      if (key === 'escape') {
        useUIStore.getState().resetTool();
        useAnnotationStore.getState().setAnnotationMode(false);
        return;
      }

      const tool = TOOL_KEYS[key];
      if (!tool) return;

      e.preventDefault();

      const { setActiveTool, resetTool } = useUIStore.getState();
      const { setAnnotationMode, setTool } = useAnnotationStore.getState();

      if (tool === 'select') {
        resetTool();
        setAnnotationMode(false);
      } else if (ANNOTATION_TOOLS.has(tool)) {
        setAnnotationMode(true);
        setTool(tool as 'pen' | 'eraser' | 'laser');
        setActiveTool(tool);
      } else {
        setActiveTool(tool);
        setAnnotationMode(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [activeTabId]);
}
