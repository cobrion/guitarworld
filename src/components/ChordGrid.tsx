import { useChord } from '@/context/ChordContext';
import ChordCard from '@/components/ChordCard';

export default function ChordGrid() {
  const { state, chords } = useChord();

  return (
    <section id="chord-grid" className="px-4 py-6 sm:px-6">
      <h2
        className="text-sm font-medium mb-4"
        style={{ color: 'var(--color-text-muted)' }}
      >
        Key of {state.selectedKeys[0] ?? 'C'} {state.scaleType}
        <span className="ml-2 opacity-60">
          ({chords.length} chord{chords.length !== 1 ? 's' : ''})
        </span>
      </h2>

      {chords.length === 0 ? (
        <p
          className="text-center py-12 text-sm"
          style={{ color: 'var(--color-text-muted)' }}
        >
          No chords match the current filters.
        </p>
      ) : (
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          }}
        >
          {chords.map((chord, i) => (
            <ChordCard
              key={`${chord.name}-${chord.scaleDegree}`}
              chord={chord}
              animationDelay={i * 50}
            />
          ))}
        </div>
      )}
    </section>
  );
}
