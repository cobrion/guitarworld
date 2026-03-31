import type { ChordVoicing, Difficulty, ChordTypeFilter } from '../types';

export interface ChordVoicingData {
  voicings: ChordVoicing[];
  difficulty: Difficulty;
  chordType: ChordTypeFilter;
}

/**
 * Extended chord voicing database: augmented triads, diminished 7ths,
 * add9 chords, and dominant 9th chords.
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
export const extendedChords: Record<string, ChordVoicingData> = {

  // ─────────────────────────────────────────────
  // AUGMENTED TRIADS (root + major 3rd + augmented 5th)
  // ─────────────────────────────────────────────

  // Caug = C-E-G#
  // x-3-2-1-1-0 => x-C(3)-E(2)-G#(1)-C(1)-E(0)
  'Caug': {
    voicings: [{
      strings: [null, 3, 2, 1, 1, 0],
      fingers: [null, 3, 2, 1, 1, 0],
      barres: [{ fromString: 3, toString: 4, fret: 1 }],
      baseFret: 1,
    }],
    difficulty: 'advanced',
    chordType: 'triad',
  },

  // Daug = D-F#-A#
  // Using Caug shape moved up 2 frets: x-1-2-1-1-x at baseFret 3
  // A(fret5)=D, D(fret4)=F#, G(fret3)=A#/Bb, B(fret3)=D => D-F#-A#-D
  'Daug': {
    voicings: [{
      strings: [null, 3, 2, 1, 1, null],
      fingers: [null, 4, 3, 1, 1, null],
      barres: [{ fromString: 3, toString: 4, fret: 1 }],
      baseFret: 3,
    }],
    difficulty: 'advanced',
    chordType: 'triad',
  },

  // Eaug = E-G#-B#(C)
  // 0-3-2-1-1-0 => E(0)-C(3)-E(2)-G#(1)-C(1)-E(0)
  'Eaug': {
    voicings: [{
      strings: [0, 3, 2, 1, 1, 0],
      fingers: [0, 4, 3, 1, 1, 0],
      barres: [{ fromString: 3, toString: 4, fret: 1 }],
      baseFret: 1,
    }],
    difficulty: 'advanced',
    chordType: 'triad',
  },

  // Faug = F-A-C#
  // x-x-3-2-2-1 => x-x-F(3)-A(2)-C#(2)-F(1)
  'Faug': {
    voicings: [{
      strings: [null, null, 3, 2, 2, 1],
      fingers: [null, null, 4, 2, 3, 1],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'advanced',
    chordType: 'triad',
  },

  // Gaug = G-B-D#
  // 3-2-1-0-0-3 => G(3)-B(2)-D#/Eb(1)-G(0)-B(0)-G(3)
  'Gaug': {
    voicings: [{
      strings: [3, 2, 1, 0, 0, 3],
      fingers: [3, 2, 1, 0, 0, 4],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'advanced',
    chordType: 'triad',
  },

  // Aaug = A-C#-E#(F)
  // x-0-3-2-2-1 => x-A(0)-F(3)-A(2)-C#(2)-F(1)
  'Aaug': {
    voicings: [{
      strings: [null, 0, 3, 2, 2, 1],
      fingers: [null, 0, 4, 2, 3, 1],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'advanced',
    chordType: 'triad',
  },

  // Bbaug = Bb-D-F#
  // x-1-0-3-3-2 => x-Bb(1)-D(0)-D(3)... no.
  // Use Caug shape at baseFret 2 on A string: x-1-2-1-1-x baseFret 2
  // A(fret2)=B... that's Baug. Need baseFret 1 shifted.
  // Better: x-x-4-3-3-2 baseFret 1 => x-x-F#(4)-D(3)-D(3)-F#(2)
  // That has fret span of 3 (2-4), ok.
  // D(fret4)=F#, G(fret3)=Bb, B(fret3)=D, E(fret2)=F# => F#-Bb-D-F# = Bbaug
  'Bbaug': {
    voicings: [{
      strings: [null, null, 4, 3, 3, 2],
      fingers: [null, null, 4, 2, 3, 1],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'advanced',
    chordType: 'triad',
  },

  // Baug = B-D#-F##(G)
  // Using Eaug shape moved up: x-1-2-1-1-x baseFret 2
  // A(fret2)=B, D(fret3)=F? No wait, baseFret 2 means relative fret 2 = actual fret 3.
  // A(fret2)=B, D(fret3)=F... that's wrong. Let me recalculate.
  // baseFret 2: relative 1=actual 2, relative 2=actual 3
  // x-1-2-1-1-x at baseFret 2:
  // A(actual 2)=B, D(actual 3)=F, G(actual 2)=A, B(actual 2)=C#
  // That's B-F-A-C# which is not Baug.
  //
  // Better: use the Caug 4-string shape moved up.
  // Caug inner shape: x-3-2-1-1-0. The core is the A-D-G-B part: 3-2-1-1
  // Move up to B: need to shift by 11 semitones (or use baseFret approach)
  // Actually simpler: x-x-1-2-1-1 at baseFret 4
  // D(fret4)=F#... no, relative 1 at baseFret 4 = actual fret 4.
  // D(4)=F#, G(5)=C? No, G(fret5)=C. B(4)=D#, E(4)=G#.
  // F#-C-D#-G# -- not Baug.
  //
  // Baug = B-D#-G. Standard voicing:
  // x-2-1-0-0-3 at baseFret 1:
  // A(2)=B, D(1)=D#/Eb, G(0)=G, B(0)=B, E(3)=G => B-D#-G-B-G = Baug!
  'Baug': {
    voicings: [{
      strings: [null, 2, 1, 0, 0, 3],
      fingers: [null, 2, 1, 0, 0, 3],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'advanced',
    chordType: 'triad',
  },

  // ─────────────────────────────────────────────
  // DIMINISHED 7TH CHORDS (root + m3 + dim5 + dim7)
  // dim7 interval = double-flat 7th = enharmonic major 6th
  //
  // Moveable shape 1 (A-string root): x-R-2-1-2-1 (4-string dim7)
  // Moveable shape 2 (D-string root): x-x-R-1-R-1 pattern
  // ─────────────────────────────────────────────

  // Cdim7 = C-Eb-Gb-Bbb(A)
  // x-x-1-2-1-2 at baseFret 1:
  // D(1)=Eb, G(2)=A, B(1)=C, E(2)=F#/Gb => Eb-A-C-Gb = C-Eb-Gb-A = Cdim7
  'Cdim7': {
    voicings: [{
      strings: [null, null, 1, 2, 1, 2],
      fingers: [null, null, 1, 3, 2, 4],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'advanced',
    chordType: 'seventh',
  },

  // C#dim7 / Dbdim7 = C#-E-G-Bb
  // x-x-2-3-2-3 at baseFret 1:
  // D(2)=E, G(3)=Bb, B(2)=C#, E(3)=G => E-Bb-C#-G = C#-E-G-Bb = C#dim7
  'C#dim7': {
    voicings: [{
      strings: [null, null, 2, 3, 2, 3],
      fingers: [null, null, 1, 3, 2, 4],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'advanced',
    chordType: 'seventh',
  },

  'Dbdim7': {
    voicings: [{
      strings: [null, null, 2, 3, 2, 3],
      fingers: [null, null, 1, 3, 2, 4],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'advanced',
    chordType: 'seventh',
  },

  // Ddim7 = D-F-Ab-Cb(B)
  // x-x-0-1-0-1 at baseFret 1:
  // D(0)=D, G(1)=G#/Ab, B(0)=B, E(1)=F => D-Ab-B-F = D-F-Ab-B = Ddim7
  'Ddim7': {
    voicings: [{
      strings: [null, null, 0, 1, 0, 1],
      fingers: [null, null, 0, 2, 0, 3],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'advanced',
    chordType: 'seventh',
  },

  // Ebdim7 / D#dim7 = Eb-Gb-Bbb(A)-Dbb(C)
  // x-x-1-2-1-2 at baseFret 2:
  // D(fret2)=E, G(fret3)=Bb... wait that gives E not Eb.
  // baseFret 2: relative 1 = actual fret 2.
  // D(2)=E -- that's wrong for Ebdim7.
  // Use shape on higher strings: x-x-1-2-1-2 at baseFret 1 is Cdim7.
  // Dim7 chords repeat every 3 frets. So Cdim7 = Ebdim7 = Gbdim7 = Adim7.
  // But we want the root on bottom. Let's use a different voicing.
  // x-x-1-2-1-2 baseFret 4:
  // D(fret4)=F#/Gb, G(fret5)=C, B(fret4)=D#/Eb, E(fret5)=A
  // = Gb-C-Eb-A = Eb-Gb-A-C = Ebdim7!
  'Ebdim7': {
    voicings: [{
      strings: [null, null, 1, 2, 1, 2],
      fingers: [null, null, 1, 3, 2, 4],
      barres: [],
      baseFret: 4,
    }],
    difficulty: 'advanced',
    chordType: 'seventh',
  },

  'D#dim7': {
    voicings: [{
      strings: [null, null, 1, 2, 1, 2],
      fingers: [null, null, 1, 3, 2, 4],
      barres: [],
      baseFret: 4,
    }],
    difficulty: 'advanced',
    chordType: 'seventh',
  },

  // Edim7 = E-G-Bb-Db
  // 0-1-2-0-2-0 at baseFret 1:
  // E(0)=E, A(1)=Bb, D(2)=E, G(0)=G, B(2)=C#/Db, E(0)=E
  // = E-Bb-E-G-Db-E = E-G-Bb-Db = Edim7
  'Edim7': {
    voicings: [{
      strings: [0, 1, 2, 0, 2, 0],
      fingers: [0, 1, 3, 0, 4, 0],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'advanced',
    chordType: 'seventh',
  },

  // Fdim7 = F-Ab-Cb(B)-Ebb(D)
  // x-x-1-2-1-2 at baseFret 3:
  // D(fret3)=F, G(fret4)=B, B(fret3)=D, E(fret4)=G#/Ab
  // = F-B-D-Ab = F-Ab-B-D = Fdim7
  'Fdim7': {
    voicings: [{
      strings: [null, null, 1, 2, 1, 2],
      fingers: [null, null, 1, 3, 2, 4],
      barres: [],
      baseFret: 3,
    }],
    difficulty: 'advanced',
    chordType: 'seventh',
  },

  // F#dim7 / Gbdim7 = F#-A-C-Eb
  // x-x-1-2-1-2 at baseFret 4:
  // D(fret4)=F#, G(fret5)=C, B(fret4)=Eb/D#, E(fret5)=A
  // Wait: B(fret4)=D#/Eb. Yes.
  // = F#-C-Eb-A = F#-A-C-Eb = F#dim7? Let me double-check.
  // F#dim7 = F#-A-C-Eb. The notes F#, C, Eb, A. Yes!
  // But wait, I already used baseFret 4 for Ebdim7 with the same shape above.
  // That's because dim7 is symmetric -- Ebdim7 and F#dim7 are enharmonically
  // the same chord. The shape x-x-1-2-1-2 at baseFret 4 yields {F#/Gb, C, Eb/D#, A}.
  // This set = Ebdim7 = F#dim7 = Adim7 = Cdim7 (all enharmonic).
  // For display purposes, let's use a different inversion to get F# in the bass.
  // 2-x-1-2-1-x at baseFret 1:
  // E(2)=F#, D(1)=Eb, G(2)=A, B(1)=C => F#-Eb-A-C = F#-A-C-Eb = F#dim7
  'F#dim7': {
    voicings: [{
      strings: [2, null, 1, 2, 1, null],
      fingers: [2, null, 1, 3, 1, null],
      barres: [{ fromString: 2, toString: 4, fret: 1 }],
      baseFret: 1,
    }],
    difficulty: 'advanced',
    chordType: 'seventh',
  },

  'Gbdim7': {
    voicings: [{
      strings: [2, null, 1, 2, 1, null],
      fingers: [2, null, 1, 3, 1, null],
      barres: [{ fromString: 2, toString: 4, fret: 1 }],
      baseFret: 1,
    }],
    difficulty: 'advanced',
    chordType: 'seventh',
  },

  // Gdim7 = G-Bb-Db-Fb(E)
  // 3-x-2-3-2-x at baseFret 1:
  // E(3)=G, D(2)=E, G(3)=Bb, B(2)=C#/Db => G-E-Bb-Db = G-Bb-Db-E = Gdim7
  'Gdim7': {
    voicings: [{
      strings: [3, null, 2, 3, 2, null],
      fingers: [2, null, 1, 3, 1, null],
      barres: [{ fromString: 2, toString: 4, fret: 2 }],
      baseFret: 1,
    }],
    difficulty: 'advanced',
    chordType: 'seventh',
  },

  // G#dim7 / Abdim7 = Ab-Cb(B)-D-Fb(E)
  // x-x-0-1-0-1 at baseFret 4:
  // Wait, 0 means open, not affected by baseFret. That won't work.
  // Use: 4-x-3-4-3-x baseFret 1:
  // E(4)=G#, D(3)=F, G(4)=B, B(3)=D => G#-F-B-D = G#-B-D-F = G#dim7
  // Fret span is 3-4, fits in 4 frets. But starting at fret 3 is easier as baseFret 3.
  // baseFret 3: relative => 2-x-1-2-1-x
  // E(actual 4)=G#, D(actual 3)=F, G(actual 4)=B, B(actual 3)=D
  // = G#-F-B-D = G#-B-D-F = G#dim7
  'G#dim7': {
    voicings: [{
      strings: [2, null, 1, 2, 1, null],
      fingers: [2, null, 1, 3, 1, null],
      barres: [{ fromString: 2, toString: 4, fret: 1 }],
      baseFret: 3,
    }],
    difficulty: 'advanced',
    chordType: 'seventh',
  },

  'Abdim7': {
    voicings: [{
      strings: [2, null, 1, 2, 1, null],
      fingers: [2, null, 1, 3, 1, null],
      barres: [{ fromString: 2, toString: 4, fret: 1 }],
      baseFret: 3,
    }],
    difficulty: 'advanced',
    chordType: 'seventh',
  },

  // Adim7 = A-C-Eb-Gb
  // x-0-1-2-1-2 baseFret 1:
  // A(0)=A, D(1)=Eb, G(2)=A, B(1)=C, E(2)=F#/Gb
  // = A-Eb-A-C-Gb = A-C-Eb-Gb = Adim7
  'Adim7': {
    voicings: [{
      strings: [null, 0, 1, 2, 1, 2],
      fingers: [null, 0, 1, 3, 2, 4],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'advanced',
    chordType: 'seventh',
  },

  // Bbdim7 / A#dim7 = Bb-Db-Fb(E)-Abb(G)
  // x-1-2-0-2-0 baseFret 1:
  // A(1)=Bb, D(2)=E, G(0)=G, B(2)=Db/C#, E(0)=E
  // = Bb-E-G-Db-E = Bb-Db-E-G = Bbdim7
  'Bbdim7': {
    voicings: [{
      strings: [null, 1, 2, 0, 2, 0],
      fingers: [null, 1, 3, 0, 4, 0],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'advanced',
    chordType: 'seventh',
  },

  'A#dim7': {
    voicings: [{
      strings: [null, 1, 2, 0, 2, 0],
      fingers: [null, 1, 3, 0, 4, 0],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'advanced',
    chordType: 'seventh',
  },

  // Bdim7 = B-D-F-Ab
  // x-2-3-1-3-1 baseFret 1:
  // A(2)=B, D(3)=F, G(1)=Ab/G#, B(3)=D, E(1)=F
  // = B-F-Ab-D-F = B-D-F-Ab = Bdim7
  'Bdim7': {
    voicings: [{
      strings: [null, 2, 3, 1, 3, 1],
      fingers: [null, 2, 3, 1, 4, 1],
      barres: [{ fromString: 3, toString: 5, fret: 1 }],
      baseFret: 1,
    }],
    difficulty: 'advanced',
    chordType: 'seventh',
  },

  // ─────────────────────────────────────────────
  // ADD9 CHORDS (major triad + 9th, no 7th)
  // ─────────────────────────────────────────────

  // Cadd9 = C-E-G-D
  // x-3-2-0-3-0 => x-C(3)-E(2)-G(0)-D(3)-E(0)
  'Cadd9': {
    voicings: [{
      strings: [null, 3, 2, 0, 3, 0],
      fingers: [null, 2, 1, 0, 3, 0],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'intermediate',
    chordType: 'extended',
  },

  // Dadd9 = D-F#-A-E
  // x-x-0-2-3-2 at baseFret 1:
  // D(0)=D, G(2)=A, B(3)=D, E(2)=F#
  // = D-A-D-F# -- missing E (the 9th). This is just D major.
  //
  // Correct Dadd9: x-x-4-2-3-0 at baseFret 1:
  // D(4)=F#, G(2)=A, B(3)=D, E(0)=E => F#-A-D-E = D-F#-A-E = Dadd9
  // But fret span is 0-4, tricky to display with baseFret.
  // Better: use open position 0-0-0-2-3-0 -- nope, that has E-A-D-A-D-E, not Dadd9.
  //
  // Standard Dadd9 open voicing: x-x-0-2-3-0
  // D(0)=D, G(2)=A, B(3)=D, E(0)=E => D-A-D-E
  // Missing F# (the 3rd). This is actually Dsus2, not Dadd9.
  //
  // True Dadd9 needs all of D-F#-A-E. Common voicing:
  // x-5-4-2-3-0 -- too spread for standard diagram.
  //
  // Practical Dadd9: 2-0-0-2-3-0 at baseFret 1:
  // E(2)=F#, A(0)=A, D(0)=D, G(2)=A, B(3)=D, E(0)=E
  // = F#-A-D-A-D-E => notes: D-F#-A-E = Dadd9 (F# bass = 1st inversion)
  'Dadd9': {
    voicings: [{
      strings: [null, null, 4, 2, 3, 0],
      fingers: [null, null, 4, 1, 3, 0],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'intermediate',
    chordType: 'extended',
  },

  // Eadd9 = E-G#-B-F#
  // 0-2-2-1-0-2 => E(0)-B(2)-E(2)-G#(1)-B(0)-F#(2)
  // = E-B-E-G#-B-F# = E-G#-B-F# = Eadd9
  'Eadd9': {
    voicings: [{
      strings: [0, 2, 2, 1, 0, 2],
      fingers: [0, 2, 3, 1, 0, 4],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'intermediate',
    chordType: 'extended',
  },

  // Fadd9 = F-A-C-G
  // x-x-3-2-1-3 => x-x-F(3)-A(2)-C(1)-G(3)
  // = F-A-C-G = Fadd9
  'Fadd9': {
    voicings: [{
      strings: [null, null, 3, 2, 1, 3],
      fingers: [null, null, 3, 2, 1, 4],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'intermediate',
    chordType: 'extended',
  },

  // Gadd9 = G-B-D-A
  // 3-2-0-2-0-3 => G(3)-B(2)-D(0)-A(2)-B(0)-G(3)
  // = G-B-D-A-B-G = G-B-D-A = Gadd9
  'Gadd9': {
    voicings: [{
      strings: [3, 2, 0, 2, 0, 3],
      fingers: [3, 1, 0, 2, 0, 4],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'intermediate',
    chordType: 'extended',
  },

  // Aadd9 = A-C#-E-B
  // x-0-2-4-2-0 => x-A(0)-E(2)-B(4)-C#(2)-E(0)
  // = A-E-B-C#-E = A-C#-E-B = Aadd9
  'Aadd9': {
    voicings: [{
      strings: [null, 0, 2, 4, 2, 0],
      fingers: [null, 0, 1, 4, 2, 0],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'intermediate',
    chordType: 'extended',
  },

  // Emadd9 = E-G-B-F#
  // 0-2-2-0-0-2 => E(0)-B(2)-E(2)-G(0)-B(0)-F#(2)
  // = E-B-E-G-B-F# = E-G-B-F# = Emadd9 (minor add9)
  'Emadd9': {
    voicings: [{
      strings: [0, 2, 2, 0, 0, 2],
      fingers: [0, 2, 3, 0, 0, 4],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'intermediate',
    chordType: 'extended',
  },

  // Amadd9 = A-C-E-B
  // x-0-2-2-1-0 is Am. Need the 9th (B).
  // x-0-2-0-1-0 => x-A(0)-E(2)-G(0)-C(1)-E(0) -- no B.
  // x-0-2-2-0-0 => x-A(0)-E(2)-A(2)-B(0)-E(0) -- missing C.
  // Amadd9: x-0-2-1-1-0 => x-A(0)-E(2)-G#(1)... that's G# not G. Wrong.
  // x-0-2-0-1-0 => A-E-G-C-E -- that's Am7, not Amadd9.
  // Correct Amadd9: needs A-C-E-B.
  // 0-0-2-2-0-0 => E(0)-A(0)-E(2)-A(2)-B(0)-E(0) = E-A-E-A-B-E -- missing C.
  // x-0-2-4-1-0 => A-E-B-C-E. G(fret4)=B, B(fret1)=C. = A-E-B-C-E = A-C-E-B = Amadd9!
  'Amadd9': {
    voicings: [{
      strings: [null, 0, 2, 4, 1, 0],
      fingers: [null, 0, 2, 4, 1, 0],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'intermediate',
    chordType: 'extended',
  },

  // ─────────────────────────────────────────────
  // DOMINANT 9TH CHORDS (root + 3rd + 5th + b7 + 9th)
  // ─────────────────────────────────────────────

  // C9 = C-E-G-Bb-D
  // x-3-2-3-3-3 => x-C(3)-E(2)-Bb(3)-D(3)-G(3)
  // = C-E-Bb-D-G = C-E-G-Bb-D = C9
  'C9': {
    voicings: [{
      strings: [null, 3, 2, 3, 3, 3],
      fingers: [null, 2, 1, 3, 3, 3],
      barres: [{ fromString: 3, toString: 5, fret: 3 }],
      baseFret: 1,
    }],
    difficulty: 'advanced',
    chordType: 'extended',
  },

  // D9 = D-F#-A-C-E
  // x-x-0-2-1-2 is D7. Need the 9th (E) too.
  // Partial voicing dropping the 5th: x-x-4-2-1-0 baseFret 1:
  // D(4)=F#, G(2)=A, B(1)=C, E(0)=E => F#-A-C-E. Missing D root.
  // With root: x-5-4-2-1-0: too spread.
  // Common D9 voicing: x-x-0-2-1-0 baseFret 1:
  // D(0)=D, G(2)=A, B(1)=C, E(0)=E => D-A-C-E -- missing F#.
  // That's actually a D7sus type sound. Need F#.
  //
  // Standard D9 partial: 2-0-0-2-1-0:
  // E(2)=F#, A(0)=A, D(0)=D, G(2)=A, B(1)=C, E(0)=E
  // = F#-A-D-A-C-E => D-F#-A-C-E = D9 (in inversion with F# bass)
  //
  // Better: x-5-4-5-5-5 barre at baseFret 5:
  // That's x-1-2-1-1-1 relative at baseFret 5... let me check actual frets.
  // A(5)=D, D(6)=A... wait, relative 2 at baseFret 5 = actual fret 6.
  // x-1-2-1-1-1 at baseFret 5:
  // A(fret5)=D, D(fret6)=G#... no that's wrong.
  //
  // Use the simpler partial voicing that's standard for jazz:
  // x-x-0-2-1-2 is D7. We want to add E.
  // Actually common "9th chord" voicings often omit the root (bassist plays it).
  // Clean D9: x-x-2-1-3-2 at baseFret 1? D(2)=E, G(1)=Ab... nope.
  //
  // Let's just go with the practical voicing:
  // x-5-4-5-5-5 => baseFret 4: x-2-1-2-2-2
  // A(actual 5)=D, D(actual 5)=G? No, relative 1 at baseFret 4 = fret 4.
  // x-2-1-2-2-2 at baseFret 4:
  // A(fret5)=D, D(fret4)=F#, G(fret5)=C, B(fret5)=E, E(fret5)=A
  // = D-F#-C-E-A = D-F#-A-C-E = D9!
  'D9': {
    voicings: [{
      strings: [null, 2, 1, 2, 2, 2],
      fingers: [null, 2, 1, 3, 3, 3],
      barres: [{ fromString: 3, toString: 5, fret: 2 }],
      baseFret: 4,
    }],
    difficulty: 'advanced',
    chordType: 'extended',
  },

  // E9 = E-G#-B-D-F#
  // 0-2-0-1-0-2 => E(0)-B(2)-D(0)-G#(1)-B(0)-F#(2)
  // = E-B-D-G#-B-F# = E-G#-B-D-F# = E9
  'E9': {
    voicings: [{
      strings: [0, 2, 0, 1, 0, 2],
      fingers: [0, 2, 0, 1, 0, 3],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'advanced',
    chordType: 'extended',
  },

  // G9 = G-B-D-F-A
  // 3-2-0-2-0-1 => G(3)-B(2)-D(0)-A(2)-B(0)-F(1)
  // Wait: G(2)=A, not G string. Let me re-check.
  // E(3)=G, A(2)=B, D(0)=D, G(2)=A, B(0)=B, E(1)=F
  // = G-B-D-A-B-F = G-B-D-F-A = G9
  'G9': {
    voicings: [{
      strings: [3, 2, 0, 2, 0, 1],
      fingers: [3, 2, 0, 4, 0, 1],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'advanced',
    chordType: 'extended',
  },

  // A9 = A-C#-E-G-B
  // x-0-2-4-2-3 at baseFret 1:
  // A(0)=A, D(2)=E, G(4)=B, B(2)=C#, E(3)=G
  // = A-E-B-C#-G = A-C#-E-G-B = A9
  'A9': {
    voicings: [{
      strings: [null, 0, 2, 4, 2, 3],
      fingers: [null, 0, 1, 4, 2, 3],
      barres: [],
      baseFret: 1,
    }],
    difficulty: 'advanced',
    chordType: 'extended',
  },

  // F9 = F-A-C-Eb-G
  // Use E9 shape moved up 1 fret as barre: 1-3-1-2-1-3 at baseFret 1
  // E(1)=F, A(3)=C, D(1)=Eb, G(2)=A, B(1)=C, E(3)=G
  // = F-C-Eb-A-C-G = F-A-C-Eb-G = F9
  'F9': {
    voicings: [{
      strings: [1, 3, 1, 2, 1, 3],
      fingers: [1, 3, 1, 2, 1, 4],
      barres: [{ fromString: 0, toString: 4, fret: 1 }],
      baseFret: 1,
    }],
    difficulty: 'advanced',
    chordType: 'extended',
  },

  // Bb9 = Bb-D-F-Ab-C
  // Use A9 shape barred: x-1-1-1-1-1 at baseFret 1 won't work.
  // x-1-3-1-3-1 is Bb7. Need to add the 9th (C).
  // x-1-0-1-1-1 baseFret 1: A(1)=Bb, D(0)=D, G(1)=Ab, B(1)=C, E(1)=F
  // = Bb-D-Ab-C-F = Bb-D-F-Ab-C = Bb9!
  'Bb9': {
    voicings: [{
      strings: [null, 1, 0, 1, 1, 1],
      fingers: [null, 1, 0, 1, 1, 1],
      barres: [{ fromString: 1, toString: 5, fret: 1 }],
      baseFret: 1,
    }],
    difficulty: 'advanced',
    chordType: 'extended',
  },
};
