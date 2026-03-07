import type { InteractionCounters } from './interactionCounters';

export interface TipConfig {
  id: string;
  i18nKey: string;
  priority: number;
  condition: (ctx: TipContext) => boolean;
}

export interface TipContext {
  nodeCount: number;
  edgeCount: number;
  tabCount: number;
  hasSelection: boolean;
  welcomeDismissed: boolean;
  counters: InteractionCounters;
}

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent);
export const modKey = isMac ? '\u2318' : 'Ctrl';

export const tipRegistry: TipConfig[] = [
  {
    id: 'dragGames',
    i18nKey: 'hints.dragGames',
    priority: 0,
    condition: (ctx) => ctx.nodeCount === 0 && ctx.welcomeDismissed,
  },
  {
    id: 'rightClick',
    i18nKey: 'hints.rightClick',
    priority: 1,
    condition: (ctx) => ctx.nodeCount >= 1,
  },
  {
    id: 'branchColors',
    i18nKey: 'hints.branchColors',
    priority: 2,
    condition: (ctx) => ctx.edgeCount >= 1,
  },
  {
    id: 'shiftDrag',
    i18nKey: 'hints.shiftDrag',
    priority: 3,
    condition: (ctx) => ctx.counters.nodeDrags >= 2,
  },
  {
    id: 'spacePan',
    i18nKey: 'hints.spacePan',
    priority: 4,
    condition: (ctx) => ctx.nodeCount >= 3,
  },
  {
    id: 'middleClickPan',
    i18nKey: 'hints.middleClickPan',
    priority: 4.5,
    condition: (ctx) => ctx.nodeCount >= 5,
  },
  {
    id: 'shiftScroll',
    i18nKey: 'hints.shiftScroll',
    priority: 4.6,
    condition: (ctx) => ctx.nodeCount >= 5,
  },
  {
    id: 'imagePaste',
    i18nKey: 'hints.imagePaste',
    priority: 5,
    condition: (ctx) => ctx.nodeCount >= 5,
  },
  {
    id: 'duplicate',
    i18nKey: 'hints.duplicate',
    priority: 6,
    condition: (ctx) => ctx.hasSelection,
  },
  {
    id: 'edgeSplit',
    i18nKey: 'hints.edgeSplit',
    priority: 7,
    condition: (ctx) => ctx.edgeCount >= 2,
  },
  {
    id: 'toolShortcuts',
    i18nKey: 'hints.toolShortcuts',
    priority: 8,
    condition: (ctx) => ctx.counters.toolSwitches >= 5,
  },
  {
    id: 'undoRedo',
    i18nKey: 'hints.undoRedo',
    priority: 9,
    condition: (ctx) => ctx.counters.nodesDeleted >= 1,
  },
  {
    id: 'tabManagement',
    i18nKey: 'hints.tabManagement',
    priority: 10,
    condition: (ctx) => ctx.tabCount >= 2,
  },
  {
    id: 'exportShare',
    i18nKey: 'hints.exportShare',
    priority: 11,
    condition: (ctx) => ctx.nodeCount >= 5,
  },
];

export function evaluateTips(ctx: TipContext, seen: Set<string>): TipConfig | null {
  return tipRegistry.find((tip) => !seen.has(tip.id) && tip.condition(ctx)) ?? null;
}
