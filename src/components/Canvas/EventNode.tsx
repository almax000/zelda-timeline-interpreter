import { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { useTranslation } from 'react-i18next';

interface EventNodeData extends Record<string, unknown> {
  labelKey?: string;
  label?: string;
  isEraMarker?: boolean;
}

type EventNodeType = Node<EventNodeData, 'event'>;

function DiamondIcon({ selected }: { selected?: boolean }) {
  const fill = selected ? 'var(--color-gold)' : 'var(--color-surface)';
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" className="shrink-0">
      <path
        d="M9 1 L17 9 L9 17 L1 9 Z"
        fill={fill}
        stroke="var(--color-gold)"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function EventNodeComponent({ data, selected }: NodeProps<EventNodeType>) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.label || '');
  const inputRef = useRef<HTMLInputElement>(null);

  const displayLabel = data.labelKey ? t(data.labelKey) : data.label;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    if (!data.labelKey) {
      setEditValue(data.label || '');
      setIsEditing(true);
    }
  };

  const handleSubmit = () => {
    if (editValue.trim()) {
      data.label = editValue.trim();
    }
    setIsEditing(false);
  };

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className="flex items-center gap-2 group"
    >
      {/* 4-directional handles */}
      <Handle type="target" position={Position.Top} id="top"
        className="!bg-[var(--color-gold)] !w-2 !h-2 !border-0 !opacity-0 group-hover:!opacity-100" />
      <Handle type="source" position={Position.Bottom} id="bottom"
        className="!bg-[var(--color-gold)] !w-2 !h-2 !border-0 !opacity-0 group-hover:!opacity-100" />
      <Handle type="target" position={Position.Left} id="left"
        className="!bg-[var(--color-gold)] !w-2 !h-2 !border-0 !opacity-0 group-hover:!opacity-100" />
      <Handle type="source" position={Position.Right} id="right"
        className="!bg-[var(--color-gold)] !w-2 !h-2 !border-0 !opacity-0 group-hover:!opacity-100" />

      {/* Diamond marker */}
      <DiamondIcon selected={selected} />

      {/* Optional text label */}
      {isEditing ? (
        <input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit();
            if (e.key === 'Escape') setIsEditing(false);
          }}
          className="bg-[var(--color-surface)] border border-[var(--color-gold)] rounded px-1.5 py-0.5 text-xs text-[var(--color-text)] outline-none w-36"
        />
      ) : displayLabel ? (
        <span
          className="text-xs leading-tight text-[var(--color-gold)]/80 max-w-[160px] cursor-text select-none transition-colors group-hover:text-[var(--color-gold)]"
          style={{
            textShadow: selected ? '0 0 4px var(--color-gold)' : 'none',
          }}
        >
          {displayLabel}
        </span>
      ) : null}
    </div>
  );
}

export const EventNode = memo(EventNodeComponent);
