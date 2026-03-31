import type { DiagramDimensions } from '@/types';
import { stringX } from '@/utils/diagramLayout';

interface FretboardGridProps {
  dims: DiagramDimensions;
  baseFret: number;
}

const COLORS = {
  nut: 'var(--diagram-nut)',
  fretWire: 'var(--diagram-fret)',
  string: 'var(--diagram-string)',
};

export default function FretboardGrid({ dims, baseFret }: FretboardGridProps) {
  const stringLines = [];
  for (let i = 0; i < dims.numStrings; i++) {
    const x = stringX(i, dims);
    // Thickness varies from 1.5px (low E, index 0) to 0.75px (high E, index 5)
    const thickness = 1.5 - (i / (dims.numStrings - 1)) * 0.75;
    stringLines.push(
      <line
        key={`string-${i}`}
        x1={x}
        y1={dims.gridTop}
        x2={x}
        y2={dims.gridBottom}
        stroke={COLORS.string}
        strokeWidth={thickness}
      />
    );
  }

  const fretLines = [];
  for (let f = 1; f <= dims.numFrets; f++) {
    const y = dims.gridTop + f * dims.fretSpacing;
    fretLines.push(
      <line
        key={`fret-${f}`}
        x1={dims.gridLeft}
        y1={y}
        x2={dims.gridRight}
        y2={y}
        stroke={COLORS.fretWire}
        strokeWidth={1}
      />
    );
  }

  return (
    <g>
      {/* Nut line (thick top bar) only when baseFret is 1 */}
      {baseFret === 1 && (
        <line
          x1={dims.gridLeft}
          y1={dims.gridTop}
          x2={dims.gridRight}
          y2={dims.gridTop}
          stroke={COLORS.nut}
          strokeWidth={3}
        />
      )}

      {/* Top fret line when baseFret > 1 (thin) */}
      {baseFret > 1 && (
        <line
          x1={dims.gridLeft}
          y1={dims.gridTop}
          x2={dims.gridRight}
          y2={dims.gridTop}
          stroke={COLORS.fretWire}
          strokeWidth={1}
        />
      )}

      {stringLines}
      {fretLines}
    </g>
  );
}
