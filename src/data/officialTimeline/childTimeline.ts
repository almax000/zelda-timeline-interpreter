import type { TimelineNode, TimelineEdge } from '../../types/timeline';

// Child Timeline: Majora's Mask → Four Swords Adventures

export const childNodes: TimelineNode[] = [
  {
    id: 'split-child-era',
    type: 'split',
    position: { x: 1492, y: 677 },
    data: { labelKey: 'officialTimeline.childEra' },
  },
  {
    id: 'game-majoras-mask',
    type: 'game',
    position: { x: 1765, y: 657 },
    data: { gameId: 'majoras-mask' },
  },
  {
    id: 'game-twilight-princess',
    type: 'game',
    position: { x: 2209, y: 654 },
    data: { gameId: 'twilight-princess' },
  },
  {
    id: 'game-four-swords-adventures',
    type: 'game',
    position: { x: 2573, y: 657 },
    data: { gameId: 'four-swords-adventures' },
  },
];

export const childEdges: TimelineEdge[] = [
  {
    id: 'e-child-to-triumphant',
    source: 'split-child-era',
    target: 'split-hero-triumphant',
    sourceHandle: 'left-src',
    targetHandle: 'right',
    type: 'timeline',
    data: { branchType: 'main' },
  },
  {
    id: 'e-mm-to-child',
    source: 'game-majoras-mask',
    target: 'split-child-era',
    sourceHandle: 'left',
    targetHandle: 'right',
    type: 'timeline',
    data: { branchType: 'main' },
  },
  {
    id: 'e-tp-to-mm',
    source: 'game-twilight-princess',
    target: 'game-majoras-mask',
    sourceHandle: 'left',
    targetHandle: 'right',
    type: 'timeline',
    data: { branchType: 'main' },
  },
  {
    id: 'e-fsa-to-tp',
    source: 'game-four-swords-adventures',
    target: 'game-twilight-princess',
    sourceHandle: 'left',
    targetHandle: 'right',
    type: 'timeline',
    data: { branchType: 'main' },
  },
];
