export type CoverRegion = 'us' | 'jp' | 'cn';

export interface Game {
  id: string;
  releaseYear: number;
  isMainline: boolean;
  isCanon?: boolean; // For spin-offs that are officially canon
  covers: {
    us?: string;
    jp?: string;
    cn?: string;
  };
  names: {
    en: string;
    ja: string;
    'zh-CN': string;
    'zh-TW': string;
  };
}

export interface GameNode {
  gameId: string;
  position: { x: number; y: number };
}
