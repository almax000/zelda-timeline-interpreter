import { useState, useEffect } from 'react';
import { isInputFocused } from '../utils/dom';

export function useCanvasModifiers() {
  const [spaceHeld, setSpaceHeld] = useState(false);
  const [shiftHeld, setShiftHeld] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isInputFocused()) {
        e.preventDefault();
        setSpaceHeld(true);
      }
      if (e.key === 'Shift') {
        setShiftHeld(true);
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === 'Space') setSpaceHeld(false);
      if (e.key === 'Shift') setShiftHeld(false);
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  return { spaceHeld, shiftHeld };
}
