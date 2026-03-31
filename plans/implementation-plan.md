# GuitarWorld — Comprehensive Implementation Plan

## Overview

GuitarWorld is a web application that displays all associated chords and their corresponding diagrammatic fingering for a selected musical key. Users can change the key and see all associated chords presented in an intuitive, mobile-friendly interface with interactive SVG chord diagrams.

This plan was produced by a team of 6 expert agents: **Guitar Player**, **Technical Architect**, **UI Expert**, **Web Designer**, **Developer**, and **Devil's Advocate**.

---

## Table of Contents

1. [Key Decisions & Conflict Resolution](#1-key-decisions--conflict-resolution)
2. [Target Audience](#2-target-audience)
3. [Technology Stack](#3-technology-stack)
4. [Data Architecture & Music Theory](#4-data-architecture--music-theory)
5. [Component Architecture](#5-component-architecture)
6. [SVG Chord Diagram Rendering](#6-svg-chord-diagram-rendering)
7. [UX & Interaction Design](#7-ux--interaction-design)
8. [Visual Design System](#8-visual-design-system)
9. [State Management](#9-state-management)
10. [Implementation Phases](#10-implementation-phases)
11. [Testing Strategy](#11-testing-strategy)
12. [Build & Deployment](#12-build--deployment)
13. [Risks & Mitigations](#13-risks--mitigations)
14. [Future Roadmap](#14-future-roadmap)

---

## 1. Key Decisions & Conflict Resolution

These decisions were reached by weighing input from all 6 experts, with the Devil's Advocate stress-testing each choice.

| Decision | Chosen Approach | Alternatives Considered | Rationale |
|----------|----------------|------------------------|-----------|
| **Framework** | React 19 + TypeScript | Vanilla JS, Preact, Alpine.js | Component reusability for N chord diagrams; TypeScript models music theory domain safely; largest ecosystem. Bundle ~150KB gzipped is acceptable. |
| **SVG Rendering** | Custom React SVG components | svguitar, react-chords libraries | Full control over theming, accessibility, animation, responsive scaling. Chord diagrams are structurally simple (~30 SVG elements each). |
| **CSS** | Tailwind CSS v4 | CSS Modules, styled-components | Utility-first eliminates naming debates; purged output is minimal; co-located styling with markup. |
| **State Management** | React Context + useReducer | Zustand, Redux, plain useState | Only 4-5 state variables; external library is over-engineering; Context provides clean derived state via useMemo. |
| **Data Storage** | Static JSON bundled at build time | API, database | Data is static and small (~80KB gzipped). No server needed. |
| **Routing** | Hash-based URL state | React Router | Single-view app; lightweight hash state enables shareable links without router overhead. |
| **Default Theme** | Dark mode | Light mode | Guitarists practice in dim rooms; dark UI reduces eye strain. Warm neutral backgrounds (not blue-grays). |
| **Mobile Key Selector** | Bottom-positioned (thumb-reachable) | Top-positioned | Guitarists hold phone in one hand with guitar in the other; bottom placement is thumb-reachable. |

---

## 2. Target Audience

### Primary: Intermediate Guitar Players (1-3 years experience)

The Devil's Advocate identified a critical tension: beginners need simple diagrams with few chords, while advanced players need jazz voicings and extensions. These are fundamentally different UIs.

**Decision:** Target intermediate players who know basic open chords but want to:
- Understand how chords relate to keys
- Explore new voicings beyond open position
- Move beyond the first 3 frets
- Learn chord theory (Roman numerals, diatonic harmony)

**Beginner accommodation:** A "Beginner Mode" toggle simplifies the view to just 7 core diatonic triads with difficulty indicators.

### Differentiators from Existing Tools

The competitive landscape includes Guitar-Chord.org, ChordBank, Ultimate Guitar, and JGuitar. Our differentiators:

1. **Progressive difficulty filtering** — Slider from beginner (open chords only) to advanced (jazz voicings, extensions)
2. **Fretboard position awareness** — Chord voicings grouped by neck position so guitarists can play progressions without jumping across the fretboard
3. **Printable chord sheets** — "Print chords for Key of G" generates clean, printer-friendly reference sheets for teachers/students

---

## 3. Technology Stack

### Core Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 19.x | UI component framework |
| **TypeScript** | 5.7+ | Type-safe music theory modeling |
| **Vite** | 6.x | Build tool (40x faster than legacy alternatives) |
| **Tailwind CSS** | 4.x | Utility-first styling |
| **Vitest** | 2.x | Testing framework (native Vite integration) |

### No Backend Required

All chord data is bundled as static JSON imported at build time. No API, no database, no server. Deployable as a static site on Vercel, Netlify, or GitHub Pages.

### Bundle Size Budget

| Segment | Estimated Size (gzipped) |
|---------|------------------------|
| React + ReactDOM | ~45KB |
| App code (components, utils) | ~15KB |
| Chord data JSON | ~80KB |
| Tailwind CSS | ~10KB |
| **Total** | **~150KB** |

---

## 4. Data Architecture & Music Theory

### Music Theory Foundation

All Western music is built from 12 notes. A major scale uses the interval pattern **W-W-H-W-W-W-H** (Whole-Whole-Half-Whole-Whole-Whole-Half). Each scale degree produces a diatonic chord with a specific quality:

| Degree | Numeral | Quality | Function |
|--------|---------|---------|----------|
| 1st | I | Major | Tonic |
| 2nd | ii | Minor | Supertonic |
| 3rd | iii | Minor | Mediant |
| 4th | IV | Major | Subdominant |
| 5th | V | Major | Dominant |
| 6th | vi | Minor | Submediant |
| 7th | vii° | Diminished | Leading Tone |

### Diatonic Chords for All 12 Major Keys

| Key | I | ii | iii | IV | V | vi | vii° |
|-----|---|----|----|----|----|----|----|
| C | C | Dm | Em | F | G | Am | Bdim |
| C#/Db | Db | Ebm | Fm | Gb | Ab | Bbm | Cdim |
| D | D | Em | F#m | G | A | Bm | C#dim |
| D#/Eb | Eb | Fm | Gm | Ab | Bb | Cm | Ddim |
| E | E | F#m | G#m | A | B | C#m | D#dim |
| F | F | Gm | Am | Bb | C | Dm | Edim |
| F#/Gb | F# | G#m | A#m | B | C# | D#m | E#dim |
| G | G | Am | Bm | C | D | Em | F#dim |
| G#/Ab | Ab | Bbm | Cm | Db | Eb | Fm | Gdim |
| A | A | Bm | C#m | D | E | F#m | G#dim |
| A#/Bb | Bb | Cm | Dm | Eb | F | Gm | Adim |
| B | B | C#m | D#m | E | F# | G#m | A#dim |

### TypeScript Type Definitions

```typescript
// Musical Primitives
export type NoteName =
  | 'C' | 'C#' | 'Db' | 'D' | 'D#' | 'Eb'
  | 'E' | 'F' | 'F#' | 'Gb' | 'G' | 'G#' | 'Ab'
  | 'A' | 'A#' | 'Bb' | 'B';

export type Key =
  | 'C' | 'C#' | 'D' | 'Eb' | 'E' | 'F'
  | 'F#' | 'G' | 'Ab' | 'A' | 'Bb' | 'B';

export type ScaleType = 'major' | 'minor';

export type ChordQuality =
  | 'major' | 'minor' | 'diminished' | 'augmented'
  | 'dominant7' | 'major7' | 'minor7' | 'minor7b5'
  | 'diminished7' | 'sus2' | 'sus4' | 'add9'
  | 'dominant9' | 'power';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type ChordTypeFilter = 'triad' | 'seventh' | 'extended' | 'sus' | 'power';
export type SortOption = 'scale-degree' | 'name' | 'difficulty';
export type FingerNumber = 0 | 1 | 2 | 3 | 4 | null;
export type StringFret = number | null;

// Chord Voicing Data
export interface Barre {
  fromString: number;
  toString: number;
  fret: number;
}

export interface ChordVoicing {
  strings: StringFret[];    // [lowE, A, D, G, B, highE]
  fingers: FingerNumber[];
  barres: Barre[];
  baseFret: number;         // 1 = open position, 2+ = higher
}

export interface ChordData {
  name: string;             // "Am7"
  root: NoteName;
  quality: ChordQuality;
  romanNumeral: string;     // "vi7"
  scaleDegree: number;      // 1-7
  difficulty: Difficulty;
  chordType: ChordTypeFilter;
  voicings: ChordVoicing[];
}

// SVG Layout
export interface DiagramDimensions {
  svgWidth: number;
  svgHeight: number;
  gridLeft: number;
  gridTop: number;
  gridRight: number;
  gridBottom: number;
  stringSpacing: number;
  fretSpacing: number;
  dotRadius: number;
  numStrings: number;
  numFrets: number;
}
```

### Chord Fingering Data Model

- **6-element array** per chord: index 0 = low E (6th string), index 5 = high E (1st string)
- **Values:** `null` = muted (X), `0` = open, `1-22` = fret number
- **Fingers:** `0` = open/not played, `1` = index, `2` = middle, `3` = ring, `4` = pinky
- **baseFret:** `1` = open position; `N > 1` = chord starts at fret N (diagram values are relative)
- **Barres:** Array of `{ fromString, toString, fret }` for barre chord indicators

### Initial Chord Database (50+ voicings)

Open major: C, D, E, G, A (+ G alternate) | Barre major: F (full + easy), B
Open minor: Am, Dm, Em | Barre minor: Bm, Cm, F#m, Gm
Dominant 7ths: C7, D7, E7, G7, A7, B7 | Minor 7ths: Am7, Dm7, Em7
Major 7ths: Cmaj7, Fmaj7 | Suspended: Dsus2, Dsus4, Asus2, Asus4, Esus4
Power chords: E5, A5 | CAGED templates: E-shape, A-shape, Em-shape, Am-shape

### Enharmonic Handling

Keys with sharps (G, D, A, E, B, F#) display sharp names. Keys with flats (F, Bb, Eb, Ab, Db, Gb) display flat names. Both names are stored; display is contextual.

---

## 5. Component Architecture

```
App
├── Header
│   ├── Logo
│   └── ThemeToggle
├── KeySelector
│   ├── ScaleTypeToggle (Major / Minor)
│   └── KeyButton (x12)
├── FilterBar
│   ├── ChordTypeChips (All, Major, Minor, 7th, Sus, Dim/Aug)
│   ├── SortDropdown (Scale Degree, Name, Difficulty)
│   └── BeginnerModeToggle
├── ChordGrid
│   └── ChordCard (one per chord)
│       ├── ChordHeader (name, roman numeral, difficulty badge)
│       ├── ChordDiagram (SVG)
│       │   ├── FretboardGrid (string lines + fret lines)
│       │   ├── FingerDots (circles with finger numbers)
│       │   ├── BarreIndicator (rounded rect spanning strings)
│       │   ├── StringMarkers (O for open, X for muted)
│       │   └── FretLabel (starting fret number)
│       └── VoicingSelector (dots for multiple voicings)
└── Footer
```

### File Structure

```
guitarworld/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── App.tsx
│   │   ├── Header.tsx
│   │   ├── ThemeToggle.tsx
│   │   ├── KeySelector.tsx
│   │   ├── KeyButton.tsx
│   │   ├── FilterBar.tsx
│   │   ├── ChordGrid.tsx
│   │   ├── ChordCard.tsx
│   │   ├── ChordHeader.tsx
│   │   ├── ChordDiagram.tsx
│   │   ├── FretboardGrid.tsx
│   │   ├── FingerDots.tsx
│   │   ├── BarreIndicator.tsx
│   │   ├── StringMarkers.tsx
│   │   ├── FretLabel.tsx
│   │   ├── VoicingSelector.tsx
│   │   ├── DifficultyBadge.tsx
│   │   └── Footer.tsx
│   ├── context/
│   │   └── ChordContext.tsx
│   ├── data/
│   │   └── chords.ts
│   ├── hooks/
│   │   └── useTheme.ts
│   ├── utils/
│   │   ├── musicTheory.ts
│   │   ├── diagramLayout.ts
│   │   └── constants.ts
│   ├── types/
│   │   └── index.ts
│   ├── __tests__/
│   │   ├── musicTheory.test.ts
│   │   └── components/
│   │       ├── ChordDiagram.test.tsx
│   │       └── KeySelector.test.tsx
│   ├── index.css
│   └── main.tsx
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── eslint.config.js
├── .prettierrc
└── package.json
```

---

## 6. SVG Chord Diagram Rendering

### Coordinate System

```
viewBox = "0 0 120 160"

  0-20:    String markers zone (X/O symbols above nut)
  20-22:   Nut (thick line for open position)
  22-142:  Fretboard grid (4 frets, 30px each)
  142-160: Fret label zone ("5fr")

  0-15:    Left padding (fret label area)
  15-115:  5 gaps for 6 strings, 20px spacing each
  115-120: Right padding
```

### Key Rendering Functions

```typescript
function calculateDimensions(width = 120, height = 160): DiagramDimensions {
  const numStrings = 6, numFrets = 4;
  const gridLeft = 15, gridRight = width - 5;
  const gridTop = 24, gridBottom = height - 18;
  const stringSpacing = (gridRight - gridLeft) / (numStrings - 1);
  const fretSpacing = (gridBottom - gridTop) / numFrets;
  return { svgWidth: width, svgHeight: height, gridLeft, gridTop, gridRight,
    gridBottom, stringSpacing, fretSpacing, dotRadius: stringSpacing * 0.35,
    numStrings, numFrets };
}

function stringX(stringIndex: number, dims: DiagramDimensions): number {
  return dims.gridLeft + stringIndex * dims.stringSpacing;
}

function fretY(fretNumber: number, dims: DiagramDimensions): number {
  return dims.gridTop + (fretNumber - 0.5) * dims.fretSpacing;
}
```

### Visual Elements

| Element | Style |
|---------|-------|
| **Nut** | 3px solid line at top (only when baseFret === 1) |
| **Fret wires** | 1px horizontal lines |
| **Strings** | Vertical lines, thicker for bass (1.5px low E to 0.75px high E) |
| **Finger dots** | Gold filled circles with white finger number inside |
| **Barre** | Rounded rectangle spanning barred strings, 85% opacity |
| **Open marker** | Hollow green circle (8px) above nut |
| **Muted marker** | X character in muted text color above nut |
| **Fret label** | "3fr" text to the left when baseFret > 1 |

### Responsive Scaling

SVGs use `viewBox` with no explicit width/height — they scale to fit any container. Container sizes: 120px mobile, 150px desktop (controlled via CSS `max-w`).

---

## 7. UX & Interaction Design

### Key Selection

- **Approach:** Horizontal scrollable button group, chromatically ordered (C, C#, D, Eb, E, F, F#, G, Ab, A, Bb, B)
- **Major/Minor toggle:** Pill switch above key buttons
- **Mobile:** Horizontally scrollable, selected key centered, sticky at bottom (thumb-reachable)
- **Desktop:** Full row visible at top, no scrolling needed
- **Quick-switch:** In-place crossfade transition (200ms), URL updates to `/key/C`
- **Persistence:** Last selected key stored in localStorage

### Chord Display Layout

Chords organized into visually distinct groups with progressive disclosure:

1. **Core Chords** (7 diatonic triads) — always expanded
2. **Seventh Chords** (7 diatonic 7ths) — expanded by default
3. **Color Chords** (sus2, sus4, add9) — collapsed, "Show" button
4. **Extended** (9th, 11th, 13th) — collapsed
5. **Borrowed Chords** (from parallel minor) — collapsed

### Responsive Grid

| Viewport | Columns | Card Width | Gap |
|----------|---------|-----------|-----|
| Mobile (<640px) | 2 | ~160px | 12px |
| Tablet (640-1024px) | 3-4 | ~200px | 16px |
| Desktop (>1024px) | 4-6 | ~220px | 20px |

### Chord Card Interaction

- **Mobile tap:** Bottom sheet slides up with enlarged diagram, voicing carousel, theory details
- **Desktop click:** Card expands inline with voicing thumbnails
- **Hover (desktop):** Subtle scale-up (1.02), shadow elevation, finger numbers appear

### Filtering & Sorting

- **Filter chips:** All | Major | Minor | 7th | Sus | Dim/Aug (multi-select)
- **Sort:** Scale Degree (default) | Difficulty | Alphabetical
- **Beginner Mode:** Toggle that shows only 7 core diatonic triads

### Information Hierarchy

| Level | Content | Visibility |
|-------|---------|-----------|
| **Primary** | Chord diagram + chord name | Always on card |
| **Secondary** | Roman numeral badge, voicing count | On card, subdued |
| **Tertiary** | Difficulty, fret range, notes, intervals, theory | Detail view only |

### Animations

- Card entrance: staggered fade-in (30ms delay per card, 200ms duration)
- Key change: crossfade with slight Y-translate (150ms out, 200ms in)
- Card hover: translateY(-2px), shadow elevation (150ms)
- All animations use `transform` and `opacity` only (GPU-composited)
- Respects `prefers-reduced-motion`

---

## 8. Visual Design System

### Color Palette (Dark Mode Default)

```css
--color-primary:       #D4A843;  /* Gold — inspired by brass hardware */
--color-secondary:     #8B6F5C;  /* Warm brown */
--color-accent:        #E09850;  /* Amber */
--color-bg:            #121210;  /* Page background */
--color-surface:       #1E1D1A;  /* Cards, panels */
--color-surface-raised: #252420; /* Hover cards, dropdowns */
--color-text:          #E8E4DC;  /* Primary text */
--color-text-muted:    #9B9590;  /* Secondary text */
```

### Chord Type Colors

| Type | Background | Border | Feeling |
|------|-----------|--------|---------|
| Major | `#2A2418` | `#D4A843` | Warm gold |
| Minor | `#1E1A26` | `#9B8EC4` | Cool purple |
| 7th | `#162220` | `#5BA88C` | Teal green |
| Sus | `#2A1E14` | `#D4875C` | Amber orange |
| Dim | `#261A1A` | `#C47070` | Muted red |
| Aug | `#141E26` | `#5C8DAE` | Steel blue |

### Typography

| Role | Font | Size | Weight |
|------|------|------|--------|
| Page title | Inter | 32px | 700 |
| Section header | Inter | 24px | 600 |
| Chord name | Inter | 16px | 700 |
| Body | Inter | 15px | 400 |
| Fret numbers | JetBrains Mono | 11px | 500 |
| Badges | Inter | 11px | 500 |

### Spacing

4px base unit. Scale: xs(4px), sm(8px), md(16px), lg(24px), xl(32px), 2xl(48px), 3xl(64px).

### Chord Diagram Styling

- Gold finger dots with white numbers inside (12px radius desktop, 10px mobile)
- Proportional string thickness (1.5px bass to 0.75px treble)
- Green hollow circles for open strings, X marks for muted
- 3px nut line for open position chords
- Card border-radius: 12px, with 3px colored left border by chord type

### Difficulty Badges

- **Beginner:** Green (`#4CAF7A`)
- **Intermediate:** Yellow (`#E0B040`)
- **Advanced:** Red (`#E06060`)

### Accessibility

- All text meets WCAG 2.1 AA contrast (4.5:1 body, 3:1 large)
- Chord type colors are colorblind-safe (distinguished by hue)
- Touch targets minimum 44x44px (48px+ recommended for guitar context)
- Focus rings on all interactive elements
- SVG diagrams have descriptive `aria-label` (e.g., "C major chord: X-3-2-0-1-0")

---

## 9. State Management

### Context + useReducer

```typescript
interface ChordState {
  selectedKey: Key;
  scaleType: ScaleType;
  activeFilters: ChordTypeFilter[];
  sortBy: SortOption;
  beginnerMode: boolean;
}

// Derived data via useMemo:
// chords = getChordsForKey(key, scaleType) -> filtered -> sorted
```

### State Flow

```
User clicks "G" key button
  -> dispatch({ type: 'SET_KEY', payload: 'G' })
    -> reducer updates selectedKey
      -> useMemo recalculates chords for G
        -> ChordGrid re-renders with new chord cards
```

### Persisted State (localStorage)

- Last selected key
- Dark/light theme preference
- Beginner mode on/off
- Section collapse/expand state

---

## 10. Implementation Phases

### Phase 1 — MVP (Week 1)

**Goal:** User can select a key and see the 7 diatonic triads with SVG chord diagrams.

- [ ] Project scaffolding (Vite + React + TypeScript + Tailwind)
- [ ] TypeScript type definitions
- [ ] Chord data for open-position major, minor, and common barre chords (~25 voicings)
- [ ] Music theory utilities: `getChordsForKey`, `getChordVoicings`
- [ ] Components: App, Header, KeySelector, ChordGrid, ChordCard, ChordDiagram (with SVG sub-components)
- [ ] ChordContext with useReducer
- [ ] Mobile-first responsive grid (2 columns mobile, 4+ desktop)
- [ ] Dark mode as default
- [ ] Unit tests for music theory functions

### Phase 2 — Filtering, Voicings, Polish (Weeks 2-3)

**Goal:** Multiple voicings per chord, filtering, difficulty system.

- [ ] Expanded chord database (7th chords, sus, extended — 80+ entries)
- [ ] VoicingSelector component for switching voicings
- [ ] FilterBar with chord type chips and sort dropdown
- [ ] Beginner mode toggle
- [ ] DifficultyBadge component
- [ ] Roman numeral display on cards
- [ ] Minor keys support
- [ ] Component tests for all interactive components

### Phase 3 — Aesthetics, Animations, PWA (Weeks 3-4)

**Goal:** Polished look and feel, smooth transitions, offline support.

- [ ] Light/dark theme toggle with useTheme hook
- [ ] Staggered card entrance animations
- [ ] Key change crossfade transition
- [ ] Hover effects and micro-interactions
- [ ] URL routing (hash-based: `#key=C`, `#key=Am`)
- [ ] PWA manifest and service worker (offline access)
- [ ] Wake Lock API (screen stays on while practicing)
- [ ] Visual snapshot tests

### Phase 4 — Advanced Features (Month 2+)

**Goal:** Audio, progressions, sharing, print.

- [ ] Audio playback (Web Audio API / Tone.js)
- [ ] Common chord progressions per key
- [ ] Print-friendly chord sheet generator
- [ ] Share button (URL-based, copy to clipboard)
- [ ] Accessibility audit (ARIA labels, keyboard navigation, screen reader testing)
- [ ] Fretboard position grouping (chords clustered by neck position)

---

## 11. Testing Strategy

### Unit Tests (Vitest)

- `getChordsForKey()` returns correct chords for all 12 major and minor keys
- `transposeChord()` handles wrapping, sharps/flats, quality preservation
- `getScaleDegree()` returns correct degrees and null for non-diatonic notes
- Difficulty classification algorithm

### Component Tests (Vitest + React Testing Library)

- ChordDiagram renders correct SVG elements (dots, barres, markers)
- KeySelector renders 12 buttons and fires correct events
- FilterBar toggles filters and sorts correctly
- VoicingSelector navigates between voicings

### Visual Tests

- SVG snapshot tests for common chord diagrams (C, Am, F, G, D, Em, Bm)
- Ensure consistent rendering across voicing changes

---

## 12. Build & Deployment

### Build Configuration

- **Vite** with React plugin, path aliases (`@/` -> `src/`)
- **TypeScript** strict mode with `noUncheckedIndexedAccess`
- **ESLint** flat config with react-hooks and react-refresh plugins
- **Prettier** with tailwindcss plugin

### Deployment

- **Target:** Vercel (zero-config for Vite projects)
- **Build command:** `npm run build`
- **Output:** `dist/`
- **Automatic HTTPS, CDN, cache headers, preview deploys for PRs**

---

## 13. Risks & Mitigations

### Risk 1: "Nobody Uses It Because Alternatives Exist" (Likelihood: HIGH)

**Impact:** Project dies from irrelevance.
**Mitigation:** Ship MVP to 10 actual guitarists within the first week. Must have at least one differentiator (progressive difficulty filtering). If nobody bookmarks it, pivot.

### Risk 2: "Scope Creep Kills Momentum" (Likelihood: HIGH)

**Impact:** Project never ships or ships bloated.
**Mitigation:** Strict MVP definition — 7 chord diagrams per key, nothing more for v1. Written feature freeze. No new features until MVP is live and tested.

### Risk 3: "Mobile UX Is Unusable in Practice" (Likelihood: MEDIUM)

**Impact:** Guitarists try once and never return.
**Mitigation:** Test with an actual guitar in hand from day 1. Prop up a phone, hold a guitar, try to use the app before writing code. 48px+ touch targets. Bottom-positioned key selector.

### Risk 4: "Chord Data Has Errors" (Likelihood: MEDIUM)

**Impact:** Wrong fingerings erode trust.
**Mitigation:** Use established databases (tombatossals/chords-db). Cross-reference with at least two sources. Mark voicings as "common" vs "alternative."

### Risk 5: "Over-Engineering the Tech Stack" (Likelihood: MEDIUM)

**Impact:** Delayed launch, harder maintenance.
**Mitigation:** Start with the simplest viable approach. No external state library. No router for MVP. No audio for MVP.

---

## 14. Future Roadmap

| Feature | Priority | Phase |
|---------|----------|-------|
| Minor keys (natural, harmonic, melodic) | High | 2 |
| Multiple voicings per chord (2-3) | High | 2 |
| Audio playback (strum chord) | Medium | 4 |
| Chord progressions per key | Medium | 4 |
| Print/export to PDF | Medium | 4 |
| PWA with offline support | Medium | 3 |
| Chord substitution suggestions | Low | 5 |
| Fretboard position grouping | Low | 5 |
| User favorites (localStorage) | Low | 5 |
| Scale diagrams | Low | 6 |
| Alternate tunings | Very Low | 6+ |
| User accounts | Very Low | 6+ |

---

## Supporting Documents

| Document | Location | Contents |
|----------|----------|---------|
| Music Theory & Chord Data | `docs/music-theory-requirements.md` | All 12 keys, diatonic chords, 30+ voicing JSON, difficulty algorithm, Circle of Fifths, chord progressions |
| UX Design | `docs/ux-design.md` | Wireframes, interaction patterns, mobile layout, animation specs, accessibility considerations |
| Visual Design System | `DESIGN_SYSTEM.md` | 80+ CSS custom properties, color palette, typography, chord diagram styling, component styles |
| Developer Implementation | `IMPLEMENTATION_PLAN.md` | Component specs, SVG code skeletons, state management, testing code, build configs |
