import type { NoteName, Key, ChordQuality, IntervalName } from '../types';

/** The 12-note chromatic scale starting from C */
export const CHROMATIC_SCALE: NoteName[] = [
  'C', 'C#', 'D', 'D#', 'E', 'F',
  'F#', 'G', 'G#', 'A', 'A#', 'B',
];

/** The 12 practical key signatures used in the app */
export const ALL_KEYS: Key[] = [
  'C', 'C#', 'D', 'Eb', 'E', 'F',
  'F#', 'G', 'Ab', 'A', 'Bb', 'B',
];

/** Semitone intervals for the major scale (W-W-H-W-W-W-H) */
export const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11] as const;

/** Semitone intervals for the natural minor scale (W-H-W-W-H-W-W) */
export const MINOR_SCALE_INTERVALS = [0, 2, 3, 5, 7, 8, 10] as const;

/** Chord qualities for each degree of the major scale (I-vii) */
export const MAJOR_CHORD_QUALITIES: ChordQuality[] = [
  'major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished',
];

/** Chord qualities for each degree of the natural minor scale (i-VII) */
export const MINOR_CHORD_QUALITIES: ChordQuality[] = [
  'minor', 'diminished', 'major', 'minor', 'minor', 'major', 'major',
];

/** Roman numerals for major scale degrees */
export const ROMAN_NUMERALS_MAJOR = [
  'I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii\u00B0',
] as const;

/** Roman numerals for minor scale degrees */
export const ROMAN_NUMERALS_MINOR = [
  'i', 'ii\u00B0', 'III', 'iv', 'v', 'VI', 'VII',
] as const;

/**
 * Map between enharmonic equivalents.
 * Sharp <-> Flat pairs for all notes that have them.
 */
export const ENHARMONIC_MAP: Record<string, NoteName> = {
  'C#': 'Db',
  'Db': 'C#',
  'D#': 'Eb',
  'Eb': 'D#',
  'F#': 'Gb',
  'Gb': 'F#',
  'G#': 'Ab',
  'Ab': 'G#',
  'A#': 'Bb',
  'Bb': 'A#',
};

/** Keys that are conventionally spelled with sharps */
export const SHARP_KEYS: Set<Key> = new Set<Key>([
  'C', 'C#', 'D', 'E', 'F#', 'G', 'A', 'B',
]);

/** Keys that are conventionally spelled with flats */
export const FLAT_KEYS: Set<Key> = new Set<Key>([
  'F', 'Bb', 'Eb', 'Ab',
]);

/** Standard tuning as chromatic indices: E=4, A=9, D=2, G=7, B=11, E=4 */
export const STANDARD_TUNING = [4, 9, 2, 7, 11, 4] as const;

/** Standard tuning note names */
export const STANDARD_TUNING_NAMES: NoteName[] = ['E', 'A', 'D', 'G', 'B', 'E'];

/** Total frets displayed on the guitar neck */
export const TOTAL_FRETS = 15;

/** Frets that have position marker dots */
export const FRET_MARKERS = [3, 5, 7, 9, 12, 15] as const;

/** Frets that have double marker dots */
export const DOUBLE_FRET_MARKERS = [12] as const;

/** Color mapping for each interval type */
/**
 * Generate a UUID that works in both secure and non-secure contexts.
 * crypto.randomUUID() requires a secure context (HTTPS/localhost).
 * Falls back to crypto.getRandomValues() which works everywhere.
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback: construct a v4 UUID from random bytes
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 1
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export const INTERVAL_COLORS: Record<IntervalName, string> = {
  'R':   'var(--interval-root)',
  '2':   'var(--interval-ninth)',
  'b3':  'var(--interval-third)',
  '3':   'var(--interval-third)',
  '4':   'var(--interval-fourth)',
  'b5':  'var(--interval-fifth)',
  '5':   'var(--interval-fifth)',
  '#5':  'var(--interval-fifth)',
  'b6':  'var(--interval-sixth)',
  '6':   'var(--interval-sixth)',
  'bb7': 'var(--interval-seventh)',
  'b7':  'var(--interval-seventh)',
  '7':   'var(--interval-seventh)',
  'b9':  'var(--interval-ninth)',
  '9':   'var(--interval-ninth)',
  '#9':  'var(--interval-ninth)',
  '11':  'var(--interval-eleventh)',
  '13':  'var(--interval-thirteenth)',
};
