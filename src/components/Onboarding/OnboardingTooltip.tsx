import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

type ArrowDirection = 'top' | 'bottom' | 'left' | 'right';

interface OnboardingTooltipProps {
  anchorSelector: string;
  arrowDirection: ArrowDirection;
  textKey: string;
  onDismiss: () => void;
}

const ARROW_SIZE = 6;
const GAP = 8;

function getPosition(
  rect: DOMRect,
  tipW: number,
  tipH: number,
  arrow: ArrowDirection,
) {
  let x = 0;
  let y = 0;

  switch (arrow) {
    case 'top':
      x = rect.left + rect.width / 2 - tipW / 2;
      y = rect.bottom + GAP + ARROW_SIZE;
      break;
    case 'bottom':
      x = rect.left + rect.width / 2 - tipW / 2;
      y = rect.top - tipH - GAP - ARROW_SIZE;
      break;
    case 'left':
      x = rect.right + GAP + ARROW_SIZE;
      y = rect.top + rect.height / 2 - tipH / 2;
      break;
    case 'right':
      x = rect.left - tipW - GAP - ARROW_SIZE;
      y = rect.top + rect.height / 2 - tipH / 2;
      break;
  }

  // Clamp to viewport
  const pad = 8;
  x = Math.max(pad, Math.min(x, window.innerWidth - tipW - pad));
  y = Math.max(pad, Math.min(y, window.innerHeight - tipH - pad));

  return { x, y };
}

function arrowStyle(dir: ArrowDirection): React.CSSProperties {
  const base: React.CSSProperties = {
    position: 'absolute',
    width: ARROW_SIZE * 2,
    height: ARROW_SIZE * 2,
    background: 'var(--color-surface)',
    borderColor: 'color-mix(in srgb, var(--color-gold) 40%, transparent)',
    transform: 'rotate(45deg)',
  };

  switch (dir) {
    case 'top':
      return { ...base, top: -ARROW_SIZE, left: '50%', marginLeft: -ARROW_SIZE, borderTop: '1px solid', borderLeft: '1px solid' };
    case 'bottom':
      return { ...base, bottom: -ARROW_SIZE, left: '50%', marginLeft: -ARROW_SIZE, borderBottom: '1px solid', borderRight: '1px solid' };
    case 'left':
      return { ...base, left: -ARROW_SIZE, top: '50%', marginTop: -ARROW_SIZE, borderLeft: '1px solid', borderBottom: '1px solid' };
    case 'right':
      return { ...base, right: -ARROW_SIZE, top: '50%', marginTop: -ARROW_SIZE, borderRight: '1px solid', borderTop: '1px solid' };
  }
}

export function OnboardingTooltip({ anchorSelector, arrowDirection, textKey, onDismiss }: OnboardingTooltipProps) {
  const { t } = useTranslation();
  const tipRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [visible, setVisible] = useState(false);

  const reposition = useCallback(() => {
    const anchor = document.querySelector(anchorSelector);
    const tip = tipRef.current;
    if (!anchor || !tip) return;
    const rect = anchor.getBoundingClientRect();
    const tipW = tip.offsetWidth;
    const tipH = tip.offsetHeight;
    setPos(getPosition(rect, tipW, tipH, arrowDirection));
  }, [anchorSelector, arrowDirection]);

  useEffect(() => {
    // Initial position after mount
    requestAnimationFrame(() => {
      reposition();
      setVisible(true);
    });

    const anchor = document.querySelector(anchorSelector);
    if (!anchor) return;

    const ro = new ResizeObserver(reposition);
    ro.observe(anchor);

    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
    };
  }, [anchorSelector, reposition]);

  return createPortal(
    <div
      ref={tipRef}
      className="fixed z-[200] max-w-[240px] transition-opacity duration-200"
      style={{
        left: pos?.x ?? -9999,
        top: pos?.y ?? -9999,
        opacity: visible && pos ? 1 : 0,
      }}
    >
      <div className="relative bg-[var(--color-surface)] border border-[var(--color-gold)]/40 shadow-xl rounded-lg p-3">
        <div style={arrowStyle(arrowDirection)} />
        <p className="text-xs text-[var(--color-text-muted)] leading-relaxed mb-2">
          {t(textKey)}
        </p>
        <button
          onClick={onDismiss}
          className="text-xs font-medium text-[var(--color-gold)] hover:text-[var(--color-text)] transition-colors"
        >
          {t('hints.dismiss')}
        </button>
      </div>
    </div>,
    document.body,
  );
}
