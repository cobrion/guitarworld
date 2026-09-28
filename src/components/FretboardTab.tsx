import { useState, useMemo, useReducer, useEffect } from 'react';
import type { Orientation } from '@/types';
import { TOTAL_FRETS } from '@/utils/constants';
import { buildLayout } from '@/utils/neckLayout';
import { getFretboardNotes } from '@/utils/fretboardNotes';
import {
  SHAPE_INTERVALS,
  chordName,
  getGhosts,
  intervalLabel,
  pitchAt,
  spellShape,
} from '@/utils/intervalShape';
import { initialShapeState, shapeReducer } from '@/utils/intervalShapeReducer';
import OrientationToggle from '@/components/OrientationToggle';
import NeckFretboardGrid from '@/components/NeckFretboardGrid';
import FretboardNoteDots from '@/components/FretboardNoteDots';
import NoteColorLegend from '@/components/NoteColorLegend';
import IntervalShapeDots from '@/components/IntervalShapeDots';
import type { ShapeDot } from '@/components/IntervalShapeDots';
import IntervalShapePanel from '@/components/IntervalShapePanel';

export default function FretboardTab() {
  const [orientation, setOrientation] = useState<Orientation>(() =>
    typeof window !== 'undefined' && window.innerWidth >= 640
      ? 'horizontal'
      : 'vertical',
  );
  const notes = useMemo(() => getFretboardNotes(TOTAL_FRETS), []);
  const [shape, dispatch] = useReducer(shapeReducer, initialShapeState);
  const { root, quality, enabled, placement, spelling } = shape;

  useEffect(() => {
    if (!root) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dispatch({ type: 'clear' });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [root]);

  const spelled = root ? spellShape(pitchAt(root), spelling, quality) : null;
  const placedDots: ShapeDot[] = [];
  const ghostDots: ShapeDot[] = [];
  if (root && spelled) {
    for (const i of SHAPE_INTERVALS) {
      const pos = placement[i];
      if (pos) placedDots.push({ interval: i, pos, label: intervalLabel(i, quality), noteName: spelled.tones[i] });
    }
    for (const g of getGhosts(root, enabled, quality, placement, TOTAL_FRETS)) {
      ghostDots.push({
        interval: g.interval,
        pos: { string: g.string, fret: g.fret },
        label: intervalLabel(g.interval, quality),
        noteName: spelled.tones[g.interval],
      });
    }
  }
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
          Every note on the neck in standard tuning. Tap a note to see its 3rd, 4th, 5th and 7th.
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
        {root && spelled ? (
          <IntervalShapePanel
            rootName={spelled.root}
            tones={spelled.tones}
            quality={quality}
            enabled={enabled}
            placement={placement}
            chordName={chordName(spelled.root, quality, enabled)}
            spelling={spelled.spelling}
            sharpRoot={spelled.sharpRoot}
            flatRoot={spelled.flatRoot}
            onQualityChange={(q) => dispatch({ type: 'setQuality', quality: q })}
            onToggle={(i) => dispatch({ type: 'toggleInterval', interval: i })}
            onSpellingChange={(s) => dispatch({ type: 'setSpelling', spelling: s })}
            onClear={() => dispatch({ type: 'clear' })}
          />
        ) : (
          <NoteColorLegend />
        )}
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
            role="group"
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
            <FretboardNoteDots
              notes={notes}
              layout={layout}
              dimmed={root !== null}
              onNoteClick={(pos) => dispatch({ type: 'selectRoot', pos })}
            />
            {root && spelled && (
              <IntervalShapeDots
                layout={layout}
                root={root}
                rootName={spelled.root}
                placed={placedDots}
                ghosts={ghostDots}
                onRootClick={() => dispatch({ type: 'clear' })}
                onGhostClick={(interval, pos) => dispatch({ type: 'moveInterval', interval, pos })}
              />
            )}
          </svg>
        </div>
      </div>
    </div>
  );
}
