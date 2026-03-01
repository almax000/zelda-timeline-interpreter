import { useCallback } from 'react';
import type { CanvasStoreWithTemporal } from '../stores/canvasStoreFactory';
import { useUIStore } from '../stores/uiStore';
import type { TimelineNode } from '../types/timeline';

type ScreenToFlowFn = (position: { x: number; y: number }) => { x: number; y: number };

export function useToolPlacement(options: {
  store: CanvasStoreWithTemporal;
  screenToFlowPosition: ScreenToFlowFn;
  isLocked: boolean;
  onDismissWelcome: () => void;
  onCloseContextMenu: () => void;
}) {
  const { store, screenToFlowPosition, isLocked, onDismissWelcome, onCloseContextMenu } = options;
  const activeTool = useUIStore((s) => s.activeTool);
  const resetTool = useUIStore((s) => s.resetTool);
  const addNode = store((s) => s.addNode);
  const splitEdgeWithLabel = store((s) => s.splitEdgeWithLabel);
  const selectedBranchType = store((s) => s.selectedBranchType);

  const isPlacementTool = activeTool === 'split' || activeTool === 'text' || activeTool === 'annotate';

  const placeEventPoint = useCallback(
    (event: React.MouseEvent) => {
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      position.x -= 12;
      position.y -= 12;
      addNode({
        id: `event-${Date.now()}`,
        type: 'event',
        position,
        data: { branchType: selectedBranchType },
      } as TimelineNode);
    },
    [addNode, screenToFlowPosition, selectedBranchType]
  );

  const onPaneClick = useCallback(
    (event: React.MouseEvent) => {
      onCloseContextMenu();
      onDismissWelcome();

      if (isLocked) return;

      if (activeTool === 'annotate') {
        placeEventPoint(event);
        return;
      }

      if (activeTool === 'split') {
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });
        addNode({
          id: `split-${Date.now()}`,
          type: 'split',
          position,
          data: { label: 'Event', branchType: selectedBranchType },
        } as TimelineNode);
        resetTool();
        return;
      }

      if (activeTool === 'text') {
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });
        addNode({
          id: `text-${Date.now()}`,
          type: 'textLabel',
          position,
          data: {
            text: '',
            width: 160,
            fontSize: 16,
            fontWeight: 'normal',
            fontStyle: 'normal',
            textAlign: 'left',
            textColor: 'var(--color-text)',
          },
        } as TimelineNode);
        resetTool();
        return;
      }
    },
    [activeTool, isLocked, addNode, screenToFlowPosition, resetTool, placeEventPoint, selectedBranchType, onCloseContextMenu, onDismissWelcome]
  );

  const onEdgeClick = useCallback(
    (event: React.MouseEvent, edge: { id: string }) => {
      if (isLocked || activeTool !== 'annotate') return;
      const flowPosition = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      splitEdgeWithLabel(edge.id, '', flowPosition, selectedBranchType);
    },
    [isLocked, activeTool, screenToFlowPosition, splitEdgeWithLabel, selectedBranchType]
  );

  return { isPlacementTool, activeTool, selectedBranchType, onPaneClick, onEdgeClick };
}
