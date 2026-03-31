import type { TransitionResult } from '@/types';

interface TransitionInfoProps {
  result: TransitionResult;
  fromChordName: string;
  toChordName: string;
}

const STRING_LABELS = ['6E', '5A', '4D', '3G', '2B', '1E'];

function fretDisplay(fret: number | null): string {
  if (fret === null) return 'x';
  if (fret === 0) return 'open';
  return String(fret);
}

function statusText(tone: TransitionResult['tones'][number]): string {
  switch (tone.type) {
    case 'stay': return 'stays';
    case 'lift': return 'lifts';
    case 'place': return 'places';
    case 'move': {
      const delta = tone.toFret! - tone.fromFret!;
      return delta > 0 ? `slides +${delta}` : `slides ${delta}`;
    }
  }
}

function statusColor(type: TransitionResult['tones'][number]['type']): string {
  switch (type) {
    case 'stay':  return 'var(--transition-stay)';
    case 'move':  return 'var(--transition-move)';
    case 'lift':  return 'var(--transition-lift)';
    case 'place': return 'var(--transition-place)';
  }
}

function difficultyColor(d: TransitionResult['difficulty']): string {
  switch (d) {
    case 'easy': return 'var(--color-success)';
    case 'moderate': return 'var(--color-warning)';
    case 'hard': return 'var(--color-error)';
  }
}

export default function TransitionInfo({ result, fromChordName, toChordName }: TransitionInfoProps) {
  return (
    <div
      className="rounded-lg px-4 py-4"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border-subtle)',
      }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <span className="text-base font-bold" style={{ color: 'var(--color-primary)' }}>
          {fromChordName}
        </span>
        <span style={{ color: 'var(--color-text-muted)' }}>→</span>
        <span className="text-base font-bold" style={{ color: 'var(--color-primary)' }}>
          {toChordName}
        </span>

        {/* Difficulty badge */}
        <span
          className="ml-auto text-xs font-semibold px-2.5 py-0.5 rounded-full"
          style={{
            color: difficultyColor(result.difficulty),
            border: `1px solid ${difficultyColor(result.difficulty)}`,
          }}
        >
          {result.difficulty}
        </span>
      </div>

      {/* Summary badges */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {result.commonToneCount > 0 && (
          <Badge color="var(--transition-stay)" label={`${result.commonToneCount} stay`} />
        )}
        {result.moveCount > 0 && (
          <Badge color="var(--transition-move)" label={`${result.moveCount} move`} />
        )}
        {result.liftCount > 0 && (
          <Badge color="var(--transition-lift)" label={`${result.liftCount} lift`} />
        )}
        {result.placeCount > 0 && (
          <Badge color="var(--transition-place)" label={`${result.placeCount} place`} />
        )}
        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          Total travel: {result.totalTravel} fret{result.totalTravel !== 1 ? 's' : ''}
        </span>
      </div>

      {/* String-by-string breakdown */}
      <div className="space-y-1">
        <div
          className="grid text-xs font-medium mb-1"
          style={{
            gridTemplateColumns: '40px 50px 20px 50px 1fr',
            color: 'var(--color-text-muted)',
          }}
        >
          <span>String</span>
          <span>From</span>
          <span />
          <span>To</span>
          <span>Action</span>
        </div>
        {result.tones.map((tone) => (
          <div
            key={tone.string}
            className="grid items-center text-sm"
            style={{
              gridTemplateColumns: '40px 50px 20px 50px 1fr',
              color: 'var(--color-text)',
            }}
          >
            <span className="font-medium" style={{ color: 'var(--color-text-muted)' }}>
              {STRING_LABELS[tone.string]}
            </span>
            <span>{fretDisplay(tone.fromFret)}</span>
            <span style={{ color: 'var(--color-text-muted)' }}>→</span>
            <span>{fretDisplay(tone.toFret)}</span>
            <span className="font-medium" style={{ color: statusColor(tone.type) }}>
              {statusText(tone)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Badge({ color, label }: { color: string; label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded"
      style={{
        color,
        backgroundColor: 'var(--color-surface-raised)',
        border: `1px solid ${color}`,
      }}
    >
      <span
        className="w-2 h-2 rounded-full inline-block"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}
