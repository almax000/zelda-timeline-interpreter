import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { games, getMainlineGames, getSpinoffGames } from '../../data/games';
import { GameCard } from './GameCard';

export function GameLibrary() {
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState('');

  const mainlineGames = useMemo(() => {
    let result = getMainlineGames().sort((a, b) => a.releaseYear - b.releaseYear);
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      result = result.filter((g) => {
        const name = g.names[i18n.language as keyof typeof g.names] || g.names.en;
        return name.toLowerCase().includes(searchLower);
      });
    }
    return result;
  }, [search, i18n.language]);

  const spinoffGames = useMemo(() => {
    let result = getSpinoffGames().sort((a, b) => a.releaseYear - b.releaseYear);
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      result = result.filter((g) => {
        const name = g.names[i18n.language as keyof typeof g.names] || g.names.en;
        return name.toLowerCase().includes(searchLower);
      });
    }
    return result;
  }, [search, i18n.language]);

  return (
    <>
      {/* Search */}
      <div className="px-3 py-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('sidebar.searchPlaceholder')}
          className="w-full px-3 py-1.5 rounded-lg bg-[var(--color-background)] border border-[var(--color-surface-light)] text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-gold)]"
        />
      </div>

      {/* Game list */}
      <div className="flex-1 overflow-y-auto">
        {mainlineGames.length > 0 && (
          <div>
            <div className="sticky top-0 px-3 py-1.5 bg-[var(--color-surface)] border-b border-[var(--color-surface-light)]">
              <span className="text-xs font-semibold text-[var(--color-gold)] uppercase tracking-wider">
                {t('sidebar.filter.mainline')}
              </span>
              <span className="ml-2 text-xs text-[var(--color-text-muted)]">
                ({mainlineGames.length})
              </span>
            </div>
            <div className="p-1.5 space-y-0.5">
              {mainlineGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </div>
        )}

        {spinoffGames.length > 0 && (
          <div>
            <div className="sticky top-0 px-3 py-1.5 bg-[var(--color-surface)] border-b border-[var(--color-surface-light)]">
              <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                {t('sidebar.filter.spinoff')}
              </span>
              <span className="ml-2 text-xs text-[var(--color-text-muted)]">
                ({spinoffGames.length})
              </span>
            </div>
            <div className="p-1.5 space-y-0.5">
              {spinoffGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </div>
        )}

        {mainlineGames.length === 0 && spinoffGames.length === 0 && (
          <p className="text-center text-sm text-[var(--color-text-muted)] py-8">
            No games found
          </p>
        )}
      </div>
    </>
  );
}

export { games };
