import type { Key } from '@/types';
import { analyzeChordInKey, getHarmonicFunctionColor, getHarmonicFunctionBgColor } from '@/utils/harmonicAnalysis';

interface ChordBadgeProps {
  chord: string;
  songKey: Key;
  showNashville?: boolean;
  nashvilleLabel?: string;
  isActive?: boolean;
  onClick?: (chord: string) => void;
  fontSize?: string;
}

export default function ChordBadge({
  chord,
  songKey,
  showNashville,
  nashvilleLabel,
  isActive,
  onClick,
  fontSize = '0.8125rem',
}: ChordBadgeProps) {
  const analysis = analyzeChordInKey(chord, songKey);
  const color = getHarmonicFunctionColor(analysis.function);
  const bgColor = getHarmonicFunctionBgColor(analysis.function);
  const displayLabel = showNashville && nashvilleLabel ? nashvilleLabel : chord;

  return (
    <span
      onClick={() => onClick?.(chord)}
      role={onClick ? 'button' : undefined}
      title={analysis.romanNumeral
        ? `${chord} — ${analysis.romanNumeral} (${analysis.function})`
        : `${chord} (non-diatonic)`
      }
      className="inline-block rounded transition-all duration-150"
      style={{
        fontFamily: 'var(--songbook-chord-font)',
        fontSize,
        fontWeight: 700,
        color,
        backgroundColor: isActive ? bgColor : 'transparent',
        borderBottom: `2px solid ${color}`,
        padding: '1px 4px',
        cursor: onClick ? 'pointer' : 'default',
        whiteSpace: 'nowrap',
        lineHeight: 1.4,
        ...(isActive ? { boxShadow: `0 0 0 1px ${color}`, borderRadius: '4px' } : {}),
      }}
    >
      {displayLabel}
    </span>
  );
}
