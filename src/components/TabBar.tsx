import type { TabView } from '@/types';

interface TabBarProps {
  activeTab: TabView;
  onTabChange: (tab: TabView) => void;
}

const TABS: { key: TabView; label: string }[] = [
  { key: 'explorer', label: 'Key Explorer' },
  { key: 'analyzer', label: 'Chord Analyzer' },
  { key: 'scales', label: 'Scales' },
  { key: 'songbook', label: 'Songbook' },
];

export default function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <nav
      className="sticky top-0 z-20 flex"
      style={{
        backgroundColor: 'var(--color-bg)',
        borderBottom: '1px solid var(--color-border-subtle)',
      }}
    >
      {TABS.map(({ key, label }) => {
        const isActive = activeTab === key;
        return (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            className="flex-1 px-4 py-3 text-sm font-semibold transition-colors cursor-pointer"
            style={{
              color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
              borderBottom: isActive
                ? '3px solid var(--color-primary)'
                : '3px solid transparent',
              backgroundColor: 'transparent',
            }}
          >
            {label}
          </button>
        );
      })}
    </nav>
  );
}
