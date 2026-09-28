import type { FretPos, ShapeInterval, ShapeQuality } from '@/types';
import { STANDARD_TUNING } from '@/utils/constants';

export type Placement = Partial<Record<ShapeInterval, FretPos | null>>;
export type Spelling = 'sharp' | 'flat';

export const SHAPE_INTERVALS: ShapeInterval[] = ['3', '4', '5', '7'];
export const SHAPE_QUALITIES: ShapeQuality[] = ['major', 'dominant', 'minor'];

export const SEMITONES: Record<ShapeQuality, Record<ShapeInterval, number>> = {
  major:    { '3': 4, '4': 5, '5': 7, '7': 11 },
  dominant: { '3': 4, '4': 5, '5': 7, '7': 10 },
  minor:    { '3': 3, '4': 5, '5': 7, '7': 10 },
};

export const SHAPE_COLORS: Record<ShapeInterval | 'R', string> = {
  R: 'var(--interval-root)',
  '3': 'var(--interval-third)',
  '4': 'var(--interval-fourth)',
  '5': 'var(--interval-fifth)',
  '7': 'var(--interval-seventh)',
};

export const MAX_SPAN = 3;

export function pitchAt(pos: FretPos): number {
  return (STANDARD_TUNING[pos.string] + pos.fret) % 12;
}

export function intervalPitch(rootPc: number, interval: ShapeInterval, quality: ShapeQuality): number {
  return (rootPc + SEMITONES[quality][interval]) % 12;
}

export function intervalLabel(interval: ShapeInterval, quality: ShapeQuality): string {
  if (quality === 'minor' && interval === '3') return '♭3';
  if (quality !== 'major' && interval === '7') return '♭7';
  return interval;
}

// ── Spelling ────────────────────────────────────────────────

const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const NATURAL_PC = [0, 2, 4, 5, 7, 9, 11];
const LETTER_STEPS: Record<ShapeInterval, number> = { '3': 2, '4': 3, '5': 4, '7': 6 };
const ACCIDENTALS: Record<number, string> = { [-2]: '𝄫', [-1]: '♭', 0: '', 1: '♯', 2: '𝄪' };

function accidentalOffset(pc: number, letterIdx: number): number {
  const diff = (((pc - NATURAL_PC[letterIdx]) % 12) + 12) % 12;
  return diff > 6 ? diff - 12 : diff;
}

export function isAccidental(pc: number): boolean {
  return !NATURAL_PC.includes(pc);
}

function spellFromLetter(rootPc: number, rootLetter: number, quality: ShapeQuality) {
  const rootAcc = accidentalOffset(rootPc, rootLetter);
  const tones = {} as Record<ShapeInterval, string>;
  let cost = Math.abs(rootAcc);
  for (const i of SHAPE_INTERVALS) {
    const letter = (rootLetter + LETTER_STEPS[i]) % 7;
    const acc = accidentalOffset(intervalPitch(rootPc, i, quality), letter);
    tones[i] = LETTERS[letter] + ACCIDENTALS[acc];
    cost += Math.abs(acc);
  }
  return { root: LETTERS[rootLetter] + ACCIDENTALS[rootAcc], tones, cost };
}

// Cost counts all four intervals, not just enabled ones, so names don't flip as chips toggle.
export function spellShape(rootPc: number, preferred: Spelling | null, quality: ShapeQuality) {
  if (!isAccidental(rootPc)) {
    const { root, tones } = spellFromLetter(rootPc, NATURAL_PC.indexOf(rootPc), quality);
    return { root, tones, spelling: null };
  }
  const sharp = spellFromLetter(rootPc, NATURAL_PC.indexOf(rootPc - 1), quality);
  const flat = spellFromLetter(rootPc, NATURAL_PC.indexOf((rootPc + 1) % 12), quality);
  const spelling: Spelling = preferred ?? (flat.cost < sharp.cost ? 'flat' : 'sharp');
  const chosen = spelling === 'flat' ? flat : sharp;
  return { root: chosen.root, tones: chosen.tones, spelling, sharpRoot: sharp.root, flatRoot: flat.root };
}

// ── Placement ───────────────────────────────────────────────

function fretSpan(positions: FretPos[]): number {
  const frets = positions.filter((p) => p.fret > 0).map((p) => p.fret);
  return frets.length ? Math.max(...frets) - Math.min(...frets) : 0;
}

export function reachWindow(root: FretPos, totalFrets: number): [number, number] {
  return [Math.max(0, root.fret - MAX_SPAN), Math.min(totalFrets, root.fret + MAX_SPAN)];
}

function candidatesFor(
  root: FretPos, interval: ShapeInterval, quality: ShapeQuality, totalFrets: number,
): FretPos[] {
  const pc = intervalPitch(pitchAt(root), interval, quality);
  const [lo, hi] = reachWindow(root, totalFrets);
  const out: FretPos[] = [];
  for (let s = 0; s < STANDARD_TUNING.length; s++) {
    if (s === root.string) continue;
    for (let f = lo; f <= hi; f++) {
      if (pitchAt({ string: s, fret: f }) === pc) out.push({ string: s, fret: f });
    }
  }
  return out;
}

export function autoPlace(
  root: FretPos,
  intervals: ShapeInterval[],
  quality: ShapeQuality,
  totalFrets: number,
  fixed: Partial<Record<ShapeInterval, FretPos>> = {},
): Placement {
  const fixedPositions = Object.values(fixed) as FretPos[];
  const taken = new Set([root.string, ...fixedPositions.map((p) => p.string)]);
  const spanLimit = Math.max(MAX_SPAN, fretSpan([root, ...fixedPositions]));
  const options = intervals.map((i) =>
    candidatesFor(root, i, quality, totalFrets).filter((p) => !taken.has(p.string)),
  );

  let best: { score: number[]; picks: (FretPos | null)[] } | null = null;
  const picks: (FretPos | null)[] = [];

  const visit = (idx: number, used: Set<number>) => {
    if (idx === intervals.length) {
      const placed = picks.filter((p): p is FretPos => p !== null);
      const span = fretSpan([root, ...fixedPositions, ...placed]);
      if (span > spanLimit) return;
      const score = [
        picks.length - placed.length,
        span,
        placed.reduce((sum, p) => sum + Math.abs(p.string - root.string), 0),
        placed.reduce((sum, p) => sum + Math.abs(p.fret - root.fret), 0),
      ];
      if (!best || compareScores(score, best.score) < 0) best = { score, picks: [...picks] };
      return;
    }
    for (const c of options[idx]) {
      if (used.has(c.string)) continue;
      picks.push(c);
      used.add(c.string);
      visit(idx + 1, used);
      used.delete(c.string);
      picks.pop();
    }
    picks.push(null);
    visit(idx + 1, used);
    picks.pop();
  };
  visit(0, new Set());

  const result: Placement = {};
  const chosen = (best as { picks: (FretPos | null)[] } | null)?.picks;
  intervals.forEach((i, k) => { result[i] = chosen ? chosen[k] : null; });
  return result;
}

function compareScores(a: number[], b: number[]): number {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i];
  return 0;
}

export interface Ghost extends FretPos {
  interval: ShapeInterval;
}

export function getGhosts(
  root: FretPos,
  enabled: ShapeInterval[],
  quality: ShapeQuality,
  placement: Placement,
  totalFrets: number,
): Ghost[] {
  return enabled.flatMap((i) => {
    const current = placement[i];
    return candidatesFor(root, i, quality, totalFrets)
      .filter((p) => !(current && current.string === p.string && current.fret === p.fret))
      .map((p) => ({ ...p, interval: i }));
  });
}

// ── Chord name ──────────────────────────────────────────────

const CHORD_SUFFIXES: Record<string, Record<ShapeQuality, string>> = {
  '1010': { major: '', dominant: '', minor: 'm' },
  '1011': { major: 'maj7', dominant: '7', minor: 'm7' },
  '1001': { major: 'maj7(no5)', dominant: '7(no5)', minor: 'm7(no5)' },
  '0110': { major: 'sus4', dominant: 'sus4', minor: 'sus4' },
  '0111': { major: 'maj7sus4', dominant: '7sus4', minor: '7sus4' },
  '1110': { major: 'add4', dominant: 'add4', minor: 'm(add4)' },
  '1111': { major: 'maj7(add11)', dominant: '7(add11)', minor: 'm7(add11)' },
  '0010': { major: '5', dominant: '5', minor: '5' },
};

export function chordName(rootName: string, quality: ShapeQuality, enabled: ShapeInterval[]): string | null {
  const key = SHAPE_INTERVALS.map((i) => (enabled.includes(i) ? '1' : '0')).join('');
  const suffix = CHORD_SUFFIXES[key]?.[quality];
  return suffix === undefined ? null : rootName + suffix;
}
