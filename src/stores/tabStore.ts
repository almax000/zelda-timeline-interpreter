import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Tab {
  id: string;
  name: string;
  isReadOnly?: boolean;
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
      tabs: [
        { id: 'page-0', name: '▲', isReadOnly: true },
        { id: 'canvas-1', name: 'Canvas 1' },
      ],
      activeTabId: 'page-0',

      addTab: () => {
        const { tabs } = get();
        // Don't count page-0 toward the limit
        const editableTabs = tabs.filter((t) => !t.isReadOnly);
        if (editableTabs.length >= 10) return;
        tabCounter = Math.max(tabCounter, editableTabs.length);
        tabCounter++;
        const newTab: Tab = {
          id: `tab-${Date.now()}`,
          name: `Canvas ${tabCounter}`,
        };
        set({ tabs: [...tabs, newTab], activeTabId: newTab.id });
      },

      removeTab: (id) => {
        const { tabs, activeTabId } = get();
        const tab = tabs.find((t) => t.id === id);
        // Don't allow removing read-only tabs
        if (tab?.isReadOnly) return;
        // Need at least page-0 + 1 editable tab
        const editableTabs = tabs.filter((t) => !t.isReadOnly);
        if (editableTabs.length <= 1) return;
        const filtered = tabs.filter((t) => t.id !== id);
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
        const { tabs } = get();
        const tab = tabs.find((t) => t.id === id);
        // Don't allow renaming read-only tabs
        if (tab?.isReadOnly) return;
        set({
          tabs: tabs.map((t) =>
            t.id === id ? { ...t, name } : t
          ),
        });
      },
    }),
    {
      name: 'zelda-tab-store',
      migrate: (persisted: unknown) => {
        const state = persisted as { tabs?: Tab[]; activeTabId?: string };
        if (state?.tabs && !state.tabs.find((t) => t.id === 'page-0')) {
          return {
            ...state,
            tabs: [
              { id: 'page-0', name: '▲', isReadOnly: true },
              ...state.tabs,
            ],
          };
        }
        return state;
      },
      version: 1,
    }
  )
);
