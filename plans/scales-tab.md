# Scales Tab — Implementation Plan

**Date:** 2026-03-26
**Team:** Explore Team (Investigative)
**Status:** Ready for implementation

---

## 1. Problem Statement / Feature Description

GuitarWorld currently has three tabs: Key Explorer, Chord Analyzer, and Songbook. Users can explore chords on the fretboard but have no dedicated way to visualize **scales** — the foundational building blocks of melody, improvisation, and understanding the fretboard.

This plan adds a fourth tab — **"Scales"** — where a user selects a root note and sees its **Major, Minor, Pentatonic (Major & Minor), and Mixolydian** scales displayed graphically on the existing full-fretboard `GuitarNeck` component. The user can switch between scale types, toggle fretboard orientation, and see scale metadata (formula, notes, intervals).

### Target Scales

| Scale | Intervals (semitones from root) | Interval Labels | Notes (in C) |
|-------|-------------------------------|-----------------|-------------|
| **Major (Ionian)** | 0, 2, 4, 5, 7, 9, 11 | R, 2, 3, 4, 5, 6, 7 | C D E F G A B |
| **Natural Minor (Aeolian)** | 0, 2, 3, 5, 7, 8, 10 | R, 2, b3, 4, 5, b6, b7 | C D Eb F G Ab Bb |
| **Major Pentatonic** | 0, 2, 4, 7, 9 | R, 2, 3, 5, 6 | C D E G A |
| **Minor Pentatonic** | 0, 3, 5, 7, 10 | R, b3, 4, 5, b7 | C Eb F G Bb |
| **Mixolydian** | 0, 2, 4, 5, 7, 9, 10 | R, 2, 3, 4, 5, 6, b7 | C D E F G A Bb |

---

## 2. Architectural Approach

### 2.1 Design Principle: Maximum Reuse

The Chord Analyzer already solves the core visualization problem — it computes `ChordTone[]` for every fret/string position and passes them to `GuitarNeck`. The Scales tab follows the **exact same pattern**, replacing "chord intervals" with "scale intervals."

**Key insight:** The `ChordTone` type and `GuitarNeck` component are already generic enough to display *any* set of notes on the fretboard. A `ChordTone` is really just "a note at a position with a label and color." Scales produce the same data shape.

### 2.2 Component Architecture

```
App.tsx
├── TabBar.tsx          (modified: add 'scales' tab)
├── ScalesTab.tsx        (NEW: main scales container)
│   ├── ScaleSelector.tsx    (NEW: root + scale type selector)
│   ├── ScaleFormulaBar.tsx  (NEW: visual interval/formula display)
│   ├── OrientationToggle    (REUSED: existing component)
│   └── GuitarNeck           (REUSED: existing component)
│       ├── NeckFretboardGrid (REUSED)
│       └── NeckNoteDots      (REUSED)
```

### 2.3 Data Flow

```
User selects root + scale type
        ↓
getAllScaleTones(root, scaleType, totalFrets)
        ↓
Returns ChordTone[] (same type used by Chord Analyzer)
        ↓
GuitarNeck renders all scale tones on fretboard
```

### 2.4 No New Context/Provider Needed

The Scales tab is self-contained with local `useState` — same as ChordAnalyzer. No global state management needed. This keeps the architecture simple and consistent.

---

## 3. File-by-File Changes

### 3.1 NEW: `src/utils/scaleTones.ts` — Scale Theory Engine

**Purpose:** Define scale formulas and compute all scale tones across the fretboard.

```typescript
import type { NoteName, ChordTone, IntervalName, Key } from '../types';
import { STANDARD_TUNING, INTERVAL_COLORS } from './constants';
import { noteToIndex, indexToNote } from './musicTheory';
import { FLAT_KEYS } from './constants';

// === Scale Type Definition ===

export type ScaleKind = 'major' | 'natural-minor' | 'major-pentatonic' | 'minor-pentatonic' | 'mixolydian';

interface ScaleIntervalDef {
  semitones: number;
  label: IntervalName;
}

export const SCALE_FORMULAS: Record<ScaleKind, ScaleIntervalDef[]> = {
  'major': [
    { semitones: 0, label: 'R' },
    { semitones: 2, label: '2' },
    { semitones: 4, label: '3' },
    { semitones: 5, label: '4' },
    { semitones: 7, label: '5' },
    { semitones: 9, label: '6' },
    { semitones: 11, label: '7' },
  ],
  'natural-minor': [
    { semitones: 0, label: 'R' },
    { semitones: 2, label: '2' },
    { semitones: 3, label: 'b3' },
    { semitones: 5, label: '4' },
    { semitones: 7, label: '5' },
    { semitones: 8, label: 'b5' },   // actually b6, see note below
    { semitones: 10, label: 'b7' },
  ],
  'major-pentatonic': [
    { semitones: 0, label: 'R' },
    { semitones: 2, label: '2' },
    { semitones: 4, label: '3' },
    { semitones: 7, label: '5' },
    { semitones: 9, label: '6' },
  ],
  'minor-pentatonic': [
    { semitones: 0, label: 'R' },
    { semitones: 3, label: 'b3' },
    { semitones: 5, label: '4' },
    { semitones: 7, label: '5' },
    { semitones: 10, label: 'b7' },
  ],
  'mixolydian': [
    { semitones: 0, label: 'R' },
    { semitones: 2, label: '2' },
    { semitones: 4, label: '3' },
    { semitones: 5, label: '4' },
    { semitones: 7, label: '5' },
    { semitones: 9, label: '6' },
    { semitones: 10, label: 'b7' },
  ],
};

// Display names for the UI
export const SCALE_DISPLAY_NAMES: Record<ScaleKind, string> = {
  'major': 'Major (Ionian)',
  'natural-minor': 'Natural Minor (Aeolian)',
  'major-pentatonic': 'Major Pentatonic',
  'minor-pentatonic': 'Minor Pentatonic',
  'mixolydian': 'Mixolydian',
};

/**
 * Compute all instances of scale tones across the entire fretboard.
 * Returns ChordTone[] — same type as getAllChordTones() — for direct
 * reuse with GuitarNeck / NeckNoteDots.
 */
export function getAllScaleTones(
  root: NoteName,
  scaleKind: ScaleKind,
  totalFrets: number,
): ChordTone[] {
  const formula = SCALE_FORMULAS[scaleKind];
  const rootIndex = noteToIndex(root);
  const preferFlats = FLAT_KEYS.has(root as Key);

  // Build chromatic index → interval label map
  const toneMap = new Map<number, IntervalName>();
  for (const interval of formula) {
    const chromaticIndex = (rootIndex + interval.semitones) % 12;
    toneMap.set(chromaticIndex, interval.label);
  }

  const tones: ChordTone[] = [];
  for (let string = 0; string < 6; string++) {
    for (let fret = 0; fret <= totalFrets; fret++) {
      const noteIndex = (STANDARD_TUNING[string] + fret) % 12;
      const interval = toneMap.get(noteIndex);
      if (interval !== undefined) {
        tones.push({
          string,
          fret,
          noteName: indexToNote(noteIndex, preferFlats),
          interval,
          color: INTERVAL_COLORS[interval],
        });
      }
    }
  }

  return tones;
}

/** Returns the formula string, e.g. "R - 2 - 3 - 4 - 5 - 6 - 7" */
export function getScaleFormulaDisplay(scaleKind: ScaleKind): string {
  const formula = SCALE_FORMULAS[scaleKind];
  return formula.map((i) => (i.label === 'R' ? '1' : i.label)).join(' - ');
}

/** Returns the actual note names for a scale, e.g. "C - D - E - F - G - A - B" */
export function getScaleNotesDisplay(root: NoteName, scaleKind: ScaleKind): string {
  const formula = SCALE_FORMULAS[scaleKind];
  const rootIndex = noteToIndex(root);
  const preferFlats = FLAT_KEYS.has(root as Key);
  return formula
    .map((i) => indexToNote((rootIndex + i.semitones) % 12, preferFlats))
    .join(' - ');
}
```

**Music Theory Notes (Guitar Domain Expert):**

- **Natural Minor b6 labeling:** The existing `IntervalName` type does not include `'b6'`. The 6th degree of the natural minor scale (8 semitones, e.g., Ab in C minor) maps to `'b5'` in the current type system since `'#5'` has the same chromatic distance. **Resolution:** Add `'b6'` to the `IntervalName` type and `INTERVAL_COLORS` map. This is musically correct — calling it b5 would be wrong (b5 = 6 semitones, b6 = 8 semitones). See section 3.2.

- **Mixolydian:** Identical to the major scale with a flatted 7th (b7). Essential for blues, rock, and dominant chord improvisation. The b7 is already in `IntervalName`.

- **Pentatonics:** The most commonly used scales for guitar soloing. Major pentatonic removes the 4th and 7th from the major scale. Minor pentatonic removes the 2nd and b6 from the natural minor scale. Both avoid the half-step intervals that create dissonance, making them "safe" scales for improvisation.

### 3.2 MODIFIED: `src/types/index.ts` — Type Updates

**Changes:**

1. Add `'scales'` to `TabView` union type
2. Add `'b6'` to `IntervalName` union type (for natural minor's 6th degree)

```typescript
// Before:
export type TabView = 'explorer' | 'analyzer' | 'songbook';

// After:
export type TabView = 'explorer' | 'analyzer' | 'scales' | 'songbook';

// Before:
export type IntervalName =
  | 'R' | '2' | 'b3' | '3' | '4' | 'b5' | '5' | '#5'
  | '6' | 'b7' | '7' | 'bb7' | 'b9' | '9' | '#9' | '11' | '13';

// After:
export type IntervalName =
  | 'R' | '2' | 'b3' | '3' | '4' | 'b5' | '5' | '#5'
  | 'b6' | '6' | 'b7' | '7' | 'bb7' | 'b9' | '9' | '#9' | '11' | '13';
```

### 3.3 MODIFIED: `src/utils/constants.ts` — Add b6 Color

Add `'b6'` to `INTERVAL_COLORS`:

```typescript
// Add this entry:
'b6': 'var(--interval-sixth)',   // Same color family as '6', visually linked
```

This reuses the `--interval-sixth` CSS variable, keeping the visual language consistent — b6 and 6 are the same scale degree (just altered), so they share the color family.

### 3.4 NEW: `src/components/ScaleSelector.tsx` — Root + Scale Type Selector

**Purpose:** Dropdown for root note selection and scale type selection. Visually consistent with `ChordSelector`.

```typescript
import type { NoteName } from '@/types';
import type { ScaleKind } from '@/utils/scaleTones';
import { ALL_KEYS } from '@/utils/constants';
import { getDisplayName } from '@/utils/musicTheory';
import { SCALE_DISPLAY_NAMES } from '@/utils/scaleTones';

interface ScaleSelectorProps {
  root: NoteName;
  scaleKind: ScaleKind;
  onRootChange: (root: NoteName) => void;
  onScaleKindChange: (kind: ScaleKind) => void;
}
```

- Renders two `<select>` dropdowns: Root note (12 keys) and Scale type (5 options)
- Uses the same `selectStyle` pattern as `ChordSelector`
- Scale type dropdown iterates over `SCALE_DISPLAY_NAMES`

### 3.5 NEW: `src/components/ScaleFormulaBar.tsx` — Scale Formula Visualization

**Purpose:** A visual bar showing the scale's interval structure — which degrees are included, the step pattern (W/H), and the note names. Similar in spirit to `IntervalBuilder` in ChordAnalyzer but tailored for scales.

**Design (UI Designer):**

```
┌──────────────────────────────────────────────────────────┐
│  C Major Scale                                           │
│  Formula: 1 - 2 - 3 - 4 - 5 - 6 - 7                   │
│  Notes:   C - D - E - F - G - A - B                     │
│                                                          │
│  ┌───┐ W ┌───┐ W ┌───┐ H ┌───┐ W ┌───┐ W ┌───┐ W ┌───┐│
│  │ C │───│ D │───│ E │───│ F │───│ G │───│ A │───│ B ││
│  │ R │   │ 2 │   │ 3 │   │ 4 │   │ 5 │   │ 6 │   │ 7 ││
│  └───┘   └───┘   └───┘   └───┘   └───┘   └───┘   └───┘│
└──────────────────────────────────────────────────────────┘
```

For pentatonic scales (5 notes), the boxes will be wider to fill the same space, maintaining visual balance.

**Implementation:**
- SVG-based, same approach as `IntervalBuilder`
- Each note gets a colored box (using `INTERVAL_COLORS`)
- Arcs between boxes show step size: W (whole), H (half), WH (whole-and-a-half for pentatonics)
- Root note box is highlighted with the root color
- Responsive: horizontally scrollable on small screens

### 3.6 NEW: `src/components/ScalesTab.tsx` — Main Tab Component

**Purpose:** Container component that orchestrates the Scales feature. Follows the same layout pattern as `ChordAnalyzer`.

```typescript
import { useState, useMemo } from 'react';
import type { NoteName, Orientation } from '@/types';
import { TOTAL_FRETS } from '@/utils/constants';
import { getAllScaleTones, getScaleFormulaDisplay, getScaleNotesDisplay, SCALE_DISPLAY_NAMES } from '@/utils/scaleTones';
import type { ScaleKind } from '@/utils/scaleTones';
import ScaleSelector from '@/components/ScaleSelector';
import ScaleFormulaBar from '@/components/ScaleFormulaBar';
import OrientationToggle from '@/components/OrientationToggle';
import GuitarNeck from '@/components/GuitarNeck';

export default function ScalesTab() {
  const [selectedRoot, setSelectedRoot] = useState<NoteName>('C');
  const [selectedScale, setSelectedScale] = useState<ScaleKind>('major');
  const [orientation, setOrientation] = useState<Orientation>(() =>
    window.innerWidth >= 640 ? 'horizontal' : 'vertical'
  );

  const tones = useMemo(
    () => getAllScaleTones(selectedRoot, selectedScale, TOTAL_FRETS),
    [selectedRoot, selectedScale],
  );

  const formulaStr = getScaleFormulaDisplay(selectedScale);
  const notesStr = getScaleNotesDisplay(selectedRoot, selectedScale);
  const scaleName = `${selectedRoot} ${SCALE_DISPLAY_NAMES[selectedScale]}`;

  return (
    <div className="px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-6">
        <h2>Scales</h2>
        <p>Explore scale patterns across the entire fretboard</p>
      </div>

      {/* Controls: ScaleSelector + OrientationToggle */}
      {/* Scale Formula Bar */}
      {/* GuitarNeck with scale tones */}
      {/* Info panel: scale name, formula, notes */}
    </div>
  );
}
```

**Layout sections (top to bottom):**

1. **Header** — Title "Scales" + subtitle
2. **Controls row** — `ScaleSelector` + `OrientationToggle` (flex-wrap)
3. **Scale Formula Bar** — Visual interval pattern (in a rounded surface card)
4. **Guitar Neck** — Full 15-fret fretboard with all scale tones highlighted (in a neck-bg card)
5. **Info Panel** — Scale name, formula, notes (in a rounded surface card)

### 3.7 MODIFIED: `src/components/TabBar.tsx` — Add Scales Tab

**Change:** Add `'scales'` entry to the `TABS` array, positioned between Chord Analyzer and Songbook.

```typescript
const TABS: { key: TabView; label: string }[] = [
  { key: 'explorer', label: 'Key Explorer' },
  { key: 'analyzer', label: 'Chord Analyzer' },
  { key: 'scales', label: 'Scales' },         // NEW
  { key: 'songbook', label: 'Songbook' },
];
```

**UI Designer note:** With 4 tabs, each button gets `flex-1` so they distribute evenly. At narrow widths (< 360px), the text may wrap — the existing `text-sm` and `px-4` padding handles this gracefully. Tab label is kept short ("Scales") to fit on small screens.

### 3.8 MODIFIED: `src/components/App.tsx` — Route to Scales Tab

**Changes:**

1. Import `ScalesTab`
2. Add conditional render for `activeTab === 'scales'`

```typescript
import ScalesTab from '@/components/ScalesTab';

// In the render, after the analyzer block:
{activeTab === 'scales' && <ScalesTab />}
```

---

## 4. Music Theory Considerations (Guitar Domain Expert)

### 4.1 Scale Selection Rationale

The five chosen scales cover the vast majority of what guitarists need:

- **Major (Ionian):** The foundation of Western music. Every guitarist needs to know this.
- **Natural Minor (Aeolian):** The relative minor — essential for minor keys, rock, and metal.
- **Major Pentatonic:** The "country/folk" scale. Removing the 4th and 7th eliminates dissonant half-steps.
- **Minor Pentatonic:** The #1 scale for rock/blues guitar soloing. Used by everyone from BB King to Jimmy Page.
- **Mixolydian:** The "dominant" scale — perfect for blues, rock, funk, and any dominant 7th chord context. Distinguished from major by its b7.

### 4.2 Interval Labeling Accuracy

| Scale | Degree | Semitones | Label | Note |
|-------|--------|-----------|-------|------|
| Natural Minor 6th | b6 | 8 | `b6` | **NEW** — must add to IntervalName |
| All others | — | — | — | Already exist in IntervalName |

The `b6` interval (8 semitones) is distinct from `#5` (also 8 semitones enharmonically) in context: b6 implies a minor scale context while #5 implies an augmented chord. For scale visualization, `b6` is the correct label.

### 4.3 Enharmonic Handling

The existing `FLAT_KEYS` set determines whether to spell notes with flats or sharps. This works correctly for all five scales:
- Key of F: uses Bb (not A#)
- Key of C#: uses sharps
- Key of Eb: uses flats

### 4.4 Color Coding

Scale tones reuse `INTERVAL_COLORS` from the chord system. This creates visual consistency — a root note is the same color whether you're looking at a chord or a scale. The interval-based coloring also helps guitarists see the scale's structure (e.g., all the 3rds are one color, all the 5ths another).

### 4.5 Future Scale Expansion

The `SCALE_FORMULAS` structure is extensible. Future scales can be added by simply adding entries:
- Dorian, Phrygian, Lydian (remaining modes)
- Harmonic Minor
- Melodic Minor
- Blues Scale (minor pentatonic + b5)
- Whole Tone, Diminished

No architectural changes needed — just add formulas and update the `ScaleKind` type.

---

## 5. Testing Strategy

### 5.1 Integration Testing (UI Integration Tester)

**Scale Tone Computation:**
- Verify `getAllScaleTones('C', 'major', 15)` returns exactly the right number of tones (each note of the scale appears on each string within 0-15 frets)
- Verify root notes get `interval: 'R'` and `color: INTERVAL_COLORS['R']`
- Verify all 5 scale types produce the correct number of unique pitch classes (7, 7, 5, 5, 7)
- Verify enharmonic handling: `getAllScaleTones('F', 'major', 15)` should spell Bb not A#

**Component Integration:**
- `ScalesTab` renders without errors for all 12 root notes x 5 scale types = 60 combinations
- `GuitarNeck` receives valid `ChordTone[]` — no undefined values, all frets within 0-15
- `ScaleSelector` changes propagate: selecting a new root/scale updates the fretboard
- `OrientationToggle` switches GuitarNeck between vertical and horizontal

**Type Safety:**
- Build passes with no TypeScript errors after adding `'scales'` to `TabView` and `'b6'` to `IntervalName`
- No existing code breaks from the type union expansion

### 5.2 Regression Testing (UI Regression Tester)

**Existing Tabs Unaffected:**
- Key Explorer: still works, chord table displays correctly
- Chord Analyzer: still works, fretboard tones and IntervalBuilder render correctly
- Songbook: still works, song view/edit/import functions normally

**Tab Navigation:**
- All 4 tabs are clickable and switch content correctly
- Tab bar still fits on mobile screens (< 375px width)
- Active tab highlight (primary color + bottom border) works for the new Scales tab

**Fretboard Rendering:**
- GuitarNeck vertical orientation: scale tones aligned correctly
- GuitarNeck horizontal orientation: scale tones aligned correctly
- Open string indicators display correctly for scale tones at fret 0
- Fret markers (3, 5, 7, 9, 12, 15) still visible
- No visual overlap between scale tone dots

**Responsive:**
- Scales tab content is readable at 320px width
- Fretboard scrolls horizontally in horizontal mode on narrow screens
- Scale formula bar scrolls horizontally if needed on narrow screens

---

## 6. Risk Assessment

### Low Risk
- **GuitarNeck reuse:** The component already accepts any `ChordTone[]`. No modifications needed.
- **Type extension:** Adding union members to `TabView` and `IntervalName` is backward-compatible.
- **New files only:** Most changes are new files. Only `App.tsx`, `TabBar.tsx`, `types/index.ts`, and `constants.ts` are modified, with minimal changes.

### Medium Risk
- **4-tab layout on small screens:** Four tabs in a row may feel cramped at < 360px. Mitigation: the labels are short ("Scales" is 6 chars) and `text-sm` keeps them compact. Test on 320px viewport.
- **`b6` interval color:** Adding `b6` to `INTERVAL_COLORS` using `--interval-sixth` is safe, but verify the CSS variable exists in both light and dark themes. If not defined, dots will have no visible fill.

### Negligible Risk
- **Performance:** Scale computation is O(6 x 16) = 96 iterations per render — trivial. The `useMemo` dependency on `[selectedRoot, selectedScale]` prevents unnecessary recalculation.
- **Bundle size:** Three new components (~200-300 lines total) and one utility file (~100 lines) add negligible weight.

---

## 7. Implementation Order

1. **Types first:** Update `IntervalName` and `TabView` in `src/types/index.ts`
2. **Constants:** Add `'b6'` to `INTERVAL_COLORS` in `src/utils/constants.ts`
3. **Scale engine:** Create `src/utils/scaleTones.ts` with formulas and computation
4. **UI components:** Create `ScaleSelector.tsx`, `ScaleFormulaBar.tsx`, `ScalesTab.tsx`
5. **Wiring:** Update `TabBar.tsx` and `App.tsx` to include the new tab
6. **Verify build:** Run `npm run build` to catch any TypeScript errors
7. **Manual testing:** Check all 60 root/scale combinations, both orientations, and responsive behavior

---

## 8. Summary

| Aspect | Detail |
|--------|--------|
| **New files** | `scaleTones.ts`, `ScalesTab.tsx`, `ScaleSelector.tsx`, `ScaleFormulaBar.tsx` |
| **Modified files** | `types/index.ts`, `constants.ts`, `TabBar.tsx`, `App.tsx` |
| **Reused components** | `GuitarNeck`, `NeckFretboardGrid`, `NeckNoteDots`, `OrientationToggle` |
| **New types** | `ScaleKind` (in scaleTones.ts), `'b6'` added to `IntervalName`, `'scales'` added to `TabView` |
| **Complexity** | Low — follows established patterns from Chord Analyzer |
| **Scales supported** | Major, Natural Minor, Major Pentatonic, Minor Pentatonic, Mixolydian |
| **Extensibility** | Adding new scales = add one entry to `SCALE_FORMULAS` + update `ScaleKind` type |
