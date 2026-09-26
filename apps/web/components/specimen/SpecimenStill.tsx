import {
  NODE_COUNT,
  STATE_POSITIONS,
  edges,
  heroPath,
  indiaOutline,
  nodeFinish,
  nodeScale,
  tailFlag,
  type SpecimenStateName,
} from '@/lib/specimen-geometry';

/**
 * The static tier.
 *
 * Shown when there is no WebGL, when Save-Data is on, when the visitor has
 * asked for reduced motion, or when the frame rate cannot hold. The PRD
 * specifies pre-rendered AVIF stills; this draws vector stills from the same
 * position data instead, which is sharper at every size, about 20 KB, needs
 * no build step and no image request, and cannot drift out of sync with the
 * 3D object because it is generated from it.
 */

const VIEW = 520;
const CAMERA_Z: Record<SpecimenStateName, number> = {
  graph: 5.15,
  tail: 5.7,
  field: 5.35,
};

function project(
  x: number,
  y: number,
  z: number,
  camZ: number,
): { x: number; y: number; s: number } {
  // Perspective at fov 30, matching the live camera.
  const f = 1 / Math.tan((30 * Math.PI) / 180 / 2);
  const d = camZ - z;
  const s = f / Math.max(0.3, d);
  return { x: VIEW / 2 + x * s * (VIEW / 2), y: VIEW / 2 - y * s * (VIEW / 2), s };
}

export function SpecimenStill({
  state,
  className = '',
  waiting = false,
}: {
  state: SpecimenStateName;
  className?: string;
  /** The waiting state draws its edges over 800ms — the honest loader
   * (Motion PRD 8.5): the waiting state previews the thing waited for. */
  waiting?: boolean;
}) {
  const pos = STATE_POSITIONS[state];
  const camZ = CAMERA_Z[state];
  const heroSet = new Set(heroPath);

  // Painter's algorithm: far nodes first, so the front of the specimen
  // occludes the back the way it does in the live scene.
  const order = Array.from({ length: NODE_COUNT }, (_, i) => i).sort(
    (a, b) => pos[a * 3 + 2] - pos[b * 3 + 2],
  );

  return (
    <svg
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      className={`${className}${waiting ? ' specimen-loader' : ''}`}
      role="img"
      aria-hidden="true"
      width="100%"
      height="100%"
    >
      {state === 'field' ? (
        <polygon
          points={Array.from({ length: indiaOutline.length / 3 }, (_, i) => {
            const p = project(
              indiaOutline[i * 3],
              indiaOutline[i * 3 + 1],
              indiaOutline[i * 3 + 2] - 0.35,
              camZ,
            );
            return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
          }).join(' ')}
          fill="none"
          stroke="var(--color-rule)"
          strokeWidth="1"
        />
      ) : null}

      {state === 'graph' ? (
        <g stroke="var(--color-ink)" strokeWidth="0.6" opacity="0.3">
          {edges.map((e, i) => {
            const a = project(pos[e.a * 3], pos[e.a * 3 + 1], pos[e.a * 3 + 2], camZ);
            const b = project(pos[e.b * 3], pos[e.b * 3 + 1], pos[e.b * 3 + 2], camZ);
            return (
              <line
                key={i}
                pathLength={1}
                x1={a.x.toFixed(1)}
                y1={a.y.toFixed(1)}
                x2={b.x.toFixed(1)}
                y2={b.y.toFixed(1)}
              />
            );
          })}
        </g>
      ) : null}

      {state === 'graph' ? (
        <polyline
          pathLength={1}
          points={heroPath
            .map((i) => {
              const p = project(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2], camZ);
              return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
            })
            .join(' ')}
          fill="none"
          stroke="var(--color-pigment)"
          strokeWidth="1.6"
        />
      ) : null}

      {order.map((i) => {
        const p = project(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2], camZ);
        const r = nodeScale[i] * p.s * (VIEW / 2) * (heroSet.has(i) && state === 'graph' ? 1.55 : 1);
        const isPigment =
          (state === 'graph' && heroSet.has(i)) || (state === 'tail' && tailFlag[i] === 1);
        const fill = isPigment
          ? 'var(--color-pigment)'
          : nodeFinish[i] === 1
            ? 'var(--color-ink)'
            // Deeper than the live porcelain, for the same reason as in
            // lib/specimen-still-svg.ts: flat paper on paper reads as a hole.
            : '#EAE7DC';
        return (
          <circle
            key={i}
            cx={p.x.toFixed(1)}
            cy={p.y.toFixed(1)}
            r={Math.max(0.8, r).toFixed(2)}
            fill={fill}
            stroke={nodeFinish[i] === 1 || isPigment ? 'none' : 'var(--color-rule-strong)'}
            strokeWidth="0.6"
          />
        );
      })}
    </svg>
  );
}
