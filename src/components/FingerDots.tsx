import type { ChordVoicing, DiagramDimensions } from '@/types';
import { stringX, fretY } from '@/utils/diagramLayout';

interface FingerDotsProps {
  voicing: ChordVoicing;
  dims: DiagramDimensions;
}

const COLORS = {
  dot: 'var(--diagram-dot)',
  dotText: 'var(--diagram-dot-text)',
};

export default function FingerDots({ voicing, dims }: FingerDotsProps) {
  return (
    <g>
      {voicing.strings.map((fretValue, stringIndex) => {
        if (fretValue === null || fretValue === 0) return null;

        const cx = stringX(stringIndex, dims);
        const cy = fretY(fretValue, dims);
        const finger = voicing.fingers[stringIndex];

        return (
          <g key={`dot-${stringIndex}`}>
            <circle
              cx={cx}
              cy={cy}
              r={dims.dotRadius}
              fill={COLORS.dot}
            />
            {finger !== null && finger >= 1 && finger <= 4 && (
              <text
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="central"
                fill={COLORS.dotText}
                style={{
                  fontSize: dims.dotRadius * 1.3,
                  fontFamily: 'sans-serif',
                  fontWeight: 700,
                  pointerEvents: 'none',
                }}
              >
                {finger}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}
