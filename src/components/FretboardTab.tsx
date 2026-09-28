import { useState, useMemo } from 'react';
import type { Orientation } from '@/types';
import { TOTAL_FRETS } from '@/utils/constants';
import { buildLayout } from '@/utils/neckLayout';
import { getFretboardNotes } from '@/utils/fretboardNotes';
import OrientationToggle from '@/components/OrientationToggle';
import NeckFretboardGrid from '@/components/NeckFretboardGrid';
import FretboardNoteDots from '@/components/FretboardNoteDots';
import NoteColorLegend from '@/components/NoteColorLegend';

export default function FretboardTab() {
  const [orientation, setOrientation] = useState<Orientation>(() =>
    typeof window !== 'undefined' && window.innerWidth >= 640
      ? 'horizontal'
      : 'vertical',
  );
  const notes = useMemo(() => getFretboardNotes(TOTAL_FRETS), []);
  // Larger dots (r=13) would clip at the far edge and collide with fret numbers
  const base = buildLayout(orientation, TOTAL_FRETS);
  const layout = {
    ...base,
    svgWidth: base.svgWidth + 6,
    svgHeight: base.svgHeight + 6,
    fretNumOffset: -16,
  };

  return (
    <div className="px-4 py-6 sm:px-6">
      <div className="mb-6">
        <h2
          className="text-lg sm:text-xl font-bold mb-1"
          style={{ color: 'var(--color-text)' }}
        >
          Fretboard
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Every note on the neck in standard tuning
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <OrientationToggle
          orientation={orientation}
          onToggle={() =>
            setOrientation((o) => (o === 'vertical' ? 'horizontal' : 'vertical'))
          }
        />
      </div>

      <div
        className="rounded-lg px-4 py-3 mb-5"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border-subtle)',
        }}
      >
        <NoteColorLegend />
      </div>

      <div
        className="rounded-xl p-2 sm:p-3 mb-5"
        style={{
          backgroundColor: 'var(--neck-bg)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${layout.svgWidth} ${layout.svgHeight}`}
            role="img"
            aria-label="Guitar fretboard with all notes"
            style={{
              width: '100%',
              height: 'auto',
              minWidth: orientation === 'horizontal' ? `${Math.min(layout.svgWidth, 500)}px` : undefined,
              maxWidth: orientation === 'vertical' ? `${layout.svgWidth + 16}px` : undefined,
              display: 'block',
              margin: '0 auto',
            }}
          >
            <NeckFretboardGrid totalFrets={TOTAL_FRETS} layout={layout} />
            <FretboardNoteDots notes={notes} layout={layout} />
          </svg>
        </div>
      </div>
    </div>
  );
}
