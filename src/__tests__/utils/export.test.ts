import { describe, it, expect, vi, beforeEach } from 'vitest';
import { importFromJson, exportToJson } from '../../utils/export';
import type { TimelineNode, TimelineEdge } from '../../types/timeline';

describe('importFromJson', () => {
  it('parses a valid timeline JSON file', async () => {
    const data = {
      version: '1.0.0',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      state: {
        nodes: [
          { id: 'game-1', type: 'game', position: { x: 0, y: 0 }, data: { gameId: 'oot' } },
        ],
        edges: [
          { id: 'e-1', source: 'game-1', target: 'game-2', type: 'timeline', data: { branchType: 'main' } },
        ],
      },
    };
    const file = new File([JSON.stringify(data)], 'test.json', { type: 'application/json' });
    const result = await importFromJson(file);
    expect(result.nodes).toHaveLength(1);
    expect(result.edges).toHaveLength(1);
    expect(result.nodes[0].data.gameId).toBe('oot');
  });

  it('throws on invalid format (missing state)', async () => {
    const file = new File([JSON.stringify({ version: '1.0.0' })], 'bad.json');
    await expect(importFromJson(file)).rejects.toThrow('Invalid timeline format');
  });

  it('throws on invalid JSON', async () => {
    const file = new File(['not json'], 'bad.json');
    await expect(importFromJson(file)).rejects.toThrow();
  });

  it('throws when state.nodes is not an array', async () => {
    const data = {
      version: '1.0.0',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      state: { nodes: 'not-array', edges: [] },
    };
    const file = new File([JSON.stringify(data)], 'bad.json');
    await expect(importFromJson(file)).rejects.toThrow('Invalid timeline format');
  });
});

describe('exportToJson', () => {
  let clickedDownload: string | null;

  beforeEach(() => {
    clickedDownload = null;

    // Mock URL.createObjectURL/revokeObjectURL
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:mock-url'),
      revokeObjectURL: vi.fn(),
    });

    // Mock createElement to capture the download link
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = originalCreateElement(tag);
      if (tag === 'a') {
        Object.defineProperty(el, 'click', {
          value: () => {
            clickedDownload = (el as HTMLAnchorElement).download;
          },
        });
      }
      return el;
    });
  });

  it('creates a JSON file download', () => {
    const nodes: TimelineNode[] = [
      { id: 'g1', type: 'game', position: { x: 0, y: 0 }, data: { gameId: 'oot' } },
    ];
    const edges: TimelineEdge[] = [];
    exportToJson(nodes, edges);
    expect(clickedDownload).toMatch(/^zelda-timeline-\d+\.json$/);
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalled();
  });
});
