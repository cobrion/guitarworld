import { useState, useEffect, useRef, useCallback } from 'react';

interface AutoScrollBarProps {
  speed: number;
  onSpeedChange: (speed: number) => void;
}

export default function AutoScrollBar({ speed, onSpeedChange }: AutoScrollBarProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const effectiveSpeed = speed || 3; // default speed when slider is at 0

  const scrollStep = useCallback((timestamp: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const delta = timestamp - lastTimeRef.current;

    // Speed maps to pixels per 16ms frame (roughly)
    if (delta >= 16) {
      const pixelsPerFrame = effectiveSpeed * 0.3;
      window.scrollBy({ top: pixelsPerFrame, behavior: 'instant' as ScrollBehavior });
      lastTimeRef.current = timestamp;
    }

    rafRef.current = requestAnimationFrame(scrollStep);
  }, [effectiveSpeed]);

  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = 0;
      rafRef.current = requestAnimationFrame(scrollStep);
    } else {
      cancelAnimationFrame(rafRef.current);
    }

    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying, scrollStep]);

  // Pause on user wheel scroll
  useEffect(() => {
    if (!isPlaying) return;

    const handleWheel = () => {
      setIsPlaying(false);
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [isPlaying]);

  // Space bar toggle
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div
      className="flex items-center gap-3 px-4 py-2"
      style={{
        position: 'sticky',
        bottom: 0,
        backgroundColor: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.15)',
        zIndex: 10,
      }}
    >
      {/* Play/Pause */}
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
        style={{
          backgroundColor: isPlaying ? 'var(--color-primary)' : 'var(--color-surface-raised)',
          color: isPlaying ? 'var(--color-text-on-primary)' : 'var(--color-text-muted)',
          border: isPlaying ? 'none' : '1px solid var(--color-border)',
          fontSize: '14px',
        }}
        aria-label={isPlaying ? 'Pause auto-scroll' : 'Play auto-scroll'}
      >
        {isPlaying ? '⏸' : '▶'}
      </button>

      {/* Speed label */}
      <span
        className="text-[11px] font-medium flex-shrink-0"
        style={{ color: 'var(--color-text-muted)', minWidth: '36px' }}
      >
        Speed
      </span>

      {/* Speed slider */}
      <input
        type="range"
        min={1}
        max={10}
        value={speed || 3}
        onChange={(e) => onSpeedChange(parseInt(e.target.value, 10))}
        className="flex-1"
        style={{
          accentColor: 'var(--color-primary)',
          maxWidth: '200px',
        }}
      />

      <span
        className="text-[11px] font-bold"
        style={{ color: 'var(--color-text-muted)', minWidth: '16px', textAlign: 'center' }}
      >
        {speed || 3}
      </span>

      <span
        className="text-[10px] hidden sm:inline"
        style={{ color: 'var(--color-text-muted)', opacity: 0.5 }}
      >
        Space to play/pause
      </span>
    </div>
  );
}
