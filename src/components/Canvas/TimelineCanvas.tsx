import { useCallback, useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
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
import { TimelineEdge } from './TimelineEdge';
import { ContextMenu } from './ContextMenu';
import { useTimelineStore } from '../../stores/timelineStore';
import { useSettingsStore } from '../../stores/settingsStore';
import type { TimelineNode } from '../../types/timeline';
import type { BranchType } from '../../types/timeline';

const nodeTypes: NodeTypes = {
  game: GameNode as NodeTypes['game'],
};

const edgeTypes: EdgeTypes = {
  timeline: TimelineEdge as EdgeTypes['timeline'],
};

interface ContextMenuState {
  x: number;
  y: number;
  type: 'node' | 'edge';
  targetId: string;
}

export function TimelineCanvas() {
  const { screenToFlowPosition } = useReactFlow();
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  const { nodes, edges, onNodesChange, onEdgesChange, addNode, addEdge, removeNode, removeEdge, updateEdgeBranchType, updateEdgeLabel } = useTimelineStore();
  const showMinimap = useSettingsStore((state) => state.showMinimap);
  const snapToGrid = useSettingsStore((state) => state.snapToGrid);

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      addEdge(connection);
    },
    [addEdge]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

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
    [addNode, screenToFlowPosition]
  );

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: TimelineNode) => {
      event.preventDefault();
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        type: 'node',
        targetId: node.id,
      });
    },
    []
  );

  const onEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: { id: string }) => {
      event.preventDefault();
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        type: 'edge',
        targetId: edge.id,
      });
    },
    []
  );

  const onPaneClick = useCallback(() => {
    setContextMenu(null);
  }, []);

  const contextEdge = contextMenu?.type === 'edge'
    ? edges.find((e) => e.id === contextMenu.targetId)
    : null;

  const defaultEdgeOptions = useMemo(() => ({
    type: 'timeline',
    animated: false,
    interactionWidth: 20,
  }), []);

  return (
    <div className="flex-1 h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange as OnNodesChange}
        onEdgesChange={onEdgesChange as OnEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onNodeContextMenu={onNodeContextMenu}
        onEdgeContextMenu={onEdgeContextMenu}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        snapToGrid={snapToGrid}
        snapGrid={[20, 20]}
        fitView
        minZoom={0.1}
        maxZoom={2}
        deleteKeyCode={['Backspace', 'Delete']}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="var(--color-surface-light)"
        />
        <Controls
          showInteractive={false}
          className="!bottom-4 !left-4"
        />
        {showMinimap && (
          <MiniMap
            nodeColor="var(--color-gold)"
            maskColor="rgba(3, 7, 18, 0.8)"
            className="!bottom-4 !right-4"
          />
        )}
      </ReactFlow>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          type={contextMenu.type}
          edgeBranchType={contextEdge?.data?.branchType}
          edgeLabel={contextEdge?.data?.label}
          onDelete={() => {
            if (contextMenu.type === 'node') {
              removeNode(contextMenu.targetId);
            } else {
              removeEdge(contextMenu.targetId);
            }
          }}
          onChangeBranch={(branchType: BranchType) => {
            updateEdgeBranchType(contextMenu.targetId, branchType);
          }}
          onChangeLabel={(label: string) => {
            updateEdgeLabel(contextMenu.targetId, label);
          }}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
