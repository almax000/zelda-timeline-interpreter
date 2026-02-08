import { useTabStore } from '../../stores/tabStore';

export function PageTabs() {
  const { tabs, activeTabId, addTab, removeTab, setActiveTab } = useTabStore();
  const editableTabs = tabs.filter((t) => !t.isReadOnly);

  return (
    <div className="fixed top-14 right-4 z-50 flex flex-col gap-1.5">
      {tabs.map((tab, index) => {
        const isActive = activeTabId === tab.id;
        const isPage0 = tab.isReadOnly;
        // Display: ▲ for page-0, numbers for editable tabs
        const label = isPage0 ? '▲' : String(index);

        return (
          <div key={tab.id} className="relative group">
            <button
              onClick={() => setActiveTab(tab.id)}
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all
                ${isActive
                  ? 'bg-[var(--color-gold)] text-white shadow-lg shadow-[var(--color-gold)]/30'
                  : 'bg-white/5 text-white/60 hover:bg-white/15 hover:text-white'
                }
              `}
              title={tab.name}
            >
              {label}
            </button>

            {/* Close button on hover - only for editable tabs when there's more than 1 */}
            {!isPage0 && editableTabs.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeTab(tab.id);
                }}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500/80 text-white text-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                title="Close"
              >
                ×
              </button>
            )}
          </div>
        );
      })}

      {/* Add button */}
      <button
        onClick={addTab}
        disabled={editableTabs.length >= 10}
        className="w-7 h-7 rounded-full flex items-center justify-center text-xs text-white/40 hover:text-white/80 hover:bg-white/10 transition-all mx-auto disabled:opacity-30 disabled:cursor-not-allowed"
        title="New canvas"
      >
        +
      </button>
    </div>
  );
}
