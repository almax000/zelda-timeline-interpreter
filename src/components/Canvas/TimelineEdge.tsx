import { memo } from 'react';
import { BaseEdge, getBezierPath, type EdgeProps, type Edge } from '@xyflow/react';
import { useTranslation } from 'react-i18next';
import type { BranchType } from '../../types/timeline';

interface TimelineEdgeData extends Record<string, unknown> {
  branchType: BranchType;
  label?: string;
  labelKey?: string;
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
  const { t } = useTranslation();

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
  const displayLabel = data?.labelKey ? t(data.labelKey) : data?.label;

  const isHorizontal = Math.abs(targetX - sourceX) > Math.abs(targetY - sourceY);
  const labelX = (sourceX + targetX) / 2;
  const labelY = (sourceY + targetY) / 2;

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
      {displayLabel && (
        <foreignObject
          x={labelX - 75}
          y={isHorizontal ? labelY - 30 : labelY - 14}
          width={150}
          height={32}
          style={{ overflow: 'visible' }}
        >
          <div
            className="text-xs font-medium text-center whitespace-nowrap px-2 py-1 rounded bg-[var(--color-surface)]/80"
            style={{ color }}
          >
            {displayLabel}
          </div>
        </foreignObject>
      )}
    </>
  );
}

export const TimelineEdge = memo(TimelineEdgeComponent);
