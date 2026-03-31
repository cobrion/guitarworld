# Online Lyrics Search & Fetch - Implementation Plan

**Created by**: Explore Team
**Date**: 2026-03-21
**Status**: Complete

## Feature Description

Add the ability to search for song lyrics online via the LRCLIB API and import them directly into the songbook. The fetched lyrics are auto-formatted into ChordPro sections, pre-populating the SongEditor so the user can then add chords manually.

## API

- **Endpoint**: `https://lrclib.net/api/search?q={query}`
- **CORS**: Enabled (browser-safe)
- **Auth**: None required
- **Response**: Array of `{ id, trackName, artistName, albumName, duration, plainLyrics, syncedLyrics, instrumental }`

## UX Flow

1. User clicks "Search Web" in SongList (or "Fetch Lyrics" in SongEditor toolbar)
2. Search dialog opens with text input
3. User types artist/song name, hits search
4. Results displayed as selectable cards (track, artist, album, duration)
5. User clicks a result
6. Plain lyrics are converted to ChordPro format with auto-sections
7. SongEditor opens pre-populated with title, artist, and formatted lyrics
8. User adds chords, adjusts sections, sets key, saves

## Files

### New
- `src/utils/lyricsSearch.ts` - API fetch + lyrics-to-ChordPro conversion
- `src/components/songbook/LyricsSearchDialog.tsx` - Search modal

### Modified
- `src/components/songbook/SongList.tsx` - Add "Search Web" button
- `src/components/songbook/SongEditor.tsx` - Add "Fetch Lyrics" toolbar button, accept initial data props
