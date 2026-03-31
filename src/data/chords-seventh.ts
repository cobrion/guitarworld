import type { ChordVoicing, Difficulty, ChordTypeFilter } from '../types';

export interface ChordVoicingData {
  voicings: ChordVoicing[];
  difficulty: Difficulty;
  chordType: ChordTypeFilter;
}

/**
 * Seventh chord voicing database: dominant 7th, minor 7th, and major 7th.
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
export const seventhChords: Record<string, ChordVoicingData> = {

  // ─────────────────────────────────────────────
  // DOMINANT 7TH CHORDS - Open voicings
  // ─────────────────────────────────────────────

  'C7': {
    voicings: [{
      strings: [null, 3, 2, 3, 1, 0],
      fingers: [null, 3, 2, 4, 1, 0],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'intermediate',
    chordType: 'seventh',
  },

  'D7': {
    voicings: [{
      strings: [null, null, 0, 2, 1, 2],
      fingers: [null, null, 0, 2, 1, 3],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'beginner',
    chordType: 'seventh',
  },

  'E7': {
    voicings: [{
      strings: [0, 2, 0, 1, 0, 0],
      fingers: [0, 2, 0, 1, 0, 0],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'beginner',
    chordType: 'seventh',
  },

  'G7': {
    voicings: [{
      strings: [3, 2, 0, 0, 0, 1],
      fingers: [3, 2, 0, 0, 0, 1],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'beginner',
    chordType: 'seventh',
  },

  'A7': {
    voicings: [{
      strings: [null, 0, 2, 0, 2, 0],
      fingers: [null, 0, 2, 0, 3, 0],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'beginner',
    chordType: 'seventh',
  },

  'B7': {
    voicings: [{
      strings: [null, 2, 1, 2, 0, 2],
      fingers: [null, 2, 1, 3, 0, 4],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'intermediate',
    chordType: 'seventh',
  },

  // ─────────────────────────────────────────────
  // DOMINANT 7TH CHORDS - Barre voicings
  // ─────────────────────────────────────────────

  'F7': {
    voicings: [{
      strings: [1, 3, 1, 2, 1, 1],
      fingers: [1, 3, 1, 2, 1, 1],
      barres: [{ fromString: 0, toString: 5, fret: 1 }],
      baseFret: 1,
    }],
    difficulty: 'intermediate',
    chordType: 'seventh',
  },

  'Bb7': {
    voicings: [{
      strings: [null, 1, 3, 1, 3, 1],
      fingers: [null, 1, 3, 1, 4, 1],
      barres: [{ fromString: 1, toString: 5, fret: 1 }],
      baseFret: 1,
    }],
    difficulty: 'intermediate',
    chordType: 'seventh',
  },

  'Eb7': {
    voicings: [{
      strings: [null, null, 1, 3, 2, 3],
      fingers: [null, null, 1, 3, 2, 4],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'intermediate',
    chordType: 'seventh',
  },

  // Ab7: E7 barre shape at fret 4
  'Ab7': {
    voicings: [{
      strings: [1, 3, 1, 2, 1, 1],
      fingers: [1, 3, 1, 2, 1, 1],
      barres: [{ fromString: 0, toString: 5, fret: 1 }],
      baseFret: 4,
    }],
    difficulty: 'advanced',
    chordType: 'seventh',
  },

  // F#7/Gb7: E7 barre shape at fret 2
  'F#7': {
    voicings: [{
      strings: [1, 3, 1, 2, 1, 1],
      fingers: [1, 3, 1, 2, 1, 1],
      barres: [{ fromString: 0, toString: 5, fret: 1 }],
      baseFret: 2,
    }],
    difficulty: 'intermediate',
    chordType: 'seventh',
  },

  'Gb7': {
    voicings: [{
      strings: [1, 3, 1, 2, 1, 1],
      fingers: [1, 3, 1, 2, 1, 1],
      barres: [{ fromString: 0, toString: 5, fret: 1 }],
      baseFret: 2,
    }],
    difficulty: 'intermediate',
    chordType: 'seventh',
  },

  // C#7/Db7: A7 barre shape at fret 4
  'C#7': {
    voicings: [{
      strings: [null, 1, 3, 1, 3, 1],
      fingers: [null, 1, 3, 1, 4, 1],
      barres: [{ fromString: 1, toString: 5, fret: 1 }],
      baseFret: 4,
    }],
    difficulty: 'advanced',
    chordType: 'seventh',
  },

  'Db7': {
    voicings: [{
      strings: [null, 1, 3, 1, 3, 1],
      fingers: [null, 1, 3, 1, 4, 1],
      barres: [{ fromString: 1, toString: 5, fret: 1 }],
      baseFret: 4,
    }],
    difficulty: 'advanced',
    chordType: 'seventh',
  },

  // D#7: A7 barre shape at fret 6
  'D#7': {
    voicings: [{
      strings: [null, 1, 3, 1, 3, 1],
      fingers: [null, 1, 3, 1, 4, 1],
      barres: [{ fromString: 1, toString: 5, fret: 1 }],
      baseFret: 6,
    }],
    difficulty: 'advanced',
    chordType: 'seventh',
  },

  // G#7: E7 barre shape at fret 4
  'G#7': {
    voicings: [{
      strings: [1, 3, 1, 2, 1, 1],
      fingers: [1, 3, 1, 2, 1, 1],
      barres: [{ fromString: 0, toString: 5, fret: 1 }],
      baseFret: 4,
    }],
    difficulty: 'advanced',
    chordType: 'seventh',
  },

  // ─────────────────────────────────────────────
  // MINOR 7TH CHORDS - Open voicings
  // ─────────────────────────────────────────────

  'Am7': {
    voicings: [{
      strings: [null, 0, 2, 0, 1, 0],
      fingers: [null, 0, 2, 0, 1, 0],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'beginner',
    chordType: 'seventh',
  },

  'Dm7': {
    voicings: [{
      strings: [null, null, 0, 2, 1, 1],
      fingers: [null, null, 0, 2, 1, 1],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'beginner',
    chordType: 'seventh',
  },

  'Em7': {
    voicings: [{
      strings: [0, 2, 0, 0, 0, 0],
      fingers: [0, 2, 0, 0, 0, 0],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'beginner',
    chordType: 'seventh',
  },

  // ─────────────────────────────────────────────
  // MINOR 7TH CHORDS - Barre voicings
  // ─────────────────────────────────────────────

  // Bm7: Am7 barre shape at fret 2 -> x-2-4-2-3-2
  // Relative to baseFret 2: x-1-3-1-2-1
  'Bm7': {
    voicings: [{
      strings: [null, 1, 3, 1, 2, 1],
      fingers: [null, 1, 3, 1, 2, 1],
      barres: [{ fromString: 1, toString: 5, fret: 1 }],
      baseFret: 2,
    }],
    difficulty: 'intermediate',
    chordType: 'seventh',
  },

  // Cm7: Am7 barre shape at fret 3
  'Cm7': {
    voicings: [{
      strings: [null, 1, 3, 1, 2, 1],
      fingers: [null, 1, 3, 1, 2, 1],
      barres: [{ fromString: 1, toString: 5, fret: 1 }],
      baseFret: 3,
    }],
    difficulty: 'intermediate',
    chordType: 'seventh',
  },

  // Fm7: Em7 barre shape at fret 1
  'Fm7': {
    voicings: [{
      strings: [1, 3, 1, 1, 1, 1],
      fingers: [1, 3, 1, 1, 1, 1],
      barres: [{ fromString: 0, toString: 5, fret: 1 }],
      baseFret: 1,
    }],
    difficulty: 'intermediate',
    chordType: 'seventh',
  },

  // Gm7: Em7 barre shape at fret 3
  'Gm7': {
    voicings: [{
      strings: [1, 3, 1, 1, 1, 1],
      fingers: [1, 3, 1, 1, 1, 1],
      barres: [{ fromString: 0, toString: 5, fret: 1 }],
      baseFret: 3,
    }],
    difficulty: 'intermediate',
    chordType: 'seventh',
  },

  // F#m7: Em7 barre shape at fret 2
  'F#m7': {
    voicings: [{
      strings: [1, 3, 1, 1, 1, 1],
      fingers: [1, 3, 1, 1, 1, 1],
      barres: [{ fromString: 0, toString: 5, fret: 1 }],
      baseFret: 2,
    }],
    difficulty: 'intermediate',
    chordType: 'seventh',
  },

  // C#m7: Am7 barre shape at fret 4
  'C#m7': {
    voicings: [{
      strings: [null, 1, 3, 1, 2, 1],
      fingers: [null, 1, 3, 1, 2, 1],
      barres: [{ fromString: 1, toString: 5, fret: 1 }],
      baseFret: 4,
    }],
    difficulty: 'advanced',
    chordType: 'seventh',
  },

  // G#m7/Abm7: Em7 barre shape at fret 4
  'G#m7': {
    voicings: [{
      strings: [1, 3, 1, 1, 1, 1],
      fingers: [1, 3, 1, 1, 1, 1],
      barres: [{ fromString: 0, toString: 5, fret: 1 }],
      baseFret: 4,
    }],
    difficulty: 'advanced',
    chordType: 'seventh',
  },

  'Abm7': {
    voicings: [{
      strings: [1, 3, 1, 1, 1, 1],
      fingers: [1, 3, 1, 1, 1, 1],
      barres: [{ fromString: 0, toString: 5, fret: 1 }],
      baseFret: 4,
    }],
    difficulty: 'advanced',
    chordType: 'seventh',
  },

  // Bbm7: Am7 barre shape at fret 1
  'Bbm7': {
    voicings: [{
      strings: [null, 1, 3, 1, 2, 1],
      fingers: [null, 1, 3, 1, 2, 1],
      barres: [{ fromString: 1, toString: 5, fret: 1 }],
      baseFret: 1,
    }],
    difficulty: 'intermediate',
    chordType: 'seventh',
  },

  // A#m7: Am7 barre shape at fret 1 (enharmonic of Bbm7)
  'A#m7': {
    voicings: [{
      strings: [null, 1, 3, 1, 2, 1],
      fingers: [null, 1, 3, 1, 2, 1],
      barres: [{ fromString: 1, toString: 5, fret: 1 }],
      baseFret: 1,
    }],
    difficulty: 'intermediate',
    chordType: 'seventh',
  },

  // Ebm7: Am7 barre shape at fret 6
  'Ebm7': {
    voicings: [{
      strings: [null, 1, 3, 1, 2, 1],
      fingers: [null, 1, 3, 1, 2, 1],
      barres: [{ fromString: 1, toString: 5, fret: 1 }],
      baseFret: 6,
    }],
    difficulty: 'advanced',
    chordType: 'seventh',
  },

  // D#m7: Am7 barre shape at fret 6 (enharmonic of Ebm7)
  'D#m7': {
    voicings: [{
      strings: [null, 1, 3, 1, 2, 1],
      fingers: [null, 1, 3, 1, 2, 1],
      barres: [{ fromString: 1, toString: 5, fret: 1 }],
      baseFret: 6,
    }],
    difficulty: 'advanced',
    chordType: 'seventh',
  },

  // ─────────────────────────────────────────────
  // MAJOR 7TH CHORDS - Open voicings
  // ─────────────────────────────────────────────

  'Cmaj7': {
    voicings: [{
      strings: [null, 3, 2, 0, 0, 0],
      fingers: [null, 3, 2, 0, 0, 0],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'beginner',
    chordType: 'seventh',
  },

  'Dmaj7': {
    voicings: [{
      strings: [null, null, 0, 2, 2, 2],
      fingers: [null, null, 0, 1, 2, 3],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'beginner',
    chordType: 'seventh',
  },

  'Emaj7': {
    voicings: [{
      strings: [0, 2, 1, 1, 0, 0],
      fingers: [0, 3, 1, 2, 0, 0],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'intermediate',
    chordType: 'seventh',
  },

  'Fmaj7': {
    voicings: [{
      strings: [null, null, 3, 2, 1, 0],
      fingers: [null, null, 3, 2, 1, 0],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'beginner',
    chordType: 'seventh',
  },

  'Gmaj7': {
    voicings: [{
      strings: [3, 2, 0, 0, 0, 2],
      fingers: [3, 2, 0, 0, 0, 1],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'intermediate',
    chordType: 'seventh',
  },

  'Amaj7': {
    voicings: [{
      strings: [null, 0, 2, 1, 2, 0],
      fingers: [null, 0, 3, 1, 2, 0],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'beginner',
    chordType: 'seventh',
  },

  // ─────────────────────────────────────────────
  // MAJOR 7TH CHORDS - Barre voicings
  // ─────────────────────────────────────────────

  // Bmaj7: x-2-4-3-4-2 barre at fret 2
  // Relative to baseFret 2: x-1-3-2-3-1
  'Bmaj7': {
    voicings: [{
      strings: [null, 1, 3, 2, 3, 1],
      fingers: [null, 1, 4, 2, 3, 1],
      barres: [{ fromString: 1, toString: 5, fret: 1 }],
      baseFret: 2,
    }],
    difficulty: 'advanced',
    chordType: 'seventh',
  },

  // Bbmaj7: x-1-3-2-3-1 barre at fret 1
  'Bbmaj7': {
    voicings: [{
      strings: [null, 1, 3, 2, 3, 1],
      fingers: [null, 1, 4, 2, 3, 1],
      barres: [{ fromString: 1, toString: 5, fret: 1 }],
      baseFret: 1,
    }],
    difficulty: 'intermediate',
    chordType: 'seventh',
  },

  // Ebmaj7: Amaj7 barre shape at fret 6
  // A-shape maj7 barre: x-1-3-2-3-1
  'Ebmaj7': {
    voicings: [{
      strings: [null, 1, 3, 2, 3, 1],
      fingers: [null, 1, 4, 2, 3, 1],
      barres: [{ fromString: 1, toString: 5, fret: 1 }],
      baseFret: 6,
    }],
    difficulty: 'advanced',
    chordType: 'seventh',
  },

  // Abmaj7: Emaj7 barre shape at fret 4
  // E-shape maj7 barre: 1-3-2-2-1-1
  'Abmaj7': {
    voicings: [{
      strings: [1, 3, 2, 2, 1, 1],
      fingers: [1, 4, 2, 3, 1, 1],
      barres: [{ fromString: 0, toString: 5, fret: 1 }],
      baseFret: 4,
    }],
    difficulty: 'advanced',
    chordType: 'seventh',
  },

  // F#maj7: Emaj7 barre shape at fret 2
  'F#maj7': {
    voicings: [{
      strings: [1, 3, 2, 2, 1, 1],
      fingers: [1, 4, 2, 3, 1, 1],
      barres: [{ fromString: 0, toString: 5, fret: 1 }],
      baseFret: 2,
    }],
    difficulty: 'intermediate',
    chordType: 'seventh',
  },

  // C#maj7/Dbmaj7: Amaj7 barre shape at fret 4
  'C#maj7': {
    voicings: [{
      strings: [null, 1, 3, 2, 3, 1],
      fingers: [null, 1, 4, 2, 3, 1],
      barres: [{ fromString: 1, toString: 5, fret: 1 }],
      baseFret: 4,
    }],
    difficulty: 'advanced',
    chordType: 'seventh',
  },

  'Dbmaj7': {
    voicings: [{
      strings: [null, 1, 3, 2, 3, 1],
      fingers: [null, 1, 4, 2, 3, 1],
      barres: [{ fromString: 1, toString: 5, fret: 1 }],
      baseFret: 4,
    }],
    difficulty: 'advanced',
    chordType: 'seventh',
  },
};
