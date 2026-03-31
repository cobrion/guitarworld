import { useState } from 'react';
import type { Song } from '@/types';
import { extractUniqueChords } from '@/utils/chordpro';

interface SongCardProps {
  song: Song;
  onView: (id: string) => void;
  onEdit: (song: Song) => void;
  onDelete: (id: string) => void;
  onDuplicate: (song: Song) => void;
}

export default function SongCard({ song, onView, onEdit, onDelete, onDuplicate }: SongCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const chordCount = extractUniqueChords(song.sections).length;

  return (
    <div
      className="rounded-xl transition-shadow duration-200"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}
    >
      {/* Accent bar */}
      <div style={{ height: '4px', backgroundColor: 'var(--color-primary)', borderRadius: '12px 12px 0 0' }} />

      <div className="p-4">
        {/* Title + Artist */}
        <button
          onClick={() => onView(song.id)}
          className="text-left w-full cursor-pointer"
          style={{ background: 'none', border: 'none', padding: 0 }}
        >
          <h3
            className="text-sm font-bold truncate"
            style={{ color: 'var(--color-text)' }}
          >
            {song.title}
          </h3>
          <p
            className="text-xs truncate mt-0.5"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {song.artist}
          </p>
        </button>

        {/* Metadata row */}
        <div
          className="flex items-center gap-3 mt-3 text-[11px] font-medium"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <span
            className="px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: 'var(--color-surface-raised)',
              color: 'var(--color-primary)',
              fontWeight: 700,
            }}
          >
            {song.key}
          </span>
          {song.capo > 0 && <span>Capo {song.capo}</span>}
          <span>{song.sections.length} sections</span>
          <span>{chordCount} chords</span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-3 pt-3"
          style={{ borderTop: '1px solid var(--color-border-subtle)' }}
        >
          <button
            onClick={() => onView(song.id)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-text-on-primary)',
              border: 'none',
            }}
          >
            View
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(song)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors"
              style={{
                backgroundColor: 'var(--color-surface-raised)',
                color: 'var(--color-text-muted)',
                border: '1px solid var(--color-border)',
              }}
            >
              Edit
            </button>

            {/* Overflow menu */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="px-2 py-1.5 rounded-lg text-xs cursor-pointer"
                style={{
                  backgroundColor: 'var(--color-surface-raised)',
                  color: 'var(--color-text-muted)',
                  border: '1px solid var(--color-border)',
                }}
              >
                &#8942;
              </button>
              {showMenu && (
                <>
                  <div
                    style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                    onClick={() => setShowMenu(false)}
                  />
                  <div
                    className="rounded-lg py-1"
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '100%',
                      marginTop: '4px',
                      zIndex: 50,
                      minWidth: '120px',
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      boxShadow: 'var(--shadow-md)',
                    }}
                  >
                    <button
                      onClick={() => { onDuplicate(song); setShowMenu(false); }}
                      className="w-full text-left px-3 py-1.5 text-xs cursor-pointer"
                      style={{ background: 'none', border: 'none', color: 'var(--color-text)' }}
                    >
                      Duplicate
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${song.title}"?`)) {
                          onDelete(song.id);
                        }
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs cursor-pointer"
                      style={{ background: 'none', border: 'none', color: 'var(--color-error)' }}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
