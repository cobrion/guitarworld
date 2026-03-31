import { useState, useMemo, useEffect } from 'react';
import type { Song, NoteName } from '@/types';
import { parseChordProLine } from '@/utils/chordpro';
import { transposeChord, getTransposedKey, parseChordName } from '@/utils/transpose';
import { lookupChord } from '@/utils/musicTheory';
import ChordDiagram from '@/components/ChordDiagram';

interface PracticePanelProps {
  song: Song;
  transpose: number;
  onChordChange?: (chord: string | null) => void;
}

interface ChordEvent {
  chord: string;
  sectionIndex: number;
  sectionLabel: string;
}

export default function PracticePanel({ song, transpose, onChordChange }: PracticePanelProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const effectiveKey = useMemo(
    () => transpose === 0 ? song.key : getTransposedKey(song.key, transpose),
    [song.key, transpose]
  );

  // Build flat list of all chords in song order
  const chordSequence = useMemo(() => {
    const events: ChordEvent[] = [];
    for (let si = 0; si < song.sections.length; si++) {
      const section = song.sections[si];
      for (const line of section.lines) {
        const parsed = parseChordProLine(line);
        for (const seg of parsed.segments) {
          if (seg.chord) {
            const displayChord = transpose !== 0
              ? transposeChord(seg.chord, transpose, effectiveKey)
              : seg.chord;
            // Deduplicate consecutive same chords
            if (events.length === 0 || events[events.length - 1].chord !== displayChord) {
              events.push({
                chord: displayChord,
                sectionIndex: si,
                sectionLabel: section.label,
              });
            }
          }
        }
      }
    }
    return events;
  }, [song, transpose, effectiveKey]);

  const currentChord = chordSequence[currentIndex] ?? null;
  const nextChord = chordSequence[currentIndex + 1] ?? null;

  // Look up voicings
  const currentVoicing = useMemo(() => {
    if (!currentChord) return null;
    const { root } = parseChordName(currentChord.chord);
    const data = lookupChord(currentChord.chord, root as NoteName);
    return data?.voicings[0] ?? null;
  }, [currentChord]);

  useEffect(() => {
    onChordChange?.(currentChord?.chord ?? null);
  }, [currentChord, onChordChange]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        setCurrentIndex((i) => Math.min(i + 1, chordSequence.length - 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        setCurrentIndex((i) => Math.max(i - 1, 0));
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [chordSequence.length]);

  if (chordSequence.length === 0) {
    return (
      <div
        className="text-center py-4 text-sm"
        style={{ color: 'var(--color-text-muted)' }}
      >
        No chords found in this song
      </div>
    );
  }

  return (
    <div
      className="px-4 py-4"
      style={{
        backgroundColor: 'var(--color-surface-raised)',
        borderBottom: '2px solid var(--color-border)',
      }}
    >
      <div className="flex items-center gap-4">
        {/* Chord diagram */}
        <div style={{ width: '140px', flexShrink: 0 }}>
          {currentVoicing ? (
            <ChordDiagram voicing={currentVoicing} chordName={currentChord!.chord} />
          ) : (
            <div
              className="text-center py-8 text-xs"
              style={{ color: 'var(--color-text-muted)' }}
            >
              No voicing
            </div>
          )}
        </div>

        {/* Info + controls */}
        <div className="flex-1 min-w-0">
          {/* Current chord */}
          <div className="mb-2">
            <div
              className="text-xs font-medium mb-0.5"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {currentChord?.sectionLabel}
            </div>
            <div
              className="text-xl font-bold"
              style={{ color: 'var(--color-primary)', fontFamily: 'var(--songbook-chord-font)' }}
            >
              {currentChord?.chord}
            </div>
          </div>

          {/* Next chord preview */}
          {nextChord && (
            <div
              className="text-xs mb-3"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Next: <span style={{ fontWeight: 600, fontFamily: 'var(--songbook-chord-font)' }}>{nextChord.chord}</span>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
              disabled={currentIndex === 0}
              className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
              style={{
                backgroundColor: 'var(--color-surface)',
                color: currentIndex === 0 ? 'var(--color-border)' : 'var(--color-text-muted)',
                border: '1px solid var(--color-border)',
              }}
            >
              &#9664; Prev
            </button>
            <span
              className="text-[11px]"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {currentIndex + 1} / {chordSequence.length}
            </span>
            <button
              onClick={() => setCurrentIndex((i) => Math.min(i + 1, chordSequence.length - 1))}
              disabled={currentIndex === chordSequence.length - 1}
              className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
              style={{
                backgroundColor: 'var(--color-surface)',
                color: currentIndex === chordSequence.length - 1 ? 'var(--color-border)' : 'var(--color-text-muted)',
                border: '1px solid var(--color-border)',
              }}
            >
              Next &#9654;
            </button>
          </div>

          <div
            className="text-[10px] mt-2"
            style={{ color: 'var(--color-text-muted)', opacity: 0.6 }}
          >
            Use arrow keys to navigate
          </div>
        </div>
      </div>
    </div>
  );
}
