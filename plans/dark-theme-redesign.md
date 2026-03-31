# Dark Theme Redesign — Attractive, High-Contrast, Guitarist-Focused

## Explore Team Investigation

**Date:** 2026-03-17
**Status:** Plan complete — ready for implementation

---

## Audit Summary

The current dark theme uses a **teal-terracotta palette** (#1A3540 background, #E64833 primary, #FBE9D0 cream text). While functional, the team identified several areas where contrast, visual hierarchy, and aesthetic appeal can be significantly improved for guitarists using the app in real-world conditions (dim practice rooms, stage lighting, phone on a music stand).

---

## User Journey Analysis

### Scenario 1: "What key should I play this in?"
**User selects chords (A, E) → scans the key table → identifies matching keys**

**Current issues:**
- The **highlighted chord cells** (terracotta #E64833) are effective but the **non-highlighted cells** blend together — major/minor/dim column backgrounds (#1E3A3A, #3A3028, #402828) are too similar in luminance and hard to distinguish at a glance
- The **KEY column** (#1C3040) nearly disappears against the background — weak anchor point for scanning
- The **7th row** at 0.75 opacity feels ghosted out rather than secondary

**Recommendation:** Increase the luminance spread between column types. Give the KEY column a stronger visual identity.

### Scenario 2: "How do I play this chord?"
**User expands a key row → views chord diagrams → reads finger positions**

**Current issues:**
- The **chord diagram dots** (terracotta #E64833 fill, cream #FBE9D0 text) work well for finger numbers but the **fret wires** (#3A6878) and **strings** (#90AEAD) are nearly the same brightness, making the grid feel flat
- The **nut** (cream #FBE9D0) is clear, but the **fret number label** uses the muted color, making it hard to spot which position you're at
- **Open string markers** (green #6DBF80) and **muted string markers** (muted #90AEAD) have similar visual weight — muted strings should be more obviously "off"

**Recommendation:** Increase string/fret contrast separation. Make the fret position label more prominent. Dim muted string markers further.

### Scenario 3: "What intervals make up this chord?"
**User opens Chord Analyzer → views full fretboard → reads interval dots**

**Current issues:**
- The **interval color palette** has collisions: 4th (#6DBF80) and 5th (#6DBF80) are **identical** — a guitarist can't distinguish a perfect 4th from a perfect 5th on the fretboard
- The **root** (terracotta) is strong, but the **3rd** (blue #5B9BD5) and **7th** (purple #C084FC) are the most musically important intervals after root and they don't stand out enough from the neck background
- The **neck background** (--color-surface #204050) is too close to the **fret marker dots** (rgba sage at 0.3 opacity) — markers barely visible
- The dot text color `#FBE9D0` is hardcoded, not a CSS variable — won't adapt if theme changes

**Recommendation:** Give 4th and 5th distinct colors. Brighten the 3rd and 7th. Make fret markers more visible. Variable-ize the dot text color.

### Scenario 4: "Scanning the whole table quickly"
**User looks at 12 key rows to compare progressions**

**Current issues:**
- All rows use the same cream text (#FBE9D0) with no row separation beyond subtle borders — the table looks like a wall of similar-colored text
- The **+/− step buttons** (#90AEAD at 0.5 opacity) are nearly invisible — useful UI that users may not notice
- **Filter pills** when inactive look like disabled elements rather than available options

**Recommendation:** Add subtle alternating row tinting. Make step buttons more visible. Give inactive pills slightly more presence.

### Scenario 5: "Playing in low-light conditions"
**User has phone on a music stand in a dim room or on stage**

**Current issues:**
- The **overall brightness** is appropriate for dark environments (good)
- But the **contrast ratio** between text (#FBE9D0) and surfaces (#204050, #28505E) is only about 6.5:1 — meets WCAG AA but not AAA (7:1)
- The **primary color** (#E64833 terracotta) on dark backgrounds achieves about 4:1 contrast — below WCAG AA for normal text
- The **muted text** (#90AEAD) on surface (#204050) is about 3.8:1 — below WCAG AA

**Recommendation:** Brighten text colors slightly. Consider a slightly lighter surface for better contrast without losing the dark feel.

---

## Brainstorm Phase

### Technical Architect
The entire theme is controlled through CSS custom properties in `index.css` — a single-file change. No component code needs modification for the core palette updates. However, there are **6 hardcoded color values** scattered across components that should be converted to CSS variables for theme consistency:

- `#fff` in KeyChordTable.tsx and FilterBar.tsx (active pill text)
- `#FBE9D0` in NeckNoteDots.tsx and NeckTransitionDots.tsx (dot text on fretboard)
- `rgba(0,0,0,...)` in KeyChordTable.tsx (table borders — these are intentionally black for depth and work in both themes)
- `rgba(60, 50, 40, 0.35)` in NeckBarreIndicator.tsx (barre overlay)

**Recommendation:** Convert `#fff` → `var(--color-text-on-accent)` and `#FBE9D0` → `var(--diagram-dot-text)` (already defined, just not used in those components).

### UI Designer
The redesign should feel **premium, focused, and musical** — like a high-end guitar tuner app or a pro audio interface. The key principles:

1. **Depth through layering** — clear visual hierarchy: bg → surface → surface-raised → content
2. **Color means something** — every color communicates chord quality, interval type, or importance
3. **Quiet UI, loud content** — chrome (headers, borders, controls) recedes; musical content (chords, notes, diagrams) pops
4. **Warm-cool balance** — keep the warm terracotta/cream personality but add cooler accents for variety

**Proposed new palette direction:**

| Element | Current | Proposed | Rationale |
|---------|---------|----------|-----------|
| Background | #1A3540 (teal) | #141E28 (deep navy) | Darker, more neutral base — lets colors pop more |
| Surface | #204050 (teal) | #1C2836 (slate) | Slightly lighter, better text contrast |
| Surface raised | #28505E (teal) | #243444 (warm slate) | Clear step up from surface |
| Border | #3A6878 (teal) | #344454 (cool gray) | Less colored, more structural |
| Border subtle | #305868 (teal) | #2A3A4A (cool gray) | Barely visible, just enough separation |
| Text | #FBE9D0 (cream) | #F0E6D6 (warm white) | Slightly softer, still warm, high contrast |
| Text muted | #90AEAD (sage) | #8A9BAA (cool gray) | More neutral, clearly secondary |
| Primary | #E64833 (terracotta) | #F05D3E (brighter coral) | More vibrant, better contrast on dark backgrounds |
| Success | #6DBF80 (green) | #5ECE7B (brighter green) | More vibrant |
| Warning | #D4A050 (amber) | #E8B44C (brighter gold) | More distinct from secondary |

### UI Developer

**Files to modify:**

| File | Changes |
|------|---------|
| `src/index.css` | Full dark theme palette update (`:root` block only — light theme unchanged) |
| `src/components/KeyChordTable.tsx` | Replace `#fff` → CSS variable |
| `src/components/FilterBar.tsx` | Replace `#fff` → CSS variable |
| `src/components/NeckNoteDots.tsx` | Replace hardcoded `#FBE9D0` → CSS variable |
| `src/components/NeckTransitionDots.tsx` | Replace hardcoded `#FBE9D0` → CSS variable |
| `src/components/NeckBarreIndicator.tsx` | Replace hardcoded rgba → CSS variable |

### Guitar Domain Expert

**Critical music-specific color recommendations:**

1. **Chord quality colors in the key table must be immediately distinguishable:**
   - **Major** = confident, warm → warm green-teal tint
   - **Minor** = softer, emotional → blue-indigo tint
   - **Diminished** = tension, dissonance → red-brown tint
   - Current minor (#3A3028 warm brown) looks too similar to diminished (#402828 red-brown). Minor should shift cooler.

2. **Interval colors on the fretboard are the most important colors in the app:**
   - **Root** = red/coral (anchor, identity) — keep strong
   - **3rd** = blue (defines major vs minor quality) — needs to be brighter, it's the most important interval after root
   - **5th** = green (stability, power) — distinct from 4th
   - **4th** = teal/cyan (suspension) — distinct from 5th
   - **7th** = purple (color, extension) — brighter for jazz players who need to find it fast
   - **b3 vs 3** — same color is correct (both are "the third"), but could use different shade to hint at the difference

3. **The fretboard neck should look like wood** — a warm brown-tinted surface rather than the same cool teal as the rest of the UI. This creates an immediate "that's a guitar" mental model.

### UI Integration Tester
**Verification matrix after theme change:**
- All text achieves minimum 4.5:1 contrast ratio (WCAG AA)
- Primary text on backgrounds achieves 7:1 (WCAG AAA) where possible
- Interval dots on the fretboard are distinguishable for common color vision deficiencies
- Highlighted chord cells remain the strongest visual element in the key table
- Filter pills read clearly in both active and inactive states
- Both themes (dark + light) still function — light theme is NOT being changed

### UI Regression Tester
**Ensure no visual regressions:**
- Chord diagram SVGs render correctly with new diagram variables
- Barre indicators are visible on the new neck background
- The expanded row chord cards don't lose their quality-based tinting
- Difficulty badges (beginner/intermediate/advanced) remain readable
- Transition arrows and status colors are clear

---

## Detailed Recommendations

### 1. Core Palette — Deeper, More Neutral Base

```css
:root {
  /* === Core === */
  --color-primary: #F05D3E;         /* Brighter coral-red — more vibrant, better contrast */
  --color-secondary: #9A6B5A;       /* Warmer brown — slightly lifted */
  --color-accent: #E09455;          /* Brighter amber — more distinct */
  --color-bg: #111A22;              /* Deep navy-charcoal — darker, lets content float */
  --color-surface: #1A2632;         /* Dark slate — clearly distinct from bg */
  --color-surface-raised: #222F3E;  /* Warm slate — clear card/panel feel */
  --color-border: #2E3E4E;         /* Cool gray — structural, doesn't compete */
  --color-border-subtle: #243040;   /* Near-invisible — just enough depth */
  --color-text: #EDE4D4;            /* Warm off-white — high contrast, soft on eyes */
  --color-text-muted: #7E8E9A;      /* Cool gray — clearly secondary, readable */
  --color-text-on-primary: #FFF5EB; /* Bright cream — maximum contrast on coral */
}
```

**Rationale:**
- Background shifts from teal to near-black navy — creates more "room" for colors to pop
- Surfaces are warmer gray-blues instead of teal — less monochromatic
- Text muted is more neutral gray — reads as "secondary" rather than "part of the teal palette"
- Primary is slightly brighter coral — achieves ~4.8:1 on surface backgrounds (up from ~4:1)

### 2. Semantic Colors — More Vibrant

```css
  --color-success: #5ECE7B;         /* Brighter green */
  --color-warning: #E8B44C;         /* Brighter gold */
  --color-error: #F05D3E;           /* Match primary coral */
```

### 3. Chord Card Colors — Better Quality Differentiation

```css
  /* === Chord card tints === */
  --chord-major-bg: #1A2E28;        /* Dark green-teal — "confident" */
  --chord-major-border: #F05D3E;    /* Coral — strong, assertive */
  --chord-minor-bg: #1A2238;        /* Dark blue-indigo — "emotional" */
  --chord-minor-border: #7BA4C4;    /* Soft steel blue — cooler */
  --chord-7th-bg: #1A2E22;          /* Dark forest — "complex" */
  --chord-7th-border: #5ECE7B;      /* Bright green — extension */
  --chord-sus-bg: #2A2820;          /* Dark warm — "suspended, unresolved" */
  --chord-sus-border: #E09455;      /* Amber — tension */
  --chord-dim-bg: #2A1E22;          /* Dark burgundy — "dissonant" */
  --chord-dim-border: #B06A5A;      /* Muted terracotta — tension */
```

**Key change:** Minor shifts from warm-brown (#243040→ #1A2238 blue-indigo) to be clearly distinguishable from diminished.

### 4. Key Chord Table — Better Column Contrast

```css
  /* === Key Chord Table === */
  --kct-major-bg: #182A24;          /* Green-tinted dark — clearly "major" */
  --kct-major-text: #EDE4D4;
  --kct-minor-bg: #1E2438;          /* Blue-tinted dark — clearly "minor" */
  --kct-minor-text: #D0D8E4;        /* Slightly blue-shifted text for cohesion */
  --kct-dim-bg: #2A1E22;            /* Red-tinted dark — clearly "diminished" */
  --kct-dim-text: #E4D0D0;          /* Slightly warm-shifted text */
  --kct-header-bg: #151E28;         /* Near-background — recedes */
  --kct-row-hover: rgba(240, 93, 62, 0.08);
  --kct-selected-outline: var(--color-primary);
```

**Rationale:** Three visually distinct temperature zones: green (major), blue (minor), red (diminished). Matches the musical "color" of each quality — major is bright/warm, minor is cool/melancholy, diminished is tense/dark.

### 5. SVG Diagram — Clearer Fretboard

```css
  /* === SVG diagram === */
  --diagram-dot: var(--color-primary);
  --diagram-dot-text: #FFF5EB;       /* Bright cream — max legibility in dots */
  --diagram-nut: #D4C8B4;            /* Warm bone white — like a real guitar nut */
  --diagram-fret: #3A3A3A;           /* Neutral gray — wire-like, doesn't compete */
  --diagram-string: #A0958A;         /* Warm silver — like real strings */
  --diagram-open: #5ECE7B;           /* Bright green — "ring out" */
  --diagram-mute: #555555;           /* Dark gray — clearly "off/dead" */
```

**Key changes:**
- **Strings** shift from teal-muted to warm silver — looks like actual guitar strings
- **Fret wires** become neutral dark gray — structural, not decorative
- **Muted string markers** are much darker — instantly reads as "don't play this string"
- **Nut** becomes bone/ivory — like a real guitar nut

### 6. Interval Colors — Distinct, Vibrant, Accessible

```css
  /* === Interval colors (Chord Analyzer) === */
  --interval-root: #F05D3E;          /* Coral — anchor, identity */
  --interval-third: #4EAAED;         /* Bright sky blue — major/minor quality */
  --interval-fourth: #26C6AA;        /* Teal-cyan — suspension (distinct from 5th!) */
  --interval-fifth: #5ECE7B;         /* Green — stability, power */
  --interval-sixth: #E09455;         /* Amber — warmth, extension */
  --interval-seventh: #B47EF0;       /* Bright purple — jazzy, extensions */
  --interval-ninth: #F4C542;         /* Gold — bright, high extension */
  --interval-eleventh: #F57DA0;      /* Pink — rare, distinct */
  --interval-thirteenth: #4DD8E8;    /* Cyan — highest extension */
```

**Critical fix:** 4th and 5th now have **distinct colors** (teal-cyan vs green). This is musically important — sus4 chords replace the 3rd with a 4th, and a guitarist needs to see exactly which notes are 4ths vs 5ths on the fretboard.

### 7. Neck Background — Guitar Wood Feel

```css
  /* === Neck === */
  --neck-bg: #1E2218;               /* Dark rosewood tint — looks like a fretboard */
  --neck-fret-marker: rgba(200, 190, 170, 0.18); /* Warm pearl — like real inlays */
```

**Rationale:** Real fretboards are dark wood (rosewood, ebony). A warm brown-green dark tint feels more like a guitar than the cool teal.

### 8. Transition Colors — Better Differentiation

```css
  /* === Transition colors === */
  --transition-stay: #5ECE7B;        /* Green — "safe, no movement" */
  --transition-move: #4EAAED;        /* Blue — "sliding, directional" */
  --transition-lift: #666666;        /* Gray — "finger lifts off, gone" */
  --transition-place: #F4C542;       /* Gold — "new placement, attention" */
  --transition-arrow: #4EAAED;       /* Blue — directional arrows */
```

**Key change:** Lift becomes gray instead of sage — it represents absence (finger leaving), so it should visually recede.

### 9. Shadows — More Dramatic Depth

```css
  /* === Shadows === */
  --shadow-sm: 0 1px 4px rgba(0,0,0,0.30);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.40);
  --shadow-primary: 0 2px 12px rgba(240, 93, 62, 0.35);
```

**Rationale:** Deeper shadows on the darker background create more pronounced card/panel layering.

### 10. New Variable — Active Pill/Button Text

Add a new variable for text on colored (non-primary) buttons:

```css
  --color-text-on-accent: #FFFFFF;   /* White text on colored pills */
```

Then replace hardcoded `#fff` in KeyChordTable.tsx and FilterBar.tsx.

---

## Hardcoded Color Cleanup

| File | Current | Replacement |
|------|---------|-------------|
| `KeyChordTable.tsx` | `'#fff'` (pill text) | `'var(--color-text-on-accent)'` |
| `FilterBar.tsx` | `'#fff'` (chip text) | `'var(--color-text-on-accent)'` |
| `NeckNoteDots.tsx` | `'#FBE9D0'` (dot text) | `'var(--diagram-dot-text)'` |
| `NeckTransitionDots.tsx` | `'#FBE9D0'` (dot text) | `'var(--diagram-dot-text)'` |
| `NeckBarreIndicator.tsx` | `rgba(60, 50, 40, 0.35)` | `'var(--neck-barre-overlay)'` (new variable) |

New CSS variable needed:
```css
  --neck-barre-overlay: rgba(60, 50, 40, 0.35);
```

---

## Contrast Ratio Verification (Proposed Theme)

| Element | Foreground | Background | Ratio | WCAG |
|---------|-----------|-----------|-------|------|
| Body text | #EDE4D4 | #1A2632 | ~11:1 | AAA |
| Muted text | #7E8E9A | #1A2632 | ~4.7:1 | AA |
| Primary on surface | #F05D3E | #1A2632 | ~5.2:1 | AA |
| Text on primary | #FFF5EB | #F05D3E | ~4.1:1 | AA (large) |
| Heading (primary) | #F05D3E | #111A22 | ~5.8:1 | AA |
| KCT major text | #EDE4D4 | #182A24 | ~9.5:1 | AAA |
| KCT minor text | #D0D8E4 | #1E2438 | ~8.2:1 | AAA |
| KCT dim text | #E4D0D0 | #2A1E22 | ~7.8:1 | AAA |

All body/table text exceeds WCAG AAA. Muted text meets AA. Primary on surfaces meets AA.

---

## Before/After Visual Summary

### Key Chord Table
- **Before:** Teal monochrome — major/minor/dim columns all feel "teal-ish"
- **After:** Three distinct color zones — green (major), blue (minor), burgundy (dim) — instant quality recognition

### Chord Diagrams
- **Before:** Teal strings, teal frets, same-brightness muted markers
- **After:** Silver strings, dark gray frets, clearly dimmed muted markers — looks like a real guitar

### Fretboard (Analyzer)
- **Before:** 4th and 5th are identical green; flat teal background
- **After:** 4th is teal-cyan, 5th is green; dark rosewood background with pearl inlays

### Overall Feel
- **Before:** "Teal office" — professional but monotonous
- **After:** "Guitar workshop at night" — warm, musical, depth through layering

---

## Testing Strategy

1. **Visual inspection** at 3 breakpoints (phone 375px, tablet 768px, desktop 1200px)
2. **Both tabs** — Chord Explorer and Chord Analyzer
3. **All chord qualities** — major, minor, dim, 7th, sus, power, extended
4. **Expanded rows** — chord diagrams readable with new diagram colors
5. **Fretboard** — all interval colors distinguishable, barre positions visible
6. **Transition info** — all 4 status types visually distinct
7. **Light theme** — verify ZERO changes to light theme
8. **Browser DevTools** — verify contrast ratios with accessibility audit
9. **Color blindness simulation** — check interval colors with deuteranopia/protanopia filters

---

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Users attached to current teal look | Low | The personality (warm + cool mix) is preserved, just refined |
| Interval colors fail for color-blind users | Medium | Chosen palette avoids pure red-green pairs; dots also have text labels |
| KCT column tinting too subtle | Low | Test at target contrast; can increase saturation if needed |
| Hardcoded color replacements break something | Low | Straightforward variable swaps; build + visual verification |
| Neck wood tint looks odd | Low | Very subtle tint (not literal brown) — test in context |

---

## Implementation Scope

| File | Change Type | Effort |
|------|------------|--------|
| `src/index.css` | Update `:root` block (dark theme only) | Medium |
| `src/components/KeyChordTable.tsx` | Replace 2 hardcoded `#fff` | Low |
| `src/components/FilterBar.tsx` | Replace 1 hardcoded `#fff` | Low |
| `src/components/NeckNoteDots.tsx` | Replace 2 hardcoded `#FBE9D0` | Low |
| `src/components/NeckTransitionDots.tsx` | Replace 2 hardcoded `#FBE9D0` | Low |
| `src/components/NeckBarreIndicator.tsx` | Replace 1 hardcoded `rgba(...)` | Low |

**Total:** 6 files, mostly single-line swaps + one CSS block update.
**Light theme:** Completely untouched.
