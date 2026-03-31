/**
 * Lyrics search via LRCLIB API (https://lrclib.net)
 * Free, CORS-enabled, no authentication required.
 */

export interface LyricsSearchResult {
  id: number;
  trackName: string;
  artistName: string;
  albumName: string;
  duration: number;
  instrumental: boolean;
  plainLyrics: string | null;
  syncedLyrics: string | null;
}

const API_BASE = 'https://lrclib.net/api';

/**
 * Search for lyrics by query string (artist, track name, etc.)
 */
export async function searchLyrics(query: string): Promise<LyricsSearchResult[]> {
  if (!query.trim()) return [];

  const url = `${API_BASE}/search?q=${encodeURIComponent(query.trim())}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Lyrics search failed: ${response.status} ${response.statusText}`);
  }

  const results: LyricsSearchResult[] = await response.json();

  // Filter out instrumentals and results without lyrics
  return results.filter((r) => !r.instrumental && r.plainLyrics);
}

/**
 * Format duration in seconds to MM:SS display.
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Convert plain lyrics text to ChordPro format with auto-detected sections.
 *
 * Blank lines in the lyrics become section boundaries.
 * Sections are auto-labeled as "Verse 1", "Verse 2", etc.
 * Title and artist are added as metadata directives.
 */
export function lyricsToChordPro(
  plainLyrics: string,
  title: string,
  artist: string
): string {
  const lines: string[] = [];

  // Metadata directives
  lines.push(`{title: ${title}}`);
  lines.push(`{artist: ${artist}}`);
  lines.push('');

  // Split lyrics by lines and group into sections at blank lines
  const lyricLines = plainLyrics.split('\n');
  const sections: string[][] = [];
  let currentGroup: string[] = [];

  for (const line of lyricLines) {
    if (line.trim() === '') {
      if (currentGroup.length > 0) {
        sections.push(currentGroup);
        currentGroup = [];
      }
    } else {
      currentGroup.push(line);
    }
  }
  if (currentGroup.length > 0) {
    sections.push(currentGroup);
  }

  // Label sections
  let verseCount = 0;
  for (const section of sections) {
    verseCount++;
    lines.push(`{section: Verse ${verseCount}}`);
    for (const lyricLine of section) {
      lines.push(lyricLine);
    }
    lines.push('');
  }

  return lines.join('\n').trimEnd();
}
