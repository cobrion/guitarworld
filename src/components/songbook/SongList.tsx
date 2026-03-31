import { useState, useCallback, useEffect } from 'react';
import type { Song, Key, SongSortOption } from '@/types';
import { ALL_KEYS, generateUUID } from '@/utils/constants';
import { useSongbook } from '@/context/SongbookContext';
import { updateSong as apiUpsertSong } from '@/utils/api';
import { generateShareUrl } from '@/utils/songbookShare';
import SongCard from './SongCard';
import SongEditor, { type SongEditorInitialData } from './SongEditor';
import LyricsSearchDialog, { type LyricsSearchSelection } from './LyricsSearchDialog';

export default function SongList() {
  const { state, dispatch, filteredSongs, shareImportCount } = useSongbook();
  const [editorSong, setEditorSong] = useState<Song | null | undefined>(undefined);
  // undefined = editor closed, null = new song, Song = editing
  const [editorInitialData, setEditorInitialData] = useState<SongEditorInitialData | undefined>();
  const [showLyricsSearch, setShowLyricsSearch] = useState(false);

  const showEditor = editorSong !== undefined;

  const handleView = useCallback((id: string) => {
    dispatch({ type: 'SET_ACTIVE_SONG', payload: id });
  }, [dispatch]);

  const handleSave = useCallback((song: Song) => {
    const exists = state.songs.some((s) => s.id === song.id);
    if (exists) {
      dispatch({ type: 'UPDATE_SONG', payload: song });
    } else {
      dispatch({ type: 'ADD_SONG', payload: song });
    }
    // Persist directly to DB (don't rely solely on the sync effect)
    apiUpsertSong(song).catch((err) => console.warn('Failed to save song:', err));
    setEditorSong(undefined);
    setEditorInitialData(undefined);
  }, [dispatch, state.songs]);

  const handleDelete = useCallback((id: string) => {
    dispatch({ type: 'DELETE_SONG', payload: id });
  }, [dispatch]);

  const handleDuplicate = useCallback((song: Song) => {
    const dup: Song = {
      ...song,
      id: generateUUID(),
      title: `${song.title} (copy)`,
      dateAdded: Date.now(),
      lastViewed: undefined,
    };
    dispatch({ type: 'ADD_SONG', payload: dup });
  }, [dispatch]);

  const handleExport = useCallback(() => {
    const json = JSON.stringify(state.songs, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'guitarworld-songbook.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [state.songs]);

  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const songs = JSON.parse(text);
        if (Array.isArray(songs)) {
          dispatch({ type: 'IMPORT_SONGS', payload: songs });
        }
      } catch {
        alert('Invalid songbook file');
      }
    };
    input.click();
  }, [dispatch]);

  const [shareNotice, setShareNotice] = useState<string | null>(null);

  // Show import notification from shared URL
  useEffect(() => {
    if (shareImportCount > 0) {
      setShareNotice(`${shareImportCount} song${shareImportCount !== 1 ? 's' : ''} imported from shared link`);
      const timer = setTimeout(() => setShareNotice(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [shareImportCount]);

  const handleShare = useCallback(async () => {
    if (state.songs.length === 0) return;
    try {
      const url = await generateShareUrl(state.songs);
      await navigator.clipboard.writeText(url);
      setShareNotice('Share link copied to clipboard! Open it on any device to import your songbook.');
      setTimeout(() => setShareNotice(null), 5000);
    } catch {
      // Fallback: show the URL in a prompt
      const url = await generateShareUrl(state.songs);
      prompt('Copy this share link:', url);
    }
  }, [state.songs]);

  const handleLyricsSearchSelect = useCallback((selection: LyricsSearchSelection) => {
    setShowLyricsSearch(false);
    setEditorInitialData({
      title: selection.title,
      artist: selection.artist,
      chordProText: selection.chordProText,
    });
    setEditorSong(null); // open editor as "new song" with initial data
  }, []);

  return (
    <section className="px-4 py-6 sm:px-6">
      {/* Share notification banner */}
      {shareNotice && (
        <div
          className="flex items-center justify-between gap-3 mb-4 px-4 py-3 rounded-lg text-sm"
          style={{
            backgroundColor: 'var(--hf-tonic-bg)',
            color: 'var(--color-success)',
            border: '1px solid var(--color-success)',
          }}
        >
          <span>{shareNotice}</span>
          <button
            onClick={() => setShareNotice(null)}
            className="cursor-pointer text-xs font-bold"
            style={{ background: 'none', border: 'none', color: 'var(--color-success)' }}
          >
            &#x2715;
          </button>
        </div>
      )}

      {/* Search bar + controls */}
      <div
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4"
      >
        {/* Search input */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={state.searchQuery}
            onChange={(e) => dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value })}
            placeholder="Search songs..."
            className="w-full px-3 py-2.5 pl-9 rounded-lg text-sm"
            style={{
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
              outline: 'none',
            }}
          />
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
            style={{ color: 'var(--color-text-muted)' }}
          >
            &#x1F50D;
          </span>
        </div>

        {/* Key filter */}
        <select
          value={state.filterKey ?? ''}
          onChange={(e) =>
            dispatch({
              type: 'SET_FILTER_KEY',
              payload: (e.target.value || null) as Key | null,
            })
          }
          className="px-3 py-2.5 rounded-lg text-sm"
          style={{
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
            minWidth: '80px',
          }}
        >
          <option value="">All Keys</option>
          {ALL_KEYS.map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={state.sortBy}
          onChange={(e) =>
            dispatch({ type: 'SET_SORT', payload: e.target.value as SongSortOption })
          }
          className="px-3 py-2.5 rounded-lg text-sm"
          style={{
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
            minWidth: '100px',
          }}
        >
          <option value="date-added">Newest</option>
          <option value="last-viewed">Recent</option>
          <option value="title">Title A-Z</option>
          <option value="artist">Artist A-Z</option>
          <option value="key">By Key</option>
        </select>
      </div>

      {/* Action buttons row */}
      <div className="flex items-center justify-between mb-4">
        <span
          className="text-xs font-medium"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {filteredSongs.length} song{filteredSongs.length !== 1 ? 's' : ''}
          {state.searchQuery && ' found'}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleImport}
            className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
            style={{
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-muted)',
              border: '1px solid var(--color-border)',
            }}
          >
            Import
          </button>
          {state.songs.length > 0 && (
            <>
              <button
                onClick={handleExport}
                className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-muted)',
                  border: '1px solid var(--color-border)',
                }}
              >
                Export
              </button>
              <button
                onClick={handleShare}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                style={{
                  backgroundColor: 'var(--color-success)',
                  color: 'var(--color-text-on-accent)',
                  border: 'none',
                }}
              >
                Share
              </button>
            </>
          )}
          <button
            onClick={() => setShowLyricsSearch(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-text-on-accent)',
              border: 'none',
            }}
          >
            Search Web
          </button>
          <button
            onClick={() => { setEditorInitialData(undefined); setEditorSong(null); }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-text-on-primary)',
              border: 'none',
            }}
          >
            + Add Song
          </button>
        </div>
      </div>

      {/* Song grid */}
      {filteredSongs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSongs.map((song) => (
            <SongCard
              key={song.id}
              song={song}
              onView={handleView}
              onEdit={(s) => setEditorSong(s)}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
            />
          ))}
        </div>
      ) : (
        <div
          className="text-center py-16 rounded-xl"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div className="text-4xl mb-3">&#127928;</div>
          <h3
            className="text-base font-semibold mb-1"
            style={{ color: 'var(--color-text)' }}
          >
            {state.searchQuery ? 'No songs found' : 'Your songbook is empty'}
          </h3>
          <p
            className="text-sm mb-4"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {state.searchQuery
              ? 'Try a different search term'
              : 'Add your first song with chords and lyrics'}
          </p>
          {!state.searchQuery && (
            <div className="flex items-center gap-3 justify-center">
              <button
                onClick={() => setShowLyricsSearch(true)}
                className="px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-text-on-accent)',
                  border: 'none',
                }}
              >
                Search Web
              </button>
              <button
                onClick={() => { setEditorInitialData(undefined); setEditorSong(null); }}
                className="px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-text-on-primary)',
                  border: 'none',
                }}
              >
                + Add Manually
              </button>
            </div>
          )}
        </div>
      )}

      {/* Editor modal */}
      {showEditor && (
        <SongEditor
          song={editorSong}
          initialData={editorInitialData}
          onSave={handleSave}
          onCancel={() => { setEditorSong(undefined); setEditorInitialData(undefined); }}
        />
      )}

      {/* Lyrics search dialog */}
      {showLyricsSearch && (
        <LyricsSearchDialog
          onSelect={handleLyricsSearchSelect}
          onClose={() => setShowLyricsSearch(false)}
        />
      )}
    </section>
  );
}
