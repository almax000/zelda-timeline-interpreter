import { useState, useRef, useCallback, type ReactNode } from 'react';

interface TooltipProps {
  label: string;
  shortcut?: string;
  children: ReactNode;
}

export function Tooltip({ label, shortcut, children }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const show = useCallback(() => {
    timerRef.current = setTimeout(() => setVisible(true), 300);
  }, []);

  const hide = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
  }, []);

  return (
    <div className="relative" onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {visible && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 pointer-events-none">
          <div className="relative flex items-center gap-1.5 whitespace-nowrap px-2 py-1 rounded-md bg-[var(--color-surface)] border border-[var(--color-surface-light)] shadow-lg text-[11px]">
            {/* Arrow */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-2 h-2 rotate-45 bg-[var(--color-surface)] border-l border-t border-[var(--color-surface-light)]" />
            <span className="text-[var(--color-text)]">{label}</span>
            {shortcut && (
              <kbd className="px-1 py-px rounded bg-[var(--color-surface-light)] text-[var(--color-text-muted)] text-[10px] font-mono leading-none">
                {shortcut}
              </kbd>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
