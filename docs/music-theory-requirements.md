# GuitarWorld: Music Theory Requirements & Chord Data Model

## Table of Contents

1. [Music Theory Foundation](#1-music-theory-foundation)
2. [Diatonic Chords for All 12 Keys](#2-diatonic-chords-for-all-12-keys)
3. [Chord Fingering Data Model](#3-chord-fingering-data-model)
4. [Common Voicings with Fingering Data](#4-common-voicings-with-fingering-data)
5. [Difficulty Classification](#5-difficulty-classification)
6. [Edge Cases & Enharmonic Equivalents](#6-edge-cases--enharmonic-equivalents)
7. [Chord Progressions & Relationships](#7-chord-progressions--relationships)
8. [Circle of Fifths](#8-circle-of-fifths)
9. [Complete Data Structures](#9-complete-data-structures)

---

## 1. Music Theory Foundation

### The Chromatic Scale

All Western music is built from 12 notes. In ascending order:

```
C  C#/Db  D  D#/Eb  E  F  F#/Gb  G  G#/Ab  A  A#/Bb  B
```

Each adjacent pair is separated by a **half step** (one fret on guitar). Two half steps make a **whole step** (two frets).

### The Major Scale Formula

A major scale is built using the interval pattern: **W-W-H-W-W-W-H** (Whole-Whole-Half-Whole-Whole-Whole-Half).

Example in C major:
```
C -W-> D -W-> E -H-> F -W-> G -W-> A -W-> B -H-> C
```

This formula applied to any starting note produces the major scale in that key.

### The Nashville Number System

The Nashville Number System assigns Roman numerals to each scale degree:

| Degree | Numeral | Quality (Major Key) | Function       |
|--------|---------|---------------------|----------------|
| 1st    | I       | Major               | Tonic          |
| 2nd    | ii      | Minor               | Supertonic     |
| 3rd    | iii     | Minor               | Mediant        |
| 4th    | IV      | Major               | Subdominant    |
| 5th    | V       | Major               | Dominant       |
| 6th    | vi      | Minor               | Submediant     |
| 7th    | vii°    | Diminished          | Leading Tone   |

**Why uppercase/lowercase?** Uppercase numerals = major chords, lowercase = minor, lowercase with ° = diminished.

### Why Am is the Relative Minor of C Major

C major and A minor share the exact same notes: C D E F G A B. The relative minor of any major key starts on the 6th degree (vi). Since A is the 6th note of the C major scale, Am is the relative minor. The relationship works because:

- C major scale: C D E F G **A** B
- A natural minor scale: A B C D E F G

Same notes, different starting point (tonic). This means every major key has a "built-in" relative minor, and vice versa.

### Borrowed Chords (Modal Interchange)

Borrowed chords come from the parallel minor (or other parallel modes). In the key of C major, you can "borrow" chords from C minor:

| Borrowed Chord | Source          | Common Usage                          |
|---------------|-----------------|---------------------------------------|
| bVII (Bb)     | C Mixolydian    | Very common in rock/pop               |
| iv (Fm)       | C minor         | Adds emotional depth                  |
| bIII (Eb)     | C minor         | Common in rock progressions           |
| bVI (Ab)      | C minor         | Creates dramatic effect               |
| ii° (Ddim)    | C minor         | Jazz & classical substitution         |

These are not "wrong" notes -- they are deliberate departures from the key that create color and tension.

---

## 2. Diatonic Chords for All 12 Keys

### Major Keys - Triad Chords

| Key      | I     | ii     | iii    | IV     | V      | vi     | vii°    |
|----------|-------|--------|--------|--------|--------|--------|---------|
| C        | C     | Dm     | Em     | F      | G      | Am     | Bdim    |
| C#/Db    | Db    | Ebm    | Fm     | Gb     | Ab     | Bbm    | Cdim    |
| D        | D     | Em     | F#m    | G      | A      | Bm     | C#dim   |
| D#/Eb    | Eb    | Fm     | Gm     | Ab     | Bb     | Cm     | Ddim    |
| E        | E     | F#m    | G#m    | A      | B      | C#m    | D#dim   |
| F        | F     | Gm     | Am     | Bb     | C      | Dm     | Edim    |
| F#/Gb    | F#    | G#m    | A#m    | B      | C#     | D#m    | E#dim   |
| G        | G     | Am     | Bm     | C      | D      | Em     | F#dim   |
| G#/Ab    | Ab    | Bbm    | Cm     | Db     | Eb     | Fm     | Gdim    |
| A        | A     | Bm     | C#m    | D      | E      | F#m    | G#dim   |
| A#/Bb    | Bb    | Cm     | Dm     | Eb     | F      | Gm     | Adim    |
| B        | B     | C#m    | D#m    | E      | F#     | G#m    | A#dim   |

### Major Keys - 7th Chords

| Key      | Imaj7   | ii7     | iii7    | IVmaj7  | V7      | vi7     | viiø7     |
|----------|---------|---------|---------|---------|---------|---------|-----------|
| C        | Cmaj7   | Dm7     | Em7     | Fmaj7   | G7      | Am7     | Bm7b5     |
| C#/Db    | Dbmaj7  | Ebm7    | Fm7     | Gbmaj7  | Ab7     | Bbm7    | Cm7b5     |
| D        | Dmaj7   | Em7     | F#m7    | Gmaj7   | A7      | Bm7     | C#m7b5    |
| D#/Eb    | Ebmaj7  | Fm7     | Gm7     | Abmaj7  | Bb7     | Cm7     | Dm7b5     |
| E        | Emaj7   | F#m7    | G#m7    | Amaj7   | B7      | C#m7    | D#m7b5    |
| F        | Fmaj7   | Gm7     | Am7     | Bbmaj7  | C7      | Dm7     | Em7b5     |
| F#/Gb    | F#maj7  | G#m7    | A#m7    | Bmaj7   | C#7     | D#m7    | E#m7b5    |
| G        | Gmaj7   | Am7     | Bm7     | Cmaj7   | D7      | Em7     | F#m7b5    |
| G#/Ab    | Abmaj7  | Bbm7    | Cm7     | Dbmaj7  | Eb7     | Fm7     | Gm7b5     |
| A        | Amaj7   | Bm7     | C#m7    | Dmaj7   | E7      | F#m7    | G#m7b5    |
| A#/Bb    | Bbmaj7  | Cm7     | Dm7     | Ebmaj7  | F7      | Gm7     | Am7b5     |
| B        | Bmaj7   | C#m7    | D#m7    | Emaj7   | F#7     | G#m7    | A#m7b5    |

### Suspended Chords (Sus2, Sus4)

Suspended chords replace the 3rd with either the 2nd (sus2) or 4th (sus4). They are neither major nor minor. They can be built on any degree but are most commonly used on I, IV, and V:

| Key | Isus2 | Isus4 | IVsus2 | IVsus4 | Vsus2 | Vsus4 |
|-----|-------|-------|--------|--------|-------|-------|
| C   | Csus2 | Csus4 | Fsus2  | Fsus4  | Gsus2 | Gsus4 |
| D   | Dsus2 | Dsus4 | Gsus2  | Gsus4  | Asus2 | Asus4 |
| E   | Esus2 | Esus4 | Asus2  | Asus4  | Bsus2 | Bsus4 |
| F   | Fsus2 | Fsus4 | Bbsus2 | Bbsus4 | Csus2 | Csus4 |
| G   | Gsus2 | Gsus4 | Csus2  | Csus4  | Dsus2 | Dsus4 |
| A   | Asus2 | Asus4 | Dsus2  | Dsus4  | Esus2 | Esus4 |
| B   | Bsus2 | Bsus4 | Esus2  | Esus4  | F#sus2| F#sus4|
| Db  | Dbsus2| Dbsus4| Gbsus2 | Gbsus4 | Absus2| Absus4|
| Eb  | Ebsus2| Ebsus4| Absus2 | Absus4 | Bbsus2| Bbsus4|
| F#  | F#sus2| F#sus4| Bsus2  | Bsus4  | C#sus2| C#sus4|
| Ab  | Absus2| Absus4| Dbsus2 | Dbsus4 | Ebsus2| Ebsus4|
| Bb  | Bbsus2| Bbsus4| Ebsus2 | Ebsus4 | Fsus2 | Fsus4 |

### Natural Minor Keys - Triad Chords

| Key   | i     | ii°     | III    | iv     | v      | VI     | VII     |
|-------|-------|---------|--------|--------|--------|--------|---------|
| Am    | Am    | Bdim    | C      | Dm     | Em     | F      | G       |
| Bbm   | Bbm   | Cdim    | Db     | Ebm    | Fm     | Gb     | Ab      |
| Bm    | Bm    | C#dim   | D      | Em     | F#m    | G      | A       |
| Cm    | Cm    | Ddim    | Eb     | Fm     | Gm     | Ab     | Bb      |
| C#m   | C#m   | D#dim   | E      | F#m    | G#m    | A      | B       |
| Dm    | Dm    | Edim    | F      | Gm     | Am     | Bb     | C       |
| Ebm   | Ebm   | Fdim    | Gb     | Abm    | Bbm    | Cb     | Db      |
| Em    | Em    | F#dim   | G      | Am     | Bm     | C      | D       |
| Fm    | Fm    | Gdim    | Ab     | Bbm    | Cm     | Db     | Eb      |
| F#m   | F#m   | G#dim   | A      | Bm     | C#m    | D      | E       |
| Gm    | Gm    | Adim    | Bb     | Cm     | Dm     | Eb     | F       |
| G#m   | G#m   | A#dim   | B      | C#m    | D#m    | E      | F#      |

---

## 3. Chord Fingering Data Model

### Core Data Structure

```typescript
interface ChordVoicing {
  // Unique identifier
  id: string;                    // e.g., "c_major_open_1"

  // Chord identity
  chordName: string;             // e.g., "C", "Am7", "F#dim"
  root: string;                  // e.g., "C", "A", "F#"
  quality: ChordQuality;        // "major" | "minor" | "diminished" | "augmented" | "dominant7" | etc.
  suffix: string;               // "", "m", "7", "maj7", "m7", "dim", "aug", "sus2", "sus4", "m7b5", etc.

  // Fingering data - array of 6 values, index 0 = low E (6th string), index 5 = high E (1st string)
  strings: [number, number, number, number, number, number];
  // -1 = muted (X), 0 = open, 1-22 = fret number

  // Finger assignments - array of 6 values matching string positions
  fingers: [Finger, Finger, Finger, Finger, Finger, Finger];
  // 0 = not played / open, 1 = index, 2 = middle, 3 = ring, 4 = pinky, 5 = thumb (T)

  // Barre information (null if no barre)
  barre: BarreInfo | null;

  // Position on neck
  baseFret: number;              // 1 for open position, or starting fret for moveable shapes
                                 // When baseFret > 1, string values are relative to this position

  // Metadata
  difficulty: Difficulty;        // "beginner" | "intermediate" | "advanced"
  tags: string[];                // ["open", "cowboy", "common"], ["barre", "E-shape"], etc.
  notes: string[];               // Actual note names sounding, e.g., ["E2", "A2", "E3", "G#3", "B3", "E4"]
  intervals: string[];           // Intervals from root, e.g., ["1", "5", "1", "3", "5", "1"]
}

type ChordQuality =
  | "major"
  | "minor"
  | "diminished"
  | "augmented"
  | "dominant7"
  | "major7"
  | "minor7"
  | "minor7b5"     // half-diminished
  | "diminished7"
  | "sus2"
  | "sus4"
  | "add9"
  | "dominant9"
  | "minor9"
  | "major9"
  | "dominant13"
  | "power5";

type Finger = 0 | 1 | 2 | 3 | 4 | 5;
// 0 = not played or open string
// 1 = index finger
// 2 = middle finger
// 3 = ring finger
// 4 = pinky
// 5 = thumb

type Difficulty = "beginner" | "intermediate" | "advanced";

interface BarreInfo {
  fret: number;        // Which fret the barre is on (relative to baseFret)
  fromString: number;  // Starting string (1 = high E, 6 = low E)
  toString: number;    // Ending string
  finger: Finger;      // Which finger makes the barre (usually 1 = index)
}
```

### String Numbering Convention

```
String Index:  [0]    [1]    [2]    [3]    [4]    [5]
String Name:   E(6th) A(5th) D(4th) G(3rd) B(2nd) E(1st)
Tuning Note:   E2     A2     D3     G3     B3     E4
Thickness:     Thickest ──────────────────────> Thinnest
```

Array index 0 = lowest-pitched string (6th string, low E).
Array index 5 = highest-pitched string (1st string, high E).

### baseFret Convention

- `baseFret: 1` -- Open position. String values represent actual fret numbers.
- `baseFret: N` where N > 1 -- The chord diagram starts at fret N. String values of 1 in the array represent fret N on the actual neck, value 2 = fret N+1, etc. A value of 0 still means open string.

Example: An F# barre chord at fret 2:
```
baseFret: 2
strings: [1, 1, 3, 3, 3, 1]  // All "1"s mean fret 2 on neck, "3"s mean fret 4
```

---

## 4. Common Voicings with Fingering Data

### Open Major Chords

#### C Major
```json
{
  "id": "c_major_open",
  "chordName": "C",
  "root": "C",
  "quality": "major",
  "suffix": "",
  "strings": [-1, 3, 2, 0, 1, 0],
  "fingers": [0, 3, 2, 0, 1, 0],
  "barre": null,
  "baseFret": 1,
  "difficulty": "beginner",
  "tags": ["open", "common"],
  "notes": ["C3", "E3", "G3", "C4", "E4"],
  "intervals": ["1", "3", "5", "1", "3"]
}
```

#### D Major
```json
{
  "id": "d_major_open",
  "chordName": "D",
  "root": "D",
  "quality": "major",
  "suffix": "",
  "strings": [-1, -1, 0, 2, 3, 2],
  "fingers": [0, 0, 0, 1, 3, 2],
  "barre": null,
  "baseFret": 1,
  "difficulty": "beginner",
  "tags": ["open", "common"],
  "notes": ["D3", "A3", "D4", "F#4"],
  "intervals": ["1", "5", "1", "3"]
}
```

#### E Major
```json
{
  "id": "e_major_open",
  "chordName": "E",
  "root": "E",
  "quality": "major",
  "suffix": "",
  "strings": [0, 2, 2, 1, 0, 0],
  "fingers": [0, 2, 3, 1, 0, 0],
  "barre": null,
  "baseFret": 1,
  "difficulty": "beginner",
  "tags": ["open", "common"],
  "notes": ["E2", "B2", "E3", "G#3", "B3", "E4"],
  "intervals": ["1", "5", "1", "3", "5", "1"]
}
```

#### F Major (Barre)
```json
{
  "id": "f_major_barre",
  "chordName": "F",
  "root": "F",
  "quality": "major",
  "suffix": "",
  "strings": [1, 1, 2, 3, 3, 1],
  "fingers": [1, 1, 2, 4, 3, 1],
  "barre": { "fret": 1, "fromString": 1, "toString": 6, "finger": 1 },
  "baseFret": 1,
  "difficulty": "intermediate",
  "tags": ["barre", "E-shape", "common"],
  "notes": ["F2", "C3", "F3", "A3", "C4", "F4"],
  "intervals": ["1", "5", "1", "3", "5", "1"]
}
```

#### F Major (Easy / Partial)
```json
{
  "id": "f_major_easy",
  "chordName": "F",
  "root": "F",
  "quality": "major",
  "suffix": "",
  "strings": [-1, -1, 3, 2, 1, 1],
  "fingers": [0, 0, 3, 2, 1, 1],
  "barre": { "fret": 1, "fromString": 1, "toString": 2, "finger": 1 },
  "baseFret": 1,
  "difficulty": "beginner",
  "tags": ["open", "partial", "common"],
  "notes": ["F3", "A3", "C4", "F4"],
  "intervals": ["1", "3", "5", "1"]
}
```

#### G Major
```json
{
  "id": "g_major_open",
  "chordName": "G",
  "root": "G",
  "quality": "major",
  "suffix": "",
  "strings": [3, 2, 0, 0, 0, 3],
  "fingers": [2, 1, 0, 0, 0, 3],
  "barre": null,
  "baseFret": 1,
  "difficulty": "beginner",
  "tags": ["open", "common"],
  "notes": ["G2", "B2", "D3", "G3", "B3", "G4"],
  "intervals": ["1", "3", "5", "1", "3", "1"]
}
```

#### G Major (Alternate voicing - 4-finger)
```json
{
  "id": "g_major_open_alt",
  "chordName": "G",
  "root": "G",
  "quality": "major",
  "suffix": "",
  "strings": [3, 2, 0, 0, 3, 3],
  "fingers": [2, 1, 0, 0, 3, 4],
  "barre": null,
  "baseFret": 1,
  "difficulty": "beginner",
  "tags": ["open", "common", "alternate"],
  "notes": ["G2", "B2", "D3", "G3", "D4", "G4"],
  "intervals": ["1", "3", "5", "1", "5", "1"]
}
```

#### A Major
```json
{
  "id": "a_major_open",
  "chordName": "A",
  "root": "A",
  "quality": "major",
  "suffix": "",
  "strings": [-1, 0, 2, 2, 2, 0],
  "fingers": [0, 0, 1, 2, 3, 0],
  "barre": null,
  "baseFret": 1,
  "difficulty": "beginner",
  "tags": ["open", "common"],
  "notes": ["A2", "E3", "A3", "C#4", "E4"],
  "intervals": ["1", "5", "1", "3", "5"]
}
```

#### B Major (Barre)
```json
{
  "id": "b_major_barre",
  "chordName": "B",
  "root": "B",
  "quality": "major",
  "suffix": "",
  "strings": [-1, 1, 3, 3, 3, 1],
  "fingers": [0, 1, 2, 3, 4, 1],
  "barre": { "fret": 1, "fromString": 1, "toString": 5, "finger": 1 },
  "baseFret": 2,
  "difficulty": "intermediate",
  "tags": ["barre", "A-shape", "common"],
  "notes": ["B2", "F#3", "B3", "D#4", "F#4"],
  "intervals": ["1", "5", "1", "3", "5"]
}
```

### Open Minor Chords

#### Am
```json
{
  "id": "am_open",
  "chordName": "Am",
  "root": "A",
  "quality": "minor",
  "suffix": "m",
  "strings": [-1, 0, 2, 2, 1, 0],
  "fingers": [0, 0, 2, 3, 1, 0],
  "barre": null,
  "baseFret": 1,
  "difficulty": "beginner",
  "tags": ["open", "common"],
  "notes": ["A2", "E3", "A3", "C4", "E4"],
  "intervals": ["1", "5", "1", "b3", "5"]
}
```

#### Dm
```json
{
  "id": "dm_open",
  "chordName": "Dm",
  "root": "D",
  "quality": "minor",
  "suffix": "m",
  "strings": [-1, -1, 0, 2, 3, 1],
  "fingers": [0, 0, 0, 2, 3, 1],
  "barre": null,
  "baseFret": 1,
  "difficulty": "beginner",
  "tags": ["open", "common"],
  "notes": ["D3", "A3", "D4", "F4"],
  "intervals": ["1", "5", "1", "b3"]
}
```

#### Em
```json
{
  "id": "em_open",
  "chordName": "Em",
  "root": "E",
  "quality": "minor",
  "suffix": "m",
  "strings": [0, 2, 2, 0, 0, 0],
  "fingers": [0, 2, 3, 0, 0, 0],
  "barre": null,
  "baseFret": 1,
  "difficulty": "beginner",
  "tags": ["open", "common", "easiest"],
  "notes": ["E2", "B2", "E3", "G3", "B3", "E4"],
  "intervals": ["1", "5", "1", "b3", "5", "1"]
}
```

#### Bm (Barre)
```json
{
  "id": "bm_barre",
  "chordName": "Bm",
  "root": "B",
  "quality": "minor",
  "suffix": "m",
  "strings": [-1, 1, 3, 3, 2, 1],
  "fingers": [0, 1, 3, 4, 2, 1],
  "barre": { "fret": 1, "fromString": 1, "toString": 5, "finger": 1 },
  "baseFret": 2,
  "difficulty": "intermediate",
  "tags": ["barre", "Am-shape", "common"],
  "notes": ["B2", "F#3", "B3", "D4", "F#4"],
  "intervals": ["1", "5", "1", "b3", "5"]
}
```

#### Cm (Barre)
```json
{
  "id": "cm_barre",
  "chordName": "Cm",
  "root": "C",
  "quality": "minor",
  "suffix": "m",
  "strings": [-1, 1, 3, 3, 2, 1],
  "fingers": [0, 1, 3, 4, 2, 1],
  "barre": { "fret": 1, "fromString": 1, "toString": 5, "finger": 1 },
  "baseFret": 3,
  "difficulty": "intermediate",
  "tags": ["barre", "Am-shape", "common"],
  "notes": ["C3", "G3", "C4", "Eb4", "G4"],
  "intervals": ["1", "5", "1", "b3", "5"]
}
```

#### F#m
```json
{
  "id": "f_sharp_m_barre",
  "chordName": "F#m",
  "root": "F#",
  "quality": "minor",
  "suffix": "m",
  "strings": [1, 1, 3, 3, 2, 1],
  "fingers": [1, 1, 3, 4, 2, 1],
  "barre": { "fret": 1, "fromString": 1, "toString": 6, "finger": 1 },
  "baseFret": 2,
  "difficulty": "intermediate",
  "tags": ["barre", "Em-shape", "common"],
  "notes": ["F#2", "C#3", "F#3", "A3", "C#4", "F#4"],
  "intervals": ["1", "5", "1", "b3", "5", "1"]
}
```

#### Gm (Barre)
```json
{
  "id": "gm_barre",
  "chordName": "Gm",
  "root": "G",
  "quality": "minor",
  "suffix": "m",
  "strings": [1, 1, 3, 3, 2, 1],
  "fingers": [1, 1, 3, 4, 2, 1],
  "barre": { "fret": 1, "fromString": 1, "toString": 6, "finger": 1 },
  "baseFret": 3,
  "difficulty": "intermediate",
  "tags": ["barre", "Em-shape", "common"],
  "notes": ["G2", "D3", "G3", "Bb3", "D4", "G4"],
  "intervals": ["1", "5", "1", "b3", "5", "1"]
}
```

### Seventh Chords

#### C7
```json
{
  "id": "c7_open",
  "chordName": "C7",
  "root": "C",
  "quality": "dominant7",
  "suffix": "7",
  "strings": [-1, 3, 2, 3, 1, 0],
  "fingers": [0, 3, 2, 4, 1, 0],
  "barre": null,
  "baseFret": 1,
  "difficulty": "intermediate",
  "tags": ["open", "common"],
  "notes": ["C3", "E3", "Bb3", "C4", "E4"],
  "intervals": ["1", "3", "b7", "1", "3"]
}
```

#### D7
```json
{
  "id": "d7_open",
  "chordName": "D7",
  "root": "D",
  "quality": "dominant7",
  "suffix": "7",
  "strings": [-1, -1, 0, 2, 1, 2],
  "fingers": [0, 0, 0, 2, 1, 3],
  "barre": null,
  "baseFret": 1,
  "difficulty": "beginner",
  "tags": ["open", "common"],
  "notes": ["D3", "A3", "C4", "F#4"],
  "intervals": ["1", "5", "b7", "3"]
}
```

#### E7
```json
{
  "id": "e7_open",
  "chordName": "E7",
  "root": "E",
  "quality": "dominant7",
  "suffix": "7",
  "strings": [0, 2, 0, 1, 0, 0],
  "fingers": [0, 2, 0, 1, 0, 0],
  "barre": null,
  "baseFret": 1,
  "difficulty": "beginner",
  "tags": ["open", "common"],
  "notes": ["E2", "B2", "D3", "G#3", "B3", "E4"],
  "intervals": ["1", "5", "b7", "3", "5", "1"]
}
```

#### G7
```json
{
  "id": "g7_open",
  "chordName": "G7",
  "root": "G",
  "quality": "dominant7",
  "suffix": "7",
  "strings": [3, 2, 0, 0, 0, 1],
  "fingers": [3, 2, 0, 0, 0, 1],
  "barre": null,
  "baseFret": 1,
  "difficulty": "beginner",
  "tags": ["open", "common"],
  "notes": ["G2", "B2", "D3", "G3", "B3", "F4"],
  "intervals": ["1", "3", "5", "1", "3", "b7"]
}
```

#### A7
```json
{
  "id": "a7_open",
  "chordName": "A7",
  "root": "A",
  "quality": "dominant7",
  "suffix": "7",
  "strings": [-1, 0, 2, 0, 2, 0],
  "fingers": [0, 0, 2, 0, 3, 0],
  "barre": null,
  "baseFret": 1,
  "difficulty": "beginner",
  "tags": ["open", "common"],
  "notes": ["A2", "E3", "G3", "C#4", "E4"],
  "intervals": ["1", "5", "b7", "3", "5"]
}
```

#### B7
```json
{
  "id": "b7_open",
  "chordName": "B7",
  "root": "B",
  "quality": "dominant7",
  "suffix": "7",
  "strings": [-1, 2, 1, 2, 0, 2],
  "fingers": [0, 2, 1, 3, 0, 4],
  "barre": null,
  "baseFret": 1,
  "difficulty": "intermediate",
  "tags": ["open", "common"],
  "notes": ["B2", "D#3", "A3", "B3", "D#4"],
  "intervals": ["1", "3", "b7", "1", "3"]
}
```

#### Am7
```json
{
  "id": "am7_open",
  "chordName": "Am7",
  "root": "A",
  "quality": "minor7",
  "suffix": "m7",
  "strings": [-1, 0, 2, 0, 1, 0],
  "fingers": [0, 0, 2, 0, 1, 0],
  "barre": null,
  "baseFret": 1,
  "difficulty": "beginner",
  "tags": ["open", "common"],
  "notes": ["A2", "E3", "G3", "C4", "E4"],
  "intervals": ["1", "5", "b7", "b3", "5"]
}
```

#### Em7
```json
{
  "id": "em7_open",
  "chordName": "Em7",
  "root": "E",
  "quality": "minor7",
  "suffix": "m7",
  "strings": [0, 2, 2, 0, 3, 0],
  "fingers": [0, 2, 3, 0, 4, 0],
  "barre": null,
  "baseFret": 1,
  "difficulty": "beginner",
  "tags": ["open", "common"],
  "notes": ["E2", "B2", "E3", "G3", "D4", "E4"],
  "intervals": ["1", "5", "1", "b3", "b7", "1"]
}
```

#### Dm7
```json
{
  "id": "dm7_open",
  "chordName": "Dm7",
  "root": "D",
  "quality": "minor7",
  "suffix": "m7",
  "strings": [-1, -1, 0, 2, 1, 1],
  "fingers": [0, 0, 0, 2, 1, 1],
  "barre": { "fret": 1, "fromString": 1, "toString": 2, "finger": 1 },
  "baseFret": 1,
  "difficulty": "beginner",
  "tags": ["open", "common"],
  "notes": ["D3", "A3", "C4", "F4"],
  "intervals": ["1", "5", "b7", "b3"]
}
```

#### Cmaj7
```json
{
  "id": "cmaj7_open",
  "chordName": "Cmaj7",
  "root": "C",
  "quality": "major7",
  "suffix": "maj7",
  "strings": [-1, 3, 2, 0, 0, 0],
  "fingers": [0, 3, 2, 0, 0, 0],
  "barre": null,
  "baseFret": 1,
  "difficulty": "beginner",
  "tags": ["open", "common"],
  "notes": ["C3", "E3", "G3", "B3", "E4"],
  "intervals": ["1", "3", "5", "7", "3"]
}
```

#### Fmaj7
```json
{
  "id": "fmaj7_open",
  "chordName": "Fmaj7",
  "root": "F",
  "quality": "major7",
  "suffix": "maj7",
  "strings": [-1, -1, 3, 2, 1, 0],
  "fingers": [0, 0, 3, 2, 1, 0],
  "barre": null,
  "baseFret": 1,
  "difficulty": "beginner",
  "tags": ["open", "common"],
  "notes": ["F3", "A3", "C4", "E4"],
  "intervals": ["1", "3", "5", "7"]
}
```

### Suspended Chords

#### Dsus2
```json
{
  "id": "dsus2_open",
  "chordName": "Dsus2",
  "root": "D",
  "quality": "sus2",
  "suffix": "sus2",
  "strings": [-1, -1, 0, 2, 3, 0],
  "fingers": [0, 0, 0, 1, 3, 0],
  "barre": null,
  "baseFret": 1,
  "difficulty": "beginner",
  "tags": ["open", "common"],
  "notes": ["D3", "A3", "D4", "E4"],
  "intervals": ["1", "5", "1", "2"]
}
```

#### Dsus4
```json
{
  "id": "dsus4_open",
  "chordName": "Dsus4",
  "root": "D",
  "quality": "sus4",
  "suffix": "sus4",
  "strings": [-1, -1, 0, 2, 3, 3],
  "fingers": [0, 0, 0, 1, 2, 3],
  "barre": null,
  "baseFret": 1,
  "difficulty": "beginner",
  "tags": ["open", "common"],
  "notes": ["D3", "A3", "D4", "G4"],
  "intervals": ["1", "5", "1", "4"]
}
```

#### Asus2
```json
{
  "id": "asus2_open",
  "chordName": "Asus2",
  "root": "A",
  "quality": "sus2",
  "suffix": "sus2",
  "strings": [-1, 0, 2, 2, 0, 0],
  "fingers": [0, 0, 1, 2, 0, 0],
  "barre": null,
  "baseFret": 1,
  "difficulty": "beginner",
  "tags": ["open", "common"],
  "notes": ["A2", "E3", "A3", "B3", "E4"],
  "intervals": ["1", "5", "1", "2", "5"]
}
```

#### Asus4
```json
{
  "id": "asus4_open",
  "chordName": "Asus4",
  "root": "A",
  "quality": "sus4",
  "suffix": "sus4",
  "strings": [-1, 0, 2, 2, 3, 0],
  "fingers": [0, 0, 1, 2, 3, 0],
  "barre": null,
  "baseFret": 1,
  "difficulty": "beginner",
  "tags": ["open", "common"],
  "notes": ["A2", "E3", "A3", "D4", "E4"],
  "intervals": ["1", "5", "1", "4", "5"]
}
```

#### Esus4
```json
{
  "id": "esus4_open",
  "chordName": "Esus4",
  "root": "E",
  "quality": "sus4",
  "suffix": "sus4",
  "strings": [0, 2, 2, 2, 0, 0],
  "fingers": [0, 2, 3, 4, 0, 0],
  "barre": null,
  "baseFret": 1,
  "difficulty": "beginner",
  "tags": ["open", "common"],
  "notes": ["E2", "B2", "E3", "A3", "B3", "E4"],
  "intervals": ["1", "5", "1", "4", "5", "1"]
}
```

### Power Chords

#### E5
```json
{
  "id": "e5_power",
  "chordName": "E5",
  "root": "E",
  "quality": "power5",
  "suffix": "5",
  "strings": [0, 2, 2, -1, -1, -1],
  "fingers": [0, 1, 2, 0, 0, 0],
  "barre": null,
  "baseFret": 1,
  "difficulty": "beginner",
  "tags": ["power", "rock", "common"],
  "notes": ["E2", "B2", "E3"],
  "intervals": ["1", "5", "1"]
}
```

#### A5
```json
{
  "id": "a5_power",
  "chordName": "A5",
  "root": "A",
  "quality": "power5",
  "suffix": "5",
  "strings": [-1, 0, 2, 2, -1, -1],
  "fingers": [0, 0, 1, 2, 0, 0],
  "barre": null,
  "baseFret": 1,
  "difficulty": "beginner",
  "tags": ["power", "rock", "common"],
  "notes": ["A2", "E3", "A3"],
  "intervals": ["1", "5", "1"]
}
```

### Moveable Barre Chord Shapes (CAGED System)

These shapes can be moved up and down the neck. The root note position determines the chord name.

#### E-Shape Major Barre (Root on 6th string)
```json
{
  "id": "e_shape_major_barre_template",
  "chordName": "F",
  "root": "F",
  "quality": "major",
  "suffix": "",
  "strings": [1, 1, 2, 3, 3, 1],
  "fingers": [1, 1, 2, 4, 3, 1],
  "barre": { "fret": 1, "fromString": 1, "toString": 6, "finger": 1 },
  "baseFret": 1,
  "difficulty": "intermediate",
  "tags": ["barre", "E-shape", "CAGED", "moveable"],
  "notes": ["F2", "C3", "F3", "A3", "C4", "F4"],
  "intervals": ["1", "5", "1", "3", "5", "1"]
}
```

#### A-Shape Major Barre (Root on 5th string)
```json
{
  "id": "a_shape_major_barre_template",
  "chordName": "Bb",
  "root": "Bb",
  "quality": "major",
  "suffix": "",
  "strings": [-1, 1, 3, 3, 3, 1],
  "fingers": [0, 1, 2, 3, 4, 1],
  "barre": { "fret": 1, "fromString": 1, "toString": 5, "finger": 1 },
  "baseFret": 1,
  "difficulty": "intermediate",
  "tags": ["barre", "A-shape", "CAGED", "moveable"],
  "notes": ["Bb2", "F3", "Bb3", "D4", "F4"],
  "intervals": ["1", "5", "1", "3", "5"]
}
```

#### Em-Shape Minor Barre (Root on 6th string)
```json
{
  "id": "em_shape_minor_barre_template",
  "chordName": "Fm",
  "root": "F",
  "quality": "minor",
  "suffix": "m",
  "strings": [1, 1, 3, 3, 2, 1],
  "fingers": [1, 1, 3, 4, 2, 1],
  "barre": { "fret": 1, "fromString": 1, "toString": 6, "finger": 1 },
  "baseFret": 1,
  "difficulty": "intermediate",
  "tags": ["barre", "Em-shape", "CAGED", "moveable"],
  "notes": ["F2", "C3", "F3", "Ab3", "C4", "F4"],
  "intervals": ["1", "5", "1", "b3", "5", "1"]
}
```

#### Am-Shape Minor Barre (Root on 5th string)
```json
{
  "id": "am_shape_minor_barre_template",
  "chordName": "Bbm",
  "root": "Bb",
  "quality": "minor",
  "suffix": "m",
  "strings": [-1, 1, 3, 3, 2, 1],
  "fingers": [0, 1, 3, 4, 2, 1],
  "barre": { "fret": 1, "fromString": 1, "toString": 5, "finger": 1 },
  "baseFret": 1,
  "difficulty": "intermediate",
  "tags": ["barre", "Am-shape", "CAGED", "moveable"],
  "notes": ["Bb2", "F3", "Bb3", "Db4", "F4"],
  "intervals": ["1", "5", "1", "b3", "5"]
}
```

---

## 5. Difficulty Classification

### Beginner (Level 1)

**Criteria:**
- Open chords only (uses open strings, first 3 frets)
- No barre required
- Maximum 3 fretted notes
- Common finger patterns

**Chords in this category:**
- Major: C, D, E, G, A
- Minor: Am, Dm, Em
- Seventh: D7, E7, G7, A7, Am7, Em7, Cmaj7, Fmaj7
- Suspended: Dsus2, Dsus4, Asus2, Asus4, Esus4
- Power: E5, A5 (any power chord shape)

### Intermediate (Level 2)

**Criteria:**
- Requires barre technique
- Standard barre shapes (E-shape, A-shape, Em-shape, Am-shape)
- Up to 4 fretted notes with stretches
- Includes basic 7th chord barre forms

**Chords in this category:**
- Major barre: F, Bb, B, C#, Eb, F#, Ab (any chord requiring barre)
- Minor barre: Bm, Cm, F#m, Gm, Bbm, C#m
- Dominant 7th barre: B7, C7, F7
- Minor 7th barre: Bm7, Cm7, F#m7

### Advanced (Level 3)

**Criteria:**
- Extended chords (9ths, 11ths, 13ths)
- Jazz voicings (rootless voicings, shell voicings)
- Unusual stretches (4+ fret span)
- Diminished and augmented chords
- Altered chords (b5, #5, b9, #9)

**Chords in this category:**
- Extended: Cmaj9, Dm9, G13, Am11
- Altered: G7#5, C7b9, D7#9
- Diminished: Bdim7, Cdim7 (full diminished)
- Augmented: Caug, Eaug
- Jazz voicings: Rootless Cmaj9, Shell voicing Dm7

### Difficulty Scoring Algorithm

```typescript
function calculateDifficulty(voicing: ChordVoicing): Difficulty {
  let score = 0;

  // Barre adds difficulty
  if (voicing.barre) score += 3;

  // Count fretted strings
  const frettedStrings = voicing.strings.filter(s => s > 0).length;
  score += Math.max(0, frettedStrings - 3); // penalty for 4+ fretted strings

  // Fret span adds difficulty
  const frettedFrets = voicing.strings.filter(s => s > 0);
  if (frettedFrets.length > 0) {
    const span = Math.max(...frettedFrets) - Math.min(...frettedFrets);
    if (span >= 4) score += 3;
    else if (span >= 3) score += 1;
  }

  // High position adds slight difficulty
  if (voicing.baseFret > 5) score += 1;

  // Muted interior strings are harder
  const hasInteriorMute = voicing.strings.some((s, i) => {
    if (s !== -1) return false;
    const before = voicing.strings.slice(0, i).some(v => v >= 0);
    const after = voicing.strings.slice(i + 1).some(v => v >= 0);
    return before && after;
  });
  if (hasInteriorMute) score += 2;

  if (score <= 1) return "beginner";
  if (score <= 5) return "intermediate";
  return "advanced";
}
```

---

## 6. Edge Cases & Enharmonic Equivalents

### Enharmonic Pairs

These note pairs sound identical but have different names depending on context:

| Sharp Name | Flat Name | Preferred In Keys                    |
|-----------|-----------|--------------------------------------|
| C#        | Db        | Db preferred (5 flats vs 7 sharps)   |
| D#        | Eb        | Eb preferred (3 flats vs sharp keys) |
| F#        | Gb        | F# slightly preferred (6 sharps = 6 flats) |
| G#        | Ab        | Ab preferred (4 flats vs sharp keys) |
| A#        | Bb        | Bb preferred (2 flats vs sharp keys) |

**Implementation rule:** Store both names. Display based on context:
- When showing chords in a key, use the name consistent with that key's accidentals
- Keys with sharps: G, D, A, E, B, F# -- use sharp names
- Keys with flats: F, Bb, Eb, Ab, Db, Gb -- use flat names
- The key of C has no sharps or flats

```typescript
const ENHARMONIC_MAP: Record<string, string> = {
  "C#": "Db", "Db": "C#",
  "D#": "Eb", "Eb": "D#",
  "F#": "Gb", "Gb": "F#",
  "G#": "Ab", "Ab": "G#",
  "A#": "Bb", "Bb": "A#",
  // Edge cases that arise in theory but rarely in practice:
  "E#": "F",  "F": "E#",   // E# = F
  "B#": "C",  "C": "B#",   // B# = C
  "Fb": "E",  "E": "Fb",   // Fb = E
  "Cb": "B",  "B": "Cb",   // Cb = B
};
```

### Key Signature Data

```typescript
const KEY_SIGNATURES: Record<string, { accidentals: string; count: number; type: "sharp" | "flat" | "none" }> = {
  "C":  { accidentals: "",                      count: 0, type: "none" },
  "G":  { accidentals: "F#",                    count: 1, type: "sharp" },
  "D":  { accidentals: "F# C#",                 count: 2, type: "sharp" },
  "A":  { accidentals: "F# C# G#",              count: 3, type: "sharp" },
  "E":  { accidentals: "F# C# G# D#",           count: 4, type: "sharp" },
  "B":  { accidentals: "F# C# G# D# A#",        count: 5, type: "sharp" },
  "F#": { accidentals: "F# C# G# D# A# E#",     count: 6, type: "sharp" },
  "F":  { accidentals: "Bb",                    count: 1, type: "flat" },
  "Bb": { accidentals: "Bb Eb",                 count: 2, type: "flat" },
  "Eb": { accidentals: "Bb Eb Ab",              count: 3, type: "flat" },
  "Ab": { accidentals: "Bb Eb Ab Db",           count: 4, type: "flat" },
  "Db": { accidentals: "Bb Eb Ab Db Gb",        count: 5, type: "flat" },
  "Gb": { accidentals: "Bb Eb Ab Db Gb Cb",     count: 6, type: "flat" },
};
```

### Chords with Multiple Common Names

| Chord      | Alternate Names                | Notes                            |
|-----------|-------------------------------|----------------------------------|
| Cmaj7      | CΔ7, CM7                     | Triangle delta is jazz notation  |
| Cm7b5      | Cø, Cø7, C half-dim          | Half-diminished                  |
| Cdim7      | C°7                          | Full diminished 7th              |
| C7         | Cdom7                        | Dominant 7th                     |
| Caug       | C+, C(#5)                    | Augmented triad                  |
| Csus4      | Csus                         | "sus" alone usually means sus4   |
| Cadd9      | Cadd2                        | Same notes, different voicing    |
| C5         | C(no3), C power              | Power chord                      |

### Tuning Assumption

All data assumes **standard tuning: EADGBE** (low to high).

```typescript
const STANDARD_TUNING = {
  strings: [
    { index: 0, note: "E", octave: 2, midiNote: 40, name: "6th string (low E)" },
    { index: 1, note: "A", octave: 2, midiNote: 45, name: "5th string (A)" },
    { index: 2, note: "D", octave: 3, midiNote: 50, name: "4th string (D)" },
    { index: 3, note: "G", octave: 3, midiNote: 55, name: "3rd string (G)" },
    { index: 4, note: "B", octave: 3, midiNote: 59, name: "2nd string (B)" },
    { index: 5, note: "E", octave: 4, midiNote: 64, name: "1st string (high E)" },
  ],
  name: "Standard",
  id: "standard"
};
```

---

## 7. Chord Progressions & Relationships

### Common Progressions by Function

#### Pop / Rock Essentials

| Name                | Numerals          | In Key of C             | In Key of G             | Genre/Usage                  |
|---------------------|-------------------|-------------------------|-------------------------|------------------------------|
| The Classic         | I - V - vi - IV   | C - G - Am - F          | G - D - Em - C          | Pop (most used progression)  |
| 50s Doo-Wop         | I - vi - IV - V   | C - Am - F - G          | G - Em - C - D          | Pop, ballads                 |
| Blues               | I - IV - V        | C - F - G               | G - C - D               | Blues, rock                  |
| Three Chord         | I - IV - V - I    | C - F - G - C           | G - C - D - G           | Country, folk, rock          |
| Sensitive           | vi - IV - I - V   | Am - F - C - G          | Em - C - G - D          | Modern pop                   |
| Minor Mood          | i - iv - v        | Am - Dm - Em            | Em - Am - Bm            | Minor key songs              |
| Andalusian Cadence  | i - VII - VI - V  | Am - G - F - E          | Em - D - C - B          | Flamenco, rock               |
| Pachelbel Canon     | I - V - vi - iii - IV - I - IV - V | C-G-Am-Em-F-C-F-G | G-D-Em-Bm-C-G-C-D | Classical, pop          |

#### Jazz Standards

| Name                | Numerals               | In Key of C                   |
|---------------------|------------------------|-------------------------------|
| ii - V - I          | ii7 - V7 - Imaj7       | Dm7 - G7 - Cmaj7             |
| I - vi - ii - V     | Imaj7 - vi7 - ii7 - V7 | Cmaj7 - Am7 - Dm7 - G7       |
| Rhythm Changes (A)  | I - vi - ii - V        | Cmaj7 - Am7 - Dm7 - G7       |
| Blues (Jazz)        | I7 - IV7 - I7 - V7     | C7 - F7 - C7 - G7            |
| Minor ii-V-i        | iiø7 - V7 - i          | Dm7b5 - G7 - Cm              |

#### Rock / Alternative

| Name                | Numerals          | In Key of C             |
|---------------------|-------------------|-------------------------|
| Grunge              | I - bVII - IV     | C - Bb - F              |
| Power Progression   | I5 - IV5 - V5     | C5 - F5 - G5            |
| Modal Rock          | I - bVII - bVI    | C - Bb - Ab             |
| Mixolydian Rock     | I - bVII - IV     | C - Bb - F              |

### Relative Minor/Major Relationships

Every major key has a relative minor (and vice versa). They share the same key signature:

| Major Key | Relative Minor | Shared Notes                    |
|-----------|---------------|----------------------------------|
| C         | Am            | C D E F G A B                    |
| Db        | Bbm           | Db Eb F Gb Ab Bb C              |
| D         | Bm            | D E F# G A B C#                 |
| Eb        | Cm            | Eb F G Ab Bb C D                |
| E         | C#m           | E F# G# A B C# D#              |
| F         | Dm            | F G A Bb C D E                  |
| F#        | D#m           | F# G# A# B C# D# E#            |
| G         | Em            | G A B C D E F#                  |
| Ab        | Fm            | Ab Bb C Db Eb F G              |
| A         | F#m           | A B C# D E F# G#              |
| Bb        | Gm            | Bb C D Eb F G A                |
| B         | G#m           | B C# D# E F# G# A#            |

**Finding the relative minor:** Go down 3 half steps (a minor 3rd) from the major key root.
**Finding the relative major:** Go up 3 half steps from the minor key root.

---

## 8. Circle of Fifths

### Data Structure

```typescript
const CIRCLE_OF_FIFTHS = {
  // Clockwise from C (each is a perfect 5th up)
  majorKeys: ["C", "G", "D", "A", "E", "B", "F#/Gb", "Db", "Ab", "Eb", "Bb", "F"],
  // Inner circle - relative minors
  minorKeys: ["Am", "Em", "Bm", "F#m", "C#m", "G#m", "D#m/Ebm", "Bbm", "Fm", "Cm", "Gm", "Dm"],

  // Positions (0 = top/12 o'clock, proceeding clockwise)
  positions: [
    { degree: 0,  major: "C",     minor: "Am",   sharps: 0, flats: 0 },
    { degree: 1,  major: "G",     minor: "Em",   sharps: 1, flats: 0 },
    { degree: 2,  major: "D",     minor: "Bm",   sharps: 2, flats: 0 },
    { degree: 3,  major: "A",     minor: "F#m",  sharps: 3, flats: 0 },
    { degree: 4,  major: "E",     minor: "C#m",  sharps: 4, flats: 0 },
    { degree: 5,  major: "B",     minor: "G#m",  sharps: 5, flats: 0 },
    { degree: 6,  major: "F#/Gb", minor: "D#m/Ebm", sharps: 6, flats: 6 }, // enharmonic
    { degree: 7,  major: "Db",    minor: "Bbm",  sharps: 0, flats: 5 },
    { degree: 8,  major: "Ab",    minor: "Fm",   sharps: 0, flats: 4 },
    { degree: 9,  major: "Eb",    minor: "Cm",   sharps: 0, flats: 3 },
    { degree: 10, major: "Bb",    minor: "Gm",   sharps: 0, flats: 2 },
    { degree: 11, major: "F",     minor: "Dm",   sharps: 0, flats: 1 },
  ],

  // Adjacent keys are closely related (good for modulation)
  // Keys directly opposite are maximally distant (tritone apart)
};
```

### Circle of Fifths Relationships

- **Adjacent keys** (one step clockwise or counterclockwise) differ by only one accidental and are closely related. Modulation between them sounds natural.
- **Opposite keys** are a tritone apart (6 half steps) and are maximally distant harmonically.
- **Moving clockwise** = going up a perfect 5th = adding one sharp (or removing one flat).
- **Moving counterclockwise** = going up a perfect 4th = adding one flat (or removing one sharp).

---

## 9. Complete Data Structures

### Master Chord Type Registry

```typescript
const CHORD_TYPES = [
  // Triads
  { suffix: "",      name: "Major",       formula: [0, 4, 7],           quality: "major" },
  { suffix: "m",     name: "Minor",       formula: [0, 3, 7],           quality: "minor" },
  { suffix: "dim",   name: "Diminished",  formula: [0, 3, 6],           quality: "diminished" },
  { suffix: "aug",   name: "Augmented",   formula: [0, 4, 8],           quality: "augmented" },
  { suffix: "5",     name: "Power Chord", formula: [0, 7],              quality: "power5" },

  // Suspended
  { suffix: "sus2",  name: "Suspended 2nd", formula: [0, 2, 7],         quality: "sus2" },
  { suffix: "sus4",  name: "Suspended 4th", formula: [0, 5, 7],         quality: "sus4" },

  // Seventh chords
  { suffix: "7",     name: "Dominant 7th",   formula: [0, 4, 7, 10],    quality: "dominant7" },
  { suffix: "maj7",  name: "Major 7th",      formula: [0, 4, 7, 11],    quality: "major7" },
  { suffix: "m7",    name: "Minor 7th",      formula: [0, 3, 7, 10],    quality: "minor7" },
  { suffix: "m7b5",  name: "Half-Diminished", formula: [0, 3, 6, 10],   quality: "minor7b5" },
  { suffix: "dim7",  name: "Diminished 7th", formula: [0, 3, 6, 9],     quality: "diminished7" },
  { suffix: "mMaj7", name: "Minor Major 7th", formula: [0, 3, 7, 11],   quality: "minorMajor7" },

  // Extended
  { suffix: "add9",  name: "Add 9",         formula: [0, 4, 7, 14],     quality: "add9" },
  { suffix: "9",     name: "Dominant 9th",   formula: [0, 4, 7, 10, 14], quality: "dominant9" },
  { suffix: "m9",    name: "Minor 9th",      formula: [0, 3, 7, 10, 14], quality: "minor9" },
  { suffix: "maj9",  name: "Major 9th",      formula: [0, 4, 7, 11, 14], quality: "major9" },
  { suffix: "11",    name: "Dominant 11th",  formula: [0, 4, 7, 10, 14, 17], quality: "dominant11" },
  { suffix: "13",    name: "Dominant 13th",  formula: [0, 4, 7, 10, 14, 21], quality: "dominant13" },

  // Altered
  { suffix: "7b5",   name: "7 Flat 5",      formula: [0, 4, 6, 10],     quality: "dominant7b5" },
  { suffix: "7#5",   name: "7 Sharp 5",     formula: [0, 4, 8, 10],     quality: "dominant7sharp5" },
  { suffix: "7b9",   name: "7 Flat 9",      formula: [0, 4, 7, 10, 13], quality: "dominant7b9" },
  { suffix: "7#9",   name: "7 Sharp 9",     formula: [0, 4, 7, 10, 15], quality: "dominant7sharp9" },

  // Add chords
  { suffix: "6",     name: "Major 6th",     formula: [0, 4, 7, 9],      quality: "major6" },
  { suffix: "m6",    name: "Minor 6th",     formula: [0, 3, 7, 9],      quality: "minor6" },
];
```

### Root Notes with Semitone Values

```typescript
const NOTE_VALUES: Record<string, number> = {
  "C": 0, "C#": 1, "Db": 1,
  "D": 2, "D#": 3, "Eb": 3,
  "E": 4, "Fb": 4,
  "F": 5, "E#": 5, "F#": 6, "Gb": 6,
  "G": 7, "G#": 8, "Ab": 8,
  "A": 9, "A#": 10, "Bb": 10,
  "B": 11, "Cb": 11, "B#": 0,
};

// Canonical ordering for display (using sharps)
const CHROMATIC_SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// Canonical ordering for display (using flats)
const CHROMATIC_FLAT = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
```

### Fretboard Note Map (Standard Tuning, Frets 0-22)

For computing what note is at any string/fret position:

```typescript
function getNoteAtPosition(stringIndex: number, fret: number): { note: string; octave: number; midi: number } {
  const openStringMidi = [40, 45, 50, 55, 59, 64]; // E2, A2, D3, G3, B3, E4
  const midi = openStringMidi[stringIndex] + fret;
  const noteIndex = midi % 12;
  const octave = Math.floor(midi / 12) - 1;
  const note = CHROMATIC_SHARP[noteIndex];
  return { note, octave, midi };
}
```

### CAGED System Root Note Positions

For generating barre chords programmatically, the root note positions in each CAGED shape:

```typescript
const CAGED_ROOT_STRINGS = {
  "E-shape":  { rootString: 0, majorTemplate: [0, 2, 2, 1, 0, 0] },  // Root on 6th string
  "A-shape":  { rootString: 1, majorTemplate: [-1, 0, 2, 2, 2, 0] }, // Root on 5th string
  "D-shape":  { rootString: 2, majorTemplate: [-1, -1, 0, 2, 3, 2] }, // Root on 4th string
  "C-shape":  { rootString: 1, majorTemplate: [-1, 3, 2, 0, 1, 0] }, // Root on 5th string (3rd fret)
  "G-shape":  { rootString: 0, majorTemplate: [3, 2, 0, 0, 0, 3] },  // Root on 6th string (3rd fret)
};
```

### Chord-Key Relationship Lookup

For the "What key is this chord in?" feature:

```typescript
// Given a chord, return all keys it naturally belongs to and its function in each
function getKeysForChord(chordRoot: string, quality: string): { key: string; degree: string }[] {
  // Example: "Am" belongs to:
  // C major (vi), G major (ii), F major (iii),
  // D major (v of relative minor), etc.
  // Most useful: show major key functions

  const results: { key: string; degree: string }[] = [];

  // Check each major key's diatonic chords
  const degreeQualities = [
    { degree: "I", quality: "major" },
    { degree: "ii", quality: "minor" },
    { degree: "iii", quality: "minor" },
    { degree: "IV", quality: "major" },
    { degree: "V", quality: "major" },
    { degree: "vi", quality: "minor" },
    { degree: "vii°", quality: "diminished" },
  ];

  const majorScaleIntervals = [0, 2, 4, 5, 7, 9, 11]; // W-W-H-W-W-W-H

  for (const keyRoot of CHROMATIC_SHARP) {
    const keyRootValue = NOTE_VALUES[keyRoot];
    for (let i = 0; i < 7; i++) {
      const degreeRoot = CHROMATIC_SHARP[(keyRootValue + majorScaleIntervals[i]) % 12];
      if (degreeRoot === chordRoot && degreeQualities[i].quality === quality) {
        results.push({ key: keyRoot + " major", degree: degreeQualities[i].degree });
      }
    }
  }

  return results;
}
```

---

## Summary of Data Requirements

For the GuitarWorld application, the following data must be available:

1. **12 major keys** with all diatonic triads (84 chords) and 7th chords (84 chords) = 168 chord-key relationships
2. **12 natural minor keys** with diatonic triads and 7th chords = 168 more relationships
3. **Chord voicing database** with at minimum:
   - 5 open major chords (C, D, E, G, A) + 2 barre majors (F, B) = 7
   - 3 open minor chords (Am, Dm, Em) + 4 barre minors (Bm, Cm, F#m, Gm) = 7
   - 10+ seventh chord voicings
   - 5+ suspended chord voicings
   - 2+ power chord shapes
   - 4 CAGED barre templates (E-shape, A-shape, Em-shape, Am-shape)
   - **Target: 50+ voicings for initial launch, expandable to 500+**
4. **Chord type definitions** (25+ types with interval formulas)
5. **Progression templates** (10+ common progressions, applicable to all 12 keys)
6. **Circle of Fifths data** for key relationships
7. **Enharmonic mapping** for display consistency
8. **Difficulty classification** algorithm and manual overrides

All fingering data uses the convention:
- Array of 6 integers: index 0 = 6th string (low E), index 5 = 1st string (high E)
- Values: -1 (muted), 0 (open), 1-22 (fret)
- baseFret for position on neck
- Finger numbers: 0 (open/muted), 1-4 (index through pinky), 5 (thumb)
