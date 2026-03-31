import React from 'react';
import { STANDARD_TUNING_NAMES, FRET_MARKERS, DOUBLE_FRET_MARKERS } from '@/utils/constants';
import type { NeckLayout } from '@/components/GuitarNeck';

interface NeckFretboardGridProps {
  totalFrets: number;
  layout: NeckLayout;
}

const COLORS = {
  nut: 'var(--diagram-nut)',
  fretWire: 'var(--diagram-fret)',
  string: 'var(--diagram-string)',
  label: 'var(--color-text-muted)',
  fretMarker: 'var(--neck-fret-marker)',
};

export default function NeckFretboardGrid({ totalFrets, layout }: NeckFretboardGridProps) {
  const { stringCoord, fretCoord, stringStart, stringEnd, fretStart, fretEnd, stringsHorizontal } = layout;

  // Strings
  const strings = Array.from({ length: 6 }, (_, i) => {
    const pos = stringCoord(i);
    const thickness = 1.8 - (i / 5) * 1.05;
    return stringsHorizontal ? (
      <line key={`s-${i}`} x1={stringStart} y1={pos} x2={stringEnd} y2={pos} stroke={COLORS.string} strokeWidth={thickness} />
    ) : (
      <line key={`s-${i}`} x1={pos} y1={stringStart} x2={pos} y2={stringEnd} stroke={COLORS.string} strokeWidth={thickness} />
    );
  });

  // Nut (thick bar at fret 0)
  const nutPos = fretCoord(0);
  const nut = stringsHorizontal ? (
    <line x1={nutPos} y1={fretStart} x2={nutPos} y2={fretEnd} stroke={COLORS.nut} strokeWidth={4} />
  ) : (
    <line x1={fretStart} y1={nutPos} x2={fretEnd} y2={nutPos} stroke={COLORS.nut} strokeWidth={4} />
  );

  // Fret wires
  const frets = Array.from({ length: totalFrets }, (_, i) => {
    const pos = fretCoord(i + 1);
    return stringsHorizontal ? (
      <line key={`f-${i}`} x1={pos} y1={fretStart} x2={pos} y2={fretEnd} stroke={COLORS.fretWire} strokeWidth={1} />
    ) : (
      <line key={`f-${i}`} x1={fretStart} y1={pos} x2={fretEnd} y2={pos} stroke={COLORS.fretWire} strokeWidth={1} />
    );
  });

  // String labels (near the nut)
  const labels = STANDARD_TUNING_NAMES.map((name, i) => {
    const sPos = stringCoord(i);
    if (stringsHorizontal) {
      // Labels on the left side, aligned with open-string dot centers
      return (
        <text key={`label-${i}`} x={nutPos + layout.labelOffset} y={sPos + 4} textAnchor="middle"
          fill={COLORS.label} fontSize={11} fontWeight={500} fontFamily="Inter, sans-serif">
          {name}
        </text>
      );
    }
    // Labels above the nut
    return (
      <text key={`label-${i}`} x={sPos} y={nutPos + layout.labelOffset} textAnchor="middle"
        fill={COLORS.label} fontSize={11} fontWeight={500} fontFamily="Inter, sans-serif">
        {name}
      </text>
    );
  });

  // Fret numbers
  const fretNumbers = Array.from({ length: totalFrets }, (_, i) => {
    const fretNum = i + 1;
    const midFret = (fretCoord(i) + fretCoord(i + 1)) / 2;
    if (stringsHorizontal) {
      // Numbers above the fretboard
      return (
        <text key={`fn-${fretNum}`} x={midFret} y={fretStart + layout.fretNumOffset} textAnchor="middle"
          fill={COLORS.label} fontSize={9} fontFamily="Inter, sans-serif">
          {fretNum}
        </text>
      );
    }
    // Numbers to the left of the fretboard
    return (
      <text key={`fn-${fretNum}`} x={fretStart + layout.fretNumOffset} y={midFret + 3} textAnchor="end"
        fill={COLORS.label} fontSize={9} fontFamily="Inter, sans-serif">
        {fretNum}
      </text>
    );
  });

  // Fret marker dots (at 3, 5, 7, 9, 12, 15)
  const markerDots: React.ReactElement[] = [];
  const dotRadius = 4;

  for (const fretNum of FRET_MARKERS) {
    if (fretNum > totalFrets) continue;
    const midFret = (fretCoord(fretNum - 1) + fretCoord(fretNum)) / 2;
    const midString = (fretStart + fretEnd) / 2;

    if (DOUBLE_FRET_MARKERS.includes(fretNum as typeof DOUBLE_FRET_MARKERS[number])) {
      const offset = (fretEnd - fretStart) * 0.25;
      if (stringsHorizontal) {
        markerDots.push(
          <circle key={`dot-${fretNum}-a`} cx={midFret} cy={midString - offset} r={dotRadius} fill={COLORS.fretMarker} />,
          <circle key={`dot-${fretNum}-b`} cx={midFret} cy={midString + offset} r={dotRadius} fill={COLORS.fretMarker} />,
        );
      } else {
        markerDots.push(
          <circle key={`dot-${fretNum}-a`} cx={midString - offset} cy={midFret} r={dotRadius} fill={COLORS.fretMarker} />,
          <circle key={`dot-${fretNum}-b`} cx={midString + offset} cy={midFret} r={dotRadius} fill={COLORS.fretMarker} />,
        );
      }
    } else {
      if (stringsHorizontal) {
        markerDots.push(
          <circle key={`dot-${fretNum}`} cx={midFret} cy={midString} r={dotRadius} fill={COLORS.fretMarker} />,
        );
      } else {
        markerDots.push(
          <circle key={`dot-${fretNum}`} cx={midString} cy={midFret} r={dotRadius} fill={COLORS.fretMarker} />,
        );
      }
    }
  }

  return (
    <g>
      {markerDots}
      {frets}
      {nut}
      {strings}
      {labels}
      {fretNumbers}
    </g>
  );
}
