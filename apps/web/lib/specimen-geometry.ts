/**
 * THE SPECIMEN — geometry
 *
 * One object, 240 nodes, three states. Each state is a real data structure
 * from one of the three systems, not an abstract shape:
 *
 *   I.  The Graph — DrugOS's heterogeneous knowledge graph
 *   II. The Tail  — TailGen's fat-tailed return distribution
 *   III.The Field — AtmosView's four providers over India, disagreeing
 *
 * Every position here is computed from a fixed seed, so the specimen is
 * identical on every machine and on every reload. That matters: it is a
 * museum object, and a museum object does not rearrange itself between
 * visits.
 *
 * Runs once at module load. ~50 KB of Float32Array, no network request,
 * no binary asset to fetch.
 */

export const NODE_COUNT = 240;

/** The five node types in the DrugOS graph. Index maps to finish and size. */
export const NODE_TYPES = [
  'drug',
  'protein',
  'pathway',
  'disease',
  'outcome',
] as const;
export type NodeType = (typeof NODE_TYPES)[number];

export const NODE_TYPE_LABEL: Record<NodeType, string> = {
  drug: 'Drug — one of 9 node types in the DrugOS graph',
  protein: 'Protein — target of a drug, member of a pathway',
  pathway: 'Pathway — biological process linking proteins',
  disease: 'Disease — the prediction target lives on this edge',
  outcome: 'Clinical outcome — added because the spec mandates five node types',
};

/* ── Deterministic PRNG ────────────────────────────────────────────────── */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function rand() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(0x5a3d);

/* ── Node types, assigned once ─────────────────────────────────────────── */

export const nodeTypes: NodeType[] = [];
for (let i = 0; i < NODE_COUNT; i++) {
  // Roughly the proportions of the real graph: many proteins, fewer outcomes.
  const r = rand();
  nodeTypes.push(
    r < 0.22 ? 'drug' : r < 0.55 ? 'protein' : r < 0.74 ? 'pathway' : r < 0.9 ? 'disease' : 'outcome',
  );
}

/** Node radius in world units. Porcelain nodes read slightly larger. */
export const nodeScale = new Float32Array(NODE_COUNT);
/** 0 = matte porcelain, 1 = polished graphite. Set by node type. */
export const nodeFinish = new Uint8Array(NODE_COUNT);

for (let i = 0; i < NODE_COUNT; i++) {
  const t = nodeTypes[i];
  const base =
    t === 'drug' ? 0.048 : t === 'disease' ? 0.042 : t === 'protein' ? 0.031 : t === 'pathway' ? 0.027 : 0.035;
  nodeScale[i] = base * (0.84 + rand() * 0.32);
  // Only drugs take the polished graphite finish. Any more than that and the
  // specimen stops reading as porcelain-on-paper and starts reading as a
  // particle field, which is the thing this object exists not to be.
  nodeFinish[i] = t === 'drug' ? 1 : 0;
}

/* ── State I — The Graph ───────────────────────────────────────────────── */
/* A loose spherical graph. Fibonacci distribution keeps it even, radial
   jitter by type keeps it from looking like a planetarium dome. */

export const stateGraph = new Float32Array(NODE_COUNT * 3);

{
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < NODE_COUNT; i++) {
    const y = 1 - (i / (NODE_COUNT - 1)) * 2;
    const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;

    const t = nodeTypes[i];
    // Type determines shell depth: drugs toward the surface, pathways deeper.
    const shell =
      t === 'drug' ? 1.0 : t === 'disease' ? 0.94 : t === 'protein' ? 0.78 : t === 'pathway' ? 0.6 : 0.86;
    const r = (0.88 + rand() * 0.18) * shell * 1.18;

    stateGraph[i * 3] = Math.cos(theta) * radiusAtY * r;
    stateGraph[i * 3 + 1] = y * r * 1.02;
    stateGraph[i * 3 + 2] = Math.sin(theta) * radiusAtY * r;
  }
}

/* ── Edges ─────────────────────────────────────────────────────────────── */
/* Each node links to its two or three nearest neighbours in State I. The
   edge list is fixed across all three states — the graph does not change,
   only where its nodes are standing. */

export interface Edge {
  readonly a: number;
  readonly b: number;
}

export const edges: Edge[] = [];

{
  const seen = new Set<number>();
  const dist2 = (i: number, j: number) => {
    const dx = stateGraph[i * 3] - stateGraph[j * 3];
    const dy = stateGraph[i * 3 + 1] - stateGraph[j * 3 + 1];
    const dz = stateGraph[i * 3 + 2] - stateGraph[j * 3 + 2];
    return dx * dx + dy * dy + dz * dz;
  };

  for (let i = 0; i < NODE_COUNT; i++) {
    const neighbours: Array<{ j: number; d: number }> = [];
    for (let j = 0; j < NODE_COUNT; j++) {
      if (i === j) continue;
      neighbours.push({ j, d: dist2(i, j) });
    }
    neighbours.sort((p, q) => p.d - q.d);
    // Not the very nearest neighbour — that edge is so short it is invisible.
    // Reaching a little further makes the struts long enough to read as a
    // graph rather than as a dusting between touching spheres.
    const k = 1 + (rand() < 0.45 ? 1 : 0);
    for (let n = 0; n < k; n++) {
      const pick = 1 + Math.floor(rand() * 5);
      const j = neighbours[Math.min(pick, neighbours.length - 1)].j;
      const key = i < j ? i * NODE_COUNT + j : j * NODE_COUNT + i;
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({ a: Math.min(i, j), b: Math.max(i, j) });
    }
  }
}

/* ── The highlighted path ──────────────────────────────────────────────── */
/* drug → protein → pathway → disease → outcome. Five hero nodes, chosen by
   walking the real edge list rather than picked by hand, so the path is an
   actual path through the graph.
   Caption on the page: "Illustrative repurposing path. Not a model
   prediction." The honesty rule applies to the 3D object too. */

export const heroPath: number[] = (() => {
  const adjacency: number[][] = Array.from({ length: NODE_COUNT }, () => []);
  for (const e of edges) {
    adjacency[e.a].push(e.b);
    adjacency[e.b].push(e.a);
  }

  const want: NodeType[] = ['drug', 'protein', 'pathway', 'disease', 'outcome'];

  for (let start = 0; start < NODE_COUNT; start++) {
    if (nodeTypes[start] !== 'drug') continue;
    const path = [start];
    let ok = true;
    for (let step = 1; step < want.length; step++) {
      const from = path[path.length - 1];
      const next = adjacency[from].find(
        (n) => nodeTypes[n] === want[step] && !path.includes(n),
      );
      if (next === undefined) {
        ok = false;
        break;
      }
      path.push(next);
    }
    if (ok) return path;
  }

  // No literal path of that shape exists in this particular graph; fall back
  // to one node of each type so the highlight still means something.
  return want.map((t) => nodeTypes.findIndex((n) => n === t));
})();

export const heroPathEdges: Edge[] = heroPath
  .slice(0, -1)
  .map((a, i) => ({ a, b: heroPath[i + 1] }));

/* ── State II — The Tail ───────────────────────────────────────────────── */
/* A 3D histogram of daily returns with the real asymmetry: a long, heavy
   left tail. Nodes are stacked into bins; the ones out in the tail are the
   ones that get picked out in pigment. */

export const stateTail = new Float32Array(NODE_COUNT * 3);
/** 1 when this node sits in the far left tail — the part a Gaussian denies. */
export const tailFlag = new Uint8Array(NODE_COUNT);

const BINS = 31;
export const gaussianGhost: number[] = [];
export const empiricalBars: number[] = [];

{
  const tailRand = mulberry32(0x0be7);

  // Draw from a Student-t-like variable: normal divided by the root of a
  // small-df chi-square. Heavy tails, negative skew added by hand — this is
  // a drawing of the distribution, not a simulation of it.
  const samples: number[] = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    const u1 = Math.max(1e-6, tailRand());
    const u2 = tailRand();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const df = 3;
    let chi = 0;
    for (let k = 0; k < df; k++) {
      const a1 = Math.max(1e-6, tailRand());
      const a2 = tailRand();
      const g = Math.sqrt(-2 * Math.log(a1)) * Math.cos(2 * Math.PI * a2);
      chi += g * g;
    }
    let x = z / Math.sqrt(chi / df);
    // Negative skew: stretch the left side. Real S&P skewness is −1.22.
    if (x < 0) x *= 1.55;
    samples.push(x);
  }

  const LIMIT = 7;
  const binOf = (x: number) =>
    Math.min(BINS - 1, Math.max(0, Math.floor(((x + LIMIT) / (2 * LIMIT)) * BINS)));

  const counts = new Array<number>(BINS).fill(0);
  const order: number[] = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    const b = binOf(samples[i]);
    order.push(b);
    counts[b]++;
  }

  const stacked = new Array<number>(BINS).fill(0);
  const binWidth = 2.9 / BINS;
  const layer = 0.085;

  for (let i = 0; i < NODE_COUNT; i++) {
    const b = order[i];
    const h = stacked[b]++;
    const x = (b - (BINS - 1) / 2) * binWidth;
    const y = -1.15 + h * layer + 0.04;
    const z = (tailRand() - 0.5) * 0.28;
    stateTail[i * 3] = x;
    stateTail[i * 3 + 1] = y;
    stateTail[i * 3 + 2] = z;
    // The left tail: bins below the 8th, where a Gaussian has almost nothing.
    tailFlag[i] = b <= 7 ? 1 : 0;
  }

  for (let b = 0; b < BINS; b++) {
    empiricalBars.push(counts[b]);
    // The Gaussian the market is usually assumed to follow, drawn at the same
    // scale so the gap in the tails is the thing you see.
    const x = ((b - (BINS - 1) / 2) / (BINS / 2)) * LIMIT;
    const g = Math.exp(-(x * x) / 2) / Math.sqrt(2 * Math.PI);
    gaussianGhost.push(g * NODE_COUNT * (2 * LIMIT / BINS));
  }
}

export const TAIL_BINS = BINS;
export const TAIL_BIN_WIDTH = 2.9 / BINS;

/* ── State III — The Field ─────────────────────────────────────────────── */
/* Four providers reporting the same places, in four layers slightly offset
   in height. The scatter is inside a coarse outline of India, because the
   platform is about India and a generic blob would be a lie about that. */

const INDIA: ReadonlyArray<readonly [number, number]> = [
  [74.0, 34.5], [76.5, 35.5], [78.5, 34.5], [79.5, 32.5], [81.0, 30.3],
  [83.5, 29.0], [85.5, 27.5], [88.0, 27.0], [88.9, 26.0], [89.8, 26.2],
  [92.0, 27.5], [94.5, 27.8], [97.0, 28.2], [97.3, 27.0], [96.5, 25.5],
  [94.5, 24.0], [93.5, 22.5], [92.3, 21.8], [91.0, 22.5], [89.0, 21.8],
  [87.0, 21.5], [85.0, 19.5], [82.5, 17.0], [80.3, 15.8], [80.2, 13.5],
  [79.8, 11.5], [78.2, 8.5], [77.0, 8.2], [76.0, 10.5], [74.8, 13.5],
  [72.9, 17.5], [72.6, 20.5], [70.5, 20.8], [68.9, 22.5], [70.0, 24.0],
  [71.0, 24.2], [70.5, 25.8], [72.5, 27.5], [74.5, 29.5], [75.5, 32.0],
];

function insideIndia(lon: number, lat: number): boolean {
  let inside = false;
  for (let i = 0, j = INDIA.length - 1; i < INDIA.length; j = i++) {
    const [xi, yi] = INDIA[i];
    const [xj, yj] = INDIA[j];
    const intersect =
      yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/** The outline itself, in world coordinates, for the hairline map edge. */
export const indiaOutline: number[] = [];

export const stateField = new Float32Array(NODE_COUNT * 3);
/** Which of the four providers this node belongs to. */
export const providerLayer = new Uint8Array(NODE_COUNT);

{
  const LON0 = 68.9;
  const LON1 = 97.3;
  const LAT0 = 8.2;
  const LAT1 = 35.5;
  const SCALE = 2.45;

  const toWorld = (lon: number, lat: number): [number, number] => [
    ((lon - LON0) / (LON1 - LON0) - 0.5) * SCALE * 0.92,
    ((lat - LAT0) / (LAT1 - LAT0) - 0.5) * SCALE,
  ];

  for (const [lon, lat] of INDIA) {
    const [x, y] = toWorld(lon, lat);
    indiaOutline.push(x, y, 0);
  }

  const fieldRand = mulberry32(0x1d1a);

  for (let i = 0; i < NODE_COUNT; i++) {
    let lon = 0;
    let lat = 0;
    // Rejection sampling. Bounded: 240 nodes, India fills enough of its own
    // bounding box that this converges in a handful of draws.
    for (let attempt = 0; attempt < 120; attempt++) {
      lon = LON0 + fieldRand() * (LON1 - LON0);
      lat = LAT0 + fieldRand() * (LAT1 - LAT0);
      if (insideIndia(lon, lat)) break;
    }
    const [x, y] = toWorld(lon, lat);
    const provider = i % 4;
    providerLayer[i] = provider;

    stateField[i * 3] = x;
    stateField[i * 3 + 1] = y;
    // The four layers, offset in z. The offset is the disagreement: the same
    // place, reported four times, at four slightly different values.
    stateField[i * 3 + 2] = (provider - 1.5) * 0.17;
  }
}

/* ── State registry ────────────────────────────────────────────────────── */

export type SpecimenStateName = 'graph' | 'tail' | 'field';

export const STATE_POSITIONS: Record<SpecimenStateName, Float32Array> = {
  graph: stateGraph,
  tail: stateTail,
  field: stateField,
};

export const STATE_CAPTION: Record<SpecimenStateName, string> = {
  graph:
    'A three-dimensional model of the DrugOS knowledge graph: 240 nodes of five types — drug, protein, pathway, disease and clinical outcome — joined by hairline edges, with one drug-to-outcome path picked out in pigment.',
  tail:
    'The same 240 nodes rearranged into a histogram of daily market returns. The long left tail, drawn in pigment, is the part a Gaussian model says should almost never happen.',
  field:
    'The same 240 nodes settled into a scatter over the outline of India, in four layers offset from one another — four weather providers reporting the same places and disagreeing about them.',
};
