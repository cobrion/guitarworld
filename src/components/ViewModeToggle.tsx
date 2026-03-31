export type ScaleViewMode = 'all' | 'positions';

interface ViewModeToggleProps {
  mode: ScaleViewMode;
  onToggle: (mode: ScaleViewMode) => void;
}

const baseStyle: React.CSSProperties = {
  fontSize: '13px',
  fontFamily: 'Inter, sans-serif',
  fontWeight: 600,
  padding: '6px 14px',
  cursor: 'pointer',
  border: 'none',
  outline: 'none',
  transition: 'background-color 0.15s, color 0.15s',
};

export default function ViewModeToggle({ mode, onToggle }: ViewModeToggleProps) {
  return (
    <div
      className="flex rounded-lg overflow-hidden"
      style={{
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface-raised)',
      }}
    >
      <button
        onClick={() => onToggle('all')}
        style={{
          ...baseStyle,
          backgroundColor:
            mode === 'all' ? 'var(--color-primary)' : 'transparent',
          color:
            mode === 'all'
              ? 'var(--diagram-dot-text)'
              : 'var(--color-text-muted)',
          borderRight: '1px solid var(--color-border)',
        }}
      >
        All Notes
      </button>
      <button
        onClick={() => onToggle('positions')}
        style={{
          ...baseStyle,
          backgroundColor:
            mode === 'positions' ? 'var(--color-primary)' : 'transparent',
          color:
            mode === 'positions'
              ? 'var(--diagram-dot-text)'
              : 'var(--color-text-muted)',
        }}
      >
        Positions
      </button>
    </div>
  );
}
