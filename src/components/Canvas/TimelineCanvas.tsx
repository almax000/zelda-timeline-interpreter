import { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  useReactFlow,
  useStoreApi,
  ConnectionLineType,
  type Connection,
  type NodeTypes,
  type EdgeTypes,
  type OnConnect,
  BackgroundVariant,
  type OnNodesChange,
  type OnEdgesChange,
  type NodeChange,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { GameNode } from './GameNode';
import { EventNode } from './EventNode';
import { ImageNode } from './ImageNode';
import { ShapeNode } from './ShapeNode';
import { LabelPointNode } from './LabelPointNode';
import { SplitNode } from './SplitNode';
import { TextNode } from './TextNode';
import { TimelineEdge } from './TimelineEdge';
import { ContextMenu } from './ContextMenu';
import { AnnotationOverlay } from '../Annotation/AnnotationOverlay';
import { WelcomeScreen } from '../UI/WelcomeScreen';
import { ContextualHint } from '../UI/ContextualHint';
import { useTips } from '../../hooks/useTips';
import { incrementCounter } from '../../tips/interactionCounters';
import { getCanvasStore } from '../../stores/canvasRegistry';
import { useAnnotationStore } from '../../stores/annotationStore';
import { useTabStore } from '../../stores/tabStore';
import { useUIStore } from '../../stores/uiStore';
import { useSpacePan } from '../../hooks/useSpacePan';
import { isShiftHeld } from '../../hooks/useShiftKey';
import type { TimelineNode } from '../../types/timeline';
import type { BranchType } from '../../types/timeline';
import { officialTimelineNodes, officialTimelineEdges } from '../../data/officialTimeline';
import { SCREEN_SNAP_THRESHOLD, EMPTY_GUIDES, computeSnap, SnapGuidesOverlay } from '../../utils/snapGuides';
import type { SnapLine } from '../../utils/snapGuides';

const nodeTypes: NodeTypes = {
  game: GameNode as NodeTypes['game'],
  event: EventNode as NodeTypes['event'],
  image: ImageNode as NodeTypes['image'],
  shape: ShapeNode as NodeTypes['shape'],
  labelPoint: LabelPointNode as NodeTypes['labelPoint'],
  split: SplitNode as NodeTypes['split'],
  textLabel: TextNode as NodeTypes['textLabel'],
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
  const rfStore = useStoreApi();
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const isAnnotationMode = useAnnotationStore((s) => s.isAnnotationMode);
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);

  const tab = useTabStore((s) => s.tabs.find((t) => t.id === tabId));
  const isLocked = tab?.isLocked ?? false;

  const activeTool = useUIStore((s) => s.activeTool);
  const resetTool = useUIStore((s) => s.resetTool);
  const spaceHeld = useSpacePan();
  const dragStartRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const [snapGuides, setSnapGuides] = useState<SnapLine[]>(EMPTY_GUIDES);
  const currentTip = useTips(tabId, welcomeDismissed);

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
  const { nodes, edges, onNodesChange, onEdgesChange, addNode, addEdge, removeNode, removeEdge, updateEdgeBranchType, splitEdgeWithLabel } = store();

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
      setWelcomeDismissed(true);
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

  const isPlacementTool = activeTool === 'split' || activeTool === 'text' || activeTool === 'annotate';

  const selectedBranchType = store((s) => s.selectedBranchType);

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
      setContextMenu(null);
      setWelcomeDismissed(true);

      if (isLocked) return;

      // Event Point placement
      if (activeTool === 'annotate') {
        placeEventPoint(event);
        return;
      }

      // Split placement
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

      // Text placement
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
    [activeTool, isLocked, addNode, screenToFlowPosition, resetTool, placeEventPoint]
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
      const flowPosition = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      splitEdgeWithLabel(edge.id, '', flowPosition, selectedBranchType);
    },
    [isLocked, activeTool, screenToFlowPosition, splitEdgeWithLabel, selectedBranchType]
  );

  const contextEdge = contextMenu?.type === 'edge'
    ? edges.find((e) => e.id === contextMenu.targetId)
    : null;

  const handleNodesChange = useCallback((changes: NodeChange<TimelineNode>[]) => {
    onNodesChange(changes);
  }, [onNodesChange]);

  // Shift-constrained drag: capture start position
  const onNodeDragStart = useCallback((_event: React.MouseEvent, node: Node) => {
    dragStartRef.current.set(node.id, { x: node.position.x, y: node.position.y });
  }, []);

  // Drag handler: Shift = axis-constrain, otherwise = smart snap guides.
  // Directly mutates ReactFlow's internal nodeLookup to override XYDrag.
  const applyDragPosition = useCallback((nodeId: string, pos: { x: number; y: number }, dragging: boolean) => {
    const { nodeLookup } = rfStore.getState();
    const internalNode = nodeLookup.get(nodeId);
    if (internalNode) {
      internalNode.position = pos;
      internalNode.internals.positionAbsolute = pos;
    }
    store.getState().onNodesChange([{ type: 'position' as const, id: nodeId, position: pos, dragging }]);
  }, [rfStore, store]);

  const onNodeDrag = useCallback((_event: React.MouseEvent, node: Node) => {
    const start = dragStartRef.current.get(node.id);
    const zoom = rfStore.getState().transform[2];
    const threshold = SCREEN_SNAP_THRESHOLD / zoom;
    const w = node.measured?.width ?? 0;
    const h = node.measured?.height ?? 0;

    if (isShiftHeld() && start) {
      const dx = Math.abs(node.position.x - start.x);
      const dy = Math.abs(node.position.y - start.y);

      if (dx >= dy) {
        // Horizontal constraint: Y locked, X can still snap
        const constrained = { x: node.position.x, y: start.y };
        const { position, guides } = computeSnap(constrained, w, h, node.id, store.getState().nodes, threshold);
        applyDragPosition(node.id, { x: position.x, y: start.y }, true);
        setSnapGuides(guides.filter(g => g.orientation === 'V'));
      } else {
        // Vertical constraint: X locked, Y can still snap
        const constrained = { x: start.x, y: node.position.y };
        const { position, guides } = computeSnap(constrained, w, h, node.id, store.getState().nodes, threshold);
        applyDragPosition(node.id, { x: start.x, y: position.y }, true);
        setSnapGuides(guides.filter(g => g.orientation === 'H'));
      }
    } else {
      // Free drag + smart snap
      const { position, guides } = computeSnap(node.position, w, h, node.id, store.getState().nodes, threshold);
      if (guides.length > 0) {
        applyDragPosition(node.id, position, true);
      }
      setSnapGuides(guides);
    }
  }, [applyDragPosition, store, rfStore]);

  const onNodeDragStop = useCallback((_event: React.MouseEvent, node: Node) => {
    const start = dragStartRef.current.get(node.id);
    if (start && isShiftHeld()) {
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
  }, [applyDragPosition]);

  const defaultEdgeOptions = useMemo(() => ({
    type: 'timeline',
    animated: false,
    interactionWidth: 20,
  }), []);

  const interactionDisabled = isLocked || isAnnotationMode;
  const selectedCount = nodes.filter((n) => n.selected).length + edges.filter((e) => e.selected).length;

  // Cursor style for placement tools, annotate mode, or space-pan
  const cursorClass = isPlacementTool && !isLocked
    ? activeTool === 'annotate'
      ? 'cursor-diamond'
      : activeTool === 'split'
        ? 'cursor-split'
        : 'cursor-crosshair'
    : spaceHeld
      ? 'space-pan'
      : '';

  return (
    <div ref={containerRef} className={`flex-1 h-full relative ${cursorClass}`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={isLocked ? undefined : handleNodesChange as OnNodesChange}
        onEdgesChange={isLocked ? undefined : onEdgesChange as OnEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onNodeDragStart={onNodeDragStart}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        onNodeContextMenu={onNodeContextMenu}
        onEdgeContextMenu={onEdgeContextMenu}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onPaneContextMenu={onPaneContextMenu}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        minZoom={0.1}
        maxZoom={2}
        nodesDraggable={!interactionDisabled}
        nodesConnectable={!interactionDisabled}
        elementsSelectable={!interactionDisabled}
        selectionOnDrag={activeTool === 'select' && !spaceHeld && !isLocked}
        selectionKeyCode={null}
        panOnDrag={spaceHeld && !isAnnotationMode && !isPlacementTool}
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

      <SnapGuidesOverlay guides={snapGuides} />

      {!isLocked && (
        <AnnotationOverlay tabId={tabId} width={containerSize.width} height={containerSize.height} />
      )}

      {selectedCount > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[var(--color-surface)] border border-[var(--color-gold)] text-[var(--color-gold)] text-xs font-medium px-3 py-1.5 rounded-full shadow-lg pointer-events-none">
          {selectedCount} selected
        </div>
      )}

      {contextMenu && !isLocked && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          type={contextMenu.type}
          edgeBranchType={contextEdge?.data?.branchType}
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
          onAddEvent={() => {
            const position = screenToFlowPosition({
              x: contextMenu.x,
              y: contextMenu.y,
            });
            position.x -= 12;
            position.y -= 12;
            addNode({
              id: `event-${Date.now()}`,
              type: 'event',
              position,
              data: { branchType: selectedBranchType },
            } as TimelineNode);
          }}
          onClose={() => setContextMenu(null)}
        />
      )}

      {nodes.length === 0 && !welcomeDismissed && (
        <WelcomeScreen
          onLoadOfficial={() => {
            store.getState().loadTimeline(officialTimelineNodes, officialTimelineEdges);
            setWelcomeDismissed(true);
          }}
          onStartBlank={() => setWelcomeDismissed(true)}
        />
      )}

      <ContextualHint tipConfig={currentTip} />
    </div>
  );
}
