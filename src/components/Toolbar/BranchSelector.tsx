import { useTranslation } from 'react-i18next';
import { useTimelineStore } from '../../stores/timelineStore';
import type { BranchType } from '../../types/timeline';

const branches: { type: BranchType; color: string }[] = [
  { type: 'main', color: 'var(--color-branch-main)' },
  { type: 'child', color: 'var(--color-branch-child)' },
  { type: 'adult', color: 'var(--color-branch-adult)' },
  { type: 'fallen', color: 'var(--color-branch-fallen)' },
];

export function BranchSelector() {
  const { t } = useTranslation();
  const { selectedBranchType, setSelectedBranchType } = useTimelineStore();

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[var(--color-text-muted)]">Branch:</span>
      <div className="flex gap-1">
        {branches.map(({ type, color }) => (
          <button
            key={type}
            onClick={() => setSelectedBranchType(type)}
            title={t(`branch.${type}`)}
            className={`
              w-6 h-6 rounded-full border-2 transition-all
              ${selectedBranchType === type
                ? 'scale-110 shadow-lg'
                : 'opacity-60 hover:opacity-100'
              }
            `}
            style={{
              backgroundColor: color,
              borderColor: selectedBranchType === type ? 'white' : 'transparent',
              boxShadow: selectedBranchType === type ? `0 0 10px ${color}` : undefined,
            }}
          />
        ))}
      </div>
    </div>
  );
}
