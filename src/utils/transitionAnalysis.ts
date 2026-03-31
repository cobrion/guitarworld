import type {
  ChordVoicing, NoteName, ChordQuality, IntervalName,
  TransitionTone, TransitionResult,
} from '../types';
import type { Key } from '../types';
import { STANDARD_TUNING } from './constants';
import { FLAT_KEYS } from './constants';
import { noteToIndex, indexToNote } from './musicTheory';
import { CHORD_FORMULAS } from './chordTones';

/**
 * Convert a voicing's relative fret value to an absolute fret number.
 * Returns null for muted strings.
 */
export function getActualFret(voicing: ChordVoicing, stringIdx: number): number | null {
  const f = voicing.strings[stringIdx];
  if (f === null) return null;
  if (f === 0) return 0;
  return voicing.baseFret - 1 + f;
}

/**
 * Resolve the interval name for a note on a given string/fret
 * relative to a chord's root and quality.
 */
function resolveInterval(
  stringIdx: number,
  fret: number,
  root: NoteName,
  quality: ChordQuality,
): IntervalName | null {
  const formula = CHORD_FORMULAS[quality];
  if (!formula) return null;

  const rootIndex = noteToIndex(root);
  const noteIndex = (STANDARD_TUNING[stringIdx] + fret) % 12;

  for (const interval of formula) {
    if ((rootIndex + interval.semitones) % 12 === noteIndex) {
      return interval.label;
    }
  }
  return null;
}

/**
 * Analyze the transition between two voicings, classifying each string
 * as stay, move, lift, or place.
 */
export function analyzeTransition(
  fromVoicing: ChordVoicing,
  toVoicing: ChordVoicing,
  fromRoot: NoteName,
  fromQuality: ChordQuality,
  toRoot: NoteName,
  toQuality: ChordQuality,
): TransitionResult {
  const tones: TransitionTone[] = [];
  let commonToneCount = 0;
  let moveCount = 0;
  let liftCount = 0;
  let placeCount = 0;
  let totalTravel = 0;

  const preferFlats = FLAT_KEYS.has(toRoot as Key) || FLAT_KEYS.has(fromRoot as Key);

  for (let s = 0; s < 6; s++) {
    const fromFret = getActualFret(fromVoicing, s);
    const toFret = getActualFret(toVoicing, s);

    // Both muted — nothing happening on this string
    if (fromFret === null && toFret === null) continue;

    let type: TransitionTone['type'];
    let fretDistance = 0;

    if (fromFret !== null && toFret === null) {
      type = 'lift';
    } else if (fromFret === null && toFret !== null) {
      type = 'place';
    } else if (fromFret === toFret) {
      type = 'stay';
    } else {
      type = 'move';
      fretDistance = Math.abs(fromFret! - toFret!);
    }

    const fromInterval = fromFret !== null
      ? resolveInterval(s, fromFret, fromRoot, fromQuality)
      : null;
    const toInterval = toFret !== null
      ? resolveInterval(s, toFret, toRoot, toQuality)
      : null;

    // Use the "to" note for display (or "from" note for lifts)
    const displayFret = toFret ?? fromFret!;
    const noteIndex = (STANDARD_TUNING[s] + displayFret) % 12;
    const noteName = indexToNote(noteIndex, preferFlats);

    let color: string;
    switch (type) {
      case 'stay':  color = 'var(--transition-stay)'; commonToneCount++; break;
      case 'move':  color = 'var(--transition-move)'; moveCount++; totalTravel += fretDistance; break;
      case 'lift':  color = 'var(--transition-lift)'; liftCount++; break;
      case 'place': color = 'var(--transition-place)'; placeCount++; break;
    }

    tones.push({
      string: s,
      fromFret,
      toFret,
      type,
      fromInterval,
      toInterval,
      noteName,
      color,
      fretDistance,
    });
  }

  let difficulty: TransitionResult['difficulty'];
  if (totalTravel <= 4 && liftCount + placeCount <= 2) {
    difficulty = 'easy';
  } else if (totalTravel <= 8) {
    difficulty = 'moderate';
  } else {
    difficulty = 'hard';
  }

  return { tones, commonToneCount, moveCount, liftCount, placeCount, totalTravel, difficulty };
}

/**
 * Find the "To" voicing that requires the least finger movement
 * from the given "From" voicing.
 */
export function findBestVoicing(
  fromVoicing: ChordVoicing,
  toVoicings: ChordVoicing[],
): { voicing: ChordVoicing; index: number } {
  if (toVoicings.length === 0) {
    return { voicing: toVoicings[0], index: 0 };
  }

  let bestIndex = 0;
  let bestScore = Infinity;

  for (let i = 0; i < toVoicings.length; i++) {
    let score = 0;
    for (let s = 0; s < 6; s++) {
      const fromFret = getActualFret(fromVoicing, s);
      const toFret = getActualFret(toVoicings[i], s);

      if (fromFret === null && toFret === null) {
        // Both muted — no cost
        continue;
      }
      if (fromFret !== null && toFret !== null) {
        if (fromFret === toFret) {
          score -= 2; // Reward staying on same fret
        } else {
          score += Math.abs(fromFret - toFret);
        }
      } else {
        // Muted ↔ fretted transition
        score += 3;
      }
    }

    if (score < bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  }

  return { voicing: toVoicings[bestIndex], index: bestIndex };
}
