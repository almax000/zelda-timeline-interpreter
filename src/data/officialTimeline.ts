import type { TimelineNode, TimelineEdge } from '../types/timeline';

const COL_WIDTH = 220;       // Horizontal spacing between nodes
const ROW_CHILD = 0;         // Child timeline (top)
const ROW_MAIN = 300;        // Main trunk / Adult timeline (middle)
const ROW_FALLEN = 600;      // Fallen hero timeline (bottom)
const ROW_STANDALONE = -300;  // BotW/TotK standalone (above all)

export const officialTimelineNodes: TimelineNode[] = [
  // === Main trunk (before split) ===
  { id: 'game-skyward-sword-official', type: 'game', position: { x: 0, y: ROW_MAIN }, data: { gameId: 'skyward-sword' } },
  { id: 'game-minish-cap-official', type: 'game', position: { x: COL_WIDTH, y: ROW_MAIN }, data: { gameId: 'minish-cap' } },
  { id: 'game-four-swords-official', type: 'game', position: { x: COL_WIDTH * 2, y: ROW_MAIN }, data: { gameId: 'four-swords' } },
  { id: 'game-ocarina-of-time-official', type: 'game', position: { x: COL_WIDTH * 3, y: ROW_MAIN }, data: { gameId: 'ocarina-of-time' } },

  // === Child Timeline (top row, branching up from OoT) ===
  { id: 'game-majoras-mask-official', type: 'game', position: { x: COL_WIDTH * 4, y: ROW_CHILD }, data: { gameId: 'majoras-mask' } },
  { id: 'game-twilight-princess-official', type: 'game', position: { x: COL_WIDTH * 5, y: ROW_CHILD }, data: { gameId: 'twilight-princess' } },
  { id: 'game-four-swords-adventures-official', type: 'game', position: { x: COL_WIDTH * 6, y: ROW_CHILD }, data: { gameId: 'four-swords-adventures' } },

  // === Adult Timeline (middle row, continues straight from OoT) ===
  { id: 'game-wind-waker-official', type: 'game', position: { x: COL_WIDTH * 4, y: ROW_MAIN }, data: { gameId: 'wind-waker' } },
  { id: 'game-phantom-hourglass-official', type: 'game', position: { x: COL_WIDTH * 5, y: ROW_MAIN }, data: { gameId: 'phantom-hourglass' } },
  { id: 'game-spirit-tracks-official', type: 'game', position: { x: COL_WIDTH * 6, y: ROW_MAIN }, data: { gameId: 'spirit-tracks' } },

  // === Fallen Hero Timeline (bottom row, branching down from OoT) ===
  { id: 'game-link-to-the-past-official', type: 'game', position: { x: COL_WIDTH * 4, y: ROW_FALLEN }, data: { gameId: 'link-to-the-past' } },
  { id: 'game-links-awakening-official', type: 'game', position: { x: COL_WIDTH * 5, y: ROW_FALLEN }, data: { gameId: 'links-awakening' } },
  { id: 'game-oracle-of-seasons-ages-official', type: 'game', position: { x: COL_WIDTH * 6, y: ROW_FALLEN }, data: { gameId: 'oracle-of-seasons-ages' } },
  { id: 'game-link-between-worlds-official', type: 'game', position: { x: COL_WIDTH * 7, y: ROW_FALLEN }, data: { gameId: 'link-between-worlds' } },
  { id: 'game-tri-force-heroes-official', type: 'game', position: { x: COL_WIDTH * 8, y: ROW_FALLEN }, data: { gameId: 'tri-force-heroes' } },
  { id: 'game-echoes-of-wisdom-official', type: 'game', position: { x: COL_WIDTH * 9, y: ROW_FALLEN }, data: { gameId: 'echoes-of-wisdom' } },
  { id: 'game-legend-of-zelda-official', type: 'game', position: { x: COL_WIDTH * 10, y: ROW_FALLEN }, data: { gameId: 'legend-of-zelda' } },
  { id: 'game-adventure-of-link-official', type: 'game', position: { x: COL_WIDTH * 11, y: ROW_FALLEN }, data: { gameId: 'adventure-of-link' } },

  // === Standalone Timeline (BotW/TotK — officially separate from all three branches) ===
  { id: 'game-breath-of-the-wild-official', type: 'game', position: { x: 0, y: ROW_STANDALONE }, data: { gameId: 'breath-of-the-wild' } },
  { id: 'game-tears-of-the-kingdom-official', type: 'game', position: { x: COL_WIDTH, y: ROW_STANDALONE }, data: { gameId: 'tears-of-the-kingdom' } },
];

export const officialTimelineEdges: TimelineEdge[] = [
  // === Main trunk (horizontal: right → left) ===
  { id: 'e-ss-mc', source: 'game-skyward-sword-official', target: 'game-minish-cap-official', sourceHandle: 'right', targetHandle: 'left', type: 'timeline', data: { branchType: 'main' } },
  { id: 'e-mc-fs', source: 'game-minish-cap-official', target: 'game-four-swords-official', sourceHandle: 'right', targetHandle: 'left', type: 'timeline', data: { branchType: 'main' } },
  { id: 'e-fs-oot', source: 'game-four-swords-official', target: 'game-ocarina-of-time-official', sourceHandle: 'right', targetHandle: 'left', type: 'timeline', data: { branchType: 'main' } },

  // === OoT splits (with labelKey for i18n labels) ===
  { id: 'e-oot-mm', source: 'game-ocarina-of-time-official', target: 'game-majoras-mask-official', sourceHandle: 'top', targetHandle: 'left', type: 'timeline', data: { branchType: 'child', labelKey: 'officialTimeline.childSplit' } },
  { id: 'e-oot-ww', source: 'game-ocarina-of-time-official', target: 'game-wind-waker-official', sourceHandle: 'right', targetHandle: 'left', type: 'timeline', data: { branchType: 'adult', labelKey: 'officialTimeline.adultSplit' } },
  { id: 'e-oot-lttp', source: 'game-ocarina-of-time-official', target: 'game-link-to-the-past-official', sourceHandle: 'bottom', targetHandle: 'left', type: 'timeline', data: { branchType: 'fallen', labelKey: 'officialTimeline.fallenSplit' } },

  // === Child Timeline chain (horizontal) ===
  { id: 'e-mm-tp', source: 'game-majoras-mask-official', target: 'game-twilight-princess-official', sourceHandle: 'right', targetHandle: 'left', type: 'timeline', data: { branchType: 'child' } },
  { id: 'e-tp-fsa', source: 'game-twilight-princess-official', target: 'game-four-swords-adventures-official', sourceHandle: 'right', targetHandle: 'left', type: 'timeline', data: { branchType: 'child' } },

  // === Adult Timeline chain (horizontal) ===
  { id: 'e-ww-ph', source: 'game-wind-waker-official', target: 'game-phantom-hourglass-official', sourceHandle: 'right', targetHandle: 'left', type: 'timeline', data: { branchType: 'adult' } },
  { id: 'e-ph-st', source: 'game-phantom-hourglass-official', target: 'game-spirit-tracks-official', sourceHandle: 'right', targetHandle: 'left', type: 'timeline', data: { branchType: 'adult' } },

  // === Fallen Hero Timeline chain (horizontal) ===
  { id: 'e-lttp-la', source: 'game-link-to-the-past-official', target: 'game-links-awakening-official', sourceHandle: 'right', targetHandle: 'left', type: 'timeline', data: { branchType: 'fallen' } },
  { id: 'e-la-oracles', source: 'game-links-awakening-official', target: 'game-oracle-of-seasons-ages-official', sourceHandle: 'right', targetHandle: 'left', type: 'timeline', data: { branchType: 'fallen' } },
  { id: 'e-oracles-albw', source: 'game-oracle-of-seasons-ages-official', target: 'game-link-between-worlds-official', sourceHandle: 'right', targetHandle: 'left', type: 'timeline', data: { branchType: 'fallen' } },
  { id: 'e-albw-tfh', source: 'game-link-between-worlds-official', target: 'game-tri-force-heroes-official', sourceHandle: 'right', targetHandle: 'left', type: 'timeline', data: { branchType: 'fallen' } },
  { id: 'e-tfh-eow', source: 'game-tri-force-heroes-official', target: 'game-echoes-of-wisdom-official', sourceHandle: 'right', targetHandle: 'left', type: 'timeline', data: { branchType: 'fallen' } },
  { id: 'e-eow-loz', source: 'game-echoes-of-wisdom-official', target: 'game-legend-of-zelda-official', sourceHandle: 'right', targetHandle: 'left', type: 'timeline', data: { branchType: 'fallen' } },
  { id: 'e-loz-aol', source: 'game-legend-of-zelda-official', target: 'game-adventure-of-link-official', sourceHandle: 'right', targetHandle: 'left', type: 'timeline', data: { branchType: 'fallen' } },

  // === Standalone Timeline chain (BotW/TotK — horizontal) ===
  { id: 'e-botw-totk', source: 'game-breath-of-the-wild-official', target: 'game-tears-of-the-kingdom-official', sourceHandle: 'right', targetHandle: 'left', type: 'timeline', data: { branchType: 'main' } },
];
