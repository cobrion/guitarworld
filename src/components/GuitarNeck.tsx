import type { ChordTone, Orientation } from '@/types';
import NeckFretboardGrid from '@/components/NeckFretboardGrid';
import NeckNoteDots from '@/components/NeckNoteDots';
import NeckBarreIndicator from '@/components/NeckBarreIndicator';
import type { NeckBarre } from '@/components/NeckBarreIndicator';
import { buildLayout } from '@/utils/neckLayout';
export type { NeckLayout } from '@/utils/neckLayout';

interface GuitarNeckProps {
  tones: ChordTone[];
  orientation: Orientation;
  totalFrets: number;
  barres?: NeckBarre[];
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
