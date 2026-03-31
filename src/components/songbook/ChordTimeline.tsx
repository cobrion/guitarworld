import { useMemo } from 'react';
import type { Song } from '@/types';
import { parseChordProLine } from '@/utils/chordpro';
import { transposeChord, getTransposedKey } from '@/utils/transpose';
import { analyzeChordInKey, getHarmonicFunctionColor } from '@/utils/harmonicAnalysis';

interface TimelineSegment {
  chord: string;
  weight: number;
  sectionIndex: number;
  color: string;
}

interface ChordTimelineProps {
  song: Song;
  transpose: number;
  activeSectionIndex: number;
  onSegmentClick?: (sectionIndex: number) => void;
}

export default function ChordTimeline({ song, transpose, activeSectionIndex, onSegmentClick }: ChordTimelineProps) {
  const effectiveKey = useMemo(
    () => transpose === 0 ? song.key : getTransposedKey(song.key, transpose),
    [song.key, transpose]
  );

  const segments = useMemo(() => {
    const result: TimelineSegment[] = [];

    for (let si = 0; si < song.sections.length; si++) {
      const section = song.sections[si];
      for (const line of section.lines) {
        const parsed = parseChordProLine(line);
        for (const seg of parsed.segments) {
          if (seg.chord) {
            const displayChord = transpose !== 0
              ? transposeChord(seg.chord, transpose, effectiveKey)
              : seg.chord;
            const analysis = analyzeChordInKey(displayChord, effectiveKey);
            const weight = Math.max(seg.lyrics.length, 2);
            result.push({
              chord: displayChord,
              weight,
              sectionIndex: si,
              color: getHarmonicFunctionColor(analysis.function),
            });
          }
        }
      }
    }
    return result;
  }, [song, transpose, effectiveKey]);

  const totalWeight = segments.reduce((sum, s) => sum + s.weight, 0);

  // Find section boundary indices
  const sectionBoundaries = useMemo(() => {
    const boundaries: number[] = [];
    let lastSection = -1;
    for (let i = 0; i < segments.length; i++) {
      if (segments[i].sectionIndex !== lastSection) {
        if (lastSection !== -1) boundaries.push(i);
        lastSection = segments[i].sectionIndex;
      }
    }
    return boundaries;
  }, [segments]);

  if (segments.length === 0) return null;

  return (
    <div
      className="px-4 py-2"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border-subtle)',
      }}
    >
      <div
        className="flex rounded-md overflow-hidden"
        style={{ height: '24px' }}
      >
        {segments.map((seg, i) => {
          const widthPercent = (seg.weight / totalWeight) * 100;
          const isActiveSection = seg.sectionIndex === activeSectionIndex;

          return (
            <div
              key={i}
              onClick={() => onSegmentClick?.(seg.sectionIndex)}
              title={`${seg.chord} — ${song.sections[seg.sectionIndex]?.label}`}
              className="cursor-pointer transition-opacity"
              style={{
                flex: `${widthPercent} 0 0%`,
                backgroundColor: seg.color,
                opacity: isActiveSection ? 1 : 0.45,
                borderRight: sectionBoundaries.includes(i + 1)
                  ? '2px solid var(--color-bg)'
                  : '0.5px solid rgba(0,0,0,0.15)',
                minWidth: '2px',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
