import { memo, useState, useEffect } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { useTranslation } from 'react-i18next';
import { getGameById } from '../../data/games';
import { useSettingsStore } from '../../stores/settingsStore';
import { getLogoLang } from '../../utils/logo';

interface GameNodeData extends Record<string, unknown> {
  gameId: string;
  label?: string;
}

type GameNodeType = Node<GameNodeData, 'game'>;

function GameNodeComponent({ data, selected }: NodeProps<GameNodeType>) {
  const { i18n } = useTranslation();
  const coverRegion = useSettingsStore((state) => state.coverRegion);
  const [logoFailed, setLogoFailed] = useState(false);
  const [logoLangFallback, setLogoLangFallback] = useState(false);
  const [fallbackToUs, setFallbackToUs] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const game = getGameById(data.gameId);
  if (!game) return null;

  const gameName = game.names[i18n.language as keyof typeof game.names] || game.names.en;
  const logoLang = logoLangFallback ? 'ja' : getLogoLang(i18n.language);

  useEffect(() => {
    setLogoFailed(false);
    setLogoLangFallback(false);
  }, [i18n.language]);

  const handleLogoError = () => {
    if (!logoLangFallback && logoLang !== 'ja') {
      setLogoLangFallback(true);
    } else {
      setLogoFailed(true);
    }
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
        relative flex flex-col items-center cursor-grab transition-all duration-200 overflow-visible
        ${selected ? 'drop-shadow-[0_0_12px_var(--color-gold)]' : ''}
      `}
      style={{ width: 140 }}
    >
      {/* Top handles */}
      <Handle type="target" position={Position.Top} id="top" className="!w-2 !h-2 !bg-[var(--color-gold)] !border-[var(--color-surface)]" />
      <Handle type="source" position={Position.Top} id="top" className="!w-0 !h-0 !opacity-0" />

      {/* Left handles */}
      <Handle type="target" position={Position.Left} id="left" className="!w-2 !h-2 !bg-[var(--color-gold)] !border-[var(--color-surface)]" />
      <Handle type="source" position={Position.Left} id="left" className="!w-0 !h-0 !opacity-0" />

      {/* Game image */}
      {useLogo ? (
        <img
          src={`/logos/${logoLang}/${game.logo}`}
          alt={gameName}
          className="w-full h-auto object-contain drop-shadow-lg"
          onError={handleLogoError}
        />
      ) : coverPath && !imageFailed ? (
        <img
          src={`/covers/${effectiveRegion}/${coverPath}`}
          alt={gameName}
          className="w-full h-auto object-contain rounded"
          onError={handleCoverError}
        />
      ) : (
        <span className="text-center p-2 text-xs text-[var(--color-text-muted)]">
          {gameName}
        </span>
      )}

      {/* Game title — absolute so it doesn't affect node height (handles stay at image center) */}
      <p className="absolute top-full mt-1 text-xs font-medium text-[var(--color-text)] text-center line-clamp-2 leading-tight w-full">
        {gameName}
      </p>

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
