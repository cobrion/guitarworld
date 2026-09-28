import { PITCH_CLASS_NAMES, noteColor } from '@/utils/fretboardNotes';

export default function NoteColorLegend() {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-2" aria-label="Note colors">
      {PITCH_CLASS_NAMES.map((names, pc) => (
        <li key={pc} className="flex items-center gap-1.5">
          <span
            className="inline-block h-3.5 w-3.5 rounded-full"
            style={{
              backgroundColor: noteColor(pc),
              border: '1px solid var(--note-dot-stroke)',
            }}
            aria-hidden="true"
          />
          <span className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>
            {names.join('/')}
          </span>
        </li>
      ))}
    </ul>
  );
}
