import type { Orientation } from '@/types';

export const STRING_SPACING = 30;
export const FRET_SPACING = 40;
export const PAD_LABEL = 32;
export const PAD_NUT = 48;

export interface NeckLayout {
  stringCoord: (stringIdx: number) => number;
  fretCoord: (fretIdx: number) => number;
  stringStart: number;
  stringEnd: number;
  fretStart: number;
  fretEnd: number;
  stringsHorizontal: boolean;
  svgWidth: number;
  svgHeight: number;
  labelOffset: number;
  fretNumOffset: number;
}

export function buildLayout(orientation: Orientation, totalFrets: number): NeckLayout {
  const gridSpan = STRING_SPACING * 5;
  const fretSpan = FRET_SPACING * totalFrets;

  if (orientation === 'vertical') {
    return {
      stringCoord: (s) => PAD_LABEL + s * STRING_SPACING,
      fretCoord: (f) => PAD_NUT + f * FRET_SPACING,
      stringStart: PAD_NUT,
      stringEnd: PAD_NUT + fretSpan,
      fretStart: PAD_LABEL,
      fretEnd: PAD_LABEL + gridSpan,
      stringsHorizontal: false,
      svgWidth: PAD_LABEL + gridSpan + 10,
      svgHeight: PAD_NUT + fretSpan + 8,
      labelOffset: -16,
      fretNumOffset: -10,
    };
  }

  return {
    stringCoord: (s) => PAD_NUT + (5 - s) * STRING_SPACING,
    fretCoord: (f) => PAD_LABEL + f * FRET_SPACING,
    stringStart: PAD_LABEL,
    stringEnd: PAD_LABEL + fretSpan,
    fretStart: PAD_NUT,
    fretEnd: PAD_NUT + gridSpan,
    stringsHorizontal: true,
    svgWidth: PAD_LABEL + fretSpan + 8,
    svgHeight: PAD_NUT + gridSpan + 10,
    labelOffset: -16,
    fretNumOffset: -10,
  };
}
