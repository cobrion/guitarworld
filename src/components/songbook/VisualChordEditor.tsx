import { useState, useMemo, useCallback } from 'react';
import type { Key, ScaleType, SongSection } from '@/types';
import {
  parseChordProText,
  chordProLineToWords,
  wordsToChordProLine,
  rebuildChordProText,
} from '@/utils/chordpro';
import ChordEditorKeyBar from './ChordEditorKeyBar';
import ChordEditorLine from './ChordEditorLine';

/** A chord pattern: for each line, for each word, the chords array */
type ChordPattern = string[][][];

interface VisualChordEditorProps {
  chordProText: string;
  onChange: (text: string) => void;
  songKey: Key;
  onKeyChange: (key: Key) => void;
}

export default function VisualChordEditor({
  chordProText,
  onChange,
  songKey,
  onKeyChange,
}: VisualChordEditorProps) {
  const [scaleType, setScaleType] = useState<ScaleType>('major');
  const [selectedChord, setSelectedChord] = useState<string | null>(null);
  const [copiedPattern, setCopiedPattern] = useState<ChordPattern | null>(null);
  const [copiedFromLabel, setCopiedFromLabel] = useState<string>('');

  // Parse the full ChordPro text
  const { metadata, sections } = useMemo(
    () => parseChordProText(chordProText),
    [chordProText]
  );

  // For each section and line, compute words
  const sectionWords = useMemo(
    () =>
      sections.map((section) =>
        section.lines.map((line) => chordProLineToWords(line))
      ),
    [sections]
  );

  const handleChordChange = useCallback(
    (sectionIndex: number, lineIndex: number, wordIndex: number, chords: string[]) => {
      const newSections: SongSection[] = sections.map((s, si) => {
        if (si !== sectionIndex) return s;
        return {
          ...s,
          lines: s.lines.map((line, li) => {
            if (li !== lineIndex) return line;
            const words = chordProLineToWords(line);
            if (words[wordIndex]) {
              words[wordIndex] = { ...words[wordIndex], chords };
            }
            return wordsToChordProLine(words);
          }),
        };
      });

      const newText = rebuildChordProText(metadata, newSections);
      onChange(newText);
    },
    [sections, metadata, onChange]
  );

  const handleQuickChordSelect = useCallback((chord: string | null) => {
    setSelectedChord(chord);
  }, []);

  // --- Copy / Paste chords ---

  const handleCopyChords = useCallback(
    (sectionIndex: number) => {
      const words = sectionWords[sectionIndex];
      if (!words) return;
      const pattern: ChordPattern = words.map((lineWords) =>
        lineWords.map((w) => [...w.chords])
      );
      setCopiedPattern(pattern);
      setCopiedFromLabel(sections[sectionIndex]?.label ?? `Section ${sectionIndex + 1}`);
    },
    [sectionWords, sections]
  );

  const handlePasteChords = useCallback(
    (targetSectionIndex: number) => {
      if (!copiedPattern) return;

      const newSections: SongSection[] = sections.map((s, si) => {
        if (si !== targetSectionIndex) return s;
        return {
          ...s,
          lines: s.lines.map((line, li) => {
            if (li >= copiedPattern.length) return line; // source has fewer lines
            const sourceLinePattern = copiedPattern[li];
            const words = chordProLineToWords(line);
            const updated = words.map((w, wi) => {
              if (wi < sourceLinePattern.length) {
                return { ...w, chords: [...sourceLinePattern[wi]] };
              }
              return w;
            });
            return wordsToChordProLine(updated);
          }),
        };
      });

      const newText = rebuildChordProText(metadata, newSections);
      onChange(newText);
    },
    [copiedPattern, sections, metadata, onChange]
  );

  const handlePasteToAll = useCallback(() => {
    if (!copiedPattern) return;

    const newSections: SongSection[] = sections.map((s) => ({
      ...s,
      lines: s.lines.map((line, li) => {
        if (li >= copiedPattern.length) return line;
        const sourceLinePattern = copiedPattern[li];
        const words = chordProLineToWords(line);
        const updated = words.map((w, wi) => {
          if (wi < sourceLinePattern.length) {
            return { ...w, chords: [...sourceLinePattern[wi]] };
          }
          return w;
        });
        return wordsToChordProLine(updated);
      }),
    }));

    const newText = rebuildChordProText(metadata, newSections);
    onChange(newText);
    setCopiedPattern(null);
    setCopiedFromLabel('');
  }, [copiedPattern, sections, metadata, onChange]);

  const handleClearCopy = useCallback(() => {
    setCopiedPattern(null);
    setCopiedFromLabel('');
  }, []);

  // Check which sections have chords
  const sectionHasChords = useMemo(
    () =>
      sectionWords.map((lines) =>
        lines.some((words) => words.some((w) => w.chords.length > 0))
      ),
    [sectionWords]
  );

  const isEmpty = sections.length === 0;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Key bar with quick chords */}
      <ChordEditorKeyBar
        songKey={songKey}
        scaleType={scaleType}
        selectedChord={selectedChord}
        onKeyChange={onKeyChange}
        onScaleTypeChange={setScaleType}
        onQuickChordSelect={handleQuickChordSelect}
      />

      {/* Copied chords banner */}
      {copiedPattern && (
        <div
          className="flex items-center gap-2 px-4 py-2 text-xs"
          style={{
            backgroundColor: 'var(--hf-tonic-bg)',
            borderBottom: '1px solid var(--color-border-subtle)',
            color: 'var(--color-success)',
          }}
        >
          <span className="font-semibold">
            Chords copied from {copiedFromLabel}
          </span>
          <span style={{ color: 'var(--color-text-muted)' }}>
            — click Paste on any section
          </span>
          <button
            onClick={handlePasteToAll}
            className="ml-auto px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer"
            style={{
              backgroundColor: 'var(--color-success)',
              color: 'var(--color-text-on-accent)',
              border: 'none',
            }}
          >
            Apply to All
          </button>
          <button
            onClick={handleClearCopy}
            className="px-1.5 py-0.5 rounded text-[11px] cursor-pointer"
            style={{
              background: 'none',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-muted)',
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Visual editor area */}
      <div
        className="flex-1 overflow-y-auto p-4"
        style={{ backgroundColor: 'var(--color-bg)' }}
      >
        {isEmpty ? (
          <div
            className="text-center py-12 text-sm"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Add lyrics in the ChordPro tab first, then switch here to add chords visually.
          </div>
        ) : (
          sections.map((section, si) => (
            <div key={si} className="mb-5">
              {/* Section header with copy/paste buttons */}
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                  style={{
                    color: 'var(--color-primary)',
                    backgroundColor: 'var(--hf-dominant-bg)',
                  }}
                >
                  {section.label}
                </span>

                {/* Copy Chords button — shown when section has chords */}
                {sectionHasChords[si] && (
                  <button
                    onClick={() => handleCopyChords(si)}
                    className="px-2 py-0.5 rounded text-[10px] font-medium cursor-pointer"
                    style={{
                      backgroundColor: copiedFromLabel === section.label
                        ? 'var(--color-success)'
                        : 'var(--color-surface-raised)',
                      color: copiedFromLabel === section.label
                        ? 'var(--color-text-on-accent)'
                        : 'var(--color-text-muted)',
                      border: copiedFromLabel === section.label
                        ? 'none'
                        : '1px solid var(--color-border)',
                    }}
                  >
                    {copiedFromLabel === section.label ? 'Copied' : 'Copy Chords'}
                  </button>
                )}

                {/* Paste Chords button — shown when pattern is copied and this isn't the source */}
                {copiedPattern && copiedFromLabel !== section.label && (
                  <button
                    onClick={() => handlePasteChords(si)}
                    className="px-2 py-0.5 rounded text-[10px] font-semibold cursor-pointer"
                    style={{
                      backgroundColor: 'var(--color-accent)',
                      color: 'var(--color-text-on-accent)',
                      border: 'none',
                    }}
                  >
                    Paste Chords
                  </button>
                )}

                <div
                  className="flex-1 h-px"
                  style={{ backgroundColor: 'var(--color-border-subtle)' }}
                />
              </div>

              {/* Lines */}
              {sectionWords[si]?.map((words, li) => (
                <ChordEditorLine
                  key={li}
                  words={words}
                  songKey={songKey}
                  scaleType={scaleType}
                  selectedChord={selectedChord}
                  onChordChange={(wordIndex, chords) =>
                    handleChordChange(si, li, wordIndex, chords)
                  }
                />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
