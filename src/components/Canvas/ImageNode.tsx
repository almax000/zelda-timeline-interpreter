import { memo } from 'react';
import { NodeResizer, type NodeProps } from '@xyflow/react';
import type { ImageNodeData } from '../../types/timeline';

type ImageNodeProps = NodeProps & { data: ImageNodeData };

export const ImageNode = memo(function ImageNode({ data, selected }: ImageNodeProps) {
  return (
    <div
      className="relative"
      style={{ width: data.width, height: data.height }}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={50}
        minHeight={50}
        lineClassName="!border-[var(--color-gold)]"
        handleClassName="!w-2 !h-2 !bg-[var(--color-gold)] !border-0"
      />
      <img
        src={data.src}
        alt="Pasted image"
        className="w-full h-full object-contain pointer-events-none"
        draggable={false}
      />
    </div>
  );
});
