import { useState } from 'react';
import type { ChordData, ChordQuality } from '@/types';
import ChordHeader from '@/components/ChordHeader';
import DifficultyBadge from '@/components/DifficultyBadge';
import VoicingSelector from '@/components/VoicingSelector';
import ChordDiagram from '@/components/ChordDiagram';

const BORDER_COLORS: Partial<Record<ChordQuality, string>> = {
  major: 'var(--chord-major-border)',
  minor: 'var(--chord-minor-border)',
  diminished: 'var(--chord-dim-border)',
  augmented: 'var(--color-accent)',
  dominant7: 'var(--chord-7th-border)',
  major7: 'var(--chord-7th-border)',
  minor7: 'var(--chord-minor-border)',
  minor7b5: 'var(--chord-dim-border)',
  diminished7: 'var(--chord-dim-border)',
  sus2: 'var(--chord-sus-border)',
  sus4: 'var(--chord-sus-border)',
  add9: 'var(--color-accent)',
  minoradd9: 'var(--chord-minor-border)',
  dominant9: 'var(--color-accent)',
  power: 'var(--color-secondary)',
};

const BG_COLORS: Partial<Record<ChordQuality, string>> = {
  major: 'var(--chord-major-bg)',
  minor: 'var(--chord-minor-bg)',
  diminished: 'var(--chord-dim-bg)',
  augmented: 'var(--chord-sus-bg)',
  dominant7: 'var(--chord-7th-bg)',
  major7: 'var(--chord-7th-bg)',
  minor7: 'var(--chord-minor-bg)',
  minor7b5: 'var(--chord-dim-bg)',
  diminished7: 'var(--chord-dim-bg)',
  sus2: 'var(--chord-sus-bg)',
  sus4: 'var(--chord-sus-bg)',
  add9: 'var(--chord-sus-bg)',
  minoradd9: 'var(--chord-minor-bg)',
  dominant9: 'var(--chord-sus-bg)',
  power: 'var(--chord-major-bg)',
};

interface ChordCardProps {
  chord: ChordData;
  animationDelay?: number;
}

export default function ChordCard({ chord, animationDelay = 0 }: ChordCardProps) {
  const [activeVoicing, setActiveVoicing] = useState(0);
  const borderColor = BORDER_COLORS[chord.quality] ?? 'var(--color-border)';
  const bgColor = BG_COLORS[chord.quality] ?? 'var(--color-surface)';

  return (
    <div
      className="rounded-xl p-4 transition-all duration-200"
      style={{
        backgroundColor: bgColor,
        borderLeft: `3px solid ${borderColor}`,
        border: `1px solid var(--color-border-subtle)`,
        borderLeftWidth: '3px',
        borderLeftColor: borderColor,
        boxShadow: 'var(--shadow-sm)',
        animation: `cardFadeIn 0.4s ease-out ${animationDelay}ms both`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <ChordHeader name={chord.name} romanNumeral={chord.romanNumeral} />
      </div>

      <div className="flex justify-center my-2">
        {chord.voicings[activeVoicing] ? (
          <ChordDiagram voicing={chord.voicings[activeVoicing]} chordName={chord.name} />
        ) : (
          <p
            className="text-xs text-center py-6"
            style={{ color: 'var(--color-text-muted)' }}
          >
            No voicing available
          </p>
        )}
      </div>

      <div className="flex items-center justify-between mt-2">
        <DifficultyBadge difficulty={chord.difficulty} />
      </div>

      <VoicingSelector
        count={chord.voicings.length}
        activeIndex={activeVoicing}
        onSelect={setActiveVoicing}
      />
    </div>
  );
}
