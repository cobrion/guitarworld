import type { Orientation } from '@/types';

interface OrientationToggleProps {
  orientation: Orientation;
  onToggle: () => void;
}

export default function OrientationToggle({ orientation, onToggle }: OrientationToggleProps) {
  const label = orientation === 'vertical'
    ? 'Switch to horizontal'
    : 'Switch to vertical';

  return (
    <button
      onClick={onToggle}
      title={label}
      aria-label={label}
      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
      style={{
        backgroundColor: 'var(--color-surface-raised)',
        color: 'var(--color-text)',
        border: '1px solid var(--color-border)',
      }}
    >
      {/* Rotate icon */}
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 4V1h3" />
        <path d="M15 12v3h-3" />
        <path d="M1 1l4.5 4.5" />
        <path d="M15 15l-4.5-4.5" />
        <path d="M13 1h2v2" />
        <path d="M3 15H1v-2" />
        <path d="M15 1l-4.5 4.5" />
        <path d="M1 15l4.5-4.5" />
      </svg>
      {orientation === 'vertical' ? 'Horizontal' : 'Vertical'}
    </button>
  );
}
