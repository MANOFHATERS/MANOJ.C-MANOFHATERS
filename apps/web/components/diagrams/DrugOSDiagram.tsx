import { Arrow, Box, DiagramFrame, GRAPHITE, PIGMENT, RULE, Tag } from './Primitives';

/**
 * Fig. 1.1 — DrugOS.
 *
 * Four phases in one unbroken data path, and the loop that closes it. The
 * pigment elements are the two that carry the argument: the validation gate
 * that refuses to emit below the launch bar, and the flywheel that returns a
 * lab-validated hypothesis to the training data. The flywheel is dashed
 * because it is implemented and wired but has never been closed by a real
 * validation — that needs a partner, not more code.
 */
export function DrugOSDiagram() {
  return (
    <DiagramFrame
      width={940}
      height={510}
      title="DrugOS architecture: thirteen public data sources are ingested and staged, fused into a Neo4j knowledge graph, scored by a Graph Transformer, and ranked by a PPO agent whose output passes a validation gate before it can reach the API and dashboard. Validated results return to the training data."
    >
      {/* ── Sources, listed down the left margin ── */}
      <Tag x={0} y={22}>
        13 SOURCES
      </Tag>
      {['ChEMBL', 'DrugBank', 'UniProt', 'STRING', 'DisGeNET', 'OMIM', 'PubChem'].map(
        (s, i) => (
          <text
            key={s}
            x={0}
            y={46 + i * 15}
            fill={GRAPHITE}
            fontFamily="var(--font-sans)"
            fontSize="10.5"
          >
            {s}
          </text>
        ),
      )}
      {['SIDER', 'STITCH', 'DRKG', 'OpenTargets', 'GEO', 'ClinicalTrials'].map((s, i) => (
        <text
          key={s}
          x={0}
          y={196 + i * 15}
          fill={RULE}
          fontFamily="var(--font-sans)"
          fontSize="10.5"
        >
          {s}
        </text>
      ))}

      {/* ── Column A: ingestion → bridge → graph ── */}
      <Box x={130} y={40} w={160} h={56} label="Phase 1 — Ingestion" sub="Airflow · PostgreSQL" />
      <Arrow d="M 104 68 L 126 68" />
      <Tag x={130} y={112}>
        MALFORMED ROW → DEAD-LETTER + REASON + SHA-256
      </Tag>

      <Box x={130} y={130} w={160} h={40} label="phase1_bridge" tone="quiet" />
      <Arrow d="M 210 98 L 210 126" />
      <Tag x={130} y={186}>
        NODES + EDGES, WITH FULL LINEAGE
      </Tag>

      <Box
        x={130}
        y={204}
        w={160}
        h={56}
        label="Phase 2 — Graph"
        sub="Neo4j · 9 / 31 types"
      />
      <Arrow d="M 210 172 L 210 200" />
      <Arrow d="M 104 232 L 126 232" />

      {/* ── Column B: the model ── */}
      <Box
        x={350}
        y={204}
        w={170}
        h={56}
        label="Phase 3 — Transformer"
        sub="Custom attention · MLflow"
      />
      <Arrow d="M 292 232 L 346 232" />

      {/* ── Column C: the ranker and its gate ── */}
      <Tag x={615} y={192} anchor="middle">
        gt_rl_bridge · 17 FEATURES
      </Tag>
      <Box
        x={580}
        y={204}
        w={170}
        h={56}
        label="Phase 4 — PPO ranker"
        sub="gnn_score weighted 0.04"
      />
      <Arrow d="M 522 232 L 576 232" />

      <Arrow d="M 665 262 L 665 296" tone="pigment" />
      <Box
        x={580}
        y={298}
        w={170}
        h={44}
        label="Validation gate"
        sub="AUC ≥ 0.85, or nothing"
        tone="pigment"
      />
      <Tag x={580} y={362} tone="pigment">
        RAISES RATHER THAN EMITS.
      </Tag>
      <Tag x={580} y={376} tone="graphite">
        VERIFIED E2E RUN: TEST AUC 0.61 — BLOCKED.
      </Tag>

      {/* ── Serving ── */}
      <Box x={580} y={40} w={170} h={50} label="FastAPI services" sub="JWT · audit trail" />
      <Box x={580} y={108} w={170} h={50} label="Next.js dashboard" sub="66 routes · multi-tenant" />
      <Arrow d="M 665 200 L 665 162" />
      <Arrow d="M 665 104 L 665 94" />

      {/* ── The flywheel ── */}
      <path
        d="M 752 133 L 850 133 L 850 432 L 210 432 L 210 268"
        fill="none"
        stroke={PIGMENT}
        strokeWidth={1}
        strokeDasharray="4 4"
        markerEnd="url(#arrow-pigment)"
      />
      <Tag x={858} y={276} tone="pigment">
        WRITEBACK
      </Tag>
      <Tag x={858} y={290} tone="pigment">
        THE FLYWHEEL
      </Tag>
      <Tag x={222} y={452} tone="graphite">
        A PARTNER VALIDATES A HYPOTHESIS IN THE LAB → IT BECOMES TRAINING DATA → THE MODELS RETRAIN
      </Tag>

      {/* ── Footnote ── */}
      <line x1={0} y1={478} x2={940} y2={478} stroke={RULE} strokeWidth={1} />
      <Tag x={0} y={496}>
        SOLID: THE DATA PATH, WHICH RUNS END TO END. DASHED: THE LOOP, WIRED BUT NEVER YET CLOSED BY A REAL VALIDATION.
      </Tag>
    </DiagramFrame>
  );
}
