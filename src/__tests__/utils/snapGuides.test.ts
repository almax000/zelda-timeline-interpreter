import { describe, it, expect } from 'vitest';
import { computeSnap, SCREEN_SNAP_THRESHOLD } from '../../utils/snapGuides';
import type { TimelineNode } from '../../types/timeline';

function makeNode(id: string, x: number, y: number, w = 100, h = 60): TimelineNode {
  return {
    id,
    type: 'game',
    position: { x, y },
    data: { gameId: id },
    measured: { width: w, height: h },
  } as TimelineNode;
}

describe('computeSnap', () => {
  const threshold = SCREEN_SNAP_THRESHOLD;

  it('snaps to left edge of another node', () => {
    const target = makeNode('target', 200, 100);
    const result = computeSnap(
      { x: 197, y: 300 }, // 3px away from target's left edge (200)
      100, 60, 'drag', [target], threshold,
    );
    expect(result.position.x).toBe(200);
  });

  it('snaps to center of another node', () => {
    const target = makeNode('target', 200, 100, 100, 60);
    // Target center X = 200 + 50 = 250
    // Drag center X = x + w/2 = x + 50
    // So we need x + 50 ≈ 250, i.e. x ≈ 200
    const result = computeSnap(
      { x: 198, y: 300 }, 100, 60, 'drag', [target], threshold,
    );
    expect(result.position.x).toBe(200);
  });

  it('does not snap when beyond threshold', () => {
    const target = makeNode('target', 200, 100);
    const result = computeSnap(
      { x: 190, y: 300 }, // 10px away, beyond threshold of 5
      100, 60, 'drag', [target], threshold,
    );
    expect(result.position.x).toBe(190);
  });

  it('skips the dragged node itself', () => {
    const nodes = [
      makeNode('drag', 200, 100),
      makeNode('other', 500, 100),
    ];
    const result = computeSnap(
      { x: 197, y: 100 }, 100, 60, 'drag', nodes, threshold,
    );
    // Should NOT snap to node 'drag' (same id), and 'other' is too far
    expect(result.position.x).toBe(197);
  });

  it('skips selected nodes', () => {
    const selected = makeNode('sel', 200, 100);
    (selected as { selected?: boolean }).selected = true;
    const result = computeSnap(
      { x: 197, y: 300 }, 100, 60, 'drag', [selected], threshold,
    );
    expect(result.position.x).toBe(197);
  });

  it('generates vertical guide lines when snapped on X', () => {
    const target = makeNode('target', 200, 100, 100, 60);
    const result = computeSnap(
      { x: 198, y: 300 }, 100, 60, 'drag', [target], threshold,
    );
    expect(result.guides.length).toBeGreaterThan(0);
    expect(result.guides.some((g) => g.orientation === 'V')).toBe(true);
  });

  it('generates horizontal guide lines when snapped on Y', () => {
    const target = makeNode('target', 500, 100, 100, 60);
    const result = computeSnap(
      { x: 200, y: 98 }, 100, 60, 'drag', [target], threshold,
    );
    expect(result.guides.some((g) => g.orientation === 'H')).toBe(true);
  });

  it('returns empty guides when no snap occurs', () => {
    const target = makeNode('target', 500, 500);
    const result = computeSnap(
      { x: 100, y: 100 }, 100, 60, 'drag', [target], threshold,
    );
    expect(result.guides).toHaveLength(0);
  });

  it('merges guides with same orientation and position', () => {
    // Two nodes at the same X should produce merged vertical guides
    const nodes = [
      makeNode('a', 200, 100, 100, 60),
      makeNode('b', 200, 300, 100, 60),
    ];
    const result = computeSnap(
      { x: 198, y: 200 }, 100, 60, 'drag', nodes, threshold,
    );
    const vGuides = result.guides.filter((g) => g.orientation === 'V' && g.position === 200);
    expect(vGuides.length).toBe(1); // Merged into one
  });
});
