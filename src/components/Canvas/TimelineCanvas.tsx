import { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  useReactFlow,
  useStoreApi,
  useViewport,
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
import { getCanvasStore } from '../../stores/canvasRegistry';
import { useAnnotationStore } from '../../stores/annotationStore';
import { useTabStore } from '../../stores/tabStore';
import { useUIStore } from '../../stores/uiStore';
import { useSpacePan } from '../../hooks/useSpacePan';
import { isShiftHeld } from '../../hooks/useShiftKey';
import type { TimelineNode } from '../../types/timeline';
import type { BranchType } from '../../types/timeline';

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

// --- Smart Snap Guides ---
const SCREEN_SNAP_THRESHOLD = 5;

interface SnapLine {
  position: number;
  orientation: 'H' | 'V';
  from: number;
  to: number;
}

const EMPTY_GUIDES: SnapLine[] = [];

function mergeGuides(guides: SnapLine[]): SnapLine[] {
  const map = new Map<string, SnapLine>();
  for (const g of guides) {
    const key = `${g.orientation}:${g.position}`;
    const existing = map.get(key);
    if (existing) {
      existing.from = Math.min(existing.from, g.from);
      existing.to = Math.max(existing.to, g.to);
    } else {
      map.set(key, { ...g });
    }
  }
  return Array.from(map.values());
}

function computeSnap(
  pos: { x: number; y: number },
  w: number,
  h: number,
  dragId: string,
  allNodes: TimelineNode[],
  threshold: number,
): { position: { x: number; y: number }; guides: SnapLine[] } {
  const dragX = [pos.x, pos.x + w / 2, pos.x + w];
  const dragY = [pos.y, pos.y + h / 2, pos.y + h];

  // Phase 1: find nearest snap offset per axis
  let bestXOffset = 0, bestYOffset = 0;
  let minDx = threshold + 1, minDy = threshold + 1;

  for (const n of allNodes) {
    if (n.id === dragId || n.selected) continue;
    const nw = n.measured?.width ?? 0, nh = n.measured?.height ?? 0;
    for (const dx of dragX)
      for (const ox of [n.position.x, n.position.x + nw / 2, n.position.x + nw]) {
        const diff = Math.abs(dx - ox);
        if (diff < minDx) { minDx = diff; bestXOffset = ox - dx; }
      }
    for (const dy of dragY)
      for (const oy of [n.position.y, n.position.y + nh / 2, n.position.y + nh]) {
        const diff = Math.abs(dy - oy);
        if (diff < minDy) { minDy = diff; bestYOffset = oy - dy; }
      }
  }

  const snapped = { x: pos.x, y: pos.y };
  if (minDx <= threshold) snapped.x += bestXOffset;
  if (minDy <= threshold) snapped.y += bestYOffset;

  // Phase 2: collect bounded guide segments for all exact matches
  const guides: SnapLine[] = [];
  const EXT = 8;
  const snappedXEdges = [snapped.x, snapped.x + w / 2, snapped.x + w];
  const snappedYEdges = [snapped.y, snapped.y + h / 2, snapped.y + h];

  for (const n of allNodes) {
    if (n.id === dragId || n.selected) continue;
    const nw = n.measured?.width ?? 0, nh = n.measured?.height ?? 0;

    for (const sx of snappedXEdges)
      for (const ox of [n.position.x, n.position.x + nw / 2, n.position.x + nw])
        if (Math.abs(sx - ox) < 0.5) {
          const top = Math.min(snapped.y, n.position.y) - EXT;
          const bottom = Math.max(snapped.y + h, n.position.y + nh) + EXT;
          guides.push({ position: ox, orientation: 'V', from: top, to: bottom });
        }

    for (const sy of snappedYEdges)
      for (const oy of [n.position.y, n.position.y + nh / 2, n.position.y + nh])
        if (Math.abs(sy - oy) < 0.5) {
          const left = Math.min(snapped.x, n.position.x) - EXT;
          const right = Math.max(snapped.x + w, n.position.x + nw) + EXT;
          guides.push({ position: oy, orientation: 'H', from: left, to: right });
        }
  }

  return { position: snapped, guides: mergeGuides(guides) };
}

function SnapGuidesOverlay({ guides }: { guides: SnapLine[] }) {
  const { x: vx, y: vy, zoom } = useViewport();
  if (guides.length === 0) return null;

  const tx = (v: number) => v * zoom + vx;
  const ty = (v: number) => v * zoom + vy;

  return (
    <svg className="absolute inset-0 pointer-events-none z-50" overflow="visible">
      {guides.map((g, i) =>
        g.orientation === 'V'
          ? <line key={i} x1={tx(g.position)} y1={ty(g.from)} x2={tx(g.position)} y2={ty(g.to)}
                  stroke="#FF44CC" strokeWidth={1} />
          : <line key={i} x1={tx(g.from)} y1={ty(g.position)} x2={tx(g.to)} y2={ty(g.position)}
                  stroke="#FF44CC" strokeWidth={1} />
      )}
    </svg>
  );
}

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

  const tab = useTabStore((s) => s.tabs.find((t) => t.id === tabId));
  const isLocked = tab?.isLocked ?? false;

  const activeTool = useUIStore((s) => s.activeTool);
  const resetTool = useUIStore((s) => s.resetTool);
  const spaceHeld = useSpacePan();
  const dragStartRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const [snapGuides, setSnapGuides] = useState<SnapLine[]>(EMPTY_GUIDES);

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
          data: { label: 'Event' },
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
    </div>
  );
}
