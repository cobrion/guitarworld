import type { FretboardNote } from '@/types';
import { STANDARD_TUNING } from '@/utils/constants';

export const PITCH_CLASS_NAMES: string[][] = [
  ['C'], ['C♯', 'D♭'], ['D'], ['D♯', 'E♭'], ['E'], ['F'],
  ['F♯', 'G♭'], ['G'], ['G♯', 'A♭'], ['A'], ['A♯', 'B♭'], ['B'],
];

export function noteColor(pitchClass: number): string {
  return `var(--note-${pitchClass})`;
}

export function getFretboardNotes(totalFrets: number): FretboardNote[] {
  const notes: FretboardNote[] = [];
  for (let s = 0; s < STANDARD_TUNING.length; s++) {
    for (let f = 0; f <= totalFrets; f++) {
      const pitchClass = (STANDARD_TUNING[s] + f) % 12;
      notes.push({ string: s, fret: f, pitchClass, names: PITCH_CLASS_NAMES[pitchClass] });
    }
  }
  return notes;
}
