interface SidebarLogoProps {
  collapsed: boolean;
}

export function SidebarLogo({ collapsed }: SidebarLogoProps) {
  const fontStyle = { fontFamily: "'Hylia Serif', serif" };

  if (collapsed) {
    return (
      <div className="flex flex-col items-center py-3 gap-0.5">
        {['Z', 'T', 'I'].map((letter) => (
          <span
            key={letter}
            className="text-lg text-[var(--color-gold)] leading-tight"
            style={fontStyle}
          >
            {letter}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="px-4 py-3">
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
  );
}
