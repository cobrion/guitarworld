import type { ChordVoicing, Difficulty, ChordTypeFilter } from '../types';

export interface ChordVoicingData {
  voicings: ChordVoicing[];
  difficulty: Difficulty;
  chordType: ChordTypeFilter;
}

/**
 * Sus2, Sus4, and Power chord voicings.
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
export const susPowerChords: Record<string, ChordVoicingData> = {

  // ─────────────────────────────────────────────
  // SUS2 CHORDS - Open voicings
  // ─────────────────────────────────────────────

  // Asus2 = A-B-E
  // x-0-2-2-0-0 => x-A(0)-B(2)-E(2)-B(0)-E(0)
  'Asus2': {
    voicings: [{
      strings: [null, 0, 2, 2, 0, 0],
      fingers: [null, 0, 1, 2, 0, 0],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'beginner',
    chordType: 'sus',
  },

  // Dsus2 = D-E-A
  // x-x-0-2-3-0 => x-x-D(0)-E(2)-A(3)-E(0)
  'Dsus2': {
    voicings: [{
      strings: [null, null, 0, 2, 3, 0],
      fingers: [null, null, 0, 1, 3, 0],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'beginner',
    chordType: 'sus',
  },

  // Esus2 = E-F#-B
  // 0-2-4-4-0-0 => E(0)-B(2)-F#(4)-B(4)-B(0)-E(0)
  'Esus2': {
    voicings: [{
      strings: [0, 2, 4, 4, 0, 0],
      fingers: [0, 1, 3, 4, 0, 0],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'intermediate',
    chordType: 'sus',
  },

  // Gsus2 = G-A-D
  // 3-0-0-0-3-3 => G(3)-A(0)-D(0)-G(0)-D(3)-G(3)
  'Gsus2': {
    voicings: [{
      strings: [3, 0, 0, 0, 3, 3],
      fingers: [2, 0, 0, 0, 3, 4],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'beginner',
    chordType: 'sus',
  },

  // Csus2 = C-D-G
  // A-shape barre: x-3-5-5-3-x => relative x-1-3-3-1-x baseFret 3
  // A(3)=C, D(5)=G, G(5)=D, B(3)=D  => C-G-D-D = Csus2
  'Csus2': {
    voicings: [{
      strings: [null, 1, 3, 3, 1, null],
      fingers: [null, 1, 3, 4, 1, null],
      barres: [{ fromString: 1, toString: 4, fret: 1 }],
      baseFret: 3,
    }],
    difficulty: 'intermediate',
    chordType: 'sus',
  },

  // Fsus2 = F-G-C
  // E-shape barre at fret 1: 1-3-3-0-1-1 => relative 1-3-3-0-1-1 baseFret 1
  // Wait, let's use the A-shape: x-8-10-10-8-x => x-1-3-3-1-x baseFret 8
  // A(8)=F, D(10)=C, G(10)=G, B(8)=G => F-C-G-G = Fsus2
  'Fsus2': {
    voicings: [{
      strings: [null, 1, 3, 3, 1, null],
      fingers: [null, 1, 3, 4, 1, null],
      barres: [{ fromString: 1, toString: 4, fret: 1 }],
      baseFret: 8,
    }],
    difficulty: 'intermediate',
    chordType: 'sus',
  },

  // Bsus2 = B-C#-F#
  // A-shape barre: x-2-4-4-2-x => x-1-3-3-1-x baseFret 2
  // A(2)=B, D(4)=F#, G(4)=C#, B(2)=C# => B-F#-C#-C# = Bsus2
  'Bsus2': {
    voicings: [{
      strings: [null, 1, 3, 3, 1, null],
      fingers: [null, 1, 3, 4, 1, null],
      barres: [{ fromString: 1, toString: 4, fret: 1 }],
      baseFret: 2,
    }],
    difficulty: 'intermediate',
    chordType: 'sus',
  },

  // Bbsus2 = Bb-C-F
  // A-shape barre: x-1-3-3-1-x => x-1-3-3-1-x baseFret 1
  // A(1)=Bb, D(3)=F, G(3)=C, B(1)=C => Bb-F-C-C = Bbsus2
  'Bbsus2': {
    voicings: [{
      strings: [null, 1, 3, 3, 1, null],
      fingers: [null, 1, 3, 4, 1, null],
      barres: [{ fromString: 1, toString: 4, fret: 1 }],
      baseFret: 1,
    }],
    difficulty: 'intermediate',
    chordType: 'sus',
  },

  // ─────────────────────────────────────────────
  // SUS4 CHORDS - Open voicings
  // ─────────────────────────────────────────────

  // Asus4 = A-D-E
  // x-0-2-2-3-0 => x-A(0)-E(2)-A(2)-D(3)-E(0)
  'Asus4': {
    voicings: [{
      strings: [null, 0, 2, 2, 3, 0],
      fingers: [null, 0, 1, 2, 3, 0],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'beginner',
    chordType: 'sus',
  },

  // Dsus4 = D-G-A
  // x-x-0-2-3-3 => x-x-D(0)-A(2)-G(3)... wait B(3)=D, E(3)=G
  // Actually: x-x-D(0)-A(2)-D(3)-G(3) = D-A-D-G = Dsus4
  'Dsus4': {
    voicings: [{
      strings: [null, null, 0, 2, 3, 3],
      fingers: [null, null, 0, 1, 3, 4],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'beginner',
    chordType: 'sus',
  },

  // Esus4 = E-A-B
  // 0-2-2-2-0-0 => E(0)-B(2)-A(2)-B(2)... wait
  // D(2)=E... no. D string fret 2 = E. G string fret 2 = A.
  // 0-2-2-2-0-0 => E(0)-B(2)-E(2)-A(2)-B(0)-E(0) = E-B-E-A-B-E = Esus4
  'Esus4': {
    voicings: [{
      strings: [0, 2, 2, 2, 0, 0],
      fingers: [0, 2, 3, 4, 0, 0],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'beginner',
    chordType: 'sus',
  },

  // Gsus4 = G-C-D
  // 3-3-0-0-1-3 => G(3)-C(3)-D(0)-G(0)-C(1)-G(3)
  'Gsus4': {
    voicings: [{
      strings: [3, 3, 0, 0, 1, 3],
      fingers: [2, 3, 0, 0, 1, 4],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'beginner',
    chordType: 'sus',
  },

  // Csus4 = C-F-G
  // x-3-3-0-1-1 => C(3)-F(3)-G(0)-C(1)-F(1)
  'Csus4': {
    voicings: [{
      strings: [null, 3, 3, 0, 1, 1],
      fingers: [null, 3, 4, 0, 1, 1],
      barres: [{ fromString: 4, toString: 5, fret: 1 }],
      baseFret: 1,
    }],
    difficulty: 'intermediate',
    chordType: 'sus',
  },

  // Fsus4 = F-Bb-C
  // E-shape barre at fret 1: 1-1-3-3-1-1 baseFret 1
  // E(1)=F, A(1)=Bb, D(3)=F, G(3)=C, B(1)=C, E(1)=F
  // = F-Bb-F-C-C-F = Fsus4
  'Fsus4': {
    voicings: [{
      strings: [1, 1, 3, 3, 1, 1],
      fingers: [1, 1, 3, 4, 1, 1],
      barres: [{ fromString: 0, toString: 5, fret: 1 }],
      baseFret: 1,
    }],
    difficulty: 'intermediate',
    chordType: 'sus',
  },

  // Bsus4 = B-E-F#
  // A-shape barre: x-2-4-4-5-2 => x-1-3-3-4-1 baseFret 2
  // A(2)=B, D(4)=F#, G(4)=B, B(5)=E, E(2)... wait that's 6 strings.
  // Better: x-2-4-4-5-x => x-1-3-3-4-x baseFret 2
  // A(2)=B, D(4)=F#, G(4)=B, B(5)=E => B-F#-B-E = Bsus4
  // Or use E-shape: 7-7-9-9-7-7 => 1-1-3-3-1-1 baseFret 7
  // E(7)=B, A(7)=E, D(9)=B, G(9)=F#... wait G(9)=G+9semitones... fretboard:
  // Actually let's just use the simple A-shape barre.
  // x-2-4-4-5-2: A(2)=B, D(4)=F#, G(4)=B, B(5)=E, highE(2)=F#
  // = B-F#-B-E-F# = Bsus4
  'Bsus4': {
    voicings: [{
      strings: [null, 1, 3, 3, 4, 1],
      fingers: [null, 1, 2, 3, 4, 1],
      barres: [{ fromString: 1, toString: 5, fret: 1 }],
      baseFret: 2,
    }],
    difficulty: 'intermediate',
    chordType: 'sus',
  },

  // Bbsus4 = Bb-Eb-F
  // A-shape barre: x-1-3-3-4-1 baseFret 1
  // A(1)=Bb, D(3)=F, G(3)=Bb, B(4)=Eb, highE(1)=F
  // = Bb-F-Bb-Eb-F = Bbsus4
  'Bbsus4': {
    voicings: [{
      strings: [null, 1, 3, 3, 4, 1],
      fingers: [null, 1, 2, 3, 4, 1],
      barres: [{ fromString: 1, toString: 5, fret: 1 }],
      baseFret: 1,
    }],
    difficulty: 'intermediate',
    chordType: 'sus',
  },

  // ─────────────────────────────────────────────
  // POWER CHORDS
  // ─────────────────────────────────────────────

  // E5 = E-B
  // 0-2-2-x-x-x => E(0)-B(2)-E(2)-muted
  'E5': {
    voicings: [{
      strings: [0, 2, 2, null, null, null],
      fingers: [0, 1, 2, null, null, null],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'beginner',
    chordType: 'power',
  },

  // A5 = A-E
  // x-0-2-2-x-x => x-A(0)-E(2)-A(2)-muted
  'A5': {
    voicings: [{
      strings: [null, 0, 2, 2, null, null],
      fingers: [null, 0, 1, 2, null, null],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'beginner',
    chordType: 'power',
  },

  // D5 = D-A
  // x-x-0-2-3-x => x-x-D(0)-A(2)-D(3)-muted
  'D5': {
    voicings: [{
      strings: [null, null, 0, 2, 3, null],
      fingers: [null, null, 0, 1, 2, null],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'beginner',
    chordType: 'power',
  },

  // G5 = G-D
  // 3-5-5-x-x-x => baseFret 3, relative: 1-3-3-x-x-x
  // E(3)=G, A(5)=D, D(5)=G => G-D-G
  'G5': {
    voicings: [{
      strings: [1, 3, 3, null, null, null],
      fingers: [1, 3, 4, null, null, null],
      barres: [],
      baseFret: 3,
    }],
    difficulty: 'beginner',
    chordType: 'power',
  },

  // C5 = C-G
  // x-3-5-5-x-x => baseFret 3, relative: x-1-3-3-x-x
  // A(3)=C, D(5)=G, G(5)=C => C-G-C
  'C5': {
    voicings: [{
      strings: [null, 1, 3, 3, null, null],
      fingers: [null, 1, 3, 4, null, null],
      barres: [],
      baseFret: 3,
    }],
    difficulty: 'beginner',
    chordType: 'power',
  },

  // F5 = F-C
  // 1-3-3-x-x-x => baseFret 1
  // E(1)=F, A(3)=C, D(3)=F => F-C-F
  'F5': {
    voicings: [{
      strings: [1, 3, 3, null, null, null],
      fingers: [1, 3, 4, null, null, null],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'beginner',
    chordType: 'power',
  },

  // B5 = B-F#
  // x-2-4-4-x-x => baseFret 2, relative: x-1-3-3-x-x
  // A(2)=B, D(4)=F#, G(4)=B => B-F#-B
  'B5': {
    voicings: [{
      strings: [null, 1, 3, 3, null, null],
      fingers: [null, 1, 3, 4, null, null],
      barres: [],
      baseFret: 2,
    }],
    difficulty: 'beginner',
    chordType: 'power',
  },

  // Bb5 = Bb-F
  // x-1-3-3-x-x => baseFret 1
  // A(1)=Bb, D(3)=F, G(3)=Bb => Bb-F-Bb
  'Bb5': {
    voicings: [{
      strings: [null, 1, 3, 3, null, null],
      fingers: [null, 1, 3, 4, null, null],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'beginner',
    chordType: 'power',
  },

  // F#5 = F#-C#
  // 2-4-4-x-x-x => baseFret 2, relative: 1-3-3-x-x-x
  // E(2)=F#, A(4)=C#, D(4)=F# => F#-C#-F#
  'F#5': {
    voicings: [{
      strings: [1, 3, 3, null, null, null],
      fingers: [1, 3, 4, null, null, null],
      barres: [],
      baseFret: 2,
    }],
    difficulty: 'beginner',
    chordType: 'power',
  },

  // Ab5 = Ab-Eb
  // 4-6-6-x-x-x => baseFret 4, relative: 1-3-3-x-x-x
  // E(4)=Ab, A(6)=Eb, D(6)=Ab => Ab-Eb-Ab
  'Ab5': {
    voicings: [{
      strings: [1, 3, 3, null, null, null],
      fingers: [1, 3, 4, null, null, null],
      barres: [],
      baseFret: 4,
    }],
    difficulty: 'beginner',
    chordType: 'power',
  },

  // Eb5 = Eb-Bb
  // x-6-8-8-x-x => baseFret 6, relative: x-1-3-3-x-x
  // A(6)=Eb, D(8)=Bb, G(8)=Eb => Eb-Bb-Eb
  'Eb5': {
    voicings: [{
      strings: [null, 1, 3, 3, null, null],
      fingers: [null, 1, 3, 4, null, null],
      barres: [],
      baseFret: 6,
    }],
    difficulty: 'beginner',
    chordType: 'power',
  },
};
