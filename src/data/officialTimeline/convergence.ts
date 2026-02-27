import type { TimelineNode, TimelineEdge } from '../../types/timeline';

// Convergence era: Breath of the Wild → Tears of the Kingdom

export const convergenceNodes: TimelineNode[] = [
  {
    id: 'event-converge-top',
    type: 'event',
    position: { x: 3039, y: 628 },
    data: { branchType: 'main' },
  },
  {
    id: 'event-converge-bottom',
    type: 'event',
    position: { x: 3040, y: 1071 },
    data: { branchType: 'main' },
  },
  {
    id: 'game-breath-of-the-wild',
    type: 'game',
    position: { x: 3312, y: 856 },
    data: { gameId: 'breath-of-the-wild' },
  },
  {
    id: 'game-tears-of-the-kingdom',
    type: 'game',
    position: { x: 3633, y: 840 },
    data: { gameId: 'tears-of-the-kingdom' },
  },
];

export const convergenceEdges: TimelineEdge[] = [
  {
    id: 'e-converge-top-to-bottom',
    source: 'event-converge-top',
    target: 'event-converge-bottom',
    sourceHandle: 'bottom',
    targetHandle: 'top',
    type: 'timeline',
    data: { branchType: 'main' },
  },
  {
    id: 'e-totk-to-botw',
    source: 'game-tears-of-the-kingdom',
    target: 'game-breath-of-the-wild',
    sourceHandle: 'left',
    targetHandle: 'right',
    type: 'timeline',
    data: { branchType: 'main' },
  },
];
