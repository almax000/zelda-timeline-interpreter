import { useSettingsStore } from '../../stores/settingsStore';
import { SidebarLogo } from './SidebarLogo';
import { LanguageDropdown } from './LanguageDropdown';
import { SidebarLinks } from './SidebarLinks';
import { GameLibrary, games } from './GameLibrary';

export function Sidebar() {
  const collapsed = useSettingsStore((s) => s.sidebarCollapsed);
  const setCollapsed = useSettingsStore((s) => s.setSidebarCollapsed);

  const toggle = () => setCollapsed(!collapsed);

  return (
    <div
      className={`h-full bg-[var(--color-surface)] border-r border-[var(--color-surface-light)] flex flex-col shrink-0 transition-[width] duration-200 ${
        collapsed ? 'w-14' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="border-b border-[var(--color-surface-light)]">
        <SidebarLogo collapsed={collapsed} />
      </div>

      {/* Language */}
      <div className="py-2 border-b border-[var(--color-surface-light)]">
        <LanguageDropdown collapsed={collapsed} />
      </div>

      {/* Game Library (hidden when collapsed) */}
      {!collapsed && <GameLibrary />}

      {/* Bottom links */}
      <SidebarLinks collapsed={collapsed} gameCount={games.length} onToggle={toggle} />
    </div>
  );
}
