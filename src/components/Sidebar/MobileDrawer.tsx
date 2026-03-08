import { useRef, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GameLibrary } from './GameLibrary';
import { LanguageDropdown } from './LanguageDropdown';
import { AboutModal } from './AboutModal';
import { useUIStore } from '../../stores/uiStore';

function AboutIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="8" r="1.5" fill="currentColor" stroke="none" />
      <rect x="10.5" y="12" width="3" height="7" rx="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

const DRAWER_HEIGHT = '60vh';
const HANDLE_HEIGHT = 48;
const SWIPE_THRESHOLD = 50;

export function MobileDrawer() {
  const { t } = useTranslation();
  const isOpen = useUIStore((s) => s.isSidebarDrawerOpen);
  const setOpen = useUIStore((s) => s.setSidebarDrawerOpen);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const touchStartY = useRef(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    if (isOpen && deltaY > SWIPE_THRESHOLD) {
      setOpen(false);
    } else if (!isOpen && deltaY < -SWIPE_THRESHOLD) {
      setOpen(true);
    }
  }, [isOpen, setOpen]);

  const handleGameTap = useCallback((gameId: string) => {
    window.dispatchEvent(new CustomEvent('zelda:add-game', { detail: { gameId } }));
    setOpen(false);
  }, [setOpen]);

  const iconBtn = 'w-8 h-8 flex items-center justify-center rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-light)] transition-colors';

  return (
    <>
      <div
        className="fixed bottom-0 left-0 right-0 z-30 bg-[var(--color-surface)] border-t border-[var(--color-surface-light)] shadow-2xl"
        style={{
          transform: isOpen ? 'translateY(0)' : `translateY(calc(100% - ${HANDLE_HEIGHT}px))`,
          height: DRAWER_HEIGHT,
          transition: 'transform 300ms ease-out',
        }}
      >
        {/* Handle bar */}
        <div
          className="flex items-center justify-between px-4 cursor-pointer select-none"
          style={{ height: HANDLE_HEIGHT }}
          onClick={() => setOpen(!isOpen)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex items-center gap-2">
            <svg
              className={`w-4 h-4 text-[var(--color-text-muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <polyline points="18 15 12 9 6 15" />
            </svg>
            <span className="text-sm font-medium text-[var(--color-text)]">
              {t('mobile.drawerTitle')}
            </span>
          </div>
          <div className="flex items-center gap-0.5">
            <LanguageDropdown />
            <button onClick={(e) => { e.stopPropagation(); setIsAboutOpen(true); }} className={iconBtn} title="About">
              <AboutIcon />
            </button>
          </div>
        </div>

        {/* Game list */}
        <div className="overflow-y-auto" style={{ height: `calc(100% - ${HANDLE_HEIGHT}px)` }}>
          <GameLibrary onGameTap={handleGameTap} />
        </div>
      </div>

      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </>
  );
}
