import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Game } from '../../types/game';

interface GameCardProps {
  game: Game;
}

function GameCardComponent({ game }: GameCardProps) {
  const { i18n } = useTranslation();
  const [logoFailed, setLogoFailed] = useState(false);

  const gameName = game.names[i18n.language as keyof typeof game.names] || game.names.en;

  const handleDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData('application/zelda-game', game.id);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="flex items-center justify-center p-2 rounded-lg cursor-grab hover:bg-[var(--color-surface-light)]/50 active:cursor-grabbing"
      title={gameName}
    >
      {game.logo && !logoFailed ? (
        <img
          src={`/logos/${game.logo}`}
          alt={gameName}
          className="max-w-full max-h-[40px] object-contain"
          onError={() => setLogoFailed(true)}
        />
      ) : (
        <span className="text-xs text-[var(--color-text-muted)] truncate max-w-full">
          {gameName}
        </span>
      )}
    </div>
  );
}

export const GameCard = memo(GameCardComponent);
