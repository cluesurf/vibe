// Vibe Atlas Evolution, Experimentation, Navigation, Memory & Cognitive Runtime Engine.
// Implements Note 18 Parts III, IV, VII, XII, and XIV:
//   - Zero-Math.random() deterministic Mulberry32 PRNG (createSeededRng)
//   - Generic MapElites<G> quality-diversity archive with immutable parent handling
//   - Controlled ExperimentRunner with matched-seed candidate vs control statistics
//   - Universal navigate<N> A* engine actively pruning Reference.propagationDelay causal violations
//   - AssociationMemory spreading-activation store (a_{t+1} = (1 - lam) s + lam P^T a_t)
//   - CognitiveNetwork configurable delayed-edge recurrent tanh simulator with lesionNode()

import type {
  CognitiveConnection,
  CognitiveProcess,
  Id,
  MindArchitecture,
  ProcessKind,
  Realization,
  RealizationMode,
  Tick,
} from './registry'

// =================================================================================================
// 1. DETERMINISTIC SEEDED PRNG (ZERO Math.random() ANYWHERE)
// =================================================================================================

export interface SeededRng {
  readonly seed: number
  next(): number
  nextInt(maxExclusive: number): number
  nextRange(min: number, max: number): number
  nextGaussian(): number
  pick<T>(items: readonly T[]): T
  fork(salt: number): SeededRng
}

export function createSeededRng(seed: number): SeededRng {
  let state = (seed >>> 0) || 0x9e3779b9

  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  const nextInt = (maxExclusive: number): number => {
    if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
      throw new Error(`Invalid maxExclusive=${maxExclusive}`)
    }
    return Math.floor(next() * maxExclusive)
  }

  const nextRange = (min: number, max: number): number => min + (max - min) * next()

  const nextGaussian = (): number => {
    const u1 = Math.max(1e-12, next())
    const u2 = next()
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  }

  const pick = <T>(items: readonly T[]): T => {
    if (items.length === 0) {
      throw new Error('Cannot pick from empty array')
    }
    return items[nextInt(items.length)]!
  }

  const fork = (salt: number): SeededRng => {
    const mixed = (Math.imul(state ^ (salt >>> 0), 0x85ebca6b) + 0xc2b2ae35) >>> 0
    return createSeededRng(mixed)
  }

  return {
    seed: seed >>> 0,
    next,
    nextInt,
    nextRange,
    nextGaussian,
    pick,
    fork,
  }
}

// =================================================================================================
// 2. GENERIC MAP-ELITES QUALITY-DIVERSITY ENGINE
// =================================================================================================

export interface Evaluation {
  readonly quality: number
  readonly behavior: readonly number[]
  readonly metrics: Readonly<Record<string, number>>
}

export interface Elite<G> {
  readonly genome: G
  readonly evaluation: Evaluation
  readonly nicheKey: string
  readonly discoveredAtEvaluation: number
}

export interface EvolutionProblem<G> {
  readonly create: (rng: SeededRng) => G
  readonly mutate: (parent: G, rng: SeededRng) => G
  readonly clone?: (genome: G) => G
  readonly evaluate: (genome: G) => Evaluation
}

export interface MapElitesSnapshot {
  readonly evaluations: number
  readonly occupied: number
  readonly totalNiches: number
  readonly coverage: number
  readonly qdScore: number
  readonly bestQuality: number
}

export class MapElites<G> {
  readonly archive = new Map<string, Elite<G>>()
  readonly history: MapElitesSnapshot[] = []
  evaluations = 0

  private readonly totalNicheCount: number
  private readonly explorationRate: number

  constructor(
    readonly problem: EvolutionProblem<G>,
    readonly bins: readonly number[],
    readonly rng: SeededRng,
    explorationRate = 0.12,
  ) {
    if (bins.length === 0 || bins.some(b => !Number.isInteger(b) || b < 1)) {
      throw new Error('Invalid MAP-Elites archive dimensions')
    }
    if (!Number.isFinite(explorationRate) || explorationRate < 0 || explorationRate > 1) {
      throw new Error(`Invalid explorationRate=${explorationRate}`)
    }
    this.totalNicheCount = bins.reduce((a, b) => a * b, 1)
    this.explorationRate = explorationRate
  }

  niche(behavior: readonly number[]): string {
    if (behavior.length !== this.bins.length) {
      throw new Error(
        `Wrong behavior dimensions: got ${behavior.length}, expected ${this.bins.length}`,
      )
    }

    return behavior
      .map((value, i) => {
        if (!Number.isFinite(value)) {
          throw new Error(`Invalid behavior descriptor at dim ${i}: ${value}`)
        }
        const normalized = Math.max(0, Math.min(1, value))
        const binCount = this.bins[i]!
        return Math.min(binCount - 1, Math.floor(normalized * binCount))
      })
      .join(':')
  }

  iterate(): Elite<G> | undefined {
    const currentElites = this.elites()
    let genome: G

    if (currentElites.length === 0 || this.rng.next() < this.explorationRate) {
      genome = this.problem.create(this.rng)
    } else {
      const parent = this.rng.pick(currentElites).genome
      const safeParent = this.problem.clone ? this.problem.clone(parent) : parent
      genome = this.problem.mutate(safeParent, this.rng)
    }

    const evaluation = this.problem.evaluate(genome)
    const key = this.niche(evaluation.behavior)
    const existing = this.archive.get(key)
    this.evaluations++

    if (
      Number.isFinite(evaluation.quality) &&
      (!existing || evaluation.quality > existing.evaluation.quality)
    ) {
      const storedGenome = this.problem.clone ? this.problem.clone(genome) : genome
      const elite: Elite<G> = {
        genome: storedGenome,
        evaluation,
        nicheKey: key,
        discoveredAtEvaluation: this.evaluations,
      }
      this.archive.set(key, elite)
      return elite
    }

    return undefined
  }

  run(iterations: number, snapshotEvery = 50): void {
    if (!Number.isInteger(iterations) || iterations < 0) {
      throw new Error(`Invalid iterations=${iterations}`)
    }
    for (let i = 0; i < iterations; i++) {
      this.iterate()
      if (snapshotEvery > 0 && (this.evaluations % snapshotEvery === 0 || i === iterations - 1)) {
        this.history.push(this.snapshot())
      }
    }
  }

  snapshot(): MapElitesSnapshot {
    const best = this.bestElite
    return {
      evaluations: this.evaluations,
      occupied: this.archive.size,
      totalNiches: this.totalNicheCount,
      coverage: this.coverage,
      qdScore: this.qdScore,
      bestQuality: best ? best.evaluation.quality : 0,
    }
  }

  get coverage(): number {
    return this.archive.size / this.totalNicheCount
  }

  get qdScore(): number {
    let total = 0
    for (const elite of this.archive.values()) {
      if (elite.evaluation.quality > 0) total += elite.evaluation.quality
    }
    return total
  }

  get bestElite(): Elite<G> | undefined {
    let best: Elite<G> | undefined
    for (const elite of this.elites()) {
      if (!best || elite.evaluation.quality > best.evaluation.quality) {
        best = elite
      }
    }
    return best
  }

  elites(): readonly Elite<G>[] {
    return [...this.archive.values()].sort((a, b) =>
      a.nicheKey < b.nicheKey ? -1 : a.nicheKey > b.nicheKey ? 1 : 0,
    )
  }
}

// =================================================================================================
// 3. CONTROLLED EXPERIMENT RUNNER (MATCHED SEEDS + EFFECT SIZE + FAILURE REPORTING)
// =================================================================================================

export interface TrialResult {
  readonly architecture: Id
  readonly seed: number
  readonly metrics: Readonly<Record<string, number>>
  readonly durationMs: number
  readonly failed: boolean
}

export interface Experiment<G> {
  readonly id: Id
  readonly name: string
  readonly trial: (genome: G, seed: number) => TrialResult
}

export interface MetricStats {
  readonly mean: number
  readonly stdDev: number
  readonly standardError: number
  readonly count: number
}

export interface ExperimentSummary {
  readonly experiment: Id
  readonly architecture: Id
  readonly results: readonly TrialResult[]
  readonly failureRate: number
  readonly summary: Readonly<Record<string, MetricStats>>
}

export interface ControlledComparison {
  readonly experiment: Id
  readonly primaryMetric: string
  readonly candidate: ExperimentSummary
  readonly control: ExperimentSummary
  readonly deltaMean: number
  readonly pairedStandardError: number
  readonly effectSize: number
  readonly candidateWinsMatchedSeeds: number
  readonly totalSeeds: number
}

export function computeEmpiricalStats(values: readonly number[]): MetricStats {
  const n = values.length
  if (n === 0) return { mean: 0, stdDev: 0, standardError: 0, count: 0 }
  const mean = values.reduce((a, b) => a + b, 0) / n
  if (n === 1) return { mean, stdDev: 0, standardError: 0, count: 1 }
  const variance =
    values.reduce((acc, v) => acc + (v - mean) * (v - mean), 0) / (n - 1)
  const stdDev = Math.sqrt(Math.max(0, variance))
  return {
    mean,
    stdDev,
    standardError: stdDev / Math.sqrt(n),
    count: n,
  }
}

export function computePairedEffectSize(
  candidateValues: readonly number[],
  controlValues: readonly number[],
): {
  readonly deltaMean: number
  readonly pairedStandardError: number
  readonly effectSize: number
} {
  const n = Math.min(candidateValues.length, controlValues.length)
  if (n < 2) return { deltaMean: 0, pairedStandardError: 0, effectSize: 0 }
  const diffs: number[] = []
  for (let i = 0; i < n; i++) diffs.push(candidateValues[i]! - controlValues[i]!)
  const diffStats = computeEmpiricalStats(diffs)
  const candStats = computeEmpiricalStats(candidateValues.slice(0, n))
  const ctrlStats = computeEmpiricalStats(controlValues.slice(0, n))
  const pooledStd = Math.sqrt(
    0.5 * (candStats.stdDev * candStats.stdDev + ctrlStats.stdDev * ctrlStats.stdDev),
  )
  const denom = pooledStd > 1e-12 ? pooledStd : diffStats.stdDev
  const effectSize =
    denom > 1e-12
      ? diffStats.mean / denom
      : Math.abs(diffStats.mean) > 1e-12
        ? Math.sign(diffStats.mean) * Math.sqrt(n)
        : 0
  return {
    deltaMean: diffStats.mean,
    pairedStandardError: diffStats.standardError,
    effectSize,
  }
}

export function runExperiment<G>(
  experiment: Experiment<G>,
  genome: G,
  seeds: readonly number[],
): ExperimentSummary {
  if (seeds.length === 0) {
    throw new Error('runExperiment requires at least one seed')
  }
  const results = seeds.map(seed => experiment.trial(genome, seed))
  const failedCount = results.filter(r => r.failed).length
  const metricNames = new Set<string>()
  for (const r of results) {
    for (const k of Object.keys(r.metrics)) metricNames.add(k)
  }

  const summary: Record<string, MetricStats> = {}
  for (const name of metricNames) {
    const vals = results
      .map(r => r.metrics[name])
      .filter((v): v is number => v !== undefined && Number.isFinite(v))
    summary[name] = computeEmpiricalStats(vals)
  }

  return {
    experiment: experiment.id,
    architecture: results[0]!.architecture,
    results,
    failureRate: failedCount / results.length,
    summary,
  }
}

export function runControlledExperiment<G>(
  experiment: Experiment<G>,
  candidate: G,
  control: G,
  seeds: readonly number[],
  primaryMetric: string,
): ControlledComparison {
  const candSummary = runExperiment(experiment, candidate, seeds)
  const ctrlSummary = runExperiment(experiment, control, seeds)

  const candVals: number[] = []
  const ctrlVals: number[] = []
  let wins = 0
  for (let i = 0; i < seeds.length; i++) {
    const cv = candSummary.results[i]!.metrics[primaryMetric] ?? 0
    const bv = ctrlSummary.results[i]!.metrics[primaryMetric] ?? 0
    candVals.push(cv)
    ctrlVals.push(bv)
    if (cv - bv > 1e-12) wins++
  }

  const paired = computePairedEffectSize(candVals, ctrlVals)

  return {
    experiment: experiment.id,
    primaryMetric,
    candidate: candSummary,
    control: ctrlSummary,
    deltaMean: paired.deltaMean,
    pairedStandardError: paired.pairedStandardError,
    effectSize: paired.effectSize,
    candidateWinsMatchedSeeds: wins,
    totalSeeds: seeds.length,
  }
}

// =================================================================================================
// 4. UNIVERSAL NAVIGATION ENGINE (6 DOMAINS + ACTIVE CAUSAL PROPAGATION-DELAY PRUNING)
// =================================================================================================

export type NavigationDomain =
  | 'spatial'
  | 'relational'
  | 'hierarchical'
  | 'semantic'
  | 'temporal'
  | 'introspective'

export type ReferenceRelation =
  | 'physical'
  | 'logical'
  | 'semantic'
  | 'historical'
  | 'representational'

export interface Reference {
  readonly target: Id
  readonly relation: ReferenceRelation
  readonly accessCost: number
  readonly propagationDelay: number
}

export interface NavigationEdge<N> {
  readonly to: N
  readonly cost: number
  readonly propagationDelay?: number
  readonly relation?: ReferenceRelation
}

export interface NavigationSpace<N> {
  readonly domain: NavigationDomain
  readonly key: (node: N) => string
  readonly neighbors: (node: N) => Iterable<NavigationEdge<N>>
  readonly heuristic?: (node: N, goal: N) => number
}

export interface Route<N> {
  readonly domain: NavigationDomain
  readonly nodes: readonly N[]
  readonly hops: number
  readonly cost: number
  readonly totalPropagationDelay: number
  readonly expanded: number
  readonly prunedCausalEdges: number
  readonly obeysCausalFloor: boolean
}

export interface NavigateOptions<N = unknown> {
  readonly budget?: number
  readonly minPhysicalDelay?: number
  readonly physicalDistance?: (a: N, b: N) => number
  readonly enforceCausalFloor?: boolean
}

export function navigate<N>(
  space: NavigationSpace<N>,
  start: N,
  goal: N,
  options?: NavigateOptions<N>,
): Route<N> | undefined {
  const budget = options?.budget ?? 100_000
  const minPhysicalDelay = options?.minPhysicalDelay ?? 0
  const physicalDistance = options?.physicalDistance
  const enforceCausalFloor = options?.enforceCausalFloor ?? true
  const target = space.key(goal)
  const source = space.key(start)

  const open = new Map<string, N>()
  const distance = new Map<string, number>()
  const delayMap = new Map<string, number>()
  const previous = new Map<string, string>()
  const nodes = new Map<string, N>()

  open.set(source, start)
  nodes.set(source, start)
  distance.set(source, 0)
  delayMap.set(source, 0)

  const heuristic = space.heuristic ?? (() => 0)
  let expanded = 0
  let prunedCausalEdges = 0

  while (open.size > 0 && expanded < budget) {
    let best: string | undefined
    let bestScore = Infinity

    for (const [key, node] of open) {
      const f = distance.get(key)! + heuristic(node, goal)
      if (f < bestScore || (f === bestScore && best !== undefined && key < best)) {
        best = key
        bestScore = f
      }
    }

    if (best === undefined) break

    const current = open.get(best)!
    const cost = distance.get(best)!
    const currentDelay = delayMap.get(best)!

    open.delete(best)
    expanded++

    if (best === target) {
      const obeys = currentDelay + 1e-12 >= minPhysicalDelay
      if (enforceCausalFloor && !obeys) {
        prunedCausalEdges++
        continue
      }
      const path: N[] = []
      let cursor: string | undefined = best
      while (cursor !== undefined) {
        path.push(nodes.get(cursor)!)
        cursor = previous.get(cursor)
      }
      path.reverse()
      return {
        domain: space.domain,
        nodes: path,
        hops: Math.max(0, path.length - 1),
        cost,
        totalPropagationDelay: currentDelay,
        expanded,
        prunedCausalEdges,
        obeysCausalFloor: obeys,
      }
    }

    for (const edge of space.neighbors(current)) {
      if (!Number.isFinite(edge.cost) || edge.cost < 0) {
        throw new Error(`Invalid navigation cost: ${edge.cost}`)
      }
      const edgeDelay = edge.propagationDelay ?? edge.cost
      if (!Number.isFinite(edgeDelay) || edgeDelay < 0) {
        throw new Error(`Invalid propagationDelay: ${edgeDelay}`)
      }

      // Active per-edge causal light-cone pruning inside A* neighbor expansion
      if (enforceCausalFloor && physicalDistance !== undefined) {
        const edgeFloor = physicalDistance(current, edge.to)
        if (!Number.isFinite(edgeFloor) || edgeFloor < 0) {
          throw new Error(`Invalid physicalDistance: ${edgeFloor}`)
        }
        if (edgeDelay + 1e-12 < edgeFloor) {
          prunedCausalEdges++
          continue
        }
      }

      const key = space.key(edge.to)
      const nextCost = cost + edge.cost
      const nextDelay = currentDelay + edgeDelay

      // Active goal-level causal floor pruning so illegal teleport edges never dominate legal routes
      if (enforceCausalFloor && key === target && nextDelay + 1e-12 < minPhysicalDelay) {
        prunedCausalEdges++
        continue
      }

      const prevBestCost = distance.get(key) ?? Infinity
      if (nextCost > prevBestCost - 1e-12) continue

      distance.set(key, nextCost)
      delayMap.set(key, nextDelay)
      previous.set(key, best)
      nodes.set(key, edge.to)
      open.set(key, edge.to)
    }
  }

  return undefined
}

// =================================================================================================
// 5. ASSOCIATION MEMORY (SPREADING ACTIVATION: a_{t+1} = (1 - lam) s + lam P^T a_t)
// =================================================================================================

export type MentalValue =
  | null
  | boolean
  | number
  | string
  | readonly MentalValue[]
  | { readonly [key: string]: MentalValue }

export type MentalNodeKind =
  | 'concept'
  | 'perception'
  | 'memory'
  | 'event'
  | 'entity'
  | 'program'
  | 'model'
  | 'goal'
  | 'self'
  | 'collection'

export type MentalRelationType =
  | 'contains'
  | 'instance-of'
  | 'similar-to'
  | 'causes'
  | 'precedes'
  | 'represents'
  | 'contradicts'
  | 'supports'
  | 'references'
  | 'predicts'

export interface MentalNode {
  readonly id: Id
  readonly kind: MentalNodeKind
  readonly value: MentalValue
  readonly confidence: number
  readonly salience: number
  readonly createdAt: Tick
  readonly lastAccessedAt: Tick
  readonly realization: Realization
}

export interface MentalRelation {
  readonly id: Id
  readonly from: Id
  readonly to: Id
  readonly type: MentalRelationType
  readonly strength: number
}

export interface ActivationHit {
  readonly node: MentalNode
  readonly activation: number
}

export class AssociationMemory {
  readonly nodes = new Map<Id, MentalNode>()
  readonly edges = new Map<Id, MentalRelation[]>()

  add(node: MentalNode): void {
    this.nodes.set(node.id, node)
  }

  connect(edge: MentalRelation): void {
    if (!this.nodes.has(edge.from) || !this.nodes.has(edge.to)) {
      throw new Error(`Unknown association endpoint: ${edge.from} -> ${edge.to}`)
    }
    if (!Number.isFinite(edge.strength) || edge.strength < 0) {
      throw new Error(`Invalid association edge strength: ${edge.strength}`)
    }
    const list = this.edges.get(edge.from) ?? []
    list.push(edge)
    this.edges.set(edge.from, list)
  }

  activate(
    seedOrCue: Id | ReadonlyMap<Id, number>,
    iterations = 25,
    decay = 0.85,
  ): readonly ActivationHit[] {
    if (!Number.isFinite(decay) || decay < 0 || decay >= 1) {
      throw new Error(`Invalid decay=${decay}`)
    }

    const seedVec = new Map<Id, number>()
    if (typeof seedOrCue === 'string') {
      if (!this.nodes.has(seedOrCue)) {
        throw new Error(`Unknown seed node: ${seedOrCue}`)
      }
      seedVec.set(seedOrCue, 1)
    } else {
      let sum = 0
      for (const [id, w] of seedOrCue) {
        if (!this.nodes.has(id)) throw new Error(`Unknown cue node: ${id}`)
        if (w > 0) sum += w
      }
      if (sum <= 0) throw new Error('Cue vector must have positive weight')
      for (const [id, w] of seedOrCue) {
        if (w > 0) seedVec.set(id, w / sum)
      }
    }

    let current = new Map<Id, number>(seedVec)

    for (let iter = 0; iter < iterations; iter++) {
      const next = new Map<Id, number>()
      for (const [sid, sw] of seedVec) {
        next.set(sid, (1 - decay) * sw)
      }

      const add = (id: Id, val: number): void => {
        next.set(id, (next.get(id) ?? 0) + val)
      }

      for (const [id, activity] of current) {
        const outEdges = this.edges.get(id) ?? []
        const total = outEdges.reduce((acc, e) => acc + e.strength, 0)
        if (total === 0) {
          for (const [sid, sw] of seedVec) {
            add(sid, activity * decay * sw)
          }
          continue
        }
        for (const e of outEdges) {
          add(e.to, (decay * activity * e.strength) / total)
        }
      }

      current = next
    }

    return [...current.entries()]
      .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
      .map(([id, activation]) => ({
        node: this.nodes.get(id)!,
        activation,
      }))
  }
}

// =================================================================================================
// 6. CONFIGURABLE DELAYED-EDGE RECURRENT COGNITIVE NETWORK (WITH COUNTERFACTUAL LESIONS)
// =================================================================================================

export interface NeuralNode {
  readonly id: Id
  readonly bias: number
  readonly kind?: ProcessKind
}

export interface NeuralEdge {
  readonly from: Id
  readonly to: Id
  readonly weight: number
  readonly delay: number
}

export class CognitiveNetwork {
  readonly index = new Map<Id, number>()
  readonly nodes: readonly NeuralNode[]
  readonly edges: readonly NeuralEdge[]
  readonly lesionedNodes: ReadonlySet<Id>
  readonly trajectory: Float64Array[] = []

  private readonly delayBuffer: Float64Array[] = []
  private readonly maxDelay: number
  state: Float64Array

  constructor(
    nodes: readonly NeuralNode[],
    edges: readonly NeuralEdge[],
    lesionedNodes: ReadonlySet<Id> = new Set(),
  ) {
    this.nodes = nodes.map(n => ({ ...n }))
    this.edges = edges.map(e => ({ ...e }))
    this.lesionedNodes = new Set(lesionedNodes)
    this.state = new Float64Array(this.nodes.length)

    this.nodes.forEach((node, i) => {
      if (this.index.has(node.id)) {
        throw new Error(`Duplicate neural node id: ${node.id}`)
      }
      this.index.set(node.id, i)
    })

    let maxD = 0
    for (const edge of this.edges) {
      if (!this.index.has(edge.from) || !this.index.has(edge.to)) {
        throw new Error(`Unknown neural edge endpoint: ${edge.from} -> ${edge.to}`)
      }
      if (!Number.isInteger(edge.delay) || edge.delay < 0) {
        throw new Error(`Invalid neural edge delay: ${edge.delay}`)
      }
      if (edge.delay > maxD) maxD = edge.delay
    }
    this.maxDelay = maxD
  }

  reset(): void {
    this.state = new Float64Array(this.nodes.length)
    this.delayBuffer.length = 0
    this.trajectory.length = 0
  }

  step(input: ReadonlyMap<Id, number>): Float64Array {
    const n = this.nodes.length
    const sums = new Float64Array(n)
    for (let i = 0; i < n; i++) {
      const node = this.nodes[i]!
      if (this.lesionedNodes.has(node.id)) {
        sums[i] = 0
      } else {
        sums[i] = node.bias + (input.get(node.id) ?? 0)
      }
    }

    for (const edge of this.edges) {
      if (this.lesionedNodes.has(edge.from) || this.lesionedNodes.has(edge.to)) {
        continue
      }
      const from = this.index.get(edge.from)!
      const to = this.index.get(edge.to)!
      const past =
        edge.delay === 0
          ? this.state
          : this.delayBuffer[this.delayBuffer.length - edge.delay]
      const val = past ? past[from]! : 0
      sums[to] = sums[to]! + edge.weight * val
    }

    const next = new Float64Array(n)
    for (let i = 0; i < n; i++) {
      const node = this.nodes[i]!
      next[i] = this.lesionedNodes.has(node.id) ? 0 : Math.tanh(sums[i]!)
    }

    this.delayBuffer.push(this.state)
    while (this.delayBuffer.length > this.maxDelay) {
      this.delayBuffer.shift()
    }
    this.state = next
    const copy = next.slice()
    this.trajectory.push(copy)
    return copy
  }

  readNode(nodeId: Id): number {
    const idx = this.index.get(nodeId)
    if (idx === undefined) throw new Error(`Unknown nodeId: ${nodeId}`)
    return this.state[idx]!
  }

  lesionNode(nodeId: Id): CognitiveNetwork {
    if (!this.index.has(nodeId)) {
      throw new Error(`Cannot lesion unknown nodeId: ${nodeId}`)
    }
    const nextLesions = new Set(this.lesionedNodes)
    nextLesions.add(nodeId)
    return new CognitiveNetwork(this.nodes, this.edges, nextLesions)
  }

  toMindArchitecture(id: Id, mode: RealizationMode = 'abstract'): MindArchitecture {
    const processes: CognitiveProcess[] = this.nodes.map(n => ({
      id: n.id,
      kind: n.kind ?? 'interpreter',
      capacity: 1,
      updatePeriod: 1,
      parameters: { bias: n.bias },
    }))
    const connections: CognitiveConnection[] = this.edges
      .filter(e => !this.lesionedNodes.has(e.from) && !this.lesionedNodes.has(e.to))
      .map(e => ({
        from: e.from,
        to: e.to,
        bandwidth: 1,
        latency: e.delay + 1,
        weight: e.weight,
      }))
    return {
      id,
      processes,
      connections,
      realization: {
        mode,
        components: this.nodes.map(n => n.id),
      },
    }
  }
}
