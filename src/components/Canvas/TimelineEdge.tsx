import { memo } from 'react';
import { BaseEdge, getBezierPath, type EdgeProps, type Edge } from '@xyflow/react';
import type { BranchType } from '../../types/timeline';

interface TimelineEdgeData extends Record<string, unknown> {
  branchType: BranchType;
  isAnnotationConnector?: boolean;
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

  const isConnector = data?.isAnnotationConnector === true;
  const branchType = data?.branchType || 'main';
  const color = isConnector ? 'var(--color-text-muted)' : branchColors[branchType];

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      style={{
        stroke: color,
        strokeWidth: isConnector ? 1 : (selected ? 4 : 3),
        strokeDasharray: isConnector ? '4 2' : undefined,
        filter: selected && !isConnector ? `drop-shadow(0 0 6px ${color})` : undefined,
      }}
    />
  );
}

export const TimelineEdge = memo(TimelineEdgeComponent);
