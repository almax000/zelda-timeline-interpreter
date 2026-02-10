import { SidebarLogo } from './SidebarLogo';
import { GameLibrary } from './GameLibrary';

export function Sidebar() {
  return (
    <div className="h-full w-64 bg-[var(--color-surface)] border-r border-[var(--color-surface-light)] flex flex-col shrink-0">
      <SidebarLogo />
      <GameLibrary />
    </div>
  );
}
