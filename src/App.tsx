import { useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { Sidebar } from './components/Sidebar';
import { TimelineCanvas } from './components/Canvas';
import { CanvasOverlay } from './components/Canvas/CanvasOverlay';
import { ShareViewer } from './components/ShareViewer';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useTabStore } from './stores/tabStore';
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
  const [sharedData] = useState(() => {
    if (window.location.hash.startsWith('#share=')) {
      try {
        return decodeTimeline(window.location.hash);
      } catch {
        return null;
      }
    }
    return null;
  });

  if (sharedData) {
    return <ShareViewer nodes={sharedData.nodes} edges={sharedData.edges} />;
  }
  return <AppContent />;
}

export default App;
