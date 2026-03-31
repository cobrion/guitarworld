import { useMemo, useCallback } from 'react';
import type { Song, SongViewMode } from '@/types';
import { chordProLineToWords } from '@/utils/chordpro';
import { transposeChord, getTransposedKey } from '@/utils/transpose';
import { chordToNashville } from '@/utils/harmonicAnalysis';
import ChordBadge from './ChordBadge';

interface LyricsDisplayProps {
  song: Song;
  transpose: number;
  showNashville: boolean;
  viewMode: SongViewMode;
  activeChord?: string | null;
  onChordClick?: (chord: string) => void;
  sectionRefs?: React.MutableRefObject<Map<number, HTMLDivElement>>;
}

export default function LyricsDisplay({
  song,
  transpose,
  showNashville,
  viewMode,
  activeChord,
  onChordClick,
  sectionRefs,
}: LyricsDisplayProps) {
  const effectiveKey = useMemo(
    () => transpose === 0 ? song.key : getTransposedKey(song.key, transpose),
    [song.key, transpose]
  );

  const isPerformance = viewMode === 'performance';
  const lyricSize = isPerformance ? '1.25rem' : '0.9375rem';
  const chordSize = isPerformance ? '1rem' : '0.8125rem';

  const setSectionRef = useCallback((index: number, el: HTMLDivElement | null) => {
    if (sectionRefs && el) {
      sectionRefs.current.set(index, el);
    }
  }, [sectionRefs]);

  return (
    <div className="px-4 sm:px-6 py-4">
      {song.sections.map((section, sectionIndex) => (
        <div
          key={sectionIndex}
          ref={(el) => setSectionRef(sectionIndex, el)}
          className="mb-6"
        >
          {/* Section header */}
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
              style={{
                color: 'var(--color-primary)',
                backgroundColor: 'var(--hf-dominant-bg)',
              }}
            >
              {section.label}
            </span>
            <div
              className="flex-1 h-px"
              style={{ backgroundColor: 'var(--color-border-subtle)' }}
            />
          </div>

          {/* Lines */}
          {section.lines.map((line, lineIndex) => {
            const words = chordProLineToWords(line);
            const hasChords = words.some((w) => w.chords.length > 0);
            const hasLyrics = words.some((w) => w.text.trim() !== '');
            const isChordOnly = hasChords && !hasLyrics;

            return (
              <div key={lineIndex} className="mb-2">
                <div className="flex flex-wrap items-end">
                  {words.map((word, wi) => {
                    const hasWordChords = word.chords.length > 0;
                    const hasWordText = !!word.text.trim();

                    return (
                      <span
                        key={wi}
                        className="inline-flex flex-col items-start"
                      >
                        {/* Chords above word */}
                        {hasChords && (
                          <span
                            className="flex items-center gap-px"
                            style={{
                              minHeight: chordSize,
                              marginBottom: '2px',
                            }}
                          >
                            {hasWordChords ? (
                              word.chords.map((chord, ci) => {
                                const displayChord = transpose !== 0
                                  ? transposeChord(chord, transpose, effectiveKey)
                                  : chord;
                                const nashvilleLabel = showNashville
                                  ? chordToNashville(displayChord, effectiveKey)
                                  : undefined;

                                return (
                                  <ChordBadge
                                    key={ci}
                                    chord={displayChord}
                                    songKey={effectiveKey}
                                    showNashville={showNashville}
                                    nashvilleLabel={nashvilleLabel}
                                    isActive={activeChord === displayChord}
                                    onClick={onChordClick}
                                    fontSize={chordSize}
                                  />
                                );
                              })
                            ) : (
                              /* Empty spacer to maintain the chord row height */
                              <span style={{ visibility: 'hidden', fontSize: chordSize }}>
                                &nbsp;
                              </span>
                            )}
                          </span>
                        )}

                        {/* Word text below chord */}
                        {hasWordText && (
                          <span
                            style={{
                              fontSize: lyricSize,
                              color: 'var(--color-text)',
                              whiteSpace: 'pre',
                              lineHeight: 1.6,
                            }}
                          >
                            {word.text}{word.trailing}
                          </span>
                        )}

                        {/* Chord-only spacer */}
                        {isChordOnly && !hasWordText && (
                          <span
                            style={{
                              fontSize: lyricSize,
                              color: 'transparent',
                              whiteSpace: 'pre',
                            }}
                          >
                            {word.trailing || '  '}
                          </span>
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
