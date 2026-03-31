import { useMemo } from 'react';
import type { Song, SongViewMode } from '@/types';
import { getTransposedKey, getCapoEquivalent } from '@/utils/transpose';

interface SongViewerHeaderProps {
  song: Song;
  transpose: number;
  viewMode: SongViewMode;
  showNashville: boolean;
  onBack: () => void;
  onEdit: () => void;
  onTransposeChange: (semitones: number) => void;
  onViewModeChange: (mode: SongViewMode) => void;
  onToggleNashville: () => void;
}

const VIEW_MODES: { key: SongViewMode; label: string }[] = [
  { key: 'reading', label: 'Reading' },
  { key: 'practice', label: 'Practice' },
  { key: 'performance', label: 'Performance' },
];

export default function SongViewerHeader({
  song,
  transpose,
  viewMode,
  showNashville,
  onBack,
  onEdit,
  onTransposeChange,
  onViewModeChange,
  onToggleNashville,
}: SongViewerHeaderProps) {
  const effectiveKey = useMemo(
    () => transpose === 0 ? song.key : getTransposedKey(song.key, transpose),
    [song.key, transpose]
  );

  const capoInfo = useMemo(() => {
    if (song.capo === 0) return null;
    const playKey = getCapoEquivalent(effectiveKey, song.capo);
    return { capo: song.capo, playKey };
  }, [effectiveKey, song.capo]);

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      {/* Top row: back, title, key controls */}
      <div className="flex items-center gap-3 px-4 py-2.5">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex-shrink-0 cursor-pointer text-sm"
          style={{ background: 'none', border: 'none', color: 'var(--color-primary)' }}
          aria-label="Back to song list"
        >
          &#8592; Back
        </button>

        {/* Title + Artist */}
        <div className="flex-1 min-w-0">
          <h2
            className="text-sm font-bold truncate"
            style={{ color: 'var(--color-text)' }}
          >
            {song.title}
          </h2>
          <p
            className="text-xs truncate"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {song.artist}
          </p>
        </div>

        {/* Transpose controls */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onTransposeChange(transpose - 1)}
            className="w-7 h-7 rounded-md text-xs font-bold cursor-pointer flex items-center justify-center"
            style={{
              backgroundColor: 'var(--color-surface-raised)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-muted)',
            }}
            aria-label="Transpose down"
          >
            &#9837;
          </button>
          <div className="text-center" style={{ minWidth: '48px' }}>
            <div
              className="text-xs font-bold"
              style={{ color: 'var(--color-primary)' }}
            >
              {effectiveKey}
            </div>
            {transpose !== 0 && (
              <button
                onClick={() => onTransposeChange(0)}
                className="text-[9px] cursor-pointer"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-muted)',
                }}
              >
                ({transpose > 0 ? '+' : ''}{transpose})
              </button>
            )}
          </div>
          <button
            onClick={() => onTransposeChange(transpose + 1)}
            className="w-7 h-7 rounded-md text-xs font-bold cursor-pointer flex items-center justify-center"
            style={{
              backgroundColor: 'var(--color-surface-raised)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-muted)',
            }}
            aria-label="Transpose up"
          >
            &#9839;
          </button>
        </div>

        {/* Edit button */}
        <button
          onClick={onEdit}
          className="flex-shrink-0 px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-text-on-primary)',
            border: 'none',
          }}
          title="Edit chords & lyrics"
        >
          Edit
        </button>

        {/* Nashville toggle */}
        <button
          onClick={onToggleNashville}
          className="flex-shrink-0 px-2 py-1 rounded-md text-[10px] font-bold cursor-pointer"
          style={{
            backgroundColor: showNashville ? 'var(--color-primary)' : 'var(--color-surface-raised)',
            color: showNashville ? 'var(--color-text-on-primary)' : 'var(--color-text-muted)',
            border: showNashville ? 'none' : '1px solid var(--color-border)',
          }}
          title="Nashville Number System"
        >
          #
        </button>
      </div>

      {/* Capo info */}
      {capoInfo && (
        <div
          className="px-4 pb-1.5 text-[11px]"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Capo {capoInfo.capo} &mdash; play {capoInfo.playKey} shapes
        </div>
      )}

      {/* View mode toggle */}
      <div
        className="flex items-center gap-1 px-4 py-1.5"
        style={{
          borderTop: '1px solid var(--color-border-subtle)',
          backgroundColor: 'var(--color-surface-raised)',
        }}
      >
        {VIEW_MODES.map(({ key, label }) => {
          const isActive = viewMode === key;
          return (
            <button
              key={key}
              onClick={() => onViewModeChange(key)}
              className="px-3 py-1 rounded-full text-[11px] font-medium cursor-pointer transition-colors"
              style={{
                backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                color: isActive ? 'var(--color-text-on-primary)' : 'var(--color-text-muted)',
                border: 'none',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
