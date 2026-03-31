# GuitarWorld UX Design Document

## Overview

GuitarWorld is a single-page application that displays all associated chords and fingering diagrams for a selected musical key. This document defines the interaction patterns, information architecture, layout strategy, and micro-interactions that create an intuitive experience for musicians of all levels.

---

## 1. Key Selection UX

### Approach Comparison

| Approach | Pros | Cons | Best For |
|---|---|---|---|
| **Dropdown** | Compact, familiar, accessible | Hidden options, extra click required, no spatial relationship between keys | Space-constrained headers |
| **Button Group** | All options visible, single click, fast switching | Takes horizontal space, no musical relationship shown | Quick selection with limited keys |
| **Circle of Fifths** | Musically meaningful layout, shows key relationships, visually striking | Complex to implement, less intuitive for beginners, poor on mobile | Theory-oriented musicians |
| **Piano Keyboard** | Intuitive note selection, familiar to multi-instrumentalists | Doesn't map well to guitar thinking, confusing sharp/flat UI | Multi-instrumentalist apps |

### Recommendation: Hybrid Button Group with Smart Layout

Use a **horizontal scrollable button group** arranged chromatically (C, C#/Db, D, D#/Eb, E, F, F#/Gb, G, G#/Ab, A, A#/Bb, B) as the primary selector. This is the best approach for guitarists because:

- All 12 keys are visible or nearly visible at once
- Single-tap selection with zero extra interaction
- Chromatic order matches guitar fret logic (each fret = one semitone)
- Works well on both mobile (horizontal scroll) and desktop (full row)
- A secondary toggle switches between "Major Keys" and "Minor Keys" above the button row

### Handling Sharp/Flat Equivalents

- Display the **most common enharmonic spelling** as the primary label: C# (not Db), Eb (not D#), F# (not Gb), Ab (not G#), Bb (not A#)
- Show the alternative name as a smaller subscript on hover/focus: `F#` with `Gb` beneath
- When a key is selected, the header displays both names: "Key of F# / Gb Major"
- Internal data model uses a canonical key identifier; display spelling is cosmetic

### Quick-Switch Behavior

- Selecting a new key performs an **in-place content swap** with a crossfade transition (200ms)
- The key selector remains **sticky at the top** of the viewport during scroll
- Scroll position resets to the top of the chord grid on key change
- Browser URL updates to `/key/C`, `/key/Am`, etc. enabling back-button navigation between keys
- Last selected key is stored in `localStorage` and restored on return visits

### Key Selector Component Specification

```
[Major Keys ▾ | Minor Keys]    ← Toggle (pill switch)
┌─────────────────────────────────────────────────────────┐
│  C  │ C# │  D  │ Eb │  E  │  F  │ F# │  G  │ Ab │  A  │ Bb │  B  │
│     │ Db │     │ D# │     │     │ Gb │     │ G# │     │ A# │     │
└─────────────────────────────────────────────────────────┘
         ↑ selected state: filled background, bold text, subtle glow
```

- On mobile: horizontally scrollable with the selected key centered
- Button size: minimum 44px x 44px touch target
- Selected state: filled accent color background with white text
- Unselected state: outlined, muted text
- Hover state (desktop): light background fill

---

## 2. Chord Display Layout

### Organization Strategy

Chords are organized into **visually distinct groups** by chord quality. Each group has a section header and contains a grid of chord cards.

#### Group Order (top to bottom)

1. **Diatonic Triads** -- "Core Chords" (7 chords: I, ii, iii, IV, V, vi, vii-dim)
2. **Diatonic Seventh Chords** -- "Seventh Chords" (7 chords: Imaj7, ii7, iii7, IVmaj7, V7, vi7, vii-half-dim-7)
3. **Suspended & Added Tone** -- "Color Chords" (sus2, sus4, add9, 6 variants)
4. **Extended Chords** -- "Extended" (9th, 11th, 13th variants)
5. **Borrowed & Modal Interchange** -- "Borrowed Chords" (from parallel minor/major)

#### Progressive Disclosure

- **Default view**: Groups 1 and 2 are expanded (diatonic triads and sevenths)
- **Collapsed by default**: Groups 3, 4, 5 show only the section header with a chord count badge and a "Show" button
- **"Show All" toggle** in the filter bar expands everything at once
- Collapse/expand state is remembered per session

### Responsive Grid

| Viewport | Columns | Card Width | Gap |
|---|---|---|---|
| Mobile (<640px) | 2 | ~45% viewport | 12px |
| Tablet (640-1024px) | 3-4 | ~200px | 16px |
| Desktop (1024-1440px) | 4-5 | ~220px | 20px |
| Wide (>1440px) | 5-6 | ~240px | 24px |

- Grid uses CSS Grid with `auto-fill` and `minmax(180px, 1fr)` for fluid responsiveness
- Maximum content width: 1400px, centered
- Section headers span the full grid width

### Visual Distinction: Diatonic vs Extended

- **Diatonic chords**: Full-opacity card with a subtle left-border accent color (e.g., 3px blue-left-border)
- **Extended/borrowed chords**: Slightly reduced opacity (0.85), no left-border accent, lighter background
- This creates a natural visual hierarchy without being heavy-handed

---

## 3. Chord Diagram Interaction

### Card Default State

Each chord card displays:
- The chord diagram (standard 5-fret grid with dot positions)
- Chord name below the diagram
- A small voicing indicator: "1 of 3" if multiple voicings exist

### Multiple Voicings

- **Desktop**: On card click, the card expands inline (pushing content below) to reveal a horizontal row of voicing thumbnails. Clicking a thumbnail swaps the main diagram.
- **Mobile**: On card tap, a **bottom sheet** slides up showing the chord detail view with a swipeable voicing carousel.
- Voicing navigation: left/right arrow buttons on desktop, swipe gesture on mobile
- Dot indicators below the diagram show the current voicing position (like a carousel)

### Interaction States

| State | Desktop | Mobile |
|---|---|---|
| **Default** | Static diagram with name | Static diagram with name |
| **Hover** | Subtle scale up (1.02), shadow elevation, finger numbers appear on dots | N/A |
| **Active/Tap** | Card expands to show voicings + detail | Bottom sheet opens with full detail |
| **Focus** | Keyboard-accessible outline ring | N/A |

### Chord Detail View Content (expanded card / bottom sheet)

```
┌──────────────────────────────────────┐
│  Chord Name: C Major                 │
│  Roman Numeral: I                    │
│  Difficulty: ★★☆☆☆ (Beginner)       │
│                                      │
│  ┌────────────────┐                  │
│  │   ╓─┬─┬─┬─╖   │   Voicings:     │
│  │   ║ │ ○│ │ ║   │   [1] [2] [3]   │
│  │   ╟─┼─┼─┼─╢   │                  │
│  │   ║ │ │ ● ║   │   Fret Range:    │
│  │   ╟─┼─┼─┼─╢   │   Open - Fret 3  │
│  │   ║ ●│ │ ● ║   │                  │
│  │   ╟─┼─┼─┼─╢   │   Notes:         │
│  │   ║ │ │ │ ║   │   C E G C E     │
│  │   ╙─┴─┴─┴─╜   │                  │
│  └────────────────┘                  │
│                                      │
│  Alternative Names: CM, Cmaj         │
│  Theory: Tonic chord of C major      │
└──────────────────────────────────────┘
```

### Mobile Gestures

- **Swipe left/right** on diagram: navigate voicings
- **Pinch to zoom**: enlarge diagram for detailed finger placement view (diagram renders as SVG, so it scales cleanly)
- **Swipe down on bottom sheet**: dismiss
- **Long press on card**: quick-preview without opening full detail (haptic feedback)

---

## 4. Information Hierarchy

### Primary (Always Visible on Card)

- **Chord diagram**: The SVG fingering diagram, largest element on the card (~60% of card height)
- **Chord name**: Bold, prominent text below diagram (e.g., "Cmaj7", "Dm", "G7")
- Size: 16-18px bold on mobile, 18-20px on desktop

### Secondary (Visible on Card, Subdued)

- **Roman numeral**: Small badge in the top-right corner of the card (e.g., "I", "ii", "V7")
- Color-coded: Major = blue badge, Minor = warm/amber badge, Diminished = gray badge
- **Finger numbers**: Shown on the diagram dots on hover (desktop) or always in detail view
- **Voicing count**: "1/3" indicator if multiple voicings exist

### Tertiary (Detail View Only)

- **Difficulty rating**: Star rating or text badge (Beginner / Intermediate / Advanced)
- **Fret range**: "Open position" or "Fret 5-8"
- **Notes in chord**: Individual note names (C, E, G)
- **Alternative names**: Other common names for the chord
- **Theory context**: Brief note about the chord's function in the key
- **Intervals**: Root, 3rd, 5th, 7th, etc.

---

## 5. Filtering & Sorting

### Filter Chips (Horizontal Scrollable Row)

```
[ All ] [ Major ] [ Minor ] [ 7th ] [ Sus ] [ Dim/Aug ] [ Extended ]
```

- "All" is selected by default
- Multiple filters can be active simultaneously (additive filtering)
- Active chip: filled accent color; Inactive: outlined
- Chips are scrollable horizontally on mobile
- Filter count badge: each chip shows the count of matching chords, e.g., "Minor (3)"

### Sort Options

A dropdown or segmented control to the right of the filter chips:

- **Scale Degree** (default): Ordered by Roman numeral (I, ii, iii, IV, V, vi, vii)
- **Difficulty**: Easiest first (beginner-friendly)
- **Alphabetical**: A-Z by chord name

### Beginner Mode

- Toggle switch in the filter/sort bar: "Beginner Mode"
- When active:
  - Shows only the **diatonic triads** (Group 1: 7 core chords)
  - Hides all extended, suspended, and borrowed chords
  - Adds a "Tip" badge on each card with a one-line playing suggestion
  - Difficulty stars are always visible on cards
- Beginner mode state persists in `localStorage`
- Subtle visual indicator (e.g., green "Beginner" pill in the header) when active

### Filter Bar Layout

```
┌──────────────────────────────────────────────────────────────┐
│ [All] [Major] [Minor] [7th] [Sus] [Dim/Aug]    Sort: [▾ Scale Degree]  │
│                                            ☐ Beginner Mode  │
└──────────────────────────────────────────────────────────────┘
```

On mobile, the sort dropdown and beginner toggle move into a "Filter" bottom sheet triggered by a filter icon button, keeping the main filter chips visible.

---

## 6. Mobile-First Design

### Layout Breakpoints

```
Mobile (< 640px):
┌────────────────────┐
│   GuitarWorld       │  ← Compact header
├────────────────────┤
│ [C][C#][D][Eb]...  │  ← Sticky key selector (scrollable)
├────────────────────┤
│ [All][Maj][Min]... │  ← Filter chips (scrollable)
├────────────────────┤
│ ┌────┐ ┌────┐     │
│ │card│ │card│      │  ← 2-column grid
│ └────┘ └────┘     │
│ ┌────┐ ┌────┐     │
│ │card│ │card│      │
│ └────┘ └────┘     │
└────────────────────┘

Desktop (> 1024px):
┌──────────────────────────────────────────────────────┐
│  GuitarWorld                    [Theme] [About]       │
├──────────────────────────────────────────────────────┤
│  [Major ▾]  [C] [C#] [D] [Eb] [E] [F] [F#] ...     │
├──────────────────────────────────────────────────────┤
│  [All] [Major] [Minor] [7th] ...   Sort:[▾]  ☐Beg   │
├──────────────────────────────────────────────────────┤
│  ── Core Chords (7) ──────────────────────────       │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐          │
│  │  C  │ │ Dm  │ │ Em  │ │  F  │ │  G  │           │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘          │
│  ┌─────┐ ┌─────┐                                    │
│  │ Am  │ │Bdim │                                     │
│  └─────┘ └─────┘                                    │
│                                                      │
│  ── Seventh Chords (7) ──────────────────────        │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐          │
│  │Cmaj7│ │ Dm7 │ │ Em7 │ │Fmaj7│ │ G7  │           │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘          │
│  ...                                                 │
└──────────────────────────────────────────────────────┘
```

### Sticky Elements

- **Key selector bar**: Sticks to the top on scroll (z-index: 100)
- **Filter bar**: Sticks below the key selector on scroll (z-index: 99)
- Combined sticky height on mobile: ~100px maximum to preserve content space
- On scroll down, the header title collapses/hides; on scroll up, it reappears (iOS-style)

### Touch Targets

- All interactive elements: minimum **44px x 44px** touch target (WCAG 2.5.5)
- Key selector buttons: 44px tall, width based on content with min 40px
- Filter chips: 36px tall with 44px touch area (extra padding)
- Chord cards: full card is tappable, minimum 160px x 200px

### Bottom Sheet (Mobile Chord Detail)

- Triggered by tapping any chord card
- Slides up from the bottom, covering ~75% of the screen
- Draggable handle at the top for dismiss gesture
- Contains: enlarged diagram, voicing carousel, all tertiary information
- Background overlay (semi-transparent) dismisses the sheet on tap

---

## 7. Transitions & Animations

### Key Change Transition

1. Current chord cards fade out with a slight downward movement (150ms, ease-out)
2. Brief pause (50ms)
3. New chord cards fade in with a slight upward movement (200ms, ease-out)
4. Key selector button animates: old key de-highlights, new key highlights with a subtle pulse

### Card Entrance Animation

- Cards use a **staggered fade-in** on initial page load and key changes
- Each card delays by 30ms after the previous one (total time for 7 cards: ~210ms)
- Animation: `opacity: 0 -> 1` and `translateY: 12px -> 0`
- Use `prefers-reduced-motion` media query to disable animations for accessibility

### Card Hover/Tap Animation (Desktop)

- Hover: `transform: scale(1.02)` with `box-shadow` elevation increase (150ms ease)
- Active/press: `transform: scale(0.98)` for tactile feedback feel (100ms)

### Filter Transition

- When filters change, non-matching cards animate out (fade + scale down) and matching cards rearrange with CSS Grid layout animation
- Use `layout` animation or FLIP technique for smooth grid reflow

### Performance Guidelines

- All animations use `transform` and `opacity` only (GPU-composited properties)
- No layout-triggering animations (`width`, `height`, `margin`, `padding`)
- Animation durations: 100-250ms (fast, responsive feel)
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)` (Material-style standard easing)

---

## 8. Navigation Flow

### URL Structure

```
/                    → Redirects to /key/C (default key)
/key/C               → Key of C Major, all chords
/key/Am              → Key of A Minor, all chords
/key/F-sharp         → Key of F# Major (URL-safe encoding)
/key/C/chord/Dm7     → Deep link to Dm7 chord in key of C (opens detail view)
```

### Routing Behavior

- **Single-page application** with client-side routing
- Key changes update the URL via `history.pushState`
- Browser back/forward buttons navigate between previously viewed keys
- Deep links to specific chords open the page with that chord's detail view expanded/highlighted

### State Management

- URL is the source of truth for: selected key
- `localStorage` persists: beginner mode, last selected key, theme preference, collapse/expand state of chord groups
- Filter and sort selections reset on key change (they apply per-key context)

### First Visit Flow

1. User lands on `/` -- redirect to `/key/C`
2. Brief tooltip or overlay: "Select a key to see all its chords. Tap any chord for details."
3. Tooltip dismisses on any interaction and is not shown again (`localStorage` flag)

---

## 9. Reducing Cognitive Load

### Progressive Disclosure

- **Level 1 (default)**: Diatonic triads only (7 chords) -- immediately digestible
- **Level 2 (one click)**: Expand seventh chords section (7 more chords)
- **Level 3 (explicit)**: Show extended, suspended, borrowed chords
- Users control how much complexity they see

### Visual Grouping

- Each chord group has:
  - A **section header** with the group name and chord count badge
  - A **subtle background color** difference (alternating between white and very light gray, or using a faint colored left border per group)
  - Adequate **vertical spacing** (32px) between groups

### Section Headers

```
── Core Chords (7) ───────────────────────────
```

- Left-aligned text with a horizontal rule extending to the right
- Chord count in parentheses as a muted badge
- Collapse/expand chevron icon on the right side

### Contextual Help

- **First-time tooltip**: Brief 3-step onboarding overlay (key selection -> chord tap -> voicing navigation)
- **Roman numeral explanation**: Hovering over a Roman numeral badge shows a tooltip: "ii = second degree, minor chord"
- **No persistent help panel** -- information is available on demand through tooltips, not cluttering the default UI

### Avoiding Overwhelm

- A maximum of **7-8 cards visible** without scrolling on any screen size (matching Miller's Law / cognitive chunk size)
- The collapsed sections make it clear there is more to explore without presenting it all at once
- Clear visual hierarchy ensures the eye is drawn to chord name and diagram first, not metadata

---

## 10. Wireframe Descriptions

### Main Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER                                                       │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ Logo: "GuitarWorld"  (left)                            │   │
│ │ Navigation: [About] [Settings/Theme Toggle] (right)    │   │
│ └───────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│ KEY SELECTOR BAR (sticky on scroll)                          │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ [Major Keys ▾ / Minor Keys] toggle                     │   │
│ │ [C] [C#] [D] [Eb] [E] [F] [F#] [G] [Ab] [A] [Bb] [B]│   │
│ └───────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│ FILTER & SORT BAR (sticky below key selector)                │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ Chips: [All] [Major] [Minor] [7th] [Sus] [Dim/Aug]    │   │
│ │ Right side: Sort dropdown + Beginner Mode toggle       │   │
│ └───────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│ PAGE TITLE                                                   │
│ "Key of C Major" (h1) — "7 core chords, 20 total" (sub)    │
├─────────────────────────────────────────────────────────────┤
│ CHORD GRID                                                   │
│                                                              │
│ ── Core Chords (7) ──────────────────────                   │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐             │
│ │  C   │ │  Dm  │ │  Em  │ │  F   │ │  G   │              │
│ │[diag]│ │[diag]│ │[diag]│ │[diag]│ │[diag]│              │
│ │  I   │ │  ii  │ │ iii  │ │  IV  │ │  V   │              │
│ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘             │
│ ┌──────┐ ┌──────┐                                          │
│ │  Am  │ │ Bdim │                                           │
│ │[diag]│ │[diag]│                                           │
│ │  vi  │ │ vii° │                                           │
│ └──────┘ └──────┘                                          │
│                                                              │
│ ── Seventh Chords (7) ── [Show ▾] ────────                  │
│                                                              │
│ ── Color Chords (6) ── [Show ▾] ──────────                  │
│                                                              │
│ ── Extended (5) ── [Show ▾] ──────────────                  │
│                                                              │
│ ── Borrowed Chords (4) ── [Show ▾] ──────                   │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│ FOOTER                                                       │
│ "GuitarWorld" | About | GitHub | Built with [tech]           │
│ "Chord data sourced from standard guitar voicing libraries"  │
└─────────────────────────────────────────────────────────────┘
```

### Chord Card Component

```
┌────────────────────────┐
│ [ii]              [1/3]│  ← Roman numeral badge (top-left), voicing count (top-right)
│                        │
│    ╓──┬──┬──┬──╖      │
│    ║  │  │  │  ║      │  ← Chord diagram (SVG)
│    ╟──┼──┼──┼──╢      │     - Open/muted string indicators above nut
│    ║  │  ●  │  ║      │     - Dot positions for finger placement
│    ╟──┼──┼──┼──╢      │     - Barre notation where applicable
│    ║  ●  │  ●  ║      │     - Fret number label if not open position
│    ╟──┼──┼──┼──╢      │
│    ║  │  │  │  ║      │
│    ╙──┴──┴──┴──╜      │
│                        │
│      D minor           │  ← Chord name (primary text, bold)
│                        │
│ [Beginner ★★☆☆☆]      │  ← Difficulty badge (shown in Beginner Mode)
└────────────────────────┘

Card dimensions:
- Min width: 160px
- Max width: 260px
- Aspect ratio: approximately 3:4 (width:height)
- Border radius: 8px
- Shadow: subtle drop shadow (0 1px 3px rgba(0,0,0,0.12))
- Border: 1px solid border-color
- Diatonic cards: 3px left border in accent color
```

### Mobile vs Desktop Layout Differences

| Element | Mobile (< 640px) | Desktop (> 1024px) |
|---|---|---|
| **Header** | Logo only, hamburger menu for settings | Full nav bar with inline links |
| **Key selector** | Horizontally scrollable, selected key centered | Full row visible, no scrolling needed |
| **Major/Minor toggle** | Inline with key selector, compact pill | Separate line above key buttons |
| **Filter chips** | Scrollable row, sort/beginner in bottom sheet | Full row with sort dropdown and toggle inline |
| **Chord grid** | 2 columns | 4-5 columns |
| **Chord card tap** | Opens bottom sheet with full detail | Expands card inline with voicing row |
| **Section headers** | Smaller text, tap to expand | Larger text, click to expand |
| **Page title** | Smaller, single line: "Key of C Major" | Larger with subtitle: "Key of C Major -- 7 core chords, 20 total" |
| **Footer** | Minimal: logo + links stacked | Full footer with multiple columns |
| **Sticky area** | Key selector + filter chips (~100px total) | Key selector + filter bar (~110px total) |
| **Voicing navigation** | Swipe gesture on diagram | Arrow buttons flanking diagram |

---

## 11. Accessibility Considerations

- All chord diagrams include **descriptive `aria-label`** attributes (e.g., "C major chord, open position, fingers on A string fret 3, D string fret 2, B string fret 1")
- Key selector buttons use `role="radiogroup"` with `aria-checked` state
- Filter chips use `role="checkbox"` or `role="switch"` semantics
- Focus order follows visual order: header -> key selector -> filters -> chord grid
- All interactive elements are keyboard-navigable (Tab, Enter, Arrow keys)
- Color is never the only indicator of state (icons and text labels accompany color)
- `prefers-reduced-motion` disables all non-essential animations
- Minimum contrast ratio: 4.5:1 for text, 3:1 for large text and interactive boundaries
- Bottom sheet (mobile) traps focus when open and returns focus on dismiss

---

## 12. Summary of Key Design Decisions

1. **Button group for key selection** -- fastest interaction, chromatically ordered to match guitar logic
2. **Grouped card grid with progressive disclosure** -- prevents overwhelm, promotes exploration
3. **Bottom sheet on mobile, inline expansion on desktop** -- platform-appropriate detail views
4. **Sticky key selector and filter bar** -- always accessible without scrolling back
5. **Staggered card animations** -- delightful but fast, respects motion preferences
6. **Beginner Mode** -- explicit toggle reduces complexity for new players
7. **URL-driven navigation** -- shareable, bookmarkable, browser-native back/forward support
8. **SVG chord diagrams** -- scalable, accessible, animatable, theme-friendly
9. **44px minimum touch targets** -- meets accessibility standards and feels comfortable for guitar players (who may have calloused fingers)
10. **localStorage for preferences** -- remembers key, mode, theme without requiring accounts
