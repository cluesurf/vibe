// Wave-5B Standard Model Closure — Gap A:
// Dense Cyclotomic Ring Gauge Continuum Recovery on 4D D_4 & Honest Action / Link-Dimension Audit
//
// Epistemic Scope (Tier A / Tier B / Tier C):
//   - Tier A (Exact BigInt algebraic, number-theoretic, and discrete group identities):
//       * G1: Exact BigInt Z[omega][1/2] verification of S_12, S_23 in SU(2), Tr(S_12 S_23) = 5/4,
//             dyadic valuation growth through k = 24, FP_2(2T) = 2 (Ad(2T) irreducibility);
//             exact Hasse-invariant / Hilbert-symbol obstruction (-3, -1)_3 = -1 != +1 = (-1, -1)_3
//             over Q(zeta_9)^+ (degree 3, odd), proving 2T cannot embed unitarily in M_2(Q(zeta_9))
//             while Dic_3 = <S_12, J> (order 12) embeds strictly in SU(2) cap M_2(Z[omega]);
//             exact BigInt Z[zeta_9][1/3] verification of Sigma(648) + T_3 in SU(3),
//             Tr(V T_3) = (-1 + 2z - z^2 - 2z^3 + z^4 - 2z^5)/3, field norms N(Tr(V T_3)) = 1/3,
//             N(Tr(Ad(V T_3))) = 1/9, N(Tr((V T_3)^k)) denominator 3^k (coprime numerator) for k = 1..12,
//             and FP_2(Sigma(648)) = 2 (Ad(Sigma(648)) irreducibility), proving closure = SU(3).
//       * G2/G3 group structure: Exact coset BFS sizes (24, 600, 13848 for 2T+W_bare;
//             12, 156, 1596, 15996 for strict Z[omega][1/2] Dic_3+S_23;
//             648, 5832, 36936, 223560, 1343304 for strict Z[zeta_9][1/3] Sigma(648)+T_3),
//             exact 12-qutrit-MUB projector coset invariance, exact left-G_0 invariance,
//             exact frame potentials FP_1..4, and exact Peter-Weyl / Weyl 1-plaquette comparisons.
//       * G4 geometry & Lie algebra: Exact 4D D_4 loop census (12 links, 32 triangles, 48 rhombi,
//             6 octahedron equatorial squares, 12 diagonal squares), O(k^2)/O(k^4) tree isotropy,
//             and exact Lie-algebra Wick contractions (gamma = 4 and gamma = 3).
//       * G5 gauge algebra: Exact local G_0 invariance on W_L, exact bi-G_0 shell conjugacy
//             h S h^-1 = S ([G_x(h), E^2] = 0, [G_x(h), B_p] = 0), graded filtration closure
//             W_1 W_L W_1 subset W_{L+2}, and broken-covariance negative control.
//   - Tier B (1-loop lattice perturbation theory, Cholesky BZ determinants, background-field RG):
//       * G2/G3: 1-loop Gaussian-vs-dilute-gas freezing boundary beta_f(L) on 4D D_4 and Z^4
//             using Cholesky BZ determinants c_L and literature 1-loop matching constants
//             (Dashen-Gross C_DG_Z4 = 0.16995599, Celmaster DELTA_F0_D4_Z4 = 1.91834).
//       * G4: Single-pass sparse half-BZ (nGrid = 8) Cholesky comparison of 5 native D_4
//             improved actions and 1-loop tadMult = 0 adjoint ceiling audit.
//       * G5: Non-circular 1-loop 4D D_4 background-field asymptotic freedom (orbital diamagnetic
//             +2/(48 pi^2) and spin-1 paramagnetic -24/(48 pi^2) -> b_0 = 11 N / (48 pi^2)).
//   - Tier C (Action-engineering trade-offs and link Hilbert-space dimension comparison):
//       * G4/G5: Honest comparison of group-basis register growth |W_L| against electric/irrep
//             truncation sum d_R^2 and explicit scope of finite-L G_0 vs inductive-limit Gamma symmetry.
//
// Standalone, zero external imports, zero Math.random (deterministic LCG used only for SU(3) Haar probes),
// strict TypeScript (--strict --noUncheckedIndexedAccess clean), fast (< 8 s, < 200 MB RSS).

const T0_MS = performance.now()
const PI = Math.PI
const SQRT3 = Math.sqrt(3)
const SQRT5 = Math.sqrt(5)

const V_SU2 = 16 * PI * PI
const V_SU3 = 256 * SQRT3 * Math.pow(PI, 5)

// GUT reference couplings from Wave-5 Track 3 (g_GUT^2 = 0.27846 -> beta_D4_GUT = N / g_GUT^2)
const G_GUT_SQ = 0.278464
const BETA_D4_GUT_SU2 = 7.182
const BETA_D4_GUT_SU3 = 10.773

// Literature 1-loop Wilson matching inputs (Dashen-Gross 1981, Celmaster 1982; Tier B/C)
const C_DG_Z4 = 0.16995599
const DELTA_F0_D4_Z4 = 1.91834
const C_LOOP_Z4 = C_DG_Z4 - 0.125
const C_LOOP_D4 = C_LOOP_Z4 - (11 / (48 * PI * PI)) * DELTA_F0_D4_Z4

function cTotZ4SuN(N: number): number {
  const c2F = (N * N - 1) / (2 * N)
  return 0.25 * c2F - N / 24 + (C_DG_Z4 - 1 / 12) * N
}

function cTotD4SuN(N: number, tadMult = 1.0): number {
  const c2F = (N * N - 1) / (2 * N)
  return tadMult * ((11 / 32) * c2F - (11 / 192) * N) + (C_LOOP_D4 + 1 / 24) * N
}

// =================================================================================================
// SECTION 0: SHARED PRIMITIVES & GATE REGISTRY
// =================================================================================================

type GateRecord = {
  readonly id: string
  readonly tier: string
  readonly title: string
  readonly passed: boolean
  readonly detail: string
}

const GATES: GateRecord[] = []

function assert(cond: boolean, msg: string): void {
  if (!cond) {
    throw new Error(`ASSERTION FAILED: ${msg}`)
  }
}

function assertClose(actual: number, expected: number, tol: number, label: string): void {
  const err = Math.abs(actual - expected)
  assert(
    Number.isFinite(actual) && err <= tol,
    `${label}: expected ${expected} +- ${tol}, got ${actual} (err=${err.toExponential(3)})`,
  )
}

function recordGate(id: string, tier: string, title: string, cond: boolean, detail: string): void {
  GATES.push({ id, tier, title, passed: cond, detail })
  console.log(`  [${cond ? 'PASS' : 'FAIL'}] ${id} (${tier}) | ${title}`)
  console.log(`         -> ${detail}`)
  assert(cond, `Gate ${id} (${title}) failed: ${detail}`)
}

// -------------------------------------------------------------------------------------------------
// 0.1 Exact BigInt Z[omega][1/2] arithmetic (w^2 + w + 1 = 0)
// -------------------------------------------------------------------------------------------------

type Eis = readonly [bigint, bigint] // a + b * w
type EMat2 = {
  readonly m00: Eis
  readonly m01: Eis
  readonly m10: Eis
  readonly m11: Eis
  readonly p: number // denominator 2^p
}

const E_ZERO: Eis = [0n, 0n]
const E_ONE: Eis = [1n, 0n]

const eAdd = (x: Eis, y: Eis): Eis => [x[0] + y[0], x[1] + y[1]]
const eSub = (x: Eis, y: Eis): Eis => [x[0] - y[0], x[1] - y[1]]
const eMul = (x: Eis, y: Eis): Eis => [
  x[0] * y[0] - x[1] * y[1],
  x[0] * y[1] + x[1] * y[0] - x[1] * y[1],
]
const eConj = (x: Eis): Eis => [x[0] - x[1], -x[1]]
const eEq = (x: Eis, y: Eis): boolean => x[0] === y[0] && x[1] === y[1]

function reduceE2(a: EMat2): EMat2 {
  let { m00, m01, m10, m11, p } = a
  while (
    p > 0 &&
    (m00[0] & 1n) === 0n &&
    (m00[1] & 1n) === 0n &&
    (m01[0] & 1n) === 0n &&
    (m01[1] & 1n) === 0n &&
    (m10[0] & 1n) === 0n &&
    (m10[1] & 1n) === 0n &&
    (m11[0] & 1n) === 0n &&
    (m11[1] & 1n) === 0n
  ) {
    m00 = [m00[0] >> 1n, m00[1] >> 1n]
    m01 = [m01[0] >> 1n, m01[1] >> 1n]
    m10 = [m10[0] >> 1n, m10[1] >> 1n]
    m11 = [m11[0] >> 1n, m11[1] >> 1n]
    p--
  }
  return { m00, m01, m10, m11, p }
}

function mulE2(a: EMat2, b: EMat2): EMat2 {
  return reduceE2({
    m00: eAdd(eMul(a.m00, b.m00), eMul(a.m01, b.m10)),
    m01: eAdd(eMul(a.m00, b.m01), eMul(a.m01, b.m11)),
    m10: eAdd(eMul(a.m10, b.m00), eMul(a.m11, b.m10)),
    m11: eAdd(eMul(a.m10, b.m01), eMul(a.m11, b.m11)),
    p: a.p + b.p,
  })
}

function dagE2(a: EMat2): EMat2 {
  return {
    m00: eConj(a.m00),
    m01: eConj(a.m10),
    m10: eConj(a.m01),
    m11: eConj(a.m11),
    p: a.p,
  }
}

function isIdE2(a: EMat2): boolean {
  const r = reduceE2(a)
  return r.p === 0 && eEq(r.m00, E_ONE) && eEq(r.m01, E_ZERO) && eEq(r.m10, E_ZERO) && eEq(r.m11, E_ONE)
}

function keyE2(a: EMat2): string {
  const r = reduceE2(a)
  return `${r.m00[0]},${r.m00[1]};${r.m01[0]},${r.m01[1]};${r.m10[0]},${r.m10[1]};${r.m11[0]},${r.m11[1]}/${r.p}`
}

// -------------------------------------------------------------------------------------------------
// 0.2 Exact BigInt Z[zeta_9][1/3] arithmetic (Phi_9(z) = z^6 + z^3 + 1 = 0)
// -------------------------------------------------------------------------------------------------

type Z9 = readonly [bigint, bigint, bigint, bigint, bigint, bigint]
type Z9Frac = { readonly c: Z9; readonly p: number } // (1 / 3^p) * sum_{k=0}^5 c[k] z^k

const Z9_ZERO: Z9Frac = { c: [0n, 0n, 0n, 0n, 0n, 0n], p: 0 }
const Z9_ONE: Z9Frac = { c: [1n, 0n, 0n, 0n, 0n, 0n], p: 0 }

function z9Pow3(k: number): bigint {
  let out = 1n
  for (let i = 0; i < k; i++) out *= 3n
  return out
}

function z9Reduce(cIn: readonly [bigint, bigint, bigint, bigint, bigint, bigint], pIn: number): Z9Frac {
  let c0 = cIn[0]
  let c1 = cIn[1]
  let c2 = cIn[2]
  let c3 = cIn[3]
  let c4 = cIn[4]
  let c5 = cIn[5]
  if (c0 === 0n && c1 === 0n && c2 === 0n && c3 === 0n && c4 === 0n && c5 === 0n) {
    return Z9_ZERO
  }
  let p = pIn
  while (
    p > 0 &&
    c0 % 3n === 0n &&
    c1 % 3n === 0n &&
    c2 % 3n === 0n &&
    c3 % 3n === 0n &&
    c4 % 3n === 0n &&
    c5 % 3n === 0n
  ) {
    c0 /= 3n
    c1 /= 3n
    c2 /= 3n
    c3 /= 3n
    c4 /= 3n
    c5 /= 3n
    p--
  }
  return { c: [c0, c1, c2, c3, c4, c5], p }
}

function z9Add(a: Z9Frac, b: Z9Frac): Z9Frac {
  const p = Math.max(a.p, b.p)
  const sa = z9Pow3(p - a.p)
  const sb = z9Pow3(p - b.p)
  return z9Reduce(
    [
      a.c[0] * sa + b.c[0] * sb,
      a.c[1] * sa + b.c[1] * sb,
      a.c[2] * sa + b.c[2] * sb,
      a.c[3] * sa + b.c[3] * sb,
      a.c[4] * sa + b.c[4] * sb,
      a.c[5] * sa + b.c[5] * sb,
    ],
    p,
  )
}

function z9Sub(a: Z9Frac, b: Z9Frac): Z9Frac {
  const p = Math.max(a.p, b.p)
  const sa = z9Pow3(p - a.p)
  const sb = z9Pow3(p - b.p)
  return z9Reduce(
    [
      a.c[0] * sa - b.c[0] * sb,
      a.c[1] * sa - b.c[1] * sb,
      a.c[2] * sa - b.c[2] * sb,
      a.c[3] * sa - b.c[3] * sb,
      a.c[4] * sa - b.c[4] * sb,
      a.c[5] * sa - b.c[5] * sb,
    ],
    p,
  )
}

function z9Mul(a: Z9Frac, b: Z9Frac): Z9Frac {
  const tmp: bigint[] = [0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n]
  for (let i = 0; i < 6; i++) {
    const ai = a.c[i]!
    if (ai === 0n) continue
    for (let j = 0; j < 6; j++) {
      const bj = b.c[j]!
      if (bj === 0n) continue
      tmp[i + j] = tmp[i + j]! + ai * bj
    }
  }
  // Reduce modulo z^6 + z^3 + 1 = 0 from degree 10 down to degree 6
  for (let d = 10; d >= 6; d--) {
    const v = tmp[d]!
    if (v === 0n) continue
    tmp[d - 3] = tmp[d - 3]! - v
    tmp[d - 6] = tmp[d - 6]! - v
    tmp[d] = 0n
  }
  return z9Reduce([tmp[0]!, tmp[1]!, tmp[2]!, tmp[3]!, tmp[4]!, tmp[5]!], a.p + b.p)
}

function z9Eq(a: Z9Frac, b: Z9Frac): boolean {
  return (
    a.p === b.p &&
    a.c[0] === b.c[0] &&
    a.c[1] === b.c[1] &&
    a.c[2] === b.c[2] &&
    a.c[3] === b.c[3] &&
    a.c[4] === b.c[4] &&
    a.c[5] === b.c[5]
  )
}

function z9Gal(x: Z9Frac, a: number): Z9Frac {
  const out: bigint[] = [0n, 0n, 0n, 0n, 0n, 0n]
  for (let k = 0; k < 6; k++) {
    const v = x.c[k]!
    if (v === 0n) continue
    const r = (a * k) % 9
    if (r < 6) {
      out[r] = out[r]! + v
    } else {
      // z^r = -z^(r-3) - z^(r-6) for r in {6, 7, 8}
      out[r - 3] = out[r - 3]! - v
      out[r - 6] = out[r - 6]! - v
    }
  }
  return z9Reduce([out[0]!, out[1]!, out[2]!, out[3]!, out[4]!, out[5]!], x.p)
}

const z9Conj = (x: Z9Frac): Z9Frac => z9Gal(x, 8)

function bigGcd(a: bigint, b: bigint): bigint {
  let x = a < 0n ? -a : a
  let y = b < 0n ? -b : b
  while (y !== 0n) {
    const t = x % y
    x = y
    y = t
  }
  return x
}

function z9Norm(x: Z9Frac): { readonly num: bigint; readonly den: bigint; readonly p3: number } {
  let prod = Z9_ONE
  for (const a of [1, 2, 4, 5, 7, 8]) {
    prod = z9Mul(prod, z9Gal(x, a))
  }
  assert(
    prod.c[1] === 0n &&
      prod.c[2] === 0n &&
      prod.c[3] === 0n &&
      prod.c[4] === 0n &&
      prod.c[5] === 0n,
    `Field norm N_{Q(zeta_9)/Q} did not land in Q: [${prod.c.join(', ')}]`,
  )
  const rawNum = prod.c[0]
  const rawDen = z9Pow3(prod.p)
  const g = bigGcd(rawNum, rawDen)
  return { num: rawNum / g, den: rawDen / g, p3: prod.p }
}

type Z9Mat3 = readonly [
  Z9Frac,
  Z9Frac,
  Z9Frac,
  Z9Frac,
  Z9Frac,
  Z9Frac,
  Z9Frac,
  Z9Frac,
  Z9Frac,
]

function z9mMul(A: Z9Mat3, B: Z9Mat3): Z9Mat3 {
  const out: Z9Frac[] = new Array<Z9Frac>(9)
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let s = Z9_ZERO
      for (let k = 0; k < 3; k++) {
        s = z9Add(s, z9Mul(A[i * 3 + k]!, B[k * 3 + j]!))
      }
      out[i * 3 + j] = s
    }
  }
  return [out[0]!, out[1]!, out[2]!, out[3]!, out[4]!, out[5]!, out[6]!, out[7]!, out[8]!]
}

function z9mDag(A: Z9Mat3): Z9Mat3 {
  return [
    z9Conj(A[0]),
    z9Conj(A[3]),
    z9Conj(A[6]),
    z9Conj(A[1]),
    z9Conj(A[4]),
    z9Conj(A[7]),
    z9Conj(A[2]),
    z9Conj(A[5]),
    z9Conj(A[8]),
  ]
}

function z9mTr(A: Z9Mat3): Z9Frac {
  return z9Add(z9Add(A[0], A[4]), A[8])
}

function z9mDet(A: Z9Mat3): Z9Frac {
  const t0 = z9Mul(A[0], z9Sub(z9Mul(A[4], A[8]), z9Mul(A[5], A[7])))
  const t1 = z9Mul(A[1], z9Sub(z9Mul(A[3], A[8]), z9Mul(A[5], A[6])))
  const t2 = z9Mul(A[2], z9Sub(z9Mul(A[3], A[7]), z9Mul(A[4], A[6])))
  return z9Add(z9Sub(t0, t1), t2)
}

function z9mIsId(A: Z9Mat3): boolean {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const tgt = i === j ? Z9_ONE : Z9_ZERO
      if (!z9Eq(A[i * 3 + j]!, tgt)) return false
    }
  }
  return true
}

// -------------------------------------------------------------------------------------------------
// 0.3 Fast Float64Array(18) complex 3x3 matrices & unit quaternion primitives
// -------------------------------------------------------------------------------------------------

// Layout: index (i*3 + j)*2 = Re, (i*3 + j)*2 + 1 = Im
type M3 = Float64Array

function m3Id(): M3 {
  const m = new Float64Array(18)
  m[0] = 1
  m[8] = 1
  m[16] = 1
  return m
}

function m3MulInto(A: M3, B: M3, out: M3): void {
  for (let i = 0; i < 3; i++) {
    const i3 = i * 3
    for (let j = 0; j < 3; j++) {
      let sr = 0
      let si = 0
      for (let k = 0; k < 3; k++) {
        const ai = (i3 + k) * 2
        const bi = (k * 3 + j) * 2
        const ar = A[ai]!
        const aIm = A[ai + 1]!
        const br = B[bi]!
        const bIm = B[bi + 1]!
        sr += ar * br - aIm * bIm
        si += ar * bIm + aIm * br
      }
      const oi = (i3 + j) * 2
      out[oi] = sr
      out[oi + 1] = si
    }
  }
}

function m3Mul(A: M3, B: M3): M3 {
  const out = new Float64Array(18)
  m3MulInto(A, B, out)
  return out
}

function m3Dag(A: M3): M3 {
  const out = new Float64Array(18)
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const src = (j * 3 + i) * 2
      const dst = (i * 3 + j) * 2
      out[dst] = A[src]!
      out[dst + 1] = -A[src + 1]!
    }
  }
  return out
}

function m3Key(A: M3, scale = 1e5): string {
  const parts: number[] = new Array<number>(18)
  for (let i = 0; i < 18; i++) {
    const v = Math.round(A[i]! * scale)
    parts[i] = v === 0 ? 0 : v
  }
  return parts.join(',')
}

function m3ReTr(A: M3): number {
  return A[0]! + A[8]! + A[16]!
}

function m3TrProd(A: M3, B: M3): readonly [number, number] {
  // Complex Tr(A * B) = sum_{i,j} A_{ij} B_{ji}
  let sr = 0
  let si = 0
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const ai = (i * 3 + j) * 2
      const bi = (j * 3 + i) * 2
      const ar = A[ai]!
      const aIm = A[ai + 1]!
      const br = B[bi]!
      const bIm = B[bi + 1]!
      sr += ar * br - aIm * bIm
      si += ar * bIm + aIm * br
    }
  }
  return [sr, si]
}

function m3FrobDiff(A: M3, B: M3): number {
  let s = 0
  for (let i = 0; i < 18; i++) {
    const d = A[i]! - B[i]!
    s += d * d
  }
  return Math.sqrt(s)
}

function m3UnitaryErr(A: M3): number {
  const P = m3Mul(m3Dag(A), A)
  let err = 0
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const idx = (i * 3 + j) * 2
      const tgt = i === j ? 1 : 0
      const e = Math.hypot(P[idx]! - tgt, P[idx + 1]!)
      if (e > err) err = e
    }
  }
  return err
}

function m3Det(A: M3): readonly [number, number] {
  const cm = (ar: number, ai: number, br: number, bi: number): readonly [number, number] => [
    ar * br - ai * bi,
    ar * bi + ai * br,
  ]
  const sub2 = (p: readonly [number, number], q: readonly [number, number]): readonly [number, number] => [
    p[0] - q[0],
    p[1] - q[1],
  ]
  const m0 = sub2(cm(A[8]!, A[9]!, A[16]!, A[17]!), cm(A[10]!, A[11]!, A[14]!, A[15]!))
  const m1 = sub2(cm(A[6]!, A[7]!, A[16]!, A[17]!), cm(A[10]!, A[11]!, A[12]!, A[13]!))
  const m2 = sub2(cm(A[6]!, A[7]!, A[14]!, A[15]!), cm(A[8]!, A[9]!, A[12]!, A[13]!))
  const t0 = cm(A[0]!, A[1]!, m0[0], m0[1])
  const t1 = cm(A[2]!, A[3]!, m1[0], m1[1])
  const t2 = cm(A[4]!, A[5]!, m2[0], m2[1])
  return [t0[0] - t1[0] + t2[0], t0[1] - t1[1] + t2[1]]
}

// Unit quaternions q = [q0, q1, q2, q3] with SU(2) embedding U(q) = q0 I - i(q1 s_x + q2 s_y + q3 s_z)
type Quat = readonly [number, number, number, number]

const Q_ID: Quat = [1, 0, 0, 0]

function qMul(a: Quat, b: Quat): Quat {
  return [
    a[0] * b[0] - a[1] * b[1] - a[2] * b[2] - a[3] * b[3],
    a[0] * b[1] + a[1] * b[0] + a[2] * b[3] - a[3] * b[2],
    a[0] * b[2] - a[1] * b[3] + a[2] * b[0] + a[3] * b[1],
    a[0] * b[3] + a[1] * b[2] - a[2] * b[1] + a[3] * b[0],
  ]
}

function qConj(a: Quat): Quat {
  return [a[0], -a[1], -a[2], -a[3]]
}

function qKey(q: Quat, scale = 1e5): string {
  // Irrational tie-break offset prevents +-1e-16 roundoff flips at dyadic half-integers (e.g. m/128)
  const bias = 0.137291
  const k0 = Math.round(q[0] * scale + bias)
  const k1 = Math.round(q[1] * scale + bias)
  const k2 = Math.round(q[2] * scale + bias)
  const k3 = Math.round(q[3] * scale + bias)
  return `${k0},${k1},${k2},${k3}`
}

function eisToComplex(e: Eis): readonly [number, number] {
  const a = Number(e[0])
  const b = Number(e[1])
  return [a - 0.5 * b, 0.5 * SQRT3 * b]
}

function eMat2ToQuat(M: EMat2): Quat {
  const inv = 1 / Math.pow(2, M.p)
  const m00 = eisToComplex(M.m00)
  const m01 = eisToComplex(M.m01)
  // U(q) = [[q0 - i q3, -q2 - i q1], [q2 - i q1, q0 + i q3]]
  return [m00[0] * inv, -m01[1] * inv, -m01[0] * inv, -m00[1] * inv]
}

function closeQuatGroup(gens: readonly Quat[], maxN: number): readonly Quat[] {
  const seen = new Map<string, Quat>([[qKey(Q_ID), Q_ID]])
  const queue: Quat[] = [Q_ID]
  let head = 0
  while (head < queue.length && seen.size <= maxN) {
    const cur = queue[head++]!
    for (const g of gens) {
      const nxt = qMul(cur, g)
      const k = qKey(nxt)
      if (!seen.has(k)) {
        seen.set(k, nxt)
        queue.push(nxt)
      }
    }
  }
  return Array.from(seen.values())
}

function closeM3Group(gens: readonly M3[], maxN: number): readonly M3[] {
  const id = m3Id()
  const seen = new Map<string, M3>([[m3Key(id), id]])
  const queue: M3[] = [id]
  let head = 0
  while (head < queue.length && seen.size <= maxN) {
    const cur = queue[head++]!
    for (const g of gens) {
      const nxt = m3Mul(cur, g)
      const k = m3Key(nxt)
      if (!seen.has(k)) {
        seen.set(k, nxt)
        queue.push(nxt)
      }
    }
  }
  return Array.from(seen.values())
}

// -------------------------------------------------------------------------------------------------
// 0.4 Shared Cholesky Hermitian ln det + 4D lattice specification + high-beta logarithmic solveFreezing
// -------------------------------------------------------------------------------------------------

function choleskyInPlace(n: number, re: Float64Array, im: Float64Array): number {
  let lnDet = 0
  for (let j = 0; j < n; j++) {
    let d = re[j * n + j]!
    for (let k = 0; k < j; k++) {
      const rk = re[j * n + k]!
      const ik = im[j * n + k]!
      d -= rk * rk + ik * ik
    }
    if (!(d > 0)) return NaN
    const ljj = Math.sqrt(d)
    re[j * n + j] = ljj
    im[j * n + j] = 0
    lnDet += 2 * Math.log(ljj)
    const invLjj = 1 / ljj
    for (let i = j + 1; i < n; i++) {
      let sr = re[i * n + j]!
      let si = im[i * n + j]!
      for (let k = 0; k < j; k++) {
        const ar = re[i * n + k]!
        const ai = im[i * n + k]!
        const br = re[j * n + k]!
        const bi = -im[j * n + k]!
        sr -= ar * br - ai * bi
        si -= ar * bi + ai * br
      }
      re[i * n + j] = sr * invLjj
      im[i * n + j] = si * invLjj
    }
  }
  return lnDet
}

// Compute H^{-1} from lower-triangular Cholesky factor L (stored in lower triangle of lRe, lIm)
function choleskyInvertFromL(
  n: number,
  lRe: Float64Array,
  lIm: Float64Array,
  xRe: Float64Array,
  xIm: Float64Array,
  invRe: Float64Array,
  invIm: Float64Array,
): void {
  xRe.fill(0)
  xIm.fill(0)
  for (let col = 0; col < n; col++) {
    for (let i = col; i < n; i++) {
      let sr = i === col ? 1 : 0
      let si = 0
      for (let k = col; k < i; k++) {
        const ar = lRe[i * n + k]!
        const ai = lIm[i * n + k]!
        const br = xRe[k * n + col]!
        const bi = xIm[k * n + col]!
        sr -= ar * br - ai * bi
        si -= ar * bi + ai * br
      }
      const invD = 1 / lRe[i * n + i]!
      xRe[i * n + col] = sr * invD
      xIm[i * n + col] = si * invD
    }
  }
  // H^{-1} = X^dag X
  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      let sr = 0
      let si = 0
      const kStart = i > j ? i : j
      for (let k = kStart; k < n; k++) {
        const ar = xRe[k * n + i]!
        const ai = -xIm[k * n + i]!
        const br = xRe[k * n + j]!
        const bi = xIm[k * n + j]!
        sr += ar * br - ai * bi
        si += ar * bi + ai * br
      }
      invRe[i * n + j] = sr
      invIm[i * n + j] = si
      invRe[j * n + i] = sr
      invIm[j * n + i] = -si
    }
  }
}

type IVec4 = readonly [number, number, number, number]
type LoopStep = { readonly link: number; readonly sign: number; readonly base: IVec4 }

function cmpVec(a: IVec4, b: IVec4): number {
  for (let i = 0; i < 4; i++) {
    if (a[i]! !== b[i]!) return a[i]! - b[i]!
  }
  return 0
}

function vecKey(v: IVec4): string {
  return `${v[0]},${v[1]},${v[2]},${v[3]}`
}

// Canonical key for any closed unoriented cycle of vertices in Z^4 using numeric lexicographical cmpVec
function canonicalCycleKey(verts: readonly IVec4[]): string {
  const m = verts.length
  let best: IVec4[] | null = null
  for (let s = 0; s < m; s++) {
    const o = verts[s]!
    for (const dir of [1, -1] as const) {
      const cand: IVec4[] = new Array<IVec4>(m)
      for (let t = 0; t < m; t++) {
        const v = verts[(s + dir * t + m) % m]!
        cand[t] = [v[0] - o[0], v[1] - o[1], v[2] - o[2], v[3] - o[3]]
      }
      if (best === null) {
        best = cand
      } else {
        let cmp = 0
        for (let t = 0; t < m; t++) {
          cmp = cmpVec(cand[t]!, best[t]!)
          if (cmp !== 0) break
        }
        if (cmp < 0) best = cand
      }
    }
  }
  return best!.map(vecKey).join('|')
}

function toD4Prim(x: IVec4): IVec4 {
  return [
    (x[0] + x[1] + x[2] + x[3]) / 2,
    (x[0] - x[1] - x[2] - x[3]) / 2,
    -x[2] - x[3],
    -x[3],
  ]
}

type D4Geometry = {
  readonly rootsR4: readonly IVec4[]
  readonly posR4: readonly IVec4[]
  readonly posPrim: readonly IVec4[]
  readonly tris: readonly (readonly LoopStep[])[]
  readonly rhombi: readonly (readonly LoopStep[])[]
  readonly octSqs: readonly (readonly LoopStep[])[]
  readonly diagSqs: readonly (readonly LoopStep[])[]
  readonly trisR4: readonly (readonly IVec4[])[]
  readonly rhombiR4: readonly (readonly IVec4[])[]
  readonly octSqsR4: readonly (readonly IVec4[])[]
  readonly diagSqsR4: readonly (readonly IVec4[])[]
  readonly perLinkCounts: readonly [number, number, number, number]
}

function buildD4Geometry(): D4Geometry {
  const rootsR4: IVec4[] = []
  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      for (const si of [-1, 1]) {
        for (const sj of [-1, 1]) {
          const v: [number, number, number, number] = [0, 0, 0, 0]
          v[i] = si
          v[j] = sj
          rootsR4.push(v)
        }
      }
    }
  }
  const posR4 = rootsR4.filter(r => {
    for (let k = 0; k < 4; k++) if (r[k]! !== 0) return r[k]! > 0
    return false
  })
  const posPrim = posR4.map(toD4Prim)
  const posIdx = new Map<string, number>(posPrim.map((v, i) => [vecKey(v), i]))
  const rootSet = new Set<string>(rootsR4.map(vecKey))

  const toSteps = (ptsR4: readonly IVec4[], counter: Int32Array): readonly LoopStep[] => {
    const pVerts = ptsR4.map(toD4Prim)
    const steps: LoopStep[] = []
    const m = pVerts.length
    for (let i = 0; i < m; i++) {
      const a = pVerts[i]!
      const b = pVerts[(i + 1) % m]!
      const df: IVec4 = [b[0] - a[0], b[1] - a[1], b[2] - a[2], b[3] - a[3]]
      const pI = posIdx.get(vecKey(df))
      if (pI !== undefined) {
        steps.push({ link: pI, sign: 1, base: a })
        counter[pI] = counter[pI]! + 1
      } else {
        const mI = posIdx.get(vecKey([-df[0], -df[1], -df[2], -df[3]]))
        assert(mI !== undefined, 'Missing inverse D_4 link in loop builder')
        steps.push({ link: mI!, sign: -1, base: b })
        counter[mI!] = counter[mI!]! + 1
      }
    }
    return steps
  }

  const zero: IVec4 = [0, 0, 0, 0]
  const seenTri = new Set<string>()
  const tris: (readonly LoopStep[])[] = []
  const trisR4: (readonly IVec4[])[] = []
  const cntTri = new Int32Array(12)

  const seenRhomb = new Set<string>()
  const rhombi: (readonly LoopStep[])[] = []
  const rhombiR4: (readonly IVec4[])[] = []
  const cntRhomb = new Int32Array(12)

  const seenOct = new Set<string>()
  const octSqs: (readonly LoopStep[])[] = []
  const octSqsR4: (readonly IVec4[])[] = []
  const cntOct = new Int32Array(12)

  const seenDiag = new Set<string>()
  const diagSqs: (readonly LoopStep[])[] = []
  const diagSqsR4: (readonly IVec4[])[] = []
  const cntDiag = new Int32Array(12)

  for (const u of rootsR4) {
    for (const v of rootsR4) {
      const dot = u[0] * v[0] + u[1] * v[1] + u[2] * v[2] + u[3] * v[3]
      if (dot === 1) {
        const diff: IVec4 = [v[0] - u[0], v[1] - u[1], v[2] - u[2], v[3] - u[3]]
        assert(rootSet.has(vecKey(diff)), 'Dot=1 pair must form a triangle')
        const triVerts: readonly IVec4[] = [zero, u, v]
        const tk = canonicalCycleKey(triVerts)
        if (!seenTri.has(tk)) {
          seenTri.add(tk)
          trisR4.push(triVerts)
          tris.push(toSteps(triVerts, cntTri))
        }
        const sumUV: IVec4 = [u[0] + v[0], u[1] + v[1], u[2] + v[2], u[3] + v[3]]
        const rhVerts: readonly IVec4[] = [zero, u, sumUV, v]
        const rk = canonicalCycleKey(rhVerts)
        if (!seenRhomb.has(rk)) {
          seenRhomb.add(rk)
          rhombiR4.push(rhVerts)
          rhombi.push(toSteps(rhVerts, cntRhomb))
        }
      } else if (dot === 0) {
        const sumUV: IVec4 = [u[0] + v[0], u[1] + v[1], u[2] + v[2], u[3] + v[3]]
        const sqVerts: readonly IVec4[] = [zero, u, sumUV, v]
        const maxAbs = Math.max(
          Math.abs(sumUV[0]),
          Math.abs(sumUV[1]),
          Math.abs(sumUV[2]),
          Math.abs(sumUV[3]),
        )
        const sk = canonicalCycleKey(sqVerts)
        if (maxAbs === 2) {
          if (!seenOct.has(sk)) {
            seenOct.add(sk)
            octSqsR4.push(sqVerts)
            octSqs.push(toSteps(sqVerts, cntOct))
          }
        } else {
          if (!seenDiag.has(sk)) {
            seenDiag.add(sk)
            diagSqsR4.push(sqVerts)
            diagSqs.push(toSteps(sqVerts, cntDiag))
          }
        }
      }
    }
  }

  for (let l = 0; l < 12; l++) {
    assert(cntTri[l] === cntTri[0], 'Non-uniform triangle-per-link count')
    assert(cntRhomb[l] === cntRhomb[0], 'Non-uniform rhombus-per-link count')
    assert(cntOct[l] === cntOct[0], 'Non-uniform octSq-per-link count')
    assert(cntDiag[l] === cntDiag[0], 'Non-uniform diagSq-per-link count')
  }

  return {
    rootsR4,
    posR4,
    posPrim,
    tris,
    rhombi,
    octSqs,
    diagSqs,
    trisR4,
    rhombiR4,
    octSqsR4,
    diagSqsR4,
    perLinkCounts: [cntTri[0]!, cntRhomb[0]!, cntOct[0]!, cntDiag[0]!],
  }
}

// Sparse half-BZ (k0 < pi) Cholesky integral c_L for pure Wilson on Z^4 or D_4
function computeZoneCLSparse(
  links: readonly IVec4[],
  plaqs: readonly (readonly LoopStep[])[],
  nGrid: number,
): { readonly cL: number; readonly fails: number } {
  const n = links.length
  const P = plaqs.length
  const half0 = nGrid >> 1
  assert(half0 * 2 === nGrid, `nGrid must be even for exact half-BZ symmetry, got ${nGrid}`)
  const total = half0 * nGrid * nGrid * nGrid
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)
  const gr = new Float64Array(n)
  const gi = new Float64Array(n)
  const stepR = new Float64Array(8)
  const stepI = new Float64Array(8)
  const stepL = new Int32Array(8)
  let cL = 0
  let fails = 0

  for (let i0 = 0; i0 < half0; i0++) {
    const k0 = (2 * PI * (i0 + 0.5)) / nGrid
    for (let i1 = 0; i1 < nGrid; i1++) {
      const k1 = (2 * PI * (i1 + 0.5)) / nGrid
      for (let i2 = 0; i2 < nGrid; i2++) {
        const k2 = (2 * PI * (i2 + 0.5)) / nGrid
        for (let i3 = 0; i3 < nGrid; i3++) {
          const k3 = (2 * PI * (i3 + 0.5)) / nGrid

          let g2 = 0
          for (let l = 0; l < n; l++) {
            const v = links[l]!
            const ph = k0 * v[0] + k1 * v[1] + k2 * v[2] + k3 * v[3]
            const r = Math.cos(ph) - 1
            const imv = Math.sin(ph)
            gr[l] = r
            gi[l] = imv
            g2 += r * r + imv * imv
          }

          for (let i = 0; i < n; i++) {
            for (let j = 0; j <= i; j++) {
              const sr = gr[i]! * gr[j]! + gi[i]! * gi[j]!
              const si = gi[i]! * gr[j]! - gr[i]! * gi[j]!
              re[i * n + j] = sr
              im[i * n + j] = si
              re[j * n + i] = sr
              im[j * n + i] = -si
            }
          }

          for (let p = 0; p < P; p++) {
            const loop = plaqs[p]!
            const m = loop.length
            for (let a = 0; a < m; a++) {
              const s = loop[a]!
              const b = s.base
              const ph = k0 * b[0] + k1 * b[1] + k2 * b[2] + k3 * b[3]
              stepL[a] = s.link
              stepR[a] = s.sign * Math.cos(ph)
              stepI[a] = s.sign * Math.sin(ph)
            }
            for (let a = 0; a < m; a++) {
              const la = stepL[a]!
              const ar = stepR[a]!
              const ai = -stepI[a]!
              for (let b = 0; b < m; b++) {
                const lb = stepL[b]!
                if (lb > la) continue
                const br = stepR[b]!
                const bi = stepI[b]!
                const idx = la * n + lb
                re[idx] = re[idx]! + (ar * br - ai * bi)
                im[idx] = im[idx]! + (ar * bi + ai * br)
              }
            }
          }
          for (let i = 0; i < n; i++) {
            for (let j = 0; j < i; j++) {
              re[j * n + i] = re[i * n + j]!
              im[j * n + i] = -im[i * n + j]!
            }
          }

          const ld = choleskyInPlace(n, re, im)
          if (!Number.isFinite(ld)) {
            fails++
            continue
          }
          cL += 2 * Math.log(g2) - ld
        }
      }
    }
  }
  return { cL: cL / (total - fails), fails }
}

type LatSpec = {
  readonly name: 'Z^4' | 'D_4'
  readonly n: number
  readonly f: number
  readonly nl: number
  readonly kp: number
  readonly kappa: number
  readonly cL: number
}

// Weighted excitation spectrum entry: action deficit s = 1 - Re Tr(g)/N (or generalized action s(g)) with multiplicity w
type SpectrumEntry = { readonly s: number; readonly w: number }

type FreezingResult = {
  readonly beta0: number
  readonly betaF: number
  readonly deficit: number
  readonly dil: number
  readonly bZ4Bare: number
  readonly bZ4TI: number
  readonly bZ4OneLoop: number
}

// High-beta logarithmic-bracket 1-loop freezing solver.
// CRITICAL PITFALL FIX: Always keep the LAST (largest beta) < 0 -> >= 0 crossing in [0.5, max(200, 30 * beta0)]
// rather than breaking on the first crossing, avoiding spurious strong-coupling artifacts at small delta_L.
// Scope note for L >= 1 word balls W_L (not finite subgroups):
//   Using the subgroup-order entropy proxy -lat.f * Math.log(|W_L|) upper-bounds the true non-group
//   vacuum multiplicity (#vac(W_L) <= |W_L|^V, since non-group link products need not close in W_L),
//   making the resulting freezing crossing beta_f a conservative lower bound on the pure-freeze coupling.
function solveFreezingWeighted(
  N: number,
  VsuN: number,
  order: number,
  spec: readonly SpectrumEntry[],
  lat: LatSpec,
  tadMult = 1.0,
): FreezingResult {
  const dG = N * N - 1
  const gauss = (b: number): number =>
    -lat.f * Math.log(VsuN) + 0.5 * dG * lat.f * Math.log((4 * PI * N) / b) + 0.5 * dG * lat.cL
  const frozen = (b: number): { readonly val: number; readonly dil: number } => {
    let z = 0
    for (let i = 0; i < spec.length; i++) {
      const e = spec[i]!
      z += e.w * Math.exp(-b * lat.nl * e.s)
    }
    return { val: -lat.f * Math.log(order) + lat.n * Math.log(z), dil: Math.log(z) }
  }
  const diff = (b: number): number => frozen(b).val - gauss(b)
  const beta0 = 4 * PI * N * Math.pow(order / VsuN, 2 / dG) * Math.exp(lat.cL / lat.f)

  const bMin = 0.5
  const bMax = Math.max(200, 30 * beta0)
  const steps = 4000
  const logMin = Math.log(bMin)
  const logStep = (Math.log(bMax) - logMin) / steps

  let prevB = bMin
  let prev = diff(prevB)
  let bracket: [number, number] | null = null
  for (let k = 1; k <= steps; k++) {
    const b = Math.exp(logMin + k * logStep)
    const cur = diff(b)
    if (prev < 0 && cur >= 0) {
      bracket = [prevB, b] // Do NOT break: keep the LAST (largest beta) crossing
    }
    prevB = b
    prev = cur
  }
  assert(
    bracket !== null,
    `No freezing crossing found on ${lat.name} for N=${N}, order=${order} in [${bMin}, ${bMax}]`,
  )
  let lo = bracket![0]
  let hi = bracket![1]
  for (let it = 0; it < 70; it++) {
    const m = 0.5 * (lo + hi)
    if (diff(m) >= 0) hi = m
    else lo = m
  }
  const betaF = 0.5 * (lo + hi)
  const deficit = (0.5 * dG * lat.kp) / betaF
  const plaq = 1 - deficit
  const gTISq = plaq > 0 ? (2 * N) / (lat.kappa * betaF * plaq) : NaN
  const bZ4Bare = lat.kappa * betaF
  const bZ4TI = Number.isFinite(gTISq) ? (2 * N) / gTISq + dG / 4 : NaN
  const bZ4OneLoop =
    lat.name === 'Z^4' ? betaF : 2 * betaF - 2 * N * (cTotD4SuN(N, tadMult) - cTotZ4SuN(N))
  return { beta0, betaF, deficit, dil: frozen(betaF).dil, bZ4Bare, bZ4TI, bZ4OneLoop }
}

function spectrumFromDeficits(deficits: readonly number[]): readonly SpectrumEntry[] {
  // Bucket identical deficits (quantized to 1e-12) for fast evaluation
  const counts = new Map<number, { sum: number; w: number }>()
  for (let i = 0; i < deficits.length; i++) {
    const s = deficits[i]!
    const key = Math.round(s * 1e11)
    const cur = counts.get(key)
    if (cur) {
      cur.sum += s
      cur.w += 1
    } else {
      counts.set(key, { sum: s, w: 1 })
    }
  }
  const out: SpectrumEntry[] = []
  for (const { sum, w } of counts.values()) {
    out.push({ s: sum / w, w })
  }
  return out
}

function evalPlaqFromSpectrum(spec: readonly SpectrumEntry[], beta: number): number {
  let num = 0
  let den = 0
  for (let i = 0; i < spec.length; i++) {
    const e = spec[i]!
    const wt = e.w * Math.exp(-beta * e.s)
    num += wt * (1 - e.s)
    den += wt
  }
  return num / den
}

// Exact SU(2) 1-plaquette Weyl integral: <cos(theta)> = I_2(beta) / I_1(beta)
function weylPlaqSU2(beta: number): number {
  const n = 256
  let num = 0
  let den = 0
  for (let i = 0; i < n; i++) {
    const th = (PI * (i + 0.5)) / n
    const c = Math.cos(th)
    const s = Math.sin(th)
    const w = s * s * Math.exp(-beta * (1 - c))
    num += w * c
    den += w
  }
  return num / den
}

// Exact SU(3) 1-plaquette Weyl integral on periodic [0, 2pi)^2 torus
function weylPlaqSU3Batch(betas: readonly number[]): readonly number[] {
  const nW = 80
  const num = new Float64Array(betas.length)
  const den = new Float64Array(betas.length)
  for (let i = 0; i < nW; i++) {
    const t1 = (2 * PI * (i + 0.19)) / nW
    const c1 = Math.cos(t1)
    for (let j = 0; j < nW; j++) {
      const t2 = (2 * PI * (j + 0.43)) / nW
      const c2 = Math.cos(t2)
      const t3 = -(t1 + t2)
      const c3 = Math.cos(t3)
      // |Delta(e^{i t1}, e^{i t2}, e^{i t3})|^2 = 64 * sin^2((t1-t2)/2) * sin^2((t1-t3)/2) * sin^2((t2-t3)/2)
      const s12 = Math.sin(0.5 * (t1 - t2))
      const s13 = Math.sin(0.5 * (t1 - t3))
      const s23 = Math.sin(0.5 * (t2 - t3))
      const haarW = s12 * s12 * s13 * s13 * s23 * s23
      const q = (c1 + c2 + c3) / 3
      const def = 1 - q
      for (let bi = 0; bi < betas.length; bi++) {
        const w = haarW * Math.exp(-betas[bi]! * def)
        num[bi] = num[bi]! + w * q
        den[bi] = den[bi]! + w
      }
    }
  }
  return betas.map((_, bi) => num[bi]! / den[bi]!)
}

// =================================================================================================
// PART 1 — GATE G1: EXACT BIGINT Z[zeta_9][1/6] ALGEBRAIC DENSITY PROOFS & HASSE-INVARIANT OBSTRUCTION
// =================================================================================================

// Bare M_meet DFS generators in SU(2) cap M_2(Z[omega][1/2])
const S12_EIS: EMat2 = { m00: [0n, -1n], m01: E_ZERO, m10: E_ZERO, m11: [1n, 1n], p: 0 }
const S23_EIS: EMat2 = { m00: [3n, 2n], m01: [-3n, 0n], m10: [3n, 0n], m11: [1n, -2n], p: 2 }
const J_EIS: EMat2 = { m00: E_ZERO, m01: E_ONE, m10: [-1n, 0n], m11: E_ZERO, p: 0 }

// Exact Z[zeta_9][1/3] generators of Sigma(648) and non-Clifford T_3
const Z9_Z1: Z9Frac = { c: [0n, 1n, 0n, 0n, 0n, 0n], p: 0 } // z = zeta_9
const Z9_Z2: Z9Frac = { c: [0n, 0n, 1n, 0n, 0n, 0n], p: 0 } // z^2
const Z9_W: Z9Frac = { c: [0n, 0n, 0n, 1n, 0n, 0n], p: 0 } // w = z^3
const Z9_W2: Z9Frac = { c: [-1n, 0n, 0n, -1n, 0n, 0n], p: 0 } // w^2 = -1 - z^3
const Z9_Z8: Z9Frac = { c: [0n, 0n, -1n, 0n, 0n, -1n], p: 0 } // z^-1 = z^8 = -z^2 - z^5
// 1 / (i sqrt(3)) = -(1 + 2 w) / 3 since w - w^2 = 1 + 2 z^3 = i sqrt(3)
const Z9_INV_ISQ3: Z9Frac = { c: [-1n, 0n, 0n, -2n, 0n, 0n], p: 1 }
const Z9_INV_ISQ3_W = z9Mul(Z9_INV_ISQ3, Z9_W)
const Z9_INV_ISQ3_W2 = z9Mul(Z9_INV_ISQ3, Z9_W2)

const CLOCK_Z9: Z9Mat3 = [Z9_ONE, Z9_ZERO, Z9_ZERO, Z9_ZERO, Z9_W, Z9_ZERO, Z9_ZERO, Z9_ZERO, Z9_W2]
const SHIFT_Z9: Z9Mat3 = [Z9_ZERO, Z9_ZERO, Z9_ONE, Z9_ONE, Z9_ZERO, Z9_ZERO, Z9_ZERO, Z9_ONE, Z9_ZERO]
const PHASE_T_Z9: Z9Mat3 = [Z9_Z8, Z9_ZERO, Z9_ZERO, Z9_ZERO, Z9_Z8, Z9_ZERO, Z9_ZERO, Z9_ZERO, Z9_Z2]
const HESS_V_Z9: Z9Mat3 = [
  Z9_INV_ISQ3,
  Z9_INV_ISQ3,
  Z9_INV_ISQ3,
  Z9_INV_ISQ3,
  Z9_INV_ISQ3_W,
  Z9_INV_ISQ3_W2,
  Z9_INV_ISQ3,
  Z9_INV_ISQ3_W2,
  Z9_INV_ISQ3_W,
]
const T3_Z9: Z9Mat3 = [Z9_ONE, Z9_ZERO, Z9_ZERO, Z9_ZERO, Z9_Z1, Z9_ZERO, Z9_ZERO, Z9_ZERO, Z9_Z8]

function z9ToComplex(x: Z9Frac): readonly [number, number] {
  const inv = 1 / Math.pow(3, x.p)
  let re = 0
  let im = 0
  for (let k = 0; k < 6; k++) {
    const ck = Number(x.c[k]!)
    if (ck === 0) continue
    const th = (2 * PI * k) / 9
    re += ck * Math.cos(th)
    im += ck * Math.sin(th)
  }
  return [re * inv, im * inv]
}

function z9Mat3ToM3(A: Z9Mat3): M3 {
  const out = new Float64Array(18)
  for (let idx = 0; idx < 9; idx++) {
    const c = z9ToComplex(A[idx]!)
    out[idx * 2] = c[0]
    out[idx * 2 + 1] = c[1]
  }
  return out
}

// Exact SU(2) quaternion generators
const Q_I: Quat = [0, 1, 0, 0]
const Q_J: Quat = [0, 0, 1, 0]
const Q_2T: Quat = [0.5, 0.5, 0.5, 0.5]
const Q_2I: Quat = [0.5 * ((1 + SQRT5) / 2), 0.5 / ((1 + SQRT5) / 2), 0.5, 0]

function runPart1(): {
  readonly g2T: readonly Quat[]
  readonly g2I: readonly Quat[]
  readonly gDic3: readonly Quat[]
  readonly qS12: Quat
  readonly qS23: Quat
  readonly qWbare: Quat
  readonly gS648: readonly M3[]
  readonly mClock: M3
  readonly mShift: M3
  readonly mHessV: M3
  readonly mPhaseT: M3
  readonly mT3: M3
} {
  console.log('\n=================================================================================')
  console.log('PART 1 (GATE G1, Tier A): EXACT BIGINT Z[zeta_9][1/6] DENSITY & HASSE OBSTRUCTION')
  console.log('=================================================================================')

  // 1A. SU(2)_L exact BigInt Z[omega][1/2] verification
  const s12Unit = isIdE2(mulE2(dagE2(S12_EIS), S12_EIS))
  const s23Unit = isIdE2(mulE2(dagE2(S23_EIS), S23_EIS))
  const jUnit = isIdE2(mulE2(dagE2(J_EIS), J_EIS))
  const detS12 = eSub(eMul(S12_EIS.m00, S12_EIS.m11), eMul(S12_EIS.m01, S12_EIS.m10))
  const detS23 = eSub(eMul(S23_EIS.m00, S23_EIS.m11), eMul(S23_EIS.m01, S23_EIS.m10))
  const detJ = eSub(eMul(J_EIS.m00, J_EIS.m11), eMul(J_EIS.m01, J_EIS.m10))
  assert(s12Unit && s23Unit && jUnit, 'S_12, S_23, J unitarity failed in exact BigInt Z[w][1/2]')
  assert(eEq(detS12, [1n, 0n]) && eEq(detS23, [16n, 0n]) && eEq(detJ, [1n, 0n]), 'det=1 failed in Z[w][1/2]')

  const W12_EIS = mulE2(S12_EIS, S23_EIS)
  const trW12 = eAdd(W12_EIS.m00, W12_EIS.m11)
  const trExact54 = W12_EIS.p === 2 && eEq(trW12, [5n, 0n])
  assert(trExact54, `Tr(S_12 S_23) expected 5/4, got (${trW12[0]}+${trW12[1]}w)/2^${W12_EIS.p}`)

  let wPow = W12_EIS
  let anyPowId = false
  const pSeries: number[] = [wPow.p]
  for (let k = 2; k <= 24; k++) {
    wPow = mulE2(wPow, W12_EIS)
    if (isIdE2(wPow)) anyPowId = true
    pSeries.push(wPow.p)
  }
  assert(!anyPowId && wPow.p > 20, `Expected non-periodic dyadic valuation p > 20 at k=24, got p=${wPow.p}`)
  console.log(
    `  [SU(2) Z[w][1/2]] S_12, S_23 in SU(2) cap M_2(Z[w][1/2]): Tr(S_12 S_23) = ${trW12[0]}/${1 << W12_EIS.p} (exact 5/4), ` +
      `v_2 denom at k=1..24 grows to 2^${wPow.p} (no identity power)`,
  )

  // Close 2T (order 24), 2I (order 120) and verify FP_2(2T) = 2 (Ad(2T) irreducibility of su(2))
  const g2T = closeQuatGroup([Q_I, Q_J, Q_2T], 40)
  const g2I = closeQuatGroup([Q_I, Q_J, Q_2T, Q_2I], 200)
  assert(g2T.length === 24 && g2I.length === 120, '2T/2I group order mismatch')
  let fp2Num2T = 0
  for (const q of g2T) {
    const tr = 2 * q[0]
    fp2Num2T += tr * tr * tr * tr
  }
  const fp2_2T = fp2Num2T / g2T.length
  assertClose(fp2_2T, 2.0, 1e-12, 'FP_2(2T)')
  console.log(`  [SU(2) 2T] |2T|=${g2T.length}, FP_2(2T)=${fp2_2T.toFixed(6)} === 2 (exact Ad(2T) irreducibility of su(2))`)

  // 1B. Honest Hasse-Invariant / Hilbert-Symbol Obstruction for 2T in M_2(Q(zeta_9))
  // SU(2) cap M_2(Q(zeta_9)) spans the K^+-quaternion algebra (-3, -1)_{K^+} where K^+ = Q(zeta_9)^+ = Q(z + z^-1).
  // 2T contains Q_8 = <i, j>, which spans (-1, -1)_{K^+}.
  // Over Q_3:
  //   - (-1, -1)_3 = +1: x^2 + y^2 + z^2 == 0 (mod 3) has primitive solution (1, 1, 1) -> Hensel lifts to Q_3.
  //   - (-3, -1)_3 = (-1/3) = -1: x^2 + z^2 + 3 y^2 == 0 (mod 9) has ZERO primitive solutions in (Z/9Z)^3.
  let hasPrimSol_m1m1 = false
  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      for (let z = 0; z < 3; z++) {
        if (x === 0 && y === 0 && z === 0) continue
        if ((x * x + y * y + z * z) % 3 === 0) hasPrimSol_m1m1 = true
      }
    }
  }
  let hasPrimSol_m3m1 = false
  for (let x = 0; x < 9; x++) {
    for (let y = 0; y < 9; y++) {
      for (let z = 0; z < 9; z++) {
        if (x % 3 === 0 && y % 3 === 0 && z % 3 === 0) continue
        if ((x * x + z * z + 3 * y * y) % 9 === 0) hasPrimSol_m3m1 = true
      }
    }
  }
  const hilbert_m1_m1_at3 = hasPrimSol_m1m1 ? 1 : -1
  const hilbert_m3_m1_at3 = hasPrimSol_m3m1 ? 1 : -1
  assert(hilbert_m1_m1_at3 === 1 && hilbert_m3_m1_at3 === -1, 'Hilbert symbol obstruction check failed at p=3')

  // Verify [Q(zeta_9)^+ : Q] = 3 (odd) via exact BigInt minimal polynomial of alpha = z + z^-1 = 2 cos(2pi/9)
  // alpha^3 - 3 alpha + 1 = 0, irreducible over Q (no root at +-1), disc = 81 = 3^4 (3 totally ramified, local degree 3 odd).
  const alphaReal = z9Add(Z9_Z1, Z9_Z8)
  const alpha2 = z9Mul(alphaReal, alphaReal)
  const alpha3 = z9Mul(alpha2, alphaReal)
  const threeAlpha = z9Add(z9Add(alphaReal, alphaReal), alphaReal)
  const minPolyVal = z9Add(z9Sub(alpha3, threeAlpha), Z9_ONE)
  assert(z9Eq(minPolyVal, Z9_ZERO), 'alpha = z + z^-1 failed minimal polynomial alpha^3 - 3 alpha + 1 = 0')
  const hasRatRoot = 1 - 3 + 1 === 0 || -1 + 3 + 1 === 0
  const kPlusDeg = 3
  assert(!hasRatRoot && kPlusDeg % 2 === 1, 'Q(zeta_9)^+ degree must be odd (3)')

  // Verify exact closure of Dic_3 = <S_12, J> (order 12) strictly in SU(2) cap M_2(Z[omega]) (p === 0, zero sqrt(-1))
  const dic3Map = new Map<string, EMat2>([[keyE2({ m00: E_ONE, m01: E_ZERO, m10: E_ZERO, m11: E_ONE, p: 0 }), { m00: E_ONE, m01: E_ZERO, m10: E_ZERO, m11: E_ONE, p: 0 }]])
  const dic3Queue: EMat2[] = [{ m00: E_ONE, m01: E_ZERO, m10: E_ZERO, m11: E_ONE, p: 0 }]
  let dh = 0
  while (dh < dic3Queue.length && dic3Map.size <= 24) {
    const cur = dic3Queue[dh++]!
    for (const g of [S12_EIS, J_EIS]) {
      const nxt = mulE2(cur, g)
      const k = keyE2(nxt)
      if (!dic3Map.has(k)) {
        dic3Map.set(k, nxt)
        dic3Queue.push(nxt)
      }
    }
  }
  const dic3Eis = Array.from(dic3Map.values())
  const dic3AllIntegral = dic3Eis.every(m => m.p === 0 && isIdE2(mulE2(dagE2(m), m)))
  assert(dic3Eis.length === 12 && dic3AllIntegral, `Dic_3 strict Z[w] closure failed: order=${dic3Eis.length}`)
  const gDic3 = dic3Eis.map(eMat2ToQuat)
  const qS12 = eMat2ToQuat(S12_EIS)
  const qS23 = eMat2ToQuat(S23_EIS)
  const qWbare = eMat2ToQuat(W12_EIS)
  console.log(
    `  [Hasse Obstruction] (-3,-1)_3=${hilbert_m3_m1_at3} != (+1)=(-1,-1)_3, [Q(zeta_9)^+:Q]=${kPlusDeg} (odd, x^3-3x+1=0, disc=3^4): ` +
      `2T cannot embed in SU(2) cap M_2(Q(zeta_9)) (needs Z[zeta_12][1/2]), whereas Dic_3=<S_12,J> (|Dic_3|=${dic3Eis.length}, p=0) embeds strictly in SU(2) cap M_2(Z[w])`,
  )

  // 1C. SU(3)_C exact BigInt Z[zeta_9][1/3] verification (zero sqrt(-1), zero sqrt(5))
  const su3GensZ9: readonly [string, Z9Mat3][] = [
    ['CLOCK', CLOCK_Z9],
    ['SHIFT', SHIFT_Z9],
    ['HESS_V', HESS_V_Z9],
    ['PHASE_T', PHASE_T_Z9],
    ['T_3', T3_Z9],
  ]
  for (const [name, mat] of su3GensZ9) {
    assert(z9mIsId(z9mMul(z9mDag(mat), mat)), `${name} failed exact Z[zeta_9][1/3] unitarity`)
    assert(z9Eq(z9mDet(mat), Z9_ONE), `${name} failed exact Z[zeta_9][1/3] det === 1`)
  }

  const VT3_Z9 = z9mMul(HESS_V_Z9, T3_Z9)
  const trVT3 = z9mTr(VT3_Z9)
  const expectedTr: Z9Frac = { c: [-1n, 2n, -1n, -2n, 1n, -2n], p: 1 }
  assert(
    z9Eq(trVT3, expectedTr),
    `Tr(V T_3) mismatch: got (${trVT3.c.join(', ')})/3^${trVT3.p}`,
  )
  const normTrVT3 = z9Norm(trVT3)
  assert(
    normTrVT3.num === 1n && normTrVT3.den === 3n,
    `z9Norm(Tr(V T_3)) expected 1/3, got ${normTrVT3.num}/${normTrVT3.den}`,
  )
  const trAdVT3 = z9Sub(z9Mul(trVT3, z9Conj(trVT3)), Z9_ONE)
  const normTrAdVT3 = z9Norm(trAdVT3)
  assert(
    normTrAdVT3.num === 1n && normTrAdVT3.den === 9n,
    `z9Norm(Tr(Ad(V T_3))) expected 1/9, got ${normTrAdVT3.num}/${normTrAdVT3.den}`,
  )

  // Exact field norm denominator 3^k with coprime numerator for k = 1..12 (infinite order proof)
  let powM = VT3_Z9
  let allKCoprime = true
  const kSummary: string[] = []
  for (let k = 1; k <= 12; k++) {
    if (k > 1) powM = z9mMul(powM, VT3_Z9)
    const trk = z9mTr(powM)
    const nk = z9Norm(trk)
    const expDen = z9Pow3(k)
    const ok = nk.den === expDen && nk.num % 3n !== 0n && nk.num > 0n
    if (!ok) allKCoprime = false
    assert(ok, `k=${k}: expected den=3^${k}=${expDen} and 3 !| num, got ${nk.num}/${nk.den}`)
    if (k <= 4 || k === 12) {
      kSummary.push(`k=${k}: ${nk.num}/3^${k}`)
    }
  }

  // Close Sigma(648) in Float64Array(18) from exact Z[zeta_9][1/3] generators and verify FP_2(Sigma(648)) === 2
  const mClock = z9Mat3ToM3(CLOCK_Z9)
  const mShift = z9Mat3ToM3(SHIFT_Z9)
  const mHessV = z9Mat3ToM3(HESS_V_Z9)
  const mPhaseT = z9Mat3ToM3(PHASE_T_Z9)
  const mT3 = z9Mat3ToM3(T3_Z9)
  const gS648 = closeM3Group([mClock, mShift, mHessV, mPhaseT], 700)
  assert(gS648.length === 648, `Expected |Sigma(648)| = 648, got ${gS648.length}`)

  let fp2S648Sum = 0
  let chi8Sum = 0
  let chi8SqSum = 0
  for (const M of gS648) {
    const trRe = M[0]! + M[8]! + M[16]!
    const trIm = M[1]! + M[9]! + M[17]!
    const abs2 = trRe * trRe + trIm * trIm
    fp2S648Sum += abs2 * abs2
    const chi8 = abs2 - 1
    chi8Sum += chi8
    chi8SqSum += chi8 * chi8
  }
  const fp2_S648 = fp2S648Sum / gS648.length
  const chi8Mean = chi8Sum / gS648.length
  const chi8NormSq = chi8SqSum / gS648.length
  assertClose(fp2_S648, 2.0, 1e-11, 'FP_2(Sigma(648))')
  assertClose(chi8Mean, 0.0, 1e-11, '<1, chi_8>_{Sigma(648)}')
  assertClose(chi8NormSq, 1.0, 1e-11, '<chi_8, chi_8>_{Sigma(648)}')

  console.log(
    `  [SU(3) Z[zeta_9][1/3]] CLOCK,SHIFT,HESS_V,PHASE_T,T_3 in SU(3) cap M_3(Z[zeta_9][1/3]): ` +
      `Tr(V T_3) = (-1+2z-z^2-2z^3+z^4-2z^5)/3`,
  )
  console.log(
    `  [SU(3) Field Norms] N(Tr(V T_3))=${normTrVT3.num}/${normTrVT3.den}, N(Tr(Ad(V T_3)))=${normTrAdVT3.num}/${normTrAdVT3.den}, ` +
      `k=1..12 exact den 3^k (${kSummary.join(', ')})`,
  )
  console.log(
    `  [SU(3) Ad Irred] |Sigma(648)|=${gS648.length}, FP_2(Sigma(648))=${fp2_S648.toFixed(6)}, ` +
      `<chi_8,chi_8>=${chi8NormSq.toFixed(6)} => closure(<Sigma(648), T_3>) = SU(3) (exact BigInt generators/norms + Float64 Sigma(648) character check)`,
  )

  const g1Ok =
    s12Unit &&
    s23Unit &&
    trExact54 &&
    !anyPowId &&
    wPow.p > 20 &&
    Math.abs(fp2_2T - 2) < 1e-12 &&
    hilbert_m3_m1_at3 === -1 &&
    hilbert_m1_m1_at3 === 1 &&
    dic3Eis.length === 12 &&
    dic3AllIntegral &&
    normTrVT3.num === 1n &&
    normTrVT3.den === 3n &&
    normTrAdVT3.num === 1n &&
    normTrAdVT3.den === 9n &&
    allKCoprime &&
    Math.abs(fp2_S648 - 2) < 1e-11 &&
    Math.abs(chi8NormSq - 1) < 1e-11

  recordGate(
    'G1',
    'Tier A',
    'Exact BigInt Z[zeta_9][1/6] algebraic density proofs & Hasse-invariant obstruction',
    g1Ok,
    `SU(2): Tr(S12 S23)=5/4, p(k=24)=${wPow.p}, FP_2(2T)=2, Hasse (-3,-1)_3=-1 vs Dic_3(12) in Z[w]; ` +
      `SU(3): N(Tr(VT3))=1/3, N(Tr(Ad))=1/9, k=1..12 den=3^k, FP_2(Sigma(648))=2`,
  )

  return {
    g2T,
    g2I,
    gDic3,
    qS12,
    qS23,
    qWbare,
    gS648,
    mClock,
    mShift,
    mHessV,
    mPhaseT,
    mT3,
  }
}

// =================================================================================================
// PART 2 — GATE G2: SU(2)_L DENSE CYCLOTOMIC LADDERS (2T + W_bare & STRICT Z[w][1/2] Dic_3 + S_23)
// =================================================================================================

// Exact O(|W|) multinomial frame potentials FP_1..4 on SU(2) = S^3:
// FP_t(W) = 4^t * sum_{a+b+c+d=2t} [(2t)!/(a!b!c!d!)] * ( (1/|W|) sum_{q in W} q0^a q1^b q2^c q3^d )^2
const FACT: readonly number[] = [1, 1, 2, 6, 24, 120, 720, 5040, 40320]

function computeSU2FramePotentials(W: readonly Quat[]): readonly [number, number, number, number] {
  const n = W.length
  const invN = 1 / n
  // Precompute powers q_i^k for k=0..8
  const out: number[] = []
  for (let t = 1; t <= 4; t++) {
    const deg = 2 * t
    const fDeg = FACT[deg]!
    const tuples: [number, number, number, number, number][] = []
    for (let a = 0; a <= deg; a++) {
      for (let b = 0; b <= deg - a; b++) {
        for (let c = 0; c <= deg - a - b; c++) {
          const d = deg - a - b - c
          const coeff = fDeg / (FACT[a]! * FACT[b]! * FACT[c]! * FACT[d]!)
          tuples.push([a, b, c, d, coeff])
        }
      }
    }
    const sums = new Float64Array(tuples.length)
    for (let i = 0; i < n; i++) {
      const q = W[i]!
      const p0 = [1, q[0], 0, 0, 0, 0, 0, 0, 0]
      const p1 = [1, q[1], 0, 0, 0, 0, 0, 0, 0]
      const p2 = [1, q[2], 0, 0, 0, 0, 0, 0, 0]
      const p3 = [1, q[3], 0, 0, 0, 0, 0, 0, 0]
      for (let k = 2; k <= deg; k++) {
        p0[k] = p0[k - 1]! * q[0]
        p1[k] = p1[k - 1]! * q[1]
        p2[k] = p2[k - 1]! * q[2]
        p3[k] = p3[k - 1]! * q[3]
      }
      for (let m = 0; m < tuples.length; m++) {
        const tp = tuples[m]!
        sums[m] = sums[m]! + p0[tp[0]]! * p1[tp[1]]! * p2[tp[2]]! * p3[tp[3]]!
      }
    }
    let fp = 0
    for (let m = 0; m < tuples.length; m++) {
      const avg = sums[m]! * invN
      fp += tuples[m]![4] * avg * avg
    }
    out.push(Math.pow(4, t) * fp)
  }
  return [out[0]!, out[1]!, out[2]!, out[3]!]
}

// Peter-Weyl integer-spin character averages <chi_j> = <U_{2j}(q0)> for j = 1..4
function computeSU2PeterWeyl(W: readonly Quat[]): readonly [number, number, number, number] {
  let s1 = 0
  let s2 = 0
  let s3 = 0
  let s4 = 0
  for (let i = 0; i < W.length; i++) {
    const x = W[i]![0]
    const x2 = x * x
    const x4 = x2 * x2
    const x6 = x4 * x2
    const x8 = x4 * x4
    s1 += 4 * x2 - 1
    s2 += 16 * x4 - 12 * x2 + 1
    s3 += 64 * x6 - 80 * x4 + 24 * x2 - 1
    s4 += 256 * x8 - 448 * x6 + 240 * x4 - 40 * x2 + 1
  }
  const inv = 1 / W.length
  return [s1 * inv, s2 * inv, s3 * inv, s4 * inv]
}

// Build deterministic 4,096-point (16 x 16 x 16) equal-volume Hopf grid on S^3 = SU(2)
function buildHopf4096(): readonly Quat[] {
  const n = 16
  const pts: Quat[] = []
  for (let i = 0; i < n; i++) {
    const u = (i + 0.5) / n
    const cEta = Math.sqrt(u)
    const sEta = Math.sqrt(1 - u)
    for (let j = 0; j < n; j++) {
      const xi1 = (2 * PI * (j + 0.5)) / n
      const c1 = Math.cos(xi1)
      const s1 = Math.sin(xi1)
      for (let k = 0; k < n; k++) {
        const xi2 = (2 * PI * (k + 0.5)) / n
        pts.push([cEta * c1, cEta * s1, sEta * Math.cos(xi2), sEta * Math.sin(xi2)])
      }
    }
  }
  return pts
}

// Geodesic covering radius eps_L = max_{p in Hopf4096} min_{q in W} acos(clamp(q . p, -1, 1))
// Uses -I antipodal symmetry (W = -W) for 2x speedup: max_{q in W} (q . p) = max_{q in W/+-1} |q . p|.
function computeSU2CoveringRadius(W: readonly Quat[], hopf: readonly Quat[]): number {
  // Keep one representative per +-q pair
  const half: number[] = []
  for (let i = 0; i < W.length; i++) {
    const q = W[i]!
    const firstNonZero =
      Math.abs(q[0]) > 1e-9
        ? q[0]
        : Math.abs(q[1]) > 1e-9
          ? q[1]
          : Math.abs(q[2]) > 1e-9
            ? q[2]
            : q[3]
    if (firstNonZero > 0) {
      half.push(q[0], q[1], q[2], q[3])
    }
  }
  const flat = Float64Array.from(half)
  const m = flat.length >> 2
  let minMaxDot = 1.0
  for (let i = 0; i < hopf.length; i++) {
    const p = hopf[i]!
    const p0 = p[0]
    const p1 = p[1]
    const p2 = p[2]
    const p3 = p[3]
    let bestDot = 0
    for (let j = 0; j < m; j++) {
      const idx = j << 2
      const dot = Math.abs(
        flat[idx]! * p0 + flat[idx + 1]! * p1 + flat[idx + 2]! * p2 + flat[idx + 3]! * p3,
      )
      if (dot > bestDot) bestDot = dot
    }
    if (bestDot < minMaxDot) minMaxDot = bestDot
  }
  return Math.acos(Math.min(1, Math.max(-1, minMaxDot)))
}

type SU2LadderLevel = {
  readonly L: number
  readonly cosets: readonly Quat[]
  readonly elems: readonly Quat[]
  readonly elemKeys: ReadonlySet<string>
  readonly spec: readonly SpectrumEntry[]
  readonly deltaL: number
  readonly fp: readonly [number, number, number, number]
  readonly pw: readonly [number, number, number, number]
  readonly epsL: number | null
  readonly z4: FreezingResult
  readonly d4: FreezingResult
}

// Build SU(2) dense ladder W_L = union_{k<=L} (G_0 T^{+-1})^k G_0 by right-G_0 left-coset BFS
function buildSU2Ladder(
  G0: readonly Quat[],
  T: Quat,
  maxL: number,
  latZ4: LatSpec,
  latD4: LatSpec,
  hopf: readonly Quat[] | null,
): readonly SU2LadderLevel[] {
  // Zero-allocation numeric lexicographical coset canonicalizer (allocates only 1 string per call)
  const cosetKey = (q: Quat): string => {
    const scale = 1e5
    const bias = 0.137291
    let b0 = 0
    let b1 = 0
    let b2 = 0
    let b3 = 0
    const q0 = q[0]
    const q1 = q[1]
    const q2 = q[2]
    const q3 = q[3]
    for (let i = 0; i < G0.length; i++) {
      const g = G0[i]!
      const g0 = g[0]
      const g1 = g[1]
      const g2 = g[2]
      const g3 = g[3]
      const k0 = Math.round((q0 * g0 - q1 * g1 - q2 * g2 - q3 * g3) * scale + bias)
      const k1 = Math.round((q0 * g1 + q1 * g0 + q2 * g3 - q3 * g2) * scale + bias)
      const k2 = Math.round((q0 * g2 - q1 * g3 + q2 * g0 + q3 * g1) * scale + bias)
      const k3 = Math.round((q0 * g3 + q1 * g2 - q2 * g1 + q3 * g0) * scale + bias)
      if (
        i === 0 ||
        k0 < b0 ||
        (k0 === b0 && (k1 < b1 || (k1 === b1 && (k2 < b2 || (k2 === b2 && k3 < b3)))))
      ) {
        b0 = k0
        b1 = k1
        b2 = k2
        b3 = k3
      }
    }
    return `${b0},${b1},${b2},${b3}`
  }

  // Distinct left cosets in G_0 T G_0 union G_0 T^-1 G_0
  const genMap = new Map<string, Quat>()
  const Tinv = qConj(T)
  for (const tElem of [T, Tinv]) {
    for (const h of G0) {
      const c = qMul(h, tElem)
      const ck = cosetKey(c)
      if (!genMap.has(ck)) genMap.set(ck, c)
    }
  }
  const cosetGens = Array.from(genMap.values())

  const seenCosets = new Map<string, Quat>([[cosetKey(Q_ID), Q_ID]])
  let frontier: Quat[] = [Q_ID]
  const levels: SU2LadderLevel[] = []

  for (let L = 0; L <= maxL; L++) {
    if (L > 0) {
      const nextFrontier: Quat[] = []
      for (const c of frontier) {
        for (const e of cosetGens) {
          const nxt = qMul(c, e)
          const ck = cosetKey(nxt)
          if (!seenCosets.has(ck)) {
            seenCosets.set(ck, nxt)
            nextFrontier.push(nxt)
          }
        }
      }
      frontier = nextFrontier
    }

    const cosets = Array.from(seenCosets.values())
    const elems: Quat[] = []
    const elemKeys = new Set<string>()
    const deficits: number[] = []
    let deltaL = Infinity
    for (const c of cosets) {
      for (const g of G0) {
        const u = qMul(c, g)
        elems.push(u)
        elemKeys.add(qKey(u))
        const def = 1 - u[0]
        deficits.push(def)
        if (def > 1e-9 && def < deltaL) deltaL = def
      }
    }
    assert(
      elemKeys.size === cosets.length * G0.length,
      `SU(2) coset expansion collision at L=${L}: unique=${elemKeys.size} vs ${cosets.length * G0.length}`,
    )

    const spec = spectrumFromDeficits(deficits)
    const fp = computeSU2FramePotentials(elems)
    const pw = computeSU2PeterWeyl(elems)
    const epsL = hopf !== null ? computeSU2CoveringRadius(elems, hopf) : null
    // For L >= 1, W_L is a bi-G_0-invariant word ball (not a finite subgroup); -lat.f * ln(|W_L|)
    // uses the subgroup-order entropy proxy (#vac(W_L) <= |W_L|^V), a conservative lower bound on pure-freeze beta_f.
    const z4 = solveFreezingWeighted(2, V_SU2, elems.length, spec, latZ4)
    const d4 = solveFreezingWeighted(2, V_SU2, elems.length, spec, latD4)

    levels.push({ L, cosets, elems, elemKeys, spec, deltaL, fp, pw, epsL, z4, d4 })
  }

  return levels
}

function runPart2(
  g2T: readonly Quat[],
  g2I: readonly Quat[],
  gDic3: readonly Quat[],
  qWbare: Quat,
  qS23: Quat,
  latZ4: LatSpec,
  latD4: LatSpec,
): {
  readonly ladder2T: readonly SU2LadderLevel[]
  readonly ladderDic3: readonly SU2LadderLevel[]
  readonly r2I_D4: FreezingResult
} {
  console.log('\n=================================================================================')
  console.log('PART 2 (GATE G2, Tier A+B): SU(2)_L DENSE CYCLOTOMIC LADDERS (2T+W_bare & Dic_3+S_23)')
  console.log('=================================================================================')

  const hopf = buildHopf4096()
  const ladder2T = buildSU2Ladder(g2T, qWbare, 2, latZ4, latD4, hopf)
  const ladderDic3 = buildSU2Ladder(gDic3, qS23, 3, latZ4, latD4, null)

  // Reference 2I (order 120)
  const spec2I = spectrumFromDeficits(g2I.map(q => 1 - q[0]))
  const r2I_D4 = solveFreezingWeighted(2, V_SU2, g2I.length, spec2I, latD4)
  const r2I_Z4 = solveFreezingWeighted(2, V_SU2, g2I.length, spec2I, latZ4)
  const eps2I = computeSU2CoveringRadius(g2I, hopf)
  console.log(
    `  [Ref 2I(120)] eps=${eps2I.toFixed(4)}, Z4 beta_f=${r2I_Z4.betaF.toFixed(3)}, D4 beta_f=${r2I_D4.betaF.toFixed(3)} (GUT req=${BETA_D4_GUT_SU2})`,
  )

  console.log('\n  --- Ladder A: 2T + W_bare (Z[zeta_12][1/2], L=0..2) ---')
  for (const lv of ladder2T) {
    console.log(
      `  L=${lv.L}: |W|=${String(lv.elems.length).padStart(5)} (${lv.cosets.length} cosets) | ` +
        `delta=${lv.deltaL.toFixed(5)} | eps=${lv.epsL!.toFixed(4)} | ` +
        `FP=[${lv.fp.map(x => x.toFixed(4)).join(', ')}] | ` +
        `D4 beta_f=${lv.d4.betaF.toFixed(3)} (Z4=${lv.z4.betaF.toFixed(3)})`,
    )
    console.log(
      `       Peter-Weyl <chi_1..4> = [${lv.pw.map(x => x.toExponential(2)).join(', ')}]`,
    )
  }

  // Exact 1-plaquette Weyl comparison for SU(2) at b = 2, 5, 10, 20, 40, 80
  const su2Betas = [2, 5, 10, 20, 40, 80] as const
  console.log('\n  --- SU(2) Exact 1-Plaquette Comparison (2T, 2I, W_1, W_2 vs Continuum Weyl) ---')
  let errW2At80 = 0
  let plaq2TAt40 = 0
  for (const b of su2Betas) {
    const w = weylPlaqSU2(b)
    const p2T = evalPlaqFromSpectrum(ladder2T[0]!.spec, b)
    const p2I = evalPlaqFromSpectrum(spec2I, b)
    const pW1 = evalPlaqFromSpectrum(ladder2T[1]!.spec, b)
    const pW2 = evalPlaqFromSpectrum(ladder2T[2]!.spec, b)
    if (b === 80) errW2At80 = Math.abs(pW2 - w)
    if (b === 40) plaq2TAt40 = p2T
    console.log(
      `  beta=${String(b).padStart(2)}: Weyl=${w.toFixed(6)} | 2T=${p2T.toFixed(6)} | 2I=${p2I.toFixed(6)} | ` +
        `W_1=${pW1.toFixed(6)} | W_2=${pW2.toFixed(6)} (|W_2-Weyl|=${Math.abs(pW2 - w).toExponential(2)})`,
    )
  }

  console.log('\n  --- Ladder B: Strict Z[omega][1/2] Dic_3 + S_23 (zero sqrt(-1), L=0..3) ---')
  const expectedDic3Sizes = [12, 156, 1596, 15996] as const
  for (const lv of ladderDic3) {
    const exactFormula = 12 * (1 + (4 / 3) * (Math.pow(10, lv.L) - 1))
    assert(
      lv.elems.length === expectedDic3Sizes[lv.L] && lv.elems.length === Math.round(exactFormula),
      `Dic_3+S_23 size mismatch at L=${lv.L}: got ${lv.elems.length}`,
    )
    const pAt20 = evalPlaqFromSpectrum(lv.spec, 20)
    const wAt20 = weylPlaqSU2(20)
    console.log(
      `  L=${lv.L}: |W|=${String(lv.elems.length).padStart(5)} (exact 12*(1+4/3*(10^${lv.L}-1))) | ` +
        `delta=${lv.deltaL.toFixed(5)} | FP=[${lv.fp.map(x => x.toFixed(4)).join(', ')}] | ` +
        `plaq(20)=${pAt20.toFixed(5)} (Weyl=${wAt20.toFixed(5)}) | D4 beta_f=${lv.d4.betaF.toFixed(3)}`,
    )
  }

  console.log(
    '  [Scope Note] For L >= 1, W_L is a bi-G_0-invariant word ball (not a finite subgroup); solveFreezingWeighted uses\n' +
      '               the 1-loop subgroup-order entropy proxy -lat.f * ln(|W_L|) (#vac(W_L) <= |W_L|^V, conservative lower bound on pure-freeze beta_f).',
  )

  const w0 = ladder2T[0]!
  const w1 = ladder2T[1]!
  const w2 = ladder2T[2]!
  const d1 = ladderDic3[1]!
  const d2 = ladderDic3[2]!
  const d3 = ladderDic3[3]!

  const g2Ok =
    w0.elems.length === 24 &&
    w1.elems.length === 600 &&
    w2.elems.length === 13848 &&
    w1.d4.betaF > BETA_D4_GUT_SU2 &&
    w2.d4.betaF > 75 &&
    w2.epsL! < 0.2 &&
    w1.epsL! > 0.2 &&
    w1.epsL! < 0.5 &&
    w0.epsL! > 0.5 &&
    Math.abs(w2.fp[2] - 5) < 0.001 &&
    Math.abs(w2.fp[3] - 14) < 0.01 &&
    errW2At80 < 0.01 &&
    plaq2TAt40 > 0.9999 &&
    d1.elems.length === 156 &&
    d2.elems.length === 1596 &&
    d3.elems.length === 15996 &&
    d1.d4.betaF > r2I_D4.betaF &&
    d2.d4.betaF > BETA_D4_GUT_SU2

  recordGate(
    'G2',
    'Tier A+B',
    'SU(2)_L dense cyclotomic ladders (2T+W_bare & strict Z[omega][1/2] Dic_3+S_23)',
    g2Ok,
    `2T+W_bare: |W|=(24,600,13848), D4 beta_f=(${w0.d4.betaF.toFixed(3)}, ${w1.d4.betaF.toFixed(3)}, ${w2.d4.betaF.toFixed(3)}), ` +
      `eps=(${w0.epsL!.toFixed(3)}, ${w1.epsL!.toFixed(3)}, ${w2.epsL!.toFixed(3)}), FP_3,4=(${w2.fp[2].toFixed(4)}, ${w2.fp[3].toFixed(4)}), ` +
      `|plaq(W2,80)-Weyl|=${errW2At80.toExponential(2)}; ` +
      `Dic_3+S_23: |W|=(12,156,1596,15996), D4 beta_f(L=1,2)=(${d1.d4.betaF.toFixed(3)}, ${d2.d4.betaF.toFixed(3)}) > GUT ${BETA_D4_GUT_SU2}`,
  )

  return { ladder2T, ladderDic3, r2I_D4 }
}

// =================================================================================================
// PART 3 — GATE G3: SU(3)_C STRICT-Z[zeta_9][1/3] DENSE LADDER Sigma(648) + T_3 (L = 0..4)
// =================================================================================================

function buildSigma1080(): readonly M3[] {
  const mu1 = (-1 + SQRT5) / 2
  const mu2 = (-1 - SQRT5) / 2
  const wr = -0.5
  const wi = 0.5 * SQRT3
  const w2r = -0.5
  const w2i = -0.5 * SQRT3

  const A = new Float64Array(18)
  A[0] = 1
  A[8] = -1
  A[16] = -1

  const B = new Float64Array(18)
  B[2] = 1
  B[10] = 1
  B[12] = 1

  const C = new Float64Array(18)
  C[0] = -0.5
  C[2] = mu2 / 2
  C[4] = mu1 / 2
  C[6] = mu2 / 2
  C[8] = mu1 / 2
  C[10] = -0.5
  C[12] = mu1 / 2
  C[14] = -0.5
  C[16] = mu2 / 2

  const D = new Float64Array(18)
  D[0] = -1
  D[10] = -wr
  D[11] = -wi
  D[14] = -w2r
  D[15] = -w2i

  return closeM3Group([A, B, C, D], 1200)
}

// 12-qutrit-MUB stabilizer rays (orbit of |e_0> under Sigma(648), modulo global phase)
type C3 = readonly [number, number, number, number, number, number] // (r0,i0, r1,i1, r2,i2)

// Zero-allocation lossless 3 x 45-bit safe-integer packing of rank-1 projector P = |v><v|
// (9 quantized entries in [0, 32767], 3 entries per safe IEEE-754 integer < 2^45 < 2^53)
const MUB_P0 = new Float64Array(12)
const MUB_P1 = new Float64Array(12)
const MUB_P2 = new Float64Array(12)
const MUB_ORD = new Int32Array(12)

function writeProjTriplet(
  idx: number,
  r0: number,
  i0: number,
  r1: number,
  i1: number,
  r2: number,
  i2: number,
): void {
  const s = 1e4
  const b = 0.137291
  const d0 = Math.round((r0 * r0 + i0 * i0) * s + b) + 16384
  const d1 = Math.round((r1 * r1 + i1 * i1) * s + b) + 16384
  const d2 = Math.round((r2 * r2 + i2 * i2) * s + b) + 16384
  const p01r = Math.round((r0 * r1 + i0 * i1) * s + b) + 16384
  const p01i = Math.round((i0 * r1 - r0 * i1) * s + b) + 16384
  const p02r = Math.round((r0 * r2 + i0 * i2) * s + b) + 16384
  const p02i = Math.round((i0 * r2 - r0 * i2) * s + b) + 16384
  const p12r = Math.round((r1 * r2 + i1 * i2) * s + b) + 16384
  const p12i = Math.round((i1 * r2 - r1 * i2) * s + b) + 16384
  MUB_P0[idx] = (d0 * 32768 + d1) * 32768 + d2
  MUB_P1[idx] = (p01r * 32768 + p01i) * 32768 + p02r
  MUB_P2[idx] = (p02i * 32768 + p12r) * 32768 + p12i
}

function build12MubKets(gS648: readonly M3[]): readonly C3[] {
  const seen = new Map<string, C3>()
  for (const M of gS648) {
    // Column 0 of M = M |e_0>
    const v: C3 = [M[0]!, M[1]!, M[6]!, M[7]!, M[12]!, M[13]!]
    writeProjTriplet(0, v[0], v[1], v[2], v[3], v[4], v[5])
    const k = `${MUB_P0[0]!.toString(36)}.${MUB_P1[0]!.toString(36)}.${MUB_P2[0]!.toString(36)}`
    if (!seen.has(k)) seen.set(k, v)
  }
  const kets = Array.from(seen.values())
  assert(kets.length === 12, `Expected 12 qutrit MUB stabilizer rays, got ${kets.length}`)
  return kets
}

function mubCosetHash(U: M3, mubKets: readonly C3[]): string {
  for (let m = 0; m < 12; m++) {
    const v = mubKets[m]!
    const vr0 = v[0]
    const vi0 = v[1]
    const vr1 = v[2]
    const vi1 = v[3]
    const vr2 = v[4]
    const vi2 = v[5]
    const w0r = U[0]! * vr0 - U[1]! * vi0 + U[2]! * vr1 - U[3]! * vi1 + U[4]! * vr2 - U[5]! * vi2
    const w0i = U[0]! * vi0 + U[1]! * vr0 + U[2]! * vi1 + U[3]! * vr1 + U[4]! * vi2 + U[5]! * vr2
    const w1r = U[6]! * vr0 - U[7]! * vi0 + U[8]! * vr1 - U[9]! * vi1 + U[10]! * vr2 - U[11]! * vi2
    const w1i = U[6]! * vi0 + U[7]! * vr0 + U[8]! * vi1 + U[9]! * vr1 + U[10]! * vi2 + U[11]! * vr2
    const w2r = U[12]! * vr0 - U[13]! * vi0 + U[14]! * vr1 - U[15]! * vi1 + U[16]! * vr2 - U[17]! * vi2
    const w2i = U[12]! * vi0 + U[13]! * vr0 + U[14]! * vi1 + U[15]! * vr1 + U[16]! * vi2 + U[17]! * vr2
    writeProjTriplet(m, w0r, w0i, w1r, w1i, w2r, w2i)
    MUB_ORD[m] = m
  }
  // Insertion sort on 12 indices by (MUB_P0, MUB_P1, MUB_P2)
  for (let i = 1; i < 12; i++) {
    const cur = MUB_ORD[i]!
    const c0 = MUB_P0[cur]!
    const c1 = MUB_P1[cur]!
    const c2 = MUB_P2[cur]!
    let j = i - 1
    while (j >= 0) {
      const k = MUB_ORD[j]!
      const k0 = MUB_P0[k]!
      const cmp = k0 !== c0 ? k0 - c0 : MUB_P1[k]! !== c1 ? MUB_P1[k]! - c1 : MUB_P2[k]! - c2
      if (cmp <= 0) break
      MUB_ORD[j + 1] = k
      j--
    }
    MUB_ORD[j + 1] = cur
  }
  // Mix lossless sorted 36 integers into a short compact 2x53-bit + check signature? No — keep exact lossless compact base-36!
  let out = ''
  for (let i = 0; i < 12; i++) {
    const k = MUB_ORD[i]!
    if (i > 0) out += ';'
    out += MUB_P0[k]!.toString(36) + '.' + MUB_P1[k]!.toString(36) + '.' + MUB_P2[k]!.toString(36)
  }
  return out
}

// Deterministic LCG + Mezzadri QR Haar SU(3) probe generator (zero Math.random)
function generateHaarSU3Probes(count: number): readonly M3[] {
  let seed = 20261127
  const nextUniform = (): number => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    return (seed + 0.5) / 4294967296
  }
  const nextGauss = (): number => {
    const u1 = nextUniform()
    const u2 = nextUniform()
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * PI * u2)
  }

  const probes: M3[] = []
  for (let p = 0; p < count; p++) {
    // 3x3 complex Ginibre matrix Z stored as 3 columns of C^3
    const cols: Float64Array[] = [new Float64Array(6), new Float64Array(6), new Float64Array(6)]
    for (let j = 0; j < 3; j++) {
      for (let i = 0; i < 6; i++) cols[j]![i] = nextGauss()
    }
    // Modified Gram-Schmidt QR with Mezzadri phase fixing (diagonal of R real positive)
    for (let j = 0; j < 3; j++) {
      const cj = cols[j]!
      for (let k = 0; k < j; k++) {
        const ck = cols[k]!
        let dr = 0
        let di = 0
        for (let i = 0; i < 3; i++) {
          const ar = ck[2 * i]!
          const ai = -ck[2 * i + 1]!
          const br = cj[2 * i]!
          const bi = cj[2 * i + 1]!
          dr += ar * br - ai * bi
          di += ar * bi + ai * br
        }
        for (let i = 0; i < 3; i++) {
          const kr = ck[2 * i]!
          const ki = ck[2 * i + 1]!
          cj[2 * i] = cj[2 * i]! - (kr * dr - ki * di)
          cj[2 * i + 1] = cj[2 * i + 1]! - (kr * di + ki * dr)
        }
      }
      let norm2 = 0
      for (let i = 0; i < 6; i++) norm2 += cj[i]! * cj[i]!
      const invN = 1 / Math.sqrt(norm2)
      // Random phase from first complex Ginibre diagonal entry is already uniform on S^1;
      // Gram-Schmidt leaves R_jj > 0 (so Mezzadri phase factor = +1)
      for (let i = 0; i < 6; i++) cj[i] = cj[i]! * invN
    }
    const Q = new Float64Array(18)
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        Q[(i * 3 + j) * 2] = cols[j]![2 * i]!
        Q[(i * 3 + j) * 2 + 1] = cols[j]![2 * i + 1]!
      }
    }
    // Project U(3) -> SU(3) by multiplying by exp(-i arg(det Q) / 3)
    const d = m3Det(Q)
    const ang = -Math.atan2(d[1], d[0]) / 3
    const cr = Math.cos(ang)
    const ci = Math.sin(ang)
    for (let k = 0; k < 9; k++) {
      const r = Q[2 * k]!
      const im = Q[2 * k + 1]!
      Q[2 * k] = r * cr - im * ci
      Q[2 * k + 1] = r * ci + im * cr
    }
    assert(m3UnitaryErr(Q) < 1e-12, 'Haar SU(3) probe unitarity check failed')
    const d2 = m3Det(Q)
    assert(Math.hypot(d2[0] - 1, d2[1]) < 1e-12, 'Haar SU(3) probe det=1 check failed')
    probes.push(Q)
  }
  return probes
}

type SU3Orbit = { readonly rep: M3; readonly size: number }

type SU3LadderLevel = {
  readonly L: number
  readonly cosets: readonly M3[]
  readonly cosetHashes: ReadonlySet<string>
  readonly orbits: readonly SU3Orbit[]
  readonly order: number
  readonly leftS648Err: number
  readonly deltaL: number
  readonly spec: readonly SpectrumEntry[]
  readonly fp: readonly [number, number, number, number] | null
  readonly covMax: number | null
  readonly z4: FreezingResult
  readonly d4: FreezingResult
}

function runPart3(
  gS648: readonly M3[],
  mClock: M3,
  mShift: M3,
  mHessV: M3,
  mPhaseT: M3,
  mT3: M3,
  latZ4: LatSpec,
  latD4: LatSpec,
): {
  readonly gS1080: readonly M3[]
  readonly mubKets: readonly C3[]
  readonly ladderSU3: readonly SU3LadderLevel[]
  readonly rS648_D4: FreezingResult
  readonly rS1080_D4: FreezingResult
  readonly cosetGens8: readonly M3[]
} {
  console.log('\n=================================================================================')
  console.log('PART 3 (GATE G3, Tier A+B): SU(3)_C STRICT-Z[zeta_9][1/3] LADDER Sigma(648) + T_3')
  console.log('=================================================================================')

  const gS1080 = buildSigma1080()
  assert(gS1080.length === 1080, `Expected |Sigma(1080)| = 1080, got ${gS1080.length}`)

  // 1. Exact self-adjointness V^2 T_3 V^-2 = T_3^dag
  const V2 = m3Mul(mHessV, mHessV)
  const V2inv = m3Dag(V2)
  const conjT3 = m3Mul(m3Mul(V2, mT3), V2inv)
  const selfAdjErr = m3FrobDiff(conjT3, m3Dag(mT3))
  assert(selfAdjErr < 1e-14, `Self-adjointness V^2 T_3 V^-2 = T_3^dag failed: err=${selfAdjErr}`)

  // 2. Stabilizer |H_L| = |Sigma(648) cap T_3 Sigma(648) T_3^-1| = 81 (index 8)
  const s648Keys = new Set<string>(gS648.map(m => m3Key(m)))
  const mT3Dag = m3Dag(mT3)
  let hLCount = 0
  for (const g of gS648) {
    const c = m3Mul(m3Mul(mT3Dag, g), mT3)
    if (s648Keys.has(m3Key(c))) hLCount++
  }
  assert(hLCount === 81, `Expected |H_L| = 81, got ${hLCount}`)

  // 3. 12-qutrit-MUB stabilizer projector hash: verify exactly 1 unique hash across all 648 elements
  const mubKets = build12MubKets(gS648)
  const s648HashSet = new Set<string>()
  for (const g of gS648) s648HashSet.add(mubCosetHash(g, mubKets))
  assert(
    s648HashSet.size === 1,
    `Expected 1 unique 12-MUB hash across Sigma(648), got ${s648HashSet.size}`,
  )
  const idHash = Array.from(s648HashSet)[0]!
  console.log(
    `  [Setup] |Sigma(648)|=${gS648.length}, |Sigma(1080)|=${gS1080.length}, ||V^2 T_3 V^-2 - T_3^dag||=${selfAdjErr.toExponential(2)}, ` +
      `|H_L|=${hLCount} (index ${648 / hLCount}), 12-MUB hashes on Sigma(648)=${s648HashSet.size}`,
  )

  // Center-reduced 216 representatives of Sigma(648) / Z_3 for fast |Tr(M h)|^{2t} and covering radius
  const s648ProjMap = new Map<string, M3>()
  const wR = -0.5
  const wI = 0.5 * SQRT3
  const w2R = -0.5
  const w2I = -0.5 * SQRT3
  const scalePhase = (M: M3, cr: number, ci: number): M3 => {
    const out = new Float64Array(18)
    for (let k = 0; k < 9; k++) {
      const r = M[2 * k]!
      const im = M[2 * k + 1]!
      out[2 * k] = r * cr - im * ci
      out[2 * k + 1] = r * ci + im * cr
    }
    return out
  }
  for (const M of gS648) {
    const k0 = m3Key(M)
    const k1 = m3Key(scalePhase(M, wR, wI))
    const k2 = m3Key(scalePhase(M, w2R, w2I))
    const ck = k0 < k1 ? (k0 < k2 ? k0 : k2) : k1 < k2 ? k1 : k2
    if (!s648ProjMap.has(ck)) s648ProjMap.set(ck, M)
  }
  const s648ModZ3 = Array.from(s648ProjMap.values())
  assert(s648ModZ3.length === 216, `Expected |Sigma(648)/Z_3| = 216, got ${s648ModZ3.length}`)

  // 4. Extract the 8 left-coset generators {r T_3} of Sigma(648) T_3 Sigma(648) / Sigma(648)
  const gen8Map = new Map<string, M3>()
  for (const g of gS648) {
    const cand = m3Mul(g, mT3)
    const h = mubCosetHash(cand, mubKets)
    if (!gen8Map.has(h)) gen8Map.set(h, cand)
  }
  const cosetGens8 = Array.from(gen8Map.values())
  assert(cosetGens8.length === 8, `Expected 8 left-coset generators for Sigma(648)+T_3, got ${cosetGens8.length}`)

  // 5. Run 8-generator left-coset BFS for L = 0..4 (1, 9, 57, 345, 2073 cosets)
  const s648Gens: readonly M3[] = [mClock, mShift, mHessV, mPhaseT]
  const idM3 = m3Id()
  const seenCosets = new Map<string, M3>([[idHash, idM3]])
  let frontier: M3[] = [idM3]
  const cosetsByLevel: M3[][] = []
  const hashesByLevel: Set<string>[] = []

  for (let L = 0; L <= 4; L++) {
    if (L > 0) {
      const nextFrontier: M3[] = []
      for (const c of frontier) {
        for (const e of cosetGens8) {
          const nxt = m3Mul(c, e)
          const h = mubCosetHash(nxt, mubKets)
          if (!seenCosets.has(h)) {
            seenCosets.set(h, nxt)
            nextFrontier.push(nxt)
          }
        }
      }
      frontier = nextFrontier
    }
    const expCosets = 1 + (8 / 5) * (Math.pow(6, L) - 1)
    assert(
      seenCosets.size === Math.round(expCosets),
      `Bruhat-Tits coset count mismatch at L=${L}: got ${seenCosets.size}, expected ${Math.round(expCosets)}`,
    )
    cosetsByLevel.push(Array.from(seenCosets.values()))
    hashesByLevel.push(new Set<string>(seenCosets.keys()))
  }

  const tmpM3 = new Float64Array(18)

  // Helper: decompose C_L into left-Sigma(648) orbits (double cosets Sigma(648) c Sigma(648))
  // and simultaneously verify exact left-Sigma(648) invariance (leftS648Err === 0)
  function decomposeLeftOrbits(
    cosets: readonly M3[],
    hashSet: ReadonlySet<string>,
  ): { readonly orbits: readonly SU3Orbit[]; readonly leftErr: number } {
    const hashToIdx = new Map<string, number>()
    let idxCounter = 0
    for (const h of hashSet) {
      hashToIdx.set(h, idxCounter++)
    }
    let leftErr = 0
    const adj: number[][] = Array.from({ length: cosets.length }, () => [])
    for (let i = 0; i < cosets.length; i++) {
      const c = cosets[i]!
      for (const g of s648Gens) {
        m3MulInto(g, c, tmpM3)
        const h = mubCosetHash(tmpM3, mubKets)
        const j = hashToIdx.get(h)
        if (j === undefined) {
          leftErr++
        } else {
          adj[i]!.push(j)
          adj[j]!.push(i)
        }
      }
    }
    const visited = new Uint8Array(cosets.length)
    const orbits: SU3Orbit[] = []
    for (let i = 0; i < cosets.length; i++) {
      if (visited[i] === 1) continue
      const q: number[] = [i]
      visited[i] = 1
      let hd = 0
      while (hd < q.length) {
        const u = q[hd++]!
        for (const v of adj[u]!) {
          if (visited[v] === 0) {
            visited[v] = 1
            q.push(v)
          }
        }
      }
      orbits.push({ rep: cosets[i]!, size: q.length })
    }
    return { orbits, leftErr }
  }

  // Exact double-coset weighted spectrum of 1 - Re Tr(u)/3 over ALL u in W_L = union c Sigma(648)
  // Because Tr(g c h) = Tr(c (h g)), every coset in a left-Sigma(648) orbit has IDENTICAL trace spectrum!
  function buildSU3WeightedSpectrum(orbits: readonly SU3Orbit[]): {
    readonly spec: readonly SpectrumEntry[]
    readonly deltaL: number
  } {
    const counts = new Map<number, { sum: number; w: number }>()
    let deltaL = Infinity
    for (const orb of orbits) {
      const r = orb.rep
      const mult = orb.size
      for (let hi = 0; hi < s648ModZ3.length; hi++) {
        const h = s648ModZ3[hi]!
        const tr = m3TrProd(r, h)
        // Three center phases: 1, w, w^2
        const re0 = tr[0]
        const re1 = wR * tr[0] - wI * tr[1]
        const re2 = w2R * tr[0] - w2I * tr[1]
        for (const re of [re0, re1, re2]) {
          const def = 1 - re / 3
          if (def > 1e-8 && def < deltaL) deltaL = def
          const k = Math.round(def * 1e10)
          const cur = counts.get(k)
          if (cur) {
            cur.sum += def * mult
            cur.w += mult
          } else {
            counts.set(k, { sum: def * mult, w: mult })
          }
        }
      }
    }
    const spec: SpectrumEntry[] = []
    for (const { sum, w } of counts.values()) spec.push({ s: sum / w, w })
    return { spec, deltaL }
  }

  // Exact double-coset FP_1..4(W_L):
  // FP_t(W_L) = (1 / |C_L|^2) * sum_{orbit a} n_a * sum_{c2 in C_L} (1/216) sum_{h in Sigma(648)/Z_3} |Tr(r_a^dag c2 h)|^{2t}
  function computeSU3DoubleCosetFP(
    cosets: readonly M3[],
    orbits: readonly SU3Orbit[],
  ): readonly [number, number, number, number] {
    let s1 = 0
    let s2 = 0
    let s3 = 0
    let s4 = 0
    const nC = cosets.length
    const nH = s648ModZ3.length
    for (const orb of orbits) {
      const rDag = m3Dag(orb.rep)
      const wt = orb.size
      let o1 = 0
      let o2 = 0
      let o3 = 0
      let o4 = 0
      for (let j = 0; j < nC; j++) {
        m3MulInto(rDag, cosets[j]!, tmpM3)
        for (let hi = 0; hi < nH; hi++) {
          const tr = m3TrProd(tmpM3, s648ModZ3[hi]!)
          const a2 = tr[0] * tr[0] + tr[1] * tr[1]
          const a4 = a2 * a2
          o1 += a2
          o2 += a4
          o3 += a4 * a2
          o4 += a4 * a4
        }
      }
      s1 += wt * o1
      s2 += wt * o2
      s3 += wt * o3
      s4 += wt * o4
    }
    const inv = 1 / (nC * nC * nH)
    return [s1 * inv, s2 * inv, s3 * inv, s4 * inv]
  }

  // Exact FP_1..4 for any finite group G < SU(3) (uses group invariance: single sum over G)
  function computeSU3GroupFP(G: readonly M3[]): readonly [number, number, number, number] {
    let s1 = 0
    let s2 = 0
    let s3 = 0
    let s4 = 0
    for (const M of G) {
      const trRe = M[0]! + M[8]! + M[16]!
      const trIm = M[1]! + M[9]! + M[17]!
      const a2 = trRe * trRe + trIm * trIm
      const a4 = a2 * a2
      s1 += a2
      s2 += a4
      s3 += a4 * a2
      s4 += a4 * a4
    }
    const inv = 1 / G.length
    return [s1 * inv, s2 * inv, s3 * inv, s4 * inv]
  }

  // Deterministic 128-probe Haar covering radius in Frobenius distance d_F(U, V) = sqrt(6 - 2 Re Tr(U^dag V))
  const haarProbes = generateHaarSU3Probes(128)
  const haarProbesDag = haarProbes.map(m3Dag)

  function computeSU3CovMaxCosets(cosets: readonly M3[]): number {
    let minBestReTr = 3.0
    for (let pi = 0; pi < haarProbesDag.length; pi++) {
      const pDag = haarProbesDag[pi]!
      let bestReTr = -3.0
      for (let ci = 0; ci < cosets.length; ci++) {
        m3MulInto(pDag, cosets[ci]!, tmpM3)
        for (let hi = 0; hi < s648ModZ3.length; hi++) {
          const tr = m3TrProd(tmpM3, s648ModZ3[hi]!)
          const r0 = tr[0]
          const r1 = wR * tr[0] - wI * tr[1]
          const r2 = w2R * tr[0] - w2I * tr[1]
          const rm = r0 > r1 ? (r0 > r2 ? r0 : r2) : r1 > r2 ? r1 : r2
          if (rm > bestReTr) bestReTr = rm
        }
      }
      if (bestReTr < minBestReTr) minBestReTr = bestReTr
    }
    return Math.sqrt(Math.max(0, 6 - 2 * minBestReTr))
  }

  function computeSU3CovMaxGroup(G: readonly M3[]): number {
    let minBestReTr = 3.0
    for (let pi = 0; pi < haarProbes.length; pi++) {
      const P = haarProbes[pi]!
      let bestReTr = -3.0
      for (let gi = 0; gi < G.length; gi++) {
        const M = G[gi]!
        // Re Tr(P^dag M) = sum_{k=0}^{17} P[k] * M[k]
        let re = 0
        for (let k = 0; k < 18; k++) re += P[k]! * M[k]!
        if (re > bestReTr) bestReTr = re
      }
      if (bestReTr < minBestReTr) minBestReTr = bestReTr
    }
    return Math.sqrt(Math.max(0, 6 - 2 * minBestReTr))
  }

  // Reference Sigma(1080) metrics
  const fp1080 = computeSU3GroupFP(gS1080)
  const spec1080 = spectrumFromDeficits(gS1080.map(M => 1 - m3ReTr(M) / 3))
  const covMax1080 = computeSU3CovMaxGroup(gS1080)
  const rS1080_Z4 = solveFreezingWeighted(3, V_SU3, gS1080.length, spec1080, latZ4)
  const rS1080_D4 = solveFreezingWeighted(3, V_SU3, gS1080.length, spec1080, latD4)
  assertClose(fp1080[0], 1, 1e-10, 'FP_1(Sigma(1080))')
  assertClose(fp1080[1], 2, 1e-10, 'FP_2(Sigma(1080))')
  assertClose(fp1080[2], 6, 1e-10, 'FP_3(Sigma(1080))')
  assertClose(fp1080[3], 28, 1e-10, 'FP_4(Sigma(1080))')
  console.log(
    `  [Ref Sigma(1080)] FP=[${fp1080.map(x => x.toFixed(2)).join(', ')}], covMax=${covMax1080.toFixed(4)}, ` +
      `Z4 beta_f=${rS1080_Z4.betaF.toFixed(3)}, D4 beta_f=${rS1080_D4.betaF.toFixed(3)} (bZ4_1L=${rS1080_D4.bZ4OneLoop.toFixed(3)})`,
  )

  // Evaluate all levels L = 0..4
  const ladderSU3: SU3LadderLevel[] = []
  console.log('\n  --- Strict Z[zeta_9][1/3] Ladder Sigma(648) + T_3 (L=0..4) ---')
  for (let L = 0; L <= 4; L++) {
    const cosets = cosetsByLevel[L]!
    const hashSet = hashesByLevel[L]!
    const { orbits, leftErr } = decomposeLeftOrbits(cosets, hashSet)
    assert(leftErr === 0, `Left Sigma(648) invariance failed at L=${L}: err=${leftErr}`)
    const { spec, deltaL } = buildSU3WeightedSpectrum(orbits)
    const order = cosets.length * 648
    const fp = L <= 3 ? computeSU3DoubleCosetFP(cosets, orbits) : null
    const covMax = L <= 2 ? computeSU3CovMaxCosets(cosets) : null
    // For L >= 1, W_L is a bi-Sigma(648)-invariant word ball (not a finite subgroup); -lat.f * ln(|W_L|)
    // uses the subgroup-order entropy proxy (#vac(W_L) <= |W_L|^V), a conservative lower bound on pure-freeze beta_f.
    const z4 = solveFreezingWeighted(3, V_SU3, order, spec, latZ4)
    const d4 = solveFreezingWeighted(3, V_SU3, order, spec, latD4)
    ladderSU3.push({ L, cosets, cosetHashes: hashSet, orbits, order, leftS648Err: leftErr, deltaL, spec, fp, covMax, z4, d4 })

    const fpStr = fp !== null ? `[${fp.map(x => x.toFixed(4)).join(', ')}]` : '(omitted at L=4)'
    const covStr = covMax !== null ? covMax.toFixed(4) : '  --  '
    console.log(
      `  L=${L}: |W|=${String(order).padStart(7)} (${String(cosets.length).padStart(4)} cosets, ${String(orbits.length).padStart(2)} orbits, leftErr=${leftErr}) | ` +
        `delta=${deltaL.toFixed(5)} | cov=${covStr} | D4 beta_f=${d4.betaF.toFixed(3)} (bZ4_1L=${d4.bZ4OneLoop.toFixed(2)}, Z4=${z4.betaF.toFixed(3)})`,
    )
    if (fp !== null) {
      console.log(`       exact double-coset FP_1..4 = ${fpStr} (Haar: [1, 2, 6, 23])`)
    }
  }

  // Exact 1-plaquette Weyl comparison at b = 3, 6, 10, 15, 25, 40
  const su3Betas = [3, 6, 10, 15, 25, 40] as const
  const weyl3 = weylPlaqSU3Batch(su3Betas)
  console.log('\n  --- SU(3) Exact 1-Plaquette Comparison (S648, S1080, W_1..W_4 vs Continuum Weyl) ---')
  let errW4At40 = 0
  let plaq1080At40 = 0
  for (let bi = 0; bi < su3Betas.length; bi++) {
    const b = su3Betas[bi]!
    const w = weyl3[bi]!
    const p648 = evalPlaqFromSpectrum(ladderSU3[0]!.spec, b)
    const p1080 = evalPlaqFromSpectrum(spec1080, b)
    const pW1 = evalPlaqFromSpectrum(ladderSU3[1]!.spec, b)
    const pW2 = evalPlaqFromSpectrum(ladderSU3[2]!.spec, b)
    const pW4 = evalPlaqFromSpectrum(ladderSU3[4]!.spec, b)
    if (b === 40) {
      errW4At40 = Math.abs(pW4 - w)
      plaq1080At40 = p1080
    }
    console.log(
      `  beta=${String(b).padStart(2)}: Weyl=${w.toFixed(6)} | S648=${p648.toFixed(6)} | S1080=${p1080.toFixed(6)} | ` +
        `W_1=${pW1.toFixed(6)} | W_2=${pW2.toFixed(6)} | W_4=${pW4.toFixed(6)} (|W_4-Weyl|=${Math.abs(pW4 - w).toExponential(2)})`,
    )
  }

  // Asymptotic scaling ratio beta_0(4) / beta_0(3) vs 6^(1/4) = 1.56508
  const L0 = ladderSU3[0]!
  const L1 = ladderSU3[1]!
  const L2 = ladderSU3[2]!
  const L3 = ladderSU3[3]!
  const L4 = ladderSU3[4]!
  const ratio43 = L4.d4.beta0 / L3.d4.beta0
  const targetRatio = Math.pow(6, 0.25)
  const ratioRelErr = Math.abs(ratio43 / targetRatio - 1)
  console.log(
    `  [Asymptotic Scaling] beta_0(4)/beta_0(3) = ${ratio43.toFixed(5)} vs 6^(1/4) = ${targetRatio.toFixed(5)} (relErr=${(ratioRelErr * 100).toFixed(3)}% < 1%)`,
  )
  console.log(
    '  [Scope Note] For L >= 1, W_L is a bi-Sigma(648)-invariant word ball (not a finite subgroup); solveFreezingWeighted uses\n' +
      '               the 1-loop subgroup-order entropy proxy -lat.f * ln(|W_L|) (#vac(W_L) <= |W_L|^V, conservative lower bound on pure-freeze beta_f).',
  )

  const g3Ok =
    L0.order === 648 &&
    L1.order === 5832 &&
    L2.order === 36936 &&
    L3.order === 223560 &&
    L4.order === 1343304 &&
    ladderSU3.every(lv => lv.leftS648Err === 0) &&
    L1.deltaL < 0.16 &&
    L0.deltaL > 0.43 &&
    L4.deltaL < 0.13 &&
    Math.abs(L2.fp![2] - 6) < 0.005 &&
    Math.abs(L2.fp![3] - 23) < 0.05 &&
    L2.covMax! < 0.9 &&
    covMax1080 > 0.9 &&
    L1.d4.betaF > rS1080_D4.betaF &&
    L2.d4.bZ4OneLoop > 5.89 &&
    L2.z4.betaF > 5.89 &&
    L4.d4.betaF > BETA_D4_GUT_SU3 &&
    errW4At40 < 0.02 &&
    plaq1080At40 > 0.9999 &&
    ratioRelErr < 0.01

  recordGate(
    'G3',
    'Tier A+B',
    'SU(3)_C strict-Z[zeta_9][1/3] dense ladder Sigma(648)+T_3 (L=0..4)',
    g3Ok,
    `|W|=(648..1343304), leftErr=0, delta=(${L0.deltaL.toFixed(3)}, ${L1.deltaL.toFixed(3)}, .., ${L4.deltaL.toFixed(3)}), ` +
      `FP_3,4(W2)=(${L2.fp![2].toFixed(4)}, ${L2.fp![3].toFixed(4)}) vs S1080(28.0), ` +
      `cov(W2)=${L2.covMax!.toFixed(3)}<0.90<${covMax1080.toFixed(3)}, ` +
      `D4 beta_f(L1)=${L1.d4.betaF.toFixed(3)}>S1080(${rS1080_D4.betaF.toFixed(3)}), ` +
      `L2(bZ4_1L=${L2.d4.bZ4OneLoop.toFixed(2)}, Z4=${L2.z4.betaF.toFixed(2)})>5.89, ` +
      `L4 D4=${L4.d4.betaF.toFixed(3)}>GUT(${BETA_D4_GUT_SU3}), |plaq(W4,40)-Weyl|=${errW4At40.toExponential(2)}`,
  )

  return {
    gS1080,
    mubKets,
    ladderSU3,
    rS648_D4: L0.d4,
    rS1080_D4,
    cosetGens8,
  }
}

// =================================================================================================
// PART 4 — GATE G4: NATIVE 4D D_4 SYMANZIK & ADJOINT IMPROVED ACTIONS HONEST AUDIT
// =================================================================================================

// Evaluate tree-level O(k^2) and O(k^4) Abelian flux coefficients A_2, A_4 for a loop family along axis nHat (perp eps)
function evalLoopFamilyTreeA2A4(
  loopsR4: readonly (readonly IVec4[])[],
  nHat: readonly [number, number, number, number],
  eps: readonly [number, number, number, number],
): { readonly A2: number; readonly A4: number } {
  const evalSum = (t: number): number => {
    const k0 = t * nHat[0]
    const k1 = t * nHat[1]
    const k2 = t * nHat[2]
    const k3 = t * nHat[3]
    let total = 0
    for (let p = 0; p < loopsR4.length; p++) {
      const verts = loopsR4[p]!
      const m = verts.length
      let re = 0
      let im = 0
      for (let i = 0; i < m; i++) {
        const a = verts[i]!
        const b = verts[(i + 1) % m]!
        const d0 = b[0] - a[0]
        const d1 = b[1] - a[1]
        const d2 = b[2] - a[2]
        const d3 = b[3] - a[3]
        const ed = eps[0] * d0 + eps[1] * d1 + eps[2] * d2 + eps[3] * d3
        const m0 = 0.5 * (a[0] + b[0])
        const m1 = 0.5 * (a[1] + b[1])
        const m2 = 0.5 * (a[2] + b[2])
        const m3 = 0.5 * (a[3] + b[3])
        const ph = k0 * m0 + k1 * m1 + k2 * m2 + k3 * m3
        re += ed * Math.cos(ph)
        im += ed * Math.sin(ph)
      }
      total += re * re + im * im
    }
    return total
  }
  // Richardson extraction of A_2 t^2 + A_4 t^4 + O(t^6) using t1 = 0.02, t2 = 0.04
  const t1 = 0.02
  const t2 = 0.04
  const f1 = evalSum(t1) / (t1 * t1)
  const f2 = evalSum(t2) / (t2 * t2)
  const A4 = (f2 - f1) / (t2 * t2 - t1 * t1)
  const A2 = f1 - A4 * t1 * t1
  return { A2, A4 }
}

type ImprovedActionSpec = {
  readonly name: string
  readonly cTri: number
  readonly cRhomb: number
  readonly cOct: number
}

type ImprovedActionResult = {
  readonly spec: ImprovedActionSpec
  readonly cL: number
  readonly fails: number
  readonly kpTri: number
  readonly kpRhomb: number
  readonly kpOct: number
  readonly nlEff: number
  readonly sdErrMax: number
}

// Sparse single-pass half-BZ (k0 < pi, nGrid = 8) Cholesky solver across all 5 actions simultaneously
function solveD4ActionsSinglePass(
  geom: D4Geometry,
  actions: readonly ImprovedActionSpec[],
  nGrid: number,
): readonly ImprovedActionResult[] {
  const n = 12
  const half0 = nGrid >> 1
  const total = half0 * nGrid * nGrid * nGrid

  const gRe = new Float64Array(n * n)
  const gIm = new Float64Array(n * n)
  const mTriRe = new Float64Array(n * n)
  const mTriIm = new Float64Array(n * n)
  const mRhRe = new Float64Array(n * n)
  const mRhIm = new Float64Array(n * n)
  const mOctRe = new Float64Array(n * n)
  const mOctIm = new Float64Array(n * n)

  const hRe = new Float64Array(n * n)
  const hIm = new Float64Array(n * n)
  const xRe = new Float64Array(n * n)
  const xIm = new Float64Array(n * n)
  const invRe = new Float64Array(n * n)
  const invIm = new Float64Array(n * n)
  const gr = new Float64Array(n)
  const gi = new Float64Array(n)
  const stepL = new Int32Array(4)
  const stepR = new Float64Array(4)
  const stepI = new Float64Array(4)

  const accumFamily = (
    loops: readonly (readonly LoopStep[])[],
    k0: number,
    k1: number,
    k2: number,
    k3: number,
    outRe: Float64Array,
    outIm: Float64Array,
  ): void => {
    outRe.fill(0)
    outIm.fill(0)
    for (let p = 0; p < loops.length; p++) {
      const loop = loops[p]!
      const m = loop.length
      for (let a = 0; a < m; a++) {
        const s = loop[a]!
        const b = s.base
        const ph = k0 * b[0] + k1 * b[1] + k2 * b[2] + k3 * b[3]
        stepL[a] = s.link
        stepR[a] = s.sign * Math.cos(ph)
        stepI[a] = s.sign * Math.sin(ph)
      }
      for (let a = 0; a < m; a++) {
        const la = stepL[a]!
        const ar = stepR[a]!
        const ai = -stepI[a]!
        for (let b = 0; b < m; b++) {
          const lb = stepL[b]!
          if (lb > la) continue
          const br = stepR[b]!
          const bi = stepI[b]!
          const idx = la * n + lb
          outRe[idx] = outRe[idx]! + (ar * br - ai * bi)
          outIm[idx] = outIm[idx]! + (ar * bi + ai * br)
        }
      }
    }
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < i; j++) {
        outRe[j * n + i] = outRe[i * n + j]!
        outIm[j * n + i] = -outIm[i * n + j]!
      }
    }
  }

  const trHermProd = (aRe: Float64Array, aIm: Float64Array, bRe: Float64Array, bIm: Float64Array): number => {
    // Re Tr(A B) for Hermitian A, B: sum_{i,j} (A_{ij} B_{ji}) = sum_{i,j} (A_r B_r + A_i B_i)
    let s = 0
    for (let k = 0; k < n * n; k++) {
      s += aRe[k]! * bRe[k]! + aIm[k]! * bIm[k]!
    }
    return s
  }

  const sumCL = new Float64Array(actions.length)
  const sumKpTri = new Float64Array(actions.length)
  const sumKpRh = new Float64Array(actions.length)
  const sumKpOct = new Float64Array(actions.length)
  const maxSdErr = new Float64Array(actions.length)
  const fails = new Int32Array(actions.length)

  for (let i0 = 0; i0 < half0; i0++) {
    const k0 = (2 * PI * (i0 + 0.5)) / nGrid
    for (let i1 = 0; i1 < nGrid; i1++) {
      const k1 = (2 * PI * (i1 + 0.5)) / nGrid
      for (let i2 = 0; i2 < nGrid; i2++) {
        const k2 = (2 * PI * (i2 + 0.5)) / nGrid
        for (let i3 = 0; i3 < nGrid; i3++) {
          const k3 = (2 * PI * (i3 + 0.5)) / nGrid

          let g2 = 0
          for (let l = 0; l < n; l++) {
            const v = geom.posPrim[l]!
            const ph = k0 * v[0] + k1 * v[1] + k2 * v[2] + k3 * v[3]
            const r = Math.cos(ph) - 1
            const imv = Math.sin(ph)
            gr[l] = r
            gi[l] = imv
            g2 += r * r + imv * imv
          }
          for (let i = 0; i < n; i++) {
            for (let j = 0; j <= i; j++) {
              const sr = gr[i]! * gr[j]! + gi[i]! * gi[j]!
              const si = gi[i]! * gr[j]! - gr[i]! * gi[j]!
              gRe[i * n + j] = sr
              gIm[i * n + j] = si
              gRe[j * n + i] = sr
              gIm[j * n + i] = -si
            }
          }

          accumFamily(geom.tris, k0, k1, k2, k3, mTriRe, mTriIm)
          accumFamily(geom.rhombi, k0, k1, k2, k3, mRhRe, mRhIm)
          accumFamily(geom.octSqs, k0, k1, k2, k3, mOctRe, mOctIm)
          const twoLnG2 = 2 * Math.log(g2)

          for (let ai = 0; ai < actions.length; ai++) {
            const act = actions[ai]!
            const cT = act.cTri
            const cR = act.cRhomb
            const cO = act.cOct
            for (let idx = 0; idx < n * n; idx++) {
              hRe[idx] = gRe[idx]! + cT * mTriRe[idx]! + cR * mRhRe[idx]! + cO * mOctRe[idx]!
              hIm[idx] = gIm[idx]! + cT * mTriIm[idx]! + cR * mRhIm[idx]! + cO * mOctIm[idx]!
            }
            const ld = choleskyInPlace(n, hRe, hIm)
            if (!Number.isFinite(ld)) {
              fails[ai] = fails[ai]! + 1
              continue
            }
            sumCL[ai] = sumCL[ai]! + (twoLnG2 - ld)
            choleskyInvertFromL(n, hRe, hIm, xRe, xIm, invRe, invIm)
            const tTri = trHermProd(invRe, invIm, mTriRe, mTriIm)
            const tRh = trHermProd(invRe, invIm, mRhRe, mRhIm)
            const tOct = trHermProd(invRe, invIm, mOctRe, mOctIm)
            sumKpTri[ai] = sumKpTri[ai]! + tTri / 32
            sumKpRh[ai] = sumKpRh[ai]! + tRh / 48
            sumKpOct[ai] = sumKpOct[ai]! + tOct / 6
            const sd = Math.abs(cT * tTri + cR * tRh + cO * tOct - 11)
            if (sd > maxSdErr[ai]!) maxSdErr[ai] = sd
          }
        }
      }
    }
  }

  return actions.map((spec, ai) => {
    const valid = total - fails[ai]!
    return {
      spec,
      cL: sumCL[ai]! / valid,
      fails: fails[ai]!,
      kpTri: sumKpTri[ai]! / valid,
      kpRhomb: sumKpRh[ai]! / valid,
      kpOct: sumKpOct[ai]! / valid,
      nlEff: 8 * spec.cTri + 16 * spec.cRhomb + 2 * spec.cOct,
      sdErrMax: maxSdErr[ai]!,
    }
  })
}

// Direct Lie-algebra basis Wick contraction verifier for SU(2) (3 Pauli) and SU(3) (8 Gell-Mann)
// Computes exact tadpole-to-kinetic ratios R_F, R_{U^2}, R_A and gamma = R / R_F directly from generator traces.
function verifyLieAlgebraWickGamma(): {
  readonly gammaSu2Adj: number
  readonly gammaSu3U2: number
  readonly gammaSu3Adj: number
} {
  type CMat = { readonly n: number; readonly re: Float64Array; readonly im: Float64Array }
  const cmMul = (A: CMat, B: CMat): CMat => {
    const n = A.n
    const re = new Float64Array(n * n)
    const im = new Float64Array(n * n)
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        let sr = 0
        let si = 0
        for (let k = 0; k < n; k++) {
          const ar = A.re[i * n + k]!
          const ai = A.im[i * n + k]!
          const br = B.re[k * n + j]!
          const bi = B.im[k * n + j]!
          sr += ar * br - ai * bi
          si += ar * bi + ai * br
        }
        re[i * n + j] = sr
        im[i * n + j] = si
      }
    }
    return { n, re, im }
  }
  const cmTrRe = (A: CMat): number => {
    let s = 0
    for (let i = 0; i < A.n; i++) s += A.re[i * A.n + i]!
    return s
  }
  const mkGen = (n: number, entries: readonly (readonly [number, number, number, number])[]): CMat => {
    const re = new Float64Array(n * n)
    const im = new Float64Array(n * n)
    for (const [r, c, vr, vi] of entries) {
      re[r * n + c] = vr
      im[r * n + c] = vi
    }
    return { n, re, im }
  }

  // SU(2) generators T^a = sigma^a / 2
  const T2: readonly CMat[] = [
    mkGen(2, [[0, 1, 0.5, 0], [1, 0, 0.5, 0]]),
    mkGen(2, [[0, 1, 0, -0.5], [1, 0, 0, 0.5]]),
    mkGen(2, [[0, 0, 0.5, 0], [1, 1, -0.5, 0]]),
  ]
  // SU(3) Gell-Mann generators T^A = lambda^A / 2
  const inv2sq3 = 1 / (2 * SQRT3)
  const T3: readonly CMat[] = [
    mkGen(3, [[0, 1, 0.5, 0], [1, 0, 0.5, 0]]),
    mkGen(3, [[0, 1, 0, -0.5], [1, 0, 0, 0.5]]),
    mkGen(3, [[0, 0, 0.5, 0], [1, 1, -0.5, 0]]),
    mkGen(3, [[0, 2, 0.5, 0], [2, 0, 0.5, 0]]),
    mkGen(3, [[0, 2, 0, -0.5], [2, 0, 0, 0.5]]),
    mkGen(3, [[1, 2, 0.5, 0], [2, 1, 0.5, 0]]),
    mkGen(3, [[1, 2, 0, -0.5], [2, 1, 0, 0.5]]),
    mkGen(3, [[0, 0, inv2sq3, 0], [1, 1, inv2sq3, 0], [2, 2, -2 * inv2sq3, 0]]),
  ]

  // For external field A_ext = T^0 (with Tr(A_ext^2) = 1/2) and quantum fluctuation A_q = sum_a phi_a T^a (<phi_a phi_b> = delta_ab):
  //   - Fundamental 1 - Re Tr(U)/N: kin = (1/(2N)) Tr(A_ext^2), quartic = -(1/(24N)) <4 Tr(A_ext^2 A_q^2) + 2 Tr(A_ext A_q A_ext A_q)>
  //   - Re Tr(U^2)/N: A -> 2 A => kin * 4, quartic * 16 => gamma = 4
  //   - Adjoint 1 - (|Tr(U)|^2 - 1)/(N^2 - 1):
  //       kin = (N/(N^2 - 1)) Tr(A_ext^2),
  //       quartic = -(1/(N^2 - 1)) [ (N/12) <4 Tr(A_ext^2 A_q^2) + 2 Tr(A_ext A_q A_ext A_q)>
  //                                + (1/4) <2 Tr(A_ext^2) Tr(A_q^2) + 4 (Tr(A_ext A_q))^2> ]
  const evalGamma = (T: readonly CMat[], N: number) => {
    const ext = T[0]!
    const ext2 = cmMul(ext, ext)
    const trExt2 = cmTrRe(ext2)
    let sumTrExt2Q2 = 0
    let sumTrExtQExtQ = 0
    let sumTrQ2 = 0
    let sumTrExtQ_sq = 0
    for (const Ta of T) {
      const Ta2 = cmMul(Ta, Ta)
      sumTrExt2Q2 += cmTrRe(cmMul(ext2, Ta2))
      const eTa = cmMul(ext, Ta)
      sumTrExtQExtQ += cmTrRe(cmMul(eTa, eTa))
      sumTrQ2 += cmTrRe(Ta2)
      const teq = cmTrRe(eTa)
      sumTrExtQ_sq += teq * teq
    }
    const wickTrA4 = 4 * sumTrExt2Q2 + 2 * sumTrExtQExtQ
    const wickTrA2Sq = 2 * trExt2 * sumTrQ2 + 4 * sumTrExtQ_sq

    const rFund = (wickTrA4 / (24 * N)) / (trExt2 / (2 * N))
    const rU2 = (16 * wickTrA4 / (24 * N)) / (4 * trExt2 / (2 * N))
    const rAdj = ((N / 12) * wickTrA4 + 0.25 * wickTrA2Sq) / (N * trExt2)
    return { rFund, gammaU2: rU2 / rFund, gammaAdj: rAdj / rFund }
  }

  const su2 = evalGamma(T2, 2)
  const su3 = evalGamma(T3, 3)
  return { gammaSu2Adj: su2.gammaAdj, gammaSu3U2: su3.gammaU2, gammaSu3Adj: su3.gammaAdj }
}

function runPart4(
  geom: D4Geometry,
  g2T: readonly Quat[],
  g2I: readonly Quat[],
  gS648: readonly M3[],
  gS1080: readonly M3[],
  specS648: readonly SpectrumEntry[],
  latD4Ref: LatSpec,
  betaFD4_L4: number,
): void {
  console.log('\n=================================================================================')
  console.log('PART 4 (GATE G4, Tier A+B+C): NATIVE 4D D_4 SYMANZIK & ADJOINT ACTIONS AUDIT')
  console.log('=================================================================================')

  // 1. Exact 4D D_4 loop census
  const [nTriL, nRhL, nOctL, nDiagL] = geom.perLinkCounts
  assert(
    geom.posPrim.length === 12 &&
      geom.tris.length === 32 &&
      geom.rhombi.length === 48 &&
      geom.octSqs.length === 6 &&
      geom.diagSqs.length === 12,
    `D_4 loop census mismatch: links=${geom.posPrim.length}, tris=${geom.tris.length}, rhombi=${geom.rhombi.length}, oct=${geom.octSqs.length}, diag=${geom.diagSqs.length}`,
  )
  assert(
    nTriL === 8 && nRhL === 16 && nOctL === 2 && nDiagL === 4,
    `D_4 loops-per-link mismatch: got (${nTriL}, ${nRhL}, ${nOctL}, ${nDiagL})`,
  )
  console.log(
    `  [Census] 12 pos links | 32 tris (${nTriL}/link) | 48 rhombi (${nRhL}/link) | 6 octSqs (${nOctL}/link) | 12 diagSqs (${nDiagL}/link)`,
  )

  // 2. Tree-level O(k^2), O(k^4) isotropy across 4 axes
  const inv2 = 1 / Math.SQRT2
  const inv3 = 1 / SQRT3
  const axes: readonly [string, readonly [number, number, number, number], readonly [number, number, number, number]][] = [
    ['(1,0,0,0)', [1, 0, 0, 0], [0, 1, 0, 0]],
    ['(1,1,0,0)', [inv2, inv2, 0, 0], [inv2, -inv2, 0, 0]],
    ['(1,1,1,0)', [inv3, inv3, inv3, 0], [inv2, -inv2, 0, 0]],
    ['(1,1,1,1)', [0.5, 0.5, 0.5, 0.5], [0.5, -0.5, 0.5, -0.5]],
  ]
  let maxRhombIsoErr = 0
  let symA4Axis0 = 0
  let symA4Axis3 = 0
  let octSymA4Axis0 = 0
  let octSymA4Axis1 = 0
  for (let ai = 0; ai < axes.length; ai++) {
    const [label, nHat, eps] = axes[ai]!
    const tTri = evalLoopFamilyTreeA2A4(geom.trisR4, nHat, eps)
    const tRh = evalLoopFamilyTreeA2A4(geom.rhombiR4, nHat, eps)
    const tOct = evalLoopFamilyTreeA2A4(geom.octSqsR4, nHat, eps)
    const rTri = tTri.A4 / tTri.A2
    const rRh = tRh.A4 / tRh.A2
    const rOct = tOct.A4 / tOct.A2
    const errRh = Math.abs(rRh - -1 / 12)
    if (errRh > maxRhombIsoErr) maxRhombIsoErr = errRh
    const symA4 = (4 / 3) * tTri.A4 + (-1 / 18) * tRh.A4
    const octSymA4 = (4 / 3) * tTri.A4 + (-1 / 3) * tOct.A4
    if (ai === 0) {
      symA4Axis0 = Math.abs(symA4)
      octSymA4Axis0 = Math.abs(octSymA4)
    }
    if (ai === 1) {
      octSymA4Axis1 = Math.abs(octSymA4)
    }
    if (ai === 3) {
      symA4Axis3 = Math.abs(symA4)
    }
    console.log(
      `  [Tree ${label}] tri A4/A2=${rTri.toFixed(6)} | rhomb A4/A2=${rRh.toFixed(6)} (-1/12=${(-1 / 12).toFixed(6)}) | ` +
        `octSq A4/A2=${rOct.toFixed(6)} | Sym(tri+rh) A4=${symA4.toExponential(1)} | Sym(tri+oct) A4=${octSymA4.toExponential(1)}`,
    )
  }
  assert(maxRhombIsoErr < 1e-4, `Rhombus SO(4) isotropy A4/A2 = -1/12 failed: err=${maxRhombIsoErr}`)
  assert(symA4Axis0 < 1e-4 && symA4Axis3 < 1e-4, `Symanzik (4/3,-1/18) A4 cancellation failed`)
  assert(octSymA4Axis0 < 1e-4 && octSymA4Axis1 > 0.05, `octSq Symanzik anisotropy check failed`)

  // 3. Sparse single-pass nGrid = 8 half-BZ Cholesky solver across all 5 actions simultaneously
  const actions: readonly ImprovedActionSpec[] = [
    { name: 'Wilson (1, 0, 0)         ', cTri: 1, cRhomb: 0, cOct: 0 },
    { name: 'Sym tri+rh (4/3,-1/18,0) ', cTri: 4 / 3, cRhomb: -1 / 18, cOct: 0 },
    { name: 'Sym tri+oct (4/3,0,-1/3) ', cTri: 4 / 3, cRhomb: 0, cOct: -1 / 3 },
    { name: 'Pos tri+rh (1/2,1/12,0)  ', cTri: 0.5, cRhomb: 1 / 12, cOct: 0 },
    { name: 'Pos tri+oct (1/2,0,1/2)  ', cTri: 0.5, cRhomb: 0, cOct: 0.5 },
  ]
  const actResults = solveD4ActionsSinglePass(geom, actions, 8)
  console.log('\n  --- Single-Pass Sparse Half-BZ (nGrid=8) Cholesky Audit Across 5 Native D_4 Actions ---')
  const bZ4TI_S648: number[] = []
  const betaF_S648: number[] = []
  for (let i = 0; i < actResults.length; i++) {
    const r = actResults[i]!
    assert(r.fails === 0, `Cholesky failure in action ${r.spec.name}: fails=${r.fails}`)
    assert(r.sdErrMax < 1e-11, `Schwinger-Dyson identity failed for ${r.spec.name}: err=${r.sdErrMax}`)
    // Lepage-Mackenzie tadpole improvement uses the elementary triangle plaquette deficit kpTri
    // (for pure Wilson (1,0,0), kpTri === 11/32 exactly).
    const latAct: LatSpec = {
      name: 'D_4',
      n: 12,
      f: 11,
      nl: r.nlEff,
      kp: r.kpTri,
      kappa: 2.0,
      cL: r.cL,
    }
    const fS648 = solveFreezingWeighted(3, V_SU3, 648, specS648, latAct)
    bZ4TI_S648.push(fS648.bZ4TI)
    betaF_S648.push(fS648.betaF)
    console.log(
      `  ${r.spec.name} | c_L=${r.cL.toFixed(4)} | kpTri=${r.kpTri.toFixed(5)} | nl=${r.nlEff.toFixed(2)} | ` +
        `S648: betaF=${fS648.betaF.toFixed(3)}, def=${fS648.deficit.toFixed(3)}, bZ4_TI=${fS648.bZ4TI.toFixed(3)}`,
    )
  }

  const kpTriWilson = actResults[0]!.kpTri
  const kpTriErr = Math.abs(kpTriWilson - 11 / 32)
  assert(kpTriErr < 1e-5, `kpTri(Wilson) expected 11/32=0.34375, got ${kpTriWilson}`)
  const symHurtsTI = bZ4TI_S648[1]! < bZ4TI_S648[0]!
  const posRhombGainRel = (bZ4TI_S648[3]! - bZ4TI_S648[0]!) / bZ4TI_S648[0]!
  assert(symHurtsTI, `Expected Symanzik (4/3,-1/18) to hurt bZ4_TI on Sigma(648): ${bZ4TI_S648[1]} vs ${bZ4TI_S648[0]}`)
  assert(
    posRhombGainRel < 0.12,
    `Expected positive rhombus TI gain < 12% on Sigma(648), got ${(posRhombGainRel * 100).toFixed(2)}%`,
  )
  console.log(
    `  [Symanzik Verdict] Sym(4/3,-1/18) lowers S648 bZ4_TI (${bZ4TI_S648[0]!.toFixed(3)} -> ${bZ4TI_S648[1]!.toFixed(3)}); ` +
      `Pos(1/2,1/12) TI gain = +${(posRhombGainRel * 100).toFixed(2)}% (< 12%, far short of 5.69)`,
  )

  // 4. Exact Lie-algebra Wick contractions (gamma = 4 and gamma = 3) & 1-loop tadMult = 0 ceiling
  const wick = verifyLieAlgebraWickGamma()
  assertClose(wick.gammaSu2Adj, 4.0, 1e-12, 'gamma(SU(2) adj)')
  assertClose(wick.gammaSu3U2, 4.0, 1e-12, 'gamma(SU(3) Re Tr(U^2))')
  assertClose(wick.gammaSu3Adj, 3.0, 1e-12, 'gamma(SU(3) adj)')
  console.log(
    `\n  [Lie-Algebra Wick Contractions] gamma(SU(2) adj)=${wick.gammaSu2Adj.toFixed(6)} (4), ` +
      `gamma(SU(3) Re Tr U^2)=${wick.gammaSu3U2.toFixed(6)} (4), gamma(SU(3) adj)=${wick.gammaSu3Adj.toFixed(6)} (3)`,
  )

  // Evaluate 1-loop tadMult = 0 adjoint ceiling on 2T, 2I (r_* = -1/3) and Sigma(648), Sigma(1080) (r_* = -1/2)
  // s(g) = (1 - r) * (1 - q_F) + r * ((N^2 - 1)/(2 N^2)) * (1 - q_A)
  const evalAdjTad0SU2 = (name: string, G: readonly Quat[]): { readonly betaF: number; readonly bZ4_1L: number; readonly bZ4_ceil: number } => {
    const rStar = -1 / 3 // 1 + (4 - 1)*r = 0
    const defs = G.map(q => {
      const qF = q[0]
      const qA = (4 * qF * qF - 1) / 3
      return (1 - rStar) * (1 - qF) + rStar * (3 / 8) * (1 - qA)
    })
    assert(defs.every(d => d >= -1e-12), `Negative adjoint action in ${name}`)
    const sp = spectrumFromDeficits(defs)
    const fr = solveFreezingWeighted(2, V_SU2, G.length, sp, latD4Ref, 0.0)
    const bZ4Ceil = 2 * fr.beta0 - 4 * (cTotD4SuN(2, 0.0) - cTotZ4SuN(2))
    console.log(
      `  [Adj tadMult=0] ${name.padEnd(11)}: betaF_eff=${fr.betaF.toFixed(3)} (beta0=${fr.beta0.toFixed(3)}) -> bZ4_1L=${fr.bZ4OneLoop.toFixed(3)} (dil->0 ceiling=${bZ4Ceil.toFixed(3)})`,
    )
    return { betaF: fr.betaF, bZ4_1L: fr.bZ4OneLoop, bZ4_ceil: bZ4Ceil }
  }
  const evalAdjTad0SU3 = (name: string, G: readonly M3[]): { readonly betaF: number; readonly bZ4_1L: number; readonly bZ4_ceil: number } => {
    const rStar = -1 / 2 // 1 + (3 - 1)*r = 0
    const defs = G.map(M => {
      const trRe = M[0]! + M[8]! + M[16]!
      const trIm = M[1]! + M[9]! + M[17]!
      const qF = trRe / 3
      const qA = (trRe * trRe + trIm * trIm - 1) / 8
      return (1 - rStar) * (1 - qF) + rStar * (8 / 18) * (1 - qA)
    })
    assert(defs.every(d => d >= -1e-12), `Negative adjoint action in ${name}`)
    const sp = spectrumFromDeficits(defs)
    const fr = solveFreezingWeighted(3, V_SU3, G.length, sp, latD4Ref, 0.0)
    const bZ4Ceil = 2 * fr.beta0 - 6 * (cTotD4SuN(3, 0.0) - cTotZ4SuN(3))
    console.log(
      `  [Adj tadMult=0] ${name.padEnd(11)}: betaF_eff=${fr.betaF.toFixed(3)} (beta0=${fr.beta0.toFixed(3)}) -> bZ4_1L=${fr.bZ4OneLoop.toFixed(3)} (dil->0 ceiling=${bZ4Ceil.toFixed(3)})`,
    )
    return { betaF: fr.betaF, bZ4_1L: fr.bZ4OneLoop, bZ4_ceil: bZ4Ceil }
  }

  evalAdjTad0SU2('2T(24)', g2T)
  evalAdjTad0SU2('2I(120)', g2I)
  const adjS648 = evalAdjTad0SU3('Sigma(648)', gS648)
  const adjS1080 = evalAdjTad0SU3('Sigma(1080)', gS1080)

  const g4Ok =
    geom.tris.length === 32 &&
    geom.rhombi.length === 48 &&
    geom.octSqs.length === 6 &&
    geom.diagSqs.length === 12 &&
    kpTriErr < 1e-5 &&
    maxRhombIsoErr < 1e-4 &&
    symA4Axis0 < 1e-4 &&
    symA4Axis3 < 1e-4 &&
    symHurtsTI &&
    posRhombGainRel < 0.12 &&
    Math.abs(wick.gammaSu2Adj - 4) < 1e-12 &&
    Math.abs(wick.gammaSu3U2 - 4) < 1e-12 &&
    Math.abs(wick.gammaSu3Adj - 3) < 1e-12 &&
    adjS648.bZ4_1L < 5.69 &&
    adjS648.bZ4_ceil < 5.69 &&
    betaFD4_L4 > BETA_D4_GUT_SU3

  recordGate(
    'G4',
    'Tier A+B+C',
    'Native 4D D_4 Symanzik & adjoint improved actions honest audit',
    g4Ok,
    `Census=(32,48,6,12), kpTri(Wilson)=${kpTriWilson.toFixed(5)} (11/32), Sym(4/3,-1/18) lowers S648 TI (${bZ4TI_S648[0]!.toFixed(2)}->${bZ4TI_S648[1]!.toFixed(2)}), ` +
      `PosRhomb gain=+${(posRhombGainRel * 100).toFixed(1)}% (<12%), Wick gamma=(4,4,3), ` +
      `Adj tadMult=0 S648=${adjS648.bZ4_1L.toFixed(2)} (ceil=${adjS648.bZ4_ceil.toFixed(2)}<5.69, S1080=${adjS1080.bZ4_1L.toFixed(2)}), vs L=4 D4=${betaFD4_L4.toFixed(3)}>10.773`,
  )
}

// =================================================================================================
// PART 5 — GATE G5: EXACT LOCAL GAUGE INVARIANCE, GAUSS LAW, 1-LOOP D_4 b_0 & LINK DIMENSIONS
// =================================================================================================

// Complex N-vector inner product Re(u^dag M v) for N=2 (quaternion) and N=3 (M3)
function su2HopTerm(psiX: readonly [number, number, number, number], q: Quat, psiY: readonly [number, number, number, number]): number {
  // U(q) = [[q0 - i q3, -q2 - i q1], [q2 - i q1, q0 + i q3]]
  const u00r = q[0]
  const u00i = -q[3]
  const u01r = -q[2]
  const u01i = -q[1]
  const u10r = q[2]
  const u10i = -q[1]
  const u11r = q[0]
  const u11i = q[3]
  const y0r = psiY[0]
  const y0i = psiY[1]
  const y1r = psiY[2]
  const y1i = psiY[3]
  const w0r = u00r * y0r - u00i * y0i + u01r * y1r - u01i * y1i
  const w0i = u00r * y0i + u00i * y0r + u01r * y1i + u01i * y1r
  const w1r = u10r * y0r - u10i * y0i + u11r * y1r - u11i * y1i
  const w1i = u10r * y0i + u10i * y0r + u11r * y1i + u11i * y1r
  return psiX[0] * w0r + psiX[1] * w0i + psiX[2] * w1r + psiX[3] * w1i
}

function su2ActSpinor(q: Quat, psi: readonly [number, number, number, number]): readonly [number, number, number, number] {
  const u00r = q[0]
  const u00i = -q[3]
  const u01r = -q[2]
  const u01i = -q[1]
  const u10r = q[2]
  const u10i = -q[1]
  const u11r = q[0]
  const u11i = q[3]
  const y0r = psi[0]
  const y0i = psi[1]
  const y1r = psi[2]
  const y1i = psi[3]
  return [
    u00r * y0r - u00i * y0i + u01r * y1r - u01i * y1i,
    u00r * y0i + u00i * y0r + u01r * y1i + u01i * y1r,
    u10r * y0r - u10i * y0i + u11r * y1r - u11i * y1i,
    u10r * y0i + u10i * y0r + u11r * y1i + u11i * y1r,
  ]
}

function su3ActSpinor(M: M3, psi: C3): C3 {
  const vr0 = psi[0]
  const vi0 = psi[1]
  const vr1 = psi[2]
  const vi1 = psi[3]
  const vr2 = psi[4]
  const vi2 = psi[5]
  return [
    M[0]! * vr0 - M[1]! * vi0 + M[2]! * vr1 - M[3]! * vi1 + M[4]! * vr2 - M[5]! * vi2,
    M[0]! * vi0 + M[1]! * vr0 + M[2]! * vi1 + M[3]! * vr1 + M[4]! * vi2 + M[5]! * vr2,
    M[6]! * vr0 - M[7]! * vi0 + M[8]! * vr1 - M[9]! * vi1 + M[10]! * vr2 - M[11]! * vi2,
    M[6]! * vi0 + M[7]! * vr0 + M[8]! * vi1 + M[9]! * vr1 + M[10]! * vi2 + M[11]! * vr2,
    M[12]! * vr0 - M[13]! * vi0 + M[14]! * vr1 - M[15]! * vi1 + M[16]! * vr2 - M[17]! * vi2,
    M[12]! * vi0 + M[13]! * vr0 + M[14]! * vi1 + M[15]! * vr1 + M[16]! * vi2 + M[17]! * vr2,
  ]
}

function su3HopTerm(psiX: C3, M: M3, psiY: C3): number {
  const w = su3ActSpinor(M, psiY)
  return (
    psiX[0] * w[0] +
    psiX[1] * w[1] +
    psiX[2] * w[2] +
    psiX[3] * w[3] +
    psiX[4] * w[4] +
    psiX[5] * w[5]
  )
}

// Non-circular 1-loop 4D D_4 background-field asymptotic freedom via exact analytic-k_3 3D BZ integral
// Integrates the positive octant [0, pi)^3 with L = 96 midpoints per axis (dk = pi / L, exact 8x parity
// reduction of the 192^3 full [0, 2pi)^3 BZ) and exploits exact 2x k_0 <-> k_1 symmetry.
function computeD4BackgroundFieldBeta0(L: number, m2Low: number, m2High: number): {
  readonly cOrbSU2: number
  readonly cParaSU2: number
  readonly b0SU2: number
  readonly b0SU3: number
} {
  const cosTab = new Float64Array(L)
  const sin2Tab = new Float64Array(L)
  for (let i = 0; i < L; i++) {
    const k = (PI * (i + 0.5)) / L
    cosTab[i] = Math.cos(k)
    const s = Math.sin(k)
    sin2Tab[i] = s * s
  }

  const evalAtM2 = (m2: number): { readonly jOrb: number; readonly jPara: number } => {
    let sumOrb = 0
    let sumPara = 0
    const invL3 = 1 / (L * L * L)
    for (let i0 = 0; i0 < L; i0++) {
      const c0 = cosTab[i0]!
      const s0sq = sin2Tab[i0]!
      for (let i1 = i0; i1 < L; i1++) {
        const c1 = cosTab[i1]!
        const s1sq = sin2Tab[i1]!
        const symW = i1 === i0 ? 1 : 2
        const c0c1 = c0 * c1
        const c0p1 = c0 + c1
        const s01sq = s0sq * s1sq
        for (let i2 = 0; i2 < L; i2++) {
          const c2 = cosTab[i2]!
          const A = m2 + 4 - (2 / 3) * (c0c1 + c0p1 * c2)
          const B = (2 / 3) * (c0p1 + c2)
          const S = Math.sqrt(A * A - B * B)
          const invS3 = 1 / (S * S * S)
          const I0 = A * invS3
          const I1 = B * invS3
          // Cancellation-free exact analytic integral (1/2pi) int cos^2(k3)/(A - B cos k3)^2 dk3
          const I2 = (A * S + B * B) / ((A + S) * S * S * S)

          const P0 = (4 / 9) * (c0c1 * (c1 + c2) * (c0 + c2) - s01sq)
          const P1 = (4 / 9) * c0c1 * (c0p1 + 2 * c2)
          const P2 = (4 / 9) * c0c1

          sumPara += symW * I0
          sumOrb += symW * (P0 * I0 + P1 * I1 + P2 * I2)
        }
      }
    }
    // Divide by V_cell = 2 for the 4D D_4 Brillouin zone volume Vol(BZ_{D4}) = (2pi)^4 / 2
    return { jOrb: 0.5 * sumOrb * invL3, jPara: 0.5 * sumPara * invL3 }
  }

  const rLow = evalAtM2(m2Low)
  const rHigh = evalAtM2(m2High)
  const dLnM2 = Math.log(m2High / m2Low)
  // Scope note: The 1-loop 4D D_4 lattice dispersion integrals J_orb(M^2) and J_para(M^2) enter inside
  // the standard continuum background-field orbital (+C_A / 12) and spin-1 paramagnetic (-4 C_A) prefactors:
  //   For SU(2) (C_A = 2):
  //     Delta_orb(1/g^2)  = +(C_A / 12) * J_orb(M^2)  -> slope +2 / (48 pi^2) (screening)
  //     Delta_para(1/g^2) = -4 * C_A * J_para(M^2)    -> slope -24 / (48 pi^2) (antiscreening)
  //   and b0SU3 = 1.5 * b0SU2 scales directly by the adjoint Casimir ratio C_A(3) / C_A(2) = 3/2.
  const cOrbSU2 = ((2 / 12) * (rLow.jOrb - rHigh.jOrb)) / dLnM2
  const cParaSU2 = (-8 * (rLow.jPara - rHigh.jPara)) / dLnM2
  const b0SU2 = -(cOrbSU2 + cParaSU2)
  const b0SU3 = 1.5 * b0SU2
  return { cOrbSU2, cParaSU2, b0SU2, b0SU3 }
}

function runPart5(
  g2T: readonly Quat[],
  gDic3: readonly Quat[],
  qWbare: Quat,
  qS23: Quat,
  ladder2T: readonly SU2LadderLevel[],
  ladderDic3: readonly SU2LadderLevel[],
  gS648: readonly M3[],
  mClock: M3,
  mShift: M3,
  mHessV: M3,
  mPhaseT: M3,
  mubKets: readonly C3[],
  ladderSU3: readonly SU3LadderLevel[],
  cosetGens8: readonly M3[],
): void {
  console.log('\n=================================================================================')
  console.log('PART 5 (GATE G5, Tier A+B+C): LOCAL GAUGE INVARIANCE, GAUSS LAW, D_4 b_0 & LINKS')
  console.log('=================================================================================')

  // 1A. SU(2) local gauge invariance & Gauss law on 4D D_4 3-vertex triangle + matter spinors
  const psi2_0: readonly [number, number, number, number] = [0.6, -0.2, 0.5, 0.4]
  const psi2_1: readonly [number, number, number, number] = [-0.3, 0.7, 0.2, -0.5]
  const psi2_2: readonly [number, number, number, number] = [0.4, 0.3, -0.6, 0.2]

  let su2Escapes = 0
  let su2MaxInvErr = 0
  let su2FiltEscapes = 0
  let su2FiltMaxInvErr = 0
  let su2NegPlaqViol = 0
  let su2NegHopViol = 0

  for (const [label, G0, ladder] of [
    ['2T+W_bare', g2T, ladder2T],
    ['Dic_3+S_23', gDic3, ladderDic3],
  ] as const) {
    // Local G_0 gauge transformations across L = 0, 1, 2
    for (let L = 0; L <= 2; L++) {
      const lv = ladder[L]!
      const nW = lv.elems.length
      for (let cfg = 0; cfg < 8; cfg++) {
        const U01 = lv.elems[(cfg * 17 + 3) % nW]!
        const U12 = lv.elems[(cfg * 31 + 7) % nW]!
        const U20 = lv.elems[(cfg * 53 + 11) % nW]!
        const Om0 = G0[(cfg * 3 + 1) % G0.length]!
        const Om1 = G0[(cfg * 5 + 2) % G0.length]!
        const Om2 = G0[(cfg * 7 + 4) % G0.length]!

        const W0 = qMul(qMul(U01, U12), U20)[0]
        const H0 =
          su2HopTerm(psi2_0, U01, psi2_1) +
          su2HopTerm(psi2_1, U12, psi2_2) +
          su2HopTerm(psi2_2, U20, psi2_0)

        const U01p = qMul(qMul(Om0, U01), qConj(Om1))
        const U12p = qMul(qMul(Om1, U12), qConj(Om2))
        const U20p = qMul(qMul(Om2, U20), qConj(Om0))
        if (!lv.elemKeys.has(qKey(U01p))) su2Escapes++
        if (!lv.elemKeys.has(qKey(U12p))) su2Escapes++
        if (!lv.elemKeys.has(qKey(U20p))) su2Escapes++

        const W1 = qMul(qMul(U01p, U12p), U20p)[0]
        const H1 =
          su2HopTerm(su2ActSpinor(Om0, psi2_0), U01p, su2ActSpinor(Om1, psi2_1)) +
          su2HopTerm(su2ActSpinor(Om1, psi2_1), U12p, su2ActSpinor(Om2, psi2_2)) +
          su2HopTerm(su2ActSpinor(Om2, psi2_2), U20p, su2ActSpinor(Om0, psi2_0))

        su2MaxInvErr = Math.max(su2MaxInvErr, Math.abs(W1 - W0), Math.abs(H1 - H0))
      }
    }

    // Non-Clifford Omega_x in W_1: graded filtration closure U'_xy in W_{L+2} (L=0 -> W_2; for Dic_3 also L=1 -> W_3)
    const maxFiltL = ladder.length - 3
    const W1Elems = ladder[1]!.elems
    for (let L = 0; L <= maxFiltL; L++) {
      const lvSrc = ladder[L]!
      const lvDst = ladder[L + 2]!
      for (let cfg = 0; cfg < 6; cfg++) {
        const U01 = lvSrc.elems[(cfg * 11 + 1) % lvSrc.elems.length]!
        const U12 = lvSrc.elems[(cfg * 13 + 2) % lvSrc.elems.length]!
        const U20 = lvSrc.elems[(cfg * 19 + 5) % lvSrc.elems.length]!
        // Pick genuine non-Clifford elements from W_1 \ G_0
        const Om0 = W1Elems[(G0.length + cfg * 17 + 1) % W1Elems.length]!
        const Om1 = W1Elems[(G0.length + cfg * 29 + 3) % W1Elems.length]!
        const Om2 = W1Elems[(G0.length + cfg * 41 + 5) % W1Elems.length]!

        const W0 = qMul(qMul(U01, U12), U20)[0]
        const H0 =
          su2HopTerm(psi2_0, U01, psi2_1) +
          su2HopTerm(psi2_1, U12, psi2_2) +
          su2HopTerm(psi2_2, U20, psi2_0)
        const U01p = qMul(qMul(Om0, U01), qConj(Om1))
        const U12p = qMul(qMul(Om1, U12), qConj(Om2))
        const U20p = qMul(qMul(Om2, U20), qConj(Om0))
        if (!lvDst.elemKeys.has(qKey(U01p))) su2FiltEscapes++
        if (!lvDst.elemKeys.has(qKey(U12p))) su2FiltEscapes++
        if (!lvDst.elemKeys.has(qKey(U20p))) su2FiltEscapes++

        const W1 = qMul(qMul(U01p, U12p), U20p)[0]
        const H1 =
          su2HopTerm(su2ActSpinor(Om0, psi2_0), U01p, su2ActSpinor(Om1, psi2_1)) +
          su2HopTerm(su2ActSpinor(Om1, psi2_1), U12p, su2ActSpinor(Om2, psi2_2)) +
          su2HopTerm(su2ActSpinor(Om2, psi2_2), U20p, su2ActSpinor(Om0, psi2_0))
        su2FiltMaxInvErr = Math.max(su2FiltMaxInvErr, Math.abs(W1 - W0), Math.abs(H1 - H0))
      }
    }

    // Negative control (only for 2T+W_bare): transform U_01 -> Omega_0 U_01 without Omega_1^dag across 8 configs
    if (label === '2T+W_bare') {
      const lv = ladder[1]!
      for (let cfg = 0; cfg < 8; cfg++) {
        const U01 = lv.elems[(cfg * 37 + 30) % lv.elems.length]!
        const U12 = lv.elems[(cfg * 61 + 80) % lv.elems.length]!
        const U20 = lv.elems[(cfg * 89 + 140) % lv.elems.length]!
        const Om0 = Q_I
        const W0 = qMul(qMul(U01, U12), U20)[0]
        const H0 = su2HopTerm(psi2_0, U01, psi2_1)
        const U01bad = qMul(Om0, U01)
        const Wbad = qMul(qMul(U01bad, U12), U20)[0]
        const Hbad = su2HopTerm(psi2_0, U01bad, psi2_1)
        su2NegPlaqViol = Math.max(su2NegPlaqViol, Math.abs(Wbad - W0))
        su2NegHopViol = Math.max(su2NegHopViol, Math.abs(Hbad - H0))
      }
    }
  }

  // Exact conjugacy invariance h S h^-1 = S on bi-G_0-invariant shell S = G_0 T^{+-1} G_0 for 2T+W_bare & Dic_3+S_23
  let su2ShellConjViol = 0
  for (const [G0, T, W1] of [
    [g2T, qWbare, ladder2T[1]!],
    [gDic3, qS23, ladderDic3[1]!],
  ] as const) {
    const g0Keys = new Set<string>(G0.map(q => qKey(q)))
    const shell = W1.elems.filter(q => !g0Keys.has(qKey(q)))
    const shellKeys = new Set<string>(shell.map(q => qKey(q)))
    assert(shell.length === W1.elems.length - G0.length && T[0] < 1, 'SU(2) shell extraction failed')
    for (const h of G0) {
      const hInv = qConj(h)
      for (const s of shell) {
        const c = qMul(qMul(h, s), hInv)
        if (!shellKeys.has(qKey(c))) su2ShellConjViol++
      }
    }
  }

  // 1B. SU(3) local gauge invariance, Gauss law shell conjugacy, filtration closure & negative control
  const psi3_0: C3 = [0.5, -0.2, 0.4, 0.3, -0.6, 0.1]
  const psi3_1: C3 = [-0.4, 0.5, 0.2, -0.3, 0.5, 0.4]
  const psi3_2: C3 = [0.3, 0.4, -0.5, 0.2, 0.1, -0.6]

  let su3Escapes = 0
  let su3MaxInvErr = 0
  let su3FiltEscapes = 0
  let su3FiltMaxInvErr = 0

  for (let L = 0; L <= 2; L++) {
    const lv = ladderSU3[L]!
    const lvDst = ladderSU3[L + 2]!
    for (let cfg = 0; cfg < 8; cfg++) {
      const c01 = lv.cosets[(cfg * 5) % lv.cosets.length]!
      const c12 = lv.cosets[(cfg * 7 + 1) % lv.cosets.length]!
      const c20 = lv.cosets[(cfg * 11 + 2) % lv.cosets.length]!
      const U01 = m3Mul(c01, gS648[(cfg * 47 + 3) % 648]!)
      const U12 = m3Mul(c12, gS648[(cfg * 89 + 11) % 648]!)
      const U20 = m3Mul(c20, gS648[(cfg * 131 + 19) % 648]!)

      const W0 = m3ReTr(m3Mul(m3Mul(U01, U12), U20)) / 3
      const H0 =
        su3HopTerm(psi3_0, U01, psi3_1) +
        su3HopTerm(psi3_1, U12, psi3_2) +
        su3HopTerm(psi3_2, U20, psi3_0)

      // Local Omega_x in Sigma(648)
      const Om0 = gS648[(cfg * 23 + 5) % 648]!
      const Om1 = gS648[(cfg * 41 + 13) % 648]!
      const Om2 = gS648[(cfg * 67 + 29) % 648]!
      const U01p = m3Mul(m3Mul(Om0, U01), m3Dag(Om1))
      const U12p = m3Mul(m3Mul(Om1, U12), m3Dag(Om2))
      const U20p = m3Mul(m3Mul(Om2, U20), m3Dag(Om0))
      if (!lv.cosetHashes.has(mubCosetHash(U01p, mubKets))) su3Escapes++
      if (!lv.cosetHashes.has(mubCosetHash(U12p, mubKets))) su3Escapes++
      if (!lv.cosetHashes.has(mubCosetHash(U20p, mubKets))) su3Escapes++

      const W1 = m3ReTr(m3Mul(m3Mul(U01p, U12p), U20p)) / 3
      const H1 =
        su3HopTerm(su3ActSpinor(Om0, psi3_0), U01p, su3ActSpinor(Om1, psi3_1)) +
        su3HopTerm(su3ActSpinor(Om1, psi3_1), U12p, su3ActSpinor(Om2, psi3_2)) +
        su3HopTerm(su3ActSpinor(Om2, psi3_2), U20p, su3ActSpinor(Om0, psi3_0))
      su3MaxInvErr = Math.max(su3MaxInvErr, Math.abs(W1 - W0), Math.abs(H1 - H0))

      // Non-Clifford Omega_x in W_1 \ Sigma(648) -> graded filtration U'_xy in W_{L+2}
      const nOm0 = m3Mul(cosetGens8[(cfg * 3) % 8]!, Om0)
      const nOm1 = m3Mul(cosetGens8[(cfg * 5 + 1) % 8]!, Om1)
      const nOm2 = m3Mul(cosetGens8[(cfg * 7 + 2) % 8]!, Om2)
      const f01 = m3Mul(m3Mul(nOm0, U01), m3Dag(nOm1))
      const f12 = m3Mul(m3Mul(nOm1, U12), m3Dag(nOm2))
      const f20 = m3Mul(m3Mul(nOm2, U20), m3Dag(nOm0))
      if (!lvDst.cosetHashes.has(mubCosetHash(f01, mubKets))) su3FiltEscapes++
      if (!lvDst.cosetHashes.has(mubCosetHash(f12, mubKets))) su3FiltEscapes++
      if (!lvDst.cosetHashes.has(mubCosetHash(f20, mubKets))) su3FiltEscapes++

      const Wf = m3ReTr(m3Mul(m3Mul(f01, f12), f20)) / 3
      const Hf =
        su3HopTerm(su3ActSpinor(nOm0, psi3_0), f01, su3ActSpinor(nOm1, psi3_1)) +
        su3HopTerm(su3ActSpinor(nOm1, psi3_1), f12, su3ActSpinor(nOm2, psi3_2)) +
        su3HopTerm(su3ActSpinor(nOm2, psi3_2), f20, su3ActSpinor(nOm0, psi3_0))
      su3FiltMaxInvErr = Math.max(su3FiltMaxInvErr, Math.abs(Wf - W0), Math.abs(Hf - H0))
    }
  }

  // Exact conjugacy invariance h S h^-1 = S for SU(3) shell S = Sigma(648) T_3 Sigma(648) (8 left cosets * 648):
  // Since S = union_{e in cosetGens8} e Sigma(648), for any h in Sigma(648),
  // h (e Sigma(648)) h^-1 = (h e) Sigma(648) is a left coset in S iff h e has its 12-MUB hash in shellHashes!
  const su3ShellHashes = new Set<string>(cosetGens8.map(e => mubCosetHash(e, mubKets)))
  assert(su3ShellHashes.size === 8, 'SU(3) shell must have exactly 8 left cosets')
  let su3ShellConjViol = 0
  for (const h of [mClock, mShift, mHessV, mPhaseT]) {
    for (const e of cosetGens8) {
      const he = m3Mul(h, e)
      if (!su3ShellHashes.has(mubCosetHash(he, mubKets))) su3ShellConjViol++
    }
  }
  // Also explicitly verify [G_x(h), E^2] = 0 on the 25-state left-coset electric operator E^2 (2T+W_bare, L=1)
  // Using 2T-coset basis C_1 (25 states): L_h permutes C_1, E^2_S averages over S; verify ||L_h K_S - K_S L_h||_inf === 0!
  const shell2TKeys = new Set<string>(
    ladder2T[1]!.elems.filter(q => !ladder2T[0]!.elemKeys.has(qKey(q))).map(q => qKey(q)),
  )
  const w1Idx = new Map<string, number>(ladder2T[1]!.elems.map((q, i) => [qKey(q), i]))
  // Verify exact operator commutator on a deterministic test vector psi in L^2(W_1) (600 dim):
  // (L_h K_S - K_S L_h) psi === 0 for h in 2T generators, because h S h^-1 = S!
  const testPsi = new Float64Array(600)
  for (let i = 0; i < 600; i++) testPsi[i] = Math.sin(0.37 * i + 0.11)
  const hOp = g2T[7]!
  const hOpInv = qConj(hOp)
  let commErrE2 = 0
  // Check at 24 sample basis indices u in W_1:
  // (L_h K_S psi)(u) = sum_{s in S} psi(s^-1 h^-1 u) vs (K_S L_h psi)(u) = sum_{s in S} psi(h^-1 s^-1 u)
  // Using shell membership s in S => h^-1 s h in S:
  const shell2T = ladder2T[1]!.elems.filter(q => shell2TKeys.has(qKey(q)))
  for (let bi = 0; bi < 24; bi++) {
    const u = ladder2T[0]!.elems[bi]! // u in W_0 so s^-1 u in W_1 (no boundary truncation at W_1)
    let lhs = 0
    let rhs = 0
    for (let si = 0; si < shell2T.length; si++) {
      const sInv = qConj(shell2T[si]!)
      const i1 = w1Idx.get(qKey(qMul(sInv, qMul(hOpInv, u))))!
      const i2 = w1Idx.get(qKey(qMul(hOpInv, qMul(sInv, u))))!
      lhs += testPsi[i1]!
      rhs += testPsi[i2]!
    }
    const diff = Math.abs(lhs - rhs) / shell2T.length
    if (diff > commErrE2) commErrE2 = diff
  }

  // SU(3) broken-covariance negative control: transform U_01 -> Om_0 U_01 without Om_1^dag
  const su3U01 = m3Mul(cosetGens8[0]!, gS648[17]!)
  const su3U12 = m3Mul(cosetGens8[3]!, gS648[101]!)
  const su3U20 = m3Mul(cosetGens8[5]!, gS648[211]!)
  const su3Om0 = gS648[73]!
  const su3W0 = m3ReTr(m3Mul(m3Mul(su3U01, su3U12), su3U20)) / 3
  const su3H0 = su3HopTerm(psi3_0, su3U01, psi3_1)
  const su3U01Bad = m3Mul(su3Om0, su3U01)
  const su3WBad = m3ReTr(m3Mul(m3Mul(su3U01Bad, su3U12), su3U20)) / 3
  const su3HBad = su3HopTerm(psi3_0, su3U01Bad, psi3_1)
  const su3NegPlaqViol = Math.abs(su3WBad - su3W0)
  const su3NegHopViol = Math.abs(su3HBad - su3H0)

  console.log(
    `  [Local G_0 Gauge & Gauss] SU(2) escapes=${su2Escapes}, maxErr=${su2MaxInvErr.toExponential(1)}, hSh^-1 viol=${su2ShellConjViol}, ||[L_h,K_S]||=${commErrE2.toExponential(1)}`,
  )
  console.log(
    `  [Local G_0 Gauge & Gauss] SU(3) escapes=${su3Escapes}, maxErr=${su3MaxInvErr.toExponential(1)}, hSh^-1 viol=${su3ShellConjViol}`,
  )
  console.log(
    `  [Filtration W_1 W_L W_1 subset W_{L+2}] SU(2) escapes=${su2FiltEscapes} (err=${su2FiltMaxInvErr.toExponential(1)}), ` +
      `SU(3) escapes=${su3FiltEscapes} (err=${su3FiltMaxInvErr.toExponential(1)})`,
  )
  console.log(
    `  [Negative Control] Broken covariance U_01 -> Om_0 U_01: SU(2) dW=${su2NegPlaqViol.toFixed(4)} (>0.1), dH=${su2NegHopViol.toFixed(4)}; ` +
      `SU(3) dW=${su3NegPlaqViol.toFixed(4)} (>0.1), dH=${su3NegHopViol.toFixed(4)}`,
  )

  // 2. Non-circular 1-loop 4D D_4 background-field asymptotic freedom (L = 96, M^2 = [0.001, 0.004])
  const bf = computeD4BackgroundFieldBeta0(96, 0.001, 0.004)
  const expOrbSU2 = 2 / (48 * PI * PI)
  const expParaSU2 = -24 / (48 * PI * PI)
  const expB0SU2 = 22 / (48 * PI * PI)
  const expB0SU3 = 11 / (16 * PI * PI)
  const orbRelErr = Math.abs(bf.cOrbSU2 / expOrbSU2 - 1)
  const paraRelErr = Math.abs(bf.cParaSU2 / expParaSU2 - 1)
  const b0Su2RelErr = Math.abs(bf.b0SU2 / expB0SU2 - 1)
  const b0Su3RelErr = Math.abs(bf.b0SU3 / expB0SU3 - 1)

  console.log('\n  --- Non-Circular 1-Loop 4D D_4 Background-Field Asymptotic Freedom (L=96, M^2=[0.001, 0.004]) ---')
  console.log(
    '  [Method Note] 4D D_4 dispersion integrals J_orb, J_para enter the continuum background-field orbital (+C_A/12)\n' +
      '                and spin-1 paramagnetic (-4 C_A) prefactors; b_0(SU(3)) = (3/2) b_0(SU(2)) scales by C_A(3)/C_A(2) = 3/2.',
  )
  console.log(
    `  Orbital diamagnetic (SU(2)):  ${bf.cOrbSU2.toFixed(6)} vs +2/(48 pi^2)=${expOrbSU2.toFixed(6)} (err=${(orbRelErr * 100).toFixed(2)}% < 2%)`,
  )
  console.log(
    `  Spin-1 paramagnetic (SU(2)): ${bf.cParaSU2.toFixed(6)} vs -24/(48 pi^2)=${expParaSU2.toFixed(6)} (err=${(paraRelErr * 100).toFixed(2)}% < 0.5%)`,
  )
  console.log(
    `  Total b_0(SU(2)):             ${bf.b0SU2.toFixed(6)} vs 22/(48 pi^2)=${expB0SU2.toFixed(6)} (err=${(b0Su2RelErr * 100).toFixed(2)}% < 0.5%)`,
  )
  console.log(
    `  Total b_0(SU(3)):             ${bf.b0SU3.toFixed(6)} vs 11/(16 pi^2)=${expB0SU3.toFixed(6)} (err=${(b0Su3RelErr * 100).toFixed(2)}% < 0.5%)`,
  )

  // 3. Honest Link Hilbert-Space Dimension Comparison Table (Tier C)
  console.log('\n  --- Honest Link Hilbert-Space Dimension Comparison (Tier C): Group Basis W_L vs Electric Irrep ---')
  console.log('  SU(2) Group Basis W_L (exact G_0 local gauge invariance; full Gamma in L->inf limit):')
  for (let L = 0; L <= 4; L++) {
    const n2T = L === 0 ? 24 : Math.round(24 * (1 + (24 / 22) * (Math.pow(23, L) - 1)))
    const nDic3 = Math.round(12 * (1 + (4 / 3) * (Math.pow(10, L) - 1)))
    console.log(
      `    L=${L}: 2T+W_bare d_link=${String(n2T).padStart(7)} (${Math.log2(n2T).toFixed(2)} qubits) | ` +
        `Dic_3+S_23 d_link=${String(nDic3).padStart(6)} (${Math.log2(nDic3).toFixed(2)} qubits)`,
    )
  }
  console.log('  SU(2) Electric / QLM Irrep Truncation sum_{j<=j_max} (2j+1)^2 (exact SU(2) Gauss law, non-unitary U):')
  for (const jMax of [0.5, 1, 2, 3, 5]) {
    let dim = 0
    for (let twoJ = 0; twoJ <= Math.round(2 * jMax); twoJ++) dim += (twoJ + 1) * (twoJ + 1)
    console.log(
      `    j_max=${jMax.toFixed(1)}: d_link=${String(dim).padStart(5)} (${Math.log2(dim).toFixed(2)} qubits)`,
    )
  }
  console.log('  SU(3) Group Basis W_L = Sigma(648)+T_3 (exact Sigma(648) local gauge invariance; Gamma in L->inf):')
  for (const lv of ladderSU3) {
    const qubits = Math.log2(lv.order)
    const trits = Math.log(lv.order) / Math.log(3)
    console.log(
      `    L=${lv.L}: d_link=${String(lv.order).padStart(7)} (${trits.toFixed(2)} trits / ${qubits.toFixed(2)} qubits) | D4 beta_f=${lv.d4.betaF.toFixed(3)}`,
    )
  }
  console.log('  SU(3) Electric / QLM Irrep Truncation sum_{p+q<=P_max} d(p,q)^2 (exact SU(3) Gauss law, truncated U):')
  for (const pMax of [1, 2, 3, 4, 6]) {
    let dim = 0
    for (let p = 0; p <= pMax; p++) {
      for (let q = 0; q <= pMax - p; q++) {
        const d = ((p + 1) * (q + 1) * (p + q + 2)) / 2
        dim += d * d
      }
    }
    const qubits = Math.log2(dim)
    const trits = Math.log(dim) / Math.log(3)
    console.log(
      `    P_max=${pMax}: d_link=${String(dim).padStart(5)} (${trits.toFixed(2)} trits / ${qubits.toFixed(2)} qubits)`,
    )
  }
  console.log(
    '  Scope note: Finite-L group basis W_L preserves exact G_0 (2T / Dic_3 / Sigma(648)) local gauge invariance\n' +
      '              and exact unitary diagonal plaquettes, recovering full dense-group Gamma-invariance in the\n' +
      '              L -> infinity inductive limit; electric/irrep bases use fewer qubits/trits per link at the\n' +
      '              cost of truncating the link unitary operator U.',
  )

  const g5Ok =
    su2Escapes === 0 &&
    su3Escapes === 0 &&
    su2MaxInvErr < 1e-13 &&
    su3MaxInvErr < 1e-13 &&
    su2ShellConjViol === 0 &&
    su3ShellConjViol === 0 &&
    commErrE2 < 1e-14 &&
    su2FiltEscapes === 0 &&
    su3FiltEscapes === 0 &&
    su2FiltMaxInvErr < 1e-13 &&
    su3FiltMaxInvErr < 1e-13 &&
    su2NegPlaqViol > 0.1 &&
    su3NegPlaqViol > 0.1 &&
    orbRelErr < 0.02 &&
    paraRelErr < 0.005 &&
    b0Su2RelErr < 0.005 &&
    b0Su3RelErr < 0.005

  recordGate(
    'G5',
    'Tier A+B+C',
    'Local gauge invariance, Gauss law, 1-loop 4D D_4 b_0 & link-dimension comparison',
    g5Ok,
    `G_0 escapes=${su2Escapes + su3Escapes} (err<1e-13), hSh^-1 viol=${su2ShellConjViol + su3ShellConjViol}, ` +
      `||[L_h,K_S]||=${commErrE2.toExponential(1)}, W_1 filtration escapes=${su2FiltEscapes + su3FiltEscapes}, ` +
      `neg-ctrl dW=(${su2NegPlaqViol.toFixed(3)}, ${su3NegPlaqViol.toFixed(3)})>0.1; ` +
      `D_4 1-loop: orb err=${(orbRelErr * 100).toFixed(2)}%, para err=${(paraRelErr * 100).toFixed(2)}%, ` +
      `b0(SU2)=${bf.b0SU2.toFixed(5)} (${(b0Su2RelErr * 100).toFixed(2)}%), b0(SU3)=${bf.b0SU3.toFixed(5)} (${(b0Su3RelErr * 100).toFixed(2)}%)`,
  )
}

// =================================================================================================
// MAIN DRIVER
// =================================================================================================

function main(): void {
  console.log('=================================================================================')
  console.log('WAVE-5B GAP A: DENSE CYCLOTOMIC RING GAUGE CONTINUUM & 4D D_4 ACTION AUDIT SUITE')
  console.log('=================================================================================')
  console.log(
    `Reference GUT coupling: g_GUT^2=${G_GUT_SQ.toFixed(4)} -> beta_D4_GUT(SU(2))=${BETA_D4_GUT_SU2}, beta_D4_GUT(SU(3))=${BETA_D4_GUT_SU3}`,
  )

  // Shared 4D Z^4 and 4D D_4 geometry + nGrid = 12 sparse half-BZ Cholesky reference determinants c_L
  const geomD4 = buildD4Geometry()
  const z4Links: readonly IVec4[] = [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ]
  const z4Plaqs: LoopStep[][] = []
  for (let m = 0; m < 4; m++) {
    for (let n = m + 1; n < 4; n++) {
      z4Plaqs.push([
        { link: m, sign: 1, base: [0, 0, 0, 0] },
        { link: n, sign: 1, base: z4Links[m]! },
        { link: m, sign: -1, base: z4Links[n]! },
        { link: n, sign: -1, base: [0, 0, 0, 0] },
      ])
    }
  }
  const zoneZ4 = computeZoneCLSparse(z4Links, z4Plaqs, 12)
  const zoneD4 = computeZoneCLSparse(geomD4.posPrim, geomD4.tris, 12)
  assert(zoneZ4.fails === 0 && zoneD4.fails === 0, 'Reference nGrid=12 Cholesky BZ integral failed')
  assertClose(zoneZ4.cL, -3.9995, 0.001, 'c_L(Z^4, N=12)')
  assertClose(zoneD4.cL, -19.5471, 0.001, 'c_L(D_4, N=12)')
  console.log(
    `Shared 4D Cholesky BZ determinants (sparse half-BZ N=12): c_L(Z^4)=${zoneZ4.cL.toFixed(6)}, c_L(D_4)=${zoneD4.cL.toFixed(6)}`,
  )

  const LAT_Z4: LatSpec = { name: 'Z^4', n: 4, f: 3, nl: 6, kp: 0.5, kappa: 1.0, cL: zoneZ4.cL }
  const LAT_D4: LatSpec = { name: 'D_4', n: 12, f: 11, nl: 8, kp: 11 / 32, kappa: 2.0, cL: zoneD4.cL }

  const p1 = runPart1()
  const p2 = runPart2(p1.g2T, p1.g2I, p1.gDic3, p1.qWbare, p1.qS23, LAT_Z4, LAT_D4)
  const p3 = runPart3(p1.gS648, p1.mClock, p1.mShift, p1.mHessV, p1.mPhaseT, p1.mT3, LAT_Z4, LAT_D4)
  runPart4(
    geomD4,
    p1.g2T,
    p1.g2I,
    p1.gS648,
    p3.gS1080,
    p3.ladderSU3[0]!.spec,
    LAT_D4,
    p3.ladderSU3[4]!.d4.betaF,
  )
  runPart5(
    p1.g2T,
    p1.gDic3,
    p1.qWbare,
    p1.qS23,
    p2.ladder2T,
    p2.ladderDic3,
    p1.gS648,
    p1.mClock,
    p1.mShift,
    p1.mHessV,
    p1.mPhaseT,
    p3.mubKets,
    p3.ladderSU3,
    p3.cosetGens8,
  )

  const elapsedSec = (performance.now() - T0_MS) / 1000
  const rssMB = process.memoryUsage().rss / (1024 * 1024)

  console.log('\n=================================================================================')
  console.log('GAP A CERTIFICATION SUMMARY (ALL 5 GATES)')
  console.log('=================================================================================')
  for (const g of GATES) {
    console.log(`  [${g.passed ? 'PASS' : 'FAIL'}] ${g.id} (${g.tier.padEnd(10)}) | ${g.title}`)
  }
  const passCount = GATES.filter(g => g.passed).length
  console.log('=================================================================================')
  console.log(
    `OVERALL: ${passCount}/${GATES.length} GATES PASSED | runtime: ${elapsedSec.toFixed(3)} s | RSS: ${rssMB.toFixed(1)} MB`,
  )
  assert(passCount === 5 && GATES.length === 5, `Expected 5/5 gates passed, got ${passCount}/${GATES.length}`)
  assert(elapsedSec < 8.0, `Runtime exceeded 8 s budget: ${elapsedSec.toFixed(3)} s`)
  assert(rssMB < 200.0, `Peak RSS exceeded 200 MB budget: ${rssMB.toFixed(1)} MB`)
}

main()

export {}
