// Multiscale composition, sheaf obstructions, quantum entanglement-seam diagnostics,
// hyperbolic {3,4,3,4} boundary analysis, viability kernels, and counterfactual autonomy.
// Implements Note 17 Sections 19, 23-24, 34-36 and Master Laws M21-M25.
//
// Strictly deterministic, zero external dependencies, noUncheckedIndexedAccess-safe.

// =================================================================================================
// 1. FIBER-PRODUCT COMPOSITION (Laws M23-M24)
// =================================================================================================

export type DiscreteOrganization = {
  readonly id: string
  readonly stateCount: number
  readonly transition: readonly number[]
  readonly overlapProjection: readonly number[]
  readonly overlapStateCount: number
}

export type FiberProductResult = {
  readonly compatiblePairs: readonly (readonly [number, number])[]
  readonly composedTransition: readonly number[]
  readonly dynamicallyCompatible: boolean
  readonly compatibilityViolationCount: number
  readonly overlapDynamicsMatchA: boolean
  readonly overlapDynamicsMatchB: boolean
  readonly coupledErrorBound: number
}

// Exact fiber product X_A x_{X_C} X_B = {(a, b) : f(a) = g(b)} with induced coupled dynamics.
export function composeFiberProduct(input: {
  readonly orgA: DiscreteOrganization
  readonly orgB: DiscreteOrganization
  readonly overlapTransition?: readonly number[]
  readonly errorBoundA?: number
  readonly errorBoundB?: number
  readonly interfaceErrorBound?: number
}): FiberProductResult {
  const { orgA, orgB, overlapTransition } = input
  if (orgA.overlapStateCount !== orgB.overlapStateCount) {
    throw new Error('overlapping organizations must share the same overlap state space size')
  }

  const compatiblePairs: (readonly [number, number])[] = []
  const pairIndex = new Map<number, number>()
  const stride = orgB.stateCount + 1

  for (let a = 0; a < orgA.stateCount; a++) {
    const fa = orgA.overlapProjection[a]!
    for (let b = 0; b < orgB.stateCount; b++) {
      if (fa === orgB.overlapProjection[b]!) {
        const idx = compatiblePairs.length
        compatiblePairs.push([a, b])
        pairIndex.set(a * stride + b, idx)
      }
    }
  }

  let compatibilityViolationCount = 0
  const composedTransition: number[] = new Array<number>(compatiblePairs.length)

  for (let i = 0; i < compatiblePairs.length; i++) {
    const [a, b] = compatiblePairs[i]!
    const nextA = orgA.transition[a]!
    const nextB = orgB.transition[b]!
    if (orgA.overlapProjection[nextA]! !== orgB.overlapProjection[nextB]!) {
      compatibilityViolationCount++
      composedTransition[i] = -1
    } else {
      composedTransition[i] = pairIndex.get(nextA * stride + nextB)!
    }
  }

  let overlapDynamicsMatchA = true
  let overlapDynamicsMatchB = true
  if (overlapTransition !== undefined) {
    for (let a = 0; a < orgA.stateCount; a++) {
      const lhs = orgA.overlapProjection[orgA.transition[a]!]!
      const rhs = overlapTransition[orgA.overlapProjection[a]!]!
      if (lhs !== rhs) {
        overlapDynamicsMatchA = false
        break
      }
    }
    for (let b = 0; b < orgB.stateCount; b++) {
      const lhs = orgB.overlapProjection[orgB.transition[b]!]!
      const rhs = overlapTransition[orgB.overlapProjection[b]!]!
      if (lhs !== rhs) {
        overlapDynamicsMatchB = false
        break
      }
    }
  }

  const coupledErrorBound =
    (input.errorBoundA ?? 0) +
    (input.errorBoundB ?? 0) +
    (input.interfaceErrorBound ?? 0)

  return {
    compatiblePairs,
    composedTransition,
    dynamicallyCompatible: compatibilityViolationCount === 0,
    compatibilityViolationCount,
    overlapDynamicsMatchA,
    overlapDynamicsMatchB,
    coupledErrorBound,
  }
}

// =================================================================================================
// 2. PAIRWISE-VS-GLOBAL CONSISTENCY & SHEAF OBSTRUCTION CHECKER (Law M25, Section 36)
// =================================================================================================

export type PatchConstraint = {
  readonly patchA: number
  readonly patchB: number
  readonly allowedPairs: readonly (readonly [number, number])[]
}

export type SheafConsistencyResult = {
  readonly patchCount: number
  readonly edgeCount: number
  readonly pairwiseConsistentEdges: number
  readonly allEdgesLocallyConsistent: boolean
  readonly globalSections: readonly (readonly number[])[]
  readonly hasGlobalSection: boolean
  readonly sheafObstructionDetected: boolean
}

export function checkPairwiseVsGlobalConsistency(input: {
  readonly domainSizes: readonly number[]
  readonly constraints: readonly PatchConstraint[]
}): SheafConsistencyResult {
  const { domainSizes, constraints } = input
  const patchCount = domainSizes.length

  let pairwiseConsistentEdges = 0
  const constraintSets: Set<number>[] = []

  for (const c of constraints) {
    const stride = domainSizes[c.patchB]! + 1
    const set = new Set<number>()
    const seenA = new Set<number>()
    const seenB = new Set<number>()
    for (const [va, vb] of c.allowedPairs) {
      set.add(va * stride + vb)
      seenA.add(va)
      seenB.add(vb)
    }
    constraintSets.push(set)
    // Edge is locally consistent when nonempty and surjective onto both patch alphabets.
    if (
      c.allowedPairs.length > 0 &&
      seenA.size === domainSizes[c.patchA]! &&
      seenB.size === domainSizes[c.patchB]!
    ) {
      pairwiseConsistentEdges++
    }
  }

  const allEdgesLocallyConsistent = pairwiseConsistentEdges === constraints.length
  const globalSections: number[][] = []
  const assignment = new Array<number>(patchCount).fill(0)

  const search = (depth: number): void => {
    if (depth === patchCount) {
      for (let ei = 0; ei < constraints.length; ei++) {
        const c = constraints[ei]!
        const stride = domainSizes[c.patchB]! + 1
        if (!constraintSets[ei]!.has(assignment[c.patchA]! * stride + assignment[c.patchB]!)) {
          return
        }
      }
      globalSections.push(assignment.slice())
      return
    }
    const dom = domainSizes[depth]!
    for (let v = 0; v < dom; v++) {
      assignment[depth] = v
      search(depth + 1)
    }
  }
  search(0)

  const hasGlobalSection = globalSections.length > 0
  return {
    patchCount,
    edgeCount: constraints.length,
    pairwiseConsistentEdges,
    allEdgesLocallyConsistent,
    globalSections,
    hasGlobalSection,
    sheafObstructionDetected: allEdgesLocallyConsistent && !hasGlobalSection,
  }
}

// Construct a Z_3-valued 3-patch triangle (A, B, C) with prescribed ternary holonomy h in {0, 1, 2}.
// Transition rules: s_B - s_A = 0 (mod 3), s_C - s_B = 0 (mod 3), s_A - s_C = h (mod 3).
export function buildTernaryHolonomyLoop(holonomyMod3: 0 | 1 | 2): {
  readonly domainSizes: readonly number[]
  readonly constraints: readonly PatchConstraint[]
} {
  const eqPairs: (readonly [number, number])[] = [
    [0, 0],
    [1, 1],
    [2, 2],
  ]
  const shiftPairs: (readonly [number, number])[] = [0, 1, 2].map(c => [
    c,
    (c + holonomyMod3) % 3,
  ])
  return {
    domainSizes: [3, 3, 3],
    constraints: [
      { patchA: 0, patchB: 1, allowedPairs: eqPairs },
      { patchA: 1, patchB: 2, allowedPairs: eqPairs },
      { patchA: 2, patchB: 0, allowedPairs: shiftPairs },
    ],
  }
}

// =================================================================================================
// 3. QUANTUM ENTANGLEMENT-SEAM DIAGNOSTIC (When Classical Fiber Products Fail)
// =================================================================================================

function hermitianEigenvalues(
  dim: number,
  reIn: Float64Array,
  imIn: Float64Array,
): Float64Array {
  const ar = Float64Array.from(reIn)
  const ai = Float64Array.from(imIn)

  for (let sweep = 0; sweep < 80; sweep++) {
    let maxOff = 0
    for (let p = 0; p < dim; p++) {
      for (let q = p + 1; q < dim; q++) {
        const pr = ar[p * dim + q]!
        const pi = ai[p * dim + q]!
        const mag = Math.hypot(pr, pi)
        if (mag > maxOff) maxOff = mag
        if (
          mag <=
          1e-15 * Math.max(1e-12, Math.abs(ar[p * dim + p]!) + Math.abs(ar[q * dim + q]!))
        ) {
          continue
        }
        const phR = pr / mag
        const phI = pi / mag
        const app = ar[p * dim + p]!
        const aqq = ar[q * dim + q]!
        const tau = (aqq - app) / (2 * mag)
        const t =
          tau >= 0 ? 1 / (tau + Math.hypot(1, tau)) : -1 / (-tau + Math.hypot(1, tau))
        const c = 1 / Math.hypot(1, t)
        const s = t * c
        const spR = s * phR
        const spI = s * phI

        for (let k = 0; k < dim; k++) {
          if (k === p || k === q) continue
          const akpR = ar[k * dim + p]!
          const akpI = ai[k * dim + p]!
          const akqR = ar[k * dim + q]!
          const akqI = ai[k * dim + q]!
          const nkpR = c * akpR - (spR * akqR + spI * akqI)
          const nkpI = c * akpI - (spR * akqI - spI * akqR)
          const nkqR = spR * akpR - spI * akpI + c * akqR
          const nkqI = spR * akpI + spI * akpR + c * akqI
          ar[k * dim + p] = nkpR
          ai[k * dim + p] = nkpI
          ar[p * dim + k] = nkpR
          ai[p * dim + k] = -nkpI
          ar[k * dim + q] = nkqR
          ai[k * dim + q] = nkqI
          ar[q * dim + k] = nkqR
          ai[q * dim + k] = -nkqI
        }
        ar[p * dim + p] = app - t * mag
        ai[p * dim + p] = 0
        ar[q * dim + q] = aqq + t * mag
        ai[q * dim + q] = 0
        ar[p * dim + q] = 0
        ai[p * dim + q] = 0
        ar[q * dim + p] = 0
        ai[q * dim + p] = 0
      }
    }
    if (maxOff < 1e-15) break
  }

  const vals = new Float64Array(dim)
  for (let i = 0; i < dim; i++) vals[i] = Math.max(0, ar[i * dim + i]!)
  vals.sort((x, y) => y - x)
  return vals
}

function bipartiteSchmidtStats(
  dimA: number,
  dimB: number,
  re: readonly number[],
  im: readonly number[],
  tolerance: number,
): { readonly schmidtCoeffs: number[]; readonly schmidtRank: number; readonly entropyBits: number } {
  let normSq = 0
  for (let i = 0; i < dimA * dimB; i++) {
    normSq += re[i]! * re[i]! + im[i]! * im[i]!
  }
  if (normSq <= 1e-30) {
    return { schmidtCoeffs: [], schmidtRank: 0, entropyBits: 0 }
  }
  const invNorm = 1 / Math.sqrt(normSq)

  // Reduced density matrix rho_A = Tr_B(|psi><psi|).
  const rhoR = new Float64Array(dimA * dimA)
  const rhoI = new Float64Array(dimA * dimA)
  for (let a1 = 0; a1 < dimA; a1++) {
    for (let a2 = 0; a2 < dimA; a2++) {
      let sr = 0
      let si = 0
      for (let b = 0; b < dimB; b++) {
        const i1 = a1 * dimB + b
        const i2 = a2 * dimB + b
        const r1 = re[i1]! * invNorm
        const m1 = im[i1]! * invNorm
        const r2 = re[i2]! * invNorm
        const m2 = im[i2]! * invNorm
        sr += r1 * r2 + m1 * m2
        si += m1 * r2 - r1 * m2
      }
      rhoR[a1 * dimA + a2] = sr
      rhoI[a1 * dimA + a2] = si
    }
  }

  const eigvals = hermitianEigenvalues(dimA, rhoR, rhoI)
  const schmidtCoeffs: number[] = []
  let schmidtRank = 0
  let entropyBits = 0
  for (let i = 0; i < eigvals.length; i++) {
    const lam = eigvals[i]!
    const s = Math.sqrt(Math.max(0, lam))
    schmidtCoeffs.push(s)
    if (s > tolerance) schmidtRank++
    if (lam > 1e-15) entropyBits -= lam * Math.log2(lam)
  }
  return { schmidtCoeffs, schmidtRank, entropyBits }
}

export type EntanglementSeamResult = {
  readonly dimA: number
  readonly dimB: number
  readonly dimSeam: number
  readonly schmidtCoefficients: readonly number[]
  readonly schmidtRank: number
  readonly entanglementEntropyBits: number
  readonly quantumMutualInfoBits: number
  readonly conditionalSeamEntropyBits: number
  readonly classicalFiberProductValid: boolean
}

// Measures Schmidt rank, entanglement entropy, and conditional entanglement across a seam C
// for a pure state on A x C x B (with dimSeam = 1 reducing to bipartite A x B).
// Index order: ((a * dimSeam) + c) * dimB + b.
export function analyzeEntanglementSeam(input: {
  readonly dimA: number
  readonly dimB: number
  readonly dimSeam?: number
  readonly stateRe: readonly number[]
  readonly stateIm: readonly number[]
  readonly tolerance?: number
}): EntanglementSeamResult {
  const { dimA, dimB, stateRe, stateIm } = input
  const dimSeam = input.dimSeam ?? 1
  const tolerance = input.tolerance ?? 1e-10
  const expected = dimA * dimSeam * dimB
  if (stateRe.length !== expected || stateIm.length !== expected) {
    throw new Error('state vector length must equal dimA * dimSeam * dimB')
  }

  // Overall bipartite cut A : (C x B)
  const full = bipartiteSchmidtStats(dimA, dimSeam * dimB, stateRe, stateIm, tolerance)

  // Conditioned on each classical seam outcome c in 0..dimSeam-1, evaluate residual A : B entanglement.
  let totalProb = 0
  let weightedCondEntropy = 0
  let maxCondRank = 0
  for (let c = 0; c < dimSeam; c++) {
    const sliceRe: number[] = new Array<number>(dimA * dimB)
    const sliceIm: number[] = new Array<number>(dimA * dimB)
    let pC = 0
    for (let a = 0; a < dimA; a++) {
      for (let b = 0; b < dimB; b++) {
        const src = (a * dimSeam + c) * dimB + b
        const dst = a * dimB + b
        const r = stateRe[src]!
        const m = stateIm[src]!
        sliceRe[dst] = r
        sliceIm[dst] = m
        pC += r * r + m * m
      }
    }
    totalProb += pC
    if (pC > 1e-15) {
      const cond = bipartiteSchmidtStats(dimA, dimB, sliceRe, sliceIm, tolerance)
      weightedCondEntropy += pC * cond.entropyBits
      if (cond.schmidtRank > maxCondRank) maxCondRank = cond.schmidtRank
    }
  }

  const conditionalSeamEntropyBits =
    totalProb > 1e-15 ? weightedCondEntropy / totalProb : 0

  return {
    dimA,
    dimB,
    dimSeam,
    schmidtCoefficients: full.schmidtCoeffs,
    schmidtRank: full.schmidtRank,
    entanglementEntropyBits: full.entropyBits,
    quantumMutualInfoBits: 2 * full.entropyBits,
    conditionalSeamEntropyBits,
    // Classical fiber product X_A x_{X_C} X_B holds iff conditioned on seam C every branch factorizes.
    classicalFiberProductValid:
      maxCondRank <= 1 && conditionalSeamEntropyBits <= tolerance,
  }
}

// =================================================================================================
// 4. HYPERBOLIC {3,4,3,4} BOUNDARY RATIO ANALYZER & SELECTIVE INTERFACE FILTER (Section 19)
// =================================================================================================

export type ShellGrowthRow = {
  readonly radius: number
  readonly shellSize: bigint
  readonly volumeSize: bigint
  readonly boundaryToVolumeRatio: number
  readonly growthFactor: number
}

export type HyperbolicBoundaryReport = {
  readonly maxRadius: number
  readonly hyperbolic3434: readonly ShellGrowthRow[]
  readonly euclideanD4: readonly ShellGrowthRow[]
  readonly euclideanZ4: readonly ShellGrowthRow[]
  readonly continuousH4Asymptote: number
  readonly discrete3434AsymptoticLambda: number
  readonly discrete3434AsymptoticRatio: number
  readonly hyperbolicFinalRatio: number
  readonly euclideanD4FinalRatio: number
  readonly euclideanZ4FinalRatio: number
}

// Exact dominant root of Steinberg cubic lambda^3 - 21 lambda^2 + 51 lambda - 23 = 0
// proved in Vibe.CuspGrowth (thm_cusp_and_ball_growth_rate_bounds: 18.2787 < lambda < 18.2788).
function solveSteinbergLambda(): number {
  let lo = 18.2787
  let hi = 18.2788
  const poly = (x: number): number => x * x * x - 21 * x * x + 51 * x - 23
  for (let i = 0; i < 64; i++) {
    const mid = 0.5 * (lo + hi)
    if (poly(mid) < 0) lo = mid
    else hi = mid
  }
  return 0.5 * (lo + hi)
}

function buildGrowthRows(shells: readonly bigint[]): ShellGrowthRow[] {
  const rows: ShellGrowthRow[] = []
  let vol = 0n
  for (let r = 0; r < shells.length; r++) {
    const s = shells[r]!
    vol += s
    const ratio = Number(s) / Number(vol)
    const growth = r === 0 ? 1 : Number(s) / Number(shells[r - 1]!)
    rows.push({
      radius: r,
      shellSize: s,
      volumeSize: vol,
      boundaryToVolumeRatio: ratio,
      growthFactor: growth,
    })
  }
  return rows
}

// Exact shell/volume growth comparing:
//   - {3,4,3,4} hyperbolic honeycomb (Steinberg recurrence x(n+4) = 21 x(n+3) - 51 x(n+2) + 23 x(n+1),
//     base shells 1, 24, 456, 8376 proved unconditionally in Vibe.CuspGrowth)
//   - D_4 Euclidean 24-cell lattice ({3,3,4,3}: S_0 = 1, S_r = 16 r^3 + 8 r for r >= 1)
//   - Z^4 Euclidean hypercubic lattice (L_1 metric: S_0 = 1, S_r = (8 r^3 + 16 r) / 3 for r >= 1)
export function analyzeHyperbolicBoundaryGrowth(
  maxRadius: number,
): HyperbolicBoundaryReport {
  const n = Math.max(3, maxRadius)
  const hypShells: bigint[] = [1n, 24n, 456n, 8376n]
  for (let r = 4; r <= n; r++) {
    const next = 21n * hypShells[r - 1]! - 51n * hypShells[r - 2]! + 23n * hypShells[r - 3]!
    hypShells.push(next)
  }

  const d4Shells: bigint[] = [1n]
  const z4Shells: bigint[] = [1n]
  for (let r = 1; r <= n; r++) {
    const rb = BigInt(r)
    const r3 = rb * rb * rb
    d4Shells.push(16n * r3 + 8n * rb)
    z4Shells.push((8n * r3 + 16n * rb) / 3n)
  }

  const hyperbolic3434 = buildGrowthRows(hypShells.slice(0, maxRadius + 1))
  const euclideanD4 = buildGrowthRows(d4Shells.slice(0, maxRadius + 1))
  const euclideanZ4 = buildGrowthRows(z4Shells.slice(0, maxRadius + 1))

  const lambda = solveSteinbergLambda()
  return {
    maxRadius,
    hyperbolic3434,
    euclideanD4,
    euclideanZ4,
    continuousH4Asymptote: 3,
    discrete3434AsymptoticLambda: lambda,
    discrete3434AsymptoticRatio: 1 - 1 / lambda,
    hyperbolicFinalRatio: hyperbolic3434[hyperbolic3434.length - 1]!.boundaryToVolumeRatio,
    euclideanD4FinalRatio: euclideanD4[euclideanD4.length - 1]!.boundaryToVolumeRatio,
    euclideanZ4FinalRatio: euclideanZ4[euclideanZ4.length - 1]!.boundaryToVolumeRatio,
  }
}

export type SelectiveInterfaceEvaluation = {
  readonly boundarySlots: number
  readonly codeDistance: number
  readonly maxUnheraldedErrors: number
  readonly maxHeraldedErasures: number
  readonly errorRate: number
  readonly unshieldedSurvivalProb: number
  readonly selectiveUnheraldedSurvivalProb: number
  readonly selectiveErasureSurvivalProb: number
  readonly protectionGainFactor: number
}

function binomialSum(n: number, maxK: number, p: number): number {
  if (p <= 0) return 1
  if (p >= 1) return maxK >= n ? 1 : 0
  let sum = 0
  let logChoose = 0
  const logP = Math.log(p)
  const logQ = Math.log(1 - p)
  const cap = Math.min(n, maxK)
  for (let k = 0; k <= cap; k++) {
    if (k > 0) {
      logChoose += Math.log(n - k + 1) - Math.log(k)
    }
    sum += Math.exp(logChoose + k * logP + (n - k) * logQ)
  }
  return Math.min(1, sum)
}

export function evaluateSelectiveInterfaceFilter(input: {
  readonly boundarySlots: number
  readonly codeDistance: number
  readonly errorRate: number
}): SelectiveInterfaceEvaluation {
  const { boundarySlots, codeDistance, errorRate } = input
  const maxUnheraldedErrors = Math.floor((codeDistance - 1) / 2)
  const maxHeraldedErasures = Math.max(0, codeDistance - 1)

  const unshieldedSurvivalProb = Math.pow(1 - errorRate, boundarySlots)
  const selectiveUnheraldedSurvivalProb = binomialSum(
    boundarySlots,
    maxUnheraldedErrors,
    errorRate,
  )
  const selectiveErasureSurvivalProb = binomialSum(
    boundarySlots,
    maxHeraldedErasures,
    errorRate,
  )

  return {
    boundarySlots,
    codeDistance,
    maxUnheraldedErrors,
    maxHeraldedErasures,
    errorRate,
    unshieldedSurvivalProb,
    selectiveUnheraldedSurvivalProb,
    selectiveErasureSurvivalProb,
    protectionGainFactor:
      unshieldedSurvivalProb > 1e-300
        ? selectiveErasureSurvivalProb / unshieldedSurvivalProb
        : Number.POSITIVE_INFINITY,
  }
}

// =================================================================================================
// 5. VIABILITY KERNEL Viab(K_A) & COUNTERFACTUAL AUTONOMY A (Laws M21-M22, Sections 23-24)
// =================================================================================================

export type ControlledOrganization = {
  readonly stateCount: number
  readonly controlCount: number
  readonly disturbanceCount: number
  readonly viableStates: readonly boolean[]
  readonly step: (state: number, control: number, disturbance: number) => number
  readonly intactPolicy: (state: number) => number
  readonly disabledControl: number
}

export type ViabilityKernelResult = {
  readonly viableRegionSize: number
  readonly kernelStates: readonly boolean[]
  readonly kernelSize: number
  readonly intactKernelStates: readonly boolean[]
  readonly intactKernelSize: number
  readonly disabledKernelStates: readonly boolean[]
  readonly disabledKernelSize: number
  readonly iterations: number
}

function fixedPolicyKernel(
  org: ControlledOrganization,
  policy: (state: number) => number,
): boolean[] {
  const current = org.viableStates.slice()
  while (true) {
    let changed = false
    for (let x = 0; x < org.stateCount; x++) {
      if (!current[x]) continue
      const u = policy(x)
      for (let w = 0; w < org.disturbanceCount; w++) {
        const next = org.step(x, u, w)
        if (!current[next]) {
          current[x] = false
          changed = true
          break
        }
      }
    }
    if (!changed) break
  }
  return current
}

// Exact Aubin robust viability kernel:
//   V_{k+1} = { x in V_k : exists u in U, forall w in W, F(x, u, w) in V_k }.
export function computeViabilityKernel(
  org: ControlledOrganization,
): ViabilityKernelResult {
  const kernel = org.viableStates.slice()
  let iterations = 0

  while (true) {
    iterations++
    let changed = false
    for (let x = 0; x < org.stateCount; x++) {
      if (!kernel[x]) continue
      let hasSafeControl = false
      for (let u = 0; u < org.controlCount; u++) {
        let allDisturbancesSafe = true
        for (let w = 0; w < org.disturbanceCount; w++) {
          const next = org.step(x, u, w)
          if (!kernel[next]) {
            allDisturbancesSafe = false
            break
          }
        }
        if (allDisturbancesSafe) {
          hasSafeControl = true
          break
        }
      }
      if (!hasSafeControl) {
        kernel[x] = false
        changed = true
      }
    }
    if (!changed) break
  }

  const intactKernel = fixedPolicyKernel(org, org.intactPolicy)
  const disabledKernel = fixedPolicyKernel(org, () => org.disabledControl)

  const countTrue = (arr: readonly boolean[]): number => {
    let c = 0
    for (const v of arr) if (v) c++
    return c
  }

  return {
    viableRegionSize: countTrue(org.viableStates),
    kernelStates: kernel,
    kernelSize: countTrue(kernel),
    intactKernelStates: intactKernel,
    intactKernelSize: countTrue(intactKernel),
    disabledKernelStates: disabledKernel,
    disabledKernelSize: countTrue(disabledKernel),
    iterations,
  }
}

export type CounterfactualAutonomyResult = {
  readonly initialState: number
  readonly horizonSteps: number
  readonly survivalIntact: number
  readonly survivalDisabled: number
  readonly autonomyScore: number
  readonly isAutonomous: boolean
}

function exactSurvivalProbability(
  org: ControlledOrganization,
  policy: (state: number) => number,
  initialState: number,
  horizonSteps: number,
  disturbanceProbs: readonly number[],
): number {
  if (!org.viableStates[initialState]) return 0
  let dist = new Float64Array(org.stateCount)
  dist[initialState] = 1

  for (let t = 0; t < horizonSteps; t++) {
    const nextDist = new Float64Array(org.stateCount)
    for (let x = 0; x < org.stateCount; x++) {
      const px = dist[x]!
      if (px === 0 || !org.viableStates[x]) continue
      const u = policy(x)
      for (let w = 0; w < org.disturbanceCount; w++) {
        const pw = disturbanceProbs[w]!
        if (pw === 0) continue
        const y = org.step(x, u, w)
        if (org.viableStates[y]) {
          nextDist[y] = nextDist[y]! + px * pw
        }
      }
    }
    dist = nextDist
  }

  let survival = 0
  for (let x = 0; x < org.stateCount; x++) {
    if (org.viableStates[x]) survival += dist[x]!
  }
  return survival
}

// Exact surgical counterfactual autonomy A = P(surv | intact) - P(surv | do(regulator = disabled)).
export function computeCounterfactualAutonomy(input: {
  readonly org: ControlledOrganization
  readonly initialState: number
  readonly horizonSteps: number
  readonly disturbanceProbs: readonly number[]
}): CounterfactualAutonomyResult {
  const { org, initialState, horizonSteps, disturbanceProbs } = input
  if (disturbanceProbs.length !== org.disturbanceCount) {
    throw new Error('disturbanceProbs length must match disturbanceCount')
  }

  const survivalIntact = exactSurvivalProbability(
    org,
    org.intactPolicy,
    initialState,
    horizonSteps,
    disturbanceProbs,
  )
  const survivalDisabled = exactSurvivalProbability(
    org,
    () => org.disabledControl,
    initialState,
    horizonSteps,
    disturbanceProbs,
  )
  const autonomyScore = survivalIntact - survivalDisabled

  return {
    initialState,
    horizonSteps,
    survivalIntact,
    survivalDisabled,
    autonomyScore,
    isAutonomous: autonomyScore > 1e-12,
  }
}
