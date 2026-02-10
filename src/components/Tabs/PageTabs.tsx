import { useState } from 'react';
import { useTabStore, type Tab } from '../../stores/tabStore';
import { TriforceIcon } from '../UI/TriforceIcon';
import { TabContextMenu } from './TabContextMenu';

interface ContextMenuState {
  x: number;
  y: number;
  tab: Tab;
}

export function PageTabs() {
  const { tabs, activeTabId, addTab, setActiveTab } = useTabStore();
  const editableTabs = tabs.filter((t) => t.id !== 'page-0');
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  const handleContextMenu = (e: React.MouseEvent, tab: Tab) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, tab });
  };

  return (
    <>
      <div className="flex items-center gap-1">
        {tabs.map((tab, index) => {
          const isActive = activeTabId === tab.id;
          const isPage0 = tab.id === 'page-0';
          const isLocked = tab.isLocked;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              onContextMenu={(e) => handleContextMenu(e, tab)}
              className={`
                h-7 min-w-[28px] px-2 rounded-md flex items-center justify-center text-xs font-semibold transition-all gap-1
                ${isActive
                  ? 'bg-[var(--color-gold)] text-[var(--color-background)]'
                  : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-light)] hover:text-[var(--color-text)]'
                }
              `}
              title={tab.name}
            >
              {isPage0 ? <TriforceIcon size={16} /> : String(index)}
              {isLocked && !isPage0 && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              )}
            </button>
          );
        })}

        <button
          onClick={addTab}
          disabled={editableTabs.length >= 10}
          className="h-7 w-7 rounded-md flex items-center justify-center text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-light)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          title="New canvas"
        >
          +
        </button>
      </div>

      {contextMenu && (
        <TabContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          tab={contextMenu.tab}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  );
}
