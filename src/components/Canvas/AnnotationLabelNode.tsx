import { memo, useState, useCallback } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { useTranslation } from 'react-i18next';
import type { AnnotationLabelNodeData } from '../../types/timeline';

type AnnotationLabelNodeType = Node<AnnotationLabelNodeData, 'annotationLabel'>;

function AnnotationLabelNodeComponent({ data, selected }: NodeProps<AnnotationLabelNodeType>) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);

  const displayLabel = data.labelKey ? t(data.labelKey) : data.label;

  const handleDoubleClick = useCallback(() => {
    if (!data.labelKey) setEditing(true);
  }, [data.labelKey]);

  return (
    <div className="flex flex-col items-center">
      {editing ? (
        <input
          autoFocus
          defaultValue={data.label ?? ''}
          className="bg-[var(--color-surface)] border border-[var(--color-gold)] rounded px-1.5 py-0.5 text-xs text-[var(--color-text)] text-center outline-none w-28"
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
          className="text-xs px-2 py-1 rounded cursor-text max-w-[160px] truncate transition-all"
          style={{
            color: 'var(--color-text-muted)',
            backgroundColor: selected ? 'var(--color-gold)/10' : 'transparent',
            borderBottom: selected ? '1px solid var(--color-gold)' : '1px solid transparent',
          }}
          onDoubleClick={handleDoubleClick}
          title={displayLabel}
        >
          {displayLabel}
        </div>
      )}
      <Handle type="target" position={Position.Bottom} id="bottom" className="!bg-transparent !w-1 !h-1 !border-0" />
    </div>
  );
}

export const AnnotationLabelNode = memo(AnnotationLabelNodeComponent);
