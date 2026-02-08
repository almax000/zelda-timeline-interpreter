import { memo, useState } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { useTranslation } from 'react-i18next';
import { getGameById } from '../../data/games';
import { useSettingsStore } from '../../stores/settingsStore';

interface GameNodeData extends Record<string, unknown> {
  gameId: string;
  label?: string;
}

type GameNodeType = Node<GameNodeData, 'game'>;

function GameNodeComponent({ data, selected }: NodeProps<GameNodeType>) {
  const { i18n } = useTranslation();
  const coverRegion = useSettingsStore((state) => state.coverRegion);
  const [logoFailed, setLogoFailed] = useState(false);
  const [fallbackToUs, setFallbackToUs] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const game = getGameById(data.gameId);
  if (!game) return null;

  const gameName = game.names[i18n.language as keyof typeof game.names] || game.names.en;

  const handleLogoError = () => {
    setLogoFailed(true);
  };

  const handleCoverError = () => {
    if (!fallbackToUs && coverRegion !== 'us') {
      setFallbackToUs(true);
    } else {
      setImageFailed(true);
    }
  };

  const effectiveRegion = fallbackToUs ? 'us' : coverRegion;
  const coverPath = game.covers[effectiveRegion] || game.covers.us;
  const useLogo = game.logo && !logoFailed;

  return (
    <div
      className={`
        relative bg-[var(--color-surface)] rounded-lg overflow-hidden
        border-2 transition-all duration-200 cursor-grab
        ${selected
          ? 'border-[var(--color-gold)] shadow-[0_0_20px_var(--color-gold)]'
          : 'border-[var(--color-surface-light)] hover:border-[var(--color-gold-dark)]'
        }
      `}
      style={{ width: 'auto', maxWidth: 160 }}
    >
      {/* Top handles */}
      <Handle type="target" position={Position.Top} id="top" className="!w-2 !h-2 !bg-[var(--color-gold)] !border-[var(--color-surface)]" />
      <Handle type="source" position={Position.Top} id="top" className="!w-0 !h-0 !opacity-0" />

      {/* Left handles */}
      <Handle type="target" position={Position.Left} id="left" className="!w-2 !h-2 !bg-[var(--color-gold)] !border-[var(--color-surface)]" />
      <Handle type="source" position={Position.Left} id="left" className="!w-0 !h-0 !opacity-0" />

      {/* Game image: logo first, cover fallback */}
      {useLogo ? (
        <div className="w-32 h-24 flex items-center justify-center p-2 bg-[var(--color-surface)]">
          <img
            src={`/logos/${game.logo}`}
            alt={gameName}
            className="max-w-full max-h-full object-contain"
            onError={handleLogoError}
          />
        </div>
      ) : coverPath && !imageFailed ? (
        <img
          src={`/covers/${effectiveRegion}/${coverPath}`}
          alt={gameName}
          className="w-full h-auto block"
          style={{ minWidth: 100, maxWidth: 160 }}
          onError={handleCoverError}
        />
      ) : (
        <div className="w-32 h-24 bg-[var(--color-surface-light)] flex items-center justify-center">
          <span className="text-center p-2 text-xs text-[var(--color-text-muted)]">
            {gameName}
          </span>
        </div>
      )}

      {/* Game title overlay at bottom */}
      <div className="bg-[var(--color-surface)] px-2 py-1.5 border-t border-[var(--color-surface-light)]">
        <p className="text-xs font-medium text-[var(--color-text)] text-center line-clamp-2 leading-tight">
          {gameName}
        </p>
      </div>

      {/* Right handles */}
      <Handle type="source" position={Position.Right} id="right" className="!w-2 !h-2 !bg-[var(--color-gold)] !border-[var(--color-surface)]" />
      <Handle type="target" position={Position.Right} id="right" className="!w-0 !h-0 !opacity-0" />

      {/* Bottom handles */}
      <Handle type="source" position={Position.Bottom} id="bottom" className="!w-2 !h-2 !bg-[var(--color-gold)] !border-[var(--color-surface)]" />
      <Handle type="target" position={Position.Bottom} id="bottom" className="!w-0 !h-0 !opacity-0" />
    </div>
  );
}

export const GameNode = memo(GameNodeComponent);
