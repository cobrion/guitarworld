import { useMemo } from 'react';
import type { NoteName, ChordQuality, ChordVoicing } from '@/types';
import NeckFretboardGrid from '@/components/NeckFretboardGrid';
import ChordScaleNoteDots from '@/components/ChordScaleNoteDots';
import { buildLayout } from '@/utils/neckLayout';
import { getAllChordTones, getVoicingChordTones } from '@/utils/chordTones';
import { getAllScaleTones } from '@/utils/scaleTones';
import type { ScaleKind } from '@/utils/scaleTones';

const MINOR_FAMILY: Set<ChordQuality> = new Set([
  'minor', 'minor7', 'minor7b5', 'diminished', 'diminished7',
  'minor9', 'minor11', 'minor6', 'minoradd9',
]);

interface ChordScaleNeckProps {
  root: NoteName;
  quality: ChordQuality;
  voicing: ChordVoicing | null;
}

export default function ChordScaleNeck({
  root,
  quality,
  voicing,
}: ChordScaleNeckProps) {
  const totalFrets = 12;
  const orientation = 'horizontal' as const;
  const scaleKind: ScaleKind = MINOR_FAMILY.has(quality) ? 'natural-minor' : 'major';

  const layout = useMemo(() => buildLayout(orientation, totalFrets), []);

  const scaleTones = useMemo(
    () => getAllScaleTones(root, scaleKind, totalFrets),
    [root, scaleKind],
  );

  const chordTones = useMemo(
    () => getAllChordTones(root, quality, totalFrets),
    [root, quality],
  );

  const voicingTones = useMemo(
    () => (voicing ? getVoicingChordTones(root, quality, voicing) : []),
    [root, quality, voicing],
  );

  return (
    <div className="w-full overflow-x-auto" style={{ margin: '0 auto' }}>
      <svg
        viewBox={`0 0 ${layout.svgWidth} ${layout.svgHeight}`}
        role="img"
        aria-label="Chord tones on scale fretboard"
        style={{
          width: '100%',
          height: 'auto',
          minWidth: `${Math.min(layout.svgWidth, 500)}px`,
          display: 'block',
          margin: '0 auto',
        }}
      >
        <NeckFretboardGrid totalFrets={totalFrets} layout={layout} />
        <ChordScaleNoteDots
          scaleTones={scaleTones}
          chordTones={chordTones}
          voicingTones={voicingTones}
          layout={layout}
        />
      </svg>
    </div>
  );
}
