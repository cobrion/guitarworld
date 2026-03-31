import type { DiagramDimensions } from '@/types';
import { fretY } from '@/utils/diagramLayout';

interface FretLabelProps {
  baseFret: number;
  dims: DiagramDimensions;
}

const COLORS = {
  label: 'var(--diagram-mute)',
};

export default function FretLabel({ baseFret, dims }: FretLabelProps) {
  return (
    <g>
      {Array.from({ length: dims.numFrets }, (_, i) => {
        const fretNumber = baseFret + i;
        const y = fretY(i + 1, dims);

        return (
          <text
            key={`fret-label-${i}`}
            x={dims.gridRight + 5}
            y={y}
            textAnchor="start"
            dominantBaseline="central"
            fill={COLORS.label}
            style={{
              fontSize: 8,
              fontFamily: 'monospace',
            }}
          >
            {fretNumber}
          </text>
        );
      })}
    </g>
  );
}
