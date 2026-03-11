import { memo, useState, useRef, useEffect, useCallback } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { useTranslation } from 'react-i18next';
import { getCanvasStore } from '../../stores/canvasRegistry';
import { useTabStore } from '../../stores/tabStore';
import { BRANCH_COLORS } from '../../constants';
import type { BranchType, SplitNodeData } from '../../types/timeline';

type SplitNodeType = Node<SplitNodeData, 'split'>;

function CornerTriangle({ position, color }: { position: 'tl' | 'tr' | 'bl' | 'br'; color?: string }) {
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
      <path d={paths[position]} fill={color ?? 'var(--color-gold)'} opacity="0.6" />
    </svg>
  );
}

function SplitNodeComponent({ id, data, selected }: NodeProps<SplitNodeType>) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.label || '');
  const inputRef = useRef<HTMLInputElement>(null);
  const activeTabId = useTabStore((s) => s.activeTabId);

  const bt = (data.branchType ?? 'main') as BranchType;
  const color = BRANCH_COLORS[bt];
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

  const handleSubmit = useCallback(() => {
    if (editValue.trim()) {
      const store = getCanvasStore(activeTabId);
      store.getState().updateNodeData(id, { label: editValue.trim() });
    }
    setIsEditing(false);
  }, [editValue, id, activeTabId]);

  const handleClass = '!w-2 !h-2 !bg-[var(--color-gold)] !border-[var(--color-surface)] !border !opacity-0 group-hover:!opacity-100';

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className={`
        relative px-3 group flex items-center justify-center
        bg-[var(--color-surface)] border-2
        transition-all duration-200
      `}
      style={{
        width: 140,
        height: 100,
        borderColor: color,
        boxShadow: selected ? `0 0 15px ${color}` : undefined,
      }}
    >
      {/* Corner triangles */}
      <CornerTriangle position="tl" color={color} />
      <CornerTriangle position="tr" color={color} />
      <CornerTriangle position="bl" color={color} />
      <CornerTriangle position="br" color={color} />

      {/* 4-directional bidirectional handles — same as GameNode */}
      <Handle type="target" position={Position.Top} id="top" className={handleClass} />
      <Handle type="source" position={Position.Top} id="top-src" className="!w-0 !h-0 !opacity-0 !min-w-0 !min-h-0" />
      <Handle type="target" position={Position.Bottom} id="bottom" className={handleClass} />
      <Handle type="source" position={Position.Bottom} id="bottom-src" className="!w-0 !h-0 !opacity-0 !min-w-0 !min-h-0" />
      <Handle type="target" position={Position.Left} id="left" className={handleClass} />
      <Handle type="source" position={Position.Left} id="left-src" className="!w-0 !h-0 !opacity-0 !min-w-0 !min-h-0" />
      <Handle type="target" position={Position.Right} id="right" className={handleClass} />
      <Handle type="source" position={Position.Right} id="right-src" className="!w-0 !h-0 !opacity-0 !min-w-0 !min-h-0" />

      {/* Content */}
      {isEditing ? (
        <input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSubmit}
          onPointerDownCapture={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit();
            if (e.key === 'Escape') { setIsEditing(false); return; }
            if ((e.metaKey || e.ctrlKey) && (e.key === 'z' || e.key === 'y' || e.key === 'c' || e.key === 'v' || e.key === 'x' || e.key === 'a')) return;
            e.stopPropagation();
          }}
          className="nodrag nowheel bg-transparent outline-none text-sm text-center w-full text-[var(--color-text)]"
          style={{ borderBottom: `1px solid ${color}` }}
        />
      ) : (
        <p className="text-sm font-medium text-center text-[var(--color-text)]">
          {displayLabel || 'Event'}
        </p>
      )}
    </div>
  );
}

export const SplitNode = memo(SplitNodeComponent);
