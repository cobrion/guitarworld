import type { Key, NoteName } from '../types';
import { ALL_KEYS, FLAT_KEYS } from './constants';
import { noteToIndex, indexToNote } from './musicTheory';

/**
 * Parse a chord name into root note and suffix.
 * "F#m7b5" → { root: "F#", suffix: "m7b5" }
 * "Bb"     → { root: "Bb", suffix: "" }
 */
export function parseChordName(name: string): { root: NoteName; suffix: string } {
  // Match: letter + optional # or b
  const match = name.match(/^([A-G][#b]?)(.*)/);
  if (!match) {
    return { root: 'C' as NoteName, suffix: name };
  }
  return { root: match[1] as NoteName, suffix: match[2] };
}

/**
 * Transpose a key by semitones, returning the conventional Key spelling.
 */
export function getTransposedKey(originalKey: Key, semitones: number): Key {
  const idx = ALL_KEYS.indexOf(originalKey);
  const newIdx = ((idx + semitones) % 12 + 12) % 12;
  return ALL_KEYS[newIdx];
}

/**
 * Transpose a chord name by N semitones.
 * Handles slash chords (C/E → D/F#).
 */
export function transposeChord(chordName: string, semitones: number, targetKey?: Key): string {
  if (semitones === 0) return chordName;

  // Handle slash chords
  const slashIndex = chordName.indexOf('/');
  if (slashIndex > 0) {
    const mainPart = chordName.slice(0, slashIndex);
    const bassPart = chordName.slice(slashIndex + 1);
    return transposeChord(mainPart, semitones, targetKey) + '/' +
           transposeChord(bassPart, semitones, targetKey);
  }

  const { root, suffix } = parseChordName(chordName);
  const rootIndex = noteToIndex(root);
  if (rootIndex === undefined) return chordName;

  const newIndex = ((rootIndex + semitones) % 12 + 12) % 12;
  const preferFlats = targetKey ? FLAT_KEYS.has(targetKey) : FLAT_KEYS.has(root as Key);
  const newRoot = indexToNote(newIndex, preferFlats);

  return newRoot + suffix;
}

/**
 * Given a key and capo position, return the chord shapes key to play.
 * Key of Bb with capo 3 → play G shapes
 */
export function getCapoEquivalent(originalKey: Key, capoFret: number): Key {
  if (capoFret === 0) return originalKey;
  return getTransposedKey(originalKey, -capoFret);
}
