# Fretboard Notes Tab — Implementation Plan

**Date:** 2026-09-27
**Status:** Complete (2026-09-27)

---

## 1. Feature Description

Add a third tab, **"Fretboard"**, placed after **Scales**, that shows every note on the guitar neck: all 12 chromatic notes at every string/fret position (open strings + frets 1–15), each note in its own color.

### Decisions (confirmed with user)

| Question | Decision |
|---|---|
| What is marked | All 12 notes on every string/fret |
| Coloring | Distinct color per note, always visible |
| Accidental naming | Both names, e.g. `C♯/D♭` |
| Frets / layout | Reuse current setup: `TOTAL_FRETS` (15) + orientation toggle |

Result: 6 strings × 16 positions (fret 0–15) = **96 dots**.

---

## 2. Architectural Approach

### 2.1 Reuse vs. new

- **Reuse unchanged:** `buildLayout` (`src/utils/neckLayout.ts`), `NeckFretboardGrid`, `OrientationToggle`, `STANDARD_TUNING`, `TOTAL_FRETS`, the `useDefaultOrientation` pattern from `ScalesTab`.
- **Do not reuse `NeckNoteDots` / `GuitarNeck`.** `NeckNoteDots` renders a single-line `tone.noteName` and its tooltip assumes an `interval`. The dual-name label (`C♯` over `D♭`) needs two-line text and a larger dot. Changing `NeckNoteDots` would risk regressions in Scales and Key Explorer; a small dedicated dots component is simpler and isolated.
- **No new global state.** Only local `useState` for orientation.

### 2.2 Component tree

```
App.tsx                       (modified: render FretboardTab)
├── TabBar.tsx                (modified: add 'fretboard' after 'scales')
└── FretboardTab.tsx          (NEW)
    ├── OrientationToggle     (REUSED)
    ├── NoteColorLegend.tsx   (NEW: 12 color chips)
    └── <svg>
        ├── NeckFretboardGrid (REUSED)
        └── FretboardNoteDots.tsx (NEW)
```

### 2.3 Data flow

`getFretboardNotes(TOTAL_FRETS)` (pure util) → `FretboardNote[]` → `FretboardNoteDots` positions each dot with the shared `NeckLayout`. Memoized once (no inputs change it).

---

## 3. Music Theory Considerations

- **Pitch class** at (string, fret) = `(STANDARD_TUNING[string] + fret) % 12`. `STANDARD_TUNING = [4, 9, 2, 7, 11, 4]` (low E → high E), string index 0 = low E — matches existing `stringCoord` convention.
- **Naming:** 7 naturals get a single name (C, D, E, F, G, A, B). The 5 accidentals are shown with both spellings, sharp first:
  `C♯/D♭, D♯/E♭, F♯/G♭, G♯/A♭, A♯/B♭`.
  - Display uses Unicode `♯` / `♭` (U+266F / U+266D) for readability; internal keys stay ASCII (`C#`) to match `NoteName`.
  - We deliberately do **not** show B♯/C, E♯/F, C♭/B, F♭/E — those spellings only matter in key context and would clutter a reference map.
- **Sanity checks the guitar expert expects to see:** fret 12 repeats the open-string notes; fret 5 on each string equals the next string's open note except G string (fret 4 = B); both E strings show identical notes.

### 3.1 Color scheme — chromatic hue wheel

Each pitch class gets a hue at `pc × 30°` around the color wheel (C = red, … B = magenta). Neighbouring semitones therefore have neighbouring hues, and each accidental's color sits visually between its two natural neighbours — a musically meaningful mapping, not arbitrary.

Colors are defined as CSS variables in `src/index.css` for **both** themes (dark default + light), so they follow the existing theme toggle:

```
--note-0 … --note-11     /* dot fill */
--note-dot-text          /* label color on dots */
```

Tuning guidance for the developer:
- Dark theme: mid-to-light fills (HSL lightness ~60–65%), dark label text (`#111A22`, same as `--diagram-dot-text`).
- Light theme: slightly darker/more saturated fills (lightness ~50–55%) with the same dark text, OR white text if contrast is better — verify ≥ 4.5:1 for each of the 12 fills (yellow/green hues are the usual failures).
- Starting values (dark theme), adjust visually:
  `C #F2626A, C♯ #F2885A, D #F2B04E, D♯ #E6D352, E #B8DE5A, F #72D46E, F♯ #4FD1A5, G #4CC9D6, G♯ #5BA8F0, A #7E8CF2, A♯ #A97EF0, B #DB74D8`.

---

## 4. File-by-File Changes

### 4.1 `src/types/index.ts` (modify)

```ts
export type TabView = 'explorer' | 'scales' | 'fretboard';

export interface FretboardNote {
  string: number;      // 0 = low E
  fret: number;        // 0 = open
  pitchClass: number;  // 0–11, C = 0
  names: string[];     // ['C'] or ['C♯', 'D♭']
}
```

### 4.2 `src/utils/fretboardNotes.ts` (NEW)

```ts
import type { FretboardNote } from '@/types';
import { STANDARD_TUNING } from '@/utils/constants';

export const PITCH_CLASS_NAMES: string[][] = [
  ['C'], ['C♯', 'D♭'], ['D'], ['D♯', 'E♭'], ['E'], ['F'],
  ['F♯', 'G♭'], ['G'], ['G♯', 'A♭'], ['A'], ['A♯', 'B♭'], ['B'],
];

export function noteColor(pc: number): string {
  return `var(--note-${pc})`;
}

export function getFretboardNotes(totalFrets: number): FretboardNote[] {
  const notes: FretboardNote[] = [];
  for (let s = 0; s < 6; s++) {
    for (let f = 0; f <= totalFrets; f++) {
      const pc = (STANDARD_TUNING[s] + f) % 12;
      notes.push({ string: s, fret: f, pitchClass: pc, names: PITCH_CLASS_NAMES[pc] });
    }
  }
  return notes;
}
```

### 4.3 `src/components/FretboardNoteDots.tsx` (NEW)

Props: `{ notes: FretboardNote[]; layout: NeckLayout }`.

- Position logic copied from `NeckNoteDots` (open notes 16px before the nut, fretted notes at mid-fret).
- Dot radius **13** (string spacing is 30, so 26px diameter leaves 4px gap; fret spacing 40 is fine).
- Naturals: single line, fontSize 11, weight 800.
- Accidentals: two `<tspan>` lines (`C♯` / `D♭`), fontSize 7.5, weight 800, vertically centred (`dy` ≈ ±4).
- Open strings: same filled style as fretted (no hollow ring) — every position is equally "a note" here; the nut already separates them visually. Keep the `var(--neck-bg)` backing circle so the dot sits cleanly over the nut region.
- `<title>` tooltip: `"C♯/D♭ — String 5 (A), Fret 4"`.
- Label fill: `var(--note-dot-text)`; `pointerEvents: 'none'` on text.

### 4.4 `src/components/NoteColorLegend.tsx` (NEW)

A wrapping row of 12 chips (dot swatch + name, e.g. `● C♯/D♭`), styled like existing surface panels (`--color-surface`, `--color-border-subtle`). Gives the colors meaning and doubles as a quick chromatic-scale reference. Static, no interaction.

### 4.5 `src/components/FretboardTab.tsx` (NEW)

Mirrors `ScalesTab` layout:

1. Header: **"Fretboard"** / subtitle "Every note on the neck in standard tuning".
2. Controls row: `OrientationToggle` (default: horizontal ≥ 640px, vertical otherwise — same `useDefaultOrientation` logic as `ScalesTab`; copy it locally rather than extracting, to avoid touching `ScalesTab`).
3. Legend panel: `NoteColorLegend`.
4. Neck panel (`--neck-bg`, `--shadow-md`, same wrapper classes as Scales) containing an SVG built exactly like `GuitarNeck`'s (same `viewBox`, `minWidth`/`maxWidth`, `overflow-x-auto`, `role="img"`, `aria-label="Guitar fretboard with all notes"`), rendering `NeckFretboardGrid` + `FretboardNoteDots`.

`const notes = useMemo(() => getFretboardNotes(TOTAL_FRETS), []);`

### 4.6 `src/components/TabBar.tsx` (modify)

```ts
const TABS = [
  { key: 'explorer', label: 'Key Explorer' },
  { key: 'scales', label: 'Scales' },
  { key: 'fretboard', label: 'Fretboard' },
];
```

### 4.7 `src/components/App.tsx` (modify)

```tsx
import FretboardTab from '@/components/FretboardTab';
...
{activeTab === 'fretboard' && <FretboardTab />}
```

### 4.8 `src/index.css` (modify)

Add `--note-0` … `--note-11` and `--note-dot-text` to both the dark (default) and light theme blocks, next to the existing interval colors.

---

## 5. UI / UX Notes

- 96 dots is dense; dot radius 13 + chromatic hues keeps it legible. The legend lets users decode colors without reading every label.
- Vertical orientation on phones: SVG width is ~192px of viewBox scaled to container — two-line accidental labels at 7.5px viewBox units will render ~9–10 CSS px on typical phones. Verify readability; if too small, bump font to 8 and radius to 13.5 (max before dots touch).
- Tab bar goes from 2 to 3 `flex-1` buttons; labels are short, fits at 320px width.
- Accessibility: SVG `role="img"` + descriptive `aria-label`; per-dot `<title>` tooltips; legend is real text.

---

## 6. Testing Strategy

No automated test runner exists in the repo; verification is `npm run build` (tsc) + `npm run lint` + manual browser checks.

### 6.1 Integration
- `npm run build` and `npm run lint` pass.
- Tab order is Key Explorer → Scales → Fretboard; clicking Fretboard renders the new tab; switching back preserves Scales/Explorer behaviour.
- Orientation toggle flips the neck; dots stay aligned to strings/frets in both orientations.
- Theme toggle: all 12 note colors and label text remain readable in dark and light.

### 6.2 Music correctness (spot checks)
- Low E string: E, F, F♯/G♭, G, G♯/A♭, A, A♯/B♭, B, C, C♯/D♭, D, D♯/E♭, E (fret 12), F, F♯/G♭, G (fret 15).
- Fret 12 = open-string notes on all strings.
- High and low E strings identical.
- A string fret 3 = C; D string fret 2 = E; G string fret 4 = B; B string fret 1 = C.

### 6.3 Regression
- Scales tab (all view modes, both orientations) unchanged — `NeckNoteDots`, `GuitarNeck`, `NeckFretboardGrid` are not modified.
- Key Explorer unchanged.
- Responsive: 320px, 640px, 1024px, 1200px widths; horizontal neck scrolls horizontally on narrow screens as the Scales tab does.

---

## 7. Risk Assessment

| Risk | Likelihood | Mitigation |
|---|---|---|
| Two-line accidental labels unreadable on small screens | Medium | Tunable font/radius constants; verify at 320px vertical |
| Some hues fail contrast (yellow/green on light theme) | Medium | Per-theme values; contrast-check all 12 |
| `TabView` union change breaks an exhaustive switch elsewhere | Low | `tsc -b` will flag it; grep for `TabView` usages |
| Duplicated position logic drifts from `NeckNoteDots` | Low | Both derive from `NeckLayout`; logic is ~15 lines |

---

## 8. Out of Scope (possible follow-ups)

- Click-to-highlight a note across the neck
- Filtering by key/scale (Scales tab already covers this)
- Alternate tunings, left-handed view, >15 frets
