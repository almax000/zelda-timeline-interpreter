import { memo, useState, useRef, useEffect, useCallback } from 'react';
import { type NodeProps, type Node, NodeResizeControl } from '@xyflow/react';
import { getCanvasStore } from '../../stores/canvasRegistry';
import { useTabStore } from '../../stores/tabStore';
import { useUIStore } from '../../stores/uiStore';
import type { TextNodeData } from '../../types/timeline';

type TextNodeType = Node<TextNodeData, 'textLabel'>;

function TextNodeComponent({ id, data, selected }: NodeProps<TextNodeType>) {
  const [isEditing, setIsEditing] = useState(false);
  const [localText, setLocalText] = useState(data.text);
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
    setLocalText(data.text);
    setIsEditing(true);
    setEditingTextNodeId(id);
  }, [data.text, id, setEditingTextNodeId]);

  const exitEdit = useCallback(() => {
    // Flush any pending text
    if (flushTimerRef.current) {
      clearTimeout(flushTimerRef.current);
      flushTimerRef.current = null;
    }
    flushToStore(localText);
    setIsEditing(false);
    setEditingTextNodeId(null);
  }, [localText, flushToStore, setEditingTextNodeId]);

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

  return (
    <div
      style={{ width: data.width, minHeight: 24 }}
      onDoubleClick={enterEdit}
      className="relative group"
    >
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
          onBlur={exitEdit}
          onKeyDown={handleKeyDown}
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
          {data.text || (
            <span className="text-[var(--color-text-muted)] opacity-50">Text</span>
          )}
        </div>
      )}
    </div>
  );
}

export const TextNode = memo(TextNodeComponent);
