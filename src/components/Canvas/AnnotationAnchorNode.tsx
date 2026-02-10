import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

function AnnotationAnchorNodeComponent({ selected }: NodeProps) {
  return (
    <div className="relative flex items-center justify-center">
      <div
        className="w-1.5 h-1.5 rounded-full transition-all"
        style={{
          backgroundColor: selected ? 'var(--color-gold)' : 'var(--color-text-muted)',
          boxShadow: selected ? '0 0 6px var(--color-gold)' : 'none',
        }}
      />
      <Handle type="target" position={Position.Left} id="left" className="!bg-transparent !w-1 !h-1 !border-0" />
      <Handle type="source" position={Position.Right} id="right" className="!bg-transparent !w-1 !h-1 !border-0" />
      <Handle type="source" position={Position.Top} id="top" className="!bg-transparent !w-1 !h-1 !border-0" />
    </div>
  );
}

export const AnnotationAnchorNode = memo(AnnotationAnchorNodeComponent);
