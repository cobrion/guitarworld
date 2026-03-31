import type { DiagramDimensions } from '@/types';

export function calculateDimensions(width = 120, height = 160): DiagramDimensions {
  const numStrings = 6;
  const numFrets = 4;
  const gridLeft = 15;
  const gridRight = width - 16;
  const gridTop = 24;
  const gridBottom = height - 18;
  const stringSpacing = (gridRight - gridLeft) / (numStrings - 1);
  const fretSpacing = (gridBottom - gridTop) / numFrets;

  return {
    svgWidth: width,
    svgHeight: height,
    gridLeft,
    gridTop,
    gridRight,
    gridBottom,
    stringSpacing,
    fretSpacing,
    dotRadius: stringSpacing * 0.35,
    numStrings,
    numFrets,
  };
}

export function stringX(stringIndex: number, dims: DiagramDimensions): number {
  return dims.gridLeft + stringIndex * dims.stringSpacing;
}

export function fretY(fretNumber: number, dims: DiagramDimensions): number {
  return dims.gridTop + (fretNumber - 0.5) * dims.fretSpacing;
}
