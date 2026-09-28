import type { ShapeInterval, ShapeQuality } from '@/types';
import { SHAPE_COLORS, SHAPE_INTERVALS, SHAPE_QUALITIES, intervalLabel } from '@/utils/intervalShape';
import type { Placement, Spelling } from '@/utils/intervalShape';

interface IntervalShapePanelProps {
  rootName: string;
  tones: Record<ShapeInterval, string>;
  quality: ShapeQuality;
  enabled: ShapeInterval[];
  placement: Placement;
  chordName: string | null;
  spelling: Spelling | null;
  sharpRoot?: string;
  flatRoot?: string;
  onQualityChange: (q: ShapeQuality) => void;
  onToggle: (i: ShapeInterval) => void;
  onSpellingChange: (s: Spelling) => void;
  onClear: () => void;
}

const QUALITY_LABELS: Record<ShapeQuality, string> = {
  major: 'Major',
  dominant: 'Dominant',
  minor: 'Minor',
};

const segmentStyle: React.CSSProperties = {
  fontSize: '13px',
  fontFamily: 'Inter, sans-serif',
  fontWeight: 600,
  padding: '6px 12px',
  cursor: 'pointer',
  border: 'none',
  outline: 'none',
  transition: 'background-color 0.15s, color 0.15s',
};

function Segmented<T extends string>({
  options,
  value,
  label,
  render,
  onChange,
}: {
  options: T[];
  value: T | null;
  label: string;
  render: (o: T) => string;
  onChange: (o: T) => void;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex rounded-lg overflow-hidden"
      style={{
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface-raised)',
      }}
    >
      {options.map((o, idx) => {
        const active = o === value;
        return (
          <button
            key={o}
            onClick={() => onChange(o)}
            aria-pressed={active}
            style={{
              ...segmentStyle,
              backgroundColor: active ? 'var(--color-primary)' : 'transparent',
              color: active ? 'var(--diagram-dot-text)' : 'var(--color-text-muted)',
              borderRight: idx < options.length - 1 ? '1px solid var(--color-border)' : undefined,
            }}
          >
            {render(o)}
          </button>
        );
      })}
    </div>
  );
}

function Swatch({ color, dashed }: { color: string; dashed?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-3 w-3 rounded-full"
      style={dashed ? { border: `2px dashed ${color}` } : { backgroundColor: color }}
    />
  );
}

export default function IntervalShapePanel({
  rootName,
  tones,
  quality,
  enabled,
  placement,
  chordName,
  spelling,
  sharpRoot,
  flatRoot,
  onQualityChange,
  onToggle,
  onSpellingChange,
  onClear,
}: IntervalShapePanelProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
          Root{' '}
          <span className="text-base font-bold" style={{ color: 'var(--color-text)' }}>{rootName}</span>
        </span>
        {spelling && sharpRoot && flatRoot && (
          <Segmented<Spelling>
            options={['sharp', 'flat']}
            value={spelling}
            label="Root spelling"
            render={(s) => (s === 'sharp' ? sharpRoot : flatRoot)}
            onChange={onSpellingChange}
          />
        )}
        <Segmented<ShapeQuality>
          options={SHAPE_QUALITIES}
          value={quality}
          label="Chord quality"
          render={(q) => QUALITY_LABELS[q]}
          onChange={onQualityChange}
        />
        {chordName && (
          <span className="text-base font-bold" style={{ color: 'var(--color-primary)' }} aria-live="polite">
            {chordName}
          </span>
        )}
        <button
          onClick={onClear}
          className="ml-auto px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer"
          style={{
            backgroundColor: 'var(--color-surface-raised)',
            color: 'var(--color-text-muted)',
            border: '1px solid var(--color-border)',
          }}
        >
          Clear
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <span
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
          title="The root is always shown"
        >
          <Swatch color={SHAPE_COLORS.R} />
          R <span style={{ color: 'var(--color-text-muted)' }}>{rootName}</span>
        </span>
        {SHAPE_INTERVALS.map((i) => {
          const on = enabled.includes(i);
          const unplaced = on && !placement[i];
          const label = intervalLabel(i, quality);
          return (
            <button
              key={i}
              onClick={() => onToggle(i)}
              aria-pressed={on}
              title={unplaced ? 'No spot in reach — tap a ring on the neck' : on ? `Hide the ${label}` : `Show the ${label}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-opacity"
              style={{
                border: unplaced
                  ? `1px dashed ${SHAPE_COLORS[i]}`
                  : `1px solid ${on ? SHAPE_COLORS[i] : 'var(--color-border)'}`,
                backgroundColor: on ? 'var(--color-surface-raised)' : 'transparent',
                color: 'var(--color-text)',
                opacity: on ? 1 : 0.5,
              }}
            >
              <Swatch color={SHAPE_COLORS[i]} dashed={!on || unplaced} />
              {label} <span style={{ color: 'var(--color-text-muted)' }}>{tones[i]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
