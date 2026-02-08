import { useEffect } from 'react';
import { getCanvasStore } from '../stores/canvasRegistry';
import { useTabStore } from '../stores/tabStore';

export function useUndoRedoShortcuts() {
  const activeTabId = useTabStore((state) => state.activeTabId);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        const store = getCanvasStore(activeTabId);
        const { undo, redo } = store.temporal.getState();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeTabId]);
}
