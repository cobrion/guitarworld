import type { ChordTone } from '@/types';
import type { NeckLayout } from '@/components/GuitarNeck';

interface PositionNoteDotsProps {
  tones: ChordTone[];
  layout: NeckLayout;
}

export default function PositionNoteDots({
  tones,
  layout,
}: PositionNoteDotsProps) {
  const { stringCoord, fretCoord, stringsHorizontal } = layout;
  const dotRadius = 11;
  const rootRadius = 13;
  const fontSize = 10;

  return (
    <g>
      {tones.map((tone, i) => {
        const sPos = stringCoord(tone.string);
        const isOpen = tone.fret === 0;
        const isRoot = tone.interval === 'R';
        const label = tone.noteName;

        let cx: number;
        let cy: number;

        if (isOpen) {
          const nutPos = fretCoord(0);
          if (stringsHorizontal) {
            cx = nutPos - 16;
            cy = sPos;
          } else {
            cx = sPos;
            cy = nutPos - 16;
          }
        } else {
          const midFret = (fretCoord(tone.fret - 1) + fretCoord(tone.fret)) / 2;
          if (stringsHorizontal) {
            cx = midFret;
            cy = sPos;
          } else {
            cx = sPos;
            cy = midFret;
          }
        }

        const r = isRoot ? rootRadius : isOpen ? dotRadius - 1 : dotRadius;

        return (
          <g key={`${tone.string}-${tone.fret}-${i}`} opacity={0.92}>
            <title>{`${tone.noteName} (${tone.interval === 'R' ? 'Root' : tone.interval}) - String ${tone.string + 1}, Fret ${tone.fret}`}</title>

            {/* Background circle to mask fretboard behind open strings */}
            {isOpen && (
              <circle cx={cx} cy={cy} r={r + 2} fill="var(--neck-bg)" />
            )}

            {/* Root outer ring */}
            {isRoot && !isOpen && (
              <circle
                cx={cx}
                cy={cy}
                r={r + 3}
                fill="none"
                stroke={tone.color}
                strokeWidth={2}
                strokeOpacity={0.4}
              />
            )}

            {/* Main dot */}
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill={isOpen ? 'transparent' : tone.color}
              stroke={tone.color}
              strokeWidth={isOpen ? 2 : 0}
            />

            {/* Note name */}
            <text
              x={cx}
              y={cy + fontSize * 0.35}
              textAnchor="middle"
              fill={isOpen ? tone.color : 'var(--diagram-dot-text)'}
              fontSize={isRoot ? fontSize + 1 : fontSize}
              fontWeight={800}
              fontFamily="Inter, sans-serif"
              style={{ pointerEvents: 'none' }}
            >
              {label}
            </text>
          </g>
        );
      })}
    </g>
  );
}
