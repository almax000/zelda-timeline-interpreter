import { describe, it, expect, beforeEach } from 'vitest';
import { createCanvasStore, type CanvasStoreWithTemporal } from '../../stores/canvasStoreFactory';
import type { TimelineNode, TimelineEdge } from '../../types/timeline';

let storeCounter = 0;

function makeGameNode(id: string, x = 0, y = 0): TimelineNode {
  return {
    id,
    type: 'game',
    position: { x, y },
    data: { gameId: id },
  };
}

function makeEdge(source: string, target: string): TimelineEdge {
  return {
    id: `e-${source}-${target}`,
    source,
    target,
    type: 'timeline',
    data: { branchType: 'main' },
  };
}

describe('canvasStore', () => {
  let store: CanvasStoreWithTemporal;

  beforeEach(() => {
    storeCounter++;
    store = createCanvasStore(`test-${storeCounter}-${Date.now()}`);
  });

  describe('addNode', () => {
    it('adds a node to the store', () => {
      const node = makeGameNode('game-1');
      store.getState().addNode(node);
      expect(store.getState().nodes).toHaveLength(1);
      expect(store.getState().nodes[0].id).toBe('game-1');
    });

    it('preserves existing nodes', () => {
      store.getState().addNode(makeGameNode('game-1'));
      store.getState().addNode(makeGameNode('game-2'));
      expect(store.getState().nodes).toHaveLength(2);
    });
  });

  describe('removeNode', () => {
    it('removes a node by id', () => {
      store.getState().addNode(makeGameNode('game-1'));
      store.getState().addNode(makeGameNode('game-2'));
      store.getState().removeNode('game-1');
      expect(store.getState().nodes).toHaveLength(1);
      expect(store.getState().nodes[0].id).toBe('game-2');
    });

    it('also removes connected edges', () => {
      store.getState().addNode(makeGameNode('game-1'));
      store.getState().addNode(makeGameNode('game-2'));
      store.getState().setEdges([makeEdge('game-1', 'game-2')]);
      store.getState().removeNode('game-1');
      expect(store.getState().edges).toHaveLength(0);
    });
  });

  describe('removeEdge', () => {
    it('removes an edge by id', () => {
      const edge = makeEdge('a', 'b');
      store.getState().setEdges([edge]);
      store.getState().removeEdge(edge.id);
      expect(store.getState().edges).toHaveLength(0);
    });
  });

  describe('loadTimeline', () => {
    it('replaces nodes and edges', () => {
      store.getState().addNode(makeGameNode('old'));
      const newNodes = [makeGameNode('new-1'), makeGameNode('new-2')];
      const newEdges = [makeEdge('new-1', 'new-2')];
      store.getState().loadTimeline(newNodes, newEdges);
      expect(store.getState().nodes).toHaveLength(2);
      expect(store.getState().edges).toHaveLength(1);
    });
  });

  describe('clearTimeline', () => {
    it('removes all nodes and edges', () => {
      store.getState().addNode(makeGameNode('game-1'));
      store.getState().setEdges([makeEdge('game-1', 'game-2')]);
      store.getState().clearTimeline();
      expect(store.getState().nodes).toHaveLength(0);
      expect(store.getState().edges).toHaveLength(0);
    });
  });

  describe('updateEdgeBranchType', () => {
    it('updates the branch type of an edge', () => {
      const edge = makeEdge('a', 'b');
      store.getState().setEdges([edge]);
      store.getState().updateEdgeBranchType(edge.id, 'child');
      expect(store.getState().edges[0].data!.branchType).toBe('child');
    });
  });

  describe('updateEdgeLabel', () => {
    it('updates the label of an edge', () => {
      const edge = makeEdge('a', 'b');
      store.getState().setEdges([edge]);
      store.getState().updateEdgeLabel(edge.id, 'Hero Defeated');
      expect(store.getState().edges[0].data!.label).toBe('Hero Defeated');
    });
  });

  describe('updateNodeData', () => {
    it('merges data into a node', () => {
      store.getState().addNode(makeGameNode('game-1'));
      store.getState().updateNodeData('game-1', { label: 'Updated' });
      expect(store.getState().nodes[0].data.label).toBe('Updated');
    });
  });

  describe('selectedBranchType', () => {
    it('defaults to main', () => {
      expect(store.getState().selectedBranchType).toBe('main');
    });

    it('can be changed', () => {
      store.getState().setSelectedBranchType('fallen');
      expect(store.getState().selectedBranchType).toBe('fallen');
    });
  });

  describe('addEdge', () => {
    it('creates an edge with the selected branch type', () => {
      store.getState().setSelectedBranchType('adult');
      store.getState().addEdge({
        source: 'a',
        target: 'b',
        sourceHandle: null,
        targetHandle: null,
      });
      expect(store.getState().edges).toHaveLength(1);
      expect(store.getState().edges[0].data!.branchType).toBe('adult');
    });
  });

  describe('undo/redo', () => {
    it('can undo and redo node additions', async () => {
      store.getState().addNode(makeGameNode('game-1'));
      // Wait for throttled temporal
      await new Promise((r) => setTimeout(r, 600));

      store.getState().addNode(makeGameNode('game-2'));
      await new Promise((r) => setTimeout(r, 600));

      expect(store.getState().nodes).toHaveLength(2);

      store.temporal.getState().undo();
      expect(store.getState().nodes).toHaveLength(1);

      store.temporal.getState().redo();
      expect(store.getState().nodes).toHaveLength(2);
    });
  });

  describe('duplicateSelected', () => {
    it('duplicates selected nodes with offset', () => {
      const node = makeGameNode('game-1', 100, 200);
      (node as { selected?: boolean }).selected = true;
      store.getState().setNodes([node]);
      store.getState().duplicateSelected();

      const nodes = store.getState().nodes;
      expect(nodes).toHaveLength(2);
      const dup = nodes.find((n) => n.id !== 'game-1')!;
      expect(dup.position.x).toBe(130); // 100 + 30 offset
      expect(dup.position.y).toBe(230); // 200 + 30 offset
    });

    it('does nothing when no nodes are selected', () => {
      store.getState().addNode(makeGameNode('game-1'));
      store.getState().duplicateSelected();
      expect(store.getState().nodes).toHaveLength(1);
    });
  });
});
