import { memo, useState } from 'react';
import { type NodeProps, type Node } from '@xyflow/react';
import { useTranslation } from 'react-i18next';

interface GuideNodeData extends Record<string, unknown> {
  titleKey: string;
  contentKey: string;
  isCollapsed: boolean;
}

type GuideNodeType = Node<GuideNodeData, 'guide'>;

function GuideNodeComponent({ data }: NodeProps<GuideNodeType>) {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(data.isCollapsed);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const title = t(data.titleKey);
  const content = t(data.contentKey);

  return (
    <div
      className="bg-[var(--color-surface)]/80 backdrop-blur-sm border-2 border-dashed border-[var(--color-gold)]/30 rounded-xl shadow-lg overflow-hidden transition-all duration-200"
      style={{ width: collapsed ? 200 : 280 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[var(--color-gold)]/10">
        <span className="text-xs font-medium text-[var(--color-gold)] truncate">
          {title}
        </span>
        <div className="flex gap-1 shrink-0 ml-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-5 h-5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-gold)] rounded transition-colors flex items-center justify-center"
          >
            {collapsed ? '+' : '-'}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="w-5 h-5 text-xs text-[var(--color-text-muted)] hover:text-red-400 rounded transition-colors flex items-center justify-center"
          >
            x
          </button>
        </div>
      </div>

      {/* Content */}
      {!collapsed && (
        <div className="px-3 py-2">
          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed whitespace-pre-line">
            {content}
          </p>
        </div>
      )}
    </div>
  );
}

export const GuideNode = memo(GuideNodeComponent);
