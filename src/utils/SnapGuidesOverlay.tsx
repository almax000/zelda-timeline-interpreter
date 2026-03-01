import { useViewport } from '@xyflow/react';
import type { SnapLine } from './snapGuides';

export function SnapGuidesOverlay({ guides }: { guides: SnapLine[] }) {
  const { x: vx, y: vy, zoom } = useViewport();
  if (guides.length === 0) return null;

  const tx = (v: number) => v * zoom + vx;
  const ty = (v: number) => v * zoom + vy;

  return (
    <svg className="absolute inset-0 pointer-events-none z-50" overflow="visible">
      {guides.map((g, i) =>
        g.orientation === 'V'
          ? <line key={i} x1={tx(g.position)} y1={ty(g.from)} x2={tx(g.position)} y2={ty(g.to)}
                  stroke="#FF44CC" strokeWidth={1} />
          : <line key={i} x1={tx(g.from)} y1={ty(g.position)} x2={tx(g.to)} y2={ty(g.position)}
                  stroke="#FF44CC" strokeWidth={1} />
      )}
    </svg>
  );
}
