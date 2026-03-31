# Copy & Apply Chords Between Sections

**Created by**: Explore Team
**Date**: 2026-03-22
**Status**: Complete

## Feature
Copy the chord pattern from one verse and apply it to other verses with one click.

## UX
- Section headers get "Copy Chords" button (when section has chords)
- When copied, a banner shows "Chords copied from [section] — click Paste on any section"
- Other sections show "Paste Chords" button
- "Apply to All" button pastes to every section that has the same or more line count

## Data Model
```typescript
type ChordPattern = string[][][];  // [lineIndex][wordIndex] = chords[]
```

## Implementation
- Add `copiedChordPattern` state + `copiedFromLabel` to VisualChordEditor
- Add Copy/Paste buttons to section headers
- Apply function: overlay chord pattern word-by-word onto target section lines
