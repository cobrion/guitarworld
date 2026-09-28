import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import type { FretPos, ShapeInterval, ShapeQuality } from '@/types';
import { TOTAL_FRETS } from '@/utils/constants';
import {
  SHAPE_INTERVALS,
  SHAPE_QUALITIES,
  MAX_SPAN,
  autoPlace,
  chordName,
  getGhosts,
  intervalPitch,
  pitchAt,
  reachWindow,
  spellShape,
} from '@/utils/intervalShape';
import type { Placement } from '@/utils/intervalShape';
import { initialShapeState, shapeReducer } from '@/utils/intervalShapeReducer';
import type { ShapeAction, ShapeState } from '@/utils/intervalShapeReducer';

const ALL_ROOTS: FretPos[] = Array.from({ length: 6 }, (_, s) =>
  Array.from({ length: TOTAL_FRETS + 1 }, (_, f) => ({ string: s, fret: f })),
).flat();

const ALL_SUBSETS: ShapeInterval[][] = Array.from({ length: 16 }, (_, mask) =>
  SHAPE_INTERVALS.filter((_, i) => mask & (1 << i)),
);

function placedList(p: Placement): [ShapeInterval, FretPos][] {
  return (Object.entries(p) as [ShapeInterval, FretPos | null][]).filter(
    (e): e is [ShapeInterval, FretPos] => e[1] !== null,
  );
}

function fretSpan(ps: FretPos[]): number {
  const frets = ps.filter((p) => p.fret > 0).map((p) => p.fret);
  return frets.length ? Math.max(...frets) - Math.min(...frets) : 0;
}

describe('autoPlace (exhaustive)', () => {
  it('produces valid one-per-string compact shapes for every root, quality and subset', () => {
    for (const root of ALL_ROOTS) {
      const rootPc = pitchAt(root);
      for (const q of SHAPE_QUALITIES) {
        for (const subset of ALL_SUBSETS) {
          const placement = autoPlace(root, subset, q, TOTAL_FRETS);
          expect(Object.keys(placement).sort()).toEqual([...subset].sort());
          const placed = placedList(placement);
          for (const [i, p] of placed) {
            expect(pitchAt(p)).toBe(intervalPitch(rootPc, i, q));
            expect(p.fret).toBeGreaterThanOrEqual(0);
            expect(p.fret).toBeLessThanOrEqual(TOTAL_FRETS);
            if (root.fret > 3) expect(p.fret).toBeGreaterThan(0);
          }
          const strings = [root.string, ...placed.map(([, p]) => p.string)];
          expect(new Set(strings).size).toBe(strings.length);
          expect(fretSpan([root, ...placed.map(([, p]) => p)])).toBeLessThanOrEqual(MAX_SPAN);
          expect(autoPlace(root, subset, q, TOTAL_FRETS)).toEqual(placement);
        }
      }
    }
  });

  it('only fails to place intervals at the end of the neck', () => {
    const incomplete = (subset: ShapeInterval[], q: ShapeQuality) =>
      ALL_ROOTS.filter((r) => placedList(autoPlace(r, subset, q, TOTAL_FRETS)).length < subset.length);

    for (const q of SHAPE_QUALITIES) {
      expect(incomplete(['3', '5'], q)).toEqual([]);
      const full = incomplete(['3', '4', '5', '7'], q);
      expect(full.length).toBeLessThanOrEqual(3);
      for (const r of full) expect(r.fret).toBeGreaterThanOrEqual(14);
    }
  });

  it('respects fixed positions and never reuses their strings', () => {
    const root = { string: 1, fret: 3 };
    const fixed = { '5': { string: 2, fret: 5 } };
    const placed = autoPlace(root, ['3', '7'], 'major', TOTAL_FRETS, fixed);
    for (const [, p] of placedList(placed)) {
      expect(p.string).not.toBe(1);
      expect(p.string).not.toBe(2);
    }
  });

  it('places C major from the A string 3rd fret as an open-position shape', () => {
    const placement = autoPlace({ string: 1, fret: 3 }, ['3', '4', '5', '7'], 'major', TOTAL_FRETS);
    expect(placement).toEqual({
      '3': { string: 0, fret: 0 },
      '4': { string: 2, fret: 3 },
      '5': { string: 3, fret: 0 },
      '7': { string: 4, fret: 0 },
    });
  });
});

describe('spellShape', () => {
  // Root, 3, 4, 5, 7 — default spelling
  const EXPECTED: Record<ShapeQuality, string[]> = {
    major: [
      'C E F G B', 'D♭ F G♭ A♭ C', 'D F♯ G A C♯', 'E♭ G A♭ B♭ D',
      'E G♯ A B D♯', 'F A B♭ C E', 'F♯ A♯ B C♯ E♯', 'G B C D F♯',
      'A♭ C D♭ E♭ G', 'A C♯ D E G♯', 'B♭ D E♭ F A', 'B D♯ E F♯ A♯',
    ],
    dominant: [
      'C E F G B♭', 'C♯ E♯ F♯ G♯ B', 'D F♯ G A C', 'E♭ G A♭ B♭ D♭',
      'E G♯ A B D', 'F A B♭ C E♭', 'F♯ A♯ B C♯ E', 'G B C D F',
      'A♭ C D♭ E♭ G♭', 'A C♯ D E G', 'B♭ D E♭ F A♭', 'B D♯ E F♯ A',
    ],
    minor: [
      'C E♭ F G B♭', 'C♯ E F♯ G♯ B', 'D F G A C', 'D♯ F♯ G♯ A♯ C♯',
      'E G A B D', 'F A♭ B♭ C E♭', 'F♯ A B C♯ E', 'G B♭ C D F',
      'G♯ B C♯ D♯ F♯', 'A C D E G', 'B♭ D♭ E♭ F A♭', 'B D E F♯ A',
    ],
  };

  for (const q of SHAPE_QUALITIES) {
    it(`spells all 12 ${q} shapes`, () => {
      for (let pc = 0; pc < 12; pc++) {
        const { root, tones } = spellShape(pc, null, q);
        const actual = [root, ...SHAPE_INTERVALS.map((i) => tones[i])].join(' ');
        expect(actual, `pc ${pc}`).toBe(EXPECTED[q][pc]);
        expect(actual).not.toMatch(/𝄫|𝄪/u);
      }
    });
  }

  it('honours a manual spelling override', () => {
    expect(spellShape(1, 'sharp', 'major').root).toBe('C♯');
    expect(spellShape(1, 'sharp', 'major').tones['3']).toBe('E♯');
    expect(spellShape(8, 'sharp', 'major').tones['7']).toBe('F𝄪');
    expect(spellShape(1, 'flat', 'minor').root).toBe('D♭');
  });

  it('reports no spelling choice for natural roots', () => {
    expect(spellShape(0, 'flat', 'major')).toMatchObject({ root: 'C', spelling: null });
  });
});

describe('getGhosts', () => {
  it('returns only in-reach, correct-pitch alternatives off the root string', () => {
    for (const root of ALL_ROOTS) {
      for (const q of SHAPE_QUALITIES) {
        const placement = autoPlace(root, SHAPE_INTERVALS, q, TOTAL_FRETS);
        const [lo, hi] = reachWindow(root, TOTAL_FRETS);
        for (const g of getGhosts(root, SHAPE_INTERVALS, q, placement, TOTAL_FRETS)) {
          expect(pitchAt(g)).toBe(intervalPitch(pitchAt(root), g.interval, q));
          expect(g.string).not.toBe(root.string);
          expect(g.fret).toBeGreaterThanOrEqual(lo);
          expect(g.fret).toBeLessThanOrEqual(hi);
          const cur = placement[g.interval];
          expect(cur && cur.string === g.string && cur.fret === g.fret).toBeFalsy();
        }
      }
    }
  });
});

describe('chordName', () => {
  const cases: [ShapeInterval[], ShapeQuality, string | null][] = [
    [['3', '5'], 'major', 'C'], [['3', '5'], 'dominant', 'C'], [['3', '5'], 'minor', 'Cm'],
    [['3', '5', '7'], 'major', 'Cmaj7'], [['3', '5', '7'], 'dominant', 'C7'], [['3', '5', '7'], 'minor', 'Cm7'],
    [['3', '7'], 'major', 'Cmaj7(no5)'], [['3', '7'], 'dominant', 'C7(no5)'], [['3', '7'], 'minor', 'Cm7(no5)'],
    [['4', '5'], 'major', 'Csus4'], [['4', '5'], 'minor', 'Csus4'],
    [['4', '5', '7'], 'major', 'Cmaj7sus4'], [['4', '5', '7'], 'dominant', 'C7sus4'], [['4', '5', '7'], 'minor', 'C7sus4'],
    [['3', '4', '5'], 'major', 'Cadd4'], [['3', '4', '5'], 'minor', 'Cm(add4)'],
    [['3', '4', '5', '7'], 'major', 'Cmaj7(add11)'], [['3', '4', '5', '7'], 'dominant', 'C7(add11)'],
    [['3', '4', '5', '7'], 'minor', 'Cm7(add11)'],
    [['5'], 'major', 'C5'], [[], 'major', null], [['3'], 'major', null], [['7'], 'minor', null],
  ];
  it.each(cases)('%j %s → %s', (enabled, q, expected) => {
    expect(chordName('C', q, enabled)).toBe(expected);
  });
});

type Step =
  | { kind: 'ghost'; pick: number }
  | { kind: 'toggle'; interval: ShapeInterval }
  | { kind: 'quality'; quality: ShapeQuality };

describe('shapeReducer (property)', () => {
  const rootArb = fc.record({
    string: fc.integer({ min: 0, max: 5 }),
    fret: fc.integer({ min: 0, max: TOTAL_FRETS }),
  });
  const qualityArb = fc.constantFrom<ShapeQuality>(...SHAPE_QUALITIES);
  const stepArb: fc.Arbitrary<Step> = fc.oneof(
    fc.record({ kind: fc.constant('ghost' as const), pick: fc.nat() }),
    fc.record({ kind: fc.constant('toggle' as const), interval: fc.constantFrom<ShapeInterval>(...SHAPE_INTERVALS) }),
    fc.record({ kind: fc.constant('quality' as const), quality: qualityArb }),
  );

  function toAction(state: ShapeState, step: Step): ShapeAction | null {
    if (step.kind === 'toggle') return { type: 'toggleInterval', interval: step.interval };
    if (step.kind === 'quality') return { type: 'setQuality', quality: step.quality };
    const ghosts = getGhosts(state.root!, state.enabled, state.quality, state.placement, TOTAL_FRETS);
    if (!ghosts.length) return null;
    const g = ghosts[step.pick % ghosts.length];
    return { type: 'moveInterval', interval: g.interval, pos: { string: g.string, fret: g.fret } };
  }

  it('keeps shapes valid through any sequence of edits', () => {
    fc.assert(
      fc.property(rootArb, fc.array(stepArb, { maxLength: 30 }), (root, steps) => {
        let state = shapeReducer(initialShapeState, { type: 'selectRoot', pos: root });
        const rootPc = pitchAt(root);
        for (const step of steps) {
          const action = toAction(state, step);
          if (!action) continue;
          const prev = state;
          state = shapeReducer(state, action);

          expect(state.root).toEqual(root);
          const placed = placedList(state.placement);
          const strings = [root.string, ...placed.map(([, p]) => p.string)];
          expect(new Set(strings).size).toBe(strings.length);
          for (const [i, p] of placed) {
            expect(state.enabled).toContain(i);
            expect(pitchAt(p)).toBe(intervalPitch(rootPc, i, state.quality));
          }
          for (const i of SHAPE_INTERVALS) {
            if (!state.enabled.includes(i)) expect(state.placement[i]).toBeUndefined();
          }
          if (action.type === 'setQuality') {
            expect(state.placement['4']).toEqual(prev.placement['4']);
            expect(state.placement['5']).toEqual(prev.placement['5']);
          }
        }
      }),
      { numRuns: 500 },
    );
  });

  it('re-places the 3rd and 7th together when neither can shift (C major → Cm7 at A3)', () => {
    let s = shapeReducer(initialShapeState, { type: 'selectRoot', pos: { string: 1, fret: 3 } });
    s = shapeReducer(s, { type: 'toggleInterval', interval: '4' });
    s = shapeReducer(s, { type: 'setQuality', quality: 'minor' });
    expect(s.placement['5']).toEqual({ string: 3, fret: 0 });
    expect(s.placement['3']).toBeTruthy();
    expect(s.placement['7']).toBeTruthy();
  });

  it('clear returns to idle but keeps quality and enabled intervals', () => {
    let s = shapeReducer(initialShapeState, { type: 'selectRoot', pos: { string: 1, fret: 3 } });
    s = shapeReducer(s, { type: 'setQuality', quality: 'minor' });
    s = shapeReducer(s, { type: 'toggleInterval', interval: '4' });
    s = shapeReducer(s, { type: 'clear' });
    expect(s).toMatchObject({ root: null, placement: {}, quality: 'minor', enabled: ['3', '5', '7'] });
  });

  it('moving an interval onto an occupied string bumps the other interval elsewhere', () => {
    let s = shapeReducer(initialShapeState, { type: 'selectRoot', pos: { string: 1, fret: 3 } });
    const thirdString = s.placement['3']!.string;
    const ghost5 = getGhosts(s.root!, s.enabled, s.quality, s.placement, TOTAL_FRETS)
      .find((g) => g.interval === '5' && g.string === thirdString);
    expect(ghost5).toBeDefined();
    if (!ghost5) return;
    s = shapeReducer(s, { type: 'moveInterval', interval: '5', pos: ghost5 });
    expect(s.placement['5']).toMatchObject({ string: thirdString });
    expect(s.placement['3']?.string).not.toBe(thirdString);
  });
});
