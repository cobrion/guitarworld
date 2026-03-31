interface VoicingSelectorProps {
  count: number;
  activeIndex: number;
  onSelect: (index: number) => void;
}

export default function VoicingSelector({ count, activeIndex, onSelect }: VoicingSelectorProps) {
  if (count <= 1) return null;

  return (
    <div className="flex justify-center gap-1 pt-2">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          aria-label={`Voicing ${i + 1}`}
          className="flex items-center justify-center cursor-pointer"
          style={{ width: '28px', height: '28px' }}
        >
          <span
            className="block rounded-full transition-colors duration-150"
            style={{
              width: '8px',
              height: '8px',
              backgroundColor:
                i === activeIndex ? 'var(--color-primary)' : 'transparent',
              border: `1.5px solid ${
                i === activeIndex ? 'var(--color-primary)' : 'var(--color-text-muted)'
              }`,
            }}
          />
        </button>
      ))}
    </div>
  );
}
