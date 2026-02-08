import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Tab {
  id: string;
  name: string;
}

interface TabStore {
  tabs: Tab[];
  activeTabId: string;

  addTab: () => void;
  removeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  renameTab: (id: string, name: string) => void;
}

let tabCounter = 1;

export const useTabStore = create<TabStore>()(
  persist(
    (set, get) => ({
      tabs: [{ id: 'canvas-1', name: 'Canvas 1' }],
      activeTabId: 'canvas-1',

      addTab: () => {
        const { tabs } = get();
        if (tabs.length >= 10) return;
        tabCounter = Math.max(tabCounter, tabs.length);
        tabCounter++;
        const newTab: Tab = {
          id: `tab-${Date.now()}`,
          name: `Canvas ${tabCounter}`,
        };
        set({ tabs: [...tabs, newTab], activeTabId: newTab.id });
      },

      removeTab: (id) => {
        const { tabs, activeTabId } = get();
        if (tabs.length <= 1) return;
        const filtered = tabs.filter((t) => t.id !== id);
        if (filtered.length === 0) return;
        // If removing active tab, switch to previous or first
        const newActive = activeTabId === id
          ? filtered[Math.max(0, tabs.findIndex((t) => t.id === id) - 1)].id
          : activeTabId;
        // Clean up localStorage for removed tab
        localStorage.removeItem(`zelda-tab-${id}`);
        set({ tabs: filtered, activeTabId: newActive });
      },

      setActiveTab: (id) => set({ activeTabId: id }),

      renameTab: (id, name) => {
        set({
          tabs: get().tabs.map((t) =>
            t.id === id ? { ...t, name } : t
          ),
        });
      },
    }),
    {
      name: 'zelda-tab-store',
    }
  )
);
