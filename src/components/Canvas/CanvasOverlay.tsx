import { PageTabs } from '../Tabs/PageTabs';
import { ShareButton } from '../Toolbar/ShareButton';
import { ExportButton } from '../Toolbar/ExportMenu';
import { FloatingToolbar } from '../Toolbar/FloatingToolbar';

export function CanvasOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col">
      {/* Top bar */}
      <div className="flex items-start justify-between p-2">
        {/* Left: Page tabs */}
        <div className="pointer-events-auto">
          <PageTabs />
        </div>

        {/* Right: Share + Export */}
        <div className="flex items-center gap-1.5">
          <ShareButton />
          <ExportButton />
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom center: Floating toolbar */}
      <div className="flex justify-center pb-4">
        <FloatingToolbar />
      </div>
    </div>
  );
}
