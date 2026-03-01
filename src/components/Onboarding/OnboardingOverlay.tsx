import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useOnboarding } from '../../hooks/useOnboarding';
import { OnboardingTooltip } from './OnboardingTooltip';

type ArrowDirection = 'top' | 'bottom' | 'left' | 'right' | 'none';

interface TooltipConfig {
  id: string;
  anchorSelector: string;
  arrowDirection: ArrowDirection;
  textKey: string;
}

const TOOLTIPS: TooltipConfig[] = [
  {
    id: 'sidebar',
    anchorSelector: '[data-onboarding="sidebar"]',
    arrowDirection: 'left',
    textKey: 'onboarding.sidebar',
  },
  {
    id: 'toolbar',
    anchorSelector: '[data-onboarding="toolbar"]',
    arrowDirection: 'top',
    textKey: 'onboarding.toolbar',
  },
  {
    id: 'tabs',
    anchorSelector: '[data-onboarding="tabs"]',
    arrowDirection: 'top',
    textKey: 'onboarding.tabs',
  },
  {
    id: 'share',
    anchorSelector: '[data-onboarding="share"]',
    arrowDirection: 'top',
    textKey: 'onboarding.share',
  },
  {
    id: 'canvas',
    anchorSelector: '[data-onboarding="canvas"]',
    arrowDirection: 'none',
    textKey: 'onboarding.canvas',
  },
];

const TOOLTIP_IDS = TOOLTIPS.map((t) => t.id);

const ARROW_SIZE = 8;
const GAP = 8;
const FALLBACK_W = 288;
const FALLBACK_H = 100;

function calcPosition(
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
    case 'none':
      x = rect.left + rect.width / 2 - tipW / 2;
      y = rect.top + rect.height * 0.55 - tipH / 2;
      break;
  }

  return { x, y };
}

interface Rect {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

function resolveOverlaps(items: Rect[]) {
  const spacing = 12;
  for (let pass = 0; pass < 5; pass++) {
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const a = items[i];
        const b = items[j];
        const overlapX = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
        const overlapY = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
        if (overlapX > -spacing && overlapY > -spacing) {
          const pushY = overlapY + spacing;
          if (a.y <= b.y) {
            b.y += pushY;
          } else {
            a.y += pushY;
          }
        }
      }
    }
  }
  const pad = 8;
  for (const item of items) {
    item.x = Math.max(pad, Math.min(item.x, window.innerWidth - item.w - pad));
    item.y = Math.max(pad, Math.min(item.y, window.innerHeight - item.h - pad));
  }
}

interface OnboardingOverlayProps {
  onComplete?: () => void;
}

export function OnboardingOverlay({ onComplete }: OnboardingOverlayProps) {
  const { isComplete, dismissedIds, dismissTooltip } = useOnboarding(TOOLTIP_IDS);
  const refs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [positions, setPositions] = useState<Map<string, { x: number; y: number }>>(new Map());
  const [visible, setVisible] = useState(false);

  const recalculate = useCallback(() => {
    const active = TOOLTIPS.filter((t) => !dismissedIds.has(t.id));
    const items: Rect[] = [];

    for (const tip of active) {
      const anchor = document.querySelector(tip.anchorSelector);
      if (!anchor) continue;
      const rect = anchor.getBoundingClientRect();
      const el = refs.current.get(tip.id);
      const tipW = el?.offsetWidth ?? FALLBACK_W;
      const tipH = el?.offsetHeight ?? FALLBACK_H;
      const pos = calcPosition(rect, tipW, tipH, tip.arrowDirection);
      items.push({ id: tip.id, x: pos.x, y: pos.y, w: tipW, h: tipH });
    }

    resolveOverlaps(items);
    setPositions(new Map(items.map((i) => [i.id, { x: i.x, y: i.y }])));
  }, [dismissedIds]);

  useEffect(() => {
    // Two-frame delay: first render offscreen to measure, then position and show
    requestAnimationFrame(() => {
      recalculate();
      requestAnimationFrame(() => setVisible(true));
    });

    window.addEventListener('resize', recalculate);
    window.addEventListener('scroll', recalculate, true);

    return () => {
      window.removeEventListener('resize', recalculate);
      window.removeEventListener('scroll', recalculate, true);
    };
  }, [recalculate]);

  useEffect(() => {
    if (isComplete && onComplete) onComplete();
  }, [isComplete, onComplete]);

  if (isComplete) return null;

  const active = TOOLTIPS.filter((t) => !dismissedIds.has(t.id));

  return createPortal(
    <>
      {active.map((tip) => (
        <OnboardingTooltip
          key={tip.id}
          ref={(el) => {
            if (el) refs.current.set(tip.id, el);
            else refs.current.delete(tip.id);
          }}
          arrowDirection={tip.arrowDirection}
          textKey={tip.textKey}
          position={positions.get(tip.id)}
          visible={visible}
          onDismiss={() => dismissTooltip(tip.id)}
        />
      ))}
    </>,
    document.body,
  );
}
