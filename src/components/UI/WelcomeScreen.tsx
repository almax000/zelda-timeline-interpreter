import { useTranslation } from 'react-i18next';
import { TriforceIcon } from './TriforceIcon';
import { useIsMobile } from '../../hooks/useIsMobile';

interface WelcomeScreenProps {
  onLoadOfficial: () => void;
  onStartBlank: () => void;
}

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent);
const mod = isMac ? '\u2318' : 'Ctrl';

function DragIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="6" width="10" height="12" rx="1.5" />
      <path d="M16 12h5m0 0l-2.5-2.5M21 12l-2.5 2.5" />
    </svg>
  );
}

function ConnectIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="12" r="3" />
      <line x1="9" y1="12" x2="15" y2="12" />
    </svg>
  );
}

function ZoomIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="7" />
      <path d="M15 15l5 5" />
      <path d="M7 10h6M10 7v6" />
    </svg>
  );
}

function PanIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18M3 12h18" />
      <path d="M12 3l-3 3M12 3l3 3" />
      <path d="M12 21l-3-3M12 21l3-3" />
      <path d="M3 12l3-3M3 12l3 3" />
      <path d="M21 12l-3-3M21 12l-3 3" />
    </svg>
  );
}

function CustomizeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v1.5M12 19.5V21M21 12h-1.5M4.5 12H3M18.36 5.64l-1.06 1.06M6.7 17.3l-1.06 1.06M18.36 18.36l-1.06-1.06M6.7 6.7L5.64 5.64" />
      <circle cx="12" cy="12" r="3.5" />
    </svg>
  );
}

function ShortcutsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" />
      <text x="12" y="16" textAnchor="middle" fontSize="12" fill="currentColor" fontWeight="600">?</text>
    </svg>
  );
}

const stepIcons = [DragIcon, ConnectIcon, ZoomIcon, PanIcon, CustomizeIcon, ShortcutsIcon];

const stepColors = [
  'var(--color-gold)',
  'var(--color-branch-child)',
  'var(--color-branch-adult)',
  'var(--color-branch-fallen)',
  'var(--color-gold)',
  'var(--color-branch-child)',
];

export function WelcomeScreen({ onLoadOfficial, onStartBlank }: WelcomeScreenProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const steps = [
    {
      title: isMobile ? t('welcome.step1TitleMobile') : t('welcome.step1Title'),
      desc: isMobile ? t('welcome.step1DescMobile') : t('welcome.step1Desc', { mod }),
    },
    { title: t('welcome.step2Title'), desc: t('welcome.step2Desc', { mod }) },
    { title: t('welcome.step3Title'), desc: t('welcome.step3Desc', { mod }) },
    { title: t('welcome.step4Title'), desc: t('welcome.step4Desc', { mod }) },
    { title: t('welcome.step5Title'), desc: t('welcome.step5Desc', { mod }) },
    { title: t('welcome.step6Title'), desc: t('welcome.step6Desc', { mod }) },
  ];

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
      <div
        className="flex flex-col items-center gap-6 p-4 md:p-8 rounded-2xl bg-[var(--color-surface)]/80 backdrop-blur-sm border border-[var(--color-surface-light)] shadow-2xl max-w-[90vw] md:max-w-xl text-center"
        style={{ animation: 'welcome-in 400ms ease-out both' }}
      >
        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <h2 className="text-xl font-bold text-[var(--color-text)]">
            {t('welcome.title')}
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
            {t('welcome.subtitle')}
          </p>
        </div>

        {/* Action Cards */}
        <div className="pointer-events-auto flex flex-col md:flex-row gap-3 md:gap-4 w-full md:w-auto">
          <button
            onClick={onLoadOfficial}
            className="group flex flex-col items-center gap-3 p-5 rounded-xl border border-[var(--color-gold)]/30 bg-[var(--color-gold)]/5 hover:bg-[var(--color-gold)]/15 hover:border-[var(--color-gold)]/60 transition-all w-full md:w-44"
          >
            <TriforceIcon size={28} className="text-[var(--color-gold)] opacity-70 group-hover:opacity-100 transition-opacity" />
            <span className="text-sm font-medium text-[var(--color-gold)] group-hover:brightness-110">
              {t('welcome.loadOfficial')}
            </span>
          </button>

          <button
            onClick={onStartBlank}
            className="group flex flex-col items-center gap-3 p-5 rounded-xl border border-[var(--color-branch-adult)]/40 bg-[var(--color-branch-adult)]/8 hover:bg-[var(--color-branch-adult)]/15 hover:border-[var(--color-branch-adult)]/60 transition-all w-full md:w-44"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-[var(--color-branch-adult)] group-hover:opacity-100 transition-opacity">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span className="text-sm font-semibold text-[var(--color-branch-adult)] group-hover:brightness-110 transition-colors">
              {t('welcome.startBlank')}
            </span>
          </button>
        </div>

        {/* Quick Start Guide */}
        <div className="w-full pt-4 border-t border-[var(--color-surface-light)]">
          <p className="text-[11px] uppercase tracking-widest text-[var(--color-gold)] mb-3">
            {t('welcome.quickStart')}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {steps.map((step, i) => {
              const Icon = stepIcons[i];
              const color = stepColors[i];
              return (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-full"
                    style={{ backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`, color }}
                  >
                    <Icon />
                  </div>
                  <span className="text-xs font-medium text-[var(--color-text)]">
                    {step.title}
                  </span>
                  <span className="text-[10px] leading-tight text-[var(--color-text-muted)]">
                    {step.desc}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
