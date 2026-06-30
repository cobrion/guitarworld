# Chord Analyzer — Scale Fretboard with Chord Degree Markers

## Problem Statement

The Chord Analyzer tab currently shows how chords are built from scales (IntervalBuilder), how they transform from major (ChordTransformation), and side-by-side fingering diagrams (ChordDiagram). But there's no visualization that connects the chord's finger positions to the *scale* on the actual guitar fretboard.

**Goal:** Add a full guitar fretboard to the Chord Analyzer that displays the parent scale with the chord's interval degrees (1st, 3rd, 5th, etc.) highlighted, so guitarists can see exactly where chord tones sit within the scale context.

---

## Team Analysis

### Technical Architect

The existing infrastructure is ideal — `GuitarNeck` already renders a fretboard from `ChordTone[]`, and both `getAllChordTones()` and `getAllScaleTones()` produce that exact type. The challenge is combining them into a single visualization with two visual tiers: **chord tones** (prominent, labeled with degree numbers) and **non-chord scale tones** (present but subdued).

**Approach:** Create a new component `ChordScaleNeck` that:
1. Computes the full scale tones for the fretboard
2. Computes the chord tones for the fretboard
3. Renders all scale tones as dots, but distinguishes chord tones with prominent styling and degree labels (1st, 3rd, 5th, etc.)
4. Optionally highlights the specific voicing's finger positions with a ring/outline to connect the abstract scale view to the concrete fingering

### UI Designer

**Visual hierarchy (three tiers):**
1. **Chord tones on the scale** — full-color dots with degree label inside (e.g., "1", "3", "5", "b7"). These use the existing `INTERVAL_COLORS` palette.
2. **Non-chord scale tones** — small, muted dots (gray or very low opacity) with note name inside. Shows scale context without competing visually.
3. **Voicing finger positions** (optional overlay) — the specific voicing's fretted positions get a bright ring/outline around their dots, connecting this view to the ChordDiagram fingering above.

**Layout:** Horizontal orientation works best in the Chord Analyzer's vertical scroll layout. Show frets 0–12 (enough to see the pattern repeat at the octave). Add a section header like "Chord tones on the {root} {major/minor} scale".

### UI Developer

**Key implementation decisions:**
- Reuse `GuitarNeck` + `NeckFretboardGrid` for the fretboard grid rendering
- Create a new `ChordScaleNoteDots` component (replacing `NeckNoteDots` for this use case) that renders the two-tier dot system
- The degree labels inside dots should show the interval shorthand: "R", "3", "b3", "5", "b7", etc. — matching the existing IntervalBuilder/ChordTransformation terminology
- For the voicing overlay, compute actual fret positions from the voicing using `getVoicingChordTones()`

### Guitar Domain Expert

**Musical accuracy considerations:**
- The parent scale should be determined by chord family: major-family chords → major scale, minor-family chords → natural minor scale. This matches the existing `MINOR_FAMILY_QUALITIES` set already in ChordAnalyzer.
- For extended chords (9th, 11th, 13th), all chord tones should be marked even though they span beyond one octave — the fretboard naturally handles octave wrapping.
- For altered chords (dom7#9, dom7b9, aug7), the altered tones won't appear in the parent scale — they should still be shown prominently but with a visual indicator (e.g., dashed outline) that they're "outside" the scale.
- Sus chords: sus2 uses the 2nd degree, sus4 uses the 4th — both are scale tones in major, so they appear naturally.
- Diminished/augmented chords have altered 5ths (b5, #5) that fall outside the parent scale — same treatment as altered dominants.

### UI Integration Tester

**Data flow verification:**
- `getAllScaleTones(root, scaleKind, totalFrets)` → all scale positions on fretboard
- `getAllChordTones(root, quality, totalFrets)` → all chord tone positions on fretboard
- `getVoicingChordTones(root, quality, voicing)` → specific voicing positions
- Cross-reference: every chord tone that also appears in the scale should be marked as "in-scale chord tone". Chord tones not in the scale are "altered" tones.

### UI Regression Tester

**Risk areas:**
- The Chord Analyzer currently has no `GuitarNeck` — adding one shouldn't break existing sections, but need to verify scroll behavior and responsive layout.
- The `ChordTone` type is shared across many components — we're not changing it, just consuming it differently.
- Ensure the fretboard doesn't overflow on mobile (horizontal scroll wrapper needed, same pattern as existing `GuitarNeck` usage).

---

## Architectural Approach

### New Component: `ChordScaleNeck`

A wrapper that composes `NeckFretboardGrid` + a new `ChordScaleNoteDots` to render the combined scale/chord view.

### New Component: `ChordScaleNoteDots`

Replaces `NeckNoteDots` for this specific use case. Renders three types of dots:

| Dot Type | Condition | Appearance |
|----------|-----------|------------|
| **Chord tone** | Note is in chord formula | Full-color filled circle, interval label inside (R, 3, 5, b7…), full opacity |
| **Scale tone** | Note is in scale but not chord | Small gray circle, note name inside, ~0.3 opacity |
| **Voicing position** | Note is in the active voicing | Bright white ring around the chord tone dot |

### No New Utility Functions Needed

All computation already exists:
- `getAllScaleTones()` — scale tones on fretboard
- `getAllChordTones()` — chord tones on fretboard
- `getVoicingChordTones()` — voicing-specific positions

---

## File-by-File Changes

### 1. `src/components/ChordScaleNoteDots.tsx` (NEW)

New component that renders the two-tier dot system on the fretboard.

**Props:**
```typescript
interface ChordScaleNoteDotsProps {
  scaleTones: ChordTone[];    // all scale positions
  chordTones: ChordTone[];    // all chord tone positions  
  voicingTones: ChordTone[];  // specific voicing positions (for ring overlay)
  layout: NeckLayout;
}
```

**Rendering logic:**
1. Build a Set of `"string-fret"` keys from `chordTones` for O(1) lookup
2. Build a Set of `"string-fret"` keys from `voicingTones` for voicing overlay
3. For each `scaleTone`:
   - If it's also a chord tone → render full-color dot with interval label
   - If it's scale-only → render small muted dot with note name
4. For chord tones NOT in the scale (altered tones): render them separately with a dashed-outline style
5. For voicing positions: add a white ring around those dots

**Dot sizes:**
- Chord tone dots: radius 11 (same as existing `NeckNoteDots`)
- Scale-only dots: radius 7 (smaller, subdued)
- Voicing ring: radius 14 (outside the chord tone dot)

**Labels inside dots:**
- Chord tones: show interval label (R, 3, b3, 5, etc.) — fontSize 9, bold
- Scale-only tones: show note name — fontSize 7, lighter weight

### 2. `src/components/ChordScaleNeck.tsx` (NEW)

Wrapper component composing the fretboard grid + chord scale dots.

**Props:**
```typescript
interface ChordScaleNeckProps {
  root: NoteName;
  quality: ChordQuality;
  voicing: ChordVoicing | null;
  orientation?: Orientation;  // default 'horizontal'
  totalFrets?: number;        // default 12
}
```

**Logic:**
1. Determine scale kind from quality (using `MINOR_FAMILY_QUALITIES`)
2. `useMemo` → `getAllScaleTones(root, scaleKind, totalFrets)`
3. `useMemo` → `getAllChordTones(root, quality, totalFrets)`
4. `useMemo` → if voicing, `getVoicingChordTones(root, quality, voicing)`, else `[]`
5. Build layout using the same `buildLayout()` from `GuitarNeck` (extract to shared util or duplicate — prefer extraction)
6. Render `<NeckFretboardGrid>` + `<ChordScaleNoteDots>`

### 3. `src/components/GuitarNeck.tsx` (MODIFY)

Extract `buildLayout()` and the layout constants (`STRING_SPACING`, `FRET_SPACING`, `PAD_LABEL`, `PAD_NUT`) into a shared export so `ChordScaleNeck` can reuse them without duplication.

**Change:** Export `buildLayout` and constants. Move them to the top of the file or into a small `neckLayout.ts` util if preferred.

### 4. `src/components/ChordAnalyzer.tsx` (MODIFY)

Add the `ChordScaleNeck` section between the fingering comparison and the info panel.

**Additions:**
```typescript
import ChordScaleNeck from '@/components/ChordScaleNeck';
```

New section (after the ChordTransformation/fingering block, before the info panel):

```tsx
{/* Scale fretboard — chord tones in scale context */}
<div className="rounded-lg px-4 py-3 mb-5" style={{
  backgroundColor: 'var(--color-surface)',
  border: '1px solid var(--color-border-subtle)',
}}>
  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
    <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
      <span style={{ color: 'var(--color-primary)' }}>{chordName}</span> tones on the{' '}
      <span style={{ color: 'var(--color-text)' }}>{selectedRoot} {isMinorFamily ? 'minor' : 'major'} scale</span>
    </span>
    <div className="flex gap-3 text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
      <span>● chord tone</span>
      <span style={{ opacity: 0.4 }}>● scale tone</span>
      {chordVoicing && <span>◎ voicing</span>}
    </div>
  </div>
  <ChordScaleNeck
    root={selectedRoot}
    quality={selectedQuality}
    voicing={chordVoicing}
  />
</div>
```

**Also add** the `isMinorFamily` derived value (already computed inline for IntervalBuilder — extract to a shared const at the top of the component body):
```typescript
const isMinorFamily = MINOR_FAMILY_QUALITIES.has(selectedQuality);
```

---

## Music Theory Considerations

### Scale Selection Logic
| Chord Family | Parent Scale | Example |
|-------------|-------------|---------|
| Major, dom7, maj7, aug, sus2, sus4, add9, dom9, maj9, dom11, dom13, power, maj6 | Major | C major scale for C, C7, Cmaj7 |
| Minor, m7, m7b5, dim, dim7, m9, m11, m6, minadd9 | Natural Minor | C natural minor for Cm, Cm7, Cdim |
| dom7#9, dom7b9, aug7 | Major (but altered tones fall outside) | C major for C7#9 — the #9 is chromatic |

### Altered Tones (Outside Scale)
These chord tones don't exist in the parent scale:
- `b5` in dim/m7b5 — exists in minor scale? No (minor scale has natural 5). Actually b5 is *not* in natural minor. Show with dashed outline.
- `#5` in aug/aug7 — not in major scale. Dashed outline.
- `bb7` in dim7 — not in natural minor (which has b7). Dashed outline.
- `#9` in dom7#9 — not in major scale. Dashed outline.
- `b9` in dom7b9 — not in major scale. Dashed outline.

Visual treatment: dashed stroke on the dot border, same color fill, to indicate "chromatic alteration."

---

## Testing Strategy

### Integration Tests
1. **C major** — all 3 chord tones (C, E, G) appear as highlighted dots on the major scale; remaining scale tones (D, F, A, B) appear muted
2. **Am** — chord tones (A, C, E) highlighted on A natural minor; non-chord scale tones (B, D, F, G) muted
3. **G7** — 4 tones (G, B, D, F) highlighted; F is the b7, which IS in the major scale (no, wait — F is the 7th scale degree lowered... actually G major scale has F#, not F). So b7 (F) is an altered tone for G major scale. Show with dashed outline.
4. **Voicing overlay** — select C major open position: verify that strings 0(open E), 1(fret 3 C), 2(fret 2 E), 3(fret 0 G), 4(fret 1 C), 5(fret 0 E) get the white ring marker

### Regression Tests
1. Existing IntervalBuilder still renders correctly
2. Existing ChordTransformation still renders correctly
3. Existing ChordDiagram fingering comparison still renders correctly
4. Responsive behavior — fretboard scrolls horizontally on narrow screens
5. All 24 chord qualities produce valid fretboard visualizations (no crashes, no empty boards)

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Performance with many dots (6 strings × 13 frets × scale tones) | Low | Low | Max ~91 SVG elements — trivial for browsers |
| Altered tone logic wrong for edge-case qualities | Medium | Medium | Unit test the scale-membership check for each quality |
| Mobile overflow | Low | Low | Same `overflow-x-auto` wrapper pattern used everywhere |
| `buildLayout` extraction breaks `GuitarNeck` | Low | High | Verify existing GuitarNeck usages still work after refactor |
| Dominant 7th b7 shown as "in scale" when it's not | Medium | Medium | Explicitly check each chord tone's chromatic index against the scale's chromatic indices, don't assume |

---

## Implementation Order

1. Extract `buildLayout` + constants from `GuitarNeck.tsx` → shared export
2. Create `ChordScaleNoteDots.tsx` — the rendering heart of this feature
3. Create `ChordScaleNeck.tsx` — compose grid + dots
4. Add section to `ChordAnalyzer.tsx`
5. Test all 24 qualities, both orientations, verify altered tone display
6. Responsive/mobile verification
