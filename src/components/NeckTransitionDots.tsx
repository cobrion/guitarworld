import React from 'react';
import type { TransitionTone } from '@/types';
import type { NeckLayout } from '@/components/GuitarNeck';

interface NeckTransitionDotsProps {
  tones: TransitionTone[];
  layout: NeckLayout;
}

const DOT_RADIUS = 11;
const FONT_SIZE = 8;

function fretPosition(
  fret: number,
  layout: NeckLayout,
): { along: number } {
  if (fret === 0) {
    return { along: layout.fretCoord(0) - 16 };
  }
  return { along: (layout.fretCoord(fret - 1) + layout.fretCoord(fret)) / 2 };
}

function toXY(
  stringIdx: number,
  fret: number,
  layout: NeckLayout,
): { x: number; y: number } {
  const sPos = layout.stringCoord(stringIdx);
  const { along } = fretPosition(fret, layout);
  if (layout.stringsHorizontal) {
    return { x: along, y: sPos };
  }
  return { x: sPos, y: along };
}

export default function NeckTransitionDots({ tones, layout }: NeckTransitionDotsProps) {
  const arrows: React.ReactElement[] = [];
  const ghostDots: React.ReactElement[] = [];
  const solidDots: React.ReactElement[] = [];

  for (const tone of tones) {
    const key = `t-${tone.string}`;

    if (tone.type === 'stay') {
      const pos = toXY(tone.string, tone.toFret!, layout);
      const isOpen = tone.toFret === 0;
      solidDots.push(
        <g key={key}>
          <title>{`${tone.noteName} — stays (${tone.toInterval ?? '?'}) — String ${tone.string + 1}, Fret ${tone.toFret}`}</title>
          {/* Outer ring for "stay" emphasis */}
          <circle cx={pos.x} cy={pos.y} r={DOT_RADIUS + 3} fill="none" stroke={tone.color} strokeWidth={1.5} opacity={0.5} />
          <circle
            cx={pos.x} cy={pos.y} r={isOpen ? DOT_RADIUS - 1 : DOT_RADIUS}
            fill={isOpen ? 'transparent' : tone.color}
            stroke={tone.color}
            strokeWidth={isOpen ? 2 : 0}
          />
          <text
            x={pos.x} y={pos.y + FONT_SIZE * 0.35}
            textAnchor="middle"
            fill={isOpen ? tone.color : 'var(--diagram-dot-text)'}
            fontSize={FONT_SIZE} fontWeight={600} fontFamily="Inter, sans-serif"
            style={{ pointerEvents: 'none' }}
          >
            {tone.toInterval ?? ''}
          </text>
        </g>,
      );
    }

    if (tone.type === 'lift') {
      const pos = toXY(tone.string, tone.fromFret!, layout);
      const isOpen = tone.fromFret === 0;
      ghostDots.push(
        <g key={key} opacity={0.4}>
          <title>{`${tone.noteName} — lifts off — String ${tone.string + 1}, Fret ${tone.fromFret}`}</title>
          <circle
            cx={pos.x} cy={pos.y} r={isOpen ? DOT_RADIUS - 1 : DOT_RADIUS}
            fill="none" stroke={tone.color}
            strokeWidth={2} strokeDasharray="3,2"
          />
          <text
            x={pos.x} y={pos.y + FONT_SIZE * 0.35}
            textAnchor="middle" fill={tone.color}
            fontSize={FONT_SIZE} fontWeight={600} fontFamily="Inter, sans-serif"
            style={{ pointerEvents: 'none' }}
          >
            {tone.fromInterval ?? ''}
          </text>
        </g>,
      );
    }

    if (tone.type === 'place') {
      const pos = toXY(tone.string, tone.toFret!, layout);
      const isOpen = tone.toFret === 0;
      solidDots.push(
        <g key={key}>
          <title>{`${tone.noteName} — place finger — String ${tone.string + 1}, Fret ${tone.toFret}`}</title>
          <circle
            cx={pos.x} cy={pos.y} r={isOpen ? DOT_RADIUS - 1 : DOT_RADIUS}
            fill={isOpen ? 'transparent' : tone.color}
            stroke={tone.color}
            strokeWidth={isOpen ? 2 : 0}
          />
          <text
            x={pos.x} y={pos.y + FONT_SIZE * 0.35}
            textAnchor="middle"
            fill={isOpen ? tone.color : 'var(--diagram-dot-text)'}
            fontSize={FONT_SIZE} fontWeight={600} fontFamily="Inter, sans-serif"
            style={{ pointerEvents: 'none' }}
          >
            {tone.toInterval ?? ''}
          </text>
        </g>,
      );
    }

    if (tone.type === 'move') {
      const fromPos = toXY(tone.string, tone.fromFret!, layout);
      const toPos = toXY(tone.string, tone.toFret!, layout);

      // Arrow line
      arrows.push(
        <line
          key={`arrow-${key}`}
          x1={fromPos.x} y1={fromPos.y}
          x2={toPos.x} y2={toPos.y}
          stroke="var(--transition-arrow)"
          strokeWidth={2}
          strokeDasharray="4,3"
          markerEnd="url(#transition-arrowhead)"
          opacity={0.7}
        />,
      );

      // Ghost dot at "from"
      const fromOpen = tone.fromFret === 0;
      ghostDots.push(
        <g key={`ghost-${key}`} opacity={0.4}>
          <title>{`${tone.noteName} — moves from Fret ${tone.fromFret} — String ${tone.string + 1}`}</title>
          <circle
            cx={fromPos.x} cy={fromPos.y} r={fromOpen ? DOT_RADIUS - 1 : DOT_RADIUS}
            fill="none" stroke="var(--transition-lift)"
            strokeWidth={2} strokeDasharray="3,2"
          />
          <text
            x={fromPos.x} y={fromPos.y + FONT_SIZE * 0.35}
            textAnchor="middle" fill="var(--transition-lift)"
            fontSize={FONT_SIZE} fontWeight={600} fontFamily="Inter, sans-serif"
            style={{ pointerEvents: 'none' }}
          >
            {tone.fromInterval ?? ''}
          </text>
        </g>,
      );

      // Solid dot at "to"
      const toOpen = tone.toFret === 0;
      solidDots.push(
        <g key={key}>
          <title>{`${tone.noteName} — moves to Fret ${tone.toFret} — String ${tone.string + 1}`}</title>
          <circle
            cx={toPos.x} cy={toPos.y} r={toOpen ? DOT_RADIUS - 1 : DOT_RADIUS}
            fill={toOpen ? 'transparent' : tone.color}
            stroke={tone.color}
            strokeWidth={toOpen ? 2 : 0}
          />
          <text
            x={toPos.x} y={toPos.y + FONT_SIZE * 0.35}
            textAnchor="middle"
            fill={toOpen ? tone.color : 'var(--diagram-dot-text)'}
            fontSize={FONT_SIZE} fontWeight={600} fontFamily="Inter, sans-serif"
            style={{ pointerEvents: 'none' }}
          >
            {tone.toInterval ?? ''}
          </text>
        </g>,
      );
    }
  }

  return (
    <g>
      {/* Arrowhead marker definition */}
      <defs>
        <marker
          id="transition-arrowhead"
          markerWidth="8" markerHeight="6"
          refX="7" refY="3"
          orient="auto"
        >
          <path d="M0,0 L8,3 L0,6 Z" fill="var(--transition-arrow)" opacity={0.7} />
        </marker>
      </defs>
      {/* Render back-to-front: arrows, ghosts, solids */}
      {arrows}
      {ghostDots}
      {solidDots}
    </g>
  );
}
