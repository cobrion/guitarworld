import { ALL_KEYS } from '@/utils/constants';
import { useChord } from '@/context/ChordContext';

export default function KeySelector() {
  const { state, dispatch } = useChord();

  return (
    <div
      className="sticky top-0 z-10 px-4 py-3 sm:px-6"
      style={{
        backgroundColor: 'var(--color-bg)',
        borderBottom: '1px solid var(--color-border-subtle)',
      }}
    >
      <p
        className="text-xs font-medium mb-2"
        style={{ color: 'var(--color-text-muted)' }}
      >
        Select chords to find which keys contain them
      </p>
      <div
        className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {ALL_KEYS.map((key) => {
          const isSelected = state.selectedKeys.includes(key);
          return (
            <button
              key={key}
              onClick={() => dispatch({ type: 'TOGGLE_KEY', payload: key })}
              aria-pressed={isSelected}
              className="flex-shrink-0 rounded-lg font-semibold text-sm transition-all duration-150 cursor-pointer"
              style={{
                minWidth: '44px',
                minHeight: '44px',
                padding: '8px 12px',
                backgroundColor: isSelected
                  ? 'var(--color-primary)'
                  : 'var(--color-surface)',
                color: isSelected
                  ? 'var(--color-text-on-primary)'
                  : 'var(--color-text)',
                border: isSelected
                  ? '1px solid var(--color-primary)'
                  : '1px solid var(--color-border)',
                boxShadow: isSelected ? 'var(--shadow-primary)' : 'none',
              }}
            >
              {key}
            </button>
          );
        })}
      </div>
    </div>
  );
}
