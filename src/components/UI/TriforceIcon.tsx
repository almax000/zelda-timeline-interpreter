interface TriforceIconProps {
  size?: number;
  className?: string;
}

export function TriforceIcon({ size = 14, className }: TriforceIconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className}>
      <polygon points="12,2 7,10 17,10" fill="currentColor" />
      <polygon points="7,10 2,18 12,18" fill="currentColor" />
      <polygon points="17,10 12,18 22,18" fill="currentColor" />
    </svg>
  );
}
