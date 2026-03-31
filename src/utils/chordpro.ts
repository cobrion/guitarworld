import type { SongSection, SectionType, ParsedLine, ChordLyricSegment, EditorWord } from '../types';

const DIRECTIVE_RE = /^\{(\w[\w-]*):\s*(.+)\}$/;
const CHORD_RE = /\[([^\]]+)\]/g;

const SECTION_TYPE_MAP: Record<string, SectionType> = {
  'intro': 'intro',
  'verse': 'verse',
  'pre-chorus': 'pre-chorus',
  'prechorus': 'pre-chorus',
  'chorus': 'chorus',
  'bridge': 'bridge',
  'solo': 'solo',
  'outro': 'outro',
  'interlude': 'interlude',
};

function parseSectionDirective(value: string): { type: SectionType; label: string } {
  const trimmed = value.trim();
  // Try to match "Verse 1", "Chorus", "Bridge 2", etc.
  const parts = trimmed.match(/^(\S+)\s*(.*)$/);
  if (parts) {
    const typeLower = parts[1].toLowerCase();
    const mapped = SECTION_TYPE_MAP[typeLower];
    if (mapped) {
      return { type: mapped, label: trimmed };
    }
  }
  return { type: 'verse', label: trimmed || 'Verse' };
}

export function parseChordProLine(line: string): ParsedLine {
  const segments: ChordLyricSegment[] = [];
  let lastIndex = 0;

  CHORD_RE.lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = CHORD_RE.exec(line)) !== null) {
    // Any lyrics before this chord marker (belongs to previous segment or starts a null-chord segment)
    if (match.index > lastIndex) {
      const textBefore = line.slice(lastIndex, match.index);
      if (segments.length > 0) {
        // Append to previous segment's lyrics
        segments[segments.length - 1].lyrics += textBefore;
      } else {
        // Lyrics before any chord
        segments.push({ chord: null, lyrics: textBefore });
      }
    }

    segments.push({ chord: match[1], lyrics: '' });
    lastIndex = match.index + match[0].length;
  }

  // Remaining text after last chord
  const remaining = line.slice(lastIndex);
  if (segments.length > 0) {
    segments[segments.length - 1].lyrics += remaining;
  } else {
    // No chords at all — plain lyrics line
    segments.push({ chord: null, lyrics: remaining });
  }

  return { segments };
}

export function parseChordProText(text: string): {
  metadata: { title?: string; artist?: string; key?: string; capo?: string; tempo?: string };
  sections: SongSection[];
} {
  const lines = text.split('\n');
  const metadata: Record<string, string> = {};
  const sections: SongSection[] = [];
  let currentSection: SongSection | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    // Check for directive
    const dirMatch = line.match(DIRECTIVE_RE);
    if (dirMatch) {
      const [, key, value] = dirMatch;
      const keyLower = key.toLowerCase();

      if (keyLower === 'section') {
        // Start a new section
        if (currentSection && currentSection.lines.length > 0) {
          sections.push(currentSection);
        }
        const parsed = parseSectionDirective(value);
        currentSection = { type: parsed.type, label: parsed.label, lines: [] };
      } else {
        // Metadata directive (title, artist, key, capo, tempo)
        metadata[keyLower] = value.trim();
      }
      continue;
    }

    // Blank line — could mark implicit section break
    if (line.trim() === '') {
      if (currentSection && currentSection.lines.length > 0) {
        sections.push(currentSection);
        currentSection = null;
      }
      continue;
    }

    // Content line
    if (!currentSection) {
      currentSection = { type: 'verse', label: 'Verse', lines: [] };
    }
    currentSection.lines.push(line);
  }

  // Push final section
  if (currentSection && currentSection.lines.length > 0) {
    sections.push(currentSection);
  }

  return {
    metadata: {
      title: metadata.title,
      artist: metadata.artist,
      key: metadata.key,
      capo: metadata.capo,
      tempo: metadata.tempo,
    },
    sections,
  };
}

export function sectionsToChordPro(song: {
  title: string;
  artist: string;
  key: string;
  capo: number;
  tempo?: number;
  sections: SongSection[];
}): string {
  const lines: string[] = [];

  lines.push(`{title: ${song.title}}`);
  lines.push(`{artist: ${song.artist}}`);
  lines.push(`{key: ${song.key}}`);
  if (song.capo > 0) lines.push(`{capo: ${song.capo}}`);
  if (song.tempo) lines.push(`{tempo: ${song.tempo}}`);
  lines.push('');

  for (const section of song.sections) {
    lines.push(`{section: ${section.label}}`);
    for (const line of section.lines) {
      lines.push(line);
    }
    lines.push('');
  }

  return lines.join('\n').trimEnd();
}

/**
 * Convert a ChordPro line to word-level representation for the visual editor.
 * Supports multiple chords per word (e.g., [Am][G]looking → chords: ["Am", "G"]).
 */
export function chordProLineToWords(line: string): EditorWord[] {
  const parsed = parseChordProLine(line);
  const words: EditorWord[] = [];

  // Collect pending chords from chord-only segments (no lyrics text)
  // that should attach to the next word with text
  let pendingChords: string[] = [];

  for (const seg of parsed.segments) {
    const lyrics = seg.lyrics;
    const wordMatches = [...lyrics.matchAll(/(\S+)(\s*)/g)];

    if (wordMatches.length === 0) {
      // Chord-only segment or pure whitespace
      if (seg.chord) {
        pendingChords.push(seg.chord);
      } else if (lyrics && words.length > 0) {
        words[words.length - 1].trailing += lyrics;
      }
      continue;
    }

    wordMatches.forEach((match, i) => {
      const chords: string[] = [];
      if (i === 0) {
        // First word gets any pending chords plus this segment's chord
        chords.push(...pendingChords);
        if (seg.chord) chords.push(seg.chord);
        pendingChords = [];
      }
      words.push({
        text: match[1],
        chords,
        trailing: match[2],
      });
    });
  }

  // If there are leftover pending chords (chord-only line with no text after)
  if (pendingChords.length > 0) {
    for (const chord of pendingChords) {
      words.push({ text: '', chords: [chord], trailing: ' ' });
    }
  }

  return words;
}

/**
 * Convert word-level representation back to a ChordPro line.
 * Multiple chords per word are serialized as consecutive [Chord] markers.
 */
export function wordsToChordProLine(words: EditorWord[]): string {
  return words
    .map((w) => {
      const chordPart = w.chords.map((c) => `[${c}]`).join('');
      return chordPart + w.text + w.trailing;
    })
    .join('');
}

/**
 * Rebuild full ChordPro text from metadata and sections.
 */
export function rebuildChordProText(
  metadata: { title?: string; artist?: string; key?: string; capo?: string; tempo?: string },
  sections: SongSection[]
): string {
  const lines: string[] = [];
  if (metadata.title) lines.push(`{title: ${metadata.title}}`);
  if (metadata.artist) lines.push(`{artist: ${metadata.artist}}`);
  if (metadata.key) lines.push(`{key: ${metadata.key}}`);
  if (metadata.capo && metadata.capo !== '0') lines.push(`{capo: ${metadata.capo}}`);
  if (metadata.tempo) lines.push(`{tempo: ${metadata.tempo}}`);
  if (lines.length > 0) lines.push('');

  for (const section of sections) {
    lines.push(`{section: ${section.label}}`);
    for (const line of section.lines) {
      lines.push(line);
    }
    lines.push('');
  }

  return lines.join('\n').trimEnd();
}

export function extractUniqueChords(sections: SongSection[]): string[] {
  const chords = new Set<string>();
  for (const section of sections) {
    for (const line of section.lines) {
      CHORD_RE.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = CHORD_RE.exec(line)) !== null) {
        chords.add(match[1]);
      }
    }
  }
  return Array.from(chords);
}
