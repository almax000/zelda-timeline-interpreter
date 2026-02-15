import { create } from 'zustand';

export interface Point {
  x: number;
  y: number;
}

export interface Stroke {
  id: string;
  points: number[];
  color: string;
  strokeWidth: number;
  timestamps?: number[];
}

export type AnnotationTool = 'pen' | 'eraser' | 'laser';

interface AnnotationStore {
  isAnnotationMode: boolean;
  tool: AnnotationTool;
  color: string;
  strokeWidth: number;
  strokes: Map<string, Stroke[]>; // tabId -> strokes
  laserStrokes: Map<string, Stroke[]>; // tabId -> laser strokes
  currentStroke: number[] | null;
  currentTimestamps: number[] | null;

  setAnnotationMode: (mode: boolean) => void;
  toggleAnnotationMode: () => void;
  setTool: (tool: AnnotationTool) => void;
  setColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  startStroke: () => void;
  addPoint: (x: number, y: number) => void;
  finishStroke: (tabId: string) => void;
  finishLaserStroke: (tabId: string) => void;
  removeStroke: (tabId: string, strokeId: string) => void;
  removeLaserStroke: (tabId: string, strokeId: string) => void;
  cleanupDecayedLaser: (tabId: string) => void;
  clearStrokes: (tabId: string) => void;
  getStrokes: (tabId: string) => Stroke[];
  getLaserStrokes: (tabId: string) => Stroke[];
}

export const useAnnotationStore = create<AnnotationStore>((set, get) => ({
  isAnnotationMode: false,
  tool: 'pen',
  color: '#EF4444',
  strokeWidth: 3,
  strokes: new Map(),
  laserStrokes: new Map(),
  currentStroke: null,
  currentTimestamps: null,

  setAnnotationMode: (mode) => set({ isAnnotationMode: mode }),
  toggleAnnotationMode: () => set((s) => ({ isAnnotationMode: !s.isAnnotationMode })),
  setTool: (tool) => set({ tool }),
  setColor: (color) => set({ color }),
  setStrokeWidth: (width) => set({ strokeWidth: width }),

  startStroke: () => {
    const { tool } = get();
    if (tool === 'laser') {
      set({ currentStroke: [], currentTimestamps: [] });
    } else {
      set({ currentStroke: [], currentTimestamps: null });
    }
  },

  addPoint: (x, y) => {
    const { currentStroke, currentTimestamps, tool } = get();
    if (!currentStroke) return;
    if (currentStroke.length >= 2) {
      const lastX = currentStroke[currentStroke.length - 2];
      const lastY = currentStroke[currentStroke.length - 1];
      if (Math.hypot(x - lastX, y - lastY) < 3) return;
    }
    const now = Date.now();
    if (tool === 'laser' && currentTimestamps) {
      set({
        currentStroke: [...currentStroke, x, y],
        currentTimestamps: [...currentTimestamps, now],
      });
    } else {
      set({ currentStroke: [...currentStroke, x, y] });
    }
  },

  finishStroke: (tabId) => {
    const { currentStroke, color, strokeWidth, strokes } = get();
    if (currentStroke && currentStroke.length >= 4) {
      const newStroke: Stroke = {
        id: `stroke-${Date.now()}`,
        points: currentStroke,
        color,
        strokeWidth,
      };
      const tabStrokes = strokes.get(tabId) || [];
      const updated = new Map(strokes);
      updated.set(tabId, [...tabStrokes, newStroke]);
      set({ strokes: updated, currentStroke: null, currentTimestamps: null });
    } else {
      set({ currentStroke: null, currentTimestamps: null });
    }
  },

  finishLaserStroke: (tabId) => {
    const { currentStroke, currentTimestamps, laserStrokes } = get();
    if (currentStroke && currentStroke.length >= 4 && currentTimestamps) {
      const newStroke: Stroke = {
        id: `laser-${Date.now()}`,
        points: currentStroke,
        color: '#ADFF2F',
        strokeWidth: 4,
        timestamps: currentTimestamps,
      };
      const tabLaserStrokes = laserStrokes.get(tabId) || [];
      const updated = new Map(laserStrokes);
      updated.set(tabId, [...tabLaserStrokes, newStroke]);
      set({ laserStrokes: updated, currentStroke: null, currentTimestamps: null });
    } else {
      set({ currentStroke: null, currentTimestamps: null });
    }
  },

  removeStroke: (tabId, strokeId) => {
    const { strokes } = get();
    const tabStrokes = strokes.get(tabId) || [];
    const updated = new Map(strokes);
    updated.set(tabId, tabStrokes.filter((s) => s.id !== strokeId));
    set({ strokes: updated });
  },

  removeLaserStroke: (tabId, strokeId) => {
    const { laserStrokes } = get();
    const tabLaserStrokes = laserStrokes.get(tabId) || [];
    const updated = new Map(laserStrokes);
    updated.set(tabId, tabLaserStrokes.filter((s) => s.id !== strokeId));
    set({ laserStrokes: updated });
  },

  cleanupDecayedLaser: (tabId) => {
    const { laserStrokes } = get();
    const tabLaserStrokes = laserStrokes.get(tabId) || [];
    const now = Date.now();
    const DECAY_TIME = 1000;
    const alive = tabLaserStrokes.filter((stroke) => {
      if (!stroke.timestamps || stroke.timestamps.length === 0) return false;
      const newestTs = stroke.timestamps[stroke.timestamps.length - 1];
      return now - newestTs < DECAY_TIME;
    });
    if (alive.length !== tabLaserStrokes.length) {
      const updated = new Map(laserStrokes);
      updated.set(tabId, alive);
      set({ laserStrokes: updated });
    }
  },

  clearStrokes: (tabId) => {
    const { strokes } = get();
    const updated = new Map(strokes);
    updated.set(tabId, []);
    set({ strokes: updated });
  },

  getStrokes: (tabId) => {
    return get().strokes.get(tabId) || [];
  },

  getLaserStrokes: (tabId) => {
    return get().laserStrokes.get(tabId) || [];
  },
}));
