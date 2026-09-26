'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

const INK = new THREE.Color('#1A1917');
const PORCELAIN = new THREE.Color('#F0EEE6');
/* International Klein Blue — pigment marks meaning, never decoration. */
const PIGMENT = new THREE.Color('#002FA7');
const GRAPHITE = new THREE.Color('#403E39');
const RULE = new THREE.Color('#D6D3C8');

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
  hovered,
}: {
  indices: number[];
  positions: Float32Array;
  state: SpecimenStateName;
  tier: Tier;
  onHover: (i: number | null) => void;
  /** The globally hovered node — shared ref, damped per instance below. */
  hovered: React.RefObject<number | null>;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colour = useMemo(() => new THREE.Color(), []);
  const isGraphite = indices.length > 0 && nodeFinish[indices[0]] === 1;

  // Per-instance scale channel, damped toward the target on the tap
  // spring's character — Table 8.1: hovered nodes scale to 1.4, the
  // same physical response the buttons give, at specimen amplitude.
  const liveScale = useMemo(
    () => Float32Array.from(indices, (i) => nodeScale[i]),
    [indices],
  );

  useFrame((_, rawDelta) => {
    const mesh = ref.current;
    if (!mesh) return;
    const delta = Math.min(rawDelta, 0.05);
    const k = 1 - Math.exp(-delta * 14); // --spring-tap character

    for (let n = 0; n < indices.length; n++) {
      const i = indices[n];
      dummy.position.set(
        positions[i * 3],
        positions[i * 3 + 1],
        positions[i * 3 + 2],
      );
      const hero = heroSet.has(i);
      const base = nodeScale[i] * (hero && state === 'graph' ? 1.55 : 1);
      const target = hovered.current === i ? base * 1.4 : base;
      liveScale[n] += (target - liveScale[n]) * k;
      dummy.scale.setScalar(liveScale[n]);
      dummy.updateMatrix();
      mesh.setMatrixAt(n, dummy.matrix);

      // Pigment marks meaning, never decoration: the highlighted path in the
      // graph, the left tail in the distribution, the first provider layer.
      let targetColour: THREE.Color;
      if (state === 'graph' && hero) targetColour = PIGMENT;
      else if (state === 'tail' && tailFlag[i] === 1) targetColour = PIGMENT;
      else targetColour = isGraphite ? INK : PORCELAIN;

      colour.copy(targetColour);
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
  // In the graph they sit well behind the text in weight — hairlines, not
  // cobwebs competing with the column of prose beside them.
  const opacity = state === 'graph' ? 0.22 : 0.05;

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

  // The hovered node, shared with the instanced meshes so both porcelain
  // and graphite nodes can respond — labels AND scale (Table 8.1).
  const hovered = useRef<number | null>(null);
  const handleHoverNode = useCallback(
    (i: number | null) => {
      hovered.current = i;
      onHover(i);
    },
    [onHover],
  );

  // Live positions, damped toward the target state. 240 lerps a frame is
  // nothing; doing it on the CPU keeps the whole thing debuggable.
  const live = useMemo(() => Float32Array.from(STATE_POSITIONS.graph), []);
  const spin = useRef(0);
  const tilt = useRef({ x: 0, y: 0, vx: 0, vy: 0 });
  const pointer = useRef({ x: 0, y: 0 });

  /* ── The choreography channel (Motion PRD 10.3) ──────────────────────
     Anticipation: as the reading position approaches a state boundary,
     the rotation addresses the incoming state for 200ms before the morph
     begins, so transitions read as intention rather than as a test of
     attention. Settle-through: morphs pass through a brief 0.98 scale
     dip — the object inhales before it reorganises. */
  const morph = useRef({ holdUntil: 0, target: state, dip: 1 });
  if (morph.current.target !== state) {
    morph.current = { target: state, holdUntil: performance.now() + 200, dip: morph.current.dip };
  }

  /* Continuous depth: the object turns with the reading, at the
     specimen's idle pace — ±8° across a full section pass, driven by
     scroll velocity, decaying with the fling friction. Between states
     the rail stays alive without ever demanding attention. */
  const drift = useRef({ yaw: 0, vel: 0, lastScroll: -1 });

  /* Drag (Motion PRD 9.4): a pointer down grabs the rotation, one-to-one
     while held; on release the angular velocity carries forward with a
     0.95-per-frame friction decay. No bounce, no rubber-banding —
     honest momentum the user imparted and can re-impart at any moment.
     Tilt composes with (adds to) the user's rotation. */
  const drag = useRef({ active: false, id: -1, x: 0, y: 0, vyaw: 0, vpitch: 0 });
  const grabbed = useRef({ yaw: 0, pitch: 0 });

  const startDrag = useCallback((e: ThreeEvent<PointerEvent>) => {
    drag.current.active = true;
    drag.current.id = e.pointerId;
    drag.current.x = e.clientX;
    drag.current.y = e.clientY;
    drag.current.vyaw = 0;
    drag.current.vpitch = 0;
    grabbed.current.yaw = spin.current + drift.current.yaw;
    grabbed.current.pitch = tilt.current.x;
    document.documentElement.setAttribute('data-specimen-dragging', 'true');
  }, []);

  const moveDrag = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (!drag.current.active || e.pointerId !== drag.current.id) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    drag.current.x = e.clientX;
    drag.current.y = e.clientY;
    // One-to-one: roughly one viewport width of travel = one full turn.
    const kx = (Math.PI * 2) / Math.max(320, window.innerWidth);
    const ky = (Math.PI * 0.5) / Math.max(320, window.innerHeight);
    drift.current.yaw = grabbed.current.yaw + dx * kx - spin.current;
    tilt.current.x = Math.max(-0.9, Math.min(0.9, grabbed.current.pitch + dy * ky));
    drag.current.vyaw = dx * kx * 60; // per-second velocity for the release
    drag.current.vpitch = dy * ky * 60;
  }, []);

  const endDrag = useCallback(() => {
    drag.current.active = false;
    document.documentElement.removeAttribute('data-specimen-dragging');
  }, []);

  useEffect(() => {
    const onUp = () => endDrag();
    window.addEventListener('pointerup', onUp, { passive: true });
    window.addEventListener('pointercancel', onUp, { passive: true });
    return () => {
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      document.documentElement.removeAttribute('data-specimen-dragging');
    };
  }, [endDrag]);

  useFrame((s, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const held = performance.now() < morph.current.holdUntil;
    const target = STATE_POSITIONS[state];

    // Critically damped approach. No overshoot, no bounce. During the
    // anticipation window the shapes hold; the turn leads the morph.
    if (!held) {
      const k = 1 - Math.exp(-delta * 3.4);
      for (let i = 0; i < live.length; i++) {
        live[i] += (target[i] - live[i]) * k;
      }
    }

    // Settle-through: how far the shapes are apart decides the dip.
    let spread = 0;
    for (let i = 0; i < live.length; i += 3) {
      spread += Math.abs(target[i] - live[i]);
    }
    const dipTarget = spread > 0.3 ? 0.98 : 1;
    morph.current.dip += (dipTarget - morph.current.dip) * (1 - Math.exp(-delta * 6));

    if (!drag.current.active) {
      // Continuous depth: scroll velocity feeds the yaw channel, decaying
      // with the fling friction between sections.
      const y = window.scrollY;
      if (drift.current.lastScroll >= 0 && y !== drift.current.lastScroll) {
        const d = y - drift.current.lastScroll;
        drift.current.vel +=
          (d * (8 * Math.PI)) / 180 / Math.max(1, window.innerHeight);
      }
      drift.current.lastScroll = y;

      const FRICTION = 0.95; // --spring-fling, per frame at 60fps
      const f = Math.pow(FRICTION, delta * 60);
      drift.current.vel *= f;
      drift.current.yaw += drift.current.vel * delta;
      // Released drag carries its angular velocity into the channel.
      drift.current.yaw += drag.current.vyaw * delta;
      drag.current.vyaw *= f;
      tilt.current.x += drag.current.vpitch * delta;
      drag.current.vpitch *= f;
      if (Math.abs(drag.current.vyaw) < 1e-4) drag.current.vyaw = 0;
      if (Math.abs(drag.current.vpitch) < 1e-4) drag.current.vpitch = 0;
    }

    // Idle: settling, not spinning. The graph turns slowly; the histogram
    // and the map hold still, because a rotating histogram is nonsense.
    if (group.current) {
      if (state === 'graph') {
        spin.current += delta * 0.02;
      } else {
        spin.current += (0 - spin.current) * (1 - Math.exp(-delta * 2.2));
      }

      // Anticipation: while the shapes hold, the rotation addresses the
      // incoming state.
      if (held) spin.current += delta * 0.2;

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

      group.current.rotation.set(
        tilt.current.x,
        spin.current + drift.current.yaw + tilt.current.y,
        0,
      );
      group.current.scale.setScalar(morph.current.dip);
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
      onPointerDown={startDrag}
      onPointerMove={(e) => {
        pointer.current.x = (e.pointer?.x ?? 0) * -1;
        pointer.current.y = (e.pointer?.y ?? 0) * -1;
        moveDrag(e);
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
        onHover={handleHoverNode}
        hovered={hovered}
      />
      <Nodes
        indices={graphiteIndices}
        positions={live}
        state={state}
        tier={tier}
        onHover={handleHoverNode}
        hovered={hovered}
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
          chunk for a difference nobody would name. The rig is deliberately
          FLAT — closer to print than to studio: high ambient, one restrained
          key, weak fills — so the nodes read as ink printed on the paper
          rather than glossy spheres floating in front of it. */}
      <ambientLight intensity={1.5} color="#fdfaf4" />
      <directionalLight position={[-3.2, 4.2, 3.4]} intensity={1.35} color="#fff8ec" />
      <directionalLight position={[3.4, 0.6, 2.2]} intensity={0.5} color="#eef2f6" />
      <directionalLight position={[0, -3.2, 1.5]} intensity={0.35} color="#efe6d2" />
      <hemisphereLight args={['#ffffff', '#ded5c2', 0.55]} />

      <Specimen state={state} tier={tier} onHover={handleHover} />

      {tier === 'high' ? (
        <ContactShadows
          position={[0, -1.85, 0]}
          opacity={0.3}
          scale={8}
          blur={1.4}
          far={3}
          resolution={256}
          color="#1A1917"
        />
      ) : null}
    </Canvas>
  );
}
