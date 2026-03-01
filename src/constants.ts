import type { BranchType } from './types/timeline';

// Storage keys used across the app
export const STORAGE_KEYS = {
  DATA_VERSION: 'zelda-data-version',
  TAB_STORE: 'zelda-tab-store',
  SETTINGS: 'zelda-timeline-settings',
  HINTS_SEEN: 'zelda-hints-seen',
  TIP_COUNTERS: 'zelda-tip-counters',
  ONBOARDING_COMPLETE: 'zelda-onboarding-complete',
  tabCanvas: (tabId: string) => `zelda-tab-${tabId}`,
} as const;

// Laser pointer decay duration
export const LASER_DECAY_MS = 1000;

export const BRANCH_COLORS: Record<BranchType, string> = {
  main: 'var(--color-branch-main)',
  child: 'var(--color-branch-child)',
  adult: 'var(--color-branch-adult)',
  fallen: 'var(--color-branch-fallen)',
};

// URL sharing limit
export const MAX_URL_LENGTH = 8000;

// Export format version
export const EXPORT_VERSION = '1.0.0';
