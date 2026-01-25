import type { Node, Edge } from '@xyflow/react';

export type BranchType = 'main' | 'child' | 'adult' | 'fallen';

export interface TimelineNodeData extends Record<string, unknown> {
  gameId: string;
  label?: string;
}

export type TimelineNode = Node<TimelineNodeData, 'game'>;

export interface TimelineEdgeData extends Record<string, unknown> {
  branchType: BranchType;
  label?: string;
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
