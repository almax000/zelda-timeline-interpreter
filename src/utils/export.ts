import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { getViewportForBounds } from '@xyflow/react';
import type { TimelineNode, TimelineEdge, SavedTimeline } from '../types/timeline';
import { EXPORT_VERSION } from '../constants';
const EXPORT_PADDING = 48;
const EXPORT_BG = '#030712';
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 2;

function getExportFilter() {
  return (node: HTMLElement) => {
    if (node instanceof HTMLElement) {
      const cls = node.className;
      if (typeof cls === 'string') {
        if (cls.includes('react-flow__controls')) return false;
        if (cls.includes('react-flow__minimap')) return false;
        if (cls.includes('react-flow__panel')) return false;
      }
    }
    return true;
  };
}

/**
 * Compute content bounds from actual DOM elements.
 * React Flow nodes rendered in the DOM have their positions set via CSS transform
 * and their actual dimensions measurable via offsetWidth/offsetHeight.
 * This avoids relying on node.measured which may be absent when the export
 * is triggered from outside the ReactFlowProvider context.
 */
function getContentBoundsFromDOM(): { x: number; y: number; width: number; height: number } {
  const nodeElements = document.querySelectorAll('.react-flow__node');
  if (nodeElements.length === 0) throw new Error('No nodes in DOM');

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  nodeElements.forEach((el) => {
    const htmlEl = el as HTMLElement;
    const transform = htmlEl.style.transform;
    // React Flow sets: translate(Xpx, Ypx)
    const match = transform.match(/translate\(([^,]+)px,\s*([^)]+)px\)/);
    if (!match) return;

    const x = parseFloat(match[1]);
    const y = parseFloat(match[2]);
    const w = htmlEl.offsetWidth;
    const h = htmlEl.offsetHeight;

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + w);
    maxY = Math.max(maxY, y + h);
  });

  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

async function renderContentToPng(
  nodes: TimelineNode[],
  pixelRatio = 2,
): Promise<{ dataUrl: string; width: number; height: number }> {
  const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;
  if (!viewport) throw new Error('Canvas not found');
  if (nodes.length === 0) throw new Error('No content to export');

  const raw = getContentBoundsFromDOM();

  // Expand bounds by padding so getViewportForBounds centers content
  // with uniform margins on all sides
  const paddedBounds = {
    x: raw.x - EXPORT_PADDING,
    y: raw.y - EXPORT_PADDING,
    width: raw.width + EXPORT_PADDING * 2,
    height: raw.height + EXPORT_PADDING * 2,
  };

  const imgWidth = paddedBounds.width;
  const imgHeight = paddedBounds.height;

  const vp = getViewportForBounds(paddedBounds, imgWidth, imgHeight, MIN_ZOOM, MAX_ZOOM, 0);

  const dataUrl = await toPng(viewport, {
    backgroundColor: EXPORT_BG,
    width: imgWidth,
    height: imgHeight,
    pixelRatio,
    style: {
      width: `${imgWidth}px`,
      height: `${imgHeight}px`,
      transform: `translate(${vp.x}px, ${vp.y}px) scale(${vp.zoom})`,
    },
    filter: getExportFilter(),
  });

  return { dataUrl, width: imgWidth * pixelRatio, height: imgHeight * pixelRatio };
}

export async function exportToPng(nodes: TimelineNode[]): Promise<void> {
  const { dataUrl } = await renderContentToPng(nodes);

  const link = document.createElement('a');
  link.download = `zelda-timeline-${Date.now()}.png`;
  link.href = dataUrl;
  link.click();
}

export async function exportToPdf(nodes: TimelineNode[]): Promise<void> {
  const { dataUrl, width, height } = await renderContentToPng(nodes);

  const pdfWidth = width / 2;
  const pdfHeight = height / 2;

  const pdf = new jsPDF({
    orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
    unit: 'px',
    format: [pdfWidth, pdfHeight],
  });

  pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
  pdf.save(`zelda-timeline-${Date.now()}.pdf`);
}

export function exportToJson(nodes: TimelineNode[], edges: TimelineEdge[]): void {
  const data: SavedTimeline = {
    version: EXPORT_VERSION,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    state: { nodes, edges },
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });

  const link = document.createElement('a');
  link.download = `zelda-timeline-${Date.now()}.json`;
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
}

export async function importFromJson(
  file: File
): Promise<{ nodes: TimelineNode[]; edges: TimelineEdge[] }> {
  const text = await file.text();
  const data = JSON.parse(text) as SavedTimeline;

  if (!data.state || !Array.isArray(data.state.nodes) || !Array.isArray(data.state.edges)) {
    throw new Error('Invalid timeline format');
  }

  return {
    nodes: data.state.nodes,
    edges: data.state.edges,
  };
}
