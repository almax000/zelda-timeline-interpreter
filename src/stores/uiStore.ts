import { create } from 'zustand';

type ActiveTool = 'select' | 'pen' | 'eraser' | 'laser' | 'annotate' | 'split' | 'text';

interface UIStore {
  activeTool: ActiveTool;

  setActiveTool: (tool: ActiveTool) => void;
  resetTool: () => void;
}

export const useUIStore = create<UIStore>()((set) => ({
  activeTool: 'select',

  setActiveTool: (tool) => set({ activeTool: tool }),
  resetTool: () => set({ activeTool: 'select' }),
}));
