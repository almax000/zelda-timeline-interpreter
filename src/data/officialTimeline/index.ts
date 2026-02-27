import type { TimelineNode, TimelineEdge } from '../../types/timeline';
import { mainTrunkNodes, mainTrunkEdges } from './mainTrunk';
import { downfallNodes, downfallEdges } from './downfallTimeline';
import { childNodes, childEdges } from './childTimeline';
import { adultNodes, adultEdges } from './adultTimeline';
import { convergenceNodes, convergenceEdges } from './convergence';

export const officialTimelineNodes: TimelineNode[] = [
  ...mainTrunkNodes,
  ...downfallNodes,
  ...childNodes,
  ...adultNodes,
  ...convergenceNodes,
];

export const officialTimelineEdges: TimelineEdge[] = [
  ...mainTrunkEdges,
  ...downfallEdges,
  ...childEdges,
  ...adultEdges,
  ...convergenceEdges,
];
