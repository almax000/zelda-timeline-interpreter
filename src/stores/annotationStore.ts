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

  setAnnotationMode: (mode) => set({ isAnnotationMode: mode }),
  toggleAnnotationMode: () => set((s) => ({ isAnnotationMode: !s.isAnnotationMode })),
  setTool: (tool) => set({ tool }),
  setColor: (color) => set({ color }),
  setStrokeWidth: (width) => set({ strokeWidth: width }),

  startStroke: () => set({ currentStroke: [] }),

  addPoint: (x, y) => {
    const { currentStroke } = get();
    if (!currentStroke) return;
    if (currentStroke.length >= 2) {
      const lastX = currentStroke[currentStroke.length - 2];
      const lastY = currentStroke[currentStroke.length - 1];
      if (Math.hypot(x - lastX, y - lastY) < 3) return;
    }
    set({ currentStroke: [...currentStroke, x, y] });
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
      set({ strokes: updated, currentStroke: null });
    } else {
      set({ currentStroke: null });
    }
  },

  finishLaserStroke: (tabId) => {
    const { currentStroke, laserStrokes } = get();
    if (currentStroke && currentStroke.length >= 4) {
      const newStroke: Stroke = {
        id: `laser-${Date.now()}`,
        points: currentStroke,
        color: '#ADFF2F',
        strokeWidth: 4,
      };
      const tabLaserStrokes = laserStrokes.get(tabId) || [];
      const updated = new Map(laserStrokes);
      updated.set(tabId, [...tabLaserStrokes, newStroke]);
      set({ laserStrokes: updated, currentStroke: null });

      // Auto-remove after 1 second
      const strokeId = newStroke.id;
      setTimeout(() => {
        get().removeLaserStroke(tabId, strokeId);
      }, 1000);
    } else {
      set({ currentStroke: null });
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
