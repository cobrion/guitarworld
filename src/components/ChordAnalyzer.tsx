import { useState, useMemo } from 'react';
import type { NoteName, ChordQuality } from '@/types';
import { INTERVAL_COLORS } from '@/utils/constants';
import { qualitySuffix, lookupChord } from '@/utils/musicTheory';
import ChordDiagram from '@/components/ChordDiagram';
import {
  getChordFormulaDisplay,
  getChordNotesDisplay,
  getQualityDisplayName,
  CHORD_FORMULAS,
} from '@/utils/chordTones';
import { noteToIndex, indexToNote, getScaleNotes } from '@/utils/musicTheory';
import { FLAT_KEYS, MAJOR_SCALE_INTERVALS, MINOR_SCALE_INTERVALS } from '@/utils/constants';
import type { Key } from '@/types';
import type { IntervalName } from '@/types';
import ChordSelector from '@/components/ChordSelector';
import ChordScaleNeck from '@/components/ChordScaleNeck';

interface ChordToneInfo {
  noteName: string;
  label: string;
  displayLabel: string;
  color: string;
  semitones: number;
  chromaticIndex: number;
}

function intervalDegreeFamily(label: string): number {
  const map: Record<string, number> = {
    'R': 0, '2': 1, 'b9': 1, '9': 1, '#9': 1,
    'b3': 2, '3': 2, '4': 3, '11': 3,
    'b5': 4, '5': 4, '#5': 4,
    'b6': 5, '6': 5, '13': 5,
    'bb7': 6, 'b7': 6, '7': 6,
  };
  return map[label] ?? -1;
}

const DEGREE_FAMILY_LABELS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th'];

type SlotKind = 'kept' | 'altered' | 'removed' | 'added';

interface TransformSlot {
  degree: number;
  kind: SlotKind;
  majorLabel: string | null;
  majorNote: string | null;
  majorColor: string | null;
  chordLabel: string | null;
  chordNote: string | null;
  chordColor: string | null;
}

function buildTransformSlots(
  root: NoteName,
  quality: ChordQuality,
): TransformSlot[] {
  const majorFormula = CHORD_FORMULAS['major'];
  const chordFormula = CHORD_FORMULAS[quality];
  const rootIdx = noteToIndex(root);
  const preferFlats = FLAT_KEYS.has(root as Key);

  const resolveNote = (semitones: number) =>
    indexToNote((rootIdx + semitones) % 12, preferFlats);

  const majorByDegree = new Map<number, { label: string; note: string; color: string }>();
  for (const i of majorFormula) {
    const deg = intervalDegreeFamily(i.label);
    majorByDegree.set(deg, {
      label: i.label,
      note: resolveNote(i.semitones),
      color: INTERVAL_COLORS[i.label as IntervalName],
    });
  }

  const chordByDegree = new Map<number, { label: string; note: string; color: string }>();
  for (const i of chordFormula) {
    const deg = intervalDegreeFamily(i.label);
    chordByDegree.set(deg, {
      label: i.label,
      note: resolveNote(i.semitones),
      color: INTERVAL_COLORS[i.label as IntervalName],
    });
  }

  const allDegrees = new Set([...majorByDegree.keys(), ...chordByDegree.keys()]);
  const sorted = [...allDegrees].sort((a, b) => a - b);

  return sorted.map((deg) => {
    const maj = majorByDegree.get(deg);
    const chd = chordByDegree.get(deg);

    let kind: SlotKind;
    if (maj && chd && maj.label === chd.label) kind = 'kept';
    else if (maj && chd) kind = 'altered';
    else if (maj && !chd) kind = 'removed';
    else kind = 'added';

    return {
      degree: deg,
      kind,
      majorLabel: maj?.label ?? null,
      majorNote: maj?.note ?? null,
      majorColor: maj?.color ?? null,
      chordLabel: chd?.label ?? null,
      chordNote: chd?.note ?? null,
      chordColor: chd?.color ?? null,
    };
  });
}

function ChordTransformation({
  root,
  quality,
  chordName,
}: {
  root: NoteName;
  quality: ChordQuality;
  chordName: string;
}) {
  const slots = useMemo(() => buildTransformSlots(root, quality), [root, quality]);

  if (quality === 'major') return null;

  const majorLabel = `${root} Major`;

  const labelW = 70;
  const pillW = 64;
  const pillH = 36;
  const gap = 12;
  const rowGap = 50;
  const degreeLabelsH = 14;
  const topY = degreeLabelsH;
  const arrowZone = topY + pillH;
  const bottomY = arrowZone + rowGap;
  const pillsW = slots.length * pillW + (slots.length - 1) * gap;
  const totalW = labelW + pillsW;
  const totalH = bottomY + pillH + 4;

  const kindSymbol = (kind: SlotKind) => {
    switch (kind) {
      case 'kept': return '=';
      case 'altered': return '→';
      case 'removed': return '×';
      case 'added': return '+';
    }
  };

  const kindColor = (kind: SlotKind) => {
    switch (kind) {
      case 'kept': return 'var(--color-success, #22c55e)';
      case 'altered': return 'var(--color-warning, #f59e0b)';
      case 'removed': return 'var(--color-error, #ef4444)';
      case 'added': return 'var(--color-info, #3b82f6)';
    }
  };

  return (
    <div className="overflow-x-auto scrollbar-none" style={{ WebkitOverflowScrolling: 'touch' }}>
      <svg
        viewBox={`0 0 ${totalW} ${totalH}`}
        style={{ width: '100%', height: 'auto', minWidth: '320px', maxWidth: `${totalW}px`, display: 'block', margin: '0 auto' }}
        role="img"
        aria-label={`How ${chordName} is built from ${majorLabel}`}
      >
        {/* Row labels */}
        <text
          x={labelW - 8} y={topY + pillH / 2 + 4}
          textAnchor="end"
          fill="var(--color-text-muted)"
          fontSize={10} fontWeight={600} fontFamily="Inter, sans-serif"
        >
          {majorLabel}
        </text>
        <text
          x={labelW - 8} y={bottomY + pillH / 2 + 4}
          textAnchor="end"
          fill="var(--color-primary)"
          fontSize={10} fontWeight={700} fontFamily="Inter, sans-serif"
        >
          {chordName}
        </text>

        {slots.map((slot, i) => {
          const x = labelW + i * (pillW + gap);
          const cx = x + pillW / 2;
          const color = kindColor(slot.kind);

          return (
            <g key={slot.degree}>
              {/* Degree family label */}
              <text
                x={cx} y={topY - 6}
                textAnchor="middle"
                fill="var(--color-text-muted)"
                fontSize={8} fontFamily="Inter, sans-serif" fontWeight={500}
              >
                {DEGREE_FAMILY_LABELS[slot.degree]}
              </text>

              {/* Major row pill */}
              {slot.majorLabel ? (
                <g opacity={slot.kind === 'removed' ? 0.4 : slot.kind === 'kept' ? 0.5 : 0.5}>
                  <rect
                    x={x} y={topY}
                    width={pillW} height={pillH}
                    rx={8}
                    fill={slot.majorColor!}
                    opacity={0.8}
                  />
                  <text
                    x={cx} y={topY + 14}
                    textAnchor="middle"
                    fill="var(--diagram-dot-text, #fff)"
                    fontSize={9} fontWeight={700} fontFamily="Inter, sans-serif"
                  >
                    {slot.majorLabel}
                  </text>
                  <text
                    x={cx} y={topY + 28}
                    textAnchor="middle"
                    fill="var(--diagram-dot-text, #fff)"
                    fontSize={12} fontWeight={800} fontFamily="Inter, sans-serif"
                  >
                    {slot.majorNote}
                  </text>
                  {slot.kind === 'removed' && (
                    <line
                      x1={x + 4} y1={topY + pillH / 2}
                      x2={x + pillW - 4} y2={topY + pillH / 2}
                      stroke="var(--color-error, #ef4444)" strokeWidth={2}
                    />
                  )}
                </g>
              ) : (
                <rect
                  x={x} y={topY}
                  width={pillW} height={pillH}
                  rx={8}
                  fill="none"
                  stroke="var(--color-border)"
                  strokeWidth={1}
                  strokeDasharray="4 2"
                  opacity={0.3}
                />
              )}

              {/* Connection arrow / symbol */}
              <text
                x={cx} y={arrowZone + rowGap / 2 + 4}
                textAnchor="middle"
                fill={color}
                fontSize={14} fontWeight={800} fontFamily="Inter, sans-serif"
              >
                {kindSymbol(slot.kind)}
              </text>
              {slot.kind === 'altered' && (
                <text
                  x={cx} y={arrowZone + rowGap / 2 + 18}
                  textAnchor="middle"
                  fill={color}
                  fontSize={8} fontWeight={600} fontFamily="Inter, sans-serif"
                >
                  {slot.majorLabel}→{slot.chordLabel}
                </text>
              )}

              {/* Chord row pill */}
              {slot.chordLabel ? (
                <g>
                  <rect
                    x={x} y={bottomY}
                    width={pillW} height={pillH}
                    rx={8}
                    fill={slot.chordColor!}
                    stroke={slot.kind === 'added' || slot.kind === 'altered' ? color : 'none'}
                    strokeWidth={slot.kind === 'added' || slot.kind === 'altered' ? 2 : 0}
                  />
                  <text
                    x={cx} y={bottomY + 14}
                    textAnchor="middle"
                    fill="var(--diagram-dot-text, #fff)"
                    fontSize={9} fontWeight={700} fontFamily="Inter, sans-serif"
                  >
                    {slot.chordLabel}
                  </text>
                  <text
                    x={cx} y={bottomY + 28}
                    textAnchor="middle"
                    fill="var(--diagram-dot-text, #fff)"
                    fontSize={12} fontWeight={800} fontFamily="Inter, sans-serif"
                  >
                    {slot.chordNote}
                  </text>
                </g>
              ) : (
                <rect
                  x={x} y={bottomY}
                  width={pillW} height={pillH}
                  rx={8}
                  fill="none"
                  stroke="var(--color-border)"
                  strokeWidth={1}
                  strokeDasharray="4 2"
                  opacity={0.3}
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
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
  'minor', 'minor7', 'minor7b5', 'diminished', 'diminished7', 'minor9', 'minor11', 'minor6', 'minoradd9',
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

export default function ChordAnalyzer() {
  const [selectedRoot, setSelectedRoot] = useState<NoteName>('C');
  const [selectedQuality, setSelectedQuality] = useState<ChordQuality>('major');
  const [voicingIndex, setVoicingIndex] = useState(0);

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


  const allChordVoicings = useMemo(() => {
    const data = lookupChord(chordName, selectedRoot);
    return data?.voicings ?? [];
  }, [chordName, selectedRoot]);

  const safeIndex = allChordVoicings.length > 0 ? voicingIndex % allChordVoicings.length : 0;
  const chordVoicing = allChordVoicings[safeIndex] ?? null;
  const totalVoicings = allChordVoicings.length;

  const handleRootChange = (root: NoteName) => { setSelectedRoot(root); setVoicingIndex(0); };
  const handleQualityChange = (quality: ChordQuality) => { setSelectedQuality(quality); setVoicingIndex(0); };
  const prevVoicing = () => setVoicingIndex((i) => (i - 1 + totalVoicings) % totalVoicings);
  const nextVoicing = () => setVoicingIndex((i) => (i + 1) % totalVoicings);

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
          onRootChange={handleRootChange}
          onQualityChange={handleQualityChange}
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

      {/* Chord Transformation — how selected chord differs from major */}
      {selectedQuality !== 'major' && (
        <div
          className="rounded-lg px-4 py-3 mb-5"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
              How <span style={{ color: 'var(--color-primary)' }}>{chordName}</span> is built from <span style={{ color: 'var(--color-text)' }}>{selectedRoot} Major</span>
            </span>
            <div className="flex gap-3 text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
              <span><span style={{ color: 'var(--color-success, #22c55e)' }}>■</span> kept</span>
              <span><span style={{ color: 'var(--color-warning, #f59e0b)' }}>■</span> altered</span>
              <span><span style={{ color: 'var(--color-info, #3b82f6)' }}>■</span> added</span>
              <span><span style={{ color: 'var(--color-error, #ef4444)' }}>■</span> removed</span>
            </div>
          </div>
          <ChordTransformation root={selectedRoot} quality={selectedQuality} chordName={chordName} />
        </div>
      )}

      {/* Fingering diagram with voicing navigation */}
      {chordVoicing && (
        <div
          className="rounded-lg px-4 py-3 mb-5"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          <span className="text-xs font-medium block mb-3" style={{ color: 'var(--color-text-muted)' }}>
            {chordName} voicing
          </span>
          <div className="flex flex-col items-center">
            <div style={{ width: 120 }}>
              <ChordDiagram voicing={chordVoicing} chordName={chordName} />
            </div>
            {totalVoicings > 1 && (
              <div className="flex items-center justify-center gap-3 mt-2">
                <button
                  onClick={prevVoicing}
                  className="px-2 py-0.5 rounded text-xs font-bold"
                  style={{ color: 'var(--color-primary)', background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)' }}
                >
                  &laquo;
                </button>
                <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                  {safeIndex + 1} / {totalVoicings}
                </span>
                <button
                  onClick={nextVoicing}
                  className="px-2 py-0.5 rounded text-xs font-bold"
                  style={{ color: 'var(--color-primary)', background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)' }}
                >
                  &raquo;
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Scale fretboard — chord tones in scale context */}
      <div
        className="rounded-lg px-4 py-3 mb-5"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border-subtle)',
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
            <span style={{ color: 'var(--color-primary)' }}>{chordName}</span> tones on the{' '}
            <span style={{ color: 'var(--color-text)' }}>
              {selectedRoot} {MINOR_FAMILY_QUALITIES.has(selectedQuality) ? 'minor' : 'major'} scale
            </span>
          </span>
          <div className="flex gap-3 text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
            <span>● chord tone</span>
            <span style={{ opacity: 0.4 }}>● scale tone</span>
            {chordVoicing && <span>◎ voicing</span>}
          </div>
        </div>
        <ChordScaleNeck
          root={selectedRoot}
          quality={selectedQuality}
          voicing={chordVoicing}
        />
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
