# Key Step Transposition (+/- Buttons)

## Explore Team Investigation

**Date:** 2026-03-17
**Status:** Plan complete — ready for implementation

---

## Problem Statement

Users viewing the KeyChordTable (the "Major Key" table showing which keys contain their selected chords) want the ability to **transpose a key row up or down by semitone** to quickly explore neighboring keys and see how the diatonic chords shift. This is useful for:

- Finding easier chord voicings by stepping a key up/down
- Exploring key relationships and how chord progressions transpose
- Quickly comparing "what if I capo'd up one fret?" scenarios

**Requested UX:** Add `+` and `−` buttons next to each key name in the leftmost column. Clicking `+` steps that row's key up one semitone; clicking `−` steps it down one semitone. The row updates in-place to show the new key's diatonic chords.

---

## Brainstorm Phase

### Technical Architect
This is a **local UI-only feature** — no global state changes needed. Each row in the KeyChordTable independently tracks an optional key offset (semitones). The offset shifts which key is displayed and which diatonic chords are generated for that row, while the row's *original* key (the one that matched the user's chord selection) remains the anchor.

**Key decision:** The offset is local component state per-row, not persisted to context or localStorage. It's a transient exploration tool.

### UI Designer
The `+`/`−` buttons should:
- Sit immediately to the left and right of the key name (e.g., `− E ▸ +`)
- Be small, unobtrusive, and consistent with the existing dark theme
- Use the same muted color scheme as the KEY column header
- Have clear hover/active states so they feel responsive
- Not shift the layout — the KEY column width (56px) needs to accommodate the buttons, so we may need to widen it slightly (to ~80px) or stack vertically
- Show the **original key** as a subtle label when offset ≠ 0, so the user remembers which key they started from (e.g., "F" shown with a small "(from E)" annotation or a reset button)

**Accessibility:** Buttons need `aria-label`s ("Step key up", "Step key down"), and keyboard users should be able to tab to them.

### UI Developer
**Implementation approach:**
- Add `keyOffsets` state (`Record<Key, number>`) to `KeyChordTable` component (local state)
- In `KeyRow`, compute `effectiveKey` from `row.key` + offset using `ALL_KEYS` circular indexing
- Regenerate chords for the effective key via `getChordsForKey(effectiveKey, 'major')`
- Render `+`/`−` buttons in the key label cell
- When offset ≠ 0, show a reset indicator (click key name to reset, or show original key as subscript)

**No changes needed to:**
- `ChordContext` (global state unchanged)
- `musicTheory.ts` (existing `getChordsForKey` handles any key)
- `types/index.ts` (no new types required)
- Chord databases (already have all 12 keys)

### Guitar Domain Expert
This feature maps directly to the **capo concept** — stepping a key up by N semitones is equivalent to placing a capo at fret N. Guitarists think about this constantly:

- "This song is in E but I want to play it in F — what chords do I need?"
- "Can I find an easier set of chord shapes by shifting the key?"

**Important musical consideration:** The highlighted chords (the user's selected chords from KeySelector) should remain highlighted in the transposed row ONLY if they still appear as diatonic chords in the new key. If the user selected "A" and "E", and they step the E-key row up to F, "A" is no longer diatonic to F major — so it should lose its highlight. This is correct behavior and helps the user see which of their selected chords survive the transposition.

**Edge case:** Enharmonic display. Stepping C# up gives D (not Db). The existing `ALL_KEYS` array already handles this correctly since it uses the conventional spelling for each key.

### UI Integration Tester
**Integration points to verify:**
- Row expansion still works correctly after transposition (expanded area shows chords for the *effective* key, not the original)
- Chord type filters (Simple Triads, 7ths, etc.) apply correctly to transposed rows
- Highlighted chords update correctly — only highlight if the selected chord appears in the transposed key's diatonic set
- The `rows` filtering logic (which keys contain the selected chords) should NOT change — the rows shown are still determined by the original keys, only the displayed content transposes

### UI Regression Tester
**Regression risks:**
- KEY column width change could affect table layout on mobile/small screens
- Adding buttons could interfere with the existing click-to-expand behavior on the key cell
- Row highlight logic must not break for non-transposed rows (offset = 0)
- Performance: `getChordsForKey` is already called 12 times on mount — calling it again per transposition is trivial (pure computation, no DB calls)

---

## Analysis Phase

### Affected Files

| File | Change Type | Description |
|------|------------|-------------|
| `src/components/KeyChordTable.tsx` | **Modified** | Add `keyOffsets` state, `+`/`−` buttons in KeyRow, compute effective key, regenerate chords |
| (No other files) | — | All music theory logic already exists |

### Architecture Decision: Offset Storage

**Option A (Recommended):** Store offsets in `KeyChordTable` as `Record<Key, number>` local state
- Pros: Simple, no prop drilling beyond what already exists, no global state pollution
- Cons: Offsets lost on component unmount (acceptable — this is exploratory)

**Option B:** Store in a `useRef` Map
- Unnecessary complexity; `useState` is fine since we want re-renders on change

### Architecture Decision: Effective Key Computation

```typescript
// In KeyRow or as a utility:
function getEffectiveKey(originalKey: Key, offset: number): Key {
  const currentIndex = ALL_KEYS.indexOf(originalKey);
  const newIndex = ((currentIndex + offset) % 12 + 12) % 12;
  return ALL_KEYS[newIndex];
}
```

This is a simple circular index into the `ALL_KEYS` array (12 items). The modular arithmetic handles wrapping in both directions.

---

## Detailed Implementation Plan

### Step 1: Add offset state to KeyChordTable

In `KeyChordTable` component, add:
```typescript
const [keyOffsets, setKeyOffsets] = useState<Record<Key, number>>({});

const handleStepKey = useCallback((key: Key, direction: 1 | -1) => {
  setKeyOffsets(prev => ({
    ...prev,
    [key]: (prev[key] ?? 0) + direction,
  }));
}, []);

const handleResetKey = useCallback((key: Key) => {
  setKeyOffsets(prev => {
    const next = { ...prev };
    delete next[key];
    return next;
  });
}, []);
```

### Step 2: Pass offset + handlers to KeyRow

Update `KeyRowProps` to include:
```typescript
interface KeyRowProps {
  row: KeyChordRow;
  isExpanded: boolean;
  highlightedChords: string[];
  onExpandToggle: (key: Key) => void;
  activeFilters: Set<FilterKey>;
  keyOffset: number;           // NEW
  onStepKey: (key: Key, direction: 1 | -1) => void;  // NEW
  onResetKey: (key: Key) => void;  // NEW
}
```

### Step 3: Compute effective key and regenerate chords in KeyRow

```typescript
function KeyRow({ row, keyOffset, onStepKey, onResetKey, ... }: KeyRowProps) {
  const effectiveKey = useMemo(() => {
    if (keyOffset === 0) return row.key;
    const idx = ALL_KEYS.indexOf(row.key);
    const newIdx = ((idx + keyOffset) % 12 + 12) % 12;
    return ALL_KEYS[newIdx];
  }, [row.key, keyOffset]);

  const effectiveChords = useMemo(
    () => keyOffset === 0 ? row.chords : getChordsForKey(effectiveKey, 'major'),
    [row.chords, effectiveKey, keyOffset]
  );

  // Use effectiveChords instead of row.chords for triads, allChords, filteredChords
  const triads = effectiveChords.filter(...);
  const allChords = effectiveChords;
  // ... rest unchanged
}
```

### Step 4: Render +/− buttons in the key label cell

Replace the current key label cell content:

```tsx
<td
  className="text-center text-sm font-bold"
  style={{
    backgroundColor: isExpanded ? 'var(--color-surface-raised)' : 'var(--kct-header-bg)',
    color: isExpanded ? 'var(--color-primary)' : 'var(--color-text)',
    borderRight: '1px solid var(--color-border)',
    borderBottom: '1px solid var(--color-border-subtle)',
    padding: '4px 2px',
    whiteSpace: 'nowrap',
  }}
>
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
    {/* Key name + expand toggle */}
    <div
      style={{ display: 'flex', alignItems: 'center', gap: '2px' }}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onStepKey(row.key, -1); }}
        aria-label={`Step ${effectiveKey} down one semitone`}
        className="text-xs rounded hover:bg-white/10 transition-colors"
        style={{
          color: 'var(--color-text-muted)',
          width: '18px',
          height: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          border: 'none',
          background: 'none',
          padding: 0,
        }}
      >−</button>

      <span
        onClick={() => onExpandToggle(row.key)}
        style={{ cursor: 'pointer', minWidth: '24px', textAlign: 'center' }}
        title="Click to show/hide chord fingerings"
      >
        {effectiveKey} {isExpanded ? '▾' : '▸'}
      </span>

      <button
        onClick={(e) => { e.stopPropagation(); onStepKey(row.key, 1); }}
        aria-label={`Step ${effectiveKey} up one semitone`}
        className="text-xs rounded hover:bg-white/10 transition-colors"
        style={{
          color: 'var(--color-text-muted)',
          width: '18px',
          height: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          border: 'none',
          background: 'none',
          padding: 0,
        }}
      >+</button>
    </div>

    {/* Original key indicator when transposed */}
    {keyOffset !== 0 && (
      <button
        onClick={() => onResetKey(row.key)}
        className="text-[9px] opacity-60 hover:opacity-100 transition-opacity"
        style={{
          color: 'var(--color-text-muted)',
          cursor: 'pointer',
          background: 'none',
          border: 'none',
          padding: 0,
        }}
        title="Click to reset to original key"
        aria-label={`Reset to original key ${row.key}`}
      >
        (from {row.key}) ✕
      </button>
    )}
  </div>
</td>
```

### Step 5: Widen KEY column

Change colgroup from 56px to 80px:
```tsx
<col style={{ width: '80px' }} />
```

And update the `th` width class accordingly.

---

## Music Theory Considerations

- **Transposition is chromatic**, not diatonic — each step moves by one semitone (half step), cycling through all 12 keys
- **ALL_KEYS order** (`C, C#, D, Eb, E, F, F#, G, Ab, A, Bb, B`) uses conventional enharmonic spellings — no double sharps/flats
- **Highlighted chord matching** after transposition: simply check if the selected chord name appears in the new key's diatonic chord names (existing logic handles this)
- **No offset limits needed** — wrapping via modular arithmetic means any integer offset maps to a valid key

---

## Testing Strategy

### Integration Tests
1. Click `+` on key E → row should show key F's diatonic chords (F, Gm, Am, Bb, C, Dm, Edim)
2. Click `−` on key C → row should show key B's diatonic chords (B, C#m, D#m, E, F#, G#m, A#dim)
3. With chords A and E selected, E row transposed to F → "A" should NOT be highlighted (A is not in F major), "E" should NOT be highlighted (E is not diatonic to F major... wait, E is vii° of F? No — Edim is degree 7. The chord name is "Edim", not "E". So the highlight check `selectedChords.includes(chord.name)` correctly won't match "E" against "Edim")
4. Expand a transposed row → chord diagrams should show voicings for the transposed key's chords
5. Toggle chord type filters on a transposed row → filters apply to transposed chords

### Regression Tests
1. Non-transposed rows remain unchanged in all behavior
2. Row expand/collapse still works alongside +/− buttons
3. Table layout doesn't break on mobile widths
4. All 12 keys × both directions wrap correctly (stepping C down = B, stepping B up = C)
5. Multiple rows can be independently transposed
6. KeySelector chord selection still filters rows correctly (by original key)

---

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| KEY column too narrow for buttons | Low | Widen to 80px; use compact button sizing |
| Click target confusion (expand vs step) | Medium | Separate click areas: buttons for step, key name for expand |
| Performance on rapid clicking | Low | `getChordsForKey` is pure computation, ~0.1ms per call |
| User confusion about original vs transposed key | Medium | Show "(from X) ✕" reset indicator when offset ≠ 0 |
| Mobile touch targets too small | Low | 18px buttons meet minimum; test on touch devices |

---

## Summary

**Scope:** Single-file change to `KeyChordTable.tsx`
**Complexity:** Low-medium — local state + UI buttons + chord regeneration
**Dependencies:** None — all required music theory utilities already exist
**Estimated changes:** ~60 lines added/modified in `KeyChordTable.tsx`
