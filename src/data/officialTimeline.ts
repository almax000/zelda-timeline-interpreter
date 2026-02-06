import type { TimelineNode, TimelineEdge } from '../types/timeline';

const ROW_HEIGHT = 240;
const COL_CHILD = 200;   // Child timeline (left)
const COL_MAIN = 500;    // Main trunk / Adult timeline (center)
const COL_FALLEN = 800;  // Fallen hero timeline (right)
const COL_INDEPENDENT = 1200; // Independent timeline (far right)

export const officialTimelineNodes: TimelineNode[] = [
  // === Main trunk (before split) ===
  { id: 'game-skyward-sword-official', type: 'game', position: { x: COL_MAIN, y: 0 }, data: { gameId: 'skyward-sword' } },
  { id: 'game-minish-cap-official', type: 'game', position: { x: COL_MAIN, y: ROW_HEIGHT }, data: { gameId: 'minish-cap' } },
  { id: 'game-four-swords-official', type: 'game', position: { x: COL_MAIN, y: ROW_HEIGHT * 2 }, data: { gameId: 'four-swords' } },
  { id: 'game-ocarina-of-time-official', type: 'game', position: { x: COL_MAIN, y: ROW_HEIGHT * 3 }, data: { gameId: 'ocarina-of-time' } },

  // === Child Timeline (left column) ===
  { id: 'game-majoras-mask-official', type: 'game', position: { x: COL_CHILD, y: ROW_HEIGHT * 4 }, data: { gameId: 'majoras-mask' } },
  { id: 'game-twilight-princess-official', type: 'game', position: { x: COL_CHILD, y: ROW_HEIGHT * 5 }, data: { gameId: 'twilight-princess' } },
  { id: 'game-four-swords-adventures-official', type: 'game', position: { x: COL_CHILD, y: ROW_HEIGHT * 6 }, data: { gameId: 'four-swords-adventures' } },

  // === Adult Timeline (center column) ===
  { id: 'game-wind-waker-official', type: 'game', position: { x: COL_MAIN, y: ROW_HEIGHT * 4 }, data: { gameId: 'wind-waker' } },
  { id: 'game-phantom-hourglass-official', type: 'game', position: { x: COL_MAIN, y: ROW_HEIGHT * 5 }, data: { gameId: 'phantom-hourglass' } },
  { id: 'game-spirit-tracks-official', type: 'game', position: { x: COL_MAIN, y: ROW_HEIGHT * 6 }, data: { gameId: 'spirit-tracks' } },

  // === Fallen Hero Timeline (right column) ===
  { id: 'game-link-to-the-past-official', type: 'game', position: { x: COL_FALLEN, y: ROW_HEIGHT * 4 }, data: { gameId: 'link-to-the-past' } },
  { id: 'game-links-awakening-official', type: 'game', position: { x: COL_FALLEN, y: ROW_HEIGHT * 5 }, data: { gameId: 'links-awakening' } },
  { id: 'game-oracle-of-seasons-official', type: 'game', position: { x: COL_FALLEN, y: ROW_HEIGHT * 6 }, data: { gameId: 'oracle-of-seasons' } },
  { id: 'game-oracle-of-ages-official', type: 'game', position: { x: COL_FALLEN, y: ROW_HEIGHT * 7 }, data: { gameId: 'oracle-of-ages' } },
  { id: 'game-link-between-worlds-official', type: 'game', position: { x: COL_FALLEN, y: ROW_HEIGHT * 8 }, data: { gameId: 'link-between-worlds' } },
  { id: 'game-tri-force-heroes-official', type: 'game', position: { x: COL_FALLEN, y: ROW_HEIGHT * 9 }, data: { gameId: 'tri-force-heroes' } },
  { id: 'game-echoes-of-wisdom-official', type: 'game', position: { x: COL_FALLEN, y: ROW_HEIGHT * 10 }, data: { gameId: 'echoes-of-wisdom' } },
  { id: 'game-legend-of-zelda-official', type: 'game', position: { x: COL_FALLEN, y: ROW_HEIGHT * 11 }, data: { gameId: 'legend-of-zelda' } },
  { id: 'game-adventure-of-link-official', type: 'game', position: { x: COL_FALLEN, y: ROW_HEIGHT * 12 }, data: { gameId: 'adventure-of-link' } },

  // === Independent Timeline (far right column) ===
  { id: 'game-age-of-imprisonment-official', type: 'game', position: { x: COL_INDEPENDENT, y: 0 }, data: { gameId: 'age-of-imprisonment' } },
  { id: 'game-breath-of-the-wild-official', type: 'game', position: { x: COL_INDEPENDENT, y: ROW_HEIGHT }, data: { gameId: 'breath-of-the-wild' } },
  { id: 'game-tears-of-the-kingdom-official', type: 'game', position: { x: COL_INDEPENDENT, y: ROW_HEIGHT * 2 }, data: { gameId: 'tears-of-the-kingdom' } },
];

export const officialTimelineEdges: TimelineEdge[] = [
  // === Main trunk ===
  { id: 'e-ss-mc', source: 'game-skyward-sword-official', target: 'game-minish-cap-official', sourceHandle: 'bottom', targetHandle: 'top', type: 'timeline', data: { branchType: 'main' } },
  { id: 'e-mc-fs', source: 'game-minish-cap-official', target: 'game-four-swords-official', sourceHandle: 'bottom', targetHandle: 'top', type: 'timeline', data: { branchType: 'main' } },
  { id: 'e-fs-oot', source: 'game-four-swords-official', target: 'game-ocarina-of-time-official', sourceHandle: 'bottom', targetHandle: 'top', type: 'timeline', data: { branchType: 'main' } },

  // === OoT splits ===
  { id: 'e-oot-mm', source: 'game-ocarina-of-time-official', target: 'game-majoras-mask-official', sourceHandle: 'left', targetHandle: 'top', type: 'timeline', data: { branchType: 'child' } },
  { id: 'e-oot-ww', source: 'game-ocarina-of-time-official', target: 'game-wind-waker-official', sourceHandle: 'bottom', targetHandle: 'top', type: 'timeline', data: { branchType: 'adult' } },
  { id: 'e-oot-lttp', source: 'game-ocarina-of-time-official', target: 'game-link-to-the-past-official', sourceHandle: 'right', targetHandle: 'top', type: 'timeline', data: { branchType: 'fallen' } },

  // === Child Timeline chain ===
  { id: 'e-mm-tp', source: 'game-majoras-mask-official', target: 'game-twilight-princess-official', sourceHandle: 'bottom', targetHandle: 'top', type: 'timeline', data: { branchType: 'child' } },
  { id: 'e-tp-fsa', source: 'game-twilight-princess-official', target: 'game-four-swords-adventures-official', sourceHandle: 'bottom', targetHandle: 'top', type: 'timeline', data: { branchType: 'child' } },

  // === Adult Timeline chain ===
  { id: 'e-ww-ph', source: 'game-wind-waker-official', target: 'game-phantom-hourglass-official', sourceHandle: 'bottom', targetHandle: 'top', type: 'timeline', data: { branchType: 'adult' } },
  { id: 'e-ph-st', source: 'game-phantom-hourglass-official', target: 'game-spirit-tracks-official', sourceHandle: 'bottom', targetHandle: 'top', type: 'timeline', data: { branchType: 'adult' } },

  // === Fallen Hero Timeline chain ===
  { id: 'e-lttp-la', source: 'game-link-to-the-past-official', target: 'game-links-awakening-official', sourceHandle: 'bottom', targetHandle: 'top', type: 'timeline', data: { branchType: 'fallen' } },
  { id: 'e-la-oos', source: 'game-links-awakening-official', target: 'game-oracle-of-seasons-official', sourceHandle: 'bottom', targetHandle: 'top', type: 'timeline', data: { branchType: 'fallen' } },
  { id: 'e-oos-ooa', source: 'game-oracle-of-seasons-official', target: 'game-oracle-of-ages-official', sourceHandle: 'bottom', targetHandle: 'top', type: 'timeline', data: { branchType: 'fallen' } },
  { id: 'e-ooa-albw', source: 'game-oracle-of-ages-official', target: 'game-link-between-worlds-official', sourceHandle: 'bottom', targetHandle: 'top', type: 'timeline', data: { branchType: 'fallen' } },
  { id: 'e-albw-tfh', source: 'game-link-between-worlds-official', target: 'game-tri-force-heroes-official', sourceHandle: 'bottom', targetHandle: 'top', type: 'timeline', data: { branchType: 'fallen' } },
  { id: 'e-tfh-eow', source: 'game-tri-force-heroes-official', target: 'game-echoes-of-wisdom-official', sourceHandle: 'bottom', targetHandle: 'top', type: 'timeline', data: { branchType: 'fallen' } },
  { id: 'e-eow-loz', source: 'game-echoes-of-wisdom-official', target: 'game-legend-of-zelda-official', sourceHandle: 'bottom', targetHandle: 'top', type: 'timeline', data: { branchType: 'fallen' } },
  { id: 'e-loz-aol', source: 'game-legend-of-zelda-official', target: 'game-adventure-of-link-official', sourceHandle: 'bottom', targetHandle: 'top', type: 'timeline', data: { branchType: 'fallen' } },

  // === Independent Timeline chain ===
  { id: 'e-aoi-botw', source: 'game-age-of-imprisonment-official', target: 'game-breath-of-the-wild-official', sourceHandle: 'bottom', targetHandle: 'top', type: 'timeline', data: { branchType: 'main' } },
  { id: 'e-botw-totk', source: 'game-breath-of-the-wild-official', target: 'game-tears-of-the-kingdom-official', sourceHandle: 'bottom', targetHandle: 'top', type: 'timeline', data: { branchType: 'main' } },
];
