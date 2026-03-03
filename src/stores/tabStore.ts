import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getCanvasStore, removeCanvasStore } from './canvasRegistry';
import { STORAGE_KEYS } from '../constants';

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
  toggleLock: (id: string) => void;
  duplicateTab: (sourceId: string) => void;
}

let tabCounter = 1;

export const useTabStore = create<TabStore>()(
  persist(
    (set, get) => ({
      tabs: [
        { id: 'canvas-1', name: 'Canvas 1' },
      ],
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
        const newActive = activeTabId === id
          ? filtered[Math.max(0, tabs.findIndex((t) => t.id === id) - 1)].id
          : activeTabId;
        localStorage.removeItem(STORAGE_KEYS.tabCanvas(id));
        removeCanvasStore(id);
        set({ tabs: filtered, activeTabId: newActive });
      },

      setActiveTab: (id) => set({ activeTabId: id }),

      toggleLock: (id) => {
        const { tabs } = get();
        set({
          tabs: tabs.map((t) =>
            t.id === id ? { ...t, isLocked: !t.isLocked } : t
          ),
        });
      },

      duplicateTab: (sourceId) => {
        const { tabs } = get();
        if (tabs.length >= 10) return;

        const sourceStore = getCanvasStore(sourceId);
        const { nodes, edges } = sourceStore.getState();

        tabCounter = Math.max(tabCounter, tabs.length);
        tabCounter++;
        const newTab: Tab = {
          id: `tab-${Date.now()}`,
          name: `Canvas ${tabCounter}`,
        };
        set({ tabs: [...tabs, newTab], activeTabId: newTab.id });

        // Copy nodes and edges into the new tab's store
        const targetStore = getCanvasStore(newTab.id);
        const ts = Date.now();
        const idMap = new Map<string, string>();
        const clonedNodes = nodes.map((n, i) => {
          const newId = `${n.type}-dup-${ts}-${i}`;
          idMap.set(n.id, newId);
          return { ...n, id: newId, selected: false };
        });
        const clonedEdges = edges.map((e) => ({
          ...e,
          id: `${idMap.get(e.source) ?? e.source}-${idMap.get(e.target) ?? e.target}`,
          source: idMap.get(e.source) ?? e.source,
          target: idMap.get(e.target) ?? e.target,
          selected: false,
        }));
        targetStore.getState().loadTimeline(clonedNodes, clonedEdges);
      },
    }),
    {
      name: STORAGE_KEYS.TAB_STORE,
      version: 3,
      migrate: (persisted: unknown) => {
        const state = persisted as { tabs?: Tab[]; activeTabId?: string };
        if (state?.tabs) {
          // Remove page-0 from old data
          const filtered = state.tabs
            .filter((t) => t.id !== 'page-0')
            .map((t) => {
              const { isReadOnly, ...rest } = t as Tab & { isReadOnly?: boolean };
              return { ...rest, isLocked: rest.isLocked ?? (isReadOnly ? true : undefined) };
            });
          if (filtered.length === 0) {
            filtered.push({ id: 'canvas-1', name: 'Canvas 1', isLocked: undefined });
          }
          const activeTabId = state.activeTabId === 'page-0'
            ? filtered[0].id
            : (state.activeTabId ?? filtered[0].id);
          return { ...state, tabs: filtered, activeTabId };
        }
        return state;
      },
    }
  )
);
