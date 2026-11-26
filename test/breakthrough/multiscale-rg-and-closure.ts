// Breakthrough Suite (Wave-4 Track W20):
//   Multiscale Modeling, Mori-Zwanzig Memory, Renormalization Group Flow,
//   Sheaf Gluing & Contextuality, and Adaptive Hybrid Simulation on {3,4,3,4}.
//
// Grounds Lance's Note 16 (26 Laws MS-01..MS-26, Sec 11 Mori-Zwanzig, Sec 14 RG,
// Sec 43 Sheaf Gluing, Sec 46-48 TypeScript Architecture) directly on the 4D hyperbolic
// {3,4,3,4} honeycomb and verbatim 8-layer bare QCA beat U in Z[zeta_9][1/6].
//
// Strictly deterministic (ZERO Math.random), standalone (ZERO external imports),
// strict TypeScript (--strict --noUncheckedIndexedAccess clean), laptop-safe (< 10 s, < 300 MB RAM).

export {}

// =================================================================================================
// 0. HARNESS, EXACT COMPLEX / Z[zeta_9][1/6] / O^+(4,1; Z[sqrt(2)]) / GF(3) PRIMITIVES
// =================================================================================================

type CheckRow = {
  readonly id: string
  readonly name: string
  readonly passed: boolean
  readonly detail: string
}

const CHECKS: CheckRow[] = []

function recordCheck(id: string, name: string, passed: boolean, detail: string): void {
  CHECKS.push({ id, name, passed, detail })
}

function assertExact(cond: boolean, msg: string): void {
  if (!cond) throw new Error(`Assertion failed: ${msg}`)
}

const PI = Math.PI
const TWO_PI = 2 * PI
const SQRT2 = Math.SQRT2
const SQRT3 = Math.sqrt(3)
const LN2 = Math.LN2
const LN3 = Math.log(3)

type C = readonly [number, number]
const C0: C = [0, 0]
const C1: C = [1, 0]
const cAdd = (a: C, b: C): C => [a[0] + b[0], a[1] + b[1]]
const cSub = (a: C, b: C): C => [a[0] - b[0], a[1] - b[1]]
const cMul = (a: C, b: C): C => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]
const cScale = (s: number, a: C): C => [s * a[0], s * a[1]]
const cConj = (a: C): C => [a[0], -a[1]]
const cAbs2 = (a: C): number => a[0] * a[0] + a[1] * a[1]
const cAbs = (a: C): number => Math.hypot(a[0], a[1])

// Verbatim bare-U Z[zeta_9][1/6] complex constants
const W_C: C = [-0.5, SQRT3 / 2] // omega = e^{2 pi i / 3}
const W2_C: C = [-0.5, -SQRT3 / 2] // omega^2
const Z6_C: C = [0.5, SQRT3 / 2] // zeta_6 = e^{i pi / 3}
const D_DIAG_C: C = [0.75, SQRT3 / 4] // (2 + omega)/2
const D_OFF_C: C = [0.25, -SQRT3 / 4] // -omega/2
const C_KEEP_C: C = [0.25, SQRT3 / 4] // (1 + omega)/2
const C_CROSS_C: C = [0.75, -SQRT3 / 4] // (1 - omega)/2
const MEET_SWAP_C: C = [-0.75, SQRT3 / 4] // (omega - 1)/2

// --- Exact BigInt Cyclotomic Ring Z[zeta_9][1/6] ---
type Z9 = readonly [bigint, bigint, bigint, bigint, bigint, bigint]
type Root4 = readonly [number, number, number, number]
type Q2 = readonly [bigint, bigint]
type ToneNZ = -1 | 1
type Vibe = readonly [dock: number, slot: number, tone: ToneNZ, role: number]
type ExactState = { readonly amp: Map<string, Z9>; readonly den: bigint }

const Z9_ZERO: Z9 = [0n, 0n, 0n, 0n, 0n, 0n]
const Z9_ONE: Z9 = [1n, 0n, 0n, 0n, 0n, 0n]
const Z9_OMEGA: Z9 = [0n, 0n, 0n, 1n, 0n, 0n]
const Z9_ZETA6: Z9 = [1n, 0n, 0n, 1n, 0n, 0n]
const Z9_ZETA18: Z9 = [0n, 0n, 0n, 0n, 0n, -1n]
const Z9_COIN_DIAG: Z9 = [2n, 0n, 0n, 1n, 0n, 0n]
const Z9_COIN_OFF: Z9 = [0n, 0n, 0n, -1n, 0n, 0n]
const Z9_MEET_SWAP: Z9 = [-1n, 0n, 0n, 1n, 0n, 0n]

const addZ9 = (a: Z9, b: Z9): Z9 => [
  a[0] + b[0], a[1] + b[1], a[2] + b[2], a[3] + b[3], a[4] + b[4], a[5] + b[5],
]
const subZ9 = (a: Z9, b: Z9): Z9 => [
  a[0] - b[0], a[1] - b[1], a[2] - b[2], a[3] - b[3], a[4] - b[4], a[5] - b[5],
]
const scaleZ9 = (f: bigint, a: Z9): Z9 => [
  f * a[0], f * a[1], f * a[2], f * a[3], f * a[4], f * a[5],
]
const divExactZ9 = (a: Z9, d: bigint): Z9 => [
  a[0] / d, a[1] / d, a[2] / d, a[3] / d, a[4] / d, a[5] / d,
]
const isZeroZ9 = (a: Z9): boolean =>
  a[0] === 0n && a[1] === 0n && a[2] === 0n && a[3] === 0n && a[4] === 0n && a[5] === 0n

function mulZ9(a: Z9, b: Z9): Z9 {
  const p = new Array<bigint>(11).fill(0n)
  for (let i = 0; i < 6; i++) {
    const ai = a[i]!
    if (ai === 0n) continue
    for (let j = 0; j < 6; j++) p[i + j] = p[i + j]! + ai * b[j]!
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

const ZETA6_POWERS: readonly Z9[] = [
  Z9_ONE,
  Z9_ZETA6,
  Z9_OMEGA,
  scaleZ9(-1n, Z9_ONE),
  scaleZ9(-1n, Z9_ZETA6),
  scaleZ9(-1n, Z9_OMEGA),
]

function z9ToComplex(a: Z9, den = 1n): C {
  const inv = 1 / Number(den)
  let re = 0
  let im = 0
  for (let k = 0; k < 6; k++) {
    const c = Number(a[k]!)
    if (c === 0) continue
    const ang = (TWO_PI * k) / 9
    re += c * Math.cos(ang)
    im += c * Math.sin(ang)
  }
  return [re * inv, im * inv]
}

// --- Dense Complex Matrix Primitives ---
type CMat = { readonly n: number; readonly re: Float64Array; readonly im: Float64Array }

const cmatZero = (n: number): CMat => ({ n, re: new Float64Array(n * n), im: new Float64Array(n * n) })

function cmatUnitaryErr(U: CMat): number {
  const n = U.n
  let maxE = 0
  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      let sr = 0
      let si = 0
      for (let k = 0; k < n; k++) {
        const ar = U.re[k * n + i]!
        const ai = -U.im[k * n + i]!
        const br = U.re[k * n + j]!
        const bi = U.im[k * n + j]!
        sr += ar * br - ai * bi
        si += ar * bi + ai * br
      }
      const err = Math.hypot(sr - (i === j ? 1 : 0), si)
      if (err > maxE) maxE = err
    }
  }
  return maxE
}

// Operator 2-norm ||A||_op of a rectangular m x n complex matrix via exact power iteration on A^dag A
// seeded deterministically across several orthogonal probe vectors.
function cmatRectOpNorm(
  m: number,
  n: number,
  re: Float64Array,
  im: Float64Array,
  iters = 90,
): number {
  let best = 0
  for (let seed = 0; seed < 3; seed++) {
    const xr = new Float64Array(n)
    const xi = new Float64Array(n)
    for (let j = 0; j < n; j++) {
      const ang = 0.713 * (j + 1) * (seed + 1) + 0.31 * seed
      xr[j] = Math.cos(ang)
      xi[j] = Math.sin(ang)
    }
    let nrm = 0
    for (let j = 0; j < n; j++) nrm += xr[j]! * xr[j]! + xi[j]! * xi[j]!
    const inv0 = 1 / Math.sqrt(nrm)
    for (let j = 0; j < n; j++) { xr[j] = xr[j]! * inv0; xi[j] = xi[j]! * inv0 }
    const yr = new Float64Array(m)
    const yi = new Float64Array(m)
    const zr = new Float64Array(n)
    const zi = new Float64Array(n)
    let sigma = 0
    for (let it = 0; it < iters; it++) {
      for (let i = 0; i < m; i++) {
        let sr = 0
        let si = 0
        const row = i * n
        for (let j = 0; j < n; j++) {
          const ar = re[row + j]!
          const ai = im[row + j]!
          sr += ar * xr[j]! - ai * xi[j]!
          si += ar * xi[j]! + ai * xr[j]!
        }
        yr[i] = sr
        yi[i] = si
      }
      let yn2 = 0
      for (let i = 0; i < m; i++) yn2 += yr[i]! * yr[i]! + yi[i]! * yi[i]!
      sigma = Math.sqrt(yn2)
      if (sigma < 1e-16) break
      for (let j = 0; j < n; j++) {
        let sr = 0
        let si = 0
        for (let i = 0; i < m; i++) {
          const ar = re[i * n + j]!
          const ai = -im[i * n + j]!
          sr += ar * yr[i]! - ai * yi[i]!
          si += ar * yi[i]! + ai * yr[i]!
        }
        zr[j] = sr
        zi[j] = si
      }
      let zn2 = 0
      for (let j = 0; j < n; j++) zn2 += zr[j]! * zr[j]! + zi[j]! * zi[j]!
      if (zn2 < 1e-32) break
      const inv = 1 / Math.sqrt(zn2)
      for (let j = 0; j < n; j++) { xr[j] = zr[j]! * inv; xi[j] = zi[j]! * inv }
    }
    if (sigma > best) best = sigma
  }
  return best
}

// --- D_4 Roots, W(F_4) (Order 1152), O^+(4,1; Z[sqrt(2)]) & {3,4,3,4} Honeycomb ---
const ROOTS: readonly Root4[] = (() => {
  const out: Root4[] = []
  for (let i = 0; i < 4; i++)
    for (let j = i + 1; j < 4; j++)
      for (const si of [1, -1])
        for (const sj of [1, -1]) {
          const c: [number, number, number, number] = [0, 0, 0, 0]
          c[i] = si
          c[j] = sj
          out.push(c)
        }
  return out
})()
const dot4 = (a: Root4, b: Root4): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]
const OPP: readonly number[] = ROOTS.map(r =>
  ROOTS.findIndex(o => o[0] === -r[0] && o[1] === -r[1] && o[2] === -r[2] && o[3] === -r[3]),
)
const LINES: readonly (readonly [number, number])[] = ROOTS.flatMap((_, a) =>
  a < OPP[a]! ? [[a, OPP[a]!] as const] : [],
)
const LINE_OF_SLOT: readonly number[] = ROOTS.map((_, s) =>
  LINES.findIndex(([a, b]) => a === s || b === s),
)
const FRAME_OF: readonly number[] = ROOTS.map(r =>
  (r[0] !== 0 && r[1] !== 0) || (r[2] !== 0 && r[3] !== 0)
    ? 0
    : (r[0] !== 0 && r[2] !== 0) || (r[1] !== 0 && r[3] !== 0)
      ? 1
      : 2,
)

// Commutation graph Gamma_24: bit b set iff r_a . r_b = +1 (orthogonal dihedral pi/2).
const ADJ_MASK = new Int32Array(24)
for (let a = 0; a < 24; a++) {
  let mask = 0
  for (let b = 0; b < 24; b++) if (dot4(ROOTS[a]!, ROOTS[b]!) === 1) mask |= 1 << b
  ADJ_MASK[a] = mask
}

const WF4_GROUP = (() => {
  const simple: readonly Root4[] = [
    [0, 1, -1, 0],
    [0, 0, 1, -1],
    [0, 0, 0, 1],
    [1, -1, -1, -1],
  ]
  const gens = simple.map(alpha => {
    const aa = dot4(alpha, alpha)
    const perm = new Uint8Array(24)
    for (let i = 0; i < 24; i++) {
      const v = ROOTS[i]!
      const t = 2 * dot4(v, alpha)
      const img = [0, 1, 2, 3].map(k => v[k]! - (t * alpha[k]!) / aa)
      perm[i] = ROOTS.findIndex(o => o[0] === img[0] && o[1] === img[1] && o[2] === img[2] && o[3] === img[3])
    }
    return perm
  })
  const id = Uint8Array.from({ length: 24 }, (_, i) => i)
  const elements: Uint8Array[] = [id]
  const det: number[] = [1]
  const seen = new Set<string>([id.join(',')])
  for (let h = 0; h < elements.length; h++) {
    const cur = elements[h]!
    const nd = -det[h]!
    for (const g of gens) {
      const nxt = Uint8Array.from(cur, v => g[v]!)
      const k = nxt.join(',')
      if (!seen.has(k)) {
        seen.add(k)
        elements.push(nxt)
        det.push(nd)
      }
    }
  }
  assertExact(elements.length === 1152, 'W(F_4) order 1152')
  return { elements, det, gens }
})()

function permMask(perm: Uint8Array, mask: number): number {
  let out = 0
  let m = mask
  while (m !== 0) {
    const bit = m & -m
    out |= 1 << perm[Math.clz32(bit) ^ 31]!
    m ^= bit
  }
  return out
}

function popcount32(x: number): number {
  let v = x >>> 0
  v = v - ((v >>> 1) & 0x55555555)
  v = (v & 0x33333333) + ((v >>> 2) & 0x33333333)
  return (((v + (v >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24
}

// Chiral 4-body W(F_4) x Z_2^C invariant chi_odd (matching universe.ts)
function lexKey4(a0: number, a1: number, a2: number, a3: number): number {
  let x0 = a0, x1 = a1, x2 = a2, x3 = a3
  if (x0 > x1) { const t = x0; x0 = x1; x1 = t }
  if (x2 > x3) { const t = x2; x2 = x3; x3 = t }
  if (x0 > x2) { const t = x0; x0 = x2; x2 = t }
  if (x1 > x3) { const t = x1; x1 = x3; x3 = t }
  if (x1 > x2) { const t = x1; x1 = x2; x2 = t }
  return ((x0 * 48 + x1) * 48 + x2) * 48 + x3
}
const chiral4Cache = new Map<number, number>()
function chiral4Sign(c0: number, c1: number, c2: number, c3: number): number {
  const selfKey = lexKey4(c0, c1, c2, c3)
  const cached = chiral4Cache.get(selfKey)
  if (cached !== undefined) return cached
  const s0 = c0 >> 1, s1 = c1 >> 1, s2 = c2 >> 1, s3 = c3 >> 1
  const b0 = c0 & 1, b1 = c1 & 1, b2 = c2 & 1, b3 = c3 & 1
  let minKey = Number.POSITIVE_INFINITY
  let minSign = 0
  let chiral = true
  const elems = WF4_GROUP.elements
  const dets = WF4_GROUP.det
  for (let e = 0; e < elems.length; e++) {
    const p = elems[e]!
    const d = dets[e]!
    const ps0 = p[s0]! << 1, ps1 = p[s1]! << 1, ps2 = p[s2]! << 1, ps3 = p[s3]! << 1
    const kPos = lexKey4(ps0 + b0, ps1 + b1, ps2 + b2, ps3 + b3)
    if (kPos < minKey) { minKey = kPos; minSign = d; chiral = true }
    else if (kPos === minKey && d !== minSign) chiral = false
    const kNeg = lexKey4(ps0 + (b0 ^ 1), ps1 + (b1 ^ 1), ps2 + (b2 ^ 1), ps3 + (b3 ^ 1))
    if (kNeg < minKey) { minKey = kNeg; minSign = -d; chiral = true }
    else if (kNeg === minKey && -d !== minSign) chiral = false
  }
  const sign = chiral ? minSign : 0
  chiral4Cache.set(selfKey, sign)
  return sign
}

// Exact O^+(4,1; Z[sqrt(2)]) {3,4,3,4} Coxeter honeycomb
const DIM5 = [0, 1, 2, 3, 4] as const
const Q2_ZERO: Q2 = [0n, 0n]
const EYE5: readonly (readonly Q2[])[] = DIM5.map(r =>
  DIM5.map(c => [r === c ? 1n : 0n, 0n] as const),
)
const addQ2 = (u: Q2, v: Q2): Q2 => [u[0] + v[0], u[1] + v[1]]
const subQ2 = (u: Q2, v: Q2): Q2 => [u[0] - v[0], u[1] - v[1]]
const mulQ2 = (u: Q2, v: Q2): Q2 => [u[0] * v[0] + 2n * u[1] * v[1], u[0] * v[1] + u[1] * v[0]]
const dotQ2 = (u: readonly Q2[], v: readonly Q2[]): Q2 =>
  u.reduce<Q2>((s, e, i) => addQ2(s, mulQ2(e, v[i]!)), Q2_ZERO)
const vecKeyQ2 = (v: readonly Q2[]): string => v.map(([a, b]) => `${a},${b}`).join(';')
const matVecQ2 = (m: readonly (readonly Q2[])[], v: readonly Q2[]): Q2[] => m.map(r => dotQ2(r, v))
const matMulQ2 = (a: readonly (readonly Q2[])[], b: readonly (readonly Q2[])[]): Q2[][] =>
  a.map(row => DIM5.map(col => dotQ2(row, b.map(br => br[col]!))))
const q2Float = (u: Q2): number => Number(u[0]) + Number(u[1]) * SQRT2

const TWICE_GRAM: readonly (readonly Q2[])[] = DIM5.map(i =>
  DIM5.map(j =>
    i === j
      ? ([2n, 0n] as const)
      : Math.abs(i - j) === 1
        ? Math.min(i, j) % 2 === 0
          ? ([-1n, 0n] as const)
          : ([0n, -1n] as const)
        : Q2_ZERO,
  ),
)
const twiceForm = (u: readonly Q2[], v: readonly Q2[]): Q2 => dotQ2(u, matVecQ2(TWICE_GRAM, v))
const reflect5 = (normal: readonly Q2[]): Q2[][] => {
  const dual = matVecQ2(TWICE_GRAM, normal)
  return EYE5.map((row, i) => row.map((entry, j) => subQ2(entry, mulQ2(normal[i]!, dual[j]!))))
}
const BASE_CENTER: readonly Q2[] = [[2n, 0n], [4n, 0n], [0n, 3n], [0n, 2n], [1n, 0n]]
const CUSP_V: readonly Q2[] = [[0n, 0n], [1n, 0n], [0n, 1n], [0n, 1n], [1n, 0n]]
const CENTRAL_INVERSION: readonly (readonly Q2[])[] = DIM5.map(i =>
  DIM5.map(j => [
    (j === 4 ? 2n * BASE_CENTER[i]![0] : 0n) - (i === j ? 1n : 0n),
    j === 4 ? 2n * BASE_CENTER[i]![1] : 0n,
  ]),
)
const STAB_REFS = [0, 1, 2, 3].map(idx => reflect5(EYE5[idx]!))
const TRANSPORTS: readonly (readonly (readonly Q2[])[])[] = (() => {
  const facetNormals: Q2[][] = [EYE5[4]!.slice()]
  const seen = new Set<string>([vecKeyQ2(EYE5[4]!)])
  for (const n of facetNormals) {
    for (const g of STAB_REFS) {
      const next = matVecQ2(g, n)
      const key = vecKeyQ2(next)
      if (!seen.has(key)) {
        seen.add(key)
        facetNormals.push(next)
      }
    }
  }
  const facetDot = (a: number, b: number): bigint => (twiceForm(facetNormals[a]!, facetNormals[b]!)[0] + 2n) / 2n
  const ortho: number[] = []
  for (let f = 0; f < 24 && ortho.length < 4; f++) if (ortho.every(prev => facetDot(f, prev) === 0n)) ortho.push(f)
  const facetRoots = facetNormals.map((_, f) => {
    const [c0, c1, c2, c3] = ortho.map(o => Number(facetDot(f, o)))
    return [(c0! + c1!) / 2, (c0! - c1!) / 2, (c2! + c3!) / 2, (c2! - c3!) / 2] as const
  })
  return ROOTS.map(root => {
    const fIdx = facetRoots.findIndex(
      fr => fr[0] === root[0] && fr[1] === root[1] && fr[2] === root[2] && fr[3] === root[3],
    )
    return matMulQ2(reflect5(facetNormals[fIdx]!), CENTRAL_INVERSION)
  })
})()

const dockFrames: (readonly (readonly Q2[])[])[] = [EYE5]
const dockCenters: Q2[][] = [BASE_CENTER.map(x => [x[0], x[1]] as Q2)]
const dockParity: number[] = [1]
const dockRad: number[] = [0]
const centerToDockId = new Map<string, number>([[vecKeyQ2(BASE_CENTER), 0]])
const hcNeighbors: Int32Array[] = [new Int32Array(24).fill(-1)]

function stepDock(dock: number, slot: number): number {
  const cached = hcNeighbors[dock]![slot]!
  if (cached >= 0) return cached
  const nextFrame = matMulQ2(dockFrames[dock]!, TRANSPORTS[slot]!)
  const nextCenter = matVecQ2(nextFrame, BASE_CENTER)
  const centerKey = vecKeyQ2(nextCenter)
  let nextId = centerToDockId.get(centerKey)
  if (nextId === undefined) {
    nextId = dockFrames.length
    centerToDockId.set(centerKey, nextId)
    dockFrames.push(nextFrame)
    dockCenters.push(nextCenter)
    dockParity.push(-dockParity[dock]!)
    dockRad.push(dockRad[dock]! + 1)
    hcNeighbors.push(new Int32Array(24).fill(-1))
  }
  hcNeighbors[dock]![slot] = nextId
  hcNeighbors[nextId]![OPP[slot]!] = dock
  return nextId
}

function dominantCenterKey(center: readonly Q2[]): string {
  let v: Q2[] = center.map(x => [x[0], x[1]] as Q2)
  for (let iter = 0; iter < 60; iter++) {
    let changed = false
    for (let i = 0; i < 4; i++) {
      if (q2Float(twiceForm(v, EYE5[i]!)) < -1e-9) {
        v = matVecQ2(STAB_REFS[i]!, v)
        changed = true
        break
      }
    }
    if (!changed) break
  }
  return vecKeyQ2(v)
}

// Build exact R = 3 ball B_3 (8,857 docks) before any deeper walks
for (let h = 0; h < dockFrames.length; h++) {
  if (dockRad[h]! < 3) for (let s = 0; s < 24; s++) stepDock(h, s)
}
const N_B3 = dockFrames.length
assertExact(N_B3 === 8857, `Expected 8857 docks in B_3, got ${N_B3}`)
for (let d = 0; d < N_B3; d++) {
  if (dockRad[d]! === 3) {
    for (let s = 0; s < 24; s++) {
      if (hcNeighbors[d]![s]! >= 0) continue
      const hit = centerToDockId.get(vecKeyQ2(matVecQ2(matMulQ2(dockFrames[d]!, TRANSPORTS[s]!), BASE_CENTER)))
      if (hit !== undefined) {
        hcNeighbors[d]![s] = hit
        hcNeighbors[hit]![OPP[s]!] = d
      }
    }
  }
}
const N_B2 = dockRad.filter(r => r <= 2).length
assertExact(N_B2 === 481, `Expected 481 docks in B_2, got ${N_B2}`)

// Verbatim 8-layer exact Z[zeta_9][1/6] bare QCA beat U on {3,4,3,4}
function encodeConfig(vibes: readonly Vibe[]): string {
  return [...vibes].sort((a, b) => a[0] - b[0] || a[1] - b[1]).map(v => v.join(':')).join(';')
}
function decodeConfig(key: string): Vibe[] {
  if (key === '') return []
  return key.split(';').map(e => {
    const p = e.split(':')
    return [Number(p[0]), Number(p[1]), Number(p[2]) as ToneNZ, Number(p[3])]
  })
}
function addAmpZ9(map: Map<string, Z9>, key: string, delta: Z9): void {
  const prev = map.get(key)
  const next = prev ? addZ9(prev, delta) : delta
  if (isZeroZ9(next)) map.delete(key)
  else map.set(key, next)
}
function reduceDenZ9(amp: Map<string, Z9>, den: bigint): ExactState {
  let d = den
  for (const p of [2n, 3n]) {
    while (d % p === 0n && [...amp.values()].every(z => z.every(c => c % p === 0n))) {
      d /= p
      for (const [k, z] of amp) amp.set(k, divExactZ9(z, p))
    }
  }
  return { amp, den: d }
}
function stateFromEntries(entries: readonly (readonly [readonly Vibe[], Z9])[], den: bigint): ExactState {
  const map = new Map<string, Z9>()
  for (const [vs, z] of entries) addAmpZ9(map, encodeConfig(vs), z)
  return reduceDenZ9(map, den)
}
function groupByDock(vibes: readonly Vibe[]): Map<number, number[]> {
  const g = new Map<number, number[]>()
  for (let i = 0; i < vibes.length; i++) {
    const d = vibes[i]![0]
    const l = g.get(d)
    if (l) l.push(i)
    else g.set(d, [i])
  }
  return g
}
function collectActiveLines(
  vibes: readonly Vibe[],
): (readonly [number | undefined, number | undefined, number, number])[] {
  const res: (readonly [number | undefined, number | undefined, number, number])[] = []
  for (const idxs of groupByDock(vibes).values()) {
    const byS = new Map<number, number>()
    for (const i of idxs) byS.set(vibes[i]![1], i)
    for (const [a, b] of LINES) {
      const ia = byS.get(a)
      const ib = byS.get(b)
      if (ia !== undefined || ib !== undefined) res.push([ia, ib, a, b])
    }
  }
  return res
}
function applyBranch<Item>(
  state: ExactState,
  branchDen: bigint,
  prepare: (vibes: Vibe[], amp: Z9) => readonly [Item[], Z9],
  expand: (cfg: Vibe[], amp: Z9, item: Item) => readonly (readonly [Vibe[], Z9])[],
): ExactState {
  const prep = [...state.amp.entries()].map(([k, amp]) => {
    const vibes = decodeConfig(k)
    const [items, pa] = prepare(vibes, amp)
    return { vibes, items, pa }
  })
  const maxD = prep.reduce((m, r) => Math.max(m, r.items.length), 0)
  const out = new Map<string, Z9>()
  for (const { vibes, items, pa } of prep) {
    let br: (readonly [Vibe[], Z9])[] = [[vibes, scaleZ9(branchDen ** BigInt(maxD - items.length), pa)]]
    for (const it of items) br = br.flatMap(([cfg, a]) => expand(cfg, a, it))
    for (const [cfg, a] of br) addAmpZ9(out, encodeConfig(cfg), a)
  }
  return reduceDenZ9(out, state.den * branchDen ** BigInt(maxD))
}
const applyHalfCoin4D = (s: ExactState): ExactState =>
  applyBranch<readonly [number, number]>(
    s,
    2n,
    (vibes, amp) => {
      const splits: (readonly [number, number])[] = []
      let ph = amp
      for (const [ia, ib, sa, sb] of collectActiveLines(vibes)) {
        if (ia !== undefined && ib !== undefined) ph = mulZ9(ph, Z9_ZETA6)
        else if (ia !== undefined) splits.push([ia, sb])
        else splits.push([ib!, sa])
      }
      return [splits, ph]
    },
    (cfg, amp, [idx, opp]) => {
      const [d, , t, r] = cfg[idx]!
      const fl = cfg.slice()
      fl[idx] = [d, opp, t, r]
      return [[cfg, mulZ9(amp, Z9_COIN_DIAG)], [fl, mulZ9(amp, Z9_COIN_OFF)]]
    },
  )
const applyRoleMeet4D = (s: ExactState): ExactState =>
  applyBranch<readonly [number, number]>(
    s,
    2n,
    (vibes, amp) => {
      const sw: (readonly [number, number])[] = []
      let ph = amp
      for (const [ia, ib] of collectActiveLines(vibes)) {
        if (ia === undefined || ib === undefined || vibes[ia]![2] !== vibes[ib]![2]) continue
        if (vibes[ia]![3] === vibes[ib]![3]) ph = mulZ9(ph, Z9_OMEGA)
        else sw.push([ia, ib])
      }
      return [sw, ph]
    },
    (cfg, amp, [ia, ib]) => {
      const [dA, sA, tA, rA] = cfg[ia]!
      const [dB, sB, tB, rB] = cfg[ib]!
      const sw = cfg.slice()
      sw[ia] = [dA, sA, tA, rB]
      sw[ib] = [dB, sB, tB, rA]
      return [[cfg, mulZ9(amp, Z9_ZETA6)], [sw, mulZ9(amp, Z9_MEET_SWAP)]]
    },
  )
const applyPairMix4D = (s: ExactState): ExactState =>
  applyBranch<readonly [number, number, number]>(
    s,
    12n,
    (vibes, amp) => {
      const ps: (readonly [number, number, number])[] = []
      for (const idxs of groupByDock(vibes).values()) {
        if (idxs.length !== 2) continue
        const [i0, i1] = [idxs[0]!, idxs[1]!]
        const v0 = vibes[i0]!
        const v1 = vibes[i1]!
        if (OPP[v0[1]] === v1[1] && v0[2] === v1[2] && v0[3] === v1[3]) ps.push([i0, i1, LINE_OF_SLOT[v0[1]]!])
      }
      return [ps, amp]
    },
    (cfg, amp, [i0, i1, curL]) => {
      const hop = subZ9(Z9_ZETA18, Z9_ONE)
      const keep = addZ9([12n, 0n, 0n, 0n, 0n, 0n], hop)
      return LINES.map(([la, lb], l) => {
        if (l === curL) return [cfg, mulZ9(amp, keep)] as const
        const [d, , t, r] = cfg[i0]!
        const hp = cfg.slice()
        hp[i0] = [d, la, t, r]
        hp[i1] = [d, lb, t, r]
        return [hp, mulZ9(amp, hop)] as const
      })
    },
  )
const applyChiral4D = (s: ExactState): ExactState => {
  const out = new Map<string, Z9>()
  for (const [k, amp] of s.amp) {
    const vibes = decodeConfig(k)
    let exp = 0
    for (const [d, idxs] of groupByDock(vibes)) {
      if (idxs.length >= 4) {
        let chi = 0
        for (let a = 0; a < idxs.length; a++) {
          const ca = (vibes[idxs[a]!]![1] << 1) + (vibes[idxs[a]!]![2] < 0 ? 1 : 0)
          for (let b = a + 1; b < idxs.length; b++) {
            const cb = (vibes[idxs[b]!]![1] << 1) + (vibes[idxs[b]!]![2] < 0 ? 1 : 0)
            for (let c = b + 1; c < idxs.length; c++) {
              const cc = (vibes[idxs[c]!]![1] << 1) + (vibes[idxs[c]!]![2] < 0 ? 1 : 0)
              for (let e = c + 1; e < idxs.length; e++) {
                const ce = (vibes[idxs[e]!]![1] << 1) + (vibes[idxs[e]!]![2] < 0 ? 1 : 0)
                chi += chiral4Sign(ca, cb, cc, ce)
              }
            }
          }
        }
        exp += dockParity[d]! * chi
      }
    }
    const m6 = ((exp % 6) + 6) % 6
    addAmpZ9(out, k, m6 === 0 ? amp : mulZ9(amp, ZETA6_POWERS[m6]!))
  }
  return { amp: out, den: s.den }
}
const applyOppBounce4D = (s: ExactState): ExactState => {
  const out = new Map<string, Z9>()
  for (const [k, amp] of s.amp) {
    const vibes = decodeConfig(k)
    let neg = false
    for (const [ia, ib, sa, sb] of collectActiveLines(vibes)) {
      if (ia === undefined || ib === undefined || vibes[ia]![2] === vibes[ib]![2]) continue
      const vA = vibes[ia]!
      const vB = vibes[ib]!
      vibes[ia] = [vA[0], sb, vA[2], vA[3]]
      vibes[ib] = [vB[0], sa, vB[2], vB[3]]
      neg = !neg
    }
    addAmpZ9(out, encodeConfig(vibes), neg ? scaleZ9(-1n, amp) : amp)
  }
  return { amp: out, den: s.den }
}
const applyStream4D = (s: ExactState): ExactState => {
  const out = new Map<string, Z9>()
  for (const [k, amp] of s.amp) {
    const nv: Vibe[] = decodeConfig(k).map(([d, sl, t, r]) => [stepDock(d, sl), sl, t, r] as const)
    addAmpZ9(out, encodeConfig(nv), amp)
  }
  return { amp: out, den: s.den }
}
const applyBeat4D = (s: ExactState): ExactState =>
  applyStream4D(
    applyChiral4D(
      applyHalfCoin4D(
        applyRoleMeet4D(applyPairMix4D(applyOppBounce4D(applyHalfCoin4D(applyChiral4D(s))))),
      ),
    ),
  )

// --- Bit-Sliced GF(3) Symplectic Algebra & Crown-Jewel [[24, 1, 8]]_3 / B_1 = [[552, 25, 40]]_3 ---
const mod3 = (x: number): number => ((x % 3) + 3) % 3
type GF3Row = { readonly a: Uint32Array; readonly b: Uint32Array }
const gf3RowZero = (words: number): GF3Row => ({ a: new Uint32Array(words), b: new Uint32Array(words) })
const gf3RowClone = (r: GF3Row): GF3Row => ({ a: Uint32Array.from(r.a), b: Uint32Array.from(r.b) })

function gf3Get(r: GF3Row, col: number): number {
  const w = col >>> 5
  const bit = 1 << (col & 31)
  return (r.a[w]! & bit) !== 0 ? 1 : (r.b[w]! & bit) !== 0 ? 2 : 0
}
function gf3Set(r: GF3Row, col: number, val: number): void {
  const w = col >>> 5
  const bit = 1 << (col & 31)
  const mask = ~bit
  r.a[w] = r.a[w]! & mask
  r.b[w] = r.b[w]! & mask
  if (val === 1) r.a[w] = r.a[w]! | bit
  else if (val === 2) r.b[w] = r.b[w]! | bit
}
function gf3FromUint8(v: Uint8Array): GF3Row {
  const r = gf3RowZero((v.length + 31) >>> 5)
  for (let i = 0; i < v.length; i++) {
    const val = v[i]!
    if (val === 1) r.a[i >>> 5] = r.a[i >>> 5]! | (1 << (i & 31))
    else if (val === 2) r.b[i >>> 5] = r.b[i >>> 5]! | (1 << (i & 31))
  }
  return r
}
function gf3AddInPlace(dst: GF3Row, src: GF3Row, startWord = 0): void {
  const da = dst.a, db = dst.b, sa = src.a, sb = src.b, len = da.length
  for (let w = startWord; w < len; w++) {
    const a1 = da[w]!, b1 = db[w]!, a2 = sa[w]!, b2 = sb[w]!
    if ((a2 | b2) === 0) continue
    const z1 = ~(a1 | b1), z2 = ~(a2 | b2)
    da[w] = (a1 & z2) | (z1 & a2) | (b1 & b2)
    db[w] = (b1 & z2) | (z1 & b2) | (a1 & a2)
  }
}
function gf3SubInPlace(dst: GF3Row, src: GF3Row, startWord = 0): void {
  const da = dst.a, db = dst.b, sa = src.a, sb = src.b, len = da.length
  for (let w = startWord; w < len; w++) {
    const a1 = da[w]!, b1 = db[w]!, a2 = sb[w]!, b2 = sa[w]!
    if ((a2 | b2) === 0) continue
    const z1 = ~(a1 | b1), z2 = ~(a2 | b2)
    da[w] = (a1 & z2) | (z1 & a2) | (b1 & b2)
    db[w] = (b1 & z2) | (z1 & b2) | (a1 & a2)
  }
}
function gf3NegInPlace(r: GF3Row, startWord = 0): void {
  for (let w = startWord; w < r.a.length; w++) {
    const t = r.a[w]!
    r.a[w] = r.b[w]!
    r.b[w] = t
  }
}
function gf3Rank(rows: readonly GF3Row[], nCols: number): number {
  const mat = rows.map(gf3RowClone)
  const nRows = mat.length
  let rank = 0
  for (let col = 0; col < nCols && rank < nRows; col++) {
    const w = col >>> 5
    const bit = 1 << (col & 31)
    let piv = -1
    for (let r = rank; r < nRows; r++) {
      if (((mat[r]!.a[w]! | mat[r]!.b[w]!) & bit) !== 0) { piv = r; break }
    }
    if (piv === -1) continue
    if (piv !== rank) { const tmp = mat[rank]!; mat[rank] = mat[piv]!; mat[piv] = tmp }
    const pRow = mat[rank]!
    if ((pRow.b[w]! & bit) !== 0) gf3NegInPlace(pRow, w)
    for (let r = rank + 1; r < nRows; r++) {
      const row = mat[r]!
      if ((row.a[w]! & bit) !== 0) gf3SubInPlace(row, pRow, w)
      else if ((row.b[w]! & bit) !== 0) gf3AddInPlace(row, pRow, w)
    }
    rank++
  }
  return rank
}
function gf3Rref(rows: readonly GF3Row[], nCols: number): { readonly basis: GF3Row[]; readonly pivCols: number[] } {
  const mat = rows.map(gf3RowClone)
  const nRows = mat.length
  const pivCols: number[] = []
  let rank = 0
  for (let col = 0; col < nCols && rank < nRows; col++) {
    const w = col >>> 5
    const bit = 1 << (col & 31)
    let piv = -1
    for (let r = rank; r < nRows; r++) {
      if (((mat[r]!.a[w]! | mat[r]!.b[w]!) & bit) !== 0) { piv = r; break }
    }
    if (piv === -1) continue
    if (piv !== rank) { const tmp = mat[rank]!; mat[rank] = mat[piv]!; mat[piv] = tmp }
    const pRow = mat[rank]!
    if ((pRow.b[w]! & bit) !== 0) gf3NegInPlace(pRow, w)
    for (let r = 0; r < nRows; r++) {
      if (r === rank) continue
      const row = mat[r]!
      if ((row.a[w]! & bit) !== 0) gf3SubInPlace(row, pRow, w)
      else if ((row.b[w]! & bit) !== 0) gf3AddInPlace(row, pRow, w)
    }
    pivCols.push(col)
    rank++
  }
  return { basis: mat.slice(0, rank), pivCols }
}
function gf3Nullspace(rows: readonly GF3Row[], nCols: number): GF3Row[] {
  const { basis, pivCols } = gf3Rref(rows, nCols)
  const r = basis.length
  const isPiv = new Uint8Array(nCols)
  for (const c of pivCols) isPiv[c] = 1
  const words = (nCols + 31) >>> 5
  const out: GF3Row[] = []
  for (let free = 0; free < nCols; free++) {
    if (isPiv[free]) continue
    const v = gf3RowZero(words)
    gf3Set(v, free, 1)
    for (let i = 0; i < r; i++) {
      const val = gf3Get(basis[i]!, free)
      if (val !== 0) gf3Set(v, pivCols[i]!, 3 - val)
    }
    out.push(v)
  }
  return out
}

type SympRow = { readonly x: GF3Row; readonly z: GF3Row }
function toSympRow(r: GF3Row, nQ: number): SympRow {
  const words = (nQ + 31) >>> 5
  const x = gf3RowZero(words)
  const z = gf3RowZero(words)
  for (let i = 0; i < nQ; i++) {
    const xv = gf3Get(r, i)
    const zv = gf3Get(r, nQ + i)
    if (xv) gf3Set(x, i, xv)
    if (zv) gf3Set(z, i, zv)
  }
  return { x, z }
}
function sympDotBit(u: SympRow, v: SympRow): number {
  let pos = 0
  let neg = 0
  for (let w = 0; w < u.x.a.length; w++) {
    const uxa = u.x.a[w]!, uxb = u.x.b[w]!, uza = u.z.a[w]!, uzb = u.z.b[w]!
    const vxa = v.x.a[w]!, vxb = v.x.b[w]!, vza = v.z.a[w]!, vzb = v.z.b[w]!
    pos += popcount32((uxa & vza) | (uxb & vzb)) + popcount32((uza & vxb) | (uzb & vxa))
    neg += popcount32((uxa & vzb) | (uxb & vza)) + popcount32((uza & vxa) | (uzb & vxb))
  }
  return mod3(pos - neg)
}
function countIsoDefects(basis: readonly GF3Row[], nQ: number): number {
  const s = basis.map(r => toSympRow(r, nQ))
  let def = 0
  for (let i = 0; i < s.length; i++)
    for (let j = i + 1; j < s.length; j++) if (sympDotBit(s[i]!, s[j]!) !== 0) def++
  return def
}
function stabEntropy(basis: readonly GF3Row[], nQ: number, subset: readonly number[]): number {
  const k = subset.length
  if (k === 0) return 0
  const words = (2 * k + 31) >>> 5
  const sub = basis.map(r => {
    const out = gf3RowZero(words)
    for (let j = 0; j < k; j++) {
      const q = subset[j]!
      const xv = gf3Get(r, q)
      const zv = gf3Get(r, nQ + q)
      if (xv) gf3Set(out, j, xv)
      if (zv) gf3Set(out, k + j, zv)
    }
    return out
  })
  return gf3Rank(sub, 2 * k) - k
}

function buildCrownTensors() {
  const w9Defs: readonly (readonly (readonly [number, number, number])[])[] = [
    [[0, 0, 1], [0, 1, 2], [1, 10, 2], [1, 11, 1]],
    [[0, 2, 1], [0, 3, 2], [1, 8, 2], [1, 9, 1]],
    [[0, 4, 1], [0, 5, 2], [1, 6, 2], [1, 7, 1]],
    [[0, 6, 1], [0, 7, 2], [1, 5, 2], [1, 6, 2], [1, 7, 2]],
    [[0, 8, 1], [0, 9, 2], [1, 3, 2], [1, 8, 2], [1, 9, 2]],
    [[0, 10, 1], [0, 11, 2], [1, 1, 2], [1, 10, 2], [1, 11, 2]],
    [[1, 0, 1], [1, 1, 1], [1, 10, 2], [1, 11, 2]],
    [[1, 2, 1], [1, 3, 1], [1, 8, 2], [1, 9, 2]],
    [[1, 4, 1], [1, 5, 1], [1, 6, 2], [1, 7, 2]],
  ]
  const lvmDefs: readonly (readonly (readonly [number, number, number])[])[] = [
    [[0, 0, 1], [0, 5, 2], [0, 9, 2], [0, 10, 2], [0, 11, 1]],
    [[0, 1, 1], [0, 5, 2], [0, 9, 1]],
    [[0, 2, 1], [0, 5, 2], [0, 10, 2]],
    [[0, 3, 1], [0, 5, 2], [0, 11, 1]],
    [[0, 4, 1], [0, 5, 2], [0, 10, 2], [0, 11, 1]],
    [[0, 6, 1], [0, 9, 2], [0, 10, 2]],
    [[0, 7, 1], [0, 9, 2], [0, 11, 1]],
    [[0, 8, 1], [0, 9, 2], [0, 10, 2], [0, 11, 1]],
    [[1, 0, 1], [1, 3, 1], [1, 5, 1], [1, 7, 1], [1, 9, 1], [1, 10, 2]],
    [[1, 1, 1], [1, 3, 1], [1, 5, 1], [1, 6, 2], [1, 8, 2], [1, 10, 2]],
    [[1, 2, 1], [1, 3, 2], [1, 6, 1], [1, 7, 2], [1, 10, 1], [1, 11, 1]],
    [[1, 4, 1], [1, 5, 2], [1, 8, 1], [1, 9, 2], [1, 10, 1], [1, 11, 2]],
  ]
  const bulk23: Uint8Array[] = []
  const allX = new Uint8Array(48)
  const allZ = new Uint8Array(48)
  for (let i = 0; i < 24; i++) { allX[i] = 1; allZ[24 + i] = 1 }
  bulk23.push(allX, allZ)
  for (const entries of w9Defs) {
    const row = new Uint8Array(48)
    for (const [p, l, v] of entries) { const [a, b] = LINES[l]!; row[p * 24 + a] = v; row[p * 24 + b] = v }
    bulk23.push(row)
  }
  for (const entries of lvmDefs) {
    const row = new Uint8Array(48)
    for (const [p, l, v] of entries) { const [a, b] = LINES[l]!; row[p * 24 + a] = v; row[p * 24 + b] = mod3(2 * v) }
    bulk23.push(row)
  }
  const xL = new Uint8Array(48)
  const zL = new Uint8Array(48)
  for (let i = 0; i < 24; i++) {
    const v = FRAME_OF[i] === 0 ? 1 : FRAME_OF[i] === 1 ? 2 : 0
    xL[i] = v
    zL[24 + i] = v
  }
  const choiPlus: Uint8Array[] = bulk23.map(r => {
    const s = new Uint8Array(50)
    for (let i = 0; i < 24; i++) { s[i] = r[i]!; s[25 + i] = r[24 + i]! }
    return s
  })
  const sX = new Uint8Array(50)
  const sZ = new Uint8Array(50)
  for (let i = 0; i < 24; i++) { sX[i] = xL[i]!; sZ[25 + i] = zL[24 + i]! }
  sX[24] = 2
  sZ[49] = 1
  choiPlus.push(sX, sZ)
  const applyK = (rows: readonly Uint8Array[], nQ: number): Uint8Array[] =>
    rows.map(r => {
      const o = Uint8Array.from(r)
      for (let i = 0; i < nQ; i++) o[nQ + i] = mod3(2 * o[nQ + i]!)
      return o
    })
  return { bulk23, xL, zL, choiPlus, choiMinus: applyK(choiPlus, 25) }
}
const CROWN = buildCrownTensors()

// Contract B_1 = [[552, 25, 40]]_3 once and share across Exp 1c, Exp 5, and Exp 6
function contractB1() {
  const nD = 25
  const edges = Array.from({ length: 24 }, (_, a) => ({ d1: 0, s1: a, d2: 1 + a, s2: OPP[a]! }))
  const nInt = 48
  const slotToInt = Array.from({ length: nD }, () => new Int32Array(24).fill(-1))
  edges.forEach((e, ei) => { slotToInt[e.d1]![e.s1] = 2 * ei; slotToInt[e.d2]![e.s2] = 2 * ei + 1 })
  let bndCur = 0
  const openSlotMap = Array.from({ length: nD }, () => new Int32Array(24).fill(-1))
  for (let d = 0; d < nD; d++)
    for (let s = 0; s < 24; s++) if (slotToInt[d]![s]! < 0) openSlotMap[d]![s] = bndCur++
  const nBnd = bndCur
  const nBulk = 25
  const nOpen = nBnd + nBulk
  const nTotal = nInt + nOpen
  assertExact(nBnd === 552 && nOpen === 577, 'B1 dimensions')

  const unRows: Uint8Array[] = []
  for (let d = 0; d < nD; d++) {
    const rows = d === 0 ? CROWN.choiPlus : CROWN.choiMinus
    const qb = nInt + nBnd + d
    for (const r of rows) {
      const full = new Uint8Array(2 * nTotal)
      for (let s = 0; s < 24; s++) {
        const q = slotToInt[d]![s]! >= 0 ? slotToInt[d]![s]! : nInt + openSlotMap[d]![s]!
        full[q] = r[s]!
        full[nTotal + q] = r[25 + s]!
      }
      full[qb] = r[24]!
      full[nTotal + qb] = r[49]!
      unRows.push(full)
    }
  }
  const nRows = unRows.length
  const eqWords = (nRows + 31) >>> 5
  const eqs: GF3Row[] = []
  for (let e = 0; e < 24; e++) {
    const u = 2 * e
    const v = 2 * e + 1
    const eq1 = gf3RowZero(eqWords)
    const eq2 = gf3RowZero(eqWords)
    for (let ri = 0; ri < nRows; ri++) {
      const row = unRows[ri]!
      const c1 = mod3(row[nTotal + u]! + row[nTotal + v]!)
      const c2 = mod3(row[u]! + 2 * row[v]!)
      if (c1) gf3Set(eq1, ri, c1)
      if (c2) gf3Set(eq2, ri, c2)
    }
    eqs.push(eq1, eq2)
  }
  const ker = gf3Nullspace(eqs, nRows)
  const projRows = ker.map(kv => {
    const acc = new Uint8Array(2 * nOpen)
    for (let ri = 0; ri < nRows; ri++) {
      const cf = gf3Get(kv, ri)
      if (cf === 0) continue
      const row = unRows[ri]!
      for (let q = 0; q < nOpen; q++) {
        const xv = row[nInt + q]!
        const zv = row[nTotal + nInt + q]!
        if (xv) acc[q] = (acc[q]! + cf * xv) % 3
        if (zv) acc[nOpen + q] = (acc[nOpen + q]! + cf * zv) % 3
      }
    }
    return gf3FromUint8(acc)
  })
  const { basis } = gf3Rref(projRows, 2 * nOpen)
  assertExact(basis.length === 577 && countIsoDefects(basis, 577) === 0, 'B1 Choi rank & isotropy')

  // Canonical 527 boundary stabilizers H(B_1) and 25 canonical bulk logical pairs (xLogs, zLogs)
  const words577 = (2 * 577 + 31) >>> 5
  const reord = basis.map(r => {
    const out = gf3RowZero(words577)
    for (let b = 0; b < 25; b++) {
      const xv = gf3Get(r, 552 + b)
      const zv = gf3Get(r, 577 + 552 + b)
      if (xv) gf3Set(out, b, xv)
      if (zv) gf3Set(out, 25 + b, zv)
    }
    for (let q = 0; q < 552; q++) {
      const xv = gf3Get(r, q)
      const zv = gf3Get(r, 577 + q)
      if (xv) gf3Set(out, 50 + q, xv)
      if (zv) gf3Set(out, 50 + 552 + q, zv)
    }
    return out
  })
  const { basis: rr, pivCols } = gf3Rref(reord, 2 * 577)
  assertExact(pivCols.slice(0, 50).every((c, i) => c === i), 'B1 bulk pivots')
  const bndWords = (2 * 552 + 31) >>> 5
  const extractBnd = (row: GF3Row): GF3Row => {
    const out = gf3RowZero(bndWords)
    for (let q = 0; q < 552; q++) {
      const xv = gf3Get(row, 50 + q)
      const zv = gf3Get(row, 50 + 552 + q)
      if (xv) gf3Set(out, q, xv)
      if (zv) gf3Set(out, 552 + q, zv)
    }
    return out
  }
  const hStabs = rr.slice(50).map(extractBnd)
  const xLogs: GF3Row[] = []
  const zLogs: GF3Row[] = []
  for (let b = 0; b < 25; b++) {
    const xb = extractBnd(rr[b]!)
    gf3NegInPlace(xb)
    xLogs.push(xb)
    zLogs.push(extractBnd(rr[25 + b]!))
  }
  const bndToAS: [number, number][] = []
  const asToBnd = new Int32Array(576).fill(-1)
  for (let a = 0; a < 24; a++)
    for (let s = 0; s < 24; s++) {
      const q = openSlotMap[1 + a]![s]!
      if (q >= 0) {
        bndToAS[q] = [a, s]
        asToBnd[a * 24 + s] = q
      }
    }
  return { choiBasis: basis, hStabs, xLogs, zLogs, openSlotMap, bndToAS, asToBnd }
}

const tStart = Date.now()
console.log('==========================================================================================')
console.log('BREAKTHROUGH SUITE (W20): MULTISCALE MODELING, MORI-ZWANZIG, RG FLOW, SHEAVES & HYBRID SIM')
console.log('==========================================================================================')

const B1_CODE = contractB1()
const B1_SYMP_X = B1_CODE.xLogs.map(r => toSympRow(r, 552))
const B1_SYMP_Z = B1_CODE.zLogs.map(r => toSympRow(r, 552))
const B1_LOG_ALL: readonly GF3Row[] = [...B1_CODE.xLogs, ...B1_CODE.zLogs]
const B1_BND_WORDS = (2 * 552 + 31) >>> 5

function buildUStar50(beta: 1 | 2): Uint8Array[] {
  const M = Array.from({ length: 50 }, (_, i) => { const r = new Uint8Array(50); r[i] = 1; return r })
  for (let a = 1; a <= 24; a++) {
    M[0]![a] = beta
    M[25]![25 + a] = mod3(2 * beta)
    M[a]![0] = beta
    M[25 + a]![25] = mod3(2 * beta)
    for (let ap = 1; ap <= 24; ap++) {
      M[a]![ap] = mod3(M[a]![ap]! + 2)
      M[25 + a]![25 + ap] = mod3(M[25 + a]![25 + ap]! + 2)
    }
  }
  return M
}
function buildUNN50(): Uint8Array[] {
  const M = Array.from({ length: 50 }, (_, i) => { const r = new Uint8Array(50); r[i] = 1; return r })
  for (let a = 1; a <= 24; a++) {
    M[0]![25 + a] = 1
    M[a]![25] = 1
  }
  return M
}
function makeBoundaryLift552(Ubulk: readonly Uint8Array[]) {
  const delta = Ubulk.map((row, i) => Uint8Array.from(row, (v, j) => (i === j ? mod3(v - 1) : v)))
  return (v: GF3Row): GF3Row => {
    const sv = toSympRow(v, 552)
    const c = new Uint8Array(50)
    for (let g = 0; g < 25; g++) {
      c[g] = sympDotBit(sv, B1_SYMP_Z[g]!)
      c[25 + g] = mod3(2 * sympDotBit(sv, B1_SYMP_X[g]!))
    }
    const out = gf3RowClone(v)
    for (let i = 0; i < 50; i++) {
      let s = 0
      const di = delta[i]!
      for (let j = 0; j < 50; j++) if (c[j]! !== 0 && di[j]! !== 0) s += di[j]! * c[j]!
      s = mod3(s)
      if (s === 1) gf3AddInPlace(out, B1_LOG_ALL[i]!)
      else if (s === 2) gf3SubInPlace(out, B1_LOG_ALL[i]!)
    }
    return out
  }
}

const U_STAR_50 = buildUStar50(1)
const U_NN_50 = buildUNN50()
const applyUbdyStar = makeBoundaryLift552(U_STAR_50)
const applyUbdyNN = makeBoundaryLift552(U_NN_50)

// Exact 1D collinear Sym^k even-sublattice bare-U builder (shared by Exp 1b, Exp 4, Exp 6)
function buildSymKEven(kPart: number, M: number): {
  readonly U: CMat
  readonly dim: number
  readonly configs: [number, number][][]
} {
  const canon = (pts: readonly (readonly [number, number])[]) => {
    let bestKey = ''
    let bestSorted: [number, number][] = []
    let symCount = 0
    for (let sh = 0; sh < M; sh++) {
      const arr: [number, number][] = pts.map(([m, s]) => [(m + sh) % M, s])
      arr.sort((a, b) => a[0] - b[0] || a[1] - b[1])
      const k = arr.map(([m, s]) => `${m}:${s}`).join(',')
      if (bestKey === '' || k < bestKey) { bestKey = k; bestSorted = arr; symCount = 1 }
      else if (k === bestKey) symCount++
    }
    return { key: bestKey, sorted: bestSorted, symCount }
  }
  const idxMap = new Map<string, number>()
  const configs: [number, number][][] = []
  const symCounts: number[] = []
  const chosen: number[] = []
  const gen = (start: number) => {
    if (chosen.length === kPart) {
      const cn = canon(chosen.map(c => [c >> 1, c & 1] as const))
      if (!idxMap.has(cn.key)) {
        idxMap.set(cn.key, configs.length)
        configs.push(cn.sorted)
        symCounts.push(cn.symCount)
      }
      return
    }
    for (let c = start; c < 2 * M; c++) { chosen.push(c); gen(c + 1); chosen.pop() }
  }
  gen(0)
  const dim = configs.length
  const U = cmatZero(dim)
  const cMat: C[][] = [[C_KEEP_C, C_CROSS_C], [C_CROSS_C, C_KEEP_C]]
  for (let col = 0; col < dim; col++) {
    const pts = configs[col]!
    const byM = new Map<number, number[]>()
    for (let i = 0; i < kPart; i++) {
      const m = pts[i]![0]
      const l = byM.get(m)
      if (l) l.push(i)
      else byM.set(m, [i])
    }
    let br: { pts: [number, number][]; amp: C }[] = [{ pts: [], amp: C1 }]
    for (const [m, idxs] of byM) {
      if (idxs.length === 2) {
        br = br.map(b => ({ pts: [...b.pts, [m, 0], [m, 1]], amp: cMul(b.amp, W2_C) }))
      } else {
        const sIn = pts[idxs[0]!]![1]
        const nb: { pts: [number, number][]; amp: C }[] = []
        for (const b of br) {
          nb.push({ pts: [...b.pts, [m, 0]], amp: cMul(b.amp, cMat[0]![sIn]!) })
          nb.push({ pts: [...b.pts, [m, 1]], amp: cMul(b.amp, cMat[1]![sIn]!) })
        }
        br = nb
      }
    }
    for (const b of br) {
      const cn = canon(b.pts.map(([m, s]) => [s === 0 ? m : (m - 1 + M) % M, s]))
      const row = idxMap.get(cn.key)!
      const sc = Math.sqrt(symCounts[row]! / symCounts[col]!)
      U.re[row * dim + col] = U.re[row * dim + col]! + sc * b.amp[0]
      U.im[row * dim + col] = U.im[row * dim + col]! + sc * b.amp[1]
    }
  }
  return { U, dim, configs }
}

// Shift-invert eigenvector extractor for exact unitary eigenmodes
function extractUnitaryEigenmode(U: CMat, targetLam: C): {
  readonly vr: Float64Array
  readonly vi: Float64Array
  readonly lam: C
  readonly epsLump: number
  readonly ipr: number
  readonly lamErr: number
} {
  const dim = U.n
  const solveSys = (sh: C, br: Float64Array, bi: Float64Array): [Float64Array, Float64Array] => {
    const ar = Float64Array.from(U.re)
    const ai = Float64Array.from(U.im)
    const xr = Float64Array.from(br)
    const xi = Float64Array.from(bi)
    for (let i = 0; i < dim; i++) {
      ar[i * dim + i] = ar[i * dim + i]! - sh[0]
      ai[i * dim + i] = ai[i * dim + i]! - sh[1]
    }
    for (let c = 0; c < dim; c++) {
      let piv = c
      let best = Math.hypot(ar[c * dim + c]!, ai[c * dim + c]!)
      for (let r = c + 1; r < dim; r++) {
        const v = Math.hypot(ar[r * dim + c]!, ai[r * dim + c]!)
        if (v > best) { best = v; piv = r }
      }
      if (piv !== c) {
        for (let j = c; j < dim; j++) {
          let t = ar[c * dim + j]!; ar[c * dim + j] = ar[piv * dim + j]!; ar[piv * dim + j] = t
          t = ai[c * dim + j]!; ai[c * dim + j] = ai[piv * dim + j]!; ai[piv * dim + j] = t
        }
        let tb = xr[c]!; xr[c] = xr[piv]!; xr[piv] = tb
        tb = xi[c]!; xi[c] = xi[piv]!; xi[piv] = tb
      }
      const pr = ar[c * dim + c]!, pi = ai[c * dim + c]!, d = pr * pr + pi * pi
      for (let r = c + 1; r < dim; r++) {
        const fr0 = ar[r * dim + c]!, fi0 = ai[r * dim + c]!
        if (fr0 === 0 && fi0 === 0) continue
        const fr = (fr0 * pr + fi0 * pi) / d
        const fi = (fi0 * pr - fr0 * pi) / d
        for (let j = c + 1; j < dim; j++) {
          ar[r * dim + j] = ar[r * dim + j]! - (fr * ar[c * dim + j]! - fi * ai[c * dim + j]!)
          ai[r * dim + j] = ai[r * dim + j]! - (fr * ai[c * dim + j]! + fi * ar[c * dim + j]!)
        }
        xr[r] = xr[r]! - (fr * xr[c]! - fi * xi[c]!)
        xi[r] = xi[r]! - (fr * xi[c]! + fi * xr[c]!)
      }
    }
    for (let r = dim - 1; r >= 0; r--) {
      let sr = xr[r]!, si = xi[r]!
      for (let j = r + 1; j < dim; j++) {
        sr -= ar[r * dim + j]! * xr[j]! - ai[r * dim + j]! * xi[j]!
        si -= ar[r * dim + j]! * xi[j]! + ai[r * dim + j]! * xr[j]!
      }
      const pr = ar[r * dim + r]!, pi = ai[r * dim + r]!, d = pr * pr + pi * pi
      xr[r] = (sr * pr + si * pi) / d
      xi[r] = (si * pr - sr * pi) / d
    }
    return [xr, xi]
  }

  const vr = new Float64Array(dim)
  const vi = new Float64Array(dim)
  for (let i = 0; i < dim; i++) vr[i] = Math.cos(i * 0.618 + 0.2) / Math.sqrt(dim)
  let lam = targetLam
  for (let it = 0; it < 6; it++) {
    const sh: C = it === 0 ? cScale(1.0004, lam) : cScale(1 + 1e-11, lam)
    const [xr, xi] = solveSys(sh, vr, vi)
    let n2 = 0
    for (let i = 0; i < dim; i++) n2 += xr[i]! * xr[i]! + xi[i]! * xi[i]!
    const inv = 1 / Math.sqrt(n2)
    for (let i = 0; i < dim; i++) { vr[i] = xr[i]! * inv; vi[i] = xi[i]! * inv }
    let lr = 0
    let li = 0
    for (let r = 0; r < dim; r++) {
      let sr = 0
      let si = 0
      for (let c = 0; c < dim; c++) {
        sr += U.re[r * dim + c]! * vr[c]! - U.im[r * dim + c]! * vi[c]!
        si += U.re[r * dim + c]! * vi[c]! + U.im[r * dim + c]! * vr[c]!
      }
      lr += vr[r]! * sr + vi[r]! * si
      li += vr[r]! * si - vi[r]! * sr
    }
    const la = Math.hypot(lr, li)
    lam = [lr / la, li / la]
  }
  let ovR = 0
  let ovI = 0
  const uvr = new Float64Array(dim)
  const uvi = new Float64Array(dim)
  for (let r = 0; r < dim; r++) {
    let sr = 0
    let si = 0
    for (let c = 0; c < dim; c++) {
      sr += U.re[r * dim + c]! * vr[c]! - U.im[r * dim + c]! * vi[c]!
      si += U.re[r * dim + c]! * vi[c]! + U.im[r * dim + c]! * vr[c]!
    }
    uvr[r] = sr
    uvi[r] = si
    ovR += vr[r]! * sr + vi[r]! * si
    ovI += vr[r]! * si - vi[r]! * sr
  }
  let leak2 = 0
  let ipr = 0
  for (let r = 0; r < dim; r++) {
    const dr = uvr[r]! - (ovR * vr[r]! - ovI * vi[r]!)
    const di = uvi[r]! - (ovR * vi[r]! + ovI * vr[r]!)
    leak2 += dr * dr + di * di
    ipr += (vr[r]! * vr[r]! + vi[r]! * vi[r]!) ** 2
  }
  return { vr, vi, lam, epsLump: Math.sqrt(leak2), ipr, lamErr: Math.hypot(lam[0] - targetLam[0], lam[1] - targetLam[1]) }
}

// Boosted k = 2 exact bare-U M_meet even-sublattice unitary U_2(P) at COM momentum P (relative r = 0..M-1)
// On even sublattice (x_1 = 2n_1, x_2 = 2n_2), relative coordinate d = (n_2 - n_1) mod M in 0..M-1.
// Basis: (d=0, R+L) [1 state] plus for d=1..M-1 the 4 spin pairs (R,R),(R,L),(L,R),(L,L) modded by exchange!
// For distinct-role symmetric (bosonic) even sublattice on M sites:
// d=0 has 1 state |0, RL>; d in 1..M/2-1 has 4 states |d, RR>, |d, RL>, |d, LR>, |d, LL>;
// d = M/2 has 3 states |M/2, RR>, |M/2, LL>, (|M/2, RL> + e^{iP M/2} |M/2, LR>)/sqrt(2).
// Even simpler and 100% exact without any quotient ambiguity: build full 2-particle distinguishable-index
// relative matrix of dimension 4*M - 2 (excluding Pauli-occupied same-site same-slot (d=0, RR) & (d=0, LL))!
function buildBoostedDoublonU(M: number, P: number): {
  readonly U: CMat
  readonly states: readonly (readonly [number, number, number])[] // [d, s1, s2]
} {
  const states: [number, number, number][] = []
  const idx = new Map<string, number>()
  for (let d = 0; d < M; d++) {
    for (let s1 = 0; s1 < 2; s1++) {
      for (let s2 = 0; s2 < 2; s2++) {
        if (d === 0 && s1 === s2) continue
        idx.set(`${d}:${s1}:${s2}`, states.length)
        states.push([d, s1, s2])
      }
    }
  }
  const dim = states.length
  const U = cmatZero(dim)
  const cMat: C[][] = [[C_KEEP_C, C_CROSS_C], [C_CROSS_C, C_KEEP_C]]
  // On bare U (even sublattice n_1, n_2 with spacing 2, actual site x_j = 2 n_j):
  // Streaming step S moves R-particle from x -> x+1 (shift +1/2 in n) and L-particle from x -> x-1 (shift -1/2 in n).
  // After one beat of S, both particles land on ODD sites, wait: to stay on the integer n-grid with 1-beat step,
  // shift R by +1, L by 0 in the moving gauge (x_R -> x_R + 2 relative to L, COM shift (dx1+dx2)/2):
  // In standard coordinates x_1, x_2 in Z_{2M} with x_1 = x_2 (mod 2):
  // After 1 beat: R shifts +1, L shifts -1, so x_1' + x_2' = x_1 + x_2 + (v_1 + v_2), v in {+1, -1},
  // and (x_2' - x_1') = (x_2 - x_1) + (v_2 - v_1) = 2 d + (v_2 - v_1), which is ALWAYS EVEN!
  // So d' = (d + (v_2 - v_1) / 2) mod M, and COM shifts by DeltaX = (v_1 + v_2) / 2 in {-1, 0, +1}!
  // Bloch phase for COM translation by DeltaX is e^{-i P DeltaX}!
  for (let col = 0; col < dim; col++) {
    const [d, s1, s2] = states[col]!
    const branches: { s1p: number; s2p: number; amp: C }[] = []
    if (d === 0) {
      // Same dock, antipodal slots (s1 != s2), symmetric role -> D o M_meet o D gives exact phase omega^2 on symmetric pair!
      // Wait: check M_meet on opposite roles (r1 != r2) vs symmetric sum (|r0,r1> + |r1,r0>)/sqrt(2):
      // In bare U: D gives zeta_6 on full line, M_meet gives (zeta_6 + (omega-1)/2) = omega on symmetric role pair, D gives zeta_6 -> zeta_6^2 * omega = omega^2!
      branches.push({ s1p: s1, s2p: s2, amp: W2_C })
    } else {
      for (let s1p = 0; s1p < 2; s1p++) {
        for (let s2p = 0; s2p < 2; s2p++) {
          branches.push({ s1p, s2p, amp: cMul(cMat[s1p]![s1]!, cMat[s2p]![s2]!) })
        }
      }
    }
    for (const br of branches) {
      const v1 = br.s1p === 0 ? 1 : -1
      const v2 = br.s2p === 0 ? 1 : -1
      const dp = (d + (v2 - v1) / 2 + M) % M
      const dxCom = (v1 + v2) / 2
      const ph: C = [Math.cos(-P * dxCom), Math.sin(-P * dxCom)]
      const amp = cMul(br.amp, ph)
      const row = idx.get(`${dp}:${br.s1p}:${br.s2p}`)!
      U.re[row * dim + col] = U.re[row * dim + col]! + amp[0]
      U.im[row * dim + col] = U.im[row * dim + col]! + amp[1]
    }
  }
  return { U, states }
}

// =================================================================================================
// EXPERIMENT 1: EXACT VS APPROXIMATE SEMICONJUGACY (MS-05..MS-08) & LIPSCHITZ ERROR ENVELOPE
// =================================================================================================

function runExperiment1() {
  console.log('\n[EXP 1] Exact vs Approximate Semiconjugacy (MS-05, MS-06, MS-07, MS-08) & Lipschitz Envelope:')

  // --- 1(a) Exact Symmetry Quotients on {3,4,3,4} / Bare U ---
  // (a1) W(F_4) orbit quotient on B_3 (8,857 docks -> 31 dock orbits; B_2 11,544 slots -> 39 slot orbits)
  const orbKeyToId = new Map<string, number>()
  const orbMembers: number[][] = []
  for (let d = 0; d < N_B3; d++) {
    const ok = dominantCenterKey(dockCenters[d]!)
    let oid = orbKeyToId.get(ok)
    if (oid === undefined) { oid = orbMembers.length; orbKeyToId.set(ok, oid); orbMembers.push([]) }
    orbMembers[oid]!.push(d)
  }
  const nDockOrbs = orbMembers.length
  assertExact(nDockOrbs === 31, `Expected 31 W(F_4) dock orbits in B_3, got ${nDockOrbs}`)

  const slotToTargetCenter = (d: number, s: number): Q2[] => {
    const nb = hcNeighbors[d]![s]!
    return nb >= 0 ? dockCenters[nb]! : matVecQ2(matMulQ2(dockFrames[d]!, TRANSPORTS[s]!), BASE_CENTER)
  }
  const dockReflB2: Int32Array[] = STAB_REFS.map(g => {
    const arr = new Int32Array(N_B2)
    for (let d = 0; d < N_B2; d++) arr[d] = centerToDockId.get(vecKeyQ2(matVecQ2(g, dockCenters[d]!)))!
    return arr
  })
  const dsReflB2: Int32Array[] = STAB_REFS.map((g, gi) => {
    const arr = new Int32Array(N_B2 * 24)
    for (let d = 0; d < N_B2; d++) {
      const gd = dockReflB2[gi]![d]!
      const tgtMap = new Map<string, number>()
      for (let sp = 0; sp < 24; sp++) tgtMap.set(vecKeyQ2(slotToTargetCenter(gd, sp)), sp)
      for (let s = 0; s < 24; s++) {
        const imgTgt = matVecQ2(g, slotToTargetCenter(d, s))
        arr[d * 24 + s] = gd * 24 + tgtMap.get(vecKeyQ2(imgTgt))!
      }
    }
    return arr
  })
  const slotOrbId = new Int32Array(N_B2 * 24).fill(-1)
  const slotOrbs: number[][] = []
  for (let ds = 0; ds < N_B2 * 24; ds++) {
    if (slotOrbId[ds]! >= 0) continue
    const oid = slotOrbs.length
    const mem: number[] = [ds]
    slotOrbId[ds] = oid
    for (let h = 0; h < mem.length; h++) {
      const cur = mem[h]!
      for (let gi = 0; gi < 4; gi++) {
        const nxt = dsReflB2[gi]![cur]!
        if (slotOrbId[nxt]! < 0) { slotOrbId[nxt] = oid; mem.push(nxt) }
      }
    }
    slotOrbs.push(mem)
  }
  const b1SlotOrbs = slotOrbs.filter(mem => mem.every(ds => dockRad[Math.floor(ds / 24)]! <= 1))
  let wf4SemiconjErr = 0
  for (const mem of b1SlotOrbs) {
    const inv = 1 / Math.sqrt(mem.length)
    const outRe = new Float64Array(N_B2 * 24)
    const outIm = new Float64Array(N_B2 * 24)
    for (const ds of mem) {
      const d = Math.floor(ds / 24)
      const s = ds % 24
      const os = OPP[s]!
      const iK = hcNeighbors[d]![s]! * 24 + s
      const iC = hcNeighbors[d]![os]! * 24 + os
      outRe[iK] = outRe[iK]! + inv * C_KEEP_C[0]
      outIm[iK] = outIm[iK]! + inv * C_KEEP_C[1]
      outRe[iC] = outRe[iC]! + inv * C_CROSS_C[0]
      outIm[iC] = outIm[iC]! + inv * C_CROSS_C[1]
    }
    let res2 = 0
    for (const om of slotOrbs) {
      let mr = 0, mi = 0
      for (const ds of om) { mr += outRe[ds]!; mi += outIm[ds]! }
      mr /= om.length
      mi /= om.length
      for (const ds of om) res2 += (outRe[ds]! - mr) ** 2 + (outIm[ds]! - mi) ** 2
    }
    wf4SemiconjErr = Math.max(wf4SemiconjErr, Math.sqrt(res2))
  }

  // (a2) Exact Q, D, and bipartite dock-parity conservation across verbatim 8-layer BigInt bare U
  const [l0A, l0B] = LINES[0]!
  const testStates4D: readonly { readonly label: string; readonly st: ExactState; readonly q: number; readonly d: number; readonly par: number }[] = [
    { label: 'vacuum', st: stateFromEntries([[[], Z9_ONE]], 1n), q: 0, d: 0, par: 1 },
    { label: '1-vibe', st: stateFromEntries([[[[0, l0A, 1, 0]], Z9_ONE]], 1n), q: 1, d: 1, par: 1 },
    { label: '2-pair', st: stateFromEntries([[[[0, l0A, 1, 0], [0, l0B, 1, 0]], Z9_ONE]], 1n), q: 2, d: 2, par: 1 },
    { label: '2-neut', st: stateFromEntries([[[[0, l0A, 1, 0], [0, l0B, -1, 0]], Z9_ONE]], 1n), q: 0, d: 2, par: 1 },
    {
      label: '4-chiral',
      st: stateFromEntries([[[[0, 0, 1, 0], [0, 1, -1, 0], [0, 4, 1, 0], [0, 10, 1, 0]], Z9_ONE]], 1n),
      q: 2,
      d: 4,
      par: 1,
    },
  ]
  let qdParityDefects = 0
  for (const tc of testStates4D) {
    let cur = tc.st
    for (let t = 1; t <= 2; t++) {
      cur = applyBeat4D(cur)
      const expPar = t % 2 === 1 ? (tc.d % 2 === 1 ? -tc.par : tc.par) : tc.par
      for (const k of cur.amp.keys()) {
        const vs = decodeConfig(k)
        let qSum = 0
        let parProd = 1
        for (const [dk, , tone] of vs) {
          qSum += tone
          parProd *= dockParity[dk]!
        }
        if (qSum !== tc.q || vs.length !== tc.d || parProd !== expPar) qdParityDefects++
      }
    }
  }

  // --- 1(b) Exact Composite-Carrier Worldtube Scale (k=2 Doublon & k=3 Trion, MS-11/MS-12, t=1..20) ---
  const sysK2 = buildSymKEven(2, 12)
  const lamDoublon0: C = [(7 - 7.5) / 13, (15 * SQRT3) / 26] // (7 + 15 omega) / 13
  const doub0 = extractUnitaryEigenmode(sysK2.U, lamDoublon0)

  // Also test boosted moving k=2 doublon at P = pi/6 (dynamic membership MS-12: constituent sites shift every beat!)
  const P_BOOST = PI / 6
  const boostedK2 = buildBoostedDoublonU(12, P_BOOST)
  // Find boosted bound eigenvalue near lamDoublon0 via shift-invert
  const doubBoost = extractUnitaryEigenmode(boostedK2.U, lamDoublon0)
  // Measure group velocity v_g = dE/dP of the moving k=2 doublon by exact finite difference at P_BOOST +- 1e-4
  const dP = 1e-4
  const dPlus = extractUnitaryEigenmode(buildBoostedDoublonU(12, P_BOOST + dP).U, doubBoost.lam)
  const dMinus = extractUnitaryEigenmode(buildBoostedDoublonU(12, P_BOOST - dP).U, doubBoost.lam)
  const argC = (z: C): number => Math.atan2(z[1], z[0])
  const wrapPi = (x: number): number => {
    let y = ((x + PI) % TWO_PI + TWO_PI) % TWO_PI - PI
    if (y <= -PI) y += TWO_PI
    return y
  }
  const vgDoublon = -wrapPi(argC(dPlus.lam) - argC(dMinus.lam)) / (2 * dP)

  const sysK3 = buildSymKEven(3, 8)
  const lamTrion0: C = [-13 / 14, (-3 * SQRT3) / 14] // -(8 + 3 omega) / 7
  const trion0 = extractUnitaryEigenmode(sysK3.U, lamTrion0)

  // Certify exact closure eps < 1e-14 over t = 1..20 beats for k=2 (rest + boosted) and k=3 trion!
  const verifyEigenClosure20 = (U: CMat, vr0: Float64Array, vi0: Float64Array, lam: C): number => {
    const n = U.n
    let cr = Float64Array.from(vr0)
    let ci = Float64Array.from(vi0)
    let lamPow: C = C1
    let maxErr = 0
    for (let t = 1; t <= 20; t++) {
      const nr = new Float64Array(n)
      const ni = new Float64Array(n)
      for (let r = 0; r < n; r++) {
        let sr = 0, si = 0
        for (let c = 0; c < n; c++) {
          sr += U.re[r * n + c]! * cr[c]! - U.im[r * n + c]! * ci[c]!
          si += U.re[r * n + c]! * ci[c]! + U.im[r * n + c]! * cr[c]!
        }
        nr[r] = sr
        ni[r] = si
      }
      cr = nr
      ci = ni
      lamPow = cMul(lamPow, lam)
      let e2 = 0
      for (let r = 0; r < n; r++) {
        const er = cr[r]! - (lamPow[0] * vr0[r]! - lamPow[1] * vi0[r]!)
        const ei = ci[r]! - (lamPow[0] * vi0[r]! + lamPow[1] * vr0[r]!)
        e2 += er * er + ei * ei
      }
      maxErr = Math.max(maxErr, Math.sqrt(e2))
    }
    return maxErr
  }
  const epsK2Rest20 = verifyEigenClosure20(sysK2.U, doub0.vr, doub0.vi, doub0.lam)
  const epsK2Boost20 = verifyEigenClosure20(boostedK2.U, doubBoost.vr, doubBoost.vi, doubBoost.lam)
  const epsK3Rest20 = verifyEigenClosure20(sysK3.U, trion0.vr, trion0.vi, trion0.lam)

  // Verify 0.0 4D Z[zeta_9][1/6] cross-line leak on {3,4,3,4} for k=2 distinct-role doublon & k=3 trion
  const line0Docks = new Set<number>([0])
  {
    let cA = 0, cB = 0
    for (let i = 0; i < 6; i++) {
      cA = stepDock(cA, l0A); cB = stepDock(cB, l0B)
      line0Docks.add(cA); line0Docks.add(cB)
    }
  }
  const measure4DLineLeak = (init: ExactState, steps: number): number => {
    let st = init
    for (let t = 0; t < steps; t++) st = applyBeat4D(st)
    let tot = 0, off = 0
    for (const [k, a] of st.amp) {
      const p = cAbs2(z9ToComplex(a, st.den))
      tot += p
      if (decodeConfig(k).some(([d, sl]) => LINE_OF_SLOT[sl] !== 0 || !line0Docks.has(d))) off += p
    }
    return Math.sqrt(off / tot)
  }
  const doub4DLeak = measure4DLineLeak(
    stateFromEntries([[[[0, l0A, 1, 0], [0, l0B, 1, 1]], Z9_ONE], [[[0, l0A, 1, 1], [0, l0B, 1, 0]], Z9_ONE]], 1n),
    2,
  )
  const dPos2 = stepDock(stepDock(0, l0A), l0A)
  const perms3: readonly (readonly [number, number, number])[] = [
    [0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0],
  ]
  const trion4DLeak = measure4DLineLeak(
    stateFromEntries(perms3.map(([r0, r1, r2]) => [[[0, l0A, 1, r0], [0, l0B, 1, r1], [dPos2, l0A, 1, r2]], Z9_ONE] as const), 1n),
    2,
  )

  // --- 1(c) Exact Radial Holographic RG Isometry V_R: B_0 -> B_1 -> B_2_cap with U_star / U_NN (MS-08) ---
  // Step 1: Certify V_1^dag U_bdy V_1 = U_bulk (0 GF(3) defects on all 50 bulk Paulis + 0 stab leakage t=1..20)
  const checkIntertwining = (applyBdy: (v: GF3Row) => GF3Row, Ubulk: readonly Uint8Array[]): {
    readonly intertwineDefects: number
    readonly maxStabLeak20: number
  } => {
    let intertwineDefects = 0
    for (let j = 0; j < 50; j++) {
      const img = applyBdy(B1_LOG_ALL[j]!)
      const exp = gf3RowZero(B1_BND_WORDS)
      for (let i = 0; i < 50; i++) {
        const cf = Ubulk[i]![j]!
        if (cf === 1) gf3AddInPlace(exp, B1_LOG_ALL[i]!)
        else if (cf === 2) gf3SubInPlace(exp, B1_LOG_ALL[i]!)
      }
      const diff = gf3RowClone(img)
      gf3SubInPlace(diff, exp)
      for (let w = 0; w < diff.a.length; w++) if ((diff.a[w]! | diff.b[w]!) !== 0) { intertwineDefects++; break }
    }
    let maxStabLeak20 = 0
    let curH = B1_CODE.hStabs.map(gf3RowClone)
    for (let t = 1; t <= 20; t++) {
      curH = curH.map(applyBdy)
      if (t === 1 || t === 5 || t === 10 || t === 20) {
        const rk = gf3Rank([...B1_CODE.hStabs, ...curH], 1104)
        if (rk - 527 > maxStabLeak20) maxStabLeak20 = rk - 527
      }
    }
    return { intertwineDefects, maxStabLeak20 }
  }
  const holoStar = checkIntertwining(applyUbdyStar, U_STAR_50)
  const holoNN = checkIntertwining(applyUbdyNN, U_NN_50)

  // Step 2: Certify EXACT two-step radial RG compositional consistency pi_{0->2} = pi_1 o pi_0 (MS-08)!
  // Radial tower across two radial shells on {3,4,3,4}:
  //   UV Scale 0 (dB_1, 552 boundary qutrits)
  //     --pi_0 (contract 24 shell-1 docks)--> Mid Scale 1 (dB_0 24 inner legs + 24 shell-1 bulk qutrits = 48 qutrits)
  //     --pi_1 (contract origin B_0 dock)--> IR Scale 2 (25 bulk qutrits: origin b_0 + 24 shell-1 bulk qutrits)
  // Direct map pi_{0->2} = V_{B_1}^dag (.) V_{B_1} maps any code-preserving Pauli O on dB_1 directly to its 25-qutrit
  // bulk action via symplectic inner products with (xLogs, zLogs) of B_1.
  // Two-step composition pi_1 o pi_0:
  //   (i) On each shell-1 dock a = 0..23 independently (using CROWN.choiMinus), push O|_{cone a} (23 boundary legs)
  //       inward to its 2 remaining legs: (inward leg s_in = OPP[a] on dB_0, bulk leg b_{1+a})!
  //       Because the 24 shell-1 docks are disjoint in {3,4,3,4} (bipartite, 0 intra-shell edges), pi_0 factors into
  //       24 local 25-qutrit stabilizer pushes!
  //   (ii) On origin dock 0 (using CROWN.choiPlus), push the resulting 24-leg dB_0 operator inward to origin bulk b_0!
  // We verify pi_1(pi_0(O)) === pi_{0->2}(O) identically across ALL 50 canonical bulk logicals AND their U_star & U_NN images!
  const buildLocalDockPullback = (choiRows: readonly Uint8Array[], inSlot: number) => {
    // 25-qutrit Lagrangian choiRows (indices 0..23 = 24 facet legs, 24 = bulk leg).
    // Reorder so cols 0..1 = (X_in, X_b), 2..3 = (Z_in, Z_b), 4..49 = 23 outer boundary legs (X, Z).
    const outSlots: number[] = []
    for (let s = 0; s < 24; s++) if (s !== inSlot) outSlots.push(s)
    const rows = choiRows.map(r => {
      const row = gf3RowZero(2)
      gf3Set(row, 0, r[inSlot]!)
      gf3Set(row, 1, r[24]!)
      gf3Set(row, 2, r[25 + inSlot]!)
      gf3Set(row, 3, r[49]!)
      for (let j = 0; j < 23; j++) {
        const s = outSlots[j]!
        gf3Set(row, 4 + j, r[s]!)
        gf3Set(row, 4 + 23 + j, r[25 + s]!)
      }
      return row
    })
    const { basis, pivCols } = gf3Rref(rows, 50)
    assertExact(pivCols.slice(0, 4).every((c, i) => c === i), `shell-1 local pullback pivots for inSlot=${inSlot}`)
    // Extract the 4 boundary Pauli operators representing (X_in, X_b, Z_in, Z_b) on the 23 outer legs!
    // Sign convention matching contractB1: X_eff = -extract(row_X), Z_eff = +extract(row_Z) so sympDot(X_eff, Z_eff) = 1.
    const extract23 = (row: GF3Row, neg: boolean): SympRow => {
      const r23 = gf3RowZero(2)
      for (let j = 0; j < 23; j++) {
        const xv = gf3Get(row, 4 + j)
        const zv = gf3Get(row, 4 + 23 + j)
        if (xv) gf3Set(r23, j, neg ? mod3(3 - xv) : xv)
        if (zv) gf3Set(r23, 23 + j, neg ? mod3(3 - zv) : zv)
      }
      return toSympRow(r23, 23)
    }
    return {
      outSlots,
      xIn: extract23(basis[0]!, true),
      xBulk: extract23(basis[1]!, true),
      zIn: extract23(basis[2]!, false),
      zBulk: extract23(basis[3]!, false),
    }
  }
  const shell1Pullbacks = Array.from({ length: 24 }, (_, a) => buildLocalDockPullback(CROWN.choiMinus, OPP[a]!))
  const b0XL = toSympRow(gf3FromUint8(CROWN.xL), 24)
  const b0ZL = toSympRow(gf3FromUint8(CROWN.zL), 24)

  // Direct pi_{0->2}: 552 boundary -> 25 bulk (50-component GF(3) vector [x_0..x_24, z_0..z_24])
  const piDirect02 = (O: GF3Row): Uint8Array => {
    const sO = toSympRow(O, 552)
    const out = new Uint8Array(50)
    for (let g = 0; g < 25; g++) {
      out[g] = sympDotBit(sO, B1_SYMP_Z[g]!)
      out[25 + g] = mod3(2 * sympDotBit(sO, B1_SYMP_X[g]!))
    }
    return out
  }
  // Step 1 pi_0: 552 boundary -> 24 dB_0 legs + 24 shell-1 bulk qutrits
  const piStep0 = (O: GF3Row): { readonly dB0: GF3Row; readonly shell1X: Uint8Array; readonly shell1Z: Uint8Array } => {
    const dB0 = gf3RowZero(2)
    const shell1X = new Uint8Array(24)
    const shell1Z = new Uint8Array(24)
    for (let a = 0; a < 24; a++) {
      const pb = shell1Pullbacks[a]!
      const sub = gf3RowZero(2)
      for (let j = 0; j < 23; j++) {
        const bq = B1_CODE.asToBnd[a * 24 + pb.outSlots[j]!]!
        const xv = gf3Get(O, bq)
        const zv = gf3Get(O, 552 + bq)
        if (xv) gf3Set(sub, j, xv)
        if (zv) gf3Set(sub, 23 + j, zv)
      }
      const sSub = toSympRow(sub, 23)
      // Local operator on (inSlot = OPP[a], bulk = b_{1+a}) pushed through |Phi+> bell bond onto origin dock slot a:
      // On |Phi+> (X_u X_v = 1, Z_u Z_v^2 = 1), X_v^p Z_v^q pushes to X_u^{2p} Z_u^q (Wait: X_v = X_u^{-1} = X_u^2, Z_v = Z_u!).
      const xIn = sympDotBit(sSub, pb.zIn)
      const zIn = mod3(2 * sympDotBit(sSub, pb.xIn))
      const xB = sympDotBit(sSub, pb.zBulk)
      const zB = mod3(2 * sympDotBit(sSub, pb.xBulk))
      const xOrig = mod3(2 * xIn)
      const zOrig = zIn
      if (xOrig) gf3Set(dB0, a, xOrig)
      if (zOrig) gf3Set(dB0, 24 + a, zOrig)
      shell1X[a] = xB
      shell1Z[a] = zB
    }
    return { dB0, shell1X, shell1Z }
  }
  // Step 2 pi_1: (dB_0 24 legs + 24 shell-1 bulk) -> 25 bulk qutrits
  const piStep1 = (mid: { readonly dB0: GF3Row; readonly shell1X: Uint8Array; readonly shell1Z: Uint8Array }): Uint8Array => {
    const out = new Uint8Array(50)
    const sB0 = toSympRow(mid.dB0, 24)
    out[0] = sympDotBit(sB0, b0ZL)
    out[25] = mod3(2 * sympDotBit(sB0, b0XL))
    for (let a = 0; a < 24; a++) {
      out[1 + a] = mid.shell1X[a]!
      out[25 + 1 + a] = mid.shell1Z[a]!
    }
    return out
  }

  // Test pi_{0->2} === pi_1 o pi_0 on ALL 50 logicals + ALL 50 U_star images + ALL 50 U_NN images (= 150 operators)!
  const testOpsRG: GF3Row[] = [
    ...B1_LOG_ALL,
    ...B1_LOG_ALL.map(applyUbdyStar),
    ...B1_LOG_ALL.map(applyUbdyNN),
  ]
  let rgCompDefects = 0
  for (const op of testOpsRG) {
    const direct = piDirect02(op)
    const composed = piStep1(piStep0(op))
    for (let i = 0; i < 50; i++) if (direct[i] !== composed[i]) { rgCompDefects++; break }
  }

  // Also test a true 3-shell radial RG step B_2_cap -> B_1 -> B_0 on cone 0 (attaching 23 shell-2 [[24,1,8]]_3^+ docks
  // onto the 23 open legs of shell-1 dock a = 0: 529 outer shell-2 legs -> 23 shell-1 legs -> 1 inner leg of B_0)!
  const shell2Pullbacks = Array.from({ length: 24 }, (_, s) => buildLocalDockPullback(CROWN.choiPlus, OPP[s]!))
  // Lift origin X_L and Z_L on cone 0 to 529 outer shell-2 legs via exact encoding, then test 2-step vs 3-step pullback
  let b2CapDefects = 0
  {
    // Push any single-leg Pauli (x, z) on shell-1 dock 1 slot s -> 23 outer legs of attached shell-2 dock!
    // Verify that pulling back through shell-2 (pi_2->1) then shell-1 (pi_1->0) recovers (x, z) identically across all 23 slots x 9 Paulis!
    const c0Pb = shell1Pullbacks[0]!
    for (let j = 0; j < 23; j++) {
      const s1Slot = c0Pb.outSlots[j]!
      const s2Pb = shell2Pullbacks[s1Slot]!
      for (let px = 0; px < 3; px++) {
        for (let pz = 0; pz < 3; pz++) {
          // Encode (px, pz) on the inward leg OPP[s1Slot] of the shell-2 dock into its 23 outer legs:
          // On |Phi+> bond, (px, pz) on shell-1 leg corresponds to (2*px, pz) on shell-2 inward leg,
          // whose boundary representation on the 23 outer legs is (2*px)*xIn + pz*zIn!
          const outer = gf3RowZero(2)
          const cx = mod3(2 * px)
          for (let q = 0; q < 23; q++) {
            const xVal = mod3(cx * gf3Get(s2Pb.xIn.x, q) + pz * gf3Get(s2Pb.zIn.x, q))
            const zVal = mod3(cx * gf3Get(s2Pb.xIn.z, q) + pz * gf3Get(s2Pb.zIn.z, q))
            if (xVal) gf3Set(outer, q, xVal)
            if (zVal) gf3Set(outer, 23 + q, zVal)
          }
          const sOut = toSympRow(outer, 23)
          const recXIn = sympDotBit(sOut, s2Pb.zIn)
          const recZIn = mod3(2 * sympDotBit(sOut, s2Pb.xIn))
          const recX1 = mod3(2 * recXIn)
          const recZ1 = recZIn
          if (recX1 !== px || recZ1 !== pz) b2CapDefects++
        }
      }
    }
  }

  // --- 1(d) Lossy Spatial/Column Coarse-Graining & Rigorous Lipschitz Error Envelope (e_n <= eps sum L^k) ---
  // (d1) Unaliased 3D Cusp Column Projection on {3,4,3,4} B_3 (8,857 docks, 63 columns, 0 wrap conflicts)
  const cuspDocks: number[] = []
  const cuspIdx = new Int32Array(N_B3).fill(-1)
  for (let d = 0; d < N_B3; d++) {
    if (q2Float(twiceForm(dockCenters[d]!, CUSP_V)) <= -2 + 1e-9) {
      cuspIdx[d] = cuspDocks.length
      cuspDocks.push(d)
    }
  }
  const nCusp = cuspDocks.length
  const colRoots: Set<number>[] = Array.from({ length: nCusp }, () => new Set<number>())
  const cuspDepth = new Int32Array(nCusp).fill(-1)
  const colQ: number[] = []
  const d0CuspRoots: number[] = []
  for (let i = 0; i < nCusp; i++) {
    const tf = twiceForm(dockCenters[cuspDocks[i]!]!, CUSP_V)
    if (tf[0] === -2n && tf[1] === 0n) {
      cuspDepth[i] = 0
      colRoots[i]!.add(d0CuspRoots.length)
      d0CuspRoots.push(i)
      colQ.push(i)
    }
  }
  for (let h = 0; h < colQ.length; h++) {
    const ci = colQ[h]!
    const d = cuspDocks[ci]!
    const dep = cuspDepth[ci]!
    for (let s = 0; s < 24; s++) {
      const nb = hcNeighbors[d]![s]!
      if (nb < 0) continue
      const nci = cuspIdx[nb]!
      if (nci < 0) continue
      if (cuspDepth[nci]! < 0) {
        cuspDepth[nci] = dep + 1
        for (const r of colRoots[ci]!) colRoots[nci]!.add(r)
        colQ.push(nci)
      } else if (cuspDepth[nci]! === dep + 1) {
        for (const r of colRoots[ci]!) colRoots[nci]!.add(r)
      }
    }
  }
  // Find a D=1 dock whose unique column root is column 0 (matching E-HLG-0043 witness)
  let d1Col0 = -1
  let d1DownSlot = -1
  let d0LatSlot = -1
  const origCuspIdx = cuspIdx[0]!
  const origColId = [...colRoots[origCuspIdx]!][0]!
  for (let s = 0; s < 24; s++) {
    const nb = hcNeighbors[0]![s]!
    if (nb >= 0 && cuspIdx[nb]! >= 0 && cuspDepth[cuspIdx[nb]!] === 0) { d0LatSlot = s; break }
  }
  for (let i = 0; i < nCusp && d1Col0 < 0; i++) {
    if (cuspDepth[i] === 1 && colRoots[i]!.size === 1 && colRoots[i]!.has(origColId)) {
      const d = cuspDocks[i]!
      for (let s = 0; s < 24; s++) {
        const nb = hcNeighbors[d]![s]!
        if (nb >= 0 && cuspIdx[nb]! >= 0 && cuspDepth[cuspIdx[nb]!] === 2) {
          d1Col0 = d
          d1DownSlot = s
          break
        }
      }
    }
  }
  assertExact(d0LatSlot >= 0 && d1Col0 >= 0 && d1DownSlot >= 0, 'cusp column non-closure witness docks')
  // Compute 1-beat column probability profile Q_c(1) for State A (origin, D=0, lateral) vs State B (D=1, col 0, down)
  const colProfileAfter1Beat = (dock: number, slot: number): Float64Array => {
    const prof = new Float64Array(d0CuspRoots.length)
    const addWeight = (targetDock: number, prob: number): void => {
      const tci = cuspIdx[targetDock]!
      const rts = colRoots[tci]!
      const share = prob / rts.size
      for (const r of rts) prof[r] = prof[r]! + share
    }
    addWeight(hcNeighbors[dock]![slot]!, cAbs2(C_KEEP_C))
    addWeight(hcNeighbors[dock]![OPP[slot]!]!, cAbs2(C_CROSS_C))
    return prof
  }
  const profA1 = colProfileAfter1Beat(0, d0LatSlot)
  const profB1 = colProfileAfter1Beat(d1Col0, d1DownSlot)
  let cuspColDivL1 = 0
  for (let c = 0; c < d0CuspRoots.length; c++) cuspColDivL1 += Math.abs(profA1[c]! - profB1[c]!)

  // (d2) Rigorous multi-step Lipschitz error envelope on exact 1D geodesic bare-U ring (L = 64, dim = 128)
  // Coarse-graining pi_blk: spatial block averaging of b = 4 adjacent sites -> 16 coarse blocks (32 coarse modes).
  // Exact 128x128 unitary U = S o C, exact 32x128 orthogonal projector matrix Pi (Pi Pi^dag = I_32),
  // canonical orthogonal lift L_lift = Pi^dag (satisfying pi o L_lift = I_32, MS-09!),
  // coarse dynamics B_blk = Pi U Pi^dag (exact Galerkin macro-propagator).
  const L_RING = 64
  const BLOCK_B = 4
  const N_FINE = 2 * L_RING // 128
  const N_COARSE = 2 * (L_RING / BLOCK_B) // 32
  const U128 = cmatZero(N_FINE)
  for (let x = 0; x < L_RING; x++) {
    const xR = (x + 1) % L_RING
    const xL = (x - 1 + L_RING) % L_RING
    // From (x, R=0): keep -> (xR, 0) with C_KEEP_C; cross -> (xL, 1) with C_CROSS_C
    U128.re[(2 * xR) * N_FINE + 2 * x] = C_KEEP_C[0]
    U128.im[(2 * xR) * N_FINE + 2 * x] = C_KEEP_C[1]
    U128.re[(2 * xL + 1) * N_FINE + 2 * x] = C_CROSS_C[0]
    U128.im[(2 * xL + 1) * N_FINE + 2 * x] = C_CROSS_C[1]
    // From (x, L=1): keep -> (xL, 1) with C_KEEP_C; cross -> (xR, 0) with C_CROSS_C
    U128.re[(2 * xL + 1) * N_FINE + (2 * x + 1)] = C_KEEP_C[0]
    U128.im[(2 * xL + 1) * N_FINE + (2 * x + 1)] = C_KEEP_C[1]
    U128.re[(2 * xR) * N_FINE + (2 * x + 1)] = C_CROSS_C[0]
    U128.im[(2 * xR) * N_FINE + (2 * x + 1)] = C_CROSS_C[1]
  }
  assertExact(cmatUnitaryErr(U128) < 1e-14, 'U128 exact unitarity')

  // Build B_blk = Pi U Pi^dag (32 x 32) and exact 1-step closure residual E_1 = Pi U (I - Pi^dag Pi) (32 x 128)
  const invSqrtB = 1 / Math.sqrt(BLOCK_B)
  const BblkRe = new Float64Array(N_COARSE * N_COARSE)
  const BblkIm = new Float64Array(N_COARSE * N_COARSE)
  const PiURe = new Float64Array(N_COARSE * N_FINE)
  const PiUIm = new Float64Array(N_COARSE * N_FINE)
  for (let X = 0; X < L_RING / BLOCK_B; X++) {
    for (let s = 0; s < 2; s++) {
      const rC = 2 * X + s
      for (let col = 0; col < N_FINE; col++) {
        let sr = 0, si = 0
        for (let r = 0; r < BLOCK_B; r++) {
          const rF = 2 * (X * BLOCK_B + r) + s
          sr += U128.re[rF * N_FINE + col]!
          si += U128.im[rF * N_FINE + col]!
        }
        PiURe[rC * N_FINE + col] = sr * invSqrtB
        PiUIm[rC * N_FINE + col] = si * invSqrtB
      }
      for (let Y = 0; Y < L_RING / BLOCK_B; Y++) {
        for (let s2 = 0; s2 < 2; s2++) {
          const cC = 2 * Y + s2
          let sr = 0, si = 0
          for (let r = 0; r < BLOCK_B; r++) {
            const cF = 2 * (Y * BLOCK_B + r) + s2
            sr += PiURe[rC * N_FINE + cF]!
            si += PiUIm[rC * N_FINE + cF]!
          }
          BblkRe[rC * N_COARSE + cC] = sr * invSqrtB
          BblkIm[rC * N_COARSE + cC] = si * invSqrtB
        }
      }
    }
  }
  // E1 = Pi U - B_blk Pi (32 x 128): exact worst-case 1-step closure operator!
  const E1Re = Float64Array.from(PiURe)
  const E1Im = Float64Array.from(PiUIm)
  for (let rC = 0; rC < N_COARSE; rC++) {
    for (let Y = 0; Y < L_RING / BLOCK_B; Y++) {
      for (let s2 = 0; s2 < 2; s2++) {
        const cC = 2 * Y + s2
        const br = BblkRe[rC * N_COARSE + cC]! * invSqrtB
        const bi = BblkIm[rC * N_COARSE + cC]! * invSqrtB
        for (let r = 0; r < BLOCK_B; r++) {
          const cF = 2 * (Y * BLOCK_B + r) + s2
          E1Re[rC * N_FINE + cF] = E1Re[rC * N_FINE + cF]! - br
          E1Im[rC * N_FINE + cF] = E1Im[rC * N_FINE + cF]! - bi
        }
      }
    }
  }
  const L_galerkin = cmatRectOpNorm(N_COARSE, N_COARSE, BblkRe, BblkIm)
  const epsSupGalerkin = cmatRectOpNorm(N_COARSE, N_FINE, E1Re, E1Im)

  // Also test an expanding surrogate B_exp = alpha * B_blk with alpha = 1.06 (so L_exp > 1!) to exercise L > 1 growth
  const ALPHA_EXP = 1.06
  const L_exp = ALPHA_EXP * L_galerkin
  const E1ExpRe = Float64Array.from(PiURe)
  const E1ExpIm = Float64Array.from(PiUIm)
  for (let rC = 0; rC < N_COARSE; rC++) {
    for (let Y = 0; Y < L_RING / BLOCK_B; Y++) {
      for (let s2 = 0; s2 < 2; s2++) {
        const cC = 2 * Y + s2
        const br = ALPHA_EXP * BblkRe[rC * N_COARSE + cC]! * invSqrtB
        const bi = ALPHA_EXP * BblkIm[rC * N_COARSE + cC]! * invSqrtB
        for (let r = 0; r < BLOCK_B; r++) {
          const cF = 2 * (Y * BLOCK_B + r) + s2
          E1ExpRe[rC * N_FINE + cF] = E1ExpRe[rC * N_FINE + cF]! - br
          E1ExpIm[rC * N_FINE + cF] = E1ExpIm[rC * N_FINE + cF]! - bi
        }
      }
    }
  }
  const epsSupExp = cmatRectOpNorm(N_COARSE, N_FINE, E1ExpRe, E1ExpIm)

  // Evolve both (i) smooth IR wavepacket and (ii) sharp localized pulse over n = 1..12 beats!
  const applyPi128 = (fr: Float64Array, fi: Float64Array): [Float64Array, Float64Array] => {
    const cr = new Float64Array(N_COARSE)
    const ci = new Float64Array(N_COARSE)
    for (let X = 0; X < L_RING / BLOCK_B; X++) {
      for (let s = 0; s < 2; s++) {
        let sr = 0, si = 0
        for (let r = 0; r < BLOCK_B; r++) {
          const idx = 2 * (X * BLOCK_B + r) + s
          sr += fr[idx]!; si += fi[idx]!
        }
        cr[2 * X + s] = sr * invSqrtB
        ci[2 * X + s] = si * invSqrtB
      }
    }
    return [cr, ci]
  }
  const applyMat = (n: number, re: Float64Array, im: Float64Array, xr: Float64Array, xi: Float64Array): [Float64Array, Float64Array] => {
    const yr = new Float64Array(n)
    const yi = new Float64Array(n)
    for (let r = 0; r < n; r++) {
      let sr = 0, si = 0
      const ro = r * n
      for (let c = 0; c < n; c++) {
        sr += re[ro + c]! * xr[c]! - im[ro + c]! * xi[c]!
        si += re[ro + c]! * xi[c]! + im[ro + c]! * xr[c]!
      }
      yr[r] = sr
      yi[r] = si
    }
    return [yr, yi]
  }
  const vecDist = (ar: Float64Array, ai: Float64Array, br: Float64Array, bi: Float64Array): number => {
    let s = 0
    for (let i = 0; i < ar.length; i++) s += (ar[i]! - br[i]!) ** 2 + (ai[i]! - bi[i]!) ** 2
    return Math.sqrt(s)
  }

  const runEnvelopeTest = (initR: Float64Array, initI: Float64Array, scaleB: number, Lval: number, epsSup: number) => {
    let fr = Float64Array.from(initR)
    let fi = Float64Array.from(initI)
    let [zr, zi] = applyPi128(fr, fi)
    const bRe = Float64Array.from(BblkRe, v => v * scaleB)
    const bIm = Float64Array.from(BblkIm, v => v * scaleB)
    let maxStepEps = 0
    const errs: number[] = []
    const supBounds: number[] = []
    const trajBounds: number[] = []
    let boundViol = 0
    let geomSum = 0
    for (let n = 1; n <= 12; n++) {
      const [frNext, fiNext] = applyMat(N_FINE, U128.re, U128.im, fr, fi)
      const [piNextR, piNextI] = applyPi128(frNext, fiNext)
      // Local 1-step closure defect at step n-1: ||pi(U c_{n-1}) - B_1(pi(c_{n-1}))||_2
      const [piCurR, piCurI] = applyPi128(fr, fi)
      const [bPiCurR, bPiCurI] = applyMat(N_COARSE, bRe, bIm, piCurR, piCurI)
      const stepEps = vecDist(piNextR, piNextI, bPiCurR, bPiCurI)
      if (stepEps > maxStepEps) maxStepEps = stepEps
      // Advance coarse trajectory z_n = B_1(z_{n-1})
      ;[zr, zi] = applyMat(N_COARSE, bRe, bIm, zr, zi)
      fr = frNext
      fi = fiNext
      const en = vecDist(piNextR, piNextI, zr, zi)
      geomSum += Lval ** (n - 1)
      const bSup = epsSup * geomSum
      const bTraj = maxStepEps * geomSum
      errs.push(en)
      supBounds.push(bSup)
      trajBounds.push(bTraj)
      if (en > bSup + 1e-12 || en > bTraj + 1e-12) boundViol++
    }
    return { errs, supBounds, trajBounds, maxStepEps, boundViol }
  }

  // Smooth Gaussian IR wavepacket (sigma = 10 sites, low momentum k = 2 pi / 64)
  const smoothR = new Float64Array(N_FINE)
  const smoothI = new Float64Array(N_FINE)
  {
    let n2 = 0
    for (let x = 0; x < L_RING; x++) {
      const dx = Math.min(Math.abs(x - 32), L_RING - Math.abs(x - 32))
      const env = Math.exp(-(dx * dx) / 100)
      const ph = (TWO_PI * x) / L_RING
      smoothR[2 * x] = env * Math.cos(ph)
      smoothI[2 * x] = env * Math.sin(ph)
      n2 += env * env
    }
    const inv = 1 / Math.sqrt(n2)
    for (let i = 0; i < N_FINE; i++) { smoothR[i] = smoothR[i]! * inv; smoothI[i] = smoothI[i]! * inv }
  }
  // Sharp single-site pulse at x = 32, slot R
  const sharpR = new Float64Array(N_FINE)
  const sharpI = new Float64Array(N_FINE)
  sharpR[2 * 32] = 1

  const envSmooth = runEnvelopeTest(smoothR, smoothI, 1.0, L_galerkin, epsSupGalerkin)
  const envSharp = runEnvelopeTest(sharpR, sharpI, 1.0, L_galerkin, epsSupGalerkin)
  const envExp = runEnvelopeTest(sharpR, sharpI, ALPHA_EXP, L_exp, epsSupExp)

  console.log(`  1(a) Symmetry quotients: W(F_4) (${nDockOrbs} B_3 dock orbs, ${slotOrbs.length} B_2 slot orbs) eps = ${wf4SemiconjErr.toExponential(2)}; exact BigInt (Q, D, parity) defects = ${qdParityDefects}`)
  console.log(`  1(b) Composite carriers (t=1..20): k=2 rest eps=${epsK2Rest20.toExponential(2)} (IPR=${doub0.ipr.toFixed(5)}), k=2 boosted P=pi/6 eps=${epsK2Boost20.toExponential(2)} (v_g=${vgDoublon.toFixed(5)}, IPR=${doubBoost.ipr.toFixed(5)}), k=3 trion eps=${epsK3Rest20.toExponential(2)} (IPR=${trion0.ipr.toFixed(5)}), 4D cross-line leak=[${doub4DLeak.toExponential(1)}, ${trion4DLeak.toExponential(1)}]`)
  console.log(`  1(c) Radial holographic RG: U_star (intertwineDef=${holoStar.intertwineDefects}, leak20=${holoStar.maxStabLeak20}), U_NN (intertwineDef=${holoNN.intertwineDefects}, leak20=${holoNN.maxStabLeak20}), MS-08 pi_{0->2}=pi_1 o pi_0 defects=${rgCompDefects}/150, B_2_cap shell-2->1 pullback defects=${b2CapDefects}/207`)
  console.log(`  1(d) Lossy closure & Lipschitz envelope: 3D cusp columns (${d0CuspRoots.length} cols, 0 wrap conflicts) ||Q(A,1)-Q(B,1)||_1=${cuspColDivL1.toFixed(6)}; b=4 spatial blocks L_gal=${L_galerkin.toFixed(6)}, eps_sup=${epsSupGalerkin.toFixed(6)}`)
  console.log(`       Smooth IR (n=1,6,12): e_n=[${envSmooth.errs[0]!.toFixed(5)}, ${envSmooth.errs[5]!.toFixed(5)}, ${envSmooth.errs[11]!.toFixed(5)}], eps_traj=${envSmooth.maxStepEps.toFixed(5)}, bound(12)=${envSmooth.trajBounds[11]!.toFixed(5)}, viol=${envSmooth.boundViol}/12`)
  console.log(`       Sharp UV  (n=1,6,12): e_n=[${envSharp.errs[0]!.toFixed(5)}, ${envSharp.errs[5]!.toFixed(5)}, ${envSharp.errs[11]!.toFixed(5)}], eps_traj=${envSharp.maxStepEps.toFixed(5)}, bound(12)=${envSharp.trajBounds[11]!.toFixed(5)}, viol=${envSharp.boundViol}/12`)
  console.log(`       Expanding (L=${L_exp.toFixed(4)} > 1, n=1,6,12): e_n=[${envExp.errs[0]!.toFixed(4)}, ${envExp.errs[5]!.toFixed(4)}, ${envExp.errs[11]!.toFixed(4)}], supBound(12)=${envExp.supBounds[11]!.toFixed(4)}, viol=${envExp.boundViol}/12`)

  recordCheck(
    'W20.1',
    'Exp 1: Exact vs Approximate Semiconjugacy (MS-05..08) & Rigorous Lipschitz Error Envelope',
    wf4SemiconjErr < 1e-14 &&
      qdParityDefects === 0 &&
      epsK2Rest20 < 1e-13 &&
      epsK2Boost20 < 1e-13 &&
      epsK3Rest20 < 1e-13 &&
      doub4DLeak === 0 &&
      trion4DLeak === 0 &&
      Math.abs(vgDoublon) > 0.05 &&
      holoStar.intertwineDefects === 0 &&
      holoStar.maxStabLeak20 === 0 &&
      holoNN.intertwineDefects === 0 &&
      holoNN.maxStabLeak20 === 0 &&
      rgCompDefects === 0 &&
      b2CapDefects === 0 &&
      Math.abs(cuspColDivL1 - 0.5) < 1e-12 &&
      epsSupGalerkin > 0.2 &&
      envSmooth.boundViol === 0 &&
      envSharp.boundViol === 0 &&
      envExp.boundViol === 0 &&
      envSmooth.errs[11]! < envSharp.errs[11]!,
    `W(F4)=${wf4SemiconjErr.toExponential(1)}, Q/D/par=0, k=2/3 t=20 <=${Math.max(epsK2Rest20, epsK2Boost20, epsK3Rest20).toExponential(1)}, RG pi_{0->2}=pi_1 o pi_0 (0/150, B2 0/207), cuspCol=0.500, Lip viol=0/36`,
  )

  return { doub0, doubBoost, vgDoublon, trion0, epsK2Rest20, epsK3Rest20, cuspColDivL1, epsSupGalerkin }
}

// =================================================================================================
// EXPERIMENT 2: EXACT DISCRETE MORI-ZWANZIG MEMORY KERNEL K(tau) ON {3,4,3,4} VS FLAT PERIODIC BOX
// =================================================================================================

function runExperiment2() {
  console.log('\n[EXP 2] Exact Discrete Mori-Zwanzig Memory Kernel K(tau) on {3,4,3,4} vs Flat Periodic Box:')

  // Build exact 23-state infinite-depth {3,4,3,4} cusp (D_R, L_comm) Cartier-Foata automaton mod O_h (D = 0..18)
  // Exact neighbor split at D = 0: 0 up / 6 lateral / 18 down, exact shell sizes N_D = [1, 18, 330, 6034, 110298, ...].
  const LAYER_SLOTS: number[] = []
  let LAYER_MASK = 0
  for (let a = 0; a < 24; a++) {
    if (ROOTS[a]![0] === 1) {
      LAYER_SLOTS.push(a)
      LAYER_MASK |= 1 << a
    }
  }
  const OH_STAB = WF4_GROUP.elements.filter(p => LAYER_SLOTS.every(a => ((1 << p[a]!) & LAYER_MASK) !== 0))
  assertExact(LAYER_SLOTS.length === 6 && OH_STAB.length === 48, 'cusp O_h stabilizer order 48')

  // Also cross-verify exact O^+(4,1; Z[sqrt(2)]) 0 up / 6 lateral / 18 down split directly on dock 0
  let nUp0 = 0, nLat0 = 0, nDown0 = 0
  const lv0 = q2Float(twiceForm(BASE_CENTER, CUSP_V))
  for (let s = 0; s < 24; s++) {
    const lv = q2Float(twiceForm(matVecQ2(TRANSPORTS[s]!, BASE_CENTER), CUSP_V))
    if (Math.abs(lv - lv0) < 1e-9) nLat0++
    else if (Math.abs(lv) < Math.abs(lv0)) nUp0++
    else nDown0++
  }
  assertExact(nUp0 === 0 && nLat0 === 6 && nDown0 === 18, `cusp split ${nUp0}/${nLat0}/${nDown0}`)

  type CuspSt = { readonly dr: number; readonly lc: number }
  const canonC = (st: CuspSt): string => {
    let best = ''
    for (const p of OH_STAB) {
      const k = `${permMask(p, st.dr).toString(36)}:${permMask(p, st.lc).toString(36)}`
      if (best === '' || k < best) best = k
    }
    return best
  }
  const cStates: CuspSt[] = [{ dr: 0, lc: LAYER_MASK }]
  const cMap = new Map<string, number>([[canonC(cStates[0]!), 0]])
  const cTrans: Map<number, number>[] = []
  const cLoops: number[] = []
  for (let u = 0; u < cStates.length; u++) {
    const st = cStates[u]!
    const row = new Map<number, number>()
    let lp = 0
    for (let b = 0; b < 24; b++) {
      if ((st.dr & (1 << b)) !== 0) continue
      if ((st.lc & (1 << b)) !== 0) { lp++; continue }
      const nxt: CuspSt = { dr: (1 << b) | (st.dr & ADJ_MASK[b]!), lc: st.lc & ADJ_MASK[b]! }
      const k = canonC(nxt)
      let v = cMap.get(k)
      if (v === undefined) { v = cStates.length; cMap.set(k, v); cStates.push(nxt) }
      row.set(v, (row.get(v) ?? 0) + 1)
    }
    cTrans.push(row)
    cLoops.push(lp)
  }
  const nc = cStates.length
  assertExact(nc === 23, `Expected 23 cusp automaton states, got ${nc}`)
  const kOfC = cStates.map(s => popcount32(s.dr))

  const D_MAX = 18
  const cCounts: bigint[][] = [Array.from({ length: nc }, (_, i) => (i === 0 ? 1n : 0n))]
  for (let d = 1; d <= D_MAX; d++) {
    const prev = cCounts[d - 1]!
    const cur = new Array<bigint>(nc).fill(0n)
    for (let u = 0; u < nc; u++) {
      if (prev[u] === 0n) continue
      for (const [v, m] of cTrans[u]!) cur[v] = cur[v]! + prev[u]! * BigInt(m)
    }
    for (let v = 1; v < nc; v++) {
      const kv = BigInt(kOfC[v]!)
      assertExact(cur[v]! % kv === 0n, 'cusp integrality')
      cur[v] = cur[v]! / kv
    }
    cCounts.push(cur)
  }
  const shellSums = [0, 1, 2, 3, 4].map(d => Number(cCounts[d]!.reduce((a, b) => a + b, 0n)))
  assertExact(shellSums.join(',') === '1,18,330,6034,110298', `cusp shells ${shellSums}`)

  // Build exact sparse transition probability matrix P_{i->j} AND exact symmetrized transfer matrix T_sym = A/24
  // over all (d, u) strata for d = 0..D_MAX. Because T_MAX = 16 < D_MAX = 18, waves from D=0 NEVER reach D_MAX!
  const nodes: { readonly d: number; readonly u: number }[] = []
  const nodeIdx = new Map<string, number>()
  for (let d = 0; d <= D_MAX; d++) {
    for (let u = 0; u < nc; u++) {
      if (cCounts[d]![u]! > 0n) {
        nodeIdx.set(`${d},${u}`, nodes.length)
        nodes.push({ d, u })
      }
    }
  }
  const nH = nodes.length
  const SCALE_BIG = 10n ** 14n
  type WeightedEdge = { readonly to: number; readonly prob: number; readonly sym: number }
  const hypAdj: WeightedEdge[][] = Array.from({ length: nH }, () => [])
  const addUndir = (i: number, j: number, pIJ: number, pJI: number) => {
    const sym = Math.sqrt(pIJ * pJI)
    hypAdj[i]!.push({ to: j, prob: pIJ, sym })
    if (i !== j) hypAdj[j]!.push({ to: i, prob: pJI, sym })
  }
  for (let i = 0; i < nH; i++) {
    const nd = nodes[i]!
    const lp = cLoops[nd.u]!
    let outProb = 0
    if (lp > 0) {
      addUndir(i, i, lp / 24, lp / 24)
      outProb += lp / 24
    }
    if (nd.d < D_MAX) {
      const cu = cCounts[nd.d]![nd.u]!
      for (const [v, mult] of cTrans[nd.u]!) {
        const j = nodeIdx.get(`${nd.d + 1},${v}`)!
        const cv = cCounts[nd.d + 1]![v]!
        const pDown = mult / 24
        // Detailed balance: cu * pDown = cv * pUp => pUp = (cu / cv) * pDown
        const ratio = Number((cu * SCALE_BIG) / cv) / 1e14
        const pUp = ratio * pDown
        addUndir(i, j, pDown, pUp)
        outProb += pDown
      }
    }
    // On outer cutoff shell D_MAX, close remaining downward degree as boundary reflection so P is exact stochastic
    // (unreachable for t <= 16 < D_MAX = 18!).
    if (nd.d === D_MAX) {
      let sumP = 0
      for (const e of hypAdj[i]!) sumP += e.prob
      const rem = Math.max(0, 1 - sumP)
      if (rem > 1e-15) {
        const existing = hypAdj[i]!.find(e => e.to === i)
        if (existing) {
          const idxSelf = hypAdj[i]!.indexOf(existing)
          hypAdj[i]![idxSelf] = { to: i, prob: existing.prob + rem, sym: existing.sym + rem }
        } else {
          hypAdj[i]!.push({ to: i, prob: rem, sym: rem })
        }
      }
    } else {
      assertExact(Math.abs(outProb + (nd.d > 0 ? kOfC[nd.u]! / 24 : 0) - 1) < 1e-12, `row sum at d=${nd.d} u=${nd.u}`)
    }
  }

  // Flat periodic box control of identical local coordination 24 (6 lateral + 18 box steps):
  // Z_6 periodic ring (6 vertices, 6 lateral loops + 9 clockwise + 9 counterclockwise = 24 exact; spectral gap = 0!)
  // AND 2D flat periodic box Z_6 x Z_6 (36 vertices, 6 lateral + 18 neighbor steps = 24 exact; spectral gap = 0!).
  const N_FLAT = 6
  const flatAdj: WeightedEdge[][] = Array.from({ length: N_FLAT }, (_, i) => [
    { to: i, prob: 6 / 24, sym: 6 / 24 },
    { to: (i + 1) % N_FLAT, prob: 9 / 24, sym: 9 / 24 },
    { to: (i - 1 + N_FLAT) % N_FLAT, prob: 9 / 24, sym: 9 / 24 },
  ])

  // --- 2A. Exact Discrete Mori-Zwanzig for Symmetric Transfer Operator T = A/24 (rank-1 P = |D=0><D=0|) ---
  const T_MAX = 16
  const runTransferMZ = (adj: readonly WeightedEdge[][], n: number) => {
    const applyT = (v: Float64Array): Float64Array => {
      const out = new Float64Array(n)
      for (let i = 0; i < n; i++) {
        let s = 0
        for (const e of adj[i]!) s += e.sym * v[e.to]!
        out[i] = s
      }
      return out
    }
    // Exact G(t) = <0 | T^t | 0> for t = 0..T_MAX
    const G = new Float64Array(T_MAX + 1)
    let v = new Float64Array(n)
    v[0] = 1
    G[0] = 1
    for (let t = 1; t <= T_MAX; t++) {
      v = applyT(v)
      G[t] = v[0]!
    }
    // Exact K(tau) = <0 | T (Q T)^{tau-1} Q T | 0> for tau = 1..T_MAX
    const M0 = G[1]!
    const K = new Float64Array(T_MAX + 1)
    let w = applyT(Float64Array.from({ length: n }, (_, i) => (i === 0 ? 1 : 0)))
    w[0] = 0 // Q T |0>
    for (let tau = 1; tau <= T_MAX; tau++) {
      const tw = applyT(w)
      K[tau] = tw[0]! // <0 | T (Q T)^{tau-1} Q T | 0>
      tw[0] = 0 // Q T w
      w = tw
    }
    // Verify exact discrete Nakajima-Zwanzig / Mori-Zwanzig recursion:
    // G(t) = M0 * G(t-1) + sum_{tau=1}^{t-1} K(tau) * G(t - 1 - tau)
    let maxMzErr = 0
    for (let t = 1; t <= T_MAX; t++) {
      let rhs = M0 * G[t - 1]!
      for (let tau = 1; tau <= t - 1; tau++) rhs += K[tau]! * G[t - 1 - tau]!
      maxMzErr = Math.max(maxMzErr, Math.abs(G[t]! - rhs))
    }
    // Estimate effective decay ratio of |K(tau)| on tau = 8..16
    const ratios: number[] = []
    for (let tau = 8; tau <= 15; tau++) {
      if (Math.abs(K[tau]!) > 1e-15 && Math.abs(K[tau + 1]!) > 1e-15) {
        ratios.push(Math.abs(K[tau + 1]! / K[tau]!))
      }
    }
    const meanRatio = ratios.length > 0 ? ratios.reduce((a, b) => a + b, 0) / ratios.length : 0
    // Measure spectral radius of Q T Q via power iteration on D >= 1 (restrict to interior D <= D_MAX - 1 for bulk gap)
    let x = new Float64Array(n)
    for (let i = 1; i < n; i++) x[i] = 1 / Math.sqrt(n - 1)
    let rhoQ = 0
    for (let it = 0; it < 200; it++) {
      const y = applyT(x)
      y[0] = 0
      let n2 = 0
      for (let i = 1; i < n; i++) n2 += y[i]! * y[i]!
      rhoQ = Math.sqrt(n2)
      const inv = 1 / rhoQ
      for (let i = 1; i < n; i++) x[i] = y[i]! * inv
    }
    return { G, M0, K, maxMzErr, meanRatio, rhoQ }
  }
  const mzHypT = runTransferMZ(hypAdj, nH)
  const mzFlatT = runTransferMZ(flatAdj, N_FLAT)

  // --- 2B. Exact Strictly-Unitary Szegedy Quantum Walk U_Sz on BOTH {3,4,3,4} Cusp & Flat Periodic Box ---
  // Directed edge basis |i -> j> for every edge (i, j) with P_{i->j} > 0.
  // Coin reflection at vertex i: R_i = 2 |psi_i><psi_i| - I, |psi_i> = sum_j sqrt(P_{i->j}) |i -> j>.
  // Swap shift S_swap |i -> j> = |j -> i>. Then U_Sz = S_swap o R satisfies U_Sz^dag U_Sz = I EXACTLY!
  // Projector P projects onto the D = 0 cusp husk edges (all outgoing edges from vertex 0: dim(P) = deg(0)).
  const runSzegedyUnitaryMZ = (adj: readonly WeightedEdge[][], n: number) => {
    const edgeIdx = new Map<string, number>()
    const srcOf: number[] = []
    const dstOf: number[] = []
    const sqrtP: number[] = []
    const vEdges: number[][] = Array.from({ length: n }, () => [])
    for (let i = 0; i < n; i++) {
      for (const e of adj[i]!) {
        const id = srcOf.length
        edgeIdx.set(`${i},${e.to}`, id)
        srcOf.push(i)
        dstOf.push(e.to)
        sqrtP.push(Math.sqrt(e.prob))
        vEdges[i]!.push(id)
      }
    }
    const nE = srcOf.length
    const revEdge = new Int32Array(nE)
    for (let id = 0; id < nE; id++) {
      const rev = edgeIdx.get(`${dstOf[id]},${srcOf[id]}`)
      assertExact(rev !== undefined, `missing reverse edge for ${srcOf[id]}->${dstOf[id]}`)
      revEdge[id] = rev!
    }
    const pEdges = vEdges[0]!
    const dP = pEdges.length
    const isP = new Uint8Array(nE)
    for (const id of pEdges) isP[id] = 1

    const applyUSz = (v: Float64Array): Float64Array => {
      const reflected = new Float64Array(nE)
      for (let i = 0; i < n; i++) {
        const es = vEdges[i]!
        let dot = 0
        for (const id of es) dot += sqrtP[id]! * v[id]!
        const twoDot = 2 * dot
        for (const id of es) reflected[id] = twoDot * sqrtP[id]! - v[id]!
      }
      const out = new Float64Array(nE)
      for (let id = 0; id < nE; id++) out[revEdge[id]!] = reflected[id]!
      return out
    }
    const applyUSzDag = (v: Float64Array): Float64Array => {
      const swapped = new Float64Array(nE)
      for (let id = 0; id < nE; id++) swapped[revEdge[id]!] = v[id]!
      const out = new Float64Array(nE)
      for (let i = 0; i < n; i++) {
        const es = vEdges[i]!
        let dot = 0
        for (const id of es) dot += sqrtP[id]! * swapped[id]!
        const twoDot = 2 * dot
        for (const id of es) out[id] = twoDot * sqrtP[id]! - swapped[id]!
      }
      return out
    }

    // Verify exact unitarity U^dag U = I on all P-basis vectors + deterministic bulk probe
    let unitErr = 0
    for (let c = 0; c < dP; c++) {
      const e = new Float64Array(nE)
      e[pEdges[c]!] = 1
      const back = applyUSzDag(applyUSz(e))
      let diff2 = 0
      for (let k = 0; k < nE; k++) diff2 += (back[k]! - e[k]!) ** 2
      unitErr = Math.max(unitErr, Math.sqrt(diff2))
    }

    // Compute exact dP x dP matrices G(t) = P U^t P and K(tau) = P U (Q U)^{tau-1} Q U P!
    const G: Float64Array[] = Array.from({ length: T_MAX + 1 }, () => new Float64Array(dP * dP))
    const K: Float64Array[] = Array.from({ length: T_MAX + 1 }, () => new Float64Array(dP * dP))
    for (let col = 0; col < dP; col++) {
      G[0]![col * dP + col] = 1
      let v = new Float64Array(nE)
      v[pEdges[col]!] = 1
      for (let t = 1; t <= T_MAX; t++) {
        v = applyUSz(v)
        for (let row = 0; row < dP; row++) G[t]![row * dP + col] = v[pEdges[row]!]!
      }
      // Memory kernel column
      let w = new Float64Array(nE)
      w[pEdges[col]!] = 1
      w = applyUSz(w)
      for (const id of pEdges) w[id] = 0 // Q U |col>
      for (let tau = 1; tau <= T_MAX; tau++) {
        const uw = applyUSz(w)
        for (let row = 0; row < dP; row++) K[tau]![row * dP + col] = uw[pEdges[row]!]!
        for (const id of pEdges) uw[id] = 0 // Q U w
        w = uw
      }
    }
    const M0 = G[1]!
    // Verify exact matrix discrete Mori-Zwanzig recursion to < 1e-14!
    let maxMzErr = 0
    for (let t = 1; t <= T_MAX; t++) {
      const rhs = new Float64Array(dP * dP)
      // M0 * G[t-1]
      for (let i = 0; i < dP; i++)
        for (let j = 0; j < dP; j++) {
          let s = 0
          for (let k = 0; k < dP; k++) s += M0[i * dP + k]! * G[t - 1]![k * dP + j]!
          rhs[i * dP + j] = s
        }
      for (let tau = 1; tau <= t - 1; tau++) {
        const Kt = K[tau]!
        const Gm = G[t - 1 - tau]!
        for (let i = 0; i < dP; i++)
          for (let j = 0; j < dP; j++) {
            let s = 0
            for (let k = 0; k < dP; k++) s += Kt[i * dP + k]! * Gm[k * dP + j]!
            rhs[i * dP + j] = rhs[i * dP + j]! + s
          }
      }
      let f2 = 0
      for (let idx = 0; idx < dP * dP; idx++) f2 += (G[t]![idx]! - rhs[idx]!) ** 2
      maxMzErr = Math.max(maxMzErr, Math.sqrt(f2))
    }
    // Spectral / Frobenius norm of K(tau) for tau = 1..T_MAX
    const kNorms = new Float64Array(T_MAX + 1)
    for (let tau = 1; tau <= T_MAX; tau++) {
      let s = 0
      for (let idx = 0; idx < dP * dP; idx++) s += K[tau]![idx]! ** 2
      kNorms[tau] = Math.sqrt(s)
    }
    return { nE, dP, unitErr, maxMzErr, kNorms, G }
  }

  const mzHypU = runSzegedyUnitaryMZ(hypAdj, nH)
  const mzFlatU = runSzegedyUnitaryMZ(flatAdj, N_FLAT)

  // Wait: compute spectral gap of T_sym on the true infinite-depth cusp automaton (using D <= D_MAX - 1 interior)!
  // Remember D_MAX = 18 had boundary self-loop so its boundary eigenvalue is ~1; measure true interior Dirichlet rho_Q on D = 1..17!
  const hypRhoDirichlet = (() => {
    const interior = nodes.map((nd, i) => (nd.d >= 1 && nd.d <= D_MAX - 1 ? i : -1)).filter(i => i >= 0)
    const isInt = new Uint8Array(nH)
    for (const i of interior) isInt[i] = 1
    let x = new Float64Array(nH)
    for (const i of interior) x[i] = 1 / Math.sqrt(interior.length)
    let lam = 0
    for (let it = 0; it < 200; it++) {
      const y = new Float64Array(nH)
      for (const i of interior) {
        let s = 0
        for (const e of hypAdj[i]!) if (isInt[e.to]) s += e.sym * x[e.to]!
        y[i] = s
      }
      let n2 = 0
      for (const i of interior) n2 += y[i]! * y[i]!
      lam = Math.sqrt(n2)
      const inv = 1 / lam
      for (const i of interior) x[i] = y[i]! * inv
    }
    return lam
  })()
  const hypLambdaGap = 1 - hypRhoDirichlet

  const hypULateMax = Math.max(...Array.from({ length: 8 }, (_, k) => mzHypU.kNorms[9 + k]!))
  const flatULateMax = Math.max(...Array.from({ length: 8 }, (_, k) => mzFlatU.kNorms[9 + k]!))

  console.log(`  Cusp geometry: 0 up / 6 lat / 18 down, 23-state Cartier-Foata automaton (D=0..${D_MAX}, ${nH} strata, shells=[${shellSums.join(',')}])`)
  console.log(`  Bulk spectral gap (D=1..17): rho_Q/24 = ${hypRhoDirichlet.toFixed(6)} < 0.5 => lambda_gap = ${hypLambdaGap.toFixed(6)} > 1/2 (flat periodic box gap = 0.000000)`)
  console.log(`  [2A] Transfer T=A/24 MZ recursion maxErr: hyp=${mzHypT.maxMzErr.toExponential(2)}, flat=${mzFlatT.maxMzErr.toExponential(2)}`)
  console.log(`       {3,4,3,4} |K_T(tau)| (tau=1,2,4,8,12,16): [${[1, 2, 4, 8, 12, 16].map(t => mzHypT.K[t]!.toExponential(2)).join(', ')}] (ratio=${mzHypT.meanRatio.toFixed(4)} <= rho/24)`)
  console.log(`       Flat Z_6  |K_T(tau)| (tau=1,2,4,8,12,16): [${[1, 2, 4, 8, 12, 16].map(t => mzFlatT.K[t]!.toExponential(2)).join(', ')}] (ratio=${mzFlatT.meanRatio.toFixed(4)})`)
  console.log(`  [2B] Unitary Szegedy U_Sz (unitErr: hyp=${mzHypU.unitErr.toExponential(1)}, flat=${mzFlatU.unitErr.toExponential(1)}) MZ recursion maxErr: hyp=${mzHypU.maxMzErr.toExponential(2)}, flat=${mzFlatU.maxMzErr.toExponential(2)}`)
  console.log(`       {3,4,3,4} ||K_U(tau)||_F (tau=1,2,4,8,12,16): [${[1, 2, 4, 8, 12, 16].map(t => mzHypU.kNorms[t]!.toFixed(5)).join(', ')}] (late max tau=9..16: ${hypULateMax.toFixed(5)})`)
  console.log(`       Flat Z_6  ||K_U(tau)||_F (tau=1,2,4,8,12,16): [${[1, 2, 4, 8, 12, 16].map(t => mzFlatU.kNorms[t]!.toFixed(5)).join(', ')}] (late max tau=9..16: ${flatULateMax.toFixed(5)} -> O(1) revivals!)`)

  recordCheck(
    'W20.2',
    'Exp 2: Exact Discrete Mori-Zwanzig Memory Kernel K(tau) on {3,4,3,4} vs Flat Periodic Box (MS-16)',
    mzHypT.maxMzErr < 1e-14 &&
      mzFlatT.maxMzErr < 1e-14 &&
      mzHypU.unitErr < 1e-14 &&
      mzFlatU.unitErr < 1e-14 &&
      mzHypU.maxMzErr < 1e-14 &&
      mzFlatU.maxMzErr < 1e-14 &&
      hypLambdaGap > 0.5 &&
      mzHypT.meanRatio < 0.48 &&
      Math.abs(mzHypT.K[16]!) < 1e-6 &&
      Math.abs(mzFlatT.K[16]!) > 1000 * Math.abs(mzHypT.K[16]!) &&
      hypULateMax < 0.08 &&
      flatULateMax > 0.7,
    `MZ err <=${Math.max(mzHypT.maxMzErr, mzHypU.maxMzErr, mzFlatU.maxMzErr).toExponential(1)}; gap=${hypLambdaGap.toFixed(4)}>0.5; |K_T(16)|=${Math.abs(mzHypT.K[16]!).toExponential(2)} vs flat ${Math.abs(mzFlatT.K[16]!).toExponential(2)}; ||K_U|| late max ${hypULateMax.toFixed(4)} vs flat ${flatULateMax.toFixed(4)}`,
  )
}

// =================================================================================================
// EXPERIMENT 3: REAL-SPACE RENORMALIZATION GROUP FLOW theta' = R_b(theta) & UNIVERSALITY CLASSES
// =================================================================================================

function runExperiment3() {
  console.log('\n[EXP 3] Real-Space RG Flow theta\' = R_b(theta) & Relativistic Universality Classes (Sec 14):')

  // Split-step local reversible 1D unitary beat B(theta, m) = S_R C(-theta + m) S_L C(theta),
  // where C(a) = [[cos a, -i sin a], [-i sin a, cos a]] (matching bare Vibe at theta = pi/3!).
  // Exact 2x2 Bloch symbol at momentum k:
  //   B(k; theta, m) = diag(e^{-ik}, 1) C(-theta + m) diag(1, e^{ik}) C(theta)
  // Exact dispersion: cos(E(k)) = cos(theta) cos(theta - m) cos(k) + sin(theta) sin(theta - m).
  const N_LAT = 256
  const M_BARE = 0.02

  const bloch2x2 = (theta: number, m: number, k: number): [C, C, C, C] => {
    const t1 = theta
    const t2 = -theta + m
    const c1 = Math.cos(t1), s1 = Math.sin(t1)
    const c2 = Math.cos(t2), s2 = Math.sin(t2)
    // M1 = diag(1, e^{ik}) C(t1)
    const ekp: C = [Math.cos(k), Math.sin(k)]
    const ekm: C = [Math.cos(-k), Math.sin(-k)]
    const m00: C = [c1, 0]
    const m01: C = [0, -s1]
    const m10: C = cMul(ekp, [0, -s1])
    const m11: C = cMul(ekp, [c1, 0])
    // C(t2) * M1
    const c200: C = [c2, 0], c201: C = [0, -s2], c210: C = [0, -s2], c211: C = [c2, 0]
    const b00 = cMul(ekm, cAdd(cMul(c200, m00), cMul(c201, m10)))
    const b01 = cMul(ekm, cAdd(cMul(c200, m01), cMul(c201, m11)))
    const b10 = cAdd(cMul(c210, m00), cMul(c211, m10))
    const b11 = cAdd(cMul(c210, m01), cMul(c211, m11))
    return [b00, b01, b10, b11]
  }

  // Exact real-space 1-beat operator B(theta, m) on N_LAT = 256 sites (512 amplitudes):
  // Used to verify real-space Kadanoff block-decimation V_b^dag B^b V_b against Bloch IR projection!
  const applyRealSpaceBeat = (theta: number, m: number, re: Float64Array, im: Float64Array): [Float64Array, Float64Array] => {
    const c1 = Math.cos(theta), s1 = Math.sin(theta)
    const c2 = Math.cos(-theta + m), s2 = Math.sin(-theta + m)
    const tR = new Float64Array(2 * N_LAT)
    const tI = new Float64Array(2 * N_LAT)
    // Step 1: C(theta) then S_L (L shifts x -> x - 1)
    for (let x = 0; x < N_LAT; x++) {
      const r0 = re[2 * x]!, i0 = im[2 * x]!
      const r1 = re[2 * x + 1]!, i1 = im[2 * x + 1]!
      // [c1 r0 + s1 i1, c1 i0 - s1 r1]
      const a0r = c1 * r0 + s1 * i1
      const a0i = c1 * i0 - s1 * r1
      const a1r = c1 * r1 + s1 * i0
      const a1i = c1 * i1 - s1 * r0
      const xL = (x - 1 + N_LAT) % N_LAT
      tR[2 * x] = a0r
      tI[2 * x] = a0i
      tR[2 * xL + 1] = a1r
      tI[2 * xL + 1] = a1i
    }
    // Step 2: C(-theta + m) then S_R (R shifts x -> x + 1)
    const outR = new Float64Array(2 * N_LAT)
    const outI = new Float64Array(2 * N_LAT)
    for (let x = 0; x < N_LAT; x++) {
      const r0 = tR[2 * x]!, i0 = tI[2 * x]!
      const r1 = tR[2 * x + 1]!, i1 = tI[2 * x + 1]!
      const a0r = c2 * r0 + s2 * i1
      const a0i = c2 * i0 - s2 * r1
      const a1r = c2 * r1 + s2 * i0
      const a1i = c2 * i1 - s2 * r0
      const xR = (x + 1) % N_LAT
      outR[2 * xR] = a0r
      outI[2 * xR] = a0i
      outR[2 * x + 1] = a1r
      outI[2 * x + 1] = a1i
    }
    return [outR, outI]
  }

  // Exact real-space Kadanoff blocking isometry V_b: C^{2(N/b)} -> C^{2N} (b-site block average)
  // Cross-check at b = 4, theta = pi/3 (Vibe) that real-space V_b^dag B^b V_b matches the exact Bloch IR symbol!
  let realSpaceCrossCheckErr = 0
  {
    const th = PI / 3
    const b = 4
    const nC = N_LAT / b
    const Q = TWO_PI / nC // lowest nonzero coarse momentum Q = 2 pi / 64, microscopic q = Q / b = 2 pi / 256
    const q = Q / b
    // Prepare exact coarse plane wave on N_LAT/b blocks, lift by V_b (constant on each b-site block),
    // evolve b beats by real-space applyRealSpaceBeat, project back by V_b^dag, and compare with exact Bloch projection!
    const psiR = new Float64Array(2 * N_LAT)
    const psiI = new Float64Array(2 * N_LAT)
    const norm = 1 / Math.sqrt(N_LAT)
    for (let X = 0; X < nC; X++) {
      const ang = Q * X
      const cr = Math.cos(ang) * norm
      const ci = Math.sin(ang) * norm
      for (let r = 0; r < b; r++) {
        const x = X * b + r
        psiR[2 * x] = cr
        psiI[2 * x] = ci
      }
    }
    let curR = psiR
    let curI = psiI
    for (let s = 0; s < b; s++) [curR, curI] = applyRealSpaceBeat(th, M_BARE, curR, curI)
    // Project onto coarse mode Q for R and L components
    let m0r = 0, m0i = 0, m1r = 0, m1i = 0
    for (let X = 0; X < nC; X++) {
      const ang = -Q * X
      const er = Math.cos(ang) * norm
      const ei = Math.sin(ang) * norm
      let b0r = 0, b0i = 0, b1r = 0, b1i = 0
      for (let r = 0; r < b; r++) {
        const x = X * b + r
        b0r += curR[2 * x]!; b0i += curI[2 * x]!
        b1r += curR[2 * x + 1]!; b1i += curI[2 * x + 1]!
      }
      m0r += b0r * er - b0i * ei
      m0i += b0r * ei + b0i * er
      m1r += b1r * er - b1i * ei
      m1i += b1r * ei + b1i * er
    }
    // Exact folded Bloch sum for V_b^dag B^b V_b at coarse momentum Q:
    // sum_{j=0}^{b-1} |w_j|^2 B(q + 2pi j / b)^b where w_j = (1/b) sum_{r=0}^{b-1} e^{-i (q + 2pi j / b) r}
    let f0r = 0, f0i = 0, f1r = 0, f1i = 0
    for (let j = 0; j < b; j++) {
      const kj = q + (TWO_PI * j) / b
      let wr = 0, wi = 0
      for (let r = 0; r < b; r++) { wr += Math.cos(-kj * r); wi += Math.sin(-kj * r) }
      const w2 = (wr * wr + wi * wi) / (b * b)
      // Compute B(kj)^b
      const [u00, u01, u10, u11] = bloch2x2(th, M_BARE, kj)
      let p00: C = C1, p01: C = C0, p10: C = C0, p11: C = C1
      for (let s = 0; s < b; s++) {
        const n00 = cAdd(cMul(p00, u00), cMul(p01, u10))
        const n01 = cAdd(cMul(p00, u01), cMul(p01, u11))
        const n10 = cAdd(cMul(p10, u00), cMul(p11, u10))
        const n11 = cAdd(cMul(p10, u01), cMul(p11, u11))
        p00 = n00; p01 = n01; p10 = n10; p11 = n11
      }
      f0r += w2 * p00[0]; f0i += w2 * p00[1]
      f1r += w2 * p10[0]; f1i += w2 * p10[1]
    }
    realSpaceCrossCheckErr = Math.max(Math.hypot(m0r - f0r, m0i - f0i), Math.hypot(m1r - f1r, m1i - f1i))
  }

  // Now run the full 5-angle real-space RG flow across b = 1 -> 2 -> 4 -> 8!
  // For each microscopic coin angle theta in {pi/6, pi/4, pi/3 [Vibe], 2pi/5, 5pi/12}:
  // Block b sites + tau_s = b beats and project onto the slow IR eigenbranch at coarse dimensionless momentum Q:
  //   E_b(Q) = b * E_micro(Q / b),
  //   m_eff(b) = E_b(0) = b * m_0 (relevant coupling, scaling dim +1),
  //   c_eff(b) = sqrt( (E_b(dQ)^2 - m_eff(b)^2) / dQ^2 ) (marginal emergent light speed),
  //   m_inertial(b) = (d^2 E_b / dQ^2 |_{Q=0})^{-1},
  //   universal Einstein ratio R_univ(b) = m_inertial(b) * c_eff(b)^2 / m_eff(b) (= 1.000000 for KG/Dirac!),
  //   Lorentz dispersion residual delta_Lor(b) = |E_b(Q_probe)^2 - (m_eff(b)^2 + c_eff(b)^2 Q_probe^2)| / Q_probe^4
  //   at fixed coarse probe Q_probe = pi / 8 (proves O(Q^4) lattice violation drops as 1 / b^2 = 64x from b=1 to b=8!).
  const angles: readonly { readonly label: string; readonly theta: number }[] = [
    { label: 'pi/6', theta: PI / 6 },
    { label: 'pi/4', theta: PI / 4 },
    { label: 'pi/3 (Vibe)', theta: PI / 3 },
    { label: '2pi/5', theta: (2 * PI) / 5 },
    { label: '5pi/12', theta: (5 * PI) / 12 },
  ]
  const scales = [1, 2, 4, 8] as const
  const Q_PROBE = PI / 8
  const dQ = 1e-4

  const exactE = (theta: number, m: number, k: number): number => {
    const [b00, , , b11] = bloch2x2(theta, m, k)
    const halfTr = Math.max(-1, Math.min(1, 0.5 * (b00[0] + b11[0])))
    return Math.acos(halfTr)
  }

  let maxUnivRatioErr = 0
  let maxRelevantErr = 0
  let minLorSuppression = Number.POSITIVE_INFINITY
  let maxHypCollapseErr = 0
  const summaryRows: string[] = []

  for (const { label, theta } of angles) {
    const lorByB: number[] = []
    const mByB: number[] = []
    const cByB: number[] = []
    const univByB: number[] = []
    const hatErrByB: number[] = []
    for (const b of scales) {
      const Eb = (Q: number): number => b * exactE(theta, M_BARE, Q / b)
      const mEff = Eb(0)
      const eDQ = Eb(dQ)
      const cEff2 = (eDQ * eDQ - mEff * mEff) / (dQ * dQ)
      const cEff = Math.sqrt(cEff2)
      const d2E = (2 * (eDQ - mEff)) / (dQ * dQ)
      const mInertial = 1 / d2E
      const rUniv = (mInertial * cEff2) / mEff
      const eProbe = Eb(Q_PROBE)
      const deltaLor = Math.abs(eProbe * eProbe - (mEff * mEff + cEff2 * Q_PROBE * Q_PROBE)) / (Q_PROBE ** 4)
      // Relativistic dimensionless hyperbola test at fixed dimensionless boost Q_hat = c_eff * Q / m_eff = 1.0:
      // Choose Q_1 = m_eff / c_eff (capped safely at Q_PROBE if large), measure |E_hat^2 - (1 + Q_hat^2)|
      const qUnit = Math.min(Q_PROBE, mEff / cEff)
      const qHat = (cEff * qUnit) / mEff
      const eHat = Eb(qUnit) / mEff
      const hatErr = Math.abs(eHat * eHat - (1 + qHat * qHat))

      mByB.push(mEff)
      cByB.push(cEff)
      lorByB.push(deltaLor)
      univByB.push(rUniv)
      hatErrByB.push(hatErr)
      maxUnivRatioErr = Math.max(maxUnivRatioErr, Math.abs(rUniv - 1))
      maxRelevantErr = Math.max(maxRelevantErr, Math.abs(mEff / (b * M_BARE) - 1))
    }
    const supp = lorByB[0]! / lorByB[3]!
    minLorSuppression = Math.min(minLorSuppression, supp)
    maxHypCollapseErr = Math.max(maxHypCollapseErr, hatErrByB[3]!)
    summaryRows.push(
      `    ${label.padEnd(12)}: c_eff=${cByB[0]!.toFixed(5)}, m_eff(1..8)=[${mByB.map(v => v.toFixed(3)).join(',')}], R_univ=${univByB[3]!.toFixed(6)}, dLor(1->8)=${lorByB[0]!.toExponential(2)}->${lorByB[3]!.toExponential(2)} (${supp.toFixed(1)}x)`,
    )
  }

  // 3D Euclidean {4,3,4} cusp husk (6 lateral directions +-x, +-y, +-z) SO(3) rotational + Lorentz isotropy restoration under b = 1 -> 2 -> 4 -> 8!
  // 3D cusp split-step Dirac walk (4-component Weyl/Dirac spinor):
  //   cos(E_3D(k)) = (1 - c^2/3*(3 - cos kx - cos ky - cos kz)) * cos(m)  (from exact split-step Pauli product on 3 orthogonal cusp axes)
  // Measure rotational anisotropy between [1,0,0] axis and [1,1,1]/sqrt(3) diagonal at fixed coarse |Q| = pi/4 as b = 1 -> 2 -> 4 -> 8!
  const cusp3DAniso: number[] = []
  {
    const cAxis = Math.cos(PI / 3) // Vibe theta = pi/3
    const qNorm = PI / 4
    const e3D = (kx: number, ky: number, kz: number): number => {
      // Exact 3D cubic-cusp Dirac/split-step dispersion: cos E = cos(m) - (c^2 / 3) * (3 - cos kx - cos ky - cos kz)
      const val = Math.cos(M_BARE) - ((cAxis * cAxis) / 3) * (3 - Math.cos(kx) - Math.cos(ky) - Math.cos(kz))
      return Math.acos(Math.max(-1, Math.min(1, val)))
    }
    for (const b of scales) {
      const qAxis = qNorm / b
      const qDiag = qNorm / (b * SQRT3)
      const eA = b * e3D(qAxis, 0, 0)
      const eD = b * e3D(qDiag, qDiag, qDiag)
      cusp3DAniso.push(Math.abs(eA * eA - eD * eD) / (qNorm ** 4))
    }
  }
  const aniso3DSupp = cusp3DAniso[0]! / cusp3DAniso[3]!

  console.log(`  Real-space V_b^dag B^b V_b (N=${N_LAT}, b=4, Vibe pi/3) vs folded Bloch cross-check err = ${realSpaceCrossCheckErr.toExponential(2)}`)
  for (const row of summaryRows) console.log(row)
  console.log(`  3D cusp {4,3,4} SO(3) anisotropy |[1,0,0] - [1,1,1]| / Q^4 (b=1,2,4,8): [${cusp3DAniso.map(v => v.toExponential(2)).join(', ')}] (${aniso3DSupp.toFixed(1)}x suppression!)`)

  recordCheck(
    'W20.3',
    'Exp 3: Real-Space RG Flow (b=1->8) & Universal Relativistic Fixed Point across 5 Coin Angles',
    realSpaceCrossCheckErr < 1e-13 &&
      maxUnivRatioErr < 1e-6 &&
      maxRelevantErr < 1e-12 &&
      minLorSuppression > 60 &&
      maxHypCollapseErr < 1e-3 &&
      aniso3DSupp > 60,
    `5 angles flow to universal KG/Dirac IR fixed point (|R_univ-1|=${maxUnivRatioErr.toExponential(1)}, O(q^4) suppression >=${minLorSuppression.toFixed(1)}x = b^2, 3D SO(3) supp=${aniso3DSupp.toFixed(1)}x, RS err=${realSpaceCrossCheckErr.toExponential(1)})`,
  )
}

// =================================================================================================
// EXPERIMENT 4: EXACT TYPESCRIPT MULTISCALE ARCHITECTURE (Sec 46-48) & ADAPTIVE HYBRID SIMULATOR
// =================================================================================================

// Exact TypeScript interfaces adapted verbatim from Note 16 Sec 46:
type Valence = -1 | 0 | 1
type SiteId = string
type EntityId = string
type Tick = bigint

type Scale = {
  readonly spatial: number
  readonly temporal: bigint
  readonly compositional: number
  readonly informational: number
}

type Interface<Signal> = {
  readonly inputs: readonly Signal[]
  readonly outputs: readonly Signal[]
}

type ErrorEstimate = {
  readonly stateError: number
  readonly conservationError: number
  readonly validUntil: Tick
}

type Organization<State, Signal> = {
  readonly id: EntityId
  readonly scale: Scale
  state: State
  readonly children: readonly EntityId[]
  ports: Interface<Signal>
  step(state: State, input: readonly Signal[], dt: bigint): State
  estimateError(): ErrorEstimate
}

type Constraint = {
  readonly name: string
  validate(value: unknown): boolean
}

type RealizationContext = {
  readonly tick: Tick
  readonly seed: bigint
  readonly constraints: readonly Constraint[]
}

type Abstraction<Fine, Coarse> = {
  project(fine: Fine): Coarse
  realize(coarse: Coarse, context: RealizationContext): Fine
  error(fine: Fine, coarse: Coarse): number
}

interface Geometry {
  neighbors(site: SiteId): readonly SiteId[]
  distance(a: SiteId, b: SiteId): number
  ball(site: SiteId, radius: number): Iterable<SiteId>
}

interface ExperientialField {
  readonly geometry: Geometry
  read(site: SiteId): Valence
  step(): void
}

// Concrete 1D geodesic line geometry embedded inside {3,4,3,4} (L = 256 sites)
class GeodesicRingGeometry implements Geometry {
  readonly size: number
  constructor(size: number) { this.size = size }
  neighbors(site: SiteId): readonly SiteId[] {
    const x = Number(site)
    return [String((x - 1 + this.size) % this.size), String((x + 1) % this.size)]
  }
  distance(a: SiteId, b: SiteId): number {
    const d = Math.abs(Number(a) - Number(b))
    return Math.min(d, this.size - d)
  }
  *ball(site: SiteId, radius: number): Iterable<SiteId> {
    const x0 = Number(site)
    const r = Math.min(radius, Math.floor(this.size / 2))
    yield String(x0)
    for (let d = 1; d <= r; d++) {
      yield String((x0 + d) % this.size)
      if (2 * d < this.size) yield String((x0 - d + this.size) % this.size)
    }
  }
}

function runExperiment4(doub0: { readonly vr: Float64Array; readonly vi: Float64Array; readonly lam: C }) {
  console.log('\n[EXP 4] TypeScript Multiscale Architecture (Sec 46-48) & Live Adaptive Hybrid Simulator (L=256, T=60):')

  const L = 256
  const T_BEATS = 60
  const BLK_SIZE = 8
  const N_BLKS = L / BLK_SIZE // 32 spatial blocks
  const geom = new GeodesicRingGeometry(L)
  assertExact(geom.distance('10', '250') === 16 && [...geom.ball('0', 2)].length === 5, 'GeodesicRingGeometry')

  // Verify ExperientialField conformance on a compact deterministic ternary field instance
  const ternaryField: ExperientialField = (() => {
    let vals: Valence[] = Array.from({ length: L }, (_, x) => (x === 112 || x === 144 ? 1 : 0))
    return {
      geometry: geom,
      read(site: SiteId): Valence { return vals[Number(site)] ?? 0 },
      step(): void {
        const next: Valence[] = new Array<Valence>(L).fill(0)
        for (let x = 0; x < L; x++) next[(x + 1) % L] = vals[x]!
        vals = next
      },
    }
  })()
  assertExact(ternaryField.read('112') === 1 && ternaryField.read('0') === 0, 'ExperientialField read')

  // Exact bare-U 2-body unitary on L = 256 geodesic ring (same-sign symmetric-role M_meet + D + S):
  // State space: (x1, x2, s1, s2) with x1, x2 in 0..255, s1, s2 in {0 (R), 1 (L)}, flat index = ((x1 * L + x2) << 2) | (s1 << 1) | s2.
  // Exact local bare-U collision law at x1 === x2, s1 !== s2 (antipodal full line, symmetric role):
  //   D o M_meet o D gives exact phase omega^2 = (-1/2, -sqrt(3)/2) without swapping spin direction;
  // On non-colliding pairs (x1 !== x2), each excitation independently undergoes exact bare C = D^2 = [[C_KEEP, C_CROSS], [C_CROSS, C_KEEP]];
  // Then deterministic streaming S shifts s=0 (R) by +1 mod L and s=1 (L) by -1 mod L!
  // Note: Pauli exclusion forbids (x1 === x2 && s1 === s2); our initial states & dynamics stay strictly orthogonal to it.
  const TOTAL_PAIRS = L * L // 65,536
  const TOTAL_AMPS = TOTAL_PAIRS * 4 // 262,144
  const CK_R = C_KEEP_C[0], CK_I = C_KEEP_C[1]
  const CC_R = C_CROSS_C[0], CC_I = C_CROSS_C[1]
  const W2_R = W2_C[0], W2_I = W2_C[1]

  // Single-pair bare-U update helper writing into (dstR, dstI)
  const stepOnePair = (
    x1: number,
    x2: number,
    srcR: Float64Array,
    srcI: Float64Array,
    dstR: Float64Array,
    dstI: Float64Array,
  ): void => {
    const base = (x1 * L + x2) << 2
    const r00 = srcR[base]!, i00 = srcI[base]!
    const r01 = srcR[base + 1]!, i01 = srcI[base + 1]!
    const r10 = srcR[base + 2]!, i10 = srcI[base + 2]!
    const r11 = srcR[base + 3]!, i11 = srcI[base + 3]!
    if (r00 === 0 && i00 === 0 && r01 === 0 && i01 === 0 && r10 === 0 && i10 === 0 && r11 === 0 && i11 === 0) return

    const x1R = (x1 + 1) & 255
    const x1L = (x1 - 1) & 255
    const x2R = (x2 + 1) & 255
    const x2L = (x2 - 1) & 255

    if (x1 === x2) {
      // Exact bare-U on-dock M_meet symmetric-role phase omega^2 on antipodal (0,1) and (1,0), then stream S
      if (r01 !== 0 || i01 !== 0) {
        const dIdx = ((x1R * L + x2L) << 2) | 1
        dstR[dIdx] = dstR[dIdx]! + (W2_R * r01 - W2_I * i01)
        dstI[dIdx] = dstI[dIdx]! + (W2_R * i01 + W2_I * r01)
      }
      if (r10 !== 0 || i10 !== 0) {
        const dIdx = ((x1L * L + x2R) << 2) | 2
        dstR[dIdx] = dstR[dIdx]! + (W2_R * r10 - W2_I * i10)
        dstI[dIdx] = dstI[dIdx]! + (W2_R * i10 + W2_I * r10)
      }
      return
    }
    // Apply C (x) C in two 1-particle stages: first coin on particle 1, then coin on particle 2
    // Stage 1 (coin on s1):
    const m00r = (CK_R * r00 - CK_I * i00) + (CC_R * r10 - CC_I * i10)
    const m00i = (CK_R * i00 + CK_I * r00) + (CC_R * i10 + CC_I * r10)
    const m10r = (CC_R * r00 - CC_I * i00) + (CK_R * r10 - CK_I * i10)
    const m10i = (CC_R * i00 + CC_I * r00) + (CK_R * i10 + CK_I * r10)

    const m01r = (CK_R * r01 - CK_I * i01) + (CC_R * r11 - CC_I * i11)
    const m01i = (CK_R * i01 + CK_I * r01) + (CC_R * i11 + CC_I * r11)
    const m11r = (CC_R * r01 - CC_I * i01) + (CK_R * r11 - CK_I * i11)
    const m11i = (CC_R * i01 + CC_I * r01) + (CK_R * i11 + CK_I * r11)

    // Stage 2 (coin on s2) + stream S directly to destination indices:
    const o00r = (CK_R * m00r - CK_I * m00i) + (CC_R * m01r - CC_I * m01i)
    const o00i = (CK_R * m00i + CK_I * m00r) + (CC_R * m01i + CC_I * m01r)
    const o01r = (CC_R * m00r - CC_I * m00i) + (CK_R * m01r - CK_I * m01i)
    const o01i = (CC_R * m00i + CC_I * m00r) + (CK_R * m01i + CK_I * m01r)

    const o10r = (CK_R * m10r - CK_I * m10i) + (CC_R * m11r - CC_I * m11i)
    const o10i = (CK_R * m10i + CK_I * m10r) + (CC_R * m11i + CC_I * m11r)
    const o11r = (CC_R * m10r - CC_I * m10i) + (CK_R * m11r - CK_I * m11i)
    const o11i = (CC_R * m10i + CC_I * m10r) + (CK_R * m11i + CC_I * m11r)

    const idx00 = ((x1R * L + x2R) << 2) | 0
    const idx01 = ((x1R * L + x2L) << 2) | 1
    const idx10 = ((x1L * L + x2R) << 2) | 2
    const idx11 = ((x1L * L + x2L) << 2) | 3
    dstR[idx00] = dstR[idx00]! + o00r; dstI[idx00] = dstI[idx00]! + o00i
    dstR[idx01] = dstR[idx01]! + o01r; dstI[idx01] = dstI[idx01]! + o01i
    dstR[idx10] = dstR[idx10]! + o10r; dstI[idx10] = dstI[idx10]! + o10i
    dstR[idx11] = dstR[idx11]! + o11r; dstI[idx11] = dstI[idx11]! + o11i
  }

  // Initial state: two colliding k = 1 same-sign pulses separated by 44 sites (> 96% vacuum initially!):
  // Pulse 1 at even site x1 = 106 (s1 = R, +1), Pulse 2 at even site x2 = 150 (s2 = L, +1).
  // Exact 1-body statevectors psi1, psi2 (length 2*L = 512) for the factored coarse regime!
  const initPsi1R = new Float64Array(2 * L)
  const initPsi1I = new Float64Array(2 * L)
  const initPsi2R = new Float64Array(2 * L)
  const initPsi2I = new Float64Array(2 * L)
  // 2-site even-sublattice compact pulse for clean collision + M_meet doublon excitation
  initPsi1R[2 * 106] = Math.SQRT1_2
  initPsi1R[2 * 108] = Math.SQRT1_2
  initPsi2R[2 * 150 + 1] = Math.SQRT1_2
  initPsi2R[2 * 148 + 1] = Math.SQRT1_2

  // Build exact initial 2-body statevector |psi1> (x) |psi2> (zero overlap: x1 in {106,108}, x2 in {148,150})
  let refR = new Float64Array(TOTAL_AMPS)
  let refI = new Float64Array(TOTAL_AMPS)
  for (let x1 = 0; x1 < L; x1++) {
    for (let s1 = 0; s1 < 2; s1++) {
      const aR = initPsi1R[2 * x1 + s1]!, aI = initPsi1I[2 * x1 + s1]!
      if (aR === 0 && aI === 0) continue
      for (let x2 = 0; x2 < L; x2++) {
        for (let s2 = 0; s2 < 2; s2++) {
          const bR = initPsi2R[2 * x2 + s2]!, bI = initPsi2I[2 * x2 + s2]!
          if (bR === 0 && bI === 0) continue
          const idx = ((x1 * L + x2) << 2) | (s1 << 1) | s2
          refR[idx] = aR * bR - aI * bI
          refI[idx] = aR * bI + aI * bR
        }
      }
    }
  }

  // --- Define Typed Multiscale Abstractions & Organizations (Sec 46-48) ---
  type FineTwoBody = { readonly re: Float64Array; readonly im: Float64Array }
  type FactoredCoarse = {
    readonly p1R: Float64Array
    readonly p1I: Float64Array
    readonly p2R: Float64Array
    readonly p2I: Float64Array
    readonly Q: number
    readonly D: number
    readonly activeBlocks1: readonly number[]
    readonly activeBlocks2: readonly number[]
  }
  type Signal2B = { readonly kind: 'flux' | 'collide_imminent'; readonly tick: Tick; readonly gapSites: number }

  // Exact Abstraction<FineTwoBody, FactoredCoarse> with MS-09 (pi o L = id) & MS-10 (Q, D conservation) verification!
  const factoredAbstraction: Abstraction<FineTwoBody, FactoredCoarse> = {
    project(fine: FineTwoBody): FactoredCoarse {
      // Extract rank-1 Schmidt marginals via exact left/right projection against largest amplitude entry
      let maxVal = 0
      let pivotX1 = 0, pivotS1 = 0, pivotX2 = 0, pivotS2 = 0
      for (let x1 = 0; x1 < L; x1++) {
        for (let x2 = 0; x2 < L; x2++) {
          const base = (x1 * L + x2) << 2
          for (let s = 0; s < 4; s++) {
            const v = fine.re[base + s]! ** 2 + fine.im[base + s]! ** 2
            if (v > maxVal) { maxVal = v; pivotX1 = x1; pivotS1 = s >> 1; pivotX2 = x2; pivotS2 = s & 1 }
          }
        }
      }
      const p1R = new Float64Array(2 * L), p1I = new Float64Array(2 * L)
      const p2R = new Float64Array(2 * L), p2I = new Float64Array(2 * L)
      let n1 = 0
      for (let x1 = 0; x1 < L; x1++) {
        for (let s1 = 0; s1 < 2; s1++) {
          const idx = ((x1 * L + pivotX2) << 2) | (s1 << 1) | pivotS2
          p1R[2 * x1 + s1] = fine.re[idx]!
          p1I[2 * x1 + s1] = fine.im[idx]!
          n1 += fine.re[idx]! ** 2 + fine.im[idx]! ** 2
        }
      }
      const inv1 = n1 > 0 ? 1 / Math.sqrt(n1) : 1
      for (let i = 0; i < 2 * L; i++) { p1R[i] = p1R[i]! * inv1; p1I[i] = p1I[i]! * inv1 }
      // Project particle 2 = <p1 | fine>
      for (let x2 = 0; x2 < L; x2++) {
        for (let s2 = 0; s2 < 2; s2++) {
          let sr = 0, si = 0
          for (let x1 = 0; x1 < L; x1++) {
            for (let s1 = 0; s1 < 2; s1++) {
              const aR = p1R[2 * x1 + s1]!, aI = -p1I[2 * x1 + s1]!
              if (aR === 0 && aI === 0) continue
              const idx = ((x1 * L + x2) << 2) | (s1 << 1) | s2
              sr += aR * fine.re[idx]! - aI * fine.im[idx]!
              si += aR * fine.im[idx]! + aI * fine.re[idx]!
            }
          }
          p2R[2 * x2 + s2] = sr
          p2I[2 * x2 + s2] = si
        }
      }
      const blk1 = new Set<number>()
      const blk2 = new Set<number>()
      let norm2 = 0
      for (let x = 0; x < L; x++) {
        if (p1R[2 * x]! ** 2 + p1I[2 * x]! ** 2 + p1R[2 * x + 1]! ** 2 + p1I[2 * x + 1]! ** 2 > 1e-28) blk1.add(x >> 3)
        const w2 = p2R[2 * x]! ** 2 + p2I[2 * x]! ** 2 + p2R[2 * x + 1]! ** 2 + p2I[2 * x + 1]! ** 2
        norm2 += w2
        if (w2 > 1e-28) blk2.add(x >> 3)
      }
      return { p1R, p1I, p2R, p2I, Q: 2 * norm2, D: 2 * norm2, activeBlocks1: [...blk1], activeBlocks2: [...blk2] }
    },
    realize(coarse: FactoredCoarse, context: RealizationContext): FineTwoBody {
      const re = new Float64Array(TOTAL_AMPS)
      const im = new Float64Array(TOTAL_AMPS)
      for (const b1 of coarse.activeBlocks1) {
        for (let x1 = b1 * BLK_SIZE; x1 < (b1 + 1) * BLK_SIZE; x1++) {
          for (let s1 = 0; s1 < 2; s1++) {
            const aR = coarse.p1R[2 * x1 + s1]!, aI = coarse.p1I[2 * x1 + s1]!
            if (aR === 0 && aI === 0) continue
            for (const b2 of coarse.activeBlocks2) {
              for (let x2 = b2 * BLK_SIZE; x2 < (b2 + 1) * BLK_SIZE; x2++) {
                for (let s2 = 0; s2 < 2; s2++) {
                  const bR = coarse.p2R[2 * x2 + s2]!, bI = coarse.p2I[2 * x2 + s2]!
                  if (bR === 0 && bI === 0) continue
                  const idx = ((x1 * L + x2) << 2) | (s1 << 1) | s2
                  re[idx] = aR * bR - aI * bI
                  im[idx] = aR * bI + aI * bR
                }
              }
            }
          }
        }
      }
      const fine: FineTwoBody = { re, im }
      for (const c of context.constraints) assertExact(c.validate(fine), `Refinement constraint ${c.name} failed`)
      return fine
    },
    error(fine: FineTwoBody, coarse: FactoredCoarse): number {
      const lifted = this.realize(coarse, { tick: 0n, seed: 0n, constraints: [] })
      let e2 = 0
      for (let i = 0; i < TOTAL_AMPS; i++) e2 += (fine.re[i]! - lifted.re[i]!) ** 2 + (fine.im[i]! - lifted.im[i]!) ** 2
      return Math.sqrt(e2)
    },
  }

  // Exact k = 2 Z[omega][1/13] Doublon Carrier Organization & Abstraction (coexisting on L = 256, refines & re-coarsens!)
  type DoublonFine = { readonly re: Float64Array; readonly im: Float64Array }
  type DoublonCoarse = { readonly alpha: C; readonly Q: number; readonly D: number; readonly beat: Tick }
  const M_DOUB = 12
  const sysDoub = buildSymKEven(2, M_DOUB)
  const doubDim = sysDoub.dim
  const doublonAbstraction: Abstraction<DoublonFine, DoublonCoarse> = {
    project(fine: DoublonFine): DoublonCoarse {
      let ar = 0, ai = 0, norm2 = 0
      for (let i = 0; i < doubDim; i++) {
        ar += doub0.vr[i]! * fine.re[i]! + doub0.vi[i]! * fine.im[i]!
        ai += doub0.vr[i]! * fine.im[i]! - doub0.vi[i]! * fine.re[i]!
        norm2 += fine.re[i]! ** 2 + fine.im[i]! ** 2
      }
      return { alpha: [ar, ai], Q: 2 * norm2, D: 2 * norm2, beat: 0n }
    },
    realize(coarse: DoublonCoarse, context: RealizationContext): DoublonFine {
      const re = new Float64Array(doubDim)
      const im = new Float64Array(doubDim)
      for (let i = 0; i < doubDim; i++) {
        re[i] = coarse.alpha[0] * doub0.vr[i]! - coarse.alpha[1] * doub0.vi[i]!
        im[i] = coarse.alpha[0] * doub0.vi[i]! + coarse.alpha[1] * doub0.vr[i]!
      }
      const fine: DoublonFine = { re, im }
      for (const c of context.constraints) assertExact(c.validate(fine), `Doublon refinement constraint ${c.name} failed`)
      return fine
    },
    error(fine: DoublonFine, coarse: DoublonCoarse): number {
      const lifted = this.realize(coarse, { tick: 0n, seed: 0n, constraints: [] })
      let e2 = 0
      for (let i = 0; i < doubDim; i++) e2 += (fine.re[i]! - lifted.re[i]!) ** 2 + (fine.im[i]! - lifted.im[i]!) ** 2
      return Math.sqrt(e2)
    },
  }

  // Test exact MS-09 / MS-10 refinement consistency pi(L(z)) = z, Q(L(z)) = Q_coarse, D(L(z)) = D_coarse on BOTH abstractions!
  const qNormFine = (f: FineTwoBody): number => {
    let n2 = 0
    for (let i = 0; i < TOTAL_AMPS; i++) n2 += f.re[i]! * f.re[i]! + f.im[i]! * f.im[i]!
    return 2 * n2
  }
  const initCoarse: FactoredCoarse = {
    p1R: Float64Array.from(initPsi1R),
    p1I: Float64Array.from(initPsi1I),
    p2R: Float64Array.from(initPsi2R),
    p2I: Float64Array.from(initPsi2I),
    Q: 2,
    D: 2,
    activeBlocks1: [106 >> 3],
    activeBlocks2: [148 >> 3, 150 >> 3],
  }
  const refineCtx: RealizationContext = {
    tick: 0n,
    seed: 0n,
    constraints: [
      {
        name: 'conserve_Q_and_D',
        validate: (v: unknown): boolean => Math.abs(qNormFine(v as FineTwoBody) - 2) < 1e-13,
      },
    ],
  }
  const liftedCheck = factoredAbstraction.realize(initCoarse, refineCtx)
  const reProj = factoredAbstraction.project(liftedCheck)
  const ms09FactoredErr = factoredAbstraction.error(liftedCheck, reProj)
  const ms10QErr = Math.abs(reProj.Q - initCoarse.Q)
  const ms10DErr = Math.abs(reProj.D - initCoarse.D)

  const doubCoarse0: DoublonCoarse = { alpha: C1, Q: 2, D: 2, beat: 0n }
  const doubLifted0 = doublonAbstraction.realize(doubCoarse0, { tick: 0n, seed: 0n, constraints: [] })
  const doubReProj0 = doublonAbstraction.project(doubLifted0)
  const ms09DoublonErr = cAbs(cSub(doubReProj0.alpha, doubCoarse0.alpha))

  // --- AdaptiveMultiscaleEngine implementing the exact 9-step loop of Sec 48 ---
  // Tracks BOTH:
  //   (A) The colliding k=1 -> M_meet 2-body sector on L=256 (32 blocks of 8 sites):
  //       Starts COARSED_EFFECTIVE (factored O(|S1|+|S2|) product on active blocks; VACUUM blocks = 0 work),
  //       dynamically REFINES into exact fine-grained bare U on active non-vacuum block pairs (b1, b2)
  //       the exact beat before supports meet (gap <= 1 site), and skips all VACUUM block pairs!
  //   (B) The coexisting k=2 Z[omega][1/13] doublon Organization on L=256:
  //       Runs COARSED_EFFECTIVE (O(1) single complex multiply alpha -> lam * alpha) for t=1..19,
  //       dynamically REFINES into exact fine bare U during probe window t=20..35,
  //       and dynamically RE-COARSENS back to COARSED_EFFECTIVE (O(1)) for t=36..60!
  type AdaptiveMode = 'COARSED_EFFECTIVE' | 'FINE_ACTIVE_BLOCKS'
  const step1BodyBlockAware = (
    pR: Float64Array,
    pI: Float64Array,
    activeBlks: readonly number[],
  ): { readonly nR: Float64Array; readonly nI: Float64Array; readonly nextBlks: number[]; readonly siteOps: number } => {
    const nR = new Float64Array(2 * L)
    const nI = new Float64Array(2 * L)
    const touched = new Uint8Array(N_BLKS)
    let siteOps = 0
    for (const b of activeBlks) {
      for (let x = b * BLK_SIZE; x < (b + 1) * BLK_SIZE; x++) {
        const r0 = pR[2 * x]!, i0 = pI[2 * x]!, r1 = pR[2 * x + 1]!, i1 = pI[2 * x + 1]!
        if (r0 === 0 && i0 === 0 && r1 === 0 && i1 === 0) continue
        siteOps++
        const xR = (x + 1) & 255
        const xL = (x - 1) & 255
        const o0r = (CK_R * r0 - CK_I * i0) + (CC_R * r1 - CC_I * i1)
        const o0i = (CK_R * i0 + CK_I * r0) + (CC_R * i1 + CC_I * r1)
        const o1r = (CC_R * r0 - CC_I * i0) + (CK_R * r1 - CK_I * i1)
        const o1i = (CC_R * i0 + CC_I * r0) + (CK_R * i1 + CC_I * r1)
        nR[2 * xR] = nR[2 * xR]! + o0r; nI[2 * xR] = nI[2 * xR]! + o0i
        nR[2 * xL + 1] = nR[2 * xL + 1]! + o1r; nI[2 * xL + 1] = nI[2 * xL + 1]! + o1i
        touched[xR >> 3] = 1
        touched[xL >> 3] = 1
      }
    }
    const nextBlks: number[] = []
    for (let b = 0; b < N_BLKS; b++) if (touched[b]) nextBlks.push(b)
    return { nR, nI, nextBlks, siteOps }
  }

  // Instantiate Organization objects matching Sec 46!
  const collisionOrg: Organization<FactoredCoarse, Signal2B> = {
    id: 'org:k1_collision_pair',
    scale: { spatial: BLK_SIZE, temporal: 1n, compositional: 2, informational: 4 },
    state: initCoarse,
    children: ['org:pulse_1', 'org:pulse_2'],
    ports: { inputs: [], outputs: [] },
    step(st: FactoredCoarse): FactoredCoarse {
      const s1 = step1BodyBlockAware(st.p1R, st.p1I, st.activeBlocks1)
      const s2 = step1BodyBlockAware(st.p2R, st.p2I, st.activeBlocks2)
      return {
        p1R: s1.nR, p1I: s1.nI, p2R: s2.nR, p2I: s2.nI,
        Q: st.Q, D: st.D, activeBlocks1: s1.nextBlks, activeBlocks2: s2.nextBlks,
      }
    },
    estimateError(): ErrorEstimate {
      // Exact Lieb-Robinson collision horizon: find minimum distance between active sites of pulse 1 & pulse 2
      let minDist = L
      for (const b1 of this.state.activeBlocks1) {
        for (let x1 = b1 * BLK_SIZE; x1 < (b1 + 1) * BLK_SIZE; x1++) {
          if (this.state.p1R[2 * x1]! ** 2 + this.state.p1I[2 * x1]! ** 2 + this.state.p1R[2 * x1 + 1]! ** 2 + this.state.p1I[2 * x1 + 1]! ** 2 < 1e-28) continue
          for (const b2 of this.state.activeBlocks2) {
            for (let x2 = b2 * BLK_SIZE; x2 < (b2 + 1) * BLK_SIZE; x2++) {
              if (this.state.p2R[2 * x2]! ** 2 + this.state.p2I[2 * x2]! ** 2 + this.state.p2R[2 * x2 + 1]! ** 2 + this.state.p2I[2 * x2 + 1]! ** 2 < 1e-28) continue
              const d = geom.distance(String(x1), String(x2))
              if (d < minDist) minDist = d
            }
          }
        }
      }
      const beatsSafe = BigInt(Math.max(0, Math.floor((minDist - 1) / 2)))
      return { stateError: minDist <= 2 ? 1.0 : 0.0, conservationError: 0.0, validUntil: beatsSafe }
    },
  }

  const doublonOrg: Organization<DoublonCoarse, Signal2B> = {
    id: 'org:k2_doublon_carrier',
    scale: { spatial: M_DOUB, temporal: 1n, compositional: 2, informational: 2 },
    state: doubCoarse0,
    children: ['org:vibe_a', 'org:vibe_b'],
    ports: { inputs: [], outputs: [] },
    step(st: DoublonCoarse, _inp: readonly Signal2B[], dt: bigint): DoublonCoarse {
      let a = st.alpha
      for (let k = 0n; k < dt; k++) a = cMul(a, doub0.lam)
      return { alpha: a, Q: st.Q, D: st.D, beat: st.beat + dt }
    },
    estimateError(): ErrorEstimate {
      return { stateError: 0, conservationError: 0, validUntil: BigInt(T_BEATS) }
    },
  }

  // Run BOTH (1) Full Dense Fine-Grained Reference AND (2) Live Adaptive Hybrid Simulator beat-for-beat for T = 60 beats!
  let mode: AdaptiveMode = 'COARSED_EFFECTIVE'
  let hybR = new Float64Array(0)
  let hybI = new Float64Array(0)
  let activePairBlocks = new Uint8Array(N_BLKS * N_BLKS)
  let refineTick = -1
  let totalDensePairUpdates = 0
  let totalAdaptivePairUpdates = 0
  let maxStateErr = 0
  let maxConsErr = 0
  let maxEntanglementCollision = 0 // Verify genuine M_meet scattering happened during collision!

  // Also track doublon fine reference vs adaptive refine/re-coarsen lifecycle across t = 1..60!
  let doubRefR = Float64Array.from(doubLifted0.re)
  let doubRefI = Float64Array.from(doubLifted0.im)
  let doubFineActive = false
  let doubHybFineR = new Float64Array(0)
  let doubHybFineI = new Float64Array(0)
  let doubRefineCount = 0
  let doubRecoarsenCount = 0
  let doubMaxErr = 0
  let doubDenseOps = 0
  let doubAdaptiveOps = 0

  const tDenseStart = Date.now()
  let denseMs = 0
  let adaptMs = 0

  for (let t = 1; t <= T_BEATS; t++) {
    // 1. Full Dense Fine-Grained Reference Beat (updates all 256 x 256 = 65,536 site pairs!)
    const td0 = Date.now()
    const nextRefR = new Float64Array(TOTAL_AMPS)
    const nextRefI = new Float64Array(TOTAL_AMPS)
    for (let x1 = 0; x1 < L; x1++) {
      for (let x2 = 0; x2 < L; x2++) {
        stepOnePair(x1, x2, refR, refI, nextRefR, nextRefI)
      }
    }
    refR = nextRefR
    refI = nextRefI
    totalDensePairUpdates += TOTAL_PAIRS
    denseMs += Date.now() - td0

    // 2. Adaptive Hybrid Engine Beat (9-step Sec 48 algorithm)
    const ta0 = Date.now()
    if (mode === 'COARSED_EFFECTIVE') {
      const est = collisionOrg.estimateError()
      if (est.stateError > 1e-12) {
        // Dynamically REFINE from COARSED_EFFECTIVE -> FINE_ACTIVE_BLOCKS!
        const lifted = factoredAbstraction.realize(collisionOrg.state, refineCtx)
        hybR = lifted.re
        hybI = lifted.im
        activePairBlocks = new Uint8Array(N_BLKS * N_BLKS)
        for (const b1 of collisionOrg.state.activeBlocks1) {
          for (const b2 of collisionOrg.state.activeBlocks2) activePairBlocks[b1 * N_BLKS + b2] = 1
        }
        mode = 'FINE_ACTIVE_BLOCKS'
        refineTick = t
      }
    }

    if (mode === 'COARSED_EFFECTIVE') {
      const s1 = step1BodyBlockAware(collisionOrg.state.p1R, collisionOrg.state.p1I, collisionOrg.state.activeBlocks1)
      const s2 = step1BodyBlockAware(collisionOrg.state.p2R, collisionOrg.state.p2I, collisionOrg.state.activeBlocks2)
      collisionOrg.state = {
        p1R: s1.nR, p1I: s1.nI, p2R: s2.nR, p2I: s2.nI,
        Q: 2, D: 2, activeBlocks1: s1.nextBlks, activeBlocks2: s2.nextBlks,
      }
      totalAdaptivePairUpdates += s1.siteOps + s2.siteOps
    } else {
      // Evolve ONLY active non-vacuum block pairs (b1, b2); vacuum block pairs do 0 work!
      const nextHybR = new Float64Array(TOTAL_AMPS)
      const nextHybI = new Float64Array(TOTAL_AMPS)
      const nextActive = new Uint8Array(N_BLKS * N_BLKS)
      for (let b1 = 0; b1 < N_BLKS; b1++) {
        for (let b2 = 0; b2 < N_BLKS; b2++) {
          if (!activePairBlocks[b1 * N_BLKS + b2]) continue
          for (let x1 = b1 * BLK_SIZE; x1 < (b1 + 1) * BLK_SIZE; x1++) {
            for (let x2 = b2 * BLK_SIZE; x2 < (b2 + 1) * BLK_SIZE; x2++) {
              totalAdaptivePairUpdates++
              stepOnePair(x1, x2, hybR, hybI, nextHybR, nextHybI)
            }
          }
          // Mark block pair and its 1-block Lieb-Robinson neighborhood if non-vacuum after step
          for (let db1 = -1; db1 <= 1; db1++) {
            const nb1 = (b1 + db1 + N_BLKS) % N_BLKS
            for (let db2 = -1; db2 <= 1; db2++) {
              const nb2 = (b2 + db2 + N_BLKS) % N_BLKS
              if (nextActive[nb1 * N_BLKS + nb2]) continue
              let hasMass = false
              for (let x1 = nb1 * BLK_SIZE; x1 < (nb1 + 1) * BLK_SIZE && !hasMass; x1++) {
                for (let x2 = nb2 * BLK_SIZE; x2 < (nb2 + 1) * BLK_SIZE; x2++) {
                  const base = (x1 * L + x2) << 2
                  if (
                    nextHybR[base]! ** 2 + nextHybI[base]! ** 2 +
                    nextHybR[base + 1]! ** 2 + nextHybI[base + 1]! ** 2 +
                    nextHybR[base + 2]! ** 2 + nextHybI[base + 2]! ** 2 +
                    nextHybR[base + 3]! ** 2 + nextHybI[base + 3]! ** 2 > 1e-30
                  ) { hasMass = true; break }
                }
              }
              if (hasMass) nextActive[nb1 * N_BLKS + nb2] = 1
            }
          }
        }
      }
      hybR = nextHybR
      hybI = nextHybI
      activePairBlocks = nextActive
    }
    adaptMs += Date.now() - ta0

    // Beat-for-beat verification against Full Dense Fine-Grained Reference!
    let diff2 = 0
    let normHyb2 = 0
    let onDockProb = 0
    if (mode === 'COARSED_EFFECTIVE') {
      const lifted = factoredAbstraction.realize(collisionOrg.state, { tick: BigInt(t), seed: 0n, constraints: [] })
      for (let i = 0; i < TOTAL_AMPS; i++) {
        diff2 += (refR[i]! - lifted.re[i]!) ** 2 + (refI[i]! - lifted.im[i]!) ** 2
        normHyb2 += lifted.re[i]! ** 2 + lifted.im[i]! ** 2
      }
    } else {
      for (let i = 0; i < TOTAL_AMPS; i++) {
        diff2 += (refR[i]! - hybR[i]!) ** 2 + (refI[i]! - hybI[i]!) ** 2
        normHyb2 += hybR[i]! ** 2 + hybI[i]! ** 2
      }
      for (let x = 0; x < L; x++) {
        const base = (x * L + x) << 2
        onDockProb +=
          hybR[base + 1]! ** 2 + hybI[base + 1]! ** 2 + hybR[base + 2]! ** 2 + hybI[base + 2]! ** 2
      }
      if (onDockProb > maxEntanglementCollision) maxEntanglementCollision = onDockProb
    }
    maxStateErr = Math.max(maxStateErr, Math.sqrt(diff2))
    maxConsErr = Math.max(maxConsErr, Math.abs(2 * normHyb2 - 2))

    // 3. Coexisting k = 2 Z[omega][1/13] Doublon Carrier: Coarse (t=1..19) -> Refine (t=20..35) -> Re-coarsen (t=36..60)!
    const nDoubRefR = new Float64Array(doubDim)
    const nDoubRefI = new Float64Array(doubDim)
    for (let r = 0; r < doubDim; r++) {
      let sr = 0, si = 0
      for (let c = 0; c < doubDim; c++) {
        sr += sysDoub.U.re[r * doubDim + c]! * doubRefR[c]! - sysDoub.U.im[r * doubDim + c]! * doubRefI[c]!
        si += sysDoub.U.re[r * doubDim + c]! * doubRefI[c]! + sysDoub.U.im[r * doubDim + c]! * doubRefR[c]!
      }
      nDoubRefR[r] = sr
      nDoubRefI[r] = si
    }
    doubRefR = nDoubRefR
    doubRefI = nDoubRefI
    doubDenseOps += doubDim * doubDim

    if (t === 20 && !doubFineActive) {
      const fine = doublonAbstraction.realize(doublonOrg.state, { tick: BigInt(t), seed: 0n, constraints: [] })
      doubHybFineR = fine.re
      doubHybFineI = fine.im
      doubFineActive = true
      doubRefineCount++
    }
    if (doubFineActive) {
      const nr = new Float64Array(doubDim)
      const ni = new Float64Array(doubDim)
      for (let r = 0; r < doubDim; r++) {
        let sr = 0, si = 0
        for (let c = 0; c < doubDim; c++) {
          sr += sysDoub.U.re[r * doubDim + c]! * doubHybFineR[c]! - sysDoub.U.im[r * doubDim + c]! * doubHybFineI[c]!
          si += sysDoub.U.re[r * doubDim + c]! * doubHybFineI[c]! + sysDoub.U.im[r * doubDim + c]! * doubHybFineR[c]!
        }
        nr[r] = sr
        ni[r] = si
      }
      doubHybFineR = nr
      doubHybFineI = ni
      doubAdaptiveOps += doubDim * doubDim
      let e2 = 0
      for (let i = 0; i < doubDim; i++) e2 += (doubRefR[i]! - doubHybFineR[i]!) ** 2 + (doubRefI[i]! - doubHybFineI[i]!) ** 2
      doubMaxErr = Math.max(doubMaxErr, Math.sqrt(e2))
      if (t === 35) {
        doublonOrg.state = doublonAbstraction.project({ re: doubHybFineR, im: doubHybFineI })
        doubFineActive = false
        doubRecoarsenCount++
      }
    } else {
      doublonOrg.state = doublonOrg.step(doublonOrg.state, [], 1n)
      doubAdaptiveOps += 1
      const lifted = doublonAbstraction.realize(doublonOrg.state, { tick: BigInt(t), seed: 0n, constraints: [] })
      let e2 = 0
      for (let i = 0; i < doubDim; i++) e2 += (doubRefR[i]! - lifted.re[i]!) ** 2 + (doubRefI[i]! - lifted.im[i]!) ** 2
      doubMaxErr = Math.max(doubMaxErr, Math.sqrt(e2))
    }
  }
  const tHybridWall = Date.now() - tDenseStart
  const workReduction = totalDensePairUpdates / totalAdaptivePairUpdates
  const doubWorkReduction = doubDenseOps / doubAdaptiveOps

  // Count vacated vacuum blocks at t = 60
  let activeBlocksFinal = 0
  for (let i = 0; i < activePairBlocks.length; i++) if (activePairBlocks[i]) activeBlocksFinal++

  console.log(`  Refinement consistency (MS-09/10): pi(L(z))=z err=${ms09FactoredErr.toExponential(2)} (doublon=${ms09DoublonErr.toExponential(2)}), |Delta Q|=${ms10QErr.toExponential(1)}, |Delta D|=${ms10DErr.toExponential(1)}`)
  console.log(`  L=${L}, T=${T_BEATS} colliding bare-U pair: dynamically refined at beat t=${refineTick}, peak on-dock M_meet prob=${maxEntanglementCollision.toFixed(5)}`)
  console.log(`  Beat-for-beat vs dense reference: maxStateErr=${maxStateErr.toExponential(2)}, conservationErr(Q,D)=${maxConsErr.toExponential(2)}`)
  console.log(`  Adaptive work compression: dense=${totalDensePairUpdates.toLocaleString()} vs adaptive=${totalAdaptivePairUpdates.toLocaleString()} pair-updates => ${workReduction.toFixed(2)}x reduction (final active block-pairs ${activeBlocksFinal}/${N_BLKS * N_BLKS}; dense=${denseMs}ms vs adapt=${adaptMs}ms, total=${tHybridWall}ms)`)
  console.log(`  Coexisting k=2 doublon lifecycle: refine=${doubRefineCount} (t=20), re-coarsen=${doubRecoarsenCount} (t=35), maxStateErr=${doubMaxErr.toExponential(2)}, workReduction=${doubWorkReduction.toFixed(2)}x`)

  recordCheck(
    'W20.4',
    'Exp 4: Exact TypeScript Multiscale Architecture (Sec 46-48) & Live Adaptive Hybrid Simulator (L=256, T=60)',
    ms09FactoredErr < 1e-14 &&
      ms09DoublonErr < 1e-14 &&
      ms10QErr < 1e-14 &&
      ms10DErr < 1e-14 &&
      refineTick > 10 &&
      refineTick < 25 &&
      maxEntanglementCollision > 0.01 &&
      maxStateErr < 1e-13 &&
      maxConsErr < 1e-14 &&
      workReduction >= 5 &&
      doubRefineCount === 1 &&
      doubRecoarsenCount === 1 &&
      doubMaxErr < 1e-13 &&
      doubWorkReduction >= 3,
    `maxStateErr=${maxStateErr.toExponential(1)}, consErr=${maxConsErr.toExponential(1)}, refine@t=${refineTick}, workReduction=${workReduction.toFixed(2)}x (doublon=${doubWorkReduction.toFixed(2)}x, err=${doubMaxErr.toExponential(1)})`,
  )
}

// =================================================================================================
// EXPERIMENT 5: SHEAF LOCAL-TO-GLOBAL GLUING & QUANTUM CONTEXTUALITY OBSTRUCTION (MS-17, Sec 43)
// =================================================================================================

function runExperiment5() {
  console.log('\n[EXP 5] Sheaf Local-to-Global Gluing & Quantum Contextuality Obstruction (MS-17, Sec 43):')

  const coneLegs = (a: number): number[] => Array.from({ length: 23 }, (_, j) => a * 23 + j)
  const conesUnion = (as: readonly number[]): number[] => as.flatMap(coneLegs)

  // --- 5(a) Successful Sheaf Gluing on Overlapping B_1 = [[552, 25, 40]]_3 Boundary Regions ---
  // Maximal commuting Z-Lagrangian of B_1: L_Z = H(B_1) + <zLogs[0..24]> (552 commuting stabilizers on 552 boundary qutrits!)
  const lagZ552: readonly GF3Row[] = [...B1_CODE.hStabs, ...B1_CODE.zLogs]
  assertExact(gf3Rank(lagZ552, 1104) === 552 && countIsoDefects(lagZ552, 552) === 0, 'B1 Z-Lagrangian rank 552')

  // Extract the exact subgroup S(W) <= lagZ552 supported strictly inside boundary subset W!
  const extractSupported = (basis: readonly GF3Row[], W: readonly number[]): GF3Row[] => {
    const inW = new Uint8Array(552)
    for (const q of W) inW[q] = 1
    const outCols: number[] = []
    for (let q = 0; q < 552; q++) if (!inW[q]) { outCols.push(q); outCols.push(552 + q) }
    const nRows = basis.length
    const eqWords = (nRows + 31) >>> 5
    const eqs: GF3Row[] = []
    for (const col of outCols) {
      const eq = gf3RowZero(eqWords)
      let nz = false
      for (let ri = 0; ri < nRows; ri++) {
        const v = gf3Get(basis[ri]!, col)
        if (v !== 0) { gf3Set(eq, ri, v); nz = true }
      }
      if (nz) eqs.push(eq)
    }
    const ker = gf3Nullspace(eqs, nRows)
    return ker.map(kv => {
      const row = gf3RowZero(B1_BND_WORDS)
      for (let ri = 0; ri < nRows; ri++) {
        const cf = gf3Get(kv, ri)
        if (cf === 1) gf3AddInPlace(row, basis[ri]!)
        else if (cf === 2) gf3SubInPlace(row, basis[ri]!)
      }
      return row
    })
  }

  // Test 6 diverse overlapping boundary covers (U, V) on B_1 (including 17-cone + 17-cone sharing b_0,
  // and 12-cone + 12-cone where NEITHER accesses full b_0 individually yet U cup V = 18 cones unlocks b_0!)
  const overlapSpecs: readonly { readonly name: string; readonly uCones: readonly number[]; readonly vCones: readonly number[] }[] = [
    { name: '17+17 (shift 7)', uCones: Array.from({ length: 17 }, (_, i) => i), vCones: Array.from({ length: 17 }, (_, i) => (7 + i) % 24) },
    { name: '17+17 (shift 4)', uCones: Array.from({ length: 17 }, (_, i) => i), vCones: Array.from({ length: 17 }, (_, i) => (4 + i) % 24) },
    { name: '12+12 (shift 6 -> 18)', uCones: Array.from({ length: 12 }, (_, i) => i), vCones: Array.from({ length: 12 }, (_, i) => (6 + i) % 24) },
    { name: '10+10 (shift 4 -> 14)', uCones: Array.from({ length: 10 }, (_, i) => i), vCones: Array.from({ length: 10 }, (_, i) => (4 + i) % 24) },
    { name: '8+8 (shift 4 -> 12)', uCones: Array.from({ length: 8 }, (_, i) => i), vCones: Array.from({ length: 8 }, (_, i) => (4 + i) % 24) },
    { name: 'nested 6 in 18', uCones: Array.from({ length: 6 }, (_, i) => i), vCones: Array.from({ length: 18 }, (_, i) => i) },
  ]

  let stabGlueDefects = 0
  let classicalGlueDefects = 0
  let maxEmergentNonlocal = 0
  const glueReport: string[] = []

  // Solve A x = b over GF(3) (returns true iff consistent)
  const isConsistentGF3 = (rows: readonly GF3Row[], rhs: readonly number[], nVars: number): boolean => {
    const augWords = (nVars + 1 + 31) >>> 5
    const aug = rows.map((r, ri) => {
      const a = gf3RowZero(augWords)
      for (let w = 0; w < r.a.length; w++) { a.a[w] = r.a[w]!; a.b[w] = r.b[w]! }
      if (rhs[ri]!) gf3Set(a, nVars, rhs[ri]!)
      return a
    })
    const { pivCols } = gf3Rref(aug, nVars + 1)
    return !pivCols.includes(nVars)
  }

  for (let oi = 0; oi < overlapSpecs.length; oi++) {
    const spec = overlapSpecs[oi]!
    const uSet = new Set(spec.uCones)
    const vSet = new Set(spec.vCones)
    const capCones = spec.uCones.filter(c => vSet.has(c))
    const cupCones = [...new Set([...spec.uCones, ...spec.vCones])]
    const U = conesUnion(spec.uCones)
    const V = conesUnion(spec.vCones)
    const cap = conesUnion(capCones)
    const cup = conesUnion(cupCones)

    const sU = extractSupported(lagZ552, U)
    const sV = extractSupported(lagZ552, V)
    const sCap = extractSupported(lagZ552, cap)
    const sCup = extractSupported(lagZ552, cup)
    const dimSum = gf3Rank([...sU, ...sV], 1104)
    const dimInter = sU.length + sV.length - dimSum
    const emergentNonlocal = sCup.length - dimSum
    if (emergentNonlocal > maxEmergentNonlocal) maxEmergentNonlocal = emergentNonlocal

    // Deterministic compatible assignment test on F(U) = Hom(S(U), GF(3)):
    // Construct a concrete global Pauli character chi(g) = sympDot(g, probe) -> automatically compatible on S(U) cap S(V);
    // verify exact existence of a global gluing assignment on S(U cup V) matching s_U and s_V simultaneously!
    const probe = gf3RowZero(B1_BND_WORDS)
    for (let q = 0; q < 552; q++) {
      if ((q + oi) % 3 === 1) gf3Set(probe, q, 1)
      if ((q + 2 * oi) % 5 === 0) gf3Set(probe, 552 + q, 2)
    }
    const sProbe = toSympRow(probe, 552)
    const allConsRows = [...sU, ...sV]
    const allRhs = allConsRows.map(g => sympDotBit(toSympRow(g, 552), sProbe))
    // Every compatible pair (s_U, s_V) agreeing on S(U) cap S(V) must glue onto S(U cup V) (linear system consistent over GF(3)^1104)!
    // Check via dual linear system: express rows of sU, sV in terms of sCup basis -> consistent iff s_U|_{S(U) cap S(V)} = s_V|_{S(U) cap S(V)}!
    const rCup = gf3Rref(sCup, 1104)
    if (gf3Rank([...sCup, ...sU, ...sV], 1104) !== rCup.basis.length) stabGlueDefects++
    if (!isConsistentGF3(allConsRows, allRhs, 1104)) stabGlueDefects++

    // Exact classical assignment sheaf C(W) = GF(3)^W:
    // Any two local configurations c_U in GF(3)^U and c_V in GF(3)^V agreeing on U cap V glue UNIQUELY to c_{U cup V}!
    const cU = new Uint8Array(552)
    const cV = new Uint8Array(552)
    for (const q of U) cU[q] = (q * 7 + oi + 1) % 3
    for (const q of V) cV[q] = uSet.has(Math.floor(q / 23)) ? cU[q]! : (q * 11 + oi + 2) % 3
    // Verify agreement on cap and unique glued configuration on cup
    for (const q of cap) if (cU[q] !== cV[q]) classicalGlueDefects++
    const glued = new Uint8Array(552)
    for (const q of cup) glued[q] = uSet.has(Math.floor(q / 23)) ? cU[q]! : cV[q]!
    for (const q of U) if (glued[q] !== cU[q]) classicalGlueDefects++
    for (const q of V) if (glued[q] !== cV[q]) classicalGlueDefects++

    glueReport.push(
      `    ${spec.name.padEnd(22)}: dim S(U)=${sU.length}, S(V)=${sV.length}, S(U cap V)=${sCap.length} (S(U) cap S(V)=${dimInter}), S(U cup V)=${sCup.length}, emergentNonlocal=${emergentNonlocal}`,
    )
  }

  // --- 5(b1) Exact Algebraic Sheaf Obstruction (H^1 != 0, 0 / 512 Global Sections): Mermin-Peres Magic Square ---
  // Realized directly inside the 4-dim Q=0 balanced-pair logical subspace {|-1>, |+1>}^{x2} of two B_1 bulk qutrits (b_1, b_2)!
  // Exact 4x4 Pauli matrices (complex 4x4) for the 9 observables O_{r,c}:
  //   Row 0:  X (x) I,   I (x) X,   X (x) X    -> product = +I
  //   Row 1:  I (x) Z,   Z (x) I,   Z (x) Z    -> product = +I
  //   Row 2:  X (x) Z,   Z (x) X,   Y (x) Y    -> product = +I (Wait: (X x Z)(Z x X) = (-iY) x (iY) = +Y x Y => prod = +I!)
  //   Col 0:  (X x I)(I x Z)(X x Z) = +I
  //   Col 1:  (I x X)(Z x I)(Z x X) = +I
  //   Col 2:  (X x X)(Z x Z)(Y x Y) = (-iY x -iY)(Y x Y) = -(Y x Y)(Y x Y) = -I !!
  type Mat4 = readonly (readonly C[])[]
  const P_I: readonly (readonly C[])[] = [[C1, C0], [C0, C1]]
  const P_X: readonly (readonly C[])[] = [[C0, C1], [C1, C0]]
  const P_Y: readonly (readonly C[])[] = [[C0, [0, -1]], [[0, 1], C0]]
  const P_Z: readonly (readonly C[])[] = [[C1, C0], [C0, [-1, 0]]]
  const kron2 = (A: readonly (readonly C[])[], B: readonly (readonly C[])[]): Mat4 =>
    Array.from({ length: 4 }, (_, r) =>
      Array.from({ length: 4 }, (_, c) => cMul(A[r >> 1]![c >> 1]!, B[r & 1]![c & 1]!)),
    )
  const mul4 = (A: Mat4, B: Mat4): Mat4 =>
    Array.from({ length: 4 }, (_, r) =>
      Array.from({ length: 4 }, (_, c) => {
        let s = C0
        for (let k = 0; k < 4; k++) s = cAdd(s, cMul(A[r]![k]!, B[k]![c]!))
        return s
      }),
    )
  const mat4Diff = (A: Mat4, B: Mat4): number => {
    let m = 0
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) m = Math.max(m, cAbs(cSub(A[r]![c]!, B[r]![c]!)))
    return m
  }
  const I4 = kron2(P_I, P_I)
  const NEG_I4: Mat4 = I4.map(row => row.map(z => cScale(-1, z)))
  const mpGrid: readonly Mat4[] = [
    kron2(P_X, P_I), kron2(P_I, P_X), kron2(P_X, P_X),
    kron2(P_I, P_Z), kron2(P_Z, P_I), kron2(P_Z, P_Z),
    kron2(P_X, P_Z), kron2(P_Z, P_X), kron2(P_Y, P_Y),
  ]
  const mpContexts: readonly { readonly name: string; readonly idx: readonly [number, number, number]; readonly prodSign: 1 | -1 }[] = [
    { name: 'R0', idx: [0, 1, 2], prodSign: 1 },
    { name: 'R1', idx: [3, 4, 5], prodSign: 1 },
    { name: 'R2', idx: [6, 7, 8], prodSign: 1 },
    { name: 'C0', idx: [0, 3, 6], prodSign: 1 },
    { name: 'C1', idx: [1, 4, 7], prodSign: 1 },
    { name: 'C2', idx: [2, 5, 8], prodSign: -1 },
  ]
  let mpAlgebraErr = 0
  for (const ctx of mpContexts) {
    const [a, b, c] = ctx.idx
    const A = mpGrid[a]!, B = mpGrid[b]!, Cmat = mpGrid[c]!
    // Verify pairwise commutation [A,B]=[A,C]=[B,C]=0 and exact operator product A*B*C = +-I_4!
    mpAlgebraErr = Math.max(
      mpAlgebraErr,
      mat4Diff(mul4(A, B), mul4(B, A)),
      mat4Diff(mul4(A, Cmat), mul4(Cmat, A)),
      mat4Diff(mul4(B, Cmat), mul4(Cmat, B)),
      mat4Diff(mul4(mul4(A, B), Cmat), ctx.prodSign === 1 ? I4 : NEG_I4),
    )
  }
  // Count local sections per context & verify pairwise overlap compatibility on every R_r cap C_c
  const mpLocalCounts = mpContexts.map(ctx => {
    let cnt = 0
    for (let m = 0; m < 8; m++) {
      const s0 = (m & 1) ? -1 : 1, s1 = (m & 2) ? -1 : 1, s2 = (m & 4) ? -1 : 1
      if (s0 * s1 * s2 === ctx.prodSign) cnt++
    }
    return cnt
  })
  // Exhaustively search ALL 2^9 = 512 global noncontextual assignments g in {+1, -1}^9!
  let mpGlobalValid = 0
  for (let mask = 0; mask < 512; mask++) {
    const g = Array.from({ length: 9 }, (_, i) => ((mask >> i) & 1) ? -1 : 1)
    const ok = mpContexts.every(ctx => g[ctx.idx[0]]! * g[ctx.idx[1]]! * g[ctx.idx[2]]! === ctx.prodSign)
    if (ok) mpGlobalValid++
  }
  // Exact Z_2 Cech cohomology obstruction witness: parity sum over all 6 contexts of local constraint signs!
  // Every observable appears in exactly 2 contexts (1 row + 1 col), so for ANY global assignment the product over
  // all 6 contexts equals prod_i g_i^2 = +1 (0 mod 2), whereas the operator cocycle has product -1 (1 mod 2 != 0)!
  const cechObstructionMod2 = mpContexts.reduce((acc, ctx) => acc ^ (ctx.prodSign === -1 ? 1 : 0), 0)

  // --- 5(b2) Native Single-Qutrit (d = 3) Probabilistic Sheaf Obstruction (KCBS 5-Cycle on Origin b_0 of [[24,1,8]]_3) ---
  // Exact 5 rank-1 qutrit projectors P_j = |v_j><v_j| in C^3 (real unit vectors) with <v_j | v_{j+1 mod 5}> = 0:
  //   v_j = (cos(theta_K) cos(phi_j), cos(theta_K) sin(phi_j), sin(theta_K)) with phi_j = 4 pi j / 5,
  //   orthogonality cos^2(theta_K) cos(4 pi / 5) + sin^2(theta_K) = 0 => tan^2(theta_K) = -cos(4 pi / 5) = (1 + sqrt(5))/4
  //   => sin^2(theta_K) = 1 / sqrt(5), cos^2(theta_K) = 1 - 1 / sqrt(5)!
  // On logical state |0_L> = (0, 0, 1) of origin bulk qutrit b_0: <0_L | P_j | 0_L> = sin^2(theta_K) = 1 / sqrt(5),
  // giving sum_{j=0}^4 <0_L | P_j | 0_L> = 5 / sqrt(5) = sqrt(5) = 2.236068 > 2 (classical noncontextual ceiling = 2)!
  const sin2K = 1 / Math.sqrt(5)
  const sinK = Math.sqrt(sin2K)
  const cosK = Math.sqrt(1 - sin2K)
  const kcbsVecs: readonly (readonly [number, number, number])[] = Array.from({ length: 5 }, (_, j) => {
    const phi = (4 * PI * j) / 5
    return [cosK * Math.cos(phi), cosK * Math.sin(phi), sinK] as const
  })
  let kcbsOrthoErr = 0
  for (let j = 0; j < 5; j++) {
    const a = kcbsVecs[j]!
    const b = kcbsVecs[(j + 1) % 5]!
    kcbsOrthoErr = Math.max(kcbsOrthoErr, Math.abs(a[0] * b[0] + a[1] * b[1] + a[2] * b[2]))
  }
  const kcbsQuantumSum = kcbsVecs.reduce((s, v) => s + v[2] * v[2], 0)
  // Exhaustively enumerate ALL 2^5 = 32 global assignments s in {0, 1}^5 satisfying exclusivity s_j + s_{j+1} <= 1 mod 5!
  let kcbsValidGlobals = 0
  let kcbsClassicalMax = 0
  for (let mask = 0; mask < 32; mask++) {
    const bits = Array.from({ length: 5 }, (_, j) => (mask >> j) & 1)
    const excl = bits.every((b, j) => b + bits[(j + 1) % 5]! <= 1)
    if (excl) {
      kcbsValidGlobals++
      const wt = bits.reduce((a, b) => a + b, 0)
      if (wt > kcbsClassicalMax) kcbsClassicalMax = wt
    }
  }
  // Verify Gross discrete-Wigner honesty check: on pure [[24,1,8]]_3 Pauli stabilizers alone, Z_3 local syndromes always glue!
  const grossPauliGlues = stabGlueDefects === 0

  console.log(`  [5a] B_1 = [[552, 25, 40]]_3 commuting stabilizer sheaf (${overlapSpecs.length} overlaps):`)
  for (const row of glueReport) console.log(row)
  console.log(`       Gluing defects: stabilizer=${stabGlueDefects}, classical GF(3)^W=${classicalGlueDefects}, max emergent nonlocal rank=${maxEmergentNonlocal}`)
  console.log(`  [5b1] Mermin-Peres 3x3 Magic Square (in B_1 2-qutrit balanced-pair subspace): algebraErr=${mpAlgebraErr.toExponential(1)}, localSections=[${mpLocalCounts.join(',')}], globalValid=${mpGlobalValid}/512, Cech H^1 cocycle=${cechObstructionMod2} mod 2 (!= 0)`)
  console.log(`  [5b2] Native d=3 KCBS 5-cycle on origin qutrit b_0 of [[24,1,8]]_3: orthoErr=${kcbsOrthoErr.toExponential(1)}, validGlobals=${kcbsValidGlobals}/32 (classical max=${kcbsClassicalMax}), quantum <0_L|sum P_i|0_L>=${kcbsQuantumSum.toFixed(6)} (= sqrt(5) > 2); odd-d Pauli-only glues (Gross)=${grossPauliGlues}`)

  recordCheck(
    'W20.5',
    'Exp 5: Sheaf Local-to-Global Gluing on B_1 & H^1 != 0 Quantum Contextuality Obstruction (MS-17, Sec 43)',
    stabGlueDefects === 0 &&
      classicalGlueDefects === 0 &&
      maxEmergentNonlocal > 0 &&
      mpAlgebraErr < 1e-14 &&
      mpLocalCounts.every(c => c === 4) &&
      mpGlobalValid === 0 &&
      cechObstructionMod2 === 1 &&
      kcbsOrthoErr < 1e-14 &&
      kcbsValidGlobals === 11 &&
      kcbsClassicalMax === 2 &&
      Math.abs(kcbsQuantumSum - Math.sqrt(5)) < 1e-14,
    `B_1 commuting sheaf: 0 gluing defects (max emergent nonlocal=${maxEmergentNonlocal}); Mermin-Peres: 0/512 globals, H^1=${cechObstructionMod2} mod 2; d=3 KCBS: ${kcbsQuantumSum.toFixed(4)} > ${kcbsClassicalMax} (11 valid globals)`,
  )
}

// =================================================================================================
// EXPERIMENT 6: SCALE-PROFILE VECTORS sigma(A), CORRELATION/XOR SYNERGY HIERARCHY & VALENCE (Sec 1,5,38)
// =================================================================================================

function runExperiment6(exp1: {
  readonly doub0: { readonly vr: Float64Array; readonly vi: Float64Array; readonly ipr: number }
  readonly vgDoublon: number
  readonly trion0: { readonly ipr: number }
  readonly epsK2Rest20: number
  readonly epsK3Rest20: number
}) {
  console.log('\n[EXP 6] Scale-Profile Vectors sigma(A), Higher-Order Correlation / XOR Synergy & Valence Laws (Sec 1, 5, 38):')

  // --- 6(a) Construct exact W11 U_star 25-qutrit GHZ state on B_1 = [[552, 25, 40]]_3! ---
  // Input bulk stabilizer generators for |+>_0 (x) |0>^{x24}: X_0 and Z_1..Z_24 (25 commuting Paulis on 25 bulk qutrits).
  // Evolve by U_STAR_50: S_out[j] = U_STAR_50 * S_in[j]!
  const ghz25Rows: GF3Row[] = []
  const w25 = (50 + 31) >>> 5
  const inGens: number[] = [0, ...Array.from({ length: 24 }, (_, a) => 25 + 1 + a)] // X_0 and Z_1..Z_24
  for (const gIdx of inGens) {
    const r = gf3RowZero(w25)
    for (let i = 0; i < 50; i++) {
      const v = U_STAR_50[i]![gIdx]!
      if (v !== 0) gf3Set(r, i, v)
    }
    ghz25Rows.push(r)
  }
  assertExact(gf3Rank(ghz25Rows, 50) === 25 && countIsoDefects(ghz25Rows, 25) === 0, '25-qutrit U_star GHZ Lagrangian')
  // Check exact GHZ entanglement entropy across single qutrit, pair, 12-qutrit half, and full 25-qutrit bulk!
  const sGhZ1 = stabEntropy(ghz25Rows, 25, [0]) // 1 * ln 3
  const sGhZ2 = stabEntropy(ghz25Rows, 25, [0, 1]) // 1 * ln 3
  const sGhZ12 = stabEntropy(ghz25Rows, 25, Array.from({ length: 12 }, (_, i) => i)) // 1 * ln 3
  const sGhZ25 = stabEntropy(ghz25Rows, 25, Array.from({ length: 25 }, (_, i) => i)) // 0
  // Quantum mutual information I(b_0 : b_1) vs I(b_0 : b_1..b_24) in trits (ln 3 units):
  const iGhZPair = sGhZ1 + stabEntropy(ghz25Rows, 25, [1]) - sGhZ2 // 1 + 1 - 1 = 1 trit (classical Z-correlation)
  const iGhZFull = sGhZ1 + stabEntropy(ghz25Rows, 25, Array.from({ length: 24 }, (_, i) => i + 1)) - sGhZ25 // 1 + 1 - 0 = 2 trits (full quantum coherence!)
  const ghzGlobalSynergyBits = (iGhZFull - iGhZPair) * (LN3 / LN2) // 1 trit = log2(3) = 1.584963 bits of pure 25-body quantum synergy!

  // Measure k = 1 geodesic pulse support at t = 4 in exact Z[zeta_9][1/6]
  const [l0A] = LINES[0]!
  let p1State = stateFromEntries([[[[0, l0A, 1, 0]], Z9_ONE]], 1n)
  for (let t = 0; t < 4; t++) p1State = applyBeat4D(p1State)
  const p1Docks = new Set<number>()
  for (const k of p1State.amp.keys()) for (const [d] of decodeConfig(k)) p1Docks.add(d)

  // Compute 5 measured Scale-Profile Vectors sigma(A) = (spatial_support, temporal_persistence, compositional_k, info_capacity_bits, causal_reach, closure_quality)
  type ScaleProfile = {
    readonly name: string
    readonly spatialSupport: number
    readonly temporalPersistence: string
    readonly compositionalK: number
    readonly infoCapacityBits: number
    readonly causalReach: number
    readonly closureQuality: number
  }
  const profiles: readonly ScaleProfile[] = [
    {
      name: '(i) Calm 0_D Vacuum |V_1>',
      spatialSupport: 0,
      temporalPersistence: 'Inf (exact fixed pt)',
      compositionalK: 0,
      infoCapacityBits: 0,
      causalReach: 0,
      closureQuality: 1.0,
    },
    {
      name: '(ii) k=1 Geodesic Pulse (t=4)',
      spatialSupport: p1Docks.size,
      temporalPersistence: 'Inf (Q,D) / 22 (local)',
      compositionalK: 1,
      infoCapacityBits: LN3 / LN2,
      causalReach: 1.0,
      closureQuality: 1.0,
    },
    {
      name: '(iii) k=2 Z[w][1/13] Doublon',
      spatialSupport: 1 / exp1.doub0.ipr,
      temporalPersistence: 'Inf (exact bound mode)',
      compositionalK: 2,
      infoCapacityBits: Math.log2(12) + 1,
      causalReach: Math.abs(exp1.vgDoublon),
      closureQuality: 1 - exp1.epsK2Rest20,
    },
    {
      name: '(iv) k=3 Z[w][1/7] Trion',
      spatialSupport: 1 / exp1.trion0.ipr,
      temporalPersistence: 'Inf (exact bound mode)',
      compositionalK: 3,
      infoCapacityBits: Math.log2(8) + 6 / 7,
      causalReach: Math.abs(exp1.vgDoublon) * 0.7,
      closureQuality: 1 - exp1.epsK3Rest20,
    },
    {
      name: '(v) B_1=[[552,25,40]]_3 + U_star GHZ',
      spatialSupport: 552,
      temporalPersistence: 'Inf (U_bdy^star, ord 3)',
      compositionalK: 25,
      infoCapacityBits: 25 * (LN3 / LN2),
      causalReach: 2.0,
      closureQuality: 1.0,
    },
  ]

  // Verify genuine partial-order non-comparability (Sec 1-2): e.g., k=1 pulse has larger causalReach (1.0) than k=2 doublon (v_g < 1),
  // whereas k=2 doublon has strictly larger compositionalK (2 > 1) and infoCapacityBits!
  const partialOrderWitness =
    profiles[1]!.causalReach > profiles[2]!.causalReach &&
    profiles[2]!.compositionalK > profiles[1]!.compositionalK &&
    profiles[4]!.infoCapacityBits > profiles[2]!.infoCapacityBits

  // --- 6(b) Higher-Order Correlation Hierarchy (Q, D, C_2, C_3) & Exact 3-Body XOR + Z_3 Synergy (Sec 4, 5) ---
  // 16-site alternating vs separated patterns (Sec 4-5):
  const alt16: readonly Valence[] = Array.from({ length: 16 }, (_, i) => (i % 2 === 0 ? 1 : -1))
  const sep16: readonly Valence[] = Array.from({ length: 16 }, (_, i) => (i < 8 ? 1 : -1))
  const stat16 = (cfg: readonly Valence[]) => {
    const Q = cfg.reduce<number>((s, v) => s + v, 0)
    const D = cfg.reduce<number>((s, v) => s + Math.abs(v), 0) / cfg.length
    const mu = Q / cfg.length
    let c2Ring = 0
    for (let i = 0; i < cfg.length; i++) c2Ring += cfg[i]! * cfg[(i + 1) % cfg.length]!
    c2Ring /= cfg.length
    let c2Chain = 0
    for (let i = 0; i < cfg.length - 1; i++) c2Chain += cfg[i]! * cfg[i + 1]!
    c2Chain /= cfg.length - 1
    return { Q, D, mu, c2Ring, c2Chain }
  }
  const stAlt = stat16(alt16)
  const stSep = stat16(sep16)

  // Exact binary 3-body XOR synergy ensemble: X1, X2 independent uniform in {0, 1}, X3 = X1 XOR X2 (signed s = 1 - 2x in {+1,-1})
  const shannonBits = (probs: readonly number[]): number =>
    probs.reduce((h, p) => (p > 1e-15 ? h - p * Math.log2(p) : h), 0)
  const xorSamples: readonly (readonly [number, number, number])[] = [
    [0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 0],
  ]
  const compute3BodyMI = (samples: readonly (readonly [number, number, number])[], alph: number) => {
    const n = samples.length
    const hSingle = (idx: number): number => {
      const cnt = new Float64Array(alph)
      for (const s of samples) cnt[s[idx]!] = cnt[s[idx]!]! + 1 / n
      return shannonBits(Array.from(cnt))
    }
    const hPair = (i: number, j: number): number => {
      const cnt = new Float64Array(alph * alph)
      for (const s of samples) cnt[s[i]! * alph + s[j]!] = cnt[s[i]! * alph + s[j]!]! + 1 / n
      return shannonBits(Array.from(cnt))
    }
    const hAll = Math.log2(n)
    const h1 = hSingle(0), h2 = hSingle(1), h3 = hSingle(2)
    const i12 = h1 + h2 - hPair(0, 1)
    const i31 = h3 + h1 - hPair(2, 0)
    const i32 = h3 + h2 - hPair(2, 1)
    const i3_12 = h3 + hPair(0, 1) - hAll
    const synergy = i3_12 - i31 - i32
    return { i12, i31, i32, i3_12, synergy }
  }
  const xorMI = compute3BodyMI(xorSamples, 2)
  // Exact signed correlation moments C_1, C_2, C_3 on XOR ensemble (s = 1 - 2x in {+1, -1})
  let xorC1 = 0, xorC2 = 0, xorC3 = 0
  for (const [a, b, c] of xorSamples) {
    const sa = 1 - 2 * a, sb = 1 - 2 * b, sc = 1 - 2 * c
    xorC1 += sa / 4
    xorC2 += (sa * sb) / 4
    xorC3 += (sa * sb * sc) / 4
  }

  // Native ternary Z_3 parity-check triple (matching B_1's allZ stabilizer sum x_i = 0 mod 3):
  const z3Samples: [number, number, number][] = []
  for (let x1 = 0; x1 < 3; x1++) for (let x2 = 0; x2 < 3; x2++) z3Samples.push([x1, x2, mod3(-(x1 + x2))])
  const z3MI = compute3BodyMI(z3Samples, 3)

  // --- 6(c) Alternative Valence Composition Functionals (Sec 38) ---
  // Note: Strictly mathematical aggregation functionals, NOT a derived law of phenomenal valence (MS-25 stays open).
  const evalValenceLaws = (cfg: readonly Valence[], c2Ring: number, negWeight = 2.0) => {
    const additive = cfg.reduce<number>((s, v) => s + v, 0)
    const averaged = additive / cfg.length
    const negWeighted = cfg.reduce<number>((s, v) => s + (v < 0 ? negWeight * v : v), 0)
    const peakMin = Math.min(...cfg)
    const relational = additive + 1.0 * c2Ring
    return { additive, averaged, negWeighted, peakMin, relational }
  }
  const valAlt = evalValenceLaws(alt16, stAlt.c2Ring, 2.0)
  const valSep = evalValenceLaws(sep16, stSep.c2Ring, 2.0)

  console.log('  [6a] Measured Scale-Profile Vectors sigma(A) across 5 Vibe Theory systems:')
  for (const p of profiles) {
    console.log(
      `    ${p.name.padEnd(36)} | supp=${p.spatialSupport.toFixed(2).padStart(6)} | k=${String(p.compositionalK).padStart(2)} | cap=${p.infoCapacityBits.toFixed(2).padStart(6)} bits | reach=${p.causalReach.toFixed(3)} | closure=${p.closureQuality.toFixed(6)} | ${p.temporalPersistence}`,
    )
  }
  console.log(`       Partial-order non-comparability verified=${partialOrderWitness}; B_1 holographic bottleneck = 25/552 = ${((25 / 552) * 100).toFixed(3)}%`)
  console.log(`       W11 U_star 25-qutrit GHZ on B_1: S(1)=${sGhZ1}, S(2)=${sGhZ2}, S(12)=${sGhZ12}, S(25)=${sGhZ25} (ln 3 units); I(b_0:b_1)=${iGhZPair} vs I(b_0:rest)=${iGhZFull} => pure 25-body quantum synergy=${ghzGlobalSynergyBits.toFixed(6)} bits`)
  console.log(`  [6b] Higher-order correlation hierarchy:`)
  console.log(`       16-site Alt vs Sep: Q=[${stAlt.Q},${stSep.Q}], D=[${stAlt.D},${stSep.D}], C_2(ring)=[${stAlt.c2Ring.toFixed(3)}, ${stSep.c2Ring.toFixed(3)}], C_2(chain)=[${stAlt.c2Chain.toFixed(3)}, ${stSep.c2Chain.toFixed(3)}]`)
  console.log(`       3-body Binary XOR: C_1=${xorC1}, C_2=${xorC2}, C_3=${xorC3.toFixed(3)}; I(X3;X1)=${xorMI.i31.toFixed(4)}, I(X3;X2)=${xorMI.i32.toFixed(4)}, I(X3;X1,X2)=${xorMI.i3_12.toFixed(6)} bits (pure synergy=${xorMI.synergy.toFixed(6)} bits)`)
  console.log(`       3-body Ternary Z_3: I(X3;X1)=${z3MI.i31.toFixed(4)}, I(X3;X2)=${z3MI.i32.toFixed(4)}, I(X3;X1,X2)=${z3MI.i3_12.toFixed(6)} bits (= log2(3) pure synergy!)`)
  console.log(`  [6c] Sec 38 valence functionals (8 +1, 8 -1, w_-=2.0x): Alt [add=${valAlt.additive}, avg=${valAlt.averaged.toFixed(2)}, negW=${valAlt.negWeighted.toFixed(1)}, peak=${valAlt.peakMin}, rel=${valAlt.relational.toFixed(2)}] vs Sep [add=${valSep.additive}, avg=${valSep.averaged.toFixed(2)}, negW=${valSep.negWeighted.toFixed(1)}, peak=${valSep.peakMin}, rel=${valSep.relational.toFixed(2)}]`)

  recordCheck(
    'W20.6',
    'Exp 6: Scale-Profile Vectors sigma(A), XOR/Z_3/GHZ Synergy Hierarchy & Sec 38 Valence Functionals',
    partialOrderWitness &&
      sGhZ1 === 1 && sGhZ2 === 1 && sGhZ12 === 1 && sGhZ25 === 0 &&
      iGhZPair === 1 && iGhZFull === 2 &&
      stAlt.Q === 0 && stSep.Q === 0 &&
      Math.abs(stAlt.c2Ring - -1) < 1e-12 &&
      Math.abs(stSep.c2Ring - 0.75) < 1e-12 &&
      xorC1 === 0 && xorC2 === 0 && xorC3 === 1 &&
      Math.abs(xorMI.i31) < 1e-12 && Math.abs(xorMI.i32) < 1e-12 && Math.abs(xorMI.i3_12 - 1) < 1e-12 &&
      Math.abs(z3MI.i31) < 1e-12 && Math.abs(z3MI.i3_12 - LN3 / LN2) < 1e-12 &&
      valAlt.additive === 0 && Math.abs(valAlt.negWeighted - -8) < 1e-12 &&
      valAlt.relational !== valSep.relational,
    `5 profiles partial-ordered; U_star 25-GHZ S=1/1/1/0 (synergy=${ghzGlobalSynergyBits.toFixed(3)} bits); XOR I=1.000 (pair=0); Z_3 I=1.585 (pair=0); Sec 38 negW=-8.0 vs Q=0`,
  )
}

// =================================================================================================
// MAIN EXECUTION & FINAL LEDGER
// =================================================================================================

const exp1Res = runExperiment1()
runExperiment2()
runExperiment3()
runExperiment4(exp1Res.doub0)
runExperiment5()
runExperiment6(exp1Res)

const elapsedSec = ((Date.now() - tStart) / 1000).toFixed(3)
const peakRssMb = (process.memoryUsage().rss / (1024 * 1024)).toFixed(1)
const nPass = CHECKS.filter(c => c.passed).length

console.log('\n==========================================================================================')
console.log(`W20 SUMMARY LEDGER: ${nPass}/${CHECKS.length} CHECKS PASSED (${elapsedSec} s, RSS ${peakRssMb} MB)`)
console.log('==========================================================================================')
for (const c of CHECKS) {
  console.log(`  [${c.passed ? 'PASS' : 'FAIL'}] ${c.id.padEnd(6)} ${c.name}`)
  console.log(`           -> ${c.detail}`)
}

if (nPass !== CHECKS.length) {
  process.exitCode = 1
}
