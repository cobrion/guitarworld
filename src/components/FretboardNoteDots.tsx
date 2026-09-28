import type { FretboardNote, FretPos } from '@/types';
import type { NeckLayout } from '@/utils/neckLayout';
import { dotCenter } from '@/utils/neckLayout';
import { STANDARD_TUNING_NAMES } from '@/utils/constants';
import { noteColor } from '@/utils/fretboardNotes';

interface FretboardNoteDotsProps {
  notes: FretboardNote[];
  layout: NeckLayout;
  dimmed?: boolean;
  onNoteClick?: (pos: FretPos) => void;
}

const DOT_RADIUS = 13;
const HIT_RADIUS = 15;
const FONT_SINGLE = 11;
const FONT_DOUBLE = 7.5;

export default function FretboardNoteDots({ notes, layout, dimmed, onNoteClick }: FretboardNoteDotsProps) {
  return (
    <g opacity={dimmed ? 0.15 : 1}>
      {notes.map((note) => {
        const { cx, cy } = dotCenter(layout, note.string, note.fret);
        const label = note.names.join('/');
        const [first, second] = note.names;
        const where = `String ${6 - note.string} (${STANDARD_TUNING_NAMES[note.string]}), Fret ${note.fret}`;
        const pos = { string: note.string, fret: note.fret };
        const interactive = onNoteClick !== undefined;

        return (
          <g
            key={`${note.string}-${note.fret}`}
            className={interactive ? 'fret-dot' : undefined}
            role={interactive ? 'button' : undefined}
            tabIndex={interactive ? 0 : undefined}
            aria-label={interactive ? `${label}, ${where}` : undefined}
            onClick={interactive ? () => onNoteClick(pos) : undefined}
            onKeyDown={interactive ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onNoteClick(pos);
              }
            } : undefined}
          >
            <title>{`${label} — ${where}`}</title>
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
            {interactive && (
              <circle className="fret-dot-ring" cx={cx} cy={cy} r={HIT_RADIUS} fill="transparent" stroke="var(--color-text)" strokeWidth={1.5} />
            )}
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
