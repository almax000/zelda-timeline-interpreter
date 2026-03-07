import { useEffect } from 'react';
import { useUIStore } from '../stores/uiStore';
import { isInputFocused } from '../utils/dom';

export function useHelpShortcut() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'h' && !e.metaKey && !e.ctrlKey && !isInputFocused()) {
        e.preventDefault();
        useUIStore.getState().toggleHelp();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);
}
