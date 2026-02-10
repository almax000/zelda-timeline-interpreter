import { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  useReactFlow,
  type Connection,
  type NodeTypes,
  type EdgeTypes,
  type OnConnect,
  BackgroundVariant,
  type OnNodesChange,
  type OnEdgesChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { GameNode } from './GameNode';
import { EventNode } from './EventNode';
import { GuideNode } from './GuideNode';
import { ImageNode } from './ImageNode';
import { ShapeNode } from './ShapeNode';
import { LabelPointNode } from './LabelPointNode';
import { AnnotationAnchorNode } from './AnnotationAnchorNode';
import { AnnotationLabelNode } from './AnnotationLabelNode';
import { TimelineEdge } from './TimelineEdge';
import { ContextMenu } from './ContextMenu';
import { AnnotationOverlay } from '../Annotation/AnnotationOverlay';
import { getCanvasStore } from '../../stores/canvasRegistry';
import { useAnnotationStore } from '../../stores/annotationStore';
import { useTabStore } from '../../stores/tabStore';
import { useUIStore } from '../../stores/uiStore';
import { useSpacePan } from '../../hooks/useSpacePan';
import type { TimelineNode } from '../../types/timeline';
import type { BranchType } from '../../types/timeline';

const nodeTypes: NodeTypes = {
  game: GameNode as NodeTypes['game'],
  event: EventNode as NodeTypes['event'],
  guide: GuideNode as NodeTypes['guide'],
  image: ImageNode as NodeTypes['image'],
  shape: ShapeNode as NodeTypes['shape'],
  labelPoint: LabelPointNode as NodeTypes['labelPoint'],
  annotationAnchor: AnnotationAnchorNode as NodeTypes['annotationAnchor'],
  annotationLabel: AnnotationLabelNode as NodeTypes['annotationLabel'],
};

const edgeTypes: EdgeTypes = {
  timeline: TimelineEdge as EdgeTypes['timeline'],
};

interface ContextMenuState {
  x: number;
  y: number;
  type: 'node' | 'edge' | 'pane';
  targetId: string;
}

interface TimelineCanvasProps {
  tabId: string;
}

export function TimelineCanvas({ tabId }: TimelineCanvasProps) {
  const { screenToFlowPosition } = useReactFlow();
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const isAnnotationMode = useAnnotationStore((s) => s.isAnnotationMode);

  const tab = useTabStore((s) => s.tabs.find((t) => t.id === tabId));
  const isLocked = tab?.isLocked ?? false;

  const activeTool = useUIStore((s) => s.activeTool);
  const activeShapeTool = useUIStore((s) => s.activeShapeTool);
  const resetTool = useUIStore((s) => s.resetTool);
  const spaceHeld = useSpacePan();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setContainerSize({ width, height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Paste handler for images
  useEffect(() => {
    if (isLocked) return;
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const blob = item.getAsFile();
          if (!blob) return;
          const reader = new FileReader();
          reader.onload = () => {
            const src = reader.result as string;
            const img = new Image();
            img.onload = () => {
              const maxW = 400;
              const ratio = Math.min(1, maxW / img.width);
              const width = Math.round(img.width * ratio);
              const height = Math.round(img.height * ratio);
              const position = screenToFlowPosition({
                x: containerSize.width / 2,
                y: containerSize.height / 2,
              });
              const store = getCanvasStore(tabId);
              store.getState().addNode({
                id: `img-${Date.now()}`,
                type: 'image',
                position,
                data: { src, width, height },
              } as TimelineNode);
            };
            img.src = src;
          };
          reader.readAsDataURL(blob);
          break;
        }
      }
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [isLocked, tabId, screenToFlowPosition, containerSize]);

  const store = getCanvasStore(tabId);
  const { nodes, edges, onNodesChange, onEdgesChange, addNode, addEdge, removeNode, removeEdge, updateEdgeBranchType, updateEdgeLabel, splitEdgeWithLabel, insertAnnotation } = store();

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      if (isLocked) return;
      addEdge(connection);
    },
    [addEdge, isLocked]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (isLocked) return;

      const gameId = event.dataTransfer.getData('application/zelda-game');
      if (!gameId) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: TimelineNode = {
        id: `game-${gameId}-${Date.now()}`,
        type: 'game',
        position,
        data: { gameId },
      };

      addNode(newNode);
    },
    [addNode, screenToFlowPosition, isLocked]
  );

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: TimelineNode) => {
      if (isLocked) return;
      event.preventDefault();
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        type: 'node',
        targetId: node.id,
      });
    },
    [isLocked]
  );

  const onEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: { id: string }) => {
      if (isLocked) return;
      event.preventDefault();
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        type: 'edge',
        targetId: edge.id,
      });
    },
    [isLocked]
  );

  const onPaneClick = useCallback(
    (event: React.MouseEvent) => {
      setContextMenu(null);

      // Shape placement on pane click
      if (activeShapeTool && !isLocked) {
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });
        addNode({
          id: `shape-${Date.now()}`,
          type: 'shape',
          position,
          data: {
            shapeType: activeShapeTool,
            width: activeShapeTool === 'line' || activeShapeTool === 'arrow' ? 150 : 100,
            height: activeShapeTool === 'line' || activeShapeTool === 'arrow' ? 40 : 100,
            fill: 'transparent',
            stroke: 'var(--color-text)',
            strokeWidth: 2,
          },
        } as TimelineNode);
        resetTool();
      }
    },
    [activeShapeTool, isLocked, addNode, screenToFlowPosition, resetTool]
  );

  const onPaneContextMenu = useCallback(
    (event: MouseEvent | React.MouseEvent) => {
      if (isLocked) return;
      event.preventDefault();
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        type: 'pane',
        targetId: '',
      });
    },
    [isLocked]
  );

  const onEdgeClick = useCallback(
    (event: React.MouseEvent, edge: { id: string }) => {
      if (isLocked || activeTool !== 'annotate') return;
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      insertAnnotation(edge.id, position);
      resetTool();
    },
    [isLocked, activeTool, screenToFlowPosition, insertAnnotation, resetTool]
  );

  const contextEdge = contextMenu?.type === 'edge'
    ? edges.find((e) => e.id === contextMenu.targetId)
    : null;

  const defaultEdgeOptions = useMemo(() => ({
    type: 'timeline',
    animated: false,
    interactionWidth: 20,
  }), []);

  const interactionDisabled = isLocked || isAnnotationMode;

  // Cursor style for shape placement, annotate mode, or space-pan
  const cursorClass = (activeShapeTool || activeTool === 'annotate') && !isLocked
    ? 'cursor-crosshair'
    : spaceHeld
      ? 'space-pan'
      : '';

  return (
    <div ref={containerRef} className={`flex-1 h-full relative ${cursorClass}`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={isLocked ? undefined : onNodesChange as OnNodesChange}
        onEdgesChange={isLocked ? undefined : onEdgesChange as OnEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onNodeContextMenu={onNodeContextMenu}
        onEdgeContextMenu={onEdgeContextMenu}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onPaneContextMenu={onPaneContextMenu}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        snapToGrid
        snapGrid={[20, 20]}
        fitView
        minZoom={0.1}
        maxZoom={2}
        nodesDraggable={!interactionDisabled}
        nodesConnectable={!interactionDisabled}
        elementsSelectable={!interactionDisabled}
        panOnDrag={spaceHeld && !isAnnotationMode && !activeShapeTool}
        zoomOnScroll={!isAnnotationMode}
        deleteKeyCode={interactionDisabled ? [] : ['Backspace', 'Delete']}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="var(--color-surface-light)"
        />
      </ReactFlow>

      {!isLocked && (
        <AnnotationOverlay tabId={tabId} width={containerSize.width} height={containerSize.height} />
      )}

      {contextMenu && !isLocked && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          type={contextMenu.type}
          edgeBranchType={contextEdge?.data?.branchType}
          edgeLabel={contextEdge?.data?.label}
          onDelete={() => {
            if (contextMenu.type === 'node') {
              removeNode(contextMenu.targetId);
            } else if (contextMenu.type === 'edge') {
              removeEdge(contextMenu.targetId);
            }
          }}
          onChangeBranch={(branchType: BranchType) => {
            updateEdgeBranchType(contextMenu.targetId, branchType);
          }}
          onChangeLabel={(label: string) => {
            updateEdgeLabel(contextMenu.targetId, label);
          }}
          onSplitEdge={(label: string) => {
            splitEdgeWithLabel(contextMenu.targetId, label);
          }}
          onAddEvent={() => {
            const position = screenToFlowPosition({
              x: contextMenu.x,
              y: contextMenu.y,
            });
            addNode({
              id: `event-${Date.now()}`,
              type: 'event',
              position,
              data: { label: 'New Event', isEraMarker: false },
            } as TimelineNode);
          }}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
