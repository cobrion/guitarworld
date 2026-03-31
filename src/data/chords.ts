import type { ChordVoicing, Difficulty, ChordTypeFilter } from '../types';
import { seventhChords } from './chords-seventh';
import { susPowerChords } from './chords-sus-power';
import { extendedChords } from './chords-extended';

export interface ChordVoicingData {
  voicings: ChordVoicing[];
  difficulty: Difficulty;
  chordType: ChordTypeFilter;
}

/**
 * Comprehensive chord voicing database.
 *
 * String arrays: [lowE, A, D, G, B, highE]
 *   - null = muted/not played
 *   - 0 = open string
 *
 * Finger arrays: [lowE, A, D, G, B, highE]
 *   - null = not played
 *   - 0 = open string (no finger)
 *   - 1-4 = index, middle, ring, pinky
 *
 * baseFret: 1 for open/first position.
 *   When baseFret > 1, fret numbers are relative to baseFret
 *   (so fret value 1 = the baseFret position on the neck).
 *
 * Barres: fromString/toString use 0-indexed (0 = lowE, 5 = highE).
 */
export const chordDatabase: Record<string, ChordVoicingData> = {

  // ─────────────────────────────────────────────
  // MAJOR CHORDS - Open voicings
  // ─────────────────────────────────────────────

  'C': {
    voicings: [{
      strings: [null, 3, 2, 0, 1, 0],
      fingers: [null, 3, 2, 0, 1, 0],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'beginner',
    chordType: 'triad',
  },

  'D': {
    voicings: [{
      strings: [null, null, 0, 2, 3, 2],
      fingers: [null, null, 0, 1, 3, 2],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'beginner',
    chordType: 'triad',
  },

  'E': {
    voicings: [{
      strings: [0, 2, 2, 1, 0, 0],
      fingers: [0, 2, 3, 1, 0, 0],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'beginner',
    chordType: 'triad',
  },

  'G': {
    voicings: [{
      strings: [3, 2, 0, 0, 0, 3],
      fingers: [2, 1, 0, 0, 0, 3],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'beginner',
    chordType: 'triad',
  },

  'A': {
    voicings: [{
      strings: [null, 0, 2, 2, 2, 0],
      fingers: [null, 0, 1, 2, 3, 0],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'beginner',
    chordType: 'triad',
  },

  // ─────────────────────────────────────────────
  // MAJOR CHORDS - Barre voicings
  // ─────────────────────────────────────────────

  'F': {
    voicings: [{
      strings: [1, 3, 3, 2, 1, 1],
      fingers: [1, 3, 4, 2, 1, 1],
      barres: [{ fromString: 0, toString: 5, fret: 1 }],
      baseFret: 1,
    }],
    difficulty: 'intermediate',
    chordType: 'triad',
  },

  'B': {
    voicings: [{
      strings: [null, 1, 3, 3, 3, 1],
      fingers: [null, 1, 2, 3, 4, 1],
      barres: [{ fromString: 1, toString: 5, fret: 1 }],
      baseFret: 2,
    }],
    difficulty: 'intermediate',
    chordType: 'triad',
  },

  'Bb': {
    voicings: [{
      strings: [null, 1, 3, 3, 3, 1],
      fingers: [null, 1, 2, 3, 4, 1],
      barres: [{ fromString: 1, toString: 5, fret: 1 }],
      baseFret: 1,
    }],
    difficulty: 'intermediate',
    chordType: 'triad',
  },

  'Eb': {
    voicings: [{
      strings: [null, 1, 3, 3, 3, 1],
      fingers: [null, 1, 2, 3, 4, 1],
      barres: [{ fromString: 1, toString: 5, fret: 1 }],
      baseFret: 6,
    }],
    difficulty: 'intermediate',
    chordType: 'triad',
  },

  'Ab': {
    voicings: [{
      strings: [1, 3, 3, 2, 1, 1],
      fingers: [1, 3, 4, 2, 1, 1],
      barres: [{ fromString: 0, toString: 5, fret: 1 }],
      baseFret: 4,
    }],
    difficulty: 'intermediate',
    chordType: 'triad',
  },

  'Db': {
    voicings: [{
      strings: [null, 1, 3, 3, 3, 1],
      fingers: [null, 1, 2, 3, 4, 1],
      barres: [{ fromString: 1, toString: 5, fret: 1 }],
      baseFret: 4,
    }],
    difficulty: 'intermediate',
    chordType: 'triad',
  },

  'C#': {
    voicings: [{
      strings: [null, 1, 3, 3, 3, 1],
      fingers: [null, 1, 2, 3, 4, 1],
      barres: [{ fromString: 1, toString: 5, fret: 1 }],
      baseFret: 4,
    }],
    difficulty: 'intermediate',
    chordType: 'triad',
  },

  'D#': {
    voicings: [{
      strings: [null, 1, 3, 3, 3, 1],
      fingers: [null, 1, 2, 3, 4, 1],
      barres: [{ fromString: 1, toString: 5, fret: 1 }],
      baseFret: 6,
    }],
    difficulty: 'intermediate',
    chordType: 'triad',
  },

  'F#': {
    voicings: [{
      strings: [1, 3, 3, 2, 1, 1],
      fingers: [1, 3, 4, 2, 1, 1],
      barres: [{ fromString: 0, toString: 5, fret: 1 }],
      baseFret: 2,
    }],
    difficulty: 'intermediate',
    chordType: 'triad',
  },

  'Gb': {
    voicings: [{
      strings: [1, 3, 3, 2, 1, 1],
      fingers: [1, 3, 4, 2, 1, 1],
      barres: [{ fromString: 0, toString: 5, fret: 1 }],
      baseFret: 2,
    }],
    difficulty: 'intermediate',
    chordType: 'triad',
  },

  'G#': {
    voicings: [{
      strings: [1, 3, 3, 2, 1, 1],
      fingers: [1, 3, 4, 2, 1, 1],
      barres: [{ fromString: 0, toString: 5, fret: 1 }],
      baseFret: 4,
    }],
    difficulty: 'intermediate',
    chordType: 'triad',
  },

  'A#': {
    voicings: [{
      strings: [null, 1, 3, 3, 3, 1],
      fingers: [null, 1, 2, 3, 4, 1],
      barres: [{ fromString: 1, toString: 5, fret: 1 }],
      baseFret: 1,
    }],
    difficulty: 'intermediate',
    chordType: 'triad',
  },

  // ─────────────────────────────────────────────
  // MINOR CHORDS - Open voicings
  // ─────────────────────────────────────────────

  'Am': {
    voicings: [{
      strings: [null, 0, 2, 2, 1, 0],
      fingers: [null, 0, 2, 3, 1, 0],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'beginner',
    chordType: 'triad',
  },

  'Dm': {
    voicings: [{
      strings: [null, null, 0, 2, 3, 1],
      fingers: [null, null, 0, 2, 3, 1],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'beginner',
    chordType: 'triad',
  },

  'Em': {
    voicings: [{
      strings: [0, 2, 2, 0, 0, 0],
      fingers: [0, 2, 3, 0, 0, 0],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'beginner',
    chordType: 'triad',
  },

  // ─────────────────────────────────────────────
  // MINOR CHORDS - Barre voicings
  // ─────────────────────────────────────────────

  'Bm': {
    voicings: [{
      strings: [null, 1, 3, 3, 2, 1],
      fingers: [null, 1, 3, 4, 2, 1],
      barres: [{ fromString: 1, toString: 5, fret: 1 }],
      baseFret: 2,
    }],
    difficulty: 'intermediate',
    chordType: 'triad',
  },

  'Cm': {
    voicings: [{
      strings: [null, 1, 3, 3, 2, 1],
      fingers: [null, 1, 3, 4, 2, 1],
      barres: [{ fromString: 1, toString: 5, fret: 1 }],
      baseFret: 3,
    }],
    difficulty: 'intermediate',
    chordType: 'triad',
  },

  'F#m': {
    voicings: [{
      strings: [1, 3, 3, 1, 1, 1],
      fingers: [1, 3, 4, 1, 1, 1],
      barres: [{ fromString: 0, toString: 5, fret: 1 }],
      baseFret: 2,
    }],
    difficulty: 'intermediate',
    chordType: 'triad',
  },

  'G#m': {
    voicings: [{
      strings: [1, 3, 3, 1, 1, 1],
      fingers: [1, 3, 4, 1, 1, 1],
      barres: [{ fromString: 0, toString: 5, fret: 1 }],
      baseFret: 4,
    }],
    difficulty: 'intermediate',
    chordType: 'triad',
  },

  'Abm': {
    voicings: [{
      strings: [1, 3, 3, 1, 1, 1],
      fingers: [1, 3, 4, 1, 1, 1],
      barres: [{ fromString: 0, toString: 5, fret: 1 }],
      baseFret: 4,
    }],
    difficulty: 'intermediate',
    chordType: 'triad',
  },

  'C#m': {
    voicings: [{
      strings: [null, 1, 3, 3, 2, 1],
      fingers: [null, 1, 3, 4, 2, 1],
      barres: [{ fromString: 1, toString: 5, fret: 1 }],
      baseFret: 4,
    }],
    difficulty: 'intermediate',
    chordType: 'triad',
  },

  'Bbm': {
    voicings: [{
      strings: [null, 1, 3, 3, 2, 1],
      fingers: [null, 1, 3, 4, 2, 1],
      barres: [{ fromString: 1, toString: 5, fret: 1 }],
      baseFret: 1,
    }],
    difficulty: 'intermediate',
    chordType: 'triad',
  },

  'A#m': {
    voicings: [{
      strings: [null, 1, 3, 3, 2, 1],
      fingers: [null, 1, 3, 4, 2, 1],
      barres: [{ fromString: 1, toString: 5, fret: 1 }],
      baseFret: 1,
    }],
    difficulty: 'intermediate',
    chordType: 'triad',
  },

  'Ebm': {
    voicings: [{
      strings: [null, 1, 3, 3, 2, 1],
      fingers: [null, 1, 3, 4, 2, 1],
      barres: [{ fromString: 1, toString: 5, fret: 1 }],
      baseFret: 6,
    }],
    difficulty: 'intermediate',
    chordType: 'triad',
  },

  'D#m': {
    voicings: [{
      strings: [null, 1, 3, 3, 2, 1],
      fingers: [null, 1, 3, 4, 2, 1],
      barres: [{ fromString: 1, toString: 5, fret: 1 }],
      baseFret: 6,
    }],
    difficulty: 'intermediate',
    chordType: 'triad',
  },

  'Fm': {
    voicings: [{
      strings: [1, 3, 3, 1, 1, 1],
      fingers: [1, 3, 4, 1, 1, 1],
      barres: [{ fromString: 0, toString: 5, fret: 1 }],
      baseFret: 1,
    }],
    difficulty: 'intermediate',
    chordType: 'triad',
  },

  'Gm': {
    voicings: [{
      strings: [1, 3, 3, 1, 1, 1],
      fingers: [1, 3, 4, 1, 1, 1],
      barres: [{ fromString: 0, toString: 5, fret: 1 }],
      baseFret: 3,
    }],
    difficulty: 'intermediate',
    chordType: 'triad',
  },

  'Gbm': {
    voicings: [{
      strings: [1, 3, 3, 1, 1, 1],
      fingers: [1, 3, 4, 1, 1, 1],
      barres: [{ fromString: 0, toString: 5, fret: 1 }],
      baseFret: 2,
    }],
    difficulty: 'intermediate',
    chordType: 'triad',
  },

  // ─────────────────────────────────────────────
  // DIMINISHED CHORDS
  // ─────────────────────────────────────────────

  'Bdim': {
    voicings: [{
      strings: [null, 2, 3, 4, 3, null],
      fingers: [null, 1, 2, 4, 3, null],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'advanced',
    chordType: 'triad',
  },

  'C#dim': {
    voicings: [{
      strings: [null, 1, 2, 3, 2, null],
      fingers: [null, 1, 2, 4, 3, null],
      barres: [],
      baseFret: 4,
    }],
    difficulty: 'advanced',
    chordType: 'triad',
  },

  'Dbdim': {
    voicings: [{
      strings: [null, 1, 2, 3, 2, null],
      fingers: [null, 1, 2, 4, 3, null],
      barres: [],
      baseFret: 4,
    }],
    difficulty: 'advanced',
    chordType: 'triad',
  },

  'D#dim': {
    voicings: [{
      strings: [null, 1, 2, 3, 2, null],
      fingers: [null, 1, 2, 4, 3, null],
      barres: [],
      baseFret: 6,
    }],
    difficulty: 'advanced',
    chordType: 'triad',
  },

  'Ebdim': {
    voicings: [{
      strings: [null, 1, 2, 3, 2, null],
      fingers: [null, 1, 2, 4, 3, null],
      barres: [],
      baseFret: 6,
    }],
    difficulty: 'advanced',
    chordType: 'triad',
  },

  'Edim': {
    voicings: [{
      strings: [0, 1, 2, 0, null, null],
      fingers: [0, 1, 2, 0, null, null],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'advanced',
    chordType: 'triad',
  },

  'F#dim': {
    voicings: [{
      strings: [null, null, 4, 2, 1, null],
      fingers: [null, null, 4, 2, 1, null],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'advanced',
    chordType: 'triad',
  },

  'Gbdim': {
    voicings: [{
      strings: [null, null, 4, 2, 1, null],
      fingers: [null, null, 4, 2, 1, null],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'advanced',
    chordType: 'triad',
  },

  'G#dim': {
    voicings: [{
      strings: [null, null, 4, 2, 1, null],
      fingers: [null, null, 4, 2, 1, null],
      barres: [],
      baseFret: 3,
    }],
    difficulty: 'advanced',
    chordType: 'triad',
  },

  'Abdim': {
    voicings: [{
      strings: [null, null, 4, 2, 1, null],
      fingers: [null, null, 4, 2, 1, null],
      barres: [],
      baseFret: 3,
    }],
    difficulty: 'advanced',
    chordType: 'triad',
  },

  'Adim': {
    voicings: [{
      strings: [null, 0, 1, 2, 1, null],
      fingers: [null, 0, 1, 3, 2, null],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'advanced',
    chordType: 'triad',
  },

  'A#dim': {
    voicings: [{
      strings: [null, 1, 2, 3, 2, null],
      fingers: [null, 1, 2, 4, 3, null],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'advanced',
    chordType: 'triad',
  },

  'Bbdim': {
    voicings: [{
      strings: [null, 1, 2, 3, 2, null],
      fingers: [null, 1, 2, 4, 3, null],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'advanced',
    chordType: 'triad',
  },

  'Cdim': {
    voicings: [{
      strings: [null, 1, 2, 3, 2, null],
      fingers: [null, 1, 2, 4, 3, null],
      barres: [],
      baseFret: 3,
    }],
    difficulty: 'advanced',
    chordType: 'triad',
  },

  'Ddim': {
    voicings: [{
      strings: [null, 1, 2, 3, 2, null],
      fingers: [null, 1, 2, 4, 3, null],
      barres: [],
      baseFret: 5,
    }],
    difficulty: 'advanced',
    chordType: 'triad',
  },

  'Fdim': {
    voicings: [{
      strings: [null, null, 3, 1, 0, null],
      fingers: [null, null, 3, 1, 0, null],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'advanced',
    chordType: 'triad',
  },

  'Gdim': {
    voicings: [{
      strings: [null, null, 4, 2, 1, null],
      fingers: [null, null, 4, 2, 1, null],
      barres: [],
      baseFret: 2,
    }],
    difficulty: 'advanced',
    chordType: 'triad',
  },

  // Merge in 7th chords, sus/power chords
  ...seventhChords,
  ...susPowerChords,
  ...extendedChords,
};
