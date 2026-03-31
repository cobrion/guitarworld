import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import type { Song } from '@/types';
import { chordProLineToWords } from '@/utils/chordpro';
import { transposeChord, getTransposedKey } from '@/utils/transpose';
import { chordToNashville } from '@/utils/harmonicAnalysis';
import ChordBadge from './ChordBadge';

interface PerformanceDisplayProps {
  song: Song;
  transpose: number;
  showNashville: boolean;
  onChordClick?: (chord: string) => void;
}

export default function PerformanceDisplay({
  song,
  transpose,
  showNashville,
  onChordClick,
}: PerformanceDisplayProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [fontScale, setFontScale] = useState(1);

  const effectiveKey = useMemo(
    () => transpose === 0 ? song.key : getTransposedKey(song.key, transpose),
    [song.key, transpose]
  );

  const totalSections = song.sections.length;
  const section = song.sections[currentIndex];

  // Navigation
  const goNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, totalSections - 1));
  }, [totalSections]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }, []);

  const goTo = useCallback((index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, totalSections - 1)));
  }, [totalSections]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'Home') {
        e.preventDefault();
        goTo(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        goTo(totalSections - 1);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev, goTo, totalSections]);

  // Touch swipe support
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;
      const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
      const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
      touchStartRef.current = null;

      // Horizontal swipe (> 50px, more horizontal than vertical)
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) goNext();
        else goPrev();
      }
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [goNext, goPrev]);

  // Auto-fit: scale font down if content overflows
  useEffect(() => {
    setFontScale(1);
    requestAnimationFrame(() => {
      const container = containerRef.current;
      const content = contentRef.current;
      if (!container || !content) return;

      const availableHeight = container.clientHeight - 100; // reserve space for header + dots
      const contentHeight = content.scrollHeight;

      if (contentHeight > availableHeight && availableHeight > 0) {
        const scale = Math.max(0.6, availableHeight / contentHeight);
        setFontScale(scale);
      }
    });
  }, [currentIndex, song]);

  if (!section) return null;

  const baseLyricSize = 1.3 * fontScale;
  const baseChordSize = 1.05 * fontScale;

  return (
    <div
      ref={containerRef}
      onClick={goNext}
      style={{
        height: 'calc(100vh - 120px)',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        userSelect: 'none',
        backgroundColor: 'var(--color-bg)',
      }}
    >
      {/* Top bar: section label + position */}
      <div
        className="flex items-center justify-between px-6 py-3 flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
        style={{ cursor: 'default' }}
      >
        {/* Previous button */}
        <button
          onClick={(e) => { e.stopPropagation(); goPrev(); }}
          disabled={currentIndex === 0}
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm cursor-pointer"
          style={{
            background: 'none',
            border: '1px solid var(--color-border)',
            color: currentIndex === 0 ? 'var(--color-border)' : 'var(--color-text-muted)',
          }}
        >
          &#9664;
        </button>

        {/* Section label */}
        <div className="text-center">
          <span
            className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full"
            style={{
              color: 'var(--color-primary)',
              backgroundColor: 'var(--hf-dominant-bg)',
            }}
          >
            {section.label}
          </span>
          <div
            className="text-[10px] mt-1"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {currentIndex + 1} of {totalSections}
          </div>
        </div>

        {/* Next button */}
        <button
          onClick={(e) => { e.stopPropagation(); goNext(); }}
          disabled={currentIndex === totalSections - 1}
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm cursor-pointer"
          style={{
            background: 'none',
            border: '1px solid var(--color-border)',
            color: currentIndex === totalSections - 1 ? 'var(--color-border)' : 'var(--color-text-muted)',
          }}
        >
          &#9654;
        </button>
      </div>

      {/* Lyrics content — vertically centered */}
      <div
        className="flex-1 flex items-center justify-center px-6 overflow-hidden"
        style={{ minHeight: 0 }}
      >
        <div
          ref={contentRef}
          className="w-full"
          style={{ maxWidth: '700px' }}
        >
          {section.lines.map((line, lineIndex) => {
            const words = chordProLineToWords(line);
            const hasChords = words.some((w) => w.chords.length > 0);
            const hasLyrics = words.some((w) => w.text.trim() !== '');
            const isChordOnly = hasChords && !hasLyrics;

            return (
              <div key={lineIndex} className="mb-3">
                <div className="flex flex-wrap items-end">
                  {words.map((word, wi) => {
                    const hasWordChords = word.chords.length > 0;
                    const hasWordText = !!word.text.trim();

                    return (
                      <span
                        key={wi}
                        className="inline-flex flex-col items-start"
                      >
                        {hasChords && (
                          <span
                            className="flex items-center gap-px"
                            style={{
                              minHeight: `${baseChordSize}rem`,
                              marginBottom: '3px',
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
                                    onClick={(c) => { onChordClick?.(c); }}
                                    fontSize={`${baseChordSize}rem`}
                                  />
                                );
                              })
                            ) : (
                              <span style={{ visibility: 'hidden', fontSize: `${baseChordSize}rem` }}>
                                &nbsp;
                              </span>
                            )}
                          </span>
                        )}

                        {hasWordText && (
                          <span
                            style={{
                              fontSize: `${baseLyricSize}rem`,
                              color: 'var(--color-text)',
                              whiteSpace: 'pre',
                              lineHeight: 1.5,
                            }}
                          >
                            {word.text}{word.trailing}
                          </span>
                        )}

                        {isChordOnly && !hasWordText && (
                          <span
                            style={{
                              fontSize: `${baseLyricSize}rem`,
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
      </div>

      {/* Bottom: progress dots + hint */}
      <div
        className="flex flex-col items-center gap-2 px-6 py-3 flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
        style={{ cursor: 'default' }}
      >
        {/* Progress dots */}
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          {song.sections.map((s, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="rounded-full cursor-pointer transition-all"
              title={s.label}
              style={{
                width: i === currentIndex ? '20px' : '8px',
                height: '8px',
                backgroundColor: i === currentIndex
                  ? 'var(--color-primary)'
                  : i < currentIndex
                    ? 'var(--color-text-muted)'
                    : 'var(--color-border)',
                border: 'none',
                transition: 'all 0.2s ease',
              }}
            />
          ))}
        </div>

        {/* Hint */}
        <div
          className="text-[10px]"
          style={{ color: 'var(--color-text-muted)', opacity: 0.4 }}
        >
          Tap to advance &middot; Swipe or arrow keys to navigate
        </div>
      </div>
    </div>
  );
}
