import type { TimelineNode } from '../types/timeline';

export const SCREEN_SNAP_THRESHOLD = 5;

export interface SnapLine {
  position: number;
  orientation: 'H' | 'V';
  from: number;
  to: number;
}

export const EMPTY_GUIDES: SnapLine[] = [];

function mergeGuides(guides: SnapLine[]): SnapLine[] {
  const map = new Map<string, SnapLine>();
  for (const g of guides) {
    const key = `${g.orientation}:${g.position}`;
    const existing = map.get(key);
    if (existing) {
      existing.from = Math.min(existing.from, g.from);
      existing.to = Math.max(existing.to, g.to);
    } else {
      map.set(key, { ...g });
    }
  }
  return Array.from(map.values());
}

export function computeSnap(
  pos: { x: number; y: number },
  w: number,
  h: number,
  dragId: string,
  allNodes: TimelineNode[],
  threshold: number,
): { position: { x: number; y: number }; guides: SnapLine[] } {
  const dragX = [pos.x, pos.x + w / 2, pos.x + w];
  const dragY = [pos.y, pos.y + h / 2, pos.y + h];

  let bestXOffset = 0, bestYOffset = 0;
  let minDx = threshold + 1, minDy = threshold + 1;

  for (const n of allNodes) {
    if (n.id === dragId || n.selected) continue;
    const nw = n.measured?.width ?? 0, nh = n.measured?.height ?? 0;
    for (const dx of dragX)
      for (const ox of [n.position.x, n.position.x + nw / 2, n.position.x + nw]) {
        const diff = Math.abs(dx - ox);
        if (diff < minDx) { minDx = diff; bestXOffset = ox - dx; }
      }
    for (const dy of dragY)
      for (const oy of [n.position.y, n.position.y + nh / 2, n.position.y + nh]) {
        const diff = Math.abs(dy - oy);
        if (diff < minDy) { minDy = diff; bestYOffset = oy - dy; }
      }
  }

  const snapped = { x: pos.x, y: pos.y };
  if (minDx <= threshold) snapped.x += bestXOffset;
  if (minDy <= threshold) snapped.y += bestYOffset;

  const guides: SnapLine[] = [];
  const EXT = 8;
  const snappedXEdges = [snapped.x, snapped.x + w / 2, snapped.x + w];
  const snappedYEdges = [snapped.y, snapped.y + h / 2, snapped.y + h];

  for (const n of allNodes) {
    if (n.id === dragId || n.selected) continue;
    const nw = n.measured?.width ?? 0, nh = n.measured?.height ?? 0;

    for (const sx of snappedXEdges)
      for (const ox of [n.position.x, n.position.x + nw / 2, n.position.x + nw])
        if (Math.abs(sx - ox) < 0.5) {
          const top = Math.min(snapped.y, n.position.y) - EXT;
          const bottom = Math.max(snapped.y + h, n.position.y + nh) + EXT;
          guides.push({ position: ox, orientation: 'V', from: top, to: bottom });
        }

    for (const sy of snappedYEdges)
      for (const oy of [n.position.y, n.position.y + nh / 2, n.position.y + nh])
        if (Math.abs(sy - oy) < 0.5) {
          const left = Math.min(snapped.x, n.position.x) - EXT;
          const right = Math.max(snapped.x + w, n.position.x + nw) + EXT;
          guides.push({ position: oy, orientation: 'H', from: left, to: right });
        }
  }

  return { position: snapped, guides: mergeGuides(guides) };
}
