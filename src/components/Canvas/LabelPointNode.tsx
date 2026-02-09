import { memo, useState } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useTranslation } from 'react-i18next';
import type { LabelPointNodeData } from '../../types/timeline';

type LabelPointNodeProps = NodeProps & { data: LabelPointNodeData };

export const LabelPointNode = memo(function LabelPointNode({ data, selected }: LabelPointNodeProps) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);

  const displayLabel = data.labelKey ? t(data.labelKey) : data.label;

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Diamond shape */}
      <div
        className="w-4 h-4 rotate-45 border-2 transition-all"
        style={{
          backgroundColor: selected ? 'var(--color-gold)' : 'var(--color-surface)',
          borderColor: selected ? 'var(--color-gold)' : 'var(--color-surface-light)',
          boxShadow: selected ? '0 0 8px var(--color-gold)' : 'none',
        }}
      />
      {/* Label below */}
      {editing ? (
        <input
          autoFocus
          defaultValue={data.label ?? ''}
          className="bg-[var(--color-surface)] border border-[var(--color-surface-light)] rounded px-1 py-0.5 text-xs text-[var(--color-text)] text-center outline-none focus:border-[var(--color-gold)] w-24"
          onBlur={(e) => {
            data.label = e.target.value;
            setEditing(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
          }}
        />
      ) : (
        <div
          className="text-xs text-[var(--color-text-muted)] whitespace-nowrap px-1.5 py-0.5 rounded bg-[var(--color-surface)]/80 cursor-text max-w-[120px] truncate"
          onDoubleClick={() => { if (!data.labelKey) setEditing(true); }}
          title={displayLabel}
        >
          {displayLabel}
        </div>
      )}
      <Handle type="target" position={Position.Left} id="left" className="!bg-[var(--color-gold)] !w-1.5 !h-1.5" />
      <Handle type="source" position={Position.Right} id="right" className="!bg-[var(--color-gold)] !w-1.5 !h-1.5" />
    </div>
  );
});
