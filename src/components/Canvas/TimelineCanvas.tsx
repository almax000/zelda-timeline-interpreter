import { useCallback, useRef, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
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
import { useTimelineStore } from '../../stores/timelineStore';
import { useSettingsStore } from '../../stores/settingsStore';
import type { TimelineNode } from '../../types/timeline';

const nodeTypes: NodeTypes = {
  game: GameNode as NodeTypes['game'],
};

const edgeTypes: EdgeTypes = {
  timeline: TimelineEdge as EdgeTypes['timeline'],
};

export function TimelineCanvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const { nodes, edges, onNodesChange, onEdgesChange, addNode, addEdge } = useTimelineStore();
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

      const wrapper = reactFlowWrapper.current;
      if (!wrapper) return;

      const bounds = wrapper.getBoundingClientRect();
      const position = {
        x: event.clientX - bounds.left - 64,
        y: event.clientY - bounds.top - 80,
      };

      const newNode: TimelineNode = {
        id: `game-${gameId}-${Date.now()}`,
        type: 'game',
        position,
        data: { gameId },
      };

      addNode(newNode);
    },
    [addNode]
  );

  const defaultEdgeOptions = useMemo(() => ({
    type: 'timeline',
    animated: false,
  }), []);

  return (
    <div ref={reactFlowWrapper} className="flex-1 h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange as OnNodesChange}
        onEdgesChange={onEdgesChange as OnEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
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
    </div>
  );
}
