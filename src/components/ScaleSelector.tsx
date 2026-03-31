import type { NoteName } from '@/types';
import type { ScaleKind } from '@/utils/scaleTones';
import { ALL_KEYS } from '@/utils/constants';
import { getDisplayName } from '@/utils/musicTheory';
import { ALL_SCALE_KINDS, SCALE_DISPLAY_NAMES } from '@/utils/scaleTones';

interface ScaleSelectorProps {
  root: NoteName;
  scaleKind: ScaleKind;
  onRootChange: (root: NoteName) => void;
  onScaleKindChange: (kind: ScaleKind) => void;
}

const selectStyle: React.CSSProperties = {
  backgroundColor: 'var(--color-surface-raised)',
  color: 'var(--color-text)',
  border: '1px solid var(--color-border)',
  borderRadius: '8px',
  padding: '8px 12px',
  fontSize: '14px',
  fontFamily: 'Inter, sans-serif',
  cursor: 'pointer',
  outline: 'none',
};

export default function ScaleSelector({
  root,
  scaleKind,
  onRootChange,
  onScaleKindChange,
}: ScaleSelectorProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="flex items-center gap-2">
        <span
          className="text-sm font-medium"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Root
        </span>
        <select
          value={root}
          onChange={(e) => onRootChange(e.target.value as NoteName)}
          style={selectStyle}
        >
          {ALL_KEYS.map((key) => (
            <option key={key} value={key}>
              {getDisplayName(key)}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2">
        <span
          className="text-sm font-medium"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Scale
        </span>
        <select
          value={scaleKind}
          onChange={(e) => onScaleKindChange(e.target.value as ScaleKind)}
          style={selectStyle}
        >
          {ALL_SCALE_KINDS.map((kind) => (
            <option key={kind} value={kind}>
              {SCALE_DISPLAY_NAMES[kind]}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
