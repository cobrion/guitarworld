import type { NoteName, ChordQuality } from '@/types';
import { ALL_KEYS } from '@/utils/constants';
import { getDisplayName } from '@/utils/musicTheory';
import { QUALITY_GROUPS, getQualityDisplayName } from '@/utils/chordTones';

interface ChordSelectorProps {
  root: NoteName;
  quality: ChordQuality;
  onRootChange: (root: NoteName) => void;
  onQualityChange: (quality: ChordQuality) => void;
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

export default function ChordSelector({
  root,
  quality,
  onRootChange,
  onQualityChange,
}: ChordSelectorProps) {
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
          Quality
        </span>
        <select
          value={quality}
          onChange={(e) => onQualityChange(e.target.value as ChordQuality)}
          style={selectStyle}
        >
          {QUALITY_GROUPS.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.qualities.map((q) => (
                <option key={q} value={q}>
                  {getQualityDisplayName(q)}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>
    </div>
  );
}
