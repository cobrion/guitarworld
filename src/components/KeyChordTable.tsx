import { useState, useMemo, useCallback } from 'react';
import { ALL_KEYS } from '@/utils/constants';
import { getChordsForKey } from '@/utils/musicTheory';
import { useChord } from '@/context/ChordContext';
import ChordDiagram from '@/components/ChordDiagram';
import type { Key, ChordData, ChordTypeFilter, ScaleType } from '@/types';

// Extended filter type includes 'simple-triad' (triads without augmented)
type FilterKey = ChordTypeFilter | 'simple-triad';

const CHORD_TYPE_FILTERS: { label: string; value: FilterKey }[] = [
  { label: 'Simple Triads', value: 'simple-triad' },
  { label: 'All Triads', value: 'triad' },
  { label: '7ths', value: 'seventh' },
  { label: 'Sus', value: 'sus' },
  { label: 'Power', value: 'power' },
  { label: 'Extended', value: 'extended' },
];

const CHORD_TYPE_COLORS: Record<FilterKey, string> = {
  'simple-triad': 'var(--color-success)',
  triad: 'var(--chord-major-border)',
  seventh: 'var(--chord-7th-border)',
  sus: 'var(--chord-sus-border)',
  power: 'var(--color-secondary)',
  extended: 'var(--color-accent)',
};

interface KeyChordRow {
  key: Key;
  chords: ChordData[];
}

const DEGREE_LABELS = ['1', '2', '3', '4', '5', '6', '7'] as const;

// Major key labels and column types
const MAJOR_QUALITY_LABELS = ['maj', 'min', 'min', 'maj', 'maj', 'min', 'dim'] as const;
const MAJOR_SEVENTH_QUALITY_LABELS = ['maj7', 'm7', 'm7', 'maj7', '7', 'm7', 'm7b5'] as const;

// Minor key labels and column types
const MINOR_QUALITY_LABELS = ['min', 'dim', 'maj', 'min', 'min', 'maj', 'maj'] as const;
const MINOR_SEVENTH_QUALITY_LABELS = ['m7', 'm7b5', 'maj7', 'm7', 'm7', 'maj7', '7'] as const;

type ChordColumn = 'major' | 'minor' | 'diminished';

const MAJOR_COLUMN_TYPES: ChordColumn[] = [
  'major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished',
];

const MINOR_COLUMN_TYPES: ChordColumn[] = [
  'minor', 'diminished', 'major', 'minor', 'minor', 'major', 'major',
];

const COLUMN_BORDER_COLORS: Record<ChordColumn, string> = {
  major: 'var(--chord-major-border)',
  minor: 'var(--chord-minor-border)',
  diminished: 'var(--chord-dim-border)',
};

function getColumnStyle(type: ChordColumn): React.CSSProperties {
  switch (type) {
    case 'major':
      return {
        backgroundColor: 'var(--kct-major-bg)',
        color: 'var(--kct-major-text)',
      };
    case 'minor':
      return {
        backgroundColor: 'var(--kct-minor-bg)',
        color: 'var(--kct-minor-text)',
        fontStyle: 'italic',
      };
    case 'diminished':
      return {
        backgroundColor: 'var(--kct-dim-bg)',
        color: 'var(--kct-dim-text)',
      };
  }
}

/** Shared hook: compute effective key and chords after transposition */
function useEffectiveChords(row: KeyChordRow, keyOffset: number, scaleType: ScaleType) {
  const effectiveKey = useMemo(() => {
    if (keyOffset === 0) return row.key;
    const idx = ALL_KEYS.indexOf(row.key);
    const newIdx = ((idx + keyOffset) % 12 + 12) % 12;
    return ALL_KEYS[newIdx];
  }, [row.key, keyOffset]);

  const effectiveChords = useMemo(
    () => keyOffset === 0 ? row.chords : getChordsForKey(effectiveKey, scaleType),
    [row.chords, effectiveKey, keyOffset, scaleType]
  );

  return { effectiveKey, effectiveChords, isTransposed: keyOffset !== 0 };
}

/** Filter chords by active filter pills */
function useFilteredChords(chords: ChordData[], activeFilters: Set<FilterKey>) {
  return useMemo(
    () => chords.filter((chord) => {
      if (activeFilters.has('simple-triad') && chord.chordType === 'triad' && chord.quality !== 'augmented') return true;
      if (activeFilters.has('triad') && chord.chordType === 'triad') return true;
      if (activeFilters.has(chord.chordType)) return true;
      return false;
    }),
    [chords, activeFilters]
  );
}

function InlineChordCard({ chord, colIndex, columnTypes }: { chord: ChordData; colIndex: number; columnTypes: ChordColumn[] }) {
  const borderColor = COLUMN_BORDER_COLORS[columnTypes[colIndex]];
  const voicing = chord.voicings[0];

  return (
    <div
      className="inline-chord-card rounded-lg"
      style={{
        padding: '8px 4px',
        backgroundColor: 'var(--color-surface)',
        border: `1px solid var(--color-border-subtle)`,
        borderTop: `3px solid ${borderColor}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        margin: '0 auto',
        maxWidth: '140px',
      }}
    >
      {/* Chord name + Roman numeral */}
      <div className="text-center" style={{ width: '100%' }}>
        <span
          className="text-sm font-bold"
          style={{ color: 'var(--color-text)' }}
        >
          {chord.name}
        </span>
        <span
          className="ml-1.5 text-[11px] font-medium"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {chord.romanNumeral}
        </span>
      </div>

      {/* Diagram */}
      <div style={{ width: '100%', maxWidth: '120px' }}>
        {voicing ? (
          <ChordDiagram voicing={voicing} chordName={chord.name} />
        ) : (
          <div
            className="text-[10px] text-center py-4"
            style={{ color: 'var(--color-text-muted)' }}
          >
            No voicing
          </div>
        )}
      </div>
    </div>
  );
}

/** Reusable +/− step button */
function StepButton({ label, ariaLabel, onClick }: { label: string; ariaLabel: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className="hover:opacity-100 transition-opacity"
      style={{
        color: 'var(--color-text-muted)',
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        border: 'none',
        background: 'none',
        padding: 0,
        fontSize: '16px',
        fontWeight: 700,
        opacity: 0.5,
        lineHeight: 1,
      }}
    >
      {label}
    </button>
  );
}

/** Composite key for tracking expanded/offset state across major and minor sections */
function compositeId(scaleType: ScaleType, key: Key): string {
  return `${scaleType}:${key}`;
}

export default function KeyChordTable() {
  const { state } = useChord();
  const selectedChords = state.selectedKeys; // these are chord names (e.g. "C" = C major chord)
  const hasSelection = selectedChords.length > 0;

  const [activeFilters, setActiveFilters] = useState<Set<FilterKey>>(
    () => new Set<FilterKey>(['simple-triad'])
  );

  // Toggle: show diatonic 7th chord sub-row beneath each key
  const [show7thRow, setShow7thRow] = useState(false);

  // Per-row key transposition offsets (semitones), keyed by compositeId
  const [keyOffsets, setKeyOffsets] = useState<Record<string, number>>({});

  const handleStepKey = useCallback((cid: string, direction: 1 | -1) => {
    setKeyOffsets(prev => ({
      ...prev,
      [cid]: (prev[cid] ?? 0) + direction,
    }));
  }, []);

  const handleResetKey = useCallback((cid: string) => {
    setKeyOffsets(prev => {
      const next = { ...prev };
      delete next[cid];
      return next;
    });
  }, []);

  const toggleFilter = useCallback((type: FilterKey) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        if (next.size <= 1) return prev;
        next.delete(type);
      } else {
        // 'simple-triad' and 'triad' are mutually exclusive
        if (type === 'simple-triad') next.delete('triad');
        if (type === 'triad') next.delete('simple-triad');
        next.add(type);
      }
      return next;
    });
  }, []);

  // Compute all rows for both scale types
  const allMajorRows: KeyChordRow[] = useMemo(
    () => ALL_KEYS.map((key) => ({ key, chords: getChordsForKey(key, 'major') })),
    []
  );

  const allMinorRows: KeyChordRow[] = useMemo(
    () => ALL_KEYS.map((key) => ({ key, chords: getChordsForKey(key, 'minor') })),
    []
  );

  // Filter: show keys whose diatonic chords contain ALL selected chords.
  const majorRows = useMemo(() => {
    if (!hasSelection) return allMajorRows;
    return allMajorRows.filter((row) => {
      const chordNames = row.chords.map((c) => c.name);
      return selectedChords.every((sel) => chordNames.includes(sel));
    });
  }, [allMajorRows, selectedChords, hasSelection]);

  const minorRows = useMemo(() => {
    if (!hasSelection) return allMinorRows;
    return allMinorRows.filter((row) => {
      const chordNames = row.chords.map((c) => c.name);
      return selectedChords.every((sel) => chordNames.includes(sel));
    });
  }, [allMinorRows, selectedChords, hasSelection]);

  // Local state: which rows are expanded (shows fingering diagrams)
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(() => new Set());

  const handleExpandToggle = useCallback(
    (cid: string) => {
      setExpandedKeys((prev) => {
        const next = new Set(prev);
        if (next.has(cid)) {
          next.delete(cid);
        } else {
          next.add(cid);
        }
        return next;
      });
    },
    []
  );

  const sharedRowProps = {
    highlightedChords: selectedChords,
    onExpandToggle: handleExpandToggle,
    activeFilters,
    onStepKey: handleStepKey,
    onResetKey: handleResetKey,
    show7thRow,
  };

  return (
    <section className="px-4 py-6 sm:px-6" aria-label="Key Chord Overview">
      {/* Shared chord type filter pills */}
      <div
        className="overflow-hidden rounded-xl mb-4"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div
          className="flex items-center gap-2 px-4 py-2.5 overflow-x-auto sm:flex-wrap sm:overflow-x-visible scrollbar-none"
          style={{
            backgroundColor: 'var(--color-surface)',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <span
            className="text-xs font-medium mr-1 flex-shrink-0"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Show:
          </span>
          {CHORD_TYPE_FILTERS.map(({ label, value }) => {
            const isActive = activeFilters.has(value);
            const pillColor = CHORD_TYPE_COLORS[value];
            return (
              <button
                key={value}
                onClick={() => toggleFilter(value)}
                aria-pressed={isActive}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-150 cursor-pointer"
                style={{
                  backgroundColor: isActive ? pillColor : 'var(--color-surface)',
                  color: isActive ? 'var(--color-text-on-accent)' : 'var(--color-text-muted)',
                  border: `1px solid ${isActive ? pillColor : 'var(--color-border)'}`,
                }}
              >
                {label}
              </button>
            );
          })}
          {/* Divider */}
          <div
            className="flex-shrink-0 w-px h-5 mx-1"
            style={{ backgroundColor: 'var(--color-border)' }}
          />
          {/* 7th row toggle */}
          <button
            onClick={() => setShow7thRow(prev => !prev)}
            aria-pressed={show7thRow}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-150 cursor-pointer"
            style={{
              backgroundColor: show7thRow ? 'var(--chord-7th-border)' : 'var(--color-surface)',
              color: show7thRow ? 'var(--color-text-on-accent)' : 'var(--color-text-muted)',
              border: `1px solid ${show7thRow ? 'var(--chord-7th-border)' : 'var(--color-border)'}`,
            }}
          >
            7th Row
          </button>
        </div>
      </div>

      {/* Major Key section */}
      <KeyScaleSection
        title="Major Key"
        scaleType="major"
        rows={majorRows}
        columnTypes={MAJOR_COLUMN_TYPES}
        qualityLabels={MAJOR_QUALITY_LABELS}
        seventhQualityLabels={MAJOR_SEVENTH_QUALITY_LABELS}
        hasSelection={hasSelection}
        selectedChords={selectedChords}
        expandedKeys={expandedKeys}
        keyOffsets={keyOffsets}
        {...sharedRowProps}
      />

      {/* Natural Minor Key section */}
      <KeyScaleSection
        title="Natural Minor Key"
        scaleType="minor"
        rows={minorRows}
        columnTypes={MINOR_COLUMN_TYPES}
        qualityLabels={MINOR_QUALITY_LABELS}
        seventhQualityLabels={MINOR_SEVENTH_QUALITY_LABELS}
        hasSelection={hasSelection}
        selectedChords={selectedChords}
        expandedKeys={expandedKeys}
        keyOffsets={keyOffsets}
        {...sharedRowProps}
      />
    </section>
  );
}

interface KeyScaleSectionProps {
  title: string;
  scaleType: ScaleType;
  rows: KeyChordRow[];
  columnTypes: ChordColumn[];
  qualityLabels: readonly string[];
  seventhQualityLabels: readonly string[];
  hasSelection: boolean;
  selectedChords: string[];
  expandedKeys: Set<string>;
  keyOffsets: Record<string, number>;
  highlightedChords: string[];
  onExpandToggle: (cid: string) => void;
  activeFilters: Set<FilterKey>;
  onStepKey: (cid: string, direction: 1 | -1) => void;
  onResetKey: (cid: string) => void;
  show7thRow: boolean;
}

function KeyScaleSection({
  title,
  scaleType,
  rows,
  columnTypes,
  qualityLabels,
  seventhQualityLabels,
  hasSelection,
  selectedChords,
  expandedKeys,
  keyOffsets,
  highlightedChords,
  onExpandToggle,
  activeFilters,
  onStepKey,
  onResetKey,
  show7thRow,
}: KeyScaleSectionProps) {
  return (
    <div
      className="overflow-hidden rounded-xl mb-6"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {/* Title */}
      <div
        className="py-3 text-center text-sm font-semibold tracking-wider uppercase"
        style={{
          backgroundColor: 'var(--color-surface-raised)',
          color: 'var(--color-primary)',
          borderBottom: '1px solid var(--color-border)',
          letterSpacing: '0.1em',
        }}
      >
        {title}
        {hasSelection && (
          <span style={{ opacity: 0.6, fontWeight: 400, marginLeft: '8px' }}>
            — {rows.length} key{rows.length !== 1 ? 's' : ''} containing {selectedChords.join(', ')}
          </span>
        )}
      </div>

      {/* Desktop/Tablet: Table layout — hidden on mobile */}
      <div className="hidden sm:block overflow-x-auto">
        <table
          className="w-full border-collapse"
          style={{ minWidth: '700px', tableLayout: 'fixed' }}
        >
          <colgroup>
            <col style={{ width: '80px' }} />
            {DEGREE_LABELS.map((d) => (
              <col key={d} />
            ))}
          </colgroup>
          <thead>
            {/* Degree numbers row */}
            <tr>
              <th
                rowSpan={2}
                className="w-14 text-center text-xs font-bold uppercase"
                style={{
                  backgroundColor: 'var(--kct-header-bg)',
                  color: 'var(--color-text-muted)',
                  borderRight: '1px solid var(--color-border)',
                  borderBottom: '1px solid var(--color-border)',
                  padding: '6px 4px',
                  verticalAlign: 'middle',
                  writingMode: 'vertical-lr',
                  textOrientation: 'mixed',
                  letterSpacing: '0.15em',
                }}
              >
                KEY
              </th>
              {DEGREE_LABELS.map((deg, i) => (
                <th
                  key={deg}
                  className="text-center text-xs font-bold"
                  style={{
                    ...getColumnStyle(columnTypes[i]),
                    borderBottom: '1px solid rgba(0,0,0,0.15)',
                    borderRight:
                      i < 6
                        ? '1px solid rgba(0,0,0,0.1)'
                        : undefined,
                    padding: '8px 4px 2px',
                    fontStyle: 'normal',
                  }}
                >
                  {deg}
                </th>
              ))}
            </tr>
            {/* Quality row */}
            <tr>
              {qualityLabels.map((q, i) => (
                <th
                  key={`q-${i}`}
                  className="text-center text-[11px] font-medium"
                  style={{
                    ...getColumnStyle(columnTypes[i]),
                    borderBottom: '2px solid var(--color-border)',
                    borderRight:
                      i < 6
                        ? '1px solid rgba(0,0,0,0.1)'
                        : undefined,
                    padding: '0 4px 6px',
                  }}
                >
                  {q}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const cid = compositeId(scaleType, row.key);
              const isExpanded = expandedKeys.has(cid);
              return (
                <KeyRow
                  key={cid}
                  row={row}
                  isExpanded={isExpanded}
                  keyOffset={keyOffsets[cid] ?? 0}
                  scaleType={scaleType}
                  columnTypes={columnTypes}
                  highlightedChords={highlightedChords}
                  onExpandToggle={onExpandToggle}
                  activeFilters={activeFilters}
                  onStepKey={onStepKey}
                  onResetKey={onResetKey}
                  show7thRow={show7thRow}
                />
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile: Card layout — shown only on mobile (<640px) */}
      <div className="block sm:hidden">
        {rows.map((row) => {
          const cid = compositeId(scaleType, row.key);
          const isExpanded = expandedKeys.has(cid);
          return (
            <KeyChordMobileCard
              key={cid}
              row={row}
              isExpanded={isExpanded}
              keyOffset={keyOffsets[cid] ?? 0}
              scaleType={scaleType}
              columnTypes={columnTypes}
              qualityLabels={qualityLabels}
              seventhQualityLabels={seventhQualityLabels}
              highlightedChords={highlightedChords}
              onExpandToggle={onExpandToggle}
              activeFilters={activeFilters}
              onStepKey={onStepKey}
              onResetKey={onResetKey}
              show7thRow={show7thRow}
            />
          );
        })}
      </div>
    </div>
  );
}

interface KeyRowProps {
  row: KeyChordRow;
  isExpanded: boolean;
  highlightedChords: string[];
  onExpandToggle: (cid: string) => void;
  activeFilters: Set<FilterKey>;
  keyOffset: number;
  onStepKey: (cid: string, direction: 1 | -1) => void;
  onResetKey: (cid: string) => void;
  show7thRow: boolean;
  scaleType: ScaleType;
  columnTypes: ChordColumn[];
}

function KeyRow({ row, isExpanded, highlightedChords, onExpandToggle, activeFilters, keyOffset, onStepKey, onResetKey, show7thRow, scaleType, columnTypes }: KeyRowProps) {
  const cid = compositeId(scaleType, row.key);
  const { effectiveKey, effectiveChords, isTransposed } = useEffectiveChords(row, keyOffset, scaleType);

  // Diatonic triads only (major/minor/diminished, one per degree) for the table row
  const triads = effectiveChords.filter(
    (c) => c.chordType === 'triad' && (c.quality === 'major' || c.quality === 'minor' || c.quality === 'diminished')
  );
  // Diatonic 7th chords (one per degree, ordered by scale degree)
  const sevenths = useMemo(() =>
    effectiveChords
      .filter((c) => c.chordType === 'seventh' &&
        (c.quality === 'major7' || c.quality === 'minor7' || c.quality === 'dominant7' || c.quality === 'minor7b5'))
      .sort((a, b) => a.scaleDegree - b.scaleDegree),
    [effectiveChords]
  );
  const filteredChords = useFilteredChords(effectiveChords, activeFilters);

  return (
    <>
      <tr className="transition-colors duration-150">
        {/* Key label with +/− step buttons */}
        <td
          className="text-center text-sm font-bold"
          style={{
            backgroundColor: isExpanded
              ? 'var(--color-surface-raised)'
              : 'var(--kct-header-bg)',
            color: isExpanded
              ? 'var(--color-primary)'
              : 'var(--color-text)',
            borderRight: '1px solid var(--color-border)',
            borderBottom: '1px solid var(--color-border-subtle)',
            padding: '4px 2px',
            whiteSpace: 'nowrap',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1px' }}>
              <StepButton
                label="&minus;"
                ariaLabel={`Step ${effectiveKey} down one semitone`}
                onClick={() => onStepKey(cid, -1)}
              />

              <span
                onClick={() => onExpandToggle(cid)}
                style={{ cursor: 'pointer', minWidth: '24px', textAlign: 'center' }}
                title="Click to show/hide chord fingerings"
                role="button"
                aria-label={`Expand Key of ${effectiveKey}`}
              >
                {effectiveKey} {isExpanded ? '▾' : '▸'}
              </span>

              <StepButton
                label="+"
                ariaLabel={`Step ${effectiveKey} up one semitone`}
                onClick={() => onStepKey(cid, 1)}
              />
            </div>

            {isTransposed && (
              <button
                onClick={() => onResetKey(cid)}
                className="hover:opacity-100 transition-opacity"
                style={{
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  fontSize: '9px',
                  opacity: 0.6,
                  lineHeight: 1,
                }}
                title={`Reset to original key ${row.key}`}
                aria-label={`Reset to original key ${row.key}`}
              >
                from {row.key} ✕
              </button>
            )}
          </div>
        </td>
        {/* Chord cells — only the 7 diatonic triads */}
        {triads.map((chord, i) => {
          const colType = columnTypes[i];
          const baseStyle = getColumnStyle(colType);
          const isHighlighted = highlightedChords.includes(chord.name);
          const cellStyle: React.CSSProperties = {
            ...baseStyle,
            borderBottom: '1px solid rgba(0,0,0,0.12)',
            borderRight:
              i < 6
                ? '1px solid rgba(0,0,0,0.08)'
                : undefined,
            padding: '8px 6px',
            textAlign: 'center',
            fontSize: '0.8125rem',
            fontWeight: isHighlighted ? 800 : 500,
            opacity: isHighlighted ? 1 : 0.85,
            whiteSpace: 'nowrap',
          };
          if (isHighlighted) {
            cellStyle.backgroundColor = 'var(--color-primary)';
            cellStyle.color = 'var(--color-text-on-primary)';
            cellStyle.fontStyle = 'normal';
          }
          return (
            <td
              key={chord.name}
              style={cellStyle}
              title={`${chord.name} (${chord.romanNumeral})`}
            >
              {chord.name}
            </td>
          );
        })}
      </tr>

      {/* 7th chord sub-row */}
      {show7thRow && sevenths.length > 0 && (
        <tr className="transition-colors duration-150">
          <td
            style={{
              backgroundColor: 'var(--kct-header-bg)',
              borderRight: '1px solid var(--color-border)',
              borderBottom: '1px solid var(--color-border-subtle)',
              padding: '4px 2px',
              textAlign: 'center',
            }}
          >
            <span
              className="text-[10px] font-medium"
              style={{ color: 'var(--color-text-muted)' }}
            >
              7ths
            </span>
          </td>
          {sevenths.map((chord, i) => {
            const colType = columnTypes[i];
            const baseStyle = getColumnStyle(colType);
            const isHighlighted = highlightedChords.includes(chord.name);
            const cellStyle: React.CSSProperties = {
              ...baseStyle,
              borderBottom: '1px solid rgba(0,0,0,0.12)',
              borderRight: i < 6 ? '1px solid rgba(0,0,0,0.08)' : undefined,
              padding: '5px 4px',
              textAlign: 'center',
              fontSize: '0.75rem',
              fontWeight: isHighlighted ? 800 : 500,
              opacity: isHighlighted ? 1 : 0.75,
              whiteSpace: 'nowrap',
            };
            if (isHighlighted) {
              cellStyle.backgroundColor = 'var(--color-primary)';
              cellStyle.color = 'var(--color-text-on-primary)';
              cellStyle.fontStyle = 'normal';
              cellStyle.opacity = 1;
            }
            return (
              <td
                key={chord.name}
                style={cellStyle}
                title={`${chord.name} (${chord.romanNumeral})`}
              >
                {chord.name}
              </td>
            );
          })}
        </tr>
      )}

      {/* Expanded diagram area — always 8 cells (1 empty KEY + 7 degree columns) */}
      {isExpanded && (
        <tr
          style={{
            animation: 'expandRow 0.3s ease-out',
            transformOrigin: 'top center',
          }}
        >
          <td
            style={{
              padding: 0,
              backgroundColor: 'var(--color-surface-raised)',
              borderRight: '1px solid var(--color-border)',
              borderBottom: '2px solid var(--color-border)',
            }}
          />
          {DEGREE_LABELS.map((_, degIndex) => {
            const chordsForDegree = filteredChords.filter(
              (c) => c.scaleDegree === degIndex + 1
            );
            return (
              <td
                key={degIndex}
                style={{
                  padding: '10px 4px',
                  backgroundColor: 'var(--color-surface-raised)',
                  borderBottom: '2px solid var(--color-border)',
                  borderRight: degIndex < 6 ? '1px solid rgba(0,0,0,0.06)' : undefined,
                  verticalAlign: 'top',
                  textAlign: 'center',
                }}
              >
                {chordsForDegree.length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      alignItems: 'center',
                    }}
                  >
                    {chordsForDegree.map((chord) => (
                      <InlineChordCard
                        key={chord.name}
                        chord={chord}
                        colIndex={degIndex}
                        columnTypes={columnTypes}
                      />
                    ))}
                  </div>
                )}
              </td>
            );
          })}
        </tr>
      )}
    </>
  );
}

interface KeyChordMobileCardProps {
  row: KeyChordRow;
  isExpanded: boolean;
  highlightedChords: string[];
  onExpandToggle: (cid: string) => void;
  activeFilters: Set<FilterKey>;
  keyOffset: number;
  onStepKey: (cid: string, direction: 1 | -1) => void;
  onResetKey: (cid: string) => void;
  show7thRow: boolean;
  scaleType: ScaleType;
  columnTypes: ChordColumn[];
  qualityLabels: readonly string[];
  seventhQualityLabels: readonly string[];
}

/** Mobile card layout for a single key row */
function KeyChordMobileCard({ row, isExpanded, highlightedChords, onExpandToggle, activeFilters, keyOffset, onStepKey, onResetKey, show7thRow, scaleType, columnTypes, qualityLabels, seventhQualityLabels }: KeyChordMobileCardProps) {
  const cid = compositeId(scaleType, row.key);
  const { effectiveKey, effectiveChords, isTransposed } = useEffectiveChords(row, keyOffset, scaleType);

  const triads = effectiveChords.filter(
    (c) => c.chordType === 'triad' && (c.quality === 'major' || c.quality === 'minor' || c.quality === 'diminished')
  );
  const sevenths = useMemo(() =>
    effectiveChords
      .filter((c) => c.chordType === 'seventh' &&
        (c.quality === 'major7' || c.quality === 'minor7' || c.quality === 'dominant7' || c.quality === 'minor7b5'))
      .sort((a, b) => a.scaleDegree - b.scaleDegree),
    [effectiveChords]
  );
  const filteredChords = useFilteredChords(effectiveChords, activeFilters);

  return (
    <div
      style={{
        borderBottom: '1px solid var(--color-border-subtle)',
      }}
    >
      {/* Card header: key name + step buttons + expand toggle */}
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ backgroundColor: 'var(--kct-header-bg)' }}
      >
        <div className="flex items-center gap-1">
          <StepButton
            label="&minus;"
            ariaLabel={`Step ${effectiveKey} down one semitone`}
            onClick={() => onStepKey(cid, -1)}
          />
          <div className="text-center" style={{ minWidth: '32px' }}>
            <span
              className="font-bold text-sm"
              style={{ color: 'var(--color-text)' }}
            >
              {effectiveKey}
            </span>
            {isTransposed && (
              <button
                onClick={() => onResetKey(cid)}
                className="block mx-auto hover:opacity-100 transition-opacity"
                style={{
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  fontSize: '9px',
                  opacity: 0.6,
                  lineHeight: 1,
                }}
                title={`Reset to original key ${row.key}`}
                aria-label={`Reset to original key ${row.key}`}
              >
                from {row.key} ✕
              </button>
            )}
          </div>
          <StepButton
            label="+"
            ariaLabel={`Step ${effectiveKey} up one semitone`}
            onClick={() => onStepKey(cid, 1)}
          />
        </div>
        <button
          onClick={() => onExpandToggle(cid)}
          className="flex items-center gap-1.5 px-2 py-1 rounded transition-colors"
          style={{
            color: isExpanded ? 'var(--color-primary)' : 'var(--color-text-muted)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '12px',
          }}
          aria-label={`${isExpanded ? 'Collapse' : 'Expand'} Key of ${effectiveKey}`}
        >
          <span className="text-xs">Chords</span>
          {isExpanded ? '▾' : '▸'}
        </button>
      </div>

      {/* Chord grid: 4 columns on first row, 3 on second */}
      <div
        className="grid grid-cols-4"
        style={{ backgroundColor: 'var(--color-border-subtle)' }}
      >
        {triads.map((chord, i) => {
          const isHighlighted = highlightedChords.includes(chord.name);
          const colStyle = getColumnStyle(columnTypes[i]);
          return (
            <div
              key={chord.name}
              className="text-center py-2 px-1"
              style={{
                backgroundColor: isHighlighted
                  ? 'var(--color-primary)'
                  : colStyle.backgroundColor,
                color: isHighlighted
                  ? 'var(--color-text-on-primary)'
                  : colStyle.color,
                borderRight: i % 4 !== 3 ? '1px solid var(--color-border-subtle)' : undefined,
                borderBottom: '1px solid var(--color-border-subtle)',
              }}
            >
              <div
                className="text-[10px] font-medium"
                style={{ opacity: 0.7 }}
              >
                {DEGREE_LABELS[i]} · {qualityLabels[i]}
              </div>
              <div
                className="text-sm font-bold"
                style={{ fontStyle: columnTypes[i] === 'minor' && !isHighlighted ? 'italic' : 'normal' }}
              >
                {chord.name}
              </div>
            </div>
          );
        })}
      </div>

      {/* 7th chord row on mobile */}
      {show7thRow && sevenths.length > 0 && (
        <div
          className="grid grid-cols-4"
          style={{ backgroundColor: 'var(--color-border-subtle)' }}
        >
          {sevenths.map((chord, i) => {
            const isHighlighted = highlightedChords.includes(chord.name);
            const colStyle = getColumnStyle(columnTypes[i]);
            return (
              <div
                key={chord.name}
                className="text-center py-1.5 px-1"
                style={{
                  backgroundColor: isHighlighted
                    ? 'var(--color-primary)'
                    : colStyle.backgroundColor,
                  color: isHighlighted
                    ? 'var(--color-text-on-primary)'
                    : colStyle.color,
                  borderRight: i % 4 !== 3 ? '1px solid var(--color-border-subtle)' : undefined,
                  borderBottom: '1px solid var(--color-border-subtle)',
                  opacity: isHighlighted ? 1 : 0.8,
                }}
              >
                <div
                  className="text-[9px] font-medium"
                  style={{ opacity: 0.7 }}
                >
                  {seventhQualityLabels[i]}
                </div>
                <div
                  className="text-xs font-bold"
                  style={{ fontStyle: columnTypes[i] === 'minor' && !isHighlighted ? 'italic' : 'normal' }}
                >
                  {chord.name}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Expanded: horizontally scrollable chord diagrams */}
      {isExpanded && (
        <div
          className="overflow-x-auto p-3"
          style={{
            backgroundColor: 'var(--color-surface-raised)',
            WebkitOverflowScrolling: 'touch',
            animation: 'expandRow 0.3s ease-out',
          }}
        >
          <div className="flex gap-3" style={{ minWidth: 'max-content' }}>
            {filteredChords.map((chord) => (
              <div key={chord.name} style={{ width: '120px', flexShrink: 0 }}>
                <InlineChordCard chord={chord} colIndex={chord.scaleDegree - 1} columnTypes={columnTypes} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
