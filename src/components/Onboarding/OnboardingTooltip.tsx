import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

type ArrowDirection = 'top' | 'bottom' | 'left' | 'right';

export interface OnboardingTooltipProps {
  arrowDirection: ArrowDirection;
  textKey: string;
  position: { x: number; y: number } | undefined;
  visible: boolean;
  onDismiss: () => void;
}

const ARROW_SIZE = 8;

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

export const OnboardingTooltip = forwardRef<HTMLDivElement, OnboardingTooltipProps>(
  function OnboardingTooltip({ arrowDirection, textKey, position, visible, onDismiss }, ref) {
    const { t } = useTranslation();

    return (
      <div
        ref={ref}
        className="fixed z-[200] max-w-[288px] transition-opacity duration-200"
        style={{
          left: position?.x ?? -9999,
          top: position?.y ?? -9999,
          opacity: visible && position ? 1 : 0,
        }}
      >
        <div className="relative bg-[var(--color-surface)] border border-[var(--color-gold)]/40 shadow-xl rounded-lg p-4">
          <div style={arrowStyle(arrowDirection)} />
          <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-2.5">
            {t(textKey)}
          </p>
          <button
            onClick={onDismiss}
            className="text-sm font-medium text-[var(--color-gold)] hover:text-[var(--color-text)] transition-colors"
          >
            {t('hints.dismiss')}
          </button>
        </div>
      </div>
    );
  },
);
