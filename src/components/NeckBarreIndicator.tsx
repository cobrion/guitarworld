import type { NeckLayout } from '@/components/GuitarNeck';

export interface NeckBarre {
  fromString: number;
  toString: number;
  fret: number; // absolute fret position on the neck
}

interface NeckBarreIndicatorProps {
  barres: NeckBarre[];
  layout: NeckLayout;
}

export default function NeckBarreIndicator({
  barres,
  layout,
}: NeckBarreIndicatorProps) {
  const { stringCoord, fretCoord, stringsHorizontal } = layout;
  const barThickness = 16;
  const borderRadius = 8;

  return (
    <g>
      {barres.map((barre, index) => {
        const s1 = stringCoord(barre.fromString);
        const s2 = stringCoord(barre.toString);
        const midFret = (fretCoord(barre.fret - 1) + fretCoord(barre.fret)) / 2;

        const sMin = Math.min(s1, s2);
        const span = Math.abs(s2 - s1);

        let x: number;
        let y: number;
        let width: number;
        let height: number;

        if (stringsHorizontal) {
          // Horizontal mode: strings are Y-axis, frets are X-axis
          // Barre spans vertically across strings
          x = midFret - barThickness / 2;
          y = sMin;
          width = barThickness;
          height = span;
        } else {
          // Vertical mode: strings are X-axis, frets are Y-axis
          // Barre spans horizontally across strings
          x = sMin;
          y = midFret - barThickness / 2;
          width = span;
          height = barThickness;
        }

        return (
          <rect
            key={`neck-barre-${index}`}
            x={x}
            y={y}
            width={width}
            height={height}
            rx={borderRadius}
            ry={borderRadius}
            fill="var(--neck-barre-overlay)"
          />
        );
      })}
    </g>
  );
}
