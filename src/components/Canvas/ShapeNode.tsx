import { memo, useState } from 'react';
import { Handle, Position, NodeResizer, type NodeProps } from '@xyflow/react';
import type { ShapeNodeData } from '../../types/timeline';

type ShapeNodeProps = NodeProps & { data: ShapeNodeData };

export const ShapeNode = memo(function ShapeNode({ data, selected }: ShapeNodeProps) {
  const [editing, setEditing] = useState(false);
  const { shapeType, width, height, fill, stroke, strokeWidth, label } = data;

  const renderShape = () => {
    switch (shapeType) {
      case 'rectangle':
        return (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ border: `${strokeWidth}px solid ${stroke}`, backgroundColor: fill, borderRadius: 4 }}
          >
            {renderLabel()}
          </div>
        );
      case 'circle':
        return (
          <div
            className="w-full h-full flex items-center justify-center rounded-full"
            style={{ border: `${strokeWidth}px solid ${stroke}`, backgroundColor: fill }}
          >
            {renderLabel()}
          </div>
        );
      case 'arrow':
        return (
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill={stroke} />
              </marker>
            </defs>
            <line
              x1={strokeWidth}
              y1={height / 2}
              x2={width - 12}
              y2={height / 2}
              stroke={stroke}
              strokeWidth={strokeWidth}
              markerEnd="url(#arrowhead)"
            />
          </svg>
        );
      case 'line':
        return (
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            <line
              x1={0}
              y1={height}
              x2={width}
              y2={0}
              stroke={stroke}
              strokeWidth={strokeWidth}
            />
          </svg>
        );
    }
  };

  const renderLabel = () => {
    if (editing) {
      return null; // Handled separately
    }
    if (!label) return null;
    return (
      <span className="text-xs text-[var(--color-text)] px-1 text-center select-none">
        {label}
      </span>
    );
  };

  return (
    <div
      className="relative"
      style={{ width, height }}
      onDoubleClick={() => {
        if (shapeType === 'rectangle' || shapeType === 'circle') {
          setEditing(true);
        }
      }}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={30}
        minHeight={30}
        lineClassName="!border-[var(--color-gold)]"
        handleClassName="!w-2 !h-2 !bg-[var(--color-gold)] !border-0"
      />
      {renderShape()}
      {editing && (
        <div className="absolute inset-0 flex items-center justify-center">
          <input
            autoFocus
            defaultValue={label ?? ''}
            className="bg-transparent text-xs text-[var(--color-text)] text-center outline-none w-full px-1"
            onBlur={(e) => {
              data.label = e.target.value;
              setEditing(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
            }}
          />
        </div>
      )}
      <Handle type="target" position={Position.Top} className="!bg-[var(--color-gold)] !w-2 !h-2" />
      <Handle type="source" position={Position.Bottom} className="!bg-[var(--color-gold)] !w-2 !h-2" />
      <Handle type="target" position={Position.Left} id="left" className="!bg-[var(--color-gold)] !w-2 !h-2" />
      <Handle type="source" position={Position.Right} id="right" className="!bg-[var(--color-gold)] !w-2 !h-2" />
    </div>
  );
});
