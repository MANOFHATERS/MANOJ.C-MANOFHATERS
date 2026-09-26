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
} from './specimen-geometry';

/**
 * The specimen as a plain SVG string with literal colours.
 *
 * The React still in components/specimen/SpecimenStill.tsx uses CSS custom
 * properties, which do not resolve inside a data URI. Open Graph images are
 * rendered outside the document, so they need this version instead.
 */

const VIEW = 520;
const CAMERA_Z: Record<SpecimenStateName, number> = {
  graph: 5.6,
  tail: 6.2,
  field: 5.8,
};

const INK = '#16140F';
// A shade deeper than the live porcelain: without three.js shading a node at
// #FBF8F2 on #F6F2EA paper reads as a hole rather than as an object.
const PORCELAIN = '#EDE6D8';
const PIGMENT = '#B23A1E';
const RULE = '#C4BBA6';

function project(x: number, y: number, z: number, camZ: number) {
  const f = 1 / Math.tan((30 * Math.PI) / 180 / 2);
  const s = f / Math.max(0.3, camZ - z);
  return { x: VIEW / 2 + x * s * (VIEW / 2), y: VIEW / 2 - y * s * (VIEW / 2), s };
}

export function specimenStillSvg(state: SpecimenStateName): string {
  const pos = STATE_POSITIONS[state];
  const camZ = CAMERA_Z[state];
  const heroSet = new Set(heroPath);
  const parts: string[] = [];

  if (state === 'field') {
    const pts: string[] = [];
    for (let i = 0; i < indiaOutline.length / 3; i++) {
      const p = project(
        indiaOutline[i * 3],
        indiaOutline[i * 3 + 1],
        indiaOutline[i * 3 + 2] - 0.35,
        camZ,
      );
      pts.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`);
    }
    parts.push(
      `<polygon points="${pts.join(' ')}" fill="none" stroke="${RULE}" stroke-width="1"/>`,
    );
  }

  if (state === 'graph') {
    const lines = edges
      .map((e) => {
        const a = project(pos[e.a * 3], pos[e.a * 3 + 1], pos[e.a * 3 + 2], camZ);
        const b = project(pos[e.b * 3], pos[e.b * 3 + 1], pos[e.b * 3 + 2], camZ);
        return `M${a.x.toFixed(1)} ${a.y.toFixed(1)}L${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
      })
      .join('');
    parts.push(
      `<path d="${lines}" stroke="${INK}" stroke-width="0.6" stroke-opacity="0.3" fill="none"/>`,
    );
    const hp = heroPath
      .map((i) => {
        const p = project(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2], camZ);
        return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      })
      .join(' ');
    parts.push(
      `<polyline points="${hp}" fill="none" stroke="${PIGMENT}" stroke-width="1.8"/>`,
    );
  }

  const order = Array.from({ length: NODE_COUNT }, (_, i) => i).sort(
    (a, b) => pos[a * 3 + 2] - pos[b * 3 + 2],
  );

  for (const i of order) {
    const p = project(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2], camZ);
    const isPigment =
      (state === 'graph' && heroSet.has(i)) || (state === 'tail' && tailFlag[i] === 1);
    const r = Math.max(
      0.9,
      nodeScale[i] * p.s * (VIEW / 2) * (heroSet.has(i) && state === 'graph' ? 1.55 : 1),
    );
    const fill = isPigment ? PIGMENT : nodeFinish[i] === 1 ? INK : PORCELAIN;
    const stroke =
      isPigment || nodeFinish[i] === 1 ? '' : ` stroke="${RULE}" stroke-width="0.6"`;
    parts.push(
      `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${r.toFixed(2)}" fill="${fill}"${stroke}/>`,
    );
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW} ${VIEW}" width="${VIEW}" height="${VIEW}">${parts.join('')}</svg>`;
}

/** Ready to drop into an <img src>. */
export function specimenDataUri(state: SpecimenStateName): string {
  return `data:image/svg+xml;base64,${Buffer.from(specimenStillSvg(state)).toString('base64')}`;
}
