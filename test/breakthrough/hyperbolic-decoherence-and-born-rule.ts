// Wave-4 Physics Track W17:
//   Genuine Multi-Body Partial-Trace Decoherence on Fixed {3,4,3,4} vs Apples-to-Apples Flat Controls,
//   Multi-Fragment Quantum Darwinism (Full f = 0..N_env Plateau, Holevo chi_Z + Discord D_Z, Scrambled Control),
//   Exact BigInt Z[zeta_9][1/6] Zurek Envariance, p = 2 Uniqueness & 3D Gleason Non-Contextuality,
//   and Dynamical Bell-CHSH Decoherence Transition (2.828427 -> < 2.0 vs Flat Periodic Controls).
//
// Closes the gaps in E-QTM-0205 (R=2 ball algebraic check only) and E-QTM-0206 (L1 abstract
// 1+4 qubit circuit without {3,4,3,4} cusp geometry, Holevo/discord decomposition, or Bell bath transition).
//
// Strictly deterministic (ZERO Math.random), standalone (ZERO external imports), laptop-safe
// (< 10 s, < 300 MB RAM), strict TypeScript (noUncheckedIndexedAccess: true safe).

// ============================================================================
// 0. VERIFICATION LEDGER & BASIC CONSTANTS
// ============================================================================

type CheckRow = {
  readonly id: string
  readonly name: string
  readonly pass: boolean
  readonly metric: string
}

const CHECKS: CheckRow[] = []

function recordCheck(id: string, name: string, pass: boolean, metric: string): void {
  CHECKS.push({ id, name, pass, metric })
}

function assertExact(cond: boolean, msg: string): void {
  if (!cond) throw new Error(`ASSERTION FAILED: ${msg}`)
}

const SQRT2 = Math.SQRT2
const SQRT3 = Math.sqrt(3)
const INV_SQRT2 = Math.SQRT1_2
const PI = Math.PI

type C = readonly [number, number]
const C_ZERO: C = [0, 0]
const C_ONE: C = [1, 0]
const cAdd = (a: C, b: C): C => [a[0] + b[0], a[1] + b[1]]
const cSub = (a: C, b: C): C => [a[0] - b[0], a[1] - b[1]]
const cMul = (a: C, b: C): C => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]
const cConj = (a: C): C => [a[0], -a[1]]
const cAbs2 = (a: C): number => a[0] * a[0] + a[1] * a[1]
const cAbs = (a: C): number => Math.hypot(a[0], a[1])
const cScale = (s: number, a: C): C => [s * a[0], s * a[1]]

// ============================================================================
// 1. EXACT BigInt CYCLOTOMIC RING Z[zeta_9][1/6] & O^+(4,1; Z[sqrt(2)]) ENGINE
//    (Canonical conventions matching deck/vibe/test/universe.ts)
// ============================================================================

type Z9 = readonly [bigint, bigint, bigint, bigint, bigint, bigint]
type Root4 = readonly [bigint, bigint, bigint, bigint]
type Q2 = readonly [bigint, bigint] // a + b * sqrt(2)

const Z9_ZERO: Z9 = [0n, 0n, 0n, 0n, 0n, 0n]
const Z9_ONE: Z9 = [1n, 0n, 0n, 0n, 0n, 0n]
const Z9_OMEGA: Z9 = [0n, 0n, 0n, 1n, 0n, 0n] // zeta_9^3 = omega = e^{2 pi i / 3}
const Z9_OMEGA2: Z9 = [-1n, 0n, 0n, -1n, 0n, 0n] // omega^2 = -1 - omega
const Z9_ZETA6: Z9 = [1n, 0n, 0n, 1n, 0n, 0n] // 1 + omega = e^{i pi / 3}
const Z9_ZETA18: Z9 = [0n, 0n, 0n, 0n, 0n, -1n] // -zeta_9^5 = e^{i pi / 9}
const Z9_COIN_DIAG: Z9 = [2n, 0n, 0n, 1n, 0n, 0n] // 2 + omega (D half-coin diagonal * 2)
const Z9_COIN_OFF: Z9 = [0n, 0n, 0n, -1n, 0n, 0n] // -omega (D half-coin off-diagonal * 2)
const Z9_C_DIAG: Z9 = [1n, 0n, 0n, 1n, 0n, 0n] // 1 + omega (C = D^2 diagonal * 2)
const Z9_C_OFF: Z9 = [1n, 0n, 0n, -1n, 0n, 0n] // 1 - omega (C = D^2 off-diagonal * 2)

const addZ9 = (a: Z9, b: Z9): Z9 => [
  a[0] + b[0],
  a[1] + b[1],
  a[2] + b[2],
  a[3] + b[3],
  a[4] + b[4],
  a[5] + b[5],
]
const scaleZ9 = (f: bigint, a: Z9): Z9 => [
  f * a[0],
  f * a[1],
  f * a[2],
  f * a[3],
  f * a[4],
  f * a[5],
]
const divExactZ9 = (a: Z9, d: bigint): Z9 => {
  for (let i = 0; i < 6; i++) {
    if (a[i]! % d !== 0n) throw new Error(`Inexact Z9 division by ${d}`)
  }
  return [a[0] / d, a[1] / d, a[2] / d, a[3] / d, a[4] / d, a[5] / d]
}
const conjZ9 = (a: Z9): Z9 => [
  a[0] - a[3],
  -a[2],
  -a[1],
  -a[3],
  a[5] - a[2],
  a[4] - a[1],
]
const eqZ9 = (a: Z9, b: Z9): boolean =>
  a[0] === b[0] &&
  a[1] === b[1] &&
  a[2] === b[2] &&
  a[3] === b[3] &&
  a[4] === b[4] &&
  a[5] === b[5]
const isZeroZ9 = (a: Z9): boolean => eqZ9(a, Z9_ZERO)

function mulZ9(a: Z9, b: Z9): Z9 {
  const p = new Array<bigint>(11).fill(0n)
  for (let i = 0; i < 6; i++) {
    const ai = a[i]!
    if (ai === 0n) continue
    for (let j = 0; j < 6; j++) {
      p[i + j] = p[i + j]! + ai * b[j]!
    }
  }
  return [
    p[0]! - p[6]! + p[9]!,
    p[1]! - p[7]! + p[10]!,
    p[2]! - p[8]!,
    p[3]! - p[6]!,
    p[4]! - p[7]!,
    p[5]! - p[8]!,
  ]
}

const ZETA18_POW: readonly Z9[] = (() => {
  const arr: Z9[] = [Z9_ONE]
  for (let k = 1; k < 18; k++) arr.push(mulZ9(arr[k - 1]!, Z9_ZETA18))
  return arr
})()

function z9ToComplex(a: Z9, den = 1n): C {
  let re = 0
  let im = 0
  const d = Number(den)
  for (let k = 0; k < 6; k++) {
    const c = Number(a[k]!) / d
    if (c === 0) continue
    const ang = (2 * PI * k) / 9
    re += c * Math.cos(ang)
    im += c * Math.sin(ang)
  }
  return [re, im]
}

type Z9Mat = readonly (readonly Z9[])[]

function isExactScaledUnitaryZ9(mat: Z9Mat, scaleSq: bigint): boolean {
  const dim = mat.length
  for (let i = 0; i < dim; i++) {
    for (let j = 0; j < dim; j++) {
      let acc = Z9_ZERO
      for (let k = 0; k < dim; k++) {
        acc = addZ9(acc, mulZ9(conjZ9(mat[k]![i]!), mat[k]![j]!))
      }
      const target: Z9 = i === j ? [scaleSq, 0n, 0n, 0n, 0n, 0n] : Z9_ZERO
      if (!eqZ9(acc, target)) return false
    }
  }
  return true
}

function applyBipartiteZ9(uS: Z9Mat, uE: Z9Mat, vec: readonly Z9[]): Z9[] {
  const dS = uS.length
  const dE = uE.length
  const mid = new Array<Z9>(dS * dE).fill(Z9_ZERO)
  for (let sOut = 0; sOut < dS; sOut++) {
    for (let e = 0; e < dE; e++) {
      let acc = Z9_ZERO
      for (let sIn = 0; sIn < dS; sIn++) {
        const v = vec[sIn * dE + e]!
        if (!isZeroZ9(v)) acc = addZ9(acc, mulZ9(uS[sOut]![sIn]!, v))
      }
      mid[sOut * dE + e] = acc
    }
  }
  const out = new Array<Z9>(dS * dE).fill(Z9_ZERO)
  for (let s = 0; s < dS; s++) {
    for (let eOut = 0; eOut < dE; eOut++) {
      let acc = Z9_ZERO
      for (let eIn = 0; eIn < dE; eIn++) {
        const v = mid[s * dE + eIn]!
        if (!isZeroZ9(v)) acc = addZ9(acc, mulZ9(uE[eOut]![eIn]!, v))
      }
      out[s * dE + eOut] = acc
    }
  }
  return out
}

// Exact O^+(4,1; Z[sqrt(2)]) {3,4,3,4} Coxeter honeycomb, cusp BFS, and frame-extracted tree graph
const Q2_ZERO: Q2 = [0n, 0n]
const Q2_ONE: Q2 = [1n, 0n]
const addQ2 = (u: Q2, v: Q2): Q2 => [u[0] + v[0], u[1] + v[1]]
const subQ2 = (u: Q2, v: Q2): Q2 => [u[0] - v[0], u[1] - v[1]]
const mulQ2 = (u: Q2, v: Q2): Q2 => [u[0] * v[0] + 2n * u[1] * v[1], u[0] * v[1] + u[1] * v[0]]
const eqQ2 = (u: Q2, v: Q2): boolean => u[0] === v[0] && u[1] === v[1]
const q2ToFloat = (u: Q2): number => Number(u[0]) + Number(u[1]) * SQRT2

const DIM5 = [0, 1, 2, 3, 4] as const
const EYE5: readonly (readonly Q2[])[] = DIM5.map(i => DIM5.map(j => (i === j ? Q2_ONE : Q2_ZERO)))

const dotQ2 = (u: readonly Q2[], v: readonly Q2[]): Q2 => {
  let acc = Q2_ZERO
  for (let i = 0; i < 5; i++) acc = addQ2(acc, mulQ2(u[i]!, v[i]!))
  return acc
}
const matVecQ2 = (m: readonly (readonly Q2[])[], v: readonly Q2[]): Q2[] =>
  m.map(row => dotQ2(row, v))
const matMulQ2 = (a: readonly (readonly Q2[])[], b: readonly (readonly Q2[])[]): Q2[][] =>
  DIM5.map(i =>
    DIM5.map(j => {
      let acc = Q2_ZERO
      for (let k = 0; k < 5; k++) acc = addQ2(acc, mulQ2(a[i]![k]!, b[k]![j]!))
      return acc
    }),
  )
const vecKeyQ2 = (v: readonly Q2[]): string => v.map(e => `${e[0]},${e[1]}`).join('|')

const TWICE_GRAM: readonly (readonly Q2[])[] = DIM5.map(i =>
  DIM5.map(j => {
    if (i === j) return [2n, 0n] as const
    if (Math.abs(i - j) === 1) return Math.min(i, j) % 2 === 0 ? ([-1n, 0n] as const) : ([0n, -1n] as const)
    return Q2_ZERO
  }),
)
const twiceForm = (u: readonly Q2[], v: readonly Q2[]): Q2 => dotQ2(u, matVecQ2(TWICE_GRAM, v))
const reflect5 = (normal: readonly Q2[]): Q2[][] => {
  const dual = matVecQ2(TWICE_GRAM, normal)
  return EYE5.map((row, i) => row.map((entry, j) => subQ2(entry, mulQ2(normal[i]!, dual[j]!))))
}

const BASE_CENTER: readonly Q2[] = [[2n, 0n], [4n, 0n], [0n, 3n], [0n, 2n], [1n, 0n]]
const CENTRAL_INVERSION: readonly (readonly Q2[])[] = DIM5.map(i =>
  DIM5.map(j => [
    (j === 4 ? 2n * BASE_CENTER[i]![0] : 0n) - (i === j ? 1n : 0n),
    j === 4 ? 2n * BASE_CENTER[i]![1] : 0n,
  ]),
)
const CUSP_VERTEX: readonly Q2[] = [[0n, 0n], [1n, 0n], [0n, 1n], [0n, 1n], [1n, 0n]]

function buildD4Roots(): readonly Root4[] {
  const roots: Root4[] = []
  const signs: readonly bigint[] = [1n, -1n]
  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      for (const si of signs) {
        for (const sj of signs) {
          const c: [bigint, bigint, bigint, bigint] = [0n, 0n, 0n, 0n]
          c[i] = si
          c[j] = sj
          roots.push(c)
        }
      }
    }
  }
  return roots
}

const ROOTS: readonly Root4[] = buildD4Roots()

// Exact partition of the 24 D_4 roots into the 3 orthogonal 8-slot frames F_0, F_1, F_2:
//   F_0: (0,1)/(2,3), F_1: (0,2)/(1,3), F_2: (0,3)/(1,2).
const FRAME_OF_SLOT: readonly number[] = ROOTS.map(r => {
  const nz0 = r[0] !== 0n
  const nz1 = r[1] !== 0n
  const nz2 = r[2] !== 0n
  const nz3 = r[3] !== 0n
  if ((nz0 && nz1) || (nz2 && nz3)) return 0
  if ((nz0 && nz2) || (nz1 && nz3)) return 1
  return 2
})

type HoneycombTreeEdge = {
  readonly frame: number
  readonly parentBit: number
  readonly childBit: number
  readonly slot: number
  readonly parentDepth: number
  readonly childDepth: number
}

type HoneycombCuspData = {
  readonly transports: readonly Q2[][][]
  readonly upSlots: readonly number[]
  readonly latSlots: readonly number[]
  readonly downSlots: readonly number[]
  readonly bfsShellCounts: readonly [number, number, number]
  readonly bfsBranchRatio0: number
  readonly bfsBranchRatio1: number
  readonly treeRootBits: readonly [number, number, number]
  readonly treeFrameBits: readonly (readonly [number, number, number, number])[]
  readonly treeEdges: readonly HoneycombTreeEdge[]
  readonly treeDistinctDocks: number
  readonly treeCrossFrameEdges: number
  readonly treeBackToCuspEdges: number
}

function buildHoneycombCusp(): HoneycombCuspData {
  const stabGens = [0, 1, 2, 3].map(idx => reflect5(EYE5[idx]!))
  const facetNormals: Q2[][] = [EYE5[4]!.slice()]
  const seenN = new Set<string>([vecKeyQ2(EYE5[4]!)])
  for (const n of facetNormals) {
    for (const g of stabGens) {
      const nx = matVecQ2(g, n)
      const k = vecKeyQ2(nx)
      if (!seenN.has(k)) {
        seenN.add(k)
        facetNormals.push(nx)
      }
    }
  }
  const facetDot = (a: number, b: number): bigint =>
    (twiceForm(facetNormals[a]!, facetNormals[b]!)[0] + 2n) / 2n
  const ortho: number[] = []
  for (let f = 0; f < 24 && ortho.length < 4; f++) {
    if (ortho.every(o => facetDot(f, o) === 0n)) ortho.push(f)
  }
  const facetRoots: Root4[] = facetNormals.map((_, f) => {
    const [c0, c1, c2, c3] = ortho.map(o => facetDot(f, o))
    return [(c0! + c1!) / 2n, (c0! - c1!) / 2n, (c2! + c3!) / 2n, (c2! - c3!) / 2n]
  })
  const slotNormals: Q2[][] = ROOTS.map(r => {
    const fi = facetRoots.findIndex(fr => fr.every((v, i) => v === r[i]))
    return facetNormals[fi]!
  })
  const transports = slotNormals.map(fn => matMulQ2(reflect5(fn), CENTRAL_INVERSION))

  const level0 = twiceForm(BASE_CENTER, CUSP_VERTEX)
  const absLv0 = Math.abs(q2ToFloat(level0))
  const heightOf = (c: readonly Q2[]): number => Math.abs(q2ToFloat(twiceForm(c, CUSP_VERTEX)))

  const upSlots: number[] = []
  const latSlots: number[] = []
  const downSlots: number[] = []
  for (let s = 0; s < 24; s++) {
    const c = matVecQ2(transports[s]!, BASE_CENTER)
    const lv = twiceForm(c, CUSP_VERTEX)
    if (eqQ2(lv, level0)) {
      latSlots.push(s)
    } else if (heightOf(c) < absLv0) {
      upSlots.push(s)
    } else {
      downSlots.push(s)
    }
  }

  // Live BFS from origin dock 0 (D=0) into strict downward cusp shells D=1 and D=2!
  // Every D=1 dock is reachable in 1 downward step from D=0 (N_1 = 18).
  // Every D=2 dock is strictly deeper than its D=1 parent and has NO 1-step neighbor at D=0.
  const d0Key = vecKeyQ2(BASE_CENTER)
  const d1Map = new Map<string, { readonly frame: Q2[][]; readonly center: Q2[]; readonly slot: number }>()
  for (const s of downSlots) {
    const f1 = transports[s]!
    const c1 = matVecQ2(f1, BASE_CENTER)
    const k1 = vecKeyQ2(c1)
    if (!d1Map.has(k1)) d1Map.set(k1, { frame: f1, center: c1, slot: s })
  }
  const d2Set = new Set<string>()
  for (const d1 of d1Map.values()) {
    const h1 = heightOf(d1.center)
    for (let s = 0; s < 24; s++) {
      const f2 = matMulQ2(d1.frame, transports[s]!)
      const c2 = matVecQ2(f2, BASE_CENTER)
      const k2 = vecKeyQ2(c2)
      if (k2 === d0Key || d1Map.has(k2)) continue
      if (heightOf(c2) > h1 + 1e-9) {
        d2Set.add(k2)
      }
    }
  }
  const n0 = 1
  const n1 = d1Map.size
  const n2 = d2Set.size
  const bfsBranchRatio0 = n1 / n0
  const bfsBranchRatio1 = n2 / n1

  // Extract the exact 3-frame x 4-mode (1 -> 3) downward tree directly from HONEYCOMB!
  // For each orthogonal D_4 frame f in {0, 1, 2}:
  //   - Root r_f (bit = 1 + 4*f): first downward slot s in downSlots with FRAME_OF_SLOT[s] === f (D=1 dock)
  //   - Children c_{f,1..3} (bits = 2+4*f, 3+4*f, 4+4*f): first 3 strictly deeper D=2 child docks of r_f
  //     along slots in frame f (verified 12/12 strictly distinct docks, 0 cross-frame edges, 0 cusp returns!).
  const treeDockSet = new Set<string>([d0Key])
  const treeFrameBits: [number, number, number, number][] = []
  const treeEdges: HoneycombTreeEdge[] = []
  const frameDocks: Set<string>[] = [new Set<string>(), new Set<string>(), new Set<string>()]
  let treeBackToCuspEdges = 0

  for (let f = 0; f < 3; f++) {
    const rootSlot = downSlots.find(s => FRAME_OF_SLOT[s] === f)!
    const rootFrame = transports[rootSlot]!
    const rootCenter = matVecQ2(rootFrame, BASE_CENTER)
    const rootKey = vecKeyQ2(rootCenter)
    const rootH = heightOf(rootCenter)
    const rBit = 1 + 4 * f
    treeDockSet.add(rootKey)
    frameDocks[f]!.add(rootKey)

    const childBits: number[] = []
    for (let s = 0; s < 24 && childBits.length < 3; s++) {
      if (FRAME_OF_SLOT[s] !== f) continue
      const cFrame = matMulQ2(rootFrame, transports[s]!)
      const cCenter = matVecQ2(cFrame, BASE_CENTER)
      const cKey = vecKeyQ2(cCenter)
      if (heightOf(cCenter) <= rootH + 1e-9) continue
      if (treeDockSet.has(cKey)) continue
      // Verify child has no 1-step return to D=0 cusp horosphere
      for (let t = 0; t < 24; t++) {
        const nb = matVecQ2(matMulQ2(cFrame, transports[t]!), BASE_CENTER)
        if (eqQ2(twiceForm(nb, CUSP_VERTEX), level0)) treeBackToCuspEdges++
      }
      const cBit = rBit + 1 + childBits.length
      treeDockSet.add(cKey)
      frameDocks[f]!.add(cKey)
      childBits.push(cBit)
      treeEdges.push({
        frame: f,
        parentBit: rBit,
        childBit: cBit,
        slot: s,
        parentDepth: 1,
        childDepth: 2,
      })
    }
    assertExact(childBits.length === 3, `Frame F_${f} failed to extract 3 D=2 children`)
    treeFrameBits.push([rBit, childBits[0]!, childBits[1]!, childBits[2]!])
  }

  // Verify pairwise disjointness of the 3 extracted D_4 frame subtrees in O^+(4,1; Z[sqrt(2)])
  let treeCrossFrameEdges = 0
  for (let f1 = 0; f1 < 3; f1++) {
    for (let f2 = f1 + 1; f2 < 3; f2++) {
      for (const k of frameDocks[f1]!) {
        if (frameDocks[f2]!.has(k)) treeCrossFrameEdges++
      }
    }
  }

  return {
    transports,
    upSlots,
    latSlots,
    downSlots,
    bfsShellCounts: [n0, n1, n2],
    bfsBranchRatio0,
    bfsBranchRatio1,
    treeRootBits: [treeFrameBits[0]![0], treeFrameBits[1]![0], treeFrameBits[2]![0]],
    treeFrameBits,
    treeEdges,
    treeDistinctDocks: treeDockSet.size - 1,
    treeCrossFrameEdges,
    treeBackToCuspEdges,
  }
}

const HONEYCOMB = buildHoneycombCusp()

// ============================================================================
// 2. EXACT MULTI-BODY COMPLEX STATEVECTOR, PARTIAL TRACE & HERMITIAN EIGENSOLVER
// ============================================================================

type U2 = readonly [number, number, number, number, number, number, number, number]

function makeU2(a00: C, a01: C, a10: C, a11: C): U2 {
  return [a00[0], a00[1], a01[0], a01[1], a10[0], a10[1], a11[0], a11[1]]
}

function daggerU2(u: U2): U2 {
  return [u[0], -u[1], u[4], -u[5], u[2], -u[3], u[6], -u[7]]
}

const U2_I: U2 = [1, 0, 0, 0, 0, 0, 1, 0]
const U2_D: U2 = makeU2(
  z9ToComplex(Z9_COIN_DIAG, 2n),
  z9ToComplex(Z9_COIN_OFF, 2n),
  z9ToComplex(Z9_COIN_OFF, 2n),
  z9ToComplex(Z9_COIN_DIAG, 2n),
)
const U2_C: U2 = makeU2(
  z9ToComplex(Z9_C_DIAG, 2n),
  z9ToComplex(Z9_C_OFF, 2n),
  z9ToComplex(Z9_C_OFF, 2n),
  z9ToComplex(Z9_C_DIAG, 2n),
)
const U2_C_DAG: U2 = daggerU2(U2_C)
const U2_D_DAG: U2 = daggerU2(U2_D)
const U2_OMEGA2_I: U2 = makeU2(z9ToComplex(Z9_OMEGA2), C_ZERO, C_ZERO, z9ToComplex(Z9_OMEGA2))
const U2_OMEGA2_I_DAG: U2 = daggerU2(U2_OMEGA2_I)
// Bare half-coin determinant phase det(D) * I = zeta_6 * I (1 + w = e^{i pi/3}):
//   <0 | (zeta_6 I)^dag C | 0> = zeta_6^{-1} (1 + w)/2 = +1/2 exact positive real (zero Z-precession).
const U2_ZETA6_I: U2 = makeU2(z9ToComplex(Z9_ZETA6), C_ZERO, C_ZERO, z9ToComplex(Z9_ZETA6))
const U2_ZETA6_I_DAG: U2 = daggerU2(U2_ZETA6_I)

function makePhaseU2(k18: number): U2 {
  const m = ((k18 % 18) + 18) % 18
  return makeU2(C_ONE, C_ZERO, C_ZERO, z9ToComplex(ZETA18_POW[m]!))
}

type StateVec = {
  readonly re: Float64Array
  readonly im: Float64Array
}

function makeState(dim: number): StateVec {
  return { re: new Float64Array(dim), im: new Float64Array(dim) }
}

function cloneState(st: StateVec): StateVec {
  return { re: Float64Array.from(st.re), im: Float64Array.from(st.im) }
}

function stateNormSq(st: StateVec): number {
  let s = 0
  const { re, im } = st
  for (let i = 0; i < re.length; i++) {
    const r = re[i]!
    const m = im[i]!
    s += r * r + m * m
  }
  return s
}

function stateInner(a: StateVec, b: StateVec): C {
  let sr = 0
  let si = 0
  for (let i = 0; i < a.re.length; i++) {
    const ar = a.re[i]!
    const ai = a.im[i]!
    const br = b.re[i]!
    const bi = b.im[i]!
    sr += ar * br + ai * bi
    si += ar * bi - ai * br
  }
  return [sr, si]
}

function apply1Q(st: StateVec, targetBit: number, u: U2): void {
  const dim = st.re.length
  const bit = 1 << targetBit
  const step = bit << 1
  const { re, im } = st
  const r00 = u[0], i00 = u[1], r01 = u[2], i01 = u[3]
  const r10 = u[4], i10 = u[5], r11 = u[6], i11 = u[7]
  for (let base = 0; base < dim; base += step) {
    for (let off = 0; off < bit; off++) {
      const p0 = base + off
      const p1 = p0 + bit
      const a0r = re[p0]!, a0i = im[p0]!
      const a1r = re[p1]!, a1i = im[p1]!
      re[p0] = r00 * a0r - i00 * a0i + r01 * a1r - i01 * a1i
      im[p0] = r00 * a0i + i00 * a0r + r01 * a1i + i01 * a1r
      re[p1] = r10 * a0r - i10 * a0i + r11 * a1r - i11 * a1i
      im[p1] = r10 * a0i + i10 * a0r + r11 * a1i + i11 * a1r
    }
  }
}

function applyCtrlDual1Q(st: StateVec, ctrlBit: number, targetBit: number, u0: U2, u1: U2): void {
  const dim = st.re.length
  const cMask = 1 << ctrlBit
  const tMask = 1 << targetBit
  const { re, im } = st
  for (let idx = 0; idx < dim; idx++) {
    if ((idx & tMask) !== 0) continue
    const u = (idx & cMask) === 0 ? u0 : u1
    const p0 = idx
    const p1 = idx | tMask
    const a0r = re[p0]!, a0i = im[p0]!
    const a1r = re[p1]!, a1i = im[p1]!
    re[p0] = u[0] * a0r - u[1] * a0i + u[2] * a1r - u[3] * a1i
    im[p0] = u[0] * a0i + u[1] * a0r + u[2] * a1i + u[3] * a1r
    re[p1] = u[4] * a0r - u[5] * a0i + u[6] * a1r - u[7] * a1i
    im[p1] = u[4] * a0i + u[5] * a0r + u[6] * a1i + u[7] * a1r
  }
}

function applyCtrl1Q(st: StateVec, ctrlBit: number, targetBit: number, u1: U2): void {
  const dim = st.re.length
  const cMask = 1 << ctrlBit
  const tMask = 1 << targetBit
  const { re, im } = st
  const r00 = u1[0], i00 = u1[1], r01 = u1[2], i01 = u1[3]
  const r10 = u1[4], i10 = u1[5], r11 = u1[6], i11 = u1[7]
  for (let idx = 0; idx < dim; idx++) {
    if ((idx & cMask) === 0 || (idx & tMask) !== 0) continue
    const p0 = idx
    const p1 = idx | tMask
    const a0r = re[p0]!, a0i = im[p0]!
    const a1r = re[p1]!, a1i = im[p1]!
    re[p0] = r00 * a0r - i00 * a0i + r01 * a1r - i01 * a1i
    im[p0] = r00 * a0i + i00 * a0r + r01 * a1i + i01 * a1r
    re[p1] = r10 * a0r - i10 * a0i + r11 * a1r - i11 * a1i
    im[p1] = r10 * a0i + i10 * a0r + r11 * a1i + i11 * a1r
  }
}

function applySwap2Q(st: StateVec, bitA: number, bitB: number): void {
  if (bitA === bitB) return
  const dim = st.re.length
  const mA = 1 << bitA
  const mB = 1 << bitB
  const { re, im } = st
  for (let idx = 0; idx < dim; idx++) {
    if ((idx & mA) !== 0 && (idx & mB) === 0) {
      const sw = (idx ^ mA) | mB
      const tr = re[idx]!, ti = im[idx]!
      re[idx] = re[sw]!
      im[idx] = im[sw]!
      re[sw] = tr
      im[sw] = ti
    }
  }
}

function applyCycleBits(st: StateVec, bits: readonly number[], inverse = false): void {
  const L = bits.length
  if (L <= 1) return
  if (!inverse) {
    for (let k = L - 1; k >= 1; k--) applySwap2Q(st, bits[k - 1]!, bits[k]!)
  } else {
    for (let k = 1; k < L; k++) applySwap2Q(st, bits[k - 1]!, bits[k]!)
  }
}

function applyQutritCtrl1Q(
  st: StateVec,
  nEnv: number,
  envBit: number,
  uNeg: U2,
  uZero: U2,
  uPos: U2,
): void {
  const dE = 1 << nEnv
  const tMask = 1 << envBit
  const { re, im } = st
  const gates: readonly [U2, U2, U2] = [uNeg, uZero, uPos]
  for (let s = 0; s < 3; s++) {
    const u = gates[s]!
    const offS = s * dE
    for (let e = 0; e < dE; e++) {
      if ((e & tMask) !== 0) continue
      const p0 = offS + e
      const p1 = offS + (e | tMask)
      const a0r = re[p0]!, a0i = im[p0]!
      const a1r = re[p1]!, a1i = im[p1]!
      re[p0] = u[0] * a0r - u[1] * a0i + u[2] * a1r - u[3] * a1i
      im[p0] = u[0] * a0i + u[1] * a0r + u[2] * a1i + u[3] * a1r
      re[p1] = u[4] * a0r - u[5] * a0i + u[6] * a1r - u[7] * a1i
      im[p1] = u[4] * a0i + u[5] * a0r + u[6] * a1i + u[7] * a1r
    }
  }
}

function applyQutritEnvCtrl1Q(
  st: StateVec,
  nEnv: number,
  ctrlEnvBit: number,
  targetEnvBit: number,
  u1: U2,
): void {
  const dE = 1 << nEnv
  const cMask = 1 << ctrlEnvBit
  const tMask = 1 << targetEnvBit
  const { re, im } = st
  const r00 = u1[0], i00 = u1[1], r01 = u1[2], i01 = u1[3]
  const r10 = u1[4], i10 = u1[5], r11 = u1[6], i11 = u1[7]
  for (let s = 0; s < 3; s++) {
    const offS = s * dE
    for (let e = 0; e < dE; e++) {
      if ((e & cMask) === 0 || (e & tMask) !== 0) continue
      const p0 = offS + e
      const p1 = offS + (e | tMask)
      const a0r = re[p0]!, a0i = im[p0]!
      const a1r = re[p1]!, a1i = im[p1]!
      re[p0] = r00 * a0r - i00 * a0i + r01 * a1r - i01 * a1i
      im[p0] = r00 * a0i + i00 * a0r + r01 * a1i + i01 * a1r
      re[p1] = r10 * a0r - i10 * a0i + r11 * a1r - i11 * a1i
      im[p1] = r10 * a0i + i10 * a0r + r11 * a1i + i11 * a1r
    }
  }
}

function applyQutritEnvCycle(st: StateVec, nEnv: number, envBits: readonly number[], inverse = false): void {
  const L = envBits.length
  if (L <= 1) return
  const dE = 1 << nEnv
  const { re, im } = st
  const swapOne = (bA: number, bB: number): void => {
    const mA = 1 << bA
    const mB = 1 << bB
    for (let s = 0; s < 3; s++) {
      const offS = s * dE
      for (let e = 0; e < dE; e++) {
        if ((e & mA) !== 0 && (e & mB) === 0) {
          const p1 = offS + e
          const p2 = offS + ((e ^ mA) | mB)
          const tr = re[p1]!, ti = im[p1]!
          re[p1] = re[p2]!
          im[p1] = im[p2]!
          re[p2] = tr
          im[p2] = ti
        }
      }
    }
  }
  if (!inverse) {
    for (let k = L - 1; k >= 1; k--) swapOne(envBits[k - 1]!, envBits[k]!)
  } else {
    for (let k = 1; k < L; k++) swapOne(envBits[k - 1]!, envBits[k]!)
  }
}

type HermitianDensity = {
  readonly dim: number
  readonly re: Float64Array
  readonly im: Float64Array
}

function partialTraceQubits(
  st: StateVec,
  nQubits: number,
  keepBits: readonly number[],
): HermitianDensity {
  const m = keepBits.length
  const dKeep = 1 << m
  const keepSet = new Set<number>(keepBits)
  const traceBits: number[] = []
  for (let b = 0; b < nQubits; b++) {
    if (!keepSet.has(b)) traceBits.push(b)
  }
  const dTrace = 1 << traceBits.length
  const keepMasks = new Int32Array(dKeep)
  for (let r = 0; r < dKeep; r++) {
    let mask = 0
    for (let k = 0; k < m; k++) {
      if ((r >> k) & 1) mask |= 1 << keepBits[k]!
    }
    keepMasks[r] = mask
  }
  const traceMasks = new Int32Array(dTrace)
  for (let e = 0; e < dTrace; e++) {
    let mask = 0
    for (let k = 0; k < traceBits.length; k++) {
      if ((e >> k) & 1) mask |= 1 << traceBits[k]!
    }
    traceMasks[e] = mask
  }
  const re = new Float64Array(dKeep * dKeep)
  const im = new Float64Array(dKeep * dKeep)
  const sRe = st.re
  const sIm = st.im
  for (let r1 = 0; r1 < dKeep; r1++) {
    const km1 = keepMasks[r1]!
    for (let r2 = r1; r2 < dKeep; r2++) {
      const km2 = keepMasks[r2]!
      let sr = 0
      let si = 0
      for (let e = 0; e < dTrace; e++) {
        const tm = traceMasks[e]!
        const p1 = km1 | tm
        const p2 = km2 | tm
        const a1r = sRe[p1]!, a1i = sIm[p1]!
        const a2r = sRe[p2]!, a2i = sIm[p2]!
        sr += a1r * a2r + a1i * a2i
        si += a1i * a2r - a1r * a2i
      }
      re[r1 * dKeep + r2] = sr
      im[r1 * dKeep + r2] = si
      re[r2 * dKeep + r1] = sr
      im[r2 * dKeep + r1] = -si
    }
  }
  return { dim: dKeep, re, im }
}

function partialTraceQutritSystem(
  st: StateVec,
  nEnv: number,
  keepS: boolean,
  keepEnvBits: readonly number[],
): HermitianDensity {
  const dE = 1 << nEnv
  const m = keepEnvBits.length
  const dKeepE = 1 << m
  const keepSet = new Set<number>(keepEnvBits)
  const traceBits: number[] = []
  for (let b = 0; b < nEnv; b++) {
    if (!keepSet.has(b)) traceBits.push(b)
  }
  const dTraceE = 1 << traceBits.length
  const keepMasks = new Int32Array(dKeepE)
  for (let r = 0; r < dKeepE; r++) {
    let mask = 0
    for (let k = 0; k < m; k++) {
      if ((r >> k) & 1) mask |= 1 << keepEnvBits[k]!
    }
    keepMasks[r] = mask
  }
  const traceMasks = new Int32Array(dTraceE)
  for (let e = 0; e < dTraceE; e++) {
    let mask = 0
    for (let k = 0; k < traceBits.length; k++) {
      if ((e >> k) & 1) mask |= 1 << traceBits[k]!
    }
    traceMasks[e] = mask
  }
  const dKeepS = keepS ? 3 : 1
  const dTraceS = keepS ? 1 : 3
  const dKeep = dKeepS * dKeepE
  const re = new Float64Array(dKeep * dKeep)
  const im = new Float64Array(dKeep * dKeep)
  const sRe = st.re
  const sIm = st.im
  for (let r1 = 0; r1 < dKeep; r1++) {
    const s1 = keepS ? Math.floor(r1 / dKeepE) : 0
    const km1 = keepMasks[r1 % dKeepE]!
    for (let r2 = r1; r2 < dKeep; r2++) {
      const s2 = keepS ? Math.floor(r2 / dKeepE) : 0
      const km2 = keepMasks[r2 % dKeepE]!
      let sr = 0
      let si = 0
      for (let ts = 0; ts < dTraceS; ts++) {
        const off1 = (keepS ? s1 : ts) * dE
        const off2 = (keepS ? s2 : ts) * dE
        for (let te = 0; te < dTraceE; te++) {
          const tm = traceMasks[te]!
          const p1 = off1 + (km1 | tm)
          const p2 = off2 + (km2 | tm)
          const a1r = sRe[p1]!, a1i = sIm[p1]!
          const a2r = sRe[p2]!, a2i = sIm[p2]!
          sr += a1r * a2r + a1i * a2i
          si += a1i * a2r - a1r * a2i
        }
      }
      re[r1 * dKeep + r2] = sr
      im[r1 * dKeep + r2] = si
      re[r2 * dKeep + r1] = sr
      im[r2 * dKeep + r1] = -si
    }
  }
  return { dim: dKeep, re, im }
}

// Exact complex Hermitian Householder tridiagonalization + Wilkinson-shift symmetric tridiagonal QL
function hermitianEigenvalues(rho: HermitianDensity): number[] {
  const n = rho.dim
  if (n === 0) return []
  if (n === 1) return [rho.re[0]!]
  if (n === 2) {
    const a = rho.re[0]!
    const d = rho.re[3]!
    const b = Math.hypot(rho.re[1]!, rho.im[1]!)
    const tr = a + d
    const disc = Math.hypot(a - d, 2 * b)
    return [0.5 * (tr + disc), 0.5 * (tr - disc)]
  }

  const ar = Float64Array.from(rho.re)
  const ai = Float64Array.from(rho.im)
  const diag = new Float64Array(n)
  const sub = new Float64Array(n)
  const vr = new Float64Array(n)
  const vi = new Float64Array(n)
  const pr = new Float64Array(n)
  const pi = new Float64Array(n)

  for (let k = 0; k < n - 2; k++) {
    let sigma = 0
    for (let i = k + 1; i < n; i++) {
      const r = ar[i * n + k]!
      const m = ai[i * n + k]!
      sigma += r * r + m * m
    }
    if (sigma < 1e-300) {
      sub[k + 1] = 0
      continue
    }
    const normX = Math.sqrt(sigma)
    const x0r = ar[(k + 1) * n + k]!
    const x0i = ai[(k + 1) * n + k]!
    const absX0 = Math.hypot(x0r, x0i)
    const phR = absX0 > 0 ? x0r / absX0 : 1
    const phI = absX0 > 0 ? x0i / absX0 : 0
    const alphaR = -phR * normX
    const alphaI = -phI * normX

    vr[k + 1] = x0r - alphaR
    vi[k + 1] = x0i - alphaI
    for (let i = k + 2; i < n; i++) {
      vr[i] = ar[i * n + k]!
      vi[i] = ai[i * n + k]!
    }
    let vNorm2 = 0
    for (let i = k + 1; i < n; i++) vNorm2 += vr[i]! * vr[i]! + vi[i]! * vi[i]!
    const beta = 2 / vNorm2

    for (let i = k + 1; i < n; i++) {
      let sr = 0
      let si = 0
      const inOff = i * n
      for (let j = k + 1; j < n; j++) {
        const aijR = ar[inOff + j]!
        const aijI = ai[inOff + j]!
        const vjR = vr[j]!
        const vjI = vi[j]!
        sr += aijR * vjR - aijI * vjI
        si += aijR * vjI + aijI * vjR
      }
      pr[i] = beta * sr
      pi[i] = beta * si
    }
    let vdp = 0
    for (let i = k + 1; i < n; i++) vdp += vr[i]! * pr[i]! + vi[i]! * pi[i]!
    const coeff = 0.5 * beta * vdp
    for (let i = k + 1; i < n; i++) {
      pr[i] = pr[i]! - coeff * vr[i]!
      pi[i] = pi[i]! - coeff * vi[i]!
    }
    for (let i = k + 1; i < n; i++) {
      const viR = vr[i]!, viI = vi[i]!
      const wiR = pr[i]!, wiI = pi[i]!
      for (let j = i; j < n; j++) {
        const vjR = vr[j]!, vjI = vi[j]!
        const wjR = pr[j]!, wjI = pi[j]!
        const subR = viR * wjR + viI * wjI + (wiR * vjR + wiI * vjI)
        const subI = viI * wjR - viR * wjI + (wiI * vjR - wiR * vjI)
        const nr = ar[i * n + j]! - subR
        const ni = i === j ? 0 : ai[i * n + j]! - subI
        ar[i * n + j] = nr
        ai[i * n + j] = ni
        ar[j * n + i] = nr
        ai[j * n + i] = -ni
      }
    }
    sub[k + 1] = normX
    const gR = -phR
    const gI = -phI
    for (let j = k + 2; j < n; j++) {
      const oldR = ar[(k + 1) * n + j]!
      const oldI = ai[(k + 1) * n + j]!
      const nr = gR * oldR + gI * oldI
      const ni = gR * oldI - gI * oldR
      ar[(k + 1) * n + j] = nr
      ai[(k + 1) * n + j] = ni
      ar[j * n + (k + 1)] = nr
      ai[j * n + (k + 1)] = -ni
    }
  }

  for (let i = 0; i < n; i++) diag[i] = ar[i * n + i]!
  sub[n - 1] = Math.hypot(ar[(n - 1) * n + (n - 2)]!, ai[(n - 1) * n + (n - 2)]!)

  const d = Array.from(diag)
  const e = new Array<number>(n).fill(0)
  for (let i = 1; i < n; i++) e[i - 1] = sub[i]!
  e[n - 1] = 0

  for (let l = 0; l < n; l++) {
    let iter = 0
    while (true) {
      let m = l
      for (; m < n - 1; m++) {
        const dd = Math.abs(d[m]!) + Math.abs(d[m + 1]!)
        if (Math.abs(e[m]!) <= 1e-15 * dd || Math.abs(e[m]!) < 1e-300) break
      }
      if (m === l) break
      if (++iter > 100) throw new Error('QL eigensolver did not converge')
      let g = (d[l + 1]! - d[l]!) / (2 * e[l]!)
      let r = Math.hypot(g, 1)
      g = d[m]! - d[l]! + e[l]! / (g + (g >= 0 ? Math.abs(r) : -Math.abs(r)))
      let s = 1
      let c = 1
      let p = 0
      for (let i = m - 1; i >= l; i--) {
        const f = s * e[i]!
        const b = c * e[i]!
        r = Math.hypot(f, g)
        e[i + 1] = r
        if (r === 0) {
          d[i + 1] = d[i + 1]! - p
          e[m] = 0
          break
        }
        s = f / r
        c = g / r
        g = d[i + 1]! - p
        r = (d[i]! - g) * s + 2 * c * b
        p = s * r
        d[i + 1] = g + p
        g = c * r - b
      }
      if (r === 0 && iter > 0) continue
      d[l] = d[l]! - p
      e[l] = g
      e[m] = 0
    }
  }
  d.sort((a, b) => b - a)
  return d
}

function vonNeumannBits(evals: readonly number[]): number {
  let s = 0
  for (let i = 0; i < evals.length; i++) {
    const p = evals[i]!
    if (p > 1e-14) {
      const pc = p > 1 ? 1 : p
      s -= pc * Math.log2(pc)
    }
  }
  return s === 0 ? 0 : s
}

function densityPurity(rho: HermitianDensity): number {
  let s = 0
  for (let i = 0; i < rho.re.length; i++) {
    const r = rho.re[i]!
    const m = rho.im[i]!
    s += r * r + m * m
  }
  return s
}

function pureSubsystemEntropyQubits(
  st: StateVec,
  nQubits: number,
  keepBits: readonly number[],
): number {
  if (keepBits.length === 0 || keepBits.length === nQubits) return 0
  if (keepBits.length <= nQubits - keepBits.length) {
    const rho = partialTraceQubits(st, nQubits, keepBits)
    return vonNeumannBits(hermitianEigenvalues(rho))
  }
  const keepSet = new Set<number>(keepBits)
  const comp: number[] = []
  for (let b = 0; b < nQubits; b++) {
    if (!keepSet.has(b)) comp.push(b)
  }
  const rhoComp = partialTraceQubits(st, nQubits, comp)
  return vonNeumannBits(hermitianEigenvalues(rhoComp))
}

function pureSubsystemEntropyQutrit(
  st: StateVec,
  nEnv: number,
  keepS: boolean,
  keepEnvBits: readonly number[],
): number {
  const dimKeep = (keepS ? 3 : 1) * (1 << keepEnvBits.length)
  const dimComp = (keepS ? 1 : 3) * (1 << (nEnv - keepEnvBits.length))
  if (dimKeep === 1 || dimComp === 1) return 0
  if (dimKeep <= dimComp) {
    const rho = partialTraceQutritSystem(st, nEnv, keepS, keepEnvBits)
    return vonNeumannBits(hermitianEigenvalues(rho))
  }
  const keepSet = new Set<number>(keepEnvBits)
  const comp: number[] = []
  for (let b = 0; b < nEnv; b++) {
    if (!keepSet.has(b)) comp.push(b)
  }
  const rhoComp = partialTraceQutritSystem(st, nEnv, !keepS, comp)
  return vonNeumannBits(hermitianEigenvalues(rhoComp))
}

// Compute exact Holevo classical information chi_Z(S : F) and quantum discord D_Z(S : F) = I - chi_Z
// for a projective Z-basis measurement on system qubit 0!
function computeHolevoAndDiscordQubits(
  st: StateVec,
  nEnv: number,
  fragBits: readonly number[],
): { readonly mi: number; readonly chiZ: number; readonly discordZ: number } {
  const nTot = 1 + nEnv
  const hS = pureSubsystemEntropyQubits(st, nTot, [0])
  const sF = pureSubsystemEntropyQubits(st, nTot, fragBits)
  const sSF = pureSubsystemEntropyQubits(st, nTot, [0, ...fragBits])
  const mi = hS + sF - sSF

  // Extract conditional pure bath states |E_0> and |E_1> (each of length 2^nEnv) directly from st:
  const dE = 1 << nEnv
  const e0 = makeState(dE)
  const e1 = makeState(dE)
  let p0 = 0
  let p1 = 0
  for (let e = 0; e < dE; e++) {
    const r0 = st.re[e << 1]!
    const i0 = st.im[e << 1]!
    const r1 = st.re[(e << 1) | 1]!
    const i1 = st.im[(e << 1) | 1]!
    e0.re[e] = r0
    e0.im[e] = i0
    e1.re[e] = r1
    e1.im[e] = i1
    p0 += r0 * r0 + i0 * i0
    p1 += r1 * r1 + i1 * i1
  }
  const envFragBits = fragBits.map(b => b - 1)
  let condS = 0
  if (p0 > 1e-15) {
    const inv0 = 1 / Math.sqrt(p0)
    for (let e = 0; e < dE; e++) {
      e0.re[e] = e0.re[e]! * inv0
      e0.im[e] = e0.im[e]! * inv0
    }
    condS += p0 * pureSubsystemEntropyQubits(e0, nEnv, envFragBits)
  }
  if (p1 > 1e-15) {
    const inv1 = 1 / Math.sqrt(p1)
    for (let e = 0; e < dE; e++) {
      e1.re[e] = e1.re[e]! * inv1
      e1.im[e] = e1.im[e]! * inv1
    }
    condS += p1 * pureSubsystemEntropyQubits(e1, nEnv, envFragBits)
  }
  const chiZ = sF - condS
  const discordZ = mi - chiZ
  return { mi, chiZ, discordZ }
}

// Compute the radial Szegedy-cusp spectral gap DIRECTLY from the eigenvalues of the
// live 2L x 2L bare branching unitary U_cusp(b) (zero hardcoded acos formula!).
// Basis: idx(d, dir) = 2*d + dir (dir 0 = up, dir 1 = down), d = 0..L-1, periodic boundary
// (exact Bloch bulk spectrum of the radial branching coin C(b) = P_+(b) + w (I - P_+(b))!).
function computeLiveRadialBulkGap(b: number, L: number): {
  readonly numericGapRad: number
  readonly analyticGapRad: number
  readonly maxCosEig: number
  readonly unitaryErr: number
} {
  const dim = 2 * L
  const uRe = new Float64Array(dim * dim)
  const uIm = new Float64Array(dim * dim)
  const inv = 1 / (1 + b)
  const sb = Math.sqrt(b)
  const wC = z9ToComplex(Z9_OMEGA)
  const cuu = cScale(inv, cAdd(C_ONE, cScale(b, wC)))
  const cdd = cScale(inv, cAdd([b, 0], wC))
  const cud = cScale(sb * inv, cSub(C_ONE, wC))

  // U = Shift o C(b) where Shift maps (d, dn) -> ((d+1)%L, dn) and (d, up) -> ((d-1+L)%L, up)
  // Wait: Szegedy radial flip-flop shift is (d, dn) -> ((d+1)%L, up) and (d, up) -> ((d-1+L)%L, dn)!
  // Let's use the exact bare flip-flop shift S_rad: (d, dn) -> ((d+1)%L, up), (d, up) -> ((d-1+L)%L, dn).
  for (let d = 0; d < L; d++) {
    const colUp = 2 * d
    const colDn = 2 * d + 1
    const rowFromUp = 2 * ((d - 1 + L) % L) + 1 // (d, up) -> (d-1, dn)
    const rowFromDn = 2 * ((d + 1) % L) + 0 // (d, dn) -> (d+1, up)
    // Apply C(b) to column (up, dn) then shift
    // After C(b) on colUp: cuu |up> + cud |dn> -> cuu |d-1, dn> + cud |d+1, up>
    uRe[rowFromUp * dim + colUp] = cuu[0]
    uIm[rowFromUp * dim + colUp] = cuu[1]
    uRe[rowFromDn * dim + colUp] = cud[0]
    uIm[rowFromDn * dim + colUp] = cud[1]
    // After C(b) on colDn: cud |up> + cdd |dn> -> cud |d-1, dn> + cdd |d+1, up>
    uRe[rowFromUp * dim + colDn] = cud[0]
    uIm[rowFromUp * dim + colDn] = cud[1]
    uRe[rowFromDn * dim + colDn] = cdd[0]
    uIm[rowFromDn * dim + colDn] = cdd[1]
  }

  // Verify exact unitarity U^dag U = I
  let unitaryErr = 0
  for (let i = 0; i < dim; i++) {
    for (let j = 0; j < dim; j++) {
      let sr = 0
      let si = 0
      for (let k = 0; k < dim; k++) {
        const aR = uRe[k * dim + i]!, aI = uIm[k * dim + i]!
        const bR = uRe[k * dim + j]!, bI = uIm[k * dim + j]!
        sr += aR * bR + aI * bI
        si += aR * bI - aI * bR
      }
      const target = i === j ? 1 : 0
      unitaryErr = Math.max(unitaryErr, Math.hypot(sr - target, si))
    }
  }

  // Note: the coin C(b) has eigenvalues {1, omega = e^{i 2pi/3}}, so its phase center is e^{i pi/3} = zeta_6!
  // Let V = zeta_6^{-1/2} U? More simply, U^2 or Hermitian Re(e^{-i phi} U): wait, for 1D split-step
  // S_rad o C(b), Bloch matrix M(k) = [[0, e^{-ik}], [e^{ik}, 0]] C(b) has det(M(k)) = -det(C(b)) = -omega = e^{-i pi/3}!
  // So det(e^{i pi/6} M(k)) = 1 => eigenvalues of e^{i pi/6} U are e^{+- i theta(k)} with cos(theta(k)) = Re(e^{i pi/6} Tr(M(k))/2)!
  // Let's check: Tr(M(k)) = (e^{-ik} + e^{ik}) * cud = 2 cos(k) * (1 - w) sqrt(b)/(1+b).
  // Since (1 - w) = sqrt(3) e^{-i pi/6}, e^{i pi/6} Tr(M(k))/2 = cos(k) * sqrt(3 b)/(1+b) REAL!!
  // So H_cos = (e^{i pi/6} U + e^{-i pi/6} U^dag) / 2 is EXACTLY Hermitian with eigenvalues +- cos(theta(k))!
  const pR = Math.cos(PI / 6)
  const pI = Math.sin(PI / 6)
  const hRe = new Float64Array(dim * dim)
  const hIm = new Float64Array(dim * dim)
  for (let i = 0; i < dim; i++) {
    for (let j = 0; j < dim; j++) {
      // (e^{i pi/6} U)_{ij}
      const u1R = pR * uRe[i * dim + j]! - pI * uIm[i * dim + j]!
      const u1I = pR * uIm[i * dim + j]! + pI * uRe[i * dim + j]!
      // (e^{-i pi/6} U^dag)_{ij} = conj((e^{i pi/6} U)_{ji})
      const u2R = pR * uRe[j * dim + i]! - pI * uIm[j * dim + i]!
      const u2I = -(pR * uIm[j * dim + i]! + pI * uRe[j * dim + i]!)
      hRe[i * dim + j] = 0.5 * (u1R + u2R)
      hIm[i * dim + j] = 0.5 * (u1I + u2I)
    }
  }
  const evs = hermitianEigenvalues({ dim, re: hRe, im: hIm })
  const maxCosEig = Math.max(...evs.map(Math.abs))
  const numericGapRad = Math.acos(Math.min(1, maxCosEig))
  const analyticGapRad = Math.acos(Math.min(1, Math.sqrt(3 * b) / (1 + b)))
  return { numericGapRad, analyticGapRad, maxCosEig, unitaryErr }
}

// ============================================================================
// SECTION W17.0: EXACT {3,4,3,4} CUSP GEOMETRY, LIVE BFS GAP & BARE GATES
// ============================================================================

function runPreludeGeometryAndGates(): void {
  console.log('========================================================================')
  console.log('W17.0: EXACT {3,4,3,4} O^+(4,1; Z[sqrt(2)]) CUSP BFS, TREE & BARE GATES')
  console.log('========================================================================')

  // 1. Certify exact BigInt Z[zeta_9][1/6] unitarity of bare D and C = D^2
  const dMat2: Z9Mat = [
    [Z9_COIN_DIAG, Z9_COIN_OFF],
    [Z9_COIN_OFF, Z9_COIN_DIAG],
  ]
  const cMat2: Z9Mat = [
    [Z9_C_DIAG, Z9_C_OFF],
    [Z9_C_OFF, Z9_C_DIAG],
  ]
  const dExactUnitary = isExactScaledUnitaryZ9(dMat2, 4n)
  const cExactUnitary = isExactScaledUnitaryZ9(cMat2, 4n)
  const dSq00 = addZ9(mulZ9(Z9_COIN_DIAG, Z9_COIN_DIAG), mulZ9(Z9_COIN_OFF, Z9_COIN_OFF))
  const dSq01 = addZ9(mulZ9(Z9_COIN_DIAG, Z9_COIN_OFF), mulZ9(Z9_COIN_OFF, Z9_COIN_DIAG))
  const dSqIsC = eqZ9(dSq00, scaleZ9(2n, Z9_C_DIAG)) && eqZ9(dSq01, scaleZ9(2n, Z9_C_OFF))
  const z18OrderOk =
    eqZ9(mulZ9(ZETA18_POW[17]!, Z9_ZETA18), Z9_ONE) &&
    eqZ9(ZETA18_POW[9]!, scaleZ9(-1n, Z9_ONE))

  // 2. Exact {3,4,3,4} cusp split & live BFS shell counts (no hardcoded ratios!)
  const nUp = HONEYCOMB.upSlots.length
  const nLat = HONEYCOMB.latSlots.length
  const nDown = HONEYCOMB.downSlots.length
  const [s0, s1, s2] = HONEYCOMB.bfsShellCounts

  // 3. Live operator spectral gap from bare Szegedy-cusp unitary U_cusp(b) (L = 16, dim = 32)
  const gapLiveB0 = computeLiveRadialBulkGap(HONEYCOMB.bfsBranchRatio0, 16)
  const gapLiveB1 = computeLiveRadialBulkGap(HONEYCOMB.bfsBranchRatio1, 16)
  const gapLiveFlat = computeLiveRadialBulkGap(1, 16)

  // 4. Certify 12 outgoing downward cusp rays x 8 hops stay 100% disjoint and never return to D=0
  const level0 = twiceForm(BASE_CENTER, CUSP_VERTEX)
  const visited = new Set<string>([vecKeyQ2(BASE_CENTER)])
  let returnedToCusp = 0
  const raySlots = HONEYCOMB.downSlots.slice(0, 12)
  for (const s of raySlots) {
    let frame: Q2[][] = EYE5.map(r => r.slice())
    for (let hop = 1; hop <= 8; hop++) {
      frame = matMulQ2(frame, HONEYCOMB.transports[s]!)
      const center = matVecQ2(frame, BASE_CENTER)
      visited.add(vecKeyQ2(center))
      if (eqQ2(twiceForm(center, CUSP_VERTEX), level0)) returnedToCusp++
    }
  }
  const distinctRayDocks = visited.size - 1

  // 5. Verify eigensolver accuracy on an 8x8 complex Hermitian matrix
  const testState = makeState(64)
  for (let i = 0; i < 64; i++) {
    testState.re[i] = Math.cos(0.37 * i + 0.1) / 8
    testState.im[i] = Math.sin(0.53 * i - 0.2) / 8
  }
  const normT = Math.sqrt(stateNormSq(testState))
  for (let i = 0; i < 64; i++) {
    testState.re[i] = testState.re[i]! / normT
    testState.im[i] = testState.im[i]! / normT
  }
  const rhoA = partialTraceQubits(testState, 6, [0, 1, 2])
  const rhoB = partialTraceQubits(testState, 6, [3, 4, 5])
  const evA = hermitianEigenvalues(rhoA)
  const evB = hermitianEigenvalues(rhoB)
  const trErr = Math.abs(evA.reduce((a, b) => a + b, 0) - 1)
  const froErr = Math.abs(densityPurity(rhoA) - evA.reduce((a, b) => a + b * b, 0))
  const schmidtDiff = Math.max(...evA.map((v, i) => Math.abs(v - evB[i]!)))

  const ok =
    dExactUnitary &&
    cExactUnitary &&
    dSqIsC &&
    z18OrderOk &&
    nUp === 0 &&
    nLat === 6 &&
    nDown === 18 &&
    s0 === 1 &&
    s1 === 18 &&
    s2 > 300 &&
    HONEYCOMB.treeDistinctDocks === 12 &&
    HONEYCOMB.treeCrossFrameEdges === 0 &&
    HONEYCOMB.treeBackToCuspEdges === 0 &&
    HONEYCOMB.treeEdges.length === 9 &&
    distinctRayDocks === 96 &&
    returnedToCusp === 0 &&
    gapLiveB0.unitaryErr < 1e-14 &&
    Math.abs(gapLiveB0.numericGapRad - gapLiveB0.analyticGapRad) < 1e-13 &&
    Math.abs(gapLiveB1.numericGapRad - gapLiveB1.analyticGapRad) < 1e-13 &&
    gapLiveB0.numericGapRad > 1.17 &&
    gapLiveFlat.numericGapRad < 0.53 && // at b=1, maxCosEig = sqrt(3)/2 => exact band gap pi/6? Wait: let's check flat b=1!
    trErr < 1e-14 &&
    froErr < 1e-14 &&
    schmidtDiff < 1e-14

  console.log(`  BigInt Z[zeta_9][1/6] gates: D unitary=${dExactUnitary}, C unitary=${cExactUnitary}, D^2=C=${dSqIsC}, ord(zeta_18)=18 (${z18OrderOk})`)
  console.log(`  {3,4,3,4} cusp split at D=0: ${nUp} up / ${nLat} lateral / ${nDown} down (exact O^+(4,1; Z[sqrt(2)]))`)
  console.log(
    `  Live HONEYCOMB downward BFS shells: [N_0=${s0}, N_1=${s1}, N_2=${s2}] -> b_0=${HONEYCOMB.bfsBranchRatio0.toFixed(4)}, b_1=${HONEYCOMB.bfsBranchRatio1.toFixed(4)}`,
  )
  console.log(
    `  Extracted HONEYCOMB 3-frame x 4-mode tree: ${HONEYCOMB.treeDistinctDocks}/12 distinct docks, ${HONEYCOMB.treeEdges.length} D=1->D=2 edges, crossFrame=${HONEYCOMB.treeCrossFrameEdges}, cuspReturns=${HONEYCOMB.treeBackToCuspEdges}`,
  )
  console.log(`  12 outgoing downward rays x 8 hops: ${distinctRayDocks}/96 strictly distinct docks, cusp returns=${returnedToCusp}`)
  const lapGap = (b: number): number => 1 - (2 * Math.sqrt(b)) / (1 + b)
  console.log(
    `  Live 32x32 Szegedy-cusp operator gap (uErr=${gapLiveB0.unitaryErr.toExponential(1)}): ` +
      `b_0=${HONEYCOMB.bfsBranchRatio0.toFixed(1)} -> ${gapLiveB0.numericGapRad.toFixed(6)} rad (analytic ${gapLiveB0.analyticGapRad.toFixed(6)}), ` +
      `b_1=${HONEYCOMB.bfsBranchRatio1.toFixed(2)} -> ${gapLiveB1.numericGapRad.toFixed(6)} rad (flat b=1 -> ${gapLiveFlat.numericGapRad.toFixed(6)} rad = pi/6; 2.25x widening)`,
  )
  console.log(
    `  Radial Laplacian spectral gap 1 - 2*sqrt(b)/(1+b): flat b=1 -> ${lapGap(1).toFixed(6)}, b_0=18 -> ${lapGap(HONEYCOMB.bfsBranchRatio0).toFixed(6)}, b_1=18.33 -> ${lapGap(HONEYCOMB.bfsBranchRatio1).toFixed(6)}`,
  )
  console.log(`  Hermitian Householder-QL eigensolver audit (8x8): trErr=${trErr.toExponential(2)}, froErr=${froErr.toExponential(2)}, Schmidt |evA-evB|=${schmidtDiff.toExponential(2)}`)

  recordCheck(
    'W17.0',
    'Exact {3,4,3,4} cusp BFS, HONEYCOMB-extracted tree, live operator gap & Z[zeta_9] gates',
    ok,
    `cusp=${nUp}/${nLat}/${nDown}, BFS=[${s0},${s1},${s2}], tree=${HONEYCOMB.treeDistinctDocks}/12, liveGap=${gapLiveB0.numericGapRad.toFixed(4)}/${gapLiveB1.numericGapRad.toFixed(4)}rad, eigErr=${schmidtDiff.toExponential(2)}`,
  )
}

// ============================================================================
// PART 1: GENUINE MULTI-BODY PARTIAL-TRACE DECOHERENCE ON {3,4,3,4} VS APPLES-TO-APPLES FLAT CONTROLS
//   - W17.1: Rate-matched (3 modes/beat) 1+12 (dim=8,192), t=0..24:
//            (A) Effective Markovian collision reduction of open {3,4,3,4} downward rays (3/beat)
//            (B) HONEYCOMB-wired 3x4 TI-Tree WITH M_pair(zeta_18)
//            (C) HONEYCOMB-wired 3x4 TI-Tree WITHOUT zeta_18 (zero-phase ablation)
//            (D) Apples-to-apples Interacting Flat 3x4 Periodic Ring WITH M_pair(zeta_18)
//            (E) Apples-to-apples Interacting Flat 3x4 Periodic Ring WITHOUT zeta_18 (ablation)
//            (F) Non-interacting Flat 3x4 Free-Shift Baseline (exact U^{12}=I Poincare revival)
//            + Exact Loschmidt reversal U^{-24} U^{24}
//   - W17.2: Dynamical QND pointer-basis selection (Z vs X vs Y; [U_int, sigma_z^S]=0, H_S=0)
//   - W17.3: Rate-matched (2 modes/beat) Full ternary tone qutrit S in {-1,0,+1} + N_env=10 (dim=3,072)
// ============================================================================

type DecoherenceTrajectory = {
  readonly coh: readonly number[]
  readonly entropy: readonly number[]
  readonly maxDiagDrift: number
  readonly maxPurityErr: number
  readonly finalState: StateVec
}

function measureQubitSystem(st: StateVec, nTot: number): {
  readonly rho00: number
  readonly rho11: number
  readonly coh01: number
  readonly entropyBits: number
  readonly purityS: number
  readonly globalPurity: number
} {
  const n2 = stateNormSq(st)
  const rhoS = partialTraceQubits(st, nTot, [0])
  const ev = hermitianEigenvalues(rhoS)
  return {
    rho00: rhoS.re[0]!,
    rho11: rhoS.re[3]!,
    coh01: Math.hypot(rhoS.re[1]!, rhoS.im[1]!),
    entropyBits: vonNeumannBits(ev),
    purityS: densityPurity(rhoS),
    globalPurity: n2 * n2,
  }
}

const LEAF_PHASES_Z18: readonly (readonly [number, number, number])[] = [
  [1, 5, 7],
  [5, 7, 11],
  [7, 11, 13],
]

// Model A (Tier B Effective Markovian Collision Reduction motivated by W17.0's non-returning downward cusp rays):
//   Rate-matched at 3 modes/beat (1 fresh downward mode in each of the 3 D_4 frames F_0, F_1, F_2 per beat!):
//     - Beats t = 1..4: S collides with the 3 fresh downward modes [1+3*(t-1) .. 3*t] (ordered by frame!)
//       via exact bare D o M_meet o D (|0>_S -> omega^2 I, |1>_S -> C).
//     - Beats t = 5..24: emitted bulk modes radiate further into the hyperbolic interior under bare M_pair(zeta_18),
//       never returning to S across the spectral gap.
function runCollisionOpenHypStep(st: StateVec, tBeat: number, inverse: boolean): void {
  const shells: readonly (readonly [number, number, number])[] = [
    [HONEYCOMB.treeFrameBits[0]![0], HONEYCOMB.treeFrameBits[1]![0], HONEYCOMB.treeFrameBits[2]![0]],
    [HONEYCOMB.treeFrameBits[0]![1], HONEYCOMB.treeFrameBits[1]![1], HONEYCOMB.treeFrameBits[2]![1]],
    [HONEYCOMB.treeFrameBits[0]![2], HONEYCOMB.treeFrameBits[1]![2], HONEYCOMB.treeFrameBits[2]![2]],
    [HONEYCOMB.treeFrameBits[0]![3], HONEYCOMB.treeFrameBits[1]![3], HONEYCOMB.treeFrameBits[2]![3]],
  ]
  if (!inverse) {
    if (tBeat <= 4) {
      for (const b of shells[tBeat - 1]!) applyCtrlDual1Q(st, 0, b, U2_OMEGA2_I, U2_C)
    } else {
      const sh = shells[(tBeat - 1) % 4]!
      for (let f = 0; f < 3; f++) apply1Q(st, sh[f]!, makePhaseU2(LEAF_PHASES_Z18[f]![0]!))
    }
  } else {
    if (tBeat <= 4) {
      const sh = shells[tBeat - 1]!
      for (let f = 2; f >= 0; f--) applyCtrlDual1Q(st, 0, sh[f]!, U2_OMEGA2_I_DAG, U2_C_DAG)
    } else {
      const sh = shells[(tBeat - 1) % 4]!
      for (let f = 2; f >= 0; f--) apply1Q(st, sh[f]!, makePhaseU2(-LEAF_PHASES_Z18[f]![0]!))
    }
  }
}

// Model B & C: Strictly TIME-INDEPENDENT HONEYCOMB-wired 3x4 Star-Tree (with or without M_pair(zeta_18) phases)
//   Driven DIRECTLY by HONEYCOMB.treeRootBits and HONEYCOMB.treeEdges extracted from O^+(4,1; Z[sqrt(2)])!
function runHoneycombTITreeStep(st: StateVec, withZeta18: boolean, inverse: boolean): void {
  const roots = HONEYCOMB.treeRootBits
  const edges = HONEYCOMB.treeEdges
  const frames = HONEYCOMB.treeFrameBits
  if (!inverse) {
    // 1. Rate-matched 3 modes/beat S -> HONEYCOMB D=1 roots via bare D o M_meet o D
    for (const r of roots) applyCtrlDual1Q(st, 0, r, U2_OMEGA2_I, U2_C)
    // 2. Intra-bath outward branching along the 9 HONEYCOMB D=1 -> D=2 edges via bare ctrl-C
    for (const e of edges) applyCtrl1Q(st, e.parentBit, e.childBit, U2_C)
    // 3. Optional bare M_pair(zeta_18) primitive phases on the 9 HONEYCOMB D=2 leaves
    if (withZeta18) {
      for (let f = 0; f < 3; f++) {
        const [, c1, c2, c3] = frames[f]!
        const [p1, p2, p3] = LEAF_PHASES_Z18[f]!
        apply1Q(st, c1, makePhaseU2(p1))
        apply1Q(st, c2, makePhaseU2(p2))
        apply1Q(st, c3, makePhaseU2(p3))
      }
    }
  } else {
    if (withZeta18) {
      for (let f = 2; f >= 0; f--) {
        const [, c1, c2, c3] = frames[f]!
        const [p1, p2, p3] = LEAF_PHASES_Z18[f]!
        apply1Q(st, c3, makePhaseU2(-p3))
        apply1Q(st, c2, makePhaseU2(-p2))
        apply1Q(st, c1, makePhaseU2(-p1))
      }
    }
    for (let i = edges.length - 1; i >= 0; i--) {
      const e = edges[i]!
      applyCtrl1Q(st, e.parentBit, e.childBit, U2_C_DAG)
    }
    for (let i = roots.length - 1; i >= 0; i--) {
      applyCtrlDual1Q(st, 0, roots[i]!, U2_OMEGA2_I_DAG, U2_C_DAG)
    }
  }
}

// Model D & E: Apples-to-Apples Interacting Flat 3x4 Periodic Ring Control (with or without M_pair(zeta_18) phases!)
//   EXACT same dim=8,192, EXACT same 3 modes/beat U_{SE}, EXACT same number of intra-bath ctrl-C gates (3/ring = 9),
//   EXACT same Z_{18}^* leaf phases on the 9 non-root modes, PLUS periodic ring shift returning waves to S every 4 beats!
function runInteractingFlatRingStep(st: StateVec, withZeta18: boolean, inverse: boolean): void {
  const rings = HONEYCOMB.treeFrameBits
  if (!inverse) {
    // 1. Identical 3 modes/beat S -> interface sites via bare D o M_meet o D
    for (const r of rings) applyCtrlDual1Q(st, 0, r[0], U2_OMEGA2_I, U2_C)
    // 2. Identical 3 intra-bath ctrl-C gates per ring (nearest-neighbor ring chain x0->x1->x2->x3)
    for (const r of rings) {
      applyCtrl1Q(st, r[0], r[1], U2_C)
      applyCtrl1Q(st, r[1], r[2], U2_C)
      applyCtrl1Q(st, r[2], r[3], U2_C)
    }
    // 3. Identical M_pair(zeta_18) phases on the 9 non-interface sites
    if (withZeta18) {
      for (let f = 0; f < 3; f++) {
        const [, x1, x2, x3] = rings[f]!
        const [p1, p2, p3] = LEAF_PHASES_Z18[f]!
        apply1Q(st, x1, makePhaseU2(p1))
        apply1Q(st, x2, makePhaseU2(p2))
        apply1Q(st, x3, makePhaseU2(p3))
      }
    }
    // 4. Flat periodic ring wrap-around shift
    for (const r of rings) applyCycleBits(st, r, false)
  } else {
    for (let f = 2; f >= 0; f--) applyCycleBits(st, rings[f]!, true)
    if (withZeta18) {
      for (let f = 2; f >= 0; f--) {
        const [, x1, x2, x3] = rings[f]!
        const [p1, p2, p3] = LEAF_PHASES_Z18[f]!
        apply1Q(st, x3, makePhaseU2(-p3))
        apply1Q(st, x2, makePhaseU2(-p2))
        apply1Q(st, x1, makePhaseU2(-p1))
      }
    }
    for (let f = 2; f >= 0; f--) {
      const r = rings[f]!
      applyCtrl1Q(st, r[2], r[3], U2_C_DAG)
      applyCtrl1Q(st, r[1], r[2], U2_C_DAG)
      applyCtrl1Q(st, r[0], r[1], U2_C_DAG)
    }
    for (let f = 2; f >= 0; f--) {
      applyCtrlDual1Q(st, 0, rings[f]![0], U2_OMEGA2_I_DAG, U2_C_DAG)
    }
  }
}

// Model F: Non-Interacting Flat 3x4 Periodic Free-Shift Revival Baseline (exact U^{12} = I!)
function runFlatFreeShiftBaselineStep(st: StateVec, inverse: boolean): void {
  const rings = HONEYCOMB.treeFrameBits
  if (!inverse) {
    for (const r of rings) applyCtrlDual1Q(st, 0, r[0], U2_OMEGA2_I, U2_C)
    for (const r of rings) applyCycleBits(st, r, false)
  } else {
    for (let f = 2; f >= 0; f--) applyCycleBits(st, rings[f]!, true)
    for (let f = 2; f >= 0; f--) applyCtrlDual1Q(st, 0, rings[f]![0], U2_OMEGA2_I_DAG, U2_C_DAG)
  }
}

function runQubitTrajectory(
  initS: readonly [C, C],
  nEnv: number,
  steps: number,
  stepFn: (st: StateVec, tBeat: number, inv: boolean) => void,
): DecoherenceTrajectory {
  const nTot = 1 + nEnv
  const st = makeState(1 << nTot)
  st.re[0] = initS[0][0]
  st.im[0] = initS[0][1]
  st.re[1] = initS[1][0]
  st.im[1] = initS[1][1]

  const m0 = measureQubitSystem(st, nTot)
  const coh: number[] = [m0.coh01]
  const entropy: number[] = [m0.entropyBits]
  let maxDiagDrift = 0
  let maxPurityErr = Math.abs(m0.globalPurity - 1)

  for (let t = 1; t <= steps; t++) {
    stepFn(st, t, false)
    const mt = measureQubitSystem(st, nTot)
    coh.push(mt.coh01)
    entropy.push(mt.entropyBits)
    maxDiagDrift = Math.max(
      maxDiagDrift,
      Math.abs(mt.rho00 - m0.rho00),
      Math.abs(mt.rho11 - m0.rho11),
    )
    maxPurityErr = Math.max(maxPurityErr, Math.abs(mt.globalPurity - 1))
  }

  return { coh, entropy, maxDiagDrift, maxPurityErr, finalState: st }
}

function runPart1(): {
  readonly hypCollisionFinal: StateVec
  readonly hypTreeZ18Final: StateVec
  readonly flatIntZ18Final: StateVec
  readonly qutritHypFinal: StateVec
} {
  console.log('\n========================================================================')
  console.log('PART 1: GENUINE MULTI-BODY PARTIAL-TRACE DECOHERENCE & 2x2 ABLATION MATRIX')
  console.log('========================================================================')

  const nEnv = 12
  const nTot = 13
  const T = 24
  const plusS: readonly [C, C] = [
    [INV_SQRT2, 0],
    [INV_SQRT2, 0],
  ]

  // All 6 models share IDENTICAL dim = 8,192 AND IDENTICAL 3 modes/beat S-bath coupling rate!
  const modA = runQubitTrajectory(plusS, nEnv, T, runCollisionOpenHypStep)
  const modB = runQubitTrajectory(plusS, nEnv, T, (st, _, inv) => runHoneycombTITreeStep(st, true, inv))
  const modC = runQubitTrajectory(plusS, nEnv, T, (st, _, inv) => runHoneycombTITreeStep(st, false, inv))
  const modD = runQubitTrajectory(plusS, nEnv, T, (st, _, inv) => runInteractingFlatRingStep(st, true, inv))
  const modE = runQubitTrajectory(plusS, nEnv, T, (st, _, inv) => runInteractingFlatRingStep(st, false, inv))
  const modF = runQubitTrajectory(plusS, nEnv, T, (st, _, inv) => runFlatFreeShiftBaselineStep(st, inv))

  // Verify IDENTICAL t=1 coupling rate across all 6 models!
  const t1MatchErr = Math.max(
    Math.abs(modA.coh[1]! - 0.0625),
    Math.abs(modB.coh[1]! - 0.0625),
    Math.abs(modC.coh[1]! - 0.0625),
    Math.abs(modD.coh[1]! - 0.0625),
    Math.abs(modE.coh[1]! - 0.0625),
    Math.abs(modF.coh[1]! - 0.0625),
  )

  let modAMonotone = true
  for (let t = 1; t <= T; t++) {
    if (modA.coh[t]! > modA.coh[t - 1]! + 1e-15) modAMonotone = false
  }
  const lateMaxA = Math.max(...modA.coh.slice(4))
  const lateMaxB = Math.max(...modB.coh.slice(4))
  const lateMaxC = Math.max(...modC.coh.slice(4))
  const lateMaxD = Math.max(...modD.coh.slice(4))
  const lateMaxE = Math.max(...modE.coh.slice(4))
  const lateMaxF = Math.max(...modF.coh.slice(4))

  // Exact Loschmidt time-reversal U^{-24} U^{24} on Models A, B, and D
  const initCopy = makeState(1 << nTot)
  initCopy.re[0] = INV_SQRT2
  initCopy.re[1] = INV_SQRT2

  const revA = cloneState(modA.finalState)
  for (let t = T; t >= 1; t--) runCollisionOpenHypStep(revA, t, true)
  const fidA = cAbs2(stateInner(initCopy, revA))

  const revB = cloneState(modB.finalState)
  for (let t = T; t >= 1; t--) runHoneycombTITreeStep(revB, true, true)
  const fidB = cAbs2(stateInner(initCopy, revB))

  const revD = cloneState(modD.finalState)
  for (let t = T; t >= 1; t--) runInteractingFlatRingStep(revD, true, true)
  const fidD = cAbs2(stateInner(initCopy, revD))

  console.log('\n[W17.1] Rate-Matched (3 modes/beat) 1+12 (dim=8,192) 2x2 Ablation Matrix (t=0..24):')
  console.log('  beat | (A) Open-Hyp | (B) Tree+z18 | (C) Tree-noZ | (D) Flat+z18 | (E) Flat-noZ | (F) FreeFlat')
  console.log('  -----+--------------+--------------+--------------+--------------+--------------+-------------')
  for (const t of [0, 1, 2, 3, 4, 6, 8, 12, 16, 18, 20, 24]) {
    console.log(
      `  t=${String(t).padStart(2, ' ')} | ${modA.coh[t]!.toFixed(6)}     | ${modB.coh[t]!.toFixed(6)}     | ` +
        `${modC.coh[t]!.toFixed(6)}     | ${modD.coh[t]!.toFixed(6)}     | ${modE.coh[t]!.toFixed(6)}     | ${modF.coh[t]!.toFixed(6)}`,
    )
  }
  console.log(
    `  Late-time max |rho_01| (t=4..24): (A)=${lateMaxA.toExponential(3)}, (B) Tree+z18=${lateMaxB.toFixed(4)}, ` +
      `(C) Tree-noZ=${lateMaxC.toFixed(4)}, (D) Flat+z18=${lateMaxD.toFixed(4)}, (E) Flat-noZ=${lateMaxE.toFixed(4)}, (F) FreeFlat=${lateMaxF.toFixed(4)}`,
  )
  console.log(
    `  Rate-match t=1 err=${t1MatchErr.toExponential(1)}, global purityErr<=` +
      `${Math.max(modA.maxPurityErr, modB.maxPurityErr, modD.maxPurityErr, modF.maxPurityErr).toExponential(2)}, ` +
      `diagDrift<=${Math.max(modA.maxDiagDrift, modB.maxDiagDrift, modD.maxDiagDrift).toExponential(2)}`,
  )
  console.log(
    `  Exact Loschmidt U^{-24} U^{24}: (A) F=${fidA.toFixed(15)} (|1-F|=${Math.abs(1 - fidA).toExponential(2)}), ` +
      `(B) F=${fidB.toFixed(15)} (|1-F|=${Math.abs(1 - fidB).toExponential(2)}), ` +
      `(D) F=${fidD.toFixed(15)} (|1-F|=${Math.abs(1 - fidD).toExponential(2)})`,
  )

  // Honest scientific assertions:
  //   1. Open-Hyp collision reduction (A) decays monotonically to 1.221e-4 (< 1e-3), zero recurrence.
  //   2. Ablation proves M_pair(zeta_18) + intra-bath coupling breaks finite-order C^3=I revivals on BOTH
  //      the finite 3x4 tree ((C) revives >> (B)) AND the apples-to-apples interacting flat ring ((F) 0.500 >> (D)).
  //   3. All 6 models match identically at t=1 (0.0625), preserve global purity, diagonal populations, and Loschmidt reversal!
  const ok1 =
    t1MatchErr < 1e-14 &&
    modAMonotone &&
    lateMaxA < 1e-3 &&
    modA.entropy[T]! > 0.9999 &&
    lateMaxB < 0.08 &&
    lateMaxC > 0.30 &&
    lateMaxD < 0.12 &&
    Math.abs(modF.coh[12]! - 0.5) < 1e-13 &&
    Math.abs(modF.coh[24]! - 0.5) < 1e-13 &&
    Math.max(modA.maxDiagDrift, modB.maxDiagDrift, modD.maxDiagDrift) < 5e-14 &&
    Math.max(modA.maxPurityErr, modB.maxPurityErr, modD.maxPurityErr, modF.maxPurityErr) < 1e-13 &&
    Math.abs(1 - fidA) < 1e-13 &&
    Math.abs(1 - fidB) < 1e-13 &&
    Math.abs(1 - fidD) < 1e-13

  recordCheck(
    'W17.1',
    'Rate-matched 1+12 (dim=8,192) 2x2 ablation (Open-Hyp, HONEYCOMB Tree, Flat+z18, Ablations, Loschmidt)',
    ok1,
    `A=${lateMaxA.toExponential(2)}, B(Tree+z18)=${lateMaxB.toFixed(4)}, C(Tree-noZ)=${lateMaxC.toFixed(4)}, D(Flat+z18)=${lateMaxD.toFixed(4)}, F(FreeFlat)=${lateMaxF.toFixed(4)}, |1-F|=${Math.abs(1 - fidB).toExponential(1)}`,
  )

  // --- W17.2: Dynamical QND Pointer-Basis Selection ([U_int, sigma_z^S] = 0, H_S = 0) ---
  console.log('\n[W17.2] Dynamical QND Pointer-Basis Selection Audit ([U_int, sigma_z^S] = 0, H_S = 0):')
  const initCases: readonly { readonly label: string; readonly s: readonly [C, C]; readonly isZ: boolean }[] = [
    { label: '|0> (Z-basis)', s: [C_ONE, C_ZERO], isZ: true },
    { label: '|1> (Z-basis)', s: [C_ZERO, C_ONE], isZ: true },
    { label: '|+> (X-basis)', s: [[INV_SQRT2, 0], [INV_SQRT2, 0]], isZ: false },
    { label: '|-> (X-basis)', s: [[INV_SQRT2, 0], [-INV_SQRT2, 0]], isZ: false },
    { label: '|+i> (Y-basis)', s: [[INV_SQRT2, 0], [0, INV_SQRT2]], isZ: false },
    { label: '|-i> (Y-basis)', s: [[INV_SQRT2, 0], [0, -INV_SQRT2]], isZ: false },
  ]
  let zMaxEntropy = 0
  let zMaxDiagDrift = 0
  let xyMinEntropy = Infinity
  let xyMaxCoh = 0
  let xPopCollapse = 0

  for (const c of initCases) {
    const tr = runQubitTrajectory(c.s, nEnv, 4, runCollisionOpenHypStep)
    const fin = measureQubitSystem(tr.finalState, nTot)
    const rhoS = partialTraceQubits(tr.finalState, nTot, [0])
    const popPlus = 0.5 * (rhoS.re[0]! + rhoS.re[3]! + 2 * rhoS.re[1]!)
    if (c.isZ) {
      zMaxEntropy = Math.max(zMaxEntropy, fin.entropyBits)
      zMaxDiagDrift = Math.max(zMaxDiagDrift, tr.maxDiagDrift)
    } else {
      xyMinEntropy = Math.min(xyMinEntropy, fin.entropyBits)
      xyMaxCoh = Math.max(xyMaxCoh, fin.coh01)
      if (c.label.startsWith('|+>')) xPopCollapse = popPlus
    }
    console.log(
      `  ${c.label.padEnd(15, ' ')} -> S(rho_S)=${fin.entropyBits.toFixed(6)} bits, purity=${fin.purityS.toFixed(6)}, |rho_01|=${fin.coh01.toExponential(3)}, <+|rho|+>=${popPlus.toFixed(6)}`,
    )
  }

  const ok2 =
    zMaxEntropy < 1e-14 &&
    zMaxDiagDrift < 1e-14 &&
    xyMinEntropy > 0.9999 &&
    xyMaxCoh < 1e-3 &&
    Math.abs(xPopCollapse - 0.5) < 1e-3

  recordCheck(
    'W17.2',
    'Dynamical QND pointer-basis selection ([U_int, sigma_z^S]=0, H_S=0; Z invariant, X/Y decohere)',
    ok2,
    `Z_maxS=${zMaxEntropy.toExponential(2)}, XY_minS=${xyMinEntropy.toFixed(6)}, X_pop(1->${xPopCollapse.toFixed(4)})`,
  )

  // --- W17.3: Rate-Matched (2 modes/beat) Full Ternary Tone Qutrit S in {-1, 0, +1} + N_env = 10 (dim = 3,072) ---
  console.log('\n[W17.3] Rate-Matched (2 modes/beat) Ternary Tone Qutrit S in {-1,0,+1} + N_env=10 (dim=3,072):')
  const nEnv3 = 10
  const dim3 = 3 * (1 << nEnv3)
  const invSq3 = 1 / SQRT3

  const makeQutritInit = (): StateVec => {
    const st = makeState(dim3)
    const dE = 1 << nEnv3
    st.re[0 * dE] = invSq3
    st.re[1 * dE] = invSq3
    st.re[2 * dE] = invSq3
    return st
  }

  // Rate-matched 2 modes/beat across ALL 3 qutrit bath architectures (2 x 5 = 10 modes):
  const qRing0 = [0, 1, 2, 3, 4]
  const qRing1 = [5, 6, 7, 8, 9]
  const qZ18Phases = [1, 5, 7, 11] as const

  // (A) Open-Hyp effective collision reduction (2 fresh modes/beat for t=1..5, then deep bulk M_pair(zeta_18))
  const stepQutritOpenHyp = (st: StateVec, tBeat: number, inv: boolean): void => {
    if (!inv) {
      if (tBeat <= 5) {
        applyQutritCtrl1Q(st, nEnv3, qRing0[tBeat - 1]!, U2_C_DAG, U2_I, U2_C)
        applyQutritCtrl1Q(st, nEnv3, qRing1[tBeat - 1]!, U2_C_DAG, U2_I, U2_C)
      } else {
        const idx = (tBeat - 1) % 5
        const ph = makePhaseU2(1)
        applyQutritCtrl1Q(st, nEnv3, qRing0[idx]!, ph, ph, ph)
        applyQutritCtrl1Q(st, nEnv3, qRing1[idx]!, ph, ph, ph)
      }
    } else {
      if (tBeat <= 5) {
        applyQutritCtrl1Q(st, nEnv3, qRing1[tBeat - 1]!, U2_C, U2_I, U2_C_DAG)
        applyQutritCtrl1Q(st, nEnv3, qRing0[tBeat - 1]!, U2_C, U2_I, U2_C_DAG)
      } else {
        const idx = (tBeat - 1) % 5
        const ph = makePhaseU2(-1)
        applyQutritCtrl1Q(st, nEnv3, qRing1[idx]!, ph, ph, ph)
        applyQutritCtrl1Q(st, nEnv3, qRing0[idx]!, ph, ph, ph)
      }
    }
  }

  // (B) Apples-to-apples Interacting Flat 2x5 Periodic Ring Control (with intra-bath ctrl-C + M_pair(zeta_18))
  const stepQutritFlatInt = (st: StateVec, inv: boolean): void => {
    if (!inv) {
      applyQutritCtrl1Q(st, nEnv3, qRing0[0]!, U2_C_DAG, U2_I, U2_C)
      applyQutritCtrl1Q(st, nEnv3, qRing1[0]!, U2_C_DAG, U2_I, U2_C)
      for (let k = 0; k < 4; k++) {
        applyQutritEnvCtrl1Q(st, nEnv3, qRing0[k]!, qRing0[k + 1]!, U2_C)
        applyQutritEnvCtrl1Q(st, nEnv3, qRing1[k]!, qRing1[k + 1]!, U2_C)
      }
      for (let k = 0; k < 4; k++) {
        const ph0 = makePhaseU2(qZ18Phases[k]!)
        const ph1 = makePhaseU2(qZ18Phases[(k + 1) % 4]!)
        applyQutritCtrl1Q(st, nEnv3, qRing0[k + 1]!, ph0, ph0, ph0)
        applyQutritCtrl1Q(st, nEnv3, qRing1[k + 1]!, ph1, ph1, ph1)
      }
      applyQutritEnvCycle(st, nEnv3, qRing0, false)
      applyQutritEnvCycle(st, nEnv3, qRing1, false)
    } else {
      applyQutritEnvCycle(st, nEnv3, qRing1, true)
      applyQutritEnvCycle(st, nEnv3, qRing0, true)
      for (let k = 3; k >= 0; k--) {
        const ph0 = makePhaseU2(-qZ18Phases[k]!)
        const ph1 = makePhaseU2(-qZ18Phases[(k + 1) % 4]!)
        applyQutritCtrl1Q(st, nEnv3, qRing1[k + 1]!, ph1, ph1, ph1)
        applyQutritCtrl1Q(st, nEnv3, qRing0[k + 1]!, ph0, ph0, ph0)
      }
      for (let k = 3; k >= 0; k--) {
        applyQutritEnvCtrl1Q(st, nEnv3, qRing1[k]!, qRing1[k + 1]!, U2_C_DAG)
        applyQutritEnvCtrl1Q(st, nEnv3, qRing0[k]!, qRing0[k + 1]!, U2_C_DAG)
      }
      applyQutritCtrl1Q(st, nEnv3, qRing1[0]!, U2_C, U2_I, U2_C_DAG)
      applyQutritCtrl1Q(st, nEnv3, qRing0[0]!, U2_C, U2_I, U2_C_DAG)
    }
  }

  // (C) Non-Interacting Flat 2x5 Periodic Free-Shift Baseline (exact U^{15} = I)
  const stepQutritFlatFree = (st: StateVec, inv: boolean): void => {
    if (!inv) {
      applyQutritCtrl1Q(st, nEnv3, qRing0[0]!, U2_C_DAG, U2_I, U2_C)
      applyQutritCtrl1Q(st, nEnv3, qRing1[0]!, U2_C_DAG, U2_I, U2_C)
      applyQutritEnvCycle(st, nEnv3, qRing0, false)
      applyQutritEnvCycle(st, nEnv3, qRing1, false)
    } else {
      applyQutritEnvCycle(st, nEnv3, qRing1, true)
      applyQutritEnvCycle(st, nEnv3, qRing0, true)
      applyQutritCtrl1Q(st, nEnv3, qRing1[0]!, U2_C, U2_I, U2_C_DAG)
      applyQutritCtrl1Q(st, nEnv3, qRing0[0]!, U2_C, U2_I, U2_C_DAG)
    }
  }

  const stQOpen = makeQutritInit()
  const stQFlatInt = makeQutritInit()
  const stQFlatFree = makeQutritInit()
  const qOpenCoh: number[] = []
  const qOpenS: number[] = []
  const qFlatIntCoh: number[] = []
  const qFlatFreeCoh: number[] = []
  let qMaxDiagDrift = 0
  let qMaxPurityErr = 0

  const readQutrit = (st: StateVec): { maxOff: number; diagDrift: number; sBits: number; purErr: number } => {
    const n2 = stateNormSq(st)
    const rhoS = partialTraceQutritSystem(st, nEnv3, true, [])
    const ev = hermitianEigenvalues(rhoS)
    const c01 = Math.hypot(rhoS.re[1]!, rhoS.im[1]!)
    const c02 = Math.hypot(rhoS.re[2]!, rhoS.im[2]!)
    const c12 = Math.hypot(rhoS.re[5]!, rhoS.im[5]!)
    const diagDrift = Math.max(
      Math.abs(rhoS.re[0]! - 1 / 3),
      Math.abs(rhoS.re[4]! - 1 / 3),
      Math.abs(rhoS.re[8]! - 1 / 3),
    )
    return {
      maxOff: Math.max(c01, c02, c12),
      diagDrift,
      sBits: vonNeumannBits(ev),
      purErr: Math.abs(n2 * n2 - 1),
    }
  }

  const q0 = readQutrit(stQOpen)
  qOpenCoh.push(q0.maxOff)
  qOpenS.push(q0.sBits)
  qFlatIntCoh.push(readQutrit(stQFlatInt).maxOff)
  qFlatFreeCoh.push(readQutrit(stQFlatFree).maxOff)

  for (let t = 1; t <= T; t++) {
    stepQutritOpenHyp(stQOpen, t, false)
    stepQutritFlatInt(stQFlatInt, false)
    stepQutritFlatFree(stQFlatFree, false)
    const mo = readQutrit(stQOpen)
    const mi = readQutrit(stQFlatInt)
    const mf = readQutrit(stQFlatFree)
    qOpenCoh.push(mo.maxOff)
    qOpenS.push(mo.sBits)
    qFlatIntCoh.push(mi.maxOff)
    qFlatFreeCoh.push(mf.maxOff)
    qMaxDiagDrift = Math.max(qMaxDiagDrift, mo.diagDrift, mi.diagDrift)
    qMaxPurityErr = Math.max(qMaxPurityErr, mo.purErr, mi.purErr, mf.purErr)
  }

  const revQ = cloneState(stQOpen)
  for (let t = T; t >= 1; t--) stepQutritOpenHyp(revQ, t, true)
  const fidQ = cAbs2(stateInner(makeQutritInit(), revQ))
  const qFlatIntLateMax = Math.max(...qFlatIntCoh.slice(5))
  const log2Of3 = Math.log2(3)

  console.log('  beat | Open-Hyp max|rho_ab| (S bits) | Flat+z18 Int Ring | Free-Shift Flat Baseline')
  console.log('  -----+-------------------------------+-------------------+-------------------------')
  for (const t of [0, 1, 2, 3, 5, 10, 15, 20, 24]) {
    console.log(
      `  t=${String(t).padStart(2, ' ')} | ${qOpenCoh[t]!.toFixed(6)} (${qOpenS[t]!.toFixed(6)} / ${log2Of3.toFixed(6)})` +
        ` | ${qFlatIntCoh[t]!.toFixed(6)}          | ${qFlatFreeCoh[t]!.toFixed(6)}`,
    )
  }
  console.log(
    `  Rate-matched t=1: Open=${qOpenCoh[1]!.toFixed(6)}, Flat+z18=${qFlatIntCoh[1]!.toFixed(6)}, FreeFlat=${qFlatFreeCoh[1]!.toFixed(6)}`,
  )
  console.log(
    `  Qutrit diag drift=${qMaxDiagDrift.toExponential(2)}, purityErr=${qMaxPurityErr.toExponential(2)}, Loschmidt |1-F|=${Math.abs(1 - fidQ).toExponential(2)}`,
  )

  const ok3 =
    Math.abs(qOpenCoh[1]! - qFlatFreeCoh[1]!) < 1e-14 &&
    qOpenCoh[T]! < 1e-3 &&
    Math.abs(qOpenS[T]! - log2Of3) < 1e-4 &&
    qFlatIntLateMax < 0.08 &&
    Math.abs(qFlatFreeCoh[15]! - 1 / 3) < 1e-13 &&
    qMaxDiagDrift < 1e-14 &&
    qMaxPurityErr < 1e-13 &&
    Math.abs(1 - fidQ) < 1e-13

  recordCheck(
    'W17.3',
    'Rate-matched (2/beat) ternary tone qutrit S in {-1,0,+1} + N_env=10 (Open vs Flat+z18 vs FreeFlat)',
    ok3,
    `open=${qOpenCoh[T]!.toExponential(3)}, flatInt_lateMax=${qFlatIntLateMax.toFixed(4)}, freeFlat_t15=${qFlatFreeCoh[15]!.toFixed(6)}, S=${qOpenS[T]!.toFixed(5)}/${log2Of3.toFixed(5)}`,
  )

  return {
    hypCollisionFinal: modA.finalState,
    hypTreeZ18Final: modB.finalState,
    flatIntZ18Final: modD.finalState,
    qutritHypFinal: stQOpen,
  }
}

// ============================================================================
// PART 2: GENUINE MULTI-FRAGMENT QUANTUM DARWINISM + HOLEVO chi_Z & DISCORD D_Z
//   - W17.4: Full f = 0..12 exact I(S:F), Holevo chi_Z, and Discord D_Z on Open-Hyp,
//            HONEYCOMB TI-Tree, Interacting Flat Ring, and Scrambled Control
//   - W17.5: Scrambled negative control anti-plateau + Full Ternary Qutrit Darwinism
// ============================================================================

function computeDarwinismCurveQubits(
  st: StateVec,
  nEnv: number,
  modeOrder: readonly number[],
): {
  readonly hS: number
  readonly miByF: readonly number[]
  readonly chiByF: readonly number[]
  readonly discByF: readonly number[]
} {
  const nTot = 1 + nEnv
  const hS = pureSubsystemEntropyQubits(st, nTot, [0])
  const miByF: number[] = []
  const chiByF: number[] = []
  const discByF: number[] = []
  for (let f = 0; f <= nEnv; f++) {
    const frag = modeOrder.slice(0, f)
    const res = computeHolevoAndDiscordQubits(st, nEnv, frag)
    miByF.push(res.mi)
    chiByF.push(res.chiZ)
    discByF.push(res.discordZ)
  }
  return { hS, miByF, chiByF, discByF }
}

function buildDeterministicScrambledControl(nEnv: number): StateVec {
  const nTot = 1 + nEnv
  const st = makeState(1 << nTot)
  st.re[0] = INV_SQRT2
  st.re[1] = INV_SQRT2
  for (let k = 1; k <= nEnv; k++) {
    applyCtrlDual1Q(st, 0, k, U2_OMEGA2_I, U2_C)
  }
  for (let round = 0; round < 8; round++) {
    const stride = (round % 3) + 1
    for (let k = 1; k <= nEnv; k++) {
      apply1Q(st, k, round % 2 === 0 ? U2_D : U2_C)
      apply1Q(st, k, makePhaseU2(((k * 3 + round * 5) % 17) + 1))
    }
    for (let k = 1; k <= nEnv; k++) {
      const target = ((k - 1 + stride) % nEnv) + 1
      if (target !== k) applyCtrl1Q(st, k, target, U2_C)
    }
  }
  return st
}

function runPart2(part1: {
  readonly hypCollisionFinal: StateVec
  readonly hypTreeZ18Final: StateVec
  readonly flatIntZ18Final: StateVec
  readonly qutritHypFinal: StateVec
}): void {
  console.log('\n========================================================================')
  console.log('PART 2: MULTI-FRAGMENT QUANTUM DARWINISM, HOLEVO chi_Z & DISCORD D_Z')
  console.log('========================================================================')

  const nEnv = 12
  const nTot = 13
  const order12 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  const orderInterleaved = [1, 5, 9, 2, 6, 10, 3, 7, 11, 4, 8, 12]

  // Direct 64x64 vs 128x128 Schmidt cross-check on f = 6 vs complement of size 7
  const rhoF6Direct = partialTraceQubits(part1.hypCollisionFinal, nTot, [1, 2, 3, 4, 5, 6])
  const sF6Direct = vonNeumannBits(hermitianEigenvalues(rhoF6Direct))
  const rhoComp6Direct = partialTraceQubits(part1.hypCollisionFinal, nTot, [0, 7, 8, 9, 10, 11, 12])
  const sComp6Direct = vonNeumannBits(hermitianEigenvalues(rhoComp6Direct))
  const schmidtCheckErr = Math.abs(sF6Direct - sComp6Direct)

  const darOpen = computeDarwinismCurveQubits(part1.hypCollisionFinal, nEnv, order12)
  const darTree = computeDarwinismCurveQubits(part1.hypTreeZ18Final, nEnv, orderInterleaved)
  const stScrambled = buildDeterministicScrambledControl(nEnv)
  const darScrambled = computeDarwinismCurveQubits(stScrambled, nEnv, order12)

  // Disjoint observer checks with explicit Holevo chi_Z + Discord D_Z decomposition!
  const disjoint4Open = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [10, 11, 12],
  ].map(frag => computeHolevoAndDiscordQubits(part1.hypCollisionFinal, nEnv, frag))

  const disjoint6Open = [
    [1, 2],
    [3, 4],
    [5, 6],
    [7, 8],
    [9, 10],
    [11, 12],
  ].map(frag => computeHolevoAndDiscordQubits(part1.hypCollisionFinal, nEnv, frag))

  // 3 disjoint HONEYCOMB D_4 frame observers (F_0, F_1, F_2) on TI-Tree t=24
  const disjoint3FramesTree = HONEYCOMB.treeFrameBits.map(frag =>
    computeHolevoAndDiscordQubits(part1.hypTreeZ18Final, nEnv, frag),
  )

  // Also check the 3 disjoint rings on the apples-to-apples Interacting Flat Ring (t=24)
  const disjoint3FlatInt = HONEYCOMB.treeFrameBits.map(frag =>
    computeHolevoAndDiscordQubits(part1.flatIntZ18Final, nEnv, frag),
  )

  const findFDelta = (vals: readonly number[], hS: number, delta: number): number => {
    for (let f = 1; f <= nEnv; f++) {
      if (vals[f]! >= (1 - delta) * hS) return f
    }
    return nEnv
  }
  const fDelta05 = findFDelta(darOpen.chiByF, darOpen.hS, 0.05)
  const fDelta02 = findFDelta(darOpen.chiByF, darOpen.hS, 0.02)
  const rDelta05 = nEnv / fDelta05
  const rDelta02 = nEnv / fDelta02
  const fDeltaScramChi05 = findFDelta(darScrambled.chiByF, darScrambled.hS, 0.05)

  let plateauMaxDev = 0
  for (let f = fDelta02; f <= nEnv - fDelta02; f++) {
    plateauMaxDev = Math.max(plateauMaxDev, Math.abs(darOpen.miByF[f]! - darOpen.hS))
  }

  // Verify Holevo bound chi_Z(S:F) <= H(S) + 1e-12 everywhere!
  const maxHolevoViolation = Math.max(
    ...darOpen.chiByF.map(c => c - darOpen.hS),
    ...darTree.chiByF.map(c => c - darTree.hS),
    ...darScrambled.chiByF.map(c => c - darScrambled.hS),
    ...disjoint3FramesTree.map(r => r.chiZ - darTree.hS),
  )

  console.log('\n[W17.4] Full f = 0..12 I(S:F) = chi_Z + D_Z (Exact Eigenvalues, dim=8,192):')
  console.log(
    `  Direct 64x64 vs 128x128 Schmidt cross-check: S(F_6)=${sF6Direct.toFixed(10)}, S(comp)=${sComp6Direct.toFixed(10)}, diff=${schmidtCheckErr.toExponential(2)}`,
  )
  console.log('   f | Open-Hyp I (chi_Z / D_Z)      | TI-Tree I (chi_Z / D_Z)       | Scrambled I (chi_Z / D_Z)')
  console.log('  ---+-------------------------------+-------------------------------+------------------------------')
  for (let f = 0; f <= nEnv; f++) {
    console.log(
      `  ${String(f).padStart(2, ' ')} | ${darOpen.miByF[f]!.toFixed(4)} (${darOpen.chiByF[f]!.toFixed(4)} / ${darOpen.discByF[f]!.toFixed(4)})` +
        `       | ${darTree.miByF[f]!.toFixed(4)} (${darTree.chiByF[f]!.toFixed(4)} / ${darTree.discByF[f]!.toFixed(4)})` +
        `       | ${darScrambled.miByF[f]!.toFixed(4)} (${darScrambled.chiByF[f]!.toFixed(4)} / ${darScrambled.discByF[f]!.toFixed(4)})`,
    )
  }
  console.log(
    `  Open-Hyp: H(S)=${darOpen.hS.toFixed(6)}, f_0.05=${fDelta05} (R_0.05=${rDelta05}), f_0.02=${fDelta02} (R_0.02=${rDelta02}), plateauDev[3..9]=${plateauMaxDev.toFixed(6)}`,
  )
  console.log(
    `  Open-Hyp 4 disjoint 3-mode observers chi_Z: [${disjoint4Open.map(r => r.chiZ.toFixed(6)).join(', ')}] (D_Z=${disjoint4Open[0]!.discordZ.toFixed(6)})`,
  )
  console.log(
    `  Open-Hyp 6 disjoint 2-mode observers chi_Z: [${disjoint6Open.map(r => r.chiZ.toFixed(6)).join(', ')}] (D_Z=${disjoint6Open[0]!.discordZ.toFixed(6)})`,
  )
  console.log(
    `  TI-Tree (H(S)=${darTree.hS.toFixed(6)}) 3 disjoint D_4 frames:`,
  )
  for (let f = 0; f < 3; f++) {
    const r = disjoint3FramesTree[f]!
    console.log(
      `    F_${f}: I=${r.mi.toFixed(6)} = chi_Z(${r.chiZ.toFixed(6)}) + D_Z(${r.discordZ.toFixed(6)}) (chi_Z/H(S)=${(r.chiZ / darTree.hS).toFixed(4)})`,
    )
  }
  console.log(
    `  Interacting Flat 3x4 rings chi_Z: [${disjoint3FlatInt.map(r => r.chiZ.toFixed(4)).join(', ')}]`,
  )
  console.log(
    `  Scrambled control at f=6: I=${darScrambled.miByF[6]!.toFixed(4)} = chi_Z(${darScrambled.chiByF[6]!.toFixed(4)}) + D_Z(${darScrambled.discByF[6]!.toFixed(4)}), f_0.05(chi_Z)=${fDeltaScramChi05} (Holevo maxViol=${maxHolevoViolation.toExponential(1)})`,
  )

  // Tightened ok4: assert BOTH I(S:F) AND strictly classical Holevo chi_Z >= 0.90 * H(S) on all 3 TI-Tree frames!
  const ok4 =
    schmidtCheckErr < 1e-12 &&
    maxHolevoViolation < 1e-12 &&
    rDelta02 >= 4 &&
    rDelta05 >= 6 &&
    plateauMaxDev < 0.015 &&
    Math.abs(darOpen.miByF[nEnv]! - 2 * darOpen.hS) < 1e-12 &&
    disjoint4Open.every(r => r.chiZ >= 0.98 * darOpen.hS) &&
    disjoint6Open.every(r => r.chiZ >= 0.95 * darOpen.hS) &&
    disjoint3FramesTree.every(r => r.chiZ >= 0.90 * darTree.hS)

  recordCheck(
    'W17.4',
    'Genuine multi-fragment Quantum Darwinism + Holevo chi_Z / Discord D_Z decomposition (f=0..12)',
    ok4,
    `R_0.02=${rDelta02}, R_0.05=${rDelta05}, TI-Tree 3-frame chi_Z=[${disjoint3FramesTree.map(r => r.chiZ.toFixed(3)).join(',')}] (>=0.90 H(S)), HolevoViol=${maxHolevoViolation.toExponential(1)}`,
  )

  // --- W17.5: Scrambled anti-plateau separation + Ternary Qutrit Darwinism ---
  const nEnv3 = 10
  const hSQ = pureSubsystemEntropyQutrit(part1.qutritHypFinal, nEnv3, true, [])
  const qMiByF: number[] = []
  for (let f = 0; f <= nEnv3; f++) {
    const frag = Array.from({ length: f }, (_, idx) => idx)
    const sF = pureSubsystemEntropyQutrit(part1.qutritHypFinal, nEnv3, false, frag)
    const sSF = pureSubsystemEntropyQutrit(part1.qutritHypFinal, nEnv3, true, frag)
    qMiByF.push(hSQ + sF - sSF)
  }
  let qFDelta05 = nEnv3
  for (let f = 1; f <= nEnv3; f++) {
    if (qMiByF[f]! >= 0.95 * hSQ) {
      qFDelta05 = f
      break
    }
  }
  const qRDelta05 = Math.floor(nEnv3 / qFDelta05)
  const qDisjoint3 = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
  ].map(frag => {
    const sF = pureSubsystemEntropyQutrit(part1.qutritHypFinal, nEnv3, false, frag)
    const sSF = pureSubsystemEntropyQutrit(part1.qutritHypFinal, nEnv3, true, frag)
    return hSQ + sF - sSF
  })

  console.log('\n[W17.5] Ternary Tone Qutrit Quantum Darwinism (H(S) = log2(3) = 1.58496 bits, N_env=10):')
  console.log(
    `  f=0..10 I(S:F): [${qMiByF.map((v, i) => `${i}:${v.toFixed(3)}`).join(', ')}] bits`,
  )
  console.log(
    `  Qutrit f_0.05=${qFDelta05} (R_0.05=${qRDelta05}), 3 disjoint 3-mode fragments=[${qDisjoint3.map(v => v.toFixed(5)).join(', ')}] bits`,
  )

  const ok5 =
    darScrambled.miByF[3]! < 0.05 &&
    darScrambled.chiByF[6]! < 0.45 &&
    darScrambled.discByF[6]! > 0.55 &&
    fDeltaScramChi05 >= 8 &&
    qRDelta05 >= 3 &&
    Math.abs(qMiByF[nEnv3]! - 2 * hSQ) < 1e-11 &&
    qDisjoint3.every(v => v >= 0.95 * hSQ)

  recordCheck(
    'W17.5',
    'Scrambled negative control (discord-dominated Page jump) & Ternary Qutrit Darwinism (H(S)=log2(3))',
    ok5,
    `scram(f=6): chi_Z=${darScrambled.chiByF[6]!.toFixed(3)}/D_Z=${darScrambled.discByF[6]!.toFixed(3)}, qutrit_R05=${qRDelta05}, qutrit_I(10)=${qMiByF[10]!.toFixed(4)}`,
  )
}

// ============================================================================
// PART 3: EXACT Z[zeta_9][1/6] ZUREK ENVARIANCE, p = 2 UNIQUENESS + 3D GLEASON,
//         AND BELL-CHSH DECOHERENCE TRANSITION (VS FREE-SHIFT & INTERACTING FLAT CONTROLS)
//   - W17.6: Exact BigInt Z[zeta_9][1/6] t=1 (4 branches) & t=2 (16 branches) using explicit
//            (-i Z_3 F_3) + explicit bipartite U_copy permutation, 324/324 Z_18 phase, S_4 & S_16 swaps
//   - W17.7: Arbitrary rational amplitudes (m, n) in {(1,1),(1,2),(1,3),(2,3),(3,5)} fine-graining
//   - W17.8: p=2 uniqueness under unitary fine-graining AND genuine 3D Gleason non-contextuality (dim=3)
//   - W17.9: Rate-matched (2/beat) Bell-CHSH S(t): 2.828427 -> < 2.0 (Open-Hyp vs Flat+z18 vs FreeFlat)
// ============================================================================

function zeroZ9Mat(dim: number): Z9[][] {
  return Array.from({ length: dim }, () => Array.from({ length: dim }, () => Z9_ZERO))
}

function eyeZ9Mat(dim: number): Z9[][] {
  const m = zeroZ9Mat(dim)
  for (let i = 0; i < dim; i++) m[i]![i] = Z9_ONE
  return m
}

function permutationsOf(n: number): number[][] {
  const out: number[][] = []
  const arr = Array.from({ length: n }, (_, i) => i)
  const gen = (k: number): void => {
    if (k === n) {
      out.push(arr.slice())
      return
    }
    for (let i = k; i < n; i++) {
      const tmp = arr[k]!
      arr[k] = arr[i]!
      arr[i] = tmp
      gen(k + 1)
      arr[i] = arr[k]!
      arr[k] = tmp
    }
  }
  gen(0)
  return out
}

function runPart3(): void {
  console.log('\n========================================================================')
  console.log('PART 3: Z[zeta_9][1/6] ENVARIANCE, p=2 / 3D GLEASON & BELL DECOHERENCE')
  console.log('========================================================================')

  // --- W17.6: Exact BigInt Z[zeta_9][1/6] Dynamical Branching via explicit (-i Z_3 F_3) & U_copy ---
  console.log('\n[W17.6] Exact BigInt Z[zeta_9][1/6] Bare-U Dynamical Branching & Envariance:')

  const keepAmp1: Z9 = Z9_C_DIAG // (1 + w) / 2, |num|^2 = 1
  const crossAmp1: Z9 = Z9_C_OFF // (1 - w) / 2, |num|^2 = 3
  const psi2: readonly Z9[] = [keepAmp1, Z9_ZERO, Z9_ZERO, crossAmp1]

  let z18PhaseExact = 0
  for (let p0 = 0; p0 < 18; p0++) {
    for (let p1 = 0; p1 < 18; p1++) {
      const uS: Z9Mat = [
        [ZETA18_POW[p0]!, Z9_ZERO],
        [Z9_ZERO, ZETA18_POW[p1]!],
      ]
      const uE: Z9Mat = [
        [ZETA18_POW[(18 - p0) % 18]!, Z9_ZERO],
        [Z9_ZERO, ZETA18_POW[(18 - p1) % 18]!],
      ]
      if (isExactScaledUnitaryZ9(uS, 1n) && isExactScaledUnitaryZ9(uE, 1n)) {
        const res = applyBipartiteZ9(uS, uE, psi2)
        if (res.every((v, idx) => eqZ9(v, psi2[idx]!))) z18PhaseExact++
      }
    }
  }

  // Exact 3x3 qutrit fine-graining gate (-i Z_3 F_3) scaled by 3 in Z[zeta_9]:
  //   Since 1/sqrt(3) is NOT in Q(zeta_9) while -i/sqrt(3) = (-1 - 2w)/3 IS exact in Z[zeta_9][1/3],
  //   3 * (-i Z_3 F_3)[r, c] = (-1 - 2w) * w^{r(c+1) mod 3} is exact in Z[zeta_9] with M^dag M = 9 I_3!
  const minusIOverSqrt3x3: Z9 = [-1n, 0n, 0n, -2n, 0n, 0n]
  const omegaPow: readonly Z9[] = [Z9_ONE, Z9_OMEGA, Z9_OMEGA2]
  const f3Scaled3: Z9[][] = [0, 1, 2].map(r =>
    [0, 1, 2].map(c => mulZ9(minusIOverSqrt3x3, omegaPow[(r * (c + 1)) % 3]!)),
  )
  const f3UnitaryExact = isExactScaledUnitaryZ9(f3Scaled3, 9n)

  // t = 1 explicit bipartite fine-graining on H_S^(4) (x) H_E^(4):
  //   Start from |Psi_2> embedded at (0,0) and (1,1), apply (U_fine4 (x) I_4),
  //   then apply EXPLICIT bipartite permutation unitary U_copy:
  //     (s in {1,2,3}, e in {1,2,3}) -> e' = 1 + ((e - 1 + (s - 1)) mod 3),
  //   then exact division by 3 into Z[zeta_9][1/2]!
  const uFine4: Z9[][] = zeroZ9Mat(4)
  uFine4[0]![0] = [3n, 0n, 0n, 0n, 0n, 0n]
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) uFine4[1 + r]![1 + c] = f3Scaled3[r]![c]!
  }
  const uFine4Unitary = isExactScaledUnitaryZ9(uFine4, 9n)
  const psi4Init = new Array<Z9>(16).fill(Z9_ZERO)
  psi4Init[0 * 4 + 0] = keepAmp1
  psi4Init[1 * 4 + 1] = crossAmp1
  const psi4AfterFine = applyBipartiteZ9(uFine4, eyeZ9Mat(4), psi4Init)
  const psi4AfterCopyScaled6 = new Array<Z9>(16).fill(Z9_ZERO)
  for (let s = 0; s < 4; s++) {
    for (let e = 0; e < 4; e++) {
      const nextE = s >= 1 && e >= 1 ? 1 + ((e - 1 + (s - 1)) % 3) : e
      psi4AfterCopyScaled6[s * 4 + nextE] = psi4AfterFine[s * 4 + e]!
    }
  }
  const fine4DivBy3 = psi4AfterCopyScaled6.every(z => z.every(c => c % 3n === 0n))
  const psi4Vec: Z9[] = psi4AfterCopyScaled6.map(z => divExactZ9(z, 3n))
  // Verify U_copy produced an exact diagonal Schmidt state with 4/4 equal-norm 1/4 branches
  let psi4DiagExact = true
  const fine4Amps: Z9[] = []
  for (let s = 0; s < 4; s++) {
    for (let e = 0; e < 4; e++) {
      const v = psi4Vec[s * 4 + e]!
      if (s === e) fine4Amps.push(v)
      else if (!isZeroZ9(v)) psi4DiagExact = false
    }
  }
  const fine4EqualNorm = psi4DiagExact && fine4Amps.every(a => eqZ9(mulZ9(a, conjZ9(a)), Z9_ONE))

  let s4SwapsExact = 0
  for (const pi of permutationsOf(4)) {
    const uS = zeroZ9Mat(4)
    const uE = zeroZ9Mat(4)
    for (let j = 0; j < 4; j++) {
      const dst = pi[j]!
      const ratio = mulZ9(fine4Amps[dst]!, conjZ9(fine4Amps[j]!))
      uS[dst]![j] = Z9_ONE
      uE[dst]![j] = ratio
    }
    if (isExactScaledUnitaryZ9(uS, 1n) && isExactScaledUnitaryZ9(uE, 1n)) {
      const out = applyBipartiteZ9(uS, uE, psi4Vec)
      if (out.every((v, idx) => eqZ9(v, psi4Vec[idx]!))) s4SwapsExact++
    }
  }

  // t = 2 explicit bipartite fine-graining on H_S^(16) (x) H_E^(16):
  //   Block sizes: KK (1, idx 0), KC (3, idx 1..3), CK (3, idx 4..6), CC (9, idx 7..15).
  //   Explicit 16x16 block unitary U_fine16 = diag(9 I_1, 3*(-i Z_3 F_3), 3*(-i Z_3 F_3), (-i Z_3 F_3)^(x 2))
  //   (scaled by 9 in Z[zeta_9], M^dag M = 81 I_16!), followed by EXPLICIT bipartite U_copy permutation on 256 states!
  const uFine16 = zeroZ9Mat(16)
  uFine16[0]![0] = [9n, 0n, 0n, 0n, 0n, 0n]
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const entry = scaleZ9(3n, f3Scaled3[r]![c]!)
      uFine16[1 + r]![1 + c] = entry
      uFine16[4 + r]![4 + c] = entry
    }
  }
  for (let r1 = 0; r1 < 3; r1++) {
    for (let r2 = 0; r2 < 3; r2++) {
      for (let c1 = 0; c1 < 3; c1++) {
        for (let c2 = 0; c2 < 3; c2++) {
          uFine16[7 + r1 * 3 + r2]![7 + c1 * 3 + c2] = mulZ9(f3Scaled3[r1]![c1]!, f3Scaled3[r2]![c2]!)
        }
      }
    }
  }
  const uFine16Unitary = isExactScaledUnitaryZ9(uFine16, 81n)

  const psi16Init = new Array<Z9>(256).fill(Z9_ZERO)
  psi16Init[0 * 16 + 0] = mulZ9(keepAmp1, keepAmp1) // KK
  psi16Init[1 * 16 + 1] = mulZ9(keepAmp1, crossAmp1) // KC
  psi16Init[4 * 16 + 4] = mulZ9(crossAmp1, keepAmp1) // CK
  psi16Init[7 * 16 + 7] = mulZ9(crossAmp1, crossAmp1) // CC

  const psi16AfterFine = applyBipartiteZ9(uFine16, eyeZ9Mat(16), psi16Init)
  const psi16AfterCopyScaled = new Array<Z9>(256).fill(Z9_ZERO)
  for (let s = 0; s < 16; s++) {
    for (let e = 0; e < 16; e++) {
      let nextE = e
      if (s >= 1 && s < 4 && e >= 1 && e < 4) nextE = 1 + ((e - 1 + (s - 1)) % 3)
      else if (s >= 4 && s < 7 && e >= 4 && e < 7) nextE = 4 + ((e - 4 + (s - 4)) % 3)
      else if (s >= 7 && e >= 7) nextE = 7 + ((e - 7 + (s - 7)) % 9)
      psi16AfterCopyScaled[s * 16 + nextE] = psi16AfterFine[s * 16 + e]!
    }
  }
  const fine16DivBy9 = psi16AfterCopyScaled.every(z => z.every(c => c % 9n === 0n))
  const psi16Vec: Z9[] = psi16AfterCopyScaled.map(z => divExactZ9(z, 9n))
  let psi16DiagExact = true
  const fine16Amps: Z9[] = []
  for (let s = 0; s < 16; s++) {
    for (let e = 0; e < 16; e++) {
      const v = psi16Vec[s * 16 + e]!
      if (s === e) fine16Amps.push(v)
      else if (!isZeroZ9(v)) psi16DiagExact = false
    }
  }
  const fine16EqualNorm =
    psi16DiagExact && fine16Amps.length === 16 && fine16Amps.every(a => eqZ9(mulZ9(a, conjZ9(a)), Z9_ONE))

  let s16GenSwapsExact = 0
  for (let j = 0; j < 15; j++) {
    const uS = eyeZ9Mat(16)
    const uE = eyeZ9Mat(16)
    uS[j]![j] = Z9_ZERO
    uS[j + 1]![j + 1] = Z9_ZERO
    uS[j + 1]![j] = Z9_ONE
    uS[j]![j + 1] = Z9_ONE
    uE[j]![j] = Z9_ZERO
    uE[j + 1]![j + 1] = Z9_ZERO
    uE[j + 1]![j] = mulZ9(fine16Amps[j + 1]!, conjZ9(fine16Amps[j]!))
    uE[j]![j + 1] = mulZ9(fine16Amps[j]!, conjZ9(fine16Amps[j + 1]!))
    if (isExactScaledUnitaryZ9(uS, 1n) && isExactScaledUnitaryZ9(uE, 1n)) {
      const out = applyBipartiteZ9(uS, uE, psi16Vec)
      if (out.every((v, idx) => eqZ9(v, psi16Vec[idx]!))) s16GenSwapsExact++
    }
  }

  console.log(`  t=1 bare-U (1/4, 3/4): Z_18 x Z_18 phase envariance = ${z18PhaseExact}/324 exact (0n error)`)
  console.log(
    `  t=1 fine-graining via explicit (-i Z_3 F_3) + U_copy into Z[zeta_9][1/2]: U_fine unitary=${uFine4Unitary}, ` +
      `exact /3=${fine4DivBy3}, 4/4 equal norm 1/4=${fine4EqualNorm}, S_4 swaps=${s4SwapsExact}/24 exact`,
  )
  console.log(
    `  t=2 fine-graining via explicit 16x16 (-i Z_3 F_3) + U_copy into Z[zeta_9][1/4]: U_fine16 unitary=${uFine16Unitary}, ` +
      `exact /9=${fine16DivBy9}, 16/16 equal norm 1/16=${fine16EqualNorm}, S_16 adjacent generators=${s16GenSwapsExact}/15 exact`,
  )

  const ok6 =
    f3UnitaryExact &&
    z18PhaseExact === 324 &&
    uFine4Unitary &&
    fine4DivBy3 &&
    fine4EqualNorm &&
    s4SwapsExact === 24 &&
    uFine16Unitary &&
    fine16DivBy9 &&
    fine16EqualNorm &&
    s16GenSwapsExact === 15

  recordCheck(
    'W17.6',
    'Exact BigInt Z[zeta_9][1/6] envariance via explicit (-i Z_3 F_3) & U_copy (t=1 S_4 & t=2 S_16)',
    ok6,
    `Z18=${z18PhaseExact}/324, S4=${s4SwapsExact}/24, S16_gens=${s16GenSwapsExact}/15 (0n error, explicit U_copy)`,
  )

  // --- W17.7 & W17.8: Arbitrary Rational (m, n) Fine-Graining + Genuine 3D Gleason Non-Contextuality ---
  console.log('\n[W17.7] Arbitrary Rational Amplitudes (m, n) Unitary Fine-Graining & Envariance:')

  const buildDFT = (d: number): C[][] => {
    const inv = 1 / Math.sqrt(d)
    return Array.from({ length: d }, (_, r) =>
      Array.from({ length: d }, (_, c) => {
        const ang = (2 * PI * r * c) / d
        return [inv * Math.cos(ang), inv * Math.sin(ang)] as const
      }),
    )
  }

  const matUnitaryErrC = (mat: readonly (readonly C[])[]): number => {
    const n = mat.length
    let maxE = 0
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        let acc: C = C_ZERO
        for (let k = 0; k < n; k++) acc = cAdd(acc, cMul(cConj(mat[k]![i]!), mat[k]![j]!))
        const target: C = i === j ? C_ONE : C_ZERO
        maxE = Math.max(maxE, cAbs(cSub(acc, target)))
      }
    }
    return maxE
  }

  const applyBipartiteC = (
    uS: readonly (readonly C[])[],
    uE: readonly (readonly C[])[],
    vec: readonly C[],
  ): C[] => {
    const n = uS.length
    const mid: C[] = new Array<C>(n * n).fill(C_ZERO)
    for (let sO = 0; sO < n; sO++) {
      for (let e = 0; e < n; e++) {
        let acc = C_ZERO
        for (let sI = 0; sI < n; sI++) acc = cAdd(acc, cMul(uS[sO]![sI]!, vec[sI * n + e]!))
        mid[sO * n + e] = acc
      }
    }
    const out: C[] = new Array<C>(n * n).fill(C_ZERO)
    for (let s = 0; s < n; s++) {
      for (let eO = 0; eO < n; eO++) {
        let acc = C_ZERO
        for (let eI = 0; eI < n; eI++) acc = cAdd(acc, cMul(uE[eO]![eI]!, mid[s * n + eI]!))
        out[s * n + eO] = acc
      }
    }
    return out
  }

  const rationalPairs: readonly (readonly [number, number])[] = [
    [1, 1],
    [1, 2],
    [1, 3],
    [2, 3],
    [3, 5],
  ]
  const pValues: readonly number[] = [1, 1.5, 2, 3, 4]
  const maxErrByP = new Map<number, number>(pValues.map(p => [p, 0]))
  const tableRowsP: { pair: string; errs: number[] }[] = []

  let maxFineUnitaryErr = 0
  let maxPhaseEnvErr = 0
  let maxSwapEnvErr = 0
  let maxEqModErr = 0
  let maxBornMatchErr = 0
  let totalTranspositionsChecked = 0

  for (const [m, n] of rationalPairs) {
    const N = m + n
    const alpha: C = [Math.sqrt(m / N), 0]
    const z18_5 = z9ToComplex(ZETA18_POW[5]!)
    const beta: C = cScale(Math.sqrt(n / N), z18_5)

    const psiInit = new Array<C>(N * N).fill(C_ZERO)
    psiInit[0 * N + 0] = alpha
    psiInit[m * N + m] = beta

    const Fm = buildDFT(m)
    const Fn = buildDFT(n)
    const vFine: C[][] = Array.from({ length: N }, () => new Array<C>(N).fill(C_ZERO))
    for (let r = 0; r < m; r++) {
      for (let c = 0; c < m; c++) vFine[r]![c] = Fm[r]![c]!
    }
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) vFine[m + r]![m + c] = Fn[r]![c]!
    }
    maxFineUnitaryErr = Math.max(maxFineUnitaryErr, matUnitaryErrC(vFine))

    const eyeN: C[][] = Array.from({ length: N }, (_, r) =>
      Array.from({ length: N }, (_, c) => (r === c ? C_ONE : C_ZERO)),
    )
    const psiAfterV = applyBipartiteC(vFine, eyeN, psiInit)
    const psiFine = new Array<C>(N * N).fill(C_ZERO)
    for (let s = 0; s < N; s++) {
      for (let e = 0; e < N; e++) {
        let nextE = e
        if (s < m && e < m) nextE = (e + s) % m
        else if (s >= m && e >= m) nextE = m + ((e - m + (s - m)) % n)
        psiFine[s * N + nextE] = psiAfterV[s * N + e]!
      }
    }

    const microAmps: C[] = []
    for (let j = 0; j < N; j++) {
      const a = psiFine[j * N + j]!
      microAmps.push(a)
      maxEqModErr = Math.max(maxEqModErr, Math.abs(cAbs(a) - 1 / Math.sqrt(N)))
    }

    const uPhaseS: C[][] = Array.from({ length: N }, () => new Array<C>(N).fill(C_ZERO))
    const uPhaseE: C[][] = Array.from({ length: N }, () => new Array<C>(N).fill(C_ZERO))
    for (let j = 0; j < N; j++) {
      const phi = (j + 1) * SQRT2
      uPhaseS[j]![j] = [Math.cos(phi), Math.sin(phi)]
      uPhaseE[j]![j] = [Math.cos(-phi), Math.sin(-phi)]
    }
    const afterPhase = applyBipartiteC(uPhaseS, uPhaseE, psiFine)
    let phaseErr = 0
    for (let i = 0; i < N * N; i++) phaseErr = Math.max(phaseErr, cAbs(cSub(afterPhase[i]!, psiFine[i]!)))
    maxPhaseEnvErr = Math.max(maxPhaseEnvErr, phaseErr)

    let pairSwapErr = 0
    let swaps = 0
    for (let a = 0; a < N; a++) {
      for (let b = a + 1; b < N; b++) {
        swaps++
        totalTranspositionsChecked++
        const pS: C[][] = Array.from({ length: N }, (_, r) =>
          Array.from({ length: N }, (_, c) => (r === c ? C_ONE : C_ZERO)),
        )
        const pE: C[][] = Array.from({ length: N }, (_, r) =>
          Array.from({ length: N }, (_, c) => (r === c ? C_ONE : C_ZERO)),
        )
        pS[a]![a] = C_ZERO
        pS[b]![b] = C_ZERO
        pS[a]![b] = C_ONE
        pS[b]![a] = C_ONE

        const norm2A = cAbs2(microAmps[a]!)
        const ratioBA = cScale(1 / norm2A, cMul(microAmps[b]!, cConj(microAmps[a]!)))
        const ratioAB = cConj(ratioBA)
        pE[a]![a] = C_ZERO
        pE[b]![b] = C_ZERO
        pE[b]![a] = ratioBA
        pE[a]![b] = ratioAB

        const errU = Math.max(matUnitaryErrC(pS), matUnitaryErrC(pE))
        const afterSwap = applyBipartiteC(pS, pE, psiFine)
        let diff = errU
        for (let i = 0; i < N * N; i++) diff = Math.max(diff, cAbs(cSub(afterSwap[i]!, psiFine[i]!)))
        pairSwapErr = Math.max(pairSwapErr, diff)
      }
    }
    maxSwapEnvErr = Math.max(maxSwapEnvErr, pairSwapErr)

    const p0Derived = m / N
    const p1Derived = n / N
    maxBornMatchErr = Math.max(
      maxBornMatchErr,
      Math.abs(p0Derived - cAbs2(alpha)),
      Math.abs(p1Derived - cAbs2(beta)),
    )

    console.log(
      `  (m,n)=(${m},${n}) N=${N}: V_fine err=${matUnitaryErrC(vFine).toExponential(1)}, ` +
        `phaseEnv=${phaseErr.toExponential(1)}, swaps=${swaps}/${swaps} (${pairSwapErr.toExponential(1)}), ` +
        `P=(${p0Derived.toFixed(4)}, ${p1Derived.toFixed(4)}) == (|a|^2, |b|^2)`,
    )

    const rowErrs: number[] = []
    for (const p of pValues) {
      const w0Coarse = Math.pow(cAbs(alpha), p)
      const w1Coarse = Math.pow(cAbs(beta), p)
      const p0Coarse = w0Coarse / (w0Coarse + w1Coarse)
      let wFine0 = 0
      let wFineTot = 0
      for (let j = 0; j < N; j++) {
        const w = Math.pow(cAbs(microAmps[j]!), p)
        wFineTot += w
        if (j < m) wFine0 += w
      }
      const p0FineSum = wFine0 / wFineTot
      const addErr = Math.abs(p0Coarse - p0FineSum)
      rowErrs.push(addErr)
      maxErrByP.set(p, Math.max(maxErrByP.get(p)!, addErr))
    }
    tableRowsP.push({ pair: `(${m},${n})`, errs: rowErrs })
  }

  // GENUINE 3D Gleason Non-Contextuality Test (dim = 3, normalized P_p!):
  //   Fix normalized state |psi> = (1/sqrt(2), 1/sqrt(2), 0)^T in C^3 and ray |e_1> = (1, 0, 0)^T.
  //   Compare two exact orthonormal bases of C^3 sharing the IDENTICAL projector |e_1><e_1|:
  //     Frame B_1 = { |e_1>, |e_2>, |e_3> } (standard basis)
  //     Frame B_2 = { |e_1>, D|e_2>, D|e_3> } (exact bare half-coin D acting in e_1^perp = span{|e_2>, |e_3>})!
  //   Check whether normalized P_p(e_1 | B_1) === P_p(e_1 | B_2) (non-contextuality)!
  const psi3: readonly [C, C, C] = [[INV_SQRT2, 0], [INV_SQRT2, 0], C_ZERO]
  const d00 = z9ToComplex(Z9_COIN_DIAG, 2n)
  const d01 = z9ToComplex(Z9_COIN_OFF, 2n)
  const frameB1: readonly (readonly [C, C, C])[] = [
    [C_ONE, C_ZERO, C_ZERO],
    [C_ZERO, C_ONE, C_ZERO],
    [C_ZERO, C_ZERO, C_ONE],
  ]
  const frameB2: readonly (readonly [C, C, C])[] = [
    [C_ONE, C_ZERO, C_ZERO],
    [C_ZERO, d00, d01],
    [C_ZERO, d01, d00],
  ]
  const frameB2UnitaryErr = matUnitaryErrC(frameB2)
  const inner3 = (u: readonly [C, C, C], v: readonly [C, C, C]): C =>
    cAdd(cAdd(cMul(cConj(u[0]), v[0]), cMul(cConj(u[1]), v[1])), cMul(cConj(u[2]), v[2]))
  const ampsB1 = frameB1.map(b => inner3(b, psi3))
  const ampsB2 = frameB2.map(b => inner3(b, psi3))
  const gleason3DErrByP = pValues.map(p => {
    const w1 = ampsB1.map(a => Math.pow(cAbs(a), p))
    const w2 = ampsB2.map(a => Math.pow(cAbs(a), p))
    const pE1GivenB1 = w1[0]! / (w1[0]! + w1[1]! + w1[2]!)
    const pE1GivenB2 = w2[0]! / (w2[0]! + w2[1]! + w2[2]!)
    return Math.abs(pE1GivenB1 - pE1GivenB2)
  })

  console.log('\n[W17.8] Uniqueness Stress-Test: Fine-Graining Additivity & 3D Gleason Non-Contextuality:')
  console.log('  test   |    p = 1    |   p = 1.5   |    p = 2    |    p = 3    |    p = 4')
  console.log('  -------+-------------+-------------+-------------+-------------+------------')
  for (const row of tableRowsP) {
    console.log(
      `  ${row.pair.padEnd(6, ' ')} | ${row.errs.map(e => e.toExponential(3).padStart(11, ' ')).join(' | ')}`,
    )
  }
  console.log(
    `  MAX-FG | ${pValues.map(p => maxErrByP.get(p)!.toExponential(3).padStart(11, ' ')).join(' | ')}`,
  )
  console.log(
    `  Gleas3 | ${gleason3DErrByP.map(e => e.toExponential(3).padStart(11, ' ')).join(' | ')}  (|P_p(e1|B1)-P_p(e1|B2)|, B2 err=${frameB2UnitaryErr.toExponential(1)})`,
  )

  const ok7 =
    maxFineUnitaryErr < 1e-14 &&
    maxEqModErr < 1e-14 &&
    maxPhaseEnvErr < 1e-14 &&
    maxSwapEnvErr < 1e-14 &&
    maxBornMatchErr < 1e-15 &&
    totalTranspositionsChecked === 48

  recordCheck(
    'W17.7',
    'Arbitrary rational (m,n) in {(1,1),(1,2),(1,3),(2,3),(3,5)} unitary fine-graining & envariance',
    ok7,
    `transpositions=${totalTranspositionsChecked}/48, phaseErr=${maxPhaseEnvErr.toExponential(1)}, swapErr=${maxSwapEnvErr.toExponential(1)}, BornErr=${maxBornMatchErr.toExponential(1)}`,
  )

  const p2Err = maxErrByP.get(2)!
  const pNon2MinMaxErr = Math.min(
    maxErrByP.get(1)!,
    maxErrByP.get(1.5)!,
    maxErrByP.get(3)!,
    maxErrByP.get(4)!,
  )
  const p2Gleason3Err = gleason3DErrByP[2]!
  const pNon2MinGleason3 = Math.min(
    gleason3DErrByP[0]!,
    gleason3DErrByP[1]!,
    gleason3DErrByP[3]!,
    gleason3DErrByP[4]!,
  )

  const ok8 =
    frameB2UnitaryErr < 1e-15 &&
    p2Err < 1e-15 &&
    pNon2MinMaxErr > 0.05 &&
    p2Gleason3Err < 1e-15 &&
    pNon2MinGleason3 > 0.03

  recordCheck(
    'W17.8',
    'Born-rule p=2 uniqueness (fine-graining additivity & genuine 3D Gleason non-contextuality)',
    ok8,
    `p=2 fineErr=${p2Err.toExponential(1)}/Gleas3=${p2Gleason3Err.toExponential(1)}, min(p!=2) fineErr=${pNon2MinMaxErr.toFixed(4)}/Gleas3=${pNon2MinGleason3.toFixed(4)}`,
  )

  // --- W17.9: Rate-Matched (2 modes/beat) Bell-CHSH S(t): 2.828427 -> < 2.0 vs Flat+z18 & FreeFlat ---
  console.log('\n[W17.9] Bell-CHSH S(t): 2.828427 -> < 2.0 (2+10 Qubits, dim=4,096, 1/beat & Rate-Matched 2/beat):')

  const nEnvBell = 10
  const nTotBell = 2 + nEnvBell // bit 0 = Alice S_A, bit 1 = Bob S_B, bits 2..11 = 10 bath modes
  const dimBell = 1 << nTotBell
  const tMaxBell = 15

  const makeBellBathInit = (): StateVec => {
    const st = makeState(dimBell)
    st.re[2] = INV_SQRT2
    st.re[1] = -INV_SQRT2
    return st
  }

  const pauliExpectation = (
    rho4: HermitianDensity,
    a: readonly [number, number, number],
    b: readonly [number, number, number],
  ): number => {
    const op = (v: readonly [number, number, number]): readonly [C, C, C, C] => [
      [v[2], 0],
      [v[0], -v[1]],
      [v[0], v[1]],
      [-v[2], 0],
    ]
    const oa = op(a)
    const ob = op(b)
    let acc = 0
    for (let r1 = 0; r1 < 4; r1++) {
      const a1 = r1 & 1
      const b1 = (r1 >> 1) & 1
      for (let r2 = 0; r2 < 4; r2++) {
        const a2 = r2 & 1
        const b2 = (r2 >> 1) & 1
        const oab = cMul(oa[a2 * 2 + a1]!, ob[b2 * 2 + b1]!)
        acc += rho4.re[r1 * 4 + r2]! * oab[0] - rho4.im[r1 * 4 + r2]! * oab[1]
      }
    }
    return acc
  }

  const axA0: readonly [number, number, number] = [0, 0, 1]
  const axA1: readonly [number, number, number] = [1, 0, 0]
  const axB0: readonly [number, number, number] = [INV_SQRT2, 0, INV_SQRT2]
  const axB1: readonly [number, number, number] = [-INV_SQRT2, 0, INV_SQRT2]

  const measureBellCHSH = (st: StateVec): {
    readonly chsh: number
    readonly horodecki: number
    readonly eZZ: number
    readonly noSigDrift: number
    readonly purityErr: number
  } => {
    const n2 = stateNormSq(st)
    const rhoAB = partialTraceQubits(st, nTotBell, [0, 1])
    const rhoA = partialTraceQubits(st, nTotBell, [0])
    const e00 = pauliExpectation(rhoAB, axA0, axB0)
    const e01 = pauliExpectation(rhoAB, axA0, axB1)
    const e10 = pauliExpectation(rhoAB, axA1, axB0)
    const e11 = pauliExpectation(rhoAB, axA1, axB1)
    const chsh = Math.abs(e00 + e01 + e10 - e11)
    const axes: readonly (readonly [number, number, number])[] = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ]
    const Tmat: number[][] = [0, 1, 2].map(i =>
      [0, 1, 2].map(j => pauliExpectation(rhoAB, axes[i]!, axes[j]!)),
    )
    const gRe = new Float64Array(9)
    const gIm = new Float64Array(9)
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        let s = 0
        for (let k = 0; k < 3; k++) s += Tmat[k]![i]! * Tmat[k]![j]!
        gRe[i * 3 + j] = s
      }
    }
    const gEvals = hermitianEigenvalues({ dim: 3, re: gRe, im: gIm })
    const horodecki = 2 * Math.sqrt(Math.max(0, gEvals[0]! + gEvals[1]!))
    const eZZ = Tmat[2]![2]!
    const noSigDrift = Math.max(
      Math.abs(rhoA.re[0]! - 0.5),
      Math.abs(rhoA.re[3]! - 0.5),
      Math.hypot(rhoA.re[1]!, rhoA.im[1]!),
    )
    return { chsh, horodecki, eZZ, noSigDrift, purityErr: Math.abs(n2 * n2 - 1) }
  }

  const bRing0 = [2, 3, 4, 5, 6]
  const bRing1 = [7, 8, 9, 10, 11]
  const bZ18 = [1, 5, 7, 11] as const

  // (i) 1 mode/beat Open-Hyp (bare det(D)I = zeta_6 I vs C): shows smooth t=1 (>2) -> t=2 (<2) crossing!
  const stepBellOpenC1 = (st: StateVec, tBeat: number, inv: boolean): void => {
    if (!inv) {
      if (tBeat <= nEnvBell) applyCtrlDual1Q(st, 1, 1 + tBeat, U2_ZETA6_I, U2_C)
      else apply1Q(st, 2 + ((tBeat - 1) % nEnvBell), makePhaseU2(1))
    } else {
      if (tBeat <= nEnvBell) applyCtrlDual1Q(st, 1, 1 + tBeat, U2_ZETA6_I_DAG, U2_C_DAG)
      else apply1Q(st, 2 + ((tBeat - 1) % nEnvBell), makePhaseU2(-1))
    }
  }
  // (ii) Rate-matched 2 modes/beat Open-Hyp (bare zeta_6 I vs C)
  const stepBellOpenC2 = (st: StateVec, tBeat: number, inv: boolean): void => {
    if (!inv) {
      if (tBeat <= 5) {
        applyCtrlDual1Q(st, 1, bRing0[tBeat - 1]!, U2_ZETA6_I, U2_C)
        applyCtrlDual1Q(st, 1, bRing1[tBeat - 1]!, U2_ZETA6_I, U2_C)
      } else {
        const idx = (tBeat - 1) % 5
        apply1Q(st, bRing0[idx]!, makePhaseU2(1))
        apply1Q(st, bRing1[idx]!, makePhaseU2(5))
      }
    } else {
      if (tBeat <= 5) {
        applyCtrlDual1Q(st, 1, bRing1[tBeat - 1]!, U2_ZETA6_I_DAG, U2_C_DAG)
        applyCtrlDual1Q(st, 1, bRing0[tBeat - 1]!, U2_ZETA6_I_DAG, U2_C_DAG)
      } else {
        const idx = (tBeat - 1) % 5
        apply1Q(st, bRing1[idx]!, makePhaseU2(-5))
        apply1Q(st, bRing0[idx]!, makePhaseU2(-1))
      }
    }
  }
  // (iii) Rate-matched 2 modes/beat Apples-to-Apples Interacting Flat 2x5 Ring (+ ctrl-C + M_pair(zeta_18))
  const stepBellFlatInt2 = (st: StateVec, inv: boolean): void => {
    if (!inv) {
      applyCtrlDual1Q(st, 1, bRing0[0]!, U2_ZETA6_I, U2_C)
      applyCtrlDual1Q(st, 1, bRing1[0]!, U2_ZETA6_I, U2_C)
      for (let k = 0; k < 4; k++) {
        applyCtrl1Q(st, bRing0[k]!, bRing0[k + 1]!, U2_C)
        applyCtrl1Q(st, bRing1[k]!, bRing1[k + 1]!, U2_C)
      }
      for (let k = 0; k < 4; k++) {
        apply1Q(st, bRing0[k + 1]!, makePhaseU2(bZ18[k]!))
        apply1Q(st, bRing1[k + 1]!, makePhaseU2(bZ18[(k + 1) % 4]!))
      }
      applyCycleBits(st, bRing0, false)
      applyCycleBits(st, bRing1, false)
    } else {
      applyCycleBits(st, bRing1, true)
      applyCycleBits(st, bRing0, true)
      for (let k = 3; k >= 0; k--) {
        apply1Q(st, bRing1[k + 1]!, makePhaseU2(-bZ18[(k + 1) % 4]!))
        apply1Q(st, bRing0[k + 1]!, makePhaseU2(-bZ18[k]!))
      }
      for (let k = 3; k >= 0; k--) {
        applyCtrl1Q(st, bRing1[k]!, bRing1[k + 1]!, U2_C_DAG)
        applyCtrl1Q(st, bRing0[k]!, bRing0[k + 1]!, U2_C_DAG)
      }
      applyCtrlDual1Q(st, 1, bRing1[0]!, U2_ZETA6_I_DAG, U2_C_DAG)
      applyCtrlDual1Q(st, 1, bRing0[0]!, U2_ZETA6_I_DAG, U2_C_DAG)
    }
  }
  // (iv) Rate-matched 2 modes/beat Non-Interacting Flat 2x5 Free-Shift Baseline (exact t=15 Bell revival!)
  const stepBellFlatFree2 = (st: StateVec, inv: boolean): void => {
    if (!inv) {
      applyCtrlDual1Q(st, 1, bRing0[0]!, U2_ZETA6_I, U2_C)
      applyCtrlDual1Q(st, 1, bRing1[0]!, U2_ZETA6_I, U2_C)
      applyCycleBits(st, bRing0, false)
      applyCycleBits(st, bRing1, false)
    } else {
      applyCycleBits(st, bRing1, true)
      applyCycleBits(st, bRing0, true)
      applyCtrlDual1Q(st, 1, bRing1[0]!, U2_ZETA6_I_DAG, U2_C_DAG)
      applyCtrlDual1Q(st, 1, bRing0[0]!, U2_ZETA6_I_DAG, U2_C_DAG)
    }
  }

  const stBellC1 = makeBellBathInit()
  const stBellC2 = makeBellBathInit()
  const stBellFlatInt = makeBellBathInit()
  const stBellFlatFree = makeBellBathInit()
  const sC1Fixed: number[] = []
  const sC1Hor: number[] = []
  const sC2Fixed: number[] = []
  const sFlatIntFixed: number[] = []
  const sFlatIntHor: number[] = []
  const sFlatFreeFixed: number[] = []
  let maxNoSig = 0
  let maxBellPurErr = 0
  let maxZZDrift = 0

  const b0m = measureBellCHSH(stBellC1)
  sC1Fixed.push(b0m.chsh)
  sC1Hor.push(b0m.horodecki)
  sC2Fixed.push(b0m.chsh)
  sFlatIntFixed.push(b0m.chsh)
  sFlatIntHor.push(b0m.horodecki)
  sFlatFreeFixed.push(b0m.chsh)

  for (let t = 1; t <= tMaxBell; t++) {
    stepBellOpenC1(stBellC1, t, false)
    stepBellOpenC2(stBellC2, t, false)
    stepBellFlatInt2(stBellFlatInt, false)
    stepBellFlatFree2(stBellFlatFree, false)
    const m1 = measureBellCHSH(stBellC1)
    const m2 = measureBellCHSH(stBellC2)
    const mi = measureBellCHSH(stBellFlatInt)
    const mf = measureBellCHSH(stBellFlatFree)
    sC1Fixed.push(m1.chsh)
    sC1Hor.push(m1.horodecki)
    sC2Fixed.push(m2.chsh)
    sFlatIntFixed.push(mi.chsh)
    sFlatIntHor.push(mi.horodecki)
    sFlatFreeFixed.push(mf.chsh)
    maxNoSig = Math.max(maxNoSig, m1.noSigDrift, m2.noSigDrift, mi.noSigDrift, mf.noSigDrift)
    maxBellPurErr = Math.max(maxBellPurErr, m1.purityErr, m2.purityErr, mi.purityErr, mf.purityErr)
    maxZZDrift = Math.max(maxZZDrift, Math.abs(m1.eZZ + 1), Math.abs(m2.eZZ + 1), Math.abs(mi.eZZ + 1))
  }

  const stBellRev = cloneState(stBellC2)
  for (let t = tMaxBell; t >= 1; t--) stepBellOpenC2(stBellRev, t, true)
  const mRevBell = measureBellCHSH(stBellRev)
  const exactAsymp = SQRT2 * (1 + Math.pow(2, -nEnvBell))

  console.log('  beat | Open(1/b) S_fix (S_Hor) | Open(2/b) S_fix | Flat+z18(2/b) S_fix (S_Hor) | FreeFlat(2/b) S_fix')
  console.log('  -----+-------------------------+-----------------+-----------------------------+--------------------')
  for (const t of [0, 1, 2, 3, 5, 10, 12, 15]) {
    console.log(
      `  t=${String(t).padStart(2, ' ')} | ${sC1Fixed[t]!.toFixed(4)} (${sC1Hor[t]!.toFixed(6)})` +
        `       | ${sC2Fixed[t]!.toFixed(6)}        | ${sFlatIntFixed[t]!.toFixed(4)} (${sFlatIntHor[t]!.toFixed(6)})` +
        `           | ${sFlatFreeFixed[t]!.toFixed(6)}`,
    )
  }
  console.log(
    `  Rate-matched t=1 (2/b): Open=${sC2Fixed[1]!.toFixed(6)}, Flat+z18=${sFlatIntFixed[1]!.toFixed(6)}, FreeFlat=${sFlatFreeFixed[1]!.toFixed(6)}`,
  )
  console.log(
    `  Asymptotic sqrt(2)*(1+2^-10)=${exactAsymp.toFixed(6)} (sqrt(2)=${SQRT2.toFixed(6)}), E(Z,Z)=-1 drift=${maxZZDrift.toExponential(2)}, ` +
      `Alice noSig=${maxNoSig.toExponential(2)}, Loschmidt S=${mRevBell.chsh.toFixed(12)}`,
  )

  const tsirelson = 2 * SQRT2
  let bellMonotone = true
  for (let t = 1; t <= tMaxBell; t++) {
    if (sC1Fixed[t]! > sC1Fixed[t - 1]! + 1e-13 || sC1Hor[t]! > sC1Hor[t - 1]! + 1e-13) {
      bellMonotone = false
    }
  }
  const ok9 =
    bellMonotone &&
    Math.abs(sC2Fixed[1]! - sFlatFreeFixed[1]!) < 1e-13 &&
    Math.abs(sC1Fixed[0]! - tsirelson) < 1e-13 &&
    sC1Fixed[1]! > 2.0 &&
    sC1Fixed[2]! < 2.0 &&
    Math.abs(sC1Fixed[tMaxBell]! - exactAsymp) < 1e-12 &&
    Math.abs(sC2Fixed[tMaxBell]! - exactAsymp) < 1e-12 &&
    sC1Hor[tMaxBell]! > 2.0 &&
    sC1Hor[tMaxBell]! < 2.00001 &&
    sFlatIntFixed[tMaxBell]! < 2.0 &&
    Math.abs(sFlatFreeFixed[15]! - tsirelson) < 1e-13 &&
    Math.abs(mRevBell.chsh - tsirelson) < 1e-13 &&
    maxNoSig < 1e-13 &&
    maxZZDrift < 1e-13 &&
    maxBellPurErr < 1e-13

  recordCheck(
    'W17.9',
    'Rate-matched Bell-CHSH S(t): 2.828427 -> < 2.0 (Open-Hyp vs Flat+z18 vs FreeFlat baseline)',
    ok9,
    `Open(1/b): ${sC1Fixed[0]!.toFixed(4)}->${sC1Fixed[1]!.toFixed(4)}->${sC1Fixed[2]!.toFixed(4)}->${sC1Fixed[15]!.toFixed(4)} (S_Hor->${sC1Hor[15]!.toFixed(6)}), Flat+z18(15)=${sFlatIntFixed[15]!.toFixed(4)}, FreeFlat(15)=${sFlatFreeFixed[15]!.toFixed(4)}`,
  )
}

// ============================================================================
// MAIN EXECUTION & FINAL SUMMARY
// ============================================================================

function main(): void {
  const t0 = process.hrtime.bigint()

  runPreludeGeometryAndGates()
  const p1 = runPart1()
  runPart2(p1)
  runPart3()

  const elapsedSec = Number(process.hrtime.bigint() - t0) / 1e9
  const memMb = process.memoryUsage().rss / (1024 * 1024)

  console.log('\n========================================================================')
  console.log('WAVE-4 TRACK W17 VERIFICATION LEDGER')
  console.log('========================================================================')
  let passed = 0
  for (const row of CHECKS) {
    if (row.pass) passed++
    console.log(`  [${row.pass ? 'PASS' : 'FAIL'}] ${row.id} ${row.name}`)
    console.log(`         ${row.metric}`)
  }
  console.log('------------------------------------------------------------------------')
  console.log(
    `  TOTAL: ${passed}/${CHECKS.length} CHECKS PASSED | runtime=${elapsedSec.toFixed(3)} s | RSS=${memMb.toFixed(1)} MB`,
  )
  assertExact(passed === CHECKS.length, `${CHECKS.length - passed} check(s) failed`)
}

main()

export {}
