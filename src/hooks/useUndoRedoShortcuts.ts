import { useEffect } from 'react';
import { useTimelineStore } from '../stores/timelineStore';

export function useUndoRedoShortcuts() {
  const { undo, redo } = useTimelineStore.temporal.getState();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);
}
