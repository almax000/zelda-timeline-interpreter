import type { Node, Edge } from '@xyflow/react';

export type BranchType = 'main' | 'child' | 'adult' | 'fallen';

export interface TimelineNodeData extends Record<string, unknown> {
  gameId: string;
  label?: string;
}

export interface EventNodeData extends Record<string, unknown> {
  labelKey?: string;     // i18n key (for official era markers)
  label?: string;        // plain text (for user custom events)
  isEraMarker?: boolean; // backward compat for old data
}

export interface ImageNodeData extends Record<string, unknown> {
  src: string;       // data URL
  width: number;
  height: number;
}

export type ShapeType = 'rectangle' | 'circle' | 'arrow' | 'line' | 'text';

export interface ShapeNodeData extends Record<string, unknown> {
  shapeType: ShapeType;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  label?: string;
}

export interface LabelPointNodeData extends Record<string, unknown> {
  label: string;
  labelKey?: string;  // i18n key (official timeline)
}

export interface SplitNodeData extends Record<string, unknown> {
  label?: string;
  labelKey?: string;
}

export type TimelineNode =
  | Node<TimelineNodeData, 'game'>
  | Node<EventNodeData, 'event'>
  | Node<ImageNodeData, 'image'>
  | Node<ShapeNodeData, 'shape'>
  | Node<LabelPointNodeData, 'labelPoint'>
  | Node<SplitNodeData, 'split'>;

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
