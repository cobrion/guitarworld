import type { SongSection } from '@/types';

interface SectionNavProps {
  sections: SongSection[];
  activeSectionIndex: number;
  onSectionClick: (index: number) => void;
}

export default function SectionNav({ sections, activeSectionIndex, onSectionClick }: SectionNavProps) {
  if (sections.length <= 1) return null;

  return (
    <div
      className="flex items-center gap-1.5 px-4 py-2 overflow-x-auto scrollbar-none"
      style={{
        borderBottom: '1px solid var(--color-border-subtle)',
        backgroundColor: 'var(--color-surface)',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {sections.map((section, i) => {
        const isActive = i === activeSectionIndex;
        return (
          <button
            key={i}
            onClick={() => onSectionClick(i)}
            className="flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium cursor-pointer transition-colors"
            style={{
              backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-surface-raised)',
              color: isActive ? 'var(--color-text-on-primary)' : 'var(--color-text-muted)',
              border: isActive ? 'none' : '1px solid var(--color-border)',
            }}
          >
            {section.label}
          </button>
        );
      })}
    </div>
  );
}
