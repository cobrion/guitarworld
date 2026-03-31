import type { Difficulty } from '@/types';

const BADGE_STYLES: Record<Difficulty, { bg: string; color: string }> = {
  beginner: { bg: 'var(--color-success)', color: 'var(--color-bg)' },
  intermediate: { bg: 'var(--color-warning)', color: 'var(--color-bg)' },
  advanced: { bg: 'var(--color-error)', color: 'var(--color-text)' },
};

interface DifficultyBadgeProps {
  difficulty: Difficulty;
}

export default function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  const style = BADGE_STYLES[difficulty];
  return (
    <span
      className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize"
      style={{
        backgroundColor: style.bg,
        color: style.color,
      }}
    >
      {difficulty}
    </span>
  );
}
