import { PageTabs } from '../Tabs/PageTabs';
import { ShareButton } from '../Toolbar/ShareButton';
import { ExportButton } from '../Toolbar/ExportMenu';
import { FloatingToolbar } from '../Toolbar/FloatingToolbar';

export function CanvasOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col">
      {/* Top bar: toolbar centered, share/export right */}
      <div className="flex items-center justify-between p-2 gap-2">
        {/* Left: Page tabs */}
        <div className="pointer-events-auto ml-2">
          <PageTabs />
        </div>

        {/* Center: Floating toolbar */}
        <div className="flex-1 flex justify-center">
          <FloatingToolbar />
        </div>

        {/* Right: Share + Export */}
        <div className="flex items-center gap-1.5">
          <ShareButton />
          <ExportButton />
        </div>
      </div>

      {/* Spacer (rest of canvas) */}
      <div className="flex-1" />
    </div>
  );
}
