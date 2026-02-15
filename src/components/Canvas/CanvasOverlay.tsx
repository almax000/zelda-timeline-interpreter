import { PageTabs } from '../Tabs/PageTabs';
import { ShareButton } from '../Toolbar/ShareButton';
import { ExportButton } from '../Toolbar/ExportMenu';
import { FloatingToolbar } from '../Toolbar/FloatingToolbar';
import { SubToolbar } from '../Toolbar/SubToolbar';

export function CanvasOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col">
      <div className="flex flex-col items-center p-2 gap-1">
        {/* Row 1: tabs + toolbar + share/export */}
        <div className="flex items-center justify-between w-full gap-2">
          <div className="pointer-events-auto ml-2">
            <PageTabs />
          </div>
          <div className="flex-1 flex justify-center">
            <FloatingToolbar />
          </div>
          <div className="flex items-center gap-1.5">
            <ShareButton />
            <ExportButton />
          </div>
        </div>
        {/* Row 2: conditional sub-toolbar */}
        <SubToolbar />
      </div>
      <div className="flex-1" />
    </div>
  );
}
