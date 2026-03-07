/* eslint-disable react-hooks/preserve-manual-memoization */
import { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  useReactFlow,
  ConnectionLineType,
  PanOnScrollMode,
  type Connection,
  type NodeTypes,
  type EdgeTypes,
  type OnConnect,
  BackgroundVariant,
  type OnNodesChange,
  type OnEdgesChange,
  type NodeChange,
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
import { OnboardingOverlay } from '../Onboarding/OnboardingOverlay';
import { useTips } from '../../hooks/useTips';
import { useDragSnap } from '../../hooks/useDragSnap';
import { useContextMenu } from '../../hooks/useContextMenu';
import { useImagePaste } from '../../hooks/useImagePaste';
import { useToolPlacement } from '../../hooks/useToolPlacement';
import { getCanvasStore } from '../../stores/canvasRegistry';
import { useAnnotationStore } from '../../stores/annotationStore';
import { useTabStore } from '../../stores/tabStore';
import { useCanvasModifiers } from '../../hooks/useCanvasModifiers';
import { STORAGE_KEYS } from '../../constants';
import type { TimelineNode } from '../../types/timeline';
import type { BranchType } from '../../types/timeline';
import { officialTimelineNodes, officialTimelineEdges } from '../../data/officialTimeline';
import { SnapGuidesOverlay } from '../../utils/SnapGuidesOverlay';

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

interface TimelineCanvasProps {
  tabId: string;
}

export function TimelineCanvas({ tabId }: TimelineCanvasProps) {
  const { screenToFlowPosition, fitView } = useReactFlow();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const isAnnotationMode = useAnnotationStore((s) => s.isAnnotationMode);
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(
    () => localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE) === 'true',
  );

  const tab = useTabStore((s) => s.tabs.find((t) => t.id === tabId));
  const isLocked = tab?.isLocked ?? false;

  const { spaceHeld } = useCanvasModifiers();
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
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

  useImagePaste(tabId, isLocked, screenToFlowPosition, containerSize);

  const store = getCanvasStore(tabId);
  const { nodes, edges, onNodesChange, onEdgesChange, addNode, addEdge, removeNode, removeEdge, updateEdgeBranchType } = store();
  const { snapGuides, onNodeDragStart, onNodeDrag, onNodeDragStop } = useDragSnap(store);
  const { contextMenu, closeContextMenu, onNodeContextMenu, onEdgeContextMenu, onPaneContextMenu, contextEdge } = useContextMenu(isLocked, edges);

  const dismissWelcome = useCallback(() => setWelcomeDismissed(true), []);
  const { isPlacementTool, activeTool, selectedBranchType, onPaneClick, onEdgeClick } = useToolPlacement({
    store,
    screenToFlowPosition,
    isLocked,
    onDismissWelcome: dismissWelcome,
    onCloseContextMenu: closeContextMenu,
  });

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

  const handleNodesChange = useCallback((changes: NodeChange<TimelineNode>[]) => {
    onNodesChange(changes);
  }, [onNodesChange]);

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
    <div ref={containerRef} data-onboarding="canvas" className={`flex-1 h-full relative ${cursorClass}`}>
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
        panOnDrag={
          isAnnotationMode || isPlacementTool
            ? false
            : isTouchDevice
              ? true
              : spaceHeld ? [0, 1] : [1]
        }
        panOnScroll={!isAnnotationMode}
        panOnScrollMode={PanOnScrollMode.Free}
        zoomOnScroll={false}
        zoomOnPinch={!isAnnotationMode}
        zoomActivationKeyCode="Meta"
        deleteKeyCode={interactionDisabled ? [] : ['Backspace', 'Delete']}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1.5}
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
          onAddEventPoint={() => {
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
          onAddEventBoard={() => {
            const position = screenToFlowPosition({
              x: contextMenu.x,
              y: contextMenu.y,
            });
            addNode({
              id: `split-${Date.now()}`,
              type: 'split',
              position,
              data: { label: 'Event', branchType: selectedBranchType },
            } as TimelineNode);
          }}
          onAddText={() => {
            const position = screenToFlowPosition({
              x: contextMenu.x,
              y: contextMenu.y,
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
          }}
          onSelectAll={() => {
            const s = store.getState();
            s.setNodes(s.nodes.map((n) => ({ ...n, selected: true })));
            s.setEdges(s.edges.map((e) => ({ ...e, selected: true })));
          }}
          onZoomToFit={() => {
            fitView({ duration: 300 });
          }}
          onClose={closeContextMenu}
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

      {welcomeDismissed && <OnboardingOverlay onComplete={() => setOnboardingDone(true)} />}
      {onboardingDone && <ContextualHint tipConfig={currentTip} />}
    </div>
  );
}
