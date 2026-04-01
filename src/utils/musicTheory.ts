import type { Key, NoteName, ScaleType, ChordData, ChordQuality } from '../types';
import {
  CHROMATIC_SCALE,
  MAJOR_SCALE_INTERVALS,
  MINOR_SCALE_INTERVALS,
  MAJOR_CHORD_QUALITIES,
  MINOR_CHORD_QUALITIES,
  ROMAN_NUMERALS_MAJOR,
  ROMAN_NUMERALS_MINOR,
  ENHARMONIC_MAP,
  FLAT_KEYS,
} from './constants';
import { chordDatabase } from '../data/chords';

/**
 * Convert a note name to its chromatic index (C = 0, C#/Db = 1, ... B = 11).
 */
export function noteToIndex(note: NoteName): number {
  const map: Record<NoteName, number> = {
    'C': 0, 'C#': 1, 'Db': 1,
    'D': 2, 'D#': 3, 'Eb': 3,
    'E': 4,
    'F': 5, 'F#': 6, 'Gb': 6,
    'G': 7, 'G#': 8, 'Ab': 8,
    'A': 9, 'A#': 10, 'Bb': 10,
    'B': 11,
  };
  return map[note];
}

/**
 * Convert a chromatic index (0-11) to a note name.
 */
export function indexToNote(index: number, preferFlats: boolean = false): NoteName {
  const normalized = ((index % 12) + 12) % 12;
  if (preferFlats) {
    const flatScale: NoteName[] = [
      'C', 'Db', 'D', 'Eb', 'E', 'F',
      'Gb', 'G', 'Ab', 'A', 'Bb', 'B',
    ];
    return flatScale[normalized];
  }
  return CHROMATIC_SCALE[normalized];
}

export function getEnharmonicName(note: NoteName): NoteName | null {
  return ENHARMONIC_MAP[note] ?? null;
}

export function getDisplayName(key: Key): string {
  const enharmonic = getEnharmonicName(key as NoteName);
  if (enharmonic) {
    return `${key} / ${enharmonic}`;
  }
  return key;
}

export function getScaleNotes(key: Key, scaleType: ScaleType): NoteName[] {
  const rootIndex = noteToIndex(key as NoteName);
  const intervals = scaleType === 'major'
    ? MAJOR_SCALE_INTERVALS
    : MINOR_SCALE_INTERVALS;
  const preferFlats = FLAT_KEYS.has(key);

  return intervals.map((interval) => {
    const noteIndex = (rootIndex + interval) % 12;
    return indexToNote(noteIndex, preferFlats);
  });
}

export function qualitySuffix(quality: ChordQuality): string {
  switch (quality) {
    case 'major': return '';
    case 'minor': return 'm';
    case 'diminished': return 'dim';
    case 'augmented': return 'aug';
    case 'dominant7': return '7';
    case 'major7': return 'maj7';
    case 'minor7': return 'm7';
    case 'minor7b5': return 'm7b5';
    case 'diminished7': return 'dim7';
    case 'sus2': return 'sus2';
    case 'sus4': return 'sus4';
    case 'add9': return 'add9';
    case 'minoradd9': return 'madd9';
    case 'dominant9': return '9';
    case 'power': return '5';
    case 'minor9': return 'm9';
    case 'major9': return 'maj9';
    case 'dominant11': return '11';
    case 'minor11': return 'm11';
    case 'dominant13': return '13';
    case 'dom7sharp9': return '7#9';
    case 'dom7flat9': return '7b9';
    case 'aug7': return 'aug7';
    case 'major6': return '6';
    case 'minor6': return 'm6';
    default: return '';
  }
}

/**
 * Look up chord voicing data from the database.
 * Tries the exact name first, then its enharmonic equivalent.
 */
export function lookupChord(chordName: string, root: NoteName) {
  if (chordDatabase[chordName]) {
    return chordDatabase[chordName];
  }
  const enharmonicRoot = getEnharmonicName(root);
  if (enharmonicRoot) {
    const suffix = chordName.slice(root.length);
    const altName = enharmonicRoot + suffix;
    if (chordDatabase[altName]) {
      return chordDatabase[altName];
    }
  }
  return null;
}

/**
 * Diatonic 7th chord qualities for major keys:
 * I=maj7, ii=m7, iii=m7, IV=maj7, V=7, vi=m7, vii=m7b5
 */
const MAJOR_7TH_QUALITIES: ChordQuality[] = [
  'major7', 'minor7', 'minor7', 'major7', 'dominant7', 'minor7', 'minor7b5',
];
const MAJOR_7TH_ROMAN = ['Imaj7', 'ii7', 'iii7', 'IVmaj7', 'V7', 'vi7', 'viiø7'];

const MINOR_7TH_QUALITIES: ChordQuality[] = [
  'minor7', 'minor7b5', 'major7', 'minor7', 'minor7', 'major7', 'dominant7',
];
const MINOR_7TH_ROMAN = ['i7', 'iiø7', 'IIImaj7', 'iv7', 'v7', 'VImaj7', 'VII7'];

/**
 * Suffixes to probe in the database for each scale degree root.
 * These are non-diatonic extras (sus, power, add9, aug, dim7, dom9)
 * that we show if the database has a voicing for that root.
 */
const EXTRA_SUFFIXES: { suffix: string; quality: ChordQuality; romanTag: string }[] = [
  { suffix: 'sus2', quality: 'sus2', romanTag: 'sus2' },
  { suffix: 'sus4', quality: 'sus4', romanTag: 'sus4' },
  { suffix: '5', quality: 'power', romanTag: '5' },
  { suffix: 'add9', quality: 'add9', romanTag: 'add9' },
  { suffix: 'aug', quality: 'augmented', romanTag: 'aug' },
  { suffix: 'dim7', quality: 'diminished7', romanTag: 'dim7' },
  { suffix: '9', quality: 'dominant9', romanTag: '9' },
  { suffix: 'madd9', quality: 'minoradd9', romanTag: 'madd9' },
];

/**
 * Get all chords for a given key and scale type.
 * Returns diatonic triads, diatonic 7ths, and any extras found in the database.
 */
export function getChordsForKey(key: Key, scaleType: ScaleType): ChordData[] {
  const scaleNotes = getScaleNotes(key, scaleType);
  const triadQualities = scaleType === 'major' ? MAJOR_CHORD_QUALITIES : MINOR_CHORD_QUALITIES;
  const triadRomans = scaleType === 'major' ? ROMAN_NUMERALS_MAJOR : ROMAN_NUMERALS_MINOR;
  const seventhQualities = scaleType === 'major' ? MAJOR_7TH_QUALITIES : MINOR_7TH_QUALITIES;
  const seventhRomans = scaleType === 'major' ? MAJOR_7TH_ROMAN : MINOR_7TH_ROMAN;

  const results: ChordData[] = [];

  scaleNotes.forEach((root, degree) => {
    // 1. Diatonic triad
    const triadQuality = triadQualities[degree];
    const triadSuffix = qualitySuffix(triadQuality);
    const triadName = root + triadSuffix;
    const triadDb = lookupChord(triadName, root);
    results.push({
      name: triadName,
      root,
      quality: triadQuality,
      romanNumeral: triadRomans[degree],
      scaleDegree: degree + 1,
      difficulty: triadDb?.difficulty ?? 'intermediate',
      chordType: triadDb?.chordType ?? 'triad',
      voicings: triadDb?.voicings ?? [],
    });

    // 2. Diatonic 7th
    const seventhQuality = seventhQualities[degree];
    const seventhSuffix = qualitySuffix(seventhQuality);
    const seventhName = root + seventhSuffix;
    const seventhDb = lookupChord(seventhName, root);
    if (seventhDb) {
      results.push({
        name: seventhName,
        root,
        quality: seventhQuality,
        romanNumeral: seventhRomans[degree],
        scaleDegree: degree + 1,
        difficulty: seventhDb.difficulty,
        chordType: seventhDb.chordType,
        voicings: seventhDb.voicings,
      });
    }

    // 3. Extras: sus, power, add9, aug, dim7, dom9 — only if in the database
    for (const extra of EXTRA_SUFFIXES) {
      const extraName = root + extra.suffix;
      const extraDb = lookupChord(extraName, root);
      if (extraDb) {
        results.push({
          name: extraName,
          root,
          quality: extra.quality,
          romanNumeral: extra.romanTag,
          scaleDegree: degree + 1,
          difficulty: extraDb.difficulty,
          chordType: extraDb.chordType,
          voicings: extraDb.voicings,
        });
      }
    }
  });

  return results;
}
