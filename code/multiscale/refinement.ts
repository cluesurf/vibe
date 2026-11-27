// Strict refinement engine, restoration entropy floor, error-contract composition,
// proof-carrying multiscale registry, and deterministic adaptive scale switcher.
// Implements Note 17 Sections 40-42, 74-75, 79 and Master Laws M10, M12, M13, M46.
//
// Strictly deterministic, zero external dependencies, noUncheckedIndexedAccess-safe.

import type { Partition } from './equivalence'
import {
  isDynamicalCertificate,
  type EntityId,
  type EntityType,
  type EntityTypeId,
  type ErrorBasis,
  type ErrorContract,
  type OrganizationInstance,
  type PhenomenalHypothesis,
  type ProofCertificate,
  type RefinementMode,
  type RefinementOutcome,
  type WeightedMicroState,
} from './types'

// =================================================================================================
// 1. RESTORATION ENTROPY FLOOR & STRICT REFINEMENT ENGINE (Laws M12-M13)
// =================================================================================================

export type FiberEntropyReport = {
  readonly macroStateCount: number
  readonly microStateCount: number
  readonly fiberSizes: readonly number[]
  readonly perMacroEntropyBits: readonly number[]
  readonly worstCaseFiberSize: number
  readonly worstCaseRequiredBits: number
  readonly conditionalEntropyBits: number
}

// Exact restoration entropy floor:
//   H_restore(z) = log_2 |pi^{-1}(z)| bits
//   worstCaseRequiredBits = ceil(log_2 max_z |pi^{-1}(z)|) bits
//   conditionalEntropyBits = H(X | Z) under uniform prior on X
export function computeRestorationEntropyFloor(
  partition: Partition,
): FiberEntropyReport {
  const fiberSizes: number[] = []
  const perMacroEntropyBits: number[] = []
  let worstCaseFiberSize = 0
  let weightedEntropySum = 0

  for (let z = 0; z < partition.classCount; z++) {
    const size = partition.classes[z]!.length
    fiberSizes.push(size)
    const hBits = size > 1 ? Math.log2(size) : 0
    perMacroEntropyBits.push(hBits)
    if (size > worstCaseFiberSize) worstCaseFiberSize = size
    weightedEntropySum += size * hBits
  }

  const worstCaseRequiredBits =
    worstCaseFiberSize > 1 ? Math.ceil(Math.log2(worstCaseFiberSize)) : 0
  const conditionalEntropyBits =
    partition.stateCount > 0 ? weightedEntropySum / partition.stateCount : 0

  return {
    macroStateCount: partition.classCount,
    microStateCount: partition.stateCount,
    fiberSizes,
    perMacroEntropyBits,
    worstCaseFiberSize,
    worstCaseRequiredBits,
    conditionalEntropyBits,
  }
}

export type RefinementRequest = {
  readonly macroState: number
  readonly mode: RefinementMode
  readonly residualKey?: number
  readonly suppliedResidualBits?: number
  readonly microWeights?: readonly number[]
}

// Strict refinement enforcing Law M13:
//   - 'exact' MUST fail if residual micro-key bits are missing or below ceil(log_2 |pi^{-1}(z)|),
//     refusing to fabricate forgotten microscopic history.
//   - 'compatible' returns a certified canonical witness x in pi^{-1}(z), explicitly flagged
//     exactMicroRestored = (|pi^{-1}(z)| === 1).
//   - 'statistical' returns the exact normalized uniform or Gibbs micro-distribution over pi^{-1}(z).
export function strictRefine(
  partition: Partition,
  request: RefinementRequest,
): RefinementOutcome<number> {
  const { macroState, mode } = request
  const fiber = partition.classes[macroState]
  if (fiber === undefined || fiber.length === 0) {
    return {
      ok: false,
      mode,
      reason: 'empty_fiber',
      requiredBits: 0,
      suppliedBits: request.suppliedResidualBits ?? 0,
      exactMicroRestored: false,
      originalHistoryPreserved: false,
      constraintViolations: [`macro state ${macroState} has an empty fiber`],
    }
  }

  const fiberSize = fiber.length
  const entropyBits = fiberSize > 1 ? Math.log2(fiberSize) : 0
  const requiredBits = fiberSize > 1 ? Math.ceil(entropyBits) : 0

  if (mode === 'exact') {
    const suppliedBits =
      request.suppliedResidualBits ?? (request.residualKey !== undefined ? requiredBits : 0)

    if (fiberSize === 1) {
      return {
        ok: true,
        mode: 'exact',
        state: fiber[0]!,
        exactMicroRestored: true,
        originalHistoryPreserved: true,
        restorationEntropyBits: 0,
        suppliedResidualBits: suppliedBits,
        constraintViolations: [],
      }
    }

    if (request.residualKey === undefined || suppliedBits < requiredBits) {
      return {
        ok: false,
        mode: 'exact',
        reason: 'insufficient_residual_bits',
        requiredBits,
        suppliedBits,
        exactMicroRestored: false,
        originalHistoryPreserved: false,
        constraintViolations: [
          `exact refinement refused: fiber size ${fiberSize} requires ${requiredBits} residual bits, got ${suppliedBits}`,
        ],
      }
    }

    if (
      !Number.isInteger(request.residualKey) ||
      request.residualKey < 0 ||
      request.residualKey >= fiberSize
    ) {
      return {
        ok: false,
        mode: 'exact',
        reason: 'invalid_residual_key',
        requiredBits,
        suppliedBits,
        exactMicroRestored: false,
        originalHistoryPreserved: false,
        constraintViolations: [
          `residual key ${request.residualKey} outside fiber range [0, ${fiberSize - 1}]`,
        ],
      }
    }

    return {
      ok: true,
      mode: 'exact',
      state: fiber[request.residualKey]!,
      exactMicroRestored: true,
      originalHistoryPreserved: true,
      restorationEntropyBits: entropyBits,
      suppliedResidualBits: suppliedBits,
      constraintViolations: [],
    }
  }

  if (mode === 'compatible') {
    const singleton = fiberSize === 1
    return {
      ok: true,
      mode: 'compatible',
      state: fiber[0]!,
      exactMicroRestored: singleton,
      originalHistoryPreserved: singleton,
      restorationEntropyBits: entropyBits,
      suppliedResidualBits: 0,
      constraintViolations: [],
    }
  }

  // mode === 'statistical'
  const rawWeights: number[] = fiber.map(x => {
    const w = request.microWeights !== undefined ? (request.microWeights[x] ?? 0) : 1
    return w > 0 ? w : 0
  })
  let weightSum = 0
  for (const w of rawWeights) weightSum += w

  const distribution: WeightedMicroState<number>[] = []
  let shannonEntropy = 0
  let modalState = fiber[0]!
  let modalProb = -1

  for (let i = 0; i < fiberSize; i++) {
    const p = weightSum > 0 ? rawWeights[i]! / weightSum : 1 / fiberSize
    const micro = fiber[i]!
    distribution.push({ state: micro, probability: p })
    if (p > 1e-15) shannonEntropy -= p * Math.log2(p)
    if (p > modalProb) {
      modalProb = p
      modalState = micro
    }
  }

  const singleton = fiberSize === 1
  return {
    ok: true,
    mode: 'statistical',
    state: modalState,
    exactMicroRestored: singleton,
    originalHistoryPreserved: singleton,
    restorationEntropyBits: shannonEntropy,
    suppliedResidualBits: 0,
    distribution,
    constraintViolations: [],
  }
}

// =================================================================================================
// 2. MULTI-LEVEL ERROR CONTRACT COMPOSITION & PROOF-CARRYING REGISTRY (Section 79)
// =================================================================================================

const ERROR_BASIS_RANK: Readonly<Record<ErrorBasis, number>> = {
  heuristic: 0,
  numerical_estimate: 1,
  exhaustive_finite: 2,
  certified_theorem: 3,
}

function weakestErrorBasis(a: ErrorBasis, b: ErrorBasis): ErrorBasis {
  return ERROR_BASIS_RANK[a] <= ERROR_BASIS_RANK[b] ? a : b
}

// Compose ErrorContract across L_0 -> L_1 -> L_2 via exact triangle inequality for pi_2 o pi_1:
//   d_2(pi_2(pi_1(F_0(x))), F_2(pi_2(pi_1(x))))
//     <= d_2(pi_2(pi_1(F_0(x))), pi_2(F_1(pi_1(x)))) + d_2(pi_2(F_1(pi_1(x))), F_2(pi_2(pi_1(x))))
//     <= L_{pi_2} * eps_{0->1}(T) + eps_{1->2}(T)
// where upper.lipschitzFactor = L_{pi_2} scales lower commutation error into the L_2 metric.
export function composeErrorContracts(
  lower: ErrorContract<unknown>,
  upper: ErrorContract<unknown>,
): ErrorContract<unknown> {
  const commutationBound =
    upper.lipschitzFactor * lower.commutationBound + upper.commutationBound
  const conservationBound = lower.conservationBound + upper.conservationBound
  const interfaceBound = lower.interfaceBound + upper.interfaceBound

  return {
    commutationBound,
    conservationBound,
    interfaceBound,
    horizonSteps: Math.min(lower.horizonSteps, upper.horizonSteps),
    lipschitzFactor: lower.lipschitzFactor * upper.lipschitzFactor,
    observableMetric: `${lower.observableMetric} -> ${upper.observableMetric}`,
    basis: weakestErrorBasis(lower.basis, upper.basis),
    validityPredicates: [...lower.validityPredicates, ...upper.validityPredicates],
    compositionRule:
      commutationBound === 0 &&
      lower.compositionRule === 'exact_zero' &&
      upper.compositionRule === 'exact_zero'
        ? 'exact_zero'
        : 'triangle_lipschitz',
  }
}

export type CertificateAuditResult = {
  readonly entityId: EntityId
  readonly valid: boolean
  readonly tierACount: number
  readonly tierBCount: number
  readonly tierCCount: number
  readonly unverifiedCount: number
  readonly failedPredicates: readonly string[]
  readonly reasons: readonly string[]
}

export class ProofCarryingRegistry {
  private readonly types = new Map<EntityTypeId, EntityType>()
  private readonly instances = new Map<EntityId, OrganizationInstance<unknown>>()
  private readonly hypotheses = new Map<string, PhenomenalHypothesis>()

  registerType(entityType: EntityType): void {
    this.types.set(entityType.id, entityType)
  }

  getType(id: EntityTypeId): EntityType | undefined {
    return this.types.get(id)
  }

  registerInstance<State>(instance: OrganizationInstance<State>): void {
    if (!this.types.has(instance.entityTypeId)) {
      throw new Error(`unknown EntityTypeId: ${instance.entityTypeId}`)
    }
    this.instances.set(
      instance.id,
      instance as OrganizationInstance<unknown>,
    )
  }

  getInstance(id: EntityId): OrganizationInstance<unknown> | undefined {
    return this.instances.get(id)
  }

  listInstances(): readonly OrganizationInstance<unknown>[] {
    return [...this.instances.values()]
  }

  // Quarantined registration: phenomenal hypotheses live in their own separate map
  // and can NEVER enter an OrganizationInstance's ProofCertificate array.
  registerPhenomenalHypothesis(hypothesis: PhenomenalHypothesis): void {
    if (hypothesis.epistemicStatus !== 'unverified_hypothesis') {
      throw new Error('phenomenal hypotheses must remain unverified_hypothesis')
    }
    this.hypotheses.set(hypothesis.id, hypothesis)
  }

  listPhenomenalHypotheses(): readonly PhenomenalHypothesis[] {
    return [...this.hypotheses.values()]
  }

  auditInstance(id: EntityId): CertificateAuditResult {
    const inst = this.instances.get(id)
    if (inst === undefined) {
      return {
        entityId: id,
        valid: false,
        tierACount: 0,
        tierBCount: 0,
        tierCCount: 0,
        unverifiedCount: 0,
        failedPredicates: [],
        reasons: [`instance ${id} not found`],
      }
    }

    const failedPredicates: string[] = []
    const reasons: string[] = []

    for (const pred of inst.errorContract.validityPredicates) {
      if (!pred.check(inst.state)) {
        failedPredicates.push(pred.name)
        reasons.push(`validity predicate failed: ${pred.name}`)
      }
    }

    let tierACount = 0
    let tierBCount = 0
    let tierCCount = 0
    let unverifiedCount = 0

    for (const cert of inst.certificates) {
      if (!isDynamicalCertificate(cert)) {
        unverifiedCount++
        reasons.push('rejected non-dynamical certificate object')
        continue
      }
      if (!cert.verified) {
        unverifiedCount++
        reasons.push(`unverified certificate: ${cert.theoremId}`)
      }
      if (cert.tier === 'tier_a_proved') tierACount++
      else if (cert.tier === 'tier_b_numerical') tierBCount++
      else tierCCount++
    }

    if (inst.errorContract.commutationBound < 0) {
      reasons.push('negative commutationBound is invalid')
    }
    if (inst.errorContract.conservationBound < 0) {
      reasons.push('negative conservationBound is invalid')
    }
    if (inst.errorContract.interfaceBound < 0) {
      reasons.push('negative interfaceBound is invalid')
    }

    return {
      entityId: id,
      valid: failedPredicates.length === 0 && unverifiedCount === 0 && reasons.length === 0,
      tierACount,
      tierBCount,
      tierCCount,
      unverifiedCount,
      failedPredicates,
      reasons,
    }
  }
}

// =================================================================================================
// 3. DETERMINISTIC ADAPTIVE SCALE SWITCHER
// =================================================================================================

export type ScaleSwitchAction = 'hold' | 'refine' | 'coarsen'

export type ScaleSwitchDecision = {
  readonly fromLevel: number
  readonly toLevel: number
  readonly action: ScaleSwitchAction
  readonly reason: string
  readonly measuredDefect: number
  readonly cumulativeErrorBudgetUsed: number
}

export function chooseAdaptiveScale(input: {
  readonly currentLevel: number
  readonly maxLevel: number
  readonly measuredDefect: number
  readonly validityOk: boolean
  readonly tauCoarse: number
  readonly tauRefine: number
  readonly cumulativeError: number
  readonly maxCumulativeError: number
}): ScaleSwitchDecision {
  const {
    currentLevel,
    maxLevel,
    measuredDefect,
    validityOk,
    tauCoarse,
    tauRefine,
    cumulativeError,
    maxCumulativeError,
  } = input

  if (!validityOk && currentLevel > 0) {
    return {
      fromLevel: currentLevel,
      toLevel: 0,
      action: 'refine',
      reason: 'validity_predicate_failed',
      measuredDefect,
      cumulativeErrorBudgetUsed: cumulativeError,
    }
  }

  if (
    (measuredDefect > tauRefine || cumulativeError > maxCumulativeError) &&
    currentLevel > 0
  ) {
    return {
      fromLevel: currentLevel,
      toLevel: Math.max(0, currentLevel - 1),
      action: 'refine',
      reason:
        measuredDefect > tauRefine
          ? 'defect_exceeded_tau_refine'
          : 'error_budget_threshold_reached',
      measuredDefect,
      cumulativeErrorBudgetUsed: cumulativeError,
    }
  }

  if (
    validityOk &&
    measuredDefect <= tauCoarse &&
    cumulativeError <= maxCumulativeError &&
    currentLevel < maxLevel
  ) {
    return {
      fromLevel: currentLevel,
      toLevel: currentLevel + 1,
      action: 'coarsen',
      reason: 'defect_below_tau_coarse',
      measuredDefect,
      cumulativeErrorBudgetUsed: cumulativeError,
    }
  }

  return {
    fromLevel: currentLevel,
    toLevel: currentLevel,
    action: 'hold',
    reason: 'within_scale_hysteresis_band',
    measuredDefect,
    cumulativeErrorBudgetUsed: cumulativeError,
  }
}

export function makeProofCertificate(input: {
  readonly theoremId: string
  readonly leanModule: string
  readonly leanVersion?: string
  readonly tier: ProofCertificate['tier']
  readonly scope: string
  readonly assumptions: readonly string[]
  readonly verified: boolean
}): ProofCertificate {
  return {
    certificateKind: 'dynamical_proof_certificate',
    theoremId: input.theoremId,
    leanModule: input.leanModule,
    leanVersion: input.leanVersion ?? '4.35.0',
    tier: input.tier,
    scope: input.scope,
    assumptions: input.assumptions,
    verified: input.verified,
  }
}
