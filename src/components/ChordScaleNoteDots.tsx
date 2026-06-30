import type { ChordTone } from '@/types';
import type { NeckLayout } from '@/utils/neckLayout';

interface ChordScaleNoteDotsProps {
  scaleTones: ChordTone[];
  chordTones: ChordTone[];
  voicingTones: ChordTone[];
  layout: NeckLayout;
}

function dotPosition(
  tone: ChordTone,
  layout: NeckLayout,
): { cx: number; cy: number } {
  const { stringCoord, fretCoord, stringsHorizontal } = layout;
  const sPos = stringCoord(tone.string);

  if (tone.fret === 0) {
    const nutPos = fretCoord(0);
    return stringsHorizontal
      ? { cx: nutPos - 16, cy: sPos }
      : { cx: sPos, cy: nutPos - 16 };
  }

  const midFret = (fretCoord(tone.fret - 1) + fretCoord(tone.fret)) / 2;
  return stringsHorizontal
    ? { cx: midFret, cy: sPos }
    : { cx: sPos, cy: midFret };
}

export default function ChordScaleNoteDots({
  scaleTones,
  chordTones,
  voicingTones,
  layout,
}: ChordScaleNoteDotsProps) {
  const chordSet = new Set(chordTones.map((t) => `${t.string}-${t.fret}`));
  const voicingSet = new Set(voicingTones.map((t) => `${t.string}-${t.fret}`));

  const chordByKey = new Map<string, ChordTone>();
  for (const t of chordTones) {
    chordByKey.set(`${t.string}-${t.fret}`, t);
  }

  // Collect chord tones that are NOT in the scale (altered tones)
  const scaleSet = new Set(scaleTones.map((t) => `${t.string}-${t.fret}`));
  const alteredChordTones = chordTones.filter((t) => !scaleSet.has(`${t.string}-${t.fret}`));

  const intervalDisplay = (label: string) => (label === 'R' ? '1' : label);

  return (
    <g>
      {/* Scale-only tones (not chord tones) — small muted dots */}
      {scaleTones.map((tone, i) => {
        const key = `${tone.string}-${tone.fret}`;
        if (chordSet.has(key)) return null;

        const { cx, cy } = dotPosition(tone, layout);
        const r = 7;
        const isOpen = tone.fret === 0;

        return (
          <g key={`s-${key}-${i}`} opacity={0.3}>
            {isOpen && <circle cx={cx} cy={cy} r={r + 2} fill="var(--neck-bg)" />}
            <circle
              cx={cx} cy={cy} r={r}
              fill={isOpen ? 'transparent' : 'var(--color-text-muted)'}
              stroke="var(--color-text-muted)"
              strokeWidth={isOpen ? 1.5 : 0}
            />
            <text
              x={cx} y={cy + 3}
              textAnchor="middle"
              fill={isOpen ? 'var(--color-text-muted)' : 'var(--diagram-dot-text)'}
              fontSize={7} fontWeight={600} fontFamily="Inter, sans-serif"
              style={{ pointerEvents: 'none' }}
            >
              {tone.noteName}
            </text>
          </g>
        );
      })}

      {/* Chord tones that ARE in the scale — full color with interval label */}
      {scaleTones.map((tone, i) => {
        const key = `${tone.string}-${tone.fret}`;
        const chordTone = chordByKey.get(key);
        if (!chordTone) return null;

        const { cx, cy } = dotPosition(tone, layout);
        const r = 11;
        const isOpen = tone.fret === 0;
        const isVoicing = voicingSet.has(key);

        return (
          <g key={`c-${key}-${i}`} opacity={0.88}>
            <title>{`${chordTone.noteName} - ${chordTone.interval === 'R' ? 'Root' : chordTone.interval} - String ${chordTone.string + 1}, Fret ${chordTone.fret}`}</title>
            {isOpen && <circle cx={cx} cy={cy} r={r + 2} fill="var(--neck-bg)" />}
            {isVoicing && (
              <circle
                cx={cx} cy={cy} r={14}
                fill="none"
                stroke="var(--color-text)"
                strokeWidth={2.5}
                opacity={0.9}
              />
            )}
            <circle
              cx={cx} cy={cy} r={r}
              fill={isOpen ? 'transparent' : chordTone.color}
              stroke={chordTone.color}
              strokeWidth={isOpen ? 2.5 : 0}
            />
            <text
              x={cx} y={cy + 3.5}
              textAnchor="middle"
              fill={isOpen ? chordTone.color : 'var(--diagram-dot-text)'}
              fontSize={10} fontWeight={800} fontFamily="Inter, sans-serif"
              style={{ pointerEvents: 'none' }}
            >
              {chordTone.noteName}
            </text>
            <text
              x={cx + r + 2} y={cy + r + 2}
              textAnchor="start"
              fill={chordTone.color}
              fontSize={7} fontWeight={700} fontFamily="Inter, sans-serif"
              style={{ pointerEvents: 'none' }}
            >
              {intervalDisplay(chordTone.interval)}
            </text>
          </g>
        );
      })}

      {/* Altered chord tones (outside the scale) — dashed outline */}
      {alteredChordTones.map((tone, i) => {
        const key = `${tone.string}-${tone.fret}`;
        const { cx, cy } = dotPosition(tone, layout);
        const r = 11;
        const isOpen = tone.fret === 0;
        const isVoicing = voicingSet.has(key);

        return (
          <g key={`a-${key}-${i}`} opacity={0.75}>
            <title>{`${tone.noteName} - ${tone.interval === 'R' ? 'Root' : tone.interval} (altered) - String ${tone.string + 1}, Fret ${tone.fret}`}</title>
            {isOpen && <circle cx={cx} cy={cy} r={r + 2} fill="var(--neck-bg)" />}
            {isVoicing && (
              <circle
                cx={cx} cy={cy} r={14}
                fill="none"
                stroke="var(--color-text)"
                strokeWidth={2.5}
                opacity={0.9}
              />
            )}
            <circle
              cx={cx} cy={cy} r={r}
              fill={isOpen ? 'transparent' : tone.color}
              stroke={tone.color}
              strokeWidth={isOpen ? 2.5 : 0}
              strokeDasharray={isOpen ? '3 2' : undefined}
            />
            {!isOpen && (
              <circle
                cx={cx} cy={cy} r={r + 1.5}
                fill="none"
                stroke={tone.color}
                strokeWidth={1}
                strokeDasharray="3 2"
                opacity={0.6}
              />
            )}
            <text
              x={cx} y={cy + 3.5}
              textAnchor="middle"
              fill={isOpen ? tone.color : 'var(--diagram-dot-text)'}
              fontSize={10} fontWeight={800} fontFamily="Inter, sans-serif"
              style={{ pointerEvents: 'none' }}
            >
              {tone.noteName}
            </text>
            <text
              x={cx + r + 2} y={cy + r + 2}
              textAnchor="start"
              fill={tone.color}
              fontSize={7} fontWeight={700} fontFamily="Inter, sans-serif"
              style={{ pointerEvents: 'none' }}
            >
              {intervalDisplay(tone.interval)}
            </text>
          </g>
        );
      })}
    </g>
  );
}
