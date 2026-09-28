# Fretboard Interval Shapes — Implementation Plan

**Date:** 2026-09-27
**Status:** Complete (2026-09-27)
**Builds on:** `plans/fretboard-notes-tab.md` (Fretboard tab, commit `8ab2665`)

---

## 1. Feature Description

On the Fretboard tab, tapping any note makes it a **root**. The neck then shows that root's **3rd, 4th, 5th and 7th** as a playable shape: **one note per string**, all within one hand span near the tapped note. The user can:

- pick the **quality** (Major / Dominant / Minor), which sets which 3rd and 7th are used,
- turn each interval **on/off** with chips,
- **move** any interval to another spot on the neck by tapping a faint "ghost" ring. If that string already holds another interval, that interval moves to a free string.

### Decisions (confirmed with user)

| Question | Decision |
|---|---|
| Which 3rd / 7th | Quality toggle: Major (3, 7), Dominant (3, ♭7), Minor (♭3, ♭7). Default Major |
| "Select on fretboard" | Toggle chips per interval **and** tap to move an interval's position |
| Initial placement | Compact shape near the tap (~4-fret hand span), one note per string |
| Rest of neck | Dim other notes; show other reachable spots of each interval as faint rings |

---

## 2. Interaction Design

### 2.1 States

**Idle** (today's view): all 96 notes in note colors. Dots get `cursor: pointer` and a hover ring.

**Shape mode** (after tapping a note):

```
┌──────────────────────────────────────────────────────────────┐
│  Root  C    [ Major | Dominant | Minor ]      Cmaj7   [Clear] │
│                                                              │
│  (R  C)  (3  E)  (4  F)  (5  G)  (7  B)                       │
│   fixed   on      off     on      on       ← chips toggle    │
└──────────────────────────────────────────────────────────────┘
          ┌── neck ─────────────────────────────────┐
          │  ◯ faint ghosts = other spots for 3/5/7 │
          │  ● full-color dots = the chosen shape   │
          │  · everything else dimmed to ~15%       │
          └─────────────────────────────────────────┘
```

- This interval panel **replaces the note-color legend**: the neck now uses interval colors, so the old legend would be misleading. The legend returns when the user clears the shape.
- **Chosen dots** use existing interval colors (`--interval-root`, `--interval-third`, `--interval-fourth`, `--interval-fifth`, `--interval-seventh`, the same colors as the Scales tab). The label has two lines: the interval (`♭3`) over the correctly spelled note (`E♭`).
- **Ghost rings** have no fill, a 2px stroke in the interval color and a small interval label, at ~55% opacity. They only appear inside the reachable window (§3.3), so the neck doesn't fill up with them.
- **Dimmed notes** keep their note-color fill at ~15% opacity. They stay tappable.
- **Chord name** (e.g. `Cmaj7`, `C7sus4`, `Cm`) is worked out from the quality and the enabled intervals (§3.5). It's a label only; nothing else depends on it.

### 2.2 Tap / key behavior

| Action | Result |
|---|---|
| Tap any note (idle) | It becomes the root; auto-place the shape (§3.3) |
| Tap the root dot | Clear the shape and return to idle |
| Tap a dimmed note | That note becomes the new root; auto-place again |
| Tap a ghost ring | Move that interval there. Any interval already on that string moves to a free string (§3.4) |
| Tap a chosen non-root dot | Nothing (the tooltip says "use the chip to hide") |
| Chip click | Turn that interval on or off. When turned on, it's placed without moving the others |
| Quality change | 3 and 7 shift by a semitone on the same string if possible (§3.4) |
| `Esc` / **Clear** button | Return to idle |
| Orientation toggle | The shape is kept; only the rendering changes |
| Leave the tab | Local state; the shape is gone when you come back (acceptable) |

A ghost can sit on the same spot as a dimmed note. The ghost handles the tap there. To make one of those spots the new root, the user clears first.

### 2.3 Unplaced intervals

An interval that's on but has no free spot within reach is **unplaced**. Its chip shows a dashed border and the tooltip "No spot in reach — tap a ring on the neck". It gets ghost rings (if any exist in the window) that the user can tap. The simulation below shows this only happens at frets 14–15, where the neck ends.

---

## 3. Algorithm (Developer — `src/utils/intervalShape.ts`)

### 3.1 Intervals

```ts
export type ShapeInterval = '3' | '4' | '5' | '7';
export type ShapeQuality = 'major' | 'dominant' | 'minor';

const SEMITONES: Record<ShapeQuality, Record<ShapeInterval, number>> = {
  major:    { '3': 4, '4': 5, '5': 7, '7': 11 },
  dominant: { '3': 4, '4': 5, '5': 7, '7': 10 },
  minor:    { '3': 3, '4': 5, '5': 7, '7': 10 },
};

export function intervalLabel(i: ShapeInterval, q: ShapeQuality): string
// '3' | '♭3' | '4' | '5' | '7' | '♭7'
```

Minor-major 7 (m(maj7)) is out of scope. The three qualities cover the standard maj7 / 7 / m7 chords.

### 3.2 Note spelling (music-theory correctness)

A 3rd is spelled with a **letter**, not just a pitch: the minor 3rd of C is **E♭**, not D♯. Use letter arithmetic:

- Letter steps from the root: 3rd = +2, 4th = +3, 5th = +4, 7th = +6 (C D E F G A B cycle).
- accidental = (target pitch class − natural pitch class of that letter), normalized to −2…+2 → `𝄫 ♭ ♮ ♯ 𝄪`. Show nothing for natural.

**Root spelling** is ambiguous for C♯/D♭ and the other accidental notes:
- Default: pick the spelling whose chord tones (for the current quality and enabled intervals) have the **fewest accidentals**, counting a double accidental as 2. On a tie, pick **sharps**.
  - Examples: C♯/D♭ major → **D♭** (D♭ F A♭ C vs C♯ E♯ G♯ B♯). G♯/A♭ major → **A♭** (avoids F𝄪). F♯/G♭ minor → **F♯**. F♯/G♭ major → tie → **F♯**.
- Accidental roots also get a small **`C♯ | D♭`** switch in the panel to override the default. The override is cleared when the root changes.

```ts
export function spellShape(rootPc: number, preferred: 'sharp' | 'flat' | null,
  q: ShapeQuality, enabled: ShapeInterval[]): { root: string; tones: Record<ShapeInterval, string> }
```

### 3.3 Auto-placement (compact, one per string)

The simulation of this exact procedure over all 96 roots × 3 qualities is recorded in §7.

Inputs: root `(rs, rf)`, the intervals to place, the quality, `fixed` positions that stay where they are (for partial re-placement), and `TOTAL_FRETS`.

1. **Window:** frets `[max(0, rf−3), min(15, rf+3)]`. **Open strings (fret 0) are candidates only when `rf ≤ 3`.** Without this rule, a C at fret 8 got its 3rd on the open high E, which isn't a real shape.
2. **Candidates** for each interval: every `(s, f)` in the window with the right pitch class, where `s ≠ rs`, and `s` is not used by the root or a fixed interval. Since the window is < 12 frets wide, there's at most one candidate per string, so ≤ 5 per interval. Add `null` (unplaced) as a candidate.
3. **Enumerate** every combination (≤ 6⁴ = 1296; trivial). Reject combos where two intervals share a string, or where the **fret span** of the fretted notes (fret > 0, including the root and fixed ones) is > 3.
4. **Score** the combos in order, lowest wins:
   1. fewest unplaced intervals,
   2. smallest fret span,
   3. smallest total `|s − rs|` (stay near the root's string),
   4. smallest total `|f − rf|`,
   5. deterministic tiebreak: lower string index.
5. Return `Record<ShapeInterval, Pos | null>`.

```ts
export interface Pos { string: number; fret: number }
export function autoPlace(root: Pos, intervals: ShapeInterval[], q: ShapeQuality,
  totalFrets: number, fixed?: Partial<Record<ShapeInterval, Pos>>): Partial<Record<ShapeInterval, Pos | null>>
export function getGhosts(root: Pos, enabled: ShapeInterval[], q: ShapeQuality,
  placement: Partial<Record<ShapeInterval, Pos | null>>, totalFrets: number): Array<Pos & { interval: ShapeInterval }>
```

`getGhosts` returns every in-window candidate of each enabled interval (same window and open-string rule, root's string excluded) that isn't currently that interval's chosen spot.

### 3.4 Edits

- **Ghost tap `(interval X → pos P)`:** set X = P. If some other interval Y sat on `P.string`, run `autoPlace(root, [Y], q, …, fixed = everything else)`; Y may end up unplaced. A ghost can make the span exceed 3 frets: the user chose it on purpose, so allow it. The span limit only applies to automatic placement.
- **Chip on:** `autoPlace(root, [X], q, …, fixed = current)`. **Chip off:** delete X from the placement.
- **Quality change:** for 3 and 7, `delta = newSemis − oldSemis` (−1, 0 or +1). If `fret + delta` is within 0…15, keep the string and shift the fret. Otherwise re-place with `autoPlace`. 4 and 5 never change. This keeps any shape the user built by hand.
- **New root:** full `autoPlace` with an empty `fixed`.

### 3.5 Chord name

`chordName(rootName, q, enabled)` is a table lookup on (has3, has4, has5, has7) × quality:

| Enabled | Major | Dominant | Minor |
|---|---|---|---|
| 3 5 | C | C | Cm |
| 3 5 7 | Cmaj7 | C7 | Cm7 |
| 3 7 | Cmaj7(no5) | C7(no5) | Cm7(no5) |
| 4 5 | Csus4 | Csus4 | Csus4 |
| 4 5 7 | Cmaj7sus4 | C7sus4 | C7sus4 |
| 3 4 5 | Cadd4 | Cadd4 | Cm(add4) |
| 3 4 5 7 | Cmaj7(add11) | C7(add11) | Cm7(add11) |
| 5 | C5 | C5 | C5 |
| other / root only | — (hidden) | | |

Musical notes from the domain expert:
- With a 7th present, the 4th is conventionally named **11** in the chord symbol, but the chip keeps the label **4** because the user asked for the 4th.
- 3 + 4 together is a clash (a half-step apart in major). It's valid to show, but it's a teaching view, not a recommended voicing.
- "Minor quality + sus4" drops the 3rd, so the quality no longer matters and the name is the same as dominant (C7sus4).

---

## 4. File-by-File Changes

### 4.1 `src/utils/intervalShape.ts` (NEW, Developer)
The types, `SEMITONES`, `intervalLabel`, `spellShape`, `autoPlace`, `getGhosts` and `chordName` described in §3. Pure functions, no React.

### 4.2 `src/types/index.ts` (modify, Developer)
Add `Pos` (if not kept local), `ShapeInterval`, `ShapeQuality`. Existing types are unchanged.

### 4.3 `src/components/FretboardNoteDots.tsx` (modify, UI Developer)
New optional props: `dimmed?: boolean` and `onNoteClick?: (pos) => void`.
- `dimmed` → group opacity 0.15.
- Add an invisible hit circle of r = 15 (string spacing is 30, so it can't overlap neighbors) with the click handler. That makes tap targets larger than the visible dot on phones.
- Each dot gets `role="button"`, `tabIndex={0}`, an `aria-label` like "C, string 5 fret 3", and Enter/Space triggers the click.
- With no props passed, it renders exactly as it does today.

### 4.4 `src/components/IntervalShapeDots.tsx` (NEW, UI Developer)
An SVG layer drawn **above** `FretboardNoteDots`. Props: `root`, `placement`, `ghosts`, `labels` (interval + spelled note), `onRootClick`, `onGhostClick`, `layout`.
- Ghosts are drawn first, then chosen dots, then the root on top (thicker ring, `--interval-root`).
- Position math is the same as `FretboardNoteDots`. Extract a shared `dotCenter(layout, string, fret)` helper into `src/utils/neckLayout.ts`, which is used by both new components. **Don't touch `NeckNoteDots`**, so the Scales tab isn't affected.

### 4.5 `src/components/IntervalShapePanel.tsx` (NEW, UI Developer)
Root name (plus the `♯ | ♭` switch for accidental roots), a quality segmented control, the chord name, the Clear button, and the chip row.
- Chip: a swatch in the interval color, the interval label and the spelled note, with `aria-pressed`. The Root chip can't be toggled. Unplaced chips get a dashed border.
- Match the styling of the existing `ViewModeToggle` and `ScaleSelector` segmented controls (read them for classes and tokens).

### 4.6 `src/components/FretboardTab.tsx` (modify, UI Developer)
Local state lives in one `useReducer` (actions: `selectRoot`, `clear`, `setQuality`, `toggleInterval`, `moveInterval`, `setSpelling`). A reducer is the right tool here because every action changes several fields at once. The reducer and its initial state live in **`src/utils/intervalShapeReducer.ts`** (NEW, Developer), which calls the pure functions in `intervalShape.ts`. Keeping it outside the component lets the property tests (§5.1) run it directly.
- `root === null` → render the legend plus the normal dots (clickable).
- `root !== null` → render the panel plus dimmed dots plus `IntervalShapeDots`.
- An `Esc` key listener on `window` is active only while in shape mode.

### 4.7 `src/utils/neckLayout.ts` (modify, small)
Add the exported `dotCenter()` helper. `buildLayout` is unchanged.

No CSS token changes: interval colors already exist in both themes.

### 4.8 Test tooling (NEW, Developer)
The repo's first test runner.

- **`package.json`**
  - `npm i -D vitest@^5.0.2 fast-check@^4.10.2`. Vitest 5's `vite` peer range includes `^8.0.0`, which matches the project's `vite ^8.0.0`.
  - Add the scripts `"test": "vitest run"` and `"test:watch": "vitest"`.
- **No separate `vitest.config.ts`.** Vitest reads `vite.config.ts` automatically, so the `@` alias just works. The default `node` environment is enough: everything under test is pure functions, so no jsdom or React Testing Library.
- **Test files** go next to the code as `src/utils/*.test.ts`. They sit under `src`, so `tsc -b` type-checks them during `npm run build`. Vite's production bundle won't include them because nothing imports them.
- Import test APIs explicitly (`import { describe, it, expect } from 'vitest'`). Don't use `globals: true`, so `tsconfig.app.json`'s `types` needs no change.
- Check that `eslint .` accepts the test files as they are. If lint complains, fix it in the test files, not by loosening the rules.

### 4.9 `src/utils/intervalShape.test.ts` (NEW, Developer + Integration Tester)
Covers §5.1.

---

## 5. Testing Strategy

### 5.1 Unit / property tests (Vitest + fast-check)

`npm test` must pass before the work counts as done, alongside `npm run build` and `npm run lint`. The algorithm in §3 is the riskiest part and it's pure, so these tests carry most of the confidence.

**Exhaustive checks** (plain Vitest; the whole input space is small enough to cover every case):
- Over **all 96 roots × 3 qualities × all 16 interval subsets** (4,608 cases), `autoPlace` output satisfies:
  - every placed interval has the correct pitch class: `(STANDARD_TUNING[s] + f) % 12 === (rootPc + SEMITONES[q][i]) % 12`,
  - no two notes (root included) share a string,
  - the fretted span (fret > 0, root included) is ≤ 3,
  - no fret-0 note appears when `rf > 3`,
  - every fret is within `[0, TOTAL_FRETS]`,
  - calling it twice gives deeply equal results (deterministic).
- **Coverage guard:** the number of roots where not every interval fits matches the simulation in §7 (0 for {3,5}; ≤ 3 for {3,4,5,7}, all at fret ≥ 14). If a later change breaks placement, this test fails.
- **Spelling table:** all 12 pitch classes × 3 qualities against a hand-written expected table. It includes C♯/D♭ major → `D♭ F A♭ C` (+ `G♭`, `C`), G♯/A♭ major → `A♭`, F♯ major tie → `F♯`, A minor → `A C D E G`, F♯ dominant → `F♯ A♯ B C♯ E`. Also asserted: the default spelling never produces `𝄫` or `𝄪`. The **manual override** gives the other spelling, which may include double accidentals.
- **Ghosts:** each ghost has the correct pitch class, is inside the window, isn't on the root's string, and isn't that interval's current spot.
- **Chord names:** every row of the §3.5 table.

**Property tests** (fast-check, for the sequences of edits that can't be listed by hand):
- Arbitraries:
  - `root = fc.record({ string: fc.integer({min:0,max:5}), fret: fc.integer({min:0,max:15}) })`,
  - `quality = fc.constantFrom('major','dominant','minor')`,
  - `action = fc.oneof(ghostTap, chipToggle, qualityChange)`,
  - `fc.array(action, { maxLength: 30 })`.
  - A ghost tap picks an index into the current `getGhosts()` output (modulo its length; skip if empty).
- Run the **reducer** from §4.6 (export it from its own module so it can be tested) on the action sequence, then assert after **every** step:
  - one note per string,
  - every placed interval's pitch class matches the *current* quality,
  - the root never moves,
  - disabled intervals have no placement,
  - on a `qualityChange`, the positions of 4 and 5 are unchanged.
- `fc.assert(..., { numRuns: 500 })`. Fixing a seed isn't required, since fast-check prints the failing seed and the shrunk counter-example.

The exhaustive loops replace the throw-away Python model: that model is now a real test that stays.

### 5.2 Integration (manual + build)
- `npm test`, `npm run build` and `npm run lint` all pass.
- Tap C (A string, fret 3), Major, all on → R C, 3 E, 4 F, 5 G, 7 B on 5 different strings. The panel says `Cmaj7(add11)`. Turn off 4 → `Cmaj7`.
- Switch to Minor → 3 and 7 move down one fret on the same strings. Labels read ♭3 E♭ and ♭7 B♭, and the name reads `Cm7`.
- Tap a ghost 5 on a string that holds the 3 → the 3 moves to a free string. Still one note per string.
- Tap the root → idle. Tap a dimmed note → new shape. Esc and Clear both go back to idle.
- Tap the root at fret 15 on the G string, Dominant → at least one chip shows as unplaced. Tapping its ghost (if any) places it.

### 5.3 Regression
- Idle Fretboard view looks the same as today, apart from the pointer cursor and hover ring.
- Scales and Key Explorer are unchanged: `NeckNoteDots`, `GuitarNeck` and `NeckFretboardGrid` aren't touched.
- Both orientations and both themes; widths 320 / 640 / 1024 / 1200. On a phone in vertical view, check that taps land and that the two-line labels on chosen dots are readable.

---

## 6. Risk Assessment

| Risk | Likelihood | Mitigation |
|---|---|---|
| Wrong note spelling (D♯ where E♭ is expected) | Medium | Letter-based spelling (§3.2) + table test of all 36 root/quality pairs |
| New dev dependencies (vitest, fast-check) | Low | Dev-only, not in the production bundle; Vitest 5's peer range covers Vite 8 |
| Test files break `tsc -b` / lint | Low | Explicit `vitest` imports, no globals; build + lint run over the tests too |
| Reducer is hard to test while it lives inside the component | Low | Put the reducer in `src/utils/intervalShapeReducer.ts` and import it into `FretboardTab` |
| Shapes that look unplayable | Low | Span ≤ 3 + open-string rule, checked by the simulation (§7) |
| Tap targets too small on phones | Medium | r = 15 invisible hit area; test on 375px vertical |
| 96 `tabIndex` stops make keyboard navigation tedious | Medium | Acceptable for v1; roving tabindex with arrow keys is a follow-up |
| Ghost and dimmed note on the same spot confuse what a tap does | Low | Ghost has priority; tooltips say what the tap does; Clear is always visible |
| Panel pushes the neck down on phones | Low | Chips wrap; the panel is compact (2 rows) |

---

## 7. Placement simulation (done during planning)

The Python model of §3.3 was run over 96 roots × 3 qualities:

| Intervals on | Roots where not every interval fits |
|---|---|
| 3 5 | 0 / 96 (all qualities) |
| 3 5 7 | 1–2 / 96, all at fret 15 |
| 4 5 7 | 1–2 / 96, all at fret 15 |
| 3 4 5 7 | 1–3 / 96, frets 14–15 only |

Sample outputs:
- **C**, A string fret 3, Major → 3 open low E, 4 D string fret 3, 5 open G, 7 open B.
- **C**, low E fret 8, Dominant → frets 8–9, strings 2–5.
- **A**, B string fret 10, Minor → frets 9–10.

The one gap (the neck ending at fret 15) is covered by the unplaced state in §2.3.

---

## 8. Out of Scope (follow-ups)

- Audio playback of the shape
- More qualities (m(maj7), dim, half-dim, aug), 6ths/9ths
- Marking unused strings with × at the nut
- Warning when the root isn't the lowest note (inversion)
- Remembering the shape across tab switches
