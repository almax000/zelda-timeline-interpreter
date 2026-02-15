import { useAnnotationStore } from '../../stores/annotationStore';
import { useUIStore } from '../../stores/uiStore';
import { useTabStore } from '../../stores/tabStore';
import { getCanvasStore } from '../../stores/canvasRegistry';

const PEN_COLORS = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#A855F7', '#EC4899', '#F8FAFC'];
const WIDTHS = [2, 4, 6, 8];
const FONT_SIZES = [12, 14, 16, 20, 24, 32, 48];
const TEXT_COLORS = [
  'var(--color-text)',
  '#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#A855F7', '#F8FAFC',
];

// Prevent focus steal from textarea
const preventBlur = (e: React.MouseEvent) => e.preventDefault();

function PenIcon({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

function IconClearStrokes() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  );
}

function AlignIcon({ align }: { align: 'left' | 'center' | 'right' }) {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="1" y1="3" x2="15" y2="3" />
      <line x1={align === 'right' ? '5' : '1'} y1="7" x2={align === 'left' ? '11' : '15'} y2="7" />
      <line x1="1" y1="11" x2="15" y2="11" />
      {align === 'center' && <line x1="3" y1="7" x2="13" y2="7" />}
    </svg>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-[var(--color-surface-light)] mx-0.5" />;
}

const btn = 'w-[30px] h-[30px] flex items-center justify-center rounded-md transition-colors';

function PenSubToolbar() {
  const { color, strokeWidth, tool, isAnnotationMode, setColor, setStrokeWidth, setTool, setAnnotationMode, clearStrokes } = useAnnotationStore();
  const setActiveTool = useUIStore((s) => s.setActiveTool);
  const resetTool = useUIStore((s) => s.resetTool);
  const activeTabId = useTabStore((s) => s.activeTabId);
  const hasStrokes = useAnnotationStore((s) => (s.strokes.get(activeTabId)?.length ?? 0) > 0);

  const handlePenClick = (penColor: string) => {
    if (isAnnotationMode && tool === 'pen' && color === penColor) {
      setAnnotationMode(false);
      resetTool();
    } else {
      setAnnotationMode(true);
      setTool('pen');
      setColor(penColor);
      setActiveTool('pen');
    }
  };

  return (
    <div className="flex items-center gap-1" data-subtoolbar>
      {/* 8 color buttons in a row */}
      <div className="flex gap-0.5">
        {PEN_COLORS.map((c) => (
          <button
            key={c}
            onMouseDown={preventBlur}
            onClick={() => handlePenClick(c)}
            className={`${btn} relative hover:bg-[var(--color-surface-light)]`}
            title="Pen"
          >
            <PenIcon color={c} />
            {isAnnotationMode && tool === 'pen' && color === c && (
              <span className="absolute bottom-0.5 left-1.5 right-1.5 h-0.5 rounded-full" style={{ backgroundColor: c }} />
            )}
          </button>
        ))}
      </div>

      <Divider />

      {/* Width selector */}
      <div className="flex gap-0.5">
        {WIDTHS.map((w) => (
          <button
            key={w}
            onMouseDown={preventBlur}
            onClick={() => setStrokeWidth(w)}
            className={`${btn} ${strokeWidth === w ? 'bg-[var(--color-surface-light)]' : 'hover:bg-[var(--color-surface-light)]'}`}
            title={`${w}px`}
          >
            <span className="rounded-full bg-[var(--color-text)]/60" style={{ width: w + 2, height: w + 2 }} />
          </button>
        ))}
      </div>

      {/* Clear strokes */}
      {hasStrokes && (
        <>
          <Divider />
          <button
            onMouseDown={preventBlur}
            onClick={() => clearStrokes(activeTabId)}
            className={`${btn} text-red-400 hover:bg-[var(--color-surface-light)]`}
            title="Clear strokes"
          >
            <IconClearStrokes />
          </button>
        </>
      )}
    </div>
  );
}

function TextSubToolbar() {
  const editingId = useUIStore((s) => s.editingTextNodeId);
  const activeTabId = useTabStore((s) => s.activeTabId);

  const store = getCanvasStore(activeTabId);
  const node = store((s) => s.nodes.find((n) => n.id === editingId));

  if (!node || !editingId) return null;

  const data = node.data as Record<string, unknown>;
  const fontSize = (data.fontSize as number) ?? 16;
  const fontWeight = (data.fontWeight as string) ?? 'normal';
  const fontStyle = (data.fontStyle as string) ?? 'normal';
  const textAlign = (data.textAlign as string) ?? 'left';
  const textColor = (data.textColor as string) ?? 'var(--color-text)';

  const update = (key: string, value: unknown) => {
    store.getState().updateNodeData(editingId, { [key]: value });
  };

  const btnSmall = 'w-7 h-7 flex items-center justify-center rounded transition-colors text-xs';
  const btnSmallBase = `${btnSmall} text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-light)]`;

  return (
    <div className="flex items-center gap-0.5" data-subtoolbar>
      {/* Font size */}
      <select
        value={fontSize}
        onMouseDown={preventBlur}
        onChange={(e) => update('fontSize', Number(e.target.value))}
        className="bg-[var(--color-surface)] text-[var(--color-text)] text-xs rounded px-1 py-1 border border-[var(--color-surface-light)] outline-none cursor-pointer"
      >
        {FONT_SIZES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <Divider />

      {/* Bold */}
      <button
        onMouseDown={preventBlur}
        onClick={() => update('fontWeight', fontWeight === 'bold' ? 'normal' : 'bold')}
        className={`${btnSmall} font-bold ${fontWeight === 'bold' ? 'bg-[var(--color-gold)]/15 text-[var(--color-gold)]' : btnSmallBase}`}
      >
        B
      </button>

      {/* Italic */}
      <button
        onMouseDown={preventBlur}
        onClick={() => update('fontStyle', fontStyle === 'italic' ? 'normal' : 'italic')}
        className={`${btnSmall} italic ${fontStyle === 'italic' ? 'bg-[var(--color-gold)]/15 text-[var(--color-gold)]' : btnSmallBase}`}
      >
        I
      </button>

      <Divider />

      {/* Alignment */}
      {(['left', 'center', 'right'] as const).map((align) => (
        <button
          key={align}
          onMouseDown={preventBlur}
          onClick={() => update('textAlign', align)}
          className={`${btnSmall} ${textAlign === align ? 'bg-[var(--color-gold)]/15 text-[var(--color-gold)]' : btnSmallBase}`}
        >
          <AlignIcon align={align} />
        </button>
      ))}

      <Divider />

      {/* Text color */}
      <div className="flex gap-0.5">
        {TEXT_COLORS.map((c) => (
          <button
            key={c}
            onMouseDown={preventBlur}
            onClick={() => update('textColor', c)}
            className="w-5 h-5 rounded-full border transition-all"
            style={{
              backgroundColor: c,
              borderColor: textColor === c ? 'var(--color-gold)' : 'transparent',
              boxShadow: textColor === c ? '0 0 4px var(--color-gold)' : 'none',
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function SubToolbar() {
  const activeTool = useUIStore((s) => s.activeTool);
  const editingTextNodeId = useUIStore((s) => s.editingTextNodeId);

  const showPen = activeTool === 'pen';
  const showText = editingTextNodeId !== null;

  if (!showPen && !showText) return null;

  return (
    <div className="pointer-events-auto flex items-center gap-0.5 px-2 py-1.5 bg-[var(--color-surface)]/90 backdrop-blur-sm rounded-xl shadow-xl border border-[var(--color-surface-light)]">
      {showText ? <TextSubToolbar /> : <PenSubToolbar />}
    </div>
  );
}
