import type { ScalePosition } from '@/utils/scalePositions';

interface PositionNavigatorProps {
  positions: ScalePosition[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

export default function PositionNavigator({
  positions,
  activeIndex,
  onSelect,
}: PositionNavigatorProps) {
  const canPrev = activeIndex > 0;
  const canNext = activeIndex < positions.length - 1;

  return (
    <div
      className="rounded-lg px-3 py-3 mb-5"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border-subtle)',
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className="text-xs font-medium"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Position
        </span>
        <span
          className="text-xs font-bold"
          style={{ color: 'var(--color-primary)' }}
        >
          {activeIndex + 1} of {positions.length}
        </span>
        <span
          className="text-xs"
          style={{ color: 'var(--color-text-muted)' }}
        >
          — Frets {positions[activeIndex]?.startFret}–{positions[activeIndex]?.endFret}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Previous button */}
        <button
          onClick={() => canPrev && onSelect(activeIndex - 1)}
          disabled={!canPrev}
          aria-label="Previous position"
          className="flex items-center justify-center rounded-md transition-colors cursor-pointer"
          style={{
            width: '32px',
            height: '32px',
            backgroundColor: canPrev
              ? 'var(--color-surface-raised)'
              : 'transparent',
            color: canPrev
              ? 'var(--color-text)'
              : 'var(--color-text-muted)',
            border: canPrev
              ? '1px solid var(--color-border)'
              : '1px solid transparent',
            opacity: canPrev ? 1 : 0.3,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 2L4 7l5 5" />
          </svg>
        </button>

        {/* Position boxes */}
        <div
          className="flex gap-1.5 overflow-x-auto scrollbar-none flex-1"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {positions.map((pos, i) => {
            const isActive = i === activeIndex;
            return (
              <button
                key={i}
                onClick={() => onSelect(i)}
                className="flex flex-col items-center rounded-lg px-3 py-1.5 transition-all cursor-pointer flex-shrink-0"
                style={{
                  minWidth: '52px',
                  backgroundColor: isActive
                    ? 'var(--color-primary)'
                    : 'var(--color-surface-raised)',
                  color: isActive
                    ? 'var(--diagram-dot-text)'
                    : 'var(--color-text)',
                  border: isActive
                    ? '2px solid var(--color-primary)'
                    : '1px solid var(--color-border)',
                  transform: isActive ? 'scale(1.05)' : 'scale(1)',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                <span
                  className="text-xs font-bold leading-tight"
                >
                  {i + 1}
                </span>
                <span
                  className="text-[10px] font-medium leading-tight"
                  style={{
                    opacity: isActive ? 0.85 : 0.6,
                  }}
                >
                  {pos.startDegree === 'R' ? 'Root' : pos.degreeLabel}
                </span>
                <span
                  className="text-[9px] leading-tight"
                  style={{
                    opacity: isActive ? 0.7 : 0.45,
                  }}
                >
                  {pos.startFret}–{pos.endFret}
                </span>
              </button>
            );
          })}
        </div>

        {/* Next button */}
        <button
          onClick={() => canNext && onSelect(activeIndex + 1)}
          disabled={!canNext}
          aria-label="Next position"
          className="flex items-center justify-center rounded-md transition-colors cursor-pointer"
          style={{
            width: '32px',
            height: '32px',
            backgroundColor: canNext
              ? 'var(--color-surface-raised)'
              : 'transparent',
            color: canNext
              ? 'var(--color-text)'
              : 'var(--color-text-muted)',
            border: canNext
              ? '1px solid var(--color-border)'
              : '1px solid transparent',
            opacity: canNext ? 1 : 0.3,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 2l5 5-5 5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
