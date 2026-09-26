import { Arrow, Box, DiagramFrame, GRAPHITE, PIGMENT, RULE, Tag } from './Primitives';

/**
 * Fig. 3.1 — AtmosView.
 *
 * The point of the drawing is the third provider. It is dashed because it is
 * failing, and the pipeline keeps running: a dead upstream returns 200 with a
 * null payload, and the dashboard renders one fewer row instead of an error
 * page. Degradation is the architecture, not the error handling.
 */
export function AtmosViewDiagram() {
  const providers = [
    { name: 'Open-Meteo', sub: 'weather + AQI', y: 40, down: false },
    { name: 'MET Norway', sub: 'weather', y: 96, down: false },
    { name: 'WAQI', sub: 'air quality', y: 152, down: true },
    { name: 'ERA5 archive', sub: 'history, to 10 years', y: 208, down: false },
  ];

  return (
    <DiagramFrame
      width={880}
      height={430}
      title="AtmosView architecture: four providers fetched in parallel behind a server-side proxy that holds the keys, normalised to one row shape, cached against provider quotas, and rendered with a per-source breakdown. A failing provider returns a null payload rather than an error."
    >
      <Tag x={0} y={22}>
        FOUR PROVIDERS · FETCHED IN PARALLEL, NEVER IN SEQUENCE
      </Tag>

      {providers.map((p) => (
        <g key={p.name}>
          <rect
            x={0}
            y={p.y}
            width={148}
            height={44}
            fill="var(--color-paper-raised)"
            stroke={p.down ? PIGMENT : 'var(--color-ink)'}
            strokeWidth={1}
            strokeDasharray={p.down ? '4 3' : undefined}
          />
          <text
            x={12}
            y={p.y + 19}
            fill={p.down ? PIGMENT : 'var(--color-ink)'}
            fontFamily="var(--font-sans)"
            fontSize="12.5"
            fontWeight="500"
          >
            {p.name}
          </text>
          <text
            x={12}
            y={p.y + 34}
            fill={GRAPHITE}
            fontFamily="var(--font-mono)"
            fontSize="10"
          >
            {p.down ? 'upstream failing' : p.sub}
          </text>
          <path
            d={`M 150 ${p.y + 22} L 214 ${p.y + 22}`}
            fill="none"
            stroke={p.down ? PIGMENT : 'var(--color-ink)'}
            strokeWidth={1}
            strokeDasharray={p.down ? '4 3' : undefined}
            markerEnd={`url(#arrow-${p.down ? 'pigment' : 'ink'})`}
          />
        </g>
      ))}

      {/* Proxy */}
      <rect
        x={218}
        y={40}
        width={176}
        height={212}
        fill="var(--color-paper-raised)"
        stroke="var(--color-ink)"
        strokeWidth={1}
      />
      <text
        x={230}
        y={64}
        fill="var(--color-ink)"
        fontFamily="var(--font-sans)"
        fontSize="12.5"
        fontWeight="500"
      >
        Express proxy
      </text>
      {[
        'keys stay server-side',
        'Promise.all — latency is',
        'the slowest, not the sum',
        'in-process cache, TTL set',
        'by the provider quota',
        'error → 200 with null',
      ].map((line, i) => (
        <text
          key={line}
          x={230}
          y={88 + i * 19}
          fill={GRAPHITE}
          fontFamily="var(--font-sans)"
          fontSize="11"
        >
          {line}
        </text>
      ))}
      <text
        x={230}
        y={238}
        fill={PIGMENT}
        fontFamily="var(--font-mono)"
        fontSize="9.5"
        letterSpacing="0.06em"
      >
        10 ENDPOINTS OF 39
      </text>

      {/* Normalise */}
      <Box x={430} y={124} w={168} h={72} label="Normalise at boundary" sub="one row shape, always" />
      <Arrow d="M 396 160 L 426 160" />

      {/* Researcher upload */}
      <Box x={430} y={244} w={168} h={64} label="Researcher CSV" sub="multer · header sniffing" />
      <Arrow d="M 514 240 L 514 200" />
      <Tag x={430} y={330}>
        JWT · requireResearcher · PER-ACCOUNT IN MONGO
      </Tag>

      {/* View */}
      <Box x={648} y={40} w={168} h={56} label="12-tile dashboard" sub="a dead source is '--'" />
      <Box x={648} y={112} w={168} h={56} label="Per-source breakdown" sub="per provider, per metric" tone="pigment" />
      <Box x={648} y={184} w={168} h={56} label="Charts + map" sub="ApexCharts · Leaflet" />
      <Arrow d="M 600 152 L 632 152 L 632 68 L 644 68" />
      <Arrow d="M 632 140 L 644 140" tone="pigment" />
      <Arrow d="M 632 212 L 644 212" />

      <Tag x={648} y={266} tone="pigment">
        THE AGGREGATION IS REVERSIBLE.
      </Tag>
      <Tag x={648} y={280} tone="pigment">
        THAT IS THE WHOLE ARGUMENT.
      </Tag>

      <line x1={0} y1={378} x2={880} y2={378} stroke={RULE} strokeWidth={1} />
      <Tag x={0} y={398}>
        DASHED PATH: WAQI IS DOWN. THE USER LOSES ONE ROW OF THE AQI BREAKDOWN,
      </Tag>
      <Tag x={0} y={414}>
        AND NOTHING ELSE.
      </Tag>
    </DiagramFrame>
  );
}
