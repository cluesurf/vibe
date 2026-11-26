// Behavioral equivalence, partition lattice algebra, strong Markov lumpability,
// and quantum operator-algebraic / subspace closure (Note 17 Laws M01-M08).
//
// Strictly deterministic, zero external dependencies, noUncheckedIndexedAccess-safe.

export type Partition = {
  readonly stateCount: number
  readonly classCount: number
  readonly classOf: readonly number[]
  readonly classes: readonly (readonly number[])[]
}

// Canonicalize arbitrary integer class labels to deterministic 0..classCount-1 ordering.
export function canonicalizePartition(labels: readonly number[]): Partition {
  const stateCount = labels.length
  const remap = new Map<number, number>()
  const classOf: number[] = new Array<number>(stateCount)
  const buckets: number[][] = []

  for (let x = 0; x < stateCount; x++) {
    const raw = labels[x]!
    let cid = remap.get(raw)
    if (cid === undefined) {
      cid = buckets.length
      remap.set(raw, cid)
      buckets.push([])
    }
    classOf[x] = cid
    buckets[cid]!.push(x)
  }

  return {
    stateCount,
    classCount: buckets.length,
    classOf,
    classes: buckets,
  }
}

export function partitionFromStrings(labels: readonly string[]): Partition {
  const remap = new Map<string, number>()
  const nums: number[] = new Array<number>(labels.length)
  for (let i = 0; i < labels.length; i++) {
    const key = labels[i]!
    let id = remap.get(key)
    if (id === undefined) {
      id = remap.size
      remap.set(key, id)
    }
    nums[i] = id
  }
  return canonicalizePartition(nums)
}

// Law M03: A is at least as fine as B iff pi_A(x) = pi_A(x') => pi_B(x) = pi_B(x').
export function partitionRefines(finer: Partition, coarser: Partition): boolean {
  if (finer.stateCount !== coarser.stateCount) {
    return false
  }
  for (const block of finer.classes) {
    if (block.length <= 1) continue
    const target = coarser.classOf[block[0]!]!
    for (let i = 1; i < block.length; i++) {
      if (coarser.classOf[block[i]!]! !== target) {
        return false
      }
    }
  }
  return true
}

export function partitionsEqual(a: Partition, b: Partition): boolean {
  if (a.stateCount !== b.stateCount || a.classCount !== b.classCount) {
    return false
  }
  for (let i = 0; i < a.stateCount; i++) {
    if (a.classOf[i]! !== b.classOf[i]!) {
      return false
    }
  }
  return true
}

// Law M04: Meet E_A /\ E_B = E_A cap E_B (common refinement).
export function partitionMeet(a: Partition, b: Partition): Partition {
  if (a.stateCount !== b.stateCount) {
    throw new Error('partitionMeet requires matching stateCount')
  }
  const stride = b.classCount + 1
  const combined: number[] = new Array<number>(a.stateCount)
  for (let x = 0; x < a.stateCount; x++) {
    combined[x] = a.classOf[x]! * stride + b.classOf[x]!
  }
  return canonicalizePartition(combined)
}

// Law M04: Join E_A \/ E_B = EqClosure(E_A cup E_B) (common coarsening).
export function partitionJoin(a: Partition, b: Partition): Partition {
  if (a.stateCount !== b.stateCount) {
    throw new Error('partitionJoin requires matching stateCount')
  }
  const n = a.stateCount
  const parent = new Int32Array(n)
  for (let i = 0; i < n; i++) parent[i] = i

  const find = (x: number): number => {
    let cur = x
    while (parent[cur]! !== cur) {
      parent[cur] = parent[parent[cur]!]!
      cur = parent[cur]!
    }
    return cur
  }
  const unite = (x: number, y: number): void => {
    const rx = find(x)
    const ry = find(y)
    if (rx !== ry) {
      if (rx < ry) parent[ry] = rx
      else parent[rx] = ry
    }
  }

  for (const block of a.classes) {
    for (let i = 1; i < block.length; i++) unite(block[0]!, block[i]!)
  }
  for (const block of b.classes) {
    for (let i = 1; i < block.length; i++) unite(block[0]!, block[i]!)
  }

  const roots: number[] = new Array<number>(n)
  for (let i = 0; i < n; i++) roots[i] = find(i)
  return canonicalizePartition(roots)
}

// Law M05: Check exact dynamical compatibility x E x' => F(x) E F(x').
export function isDynamicalCongruence(
  transition: readonly number[],
  partition: Partition,
): boolean {
  if (transition.length !== partition.stateCount) {
    return false
  }
  for (const block of partition.classes) {
    if (block.length <= 1) continue
    const targetClass = partition.classOf[transition[block[0]!]!]!
    for (let i = 1; i < block.length; i++) {
      const nextClass = partition.classOf[transition[block[i]!]!]!
      if (nextClass !== targetClass) {
        return false
      }
    }
  }
  return true
}

export type CommutingSquareReport = {
  readonly exact: boolean
  readonly residual: number
  readonly violatingStates: number
  readonly inducedTransition: readonly number[]
}

// Commuting-square diagnostic for a deterministic transition and candidate partition.
// Majority-vote induced macro map is evaluated against evolve-then-project across all states.
export function commutingSquareResidual(
  transition: readonly number[],
  partition: Partition,
): CommutingSquareReport {
  const n = partition.stateCount
  if (n === 0) {
    return { exact: true, residual: 0, violatingStates: 0, inducedTransition: [] }
  }
  const inducedTransition: number[] = new Array<number>(partition.classCount).fill(0)
  let violatingStates = 0

  for (let c = 0; c < partition.classCount; c++) {
    const block = partition.classes[c]!
    const counts = new Map<number, number>()
    let bestClass = 0
    let bestCount = -1
    for (const x of block) {
      const nextC = partition.classOf[transition[x]!]!
      const nextCount = (counts.get(nextC) ?? 0) + 1
      counts.set(nextC, nextCount)
      if (nextCount > bestCount || (nextCount === bestCount && nextC < bestClass)) {
        bestCount = nextCount
        bestClass = nextC
      }
    }
    inducedTransition[c] = bestClass
    violatingStates += block.length - bestCount
  }

  return {
    exact: violatingStates === 0,
    residual: violatingStates / n,
    violatingStates,
    inducedTransition,
  }
}

export type PredictiveEquivalenceResult = {
  readonly partition: Partition
  readonly observablePartition: Partition
  readonly inducedTransition: readonly number[]
  readonly inducedObservable: readonly string[]
  readonly commutingResidual: number
  readonly refinementRounds: number
  readonly compressionRatio: number
  readonly preservesObservable: boolean
  readonly isCongruence: boolean
  readonly isCoarsestCongruence: boolean
}

// Law M06: Exact Moore partition refinement computing predictive behavioral equivalence ~_h.
// x ~_h x' iff for all t >= 0, h(F^t(x)) = h(F^t(x')).
export function computePredictiveEquivalence(input: {
  readonly stateCount: number
  readonly transition: readonly number[]
  readonly observable: readonly string[]
}): PredictiveEquivalenceResult {
  const { stateCount, transition, observable } = input
  if (transition.length !== stateCount || observable.length !== stateCount) {
    throw new Error('transition and observable lengths must match stateCount')
  }

  const observablePartition = partitionFromStrings(observable)
  let current = observablePartition
  let refinementRounds = 0

  while (true) {
    const stride = current.classCount + 1
    const sigs: number[] = new Array<number>(stateCount)
    for (let x = 0; x < stateCount; x++) {
      const nextState = transition[x]!
      sigs[x] = current.classOf[x]! * stride + current.classOf[nextState]!
    }
    const next = canonicalizePartition(sigs)
    refinementRounds++
    if (next.classCount === current.classCount) {
      current = next
      break
    }
    current = next
  }

  const sq = commutingSquareResidual(transition, current)
  const inducedObservable: string[] = new Array<string>(current.classCount)
  for (let c = 0; c < current.classCount; c++) {
    const rep = current.classes[c]![0]!
    inducedObservable[c] = observable[rep]!
  }

  // Certify coarsestness: merging any two distinct classes violates h or congruence.
  let isCoarsestCongruence = true
  if (current.classCount <= 128) {
    outer: for (let c1 = 0; c1 < current.classCount; c1++) {
      for (let c2 = c1 + 1; c2 < current.classCount; c2++) {
        if (inducedObservable[c1] !== inducedObservable[c2]) {
          continue
        }
        const mergedLabels = current.classOf.map(c => (c === c2 ? c1 : c))
        const merged = canonicalizePartition(mergedLabels)
        if (isDynamicalCongruence(transition, merged)) {
          isCoarsestCongruence = false
          break outer
        }
      }
    }
  }

  return {
    partition: current,
    observablePartition,
    inducedTransition: sq.inducedTransition,
    inducedObservable,
    commutingResidual: sq.residual,
    refinementRounds,
    compressionRatio: current.classCount > 0 ? stateCount / current.classCount : 0,
    preservesObservable: partitionRefines(current, observablePartition),
    isCongruence: isDynamicalCongruence(transition, current),
    isCoarsestCongruence,
  }
}

export type InteractiveEquivalenceResult = {
  readonly partition: Partition
  readonly observablePartition: Partition
  readonly inducedTransition: readonly (readonly number[])[]
  readonly inducedObservable: readonly string[]
  readonly commutingResidual: number
  readonly refinementRounds: number
  readonly inputAlphabetSize: number
  readonly compressionRatio: number
  readonly verifiedWordHorizon: number
  readonly verifiedWordCount: number
  readonly allWordsMatch: boolean
}

// Law M07: Exact interactive open-system behavioral equivalence ~_{F, h} over finite input alphabet U.
// x ~_{F, h} x' iff for all finite input words w in U*, h(F_w(x)) = h(F_w(x')).
export function computeInteractiveEquivalence(input: {
  readonly stateCount: number
  readonly inputCount: number
  readonly transition: readonly (readonly number[])[]
  readonly observable: readonly string[]
  readonly verifyHorizon?: number
}): InteractiveEquivalenceResult {
  const { stateCount, inputCount, transition, observable } = input
  const verifyHorizon = input.verifyHorizon ?? 4
  if (transition.length !== stateCount || observable.length !== stateCount) {
    throw new Error('transition and observable lengths must match stateCount')
  }

  const observablePartition = partitionFromStrings(observable)
  let current = observablePartition
  let refinementRounds = 0

  while (true) {
    const sigMap = new Map<string, number>()
    const nextLabels: number[] = new Array<number>(stateCount)
    for (let x = 0; x < stateCount; x++) {
      const row = transition[x]!
      let key = `${current.classOf[x]!}`
      for (let u = 0; u < inputCount; u++) {
        key += `,${current.classOf[row[u]!]!}`
      }
      let cid = sigMap.get(key)
      if (cid === undefined) {
        cid = sigMap.size
        sigMap.set(key, cid)
      }
      nextLabels[x] = cid
    }
    const next = canonicalizePartition(nextLabels)
    refinementRounds++
    if (next.classCount === current.classCount) {
      current = next
      break
    }
    current = next
  }

  const inducedTransition: number[][] = Array.from(
    { length: current.classCount },
    () => new Array<number>(inputCount).fill(0),
  )
  const inducedObservable: string[] = new Array<string>(current.classCount)

  let mismatchCount = 0
  for (let c = 0; c < current.classCount; c++) {
    const block = current.classes[c]!
    const rep = block[0]!
    inducedObservable[c] = observable[rep]!
    for (let u = 0; u < inputCount; u++) {
      const targetClass = current.classOf[transition[rep]![u]!]!
      inducedTransition[c]![u] = targetClass
      for (let i = 1; i < block.length; i++) {
        if (current.classOf[transition[block[i]!]![u]!]! !== targetClass) {
          mismatchCount++
        }
      }
    }
  }

  // Exhaustively verify h(F_w(x)) = h(F_w(x')) across all words w in U* up to verifyHorizon.
  let verifiedWordCount = 0
  let allWordsMatch = true
  const maxWordsCap = 4096

  const walkWords = (depth: number, microStates: readonly number[], macroStates: readonly number[]): void => {
    verifiedWordCount++
    for (let x = 0; x < stateCount; x++) {
      const microObs = observable[microStates[x]!]!
      const macroObs = inducedObservable[macroStates[x]!]!
      if (microObs !== macroObs) {
        allWordsMatch = false
        return
      }
    }
    if (depth >= verifyHorizon || verifiedWordCount >= maxWordsCap) {
      return
    }
    for (let u = 0; u < inputCount; u++) {
      const nextMicro: number[] = new Array<number>(stateCount)
      const nextMacro: number[] = new Array<number>(stateCount)
      for (let x = 0; x < stateCount; x++) {
        nextMicro[x] = transition[microStates[x]!]![u]!
        nextMacro[x] = inducedTransition[macroStates[x]!]![u]!
      }
      walkWords(depth + 1, nextMicro, nextMacro)
      if (!allWordsMatch) return
    }
  }

  const initMicro = Array.from({ length: stateCount }, (_, x) => x)
  const initMacro = Array.from({ length: stateCount }, (_, x) => current.classOf[x]!)
  walkWords(0, initMicro, initMacro)

  return {
    partition: current,
    observablePartition,
    inducedTransition,
    inducedObservable,
    commutingResidual:
      stateCount * inputCount > 0 ? mismatchCount / (stateCount * inputCount) : 0,
    refinementRounds,
    inputAlphabetSize: inputCount,
    compressionRatio: current.classCount > 0 ? stateCount / current.classCount : 0,
    verifiedWordHorizon: verifyHorizon,
    verifiedWordCount,
    allWordsMatch,
  }
}

// Law M08: Strong Markov lumpability test.
export type StrongLumpabilityResult = {
  readonly lumpable: boolean
  readonly maxDefect: number
  readonly lumpedTpm: readonly (readonly number[])[]
}

export function checkStrongLumpability(
  tpm: readonly (readonly number[])[],
  partition: Partition,
  tolerance = 1e-12,
): StrongLumpabilityResult {
  const m = partition.classCount
  const lumpedTpm: number[][] = Array.from({ length: m }, () =>
    new Array<number>(m).fill(0),
  )
  let maxDefect = 0

  for (let c = 0; c < m; c++) {
    const block = partition.classes[c]!
    const aggRows: number[][] = block.map(x => {
      const agg = new Array<number>(m).fill(0)
      const row = tpm[x]!
      for (let y = 0; y < partition.stateCount; y++) {
        const cy = partition.classOf[y]!
        agg[cy] = agg[cy]! + row[y]!
      }
      return agg
    })

    for (let target = 0; target < m; target++) {
      let sum = 0
      for (const r of aggRows) sum += r[target]!
      const mean = block.length > 0 ? sum / block.length : 0
      lumpedTpm[c]![target] = mean
      for (const r of aggRows) {
        const diff = Math.abs(r[target]! - mean)
        if (diff > maxDefect) maxDefect = diff
      }
    }
  }

  return {
    lumpable: maxDefect <= tolerance,
    maxDefect,
    lumpedTpm,
  }
}

// =================================================================================================
// QUANTUM OPERATOR-ALGEBRAIC & SUBSPACE CLOSURE (Fixing Note 17's Classical-Set Gap)
// =================================================================================================

export type ComplexMatrix = {
  readonly dim: number
  readonly re: Float64Array
  readonly im: Float64Array
}

export function cmatZero(dim: number): ComplexMatrix {
  return { dim, re: new Float64Array(dim * dim), im: new Float64Array(dim * dim) }
}

export function cmatIdentity(dim: number): ComplexMatrix {
  const m = cmatZero(dim)
  for (let i = 0; i < dim; i++) m.re[i * dim + i] = 1
  return m
}

export function cmatMul(a: ComplexMatrix, b: ComplexMatrix): ComplexMatrix {
  const n = a.dim
  if (b.dim !== n) throw new Error('cmatMul dimension mismatch')
  const out = cmatZero(n)
  for (let i = 0; i < n; i++) {
    for (let k = 0; k < n; k++) {
      const ar = a.re[i * n + k]!
      const ai = a.im[i * n + k]!
      if (ar === 0 && ai === 0) continue
      for (let j = 0; j < n; j++) {
        const br = b.re[k * n + j]!
        const bi = b.im[k * n + j]!
        out.re[i * n + j] = out.re[i * n + j]! + (ar * br - ai * bi)
        out.im[i * n + j] = out.im[i * n + j]! + (ar * bi + ai * br)
      }
    }
  }
  return out
}

export function cmatDagger(a: ComplexMatrix): ComplexMatrix {
  const n = a.dim
  const out = cmatZero(n)
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      out.re[j * n + i] = a.re[i * n + j]!
      out.im[j * n + i] = -a.im[i * n + j]!
    }
  }
  return out
}

export function cmatSub(a: ComplexMatrix, b: ComplexMatrix): ComplexMatrix {
  const n = a.dim
  if (b.dim !== n) throw new Error('cmatSub dimension mismatch')
  const out = cmatZero(n)
  for (let k = 0; k < n * n; k++) {
    out.re[k] = a.re[k]! - b.re[k]!
    out.im[k] = a.im[k]! - b.im[k]!
  }
  return out
}

export function cmatFrobeniusNorm(a: ComplexMatrix): number {
  let sum = 0
  for (let k = 0; k < a.dim * a.dim; k++) {
    const r = a.re[k]!
    const im = a.im[k]!
    sum += r * r + im * im
  }
  return Math.sqrt(sum)
}

export function cmatUnitaryError(u: ComplexMatrix): number {
  const uDagU = cmatMul(cmatDagger(u), u)
  return cmatFrobeniusNorm(cmatSub(uDagU, cmatIdentity(u.dim)))
}

export function cmatTraceReal(a: ComplexMatrix): number {
  let sum = 0
  for (let i = 0; i < a.dim; i++) sum += a.re[i * a.dim + i]!
  return sum
}

// Orthonormalize candidate basis vectors via Modified Gram-Schmidt and form projector P = sum |v><v|.
export function cmatProjectorFromBasis(
  dim: number,
  vectors: readonly { readonly re: readonly number[]; readonly im: readonly number[] }[],
): ComplexMatrix {
  const basisRe: Float64Array[] = []
  const basisIm: Float64Array[] = []

  for (const vec of vectors) {
    const vr = Float64Array.from(vec.re)
    const vi = Float64Array.from(vec.im)
    for (let b = 0; b < basisRe.length; b++) {
      const br = basisRe[b]!
      const bi = basisIm[b]!
      let dotR = 0
      let dotI = 0
      for (let i = 0; i < dim; i++) {
        dotR += br[i]! * vr[i]! + bi[i]! * vi[i]!
        dotI += br[i]! * vi[i]! - bi[i]! * vr[i]!
      }
      for (let i = 0; i < dim; i++) {
        vr[i] = vr[i]! - (dotR * br[i]! - dotI * bi[i]!)
        vi[i] = vi[i]! - (dotR * bi[i]! + dotI * br[i]!)
      }
    }
    let normSq = 0
    for (let i = 0; i < dim; i++) normSq += vr[i]! * vr[i]! + vi[i]! * vi[i]!
    if (normSq > 1e-24) {
      const inv = 1 / Math.sqrt(normSq)
      for (let i = 0; i < dim; i++) {
        vr[i] = vr[i]! * inv
        vi[i] = vi[i]! * inv
      }
      basisRe.push(vr)
      basisIm.push(vi)
    }
  }

  const p = cmatZero(dim)
  for (let b = 0; b < basisRe.length; b++) {
    const br = basisRe[b]!
    const bi = basisIm[b]!
    for (let i = 0; i < dim; i++) {
      for (let j = 0; j < dim; j++) {
        p.re[i * dim + j] = p.re[i * dim + j]! + (br[i]! * br[j]! + bi[i]! * bi[j]!)
        p.im[i * dim + j] = p.im[i * dim + j]! + (bi[i]! * br[j]! - br[i]! * bi[j]!)
      }
    }
  }
  return p
}

export type SubspaceClosureResult = {
  readonly invarianceDefect: number
  readonly normalizedDefect: number
  readonly projectorRank: number
  readonly unitaryError: number
  readonly closed: boolean
  readonly moriZwanzigLeakage: readonly number[]
  readonly projectedUnitarityDefect: readonly number[]
}

// Quantum subspace closure:
//   eps_inv = ||(I - P) U P||_F
//   Mori-Zwanzig leakage over t = 1..T: ||(I - P) U^t P||_F
//   Projected unitarity defect over t = 1..T: ||P - (P U^t P)^dag (P U^t P)||_F
export function computeQuantumSubspaceClosure(input: {
  readonly unitary: ComplexMatrix
  readonly projector: ComplexMatrix
  readonly horizonSteps?: number
  readonly tolerance?: number
}): SubspaceClosureResult {
  const { unitary, projector } = input
  const horizonSteps = input.horizonSteps ?? 6
  const tolerance = input.tolerance ?? 1e-12
  const n = unitary.dim
  if (projector.dim !== n) throw new Error('unitary and projector dimension mismatch')

  const eye = cmatIdentity(n)
  const qProj = cmatSub(eye, projector)
  const projectorRank = Math.round(cmatTraceReal(projector))
  const unitaryError = cmatUnitaryError(unitary)

  const moriZwanzigLeakage: number[] = []
  const projectedUnitarityDefect: number[] = []

  let uPow = eye
  for (let t = 1; t <= horizonSteps; t++) {
    uPow = cmatMul(uPow, unitary)
    const leakMat = cmatMul(qProj, cmatMul(uPow, projector))
    moriZwanzigLeakage.push(cmatFrobeniusNorm(leakMat))

    const eff = cmatMul(projector, cmatMul(uPow, projector))
    const effUnit = cmatMul(cmatDagger(eff), eff)
    projectedUnitarityDefect.push(cmatFrobeniusNorm(cmatSub(projector, effUnit)))
  }

  const invarianceDefect = moriZwanzigLeakage[0] ?? 0
  const normalizedDefect =
    projectorRank > 0 ? invarianceDefect / Math.sqrt(projectorRank) : invarianceDefect

  return {
    invarianceDefect,
    normalizedDefect,
    projectorRank,
    unitaryError,
    closed: invarianceDefect <= tolerance,
    moriZwanzigLeakage,
    projectedUnitarityDefect,
  }
}

function hsInner(a: ComplexMatrix, b: ComplexMatrix): readonly [number, number] {
  let re = 0
  let im = 0
  const len = a.dim * a.dim
  for (let k = 0; k < len; k++) {
    const ar = a.re[k]!
    const ai = a.im[k]!
    const br = b.re[k]!
    const bi = b.im[k]!
    re += ar * br + ai * bi
    im += ar * bi - ai * br
  }
  return [re, im]
}

function orthonormalizeOperatorBasis(
  ops: readonly ComplexMatrix[],
): ComplexMatrix[] {
  const basis: ComplexMatrix[] = []
  for (const op of ops) {
    const cur: ComplexMatrix = {
      dim: op.dim,
      re: Float64Array.from(op.re),
      im: Float64Array.from(op.im),
    }
    for (const b of basis) {
      const [cr, ci] = hsInner(b, cur)
      for (let k = 0; k < cur.dim * cur.dim; k++) {
        cur.re[k] = cur.re[k]! - (cr * b.re[k]! - ci * b.im[k]!)
        cur.im[k] = cur.im[k]! - (cr * b.im[k]! + ci * b.re[k]!)
      }
    }
    const norm = cmatFrobeniusNorm(cur)
    if (norm > 1e-13) {
      const inv = 1 / norm
      for (let k = 0; k < cur.dim * cur.dim; k++) {
        cur.re[k] = cur.re[k]! * inv
        cur.im[k] = cur.im[k]! * inv
      }
      basis.push(cur)
    }
  }
  return basis
}

function distanceFromOperatorSpan(
  target: ComplexMatrix,
  orthoBasis: readonly ComplexMatrix[],
): number {
  const rem: ComplexMatrix = {
    dim: target.dim,
    re: Float64Array.from(target.re),
    im: Float64Array.from(target.im),
  }
  for (const b of orthoBasis) {
    const [cr, ci] = hsInner(b, rem)
    for (let k = 0; k < rem.dim * rem.dim; k++) {
      rem.re[k] = rem.re[k]! - (cr * b.re[k]! - ci * b.im[k]!)
      rem.im[k] = rem.im[k]! - (cr * b.im[k]! + ci * b.re[k]!)
    }
  }
  return cmatFrobeniusNorm(rem)
}

export type HeisenbergClosureResult = {
  readonly basisRank: number
  readonly maxAlgebraDefect: number
  readonly perObservableDefects: readonly number[]
  readonly horizonMaxDefects: readonly number[]
  readonly closed: boolean
}

// Quantum Heisenberg operator-subalgebra closure:
// Measures exact Hilbert-Schmidt distance of (U^dag)^t O_k U^t from span{O_j}.
export function computeHeisenbergSubalgebraClosure(input: {
  readonly unitary: ComplexMatrix
  readonly observables: readonly ComplexMatrix[]
  readonly horizonSteps?: number
  readonly tolerance?: number
}): HeisenbergClosureResult {
  const { unitary, observables } = input
  const horizonSteps = input.horizonSteps ?? 6
  const tolerance = input.tolerance ?? 1e-12
  const n = unitary.dim
  const orthoBasis = orthonormalizeOperatorBasis(observables)

  const uDag = cmatDagger(unitary)
  let uPow = cmatIdentity(n)
  let uDagPow = cmatIdentity(n)

  const horizonMaxDefects: number[] = []
  let firstStepDefects: number[] = []

  for (let t = 1; t <= horizonSteps; t++) {
    uPow = cmatMul(uPow, unitary)
    uDagPow = cmatMul(uDag, uDagPow)
    const stepDefects: number[] = []
    let maxD = 0
    for (const obs of observables) {
      const evolved = cmatMul(uDagPow, cmatMul(obs, uPow))
      const d = distanceFromOperatorSpan(evolved, orthoBasis)
      stepDefects.push(d)
      if (d > maxD) maxD = d
    }
    if (t === 1) firstStepDefects = stepDefects
    horizonMaxDefects.push(maxD)
  }

  const maxAlgebraDefect = horizonMaxDefects[0] ?? 0
  return {
    basisRank: orthoBasis.length,
    maxAlgebraDefect,
    perObservableDefects: firstStepDefects,
    horizonMaxDefects,
    closed: maxAlgebraDefect <= tolerance,
  }
}
