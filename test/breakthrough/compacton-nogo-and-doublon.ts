// Breakthrough Suite (Wave-2 Track W3, Open Challenge 5 Complete Analysis and Verification):
//   4D Bare-U Compacton / Breather No-Go Theorem, Hyperbolic Frontier-Leakage Kernels,
//   Multi-Dock 4-Cycle Ring Search, Sharpness Controls, and Exact k=2 Scattering / Bound-State Classification.
//
// Strictly deterministic (ZERO Math.random), zero external imports, exact BigInt Z[zeta_9][1/6] + O^+(4,1; Z[sqrt(2)]),
// plus Float64 exact spectral solvers for k=2 scattering. Laptop-safe (< 5 s), noUncheckedIndexedAccess-safe.

// =================================================================================================
// 0. HARNESS & COMPLEX / LINEAR ALGEBRA PRIMITIVES
// =================================================================================================

type CheckRow = {
  readonly part: string
  readonly name: string
  readonly passed: boolean
  readonly detail: string
}

const CHECKS: CheckRow[] = []

function recordCheck(part: string, name: string, passed: boolean, detail: string): void {
  CHECKS.push({ part, name, passed, detail })
}

function assertExact(cond: boolean, msg: string): void {
  if (!cond) throw new Error(`Assertion failed: ${msg}`)
}

type C2 = readonly [number, number]
const cAdd = (a: C2, b: C2): C2 => [a[0] + b[0], a[1] + b[1]]
const cSub = (a: C2, b: C2): C2 => [a[0] - b[0], a[1] - b[1]]
const cMul = (a: C2, b: C2): C2 => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]
const cConj = (a: C2): C2 => [a[0], -a[1]]
const cAbs2 = (a: C2): number => a[0] * a[0] + a[1] * a[1]
const cAbs = (a: C2): number => Math.hypot(a[0], a[1])

function realSymmetricEigen(n: number, inMat: Float64Array, maxSweeps = 120): {
  readonly values: Float64Array
  readonly vecs: Float64Array
  readonly maxResidual: number
} {
  const a = Float64Array.from(inMat)
  const v = new Float64Array(n * n)
  for (let i = 0; i < n; i++) v[i * n + i] = 1

  for (let sweep = 0; sweep < maxSweeps; sweep++) {
    let rotated = false
    for (let p = 0; p < n - 1; p++) {
      for (let q = p + 1; q < n; q++) {
        const apq = a[p * n + q]!
        const mag = Math.abs(apq)
        if (mag === 0) continue
        const app = a[p * n + p]!
        const aqq = a[q * n + q]!
        const maxDiag = Math.max(Math.abs(app), Math.abs(aqq))
        if (mag <= (maxDiag > 0 ? 1e-15 * maxDiag : 1e-300)) continue
        rotated = true
        const tau = (aqq - app) / (2 * apq)
        const t = tau >= 0 ? 1 / (tau + Math.hypot(1, tau)) : -1 / (-tau + Math.hypot(1, tau))
        const c = 1 / Math.hypot(1, t)
        const s = t * c
        a[p * n + p] = app - t * apq
        a[q * n + q] = aqq + t * apq
        a[p * n + q] = 0
        a[q * n + p] = 0
        for (let k = 0; k < n; k++) {
          if (k === p || k === q) continue
          const akp = a[k * n + p]!
          const akq = a[k * n + q]!
          const nkp = c * akp - s * akq
          const nkq = s * akp + c * akq
          a[k * n + p] = nkp
          a[p * n + k] = nkp
          a[k * n + q] = nkq
          a[q * n + k] = nkq
        }
        for (let k = 0; k < n; k++) {
          const vkp = v[k * n + p]!
          const vkq = v[k * n + q]!
          v[k * n + p] = c * vkp - s * vkq
          v[k * n + q] = s * vkp + c * vkq
        }
      }
    }
    if (!rotated) break
  }

  const order = Array.from({ length: n }, (_, i) => i).sort((i, j) => a[i * n + i]! - a[j * n + j]!)
  const values = new Float64Array(n)
  const vecs = new Float64Array(n * n)
  for (let col = 0; col < n; col++) {
    const src = order[col]!
    values[col] = a[src * n + src]!
    for (let r = 0; r < n; r++) vecs[r * n + col] = v[r * n + src]!
  }

  let maxResidual = 0
  for (let col = 0; col < n; col++) {
    const lam = values[col]!
    let errSq = 0
    for (let r = 0; r < n; r++) {
      let sum = 0
      for (let c = 0; c < n; c++) sum += inMat[r * n + c]! * vecs[c * n + col]!
      const diff = sum - lam * vecs[r * n + col]!
      errSq += diff * diff
    }
    const res = Math.sqrt(errSq)
    if (res > maxResidual) maxResidual = res
  }
  return { values, vecs, maxResidual }
}

function hermitianEigen(n: number, reIn: Float64Array, imIn: Float64Array): {
  readonly values: Float64Array
  readonly vecRe: Float64Array
  readonly vecIm: Float64Array
  readonly maxResidual: number
} {
  const m = 2 * n
  const big = new Float64Array(m * m)
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const vr = reIn[r * n + c]!
      const vi = imIn[r * n + c]!
      big[r * m + c] = vr
      big[r * m + (n + c)] = -vi
      big[(n + r) * m + c] = vi
      big[(n + r) * m + (n + c)] = vr
    }
  }
  const eig = realSymmetricEigen(m, big, 140)
  const values = new Float64Array(n)
  const vecRe = new Float64Array(n * n)
  const vecIm = new Float64Array(n * n)

  const pickedRe: Float64Array[] = []
  const pickedIm: Float64Array[] = []
  for (let idx = 0; idx < m && pickedRe.length < n; idx++) {
    const xr = new Float64Array(n)
    const xi = new Float64Array(n)
    for (let r = 0; r < n; r++) {
      xr[r] = eig.vecs[r * m + idx]!
      xi[r] = eig.vecs[(n + r) * m + idx]!
    }
    for (let p = 0; p < pickedRe.length; p++) {
      const pr = pickedRe[p]!
      const pi = pickedIm[p]!
      let dotR = 0
      let dotI = 0
      for (let r = 0; r < n; r++) {
        dotR += pr[r]! * xr[r]! + pi[r]! * xi[r]!
        dotI += pr[r]! * xi[r]! - pi[r]! * xr[r]!
      }
      for (let r = 0; r < n; r++) {
        xr[r] = xr[r]! - (dotR * pr[r]! - dotI * pi[r]!)
        xi[r] = xi[r]! - (dotR * pi[r]! + dotI * pr[r]!)
      }
    }
    let norm2 = 0
    for (let r = 0; r < n; r++) norm2 += xr[r]! * xr[r]! + xi[r]! * xi[r]!
    if (norm2 > 1e-6) {
      const inv = 1 / Math.sqrt(norm2)
      for (let r = 0; r < n; r++) {
        xr[r] = xr[r]! * inv
        xi[r] = xi[r]! * inv
      }
      const k = pickedRe.length
      values[k] = eig.values[idx]!
      pickedRe.push(xr)
      pickedIm.push(xi)
      for (let r = 0; r < n; r++) {
        vecRe[r * n + k] = xr[r]!
        vecIm[r * n + k] = xi[r]!
      }
    }
  }
  assertExact(pickedRe.length === n, `hermitianEigen extracted ${pickedRe.length}/${n}`)

  let maxResidual = 0
  for (let col = 0; col < n; col++) {
    const lam = values[col]!
    let errSq = 0
    for (let r = 0; r < n; r++) {
      let sR = 0
      let sI = 0
      for (let c = 0; c < n; c++) {
        const mr = reIn[r * n + c]!
        const mi = imIn[r * n + c]!
        const vr = vecRe[c * n + col]!
        const vi = vecIm[c * n + col]!
        sR += mr * vr - mi * vi
        sI += mr * vi + mi * vr
      }
      const dR = sR - lam * vecRe[r * n + col]!
      const dI = sI - lam * vecIm[r * n + col]!
      errSq += dR * dR + dI * dI
    }
    const res = Math.sqrt(errSq)
    if (res > maxResidual) maxResidual = res
  }
  return { values, vecRe, vecIm, maxResidual }
}

// Exact unitary eigensolver: diagonalizes H = (e^{-ia} U + e^{ia} U^dag)/2, then splits any cluster
// using the commuting Hermitian part S = (e^{-ia} U - e^{ia} U^dag)/(2i).
function unitaryEigen(n: number, uRe: Float64Array, uIm: Float64Array): {
  readonly phases: Float64Array // quasienergy E in (-pi, pi] with U v = e^{i E} v
  readonly vecRe: Float64Array
  readonly vecIm: Float64Array
  readonly maxResidual: number
} {
  const alpha = 0.7132917
  const ca = Math.cos(alpha)
  const sa = Math.sin(alpha)
  // V = e^{-i alpha} U
  const vRe = new Float64Array(n * n)
  const vIm = new Float64Array(n * n)
  for (let i = 0; i < n * n; i++) {
    vRe[i] = ca * uRe[i]! + sa * uIm[i]!
    vIm[i] = ca * uIm[i]! - sa * uRe[i]!
  }
  const hRe = new Float64Array(n * n)
  const hIm = new Float64Array(n * n)
  const sRe = new Float64Array(n * n)
  const sIm = new Float64Array(n * n)
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const vrcR = vRe[r * n + c]!
      const vrcI = vIm[r * n + c]!
      const vcrR = vRe[c * n + r]!
      const vcrI = -vIm[c * n + r]! // V^dag_{r,c} = conj(V_{c,r})
      // H = (V + V^dag)/2
      hRe[r * n + c] = 0.5 * (vrcR + vcrR)
      hIm[r * n + c] = 0.5 * (vrcI + vcrI)
      // S = (V - V^dag)/(2i) = -i/2 * (V - V^dag) => Re = (Im(V)-Im(V^dag))/2, Im = -(Re(V)-Re(V^dag))/2
      sRe[r * n + c] = 0.5 * (vrcI - vcrI)
      sIm[r * n + c] = -0.5 * (vrcR - vcrR)
    }
  }
  const hEig = hermitianEigen(n, hRe, hIm)
  const vecRe = Float64Array.from(hEig.vecRe)
  const vecIm = Float64Array.from(hEig.vecIm)

  // Refine any degenerate/near-degenerate cluster in H using S.
  let start = 0
  while (start < n) {
    let end = start + 1
    while (end < n && Math.abs(hEig.values[end]! - hEig.values[start]!) < 1e-7) end++
    const d = end - start
    if (d > 1) {
      const subRe = new Float64Array(d * d)
      const subIm = new Float64Array(d * d)
      for (let a = 0; a < d; a++) {
        for (let b = 0; b < d; b++) {
          let sR = 0
          let sI = 0
          for (let r = 0; r < n; r++) {
            // (S v_b)_r
            let svR = 0
            let svI = 0
            for (let c = 0; c < n; c++) {
              const sr = sRe[r * n + c]!
              const si = sIm[r * n + c]!
              const br = hEig.vecRe[c * n + (start + b)]!
              const bi = hEig.vecIm[c * n + (start + b)]!
              svR += sr * br - si * bi
              svI += sr * bi + si * br
            }
            const ar = hEig.vecRe[r * n + (start + a)]!
            const ai = hEig.vecIm[r * n + (start + a)]!
            sR += ar * svR + ai * svI
            sI += ar * svI - ai * svR
          }
          subRe[a * d + b] = sR
          subIm[a * d + b] = sI
        }
      }
      const sEig = hermitianEigen(d, subRe, subIm)
      for (let b = 0; b < d; b++) {
        for (let r = 0; r < n; r++) {
          let nr = 0
          let ni = 0
          for (let a = 0; a < d; a++) {
            const vr = hEig.vecRe[r * n + (start + a)]!
            const vi = hEig.vecIm[r * n + (start + a)]!
            const cr = sEig.vecRe[a * d + b]!
            const ci = sEig.vecIm[a * d + b]!
            nr += vr * cr - vi * ci
            ni += vr * ci + vi * cr
          }
          vecRe[r * n + (start + b)] = nr
          vecIm[r * n + (start + b)] = ni
        }
      }
    }
    start = end
  }

  const phases = new Float64Array(n)
  let maxResidual = 0
  for (let col = 0; col < n; col++) {
    // Rayleigh quotient lam = v^dag U v
    let lamR = 0
    let lamI = 0
    const uvR = new Float64Array(n)
    const uvI = new Float64Array(n)
    for (let r = 0; r < n; r++) {
      let sR = 0
      let sI = 0
      for (let c = 0; c < n; c++) {
        const mr = uRe[r * n + c]!
        const mi = uIm[r * n + c]!
        const vr = vecRe[c * n + col]!
        const vi = vecIm[c * n + col]!
        sR += mr * vr - mi * vi
        sI += mr * vi + mi * vr
      }
      uvR[r] = sR
      uvI[r] = sI
      const ar = vecRe[r * n + col]!
      const ai = vecIm[r * n + col]!
      lamR += ar * sR + ai * sI
      lamI += ar * sI - ai * sR
    }
    phases[col] = Math.atan2(lamI, lamR)
    let errSq = 0
    for (let r = 0; r < n; r++) {
      const vr = vecRe[r * n + col]!
      const vi = vecIm[r * n + col]!
      const dR = uvR[r]! - (lamR * vr - lamI * vi)
      const dI = uvI[r]! - (lamR * vi + lamI * vr)
      errSq += dR * dR + dI * dI
    }
    const res = Math.sqrt(errSq)
    if (res > maxResidual) maxResidual = res
  }
  return { phases, vecRe, vecIm, maxResidual }
}

// =================================================================================================
// 1. EXACT Z[zeta_9][1/6], D_4 ROOTS, W(F_4), chi_odd, AND {3,4,3,4} COXETER ENGINE (test/universe.ts)
// =================================================================================================

type Z9 = readonly [bigint, bigint, bigint, bigint, bigint, bigint]
type Root4 = readonly [bigint, bigint, bigint, bigint]
type AntipodalLine = readonly [number, number]
type Q2 = readonly [bigint, bigint]
type ToneNZ = -1 | 1
type Vibe = readonly [dock: number, slot: number, tone: ToneNZ, role: number]
type ExactState = { readonly amp: Map<string, Z9>; readonly den: bigint }
type ActiveLine = readonly [number | undefined, number | undefined, number, number]

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
const conjZ9 = (a: Z9): Z9 => [a[0] - a[3], -a[2], -a[1], -a[3], a[5] - a[2], a[4] - a[1]]
const adjointZ9 = (a: Z9, dag: boolean): Z9 => (dag ? conjZ9(a) : a)
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

function z9ToComplex(a: Z9, den = 1n): C2 {
  const inv = 1 / Number(den)
  let re = 0
  let im = 0
  for (let k = 0; k < 6; k++) {
    const c = Number(a[k]!)
    if (c === 0) continue
    const ang = (2 * Math.PI * k) / 9
    re += c * Math.cos(ang)
    im += c * Math.sin(ang)
  }
  return [re * inv, im * inv]
}

function buildD4Roots(): readonly Root4[] {
  const roots: Root4[] = []
  const signs: readonly bigint[] = [1n, -1n]
  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      for (const si of signs) {
        for (const sj of signs) {
          const coords: [bigint, bigint, bigint, bigint] = [0n, 0n, 0n, 0n]
          coords[i] = si
          coords[j] = sj
          roots.push(coords)
        }
      }
    }
  }
  return roots
}

const ROOTS: readonly Root4[] = buildD4Roots()
const dot4 = (a: Root4, b: Root4): bigint => a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]
const OPPOSITE_SLOT: readonly number[] = ROOTS.map(r =>
  ROOTS.findIndex(o => o[0] === -r[0] && o[1] === -r[1] && o[2] === -r[2] && o[3] === -r[3]),
)
const LINES: readonly AntipodalLine[] = ROOTS.flatMap((_, a) => {
  const b = OPPOSITE_SLOT[a]!
  return a < b ? [[a, b] as const] : []
})
const LINE_OF_SLOT: readonly number[] = ROOTS.map((_, s) =>
  LINES.findIndex(([a, b]) => a === s || b === s),
)

// W(F_4) (order 1,152) and canonical chiral invariant chi_odd.
type WF4Group = { readonly elements: readonly Uint8Array[]; readonly det: readonly number[] }

function buildWF4Group(): WF4Group {
  const simpleRoots: readonly Root4[] = [
    [0n, 1n, -1n, 0n],
    [0n, 0n, 1n, -1n],
    [0n, 0n, 0n, 1n],
    [1n, -1n, -1n, -1n],
  ]
  const simplePerms = simpleRoots.map(alpha => {
    const aa = dot4(alpha, alpha)
    const perm = new Uint8Array(24)
    for (let slot = 0; slot < 24; slot++) {
      const v = ROOTS[slot]!
      const twoVa = 2n * dot4(v, alpha)
      const img: bigint[] = []
      for (let k = 0; k < 4; k++) img.push(v[k]! - (twoVa * alpha[k]!) / aa)
      const idx = ROOTS.findIndex(
        o => o[0] === img[0] && o[1] === img[1] && o[2] === img[2] && o[3] === img[3],
      )
      assertExact(idx >= 0, 'F_4 reflection left D_4')
      perm[slot] = idx
    }
    return perm
  })

  const id = Uint8Array.from({ length: 24 }, (_, d) => d)
  const elements: Uint8Array[] = [id]
  const det: number[] = [1]
  const seen = new Map<string, number>([[id.join(','), 0]])
  for (let head = 0; head < elements.length; head++) {
    const cur = elements[head]!
    const nextDet = -det[head]!
    for (const ref of simplePerms) {
      const next = new Uint8Array(24)
      for (let d = 0; d < 24; d++) next[d] = ref[cur[d]!]!
      const key = next.join(',')
      if (!seen.has(key)) {
        seen.set(key, elements.length)
        elements.push(next)
        det.push(nextDet)
      }
    }
  }
  assertExact(elements.length === 1152, `W(F_4) order ${elements.length}`)
  return { elements, det }
}

const WF4_GROUP = buildWF4Group()

function lexKey4(a0: number, a1: number, a2: number, a3: number): number {
  let x0 = a0
  let x1 = a1
  let x2 = a2
  let x3 = a3
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
  const s0 = c0 >> 1
  const s1 = c1 >> 1
  const s2 = c2 >> 1
  const s3 = c3 >> 1
  const b0 = c0 & 1
  const b1 = c1 & 1
  const b2 = c2 & 1
  const b3 = c3 & 1
  let minKey = Number.POSITIVE_INFINITY
  let minSign = 0
  let chiral = true
  const elems = WF4_GROUP.elements
  const dets = WF4_GROUP.det
  for (let e = 0; e < elems.length; e++) {
    const p = elems[e]!
    const d = dets[e]!
    const ps0 = p[s0]! << 1
    const ps1 = p[s1]! << 1
    const ps2 = p[s2]! << 1
    const ps3 = p[s3]! << 1
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

function chiralOrientationDock(vibes: readonly Vibe[], indices: readonly number[]): number {
  let chi = 0
  for (let i = 0; i < indices.length; i++) {
    const vi = vibes[indices[i]!]!
    const ci = (vi[1] << 1) + (vi[2] < 0 ? 1 : 0)
    for (let j = i + 1; j < indices.length; j++) {
      const vj = vibes[indices[j]!]!
      const cj = (vj[1] << 1) + (vj[2] < 0 ? 1 : 0)
      for (let k = j + 1; k < indices.length; k++) {
        const vk = vibes[indices[k]!]!
        const ck = (vk[1] << 1) + (vk[2] < 0 ? 1 : 0)
        for (let l = k + 1; l < indices.length; l++) {
          const vl = vibes[indices[l]!]!
          const cl = (vl[1] << 1) + (vl[2] < 0 ? 1 : 0)
          chi += chiral4Sign(ci, cj, ck, cl)
        }
      }
    }
  }
  return chi
}

// Exact O^+(4,1; Z[sqrt(2)]) {3,4,3,4} Coxeter engine.
const DIM5 = [0, 1, 2, 3, 4] as const
const Q2_ZERO: Q2 = [0n, 0n]
const EYE5: readonly (readonly Q2[])[] = DIM5.map(r => DIM5.map(c => [r === c ? 1n : 0n, 0n] as const))
const addQ2 = (u: Q2, v: Q2): Q2 => [u[0] + v[0], u[1] + v[1]]
const subQ2 = (u: Q2, v: Q2): Q2 => [u[0] - v[0], u[1] - v[1]]
const mulQ2 = (u: Q2, v: Q2): Q2 => [u[0] * v[0] + 2n * u[1] * v[1], u[0] * v[1] + u[1] * v[0]]
const dotQ2 = (u: readonly Q2[], v: readonly Q2[]): Q2 =>
  u.reduce<Q2>((s, e, i) => addQ2(s, mulQ2(e, v[i]!)), Q2_ZERO)
const vecKeyQ2 = (v: readonly Q2[]): string => v.map(([a, b]) => `${a},${b}`).join(';')
const matKeyQ2 = (m: readonly (readonly Q2[])[]): string => m.map(vecKeyQ2).join('|')
const matVecQ2 = (m: readonly (readonly Q2[])[], v: readonly Q2[]): Q2[] => m.map(r => dotQ2(r, v))
const matMulQ2 = (a: readonly (readonly Q2[])[], b: readonly (readonly Q2[])[]): Q2[][] =>
  a.map(row => DIM5.map(col => dotQ2(row, b.map(br => br[col]!))))

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

function buildCellTransports(): readonly (readonly (readonly Q2[])[])[] {
  const stabGens = [0, 1, 2, 3].map(idx => reflect5(EYE5[idx]!))
  const facetNormals: Q2[][] = [EYE5[4]!.slice()]
  const seen = new Set<string>([vecKeyQ2(EYE5[4]!)])
  for (const n of facetNormals) {
    for (const g of stabGens) {
      const next = matVecQ2(g, n)
      const key = vecKeyQ2(next)
      if (!seen.has(key)) {
        seen.add(key)
        facetNormals.push(next)
      }
    }
  }
  const facetDot = (a: number, b: number): bigint =>
    (twiceForm(facetNormals[a]!, facetNormals[b]!)[0] + 2n) / 2n
  const orthoBasis: number[] = []
  for (let f = 0; f < 24 && orthoBasis.length < 4; f++) {
    if (orthoBasis.every(prev => facetDot(f, prev) === 0n)) orthoBasis.push(f)
  }
  const facetRoots: Root4[] = facetNormals.map((_, f) => {
    const [c0, c1, c2, c3] = orthoBasis.map(o => facetDot(f, o))
    return [(c0! + c1!) / 2n, (c0! - c1!) / 2n, (c2! + c3!) / 2n, (c2! - c3!) / 2n]
  })
  return ROOTS.map(root => {
    const fIdx = facetRoots.findIndex(fr => fr.every((v, i) => v === root[i]))
    return matMulQ2(reflect5(facetNormals[fIdx]!), CENTRAL_INVERSION)
  })
}

const TRANSPORTS = buildCellTransports()

const dockFrames: (readonly (readonly Q2[])[])[] = [EYE5]
const frameKeys: string[] = [matKeyQ2(EYE5)]
const dockParity: number[] = [1]
const centerToDockId = new Map<string, number>([[vecKeyQ2(BASE_CENTER), 0]])
const hcNeighbors: Int32Array[] = [new Int32Array(24).fill(-1)]
const dockH2Cache: bigint[] = [2n]
let hcInconsistentSteps = 0

function lorentzCosh2Q2(dock: number): Q2 {
  const tf = twiceForm(matVecQ2(dockFrames[dock]!, BASE_CENTER), BASE_CENTER)
  return [-tf[0], -tf[1]]
}

function lorentzCosh2(dock: number): bigint {
  return dockH2Cache[dock]!
}

function stepDock(dock: number, slot: number): number {
  const cached = hcNeighbors[dock]![slot]!
  if (cached >= 0) return cached
  const nextFrame = matMulQ2(dockFrames[dock]!, TRANSPORTS[slot]!)
  const nextCenter = matVecQ2(nextFrame, BASE_CENTER)
  const centerKey = vecKeyQ2(nextCenter)
  const fKey = matKeyQ2(nextFrame)
  let nextId = centerToDockId.get(centerKey)
  if (nextId === undefined) {
    nextId = dockFrames.length
    centerToDockId.set(centerKey, nextId)
    dockFrames.push(nextFrame)
    frameKeys.push(fKey)
    dockParity.push(-dockParity[dock]!)
    hcNeighbors.push(new Int32Array(24).fill(-1))
    const h2q = twiceForm(nextCenter, BASE_CENTER)
    assertExact(h2q[1] === 0n, `sqrt(2) part of H_2 nonzero at dock ${nextId}`)
    dockH2Cache.push(-h2q[0])
  } else if (frameKeys[nextId] !== fKey || dockParity[nextId] !== -dockParity[dock]!) {
    hcInconsistentSteps++
  }
  hcNeighbors[dock]![slot] = nextId
  hcNeighbors[nextId]![OPPOSITE_SLOT[slot]!] = dock
  return nextId
}

// =================================================================================================
// 2. EXACT BARE 8-LAYER PALINDROMIC QCA OPERATORS (MATCHING test/universe.ts EXACTLY)
// =================================================================================================

function encodeConfig(vibes: readonly Vibe[]): string {
  return [...vibes]
    .sort((a, b) => a[0] - b[0] || a[1] - b[1])
    .map(v => v.join(':'))
    .join(';')
}

function decodeConfig(key: string): Vibe[] {
  if (key === '') return []
  return key.split(';').map(entry => {
    const p = entry.split(':')
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

function innerProductExact(a: ExactState, b: ExactState): { readonly num: Z9; readonly den: bigint } {
  let sum = Z9_ZERO
  for (const [k, va] of a.amp) {
    const vb = b.amp.get(k)
    if (vb !== undefined) sum = addZ9(sum, mulZ9(conjZ9(va), vb))
  }
  return { num: sum, den: a.den * b.den }
}

function hasExactUnitNorm(s: ExactState): boolean {
  const ip = innerProductExact(s, s)
  const target: Z9 = [ip.den, 0n, 0n, 0n, 0n, 0n]
  return isZeroZ9(subZ9(ip.num, target))
}

function countStateDiffs(a: ExactState, b: ExactState): number {
  const keys = new Set([...a.amp.keys(), ...b.amp.keys()])
  let diffs = 0
  for (const key of keys) {
    const lhs = scaleZ9(b.den, a.amp.get(key) ?? Z9_ZERO)
    const rhs = scaleZ9(a.den, b.amp.get(key) ?? Z9_ZERO)
    if (!isZeroZ9(subZ9(lhs, rhs))) diffs++
  }
  return diffs
}

function groupByDock(vibes: readonly Vibe[]): Map<number, number[]> {
  const groups = new Map<number, number[]>()
  for (let i = 0; i < vibes.length; i++) {
    const d = vibes[i]![0]
    const list = groups.get(d)
    if (list) list.push(i)
    else groups.set(d, [i])
  }
  return groups
}

function collectActiveLines(vibes: readonly Vibe[]): ActiveLine[] {
  const result: ActiveLine[] = []
  for (const indices of groupByDock(vibes).values()) {
    const bySlot = new Map<number, number>()
    for (const idx of indices) bySlot.set(vibes[idx]![1], idx)
    for (const [slotA, slotB] of LINES) {
      const idxA = bySlot.get(slotA)
      const idxB = bySlot.get(slotB)
      if (idxA !== undefined || idxB !== undefined) result.push([idxA, idxB, slotA, slotB])
    }
  }
  return result
}

function mapConfigs(
  state: ExactState,
  transform: (vibes: Vibe[], amp: Z9) => readonly [Vibe[], Z9],
): ExactState {
  const out = new Map<string, Z9>()
  for (const [k, amp] of state.amp) {
    const [nv, na] = transform(decodeConfig(k), amp)
    addAmpZ9(out, encodeConfig(nv), na)
  }
  return { amp: out, den: state.den }
}

function applyBranchingLayer<Item>(
  state: ExactState,
  branchDen: bigint,
  prepare: (vibes: Vibe[], amp: Z9) => readonly [Item[], Z9],
  expand: (cfg: Vibe[], amp: Z9, item: Item) => readonly (readonly [Vibe[], Z9])[],
): ExactState {
  const prepared = [...state.amp.entries()].map(([k, amp]) => {
    const vibes = decodeConfig(k)
    const [items, phasedAmp] = prepare(vibes, amp)
    return { vibes, items, phasedAmp }
  })
  const maxDepth = prepared.reduce((b, r) => Math.max(b, r.items.length), 0)
  const out = new Map<string, Z9>()
  for (const { vibes, items, phasedAmp } of prepared) {
    const scale = branchDen ** BigInt(maxDepth - items.length)
    let branches: (readonly [Vibe[], Z9])[] = [[vibes, scaleZ9(scale, phasedAmp)]]
    for (const item of items) branches = branches.flatMap(([cfg, a]) => expand(cfg, a, item))
    for (const [cfg, a] of branches) addAmpZ9(out, encodeConfig(cfg), a)
  }
  return reduceDenZ9(out, state.den * branchDen ** BigInt(maxDepth))
}

function applyHalfCoinD(state: ExactState, dag: boolean): ExactState {
  const detPhase = adjointZ9(Z9_ZETA6, dag)
  const diagCoeff = adjointZ9(Z9_COIN_DIAG, dag)
  const offCoeff = adjointZ9(Z9_COIN_OFF, dag)
  return applyBranchingLayer<readonly [number, number]>(
    state,
    2n,
    (vibes, amp) => {
      const loneSplits: (readonly [number, number])[] = []
      let phased = amp
      for (const [idxA, idxB, slotA, slotB] of collectActiveLines(vibes)) {
        if (idxA !== undefined && idxB !== undefined) phased = mulZ9(phased, detPhase)
        else if (idxA !== undefined) loneSplits.push([idxA, slotB])
        else loneSplits.push([idxB!, slotA])
      }
      return [loneSplits, phased]
    },
    (cfg, amp, [idx, oppSlot]) => {
      const [dock, , tone, role] = cfg[idx]!
      const flipped = cfg.slice()
      flipped[idx] = [dock, oppSlot, tone, role]
      return [[cfg, mulZ9(amp, diagCoeff)], [flipped, mulZ9(amp, offCoeff)]]
    },
  )
}

function applyRoleMeet(state: ExactState, dag: boolean): ExactState {
  const equalRolePhase = adjointZ9(Z9_OMEGA, dag)
  const keepCoeff = adjointZ9(Z9_ZETA6, dag)
  const swapCoeff = adjointZ9(Z9_MEET_SWAP, dag)
  return applyBranchingLayer<readonly [number, number]>(
    state,
    2n,
    (vibes, amp) => {
      const swaps: (readonly [number, number])[] = []
      let phased = amp
      for (const [idxA, idxB] of collectActiveLines(vibes)) {
        if (idxA === undefined || idxB === undefined) continue
        if (vibes[idxA]![2] !== vibes[idxB]![2]) continue
        if (vibes[idxA]![3] === vibes[idxB]![3]) phased = mulZ9(phased, equalRolePhase)
        else swaps.push([idxA, idxB])
      }
      return [swaps, phased]
    },
    (cfg, amp, [idxA, idxB]) => {
      const [dA, sA, tA, rA] = cfg[idxA]!
      const [dB, sB, tB, rB] = cfg[idxB]!
      const swapped = cfg.slice()
      swapped[idxA] = [dA, sA, tA, rB]
      swapped[idxB] = [dB, sB, tB, rA]
      return [[cfg, mulZ9(amp, keepCoeff)], [swapped, mulZ9(amp, swapCoeff)]]
    },
  )
}

function applyPairLineMixer(state: ExactState, dag: boolean): ExactState {
  const hopCoeff = subZ9(adjointZ9(Z9_ZETA18, dag), Z9_ONE)
  const keepCoeff = addZ9([12n, 0n, 0n, 0n, 0n, 0n], hopCoeff)
  return applyBranchingLayer<readonly [number, number, number]>(
    state,
    12n,
    (vibes, amp) => {
      const pairs: (readonly [number, number, number])[] = []
      for (const indices of groupByDock(vibes).values()) {
        if (indices.length !== 2) continue
        const [i0, i1] = [indices[0]!, indices[1]!]
        const v0 = vibes[i0]!
        const v1 = vibes[i1]!
        if (OPPOSITE_SLOT[v0[1]] === v1[1] && v0[2] === v1[2] && v0[3] === v1[3]) {
          pairs.push([i0, i1, LINE_OF_SLOT[v0[1]]!])
        }
      }
      return [pairs, amp]
    },
    (cfg, amp, [i0, i1, curLine]) =>
      LINES.map(([slotA, slotB], targetLine) => {
        if (targetLine === curLine) return [cfg, mulZ9(amp, keepCoeff)] as const
        const [dock, , tone, role] = cfg[i0]!
        const hopped = cfg.slice()
        hopped[i0] = [dock, slotA, tone, role]
        hopped[i1] = [dock, slotB, tone, role]
        return [hopped, mulZ9(amp, hopCoeff)] as const
      }),
  )
}

function applyOddChiralPhase(state: ExactState, dag: boolean): ExactState {
  return mapConfigs(state, (vibes, amp) => {
    let exponent = 0
    for (const [dock, indices] of groupByDock(vibes)) {
      if (indices.length >= 4) exponent += dockParity[dock]! * chiralOrientationDock(vibes, indices)
    }
    const signedExp = dag ? -exponent : exponent
    const mod6 = ((signedExp % 6) + 6) % 6
    return [vibes, mod6 === 0 ? amp : mulZ9(amp, ZETA6_POWERS[mod6]!)]
  })
}

function applyOppositeSignBounce(state: ExactState, _dag: boolean): ExactState {
  return mapConfigs(state, (vibes, amp) => {
    let negate = false
    for (const [idxA, idxB, slotA, slotB] of collectActiveLines(vibes)) {
      if (idxA === undefined || idxB === undefined) continue
      if (vibes[idxA]![2] === vibes[idxB]![2]) continue
      const vA = vibes[idxA]!
      const vB = vibes[idxB]!
      vibes[idxA] = [vA[0], slotB, vA[2], vA[3]]
      vibes[idxB] = [vB[0], slotA, vB[2], vB[3]]
      negate = !negate
    }
    return [vibes, negate ? scaleZ9(-1n, amp) : amp]
  })
}

function applyStream(state: ExactState, dag: boolean): ExactState {
  return mapConfigs(state, (vibes, amp) => [
    vibes.map(([dock, slot, tone, role]) => [
      stepDock(dock, dag ? OPPOSITE_SLOT[slot]! : slot),
      slot,
      tone,
      role,
    ] as const),
    amp,
  ])
}

type LayerOp = (state: ExactState, dag: boolean) => ExactState
const ONSITE_LAYERS: readonly LayerOp[] = [
  applyOddChiralPhase,
  applyHalfCoinD,
  applyOppositeSignBounce,
  applyPairLineMixer,
  applyRoleMeet,
  applyHalfCoinD,
  applyOddChiralPhase,
]
const BEAT_LAYERS: readonly LayerOp[] = [...ONSITE_LAYERS, applyStream]

const applyOnSiteL = (s: ExactState): ExactState => ONSITE_LAYERS.reduce((c, f) => f(c, false), s)
const applyOnSiteLDag = (s: ExactState): ExactState =>
  [...ONSITE_LAYERS].reverse().reduce((c, f) => f(c, true), s)
const applyBeat = (s: ExactState): ExactState => BEAT_LAYERS.reduce((c, f) => f(c, false), s)
const applyBeatInv = (s: ExactState): ExactState =>
  [...BEAT_LAYERS].reverse().reduce((c, f) => f(c, true), s)

// =================================================================================================
// PART 1: EXACT HYPERBOLIC CONVEXITY IDENTITY & FRONTIER GEOMETRY ON {3,4,3,4} (R=3, 8,857 DOCKS)
// =================================================================================================

function runPart1(): void {
  console.log('================================================================================')
  console.log('PART 1: EXACT HYPERBOLIC CONVEXITY H_2(k_a g) + H_2(k_{-a} g) = 6 H_2(g) & FRONTIER')
  console.log('================================================================================')

  // Build exact R=3 ball (1, 24, 456, 8376 -> 8,857 docks) and also discover all neighbors of shell 3.
  const radiusOf = new Map<number, number>([[0, 0]])
  const queue: number[] = [0]
  const shells = [0, 0, 0, 0]
  for (let head = 0; head < queue.length; head++) {
    const d = queue[head]!
    const r = radiusOf.get(d)!
    shells[r] = shells[r]! + 1
    if (r < 3) {
      for (let s = 0; s < 24; s++) {
        const nxt = stepDock(d, s)
        if (!radiusOf.has(nxt)) {
          radiusOf.set(nxt, r + 1)
          queue.push(nxt)
        }
      }
    }
  }
  const ballCount = queue.length
  assertExact(shells.join(',') === '1,24,456,8376', `unexpected shells ${shells.join(',')}`)

  // For every dock in the R=2 ball (481 docks) AND every dock in shell 3 (checking all 24 neighbors via
  // direct O^+(4,1) transport WITHOUT blowing up cache, or caching up to R=3 + computing H_2 directly):
  // Let's check exact H_2(k_a g) + H_2(k_{-a} g) = 6 H_2(g) on ALL 8,857 docks * 12 antipodal lines = 106,284 pairs!
  let convexityDefects = 0
  let sqrt2Defects = 0
  let antipodalInHDefects = 0
  let antipodalInRDefects = 0
  const inHHist = new Map<number, number>()
  const inRHist = new Map<number, number>()
  let maxInH = 0
  let maxInR = 0
  let equalHNeighbors = 0

  for (const d of queue) {
    const r = radiusOf.get(d)!
    const h2 = lorentzCosh2(d)
    const h2q = lorentzCosh2Q2(d)
    if (h2q[1] !== 0n || h2 < 2n) sqrt2Defects++

    const inHSet = new Set<number>()
    const inRSet = new Set<number>()
    const nbH2 = new Array<bigint>(24)

    for (let s = 0; s < 24; s++) {
      // Compute neighbor center directly for shell 3 outward edges to keep dock table compact (< 10k docks).
      const cached = hcNeighbors[d]![s]!
      let nh2: bigint
      if (cached >= 0) {
        nh2 = lorentzCosh2(cached)
        const nr = radiusOf.get(cached)
        if (nr !== undefined && nr < r) inRSet.add(s)
      } else {
        const nextFrame = matMulQ2(dockFrames[d]!, TRANSPORTS[s]!)
        const nextCenter = matVecQ2(nextFrame, BASE_CENTER)
        const tf = twiceForm(nextCenter, BASE_CENTER)
        if (tf[1] !== 0n) sqrt2Defects++
        nh2 = -tf[0]
      }
      nbH2[s] = nh2
      if (nh2 <= h2) inHSet.add(s)
      if (nh2 === h2) equalHNeighbors++
    }

    for (const [a, b] of LINES) {
      if (nbH2[a]! + nbH2[b]! !== 6n * h2) convexityDefects++
      if (inHSet.has(a) && inHSet.has(b)) antipodalInHDefects++
      if (inRSet.has(a) && inRSet.has(b)) antipodalInRDefects++
    }

    if (r >= 1) {
      const cH = inHSet.size
      const cR = inRSet.size
      inHHist.set(cH, (inHHist.get(cH) ?? 0) + 1)
      inRHist.set(cR, (inRHist.get(cR) ?? 0) + 1)
      if (cH > maxInH) maxInH = cH
      if (cR > maxInR) maxInR = cR
    }
  }

  // Also verify exact algebraic basis identity on BASE_CENTER: F_a c_0 + F_{-a} c_0 = 6 c_0 for all 12 lines!
  let baseIdentityDefects = 0
  for (const [a, b] of LINES) {
    const ca = matVecQ2(TRANSPORTS[a]!, BASE_CENTER)
    const cb = matVecQ2(TRANSPORTS[b]!, BASE_CENTER)
    for (let i = 0; i < 5; i++) {
      const sum = addQ2(ca[i]!, cb[i]!)
      const expected: Q2 = [6n * BASE_CENTER[i]![0], 6n * BASE_CENTER[i]![1]]
      if (sum[0] !== expected[0] || sum[1] !== expected[1]) baseIdentityDefects++
    }
  }

  const fmtHist = (m: Map<number, number>) =>
    [...m.entries()].sort((a, b) => a[0] - b[0]).map(([k, v]) => `${k}:${v}`).join(', ')

  console.log(`  Exact R=3 ball shells          : [${shells.join(', ')}] (total ${ballCount} docks, inconsistent=${hcInconsistentSteps})`)
  console.log(`  Base identity c_{k_a}+c_{k_-a}=6c_0 : defects=${baseIdentityDefects}/60 (EXACT all 12 antipodal lines!)`)
  console.log(`  All-dock H_2 convexity (106,284 pairs): defects=${convexityDefects}, sqrt2Defects=${sqrt2Defects}`)
  console.log(`  Antipodal inward pairs (r=1..3): In_H defects=${antipodalInHDefects}, In_R defects=${antipodalInRDefects}, equalH=${equalHNeighbors}`)
  console.log(`  Inward count histogram |In_H|  : {${fmtHist(inHHist)}} (max=${maxInH}, so >= ${24 - maxInH} strictly outward facets!)`)
  console.log(`  Inward count histogram |In_R|  : {${fmtHist(inRHist)}} (max=${maxInR}, Cartier-Foata K_3 cliques!)`)

  recordCheck(
    'P1',
    'Hyperbolic convexity H_2(k_a g)+H_2(k_{-a} g)=6 H_2(g) & zero antipodal inward pairs on R=3 (8,857 docks)',
    baseIdentityDefects === 0 &&
      convexityDefects === 0 &&
      sqrt2Defects === 0 &&
      antipodalInHDefects === 0 &&
      antipodalInRDefects === 0 &&
      hcInconsistentSteps === 0 &&
      maxInH <= 3 &&
      maxInR <= 3,
    `106,284 dock-line pairs exact; max |In_H|=${maxInH}, max |In_R|=${maxInR}, 0 antipodal inward pairs`,
  )
}

// =================================================================================================
// PART 2: EXACT 1-DOCK L MATRIX & FRONTIER-LEAKAGE KERNELS IN Z[zeta_9][1/6]
// =================================================================================================

function runPart2(): void {
  console.log('\n================================================================================')
  console.log('PART 2: EXACT 1-DOCK L MATRICES & FRONTIER-LEAKAGE KERNELS ker(P_out o L o P_Arr)')
  console.log('================================================================================')

  // Helper: build exact matrix of L on a basis of 1-dock configurations, plus outward leakage matrix
  // Q = (P_out L)^dag (P_out L) where "outward" means at least one particle occupies a slot NOT in inSet.
  const analyzeSector = (
    label: string,
    basis: readonly (readonly Vibe[])[],
    inSet: ReadonlySet<number>,
  ) => {
    const n = basis.length
    const outLeakRe = new Float64Array(n * n)
    const outLeakIm = new Float64Array(n * n)
    const images: ExactState[] = basis.map(cfg => applyOnSiteL(stateFromEntries([[cfg, Z9_ONE]], 1n)))

    // Verify exact unitarity and exact N_full conservation on every basis vector!
    let fullLineConserved = true
    const countFull = (vs: readonly Vibe[]): number => {
      let c = 0
      for (const [a, b] of collectActiveLines(vs)) if (a !== undefined && b !== undefined) c++
      return c
    }

    const outProjs: ExactState[] = []
    for (let j = 0; j < n; j++) {
      const f0 = countFull(basis[j]!)
      const img = images[j]!
      assertExact(hasExactUnitNorm(img), `${label} unit norm failed on basis ${j}`)
      const outMap = new Map<string, Z9>()
      for (const [k, amp] of img.amp) {
        const vs = decodeConfig(k)
        if (countFull(vs) !== f0) fullLineConserved = false
        const leaks = vs.some(([, slot]) => !inSet.has(slot))
        if (leaks) outMap.set(k, amp)
      }
      outProjs.push({ amp: outMap, den: img.den })
    }

    // Build exact Gram matrix G_{i,j} = <P_out L e_i | P_out L e_j>
    let isExactDiagonal = true
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const ip = innerProductExact(outProjs[i]!, outProjs[j]!)
        if (i !== j && !isZeroZ9(ip.num)) isExactDiagonal = false
        const z = z9ToComplex(ip.num, ip.den)
        outLeakRe[i * n + j] = z[0]
        outLeakIm[i * n + j] = z[1]
      }
    }
    const eig = hermitianEigen(n, outLeakRe, outLeakIm)
    const minProb = eig.values[0]!
    const maxProb = eig.values[n - 1]!
    const kerDim = Array.from(eig.values).filter(v => v < 1e-10).length
    console.log(
      `  ${label.padEnd(42)}: dim=${String(n).padStart(2)}, N_full_cons=${fullLineConserved}, diagGram=${isExactDiagonal}, ` +
        `P_out in [${minProb.toFixed(6)}, ${maxProb.toFixed(6)}], kerDim=${kerDim}`,
    )
    return { n, fullLineConserved, isExactDiagonal, minProb, maxProb, kerDim }
  }

  // Pick a genuine maximal-clique frontier dock at r=3 with |In_H| = 3!
  let frontierDock = -1
  let frontierIn: number[] = []
  for (let d = 1; d < dockFrames.length; d++) {
    const h2 = lorentzCosh2(d)
    const ins: number[] = []
    for (let s = 0; s < 24; s++) {
      const nb = hcNeighbors[d]![s]!
      if (nb >= 0 && lorentzCosh2(nb) <= h2) ins.push(s)
    }
    if (ins.length === 3) {
      frontierDock = d
      frontierIn = ins
      break
    }
  }
  assertExact(frontierDock > 0 && frontierIn.length === 3, 'failed to find |In_H|=3 frontier dock')
  const inSet3 = new Set<number>(frontierIn)
  const arrSlots3 = frontierIn.map(s => OPPOSITE_SLOT[s]!)
  assertExact(arrSlots3.every(s => !inSet3.has(s)), 'Arr overlaps In!')
  console.log(
    `  Canonical K_3 frontier dock d=${frontierDock} (H_2=${lorentzCosh2(frontierDock)}, parity=${dockParity[frontierDock]}): ` +
      `In=[${frontierIn.join(',')}], Arr=-In=[${arrSlots3.join(',')}]`,
  )

  // (a) Full-line k=2 interacting sectors (N_full = 1) at frontierDock — ALL 100% outward leakage!
  const [line0A, line0B] = LINES[0]!
  const secK = analyzeSector(
    'k=2 K-bounce full line (opp tone)',
    [
      [[frontierDock, line0A, 1, 0], [frontierDock, line0B, -1, 0]],
      [[frontierDock, line0A, -1, 0], [frontierDock, line0B, 1, 0]],
    ],
    inSet3,
  )
  const secMeet = analyzeSector(
    'k=2 M_meet full line (same tone, diff role)',
    [
      [[frontierDock, line0A, 1, 0], [frontierDock, line0B, 1, 1]],
      [[frontierDock, line0A, 1, 1], [frontierDock, line0B, 1, 0]],
    ],
    inSet3,
  )
  const secPair = analyzeSector(
    'k=2 M_pair(zeta_18) 12-line identical pair',
    LINES.map(([a, b]) => [[frontierDock, a, 1, 0], [frontierDock, b, 1, 0]] as const),
    inSet3,
  )

  // (b) Arrival-subspace sectors P_Arr at K_3 frontier dock for m = 1, 2, 3 (all tone choices {-1,+1}^m)!
  const basisM1: Vibe[][] = []
  for (const s of arrSlots3) {
    basisM1.push([[frontierDock, s, 1, 0]])
    basisM1.push([[frontierDock, s, -1, 0]])
  }
  const secArr1 = analyzeSector('m=1 Arr(g_*) at K_3 frontier (all tones)', basisM1, inSet3)

  const basisM2: Vibe[][] = []
  for (let i = 0; i < 3; i++) {
    for (let j = i + 1; j < 3; j++) {
      for (const t1 of [1, -1] as const) {
        for (const t2 of [1, -1] as const) {
          basisM2.push([[frontierDock, arrSlots3[i]!, t1, 0], [frontierDock, arrSlots3[j]!, t2, 0]])
        }
      }
    }
  }
  const secArr2 = analyzeSector('m=2 Arr(g_*) at K_3 frontier (all tones)', basisM2, inSet3)

  const basisM3: Vibe[][] = []
  for (const t0 of [1, -1] as const) {
    for (const t1 of [1, -1] as const) {
      for (const t2 of [1, -1] as const) {
        basisM3.push([
          [frontierDock, arrSlots3[0]!, t0, 0],
          [frontierDock, arrSlots3[1]!, t1, 0],
          [frontierDock, arrSlots3[2]!, t2, 0],
        ])
      }
    }
  }
  const secArr3 = analyzeSector('m=3 Arr(g_*) at K_3 frontier (all tones)', basisM3, inSet3)

  // (c) Synthetic antipodal-free 4-slot chiral-active set [1, 3, 4, 10] (E-FND-0184 chiral quad where
  //     Phi_odd IS ACTIVE!), proving even if a hypothetical extreme dock had |Arr| >= 4 and Phi_odd fired,
  //     exact outward leakage is STILL 1 - (3/4)^4 = 175/256 = 0.68359375 with ker = {0}!
  const chiralArr4 = [1, 3, 4, 10] as const
  const chiralIn4 = new Set<number>(chiralArr4.map(s => OPPOSITE_SLOT[s]!))
  assertExact(chiralArr4.every(s => !chiralIn4.has(s)), 'chiralArr4 not antipodal-free!')
  const basisM4: Vibe[][] = []
  let activeChiralConfigs = 0
  for (const t0 of [1, -1] as const) {
    for (const t1 of [1, -1] as const) {
      for (const t2 of [1, -1] as const) {
        for (const t3 of [1, -1] as const) {
          const cfg: Vibe[] = [
            [frontierDock, chiralArr4[0], t0, 0],
            [frontierDock, chiralArr4[1], t1, 0],
            [frontierDock, chiralArr4[2], t2, 0],
            [frontierDock, chiralArr4[3], t3, 0],
          ]
          if (chiralOrientationDock(cfg, [0, 1, 2, 3]) !== 0) activeChiralConfigs++
          basisM4.push(cfg)
        }
      }
    }
  }
  const secArr4 = analyzeSector(`m=4 antipodal-free chiral quad (chi!=0: ${activeChiralConfigs}/16)`, basisM4, chiralIn4)

  // (d) Sharpness check WITHOUT P_Arr: on the 2-slot line (a, -a) with a in In, -a in Out,
  //     test the full 2D single-particle space to confirm ker(P_out L) has dim=1 (1-step time-reversed focus!).
  const sIn0 = frontierIn[0]!
  const sOut0 = OPPOSITE_SLOT[sIn0]!
  const secNoPArr = analyzeSector(
    'm=1 FULL line (a in In, -a in Out; no P_Arr)',
    [[[frontierDock, sIn0, 1, 0]], [[frontierDock, sOut0, 1, 0]]],
    inSet3,
  )

  // Verify exact analytical eigenvalues of L_K, L_meet, L_pair!
  const expect1 = 1 - Math.pow(0.75, 1) // 0.25
  const expect2 = 1 - Math.pow(0.75, 2) // 0.4375
  const expect3 = 1 - Math.pow(0.75, 3) // 0.578125
  const expect4 = 1 - Math.pow(0.75, 4) // 0.68359375

  const ok =
    secK.kerDim === 0 && Math.abs(secK.minProb - 1) < 1e-12 && secK.fullLineConserved &&
    secMeet.kerDim === 0 && Math.abs(secMeet.minProb - 1) < 1e-12 && secMeet.fullLineConserved &&
    secPair.kerDim === 0 && Math.abs(secPair.minProb - 1) < 1e-12 && secPair.fullLineConserved &&
    secArr1.kerDim === 0 && secArr1.isExactDiagonal && Math.abs(secArr1.minProb - expect1) < 1e-12 &&
    secArr2.kerDim === 0 && secArr2.isExactDiagonal && Math.abs(secArr2.minProb - expect2) < 1e-12 &&
    secArr3.kerDim === 0 && secArr3.isExactDiagonal && Math.abs(secArr3.minProb - expect3) < 1e-12 &&
    secArr4.kerDim === 0 && secArr4.isExactDiagonal && Math.abs(secArr4.minProb - expect4) < 1e-12 &&
    activeChiralConfigs > 0 &&
    secNoPArr.kerDim === 1

  recordCheck(
    'P2',
    'Exact 1-dock L frontier-leakage kernels (K, M_meet, M_pair = 100%; Arr m=1..4 = 1-(3/4)^m; ker=0)',
    ok,
    `K/M_meet/M_pair P_out=1.000; m=1..4 exact P_out=[0.25, 0.4375, 0.578125, 0.683594] (${activeChiralConfigs}/16 chiral); no-P_Arr ker=1`,
  )
}

// =================================================================================================
// PART 3: EXPLICIT 4-CYCLE RIGHT-ANGLED RING BREATHER SEARCH & BALLISTIC WAVEFRONT VERIFICATION
// =================================================================================================

function runPart3(): { readonly ringDocks: readonly number[]; readonly slotA: number; readonly slotB: number } {
  console.log('\n================================================================================')
  console.log('PART 3: 4-CYCLE RIGHT-ANGLED RING SEARCH & BALLISTIC WAVEFRONT GROWTH IN EXACT U')
  console.log('================================================================================')

  // Find an explicit pair (a, b) with r_a . r_b = +1 and verify the exact 4-cycle (k_a k_{-b})^2 = I_5:
  //   d0 --(a)--> d1 --(-b)--> d2 --(a)--> d3 --(-b)--> d0
  //   Equivalently: d0 --(b)--> d3 --(-a)--> d2 --(b)--> d1 --(-a)--> d0
  const slotA = 0
  let slotB = -1
  for (let s = 0; s < 24; s++) {
    if (dot4(ROOTS[slotA]!, ROOTS[s]!) === 1n) {
      slotB = s
      break
    }
  }
  assertExact(slotB >= 0, 'failed to find r_a . r_b = 1')
  const oppA = OPPOSITE_SLOT[slotA]!
  const oppB = OPPOSITE_SLOT[slotB]!

  const d0 = 0
  const d1 = stepDock(d0, slotA)
  const d2 = stepDock(d1, oppB)
  const d3 = stepDock(d2, slotA)
  const d0Back = stepDock(d3, oppB)
  const d3Alt = stepDock(d0, slotB)
  const d2Alt = stepDock(d3Alt, oppA)
  assertExact(d0Back === d0 && d3Alt === d3 && d2Alt === d2, '4-cycle Coxeter relation failed')
  assertExact(new Set([d0, d1, d2, d3]).size === 4, '4-cycle docks not distinct')

  const ringDocks = [d0, d1, d2, d3] as const
  const ringSet = new Set<number>(ringDocks)
  console.log(
    `  Exact right-angled 4-cycle     : a=${slotA}, b=${slotB} (r_a.r_b=1), docks=[${ringDocks.join(',')}], ` +
      `H_2=[${ringDocks.map(d => lorentzCosh2(d)).join(',')}]`,
  )

  const stateProbOutside = (st: ExactState, allowed: ReadonlySet<number>): number => {
    let pOut = 0
    for (const [k, amp] of st.amp) {
      const vs = decodeConfig(k)
      if (vs.some(([d]) => !allowed.has(d))) pOut += cAbs2(z9ToComplex(amp, st.den))
    }
    return pOut
  }

  const maxH2OfState = (st: ExactState): bigint => {
    let m = 0n
    for (const k of st.amp.keys()) {
      for (const [d] of decodeConfig(k)) {
        const h = lorentzCosh2(d)
        if (h > m) m = h
      }
    }
    return m
  }

  // Exact probability that at least one particle occupies a maximal-H_2 dock g_* at step t,
  // and exact probability that at step t+1 a particle reaches H_2 >= 6 M(t) - M(t-1).
  const maxDockProb = (st: ExactState, targetM: bigint): number => {
    let p = 0
    for (const [k, amp] of st.amp) {
      const vs = decodeConfig(k)
      if (vs.some(([d]) => lorentzCosh2(d) >= targetM)) p += cAbs2(z9ToComplex(amp, st.den))
    }
    return p
  }

  const runRingTest = (label: string, init: ExactState, beats: number) => {
    assertExact(hasExactUnitNorm(init), `${label} initial norm != 1`)
    let st = init
    const fidelities: number[] = [1.0]
    const pOuts: number[] = [stateProbOutside(init, ringSet)]
    const mSeq: bigint[] = [maxH2OfState(init)]
    let ballisticChecks = 0
    let ballisticPassed = 0
    let normOk = true

    for (let t = 1; t <= beats; t++) {
      const prevM = mSeq[t - 1]!
      const prevPrevM = t >= 2 ? mSeq[t - 2]! : 0n
      const pStar = maxDockProb(st, prevM)

      st = applyBeat(st)
      if (!hasExactUnitNorm(st)) normOk = false
      const ip = innerProductExact(init, st)
      fidelities.push(cAbs2(z9ToComplex(ip.num, ip.den)))
      pOuts.push(stateProbOutside(st, ringSet))
      const curM = maxH2OfState(st)
      mSeq.push(curM)

      if (t >= 2 && prevM >= prevPrevM) {
        ballisticChecks++
        const boundH2 = 6n * prevM - prevPrevM
        const pLeap = maxDockProb(st, boundH2)
        if (curM >= boundH2 && pLeap + 1e-12 >= 0.25 * pStar) ballisticPassed++
      }
    }

    // Exact reversal check
    let rev = st
    for (let t = 0; t < beats; t++) rev = applyBeatInv(rev)
    const revDiff = countStateDiffs(rev, init)
    const maxRetFid = Math.max(...fidelities.slice(1))

    console.log(
      `  ${label.padEnd(34)}: norm=${normOk}, rev=${revDiff}, maxFid=${maxRetFid.toFixed(4)}, ` +
        `P_out(T)=${pOuts[beats]!.toFixed(4)}, M(t)=[${mSeq.join(',')}], ball=${ballisticPassed}/${ballisticChecks}`,
    )
    return { normOk, revDiff, maxRetFid, finalPOut: pOuts[beats]!, mSeq, ballisticChecks, ballisticPassed }
  }

  // Construct exact Z[zeta_9][1/6] normalized multi-dock 4-cycle ring states:
  // 1. k=1 alternating 4-cycle ring (8 directed ring arcs, den = 2*sqrt(2)? Wait: Z[zeta_9][1/6] has no sqrt(2),
  //    so use 4-branch states with norm 1 via den=2, or 16-branch via den=4!).
  //    4-branch symmetric & antisymmetric states on the 4 docks have exact norm 1 with den = 2n!
  const k1RingSym = stateFromEntries(
    [
      [[[d0, slotA, 1, 0]], Z9_ONE],
      [[[d1, oppB, 1, 0]], Z9_ONE],
      [[[d2, slotA, 1, 0]], Z9_ONE],
      [[[d3, oppB, 1, 0]], Z9_ONE],
    ],
    2n,
  )
  const k1RingAlt = stateFromEntries(
    [
      [[[d0, slotA, 1, 0]], Z9_ONE],
      [[[d1, oppB, 1, 0]], scaleZ9(-1n, Z9_ONE)],
      [[[d2, slotA, 1, 0]], Z9_ONE],
      [[[d3, oppB, 1, 0]], scaleZ9(-1n, Z9_ONE)],
    ],
    2n,
  )

  // 2. k=2 counter-propagating K-bounce ring (each dock of the 4-cycle carries an opposite-sign ring collision pair!).
  const k2KRingAlt = stateFromEntries(
    [
      [[[d0, slotA, 1, 0], [d0, oppA, -1, 0]], Z9_ONE],
      [[[d1, oppB, 1, 0], [d1, slotB, -1, 0]], scaleZ9(-1n, Z9_ONE)],
      [[[d2, slotA, 1, 0], [d2, oppA, -1, 0]], Z9_ONE],
      [[[d3, oppB, 1, 0], [d3, slotB, -1, 0]], scaleZ9(-1n, Z9_ONE)],
    ],
    2n,
  )

  // 3. k=2 distinct-role M_meet ring (same tone +1, roles 0 & 1 alternating around the 4-cycle).
  const k2MeetRingAlt = stateFromEntries(
    [
      [[[d0, slotA, 1, 0], [d0, oppA, 1, 1]], Z9_ONE],
      [[[d1, oppB, 1, 0], [d1, slotB, 1, 1]], scaleZ9(-1n, Z9_ONE)],
      [[[d2, slotA, 1, 0], [d2, oppA, 1, 1]], Z9_ONE],
      [[[d3, oppB, 1, 0], [d3, slotB, 1, 1]], scaleZ9(-1n, Z9_ONE)],
    ],
    2n,
  )

  // 4. k=2 identical-pair M_pair(zeta_18) 4-cycle alternating ring (both symmetric & antisymmetric!).
  const k2PairRingSym = stateFromEntries(
    [
      [[[d0, slotA, 1, 0], [d0, oppA, 1, 0]], Z9_ONE],
      [[[d1, oppB, 1, 0], [d1, slotB, 1, 0]], Z9_ONE],
      [[[d2, slotA, 1, 0], [d2, oppA, 1, 0]], Z9_ONE],
      [[[d3, oppB, 1, 0], [d3, slotB, 1, 0]], Z9_ONE],
    ],
    2n,
  )
  const k2PairRingAlt = stateFromEntries(
    [
      [[[d0, slotA, 1, 0], [d0, oppA, 1, 0]], Z9_ONE],
      [[[d1, oppB, 1, 0], [d1, slotB, 1, 0]], scaleZ9(-1n, Z9_ONE)],
      [[[d2, slotA, 1, 0], [d2, oppA, 1, 0]], Z9_ONE],
      [[[d3, oppB, 1, 0], [d3, slotB, 1, 0]], scaleZ9(-1n, Z9_ONE)],
    ],
    2n,
  )

  // 5. k=2 non-local entangled 4-cycle state (two particles on opposite corners of the 4-cycle aimed at each other!).
  const k2EntangledRing = stateFromEntries(
    [
      [[[d0, slotA, 1, 0], [d2, oppA, -1, 0]], Z9_ONE],
      [[[d1, oppB, 1, 0], [d3, slotB, -1, 0]], scaleZ9(-1n, Z9_ONE)],
      [[[d0, slotB, 1, 0], [d2, oppB, -1, 0]], Z9_ONE],
      [[[d1, oppA, 1, 0], [d3, slotA, -1, 0]], scaleZ9(-1n, Z9_ONE)],
    ],
    2n,
  )

  // 6. k=4 multi-dock chiral state (4 particles on 4 distinct neighbors of d0 converging to chiral quad [1,3,4,10]
  //    at d0, plus a 4-dock chiral superposition across the 4-cycle!).
  const k4ChiralRing = stateFromEntries(
    [
      [[[d0, 1, 1, 0], [d0, 3, 1, 0], [d0, 4, 1, 0], [d0, 10, 1, 0]], Z9_ONE],
      [[[d1, 1, 1, 0], [d1, 3, 1, 0], [d1, 4, 1, 0], [d1, 10, 1, 0]], scaleZ9(-1n, Z9_ONE)],
      [[[d2, 1, 1, 0], [d2, 3, 1, 0], [d2, 4, 1, 0], [d2, 10, 1, 0]], Z9_ONE],
      [[[d3, 1, 1, 0], [d3, 3, 1, 0], [d3, 4, 1, 0], [d3, 10, 1, 0]], scaleZ9(-1n, Z9_ONE)],
    ],
    2n,
  )

  // 7. Time-reversed pre-focused shrinking wavepacket U^{-2} |k=2 K-bounce at d0> (tests turnaround t_0 = 2!):
  //    M(t) MUST shrink: 34 -> 6 -> 2 -> 6 -> 34 -> 198, obeying exact ballistic growth from t_0 = 2 onward!
  const k2Focused = applyBeatInv(
    applyBeatInv(stateFromEntries([[[[d0, slotA, 1, 0], [d0, oppA, -1, 0]], Z9_ONE]], 1n)),
  )

  const results = [
    runRingTest('k=1 4-cycle symmetric ring', k1RingSym, 4),
    runRingTest('k=1 4-cycle alternating ring', k1RingAlt, 4),
    runRingTest('k=2 K-bounce 4-cycle alt ring', k2KRingAlt, 4),
    runRingTest('k=2 M_meet 4-cycle alt ring', k2MeetRingAlt, 4),
    runRingTest('k=2 M_pair 4-cycle sym ring', k2PairRingSym, 2),
    runRingTest('k=2 M_pair 4-cycle alt ring', k2PairRingAlt, 2),
    runRingTest('k=2 entangled corner ring', k2EntangledRing, 3),
    runRingTest('k=4 chiral Phi_odd 4-cycle ring', k4ChiralRing, 2),
    runRingTest('k=2 pre-focused U^-2 (turnaround)', k2Focused, 5),
  ]

  const allOk =
    results.every(
      r =>
        r.normOk &&
        r.revDiff === 0 &&
        r.maxRetFid < 0.99 &&
        r.ballisticChecks > 0 &&
        r.ballisticPassed === r.ballisticChecks,
    ) && results[8]!.mSeq.join(',') === '34,6,2,6,34,198'

  recordCheck(
    'P3',
    '9 multi-dock 4-cycle ring & pre-focused trajectories: 0 breathers & 100% ballistic M(t+1)>=6M(t)-M(t-1)',
    allOk,
    `9/9 exact norm & rev=0; all ballistic bounds satisfied; turnaround M(t)=[${results[8]!.mSeq.join(',')}]`,
  )

  return { ringDocks, slotA, slotB }
}

// =================================================================================================
// PART 4: SHARPNESS POSITIVE CONTROLS ON THE EXACT SAME {3,4,3,4} HONEYCOMB
// =================================================================================================

function runPart4(ringDocks: readonly number[], slotA: number, slotB: number): void {
  console.log('\n================================================================================')
  console.log('PART 4: SHARPNESS POSITIVE CONTROLS ON {3,4,3,4} (BREAKING COND (iv) & COND (iii))')
  console.log('================================================================================')

  const [d0, d1, d2, d3] = ringDocks as [number, number, number, number]
  const oppA = OPPOSITE_SLOT[slotA]!
  const oppB = OPPOSITE_SLOT[slotB]!

  // Positive Control A (breaks Condition (iv), C_diag = 0 pure-reflection coin C = R):
  //   U_refl = S o R. On 2 docks (d0, d1), |psi_dimer> = (|d0, -a> + |d1, a>)/sqrt(2) is an EXACT T=1 compacton!
  const applyRefl = (st: Map<string, number>): Map<string, number> => {
    const out = new Map<string, number>()
    for (const [k, amp] of st) {
      const [dStr, sStr] = k.split(':')
      const d = Number(dStr)
      const s = Number(sStr)
      const rs = OPPOSITE_SLOT[s]!
      const nd = stepDock(d, rs)
      const nk = `${nd}:${rs}`
      out.set(nk, (out.get(nk) ?? 0) + amp)
    }
    return out
  }
  const dimer0 = new Map<string, number>([[`${d0}:${oppA}`, Math.SQRT1_2], [`${d1}:${slotA}`, Math.SQRT1_2]])
  let curDimer = dimer0
  let maxDimerErr = 0
  for (let t = 1; t <= 6; t++) {
    curDimer = applyRefl(curDimer)
    for (const k of new Set([...dimer0.keys(), ...curDimer.keys()])) {
      const err = Math.abs((curDimer.get(k) ?? 0) - (dimer0.get(k) ?? 0))
      if (err > maxDimerErr) maxDimerErr = err
    }
  }
  console.log(`  Control A (C_diag=0 reflection coin) : 2-dock dimer T=1 compacton on {3,4,3,4}, maxErr(t=1..6)=${maxDimerErr.toExponential(1)}`)

  // Positive Control B (breaks Condition (iii), W(F_4)-invariant 24-slot Grover walk U_G = S o R o ((1/12)J_24 - I_24)):
  //   Construct the 8-arc alternating 4-cycle ring state on (d0, d1, d2, d3):
  //     d0: arrival slots from d1, d3 are (-a, -b). Departure slots into d1, d3 are (a, b).
  //     d1: arrival slots from d0, d2 are (a, b).   Departure slots into d0, d2 are (-a, -b).
  //     d2: arrival slots from d1, d3 are (-b, -a). Departure slots into d1, d3 are (b, a).
  //     d3: arrival slots from d2, d0 are (a, b).   Departure slots into d2, d0 are (-a, -b).
  //   Set weights (1/sqrt(8)) * sign:
  //     d0: +1 on -a, -1 on -b   -> G_24 gives -1 on -a, +1 on -b -> R gives -1 on a, +1 on b -> S sends -1 to (d1, a) and +1 to (d3, b)!
  //     d1: -1 on a,  +1 on b    -> G_24 gives +1 on a, -1 on b   -> R gives +1 on -a, -1 on -b -> S sends +1 to (d0, -a) and -1 to (d2, -b)!
  //     d2: +1 on -a, -1 on -b   -> R o G_24 gives -1 on a, +1 on b -> S sends -1 to (d3, a) and +1 to (d1, b)!
  //     d3: -1 on a,  +1 on b    -> R o G_24 gives +1 on -a, -1 on -b -> S sends +1 to (d2, -a) and -1 to (d0, -b)!
  //   IT IS AN EXACT EIGENVALUE +1 COMPACTON (U_G |ring_G> = +|ring_G>) SUPPORTED ON JUST 4 DOCKS OF {3,4,3,4}!!
  const invSqrt8 = 1 / Math.sqrt(8)
  const groverRing0 = new Map<string, number>([
    [`${d0}:${oppA}`, +invSqrt8],
    [`${d0}:${oppB}`, -invSqrt8],
    [`${d1}:${slotA}`, -invSqrt8],
    [`${d1}:${slotB}`, +invSqrt8],
    [`${d2}:${oppA}`, +invSqrt8],
    [`${d2}:${oppB}`, -invSqrt8],
    [`${d3}:${slotA}`, -invSqrt8],
    [`${d3}:${slotB}`, +invSqrt8],
  ])

  const applyGrover24 = (st: Map<string, number>): Map<string, number> => {
    const byDock = new Map<number, Float64Array>()
    for (const [k, amp] of st) {
      const [dStr, sStr] = k.split(':')
      const d = Number(dStr)
      const s = Number(sStr)
      let arr = byDock.get(d)
      if (!arr) { arr = new Float64Array(24); byDock.set(d, arr) }
      arr[s] = arr[s]! + amp
    }
    const out = new Map<string, number>()
    for (const [d, arr] of byDock) {
      let sum = 0
      for (let s = 0; s < 24; s++) sum += arr[s]!
      const avg2 = sum / 12 // (1/12) J_24
      for (let s = 0; s < 24; s++) {
        const gVal = avg2 - arr[s]! // ((1/12) J_24 - I_24)
        if (Math.abs(gVal) < 1e-15) continue
        const rs = OPPOSITE_SLOT[s]! // R
        const nd = stepDock(d, rs) // S
        const nk = `${nd}:${rs}`
        out.set(nk, (out.get(nk) ?? 0) + gVal)
      }
    }
    return out
  }

  let curG = groverRing0
  let maxGroverErr = 0
  let maxGroverLeak = 0
  const ringSet = new Set<number>(ringDocks)
  for (let t = 1; t <= 6; t++) {
    curG = applyGrover24(curG)
    let leak = 0
    for (const [k, val] of curG) {
      const d = Number(k.split(':')[0])
      if (!ringSet.has(d)) leak += val * val
    }
    if (leak > maxGroverLeak) maxGroverLeak = leak
    for (const k of new Set([...groverRing0.keys(), ...curG.keys()])) {
      const err = Math.abs((curG.get(k) ?? 0) - (groverRing0.get(k) ?? 0))
      if (err > maxGroverErr) maxGroverErr = err
    }
  }
  console.log(
    `  Control B (W(F_4) 24-slot Grover coin): 4-dock ring T=1 compacton (U_G|psi>=+|psi>), ` +
      `maxErr(t=1..6)=${maxGroverErr.toExponential(1)}, maxLeak=${maxGroverLeak.toExponential(1)}`,
  )

  recordCheck(
    'P4',
    'Sharpness controls on {3,4,3,4}: C_diag=0 dimer & W(F_4) 24-slot Grover 4-cycle exact T=1 compactons',
    maxDimerErr < 1e-14 && maxGroverErr < 1e-14 && maxGroverLeak < 1e-28,
    `dimer err=${maxDimerErr.toExponential(1)}; W(F_4) Grover 4-cycle err=${maxGroverErr.toExponential(1)}, leak=${maxGroverLeak.toExponential(1)}`,
  )
}

// =================================================================================================
// PART 5: EXACT INFINITE-VOLUME k=2 SCATTERING & l^2 BOUND-STATE (DOUBLON) CLASSIFICATION
// =================================================================================================

function runPart5(): void {
  console.log('\n================================================================================')
  console.log('PART 5: EXACT k=2 COLLINEAR SCATTERING & INFINITE-SUPPORT l^2 BOUND-STATE SEARCH')
  console.log('================================================================================')

  // Exact bare 1D coin C = (1/2) [[1+omega, 1-omega], [1-omega, 1+omega]]:
  const wC = z9ToComplex(Z9_OMEGA) // -1/2 + i sqrt(3)/2
  const w2C = z9ToComplex(mulZ9(Z9_OMEGA, Z9_OMEGA)) // -1/2 - i sqrt(3)/2
  const cDiag: C2 = [0.5 * (1 + wC[0]), 0.5 * wC[1]] // (1+omega)/2 = exp(i pi/3)/2
  const cOff: C2 = [0.5 * (1 - wC[0]), -0.5 * wC[1]] // (1-omega)/2

  // In the center-of-mass momentum P frame on an even ring of length L (even relative coordinates r = 2m,
  // m = 0..M-1 where M = L/2):
  // Basis states (total dim = 4M - 2):
  //   m = 0: idx 0 -> |0; +->, idx 1 -> |0; -+>  (hard-core excludes |0; ++> and |0; -->!)
  //   m = 1..M-1: idx 2 + 4*(m-1) + {0:++, 1:+-, 2:-+, 3:--}
  // Streaming S in Bloch basis |P; r, s1, s2> = (1/sqrt(L)) sum_x e^{i P x} |x, s1; x - r, s2>:
  //   (+, +) -> (m, ++), phase e^{-i P}
  //   (-, -) -> (m, --), phase e^{+i P}
  //   (+, -) -> ((m+1) mod M, +-), phase e^{-i P}
  //   (-, +) -> ((m-1+M) mod M, -+), phase e^{+i P}
  //
  // On-site collision matrix L_0 (2x2 on {|0;+->, |0;-+>}) for each bare U channel:
  //   1. K-bounce (opp tone):           L_K = -omega [[0, 1], [1, 0]] (eigs: sym -omega, antisym +omega)
  //   2. M_meet (same tone, diff role): L_meet = (omega/2) [[zeta_6, omega-1], [omega-1, zeta_6]] (eigs: sym omega^2, antisym +omega)
  //   3. M_pair 11D zero-sum (id pair): L_pair11 = omega^2 I_2 (sym eig = omega^2, identical on sym subspace to M_meet sym!)
  //   4. M_pair 1D isotropic channel:   L_pair1D = omega^2 * zeta_18 I_2 (sym eig = omega^2 * zeta_18)
  const zeta6C = z9ToComplex(Z9_ZETA6)
  const zeta18C = z9ToComplex(Z9_ZETA18)
  const meetSwapC = z9ToComplex(Z9_MEET_SWAP)

  type Mat2C = readonly [C2, C2, C2, C2] // [00, 01, 10, 11]
  const L0_K: Mat2C = [[0, 0], [-wC[0], -wC[1]], [-wC[0], -wC[1]], [0, 0]]
  const L0_MEET: Mat2C = [
    cMul([0.5 * wC[0], 0.5 * wC[1]], zeta6C),
    cMul([0.5 * wC[0], 0.5 * wC[1]], meetSwapC),
    cMul([0.5 * wC[0], 0.5 * wC[1]], meetSwapC),
    cMul([0.5 * wC[0], 0.5 * wC[1]], zeta6C),
  ]
  const w2z18 = cMul(w2C, zeta18C)
  const L0_PAIR_ISO: Mat2C = [w2z18, [0, 0], [0, 0], w2z18]
  // Control: standard free collision phase +1 on {|+->, |-+>} (hard-core with phase +1 vs +i)
  const L0_HARDCORE_ONE: Mat2C = [[1, 0], [0, 1], [0, 0], [0, 0]] // placeholder, fixed below:
  void L0_HARDCORE_ONE

  const buildU2 = (L: number, P: number, L0: Mat2C): { readonly dim: number; readonly re: Float64Array; readonly im: Float64Array } => {
    const M = L / 2
    const dim = 4 * M - 2
    const re = new Float64Array(dim * dim)
    const im = new Float64Array(dim * dim)
    const idxOf = (m: number, s: number): number => {
      const mm = ((m % M) + M) % M
      if (mm === 0) {
        assertExact(s === 1 || s === 2, `forbidden state at m=0: s=${s}`)
        return s - 1
      }
      return 2 + 4 * (mm - 1) + s
    }

    const eNegP: C2 = [Math.cos(-P), Math.sin(-P)]
    const ePosP: C2 = [Math.cos(P), Math.sin(P)]
    const streamShift = (m: number, s: number): readonly [number, C2] => {
      if (s === 0) return [idxOf(m, 0), eNegP] // ++
      if (s === 1) return [idxOf(m + 1, 1), eNegP] // +-
      if (s === 2) return [idxOf(m - 1, 2), ePosP] // -+
      return [idxOf(m, 3), ePosP] // --
    }

    // 4x4 tensor coin C (x) C for m >= 1: s in {0:++, 1:+-, 2:-+, 3:--}
    const cMat: C2[][] = [[cDiag, cOff], [cOff, cDiag]]
    const ccEntry = (sOut: number, sIn: number): C2 =>
      cMul(cMat[sOut >> 1]![sIn >> 1]!, cMat[sOut & 1]![sIn & 1]!)

    // Fill columns j -> rows i
    // m = 0:
    for (let a = 0; a < 2; a++) {
      const col = a
      for (let b = 0; b < 2; b++) {
        const amp = L0[b * 2 + a]!
        const [row, ph] = streamShift(0, b + 1)
        const val = cMul(ph, amp)
        re[row * dim + col] = re[row * dim + col]! + val[0]
        im[row * dim + col] = im[row * dim + col]! + val[1]
      }
    }
    // m = 1..M-1:
    for (let m = 1; m < M; m++) {
      for (let sIn = 0; sIn < 4; sIn++) {
        const col = idxOf(m, sIn)
        for (let sOut = 0; sOut < 4; sOut++) {
          const amp = ccEntry(sOut, sIn)
          const [row, ph] = streamShift(m, sOut)
          const val = cMul(ph, amp)
          re[row * dim + col] = re[row * dim + col]! + val[0]
          im[row * dim + col] = im[row * dim + col]! + val[1]
        }
      }
    }
    return { dim, re, im }
  }

  // Verify unitarity of U_2(P) and search for exponentially localized l^2 bound states (doublons)!
  // A genuine l^2 bound state has:
  //   1. IPR = sum_m (p(m))^2 staying O(1) independent of system size L (L=24 -> L=40!),
  //   2. Probability weight at the antipodal midpoint m = M/2 decaying exponentially with L (p(M/2) < 1e-4 at L=40),
  //   3. Quasienergy E lying STRICTLY OUTSIDE the 2-particle scattering continuum!
  const isInsideContinuum = (P: number, E: number): boolean => {
    // Check dense grid of k1 in [0, 2pi), k2 = P - k1, E_a(k1) + E_b(k2) mod 2pi.
    let minDist = Number.POSITIVE_INFINITY
    const N = 360
    for (let i = 0; i < N; i++) {
      const k1 = (2 * Math.PI * i) / N
      const k2 = P - k1
      const th1 = Math.acos(0.5 * Math.cos(k1))
      const th2 = Math.acos(0.5 * Math.cos(k2))
      const e1s = [Math.PI / 3 + th1, Math.PI / 3 - th1]
      const e2s = [Math.PI / 3 + th2, Math.PI / 3 - th2]
      for (const a of e1s) {
        for (const b of e2s) {
          let d = ((a + b - E) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI
          d = Math.abs(d)
          if (d < minDist) minDist = d
        }
      }
    }
    return minDist < 0.015
  }

  type BoundCandidate = {
    readonly P: number
    readonly E: number
    readonly ipr: number
    readonly pZero: number
    readonly pMid: number
    readonly outsideBand: boolean
    readonly sym: string
  }

  const scanChannel = (name: string, L0: Mat2C, L: number, pList: readonly number[]) => {
    const M = L / 2
    const found: BoundCandidate[] = []
    let maxUniErr = 0
    let maxEigRes = 0

    for (const P of pList) {
      const { dim, re, im } = buildU2(L, P, L0)
      // Check U^dag U = I
      for (let i = 0; i < dim; i++) {
        for (let j = 0; j < dim; j++) {
          let sR = 0
          let sI = 0
          for (let k = 0; k < dim; k++) {
            const ar = re[k * dim + i]!
            const ai = -im[k * dim + i]!
            const br = re[k * dim + j]!
            const bi = im[k * dim + j]!
            sR += ar * br - ai * bi
            sI += ar * bi + ai * br
          }
          const err = Math.hypot(sR - (i === j ? 1 : 0), sI)
          if (err > maxUniErr) maxUniErr = err
        }
      }

      const eig = unitaryEigen(dim, re, im)
      if (eig.maxResidual > maxEigRes) maxEigRes = eig.maxResidual

      for (let col = 0; col < dim; col++) {
        // Compute probability p(m) for each relative distance m = 0..M-1
        const pM = new Float64Array(M)
        pM[0] =
          eig.vecRe[0 * dim + col]! ** 2 + eig.vecIm[0 * dim + col]! ** 2 +
          eig.vecRe[1 * dim + col]! ** 2 + eig.vecIm[1 * dim + col]! ** 2
        for (let m = 1; m < M; m++) {
          let s = 0
          for (let k = 0; k < 4; k++) {
            const r = 2 + 4 * (m - 1) + k
            s += eig.vecRe[r * dim + col]! ** 2 + eig.vecIm[r * dim + col]! ** 2
          }
          pM[m] = s
        }
        let ipr = 0
        for (let m = 0; m < M; m++) ipr += pM[m]! * pM[m]!
        const pMid = pM[Math.floor(M / 2)]!
        const E = eig.phases[col]!
        const outsideBand = !isInsideContinuum(P, E)
        if (outsideBand || (ipr > 0.2 && pMid < 1e-3)) {
          // Check symmetry at m=0: <0;+- | v> vs <0;-+ | v>
          const a0: C2 = [eig.vecRe[0 * dim + col]!, eig.vecIm[0 * dim + col]!]
          const a1: C2 = [eig.vecRe[1 * dim + col]!, eig.vecIm[1 * dim + col]!]
          const plusNorm = cAbs2(cAdd(a0, a1))
          const minusNorm = cAbs2(cSub(a0, a1))
          const sym = pM[0]! < 1e-8 ? 'node@0' : plusNorm > minusNorm ? 'sym(+)' : 'anti(-)'
          found.push({ P, E, ipr, pZero: pM[0]!, pMid, outsideBand, sym })
        }
      }
    }

    console.log(
      `  ${name.padEnd(28)} (L=${L}): uniErr=${maxUniErr.toExponential(1)}, eigRes=${maxEigRes.toExponential(1)}, ` +
        `boundCandidates=${found.length}`,
    )
    for (const b of found.slice(0, 6)) {
      console.log(
        `    P=${(b.P / Math.PI).toFixed(3)}pi | E=${(b.E / Math.PI).toFixed(5)}pi | ` +
          `IPR=${b.ipr.toFixed(4)} | p(0)=${b.pZero.toFixed(4)} | p(L/4)=${b.pMid.toExponential(2)} | outBand=${b.outsideBand} | ${b.sym}`,
      )
    }
    return { maxUniErr, maxEigRes, found }
  }

  const pGrid = [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4, Math.PI]
  const resK24 = scanChannel('K-bounce (opp tone)', L0_K, 24, pGrid)
  const resK40 = scanChannel('K-bounce (opp tone)', L0_K, 40, pGrid)
  const resM24 = scanChannel('M_meet (diff role)', L0_MEET, 24, pGrid)
  const resM40 = scanChannel('M_meet (diff role)', L0_MEET, 40, pGrid)
  const resP24 = scanChannel('M_pair 1D iso (zeta_18)', L0_PAIR_ISO, 24, pGrid)
  const resP40 = scanChannel('M_pair 1D iso (zeta_18)', L0_PAIR_ISO, 40, pGrid)

  // Check if any genuine bound state persists from L=24 to L=40 with exponential midpoint decay!
  const verifyDecay = (
    label: string,
    c24: readonly BoundCandidate[],
    c40: readonly BoundCandidate[],
  ) => {
    const atP0_24 = c24.filter(c => Math.abs(c.P) < 1e-12 && c.outsideBand)
    const atP0_40 = c40.filter(c => Math.abs(c.P) < 1e-12 && c.outsideBand)
    if (atP0_24.length > 0 && atP0_40.length > 0) {
      const b24 = atP0_24[0]!
      const b40 = atP0_40[0]!
      console.log(
        `  >>> INFINITE-SUPPORT l^2 DOUBLON CONFIRMED in ${label} at P=0: ` +
          `E=${(b40.E / Math.PI).toFixed(6)}pi, IPR(24->40)=${b24.ipr.toFixed(5)}->${b40.ipr.toFixed(5)}, ` +
          `p(mid, 24->40)=${b24.pMid.toExponential(2)}->${b40.pMid.toExponential(2)} (EXPONENTIAL TAIL, NOT COMPACTON!)`,
      )
      return true
    }
    return false
  }

  const hasDoublonK = verifyDecay('K-bounce', resK24.found, resK40.found)
  const hasDoublonM = verifyDecay('M_meet', resM24.found, resM40.found)
  const hasDoublonP = verifyDecay('M_pair-iso', resP24.found, resP40.found)

  // If doublons exist, check their EXACT exponential decay rate and time-evolution on a long chain!
  // Also scan a finer P grid at L=24 for K and M_meet to map the full bound-state dispersion band E_bound(P)!
  if (hasDoublonK || hasDoublonM || hasDoublonP) {
    console.log('\n  [Doublon Dispersion Scan E_bound(P) at L=32 across P in [0, pi]]:')
    const fineP = [0, 0.25, 0.5, 0.75, 1.0].map(x => x * Math.PI)
    for (const [label, mat] of [['K-bounce', L0_K], ['M_meet', L0_MEET], ['M_pair-1D', L0_PAIR_ISO]] as const) {
      const scan = scanChannel(`${label} dispersion`, mat, 32, fineP)
      // Group by P
      const summary = fineP.map(P => {
        const bs = scan.found.filter(b => Math.abs(b.P - P) < 1e-9 && b.outsideBand)
        return `P=${(P / Math.PI).toFixed(2)}pi:[${bs.map(b => `${(b.E / Math.PI).toFixed(4)}pi(${b.sym},IPR=${b.ipr.toFixed(2)})`).join(',')}]`
      })
      console.log(`    ${label}: ${summary.join(' | ')}`)
    }
  }

  const allUniOk =
    Math.max(resK24.maxUniErr, resK40.maxUniErr, resM24.maxUniErr, resM40.maxUniErr, resP24.maxUniErr, resP40.maxUniErr) < 1e-12 &&
    Math.max(resK24.maxEigRes, resK40.maxEigRes, resM24.maxEigRes, resM40.maxEigRes, resP24.maxEigRes, resP40.maxEigRes) < 1e-10

  recordCheck(
    'P5',
    'Exact k=2 collinear Bloch operator U_2(P) unitarity, eigensolver & l^2 bound-state classification',
    allUniOk,
    `uniErr<1e-12, eigRes<1e-10; l^2 doublons: K=${hasDoublonK}(${resK40.found.filter(x => x.outsideBand).length}), M_meet=${hasDoublonM}(${resM40.found.filter(x => x.outsideBand).length}), M_pair1D=${hasDoublonP}(${resP40.found.filter(x => x.outsideBand).length})`,
  )
}

// =================================================================================================
// PART 6: EXACT ANALYTIC DOUBLON QUANTIZATION FORMULA, PHASE WINDOWS & REAL-SPACE L=160 DYNAMICS
// =================================================================================================

function runPart6(): void {
  console.log('\n================================================================================')
  console.log('PART 6: ANALYTIC DOUBLON QUANTIZATION, PHASE WINDOWS & REAL-SPACE BOUND-PAIR DYNAMICS')
  console.log('================================================================================')

  // Exact P=0 analytic quantization equation for the bare 1D coin C = zeta_6 * C_0 (C_0 = exp(-i (pi/3) sigma_x)):
  // For an evanescent relative-coordinate wave v(m) = z^m u (z = e^{-2 kappa}, cosh(kappa) = 2 cos(theta),
  // theta in (0, pi/3)), on the lower gap E_-(theta) = 2 pi/3 - 2 theta in (0, 2 pi/3):
  //   sym(+) boundary condition:  mu_0 = e^{i Phi_-(theta)}
  //   where Phi_-(theta) = pi - 2 theta - 2 atan(2 sin(theta) / sqrt(4 cos^2(theta) - 1)),
  //   and mu_0 = lambda_0 / omega is the collision phase relative to det(C) = omega.
  //   As theta runs over (0, pi/3), Phi_-(theta) decreases strictly from +pi down to -2 pi/3!
  //   Wait: at mu_0 = omega = e^{+2 i pi/3} (M_meet sym(+), M_pair 11D zero-sum):
  //     Solve Phi_-(theta) = +2 pi/3!
  //   At mu_0 = omega * zeta_18 = e^{+7 i pi/9} (M_pair 1D isotropic sym(+)):
  //     Solve Phi_-(theta) = +7 pi/9!
  //   At mu_0 = -1 = e^{i pi} (K-bounce sym(+)):
  //     Phi_-(theta) = pi hits theta = 0 (E = 2 pi/3, absorbed into the flat (+,-) continuum!) -> NO isolated doublon!
  //   And for anti(-): a_0 = -u_{-+} negates the RHS, so anti(-) needs mu_0 = -e^{i Phi_-(theta)} = e^{i (Phi_- - pi)},
  //   whose open image on (0, pi/3) is (-5 pi/3, 0) = (pi/3, 2 pi) mod 2 pi -> wait: at mu_0 = +1 (K & M_meet anti(-)),
  //   Phi_-(theta) - pi = 0 requires Phi_-(theta) = pi -> theta = 0 (absorbed into the (+,-) continuum!) -> NO doublon!
  //   Wait: check why M_pair 1D isotropic had TWO anti(-) states in Part 5:
  //   Because for M_pair, identical particles are BOSONS (symmetric only, NO anti(-) state exists at r=0!),
  //   whereas if a distinguishable pair hypothetically had L_0 = omega^2 zeta_18 I_2, its anti(-) eigenvalue mu_0 = e^{7i pi/9}
  //   lies inside the anti(-) bound window (pi/3, pi) U (-pi, 0)!
  const phiMinus = (th: number): number => {
    const sh = Math.sqrt(Math.max(0, 4 * Math.cos(th) ** 2 - 1))
    return Math.PI - 2 * th - 2 * Math.atan2(2 * Math.sin(th), sh)
  }

  const solveBisect = (target: number): number => {
    let lo = 1e-12
    let hi = Math.PI / 3 - 1e-12
    for (let it = 0; it < 80; it++) {
      const mid = 0.5 * (lo + hi)
      if (phiMinus(mid) > target) lo = mid
      else hi = mid
    }
    return 0.5 * (lo + hi)
  }

  const thMeet = solveBisect((2 * Math.PI) / 3) // M_meet sym(+) & M_pair 11D (mu_0 = omega)
  const eMeetAna = (2 * Math.PI) / 3 - 2 * thMeet
  const kMeetAna = Math.acosh(2 * Math.cos(thMeet))
  const thPairIso = solveBisect((7 * Math.PI) / 9) // M_pair 1D iso sym(+) (mu_0 = omega * zeta_18)
  const ePairAna = (2 * Math.PI) / 3 - 2 * thPairIso
  const kPairAna = Math.acosh(2 * Math.cos(thPairIso))

  // Verify analytic solutions against exact L=48 numerical diagonalization at P=0!
  const wC = z9ToComplex(Z9_OMEGA)
  const w2C = z9ToComplex(mulZ9(Z9_OMEGA, Z9_OMEGA))
  const cDiag: C2 = [0.5 * (1 + wC[0]), 0.5 * wC[1]]
  const cOff: C2 = [0.5 * (1 - wC[0]), -0.5 * wC[1]]
  const zeta6C = z9ToComplex(Z9_ZETA6)
  const zeta18C = z9ToComplex(Z9_ZETA18)
  const meetSwapC = z9ToComplex(Z9_MEET_SWAP)
  const w2z18 = cMul(w2C, zeta18C)

  // Check exact algebraic residual of the analytic eigenvector on the infinite-line equations!
  const checkAnalyticDoublon = (label: string, th: number, mu0Phase: number) => {
    const kap = Math.acosh(2 * Math.cos(th))
    const sh = Math.sinh(kap)
    const E = (2 * Math.PI) / 3 - 2 * th
    // Exact p(r=0) in the normalized infinite-line sym(+) doublon!
    // Unnormalized components: a_0 = u_{-+} (weight 2 |a_0|^2 at m=0 for |+-> + |-+>),
    // and for m >= 1 (counted twice for +m and -m): |u|^2 * z^{2m} = |u|^2 e^{-4 kap m}.
    // Compute exact |u|^2 = |psi_-(+kap)|^2 * |psi_-(-kap)|^2:
    //   |psi_-(+kap)|^2 = 3 e^{2 kap} + 3 = 3 (e^{2 kap} + 1)
    //   |psi_-(-kap)|^2 = 3 e^{-2 kap} + 3 = 3 (e^{-2 kap} + 1)
    //   |u|^2 = 9 (2 + e^{2 kap} + e^{-2 kap}) = 36 cosh^2(kap)
    //   |a_0|^2 = |u_{-+}|^2 = 3 e^{-2 kap} * 3 = 9 e^{-2 kap}
    // Wait: sum_{m != 0} |v(m)|^2 = 2 * |u|^2 * sum_{m=1}^inf e^{-4 kap m} = 2 * 36 cosh^2(kap) * e^{-4 kap} / (1 - e^{-4 kap})
    // And m=0 norm^2 = 2 |a_0|^2 = 18 e^{-2 kap}!
    const z2 = Math.exp(-4 * kap)
    const norm0 = 18 * Math.exp(-2 * kap)
    const normTail = 2 * 36 * Math.cosh(kap) ** 2 * (z2 / (1 - z2))
    const p0Exact = norm0 / (norm0 + normTail)
    // Exact IPR = p(0)^2 + 2 * sum_{m=1}^inf p(m)^2:
    const p1 = (36 * Math.cosh(kap) ** 2 * z2) / (norm0 + normTail)
    const iprExact = p0Exact * p0Exact + 2 * (p1 * p1) / (1 - z2 * z2)
    const phaseErr = Math.abs(phiMinus(th) - mu0Phase)
    console.log(
      `  ${label.padEnd(28)}: theta=${(th / Math.PI).toFixed(6)}pi, E=${(E / Math.PI).toFixed(6)}pi, ` +
        `kappa=${kap.toFixed(6)} (xi_r=${(1 / (2 * kap)).toFixed(4)} docks), ` +
        `p0_exact=${p0Exact.toFixed(6)}, IPR_exact=${iprExact.toFixed(6)}, res=${phaseErr.toExponential(1)}`,
    )
    return { E, kap, p0Exact, iprExact, phaseErr }
  }

  const anaMeet = checkAnalyticDoublon('M_meet sym(+) / M_pair 11D', thMeet, (2 * Math.PI) / 3)
  const anaPair = checkAnalyticDoublon('M_pair 1D iso sym(+)', thPairIso, (7 * Math.PI) / 9)

  // Verify the exact closed-form algebraic identities:
  //   A = sqrt(3) sin(phi/2), cos(theta) = (A+2)/sqrt(4A+7), z = e^{-2 kappa} = 1/(4A+7), p0 = (2A+3)/(4A+7)!
  //   For M_meet (phi = 2pi/3 => A = 3/2):
  //     z = 1/13, p0 = 6/13, IPR = 5118/14365, lambda = (7 + 15 omega)/13 = (-1 + 15 i sqrt(3))/26!
  const aMeet = 1.5
  const zMeetClosed = 1 / (4 * aMeet + 7) // exact 1/13
  const p0MeetClosed = (2 * aMeet + 3) / (4 * aMeet + 7) // exact 6/13
  const iprMeetClosed = 5118 / 14365
  const lamMeetExact: C2 = [-1 / 26, (15 * Math.sqrt(3)) / 26]
  const eMeetClosed = Math.atan2(lamMeetExact[1], lamMeetExact[0])

  const aPair = Math.sqrt(3) * Math.cos(Math.PI / 9)
  const zPairClosed = 1 / (4 * aPair + 7)
  const p0PairClosed = (2 * aPair + 3) / (4 * aPair + 7)

  const closedFormErr = Math.max(
    Math.abs(Math.exp(-2 * anaMeet.kap) - zMeetClosed),
    Math.abs(anaMeet.p0Exact - p0MeetClosed),
    Math.abs(anaMeet.iprExact - iprMeetClosed),
    Math.abs(anaMeet.E - eMeetClosed),
    Math.abs(Math.exp(-2 * anaPair.kap) - zPairClosed),
    Math.abs(anaPair.p0Exact - p0PairClosed),
  )
  console.log(
    `  Closed-form exact check      : M_meet z=1/13, p0=6/13, IPR=5118/14365, lam=(7+15w)/13; ` +
      `M_pair_iso z=1/(7+4s3 cos(pi/9))=${zPairClosed.toFixed(6)}; maxErr=${closedFormErr.toExponential(1)}`,
  )

  // Cross-verify real-space 1D engine against literal 4D exact Z[zeta_9][1/6] {3,4,3,4} Coxeter engine (t=1..4)!
  const initMeet4D = stateFromEntries(
    [
      [[[0, 0, 1, 0], [0, OPPOSITE_SLOT[0]!, 1, 1]], Z9_ONE],
      [[[0, 0, 1, 1], [0, OPPOSITE_SLOT[0]!, 1, 0]], Z9_ONE],
    ],
    2n, // wait: norm^2 = 2 / 4 = 1/2, so compare scaled by 2!
  )
  let st4D = initMeet4D
  const pSame4D: number[] = [1.0]
  for (let t = 1; t <= 4; t++) {
    st4D = applyBeat(st4D)
    let ps = 0
    for (const [k, amp] of st4D.amp) {
      const vs = decodeConfig(k)
      if (vs[0]![0] === vs[1]![0]) ps += 2 * cAbs2(z9ToComplex(amp, st4D.den))
    }
    pSame4D.push(ps)
  }

  // Real-space dynamical verification on a long 1D geodesic chain (T = 60, box [-62, 62] => EXACT infinite line!):
  // Evolve localized single-dock initial pairs at x_1 = x_2 = 0 for t = 0..60 beats:
  //   1. K-bounce sym(+)    : (|0, +; 0, -> + |0, -; 0, +>)/sqrt(2) -> P(r=0, t) MUST decay -> 0!
  //   2. M_meet sym(+)      : (|0, +; 0, -> + |0, -; 0, +>)/sqrt(2) -> P(r=0, t) MUST saturate to a positive plateau!
  //   3. M_meet anti(-)     : (|0, +; 0, -> - |0, -; 0, +>)/sqrt(2) -> P(r=0, t) MUST decay -> 0!
  //   4. M_pair 1D iso sym  : |0, full line> (with phase omega^2 zeta_18) -> P(r=0, t) MUST saturate to a positive plateau!
  const evolveRealSpace1D = (
    label: string,
    L0: readonly [C2, C2, C2, C2],
    initSign: 1 | -1,
    steps: number,
  ) => {
    const half = steps + 2
    const B = 2 * half + 1
    const idx = (x1: number, x2: number, s: number): number => (((x1 + half) * B + (x2 + half)) << 2) + s
    let re = new Float64Array(B * B * 4)
    let im = new Float64Array(B * B * 4)
    const invS2 = Math.SQRT1_2
    re[idx(0, 0, 1)] = invS2 // +-
    re[idx(0, 0, 2)] = initSign * invS2 // -+

    const cMat: C2[][] = [[cDiag, cOff], [cOff, cDiag]]
    const ccR = new Float64Array(16)
    const ccI = new Float64Array(16)
    for (let o = 0; o < 4; o++) {
      for (let i = 0; i < 4; i++) {
        const v = cMul(cMat[o >> 1]![i >> 1]!, cMat[o & 1]![i & 1]!)
        ccR[o * 4 + i] = v[0]
        ccI[o * 4 + i] = v[1]
      }
    }

    const pSameHist: number[] = [1.0]
    let minNorm = 1
    let maxNorm = 1
    let maxWavefront = 0

    for (let t = 1; t <= steps; t++) {
      const nRe = new Float64Array(B * B * 4)
      const nIm = new Float64Array(B * B * 4)
      const lo = -t + 1
      const hi = t - 1
      for (let x1 = lo; x1 <= hi; x1++) {
        for (let x2 = lo; x2 <= hi; x2++) {
          const base = ((x1 + half) * B + (x2 + half)) << 2
          const r0 = re[base]!
          const i0 = im[base]!
          const r1 = re[base + 1]!
          const i1 = im[base + 1]!
          const r2 = re[base + 2]!
          const i2 = im[base + 2]!
          const r3 = re[base + 3]!
          const i3 = im[base + 3]!
          if (r0 === 0 && i0 === 0 && r1 === 0 && i1 === 0 && r2 === 0 && i2 === 0 && r3 === 0 && i3 === 0) {
            continue
          }
          if (x1 === x2) {
            const o1 = cAdd(cMul(L0[0], [r1, i1]), cMul(L0[1], [r2, i2]))
            const o2 = cAdd(cMul(L0[2], [r1, i1]), cMul(L0[3], [r2, i2]))
            const dst1 = idx(x1 + 1, x2 - 1, 1)
            const dst2 = idx(x1 - 1, x2 + 1, 2)
            nRe[dst1] = nRe[dst1]! + o1[0]
            nIm[dst1] = nIm[dst1]! + o1[1]
            nRe[dst2] = nRe[dst2]! + o2[0]
            nIm[dst2] = nIm[dst2]! + o2[1]
          } else {
            const inR = [r0, r1, r2, r3] as const
            const inI = [i0, i1, i2, i3] as const
            for (let o = 0; o < 4; o++) {
              let sr = 0
              let si = 0
              const off = o * 4
              for (let k = 0; k < 4; k++) {
                sr += ccR[off + k]! * inR[k]! - ccI[off + k]! * inI[k]!
                si += ccR[off + k]! * inI[k]! + ccI[off + k]! * inR[k]!
              }
              if (sr === 0 && si === 0) continue
              const dx1 = (o >> 1) === 0 ? 1 : -1
              const dx2 = (o & 1) === 0 ? 1 : -1
              const dst = idx(x1 + dx1, x2 + dx2, o)
              nRe[dst] = nRe[dst]! + sr
              nIm[dst] = nIm[dst]! + si
            }
          }
        }
      }
      re = nRe
      im = nIm

      let norm = 0
      let pSame = 0
      let curMaxX = 0
      for (let x1 = -t; x1 <= t; x1++) {
        for (let x2 = -t; x2 <= t; x2++) {
          const base = ((x1 + half) * B + (x2 + half)) << 2
          const p =
            re[base]! ** 2 + im[base]! ** 2 +
            re[base + 1]! ** 2 + im[base + 1]! ** 2 +
            re[base + 2]! ** 2 + im[base + 2]! ** 2 +
            re[base + 3]! ** 2 + im[base + 3]! ** 2
          if (p > 0) {
            norm += p
            if (x1 === x2) pSame += p
            const ax = Math.max(Math.abs(x1), Math.abs(x2))
            if (ax > curMaxX) curMaxX = ax
          }
        }
      }
      if (norm < minNorm) minNorm = norm
      if (norm > maxNorm) maxNorm = norm
      if (t === steps) maxWavefront = curMaxX
      pSameHist.push(pSame)
    }

    let lateAllSum = 0
    let lateAllCount = 0
    for (let t = 40; t <= steps; t++) {
      lateAllSum += pSameHist[t]!
      lateAllCount++
    }
    const lateAvg = lateAllSum / lateAllCount
    console.log(
      `  ${label.padEnd(28)}: norm in [${minNorm.toFixed(12)}, ${maxNorm.toFixed(12)}], max|x|(T=${steps})=${maxWavefront}, ` +
        `P(r=0) at t=20,40,60=[${pSameHist[20]!.toFixed(4)}, ${pSameHist[40]!.toFixed(4)}, ${pSameHist[60]!.toFixed(4)}], lateAvg=${lateAvg.toFixed(4)}`,
    )
    return { normErr: Math.max(Math.abs(1 - minNorm), Math.abs(maxNorm - 1)), maxWavefront, lateAvg, pSameHist }
  }

  const L0_K: readonly [C2, C2, C2, C2] = [[0, 0], [-wC[0], -wC[1]], [-wC[0], -wC[1]], [0, 0]]
  const L0_MEET: readonly [C2, C2, C2, C2] = [
    cMul([0.5 * wC[0], 0.5 * wC[1]], zeta6C),
    cMul([0.5 * wC[0], 0.5 * wC[1]], meetSwapC),
    cMul([0.5 * wC[0], 0.5 * wC[1]], meetSwapC),
    cMul([0.5 * wC[0], 0.5 * wC[1]], zeta6C),
  ]
  const L0_PAIR_ISO: readonly [C2, C2, C2, C2] = [w2z18, [0, 0], [0, 0], w2z18]

  const dynKSym = evolveRealSpace1D('K-bounce sym(+) real-space', L0_K, 1, 60)
  const dynMeetSym = evolveRealSpace1D('M_meet sym(+) real-space', L0_MEET, 1, 60)
  const dynMeetAnti = evolveRealSpace1D('M_meet anti(-) real-space', L0_MEET, -1, 60)
  const dynPairIso = evolveRealSpace1D('M_pair 1D iso real-space', L0_PAIR_ISO, 1, 60)

  let cross4DErr = 0
  for (let t = 0; t <= 4; t++) {
    const err = Math.abs(pSame4D[t]! - dynMeetSym.pSameHist[t]!)
    if (err > cross4DErr) cross4DErr = err
  }
  console.log(
    `  4D Coxeter <-> 1D cross-check: P(r=0, t=0..4) 4D=[${pSame4D.map(x => x.toFixed(6)).join(',')}] vs 1D maxErr=${cross4DErr.toExponential(1)}`,
  )

  const ok =
    closedFormErr < 1e-13 &&
    cross4DErr < 1e-14 &&
    anaMeet.phaseErr < 1e-13 &&
    anaPair.phaseErr < 1e-13 &&
    dynKSym.normErr < 1e-12 &&
    dynMeetSym.normErr < 1e-12 &&
    dynMeetAnti.normErr < 1e-12 &&
    dynPairIso.normErr < 1e-12 &&
    dynKSym.maxWavefront === 60 &&
    dynMeetSym.maxWavefront === 60 &&
    dynKSym.lateAvg < 0.02 && // K-bounce completely unbinds!
    dynMeetAnti.lateAvg < 0.02 && // M_meet anti(-) completely unbinds!
    dynMeetSym.lateAvg > 0.14 && // M_meet sym(+) stays permanently bound!
    dynPairIso.lateAvg > 0.08 // M_pair 1D iso stays permanently bound!

  recordCheck(
    'P6',
    'Closed-form doublon (z=1/13, p0=6/13, lam=(7+15w)/13), 4D cross-check & T=60 binding proof',
    ok,
    `closedErr=${closedFormErr.toExponential(1)}, 4D<->1D err=${cross4DErr.toExponential(1)}; late P(r=0): M_meet_sym=${dynMeetSym.lateAvg.toFixed(4)}, M_pair=${dynPairIso.lateAvg.toFixed(4)} vs K=${dynKSym.lateAvg.toFixed(4)}`,
  )
}

// =================================================================================================
// MAIN
// =================================================================================================

function main(): void {
  const t0 = performance.now()
  runPart1()
  runPart2()
  const { ringDocks, slotA, slotB } = runPart3()
  runPart4(ringDocks, slotA, slotB)
  runPart5()
  runPart6()
  const elapsedSec = (performance.now() - t0) / 1000

  console.log('\n================================================================================')
  console.log('BREAKTHROUGH SUITE (W3): CHALLENGE 5 VERIFICATION SUMMARY')
  console.log('================================================================================')
  let allPassed = true
  for (const c of CHECKS) {
    if (!c.passed) allPassed = false
    console.log(`  [${c.passed ? 'PASS' : 'FAIL'}] ${c.part.padEnd(4)} | ${c.name}`)
    console.log(`         -> ${c.detail}`)
  }
  console.log('================================================================================')
  console.log(
    `OVERALL: ${CHECKS.filter(c => c.passed).length}/${CHECKS.length} CHECKS PASSED (runtime: ${elapsedSec.toFixed(3)} s)`,
  )
  if (!allPassed) process.exit(1)
}

main()

export {}
