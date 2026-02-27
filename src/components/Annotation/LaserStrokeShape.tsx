import { Shape } from 'react-konva';
import type { Stroke } from '../../stores/annotationStore';
import { LASER_DECAY_MS } from '../../constants';

const LASER_COLOR_R = 173;
const LASER_COLOR_G = 255;
const LASER_COLOR_B = 47;

function easeOutQuad(t: number): number {
  return t * (2 - t);
}

interface LaserStrokeShapeProps {
  stroke: Stroke;
  now: number;
}

export function LaserStrokeShape({ stroke, now }: LaserStrokeShapeProps) {
  const { points, timestamps, strokeWidth } = stroke;
  if (!timestamps || timestamps.length === 0) return null;

  const numPoints = points.length / 2;
  if (numPoints < 2) return null;

  return (
    <Shape
      sceneFunc={(ctx, shape) => {
        for (let i = 0; i < numPoints - 1; i++) {
          const x1 = points[i * 2];
          const y1 = points[i * 2 + 1];
          const x2 = points[(i + 1) * 2];
          const y2 = points[(i + 1) * 2 + 1];

          const ts = timestamps[i];
          const age = now - ts;
          if (age > LASER_DECAY_MS) continue;

          const decay = easeOutQuad(1 - age / LASER_DECAY_MS);
          const taper = 0.3 + 0.7 * (i / (numPoints - 1));
          const w = strokeWidth * taper;

          // Outer glow
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = `rgba(${LASER_COLOR_R},${LASER_COLOR_G},${LASER_COLOR_B},${decay * 0.15})`;
          ctx.lineWidth = w * 3;
          ctx.lineCap = 'round';
          ctx.stroke();

          // Mid glow
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = `rgba(${LASER_COLOR_R},${LASER_COLOR_G},${LASER_COLOR_B},${decay * 0.4})`;
          ctx.lineWidth = w * 1.5;
          ctx.lineCap = 'round';
          ctx.stroke();

          // Core
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = `rgba(${LASER_COLOR_R},${LASER_COLOR_G},${LASER_COLOR_B},${decay})`;
          ctx.lineWidth = w;
          ctx.lineCap = 'round';
          ctx.stroke();
        }

        ctx.fillStrokeShape(shape);
      }}
    />
  );
}
