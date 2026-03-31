# Responsive Audit: Tablet & Mobile Compatibility

## Explore Team Investigation

**Date:** 2026-03-17
**Status:** Plan complete — ready for implementation

---

## Audit Methodology

Every component in `src/components/` was reviewed against three breakpoints:
- **Mobile phone:** 320px–480px (portrait), 480px–667px (landscape)
- **Tablet:** 768px–1024px (portrait & landscape)
- **Desktop baseline:** 1025px+ (current primary target)

The viewport meta tag is correctly set (`width=device-width, initial-scale=1.0`).

---

## Component-by-Component Audit

### 1. Header (`Header.tsx`) — PASS
- Uses `sm:` responsive breakpoints for padding and font sizes
- Icon scales from `w-10 h-10` to `w-12 h-12` at `sm:`
- `flex items-center justify-between` layout works at all widths
- **Verdict:** No changes needed

### 2. TabBar (`TabBar.tsx`) — PASS
- `flex-1` tabs split evenly at any width
- Sticky positioning works correctly
- Touch targets are adequate (full-width buttons with `py-3`)
- **Verdict:** No changes needed

### 3. KeySelector (`KeySelector.tsx`) — PASS (minor concern)
- Horizontal scroll with `overflow-x-auto` and `-webkit-overflow-scrolling: touch`
- Buttons have `min-width: 44px` and `min-height: 44px` — meets touch target guidelines
- `flex-shrink-0` prevents button compression
- `gap-1.5 sm:gap-2` adjusts spacing
- **Minor concern:** No scroll indicator — users may not realize more keys exist offscreen on very narrow screens (320px). But this is a minor UX polish, not a functional issue.
- **Verdict:** Functional. Optional enhancement noted below.

### 4. KeyChordTable (`KeyChordTable.tsx`) — ISSUES FOUND

**Issue KCT-1: Fixed `minWidth: 700px` table forces horizontal scroll on all mobile/tablet portrait views**
- The table has `style={{ minWidth: '700px', tableLayout: 'fixed' }}` (line 273)
- The outer `div` has `overflow-x-auto` so it scrolls, but the entire table is wider than the viewport on phones and portrait tablets
- The 7 chord columns + KEY column cannot compress below ~700px and remain readable
- **Severity:** Medium — functional (scrollable) but poor UX. Users must scroll horizontally to see all degrees.

**Issue KCT-2: Expanded row chord diagrams are cramped on mobile**
- When a row is expanded, each degree column shows `InlineChordCard` components with `maxWidth: 140px`
- On mobile the column width is ~85px (700px / 8 columns), so diagrams are squeezed
- The chord diagram SVG scales via `width: 100%` but becomes very small
- **Severity:** Medium — diagrams become hard to read below ~100px width

**Issue KCT-3: Filter pills wrap but don't scroll on narrow screens**
- `flex flex-wrap` works but can stack into 2-3 rows on a 320px screen, pushing content down significantly (6 pills × ~90px each)
- **Severity:** Low — functional but takes vertical space

**Issue KCT-4: Key step +/− buttons touch targets**
- The recently added +/− buttons are 18×18px — below the 44×44px recommended touch target
- The buttons have no padding around them, making them hard to tap on mobile
- **Severity:** Medium — functional but frustrating on touch devices

### 5. ChordGrid (`ChordGrid.tsx`) — PASS
- Uses `gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))'`
- This naturally adapts: 1 column on narrow phones, 2 on wide phones/small tablets, 3-4 on tablets, etc.
- **Verdict:** Well designed for responsive. No changes needed.

### 6. ChordCard (`ChordCard.tsx`) — PASS (minor concern)
- `rounded-xl p-4` is fine at all sizes
- `onMouseEnter/Leave` hover effects don't fire on touch — no harm, but no equivalent touch feedback
- **Minor:** Could add `active:` state for touch feedback, but not a functional issue
- **Verdict:** No changes needed

### 7. ChordDiagram (`ChordDiagram.tsx`) — PASS
- SVG with `viewBox` and `width: 100%` — scales perfectly to any container size
- `calculateDimensions(120, 160)` defines the viewBox, not the rendered size
- **Verdict:** Inherently responsive. No changes needed.

### 8. ChordAnalyzer (`ChordAnalyzer.tsx`) — ISSUES FOUND

**Issue CA-1: GuitarNeck in horizontal orientation overflows on mobile**
- `GuitarNeck` in horizontal mode has `minWidth: ${Math.min(layout.svgWidth, 700)}px` (line 100 of GuitarNeck.tsx)
- `layout.svgWidth` for horizontal = `PAD_LABEL(56) + FRET_SPACING(42) × 15 + 20 = 706px`
- So `minWidth` is 700px — forces horizontal scroll on any screen < 700px
- The outer div has `overflow-x-auto` so it scrolls, but the full neck isn't visible at once
- **Severity:** Medium — horizontal mode is designed for wider screens, and the app defaults to vertical on `< 640px`, but users can manually switch to horizontal on mobile

**Issue CA-2: GuitarNeck in vertical orientation is very tall**
- Vertical mode: `svgHeight = PAD_NUT(80) + FRET_SPACING(42) × 15 + 20 = 730px`
- The SVG scales to container width (`width: 100%`) with `maxWidth` clamped, so on a 360px phone the neck is roughly 260px wide and 730px tall (auto-scaled)
- This is actually fine — it's a full fretboard visualization meant to scroll vertically
- **Severity:** Low — acceptable behavior for a fretboard viewer

**Issue CA-3: ChordSelector dropdowns on mobile**
- `flex flex-wrap items-center gap-3` — wraps correctly
- Native `<select>` elements work well on mobile (trigger OS picker)
- **Verdict:** No issues

**Issue CA-4: Info panel at bottom wraps correctly**
- `flex flex-wrap gap-x-8 gap-y-2` — works well
- **Verdict:** No issues

### 9. FilterBar (`FilterBar.tsx`) — MINOR ISSUE

**Issue FB-1: Sort dropdown and Beginner button can be pushed off-screen**
- `flex flex-wrap` with `flex-1` spacer between filters and sort/beginner
- On narrow screens (< 400px), the spacer collapses, but the sort dropdown and Beginner button still sit on the same row as filter chips — they wrap to the next line
- **Severity:** Low — wraps correctly but the visual separation (spacer) is lost

### 10. TransitionInfo (`TransitionInfo.tsx`) — ISSUE FOUND

**Issue TI-1: Fixed grid columns don't adapt to mobile**
- Uses `gridTemplateColumns: '40px 50px 20px 50px 1fr'` — total fixed = 160px + 1fr
- At 320px viewport minus padding, the `1fr` column has ~120px — adequate
- **Severity:** Low — works but could be tighter. The grid doesn't collapse on very narrow screens but remains functional.

### 11. Footer (`Footer.tsx`) — PASS
- Simple centered text with padding. Works at all sizes.

### 12. ThemeToggle (`ThemeToggle.tsx`) — PASS
- 20×20 icon in a padded button. Good touch target.

### 13. OrientationToggle (`OrientationToggle.tsx`) — PASS
- Standard button with icon + text. Works at all sizes.

### 14. SVG Sub-components (FretboardGrid, FingerDots, BarreIndicator, StringMarkers, FretLabel, NeckFretboardGrid, NeckNoteDots, NeckBarreIndicator, NeckTransitionDots) — PASS
- All are SVG children that scale with their parent `viewBox`. Inherently responsive.

---

## Summary of Issues

| ID | Component | Issue | Severity | Effort |
|----|-----------|-------|----------|--------|
| KCT-1 | KeyChordTable | 700px min-width table forces horizontal scroll on mobile/tablet portrait | Medium | Medium |
| KCT-2 | KeyChordTable | Expanded row chord diagrams too small on mobile | Medium | Medium |
| KCT-3 | KeyChordTable | Filter pills stack into many rows on narrow screens | Low | Low |
| KCT-4 | KeyChordTable | +/− step buttons too small for touch (18×18px) | Medium | Low |
| CA-1 | ChordAnalyzer/GuitarNeck | Horizontal neck overflows on mobile (700px min) | Medium | Low |
| CA-2 | ChordAnalyzer/GuitarNeck | Vertical neck is very tall (acceptable for fretboard) | Low | — |
| FB-1 | FilterBar | Spacer collapse on narrow screens | Low | Low |
| TI-1 | TransitionInfo | Fixed grid columns slightly cramped on 320px | Low | Low |

---

## Brainstorm Phase

### Technical Architect
The KeyChordTable is the hardest problem. A 7-column data table doesn't naturally fit on a 360px phone. We have three strategies:

1. **Horizontal scroll (current)** — keep the table at 700px min-width. It works, just isn't ideal UX.
2. **Card layout on mobile** — below `sm` (640px), transform each key row into a stacked card showing the 7 chords vertically. This is the most mobile-native approach but is a significant UI change.
3. **Responsive table with reduced column width** — lower the min-width and allow text wrapping/truncation. Risk: chord names like "D#dim" need ~50px minimum.

**Recommendation:** Option 2 (card layout) for phones, keep the table for tablet and up. This gives the best UX per device class.

### UI Designer
For the mobile card layout:
- Each key becomes a card with the key name as a header
- 7 chords listed in a 2-column or 3-column grid within the card (degree + chord name)
- Highlighted chords get the same primary color treatment
- Tapping the card expands to show diagrams (same as current expand behavior)
- The degree number and quality label are shown with each chord

For the +/− buttons, increase the tap target to 44×44px while keeping the visual button small (the tap area is larger than the visible element).

For the horizontal neck on mobile — just hide the horizontal option on `< 640px` or auto-switch to vertical. The app already defaults to vertical on small screens.

### UI Developer

**Files to modify:**

| File | Changes |
|------|---------|
| `src/components/KeyChordTable.tsx` | Mobile card layout, touch-friendly +/− buttons, scrollable filter pills |
| `src/components/GuitarNeck.tsx` | Reduce minWidth for horizontal or auto-switch |
| `src/index.css` | Add media query styles for card layout |

### Guitar Domain Expert
The card layout on mobile must preserve the scale degree context. Guitarists think in terms of "the 4 chord" or "the 5 chord" — losing the degree number/quality label makes the view useless. Each chord in the mobile card MUST show its degree (1-7) and quality (maj/min/dim).

Also, the expanded chord diagrams on mobile are crucial — mobile is where guitarists most need to see fingerings (phone on a music stand). The diagrams must be large enough to read finger positions clearly. Minimum recommended: 100px wide per diagram.

### UI Integration Tester
Key integration points for the mobile card layout:
- The `highlightedChords` logic must work identically in card vs table mode
- Row expansion (showing `InlineChordCard` diagrams) must work in card mode
- Filter pills must filter the same way
- Key step transposition (+/−) must work in card mode
- The card layout must share as much code as possible with the table layout to avoid divergence

### UI Regression Tester
Risk areas:
- Desktop table layout must be completely unchanged — the card layout is mobile-only
- Breakpoint boundary (640px) — test at exactly 640px to ensure clean transition
- Both themes (dark + light) must look correct in card mode
- Expanded state should persist if viewport resizes across the breakpoint (e.g., rotating a tablet)
- All 12 keys must display correctly in card mode

---

## Detailed Implementation Plan

### Phase 1: Touch-Friendly +/− Buttons (Low effort, high impact)
**File:** `src/components/KeyChordTable.tsx`

Increase the tap target while keeping the visual size small:

```tsx
// Change button styles for +/- buttons
style={{
  // ... existing styles
  width: '32px',      // was 18px
  height: '32px',     // was 18px
  fontSize: '16px',   // was 14px
}}
```

This alone brings the touch target much closer to the 44px guideline. The `gap` between buttons provides additional separation.

### Phase 2: Scrollable Filter Pills on Mobile (Low effort)
**File:** `src/components/KeyChordTable.tsx`

Change the filter pills container from `flex-wrap` to horizontal scroll on mobile:

```tsx
<div
  className="flex items-center gap-2 px-4 py-2.5 overflow-x-auto sm:flex-wrap sm:overflow-x-visible"
  style={{
    borderBottom: '1px solid var(--color-border-subtle)',
    backgroundColor: 'var(--color-surface)',
    WebkitOverflowScrolling: 'touch',
  }}
>
```

Add `flex-shrink-0` to each pill button so they don't compress.

### Phase 3: Mobile Card Layout for KeyChordTable (Medium effort, highest impact)
**File:** `src/components/KeyChordTable.tsx`

Add a responsive wrapper that renders differently below `sm` (640px):

#### 3a. Add a `useIsMobile` hook (or use a CSS-only approach)

**Recommended: CSS-only approach** — render both layouts, hide one with Tailwind classes:
```tsx
{/* Table layout — hidden on mobile */}
<div className="hidden sm:block overflow-x-auto">
  <table>...</table>
</div>

{/* Card layout — shown only on mobile */}
<div className="block sm:hidden">
  {rows.map(row => <KeyChordMobileCard key={row.key} ... />)}
</div>
```

#### 3b. Create `KeyChordMobileCard` component (inside KeyChordTable.tsx)

```tsx
function KeyChordMobileCard({ row, isExpanded, highlightedChords, onExpandToggle, activeFilters, keyOffset, onStepKey, onResetKey }: KeyRowProps) {
  // Same effective key/chord computation as KeyRow
  const effectiveKey = useMemo(() => { ... }, [row.key, keyOffset]);
  const effectiveChords = useMemo(() => { ... }, [row.chords, effectiveKey, keyOffset]);
  const triads = effectiveChords.filter(...);
  const isTransposed = keyOffset !== 0;

  return (
    <div
      className="rounded-lg mb-3 overflow-hidden"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border-subtle)',
      }}
    >
      {/* Card header: key name + step buttons + expand toggle */}
      <div
        className="flex items-center justify-between px-3 py-2.5"
        style={{ backgroundColor: 'var(--kct-header-bg)' }}
      >
        <div className="flex items-center gap-2">
          <button onClick={() => onStepKey(row.key, -1)} style={{ width: '32px', height: '32px', ... }}>−</button>
          <div className="text-center">
            <span className="font-bold text-sm">{effectiveKey}</span>
            {isTransposed && <span className="text-[9px] block opacity-60">from {row.key}</span>}
          </div>
          <button onClick={() => onStepKey(row.key, 1)} style={{ width: '32px', height: '32px', ... }}>+</button>
        </div>
        <button onClick={() => onExpandToggle(row.key)}>
          {isExpanded ? '▾' : '▸'}
        </button>
      </div>

      {/* Chord grid: 3 or 4 columns */}
      <div
        className="grid grid-cols-4 gap-px"
        style={{ backgroundColor: 'var(--color-border-subtle)' }}
      >
        {triads.map((chord, i) => {
          const isHighlighted = highlightedChords.includes(chord.name);
          return (
            <div
              key={chord.name}
              className="text-center py-2 px-1"
              style={{
                backgroundColor: isHighlighted ? 'var(--color-primary)' : getColumnStyle(COLUMN_TYPES[i]).backgroundColor,
                color: isHighlighted ? 'var(--color-text-on-primary)' : getColumnStyle(COLUMN_TYPES[i]).color,
              }}
            >
              <div className="text-[10px] font-medium opacity-70">{DEGREE_LABELS[i]} · {QUALITY_LABELS[i]}</div>
              <div className="text-sm font-bold">{chord.name}</div>
            </div>
          );
        })}
      </div>

      {/* Expanded: horizontally scrollable chord diagrams */}
      {isExpanded && (
        <div className="overflow-x-auto p-3" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="flex gap-3" style={{ minWidth: 'max-content' }}>
            {filteredChords.map(chord => (
              <div key={chord.name} style={{ width: '120px', flexShrink: 0 }}>
                <InlineChordCard chord={chord} colIndex={chord.scaleDegree - 1} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

The 4-column grid works because:
- 7 chords in a 4-column grid = 2 rows (4 + 3), neat on phones
- Each cell is ~80px at 360px viewport — adequate for chord names
- Degree + quality labels are shown in each cell (per Guitar Expert requirement)

On the 7th chord (dim), it sits alone in its row — visually distinct as the oddball degree, which is musically accurate.

#### 3c. Extract shared logic

Factor out the effective key/chord computation from `KeyRow` into a shared hook or utility to avoid duplicating it between `KeyRow` and `KeyChordMobileCard`:

```tsx
function useEffectiveChords(row: KeyChordRow, keyOffset: number) {
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

  return { effectiveKey, effectiveChords, isTransposed: keyOffset !== 0 };
}
```

### Phase 4: GuitarNeck Horizontal Overflow Fix (Low effort)
**File:** `src/components/GuitarNeck.tsx`

Reduce the `minWidth` for horizontal orientation on mobile to allow the SVG to scale down naturally:

```tsx
style={{
  width: '100%',
  height: 'auto',
  minWidth: orientation === 'horizontal' ? `${Math.min(layout.svgWidth, 500)}px` : undefined,
  // was 700px — 500px allows it to fit on tablets without scroll
  maxWidth: orientation === 'vertical' ? `${layout.svgWidth + 16}px` : undefined,
  display: 'block',
  margin: '0 auto',
}}
```

On phones (< 500px), the SVG will scale down and become less readable in horizontal mode, but the app already defaults to vertical on small screens. The user must explicitly switch to horizontal — at that point, some loss of detail is expected and the scroll remains available.

### Phase 5: FilterBar Spacer Fix (Low effort)
**File:** `src/components/FilterBar.tsx`

Replace the `flex-1` spacer with responsive behavior:

```tsx
<div className="hidden sm:block flex-1" />
```

This hides the spacer on mobile, letting the sort/beginner controls flow naturally in the flex-wrap layout.

---

## Implementation Priority

| Phase | Description | Impact | Effort | Priority |
|-------|-------------|--------|--------|----------|
| 1 | Touch-friendly +/− buttons | High | Low | Do first |
| 2 | Scrollable filter pills | Medium | Low | Do first |
| 3 | Mobile card layout | High | Medium | Core deliverable |
| 4 | GuitarNeck horizontal fix | Medium | Low | Quick win |
| 5 | FilterBar spacer | Low | Low | Quick win |

Phases 1, 2, 4, and 5 are quick fixes that can be done independently. Phase 3 is the core mobile layout overhaul.

---

## Testing Strategy

### Device/Viewport Matrix

| Device | Width | Test Focus |
|--------|-------|------------|
| iPhone SE | 375px | Minimum viable mobile, card layout, touch targets |
| iPhone 14 | 390px | Standard mobile, card layout |
| iPhone 14 Pro Max | 430px | Large phone, 4-col grid fit |
| iPad Mini | 768px | Tablet portrait — should show table layout |
| iPad Air | 820px | Tablet portrait — table layout |
| iPad Pro 11" | 834px | Tablet — table layout |
| iPad landscape | 1024px | Near-desktop, full table |

### Test Scenarios
1. **Card layout rendering** — all 12 keys display correctly in 4-col grid on < 640px
2. **Card expansion** — tapping a card shows scrollable chord diagrams
3. **Key stepping on mobile** — +/− buttons are easily tappable and work correctly
4. **Filter pills scroll** — horizontally scrollable on mobile, no wrapping
5. **Breakpoint transition** — rotating an iPad between portrait (table) and landscape (table) doesn't break state
6. **Highlighted chords in cards** — selected chords highlighted with primary color
7. **Transposed key in cards** — shows "from X" indicator, reset works
8. **Both themes** — dark and light look correct in card layout
9. **Horizontal neck on tablet** — fits without scroll at 768px+
10. **Vertical neck on phone** — scales to fit width, scrolls vertically

---

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Card layout diverges from table layout over time | Medium | Extract shared computation into `useEffectiveChords` hook |
| 4-column grid doesn't fit on 320px screens | Low | Min cell width is 80px; 4 × 80 = 320px — tight but works |
| CSS `hidden sm:block` causes layout flash | Low | Both layouts are lightweight; no perceptible flash |
| Existing desktop tests break | Low | Table layout is unchanged; only rendered when `sm:block` |
| Card layout vertical space | Low | Cards are more compact than table rows — less total height |
