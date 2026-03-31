import { useState, useCallback } from 'react';
import {
  searchLyrics,
  formatDuration,
  lyricsToChordPro,
  type LyricsSearchResult,
} from '@/utils/lyricsSearch';

export interface LyricsSearchSelection {
  title: string;
  artist: string;
  chordProText: string;
}

interface LyricsSearchDialogProps {
  onSelect: (selection: LyricsSearchSelection) => void;
  onClose: () => void;
}

export default function LyricsSearchDialog({ onSelect, onClose }: LyricsSearchDialogProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LyricsSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const data = await searchLyrics(query);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed. Please try again.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSearch();
      if (e.key === 'Escape') onClose();
    },
    [handleSearch, onClose]
  );

  const handleSelect = useCallback(
    (result: LyricsSearchResult) => {
      if (!result.plainLyrics) return;

      const chordProText = lyricsToChordPro(
        result.plainLyrics,
        result.trackName,
        result.artistName
      );

      onSelect({
        title: result.trackName,
        artist: result.artistName,
        chordProText,
      });
    },
    [onSelect]
  );

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          backgroundColor: 'rgba(0,0,0,0.6)',
        }}
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 110,
          width: '90vw',
          maxWidth: '560px',
          maxHeight: '80vh',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{
            backgroundColor: 'var(--color-surface-raised)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <h3 className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
            Search Lyrics Online
          </h3>
          <button
            onClick={onClose}
            className="cursor-pointer text-base"
            style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)' }}
          >
            &#x2715;
          </button>
        </div>

        {/* Search input */}
        <div className="flex items-center gap-2 px-4 py-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search by artist or song name..."
            autoFocus
            className="flex-1 px-3 py-2 rounded-lg text-sm"
            style={{
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
              outline: 'none',
            }}
          />
          <button
            onClick={handleSearch}
            disabled={isLoading || !query.trim()}
            className="px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer"
            style={{
              backgroundColor: query.trim() ? 'var(--color-primary)' : 'var(--color-border)',
              color: query.trim() ? 'var(--color-text-on-primary)' : 'var(--color-text-muted)',
              border: 'none',
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Powered by notice */}
        <div
          className="px-4 pb-2 text-[10px]"
          style={{ color: 'var(--color-text-muted)', opacity: 0.6 }}
        >
          Powered by LRCLIB &mdash; lyrics only, add chords in editor
        </div>

        {/* Results */}
        <div
          className="flex-1 overflow-y-auto px-4 pb-4"
          style={{ minHeight: 0 }}
        >
          {/* Error state */}
          {error && (
            <div
              className="text-center py-6 text-sm rounded-lg"
              style={{
                backgroundColor: 'var(--hf-dominant-bg)',
                color: 'var(--color-error)',
              }}
            >
              {error}
            </div>
          )}

          {/* No results */}
          {hasSearched && !isLoading && !error && results.length === 0 && (
            <div
              className="text-center py-8 text-sm"
              style={{ color: 'var(--color-text-muted)' }}
            >
              No lyrics found. Try a different search term.
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div
              className="text-center py-8 text-sm"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Searching...
            </div>
          )}

          {/* Result cards */}
          {!isLoading && results.length > 0 && (
            <div className="space-y-2">
              {results.slice(0, 20).map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  className="w-full text-left rounded-lg p-3 transition-colors cursor-pointer"
                  style={{
                    backgroundColor: 'var(--color-surface-raised)',
                    border: '1px solid var(--color-border)',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = 'var(--color-primary)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = 'var(--color-border)')
                  }
                >
                  <div
                    className="text-sm font-bold truncate"
                    style={{ color: 'var(--color-text)' }}
                  >
                    {result.trackName}
                  </div>
                  <div
                    className="text-xs truncate mt-0.5"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {result.artistName}
                  </div>
                  <div
                    className="flex items-center gap-3 mt-1.5 text-[11px]"
                    style={{ color: 'var(--color-text-muted)', opacity: 0.7 }}
                  >
                    {result.albumName && (
                      <span className="truncate" style={{ maxWidth: '200px' }}>
                        {result.albumName}
                      </span>
                    )}
                    {result.duration > 0 && (
                      <span>{formatDuration(result.duration)}</span>
                    )}
                    {result.plainLyrics && (
                      <span style={{ color: 'var(--color-success)' }}>
                        Lyrics available
                      </span>
                    )}
                  </div>
                  {/* Lyrics preview */}
                  {result.plainLyrics && (
                    <div
                      className="mt-2 text-[11px] leading-relaxed"
                      style={{
                        color: 'var(--color-text-muted)',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {result.plainLyrics.slice(0, 150)}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
