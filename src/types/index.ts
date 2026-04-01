export type NoteName =
  | 'C' | 'C#' | 'Db' | 'D' | 'D#' | 'Eb'
  | 'E' | 'F' | 'F#' | 'Gb' | 'G' | 'G#' | 'Ab'
  | 'A' | 'A#' | 'Bb' | 'B';

export type Key =
  | 'C' | 'C#' | 'D' | 'Eb' | 'E' | 'F'
  | 'F#' | 'G' | 'Ab' | 'A' | 'Bb' | 'B';

export type ScaleType = 'major' | 'minor';

export type ChordQuality =
  | 'major' | 'minor' | 'diminished' | 'augmented'
  | 'dominant7' | 'major7' | 'minor7' | 'minor7b5'
  | 'diminished7' | 'sus2' | 'sus4' | 'add9' | 'minoradd9'
  | 'dominant9' | 'power'
  | 'minor9' | 'major9' | 'dominant11' | 'minor11' | 'dominant13'
  | 'dom7sharp9' | 'dom7flat9' | 'aug7' | 'major6' | 'minor6';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type ChordTypeFilter = 'triad' | 'seventh' | 'extended' | 'sus' | 'power';
export type SortOption = 'scale-degree' | 'name' | 'difficulty';
export type FingerNumber = 0 | 1 | 2 | 3 | 4 | null;
export type StringFret = number | null;

export interface Barre {
  fromString: number;
  toString: number;
  fret: number;
}

export interface ChordVoicing {
  strings: StringFret[];    // [lowE, A, D, G, B, highE]
  fingers: FingerNumber[];
  barres: Barre[];
  baseFret: number;
}

export interface ChordData {
  name: string;
  root: NoteName;
  quality: ChordQuality;
  romanNumeral: string;
  scaleDegree: number;
  difficulty: Difficulty;
  chordType: ChordTypeFilter;
  voicings: ChordVoicing[];
}

export interface DiagramDimensions {
  svgWidth: number;
  svgHeight: number;
  gridLeft: number;
  gridTop: number;
  gridRight: number;
  gridBottom: number;
  stringSpacing: number;
  fretSpacing: number;
  dotRadius: number;
  numStrings: number;
  numFrets: number;
}

export interface ChordState {
  selectedKeys: Key[];
  scaleType: ScaleType;
  activeFilters: ChordTypeFilter[];
  sortBy: SortOption;
  beginnerMode: boolean;
}

export type IntervalName =
  | 'R' | '2' | 'b3' | '3' | '4' | 'b5' | '5' | '#5'
  | 'b6' | '6' | 'b7' | '7' | 'bb7' | 'b9' | '9' | '#9' | '11' | '13';

export type Orientation = 'vertical' | 'horizontal';

export type TabView = 'explorer' | 'analyzer' | 'scales' | 'songbook';

export interface ChordTone {
  string: number;
  fret: number;
  noteName: NoteName;
  interval: IntervalName;
  color: string;
}

export type TransitionToneType = 'stay' | 'move' | 'lift' | 'place';

export interface TransitionTone {
  string: number;
  fromFret: number | null;
  toFret: number | null;
  type: TransitionToneType;
  fromInterval: IntervalName | null;
  toInterval: IntervalName | null;
  noteName: NoteName;
  color: string;
  fretDistance: number;
}

export interface TransitionResult {
  tones: TransitionTone[];
  commonToneCount: number;
  moveCount: number;
  liftCount: number;
  placeCount: number;
  totalTravel: number;
  difficulty: 'easy' | 'moderate' | 'hard';
}

// === Songbook Types ===

export interface Song {
  id: string;
  title: string;
  artist: string;
  key: Key;
  capo: number;
  tempo?: number;
  sections: SongSection[];
  dateAdded: number;
  lastViewed?: number;
  tags: string[];
}

export interface SongSection {
  type: SectionType;
  label: string;
  lines: string[];
}

export type SectionType =
  | 'intro' | 'verse' | 'pre-chorus' | 'chorus'
  | 'bridge' | 'solo' | 'outro' | 'interlude';

export interface ParsedLine {
  segments: ChordLyricSegment[];
}

export interface ChordLyricSegment {
  chord: string | null;
  lyrics: string;
}

export interface AnalyzedChord {
  name: string;
  root: NoteName;
  suffix: string;
  scaleDegree: number | null;
  romanNumeral: string | null;
  function: HarmonicFunction;
}

export type HarmonicFunction =
  | 'tonic' | 'supertonic' | 'mediant' | 'subdominant'
  | 'dominant' | 'submediant' | 'leading' | 'nondiatonic';

export interface EditorWord {
  text: string;
  chords: string[];
  trailing: string;
}

export type SongViewMode = 'reading' | 'practice' | 'performance';

export type SongSortOption = 'title' | 'artist' | 'date-added' | 'last-viewed' | 'key';

export type SongbookAction =
  | { type: 'ADD_SONG'; payload: Song }
  | { type: 'UPDATE_SONG'; payload: Song }
  | { type: 'DELETE_SONG'; payload: string }
  | { type: 'SET_ACTIVE_SONG'; payload: string | null }
  | { type: 'SET_VIEW_MODE'; payload: SongViewMode }
  | { type: 'SET_TRANSPOSE'; payload: number }
  | { type: 'TOGGLE_NASHVILLE' }
  | { type: 'SET_AUTO_SCROLL_SPEED'; payload: number }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SORT'; payload: SongSortOption }
  | { type: 'SET_FILTER_KEY'; payload: Key | null }
  | { type: 'IMPORT_SONGS'; payload: Song[] }
  | { type: 'RETURN_TO_LIST' };

export interface SongbookState {
  songs: Song[];
  activeSongId: string | null;
  viewMode: SongViewMode;
  transpose: number;
  showNashville: boolean;
  autoScrollSpeed: number;
  searchQuery: string;
  sortBy: SongSortOption;
  filterKey: Key | null;
}

export type ChordAction =
  | { type: 'TOGGLE_KEY'; payload: Key }
  | { type: 'SET_SCALE_TYPE'; payload: ScaleType }
  | { type: 'TOGGLE_FILTER'; payload: ChordTypeFilter }
  | { type: 'SET_SORT'; payload: SortOption }
  | { type: 'TOGGLE_BEGINNER_MODE' }
  | { type: 'RESET_FILTERS' };
