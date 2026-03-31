import type { NoteName, Key, IntervalName } from '@/types';
import type { ScaleKind } from '@/utils/scaleTones';
import { SCALE_FORMULAS } from '@/utils/scaleTones';
import { INTERVAL_COLORS, FLAT_KEYS } from '@/utils/constants';
import { noteToIndex, indexToNote } from '@/utils/musicTheory';

interface ScaleFormulaBarProps {
  root: NoteName;
  scaleKind: ScaleKind;
}

export default function ScaleFormulaBar({ root, scaleKind }: ScaleFormulaBarProps) {
  const formula = SCALE_FORMULAS[scaleKind];
  const rootIndex = noteToIndex(root);
  const preferFlats = FLAT_KEYS.has(root as Key);

  const noteCount = formula.length;

  // Compute step sizes between consecutive notes (in semitones)
  const steps: number[] = [];
  for (let i = 0; i < noteCount - 1; i++) {
    steps.push(formula[i + 1].semitones - formula[i].semitones);
  }

  // Layout
  const cellW = 64;
  const cellH = 58;
  const gap = 10;
  const formulaH = 28;
  const totalW = noteCount * cellW + (noteCount - 1) * gap;
  const formulaY = 0;
  const scaleY = formulaH;
  const totalH = scaleY + cellH + 4;

  function stepLabel(semitones: number): string {
    if (semitones === 1) return 'H';
    if (semitones === 2) return 'W';
    if (semitones === 3) return 'WH';
    return `${semitones}`;
  }

  return (
    <div className="overflow-x-auto scrollbar-none" style={{ WebkitOverflowScrolling: 'touch' }}>
      <svg
        viewBox={`0 0 ${totalW} ${totalH}`}
        style={{
          width: '100%',
          height: 'auto',
          minWidth: '320px',
          maxWidth: `${totalW}px`,
          display: 'block',
          margin: '0 auto',
        }}
        role="img"
        aria-label="Scale formula visualization"
      >
        {/* Step arcs between notes */}
        {steps.map((step, i) => {
          const x1 = i * (cellW + gap) + cellW / 2;
          const x2 = (i + 1) * (cellW + gap) + cellW / 2;
          const midX = (x1 + x2) / 2;
          const arcPeakY = formulaY + 4;
          const arcBaseY = formulaY + formulaH - 2;
          const label = stepLabel(step);
          const stepColor = step === 1 ? 'var(--color-warning)' : 'var(--color-text-muted)';

          return (
            <g key={`step-${i}`}>
              <path
                d={`M ${x1} ${arcBaseY} Q ${midX} ${arcPeakY} ${x2} ${arcBaseY}`}
                fill="none"
                stroke={stepColor}
                strokeWidth={1.5}
                opacity={0.6}
              />
              <rect
                x={midX - 12}
                y={arcPeakY - 2}
                width={24}
                height={14}
                rx={7}
                fill="var(--color-surface)"
                stroke={stepColor}
                strokeWidth={1}
                opacity={0.8}
              />
              <text
                x={midX}
                y={arcPeakY + 8}
                textAnchor="middle"
                fill={stepColor}
                fontSize={8}
                fontWeight={700}
                fontFamily="Inter, sans-serif"
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* Note boxes */}
        {formula.map((interval, i) => {
          const x = i * (cellW + gap);
          const noteIndex = (rootIndex + interval.semitones) % 12;
          const noteName = indexToNote(noteIndex, preferFlats);
          const color = INTERVAL_COLORS[interval.label as IntervalName];
          const isRoot = interval.label === 'R';
          const displayLabel = isRoot ? 'R' : interval.label;

          return (
            <g key={i}>
              <rect
                x={x}
                y={scaleY}
                width={cellW}
                height={cellH}
                rx={8}
                fill={color}
                stroke={color}
                strokeWidth={isRoot ? 2.5 : 1.5}
                opacity={isRoot ? 1 : 0.88}
              />
              {/* Note name */}
              <text
                x={x + cellW / 2}
                y={scaleY + 24}
                textAnchor="middle"
                fill="var(--diagram-dot-text)"
                fontSize={16}
                fontWeight={800}
                fontFamily="Inter, sans-serif"
              >
                {noteName}
              </text>
              {/* Interval label */}
              <text
                x={x + cellW / 2}
                y={scaleY + 44}
                textAnchor="middle"
                fill="var(--diagram-dot-text)"
                fontSize={10}
                fontWeight={600}
                fontFamily="Inter, sans-serif"
                opacity={0.75}
              >
                {displayLabel}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
