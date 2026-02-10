import { useRef, useEffect, type ReactNode } from 'react';

interface ToolbarPopoverProps {
  trigger: ReactNode;
  children: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export function ToolbarPopover({ trigger, children, isOpen, onToggle, onClose }: ToolbarPopoverProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as HTMLElement)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen, onClose]);

  return (
    <div ref={ref} className="relative">
      <div onClick={onToggle}>{trigger}</div>
      {isOpen && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-1.5 bg-[var(--color-surface)] border border-[var(--color-surface-light)] rounded-lg shadow-xl z-50 flex flex-wrap gap-0.5">
          {children}
        </div>
      )}
    </div>
  );
}
