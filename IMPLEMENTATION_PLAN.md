# GuitarWorld — Comprehensive Implementation Plan

## 1. Complete Component Tree

```
App
├── Header
│   ├── Logo
│   └── ThemeToggle
├── KeySelector
│   ├── KeyButton (x12)
│   └── ScaleTypeToggle (Major / Minor)
├── FilterBar
│   ├── ChordTypeChips (triads, 7ths, sus, etc.)
│   ├── SortDropdown (by scale degree, name, difficulty)
│   └── BeginnerModeToggle
├── ChordGrid
│   └── ChordCard (one per chord in the selected key)
│       ├── ChordHeader
│       │   ├── ChordName (e.g. "Am7")
│       │   ├── RomanNumeral (e.g. "vi7")
│       │   └── DifficultyBadge (beginner / intermediate / advanced)
│       ├── ChordDiagram (SVG)
│       │   ├── FretboardGrid (string lines + fret lines)
│       │   ├── FingerDots (circles with finger number labels)
│       │   ├── BarreIndicator (rounded rect spanning strings)
│       │   ├── StringMarkers (O for open, X for muted)
│       │   └── FretLabel (starting fret, e.g. "5fr")
│       └── VoicingSelector (pagination dots / mini tabs)
└── Footer
```

### Component Specifications

#### `App`
```typescript
// No props — root component
// State: wraps ChordProvider context
// Logic: renders layout shell, provides theme + chord context
```

#### `Header`
```typescript
interface HeaderProps {
  // none — reads theme from context
}
// Internal state: none
// Logic: renders logo, delegates theme toggle to ThemeToggle
```

#### `ThemeToggle`
```typescript
interface ThemeToggleProps {
  // none — reads/writes theme via context or local state
}
// Internal state: isDark: boolean (or from context)
// Logic: toggles `dark` class on <html>, persists to localStorage
```

#### `KeySelector`
```typescript
interface KeySelectorProps {
  selectedKey: Key;
  scaleType: ScaleType;
  onKeyChange: (key: Key) => void;
  onScaleTypeChange: (type: ScaleType) => void;
}
// Internal state: none (fully controlled)
// Logic: renders 12 key buttons in chromatic order, highlights selected,
//        toggles Major/Minor, fires callbacks on click
```

#### `KeyButton`
```typescript
interface KeyButtonProps {
  keyName: Key;
  isSelected: boolean;
  onClick: (key: Key) => void;
}
```

#### `FilterBar`
```typescript
interface FilterBarProps {
  activeFilters: ChordTypeFilter[];
  sortBy: SortOption;
  beginnerMode: boolean;
  onFilterChange: (filters: ChordTypeFilter[]) => void;
  onSortChange: (sort: SortOption) => void;
  onBeginnerModeChange: (enabled: boolean) => void;
}
// Internal state: none (controlled)
// Logic: chip toggle multi-select for chord types, dropdown for sort
```

#### `ChordGrid`
```typescript
interface ChordGridProps {
  chords: ChordData[];
}
// Internal state: none
// Logic: CSS grid layout, maps chords to ChordCards,
//        provides staggered animation delay index to each card
```

#### `ChordCard`
```typescript
interface ChordCardProps {
  chord: ChordData;
  index: number; // for staggered animation
}
// Internal state: selectedVoicingIndex: number (default 0)
// Logic: renders header + diagram + voicing selector,
//        manages which voicing is displayed
```

#### `ChordHeader`
```typescript
interface ChordHeaderProps {
  name: string;          // e.g. "Am7"
  romanNumeral: string;  // e.g. "vi7"
  difficulty: Difficulty;
}
```

#### `ChordDiagram` (SVG)
```typescript
interface ChordDiagramProps {
  voicing: ChordVoicing;
  width?: number;   // default 120
  height?: number;  // default 150
}
// Internal state: none
// Logic: calculates SVG positions, renders sub-components
//        (detailed in Section 3)
```

#### `FretboardGrid`
```typescript
interface FretboardGridProps {
  numStrings: number;  // 6
  numFrets: number;    // 4 (visible frets)
  dimensions: DiagramDimensions;
}
```

#### `FingerDots`
```typescript
interface FingerDotsProps {
  positions: FingerPosition[];
  dimensions: DiagramDimensions;
}
```

#### `BarreIndicator`
```typescript
interface BarreIndicatorProps {
  barres: Barre[];
  dimensions: DiagramDimensions;
}
```

#### `StringMarkers`
```typescript
interface StringMarkersProps {
  strings: (number | null)[]; // null = muted, 0 = open, >0 = fretted
  dimensions: DiagramDimensions;
}
```

#### `FretLabel`
```typescript
interface FretLabelProps {
  baseFret: number;
  dimensions: DiagramDimensions;
}
```

#### `VoicingSelector`
```typescript
interface VoicingSelectorProps {
  totalVoicings: number;
  selectedIndex: number;
  onSelect: (index: number) => void;
}
// Logic: renders clickable dots, one per voicing
```

---

## 2. TypeScript Type Definitions

```typescript
// ──── Musical Primitives ────

export type NoteName =
  | 'C' | 'C#' | 'Db' | 'D' | 'D#' | 'Eb'
  | 'E' | 'F' | 'F#' | 'Gb' | 'G' | 'G#' | 'Ab'
  | 'A' | 'A#' | 'Bb' | 'B';

/** Keys available in the selector (using sharps for sharp keys, flats for flat keys) */
export type Key =
  | 'C' | 'C#' | 'D' | 'Eb' | 'E' | 'F'
  | 'F#' | 'G' | 'Ab' | 'A' | 'Bb' | 'B';

export type ScaleType = 'major' | 'minor';

export type ChordQuality =
  | 'major' | 'minor' | 'diminished' | 'augmented'
  | 'dominant7' | 'major7' | 'minor7' | 'minor7b5'
  | 'diminished7' | 'sus2' | 'sus4' | 'add9'
  | 'dominant9' | 'power';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export type ChordTypeFilter = 'triad' | 'seventh' | 'extended' | 'sus' | 'power';

export type SortOption = 'scale-degree' | 'name' | 'difficulty';

// ──── Chord Voicing Data ────

/** Finger numbers: 0 = open, 1-4 = index through pinky, null = not played */
export type FingerNumber = 0 | 1 | 2 | 3 | 4 | null;

/**
 * String values: null = muted/not played, 0 = open, 1+ = fret number
 * Index 0 = low E (6th string), index 5 = high E (1st string)
 */
export type StringFret = number | null;

export interface Barre {
  fromString: number; // 0-indexed, low E = 0
  toString: number;   // 0-indexed
  fret: number;       // relative to baseFret
}

export interface ChordVoicing {
  strings: StringFret[];    // [lowE, A, D, G, B, highE]
  fingers: FingerNumber[];  // finger used for each string
  barres: Barre[];          // barre chord bars
  baseFret: number;         // 1 = open position, 2+ = higher position
}

// ──── Chord Data (used in grid) ────

export interface ChordData {
  name: string;              // "Am7"
  root: NoteName;
  quality: ChordQuality;
  romanNumeral: string;      // "vi7"
  scaleDegree: number;       // 1-7
  difficulty: Difficulty;
  chordType: ChordTypeFilter;
  voicings: ChordVoicing[];  // at least one
}

// ──── SVG Diagram Layout ────

export interface DiagramDimensions {
  svgWidth: number;
  svgHeight: number;
  gridLeft: number;      // x offset where fretboard starts
  gridTop: number;       // y offset (below string markers)
  gridRight: number;
  gridBottom: number;
  stringSpacing: number; // horizontal distance between strings
  fretSpacing: number;   // vertical distance between frets
  dotRadius: number;
  numStrings: number;
  numFrets: number;
}

export interface FingerPosition {
  string: number;  // 0 = low E, 5 = high E
  fret: number;    // 1-based relative fret
  finger: FingerNumber;
}

// ──── App State ────

export interface AppState {
  selectedKey: Key;
  scaleType: ScaleType;
  activeFilters: ChordTypeFilter[];
  sortBy: SortOption;
  beginnerMode: boolean;
  theme: 'light' | 'dark';
}

export type AppAction =
  | { type: 'SET_KEY'; payload: Key }
  | { type: 'SET_SCALE_TYPE'; payload: ScaleType }
  | { type: 'SET_FILTERS'; payload: ChordTypeFilter[] }
  | { type: 'SET_SORT'; payload: SortOption }
  | { type: 'TOGGLE_BEGINNER_MODE' }
  | { type: 'TOGGLE_THEME' };
```

---

## 3. SVG Chord Diagram Implementation

### Coordinate System & Dimensions

```
viewBox = "0 0 120 160"

Layout breakdown (top to bottom):
  0-20:   String markers zone (X/O symbols)
  20-22:  Nut (thick line for open position, thin line otherwise)
  22-142: Fretboard grid (4 frets, 30px each)
  142-160: Fret label zone ("5fr")

Layout breakdown (left to right):
  0-15:   Left padding (fret label area)
  15-115: 5 gaps for 6 strings, 20px spacing each
  115-120: Right padding
```

### Dimension Calculation

```typescript
export function calculateDimensions(
  width: number = 120,
  height: number = 160
): DiagramDimensions {
  const numStrings = 6;
  const numFrets = 4;
  const gridLeft = 15;
  const gridRight = width - 5;
  const gridTop = 24;
  const gridBottom = height - 18;
  const stringSpacing = (gridRight - gridLeft) / (numStrings - 1);
  const fretSpacing = (gridBottom - gridTop) / numFrets;

  return {
    svgWidth: width,
    svgHeight: height,
    gridLeft,
    gridTop,
    gridRight,
    gridBottom,
    stringSpacing,
    fretSpacing,
    dotRadius: stringSpacing * 0.35,
    numStrings,
    numFrets,
  };
}
```

### Position Calculation

```typescript
/** Get x position for a string (0 = low E on left, 5 = high E on right) */
function stringX(stringIndex: number, dims: DiagramDimensions): number {
  return dims.gridLeft + stringIndex * dims.stringSpacing;
}

/** Get y position for a fret dot (fret 1 = between nut and first fret wire) */
function fretY(fretNumber: number, dims: DiagramDimensions): number {
  return dims.gridTop + (fretNumber - 0.5) * dims.fretSpacing;
}
```

### ChordDiagram Component Skeleton

```tsx
export function ChordDiagram({ voicing, width = 120, height = 160 }: ChordDiagramProps) {
  const dims = useMemo(() => calculateDimensions(width, height), [width, height]);
  const isOpenPosition = voicing.baseFret === 1;

  // Extract finger positions from voicing data
  const fingerPositions: FingerPosition[] = voicing.strings
    .map((fret, stringIdx) => {
      if (fret === null || fret === 0) return null;
      return {
        string: stringIdx,
        fret: fret, // relative fret within the visible window
        finger: voicing.fingers[stringIdx],
      };
    })
    .filter(Boolean) as FingerPosition[];

  return (
    <svg
      viewBox={`0 0 ${dims.svgWidth} ${dims.svgHeight}`}
      className="w-full h-auto max-w-[120px]"
      role="img"
      aria-label={`Chord diagram`}
    >
      {/* String open/mute markers */}
      <StringMarkers strings={voicing.strings} dimensions={dims} />

      {/* Nut or position line */}
      {isOpenPosition ? (
        <line
          x1={dims.gridLeft} y1={dims.gridTop}
          x2={dims.gridRight} y2={dims.gridTop}
          stroke="currentColor" strokeWidth={3}
        />
      ) : (
        <FretLabel baseFret={voicing.baseFret} dimensions={dims} />
      )}

      {/* Fretboard grid */}
      <FretboardGrid numStrings={6} numFrets={4} dimensions={dims} />

      {/* Barre indicators (rendered below dots) */}
      <BarreIndicator barres={voicing.barres} dimensions={dims} />

      {/* Finger dots */}
      <FingerDots positions={fingerPositions} dimensions={dims} />
    </svg>
  );
}
```

### FretboardGrid Rendering

```tsx
function FretboardGrid({ numStrings, numFrets, dimensions: d }: FretboardGridProps) {
  return (
    <g className="fretboard-grid">
      {/* Vertical string lines */}
      {Array.from({ length: numStrings }, (_, i) => (
        <line
          key={`string-${i}`}
          x1={stringX(i, d)} y1={d.gridTop}
          x2={stringX(i, d)} y2={d.gridBottom}
          stroke="currentColor" strokeWidth={i === 0 ? 1.5 : 1}
          opacity={0.6}
        />
      ))}
      {/* Horizontal fret lines */}
      {Array.from({ length: numFrets + 1 }, (_, i) => (
        <line
          key={`fret-${i}`}
          x1={d.gridLeft} y1={d.gridTop + i * d.fretSpacing}
          x2={d.gridRight} y2={d.gridTop + i * d.fretSpacing}
          stroke="currentColor" strokeWidth={1}
          opacity={0.6}
        />
      ))}
    </g>
  );
}
```

### FingerDots Rendering

```tsx
function FingerDots({ positions, dimensions: d }: FingerDotsProps) {
  return (
    <g className="finger-dots">
      {positions.map((pos, i) => {
        const cx = stringX(pos.string, d);
        const cy = fretY(pos.fret, d);
        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r={d.dotRadius} fill="currentColor" />
            {pos.finger && pos.finger > 0 && (
              <text
                x={cx} y={cy}
                textAnchor="middle" dominantBaseline="central"
                fill="white" fontSize={d.dotRadius * 1.2}
                fontWeight="bold"
              >
                {pos.finger}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}
```

### BarreIndicator Rendering

```tsx
function BarreIndicator({ barres, dimensions: d }: BarreIndicatorProps) {
  return (
    <g className="barre-indicators">
      {barres.map((barre, i) => {
        const x1 = stringX(barre.fromString, d);
        const x2 = stringX(barre.toString, d);
        const y = fretY(barre.fret, d);
        const barWidth = Math.abs(x2 - x1);
        const barHeight = d.dotRadius * 1.8;
        return (
          <rect
            key={i}
            x={Math.min(x1, x2)}
            y={y - barHeight / 2}
            width={barWidth}
            height={barHeight}
            rx={barHeight / 2}
            fill="currentColor"
            opacity={0.85}
          />
        );
      })}
    </g>
  );
}
```

### StringMarkers Rendering

```tsx
function StringMarkers({ strings, dimensions: d }: StringMarkersProps) {
  const markerY = d.gridTop - 10;
  return (
    <g className="string-markers">
      {strings.map((fret, i) => {
        const x = stringX(i, d);
        if (fret === null) {
          // Muted: draw X
          const s = 4;
          return (
            <g key={i}>
              <line x1={x-s} y1={markerY-s} x2={x+s} y2={markerY+s}
                stroke="currentColor" strokeWidth={1.5} />
              <line x1={x+s} y1={markerY-s} x2={x-s} y2={markerY+s}
                stroke="currentColor" strokeWidth={1.5} />
            </g>
          );
        }
        if (fret === 0) {
          // Open: draw O
          return (
            <circle key={i} cx={x} cy={markerY} r={4}
              fill="none" stroke="currentColor" strokeWidth={1.5} />
          );
        }
        return null; // fretted strings have no marker above
      })}
    </g>
  );
}
```

### Responsive Scaling

The SVG uses a `viewBox` so it scales naturally. The container constrains it:

```tsx
<div className="w-full max-w-[120px] mx-auto">
  <ChordDiagram voicing={voicing} />
</div>
```

For different screen sizes, the `max-w` on the container can increase. The SVG maintains its aspect ratio automatically via `viewBox`.

---

## 4. Music Theory Utility Functions

### Constants

```typescript
const CHROMATIC_SHARP: NoteName[] = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
];

const CHROMATIC_FLAT: NoteName[] = [
  'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'
];

/** Keys that conventionally use flats */
const FLAT_KEYS: Key[] = ['F', 'Bb', 'Eb', 'Ab'];

/** Semitone intervals for scale types */
const SCALE_INTERVALS: Record<ScaleType, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],  // W-W-H-W-W-W-H
  minor: [0, 2, 3, 5, 7, 8, 10],  // W-H-W-W-H-W-W (natural minor)
};

/** Chord quality for each scale degree */
const DIATONIC_QUALITIES: Record<ScaleType, ChordQuality[]> = {
  major: ['major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished'],
  minor: ['minor', 'diminished', 'major', 'minor', 'minor', 'major', 'major'],
};

/** Seventh chord quality for each scale degree */
const DIATONIC_SEVENTH_QUALITIES: Record<ScaleType, ChordQuality[]> = {
  major: ['major7', 'minor7', 'minor7', 'major7', 'dominant7', 'minor7', 'minor7b5'],
  minor: ['minor7', 'minor7b5', 'major7', 'minor7', 'minor7', 'major7', 'dominant7'],
};

const ROMAN_NUMERALS_MAJOR = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
const ROMAN_NUMERALS_MINOR = ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'];

/** Quality suffix for display */
const QUALITY_SUFFIX: Record<ChordQuality, string> = {
  major: '',
  minor: 'm',
  diminished: 'dim',
  augmented: 'aug',
  dominant7: '7',
  major7: 'maj7',
  minor7: 'm7',
  minor7b5: 'm7b5',
  diminished7: 'dim7',
  sus2: 'sus2',
  sus4: 'sus4',
  add9: 'add9',
  dominant9: '9',
  power: '5',
};
```

### `getChordsForKey(key, scaleType)`

```typescript
export function getChordsForKey(key: Key, scaleType: ScaleType): ChordData[] {
  const useFlats = FLAT_KEYS.includes(key);
  const chromatic = useFlats ? CHROMATIC_FLAT : CHROMATIC_SHARP;
  const rootIndex = chromatic.indexOf(key);
  const intervals = SCALE_INTERVALS[scaleType];
  const triadQualities = DIATONIC_QUALITIES[scaleType];
  const seventhQualities = DIATONIC_SEVENTH_QUALITIES[scaleType];
  const romanNumerals = scaleType === 'major' ? ROMAN_NUMERALS_MAJOR : ROMAN_NUMERALS_MINOR;

  const chords: ChordData[] = [];

  for (let degree = 0; degree < 7; degree++) {
    const noteIndex = (rootIndex + intervals[degree]) % 12;
    const noteName = chromatic[noteIndex];
    const triadQuality = triadQualities[degree];
    const seventhQuality = seventhQualities[degree];

    // Triad
    const triadName = noteName + QUALITY_SUFFIX[triadQuality];
    chords.push({
      name: triadName,
      root: noteName,
      quality: triadQuality,
      romanNumeral: romanNumerals[degree],
      scaleDegree: degree + 1,
      difficulty: getDifficulty(triadName),
      chordType: 'triad',
      voicings: getChordVoicings(triadName),
    });

    // Seventh chord
    const seventhName = noteName + QUALITY_SUFFIX[seventhQuality];
    const romanSeventh = romanNumerals[degree] + '7';
    chords.push({
      name: seventhName,
      root: noteName,
      quality: seventhQuality,
      romanNumeral: romanSeventh,
      scaleDegree: degree + 1,
      difficulty: getDifficulty(seventhName),
      chordType: 'seventh',
      voicings: getChordVoicings(seventhName),
    });
  }

  return chords;
}
```

### `getChordVoicings(chordName)`

```typescript
import { CHORD_DATABASE } from '../data/chords';

export function getChordVoicings(chordName: string): ChordVoicing[] {
  const voicings = CHORD_DATABASE[chordName];
  if (!voicings || voicings.length === 0) {
    // Fallback: try to find via transposition from a known chord
    return findVoicingByTransposition(chordName) ?? [getPlaceholderVoicing()];
  }
  return voicings;
}
```

### `transposeChord(chord, semitones)`

```typescript
export function transposeChord(chordName: string, semitones: number): string {
  // Parse root note from chord name (handles sharps/flats)
  const match = chordName.match(/^([A-G][#b]?)(.*)/);
  if (!match) return chordName;

  const [, root, suffix] = match;
  const chromatic = CHROMATIC_SHARP;
  const rootIndex = chromatic.indexOf(root as NoteName);
  if (rootIndex === -1) {
    // Try flat chromatic
    const flatIndex = CHROMATIC_FLAT.indexOf(root as NoteName);
    if (flatIndex === -1) return chordName;
    const newIndex = ((flatIndex + semitones) % 12 + 12) % 12;
    return CHROMATIC_FLAT[newIndex] + suffix;
  }

  const newIndex = ((rootIndex + semitones) % 12 + 12) % 12;
  return chromatic[newIndex] + suffix;
}
```

### `getScaleDegree(key, note)`

```typescript
export function getScaleDegree(
  key: Key,
  scaleType: ScaleType,
  note: NoteName
): number | null {
  const useFlats = FLAT_KEYS.includes(key);
  const chromatic = useFlats ? CHROMATIC_FLAT : CHROMATIC_SHARP;
  const rootIndex = chromatic.indexOf(key);
  const noteIndex = chromatic.indexOf(note);
  if (rootIndex === -1 || noteIndex === -1) return null;

  const interval = ((noteIndex - rootIndex) % 12 + 12) % 12;
  const intervals = SCALE_INTERVALS[scaleType];
  const degree = intervals.indexOf(interval);
  return degree === -1 ? null : degree + 1;
}
```

### `getDifficulty(chordName)`

```typescript
const BEGINNER_CHORDS = new Set([
  'C', 'G', 'D', 'A', 'E', 'Am', 'Em', 'Dm',
]);
const INTERMEDIATE_CHORDS = new Set([
  'F', 'Bm', 'C7', 'G7', 'D7', 'A7', 'E7', 'Am7', 'Dm7', 'Em7',
]);

export function getDifficulty(chordName: string): Difficulty {
  if (BEGINNER_CHORDS.has(chordName)) return 'beginner';
  if (INTERMEDIATE_CHORDS.has(chordName)) return 'intermediate';
  return 'advanced';
}
```

---

## 5. Chord Data Structure (Sample Data)

```typescript
// data/chords.ts

export const CHORD_DATABASE: Record<string, ChordVoicing[]> = {

  // ──── Open Major Chords ────

  "C": [{
    strings: [null, 3, 2, 0, 1, 0],
    fingers: [null, 3, 2, 0, 1, 0],
    barres: [],
    baseFret: 1,
  }],

  "D": [{
    strings: [null, null, 0, 2, 3, 2],
    fingers: [null, null, 0, 1, 3, 2],
    barres: [],
    baseFret: 1,
  }],

  "E": [{
    strings: [0, 2, 2, 1, 0, 0],
    fingers: [0, 2, 3, 1, 0, 0],
    barres: [],
    baseFret: 1,
  }],

  "G": [{
    strings: [3, 2, 0, 0, 0, 3],
    fingers: [2, 1, 0, 0, 0, 3],
    barres: [],
    baseFret: 1,
  }],

  "A": [{
    strings: [null, 0, 2, 2, 2, 0],
    fingers: [null, 0, 1, 2, 3, 0],
    barres: [],
    baseFret: 1,
  }],

  "F": [{
    strings: [1, 3, 3, 2, 1, 1],
    fingers: [1, 3, 4, 2, 1, 1],
    barres: [{ fromString: 0, toString: 5, fret: 1 }],
    baseFret: 1,
  }, {
    // Simplified F (no barre)
    strings: [null, null, 3, 2, 1, 1],
    fingers: [null, null, 3, 2, 1, 1],
    barres: [],
    baseFret: 1,
  }],

  // ──── Open Minor Chords ────

  "Am": [{
    strings: [null, 0, 2, 2, 1, 0],
    fingers: [null, 0, 2, 3, 1, 0],
    barres: [],
    baseFret: 1,
  }],

  "Dm": [{
    strings: [null, null, 0, 2, 3, 1],
    fingers: [null, null, 0, 2, 3, 1],
    barres: [],
    baseFret: 1,
  }],

  "Em": [{
    strings: [0, 2, 2, 0, 0, 0],
    fingers: [0, 2, 3, 0, 0, 0],
    barres: [],
    baseFret: 1,
  }],

  // ──── Barre Chords ────

  "Bm": [{
    strings: [null, 2, 4, 4, 3, 2],
    fingers: [null, 1, 3, 4, 2, 1],
    barres: [{ fromString: 1, toString: 5, fret: 2 }],
    baseFret: 1,
  }],

  "F#m": [{
    strings: [2, 4, 4, 2, 2, 2],
    fingers: [1, 3, 4, 1, 1, 1],
    barres: [{ fromString: 0, toString: 5, fret: 2 }],
    baseFret: 1,
  }],

  // ──── Seventh Chords ────

  "G7": [{
    strings: [3, 2, 0, 0, 0, 1],
    fingers: [3, 2, 0, 0, 0, 1],
    barres: [],
    baseFret: 1,
  }],

  "C7": [{
    strings: [null, 3, 2, 3, 1, 0],
    fingers: [null, 3, 2, 4, 1, 0],
    barres: [],
    baseFret: 1,
  }],

  "D7": [{
    strings: [null, null, 0, 2, 1, 2],
    fingers: [null, null, 0, 2, 1, 3],
    barres: [],
    baseFret: 1,
  }],

  "A7": [{
    strings: [null, 0, 2, 0, 2, 0],
    fingers: [null, 0, 2, 0, 3, 0],
    barres: [],
    baseFret: 1,
  }],

  "E7": [{
    strings: [0, 2, 0, 1, 0, 0],
    fingers: [0, 2, 0, 1, 0, 0],
    barres: [],
    baseFret: 1,
  }],

  "Am7": [{
    strings: [null, 0, 2, 0, 1, 0],
    fingers: [null, 0, 2, 0, 1, 0],
    barres: [],
    baseFret: 1,
  }],

  "Dm7": [{
    strings: [null, null, 0, 2, 1, 1],
    fingers: [null, null, 0, 2, 1, 1],
    barres: [],
    baseFret: 1,
  }],

  "Em7": [{
    strings: [0, 2, 0, 0, 0, 0],
    fingers: [0, 2, 0, 0, 0, 0],
    barres: [],
    baseFret: 1,
  }],

  "Cmaj7": [{
    strings: [null, 3, 2, 0, 0, 0],
    fingers: [null, 3, 2, 0, 0, 0],
    barres: [],
    baseFret: 1,
  }],

  "Fmaj7": [{
    strings: [null, null, 3, 2, 1, 0],
    fingers: [null, null, 3, 2, 1, 0],
    barres: [],
    baseFret: 1,
  }],

  "Bdim": [{
    strings: [null, 2, 3, 4, 3, null],
    fingers: [null, 1, 2, 4, 3, null],
    barres: [],
    baseFret: 1,
  }],

  "Bm7b5": [{
    strings: [null, 2, 3, 2, 3, null],
    fingers: [null, 1, 3, 2, 4, null],
    barres: [],
    baseFret: 1,
  }],
};
```

---

## 6. State Management Design

### Context + useReducer Pattern

```typescript
// context/ChordContext.tsx

interface ChordState {
  selectedKey: Key;
  scaleType: ScaleType;
  activeFilters: ChordTypeFilter[];
  sortBy: SortOption;
  beginnerMode: boolean;
}

const initialState: ChordState = {
  selectedKey: 'C',
  scaleType: 'major',
  activeFilters: ['triad'], // show triads by default
  sortBy: 'scale-degree',
  beginnerMode: false,
};

function chordReducer(state: ChordState, action: AppAction): ChordState {
  switch (action.type) {
    case 'SET_KEY':
      return { ...state, selectedKey: action.payload };
    case 'SET_SCALE_TYPE':
      return { ...state, scaleType: action.payload };
    case 'SET_FILTERS':
      return { ...state, activeFilters: action.payload };
    case 'SET_SORT':
      return { ...state, sortBy: action.payload };
    case 'TOGGLE_BEGINNER_MODE':
      return { ...state, beginnerMode: !state.beginnerMode };
    default:
      return state;
  }
}

interface ChordContextValue {
  state: ChordState;
  dispatch: React.Dispatch<AppAction>;
  /** Derived: filtered and sorted chords for the current key */
  chords: ChordData[];
}

const ChordContext = createContext<ChordContextValue | null>(null);

export function ChordProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(chordReducer, initialState);

  const chords = useMemo(() => {
    let result = getChordsForKey(state.selectedKey, state.scaleType);

    // Filter by active chord type filters
    if (state.activeFilters.length > 0) {
      result = result.filter(c => state.activeFilters.includes(c.chordType));
    }

    // Beginner mode: only show beginner-difficulty chords
    if (state.beginnerMode) {
      result = result.filter(c => c.difficulty === 'beginner');
    }

    // Sort
    switch (state.sortBy) {
      case 'scale-degree':
        result.sort((a, b) => a.scaleDegree - b.scaleDegree);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'difficulty':
        const order: Record<Difficulty, number> = { beginner: 0, intermediate: 1, advanced: 2 };
        result.sort((a, b) => order[a.difficulty] - order[b.difficulty]);
        break;
    }

    return result;
  }, [state.selectedKey, state.scaleType, state.activeFilters, state.sortBy, state.beginnerMode]);

  return (
    <ChordContext.Provider value={{ state, dispatch, chords }}>
      {children}
    </ChordContext.Provider>
  );
}

export function useChordContext(): ChordContextValue {
  const ctx = useContext(ChordContext);
  if (!ctx) throw new Error('useChordContext must be used within ChordProvider');
  return ctx;
}
```

### Theme State (Separate)

```typescript
// hooks/useTheme.ts

export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return { isDark, toggle: () => setIsDark(prev => !prev) };
}
```

### State Flow Diagram

```
User clicks "G" key button
  -> KeySelector.onKeyChange("G")
    -> dispatch({ type: 'SET_KEY', payload: 'G' })
      -> chordReducer updates selectedKey to 'G'
        -> useMemo recalculates chords for key of G
          -> ChordGrid re-renders with new chord list
            -> Each ChordCard renders with new chord data
```

---

## 7. CSS / Animation Strategy

### Tailwind Configuration

```typescript
// tailwind.config.ts
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf4f0',
          100: '#fbe5db',
          200: '#f7c7b3',
          300: '#f0a080',
          400: '#e87550',
          500: '#dc5a2a', // primary
          600: '#c44a20',
          700: '#a33b1a',
          800: '#852f16',
          900: '#6c2613',
        },
      },
      animation: {
        'card-enter': 'cardEnter 0.35s ease-out forwards',
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        cardEnter: {
          '0%': { opacity: '0', transform: 'translateY(12px) scale(0.97)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
```

### Staggered Card Animation

```tsx
// In ChordGrid, pass index to each card:
{chords.map((chord, i) => (
  <ChordCard key={chord.name} chord={chord} index={i} />
))}

// In ChordCard:
function ChordCard({ chord, index }: ChordCardProps) {
  return (
    <div
      className="animate-card-enter opacity-0 bg-white dark:bg-gray-800
                 rounded-xl shadow-sm hover:shadow-md transition-shadow
                 border border-gray-200 dark:border-gray-700 p-4"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* ... */}
    </div>
  );
}
```

### Key Change Transition

When the key changes, the grid re-renders with new chords. Using a `key` prop on ChordGrid forces a re-mount, restarting animations:

```tsx
<ChordGrid key={`${state.selectedKey}-${state.scaleType}`} chords={chords} />
```

### Interactive States

```tsx
// KeyButton hover/active:
className={cn(
  "px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-150",
  isSelected
    ? "bg-brand-500 text-white shadow-md scale-105"
    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-95"
)}

// ChordCard hover:
className="... hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"

// Filter chip:
className={cn(
  "px-3 py-1 rounded-full text-sm transition-colors",
  isActive
    ? "bg-brand-500 text-white"
    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
)}
```

---

## 8. Testing Plan

### Unit Tests (Vitest)

```typescript
// __tests__/musicTheory.test.ts

describe('getChordsForKey', () => {
  it('returns 7 triads for C major', () => {
    const chords = getChordsForKey('C', 'major')
      .filter(c => c.chordType === 'triad');
    expect(chords).toHaveLength(7);
    expect(chords.map(c => c.name)).toEqual(['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim']);
  });

  it('returns correct qualities for A minor', () => {
    const chords = getChordsForKey('A', 'minor')
      .filter(c => c.chordType === 'triad');
    expect(chords[0]).toMatchObject({ name: 'Am', quality: 'minor' });
    expect(chords[2]).toMatchObject({ name: 'C', quality: 'major' });
  });

  it('handles flat keys correctly', () => {
    const chords = getChordsForKey('Bb', 'major')
      .filter(c => c.chordType === 'triad');
    expect(chords[0].name).toBe('Bb');
    expect(chords[3].name).toBe('Eb');
  });
});

describe('transposeChord', () => {
  it('transposes C up 7 semitones to G', () => {
    expect(transposeChord('C', 7)).toBe('G');
  });

  it('preserves quality suffix', () => {
    expect(transposeChord('Am7', 3)).toBe('Cm7');
  });

  it('wraps around octave', () => {
    expect(transposeChord('A', 5)).toBe('D');
  });
});

describe('getScaleDegree', () => {
  it('returns 1 for root note', () => {
    expect(getScaleDegree('C', 'major', 'C')).toBe(1);
  });

  it('returns 5 for dominant', () => {
    expect(getScaleDegree('C', 'major', 'G')).toBe(5);
  });

  it('returns null for non-diatonic note', () => {
    expect(getScaleDegree('C', 'major', 'C#')).toBeNull();
  });
});
```

### Component Tests (Vitest + React Testing Library)

```typescript
// __tests__/components/ChordDiagram.test.tsx

describe('ChordDiagram', () => {
  const cMajorVoicing: ChordVoicing = {
    strings: [null, 3, 2, 0, 1, 0],
    fingers: [null, 3, 2, 0, 1, 0],
    barres: [],
    baseFret: 1,
  };

  it('renders SVG element', () => {
    render(<ChordDiagram voicing={cMajorVoicing} />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('renders X marker for muted strings', () => {
    const { container } = render(<ChordDiagram voicing={cMajorVoicing} />);
    const markers = container.querySelectorAll('.string-markers line');
    // Low E is muted -> 2 lines forming an X
    expect(markers.length).toBeGreaterThanOrEqual(2);
  });

  it('renders O marker for open strings', () => {
    const { container } = render(<ChordDiagram voicing={cMajorVoicing} />);
    const openCircles = container.querySelectorAll('.string-markers circle');
    // D string (0) and high E (0) are open
    expect(openCircles.length).toBe(2);
  });

  it('renders thick nut line for open position chords', () => {
    const { container } = render(<ChordDiagram voicing={cMajorVoicing} />);
    const nutLine = container.querySelector('line[stroke-width="3"]');
    expect(nutLine).toBeInTheDocument();
  });

  it('renders barre for F chord', () => {
    const fVoicing: ChordVoicing = {
      strings: [1, 3, 3, 2, 1, 1],
      fingers: [1, 3, 4, 2, 1, 1],
      barres: [{ fromString: 0, toString: 5, fret: 1 }],
      baseFret: 1,
    };
    const { container } = render(<ChordDiagram voicing={fVoicing} />);
    const barreRect = container.querySelector('.barre-indicators rect');
    expect(barreRect).toBeInTheDocument();
  });
});

// __tests__/components/KeySelector.test.tsx

describe('KeySelector', () => {
  it('renders 12 key buttons', () => {
    render(
      <KeySelector
        selectedKey="C"
        scaleType="major"
        onKeyChange={vi.fn()}
        onScaleTypeChange={vi.fn()}
      />
    );
    const buttons = screen.getAllByRole('button');
    // 12 key buttons + Major/Minor toggle buttons
    expect(buttons.length).toBeGreaterThanOrEqual(12);
  });

  it('fires onKeyChange when a key is clicked', async () => {
    const onKeyChange = vi.fn();
    render(
      <KeySelector
        selectedKey="C"
        scaleType="major"
        onKeyChange={onKeyChange}
        onScaleTypeChange={vi.fn()}
      />
    );
    await userEvent.click(screen.getByText('G'));
    expect(onKeyChange).toHaveBeenCalledWith('G');
  });

  it('highlights the selected key', () => {
    render(
      <KeySelector
        selectedKey="A"
        scaleType="major"
        onKeyChange={vi.fn()}
        onScaleTypeChange={vi.fn()}
      />
    );
    const aButton = screen.getByText('A');
    expect(aButton.className).toContain('bg-brand');
  });
});
```

### Visual / Snapshot Tests

```typescript
// __tests__/visual/chordDiagrams.test.tsx
// Using Vitest snapshot or Storybook + Chromatic

describe('Chord Diagram Snapshots', () => {
  const testChords = ['C', 'Am', 'F', 'G', 'D', 'Em', 'Bm'];

  testChords.forEach(chordName => {
    it(`renders ${chordName} chord consistently`, () => {
      const voicing = CHORD_DATABASE[chordName]?.[0];
      if (!voicing) return;
      const { container } = render(<ChordDiagram voicing={voicing} />);
      expect(container.querySelector('svg')).toMatchSnapshot();
    });
  });
});
```

---

## 9. Implementation Phases

### Phase 1 — MVP (Core Functionality)

**Goal**: User can select a key and see the diatonic triads with chord diagrams.

**Deliverables**:
- Project scaffolding (Vite + React + TypeScript + Tailwind)
- Type definitions (`types.ts`)
- Chord data for all open-position major, minor, and common barre chords (~25 chords)
- Music theory utilities: `getChordsForKey`, `getChordVoicings`, `transposeChord`
- Components: `App`, `Header`, `KeySelector`, `ChordGrid`, `ChordCard`, `ChordDiagram` (with sub-components)
- State management: `ChordContext` with useReducer
- Basic responsive layout (mobile-first grid)
- Unit tests for music theory functions

### Phase 2 — Filtering, Voicings, Polish

**Goal**: Multiple voicings per chord, filtering, difficulty system.

**Deliverables**:
- Expanded chord database (7th chords, sus chords, extended chords, ~80+ entries)
- `VoicingSelector` component for switching between voicings
- `FilterBar` with chord type chips and sort dropdown
- Beginner mode toggle
- `DifficultyBadge` component
- Roman numeral display
- Component tests for all interactive components

### Phase 3 — Aesthetics, Dark Mode, Animations

**Goal**: Polished look and feel, dark mode, smooth transitions.

**Deliverables**:
- Dark/light theme toggle with `useTheme` hook and Tailwind `dark:` classes
- Staggered card entrance animations
- Key change transition (re-mount animation)
- Hover effects, active states, micro-interactions
- URL routing with React Router (`/key/C/major`, `/key/Am`)
- PWA manifest and service worker (basic offline support)
- Visual snapshot tests

### Phase 4 — Advanced Features

**Goal**: Audio, progressions, sharing (stretch goals).

**Deliverables**:
- Audio playback (Web Audio API or Tone.js to strum chord)
- Common chord progressions for each key
- Share button (URL-based state, copy to clipboard)
- Print-friendly view for chord sheets
- Accessibility audit (ARIA labels, keyboard navigation, screen reader testing)
- Performance optimization (virtualized grid for large chord sets)

---

## 10. Build Configuration

### Package Dependencies

```json
{
  "name": "guitarworld",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "format": "prettier --write \"src/**/*.{ts,tsx,css}\"",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^9.0.0",
    "eslint-plugin-react-hooks": "^5.0.0",
    "eslint-plugin-react-refresh": "^0.4.0",
    "globals": "^15.0.0",
    "jsdom": "^25.0.0",
    "postcss": "^8.4.0",
    "prettier": "^3.0.0",
    "prettier-plugin-tailwindcss": "^0.6.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.7.0",
    "typescript-eslint": "^8.0.0",
    "vite": "^6.0.0",
    "vitest": "^2.0.0"
  }
}
```

### Vite Config

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
});
```

### TypeScript Config

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "forceConsistentCasingInFileNames": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

### ESLint Config

```typescript
// eslint.config.js
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
);
```

### Prettier Config

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### Test Setup

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom/vitest';
```

---

## File / Folder Structure

```
guitarworld/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── App.tsx
│   │   ├── Header.tsx
│   │   ├── ThemeToggle.tsx
│   │   ├── KeySelector.tsx
│   │   ├── KeyButton.tsx
│   │   ├── FilterBar.tsx
│   │   ├── ChordGrid.tsx
│   │   ├── ChordCard.tsx
│   │   ├── ChordHeader.tsx
│   │   ├── ChordDiagram.tsx        # main SVG diagram
│   │   ├── FretboardGrid.tsx
│   │   ├── FingerDots.tsx
│   │   ├── BarreIndicator.tsx
│   │   ├── StringMarkers.tsx
│   │   ├── FretLabel.tsx
│   │   ├── VoicingSelector.tsx
│   │   ├── DifficultyBadge.tsx
│   │   └── Footer.tsx
│   ├── context/
│   │   └── ChordContext.tsx
│   ├── data/
│   │   └── chords.ts               # chord voicing database
│   ├── hooks/
│   │   └── useTheme.ts
│   ├── utils/
│   │   ├── musicTheory.ts          # getChordsForKey, transposeChord, etc.
│   │   ├── diagramLayout.ts        # calculateDimensions, stringX, fretY
│   │   └── constants.ts            # chromatic scales, intervals, roman numerals
│   ├── types/
│   │   └── index.ts                # all TypeScript type definitions
│   ├── test/
│   │   └── setup.ts
│   ├── __tests__/
│   │   ├── musicTheory.test.ts
│   │   ├── components/
│   │   │   ├── ChordDiagram.test.tsx
│   │   │   └── KeySelector.test.tsx
│   │   └── visual/
│   │       └── chordDiagrams.test.tsx
│   ├── index.css                    # Tailwind directives + global styles
│   └── main.tsx                     # React entry point
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── eslint.config.js
├── .prettierrc
├── package.json
└── README.md
```
