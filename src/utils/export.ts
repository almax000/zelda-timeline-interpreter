import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { getNodesBounds, getViewportForBounds } from '@xyflow/react';
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

async function renderContentToPng(
  nodes: TimelineNode[],
  pixelRatio = 2,
): Promise<{ dataUrl: string; width: number; height: number }> {
  const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;
  if (!viewport) throw new Error('Canvas not found');
  if (nodes.length === 0) throw new Error('No content to export');

  const bounds = getNodesBounds(nodes);

  // Content dimensions with padding
  const imgWidth = bounds.width + EXPORT_PADDING * 2;
  const imgHeight = bounds.height + EXPORT_PADDING * 2;

  const vp = getViewportForBounds(bounds, imgWidth, imgHeight, MIN_ZOOM, MAX_ZOOM, 0);

  const dataUrl = await toPng(viewport, {
    backgroundColor: EXPORT_BG,
    width: imgWidth,
    height: imgHeight,
    pixelRatio,
    style: {
      width: `${imgWidth}px`,
      height: `${imgHeight}px`,
      transform: `translate(${vp.x + EXPORT_PADDING}px, ${vp.y + EXPORT_PADDING}px) scale(${vp.zoom})`,
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
