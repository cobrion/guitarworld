import type { FretboardNote } from '@/types';
import type { NeckLayout } from '@/utils/neckLayout';
import { STANDARD_TUNING_NAMES } from '@/utils/constants';
import { noteColor } from '@/utils/fretboardNotes';

interface FretboardNoteDotsProps {
  notes: FretboardNote[];
  layout: NeckLayout;
}

const DOT_RADIUS = 13;
const FONT_SINGLE = 11;
const FONT_DOUBLE = 7.5;

export default function FretboardNoteDots({ notes, layout }: FretboardNoteDotsProps) {
  const { stringCoord, fretCoord, stringsHorizontal } = layout;

  return (
    <g>
      {notes.map((note) => {
        const sPos = stringCoord(note.string);
        const fPos = note.fret === 0
          ? fretCoord(0) - 16
          : (fretCoord(note.fret - 1) + fretCoord(note.fret)) / 2;
        const cx = stringsHorizontal ? fPos : sPos;
        const cy = stringsHorizontal ? sPos : fPos;
        const label = note.names.join('/');
        const [first, second] = note.names;

        return (
          <g key={`${note.string}-${note.fret}`}>
            <title>{`${label} — String ${6 - note.string} (${STANDARD_TUNING_NAMES[note.string]}), Fret ${note.fret}`}</title>
            {note.fret === 0 && (
              <circle cx={cx} cy={cy} r={DOT_RADIUS + 2} fill="var(--neck-bg)" />
            )}
            <circle
              cx={cx}
              cy={cy}
              r={DOT_RADIUS}
              fill={noteColor(note.pitchClass)}
              stroke="var(--note-dot-stroke)"
              strokeWidth={1}
            />
            <text
              x={cx}
              y={cy}
              textAnchor="middle"
              fill="var(--note-dot-text)"
              fontSize={second ? FONT_DOUBLE : FONT_SINGLE}
              fontWeight={800}
              fontFamily="Inter, sans-serif"
              style={{ pointerEvents: 'none' }}
            >
              {second ? (
                <>
                  <tspan x={cx} y={cy - 1}>{first}</tspan>
                  <tspan x={cx} y={cy + FONT_DOUBLE}>{second}</tspan>
                </>
              ) : (
                <tspan x={cx} y={cy + FONT_SINGLE * 0.35}>{first}</tspan>
              )}
            </text>
          </g>
        );
      })}
    </g>
  );
}
