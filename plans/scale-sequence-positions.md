# Scale Sequence Positions — Implementation Plan

**Date:** 2026-03-26
**Team:** Explore Team (Investigative)
**Status:** Ready for implementation

---

## 1. Problem Statement

The current Scales tab shows **all occurrences** of every scale note across the entire fretboard simultaneously. For A Major, that's ~42 dots scattered across 6 strings and 15 frets, all colored by interval type. While useful for seeing "where are all the A notes?", this view is **unusable for actually playing the scale** because:

- There is no indication of **playing order** (which note comes first?)
- There is no concept of **hand position** (a guitarist's hand spans 4-5 frets)
- All notes appear with equal visual weight — the fretboard looks like a connect-the-dots puzzle with no numbers
- A beginner staring at this cannot figure out how to play the scale ascending or descending

### What Guitarists Need

Guitarists learn scales in **positions** (also called "boxes" or "patterns"). A position is a group of notes within a 4-5 fret span where the fretting hand stays stationary. Each position contains one occurrence of every scale degree across the 6 strings. Playing the scale means ascending from the lowest string to the highest within that position, then shifting to the next position to continue up the neck.

---

## 2. The Innovation: Dual-View with Position Navigator

### 2.1 Two Viewing Modes

Add a **view mode toggle** between:

1. **"All Notes" mode** (current behavior) — Shows every scale tone across all frets, colored by interval. Good for fretboard overview and theory.

2. **"Positions" mode** (NEW) — Shows **one position at a time** with:
   - **Sequential numbering** inside each dot (1, 2, 3... in playing order)
   - **Connecting path lines** between consecutive notes showing the ascending route
   - **Dimmed frets** outside the active position's range
   - **A position navigator bar** below the fretboard showing all positions

### 2.2 Visual Design — Positions Mode

```
┌─────────────────────────────────────────────────────────────────────┐
│  Fretboard (only active position highlighted)                       │
│                                                                     │
│  E ──┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬──          │
│  B ──┤      │  ①A  │──②B │      │      │      │      │            │
│  G ──┤      │  ③E  │──④F#│      │      │      │      │            │
│  D ──┤      │  ⑤B  │──⑥C#│──⑦D │      │      │      │            │
│  A ──┤  ⑧E │──⑨F#│──⑩G#│──⑪A │      │      │      │            │
│  E ──┤  ⑫B │──⑬C#│──⑭D │──⑮E │      │      │      │            │
│      0    1     2     3     4     5     6     7                     │
│      ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░          │
│      ^^^^^^^^ active position ^^^^^^^^                              │
│                                                                     │
│  Position Navigator:                                                │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐                │
│  │ 1  │ │ 2  │ │ 3  │ │ 4  │ │ 5  │ │ 6  │ │ 7  │                │
│  │ R  │ │ 2  │ │ 3  │ │ 4  │ │ 5  │ │ 6  │ │ 7  │                │
│  │0-3 │ │2-5 │ │4-7 │ │5-9 │ │7-10│ │9-12│ │11-14│               │
│  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘                │
│  ▲ active                                                          │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.3 Key UX Innovations

**a) Numbered Sequence Dots**
Instead of showing the note name inside each dot (as in All Notes mode), show the **sequence number** (1, 2, 3...). The note name moves to a tooltip on hover. This immediately tells the guitarist "play this note first, then this one, then this one."

The sequence goes: **lowest string, lowest fret → lowest string, highest fret → next string up, lowest fret → ... → highest string, highest fret**. This is the standard ascending scale pattern.

**b) Connecting Path Lines**
SVG `<path>` elements connect consecutive numbered dots. The lines use a subtle gradient or dashed style so they don't obscure the fretboard. They show the exact finger movement path.

**c) Position Highlight Zone**
A semi-transparent overlay rectangle highlights the active position's fret range. Frets outside the range have a subtle dark overlay, visually "dimming" them. Notes outside the position are shown as tiny ghost dots (very low opacity) so the guitarist can see context.

**d) Position Navigator Bar**
A row of clickable boxes below the fretboard, one per position. Each shows:
- Position number (1-7 for 7-note scales, 1-5 for pentatonics)
- Starting scale degree (R, 2, 3, 4, 5, 6, 7)
- Fret range (e.g., "0-3", "2-5")
- The active position is highlighted with the primary color

Left/right arrow buttons (or keyboard ←/→) cycle through positions.

---

## 3. Music Theory — Position Computation (Guitar Domain Expert)

### 3.1 How Positions Work

A **scale position** on guitar is defined by which scale degree the lowest note starts on, on the lowest string (low E). For a 7-note scale, there are 7 positions — one starting on each degree. For pentatonic (5 notes), there are 5 positions.

**Algorithm to compute positions:**

1. Find all scale tones on string 0 (low E) within frets 0-12 (after fret 12, positions repeat an octave higher)
2. Each of these notes defines a position: the starting fret is this note's fret
3. For each position, collect all scale tones across all 6 strings that fall within a fret window of [startFret, startFret + maxSpan] where maxSpan is typically 4-5 frets
4. If a string has no note within the strict window, extend by 1 fret to include the nearest scale tone (this handles positions where the pattern spans 5 frets on some strings)
5. Sort the tones in ascending playing order for the position

### 3.2 Position Playing Order

Within a position, the ascending order is:
1. **String 0 (low E)** — lowest fret first, then higher frets
2. **String 1 (A)** — lowest fret first, then higher frets
3. **String 2 (D)** — same
4. **String 3 (G)** — same
5. **String 4 (B)** — same
6. **String 5 (high E)** — lowest fret first, then higher frets

This produces a natural ascending scale sequence.

### 3.3 Handling Edge Cases

- **Open position (fret 0-3):** Some positions include open strings. These are shown with the open-string dot style but still get a sequence number.
- **12th fret boundary:** Positions that start beyond fret 12 are octave duplicates. We only show unique positions within frets 0-12, but the user can still see the continuation via the "All Notes" mode.
- **Pentatonic scales:** Only 5 positions (fewer notes per position — typically 2 per string). The position navigator shows 5 boxes instead of 7.
- **Positions may overlap:** Position 1 might span frets 0-4, position 2 might span frets 2-5. Overlapping notes appear in multiple positions — this is correct and expected.

### 3.4 Example: A Major, Position 1

Starting on the root (A) at the open A string:
```
String 0 (E): fret 0 (E), fret 2 (F#)     → notes 1, 2
String 1 (A): fret 0 (A), fret 2 (B)       → notes 3, 4
String 2 (D): fret 1 (D#→skip), fret 2 (E) → note 5 (E), fret 4 (F#) → note 6
String 3 (G): fret 1 (G#), fret 2 (A)      → notes 7, 8
... etc
```

Each note gets a sequence number, and the connecting lines draw the path.

---

## 4. Architectural Approach

### 4.1 No Modifications to Existing Components

The `GuitarNeck` and `NeckNoteDots` components remain unchanged. Instead, we create a **new** `ScalePositionNeck` component that renders its own SVG with the position-specific features (connecting lines, numbered dots, highlight zone). It reuses `NeckFretboardGrid` for the base fretboard drawing and the `buildLayout` function exported from GuitarNeck for coordinate calculations.

### 4.2 Component Architecture

```
ScalesTab.tsx (MODIFIED — adds viewMode toggle + position state)
├── ScaleSelector (unchanged)
├── ScaleFormulaBar (unchanged)
├── OrientationToggle (unchanged)
├── ViewModeToggle.tsx (NEW — "All Notes" vs "Positions" toggle)
├── GuitarNeck (shown when viewMode === 'all') — UNCHANGED
├── ScalePositionNeck.tsx (NEW — shown when viewMode === 'positions')
│   ├── NeckFretboardGrid (REUSED)
│   ├── PositionHighlight.tsx (NEW — fret range overlay)
│   ├── PositionConnectingLines.tsx (NEW — SVG paths between notes)
│   └── PositionNoteDots.tsx (NEW — numbered dots)
├── PositionNavigator.tsx (NEW — position selector bar)
└── Info panel (unchanged)
```

### 4.3 Data Flow

```
User selects root + scale + position
           ↓
computeScalePositions(root, scaleKind, totalFrets)
           ↓
Returns ScalePosition[] — each has { tones, startFret, endFret, degree }
           ↓
Active position selected → tones sorted in ascending order
           ↓
ScalePositionNeck renders: highlight zone, connecting lines, numbered dots
```

---

## 5. File-by-File Changes

### 5.1 NEW: `src/utils/scalePositions.ts` — Position Computation Engine

```typescript
import type { NoteName, ChordTone, Key } from '../types';
import type { ScaleKind } from './scaleTones';
import { SCALE_FORMULAS, getAllScaleTones } from './scaleTones';
import { STANDARD_TUNING } from './constants';
import { noteToIndex } from './musicTheory';

export interface ScalePosition {
  /** 0-based position index */
  index: number;
  /** Which scale degree this position starts on (e.g., 'R', '2', '3') */
  startDegree: string;
  /** The lowest fret in this position */
  startFret: number;
  /** The highest fret in this position */
  endFret: number;
  /** All tones in this position, sorted in ascending playing order */
  tones: ChordTone[];
}

/**
 * Compute all scale positions across the fretboard.
 *
 * A position is a group of scale tones that can be played without
 * shifting the fretting hand. Each position starts on a different
 * scale degree on the low E string.
 */
export function computeScalePositions(
  root: NoteName,
  scaleKind: ScaleKind,
  totalFrets: number,
): ScalePosition[]
```

**Algorithm (detailed):**

1. Get all scale tones via `getAllScaleTones(root, scaleKind, totalFrets)`
2. Find all tones on string 0 (low E) with fret ≤ 12 — these are position anchors
3. Sort anchors by fret ascending
4. For each anchor:
   a. Determine the fret window: start from anchor's fret, span up to +4 frets
   b. For each string, collect the scale tones within [anchorFret - 1, anchorFret + 4]
      - If a string has no note in this range, extend the window by 1 in each direction
   c. Compute the actual startFret (min fret across all included tones) and endFret (max)
   d. Sort tones in ascending playing order: by string ascending (0→5), then fret ascending within each string
   e. Record the anchor's interval label as `startDegree`
5. Deduplicate positions that have identical fret ranges
6. Return the positions array

### 5.2 NEW: `src/components/ScalePositionNeck.tsx` — Position Fretboard

Main SVG component for position view. Reuses `NeckFretboardGrid` and `buildLayout` from GuitarNeck, but adds:

**Props:**
```typescript
interface ScalePositionNeckProps {
  position: ScalePosition;
  allTones: ChordTone[];     // All scale tones (for ghost dots)
  orientation: Orientation;
  totalFrets: number;
}
```

**Rendering layers (bottom to top):**
1. `NeckFretboardGrid` — base fretboard (reused)
2. `PositionHighlight` — semi-transparent rectangle over active fret range
3. Ghost dots — all scale tones outside the position rendered at very low opacity (0.15)
4. `PositionConnectingLines` — SVG paths between consecutive position tones
5. `PositionNoteDots` — numbered, colored dots for the position tones

**Key implementation detail:** We need access to `buildLayout` from GuitarNeck. Currently it's a private function. The plan **exports** it by extracting layout constants and the `buildLayout` function into a shared utility, or we duplicate the layout logic inside ScalePositionNeck (simpler, avoids modifying GuitarNeck).

**Decision:** Duplicate the layout constants (`STRING_SPACING=30, FRET_SPACING=40, PAD_LABEL=32, PAD_NUT=48`) and `buildLayout` function inside ScalePositionNeck. This avoids touching GuitarNeck and keeps the components independent. The constants are trivial (4 numbers + a pure function).

### 5.3 NEW: `src/components/PositionHighlight.tsx` — Fret Range Overlay

Renders a semi-transparent colored rectangle behind the active position's fret range.

```typescript
interface PositionHighlightProps {
  startFret: number;
  endFret: number;
  layout: NeckLayout;
}
```

**Visual:**
- A rounded rectangle spanning from `fretCoord(startFret - 1)` to `fretCoord(endFret)`, full height of the string area
- Fill: `var(--color-primary)` at ~0.06 opacity (subtle tint)
- Stroke: `var(--color-primary)` at ~0.15 opacity, dashed
- Frets outside this range get a dark overlay (neck-bg color at 0.4 opacity) to dim them

### 5.4 NEW: `src/components/PositionConnectingLines.tsx` — Sequence Paths

Draws SVG lines connecting consecutive notes in the ascending sequence.

```typescript
interface PositionConnectingLinesProps {
  tones: ChordTone[];   // Already sorted in playing order
  layout: NeckLayout;
}
```

**Visual design:**
- Lines connect the center of dot N to the center of dot N+1
- Stroke: `var(--color-primary)` at 0.35 opacity
- Stroke width: 2px
- Stroke style: slightly rounded (`stroke-linecap: round`)
- Arrow heads are NOT needed (the numbering makes direction obvious)
- When the line crosses from one string to the next, use a subtle curve (quadratic bezier) rather than a straight diagonal — this looks more natural and follows the "move your finger up one string" motion

**Curve algorithm:**
- If tone[i] and tone[i+1] are on the same string: straight horizontal/vertical line
- If on adjacent strings: gentle bezier curve where the control point is offset slightly toward the mid-fret between the two notes
- If crossing multiple strings (rare, edge case): straight line

### 5.5 NEW: `src/components/PositionNoteDots.tsx` — Numbered Dots

Renders colored circles with sequence numbers instead of note names.

```typescript
interface PositionNoteDotsProps {
  tones: ChordTone[];   // Sorted in playing order
  layout: NeckLayout;
}
```

**Visual:**
- Each dot shows its **sequence number** (1, 2, 3...) in bold white text
- Dot color comes from `tone.color` (interval-based, same as All Notes mode)
- Root notes (interval === 'R') get a slightly larger dot (radius 13 vs 11) and a subtle outer ring to make them stand out as position anchors
- Open string dots use the same outline style as NeckNoteDots
- Tooltip (SVG `<title>`) shows: `"1. A (Root) - String 5, Fret 0"` — includes sequence number, note name, interval, and position

**Why numbers not note names?** The whole point of "sequence view" is to answer "what order?" — numbers communicate this instantly. The note name is available on hover and in the formula bar above.

### 5.6 NEW: `src/components/PositionNavigator.tsx` — Position Selector Bar

A horizontal strip of clickable boxes, one per scale position.

```typescript
interface PositionNavigatorProps {
  positions: ScalePosition[];
  activeIndex: number;
  onSelect: (index: number) => void;
}
```

**Visual design:**
```
  ◀  [ Pos 1 ] [ Pos 2 ] [ Pos 3 ] [ Pos 4 ] [ Pos 5 ] [ Pos 6 ] [ Pos 7 ]  ▶
       R          2         3         4         5         6         7
      0-3        2-5       4-7       5-8       7-10      9-12     11-14
```

- Each box shows: position number (top, bold), starting degree label (middle), fret range (bottom, muted)
- Active position: filled with `var(--color-primary)`, white text
- Inactive positions: surface-raised background, muted text
- Left/right arrow buttons for keyboard-style navigation
- Horizontally scrollable on mobile (overflow-x-auto)
- The active position box has a subtle scale-up transform (1.05x) for emphasis

### 5.7 NEW: `src/components/ViewModeToggle.tsx` — All Notes / Positions Toggle

A segmented control (pill toggle) that switches between the two view modes.

```typescript
type ScaleViewMode = 'all' | 'positions';

interface ViewModeToggleProps {
  mode: ScaleViewMode;
  onToggle: (mode: ScaleViewMode) => void;
}
```

**Visual:** Two-segment pill button, similar to OrientationToggle styling:
- "All Notes" | "Positions"
- Active segment: primary color background, white text
- Inactive segment: transparent, muted text
- Matches the existing UI design language

### 5.8 MODIFIED: `src/components/ScalesTab.tsx` — Orchestration

**New state:**
```typescript
const [viewMode, setViewMode] = useState<'all' | 'positions'>('all');
const [activePositionIndex, setActivePositionIndex] = useState(0);
```

**New computed data:**
```typescript
const positions = useMemo(
  () => computeScalePositions(selectedRoot, selectedScale, TOTAL_FRETS),
  [selectedRoot, selectedScale],
);

// Reset active position when root/scale changes
useEffect(() => {
  setActivePositionIndex(0);
}, [selectedRoot, selectedScale]);
```

**Layout changes:**
- Add `ViewModeToggle` next to `OrientationToggle` in controls row
- Conditionally render `GuitarNeck` (all mode) or `ScalePositionNeck` (positions mode)
- Show `PositionNavigator` below the fretboard when in positions mode

```jsx
{/* Controls row — add ViewModeToggle */}
<div className="flex flex-wrap items-center gap-4 mb-4">
  <ScaleSelector ... />
  <ViewModeToggle mode={viewMode} onToggle={setViewMode} />
  <OrientationToggle ... />
</div>

{/* Fretboard — conditional rendering */}
<div className="rounded-xl p-2 sm:p-3 mb-5" style={{ backgroundColor: 'var(--neck-bg)' }}>
  {viewMode === 'all' ? (
    <GuitarNeck tones={tones} orientation={orientation} totalFrets={TOTAL_FRETS} />
  ) : (
    <ScalePositionNeck
      position={positions[activePositionIndex]}
      allTones={tones}
      orientation={orientation}
      totalFrets={TOTAL_FRETS}
    />
  )}
</div>

{/* Position Navigator — only in positions mode */}
{viewMode === 'positions' && (
  <PositionNavigator
    positions={positions}
    activeIndex={activePositionIndex}
    onSelect={setActivePositionIndex}
  />
)}
```

---

## 6. Music Theory Validation (Guitar Domain Expert)

### 6.1 Position Count by Scale Type

| Scale | Notes | Positions | Typical Fret Span |
|-------|-------|-----------|-------------------|
| Major | 7 | 7 | 4-5 frets |
| Natural Minor | 7 | 7 | 4-5 frets |
| Major Pentatonic | 5 | 5 | 3-4 frets |
| Minor Pentatonic | 5 | 5 | 3-4 frets |
| Mixolydian | 7 | 7 | 4-5 frets |

### 6.2 Notes Per Position

- **7-note scales:** Typically 2-3 notes per string × 6 strings = 12-18 notes per position
- **Pentatonic scales:** Typically 2 notes per string × 6 strings = 10-12 notes per position
- The sequence numbers go from 1 to N, making it clear how many notes to play

### 6.3 Real-World Accuracy

The position computation mirrors how guitar teachers actually teach scales:
- Position 1 of A Minor Pentatonic = the famous "blues box" at fret 5
- Position 1 of C Major = the open position pattern every beginner learns
- The connecting lines show the exact finger movement a student should practice

### 6.4 Descending Scales

The sequence is ascending only (low to high). For descending, the guitarist simply reverses the numbers. We could add a future "direction" toggle, but ascending-only is the standard teaching approach and keeps the UX simple.

---

## 7. Testing Strategy

### 7.1 Integration Testing

**Position computation:**
- `computeScalePositions('C', 'major', 15)` returns exactly 7 positions
- `computeScalePositions('A', 'minor-pentatonic', 15)` returns exactly 5 positions
- Each position's tones are sorted: string ascending, fret ascending within string
- Every scale tone on the fretboard appears in at least one position
- Position fret ranges don't have gaps (positions tile across the neck)
- Root notes are correctly identified in each position

**Rendering:**
- All 12 roots × 5 scales × all positions render without errors
- Connecting lines have valid SVG coordinates (no NaN, no off-screen paths)
- Sequence numbers are sequential (1 to N, no gaps)
- Ghost dots (notes outside position) are visible but dimmed
- Position highlight rectangle covers the correct fret range
- Both orientations (vertical/horizontal) render correctly

**View mode toggle:**
- Switching between "All Notes" and "Positions" preserves root/scale selection
- Switching back to "All Notes" shows the original fretboard
- Position index resets to 0 when root/scale changes

### 7.2 Regression Testing

- "All Notes" mode is completely unchanged (GuitarNeck untouched)
- Chord Analyzer tab still works (GuitarNeck not modified)
- Tab navigation works with 4 tabs
- Responsive behavior: position navigator scrolls horizontally on narrow screens
- Both themes (light/dark) render correctly

---

## 8. Risk Assessment

### Low Risk
- **GuitarNeck untouched:** The existing "All Notes" fretboard is not modified at all
- **New components only:** All position-view components are new files
- **Layout duplication:** Copying `buildLayout` is safe — it's a pure function with 4 constants

### Medium Risk
- **Position computation accuracy:** The algorithm for grouping notes into positions needs careful testing for all 12 keys × 5 scales. Edge cases: keys where open strings are scale tones (e.g., E major has many open strings), keys with positions spanning fret 0.
- **SVG connecting lines performance:** With 12-18 notes per position, we draw 11-17 lines. This is trivial for SVG performance. No concern.

### Low-Medium Risk
- **Mobile layout:** The position navigator adds a new horizontal scrolling element. Needs testing on 320px viewport to ensure it doesn't overflow or clash with the fretboard.

---

## 9. Implementation Order

1. **Position engine:** Create `src/utils/scalePositions.ts` with `computeScalePositions()`
2. **Position sub-components:** Create `PositionHighlight`, `PositionConnectingLines`, `PositionNoteDots`
3. **Position fretboard:** Create `ScalePositionNeck` (composes the sub-components)
4. **Navigation:** Create `PositionNavigator` and `ViewModeToggle`
5. **Wire up:** Modify `ScalesTab` to add view mode toggle, position state, conditional rendering
6. **Verify build**
7. **Test all 60 root/scale combinations in both view modes**

---

## 10. Summary

| Aspect | Detail |
|--------|--------|
| **New files** | `scalePositions.ts`, `ScalePositionNeck.tsx`, `PositionHighlight.tsx`, `PositionConnectingLines.tsx`, `PositionNoteDots.tsx`, `PositionNavigator.tsx`, `ViewModeToggle.tsx` |
| **Modified files** | `ScalesTab.tsx` |
| **Reused components** | `NeckFretboardGrid`, `ScaleSelector`, `ScaleFormulaBar`, `OrientationToggle`, `GuitarNeck` (untouched) |
| **Core innovation** | Positions mode: numbered sequence dots + connecting path lines + position navigator |
| **Music theory** | Standard guitar position/box system — 7 positions for 7-note scales, 5 for pentatonics |
| **Backward compatible** | "All Notes" mode preserved exactly as-is via view mode toggle |
