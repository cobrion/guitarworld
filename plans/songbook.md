# Songbook Feature - Implementation Plan

**Created by**: Explore Team (Brainstorm + Analysis)
**Date**: 2026-03-21
**Status**: Implemented (Phase 1-4 complete)

---

## 1. Problem Statement / Feature Description

GuitarWorld currently offers a Key Explorer (find chords in keys) and a Chord Analyzer (visualize voicings and transitions). What's missing is the ability to **apply this knowledge to actual songs**.

The Songbook feature adds a third tab where users can:
- **Build a personal songbook** by adding songs with lyrics and chords
- **Search and filter** their collection by title, artist, or key
- **View songs** in an innovative multi-mode viewer with harmonic analysis
- **Transpose** songs to any key with correct enharmonic handling
- **Practice** with interactive chord diagrams, fretboard visualization, and auto-scroll

### The Innovation: Harmonic Function Visualization

The standout feature is **harmonic function coloring** - every chord in the lyrics is color-coded by its role in the key:

| Function | Color | Examples in C |
|----------|-------|---------------|
| I (Tonic) | Green (`--hf-tonic`) | C, Cmaj7 |
| ii | Light blue (`--hf-supertonic`) | Dm, Dm7 |
| iii | Lavender (`--hf-mediant`) | Em, Em7 |
| IV (Subdominant) | Blue (`--hf-subdominant`) | F, Fmaj7 |
| V (Dominant) | Red/Orange (`--hf-dominant`) | G, G7 |
| vi | Purple (`--hf-submediant`) | Am, Am7 |
| vii° | Rose (`--hf-leading`) | Bdim, Bm7b5 |
| Non-diatonic | Amber (`--hf-nondiatonic`) | Bb, F#m, E7 |

Combined with a **Chord Timeline** (a horizontal bar showing the entire song's harmonic structure at a glance), this gives guitarists an immediate, intuitive understanding of how a song works harmonically.

### Three Viewing Modes

1. **Reading Mode** - Clean chord-over-lyrics display. Tap any chord for a floating diagram popup. Auto-scroll with adjustable speed.
2. **Practice Mode** - Full guitar neck at top showing the current chord voicing. Step chord-by-chord through the song. Transition analysis between consecutive chords.
3. **Performance Mode** - Maximized text, minimal chrome, dark background optimized for stage readability. Tap anywhere to advance sections.

---

## 2. Architectural Approach

### 2.1 Data Model

```typescript
// --- New types in src/types/index.ts ---

interface Song {
  id: string;                    // crypto.randomUUID()
  title: string;
  artist: string;
  key: Key;
  capo: number;                  // 0 = no capo
  tempo?: number;                // BPM (optional, for auto-scroll speed)
  sections: SongSection[];
  dateAdded: number;             // Date.now() timestamp
  lastViewed?: number;
  tags: string[];
}

interface SongSection {
  type: SectionType;
  label: string;                 // "Verse 1", "Chorus", "Bridge 2"
  lines: string[];               // Raw ChordPro format lines
}

type SectionType =
  | 'intro' | 'verse' | 'pre-chorus' | 'chorus'
  | 'bridge' | 'solo' | 'outro' | 'interlude';

// Parsed output from ChordPro lines
interface ParsedLine {
  segments: ChordLyricSegment[];
}

interface ChordLyricSegment {
  chord: string | null;          // null = no chord change at this position
  lyrics: string;                // lyrics text following this chord
}

// Chord with harmonic function info
interface AnalyzedChord {
  name: string;                  // "Am7"
  root: NoteName;
  suffix: string;                // "m7"
  scaleDegree: number | null;    // 1-7 or null if non-diatonic
  romanNumeral: string | null;   // "vi7" or null
  function: HarmonicFunction;
}

type HarmonicFunction =
  | 'tonic' | 'supertonic' | 'mediant' | 'subdominant'
  | 'dominant' | 'submediant' | 'leading' | 'nondiatonic';

type SongViewMode = 'reading' | 'practice' | 'performance';

type SongSortOption = 'title' | 'artist' | 'date-added' | 'last-viewed' | 'key';
```

### 2.2 State Management

A new `SongbookContext` (separate from `ChordContext`) manages:

```typescript
interface SongbookState {
  songs: Song[];
  activeSongId: string | null;
  viewMode: SongViewMode;
  transpose: number;             // semitones offset (0 = original key)
  capoAdjust: boolean;           // show capo-adjusted chord shapes?
  showNashville: boolean;        // Nashville Number System toggle
  autoScrollSpeed: number;       // 0 = off, 1-10 speed levels
  searchQuery: string;
  sortBy: SongSortOption;
  filterKey: Key | null;         // filter songbook by key
}

type SongbookAction =
  | { type: 'ADD_SONG'; payload: Song }
  | { type: 'UPDATE_SONG'; payload: Song }
  | { type: 'DELETE_SONG'; payload: string }           // song id
  | { type: 'SET_ACTIVE_SONG'; payload: string | null }
  | { type: 'SET_VIEW_MODE'; payload: SongViewMode }
  | { type: 'SET_TRANSPOSE'; payload: number }
  | { type: 'SET_CAPO_ADJUST'; payload: boolean }
  | { type: 'TOGGLE_NASHVILLE' }
  | { type: 'SET_AUTO_SCROLL_SPEED'; payload: number }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SORT'; payload: SongSortOption }
  | { type: 'SET_FILTER_KEY'; payload: Key | null }
  | { type: 'IMPORT_SONGS'; payload: Song[] }
  | { type: 'RETURN_TO_LIST' };
```

**Persistence**: `localStorage` key `guitarworld-songbook` for the songs array.

### 2.3 ChordPro Format

The standard for chord/lyric notation. Users paste or type text like:

```
{title: Wonderwall}
{artist: Oasis}
{key: F#m}
{capo: 2}

{section: Intro}
[Em7] [G] [Dsus4] [A7sus4]

{section: Verse 1}
[Em7]Today is gonna be the day that they're gonna [G]throw it back to [Dsus4]you[A7sus4]
[Em7]By now you shoulda somehow rea[G]lised what you gotta [Dsus4]do[A7sus4]
```

The parser handles:
- `{directive: value}` - metadata directives
- `[Chord]` - chord markers inline with lyrics
- `{section: Type Label}` - section markers
- Plain text lines - lyrics without chords
- Blank lines - section separators

### 2.4 Tab Integration

Extend `TabView` to `'explorer' | 'analyzer' | 'songbook'` and add the tab to `TabBar`.

### 2.5 Component Architecture

```
App.tsx
├── [activeTab === 'songbook']
│   └── SongbookView.tsx (router: list vs viewer)
│       ├── SongList.tsx (when no active song)
│       │   ├── SongSearchBar.tsx (search + key filter + sort)
│       │   ├── SongCard.tsx (per-song card)
│       │   └── SongEditor.tsx (modal: add/edit song)
│       │       ├── Song metadata fields
│       │       └── ChordPro textarea with preview
│       └── SongViewer.tsx (when active song selected)
│           ├── SongViewerHeader.tsx (back, title, transpose, mode toggle)
│           ├── ChordTimeline.tsx (horizontal harmonic overview)
│           ├── SectionNav.tsx (quick-jump section buttons)
│           ├── LyricsDisplay.tsx (chord-over-lyrics rendering)
│           │   └── ChordBadge.tsx (individual clickable chord)
│           ├── FloatingChordDiagram.tsx (popup on chord tap)
│           ├── PracticePanel.tsx (practice mode: neck + stepping)
│           └── AutoScrollBar.tsx (scroll speed control)
```

---

## 3. File-by-File Changes

### 3.1 Type Definitions

**File**: `src/types/index.ts`

**Changes**: Add all new types listed in section 2.1:
- `Song`, `SongSection`, `SectionType`
- `ParsedLine`, `ChordLyricSegment`
- `AnalyzedChord`, `HarmonicFunction`
- `SongViewMode`, `SongSortOption`
- Update `TabView` to include `'songbook'`

### 3.2 Utilities

#### `src/utils/chordpro.ts` (NEW)

ChordPro parser and serializer:

```typescript
/**
 * parseChordProLine(line: string): ParsedLine
 *
 * Input:  "[Em7]Today is gonna [G]be the day"
 * Output: {
 *   segments: [
 *     { chord: "Em7", lyrics: "Today is gonna " },
 *     { chord: "G",   lyrics: "be the day" }
 *   ]
 * }
 */
export function parseChordProLine(line: string): ParsedLine;

/**
 * parseChordProText(text: string): { metadata: Record<string, string>, sections: SongSection[] }
 *
 * Full document parser. Handles:
 * - {title: X}, {artist: X}, {key: X}, {capo: N} directives
 * - {section: Type Label} markers
 * - [Chord]lyrics inline notation
 * - Blank lines as section separators
 */
export function parseChordProText(text: string): {
  metadata: { title?: string; artist?: string; key?: string; capo?: string };
  sections: SongSection[];
};

/**
 * sectionsToChordPro(song: Song): string
 *
 * Serialize a Song back to ChordPro text format (for editing/export).
 */
export function sectionsToChordPro(song: Song): string;

/**
 * extractUniqueChords(sections: SongSection[]): string[]
 *
 * Extract all unique chord names from a song's sections.
 */
export function extractUniqueChords(sections: SongSection[]): string[];
```

**Parsing strategy**:
- Split text by lines
- Lines starting with `{` are directives: regex `/{(\w+):\s*(.+)}/`
- Chord markers: regex `/\[([^\]]+)\]/g`
- Split each line into segments by chord markers
- Handle edge cases: lines with only chords (no lyrics), lines with only lyrics (no chords)

#### `src/utils/transpose.ts` (NEW)

Chord transposition utilities:

```typescript
/**
 * parseChordName(name: string): { root: NoteName; suffix: string }
 *
 * "F#m7b5" → { root: "F#", suffix: "m7b5" }
 * "Bb"     → { root: "Bb", suffix: "" }
 * "Dbmaj7" → { root: "Db", suffix: "maj7" }
 *
 * Handles: single letter, letter+#, letter+b
 */
export function parseChordName(name: string): { root: NoteName; suffix: string };

/**
 * transposeChord(chordName: string, semitones: number, targetKey?: Key): string
 *
 * Transpose a chord name by N semitones.
 * Uses targetKey to determine sharp/flat preference.
 * "Am" + 2 semitones = "Bm"
 * "F#" + 1 semitone  = "G"
 * "Bb7" - 1 semitone = "A7"
 */
export function transposeChord(chordName: string, semitones: number, targetKey?: Key): string;

/**
 * getTransposedKey(originalKey: Key, semitones: number): Key
 *
 * Transpose a key by semitones, returning the conventional Key spelling.
 */
export function getTransposedKey(originalKey: Key, semitones: number): Key;

/**
 * getCapoEquivalent(originalKey: Key, capoFret: number): { playKey: Key; capo: number }
 *
 * Given a key and capo position, return the chord shapes to play.
 * Key of Bb with capo 3 → play in G shapes
 */
export function getCapoEquivalent(originalKey: Key, capoFret: number): Key;
```

#### `src/utils/harmonicAnalysis.ts` (NEW)

Harmonic function analysis:

```typescript
/**
 * analyzeChordInKey(chordName: string, key: Key, scaleType: ScaleType): AnalyzedChord
 *
 * Determine the harmonic function of a chord within a key.
 *
 * analyzeChordInKey("Am", "C", "major")
 * → { name: "Am", root: "A", suffix: "m", scaleDegree: 6,
 *     romanNumeral: "vi", function: "submediant" }
 *
 * analyzeChordInKey("Bb", "C", "major")
 * → { ..., scaleDegree: null, romanNumeral: null, function: "nondiatonic" }
 */
export function analyzeChordInKey(
  chordName: string,
  key: Key,
  scaleType?: ScaleType
): AnalyzedChord;

/**
 * getHarmonicFunctionColor(fn: HarmonicFunction): string
 *
 * Returns the CSS variable for the harmonic function color.
 */
export function getHarmonicFunctionColor(fn: HarmonicFunction): string;

/**
 * HARMONIC_FUNCTION_MAP: Record<number, HarmonicFunction>
 *
 * Scale degree → function name mapping.
 * 1 → 'tonic', 2 → 'supertonic', ..., 7 → 'leading'
 */
```

**Analysis strategy**:
1. Parse chord name → root + suffix
2. Get scale notes for the key
3. Check if root matches any scale degree (with enharmonic equivalence)
4. If match found, check if the chord quality matches the diatonic quality
5. Even if quality differs (e.g., E7 in key of C = dominant secondary), assign the degree based on root
6. If root is not in the scale → `nondiatonic`

#### `src/utils/musicTheory.ts` (MODIFY)

Add Nashville Number System helper:

```typescript
/**
 * chordToNashville(chordName: string, key: Key): string
 *
 * Convert a chord name to Nashville Number notation in the given key.
 * "Am" in key of C → "6m"
 * "G7" in key of C → "5-7" (or "57")
 * Non-diatonic → shows the number with accidental: "b7"
 */
export function chordToNashville(chordName: string, key: Key): string;
```

### 3.3 Context

#### `src/context/SongbookContext.tsx` (NEW)

Following the exact same pattern as `ChordContext.tsx`:

```typescript
// Reducer with all SongbookAction cases
// SongbookProvider wrapping children with context
// useSongbook() hook returning { state, dispatch, activeSong, filteredSongs }
// localStorage persistence for songs array
// Derived state:
//   - activeSong: Song | null (looked up from activeSongId)
//   - filteredSongs: Song[] (filtered by searchQuery + filterKey, sorted by sortBy)
```

**Persistence strategy**:
- Save songs array to `guitarworld-songbook` on every ADD/UPDATE/DELETE/IMPORT
- Load on mount with fallback to empty array
- Store viewMode, sortBy preferences in `guitarworld-songbook-prefs`
- Do NOT persist activeSongId or transpose (session-only state)

### 3.4 Components

#### `src/components/songbook/SongbookView.tsx` (NEW)

Top-level songbook router. Wraps content in `SongbookProvider`.

```
if activeSong === null → render <SongList />
if activeSong !== null → render <SongViewer song={activeSong} />
```

#### `src/components/songbook/SongList.tsx` (NEW)

**Layout**:
- Sticky search bar at top
- Grid of song cards (responsive: 1 col mobile, 2 cols tablet, 3 cols desktop)
- "Add Song" floating button (bottom-right on mobile, top-right on desktop)
- Empty state: illustration + "Add your first song" CTA

**Features**:
- Real-time search filtering (title + artist substring match)
- Key filter dropdown (show songs in a specific key)
- Sort selector (title A-Z, artist A-Z, newest, recently viewed)
- Displays total count: "12 songs" / "3 results"

#### `src/components/songbook/SongCard.tsx` (NEW)

**Layout**: Card with top color accent (based on song key's harmonic color).

```
┌─────────────────────────────┐
│ ████████████████████████████ │  ← key-colored accent bar
│ Song Title                  │
│ Artist Name                 │
│                             │
│ Key: G  │  Capo: 2  │  ♪ 4 │  ← key, capo, section count
│                             │
│ [View]            [Edit] [⋮]│  ← actions
└─────────────────────────────┘
```

- Click card or [View] → set active song, open viewer
- [Edit] → open editor modal
- [⋮] → dropdown: duplicate, export, delete (with confirm)

#### `src/components/songbook/SongEditor.tsx` (NEW)

**Layout**: Full-screen modal with two panels (side-by-side on desktop, tabbed on mobile).

**Left panel / Tab 1: Metadata**
- Title input (required)
- Artist input (required)
- Key selector (dropdown of ALL_KEYS)
- Capo selector (0-12)
- Tempo input (optional BPM)
- Tags input (comma-separated)

**Right panel / Tab 2: Lyrics & Chords**
- Large textarea accepting ChordPro format
- Syntax highlighting in the textarea:
  - `[Chord]` rendered in the primary color
  - `{directive}` rendered in muted color
  - Section headers bolded
- **Live preview** below/beside the textarea showing rendered chord-over-lyrics
- Helper buttons above textarea:
  - "Insert Chord" → opens chord picker, inserts `[ChordName]` at cursor
  - "Add Section" → inserts `{section: Verse 1}` template
  - "Paste from Clipboard" → pastes and auto-detects ChordPro format
  - "Format Help" → tooltip showing ChordPro syntax reference

**Bottom**: [Cancel] [Save] buttons

**On save**:
1. Parse ChordPro text via `parseChordProText()`
2. Extract metadata (title/artist/key override if specified in directives)
3. Create/update Song object
4. Dispatch ADD_SONG or UPDATE_SONG
5. Close modal

#### `src/components/songbook/SongViewer.tsx` (NEW)

**The innovative song viewing experience.** This is the centerpiece of the feature.

**Layout structure**:
```
┌──────────────────────────────────────────────────┐
│ ← Back   Song Title — Artist     [♯+][♭-] Key:G │  SongViewerHeader
│          [Reading] [Practice] [Performance]       │  Mode toggle
├──────────────────────────────────────────────────┤
│ ▓▓▓▓░░░░▓▓▓▓▓▓░░░░▓▓▓▓░░░░▓▓▓▓▓▓░░░░▓▓▓▓░░░░░ │  ChordTimeline
├──────────────────────────────────────────────────┤
│ [Intro] [Verse 1] [Chorus] [Verse 2] [Bridge]   │  SectionNav
├──────────────────────────────────────────────────┤
│                                                  │
│   Em7                G          Dsus4    A7sus4   │
│   Today is gonna be the day    that they're      │  LyricsDisplay
│   gonna throw it back to you                     │
│                                                  │
│   Em7                G          Dsus4    A7sus4   │
│   By now you shoulda somehow   realised what     │
│   you gotta do                                   │
│                                                  │
├──────────────────────────────────────────────────┤
│ Auto-scroll: [▶] ████████░░ Speed: 3             │  AutoScrollBar
└──────────────────────────────────────────────────┘
```

**In Practice Mode**, a panel appears above the lyrics:

```
┌──────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────┐ │
│  │  Guitar Neck showing current chord voicing  │ │  PracticePanel
│  │  (reuses GuitarNeck component)              │ │
│  └─────────────────────────────────────────────┘ │
│  [◀ Prev]  Em7 → G  [Next ▶]   Transition: Easy │
│             ↑ current chord                      │
├──────────────────────────────────────────────────┤
│  ... lyrics with current chord highlighted ...   │
└──────────────────────────────────────────────────┘
```

**In Performance Mode**, the chrome is minimized:

```
┌──────────────────────────────────────────────────┐
│  Wonderwall — Oasis                    Key: Em   │  Minimal header
│                                                  │
│                                                  │
│      Em7                G                        │
│      Today is gonna be the day that they're      │  Large text
│      gonna throw it back to you                  │
│                                                  │
│                      Verse 1                     │  Section label
│                                                  │
│                              tap anywhere to     │
│                              advance             │
└──────────────────────────────────────────────────┘
```

#### `src/components/songbook/SongViewerHeader.tsx` (NEW)

- Back button (returns to song list)
- Song title + artist
- Transpose controls: [b-] current key display [#+] with semitone counter
- Capo indicator: "Capo 2 (play Em shapes)"
- View mode toggle: three buttons (Reading / Practice / Performance)
- Overflow menu: Edit song, Nashville numbers toggle, Export

#### `src/components/songbook/ChordTimeline.tsx` (NEW)

**The bird's-eye harmonic overview bar.**

A horizontal bar at full width, divided into colored segments representing each chord in the song:

```
[I████][vi███][IV████][V████][I████][vi███][IV████][V████]
 intro          verse 1                    chorus
```

- Each segment width is proportional to the chord's duration (measured by lyric characters until next chord)
- Segments colored by harmonic function (tonic=green, dominant=red, etc.)
- Section boundaries marked with thin vertical lines and labels below
- Current scroll position shown as a vertical marker/cursor on the timeline
- Clicking a point on the timeline scrolls the lyrics to that position
- Renders as a thin SVG or CSS bar (32px height)

**Implementation**:
1. Flatten all sections into a linear sequence of chord events
2. Calculate proportional widths based on character counts
3. Map each chord to its harmonic function color
4. Track scroll position via IntersectionObserver on section elements
5. Render as a `<div>` with flex children, each with `flex-grow` proportional to duration

#### `src/components/songbook/SectionNav.tsx` (NEW)

Horizontal scrollable row of pill buttons, one per section:

```
[Intro] [Verse 1] [Chorus] [Verse 2] [Chorus] [Bridge] [Outro]
```

- Click → smooth scroll to that section in the lyrics
- Active section highlighted (tracked via IntersectionObserver)
- Sticky below the chord timeline

#### `src/components/songbook/LyricsDisplay.tsx` (NEW)

**The core rendering engine for chord-over-lyrics.**

For each section:
1. Render section header (type + label) with visual separator
2. For each line, parse ChordPro → segments
3. Render chord row above lyric row:

```html
<div class="lyrics-line">
  <div class="chord-row">
    <span class="chord" style="left: 0">Em7</span>
    <span class="chord" style="left: 180px">G</span>
  </div>
  <div class="lyric-row">
    Today is gonna be the day that they're gonna throw it back to you
  </div>
</div>
```

**Chord positioning**: Use `ch` units or character-count-based positioning. Each chord is absolutely positioned above the lyric character where it appears.

**Harmonic function coloring**: Each chord badge gets a colored underline/background based on `analyzeChordInKey()`.

**Interactivity**:
- Tap/click a chord → show `FloatingChordDiagram`
- In Nashville mode → show numbers instead of chord names
- In transposed mode → show transposed chord names
- Current chord in Practice mode gets a highlight ring

**Responsive**:
- Desktop: comfortable font size, wide layout
- Mobile: slightly smaller, horizontal scroll if lines are very long
- Performance mode: larger font (1.5x)

#### `src/components/songbook/ChordBadge.tsx` (NEW)

Individual chord marker above lyrics:

```
┌──────┐
│ Am7  │  ← colored by harmonic function
└──┬───┘
   │      ← thin line connecting to lyric position
```

- Background color = harmonic function color (subtle tint)
- Text color = harmonic function color (full saturation)
- Bottom border = thicker accent in function color
- On hover/tap: shows tooltip with function name ("vi7 - submediant")
- On click: opens floating chord diagram

#### `src/components/songbook/FloatingChordDiagram.tsx` (NEW)

A popup that appears when tapping a chord in the lyrics:

```
┌────────────────────────┐
│  Am7 (vi7)             │
│  ┌──────────────────┐  │
│  │  Chord Diagram   │  │  ← reuses ChordDiagram component
│  │  (SVG fretboard) │  │
│  └──────────────────┘  │
│  Voicing: 1/3  [◀] [▶] │  ← voicing navigation
│  [View in Analyzer →]  │  ← deep link to Chord Analyzer
└────────────────────────┘
```

- Positioned near the tapped chord (above on mobile, beside on desktop)
- Uses existing `ChordDiagram` component
- `lookupChord()` to find voicings in the database
- Voicing navigation (multiple voicings per chord)
- "View in Analyzer" link: sets analyzer chord and switches tab
- Dismiss: click outside, tap another chord, or press Escape
- Rendered via React portal to avoid overflow clipping

#### `src/components/songbook/PracticePanel.tsx` (NEW)

Appears in Practice Mode above the lyrics display:

- Full-width `GuitarNeck` component showing current chord voicing
- Current chord name + roman numeral display
- Previous / Next chord buttons (steps through all chords in song order)
- Transition difficulty badge between current and next chord
- Optional: `TransitionInfo` component showing string-by-string breakdown
- Keyboard shortcuts: left/right arrow keys to step chords

**State**: Tracks `currentChordIndex` in the flattened chord sequence.

#### `src/components/songbook/AutoScrollBar.tsx` (NEW)

Fixed bar at the bottom of the viewer:

```
[▶ Play] ████████░░░░ Speed: 3/10   [↑ Faster] [↓ Slower]
```

- Play/Pause toggle
- Speed slider (1-10, default 3)
- Uses `requestAnimationFrame` + `window.scrollBy()` for smooth scrolling
- Speed maps to pixels-per-frame
- Pauses when user manually scrolls (resumes after 3s of no touch)
- Keyboard shortcut: Space to play/pause

### 3.5 Existing File Modifications

#### `src/types/index.ts` (MODIFY)
- Add all new types from section 2.1
- Update `TabView` to `'explorer' | 'analyzer' | 'songbook'`

#### `src/components/App.tsx` (MODIFY)
- Import `SongbookView`
- Add `SongbookProvider` wrapper (inside `ChordProvider`)
- Add `activeTab === 'songbook'` branch rendering `<SongbookView />`

#### `src/components/TabBar.tsx` (MODIFY)
- Add "Songbook" tab button (third tab)
- Tab icon/label: "Songbook" with a music note or book icon

#### `src/index.css` (MODIFY)
- Add harmonic function color variables (both dark and light themes):
  ```css
  --hf-tonic: #5ECE7B;
  --hf-supertonic: #7BA4C4;
  --hf-mediant: #A78BCA;
  --hf-subdominant: #4EAAED;
  --hf-dominant: #F05D3E;
  --hf-submediant: #C77DBA;
  --hf-leading: #E88B9E;
  --hf-nondiatonic: #E09455;
  --hf-tonic-bg: rgba(94, 206, 123, 0.15);
  --hf-dominant-bg: rgba(240, 93, 62, 0.15);
  /* ... bg variants for all functions */
  ```
- Add songbook-specific variables:
  ```css
  --songbook-chord-font: 'JetBrains Mono';
  --songbook-lyric-size: 1rem;
  --songbook-chord-size: 0.8125rem;
  --songbook-performance-lyric-size: 1.5rem;
  ```
- Add auto-scroll animation keyframe
- Add `.chord-badge` hover/active styles

### 3.6 New File Summary

| File | Type | Lines (est.) | Description |
|------|------|-------------|-------------|
| `src/utils/chordpro.ts` | Utility | ~120 | ChordPro parser & serializer |
| `src/utils/transpose.ts` | Utility | ~80 | Chord transposition functions |
| `src/utils/harmonicAnalysis.ts` | Utility | ~100 | Harmonic function analysis |
| `src/context/SongbookContext.tsx` | Context | ~150 | State management + persistence |
| `src/components/songbook/SongbookView.tsx` | Component | ~40 | Top-level router |
| `src/components/songbook/SongList.tsx` | Component | ~150 | Song collection list |
| `src/components/songbook/SongCard.tsx` | Component | ~80 | Individual song card |
| `src/components/songbook/SongEditor.tsx` | Component | ~250 | Add/edit song modal |
| `src/components/songbook/SongViewer.tsx` | Component | ~200 | Main viewer orchestrator |
| `src/components/songbook/SongViewerHeader.tsx` | Component | ~120 | Viewer header + controls |
| `src/components/songbook/ChordTimeline.tsx` | Component | ~150 | Harmonic overview bar |
| `src/components/songbook/SectionNav.tsx` | Component | ~60 | Section jump buttons |
| `src/components/songbook/LyricsDisplay.tsx` | Component | ~200 | Chord-over-lyrics renderer |
| `src/components/songbook/ChordBadge.tsx` | Component | ~70 | Clickable chord marker |
| `src/components/songbook/FloatingChordDiagram.tsx` | Component | ~100 | Chord diagram popup |
| `src/components/songbook/PracticePanel.tsx` | Component | ~150 | Practice mode fretboard |
| `src/components/songbook/AutoScrollBar.tsx` | Component | ~100 | Auto-scroll control |

**Total new code**: ~2,120 lines across 17 new files
**Modified files**: 4 existing files

---

## 4. Music Theory Considerations

### 4.1 Transposition Accuracy

- **Enharmonic correctness**: When transposing from a sharp key to a flat key, chord names must switch. E.g., transposing F# up 1 → G (not Gb). Use `SHARP_KEYS`/`FLAT_KEYS` sets from constants.ts.
- **Suffix preservation**: Only the root transposes. `Cmaj7` + 2 = `Dmaj7`, never `D7` or `Dmaj`.
- **Double-sharp/flat avoidance**: Never produce `C##` or `Dbb`. Use enharmonic equivalents.
- **Bass notes**: Slash chords like `C/E` must transpose both parts: `C/E` + 2 = `D/F#`.

### 4.2 Harmonic Analysis Edge Cases

- **Secondary dominants**: `E7` in key of C is V/vi (dominant of the relative minor). Show as degree 3 but flagged as altered (major instead of expected minor).
- **Borrowed chords**: `Bb` in key of C (from C minor / modal mixture). Show as `bVII` with `nondiatonic` function.
- **Slash chords**: Analyze based on the root chord, ignore bass note for function.
- **Add/sus chords**: Analyze based on root only. `Csus4` in key of C = tonic.
- **Enharmonic matching**: `Db` chord in key of C# should match (same pitch class).

### 4.3 Nashville Number System

- Standard notation: degree number + quality suffix
- `C` in C = `1`, `Dm` in C = `2m`, `G7` in C = `57`
- Non-diatonic: use accidentals: `Bb` in C = `b7`, `F#m` in C = `#4m`
- Slash chords: `C/E` in C = `1/3`

### 4.4 Capo Logic

- Capo on fret N means the guitar sounds N semitones higher
- If song is in Bb and capo is on fret 3, player sees G-shaped chords
- Formula: `playKey = originalKey - capo` (subtract semitones)
- Display: "Capo 3 — play in G" with chord names shown as G-shape equivalents

---

## 5. Testing Strategy

### 5.1 Unit Tests (utilities)

**ChordPro Parser**:
- Basic line: `[Am]Hello [G]world` → correct segments
- Line with no chords: `Just lyrics` → single segment with null chord
- Line with only chords: `[Am] [G] [C]` → three segments with empty lyrics
- Directives: `{title: My Song}` → correct metadata extraction
- Edge cases: empty brackets `[]`, nested brackets `[[Am]]`, special characters
- Section markers: `{section: Verse 1}` → correct SongSection type and label
- Round-trip: parse → serialize → parse produces identical output

**Transposition**:
- Basic: `transposeChord("Am", 2)` = `"Bm"`
- Sharps: `transposeChord("F#", 1)` = `"G"`
- Flats: `transposeChord("Bb", -1)` = `"A"`
- Complex: `transposeChord("Dbmaj7", 1)` = `"Dmaj7"`
- Identity: `transposeChord("C", 0)` = `"C"`
- Full circle: `transposeChord("C", 12)` = `"C"`
- Slash chords: `transposeChord("C/E", 2)` = `"D/F#"`

**Harmonic Analysis**:
- Diatonic: `analyzeChordInKey("Am", "C")` → degree 6, submediant
- Non-diatonic: `analyzeChordInKey("Bb", "C")` → nondiatonic
- With suffix: `analyzeChordInKey("G7", "C")` → degree 5, dominant
- Enharmonic: `analyzeChordInKey("Db", "C#")` → degree 1, tonic
- All 7 degrees in all 12 keys (84 test cases)

**Nashville Numbers**:
- `chordToNashville("G", "C")` = `"5"`
- `chordToNashville("Am7", "C")` = `"6m7"`
- `chordToNashville("Bb", "C")` = `"b7"`

### 5.2 Integration Tests (components)

- **SongEditor → SongList**: Add song via editor, verify it appears in list
- **SongList → SongViewer**: Click song card, verify viewer opens with correct data
- **Transpose flow**: Change transpose in header, verify all chords in lyrics update
- **Chord tap → FloatingDiagram**: Tap chord badge, verify diagram appears with correct voicing
- **Practice mode stepping**: Step through chords, verify neck updates and lyrics highlight
- **ChordTimeline sync**: Scroll lyrics, verify timeline cursor moves
- **Deep link to Analyzer**: Click "View in Analyzer" in floating diagram, verify tab switches with correct chord loaded
- **Persistence**: Add songs, refresh page, verify songs persist from localStorage

### 5.3 Regression Tests

- **Key Explorer**: Verify all existing functionality unchanged (filters, transpose, expand rows, major + minor sections)
- **Chord Analyzer**: Verify chord selection, voicing comparison, transition analysis unchanged
- **Tab switching**: All three tabs switch cleanly, state preserved
- **Theme**: Dark/light mode works correctly with new harmonic function colors
- **Responsive**: All three songbook views (list, editor, viewer) work on mobile, tablet, desktop
- **Performance**: Songbook with 50+ songs doesn't cause lag in list rendering

---

## 6. Risk Assessment

### 6.1 High Priority Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **localStorage size limit** (~5MB) | Songs with many voicings could hit limit | Store only song data, not voicing data (voicings live in chord database). Monitor storage usage, warn user when approaching limit. |
| **ChordPro parsing edge cases** | Malformed input could crash parser | Defensive parsing with try/catch. Show raw text fallback if parsing fails. Validate on save. |
| **Chord lookup misses** | Song chords may not exist in our database | Graceful fallback: show chord name without diagram. "No voicing available" message. Don't crash. |
| **Performance with many songs** | List rendering could lag | Virtualize song list with `useMemo`. Debounce search input (300ms). Paginate if > 100 songs. |

### 6.2 Medium Priority Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Enharmonic mismatches** | `Gb` chord in database but song uses `F#` | Enharmonic fallback already exists in `lookupChord()`. Apply same logic in harmonic analysis. |
| **Auto-scroll UX** | User interaction conflicts with auto-scroll | Pause on manual scroll, resume after idle timeout. Clear play/pause state. |
| **Large chord sheet rendering** | Long songs could be slow to render | Lazy render sections (only render visible + 1 screen ahead). Use IntersectionObserver. |
| **Mobile text overflow** | Long chord names over short lyrics | Allow chord names to overlap. Use `white-space: nowrap` with `overflow: visible`. |

### 6.3 Low Priority Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Theme contrast** | Harmonic function colors may not be accessible in both themes | Test all 8 function colors against both dark and light backgrounds. Ensure 4.5:1 contrast ratio. |
| **Tab bar overflow** | Three tabs may crowd on small screens | Use icon-only mode on mobile (book icon for songbook). |
| **Nashville number unfamiliarity** | Most casual players won't know Nashville system | Default off, clearly labeled as advanced option. Include tooltip explanation. |

---

## 7. Implementation Order

Recommended build sequence for the Implementation Team:

### Phase 1: Foundation (utilities + context + types)
1. Add types to `src/types/index.ts`
2. Build `src/utils/chordpro.ts` (parser)
3. Build `src/utils/transpose.ts` (transposition)
4. Build `src/utils/harmonicAnalysis.ts` (harmonic functions)
5. Build `src/context/SongbookContext.tsx` (state + persistence)

### Phase 2: Song Management (list + editor)
6. Create `src/components/songbook/SongbookView.tsx` (router shell)
7. Build `src/components/songbook/SongCard.tsx`
8. Build `src/components/songbook/SongList.tsx` (search + filter + sort)
9. Build `src/components/songbook/SongEditor.tsx` (add/edit modal)
10. Modify `App.tsx` and `TabBar.tsx` to add Songbook tab
11. Add CSS variables to `src/index.css`

### Phase 3: Song Viewer - Reading Mode
12. Build `src/components/songbook/ChordBadge.tsx`
13. Build `src/components/songbook/LyricsDisplay.tsx`
14. Build `src/components/songbook/SongViewerHeader.tsx` (with transpose)
15. Build `src/components/songbook/SectionNav.tsx`
16. Build `src/components/songbook/ChordTimeline.tsx`
17. Build `src/components/songbook/FloatingChordDiagram.tsx`
18. Build `src/components/songbook/SongViewer.tsx` (orchestrator)

### Phase 4: Practice + Performance Modes
19. Build `src/components/songbook/PracticePanel.tsx`
20. Build `src/components/songbook/AutoScrollBar.tsx`
21. Add Performance Mode styling to SongViewer
22. Add Nashville Number System toggle

### Phase 5: Polish
23. Empty states, loading states, error boundaries
24. Responsive fine-tuning (mobile card layouts, touch targets)
25. Keyboard shortcuts (arrows for practice, space for scroll)
26. Import/Export functionality (JSON download/upload)
27. Accessibility audit (ARIA labels, focus management, screen reader)

---

## 8. Sample Song Data (for testing)

```
{title: Wonderwall}
{artist: Oasis}
{key: F#m}
{capo: 2}

{section: Intro}
[Em7] [G] [Dsus4] [A7sus4]

{section: Verse 1}
[Em7]Today is gonna be the day that they're gonna [G]throw it back to [Dsus4]you[A7sus4]
[Em7]By now you shoulda somehow rea[G]lised what you gotta [Dsus4]do[A7sus4]
[Em7]I don't believe that any[G]body feels the way I [Dsus4]do about you [A7sus4]now

{section: Pre-Chorus}
[C]And all the roads we [D]have to walk are [Em7]winding
[C]And all the lights that [D]lead us there are [Em7]blinding

{section: Chorus}
[C]And [D]maybe[Em7]  you're gonna be the one that [G]saves me
[C]And [D]after [Em7]all  you're my wonder[G]wall
```

```
{title: Horse With No Name}
{artist: America}
{key: Em}

{section: Verse 1}
[Em]On the first part of the [D6/9]journey
[Em]I was looking at all the [D6/9]life
[Em]There were plants and birds and [D6/9]rocks and things
[Em]There was sand and hills and [D6/9]rings

{section: Chorus}
[Em]I've been through the desert on a [D6/9]horse with no name
It felt [Em]good to be out of the [D6/9]rain
In the [Em]desert you can't remember your [D6/9]name
'Cause there ain't [Em]no one for to give you no [D6/9]pain
```

---

*Plan authored by the GuitarWorld Explore Team. Ready for Implementation Team pickup.*
