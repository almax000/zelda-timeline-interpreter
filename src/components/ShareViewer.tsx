import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  type NodeTypes,
  type EdgeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useTranslation } from 'react-i18next';

import { GameNode } from './Canvas/GameNode';
import { EventNode } from './Canvas/EventNode';
import { ImageNode } from './Canvas/ImageNode';
import { ShapeNode } from './Canvas/ShapeNode';
import { LabelPointNode } from './Canvas/LabelPointNode';
import { SplitNode } from './Canvas/SplitNode';
import { TextNode } from './Canvas/TextNode';
import { TimelineEdge } from './Canvas/TimelineEdge';
import type { TimelineNode, TimelineEdge as TimelineEdgeType } from '../types/timeline';

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

const EMPTY_DELETE_KEYS: string[] = [];

interface ShareViewerProps {
  nodes: TimelineNode[];
  edges: TimelineEdgeType[];
}

function ShareViewerInner({ nodes, edges }: ShareViewerProps) {
  const { t } = useTranslation();
  const cleanUrl = window.location.origin + window.location.pathname;

  return (
    <div className="h-screen w-screen">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag
        zoomOnScroll
        fitView
        minZoom={0.1}
        maxZoom={2}
        deleteKeyCode={EMPTY_DELETE_KEYS}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ type: 'timeline', animated: false }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="var(--color-surface-light)"
        />
      </ReactFlow>

      <div className="absolute top-3 left-3 z-[50] bg-[var(--color-surface)]/90 backdrop-blur-sm border border-[var(--color-surface-light)] rounded-lg shadow-lg px-4 py-3">
        <div className="text-sm text-[var(--color-text-muted)]">
          {t('share.madeWith')}{' '}
          <a
            href={cleanUrl}
            className="text-[var(--color-gold)] font-semibold hover:underline"
          >
            {t('share.appName')}
          </a>
        </div>
        <a
          href={cleanUrl}
          className="text-sm text-[var(--color-gold)] hover:underline mt-0.5 inline-block"
        >
          {t('share.createOwn')}
        </a>
      </div>
    </div>
  );
}

export function ShareViewer(props: ShareViewerProps) {
  return (
    <ReactFlowProvider>
      <ShareViewerInner {...props} />
    </ReactFlowProvider>
  );
}
