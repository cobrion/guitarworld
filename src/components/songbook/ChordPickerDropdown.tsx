import { useState, useEffect, useMemo, useRef } from 'react';
import type { Key, ScaleType, ChordData } from '@/types';
import { getChordsForKey } from '@/utils/musicTheory';
import { analyzeChordInKey, getHarmonicFunctionColor } from '@/utils/harmonicAnalysis';

interface ChordPickerDropdownProps {
  songKey: Key;
  scaleType: ScaleType;
  currentChord: string | null;
  anchorRect: { top: number; left: number; bottom: number };
  onSelect: (chord: string) => void;
  onRemove: () => void;
  onClose: () => void;
}

export default function ChordPickerDropdown({
  songKey,
  scaleType,
  currentChord,
  anchorRect,
  onSelect,
  onRemove,
  onClose,
}: ChordPickerDropdownProps) {
  const [customChord, setCustomChord] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  // Close on Escape, outside click, or scroll
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const handleMousedown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleScroll = () => onClose();
    window.addEventListener('keydown', handleKeydown);
    document.addEventListener('mousedown', handleMousedown);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
      document.removeEventListener('mousedown', handleMousedown);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [onClose]);

  // Group chords by type
  const chordGroups = useMemo(() => {
    const allChords = getChordsForKey(songKey, scaleType);
    const triads: ChordData[] = [];
    const sevenths: ChordData[] = [];
    const susAndPower: ChordData[] = [];

    for (const c of allChords) {
      if (c.chordType === 'triad' && (c.quality === 'major' || c.quality === 'minor' || c.quality === 'diminished')) {
        triads.push(c);
      } else if (c.chordType === 'seventh') {
        sevenths.push(c);
      } else if (c.chordType === 'sus' || c.chordType === 'power') {
        susAndPower.push(c);
      }
    }

    return { triads, sevenths, susAndPower };
  }, [songKey, scaleType]);

  // Position: prefer below anchor, flip above if near viewport bottom
  const style = useMemo((): React.CSSProperties => {
    const spaceBelow = window.innerHeight - anchorRect.bottom;
    const showAbove = spaceBelow < 320;

    return {
      position: 'fixed',
      left: Math.min(anchorRect.left, window.innerWidth - 220),
      top: showAbove ? undefined : anchorRect.bottom + 4,
      bottom: showAbove ? window.innerHeight - anchorRect.top + 4 : undefined,
      zIndex: 200,
      width: '210px',
      maxHeight: '320px',
      overflowY: 'auto',
      backgroundColor: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-md)',
      borderRadius: '10px',
    };
  }, [anchorRect]);

  const handleCustomSubmit = () => {
    const trimmed = customChord.trim();
    if (trimmed) {
      onSelect(trimmed);
      setCustomChord('');
    }
  };

  return (
    <>
      <div ref={ref} style={style}>
        {/* Diatonic Triads */}
        <div
          className="px-2 pt-2 pb-1 text-[9px] font-bold uppercase"
          style={{ color: 'var(--color-text-muted)', letterSpacing: '0.08em' }}
        >
          Diatonic Triads
        </div>
        <div className="px-1 pb-1">
          {chordGroups.triads.map((c) => (
            <ChordPickerItem
              key={c.name}
              name={c.name}
              roman={c.romanNumeral}
              songKey={songKey}
              isSelected={currentChord === c.name}
              onClick={() => onSelect(c.name)}
            />
          ))}
        </div>

        {/* 7th Chords */}
        {chordGroups.sevenths.length > 0 && (
          <>
            <div
              className="mx-2 h-px"
              style={{ backgroundColor: 'var(--color-border-subtle)' }}
            />
            <div
              className="px-2 pt-1.5 pb-1 text-[9px] font-bold uppercase"
              style={{ color: 'var(--color-text-muted)', letterSpacing: '0.08em' }}
            >
              7th Chords
            </div>
            <div className="px-1 pb-1 flex flex-wrap gap-0.5">
              {chordGroups.sevenths.map((c) => (
                <ChordPickerChip
                  key={c.name}
                  name={c.name}
                  songKey={songKey}
                  isSelected={currentChord === c.name}
                  onClick={() => onSelect(c.name)}
                />
              ))}
            </div>
          </>
        )}

        {/* Sus / Power */}
        {chordGroups.susAndPower.length > 0 && (
          <>
            <div
              className="mx-2 h-px"
              style={{ backgroundColor: 'var(--color-border-subtle)' }}
            />
            <div
              className="px-2 pt-1.5 pb-1 text-[9px] font-bold uppercase"
              style={{ color: 'var(--color-text-muted)', letterSpacing: '0.08em' }}
            >
              Sus / Power
            </div>
            <div className="px-1 pb-1 flex flex-wrap gap-0.5">
              {chordGroups.susAndPower.map((c) => (
                <ChordPickerChip
                  key={c.name}
                  name={c.name}
                  songKey={songKey}
                  isSelected={currentChord === c.name}
                  onClick={() => onSelect(c.name)}
                />
              ))}
            </div>
          </>
        )}

        {/* Custom */}
        <div
          className="mx-2 h-px"
          style={{ backgroundColor: 'var(--color-border-subtle)' }}
        />
        <div className="flex items-center gap-1 px-2 py-1.5">
          <input
            value={customChord}
            onChange={(e) => setCustomChord(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCustomSubmit(); }}
            placeholder="Custom..."
            className="flex-1 px-2 py-1 rounded text-[11px]"
            style={{
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
              outline: 'none',
              minWidth: 0,
            }}
          />
          <button
            onClick={handleCustomSubmit}
            disabled={!customChord.trim()}
            className="px-2 py-1 rounded text-[10px] font-semibold cursor-pointer"
            style={{
              backgroundColor: customChord.trim() ? 'var(--color-primary)' : 'var(--color-border)',
              color: customChord.trim() ? 'var(--color-text-on-primary)' : 'var(--color-text-muted)',
              border: 'none',
            }}
          >
            Add
          </button>
        </div>

        {/* Remove */}
        {currentChord && (
          <>
            <div
              className="mx-2 h-px"
              style={{ backgroundColor: 'var(--color-border-subtle)' }}
            />
            <button
              onClick={onRemove}
              className="w-full text-left px-3 py-2 text-xs cursor-pointer"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-error)',
                borderRadius: '0 0 10px 10px',
              }}
            >
              ✕ Remove chord
            </button>
          </>
        )}
      </div>
    </>
  );
}

function ChordPickerItem({
  name,
  roman,
  songKey,
  isSelected,
  onClick,
}: {
  name: string;
  roman: string;
  songKey: Key;
  isSelected: boolean;
  onClick: () => void;
}) {
  const analysis = analyzeChordInKey(name, songKey);
  const color = getHarmonicFunctionColor(analysis.function);

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left cursor-pointer transition-colors"
      style={{
        background: isSelected ? 'var(--color-surface-raised)' : 'none',
        border: 'none',
        outline: isSelected ? `1px solid ${color}` : 'none',
      }}
    >
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      <span
        className="text-xs font-bold flex-1"
        style={{ color: 'var(--color-text)', fontFamily: 'var(--songbook-chord-font)' }}
      >
        {name}
      </span>
      <span
        className="text-[10px]"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {roman}
      </span>
    </button>
  );
}

function ChordPickerChip({
  name,
  songKey,
  isSelected,
  onClick,
}: {
  name: string;
  songKey: Key;
  isSelected: boolean;
  onClick: () => void;
}) {
  const analysis = analyzeChordInKey(name, songKey);
  const color = getHarmonicFunctionColor(analysis.function);

  return (
    <button
      onClick={onClick}
      className="px-1.5 py-1 rounded text-[10px] font-bold cursor-pointer"
      style={{
        backgroundColor: isSelected ? color : 'var(--color-surface-raised)',
        color: isSelected ? 'var(--color-text-on-primary)' : 'var(--color-text)',
        border: `1px solid ${isSelected ? color : 'var(--color-border)'}`,
        fontFamily: 'var(--songbook-chord-font)',
      }}
    >
      {name}
    </button>
  );
}
