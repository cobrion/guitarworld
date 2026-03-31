import {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from 'react';
import type { Song, SongbookState, SongbookAction } from '@/types';
import {
  fetchSongs,
  updateSong as apiUpsertSong,
  deleteSong as apiDeleteSong,
  bulkImportSongs as apiBulkImport,
  getPreference,
  setPreference,
} from '@/utils/api';
import { getSharedDataFromUrl, decodeSongs, clearShareHash } from '@/utils/songbookShare';

const PREFS_KEY = 'songbook-prefs';

function loadInitialState(): SongbookState {
  return {
    songs: [],
    activeSongId: null,
    viewMode: 'reading',
    transpose: 0,
    showNashville: false,
    autoScrollSpeed: 0,
    searchQuery: '',
    sortBy: 'date-added',
    filterKey: null,
  };
}

/** Deduplicate songs by ID (last one wins) */
function deduplicateSongs(songs: Song[]): Song[] {
  const map = new Map<string, Song>();
  for (const s of songs) {
    map.set(s.id, s);
  }
  return Array.from(map.values());
}

function songbookReducer(state: SongbookState, action: SongbookAction): SongbookState {
  switch (action.type) {
    case 'ADD_SONG':
      return { ...state, songs: [...state.songs, action.payload] };
    case 'UPDATE_SONG':
      return {
        ...state,
        songs: state.songs.map((s) =>
          s.id === action.payload.id ? action.payload : s
        ),
      };
    case 'DELETE_SONG':
      return {
        ...state,
        songs: state.songs.filter((s) => s.id !== action.payload),
        activeSongId: state.activeSongId === action.payload ? null : state.activeSongId,
      };
    case 'SET_ACTIVE_SONG':
      return {
        ...state,
        activeSongId: action.payload,
        transpose: 0,
        viewMode: 'reading',
        autoScrollSpeed: 0,
        songs: action.payload
          ? state.songs.map((s) =>
              s.id === action.payload ? { ...s, lastViewed: Date.now() } : s
            )
          : state.songs,
      };
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };
    case 'SET_TRANSPOSE':
      return { ...state, transpose: action.payload };
    case 'TOGGLE_NASHVILLE':
      return { ...state, showNashville: !state.showNashville };
    case 'SET_AUTO_SCROLL_SPEED':
      return { ...state, autoScrollSpeed: action.payload };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_SORT':
      return { ...state, sortBy: action.payload };
    case 'SET_FILTER_KEY':
      return { ...state, filterKey: action.payload };
    case 'IMPORT_SONGS':
      // Deduplicate: merge with existing, last wins
      return { ...state, songs: deduplicateSongs([...state.songs, ...action.payload]) };
    case 'RETURN_TO_LIST':
      return { ...state, activeSongId: null, transpose: 0, autoScrollSpeed: 0 };
    default:
      return state;
  }
}

interface SongbookContextValue {
  state: SongbookState;
  dispatch: React.Dispatch<SongbookAction>;
  activeSong: Song | null;
  filteredSongs: Song[];
  shareImportCount: number;
}

const SongbookContext = createContext<SongbookContextValue | null>(null);

export function SongbookProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(songbookReducer, undefined, loadInitialState);
  const [shareImportCount, setShareImportCount] = useState(0);
  const initialLoadDone = useRef(false);
  const prevSongsRef = useRef<Song[]>([]);

  // Load songs from MongoDB on mount, migrate localStorage if needed
  useEffect(() => {
    (async () => {
      let loadedSongs: Song[] = [];

      try {
        const [dbSongs, prefs] = await Promise.all([
          fetchSongs(),
          getPreference<{ sortBy?: string }>(PREFS_KEY),
        ]);

        // Check localStorage for songs to migrate
        let localSongs: Song[] = [];
        try {
          const stored = localStorage.getItem('guitarworld-songbook');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              localSongs = parsed;
            }
          }
        } catch { /* ignore */ }

        // Merge: deduplicate by ID (DB version wins over localStorage)
        const dbIds = new Set(dbSongs.map((s: Song) => s.id));
        const toMigrate = localSongs.filter((s) => !dbIds.has(s.id));

        if (toMigrate.length > 0) {
          await apiBulkImport(toMigrate).catch(() => {});
          console.log(`Migrated ${toMigrate.length} song(s) from localStorage to MongoDB`);
        }

        loadedSongs = deduplicateSongs([...dbSongs, ...toMigrate]);

        // Clear localStorage after successful migration
        if (localSongs.length > 0) {
          localStorage.removeItem('guitarworld-songbook');
          localStorage.removeItem('guitarworld-songbook-prefs');
        }

        if (prefs?.sortBy) {
          dispatch({ type: 'SET_SORT', payload: prefs.sortBy as SongbookState['sortBy'] });
        }
      } catch (err) {
        console.warn('Failed to load from MongoDB, falling back to localStorage:', err);
        try {
          const stored = localStorage.getItem('guitarworld-songbook');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              loadedSongs = parsed;
            }
          }
        } catch { /* ignore */ }
      }

      if (loadedSongs.length > 0) {
        dispatch({ type: 'IMPORT_SONGS', payload: loadedSongs });
      }

      // KEY FIX: Set prevSongsRef AFTER loading so the sync effect
      // doesn't treat loaded songs as "new additions"
      prevSongsRef.current = loadedSongs;
      initialLoadDone.current = true;

      // Handle shared URL import
      const sharedData = getSharedDataFromUrl();
      if (sharedData) {
        try {
          const sharedSongs = await decodeSongs(sharedData);
          if (sharedSongs.length > 0) {
            await apiBulkImport(sharedSongs).catch(() => {});
            dispatch({ type: 'IMPORT_SONGS', payload: sharedSongs });
            setShareImportCount(sharedSongs.length);
          }
        } catch { /* ignore */ }
        clearShareHash();
      }
    })();
  }, []);

  // Sync song changes to MongoDB
  useEffect(() => {
    if (!initialLoadDone.current) return;

    const prev = prevSongsRef.current;
    const curr = state.songs;
    prevSongsRef.current = curr;

    const prevIds = new Set(prev.map((s) => s.id));
    const currIds = new Set(curr.map((s) => s.id));

    // Upsert new or updated songs (PUT, not POST — avoids duplicate key errors)
    for (const song of curr) {
      if (!prevIds.has(song.id)) {
        apiUpsertSong(song).catch((err) => console.warn('Failed to upsert song:', err));
      } else {
        const prevSong = prev.find((s) => s.id === song.id);
        if (prevSong && prevSong !== song) {
          apiUpsertSong(song).catch((err) => console.warn('Failed to update song:', err));
        }
      }
    }

    // Delete removed songs
    for (const song of prev) {
      if (!currIds.has(song.id)) {
        apiDeleteSong(song.id).catch((err) => console.warn('Failed to delete song:', err));
      }
    }
  }, [state.songs]);

  // Sync preferences
  useEffect(() => {
    if (!initialLoadDone.current) return;
    setPreference(PREFS_KEY, { sortBy: state.sortBy }).catch(() => {});
  }, [state.sortBy]);

  const activeSong = useMemo(
    () => state.songs.find((s) => s.id === state.activeSongId) ?? null,
    [state.songs, state.activeSongId]
  );

  const filteredSongs = useMemo(() => {
    let result = state.songs;

    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.artist.toLowerCase().includes(q)
      );
    }

    if (state.filterKey) {
      result = result.filter((s) => s.key === state.filterKey);
    }

    switch (state.sortBy) {
      case 'title':
        result = [...result].sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'artist':
        result = [...result].sort((a, b) => a.artist.localeCompare(b.artist));
        break;
      case 'date-added':
        result = [...result].sort((a, b) => b.dateAdded - a.dateAdded);
        break;
      case 'last-viewed':
        result = [...result].sort(
          (a, b) => (b.lastViewed ?? 0) - (a.lastViewed ?? 0)
        );
        break;
      case 'key':
        result = [...result].sort((a, b) => a.key.localeCompare(b.key));
        break;
    }

    return result;
  }, [state.songs, state.searchQuery, state.filterKey, state.sortBy]);

  const value = useMemo(
    () => ({ state, dispatch, activeSong, filteredSongs, shareImportCount }),
    [state, activeSong, filteredSongs, shareImportCount]
  );

  return (
    <SongbookContext.Provider value={value}>
      {children}
    </SongbookContext.Provider>
  );
}

export function useSongbook(): SongbookContextValue {
  const context = useContext(SongbookContext);
  if (!context) {
    throw new Error('useSongbook must be used within a SongbookProvider');
  }
  return context;
}
