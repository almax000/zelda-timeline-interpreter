import { memo, useState, useCallback } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useTranslation } from 'react-i18next';
import { getCanvasStore } from '../../stores/canvasRegistry';
import { useTabStore } from '../../stores/tabStore';
import type { LabelPointNodeData } from '../../types/timeline';

type LabelPointNodeProps = NodeProps & { data: LabelPointNodeData };

/**
 * Diamond icon SVG — artistic Hyrule-style marker.
 */
function DiamondIcon({ selected }: { selected?: boolean }) {
  const fill = selected ? 'var(--color-gold)' : 'var(--color-surface)';
  const stroke = 'var(--color-gold)';
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" className="shrink-0">
      <path
        d="M7 1 L13 7 L7 13 L1 7 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.5"
      />
    </svg>
  );
}

export const LabelPointNode = memo(function LabelPointNode({ id, data, selected }: LabelPointNodeProps) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const activeTabId = useTabStore((s) => s.activeTabId);

  const displayLabel = data.labelKey ? t(data.labelKey) : data.label;

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const store = getCanvasStore(activeTabId);
    store.getState().updateNodeData(id, { label: e.target.value });
    setEditing(false);
  }, [id, activeTabId]);

  return (
    <div className="flex items-start gap-1.5 group">
      {/* Diamond marker */}
      <div className="pt-0.5">
        <DiamondIcon selected={selected} />
      </div>

      {/* Editable label */}
      {editing ? (
        <input
          autoFocus
          defaultValue={data.label ?? ''}
          className="bg-[var(--color-surface)] border border-[var(--color-gold)] rounded px-1.5 py-0.5 text-xs text-[var(--color-text)] outline-none w-32"
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
          }}
        />
      ) : (
        <span
          className="text-xs leading-tight text-[var(--color-gold)]/80 max-w-[140px] cursor-text select-none transition-colors group-hover:text-[var(--color-gold)]"
          style={{
            textShadow: selected ? '0 0 4px var(--color-gold)' : 'none',
          }}
          onDoubleClick={() => { if (!data.labelKey) setEditing(true); }}
          title={displayLabel}
        >
          {displayLabel}
        </span>
      )}

      {/* Handles — same pattern as game nodes for branch connectivity */}
      <Handle type="target" position={Position.Left} id="left"
        className="!bg-[var(--color-gold)] !w-1.5 !h-1.5 !border-0 !opacity-0 group-hover:!opacity-100" />
      <Handle type="source" position={Position.Right} id="right"
        className="!bg-[var(--color-gold)] !w-1.5 !h-1.5 !border-0 !opacity-0 group-hover:!opacity-100" />
      <Handle type="target" position={Position.Top} id="top"
        className="!bg-[var(--color-gold)] !w-1.5 !h-1.5 !border-0 !opacity-0 group-hover:!opacity-100" />
      <Handle type="source" position={Position.Bottom} id="bottom"
        className="!bg-[var(--color-gold)] !w-1.5 !h-1.5 !border-0 !opacity-0 group-hover:!opacity-100" />
    </div>
  );
});
