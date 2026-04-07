/**
 * Fetch chord charts from the internet via the backend proxy.
 * Searches Cifraclub for a matching chord page,
 * parses it, and returns ChordPro-formatted text.
 */

const API_BASE = '/api';

export interface ChordFetchResult {
  chordProText: string;
  source: string;
  key: string | null;
}

/**
 * Search for chords for a given song and return ChordPro text.
 * Throws on network errors or when no results are found.
 */
export async function fetchChords(artist: string, title: string): Promise<ChordFetchResult> {
  const params = new URLSearchParams({ artist: artist.trim(), title: title.trim() });
  const res = await fetch(`${API_BASE}/chords/search?${params}`);

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(body.error || `Failed to fetch chords (${res.status})`);
  }

  return res.json();
}
