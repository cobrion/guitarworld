# Multiple Voicings with Navigation — Implementation Plan

## Problem Statement

The Chord Analyzer has `«` / `»` voicing navigation buttons, but they never appear because every chord in the database has exactly 1 voicing. Guitarists need to see multiple ways to play the same chord — open position, barre shapes at different neck positions, partial voicings, etc.

## Team Analysis

### Technical Architect

**Two approaches considered:**

1. **Manual data entry** — hand-code 3–5 voicings per chord across ~140 entries. Accurate but massive effort (~500+ voicing objects).
2. **Algorithmic generation** — recognize that barre chord shapes are *moveable*. The database already has E-shape and A-shape barre patterns. Transpose them to generate voicings for any root automatically.

**Recommendation: Hybrid approach.** Generate moveable voicings algorithmically from template shapes, then combine with the existing database voicing (which is often the best open-position voicing). This gives every chord 3–6 voicings instantly with zero manual data entry.

The existing `getMovableBarrePositions()` in `chordTones.ts` already does the transposition math but only returns barre positions, not full `ChordVoicing` objects. We extend this pattern to return complete voicings.

### Guitar Domain Expert

**The CAGED system** — every chord can be played using 5 moveable shapes derived from the open C, A, G, E, D chord forms. For the Chord Analyzer, the most practical voicings to show are:

1. **Open position** (if one exists) — the beginner-friendly form already in the database
2. **E-shape barre** — root on string 6 (low E), full 6-string barre. E.g., F major at fret 1, G major at fret 3
3. **A-shape barre** — root on string 5 (A string), 5-string barre. E.g., B major at fret 2, C major at fret 3

For minor chords: Em-shape and Am-shape barres. For 7ths: E7-shape and A7-shape, etc.

**Sort order:** Voicings should be sorted by position on the neck (lowest baseFret first), so navigation feels like moving up the fretboard.

### UI Designer

**Navigation UX improvements:**

- The `«` `»` buttons are good but need a position indicator — show which fret region each voicing is at (e.g., "Open", "3rd fret", "8th fret")
- Add a subtle label like "Voicing 2 of 4 · 5th fret" so the user knows where they are on the neck
- The scale fretboard voicing overlay should update as the user navigates, reinforcing the connection between diagram and fretboard

### UI Developer

**Implementation approach:**

Create a utility function `getAllVoicingsForChord(root, quality)` that:
1. Gets the database voicing (open position if available)
2. Scans all database entries of the same quality for moveable barre shapes
3. Transposes each moveable shape to the target root
4. Deduplicates (same strings + same absolute frets = same voicing)
5. Sorts by ascending neck position
6. Returns `ChordVoicing[]`

This replaces `lookupChord()` usage in ChordAnalyzer with a richer result.

### Devil's Advocate

**Challenges to address:**

1. **Duplicate voicings** — An F major E-shape barre at fret 1 is already in the database as 'F'. The algorithm must deduplicate by comparing actual fret positions, not just shapes.
2. **Voicing quality** — Not all transposed shapes sound good everywhere. An open D-shape moved to the 10th fret is technically valid but impractical. Limit generated voicings to positions where `baseFret + maxRelativeFret ≤ 15`.
3. **Extended chords** — 9th, 11th, 13th chords often only have one practical voicing. The algorithm should gracefully handle cases where only 1 voicing exists (hide nav buttons, which already works).
4. **Finger numbering** — When transposing, the finger assignments from the template shape carry over correctly since they're relative to the shape, not absolute positions.

### UI Integration Tester

**Verification points:**
- C major should produce: open position + E-shape at fret 8 + A-shape at fret 3 (at minimum)
- Am should produce: open position + Em-shape barre at fret 5 + Am-shape at higher position
- Navigation updates both the ChordDiagram and the scale fretboard voicing overlay
- `safeIndex` wraps correctly at boundaries

### UI Regression Tester

**Risk areas:**
- Other tabs that use `lookupChord()` are unaffected (we're only changing ChordAnalyzer)
- The ChordDiagram component already handles any valid `ChordVoicing` — no changes needed there
- Verify barre indicators render correctly for generated voicings

---

## File-by-File Changes

### 1. `src/utils/chordTones.ts` (MODIFY)

Add new function `getAllVoicingsForChord()`:

```typescript
export function getAllVoicingsForChord(
  targetRoot: NoteName,
  quality: ChordQuality,
  maxFret: number = 15,
): ChordVoicing[] {
  const suffix = qualitySuffix(quality);
  const targetRootIndex = noteToIndex(targetRoot);
  const targetChordName = targetRoot + suffix;

  // Start with the database voicing for this exact chord (if any)
  const directData = chordDatabase[targetChordName];
  const voicings: ChordVoicing[] = directData ? [...directData.voicings] : [];

  // Scan all roots for moveable shapes of the same quality
  const ALL_ROOTS: NoteName[] = [
    'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F',
    'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
  ];

  for (const sourceRoot of ALL_ROOTS) {
    const chordName = sourceRoot + suffix;
    const data = chordDatabase[chordName];
    if (!data) continue;

    const sourceRootIndex = noteToIndex(sourceRoot);
    const distance = ((targetRootIndex - sourceRootIndex) % 12 + 12) % 12;

    for (const voicing of data.voicings) {
      // Only transpose moveable shapes (no open strings)
      const hasOpenString = voicing.strings.some((s) => s === 0);
      if (hasOpenString) continue;
      if (voicing.barres.length === 0) continue;

      const playedFrets = voicing.strings.filter((s): s is number => s !== null);
      const maxRelativeFret = Math.max(...playedFrets);

      for (const offset of [0, 12, -12]) {
        const newBaseFret = voicing.baseFret + distance + offset;
        if (newBaseFret < 1) continue;
        if (newBaseFret - 1 + maxRelativeFret > maxFret) continue;

        voicings.push({
          ...voicing,
          baseFret: newBaseFret,
          barres: voicing.barres.map((b) => ({ ...b })),
        });
      }
    }
  }

  // Deduplicate by absolute fret positions
  // Sort by neck position (lowest baseFret first)
  // Return unique voicings
}
```

**Deduplication key:** For each voicing, compute the absolute fret for every string: `string === null ? 'x' : string === 0 ? '0' : (baseFret - 1 + string)`. Join as a string key. Keep first occurrence.

**Sort:** By `baseFret` ascending, then by number of muted strings ascending (prefer fuller voicings).

### 2. `src/components/ChordAnalyzer.tsx` (MODIFY)

Replace:
```typescript
const allChordVoicings = useMemo(() => {
  const data = lookupChord(chordName, selectedRoot);
  return data?.voicings ?? [];
}, [chordName, selectedRoot]);
```

With:
```typescript
const allChordVoicings = useMemo(
  () => getAllVoicingsForChord(selectedRoot, selectedQuality),
  [selectedRoot, selectedQuality],
);
```

Update the voicing label to show neck position:
```typescript
const voicingLabel = chordVoicing
  ? chordVoicing.baseFret === 1
    ? 'Open'
    : `${chordVoicing.baseFret}${ordinalSuffix(chordVoicing.baseFret)} fret`
  : '';
```

Display below the counter: `"2 / 4 · 5th fret"`

### 3. No other files need changes

`ChordDiagram`, `ChordScaleNeck`, and all other components already accept any valid `ChordVoicing` — they work unchanged.

---

## Implementation Order

1. Add `getAllVoicingsForChord()` to `chordTones.ts` with dedup + sort
2. Wire into `ChordAnalyzer.tsx` replacing `lookupChord` usage
3. Enhance navigation label to show fret position
4. Test: C, Am, G7, F#m, Bb, Ebm — verify multiple voicings appear and navigation works
5. Build and deploy
