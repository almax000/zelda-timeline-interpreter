import { useEffect } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { Sidebar } from './components/Sidebar';
import { TimelineCanvas } from './components/Canvas';
import { CanvasOverlay } from './components/Canvas/CanvasOverlay';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useTabStore } from './stores/tabStore';
import { getCanvasStore } from './stores/canvasRegistry';
import { decodeTimeline } from './utils/sharing';
import { STORAGE_KEYS } from './constants';

// Legacy single-store migration (runs before stores hydrate)
(() => {
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
  // Clean up obsolete page-0 data
  localStorage.removeItem(STORAGE_KEYS.tabCanvas('page-0'));
  localStorage.removeItem(STORAGE_KEYS.DATA_VERSION);
})();

function AppContent() {
  useKeyboardShortcuts();
  const activeTabId = useTabStore((s) => s.activeTabId);

  useEffect(() => {
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
