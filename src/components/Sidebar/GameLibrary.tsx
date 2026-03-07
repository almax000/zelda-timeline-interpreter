import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getMainlineGames, getSpinoffGames } from '../../data/games';
import { GameCard } from './GameCard';

export function GameLibrary() {
  const { t } = useTranslation();
  const [spinoffExpanded, setSpinoffExpanded] = useState(false);

  const mainlineGames = useMemo(
    () => getMainlineGames().sort((a, b) => a.releaseYear - b.releaseYear),
    [],
  );

  const spinoffGames = useMemo(
    () => getSpinoffGames().sort((a, b) => a.releaseYear - b.releaseYear),
    [],
  );

  return (
    <div className="flex-1 overflow-y-auto min-w-64">
      <div className="p-1.5 space-y-0.5">
        {mainlineGames.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>

      {spinoffGames.length > 0 && (
        <>
          <div className="mx-1.5 border-t border-slate-700/50" />
          <button
            onClick={() => setSpinoffExpanded((v) => !v)}
            className="w-full flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-300 transition-colors"
          >
            <svg
              className={`w-3 h-3 transition-transform ${spinoffExpanded ? 'rotate-90' : ''}`}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M8 5l10 7-10 7z" />
            </svg>
            {t('sidebar.spinoffSection')} ({spinoffGames.length})
          </button>

          {spinoffExpanded && (
            <div className="p-1.5 pt-0 space-y-0.5">
              {spinoffGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
