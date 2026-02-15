import { create } from 'zustand';

export type ActiveTool = 'select' | 'pen' | 'eraser' | 'laser' | 'annotate' | 'split' | 'text';

interface UIStore {
  activeTool: ActiveTool;
  editingTextNodeId: string | null;

  setActiveTool: (tool: ActiveTool) => void;
  resetTool: () => void;
  setEditingTextNodeId: (id: string | null) => void;
}

export const useUIStore = create<UIStore>()((set) => ({
  activeTool: 'select',
  editingTextNodeId: null,

  setActiveTool: (tool) => set({ activeTool: tool }),
  resetTool: () => set({ activeTool: 'select' }),
  setEditingTextNodeId: (id) => set({ editingTextNodeId: id }),
}));
