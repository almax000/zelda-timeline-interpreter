import { useEffect } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/Toolbar';
import { TimelineCanvas } from './components/Canvas';
import { useUndoRedoShortcuts } from './hooks/useUndoRedoShortcuts';
import { useTabStore } from './stores/tabStore';
import { getCanvasStore } from './stores/canvasRegistry';
import { officialTimelineNodes, officialTimelineEdges } from './data/officialTimeline';
import { decodeTimeline } from './utils/sharing';

function AppContent() {
  useUndoRedoShortcuts();
  const activeTabId = useTabStore((s) => s.activeTabId);

  useEffect(() => {
    // Migrate old single-store localStorage to tab system
    const oldData = localStorage.getItem('zelda-timeline-storage');
    const tabData = localStorage.getItem('zelda-tab-canvas-1');
    if (oldData && !tabData) {
      localStorage.setItem('zelda-tab-canvas-1', oldData);
      localStorage.removeItem('zelda-timeline-storage');
    }

    const oldOfficialData = localStorage.getItem('zelda-tab-official');
    if (oldOfficialData && !tabData) {
      localStorage.setItem('zelda-tab-canvas-1', oldOfficialData);
      localStorage.removeItem('zelda-tab-official');
    }

    // Page 0: load official timeline if no persisted data
    const page0Store = getCanvasStore('page-0');
    if (page0Store.getState().nodes.length === 0) {
      page0Store.getState().loadTimeline(officialTimelineNodes, officialTimelineEdges);
    }

    // Load official timeline into canvas-1 if it has no data
    const canvas1Store = getCanvasStore('canvas-1');
    const { nodes } = canvas1Store.getState();
    if (nodes.length === 0) {
      canvas1Store.getState().loadTimeline(officialTimelineNodes, officialTimelineEdges);
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
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <div className="flex-1 relative">
          <ReactFlowProvider key={activeTabId}>
            <TimelineCanvas tabId={activeTabId} />
          </ReactFlowProvider>
        </div>
      </div>
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;
