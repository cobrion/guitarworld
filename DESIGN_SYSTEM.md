# GuitarWorld Visual Design System

## 1. Color Palette

### Primary Palette
Inspired by guitar aesthetics — warm wood tones, aged brass hardware, rosewood fretboards.

| Token                | Light Mode   | Dark Mode    | Usage                        |
|----------------------|-------------|-------------|------------------------------|
| `--color-primary`    | `#B8860B`   | `#D4A843`   | Buttons, active key, accents |
| `--color-secondary`  | `#5C4033`   | `#8B6F5C`   | Secondary actions, borders   |
| `--color-accent`     | `#C07830`   | `#E09850`   | Highlights, hover states     |

### Chord Type Colors
Subtle background tints to visually distinguish chord types at a glance.

| Chord Type | Light Mode BG | Dark Mode BG | Border (Both) | Usage               |
|-----------|--------------|-------------|---------------|---------------------|
| Major     | `#FFF8E7`    | `#2A2418`   | `#D4A843`     | Warm gold           |
| Minor     | `#F0EBF5`    | `#1E1A26`   | `#9B8EC4`     | Cool purple         |
| 7th       | `#E8F4F0`    | `#162220`   | `#5BA88C`     | Teal green          |
| Sus       | `#FFF0E5`    | `#2A1E14`   | `#D4875C`     | Amber orange        |
| Dim       | `#F5EAEA`    | `#261A1A`   | `#C47070`     | Muted red           |
| Aug       | `#E8F0F5`    | `#141E26`   | `#5C8DAE`     | Steel blue          |

### Backgrounds & Surfaces

| Token                      | Light Mode   | Dark Mode    |
|---------------------------|-------------|-------------|
| `--color-bg`              | `#FAFAF5`   | `#121210`   |
| `--color-bg-secondary`    | `#F2F0EB`   | `#1A1916`   |
| `--color-surface`         | `#FFFFFF`   | `#1E1D1A`   |
| `--color-surface-raised`  | `#FFFFFF`   | `#252420`   |
| `--color-surface-overlay` | `#FFFFFF`   | `#2C2B27`   |
| `--color-border`          | `#E0DDD5`   | `#333028`   |
| `--color-border-subtle`   | `#EBE8E0`   | `#28261F`   |

### Text Colors

| Token                  | Light Mode   | Dark Mode    |
|-----------------------|-------------|-------------|
| `--color-text`        | `#1A1815`   | `#E8E4DC`   |
| `--color-text-muted`  | `#6B6560`   | `#9B9590`   |
| `--color-text-subtle` | `#9B9590`   | `#6B6560`   |
| `--color-text-on-primary` | `#FFFFFF` | `#121210`  |

### Semantic Colors

| Token              | Light Mode   | Dark Mode    | Usage               |
|-------------------|-------------|-------------|---------------------|
| `--color-success` | `#2D8B57`   | `#4CAF7A`   | Beginner badges     |
| `--color-warning` | `#C9952B`   | `#E0B040`   | Intermediate badges |
| `--color-error`   | `#C04040`   | `#E06060`   | Advanced badges     |
| `--color-info`    | `#4078B0`   | `#60A0D8`   | Tooltips, info      |

---

## 2. Typography

### Font Stack

| Role        | Font Family                  | Google Fonts Link                     |
|------------|------------------------------|---------------------------------------|
| Headings   | **Inter**                    | `Inter:wght@500;600;700`              |
| Body       | **Inter**                    | `Inter:wght@400;500`                  |
| Chord Name | **Inter**                    | `Inter:wght@600;700`                  |
| Monospace  | **JetBrains Mono**           | `JetBrains+Mono:wght@400;500`        |

Inter is chosen for its excellent readability at all sizes, clean modern appearance, and extensive weight options. JetBrains Mono is used for fret numbers, fingerings, and technical chord notations.

### Type Scale

| Token          | Size   | Line Height | Weight | Usage                          |
|---------------|--------|-------------|--------|-------------------------------|
| `--text-h1`   | 32px   | 1.2         | 700    | Page title ("Key of C Major") |
| `--text-h2`   | 24px   | 1.3         | 600    | Section headers ("Triads")    |
| `--text-h3`   | 20px   | 1.3         | 600    | Sub-sections                  |
| `--text-h4`   | 16px   | 1.4         | 600    | Card group labels             |
| `--text-body` | 15px   | 1.5         | 400    | General body text             |
| `--text-sm`   | 13px   | 1.4         | 400    | Captions, metadata            |
| `--text-xs`   | 11px   | 1.3         | 500    | Badges, tiny labels           |
| `--text-chord`| 16px   | 1.2         | 700    | Chord name on diagrams        |
| `--text-fret` | 11px   | 1.0         | 500    | Fret numbers (monospace)      |
| `--text-finger`| 12px  | 1.0         | 600    | Finger numbers inside dots    |

### Font Weights

| Weight | Value | Usage                                      |
|--------|-------|-------------------------------------------|
| Regular| 400   | Body text, descriptions                   |
| Medium | 500   | Buttons, labels, muted headings           |
| Semi   | 600   | Section headers, chord names, emphasis    |
| Bold   | 700   | Page title, active key selector, chord ID |

---

## 3. Chord Diagram Visual Design

### Fretboard Rendering

The chord diagram uses clean vector rendering with subtle warmth — not photorealistic, but not purely flat either.

```
Diagram Structure:

      E A D G B E          <-- String labels (--text-xs, --color-text-muted)
      O   X     O          <-- Open (O) / Mute (X) markers
    ==================     <-- Nut (thick bar, 3px)
    | | | | | |            <-- Fret 1
    |-|-|-|-|-|            <-- Fret wire (1px)
    | | | | | |            <-- Fret 2
    |-|-|-|-|-|
    | | ● | ● |            <-- Finger dots with numbers
    |-|-|-|-|-|
    | | | | | |
    ==================
```

### Dimensions

| Element              | Mobile       | Desktop      |
|---------------------|-------------|-------------|
| Diagram width       | 120px       | 150px       |
| Diagram height      | 160px       | 200px       |
| String spacing      | 20px        | 25px        |
| Fret spacing        | 28px        | 35px        |
| Frets shown         | 4-5         | 4-5         |

### Fretboard Elements

| Element          | Style                                                   |
|-----------------|---------------------------------------------------------|
| **Nut**          | 3px solid, `--color-text` (top of fretboard)           |
| **Fret wires**   | 1px solid, `--color-border` (horizontal lines)         |
| **Strings**      | 1px solid, `--color-text-muted` (vertical lines)      |
| **String E-low** | 1.5px (thicker for bass strings)                       |
| **String E-high**| 0.75px (thinner for treble strings)                    |

### Finger Dots

| Property        | Value                                                    |
|----------------|----------------------------------------------------------|
| Shape          | Circle, centered on fret/string intersection             |
| Radius         | 10px (mobile), 12px (desktop)                            |
| Fill           | `--color-primary` (gold)                                 |
| Finger number  | White text centered inside dot, `--text-finger`, bold    |
| Barre chord    | Rounded rectangle (border-radius: 10px) spanning strings |
| Barre fill     | `--color-primary` with 90% opacity                       |

### String Markers (above nut)

| Marker    | Style                                                        |
|-----------|--------------------------------------------------------------|
| Open (O)  | 8px hollow circle, 1.5px stroke, `--color-success`          |
| Muted (X) | 8px "X" character, `--color-text-muted`, `--text-xs` bold   |

### Fret Position Indicator

When the chord starts above fret 1, a small label appears to the left of the diagram:

- Font: JetBrains Mono, `--text-fret`
- Color: `--color-text-muted`
- Format: "3fr" (number + "fr")
- Position: left side, aligned with the first visible fret

### SVG Color Tokens for Diagrams

```css
--diagram-nut: var(--color-text);
--diagram-fret: var(--color-border);
--diagram-string: var(--color-text-muted);
--diagram-dot: var(--color-primary);
--diagram-dot-text: #FFFFFF;       /* dark mode: #121210 */
--diagram-open: var(--color-success);
--diagram-mute: var(--color-text-muted);
--diagram-barre: var(--color-primary);
--diagram-label: var(--color-text-muted);
```

---

## 4. Spacing & Grid System

### Base Unit
`4px` base unit. All spacing values are multiples of 4.

### Spacing Scale

| Token            | Value  | Usage                               |
|-----------------|--------|-------------------------------------|
| `--space-xs`    | 4px    | Tight gaps, icon padding            |
| `--space-sm`    | 8px    | Inside badges, between inline items |
| `--space-md`    | 16px   | Card padding, standard gaps         |
| `--space-lg`    | 24px   | Section spacing, card gaps          |
| `--space-xl`    | 32px   | Section breaks                      |
| `--space-2xl`   | 48px   | Page section dividers               |
| `--space-3xl`   | 64px   | Top/bottom page margins             |

### Page Layout

| Token              | Value     |
|-------------------|-----------|
| `--max-width`     | 1200px    |
| `--page-margin`   | 16px (mobile), 24px (tablet), 32px (desktop) |

### Card Grid

| Property         | Mobile        | Tablet        | Desktop       |
|-----------------|---------------|---------------|---------------|
| Grid columns    | 2             | 3-4           | 4-6           |
| Card width      | ~160px (flex) | ~180px (flex) | ~200px (flex) |
| Grid gap        | 12px          | 16px          | 20px          |
| Card padding    | 12px          | 16px          | 16px          |
| Card min-height | 220px         | 250px         | 280px         |

---

## 5. Component Styles

### Key Selector Buttons

A horizontal row of 12 key buttons (C, C#, D, D#, E, F, F#, G, G#, A, A#, B).

| State    | Background               | Text                    | Border                  | Shadow           |
|----------|--------------------------|-------------------------|-------------------------|------------------|
| Default  | `--color-surface`        | `--color-text`          | `--color-border`        | none             |
| Hover    | `--color-surface-raised` | `--color-text`          | `--color-accent`        | `0 1px 4px rgba(0,0,0,0.1)` |
| Active   | `--color-primary`        | `--color-text-on-primary` | `--color-primary`    | `0 2px 8px rgba(212,168,67,0.3)` |
| Focus    | Current + outline        | --                      | `--color-primary` ring  | --               |

```css
.key-btn {
  padding: 8px 14px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 15px;
  min-width: 44px;
  transition: all 0.15s ease;
}
```

### Chord Cards

| Property        | Value                                                     |
|----------------|-----------------------------------------------------------|
| Border radius  | 12px                                                      |
| Background     | `--color-surface` (tinted by chord type)                  |
| Border         | 1px solid `--color-border-subtle`                         |
| Left border    | 3px solid (chord type color)                              |
| Shadow default | `0 1px 3px rgba(0,0,0,0.08)`                             |
| Shadow hover   | `0 4px 12px rgba(0,0,0,0.12)`                            |
| Transition     | `transform 0.15s ease, box-shadow 0.15s ease`            |
| Hover transform| `translateY(-2px)`                                        |

Card layout (top to bottom):
1. Chord name header: e.g., "Am" — `--text-chord`, bold
2. Full name subtitle: e.g., "A Minor" — `--text-sm`, muted
3. SVG chord diagram (centered)
4. Footer row: difficulty badge + chord type tag

### Filter Chips (Chord Type Filters)

Pill-shaped toggle buttons to filter by chord type (Major, Minor, 7th, etc.)

| State    | Background                    | Text                  | Border            |
|----------|-------------------------------|-----------------------|-------------------|
| Inactive | transparent                   | `--color-text-muted`  | `--color-border`  |
| Active   | chord-type color (subtle bg)  | chord-type color      | chord-type color  |
| Hover    | `--color-surface-raised`      | `--color-text`        | `--color-border`  |

```css
.filter-chip {
  padding: 6px 14px;
  border-radius: 100px;  /* fully rounded pill */
  font-size: 13px;
  font-weight: 500;
  border: 1px solid;
  transition: all 0.15s ease;
}
```

### Difficulty Badges

Small inline badges on chord cards.

| Level          | Background   | Text         | Border       |
|---------------|-------------|-------------|-------------|
| Beginner      | `#E8F5E9`  / `#1A2E1E` | `#2D8B57` / `#4CAF7A` | `#2D8B57` / `#4CAF7A` |
| Intermediate  | `#FFF8E1`  / `#2A2410` | `#C9952B` / `#E0B040` | `#C9952B` / `#E0B040` |
| Advanced      | `#FFEBEE`  / `#2E1616` | `#C04040` / `#E06060` | `#C04040` / `#E06060` |

```css
.badge {
  padding: 2px 8px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 500;
  border: 1px solid;
}
```

### Section Headers

```css
.section-header {
  font-size: var(--text-h2);  /* 24px */
  font-weight: 600;
  color: var(--color-text);
  padding-bottom: 8px;
  border-bottom: 2px solid var(--color-primary);
  margin-bottom: 24px;
}
```

---

## 6. Visual Theme

### Overall Aesthetic
**Modern-Warm**: Clean geometric layouts with warm, organic color choices. The design bridges the gap between a polished web app and the tactile feel of a guitar.

### Key Principles
- **Dark mode is the default** — guitarists practice in dim rooms; dark UI reduces eye strain
- **Warm neutrals** — backgrounds use warm undertones (yellowish grays, not blue-grays)
- **Gold accents** — `--color-primary` (gold) evokes brass tuning pegs and fret wire
- **Subtle depth** — light shadows and slight elevation changes, not flat
- **No skeuomorphism** — no wood-grain textures on UI elements; warmth comes from color

### Surface Hierarchy (Dark Mode)
```
Layer 0: --color-bg          #121210   (page background)
Layer 1: --color-bg-secondary #1A1916  (sidebar, header)
Layer 2: --color-surface      #1E1D1A  (cards, panels)
Layer 3: --color-surface-raised #252420 (hover cards, dropdowns)
Layer 4: --color-surface-overlay #2C2B27 (modals, popovers)
```

### Corners & Radii

| Token                | Value  | Usage                    |
|---------------------|--------|--------------------------|
| `--radius-sm`       | 4px    | Buttons, inputs, badges  |
| `--radius-md`       | 8px    | Key selector buttons     |
| `--radius-lg`       | 12px   | Cards, panels            |
| `--radius-xl`       | 16px   | Modal dialogs            |
| `--radius-full`     | 100px  | Pills, filter chips      |

### Transitions
All interactive elements use `transition: all 0.15s ease`. No animation exceeds `0.3s`. Hover states are subtle (2px lift, shadow deepening).

---

## 7. Responsive Design

### Breakpoints

| Token          | Width     | Usage              |
|---------------|-----------|-------------------|
| `--bp-sm`     | 640px     | Mobile breakpoint  |
| `--bp-md`     | 768px     | Tablet breakpoint  |
| `--bp-lg`     | 1024px    | Desktop breakpoint |
| `--bp-xl`     | 1280px    | Wide desktop       |

### Layout Changes

| Element         | Mobile (<640)        | Tablet (640-1024)    | Desktop (>1024)      |
|----------------|---------------------|---------------------|---------------------|
| Card grid      | 2 columns           | 3-4 columns         | 4-6 columns         |
| Key selector   | Horizontal scroll   | Full row, wrapped   | Full row, single line|
| Page margin    | 16px                | 24px                | 32px                |
| H1 size        | 24px                | 28px                | 32px                |
| H2 size        | 20px                | 22px                | 24px                |
| Body size      | 14px                | 15px                | 15px                |
| Chord diagram  | 120x160px           | 135x180px           | 150x200px           |
| Filter chips   | Horizontal scroll   | Wrapped row         | Wrapped row         |
| Card padding   | 12px                | 16px                | 16px                |

### Mobile-Specific Adjustments
- Key selector: horizontally scrollable with snap points, no wrapping
- Filter chips: horizontally scrollable strip below key selector
- Touch targets: minimum 44x44px for all interactive elements
- Chord cards: 2 columns with equal width, no side-scroll

---

## 8. Iconography

### Recommended Icon Library
**Lucide Icons** — clean, consistent, open-source, tree-shakeable. Works perfectly with the modern-warm aesthetic.

### Icons Needed

| Icon Purpose       | Lucide Icon Name   | Usage                            |
|-------------------|-------------------|----------------------------------|
| Guitar            | `guitar`          | Logo element, empty states       |
| Music note        | `music`           | Section decorations              |
| Filter            | `filter`          | Filter toggle button             |
| Beginner          | `circle`          | Difficulty indicator (filled)    |
| Intermediate      | `circle-dot`      | Difficulty indicator             |
| Advanced          | `circle-alert`    | Difficulty indicator             |
| Info              | `info`            | Tooltips, help text              |
| Search            | `search`          | Quick chord search               |
| Settings/tune     | `settings-2`      | Tuning selector                  |
| Chevron down      | `chevron-down`    | Dropdowns, expandable sections   |
| Moon              | `moon`            | Dark mode toggle                 |
| Sun               | `sun`             | Light mode toggle                |
| Volume/audio      | `volume-2`        | Play chord sound (future)        |
| Heart/bookmark    | `heart`           | Favorite chords (future)         |
| Grid/list         | `layout-grid`     | View toggle                      |

### Icon Sizing

| Context       | Size   |
|--------------|--------|
| Inline text  | 16px   |
| Buttons      | 18px   |
| Navigation   | 20px   |
| Hero/empty   | 48px   |

---

## 9. Branding

### Logo Concept
**"GuitarWorld"** in Inter Bold (700) with the "G" stylized to incorporate a guitar headstock silhouette. The dot of the "i" in "Guitar" is replaced with a small circle reminiscent of a tuning peg.

```
Typography:   "GuitarWorld"
Font:         Inter, 700 weight
Color:        --color-primary (#D4A843 on dark, #B8860B on light)
Tagline:      "Every chord in every key" — Inter 400, --color-text-muted
```

### Logo Variations
- **Full**: "GuitarWorld" wordmark + tagline
- **Compact**: "GW" monogram with guitar headstock integration
- **Icon only**: Guitar headstock silhouette (for favicon)

### Favicon
- 32x32 SVG of a simplified guitar headstock in `--color-primary`
- Dark background circle (`--color-bg`) for contrast on light browser tabs

---

## 10. CSS Custom Properties

Complete design token set to be placed in `:root` and `[data-theme="light"]`.

```css
/* ========================================
   GuitarWorld Design Tokens
   ======================================== */

:root {
  /* === Color: Dark Mode (Default) === */
  --color-primary: #D4A843;
  --color-secondary: #8B6F5C;
  --color-accent: #E09850;

  --color-bg: #121210;
  --color-bg-secondary: #1A1916;
  --color-surface: #1E1D1A;
  --color-surface-raised: #252420;
  --color-surface-overlay: #2C2B27;

  --color-border: #333028;
  --color-border-subtle: #28261F;

  --color-text: #E8E4DC;
  --color-text-muted: #9B9590;
  --color-text-subtle: #6B6560;
  --color-text-on-primary: #121210;

  --color-success: #4CAF7A;
  --color-warning: #E0B040;
  --color-error: #E06060;
  --color-info: #60A0D8;

  /* Chord type colors (dark mode) */
  --chord-major-bg: #2A2418;
  --chord-major-border: #D4A843;
  --chord-minor-bg: #1E1A26;
  --chord-minor-border: #9B8EC4;
  --chord-7th-bg: #162220;
  --chord-7th-border: #5BA88C;
  --chord-sus-bg: #2A1E14;
  --chord-sus-border: #D4875C;
  --chord-dim-bg: #261A1A;
  --chord-dim-border: #C47070;
  --chord-aug-bg: #141E26;
  --chord-aug-border: #5C8DAE;

  /* === Typography === */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;

  --text-h1: 32px;
  --text-h2: 24px;
  --text-h3: 20px;
  --text-h4: 16px;
  --text-body: 15px;
  --text-sm: 13px;
  --text-xs: 11px;
  --text-chord: 16px;
  --text-fret: 11px;
  --text-finger: 12px;

  --weight-regular: 400;
  --weight-medium: 500;
  --weight-semi: 600;
  --weight-bold: 700;

  --leading-tight: 1.2;
  --leading-snug: 1.3;
  --leading-normal: 1.4;
  --leading-relaxed: 1.5;

  /* === Spacing === */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  --space-3xl: 64px;

  /* === Layout === */
  --max-width: 1200px;
  --page-margin: 16px;

  /* === Radii === */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 100px;

  /* === Shadows === */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.12);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.16);
  --shadow-primary: 0 2px 8px rgba(212, 168, 67, 0.3);

  /* === Transitions === */
  --transition-fast: 0.1s ease;
  --transition-base: 0.15s ease;
  --transition-slow: 0.3s ease;

  /* === Diagram === */
  --diagram-width: 150px;
  --diagram-height: 200px;
  --diagram-string-spacing: 25px;
  --diagram-fret-spacing: 35px;
  --diagram-dot-radius: 12px;
  --diagram-nut: var(--color-text);
  --diagram-fret: var(--color-border);
  --diagram-string: var(--color-text-muted);
  --diagram-dot: var(--color-primary);
  --diagram-dot-text: #FFFFFF;
  --diagram-open: var(--color-success);
  --diagram-mute: var(--color-text-muted);
  --diagram-barre: var(--color-primary);
  --diagram-label: var(--color-text-muted);

  /* === Breakpoints (for reference; use in media queries) === */
  /* --bp-sm: 640px; */
  /* --bp-md: 768px; */
  /* --bp-lg: 1024px; */
  /* --bp-xl: 1280px; */
}

/* === Light Mode Override === */
[data-theme="light"] {
  --color-primary: #B8860B;
  --color-secondary: #5C4033;
  --color-accent: #C07830;

  --color-bg: #FAFAF5;
  --color-bg-secondary: #F2F0EB;
  --color-surface: #FFFFFF;
  --color-surface-raised: #FFFFFF;
  --color-surface-overlay: #FFFFFF;

  --color-border: #E0DDD5;
  --color-border-subtle: #EBE8E0;

  --color-text: #1A1815;
  --color-text-muted: #6B6560;
  --color-text-subtle: #9B9590;
  --color-text-on-primary: #FFFFFF;

  --color-success: #2D8B57;
  --color-warning: #C9952B;
  --color-error: #C04040;
  --color-info: #4078B0;

  --chord-major-bg: #FFF8E7;
  --chord-major-border: #D4A843;
  --chord-minor-bg: #F0EBF5;
  --chord-minor-border: #9B8EC4;
  --chord-7th-bg: #E8F4F0;
  --chord-7th-border: #5BA88C;
  --chord-sus-bg: #FFF0E5;
  --chord-sus-border: #D4875C;
  --chord-dim-bg: #F5EAEA;
  --chord-dim-border: #C47070;
  --chord-aug-bg: #E8F0F5;
  --chord-aug-border: #5C8DAE;

  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.1);
  --shadow-primary: 0 2px 8px rgba(184, 134, 11, 0.25);

  --diagram-dot-text: #FFFFFF;
}

/* === Responsive Overrides === */
@media (min-width: 640px) {
  :root {
    --page-margin: 24px;
  }
}

@media (min-width: 1024px) {
  :root {
    --page-margin: 32px;
  }
}

@media (max-width: 639px) {
  :root {
    --text-h1: 24px;
    --text-h2: 20px;
    --text-h3: 18px;
    --text-body: 14px;
    --diagram-width: 120px;
    --diagram-height: 160px;
    --diagram-string-spacing: 20px;
    --diagram-fret-spacing: 28px;
    --diagram-dot-radius: 10px;
  }
}
```

---

## Visual Summary

### Design Philosophy
GuitarWorld's design language is built around the principle of **warm minimalism**. The interface respects the musician's focus by keeping visuals clean and uncluttered while using warm tones — golds, ambers, and rich browns — to create a connection with the physical instrument. Dark mode is the default to suit the low-light environments where guitarists typically practice.

### Accessibility Notes
- All text meets WCAG 2.1 AA contrast ratios (4.5:1 for body text, 3:1 for large text)
- Touch targets are minimum 44x44px on mobile
- Focus states use visible outline rings in `--color-primary`
- Chord type colors are distinguishable by hue, not just lightness (colorblind-safe)
- Finger dot numbers inside circles provide redundant encoding (color + number)
