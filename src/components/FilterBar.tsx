import { useChord } from '@/context/ChordContext';
import type { ChordTypeFilter, SortOption, ScaleType } from '@/types';

const FILTER_CHIPS: { label: string; value: ChordTypeFilter }[] = [
  { label: 'Triads', value: 'triad' },
  { label: '7ths', value: 'seventh' },
  { label: 'Sus', value: 'sus' },
  { label: 'Extended', value: 'extended' },
  { label: 'Power', value: 'power' },
];

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Scale Degree', value: 'scale-degree' },
  { label: 'Name', value: 'name' },
  { label: 'Difficulty', value: 'difficulty' },
];

const CHIP_COLORS: Record<ChordTypeFilter, string> = {
  triad: 'var(--chord-major-border)',
  seventh: 'var(--chord-7th-border)',
  sus: 'var(--chord-sus-border)',
  extended: 'var(--color-accent)',
  power: 'var(--color-secondary)',
};

export default function FilterBar() {
  const { state, dispatch } = useChord();
  const noFilters = state.activeFilters.length === 0;

  return (
    <div className="px-4 py-3 sm:px-6 space-y-3">
      {/* Scale type toggle */}
      <div className="flex items-center gap-2">
        {(['major', 'minor'] as ScaleType[]).map((st) => (
          <button
            key={st}
            onClick={() => dispatch({ type: 'SET_SCALE_TYPE', payload: st })}
            aria-pressed={state.scaleType === st}
            className="px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors duration-150 cursor-pointer"
            style={{
              backgroundColor:
                state.scaleType === st ? 'var(--color-primary)' : 'var(--color-surface)',
              color:
                state.scaleType === st
                  ? 'var(--color-text-on-primary)'
                  : 'var(--color-text-muted)',
              border:
                state.scaleType === st
                  ? '1px solid var(--color-primary)'
                  : '1px solid var(--color-border)',
            }}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Filter chips and sort */}
      <div className="flex flex-wrap items-center gap-2">
        {/* All chip */}
        <button
          onClick={() => dispatch({ type: 'RESET_FILTERS' })}
          className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-150 cursor-pointer"
          style={{
            backgroundColor: noFilters ? 'var(--color-primary)' : 'var(--color-surface)',
            color: noFilters ? 'var(--color-text-on-primary)' : 'var(--color-text-muted)',
            border: noFilters
              ? '1px solid var(--color-primary)'
              : '1px solid var(--color-border)',
          }}
        >
          All
        </button>

        {FILTER_CHIPS.map(({ label, value }) => {
          const isActive = state.activeFilters.includes(value);
          const chipColor = CHIP_COLORS[value];
          return (
            <button
              key={value}
              onClick={() => dispatch({ type: 'TOGGLE_FILTER', payload: value })}
              aria-pressed={isActive}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-150 cursor-pointer"
              style={{
                backgroundColor: isActive ? chipColor : 'var(--color-surface)',
                color: isActive ? 'var(--color-text-on-accent)' : 'var(--color-text-muted)',
                border: `1px solid ${isActive ? chipColor : 'var(--color-border)'}`,
              }}
            >
              {label}
            </button>
          );
        })}

        {/* Spacer — hidden on mobile so controls flow naturally */}
        <div className="hidden sm:block flex-1" />

        {/* Sort dropdown */}
        <select
          aria-label="Sort chords by"
          value={state.sortBy}
          onChange={(e) =>
            dispatch({ type: 'SET_SORT', payload: e.target.value as SortOption })
          }
          className="px-3 py-1.5 rounded-lg text-xs cursor-pointer outline-none"
          style={{
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
          }}
        >
          {SORT_OPTIONS.map(({ label, value }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        {/* Beginner mode toggle */}
        <button
          onClick={() => dispatch({ type: 'TOGGLE_BEGINNER_MODE' })}
          className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-150 cursor-pointer"
          style={{
            backgroundColor: state.beginnerMode
              ? 'var(--color-success)'
              : 'var(--color-surface)',
            color: state.beginnerMode ? 'var(--color-text-on-accent)' : 'var(--color-text-muted)',
            border: `1px solid ${
              state.beginnerMode ? 'var(--color-success)' : 'var(--color-border)'
            }`,
          }}
        >
          Beginner
        </button>
      </div>
    </div>
  );
}
