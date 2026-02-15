import { useState, useEffect } from 'react';
import { isInputFocused } from '../utils/dom';

export function useSpacePan() {
  const [spaceHeld, setSpaceHeld] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isInputFocused()) {
        e.preventDefault();
        setSpaceHeld(true);
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === 'Space') setSpaceHeld(false);
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  return spaceHeld;
}
