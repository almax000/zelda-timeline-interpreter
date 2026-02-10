import { useState } from 'react';
import { LanguageDropdown } from './LanguageDropdown';
import { AboutModal } from './AboutModal';

function AboutIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="8" r="1.5" fill="currentColor" stroke="none" />
      <rect x="10.5" y="12" width="3" height="7" rx="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

const fontStyle = { fontFamily: "'Hylia Serif', serif" };

const iconBtn =
  'w-7 h-7 flex items-center justify-center rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-light)] transition-colors';

export function SidebarLogo() {
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  return (
    <div className="px-4 py-3">
      <div className="flex items-start justify-between">
        <div className="whitespace-nowrap">
          {['Zelda', 'Timeline', 'Interpreter'].map((word) => (
            <div
              key={word}
              className="text-[var(--color-gold)] text-lg leading-tight tracking-wider"
              style={fontStyle}
            >
              {word}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <LanguageDropdown />
          <button onClick={() => setIsAboutOpen(true)} className={iconBtn} title="About">
            <AboutIcon />
          </button>
        </div>
      </div>
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </div>
  );
}
