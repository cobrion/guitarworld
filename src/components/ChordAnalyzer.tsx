import { useState, useMemo } from 'react';
import type { NoteName, ChordQuality, Orientation } from '@/types';
import { TOTAL_FRETS, INTERVAL_COLORS } from '@/utils/constants';
import { qualitySuffix, lookupChord } from '@/utils/musicTheory';
import ChordDiagram from '@/components/ChordDiagram';
import {
  getAllChordTones,
  getChordFormulaDisplay,
  getChordNotesDisplay,
  getQualityDisplayName,
  getMovableBarrePositions,
  CHORD_FORMULAS,
} from '@/utils/chordTones';
import { noteToIndex, indexToNote, getScaleNotes } from '@/utils/musicTheory';
import { FLAT_KEYS, MAJOR_SCALE_INTERVALS, MINOR_SCALE_INTERVALS } from '@/utils/constants';
import type { Key } from '@/types';
import type { IntervalName } from '@/types';
import ChordSelector from '@/components/ChordSelector';
import OrientationToggle from '@/components/OrientationToggle';
import GuitarNeck from '@/components/GuitarNeck';

interface ChordToneInfo {
  noteName: string;
  label: string;
  displayLabel: string;
  color: string;
  semitones: number;
  chromaticIndex: number;
}

const DEGREE_NAMES = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th'] as const;

/**
 * Map an interval label to which scale degree it relates to (0-indexed).
 * e.g. 'R' → 0, '3' or 'b3' → 2, '5' or 'b5' or '#5' → 4, '7' or 'b7' → 6, '9' → 1, '11' → 3, '13' → 5
 */
function intervalToScaleDegree(label: string): number {
  const map: Record<string, number> = {
    'R': 0, '2': 1, 'b3': 2, '3': 2, '4': 3, 'b5': 4, '5': 4, '#5': 4,
    '6': 5, 'bb7': 6, 'b7': 6, '7': 6, 'b9': 1, '9': 1, '#9': 1, '11': 3, '13': 5,
  };
  return map[label] ?? 0;
}

/** Qualities that are built from the minor scale */
const MINOR_FAMILY_QUALITIES = new Set<ChordQuality>([
  'minor', 'minor7', 'minor7b5', 'diminished', 'diminished7', 'minor9', 'minor11', 'minor6',
]);

/** Visual scale-degree builder showing how chord tones are picked from the scale */
function IntervalBuilder({
  root,
  toneInfos,
  quality,
}: {
  root: NoteName;
  toneInfos: ChordToneInfo[];
  quality: ChordQuality;
}) {
  const isMinorFamily = MINOR_FAMILY_QUALITIES.has(quality);
  const scaleType = isMinorFamily ? 'minor' : 'major';
  const scaleIntervals = isMinorFamily ? MINOR_SCALE_INTERVALS : MAJOR_SCALE_INTERVALS;

  // Get the 7 notes of the appropriate scale for this root
  const scaleNotes = getScaleNotes(root as Key, scaleType);

  // Map each chord tone to its scale degree position
  const degreeMap = new Map<number, ChordToneInfo[]>();
  for (const tone of toneInfos) {
    const deg = intervalToScaleDegree(tone.label);
    if (!degreeMap.has(deg)) degreeMap.set(deg, []);
    degreeMap.get(deg)!.push(tone);
  }

  // Step pattern between consecutive scale notes (in semitones)
  const scaleSteps = Array.from({ length: 6 }, (_, i) =>
    scaleIntervals[i + 1] - scaleIntervals[i]
  );

  // Layout
  const cellW = 72;
  const cellH = 70;
  const gap = 8;
  const formulaH = 30;
  const totalW = 7 * cellW + 6 * gap;
  const formulaY = 0;
  const scaleY = formulaH;
  const totalH = scaleY + cellH + 4;

  return (
    <div className="overflow-x-auto scrollbar-none" style={{ WebkitOverflowScrolling: 'touch' }}>
      <svg
        viewBox={`0 0 ${totalW} ${totalH}`}
        style={{ width: '100%', height: 'auto', minWidth: '380px', maxWidth: `${totalW}px`, display: 'block', margin: '0 auto' }}
        role="img"
        aria-label="Chord scale degree builder"
      >
        {/* Scale formula arcs — W/H steps between notes */}
        {scaleSteps.map((step, i) => {
          const x1 = i * (cellW + gap) + cellW / 2;
          const x2 = (i + 1) * (cellW + gap) + cellW / 2;
          const midX = (x1 + x2) / 2;
          const arcPeakY = formulaY + 4;
          const arcBaseY = formulaY + formulaH - 2;
          const stepLabel = step === 1 ? 'H' : step === 2 ? 'W' : `${step}`;
          const stepColor = step === 1 ? 'var(--color-warning)' : 'var(--color-text-muted)';

          return (
            <g key={`step-${i}`}>
              {/* Arc */}
              <path
                d={`M ${x1} ${arcBaseY} Q ${midX} ${arcPeakY} ${x2} ${arcBaseY}`}
                fill="none"
                stroke={stepColor}
                strokeWidth={1.5}
                opacity={0.6}
              />
              {/* Step label pill */}
              <rect
                x={midX - 10} y={arcPeakY - 2}
                width={20} height={14}
                rx={7}
                fill="var(--color-surface)"
                stroke={stepColor}
                strokeWidth={1}
                opacity={0.8}
              />
              <text
                x={midX} y={arcPeakY + 8}
                textAnchor="middle"
                fill={stepColor}
                fontSize={8} fontWeight={700} fontFamily="Inter, sans-serif"
              >
                {stepLabel}
              </text>
            </g>
          );
        })}

        {/* Scale row — 7 boxes */}
        {scaleNotes.map((note, i) => {
          const x = i * (cellW + gap);
          const tones = degreeMap.get(i);
          const isSelected = !!tones;
          const tone = tones?.[0];
          const isAltered = tone && tone.noteName !== note;

          return (
            <g key={i}>
              {/* Scale degree cell */}
              <rect
                x={x} y={scaleY}
                width={cellW} height={cellH}
                rx={8}
                fill={isSelected && !isAltered ? tone!.color : 'var(--color-surface-raised)'}
                stroke={isSelected ? (tone?.color ?? 'var(--color-border)') : 'var(--color-border)'}
                strokeWidth={isSelected ? 2 : 0.5}
                opacity={isSelected && !isAltered ? 1 : isSelected ? 0.5 : 0.35}
              />
              {/* Degree label (1st, 2nd, 3rd...) */}
              <text
                x={x + cellW / 2} y={scaleY + 18}
                textAnchor="middle"
                fill={isSelected && !isAltered ? 'var(--diagram-dot-text)' : 'var(--color-text-muted)'}
                fontSize={10} fontWeight={600} fontFamily="Inter, sans-serif"
                opacity={isAltered ? 0.5 : 1}
              >
                {DEGREE_NAMES[i]}
              </text>
              {/* Note name */}
              <text
                x={x + cellW / 2} y={scaleY + 40}
                textAnchor="middle"
                fill={isSelected && !isAltered ? 'var(--diagram-dot-text)' : 'var(--color-text-muted)'}
                fontSize={18} fontWeight={800} fontFamily="Inter, sans-serif"
                opacity={isAltered ? 0.4 : 1}
                style={isAltered ? { textDecoration: 'line-through' } : undefined}
              >
                {note}
              </text>
              {/* "picked" label for unaltered selections */}
              {isSelected && !isAltered && (
                <text
                  x={x + cellW / 2} y={scaleY + 56}
                  textAnchor="middle"
                  fill="var(--diagram-dot-text)"
                  fontSize={8} fontWeight={500} fontFamily="Inter, sans-serif"
                  opacity={0.7}
                >
                  pick {DEGREE_NAMES[i]}
                </text>
              )}

            </g>
          );
        })}
      </svg>
    </div>
  );
}

function useDefaultOrientation(): Orientation {
  const [orientation] = useState<Orientation>(() =>
    typeof window !== 'undefined' && window.innerWidth >= 640
      ? 'horizontal'
      : 'vertical',
  );
  return orientation;
}

export default function ChordAnalyzer() {
  const [selectedRoot, setSelectedRoot] = useState<NoteName>('C');
  const [selectedQuality, setSelectedQuality] = useState<ChordQuality>('major');
  const defaultOrientation = useDefaultOrientation();
  const [orientation, setOrientation] = useState<Orientation>(defaultOrientation);

  const tones = useMemo(
    () => getAllChordTones(selectedRoot, selectedQuality, TOTAL_FRETS),
    [selectedRoot, selectedQuality],
  );

  const legendIntervals: ChordToneInfo[] = useMemo(() => {
    const formula = CHORD_FORMULAS[selectedQuality];
    if (!formula) return [];
    const rootIndex = noteToIndex(selectedRoot);
    const preferFlats = FLAT_KEYS.has(selectedRoot as Key);
    return formula.map((i) => {
      const chromaticIndex = (rootIndex + i.semitones) % 12;
      const noteName = indexToNote(chromaticIndex, preferFlats);
      return {
        label: i.label,
        displayLabel: i.label === 'R' ? 'Root' : i.label,
        color: INTERVAL_COLORS[i.label as IntervalName],
        noteName,
        semitones: i.semitones,
        chromaticIndex,
      };
    });
  }, [selectedQuality, selectedRoot]);

  const formulaStr = getChordFormulaDisplay(selectedQuality);
  const notesStr = getChordNotesDisplay(selectedRoot, selectedQuality);
  const chordName = `${selectedRoot}${qualitySuffix(selectedQuality)}`;

  const neckBarres = useMemo(
    () => getMovableBarrePositions(selectedRoot, selectedQuality, TOTAL_FRETS),
    [selectedRoot, selectedQuality],
  );

  const firstVoicing = useMemo(() => {
    const data = lookupChord(chordName, selectedRoot);
    return data?.voicings[0] ?? null;
  }, [chordName, selectedRoot]);

  return (
    <div className="px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg sm:text-xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>
          Chord Analyzer
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Explore how chords are constructed on the fretboard
        </p>
      </div>

      {/* Controls row */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <ChordSelector
          root={selectedRoot}
          quality={selectedQuality}
          onRootChange={setSelectedRoot}
          onQualityChange={setSelectedQuality}
        />
        <OrientationToggle
          orientation={orientation}
          onToggle={() => setOrientation((o) => (o === 'vertical' ? 'horizontal' : 'vertical'))}
        />
      </div>

      {/* Interval Builder — chromatic scale visualization */}
      <div
        className="rounded-lg px-4 py-3 mb-5"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border-subtle)',
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
            How <span style={{ color: 'var(--color-primary)' }}>{chordName}</span> is built — pick degrees from the <span style={{ color: 'var(--color-text)' }}>{selectedRoot} {MINOR_FAMILY_QUALITIES.has(selectedQuality) ? 'minor' : 'major'} scale</span>
          </span>
          <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
            Scale formula: <span style={{ color: 'var(--color-text)' }}>W</span> = whole step
            <span style={{ color: 'var(--color-warning)', marginLeft: '6px' }}>H</span> = half step
          </span>
        </div>
        <IntervalBuilder root={selectedRoot} toneInfos={legendIntervals} quality={selectedQuality} />
      </div>

      {/* Guitar neck */}
      <div
        className="rounded-xl p-2 sm:p-3 mb-5"
        style={{ backgroundColor: 'var(--neck-bg)', boxShadow: 'var(--shadow-md)' }}
      >
        <GuitarNeck
          tones={tones}
          orientation={orientation}
          totalFrets={TOTAL_FRETS}
          barres={neckBarres}
        />
      </div>

      {/* Basic voicing */}
      <div
        className="rounded-lg px-4 py-3 mb-5"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border-subtle)',
        }}
      >
        <span
          className="text-xs font-medium block mb-2"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Basic Voicing
        </span>
        {firstVoicing ? (
          <div style={{ width: 140 }}>
            <ChordDiagram voicing={firstVoicing} chordName={chordName} />
          </div>
        ) : (
          <p className="text-xs py-4" style={{ color: 'var(--color-text-muted)' }}>
            No voicing available
          </p>
        )}
      </div>

      {/* Info panel */}
      <div
        className="rounded-lg px-4 py-3"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border-subtle)',
        }}
      >
        <div className="flex flex-wrap gap-x-8 gap-y-2">
          <div>
            <span className="text-xs font-medium block mb-0.5" style={{ color: 'var(--color-text-muted)' }}>Chord</span>
            <span className="text-base font-bold" style={{ color: 'var(--color-primary)' }}>{chordName}</span>
            <span className="text-sm ml-2" style={{ color: 'var(--color-text-muted)' }}>({getQualityDisplayName(selectedQuality)})</span>
          </div>
          <div>
            <span className="text-xs font-medium block mb-0.5" style={{ color: 'var(--color-text-muted)' }}>Formula</span>
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{formulaStr}</span>
          </div>
          <div>
            <span className="text-xs font-medium block mb-0.5" style={{ color: 'var(--color-text-muted)' }}>Notes</span>
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{notesStr}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
