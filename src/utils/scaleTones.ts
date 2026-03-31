import type { NoteName, ChordTone, IntervalName, Key } from '../types';
import { STANDARD_TUNING, INTERVAL_COLORS, FLAT_KEYS } from './constants';
import { noteToIndex, indexToNote } from './musicTheory';

export type ScaleKind =
  | 'major'
  | 'natural-minor'
  | 'major-pentatonic'
  | 'minor-pentatonic'
  | 'mixolydian';

interface ScaleIntervalDef {
  semitones: number;
  label: IntervalName;
}

export const SCALE_FORMULAS: Record<ScaleKind, ScaleIntervalDef[]> = {
  'major': [
    { semitones: 0, label: 'R' },
    { semitones: 2, label: '2' },
    { semitones: 4, label: '3' },
    { semitones: 5, label: '4' },
    { semitones: 7, label: '5' },
    { semitones: 9, label: '6' },
    { semitones: 11, label: '7' },
  ],
  'natural-minor': [
    { semitones: 0, label: 'R' },
    { semitones: 2, label: '2' },
    { semitones: 3, label: 'b3' },
    { semitones: 5, label: '4' },
    { semitones: 7, label: '5' },
    { semitones: 8, label: 'b6' },
    { semitones: 10, label: 'b7' },
  ],
  'major-pentatonic': [
    { semitones: 0, label: 'R' },
    { semitones: 2, label: '2' },
    { semitones: 4, label: '3' },
    { semitones: 7, label: '5' },
    { semitones: 9, label: '6' },
  ],
  'minor-pentatonic': [
    { semitones: 0, label: 'R' },
    { semitones: 3, label: 'b3' },
    { semitones: 5, label: '4' },
    { semitones: 7, label: '5' },
    { semitones: 10, label: 'b7' },
  ],
  'mixolydian': [
    { semitones: 0, label: 'R' },
    { semitones: 2, label: '2' },
    { semitones: 4, label: '3' },
    { semitones: 5, label: '4' },
    { semitones: 7, label: '5' },
    { semitones: 9, label: '6' },
    { semitones: 10, label: 'b7' },
  ],
};

export const SCALE_DISPLAY_NAMES: Record<ScaleKind, string> = {
  'major': 'Major (Ionian)',
  'natural-minor': 'Natural Minor (Aeolian)',
  'major-pentatonic': 'Major Pentatonic',
  'minor-pentatonic': 'Minor Pentatonic',
  'mixolydian': 'Mixolydian',
};

export const ALL_SCALE_KINDS: ScaleKind[] = [
  'major',
  'natural-minor',
  'major-pentatonic',
  'minor-pentatonic',
  'mixolydian',
];

/**
 * Compute all instances of scale tones across the entire fretboard.
 * Returns ChordTone[] for direct reuse with GuitarNeck / NeckNoteDots.
 */
export function getAllScaleTones(
  root: NoteName,
  scaleKind: ScaleKind,
  totalFrets: number,
): ChordTone[] {
  const formula = SCALE_FORMULAS[scaleKind];
  const rootIndex = noteToIndex(root);
  const preferFlats = FLAT_KEYS.has(root as Key);

  const toneMap = new Map<number, IntervalName>();
  for (const interval of formula) {
    const chromaticIndex = (rootIndex + interval.semitones) % 12;
    toneMap.set(chromaticIndex, interval.label);
  }

  const tones: ChordTone[] = [];
  for (let string = 0; string < 6; string++) {
    for (let fret = 0; fret <= totalFrets; fret++) {
      const noteIndex = (STANDARD_TUNING[string] + fret) % 12;
      const interval = toneMap.get(noteIndex);
      if (interval !== undefined) {
        tones.push({
          string,
          fret,
          noteName: indexToNote(noteIndex, preferFlats),
          interval,
          color: INTERVAL_COLORS[interval],
        });
      }
    }
  }

  return tones;
}

/** Returns the formula string, e.g. "1 - 2 - 3 - 4 - 5 - 6 - 7" */
export function getScaleFormulaDisplay(scaleKind: ScaleKind): string {
  const formula = SCALE_FORMULAS[scaleKind];
  return formula.map((i) => (i.label === 'R' ? '1' : i.label)).join(' - ');
}

/** Returns the actual note names for a scale, e.g. "C - D - E - F - G - A - B" */
export function getScaleNotesDisplay(root: NoteName, scaleKind: ScaleKind): string {
  const formula = SCALE_FORMULAS[scaleKind];
  const rootIndex = noteToIndex(root);
  const preferFlats = FLAT_KEYS.has(root as Key);
  return formula
    .map((i) => indexToNote((rootIndex + i.semitones) % 12, preferFlats))
    .join(' - ');
}
