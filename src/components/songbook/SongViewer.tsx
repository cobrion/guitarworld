import { useState, useCallback, useRef } from 'react';
import type { Song } from '@/types';
import { useSongbook } from '@/context/SongbookContext';
import SongViewerHeader from './SongViewerHeader';
import ChordTimeline from './ChordTimeline';
import SectionNav from './SectionNav';
import LyricsDisplay from './LyricsDisplay';
import PerformanceDisplay from './PerformanceDisplay';
import PracticePanel from './PracticePanel';
import AutoScrollBar from './AutoScrollBar';
import FloatingChordDiagram from './FloatingChordDiagram';
import SongEditor from './SongEditor';

interface SongViewerProps {
  song: Song;
}

export default function SongViewer({ song }: SongViewerProps) {
  const { state, dispatch } = useSongbook();
  const { transpose, viewMode, showNashville, autoScrollSpeed } = state;

  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [floatingChord, setFloatingChord] = useState<string | null>(null);
  const [activeChord, setActiveChord] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  const sectionRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const handleBack = useCallback(() => {
    dispatch({ type: 'RETURN_TO_LIST' });
  }, [dispatch]);

  const handleTranspose = useCallback((value: number) => {
    dispatch({ type: 'SET_TRANSPOSE', payload: value });
  }, [dispatch]);

  const handleViewMode = useCallback((mode: typeof viewMode) => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  }, [dispatch]);

  const handleToggleNashville = useCallback(() => {
    dispatch({ type: 'TOGGLE_NASHVILLE' });
  }, [dispatch]);

  const handleEdit = useCallback(() => {
    setShowEditor(true);
  }, []);

  const handleEditorSave = useCallback((updatedSong: Song) => {
    dispatch({ type: 'UPDATE_SONG', payload: updatedSong });
    setShowEditor(false);
  }, [dispatch]);

  const handleScrollSpeed = useCallback((speed: number) => {
    dispatch({ type: 'SET_AUTO_SCROLL_SPEED', payload: speed });
  }, [dispatch]);

  const handleSectionClick = useCallback((index: number) => {
    setActiveSectionIndex(index);
    const el = sectionRefs.current.get(index);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleChordClick = useCallback((chord: string) => {
    setFloatingChord(chord);
  }, []);

  const handlePracticeChordChange = useCallback((chord: string | null) => {
    setActiveChord(chord);
  }, []);

  const isPerformance = viewMode === 'performance';

  return (
    <div
      className="rounded-xl overflow-hidden mx-4 sm:mx-6 my-4"
      style={{
        backgroundColor: isPerformance ? 'var(--color-bg)' : 'var(--color-surface)',
        border: isPerformance ? 'none' : '1px solid var(--color-border)',
        boxShadow: isPerformance ? 'none' : 'var(--shadow-md)',
      }}
    >
      {/* Header with transpose, mode toggle, etc */}
      <SongViewerHeader
        song={song}
        transpose={transpose}
        viewMode={viewMode}
        showNashville={showNashville}
        onBack={handleBack}
        onEdit={handleEdit}
        onTransposeChange={handleTranspose}
        onViewModeChange={handleViewMode}
        onToggleNashville={handleToggleNashville}
      />

      {/* Chord Timeline - harmonic overview bar */}
      {!isPerformance && (
        <ChordTimeline
          song={song}
          transpose={transpose}
          activeSectionIndex={activeSectionIndex}
          onSegmentClick={handleSectionClick}
        />
      )}

      {/* Section navigation */}
      {!isPerformance && (
        <SectionNav
          sections={song.sections}
          activeSectionIndex={activeSectionIndex}
          onSectionClick={handleSectionClick}
        />
      )}

      {/* Practice panel (only in practice mode) */}
      {viewMode === 'practice' && (
        <PracticePanel
          song={song}
          transpose={transpose}
          onChordChange={handlePracticeChordChange}
        />
      )}

      {/* Main content — switch between LyricsDisplay and PerformanceDisplay */}
      {isPerformance ? (
        <PerformanceDisplay
          song={song}
          transpose={transpose}
          showNashville={showNashville}
          onChordClick={handleChordClick}
        />
      ) : (
        <>
          <LyricsDisplay
            song={song}
            transpose={transpose}
            showNashville={showNashville}
            viewMode={viewMode}
            activeChord={activeChord}
            onChordClick={handleChordClick}
            sectionRefs={sectionRefs}
          />
          <AutoScrollBar
            speed={autoScrollSpeed}
            onSpeedChange={handleScrollSpeed}
          />
        </>
      )}

      {/* Floating chord diagram */}
      {floatingChord && (
        <FloatingChordDiagram
          chordName={floatingChord}
          onClose={() => setFloatingChord(null)}
        />
      )}

      {/* Song editor modal */}
      {showEditor && (
        <SongEditor
          song={song}
          onSave={handleEditorSave}
          onCancel={() => setShowEditor(false)}
        />
      )}
    </div>
  );
}
