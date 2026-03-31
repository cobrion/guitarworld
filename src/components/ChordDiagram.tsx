import type { ChordVoicing } from '@/types';
import { calculateDimensions } from '@/utils/diagramLayout';
import FretboardGrid from '@/components/FretboardGrid';
import FingerDots from '@/components/FingerDots';
import BarreIndicator from '@/components/BarreIndicator';
import StringMarkers from '@/components/StringMarkers';
import FretLabel from '@/components/FretLabel';

interface ChordDiagramProps {
  voicing: ChordVoicing;
  chordName: string;
}

function buildAriaLabel(chordName: string, voicing: ChordVoicing): string {
  const stringLabels = voicing.strings
    .map((fret) => (fret === null ? 'X' : String(fret)))
    .join('-');
  const fretInfo = voicing.baseFret > 1 ? `, fret ${voicing.baseFret}` : '';
  return `${chordName} chord: ${stringLabels}${fretInfo}`;
}

export default function ChordDiagram({ voicing, chordName }: ChordDiagramProps) {
  const dims = calculateDimensions(120, 160);

  return (
    <svg
      viewBox={`0 0 ${dims.svgWidth} ${dims.svgHeight}`}
      role="img"
      aria-label={buildAriaLabel(chordName, voicing)}
      style={{ width: '100%', height: '100%' }}
    >
      <FretboardGrid dims={dims} baseFret={voicing.baseFret} />
      <BarreIndicator barres={voicing.barres} dims={dims} />
      <FingerDots voicing={voicing} dims={dims} />
      <StringMarkers voicing={voicing} dims={dims} />
      <FretLabel baseFret={voicing.baseFret} dims={dims} />
    </svg>
  );
}
