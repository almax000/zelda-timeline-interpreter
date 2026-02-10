import type { TimelineNode, TimelineEdge } from '../types/timeline';

const COL = 300;            // Horizontal spacing between nodes
const Y_MAIN = 0;           // Main trunk / Child timeline
const Y_FALLEN = -450;      // Fallen hero timeline (above)
const Y_ADULT = 450;        // Adult timeline (below)
const Y_STANDALONE = -900;  // BotW/TotK standalone (top)

export const officialTimelineNodes: TimelineNode[] = [
  // === Main trunk (SS → OoT) ===
  { id: 'game-skyward-sword-official', type: 'game', position: { x: 0, y: Y_MAIN }, data: { gameId: 'skyward-sword' } },
  { id: 'game-minish-cap-official', type: 'game', position: { x: COL, y: Y_MAIN }, data: { gameId: 'minish-cap' } },
  { id: 'game-four-swords-official', type: 'game', position: { x: COL * 2, y: Y_MAIN }, data: { gameId: 'four-swords' } },

  // Era marker: Hyrulean Civil War
  { id: 'era-hyrulean-civil-war', type: 'event', position: { x: 750, y: Y_MAIN - 80 }, data: { labelKey: 'eraMarker.hyruleanCivilWar', isEraMarker: true } },

  { id: 'game-ocarina-of-time-official', type: 'game', position: { x: COL * 3, y: Y_MAIN }, data: { gameId: 'ocarina-of-time' } },

  // === Split LabelPoint nodes ===
  { id: 'label-fallen-split', type: 'labelPoint', position: { x: 975, y: (Y_MAIN + Y_FALLEN) / 2 }, data: { label: 'Fallen Hero', labelKey: 'officialTimeline.fallenSplit' } },
  { id: 'label-child-split', type: 'labelPoint', position: { x: 1050, y: Y_MAIN }, data: { label: 'Child Era', labelKey: 'officialTimeline.childSplit' } },
  { id: 'label-adult-split', type: 'labelPoint', position: { x: 975, y: (Y_MAIN + Y_ADULT) / 2 }, data: { label: 'Adult Era', labelKey: 'officialTimeline.adultSplit' } },

  // === Fallen Hero Timeline (y = -450) ===
  { id: 'era-imprisoning-war', type: 'event', position: { x: 1125, y: Y_FALLEN - 80 }, data: { labelKey: 'eraMarker.imprisoningWar', isEraMarker: true } },

  { id: 'game-link-to-the-past-official', type: 'game', position: { x: COL * 4, y: Y_FALLEN }, data: { gameId: 'link-to-the-past' } },
  { id: 'game-links-awakening-official', type: 'game', position: { x: COL * 5, y: Y_FALLEN }, data: { gameId: 'links-awakening' } },
  { id: 'game-oracle-of-seasons-ages-official', type: 'game', position: { x: COL * 6, y: Y_FALLEN }, data: { gameId: 'oracle-of-seasons-ages' } },
  { id: 'game-link-between-worlds-official', type: 'game', position: { x: COL * 7, y: Y_FALLEN }, data: { gameId: 'link-between-worlds' } },
  { id: 'game-tri-force-heroes-official', type: 'game', position: { x: COL * 8, y: Y_FALLEN }, data: { gameId: 'tri-force-heroes' } },
  { id: 'game-echoes-of-wisdom-official', type: 'game', position: { x: COL * 9, y: Y_FALLEN }, data: { gameId: 'echoes-of-wisdom' } },

  { id: 'era-decline-of-hyrule', type: 'event', position: { x: COL * 9.5, y: Y_FALLEN - 80 }, data: { labelKey: 'eraMarker.declineOfHyrule', isEraMarker: true } },

  { id: 'game-legend-of-zelda-official', type: 'game', position: { x: COL * 10, y: Y_FALLEN }, data: { gameId: 'legend-of-zelda' } },
  { id: 'game-adventure-of-link-official', type: 'game', position: { x: COL * 11, y: Y_FALLEN }, data: { gameId: 'adventure-of-link' } },

  // === Child Timeline (y = 0, continues main trunk) ===
  { id: 'game-majoras-mask-official', type: 'game', position: { x: COL * 4, y: Y_MAIN }, data: { gameId: 'majoras-mask' } },
  { id: 'game-twilight-princess-official', type: 'game', position: { x: COL * 5, y: Y_MAIN }, data: { gameId: 'twilight-princess' } },
  { id: 'game-four-swords-adventures-official', type: 'game', position: { x: COL * 6, y: Y_MAIN }, data: { gameId: 'four-swords-adventures' } },

  // === Adult Timeline (y = 450) ===
  { id: 'era-hyrule-flooded', type: 'event', position: { x: 1125, y: Y_ADULT - 80 }, data: { labelKey: 'eraMarker.hyruleFlooded', isEraMarker: true } },

  { id: 'game-wind-waker-official', type: 'game', position: { x: COL * 4, y: Y_ADULT }, data: { gameId: 'wind-waker' } },
  { id: 'game-phantom-hourglass-official', type: 'game', position: { x: COL * 5, y: Y_ADULT }, data: { gameId: 'phantom-hourglass' } },

  { id: 'era-new-hyrule', type: 'event', position: { x: COL * 5.5, y: Y_ADULT - 80 }, data: { labelKey: 'eraMarker.newHyrule', isEraMarker: true } },

  { id: 'game-spirit-tracks-official', type: 'game', position: { x: COL * 6, y: Y_ADULT }, data: { gameId: 'spirit-tracks' } },

  // === Standalone Timeline (BotW/TotK) ===
  { id: 'game-breath-of-the-wild-official', type: 'game', position: { x: 0, y: Y_STANDALONE }, data: { gameId: 'breath-of-the-wild' } },
  { id: 'game-tears-of-the-kingdom-official', type: 'game', position: { x: COL, y: Y_STANDALONE }, data: { gameId: 'tears-of-the-kingdom' } },

  // === Guide Nodes (2 only — editing/annotation removed for read-only page) ===
  { id: 'guide-welcome', type: 'guide', position: { x: -350, y: Y_STANDALONE - 50 }, data: { titleKey: 'guide.welcome.title', contentKey: 'guide.welcome.content', isCollapsed: false } },
  { id: 'guide-navigation', type: 'guide', position: { x: -350, y: Y_MAIN - 50 }, data: { titleKey: 'guide.navigation.title', contentKey: 'guide.navigation.content', isCollapsed: true } },
];

export const officialTimelineEdges: TimelineEdge[] = [
  // === Main trunk (horizontal: left → right) ===
  { id: 'e-ss-mc', source: 'game-skyward-sword-official', target: 'game-minish-cap-official', sourceHandle: 'right', targetHandle: 'left', type: 'timeline', data: { branchType: 'main' } },
  { id: 'e-mc-fs', source: 'game-minish-cap-official', target: 'game-four-swords-official', sourceHandle: 'right', targetHandle: 'left', type: 'timeline', data: { branchType: 'main' } },
  { id: 'e-fs-era-civil', source: 'game-four-swords-official', target: 'era-hyrulean-civil-war', sourceHandle: 'right', targetHandle: 'left', type: 'timeline', data: { branchType: 'main' } },
  { id: 'e-era-civil-oot', source: 'era-hyrulean-civil-war', target: 'game-ocarina-of-time-official', sourceHandle: 'right', targetHandle: 'left', type: 'timeline', data: { branchType: 'main' } },

  // === OoT splits (via LabelPoint nodes) ===
  // Fallen: OoT → label → era → LttP
  { id: 'e-oot-fallen-label', source: 'game-ocarina-of-time-official', target: 'label-fallen-split', sourceHandle: 'top', targetHandle: 'left', type: 'timeline', data: { branchType: 'fallen' } },
  { id: 'e-fallen-label-era', source: 'label-fallen-split', target: 'era-imprisoning-war', sourceHandle: 'right', targetHandle: 'left', type: 'timeline', data: { branchType: 'fallen' } },
  { id: 'e-era-imprison-lttp', source: 'era-imprisoning-war', target: 'game-link-to-the-past-official', sourceHandle: 'right', targetHandle: 'left', type: 'timeline', data: { branchType: 'fallen' } },

  // Child: OoT → label → MM
  { id: 'e-oot-child-label', source: 'game-ocarina-of-time-official', target: 'label-child-split', sourceHandle: 'right', targetHandle: 'left', type: 'timeline', data: { branchType: 'child' } },
  { id: 'e-child-label-mm', source: 'label-child-split', target: 'game-majoras-mask-official', sourceHandle: 'right', targetHandle: 'left', type: 'timeline', data: { branchType: 'child' } },

  // Adult: OoT → label → era → WW
  { id: 'e-oot-adult-label', source: 'game-ocarina-of-time-official', target: 'label-adult-split', sourceHandle: 'bottom', targetHandle: 'left', type: 'timeline', data: { branchType: 'adult' } },
  { id: 'e-adult-label-era', source: 'label-adult-split', target: 'era-hyrule-flooded', sourceHandle: 'right', targetHandle: 'left', type: 'timeline', data: { branchType: 'adult' } },
  { id: 'e-era-flood-ww', source: 'era-hyrule-flooded', target: 'game-wind-waker-official', sourceHandle: 'right', targetHandle: 'left', type: 'timeline', data: { branchType: 'adult' } },

  // === Fallen Hero Timeline chain ===
  { id: 'e-lttp-la', source: 'game-link-to-the-past-official', target: 'game-links-awakening-official', sourceHandle: 'right', targetHandle: 'left', type: 'timeline', data: { branchType: 'fallen' } },
  { id: 'e-la-oracles', source: 'game-links-awakening-official', target: 'game-oracle-of-seasons-ages-official', sourceHandle: 'right', targetHandle: 'left', type: 'timeline', data: { branchType: 'fallen' } },
  { id: 'e-oracles-albw', source: 'game-oracle-of-seasons-ages-official', target: 'game-link-between-worlds-official', sourceHandle: 'right', targetHandle: 'left', type: 'timeline', data: { branchType: 'fallen' } },
  { id: 'e-albw-tfh', source: 'game-link-between-worlds-official', target: 'game-tri-force-heroes-official', sourceHandle: 'right', targetHandle: 'left', type: 'timeline', data: { branchType: 'fallen' } },
  { id: 'e-tfh-eow', source: 'game-tri-force-heroes-official', target: 'game-echoes-of-wisdom-official', sourceHandle: 'right', targetHandle: 'left', type: 'timeline', data: { branchType: 'fallen' } },
  { id: 'e-eow-era-decline', source: 'game-echoes-of-wisdom-official', target: 'era-decline-of-hyrule', sourceHandle: 'right', targetHandle: 'left', type: 'timeline', data: { branchType: 'fallen' } },
  { id: 'e-era-decline-loz', source: 'era-decline-of-hyrule', target: 'game-legend-of-zelda-official', sourceHandle: 'right', targetHandle: 'left', type: 'timeline', data: { branchType: 'fallen' } },
  { id: 'e-loz-aol', source: 'game-legend-of-zelda-official', target: 'game-adventure-of-link-official', sourceHandle: 'right', targetHandle: 'left', type: 'timeline', data: { branchType: 'fallen' } },

  // === Child Timeline chain ===
  { id: 'e-mm-tp', source: 'game-majoras-mask-official', target: 'game-twilight-princess-official', sourceHandle: 'right', targetHandle: 'left', type: 'timeline', data: { branchType: 'child' } },
  { id: 'e-tp-fsa', source: 'game-twilight-princess-official', target: 'game-four-swords-adventures-official', sourceHandle: 'right', targetHandle: 'left', type: 'timeline', data: { branchType: 'child' } },

  // === Adult Timeline chain ===
  { id: 'e-ww-ph', source: 'game-wind-waker-official', target: 'game-phantom-hourglass-official', sourceHandle: 'right', targetHandle: 'left', type: 'timeline', data: { branchType: 'adult' } },
  { id: 'e-ph-era-new', source: 'game-phantom-hourglass-official', target: 'era-new-hyrule', sourceHandle: 'right', targetHandle: 'left', type: 'timeline', data: { branchType: 'adult' } },
  { id: 'e-era-new-st', source: 'era-new-hyrule', target: 'game-spirit-tracks-official', sourceHandle: 'right', targetHandle: 'left', type: 'timeline', data: { branchType: 'adult' } },

  // === Standalone Timeline chain (BotW/TotK) ===
  { id: 'e-botw-totk', source: 'game-breath-of-the-wild-official', target: 'game-tears-of-the-kingdom-official', sourceHandle: 'right', targetHandle: 'left', type: 'timeline', data: { branchType: 'main' } },
];
