import type { Barre, DiagramDimensions } from '@/types';
import { stringX, fretY } from '@/utils/diagramLayout';

interface BarreIndicatorProps {
  barres: Barre[];
  dims: DiagramDimensions;
}

const COLORS = {
  barre: 'var(--diagram-dot)',
};

export default function BarreIndicator({ barres, dims }: BarreIndicatorProps) {
  return (
    <g>
      {barres.map((barre, index) => {
        const x1 = stringX(barre.fromString, dims);
        const x2 = stringX(barre.toString, dims);
        const cy = fretY(barre.fret, dims);
        const left = Math.min(x1, x2);
        const width = Math.abs(x2 - x1);
        const height = dims.dotRadius * 2;
        const borderRadius = dims.dotRadius;

        return (
          <rect
            key={`barre-${index}`}
            x={left}
            y={cy - dims.dotRadius}
            width={width}
            height={height}
            rx={borderRadius}
            ry={borderRadius}
            fill={COLORS.barre}
            fillOpacity={0.85}
          />
        );
      })}
    </g>
  );
}
