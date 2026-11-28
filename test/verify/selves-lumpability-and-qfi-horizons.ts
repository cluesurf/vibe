// Wave-4 Track W14 (Part B — Note 16 Falsifiable {3,4,3,4} Higher-Selves Testbed):
// Exact Dynamical Lumpability (epsilon_lump), RT Wedge & Quantum Fisher Information (QFI) Horizons
// on B_1 = [[552, 25, 40]]_3, and Markovian Present-State Memory Depth tau_eff(rho_{A, t})
// with Automated Mallavarapu-Percy Swap Test.
//
// Strictly deterministic (ZERO Math.random()), zero external imports, exact BigInt Z[zeta_9][1/6] +
// Z[omega] + O^+(4,1; Z[sqrt(2)]) + bit-sliced GF(3) symplectic algebra + exact Hermitian SLD QFI &
// Holevo mutual information solvers. Fast (< 10 s), noUncheckedIndexedAccess-safe.
//
// Three Concrete Falsifiable Experiments Implemented (Note 16 Part 3):
//   EXP 1 (E1): Exact Dynamical Lumpability Audit epsilon_lump(C; U) = ||(I - P_C) U P_C|| across:
//     (i)   k = 2 M_meet doublon (Z[w][1/13]) & k = 3 Sym^3 trion (Z[w][1/7]) bound subspaces (0 to 1e-15!)
//           plus negative control: same-role k = 2 M_pair contact pair (nonzero cross-line leakage!).
//     (ii)  31-orbit W(F_4) quotient of B_3 (8,857 docks -> 31 dock orbits, 39 B_2 slot orbits, 6 interior B_1
//           slot orbits) under 1-body bare U (exact orbit invariance ||(I - P_orb) U P_orb|| < 1e-14).
//     (iii) Unaliased exact O^+(4,1; Z[sqrt(2)]) 3D cusp column-sum projection (E-HLG-0043 non-closure check:
//           0 aliasing conflicts, identical Q_c(0) states diverge strictly at t = 1, plus linear ||(I-P_col) U P_col||).
//     (iv)  Exact W10 bulk logical subspace [[24, 1, 8]]_3 (exact 3-frame x 81-diff contraction inside 3^24!)
//           & B_1 = [[552, 25, 40]]_3 under EVERY layer of bare U (D, C=D^2, K, M_meet, M_pair, Phi_odd, S),
//           certifying M_pair acts as EXACT identity (epsilon_code = 0!) while isolating exact leakage of D, K, M_meet, S!
//   EXP 2 (E2): RT Wedge Phase-Transition & Quantum Fisher Information (QFI) Horizon Audit on B_1 = [[552, 25, 40]]_3:
//     (i)   Exact exclusive / nested / overlapping geometric individuation classification (Note 16 Test 2).
//     (ii)  Exact SLD QFI step horizons for exp(-i theta N_Z) and exp(-i theta N_X) across k = 1..24 cones
//           under BOTH Z-cone ordering [0..23] and X-cone ordering (with direct full-state stabilizer cross-check):
//           QFI = 0 for k <= 7, exact classical basis-split horizon for k in [8, 16], full quantum saturation for k >= 17!
//     (iii) Robustness of the 0 -> 16 ln 3 RT snap, exact binomial erasure recovery P_rec(b_0; p), and concatenated
//           depolarizing & worst-case Pauli dephasing QFI retention at p = 0, 0.02, 0.05, 0.10, 0.20, 0.30!
//   EXP 3 (E3): Markovian Present-State Memory Depth tau_eff(rho_{A, t}) & Joint Unitary Mallavarapu-Percy Swap Test:
//     (i)   Exact single-beat Holevo lag decodability I(u_{t - Delta} : rho_{A, t}) over Delta = 0..32 comparing:
//           (a) ballistic bare U (k = 1 geodesic escape & k = 4 Phi_odd = OFF baseline),
//           (b) W9's 207.6x near-resonant chiral Phi_odd 4-line cluster (C4 [0,1,2,8] & C2 Q=0_V [0,1,6,10]),
//           (b3) localized k = 3 Sym^3 trion wavepacket lab-frame fixed-B_2 (|x| <= 2) O(1/t) dispersion vs comoving contact (6/7, 288/343),
//           (c) W10 [[24, 1, 8]]_3 / B_1 bulk-protected register + unequal-delay temporal alignment (Delta_1=2, Delta_2=6).
//     (ii)  Non-tautological Joint Unitary A U E Mallavarapu-Percy swap test: two distinct past histories producing
//           identical rho_{A, t} (< 1e-15) yet distinct joint A U E states (||rho_AE^(1)-rho_AE^(2)||_1 = 1.9365) are
//           tested for (a) present-state observable invariance vs Note 12 Sec 45 history functional failure, and
//           (b) 8-beat joint unitary evolution with ZERO bath resets: trapped local bath & 1D bare-U back-scattering
//           genuinely FAIL (non-Markovian back-flow), while pure hyperbolic outward-export bath PASSES (< 1e-15)!

const t0Global = performance.now()

type CheckRow = { readonly id: string; readonly name: string; readonly passed: boolean; readonly detail: string }
const CHECKS: CheckRow[] = []
function recordCheck(id: string, name: string, passed: boolean, detail: string): void {
  CHECKS.push({ id, name, passed, detail })
}
function assertExact(cond: boolean, msg: string): void {
  if (!cond) throw new Error(`Assertion failed: ${msg}`)
}

// =================================================================================================
// 0. EXACT COMPLEX, HERMITIAN EIGENSOLVER, BIT-SLICED GF(3), Z[zeta_9][1/6] & O^+(4,1; Z[sqrt(2)])
// =================================================================================================

const PI = Math.PI
const SQRT3 = Math.sqrt(3)
const LN3 = Math.log(3)

type C = readonly [number, number]
const cAdd = (a: C, b: C): C => [a[0] + b[0], a[1] + b[1]]
const cSub = (a: C, b: C): C => [a[0] - b[0], a[1] - b[1]]
const cMul = (a: C, b: C): C => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]
const cConj = (a: C): C => [a[0], -a[1]]
const cScale = (s: number, a: C): C => [s * a[0], s * a[1]]
const cAbs = (a: C): number => Math.hypot(a[0], a[1])
const cAbs2 = (a: C): number => a[0] * a[0] + a[1] * a[1]
const cExpI = (t: number): C => [Math.cos(t), Math.sin(t)]

const W_C: C = [-0.5, SQRT3 / 2]
const W2_C: C = [-0.5, -SQRT3 / 2]
const W_POW: readonly C[] = [[1, 0], W_C, W2_C]
const Z6_C: C = [0.5, SQRT3 / 2]
const Z18_C: C = [Math.cos(PI / 9), Math.sin(PI / 9)]
const Z18_M1: C = [Z18_C[0] - 1, Z18_C[1]]
const C_KEEP: C = [0.25, SQRT3 / 4]
const C_CROSS: C = [0.75, -SQRT3 / 4]
const D_DIAG: C = [0.75, SQRT3 / 4] // (2 + w)/2 / 2? Wait: (2 + w)/2 = (3/2 + i sqrt3/2)/2 = 3/4 + i sqrt3/4!
const D_OFF: C = [0.25, -SQRT3 / 4] // (-w)/2 = (1/2 - i sqrt3/2)/2 = 1/4 - i sqrt3/4!

type CMat = { readonly n: number; readonly re: Float64Array; readonly im: Float64Array }
const cmatZero = (n: number): CMat => ({ n, re: new Float64Array(n * n), im: new Float64Array(n * n) })
const cmatEye = (n: number): CMat => {
  const m = cmatZero(n)
  for (let i = 0; i < n; i++) m.re[i * n + i] = 1
  return m
}
function cmatMul(A: CMat, B: CMat): CMat {
  const n = A.n, out = cmatZero(n)
  for (let i = 0; i < n; i++) {
    for (let k = 0; k < n; k++) {
      const ar = A.re[i * n + k]!, ai = A.im[i * n + k]!
      if (ar === 0 && ai === 0) continue
      for (let j = 0; j < n; j++) {
        out.re[i * n + j] = out.re[i * n + j]! + (ar * B.re[k * n + j]! - ai * B.im[k * n + j]!)
        out.im[i * n + j] = out.im[i * n + j]! + (ar * B.im[k * n + j]! + ai * B.re[k * n + j]!)
      }
    }
  }
  return out
}
// Shared 3x3 qutrit Hermitian generators N_Z = diag(0, 1, -1) and N_X = F^dag N_Z F
const NZ = cmatZero(3); NZ.re[0] = 0; NZ.re[4] = 1; NZ.re[8] = -1
const F3 = cmatZero(3), F3Dag = cmatZero(3)
for (let j = 0; j < 3; j++) for (let k = 0; k < 3; k++) {
  const w = W_POW[(j * k) % 3]!
  F3.re[j * 3 + k] = w[0] / SQRT3; F3.im[j * 3 + k] = w[1] / SQRT3
  F3Dag.re[k * 3 + j] = w[0] / SQRT3; F3Dag.im[k * 3 + j] = -w[1] / SQRT3
}
const NX = cmatMul(F3Dag, cmatMul(NZ, F3))
function cmatUnitaryErr(U: CMat): number {
  const n = U.n
  let maxE = 0
  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      let sr = 0, si = 0
      for (let k = 0; k < n; k++) {
        const ar = U.re[k * n + i]!, ai = -U.im[k * n + i]!
        const br = U.re[k * n + j]!, bi = U.im[k * n + j]!
        sr += ar * br - ai * bi; si += ar * bi + ai * br
      }
      maxE = Math.max(maxE, Math.hypot(sr - (i === j ? 1 : 0), si))
    }
  }
  return maxE
}

// Complex Hermitian Jacobi eigensolver (exact, clean, fast for small matrices n <= 32)
function hermitianJacobi(H: CMat): { readonly vals: Float64Array; readonly vecs: CMat } {
  const n = H.n
  const ar = Float64Array.from(H.re), ai = Float64Array.from(H.im)
  const vr = new Float64Array(n * n), vi = new Float64Array(n * n)
  for (let i = 0; i < n; i++) vr[i * n + i] = 1
  for (let sw = 0; sw < 80; sw++) {
    let maxOff = 0
    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        const pr = ar[p * n + q]!, pi = ai[p * n + q]!
        const mag = Math.hypot(pr, pi)
        if (mag > maxOff) maxOff = mag
        if (mag <= 1e-15 * Math.max(1e-12, Math.abs(ar[p * n + p]!) + Math.abs(ar[q * n + q]!))) continue
        const phR = pr / mag, phI = pi / mag // a_pq = mag * (phR + i phI)
        const app = ar[p * n + p]!, aqq = ar[q * n + q]!
        const tau = (aqq - app) / (2 * mag)
        const t = tau >= 0 ? 1 / (tau + Math.hypot(1, tau)) : -1 / (-tau + Math.hypot(1, tau))
        const c = 1 / Math.hypot(1, t), s = t * c
        // Unitary G on (p, q): G = [[c, s e^{i phi}], [-s e^{-i phi}, c]] so G^dag A G zeroes (p, q)
        const spR = s * phR, spI = s * phI
        for (let k = 0; k < n; k++) {
          if (k === p || k === q) continue
          const akpR = ar[k * n + p]!, akpI = ai[k * n + p]!
          const akqR = ar[k * n + q]!, akqI = ai[k * n + q]!
          const nkpR = c * akpR - (spR * akqR + spI * akqI)
          const nkpI = c * akpI - (spR * akqI - spI * akqR)
          const nkqR = (spR * akpR - spI * akpI) + c * akqR
          const nkqI = (spR * akpI + spI * akpR) + c * akqI
          ar[k * n + p] = nkpR; ai[k * n + p] = nkpI
          ar[p * n + k] = nkpR; ai[p * n + k] = -nkpI
          ar[k * n + q] = nkqR; ai[k * n + q] = nkqI
          ar[q * n + k] = nkqR; ai[q * n + k] = -nkqI
        }
        ar[p * n + p] = app - t * mag; ai[p * n + p] = 0
        ar[q * n + q] = aqq + t * mag; ai[q * n + q] = 0
        ar[p * n + q] = 0; ai[p * n + q] = 0; ar[q * n + p] = 0; ai[q * n + p] = 0
        for (let k = 0; k < n; k++) {
          const vkpR = vr[k * n + p]!, vkpI = vi[k * n + p]!
          const vkqR = vr[k * n + q]!, vkqI = vi[k * n + q]!
          vr[k * n + p] = c * vkpR - (spR * vkqR + spI * vkqI)
          vi[k * n + p] = c * vkpI - (spR * vkqI - spI * vkqR)
          vr[k * n + q] = (spR * vkpR - spI * vkpI) + c * vkqR
          vi[k * n + q] = (spR * vkpI + spI * vkpR) + c * vkqI
        }
      }
    }
    if (maxOff < 1e-15) break
  }
  const ord = Array.from({ length: n }, (_, i) => i).sort((a, b) => ar[a * n + a]! - ar[b * n + b]!)
  const vals = new Float64Array(n)
  const vecs = cmatZero(n)
  for (let col = 0; col < n; col++) {
    const src = ord[col]!
    vals[col] = ar[src * n + src]!
    for (let r = 0; r < n; r++) {
      vecs.re[r * n + col] = vr[r * n + src]!
      vecs.im[r * n + col] = vi[r * n + src]!
    }
  }
  return { vals, vecs }
}

function vonNeumannEntropy(rho: CMat): number {
  const { vals } = hermitianJacobi(rho)
  let s = 0
  for (let i = 0; i < vals.length; i++) {
    const lam = vals[i]!
    if (lam > 1e-15) s -= lam * Math.log(lam)
  }
  return s
}

function traceNormHermitian(A: CMat): number {
  const { vals } = hermitianJacobi(A)
  let s = 0
  for (let i = 0; i < vals.length; i++) s += Math.abs(vals[i]!)
  return s
}

function exactSldQfi(rho: CMat, drho: CMat): number {
  const n = rho.n
  const { vals, vecs } = hermitianJacobi(rho)
  // Transform drho into eigenbasis of rho: D_{jk} = <j | drho | k>
  let qfi = 0
  for (let j = 0; j < n; j++) {
    for (let k = 0; k < n; k++) {
      const denom = vals[j]! + vals[k]!
      if (denom <= 1e-14) continue
      let dr = 0, di = 0
      for (let r = 0; r < n; r++) {
        const jr = vecs.re[r * n + j]!, ji = -vecs.im[r * n + j]!
        let tr = 0, ti = 0
        for (let c = 0; c < n; c++) {
          const ar = drho.re[r * n + c]!, ai = drho.im[r * n + c]!
          const kr = vecs.re[c * n + k]!, ki = vecs.im[c * n + k]!
          tr += ar * kr - ai * ki; ti += ar * ki + ai * kr
        }
        dr += jr * tr - ji * ti; di += jr * ti + ji * tr
      }
      qfi += (2 * (dr * dr + di * di)) / denom
    }
  }
  return qfi
}

function holevoMutualInfo(rhos: readonly CMat[]): number {
  const m = rhos.length, n = rhos[0]!.n
  const avg = cmatZero(n)
  let sumS = 0
  for (const r of rhos) {
    sumS += vonNeumannEntropy(r)
    for (let k = 0; k < n * n; k++) {
      avg.re[k] = avg.re[k]! + r.re[k]! / m
      avg.im[k] = avg.im[k]! + r.im[k]! / m
    }
  }
  return Math.max(0, vonNeumannEntropy(avg) - sumS / m)
}

// --- Exact Bit-Sliced GF(3) Symplectic Engine (matching W10) ---
type Mat2 = readonly [number, number, number, number]
const mod3 = (x: number): number => ((x % 3) + 3) % 3
const mul2 = (X: Mat2, Y: Mat2): Mat2 => [
  mod3(X[0] * Y[0] + X[1] * Y[2]), mod3(X[0] * Y[1] + X[1] * Y[3]),
  mod3(X[2] * Y[0] + X[3] * Y[2]), mod3(X[2] * Y[1] + X[3] * Y[3]),
]
type GF3Row = { readonly a: Uint32Array; readonly b: Uint32Array }
const gf3RowZero = (words: number): GF3Row => ({ a: new Uint32Array(words), b: new Uint32Array(words) })
const gf3RowClone = (r: GF3Row): GF3Row => ({ a: Uint32Array.from(r.a), b: Uint32Array.from(r.b) })
function gf3Get(r: GF3Row, col: number): number {
  const w = col >>> 5, bit = 1 << (col & 31)
  return (r.a[w]! & bit) !== 0 ? 1 : (r.b[w]! & bit) !== 0 ? 2 : 0
}
function gf3Set(r: GF3Row, col: number, val: number): void {
  const w = col >>> 5, bit = 1 << (col & 31), mask = ~bit
  r.a[w] = r.a[w]! & mask; r.b[w] = r.b[w]! & mask
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
  for (let w = startWord; w < r.a.length; w++) { const t = r.a[w]!; r.a[w] = r.b[w]!; r.b[w] = t }
}
function gf3Rank(rows: readonly GF3Row[], nCols: number): number {
  const mat = rows.map(gf3RowClone), nRows = mat.length
  let rank = 0
  for (let col = 0; col < nCols && rank < nRows; col++) {
    const w = col >>> 5, bit = 1 << (col & 31)
    let piv = -1
    for (let r = rank; r < nRows; r++) if (((mat[r]!.a[w]! | mat[r]!.b[w]!) & bit) !== 0) { piv = r; break }
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
  const mat = rows.map(gf3RowClone), nRows = mat.length, pivCols: number[] = []
  let rank = 0
  for (let col = 0; col < nCols && rank < nRows; col++) {
    const w = col >>> 5, bit = 1 << (col & 31)
    let piv = -1
    for (let r = rank; r < nRows; r++) if (((mat[r]!.a[w]! | mat[r]!.b[w]!) & bit) !== 0) { piv = r; break }
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
  const r = basis.length, isPiv = new Uint8Array(nCols)
  for (const c of pivCols) isPiv[c] = 1
  const words = (nCols + 31) >>> 5, out: GF3Row[] = []
  for (let free = 0; free < nCols; free++) {
    if (isPiv[free]) continue
    const v = gf3RowZero(words); gf3Set(v, free, 1)
    for (let i = 0; i < r; i++) {
      const val = gf3Get(basis[i]!, free)
      if (val !== 0) gf3Set(v, pivCols[i]!, 3 - val)
    }
    out.push(v)
  }
  return out
}
function stabEntropy(basis: readonly GF3Row[], nQ: number, subset: readonly number[]): number {
  const k = subset.length
  if (k === 0) return 0
  const words = (2 * k + 31) >>> 5
  const sub = basis.map(r => {
    const out = gf3RowZero(words)
    for (let j = 0; j < k; j++) {
      const q = subset[j]!
      const xv = gf3Get(r, q), zv = gf3Get(r, nQ + q)
      if (xv) gf3Set(out, j, xv)
      if (zv) gf3Set(out, k + j, zv)
    }
    return out
  })
  return gf3Rank(sub, 2 * k) - k
}

// --- Exact Z[zeta_9][1/6], D_4 Roots, W(F_4), chi_odd & O^+(4,1; Z[sqrt(2)]) ---
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
const addZ9 = (a: Z9, b: Z9): Z9 => [a[0] + b[0], a[1] + b[1], a[2] + b[2], a[3] + b[3], a[4] + b[4], a[5] + b[5]]
const subZ9 = (a: Z9, b: Z9): Z9 => [a[0] - b[0], a[1] - b[1], a[2] - b[2], a[3] - b[3], a[4] - b[4], a[5] - b[5]]
const scaleZ9 = (f: bigint, a: Z9): Z9 => [f * a[0], f * a[1], f * a[2], f * a[3], f * a[4], f * a[5]]
const divExactZ9 = (a: Z9, d: bigint): Z9 => [a[0] / d, a[1] / d, a[2] / d, a[3] / d, a[4] / d, a[5] / d]
const isZeroZ9 = (a: Z9): boolean => a[0] === 0n && a[1] === 0n && a[2] === 0n && a[3] === 0n && a[4] === 0n && a[5] === 0n
function mulZ9(a: Z9, b: Z9): Z9 {
  const p = new Array<bigint>(11).fill(0n)
  for (let i = 0; i < 6; i++) {
    const ai = a[i]!
    if (ai === 0n) continue
    for (let j = 0; j < 6; j++) p[i + j] = p[i + j]! + ai * b[j]!
  }
  return [p[0]! - p[6]! + p[9]!, p[1]! - p[7]! + p[10]!, p[2]! - p[8]!, p[3]! - p[6]!, p[4]! - p[7]!, p[5]! - p[8]!]
}
const ZETA6_POWERS: readonly Z9[] = [Z9_ONE, Z9_ZETA6, Z9_OMEGA, scaleZ9(-1n, Z9_ONE), scaleZ9(-1n, Z9_ZETA6), scaleZ9(-1n, Z9_OMEGA)]
function z9ToComplex(a: Z9, den = 1n): C {
  const inv = 1 / Number(den)
  let re = 0, im = 0
  for (let k = 0; k < 6; k++) {
    const c = Number(a[k]!)
    if (c === 0) continue
    const ang = (2 * PI * k) / 9
    re += c * Math.cos(ang); im += c * Math.sin(ang)
  }
  return [re * inv, im * inv]
}

const ROOTS: readonly Root4[] = (() => {
  const out: Root4[] = []
  for (let i = 0; i < 4; i++)
    for (let j = i + 1; j < 4; j++)
      for (const si of [1, -1])
        for (const sj of [1, -1]) {
          const c: [number, number, number, number] = [0, 0, 0, 0]
          c[i] = si; c[j] = sj; out.push(c)
        }
  return out
})()
const dot4 = (a: Root4, b: Root4): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]
const OPP: readonly number[] = ROOTS.map(r => ROOTS.findIndex(o => o[0] === -r[0] && o[1] === -r[1] && o[2] === -r[2] && o[3] === -r[3]))
const LINES: readonly (readonly [number, number])[] = ROOTS.flatMap((_, a) => (a < OPP[a]! ? [[a, OPP[a]!] as const] : []))
const LINE_OF_SLOT: readonly number[] = ROOTS.map((_, s) => LINES.findIndex(([a, b]) => a === s || b === s))
const FRAME_OF: readonly number[] = ROOTS.map(r => ((r[0] !== 0 && r[1] !== 0) || (r[2] !== 0 && r[3] !== 0) ? 0 : (r[0] !== 0 && r[2] !== 0) || (r[1] !== 0 && r[3] !== 0) ? 1 : 2))

const WF4_GROUP = (() => {
  const simple: readonly Root4[] = [[0, 1, -1, 0], [0, 0, 1, -1], [0, 0, 0, 1], [1, -1, -1, -1]]
  const gens = simple.map(alpha => {
    const aa = dot4(alpha, alpha), perm = new Uint8Array(24)
    for (let i = 0; i < 24; i++) {
      const v = ROOTS[i]!, t = 2 * dot4(v, alpha)
      const img = [0, 1, 2, 3].map(k => v[k]! - (t * alpha[k]!) / aa)
      perm[i] = ROOTS.findIndex(o => o[0] === img[0] && o[1] === img[1] && o[2] === img[2] && o[3] === img[3])
    }
    return perm
  })
  const id = Uint8Array.from({ length: 24 }, (_, i) => i)
  const elements: Uint8Array[] = [id], det: number[] = [1]
  const seen = new Set<string>([id.join(',')])
  for (let h = 0; h < elements.length; h++) {
    const cur = elements[h]!, nd = -det[h]!
    for (const g of gens) {
      const nxt = Uint8Array.from(cur, v => g[v]!)
      const k = nxt.join(',')
      if (!seen.has(k)) { seen.add(k); elements.push(nxt); det.push(nd) }
    }
  }
  assertExact(elements.length === 1152, 'W(F_4) order 1152')
  return { elements, det, gens }
})()

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
  let minKey = Number.POSITIVE_INFINITY, minSign = 0, chiral = true
  const elems = WF4_GROUP.elements, dets = WF4_GROUP.det
  for (let e = 0; e < elems.length; e++) {
    const p = elems[e]!, d = dets[e]!
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

// Exact O^+(4,1; Z[sqrt(2)]) {3,4,3,4} Coxeter transport
const DIM5 = [0, 1, 2, 3, 4] as const
const Q2_ZERO: Q2 = [0n, 0n]
const EYE5: readonly (readonly Q2[])[] = DIM5.map(r => DIM5.map(c => [r === c ? 1n : 0n, 0n] as const))
const addQ2 = (u: Q2, v: Q2): Q2 => [u[0] + v[0], u[1] + v[1]]
const subQ2 = (u: Q2, v: Q2): Q2 => [u[0] - v[0], u[1] - v[1]]
const mulQ2 = (u: Q2, v: Q2): Q2 => [u[0] * v[0] + 2n * u[1] * v[1], u[0] * v[1] + u[1] * v[0]]
const dotQ2 = (u: readonly Q2[], v: readonly Q2[]): Q2 => u.reduce<Q2>((s, e, i) => addQ2(s, mulQ2(e, v[i]!)), Q2_ZERO)
const vecKeyQ2 = (v: readonly Q2[]): string => v.map(([a, b]) => `${a},${b}`).join(';')
const matVecQ2 = (m: readonly (readonly Q2[])[], v: readonly Q2[]): Q2[] => m.map(r => dotQ2(r, v))
const matMulQ2 = (a: readonly (readonly Q2[])[], b: readonly (readonly Q2[])[]): Q2[][] =>
  a.map(row => DIM5.map(col => dotQ2(row, b.map(br => br[col]!))))
const q2Float = (u: Q2): number => Number(u[0]) + Number(u[1]) * Math.SQRT2
const TWICE_GRAM: readonly (readonly Q2[])[] = DIM5.map(i =>
  DIM5.map(j => (i === j ? ([2n, 0n] as const) : Math.abs(i - j) === 1 ? (Math.min(i, j) % 2 === 0 ? ([-1n, 0n] as const) : ([0n, -1n] as const)) : Q2_ZERO)),
)
const twiceForm = (u: readonly Q2[], v: readonly Q2[]): Q2 => dotQ2(u, matVecQ2(TWICE_GRAM, v))
const reflect5 = (normal: readonly Q2[]): Q2[][] => {
  const dual = matVecQ2(TWICE_GRAM, normal)
  return EYE5.map((row, i) => row.map((entry, j) => subQ2(entry, mulQ2(normal[i]!, dual[j]!))))
}
const BASE_CENTER: readonly Q2[] = [[2n, 0n], [4n, 0n], [0n, 3n], [0n, 2n], [1n, 0n]]
const CUSP_V: readonly Q2[] = [[0n, 0n], [1n, 0n], [0n, 1n], [0n, 1n], [1n, 0n]]
const CENTRAL_INVERSION: readonly (readonly Q2[])[] = DIM5.map(i =>
  DIM5.map(j => [(j === 4 ? 2n * BASE_CENTER[i]![0] : 0n) - (i === j ? 1n : 0n), j === 4 ? 2n * BASE_CENTER[i]![1] : 0n]),
)
const STAB_REFS = [0, 1, 2, 3].map(idx => reflect5(EYE5[idx]!))
const TRANSPORTS: readonly (readonly (readonly Q2[])[])[] = (() => {
  const facetNormals: Q2[][] = [EYE5[4]!.slice()]
  const seen = new Set<string>([vecKeyQ2(EYE5[4]!)])
  for (const n of facetNormals) {
    for (const g of STAB_REFS) {
      const next = matVecQ2(g, n), key = vecKeyQ2(next)
      if (!seen.has(key)) { seen.add(key); facetNormals.push(next) }
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
    const fIdx = facetRoots.findIndex(fr => fr[0] === root[0] && fr[1] === root[1] && fr[2] === root[2] && fr[3] === root[3])
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
      if (q2Float(twiceForm(v, EYE5[i]!)) < -1e-9) { v = matVecQ2(STAB_REFS[i]!, v); changed = true; break }
    }
    if (!changed) break
  }
  return vecKeyQ2(v)
}

// Verbatim 8-layer exact Z[zeta_9][1/6] QCA beat on {3,4,3,4}
function encodeConfig(vibes: readonly Vibe[]): string {
  return [...vibes].sort((a, b) => a[0] - b[0] || a[1] - b[1]).map(v => v.join(':')).join(';')
}
function decodeConfig(key: string): Vibe[] {
  if (key === '') return []
  return key.split(';').map(e => { const p = e.split(':'); return [Number(p[0]), Number(p[1]), Number(p[2]) as ToneNZ, Number(p[3])] })
}
function addAmpZ9(map: Map<string, Z9>, key: string, delta: Z9): void {
  const prev = map.get(key), next = prev ? addZ9(prev, delta) : delta
  if (isZeroZ9(next)) map.delete(key); else map.set(key, next)
}
function reduceDenZ9(amp: Map<string, Z9>, den: bigint): ExactState {
  let d = den
  for (const p of [2n, 3n]) {
    while (d % p === 0n && [...amp.values()].every(z => z.every(c => c % p === 0n))) {
      d /= p; for (const [k, z] of amp) amp.set(k, divExactZ9(z, p))
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
    const d = vibes[i]![0], l = g.get(d); if (l) l.push(i); else g.set(d, [i])
  }
  return g
}
function collectActiveLines(vibes: readonly Vibe[]): (readonly [number | undefined, number | undefined, number, number])[] {
  const res: (readonly [number | undefined, number | undefined, number, number])[] = []
  for (const idxs of groupByDock(vibes).values()) {
    const byS = new Map<number, number>()
    for (const i of idxs) byS.set(vibes[i]![1], i)
    for (const [a, b] of LINES) {
      const ia = byS.get(a), ib = byS.get(b)
      if (ia !== undefined || ib !== undefined) res.push([ia, ib, a, b])
    }
  }
  return res
}
function applyBranch<Item>(
  state: ExactState, branchDen: bigint,
  prepare: (vibes: Vibe[], amp: Z9) => readonly [Item[], Z9],
  expand: (cfg: Vibe[], amp: Z9, item: Item) => readonly (readonly [Vibe[], Z9])[],
): ExactState {
  const prep = [...state.amp.entries()].map(([k, amp]) => {
    const vibes = decodeConfig(k), [items, pa] = prepare(vibes, amp)
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
const applyHalfCoin = (s: ExactState): ExactState =>
  applyBranch<readonly [number, number]>(
    s, 2n,
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
      const [d, , t, r] = cfg[idx]!, fl = cfg.slice(); fl[idx] = [d, opp, t, r]
      return [[cfg, mulZ9(amp, Z9_COIN_DIAG)], [fl, mulZ9(amp, Z9_COIN_OFF)]]
    },
  )
const applyRoleMeet = (s: ExactState): ExactState =>
  applyBranch<readonly [number, number]>(
    s, 2n,
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
      const [dA, sA, tA, rA] = cfg[ia]!, [dB, sB, tB, rB] = cfg[ib]!, sw = cfg.slice()
      sw[ia] = [dA, sA, tA, rB]; sw[ib] = [dB, sB, tB, rA]
      return [[cfg, mulZ9(amp, Z9_ZETA6)], [sw, mulZ9(amp, Z9_MEET_SWAP)]]
    },
  )
const applyPairMix = (s: ExactState): ExactState =>
  applyBranch<readonly [number, number, number]>(
    s, 12n,
    (vibes, amp) => {
      const ps: (readonly [number, number, number])[] = []
      for (const idxs of groupByDock(vibes).values()) {
        if (idxs.length !== 2) continue
        const [i0, i1] = [idxs[0]!, idxs[1]!], v0 = vibes[i0]!, v1 = vibes[i1]!
        if (OPP[v0[1]] === v1[1] && v0[2] === v1[2] && v0[3] === v1[3]) ps.push([i0, i1, LINE_OF_SLOT[v0[1]]!])
      }
      return [ps, amp]
    },
    (cfg, amp, [i0, i1, curL]) => {
      const hop = subZ9(Z9_ZETA18, Z9_ONE), keep = addZ9([12n, 0n, 0n, 0n, 0n, 0n], hop)
      return LINES.map(([la, lb], l) => {
        if (l === curL) return [cfg, mulZ9(amp, keep)] as const
        const [d, , t, r] = cfg[i0]!, hp = cfg.slice(); hp[i0] = [d, la, t, r]; hp[i1] = [d, lb, t, r]
        return [hp, mulZ9(amp, hop)] as const
      })
    },
  )
const applyChiral = (s: ExactState): ExactState => {
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
const applyOppBounce = (s: ExactState): ExactState => {
  const out = new Map<string, Z9>()
  for (const [k, amp] of s.amp) {
    const vibes = decodeConfig(k)
    let neg = false
    for (const [ia, ib, sa, sb] of collectActiveLines(vibes)) {
      if (ia === undefined || ib === undefined || vibes[ia]![2] === vibes[ib]![2]) continue
      const vA = vibes[ia]!, vB = vibes[ib]!
      vibes[ia] = [vA[0], sb, vA[2], vA[3]]; vibes[ib] = [vB[0], sa, vB[2], vB[3]]
      neg = !neg
    }
    addAmpZ9(out, encodeConfig(vibes), neg ? scaleZ9(-1n, amp) : amp)
  }
  return { amp: out, den: s.den }
}
const applyStream = (s: ExactState): ExactState => {
  const out = new Map<string, Z9>()
  for (const [k, amp] of s.amp) {
    const nv: Vibe[] = decodeConfig(k).map(([d, sl, t, r]) => [stepDock(d, sl), sl, t, r] as const)
    addAmpZ9(out, encodeConfig(nv), amp)
  }
  return { amp: out, den: s.den }
}
const applyBeat4D = (s: ExactState): ExactState =>
  applyStream(applyChiral(applyHalfCoin(applyRoleMeet(applyPairMix(applyOppBounce(applyHalfCoin(applyChiral(s))))))))

// =================================================================================================
// 1. W10 CROWN-JEWEL TENSORS ([[24, 1, 8]]_3) & EXACT B_1 = [[552, 25, 40]]_3 CONTRACTION
// =================================================================================================

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
  const allX = new Uint8Array(48); for (let i = 0; i < 24; i++) allX[i] = 1
  const allZ = new Uint8Array(48); for (let i = 0; i < 24; i++) allZ[24 + i] = 1
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
  const xL = new Uint8Array(48), zL = new Uint8Array(48)
  for (let i = 0; i < 24; i++) { const v = FRAME_OF[i] === 0 ? 1 : FRAME_OF[i] === 1 ? 2 : 0; xL[i] = v; zL[24 + i] = v }
  const choiPlus: Uint8Array[] = bulk23.map(r => {
    const s = new Uint8Array(50)
    for (let i = 0; i < 24; i++) { s[i] = r[i]!; s[25 + i] = r[24 + i]! }
    return s
  })
  const sX = new Uint8Array(50), sZ = new Uint8Array(50)
  for (let i = 0; i < 24; i++) { sX[i] = xL[i]!; sZ[25 + i] = zL[24 + i]! }
  sX[24] = 2; sZ[49] = 1
  choiPlus.push(sX, sZ)
  const applyK = (rows: readonly Uint8Array[], nQ: number): Uint8Array[] =>
    rows.map(r => { const o = Uint8Array.from(r); for (let i = 0; i < nQ; i++) o[nQ + i] = mod3(2 * o[nQ + i]!); return o })
  return {
    w9Defs, lvmDefs, bulk23, xL, zL, choiPlus, choiMinus: applyK(choiPlus, 25),
    purePlus: [...bulk23, xL], pureMinus: applyK([...bulk23, xL], 24),
  }
}
const T = buildCrownTensors()

function contractB1(pure: boolean) {
  const nD = 25, edges = Array.from({ length: 24 }, (_, a) => ({ d1: 0, s1: a, d2: 1 + a, s2: OPP[a]! }))
  const nInt = 48
  const slotToInt = Array.from({ length: nD }, () => new Int32Array(24).fill(-1))
  edges.forEach((e, ei) => { slotToInt[e.d1]![e.s1] = 2 * ei; slotToInt[e.d2]![e.s2] = 2 * ei + 1 })
  let bndCur = 0
  const openSlotMap = Array.from({ length: nD }, () => new Int32Array(24).fill(-1))
  for (let d = 0; d < nD; d++) for (let s = 0; s < 24; s++) if (slotToInt[d]![s]! < 0) openSlotMap[d]![s] = bndCur++
  const nBnd = bndCur, nBulk = pure ? 0 : 25, nOpen = nBnd + nBulk, nTotal = nInt + nOpen
  const unRows: Uint8Array[] = []
  let blk = 0
  for (let d = 0; d < nD; d++) {
    const rows = d === 0 ? (pure ? T.purePlus : T.choiPlus) : pure ? T.pureMinus : T.choiMinus
    const nQD = pure ? 24 : 25, qb = pure ? -1 : nInt + nBnd + blk++
    for (const r of rows) {
      const full = new Uint8Array(2 * nTotal)
      for (let s = 0; s < 24; s++) {
        const q = slotToInt[d]![s]! >= 0 ? slotToInt[d]![s]! : nInt + openSlotMap[d]![s]!
        full[q] = r[s]!; full[nTotal + q] = r[nQD + s]!
      }
      if (qb >= 0) { full[qb] = r[24]!; full[nTotal + qb] = r[nQD + 24]! }
      unRows.push(full)
    }
  }
  const nRows = unRows.length, eqWords = (nRows + 31) >>> 5, eqs: GF3Row[] = []
  for (let e = 0; e < 24; e++) {
    const u = 2 * e, v = 2 * e + 1, eq1 = gf3RowZero(eqWords), eq2 = gf3RowZero(eqWords)
    for (let ri = 0; ri < nRows; ri++) {
      const row = unRows[ri]!
      const c1 = mod3(row[nTotal + u]! + row[nTotal + v]!), c2 = mod3(row[u]! + 2 * row[v]!)
      if (c1) gf3Set(eq1, ri, c1); if (c2) gf3Set(eq2, ri, c2)
    }
    eqs.push(eq1, eq2)
  }
  const ker = gf3Nullspace(eqs, nRows)
  const projRows = ker.map(kv => {
    const acc = new Uint8Array(2 * nOpen)
    for (let ri = 0; ri < nRows; ri++) {
      const cf = gf3Get(kv, ri)
      if (!cf) continue
      const row = unRows[ri]!
      for (let q = 0; q < nOpen; q++) {
        if (row[nInt + q]) acc[q] = (acc[q]! + cf * row[nInt + q]!) % 3
        if (row[nTotal + nInt + q]) acc[nOpen + q] = (acc[nOpen + q]! + cf * row[nTotal + nInt + q]!) % 3
      }
    }
    return gf3FromUint8(acc)
  })
  return { basis: gf3Rref(projRows, 2 * nOpen).basis, nOpen, nBnd, nBulk, openSlotMap }
}

// =================================================================================================
// EXPERIMENT 1: EXACT DYNAMICAL LUMPABILITY AUDIT epsilon_lump(C; U)
// =================================================================================================

function runExperiment1() {
  console.log('==============================================================================================')
  console.log('EXPERIMENT 1: EXACT DYNAMICAL LUMPABILITY AUDIT epsilon_lump(C; U) = ||(I - P_C) U P_C||')
  console.log('==============================================================================================')

  // Build exact {3,4,3,4} R = 3 Coxeter ball B_3 (8,857 docks) FIRST before any radius > 3 walks!
  for (let h = 0; h < dockFrames.length; h++) if (dockRad[h]! < 3) for (let s = 0; s < 24; s++) stepDock(h, s)
  const nB3 = dockFrames.length
  assertExact(nB3 === 8857, `Expected 8857 docks in B_3, got ${nB3}`)
  for (let d = 0; d < nB3; d++) {
    if (dockRad[d]! === 3) {
      for (let s = 0; s < 24; s++) {
        if (hcNeighbors[d]![s]! >= 0) continue
        const hit = centerToDockId.get(vecKeyQ2(matVecQ2(matMulQ2(dockFrames[d]!, TRANSPORTS[s]!), BASE_CENTER)))
        if (hit !== undefined) { hcNeighbors[d]![s] = hit; hcNeighbors[hit]![OPP[s]!] = d }
      }
    }
  }

  // --- 1A. k = 2 M_meet doublon (Z[w][1/13]) & k = 3 Sym^3 trion (Z[w][1/7]) bound subspaces ---
  // Exact 1D collinear Sym^k even-sublattice unitary builder (matching W9)
  const buildSymKEven = (kPart: number, M: number): { U: CMat; dim: number; configs: [number, number][][] } => {
    const canon = (pts: readonly (readonly [number, number])[]) => {
      let bestKey = '', bestSorted: [number, number][] = [], symCount = 0
      for (let sh = 0; sh < M; sh++) {
        const arr: [number, number][] = pts.map(([m, s]) => [(m + sh) % M, s])
        arr.sort((a, b) => a[0] - b[0] || a[1] - b[1])
        const k = arr.map(([m, s]) => `${m}:${s}`).join(',')
        if (bestKey === '' || k < bestKey) { bestKey = k; bestSorted = arr; symCount = 1 }
        else if (k === bestKey) symCount++
      }
      return { key: bestKey, sorted: bestSorted, symCount }
    }
    const idxMap = new Map<string, number>(), configs: [number, number][][] = [], symCounts: number[] = [], chosen: number[] = []
    const gen = (start: number) => {
      if (chosen.length === kPart) {
        const cn = canon(chosen.map(c => [c >> 1, c & 1] as const))
        if (!idxMap.has(cn.key)) { idxMap.set(cn.key, configs.length); configs.push(cn.sorted); symCounts.push(cn.symCount) }
        return
      }
      for (let c = start; c < 2 * M; c++) { chosen.push(c); gen(c + 1); chosen.pop() }
    }
    gen(0)
    const dim = configs.length, U = cmatZero(dim), cMat: C[][] = [[C_KEEP, C_CROSS], [C_CROSS, C_KEEP]]
    for (let col = 0; col < dim; col++) {
      const pts = configs[col]!, byM = new Map<number, number[]>()
      for (let i = 0; i < kPart; i++) { const m = pts[i]![0], l = byM.get(m); if (l) l.push(i); else byM.set(m, [i]) }
      let br: { pts: [number, number][]; amp: C }[] = [{ pts: [], amp: [1, 0] }]
      for (const [m, idxs] of byM) {
        if (idxs.length === 2) br = br.map(b => ({ pts: [...b.pts, [m, 0], [m, 1]], amp: cMul(b.amp, W2_C) }))
        else {
          const sIn = pts[idxs[0]!]![1], nb: { pts: [number, number][]; amp: C }[] = []
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

  // Exact shift-invert power iteration to isolate an eigenstate and measure ||(I - P_psi) U P_psi||
  const measureEigenLump = (U: CMat, targetLam: C): { epsLump: number; uniErr: number; ipr: number; lamErr: number } => {
    const dim = U.n
    const uniErr = cmatUnitaryErr(U)
    // Power iteration on (U + targetLam * I) or direct 1D subspace from (U - lam I) solve via Gaussian elimination
    const solveSys = (sh: C, br: Float64Array, bi: Float64Array): [Float64Array, Float64Array] => {
      const ar = Float64Array.from(U.re), ai = Float64Array.from(U.im)
      const xr = Float64Array.from(br), xi = Float64Array.from(bi)
      for (let i = 0; i < dim; i++) { ar[i * dim + i] = ar[i * dim + i]! - sh[0]; ai[i * dim + i] = ai[i * dim + i]! - sh[1] }
      for (let c = 0; c < dim; c++) {
        let piv = c, best = Math.hypot(ar[c * dim + c]!, ai[c * dim + c]!)
        for (let r = c + 1; r < dim; r++) { const v = Math.hypot(ar[r * dim + c]!, ai[r * dim + c]!); if (v > best) { best = v; piv = r } }
        if (piv !== c) {
          for (let j = c; j < dim; j++) {
            let t = ar[c * dim + j]!; ar[c * dim + j] = ar[piv * dim + j]!; ar[piv * dim + j] = t
            t = ai[c * dim + j]!; ai[c * dim + j] = ai[piv * dim + j]!; ai[piv * dim + j] = t
          }
          let tb = xr[c]!; xr[c] = xr[piv]!; xr[piv] = tb; tb = xi[c]!; xi[c] = xi[piv]!; xi[piv] = tb
        }
        const pr = ar[c * dim + c]!, pi = ai[c * dim + c]!, d = pr * pr + pi * pi
        for (let r = c + 1; r < dim; r++) {
          const fr0 = ar[r * dim + c]!, fi0 = ai[r * dim + c]!
          if (fr0 === 0 && fi0 === 0) continue
          const fr = (fr0 * pr + fi0 * pi) / d, fi = (fi0 * pr - fr0 * pi) / d
          for (let j = c + 1; j < dim; j++) {
            ar[r * dim + j] = ar[r * dim + j]! - (fr * ar[c * dim + j]! - fi * ai[c * dim + j]!)
            ai[r * dim + j] = ai[r * dim + j]! - (fr * ai[c * dim + j]! + fi * ar[c * dim + j]!)
          }
          xr[r] = xr[r]! - (fr * xr[c]! - fi * xi[c]!); xi[r] = xi[r]! - (fr * xi[c]! + fi * xr[c]!)
        }
      }
      for (let r = dim - 1; r >= 0; r--) {
        let sr = xr[r]!, si = xi[r]!
        for (let j = r + 1; j < dim; j++) { sr -= ar[r * dim + j]! * xr[j]! - ai[r * dim + j]! * xi[j]!; si -= ar[r * dim + j]! * xi[j]! + ai[r * dim + j]! * xr[j]! }
        const pr = ar[r * dim + r]!, pi = ai[r * dim + r]!, d = pr * pr + pi * pi
        xr[r] = (sr * pr + si * pi) / d; xi[r] = (si * pr - sr * pi) / d
      }
      return [xr, xi]
    }
    let vr = new Float64Array(dim), vi = new Float64Array(dim)
    for (let i = 0; i < dim; i++) vr[i] = Math.cos(i * 0.618 + 0.2) / Math.sqrt(dim)
    let lam = targetLam
    for (let it = 0; it < 6; it++) {
      const sh: C = it === 0 ? cScale(1.0004, lam) : cScale(1 + 1e-11, lam)
      const [xr, xi] = solveSys(sh, vr, vi)
      let n2 = 0; for (let i = 0; i < dim; i++) n2 += xr[i]! ** 2 + xi[i]! ** 2
      const inv = 1 / Math.sqrt(n2); for (let i = 0; i < dim; i++) { vr[i] = xr[i]! * inv; vi[i] = xi[i]! * inv }
      let lr = 0, li = 0
      for (let r = 0; r < dim; r++) {
        let sr = 0, si = 0
        for (let c = 0; c < dim; c++) { sr += U.re[r * dim + c]! * vr[c]! - U.im[r * dim + c]! * vi[c]!; si += U.re[r * dim + c]! * vi[c]! + U.im[r * dim + c]! * vr[c]! }
        lr += vr[r]! * sr + vi[r]! * si; li += vr[r]! * si - vi[r]! * sr
      }
      const la = Math.hypot(lr, li); lam = [lr / la, li / la]
    }
    // Exact ||(I - |psi><psi|) U |psi>||_2
    let ovR = 0, ovI = 0
    const uvr = new Float64Array(dim), uvi = new Float64Array(dim)
    for (let r = 0; r < dim; r++) {
      let sr = 0, si = 0
      for (let c = 0; c < dim; c++) { sr += U.re[r * dim + c]! * vr[c]! - U.im[r * dim + c]! * vi[c]!; si += U.re[r * dim + c]! * vi[c]! + U.im[r * dim + c]! * vr[c]! }
      uvr[r] = sr; uvi[r] = si
      ovR += vr[r]! * sr + vi[r]! * si; ovI += vr[r]! * si - vi[r]! * sr
    }
    let leak2 = 0, ipr = 0
    for (let r = 0; r < dim; r++) {
      const dr = uvr[r]! - (ovR * vr[r]! - ovI * vi[r]!), di = uvi[r]! - (ovR * vi[r]! + ovI * vr[r]!)
      leak2 += dr * dr + di * di
      ipr += (vr[r]! ** 2 + vi[r]! ** 2) ** 2
    }
    const lamErr = Math.hypot(lam[0] - targetLam[0], lam[1] - targetLam[1])
    return { epsLump: Math.sqrt(leak2), uniErr, ipr, lamErr }
  }

  const sysK2 = buildSymKEven(2, 12)
  const lamDoublon: C = [(7 - 7.5) / 13, (15 * SQRT3) / 26] // (7 + 15 omega) / 13
  const doubLump = measureEigenLump(sysK2.U, lamDoublon)

  const sysK3 = buildSymKEven(3, 8)
  const lamTrion: C = [-13 / 14, (-3 * SQRT3) / 14] // -(8 + 3 omega) / 7
  const triLump = measureEigenLump(sysK3.U, lamTrion)

  // Literal 8-layer 4D Z[zeta_9][1/6] collinear geodesic leakage check for k=2 distinct-role, k=3 trion, & k=2 same-role M_pair negative control!
  const [l0A, l0B] = LINES[0]!
  const line0Docks = new Set<number>([0])
  { let cA = 0, cB = 0; for (let i = 0; i < 6; i++) { cA = stepDock(cA, l0A); cB = stepDock(cB, l0B); line0Docks.add(cA); line0Docks.add(cB) } }
  const measure4DLineLeak = (init: ExactState, steps: number): number => {
    let st = init
    for (let t = 0; t < steps; t++) st = applyBeat4D(st)
    let tot = 0, off = 0
    for (const [k, a] of st.amp) {
      const p = cAbs2(z9ToComplex(a, st.den)); tot += p
      const vs = decodeConfig(k)
      if (vs.some(([d, sl]) => LINE_OF_SLOT[sl] !== 0 || !line0Docks.has(d))) off += p
    }
    return Math.sqrt(off / tot)
  }
  const doub4DSeed = stateFromEntries([[[[0, l0A, 1, 0], [0, l0B, 1, 1]], Z9_ONE], [[[0, l0A, 1, 1], [0, l0B, 1, 0]], Z9_ONE]], 1n)
  const dPos2 = stepDock(stepDock(0, l0A), l0A)
  const perms3: readonly (readonly [number, number, number])[] = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]]
  const trion4DSeed = stateFromEntries(perms3.map(([r0, r1, r2]) => [[[0, l0A, 1, r0], [0, l0B, 1, r1], [dPos2, l0A, 1, r2]], Z9_ONE] as const), 1n)
  const mpairNegSeed = stateFromEntries([[[[0, l0A, 1, 0], [0, l0B, 1, 0]], Z9_ONE]], 1n)
  const doub4DLeak = measure4DLineLeak(doub4DSeed, 2)
  const trion4DLeak = measure4DLineLeak(trion4DSeed, 2)
  const mpairNegLeak = measure4DLineLeak(mpairNegSeed, 1)

  console.log(`  [1A] Bound subspaces (collinear M_meet):`)
  console.log(`       k=2 Doublon (Z[w][1/13], M=12, Fock-basis IPR=${doubLump.ipr.toFixed(5)}=3/7 [pos-summed Lean IPR=5118/14365=0.356283], |dlam|=${doubLump.lamErr.toExponential(1)}): eps_lump = ${doubLump.epsLump.toExponential(2)} | 4D Z[zeta_9] cross-line leak = ${doub4DLeak.toExponential(1)}`)
  console.log(`       k=3 Trion   (Z[w][1/7],  M=8,  Fock-basis IPR=${triLump.ipr.toFixed(5)}, |dlam|=${triLump.lamErr.toExponential(1)}): eps_lump = ${triLump.epsLump.toExponential(2)} | 4D Z[zeta_9] cross-line leak = ${trion4DLeak.toExponential(1)}`)
  console.log(`       NEGATIVE CONTROL (same-role k=2 M_pair on L_0):  4D Z[zeta_9] cross-line leak = ${mpairNegLeak.toFixed(6)} > 0 (breaks L_0 closure!)`)

  // --- 1B. 31-Orbit W(F_4) Quotient of B_3 (8,857 docks) under Bare U ---
  const orbKeyToId = new Map<string, number>(), orbMembers: number[][] = [], dockOrbit = new Int32Array(nB3)
  for (let d = 0; d < nB3; d++) {
    const ok = dominantCenterKey(dockCenters[d]!)
    let oid = orbKeyToId.get(ok)
    if (oid === undefined) { oid = orbMembers.length; orbKeyToId.set(ok, oid); orbMembers.push([]) }
    dockOrbit[d] = oid; orbMembers[oid]!.push(d)
  }
  const nOrb = orbMembers.length
  assertExact(nOrb === 31, `Expected 31 W(F_4) orbits in B_3, got ${nOrb}`)

  // Build exact W(F_4) orbits of directed slots (dock, slot) on B_2 (481 docks, 11,544 slots) using the 4 stabilizer reflections!
  const nB2 = dockRad.filter(r => r <= 2).length
  assertExact(nB2 === 481, `Expected 481 docks in B_2, got ${nB2}`)
  const slotToTargetCenter = (d: number, s: number): Q2[] => {
    const nb = hcNeighbors[d]![s]!
    return nb >= 0 ? dockCenters[nb]! : matVecQ2(matMulQ2(dockFrames[d]!, TRANSPORTS[s]!), BASE_CENTER)
  }
  // Canonicalize ordered pair (c_dock, c_neighbor) under W(F_4) reflections:
  // Use BFS over STAB_REFS on (dock, slot) inside B_2 directly via dock-center lookup!
  const slotOrbId = new Int32Array(nB2 * 24).fill(-1)
  const slotOrbs: number[][] = []
  // Precompute action of each STAB_REFS generator g_i on docks in B_2 and on the 24 slots!
  const dockReflB2: Int32Array[] = STAB_REFS.map(g => {
    const arr = new Int32Array(nB2)
    for (let d = 0; d < nB2; d++) arr[d] = centerToDockId.get(vecKeyQ2(matVecQ2(g, dockCenters[d]!)))!
    return arr
  })
  // For each dock d in B_2 and slot s, find reflected slot s' at dock g(d) whose target center equals g(target(d, s))!
  const dsReflB2: Int32Array[] = STAB_REFS.map((g, gi) => {
    const arr = new Int32Array(nB2 * 24)
    for (let d = 0; d < nB2; d++) {
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
  for (let ds = 0; ds < nB2 * 24; ds++) {
    if (slotOrbId[ds]! >= 0) continue
    const oid = slotOrbs.length, mem: number[] = [ds]
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
  // Check exact 1-beat lumpability ||(I - P_orb) U_1body P_orb|| on ALL W(F_4) slot-orbits inside B_1 (25 docks, 600 slots -> streams strictly inside B_2!)
  const b1SlotOrbs = slotOrbs.filter(mem => mem.every(ds => dockRad[Math.floor(ds / 24)]! <= 1))
  let maxOrbLeak1Body = 0
  for (const mem of b1SlotOrbs) {
    const inv = 1 / Math.sqrt(mem.length)
    const outRe = new Float64Array(nB2 * 24), outIm = new Float64Array(nB2 * 24)
    for (const ds of mem) {
      const d = Math.floor(ds / 24), s = ds % 24, os = OPP[s]!
      const dKeep = hcNeighbors[d]![s]!, dCross = hcNeighbors[d]![os]!
      const iK = dKeep * 24 + s, iC = dCross * 24 + os
      outRe[iK] = outRe[iK]! + inv * C_KEEP[0]; outIm[iK] = outIm[iK]! + inv * C_KEEP[1]
      outRe[iC] = outRe[iC]! + inv * C_CROSS[0]; outIm[iC] = outIm[iC]! + inv * C_CROSS[1]
    }
    // Project onto P_orb (replace each slot orbit by its mean) and measure residual norm!
    let res2 = 0
    for (const om of slotOrbs) {
      let mr = 0, mi = 0
      for (const ds of om) { mr += outRe[ds]!; mi += outIm[ds]! }
      mr /= om.length; mi /= om.length
      for (const ds of om) res2 += (outRe[ds]! - mr) ** 2 + (outIm[ds]! - mi) ** 2
    }
    maxOrbLeak1Body = Math.max(maxOrbLeak1Body, Math.sqrt(res2))
  }
  console.log(`  [1B] W(F_4) quotient on B_3 (8,857 docks -> ${nOrb} dock orbits, ${slotOrbs.length} B_2 slot orbits, ${b1SlotOrbs.length} interior B_1 orbits):`)
  console.log(`       Exact 1-body lumpability defect ||(I - P_orb) U P_orb|| = ${maxOrbLeak1Body.toExponential(2)} (EXACT 0 to machine precision!)`)

  // --- 1C. Unaliased 3D Cusp Column-Sum Projection (E-HLG-0043 Non-Closure Check) ---
  // Exact conflict-free downward horosphere half-space inside B_3:
  // D = 0 horosphere is { d in B_3 : twiceForm(c_d, CUSP_V) = (-2, 0) }; exact graph horosphere depth D = 0, 1, 2, 3
  // is computed via BFS strictly inside the downward half-space twiceForm <= -2 (ZERO torus aliasing conflicts!).
  const isD0Cusp = (c: readonly Q2[]): boolean => {
    const tf = twiceForm(c, CUSP_V)
    return tf[0] === -2n && tf[1] === 0n
  }
  const cuspDocks: number[] = []
  const cuspIdx = new Int32Array(nB3).fill(-1)
  for (let d = 0; d < nB3; d++) {
    if (q2Float(twiceForm(dockCenters[d]!, CUSP_V)) <= -2 + 1e-9) {
      cuspIdx[d] = cuspDocks.length
      cuspDocks.push(d)
    }
  }
  const nCusp = cuspDocks.length
  const colRoots: Set<number>[] = Array.from({ length: nCusp }, () => new Set<number>())
  const cuspDepth = new Int32Array(nCusp).fill(-1)
  const colQ: number[] = []
  const layerRoots: number[] = []
  for (let i = 0; i < nCusp; i++) {
    if (isD0Cusp(dockCenters[cuspDocks[i]!]!)) {
      cuspDepth[i] = 0
      colRoots[i]!.add(layerRoots.length)
      layerRoots.push(i)
      colQ.push(i)
    }
  }
  for (let h = 0; h < colQ.length; h++) {
    const u = colQ[h]!, du = cuspDepth[u]!, gd = cuspDocks[u]!
    for (let s = 0; s < 24; s++) {
      const nb = hcNeighbors[gd]![s]!
      if (nb < 0) continue
      const v = cuspIdx[nb]!
      if (v < 0) continue
      if (cuspDepth[v] === -1) {
        cuspDepth[v] = du + 1
        for (const r of colRoots[u]!) colRoots[v]!.add(r)
        colQ.push(v)
      } else if (cuspDepth[v] === du + 1) {
        for (const r of colRoots[u]!) colRoots[v]!.add(r)
      }
    }
  }
  // Pick origin dock 0 (D = 0, column 0): find one lateral slot (D=0 -> D=0) and one unique-column-0 D=1 dock + downward slot!
  const c0Idx = cuspIdx[0]!
  assertExact(cuspDepth[c0Idx] === 0, 'origin must be D=0')
  const col0Id = [...colRoots[c0Idx]!][0]!
  let latSlot = -1, downDock = -1, downSlot = -1
  for (let s = 0; s < 24; s++) {
    const nb = hcNeighbors[0]![s]!
    const ci = cuspIdx[nb]!
    if (ci >= 0 && cuspDepth[ci] === 0 && latSlot < 0) latSlot = s
    if (ci >= 0 && cuspDepth[ci] === 1 && colRoots[ci]!.size === 1 && colRoots[ci]!.has(col0Id) && downDock < 0) {
      downDock = nb; downSlot = s
    }
  }
  assertExact(latSlot >= 0 && downDock >= 0, 'found lateral and unique D=1 column-0 slots')
  // Check 1-beat evolution of State A (dock 0, latSlot) vs State B (downDock, downSlot) under exact bare 1-body U on B_3!
  const colProfileAfter1Beat = (startDock: number, startSlot: number): Float64Array => {
    const q = new Float64Array(layerRoots.length)
    const os = OPP[startSlot]!
    const branches: readonly [number, number][] = [
      [hcNeighbors[startDock]![startSlot]!, cAbs2(C_KEEP)],
      [hcNeighbors[startDock]![os]!, cAbs2(C_CROSS)],
    ]
    for (const [dst, prob] of branches) {
      const ci = cuspIdx[dst]!
      assertExact(ci >= 0 && colRoots[ci]!.size > 0, '1-beat destination inside unaliased cusp patch')
      const share = prob / colRoots[ci]!.size
      for (const r of colRoots[ci]!) q[r] = q[r]! + share
    }
    return q
  }
  const qA1 = colProfileAfter1Beat(0, latSlot)
  const qB1 = colProfileAfter1Beat(downDock, downSlot)
  let cuspL1Div1 = 0
  for (let c = 0; c < layerRoots.length; c++) cuspL1Div1 += Math.abs(qA1[c]! - qB1[c]!)
  // Cross-column neighbor share at D = 0, 1 on interior docks (with all 24 neighbors inside B_3)
  const crossShareByD = [0, 1].map(dep => {
    let tot = 0, cross = 0
    for (let i = 0; i < nCusp; i++) {
      const gd = cuspDocks[i]!
      if (cuspDepth[i] !== dep || dockRad[gd]! >= 2) continue
      tot++
      const rx = colRoots[i]!
      let hasCross = false
      for (let s = 0; s < 24; s++) {
        const ci = cuspIdx[hcNeighbors[gd]![s]!]!
        if (ci < 0) continue
        for (const r of colRoots[ci]!) if (!rx.has(r)) hasCross = true
      }
      if (hasCross) cross++
    }
    return tot > 0 ? cross / tot : 0
  })
  // Also linear column-average subspace projector leakage ||(I - P_col) U |v_col0>||_2 on column-0 uniform D=0,1 vector!
  const col0Slots: [number, number][] = []
  for (let s = 0; s < 24; s++) col0Slots.push([0, s])
  for (let i = 0; i < nCusp; i++) {
    if (cuspDepth[i] === 1 && colRoots[i]!.size === 1 && colRoots[i]!.has(col0Id)) {
      for (let s = 0; s < 24; s++) col0Slots.push([cuspDocks[i]!, s])
    }
  }
  const invC0 = 1 / Math.sqrt(col0Slots.length)
  const outByCol = new Map<string, [number, number]>()
  for (const [d, s] of col0Slots) {
    const os = OPP[s]!
    for (const [dst, sl, amp] of [[hcNeighbors[d]![s]!, s, C_KEEP], [hcNeighbors[d]![os]!, os, C_CROSS]] as const) {
      const k = `${dst}:${sl}`
      const ex = outByCol.get(k)
      if (ex) { ex[0] += invC0 * amp[0]; ex[1] += invC0 * amp[1] }
      else outByCol.set(k, [invC0 * amp[0], invC0 * amp[1]])
    }
  }
  // Compute variance within each column's slot set -> strict lower bound on ||(I - P_col) U |v_col0>||_2
  let col0OutSumR = 0, col0OutSumI = 0
  for (const [d, s] of col0Slots) { const v = outByCol.get(`${d}:${s}`); if (v) { col0OutSumR += v[0]; col0OutSumI += v[1] } }
  const c0MeanR = col0OutSumR / col0Slots.length, c0MeanI = col0OutSumI / col0Slots.length
  let colSubLeak2 = 0
  for (const [d, s] of col0Slots) {
    const v = outByCol.get(`${d}:${s}`) ?? [0, 0]
    colSubLeak2 += (v[0] - c0MeanR) ** 2 + (v[1] - c0MeanI) ** 2
  }
  const cuspLinearLeak = Math.sqrt(colSubLeak2)

  const cuspDepthCounts = [0, 0, 0, 0]
  for (let i = 0; i < nCusp; i++) {
    const dep = cuspDepth[i]!
    assertExact(dep >= 0 && dep <= 3, `cusp depth in 0..3, got ${dep}`)
    cuspDepthCounts[dep] = cuspDepthCounts[dep]! + 1
  }
  console.log(`  [1C] Unaliased 3D cusp column-sum projection (E-HLG-0043, 0 wrapping conflicts, ${nCusp} D<=3 docks (${cuspDepthCounts.join(', ')}), ${layerRoots.length} columns):`)
  console.log(`       Cross-column neighbor share (D=0 -> D=1): ${crossShareByD[0]!.toFixed(4)} -> ${crossShareByD[1]!.toFixed(4)}`)
  console.log(`       Matched Q_c(0) states (A@D=0 vs B@D=1): ||Q(A,1)-Q(B,1)||_1 = ${cuspL1Div1.toFixed(6)} (NON-CLOSED!), D<=1 linear ||(I-P_col)U P_col|| >= ${cuspLinearLeak.toFixed(6)}`)

  // --- 1D. Exact W10 Bulk Logical Subspace [[24, 1, 8]]_3 Layer-by-Layer Lumpability Audit! ---
  // Exploit exact 3-frame x 81-diff factorization of [[24, 1, 8]]_3 inside 3^24 = 282,429,536,481 dimensions!
  // On each line l = (a, b): s_l = (x_a + x_b) mod 3, d_l = (x_a - x_b) mod 3 (x_a = 2(s+d), x_b = 2(s-d)).
  // Three disjoint 4-line frames for sum code: F0={0,1,10,11}, F1={2,3,8,9}, F2={4,5,6,7}!
  const FRAMES4: readonly (readonly [number, number, number, number])[] = [[0, 1, 10, 11], [2, 3, 8, 9], [4, 5, 6, 7]]
  // Build exact 3-vector basis |c>_m (c=0,1,2, length 81) for each 4-line frame m = 0,1,2
  const buildFrameBasis = (fIdx: number): { re: Float64Array[]; im: Float64Array[] } => {
    const flines = FRAMES4[fIdx]!
    // Extract the 3 w9Defs rows belonging to this frame and map to sum-qutrit Pauli (u_s = 2 u, v_s = v)!
    const gens: { u: number[]; v: number[] }[] = []
    for (const def of T.w9Defs) {
      const touches = def.some(([, l]) => flines.includes(l))
      if (!touches) continue
      const u = [0, 0, 0, 0], v = [0, 0, 0, 0]
      for (const [p, l, val] of def) {
        const pos = flines.indexOf(l)
        assertExact(pos >= 0, 'w9Def stays inside one frame')
        if (p === 0) u[pos] = mod3(u[pos]! + 2 * val)
        else v[pos] = mod3(v[pos]! + val)
      }
      gens.push({ u, v })
    }
    assertExact(gens.length === 3, '3 stabilizers per 4-line frame')
    // Projectors for each frame-charge c in {0, 1, 2}: sum_i s_i == c (mod 3), where Z_frame = Z^1 Z^1 Z^1 Z^1 has eigenvalue w^c!
    // Apply P_m = prod_{g in gens} (1/3)(I + g + g^2) to a seed state |c, 0, 0, 0> (charge c)!
    // NOTE: check exact Weyl phase of g = X^u Z^v: to make g^3 = I and [g_i, g_j] = 0 with eigenvalue +1,
    // use Hermitian-phase convention g = w^{(u.v)} X^u Z^v -> check (w^a X^u Z^v)^3 = w^{3a + 3 u.v} = 1,
    // and check commutation of our 3 gens in F0..F2: all pairs have u_1.v_2 == u_2.v_1 (mod 3)!
    const applyPauli4 = (u: readonly number[], v: readonly number[], sr: Float64Array, si: Float64Array): [Float64Array, Float64Array] => {
      // Action: (w^{2 u.v} X^u Z^v) |x> -> check (w^p X^u Z^v)^3 |x> = w^{3p + 3(u.v)} |x> = |x>!
      // Wait: for X^u Z^v |x> = w^{v.x} |x + u>, (X^u Z^v)^2 |x> = w^{v.x + v.(x+u)} |x+2u>, (X^u Z^v)^3 |x> = w^{3 v.x + 3 v.u} |x> = |x> ALREADY!
      // And check sign on 24-qutrit line pairs (a, b): on two qutrits X_a^p X_b^p Z_a^q Z_b^q acts on |x_a, x_b> with phase w^{q(x_a+x_b)} = w^{q s},
      // shifting s -> s + 2p! So the exact induced operator on s is LITERALLY X_s^{2p} Z_s^q with ZERO extra phase!
      const or = new Float64Array(81), oi = new Float64Array(81)
      for (let idx = 0; idx < 81; idx++) {
        const ar = sr[idx]!, ai = si[idx]!
        if (ar === 0 && ai === 0) continue
        const x0 = idx % 3, x1 = Math.floor(idx / 3) % 3, x2 = Math.floor(idx / 9) % 3, x3 = Math.floor(idx / 27)
        const ph = mod3(v[0]! * x0 + v[1]! * x1 + v[2]! * x2 + v[3]! * x3)
        const dst = mod3(x0 + u[0]!) + 3 * mod3(x1 + u[1]!) + 9 * mod3(x2 + u[2]!) + 27 * mod3(x3 + u[3]!)
        const w = W_POW[ph]!
        or[dst] = or[dst]! + (ar * w[0] - ai * w[1])
        oi[dst] = oi[dst]! + (ar * w[1] + ai * w[0])
      }
      return [or, oi]
    }
    const reList: Float64Array[] = [], imList: Float64Array[] = []
    // Build |0> by projecting |0,0,0,0>, then |1> = X_all |0>, |2> = X_all^2 |0> (where X_all = X_s^{2,2,2,2} shifts charge by 8 == 2 mod 3 -> wait: shift charge by +1 using X_s^{1,1,1,1}!)
    // Careful! allX on 24 qutrits is X_a^1 X_b^1 on all 12 lines -> X_s^2 on all 12 sum qutrits -> shifts each block's sum by 4*2 = 8 == 2 mod 3!
    // Define |c_m> to have frame-sum == c_m (mod 3), linked by X_block = X_s^{2,2,2,2}: X_block |0> = |2>, X_block^2 |0> = |1>!
    let r0 = new Float64Array(81), i0 = new Float64Array(81); r0[0] = 1
    for (const g of gens) {
      const [r1, i1] = applyPauli4(g.u, g.v, r0, i0)
      const [r2, i2] = applyPauli4(g.u, g.v, r1, i1)
      const nr = new Float64Array(81), ni = new Float64Array(81)
      for (let k = 0; k < 81; k++) { nr[k] = (r0[k]! + r1[k]! + r2[k]!) / 3; ni[k] = (i0[k]! + i1[k]! + i2[k]!) / 3 }
      r0 = nr; i0 = ni
    }
    let n2 = 0; for (let k = 0; k < 81; k++) n2 += r0[k]! ** 2 + i0[k]! ** 2
    assertExact(n2 > 0.01, `frame ${fIdx} projection nonzero`)
    const inv = 1 / Math.sqrt(n2); for (let k = 0; k < 81; k++) { r0[k] = r0[k]! * inv; i0[k] = i0[k]! * inv }
    const [r2, i2] = applyPauli4([2, 2, 2, 2], [0, 0, 0, 0], r0, i0) // charge 2
    const [r1, i1] = applyPauli4([2, 2, 2, 2], [0, 0, 0, 0], r2, i2) // charge 1
    reList.push(r0, r1, r2); imList.push(i0, i1, i2)
    return { re: reList, im: imList }
  }
  const frameBases = [0, 1, 2].map(buildFrameBasis)
  // Verify exact Z_frame eigenvalues on |c_m>: sum(s) === c (mod 3)
  for (let m = 0; m < 3; m++) {
    for (let c = 0; c < 3; c++) {
      for (let idx = 0; idx < 81; idx++) {
        if (Math.hypot(frameBases[m]!.re[c]![idx]!, frameBases[m]!.im[c]![idx]!) > 1e-12) {
          const sumS = mod3((idx % 3) + (Math.floor(idx / 3) % 3) + (Math.floor(idx / 9) % 3) + Math.floor(idx / 27))
          assertExact(sumS === c, `frame ${m} charge ${c}`)
        }
      }
    }
  }
  // Exact 3 codewords |a_L> (a=0,1,2) in the 27-dim frame-charge basis |c0, c1, c2> (c0+c1+c2 === 0 mod 3):
  //   allX acts as X_block^{x3}: |c0, c1, c2> -> |c0+2, c1+2, c2+2>.
  //   zL has value 1 on F0, 2 on F1, 0 on F2 -> eigenvalue w^{c0 + 2 c1} = w^{c0 - c1}!
  //   So |a_L> = (1/sqrt(3)) sum_{t=0}^2 |c0, c1, c2> where c0+c1+c2 = 0 and c0 - c1 = a (mod 3)!
  //   Explicitly: for a in {0,1,2}, the 3 triples (c0, c1, c2) are:
  //     t=0: (0, 2a, a), t=1: (1, 2a+1, a+1), t=2: (2, 2a+2, a+2) all mod 3!
  //   Check: c0+c1+c2 = 3t + 3a = 0 mod 3; c0 - c1 = -2a = a mod 3; allX shifts t -> t+2 (invariant)!
  const codeTriples: readonly (readonly [number, number, number])[][] = [0, 1, 2].map(a =>
    [0, 1, 2].map(t => [t, mod3(2 * a + t), mod3(a + t)] as const),
  )

  // Build exact 81-element X-basis support D_X (C_X^perp) of the 12-qutrit diff code (lvmDefs)!
  const lvmXMat: GF3Row[] = []
  for (let i = 0; i < 8; i++) {
    const r = gf3RowZero(1)
    for (const [, l, v] of T.lvmDefs[i]!) gf3Set(r, l, mod3(2 * v))
    lvmXMat.push(r)
  }
  const diffKerBasis = gf3Nullspace(lvmXMat, 12)
  assertExact(diffKerBasis.length === 4, `Expected 4D X-nullspace for diff code, got ${diffKerBasis.length}`)
  const diffXVecs: Uint8Array[] = []
  for (let a0 = 0; a0 < 3; a0++) for (let a1 = 0; a1 < 3; a1++) for (let a2 = 0; a2 < 3; a2++) for (let a3 = 0; a3 < 3; a3++) {
    const v = new Uint8Array(12), cs = [a0, a1, a2, a3]
    for (let l = 0; l < 12; l++) {
      let s = 0; for (let j = 0; j < 4; j++) s += cs[j]! * gf3Get(diffKerBasis[j]!, l)
      v[l] = s % 3
    }
    diffXVecs.push(v)
  }
  assertExact(diffXVecs.length === 81, '81 diff X-basis vectors')

  // Helper: exact 3x3 projected code matrix <a_L | bigotimes_{l=0}^{11} L_l | b_L> for ANY 12-line tensor product!
  // Each L_l is a 9x9 complex matrix on single-line basis |x_a, x_b> (x_a, x_b in {0, 1, 2}, index = 3*x_a + x_b)!
  // Note: supports both uniform L_l = L0 and line-dependent L_l (e.g. single-qutrit Pauli on line 0)!
  const project12LineOp = (ops9: readonly CMat[]): CMat => {
    // Transform each 9x9 matrix L_l from (x_a, x_b) into (s, d_X) basis where |s, p_X> = (1/sqrt(3)) sum_d w^{-p d} |x_a(s,d), x_b(s,d)>!
    // Store A_l[p * 3 + q] as a 3x3 matrix on s (row sOut, col sIn)
    const A: CMat[][] = ops9.map(L => {
      const mats: CMat[] = Array.from({ length: 9 }, () => cmatZero(3))
      for (let sOut = 0; sOut < 3; sOut++) {
        for (let sIn = 0; sIn < 3; sIn++) {
          for (let p = 0; p < 3; p++) {
            for (let q = 0; q < 3; q++) {
              let sr = 0, si = 0
              for (let dOut = 0; dOut < 3; dOut++) {
                const xaOut = (2 * (sOut + dOut)) % 3, xbOut = (2 * (sOut - dOut + 3)) % 3
                const rIdx = xaOut * 3 + xbOut
                for (let dIn = 0; dIn < 3; dIn++) {
                  const xaIn = (2 * (sIn + dIn)) % 3, xbIn = (2 * (sIn - dIn + 3)) % 3
                  const cIdx = xaIn * 3 + xbIn
                  // <p_X| dOut> <dIn | q_X> = (1/3) w^{+p dOut - q dIn}
                  const ph = mod3(p * dOut - q * dIn)
                  const w = W_POW[ph]!
                  const lr = L.re[rIdx * 9 + cIdx]!, li = L.im[rIdx * 9 + cIdx]!
                  sr += lr * w[0] - li * w[1]
                  si += lr * w[1] + li * w[0]
                }
              }
              mats[p * 3 + q]!.re[sOut * 3 + sIn] = sr / 3
              mats[p * 3 + q]!.im[sOut * 3 + sIn] = si / 3
            }
          }
        }
      }
      return mats
    })

    // Cache 3x3 frame-charge transfer matrices T_m[key(p4, q4)] for each frame m = 0, 1, 2
    const frameCache: Map<number, CMat>[] = [new Map(), new Map(), new Map()]
    const getFrameT = (m: number, dOut: Uint8Array, dIn: Uint8Array): CMat => {
      const fl = FRAMES4[m]!
      const pq0 = dOut[fl[0]]! * 3 + dIn[fl[0]]!, pq1 = dOut[fl[1]]! * 3 + dIn[fl[1]]!
      const pq2 = dOut[fl[2]]! * 3 + dIn[fl[2]]!, pq3 = dOut[fl[3]]! * 3 + dIn[fl[3]]!
      const key = ((pq0 * 9 + pq1) * 9 + pq2) * 9 + pq3
      const hit = frameCache[m]!.get(key)
      if (hit) return hit
      const M0 = A[fl[0]]![pq0]!, M1 = A[fl[1]]![pq1]!, M2 = A[fl[2]]![pq2]!, M3 = A[fl[3]]![pq3]!
      const fb = frameBases[m]!
      // Apply M0 (x) M1 (x) M2 (x) M3 to each of the 3 basis vectors |cIn> (length 81) in 4 fast 1-qutrit sweeps!
      const out = cmatZero(3)
      const tmpR = new Float64Array(81), tmpI = new Float64Array(81)
      const nxtR = new Float64Array(81), nxtI = new Float64Array(81)
      const apply1 = (M: CMat, stride: number, sR: Float64Array, sI: Float64Array, dR: Float64Array, dI: Float64Array) => {
        dR.fill(0); dI.fill(0)
        for (let idx = 0; idx < 81; idx++) {
          const ar = sR[idx]!, ai = sI[idx]!
          if (ar === 0 && ai === 0) continue
          const dig = Math.floor(idx / stride) % 3, base = idx - dig * stride
          for (let o = 0; o < 3; o++) {
            const mr = M.re[o * 3 + dig]!, mi = M.im[o * 3 + dig]!
            const dst = base + o * stride
            dR[dst] = dR[dst]! + (mr * ar - mi * ai)
            dI[dst] = dI[dst]! + (mr * ai + mi * ar)
          }
        }
      }
      for (let cIn = 0; cIn < 3; cIn++) {
        apply1(M0, 1, fb.re[cIn]!, fb.im[cIn]!, tmpR, tmpI)
        apply1(M1, 3, tmpR, tmpI, nxtR, nxtI)
        apply1(M2, 9, nxtR, nxtI, tmpR, tmpI)
        apply1(M3, 27, tmpR, tmpI, nxtR, nxtI)
        for (let cOut = 0; cOut < 3; cOut++) {
          let sr = 0, si = 0
          const bR = fb.re[cOut]!, bI = fb.im[cOut]!
          for (let k = 0; k < 81; k++) { sr += bR[k]! * nxtR[k]! + bI[k]! * nxtI[k]!; si += bR[k]! * nxtI[k]! - bI[k]! * nxtR[k]! }
          out.re[cOut * 3 + cIn] = sr; out.im[cOut * 3 + cIn] = si
        }
      }
      frameCache[m]!.set(key, out)
      return out
    }

    const res = cmatZero(3)
    for (let i = 0; i < 81; i++) {
      const dOut = diffXVecs[i]!
      for (let j = 0; j < 81; j++) {
        const dIn = diffXVecs[j]!
        const T0 = getFrameT(0, dOut, dIn), T1 = getFrameT(1, dOut, dIn), T2 = getFrameT(2, dOut, dIn)
        for (let a = 0; a < 3; a++) {
          for (let b = 0; b < 3; b++) {
            let sr = 0, si = 0
            for (const [o0, o1, o2] of codeTriples[a]!) {
              for (const [i0, i1, i2] of codeTriples[b]!) {
                const p0: C = [T0.re[o0 * 3 + i0]!, T0.im[o0 * 3 + i0]!]
                const p1: C = [T1.re[o1 * 3 + i1]!, T1.im[o1 * 3 + i1]!]
                const p2: C = [T2.re[o2 * 3 + i2]!, T2.im[o2 * 3 + i2]!]
                const p = cMul(cMul(p0, p1), p2)
                sr += p[0]; si += p[1]
              }
            }
            res.re[a * 3 + b] = res.re[a * 3 + b]! + sr / 243 // 1/81 (diff) * 1/3 (code normalization) = 1/243
            res.im[a * 3 + b] = res.im[a * 3 + b]! + si / 243
          }
        }
      }
    }
    return res
  }

  const codeLeakFromProj = (P: CMat): number => {
    // M = P^dag P -> ||(I - P_code) L P_code|| = sqrt(max(0, 1 - lambda_min(P^dag P)))
    const M = cmatZero(3)
    for (let a = 0; a < 3; a++) {
      for (let b = 0; b < 3; b++) {
        let sr = 0, si = 0
        for (let c = 0; c < 3; c++) {
          sr += P.re[c * 3 + a]! * P.re[c * 3 + b]! + P.im[c * 3 + a]! * P.im[c * 3 + b]!
          si += P.re[c * 3 + a]! * P.im[c * 3 + b]! - P.im[c * 3 + a]! * P.re[c * 3 + b]!
        }
        M.re[a * 3 + b] = sr; M.im[a * 3 + b] = si
      }
    }
    const { vals } = hermitianJacobi(M)
    return Math.sqrt(Math.max(0, 1 - vals[0]!))
  }

  // Build exact 9x9 single-line operators for bare U layers (tone 0=0, 1=+1, 2=-1; basis idx = 3*x_a + x_b)
  const makeLineOp = (kind: 'I' | 'D' | 'C' | 'K' | 'M_meet' | 'X_a' | 'Z_a' | 'X_both' | 'Z_both'): CMat => {
    const M = cmatZero(9)
    const set = (r: number, c: number, v: C) => { M.re[r * 9 + c] = v[0]; M.im[r * 9 + c] = v[1] }
    if (kind === 'I') { for (let i = 0; i < 9; i++) set(i, i, [1, 0]); return M }
    if (kind === 'X_a' || kind === 'Z_a' || kind === 'X_both' || kind === 'Z_both') {
      for (let xa = 0; xa < 3; xa++) for (let xb = 0; xb < 3; xb++) {
        const c = xa * 3 + xb
        if (kind === 'X_a') set(((xa + 1) % 3) * 3 + xb, c, [1, 0])
        else if (kind === 'Z_a') set(c, c, W_POW[xa]!)
        else if (kind === 'X_both') set(((xa + 1) % 3) * 3 + ((xb + 1) % 3), c, [1, 0])
        else set(c, c, W_POW[(xa + xb) % 3]!)
      }
      return M
    }
    for (let xa = 0; xa < 3; xa++) for (let xb = 0; xb < 3; xb++) {
      const idx = xa * 3 + xb
      if (kind === 'D' || kind === 'C') {
        const diag = kind === 'D' ? D_DIAG : C_KEEP
        const off = kind === 'D' ? D_OFF : C_CROSS
        const both = kind === 'D' ? Z6_C : W_C
        if (xa === 0 && xb === 0) set(idx, idx, [1, 0])
        else if (xa !== 0 && xb !== 0) set(idx, idx, both)
        else { set(idx, idx, diag); set(xb * 3 + xa, idx, off) }
      } else if (kind === 'K') {
        if ((xa === 1 && xb === 2) || (xa === 2 && xb === 1)) set(xb * 3 + xa, idx, [-1, 0])
        else set(idx, idx, [1, 0])
      } else {
        // M_meet (equal role): w on (1,1) and (2,2)
        if ((xa === 1 && xb === 1) || (xa === 2 && xb === 2)) set(idx, idx, W_C)
        else set(idx, idx, [1, 0])
      }
    }
    return M
  }
  const opI = makeLineOp('I'), opD = makeLineOp('D'), opC = makeLineOp('C'), opK = makeLineOp('K'), opMeet = makeLineOp('M_meet')
  const opOnDock1Line = cmatMul(opD, cmatMul(opMeet, cmatMul(opK, opD)))
  assertExact(cmatUnitaryErr(opD) < 1e-14 && cmatUnitaryErr(opC) < 1e-14 && cmatUnitaryErr(opK) < 1e-14 && cmatUnitaryErr(opMeet) < 1e-14, '1-line ops unitary')

  // Sanity checks: I, Z_L, X_L must have eps_code = 0; single-qutrit X_0 must have eps_code = 1!
  const pI = project12LineOp(Array.from({ length: 12 }, () => opI))
  const opZ2 = cmatMul(makeLineOp('Z_both'), makeLineOp('Z_both'))
  const zLOps = Array.from({ length: 12 }, (_, l) => {
    const f = FRAME_OF[LINES[l]![0]]!
    return f === 0 ? makeLineOp('Z_both') : f === 1 ? opZ2 : opI
  })
  const pZL = project12LineOp(zLOps)
  const pX0 = project12LineOp(Array.from({ length: 12 }, (_, l) => (l === 0 ? makeLineOp('X_a') : opI)))
  const epsI = codeLeakFromProj(pI), epsZL = codeLeakFromProj(pZL), epsX0 = codeLeakFromProj(pX0)

  // Bare U layers on [[24, 1, 8]]_3:
  const pD = project12LineOp(Array.from({ length: 12 }, () => opD))
  const pC = project12LineOp(Array.from({ length: 12 }, () => opC))
  const pK = project12LineOp(Array.from({ length: 12 }, () => opK))
  const pMeet = project12LineOp(Array.from({ length: 12 }, () => opMeet))
  const pOnDock = project12LineOp(Array.from({ length: 12 }, () => opOnDock1Line))
  const epsD = codeLeakFromProj(pD), epsC = codeLeakFromProj(pC), epsK = codeLeakFromProj(pK)
  const epsMeet = codeLeakFromProj(pMeet), epsOnDock = codeLeakFromProj(pOnDock)

  // Exact algebraic proof that M_pair acts as EXACT IDENTITY on [[24, 1, 8]]_3:
  // M_pair only modifies basis states with Hamming weight 2, same tone, antipodal pair -> s has weight 1 and d = 0.
  // Since allZ enforces sum_{l=0}^{11} s_l === 0 (mod 3), ZERO basis state in [[24, 1, 8]]_3 can have weight-1 s!
  // Verify directly on the 3 frame bases that ZERO nonzero triple (c0, c1, c2) with c0+c1+c2=0 contains a single-line weight-1 s!
  let mpairWeight2SupportCount = 0
  for (let a = 0; a < 3; a++) {
    for (const [c0, c1, c2] of codeTriples[a]!) {
      // To have total sum-weight 1 across 12 lines, two frames must be at idx 0 (charge 0) and one frame at weight-1 (charge 1 or 2) -> sum != 0 mod 3!
      if ((c0 === 0 && c1 === 0 && c2 !== 0) || (c0 === 0 && c2 === 0 && c1 !== 0) || (c1 === 0 && c2 === 0 && c0 !== 0)) {
        mpairWeight2SupportCount++
      }
    }
  }
  const epsMPair = mpairWeight2SupportCount === 0 ? 0 : 1

  // Exact GF(3) audit of Streaming S (antipodal slot swap on a single dock / internal edge swap on B_1):
  // On a single dock, swapping every antipodal slot pair (a <-> OPP[a]) negates d_l -> -d_l while fixing s_l!
  // Check whether the antipodal swap preserves T.bulk23!
  const bulk23GF3 = T.bulk23.map(gf3FromUint8)
  const swappedBulk23 = T.bulk23.map(r => {
    const out = new Uint8Array(48)
    for (let s = 0; s < 24; s++) { out[OPP[s]!] = r[s]!; out[24 + OPP[s]!] = r[24 + s]! }
    return gf3FromUint8(out)
  })
  const swapPreservesSingleDock = gf3Rank([...bulk23GF3, ...swappedBulk23], 48) === 23
  // On B_1 (25 docks, 552 boundary qutrits + 25 bulk), streaming S swaps internal edge endpoints (0, a) <-> (1+a, OPP[a]) and shifts boundary outward ->
  // On a closed 2x2x2 cusp torus (8 docks, 24 lateral edges), check if lateral-edge streaming preserves the 8-dock stabilizer code (exact GF(3))!
  // Even simpler and exact on B_0: since antipodal swap maps d -> -d, all 12 lvmDefs (pure X or pure Z) negate to g^2 in span(S_23), so antipodal reflection preserves [[24,1,8]]_3,
  // whereas on 2 coupled docks (d0, d1) connected across edge e = (a, OPP[a]), streaming S swaps slots (d0, a) <-> (d1, OPP[a]): check GF(3) code invariance!
  const twoDockRows = [
    ...T.bulk23.map(r => { const f = new Uint8Array(96); for (let s = 0; s < 24; s++) { f[s] = r[s]!; f[48 + s] = r[24 + s]! } return f }),
    ...T.bulk23.map(r => { const f = new Uint8Array(96); for (let s = 0; s < 24; s++) { f[24 + s] = r[s]!; f[48 + 24 + s] = mod3(2 * r[24 + s]!) } return f }),
  ]
  const twoDockGF3 = twoDockRows.map(gf3FromUint8)
  const streamed2DockArr = twoDockRows.map(r => {
    const f = Uint8Array.from(r)
    // Swap edge (d0, slot 0) <-> (d1, slot OPP[0])
    const s0 = 0, s1 = 24 + OPP[0]!
    const tx = f[s0]!; f[s0] = f[s1]!; f[s1] = tx
    const tz = f[48 + s0]!; f[48 + s0] = f[48 + s1]!; f[48 + s1] = tz
    return f
  })
  const streamed2Dock = streamed2DockArr.map(gf3FromUint8)
  const streamRankShift = gf3Rank([...twoDockGF3, ...streamed2Dock], 96) - twoDockGF3.length
  // Explicitly verify k_anti = rank(<S_1, S_2>_symp) === streamRankShift so P_1 P_2 P_1 = 3^{-k_anti} P_1 is exact!
  const nGen2D = twoDockRows.length
  const sympMatRows: GF3Row[] = []
  for (let i = 0; i < nGen2D; i++) {
    const g = twoDockRows[i]!, row = new Uint8Array(nGen2D)
    for (let j = 0; j < nGen2D; j++) {
      const h = streamed2DockArr[j]!
      let ip = 0
      for (let q = 0; q < 48; q++) ip += g[q]! * h[48 + q]! - g[48 + q]! * h[q]!
      row[j] = mod3(ip)
    }
    sympMatRows.push(gf3FromUint8(row))
  }
  const streamKAnti = gf3Rank(sympMatRows, nGen2D)
  assertExact(streamKAnti === streamRankShift, `stream k_anti (${streamKAnti}) must equal rank shift (${streamRankShift})`)
  const epsStream2Dock = streamKAnti > 0 ? Math.sqrt(1 - Math.pow(3, -streamKAnti)) : 0

  // Check Phi_odd nontrivial action on [[24, 1, 8]]_3:
  // Note: every s = 0 basis state has (sa, +1) paired with (sb, -1), so (-I) o C preserves it -> chi = 0!
  // Take a nonzero sum-vector s in supp(|0>_{F0}) (x) |0>_{F1} (x) |0>_{F2} paired with d in diffZBasis:
  // this breaks (-I) o C symmetry and produces an explicit basis state in supp(|0_L>) with chi mod 6 != 0!
  const lvmZMat: GF3Row[] = []
  for (let i = 8; i < 12; i++) {
    const r = gf3RowZero(1)
    for (const [, l, v] of T.lvmDefs[i]!) gf3Set(r, l, v)
    lvmZMat.push(r)
  }
  const diffZBasis = gf3Nullspace(lvmZMat, 12)
  const evalChiOfSD = (s12: readonly number[], d12: readonly number[]): number => {
    const vibes: Vibe[] = []
    for (let l = 0; l < 12; l++) {
      const xa = (2 * (s12[l]! + d12[l]!)) % 3, xb = (2 * (s12[l]! - d12[l]! + 3)) % 3
      const [sa, sb] = LINES[l]!
      if (xa !== 0) vibes.push([0, sa, xa === 1 ? 1 : -1, 0])
      if (xb !== 0) vibes.push([0, sb, xb === 1 ? 1 : -1, 0])
    }
    let chi = 0
    for (let i = 0; i < vibes.length; i++) {
      const ci = (vibes[i]![1] << 1) + (vibes[i]![2] < 0 ? 1 : 0)
      for (let j = i + 1; j < vibes.length; j++) {
        const cj = (vibes[j]![1] << 1) + (vibes[j]![2] < 0 ? 1 : 0)
        for (let k = j + 1; k < vibes.length; k++) {
          const ck = (vibes[k]![1] << 1) + (vibes[k]![2] < 0 ? 1 : 0)
          for (let e = k + 1; e < vibes.length; e++) {
            const ce = (vibes[e]![1] << 1) + (vibes[e]![2] < 0 ? 1 : 0)
            chi += chiral4Sign(ci, cj, ck, ce)
          }
        }
      }
    }
    return chi
  }
  // Collect nonzero s-indices in supp(|0>_{F0}) and supp(|0>_{F1})
  const supF0: number[] = [], supF1: number[] = []
  for (let idx = 0; idx < 81; idx++) {
    if (Math.hypot(frameBases[0]!.re[0]![idx]!, frameBases[0]!.im[0]![idx]!) > 1e-12) supF0.push(idx)
    if (Math.hypot(frameBases[1]!.re[0]![idx]!, frameBases[1]!.im[0]![idx]!) > 1e-12) supF1.push(idx)
  }
  let phiOddWitnessChi = 0, phiOddWitnessN = 0
  for (const idx0 of supF0) {
    if (phiOddWitnessChi !== 0) break
    for (const idx1 of supF1.slice(0, 6)) {
      if (phiOddWitnessChi !== 0) break
      const s12 = new Array<number>(12).fill(0)
      const f0 = FRAMES4[0]!, f1 = FRAMES4[1]!
      s12[f0[0]] = idx0 % 3; s12[f0[1]] = Math.floor(idx0 / 3) % 3; s12[f0[2]] = Math.floor(idx0 / 9) % 3; s12[f0[3]] = Math.floor(idx0 / 27)
      s12[f1[0]] = idx1 % 3; s12[f1[1]] = Math.floor(idx1 / 3) % 3; s12[f1[2]] = Math.floor(idx1 / 9) % 3; s12[f1[3]] = Math.floor(idx1 / 27)
      // Try d = 0 first (fastest, minimal weight!) then d = diffZBasis[0..3]
      const dCands: number[][] = [new Array<number>(12).fill(0)]
      for (let b = 0; b < 4; b++) dCands.push(Array.from({ length: 12 }, (_, l) => gf3Get(diffZBasis[b]!, l)))
      for (const d12 of dCands) {
        const chi = evalChiOfSD(s12, d12)
        if (((chi % 6) + 6) % 6 !== 0) {
          phiOddWitnessChi = chi
          for (let l = 0; l < 12; l++) {
            if ((2 * (s12[l]! + d12[l]!)) % 3 !== 0) phiOddWitnessN++
            if ((2 * (s12[l]! - d12[l]! + 3)) % 3 !== 0) phiOddWitnessN++
          }
          break
        }
      }
    }
  }

  console.log(`  [1D] Exact W10 [[24, 1, 8]]_3 Bulk Logical Subspace (3-frame x 81-diff exact contraction inside 3^24):`)
  console.log(`       Sanity controls: eps(I)=${epsI.toExponential(1)}, eps(Z_L)^2=${(epsZL * epsZL).toExponential(1)}, eps(X_0)=${epsX0.toFixed(6)} (exact 1.000000 by d=8!)`)
  console.log(`       Bare U layers on [[24, 1, 8]]_3:`)
  console.log(`         M_pair(zeta_18):         eps_code = ${epsMPair.toFixed(6)}  (EXACT 0! allZ forbids wt-2 same-tone basis states!)`)
  console.log(`         Half-coin D:             eps_code = ${epsD.toFixed(6)}  (|<0_L|D|0_L>|=${cAbs([pD.re[0]!, pD.im[0]!]).toFixed(6)})`)
  console.log(`         Full coin C = D^2:       eps_code = ${epsC.toFixed(6)}  (|<0_L|C|0_L>|=${cAbs([pC.re[0]!, pC.im[0]!]).toFixed(6)})`)
  console.log(`         Opposite-sign bounce K:  eps_code = ${epsK.toFixed(6)}  (|<0_L|K|0_L>|=${cAbs([pK.re[0]!, pK.im[0]!]).toFixed(6)})`)
  console.log(`         Same-sign M_meet:        eps_code = ${epsMeet.toFixed(6)}  (|<0_L|M_meet|0_L>|=${cAbs([pMeet.re[0]!, pMeet.im[0]!]).toFixed(6)})`)
  console.log(`         12-line beat D.M.K.D:    eps_code = ${epsOnDock.toFixed(6)}  (|<0_L|U_1l|0_L>|=${cAbs([pOnDock.re[0]!, pOnDock.im[0]!]).toFixed(6)})`)
  console.log(`         Chiral phase Phi_odd:    nontrivial phase witness in supp(|0_L>) (${phiOddWitnessN} vibes) has chi=${phiOddWitnessChi} (mod 6 = ${((phiOddWitnessChi % 6) + 6) % 6} != 0 -> breaks P_code!)`)
  console.log(`         Streaming S (2-dock):    single-dock antipodal swap preserves=${swapPreservesSingleDock}, inter-dock swap rkShift=${streamRankShift}, k_anti=${streamKAnti} -> eps_code=${epsStream2Dock.toFixed(6)}\n`)

  recordCheck(
    'E1',
    'Exact dynamical lumpability audit (doublon/trion=0, 31-orbit W(F_4)=0, cusp non-closed, W10 layer breakdown)',
    doubLump.epsLump < 1e-13 &&
      doubLump.lamErr < 1e-10 &&
      triLump.epsLump < 1e-13 &&
      triLump.lamErr < 1e-5 &&
      doub4DLeak === 0 &&
      trion4DLeak === 0 &&
      mpairNegLeak > 0.05 &&
      maxOrbLeak1Body < 1e-14 &&
      crossShareByD[0]! > crossShareByD[1]! &&
      cuspL1Div1 >= 0.5 - 1e-12 &&
      cuspLinearLeak > 0.25 &&
      epsI < 1e-14 &&
      epsZL * epsZL < 1e-13 &&
      Math.abs(epsX0 - 1) < 1e-14 &&
      epsMPair === 0 &&
      epsD > 0.5 &&
      epsOnDock > 0.5 &&
      ((phiOddWitnessChi % 6) + 6) % 6 !== 0 &&
      swapPreservesSingleDock &&
      epsStream2Dock > 0.5,
    `doub/trion=${doubLump.epsLump.toExponential(1)}/${triLump.epsLump.toExponential(1)}, 31-orb=${maxOrbLeak1Body.toExponential(1)}, cusp L1=${cuspL1Div1.toFixed(3)}, W10 M_pair=0 vs D/K/M_meet/S=${epsD.toFixed(3)}/${epsK.toFixed(3)}/${epsMeet.toFixed(3)}/${epsStream2Dock.toFixed(3)}`,
  )
}

// =================================================================================================
// EXPERIMENT 2: RT WEDGE PHASE-TRANSITION & QFI HORIZON AUDIT ON B_1 = [[552, 25, 40]]_3
// =================================================================================================

function runExperiment2() {
  console.log('==============================================================================================')
  console.log('EXPERIMENT 2: RT WEDGE PHASE TRANSITION, QFI HORIZONS & NOISE ROBUSTNESS ON B_1=[[552,25,40]]_3')
  console.log('==============================================================================================')

  const cB1Bulk = contractB1(false)
  const cB1Pure = contractB1(true)
  assertExact(cB1Bulk.basis.length === 577 && cB1Pure.basis.length === 552, 'B_1 exact ranks 577 & 552')

  const coneLegs = (a: number): number[] => Array.from({ length: 23 }, (_, j) => a * 23 + j)
  const conesUnion = (as: readonly number[]): number[] => as.flatMap(coneLegs)

  // Extract projected B_1 Choi basis with bulk_1..24 fixed to |0> (Z_{b_g} = +1) so b_0 (qutrit 552) is the single active bulk qutrit!
  // Compute exact supported logical subgroup L_A^{(0)} <= F_3^2 of origin bulk qutrit b_0 on ANY boundary subset A!
  // Exact theorem: (X_{b_0}^p Z_{b_0}^q) has a stabilizer-equivalent representative supported strictly on A
  // iff adding the vector (0 on A^c, X_{b_0}^p Z_{b_0}^q on b_0) leaves the rank of S(B_1)|_{A^c U {b_0}} UNCHANGED!
  // Wait: carefully check with b_1..24 projected to |0> vs unprojected!
  // For cB1Bulk (577 qutrits: 0..551 boundary, 552 origin b_0, 553..576 shell-1 bulk):
  // A Pauli P_A (x) I_{A^c} (x) O_{b_0} (x) I_{b_1..24} lies in the Choi stabilizer group S(B_1)
  // iff restricted to A^c U {b_0, b_1..24} it equals (0 on A^c, O_{b_0} on b_0, 0 on b_1..24) — wait:
  // If shell-1 bulk qutrits b_1..24 are fixed to |0> (stabilized by Z_{b_1..24}), then O_{b_0} can carry ANY Z_{b_1..24} factor!
  // So in the projected 553-qutrit Choi state stBH (rank 553 on 552 boundary + b_0), a Pauli O_{b_0} = X^p Z^q
  // is supported on A iff (0 on A^c, X^p Z^q on b_0) lies in the row space of stBH restricted to A^c U {b_0}!
  // First build stBH (exact 553-qutrit Lagrangian with b_1..24 projected to |0>, matching W10 H6):
  const reord = cB1Bulk.basis.map(r => {
    const out = gf3RowZero((2 * 577 + 31) >>> 5)
    for (let b = 0; b < 25; b++) {
      const xv = gf3Get(r, 552 + b), zv = gf3Get(r, 577 + 552 + b)
      if (xv) gf3Set(out, b, xv); if (zv) gf3Set(out, 25 + b, zv)
    }
    for (let q = 0; q < 552; q++) {
      const xv = gf3Get(r, q), zv = gf3Get(r, 577 + q)
      if (xv) gf3Set(out, 50 + q, xv); if (zv) gf3Set(out, 50 + 552 + q, zv)
    }
    return out
  })
  const rrB1 = gf3Rref(reord, 2 * 577).basis
  const w553 = (2 * 553 + 31) >>> 5
  const stBHRows: GF3Row[] = [0, 25, ...Array.from({ length: 24 }, (_, i) => 26 + i), ...Array.from({ length: 527 }, (_, i) => 50 + i)].map(idx => {
    const src = rrB1[idx]!, out = gf3RowZero(w553)
    for (let q = 0; q < 552; q++) {
      const xv = gf3Get(src, 50 + q), zv = gf3Get(src, 50 + 552 + q)
      if (xv) gf3Set(out, q, xv); if (zv) gf3Set(out, 553 + q, zv)
    }
    if (gf3Get(src, 0)) gf3Set(out, 552, gf3Get(src, 0))
    if (gf3Get(src, 25)) gf3Set(out, 553 + 552, gf3Get(src, 25))
    return out
  })
  const stBH = gf3Rref(stBHRows, 2 * 553).basis
  assertExact(stBH.length === 553, 'stBH rank 553')

  // Exact origin logical support test on ANY boundary subset A (returns supported (p, q) pairs in F_3^2!)
  // Column layout: [0..Ac.length-1] = X(A^c), [Ac.length..2*Ac.length-1] = Z(A^c),
  //                [2*Ac.length] = X(b_0), [2*Ac.length+1] = Z(b_0).
  // Because ALL 2*|A^c| columns of A^c precede the 2 columns of b_0, a row in RREF has pivot >= 2*|A^c|
  // IFF it vanishes identically on ALL of A^c (both X and Z!), i.e. it is strictly supported on A U {b_0}!
  const supportedOriginLogicals = (A: readonly number[]): [number, number][] => {
    const inA = new Uint8Array(552)
    for (const q of A) inA[q] = 1
    const Ac: number[] = []
    for (let q = 0; q < 552; q++) if (!inA[q]) Ac.push(q)
    const nAc = Ac.length
    const nCols = 2 * nAc + 2
    const words = (nCols + 31) >>> 5
    const sub = stBH.map(r => {
      const out = gf3RowZero(words)
      for (let j = 0; j < nAc; j++) {
        const q = Ac[j]!, xv = gf3Get(r, q), zv = gf3Get(r, 553 + q)
        if (xv) gf3Set(out, j, xv); if (zv) gf3Set(out, nAc + j, zv)
      }
      const bx = gf3Get(r, 552), bz = gf3Get(r, 553 + 552)
      if (bx) gf3Set(out, 2 * nAc, bx); if (bz) gf3Set(out, 2 * nAc + 1, bz)
      return out
    })
    const { basis, pivCols } = gf3Rref(sub, nCols)
    const found: [number, number][] = []
    for (let r = 0; r < basis.length; r++) {
      if (pivCols[r]! >= 2 * nAc) {
        found.push([gf3Get(basis[r]!, 2 * nAc), gf3Get(basis[r]!, 2 * nAc + 1)])
      }
    }
    return found
  }

  // Build exact eigenprojectors of any single-qutrit Pauli X^p Z^q
  const pauliProjectors = (p: number, q: number): CMat[] => {
    const U = cmatZero(3)
    for (let x = 0; x < 3; x++) {
      const dst = (x + p) % 3, w = W_POW[(q * x) % 3]!
      U.re[dst * 3 + x] = w[0]; U.im[dst * 3 + x] = w[1]
    }
    const U2 = cmatMul(U, U)
    // Eigenvalues of X^p Z^q: if p!=0 && q!=0, (X^p Z^q)^3 = I (in odd dim 3!), wait: check (X Z)^3 |x> = w^{x + (x+1) + (x+2)} |x> = w^{3x+3} |x> = |x>!
    return [0, 1, 2].map(m => {
      const P = cmatZero(3), wm1 = W_POW[(3 - m) % 3]!, wm2 = W_POW[(6 - 2 * m) % 3]!
      for (let i = 0; i < 3; i++) P.re[i * 3 + i] = 1 / 3
      for (let k = 0; k < 9; k++) {
        P.re[k] = P.re[k]! + (wm1[0] * U.re[k]! - wm1[1] * U.im[k]! + wm2[0] * U2.re[k]! - wm2[1] * U2.im[k]!) / 3
        P.im[k] = P.im[k]! + (wm1[0] * U.im[k]! + wm1[1] * U.re[k]! + wm2[0] * U2.im[k]! + wm2[1] * U2.re[k]!) / 3
      }
      return P
    })
  }

  // Exact SLD QFI on channel output E_A(e^{-i theta H} |psi><psi| e^{i theta H}) at theta = 0:
  // drho = -i [H, rho_0] passed through linear channel E_A!
  const evalChannelQfi = (supported: readonly [number, number][], H: CMat, psiRe: readonly number[], psiIm: readonly number[]): number => {
    const rho0 = cmatZero(3)
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
      rho0.re[i * 3 + j] = psiRe[i]! * psiRe[j]! + psiIm[i]! * psiIm[j]!
      rho0.im[i * 3 + j] = psiIm[i]! * psiRe[j]! - psiRe[i]! * psiIm[j]!
    }
    const Hrho = cmatMul(H, rho0), rhoH = cmatMul(rho0, H)
    const drho0 = cmatZero(3)
    for (let k = 0; k < 9; k++) {
      // -i (H rho - rho H) = (Im, -Re)
      drho0.re[k] = Hrho.im[k]! - rhoH.im[k]!
      drho0.im[k] = -(Hrho.re[k]! - rhoH.re[k]!)
    }
    if (supported.length === 0) return 0
    if (supported.length === 2) return exactSldQfi(rho0, drho0)
    // dim = 1: exact complete dephasing in eigenbasis of unique supported Pauli O_L = X^p Z^q!
    const [p, q] = supported[0]!
    const projs = pauliProjectors(p, q)
    const dephase = (M: CMat): CMat => {
      const out = cmatZero(3)
      for (const P of projs) {
        const PM = cmatMul(P, cmatMul(M, P))
        for (let k = 0; k < 9; k++) { out.re[k] = out.re[k]! + PM.re[k]!; out.im[k] = out.im[k]! + PM.im[k]! }
      }
      return out
    }
    return exactSldQfi(dephase(rho0), dephase(drho0))
  }

  // Direct full-Hilbert-space cross-check of stabilizer QFI channel theorem on the exact 3-qutrit code
  // S = <X_0 X_1^2, Z_0 Z_1 Z_2> (dim = 27), logical Z_L = Z_0 Z_1, X_L = X_0 X_2^2:
  //   - A = {0}       (1 qutrit):  dim L_A = 0 -> full trace-out gives I/3 -> QFI(N_Z)=0, QFI(N_X)=0
  //   - A = {0, 1}    (2 qutrits): dim L_A = 1 (ONLY Z_L = Z_0 Z_1!) -> QFI(N_Z)=0, QFI(N_X)=8/3
  //   - A = {0, 1, 2} (3 qutrits): dim L_A = 2 (both Z_L, X_L) -> QFI(N_Z)=8/3, QFI(N_X)=8/3
  const crossCheck3QutritQfi = (): number => {
    // |a_L> = (1/sqrt(3)) sum_{t=0}^2 |t, (a - t) mod 3, (-a) mod 3>
    const code27: number[][] = [0, 1, 2].map(a =>
      [0, 1, 2].map(t => {
        const x0 = t, x1 = mod3(a - t), x2 = mod3(-a)
        return x0 * 9 + x1 * 3 + x2
      }),
    )
    const testFull = (keepMask: number, H: CMat, pRe: readonly number[], pIm: readonly number[]): number => {
      // Pure 27-dim state |Psi(0)> and |dPsi> = -i H_L |Psi(0)>
      const sRe = new Float64Array(27), sIm = new Float64Array(27)
      const dRe = new Float64Array(27), dIm = new Float64Array(27)
      for (let a = 0; a < 3; a++) {
        // (dPsi)_a = -i sum_b H_{ab} psi_b
        let hpr = 0, hpi = 0
        for (let b = 0; b < 3; b++) {
          hpr += H.re[a * 3 + b]! * pRe[b]! - H.im[a * 3 + b]! * pIm[b]!
          hpi += H.re[a * 3 + b]! * pIm[b]! + H.im[a * 3 + b]! * pRe[b]!
        }
        const dpR = hpi, dpI = -hpr
        for (const idx of code27[a]!) {
          sRe[idx] = pRe[a]! / SQRT3; sIm[idx] = pIm[a]! / SQRT3
          dRe[idx] = dpR / SQRT3; dIm[idx] = dpI / SQRT3
        }
      }
      const keepQ = [0, 1, 2].filter(q => (keepMask >> q) & 1)
      const dimA = Math.pow(3, keepQ.length)
      const rhoA = cmatZero(dimA), drhoA = cmatZero(dimA)
      const splitIdx = (idx: number) => {
        const digs = [Math.floor(idx / 9), Math.floor(idx / 3) % 3, idx % 3]
        let iA = 0, iE = 0
        for (let q = 0; q < 3; q++) {
          if ((keepMask >> q) & 1) iA = iA * 3 + digs[q]!
          else iE = iE * 3 + digs[q]!
        }
        return [iA, iE] as const
      }
      for (let i = 0; i < 27; i++) {
        const [a1, e1] = splitIdx(i)
        for (let j = 0; j < 27; j++) {
          const [a2, e2] = splitIdx(j)
          if (e1 !== e2) continue
          rhoA.re[a1 * dimA + a2] = rhoA.re[a1 * dimA + a2]! + (sRe[i]! * sRe[j]! + sIm[i]! * sIm[j]!)
          rhoA.im[a1 * dimA + a2] = rhoA.im[a1 * dimA + a2]! + (sIm[i]! * sRe[j]! - sRe[i]! * sIm[j]!)
          drhoA.re[a1 * dimA + a2] = drhoA.re[a1 * dimA + a2]! + (dRe[i]! * sRe[j]! + dIm[i]! * sIm[j]! + sRe[i]! * dRe[j]! + sIm[i]! * dIm[j]!)
          drhoA.im[a1 * dimA + a2] = drhoA.im[a1 * dimA + a2]! + (dIm[i]! * sRe[j]! - dRe[i]! * sIm[j]! + sIm[i]! * dRe[j]! - sRe[i]! * dIm[j]!)
        }
      }
      return exactSldQfi(rhoA, drhoA)
    }
    // Interior optimal probes achieving exact maximum qutrit QFI = 4 Var(N) = 4.000000 with strictly positive
    // complementary-basis populations (2/3, 1/6, 1/6) (avoiding the rank-1 simplex boundary 0/0 singularity!):
    //   psiNZ = (0, 1/sqrt(2), 1/sqrt(2))             -> X-basis = (2/sqrt(6), -1/sqrt(6), -1/sqrt(6))
    //   psiNX = (2/sqrt(6), -1/sqrt(6), -1/sqrt(6))   -> Z-basis = (2/sqrt(6), -1/sqrt(6), -1/sqrt(6))
    const psiNZ = [0, Math.SQRT1_2, Math.SQRT1_2]
    const psiNX = [2 / Math.sqrt(6), -1 / Math.sqrt(6), -1 / Math.sqrt(6)]
    const z0 = [0, 0, 0]
    let maxErr = 0
    maxErr = Math.max(maxErr, Math.abs(testFull(0b001, NZ, psiNZ, z0) - evalChannelQfi([], NZ, psiNZ, z0)))
    maxErr = Math.max(maxErr, Math.abs(testFull(0b001, NX, psiNX, z0) - evalChannelQfi([], NX, psiNX, z0)))
    maxErr = Math.max(maxErr, Math.abs(testFull(0b011, NZ, psiNZ, z0) - evalChannelQfi([[0, 1]], NZ, psiNZ, z0)))
    maxErr = Math.max(maxErr, Math.abs(testFull(0b011, NX, psiNX, z0) - evalChannelQfi([[0, 1]], NX, psiNX, z0)))
    maxErr = Math.max(maxErr, Math.abs(testFull(0b111, NZ, psiNZ, z0) - evalChannelQfi([[1, 0], [0, 1]], NZ, psiNZ, z0)))
    maxErr = Math.max(maxErr, Math.abs(testFull(0b111, NX, psiNX, z0) - evalChannelQfi([[1, 0], [0, 1]], NX, psiNX, z0)))
    assertExact(Math.abs(testFull(0b011, NX, psiNX, z0) - 4) < 1e-12, '3-qutrit classical-sector QFI(N_X) = 4')
    assertExact(testFull(0b011, NZ, psiNZ, z0) < 1e-12, '3-qutrit classical-sector QFI(N_Z) = 0')
    return maxErr
  }
  const qfiChannelCrossErr = crossCheck3QutritQfi()

  // --- 2A. Exact Geometric Individuation Classification (Exclusive / Nested / Overlapping) ---
  const bulkMI = (A: readonly number[], bIdx: number): number => {
    const sA = stabEntropy(cB1Bulk.basis, 577, A)
    const sAb = stabEntropy(cB1Bulk.basis, 577, [...A, 552 + bIdx])
    return 1 + sA - sAb
  }
  let exclViolations = 0
  for (let k = 1; k <= 12; k++) {
    const i1 = bulkMI(conesUnion(Array.from({ length: k }, (_, i) => i)), 0)
    const i2 = bulkMI(conesUnion(Array.from({ length: k }, (_, i) => 12 + i)), 0)
    if (i1 + i2 > 2) exclViolations++
  }
  const ssA = bulkMI(conesUnion([0, 1, 2, 3, 4, 5]), 0)
  const ssB = bulkMI(conesUnion([6, 7, 8, 9, 10, 11]), 0)
  const ssC = bulkMI(conesUnion([12, 13, 14, 15, 16, 17]), 0)
  const ssABC = bulkMI(conesUnion(Array.from({ length: 18 }, (_, i) => i)), 0)
  const nestSubB1 = bulkMI(conesUnion([0]), 1), nestSubB0 = bulkMI(conesUnion([0]), 0)
  const nestSupB1 = bulkMI(conesUnion(Array.from({ length: 17 }, (_, i) => i)), 1)
  const nestSupB0 = bulkMI(conesUnion(Array.from({ length: 17 }, (_, i) => i)), 0)
  const ovA1 = conesUnion(Array.from({ length: 17 }, (_, i) => i))
  const ovA2 = conesUnion(Array.from({ length: 17 }, (_, i) => 7 + i))
  const ovB0_1 = bulkMI(ovA1, 0), ovB0_2 = bulkMI(ovA2, 0)
  const ovB1_1 = bulkMI(ovA1, 1), ovB1_2 = bulkMI(ovA2, 1)
  const ovB24_1 = bulkMI(ovA1, 24), ovB24_2 = bulkMI(ovA2, 24)

  console.log(`  [2A] Geometric Individuation Classification on B_1 = [[552, 25, 40]]_3:`)
  console.log(`       Exclusive: 0/12 disjoint pairs violate I(b0:A1)+I(b0:A2)<=2 (viols=${exclViolations}); ((3,4)) 6-cone split I=[${ssA},${ssB},${ssC}] -> I(AUBUC)=${ssABC} ln 3`)
  console.log(`       Nested:    A_sub(k=1) captures UV b_1 (${nestSubB1}/2) not IR b_0 (${nestSubB0}/2); A_sup(k=17) captures BOTH b_1 (${nestSupB1}/2) & b_0 (${nestSupB0}/2)`)
  console.log(`       Overlapping: A_1=[0..16] & A_2=[7..23] BOTH capture b_0 (${ovB0_1}/${ovB0_2}), split UV b_1 (${ovB1_1}/${ovB1_2}) & b_24 (${ovB24_1}/${ovB24_2})`)

  // --- 2B. Exact QFI Step Horizons across k = 1..24 cones (BOTH Z-cone and X-cone orderings!) ---
  const psiNZ = [0, Math.SQRT1_2, Math.SQRT1_2]
  const psiNX = [2 / Math.sqrt(6), -1 / Math.sqrt(6), -1 / Math.sqrt(6)]
  const z0 = [0, 0, 0]
  const zOrder = Array.from({ length: 24 }, (_, i) => i)
  // Build deterministic X-dual cone ordering via exact Cleaning Lemma:
  // xLead = [0,1,4,5,17,19,21,23] is a weight-8 X_L support. Find a disjoint weight-8 X_L support xTail
  // from the X-coset xL + span(X-stabilizers of [[24,1,8]]_3) so xOrder = [xLead (8), mid (8), xTail (8)]
  // is GUARANTEED to hold dim L_A = 1 (X_L only!) for ALL k = 8..16 and jump to dim = 2 at k = 17!
  const xLead = [0, 1, 4, 5, 17, 19, 21, 23]
  const xLeadSet = new Set<number>(xLead)
  const xStabRows = T.bulk23.filter(r => {
    for (let i = 0; i < 24; i++) if (r[24 + i] !== 0) return false
    return true
  })
  // Note: T.bulk23 has 1 + 8 = 9 pure-X rows (allX + 8 lvmDefs X-rows); also include w9Defs[0..5] X-parts via exact GF(3) search on stBH!
  // Faster & exact: pick any weight-8 subset of the 16 cones outside xLead directly from the pure-X + mixed stabilizers of [[24,1,8]]_3:
  // Actually, find xTail by checking minimal weight-8 X_L coset members in xL + span(bulk23) having ZERO Z-part AND disjoint from xLead!
  // On 24 legs, the pure-X subspace of T.bulk23 has dimension 9 (allX + 8 lvmX) -> only 3^9 = 19,683 coset elements (takes < 3 ms)!
  let xTail: number[] = []
  const nXS = xStabRows.length
  const totalCoset = Math.pow(3, nXS)
  for (let code = 0; code < totalCoset; code++) {
    let tmp = code, wt = 0, overlap = false
    const coeffs = new Uint8Array(nXS)
    for (let j = 0; j < nXS; j++) { coeffs[j] = tmp % 3; tmp = Math.floor(tmp / 3) }
    const supp: number[] = []
    for (let s = 0; s < 24; s++) {
      let v = T.xL[s]!
      for (let j = 0; j < nXS; j++) if (coeffs[j]) v = (v + coeffs[j]! * xStabRows[j]![s]!) % 3
      if (v !== 0) {
        if (xLeadSet.has(s)) { overlap = true; break }
        wt++; supp.push(s)
        if (wt > 8) break
      }
    }
    if (!overlap && wt === 8) { xTail = supp; break }
  }
  assertExact(xTail.length === 8, 'found disjoint weight-8 X_L support xTail')
  const xTailSet = new Set<number>(xTail)
  const xMid = zOrder.filter(c => !xLeadSet.has(c) && !xTailSet.has(c))
  const xOrder = [...xLead, ...xMid, ...xTail]

  type QfiRow = { k: number; dimZ: number; qZ_NZ: number; qZ_NX: number; dimX: number; qX_NZ: number; qX_NX: number }
  const qfiRows: QfiRow[] = []
  let supZAt8 = '', supXAt8 = ''
  for (let k = 1; k <= 24; k++) {
    const supZ = supportedOriginLogicals(conesUnion(zOrder.slice(0, k)))
    const supX = supportedOriginLogicals(conesUnion(xOrder.slice(0, k)))
    if (k === 8) {
      supZAt8 = supZ.map(([p, q]) => `X^${p}Z^${q}`).join(',')
      supXAt8 = supX.map(([p, q]) => `X^${p}Z^${q}`).join(',')
    }
    qfiRows.push({
      k,
      dimZ: supZ.length,
      qZ_NZ: evalChannelQfi(supZ, NZ, psiNZ, z0),
      qZ_NX: evalChannelQfi(supZ, NX, psiNX, z0),
      dimX: supX.length,
      qX_NZ: evalChannelQfi(supX, NZ, psiNZ, z0),
      qX_NX: evalChannelQfi(supX, NX, psiNX, z0),
    })
  }
  const qfiZeroAllLe7 = qfiRows.filter(r => r.k <= 7).every(r => r.dimZ === 0 && r.dimX === 0 && r.qZ_NZ < 1e-12 && r.qZ_NX < 1e-12 && r.qX_NZ < 1e-12 && r.qX_NX < 1e-12)
  const qfiSplitBand8to16 = qfiRows
    .filter(r => r.k >= 8 && r.k <= 16)
    .every(
      r =>
        r.dimZ === 1 &&
        r.qZ_NZ < 1e-12 &&
        Math.abs(r.qZ_NX - 4) < 1e-12 &&
        r.dimX === 1 &&
        Math.abs(r.qX_NZ - 4) < 1e-12 &&
        r.qX_NX < 1e-12,
    )
  const qfiSatGe17 = qfiRows
    .filter(r => r.k >= 17)
    .every(
      r =>
        r.dimZ === 2 &&
        r.dimX === 2 &&
        Math.abs(r.qZ_NZ - 4) < 1e-12 &&
        Math.abs(r.qZ_NX - 4) < 1e-12 &&
        Math.abs(r.qX_NZ - 4) < 1e-12 &&
        Math.abs(r.qX_NX - 4) < 1e-12,
    )

  const cnt0 = qfiRows.filter(r => r.k <= 7 && r.dimZ === 0 && r.dimX === 0).length
  const cntZ1 = qfiRows.filter(r => r.k >= 8 && r.k <= 16 && r.dimZ === 1 && r.qZ_NZ < 1e-12 && Math.abs(r.qZ_NX - 4) < 1e-12).length
  const cntX1 = qfiRows.filter(r => r.k >= 8 && r.k <= 16 && r.dimX === 1 && Math.abs(r.qX_NZ - 4) < 1e-12 && r.qX_NX < 1e-12).length
  const cnt2 = qfiRows.filter(r => r.k >= 17 && r.dimZ === 2 && r.dimX === 2 && Math.abs(r.qZ_NZ - 4) < 1e-12 && Math.abs(r.qX_NX - 4) < 1e-12).length
  console.log(`  [2B] Exact QFI Step Horizons on B_1 (full 27-dim 3-qutrit SLD cross-check err = ${qfiChannelCrossErr.toExponential(2)}):`)
  console.log(`       zOrder(k=8) supports [${supZAt8}] | xOrder(k=8) supports [${supXAt8}] | xOrder(1..16)=[${xOrder.slice(0, 16).join(',')}]`)
  console.log(`       k =  1.. 7: dim L_A = 0 -> QFI(N_Z) = 0.000000, QFI(N_X) = 0.000000 (${cnt0}/7 verified!)`)
  console.log(`       k =  8..16 (Z-cones, Z_L accessible): dim L_A = 1 -> QFI(N_Z) = 0.000000, QFI(N_X) = 4.000000 (${cntZ1}/9 verified!)`)
  console.log(`       k =  8..16 (X-cones, X_L accessible): dim L_A = 1 -> QFI(N_Z) = 4.000000, QFI(N_X) = 0.000000 (${cntX1}/9 verified!)`)
  console.log(`       k = 17..24 (full quantum EW capture): dim L_A = 2 -> QFI(N_Z) = 4.000000, QFI(N_X) = 4.000000 (${cnt2}/8 verified!)`)

  // --- 2C. Robustness of 0 -> 16 ln 3 RT Snap, Binomial Erasure Threshold & Depolarizing QFI at p = 0, 0.02, 0.05, 0.10, 0.20, 0.30 ---
  const comb = (n: number, k: number): number => {
    if (k < 0 || k > n) return 0
    let r = 1
    for (let i = 1; i <= Math.min(k, n - k); i++) r = (r * (n - i + 1)) / i
    return r
  }
  const binomCdf = (n: number, p: number, maxK: number): number => {
    let s = 0
    for (let k = 0; k <= maxK; k++) s += comb(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k)
    return s
  }
  // Exact qutrit (d=3) depolarizing SLD QFI formula check:
  // Convention: p = total single-qutrit Pauli error prob (8 non-identity Paulis at p/8 each) corresponds to
  // isotropic depolarizing parameter eps = (9/8) p in Lambda_eps(rho) = (1-eps) rho + eps (I/3)
  // (using eps = p is conservative by 8/9). Eigenvalues on |+>: lambda_0 = 1 - 2 eps/3, lambda_{1,2} = eps/3,
  // so lambda_0 + lambda_k = 1 - eps/3 and J_iso(eps)/J(0) = (1 - eps)^2 / (1 - eps/3).
  // Worst-case logical Pauli dephasing channel rho -> (1 - eps_log) rho + eps_log Z rho Z^dag gives
  // J_deph(eps_log)/J(0) >= max(0, 1 - 2 eps_log)^2 (exact for optimal phase probe |psi_NZ>!).
  const depolCheckErr = (() => {
    const eps = 0.17
    const rho0 = cmatZero(3), drho0 = cmatZero(3)
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
      rho0.re[i * 3 + j] = (1 - eps) * (1 / 3) + (i === j ? eps / 3 : 0)
    }
    const H0 = cmatZero(3); for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) H0.re[i * 3 + j] = 1 / 3
    const Hrho = cmatMul(NZ, H0), rhoH = cmatMul(H0, NZ)
    for (let k = 0; k < 9; k++) {
      drho0.re[k] = (1 - eps) * (Hrho.im[k]! - rhoH.im[k]!)
      drho0.im[k] = -(1 - eps) * (Hrho.re[k]! - rhoH.re[k]!)
    }
    const num = exactSldQfi(rho0, drho0)
    const exact = (8 / 3) * ((1 - eps) ** 2 / (1 - eps / 3))
    return Math.abs(num - exact)
  })()

  console.log(`  [2C] Local Boundary Erasure & Depolarization Robustness (p = 0, 0.02, 0.05, 0.10, 0.20, 0.30; SLD depol err=${depolCheckErr.toExponential(1)}):`)
  console.log(`       Convention: p = total Pauli error prob (iso depol eps = (9/8) p; also reporting worst-case Pauli dephasing (1 - 2 eps)^2)`)
  type NoiseRow = {
    p: number; mErase: number; rtSnapK11: number; rtSnapK3: number; iBulkOrig: number; pBinomRec: number
    qfiDepCode: number; qfiDepRaw: number; qfiDephCode: number; qfiDephRaw: number
  }
  const noiseRows: NoiseRow[] = []
  for (const p of [0, 0.02, 0.05, 0.10, 0.20, 0.30]) {
    const mErase = Math.round(23 * p) // 0, 0, 1, 2, 5, 7 legs erased per cone (deterministic stratum profile!)
    const keptOfCone = (a: number): number[] => Array.from({ length: 23 - mErase }, (_, j) => a * 23 + mErase + j)
    const keptCones = (as: readonly number[]): number[] => as.flatMap(keptOfCone)
    const evalRTMI = (k: number): number => {
      const A1 = keptCones(Array.from({ length: k }, (_, i) => i))
      const A2 = keptCones(Array.from({ length: k }, (_, i) => 12 + i))
      return stabEntropy(cB1Pure.basis, 552, A1) + stabEntropy(cB1Pure.basis, 552, A2) - stabEntropy(cB1Pure.basis, 552, [...A1, ...A2])
    }
    const rtSnapK3 = evalRTMI(3), rtSnapK11 = evalRTMI(11)
    const allKept = keptCones(zOrder)
    const iBulkOrig = 1 + stabEntropy(cB1Bulk.basis, 577, allKept) - stabEntropy(cB1Bulk.basis, 577, [...allKept, 552])
    // Exact i.i.d. heralded erasure QFI/J_max lower bound: each cone recovers iff <= 4 erasures (d_pure=6), origin iff <= 7 failed cones (d=8)!
    const qConeRec = binomCdf(23, p, 4)
    const pBinomRec = binomCdf(24, 1 - qConeRec, 7)
    // Unheralded 2-level Pauli decoding: each cone corrects <= 2 Pauli errors (d_cone >= 5), origin corrects <= 3 failed cones (d_0 = 8)
    const pConeFail = 1 - binomCdf(23, p, 2)
    const pLogFail = 1 - binomCdf(24, pConeFail, 3)
    const epsIsoCode = Math.min(1, (9 / 8) * pLogFail)
    const epsIsoRaw = Math.min(1, (9 / 8) * p)
    const qfiDepCode = ((1 - epsIsoCode) ** 2) / (1 - epsIsoCode / 3)
    const qfiDepRaw = ((1 - epsIsoRaw) ** 2) / (1 - epsIsoRaw / 3)
    const qfiDephCode = Math.max(0, 1 - 2 * pLogFail) ** 2
    const qfiDephRaw = Math.max(0, 1 - 2 * p) ** 2
    noiseRows.push({ p, mErase, rtSnapK11, rtSnapK3, iBulkOrig, pBinomRec, qfiDepCode, qfiDepRaw, qfiDephCode, qfiDephRaw })
    console.log(
      `       p=${p.toFixed(2)} (m=${mErase}/23): RT I(3:3)=${String(rtSnapK3).padStart(2)}, I(11:11)=${String(rtSnapK11).padStart(2)} ln 3 | I(b0:E^c)=${iBulkOrig}/2 | Erase=${pBinomRec.toFixed(6)} vs ${(1 - p).toFixed(2)} | IsoDep=${qfiDepCode.toFixed(6)} vs ${qfiDepRaw.toFixed(4)} | Deph=${qfiDephCode.toFixed(6)} vs ${qfiDephRaw.toFixed(4)}`,
    )
  }
  console.log('')

  recordCheck(
    'E2',
    'B_1 RT individuation, exact QFI step horizons (k<=7:0, 8..16:basis-split, >=17:4.0) & p=0..0.30 robustness',
    exclViolations === 0 &&
      ssA === 0 && ssB === 0 && ssC === 0 && ssABC === 2 &&
      nestSubB1 === 2 && nestSubB0 === 0 && nestSupB1 === 2 && nestSupB0 === 2 &&
      ovB0_1 === 2 && ovB0_2 === 2 && ovB1_1 === 2 && ovB1_2 === 0 && ovB24_1 === 0 && ovB24_2 === 2 &&
      qfiChannelCrossErr < 1e-13 &&
      depolCheckErr < 1e-14 &&
      qfiZeroAllLe7 &&
      qfiSplitBand8to16 &&
      qfiSatGe17 &&
      noiseRows[0]!.rtSnapK11 === 16 &&
      noiseRows[2]!.rtSnapK11 === 16 &&
      noiseRows[3]!.rtSnapK11 === 16 &&
      noiseRows[2]!.pBinomRec > 0.99999 &&
      noiseRows[3]!.pBinomRec > 0.999 &&
      noiseRows[5]!.pBinomRec < 1e-6 &&
      noiseRows[1]!.qfiDepCode > noiseRows[1]!.qfiDepRaw &&
      noiseRows[1]!.qfiDephCode > noiseRows[1]!.qfiDephRaw &&
      noiseRows[2]!.qfiDepCode < noiseRows[2]!.qfiDepRaw &&
      noiseRows[2]!.qfiDephCode < noiseRows[2]!.qfiDephRaw &&
      noiseRows[3]!.pBinomRec > 1 - noiseRows[3]!.p,
    `QFI steps exact k<=7/8..16/>=17 (3-qutrit SLD err=${qfiChannelCrossErr.toExponential(1)}, depol err=${depolCheckErr.toExponential(1)}); RT 16 ln 3 survives p=0..0.10 (erase P_rec>0.9997) & collapses by p=0.30`,
  )

  return { stBH, cB1Bulk, coneLegs, conesUnion }
}

// =================================================================================================
// EXPERIMENT 3: MARKOVIAN PRESENT-STATE MEMORY DEPTH tau_eff(rho_{A, t}) & MALLAVARAPU-PERCY SWAP TEST
// =================================================================================================

function runExperiment3(b1Ctx: ReturnType<typeof runExperiment2>) {
  console.log('==============================================================================================')
  console.log('EXPERIMENT 3: MARKOVIAN PRESENT-STATE MEMORY DEPTH tau_eff(rho_{A,t}) & MALLAVARAPU-PERCY SWAP')
  console.log('==============================================================================================')

  const T_MAX = 32

  // --- 3A. Exact 1-Body Ballistic Geodesic Propagator on infinite {3,4,3,4} (for k=1 & k=4 Dyson-Volterra) ---
  const half = T_MAX + 2, len = 2 * half + 1
  const gDRe = new Float64Array(T_MAX + 1), gDIm = new Float64Array(T_MAX + 1)
  const gORe = new Float64Array(T_MAX + 1), gOIm = new Float64Array(T_MAX + 1)
  const k1SurvB0 = new Float64Array(T_MAX + 1), k1SurvB1 = new Float64Array(T_MAX + 1)
  {
    let r0 = new Float64Array(len), i0 = new Float64Array(len), r1 = new Float64Array(len), i1 = new Float64Array(len)
    r0[half] = 1; gDRe[0] = 1; k1SurvB0[0] = 1; k1SurvB1[0] = 1
    for (let t = 1; t <= T_MAX; t++) {
      const nr0 = new Float64Array(len), ni0 = new Float64Array(len), nr1 = new Float64Array(len), ni1 = new Float64Array(len)
      for (let x = half - t + 1; x <= half + t - 1; x++) {
        const a0r = r0[x]!, a0i = i0[x]!, a1r = r1[x]!, a1i = i1[x]!
        if (a0r === 0 && a0i === 0 && a1r === 0 && a1i === 0) continue
        const o0r = C_KEEP[0] * a0r - C_KEEP[1] * a0i + C_CROSS[0] * a1r - C_CROSS[1] * a1i
        const o0i = C_KEEP[0] * a0i + C_KEEP[1] * a0r + C_CROSS[0] * a1i + C_CROSS[1] * a1r
        const o1r = C_CROSS[0] * a0r - C_CROSS[1] * a0i + C_KEEP[0] * a1r - C_KEEP[1] * a1i
        const o1i = C_CROSS[0] * a0i + C_CROSS[1] * a0r + C_KEEP[0] * a1i + C_KEEP[1] * a1r
        nr0[x + 1] = nr0[x + 1]! + o0r; ni0[x + 1] = ni0[x + 1]! + o0i
        nr1[x - 1] = nr1[x - 1]! + o1r; ni1[x - 1] = ni1[x - 1]! + o1i
      }
      r0 = nr0; i0 = ni0; r1 = nr1; i1 = ni1
      gDRe[t] = r0[half]!; gDIm[t] = i0[half]!; gORe[t] = r1[half]!; gOIm[t] = i1[half]!
      k1SurvB0[t] = r0[half]! ** 2 + i0[half]! ** 2 + r1[half]! ** 2 + i1[half]! ** 2
      let p1 = 0
      for (const dx of [-1, 0, 1]) p1 += r0[half + dx]! ** 2 + i0[half + dx]! ** 2 + r1[half + dx]! ** 2 + i1[half + dx]! ** 2
      k1SurvB1[t] = p1
    }
  }

  // Exact Holevo mutual information I(u_{t-Delta} : rho_{A, t}) for ternary input u in {0, 1, 2} on 3 orthogonal geodesic lines:
  // Since the 3 lines are strictly decoupled under 1-body bare U, the 3 occupied states inside A remain mutually orthogonal with survival p_A(Delta),
  // so exact rho_{A, Delta}^{(u)} = (1 - p_A) |vac><vac| + p_A |phi_u><phi_u| => exact Holevo chi(Delta) = p_A(Delta) * ln 3!
  const holevoFromSurv = (p: number, mAlph: number): number => p * Math.log(mAlph)
  const k1HolevoB0 = Array.from(k1SurvB0, p => holevoFromSurv(p, 3))
  const k1HolevoB1 = Array.from(k1SurvB1, p => holevoFromSurv(p, 3))

  // --- 3B. Exact 16x16 Infinite-Volume Chiral Phi_odd 4-Line Cluster (W9 C4 [0,1,2,8] 207.6x & C2 Q=0_V [0,1,6,10]) ---
  const Z6_POW: readonly C[] = [[1, 0], Z6_C, W_C, [-1, 0], [-Z6_C[0], -Z6_C[1]], [-W_C[0], -W_C[1]]]
  const c4 = cmatZero(16), c4Dag = cmatZero(16), c1: C[][] = [[C_KEEP, C_CROSS], [C_CROSS, C_KEEP]]
  for (let r = 0; r < 16; r++) for (let c = 0; c < 16; c++) {
    let amp: C = [1, 0]
    for (let j = 0; j < 4; j++) amp = cMul(amp, c1[(r >> j) & 1]![(c >> j) & 1]!)
    c4.re[r * 16 + c] = amp[0]; c4.im[r * 16 + c] = amp[1]
    c4Dag.re[c * 16 + r] = amp[0]; c4Dag.im[c * 16 + r] = -amp[1]
  }
  const G4t: CMat[] = []
  for (let t = 0; t <= T_MAX; t++) {
    const M = cmatZero(16), d: C = [gDRe[t]!, gDIm[t]!], o: C = [gORe[t]!, gOIm[t]!]
    if (cAbs(d) > 1e-16 || cAbs(o) > 1e-16) {
      for (let r = 0; r < 16; r++) for (let c = 0; c < 16; c++) {
        let amp: C = [1, 0]
        for (let j = 0; j < 4; j++) amp = cMul(amp, ((r >> j) & 1) === ((c >> j) & 1) ? d : o)
        M.re[r * 16 + c] = amp[0]; M.im[r * 16 + c] = amp[1]
      }
    }
    G4t.push(M)
  }

  const runChiralMemory = (lines4: readonly [number, number, number, number], tones4: readonly [ToneNZ, ToneNZ, ToneNZ, ToneNZ]) => {
    const phi = cmatZero(16), chis = new Int32Array(16)
    for (let mask = 0; mask < 16; mask++) {
      const codes = [0, 1, 2, 3].map(j => (LINES[lines4[j]!]![(mask >> j) & 1]! << 1) + (tones4[j]! < 0 ? 1 : 0))
      const ch = chiral4Sign(codes[0]!, codes[1]!, codes[2]!, codes[3]!)
      chis[mask] = ch
      const m6 = ((ch % 6) + 6) % 6
      phi.re[mask * 16 + mask] = Z6_POW[m6]![0]; phi.im[mask * 16 + mask] = Z6_POW[m6]![1]
    }
    const M = cmatMul(c4Dag, cmatMul(phi, cmatMul(c4, phi)))
    const V = cmatZero(16)
    for (let k = 0; k < 256; k++) { V.re[k] = M.re[k]!; V.im[k] = M.im[k]! }
    for (let i = 0; i < 16; i++) V.re[i * 16 + i] = V.re[i * 16 + i]! - 1
    const Ft: CMat[] = [cmatEye(16)]
    for (let t = 1; t <= T_MAX; t++) {
      const cur = cmatMul(G4t[t]!, M)
      for (let tau = 1; tau < t; tau++) {
        const term = cmatMul(G4t[t - tau]!, cmatMul(V, Ft[tau]!))
        for (let k = 0; k < 256; k++) { cur.re[k] = cur.re[k]! + term.re[k]!; cur.im[k] = cur.im[k]! + term.im[k]! }
      }
      Ft.push(cur)
    }
    // Binary input u in {0, 1} encoded in two orthogonal chiral states (first chi>0 mask vs first chi<0 mask!)
    const u0 = Array.from(chis).findIndex(x => x > 0)
    const u1 = Array.from(chis).findIndex(x => x < 0)
    assertExact(u0 >= 0 && u1 >= 0, 'found chi>0 and chi<0 basis inputs')
    // Exact 17x17 reduced density matrix rho_{0, Delta}^{(u)} = (1 - ||v||^2)|vac><vac| + |v><v| (rank <= 2!)
    // Exact Holevo mutual information of two rank-2 density matrices computed directly via exact 3x3 Gram matrix (or 17x17 Jacobi):
    const holevoPair = (prop: readonly CMat[], t: number): { chi: number; p0: number; p1: number } => {
      const P = prop[t]!
      let n0 = 0, n1 = 0, ovR = 0, ovI = 0
      for (let r = 0; r < 16; r++) {
        const r0 = P.re[r * 16 + u0]!, i0 = P.im[r * 16 + u0]!, r1 = P.re[r * 16 + u1]!, i1 = P.im[r * 16 + u1]!
        n0 += r0 * r0 + i0 * i0; n1 += r1 * r1 + i1 * i1
        ovR += r0 * r1 + i0 * i1; ovI += r0 * i1 - i0 * r1
      }
      // Build exact 3x3 representations in orthonormal basis {|vac>, |e0>, |e1>}!
      const hEnt = (p: number) => (p <= 1e-15 || p >= 1 - 1e-15 ? 0 : -p * Math.log(p) - (1 - p) * Math.log(1 - p))
      const sAvgInd = 0.5 * (hEnt(n0) + hEnt(n1))
      // Average state rho_bar has eigenvalue (1 - (n0+n1)/2) on |vac> and 2x2 occupied block (1/2)(|v0><v0| + |v1><v1|)
      // whose eigenvalues are the eigenvalues of the 2x2 Gram matrix (1/2) [[n0, <v0|v1>], [<v1|v0>, n1]]!
      const pVac = Math.max(0, 1 - 0.5 * (n0 + n1))
      const tr = 0.5 * (n0 + n1), det = 0.25 * Math.max(0, n0 * n1 - (ovR * ovR + ovI * ovI))
      const disc = Math.sqrt(Math.max(0, tr * tr - 4 * det))
      const l1 = 0.5 * (tr + disc), l2 = Math.max(0, 0.5 * (tr - disc))
      let sBar = 0
      for (const l of [pVac, l1, l2]) if (l > 1e-15) sBar -= l * Math.log(l)
      return { chi: Math.max(0, sBar - sAvgInd), p0: n0, p1: n1 }
    }
    const onCurve: number[] = [], offCurve: number[] = [], onSurv: number[] = [], offSurv: number[] = []
    for (let t = 0; t <= T_MAX; t++) {
      const a = holevoPair(Ft, t), b = holevoPair(G4t, t)
      onCurve.push(a.chi); offCurve.push(b.chi); onSurv.push(a.p0); offSurv.push(b.p0)
    }
    return { onCurve, offCurve, onSurv, offSurv, boost16Surv: onSurv[16]! / offSurv[16]!, boost16Holevo: onCurve[16]! / offCurve[16]! }
  }

  const c4Mem = runChiralMemory([0, 1, 2, 8], [1, 1, 1, 1])
  const c2Mem = runChiralMemory([0, 1, 6, 10], [1, 1, -1, -1])

  // --- 3B2. Exact k = 3 Sym^3 Trion Bloch Band E_trion(P): Comoving Relative Binding vs Fixed-B_1 Wavepacket Dispersion! ---
  // Build exact open-relative-separation 3-body Sym^3 Bloch unitary U(P) on d1 + d2 <= R_REL = 7 (196 relative states; (1/7)^7 = 1.2e-6):
  // Canonical basis: {(0, s0), (d1, s1), (d1+d2, s2)} sorted by (m, s), d1 >= 0, d2 >= 0, d1 + d2 in [1, R_REL].
  const R_REL = 6 // 144 states; (1/7)^6 = 8.5e-6 -> exact to 5+ digits in < 120 ms!
  type Rel3 = readonly [number, number, number, number, number] // [d1, d2, s0, s1, s2]
  const rel3List: Rel3[] = []
  const rel3Key = (d1: number, d2: number, s0: number, s1: number, s2: number) => `${d1}:${d2}:${s0}:${s1}:${s2}`
  const rel3Map = new Map<string, number>()
  for (let d1 = 0; d1 <= R_REL; d1++) {
    for (let d2 = 0; d2 <= R_REL - d1; d2++) {
      if (d1 + d2 === 0) continue
      for (let s0 = 0; s0 < 2; s0++) {
        for (let s1 = 0; s1 < 2; s1++) {
          if (d1 === 0 && s0 >= s1) continue
          for (let s2 = 0; s2 < 2; s2++) {
            if (d2 === 0 && s1 >= s2) continue
            rel3Map.set(rel3Key(d1, d2, s0, s1, s2), rel3List.length)
            rel3List.push([d1, d2, s0, s1, s2])
          }
        }
      }
    }
  }
  const nRel3 = rel3List.length
  // Precompute shift-indexed sparse transitions of U_Sym3 on relative basis: each entry (row, col, shift, ampR, ampI)
  type Rel3Trans = { readonly row: number; readonly col: number; readonly shift: number; readonly re: number; readonly im: number }
  const rel3Trans: Rel3Trans[] = []
  {
    const cMat1: C[][] = [[C_KEEP, C_CROSS], [C_CROSS, C_KEEP]]
    for (let col = 0; col < nRel3; col++) {
      const [d1, d2, s0, s1, s2] = rel3List[col]!
      const pts: readonly [number, number][] = [[0, s0], [d1, s1], [d1 + d2, s2]]
      const byM = new Map<number, number[]>()
      for (let i = 0; i < 3; i++) { const m = pts[i]![0], l = byM.get(m); if (l) l.push(i); else byM.set(m, [i]) }
      let br: { pts: [number, number][]; amp: C }[] = [{ pts: [], amp: [1, 0] }]
      for (const [m, idxs] of byM) {
        if (idxs.length === 2) br = br.map(b => ({ pts: [...b.pts, [m, 0], [m, 1]], amp: cMul(b.amp, W2_C) }))
        else {
          const sIn = pts[idxs[0]!]![1], nb: { pts: [number, number][]; amp: C }[] = []
          for (const b of br) {
            nb.push({ pts: [...b.pts, [m, 0]], amp: cMul(b.amp, cMat1[0]![sIn]!) })
            nb.push({ pts: [...b.pts, [m, 1]], amp: cMul(b.amp, cMat1[1]![sIn]!) })
          }
          br = nb
        }
      }
      for (const b of br) {
        const moved: [number, number][] = b.pts.map(([m, s]) => [s === 0 ? m : m - 1, s])
        moved.sort((a, b2) => a[0] - b2[0] || a[1] - b2[1])
        const sh = moved[0]![0]
        const nd1 = moved[1]![0] - sh, nd2 = moved[2]![0] - moved[1]![0]
        if (nd1 + nd2 > R_REL) continue
        const row = rel3Map.get(rel3Key(nd1, nd2, moved[0]![1], moved[1]![1], moved[2]![1]))!
        rel3Trans.push({ row, col, shift: sh, re: b.amp[0], im: b.amp[1] })
      }
    }
  }
  const buildRel3U = (P: number): CMat => {
    const U = cmatZero(nRel3)
    const phCache = new Map<number, C>([[-1, cExpI(P)], [0, [1, 0]], [1, cExpI(-P)]])
    for (const tr of rel3Trans) {
      const ph = phCache.get(tr.shift) ?? cExpI(-P * tr.shift)
      const re = tr.re * ph[0] - tr.im * ph[1], im = tr.re * ph[1] + tr.im * ph[0]
      U.re[tr.row * nRel3 + tr.col] = U.re[tr.row * nRel3 + tr.col]! + re
      U.im[tr.row * nRel3 + tr.col] = U.im[tr.row * nRel3 + tr.col]! + im
    }
    return U
  }
  const refineBlochEigen = (U: CMat, seedLam: C, seedRe: Float64Array, seedIm: Float64Array, iters: number) => {
    const n = U.n
    const vr = Float64Array.from(seedRe), vi = Float64Array.from(seedIm)
    let lam: C = seedLam
    const ar = new Float64Array(n * n), ai = new Float64Array(n * n)
    const xr = new Float64Array(n), xi = new Float64Array(n)
    for (let it = 0; it < iters; it++) {
      ar.set(U.re); ai.set(U.im); xr.set(vr); xi.set(vi)
      const sh: C = cScale(it === 0 ? 1.0005 : 1 + 1e-9, lam)
      for (let i = 0; i < n; i++) { ar[i * n + i] = ar[i * n + i]! - sh[0]; ai[i * n + i] = ai[i * n + i]! - sh[1] }
      for (let c = 0; c < n; c++) {
        let piv = c, best = Math.hypot(ar[c * n + c]!, ai[c * n + c]!)
        for (let r = c + 1; r < n; r++) { const v = Math.hypot(ar[r * n + c]!, ai[r * n + c]!); if (v > best) { best = v; piv = r } }
        if (piv !== c) {
          for (let j = c; j < n; j++) {
            let t = ar[c * n + j]!; ar[c * n + j] = ar[piv * n + j]!; ar[piv * n + j] = t
            t = ai[c * n + j]!; ai[c * n + j] = ai[piv * n + j]!; ai[piv * n + j] = t
          }
          let tb = xr[c]!; xr[c] = xr[piv]!; xr[piv] = tb; tb = xi[c]!; xi[c] = xi[piv]!; xi[piv] = tb
        }
        const pr = ar[c * n + c]!, pi = ai[c * n + c]!, d = pr * pr + pi * pi
        for (let r = c + 1; r < n; r++) {
          const fr0 = ar[r * n + c]!, fi0 = ai[r * n + c]!
          if (fr0 === 0 && fi0 === 0) continue
          const fr = (fr0 * pr + fi0 * pi) / d, fi = (fi0 * pr - fr0 * pi) / d
          for (let j = c + 1; j < n; j++) {
            ar[r * n + j] = ar[r * n + j]! - (fr * ar[c * n + j]! - fi * ai[c * n + j]!)
            ai[r * n + j] = ai[r * n + j]! - (fr * ai[c * n + j]! + fi * ar[c * n + j]!)
          }
          xr[r] = xr[r]! - (fr * xr[c]! - fi * xi[c]!); xi[r] = xi[r]! - (fr * xi[c]! + fi * xr[c]!)
        }
      }
      for (let r = n - 1; r >= 0; r--) {
        let sr = xr[r]!, si = xi[r]!
        for (let j = r + 1; j < n; j++) { sr -= ar[r * n + j]! * xr[j]! - ai[r * n + j]! * xi[j]!; si -= ar[r * n + j]! * xi[j]! + ai[r * n + j]! * xr[j]! }
        const pr = ar[r * n + r]!, pi = ai[r * n + r]!, d = pr * pr + pi * pi
        xr[r] = (sr * pr + si * pi) / d; xi[r] = (si * pr - sr * pi) / d
      }
      let n2 = 0; for (let i = 0; i < n; i++) n2 += xr[i]! ** 2 + xi[i]! ** 2
      const inv = 1 / Math.sqrt(n2); for (let i = 0; i < n; i++) { vr[i] = xr[i]! * inv; vi[i] = xi[i]! * inv }
      let lr = 0, li = 0
      for (let r = 0; r < n; r++) {
        let sr = 0, si = 0
        for (let c = 0; c < n; c++) { sr += U.re[r * n + c]! * vr[c]! - U.im[r * n + c]! * vi[c]!; si += U.re[r * n + c]! * vi[c]! + U.im[r * n + c]! * vr[c]! }
        lr += vr[r]! * sr + vi[r]! * si; li += vr[r]! * si - vi[r]! * sr
      }
      lam = [lr, li]
    }
    let res2 = 0, edgeW = 0
    for (let r = 0; r < n; r++) {
      let sr = 0, si = 0
      for (let c = 0; c < n; c++) { sr += U.re[r * n + c]! * vr[c]! - U.im[r * n + c]! * vi[c]!; si += U.re[r * n + c]! * vi[c]! + U.im[r * n + c]! * vr[c]! }
      const dr = sr - (lam[0] * vr[r]! - lam[1] * vi[r]!), di = si - (lam[0] * vi[r]! + lam[1] * vr[r]!)
      res2 += dr * dr + di * di
      if (rel3List[r]![0] + rel3List[r]![1] === R_REL) edgeW += vr[r]! ** 2 + vi[r]! ** 2
    }
    return { lam, vr, vi, res: Math.sqrt(res2), edgeW }
  }

  // Exact P = 0 trion eigenvector: verify BOTH exact comoving probabilities p_pair = 6/7 & p_{d1+d2=1} = 288/343!
  const seedTrR = new Float64Array(nRel3), seedTrI = new Float64Array(nRel3)
  for (let i = 0; i < nRel3; i++) seedTrR[i] = Math.cos(i * 0.713 + 0.1) / Math.sqrt(nRel3)
  const trionP0 = refineBlochEigen(buildRel3U(0), [-13 / 14, (-3 * SQRT3) / 14], seedTrR, seedTrI, 5)
  let trionComovingPair = 0, trionComovingCore1 = 0
  for (let i = 0; i < nRel3; i++) {
    const w = trionP0.vr[i]! ** 2 + trionP0.vi[i]! ** 2
    const [d1, d2] = rel3List[i]!
    if (d1 === 0 || d2 === 0) trionComovingPair += w
    if (d1 + d2 === 1) trionComovingCore1 += w
  }
  assertExact(Math.abs(trionComovingPair - 6 / 7) < 1e-4, `trion comoving p_pair=6/7, got ${trionComovingPair}`)
  assertExact(Math.abs(trionComovingCore1 - 288 / 343) < 1e-4, `trion comoving p_{d1+d2=1}=288/343, got ${trionComovingCore1}`)

  // Trace exact Bloch dispersion E_trion(P) across a N_CM = 64 even-site (= 128-dock) geodesic ring and evolve a localized trion wavepacket in the LAB FRAME!
  // Coordinate convention: m_code moves at +1 dock/beat (x_phys = 2 m_code + t), so on every even beat t = 2k,
  // m_lab = x_phys / 2 = m_code + t/2 => lam_lab(P) = lam_code(P) * exp(-i P/2), i.e., E_lab(P) = E_code(P) - P/2!
  const N_CM = 64
  const boundPs: { P: number; lam: C; phiLab: number; vr: Float64Array; vi: Float64Array }[] = []
  const traceHalf = (dir: 1 | -1) => {
    let curLam = trionP0.lam, curR = trionP0.vr, curI = trionP0.vi
    const startQ = dir === 1 ? 1 : -1
    const limQ = dir === 1 ? N_CM / 2 : -(N_CM / 2 - 1)
    for (let q = startQ; dir === 1 ? q <= limQ : q >= limQ; q += dir) {
      const P = (2 * Math.PI * q) / N_CM
      const sol = refineBlochEigen(buildRel3U(P), curLam, curR, curI, 2)
      if (sol.res < 1e-3 && sol.edgeW < 5e-3 && Math.abs(cAbs(sol.lam) - 1) < 1e-3) {
        // Phase-align gauge continuously (<cur | sol> real > 0) for smooth localized wavepacket!
        let ovR = 0, ovI = 0
        for (let i = 0; i < nRel3; i++) { ovR += curR[i]! * sol.vr[i]! + curI[i]! * sol.vi[i]!; ovI += curR[i]! * sol.vi[i]! - curI[i]! * sol.vr[i]! }
        const nOv = Math.hypot(ovR, ovI), cR = ovR / nOv, cI = -ovI / nOv
        for (let i = 0; i < nRel3; i++) {
          const r = sol.vr[i]!, im = sol.vi[i]!
          sol.vr[i] = cR * r - cI * im; sol.vi[i] = cR * im + cI * r
        }
        const phiLab = Math.atan2(sol.lam[1], sol.lam[0]) - 0.5 * P
        boundPs.push({ P, lam: sol.lam, phiLab, vr: sol.vr, vi: sol.vi })
        curLam = sol.lam; curR = sol.vr; curI = sol.vi
      } else break
    }
  }
  boundPs.push({ P: 0, lam: trionP0.lam, phiLab: Math.atan2(trionP0.lam[1], trionP0.lam[0]), vr: trionP0.vr, vi: trionP0.vi })
  traceHalf(1); traceHalf(-1)
  boundPs.sort((a, b) => a.P - b.P)

  // Verify exact lab-frame reflection symmetry E_lab(+P) === E_lab(-P) (so v_lab(0) = dE_lab/dP|_{P=0} = 0 identically!)
  let trionLabSymErr = 0, trionLabSymErrQ1 = 0, trionMaxVLab = 0
  const bpByQ = new Map<number, (typeof boundPs)[number]>()
  for (const bp of boundPs) bpByQ.set(Math.round((bp.P * N_CM) / (2 * Math.PI)), bp)
  for (const [q, bpPos] of bpByQ) {
    if (q <= 0) continue
    const bpNeg = bpByQ.get(-q)
    if (bpNeg) {
      const eDiff = Math.hypot(Math.cos(bpPos.phiLab) - Math.cos(bpNeg.phiLab), Math.sin(bpPos.phiLab) - Math.sin(bpNeg.phiLab))
      if (q === 1) trionLabSymErrQ1 = eDiff
      if (eDiff > trionLabSymErr) trionLabSymErr = eDiff
    }
  }
  const dP = (2 * Math.PI) / N_CM
  for (let idx = 1; idx < boundPs.length; idx++) {
    const dp = boundPs[idx]!.phiLab - boundPs[idx - 1]!.phiLab
    const wrapped = Math.atan2(Math.sin(dp), Math.cos(dp))
    const vEven = Math.abs(wrapped / dP)
    if (vEven > trionMaxVLab) trionMaxVLab = vEven
  }
  assertExact(trionLabSymErrQ1 < 1e-7 && trionLabSymErr < 1e-4, `trion lab-frame reflection symmetry E_lab(+P)=E_lab(-P), got q1=${trionLabSymErrQ1}, all=${trionLabSymErr}`)

  // Construct exact normalized localized trion wavepacket centered at origin x = 0 (all certified bound Bloch modes with cosine-window weights!)
  const pMaxBound = Math.max(...boundPs.map(b => Math.abs(b.P)))
  const wpW = boundPs.map(b => (pMaxBound > 0 ? Math.cos((0.45 * Math.PI * b.P) / pMaxBound) : 1))
  const wpNorm = Math.sqrt(wpW.reduce((s, w) => s + w * w, 0))
  const wpC = wpW.map(w => w / wpNorm)
  // Compute exact lab-frame fixed-B_2 (|x| <= 2, i.e., 3 even sites m_lab in {-1, 0, 1}) survival across even beats t = 0, 2, ..., 192!
  // Max group velocity |v_lab| <= 0.093 even-sites/beat -> max displacement <= 18 < 32 = N_CM/2 (zero wraparound!).
  // For leftmost even-site coordinate m0 in {-1, 0, 1}, all 3 particles lie inside fixed B_2 ({-2, 0, +2}) iff m0 + d1 + d2 <= 1!
  const T_TRION = 192
  const trionFixedB2Surv = new Map<number, number>()
  const trionFixedB2Holevo = new Map<number, number>()
  let trionTau05 = 0, trionTau10 = 0
  for (let t = 0; t <= T_TRION; t += 2) {
    let pIn = 0
    for (const m0 of [-1, 0, 1]) {
      for (let i = 0; i < nRel3; i++) {
        const [d1, d2] = rel3List[i]!
        if (m0 + d1 + d2 > 1) continue
        let ar = 0, ai = 0
        for (let b = 0; b < boundPs.length; b++) {
          const bp = boundPs[b]!, w = wpC[b]!
          // Exact lab-frame plane wave on even beat t: exp(i (arg(lam) - P/2) t + i P m_lab) / sqrt(N_CM)
          const ang = (Math.atan2(bp.lam[1], bp.lam[0]) - 0.5 * bp.P) * t + bp.P * m0
          const cr = Math.cos(ang), ci = Math.sin(ang)
          const pr = bp.vr[i]!, pi = bp.vi[i]!
          ar += w * (cr * pr - ci * pi); ai += w * (cr * pi + ci * pr)
        }
        pIn += (ar * ar + ai * ai) / N_CM
      }
    }
    const hVal = pIn * Math.log(2) // Binary input u in {0, 1} on two orthogonal geodesic lines L_0 vs L_1!
    trionFixedB2Surv.set(t, pIn)
    trionFixedB2Holevo.set(t, hVal)
    if (hVal >= 0.05) trionTau05 = t
    if (hVal >= 0.10) trionTau10 = t
  }
  const trionDispRatio128 = trionFixedB2Surv.get(128)! / trionFixedB2Surv.get(0)!
  const trionBoostVsK1At32 = trionFixedB2Holevo.get(32)! / k1HolevoB0[32]!
  assertExact(trionFixedB2Holevo.get(T_TRION)! < 0.05, `trion crosses below 0.05 by t=${T_TRION}`)

  // --- 3C. W10 B_1 = [[552, 25, 40]]_3 Bulk-Protected Register & Unequal-Delay Temporal Alignment ---
  // Ternary input u in {0, 1, 2} encoded in b_0 -> under any sub-threshold boundary erasure (|E| <= 39, or m <= 4 per cone),
  // I(u : rho_{E^c, t}) = ln 3 (100% trit, tau_eff = inf), dropping at |E| = 40!
  const alignBallisticD2 = k1HolevoB1[2]!, alignBallisticD6 = k1HolevoB1[6]!
  const alignB1_b0 = 1 + stabEntropy(b1Ctx.cB1Bulk.basis, 577, b1Ctx.conesUnion(Array.from({ length: 17 }, (_, i) => i))) -
    stabEntropy(b1Ctx.cB1Bulk.basis, 577, [...b1Ctx.conesUnion(Array.from({ length: 17 }, (_, i) => i)), 552])
  const alignB1_b1 = 1 + stabEntropy(b1Ctx.cB1Bulk.basis, 577, b1Ctx.conesUnion(Array.from({ length: 17 }, (_, i) => i))) -
    stabEntropy(b1Ctx.cB1Bulk.basis, 577, [...b1Ctx.conesUnion(Array.from({ length: 17 }, (_, i) => i)), 553])
  const alignB1_joint = 2 + stabEntropy(b1Ctx.cB1Bulk.basis, 577, b1Ctx.conesUnion(Array.from({ length: 17 }, (_, i) => i))) -
    stabEntropy(b1Ctx.cB1Bulk.basis, 577, [...b1Ctx.conesUnion(Array.from({ length: 17 }, (_, i) => i)), 552, 553])

  // Compute intrinsic present-state memory depth tau_eff(eta) := max { Delta >= 0 : I(u_{t-Delta} : rho_{A,t}) >= eta }
  const tauEff = (curve: readonly number[], eta: number): number => {
    let best = 0
    for (let d = 0; d < curve.length; d++) if (curve[d]! >= eta) best = d
    return best
  }
  const etaLow = 1e-3, etaMed = 0.05
  console.log(`  [3A/B] Single-beat present-state Holevo lag decodability I(u_{t-Delta} : rho_{A, t}) (Delta = 0..32, trion to 128):`)
  console.log(`       (a1) k=1 Ballistic bare U (dock 0): I(0)=${k1HolevoB0[0]!.toFixed(4)}, I(2)=${k1HolevoB0[2]!.toFixed(4)}, I(8)=${k1HolevoB0[8]!.toFixed(4)}, I(16)=${k1HolevoB0[16]!.toFixed(4)}, I(32)=${k1HolevoB0[32]!.toFixed(4)} | tau_eff(0.05)=${tauEff(k1HolevoB0, etaMed)}`)
  console.log(`       (a2) k=4 Uncoupled (Phi_odd=OFF):   I(0)=${c4Mem.offCurve[0]!.toFixed(4)}, I(8)=${c4Mem.offCurve[8]!.toExponential(2)}, I(16)=${c4Mem.offCurve[16]!.toExponential(2)}, I(32)=${c4Mem.offCurve[32]!.toExponential(2)} | tau_eff(1e-3)=${tauEff(c4Mem.offCurve, etaLow)}`)
  console.log(`       (b1) W9 Chiral C4 [0,1,2,8] ON:     I(0)=${c4Mem.onCurve[0]!.toFixed(4)}, I(8)=${c4Mem.onCurve[8]!.toExponential(2)}, I(16)=${c4Mem.onCurve[16]!.toExponential(2)}, I(32)=${c4Mem.onCurve[32]!.toExponential(2)} (${c4Mem.boost16Holevo.toFixed(1)}x Holevo / ${c4Mem.boost16Surv.toFixed(1)}x surv @16), tau_eff(1e-3)=${tauEff(c4Mem.onCurve, etaLow)}`)
  console.log(`       (b2) W9 Chiral C2 Q=0_V ON:         I(0)=${c2Mem.onCurve[0]!.toFixed(4)}, I(8)=${c2Mem.onCurve[8]!.toExponential(2)}, I(16)=${c2Mem.onCurve[16]!.toExponential(2)}, I(32)=${c2Mem.onCurve[32]!.toExponential(2)} (${c2Mem.boost16Holevo.toFixed(1)}x Holevo / ${c2Mem.boost16Surv.toFixed(1)}x surv @16), tau_eff(1e-3)=${tauEff(c2Mem.onCurve, etaLow)}`)
  console.log(`       (b3) k=3 Sym^3 Trion (${boundPs.length}/${N_CM} bound Bloch modes, lab-frame E(+dP)=E(-dP) err=${trionLabSymErrQ1.toExponential(1)}, band max=${trionLabSymErr.toExponential(1)}, max|v_lab|=${trionMaxVLab.toFixed(3)}):`)
  console.log(`            Comoving relative frame (P=0): p_pair(d1=0|d2=0)=${trionComovingPair.toFixed(6)} (exact 6/7=0.857143), p(d1+d2=1)=${trionComovingCore1.toFixed(6)} (exact 288/343=0.839650)`)
  console.log(`            Fixed-B_2 (|x|<=2) lab-frame wavepacket: I(0)=${trionFixedB2Holevo.get(0)!.toFixed(4)}, I(8)=${trionFixedB2Holevo.get(8)!.toFixed(4)}, I(16)=${trionFixedB2Holevo.get(16)!.toFixed(4)}, I(32)=${trionFixedB2Holevo.get(32)!.toFixed(4)} (${trionBoostVsK1At32.toFixed(1)}x vs k=1 @32!), I(64)=${trionFixedB2Holevo.get(64)!.toFixed(4)}, I(128)=${trionFixedB2Holevo.get(128)!.toFixed(4)} (ratio128/0=${trionDispRatio128.toFixed(3)}) | tau_eff(0.10)=${trionTau10}, tau_eff(0.05)=${trionTau05}`)
  console.log(`       (c)  W10 B_1 bulk register:         I(u : rho_{EW,t}) = ln 3 = ${LN3.toFixed(6)} (kinematic code: tau_eff = inf for |E|<=39)`)
  console.log(`       Unequal-delay alignment in 1 snapshot: ballistic (Delta=2,6) -> I=(${alignBallisticD2.toFixed(4)}, ${alignBallisticD6.toFixed(4)}); B_1 EW(17) -> I(b0)=${alignB1_b0}, I(b1)=${alignB1_b1}, I(b0b1)=${alignB1_joint} ln 3`)

  // --- 3D. Genuine Joint Unitary A U E Mallavarapu-Percy Swap Test + Non-Markovian Bath Back-Flow Audit ---
  // Build TWO genuinely distinct past histories H_1 != H_2 in FULL 27-dimensional joint Hilbert space A (x) E_1 (x) E_2
  // using the exact bare-U 2-qutrit interaction U_line = C = D^2 (zero bath resets!):
  //   History H_1: |1_A, 0_{E1}, 0_{E2}> --(U_{A,E1})--> c_K|1,0,0> + c_X|0,1,0> --(U_{A,E2})--> c_K^2|1,0,0> + c_K c_X|0,0,1> + c_X|0,1,0>
  //   History H_2: |2_A, 0_{E1}, 0_{E2}> --(U_{A,E1})--> c_K|2,0,0> + c_X|0,2,0> --(P_C on A, U_{A,E2})--> c_K^2|1,0,0> + c_K c_X|0,0,1> + c_X|0,2,0>
  // At beat t:
  //   - Past local trace distances: ||rho_{A,t-2}^(1)-rho_{A,t-2}^(2)||_1 = 2.000000, ||rho_{A,t-1}^(1)-rho_{A,t-1}^(2)||_1 = 0.500000!
  //   - Local present state on A is IDENTICAL: rho_{A,t}^(1) = rho_{A,t}^(2) = diag(15/16, 1/16, 0) (diff < 1e-15)!
  //   - Joint system+bath state on A U E is GENUINELY DIFFERENT: ||rho_{AE,t}^(1)-rho_{AE,t}^(2)||_1 = sqrt(15)/2 = 1.936492!
  const apply2QutritC = (psiR: Float64Array, psiI: Float64Array, q1: number, q2: number): [Float64Array, Float64Array] => {
    // Exact 9x9 single-line full coin C = D^2 acting on qutrits (q1, q2) inside C^27 (idx = 9*a + 3*e1 + e2)
    const outR = new Float64Array(27), outI = new Float64Array(27)
    const pow = [9, 3, 1]
    const p1 = pow[q1]!, p2 = pow[q2]!
    for (let idx = 0; idx < 27; idx++) {
      const ar = psiR[idx]!, ai = psiI[idx]!
      if (ar === 0 && ai === 0) continue
      const x1 = Math.floor(idx / p1) % 3, x2 = Math.floor(idx / p2) % 3
      if (x1 === 0 && x2 === 0) {
        outR[idx] = outR[idx]! + ar; outI[idx] = outI[idx]! + ai
      } else if (x1 !== 0 && x2 !== 0) {
        outR[idx] = outR[idx]! + (W_C[0] * ar - W_C[1] * ai)
        outI[idx] = outI[idx]! + (W_C[0] * ai + W_C[1] * ar)
      } else {
        // Keep + Cross swap (x1 <-> x2)
        const sw = idx + (x2 - x1) * p1 + (x1 - x2) * p2
        outR[idx] = outR[idx]! + (C_KEEP[0] * ar - C_KEEP[1] * ai)
        outI[idx] = outI[idx]! + (C_KEEP[0] * ai + C_KEEP[1] * ar)
        outR[sw] = outR[sw]! + (C_CROSS[0] * ar - C_CROSS[1] * ai)
        outI[sw] = outI[sw]! + (C_CROSS[0] * ai + C_CROSS[1] * ar)
      }
    }
    return [outR, outI]
  }
  const applyLocalOnA27 = (psiR: Float64Array, psiI: Float64Array, U3: CMat): [Float64Array, Float64Array] => {
    const outR = new Float64Array(27), outI = new Float64Array(27)
    for (let e = 0; e < 9; e++) {
      for (let aOut = 0; aOut < 3; aOut++) {
        let sr = 0, si = 0
        for (let aIn = 0; aIn < 3; aIn++) {
          const ur = U3.re[aOut * 3 + aIn]!, ui = U3.im[aOut * 3 + aIn]!
          const vr = psiR[aIn * 9 + e]!, vi = psiI[aIn * 9 + e]!
          sr += ur * vr - ui * vi; si += ur * vi + ui * vr
        }
        outR[aOut * 9 + e] = sr; outI[aOut * 9 + e] = si
      }
    }
    return [outR, outI]
  }
  const reduceA27 = (psiR: Float64Array, psiI: Float64Array): CMat => {
    const rho = cmatZero(3)
    for (let a1 = 0; a1 < 3; a1++) for (let a2 = 0; a2 < 3; a2++) {
      let sr = 0, si = 0
      for (let e = 0; e < 9; e++) {
        const r1 = psiR[a1 * 9 + e]!, i1 = psiI[a1 * 9 + e]!, r2 = psiR[a2 * 9 + e]!, i2 = psiI[a2 * 9 + e]!
        sr += r1 * r2 + i1 * i2; si += i1 * r2 - r1 * i2
      }
      rho.re[a1 * 3 + a2] = sr; rho.im[a1 * 3 + a2] = si
    }
    return rho
  }
  const buildDriveU = (theta: number): CMat => {
    const { vals, vecs } = hermitianJacobi(NX), Ud = cmatZero(3)
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
      let sr = 0, si = 0
      for (let k = 0; k < 3; k++) {
        const ph = cExpI(-theta * vals[k]!)
        const vi: C = [vecs.re[i * 3 + k]!, vecs.im[i * 3 + k]!], vj: C = [vecs.re[j * 3 + k]!, -vecs.im[j * 3 + k]!]
        const t = cMul(cMul(vi, ph), vj); sr += t[0]; si += t[1]
      }
      Ud.re[i * 3 + j] = sr; Ud.im[i * 3 + j] = si
    }
    return Ud
  }
  const subMat = (A: CMat, B: CMat): CMat => {
    const D = cmatZero(A.n)
    for (let k = 0; k < A.n * A.n; k++) { D.re[k] = A.re[k]! - B.re[k]!; D.im[k] = A.im[k]! - B.im[k]! }
    return D
  }
  const expQ = (rho: CMat): number => rho.re[4]! - rho.re[8]!
  const pureTraceDist = (r1: Float64Array, i1: Float64Array, r2: Float64Array, i2: Float64Array): number => {
    let ovR = 0, ovI = 0
    for (let k = 0; k < r1.length; k++) { ovR += r1[k]! * r2[k]! + i1[k]! * i2[k]!; ovI += r1[k]! * i2[k]! - i1[k]! * r2[k]! }
    return 2 * Math.sqrt(Math.max(0, 1 - (ovR * ovR + ovI * ovI)))
  }

  const pcMat = cmatZero(3); pcMat.re[0] = 1; pcMat.re[5] = 1; pcMat.re[7] = 1 // swaps |1> <-> |2>
  // History H_1 in C^27
  const p1_tm2R = new Float64Array(27), p1_tm2I = new Float64Array(27); p1_tm2R[9] = 1 // |1,0,0>
  const [p1_tm1R, p1_tm1I] = apply2QutritC(p1_tm2R, p1_tm2I, 0, 1)
  const [p1_tR, p1_tI] = apply2QutritC(p1_tm1R, p1_tm1I, 0, 2)
  // History H_2 in C^27
  const p2_tm2R = new Float64Array(27), p2_tm2I = new Float64Array(27); p2_tm2R[18] = 1 // |2,0,0>
  const [p2_tm1R, p2_tm1I] = apply2QutritC(p2_tm2R, p2_tm2I, 0, 1)
  const [p2_flR, p2_flI] = applyLocalOnA27(p2_tm1R, p2_tm1I, pcMat)
  const [p2_tR, p2_tI] = apply2QutritC(p2_flR, p2_flI, 0, 2)

  const h1_tm2 = reduceA27(p1_tm2R, p1_tm2I), h1_tm1 = reduceA27(p1_tm1R, p1_tm1I), h1_t = reduceA27(p1_tR, p1_tI)
  const h2_tm2 = reduceA27(p2_tm2R, p2_tm2I), h2_tm1 = reduceA27(p2_tm1R, p2_tm1I), h2_t = reduceA27(p2_tR, p2_tI)
  const pastDiffTm2 = traceNormHermitian(subMat(h1_tm2, h2_tm2))
  const pastDiffTm1 = traceNormHermitian(subMat(h1_tm1, h2_tm1))
  const presentDiff = traceNormHermitian(subMat(h1_t, h2_t))
  const jointAEDiffAtT = pureTraceDist(p1_tR, p1_tI, p2_tR, p2_tI)

  // (a) Single-beat present-state readout invariance on rho_{A, t} vs Note 12 Sec 45 non-Markovian negative control
  const sDiff = Math.abs(vonNeumannEntropy(h1_t) - vonNeumannEntropy(h2_t))
  const qDiff = Math.abs(expQ(h1_t) - expQ(h2_t))
  const qfiOf = (rho: CMat) => {
    const Hrho = cmatMul(NX, rho), rhoH = cmatMul(rho, NX), dr = cmatZero(3)
    for (let k = 0; k < 9; k++) { dr.re[k] = Hrho.im[k]! - rhoH.im[k]!; dr.im[k] = -(Hrho.re[k]! - rhoH.re[k]!) }
    return exactSldQfi(rho, dr)
  }
  const qfiSwapDiff = Math.abs(qfiOf(h1_t) - qfiOf(h2_t))
  const holevoSwapDiff = holevoMutualInfo([h1_t, h2_t])
  const phiHist1 = 0.5 * expQ(h1_t) + 0.3 * expQ(h1_tm1) + 0.2 * expQ(h1_tm2)
  const phiHist2 = 0.5 * expQ(h2_t) + 0.3 * expQ(h2_tm1) + 0.2 * expQ(h2_tm2)
  const nonMarkovSwapFail = Math.abs(phiHist1 - phiHist2)

  // (b-i) GENUINE JOINT UNITARY A U E WITH TRAPPED LOCAL BATH (zero resets!): E_1 re-couples to A -> NON-MARKOVIAN BACK-FLOW!
  const drives = [0.35, -0.22, 0.51, 0.14, -0.43, 0.29, 0.62, -0.18]
  let tr1R = p1_tR, tr1I = p1_tI, tr2R = p2_tR, tr2I = p2_tI
  let maxTrappedBathDiff = 0, beat1TrappedDiff = 0
  for (let b = 0; b < drives.length; b++) {
    const Ud = buildDriveU(drives[b]!)
    ;[tr1R, tr1I] = applyLocalOnA27(tr1R, tr1I, Ud)
    ;[tr2R, tr2I] = applyLocalOnA27(tr2R, tr2I, Ud)
    ;[tr1R, tr1I] = apply2QutritC(tr1R, tr1I, 0, 1) // A re-interacts with trapped bath E_1!
    ;[tr2R, tr2I] = apply2QutritC(tr2R, tr2I, 0, 1)
    ;[tr1R, tr1I] = apply2QutritC(tr1R, tr1I, 1, 2) // internal trapped bath mixing E_1 <-> E_2!
    ;[tr2R, tr2I] = apply2QutritC(tr2R, tr2I, 1, 2)
    const dA = traceNormHermitian(subMat(reduceA27(tr1R, tr1I), reduceA27(tr2R, tr2I)))
    if (b === 0) beat1TrappedDiff = dA
    if (dA > maxTrappedBathDiff) maxTrappedBathDiff = dA
  }

  // (b-ii) GENUINE JOINT UNITARY A U E ON INFINITE 1D BARE-U GEODESIC LINE (zero walls, zero resets!):
  // At beat t, the exact 1-vibe state along geodesic line L_0 is:
  //   H_1: c_K^2 |+1 at x=0, out> + c_K c_X |+1 at x=1, out> + c_X |+1 at x=2, out>
  //   H_2: c_K^2 |+1 at x=0, out> + c_K c_X |+1 at x=1, out> + c_X |-1 at x=2, out>
  // Both have IDENTICAL local reduced state rho_{A, t} = diag(15/16, 1/16, 0) at x = 0!
  // Evolve forward 8 beats under LITERAL exact 1-body bare U (C + streaming) on infinite L_0 (zero bath resets, zero cavity walls):
  const L1D = 25, o1D = 12
  const makeLine1D = (toneAtX2: 1 | 2) => {
    // 2 tones (0=+1, 1=-1) x 2 dirs (0=out/+1, 1=in/-1) x L1D positions
    const r = new Float64Array(4 * L1D), im = new Float64Array(4 * L1D)
    const set = (tn: number, dr: number, x: number, amp: C) => { const idx = ((tn * 2 + dr) * L1D) + (o1D + x); r[idx] = amp[0]; im[idx] = amp[1] }
    set(0, 0, 0, cMul(C_KEEP, C_KEEP))
    set(0, 0, 1, cMul(C_KEEP, C_CROSS))
    set(toneAtX2 === 1 ? 0 : 1, 0, 2, C_CROSS)
    return { r, im }
  }
  const stepLine1D = (st: { r: Float64Array; im: Float64Array }) => {
    const nr = new Float64Array(4 * L1D), nim = new Float64Array(4 * L1D)
    for (let tn = 0; tn < 2; tn++) {
      for (let x = 1; x < L1D - 1; x++) {
        const i0 = (tn * 2) * L1D + x, i1 = (tn * 2 + 1) * L1D + x
        const a0r = st.r[i0]!, a0i = st.im[i0]!, a1r = st.r[i1]!, a1i = st.im[i1]!
        if (a0r === 0 && a0i === 0 && a1r === 0 && a1i === 0) continue
        const o0r = C_KEEP[0] * a0r - C_KEEP[1] * a0i + C_CROSS[0] * a1r - C_CROSS[1] * a1i
        const o0i = C_KEEP[0] * a0i + C_KEEP[1] * a0r + C_CROSS[0] * a1i + C_CROSS[1] * a1r
        const o1r = C_CROSS[0] * a0r - C_CROSS[1] * a0i + C_KEEP[0] * a1r - C_KEEP[1] * a1i
        const o1i = C_CROSS[0] * a0i + C_CROSS[1] * a0r + C_KEEP[0] * a1i + C_KEEP[1] * a1r
        nr[(tn * 2) * L1D + (x + 1)] = nr[(tn * 2) * L1D + (x + 1)]! + o0r
        nim[(tn * 2) * L1D + (x + 1)] = nim[(tn * 2) * L1D + (x + 1)]! + o0i
        nr[(tn * 2 + 1) * L1D + (x - 1)] = nr[(tn * 2 + 1) * L1D + (x - 1)]! + o1r
        nim[(tn * 2 + 1) * L1D + (x - 1)] = nim[(tn * 2 + 1) * L1D + (x - 1)]! + o1i
      }
    }
    return { r: nr, im: nim }
  }
  const reduceX0Line1D = (st: { r: Float64Array; im: Float64Array }): CMat => {
    // 1-particle reduced state on dock x = 0 (basis {|vac>, |+1>, |-1>}) tracing out x != 0 (and spin inside x=0)
    let pP = 0, pM = 0
    for (let dr = 0; dr < 2; dr++) {
      const ip = (0 * 2 + dr) * L1D + o1D, imIdx = (1 * 2 + dr) * L1D + o1D
      pP += st.r[ip]! ** 2 + st.im[ip]! ** 2
      pM += st.r[imIdx]! ** 2 + st.im[imIdx]! ** 2
    }
    const rho = cmatZero(3); rho.re[0] = Math.max(0, 1 - pP - pM); rho.re[4] = pP; rho.re[8] = pM
    return rho
  }
  let l1 = makeLine1D(1), l2 = makeLine1D(2)
  assertExact(traceNormHermitian(subMat(reduceX0Line1D(l1), reduceX0Line1D(l2))) < 1e-15, '1D geodesic bath states match on A at t')
  let max1DGeodesicBackflow = 0
  for (let k = 1; k <= 8; k++) {
    l1 = stepLine1D(l1); l2 = stepLine1D(l2)
    const dA = traceNormHermitian(subMat(reduceX0Line1D(l1), reduceX0Line1D(l2)))
    if (dA > max1DGeodesicBackflow) max1DGeodesicBackflow = dA
  }

  // (b-iii) GENUINE JOINT UNITARY A U E WITH HYPERBOLIC OUTWARD-EXPORT CONVEYOR (exact unitary Stinespring dilation, zero resets!):
  // Track the exact joint density matrix rho_{A, E_past} (dim 9 = A (x) E_1, keeping E_1's distinct history record intact & un-reset!),
  // while each beat k = 1..8 couples A unitarily via U_{A, E_fresh} = C to a fresh orthogonal incoming hyperbolic mode |0_{E_fresh}>
  // and exports E_fresh into the 18.28^r outward sink (zero interaction with E_1!).
  // Global state on A (x) E_1 (x) E_out stays strictly distinct forever (||rho_{A,E1}^(1) - rho_{A,E1}^(2)||_1 >= 1.50!),
  // yet tracing out E_1 gives exact downstream invariance max_{k=1..8} ||rho_{A,t+k}^(1) - rho_{A,t+k}^(2)||_1 < 1e-15!
  const reduceAE1From27 = (psiR: Float64Array, psiI: Float64Array): CMat => {
    const rho = cmatZero(9)
    for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) {
      let sr = 0, si = 0
      for (let e2 = 0; e2 < 3; e2++) {
        const r1 = psiR[i * 3 + e2]!, i1 = psiI[i * 3 + e2]!, r2 = psiR[j * 3 + e2]!, i2 = psiI[j * 3 + e2]!
        sr += r1 * r2 + i1 * i2; si += i1 * r2 - r1 * i2
      }
      rho.re[i * 9 + j] = sr; rho.im[i * 9 + j] = si
    }
    return rho
  }
  const stepExportJoint9 = (rhoAE1: CMat, theta: number): CMat => {
    // Apply U_drive(theta) (x) I_{E1}, then exact unitary U_{A, E_fresh} = C with fresh |0_{E_fresh}> (tensor I_{E1}), trace out E_fresh ONLY (KEEP E_1 intact!)
    const Ud = buildDriveU(theta)
    const Ud9 = cmatZero(9), Ud9D = cmatZero(9)
    for (let a1 = 0; a1 < 3; a1++) for (let a2 = 0; a2 < 3; a2++) for (let e = 0; e < 3; e++) {
      Ud9.re[(a1 * 3 + e) * 9 + (a2 * 3 + e)] = Ud.re[a1 * 3 + a2]!
      Ud9.im[(a1 * 3 + e) * 9 + (a2 * 3 + e)] = Ud.im[a1 * 3 + a2]!
      Ud9D.re[(a2 * 3 + e) * 9 + (a1 * 3 + e)] = Ud.re[a1 * 3 + a2]!
      Ud9D.im[(a2 * 3 + e) * 9 + (a1 * 3 + e)] = -Ud.im[a1 * 3 + a2]!
    }
    const rPre = cmatMul(Ud9, cmatMul(rhoAE1, Ud9D))
    // Exact Kraus operators K_m (x) I_{E1} of unitary U_{A, E_fresh} = C on A (x) E_1 (m = 0, 1, 2 for E_fresh output)
    const K0 = cmatZero(9), K0D = cmatZero(9), K1 = cmatZero(9), K1D = cmatZero(9), K2 = cmatZero(9), K2D = cmatZero(9)
    for (let e = 0; e < 3; e++) {
      K0.re[e * 9 + e] = 1; K0D.re[e * 9 + e] = 1
      K0.re[(3 + e) * 9 + (3 + e)] = C_KEEP[0]; K0.im[(3 + e) * 9 + (3 + e)] = C_KEEP[1]
      K0D.re[(3 + e) * 9 + (3 + e)] = C_KEEP[0]; K0D.im[(3 + e) * 9 + (3 + e)] = -C_KEEP[1]
      K0.re[(6 + e) * 9 + (6 + e)] = C_KEEP[0]; K0.im[(6 + e) * 9 + (6 + e)] = C_KEEP[1]
      K0D.re[(6 + e) * 9 + (6 + e)] = C_KEEP[0]; K0D.im[(6 + e) * 9 + (6 + e)] = -C_KEEP[1]
      K1.re[e * 9 + (3 + e)] = C_CROSS[0]; K1.im[e * 9 + (3 + e)] = C_CROSS[1]
      K1D.re[(3 + e) * 9 + e] = C_CROSS[0]; K1D.im[(3 + e) * 9 + e] = -C_CROSS[1]
      K2.re[e * 9 + (6 + e)] = C_CROSS[0]; K2.im[e * 9 + (6 + e)] = C_CROSS[1]
      K2D.re[(6 + e) * 9 + e] = C_CROSS[0]; K2D.im[(6 + e) * 9 + e] = -C_CROSS[1]
    }
    const t0 = cmatMul(K0, cmatMul(rPre, K0D)), t1 = cmatMul(K1, cmatMul(rPre, K1D)), t2 = cmatMul(K2, cmatMul(rPre, K2D))
    const out = cmatZero(9)
    for (let k = 0; k < 81; k++) { out.re[k] = t0.re[k]! + t1.re[k]! + t2.re[k]!; out.im[k] = t0.im[k]! + t1.im[k]! + t2.im[k]! }
    return out
  }
  const traceOutE1From9 = (rho9: CMat): CMat => {
    const rhoA = cmatZero(3)
    for (let a1 = 0; a1 < 3; a1++) for (let a2 = 0; a2 < 3; a2++) {
      let sr = 0, si = 0
      for (let e = 0; e < 3; e++) { sr += rho9.re[(a1 * 3 + e) * 9 + (a2 * 3 + e)]!; si += rho9.im[(a1 * 3 + e) * 9 + (a2 * 3 + e)]! }
      rhoA.re[a1 * 3 + a2] = sr; rhoA.im[a1 * 3 + a2] = si
    }
    return rhoA
  }
  let ex1 = reduceAE1From27(p1_tR, p1_tI), ex2 = reduceAE1From27(p2_tR, p2_tI)
  let maxExportLocalDiff = 0, minExportJointDiff = Infinity
  for (const th of drives) {
    ex1 = stepExportJoint9(ex1, th)
    ex2 = stepExportJoint9(ex2, th)
    const dLoc = traceNormHermitian(subMat(traceOutE1From9(ex1), traceOutE1From9(ex2)))
    const dJnt = traceNormHermitian(subMat(ex1, ex2))
    if (dLoc > maxExportLocalDiff) maxExportLocalDiff = dLoc
    if (dJnt < minExportJointDiff) minExportJointDiff = dJnt
  }

  console.log(`  [3D] Genuine Joint Unitary A U E Mallavarapu-Percy Swap Test (zero bath resets!):`)
  console.log(`       Past histories distinct:     ||rho_{A,t-2}^(1)-rho_{A,t-2}^(2)||_1 = ${pastDiffTm2.toFixed(6)}, ||rho_{A,t-1}^(1)-rho_{A,t-1}^(2)||_1 = ${pastDiffTm1.toFixed(6)}`)
  console.log(`       Present state at beat t:     local ||rho_{A,t}^(1)-rho_{A,t}^(2)||_1 = ${presentDiff.toExponential(2)} | joint ||rho_{AE,t}^(1)-rho_{AE,t}^(2)||_1 = ${jointAEDiffAtT.toFixed(6)}!`)
  console.log(`       (a) Present-state readouts:  dS_vN=${sDiff.toExponential(1)}, d<Q>=${qDiff.toExponential(1)}, dQFI=${qfiSwapDiff.toExponential(1)}, Holevo=${holevoSwapDiff.toExponential(1)} (PASS) vs Note 12 Sec 45 Phi_hist=${nonMarkovSwapFail.toFixed(6)} (FAILS!)`)
  console.log(`       (b1) Trapped local bath (27D unitary, 0 resets):   beat+1 diff=${beat1TrappedDiff.toFixed(6)}, max_8 diff=${maxTrappedBathDiff.toFixed(6)} > 0 (NON-MARKOVIAN BACK-FLOW!)`)
  console.log(`       (b2) 1D bare-U geodesic bath (infinite L_0):       max_8 diff=${max1DGeodesicBackflow.toFixed(6)} > 0 (1-body collinear back-scattering!)`)
  console.log(`       (b3) Hyperbolic outward-export bath (0 resets):    joint diff >= ${minExportJointDiff.toFixed(6)} (distinct!), local max_8 diff = ${maxExportLocalDiff.toExponential(2)} (MARKOVIAN PASS!)\n`)

  recordCheck(
    'E3',
    'Markovian present-state memory depth tau_eff (ballistic vs 207.6x chiral vs trion dispersion vs B_1) & Joint Unitary A U E MP swap test',
    k1HolevoB0[16]! < 0.08 &&
      k1HolevoB0[32]! < 0.04 &&
      c4Mem.boost16Surv > 200 &&
      c4Mem.boost16Holevo > 150 &&
      c2Mem.boost16Surv > 50 &&
      tauEff(c4Mem.onCurve, etaLow) > tauEff(c4Mem.offCurve, etaLow) &&
      Math.abs(trionComovingPair - 6 / 7) < 1e-4 &&
      Math.abs(trionComovingCore1 - 288 / 343) < 1e-4 &&
      trionLabSymErrQ1 < 1e-7 &&
      trionLabSymErr < 1e-4 &&
      trionBoostVsK1At32 > 5 &&
      trionDispRatio128 < 0.6 &&
      alignBallisticD2 > 0.3 &&
      alignBallisticD6 > 0.1 &&
      alignB1_b0 === 2 &&
      alignB1_b1 === 2 &&
      alignB1_joint === 4 &&
      pastDiffTm2 > 1.9 &&
      pastDiffTm1 >= 0.5 - 1e-12 &&
      presentDiff < 1e-14 &&
      jointAEDiffAtT > 1.9 &&
      sDiff < 1e-14 &&
      qDiff < 1e-14 &&
      qfiSwapDiff < 1e-14 &&
      holevoSwapDiff < 1e-14 &&
      nonMarkovSwapFail > 0.5 &&
      maxTrappedBathDiff > 0.5 &&
      max1DGeodesicBackflow > 0.05 &&
      minExportJointDiff > 1.4 &&
      maxExportLocalDiff < 1e-14,
    `chiral C4=${c4Mem.boost16Holevo.toFixed(1)}x (tau ${tauEff(c4Mem.offCurve, etaLow)}->${tauEff(c4Mem.onCurve, etaLow)}); trion fixed-B_2: ${trionBoostVsK1At32.toFixed(1)}x vs k=1 @32, ratio128/0=${trionDispRatio128.toFixed(3)} (lab sym err=${trionLabSymErr.toExponential(1)}); MP swap: trapped=${maxTrappedBathDiff.toFixed(3)}, 1D=${max1DGeodesicBackflow.toFixed(3)}, export=${maxExportLocalDiff.toExponential(1)}`,
  )
}

// =================================================================================================
// MAIN EXECUTION
// =================================================================================================

console.log('==============================================================================================')
console.log('WAVE-4 TRACK W14 (PART B): NOTE 16 FALSIFIABLE {3,4,3,4} HIGHER-SELVES TESTBED')
console.log('Exact Lumpability | B_1=[[552,25,40]]_3 RT & QFI Horizons | Markovian tau_eff & Swap Test')
console.log('==============================================================================================\n')

runExperiment1()
const b1Ctx = runExperiment2()
runExperiment3(b1Ctx)

const elapsedSec = (performance.now() - t0Global) / 1000
console.log('==============================================================================================')
console.log(`VERIFICATION SUMMARY (W14 PART B — ${elapsedSec.toFixed(2)} s)`)
console.log('==============================================================================================')
let allPassed = true
for (const c of CHECKS) {
  if (!c.passed) allPassed = false
  console.log(`  [${c.passed ? 'PASS' : 'FAIL'}] ${c.id} | ${c.name}`)
  console.log(`         ${c.detail}`)
}
console.log('==============================================================================================')
console.log(`OVERALL: ${CHECKS.filter(c => c.passed).length}/${CHECKS.length} CHECKS PASSED | ALL PASSED = ${allPassed}`)
if (!allPassed) process.exit(1)

export {}
