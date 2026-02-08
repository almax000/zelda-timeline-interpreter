import { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { useTranslation } from 'react-i18next';

interface EventNodeData extends Record<string, unknown> {
  labelKey?: string;
  label?: string;
  isEraMarker: boolean;
}

type EventNodeType = Node<EventNodeData, 'event'>;

function EventNodeComponent({ data, selected }: NodeProps<EventNodeType>) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.label || '');
  const inputRef = useRef<HTMLInputElement>(null);

  const displayLabel = data.labelKey ? t(data.labelKey) : data.label || 'Event';

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    if (!data.isEraMarker) {
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

  const isEra = data.isEraMarker;

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className={`
        relative px-4 py-2 rounded-lg transition-all duration-200
        ${isEra
          ? 'border-2 border-dashed border-[var(--color-gold)]/60 bg-[var(--color-surface)]/60'
          : 'border-2 border-solid border-[var(--color-surface-light)] bg-[var(--color-surface)]'
        }
        ${selected
          ? 'shadow-[0_0_15px_var(--color-gold)] border-[var(--color-gold)]'
          : ''
        }
      `}
      style={{ minWidth: 120 }}
    >
      {/* 4 directional handles */}
      <Handle type="target" position={Position.Top} id="top"
        className="!w-2 !h-2 !bg-[var(--color-gold)] !border-[var(--color-surface)]" />
      <Handle type="source" position={Position.Top} id="top"
        className="!w-0 !h-0 !opacity-0" />

      <Handle type="target" position={Position.Left} id="left"
        className="!w-2 !h-2 !bg-[var(--color-gold)] !border-[var(--color-surface)]" />
      <Handle type="source" position={Position.Left} id="left"
        className="!w-0 !h-0 !opacity-0" />

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
          className="bg-transparent outline-none text-sm text-center w-full text-[var(--color-text)] border-b border-[var(--color-gold)]"
        />
      ) : (
        <p className={`text-sm font-medium text-center whitespace-nowrap ${
          isEra ? 'text-[var(--color-gold)] italic' : 'text-[var(--color-text)]'
        }`}>
          {displayLabel}
        </p>
      )}

      <Handle type="source" position={Position.Right} id="right"
        className="!w-2 !h-2 !bg-[var(--color-gold)] !border-[var(--color-surface)]" />
      <Handle type="target" position={Position.Right} id="right"
        className="!w-0 !h-0 !opacity-0" />

      <Handle type="source" position={Position.Bottom} id="bottom"
        className="!w-2 !h-2 !bg-[var(--color-gold)] !border-[var(--color-surface)]" />
      <Handle type="target" position={Position.Bottom} id="bottom"
        className="!w-0 !h-0 !opacity-0" />
    </div>
  );
}

export const EventNode = memo(EventNodeComponent);
