import { useMemo } from 'react';
import { getMainlineGames } from '../../data/games';
import { GameCard } from './GameCard';

export function GameLibrary() {
  const mainlineGames = useMemo(
    () => getMainlineGames().sort((a, b) => a.releaseYear - b.releaseYear),
    [],
  );

  return (
    <div className="flex-1 overflow-y-auto min-w-64">
      <div className="p-1.5 space-y-0.5">
        {mainlineGames.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
}
