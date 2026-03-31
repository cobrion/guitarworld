import {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import type {
  ChordState,
  ChordAction,
  ChordData,
  Key,
} from '@/types';
import { getChordsForKey } from '@/utils/musicTheory';
import { getPreference, setPreference } from '@/utils/api';

const PREF_KEY_SELECTED = 'chord-selectedKeys';
const PREF_KEY_BEGINNER = 'chord-beginnerMode';

function loadInitialState(): ChordState {
  return {
    selectedKeys: ['C'],
    scaleType: 'major',
    activeFilters: [],
    sortBy: 'scale-degree',
    beginnerMode: false,
  };
}

function chordReducer(state: ChordState, action: ChordAction): ChordState {
  switch (action.type) {
    case 'TOGGLE_KEY': {
      const key = action.payload;
      const isSelected = state.selectedKeys.includes(key);
      const newKeys = isSelected
        ? state.selectedKeys.filter((k) => k !== key)
        : [...state.selectedKeys, key];
      return { ...state, selectedKeys: newKeys };
    }
    case 'SET_SCALE_TYPE':
      return { ...state, scaleType: action.payload };
    case 'TOGGLE_FILTER': {
      const filter = action.payload;
      const active = state.activeFilters.includes(filter);
      return {
        ...state,
        activeFilters: active
          ? state.activeFilters.filter((f) => f !== filter)
          : [...state.activeFilters, filter],
      };
    }
    case 'SET_SORT':
      return { ...state, sortBy: action.payload };
    case 'TOGGLE_BEGINNER_MODE':
      return { ...state, beginnerMode: !state.beginnerMode };
    case 'RESET_FILTERS':
      return { ...state, activeFilters: [], sortBy: 'scale-degree', beginnerMode: false };
    default:
      return state;
  }
}

const DIFFICULTY_ORDER = { beginner: 0, intermediate: 1, advanced: 2 } as const;

interface ChordContextValue {
  state: ChordState;
  dispatch: React.Dispatch<ChordAction>;
  chords: ChordData[];
}

const ChordContext = createContext<ChordContextValue | null>(null);

export function ChordProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chordReducer, undefined, loadInitialState);
  const initialLoadDone = useRef(false);

  // Load preferences from MongoDB on mount
  useEffect(() => {
    (async () => {
      try {
        const [selectedKeys, beginnerMode] = await Promise.all([
          getPreference<Key[]>(PREF_KEY_SELECTED),
          getPreference<boolean>(PREF_KEY_BEGINNER),
        ]);
        if (selectedKeys && Array.isArray(selectedKeys) && selectedKeys.length > 0) {
          // Set each key by toggling (clear default 'C' first if needed)
          for (const k of selectedKeys) {
            dispatch({ type: 'TOGGLE_KEY', payload: k });
          }
          // Remove default 'C' if it wasn't in the saved keys
          if (!selectedKeys.includes('C')) {
            dispatch({ type: 'TOGGLE_KEY', payload: 'C' });
          }
        }
        if (beginnerMode === true) {
          dispatch({ type: 'TOGGLE_BEGINNER_MODE' });
        }
        // Migrate localStorage to MongoDB
        if (!selectedKeys) {
          try {
            const stored = localStorage.getItem('guitarworld-selectedKeys');
            if (stored) {
              const parsed = JSON.parse(stored);
              if (Array.isArray(parsed) && parsed.length > 0) {
                await setPreference(PREF_KEY_SELECTED, parsed);
                for (const k of parsed as Key[]) {
                  dispatch({ type: 'TOGGLE_KEY', payload: k });
                }
                if (!(parsed as Key[]).includes('C')) {
                  dispatch({ type: 'TOGGLE_KEY', payload: 'C' });
                }
                localStorage.removeItem('guitarworld-selectedKeys');
              }
            }
            const storedBeginner = localStorage.getItem('guitarworld-beginnerMode');
            if (storedBeginner === 'true') {
              await setPreference(PREF_KEY_BEGINNER, true);
              dispatch({ type: 'TOGGLE_BEGINNER_MODE' });
              localStorage.removeItem('guitarworld-beginnerMode');
            }
          } catch {
            // ignore
          }
        }
      } catch {
        // MongoDB unavailable, try localStorage fallback
        try {
          const stored = localStorage.getItem('guitarworld-selectedKeys');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              for (const k of parsed as Key[]) {
                dispatch({ type: 'TOGGLE_KEY', payload: k });
              }
              if (!(parsed as Key[]).includes('C')) {
                dispatch({ type: 'TOGGLE_KEY', payload: 'C' });
              }
            }
          }
          if (localStorage.getItem('guitarworld-beginnerMode') === 'true') {
            dispatch({ type: 'TOGGLE_BEGINNER_MODE' });
          }
        } catch {
          // ignore
        }
      }
      initialLoadDone.current = true;
    })();
  }, []);

  // Persist to MongoDB
  useEffect(() => {
    if (!initialLoadDone.current) return;
    setPreference(PREF_KEY_SELECTED, state.selectedKeys).catch(() => {});
    setPreference(PREF_KEY_BEGINNER, state.beginnerMode).catch(() => {});
  }, [state.selectedKeys, state.beginnerMode]);

  const chords = useMemo(() => {
    const primaryKey = state.selectedKeys[0] ?? 'C';
    let result = getChordsForKey(primaryKey, state.scaleType);

    if (state.beginnerMode) {
      result = result.filter((c) => c.difficulty === 'beginner');
    }

    if (state.activeFilters.length > 0) {
      result = result.filter((c) => state.activeFilters.includes(c.chordType));
    }

    switch (state.sortBy) {
      case 'name':
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'difficulty':
        result = [...result].sort(
          (a, b) => DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty]
        );
        break;
      case 'scale-degree':
      default:
        result = [...result].sort((a, b) => a.scaleDegree - b.scaleDegree);
        break;
    }

    return result;
  }, [state.selectedKeys, state.scaleType, state.activeFilters, state.sortBy, state.beginnerMode]);

  const value = useMemo(() => ({ state, dispatch, chords }), [state, chords]);

  return (
    <ChordContext.Provider value={value}>
      {children}
    </ChordContext.Provider>
  );
}

export function useChord(): ChordContextValue {
  const context = useContext(ChordContext);
  if (!context) {
    throw new Error('useChord must be used within a ChordProvider');
  }
  return context;
}
