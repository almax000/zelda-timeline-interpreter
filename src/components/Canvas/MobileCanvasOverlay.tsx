import { PageTabs } from '../Tabs/PageTabs';
import { ShareButton } from '../Toolbar/ShareButton';
import { ExportButton } from '../Toolbar/ExportMenu';
import { MobileToolbar } from '../Toolbar/MobileToolbar';
import { SubToolbar } from '../Toolbar/SubToolbar';
import { HelpPanel } from '../UI/HelpPanel';

export function MobileCanvasOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between w-full p-2 gap-2">
        <div className="pointer-events-auto">
          <PageTabs />
        </div>
        <div className="flex items-center gap-1.5">
          <ShareButton />
          <ExportButton />
        </div>
      </div>

      <div className="flex-1" />

      {/* Bottom: toolbar + sub-toolbar, above drawer handle (48px) */}
      <div className="flex flex-col items-center gap-1 pb-[56px]">
        <SubToolbar />
        <MobileToolbar />
      </div>

      <HelpPanel />
    </div>
  );
}
