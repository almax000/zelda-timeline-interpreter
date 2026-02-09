import LZString from 'lz-string';
import type { TimelineNode, TimelineEdge } from '../types/timeline';

const MAX_URL_LENGTH = 2000;

interface SharedTimeline {
  v: string;
  n: TimelineNode[];
  e: TimelineEdge[];
}

export function encodeTimeline(nodes: TimelineNode[], edges: TimelineEdge[]): string | null {
  const state: SharedTimeline = { v: '1', n: nodes, e: edges };
  const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(state));
  const url = `${window.location.origin}${window.location.pathname}#share=${compressed}`;
  if (url.length > MAX_URL_LENGTH) {
    return null;
  }
  return url;
}

export function decodeTimeline(hash: string): { nodes: TimelineNode[]; edges: TimelineEdge[] } | null {
  const prefix = '#share=';
  if (!hash.startsWith(prefix)) return null;
  const encoded = hash.slice(prefix.length);
  const json = LZString.decompressFromEncodedURIComponent(encoded);
  if (!json) return null;
  const state = JSON.parse(json) as SharedTimeline;
  if (!state.v || !Array.isArray(state.n) || !Array.isArray(state.e)) return null;
  return { nodes: state.n, edges: state.e };
}
