import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Tab {
  id: string;
  name: string;
  isLocked?: boolean;
}

interface TabStore {
  tabs: Tab[];
  activeTabId: string;

  addTab: () => void;
  removeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  renameTab: (id: string, name: string) => void;
  toggleLock: (id: string) => void;
}

let tabCounter = 1;

export const useTabStore = create<TabStore>()(
  persist(
    (set, get) => ({
      tabs: [
        { id: 'page-0', name: '▲', isLocked: true },
        { id: 'canvas-1', name: 'Canvas 1' },
      ],
      activeTabId: 'page-0',

      addTab: () => {
        const { tabs } = get();
        const editableTabs = tabs.filter((t) => t.id !== 'page-0');
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
        if (id === 'page-0') return;
        const editableTabs = tabs.filter((t) => t.id !== 'page-0');
        if (editableTabs.length <= 1) return;
        const filtered = tabs.filter((t) => t.id !== id);
        const newActive = activeTabId === id
          ? filtered[Math.max(0, tabs.findIndex((t) => t.id === id) - 1)].id
          : activeTabId;
        localStorage.removeItem(`zelda-tab-${id}`);
        set({ tabs: filtered, activeTabId: newActive });
      },

      setActiveTab: (id) => set({ activeTabId: id }),

      renameTab: (id, name) => {
        if (id === 'page-0') return;
        const { tabs } = get();
        set({
          tabs: tabs.map((t) =>
            t.id === id ? { ...t, name } : t
          ),
        });
      },

      toggleLock: (id) => {
        const { tabs } = get();
        set({
          tabs: tabs.map((t) =>
            t.id === id ? { ...t, isLocked: !t.isLocked } : t
          ),
        });
      },
    }),
    {
      name: 'zelda-tab-store',
      version: 2,
      migrate: (persisted: unknown, version: number) => {
        const state = persisted as { tabs?: Tab[]; activeTabId?: string };

        if (version < 2 && state?.tabs) {
          // v1 → v2: isReadOnly → isLocked, ensure page-0 exists
          const hasPage0 = state.tabs.some((t) => t.id === 'page-0');
          const migrated = state.tabs.map((t) => {
            const { isReadOnly, ...rest } = t as Tab & { isReadOnly?: boolean };
            if (t.id === 'page-0') {
              return { ...rest, isLocked: true };
            }
            return { ...rest, isLocked: isReadOnly ? true : undefined };
          });

          if (!hasPage0) {
            migrated.unshift({ id: 'page-0', name: '▲', isLocked: true });
          }

          return { ...state, tabs: migrated };
        }

        // v0 → v2: ensure page-0 exists
        if (state?.tabs && !state.tabs.find((t) => t.id === 'page-0')) {
          return {
            ...state,
            tabs: [
              { id: 'page-0', name: '▲', isLocked: true },
              ...state.tabs,
            ],
          };
        }
        return state;
      },
    }
  )
);
