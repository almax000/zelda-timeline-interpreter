import { describe, it, expect, beforeEach } from 'vitest';
import { encodeTimeline, decodeTimeline } from '../../utils/sharing';
import type { TimelineNode, TimelineEdge } from '../../types/timeline';

const mockNodes: TimelineNode[] = [
  {
    id: 'game-1',
    type: 'game',
    position: { x: 100, y: 200 },
    data: { gameId: 'ocarina-of-time', label: 'OoT' },
  },
  {
    id: 'game-2',
    type: 'game',
    position: { x: 300, y: 200 },
    data: { gameId: 'majoras-mask', label: 'MM' },
  },
];

const mockEdges: TimelineEdge[] = [
  {
    id: 'e-1-2',
    source: 'game-1',
    target: 'game-2',
    type: 'timeline',
    data: { branchType: 'child' },
  },
];

describe('sharing', () => {
  beforeEach(() => {
    // Mock window.location for encodeTimeline
    Object.defineProperty(window, 'location', {
      value: { origin: 'https://example.com', pathname: '/' },
      writable: true,
    });
  });

  describe('encodeTimeline', () => {
    it('returns a URL string with #share= prefix', () => {
      const url = encodeTimeline(mockNodes, mockEdges);
      expect(url).toBeTruthy();
      expect(url).toContain('https://example.com/#share=');
    });

    it('returns null when encoded data exceeds MAX_URL_LENGTH', () => {
      // Create many nodes with varied data to exceed the 8000 char limit
      // LZ-string compresses repetitive data well, so use random-ish unique values
      const largeNodes: TimelineNode[] = Array.from({ length: 500 }, (_, i) => ({
        id: `game-${i}-${Math.random().toString(36).slice(2)}`,
        type: 'game' as const,
        position: { x: i * 100 + Math.random() * 50, y: 200 + Math.random() * 50 },
        data: {
          gameId: `game-${i}-${Math.random().toString(36).slice(2)}`,
          label: `Game ${i} - ${Math.random().toString(36).slice(2, 20)}`,
        },
      }));
      const result = encodeTimeline(largeNodes, []);
      expect(result).toBeNull();
    });

    it('encodes empty arrays', () => {
      const url = encodeTimeline([], []);
      expect(url).toBeTruthy();
      expect(url).toContain('#share=');
    });
  });

  describe('decodeTimeline', () => {
    it('roundtrips encode/decode correctly', () => {
      const url = encodeTimeline(mockNodes, mockEdges);
      expect(url).toBeTruthy();
      const hash = '#share=' + url!.split('#share=')[1];
      const result = decodeTimeline(hash);
      expect(result).not.toBeNull();
      expect(result!.nodes).toHaveLength(2);
      expect(result!.edges).toHaveLength(1);
      expect(result!.nodes[0].data.gameId).toBe('ocarina-of-time');
      expect(result!.edges[0].data!.branchType).toBe('child');
    });

    it('returns null for missing #share= prefix', () => {
      expect(decodeTimeline('#other=abc')).toBeNull();
      expect(decodeTimeline('no-prefix')).toBeNull();
      expect(decodeTimeline('')).toBeNull();
    });

    it('returns null for invalid compressed data', () => {
      expect(decodeTimeline('#share=not-valid-lz-data!!!')).toBeNull();
    });

    it('returns null for invalid JSON structure', async () => {
      const LZStringModule = await import('lz-string');
      const compressed = LZStringModule.compressToEncodedURIComponent(
        JSON.stringify({ invalid: true })
      );
      expect(decodeTimeline(`#share=${compressed}`)).toBeNull();
    });
  });
});
