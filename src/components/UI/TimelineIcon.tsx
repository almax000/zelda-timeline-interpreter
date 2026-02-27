interface TimelineIconProps {
  size?: number;
  className?: string;
}

export function TimelineIcon({ size = 40, className }: TimelineIconProps) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className={className} fill="none">
      {/* Branching timeline: trunk splits into two paths */}
      <line x1="12" y1="10" x2="24" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="24" y1="22" x2="36" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="24" y1="22" x2="36" y2="34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="36" y1="34" x2="44" y2="38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      {/* Nodes */}
      <circle cx="12" cy="10" r="3.5" fill="currentColor" opacity="0.8" />
      <circle cx="24" cy="22" r="4" fill="currentColor" />
      <circle cx="36" cy="14" r="3.5" fill="currentColor" opacity="0.8" />
      <circle cx="36" cy="34" r="3.5" fill="currentColor" opacity="0.8" />
    </svg>
  );
}
