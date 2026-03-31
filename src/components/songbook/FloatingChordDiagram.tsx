import { useState, useEffect, useCallback } from 'react';
import type { NoteName } from '@/types';
import { lookupChord } from '@/utils/musicTheory';
import { parseChordName } from '@/utils/transpose';
import ChordDiagram from '@/components/ChordDiagram';

interface FloatingChordDiagramProps {
  chordName: string;
  onClose: () => void;
}

export default function FloatingChordDiagram({ chordName, onClose }: FloatingChordDiagramProps) {
  const [voicingIndex, setVoicingIndex] = useState(0);

  const { root } = parseChordName(chordName);
  const chordData = lookupChord(chordName, root as NoteName);
  const voicings = chordData?.voicings ?? [];

  useEffect(() => {
    setVoicingIndex(0);
  }, [chordName]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const prevVoicing = useCallback(() => {
    setVoicingIndex((i) => (i > 0 ? i - 1 : voicings.length - 1));
  }, [voicings.length]);

  const nextVoicing = useCallback(() => {
    setVoicingIndex((i) => (i < voicings.length - 1 ? i + 1 : 0));
  }, [voicings.length]);

  return (
    <>
      {/* Backdrop */}
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 80 }}
        onClick={onClose}
      />

      {/* Popup */}
      <div
        className="rounded-xl"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 90,
          width: '200px',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-md)',
          animation: 'cardFadeIn 0.15s ease-out',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-3 py-2"
          style={{
            borderBottom: '1px solid var(--color-border-subtle)',
            backgroundColor: 'var(--color-surface-raised)',
            borderRadius: '12px 12px 0 0',
          }}
        >
          <span
            className="text-sm font-bold"
            style={{ color: 'var(--color-text)', fontFamily: 'var(--songbook-chord-font)' }}
          >
            {chordName}
          </span>
          <button
            onClick={onClose}
            className="cursor-pointer"
            style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '14px' }}
          >
            &#x2715;
          </button>
        </div>

        {/* Diagram */}
        <div className="p-3">
          {voicings.length > 0 ? (
            <ChordDiagram voicing={voicings[voicingIndex]} chordName={chordName} />
          ) : (
            <div
              className="text-center py-8 text-xs"
              style={{ color: 'var(--color-text-muted)' }}
            >
              No voicing available
            </div>
          )}
        </div>

        {/* Voicing nav */}
        {voicings.length > 1 && (
          <div
            className="flex items-center justify-between px-3 py-2"
            style={{
              borderTop: '1px solid var(--color-border-subtle)',
            }}
          >
            <button
              onClick={prevVoicing}
              className="px-2 py-1 rounded text-xs cursor-pointer"
              style={{
                background: 'none',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-muted)',
              }}
            >
              &#9664;
            </button>
            <span
              className="text-[11px]"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {voicingIndex + 1} / {voicings.length}
            </span>
            <button
              onClick={nextVoicing}
              className="px-2 py-1 rounded text-xs cursor-pointer"
              style={{
                background: 'none',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-muted)',
              }}
            >
              &#9654;
            </button>
          </div>
        )}
      </div>
    </>
  );
}
