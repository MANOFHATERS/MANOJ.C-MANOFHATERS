/**
 * The three case studies.
 *
 * Every number in `results` carries a `source` naming the run, artifact or file
 * it was read from. That field is not decoration — it is the rule that makes the
 * rest of the site credible, and the résumé and the chatbot inherit it.
 */

export type Slug = 'drugos' | 'tailgen' | 'atmosview';

/** Which state the 3D specimen takes while this case study is on screen. */
export type SpecimenState = 'graph' | 'tail' | 'field';

export interface HardProblem {
  readonly title: string;
  /** What was actually going wrong. */
  readonly problem: string;
  /** The decision taken, and why that one. */
  readonly decision: string;
  /** What changed afterwards. Measured where possible. */
  readonly result: string;
}

export interface ResultRow {
  readonly metric: string;
  readonly value: string;
  readonly comparison?: string;
  /** The run, artifact or file this number was read from. Never omitted. */
  readonly source: string;
}

export interface Project {
  readonly slug: Slug;
  readonly index: string;
  readonly name: string;
  readonly fullName: string;
  readonly tagline: string;
  readonly role: string;
  readonly team: string;
  readonly duration: string;
  readonly year: string;
  readonly repo: string;
  readonly repoLabel: string;
  readonly specimen: SpecimenState;
  readonly stack: readonly string[];
  /** One metric, shown on the home-page index plate. */
  readonly headline: { readonly value: string; readonly label: string };
  readonly abstract: readonly string[];
  readonly problem: {
    readonly heading: string;
    readonly body: readonly string[];
    readonly pullquote?: { readonly text: string; readonly attribution: string };
  };
  readonly architecture: {
    readonly figure: string;
    readonly caption: string;
    readonly walkthrough: readonly string[];
  };
  readonly hardProblems: readonly HardProblem[];
  readonly results: {
    readonly figure: string;
    readonly caption: string;
    readonly rows: readonly ResultRow[];
    readonly note?: string;
  };
  readonly limitations: readonly string[];
  readonly next: readonly string[];
  /** Pre-filled question for the "Ask about this project" button. */
  readonly askPrompt: string;
}

export const projects: readonly Project[] = [
  /* ────────────────────────────────────────────────────────────── §03.1 */
  {
    slug: 'drugos',
    index: '01',
    name: 'DrugOS',
    fullName: 'DrugOS — Autonomous Drug Repurposing',
    tagline:
      'A knowledge graph, a Graph Transformer and a reinforcement-learning ranker that look for second uses of drugs that already cleared human safety trials.',
    role: 'Project lead and architect',
    team: 'Team of 4',
    duration: 'Two-month specification, then the build',
    year: '2026',
    repo: 'https://github.com/MANOFHATERS/autonomous-drug-repurposing',
    repoLabel: 'MANOFHATERS/autonomous-drug-repurposing',
    specimen: 'graph',
    stack: [
      'Python',
      'PyTorch Geometric',
      'Neo4j',
      'PostgreSQL',
      'Airflow',
      'Stable-Baselines3',
      'FastAPI',
      'Next.js',
      'Prisma',
      'Docker',
    ],
    headline: { value: '547', label: 'spec citations in code' },
    abstract: [
      'Developing a new drug takes about twelve years and $2.6 billion, and most candidates fail; repurposing sidesteps that by finding a second disease for a molecule that already cleared human safety trials. I designed and led a four-phase system that fuses thirteen public biomedical sources into a knowledge graph of nine node types and thirty-one edge types, trains a heterogeneous Graph Transformer to score untested drug–disease pairs, and runs a PPO agent over those scores to rank candidates by plausibility, patient safety and market opportunity.',
      'I was the originator, architect and project lead for a team of four. Before any production code was written I spent two months on a numbered build specification, which then governed the work: it is cited 547 times across source, tests and documentation.',
      'The verified end-to-end run reaches a test AUC of 0.61, below the 0.85 launch bar the specification sets — so the validation gate blocks the output rather than shipping it. That behaviour is the result I am proudest of.',
    ],
    problem: {
      heading: 'Five hops from a typo to a person',
      body: [
        'Drug repurposing has a famous history and an unflattering one. Thalidomide found a second life in multiple myeloma. Sildenafil was a cardiovascular drug before it was anything else. Both were accidents. The premise of DrugOS is that an accident is a bad discovery process, and that the bottleneck is not modelling capability — public graph-learning methods are good — but data integration and trustworthiness.',
        'Thirteen sources disagree about what a molecule even is. ChEMBL, DrugBank, PubChem and STITCH each carry their own identifiers, and the same compound appears under several of them. Resolving that is not a nice-to-have: an entity-resolution error joins the wrong protein to the wrong drug, and nothing downstream can detect it.',
        'The reason the code is shaped the way it is comes down to one line in the source of the DisGeNET pipeline, which I keep quoting because it is the whole design brief in one sentence.',
      ],
      pullquote: {
        text: 'If the dataset part of the code is wrong, and then the parts I build on top of it are wrong, and then people use the website and get wrong outputs — then people use those drugs and they die.',
        attribution: 'From the source of the DisGeNET ingestion pipeline',
      },
    },
    architecture: {
      figure: 'Fig. 1.1',
      caption:
        'Four phases and a feedback loop. Thirteen sources enter on the left; validated hypotheses return on the right and become training data.',
      walkthrough: [
        'Phase 1 is ingestion. Seven pipelines — ChEMBL, DrugBank, UniProt, STRING, DisGeNET, OMIM and PubChem — share one abstract contract, so every source is cleaned, schema-validated and staged in PostgreSQL the same way. A malformed row is not dropped. It is dead-lettered with a reason code, a provenance record and a SHA-256 of the file it came from, because a silently discarded row is a data-quality bug you can never find again.',
        'The bridge between Phase 1 and Phase 2 emits node and edge dictionaries with full lineage. Everything routes through InChIKey as the universal chemical identifier, which was an early architectural decision and the one that makes the rest of the join tractable.',
        'Phase 2 builds the knowledge graph in Neo4j and materialises it as a PyTorch Geometric HeteroData object: nine node types and thirty-one edge types, enriched with six further sources — SIDER, STITCH, DRKG, OpenTargets, GEO and ClinicalTrials.gov.',
        'Phase 3 trains the heterogeneous Graph Transformer with a custom attention layer over five node types and nineteen edge types, tracked in MLflow. Its output is an interaction score for each drug–disease pair.',
        'Phase 4 is the part people ask about. Instead of ranking by model score, a PPO agent in a Gymnasium environment reads a seventeen-column feature vector — of which the GNN score is only one — and learns a ranking policy whose reward decomposes into scientific plausibility, patient safety and market opportunity. Its output is blocked entirely if the upstream model fails the launch criteria.',
        'Phases 5 and 6 are four FastAPI services and a multi-tenant Next.js dashboard with sixty-six routes. The loop closes through a writeback module and an Airflow sensor: when a partner validates a hypothesis in the wet lab, the result is written back into the training data and the models retrain.',
      ],
    },
    hardProblems: [
      {
        title: 'Label leakage that looks exactly like signal',
        problem:
          'The `treats` edge is the prediction target, so it has to be masked during training. The trouble is that adverse-event edges are structurally almost identical — a drug connected to a disease — but they are real-world safety information the model should absolutely learn from. Masking everything that looks like the label throws away the signal. Masking nothing leaks the answer.',
        decision:
          'I split the edges into two sets with different contracts rather than one blacklist. LABEL_LEAKING_EDGES are excluded unconditionally. SAFETY_SIGNAL_EDGES stay visible during training but are masked per drug when scoring a validation or test pair involving that drug.',
        result:
          'The distinction is enforced at the data layer rather than remembered by whoever writes the next training script, and the per-drug masking is covered by tests that fail if an edge set is reclassified without a corresponding change to the contract.',
      },
      {
        title: 'A reinforcement-learning agent that was quietly a mirror',
        problem:
          'In the first design the GNN score carried 35% of the ranking weight plus a multiplicative gate. The result looked excellent and was worthless: the RL agent had become a distillation of the Graph Transformer. It could not check upstream bias because it was made of it, and it amplified any error Phase 3 made.',
        decision:
          'I demoted gnn_score to a weight of 0.04 — the weakest of the seventeen features — which forced Phase 4 to carry independent signal from the safety, plausibility and market features or carry none at all.',
        result:
          'Phase 4 became a second opinion instead of an echo. It is the decision I would defend hardest, because the version that scored better on paper was the one that told you less.',
      },
      {
        title: 'PPO collapsing to a single action',
        problem:
          'The ranking agent kept degenerating to a constant policy — always LOW, or always HIGH. Either one scores respectably against a naive reward and learns nothing about the actual problem.',
        decision:
          'I stopped tuning and wrote out the expected value of each degenerate policy by hand, then adjusted four reward parameters until both had negative expected value and the gap to perfect play was a gradient the agent could actually climb. The arithmetic is in the source, next to the constants it justifies.',
        result:
          'The collapse stopped being something to retry past and became something with a documented reason. Reward design is an incentives problem before it is a code problem.',
      },
    ],
    results: {
      figure: 'Fig. 1.2',
      caption: 'Scale and status. Every figure read from the repository, not estimated.',
      rows: [
        {
          metric: 'Data sources integrated',
          value: '13',
          comparison: '7 in Phase 1, 6 in Phase 2',
          source: 'Phase 1 and Phase 2 pipeline registries',
        },
        {
          metric: 'Knowledge-graph node / edge types',
          value: '9 / 31',
          comparison: 'GT model sees 5 / 19',
          source: 'drugos_graph/config.py',
        },
        {
          metric: 'Specification citations in code',
          value: '547',
          comparison: '59 to the launch criteria, 55 to the flywheel',
          source: 'Repository-wide citation count',
        },
        {
          metric: 'Python tests',
          value: '10,561',
          comparison: 'across 354 test files',
          source: 'pytest collection',
        },
        {
          metric: 'Commits / branches',
          value: '1,071 / 326',
          source: 'Git history',
        },
        {
          metric: 'SQL migrations',
          value: '46',
          comparison: '42 in Phase 1, each with a rollback',
          source: 'Migration directory',
        },
        {
          metric: 'Verified end-to-end test AUC',
          value: '0.61',
          comparison: 'against a 0.85 launch gate — output blocked',
          source: 'README_V31.md, verified E2E run',
        },
      ],
      note: 'The 0.61 is the honest number and the interesting one. The specification sets 0.85 as the bar for emitting a ranked candidate, and the Phase 4 gate raises a ScientificFailureError rather than shipping below it. A developer once lowered the threshold to 0.65 so demo-scale graphs would pass; a later fix restored 0.85 for all scales, on the grounds that the specification sets one bar and not a sliding one.',
    },
    limitations: [
      'The platform runs end-to-end in sample and demo mode. A full-scale production run against the complete datasets is not recorded in the repository, and the results file holds a placeholder that says so explicitly rather than an empty file that would look like success.',
      'The verified end-to-end run reaches test AUC 0.61, well below the 0.85 launch criterion. No ranked output is emitted at that level, which is the intended behaviour, but it does mean the scientific claim is unproven at scale.',
      'DrugBank academic downloads have been paused upstream since May 2026, so full mode requires an explicit degraded-mode acknowledgement.',
      'The data flywheel is implemented and wired, but it has never been closed by a real wet-lab validation, because that requires a partner.',
    ],
    next: [
      'Run the pipeline at full scale on a machine with enough memory to hold the complete graph, and report the resulting AUC whatever it turns out to be.',
      'Replace the fixed 0.85 gate with a calibrated one — a threshold justified by the precision required at the top of the ranked list, rather than a number inherited from the specification.',
      'Publish the entity-resolution audit as its own artifact. It is the part of the system I trust most and the part reviewers see least.',
    ],
    askPrompt: 'How did DrugOS prevent label leakage?',
  },

  /* ────────────────────────────────────────────────────────────── §03.2 */
  {
    slug: 'tailgen',
    index: '02',
    name: 'TailGen',
    fullName: 'TailGen — Generative Tail-Risk Engine',
    tagline:
      'A score-based diffusion model that learns the real, heavy-tailed shape of market returns and generates crashes that never happened but could have.',
    role: 'Solo',
    team: 'Built alone',
    duration: '2026',
    year: '2026',
    repo: 'https://github.com/MANOFHATERS/tailgen',
    repoLabel: 'MANOFHATERS/tailgen',
    specimen: 'tail',
    stack: [
      'PyTorch',
      'Diffusion Transformer',
      'FastAPI',
      'Next.js 16',
      'Prisma',
      'Prometheus',
      'pytest',
      'Docker',
    ],
    headline: { value: '8 / 35', label: '99% VaR breaches vs Gaussian 12' },
    abstract: [
      'Every risk system in finance answers one question — how bad can it get — and answers it either by reading the last 250 days or by assuming returns are Gaussian. Both fail in the same direction at the same time. TailGen learns the distribution instead of assuming it: a variance-preserving score-based diffusion model, trained on forty years of S&P 500 daily returns, which generates sixty-day return paths that never occurred but carry the true fat tails, volatility clustering and leverage asymmetry of the ones that did.',
      'Around the model sits the part that makes it a system rather than a notebook: a validation layer with Kupiec, Christoffersen and Acerbi–Székely tests and a seven-gate certification suite; a governance layer with a SHA-256-verified model registry and human-gated promotion; a FastAPI serving service; and a four-surface Next.js platform. Roughly 11,300 lines of Python and 35,500 of TypeScript, 233 Python tests, written alone.',
      'On the held-out COVID window the model breached its 99% VaR on 8 of 35 days against the rolling Gaussian 12 — and the platform still displays its own certification verdict as FAIL, 5 of 7 gates, because two Kupiec coverage tests do not pass on a pure-crash window.',
    ],
    problem: {
      heading: 'A 22-sigma day happened',
      body: [
        'Value-at-Risk is the loss level that will not be exceeded with probability p. It sets bank capital, merchant risk limits and settlement exposure, and it is computed one of two ways. Historical simulation reads the empirical quantile off the last 250 trading days, so its memory is one year long: if the last year was calm, the model believes the world is calm. Parametric Gaussian assumes normality and is structurally incapable of producing a fat tail.',
        'October 1987 was a 22-sigma day under Gaussian assumptions — an event whose probability is so small it should not occur in the lifetime of the universe. It occurred. So did LTCM, 2008, and March 2020, when the S&P fell 12% in a day and effectively every 99% VaR model in production was breached repeatedly.',
        'The failure is measurable, not rhetorical. Real S&P 500 daily log-returns have an excess kurtosis of 25.93 against the Gaussian zero, a Hill tail index of 2.66 against a structurally light 5.12, skewness of −1.22 against zero, and volatility clustering the Gaussian cannot represent at all. A tail index near 2.66 means the tail decays as a power law, so extreme moves are orders of magnitude more likely than the normal distribution allows.',
        'The structural idea is that an asset price is a stochastic differential equation, and so is a diffusion model. Anderson showed in 1982 that a noising process can be run backwards in time given the score — the gradient of the log-density of the noised data. Train a model to learn that score on windows of real returns, and you can simulate the market backwards from pure noise. Generative VaR is then just reading a quantile off a large pool of generated returns, where the model\'s memory is the whole forty-year distribution rather than a 250-day window.',
      ],
    },
    architecture: {
      figure: 'Fig. 2.1',
      caption:
        'Four layers: the engine that generates, the validation that judges it, the governance that decides whether it ships, and the service that serves it.',
      walkthrough: [
        'The engine implements the variance-preserving SDE with the DDPM discretisation, two denoiser architectures — a Diffusion Transformer and a Temporal CNN — and three reverse samplers: ancestral DDPM, DDIM and a probability-flow ODE. Training minimises the standard denoising-score-matching objective against real S&P 500 closes from 1985 onward, pulled through yfinance with quality gates and recorded provenance.',
        'The validation layer computes VaR and expected shortfall, then subjects them to Kupiec unconditional-coverage, Christoffersen independence and Acerbi–Székely ES tests, plus Hill tail-index estimation with window-level drift bands. Seven certification gates sit on top with a stable input/output contract, so the verdict is reproducible from a digest of the inputs.',
        'Governance is where most model projects stop and this one does not. The registry stores every version with a SHA-256 integrity check, an append-only audit trail and instant rollback. The promote() call raises unless there is both an attached evaluation and a named human approver: the requirement lives in code rather than in a wiki page nobody reads.',
        'Serving is a FastAPI service with API-key auth, token-bucket rate limits, usage metering, correlation-ID tracing, Prometheus metrics, reproducible seeds and fail-closed semantics throughout. The web platform is four surfaces in one Next.js 16 app: a marketing site, an authenticated risk console, a developer portal and an admin and governance console, with bcrypt auth, a hash-chained audit log and SSE for live updates.',
      ],
    },
    hardProblems: [
      {
        title: 'Weights that depended on what had run before them',
        problem:
          'Model initialisation consumes the global torch RNG. Seeding inside train() therefore left the trained weights dependent on whatever else had touched the RNG earlier in the process — a latent order-dependence that would have made every reproducibility claim in the project false, and one that only surfaced because the reproducibility tests exist.',
        decision:
          'Move the seed into __init__, before parameters are created, so the guarantee covers initialisation as well as training.',
        result:
          'Reproducibility became a property the tests can assert rather than a convention. It is a two-line fix that would have quietly invalidated every number in the evaluation had it not been found.',
      },
      {
        title: 'Choosing the deterministic sampler for the unglamorous reason',
        problem:
          'DDIM with eta = 0 is usually chosen because it is faster. Here the reason was different: the stochastic ancestral chain accumulates per-step score error across 500 steps, while the deterministic integrator does not, so the sampler choice is about stability of the tail statistics rather than throughput.',
        decision:
          'Make DDIM with eta = 0 the default, keep eta as a dial so DDPM behaviour is one parameter away, and prove the identity between them in a test rather than asserting it in a comment.',
        result:
          'The generated tail statistics stopped drifting between runs, and the claim that the two samplers agree at eta = 1 is checked by CI rather than believed.',
      },
      {
        title: 'Shipping a model that fails its own certification',
        problem:
          'Running the real certification suite on the real input bundle returns FAIL: five of seven gates pass. The two failures are Kupiec coverage tests at 95% and 99%. The commercially convenient move is to soften the gate, re-run on a friendlier window, or show the verdict somewhere less prominent.',
        decision:
          'Display FAIL 5/7 on the platform\'s own certification page, with the input digest, alongside the observation that every classical baseline fails the same two tests on the same window — including the truth-adjacent full-history one.',
        result:
          'The validation product is now capable of saying no, including to its author. That is the only version of it worth anything, and it is the single design decision in the project I would most want to be asked about.',
      },
    ],
    results: {
      figure: 'Fig. 2.2',
      caption:
        'Held-out COVID window, 19 Feb to 7 Apr 2020. Every forecast strictly causal; the diffusion model never saw the window in training or validation.',
      rows: [
        {
          metric: '99% VaR breaches — diffusion',
          value: '8 / 35',
          comparison: 'rolling Gaussian 12 / 35, historical 8 / 35',
          source: 'artifacts/metrics/dit/metrics.json',
        },
        {
          metric: 'Mean 99% VaR — diffusion',
          value: '4.07%',
          comparison: 'Gaussian 3.17% — the tail is priced 28% wider',
          source: 'backtest-covid.json',
        },
        {
          metric: 'Hill tail index alpha',
          value: '2.510',
          comparison: 'real 2.656, Gaussian 5.12',
          source: 'artifacts/metrics/metrics.json, 512-window pool',
        },
        {
          metric: 'Generated excess kurtosis',
          value: '10.47',
          comparison: 'real 25.93, Gaussian 0.005',
          source: 'artifacts/metrics/metrics.json',
        },
        {
          metric: 'Skewness',
          value: '−0.841',
          comparison: 'real −1.220, Gaussian −0.002',
          source: 'artifacts/metrics/metrics.json',
        },
        {
          metric: 'Volatility clustering, ACF of |r| over lags 1–5',
          value: '0.220',
          comparison: 'real 0.305 — about 72% of real strength',
          source: 'artifacts/metrics/metrics.json',
        },
        {
          metric: 'Certification verdict',
          value: 'FAIL, 5 / 7',
          comparison: 'both failures are Kupiec coverage tests',
          source: 'certification-report.json, digest 3113bfbcafe9a859',
        },
        {
          metric: 'Champion model parameters',
          value: '540,997',
          comparison: 'DiT, best val loss 0.4476 over 120 epochs',
          source: 'artifacts/metrics/train_report_dit.json',
        },
      ],
      note: 'Stated precisely: at 99% VaR on the held-out COVID window the diffusion model breached on 8 of 35 days against the rolling Gaussian\'s 12, a 33% reduction in exceedance days, while pricing the 1% tail 28% wider — because its training distribution contains 1987 and 2008 while a 250-day Gaussian window had seen mostly calm. Stated equally precisely: nothing is unconditionally calibrated in a 35-day pure-crash window. Every method, including the full-history baseline, fails Kupiec with p below 1e−8. The relative comparison is the result; the absolute calibration is not.',
    },
    limitations: [
      'Univariate. One asset. Correlation breakdown across assets during a crash — the genuinely open problem in the field — is not addressed at all.',
      'Residual normality bias: generated excess kurtosis is 10.47 against a real 25.93. The tail has the right shape but is not heavy enough. Two causes are identified: a small-compute training regime, and the Gaussian forward process itself.',
      'Within-window dynamics are weak. Pooled ACF of |r| is a healthy 0.22, but within-window lag-1 ACF is close to zero: the generator produces realistic marginal clustering statistics rather than strongly persistent per-path volatility.',
      'Limited held-out crises. COVID is the clean holdout. A later run pooling 2008 and 2020 over 98 days performs worse than the baselines, and the harness reports the windows side by side rather than blending them, precisely so that this is visible.',
      'The model card states it plainly: a candidate for internal pilot, not approved for customer-facing or capital-relevant decisions.',
      'Parts of the platform run on clearly labelled demonstration data — the registry version history, the usage and invoice seed, and the merchant ledger when Razorpay credentials are absent. The engine, registry, certification suite, service, auth and audit chain are all real.',
    ],
    next: [
      'Multivariate. A joint model over a basket, so that the correlation collapse in a crash becomes something the generator has to reproduce rather than something it is exempt from.',
      'A heavy-tailed forward process. The Gaussian noising process is itself part of the residual normality bias, and the diffusion-copula hybrids in the 2025–26 literature address exactly this.',
      'Regime-conditional VaR. The backtest uses an unconditional diffusion VaR, but the volatility-conditioning machinery is already built and unused — that is the obvious next experiment.',
    ],
    askPrompt: 'Why does TailGen ship a FAIL certification verdict?',
  },

  /* ────────────────────────────────────────────────────────────── §03.3 */
  {
    slug: 'atmosview',
    index: '03',
    name: 'AtmosView',
    fullName: 'AtmosView — Weather & Air-Quality Intelligence',
    tagline:
      'Four providers, one view, and a refusal to average away the places where they disagree.',
    role: 'Solo',
    team: 'Built alone',
    duration: '2026',
    year: '2026',
    repo: 'https://github.com/MANOFHATERS/atmosview-weather',
    repoLabel: 'MANOFHATERS/atmosview-weather',
    specimen: 'field',
    stack: [
      'React 19',
      'Vite',
      'Node.js',
      'Express',
      'MongoDB',
      'Mongoose',
      'JWT',
      'Leaflet',
      'ApexCharts',
    ],
    headline: { value: '4', label: 'providers, never averaged' },
    abstract: [
      'Weather apps present a single number, and that number is a lie of omission. Ask three providers for the current temperature in Bengaluru and you get three answers, typically spread across one to three degrees. That spread is not noise to be averaged away — it is information about confidence, and AtmosView is built on the commitment that aggregation must be reversible.',
      'It is a full-stack platform: a Node and Express aggregation API with ten weather endpoints proxying Open-Meteo, MET Norway, WAQI and the ERA5 archive, each response cached in process with per-provider graceful degradation; a JWT auth layer with a researcher role; a CSV ingestion pipeline whose header detection tolerates real provider exports; and a React 19 frontend with a twelve-tile dashboard, annotated trend charts, a four-basemap Leaflet map of India and two-city comparison.',
      'Thirty-nine HTTP endpoints, five data models, roughly 7,500 lines, built alone in about ten days — and I can enumerate exactly which 24% of it is legacy or unreachable, which is the part of this write-up I would most want a reviewer to read.',
    ],
    problem: {
      heading: 'AQI is not a measurement',
      body: [
        'A single temperature reading hides the only diagnostic a user actually has. A 0.2 °C spread between providers means the models agree and the reading can be trusted. A 3 °C spread means something is off — a stale station, a bad interpolation, a model that has not ingested the latest observations. Collapse the four into a mean and you have destroyed the one signal that told you whether to believe the mean.',
        'Air quality is worse, because AQI is not a measured quantity at all. It is a derived index, and the derivation differs by jurisdiction: the US EPA, the Indian CPCB and the European EAQI map the same PM2.5 concentration to different index values and different category labels. "AQI: 156" tells you nothing about which scale produced it or which pollutant drove it.',
        'There is a second problem, for a narrower audience. If you have a season of field measurements from a sensor you calibrated yourself, there is nowhere to put them beside the API baseline and look at both curves together. So AtmosView lets an authenticated researcher upload their own CSV and switch the historical charts from API data to their own, for the same city and the same range.',
      ],
    },
    architecture: {
      figure: 'Fig. 3.1',
      caption:
        'Every provider is fetched in parallel and normalised at the boundary. A provider that fails returns null rather than propagating a 500, so the page degrades one row at a time.',
      walkthrough: [
        'Provider keys never reach the browser. The frontend talks only to the local proxy; the backend holds the WAQI and Visual Crossing keys. The proxy is not indirection for its own sake — it exists so the keys stay server-side, and it has the secondary benefit of making CORS-hostile providers usable at all.',
        'The dashboard issues six requests concurrently rather than sequentially, so total latency is the slowest provider rather than the sum of all of them.',
        'Degradation rather than failure, consistently across four layers, is how a provider going down is handled. When an upstream provider errors, the MET Norway and WAQI endpoints deliberately return HTTP 200 with a null payload rather than propagating a 500; every frontend service catches and returns null or an empty array rather than throwing; the dashboard renders a missing source as a dash with "Unavailable" instead of collapsing; and the server still boots and serves weather when Mongo is down. A user with a broken WAQI token still gets a working app with one fewer row in the breakdown.',
        'Normalisation happens at the boundary. Three historical data paths and two data sources — the API and a researcher upload — all converge on one row shape before they reach a chart. The alternative, branching inside the chart components, would have multiplied the chart code by six.',
        'The per-source breakdown is assembled explicitly rather than inferred, pushing one entry per provider into arrays that mirror the shape of the database schema. The multi-source model lives in the data model, not only in the view.',
        'Caching is quota-driven rather than latency-driven, which is the more interesting reason: the free tiers of the upstream providers are the real constraint, and the TTL is set from them.',
      ],
    },
    hardProblems: [
      {
        title: 'CSV headers from the real world',
        problem:
          'A researcher\'s export is not a tidy file. Open-Meteo\'s own CSV exports carry preamble lines, units embedded in header names and inconsistent casing, and a naive parser fails on the first row of a file the user is certain is fine.',
        decision:
          'Detect the header row rather than assume it is line one, and map recognised variants onto the house schema before anything else touches the data. Store the parsed result per account in MongoDB, with authorisation expressed as a query constraint — find one by id and uploader — rather than a post-hoc ownership check that a later refactor can drop.',
        result:
          'Real provider exports load without pre-editing, and the same chart components render API data and uploaded data because both arrived in the same shape.',
      },
      {
        title: 'Composable auth instead of scattered checks',
        problem:
          'Role-gated upload endpoints tend to accumulate authorisation logic inside handlers, where it is easy to add a route and forget the check.',
        decision:
          'Express the chain in the route definition — verify the token, require the researcher role, then accept the multipart upload — so a route that omits a link is visibly missing it at the point of declaration.',
        result:
          'The gating is readable in the route table. This is also where the audit found its sharpest finding against me: the alerts routes carry no auth middleware at all, and the controller reads a user field nothing sets. It is unfinished rather than broken — the UI never calls it — but it is in the limitations below, not hidden.',
      },
      {
        title: 'Two generations of an application in one repository',
        problem:
          'The repo contains a first-generation cookie-auth server and UI alongside the current JWT server and React app. The package entry point still launches the old server, whose port does not match what the frontend expects, and the two declare conflicting user schemas on the same collection.',
        decision:
          'Rather than delete the history or pretend it is not there, I audited it precisely: which files are live and exercised, which are superseded, which were built and deliberately unmounted to simplify the dashboard, and which are unreachable in practice.',
        result:
          'Roughly 1,900 of 7,838 lines, about 24%, is legacy, orphaned or unreachable. For a solo project iterated over ten days that is unremarkable. Being able to enumerate it line by line is the point, and it is the honest version of "I know my codebase".',
      },
    ],
    results: {
      figure: 'Fig. 3.2',
      caption: 'Scale, read from the repository.',
      rows: [
        {
          metric: 'HTTP endpoints',
          value: '39',
          comparison: '10 of them weather-proxy endpoints',
          source: 'Express route definitions',
        },
        {
          metric: 'Data models',
          value: '5',
          comparison: 'Mongoose schemas',
          source: 'backend/models',
        },
        {
          metric: 'Providers aggregated',
          value: '4',
          comparison: 'Open-Meteo, MET Norway, WAQI, ERA5 archive',
          source: 'weatherProxyController.js',
        },
        {
          metric: 'Historical ranges',
          value: '7',
          comparison: 'up to 10 years',
          source: 'Historical endpoint configuration',
        },
        {
          metric: 'Frontend components / pages',
          value: '24 / 6',
          comparison: '19 of 24 components mounted',
          source: 'src/components, src/pages',
        },
        {
          metric: 'Source lines',
          value: '~7,500',
          comparison: 'JavaScript and JSX',
          source: 'Repository line count',
        },
        {
          metric: 'Legacy or unreachable',
          value: '~24%',
          comparison: '~1,900 of 7,838 lines, enumerated file by file',
          source: 'Self-audit, write-up section 11',
        },
      ],
    },
    limitations: [
      'AQI is approximated as PM2.5 multiplied by four in three places, rather than computed with EPA breakpoints. For a project whose thesis is that AQI derivations differ by jurisdiction, this is the most pointed limitation in the list, and it is the first thing I would fix.',
      'No tests. There is no test runner configured. Of the three systems on this site this is the one with the weakest testing story, and saying otherwise would be untrue.',
      'The alerts module is effectively unauthenticated: the routes carry no auth middleware and the controller trusts a user id from the request. The UI never calls it, so it is unfinished rather than exploited, but it is live surface area.',
      'Clients choose their own role at registration, so the researcher role is not actually a privilege boundary until that is fixed.',
      'A research-data listing endpoint is public and exposes uploader emails.',
      'Secrets were committed to the original repository history — a live Mongo URI, a JWT secret and API keys. They are being rotated, and this is stated here rather than discovered by a visitor.',
      'Tailwind loads from the CDN rather than the build, the frontend and one of the two servers disagree about the port, and a handful of smaller defects are catalogued in the write-up: a stale limit banner, an undefined variable in a forecast helper, a double unit conversion, and a 30-day history fetch whose result is never rendered.',
    ],
    next: [
      'Implement real EPA and CPCB breakpoint tables so the index is computed rather than approximated, and label every AQI figure with the scale that produced it.',
      'Delete the first-generation server and UI, unify the user schema, and fix the port mismatch so the repository has one obvious way to run.',
      'Add a test runner and cover the aggregation and normalisation layer first — it is the part where a silent error would be least visible and most damaging.',
    ],
    askPrompt: 'Why does AtmosView show provider disagreement instead of averaging?',
  },
];

export const projectBySlug = (slug: string): Project | undefined =>
  projects.find((p) => p.slug === slug);

export const nextProject = (slug: string): Project => {
  const i = projects.findIndex((p) => p.slug === slug);
  return projects[(i + 1) % projects.length];
};
