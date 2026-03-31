# Visual Chord Editor - Implementation Plan

**Created by**: Explore Team (Brainstorm + Analysis)
**Date**: 2026-03-21
**Status**: Implemented

---

## 1. Problem Statement

Currently, adding chords to lyrics requires manually typing ChordPro notation (`[Am]Hello [G]world`) in a text editor. This is error-prone, requires memorizing chord names, and gives no visual feedback on harmonic function. Users need an intuitive way to **click above a word** and **select a chord from a key-aware palette**.

## 2. The Innovation: "Tap-to-Chord" Visual Editor

A visual editing experience where:
1. **Key selector** at the top drives the available chord palette
2. **Lyrics rendered as word slots** - each word is a clickable target
3. **Click above a word** → chord picker dropdown appears with chords organized by scale degree
4. **Chords color-coded** by harmonic function (tonic=green, dominant=red, etc.)
5. **Quick chord bar** - 7 diatonic triads always visible for one-click placement
6. **Click existing chord badge** → edit or remove it
7. **Two editor modes**: "Visual" (default) and "ChordPro" (text) - synced through same state

### Layout

```
┌──────────────────────────────────────────────────────┐
│ Key: [C ▼]   Scale: [Major ▼]                        │
├──────────────────────────────────────────────────────┤
│ I       ii      iii     IV      V       vi     vii°  │
│ [C]     [Dm]    [Em]    [F]     [G]     [Am]   [Bdim]│ Quick Chord Bar
│ green   ltblue  lav     blue    red     purple rose   │ (harmonic colors)
├──────────────────────────────────────────────────────┤
│ [Visual]  [ChordPro]                 editor mode tabs │
├──────────────────────────────────────────────────────┤
│                                                      │
│ ── Verse 1 ──────────────────────────────────────    │
│                                                      │
│  Am           G              C           F           │ chord row
│  Hello world, this    is  a  song today  and I'm     │ lyrics row
│                                                      │
│        +      +       +   +  +     +     +    +      │ (invisible "+" zones)
│                                                      │
│  Dm           G              Am                      │
│  And now I'm  singing along  forever                 │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Chord Picker Dropdown (on click above a word)

```
┌─────────────────────────┐
│  ♦ Diatonic Triads      │
│  I    C        ■ green  │
│  ii   Dm       ■ blue   │
│  iii  Em       ■ lav    │
│  IV   F        ■ blue   │
│  V    G        ■ red    │
│  vi   Am       ■ purple │ ← currently selected (highlighted)
│  vii° Bdim     ■ rose   │
│  ───────────────────    │
│  ♦ 7th Chords          │
│  Cmaj7  Dm7  Em7  ...  │
│  ───────────────────    │
│  ♦ Sus / Power          │
│  Csus2  Csus4  C5  ... │
│  ───────────────────    │
│  Custom: [________]     │
│  ───────────────────    │
│  ✕ Remove chord         │ ← only if editing existing
└─────────────────────────┘
```

---

## 3. Data Model

### Word-Level Representation

```typescript
/** A single word in the visual editor, with optional chord above it */
interface EditorWord {
  text: string;           // The word itself
  chord: string | null;   // Chord above this word (null = no chord)
  trailing: string;       // Trailing whitespace (to preserve spacing)
}
```

### Conversion Pipeline

```
ChordPro text line:  "[Am]Hello [G]world [C]today"
        ↓ chordProLineToWords()
EditorWord[]:
  [
    { text: "Hello", chord: "Am", trailing: " " },
    { text: "world", chord: "G",  trailing: " " },
    { text: "today", chord: "C",  trailing: "" },
  ]
        ↓ wordsToChordProLine()
ChordPro text line:  "[Am]Hello [G]world [C]today"
```

### Chord-Only Lines (no lyrics)

For lines like `[Em7] [G] [Dsus4]` (intro/outro chords):
- Parsed as words with empty text and the chord
- Visual editor shows a special "chord-only" row with just badges
- User can add more chords to this row

---

## 4. Component Architecture

```
SongEditor (existing - modified)
├── EditorModeToggle ("Visual" | "ChordPro")
├── [mode === 'visual']
│   └── VisualChordEditor (NEW)
│       ├── ChordEditorKeyBar (key + scale + quick chords)
│       ├── ChordEditorSection (per section)
│       │   ├── SectionHeader (editable label)
│       │   └── ChordEditorLine (per line)
│       │       └── WordSlot (per word)
│       │           ├── ChordSlot (clickable zone above word)
│       │           │   ├── ChordBadge (if chord exists)
│       │           │   └── AddChordZone (if no chord - "+" on hover)
│       │           └── WordText (the word)
│       └── ChordPickerDropdown (floating, positioned near click)
├── [mode === 'chordpro']
│   └── Textarea (existing ChordPro text editor)
└── Preview (existing live preview)
```

---

## 5. File-by-File Changes

### 5.1 New Utility Functions

**File**: `src/utils/chordpro.ts` (MODIFY - add word-level functions)

```typescript
/**
 * Convert a ChordPro line to word-level representation.
 *
 * "[Am]Hello [G]world [C]today"
 * → [
 *     { text: "Hello", chord: "Am", trailing: " " },
 *     { text: "world", chord: "G",  trailing: " " },
 *     { text: "today", chord: "C",  trailing: "" },
 *   ]
 *
 * Handles:
 * - Multiple chords on one word (last one wins)
 * - Mid-word chords (attached to start of word)
 * - Chord-only lines (words with empty text)
 * - Lines with no chords (words with null chord)
 */
export function chordProLineToWords(line: string): EditorWord[];

/**
 * Convert word-level representation back to a ChordPro line.
 *
 * [{ text: "Hello", chord: "Am", trailing: " " }, ...]
 * → "[Am]Hello [G]world [C]today"
 */
export function wordsToChordProLine(words: EditorWord[]): string;
```

**Algorithm for `chordProLineToWords()`:**

1. Strip all chord markers, collecting their positions and names: `{ position: number, chord: string }[]`
2. Build a plain lyrics string (without markers)
3. Split the plain lyrics into words (preserving trailing whitespace for each)
4. For each word, find if any chord marker falls within the word's character range
5. If yes, assign that chord to the word
6. If no words exist but chords do, create chord-only entries

**Algorithm for `wordsToChordProLine()`:**

1. For each word:
   - If chord exists: `[chord]` + text + trailing
   - If no chord: text + trailing
2. Join all parts

### 5.2 New Components

#### `src/components/songbook/VisualChordEditor.tsx` (NEW)

The main visual editor component. Takes `chordProText` and `onChange` as props (controlled component, syncs with the existing state).

**Props:**
```typescript
interface VisualChordEditorProps {
  chordProText: string;
  onChange: (text: string) => void;
  songKey: Key;
  onKeyChange: (key: Key) => void;
}
```

**Responsibilities:**
- Parse `chordProText` via `parseChordProText()` to get sections
- For each section, parse each line via `chordProLineToWords()`
- Render the visual editor grid
- Handle chord placement/editing
- Serialize changes back to ChordPro text via `wordsToChordProLine()` and `sectionsToChordPro()`
- Sync `onChange` on every chord edit

#### `src/components/songbook/ChordEditorKeyBar.tsx` (NEW)

Key selector + quick chord palette.

**Layout:**
```
Key: [C ▼]  Scale: [Major ▼]
┌───┬───┬───┬───┬───┬───┬────┐
│ C │Dm │Em │ F │ G │Am │Bdim│  ← 7 diatonic triads
│ I │ii │iii│IV │ V │vi │vii°│  ← roman numerals
└───┴───┴───┴───┴───┴───┴────┘
```

**Features:**
- Key dropdown (ALL_KEYS)
- Scale type toggle (major/minor)
- 7 buttons showing diatonic triads for the selected key
- Each button colored by harmonic function
- Click a button → enters "chord placement mode" with that chord selected
- Then click on any word slot to place it

**Implementation:**
- Uses `getChordsForKey(key, scaleType)` to get diatonic triads
- Filters to `chordType === 'triad'` and `quality in (major, minor, diminished)`
- Displays chord name + roman numeral

#### `src/components/songbook/ChordEditorLine.tsx` (NEW)

Renders one line of lyrics with chord slots above each word.

**Props:**
```typescript
interface ChordEditorLineProps {
  words: EditorWord[];
  songKey: Key;
  onChordChange: (wordIndex: number, chord: string | null) => void;
  selectedChord: string | null;  // from quick bar selection
}
```

**Rendering:**
- Two rows: chord row (above) + lyrics row (below)
- Chord row: for each word, show either ChordBadge or clickable "+" zone
- Lyrics row: word text (read-only, not editable)
- Flexbox layout with words as inline-flex items

**Interaction:**
- Click "+" zone → open ChordPickerDropdown at that position
- Click existing ChordBadge → open ChordPickerDropdown (pre-selected)
- If `selectedChord` is set (from quick bar), clicking "+" directly places it

#### `src/components/songbook/ChordPickerDropdown.tsx` (NEW)

Floating dropdown for chord selection.

**Props:**
```typescript
interface ChordPickerDropdownProps {
  songKey: Key;
  scaleType: ScaleType;
  currentChord: string | null;   // existing chord (for edit mode)
  position: { top: number; left: number };  // screen coordinates
  onSelect: (chord: string) => void;
  onRemove: () => void;         // remove existing chord
  onClose: () => void;
}
```

**Sections:**
1. **Diatonic Triads** (7 items, color-coded, with roman numerals)
2. **7th Chords** (7 items, compact row)
3. **Sus / Power** (available chords from database)
4. **Custom** (text input for any chord name)
5. **Remove** (only shown if editing existing chord)

**Implementation:**
- Uses `getChordsForKey(key, scaleType)` for chord data
- Groups by `chordType`: triad, seventh, sus, power, extended
- Each item shows: chord name + roman numeral + harmonic color dot
- Current chord is highlighted
- Custom input: text field with "Add" button, validates chord name exists in database (or allows any)
- Positioned via portal, clamped to viewport

### 5.3 Modified Files

#### `src/components/songbook/SongEditor.tsx` (MODIFY)

Changes:
1. Add `editorMode` state: `'visual' | 'chordpro'`
2. Add mode toggle tabs above the editor area
3. In 'visual' mode, render `VisualChordEditor` instead of textarea
4. Both modes share the same `chordProText` state
5. Add `songKey` state (synced from the key dropdown in metadata panel)
6. Switching modes: visual → chordpro just shows the text; chordpro → visual re-parses

#### `src/utils/chordpro.ts` (MODIFY)

Add the two new functions: `chordProLineToWords()` and `wordsToChordProLine()`

#### `src/types/index.ts` (MODIFY)

Add `EditorWord` interface

---

## 6. Detailed Interaction Design

### 6.1 Adding a Chord (No Quick Bar Selection)

1. User clicks the "+" zone above a word
2. ChordPickerDropdown appears below/above the click point
3. Dropdown shows diatonic triads prominently, then 7ths, sus, custom
4. User clicks a chord (e.g., "G")
5. Chord "G" appears as a colored badge above the word
6. Dropdown closes
7. ChordPro text updates: the word now has `[G]` prepended

### 6.2 Adding a Chord (Quick Bar Mode)

1. User clicks "G" in the quick chord bar → it becomes highlighted/selected
2. Now each word's "+" zone shows a subtle preview (e.g., faded "G" on hover)
3. User clicks above a word → "G" is placed immediately (no dropdown)
4. User can keep clicking more words to place "G" multiple times
5. Click "G" in quick bar again (or press Escape) → exits quick mode

### 6.3 Editing an Existing Chord

1. User clicks on a chord badge (e.g., "Am") above a word
2. ChordPickerDropdown appears, with "Am" highlighted/selected
3. User can:
   - Click a different chord → replaces "Am" with the new chord
   - Click "Remove chord" → removes the chord from that word
   - Click outside → closes without changes

### 6.4 Chord-Only Lines

For lines that are only chords (e.g., intro/outro):
- Render as a row of chord badges with "+" between them
- User can click "+" to add more chords
- Each chord has a small spacer between it and the next

### 6.5 Section Management

- Each section has an editable label (click to rename)
- "Add Section" button at the bottom
- Sections can be reordered (stretch goal - drag and drop)

---

## 7. Music Theory Integration

### 7.1 Key-Aware Chord Palette

When key is set to C major:
```
Diatonic Triads:  C   Dm  Em  F   G   Am  Bdim
Diatonic 7ths:    Cmaj7 Dm7 Em7 Fmaj7 G7 Am7 Bm7b5
Sus/Power:        Csus2 Csus4 C5 Dsus2 Dsus4 ... (from database)
```

When key changes to G major:
```
Diatonic Triads:  G   Am  Bm  C   D   Em  F#dim
Diatonic 7ths:    Gmaj7 Am7 Bm7 Cmaj7 D7 Em7 F#m7b5
```

### 7.2 Harmonic Function Colors

Every chord in the picker and every placed badge is colored:
- I (tonic) = `--hf-tonic` (green)
- ii (supertonic) = `--hf-supertonic` (light blue)
- iii (mediant) = `--hf-mediant` (lavender)
- IV (subdominant) = `--hf-subdominant` (blue)
- V (dominant) = `--hf-dominant` (red/orange)
- vi (submediant) = `--hf-submediant` (purple)
- vii° (leading) = `--hf-leading` (rose)
- Non-diatonic = `--hf-nondiatonic` (amber)

This reuses the existing `analyzeChordInKey()` and `getHarmonicFunctionColor()` utilities.

---

## 8. Implementation Order

### Phase 1: Utility Functions
1. Add `EditorWord` type to `src/types/index.ts`
2. Add `chordProLineToWords()` and `wordsToChordProLine()` to `src/utils/chordpro.ts`

### Phase 2: Core Visual Editor
3. Build `ChordEditorKeyBar.tsx` (key + scale + quick chord buttons)
4. Build `ChordPickerDropdown.tsx` (chord selection floating panel)
5. Build `ChordEditorLine.tsx` (single line with word slots)
6. Build `VisualChordEditor.tsx` (orchestrator: parse → render → serialize)

### Phase 3: Integration
7. Modify `SongEditor.tsx` to add mode toggle and render VisualChordEditor
8. Ensure bidirectional sync between visual and text modes

---

## 9. Risk Assessment

| Risk | Mitigation |
|------|------------|
| Mid-word chord placement lost on visual edit | Visual editor snaps to word boundaries. Text editor preserves exact positions. |
| Complex chord names not in picker | Custom input field accepts any chord name |
| Performance with long songs | Virtualize lines if > 100. Use memo for chord computations. |
| Mobile dropdown positioning | Use viewport-aware positioning, prefer bottom placement |
| Chord-only lines tricky to edit | Special rendering mode for lines without lyrics |

---

## 10. New File Summary

| File | Type | Lines (est.) | Description |
|------|------|-------------|-------------|
| `src/components/songbook/VisualChordEditor.tsx` | Component | ~200 | Main visual editor orchestrator |
| `src/components/songbook/ChordEditorKeyBar.tsx` | Component | ~120 | Key selector + quick chord palette |
| `src/components/songbook/ChordEditorLine.tsx` | Component | ~150 | Single line with word slots |
| `src/components/songbook/ChordPickerDropdown.tsx` | Component | ~200 | Chord selection dropdown |

**Total new code**: ~670 lines across 4 new files
**Modified files**: 3 (types, chordpro utils, SongEditor)

---

*Plan authored by the GuitarWorld Explore Team. Ready for Implementation Team pickup.*
