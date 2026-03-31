import type { NeckLayout } from '@/components/GuitarNeck';

interface PositionHighlightProps {
  startFret: number;
  endFret: number;
  layout: NeckLayout;
  totalFrets: number;
}

export default function PositionHighlight({
  startFret,
  endFret,
  layout,
  totalFrets,
}: PositionHighlightProps) {
  const { fretCoord, fretStart, fretEnd, stringsHorizontal } = layout;

  // Active zone: from just before startFret to just after endFret
  const activeStart = startFret === 0 ? fretCoord(0) - 20 : fretCoord(startFret - 1);
  const activeEnd = fretCoord(endFret);
  const pad = 6; // padding around strings

  // Dim overlays for frets outside the active zone
  const dimElements: React.ReactElement[] = [];
  const dimFill = 'var(--neck-bg)';
  const dimOpacity = 0.55;

  // Left/top dim zone (before active position)
  const fretboardStart = fretCoord(0) - 20;
  const fretboardEnd = fretCoord(totalFrets) + 4;

  if (activeStart > fretboardStart) {
    if (stringsHorizontal) {
      dimElements.push(
        <rect
          key="dim-left"
          x={fretboardStart}
          y={fretStart - pad}
          width={activeStart - fretboardStart}
          height={fretEnd - fretStart + pad * 2}
          fill={dimFill}
          opacity={dimOpacity}
        />,
      );
    } else {
      dimElements.push(
        <rect
          key="dim-top"
          x={fretStart - pad}
          y={fretboardStart}
          width={fretEnd - fretStart + pad * 2}
          height={activeStart - fretboardStart}
          fill={dimFill}
          opacity={dimOpacity}
        />,
      );
    }
  }

  // Right/bottom dim zone (after active position)
  if (activeEnd < fretboardEnd) {
    if (stringsHorizontal) {
      dimElements.push(
        <rect
          key="dim-right"
          x={activeEnd}
          y={fretStart - pad}
          width={fretboardEnd - activeEnd}
          height={fretEnd - fretStart + pad * 2}
          fill={dimFill}
          opacity={dimOpacity}
        />,
      );
    } else {
      dimElements.push(
        <rect
          key="dim-bottom"
          x={fretStart - pad}
          y={activeEnd}
          width={fretEnd - fretStart + pad * 2}
          height={fretboardEnd - activeEnd}
          fill={dimFill}
          opacity={dimOpacity}
        />,
      );
    }
  }

  // Active zone highlight
  const hlWidth = activeEnd - activeStart;
  const hlHeight = fretEnd - fretStart + pad * 2;

  const activeHighlight = stringsHorizontal ? (
    <rect
      x={activeStart}
      y={fretStart - pad}
      width={hlWidth}
      height={hlHeight}
      rx={6}
      fill="var(--color-primary)"
      opacity={0.06}
      stroke="var(--color-primary)"
      strokeWidth={1}
      strokeOpacity={0.2}
      strokeDasharray="4 3"
    />
  ) : (
    <rect
      x={fretStart - pad}
      y={activeStart}
      width={hlHeight}
      height={hlWidth}
      rx={6}
      fill="var(--color-primary)"
      opacity={0.06}
      stroke="var(--color-primary)"
      strokeWidth={1}
      strokeOpacity={0.2}
      strokeDasharray="4 3"
    />
  );

  return (
    <g>
      {dimElements}
      {activeHighlight}
    </g>
  );
}
