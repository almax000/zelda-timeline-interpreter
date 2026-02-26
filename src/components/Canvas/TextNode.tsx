import { memo, useState, useRef, useEffect, useCallback } from 'react';
import { type NodeProps, type Node, NodeResizeControl, useViewport } from '@xyflow/react';
import { useTranslation } from 'react-i18next';
import { getCanvasStore } from '../../stores/canvasRegistry';
import { useTabStore } from '../../stores/tabStore';
import { useUIStore } from '../../stores/uiStore';
import { TextSubToolbar } from '../Toolbar/SubToolbar';
import type { TextNodeData } from '../../types/timeline';

type TextNodeType = Node<TextNodeData, 'textLabel'>;

function TextNodeComponent({ id, data, selected }: NodeProps<TextNodeType>) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [localText, setLocalText] = useState(data.text);
  const displayText = data.labelKey ? t(data.labelKey) : data.text;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeTabId = useTabStore((s) => s.activeTabId);
  const setEditingTextNodeId = useUIStore((s) => s.setEditingTextNodeId);

  const flushToStore = useCallback((text: string) => {
    const store = getCanvasStore(activeTabId);
    store.getState().updateNodeData(id, { text });
  }, [id, activeTabId]);

  const textStyles: React.CSSProperties = {
    fontSize: data.fontSize,
    fontWeight: data.fontWeight,
    fontStyle: data.fontStyle,
    textAlign: data.textAlign,
    color: data.textColor,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    lineHeight: 1.4,
  };

  const enterEdit = useCallback(() => {
    if (data.labelKey) return;
    setLocalText(data.text);
    setIsEditing(true);
    setEditingTextNodeId(id);
  }, [data.text, data.labelKey, id, setEditingTextNodeId]);

  const exitEdit = useCallback(() => {
    if (flushTimerRef.current) {
      clearTimeout(flushTimerRef.current);
      flushTimerRef.current = null;
    }
    flushToStore(localText);
    setIsEditing(false);
    setEditingTextNodeId(null);
  }, [localText, flushToStore, setEditingTextNodeId]);

  const handleBlur = useCallback((e: React.FocusEvent) => {
    const related = e.relatedTarget as HTMLElement | null;
    if (related?.closest('[data-subtoolbar]')) return;
    exitEdit();
  }, [exitEdit]);

  // Show subtoolbar on select, hide on deselect
  useEffect(() => {
    if (selected) {
      setEditingTextNodeId(id);
    } else if (useUIStore.getState().editingTextNodeId === id) {
      setEditingTextNodeId(null);
    }
  }, [selected, id, setEditingTextNodeId]);

  // Sync localText when data.text changes externally (e.g. undo)
  useEffect(() => {
    if (!isEditing) {
      setLocalText(data.text);
    }
  }, [data.text, isEditing]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, [isEditing]);

  // Auto-resize textarea
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [isEditing, localText]);

  // Cleanup flush timer on unmount
  useEffect(() => {
    return () => {
      if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
    };
  }, []);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setLocalText(value);
    if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
    flushTimerRef.current = setTimeout(() => flushToStore(value), 300);
  }, [flushToStore]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { exitEdit(); return; }
    // Allow Cmd+Z / Cmd+Y to bubble for undo/redo
    if ((e.metaKey || e.ctrlKey) && (e.key === 'z' || e.key === 'y')) return;
    e.stopPropagation();
  }, [exitEdit]);

  const handleResize = useCallback((_event: unknown, params: { width: number }) => {
    const store = getCanvasStore(activeTabId);
    store.getState().updateNodeData(id, { width: params.width });
  }, [id, activeTabId]);

  const { zoom } = useViewport();

  return (
    <div
      style={{ width: data.width, minHeight: 24 }}
      onDoubleClick={enterEdit}
      className="relative group"
    >
      {/* Floating text toolbar above node */}
      {selected && (
        <div
          className="absolute left-1/2 nodrag nowheel"
          style={{
            bottom: '100%',
            transform: `translateX(-50%) scale(${1 / zoom})`,
            transformOrigin: 'bottom center',
            marginBottom: 8 / zoom,
          }}
        >
          <div className="flex items-center gap-0.5 px-2 py-1.5 bg-[var(--color-surface)]/90 backdrop-blur-sm rounded-xl shadow-xl border border-[var(--color-surface-light)]">
            <TextSubToolbar />
          </div>
        </div>
      )}

      {/* Horizontal resize controls */}
      <NodeResizeControl
        position="right"
        style={{ background: 'transparent', border: 'none' }}
        minWidth={80}
        onResize={handleResize}
      >
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full bg-[var(--color-gold)] opacity-0 group-hover:opacity-60 transition-opacity" />
      </NodeResizeControl>
      <NodeResizeControl
        position="left"
        style={{ background: 'transparent', border: 'none' }}
        minWidth={80}
        onResize={handleResize}
      >
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full bg-[var(--color-gold)] opacity-0 group-hover:opacity-60 transition-opacity" />
      </NodeResizeControl>

      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={localText}
          onChange={handleTextChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onPointerDownCapture={(e) => e.stopPropagation()}
          className="nodrag nowheel w-full bg-transparent outline-none resize-none border border-[var(--color-gold)]/40 rounded px-1"
          style={textStyles}
          rows={1}
        />
      ) : (
        <div
          style={textStyles}
          className={`px-1 min-h-[1.4em] rounded transition-shadow ${
            selected ? 'ring-1 ring-[var(--color-gold)]/50' : ''
          }`}
        >
          {displayText || (
            <span className="text-[var(--color-text-muted)] opacity-50">Text</span>
          )}
        </div>
      )}
    </div>
  );
}

export const TextNode = memo(TextNodeComponent);
