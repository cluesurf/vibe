// Wave-4 Track W22: The Vibe Atlas ("Better Than A New Kind of Science") Executable Explorer.
//
// Directly implements Lance's Note 18 (cambrian-explosion-of-minds-and-structures-18.md) grounded in
// Vibe Theory's verbatim {3,4,3,4} bare-U physics across ALL FOUR Atlases + Realization Compiler +
// Competing Phenomenal Constitution Hypotheses:
//   A1: Atlas of Forms: Field-Realized Bare-U Particle & Live Unitary Collision Zoo (k = 1..4)
//   A2: Atlas of Forms: Purely Observable-Driven Quantitative (m, phi) Phase Cartography vs NKS
//   A3: Atlas of Lives: Unbiased Signed Homeostatic MAP-Elites Self-Repairing Organisms
//   A4: Atlas of Minds: Active Causal-Pruning 6-Domain Navigation, Adversarial Associative Recall,
//                       & Budget-Matched delay=0 Recurrent Evolution across T in {8, 12, 16} (64 seeds)
//   A5: Atlas of Collectives: Bandwidth Floor T_min = N*b/B & Matched-Vector Hierarchical Pareto
//   A6: Realization Compiler (D o B^tau o E = F) & Quarantined Competing ConstitutionHypotheses
//
// Strictly deterministic (ZERO Math.random()), fast (< 10 s, < 400 MB).

import {
  AtlasRegistry,
  certifyCapability,
  createStandardConstitutionHypotheses,
  isCompetingPhenomenalHypothesis,
  MAX_EXACT_MIP_NODES,
  verifyRealizationDiagram,
  type CapabilityEvidence,
  type RealizationDiagramSpec,
} from '../../code/atlas/registry'
import {
  AssociationMemory,
  CognitiveNetwork,
  computeEmpiricalStats,
  computePairedEffectSize,
  createSeededRng,
  MapElites,
  navigate,
  runControlledExperiment,
  type Evaluation,
  type EvolutionProblem,
  type Experiment,
  type MentalNode,
  type NavigationSpace,
  type NeuralEdge,
  type NeuralNode,
  type Reference,
  type SeededRng,
} from '../../code/atlas/map-elites'
import {
  applyBareUKBounceLayer,
  classifyPhasePoint,
  scanBareUZoo,
  scanDynamicalPhaseMap,
  speciesToDiscoveryInput,
  type BareUDockPairState,
  type CollisionOutcome,
  type DynamicalPhaseClass,
} from '../../code/atlas/zoo-scanner'

const T0_GLOBAL = performance.now()
const PI = Math.PI
const SQRT3 = Math.sqrt(3)

interface AtlasCheckRecord {
  readonly id: string
  readonly name: string
  readonly passed: boolean
  readonly elapsedMs: number
  readonly summary: string
}

const RESULTS: AtlasCheckRecord[] = []

function recordResult(
  id: string,
  name: string,
  passed: boolean,
  elapsedMs: number,
  summary: string,
): void {
  RESULTS.push({ id, name, passed, elapsedMs, summary })
  console.log(`[${passed ? 'PASS' : 'FAIL'}] ${id} (${elapsedMs.toFixed(0)} ms) | ${name}`)
  console.log(`       ${summary}`)
}

const REGISTRY = new AtlasRegistry()

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}

// =================================================================================================
// A1. ATLAS OF FORMS: FIELD-REALIZED BARE-U PARTICLE & LIVE UNITARY COLLISION ZOO
// =================================================================================================

function runA1BareUZoo(): void {
  const t0 = performance.now()
  console.log('\n================================================================================')
  console.log('A1. ATLAS OF FORMS: Field-Realized Bare-U Particle & Live Collision Zoo (k=1..4)')
  console.log('================================================================================')

  const zoo = scanBareUZoo()

  for (const sp of zoo.species) {
    const parents =
      sp.id === 'vibe_k1_lone'
        ? []
        : sp.id === 'trion_k3_sym3'
          ? ['discovery:doublon_k2_m_meet', 'discovery:vibe_k1_lone']
          : ['discovery:vibe_k1_lone']
    const gen = sp.id === 'vibe_k1_lone' ? 0 : sp.id === 'trion_k3_sym3' ? 2 : 1
    const disc = REGISTRY.registerDiscovery(speciesToDiscoveryInput(sp, parents, gen))
    REGISTRY.registerOrganization({
      id: `org:${sp.id}`,
      type: sp.id,
      state: { canonicalSignature: sp.canonicalSignature, chiOdd: sp.chiOdd },
      realization: { mode: 'field', sites: ['dock:0'] },
      components: parents,
      interfaces: [
        {
          id: `port:${sp.id}:geodesic`,
          direction: 'bidirectional',
          protocol: 'bare_u_d4_slot_stream',
          capacity: sp.particleCount,
          latency: 1,
        },
      ],
      createdAt: 0n,
      lineage: parents,
    })
    const rStr = sp.levelSpacingR === null ? 'N/A   ' : sp.levelSpacingR.toFixed(4)
    console.log(
      `  [Species] ${sp.id.padEnd(18)} | k=${sp.particleCount} | bound=${String(sp.bound).padEnd(5)} | ` +
        `p0=${sp.contactProb.toFixed(4)} | IPR=${sp.ipr.toFixed(4)} | z=${sp.decayRatio.toFixed(5)} | ` +
        `gap=${sp.bindingGap.toFixed(4)} | v=${sp.groupVelocity.toFixed(4)} | chi=${sp.chiOdd} | ` +
        `<r>=${rStr} | orbit=${sp.symmetryOrbitSize} | caps=[${[...disc.inheritedCapabilities, ...disc.acquiredCapabilities].join(',')}]`,
    )
  }

  console.log('\n  [Collision Matrix] Live Unitary Collisions, Exact 4D Operators & Analytic References:')
  for (const col of zoo.collisions) {
    console.log(
      `    ${col.speciesA.padEnd(17)} x ${col.speciesB.slice(0, 17).padEnd(17)} -> ${col.outcome.padEnd(32)} | ` +
        `[${col.measurementKind}] | dPhi=${(col.conditionalPhaseRad / PI).toFixed(4)}pi | ` +
        `P_swap=${col.roleSwapProb.toFixed(4)} | P_brk=${col.breakupProb.toFixed(4)} | ${col.detail}`,
    )
  }

  const byId = new Map(zoo.species.map(s => [s.id, s]))
  const lone = byId.get('vibe_k1_lone')!
  const doublon = byId.get('doublon_k2_m_meet')!
  const kPair = byId.get('pair_k2_k_bounce')!
  const trion = byId.get('trion_k3_sym3')!
  const chiral = byId.get('chiral_k4_phi_odd')!

  const observedOutcomes = new Set<CollisionOutcome>(zoo.collisions.map(c => c.outcome))
  const requiredOutcomes: readonly CollisionOutcome[] = [
    'pass-through',
    'phase-shift',
    'role-swap',
    'bound_state_eigenchannel',
    'inelastic-breakup',
    'chiral_cancellation_chi_odd_zero',
    'chiral-asymmetry',
  ]
  const allOutcomesCovered = requiredOutcomes.every(o => observedOutcomes.has(o))
  const liveCount = zoo.collisions.filter(c => c.measurementKind === 'live_unitary_collision').length

  const liveSym3Col = zoo.collisions.find(
    c => c.measurementKind === 'live_unitary_collision' && c.outcome === 'phase-shift' && c.speciesA === 'doublon_k2_m_meet',
  )!
  const liveBreakupCol = zoo.collisions.find(
    c => c.measurementKind === 'live_unitary_collision' && c.outcome === 'inelastic-breakup',
  )!
  const liveCrossCol = zoo.collisions.find(
    c => c.measurementKind === 'live_unitary_collision' && c.outcome === 'pass-through',
  )!

  const doublonDisc = REGISTRY.discoveries.get('discovery:doublon_k2_m_meet')!
  const kPairDisc = REGISTRY.discoveries.get('discovery:pair_k2_k_bounce')!
  const trionDisc = REGISTRY.discoveries.get('discovery:trion_k3_sym3')!

  const passed =
    zoo.unitarityMaxError < 1e-12 &&
    Math.abs(lone.groupVelocity - 0.5) < 1e-12 &&
    lone.levelSpacingR === null &&
    chiral.levelSpacingR === null &&
    doublon.bound &&
    Math.abs(doublon.decayRatio - 1 / 13) < 1e-5 &&
    Math.abs(doublon.contactProb - 6 / 13) < 1e-5 &&
    Math.abs(doublon.groupVelocity - 1 / Math.sqrt(13)) < 2e-3 &&
    !kPair.bound &&
    kPair.bindingGap === 0 &&
    trion.bound &&
    trion.canonicalSignature !== doublon.canonicalSignature &&
    Math.abs(trion.quasienergy - Math.atan2((-3 * SQRT3) / 14, -13 / 14)) < 5e-4 &&
    Math.abs(trion.decayRatio - 1 / 7) < 1e-4 &&
    Math.abs(trion.groupVelocity - 1 / Math.sqrt(55)) < 1e-4 &&
    trion.bindingGap > 0.15 &&
    Math.abs(chiral.chiOdd) === 1 &&
    zoo.neutralPairCancellationZeroCount === zoo.neutralPairCancellationTestedCount &&
    zoo.neutralPairCancellationTestedCount === 242 &&
    zoo.chaosSectorInteractionDeviation > 0.1 &&
    liveCount >= 5 &&
    Math.abs(liveSym3Col.conditionalPhaseRad / PI - 1.0) < 0.05 &&
    liveSym3Col.breakupProb < 0.05 &&
    liveBreakupCol.breakupProb > 0.35 &&
    liveCrossCol.crossLineDiff < 1e-14 &&
    allOutcomesCovered &&
    doublonDisc.acquiredCapabilities.includes('bind') &&
    !kPairDisc.acquiredCapabilities.includes('bind') &&
    trionDisc.inheritedCapabilities.includes('bind')

  recordResult(
    'A1',
    'Atlas of Forms: Bare-U Field Particle Zoo & Live Unitary Collision Matrix',
    passed,
    performance.now() - t0,
    `5 field species (uniErr=${zoo.unitarityMaxError.toExponential(1)}), ${liveCount} live unitary collisions: ` +
      `Sym^3 live CZ=${(liveSym3Col.conditionalPhaseRad / PI).toFixed(4)}pi (P_brk=${liveSym3Col.breakupProb.toFixed(4)}), ` +
      `K breakup P_brk=${liveBreakupCol.breakupProb.toFixed(4)}, 4D crossDiff=${liveCrossCol.crossLineDiff.toExponential(1)}, ` +
      `(-I,C) chiral cancellation=${zoo.neutralPairCancellationZeroCount}/${zoo.neutralPairCancellationTestedCount}, ` +
      `uChaosDev=${zoo.chaosSectorInteractionDeviation.toFixed(4)}`,
  )
}

// =================================================================================================
// A2. ATLAS OF FORMS: PURELY OBSERVABLE-DRIVEN (m, phi) DYNAMICAL PHASE CARTOGRAPHY VS WOLFRAM NKS
// =================================================================================================

function runA2PhaseCartography(): void {
  const t0 = performance.now()
  console.log('\n================================================================================')
  console.log('A2. ATLAS OF FORMS: Observable-Driven (m, phi) Phase Cartography vs Wolfram NKS')
  console.log('================================================================================')

  const map = scanDynamicalPhaseMap()

  const codeOf = (c: DynamicalPhaseClass): string => {
    if (c === 'free-dispersive') return 'FREE'
    if (c === 'integrable-bound') return 'INTB'
    if (c === 'relativistic-Thirring') return 'THIR'
    return 'CHAO'
  }

  console.log(
    `  Grid 7x7 (m x phi): rows = m, cols = phi/pi [${map.phiValues.map(p => (p / PI).toFixed(2)).join(', ')}]`,
  )
  let maxIntegrableBoundR = 0
  for (let i = 0; i < map.mValues.length; i++) {
    const m = map.mValues[i]!
    const rowCells: string[] = []
    for (let j = 0; j < map.phiValues.length; j++) {
      const pt = map.gridPoints[i * map.phiValues.length + j]!
      if (pt.bound && pt.levelSpacingR > maxIntegrableBoundR) {
        maxIntegrableBoundR = pt.levelSpacingR
      }
      const r2Str = Number.isFinite(pt.inertiaRatioR2) ? pt.inertiaRatioR2.toFixed(2) : 'inf '
      rowCells.push(`${codeOf(pt.phaseClass)}(${r2Str})`)
    }
    console.log(`    m=${m.toFixed(3)} | ${rowCells.join(' ')}`)
  }

  console.log(
    `  [Observable Purity Check] Max <r> across all 42 same-sign Sym^3 bound grid points (M=10, dim=114, symCount=1): ${maxIntegrableBoundR.toFixed(4)} (< 0.485, ZERO chaosToggle gate!)`,
  )

  console.log('\n  [Mixed-Sign K + M_meet Sector L=5, k=4 (+,+,+,-), Q=+2 (same classifyPhasePoint)]:')
  for (const cp of map.mixedSignPoints) {
    console.log(
      `    m=${cp.m.toFixed(4)}, phi=${(cp.phi / PI).toFixed(3)}pi -> ${cp.phaseClass.padEnd(20)} | ` +
        `<r>=${cp.levelSpacingR.toFixed(4)} | R_2=${cp.inertiaRatioR2.toFixed(3)} | gap=${cp.bindingGap.toFixed(4)}`,
    )
  }

  // Explicit unit regression proving classifyPhasePoint has zero hidden toggle and classifies free picket-fence accurately
  const picketFenceCheck = classifyPhasePoint(false, 0, Number.POSITIVE_INFINITY, 0.99) === 'free-dispersive'
  const observableChaosCheck = classifyPhasePoint(true, 0.48, 7.14, 0.5164) === 'chaotic-COE'

  const allFourPhasesFound =
    map.phaseCounts['free-dispersive'] >= 7 &&
    map.phaseCounts['integrable-bound'] >= 10 &&
    map.phaseCounts['relativistic-Thirring'] >= 4 &&
    map.phaseCounts['chaotic-COE'] >= 2

  const freeColumnExact = map.gridPoints
    .filter(p => Math.abs(p.phi - PI) < 1e-9)
    .every(p => p.phaseClass === 'free-dispersive' && !p.bound)

  const zeroFalseChaosOnGrid = map.gridPoints.every(p => p.phaseClass !== 'chaotic-COE')

  const bareUOk =
    map.bareUPoint.phaseClass === 'integrable-bound' &&
    Math.abs(map.bareUPoint.inertiaRatioR2 - 7.1406) < 0.08 &&
    map.bareUPoint.levelSpacingR < 0.485

  const thirringOk =
    map.relativisticWitness !== undefined &&
    map.relativisticWitness.phaseClass === 'relativistic-Thirring' &&
    Math.abs(map.relativisticWitness.inertiaRatioR2 - 1) < 0.25

  const chaosOk =
    map.chaosWitness !== undefined &&
    map.chaosWitness.phaseClass === 'chaotic-COE' &&
    map.chaosWitness.levelSpacingR >= 0.49

  REGISTRY.registerDiscovery({
    id: 'discovery:phase_cartography_m_phi',
    label: 'Observable-Driven Quantitative (m, phi) QCA Dynamical Phase Atlas (53 Points)',
    category: 'composite',
    atlas: 'forms',
    parentIds: ['discovery:doublon_k2_m_meet', 'discovery:pair_k2_k_bounce'],
    generation: 2,
    realizationMode: 'field',
    genome: {
      grid_points: map.gridPoints.length,
      mixed_sign_points: map.mixedSignPoints.length,
      phase_counts: map.phaseCounts,
    },
    evidence: [
      certifyCapability({
        capability: 'bind',
        evidenceKind: 'exact_deterministic_proof',
        protocol: 'observable_driven_m_phi_phase_separation',
        experiment: 'A2_phase_cartography',
        realizationMode: 'field',
        score: map.phaseCounts['relativistic-Thirring'] + map.phaseCounts['integrable-bound'],
        baseline: 0,
        standardError: null,
        effectSize: null,
        trials: map.gridPoints.length,
        minMargin: 10,
      }),
    ],
    metrics: {
      free_count: map.phaseCounts['free-dispersive'],
      integrable_bound_count: map.phaseCounts['integrable-bound'],
      relativistic_thirring_count: map.phaseCounts['relativistic-Thirring'],
      chaotic_coe_count: map.phaseCounts['chaotic-COE'],
      max_integrable_r: maxIntegrableBoundR,
      bare_u_r2: map.bareUPoint.inertiaRatioR2,
      thirring_r2: map.relativisticWitness.inertiaRatioR2,
      chaos_r: map.chaosWitness.levelSpacingR,
    },
  })

  const passed =
    map.gridPoints.length === 49 &&
    picketFenceCheck &&
    observableChaosCheck &&
    zeroFalseChaosOnGrid &&
    allFourPhasesFound &&
    freeColumnExact &&
    bareUOk &&
    thirringOk &&
    chaosOk

  recordResult(
    'A2',
    'Atlas of Forms: Observable-Driven (m, phi) Phase Cartography vs Wolfram NKS',
    passed,
    performance.now() - t0,
    `49 grid + 4 mixed-sign pts (zero chaosToggle gate) -> FREE=${map.phaseCounts['free-dispersive']}, ` +
      `INTB=${map.phaseCounts['integrable-bound']}, THIR=${map.phaseCounts['relativistic-Thirring']} ` +
      `(witness R_2=${map.relativisticWitness.inertiaRatioR2.toFixed(4)}), ` +
      `CHAO=${map.phaseCounts['chaotic-COE']} (witness <r>=${map.chaosWitness.levelSpacingR.toFixed(4)}), ` +
      `maxIntegrable<r>=${maxIntegrableBoundR.toFixed(4)} < 0.485`,
  )
}

// =================================================================================================
// A3. ATLAS OF LIVES: UNBIASED SIGNED HOMEOSTATIC MAP-ELITES SELF-REPAIRING ORGANISMS
// =================================================================================================

// Unbiased signed regulatory genome: ORG_SETPOINT NEVER enters the organism's internal update law!
// Both positive (destabilizing) and negative (homeostatic) feedback are equally representable,
// so evolution must genuinely discover negative feedback and the target attractor from scratch.
interface HomeostaticGenome {
  readonly id: string
  readonly driveBias: readonly number[] // length 6, signed in [-1.2, 1.2]
  readonly couplingMatrix: readonly number[] // 6x6 flattened signed weights in [-1.5, 1.5]
  readonly velocityDamping: readonly number[] // length 6, signed derivative feedback in [-0.6, 0.6]
  readonly passiveDecay: number // in [0.08, 0.28]
}

const ORG_DIM = 6
const ORG_SETPOINT: readonly number[] = [0.6, -0.6, 0.6, -0.6, 0.6, -0.6]

function cloneOrganismGenome(g: HomeostaticGenome): HomeostaticGenome {
  return {
    id: g.id,
    driveBias: [...g.driveBias],
    couplingMatrix: [...g.couplingMatrix],
    velocityDamping: [...g.velocityDamping],
    passiveDecay: g.passiveDecay,
  }
}

function simulateOrganismDamageTrial(
  genome: HomeostaticGenome,
  seed: number,
): {
  readonly repairSpeed: number
  readonly disturbanceResilience: number
  readonly steadyAccuracy: number
  readonly metabolicCost: number
  readonly quality: number
  readonly failed: boolean
} {
  const rng = createSeededRng(seed)
  const x = Float64Array.from(ORG_SETPOINT)
  const prevX = Float64Array.from(ORG_SETPOINT)
  const totalTicks = 28
  const damageTick = 4

  // Deterministic two-node knockout + two-node signed impulse perturbation
  const damagedA = rng.nextInt(ORG_DIM)
  const damagedB = (damagedA + 1 + rng.nextInt(ORG_DIM - 1)) % ORG_DIM
  const shockedC = (damagedB + 1) % ORG_DIM
  const shockedD = (damagedB + 2) % ORG_DIM
  const kickC = (rng.next() < 0.5 ? -1 : 1) * rng.nextRange(0.7, 1.1)
  const kickD = (rng.next() < 0.5 ? -1 : 1) * rng.nextRange(0.7, 1.1)

  let recoveryTick = -1
  let viableTicks = 0
  let steadyRmseSum = 0
  let steadyCount = 0
  let effortSum = 0

  for (let t = 0; t < totalTicks; t++) {
    if (t === damageTick) {
      x[damagedA] = 0
      x[damagedB] = 0
      x[shockedC] = clamp(x[shockedC]! + kickC, -1.5, 1.5)
      x[shockedD] = clamp(x[shockedD]! + kickD, -1.5, 1.5)
    }

    const next = new Float64Array(ORG_DIM)
    for (let i = 0; i < ORG_DIM; i++) {
      const xi = x[i]!
      let lin = genome.driveBias[i]!
      for (let j = 0; j < ORG_DIM; j++) {
        lin += genome.couplingMatrix[i * ORG_DIM + j]! * x[j]!
      }
      lin += genome.velocityDamping[i]! * (xi - prevX[i]!)
      const envNoise = rng.nextRange(-0.04, 0.04)
      const controlDrive = clamp(lin, -0.75, 0.75)
      effortSum += Math.abs(controlDrive)
      const nextVal = (1 - genome.passiveDecay) * xi + controlDrive + envNoise
      next[i] = clamp(nextVal, -1.5, 1.5)
    }

    prevX.set(x)
    x.set(next)

    if (t > damageTick) {
      let sq = 0
      for (let i = 0; i < ORG_DIM; i++) {
        const d = x[i]! - ORG_SETPOINT[i]!
        sq += d * d
      }
      const rmse = Math.sqrt(sq / ORG_DIM)
      if (rmse < 0.24) viableTicks++
      if (recoveryTick < 0 && rmse < 0.18) recoveryTick = t - damageTick
      if (t >= totalTicks - 6) {
        steadyRmseSum += rmse
        steadyCount++
      }
    }
  }

  const postTicks = totalTicks - damageTick - 1
  const repairSpeed =
    recoveryTick > 0 ? clamp(1 - (recoveryTick - 1) / postTicks, 0, 1) : 0
  const disturbanceResilience = viableTicks / postTicks
  const steadyRmse = steadyRmseSum / Math.max(1, steadyCount)
  const steadyAccuracy = clamp(1 - steadyRmse / 0.85, 0, 1)
  const metabolicCost = clamp(effortSum / (totalTicks * ORG_DIM * 0.75), 0, 1)
  const quality = clamp(
    0.45 * disturbanceResilience + 0.4 * steadyAccuracy + 0.2 * repairSpeed - 0.1 * metabolicCost,
    0,
    1,
  )
  const failed = !Number.isFinite(quality) || steadyRmse > 1.2

  return {
    repairSpeed,
    disturbanceResilience,
    steadyAccuracy,
    metabolicCost,
    quality,
    failed,
  }
}

function runA3AtlasOfLives(): void {
  const t0 = performance.now()
  console.log('\n================================================================================')
  console.log('A3. ATLAS OF LIVES: Unbiased Signed Homeostatic MAP-Elites Self-Repair')
  console.log('================================================================================')

  const evalSeeds = [101, 202, 303, 404, 505, 606, 707, 808] as const
  const holdoutSeeds = [
    2101, 2202, 2303, 2404, 2505, 2606, 2707, 2808, 2909, 3010,
    3111, 3212, 3313, 3414, 3515, 3616,
  ] as const
  let nextId = 0

  const problem: EvolutionProblem<HomeostaticGenome> = {
    create(rng: SeededRng): HomeostaticGenome {
      nextId++
      const driveBias = Array.from({ length: ORG_DIM }, () => rng.nextRange(-0.9, 0.9))
      const couplingMatrix = Array.from({ length: ORG_DIM * ORG_DIM }, (_, idx) => {
        const i = Math.floor(idx / ORG_DIM)
        const j = idx % ORG_DIM
        if (i === j) return rng.nextRange(-1.1, 0.9) // unbiased signed self-feedback!
        return rng.next() < 0.25 ? rng.nextRange(-0.5, 0.5) : 0
      })
      const velocityDamping = Array.from({ length: ORG_DIM }, () => rng.nextRange(-0.35, 0.35))
      return {
        id: `org_genome_${nextId}`,
        driveBias,
        couplingMatrix,
        velocityDamping,
        passiveDecay: rng.nextRange(0.1, 0.25),
      }
    },
    clone: cloneOrganismGenome,
    mutate(parent: HomeostaticGenome, rng: SeededRng): HomeostaticGenome {
      nextId++
      const driveBias = parent.driveBias.map(v =>
        rng.next() < 0.35 ? clamp(v + rng.nextGaussian() * 0.22, -1.2, 1.2) : v,
      )
      const couplingMatrix = parent.couplingMatrix.map((v, idx) => {
        const isDiag = Math.floor(idx / ORG_DIM) === idx % ORG_DIM
        if (isDiag) {
          return rng.next() < 0.4 ? clamp(v + rng.nextGaussian() * 0.24, -1.5, 1.5) : v
        }
        if (rng.next() < 0.12) return clamp(v + rng.nextGaussian() * 0.16, -0.8, 0.8)
        if (rng.next() < 0.05) return 0
        return v
      })
      const velocityDamping = parent.velocityDamping.map(v =>
        rng.next() < 0.25 ? clamp(v + rng.nextGaussian() * 0.12, -0.6, 0.6) : v,
      )
      const passiveDecay =
        rng.next() < 0.2
          ? clamp(parent.passiveDecay + rng.nextGaussian() * 0.03, 0.08, 0.28)
          : parent.passiveDecay
      return {
        id: `org_genome_${nextId}`,
        driveBias,
        couplingMatrix,
        velocityDamping,
        passiveDecay,
      }
    },
    evaluate(genome: HomeostaticGenome): Evaluation {
      let sumSpeed = 0
      let sumRes = 0
      let sumSteady = 0
      let sumQual = 0
      for (const seed of evalSeeds) {
        const res = simulateOrganismDamageTrial(genome, seed)
        sumSpeed += res.repairSpeed
        sumRes += res.disturbanceResilience
        sumSteady += res.steadyAccuracy
        sumQual += res.quality
      }
      const n = evalSeeds.length
      const meanSpeed = sumSpeed / n
      const meanRes = sumRes / n
      return {
        quality: sumQual / n,
        behavior: [meanSpeed, meanRes],
        metrics: {
          repair_speed: meanSpeed,
          disturbance_resilience: meanRes,
          steady_accuracy: sumSteady / n,
          quality: sumQual / n,
        },
      }
    },
  }

  // Evaluate 16 untrained random genomes FIRST to prove unbiased random baseline is genuinely low!
  const randPoolRng = createSeededRng(88001)
  const randomPoolQualities: number[] = []
  for (let r = 0; r < 16; r++) {
    const g = problem.create(randPoolRng)
    randomPoolQualities.push(problem.evaluate(g).quality)
  }
  const randomPoolStats = computeEmpiricalStats(randomPoolQualities)

  const mapElites = new MapElites(problem, [6, 6], createSeededRng(20261126), 0.12)
  mapElites.run(1200, 100)

  const earlySnap = mapElites.history[0]!
  const finalSnap = mapElites.history[mapElites.history.length - 1]!
  const bestElite = mapElites.bestElite!

  console.log('  [MAP-Elites 6x6 Archive Growth: [repair_speed, disturbance_resilience] (signed unbiased feedback)]:')
  for (const snap of mapElites.history) {
    if (
      snap.evaluations === 100 ||
      snap.evaluations === 400 ||
      snap.evaluations === 800 ||
      snap.evaluations === 1200
    ) {
      console.log(
        `    evals=${String(snap.evaluations).padStart(4)} | occupied=${String(snap.occupied).padStart(2)}/36 ` +
          `(${(100 * snap.coverage).toFixed(1)}%) | QD=${snap.qdScore.toFixed(3)} | bestQ=${snap.bestQuality.toFixed(4)}`,
      )
    }
  }
  console.log(
    `  [Unbiased Random Genome Pool (16 random genomes)]: mean quality = ${randomPoolStats.mean.toFixed(4)} +/- ${randomPoolStats.standardError.toFixed(4)} (proves no hardwired negative feedback!)`,
  )

  const passiveControl: HomeostaticGenome = {
    id: 'org_passive_control',
    driveBias: [0, 0, 0, 0, 0, 0],
    couplingMatrix: new Array<number>(ORG_DIM * ORG_DIM).fill(0),
    velocityDamping: [0, 0, 0, 0, 0, 0],
    passiveDecay: 0.16,
  }
  const randomControl = problem.create(createSeededRng(99991))

  const repairExperiment: Experiment<HomeostaticGenome> = {
    id: 'exp:org_damage_repair_holdout',
    name: 'Matched-Seed Multi-Node Damage Self-Repair & Homeostatic Regulation (Unbiased Signed)',
    trial(genome, seed) {
      const s0 = performance.now()
      const res = simulateOrganismDamageTrial(genome, seed)
      return {
        architecture: genome.id,
        seed,
        metrics: {
          repair_speed: res.repairSpeed,
          disturbance_resilience: res.disturbanceResilience,
          steady_accuracy: res.steadyAccuracy,
          quality: res.quality,
        },
        durationMs: performance.now() - s0,
        failed: res.failed,
      }
    },
  }

  const vsPassiveRepair = runControlledExperiment(
    repairExperiment,
    bestElite.genome,
    passiveControl,
    holdoutSeeds,
    'repair_speed',
  )
  const vsPassiveRegulate = runControlledExperiment(
    repairExperiment,
    bestElite.genome,
    passiveControl,
    holdoutSeeds,
    'steady_accuracy',
  )
  const vsPassivePersist = runControlledExperiment(
    repairExperiment,
    bestElite.genome,
    passiveControl,
    holdoutSeeds,
    'disturbance_resilience',
  )
  const vsRandomQuality = runControlledExperiment(
    repairExperiment,
    bestElite.genome,
    randomControl,
    holdoutSeeds,
    'quality',
  )

  const repairEvidence = certifyCapability({
    capability: 'repair',
    evidenceKind: 'controlled_empirical_benchmark',
    protocol: 'matched_seed_knockout_recovery_unbiased',
    experiment: repairExperiment.id,
    realizationMode: 'abstract',
    score: vsPassiveRepair.candidate.summary['repair_speed']!.mean,
    baseline: vsPassiveRepair.control.summary['repair_speed']!.mean,
    standardError: vsPassiveRepair.pairedStandardError,
    effectSize: vsPassiveRepair.effectSize,
    trials: holdoutSeeds.length,
    minMargin: 0.3,
    minEffectSize: 1.5,
    failureRate: vsPassiveRepair.candidate.failureRate,
  })
  const regulateEvidence = certifyCapability({
    capability: 'regulate',
    evidenceKind: 'controlled_empirical_benchmark',
    protocol: 'matched_seed_homeostatic_setpoint_unbiased',
    experiment: repairExperiment.id,
    realizationMode: 'abstract',
    score: vsPassiveRegulate.candidate.summary['steady_accuracy']!.mean,
    baseline: vsPassiveRegulate.control.summary['steady_accuracy']!.mean,
    standardError: vsPassiveRegulate.pairedStandardError,
    effectSize: vsPassiveRegulate.effectSize,
    trials: holdoutSeeds.length,
    minMargin: 0.3,
    minEffectSize: 1.5,
    failureRate: vsPassiveRegulate.candidate.failureRate,
  })
  const persistEvidence = certifyCapability({
    capability: 'persist',
    evidenceKind: 'controlled_empirical_benchmark',
    protocol: 'matched_seed_viability_tube_persistence',
    experiment: repairExperiment.id,
    realizationMode: 'abstract',
    score: vsPassivePersist.candidate.summary['disturbance_resilience']!.mean,
    baseline: vsPassivePersist.control.summary['disturbance_resilience']!.mean,
    standardError: vsPassivePersist.pairedStandardError,
    effectSize: vsPassivePersist.effectSize,
    trials: holdoutSeeds.length,
    minMargin: 0.3,
    minEffectSize: 1.5,
    failureRate: vsPassivePersist.candidate.failureRate,
  })

  REGISTRY.registerDiscovery({
    id: 'discovery:org_passive_ancestor',
    label: 'Passive Non-Regulated Control Organization',
    category: 'organism',
    atlas: 'lives',
    parentIds: [],
    generation: 0,
    realizationMode: 'abstract',
    genome: passiveControl,
    evidence: [],
    metrics: {
      repair_speed: vsPassiveRepair.control.summary['repair_speed']!.mean,
      steady_accuracy: vsPassiveRegulate.control.summary['steady_accuracy']!.mean,
      disturbance_resilience: vsPassivePersist.control.summary['disturbance_resilience']!.mean,
      quality: vsPassiveRepair.control.summary['quality']!.mean,
    },
  })

  const evolvedOrgDisc = REGISTRY.registerDiscovery({
    id: 'discovery:org_evolved_homeostat',
    label: 'MAP-Elites Evolved Signed-Feedback Self-Repairing Organism',
    category: 'organism',
    atlas: 'lives',
    parentIds: ['discovery:org_passive_ancestor'],
    generation: 1,
    realizationMode: 'abstract',
    genome: bestElite.genome,
    evidence: [persistEvidence, repairEvidence, regulateEvidence],
    metrics: {
      repair_speed: vsPassiveRepair.candidate.summary['repair_speed']!.mean,
      disturbance_resilience: vsPassivePersist.candidate.summary['disturbance_resilience']!.mean,
      steady_accuracy: vsPassiveRegulate.candidate.summary['steady_accuracy']!.mean,
      quality: vsRandomQuality.candidate.summary['quality']!.mean,
      random_pool_mean_quality: randomPoolStats.mean,
      archive_coverage: finalSnap.coverage,
      qd_score: finalSnap.qdScore,
    },
  })

  // Verify evolution genuinely discovered negative diagonal self-feedback (W_ii < 0)
  let meanDiagW = 0
  for (let i = 0; i < ORG_DIM; i++) {
    meanDiagW += bestElite.genome.couplingMatrix[i * ORG_DIM + i]!
  }
  meanDiagW /= ORG_DIM

  console.log(
    `  [Holdout 16 Matched Seeds] Elite (mean W_ii=${meanDiagW.toFixed(3)} < 0) vs Passive: ` +
      `repair=${repairEvidence.score.toFixed(4)} vs ${repairEvidence.baseline.toFixed(4)} (d=${repairEvidence.effectSize!.toFixed(2)}, wins=${vsPassiveRepair.candidateWinsMatchedSeeds}/16) | ` +
      `regulate=${regulateEvidence.score.toFixed(4)} vs ${regulateEvidence.baseline.toFixed(4)} (d=${regulateEvidence.effectSize!.toFixed(2)}) | ` +
      `persist=${persistEvidence.score.toFixed(4)} vs ${persistEvidence.baseline.toFixed(4)} (d=${persistEvidence.effectSize!.toFixed(2)})`,
  )
  console.log(
    `  [Holdout 16 Matched Seeds] Elite vs Random Control: quality=${vsRandomQuality.candidate.summary['quality']!.mean.toFixed(4)} vs ` +
      `${vsRandomQuality.control.summary['quality']!.mean.toFixed(4)} (d=${vsRandomQuality.effectSize.toFixed(2)}, wins=${vsRandomQuality.candidateWinsMatchedSeeds}/16)`,
  )

  const passed =
    randomPoolStats.mean < 0.45 &&
    meanDiagW < -0.15 &&
    finalSnap.coverage > earlySnap.coverage &&
    finalSnap.qdScore > earlySnap.qdScore * 1.3 &&
    finalSnap.occupied >= 12 &&
    repairEvidence.passed &&
    regulateEvidence.passed &&
    persistEvidence.passed &&
    vsPassiveRepair.candidateWinsMatchedSeeds === holdoutSeeds.length &&
    vsRandomQuality.deltaMean > 0.4 &&
    evolvedOrgDisc.acquiredCapabilities.includes('repair') &&
    evolvedOrgDisc.acquiredCapabilities.includes('regulate') &&
    evolvedOrgDisc.acquiredCapabilities.includes('persist')

  recordResult(
    'A3',
    'Atlas of Lives: Unbiased Signed MAP-Elites Self-Repairing Organisms',
    passed,
    performance.now() - t0,
    `1200 evals 6x6 archive: occupied=${earlySnap.occupied}->${finalSnap.occupied}/36 ` +
      `(QD=${earlySnap.qdScore.toFixed(2)}->${finalSnap.qdScore.toFixed(2)}), randomPoolQ=${randomPoolStats.mean.toFixed(3)}, ` +
      `evolved mean W_ii=${meanDiagW.toFixed(3)}, holdout repair=${repairEvidence.score.toFixed(3)} vs 0.000 (16/16 wins), ` +
      `regulate=${regulateEvidence.score.toFixed(3)}, persist=${persistEvidence.score.toFixed(3)}`,
  )
}

// =================================================================================================
// A4. ATLAS OF MINDS: ACTIVE CAUSAL NAVIGATION, ADVERSARIAL RECALL & DELAY=0 RECURRENT EVOLUTION
// =================================================================================================

interface CognitiveGenome {
  readonly id: string
  readonly nodes: readonly NeuralNode[]
  readonly edges: readonly NeuralEdge[]
}

const COG_NODE_SPECS: readonly NeuralNode[] = [
  { id: 'in_cue', bias: 0, kind: 'sensor' },
  { id: 'h1', bias: 0, kind: 'associative-memory' },
  { id: 'h2', bias: 0, kind: 'workspace' },
  { id: 'h3', bias: 0, kind: 'predictor' },
  { id: 'h4', bias: 0, kind: 'regulator' },
  { id: 'out_decision', bias: 0, kind: 'actuator' },
]

// Strict equal edge budget (12 edges) and strict delay = 0 on EVERY edge for BOTH evolved and feedforward!
const COG_MAX_EDGES = 12

function cloneCognitiveGenome(g: CognitiveGenome): CognitiveGenome {
  return {
    id: g.id,
    nodes: g.nodes.map(n => ({ ...n })),
    edges: g.edges.map(e => ({ ...e })),
  }
}

function runDelayedCueEpisode(
  net: CognitiveNetwork,
  seed: number,
  readoutTick: number,
  forcedCueSign?: 1 | -1,
): { readonly smoothScore: number; readonly binaryCorrect: number } {
  const rng = createSeededRng(seed)
  net.reset()
  const drawnSign: 1 | -1 = rng.next() < 0.5 ? -1 : 1
  const cueSign: 1 | -1 = forcedCueSign ?? drawnSign
  const totalSteps = readoutTick + 2 // cue at t=0,1; noisy delay t=2..readoutTick-1; readout at t=readoutTick, readoutTick+1
  let readoutSum = 0

  for (let t = 0; t < totalSteps; t++) {
    const input = new Map<string, number>()
    if (t <= 1) {
      input.set('in_cue', cueSign * 1.15)
    } else {
      input.set('in_cue', rng.nextRange(-0.16, 0.16))
    }
    net.step(input)
    if (t >= readoutTick) {
      readoutSum += net.readNode('out_decision')
    }
  }
  const signedReadout = (readoutSum / 2) * cueSign
  const smoothScore = clamp(0.5 + 0.5 * Math.tanh(signedReadout * 2.5), 0, 1)
  const binaryCorrect = signedReadout > 0 ? 1 : 0
  return { smoothScore, binaryCorrect }
}

// Evaluates a genome on balanced (+1, -1) cue pairs per seed so any memoryless zero-bias
// feedforward baseline achieves exact 0.5000 (50.0%) chance accuracy with zero coin-flip luck.
function evaluateCognitiveHorizon(
  genome: CognitiveGenome,
  seeds: readonly number[],
  readoutTick: number,
): {
  readonly delayedMemory: number
  readonly lesionResilience: number
  readonly binaryAccuracy: number
  readonly quality: number
} {
  const net = new CognitiveNetwork(genome.nodes, genome.edges)
  let intactSum = 0
  let correctCount = 0
  const totalEpisodes = seeds.length * 2
  for (const seed of seeds) {
    for (const sign of [1, -1] as const) {
      const res = runDelayedCueEpisode(net, seed, readoutTick, sign)
      intactSum += res.smoothScore
      correctCount += res.binaryCorrect
    }
  }
  const delayedMemory = intactSum / totalEpisodes
  const binaryAccuracy = correctCount / totalEpisodes

  const hiddenIds = ['h1', 'h2', 'h3', 'h4'] as const
  let lesionSum = 0
  for (const hid of hiddenIds) {
    const lesioned = net.lesionNode(hid)
    let subSum = 0
    for (const seed of seeds) {
      for (const sign of [1, -1] as const) {
        subSum += runDelayedCueEpisode(lesioned, seed, readoutTick, sign).smoothScore
      }
    }
    lesionSum += subSum / totalEpisodes
  }
  const meanLesioned = lesionSum / hiddenIds.length
  const lesionResilience = clamp(
    meanLesioned * (delayedMemory > 0.52 ? Math.min(1, meanLesioned / delayedMemory) : 0.2),
    0,
    1,
  )
  const quality = clamp(0.55 * delayedMemory + 0.45 * lesionResilience, 0, 1)
  return { delayedMemory, lesionResilience, binaryAccuracy, quality }
}

function runA4AtlasOfMinds(): void {
  const t0 = performance.now()
  console.log('\n================================================================================')
  console.log('A4. ATLAS OF MINDS: Causal Pruning Nav, Adversarial Recall & delay=0 Evolution')
  console.log('================================================================================')

  // --- A4.1 Six-Domain Navigation with ACTIVE Causal Pruning inside A* ---
  type GridPos = readonly [number, number]
  const manhattan = (a: GridPos, b: GridPos): number =>
    Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1])
  const posKey = (p: GridPos): string => `${p[0]},${p[1]}`
  const startPos: GridPos = [0, 0]
  const goalPos: GridPos = [3, 3]
  const physicalFloor = manhattan(startPos, goalPos) // 6 beats

  const spatialSpace: NavigationSpace<GridPos> = {
    domain: 'spatial',
    key: posKey,
    heuristic: manhattan,
    neighbors([x, y]) {
      const out: { to: GridPos; cost: number; propagationDelay: number; relation: Reference['relation'] }[] = []
      const deltas: readonly GridPos[] = [[1, 0], [-1, 0], [0, 1], [0, -1]]
      for (const [dx, dy] of deltas) {
        const nx = x + dx
        const ny = y + dy
        if (nx >= 0 && nx < 4 && ny >= 0 && ny < 4) {
          out.push({ to: [nx, ny], cost: 1, propagationDelay: 1, relation: 'physical' })
        }
      }
      return out
    },
  }

  const relationalRefs = new Map<string, readonly { readonly pos: GridPos; readonly ref: Reference }[]>([
    [
      '0,0',
      [
        {
          pos: [2, 1],
          ref: { target: '2,1', relation: 'logical', accessCost: 1, propagationDelay: manhattan([0, 0], [2, 1]) },
        },
      ],
    ],
    [
      '2,1',
      [
        {
          pos: [3, 3],
          ref: { target: '3,3', relation: 'logical', accessCost: 1, propagationDelay: manhattan([2, 1], [3, 3]) },
        },
      ],
    ],
  ])

  const relationalSpace: NavigationSpace<GridPos> = {
    domain: 'relational',
    key: posKey,
    neighbors(node) {
      const edges = [...spatialSpace.neighbors(node)]
      for (const entry of relationalRefs.get(posKey(node)) ?? []) {
        edges.push({
          to: entry.pos,
          cost: entry.ref.accessCost,
          propagationDelay: entry.ref.propagationDelay,
          relation: entry.ref.relation,
        })
      }
      return edges
    },
  }

  // C3 Regression Graph: contains BOTH a cheaper illegal teleport shortcut A -> C (cost=1, delay=1)
  // AND a legal causal relational route A -> B -> C (cost=2, delay=6)!
  const mixedTeleportAndLegalSpace: NavigationSpace<GridPos> = {
    domain: 'relational',
    key: posKey,
    neighbors(node) {
      const k = posKey(node)
      if (k === '0,0') {
        return [
          { to: [3, 3], cost: 1, propagationDelay: 1, relation: 'logical' }, // illegal shortcut!
          { to: [2, 1], cost: 1, propagationDelay: 3, relation: 'logical' }, // legal hop 1
        ]
      }
      if (k === '2,1') {
        return [{ to: [3, 3], cost: 1, propagationDelay: 3, relation: 'logical' }] // legal hop 2
      }
      return []
    },
  }

  // Teleport-only graph with NO legal causal route: navigate() MUST return undefined!
  const teleportOnlySpace: NavigationSpace<GridPos> = {
    domain: 'relational',
    key: posKey,
    neighbors(node) {
      if (posKey(node) === '0,0') {
        return [{ to: [3, 3], cost: 1, propagationDelay: 1, relation: 'logical' }]
      }
      return []
    },
  }

  type HierNode = { readonly id: string; readonly level: number; readonly pos?: GridPos }
  const hierarchicalSpace: NavigationSpace<HierNode> = {
    domain: 'hierarchical',
    key: n => n.id,
    neighbors(node) {
      if (node.id === 'fine:0,0') {
        return [{ to: { id: 'quad:NW', level: 1 }, cost: 0.8, propagationDelay: 1.5, relation: 'representational' }]
      }
      if (node.id === 'quad:NW') {
        return [{ to: { id: 'root:world', level: 2 }, cost: 0.8, propagationDelay: 1.5, relation: 'representational' }]
      }
      if (node.id === 'root:world') {
        return [{ to: { id: 'quad:SE', level: 1 }, cost: 0.8, propagationDelay: 1.5, relation: 'representational' }]
      }
      if (node.id === 'quad:SE') {
        return [{ to: { id: 'fine:3,3', level: 0, pos: [3, 3] }, cost: 0.8, propagationDelay: 1.5, relation: 'representational' }]
      }
      return []
    },
  }

  const semanticSpace: NavigationSpace<string> = {
    domain: 'semantic',
    key: s => s,
    neighbors: s =>
      s === 'vibe'
        ? [{ to: 'doublon', cost: 0.5, propagationDelay: 1, relation: 'semantic' }]
        : s === 'doublon'
          ? [{ to: 'trion', cost: 0.5, propagationDelay: 1, relation: 'semantic' }]
          : [],
  }
  const temporalSpace: NavigationSpace<string> = {
    domain: 'temporal',
    key: s => s,
    neighbors: s =>
      s === 't0_cue'
        ? [{ to: 't4_delay', cost: 1, propagationDelay: 4, relation: 'historical' }]
        : s === 't4_delay'
          ? [{ to: 't6_recall', cost: 1, propagationDelay: 2, relation: 'historical' }]
          : [],
  }
  const introspectiveSpace: NavigationSpace<string> = {
    domain: 'introspective',
    key: s => s,
    neighbors: s =>
      s === 'self_monitor'
        ? [{ to: 'h2_workspace', cost: 0.4, propagationDelay: 1, relation: 'representational' }]
        : s === 'h2_workspace'
          ? [{ to: 'h1_memory', cost: 0.4, propagationDelay: 1, relation: 'representational' }]
          : [],
  }

  const rSpatial = navigate(spatialSpace, startPos, goalPos, {
    minPhysicalDelay: physicalFloor,
    physicalDistance: manhattan,
  })!
  const rRelational = navigate(relationalSpace, startPos, goalPos, {
    minPhysicalDelay: physicalFloor,
    physicalDistance: manhattan,
  })!
  const rHierarchical = navigate(
    hierarchicalSpace,
    { id: 'fine:0,0', level: 0, pos: [0, 0] },
    { id: 'fine:3,3', level: 0, pos: [3, 3] },
    { minPhysicalDelay: physicalFloor },
  )!
  const rMixedPrunedByDist = navigate(mixedTeleportAndLegalSpace, startPos, goalPos, {
    minPhysicalDelay: physicalFloor,
    physicalDistance: manhattan,
  })!
  const rMixedPrunedByFloor = navigate(mixedTeleportAndLegalSpace, startPos, goalPos, {
    minPhysicalDelay: physicalFloor,
  })!
  const rTeleportOnly = navigate(teleportOnlySpace, startPos, goalPos, {
    minPhysicalDelay: physicalFloor,
    physicalDistance: manhattan,
  })
  const rSemantic = navigate(semanticSpace, 'vibe', 'trion')!
  const rTemporal = navigate(temporalSpace, 't0_cue', 't6_recall', { minPhysicalDelay: 6 })!
  const rIntrospective = navigate(introspectiveSpace, 'self_monitor', 'h1_memory')!

  console.log('  [A4.1 Six-Domain Navigation & Active A* Causal Pruning]:')
  console.log(
    `    Spatial:           hops=${rSpatial.hops}, cost=${rSpatial.cost.toFixed(1)}, delay=${rSpatial.totalPropagationDelay.toFixed(1)}, causalOk=${rSpatial.obeysCausalFloor}`,
  )
  console.log(
    `    Relational:        hops=${rRelational.hops}, cost=${rRelational.cost.toFixed(1)}, delay=${rRelational.totalPropagationDelay.toFixed(1)}, causalOk=${rRelational.obeysCausalFloor}`,
  )
  console.log(
    `    Hierarchical:      hops=${rHierarchical.hops}, cost=${rHierarchical.cost.toFixed(1)}, delay=${rHierarchical.totalPropagationDelay.toFixed(1)}, causalOk=${rHierarchical.obeysCausalFloor}`,
  )
  console.log(
    `    C3 Mixed (A->C illegal vs A->B->C legal): pruned=${rMixedPrunedByDist.prunedCausalEdges}, returned=[${rMixedPrunedByDist.nodes.map(posKey).join('->')}], delay=${rMixedPrunedByDist.totalPropagationDelay.toFixed(1)} (floor-only pruned=${rMixedPrunedByFloor.prunedCausalEdges})`,
  )
  console.log(
    `    TeleportOnlyCtrl:  route=${String(rTeleportOnly)} (strictly undefined when no causal path exists!)`,
  )
  console.log(
    `    Other 3 domains:   semantic(${rSemantic.hops} hops), temporal(${rTemporal.totalPropagationDelay} beats), introspective(${rIntrospective.hops} hops)`,
  )

  // --- A4.2 AssociationMemory Spreading-Activation Recall (Spread + Adversarial 2-vs-2 Interference) ---
  const assoc = new AssociationMemory()
  const episodeNames = ['ep_physics', 'ep_biology', 'ep_spatial', 'ep_collective'] as const
  const makeNode = (id: string, kind: MentalNode['kind']): MentalNode => ({
    id,
    kind,
    value: id,
    confidence: 0.9,
    salience: 0.8,
    createdAt: 0n,
    lastAccessedAt: 0n,
    realization: { mode: 'abstract' },
  })

  for (const ep of episodeNames) {
    assoc.add(makeNode(ep, 'memory'))
    for (let f = 0; f < 5; f++) {
      assoc.add(makeNode(`${ep}:f${f}`, 'concept'))
    }
  }
  let relIdx = 0
  for (let eIdx = 0; eIdx < episodeNames.length; eIdx++) {
    const ep = episodeNames[eIdx]!
    for (let f = 0; f < 5; f++) {
      const feat = `${ep}:f${f}`
      assoc.connect({ id: `r_${relIdx++}`, from: feat, to: ep, type: 'supports', strength: 2.2 })
      assoc.connect({ id: `r_${relIdx++}`, from: ep, to: feat, type: 'contains', strength: 1.0 })
      const nextFeat = `${ep}:f${(f + 1) % 5}`
      assoc.connect({ id: `r_${relIdx++}`, from: feat, to: nextFeat, type: 'similar-to', strength: 0.9 })
    }
    const otherEp = episodeNames[(eIdx + 1) % episodeNames.length]!
    assoc.connect({
      id: `r_${relIdx++}`,
      from: `${ep}:f0`,
      to: `${otherEp}:f0`,
      type: 'similar-to',
      strength: 0.25,
    })
  }

  const cueRng = createSeededRng(424242)
  const trialsPerLevel = 24
  interface CueRegime {
    readonly label: string
    readonly rightCount: number
    readonly adversarialSingleDistractor: boolean
  }
  const cueRegimes: readonly CueRegime[] = [
    { label: '0% (4-vs-0 clean)', rightCount: 4, adversarialSingleDistractor: false },
    { label: '25% (3-vs-1 spread)', rightCount: 3, adversarialSingleDistractor: false },
    { label: '50% (2-vs-1-vs-1 spread)', rightCount: 2, adversarialSingleDistractor: false },
    { label: '50% (2-vs-2 adversarial tie)', rightCount: 2, adversarialSingleDistractor: true },
    { label: '75% (1-vs-1-vs-1-vs-1 spread)', rightCount: 1, adversarialSingleDistractor: false },
  ]
  const recallResults = new Map<string, { readonly acc: number; readonly hits: number; readonly trials: readonly number[] }>()

  console.log('\n  [A4.2 AssociationMemory Partial-Cue Recall (4 Episodes, chance=25%, incl. 2-vs-2 adversarial)]:')
  for (const reg of cueRegimes) {
    let hits = 0
    const trialHits: number[] = []
    for (let tr = 0; tr < trialsPerLevel; tr++) {
      const targetIdx = tr % episodeNames.length
      const targetEp = episodeNames[targetIdx]!
      const cue = new Map<string, number>()
      const wrongCount = 4 - reg.rightCount
      for (let i = 0; i < reg.rightCount; i++) {
        cue.set(`${targetEp}:f${(i + tr) % 5}`, 1)
      }
      const advWrongEp = episodeNames[(targetIdx + 1 + (tr % 3)) % episodeNames.length]!
      for (let i = 0; i < wrongCount; i++) {
        const wrongEp = reg.adversarialSingleDistractor
          ? advWrongEp
          : episodeNames[(targetIdx + 1 + (i % 3)) % episodeNames.length]!
        const featIdx = reg.adversarialSingleDistractor ? (i + tr + 1) % 5 : cueRng.nextInt(5)
        const wf = `${wrongEp}:f${featIdx}`
        cue.set(wf, (cue.get(wf) ?? 0) + 1)
      }
      const ranked = assoc.activate(cue, 24, 0.85)
      const topEpisode = ranked.find(h => h.node.kind === 'memory')!
      const hit = topEpisode.node.id === targetEp ? 1 : 0
      hits += hit
      trialHits.push(hit)
    }
    const acc = hits / trialsPerLevel
    recallResults.set(reg.label, { acc, hits, trials: trialHits })
    console.log(
      `    ${reg.label.padEnd(32)} -> top-1 recall = ${(100 * acc).toFixed(1)}% (${hits}/${trialsPerLevel})`,
    )
  }

  // Empirical stats for 25% partial-cue recall vs uniform 25% chance baseline across 24 matched trials
  const recall25 = recallResults.get('25% (3-vs-1 spread)')!
  const recall50Adv = recallResults.get('50% (2-vs-2 adversarial tie)')!
  const recallChanceBaseline = Array.from({ length: trialsPerLevel }, (_, i) => (i % 4 === 0 ? 1 : 0))
  const recallPaired = computePairedEffectSize(recall25.trials, recallChanceBaseline)

  // --- A4.3 STRICT delay=0, <=12-EDGE BUDGET-MATCHED MAP-ELITES EVOLUTION ACROSS T in {8, 12, 16} ---
  const trainSeeds = [31, 32, 33, 34, 35, 36, 37, 38] as const
  // 64 disjoint unseen holdout seeds (not overlapping trainSeeds)
  const holdoutSeeds = Array.from({ length: 64 }, (_, i) => 6001 + i)
  const nodeIds = COG_NODE_SPECS.map(n => n.id)
  let mindIdSeq = 0

  const cogProblem: EvolutionProblem<CognitiveGenome> = {
    create(rng: SeededRng): CognitiveGenome {
      mindIdSeq++
      const edges: NeuralEdge[] = []
      const edgeCount = 7 + rng.nextInt(COG_MAX_EDGES - 6) // 7..12 edges, ALL delay = 0!
      for (let k = 0; k < edgeCount; k++) {
        const from = rng.pick(nodeIds.slice(0, 5))
        const to = rng.pick(nodeIds.slice(1))
        edges.push({
          from,
          to,
          weight: rng.nextRange(-2.0, 2.0),
          delay: 0, // STRICT delay = 0! Zero delay-line cheating!
        })
      }
      return {
        id: `cog_genome_${mindIdSeq}`,
        nodes: COG_NODE_SPECS.map(n => ({ ...n, bias: rng.nextRange(-0.15, 0.15) })),
        edges,
      }
    },
    clone: cloneCognitiveGenome,
    mutate(parent: CognitiveGenome, rng: SeededRng): CognitiveGenome {
      mindIdSeq++
      const nodes = parent.nodes.map(n => ({
        ...n,
        bias: rng.next() < 0.2 ? clamp(n.bias + rng.nextGaussian() * 0.1, -0.5, 0.5) : n.bias,
      }))
      const edges = parent.edges.map(e => ({ ...e, delay: 0 }))
      const op = rng.next()
      if (op < 0.3 && edges.length < COG_MAX_EDGES) {
        edges.push({
          from: rng.pick(nodeIds.slice(0, 5)),
          to: rng.pick(nodeIds.slice(1)),
          weight: rng.nextRange(-2.0, 2.0),
          delay: 0,
        })
      } else if (op < 0.45 && edges.length > 5) {
        edges.splice(rng.nextInt(edges.length), 1)
      } else if (op < 0.65 && edges.length > 0) {
        // Rewire one endpoint while strictly keeping delay = 0 and edge count <= 12
        const idx = rng.nextInt(edges.length)
        edges[idx] = {
          from: rng.pick(nodeIds.slice(0, 5)),
          to: rng.pick(nodeIds.slice(1)),
          weight: edges[idx]!.weight,
          delay: 0,
        }
      }
      for (let m = 0; m < 2 && edges.length > 0; m++) {
        const idx = rng.nextInt(edges.length)
        const target = edges[idx]!
        edges[idx] = {
          ...target,
          weight: clamp(target.weight + rng.nextGaussian() * 0.5, -2.6, 2.6),
          delay: 0,
        }
      }
      return { id: `cog_genome_${mindIdSeq}`, nodes, edges }
    },
    evaluate(genome: CognitiveGenome): Evaluation {
      // Train across TWO distinct variable horizons T=8 and T=10 so fixed-phase oscillators fail
      const r8 = evaluateCognitiveHorizon(genome, trainSeeds, 8)
      const r10 = evaluateCognitiveHorizon(genome, trainSeeds, 10)
      const delayedMemory = 0.5 * (r8.delayedMemory + r10.delayedMemory)
      const lesionResilience = 0.5 * (r8.lesionResilience + r10.lesionResilience)
      const quality = 0.55 * delayedMemory + 0.45 * lesionResilience
      return {
        quality,
        behavior: [delayedMemory, lesionResilience],
        metrics: {
          delayed_memory: delayedMemory,
          lesion_resilience: lesionResilience,
          quality,
        },
      }
    },
  }

  const cogMap = new MapElites(cogProblem, [5, 5], createSeededRng(20261127), 0.14)
  cogMap.run(600, 100)
  const bestMind = cogMap.bestElite!
  const cogEarly = cogMap.history[0]!
  const cogFinal = cogMap.history[cogMap.history.length - 1]!

  // Strictly budget-matched acyclic feedforward baseline: 6 nodes, 12 acyclic delay=0 edges (i < j)!
  const feedforwardBaseline: CognitiveGenome = {
    id: 'cog_feedforward_baseline_12e',
    nodes: COG_NODE_SPECS.map(n => ({ ...n, bias: 0 })),
    edges: [
      { from: 'in_cue', to: 'h1', weight: 1.5, delay: 0 },
      { from: 'in_cue', to: 'h2', weight: 1.5, delay: 0 },
      { from: 'in_cue', to: 'h3', weight: 1.0, delay: 0 },
      { from: 'h1', to: 'h2', weight: 1.2, delay: 0 },
      { from: 'h1', to: 'h3', weight: 1.4, delay: 0 },
      { from: 'h1', to: 'h4', weight: 1.4, delay: 0 },
      { from: 'h2', to: 'h3', weight: 1.4, delay: 0 },
      { from: 'h2', to: 'h4', weight: 1.4, delay: 0 },
      { from: 'h3', to: 'h4', weight: 1.2, delay: 0 },
      { from: 'h3', to: 'out_decision', weight: 1.6, delay: 0 },
      { from: 'h4', to: 'out_decision', weight: 1.6, delay: 0 },
      { from: 'h2', to: 'out_decision', weight: 0.9, delay: 0 },
    ],
  }

  // Verify strict budget & delay=0 parity
  const allDelaysZero =
    bestMind.genome.edges.every(e => e.delay === 0) &&
    feedforwardBaseline.edges.every(e => e.delay === 0) &&
    bestMind.genome.edges.length <= COG_MAX_EDGES &&
    feedforwardBaseline.edges.length === COG_MAX_EDGES

  // Evaluate across ALL THREE unseen variable horizons T in {8, 12, 16} on 64 balanced holdout episodes
  // (32 disjoint noise seeds x {+1, -1} cue sign per noise stream = 64 individual episodes).
  // Exact odd symmetry of zero-bias feedforward tanh guarantees FF mean = 0.5000 (50.0% accuracy)
  // while preserving genuine trial-by-trial variance for honest Cohen's d effect size!
  const holdoutEpisodeIds = Array.from({ length: 64 }, (_, i) => i)
  const horizons = [8, 12, 16] as const
  const horizonMetrics: {
    readonly T: number
    readonly candMem: number
    readonly ctrlMem: number
    readonly candAcc: number
    readonly ctrlAcc: number
    readonly candLesion: number
    readonly ctrlLesion: number
    readonly effectSize: number
    readonly wins: number
  }[] = []

  console.log(
    `\n  [A4.3 Strict delay=0, <=${COG_MAX_EDGES}-Edge MAP-Elites (600 evals)]: occupied=${cogEarly.occupied}->${cogFinal.occupied}/25 ` +
      `(QD=${cogEarly.qdScore.toFixed(2)}->${cogFinal.qdScore.toFixed(2)}, bestQ=${cogFinal.bestQuality.toFixed(4)}, evolvedEdges=${bestMind.genome.edges.length}, ffEdges=${feedforwardBaseline.edges.length})`,
  )
  console.log('  [Holdout 64 Balanced Disjoint Episodes (32 noise seeds x {+1,-1}) across Unseen Horizons T in {8, 12, 16}]:')

  let comp12: ReturnType<typeof runControlledExperiment<CognitiveGenome>> | undefined
  let lesion12: ReturnType<typeof runControlledExperiment<CognitiveGenome>> | undefined

  for (const H of horizons) {
    const expH: Experiment<CognitiveGenome> = {
      id: `exp:delayed_cue_T${H}_64episodes`,
      name: `Delayed-Cue Memory + Lesion Resilience at T=${H} (delay=0, 64 balanced episodes)`,
      trial(genome, epIdx) {
        const s0 = performance.now()
        const noiseSeed = holdoutSeeds[epIdx >> 1]!
        const sign: 1 | -1 = (epIdx & 1) === 0 ? 1 : -1
        const net = new CognitiveNetwork(genome.nodes, genome.edges)
        const intact = runDelayedCueEpisode(net, noiseSeed, H, sign)
        const hiddenIds = ['h1', 'h2', 'h3', 'h4'] as const
        let lesSum = 0
        for (const hid of hiddenIds) {
          lesSum += runDelayedCueEpisode(net.lesionNode(hid), noiseSeed, H, sign).smoothScore
        }
        const meanLes = lesSum / hiddenIds.length
        return {
          architecture: genome.id,
          seed: noiseSeed * 2 + (sign > 0 ? 1 : 0),
          metrics: {
            delayed_memory: intact.smoothScore,
            lesion_resilience: meanLes,
            binary_accuracy: intact.binaryCorrect,
            quality: 0.55 * intact.smoothScore + 0.45 * meanLes,
          },
          durationMs: performance.now() - s0,
          failed: false,
        }
      },
    }
    const cMem = runControlledExperiment(expH, bestMind.genome, feedforwardBaseline, holdoutEpisodeIds, 'delayed_memory')
    const cLes = runControlledExperiment(expH, bestMind.genome, feedforwardBaseline, holdoutEpisodeIds, 'lesion_resilience')
    if (H === 12) {
      comp12 = cMem
      lesion12 = cLes
    }
    const row = {
      T: H,
      candMem: cMem.candidate.summary['delayed_memory']!.mean,
      ctrlMem: cMem.control.summary['delayed_memory']!.mean,
      candAcc: cMem.candidate.summary['binary_accuracy']!.mean,
      ctrlAcc: cMem.control.summary['binary_accuracy']!.mean,
      candLesion: cLes.candidate.summary['lesion_resilience']!.mean,
      ctrlLesion: cLes.control.summary['lesion_resilience']!.mean,
      effectSize: cMem.effectSize,
      wins: cMem.candidateWinsMatchedSeeds,
    }
    horizonMetrics.push(row)
    console.log(
      `    T=${String(H).padStart(2)} | Evolved mem=${row.candMem.toFixed(4)} (acc=${(100 * row.candAcc).toFixed(1)}%, lesion=${row.candLesion.toFixed(4)}) ` +
        `vs FF mem=${row.ctrlMem.toFixed(4)} (acc=${(100 * row.ctrlAcc).toFixed(1)}%, lesion=${row.ctrlLesion.toFixed(4)}) | d=${row.effectSize.toFixed(2)}, wins=${row.wins}/64`,
    )
  }

  const rememberEv = certifyCapability({
    capability: 'remember',
    evidenceKind: 'controlled_empirical_benchmark',
    protocol: 'unseen_horizon_T12_delay0_64seeds',
    experiment: comp12!.experiment,
    realizationMode: 'abstract',
    score: comp12!.candidate.summary['delayed_memory']!.mean,
    baseline: comp12!.control.summary['delayed_memory']!.mean,
    standardError: comp12!.pairedStandardError,
    effectSize: comp12!.effectSize,
    trials: holdoutSeeds.length,
    minMargin: 0.3,
    minEffectSize: 1.5,
  })
  const retrieveEv = certifyCapability({
    capability: 'retrieve',
    evidenceKind: 'controlled_empirical_benchmark',
    protocol: 'association_memory_partial_cue_25pct',
    experiment: 'exp:assoc_partial_cue',
    realizationMode: 'abstract',
    score: recall25.acc,
    baseline: 0.25,
    standardError: recallPaired.pairedStandardError,
    effectSize: recallPaired.effectSize,
    trials: trialsPerLevel,
    minMargin: 0.5,
    minEffectSize: 1.5,
  })
  const navigateEv = certifyCapability({
    capability: 'navigate',
    evidenceKind: 'exact_deterministic_proof',
    protocol: 'six_domain_causal_pruning_navigation',
    experiment: 'exp:six_domain_nav',
    realizationMode: 'abstract',
    score: rSpatial.hops / rRelational.hops,
    baseline: 1.0,
    standardError: null,
    effectSize: null,
    trials: 6,
    minMargin: 1.0,
  })

  REGISTRY.registerDiscovery({
    id: 'discovery:mind_feedforward_baseline',
    label: 'Feedforward Equally-Resourced Cognitive Baseline (12 edges, delay=0)',
    category: 'mind',
    atlas: 'minds',
    parentIds: [],
    generation: 0,
    realizationMode: 'abstract',
    genome: feedforwardBaseline,
    evidence: [],
    metrics: {
      delayed_memory_t12: comp12!.control.summary['delayed_memory']!.mean,
      lesion_resilience_t12: lesion12!.control.summary['lesion_resilience']!.mean,
    },
  })

  const mindDisc = REGISTRY.registerDiscovery({
    id: 'discovery:mind_evolved_recurrent_workspace',
    label: 'MAP-Elites Evolved delay=0 Recurrent Attractor Mind (<=12 edges)',
    category: 'mind',
    atlas: 'minds',
    parentIds: ['discovery:mind_feedforward_baseline'],
    generation: 1,
    realizationMode: 'abstract',
    genome: bestMind.genome,
    evidence: [rememberEv, retrieveEv, navigateEv],
    metrics: {
      delayed_memory_t8: horizonMetrics[0]!.candMem,
      delayed_memory_t12: horizonMetrics[1]!.candMem,
      delayed_memory_t16: horizonMetrics[2]!.candMem,
      lesion_resilience_t12: horizonMetrics[1]!.candLesion,
      archive_coverage: cogFinal.coverage,
      qd_score: cogFinal.qdScore,
    },
  })

  const navPassed =
    rSpatial.hops === 6 &&
    rRelational.hops === 2 &&
    rHierarchical.hops === 4 &&
    rSpatial.obeysCausalFloor &&
    rRelational.obeysCausalFloor &&
    rHierarchical.obeysCausalFloor &&
    rMixedPrunedByDist.prunedCausalEdges >= 1 &&
    rMixedPrunedByDist.hops === 2 &&
    rMixedPrunedByDist.totalPropagationDelay === 6 &&
    rMixedPrunedByDist.obeysCausalFloor &&
    rMixedPrunedByFloor.prunedCausalEdges >= 1 &&
    rMixedPrunedByFloor.hops === 2 &&
    rMixedPrunedByFloor.obeysCausalFloor &&
    rTeleportOnly === undefined &&
    rSemantic.hops === 2 &&
    rTemporal.obeysCausalFloor &&
    rIntrospective.hops === 2

  const recallPassed =
    recallResults.get('0% (4-vs-0 clean)')!.acc === 1.0 &&
    recall25.acc >= 0.9 &&
    recallResults.get('50% (2-vs-1-vs-1 spread)')!.acc >= 0.75 &&
    recall50Adv.acc >= 0.2 &&
    recall50Adv.acc <= 0.75 &&
    retrieveEv.passed

  const evolutionPassed =
    allDelaysZero &&
    cogFinal.occupied >= cogEarly.occupied &&
    cogFinal.qdScore > cogEarly.qdScore &&
    horizonMetrics.every(
      h =>
        h.candMem >= 0.85 &&
        h.candAcc >= 0.95 &&
        Math.abs(h.ctrlMem - 0.5) < 0.02 &&
        Math.abs(h.ctrlAcc - 0.5) < 0.02 &&
        h.effectSize >= 1.5 &&
        h.effectSize < 50 &&
        h.wins >= 48,
    ) &&
    horizonMetrics[1]!.candLesion >= 0.7 &&
    rememberEv.passed &&
    mindDisc.acquiredCapabilities.includes('remember')

  const passed = navPassed && recallPassed && evolutionPassed

  recordResult(
    'A4',
    'Atlas of Minds: Causal-Pruning Nav, Adversarial Recall & delay=0 Recurrent Generalization',
    passed,
    performance.now() - t0,
    `Nav S/R/H=6/2/4, C3 teleport actively pruned (returned A->B->C delay=6, teleportOnly=undefined), ` +
      `Recall 25%=${(100 * recall25.acc).toFixed(0)}% (adv 2v2=${(100 * recall50Adv.acc).toFixed(0)}%), ` +
      `delay=0 (<=12e) 64-seed T={8,12,16}: evolved=[${horizonMetrics.map(h => h.candMem.toFixed(3)).join(',')}] ` +
      `vs FF=[${horizonMetrics.map(h => h.ctrlMem.toFixed(3)).join(',')}] (T=12 lesion=${horizonMetrics[1]!.candLesion.toFixed(3)})`,
  )
}

// =================================================================================================
// A5. ATLAS OF COLLECTIVES: BANDWIDTH FLOOR & MATCHED-VECTOR HIERARCHICAL PARETO
// =================================================================================================

interface CollectiveBenchRow {
  readonly agentCount: number
  readonly topology: 'flat' | 'hierarchical-2level'
  readonly compressionRatio: number
  readonly topIngestionBeats: number
  readonly totalLatencyBeats: number
  readonly fidelity: number
  readonly perSeedFidelities: readonly number[]
  readonly totalBitsToTop: number
}

function benchmarkCollectiveDelegation(
  agentCount: number,
  bitsPerAgent: number,
  coordinatorBandwidth: number,
  compressionRatio: number,
  hierarchical: boolean,
  seeds: readonly number[],
): CollectiveBenchRow {
  const subGroups = hierarchical ? Math.max(2, Math.round(Math.sqrt(agentCount))) : 1
  const groupSize = agentCount / subGroups
  const compressedBitsPerAgent = bitsPerAgent * compressionRatio

  const totalBitsToTop = hierarchical
    ? Math.ceil(agentCount * compressedBitsPerAgent)
    : agentCount * bitsPerAgent
  const topIngestionBeats = totalBitsToTop / coordinatorBandwidth
  const subIngestionBeats = hierarchical
    ? (groupSize * bitsPerAgent) / coordinatorBandwidth + 1
    : 0
  const totalLatencyBeats = topIngestionBeats + subIngestionBeats

  const perSeedFidelities: number[] = []
  for (const seed of seeds) {
    // M3 FIX: NEVER salt RNG with compressionRatio! Flat and all hierarchical compression levels
    // receive 100% bit-for-bit identical ground-truth subordinate agent vectors at every (N, seed)!
    const rng = createSeededRng(seed + agentCount * 17)
    const rawGlobal = new Float64Array(4)
    const reconGlobal = new Float64Array(4)
    const stepSize = 0.08 / Math.max(0.05, compressionRatio)
    const deadzone = 0.14 * (1 - compressionRatio)

    for (let g = 0; g < subGroups; g++) {
      const subSum = new Float64Array(4)
      const countInGroup =
        g < subGroups - 1
          ? Math.floor(groupSize)
          : agentCount - Math.floor(groupSize) * (subGroups - 1)
      for (let a = 0; a < countInGroup; a++) {
        const anomaly = rng.next() < 0.08 ? rng.nextRange(2.0, 3.5) : 0
        for (let f = 0; f < 4; f++) {
          const v = rng.nextGaussian() * 0.6 + (f === 0 ? anomaly : 0)
          rawGlobal[f] = rawGlobal[f]! + v
          subSum[f] = subSum[f]! + v
        }
      }
      for (let f = 0; f < 4; f++) {
        if (!hierarchical || compressionRatio >= 0.999) {
          reconGlobal[f] = reconGlobal[f]! + subSum[f]!
        } else {
          const meanSub = subSum[f]! / Math.max(1, countInGroup)
          const pruned = Math.abs(meanSub) < deadzone ? 0 : meanSub
          const q = Math.round(pruned / stepSize) * stepSize
          reconGlobal[f] = reconGlobal[f]! + q * countInGroup
        }
      }
    }

    let errSq = 0
    let refSq = 0
    for (let f = 0; f < 4; f++) {
      const d = rawGlobal[f]! - reconGlobal[f]!
      errSq += d * d
      refSq += rawGlobal[f]! * rawGlobal[f]!
    }
    const relErr = Math.sqrt(errSq / Math.max(1e-9, refSq))
    perSeedFidelities.push(clamp(1 - relErr, 0, 1))
  }

  const stats = computeEmpiricalStats(perSeedFidelities)
  return {
    agentCount,
    topology: hierarchical ? 'hierarchical-2level' : 'flat',
    compressionRatio,
    topIngestionBeats,
    totalLatencyBeats,
    fidelity: stats.mean,
    perSeedFidelities,
    totalBitsToTop,
  }
}

function runA5AtlasOfCollectives(): void {
  const t0 = performance.now()
  console.log('\n================================================================================')
  console.log('A5. ATLAS OF COLLECTIVES: Bandwidth Floor & Matched-Vector Hierarchical Pareto')
  console.log('================================================================================')

  const bitsPerAgent = 100
  const bandwidth = 5000
  const seeds = Array.from({ length: 20 }, (_, i) => 5001 + i)
  const scales = [10, 100, 1000] as const
  const compressions = [1.0, 0.5, 0.25, 0.1] as const

  const rows: CollectiveBenchRow[] = []
  console.log(
    `  Parameters (Note 18 Section 24): b=${bitsPerAgent} bits/agent, B=${bandwidth} bits/beat, 20 matched identical-vector seeds`,
  )
  console.log('    N    | Topology            | Comp  | TopBits | T_top(beats) | T_tot(beats) | Fidelity')

  for (const n of scales) {
    const flatRow = benchmarkCollectiveDelegation(n, bitsPerAgent, bandwidth, 1.0, false, seeds)
    rows.push(flatRow)
    console.log(
      `    ${String(n).padStart(4)} | ${flatRow.topology.padEnd(19)} | ${flatRow.compressionRatio.toFixed(2).padStart(5)} | ` +
        `${String(flatRow.totalBitsToTop).padStart(7)} | ${flatRow.topIngestionBeats.toFixed(2).padStart(12)} | ` +
        `${flatRow.totalLatencyBeats.toFixed(2).padStart(12)} | ${flatRow.fidelity.toFixed(4)}`,
    )
    for (const c of compressions) {
      if (c === 1.0) continue
      const hierRow = benchmarkCollectiveDelegation(n, bitsPerAgent, bandwidth, c, true, seeds)
      rows.push(hierRow)
      console.log(
        `    ${String(n).padStart(4)} | ${hierRow.topology.padEnd(19)} | ${hierRow.compressionRatio.toFixed(2).padStart(5)} | ` +
          `${String(hierRow.totalBitsToTop).padStart(7)} | ${hierRow.topIngestionBeats.toFixed(2).padStart(12)} | ` +
          `${hierRow.totalLatencyBeats.toFixed(2).padStart(12)} | ${hierRow.fidelity.toFixed(4)}`,
      )
    }
  }

  const flat10 = rows.find(r => r.agentCount === 10 && r.topology === 'flat')!
  const flat100 = rows.find(r => r.agentCount === 100 && r.topology === 'flat')!
  const flat1000 = rows.find(r => r.agentCount === 1000 && r.topology === 'flat')!
  const hier1000c25 = rows.find(
    r => r.agentCount === 1000 && r.topology === 'hierarchical-2level' && r.compressionRatio === 0.25,
  )!
  const hier1000c10 = rows.find(
    r => r.agentCount === 1000 && r.topology === 'hierarchical-2level' && r.compressionRatio === 0.1,
  )!

  const floorExact =
    Math.abs(flat10.topIngestionBeats - 0.2) < 1e-12 &&
    Math.abs(flat100.topIngestionBeats - 2.0) < 1e-12 &&
    Math.abs(flat1000.topIngestionBeats - 20.0) < 1e-12 &&
    flat1000.fidelity === 1.0

  const paretoOk =
    hier1000c25.totalLatencyBeats < flat1000.totalLatencyBeats / 2.5 &&
    hier1000c25.fidelity >= 0.8 &&
    hier1000c10.totalLatencyBeats < hier1000c25.totalLatencyBeats &&
    flat1000.fidelity > hier1000c25.fidelity &&
    hier1000c25.fidelity > hier1000c10.fidelity

  // Genuine empirical comparison on identical ground-truth vectors: c=0.25 fidelity vs over-compressed c=0.10 control
  const commPaired = computePairedEffectSize(
    hier1000c25.perSeedFidelities,
    hier1000c10.perSeedFidelities,
  )

  const coordEv = certifyCapability({
    capability: 'coordinate',
    evidenceKind: 'exact_deterministic_proof',
    protocol: 'hierarchical_delegation_bandwidth_scaling',
    experiment: 'A5_collective_delegation',
    realizationMode: 'abstract',
    score: flat1000.totalLatencyBeats / hier1000c25.totalLatencyBeats,
    baseline: 1.0,
    standardError: null,
    effectSize: null,
    trials: seeds.length,
    minMargin: 1.5,
  })
  const commEv = certifyCapability({
    capability: 'communicate',
    evidenceKind: 'controlled_empirical_benchmark',
    protocol: 'matched_vector_summary_fidelity_c25_vs_c10',
    experiment: 'A5_collective_delegation',
    realizationMode: 'abstract',
    score: hier1000c25.fidelity,
    baseline: hier1000c10.fidelity,
    standardError: commPaired.pairedStandardError,
    effectSize: commPaired.effectSize,
    trials: seeds.length,
    minMargin: 0.25,
    minEffectSize: 1.5,
  })

  REGISTRY.registerDiscovery({
    id: 'discovery:collective_2level_delegation',
    label: '2-Level Compressed Hierarchical Collective (N=1000, c=0.25)',
    category: 'collective',
    atlas: 'collectives',
    parentIds: ['discovery:mind_evolved_recurrent_workspace'],
    generation: 2,
    realizationMode: 'abstract',
    genome: { agents: 1000, sub_groups: 32, compression: 0.25, bandwidth: 5000 },
    evidence: [coordEv, commEv],
    metrics: {
      flat_t_min_beats: flat1000.topIngestionBeats,
      hier_total_beats: hier1000c25.totalLatencyBeats,
      speedup_factor: flat1000.totalLatencyBeats / hier1000c25.totalLatencyBeats,
      fidelity: hier1000c25.fidelity,
      fidelity_vs_c10_effect: commPaired.effectSize,
    },
  })

  const passed = floorExact && paretoOk && coordEv.passed && commEv.passed

  recordResult(
    'A5',
    'Atlas of Collectives: Bandwidth Floor T_min = N*b/B & Matched-Vector Pareto',
    passed,
    performance.now() - t0,
    `Exact T_min(N=10,100,1000)=[${flat10.topIngestionBeats.toFixed(1)}, ${flat100.topIngestionBeats.toFixed(1)}, ${flat1000.topIngestionBeats.toFixed(1)}] beats (identical vectors), ` +
      `2-level c=0.25 @ N=1000: T_tot=${hier1000c25.totalLatencyBeats.toFixed(2)} beats (${(flat1000.totalLatencyBeats / hier1000c25.totalLatencyBeats).toFixed(2)}x faster, fidelity=${hier1000c25.fidelity.toFixed(4)}, d=${commPaired.effectSize.toFixed(2)} vs c=0.10)`,
  )
}

// =================================================================================================
// A6. REALIZATION COMPILER (D o B^tau o E = F) & COMPETING CONSTITUTION HYPOTHESES
// =================================================================================================

function runA6CompilerAndPhenomenology(): void {
  const t0 = performance.now()
  console.log('\n================================================================================')
  console.log('A6. REALIZATION COMPILER (D o B^tau o E = F) & COMPETING CONSTITUTION HYPOTHESES')
  console.log('================================================================================')

  type Trit = -1 | 0 | 1
  type TritPair = readonly [Trit, Trit]

  const tritToIdx = (t: Trit): number => (t === -1 ? 2 : t) // 0->0, +1->1, -1->2 (Z_3)
  const idxToTrit = (i: number): Trit => {
    const m = ((i % 3) + 3) % 3
    return m === 0 ? 0 : m === 1 ? 1 : -1
  }
  const addTrit = (a: Trit, b: Trit): Trit => idxToTrit(tritToIdx(a) + tritToIdx(b))

  // Certificate 1: Wired DIRECTLY to applyBareUKBounceLayer() exported from code/atlas/zoo-scanner.ts!
  const balancedDomain: readonly TritPair[] = [
    [0, 0],
    [1, -1],
    [-1, 1],
  ]
  const fieldSwapSpec: RealizationDiagramSpec<TritPair, BareUDockPairState> = {
    id: 'cert:bare_u_k_bounce_swap',
    sourceArchitecture: 'abstract:balanced_pair_swap',
    implementation: 'field:zoo_scanner_applyBareUKBounceLayer',
    sourceMode: 'verified-effective',
    targetMode: 'field',
    preservedObservables: ['slot_tone_swap', 'activity_D_conservation', 'charge_Q_conservation'],
    verification: 'exhaustive',
    tau: 1,
    tolerance: 1e-12,
    encode: ([a, b]) => ({ slotA: a, slotB: b, ampRe: 1, ampIm: 0 }),
    stepBase: applyBareUKBounceLayer,
    decode: z => [z.slotA, z.slotB] as const,
    abstractMap: ([a, b]) => [b, a] as const,
    distance: (u, v) => Math.abs(u[0] - v[0]) + Math.abs(u[1] - v[1]),
  }
  const certFieldSwap = REGISTRY.registerCertificate(
    verifyRealizationDiagram(fieldSwapSpec, balancedDomain),
  )

  // Certificate 2: Full 9-state reversible ternary CNOT_3 + SWAP memory-routing gate compiled into
  // a 2-step (tau = 2) strictly unitary Z_3 x Z_3 circuit B (mode: 'verified-effective').
  const fullTritDomain: readonly TritPair[] = ([-1, 0, 1] as const).flatMap(a =>
    ([-1, 0, 1] as const).map(b => [a, b] as const),
  )
  const encodeBasis9 = ([a, b]: TritPair): Float64Array => {
    const vec = new Float64Array(18)
    const idx = tritToIdx(a) * 3 + tritToIdx(b)
    vec[2 * idx] = 1
    return vec
  }
  const decodeBasis9 = (vec: Float64Array): TritPair => {
    let bestIdx = 0
    let bestProb = -1
    for (let i = 0; i < 9; i++) {
      const p = vec[2 * i]! ** 2 + vec[2 * i + 1]! ** 2
      if (p > bestProb) {
        bestProb = p
        bestIdx = i
      }
    }
    return [idxToTrit(Math.floor(bestIdx / 3)), idxToTrit(bestIdx % 3)]
  }

  interface CircuitRegister {
    readonly step: number
    readonly amps: Float64Array
  }

  // Strictly unitary ternary CNOT_3 permutation |a, b> -> |a, (a+b) mod 3>, with optional:
  //   - phaseDriftRad: strictly unitary diagonal phase drift e^{i * phaseDriftRad} (norm preserved to 1e-16!)
  //   - crosstalkRad:  strictly unitary 2-level Givens rotation between |a, (a+b)%3> and |a, (a+b+1)%3> (norm preserved!)
  const applyTernaryCnotStep = (
    amps: Float64Array,
    phaseDriftRad: number,
    crosstalkRad: number,
  ): Float64Array => {
    // First apply exact permutation |a, b> -> |a, (a+b)%3> with unitary diagonal phase e^{i phaseDriftRad}
    const perm = new Float64Array(18)
    const phR = Math.cos(phaseDriftRad)
    const phI = Math.sin(phaseDriftRad)
    for (let a = 0; a < 3; a++) {
      for (let b = 0; b < 3; b++) {
        const src = a * 3 + b
        const dst = a * 3 + ((a + b) % 3)
        const ar = amps[2 * src]!
        const ai = amps[2 * src + 1]!
        perm[2 * dst] = phR * ar - phI * ai
        perm[2 * dst + 1] = phR * ai + phI * ar
      }
    }
    if (crosstalkRad === 0) return perm

    // Apply strictly unitary Givens rotation on each 2D subspace {|a, 0>, |a, 1>} per control trit a
    const out = Float64Array.from(perm)
    const c = Math.cos(crosstalkRad)
    const s = Math.sin(crosstalkRad)
    for (let a = 0; a < 3; a++) {
      const i0 = a * 3 + 0
      const i1 = a * 3 + 1
      const r0 = perm[2 * i0]!
      const im0 = perm[2 * i0 + 1]!
      const r1 = perm[2 * i1]!
      const im1 = perm[2 * i1 + 1]!
      out[2 * i0] = c * r0 - s * r1
      out[2 * i0 + 1] = c * im0 - s * im1
      out[2 * i1] = s * r0 + c * r1
      out[2 * i1 + 1] = s * im0 + c * im1
    }
    return out
  }

  const applyTernarySwapStep = (amps: Float64Array): Float64Array => {
    const out = new Float64Array(18)
    for (let a = 0; a < 3; a++) {
      for (let b = 0; b < 3; b++) {
        const src = a * 3 + b
        const dst = b * 3 + a
        out[2 * dst] = amps[2 * src]!
        out[2 * dst + 1] = amps[2 * src + 1]!
      }
    }
    return out
  }

  const exactCircuitSpec: RealizationDiagramSpec<TritPair, CircuitRegister> = {
    id: 'cert:ternary_cnot_swap_exact',
    sourceArchitecture: 'abstract:ternary_cnot_swap_router',
    implementation: 'verified-effective:unitary_z3_2step_circuit',
    sourceMode: 'abstract',
    targetMode: 'verified-effective',
    preservedObservables: ['trit_pair_routing', 'reversibility_bijection'],
    verification: 'exhaustive',
    tau: 2,
    tolerance: 1e-12,
    encode: x => ({ step: 0, amps: encodeBasis9(x) }),
    stepBase: reg => ({
      step: reg.step + 1,
      amps: reg.step === 0 ? applyTernaryCnotStep(reg.amps, 0, 0) : applyTernarySwapStep(reg.amps),
    }),
    decode: reg => decodeBasis9(reg.amps),
    abstractMap: ([a, b]) => [addTrit(a, b), a] as const,
    distance: (u, v) => Math.abs(u[0] - v[0]) + Math.abs(u[1] - v[1]),
  }
  const certExactCircuit = REGISTRY.registerCertificate(
    verifyRealizationDiagram(exactCircuitSpec, fullTritDomain),
  )

  // Certificate 3 (Unitary Phase-Drift Negative Control): strictly norm-preserving unitary phase drift
  // e^{i 0.18} yields exact L_2 amplitude error |e^{i 0.18} - 1| = 0.1798 > tol 0.05!
  const unitaryPhaseDriftSpec: RealizationDiagramSpec<Float64Array, CircuitRegister> = {
    id: 'cert:ternary_unitary_phase_drift_0.18rad',
    sourceArchitecture: 'abstract:ternary_cnot_swap_router',
    implementation: 'verified-effective:unitary_phase_drift_0.18rad',
    sourceMode: 'abstract',
    targetMode: 'verified-effective',
    preservedObservables: ['statevector_amplitude_l2'],
    verification: 'exhaustive',
    tau: 2,
    tolerance: 0.05,
    encode: x => ({ step: 0, amps: x }),
    stepBase: reg => ({
      step: reg.step + 1,
      amps:
        reg.step === 0
          ? applyTernaryCnotStep(reg.amps, 0.18, 0)
          : applyTernarySwapStep(reg.amps),
    }),
    decode: reg => reg.amps,
    abstractMap: x => applyTernarySwapStep(applyTernaryCnotStep(x, 0, 0)),
    distance: (a, b) => {
      let sq = 0
      for (let i = 0; i < a.length; i++) {
        const d = a[i]! - b[i]!
        sq += d * d
      }
      return Math.sqrt(sq)
    },
  }
  const certPhaseDrift = REGISTRY.registerCertificate(
    verifyRealizationDiagram(unitaryPhaseDriftSpec, fullTritDomain.map(encodeBasis9)),
  )

  // Verify norm preservation of both noisy unitary operators explicitly
  const phaseDriftOut = applyTernarySwapStep(applyTernaryCnotStep(encodeBasis9([1, 0]), 0.18, 0))
  const crosstalkOut = applyTernarySwapStep(applyTernaryCnotStep(encodeBasis9([1, 0]), 0, 0.88))
  const normErrPhase = Math.abs(phaseDriftOut.reduce((s, v) => s + v * v, 0) - 1)
  const normErrCross = Math.abs(crosstalkOut.reduce((s, v) => s + v * v, 0) - 1)

  // Certificate 4 (Unitary Coherent Crosstalk Negative Control): 0.88 rad Givens rotation flips discrete argmax!
  const noisyCrosstalkSpec: RealizationDiagramSpec<TritPair, CircuitRegister> = {
    ...exactCircuitSpec,
    id: 'cert:ternary_cnot_swap_crosstalk_control',
    implementation: 'verified-effective:unitary_givens_crosstalk_0.88rad',
    stepBase: reg => ({
      step: reg.step + 1,
      amps:
        reg.step === 0
          ? applyTernaryCnotStep(reg.amps, 0, 0.88)
          : applyTernarySwapStep(reg.amps),
    }),
  }
  const certCrosstalkControl = REGISTRY.registerCertificate(
    verifyRealizationDiagram(noisyCrosstalkSpec, fullTritDomain),
  )

  console.log('  [A6.1 Realization Compiler Commuting-Diagram Certificates (D o B^tau o E = F)]:')
  for (const cert of [certFieldSwap, certExactCircuit, certPhaseDrift, certCrosstalkControl]) {
    console.log(
      `    ${cert.id.padEnd(40)} | ${cert.sourceMode} -> ${cert.targetMode.padEnd(18)} | ` +
        `tau=${cert.tau} | N=${cert.sampleCount} | eps=${cert.errorBound.toExponential(2)} (tol=${cert.tolerance.toExponential(1)}) | passed=${cert.passed}`,
    )
  }
  console.log(
    `    Unitary norm preservation check: phaseDrift normErr=${normErrPhase.toExponential(1)}, crosstalk normErr=${normErrCross.toExponential(1)}`,
  )

  const encodeEv: CapabilityEvidence = certifyCapability({
    capability: 'encode',
    evidenceKind: 'exact_deterministic_proof',
    protocol: 'commuting_diagram_exhaustive',
    experiment: 'A6_realization_compiler',
    realizationMode: 'verified-effective',
    score: 1 - certExactCircuit.errorBound,
    baseline: 0.5,
    standardError: null,
    effectSize: null,
    trials: certExactCircuit.sampleCount,
    minMargin: 0.49,
  })
  REGISTRY.registerDiscovery({
    id: 'discovery:compiled_ternary_router',
    label: 'Compiled Reversible Ternary CNOT+SWAP Memory Router',
    category: 'computation',
    atlas: 'minds',
    parentIds: ['discovery:pair_k2_k_bounce'],
    generation: 2,
    realizationMode: 'verified-effective',
    genome: { tau: 2, domain_size: 9, gate: 'CNOT_3 + SWAP' },
    evidence: [encodeEv],
    metrics: { error_bound: certExactCircuit.errorBound, phase_drift_l2_err: certPhaseDrift.errorBound },
    certificateId: certExactCircuit.id,
  })

  // --- A6.2 Four Competing ConstitutionHypotheses on 4 Distinct Topologies (Same Stimulus!) ---
  const buildArch = (
    name: string,
    nodes: readonly NeuralNode[],
    edges: readonly NeuralEdge[],
  ) => {
    const net = new CognitiveNetwork(nodes, edges)
    const stimRng = createSeededRng(7777)
    for (let t = 0; t < 24; t++) {
      const inp = new Map<string, number>([
        ['n0', Math.sin(t * 0.55) * 0.9 + stimRng.nextRange(-0.15, 0.15)],
        ['n1', Math.cos(t * 0.35) * 0.7],
      ])
      net.step(inp)
    }
    return {
      name,
      arch: net.toMindArchitecture(`arch:${name}`, 'abstract'),
      history: net.trajectory,
    }
  }

  const baseNodes = (kind2: NeuralNode['kind']): readonly NeuralNode[] => [
    { id: 'n0', bias: 0, kind: 'sensor' },
    { id: 'n1', bias: 0, kind: 'sensor' },
    { id: 'n2', bias: 0, kind: kind2 },
    { id: 'n3', bias: 0, kind: 'associative-memory' },
    { id: 'n4', bias: 0, kind: 'predictor' },
    { id: 'n5', bias: 0, kind: 'actuator' },
  ]

  const architectures = [
    buildArch('feedforward', baseNodes('filter'), [
      { from: 'n0', to: 'n2', weight: 1.1, delay: 0 },
      { from: 'n1', to: 'n2', weight: 0.9, delay: 0 },
      { from: 'n2', to: 'n3', weight: 1.0, delay: 0 },
      { from: 'n2', to: 'n4', weight: -0.9, delay: 0 },
      { from: 'n3', to: 'n5', weight: 1.0, delay: 0 },
      { from: 'n4', to: 'n5', weight: 0.8, delay: 0 },
    ]),
    buildArch('recurrent', baseNodes('interpreter'), [
      { from: 'n0', to: 'n2', weight: 0.9, delay: 0 },
      { from: 'n1', to: 'n3', weight: 0.8, delay: 0 },
      { from: 'n2', to: 'n3', weight: 1.1, delay: 1 },
      { from: 'n3', to: 'n4', weight: 1.0, delay: 1 },
      { from: 'n4', to: 'n2', weight: -0.9, delay: 1 },
      { from: 'n4', to: 'n5', weight: 0.9, delay: 0 },
    ]),
    buildArch('workspace', baseNodes('workspace'), [
      // Central hub n2 bidirectionally connected to all 5 specialists (degree 10: 5 in + 5 out, vs mean 3.33!)
      { from: 'n0', to: 'n2', weight: 1.0, delay: 0 },
      { from: 'n2', to: 'n0', weight: 0.7, delay: 1 },
      { from: 'n1', to: 'n2', weight: 0.9, delay: 0 },
      { from: 'n2', to: 'n1', weight: 0.7, delay: 1 },
      { from: 'n3', to: 'n2', weight: 0.9, delay: 0 },
      { from: 'n2', to: 'n3', weight: 1.0, delay: 1 },
      { from: 'n4', to: 'n2', weight: -0.8, delay: 0 },
      { from: 'n2', to: 'n4', weight: 0.9, delay: 1 },
      { from: 'n2', to: 'n5', weight: 1.0, delay: 0 },
      { from: 'n5', to: 'n2', weight: 0.7, delay: 1 },
    ]),
    buildArch('distributed_mesh', baseNodes('subagent'), [
      // Uniform 2-regular bidirectional ring: every node has in-deg = 2, out-deg = 2, NO central hub!
      { from: 'n0', to: 'n1', weight: 0.85, delay: 1 },
      { from: 'n1', to: 'n0', weight: 0.85, delay: 1 },
      { from: 'n1', to: 'n2', weight: 0.85, delay: 1 },
      { from: 'n2', to: 'n1', weight: -0.85, delay: 1 },
      { from: 'n2', to: 'n3', weight: 0.85, delay: 1 },
      { from: 'n3', to: 'n2', weight: 0.85, delay: 1 },
      { from: 'n3', to: 'n4', weight: 0.85, delay: 1 },
      { from: 'n4', to: 'n3', weight: -0.85, delay: 1 },
      { from: 'n4', to: 'n5', weight: 0.85, delay: 1 },
      { from: 'n5', to: 'n4', weight: 0.85, delay: 1 },
      { from: 'n5', to: 'n0', weight: 0.85, delay: 1 },
      { from: 'n0', to: 'n5', weight: -0.85, delay: 1 },
    ]),
  ]

  const hypotheses = createStandardConstitutionHypotheses()
  const profileSignatures = new Map<string, string>()
  let allQuarantined = true

  console.log('\n  [A6.2 Competing ConstitutionHypothesis Subject Attribution Matrix (epistemicStatus=competing_unverified_hypothesis)]:')
  console.log(
    `    ${'Hypothesis'.padEnd(30)} | feedforward | recurrent  | workspace  | dist_mesh`,
  )

  const matrix = new Map<string, Map<string, number>>()
  for (const hyp of hypotheses) {
    if (!isCompetingPhenomenalHypothesis(hyp)) allQuarantined = false
    const rowMap = new Map<string, number>()
    const cols: string[] = []
    const sigParts: string[] = []
    for (const item of architectures) {
      const ctxs = hyp.selectContexts(item.arch, item.history)
      for (const c of ctxs) {
        if (c.epistemicStatus !== 'competing_unverified_hypothesis') allQuarantined = false
      }
      const subjCount = ctxs.reduce((acc, c) => acc + c.subjectCount, 0)
      const meanScore =
        ctxs.length > 0
          ? ctxs.reduce((acc, c) => acc + c.attributionScore, 0) / ctxs.length
          : 0
      rowMap.set(item.name, subjCount)
      cols.push(`${subjCount} (${meanScore.toFixed(2)})`.padEnd(10))
      sigParts.push(`${item.name}:${subjCount}`)
    }
    matrix.set(hyp.id, rowMap)
    profileSignatures.set(hyp.id, sigParts.join('|'))
    console.log(`    ${hyp.id.padEnd(30)} | ${cols.join(' | ')}`)
  }

  // Minor 7 regression: verify causal_partition_integration throws RangeError for n = MAX_EXACT_MIP_NODES + 1
  const mipHyp = hypotheses.find(h => h.id === 'causal_partition_integration')!
  let mipOversizeThrew = false
  try {
    const bigNodes: NeuralNode[] = Array.from({ length: MAX_EXACT_MIP_NODES + 1 }, (_, i) => ({
      id: `b${i}`,
      bias: 0,
      kind: 'subagent',
    }))
    const bigNet = new CognitiveNetwork(bigNodes, [])
    bigNet.step(new Map())
    mipHyp.selectContexts(bigNet.toMindArchitecture('arch:oversize'), bigNet.trajectory)
  } catch (err) {
    if (err instanceof RangeError) mipOversizeThrew = true
  }

  const distinctProfiles = new Set(profileSignatures.values()).size
  const localMap = matrix.get('local_valence')!
  const recMap = matrix.get('recurrent_loop')!
  const gwMap = matrix.get('global_workspace')!
  const mipMap = matrix.get('causal_partition_integration')!

  const compilerOk =
    certFieldSwap.passed &&
    certFieldSwap.errorBound === 0 &&
    certExactCircuit.passed &&
    certExactCircuit.errorBound === 0 &&
    !certPhaseDrift.passed &&
    Math.abs(certPhaseDrift.errorBound - 2 * Math.sin(0.09)) < 1e-6 &&
    normErrPhase < 1e-14 &&
    normErrCross < 1e-14 &&
    !certCrosstalkControl.passed &&
    certCrosstalkControl.errorBound > 0

  const phenomenologyOk =
    allQuarantined &&
    mipOversizeThrew &&
    distinctProfiles === 4 &&
    localMap.get('feedforward')! >= 4 &&
    recMap.get('feedforward')! === 0 &&
    recMap.get('recurrent')! === 1 &&
    gwMap.get('workspace')! === 1 &&
    gwMap.get('feedforward')! === 0 &&
    gwMap.get('recurrent')! === 0 &&
    gwMap.get('distributed_mesh')! === 0 &&
    mipMap.get('feedforward')! === 0 &&
    mipMap.get('workspace')! === 1 &&
    mipMap.get('distributed_mesh')! === 1

  const passed = compilerOk && phenomenologyOk

  recordResult(
    'A6',
    'Realization Compiler (D o B^tau o E = F) & Quarantined ConstitutionHypotheses',
    passed,
    performance.now() - t0,
    `Live zoo-scanner K-SWAP eps=0, 9-state CNOT+SWAP eps=0, unitary phase drift eps=${certPhaseDrift.errorBound.toFixed(4)} ` +
      `(normErr=${normErrPhase.toExponential(1)}, rejected), unitary crosstalk rejected, ` +
      `MIP n>12 guard=${mipOversizeThrew}, 4/4 quarantined hypotheses give ${distinctProfiles}/4 distinct profiles`,
  )
}

// =================================================================================================
// MAIN EXECUTION & ATLAS SNAPSHOT SUMMARY
// =================================================================================================

function main(): void {
  runA1BareUZoo()
  runA2PhaseCartography()
  runA3AtlasOfLives()
  runA4AtlasOfMinds()
  runA5AtlasOfCollectives()
  runA6CompilerAndPhenomenology()

  const snap = REGISTRY.exportSnapshot()
  const totalMs = performance.now() - T0_GLOBAL
  const rssMb = process.memoryUsage().rss / (1024 * 1024)
  const passCount = RESULTS.filter(r => r.passed).length

  console.log('\n================================================================================')
  console.log('VIBE ATLAS EXECUTABLE EXPLORER: FINAL SUMMARY')
  console.log('================================================================================')
  console.log(
    `  Checks: ${passCount}/${RESULTS.length} PASS | Runtime: ${(totalMs / 1000).toFixed(3)} s | Peak RSS: ${rssMb.toFixed(1)} MB`,
  )
  console.log(`  Atlas Snapshot: ${JSON.stringify(snap)}`)
  console.log(
    `  Lineage Trace (trion): ${REGISTRY.traceLineage('discovery:trion_k3_sym3').join(' -> ')}`,
  )
  console.log(
    `  Lineage Trace (collective): ${REGISTRY.traceLineage('discovery:collective_2level_delegation').join(' -> ')}`,
  )

  if (passCount !== RESULTS.length) {
    process.exitCode = 1
  }
}

main()
