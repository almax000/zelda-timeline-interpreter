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
        }),
        {
          name: `zelda-tab-${tabId}`,
          partialize: (state) => ({
            nodes: state.nodes,
            edges: state.edges,
          }),
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
