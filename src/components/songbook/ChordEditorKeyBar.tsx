import { useMemo } from 'react';
import type { Key, ScaleType } from '@/types';
import { ALL_KEYS } from '@/utils/constants';
import { getChordsForKey } from '@/utils/musicTheory';
import { getHarmonicFunctionColor, analyzeChordInKey } from '@/utils/harmonicAnalysis';

interface ChordEditorKeyBarProps {
  songKey: Key;
  scaleType: ScaleType;
  selectedChord: string | null;
  onKeyChange: (key: Key) => void;
  onScaleTypeChange: (scaleType: ScaleType) => void;
  onQuickChordSelect: (chord: string | null) => void;
}

export default function ChordEditorKeyBar({
  songKey,
  scaleType,
  selectedChord,
  onKeyChange,
  onScaleTypeChange,
  onQuickChordSelect,
}: ChordEditorKeyBarProps) {
  const diatonicTriads = useMemo(() => {
    const allChords = getChordsForKey(songKey, scaleType);
    return allChords.filter(
      (c) =>
        c.chordType === 'triad' &&
        (c.quality === 'major' || c.quality === 'minor' || c.quality === 'diminished')
    );
  }, [songKey, scaleType]);

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface-raised)',
        borderBottom: '1px solid var(--color-border-subtle)',
      }}
    >
      {/* Key + Scale selectors */}
      <div className="flex items-center gap-3 px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span
            className="text-[10px] font-semibold uppercase"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Key
          </span>
          <select
            value={songKey}
            onChange={(e) => onKeyChange(e.target.value as Key)}
            className="px-2 py-1 rounded text-xs font-bold"
            style={{
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-primary)',
              border: '1px solid var(--color-border)',
              outline: 'none',
            }}
          >
            {ALL_KEYS.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1">
          {(['major', 'minor'] as const).map((st) => (
            <button
              key={st}
              onClick={() => onScaleTypeChange(st)}
              className="px-2 py-1 rounded text-[10px] font-semibold cursor-pointer"
              style={{
                backgroundColor: scaleType === st ? 'var(--color-primary)' : 'transparent',
                color: scaleType === st ? 'var(--color-text-on-primary)' : 'var(--color-text-muted)',
                border: 'none',
              }}
            >
              {st === 'major' ? 'Major' : 'Minor'}
            </button>
          ))}
        </div>

        {selectedChord && (
          <div className="flex items-center gap-1 ml-auto">
            <span
              className="text-[10px]"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Placing:
            </span>
            <span
              className="text-xs font-bold"
              style={{ color: 'var(--color-primary)', fontFamily: 'var(--songbook-chord-font)' }}
            >
              {selectedChord}
            </span>
            <button
              onClick={() => onQuickChordSelect(null)}
              className="text-[10px] cursor-pointer ml-1"
              style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)' }}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Quick chord buttons */}
      <div className="flex items-center gap-1 px-3 pb-2 overflow-x-auto scrollbar-none">
        {diatonicTriads.map((c) => {
          const analysis = analyzeChordInKey(c.name, songKey, scaleType);
          const color = getHarmonicFunctionColor(analysis.function);
          const isActive = selectedChord === c.name;

          return (
            <button
              key={c.name}
              onClick={() => onQuickChordSelect(isActive ? null : c.name)}
              className="flex flex-col items-center px-2 py-1 rounded-lg cursor-pointer transition-all flex-shrink-0"
              style={{
                backgroundColor: isActive ? color : 'var(--color-surface)',
                color: isActive ? 'var(--color-text-on-primary)' : 'var(--color-text)',
                border: `1.5px solid ${isActive ? color : 'var(--color-border)'}`,
                minWidth: '44px',
              }}
            >
              <span
                className="text-xs font-bold"
                style={{ fontFamily: 'var(--songbook-chord-font)' }}
              >
                {c.name}
              </span>
              <span
                className="text-[9px]"
                style={{
                  opacity: isActive ? 0.85 : 0.5,
                }}
              >
                {c.romanNumeral}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
