import { useCallback, useState, useRef } from 'react';
import { useStoreApi, type Node } from '@xyflow/react';
import type { CanvasStoreWithTemporal } from '../stores/canvasStoreFactory';
import { isShiftHeld } from './useShiftKey';
import { incrementCounter } from '../tips/interactionCounters';
import { useSettingsStore } from '../stores/settingsStore';
import { SCREEN_SNAP_THRESHOLD, EMPTY_GUIDES, computeSnap, snapPositionToGrid } from '../utils/snapGuides';
import type { SnapLine } from '../utils/snapGuides';

export function useDragSnap(store: CanvasStoreWithTemporal) {
  const rfStore = useStoreApi();
  const dragStartRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const [snapGuides, setSnapGuides] = useState<SnapLine[]>(EMPTY_GUIDES);
  const gridEnabled = useSettingsStore((s) => s.snapToGrid);

  const applyDragPosition = useCallback((nodeId: string, pos: { x: number; y: number }, dragging: boolean) => {
    const { nodeLookup } = rfStore.getState();
    const internalNode = nodeLookup.get(nodeId);
    if (internalNode) {
      internalNode.position = pos;
      internalNode.internals.positionAbsolute = pos;
    }
    store.getState().onNodesChange([{ type: 'position' as const, id: nodeId, position: pos, dragging }]);
  }, [rfStore, store]);

  const onNodeDragStart = useCallback((_event: React.MouseEvent, node: Node) => {
    dragStartRef.current.set(node.id, { x: node.position.x, y: node.position.y });
  }, []);

  const onNodeDrag = useCallback((_event: React.MouseEvent, node: Node) => {
    const start = dragStartRef.current.get(node.id);
    const zoom = rfStore.getState().transform[2];
    const threshold = SCREEN_SNAP_THRESHOLD / zoom;
    const w = node.measured?.width ?? 0;
    const h = node.measured?.height ?? 0;

    if (gridEnabled) {
      const gridPos = isShiftHeld() && start
        ? (() => {
            const dx = Math.abs(node.position.x - start.x);
            const dy = Math.abs(node.position.y - start.y);
            return dx >= dy
              ? snapPositionToGrid({ x: node.position.x, y: start.y })
              : snapPositionToGrid({ x: start.x, y: node.position.y });
          })()
        : snapPositionToGrid(node.position);
      applyDragPosition(node.id, gridPos, true);
      setSnapGuides(EMPTY_GUIDES);
    } else if (isShiftHeld() && start) {
      const dx = Math.abs(node.position.x - start.x);
      const dy = Math.abs(node.position.y - start.y);

      if (dx >= dy) {
        const constrained = { x: node.position.x, y: start.y };
        const { position, guides } = computeSnap(constrained, w, h, node.id, store.getState().nodes, threshold);
        applyDragPosition(node.id, { x: position.x, y: start.y }, true);
        setSnapGuides(guides.filter(g => g.orientation === 'V'));
      } else {
        const constrained = { x: start.x, y: node.position.y };
        const { position, guides } = computeSnap(constrained, w, h, node.id, store.getState().nodes, threshold);
        applyDragPosition(node.id, { x: start.x, y: position.y }, true);
        setSnapGuides(guides.filter(g => g.orientation === 'H'));
      }
    } else {
      const { position, guides } = computeSnap(node.position, w, h, node.id, store.getState().nodes, threshold);
      if (guides.length > 0) {
        applyDragPosition(node.id, position, true);
      }
      setSnapGuides(guides);
    }
  }, [applyDragPosition, store, rfStore, gridEnabled]);

  const onNodeDragStop = useCallback((_event: React.MouseEvent, node: Node) => {
    const start = dragStartRef.current.get(node.id);
    if (gridEnabled) {
      const pos = isShiftHeld() && start
        ? (() => {
            const dx = Math.abs(node.position.x - start.x);
            const dy = Math.abs(node.position.y - start.y);
            return dx >= dy
              ? snapPositionToGrid({ x: node.position.x, y: start.y })
              : snapPositionToGrid({ x: start.x, y: node.position.y });
          })()
        : snapPositionToGrid(node.position);
      applyDragPosition(node.id, pos, false);
    } else if (start && isShiftHeld()) {
      const dx = Math.abs(node.position.x - start.x);
      const dy = Math.abs(node.position.y - start.y);
      const pos = dx >= dy
        ? { x: node.position.x, y: start.y }
        : { x: start.x, y: node.position.y };
      applyDragPosition(node.id, pos, false);
    }
    dragStartRef.current.delete(node.id);
    setSnapGuides(EMPTY_GUIDES);
    incrementCounter('nodeDrags');
  }, [applyDragPosition, gridEnabled]);

  return { snapGuides, onNodeDragStart, onNodeDrag, onNodeDragStop };
}
