import type { ChordTone } from '@/types';
import type { NeckLayout } from '@/components/GuitarNeck';

interface PositionConnectingLinesProps {
  tones: ChordTone[];
  layout: NeckLayout;
}

/** Compute the center (cx, cy) of a tone dot on the fretboard */
function toneCenter(
  tone: ChordTone,
  layout: NeckLayout,
): { cx: number; cy: number } {
  const { stringCoord, fretCoord, stringsHorizontal } = layout;
  const sPos = stringCoord(tone.string);
  const isOpen = tone.fret === 0;

  if (isOpen) {
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

export default function PositionConnectingLines({
  tones,
  layout,
}: PositionConnectingLinesProps) {
  if (tones.length < 2) return null;

  const lines: React.ReactElement[] = [];

  for (let i = 0; i < tones.length - 1; i++) {
    const from = toneCenter(tones[i], layout);
    const to = toneCenter(tones[i + 1], layout);

    const sameString = tones[i].string === tones[i + 1].string;

    if (sameString) {
      // Straight line on same string
      lines.push(
        <line
          key={`line-${i}`}
          x1={from.cx}
          y1={from.cy}
          x2={to.cx}
          y2={to.cy}
          stroke="var(--color-primary)"
          strokeWidth={2}
          strokeOpacity={0.3}
          strokeLinecap="round"
        />,
      );
    } else {
      // Curved line crossing strings — gentle bezier
      // Control point is offset perpendicular to the line midpoint
      const midX = (from.cx + to.cx) / 2;
      const midY = (from.cy + to.cy) / 2;

      // Offset the control point slightly in the fret direction
      // to create a natural arc
      const offset = layout.stringsHorizontal ? 8 : -8;
      const cpX = layout.stringsHorizontal ? midX + offset : midX;
      const cpY = layout.stringsHorizontal ? midY : midY + offset;

      lines.push(
        <path
          key={`line-${i}`}
          d={`M ${from.cx} ${from.cy} Q ${cpX} ${cpY} ${to.cx} ${to.cy}`}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth={2}
          strokeOpacity={0.3}
          strokeLinecap="round"
        />,
      );
    }
  }

  return <g>{lines}</g>;
}
