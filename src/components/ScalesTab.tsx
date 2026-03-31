import { useState, useMemo, useEffect } from 'react';
import type { NoteName, Orientation } from '@/types';
import { TOTAL_FRETS } from '@/utils/constants';
import {
  getAllScaleTones,
  getScaleFormulaDisplay,
  getScaleNotesDisplay,
  SCALE_DISPLAY_NAMES,
} from '@/utils/scaleTones';
import type { ScaleKind } from '@/utils/scaleTones';
import { computeScalePositions } from '@/utils/scalePositions';
import ScaleSelector from '@/components/ScaleSelector';
import ScaleFormulaBar from '@/components/ScaleFormulaBar';
import OrientationToggle from '@/components/OrientationToggle';
import ViewModeToggle from '@/components/ViewModeToggle';
import type { ScaleViewMode } from '@/components/ViewModeToggle';
import GuitarNeck from '@/components/GuitarNeck';
import ScalePositionNeck from '@/components/ScalePositionNeck';
import PositionNavigator from '@/components/PositionNavigator';

function useDefaultOrientation(): Orientation {
  const [orientation] = useState<Orientation>(() =>
    typeof window !== 'undefined' && window.innerWidth >= 640
      ? 'horizontal'
      : 'vertical',
  );
  return orientation;
}

export default function ScalesTab() {
  const [selectedRoot, setSelectedRoot] = useState<NoteName>('C');
  const [selectedScale, setSelectedScale] = useState<ScaleKind>('major');
  const defaultOrientation = useDefaultOrientation();
  const [orientation, setOrientation] = useState<Orientation>(defaultOrientation);
  const [viewMode, setViewMode] = useState<ScaleViewMode>('all');
  const [activePositionIndex, setActivePositionIndex] = useState(0);

  const tones = useMemo(
    () => getAllScaleTones(selectedRoot, selectedScale, TOTAL_FRETS),
    [selectedRoot, selectedScale],
  );

  const positions = useMemo(
    () => computeScalePositions(selectedRoot, selectedScale, TOTAL_FRETS),
    [selectedRoot, selectedScale],
  );

  // Reset active position when root/scale changes
  useEffect(() => {
    setActivePositionIndex(0);
  }, [selectedRoot, selectedScale]);

  const formulaStr = getScaleFormulaDisplay(selectedScale);
  const notesStr = getScaleNotesDisplay(selectedRoot, selectedScale);
  const scaleName = `${selectedRoot} ${SCALE_DISPLAY_NAMES[selectedScale]}`;

  const activePosition = positions[activePositionIndex] ?? positions[0];

  return (
    <div className="px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-6">
        <h2
          className="text-lg sm:text-xl font-bold mb-1"
          style={{ color: 'var(--color-text)' }}
        >
          Scales
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Explore scale patterns across the entire fretboard
        </p>
      </div>

      {/* Controls row */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <ScaleSelector
          root={selectedRoot}
          scaleKind={selectedScale}
          onRootChange={setSelectedRoot}
          onScaleKindChange={setSelectedScale}
        />
        <ViewModeToggle mode={viewMode} onToggle={setViewMode} />
        <OrientationToggle
          orientation={orientation}
          onToggle={() =>
            setOrientation((o) => (o === 'vertical' ? 'horizontal' : 'vertical'))
          }
        />
      </div>

      {/* Scale Formula Bar */}
      <div
        className="rounded-lg px-4 py-3 mb-5"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border-subtle)',
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <span
            className="text-xs font-medium"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <span style={{ color: 'var(--color-primary)' }}>{scaleName}</span>
            {' '}— interval pattern
          </span>
          <span
            className="text-[10px]"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <span style={{ color: 'var(--color-text)' }}>W</span> = whole step
            <span style={{ color: 'var(--color-warning)', marginLeft: '6px' }}>
              H
            </span>{' '}
            = half step
          </span>
        </div>
        <ScaleFormulaBar root={selectedRoot} scaleKind={selectedScale} />
      </div>

      {/* Guitar neck — conditional on view mode */}
      <div
        className="rounded-xl p-2 sm:p-3 mb-5"
        style={{
          backgroundColor: 'var(--neck-bg)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {viewMode === 'all' ? (
          <GuitarNeck
            tones={tones}
            orientation={orientation}
            totalFrets={TOTAL_FRETS}
          />
        ) : activePosition ? (
          <ScalePositionNeck
            position={activePosition}
            allTones={tones}
            orientation={orientation}
            totalFrets={TOTAL_FRETS}
          />
        ) : null}
      </div>

      {/* Position Navigator — only in positions mode */}
      {viewMode === 'positions' && positions.length > 0 && (
        <PositionNavigator
          positions={positions}
          activeIndex={activePositionIndex}
          onSelect={setActivePositionIndex}
        />
      )}

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
            <span
              className="text-xs font-medium block mb-0.5"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Scale
            </span>
            <span
              className="text-base font-bold"
              style={{ color: 'var(--color-primary)' }}
            >
              {scaleName}
            </span>
          </div>
          <div>
            <span
              className="text-xs font-medium block mb-0.5"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Formula
            </span>
            <span
              className="text-sm font-semibold"
              style={{ color: 'var(--color-text)' }}
            >
              {formulaStr}
            </span>
          </div>
          <div>
            <span
              className="text-xs font-medium block mb-0.5"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Notes
            </span>
            <span
              className="text-sm font-semibold"
              style={{ color: 'var(--color-text)' }}
            >
              {notesStr}
            </span>
          </div>
          {viewMode === 'positions' && activePosition && (
            <>
              <div>
                <span
                  className="text-xs font-medium block mb-0.5"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Position
                </span>
                <span
                  className="text-sm font-semibold"
                  style={{ color: 'var(--color-text)' }}
                >
                  {activePositionIndex + 1} of {positions.length}
                </span>
              </div>
              <div>
                <span
                  className="text-xs font-medium block mb-0.5"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Frets
                </span>
                <span
                  className="text-sm font-semibold"
                  style={{ color: 'var(--color-text)' }}
                >
                  {activePosition.startFret}–{activePosition.endFret}
                </span>
              </div>
              <div>
                <span
                  className="text-xs font-medium block mb-0.5"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Notes in position
                </span>
                <span
                  className="text-sm font-semibold"
                  style={{ color: 'var(--color-text)' }}
                >
                  {activePosition.tones.length}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
