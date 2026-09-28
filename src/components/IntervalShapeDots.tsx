import type { KeyboardEvent } from 'react';
import type { FretPos, ShapeInterval } from '@/types';
import type { NeckLayout } from '@/utils/neckLayout';
import { dotCenter } from '@/utils/neckLayout';
import { STANDARD_TUNING_NAMES } from '@/utils/constants';
import { SHAPE_COLORS } from '@/utils/intervalShape';

export interface ShapeDot {
  interval: ShapeInterval;
  pos: FretPos;
  label: string;
  noteName: string;
}

interface IntervalShapeDotsProps {
  layout: NeckLayout;
  root: FretPos;
  rootName: string;
  placed: ShapeDot[];
  ghosts: ShapeDot[];
  onRootClick: () => void;
  onGhostClick: (interval: ShapeInterval, pos: FretPos) => void;
}

const DOT_RADIUS = 13;
const GHOST_RADIUS = 11;

function where(pos: FretPos): string {
  return `string ${6 - pos.string} (${STANDARD_TUNING_NAMES[pos.string]}), fret ${pos.fret}`;
}

function activate(handler: () => void) {
  return (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handler();
    }
  };
}

function TwoLineLabel({ cx, cy, top, bottom }: { cx: number; cy: number; top: string; bottom: string }) {
  return (
    <text
      textAnchor="middle"
      fill="var(--diagram-dot-text)"
      fontWeight={800}
      fontFamily="Inter, sans-serif"
      style={{ pointerEvents: 'none' }}
    >
      <tspan x={cx} y={cy - 1} fontSize={8.5}>{top}</tspan>
      <tspan x={cx} y={cy + 8} fontSize={7.5}>{bottom}</tspan>
    </text>
  );
}

export default function IntervalShapeDots({
  layout,
  root,
  rootName,
  placed,
  ghosts,
  onRootClick,
  onGhostClick,
}: IntervalShapeDotsProps) {
  const rootCenter = dotCenter(layout, root.string, root.fret);

  return (
    <g>
      {ghosts.map(({ interval, pos, label, noteName }) => {
        const { cx, cy } = dotCenter(layout, pos.string, pos.fret);
        const color = SHAPE_COLORS[interval];
        const click = () => onGhostClick(interval, pos);
        return (
          <g
            key={`ghost-${interval}-${pos.string}-${pos.fret}`}
            className="fret-dot"
            role="button"
            tabIndex={0}
            aria-label={`Move ${label} (${noteName}) to ${where(pos)}`}
            onClick={click}
            onKeyDown={activate(click)}
            opacity={0.7}
          >
            <title>{`Move ${label} (${noteName}) here — ${where(pos)}`}</title>
            <circle cx={cx} cy={cy} r={GHOST_RADIUS} fill="var(--neck-bg)" fillOpacity={0.75} stroke={color} strokeWidth={2} strokeDasharray="3 2" />
            <circle className="fret-dot-ring" cx={cx} cy={cy} r={15} fill="transparent" stroke={color} strokeWidth={1.5} />
            <text x={cx} y={cy + 3.2} textAnchor="middle" fill={color} fontSize={9} fontWeight={800} fontFamily="Inter, sans-serif" style={{ pointerEvents: 'none' }}>
              {label}
            </text>
          </g>
        );
      })}

      {placed.map(({ interval, pos, label, noteName }) => {
        const { cx, cy } = dotCenter(layout, pos.string, pos.fret);
        return (
          <g key={`placed-${interval}`}>
            <title>{`${label} (${noteName}) — ${where(pos)}. Use the chip to hide it.`}</title>
            {pos.fret === 0 && <circle cx={cx} cy={cy} r={DOT_RADIUS + 2} fill="var(--neck-bg)" />}
            <circle cx={cx} cy={cy} r={DOT_RADIUS} fill={SHAPE_COLORS[interval]} />
            <TwoLineLabel cx={cx} cy={cy} top={label} bottom={noteName} />
          </g>
        );
      })}

      <g
        className="fret-dot"
        role="button"
        tabIndex={0}
        aria-label={`Root ${rootName}, ${where(root)}. Activate to clear the shape.`}
        onClick={onRootClick}
        onKeyDown={activate(onRootClick)}
      >
        <title>{`Root ${rootName} — ${where(root)}. Tap to clear.`}</title>
        {root.fret === 0 && <circle cx={rootCenter.cx} cy={rootCenter.cy} r={DOT_RADIUS + 3} fill="var(--neck-bg)" />}
        <circle cx={rootCenter.cx} cy={rootCenter.cy} r={DOT_RADIUS + 1.5} fill="none" stroke="var(--color-text)" strokeWidth={1.5} />
        <circle cx={rootCenter.cx} cy={rootCenter.cy} r={DOT_RADIUS} fill={SHAPE_COLORS.R} />
        <circle className="fret-dot-ring" cx={rootCenter.cx} cy={rootCenter.cy} r={15} fill="transparent" stroke="var(--color-text)" strokeWidth={1.5} />
        <TwoLineLabel cx={rootCenter.cx} cy={rootCenter.cy} top="R" bottom={rootName} />
      </g>
    </g>
  );
}
