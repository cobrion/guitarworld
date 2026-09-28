import type { FretPos, ShapeInterval, ShapeQuality } from '@/types';
import { TOTAL_FRETS } from '@/utils/constants';
import { SEMITONES, SHAPE_INTERVALS, autoPlace } from '@/utils/intervalShape';
import type { Placement, Spelling } from '@/utils/intervalShape';

export interface ShapeState {
  root: FretPos | null;
  quality: ShapeQuality;
  enabled: ShapeInterval[];
  placement: Placement;
  spelling: Spelling | null;
}

export type ShapeAction =
  | { type: 'selectRoot'; pos: FretPos }
  | { type: 'clear' }
  | { type: 'setQuality'; quality: ShapeQuality }
  | { type: 'toggleInterval'; interval: ShapeInterval }
  | { type: 'moveInterval'; interval: ShapeInterval; pos: FretPos }
  | { type: 'setSpelling'; spelling: Spelling };

export const initialShapeState: ShapeState = {
  root: null,
  quality: 'major',
  enabled: [...SHAPE_INTERVALS],
  placement: {},
  spelling: null,
};

function placedExcept(placement: Placement, ...skip: ShapeInterval[]): Partial<Record<ShapeInterval, FretPos>> {
  const fixed: Partial<Record<ShapeInterval, FretPos>> = {};
  for (const i of SHAPE_INTERVALS) {
    const p = placement[i];
    if (p && !skip.includes(i)) fixed[i] = p;
  }
  return fixed;
}

function placeOne(state: ShapeState, interval: ShapeInterval, placement: Placement, quality = state.quality): Placement {
  if (!state.root) return placement;
  const placed = autoPlace(state.root, [interval], quality, TOTAL_FRETS, placedExcept(placement, interval));
  return { ...placement, [interval]: placed[interval] ?? null };
}

export function shapeReducer(state: ShapeState, action: ShapeAction): ShapeState {
  switch (action.type) {
    case 'selectRoot':
      return {
        ...state,
        root: action.pos,
        spelling: null,
        placement: autoPlace(action.pos, state.enabled, state.quality, TOTAL_FRETS),
      };

    case 'clear':
      return { ...state, root: null, placement: {}, spelling: null };

    case 'setQuality': {
      const { quality } = action;
      if (quality === state.quality) return state;
      const placement = { ...state.placement };
      const failed: ShapeInterval[] = [];
      for (const i of ['3', '7'] as const) {
        if (!state.enabled.includes(i)) continue;
        const delta = SEMITONES[quality][i] - SEMITONES[state.quality][i];
        const p = placement[i];
        const shifted = p ? p.fret + delta : -1;
        if (p && shifted >= 0 && shifted <= TOTAL_FRETS) {
          placement[i] = { string: p.string, fret: shifted };
        } else {
          failed.push(i);
        }
      }
      if (failed.length && state.root) {
        // Re-place failures jointly so a stale old-quality 7th can't block the new 3rd's best string
        const placed = autoPlace(state.root, failed, quality, TOTAL_FRETS, placedExcept(placement, ...failed));
        for (const i of failed) placement[i] = placed[i] ?? null;
      }
      return { ...state, quality, placement };
    }

    case 'toggleInterval': {
      const { interval } = action;
      if (state.enabled.includes(interval)) {
        const placement = { ...state.placement };
        delete placement[interval];
        return { ...state, enabled: state.enabled.filter((i) => i !== interval), placement };
      }
      const enabled = SHAPE_INTERVALS.filter((i) => i === interval || state.enabled.includes(i));
      return { ...state, enabled, placement: placeOne(state, interval, state.placement) };
    }

    case 'moveInterval': {
      const { interval, pos } = action;
      let placement: Placement = { ...state.placement, [interval]: pos };
      const bumped = SHAPE_INTERVALS.find(
        (i) => i !== interval && placement[i]?.string === pos.string,
      );
      if (bumped) placement = placeOne(state, bumped, placement);
      return { ...state, placement };
    }

    case 'setSpelling':
      return { ...state, spelling: action.spelling };
  }
}
