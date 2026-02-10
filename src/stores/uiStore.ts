import { create } from 'zustand';

type ShapeTool = 'rectangle' | 'circle' | 'arrow' | 'line' | null;
type ActiveTool = 'select' | 'pen' | 'eraser' | 'shape' | 'annotate';

interface UIStore {
  activeTool: ActiveTool;
  activeShapeTool: ShapeTool;

  setActiveTool: (tool: ActiveTool) => void;
  setActiveShapeTool: (shape: ShapeTool) => void;
  resetTool: () => void;
}

export const useUIStore = create<UIStore>()((set) => ({
  activeTool: 'select',
  activeShapeTool: null,

  setActiveTool: (tool) => set({ activeTool: tool, activeShapeTool: null }),
  setActiveShapeTool: (shape) => set({
    activeTool: shape ? 'shape' : 'select',
    activeShapeTool: shape,
  }),
  resetTool: () => set({ activeTool: 'select', activeShapeTool: null }),
}));
