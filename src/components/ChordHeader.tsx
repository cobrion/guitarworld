interface ChordHeaderProps {
  name: string;
  romanNumeral: string;
}

export default function ChordHeader({ name, romanNumeral }: ChordHeaderProps) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <h3
        className="text-lg font-bold truncate"
        style={{ color: 'var(--color-text)' }}
      >
        {name}
      </h3>
      <span
        className="text-xs font-medium flex-shrink-0"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {romanNumeral}
      </span>
    </div>
  );
}
