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
  updateNodeData: (nodeId: string, data: Partial<Record<string, unknown>>) => void;
  splitEdgeWithLabel: (edgeId: string, label: string, clickPosition?: { x: number; y: number }, branchType?: BranchType) => void;
  insertAnnotation: (edgeId: string, clickPosition: { x: number; y: number }) => void;
  duplicateSelected: () => void;
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

          updateNodeData: (nodeId, dataUpdate) => {
            set({
              nodes: get().nodes.map((n) =>
                n.id === nodeId ? { ...n, data: { ...n.data, ...dataUpdate } } as typeof n : n
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

          splitEdgeWithLabel: (edgeId, label, clickPosition, overrideBranchType) => {
            const EVENT_NODE_HALF_SIZE = 12;
            const { nodes, edges } = get();
            const edge = edges.find((e) => e.id === edgeId);
            if (!edge) return;

            const sourceNode = nodes.find((n) => n.id === edge.source);
            const targetNode = nodes.find((n) => n.id === edge.target);
            if (!sourceNode || !targetNode) return;

            // Use click X but snap Y to edge line (handle center Y of source/target)
            const sourceHandleY = sourceNode.position.y + (sourceNode.measured?.height ?? 0) / 2;
            const targetHandleY = targetNode.position.y + (targetNode.measured?.height ?? 0) / 2;
            const edgeLineY = (sourceHandleY + targetHandleY) / 2;

            const posX = clickPosition
              ? clickPosition.x - EVENT_NODE_HALF_SIZE
              : (sourceNode.position.x + targetNode.position.x) / 2 - EVENT_NODE_HALF_SIZE;
            const posY = edgeLineY - EVENT_NODE_HALF_SIZE;

            const labelNodeId = `event-${Date.now()}`;
            const branchType = overrideBranchType ?? edge.data?.branchType ?? 'main';
            const labelNode = {
              id: labelNodeId,
              type: 'event' as const,
              position: { x: posX, y: posY },
              data: { label, branchType },
            };
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

          duplicateSelected: () => {
            const { nodes, edges } = get();
            const selectedNodes = nodes.filter((n) => n.selected);
            if (selectedNodes.length === 0) return;

            const OFFSET = 30;
            const ts = Date.now();
            const idMap = new Map<string, string>();

            // Clone nodes with new IDs and offset
            const newNodes = selectedNodes.map((n, i) => {
              const newId = `${n.type}-dup-${ts}-${i}`;
              idMap.set(n.id, newId);
              return {
                ...n,
                id: newId,
                position: { x: n.position.x + OFFSET, y: n.position.y + OFFSET },
                selected: true,
              };
            });

            // Clone edges where both endpoints are in the selected set
            const selectedIds = new Set(selectedNodes.map((n) => n.id));
            const newEdges = edges
              .filter((e) => selectedIds.has(e.source) && selectedIds.has(e.target))
              .map((e) => ({
                ...e,
                id: `${idMap.get(e.source)}-${idMap.get(e.target)}`,
                source: idMap.get(e.source)!,
                target: idMap.get(e.target)!,
                selected: true,
              }));

            // Deselect originals
            const updatedNodes = nodes.map((n) =>
              n.selected ? { ...n, selected: false } : n
            );
            const updatedEdges = edges.map((e) =>
              e.selected ? { ...e, selected: false } : e
            );

            set({
              nodes: [...updatedNodes, ...newNodes] as TimelineNode[],
              edges: [...updatedEdges, ...newEdges] as TimelineEdge[],
            });
          },

          insertAnnotation: (_edgeId, clickPosition) => {
            const EVENT_NODE_HALF_SIZE = 12;
            const { nodes } = get();
            const eventNode: TimelineNode = {
              id: `event-${Date.now()}`,
              type: 'event',
              position: { x: clickPosition.x - EVENT_NODE_HALF_SIZE, y: clickPosition.y - EVENT_NODE_HALF_SIZE },
              data: {},
            };
            set({ nodes: [...nodes, eventNode] });
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
