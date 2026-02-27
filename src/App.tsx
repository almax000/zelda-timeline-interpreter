import { useEffect } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { Sidebar } from './components/Sidebar';
import { TimelineCanvas } from './components/Canvas';
import { CanvasOverlay } from './components/Canvas/CanvasOverlay';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useTabStore } from './stores/tabStore';
import { getCanvasStore } from './stores/canvasRegistry';
import { officialTimelineNodes, officialTimelineEdges } from './data/officialTimeline';
import { decodeTimeline } from './utils/sharing';
import { STORAGE_KEYS } from './constants';

// Bump this when official timeline data changes to invalidate page-0 cache.
// Runs at module level (before any Zustand store hydrates from localStorage).
const DATA_VERSION = 3;
(() => {
  const stored = Number(localStorage.getItem(STORAGE_KEYS.DATA_VERSION) ?? 0);
  if (stored < DATA_VERSION) {
    localStorage.removeItem(STORAGE_KEYS.tabCanvas('page-0'));
    localStorage.setItem(STORAGE_KEYS.DATA_VERSION, String(DATA_VERSION));
  }
  // Legacy single-store migration
  const oldData = localStorage.getItem('zelda-timeline-storage');
  const tabData = localStorage.getItem(STORAGE_KEYS.tabCanvas('canvas-1'));
  if (oldData && !tabData) {
    localStorage.setItem(STORAGE_KEYS.tabCanvas('canvas-1'), oldData);
    localStorage.removeItem('zelda-timeline-storage');
  }
  const oldOfficial = localStorage.getItem('zelda-tab-official');
  if (oldOfficial && !tabData) {
    localStorage.setItem(STORAGE_KEYS.tabCanvas('canvas-1'), oldOfficial);
    localStorage.removeItem('zelda-tab-official');
  }
})();

function AppContent() {
  useKeyboardShortcuts();
  const activeTabId = useTabStore((s) => s.activeTabId);

  useEffect(() => {
    // Page 0: load official timeline if no persisted data
    const page0Store = getCanvasStore('page-0');
    if (page0Store.getState().nodes.length === 0) {
      page0Store.getState().loadTimeline(officialTimelineNodes, officialTimelineEdges);
    }

    // Check URL hash for shared timeline
    if (window.location.hash.startsWith('#share=')) {
      try {
        const shared = decodeTimeline(window.location.hash);
        if (shared) {
          const { addTab } = useTabStore.getState();
          addTab();
          const { activeTabId } = useTabStore.getState();
          const sharedStore = getCanvasStore(activeTabId);
          sharedStore.getState().loadTimeline(shared.nodes, shared.edges);
          // Clear hash after loading
          history.replaceState(null, '', window.location.pathname);
        }
      } catch {
        console.error('Failed to decode shared timeline');
      }
    }
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 relative min-w-0">
        <ReactFlowProvider key={activeTabId}>
          <TimelineCanvas tabId={activeTabId} />
        </ReactFlowProvider>
        <CanvasOverlay />
      </div>
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;
