import type { ChordTone, Orientation } from '@/types';
import NeckFretboardGrid from '@/components/NeckFretboardGrid';
import NeckNoteDots from '@/components/NeckNoteDots';
import NeckBarreIndicator from '@/components/NeckBarreIndicator';
import type { NeckBarre } from '@/components/NeckBarreIndicator';

interface GuitarNeckProps {
  tones: ChordTone[];
  orientation: Orientation;
  totalFrets: number;
  barres?: NeckBarre[];
}

const STRING_SPACING = 30;
const FRET_SPACING = 40;
const PAD_LABEL = 32;
const PAD_NUT = 48;

export interface NeckLayout {
  /** Position along the string axis (perpendicular to frets) */
  stringCoord: (stringIdx: number) => number;
  /** Position along the fret axis (perpendicular to strings) */
  fretCoord: (fretIdx: number) => number;
  /** Start coordinate of the string (at the nut) */
  stringStart: number;
  /** End coordinate of the string (at the last fret) */
  stringEnd: number;
  /** Start coordinate of the fret (at string 0) */
  fretStart: number;
  /** End coordinate of the fret (at string 5) */
  fretEnd: number;
  /** Whether strings run horizontally (vertical orientation) or vertically */
  stringsHorizontal: boolean;
  svgWidth: number;
  svgHeight: number;
  /** Label position offset from the nut */
  labelOffset: number;
  /** Fret number position offset from string 0 */
  fretNumOffset: number;
}

function buildLayout(orientation: Orientation, totalFrets: number): NeckLayout {
  const gridSpan = STRING_SPACING * 5; // across strings
  const fretSpan = FRET_SPACING * totalFrets; // along frets

  if (orientation === 'vertical') {
    // Strings run left-to-right (X), frets run top-to-bottom (Y)
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

  // Horizontal: frets run left-to-right (X), strings run top-to-bottom (Y)
  // Low E (string 0) at the bottom, high E (string 5) at the top
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

export default function GuitarNeck({
  tones,
  orientation,
  totalFrets,
  barres,
}: GuitarNeckProps) {
  const layout = buildLayout(orientation, totalFrets);

  return (
    <div
      className="w-full overflow-x-auto"
      style={{ margin: '0 auto' }}
    >
      <svg
        viewBox={`0 0 ${layout.svgWidth} ${layout.svgHeight}`}
        role="img"
        aria-label="Guitar fretboard"
        style={{
          width: '100%',
          height: 'auto',
          minWidth: orientation === 'horizontal' ? `${Math.min(layout.svgWidth, 500)}px` : undefined,
          maxWidth: orientation === 'vertical' ? `${layout.svgWidth + 16}px` : undefined,
          display: 'block',
          margin: '0 auto',
        }}
      >
        <NeckFretboardGrid totalFrets={totalFrets} layout={layout} />
        {barres && barres.length > 0 && (
          <NeckBarreIndicator barres={barres} layout={layout} />
        )}
        <NeckNoteDots tones={tones} layout={layout} />
      </svg>
    </div>
  );
}
