import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../stores/canvasRegistry', () => ({
  getCanvasStore: vi.fn(() => ({
    getState: () => ({ nodes: [], edges: [], loadTimeline: vi.fn() }),
  })),
  removeCanvasStore: vi.fn(),
}));

import { useTabStore } from '../../stores/tabStore';

describe('tabStore', () => {
  beforeEach(() => {
    useTabStore.setState({
      tabs: [{ id: 'canvas-1', name: 'Canvas 1' }],
      activeTabId: 'canvas-1',
    });
  });

  describe('initial state', () => {
    it('starts with one tab', () => {
      expect(useTabStore.getState().tabs).toHaveLength(1);
      expect(useTabStore.getState().tabs[0].id).toBe('canvas-1');
    });

    it('has canvas-1 as active tab', () => {
      expect(useTabStore.getState().activeTabId).toBe('canvas-1');
    });
  });

  describe('addTab', () => {
    it('adds a new tab and switches to it', () => {
      useTabStore.getState().addTab();
      const { tabs, activeTabId } = useTabStore.getState();
      expect(tabs).toHaveLength(2);
      expect(activeTabId).toBe(tabs[1].id);
    });

    it('respects max tab limit of 10', () => {
      for (let i = 0; i < 15; i++) {
        useTabStore.getState().addTab();
      }
      expect(useTabStore.getState().tabs.length).toBeLessThanOrEqual(10);
    });
  });

  describe('removeTab', () => {
    it('removes a tab', () => {
      useTabStore.getState().addTab();
      const secondTabId = useTabStore.getState().tabs[1].id;
      useTabStore.getState().removeTab(secondTabId);
      expect(useTabStore.getState().tabs).toHaveLength(1);
    });

    it('does not remove the last tab', () => {
      useTabStore.getState().removeTab('canvas-1');
      expect(useTabStore.getState().tabs).toHaveLength(1);
    });

    it('switches active tab when removing the active one', () => {
      useTabStore.getState().addTab();
      const secondTabId = useTabStore.getState().tabs[1].id;
      useTabStore.getState().setActiveTab(secondTabId);
      useTabStore.getState().removeTab(secondTabId);
      expect(useTabStore.getState().activeTabId).toBe('canvas-1');
    });
  });

  describe('renameTab', () => {
    it('renames a tab', () => {
      useTabStore.getState().renameTab('canvas-1', 'My Timeline');
      expect(useTabStore.getState().tabs[0].name).toBe('My Timeline');
    });
  });

  describe('toggleLock', () => {
    it('toggles the lock state', () => {
      expect(useTabStore.getState().tabs[0].isLocked).toBeUndefined();
      useTabStore.getState().toggleLock('canvas-1');
      expect(useTabStore.getState().tabs[0].isLocked).toBe(true);
      useTabStore.getState().toggleLock('canvas-1');
      expect(useTabStore.getState().tabs[0].isLocked).toBe(false);
    });
  });

  describe('setActiveTab', () => {
    it('switches the active tab', () => {
      useTabStore.getState().addTab();
      const secondTabId = useTabStore.getState().tabs[1].id;
      useTabStore.getState().setActiveTab('canvas-1');
      expect(useTabStore.getState().activeTabId).toBe('canvas-1');
      useTabStore.getState().setActiveTab(secondTabId);
      expect(useTabStore.getState().activeTabId).toBe(secondTabId);
    });
  });
});
