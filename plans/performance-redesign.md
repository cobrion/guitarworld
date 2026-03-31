# Performance Mode Redesign - "Slide Deck"

**Created by**: Explore Team
**Date**: 2026-03-22
**Status**: Complete

## Design
Full-screen section-by-section card navigation:
- One section visible at a time, vertically centered
- Tap anywhere / arrow keys / swipe to advance
- Progress dots at bottom
- Large readable text with chords
- Auto-fit font size if section has too many lines
- Minimal chrome — just the music

## Implementation
New component: `PerformanceDisplay.tsx` replacing `LyricsDisplay` when viewMode === 'performance'
