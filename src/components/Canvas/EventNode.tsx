import { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import type { BranchType } from '../../types/timeline';

interface EventNodeData extends Record<string, unknown> {
  isEraMarker?: boolean;
  branchType?: BranchType;
}

type EventNodeType = Node<EventNodeData, 'event'>;

const branchColors: Record<BranchType, string> = {
  main: 'var(--color-branch-main)',
  child: 'var(--color-branch-child)',
  adult: 'var(--color-branch-adult)',
  fallen: 'var(--color-branch-fallen)',
};

function DoubleDiamondIcon({ color }: { color: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" className="shrink-0">
      <path d="M12 2 L22 12 L12 22 L2 12 Z" fill="var(--color-surface)" stroke={color} strokeWidth="1.5"/>
      <path d="M12 6 L18 12 L12 18 L6 12 Z" fill={color}/>
    </svg>
  );
}

const HIDDEN_HANDLE = '!w-0 !h-0 !opacity-0 !border-0 !bg-transparent !min-w-0 !min-h-0';

function EventNodeComponent({ data, selected }: NodeProps<EventNodeType>) {
  const bt = data.branchType ?? 'main';
  const color = branchColors[bt];

  return (
    <div
      className="flex items-center"
      style={selected ? {
        filter: `drop-shadow(0 0 6px ${color}) drop-shadow(0 0 14px ${color})`,
        transform: 'scale(1.25)',
      } : undefined}
    >
      {/* Top handles */}
      <Handle type="target" position={Position.Top} id="top" className={HIDDEN_HANDLE} />
      <Handle type="source" position={Position.Top} id="top" className={HIDDEN_HANDLE} />

      {/* Bottom handles */}
      <Handle type="target" position={Position.Bottom} id="bottom" className={HIDDEN_HANDLE} />
      <Handle type="source" position={Position.Bottom} id="bottom" className={HIDDEN_HANDLE} />

      {/* Left handles */}
      <Handle type="target" position={Position.Left} id="left" className={HIDDEN_HANDLE} />
      <Handle type="source" position={Position.Left} id="left" className={HIDDEN_HANDLE} />

      {/* Right handles */}
      <Handle type="target" position={Position.Right} id="right" className={HIDDEN_HANDLE} />
      <Handle type="source" position={Position.Right} id="right" className={HIDDEN_HANDLE} />

      <DoubleDiamondIcon color={color} />
    </div>
  );
}

export const EventNode = memo(EventNodeComponent);
