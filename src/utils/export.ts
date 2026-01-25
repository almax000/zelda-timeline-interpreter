import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import type { TimelineNode, TimelineEdge, SavedTimeline } from '../types/timeline';

const EXPORT_VERSION = '1.0.0';

export async function exportToPng(): Promise<void> {
  const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;
  if (!viewport) {
    throw new Error('Canvas not found');
  }

  const dataUrl = await toPng(viewport, {
    backgroundColor: '#030712',
    pixelRatio: 2,
    filter: (node) => {
      // Filter out controls and minimap
      if (node instanceof HTMLElement) {
        const className = node.className;
        if (typeof className === 'string') {
          if (className.includes('react-flow__controls')) return false;
          if (className.includes('react-flow__minimap')) return false;
        }
      }
      return true;
    },
  });

  const link = document.createElement('a');
  link.download = `zelda-timeline-${Date.now()}.png`;
  link.href = dataUrl;
  link.click();
}

export async function exportToPdf(): Promise<void> {
  const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;
  if (!viewport) {
    throw new Error('Canvas not found');
  }

  const dataUrl = await toPng(viewport, {
    backgroundColor: '#030712',
    pixelRatio: 2,
    filter: (node) => {
      if (node instanceof HTMLElement) {
        const className = node.className;
        if (typeof className === 'string') {
          if (className.includes('react-flow__controls')) return false;
          if (className.includes('react-flow__minimap')) return false;
        }
      }
      return true;
    },
  });

  const img = new Image();
  img.src = dataUrl;

  await new Promise((resolve) => {
    img.onload = resolve;
  });

  const pdf = new jsPDF({
    orientation: img.width > img.height ? 'landscape' : 'portrait',
    unit: 'px',
    format: [img.width / 2, img.height / 2],
  });

  pdf.addImage(dataUrl, 'PNG', 0, 0, img.width / 2, img.height / 2);
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
