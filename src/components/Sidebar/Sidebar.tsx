import { useSettingsStore } from '../../stores/settingsStore';
import { SidebarLogo } from './SidebarLogo';
import { SidebarLinks } from './SidebarLinks';
import { GameLibrary } from './GameLibrary';

export function Sidebar() {
  const collapsed = useSettingsStore((s) => s.sidebarCollapsed);
  const setCollapsed = useSettingsStore((s) => s.setSidebarCollapsed);

  const toggle = () => setCollapsed(!collapsed);

  return (
    <div
      className={`h-full bg-[var(--color-surface)] border-r border-[var(--color-surface-light)] flex flex-col shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out ${
        collapsed ? 'w-14' : 'w-64'
      }`}
    >
      <SidebarLogo />
      <GameLibrary />
      <SidebarLinks collapsed={collapsed} onToggle={toggle} />
    </div>
  );
}
