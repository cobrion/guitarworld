import type { Key, ScaleType, AnalyzedChord, HarmonicFunction } from '../types';
import { getScaleNotes, noteToIndex } from './musicTheory';
import { parseChordName } from './transpose';

export const HARMONIC_FUNCTION_MAP: Record<number, HarmonicFunction> = {
  1: 'tonic',
  2: 'supertonic',
  3: 'mediant',
  4: 'subdominant',
  5: 'dominant',
  6: 'submediant',
  7: 'leading',
};

const MAJOR_ROMAN = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii\u00B0'];
const MINOR_ROMAN = ['i', 'ii\u00B0', 'III', 'iv', 'v', 'VI', 'VII'];

export function analyzeChordInKey(
  chordName: string,
  key: Key,
  scaleType: ScaleType = 'major'
): AnalyzedChord {
  const { root, suffix } = parseChordName(chordName);
  const scaleNotes = getScaleNotes(key, scaleType);
  const chordIndex = noteToIndex(root);

  // Find which scale degree this root matches (with enharmonic equivalence)
  let degree: number | null = null;
  for (let i = 0; i < scaleNotes.length; i++) {
    const scaleNoteIndex = noteToIndex(scaleNotes[i]);
    if (chordIndex === scaleNoteIndex) {
      degree = i + 1;
      break;
    }
  }

  if (degree === null) {
    return {
      name: chordName,
      root,
      suffix,
      scaleDegree: null,
      romanNumeral: null,
      function: 'nondiatonic',
    };
  }

  const romans = scaleType === 'major' ? MAJOR_ROMAN : MINOR_ROMAN;
  let romanNumeral = romans[degree - 1];
  if (suffix) {
    // Append suffix to roman numeral for display
    romanNumeral = romanNumeral + suffix;
  }

  return {
    name: chordName,
    root,
    suffix,
    scaleDegree: degree,
    romanNumeral,
    function: HARMONIC_FUNCTION_MAP[degree],
  };
}

const HARMONIC_FUNCTION_COLORS: Record<HarmonicFunction, string> = {
  tonic: 'var(--hf-tonic)',
  supertonic: 'var(--hf-supertonic)',
  mediant: 'var(--hf-mediant)',
  subdominant: 'var(--hf-subdominant)',
  dominant: 'var(--hf-dominant)',
  submediant: 'var(--hf-submediant)',
  leading: 'var(--hf-leading)',
  nondiatonic: 'var(--hf-nondiatonic)',
};

const HARMONIC_FUNCTION_BG_COLORS: Record<HarmonicFunction, string> = {
  tonic: 'var(--hf-tonic-bg)',
  supertonic: 'var(--hf-supertonic-bg)',
  mediant: 'var(--hf-mediant-bg)',
  subdominant: 'var(--hf-subdominant-bg)',
  dominant: 'var(--hf-dominant-bg)',
  submediant: 'var(--hf-submediant-bg)',
  leading: 'var(--hf-leading-bg)',
  nondiatonic: 'var(--hf-nondiatonic-bg)',
};

export function getHarmonicFunctionColor(fn: HarmonicFunction): string {
  return HARMONIC_FUNCTION_COLORS[fn];
}

export function getHarmonicFunctionBgColor(fn: HarmonicFunction): string {
  return HARMONIC_FUNCTION_BG_COLORS[fn];
}

/**
 * Convert a chord name to Nashville Number notation in the given key.
 */
export function chordToNashville(chordName: string, key: Key): string {
  const { root, suffix } = parseChordName(chordName);
  const scaleNotes = getScaleNotes(key, 'major');
  const chordIndex = noteToIndex(root);

  for (let i = 0; i < scaleNotes.length; i++) {
    if (noteToIndex(scaleNotes[i]) === chordIndex) {
      return `${i + 1}${suffix}`;
    }
  }

  // Non-diatonic: find closest and add accidental
  // Check if it's a flat of a scale degree
  for (let i = 0; i < scaleNotes.length; i++) {
    const scaleIndex = noteToIndex(scaleNotes[i]);
    if (chordIndex === ((scaleIndex - 1 + 12) % 12)) {
      return `b${i + 1}${suffix}`;
    }
    if (chordIndex === ((scaleIndex + 1) % 12)) {
      return `#${i + 1}${suffix}`;
    }
  }

  return chordName; // Fallback
}
