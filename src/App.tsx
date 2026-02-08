import { useEffect, useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { Toolbar } from './components/Toolbar';
import { GameLibrary } from './components/Sidebar';
import { TimelineCanvas } from './components/Canvas';
import { FloatingToolbar } from './components/Toolbar/FloatingToolbar';
import { PageTabs } from './components/Tabs/PageTabs';
import { useUndoRedoShortcuts } from './hooks/useUndoRedoShortcuts';
import { useTabStore } from './stores/tabStore';
import { getCanvasStore } from './stores/canvasRegistry';
import { officialTimelineNodes, officialTimelineEdges } from './data/officialTimeline';

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function AppContent() {
  useUndoRedoShortcuts();
  const activeTabId = useTabStore((state) => state.activeTabId);
  const activeTab = useTabStore((state) => state.tabs.find((t) => t.id === state.activeTabId));
  const isReadOnly = activeTab?.isReadOnly ?? false;
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Auto-collapse sidebar on page-0
  useEffect(() => {
    if (isReadOnly) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isReadOnly]);

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

    // Page 0 always loads official timeline (not persisted)
    const page0Store = getCanvasStore('page-0');
    page0Store.getState().loadTimeline(officialTimelineNodes, officialTimelineEdges);

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
      <div className="flex flex-1 overflow-hidden relative">
        {sidebarOpen && (
          <GameLibrary onCollapse={() => setSidebarOpen(false)} />
        )}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-6 h-full bg-[var(--color-surface)] hover:bg-[var(--color-surface-light)] border-r border-[var(--color-surface-light)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            <ChevronRight />
          </button>
        )}
        <ReactFlowProvider key={activeTabId}>
          <TimelineCanvas tabId={activeTabId} />
        </ReactFlowProvider>
        {!isReadOnly && <FloatingToolbar />}
        <PageTabs />
      </div>
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;
