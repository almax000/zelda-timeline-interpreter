import { create } from 'zustand';

export type ActiveTool = 'select' | 'pen' | 'eraser' | 'laser' | 'annotate' | 'split' | 'text';

interface UIStore {
  activeTool: ActiveTool;
  editingTextNodeId: string | null;
  isHelpOpen: boolean;
  isSidebarDrawerOpen: boolean;

  setActiveTool: (tool: ActiveTool) => void;
  resetTool: () => void;
  setEditingTextNodeId: (id: string | null) => void;
  toggleHelp: () => void;
  setHelpOpen: (open: boolean) => void;
  setSidebarDrawerOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>()((set) => ({
  activeTool: 'select',
  editingTextNodeId: null,
  isHelpOpen: true,
  isSidebarDrawerOpen: false,

  setActiveTool: (tool) => set({ activeTool: tool }),
  resetTool: () => set({ activeTool: 'select' }),
  setEditingTextNodeId: (id) => set({ editingTextNodeId: id }),
  toggleHelp: () => set((s) => ({ isHelpOpen: !s.isHelpOpen })),
  setHelpOpen: (open) => set({ isHelpOpen: open }),
  setSidebarDrawerOpen: (open) => set({ isSidebarDrawerOpen: open }),
}));
