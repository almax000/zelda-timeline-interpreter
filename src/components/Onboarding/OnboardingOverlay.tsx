import { useOnboarding } from '../../hooks/useOnboarding';
import { OnboardingTooltip } from './OnboardingTooltip';

interface TooltipConfig {
  id: string;
  anchorSelector: string;
  arrowDirection: 'top' | 'bottom' | 'left' | 'right';
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
    arrowDirection: 'bottom',
    textKey: 'onboarding.canvas',
  },
];

const TOOLTIP_IDS = TOOLTIPS.map((t) => t.id);

export function OnboardingOverlay() {
  const { isComplete, dismissedIds, dismissTooltip } = useOnboarding(TOOLTIP_IDS);

  if (isComplete) return null;

  return (
    <>
      {TOOLTIPS.filter((tip) => !dismissedIds.has(tip.id)).map((tip) => (
        <OnboardingTooltip
          key={tip.id}
          anchorSelector={tip.anchorSelector}
          arrowDirection={tip.arrowDirection}
          textKey={tip.textKey}
          onDismiss={() => dismissTooltip(tip.id)}
        />
      ))}
    </>
  );
}
