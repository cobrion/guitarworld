import type { ChordTone, Orientation } from '@/types';
import type { NeckLayout } from '@/components/GuitarNeck';
import type { ScalePosition } from '@/utils/scalePositions';
import NeckFretboardGrid from '@/components/NeckFretboardGrid';
import PositionHighlight from '@/components/PositionHighlight';
import PositionConnectingLines from '@/components/PositionConnectingLines';
import PositionNoteDots from '@/components/PositionNoteDots';

interface ScalePositionNeckProps {
  position: ScalePosition;
  allTones: ChordTone[];
  orientation: Orientation;
  totalFrets: number;
}

// Duplicated from GuitarNeck to avoid modifying it
const STRING_SPACING = 30;
const FRET_SPACING = 40;
const PAD_LABEL = 32;
const PAD_NUT = 48;

function buildLayout(orientation: Orientation, totalFrets: number): NeckLayout {
  const gridSpan = STRING_SPACING * 5;
  const fretSpan = FRET_SPACING * totalFrets;

  if (orientation === 'vertical') {
    return {
      stringCoord: (s) => PAD_LABEL + s * STRING_SPACING,
      fretCoord: (f) => PAD_NUT + f * FRET_SPACING,
      stringStart: PAD_NUT,
      stringEnd: PAD_NUT + fretSpan,
      fretStart: PAD_LABEL,
      fretEnd: PAD_LABEL + gridSpan,
      stringsHorizontal: false,
      svgWidth: PAD_LABEL + gridSpan + 10,
      svgHeight: PAD_NUT + fretSpan + 8,
      labelOffset: -16,
      fretNumOffset: -10,
    };
  }

  return {
    stringCoord: (s) => PAD_NUT + (5 - s) * STRING_SPACING,
    fretCoord: (f) => PAD_LABEL + f * FRET_SPACING,
    stringStart: PAD_LABEL,
    stringEnd: PAD_LABEL + fretSpan,
    fretStart: PAD_NUT,
    fretEnd: PAD_NUT + gridSpan,
    stringsHorizontal: true,
    svgWidth: PAD_LABEL + fretSpan + 8,
    svgHeight: PAD_NUT + gridSpan + 10,
    labelOffset: -16,
    fretNumOffset: -10,
  };
}

/** Check if a tone is within the active position */
function isInPosition(tone: ChordTone, position: ScalePosition): boolean {
  return position.tones.some(
    (t) => t.string === tone.string && t.fret === tone.fret,
  );
}

export default function ScalePositionNeck({
  position,
  allTones,
  orientation,
  totalFrets,
}: ScalePositionNeckProps) {
  const layout = buildLayout(orientation, totalFrets);

  // Ghost tones: all tones NOT in the active position
  const ghostTones = allTones.filter((t) => !isInPosition(t, position));

  return (
    <div
      className="w-full overflow-x-auto"
      style={{ margin: '0 auto' }}
    >
      <svg
        viewBox={`0 0 ${layout.svgWidth} ${layout.svgHeight}`}
        role="img"
        aria-label={`Guitar fretboard - Position ${position.index + 1}`}
        style={{
          width: '100%',
          height: 'auto',
          minWidth: orientation === 'horizontal' ? `${Math.min(layout.svgWidth, 500)}px` : undefined,
          maxWidth: orientation === 'vertical' ? `${layout.svgWidth + 16}px` : undefined,
          display: 'block',
          margin: '0 auto',
        }}
      >
        {/* Layer 1: Base fretboard */}
        <NeckFretboardGrid totalFrets={totalFrets} layout={layout} />

        {/* Layer 2: Position highlight overlay */}
        <PositionHighlight
          startFret={position.startFret}
          endFret={position.endFret}
          layout={layout}
          totalFrets={totalFrets}
        />

        {/* Layer 3: Ghost dots (notes outside position) */}
        <GhostDots tones={ghostTones} layout={layout} />

        {/* Layer 4: Connecting lines between position notes */}
        <PositionConnectingLines tones={position.tones} layout={layout} />

        {/* Layer 5: Numbered position dots */}
        <PositionNoteDots tones={position.tones} layout={layout} />
      </svg>
    </div>
  );
}

/** Renders all scale tones outside the active position at very low opacity */
function GhostDots({
  tones,
  layout,
}: {
  tones: ChordTone[];
  layout: NeckLayout;
}) {
  const { stringCoord, fretCoord, stringsHorizontal } = layout;
  const dotRadius = 7;

  return (
    <g>
      {tones.map((tone, i) => {
        const sPos = stringCoord(tone.string);
        const isOpen = tone.fret === 0;

        let cx: number;
        let cy: number;

        if (isOpen) {
          const nutPos = fretCoord(0);
          if (stringsHorizontal) {
            cx = nutPos - 16;
            cy = sPos;
          } else {
            cx = sPos;
            cy = nutPos - 16;
          }
        } else {
          const midFret = (fretCoord(tone.fret - 1) + fretCoord(tone.fret)) / 2;
          if (stringsHorizontal) {
            cx = midFret;
            cy = sPos;
          } else {
            cx = sPos;
            cy = midFret;
          }
        }

        return (
          <circle
            key={`ghost-${tone.string}-${tone.fret}-${i}`}
            cx={cx}
            cy={cy}
            r={dotRadius}
            fill={tone.color}
            opacity={0.15}
          />
        );
      })}
    </g>
  );
}
