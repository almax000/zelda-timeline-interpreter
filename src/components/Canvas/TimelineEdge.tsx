import { memo } from 'react';
import { BaseEdge, getSmoothStepPath, getStraightPath, type EdgeProps, type Edge } from '@xyflow/react';
import type { BranchType } from '../../types/timeline';

interface TimelineEdgeData extends Record<string, unknown> {
  branchType: BranchType;
}

type TimelineEdgeType = Edge<TimelineEdgeData>;

const STRAIGHT_THRESHOLD = 8;

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
  const isStraightH = Math.abs(sourceY - targetY) < STRAIGHT_THRESHOLD;
  const isStraightV = Math.abs(sourceX - targetX) < STRAIGHT_THRESHOLD;

  let edgePath: string;

  if (isStraightH || isStraightV) {
    // Truly aligned — clean straight line
    [edgePath] = getStraightPath({ sourceX, sourceY, targetX, targetY });
  } else {
    // Always orthogonal with smooth corners — never diagonal
    [edgePath] = getSmoothStepPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition,
      targetPosition,
      borderRadius: 16,
    });
  }

  const branchType = data?.branchType || 'main';
  const color = branchColors[branchType];

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      style={{
        stroke: color,
        strokeWidth: selected ? 4 : 3,
        filter: selected ? `drop-shadow(0 0 6px ${color})` : undefined,
      }}
    />
  );
}

export const TimelineEdge = memo(TimelineEdgeComponent);
