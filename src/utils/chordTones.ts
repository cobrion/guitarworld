import type { NoteName, ChordQuality, IntervalName, ChordTone, ChordVoicing } from '../types';
import { STANDARD_TUNING, INTERVAL_COLORS } from './constants';
import { noteToIndex, indexToNote, qualitySuffix } from './musicTheory';
import { FLAT_KEYS } from './constants';
import { chordDatabase } from '../data/chords';
import type { Key } from '../types';

interface IntervalDef {
  semitones: number;
  label: IntervalName;
}

/** Chord formulas: maps each quality to its interval components */
export const CHORD_FORMULAS: Record<ChordQuality, IntervalDef[]> = {
  major:       [{ semitones: 0, label: 'R' }, { semitones: 4, label: '3' }, { semitones: 7, label: '5' }],
  minor:       [{ semitones: 0, label: 'R' }, { semitones: 3, label: 'b3' }, { semitones: 7, label: '5' }],
  diminished:  [{ semitones: 0, label: 'R' }, { semitones: 3, label: 'b3' }, { semitones: 6, label: 'b5' }],
  augmented:   [{ semitones: 0, label: 'R' }, { semitones: 4, label: '3' }, { semitones: 8, label: '#5' }],
  dominant7:   [{ semitones: 0, label: 'R' }, { semitones: 4, label: '3' }, { semitones: 7, label: '5' }, { semitones: 10, label: 'b7' }],
  major7:      [{ semitones: 0, label: 'R' }, { semitones: 4, label: '3' }, { semitones: 7, label: '5' }, { semitones: 11, label: '7' }],
  minor7:      [{ semitones: 0, label: 'R' }, { semitones: 3, label: 'b3' }, { semitones: 7, label: '5' }, { semitones: 10, label: 'b7' }],
  minor7b5:    [{ semitones: 0, label: 'R' }, { semitones: 3, label: 'b3' }, { semitones: 6, label: 'b5' }, { semitones: 10, label: 'b7' }],
  diminished7: [{ semitones: 0, label: 'R' }, { semitones: 3, label: 'b3' }, { semitones: 6, label: 'b5' }, { semitones: 9, label: 'bb7' }],
  sus2:        [{ semitones: 0, label: 'R' }, { semitones: 2, label: '2' }, { semitones: 7, label: '5' }],
  sus4:        [{ semitones: 0, label: 'R' }, { semitones: 5, label: '4' }, { semitones: 7, label: '5' }],
  add9:        [{ semitones: 0, label: 'R' }, { semitones: 4, label: '3' }, { semitones: 7, label: '5' }, { semitones: 14, label: '9' }],
  dominant9:   [{ semitones: 0, label: 'R' }, { semitones: 4, label: '3' }, { semitones: 7, label: '5' }, { semitones: 10, label: 'b7' }, { semitones: 14, label: '9' }],
  power:       [{ semitones: 0, label: 'R' }, { semitones: 7, label: '5' }],
  minor9:      [{ semitones: 0, label: 'R' }, { semitones: 3, label: 'b3' }, { semitones: 7, label: '5' }, { semitones: 10, label: 'b7' }, { semitones: 14, label: '9' }],
  major9:      [{ semitones: 0, label: 'R' }, { semitones: 4, label: '3' }, { semitones: 7, label: '5' }, { semitones: 11, label: '7' }, { semitones: 14, label: '9' }],
  dominant11:  [{ semitones: 0, label: 'R' }, { semitones: 4, label: '3' }, { semitones: 7, label: '5' }, { semitones: 10, label: 'b7' }, { semitones: 14, label: '9' }, { semitones: 17, label: '11' }],
  minor11:     [{ semitones: 0, label: 'R' }, { semitones: 3, label: 'b3' }, { semitones: 7, label: '5' }, { semitones: 10, label: 'b7' }, { semitones: 14, label: '9' }, { semitones: 17, label: '11' }],
  dominant13:  [{ semitones: 0, label: 'R' }, { semitones: 4, label: '3' }, { semitones: 7, label: '5' }, { semitones: 10, label: 'b7' }, { semitones: 14, label: '9' }, { semitones: 17, label: '11' }, { semitones: 21, label: '13' }],
  dom7sharp9:  [{ semitones: 0, label: 'R' }, { semitones: 4, label: '3' }, { semitones: 7, label: '5' }, { semitones: 10, label: 'b7' }, { semitones: 15, label: '#9' }],
  dom7flat9:   [{ semitones: 0, label: 'R' }, { semitones: 4, label: '3' }, { semitones: 7, label: '5' }, { semitones: 10, label: 'b7' }, { semitones: 13, label: 'b9' }],
  aug7:        [{ semitones: 0, label: 'R' }, { semitones: 4, label: '3' }, { semitones: 8, label: '#5' }, { semitones: 10, label: 'b7' }],
  major6:      [{ semitones: 0, label: 'R' }, { semitones: 4, label: '3' }, { semitones: 7, label: '5' }, { semitones: 9, label: '6' }],
  minor6:      [{ semitones: 0, label: 'R' }, { semitones: 3, label: 'b3' }, { semitones: 7, label: '5' }, { semitones: 9, label: '6' }],
};

/**
 * Find all occurrences of chord tones across the entire fretboard.
 */
export function getAllChordTones(
  root: NoteName,
  quality: ChordQuality,
  totalFrets: number,
): ChordTone[] {
  const formula = CHORD_FORMULAS[quality];
  if (!formula) return [];

  const rootIndex = noteToIndex(root);
  const preferFlats = FLAT_KEYS.has(root as Key);

  // Build a map of chromatic index → interval label for fast lookup
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

/**
 * Map a specific voicing's fretted notes to their chord intervals.
 */
export function getVoicingChordTones(
  root: NoteName,
  quality: ChordQuality,
  voicing: ChordVoicing,
): ChordTone[] {
  const formula = CHORD_FORMULAS[quality];
  if (!formula) return [];

  const rootIndex = noteToIndex(root);
  const preferFlats = FLAT_KEYS.has(root as Key);

  const toneMap = new Map<number, IntervalName>();
  for (const interval of formula) {
    const chromaticIndex = (rootIndex + interval.semitones) % 12;
    toneMap.set(chromaticIndex, interval.label);
  }

  const tones: ChordTone[] = [];

  for (let string = 0; string < 6; string++) {
    const stringFret = voicing.strings[string];
    if (stringFret === null) continue;

    // baseFret is the starting fret of the diagram; strings store relative positions
    // fret 0 = open string, otherwise actual fret = baseFret - 1 + stringFret
    const actualFret = stringFret === 0 ? 0 : voicing.baseFret - 1 + stringFret;
    const noteIndex = (STANDARD_TUNING[string] + actualFret) % 12;
    const interval = toneMap.get(noteIndex);

    if (interval !== undefined) {
      tones.push({
        string,
        fret: actualFret,
        noteName: indexToNote(noteIndex, preferFlats),
        interval,
        color: INTERVAL_COLORS[interval],
      });
    }
  }

  return tones;
}

/** Display-friendly chord quality names */
const QUALITY_DISPLAY: Record<ChordQuality, string> = {
  major: 'Major',
  minor: 'Minor',
  diminished: 'Diminished',
  augmented: 'Augmented',
  dominant7: 'Dominant 7th',
  major7: 'Major 7th',
  minor7: 'Minor 7th',
  minor7b5: 'Half-Diminished (m7b5)',
  diminished7: 'Diminished 7th',
  sus2: 'Suspended 2nd',
  sus4: 'Suspended 4th',
  add9: 'Add 9',
  dominant9: 'Dominant 9th',
  power: 'Power (5th)',
  minor9: 'Minor 9th',
  major9: 'Major 9th',
  dominant11: 'Dominant 11th',
  minor11: 'Minor 11th',
  dominant13: 'Dominant 13th',
  dom7sharp9: '7#9 (Hendrix)',
  dom7flat9: '7b9',
  aug7: 'Augmented 7th',
  major6: 'Major 6th',
  minor6: 'Minor 6th',
};

export function getQualityDisplayName(quality: ChordQuality): string {
  return QUALITY_DISPLAY[quality] ?? quality;
}

/** Returns the formula string, e.g. "1 - 3 - 5" or "1 - b3 - 5 - b7" */
export function getChordFormulaDisplay(quality: ChordQuality): string {
  const formula = CHORD_FORMULAS[quality];
  if (!formula) return '';
  return formula.map((i) => (i.label === 'R' ? '1' : i.label)).join(' - ');
}

/** Returns the actual note names for a chord, e.g. "C - E - G" */
export function getChordNotesDisplay(root: NoteName, quality: ChordQuality): string {
  const formula = CHORD_FORMULAS[quality];
  if (!formula) return '';

  const rootIndex = noteToIndex(root);
  const preferFlats = FLAT_KEYS.has(root as Key);

  return formula
    .map((i) => {
      const noteIndex = (rootIndex + i.semitones) % 12;
      return indexToNote(noteIndex, preferFlats);
    })
    .join(' - ');
}

/**
 * Find all moveable barre positions for a chord across the entire fretboard.
 *
 * A guitar virtuoso knows every barre shape is transposable. This function:
 * 1. Scans the database for all barre voicings of the same quality (any root)
 * 2. Identifies moveable shapes (no open strings)
 * 3. Transposes each shape to produce the target root at every valid position
 * 4. Includes octave repetitions up the neck
 */
export function getMovableBarrePositions(
  targetRoot: NoteName,
  quality: ChordQuality,
  totalFrets: number,
): { fromString: number; toString: number; fret: number }[] {
  const suffix = qualitySuffix(quality);
  const targetRootIndex = noteToIndex(targetRoot);

  // All root names including enharmonic variants
  const ALL_ROOTS: NoteName[] = [
    'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F',
    'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
  ];

  const seen = new Set<string>();
  const barres: { fromString: number; toString: number; fret: number }[] = [];

  for (const sourceRoot of ALL_ROOTS) {
    const chordName = sourceRoot + suffix;
    const data = chordDatabase[chordName];
    if (!data) continue;

    const sourceRootIndex = noteToIndex(sourceRoot);
    const distance = ((targetRootIndex - sourceRootIndex) % 12 + 12) % 12;

    for (const voicing of data.voicings) {
      if (voicing.barres.length === 0) continue;

      // Moveable = no open strings among played strings
      const hasOpenString = voicing.strings.some((s) => s === 0);
      if (hasOpenString) continue;

      const playedFrets = voicing.strings.filter((s): s is number => s !== null);
      const maxRelativeFret = Math.max(...playedFrets);

      // Try base position + octave shifts
      for (const offset of [0, 12, -12]) {
        const newBaseFret = voicing.baseFret + distance + offset;
        if (newBaseFret < 1) continue;
        if (newBaseFret - 1 + maxRelativeFret > totalFrets) continue;

        for (const barre of voicing.barres) {
          const absoluteFret = newBaseFret - 1 + barre.fret;
          if (absoluteFret < 1 || absoluteFret > totalFrets) continue;

          const key = `${barre.fromString}-${barre.toString}-${absoluteFret}`;
          if (!seen.has(key)) {
            seen.add(key);
            barres.push({
              fromString: barre.fromString,
              toString: barre.toString,
              fret: absoluteFret,
            });
          }
        }
      }
    }
  }

  return barres;
}

/** Chord quality options grouped for the selector dropdown */
export const QUALITY_GROUPS: { label: string; qualities: ChordQuality[] }[] = [
  {
    label: 'Triads',
    qualities: ['major', 'minor', 'diminished', 'augmented'],
  },
  {
    label: '7th Chords',
    qualities: ['dominant7', 'major7', 'minor7', 'minor7b5', 'diminished7'],
  },
  {
    label: 'Suspended',
    qualities: ['sus2', 'sus4'],
  },
  {
    label: 'Extended',
    qualities: ['add9', 'dominant9', 'minor9', 'major9', 'dominant11', 'minor11', 'dominant13'],
  },
  {
    label: 'Altered',
    qualities: ['dom7sharp9', 'dom7flat9', 'aug7'],
  },
  {
    label: '6th Chords',
    qualities: ['major6', 'minor6'],
  },
  {
    label: 'Power',
    qualities: ['power'],
  },
];
