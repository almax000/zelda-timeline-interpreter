import type { TimelineNode, TimelineEdge } from '../../types/timeline';

// Adult Timeline: Wind Waker → Spirit Tracks

export const adultNodes: TimelineNode[] = [
  {
    id: 'split-adult-era',
    type: 'split',
    position: { x: 1500, y: 1000 },
    data: { labelKey: 'officialTimeline.adultEra' },
  },
  {
    id: 'event-adult-pre-ww',
    type: 'event',
    position: { x: 1760, y: 1020 },
    data: { branchType: 'main' },
  },
  {
    id: 'text-hyrule-flooded',
    type: 'textLabel',
    position: { x: 1700, y: 980 },
    data: {
      text: 'Hyrule is flooded',
      labelKey: 'officialTimeline.hyruleFlooded',
      width: 164,
      fontSize: 16,
      fontWeight: 'normal',
      fontStyle: 'normal',
      textAlign: 'left',
      textColor: 'var(--color-text)',
    },
  },
  {
    id: 'game-wind-waker',
    type: 'game',
    position: { x: 1900, y: 1000 },
    data: { gameId: 'wind-waker' },
  },
  {
    id: 'game-phantom-hourglass',
    type: 'game',
    position: { x: 2100, y: 1000 },
    data: { gameId: 'phantom-hourglass' },
  },
  {
    id: 'event-adult-pre-st',
    type: 'event',
    position: { x: 2400, y: 1020 },
    data: { branchType: 'main' },
  },
  {
    id: 'text-new-hyrule',
    type: 'textLabel',
    position: { x: 2320, y: 960 },
    data: {
      text: 'A new Hyrule Kingdom is Established',
      labelKey: 'officialTimeline.newHyrule',
      width: 187,
      fontSize: 16,
      fontWeight: 'normal',
      fontStyle: 'normal',
      textAlign: 'left',
      textColor: 'var(--color-text)',
    },
  },
  {
    id: 'game-spirit-tracks',
    type: 'game',
    position: { x: 2580, y: 1000 },
    data: { gameId: 'spirit-tracks' },
  },
];

export const adultEdges: TimelineEdge[] = [
  {
    id: 'e-adult-to-triumphant',
    source: 'split-adult-era',
    target: 'split-hero-triumphant',
    sourceHandle: 'left-src',
    targetHandle: 'right',
    type: 'timeline',
    data: { branchType: 'main' },
  },
  {
    id: 'e-adult-to-pre-ww',
    source: 'split-adult-era',
    target: 'event-adult-pre-ww',
    sourceHandle: 'right-src',
    targetHandle: 'left',
    type: 'timeline',
    data: { branchType: 'main' },
  },
  {
    id: 'e-pre-ww-to-ww',
    source: 'event-adult-pre-ww',
    target: 'game-wind-waker',
    sourceHandle: 'right',
    targetHandle: 'left',
    type: 'timeline',
    data: { branchType: 'main' },
  },
  {
    id: 'e-ph-to-ww',
    source: 'game-phantom-hourglass',
    target: 'game-wind-waker',
    sourceHandle: 'left',
    targetHandle: 'right',
    type: 'timeline',
    data: { branchType: 'main' },
  },
  {
    id: 'e-pre-st-to-ph',
    source: 'event-adult-pre-st',
    target: 'game-phantom-hourglass',
    sourceHandle: 'left',
    targetHandle: 'right',
    type: 'timeline',
    data: { branchType: 'main' },
  },
  {
    id: 'e-pre-st-to-st',
    source: 'event-adult-pre-st',
    target: 'game-spirit-tracks',
    sourceHandle: 'right',
    targetHandle: 'left',
    type: 'timeline',
    data: { branchType: 'main' },
  },
];
