import type { NoteName, ChordTone, IntervalName, Key } from '../types';
import type { ScaleKind } from './scaleTones';
import { SCALE_FORMULAS } from './scaleTones';
import { STANDARD_TUNING, INTERVAL_COLORS, FLAT_KEYS } from './constants';
import { noteToIndex, indexToNote } from './musicTheory';

export interface ScalePosition {
  /** 0-based position index */
  index: number;
  /** Which scale degree this position starts on (e.g., 'R', '2', '3') */
  startDegree: string;
  /** Display label for the degree (e.g., '1', '2', '3') */
  degreeLabel: string;
  /** The lowest fret in this position */
  startFret: number;
  /** The highest fret in this position */
  endFret: number;
  /** All tones in this position, sorted in ascending playing order */
  tones: ChordTone[];
}

/**
 * Compute all scale positions across the fretboard.
 *
 * A position is a group of scale tones playable without shifting the
 * fretting hand. Each position starts on a different scale degree on
 * the low E string (string 0).
 */
export function computeScalePositions(
  root: NoteName,
  scaleKind: ScaleKind,
  totalFrets: number,
): ScalePosition[] {
  const formula = SCALE_FORMULAS[scaleKind];
  const rootIndex = noteToIndex(root);
  const preferFlats = FLAT_KEYS.has(root as Key);

  // Build chromatic index → interval info
  const toneMap = new Map<number, { label: IntervalName; degreeIndex: number }>();
  for (let i = 0; i < formula.length; i++) {
    const chromaticIndex = (rootIndex + formula[i].semitones) % 12;
    toneMap.set(chromaticIndex, { label: formula[i].label, degreeIndex: i });
  }

  // Gather ALL scale tones across all strings and frets
  const allTones: ChordTone[] = [];
  for (let string = 0; string < 6; string++) {
    for (let fret = 0; fret <= totalFrets; fret++) {
      const noteIndex = (STANDARD_TUNING[string] + fret) % 12;
      const info = toneMap.get(noteIndex);
      if (info !== undefined) {
        allTones.push({
          string,
          fret,
          noteName: indexToNote(noteIndex, preferFlats),
          interval: info.label,
          color: INTERVAL_COLORS[info.label],
        });
      }
    }
  }

  // Find anchor tones on string 0 (low E) within frets 0-12
  // Each anchor defines a position
  const anchors: { fret: number; degreeIndex: number; label: IntervalName }[] = [];
  for (let fret = 0; fret <= 12; fret++) {
    const noteIndex = (STANDARD_TUNING[0] + fret) % 12;
    const info = toneMap.get(noteIndex);
    if (info !== undefined) {
      anchors.push({ fret, degreeIndex: info.degreeIndex, label: info.label });
    }
  }

  // Sort anchors by fret ascending
  anchors.sort((a, b) => a.fret - b.fret);

  // Deduplicate anchors that start on the same scale degree
  // (e.g., two roots within frets 0-12 for some keys)
  const seen = new Set<number>();
  const uniqueAnchors = anchors.filter((a) => {
    if (seen.has(a.degreeIndex)) return false;
    seen.add(a.degreeIndex);
    return true;
  });

  const positions: ScalePosition[] = [];

  for (let i = 0; i < uniqueAnchors.length; i++) {
    const anchor = uniqueAnchors[i];
    const maxSpan = 4; // base span of 4 frets

    // Determine the window: anchor fret to anchor fret + maxSpan
    // But allow extending by 1 on each side if a string has no notes
    const windowStart = Math.max(0, anchor.fret);
    const windowEnd = Math.min(totalFrets, anchor.fret + maxSpan);

    // Collect tones per string within the window
    const positionTones: ChordTone[] = [];

    for (let string = 0; string < 6; string++) {
      // Find all scale tones on this string within [windowStart, windowEnd]
      const stringTones = allTones.filter(
        (t) => t.string === string && t.fret >= windowStart && t.fret <= windowEnd,
      );

      if (stringTones.length > 0) {
        positionTones.push(...stringTones);
      } else {
        // No tones in strict window — extend by 1 fret on the high side
        const extended = allTones.filter(
          (t) =>
            t.string === string &&
            t.fret >= windowStart &&
            t.fret <= windowEnd + 1,
        );
        if (extended.length > 0) {
          positionTones.push(...extended);
        }
        // If still nothing, also try 1 below
        if (extended.length === 0) {
          const belowExtended = allTones.filter(
            (t) =>
              t.string === string &&
              t.fret >= Math.max(0, windowStart - 1) &&
              t.fret <= windowEnd + 1,
          );
          positionTones.push(...belowExtended);
        }
      }
    }

    if (positionTones.length === 0) continue;

    // Sort in ascending playing order: string ascending (0→5), fret ascending within string
    positionTones.sort((a, b) => {
      if (a.string !== b.string) return a.string - b.string;
      return a.fret - b.fret;
    });

    // Compute actual fret range
    const frets = positionTones.map((t) => t.fret);
    const startFret = Math.min(...frets);
    const endFret = Math.max(...frets);

    const degreeLabel =
      anchor.label === 'R' ? '1' : anchor.label;

    positions.push({
      index: i,
      startDegree: anchor.label,
      degreeLabel,
      startFret,
      endFret,
      tones: positionTones,
    });
  }

  return positions;
}
