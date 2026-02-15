import { useSyncExternalStore } from 'react';

let shiftPressed = false;
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot() {
  return shiftPressed;
}

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Shift' && !shiftPressed) {
      shiftPressed = true;
      listeners.forEach((cb) => cb());
    }
  });
  window.addEventListener('keyup', (e) => {
    if (e.key === 'Shift' && shiftPressed) {
      shiftPressed = false;
      listeners.forEach((cb) => cb());
    }
  });
}

export function useShiftKey(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot);
}

/** Immediate (non-reactive) check for use in callbacks */
export function isShiftHeld(): boolean {
  return shiftPressed;
}
