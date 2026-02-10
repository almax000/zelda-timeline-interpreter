function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

interface SidebarLinksProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function SidebarLinks({ collapsed, onToggle }: SidebarLinksProps) {
  return (
    <div className="mt-auto border-t border-[var(--color-surface-light)] flex justify-center py-2">
      <button
        onClick={onToggle}
        className="w-7 h-7 flex items-center justify-center rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-light)] transition-colors"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight /> : <ChevronLeft />}
      </button>
    </div>
  );
}
