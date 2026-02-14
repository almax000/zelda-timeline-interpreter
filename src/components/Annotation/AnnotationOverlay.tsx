import { useRef, useCallback } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import { useAnnotationStore, type Stroke } from '../../stores/annotationStore';

interface AnnotationOverlayProps {
  tabId: string;
  width: number;
  height: number;
}

function distToSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function hitTestStroke(stroke: Stroke, x: number, y: number, threshold: number): boolean {
  const pts = stroke.points;
  for (let i = 0; i < pts.length - 2; i += 2) {
    if (distToSegment(x, y, pts[i], pts[i + 1], pts[i + 2], pts[i + 3]) < threshold) {
      return true;
    }
  }
  return false;
}

export function AnnotationOverlay({ tabId, width, height }: AnnotationOverlayProps) {
  const isDrawing = useRef(false);
  const isErasing = useRef(false);
  const {
    isAnnotationMode,
    tool,
    color,
    strokeWidth,
    currentStroke,
    startStroke,
    addPoint,
    finishStroke,
    finishLaserStroke,
    removeStroke,
    getStrokes,
    getLaserStrokes,
  } = useAnnotationStore();

  const strokes = getStrokes(tabId);
  const laserStrokes = getLaserStrokes(tabId);

  const eraseAtPoint = useCallback(
    (x: number, y: number) => {
      const currentStrokes = useAnnotationStore.getState().getStrokes(tabId);
      const sw = useAnnotationStore.getState().strokeWidth;
      const threshold = Math.min(Math.max(sw * 4 + 8, 12), 40);
      for (let i = currentStrokes.length - 1; i >= 0; i--) {
        if (hitTestStroke(currentStrokes[i], x, y, threshold)) {
          removeStroke(tabId, currentStrokes[i].id);
        }
      }
    },
    [tabId, removeStroke]
  );

  const handleMouseDown = useCallback(
    (e: { evt: MouseEvent }) => {
      if (!isAnnotationMode) return;
      const stage = e.evt.target as HTMLElement;
      const rect = stage.closest('.konva-stage-container')?.getBoundingClientRect();
      if (!rect) return;

      const x = e.evt.clientX - rect.left;
      const y = e.evt.clientY - rect.top;

      if (tool === 'pen' || tool === 'laser') {
        isDrawing.current = true;
        startStroke();
        addPoint(x, y);
      } else if (tool === 'eraser') {
        isErasing.current = true;
        eraseAtPoint(x, y);
      }
    },
    [isAnnotationMode, tool, startStroke, addPoint, eraseAtPoint]
  );

  const handleMouseMove = useCallback(
    (e: { evt: MouseEvent }) => {
      if (!isAnnotationMode) return;
      const stage = e.evt.target as HTMLElement;
      const rect = stage.closest('.konva-stage-container')?.getBoundingClientRect();
      if (!rect) return;

      const x = e.evt.clientX - rect.left;
      const y = e.evt.clientY - rect.top;

      if (isDrawing.current && (tool === 'pen' || tool === 'laser')) {
        addPoint(x, y);
      } else if (isErasing.current && tool === 'eraser') {
        eraseAtPoint(x, y);
      }
    },
    [isAnnotationMode, tool, addPoint, eraseAtPoint]
  );

  const handleMouseUp = useCallback(() => {
    if (isDrawing.current) {
      isDrawing.current = false;
      if (tool === 'laser') {
        finishLaserStroke(tabId);
      } else {
        finishStroke(tabId);
      }
    }
    isErasing.current = false;
  }, [finishStroke, finishLaserStroke, tool, tabId]);

  const hasContent = strokes.length > 0 || laserStrokes.length > 0;
  if (!isAnnotationMode && !hasContent) return null;

  const cursor = isAnnotationMode
    ? tool === 'pen' ? 'crosshair'
      : tool === 'laser' ? 'crosshair'
      : 'cell'
    : 'default';

  const laserColor = '#ADFF2F';

  return (
    <div
      className="absolute inset-0 z-10"
      style={{ pointerEvents: isAnnotationMode ? 'auto' : 'none', cursor }}
    >
      <Stage
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="konva-stage-container"
        style={{ cursor }}
      >
        <Layer>
          {/* Regular strokes */}
          {strokes.map((stroke) => (
            <Line
              key={stroke.id}
              points={stroke.points}
              stroke={stroke.color}
              strokeWidth={stroke.strokeWidth}
              lineCap="round"
              lineJoin="round"
              tension={0.5}
              globalCompositeOperation="source-over"
            />
          ))}
          {/* Laser strokes with glow */}
          {laserStrokes.map((stroke) => (
            <Line
              key={stroke.id}
              points={stroke.points}
              stroke={laserColor}
              strokeWidth={stroke.strokeWidth}
              lineCap="round"
              lineJoin="round"
              tension={0.5}
              globalCompositeOperation="source-over"
              shadowColor={laserColor}
              shadowBlur={10}
              shadowOpacity={0.8}
              opacity={1}
            />
          ))}
          {/* Current stroke being drawn */}
          {currentStroke && currentStroke.length >= 4 && (
            <Line
              points={currentStroke}
              stroke={tool === 'laser' ? laserColor : color}
              strokeWidth={tool === 'laser' ? 4 : strokeWidth}
              lineCap="round"
              lineJoin="round"
              tension={0.5}
              globalCompositeOperation="source-over"
              {...(tool === 'laser' ? {
                shadowColor: laserColor,
                shadowBlur: 10,
                shadowOpacity: 0.8,
              } : {})}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
}
