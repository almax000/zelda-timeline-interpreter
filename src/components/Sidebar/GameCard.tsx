import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Game } from '../../types/game';
import { useSettingsStore } from '../../stores/settingsStore';

interface GameCardProps {
  game: Game;
}

function GameCardComponent({ game }: GameCardProps) {
  const { t, i18n } = useTranslation();
  const coverRegion = useSettingsStore((state) => state.coverRegion);
  const [imageFailed, setImageFailed] = useState(false);

  const gameName = game.names[i18n.language as keyof typeof game.names] || game.names.en;
  const coverPath = game.covers[coverRegion] || game.covers.us;

  const handleDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData('application/zelda-game', game.id);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="flex items-center gap-3 p-2 rounded-lg transition-all duration-200 cursor-grab hover:bg-[var(--color-surface-light)] active:cursor-grabbing"
    >
      {/* Cover thumbnail */}
      <div className="w-10 flex-shrink-0 rounded overflow-hidden bg-[var(--color-surface-light)]">
        {coverPath && !imageFailed ? (
          <img
            src={`/covers/${coverRegion}/${coverPath}`}
            alt={gameName}
            className="w-full h-auto block"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="w-10 h-14 flex items-center justify-center">
            <span className="text-[8px] text-[var(--color-text-muted)]">N/A</span>
          </div>
        )}
      </div>

      {/* Game info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--color-text)] truncate">
          {gameName}
        </p>
      </div>

      {/* Canon indicator for spin-offs */}
      {!game.isMainline && game.isCanon && (
        <div className="relative group flex-shrink-0">
          <span className="w-5 h-5 flex items-center justify-center rounded text-xs font-bold text-[var(--color-gold)] bg-[var(--color-gold)]/20 cursor-help">
            !
          </span>
          {/* Tooltip */}
          <div className="absolute right-0 bottom-full mb-2 px-2 py-1 text-xs text-white bg-black/90 rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
            {t('sidebar.canonTooltip')}
            <div className="absolute top-full right-2 border-4 border-transparent border-t-black/90" />
          </div>
        </div>
      )}
    </div>
  );
}

export const GameCard = memo(GameCardComponent);
