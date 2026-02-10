import { create, type StoreApi, type UseBoundStore } from 'zustand';
import { persist } from 'zustand/middleware';
import { temporal, type TemporalState } from 'zundo';
import {
  applyNodeChanges,
  applyEdgeChanges,
  type Connection,
  type NodeChange,
  type EdgeChange,
} from '@xyflow/react';
import type { TimelineNode, TimelineEdge, BranchType } from '../types/timeline';

export interface CanvasStore {
  nodes: TimelineNode[];
  edges: TimelineEdge[];
  selectedBranchType: BranchType;

  setNodes: (nodes: TimelineNode[]) => void;
  setEdges: (edges: TimelineEdge[]) => void;
  onNodesChange: (changes: NodeChange<TimelineNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<TimelineEdge>[]) => void;
  addNode: (node: TimelineNode) => void;
  addEdge: (connection: Connection) => void;
  removeNode: (nodeId: string) => void;
  removeEdge: (edgeId: string) => void;
  setSelectedBranchType: (type: BranchType) => void;
  clearTimeline: () => void;
  loadTimeline: (nodes: TimelineNode[], edges: TimelineEdge[]) => void;
  updateEdgeBranchType: (edgeId: string, branchType: BranchType) => void;
  updateEdgeLabel: (edgeId: string, label: string) => void;
  splitEdgeWithLabel: (edgeId: string, label: string) => void;
  insertAnnotation: (edgeId: string, clickPosition: { x: number; y: number }) => void;
}

export type CanvasStoreWithTemporal = UseBoundStore<StoreApi<CanvasStore>> & {
  temporal: StoreApi<TemporalState<Pick<CanvasStore, 'nodes' | 'edges'>>>;
};

export function createCanvasStore(tabId: string): CanvasStoreWithTemporal {
  return create<CanvasStore>()(
    temporal(
      persist(
        (set, get) => ({
          nodes: [],
          edges: [],
          selectedBranchType: 'main',

          setNodes: (nodes) => set({ nodes }),
          setEdges: (edges) => set({ edges }),

          onNodesChange: (changes) => {
            const updated = applyNodeChanges(changes, get().nodes);
            set({ nodes: updated as TimelineNode[] });
          },

          onEdgesChange: (changes) => {
            const updated = applyEdgeChanges(changes, get().edges);
            set({ edges: updated as TimelineEdge[] });
          },

          addNode: (node) => {
            set({ nodes: [...get().nodes, node] });
          },

          addEdge: (connection) => {
            const { selectedBranchType, edges } = get();
            const newEdge: TimelineEdge = {
              id: `e${connection.source}-${connection.target}`,
              source: connection.source!,
              target: connection.target!,
              sourceHandle: connection.sourceHandle,
              targetHandle: connection.targetHandle,
              type: 'timeline',
              data: { branchType: selectedBranchType },
            };
            set({ edges: [...edges, newEdge] });
          },

          removeNode: (nodeId) => {
            set({
              nodes: get().nodes.filter((n) => n.id !== nodeId),
              edges: get().edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
            });
          },

          removeEdge: (edgeId) => {
            set({ edges: get().edges.filter((e) => e.id !== edgeId) });
          },

          setSelectedBranchType: (type) => set({ selectedBranchType: type }),

          clearTimeline: () => set({ nodes: [], edges: [] }),

          loadTimeline: (nodes, edges) => set({ nodes, edges }),

          updateEdgeBranchType: (edgeId, branchType) => {
            set({
              edges: get().edges.map((e) =>
                e.id === edgeId ? { ...e, data: { ...e.data!, branchType } } : e
              ),
            });
          },

          updateEdgeLabel: (edgeId, label) => {
            set({
              edges: get().edges.map((e) =>
                e.id === edgeId ? { ...e, data: { ...e.data!, label } } : e
              ),
            });
          },

          splitEdgeWithLabel: (edgeId, label) => {
            const { nodes, edges } = get();
            const edge = edges.find((e) => e.id === edgeId);
            if (!edge) return;

            const sourceNode = nodes.find((n) => n.id === edge.source);
            const targetNode = nodes.find((n) => n.id === edge.target);
            if (!sourceNode || !targetNode) return;

            const midX = (sourceNode.position.x + targetNode.position.x) / 2;
            const midY = (sourceNode.position.y + targetNode.position.y) / 2;

            const labelNodeId = `labelPoint-${Date.now()}`;
            const labelNode = {
              id: labelNodeId,
              type: 'labelPoint' as const,
              position: { x: midX, y: midY },
              data: { label },
            };

            const branchType = edge.data?.branchType ?? 'main';
            const edge1: TimelineEdge = {
              id: `${edge.source}-${labelNodeId}`,
              source: edge.source,
              target: labelNodeId,
              sourceHandle: edge.sourceHandle,
              targetHandle: 'left',
              type: 'timeline',
              data: { branchType },
            };
            const edge2: TimelineEdge = {
              id: `${labelNodeId}-${edge.target}`,
              source: labelNodeId,
              target: edge.target,
              sourceHandle: 'right',
              targetHandle: edge.targetHandle,
              type: 'timeline',
              data: { branchType },
            };

            set({
              nodes: [...nodes, labelNode as TimelineNode],
              edges: [...edges.filter((e) => e.id !== edgeId), edge1, edge2],
            });
          },

          insertAnnotation: (edgeId, clickPosition) => {
            const { nodes, edges } = get();
            const edge = edges.find((e) => e.id === edgeId);
            if (!edge) return;

            const ts = Date.now();
            const anchorId = `ann-anchor-${ts}`;
            const labelId = `ann-label-${ts}`;

            const anchorNode: TimelineNode = {
              id: anchorId,
              type: 'annotationAnchor',
              position: { x: clickPosition.x, y: clickPosition.y },
              data: {},
            };

            const labelNode: TimelineNode = {
              id: labelId,
              type: 'annotationLabel',
              position: { x: clickPosition.x - 40, y: clickPosition.y - 80 },
              data: { label: 'Annotation' },
            };

            const branchType = edge.data?.branchType ?? 'main';

            // Split original edge: source → anchor → target
            const edge1: TimelineEdge = {
              id: `${edge.source}-${anchorId}`,
              source: edge.source,
              target: anchorId,
              sourceHandle: edge.sourceHandle,
              targetHandle: 'left',
              type: 'timeline',
              data: { branchType },
            };
            const edge2: TimelineEdge = {
              id: `${anchorId}-${edge.target}`,
              source: anchorId,
              target: edge.target,
              sourceHandle: 'right',
              targetHandle: edge.targetHandle,
              type: 'timeline',
              data: { branchType },
            };

            // Connector: anchor → label (dashed line)
            const connector: TimelineEdge = {
              id: `${anchorId}-${labelId}`,
              source: anchorId,
              target: labelId,
              sourceHandle: 'top',
              targetHandle: 'bottom',
              type: 'timeline',
              data: { branchType: 'main', isAnnotationConnector: true },
            };

            set({
              nodes: [...nodes, anchorNode, labelNode],
              edges: [...edges.filter((e) => e.id !== edgeId), edge1, edge2, connector],
            });
          },
        }),
        {
          name: `zelda-tab-${tabId}`,
          partialize: (state: CanvasStore) => ({
            nodes: state.nodes,
            edges: state.edges,
          } as unknown as CanvasStore),
        }
      ),
      {
        limit: 50,
        handleSet: (handleSet) => {
          let timeoutId: ReturnType<typeof setTimeout> | undefined;
          return (state) => {
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
              handleSet(state);
            }, 500);
          };
        },
        partialize: (state) => ({
          nodes: state.nodes,
          edges: state.edges,
        }),
      }
    )
  ) as CanvasStoreWithTemporal;
}
