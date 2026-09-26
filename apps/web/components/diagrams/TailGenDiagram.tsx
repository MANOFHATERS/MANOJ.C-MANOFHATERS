import { Arrow, Box, DiagramFrame, GRAPHITE, PIGMENT, RULE, Tag } from './Primitives';

/**
 * Fig. 2.1 — TailGen.
 *
 * Four layers, read downward. The pigment line is the one that matters: the
 * certification verdict blocks promotion, and promotion additionally requires
 * a named human. The verdict on the shipped model is FAIL, 5 of 7.
 */
export function TailGenDiagram() {
  return (
    <DiagramFrame
      width={880}
      height={470}
      title="TailGen architecture: a diffusion engine trained on forty years of S&P 500 returns, a validation layer of coverage and tail tests, a governance layer with a hash-verified registry and human-gated promotion, and a FastAPI serving service behind a four-surface web platform."
    >
      {/* Layer labels down the left margin */}
      {[
        ['I', 'ENGINE', 52],
        ['II', 'VALIDATION', 168],
        ['III', 'GOVERNANCE', 284],
        ['IV', 'SERVING', 392],
      ].map(([n, label, y]) => (
        <g key={label as string}>
          <text
            x={0}
            y={y as number}
            fill={PIGMENT}
            fontFamily="var(--font-mono)"
            fontSize="11"
          >
            {n as string}
          </text>
          <text
            x={24}
            y={y as number}
            fill={GRAPHITE}
            fontFamily="var(--font-mono)"
            fontSize="9.5"
            letterSpacing="0.08em"
          >
            {label as string}
          </text>
        </g>
      ))}

      {/* Data in */}
      <Tag x={150} y={22}>
        S&amp;P 500 DAILY CLOSES FROM 1985 · yfinance · QUALITY-GATED
      </Tag>
      <Arrow d="M 225 30 L 225 44" />

      {/* Engine */}
      <Box x={150} y={46} w={168} h={56} label="VP-SDE forward process" sub="DDPM discretisation" />
      <Box x={348} y={46} w={168} h={56} label="Denoiser" sub="DiT 541K · TCN 261K" />
      <Box x={546} y={46} w={168} h={56} label="Reverse sampler" sub="DDIM η=0 · DDPM · ODE" />
      <Arrow d="M 320 74 L 344 74" />
      <Arrow d="M 518 74 L 542 74" />
      <Tag x={726} y={66}>
        60-DAY PATHS
      </Tag>
      <Tag x={726} y={80}>
        THAT NEVER HAPPENED
      </Tag>

      {/* down */}
      <Arrow d="M 630 104 L 630 132 L 225 132 L 225 158" />

      {/* Validation */}
      <Box x={150} y={160} w={168} h={56} label="VaR / ES estimators" sub="99% and 95%" />
      <Box x={348} y={160} w={168} h={56} label="Coverage tests" sub="Kupiec · Christoffersen" />
      <Box x={546} y={160} w={168} h={56} label="Tail index" sub="Hill α · drift bands" />
      <Arrow d="M 320 188 L 344 188" />
      <Arrow d="M 518 188 L 542 188" />

      <Arrow d="M 434 218 L 434 246" tone="pigment" />

      {/* Certification */}
      <Box
        x={330}
        y={248}
        w={204}
        h={56}
        label="Certification — 7 gates"
        sub="verdict: FAIL, 5 / 7"
        tone="pigment"
      />
      <Tag x={544} y={270} tone="pigment">
        BOTH FAILURES ARE KUPIEC
      </Tag>
      <Tag x={544} y={284} tone="pigment">
        COVERAGE ON A CRASH WINDOW
      </Tag>

      {/* Governance */}
      <Box x={150} y={248} w={160} h={56} label="Registry" sub="SHA-256 · audit chain" />
      <Arrow d="M 326 276 L 314 276" tone="pigment" />

      <Box x={150} y={330} w={160} h={44} label="promote()" tone="quiet" sub="raises without a human" />
      <Arrow d="M 230 306 L 230 326" />
      <Tag x={322} y={352}>
        EVALUATION ATTACHED + NAMED APPROVER, OR IT RAISES
      </Tag>

      {/* Serving */}
      <Box x={150} y={400} w={168} h={52} label="FastAPI service" sub="API keys · token bucket" />
      <Box x={348} y={400} w={168} h={52} label="Next.js platform" sub="4 surfaces · SSE" />
      <Box x={546} y={400} w={168} h={52} label="Observability" sub="Prometheus · trace IDs" />
      <Arrow d="M 230 376 L 230 396" />
      <Arrow d="M 320 426 L 344 426" />
      <Arrow d="M 518 426 L 542 426" />

      <line x1={0} y1={462} x2={880} y2={462} stroke={RULE} strokeWidth={1} />
      <Tag x={726} y={426} tone="graphite">
        FAIL-CLOSED
      </Tag>
      <Tag x={726} y={440} tone="graphite">
        NO KEYS → 503
      </Tag>
    </DiagramFrame>
  );
}
