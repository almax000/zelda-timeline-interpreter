import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  applyNodeChanges,
  applyEdgeChanges,
  type Connection,
  type NodeChange,
  type EdgeChange,
} from '@xyflow/react';
import type { TimelineNode, TimelineEdge, BranchType } from '../types/timeline';

interface TimelineStore {
  nodes: TimelineNode[];
  edges: TimelineEdge[];
  selectedBranchType: BranchType;

  // Actions
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
}

export const useTimelineStore = create<TimelineStore>()(
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
          data: {
            branchType: selectedBranchType,
          },
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
    }),
    {
      name: 'zelda-timeline-storage',
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
      }),
    }
  )
);
