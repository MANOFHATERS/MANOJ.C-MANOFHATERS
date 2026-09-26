'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import {
  AdaptiveDpr,
  ContactShadows,
  Line,
  PerformanceMonitor,
} from '@react-three/drei';
import * as THREE from 'three';

import {
  NODE_COUNT,
  NODE_TYPE_LABEL,
  STATE_POSITIONS,
  TAIL_BINS,
  TAIL_BIN_WIDTH,
  edges,
  gaussianGhost,
  heroPath,
  indiaOutline,
  nodeFinish,
  nodeScale,
  nodeTypes,
  tailFlag,
  type SpecimenStateName,
} from '@/lib/specimen-geometry';

/* ── Pigment, as three.js sees it ──────────────────────────────────────── */

const INK = new THREE.Color('#16140f');
const PORCELAIN = new THREE.Color('#fbf8f2');
const PIGMENT = new THREE.Color('#b23a1e');
const GRAPHITE = new THREE.Color('#4a463e');
const RULE = new THREE.Color('#d9d2c3');

export type Tier = 'high' | 'standard';

interface SceneProps {
  state: SpecimenStateName;
  tier: Tier;
  onHover: (index: number | null) => void;
}

/* Which instanced mesh each node belongs to, resolved once. */
const porcelainIndices: number[] = [];
const graphiteIndices: number[] = [];
for (let i = 0; i < NODE_COUNT; i++) {
  (nodeFinish[i] === 1 ? graphiteIndices : porcelainIndices).push(i);
}
const heroSet = new Set(heroPath);

/**
 * The radius each state needs on screen. The camera distance is derived from
 * this and the canvas aspect rather than hard-coded, because the specimen
 * lives in a tall rail on desktop and a square on a phone — a fixed distance
 * that frames it on one crops it on the other.
 */
const STATE_RADIUS: Record<SpecimenStateName, number> = {
  graph: 1.32,
  tail: 1.68,
  field: 1.42,
};

const FOV = 30;

function distanceFor(radius: number, aspect: number): number {
  const half = Math.tan((FOV * Math.PI) / 180 / 2);
  // The narrower of the two axes is the one that clips. The clamp matters:
  // a canvas is briefly 0 x 0 between mount and layout, and an unguarded
  // aspect of 0 puts the camera at infinity, from which the damping never
  // returns — the specimen renders as a speck and stays one.
  const safeAspect = Number.isFinite(aspect) && aspect > 0 ? aspect : 1;
  const limiting = half * Math.min(1, Math.max(0.35, safeAspect));
  return (radius * 1.12) / limiting;
}

function Nodes({
  indices,
  positions,
  state,
  tier,
  onHover,
}: {
  indices: number[];
  positions: Float32Array;
  state: SpecimenStateName;
  tier: Tier;
  onHover: (i: number | null) => void;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colour = useMemo(() => new THREE.Color(), []);
  const isGraphite = indices.length > 0 && nodeFinish[indices[0]] === 1;

  useFrame(() => {
    const mesh = ref.current;
    if (!mesh) return;

    for (let n = 0; n < indices.length; n++) {
      const i = indices[n];
      dummy.position.set(
        positions[i * 3],
        positions[i * 3 + 1],
        positions[i * 3 + 2],
      );
      const hero = heroSet.has(i);
      const s = nodeScale[i] * (hero && state === 'graph' ? 1.55 : 1);
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      mesh.setMatrixAt(n, dummy.matrix);

      // Pigment marks meaning, never decoration: the highlighted path in the
      // graph, the left tail in the distribution, the first provider layer.
      let target: THREE.Color;
      if (state === 'graph' && hero) target = PIGMENT;
      else if (state === 'tail' && tailFlag[i] === 1) target = PIGMENT;
      else target = isGraphite ? INK : PORCELAIN;

      colour.copy(target);
      mesh.setColorAt(n, colour);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  const handleOver = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      if (e.instanceId != null) onHover(indices[e.instanceId]);
    },
    [indices, onHover],
  );

  return (
    <instancedMesh
      ref={ref}
      args={[undefined, undefined, indices.length]}
      onPointerOver={handleOver}
      onPointerOut={() => onHover(null)}
      castShadow={false}
      receiveShadow={false}
      frustumCulled={false}
    >
      <sphereGeometry args={[1, tier === 'high' ? 16 : 10, tier === 'high' ? 12 : 8]} />
      <meshStandardMaterial
        roughness={isGraphite ? 0.28 : 0.82}
        metalness={isGraphite ? 0.05 : 0.0}
        vertexColors={false}
      />
    </instancedMesh>
  );
}

function EdgeLines({
  positions,
  state,
}: {
  positions: Float32Array;
  state: SpecimenStateName;
}) {
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(edges.length * 6), 3),
    );
    return g;
  }, []);

  useFrame(() => {
    const attr = geometry.getAttribute('position') as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    for (let e = 0; e < edges.length; e++) {
      const { a, b } = edges[e];
      arr[e * 6] = positions[a * 3];
      arr[e * 6 + 1] = positions[a * 3 + 1];
      arr[e * 6 + 2] = positions[a * 3 + 2];
      arr[e * 6 + 3] = positions[b * 3];
      arr[e * 6 + 4] = positions[b * 3 + 1];
      arr[e * 6 + 5] = positions[b * 3 + 2];
    }
    attr.needsUpdate = true;
    geometry.computeBoundingSphere();
  });

  // In the histogram and the map the edges would be noise, so they fade out
  // rather than following the nodes into a shape they do not describe.
  const opacity = state === 'graph' ? 0.35 : 0.06;

  return (
    <lineSegments geometry={geometry} frustumCulled={false}>
      <lineBasicMaterial
        color={INK}
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </lineSegments>
  );
}

/**
 * The repurposing path, drawn with real thickness so it reads as a path
 * rather than as one more hairline. The geometry is rewritten in place each
 * frame — no React state, no re-render, one draw call.
 */
function HeroPath({
  positions,
  visible,
}: {
  positions: Float32Array;
  visible: boolean;
}) {
  const ref = useRef<{ geometry: { setPositions: (a: number[]) => void } } | null>(
    null,
  );
  const initial = useMemo(
    () =>
      heroPath.map(
        (i) =>
          [positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]] as [
            number,
            number,
            number,
          ],
      ),
    // Only the starting shape; every frame after this is written directly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const flat = useMemo(() => new Array<number>(heroPath.length * 3).fill(0), []);

  useFrame(() => {
    const line = ref.current;
    if (!line) return;
    for (let n = 0; n < heroPath.length; n++) {
      const i = heroPath[n];
      flat[n * 3] = positions[i * 3];
      flat[n * 3 + 1] = positions[i * 3 + 1];
      flat[n * 3 + 2] = positions[i * 3 + 2];
    }
    line.geometry.setPositions(flat);
  });

  return (
    <Line
      ref={ref as never}
      points={initial}
      color={PIGMENT}
      lineWidth={1.8}
      transparent
      opacity={visible ? 0.95 : 0}
      visible={visible}
    />
  );
}

/** The Gaussian the market is usually assumed to follow. Drawn as a ghost. */
function GaussianGhost({ visible }: { visible: boolean }) {
  const points = useMemo(() => {
    const layer = 0.085;
    return gaussianGhost.map((count, b) => {
      const x = (b - (TAIL_BINS - 1) / 2) * TAIL_BIN_WIDTH;
      const y = -1.15 + count * layer + 0.04;
      return [x, y, 0] as [number, number, number];
    });
  }, []);

  if (!visible) return null;
  return (
    <Line points={points} color={GRAPHITE} lineWidth={1} dashed dashSize={0.04} gapSize={0.04} transparent opacity={0.5} />
  );
}

/** The coastline. A hairline, closed, in rule grey. */
function IndiaOutline({ visible }: { visible: boolean }) {
  const points = useMemo(() => {
    const pts: Array<[number, number, number]> = [];
    for (let i = 0; i < indiaOutline.length; i += 3) {
      pts.push([indiaOutline[i], indiaOutline[i + 1], indiaOutline[i + 2] - 0.35]);
    }
    pts.push(pts[0]);
    return pts;
  }, []);

  if (!visible) return null;
  return <Line points={points} color={RULE} lineWidth={1} transparent opacity={0.85} />;
}

function Specimen({ state, tier, onHover }: SceneProps) {
  const group = useRef<THREE.Group>(null);
  const { camera, size } = useThree();

  // Live positions, damped toward the target state. 240 lerps a frame is
  // nothing; doing it on the CPU keeps the whole thing debuggable.
  const live = useMemo(() => Float32Array.from(STATE_POSITIONS.graph), []);
  const spin = useRef(0);
  const tilt = useRef({ x: 0, y: 0, vx: 0, vy: 0 });
  const pointer = useRef({ x: 0, y: 0 });

  useFrame((s, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const target = STATE_POSITIONS[state];

    // Critically damped approach. No overshoot, no bounce.
    const k = 1 - Math.exp(-delta * 3.4);
    for (let i = 0; i < live.length; i++) {
      live[i] += (target[i] - live[i]) * k;
    }

    // Idle: settling, not spinning. The graph turns slowly; the histogram
    // and the map hold still, because a rotating histogram is nonsense.
    if (group.current) {
      if (state === 'graph') {
        spin.current += delta * 0.02;
      } else {
        spin.current += (0 - spin.current) * (1 - Math.exp(-delta * 2.2));
      }

      // Pointer tilt, +/- 6 degrees, critically damped spring.
      const MAX = (6 * Math.PI) / 180;
      const tx = pointer.current.y * MAX;
      const ty = pointer.current.x * MAX;
      const omega = 9;
      const step = (v: number, target: number, vel: number) => {
        const a = omega * omega * (target - v) - 2 * omega * vel;
        return a;
      };
      const ax = step(tilt.current.x, tx, tilt.current.vx);
      const ay = step(tilt.current.y, ty, tilt.current.vy);
      tilt.current.vx += ax * delta;
      tilt.current.vy += ay * delta;
      tilt.current.x += tilt.current.vx * delta;
      tilt.current.y += tilt.current.vy * delta;

      group.current.rotation.set(tilt.current.x, spin.current + tilt.current.y, 0);
    }

    // Camera distance is solved for the current state and canvas shape, then
    // damped, so a resize reframes the object instead of cropping it.
    const aspect =
      size.width > 0 && size.height > 0 ? size.width / size.height : 1;
    const z = distanceFor(STATE_RADIUS[state], aspect);

    if (!Number.isFinite(camera.position.z)) camera.position.z = z;
    camera.position.z += (z - camera.position.z) * (1 - Math.exp(-delta * 2.6));
    camera.updateProjectionMatrix();
  });

  return (
    <group
      ref={group}
      onPointerMove={(e) => {
        pointer.current.x = (e.pointer?.x ?? 0) * -1;
        pointer.current.y = (e.pointer?.y ?? 0) * -1;
      }}
      onPointerLeave={() => {
        pointer.current.x = 0;
        pointer.current.y = 0;
      }}
    >
      <Nodes
        indices={porcelainIndices}
        positions={live}
        state={state}
        tier={tier}
        onHover={onHover}
      />
      <Nodes
        indices={graphiteIndices}
        positions={live}
        state={state}
        tier={tier}
        onHover={onHover}
      />
      <EdgeLines positions={live} state={state} />
      <HeroPath positions={live} visible={state === 'graph'} />
      <GaussianGhost visible={state === 'tail'} />
      <IndiaOutline visible={state === 'field'} />
    </group>
  );
}

export interface SpecimenCanvasProps {
  state: SpecimenStateName;
  /** Paused when false: no frames at all, so an off-screen canvas costs zero. */
  active: boolean;
  onHoverLabel?: (label: string | null) => void;
  className?: string;
}

export default function SpecimenCanvas({
  state,
  active,
  onHoverLabel,
  className = '',
}: SpecimenCanvasProps) {
  const [tier, setTier] = useState<Tier>('high');

  const handleHover = useCallback(
    (index: number | null) => {
      if (!onHoverLabel) return;
      onHoverLabel(index == null ? null : NODE_TYPE_LABEL[nodeTypes[index]]);
    },
    [onHoverLabel],
  );

  return (
    <Canvas
      className={className}
      frameloop={active ? 'always' : 'never'}
      dpr={tier === 'high' ? [1, 2] : [1, 1.5]}
      camera={{ position: [0, 0, 5.15], fov: 30, near: 0.1, far: 40 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        stencil: false,
        depth: true,
      }}
      // The canvas is described in words by its figure caption; screen
      // readers get the meaning, not an empty graphics node.
      aria-hidden="true"
      style={{ pointerEvents: active ? 'auto' : 'none' }}
    >
      <PerformanceMonitor
        onDecline={() => setTier('standard')}
        onIncline={() => setTier('high')}
        flipflops={3}
      />
      <AdaptiveDpr pixelated={false} />

      {/* A studio rig built from lights rather than an environment map.
          drei's <Environment> would give the graphite nodes a richer specular,
          but it pulls a PMREM generator and a cube-render pipeline into the
          chunk for a difference nobody would name. Four lights cost nothing:
          a soft key from the upper left as if from a window, a cool fill from
          the right, a warm bounce off the paper, and ambient to keep the
          porcelain from going muddy in the shadows. */}
      <ambientLight intensity={1.15} color="#fdfaf4" />
      <directionalLight position={[-3.2, 4.2, 3.4]} intensity={2.4} color="#fff8ec" />
      <directionalLight position={[3.4, 0.6, 2.2]} intensity={0.75} color="#eef2f6" />
      <directionalLight position={[0, -3.2, 1.5]} intensity={0.5} color="#efe6d2" />
      <hemisphereLight args={['#ffffff', '#ded5c2', 0.65]} />

      <Specimen state={state} tier={tier} onHover={handleHover} />

      {tier === 'high' ? (
        <ContactShadows
          position={[0, -1.85, 0]}
          opacity={0.2}
          scale={8}
          blur={2.8}
          far={3}
          resolution={256}
          color="#16140f"
        />
      ) : null}
    </Canvas>
  );
}
