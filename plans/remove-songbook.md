# Remove Songbook Functionality

**Status:** Complete (2026-09-27)

## Problem statement

Remove the Songbook feature (song library, ChordPro editor, visual chord editor, lyrics search, chord fetch from Cifraclub, reading/practice/performance views, transposition, Nashville numbers, share links, MongoDB song storage) entirely. The app should be left with two tabs — **Key Explorer** and **Scales** — and no dead code, types, CSS tokens, or API routes that existed only to serve the Songbook.

Out of scope: pre-existing dead code unrelated to Songbook (`ChordGrid`, `ChordSelector`, `ChordScaleNeck`, `FilterBar`, `NeckTransitionDots`, `TransitionInfo`, `transitionAnalysis.ts`). Leave those alone.

## Dependency analysis (verified by import graph)

### Songbook-only — delete outright

| File | Only consumers |
|---|---|
| `src/components/songbook/` (all 19 files) | each other + `App.tsx` |
| `src/context/SongbookContext.tsx` | `App.tsx`, songbook components |
| `src/utils/songbookShare.ts` | `SongbookContext`, `SongList` |
| `src/utils/chordpro.ts` | songbook components |
| `src/utils/chordFetch.ts` | `SongEditor` |
| `src/utils/lyricsSearch.ts` | `LyricsSearchDialog` |
| `src/utils/harmonicAnalysis.ts` | songbook components |
| `src/utils/transpose.ts` | `harmonicAnalysis.ts` + songbook components |

### Shared — edit, do not delete

| File | Change |
|---|---|
| `src/components/App.tsx` | Remove `SongbookProvider`, `SongbookView`, `#songbook=` hash detection; `useState<TabView>('explorer')` |
| `src/components/TabBar.tsx` | Drop `{ key: 'songbook', label: 'Songbook' }` |
| `src/types/index.ts` | `TabView = 'explorer' \| 'scales'`; delete the whole `// === Songbook Types ===` block (lines ~112–194): `Song`, `SongSection`, `SectionType`, `ParsedLine`, `ChordLyricSegment`, `AnalyzedChord`, `HarmonicFunction`, `EditorWord`, `SongViewMode`, `SongSortOption`, `SongbookAction`, `SongbookState`. None are referenced outside Songbook files. |
| `src/utils/api.ts` | Delete `fetchSongs`, `addSong`, `updateSong`, `deleteSong`, `bulkImportSongs`, the `Song` import, and fix the header comment. Keep `getPreference`/`setPreference` (used by `ChordContext`, `useTheme`). |
| `src/utils/constants.ts` | Delete `generateUUID()` (~line 89) — only used by `SongEditor`/`SongList`. |
| `src/index.css` | Delete `--hf-*` harmonic-function tokens (32 lines across light + dark blocks; only used by `harmonicAnalysis.ts` and songbook components) and `--songbook-chord-font` (both themes). |
| `index.html` | Optional: drop `JetBrains+Mono` from the Google Fonts URL — its only consumer was `--songbook-chord-font`. Saves a font download. |
| `server/index.cjs` | See backend section. |

### Shared — keep unchanged
`musicTheory.ts` (`lookupChord`, `getScaleNotes`, `getChordsForKey` still used internally / by Key Explorer), `constants.ts` (`ALL_KEYS`, `FLAT_KEYS`), `ChordDiagram.tsx` (Key Explorer), `ChordContext.tsx`, `useTheme.ts`.

## Backend (`server/index.cjs`)

Remove:
- `// SONGS` section: `GET/POST /api/songs`, `POST /api/songs/bulk`, `PUT/DELETE /api/songs/:id`
- `songs` index creation in `connectDB()`
- Entire `// CHORD SEARCH (Cifraclub proxy)` section: `FETCH_HEADERS`, `slugify`, `extractCifraContent`, `extractKeyFromCifra`, `SECTION_NAMES`, `isSectionName`, `isChordLine`, `extractChordPositions`, `mergeChordsIntoLyrics`, `isTabLine`, `cifraToChordPro`, `fetchCifraPage`, `searchCifraclub`, `GET /api/chords/search`

Keep: express/cors/mongodb setup, `preferences` index, `GET/PUT /api/preferences/:key` (theme, selected keys, beginner mode depend on it). `package.json` dependencies stay — all still used. `express.json({ limit: '10mb' })` limit existed for bulk song import; can drop to default, optional.

## Data (MongoDB `guitarworld` on shawshank, 10.5.109.1)

**Decision: saved songs are removed.** The `songs` collection is dropped along with the code.

Current state (read-only check, 2026-09-27): collections `songs` (6 documents) and `preferences` (`theme`, `chord-selectedKeys`, `chord-beginnerMode`). No `songbook-prefs` document exists, but delete it defensively in case a running old build writes one before deploy.

Mongo CLI tools (`mongosh`, `mongoexport`) live on shawshank, not locally, so run these over SSH. URI: `mongodb://appuser:<pw>@10.5.109.1:27017/guitarworld?authSource=admin` (password in `server/index.cjs` / Kloddy KB).

Run **after** the code change is deployed and the API server restarted, so nothing recreates the collection or its index:

1. **Backup (safety net, cheap):**
   ```bash
   ssh ubuntu@shawshank.xyz "mongoexport --uri '<URI>' --collection songs --jsonArray --out ~/guitarworld-songs-backup-2026-09-27.json"
   ```
   Verify the file has 6 entries. Delete it later once confident.
2. **Drop:**
   ```bash
   ssh ubuntu@shawshank.xyz "mongosh --quiet '<URI>' --eval 'db.songs.drop(); db.preferences.deleteOne({ key: \"songbook-prefs\" })'"
   ```
3. **Verify:** `db.getCollectionNames()` returns only `['preferences']`, and the three remaining preference keys are intact.

Order matters: dropping before the server restart would let the old `connectDB()` re-create `songs` via `createIndex` on next start.

Irreversible shared-state operation — confirm with George immediately before running step 2.

Browser leftovers: `localStorage` keys `guitarworld-songbook` / `guitarworld-songbook-prefs` were already cleared by the old migration path; no cleanup code needed.

## Docs / history

- `plans/songbook.md`, `plans/lyrics-search.md`, `plans/visual-chord-editor.md`, `plans/performance-redesign.md`, `plans/key-step-transposition.md` and `journal/2026-03-25_add_song_button_not_working.md` — **recommend keeping** as history (git has them either way); optionally prepend a one-line "Superseded: Songbook removed 2026-09" note. Confirm with George.
- `README.md` / `docs/` — no Songbook references found; nothing to change.

## Execution order

1. `git rm -r src/components/songbook src/context/SongbookContext.tsx src/utils/{songbookShare,chordpro,chordFetch,lyricsSearch,harmonicAnalysis,transpose}.ts`
2. Edit `App.tsx`, `TabBar.tsx`, `types/index.ts`, `api.ts`, `constants.ts`
3. Edit `index.css` (and optionally `index.html`)
4. Edit `server/index.cjs`
5. `npm run build` (tsc -b catches any stray import/type) and `npm run lint`
6. Final sweep: `grep -rniE "song|lyric|chordpro|harmonic|transpos|nashville|cifra|hf-" src server index.html` — expected zero hits except unrelated matches (e.g. "enharmonic").
7. Restart via `control/restart.sh` and smoke-test
8. Back up, then drop the `songs` collection (see Data section), then verify

Single commit: "Remove Songbook feature".

## Testing strategy

### Integration
- `npm run build` passes with zero TS errors; `npm run lint` clean.
- API server starts, connects to MongoDB, logs no errors.
- `GET /api/preferences/theme` and `PUT` still work; `GET /api/songs` and `/api/chords/search` now 404.
- Theme toggle persists across reload; selected keys + beginner mode persist (ChordContext → preferences).

### Regression
- Tab bar shows exactly two tabs, each `flex-1` — check the wider tabs look fine at mobile, tablet, desktop widths and sticky behavior still works.
- Key Explorer: select/deselect keys, chord table, chord diagrams, voicing navigation (`<<`/`>>`), beginner mode.
- Scales tab: scale selection, positions, orientation toggle (horizontal/vertical), view mode toggle.
- Light + dark themes both render correctly after CSS token removal (no undefined-var fallbacks).
- Load an old share URL `/#songbook=...` → lands on Key Explorer without errors; hash is harmless.
- Browser console clean on load (no failed `/api/songs` requests).
- Bundle size drops noticeably in `vite build` output (sanity check that tree is gone).

## Risk assessment

| Risk | Likelihood | Mitigation |
|---|---|---|
| Hidden import of a deleted util outside songbook | Low (graph verified) | `tsc -b` fails loudly |
| Removing a CSS var still used elsewhere | Low (grep verified `--hf-*`, `--songbook-*`) | Post-change grep + visual check both themes |
| Song data loss is intended; risk is dropping the wrong thing | Low | Drop only `songs`; export first; verify `preferences` intact |
| `songs` re-created after drop | Medium if order wrong | Drop only after the new server (no `songs` index) is running |
| Old bookmarked share links | Certain but benign | Falls through to Explorer |
| Accidentally removing preferences API | Low | Explicit keep list above; theme persistence test |

Rollback: `git revert` of the single commit; songs can be restored with `mongoimport --jsonArray` from the backup file.

## Open questions for George
1. Keep old Songbook plan/journal docs as history, annotate them, or delete them?
2. Drop JetBrains Mono from `index.html`?
