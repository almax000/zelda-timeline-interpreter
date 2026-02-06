import { useEffect } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { Toolbar } from './components/Toolbar';
import { GameLibrary } from './components/Sidebar';
import { TimelineCanvas } from './components/Canvas';
import { useUndoRedoShortcuts } from './hooks/useUndoRedoShortcuts';
import { useTimelineStore } from './stores/timelineStore';
import { officialTimelineNodes, officialTimelineEdges } from './data/officialTimeline';

function AppContent() {
  useUndoRedoShortcuts();

  useEffect(() => {
    const stored = localStorage.getItem('zelda-timeline-storage');
    if (!stored) {
      useTimelineStore.getState().loadTimeline(officialTimelineNodes, officialTimelineEdges);
    }
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        <GameLibrary />
        <TimelineCanvas />
      </div>
    </div>
  );
}

function App() {
  return (
    <ReactFlowProvider>
      <AppContent />
    </ReactFlowProvider>
  );
}

export default App;
