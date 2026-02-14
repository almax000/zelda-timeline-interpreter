import { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { useTranslation } from 'react-i18next';

interface SplitNodeData extends Record<string, unknown> {
  label?: string;
  labelKey?: string;
}

type SplitNodeType = Node<SplitNodeData, 'split'>;

function CornerTriangle({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) {
  const size = 8;
  const paths: Record<string, string> = {
    tl: `M0 0 L${size} 0 L0 ${size} Z`,
    tr: `M${size} 0 L0 0 L${size} ${size} Z`,
    bl: `M0 ${size} L${size} ${size} L0 0 Z`,
    br: `M${size} ${size} L0 ${size} L${size} 0 Z`,
  };
  const posClass: Record<string, string> = {
    tl: 'top-0.5 left-0.5',
    tr: 'top-0.5 right-0.5',
    bl: 'bottom-0.5 left-0.5',
    br: 'bottom-0.5 right-0.5',
  };
  return (
    <svg
      width={size}
      height={size}
      className={`absolute ${posClass[position]}`}
    >
      <path d={paths[position]} fill="var(--color-gold)" opacity="0.6" />
    </svg>
  );
}

function DiamondHandle({ type, position, id, className }: {
  type: 'source' | 'target';
  position: Position;
  id: string;
  className?: string;
}) {
  return (
    <Handle
      type={type}
      position={position}
      id={id}
      className={className}
      style={{
        width: 10,
        height: 10,
        background: 'var(--color-surface)',
        border: '1.5px solid var(--color-gold)',
        borderRadius: 0,
        transform: `${position === Position.Top || position === Position.Bottom ? 'translateX(-50%)' : 'translateY(-50%)'} rotate(45deg)`,
      }}
    />
  );
}

function SplitNodeComponent({ data, selected }: NodeProps<SplitNodeType>) {
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
      className={`
        relative px-5 py-3 min-w-[140px]
        bg-[var(--color-surface)] border-2 border-[var(--color-gold)]
        transition-all duration-200
        ${selected ? 'shadow-[0_0_15px_var(--color-gold)]' : ''}
      `}
    >
      {/* Corner triangles */}
      <CornerTriangle position="tl" />
      <CornerTriangle position="tr" />
      <CornerTriangle position="bl" />
      <CornerTriangle position="br" />

      {/* Top = target */}
      <DiamondHandle type="target" position={Position.Top} id="top" />

      {/* Bottom/Left/Right = source (multi-output) */}
      <DiamondHandle type="source" position={Position.Bottom} id="bottom" />
      <DiamondHandle type="source" position={Position.Left} id="left" />
      <DiamondHandle type="source" position={Position.Right} id="right" />

      {/* Content */}
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
        <p className="text-sm font-medium text-center whitespace-nowrap text-[var(--color-text)]">
          {displayLabel || 'Split'}
        </p>
      )}
    </div>
  );
}

export const SplitNode = memo(SplitNodeComponent);
