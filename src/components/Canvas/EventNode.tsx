import { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';

interface EventNodeData extends Record<string, unknown> {
  isEraMarker?: boolean;
}

type EventNodeType = Node<EventNodeData, 'event'>;

function DoubleDiamondIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" className="shrink-0">
      <path d="M12 2 L22 12 L12 22 L2 12 Z" fill="var(--color-surface)" stroke="var(--color-gold)" strokeWidth="1.5"/>
      <path d="M12 6 L18 12 L12 18 L6 12 Z" fill="var(--color-gold)"/>
    </svg>
  );
}

function EventNodeComponent({ selected }: NodeProps<EventNodeType>) {
  return (
    <div className="flex items-center group">
      {/* 4-directional handles — all target only */}
      <Handle type="target" position={Position.Top} id="top"
        isConnectableStart={false}
        className="!bg-[var(--color-gold)] !w-2 !h-2 !border-0 !opacity-0 group-hover:!opacity-100" />
      <Handle type="target" position={Position.Bottom} id="bottom"
        isConnectableStart={false}
        className="!bg-[var(--color-gold)] !w-2 !h-2 !border-0 !opacity-0 group-hover:!opacity-100" />
      <Handle type="target" position={Position.Left} id="left"
        isConnectableStart={false}
        className="!bg-[var(--color-gold)] !w-2 !h-2 !border-0 !opacity-0 group-hover:!opacity-100" />
      <Handle type="target" position={Position.Right} id="right"
        isConnectableStart={false}
        className="!bg-[var(--color-gold)] !w-2 !h-2 !border-0 !opacity-0 group-hover:!opacity-100" />

      <DoubleDiamondIcon />

      {selected && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ filter: 'drop-shadow(0 0 6px var(--color-gold))' }}
        />
      )}
    </div>
  );
}

export const EventNode = memo(EventNodeComponent);
