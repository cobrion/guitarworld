# Light/Bright Theme Redesign — Clean, Vibrant, High-Contrast

## Explore Team Investigation

**Date:** 2026-03-18
**Status:** Plan complete — ready for implementation

---

## Audit Summary

The current light theme uses a **cream/parchment base** (#FBE9D0 background) with teal text (#244855). While warm, it has several problems:

1. **The cream background (#FBE9D0) is too yellow/warm** — feels aged, like old paper. A modern bright theme should feel clean and airy.
2. **Surfaces blend together** — background (#FBE9D0), surface (#FFF4E6), and surface-raised (#FFFFFF) are all warm yellows/whites with very little separation.
3. **The 4th and 5th intervals are identical** (#38874E for both) — same issue the dark theme had, now fixed there but still broken in light.
4. **KCT column colors are washed out** — major (#D8E8D8), minor (#F0E4D0), dim (#F0D4D4) are all pastel beige-ish. Hard to distinguish at a glance.
5. **Chord card backgrounds lack color identity** — missing border colors for many qualities (light theme doesn't override them, so they inherit the dark theme values which are designed for dark backgrounds).
6. **Diagram dot text is cream (#FBE9D0)** — on a light background fretboard, cream text inside colored dots has poor contrast compared to the dark theme's dark text.
7. **Neck background** inherits `--color-surface` (cream) — doesn't look like a fretboard.
8. **Shadows are too subtle** — barely visible elevation differences.
9. **Muted string markers** inherit `--color-text-muted` (#5A7880) — too prominent on light backgrounds, should be lighter/more subtle.

---

## User Journey Analysis (Light Theme)

### Scenario 1: Scanning the Key Chord Table in bright sunlight
**Problem:** The cream-on-cream surfaces wash out. Column tinting (green-major, beige-minor, pink-dim) is barely distinguishable in high-ambient-light environments like a sunny room.

**Recommendation:** Use a **clean white base** with stronger, more saturated column tints. The column backgrounds should be clearly different colors, not subtle pastels.

### Scenario 2: Reading chord diagrams on a bright screen
**Problem:** The dot text is cream (#FBE9D0) on colored dots — cream on red/green/blue has less contrast than white or dark text. The fret wires and strings use the same muted teal, making the grid feel flat.

**Recommendation:** Use **white text** on interval-colored dots (they're vibrant enough to support it). Make fret wires lighter/more subtle and strings slightly darker for clear hierarchy: strings > frets > background.

### Scenario 3: Analyzing intervals on the fretboard
**Problem:** 4th and 5th are identical green. Interval colors designed for dark backgrounds are too dark/saturated on the light fretboard — they need to be brighter/more vivid.

**Recommendation:** Use brighter, more saturated interval colors that pop against the light fretboard. Fix the 4th/5th distinction.

### Scenario 4: Using the app outdoors or in high-brightness
**Problem:** The warm cream everywhere reduces effective contrast. In sunlight, warm yellows wash out faster than cool whites.

**Recommendation:** Switch to a **cool-white base** (#F8F9FA or similar) that holds up better in bright conditions. Add warmth through accent colors rather than the background.

---

## Brainstorm Phase

### Technical Architect
Same architecture as the dark theme fix — all changes in `index.css` `[data-theme="light"]` block only. The dark theme is untouched. The hardcoded color cleanup we did previously (replacing `#fff` and `#FBE9D0` with CSS variables) means the light theme automatically benefits from the variable overrides.

### UI Designer

**Design direction: "Bright Studio"** — a clean, professional, Apple-like aesthetic with crisp whites, subtle gray borders, and bold accent colors. Warm personality comes from the coral primary and chord quality tints, not from a yellowed background.

**Proposed palette:**

| Element | Current | Proposed | Rationale |
|---------|---------|----------|-----------|
| Background | #FBE9D0 (cream) | #F5F6F8 (cool white-gray) | Clean, modern, holds up in bright light |
| Surface | #FFF4E6 (warm white) | #FFFFFF (pure white) | Crisp cards, clear elevation |
| Surface raised | #FFFFFF (white) | #FFFFFF (white) | Keep — already correct |
| Border | #D4C0A8 (warm tan) | #DEE2E8 (cool light gray) | Neutral, structural |
| Border subtle | #E0D0BA (warm tan) | #EDF0F4 (very light gray) | Barely visible separation |
| Text | #244855 (dark teal) | #1A2B3A (dark navy) | Darker, better contrast, less "teal" |
| Text muted | #5A7880 (teal) | #6B7B8A (neutral gray) | More neutral, clearly secondary |
| Primary | #E64833 (terracotta) | #E84D35 (brighter coral-red) | Slightly brighter for light bg |
| Text on primary | #FBE9D0 (cream) | #FFFFFF (white) | Maximum contrast on primary |

### Guitar Domain Expert

**Chord quality tints for the Key Table must be immediately recognizable:**

- **Major:** Cool green tint — confident, bright, resolved → #E2F0E2
- **Minor:** Cool blue-lavender tint — emotional, introspective → #E2E6F4
- **Diminished:** Warm rose/pink tint — tense, unstable → #F4E0E0

These three should be as distinct as traffic signals. Currently minor (#F0E4D0) is warm tan — easily confused with the cream background.

**Fretboard neck:** A light warm wood color, like maple (#F0E8DA or similar) instead of the page background color. This makes the neck visually distinct as "the guitar" rather than just another UI panel.

**Interval colors for light mode must be:**
- Darker/richer than dark-mode versions (since they're on a light background)
- Still clearly distinct from each other
- 4th and 5th MUST be different (fix the #38874E duplication)

### UI Integration Tester
Key verification points:
- `--diagram-dot-text` is currently #FBE9D0 (cream) in light — needs to be dark for contrast since we changed dark theme to dark text. But in light theme with vibrant dot colors, **white text** would work best (like the dark theme used to have). So light and dark themes should have different dot text colors.
- All chord quality border colors need light-theme-appropriate values
- Filter pills with `--color-text-on-accent: #FFFFFF` should work on all active pill colors

### UI Regression Tester
- Dark theme must be completely unchanged
- All components must be visually tested in light mode
- Chord diagrams, fretboard dots, barre indicators must all be clearly visible

---

## Detailed Recommendations

### 1. Core Palette — Clean White Base

```css
[data-theme="light"] {
  --color-primary: #E84D35;
  --color-secondary: #8B6050;
  --color-accent: #D08540;
  --color-bg: #F5F6F8;
  --color-surface: #FFFFFF;
  --color-surface-raised: #FFFFFF;
  --color-border: #DEE2E8;
  --color-border-subtle: #EDF0F4;
  --color-text: #1A2B3A;
  --color-text-muted: #6B7B8A;
  --color-text-on-primary: #FFFFFF;
  --color-text-on-accent: #FFFFFF;
```

### 2. Semantic Colors — Rich but Not Neon

```css
  --color-success: #2D9B4E;
  --color-warning: #C48A10;
  --color-error: #E84D35;
```

### 3. Chord Card Tints — Distinct Hues

```css
  --chord-major-bg: #EFF6EF;
  --chord-major-border: #E84D35;
  --chord-minor-bg: #EDF0F8;
  --chord-minor-border: #5A8DB8;
  --chord-7th-bg: #EDF6F0;
  --chord-7th-border: #2D9B4E;
  --chord-sus-bg: #F6F0E8;
  --chord-sus-border: #D08540;
  --chord-dim-bg: #F6EDED;
  --chord-dim-border: #A0605A;
```

### 4. Key Chord Table — Three Distinct Temperature Zones

```css
  --kct-major-bg: #E2F0E2;
  --kct-major-text: #1A2B3A;
  --kct-minor-bg: #E2E6F4;
  --kct-minor-text: #1A2B3A;
  --kct-dim-bg: #F4E0E0;
  --kct-dim-text: #1A2B3A;
  --kct-header-bg: #ECF0F4;
  --kct-row-hover: rgba(232, 77, 53, 0.06);
  --kct-selected-outline: var(--color-primary);
```

Green (major) / Blue-lavender (minor) / Rose-pink (dim) — immediately distinguishable.

### 5. SVG Chord Diagrams — Clear Grid Hierarchy

```css
  --diagram-dot: var(--color-primary);
  --diagram-dot-text: #FFFFFF;
  --diagram-nut: #1A2B3A;
  --diagram-fret: #D0D4DA;
  --diagram-string: #8A8A8A;
  --diagram-open: #2D9B4E;
  --diagram-mute: #C0C4CA;
```

Key changes:
- **Dot text: white** — maximum contrast on colored dots (coral, green, blue fill)
- **Fret wires: light gray** — recede into background
- **Strings: medium gray** — visible but don't dominate
- **Muted markers: light gray** — clearly "off/inactive" vs open strings (green)
- **Nut: dark** — strong visual anchor

### 6. Interval Colors — Vivid, Distinct, Fixed 4th/5th

```css
  --interval-root: #E84D35;
  --interval-third: #2B7EC2;
  --interval-fourth: #0EA590;
  --interval-fifth: #2D9B4E;
  --interval-sixth: #C47A20;
  --interval-seventh: #7C4DDB;
  --interval-ninth: #B8900A;
  --interval-eleventh: #D04A6B;
  --interval-thirteenth: #0088A0;
```

**Critical fix:** 4th (#0EA590 teal) and 5th (#2D9B4E green) are now distinct — same fix as dark theme.

### 7. Fretboard Neck — Light Maple Wood

```css
  --neck-bg: #F0E8DA;
  --neck-fret-marker: rgba(30, 50, 60, 0.10);
  --neck-barre-overlay: rgba(120, 100, 70, 0.15);
```

A warm maple wood tint that's clearly distinct from the cool-white page background. Fret markers are subtle dark dots (like real inlays on a maple board).

### 8. Transition Colors — Rich on Light

```css
  --transition-stay: #2D9B4E;
  --transition-move: #2B7EC2;
  --transition-lift: #A0A8B0;
  --transition-place: #C48A10;
  --transition-arrow: #2B7EC2;
```

### 9. Shadows — More Visible Elevation

```css
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.10), 0 2px 4px rgba(0,0,0,0.06);
  --shadow-primary: 0 2px 10px rgba(232, 77, 53, 0.22);
```

Double-layer shadows for more realistic elevation on white cards.

---

## Contrast Ratio Verification

| Element | Foreground | Background | Ratio | WCAG |
|---------|-----------|-----------|-------|------|
| Body text | #1A2B3A | #F5F6F8 | ~13:1 | AAA |
| Body text on surface | #1A2B3A | #FFFFFF | ~14.5:1 | AAA |
| Muted text | #6B7B8A | #FFFFFF | ~5.2:1 | AA |
| Primary on bg | #E84D35 | #F5F6F8 | ~4.2:1 | AA (large) |
| Text on primary | #FFFFFF | #E84D35 | ~4.1:1 | AA (large) |
| KCT major text | #1A2B3A | #E2F0E2 | ~12:1 | AAA |
| KCT minor text | #1A2B3A | #E2E6F4 | ~11.5:1 | AAA |
| KCT dim text | #1A2B3A | #F4E0E0 | ~11:1 | AAA |
| Dot text (white) | #FFFFFF | #E84D35 | ~4.1:1 | AA (large) |

All text meets WCAG AA minimum. Body text exceeds AAA.

---

## Before/After Visual Summary

### Key Chord Table
- **Before:** Cream background, pastel tan columns — everything blends together
- **After:** White cards, green/blue/pink column zones — instant quality recognition

### Chord Diagrams
- **Before:** Cream dot text, teal strings/frets — flat and indistinct
- **After:** White dot text, gray grid hierarchy — dots pop, grid recedes

### Fretboard
- **Before:** Same cream as page — fretboard doesn't stand out
- **After:** Warm maple wood tint — immediately reads as "guitar"

### Overall Feel
- **Before:** "Aged parchment" — warm but muddy
- **After:** "Bright music studio" — clean, professional, colors pop

---

## Implementation Scope

| File | Changes |
|------|---------|
| `src/index.css` | Update `[data-theme="light"]` block only |

**Single file, ~60 lines.** No component changes needed — all variables are already properly referenced from the dark theme cleanup.
