import { useEffect } from 'react';
import { getCanvasStore } from '../stores/canvasRegistry';
import { useTabStore } from '../stores/tabStore';
import { useUIStore, type ActiveTool } from '../stores/uiStore';
import { useAnnotationStore } from '../stores/annotationStore';
import { useSettingsStore } from '../stores/settingsStore';
import { isInputFocused } from '../utils/dom';
import { incrementCounter } from '../tips/interactionCounters';
import { GRID_SIZE } from '../utils/snapGuides';
import type { TimelineNode, TimelineEdge } from '../types/timeline';

let clipboard: {
  nodes: TimelineNode[];
  edges: TimelineEdge[];
} | null = null;

const TOOL_KEYS: Record<string, ActiveTool> = {
  v: 'select',
  d: 'annotate',
  b: 'split',
  t: 'text',
  p: 'pen',
  e: 'eraser',
  l: 'laser',
};

const ANNOTATION_TOOLS = new Set<ActiveTool>(['pen', 'eraser', 'laser']);

export function useKeyboardShortcuts() {
  const activeTabId = useTabStore((state) => state.activeTabId);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Modifier shortcuts (Cmd+Z etc.)
      if (e.metaKey || e.ctrlKey) {
        // Let native shortcuts work in text inputs — only override Cmd+D/C/V on canvas
        if (e.key !== 'd' && e.key !== 'c' && e.key !== 'v' && isInputFocused()) return;

        if (e.key === 'z') {
          e.preventDefault();
          const store = getCanvasStore(activeTabId);
          const { undo, redo } = store.temporal.getState();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
          return;
        }
        if (e.key === 'y') {
          e.preventDefault();
          const store = getCanvasStore(activeTabId);
          const { redo } = store.temporal.getState();
          redo();
          return;
        }
        if (e.key === 'd') {
          e.preventDefault();
          const tab = useTabStore.getState().tabs.find((t) => t.id === activeTabId);
          if (tab?.isLocked) return;
          const store = getCanvasStore(activeTabId);
          store.getState().duplicateSelected();
          return;
        }
        if (e.key === 'a') {
          e.preventDefault();
          const tab = useTabStore.getState().tabs.find((t) => t.id === activeTabId);
          if (tab?.isLocked) return;
          const store = getCanvasStore(activeTabId);
          const { nodes, edges, setNodes, setEdges } = store.getState();
          setNodes(nodes.map((n) => ({ ...n, selected: true })));
          setEdges(edges.map((edge) => ({ ...edge, selected: true })));
          return;
        }
        if (e.key === 'c') {
          const store = getCanvasStore(activeTabId);
          const { nodes, edges } = store.getState();
          const selected = nodes.filter((n) => n.selected);
          if (selected.length === 0) return;
          const selectedIds = new Set(selected.map((n) => n.id));
          const internalEdges = edges.filter(
            (edge) => selectedIds.has(edge.source) && selectedIds.has(edge.target)
          );
          clipboard = { nodes: selected, edges: internalEdges };
          return;
        }
        if (e.key === 'v') {
          e.preventDefault();
          if (!clipboard) return;
          const tab = useTabStore.getState().tabs.find((t) => t.id === activeTabId);
          if (tab?.isLocked) return;
          const store = getCanvasStore(activeTabId);
          const { nodes, edges, setNodes, setEdges } = store.getState();
          const OFFSET = 30;
          const ts = Date.now();
          const idMap = new Map<string, string>();
          const newNodes = clipboard.nodes.map((n, i) => {
            const newId = `${n.type}-paste-${ts}-${i}`;
            idMap.set(n.id, newId);
            return {
              ...n,
              id: newId,
              position: { x: n.position.x + OFFSET, y: n.position.y + OFFSET },
              selected: true,
            };
          });
          const newEdges = clipboard.edges.map((edge) => ({
            ...edge,
            id: `${idMap.get(edge.source)}-${idMap.get(edge.target)}`,
            source: idMap.get(edge.source)!,
            target: idMap.get(edge.target)!,
            selected: true,
          }));
          setNodes([
            ...nodes.map((n) => (n.selected ? { ...n, selected: false } : n)),
            ...newNodes,
          ] as TimelineNode[]);
          setEdges([
            ...edges.map((edge) => (edge.selected ? { ...edge, selected: false } : edge)),
            ...newEdges,
          ] as TimelineEdge[]);
          return;
        }
        return;
      }

      // Single-key shortcuts — skip when typing or editing text
      if (isInputFocused()) return;
      if (useUIStore.getState().editingTextNodeId) return;

      // Grid toggle — works even when locked (view setting)
      if (e.key.toLowerCase() === 'g') {
        e.preventDefault();
        const { snapToGrid, setSnapToGrid } = useSettingsStore.getState();
        setSnapToGrid(!snapToGrid);
        return;
      }

      // Skip when canvas is locked
      const tab = useTabStore.getState().tabs.find((t) => t.id === activeTabId);
      if (tab?.isLocked) return;

      const key = e.key.toLowerCase();

      // Escape → reset to select
      if (key === 'escape') {
        useUIStore.getState().resetTool();
        useAnnotationStore.getState().setAnnotationMode(false);
        return;
      }

      // Delete/Backspace — count for undoRedo tip
      if (key === 'backspace' || key === 'delete') {
        const store = getCanvasStore(activeTabId);
        if (store.getState().nodes.some((n) => n.selected)) {
          incrementCounter('nodesDeleted');
        }
        return;
      }

      const ARROW_KEYS: Record<string, { x: number; y: number }> = {
        arrowup: { x: 0, y: -1 },
        arrowdown: { x: 0, y: 1 },
        arrowleft: { x: -1, y: 0 },
        arrowright: { x: 1, y: 0 },
      };
      const arrow = ARROW_KEYS[key];
      if (arrow) {
        e.preventDefault();
        const store = getCanvasStore(activeTabId);
        const { nodes, setNodes } = store.getState();
        const selected = nodes.filter((n) => n.selected);
        if (selected.length === 0) return;
        const gridOn = useSettingsStore.getState().snapToGrid;
        const step = gridOn ? GRID_SIZE : e.shiftKey ? 10 : 1;
        setNodes(
          nodes.map((n) =>
            n.selected
              ? { ...n, position: { x: n.position.x + arrow.x * step, y: n.position.y + arrow.y * step } }
              : n
          )
        );
        return;
      }

      const tool = TOOL_KEYS[key];
      if (!tool) return;

      e.preventDefault();
      incrementCounter('toolSwitches');

      const { setActiveTool, resetTool } = useUIStore.getState();
      const { setAnnotationMode, setTool } = useAnnotationStore.getState();

      if (tool === 'select') {
        resetTool();
        setAnnotationMode(false);
      } else if (ANNOTATION_TOOLS.has(tool)) {
        setAnnotationMode(true);
        setTool(tool as 'pen' | 'eraser' | 'laser');
        setActiveTool(tool);
      } else {
        setActiveTool(tool);
        setAnnotationMode(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [activeTabId]);
}
