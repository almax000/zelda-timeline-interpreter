import { useEffect } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { Toolbar } from './components/Toolbar';
import { GameLibrary } from './components/Sidebar';
import { TimelineCanvas } from './components/Canvas';
import { useUndoRedoShortcuts } from './hooks/useUndoRedoShortcuts';
import { useTabStore } from './stores/tabStore';
import { getCanvasStore } from './stores/canvasRegistry';
import { officialTimelineNodes, officialTimelineEdges } from './data/officialTimeline';

function AppContent() {
  useUndoRedoShortcuts();
  const activeTabId = useTabStore((state) => state.activeTabId);

  useEffect(() => {
    // Migrate old single-store localStorage to tab system
    const oldData = localStorage.getItem('zelda-timeline-storage');
    const tabData = localStorage.getItem('zelda-tab-canvas-1');
    if (oldData && !tabData) {
      localStorage.setItem('zelda-tab-canvas-1', oldData);
      localStorage.removeItem('zelda-timeline-storage');
    }

    // Also migrate from old 'official' tab id if present
    const oldOfficialData = localStorage.getItem('zelda-tab-official');
    if (oldOfficialData && !tabData) {
      localStorage.setItem('zelda-tab-canvas-1', oldOfficialData);
      localStorage.removeItem('zelda-tab-official');
    }

    // Load official timeline into canvas-1 if it has no data
    const canvas1Store = getCanvasStore('canvas-1');
    const { nodes } = canvas1Store.getState();
    if (nodes.length === 0) {
      canvas1Store.getState().loadTimeline(officialTimelineNodes, officialTimelineEdges);
    }
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        <GameLibrary />
        <ReactFlowProvider key={activeTabId}>
          <TimelineCanvas tabId={activeTabId} />
        </ReactFlowProvider>
      </div>
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;
