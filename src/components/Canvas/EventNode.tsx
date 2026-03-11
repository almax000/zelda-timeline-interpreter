import { memo, useCallback } from 'react';
import { Handle, Position, useStore, type NodeProps, type Node } from '@xyflow/react';
import type { BranchType } from '../../types/timeline';
import { BRANCH_COLORS } from '../../constants';

interface EventNodeData extends Record<string, unknown> {
  isEraMarker?: boolean;
  branchType?: BranchType;
}

type EventNodeType = Node<EventNodeData, 'event'>;

const LEFT = 1;
const RIGHT = 2;
const TOP = 4;
const BOTTOM = 8;

function EventNodeSVG({ color, sides }: { color: string; sides: number }) {
  return (
    <svg width="140" height="100" viewBox="0 0 140 100" className="absolute inset-0">
      {/* Connection lines — only rendered for sides with actual edge connections */}
      {(sides & LEFT) !== 0 && <line x1="0" y1="50" x2="58" y2="50" stroke={color} strokeWidth="3" />}
      {(sides & RIGHT) !== 0 && <line x1="82" y1="50" x2="140" y2="50" stroke={color} strokeWidth="3" />}
      {(sides & TOP) !== 0 && <line x1="70" y1="0" x2="70" y2="38" stroke={color} strokeWidth="3" />}
      {(sides & BOTTOM) !== 0 && <line x1="70" y1="62" x2="70" y2="100" stroke={color} strokeWidth="3" />}
      {/* Diamond at center (70, 50) */}
      <path d="M70 38 L82 50 L70 62 L58 50 Z" fill="var(--color-surface)" stroke={color} strokeWidth="1.5"/>
      <path d="M70 43 L77 50 L70 57 L63 50 Z" fill={color}/>
    </svg>
  );
}

const HIDDEN_HANDLE = '!w-0 !h-0 !opacity-0 !border-0 !bg-transparent !min-w-0 !min-h-0';

function EventNodeComponent({ id, data, selected }: NodeProps<EventNodeType>) {
  const bt = data.branchType ?? 'main';
  const color = BRANCH_COLORS[bt];

  const connectedSides = useStore(
    useCallback(
      (s: { edges: ReadonlyArray<{ source: string; target: string; sourceHandle?: string | null; targetHandle?: string | null }> }) => {
        let sides = 0;
        for (const edge of s.edges) {
          if (edge.source === id) {
            const h = edge.sourceHandle ?? '';
            if (h.startsWith('left')) sides |= LEFT;
            if (h.startsWith('right')) sides |= RIGHT;
            if (h.startsWith('top')) sides |= TOP;
            if (h.startsWith('bottom')) sides |= BOTTOM;
          }
          if (edge.target === id) {
            const h = edge.targetHandle ?? '';
            if (h.startsWith('left')) sides |= LEFT;
            if (h.startsWith('right')) sides |= RIGHT;
            if (h.startsWith('top')) sides |= TOP;
            if (h.startsWith('bottom')) sides |= BOTTOM;
          }
        }
        return sides;
      },
      [id],
    ),
  );

  return (
    <div
      className="relative"
      style={{
        width: 140,
        height: 100,
        filter: selected ? `drop-shadow(0 0 6px ${color}) drop-shadow(0 0 14px ${color})` : undefined,
      }}
    >
      <Handle type="target" position={Position.Top} id="top" className={HIDDEN_HANDLE} />
      <Handle type="source" position={Position.Top} id="top" className={HIDDEN_HANDLE} />
      <Handle type="source" position={Position.Bottom} id="bottom" className={HIDDEN_HANDLE} />
      <Handle type="target" position={Position.Bottom} id="bottom" className={HIDDEN_HANDLE} />
      <Handle type="target" position={Position.Left} id="left" className={HIDDEN_HANDLE} />
      <Handle type="source" position={Position.Left} id="left" className={HIDDEN_HANDLE} />
      <Handle type="source" position={Position.Right} id="right" className={HIDDEN_HANDLE} />
      <Handle type="target" position={Position.Right} id="right" className={HIDDEN_HANDLE} />

      <EventNodeSVG color={color} sides={connectedSides} />
    </div>
  );
}

export const EventNode = memo(EventNodeComponent);
