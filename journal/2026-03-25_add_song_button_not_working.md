# Add Song button not working over LAN

**Date:** 2026-03-25

## Problem
Clicking the "Add Song" button in the SongEditor modal did nothing — no song created, no modal close, no error shown. The user followed the flow: Songbook → + Add Song → Search Web → Select a song → Click "Add Song".

## What Was Tried

| Approach | Result |
|----------|--------|
| Code review of full save chain (SongEditor → SongList → SongbookContext → API) | All logic appeared correct |
| Playwright headless browser tests on `localhost:3000` | All tests passed — basic add, search web add, persistence |
| Direct API test (PUT via curl through Vite proxy) | API worked correctly with upsert |
| TypeScript compilation check | No errors |
| Added direct `apiUpsertSong()` call in SongList.handleSave as backup persistence | Did not fix the issue |
| Added `z-index: 300` to modal header/footer to beat ChordPickerDropdown backdrop (z-index 190) | **Broke the LyricsSearchDialog** — header/footer rendered on top of search results (z-index 110), preventing song selection |
| Removed z-index fix, replaced ChordPickerDropdown full-screen backdrop with `document.addEventListener('mousedown')` click-outside handler | Fixed the picker overlay issue but Add Song still didn't work |
| Added visible diagnostics (saveStatus state, native DOM click listener) | Confirmed click worked in headless Chromium but not in user's browser |
| Tested `crypto.randomUUID()` on LAN IP vs localhost | **Found root cause** |

## Root Cause
The user was accessing the app via the LAN IP address (`http://192.168.x.x:3000`) rather than `localhost`. This is a **non-secure context** (`window.isSecureContext === false`), where `crypto.randomUUID()` is **not available** (`typeof crypto.randomUUID === 'undefined'`).

In `SongEditor.handleSave`, the line:
```js
id: song?.id ?? crypto.randomUUID(),
```
threw `TypeError: crypto.randomUUID is not a function`, which silently crashed the entire save handler — no song object was created, `onSave()` was never called, the modal never closed.

The Vite dev server was started with `--host 0.0.0.0`, making it accessible over the network. The user accessed it from a browser on the same machine or network via the IP address rather than `localhost`.

## Fix Applied

### 1. Created `generateUUID()` utility (`src/utils/constants.ts`)
```ts
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 1
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}
```
Uses `crypto.randomUUID()` when available, falls back to `crypto.getRandomValues()` (works in all contexts).

### 2. Replaced all `crypto.randomUUID()` calls
- `src/components/songbook/SongEditor.tsx` — new song ID generation
- `src/components/songbook/SongList.tsx` — song duplicate ID generation

### 3. Fixed ChordPickerDropdown overlay issue (`src/components/songbook/ChordPickerDropdown.tsx`)
- Removed the invisible full-screen backdrop div (`position: fixed; inset: 0; z-index: 190`) that blocked clicks to the modal footer
- Replaced with `document.addEventListener('mousedown')` click-outside handler
- Added scroll listener to close picker when lyrics area scrolls

### 4. Added direct API persistence (`src/components/songbook/SongList.tsx`)
- `handleSave` now calls `apiUpsertSong(song)` directly in addition to the context sync effect, as a reliability measure

## Notes
- `crypto.randomUUID()` requires a **secure context** (HTTPS or localhost). LAN IPs like `192.168.x.x` are NOT secure contexts.
- `crypto.getRandomValues()` works in ALL contexts — always prefer it for fallback UUID generation.
- The Vite dev server's `--host 0.0.0.0` flag enables LAN access, which means the app runs in a non-secure context for network clients.
- Playwright tests on `localhost` will NOT catch secure-context-only API failures. To test LAN scenarios, explicitly use the machine's IP address.
- When using z-index to solve overlay issues, audit ALL overlays in the same stacking context — fixing one (ChordPickerDropdown at 190) can break another (LyricsSearchDialog at 110).
