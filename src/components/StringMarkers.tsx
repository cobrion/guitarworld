import type { ChordVoicing, DiagramDimensions } from '@/types';
import { stringX } from '@/utils/diagramLayout';

interface StringMarkersProps {
  voicing: ChordVoicing;
  dims: DiagramDimensions;
}

const COLORS = {
  open: 'var(--diagram-open)',
  muted: 'var(--diagram-mute)',
};

export default function StringMarkers({ voicing, dims }: StringMarkersProps) {
  const markerY = dims.gridTop - 10;
  const markerRadius = dims.dotRadius * 0.7;

  return (
    <g>
      {voicing.strings.map((fretValue, stringIndex) => {
        const cx = stringX(stringIndex, dims);

        if (fretValue === 0) {
          // Open string: green hollow circle
          return (
            <circle
              key={`marker-${stringIndex}`}
              cx={cx}
              cy={markerY}
              r={markerRadius}
              fill="none"
              stroke={COLORS.open}
              strokeWidth={1.5}
            />
          );
        }

        if (fretValue === null) {
          // Muted string: X marker
          return (
            <text
              key={`marker-${stringIndex}`}
              x={cx}
              y={markerY}
              textAnchor="middle"
              dominantBaseline="central"
              fill={COLORS.muted}
              style={{
                fontSize: markerRadius * 2.4,
                fontFamily: 'sans-serif',
                fontWeight: 700,
              }}
            >
              X
            </text>
          );
        }

        return null;
      })}
    </g>
  );
}
