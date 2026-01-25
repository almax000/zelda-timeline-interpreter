import { memo } from 'react';
import { BaseEdge, getBezierPath, type EdgeProps, type Edge } from '@xyflow/react';
import type { BranchType } from '../../types/timeline';

interface TimelineEdgeData extends Record<string, unknown> {
  branchType: BranchType;
  label?: string;
}

type TimelineEdgeType = Edge<TimelineEdgeData>;

const branchColors: Record<BranchType, string> = {
  main: 'var(--color-branch-main)',
  child: 'var(--color-branch-child)',
  adult: 'var(--color-branch-adult)',
  fallen: 'var(--color-branch-fallen)',
};

function TimelineEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps<TimelineEdgeType>) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const branchType = data?.branchType || 'main';
  const color = branchColors[branchType];

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: color,
          strokeWidth: selected ? 4 : 3,
          filter: selected ? `drop-shadow(0 0 6px ${color})` : undefined,
        }}
      />
      {data?.label && (
        <text
          x={(sourceX + targetX) / 2}
          y={(sourceY + targetY) / 2 - 10}
          textAnchor="middle"
          fill={color}
          fontSize={12}
          fontWeight="500"
        >
          {data.label}
        </text>
      )}
    </>
  );
}

export const TimelineEdge = memo(TimelineEdgeComponent);
