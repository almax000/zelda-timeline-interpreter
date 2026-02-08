import type { Node, Edge } from '@xyflow/react';

export type BranchType = 'main' | 'child' | 'adult' | 'fallen';

export interface TimelineNodeData extends Record<string, unknown> {
  gameId: string;
  label?: string;
}

export interface EventNodeData extends Record<string, unknown> {
  labelKey?: string;     // i18n key (for official era markers)
  label?: string;        // plain text (for user custom events)
  isEraMarker: boolean;
}

export interface GuideNodeData extends Record<string, unknown> {
  titleKey: string;
  contentKey: string;
  isCollapsed: boolean;
}

export type TimelineNode = Node<TimelineNodeData, 'game'> | Node<EventNodeData, 'event'> | Node<GuideNodeData, 'guide'>;

export interface TimelineEdgeData extends Record<string, unknown> {
  branchType: BranchType;
  label?: string;
  labelKey?: string;
}

export type TimelineEdge = Edge<TimelineEdgeData>;

export interface TimelineState {
  nodes: TimelineNode[];
  edges: TimelineEdge[];
}

export interface SavedTimeline {
  version: string;
  createdAt: string;
  updatedAt: string;
  state: TimelineState;
}
