import { ReactFlowProvider } from '@xyflow/react';
import { Toolbar } from './components/Toolbar';
import { GameLibrary } from './components/Sidebar';
import { TimelineCanvas } from './components/Canvas';

function App() {
  return (
    <ReactFlowProvider>
      <div className="flex flex-col h-screen w-screen overflow-hidden">
        <Toolbar />
        <div className="flex flex-1 overflow-hidden">
          <GameLibrary />
          <TimelineCanvas />
        </div>
      </div>
    </ReactFlowProvider>
  );
}

export default App;
