import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function MobileGate({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return <>{children}</>;

  return (
    <>
      {/* Show warning only on small screens */}
      <div className="sm:hidden fixed inset-0 z-[999] bg-[var(--color-bg)] flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-6" style={{ fontFamily: "'Hylia Serif', serif" }}>
          {['Zelda', 'Timeline', 'Interpreter'].map((word) => (
            <div key={word} className="text-[var(--color-gold)] text-3xl leading-tight tracking-wider">
              {word}
            </div>
          ))}
        </div>
        <h2 className="text-xl font-bold text-[var(--color-text)] mb-4">
          {t('mobile.title')}
        </h2>
        <p className="text-base text-[var(--color-text)] mb-8 max-w-xs leading-relaxed">
          {t('mobile.message')}
        </p>
        <button
          onClick={() => setDismissed(true)}
          className="text-base text-[var(--color-gold)] underline underline-offset-2 hover:text-[var(--color-gold)]/80 transition-colors"
        >
          {t('mobile.continue')}
        </button>
      </div>

      {/* Always render children (hidden behind overlay on mobile, visible on sm+) */}
      <div className="hidden sm:contents">{children}</div>
    </>
  );
}
