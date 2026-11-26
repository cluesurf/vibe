// Vibe Atlas Registry: Universal Organization Model, Capability Evidence,
// Evolutionary Discovery Lineage, Realization Compiler Commuting-Diagram Verifier
// (D o B^tau o E = F), and Epistemically Quarantined Phenomenal Constitution Hypotheses.
//
// Strictly deterministic, zero Math.random(), zero external dependencies.

export type Id = string
export type Tick = bigint
export type Valence = -1 | 0 | 1

export type RealizationMode = 'field' | 'verified-effective' | 'abstract'

export type EpistemicTier = 'tier_a_exact' | 'tier_b_effective' | 'tier_c_speculative'

export interface Port {
  readonly id: Id
  readonly direction: 'input' | 'output' | 'bidirectional'
  readonly protocol: Id
  readonly capacity: number
  readonly latency: number
}

export interface Realization {
  readonly mode: RealizationMode
  readonly sites?: readonly Id[]
  readonly events?: readonly Id[]
  readonly components?: readonly Id[]
  readonly certificate?: Id
}

export interface Organization<S = unknown> {
  readonly id: Id
  readonly type: Id
  readonly state: S
  readonly realization: Realization
  readonly components: readonly Id[]
  readonly interfaces: readonly Port[]
  readonly createdAt: Tick
  readonly lineage: readonly Id[]
}

// All 19 operational capabilities from Note 18 Section 4.
// No organization receives a capability string without passing an explicit controlled protocol.
export type Capability =
  | 'persist'
  | 'propagate'
  | 'bind'
  | 'repair'
  | 'replicate'
  | 'regulate'
  | 'encode'
  | 'remember'
  | 'retrieve'
  | 'reference'
  | 'communicate'
  | 'navigate'
  | 'predict'
  | 'learn'
  | 'plan'
  | 'imagine'
  | 'self-model'
  | 'coordinate'
  | 'redesign'

export const ALL_CAPABILITIES: readonly Capability[] = [
  'persist',
  'propagate',
  'bind',
  'repair',
  'replicate',
  'regulate',
  'encode',
  'remember',
  'retrieve',
  'reference',
  'communicate',
  'navigate',
  'predict',
  'learn',
  'plan',
  'imagine',
  'self-model',
  'coordinate',
  'redesign',
] as const

export interface CapabilityEvidence {
  readonly capability: Capability
  readonly protocol: Id
  readonly score: number
  readonly trials: number
  readonly baseline: number
  readonly standardError: number
  readonly effectSize: number
  readonly passed: boolean
  readonly experiment: Id
  readonly realizationMode: RealizationMode
}

export interface CapabilityCertificationInput {
  readonly capability: Capability
  readonly protocol: Id
  readonly experiment: Id
  readonly realizationMode: RealizationMode
  readonly score: number
  readonly baseline: number
  readonly standardError: number
  readonly effectSize: number
  readonly trials: number
  readonly minMargin: number
  readonly minEffectSize?: number
  readonly failureRate?: number
  readonly maxFailureRate?: number
}

export function certifyCapability(input: CapabilityCertificationInput): CapabilityEvidence {
  const minEffect = input.minEffectSize ?? 0
  const failRate = input.failureRate ?? 0
  const maxFail = input.maxFailureRate ?? 0.25
  const finite =
    Number.isFinite(input.score) &&
    Number.isFinite(input.baseline) &&
    Number.isFinite(input.effectSize) &&
    input.trials >= 1
  const passed =
    finite &&
    input.score >= input.baseline + input.minMargin &&
    input.effectSize >= minEffect &&
    failRate <= maxFail

  return {
    capability: input.capability,
    protocol: input.protocol,
    score: input.score,
    trials: input.trials,
    baseline: input.baseline,
    standardError: Number.isFinite(input.standardError) ? input.standardError : 0,
    effectSize: Number.isFinite(input.effectSize) ? input.effectSize : 0,
    passed,
    experiment: input.experiment,
    realizationMode: input.realizationMode,
  }
}

export type ProcessKind =
  | 'sensor'
  | 'filter'
  | 'attention'
  | 'workspace'
  | 'associative-memory'
  | 'episodic-memory'
  | 'semantic-memory'
  | 'predictor'
  | 'planner'
  | 'interpreter'
  | 'self-model'
  | 'regulator'
  | 'actuator'
  | 'communicator'
  | 'subagent'

export interface CognitiveProcess {
  readonly id: Id
  readonly kind: ProcessKind
  readonly capacity: number
  readonly updatePeriod: number
  readonly parameters: Readonly<Record<string, number>>
}

export interface CognitiveConnection {
  readonly from: Id
  readonly to: Id
  readonly bandwidth: number
  readonly latency: number
  readonly weight: number
}

export interface MindArchitecture {
  readonly id: Id
  readonly processes: readonly CognitiveProcess[]
  readonly connections: readonly CognitiveConnection[]
  readonly realization: Realization
}

export type DiscoveryCategory =
  | 'particle'
  | 'composite'
  | 'memory'
  | 'computation'
  | 'organism'
  | 'mind'
  | 'collective'

export type AtlasSection = 'forms' | 'lives' | 'minds' | 'collectives'

export interface Discovery<G = unknown> {
  readonly id: Id
  readonly label: string
  readonly category: DiscoveryCategory
  readonly atlas: AtlasSection
  readonly parentIds: readonly Id[]
  readonly inheritedCapabilities: readonly Capability[]
  readonly acquiredCapabilities: readonly Capability[]
  readonly lostCapabilities: readonly Capability[]
  readonly generation: number
  readonly realizationMode: RealizationMode
  readonly genome: G
  readonly evidence: readonly CapabilityEvidence[]
  readonly metrics: Readonly<Record<string, number>>
  readonly certificateId?: Id
}

export interface DiscoveryRegistrationInput<G = unknown> {
  readonly id: Id
  readonly label: string
  readonly category: DiscoveryCategory
  readonly atlas: AtlasSection
  readonly parentIds: readonly Id[]
  readonly generation: number
  readonly realizationMode: RealizationMode
  readonly genome: G
  readonly evidence: readonly CapabilityEvidence[]
  readonly metrics: Readonly<Record<string, number>>
  readonly certificateId?: Id
}

// =================================================================================================
// REALIZATION COMPILER & COMMUTING DIAGRAM VERIFIER: D o B^tau o E = F
// =================================================================================================

export interface RealizationTarget {
  readonly level: Id
  readonly availablePrimitives: readonly Id[]
  readonly maxSize: number
  readonly maxDuration: number
}

export interface RealizationCertificate {
  readonly id: Id
  readonly sourceArchitecture: Id
  readonly implementation: Id
  readonly sourceMode: RealizationMode
  readonly targetMode: RealizationMode
  readonly preservedObservables: readonly Id[]
  readonly tau: number
  readonly sampleCount: number
  readonly errorBound: number
  readonly tolerance: number
  readonly passed: boolean
  readonly verification: 'exhaustive' | 'formal' | 'statistical'
  readonly worstInputIndex: number
}

export interface RealizationCompiler<Source, Target> {
  compile(
    source: Source,
    target: RealizationTarget,
  ):
    | {
        readonly implementation: Target
        readonly certificate?: RealizationCertificate
      }
    | undefined
}

export interface RealizationDiagramSpec<X, Z> {
  readonly id: Id
  readonly sourceArchitecture: Id
  readonly implementation: Id
  readonly sourceMode: RealizationMode
  readonly targetMode: RealizationMode
  readonly preservedObservables: readonly Id[]
  readonly verification: 'exhaustive' | 'formal' | 'statistical'
  readonly tau: number
  readonly tolerance: number
  readonly encode: (x: X) => Z
  readonly stepBase: (z: Z) => Z
  readonly decode: (z: Z) => X
  readonly abstractMap: (x: X) => X
  readonly distance: (a: X, b: X) => number
}

// Evaluates exact worst-case commuting-diagram error:
//   max_{x in S} d(D(B^tau(E(x))), F(x)) <= eps
export function verifyRealizationDiagram<X, Z>(
  spec: RealizationDiagramSpec<X, Z>,
  domain: readonly X[],
): RealizationCertificate {
  if (!Number.isInteger(spec.tau) || spec.tau < 0) {
    throw new Error(`Invalid commuting-diagram horizon tau=${spec.tau}`)
  }
  if (!Number.isFinite(spec.tolerance) || spec.tolerance < 0) {
    throw new Error(`Invalid tolerance=${spec.tolerance}`)
  }
  if (domain.length === 0) {
    throw new Error('Cannot certify commuting diagram on an empty domain')
  }

  let maxError = 0
  let worstInputIndex = 0

  for (let i = 0; i < domain.length; i++) {
    const x = domain[i]!
    let z = spec.encode(x)
    for (let t = 0; t < spec.tau; t++) {
      z = spec.stepBase(z)
    }
    const decoded = spec.decode(z)
    const expected = spec.abstractMap(x)
    const err = spec.distance(decoded, expected)
    if (!Number.isFinite(err) || err < 0) {
      throw new Error(`Invalid diagram distance ${err} at sample index ${i}`)
    }
    if (err > maxError) {
      maxError = err
      worstInputIndex = i
    }
  }

  return {
    id: spec.id,
    sourceArchitecture: spec.sourceArchitecture,
    implementation: spec.implementation,
    sourceMode: spec.sourceMode,
    targetMode: spec.targetMode,
    preservedObservables: spec.preservedObservables,
    tau: spec.tau,
    sampleCount: domain.length,
    errorBound: maxError,
    tolerance: spec.tolerance,
    passed: maxError <= spec.tolerance,
    verification: spec.verification,
    worstInputIndex,
  }
}

// =================================================================================================
// QUARANTINED PHENOMENAL CONSTITUTION HYPOTHESES (STRICTLY SEPARATE FROM DYNAMICAL CERTIFICATES)
// =================================================================================================

export type PhenomenalRelationType =
  | 'co-present'
  | 'experienced-before'
  | 'experienced-near'
  | 'similar-quality'
  | 'belongs-to-self'
  | 'attended'

export interface PhenomenalRelation {
  readonly from: Id
  readonly to: Id
  readonly type: PhenomenalRelationType
  readonly weight: number
}

export interface PhenomenalContext {
  readonly id: Id
  readonly epistemicStatus: 'competing_unverified_hypothesis'
  readonly realization: readonly Id[]
  readonly contents: readonly Id[]
  readonly relations: readonly PhenomenalRelation[]
  readonly hypothesis: Id
  readonly interval: readonly [Tick, Tick]
  readonly attributionScore: number
  readonly subjectCount: number
}

export interface ConstitutionHypothesis {
  readonly id: Id
  readonly label: string
  readonly epistemicStatus: 'competing_unverified_hypothesis'
  readonly theoreticalBasis: string
  readonly selectContexts: (
    architecture: MindArchitecture,
    history: readonly Float64Array[],
  ) => readonly PhenomenalContext[]
}

export function isCompetingPhenomenalHypothesis(
  value: unknown,
): value is ConstitutionHypothesis {
  if (typeof value !== 'object' || value === null) return false
  const rec = value as Record<string, unknown>
  return (
    typeof rec['id'] === 'string' &&
    rec['epistemicStatus'] === 'competing_unverified_hypothesis' &&
    typeof rec['selectContexts'] === 'function'
  )
}

function computeNodeStats(
  n: number,
  history: readonly Float64Array[],
): {
  readonly meanAbs: Float64Array
  readonly variance: Float64Array
  readonly lag1AutoCorr: Float64Array
} {
  const mean = new Float64Array(n)
  const meanAbs = new Float64Array(n)
  const variance = new Float64Array(n)
  const lag1AutoCorr = new Float64Array(n)
  const steps = history.length
  if (steps === 0) return { meanAbs, variance, lag1AutoCorr }

  for (let t = 0; t < steps; t++) {
    const row = history[t]!
    for (let i = 0; i < n; i++) {
      const v = row[i] ?? 0
      mean[i] = mean[i]! + v
      meanAbs[i] = meanAbs[i]! + Math.abs(v)
    }
  }
  for (let i = 0; i < n; i++) {
    mean[i] = mean[i]! / steps
    meanAbs[i] = meanAbs[i]! / steps
  }
  for (let t = 0; t < steps; t++) {
    const row = history[t]!
    for (let i = 0; i < n; i++) {
      const d = (row[i] ?? 0) - mean[i]!
      variance[i] = variance[i]! + d * d
    }
  }
  for (let i = 0; i < n; i++) {
    variance[i] = variance[i]! / steps
  }
  if (steps >= 2) {
    for (let i = 0; i < n; i++) {
      let num = 0
      let denA = 0
      let denB = 0
      for (let t = 0; t < steps - 1; t++) {
        const a = (history[t]![i] ?? 0) - mean[i]!
        const b = (history[t + 1]![i] ?? 0) - mean[i]!
        num += a * b
        denA += a * a
        denB += b * b
      }
      const den = Math.sqrt(denA * denB)
      lag1AutoCorr[i] = den > 1e-12 ? Math.abs(num / den) : 0
    }
  }
  return { meanAbs, variance, lag1AutoCorr }
}

function findStronglyConnectedComponents(
  ids: readonly Id[],
  edges: readonly CognitiveConnection[],
  minWeight = 0.05,
): {
  readonly sccs: readonly (readonly Id[])[]
  readonly hasSelfLoop: ReadonlySet<Id>
} {
  const idxMap = new Map<Id, number>()
  const adj: number[][] = ids.map((_, i) => {
    idxMap.set(ids[i]!, i)
    return []
  })
  const hasSelfLoop = new Set<Id>()
  for (const e of edges) {
    if (Math.abs(e.weight) < minWeight) continue
    const u = idxMap.get(e.from)
    const v = idxMap.get(e.to)
    if (u === undefined || v === undefined) continue
    adj[u]!.push(v)
    if (u === v) hasSelfLoop.add(e.from)
  }

  let index = 0
  const indices = new Int32Array(ids.length).fill(-1)
  const lowlink = new Int32Array(ids.length).fill(0)
  const onStack = new Uint8Array(ids.length)
  const stack: number[] = []
  const sccs: Id[][] = []

  const strongConnect = (v: number): void => {
    indices[v] = index
    lowlink[v] = index
    index++
    stack.push(v)
    onStack[v] = 1

    for (const w of adj[v]!) {
      if (indices[w]! === -1) {
        strongConnect(w)
        lowlink[v] = Math.min(lowlink[v]!, lowlink[w]!)
      } else if (onStack[w]! === 1) {
        lowlink[v] = Math.min(lowlink[v]!, indices[w]!)
      }
    }

    if (lowlink[v]! === indices[v]!) {
      const comp: Id[] = []
      while (stack.length > 0) {
        const w = stack.pop()!
        onStack[w] = 0
        comp.push(ids[w]!)
        if (w === v) break
      }
      sccs.push(comp)
    }
  }

  for (let i = 0; i < ids.length; i++) {
    if (indices[i]! === -1) strongConnect(i)
  }

  return { sccs, hasSelfLoop }
}

// Four competing, strictly quarantined phenomenal constitution hypotheses from Note 18 Section 20.
// Every output carries epistemicStatus: 'competing_unverified_hypothesis'.
export function createStandardConstitutionHypotheses(): readonly ConstitutionHypothesis[] {
  const localValence: ConstitutionHypothesis = {
    id: 'local_valence',
    label: 'Local Primitive Valence Occurrences',
    epistemicStatus: 'competing_unverified_hypothesis',
    theoreticalBasis:
      'Every locally active node exceeding valence activation threshold is treated as an ununified primitive experiential occurrence.',
    selectContexts(architecture, history) {
      const n = architecture.processes.length
      const stats = computeNodeStats(n, history)
      const endTick = BigInt(Math.max(0, history.length - 1))
      const contexts: PhenomenalContext[] = []
      for (let i = 0; i < n; i++) {
        const proc = architecture.processes[i]!
        const act = stats.meanAbs[i]!
        if (act > 0.03) {
          contexts.push({
            id: `ctx:local_valence:${architecture.id}:${proc.id}`,
            epistemicStatus: 'competing_unverified_hypothesis',
            realization: [proc.id],
            contents: [proc.id],
            relations: [],
            hypothesis: 'local_valence',
            interval: [0n, endTick],
            attributionScore: Math.min(1, act),
            subjectCount: 1,
          })
        }
      }
      return contexts
    },
  }

  const recurrentLoop: ConstitutionHypothesis = {
    id: 'recurrent_loop',
    label: 'Recurrent Closed-Loop Unity',
    epistemicStatus: 'competing_unverified_hypothesis',
    theoreticalBasis:
      'Unified subjectivity is hypothesized to require closed recurrent feedback loops (nontrivial strongly connected components or active self-loops) with sustained temporal autocorrelation.',
    selectContexts(architecture, history) {
      const ids = architecture.processes.map(p => p.id)
      const idxMap = new Map<Id, number>(ids.map((id, i) => [id, i]))
      const stats = computeNodeStats(ids.length, history)
      const { sccs, hasSelfLoop } = findStronglyConnectedComponents(
        ids,
        architecture.connections,
      )
      const endTick = BigInt(Math.max(0, history.length - 1))
      const contexts: PhenomenalContext[] = []

      for (const comp of sccs) {
        const cyclic = comp.length >= 2 || (comp.length === 1 && hasSelfLoop.has(comp[0]!))
        if (!cyclic) continue

        let avgAuto = 0
        let avgAct = 0
        for (const id of comp) {
          const idx = idxMap.get(id)!
          avgAuto += stats.lag1AutoCorr[idx]!
          avgAct += stats.meanAbs[idx]!
        }
        avgAuto /= comp.length
        avgAct /= comp.length
        const score = Math.min(1, avgAuto * Math.min(1, avgAct * 2.5))
        if (score < 0.08) continue

        const compSet = new Set(comp)
        const relations: PhenomenalRelation[] = architecture.connections
          .filter(c => compSet.has(c.from) && compSet.has(c.to) && Math.abs(c.weight) >= 0.05)
          .map(c => ({
            from: c.from,
            to: c.to,
            type: 'co-present' as const,
            weight: Math.abs(c.weight),
          }))

        contexts.push({
          id: `ctx:recurrent_loop:${architecture.id}:${comp.slice().sort().join('+')}`,
          epistemicStatus: 'competing_unverified_hypothesis',
          realization: comp,
          contents: comp,
          relations,
          hypothesis: 'recurrent_loop',
          interval: [0n, endTick],
          attributionScore: score,
          subjectCount: 1,
        })
      }
      return contexts
    },
  }

  const globalWorkspace: ConstitutionHypothesis = {
    id: 'global_workspace',
    label: 'Global Broadcast Workspace Unity',
    epistemicStatus: 'competing_unverified_hypothesis',
    theoreticalBasis:
      'Unified subjectivity is hypothesized to require a dedicated central workspace broadcast hub receiving from multiple specialists and broadcasting back across modules.',
    selectContexts(architecture, history) {
      const ids = architecture.processes.map(p => p.id)
      const idxMap = new Map<Id, number>(ids.map((id, i) => [id, i]))
      const stats = computeNodeStats(ids.length, history)
      const endTick = BigInt(Math.max(0, history.length - 1))

      const inNeighbors = new Map<Id, Set<Id>>()
      const outNeighbors = new Map<Id, Set<Id>>()
      for (const id of ids) {
        inNeighbors.set(id, new Set())
        outNeighbors.set(id, new Set())
      }
      for (const c of architecture.connections) {
        if (Math.abs(c.weight) < 0.08 || c.from === c.to) continue
        inNeighbors.get(c.to)?.add(c.from)
        outNeighbors.get(c.from)?.add(c.to)
      }

      const contexts: PhenomenalContext[] = []
      for (const proc of architecture.processes) {
        const ins = inNeighbors.get(proc.id)!
        const outs = outNeighbors.get(proc.id)!
        // Global workspace criterion: bidirectional hub coupled to >= 2 specialist modules
        // (receiving specialist inputs AND broadcasting back to them, not a 1-way feedforward funnel).
        const bidirectionalCount = [...ins].filter(id => outs.has(id)).length
        const totalNodes = Math.max(1, architecture.processes.length)
        const degreeSum = architecture.processes.reduce(
          (acc, p) => acc + inNeighbors.get(p.id)!.size + outNeighbors.get(p.id)!.size,
          0,
        )
        const avgDegree = degreeSum / totalNodes
        const hubDegree = ins.size + outs.size
        const isDedicatedWorkspace =
          proc.kind === 'workspace' && bidirectionalCount >= 2
        const isCentralBottleneck =
          bidirectionalCount >= 2 && hubDegree >= avgDegree * 1.35

        if (!isDedicatedWorkspace && !isCentralBottleneck) continue

        const hubIdx = idxMap.get(proc.id)!
        const hubActivity = stats.meanAbs[hubIdx]!
        const hubVar = stats.variance[hubIdx]!
        if (hubActivity < 0.04 || hubVar < 1e-4) continue

        const broadcastMembers = Array.from(new Set<Id>([proc.id, ...ins, ...outs]))
        const relations: PhenomenalRelation[] = broadcastMembers
          .filter(m => m !== proc.id)
          .map(m => ({
            from: proc.id,
            to: m,
            type: 'attended' as const,
            weight: Math.min(1, hubActivity),
          }))

        const reachFraction = broadcastMembers.length / totalNodes
        const score = Math.min(1, reachFraction * Math.min(1, hubActivity * 2))

        contexts.push({
          id: `ctx:global_workspace:${architecture.id}:${proc.id}`,
          epistemicStatus: 'competing_unverified_hypothesis',
          realization: broadcastMembers,
          contents: broadcastMembers,
          relations,
          hypothesis: 'global_workspace',
          interval: [0n, endTick],
          attributionScore: score,
          subjectCount: 1,
        })
      }
      return contexts
    },
  }

  const causalPartitionIntegration: ConstitutionHypothesis = {
    id: 'causal_partition_integration',
    label: 'Minimum-Partition Causal Integration (Phi-MIP Surrogate)',
    epistemicStatus: 'competing_unverified_hypothesis',
    theoreticalBasis:
      'Unified subjectivity is hypothesized to track irreducible bidirectional causal influence across the weakest bipartition (minimum information partition surrogate) weighted by trajectory differentiation.',
    selectContexts(architecture, history) {
      const n = architecture.processes.length
      if (n < 2) return []
      const ids = architecture.processes.map(p => p.id)
      const idxMap = new Map<Id, number>(ids.map((id, i) => [id, i]))
      const stats = computeNodeStats(n, history)
      const endTick = BigInt(Math.max(0, history.length - 1))

      // Effective dynamic coupling matrix W_eff[to][from] = |w_{from->to}| * sqrt(var(from))
      const eff = new Float64Array(n * n)
      for (const c of architecture.connections) {
        const u = idxMap.get(c.from)
        const v = idxMap.get(c.to)
        if (u === undefined || v === undefined || u === v) continue
        const stdFrom = Math.sqrt(Math.max(0, stats.variance[u]!))
        eff[v * n + u] = eff[v * n + u]! + Math.abs(c.weight) * Math.max(0.05, stdFrom)
      }

      // Exact minimum-cut over all nontrivial bipartitions (for n <= 12; deterministic subset scan).
      const maxMask = n <= 12 ? (1 << (n - 1)) - 1 : 0
      let minBidirectionalCut = Infinity
      if (maxMask > 0) {
        for (let mask = 1; mask <= maxMask; mask++) {
          let ab = 0
          let ba = 0
          for (let i = 0; i < n; i++) {
            const inA = ((mask >> i) & 1) === 1
            for (let j = 0; j < n; j++) {
              const jInA = ((mask >> j) & 1) === 1
              if (inA && !jInA) ab += eff[j * n + i]!
              else if (!inA && jInA) ba += eff[j * n + i]!
            }
          }
          // Bidirectional irreducibility requires causal influence in BOTH directions across the cut.
          const bidir = Math.min(ab, ba)
          if (bidir < minBidirectionalCut) minBidirectionalCut = bidir
        }
      } else {
        minBidirectionalCut = 0
      }

      // Trajectory differentiation: mean normalized node variance across the system.
      let avgStd = 0
      for (let i = 0; i < n; i++) avgStd += Math.sqrt(Math.max(0, stats.variance[i]!))
      avgStd /= n

      const phiMip = minBidirectionalCut * Math.min(1, avgStd * 3)
      if (phiMip < 0.04) return []

      const relations: PhenomenalRelation[] = architecture.connections
        .filter(c => c.from !== c.to && Math.abs(c.weight) >= 0.05)
        .map(c => ({
          from: c.from,
          to: c.to,
          type: 'co-present' as const,
          weight: Math.abs(c.weight),
        }))

      return [
        {
          id: `ctx:causal_partition_integration:${architecture.id}`,
          epistemicStatus: 'competing_unverified_hypothesis',
          realization: ids,
          contents: ids,
          relations,
          hypothesis: 'causal_partition_integration',
          interval: [0n, endTick],
          attributionScore: Math.min(1, phiMip * 2.5),
          subjectCount: 1,
        },
      ]
    },
  }

  return [localValence, recurrentLoop, globalWorkspace, causalPartitionIntegration]
}

// =================================================================================================
// ATLAS REGISTRY: PROVENANCE TREE & SERIALIZABLE SNAPSHOT
// =================================================================================================

export interface AtlasSnapshot {
  readonly total_organizations: number
  readonly total_discoveries: number
  readonly total_certificates: number
  readonly passed_certificates: number
  readonly by_atlas: Readonly<Record<AtlasSection, number>>
  readonly by_realization_mode: Readonly<Record<RealizationMode, number>>
  readonly demonstrated_capabilities: readonly Capability[]
}

export class AtlasRegistry {
  readonly organizations = new Map<Id, Organization<unknown>>()
  readonly discoveries = new Map<Id, Discovery<unknown>>()
  readonly certificates = new Map<Id, RealizationCertificate>()

  registerOrganization<S>(org: Organization<S>): Organization<S> {
    if (this.organizations.has(org.id)) {
      throw new Error(`Duplicate organization id: ${org.id}`)
    }
    this.organizations.set(org.id, org)
    return org
  }

  registerCertificate(cert: RealizationCertificate): RealizationCertificate {
    if (this.certificates.has(cert.id)) {
      throw new Error(`Duplicate certificate id: ${cert.id}`)
    }
    this.certificates.set(cert.id, cert)
    return cert
  }

  registerDiscovery<G>(input: DiscoveryRegistrationInput<G>): Discovery<G> {
    if (this.discoveries.has(input.id)) {
      throw new Error(`Duplicate discovery id: ${input.id}`)
    }
    if (input.certificateId !== undefined && !this.certificates.has(input.certificateId)) {
      throw new Error(`Unknown certificateId: ${input.certificateId}`)
    }

    const parentCapSet = new Set<Capability>()
    for (const pid of input.parentIds) {
      const parent = this.discoveries.get(pid)
      if (!parent) {
        throw new Error(`Unknown parent discovery id: ${pid}`)
      }
      for (const cap of parent.inheritedCapabilities) parentCapSet.add(cap)
      for (const cap of parent.acquiredCapabilities) parentCapSet.add(cap)
    }

    const passedCapSet = new Set<Capability>()
    for (const ev of input.evidence) {
      if (ev.passed) passedCapSet.add(ev.capability)
    }

    const inheritedCapabilities: Capability[] = []
    const acquiredCapabilities: Capability[] = []
    const lostCapabilities: Capability[] = []

    for (const cap of ALL_CAPABILITIES) {
      const inParent = parentCapSet.has(cap)
      const inChild = passedCapSet.has(cap)
      if (inParent && inChild) inheritedCapabilities.push(cap)
      else if (!inParent && inChild) acquiredCapabilities.push(cap)
      else if (inParent && !inChild) lostCapabilities.push(cap)
    }

    const discovery: Discovery<G> = {
      id: input.id,
      label: input.label,
      category: input.category,
      atlas: input.atlas,
      parentIds: [...input.parentIds],
      inheritedCapabilities,
      acquiredCapabilities,
      lostCapabilities,
      generation: input.generation,
      realizationMode: input.realizationMode,
      genome: input.genome,
      evidence: [...input.evidence],
      metrics: { ...input.metrics },
      ...(input.certificateId !== undefined ? { certificateId: input.certificateId } : {}),
    }

    this.discoveries.set(discovery.id, discovery)
    return discovery
  }

  traceLineage(discoveryId: Id): readonly Id[] {
    const visited = new Set<Id>()
    const order: Id[] = []
    const dfs = (id: Id): void => {
      if (visited.has(id)) return
      visited.add(id)
      const node = this.discoveries.get(id)
      if (!node) return
      for (const p of node.parentIds) dfs(p)
      order.push(id)
    }
    dfs(discoveryId)
    return order
  }

  exportSnapshot(): AtlasSnapshot {
    const byAtlas: Record<AtlasSection, number> = {
      forms: 0,
      lives: 0,
      minds: 0,
      collectives: 0,
    }
    const byMode: Record<RealizationMode, number> = {
      field: 0,
      'verified-effective': 0,
      abstract: 0,
    }
    const caps = new Set<Capability>()
    for (const d of this.discoveries.values()) {
      byAtlas[d.atlas]++
      byMode[d.realizationMode]++
      for (const c of d.inheritedCapabilities) caps.add(c)
      for (const c of d.acquiredCapabilities) caps.add(c)
    }
    let passedCerts = 0
    for (const cert of this.certificates.values()) {
      if (cert.passed) passedCerts++
    }
    return {
      total_organizations: this.organizations.size,
      total_discoveries: this.discoveries.size,
      total_certificates: this.certificates.size,
      passed_certificates: passedCerts,
      by_atlas: byAtlas,
      by_realization_mode: byMode,
      demonstrated_capabilities: ALL_CAPABILITIES.filter(c => caps.has(c)),
    }
  }
}
