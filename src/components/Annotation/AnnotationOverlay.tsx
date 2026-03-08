import { useRef, useCallback, useEffect, useState } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import Konva from 'konva';
import { useAnnotationStore, type Stroke } from '../../stores/annotationStore';
import { LaserStrokeShape } from './LaserStrokeShape';
import { hitTestStroke } from '../../utils/hitTest';

interface AnnotationOverlayProps {
  tabId: string;
  width: number;
  height: number;
}

export function AnnotationOverlay({ tabId, width, height }: AnnotationOverlayProps) {
  const isDrawing = useRef(false);
  const isErasing = useRef(false);
  const laserLayerRef = useRef<Konva.Layer>(null);
  const rafRef = useRef<number>(0);
  const [now, setNow] = useState(() => Date.now());

  const {
    isAnnotationMode,
    tool,
    color,
    strokeWidth,
    currentStroke,
    currentTimestamps,
    startStroke,
    addPoint,
    finishStroke,
    finishLaserStroke,
    removeStroke,
    cleanupDecayedLaser,
    getStrokes,
    getLaserStrokes,
  } = useAnnotationStore();

  const strokes = getStrokes(tabId);
  const laserStrokes = getLaserStrokes(tabId);

  const hasLaser = laserStrokes.length > 0 || (tool === 'laser' && currentStroke && currentStroke.length >= 4);

  // rAF animation loop for laser decay
  useEffect(() => {
    if (!hasLaser) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
      return;
    }

    const animate = () => {
      const currentNow = Date.now();
      setNow(currentNow);
      cleanupDecayedLaser(tabId);

      if (laserLayerRef.current) {
        laserLayerRef.current.batchDraw();
      }

      // Check if we still have laser content
      const remaining = useAnnotationStore.getState().getLaserStrokes(tabId);
      const currentStr = useAnnotationStore.getState().currentStroke;
      const currentTool = useAnnotationStore.getState().tool;
      if (remaining.length > 0 || (currentTool === 'laser' && currentStr && currentStr.length >= 4)) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        rafRef.current = 0;
      }
    };

    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };
  }, [hasLaser, tabId, cleanupDecayedLaser]);

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

  // Unified coordinate extraction for mouse and touch events
  const getPosition = useCallback(
    (evt: MouseEvent | TouchEvent): { x: number; y: number } | null => {
      const target = evt.target as HTMLElement;
      const rect = target.closest('.konva-stage-container')?.getBoundingClientRect();
      if (!rect) return null;

      if ('touches' in evt) {
        if (evt.touches.length > 1) return null; // ignore multi-touch
        const touch = evt.touches[0] ?? evt.changedTouches[0];
        if (!touch) return null;
        return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
      }
      return { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
    },
    []
  );

  const handlePointerDown = useCallback(
    (e: { evt: MouseEvent | TouchEvent }) => {
      if (!isAnnotationMode) return;
      const pos = getPosition(e.evt);
      if (!pos) return;

      if (tool === 'pen' || tool === 'laser') {
        isDrawing.current = true;
        startStroke();
        addPoint(pos.x, pos.y);
      } else if (tool === 'eraser') {
        isErasing.current = true;
        eraseAtPoint(pos.x, pos.y);
      }
    },
    [isAnnotationMode, tool, startStroke, addPoint, eraseAtPoint, getPosition]
  );

  const handlePointerMove = useCallback(
    (e: { evt: MouseEvent | TouchEvent }) => {
      if (!isAnnotationMode) return;
      const pos = getPosition(e.evt);
      if (!pos) return;

      if (isDrawing.current && (tool === 'pen' || tool === 'laser')) {
        addPoint(pos.x, pos.y);
      } else if (isErasing.current && tool === 'eraser') {
        eraseAtPoint(pos.x, pos.y);
      }
    },
    [isAnnotationMode, tool, addPoint, eraseAtPoint, getPosition]
  );

  const handlePointerUp = useCallback(() => {
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

  // Build current laser shape for live drawing
  const currentIsLaser = tool === 'laser' && currentStroke && currentStroke.length >= 4 && currentTimestamps;
  const currentLaserStroke: Stroke | null = currentIsLaser
    ? {
        id: 'current-laser',
        points: currentStroke!,
        color: '#ADFF2F',
        strokeWidth: 4,
        timestamps: currentTimestamps!,
      }
    : null;

  return (
    <div
      className="absolute inset-0 z-10"
      style={{
        pointerEvents: isAnnotationMode ? 'auto' : 'none',
        cursor,
        touchAction: isAnnotationMode ? 'none' : 'auto',
      }}
    >
      <Stage
        width={width}
        height={height}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
        className="konva-stage-container"
        style={{ cursor }}
      >
        {/* Pen layer */}
        <Layer>
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
          {/* Current pen stroke being drawn */}
          {currentStroke && currentStroke.length >= 4 && tool !== 'laser' && (
            <Line
              points={currentStroke}
              stroke={color}
              strokeWidth={strokeWidth}
              lineCap="round"
              lineJoin="round"
              tension={0.5}
              globalCompositeOperation="source-over"
            />
          )}
        </Layer>

        {/* Laser layer */}
        <Layer ref={laserLayerRef}>
          {laserStrokes.map((stroke) => (
            <LaserStrokeShape key={stroke.id} stroke={stroke} now={now} />
          ))}
          {currentLaserStroke && (
            <LaserStrokeShape stroke={currentLaserStroke} now={now} />
          )}
        </Layer>
      </Stage>
    </div>
  );
}
