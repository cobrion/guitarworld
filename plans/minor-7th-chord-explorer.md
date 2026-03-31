# Minor 7th Chords in the Chord Explorer

## Explore Team Investigation

**Date:** 2026-03-17
**Status:** Plan complete — ready for implementation

---

## Current State

Minor 7th chords **already exist** in GuitarWorld but are buried:

- **Database:** All 12 roots covered in `chords-seventh.ts` (Am7, Bm7, Cm7, etc.) with open and barre voicings
- **Music theory:** `getChordsForKey()` generates diatonic 7ths for every key — minor 7ths appear at degrees II, III, VI in major keys (e.g., Key of C → Dm7, Em7, Am7) and degrees I, IV, V in minor keys
- **Display:** 7ths are **only visible** in the expanded row area, and **only when** the user clicks the "7ths" filter pill (off by default)
- **Main table row:** Shows only the 7 diatonic triads — no 7th chords visible at a glance

**Problem:** A guitarist looking at the Key of C major sees `C Dm Em F G Am Bdim` but has no easy way to see the diatonic 7th extensions (`Cmaj7 Dm7 Em7 Fmaj7 G7 Am7 Bm7b5`) without expanding a row and toggling a filter. Minor 7th chords are arguably the most commonly used extended chords in popular music, and they deserve first-class visibility.

---

## Brainstorm Phase

### Technical Architect
Three approaches, ranging from minimal to ambitious:

**Option A: Add a 7th chord sub-row beneath each key row (Recommended)**
- Below each triad row, show an optional second row with the diatonic 7th chords
- Controlled by a toggle — "Show 7ths" — that reveals/hides ALL 7th sub-rows at once
- This keeps the table structure intact and lets users compare triads and 7ths side by side
- The 7th row uses the same 7-column layout, just shows the 7th chord names instead

**Option B: Inline 7th names below triads in the same cell**
- Each cell shows both the triad and 7th chord name, e.g., "C" on top, "Cmaj7" below in smaller text
- More compact but potentially cluttered

**Option C: Separate "7ths" table**
- A completely separate table that shows diatonic 7ths per key
- More UI surface area but avoids cluttering the existing table

**Recommendation:** Option A — it's the cleanest UX, preserves the existing table, and makes 7ths a first-class but toggleable layer.

### UI Designer
For Option A:

- Add a toggle next to the filter pills: a "7ths Row" toggle button or simply integrate it with the existing "7ths" pill behavior
- The 7th sub-row appears directly beneath each key's triad row, with a slightly different background tint to visually distinguish it
- 7th chord names use slightly smaller font and a subtle left-border or icon to indicate they're extensions
- Column styling follows the same degree-based coloring (maj7 cells get major color, m7 cells get minor color, etc.)
- The quality labels in the header could show both: "maj" and "maj7" when 7ths are enabled
- Highlighted chord matching works the same — if "Am7" is somehow selected, it highlights in the 7th row

**Mobile card layout:** The 7th chords appear as a second row within each card, below the triad grid, with a label like "7ths:" to distinguish them.

### UI Developer

**Key insight:** The data is already there. `getChordsForKey()` returns both triads AND 7ths. We just need to:
1. Separate the 7th chords from the triad chords in the row rendering
2. Add a toggle to show/hide the 7th sub-row
3. Render a second `<tr>` (desktop) or second grid row (mobile) with the 7th chords

**No changes needed to:**
- `musicTheory.ts` — already generates diatonic 7ths
- `chords-seventh.ts` — database is complete
- `ChordContext.tsx` — no global state changes
- `types/index.ts` — no new types

**Only file to change:** `KeyChordTable.tsx`

### Guitar Domain Expert
This is a highly valuable feature. In real-world playing:

- **Minor 7th chords** (ii7, iii7, vi7) are the backbone of jazz, R&B, neo-soul, and modern pop progressions
- Guitarists constantly need to know: "What's the ii-V-I in this key?" → showing Dm7-G7-Cmaj7 at a glance is immediately useful
- The **7th chord quality labels** for the header should be: `maj7, m7, m7, maj7, 7, m7, m7b5` (matching the diatonic 7th formula)
- The diatonic 7th row gives the full picture: every degree's natural 7th extension

**Important:** The 7th chord row should use proper jazz/theory naming:
- Degree I: maj7 (e.g., Cmaj7)
- Degree II: m7 (e.g., Dm7)
- Degree III: m7 (e.g., Em7)
- Degree IV: maj7 (e.g., Fmaj7)
- Degree V: 7 (e.g., G7) — dominant 7th, not "maj7"
- Degree VI: m7 (e.g., Am7)
- Degree VII: m7b5 (e.g., Bm7b5) — half-diminished

### UI Integration Tester
Integration points to verify:
- The 7th sub-row must use the **effective (transposed) key** when key stepping is active — same `useEffectiveChords` hook
- Chord highlighting must work in the 7th row — if a user could select "Dm7", it should highlight
- The expanded area should still show 7th voicings when the "7ths" filter pill is active (no change to existing behavior)
- Mobile card layout must also show the 7th row when the toggle is on
- The "7ths Row" toggle state should be independent of the existing "7ths" filter pill (the pill controls expanded diagrams; the toggle controls the table sub-row)

### UI Regression Tester
Risk areas:
- Table column alignment — the 7th sub-row must align perfectly with the triad row's 7 columns
- Desktop table `minWidth: 700px` — 7th chord names like "Bm7b5" are wider than "B"; verify no overflow
- The existing expand/collapse behavior must not interfere with the 7th sub-row
- Mobile card layout must handle the extra row without breaking the 4-column grid
- Both themes (dark + light) must look correct with the 7th sub-row tint

---

## Detailed Implementation Plan

### Step 1: Add "Show 7ths" toggle state

In `KeyChordTable`, add a local state toggle:

```typescript
const [show7thRow, setShow7thRow] = useState(false);
```

### Step 2: Add the toggle button in the filter pills area

Add a toggle button after the existing filter pills, separated by a divider:

```tsx
{/* Divider */}
<div
  className="flex-shrink-0 w-px h-5 mx-1"
  style={{ backgroundColor: 'var(--color-border)' }}
/>
{/* 7th row toggle */}
<button
  onClick={() => setShow7thRow(prev => !prev)}
  aria-pressed={show7thRow}
  className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-150 cursor-pointer"
  style={{
    backgroundColor: show7thRow ? 'var(--chord-7th-border)' : 'var(--color-surface)',
    color: show7thRow ? '#fff' : 'var(--color-text-muted)',
    border: `1px solid ${show7thRow ? 'var(--chord-7th-border)' : 'var(--color-border)'}`,
  }}
>
  7th Row
</button>
```

### Step 3: Add 7th quality labels constant

```typescript
const SEVENTH_QUALITY_LABELS = ['maj7', 'm7', 'm7', 'maj7', '7', 'm7', 'm7b5'] as const;
```

### Step 4: Pass `show7thRow` to KeyRow and KeyChordMobileCard

Add `show7thRow: boolean` to `KeyRowProps` and pass it through.

### Step 5: Extract diatonic 7ths in KeyRow

In both `KeyRow` and `KeyChordMobileCard`, extract the 7th chords:

```typescript
const sevenths = effectiveChords.filter(
  (c) => c.chordType === 'seventh' &&
    (c.quality === 'major7' || c.quality === 'minor7' || c.quality === 'dominant7' || c.quality === 'minor7b5')
);
```

### Step 6: Render 7th sub-row in desktop table (KeyRow)

After the main triad `<tr>`, conditionally render a 7th `<tr>`:

```tsx
{show7thRow && sevenths.length > 0 && (
  <tr className="transition-colors duration-150">
    {/* Empty key cell */}
    <td
      style={{
        backgroundColor: 'var(--kct-header-bg)',
        borderRight: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border-subtle)',
        padding: '4px 2px',
        textAlign: 'center',
      }}
    >
      <span className="text-[10px] font-medium" style={{ color: 'var(--color-text-muted)' }}>
        7ths
      </span>
    </td>
    {sevenths.map((chord, i) => {
      const colType = COLUMN_TYPES[i]; // same degree-based coloring
      const baseStyle = getColumnStyle(colType);
      const isHighlighted = highlightedChords.includes(chord.name);
      const cellStyle: React.CSSProperties = {
        ...baseStyle,
        borderBottom: '1px solid rgba(0,0,0,0.12)',
        borderRight: i < 6 ? '1px solid rgba(0,0,0,0.08)' : undefined,
        padding: '5px 4px',
        textAlign: 'center',
        fontSize: '0.75rem',
        fontWeight: isHighlighted ? 800 : 500,
        opacity: isHighlighted ? 1 : 0.75,
        whiteSpace: 'nowrap',
      };
      if (isHighlighted) {
        cellStyle.backgroundColor = 'var(--color-primary)';
        cellStyle.color = 'var(--color-text-on-primary)';
        cellStyle.fontStyle = 'normal';
      }
      return (
        <td key={chord.name} style={cellStyle} title={`${chord.name} (${chord.romanNumeral})`}>
          {chord.name}
        </td>
      );
    })}
  </tr>
)}
```

### Step 7: Render 7th row in mobile card (KeyChordMobileCard)

After the triad grid, conditionally render a second 4-column grid:

```tsx
{show7thRow && sevenths.length > 0 && (
  <div
    className="grid grid-cols-4"
    style={{ backgroundColor: 'var(--color-border-subtle)' }}
  >
    {sevenths.map((chord, i) => {
      const isHighlighted = highlightedChords.includes(chord.name);
      const colStyle = getColumnStyle(COLUMN_TYPES[i]);
      return (
        <div
          key={chord.name}
          className="text-center py-1.5 px-1"
          style={{
            backgroundColor: isHighlighted ? 'var(--color-primary)' : colStyle.backgroundColor,
            color: isHighlighted ? 'var(--color-text-on-primary)' : colStyle.color,
            borderRight: i % 4 !== 3 ? '1px solid var(--color-border-subtle)' : undefined,
            borderBottom: '1px solid var(--color-border-subtle)',
            opacity: isHighlighted ? 1 : 0.8,
          }}
        >
          <div className="text-[9px] font-medium" style={{ opacity: 0.7 }}>
            {SEVENTH_QUALITY_LABELS[i]}
          </div>
          <div className="text-xs font-bold" style={{ fontStyle: COLUMN_TYPES[i] === 'minor' ? 'italic' : 'normal' }}>
            {chord.name}
          </div>
        </div>
      );
    })}
  </div>
)}
```

### Step 8: Add 7th quality sub-header row in desktop table (optional enhancement)

When `show7thRow` is active, show a second quality label row in the header showing `maj7, m7, m7, maj7, 7, m7, m7b5` — or simply rely on the per-cell tooltips and the "7ths" label in the KEY column.

**Decision:** Skip the extra header row for simplicity. The "7ths" label in the key cell and the chord names themselves make the quality clear.

---

## Music Theory Considerations

| Degree | Major Key Triad | Major Key 7th | Quality |
|--------|----------------|---------------|---------|
| I | C | Cmaj7 | major7 |
| II | Dm | Dm7 | **minor7** |
| III | Em | Em7 | **minor7** |
| IV | F | Fmaj7 | major7 |
| V | G | G7 | dominant7 |
| VI | Am | Am7 | **minor7** |
| VII | Bdim | Bm7b5 | half-diminished |

Three of the seven diatonic 7th chords are minor 7ths (degrees II, III, VI). These are the most commonly used extended chords in popular music.

---

## Testing Strategy

### Integration Tests
1. Toggle "7th Row" on → all key rows show a 7th sub-row with correct chord names
2. Key of C shows: Cmaj7, Dm7, Em7, Fmaj7, G7, Am7, Bm7b5
3. Key stepping: step E up to F → 7th row updates to: Fmaj7, Gm7, Am7, Bbmaj7, C7, Dm7, Em7b5
4. Highlighted chords work in 7th row
5. Mobile card layout shows 7th row below triad grid when toggled on
6. Expanding a row still works independently of the 7th toggle

### Regression Tests
1. Toggle off → table looks exactly like before (no 7th rows)
2. Existing filter pills still control expanded diagrams independently
3. Desktop table alignment — 7th sub-row columns align with triad row
4. Both themes look correct
5. "7th Row" toggle state persists while switching between keys/filters

---

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| "Bm7b5" overflows narrow column | Low | Use `text-[0.75rem]` and `whitespace-nowrap`; column is ~85px min which fits |
| Confusion between "7th Row" toggle and "7ths" filter pill | Medium | "7th Row" shows names in table; "7ths" pill shows diagrams in expanded area. Tooltip clarifies. Could also auto-activate the "7ths" pill when "7th Row" is toggled on |
| Visual clutter with 7th rows always visible | Low | Toggle is off by default; user opts in |
| 7th sub-row ordering doesn't match triads | Low | Both use `scaleDegree` ordering from `getChordsForKey()` |

---

## Summary

**Scope:** Single-file change to `KeyChordTable.tsx`
**Complexity:** Low — the data and music theory already exist; this is purely a display change
**New UI element:** "7th Row" toggle button in filter pill area + 7th sub-row per key
**Default state:** Off — user toggles on to see diatonic 7th chords
**Files to change:** 1 (`src/components/KeyChordTable.tsx`)
