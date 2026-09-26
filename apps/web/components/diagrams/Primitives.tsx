import type { ReactNode } from 'react';

/**
 * Shared parts for the three architecture diagrams.
 *
 * Every diagram on this site is drawn for the system it describes — hairline
 * rules, mono labels, one pigment path. No icon set, no stock illustration,
 * no rounded gradient boxes.
 */

export const INK = 'var(--color-ink)';
export const RULE = 'var(--color-rule-strong)';
export const GRAPHITE = 'var(--color-graphite)';
export const PIGMENT = 'var(--color-pigment)';
export const PAPER = 'var(--color-paper-raised)';

export function Defs() {
  return (
    <defs>
      <marker
        id="arrow-ink"
        viewBox="0 0 8 8"
        refX="7"
        refY="4"
        markerWidth="7"
        markerHeight="7"
        orient="auto-start-reverse"
      >
        <path d="M 0 1 L 7 4 L 0 7 z" fill={INK} />
      </marker>
      <marker
        id="arrow-pigment"
        viewBox="0 0 8 8"
        refX="7"
        refY="4"
        markerWidth="7"
        markerHeight="7"
        orient="auto-start-reverse"
      >
        <path d="M 0 1 L 7 4 L 0 7 z" fill={PIGMENT} />
      </marker>
    </defs>
  );
}

export function Box({
  x,
  y,
  w,
  h,
  label,
  sub,
  tone = 'default',
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  sub?: string;
  tone?: 'default' | 'pigment' | 'quiet';
}) {
  const stroke = tone === 'pigment' ? PIGMENT : tone === 'quiet' ? RULE : INK;
  const labelFill = tone === 'pigment' ? PIGMENT : INK;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        fill={PAPER}
        stroke={stroke}
        strokeWidth={1}
      />
      <text
        x={x + 12}
        y={y + (sub ? 22 : h / 2 + 4)}
        fill={labelFill}
        fontFamily="var(--font-sans)"
        fontSize="12.5"
        fontWeight="500"
      >
        {label}
      </text>
      {sub ? (
        <text
          x={x + 12}
          y={y + 39}
          fill={GRAPHITE}
          fontFamily="var(--font-mono)"
          fontSize="9.5"
        >
          {sub}
        </text>
      ) : null}
    </g>
  );
}

export function Arrow({
  d,
  tone = 'default',
  dashed = false,
}: {
  d: string;
  tone?: 'default' | 'pigment';
  dashed?: boolean;
}) {
  const stroke = tone === 'pigment' ? PIGMENT : INK;
  return (
    <path
      d={d}
      fill="none"
      stroke={stroke}
      strokeWidth={1}
      strokeDasharray={dashed ? '3 3' : undefined}
      markerEnd={`url(#arrow-${tone === 'pigment' ? 'pigment' : 'ink'})`}
    />
  );
}

export function Tag({
  x,
  y,
  children,
  tone = 'graphite',
  anchor = 'start',
}: {
  x: number;
  y: number;
  children: ReactNode;
  tone?: 'graphite' | 'pigment' | 'ink';
  anchor?: 'start' | 'middle' | 'end';
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fill={tone === 'pigment' ? PIGMENT : tone === 'ink' ? INK : GRAPHITE}
      fontFamily="var(--font-mono)"
      fontSize="9.5"
      letterSpacing="0.06em"
    >
      {children}
    </text>
  );
}

export function DiagramFrame({
  width,
  height,
  title,
  children,
}: {
  width: number;
  height: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      role="img"
      aria-label={title}
      style={{ display: 'block', height: 'auto', overflow: 'visible' }}
    >
      <Defs />
      {children}
    </svg>
  );
}
