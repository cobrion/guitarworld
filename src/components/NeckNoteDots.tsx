import type { ChordTone } from '@/types';
import type { NeckLayout } from '@/components/GuitarNeck';

interface NeckNoteDotsProps {
  tones: ChordTone[];
  layout: NeckLayout;
}

export default function NeckNoteDots({
  tones,
  layout,
}: NeckNoteDotsProps) {
  const { stringCoord, fretCoord, stringsHorizontal } = layout;
  const dotRadius = 11;
  const fontSize = 10;
  const opacity = 0.88;

  return (
    <g>
      {tones.map((tone, i) => {
        const sPos = stringCoord(tone.string);
        const isOpen = tone.fret === 0;

        // For fretted notes, place in the middle of the fret space
        // For open strings, place just before the nut
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

        const r = isOpen ? dotRadius - 1 : dotRadius;

        return (
          <g key={`${tone.string}-${tone.fret}-${i}`} opacity={opacity}>
            <title>{`${tone.noteName} - ${tone.interval === 'R' ? 'Root' : tone.interval} - String ${tone.string + 1}, Fret ${tone.fret}`}</title>
            {isOpen && (
              <circle cx={cx} cy={cy} r={r + 2} fill="var(--neck-bg)" />
            )}
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill={isOpen ? 'transparent' : tone.color}
              stroke={tone.color}
              strokeWidth={isOpen ? 2 : 0}
            />
            <text
              x={cx}
              y={cy + fontSize * 0.35}
              textAnchor="middle"
              fill={isOpen ? tone.color : 'var(--diagram-dot-text)'}
              fontSize={fontSize}
              fontWeight={800}
              fontFamily="Inter, sans-serif"
              style={{ pointerEvents: 'none' }}
            >
              {tone.noteName}
            </text>
          </g>
        );
      })}
    </g>
  );
}
