import { useState, useCallback, useRef } from 'react';
import type { Key, ScaleType, EditorWord } from '@/types';
import { analyzeChordInKey, getHarmonicFunctionColor, getHarmonicFunctionBgColor } from '@/utils/harmonicAnalysis';
import ChordPickerDropdown from './ChordPickerDropdown';

interface ChordEditorLineProps {
  words: EditorWord[];
  songKey: Key;
  scaleType: ScaleType;
  selectedChord: string | null;
  onChordChange: (wordIndex: number, chords: string[]) => void;
}

export default function ChordEditorLine({
  words,
  songKey,
  scaleType,
  selectedChord,
  onChordChange,
}: ChordEditorLineProps) {
  // pickerTarget: { wordIndex, chordIndex } where chordIndex=-1 means "add new"
  const [pickerTarget, setPickerTarget] = useState<{
    wordIndex: number;
    chordIndex: number;
  } | null>(null);
  const [pickerRect, setPickerRect] = useState<{
    top: number;
    left: number;
    bottom: number;
  } | null>(null);

  const handleAddChordClick = useCallback(
    (wordIndex: number, element: HTMLElement) => {
      if (selectedChord) {
        // Quick-place mode: append the selected chord
        const word = words[wordIndex];
        onChordChange(wordIndex, [...word.chords, selectedChord]);
        return;
      }
      const rect = element.getBoundingClientRect();
      setPickerRect({ top: rect.top, left: rect.left, bottom: rect.bottom });
      setPickerTarget({ wordIndex, chordIndex: -1 });
    },
    [selectedChord, onChordChange, words]
  );

  const handleChordBadgeClick = useCallback(
    (wordIndex: number, chordIndex: number, element: HTMLElement) => {
      const rect = element.getBoundingClientRect();
      setPickerRect({ top: rect.top, left: rect.left, bottom: rect.bottom });
      setPickerTarget({ wordIndex, chordIndex });
    },
    []
  );

  const handlePickerSelect = useCallback(
    (chord: string) => {
      if (!pickerTarget) return;
      const word = words[pickerTarget.wordIndex];
      let newChords: string[];

      if (pickerTarget.chordIndex === -1) {
        // Adding a new chord
        newChords = [...word.chords, chord];
      } else {
        // Replacing an existing chord
        newChords = word.chords.map((c, i) =>
          i === pickerTarget.chordIndex ? chord : c
        );
      }

      onChordChange(pickerTarget.wordIndex, newChords);
      setPickerTarget(null);
      setPickerRect(null);
    },
    [pickerTarget, onChordChange, words]
  );

  const handlePickerRemove = useCallback(() => {
    if (!pickerTarget || pickerTarget.chordIndex === -1) return;
    const word = words[pickerTarget.wordIndex];
    const newChords = word.chords.filter((_, i) => i !== pickerTarget.chordIndex);
    onChordChange(pickerTarget.wordIndex, newChords);
    setPickerTarget(null);
    setPickerRect(null);
  }, [pickerTarget, onChordChange, words]);

  const closePicker = useCallback(() => {
    setPickerTarget(null);
    setPickerRect(null);
  }, []);

  const isChordOnly = words.every((w) => !w.text.trim());

  const currentPickerChord =
    pickerTarget && pickerTarget.chordIndex >= 0
      ? words[pickerTarget.wordIndex]?.chords[pickerTarget.chordIndex] ?? null
      : null;

  return (
    <div className="mb-1.5">
      <div
        className="flex flex-wrap items-end"
        style={{ lineHeight: 1.2 }}
      >
        {words.map((word, i) => (
          <WordSlot
            key={i}
            word={word}
            index={i}
            songKey={songKey}
            isChordOnly={isChordOnly}
            pickerTarget={pickerTarget}
            onAddChordClick={handleAddChordClick}
            onChordBadgeClick={handleChordBadgeClick}
          />
        ))}
      </div>

      {/* Chord picker dropdown */}
      {pickerTarget !== null && pickerRect && (
        <ChordPickerDropdown
          songKey={songKey}
          scaleType={scaleType}
          currentChord={currentPickerChord}
          anchorRect={pickerRect}
          onSelect={handlePickerSelect}
          onRemove={handlePickerRemove}
          onClose={closePicker}
        />
      )}
    </div>
  );
}

function WordSlot({
  word,
  index,
  songKey,
  isChordOnly,
  pickerTarget,
  onAddChordClick,
  onChordBadgeClick,
}: {
  word: EditorWord;
  index: number;
  songKey: Key;
  isChordOnly: boolean;
  pickerTarget: { wordIndex: number; chordIndex: number } | null;
  onAddChordClick: (index: number, element: HTMLElement) => void;
  onChordBadgeClick: (wordIndex: number, chordIndex: number, element: HTMLElement) => void;
}) {
  const addRef = useRef<HTMLSpanElement>(null);
  const hasChords = word.chords.length > 0;
  const hasText = !!word.text.trim();

  const handleAddClick = () => {
    if (addRef.current) {
      onAddChordClick(index, addRef.current);
    }
  };

  return (
    <div
      className="inline-flex flex-col items-start"
      style={{ marginRight: word.trailing ? undefined : 0 }}
    >
      {/* Chord slot row (above word) — shows all chords + add button */}
      <div
        className="flex items-center gap-px"
        style={{ minHeight: '20px', marginBottom: '1px' }}
      >
        {word.chords.map((chord, ci) => {
          const isEditing =
            pickerTarget?.wordIndex === index &&
            pickerTarget?.chordIndex === ci;
          return (
            <ChordBadgeSlot
              key={ci}
              chord={chord}
              songKey={songKey}
              isEditing={isEditing}
              onClick={(el) => onChordBadgeClick(index, ci, el)}
            />
          );
        })}

        {/* "+" button to add another chord */}
        <span
          ref={addRef}
          onClick={handleAddClick}
          className="cursor-pointer rounded-md transition-all"
          style={{
            minWidth: hasChords ? '18px' : '22px',
            minHeight: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1px 3px',
            color: 'var(--color-text-muted)',
            fontSize: '11px',
            fontWeight: 700,
            opacity: hasChords ? 0.4 : 0.3,
            border: '1px dashed var(--color-border)',
            marginLeft: hasChords ? '2px' : 0,
          }}
          title={hasChords ? 'Add another chord' : 'Click to add chord'}
        >
          +
        </span>
      </div>

      {/* Word text (below chords) */}
      {hasText && (
        <span
          className="text-sm"
          style={{
            color: 'var(--color-text)',
            whiteSpace: 'pre',
            userSelect: 'none',
          }}
        >
          {word.text}{word.trailing}
        </span>
      )}

      {/* Chord-only spacer */}
      {!hasText && isChordOnly && (
        <span
          className="text-sm"
          style={{ color: 'transparent', whiteSpace: 'pre', userSelect: 'none' }}
        >
          {word.trailing || '  '}
        </span>
      )}
    </div>
  );
}

function ChordBadgeSlot({
  chord,
  songKey,
  isEditing,
  onClick,
}: {
  chord: string;
  songKey: Key;
  isEditing: boolean;
  onClick: (element: HTMLElement) => void;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const analysis = analyzeChordInKey(chord, songKey);
  const color = getHarmonicFunctionColor(analysis.function);
  const bgColor = getHarmonicFunctionBgColor(analysis.function);

  return (
    <span
      ref={ref}
      onClick={() => ref.current && onClick(ref.current)}
      className="cursor-pointer rounded transition-all"
      style={{
        padding: '1px 3px',
        backgroundColor: isEditing ? bgColor : 'transparent',
        borderBottom: `2px solid ${color}`,
        fontFamily: 'var(--songbook-chord-font)',
        fontSize: '11px',
        fontWeight: 700,
        color,
        whiteSpace: 'nowrap',
        lineHeight: 1.3,
      }}
      title={`${chord} — click to edit`}
    >
      {chord}
    </span>
  );
}
