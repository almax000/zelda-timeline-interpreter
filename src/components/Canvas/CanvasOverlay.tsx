import { PageTabs } from '../Tabs/PageTabs';
import { ShareButton } from '../Toolbar/ShareButton';
import { ExportButton } from '../Toolbar/ExportMenu';
import { FloatingToolbar } from '../Toolbar/FloatingToolbar';
import { SubToolbar } from '../Toolbar/SubToolbar';

export function CanvasOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col">
      <div className="flex items-center justify-between w-full p-2 gap-2">
        <div className="pointer-events-auto ml-2">
          <PageTabs />
        </div>
        <div className="flex-1 flex flex-col items-center gap-1">
          <FloatingToolbar />
          <SubToolbar />
        </div>
        <div className="flex items-center gap-1.5">
          <ShareButton />
          <ExportButton />
        </div>
      </div>
      <div className="flex-1" />
    </div>
  );
}
