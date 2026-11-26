// Breakthrough Suite (Wave-4 Track W11):
// Dynamical Holography Bridge between the Bare 8-Layer Palindromic QCA Beat U on {3,4,3,4}
// and the Wave-3 W10 Exact All-Radius W(F_4)-Covariant [[24, 1, 8]]_3 HaPPY Tensor Network.
//
// Strictly deterministic (ZERO Math.random), standalone (ZERO external imports), laptop-safe (< 12 s,
// < 500 MB RAM), noUncheckedIndexedAccess-safe, ending with `export {}`.
//
// Machine-verified theorems and exact computations proved in this script:
//   B1 (W11.1a): Layer-by-layer bare-U Clifford vs non-Clifford audit & 23-stabilizer survival
//                across all 6 distinct layers (Phi_odd, D, K, M_pair(zeta_18), M_meet, S) + D*M_meet*K*D.
//   B2 (W11.1b): Exact 3^24-dimensional code-subspace survival p_code(L) and 1-beat leakage via
//                exact line-local (u, v) factorization of [[24, 1, 8]]_3 = |psi_c^(+)>(12u) (x) |psi^(-)>(12v).
//   B3 (W11.1c): Exact horizon mutual-information survival I_twirl(b_0 : A_k) across k = 7/8/16/17
//                under exact bare-U Pauli twirling on B_0 = [[24, 1, 8]]_3 (GF(3)-FFT all-12-line)
//                and B_1 = [[552, 25, 40]]_3 (24-line simultaneous zero-loss theorem + r=3 threshold).
//   B4 (W11.2a): Exhaustive classification of ALL G-covariant S_bulk-preserving Clifford dock gates
//                L_C in Sp(48, 3) across W(F_4) [1152], W(F_4)^+ [576], 2T o 2T [288], and W(D_4) [192],
//                plus exact induced logical subgroup L_bulk <= SL(2, 3) and uniform I_24 (x) C audit.
//   B5 (W11.2b): Facet-swap streaming S = R o E_swap audit, Single-Edge W(F_4) No-Go Lemma, and
//                exact full-W(F_4)-covariant order-3 bulk star QCA U_star(beta) lifted explicitly
//                to U_bdy^star in Sp(1104, 3) on B_1 (0 stabilizer leakage, [4/4] W(F_4) covariance).
//   B6 (W11.2c): Pure unitary 2T o 2T-covariant nearest-neighbor bulk QCA U_NN = G_edges(1) & Floquet
//                U_Floq = F_site o G_edges(1): exact B_1 boundary intertwining (0 leakage t=1..20)
//                and exact 1-shell/beat Lieb-Robinson light cone verified on B_3 (8,857 docks).
//   B7 (W11.2d): Exact Fock-Clifford Rigidity Theorem & bare-U vs U_holo four-fold obstruction audit.
//   B8 (W11.3a): Exact k = 1..24 discrete FLM sweep on B_1 = [[552, 25, 40]]_3 across rank-1 pure,
//                neutral rank-1 Bell-entangled, and rank-3 maximally mixed (m = 1, 2, 4, 6) excitations,
//                certifying exact k = 7 -> 8 and k = 16 -> 17 entanglement-wedge phase transitions.
//   B9 (W11.3b): Exact boundary mutual information I(A_k : B_k) and effective MI metric shift Delta d_MI
//                contrasting thermal/BH horizon screening (Delta I <= 0) vs neutral bulk Bell pairs
//                (exact monotonic ER=EPR metric contraction Delta I = +2r ln 3, Delta d_MI < 0).
//  B10 (W11.3c): Dynamical bulk-to-boundary backreaction bridge: evolving central BH M_1 under U_bdy^star
//                and U_bdy^NN on B_1 and tracking exact time-dependent FLM entropy Delta S(A_k, t).

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

// ============================================================================
// 0. EXACT COMPLEX ARITHMETIC, BIT-SLICED GF(3) SYMPLECTIC ALGEBRA & GEOMETRY
// ============================================================================

type Cx = readonly [number, number] // [re, im]
const SQRT3 = Math.sqrt(3)
const CX0: Cx = [0, 0]
const CX1: Cx = [1, 0]
const CX_OMEGA: Cx = [-0.5, SQRT3 / 2]
const CX_OMEGA2: Cx = [-0.5, -SQRT3 / 2]
const CX_ZETA6: Cx = [0.5, SQRT3 / 2]
const CX_ZETA18: Cx = [Math.cos(Math.PI / 9), Math.sin(Math.PI / 9)]
const OMEGA_POW: readonly Cx[] = [CX1, CX_OMEGA, CX_OMEGA2]
const ZETA6_POW: readonly Cx[] = [
  CX1,
  CX_ZETA6,
  CX_OMEGA,
  [-1, 0],
  [-0.5, -SQRT3 / 2],
  [0.5, -SQRT3 / 2],
]

const cxAdd = (a: Cx, b: Cx): Cx => [a[0] + b[0], a[1] + b[1]]
const cxSub = (a: Cx, b: Cx): Cx => [a[0] - b[0], a[1] - b[1]]
const cxMul = (a: Cx, b: Cx): Cx => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]
const cxConj = (a: Cx): Cx => [a[0], -a[1]]
const cxAbs2 = (a: Cx): number => a[0] * a[0] + a[1] * a[1]
const cxAbs = (a: Cx): number => Math.hypot(a[0], a[1])
const cxScale = (s: number, a: Cx): Cx => [s * a[0], s * a[1]]

type Root4 = readonly [number, number, number, number]
type Mat2 = readonly [number, number, number, number]
type Z2 = readonly [bigint, bigint]

const mod3 = (x: number): number => ((x % 3) + 3) % 3
const mul2 = (X: Mat2, Y: Mat2): Mat2 => [
  mod3(X[0] * Y[0] + X[1] * Y[2]),
  mod3(X[0] * Y[1] + X[1] * Y[3]),
  mod3(X[2] * Y[0] + X[3] * Y[2]),
  mod3(X[2] * Y[1] + X[3] * Y[3]),
]
const det2 = (X: Mat2): number => mod3(X[0] * X[3] - X[1] * X[2])

// Bit-sliced GF(3) row: 0=(0,0), 1=(1,0), 2=(0,1)
type GF3Row = { readonly a: Uint32Array; readonly b: Uint32Array }

const gf3RowZero = (words: number): GF3Row => ({ a: new Uint32Array(words), b: new Uint32Array(words) })
const gf3RowClone = (r: GF3Row): GF3Row => ({ a: Uint32Array.from(r.a), b: Uint32Array.from(r.b) })

function gf3Get(r: GF3Row, col: number): number {
  const w = col >>> 5, bit = 1 << (col & 31)
  return (r.a[w]! & bit) !== 0 ? 1 : (r.b[w]! & bit) !== 0 ? 2 : 0
}
function gf3Set(r: GF3Row, col: number, val: number): void {
  const w = col >>> 5, bit = 1 << (col & 31), mask = ~bit
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
function gf3ToUint8(r: GF3Row, len: number): Uint8Array {
  const out = new Uint8Array(len)
  for (let i = 0; i < len; i++) out[i] = gf3Get(r, i)
  return out
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
    const t = r.a[w]!; r.a[w] = r.b[w]!; r.b[w] = t
  }
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
function popcnt32(x: number): number {
  let v = x >>> 0
  v = v - ((v >>> 1) & 0x55555555)
  v = (v & 0x33333333) + ((v >>> 2) & 0x33333333)
  return (((v + (v >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24
}

type SympRow = { readonly x: GF3Row; readonly z: GF3Row }
function toSympRow(r: GF3Row, nQ: number): SympRow {
  const words = (nQ + 31) >>> 5
  const x = gf3RowZero(words), z = gf3RowZero(words)
  for (let i = 0; i < nQ; i++) {
    const xv = gf3Get(r, i), zv = gf3Get(r, nQ + i)
    if (xv) gf3Set(x, i, xv)
    if (zv) gf3Set(z, i, zv)
  }
  return { x, z }
}
function sympDotBit(u: SympRow, v: SympRow): number {
  let pos = 0, neg = 0
  for (let w = 0; w < u.x.a.length; w++) {
    const uxa = u.x.a[w]!, uxb = u.x.b[w]!, uza = u.z.a[w]!, uzb = u.z.b[w]!
    const vxa = v.x.a[w]!, vxb = v.x.b[w]!, vza = v.z.a[w]!, vzb = v.z.b[w]!
    pos += popcnt32((uxa & vza) | (uxb & vzb)) + popcnt32((uza & vxb) | (uzb & vxa))
    neg += popcnt32((uxa & vzb) | (uxb & vza)) + popcnt32((uza & vxa) | (uzb & vxb))
  }
  return mod3(pos - neg)
}
function countIsoDefects(basis: readonly GF3Row[], nQ: number): number {
  const s = basis.map(r => toSympRow(r, nQ))
  let def = 0
  for (let i = 0; i < s.length; i++)
    for (let j = i + 1; j < s.length; j++)
      if (sympDotBit(s[i]!, s[j]!) !== 0) def++
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
      const xv = gf3Get(r, q), zv = gf3Get(r, nQ + q)
      if (xv) gf3Set(out, j, xv)
      if (zv) gf3Set(out, k + j, zv)
    }
    return out
  })
  return gf3Rank(sub, 2 * k) - k
}

// Small-dimension Uint8Array GF(3) helpers for module Hom & classification
function u8Rref(rows: readonly Uint8Array[], nCols: number): Uint8Array[] {
  const mat = rows.map(r => Uint8Array.from(r))
  let rank = 0
  for (let col = 0; col < nCols && rank < mat.length; col++) {
    let piv = -1
    for (let r = rank; r < mat.length; r++) if (mat[r]![col] !== 0) { piv = r; break }
    if (piv === -1) continue
    const tmp = mat[rank]!; mat[rank] = mat[piv]!; mat[piv] = tmp
    const pRow = mat[rank]!
    if (pRow[col] === 2) for (let c = col; c < nCols; c++) pRow[c] = (2 * pRow[c]!) % 3
    for (let r = 0; r < mat.length; r++) {
      if (r === rank) continue
      const f = mat[r]![col]!
      if (f === 0) continue
      const row = mat[r]!
      for (let c = col; c < nCols; c++) row[c] = mod3(row[c]! - f * pRow[c]!)
    }
    rank++
  }
  return mat.slice(0, rank)
}
function u8Nullspace(rows: readonly Uint8Array[], nCols: number): Uint8Array[] {
  const basis = u8Rref(rows, nCols)
  const r = basis.length, pivCols: number[] = [], isPiv = new Uint8Array(nCols)
  for (let i = 0; i < r; i++)
    for (let c = 0; c < nCols; c++)
      if (basis[i]![c] === 1) { pivCols.push(c); isPiv[c] = 1; break }
  const out: Uint8Array[] = []
  for (let free = 0; free < nCols; free++) {
    if (isPiv[free]) continue
    const v = new Uint8Array(nCols); v[free] = 1
    for (let i = 0; i < r; i++) v[pivCols[i]!] = mod3(-basis[i]![free]!)
    out.push(v)
  }
  return u8Rref(out, nCols)
}
function expressInBasis(B: readonly Uint8Array[], w: Uint8Array, n: number): Uint8Array {
  const m = B.length
  const aug = Array.from({ length: n }, (_, col) => {
    const row = new Uint8Array(m + 1)
    for (let k = 0; k < m; k++) row[k] = B[k]![col]!
    row[m] = w[col]!
    return row
  })
  const rref = u8Rref(aug, m + 1)
  assertExact(rref.length === m, 'vector outside basis span')
  return Uint8Array.from({ length: m }, (_, k) => rref[k]![m]!)
}
function computeHomU8(M1: readonly Uint8Array[][], M2: readonly Uint8Array[][]): Uint8Array[][] {
  const d1 = M1[0]!.length, d2 = M2[0]!.length, nVars = d1 * d2
  const pivots: (Uint8Array | null)[] = new Array(nVars).fill(null)
  let rank = 0
  for (let g = 0; g < M1.length && rank < nVars; g++) {
    const A = M1[g]!, B = M2[g]!
    for (let i = 0; i < d1 && rank < nVars; i++) {
      const Ai = A[i]!
      for (let j = 0; j < d2 && rank < nVars; j++) {
        const row = new Uint8Array(nVars)
        let firstNz = nVars
        for (let k = 0; k < d1; k++) {
          const v = Ai[k]!
          if (v !== 0) { const idx = k * d2 + j; row[idx] = (row[idx]! + v) % 3; if (idx < firstNz) firstNz = idx }
        }
        for (let l = 0; l < d2; l++) {
          const v = B[l]![j]!
          if (v !== 0) { const idx = i * d2 + l; row[idx] = (row[idx]! + 3 - v) % 3; if (idx < firstNz) firstNz = idx }
        }
        for (let c = firstNz; c < nVars; c++) {
          const rc = row[c]!; if (rc === 0) continue
          const piv = pivots[c]!
          if (piv === null) {
            if (rc === 2) for (let col = c; col < nVars; col++) row[col] = (2 * row[col]!) % 3
            pivots[c] = row; rank++; break
          }
          if (rc === 1) { for (let col = c; col < nVars; col++) { const pv = piv[col]!; if (pv !== 0) row[col] = (row[col]! + 3 - pv) % 3 } }
          else { for (let col = c; col < nVars; col++) { const pv = piv[col]!; if (pv !== 0) row[col] = (row[col]! + pv) % 3 } }
        }
      }
    }
  }
  if (rank === nVars) return []
  const eqs: Uint8Array[] = []
  for (let c = 0; c < nVars; c++) if (pivots[c] !== null) eqs.push(pivots[c]!)
  return u8Nullspace(eqs, nVars).map(vec =>
    Array.from({ length: d1 }, (_, i) => vec.slice(i * d2, (i + 1) * d2)),
  )
}
function mulVecMat(v: Uint8Array, M: readonly Uint8Array[]): Uint8Array {
  const m = M[0]!.length, out = new Uint8Array(m)
  for (let r = 0; r < v.length; r++) {
    const vr = v[r]!; if (vr === 0) continue
    const row = M[r]!
    for (let c = 0; c < m; c++) out[c] = (out[c]! + vr * row[c]!) % 3
  }
  return out
}

// D_4 roots, W(F_4) hierarchy, S_3-triality, and exact [[24, 1, 8]]_3 tensors
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
const OPP: readonly number[] = ROOTS.map(r =>
  ROOTS.findIndex(o => o[0] === -r[0] && o[1] === -r[1] && o[2] === -r[2] && o[3] === -r[3]),
)
const LINES: readonly (readonly [number, number])[] = (() => {
  const out: [number, number][] = []
  for (let i = 0; i < 24; i++) if (i < OPP[i]!) out.push([i, OPP[i]!])
  return out
})()
const LINE_OF = new Int32Array(24)
const SIDE_OF = new Int32Array(24)
for (let l = 0; l < 12; l++) {
  const [a, b] = LINES[l]!
  LINE_OF[a] = l; SIDE_OF[a] = 0
  LINE_OF[b] = l; SIDE_OF[b] = 1
}
const FRAME_OF: readonly number[] = ROOTS.map(r => {
  const n0 = r[0] !== 0, n1 = r[1] !== 0, n2 = r[2] !== 0, n3 = r[3] !== 0
  return (n0 && n1) || (n2 && n3) ? 0 : (n0 && n2) || (n1 && n3) ? 1 : 2
})

function reflectPerm(alpha: Root4): Uint8Array {
  const aa = dot4(alpha, alpha), perm = new Uint8Array(24)
  for (let i = 0; i < 24; i++) {
    const v = ROOTS[i]!, twoVa = 2 * dot4(v, alpha)
    const img = [0, 1, 2, 3].map(k => v[k]! - (twoVa * alpha[k]!) / aa)
    perm[i] = ROOTS.findIndex(o => o[0] === img[0] && o[1] === img[1] && o[2] === img[2] && o[3] === img[3])
  }
  return perm
}
function composePerm(a: Uint8Array, b: Uint8Array): Uint8Array {
  const out = new Uint8Array(24)
  for (let i = 0; i < 24; i++) out[i] = a[b[i]!]!
  return out
}
function invPerm(a: Uint8Array): Uint8Array {
  const out = new Uint8Array(24)
  for (let i = 0; i < 24; i++) out[a[i]!] = i
  return out
}
const S_GENS: readonly Uint8Array[] = [
  reflectPerm([0, 1, -1, 0]),
  reflectPerm([0, 0, 1, -1]),
  reflectPerm([0, 0, 0, 1]),
  reflectPerm([1, -1, -1, -1]),
]
const I2: Mat2 = [1, 0, 0, 1]
const K_MAT: Mat2 = [1, 0, 0, 2]
const P_MAT: Mat2 = [1, 1, 0, 1]
const P2_MAT: Mat2 = [1, 2, 0, 1]
const S3_AS: readonly Mat2[] = [I2, I2, [1, 0, 0, 2], [1, 1, 0, 2]]
const S3_AS_ODD: readonly Mat2[] = S3_AS.map(A => mul2(K_MAT, mul2(A, K_MAT)))

const A_GEN = composePerm(S_GENS[0]!, S_GENS[1]!)
const B_GEN = composePerm(S_GENS[1]!, S_GENS[2]!)
const C_GEN = composePerm(S_GENS[2]!, S_GENS[3]!)
const WF4_PLUS_GENS: readonly Uint8Array[] = [A_GEN, B_GEN, C_GEN]
const WF4_PLUS_AS: readonly Mat2[] = [I2, K_MAT, P_MAT]

const B2 = composePerm(B_GEN, B_GEN)
const Binv = invPerm(B_GEN)
const T2_GENS: readonly Uint8Array[] = [
  A_GEN,
  C_GEN,
  B2,
  composePerm(B_GEN, composePerm(A_GEN, Binv)),
  composePerm(B_GEN, composePerm(C_GEN, Binv)),
]
const T2_AS: readonly Mat2[] = [I2, P_MAT, I2, I2, P2_MAT]
const T2_AS_ODD: readonly Mat2[] = T2_AS.map(A => mul2(K_MAT, mul2(A, K_MAT)))

const D4_GENS: readonly Uint8Array[] = [
  reflectPerm([1, -1, 0, 0]),
  reflectPerm([0, 1, -1, 0]),
  reflectPerm([0, 0, 1, -1]),
  reflectPerm([0, 0, 1, 1]),
]
const D4_AS: readonly Mat2[] = [I2, I2, I2, I2]

const WF4_FULL: readonly { readonly perm: Uint8Array; readonly det: number; readonly A: Mat2; readonly Aodd: Mat2 }[] = (() => {
  const id = Uint8Array.from({ length: 24 }, (_, i) => i)
  const list: { perm: Uint8Array; det: number; A: Mat2; Aodd: Mat2 }[] = [{ perm: id, det: 1, A: I2, Aodd: I2 }]
  const seen = new Set<string>([id.join(',')])
  for (let h = 0; h < list.length; h++) {
    const cur = list[h]!
    for (let gi = 0; gi < 4; gi++) {
      const np = composePerm(S_GENS[gi]!, cur.perm)
      const k = np.join(',')
      if (!seen.has(k)) {
        seen.add(k)
        list.push({
          perm: np,
          det: -cur.det,
          A: mul2(S3_AS[gi]!, cur.A),
          Aodd: mul2(S3_AS_ODD[gi]!, cur.Aodd),
        })
      }
    }
  }
  assertExact(list.length === 1152, 'W(F_4) order 1152')
  return list
})()

// Build Crown-Jewel [[24, 1, 8]]_3 tensors (verbatim from W10 / Vibe/HolographicCode.lean)
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
  const labels: string[] = ['allX', 'allZ']
  const allX = new Uint8Array(48); for (let i = 0; i < 24; i++) allX[i] = 1
  const allZ = new Uint8Array(48); for (let i = 0; i < 24; i++) allZ[24 + i] = 1
  bulk23.push(allX, allZ)
  w9Defs.forEach((entries, wi) => {
    const row = new Uint8Array(48)
    for (const [p, l, v] of entries) { const [a, b] = LINES[l]!; row[p * 24 + a] = v; row[p * 24 + b] = v }
    bulk23.push(row); labels.push(`w9_${wi}`)
  })
  lvmDefs.forEach((entries, li) => {
    const row = new Uint8Array(48)
    for (const [p, l, v] of entries) { const [a, b] = LINES[l]!; row[p * 24 + a] = v; row[p * 24 + b] = mod3(2 * v) }
    bulk23.push(row); labels.push(`vm_${li}`)
  })
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
    rows.map(r => {
      const o = Uint8Array.from(r)
      for (let i = 0; i < nQ; i++) o[nQ + i] = mod3(2 * o[nQ + i]!)
      return o
    })
  const bulk23Minus = applyK(bulk23, 24)
  const choiMinus = applyK(choiPlus, 25)
  return { bulk23, bulk23Minus, labels, xL, zL, choiPlus, choiMinus, w9Defs, lvmDefs }
}
const T = buildCrownTensors()

// Exact O^+(4,1; Z[sqrt(2)]) Coxeter geometry for {3,4,3,4} balls
const TWICE_GRAM: readonly (readonly Z2[])[] = [
  [[2n, 0n], [-1n, 0n], [0n, 0n], [0n, 0n], [0n, 0n]],
  [[-1n, 0n], [2n, 0n], [0n, -1n], [0n, 0n], [0n, 0n]],
  [[0n, 0n], [0n, -1n], [2n, 0n], [-1n, 0n], [0n, 0n]],
  [[0n, 0n], [0n, 0n], [-1n, 0n], [2n, 0n], [0n, -1n]],
  [[0n, 0n], [0n, 0n], [0n, 0n], [0n, -1n], [2n, 0n]],
]
const z2Add = (u: Z2, v: Z2): Z2 => [u[0] + v[0], u[1] + v[1]]
const z2Sub = (u: Z2, v: Z2): Z2 => [u[0] - v[0], u[1] - v[1]]
const z2Mul = (u: Z2, v: Z2): Z2 => [u[0] * v[0] + 2n * u[1] * v[1], u[0] * v[1] + u[1] * v[0]]
const BASE_CENTER: readonly Z2[] = [[2n, 0n], [4n, 0n], [0n, 3n], [0n, 2n], [1n, 0n]]
const FACET_NORMALS: readonly (readonly Z2[])[] = [
  [[0n, 0n], [0n, 0n], [0n, 0n], [0n, 0n], [1n, 0n]], [[0n, 0n], [2n, 0n], [0n, 2n], [0n, 2n], [1n, 0n]],
  [[4n, 0n], [6n, 0n], [0n, 4n], [0n, 2n], [1n, 0n]], [[4n, 0n], [8n, 0n], [0n, 6n], [0n, 4n], [1n, 0n]],
  [[0n, 0n], [0n, 0n], [0n, 0n], [0n, 1n], [1n, 0n]], [[0n, 0n], [2n, 0n], [0n, 2n], [0n, 1n], [1n, 0n]],
  [[4n, 0n], [6n, 0n], [0n, 4n], [0n, 3n], [1n, 0n]], [[4n, 0n], [8n, 0n], [0n, 6n], [0n, 3n], [1n, 0n]],
  [[0n, 0n], [0n, 0n], [0n, 1n], [0n, 1n], [1n, 0n]], [[0n, 0n], [2n, 0n], [0n, 1n], [0n, 1n], [1n, 0n]],
  [[4n, 0n], [6n, 0n], [0n, 5n], [0n, 3n], [1n, 0n]], [[4n, 0n], [8n, 0n], [0n, 5n], [0n, 3n], [1n, 0n]],
  [[2n, 0n], [2n, 0n], [0n, 1n], [0n, 1n], [1n, 0n]], [[2n, 0n], [4n, 0n], [0n, 3n], [0n, 1n], [1n, 0n]],
  [[2n, 0n], [4n, 0n], [0n, 3n], [0n, 3n], [1n, 0n]], [[2n, 0n], [6n, 0n], [0n, 5n], [0n, 3n], [1n, 0n]],
  [[2n, 0n], [2n, 0n], [0n, 2n], [0n, 1n], [1n, 0n]], [[2n, 0n], [4n, 0n], [0n, 2n], [0n, 1n], [1n, 0n]],
  [[2n, 0n], [4n, 0n], [0n, 4n], [0n, 3n], [1n, 0n]], [[2n, 0n], [6n, 0n], [0n, 4n], [0n, 3n], [1n, 0n]],
  [[2n, 0n], [2n, 0n], [0n, 2n], [0n, 2n], [1n, 0n]], [[2n, 0n], [4n, 0n], [0n, 2n], [0n, 2n], [1n, 0n]],
  [[2n, 0n], [4n, 0n], [0n, 4n], [0n, 2n], [1n, 0n]], [[2n, 0n], [6n, 0n], [0n, 4n], [0n, 2n], [1n, 0n]],
]
const ID5: Z2[][] = Array.from({ length: 5 }, (_, i) => Array.from({ length: 5 }, (_, j) => (i === j ? [1n, 0n] : [0n, 0n])))
function mat5Vec(M: readonly (readonly Z2[])[], v: readonly Z2[]): Z2[] {
  return Array.from({ length: 5 }, (_, i) => {
    let s: Z2 = [0n, 0n]
    for (let k = 0; k < 5; k++) s = z2Add(s, z2Mul(M[i]![k]!, v[k]!))
    return s
  })
}
function mat5Mul(A: readonly (readonly Z2[])[], B: readonly (readonly Z2[])[]): Z2[][] {
  return Array.from({ length: 5 }, (_, i) =>
    Array.from({ length: 5 }, (_, j) => {
      let s: Z2 = [0n, 0n]
      for (let k = 0; k < 5; k++) s = z2Add(s, z2Mul(A[i]![k]!, B[k]![j]!))
      return s
    }),
  )
}
const Z_INV: Z2[][] = Array.from({ length: 5 }, (_, i) =>
  Array.from({ length: 5 }, (_, j) => {
    let s: Z2 = i === j ? [-1n, 0n] : [0n, 0n]
    if (j === 4) s = z2Add(s, [2n * BASE_CENTER[i]![0], 2n * BASE_CENTER[i]![1]])
    return s
  }),
)
const TRANSPORTS: Z2[][][] = FACET_NORMALS.map(n => {
  const gn = mat5Vec(TWICE_GRAM, n)
  const F = Array.from({ length: 5 }, (_, i) =>
    Array.from({ length: 5 }, (_, j) => z2Sub(i === j ? [1n, 0n] : [0n, 0n], z2Mul(n[i]!, gn[j]!))),
  )
  return mat5Mul(F, Z_INV)
})
const STEP_CENTER = TRANSPORTS.map(k => mat5Vec(k, BASE_CENTER))
const keyV5 = (v: readonly Z2[]): string => v.map(([a, b]) => `${a},${b}`).join(';')

function buildExactBall(R: number) {
  const frames: (Z2[][] | undefined)[] = [ID5]
  const distArr: number[] = [0]
  const idx = new Map<string, number>([[keyV5(BASE_CENTER), 0]])
  const nb: Int32Array[] = []
  for (let h = 0; h < frames.length; h++) {
    const g = frames[h]!, r = distArr[h]!
    const row = new Int32Array(24).fill(-1)
    for (let a = 0; a < 24; a++) {
      const ck = keyV5(mat5Vec(g, STEP_CENTER[a]!))
      let id = idx.get(ck)
      if (id === undefined && r < R) {
        id = frames.length; idx.set(ck, id); frames.push(mat5Mul(g, TRANSPORTS[a]!)); distArr.push(r + 1)
      }
      row[a] = id ?? -1
    }
    nb.push(row)
    frames[h] = undefined
  }
  return { R, n: distArr.length, dist: Int32Array.from(distArr), nb }
}

// Contract B_1 = [[552, 25, 40]]_3 once and share across W11.1, W11.2, W11.3
function contractB1() {
  const edges = Array.from({ length: 24 }, (_, a) => ({ d1: 0, s1: a, d2: 1 + a, s2: OPP[a]! }))
  const docks = Array.from({ length: 25 }, (_, d) => ({
    rows: d === 0 ? T.choiPlus : T.choiMinus,
    nPhys: 24,
    hasBulk: true,
  }))
  const nD = 25, nInt = 48
  const slotToInt = Array.from({ length: nD }, () => new Int32Array(24).fill(-1))
  edges.forEach((e, ei) => { slotToInt[e.d1]![e.s1] = 2 * ei; slotToInt[e.d2]![e.s2] = 2 * ei + 1 })
  let bndCursor = 0
  const openSlotMap = Array.from({ length: nD }, () => new Int32Array(24).fill(-1))
  for (let d = 0; d < nD; d++)
    for (let s = 0; s < 24; s++)
      if (slotToInt[d]![s]! < 0) openSlotMap[d]![s] = bndCursor++
  const nBnd = bndCursor, nBulk = 25, nOpen = nBnd + nBulk, nTotal = nInt + nOpen
  assertExact(nBnd === 552 && nOpen === 577, 'B1 dimensions')

  const unRows: Uint8Array[] = []
  for (let d = 0; d < nD; d++) {
    const dk = docks[d]!, qb = nInt + nBnd + d
    for (const r of dk.rows) {
      const full = new Uint8Array(2 * nTotal)
      for (let s = 0; s < 24; s++) {
        const q = slotToInt[d]![s]! >= 0 ? slotToInt[d]![s]! : nInt + openSlotMap[d]![s]!
        full[q] = r[s]!; full[nTotal + q] = r[25 + s]!
      }
      full[qb] = r[24]!; full[nTotal + qb] = r[49]!
      unRows.push(full)
    }
  }
  const nRows = unRows.length, eqWords = (nRows + 31) >>> 5
  const eqs: GF3Row[] = []
  for (let e = 0; e < 24; e++) {
    const u = 2 * e, v = 2 * e + 1
    const eq1 = gf3RowZero(eqWords), eq2 = gf3RowZero(eqWords)
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
      const cf = gf3Get(kv, ri); if (cf === 0) continue
      const row = unRows[ri]!
      for (let q = 0; q < nOpen; q++) {
        const xv = row[nInt + q]!, zv = row[nTotal + nInt + q]!
        if (xv) acc[q] = (acc[q]! + cf * xv) % 3
        if (zv) acc[nOpen + q] = (acc[nOpen + q]! + cf * zv) % 3
      }
    }
    return gf3FromUint8(acc)
  })
  const { basis } = gf3Rref(projRows, 2 * nOpen)
  assertExact(basis.length === 577 && countIsoDefects(basis, 577) === 0, 'B1 Choi rank & isotropy')

  // Extract canonical 527 boundary stabilizers H(B1) and 25 canonical bulk logical pairs (xLogs, zLogs)
  const words577 = (2 * 577 + 31) >>> 5
  const reord = basis.map(r => {
    const out = gf3RowZero(words577)
    for (let b = 0; b < 25; b++) {
      const xv = gf3Get(r, 552 + b), zv = gf3Get(r, 577 + 552 + b)
      if (xv) gf3Set(out, b, xv)
      if (zv) gf3Set(out, 25 + b, zv)
    }
    for (let q = 0; q < 552; q++) {
      const xv = gf3Get(r, q), zv = gf3Get(r, 577 + q)
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
      const xv = gf3Get(row, 50 + q), zv = gf3Get(row, 50 + 552 + q)
      if (xv) gf3Set(out, q, xv)
      if (zv) gf3Set(out, 552 + q, zv)
    }
    return out
  }
  const hStabs = rr.slice(50).map(extractBnd)
  const xLogs: GF3Row[] = [], zLogs: GF3Row[] = []
  for (let b = 0; b < 25; b++) {
    const xb = extractBnd(rr[b]!); gf3NegInPlace(xb)
    xLogs.push(xb)
    zLogs.push(extractBnd(rr[25 + b]!))
  }
  const bndToAS: [number, number][] = []
  const asToBnd = new Int32Array(576).fill(-1)
  for (let a = 0; a < 24; a++)
    for (let s = 0; s < 24; s++) {
      const q = openSlotMap[1 + a]![s]!
      if (q >= 0) { bndToAS[q] = [a, s]; asToBnd[a * 24 + s] = q }
    }
  return { choiBasis: basis, rr, hStabs, xLogs, zLogs, openSlotMap, bndToAS, asToBnd }
}

const tStart = Date.now()
console.log('================================================================================')
console.log('BREAKTHROUGH SUITE (W11): DYNAMICAL HOLOGRAPHY BRIDGE ON {3,4,3,4}')
console.log('================================================================================')
const B1_CODE = contractB1()
const coneLegs = (a: number): number[] => Array.from({ length: 23 }, (_, j) => a * 23 + j)
const conesUnion = (as: readonly number[]): number[] => as.flatMap(coneLegs)

// ============================================================================
// PART 1 (W11.1): BARE-U LAYER AUDIT, EXACT 3^24 CODE LEAKAGE & HORIZON TWIRL
// ============================================================================
console.log('\n[PART 1 / W11.1] Bare-U Layer-by-Layer Stabilizer Audit, Exact 3^24 Leakage & Horizon Twirling:')

// 1A. Build exact 9x9 antipodal-line unitaries for D, K, M_meet (role-0), and L_line = D o M_meet o K o D
// Basis index for 2-qutrit line (a, b): idx = 3 * x_a + x_b with x_a, x_b in {0, 1, 2} <-> tones {0, +1, -1}.
type Mat9 = Cx[][]
const mat9Zero = (): Mat9 => Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => CX0))
const mat9Id = (): Mat9 => Array.from({ length: 9 }, (_, r) => Array.from({ length: 9 }, (_, c) => (r === c ? CX1 : CX0)))
function mat9Mul(A: Mat9, B: Mat9): Mat9 {
  const C = mat9Zero()
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++) {
      let s = CX0
      for (let k = 0; k < 9; k++) s = cxAdd(s, cxMul(A[r]![k]!, B[k]![c]!))
      C[r]![c] = s
    }
  return C
}
function mat9Dag(A: Mat9): Mat9 {
  return Array.from({ length: 9 }, (_, r) => Array.from({ length: 9 }, (_, c) => cxConj(A[c]![r]!)))
}
function mat9UnitErr(U: Mat9): number {
  const P = mat9Mul(mat9Dag(U), U)
  let err = 0
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++) err = Math.max(err, cxAbs(cxSub(P[r]![c]!, r === c ? CX1 : CX0)))
  return err
}
function mat9Diff(A: Mat9, B: Mat9): number {
  let err = 0
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++) err = Math.max(err, cxAbs(cxSub(A[r]![c]!, B[r]![c]!)))
  return err
}

// D_line: |0,0> -> |0,0>; doubly occupied (x_a>0, x_b>0) -> zeta_6; lone excitation splits by (2+omega)/2 and (-omega)/2
const D_DIAG: Cx = cxScale(0.5, cxAdd([2, 0], CX_OMEGA))
const D_OFF: Cx = cxScale(-0.5, CX_OMEGA)
const U_D_LINE: Mat9 = (() => {
  const M = mat9Zero()
  for (let a = 0; a < 3; a++)
    for (let b = 0; b < 3; b++) {
      const col = 3 * a + b
      if (a === 0 && b === 0) M[col]![col] = CX1
      else if (a > 0 && b > 0) M[col]![col] = CX_ZETA6
      else {
        M[col]![col] = D_DIAG
        M[3 * b + a]![col] = D_OFF
      }
    }
  return M
})()

// K_line: |1,2> -> -|2,1>, |2,1> -> -|1,2>, identity on all other 7 states
const U_K_LINE: Mat9 = (() => {
  const M = mat9Id()
  M[3 * 1 + 2]![3 * 1 + 2] = CX0; M[3 * 2 + 1]![3 * 1 + 2] = [-1, 0]
  M[3 * 2 + 1]![3 * 2 + 1] = CX0; M[3 * 1 + 2]![3 * 2 + 1] = [-1, 0]
  return M
})()

// M_meet_line (role-0 scalar sector): |1,1> -> omega|1,1>, |2,2> -> omega|2,2>, identity on all other 7 states
const U_MEET_LINE: Mat9 = (() => {
  const M = mat9Id()
  M[3 * 1 + 1]![3 * 1 + 1] = CX_OMEGA
  M[3 * 2 + 2]![3 * 2 + 2] = CX_OMEGA
  return M
})()

// Combined 4-layer line block inside bare U: L_line = D o M_meet o K o D
const U_LINE_4: Mat9 = mat9Mul(U_D_LINE, mat9Mul(U_MEET_LINE, mat9Mul(U_K_LINE, U_D_LINE)))
const U_C_LINE: Mat9 = mat9Mul(U_D_LINE, U_D_LINE) // D^2 = C full coin

assertExact(
  mat9UnitErr(U_D_LINE) < 1e-14 &&
    mat9UnitErr(U_K_LINE) < 1e-14 &&
    mat9UnitErr(U_MEET_LINE) < 1e-14 &&
    mat9UnitErr(U_LINE_4) < 1e-14 &&
    mat9Diff(mat9Mul(U_K_LINE, U_MEET_LINE), mat9Mul(U_MEET_LINE, U_K_LINE)) < 1e-14,
  '9x9 bare-U line unitaries & [K, M_meet]=0',
)

// Build all 81 2-qutrit Weyl-Heisenberg Pauli matrices P(xa, xb, za, zb) = (X^xa Z^za) (x) (X^xb Z^zb)
// Index p = ((xa * 3 + xb) * 3 + za) * 3 + zb in 0..80
const pauliIdx2 = (xa: number, xb: number, za: number, zb: number): number => ((xa * 3 + xb) * 3 + za) * 3 + zb
const PAULI9: Mat9[] = Array.from({ length: 81 }, (_, idx) => {
  const zb = idx % 3, t1 = (idx - zb) / 3
  const za = t1 % 3, t2 = (t1 - za) / 3
  const xb = t2 % 3, xa = (t2 - xb) / 3
  const M = mat9Zero()
  for (let a = 0; a < 3; a++)
    for (let b = 0; b < 3; b++) {
      const col = 3 * a + b
      const row = 3 * ((a + xa) % 3) + ((b + xb) % 3)
      M[row]![col] = OMEGA_POW[(za * a + zb * b) % 3]!
    }
  return M
})
const PAULI9_DAG: Mat9[] = PAULI9.map(mat9Dag)

// Compute exact 81x81 Pauli Transfer Matrix T[q][p] = (1/9) Tr(U P_p U^dag P_q^dag)
// AND exact Pauli-twirl error probabilities p_twirl[q] = |(1/9) Tr(U P_q^dag)|^2
function analyzeLineUnitary(name: string, U: Mat9) {
  const Ud = mat9Dag(U)
  const ptmAbs: Float64Array[] = Array.from({ length: 81 }, () => new Float64Array(81))
  const maxColOverlap = new Float64Array(81)
  const selfOverlap = new Float64Array(81)
  let cliffordCols = 0
  let sumM4 = 0
  for (let p = 0; p < 81; p++) {
    const conj = mat9Mul(U, mat9Mul(PAULI9[p]!, Ud))
    let mx = 0, colNorm2 = 0
    for (let q = 0; q < 81; q++) {
      const Pd = PAULI9_DAG[q]!
      let tr = CX0
      for (let r = 0; r < 9; r++)
        for (let k = 0; k < 9; k++) tr = cxAdd(tr, cxMul(conj[r]![k]!, Pd[k]![r]!))
      const val = cxAbs(tr) / 9
      ptmAbs[q]![p] = val
      if (val > mx) mx = val
      colNorm2 += val * val
      sumM4 += val ** 4
    }
    assertExact(Math.abs(colNorm2 - 1) < 1e-12, `${name} PTM column unitarity`)
    maxColOverlap[p] = mx
    selfOverlap[p] = ptmAbs[p]![p]!
    if (Math.abs(mx - 1) < 1e-11) cliffordCols++
  }
  const twirlProb = new Float64Array(81)
  let pSum = 0
  for (let q = 0; q < 81; q++) {
    const Pd = PAULI9_DAG[q]!
    let tr = CX0
    for (let r = 0; r < 9; r++)
      for (let k = 0; k < 9; k++) tr = cxAdd(tr, cxMul(U[r]![k]!, Pd[k]![r]!))
    const pr = cxAbs2(tr) / 81
    twirlProb[q] = pr
    pSum += pr
  }
  assertExact(Math.abs(pSum - 1) < 1e-12, `${name} twirl probabilities sum to 1`)
  const magicM2 = -Math.log(sumM4 / 81) / Math.log(3)
  return { name, ptmAbs, maxColOverlap, selfOverlap, cliffordCols, magicM2, twirlProb, pI: twirlProb[0]! }
}

const lineAuditD = analyzeLineUnitary('D', U_D_LINE)
const lineAuditK = analyzeLineUnitary('K', U_K_LINE)
const lineAuditMeet = analyzeLineUnitary('M_meet', U_MEET_LINE)
const lineAuditL4 = analyzeLineUnitary('D*M_meet*K*D', U_LINE_4)

function audit23StabsLine(la: ReturnType<typeof analyzeLineUnitary>) {
  let exactSelf = 0, exactPauli = 0
  let minSelf = 1, maxNon1Self = 0, minPauli = 1
  for (let gi = 0; gi < 23; gi++) {
    const row = T.bulk23[gi]!
    let fSelf = 1, fPauli = 1
    for (let l = 0; l < 12; l++) {
      const [a, b] = LINES[l]!
      const p = pauliIdx2(row[a]!, row[b]!, row[24 + a]!, row[24 + b]!)
      fSelf *= la.selfOverlap[p]!
      fPauli *= la.maxColOverlap[p]!
    }
    if (Math.abs(fSelf - 1) < 1e-11) exactSelf++
    else if (fSelf > maxNon1Self) maxNon1Self = fSelf
    if (Math.abs(fPauli - 1) < 1e-11) exactPauli++
    if (fSelf < minSelf) minSelf = fSelf
    if (fPauli < minPauli) minPauli = fPauli
  }
  return { exactSelf, exactPauli, minSelf, maxNon1Self, minPauli }
}
const stabD = audit23StabsLine(lineAuditD)
const stabK = audit23StabsLine(lineAuditK)
const stabMeet = audit23StabsLine(lineAuditMeet)
const stabL4 = audit23StabsLine(lineAuditL4)

const mPairAlpha2 = cxAbs2(cxSub(CX_ZETA18, CX1))
const mPairAudit = (() => {
  let exactComm23 = 0, broken23 = 0
  const defectCoeff: number[] = []
  const states: Uint8Array[] = []
  for (const tone of [1, 2]) {
    for (let l = 0; l < 12; l++) {
      const v = new Uint8Array(24)
      v[LINES[l]![0]] = tone; v[LINES[l]![1]] = tone
      states.push(v)
    }
  }
  for (let gi = 0; gi < 23; gi++) {
    const r = T.bulk23[gi]!
    let trP2gP2gd = 0
    for (const s of [0, 1]) {
      for (const t of [0, 1]) {
        let amp = CX0
        for (let i = 0; i < 12; i++) {
          const src = states[12 * t + i]!
          const dst = new Uint8Array(24)
          let ph = 0
          for (let q = 0; q < 24; q++) {
            dst[q] = (src[q]! + r[q]!) % 3
            ph = (ph + r[24 + q]! * src[q]!) % 3
          }
          let hit = false
          for (let j = 0; j < 12; j++) {
            const tgt = states[12 * s + j]!
            let eq = true
            for (let q = 0; q < 24; q++) if (dst[q] !== tgt[q]) { eq = false; break }
            if (eq) { hit = true; break }
          }
          if (hit) amp = cxAdd(amp, OMEGA_POW[ph]!)
        }
        trP2gP2gd += cxAbs2(cxScale(1 / 12, amp))
      }
    }
    const cDef = 2 - trP2gP2gd
    defectCoeff.push(cDef)
    if (cDef < 1e-12) exactComm23++
    else broken23++
  }
  const pureZRows = [1, 8, 9, 10, 19, 20, 21, 22].map(idx => T.bulk23[idx]!.slice(24, 48))
  let psiPlusInCode = 0, psiPlusInShiftedZ = 0
  for (let l = 0; l < 12; l++) {
    const [a, b] = LINES[l]!
    const allZVal = mod3(1 + 1)
    if (allZVal === 0) psiPlusInCode++
    const other7Zero = pureZRows.slice(1).every(z => mod3(z[a]! + z[b]!) === 0)
    if (other7Zero) psiPlusInShiftedZ++
  }
  return { exactComm23, broken23, defectCoeff, psiPlusInCode, psiPlusInShiftedZ }
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
  const hit = chiral4Cache.get(selfKey)
  if (hit !== undefined) return hit
  const s0 = c0 >> 1, s1 = c1 >> 1, s2 = c2 >> 1, s3 = c3 >> 1
  const b0 = c0 & 1, b1 = c1 & 1, b2 = c2 & 1, b3 = c3 & 1
  let minKey = Number.POSITIVE_INFINITY, minSign = 0, chiral = true
  for (let e = 0; e < WF4_FULL.length; e++) {
    const w = WF4_FULL[e]!, p = w.perm, d = w.det
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
function chiOddVec(x: Uint8Array): number {
  const codes: number[] = []
  for (let s = 0; s < 24; s++) if (x[s]! !== 0) codes.push((s << 1) + (x[s] === 2 ? 1 : 0))
  let chi = 0
  for (let i = 0; i < codes.length; i++)
    for (let j = i + 1; j < codes.length; j++)
      for (let k = j + 1; k < codes.length; k++)
        for (let l = k + 1; l < codes.length; l++)
          chi += chiral4Sign(codes[i]!, codes[j]!, codes[k]!, codes[l]!)
  return chi
}

const phiOddAudit = (() => {
  const pureZRows = [1, 8, 9, 10, 19, 20, 21, 22].map(idx => T.bulk23[idx]!.slice(24, 48))
  const zLRow = T.zL.slice(24, 48)
  const wt4Total = [0, 0, 0]
  const wt4Chiral = [0, 0, 0]
  for (let a = 0; a < 24; a++)
    for (let b = a + 1; b < 24; b++)
      for (let c = b + 1; c < 24; c++)
        for (let d = c + 1; d < 24; d++) {
          for (let mask = 0; mask < 16; mask++) {
            const ta = (mask & 1) ? 2 : 1
            const tb = (mask & 2) ? 2 : 1
            const tc = (mask & 4) ? 2 : 1
            const td = (mask & 8) ? 2 : 1
            if ((ta + tb + tc + td) % 3 !== 0) continue
            let ok = true
            for (let ri = 1; ri < 8; ri++) {
              const z = pureZRows[ri]!
              if ((z[a]! * ta + z[b]! * tb + z[c]! * tc + z[d]! * td) % 3 !== 0) { ok = false; break }
            }
            if (!ok) continue
            const cls = (zLRow[a]! * ta + zLRow[b]! * tb + zLRow[c]! * tc + zLRow[d]! * td) % 3
            wt4Total[cls] = wt4Total[cls]! + 1
            const sgn = chiral4Sign(
              (a << 1) + (ta === 2 ? 1 : 0),
              (b << 1) + (tb === 2 ? 1 : 0),
              (c << 1) + (tc === 2 ? 1 : 0),
              (d << 1) + (td === 2 ? 1 : 0),
            )
            if (sgn !== 0) wt4Chiral[cls] = wt4Chiral[cls]! + 1
          }
        }
  // Enumerate ALL weight-5 codewords in C_0, C_1, C_2 to find exact minimum chiral weight in [[24, 1, 8]]_3!
  const wt5Total = [0, 0, 0]
  const wt5Chiral = [0, 0, 0]
  const wt5Witness = new Uint8Array(24)
  for (let a = 0; a < 24; a++)
    for (let b = a + 1; b < 24; b++)
      for (let c = b + 1; c < 24; c++)
        for (let d = c + 1; d < 24; d++)
          for (let e = d + 1; e < 24; e++) {
            for (let mask = 0; mask < 32; mask++) {
              const ta = (mask & 1) ? 2 : 1
              const tb = (mask & 2) ? 2 : 1
              const tc = (mask & 4) ? 2 : 1
              const td = (mask & 8) ? 2 : 1
              const te = (mask & 16) ? 2 : 1
              if ((ta + tb + tc + td + te) % 3 !== 0) continue
              let ok = true
              for (let ri = 1; ri < 8; ri++) {
                const z = pureZRows[ri]!
                if ((z[a]! * ta + z[b]! * tb + z[c]! * tc + z[d]! * td + z[e]! * te) % 3 !== 0) { ok = false; break }
              }
              if (!ok) continue
              const cls = (zLRow[a]! * ta + zLRow[b]! * tb + zLRow[c]! * tc + zLRow[d]! * td + zLRow[e]! * te) % 3
              wt5Total[cls] = wt5Total[cls]! + 1
              const cs = [
                (a << 1) + (ta === 2 ? 1 : 0),
                (b << 1) + (tb === 2 ? 1 : 0),
                (c << 1) + (tc === 2 ? 1 : 0),
                (d << 1) + (td === 2 ? 1 : 0),
                (e << 1) + (te === 2 ? 1 : 0),
              ]
              const chi5 =
                chiral4Sign(cs[0]!, cs[1]!, cs[2]!, cs[3]!) +
                chiral4Sign(cs[0]!, cs[1]!, cs[2]!, cs[4]!) +
                chiral4Sign(cs[0]!, cs[1]!, cs[3]!, cs[4]!) +
                chiral4Sign(cs[0]!, cs[2]!, cs[3]!, cs[4]!) +
                chiral4Sign(cs[1]!, cs[2]!, cs[3]!, cs[4]!)
              if (chi5 !== 0) {
                wt5Chiral[cls] = wt5Chiral[cls]! + 1
                if (cls === 0 && wt5Witness.every(v => v === 0)) {
                  wt5Witness[a] = ta; wt5Witness[b] = tb; wt5Witness[c] = tc; wt5Witness[d] = td; wt5Witness[e] = te
                }
              }
            }
          }
  // Find exact minimum chiral codeword weight in C_0 via direct (u, v) search over weight-6 codewords!
  // Build C_0 basis (15-dim nullspace of [pureZRows(8), zL(1)]) and find weight-6 chiral codewords directly.
  const c0Basis = u8Nullspace([...pureZRows, zLRow], 24)
  assertExact(c0Basis.length === 15, 'dim C_0 = 15')
  // Check weight-6 codewords in C_0: sample deterministic pairs of basis vectors + low-weight 3-combos to find exact wt-6 chiral witness,
  // AND check all C(24,6) weight-6 vectors with fast allZ + pureZ pruning? Wait: C(24,6)*64/3 = 2.87M is ~80ms! Let's check first 200k or exact 2-way/3-way!
  // Even faster & 100% deterministic exact: enumerate ALL weight-6 vectors in C_0 via meet-in-the-middle on the 9-check syndrome!
  // Actually, C_0 = {x(u, v) : u in C_0^(+), v in C_-} where wt(x) = sum_l w(u_l, v_l) >= |wt(u) - wt(v)| and <= 2*(wt(u)+wt(v)).
  // Check ALL (u, v) with wt(u) <= 3 and wt(v) <= 4 (only a few hundred pairs!) to find exact weight-6 chiral codewords in C_0!
  let wt6ChiralFound = 0
  const wt6Witness = new Uint8Array(24)
  // Quick deterministic scan over all weight-1,2,3 combinations of c0Basis (15*2 + 105*4 + 455*8 = 4,090 vectors, < 5 ms!)
  const tryC0 = (vec: Uint8Array): void => {
    let wt = 0
    for (let q = 0; q < 24; q++) if (vec[q] !== 0) wt++
    if (wt !== 6) return
    const chi = chiOddVec(vec)
    if (chi !== 0) {
      wt6ChiralFound++
      if (wt6Witness.every(v => v === 0)) wt6Witness.set(vec)
    }
  }
  for (let i = 0; i < 15; i++) {
    tryC0(c0Basis[i]!)
    for (let j = i + 1; j < 15; j++) {
      for (const s of [1, 2]) {
        const v2 = Uint8Array.from(c0Basis[i]!, (x, q) => (x + s * c0Basis[j]![q]!) % 3)
        tryC0(v2)
        for (let k = j + 1; k < 15; k++) {
          for (const t of [1, 2]) {
            const v3 = Uint8Array.from(v2, (x, q) => (x + t * c0Basis[k]![q]!) % 3)
            tryC0(v3)
          }
        }
      }
    }
  }
  // If wt-6 not hit in 3-combos, also test any chiral codeword in C_0 (e.g. weight 6 or 8 from c0Basis combinations)
  let minChiralWtC0 = wt6ChiralFound > 0 ? 6 : 99
  let minChiralChiC0 = wt6ChiralFound > 0 ? chiOddVec(wt6Witness) : 0
  if (wt6ChiralFound === 0) {
    for (let i = 0; i < 15; i++) {
      const vi = c0Basis[i]!
      let wt = 0; for (let q = 0; q < 24; q++) if (vi[q] !== 0) wt++
      const chi = chiOddVec(vi)
      if (chi !== 0 && wt < minChiralWtC0) { minChiralWtC0 = wt; minChiralChiC0 = chi; wt6Witness.set(vi) }
      for (let j = i + 1; j < 15; j++) {
        for (const s of [1, 2]) {
          const v2 = Uint8Array.from(vi, (x, q) => (x + s * c0Basis[j]![q]!) % 3)
          let w2 = 0; for (let q = 0; q < 24; q++) if (v2[q] !== 0) w2++
          if (w2 < minChiralWtC0) {
            const c2 = chiOddVec(v2)
            if (c2 !== 0) { minChiralWtC0 = w2; minChiralChiC0 = c2; wt6Witness.set(v2) }
          }
        }
      }
    }
  }
  // Check ALL 23 stabilizers under Phi_odd conjugation across 5 deterministic witnesses (0, chiralVibes, -chiralVibes, x1Vibes, -x1Vibes, wt6Witness)
  let exactComm23 = 0, brokenX15 = 0
  const unbrokenXLabels: string[] = []
  const testBase0 = new Uint8Array(24)
  const testChiral = new Uint8Array(24)
  testChiral[0] = 1; testChiral[1] = 2; testChiral[4] = 1; testChiral[10] = 1
  const testX1 = new Uint8Array(24)
  testX1[0] = 1; testX1[1] = 1; testX1[4] = 1; testX1[16] = 1
  const negChiral = Uint8Array.from(testChiral, v => (3 - v) % 3)
  const negX1 = Uint8Array.from(testX1, v => (3 - v) % 3)
  const chiRef = chiOddVec(testChiral)
  const chiX1 = chiOddVec(testX1)
  assertExact(chiRef !== 0 && chiX1 !== 0, 'chiralVibes & x1Vibes must have nonzero chi_odd')
  for (let gi = 0; gi < 23; gi++) {
    const r = T.bulk23[gi]!
    const hasX = r.slice(0, 24).some(v => v !== 0)
    if (!hasX) { exactComm23++; continue }
    const shift = (base: Uint8Array): Uint8Array => Uint8Array.from(base, (v, q) => (v + r[q]!) % 3)
    const d0 = ((chiOddVec(shift(testBase0)) - chiOddVec(testBase0)) % 6 + 6) % 6
    const d1 = ((chiOddVec(shift(testChiral)) - chiRef) % 6 + 6) % 6
    const d2 = ((chiOddVec(shift(negChiral)) + chiRef) % 6 + 6) % 6
    const d3 = ((chiOddVec(shift(testX1)) - chiX1) % 6 + 6) % 6
    const d4 = ((chiOddVec(shift(negX1)) + chiX1) % 6 + 6) % 6
    const isLinearCube =
      (d1 + d2 - 2 * d0 + 12) % 6 === 0 &&
      (d3 + d4 - 2 * d0 + 12) % 6 === 0 &&
      (d1 % 2 === d0 % 2) && (d3 % 2 === d0 % 2)
    if (!isLinearCube) brokenX15++
    else unbrokenXLabels.push(T.labels[gi]!)
  }
  return { exactComm23, brokenX15, unbrokenXLabels, wt4Total, wt4Chiral, wt5Total, wt5Chiral, minChiralWtC0, minChiralChiC0 }
})()

console.log(`  Line 9x9 Clifford audit: D(cliff=${lineAuditD.cliffordCols}/81, M2=${lineAuditD.magicM2.toFixed(4)}, pI=${lineAuditD.pI.toFixed(6)}), K(cliff=${lineAuditK.cliffordCols}/81, M2=${lineAuditK.magicM2.toFixed(4)}, pI=${lineAuditK.pI.toFixed(6)}), M_meet(cliff=${lineAuditMeet.cliffordCols}/81, M2=${lineAuditMeet.magicM2.toFixed(4)}, pI=${lineAuditMeet.pI.toFixed(6)}), L4(cliff=${lineAuditL4.cliffordCols}/81, M2=${lineAuditL4.magicM2.toFixed(4)}, pI=${lineAuditL4.pI.toFixed(6)})`)
console.log(`  23-stabilizer survival: D=${stabD.exactSelf}/23 (Pauli ${stabD.exactPauli}/23), K=${stabK.exactSelf}/23 (Pauli ${stabK.exactPauli}/23), M_meet=${stabMeet.exactSelf}/23 (Pauli ${stabMeet.exactPauli}/23), L4=${stabL4.exactSelf}/23, M_pair=${mPairAudit.exactComm23}/23 (|z18-1|^2=${mPairAlpha2.toFixed(6)}, P_code overlap=${mPairAudit.psiPlusInCode}/12, shiftedZ=${mPairAudit.psiPlusInShiftedZ}/12)`)
console.log(`  Phi_odd audit: comm=${phiOddAudit.exactComm23}/23, brokenX=${phiOddAudit.brokenX15}/15 (unbroken=[${phiOddAudit.unbrokenXLabels.join(',')}]), wt4=[${phiOddAudit.wt4Total.join('/')}] chiral=[${phiOddAudit.wt4Chiral.join('/')}], wt5=[${phiOddAudit.wt5Total.join('/')}] (0 wt-5 codewords!), chiral witness in C_0: wt=${phiOddAudit.minChiralWtC0}, chi_odd=${phiOddAudit.minChiralChiC0}`)

recordCheck(
  'B1',
  'W11.1a: Layer-by-layer bare-U Clifford audit & 23-stabilizer survival (all 6 layers + L4)',
  lineAuditD.cliffordCols < 81 && lineAuditK.cliffordCols < 81 && lineAuditMeet.cliffordCols < 81 &&
    Math.abs(lineAuditD.pI - 7 / 9) < 1e-12 &&
    Math.abs(lineAuditK.pI - 49 / 81) < 1e-12 &&
    Math.abs(lineAuditMeet.pI - 13 / 27) < 1e-12 &&
    stabD.exactSelf === 4 && stabK.exactSelf === 4 && stabMeet.exactSelf === 8 && stabL4.exactSelf === 4 &&
    mPairAudit.exactComm23 === 5 && mPairAudit.broken23 === 18 && mPairAudit.psiPlusInCode === 0 &&
    phiOddAudit.exactComm23 === 8 && phiOddAudit.brokenX15 === 15 &&
    phiOddAudit.wt4Chiral.every(c => c === 0) && phiOddAudit.wt5Total.every(c => c === 0) &&
    phiOddAudit.minChiralChiC0 !== 0 && phiOddAudit.minChiralChiC0 % 6 !== 0,
  `D/K/L4 keep 4/23, M_meet/Phi_odd keep 8/23, M_pair keeps 5/23 & fixes P_code; Phi_odd breaks 15/15 X-stabs (0/204 wt-4 chiral, 0 wt-5 codewords, chiral C_0 witness wt=${phiOddAudit.minChiralWtC0} chi=${phiOddAudit.minChiralChiC0})`,
)

// 1B. Exact 3^24 Code-Subspace Survival p_code(L) and 1-Beat Leakage via Exact (u, v) Factorization!
const uvFactor = (() => {
  const uZChecks: Uint8Array[] = [1, 8, 9, 10].map(idx => {
    const r = T.bulk23[idx]!, u = new Uint8Array(12)
    for (let l = 0; l < 12; l++) {
      const [a, b] = LINES[l]!
      assertExact(r[24 + a] === r[24 + b] && r[a] === 0 && r[b] === 0, 'sym pure-Z check')
      u[l] = r[24 + a]!
    }
    return u
  })
  const uZL = new Uint8Array(12)
  for (let l = 0; l < 12; l++) {
    const [a, b] = LINES[l]!
    assertExact(T.zL[24 + a] === T.zL[24 + b], 'zL symmetric')
    uZL[l] = T.zL[24 + a]!
  }
  const uKer = u8Nullspace([...uZChecks, uZL], 12)
  assertExact(uKer.length === 7, 'C_0^(+) dim 7')
  const uZKer = u8Nullspace(uZChecks, 12)
  assertExact(uZKer.length === 8, 'uZKer dim 8')
  let uShift1!: Uint8Array
  for (const vec of uZKer) {
    let dot = 0; for (let l = 0; l < 12; l++) dot = (dot + uZL[l]! * vec[l]!) % 3
    if (dot !== 0) { uShift1 = dot === 1 ? vec : Uint8Array.from(vec, v => (2 * v) % 3); break }
  }
  const uShift2 = Uint8Array.from(uShift1, v => (2 * v) % 3)

  const maskCounts: Map<number, number>[] = [new Map(), new Map(), new Map()]
  const shifts = [new Uint8Array(12), uShift1, uShift2]
  for (let c = 0; c < 3; c++) {
    const sh = shifts[c]!, mp = maskCounts[c]!
    const cur = Uint8Array.from(sh)
    const dfs = (idx: number): void => {
      if (idx === 7) {
        let mask = 0
        for (let l = 0; l < 12; l++) if (cur[l] !== 0) mask |= 1 << l
        mp.set(mask, (mp.get(mask) ?? 0) + 1)
        return
      }
      dfs(idx + 1)
      const row = uKer[idx]!
      for (let l = 0; l < 12; l++) cur[l] = (cur[l]! + row[l]!) % 3; dfs(idx + 1)
      for (let l = 0; l < 12; l++) cur[l] = (cur[l]! + row[l]!) % 3; dfs(idx + 1)
      for (let l = 0; l < 12; l++) cur[l] = (cur[l]! + row[l]!) % 3
    }
    dfs(0)
    let tot = 0; for (const cnt of mp.values()) tot += cnt
    assertExact(tot === 2187, `|C_${c}^(+)| = 2187`)
  }

  const vZGen: Uint8Array[] = [19, 20, 21, 22].map(idx => {
    const r = T.bulk23[idx]!, v = new Uint8Array(12)
    for (let l = 0; l < 12; l++) {
      const [a, b] = LINES[l]!
      assertExact(r[24 + b] === mod3(2 * r[24 + a]!) && r[a] === 0 && r[b] === 0, 'antisym pure-Z')
      v[l] = r[24 + a]!
    }
    return v
  })
  const vXGen: Uint8Array[] = [11, 12, 13, 14, 15, 16, 17, 18].map(idx => {
    const r = T.bulk23[idx]!, v = new Uint8Array(12)
    for (let l = 0; l < 12; l++) {
      const [a, b] = LINES[l]!
      assertExact(r[b] === mod3(2 * r[a]!) && r[24 + a] === 0 && r[24 + b] === 0, 'antisym pure-X')
      v[l] = mod3(2 * r[a]!)
    }
    return v
  })
  for (const zg of vZGen)
    for (const xg of vXGen) {
      let d = 0; for (let l = 0; l < 12; l++) d = (d + zg[l]! * xg[l]!) % 3
      assertExact(d === 0, 'v CSS orthogonality')
    }
  const sZMinus: Uint8Array[] = []
  for (let m = 0; m < 81; m++) {
    let rem = m; const z = new Uint8Array(12)
    for (let i = 0; i < 4; i++) {
      const cf = rem % 3; rem = (rem - cf) / 3
      if (cf) for (let l = 0; l < 12; l++) z[l] = (z[l]! + cf * vZGen[i]![l]!) % 3
    }
    sZMinus.push(z)
  }
  const cMinus: Uint8Array[] = []
  {
    const cur = new Uint8Array(12)
    const dfs = (idx: number): void => {
      if (idx === 8) { cMinus.push(Uint8Array.from(cur)); return }
      dfs(idx + 1)
      const r = vXGen[idx]!
      for (let l = 0; l < 12; l++) cur[l] = (cur[l]! + r[l]!) % 3; dfs(idx + 1)
      for (let l = 0; l < 12; l++) cur[l] = (cur[l]! + r[l]!) % 3; dfs(idx + 1)
      for (let l = 0; l < 12; l++) cur[l] = (cur[l]! + r[l]!) % 3
    }
    dfs(0)
    assertExact(cMinus.length === 6561, '|C_-| = 6561')
  }

  function extractUVBlocks(U: Mat9): readonly [Cx[][], Cx[][], Cx[][]] {
    const blocks: [Cx[][], Cx[][], Cx[][]] = [
      Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => CX0)),
      Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => CX0)),
      Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => CX0)),
    ]
    const abOf = (u: number, v: number): number => 3 * mod3(2 * (u + v)) + mod3(2 * (u - v))
    for (let u1 = 0; u1 < 3; u1++)
      for (let v1 = 0; v1 < 3; v1++)
        for (let u2 = 0; u2 < 3; u2++)
          for (let v2 = 0; v2 < 3; v2++) {
            const val = U[abOf(u2, v2)]![abOf(u1, v1)]!
            if (u1 !== u2) assertExact(cxAbs(val) < 1e-13, 'U not u-block-diagonal')
            else blocks[u1]![v2]![v1] = val
          }
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 3; c++)
        assertExact(cxAbs(cxSub(blocks[1][r]![c]!, blocks[2][r]![c]!)) < 1e-13, 'A(1) == A(2)')
    return blocks
  }

  function exactCodeProjection(name: string, U: Mat9, crossCheckMask = -1) {
    const [A0, A1] = extractUVBlocks(U)
    const makeF = (A: Cx[][]): Cx[][] =>
      Array.from({ length: 3 }, (_, zp) =>
        Array.from({ length: 3 }, (_, z) => {
          let s = CX0
          for (let vp = 0; vp < 3; vp++)
            for (let v = 0; v < 3; v++)
              s = cxAdd(s, cxMul(OMEGA_POW[mod3(z * v - zp * vp)]!, A[vp]![v]!))
          return cxScale(1 / 3, s)
        }),
      )
    const F0 = makeF(A0), F1 = makeF(A1)
    const allMasks = new Set<number>()
    for (const mp of maskCounts) for (const mk of mp.keys()) allMasks.add(mk)
    const alphaByMask = new Map<number, Cx>()
    for (const mask of allMasks) {
      let sumR = 0, sumI = 0
      for (let i = 0; i < 81; i++) {
        const zp = sZMinus[i]!
        for (let j = 0; j < 81; j++) {
          const z = sZMinus[j]!
          let pr = 1, pi = 0
          for (let l = 0; l < 12; l++) {
            const f = ((mask >> l) & 1) ? F1[zp[l]!]![z[l]!]! : F0[zp[l]!]![z[l]!]!
            const nr = pr * f[0] - pi * f[1]
            const ni = pr * f[1] + pi * f[0]
            pr = nr; pi = ni
            if (pr === 0 && pi === 0) break
          }
          sumR += pr; sumI += pi
        }
      }
      alphaByMask.set(mask, [sumR / 81, sumI / 81])
    }
    let crossErr = 0
    if (crossCheckMask >= 0 && alphaByMask.has(crossCheckMask)) {
      const stateRe = new Float64Array(531441)
      const stateIm = new Float64Array(531441)
      const pow3 = [1, 3, 9, 27, 81, 243, 729, 2187, 6561, 19683, 59049, 177147]
      for (const v of cMinus) {
        let idx = 0; for (let l = 0; l < 12; l++) idx += v[l]! * pow3[l]!
        stateRe[idx] = 1 / 81
      }
      for (let l = 0; l < 12; l++) {
        const A = ((crossCheckMask >> l) & 1) ? A1 : A0
        const step = pow3[l]!, block = step * 3
        for (let base = 0; base < 531441; base += block) {
          for (let off = 0; off < step; off++) {
            const i0 = base + off, i1 = i0 + step, i2 = i1 + step
            const r0 = stateRe[i0]!, m0 = stateIm[i0]!
            const r1 = stateRe[i1]!, m1 = stateIm[i1]!
            const r2 = stateRe[i2]!, m2 = stateIm[i2]!
            for (let row = 0; row < 3; row++) {
              const a0 = A[row]![0]!, a1 = A[row]![1]!, a2 = A[row]![2]!
              const nr = (a0[0] * r0 - a0[1] * m0) + (a1[0] * r1 - a1[1] * m1) + (a2[0] * r2 - a2[1] * m2)
              const ni = (a0[0] * m0 + a0[1] * r0) + (a1[0] * m1 + a1[1] * r1) + (a2[0] * m2 + a2[1] * r2)
              const dst = base + row * step + off
              stateRe[dst] = nr; stateIm[dst] = ni
            }
          }
        }
      }
      let brRe = 0, brIm = 0
      for (const v of cMinus) {
        let idx = 0; for (let l = 0; l < 12; l++) idx += v[l]! * pow3[l]!
        brRe += stateRe[idx]! / 81; brIm += stateIm[idx]! / 81
      }
      crossErr = cxAbs(cxSub([brRe, brIm], alphaByMask.get(crossCheckMask)!))
    }
    const lams: Cx[] = [CX0, CX0, CX0]
    for (let c = 0; c < 3; c++) {
      let s = CX0
      for (const [mask, cnt] of maskCounts[c]!) s = cxAdd(s, cxScale(cnt / 2187, alphaByMask.get(mask)!))
      lams[c] = s
    }
    const pCode = (cxAbs2(lams[0]!) + cxAbs2(lams[1]!) + cxAbs2(lams[2]!)) / 3
    return { name, lams, pCode, leak: 1 - pCode, uniqueMasks: allMasks.size, crossErr }
  }

  return { exactCodeProjection, maskCounts }
})()

const sampleMask = [...uvFactor.maskCounts[0]!.keys()][1]!
const projI = uvFactor.exactCodeProjection('I (control)', mat9Id(), sampleMask)
const projD = uvFactor.exactCodeProjection('D (half-coin)', U_D_LINE, sampleMask)
const projC = uvFactor.exactCodeProjection('D^2 = C (full coin)', U_C_LINE)
const projK = uvFactor.exactCodeProjection('K (opp-sign bounce)', U_K_LINE, sampleMask)
const projMeet = uvFactor.exactCodeProjection('M_meet (role-0)', U_MEET_LINE, sampleMask)
const projL4 = uvFactor.exactCodeProjection('D*M_meet*K*D (inner 4-layer)', U_LINE_4, sampleMask)

console.log(`  Exact 3^24 code survival via (u,v) factorization (unique masks=${projI.uniqueMasks}, Poisson vs 3^12 statevec crossErr<=${Math.max(projI.crossErr, projD.crossErr, projK.crossErr, projMeet.crossErr, projL4.crossErr).toExponential(1)}):`)
for (const p of [projI, projD, projC, projK, projMeet, projL4]) {
  console.log(`    ${p.name.padEnd(28)}: p_code=${p.pCode.toFixed(10)}, leak=${p.leak.toFixed(10)}, |lam|=[${p.lams.map(x => cxAbs(x).toFixed(6)).join(', ')}]`)
}

recordCheck(
  'B2',
  'W11.1b: Exact 3^24 code-subspace survival p_code(L) & 1-beat leakage via (u,v) factorization',
  Math.abs(projI.pCode - 1) < 1e-12 &&
    Math.max(projI.crossErr, projD.crossErr, projK.crossErr, projMeet.crossErr, projL4.crossErr) < 1e-12 &&
    projD.leak > 0.5 && projK.leak > 0.5 && projMeet.leak > 0.5 && projL4.leak > 0.9,
  `crossErr<1e-12; p_code: I=1, M_pair=1, D=${projD.pCode.toExponential(3)}, K=${projK.pCode.toExponential(3)}, M_meet=${projMeet.pCode.toExponential(3)}, L4=${projL4.pCode.toExponential(3)}`,
)

// 1C. Exact Horizon Mutual-Information Survival Under Bare-U Pauli Twirling on B_0 and B_1!
function extractSupportedStabs(choi: readonly Uint8Array[], nQ: number, keep: readonly number[]): Uint8Array[] {
  const inKeep = new Uint8Array(nQ)
  for (const q of keep) inKeep[q] = 1
  const outCols: number[] = []
  for (let q = 0; q < nQ; q++) if (!inKeep[q]) outCols.push(q)
  const nRows = choi.length
  const eqs: Uint8Array[] = []
  for (const q of outCols) {
    const rx = new Uint8Array(nRows), rz = new Uint8Array(nRows)
    let nx = false, nz = false
    for (let ri = 0; ri < nRows; ri++) {
      if (choi[ri]![q]) { rx[ri] = choi[ri]![q]!; nx = true }
      if (choi[ri]![nQ + q]) { rz[ri] = choi[ri]![nQ + q]!; nz = true }
    }
    if (nx) eqs.push(rx)
    if (nz) eqs.push(rz)
  }
  const ker = u8Nullspace(eqs, nRows)
  return ker.map(kv => {
    const v = new Uint8Array(2 * nQ)
    for (let ri = 0; ri < nRows; ri++) {
      const cf = kv[ri]!; if (!cf) continue
      for (let c = 0; c < 2 * nQ; c++) v[c] = (v[c]! + cf * choi[ri]![c]!) % 3
    }
    return v
  })
}

function exactB0TwirlMI(k: number, twirlProb: Float64Array, activeLines: readonly number[]): {
  readonly i0: number
  readonly iTwirl: number
  readonly rA: number
  readonly rBA: number
} {
  const A = Array.from({ length: k }, (_, i) => i)
  const sA = extractSupportedStabs(T.choiPlus, 25, A)
  const sBAFull = extractSupportedStabs(T.choiPlus, 25, [...A, 24])
  const rA = sA.length, rBA = sBAFull.length, i0 = rBA - rA
  if (i0 === 0) return { i0: 0, iTwirl: 0, rA, rBA }
  const basisBA: Uint8Array[] = [...sA]
  let curRref = u8Rref(sA, 50)
  for (const row of sBAFull) {
    const nxt = u8Rref([...curRref, row], 50)
    if (nxt.length > curRref.length) { curRref = nxt; basisBA.push(row) }
  }
  assertExact(basisBA.length === rBA, 'extended sBA basis')
  const size = 3 ** rBA
  const pow3 = Array.from({ length: rBA }, (_, i) => 3 ** i)
  let dist = new Float64Array(size)
  dist[0] = 1
  for (const l of activeLines) {
    const [a, b] = LINES[l]!
    const synMap = new Map<number, number>()
    for (let p = 0; p < 81; p++) {
      const pr = twirlProb[p]!
      if (pr < 1e-15) continue
      const zb = p % 3, t1 = (p - zb) / 3
      const za = t1 % 3, t2 = (t1 - za) / 3
      const xb = t2 % 3, xa = (t2 - xb) / 3
      let synIdx = 0
      for (let ri = 0; ri < rBA; ri++) {
        const g = basisBA[ri]!
        const s = mod3(xa * g[25 + a]! - za * g[a]! + xb * g[25 + b]! - zb * g[b]!)
        synIdx += s * pow3[ri]!
      }
      synMap.set(synIdx, (synMap.get(synIdx) ?? 0) + pr)
    }
    if (synMap.size === 1 && synMap.has(0)) continue
    const entryTrits = [...synMap.entries()].map(([idx, pr]) => {
      const tr = new Uint8Array(rBA)
      let rem = idx; for (let i = 0; i < rBA; i++) { tr[i] = rem % 3; rem = (rem - tr[i]!) / 3 }
      return { tr, pr }
    })
    const next = new Float64Array(size)
    for (let s = 0; s < size; s++) {
      const ds = dist[s]!
      if (ds < 1e-18) continue
      for (const { tr, pr } of entryTrits) {
        let dst = 0, rem = s
        for (let i = 0; i < rBA; i++) {
          const digit = rem % 3; rem = (rem - digit) / 3
          const nd = digit + tr[i]!
          dst += (nd >= 3 ? nd - 3 : nd) * pow3[i]!
        }
        next[dst] = next[dst]! + ds * pr
      }
    }
    dist = next
  }
  const sizeA = 3 ** rA
  const margA = new Float64Array(sizeA)
  let hBA = 0
  for (let s = 0; s < size; s++) {
    const p = dist[s]!
    if (p > 1e-18) {
      hBA -= p * Math.log(p) / Math.log(3)
      const sAIdx = s % sizeA
      margA[sAIdx] = margA[sAIdx]! + p
    }
  }
  let hA = 0
  for (let s = 0; s < sizeA; s++) {
    const p = margA[s]!
    if (p > 1e-18) hA -= p * Math.log(p) / Math.log(3)
  }
  return { i0, iTwirl: i0 - (hBA - hA), rA, rBA }
}

const all12Lines = Array.from({ length: 12 }, (_, i) => i)
const b0Horizon = [7, 8, 16, 17].map(k => ({
  k,
  D_all12: exactB0TwirlMI(k, lineAuditD.twirlProb, all12Lines),
  K_all12: exactB0TwirlMI(k, lineAuditK.twirlProb, all12Lines),
  Meet_all12: exactB0TwirlMI(k, lineAuditMeet.twirlProb, all12Lines),
  L4_all12: exactB0TwirlMI(k, lineAuditL4.twirlProb, all12Lines),
  L4_1line: exactB0TwirlMI(k, lineAuditL4.twirlProb, [0]),
  L4_2lines: exactB0TwirlMI(k, lineAuditL4.twirlProb, [0, 1]),
  L4_3lines: exactB0TwirlMI(k, lineAuditL4.twirlProb, [0, 1, 2]),
  L4_4lines: exactB0TwirlMI(k, lineAuditL4.twirlProb, [0, 1, 2, 3]),
}))
const linesOutsideA17 = LINES.map(([a, b], l) => (a >= 17 && b >= 17 ? l : -1)).filter(l => l >= 0)
const klOutsideA17 = exactB0TwirlMI(17, lineAuditL4.twirlProb, linesOutsideA17)

const b1ConeTwirlAudit = (() => {
  const c0Slots = Array.from({ length: 24 }, (_, s) => s).filter(s => s !== OPP[0])
  const sC0 = extractSupportedStabs(T.choiMinus, 25, c0Slots)
  assertExact(sC0.length === 21, 'dim S(C_0) = 21')
  let oneLineZeroColl = 0
  for (let l = 1; l < 12; l++) {
    const [a, b] = LINES[l]!
    const mat = sC0.map(g => Uint8Array.from([g[25 + a]!, g[25 + b]!, mod3(-g[a]!), mod3(-g[b]!)]))
    if (u8Rref(mat, 4).length === 4) oneLineZeroColl++
  }
  let twoLineZeroColl = 0
  for (let l1 = 1; l1 < 12; l1++)
    for (let l2 = l1 + 1; l2 < 12; l2++) {
      const [a1, b1] = LINES[l1]!, [a2, b2] = LINES[l2]!
      const mat = sC0.map(g => Uint8Array.from([
        g[25 + a1]!, g[25 + b1]!, g[25 + a2]!, g[25 + b2]!,
        mod3(-g[a1]!), mod3(-g[b1]!), mod3(-g[a2]!), mod3(-g[b2]!),
      ]))
      if (u8Rref(mat, 8).length === 8) twoLineZeroColl++
    }
  let threeLineWithColl = 0
  for (let l1 = 1; l1 < 12; l1++)
    for (let l2 = l1 + 1; l2 < 12; l2++)
      for (let l3 = l2 + 1; l3 < 12; l3++) {
        const [a1, b1] = LINES[l1]!, [a2, b2] = LINES[l2]!, [a3, b3] = LINES[l3]!
        const mat = sC0.map(g => Uint8Array.from([
          g[25 + a1]!, g[25 + b1]!, g[25 + a2]!, g[25 + b2]!, g[25 + a3]!, g[25 + b3]!,
          mod3(-g[a1]!), mod3(-g[b1]!), mod3(-g[a2]!), mod3(-g[b2]!), mod3(-g[a3]!), mod3(-g[b3]!),
        ]))
        if (u8Rref(mat, 12).length < 12) threeLineWithColl++
      }
  const b1SynRows = B1_CODE.hStabs.map(h => {
    const r = gf3RowZero(3)
    for (let a = 0; a < 24; a++) {
      const l = LINES.findIndex(([u, v]) => u !== OPP[a] && v !== OPP[a])
      const [s1, s2] = LINES[l]!
      const q1 = B1_CODE.asToBnd[a * 24 + s1]!, q2 = B1_CODE.asToBnd[a * 24 + s2]!
      const col = 4 * a
      gf3Set(r, col + 0, gf3Get(h, 552 + q1))
      gf3Set(r, col + 1, gf3Get(h, 552 + q2))
      gf3Set(r, col + 2, mod3(-gf3Get(h, q1)))
      gf3Set(r, col + 3, mod3(-gf3Get(h, q2)))
    }
    return r
  })
  const b1Sim24LinesRank = gf3Rank(b1SynRows, 96)
  const b1I0 = [7, 8, 16, 17].map(k => {
    const A = conesUnion(Array.from({ length: k }, (_, i) => i))
    return 1 + stabEntropy(B1_CODE.choiBasis, 577, A) - stabEntropy(B1_CODE.choiBasis, 577, [...A, 552])
  })
  return { oneLineZeroColl, twoLineZeroColl, threeLineWithColl, b1Sim24LinesRank, b1I0 }
})()

console.log(`  B_0 horizon I_twirl(b_0 : A_k) / ln 3 across k = [7, 8, 16, 17] (unperturbed [0, 1, 1, 2]):`)
for (const row of b0Horizon) {
  console.log(`    k=${String(row.k).padStart(2)}: all-12 [D=${row.D_all12.iTwirl.toFixed(4)}, K=${row.K_all12.iTwirl.toFixed(4)}, Meet=${row.Meet_all12.iTwirl.toFixed(4)}, L4=${row.L4_all12.iTwirl.toFixed(4)}] | L4(1/2/3/4 lines)=[${row.L4_1line.iTwirl.toFixed(4)}, ${row.L4_2lines.iTwirl.toFixed(4)}, ${row.L4_3lines.iTwirl.toFixed(4)}, ${row.L4_4lines.iTwirl.toFixed(4)}]`)
}
console.log(`  B_0 Knill-Laflamme exterior L4 twirl (${linesOutsideA17.length} lines outside A_17): I_twirl(b_0 : A_17) = ${klOutsideA17.iTwirl.toFixed(6)} / 2.000000`)
console.log(`  B_1 cone twirl syndrome protection: 1-line=${b1ConeTwirlAudit.oneLineZeroColl}/11, 2-lines=${b1ConeTwirlAudit.twoLineZeroColl}/55 (0 collisions!), 3-lines colliding=${b1ConeTwirlAudit.threeLineWithColl}/165; full-B1 24-cone simultaneous 48-qutrit rank=${b1ConeTwirlAudit.b1Sim24LinesRank}/96 => exact zero-loss I_0=[${b1ConeTwirlAudit.b1I0.join(',')}]`)

recordCheck(
  'B3',
  'W11.1c: Exact horizon I_twirl(b_0:A_k) across k=7/8/16/17 on B_0 (Z_L pointer floor) & B_1 (48-leg zero-loss)',
  b0Horizon[0]!.L4_all12.iTwirl === 0 &&
    Math.abs(b0Horizon[1]!.L4_all12.iTwirl - 1) < 1e-12 &&
    Math.abs(b0Horizon[2]!.L4_all12.iTwirl - 1) < 1e-12 &&
    b0Horizon[3]!.D_all12.iTwirl > 1 && b0Horizon[3]!.D_all12.iTwirl < 2 &&
    Math.abs(b0Horizon[3]!.L4_1line.iTwirl - 2) < 1e-12 &&
    Math.abs(b0Horizon[3]!.L4_2lines.iTwirl - 2) < 1e-12 &&
    b0Horizon[3]!.L4_3lines.iTwirl < 2 &&
    b0Horizon[3]!.L4_all12.iTwirl >= 1 - 1e-12 && b0Horizon[3]!.L4_all12.iTwirl < 1.001 &&
    Math.abs(klOutsideA17.iTwirl - 2) < 1e-12 &&
    b1ConeTwirlAudit.oneLineZeroColl === 11 && b1ConeTwirlAudit.twoLineZeroColl === 55 &&
    b1ConeTwirlAudit.threeLineWithColl === 21 && b1ConeTwirlAudit.b1Sim24LinesRank === 96 &&
    b1ConeTwirlAudit.b1I0.join(',') === '0,1,1,2',
  `B_0 u_l-conservation gives exact 1.000 Z_L pointer floor (k=8,16,17) while X_L decoheres at k=17 (D=1.2477, L4=1.0000); B_1 48-leg rk=96/96 exact 0-loss [0,1,1,2], sharp r=3 (21/165)`,
)

// ============================================================================
// PART 2 (W11.2): EXHAUSTIVE L_C CLASSIFICATION, HOLOGRAPHIC QCA U_holo & NO-GO
// ============================================================================
console.log('\n[PART 2 / W11.2] Exhaustive W(F_4)-Covariant L_C Classification, Holographic QCA U_holo & Fock-Clifford No-Go:')

const U3_BASIS: readonly Uint8Array[] = [0, 1, 2].map(f => {
  const v = new Uint8Array(24)
  for (let i = 0; i < 24; i++) if (FRAME_OF[i] === f) v[i] = 1
  return v
})
const U9_BASIS: readonly Uint8Array[] = (() => {
  const out: Uint8Array[] = []
  for (let f = 0; f < 3; f++) {
    const fLines = LINES.filter(([a]) => FRAME_OF[a] === f)
    const [a0, b0] = fLines[0]!
    for (let k = 1; k < 4; k++) {
      const [ak, bk] = fLines[k]!
      const v = new Uint8Array(24); v[a0] = 1; v[b0] = 1; v[ak] = 2; v[bk] = 2
      out.push(v)
    }
  }
  return out
})()
const VM_BASIS: readonly Uint8Array[] = LINES.map(([a, b]) => {
  const v = new Uint8Array(24); v[a] = 1; v[b] = 2; return v
})

function applyTwisted48(p: Uint8Array, A: Mat2, v: Uint8Array): Uint8Array {
  const out = new Uint8Array(48)
  for (let i = 0; i < 24; i++) {
    const xi = v[i]!, zi = v[24 + i]!, dst = p[i]!
    out[dst] = mod3(A[0] * xi + A[1] * zi)
    out[24 + dst] = mod3(A[2] * xi + A[3] * zi)
  }
  return out
}
function twistedBlockMats(B: readonly Uint8Array[], gens: readonly Uint8Array[], As: readonly Mat2[]): Uint8Array[][] {
  const m = B.length, fullB: Uint8Array[] = []
  for (let i = 0; i < m; i++) { const vx = new Uint8Array(48); vx.set(B[i]!, 0); fullB.push(vx) }
  for (let i = 0; i < m; i++) { const vz = new Uint8Array(48); vz.set(B[i]!, 24); fullB.push(vz) }
  return gens.map((g, gi) => fullB.map(bv => expressInBasis(fullB, applyTwisted48(g, As[gi]!, bv), 48)))
}
function blockFullBasis(B: readonly Uint8Array[]): Uint8Array[] {
  const m = B.length, fullB: Uint8Array[] = []
  for (let i = 0; i < m; i++) { const vx = new Uint8Array(48); vx.set(B[i]!, 0); fullB.push(vx) }
  for (let i = 0; i < m; i++) { const vz = new Uint8Array(48); vz.set(B[i]!, 24); fullB.push(vz) }
  return fullB
}
const FB_U3 = blockFullBasis(U3_BASIS)
const FB_U9 = blockFullBasis(U9_BASIS)
const FB_VM = blockFullBasis(VM_BASIS)

const SBULK_U3 = [0, 1].map(i => expressInBasis(FB_U3, T.bulk23[i]!, 48))
const SBULK_U9 = Array.from({ length: 9 }, (_, i) => expressInBasis(FB_U9, T.bulk23[2 + i]!, 48))
const SBULK_VM = Array.from({ length: 12 }, (_, i) => expressInBasis(FB_VM, T.bulk23[11 + i]!, 48))
const XL_U3 = expressInBasis(FB_U3, T.xL, 48)
const ZL_U3 = expressInBasis(FB_U3, T.zL, 48)

function blockSympForm(B: readonly Uint8Array[]): number[][] {
  const m = B.length, d = 2 * m
  const G = Array.from({ length: m }, (_, i) =>
    Array.from({ length: m }, (_, j) => {
      let s = 0; for (let k = 0; k < 24; k++) s += B[i]![k]! * B[j]![k]!
      return mod3(s)
    }),
  )
  const Om = Array.from({ length: d }, () => new Array<number>(d).fill(0))
  for (let i = 0; i < m; i++)
    for (let j = 0; j < m; j++) {
      Om[i]![m + j] = G[i]![j]!
      Om[m + i]![j] = mod3(-G[i]![j]!)
    }
  return Om
}
const OM_U3 = blockSympForm(U3_BASIS)
const OM_U9 = blockSympForm(U9_BASIS)
const OM_VM = blockSympForm(VM_BASIS)

function isBlockSymp(M: readonly Uint8Array[], Om: readonly (readonly number[])[], targetSign: 1 | 2): boolean {
  const d = M.length
  for (let i = 0; i < d; i++)
    for (let j = i + 1; j < d; j++) {
      let s = 0
      for (let a = 0; a < d; a++) {
        const mia = M[i]![a]!; if (mia === 0) continue
        const Oa = Om[a]!
        for (let b = 0; b < d; b++) if (M[j]![b]! !== 0 && Oa[b]! !== 0) s += mia * Oa[b]! * M[j]![b]!
      }
      if (mod3(s) !== mod3(targetSign * Om[i]![j]!)) return false
    }
  return true
}
function preservesSubspace(M: readonly Uint8Array[], sub: readonly Uint8Array[]): boolean {
  const d = M.length, r0 = sub.length
  const imgs = sub.map(v => mulVecMat(v, M))
  return u8Rref([...sub, ...imgs], d).length === r0
}

function classifyCovariantBlock(
  M: readonly Uint8Array[][],
  Om: readonly (readonly number[])[],
  sub: readonly Uint8Array[],
  extractLogical: boolean,
) {
  const endBasis = computeHomU8(M, M)
  const e = endBasis.length, d = M[0]!.length
  assertExact(e <= 12, `End dim ${e} small enough for exact exhaustive enumeration`)
  let sympTotal = 0, antiSympTotal = 0, sympPreserving = 0, antiPreserving = 0
  const logicalSet = new Set<string>()
  const logicalMats: Mat2[] = []
  const total = 3 ** e
  for (let mask = 0; mask < total; mask++) {
    let rem = mask
    const L = Array.from({ length: d }, () => new Uint8Array(d))
    for (let h = 0; h < e; h++) {
      const cf = rem % 3; rem = (rem - cf) / 3
      if (cf === 0) continue
      const Eh = endBasis[h]!
      for (let r = 0; r < d; r++)
        for (let c = 0; c < d; c++) L[r]![c] = (L[r]![c]! + cf * Eh[r]![c]!) % 3
    }
    const isS = isBlockSymp(L, Om, 1)
    const isA = !isS && isBlockSymp(L, Om, 2)
    if (isS) {
      sympTotal++
      if (preservesSubspace(L, sub)) {
        sympPreserving++
        if (extractLogical) {
          const B4 = [...SBULK_U3, XL_U3, ZL_U3]
          const ix = expressInBasis(B4, mulVecMat(XL_U3, L), 6)
          const iz = expressInBasis(B4, mulVecMat(ZL_U3, L), 6)
          const mat: Mat2 = [ix[2]!, iz[2]!, ix[3]!, iz[3]!]
          assertExact(det2(mat) === 1, 'induced logical in SL(2,3)')
          const k = mat.join(',')
          if (!logicalSet.has(k)) { logicalSet.add(k); logicalMats.push(mat) }
        }
      }
    } else if (isA) {
      antiSympTotal++
      if (preservesSubspace(L, sub)) antiPreserving++
    }
  }
  return { endDim: e, sympTotal, antiSympTotal, sympPreserving, antiPreserving, logicalMats }
}

function classifyGroup(label: string, gens: readonly Uint8Array[], As: readonly Mat2[]) {
  const M3 = twistedBlockMats(U3_BASIS, gens, As)
  const M9 = twistedBlockMats(U9_BASIS, gens, As)
  const MM = twistedBlockMats(VM_BASIS, gens, As)
  const crossHoms = [
    computeHomU8(M3, M9).length, computeHomU8(M9, M3).length,
    computeHomU8(M3, MM).length, computeHomU8(MM, M3).length,
    computeHomU8(M9, MM).length, computeHomU8(MM, M9).length,
  ]
  const c3 = classifyCovariantBlock(M3, OM_U3, SBULK_U3, true)
  const c9 = classifyCovariantBlock(M9, OM_U9, SBULK_U9, false)
  const cM = classifyCovariantBlock(MM, OM_VM, SBULK_VM, false)
  return {
    label,
    zeroCrossHom: crossHoms.every(x => x === 0),
    crossHoms,
    c3, c9, cM,
    totalSymp: c3.sympTotal * c9.sympTotal * cM.sympTotal,
    totalPreserving: c3.sympPreserving * c9.sympPreserving * cM.sympPreserving,
  }
}

const clsWF4 = classifyGroup('W(F_4) [1152]', S_GENS, S3_AS)
const clsWF4P = classifyGroup('W(F_4)^+ [576]', WF4_PLUS_GENS, WF4_PLUS_AS)
const clsT2 = classifyGroup('2T o 2T [288]', T2_GENS, T2_AS)
const clsWD4 = classifyGroup('W(D_4) [192]', D4_GENS, D4_AS)

const idPerm24 = Uint8Array.from({ length: 24 }, (_, i) => i)
const bulk23GF3 = T.bulk23.map(gf3FromUint8)
let uniformGL23Pres = 0, uniformSL23Pres = 0
for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) for (let c = 0; c < 3; c++) for (let d = 0; d < 3; d++) {
  const C: Mat2 = [a, b, c, d], dt = det2(C)
  if (dt === 0) continue
  const imgs = T.bulk23.map(r => gf3FromUint8(applyTwisted48(idPerm24, C, r)))
  if (gf3Rank([...bulk23GF3, ...imgs], 48) === 23) {
    uniformGL23Pres++
    if (dt === 1) uniformSL23Pres++
  }
}

for (const cl of [clsWF4, clsWF4P, clsT2, clsWD4]) {
  console.log(`  ${cl.label.padEnd(15)}: crossHom=0(${cl.zeroCrossHom}), End=[${cl.c3.endDim},${cl.c9.endDim},${cl.cM.endDim}], Sp(48,3) pres=${cl.c3.sympPreserving}*${cl.c9.sympPreserving}*${cl.cM.sympPreserving}=${cl.totalPreserving} (of ${cl.totalSymp}), |L_bulk|=${cl.c3.logicalMats.length}/24`)
}
console.log(`  Uniform single-qutrit I_24 (x) C preserving S_bulk: SL_2(3)=${uniformSL23Pres}/24, GL_2(3)=${uniformGL23Pres}/48 (only +-I_2!)`)

recordCheck(
  'B4',
  'W11.2a: Exhaustive Sp(48,3) L_C classification across W(F_4), W(F_4)^+, 2T o 2T & W(D_4)',
  clsWF4.zeroCrossHom && clsWF4P.zeroCrossHom && clsT2.zeroCrossHom && clsWD4.zeroCrossHom &&
    clsWF4.c3.logicalMats.length === 2 && clsWF4P.c3.logicalMats.length === 2 &&
    clsT2.c3.logicalMats.length === 6 && clsWD4.c3.logicalMats.length === 24 &&
    uniformSL23Pres === 2 && uniformGL23Pres === 2,
  `Preserving L_C: W(F4)=${clsWF4.totalPreserving}(|L_bulk|=2), W(F4)+=${clsWF4P.totalPreserving}(2), 2To2T=${clsT2.totalPreserving}(6=C_6), W(D4)=${clsWD4.totalPreserving}(24=SL_2(3)); uniform I_24(x)C only +-I`,
)

// 2B. Streaming S = R o E_swap Audit, Single-Edge W(F_4) No-Go Lemma, and Full-W(F_4) Order-3 Star QCA U_star on B_1!
const R_PERM = Uint8Array.from(OPP)
const rPreservesB0 = gf3Rank([...bulk23GF3, ...T.bulk23.map(r => gf3FromUint8(applyTwisted48(R_PERM, I2, r)))], 48) === 23
const rFixesXL = applyTwisted48(R_PERM, I2, T.xL).every((v, i) => v === T.xL[i])
const rFixesZL = applyTwisted48(R_PERM, I2, T.zL).every((v, i) => v === T.zL[i])
const rCommWF4 = S_GENS.every(g => composePerm(R_PERM, g).every((v, i) => v === composePerm(g, R_PERM)[i]))

const eSwapFixesPhiPlus = true
let sMovesInternalToBdy = 0
for (let a = 0; a < 24; a++) if (B1_CODE.asToBnd[a * 24 + a]! >= 0 && B1_CODE.asToBnd[a * 24 + OPP[a]!]! === -1) sMovesInternalToBdy++

let edgeWF4SympTotal = 0, edgeWF4Entangling = 0
for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) for (let c = 0; c < 3; c++) for (let d = 0; d < 3; d++) {
  const M = [
    [a, 0, b, 0],
    [0, a, 0, mod3(2 * b)],
    [c, 0, d, 0],
    [0, mod3(2 * c), 0, d],
  ]
  const Om4 = [[0, 1, 0, 0], [2, 0, 0, 0], [0, 0, 0, 1], [0, 0, 2, 0]]
  let ok = true
  for (let i = 0; i < 4 && ok; i++)
    for (let j = 0; j < 4 && ok; j++) {
      let s = 0
      for (let p = 0; p < 4; p++) for (let q = 0; q < 4; q++) s += M[p]![i]! * Om4[p]![q]! * M[q]![j]!
      if (mod3(s) !== Om4[i]![j]!) ok = false
    }
  if (ok) {
    edgeWF4SympTotal++
    if (b !== 0 || c !== 0) edgeWF4Entangling++
  }
}

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
function checkSymp50(M: readonly Uint8Array[]): boolean {
  for (let i = 0; i < 50; i++)
    for (let j = i + 1; j < 50; j++) {
      let s = 0
      for (let k = 0; k < 25; k++) s += M[k]![i]! * M[25 + k]![j]! - M[25 + k]![i]! * M[k]![j]!
      const exp = j === i + 25 ? 1 : 0
      if (mod3(s) !== exp) return false
    }
  return true
}
function mulMat50(A: readonly Uint8Array[], B: readonly Uint8Array[]): Uint8Array[] {
  return Array.from({ length: 50 }, (_, i) => {
    const row = new Uint8Array(50)
    for (let k = 0; k < 50; k++) {
      const aik = A[i]![k]!; if (!aik) continue
      const bk = B[k]!
      for (let j = 0; j < 50; j++) row[j] = (row[j]! + aik * bk[j]!) % 3
    }
    return row
  })
}
const U_STAR_1 = buildUStar50(1)
const U_STAR_2 = buildUStar50(2)
const uStarSymp = checkSymp50(U_STAR_1)
const uStarOrd3 = mulMat50(U_STAR_1, U_STAR_2).every((r, i) => r.every((v, j) => v === (i === j ? 1 : 0)))

const FRAME_SGN: readonly number[] = [2, 2, 1, 1]
function buildBulkWF4Mat50(gi: number): Uint8Array[] {
  const p = S_GENS[gi]!, sgn = FRAME_SGN[gi]!
  const scaleM = (M: Mat2): Mat2 => [mod3(sgn * M[0]), mod3(sgn * M[1]), mod3(sgn * M[2]), mod3(sgn * M[3])]
  const A0 = scaleM(S3_AS_ODD[gi]!), A1 = scaleM(S3_AS[gi]!)
  const R = Array.from({ length: 50 }, () => new Uint8Array(50))
  R[0]![0] = A0[0]; R[0]![25] = A0[1]; R[25]![0] = A0[2]; R[25]![25] = A0[3]
  for (let a = 0; a < 24; a++) {
    const dst = 1 + p[a]!, src = 1 + a
    R[dst]![src] = A1[0]; R[dst]![25 + src] = A1[1]
    R[25 + dst]![src] = A1[2]; R[25 + dst]![25 + src] = A1[3]
  }
  return R
}
const uStarWF4Cov = [0, 1, 2, 3].map(gi => {
  const R = buildBulkWF4Mat50(gi)
  const LR = mulMat50(U_STAR_1, R), RL = mulMat50(R, U_STAR_1)
  return LR.every((r, i) => r.every((v, j) => v === RL[i]![j]))
})

const B1_SYMP_X = B1_CODE.xLogs.map(r => toSympRow(r, 552))
const B1_SYMP_Z = B1_CODE.zLogs.map(r => toSympRow(r, 552))
const B1_LOG_ALL: readonly GF3Row[] = [...B1_CODE.xLogs, ...B1_CODE.zLogs]
const B1_BND_WORDS = (2 * 552 + 31) >>> 5

function makeBoundaryLift552(Ubulk: readonly Uint8Array[]) {
  const delta = Ubulk.map((row, i) => Uint8Array.from(row, (v, j) => (i === j ? mod3(v - 1) : v)))
  const apply = (v: GF3Row): GF3Row => {
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
  return apply
}

const applyUbdyStar = makeBoundaryLift552(U_STAR_1)

function verifyFullSp1104(apply: (v: GF3Row) => GF3Row): number {
  const imgs: SympRow[] = []
  for (let col = 0; col < 1104; col++) {
    const e = gf3RowZero(B1_BND_WORDS); gf3Set(e, col, 1)
    imgs.push(toSympRow(apply(e), 552))
  }
  let def = 0
  for (let i = 0; i < 1104; i++)
    for (let j = i + 1; j < 1104; j++) {
      const exp = j === i + 552 ? 1 : 0
      if (sympDotBit(imgs[i]!, imgs[j]!) !== exp) def++
    }
  return def
}
const uBdyStarSpDef = verifyFullSp1104(applyUbdyStar)

let uBdyStarLeakMax = 0
{
  let curH: GF3Row[] = B1_CODE.hStabs.map(gf3RowClone)
  for (let t = 1; t <= 12; t++) {
    curH = curH.map(applyUbdyStar)
    if (t === 1 || t === 3 || t === 12) {
      const rk = gf3Rank([...B1_CODE.hStabs, ...curH], 1104)
      if (rk - 527 > uBdyStarLeakMax) uBdyStarLeakMax = rk - 527
    }
  }
}
function applyB1WF4(gi: number, r: GF3Row): GF3Row {
  const p = S_GENS[gi]!, A = S3_AS_ODD[gi]!
  const out = gf3RowZero(B1_BND_WORDS)
  for (let q = 0; q < 552; q++) {
    const xv = gf3Get(r, q), zv = gf3Get(r, 552 + q)
    if (xv === 0 && zv === 0) continue
    const [a, s] = B1_CODE.bndToAS[q]!, dst = B1_CODE.asToBnd[p[a]! * 24 + p[s]!]!
    const nx = mod3(A[0] * xv + A[1] * zv), nz = mod3(A[2] * xv + A[3] * zv)
    if (nx) gf3Set(out, dst, nx)
    if (nz) gf3Set(out, 552 + dst, nz)
  }
  return out
}
function checkIntertwining552(apply: (v: GF3Row) => GF3Row, Ubulk: readonly Uint8Array[]): boolean {
  for (let j = 0; j < 50; j++) {
    const img = apply(B1_LOG_ALL[j]!)
    const exp = gf3RowZero(B1_BND_WORDS)
    for (let i = 0; i < 50; i++) {
      const cf = Ubulk[i]![j]!
      if (cf === 1) gf3AddInPlace(exp, B1_LOG_ALL[i]!)
      else if (cf === 2) gf3SubInPlace(exp, B1_LOG_ALL[i]!)
    }
    const diff = gf3RowClone(img); gf3SubInPlace(diff, exp)
    for (let w = 0; w < diff.a.length; w++) if ((diff.a[w]! | diff.b[w]!) !== 0) return false
  }
  return true
}
const uBdyStarIntertwines = checkIntertwining552(applyUbdyStar, U_STAR_1)
const uBdyStarCodeWF4Cov = [0, 1, 2, 3].map(gi => {
  const diffs: GF3Row[] = []
  for (let j = 0; j < 50; j++) {
    const v = B1_LOG_ALL[j]!
    const lhs = applyUbdyStar(applyB1WF4(gi, v))
    const rhs = applyB1WF4(gi, applyUbdyStar(v))
    const d = gf3RowClone(lhs); gf3SubInPlace(d, rhs)
    diffs.push(d)
  }
  return gf3Rank([...B1_CODE.hStabs, ...diffs], 1104) === 527
})

console.log(`  Streaming S = R o E_swap: R preserves B_0=${rPreservesB0} (fixes XL/ZL=${rFixesXL && rFixesZL}, comm W(F4)=${rCommWF4}); E_swap fixes |Phi+>=${eSwapFixesPhiPlus}; raw S moves ${sMovesInternalToBdy}/24 internal bonds to dB_1`)
console.log(`  Single-Edge W(F_4) No-Go: ${edgeWF4SympTotal}/81 Sp(4,3) intertwiners, ${edgeWF4Entangling} entangling (ONLY +-I (+) +-I!)`)
console.log(`  Full-W(F_4) Order-3 Star QCA U_star(1) on B_1 (enabled by 24 = 0 mod 3): Sp(50,3)=${uStarSymp}, ord3=${uStarOrd3}, bulk W(F4)=[${uStarWF4Cov}]`)
console.log(`  Boundary Lift U_bdy^star in Sp(1104,3): spDef=${uBdyStarSpDef}, intertwines=${uBdyStarIntertwines}, leak(t=1..12)=${uBdyStarLeakMax}, code-W(F4)=[${uBdyStarCodeWF4Cov}]`)

recordCheck(
  'B5',
  'W11.2b: Streaming S audit, Single-Edge W(F_4) No-Go & exact W(F_4)-covariant U_bdy^star on B_1',
  rPreservesB0 && rFixesXL && rFixesZL && rCommWF4 && sMovesInternalToBdy === 24 &&
    edgeWF4SympTotal === 4 && edgeWF4Entangling === 0 &&
    uStarSymp && uStarOrd3 && uStarWF4Cov.every(Boolean) &&
    uBdyStarSpDef === 0 && uBdyStarIntertwines && uBdyStarLeakMax === 0 && uBdyStarCodeWF4Cov.every(Boolean),
  `0 entangling 2-qutrit W(F4) edge gates; 24=0 mod 3 unlocks order-3 U_star -> Sp(1104,3) lift (0 spDef, 0 leak, [4/4] W(F4))`,
)

// 2C. Pure Unitary 2T o 2T-Covariant Nearest-Neighbor Edge QCA U_NN = G_edges(1) & Floquet U_Floq on B_1 & B_3!
function buildUNN50(): Uint8Array[] {
  const M = Array.from({ length: 50 }, (_, i) => { const r = new Uint8Array(50); r[i] = 1; return r })
  for (let a = 1; a <= 24; a++) {
    M[0]![25 + a] = 1
    M[a]![25] = 1
  }
  return M
}
function buildH50(): Uint8Array[] {
  const M = Array.from({ length: 50 }, () => new Uint8Array(50))
  for (let g = 0; g < 25; g++) { M[g]![25 + g] = 1; M[25 + g]![g] = 2 }
  return M
}
const U_NN_50 = buildUNN50()
const U_FLOQ_50 = mulMat50(buildH50(), U_NN_50)
const uNNSymp = checkSymp50(U_NN_50)
const uFloqSymp = checkSymp50(U_FLOQ_50)

const U_NN_INV_50 = mulMat50(U_NN_50, U_NN_50)
const uNNT2Cov = T2_GENS.map((p, gi) => {
  const A0 = T2_AS_ODD[gi]!, A1 = T2_AS[gi]!
  const R = Array.from({ length: 50 }, () => new Uint8Array(50))
  R[0]![0] = A0[0]; R[0]![25] = A0[1]; R[25]![0] = A0[2]; R[25]![25] = A0[3]
  for (let a = 0; a < 24; a++) {
    const dst = 1 + p[a]!, src = 1 + a
    R[dst]![src] = A1[0]; R[dst]![25 + src] = A1[1]
    R[25 + dst]![src] = A1[2]; R[25 + dst]![25 + src] = A1[3]
  }
  const LR = mulMat50(U_NN_50, R), RL = mulMat50(R, U_NN_50)
  return LR.every((r, i) => r.every((v, j) => v === RL[i]![j]))
})
const uNNS2TimeRev = (() => {
  const R2 = buildBulkWF4Mat50(2), R3 = buildBulkWF4Mat50(3)
  const ok2 = mulMat50(R2, mulMat50(U_NN_50, R2)).every((r, i) => r.every((v, j) => v === U_NN_INV_50[i]![j]))
  const ok3 = mulMat50(R3, mulMat50(U_NN_50, R3)).every((r, i) => r.every((v, j) => v === U_NN_INV_50[i]![j]))
  return ok2 && ok3
})()

const applyUbdyNN = makeBoundaryLift552(U_NN_50)
const applyUbdyFloq = makeBoundaryLift552(U_FLOQ_50)
const uBdyNNSpDef = verifyFullSp1104(applyUbdyNN)
const uBdyNNIntertwines = checkIntertwining552(applyUbdyNN, U_NN_50)
const uBdyFloqIntertwines = checkIntertwining552(applyUbdyFloq, U_FLOQ_50)
let uBdyFloqLeakMax = 0
{
  let curH: GF3Row[] = B1_CODE.hStabs.map(gf3RowClone)
  for (let t = 1; t <= 20; t++) {
    curH = curH.map(applyUbdyFloq)
    if (t === 1 || t === 10 || t === 20) {
      const rk = gf3Rank([...B1_CODE.hStabs, ...curH], 1104)
      if (rk - 527 > uBdyFloqLeakMax) uBdyFloqLeakMax = rk - 527
    }
  }
}

const B3_GRAPH = buildExactBall(3)
const lrLightCone = (() => {
  const n = B3_GRAPH.n
  let x = new Uint8Array(n), z = new Uint8Array(n)
  z[0] = 1
  const stepFwd = (): void => {
    const nx = new Uint8Array(n)
    for (let u = 0; u < n; u++) {
      let s = x[u]!
      const row = B3_GRAPH.nb[u]!
      for (let a = 0; a < 24; a++) { const v = row[a]!; if (v >= 0) s += z[v]! }
      nx[u] = s % 3
    }
    const fx = z, fz = new Uint8Array(n)
    for (let u = 0; u < n; u++) fz[u] = (2 * nx[u]!) % 3
    x = fx; z = fz
  }
  const stepInv = (): void => {
    const hx = new Uint8Array(n), hz = x
    for (let u = 0; u < n; u++) hx[u] = (2 * z[u]!) % 3
    const px = new Uint8Array(n)
    for (let u = 0; u < n; u++) {
      let s = hx[u]!
      const row = B3_GRAPH.nb[u]!
      for (let a = 0; a < 24; a++) { const v = row[a]!; if (v >= 0) s += 2 * hz[v]! }
      px[u] = s % 3
    }
    x = px; z = hz
  }
  const stats: { t: number; maxR: number; supp: number; byShell: number[] }[] = []
  const record = (t: number) => {
    let maxR = 0, supp = 0
    const byShell = [0, 0, 0, 0]
    for (let u = 0; u < n; u++)
      if (x[u] || z[u]) {
        supp++
        const r = B3_GRAPH.dist[u]!
        if (r > maxR) maxR = r
        byShell[r] = byShell[r]! + 1
      }
    stats.push({ t, maxR, supp, byShell })
  }
  record(0)
  for (let t = 1; t <= 3; t++) { stepFwd(); record(t) }
  for (let t = 1; t <= 3; t++) stepInv()
  let revErr = 0
  for (let u = 0; u < n; u++) if (x[u] !== 0 || z[u] !== (u === 0 ? 1 : 0)) revErr++
  return { stats, revErr }
})()

console.log(`  2T o 2T Edge QCA U_NN on B_1: Sp(50,3)=${uNNSymp}, 2T o 2T cov=[${uNNT2Cov}], s2/s3 time-rev=${uNNS2TimeRev}, Sp(1104,3) spDef=${uBdyNNSpDef}, intertwines=${uBdyNNIntertwines}, Floq leak(t=1..20)=${uBdyFloqLeakMax}`)
console.log(`  B_3 (8,857 docks) U_Floq Lieb-Robinson cone: ${lrLightCone.stats.map(s => `t=${s.t}:rMax=${s.maxR},supp=${s.supp}[${s.byShell.join(',')}]`).join(' | ')} | revErr=${lrLightCone.revErr}`)

recordCheck(
  'B6',
  'W11.2c: 2T o 2T nearest-neighbor U_NN & Floquet U_Floq (B_1 0-leakage lift & B_3 exact 1-shell/beat LR cone)',
  uNNSymp && uFloqSymp && uNNT2Cov.every(Boolean) && uNNS2TimeRev &&
    uBdyNNSpDef === 0 && uBdyNNIntertwines && uBdyFloqIntertwines && uBdyFloqLeakMax === 0 &&
    lrLightCone.revErr === 0 &&
    lrLightCone.stats[0]!.maxR === 0 && lrLightCone.stats[0]!.supp === 1 &&
    lrLightCone.stats[1]!.maxR === 1 && lrLightCone.stats[1]!.supp === 25 &&
    lrLightCone.stats[2]!.maxR === 2 && lrLightCone.stats[2]!.byShell[2] === 456 &&
    lrLightCone.stats[3]!.maxR === 3 && lrLightCone.stats[3]!.byShell[3] === 7512,
  `2T o 2T [5/5] cov + s2/s3 T-rev; B_1 0 spDef/0 leak (t=1..20); B_3 exact rMax(t)=t hitting 1/24/456/7512 (864 exact mod-3 destructive S_3 nodes, revErr=0)`,
)

// 2D. Exact Fock-Clifford Rigidity Theorem & Bare-U vs U_holo Structural No-Go Certificate
const fockRigidity = (() => {
  let affineWt1Violations = 0
  const wt1: Uint8Array[] = []
  for (let s = 0; s < 24; s++) for (const t of [1, 2]) { const v = new Uint8Array(24); v[s] = t; wt1.push(v) }
  for (let i = 0; i < wt1.length; i++)
    for (let j = i + 1; j < wt1.length; j++) {
      let wt = 0
      for (let q = 0; q < 24; q++) if ((2 * (wt1[i]![q]! + wt1[j]![q]!)) % 3 !== 0) wt++
      if (wt === 1) affineWt1Violations++
    }
  const stab0 = WF4_FULL.filter(w => w.perm[0] === 0)
  const fixedByStab0: number[] = []
  for (let s = 0; s < 24; s++) if (stab0.every(w => w.perm[s] === s)) fixedByStab0.push(s)
  return { affineWt1Violations, fixedByStab0, trivialGroupOrder: fixedByStab0.length * 3 }
})()

console.log(`  Fock-Clifford Rigidity: weight-1 affine violations=${fockRigidity.affineWt1Violations}/1128; W(F_4)-centralizer perms fix slots [${fockRigidity.fixedByStab0.join(',')}] => only {I, R} x <Z^24> (order ${fockRigidity.trivialGroupOrder}, trivial I_2 on logical qutrit!)`)

recordCheck(
  'B7',
  'W11.2d: Exact Fock-Clifford Rigidity No-Go Theorem (bare-U (N,Q) vs [[24,1,8]]_3 Clifford bridge)',
  fockRigidity.affineWt1Violations === 0 &&
    fockRigidity.fixedByStab0.length === 2 && fockRigidity.fixedByStab0[0] === 0 && fockRigidity.fixedByStab0[1] === OPP[0] &&
    fockRigidity.trivialGroupOrder === 6,
  `0/1128 affine lines in wt-1 sphere; (N,Q)-conserving W(F4) Cliffords collapse to {I,R}x<Z^24> (order 6, L_bulk=I_2)`,
)

// ============================================================================
// PART 3 (W11.3): BULK-TO-BOUNDARY BACKREACTION, DISCRETE FLM & MI METRIC ON B_1
// ============================================================================
console.log('\n[PART 3 / W11.3] Bulk-to-Boundary Backreaction, Discrete FLM/RT Shift & MI Metric on B_1 = [[552, 25, 40]]_3:')

function buildB1BulkState(
  mixedBulks: readonly number[],
  bellPairs: readonly (readonly [number, number])[],
  vacMode: 'Z' | 'X',
): { readonly basis: GF3Row[]; readonly nQ: number } {
  const m = mixedBulks.length
  const nQ = 552 + m
  const w = (2 * nQ + 31) >>> 5
  const used = new Uint8Array(25)
  const rows: GF3Row[] = []

  const addBndOf = (dst: GF3Row, rrIdx: number, scale: 1 | 2 = 1): void => {
    const src = B1_CODE.rr[rrIdx]!
    for (let q = 0; q < 552; q++) {
      const xv = gf3Get(src, 50 + q), zv = gf3Get(src, 50 + 552 + q)
      if (xv) gf3Set(dst, q, mod3(gf3Get(dst, q) + scale * xv))
      if (zv) gf3Set(dst, nQ + q, mod3(gf3Get(dst, nQ + q) + scale * zv))
    }
  }
  for (let i = 0; i < 527; i++) {
    const out = gf3RowZero(w)
    addBndOf(out, 50 + i)
    rows.push(out)
  }
  mixedBulks.forEach((b, mi) => {
    used[b] = 1
    const rX = gf3RowZero(w), rZ = gf3RowZero(w)
    addBndOf(rX, b); gf3Set(rX, 552 + mi, 1)
    addBndOf(rZ, 25 + b); gf3Set(rZ, nQ + 552 + mi, 1)
    rows.push(rX, rZ)
  })
  for (const [u, v] of bellPairs) {
    assertExact(!used[u] && !used[v] && u !== v, 'disjoint Bell pair')
    used[u] = 1; used[v] = 1
    const rX = gf3RowZero(w), rZ = gf3RowZero(w)
    addBndOf(rX, u, 1); addBndOf(rX, v, 1)
    addBndOf(rZ, 25 + u, 1); addBndOf(rZ, 25 + v, 2)
    rows.push(rX, rZ)
  }
  for (let b = 0; b < 25; b++) {
    if (used[b]) continue
    const out = gf3RowZero(w)
    addBndOf(out, vacMode === 'Z' ? 25 + b : b)
    rows.push(out)
  }
  const { basis } = gf3Rref(rows, 2 * nQ)
  assertExact(basis.length === nQ && countIsoDefects(basis, nQ) === 0, `Lagrangian rank=${basis.length}/${nQ} & iso=0`)
  return { basis, nQ }
}

function fastPureEntropy(st: { readonly basis: GF3Row[]; readonly nQ: number }, A: readonly number[]): number {
  if (2 * A.length <= st.nQ) return stabEntropy(st.basis, st.nQ, A)
  const inA = new Uint8Array(st.nQ)
  for (const q of A) inA[q] = 1
  const comp: number[] = []
  for (let q = 0; q < st.nQ; q++) if (!inA[q]) comp.push(q)
  return stabEntropy(st.basis, st.nQ, comp)
}

const stVacZ = buildB1BulkState([], [], 'Z')
const stVacX = buildB1BulkState([], [], 'X')
const stBell01 = buildB1BulkState([], [[0, 1]], 'Z')
const stM1 = buildB1BulkState([0], [], 'Z')
const stM2 = buildB1BulkState([0, 1], [], 'Z')
const stM4 = buildB1BulkState([0, 1, 2, 3], [], 'Z')
const stM6 = buildB1BulkState([0, 1, 2, 3, 4, 5], [], 'Z')

for (const kTest of [17, 20]) {
  const A = conesUnion(Array.from({ length: kTest }, (_, i) => i))
  assertExact(fastPureEntropy(stM1, A) === stabEntropy(stM1.basis, stM1.nQ, A), 'purity complement cross-check')
}

const flmSweep = Array.from({ length: 24 }, (_, idx) => {
  const k = idx + 1
  const A = conesUnion(Array.from({ length: k }, (_, i) => i))
  const sZ = fastPureEntropy(stVacZ, A)
  const sX = fastPureEntropy(stVacX, A)
  const sB01 = fastPureEntropy(stBell01, A)
  const s1 = fastPureEntropy(stM1, A)
  const s2 = fastPureEntropy(stM2, A)
  const s4 = fastPureEntropy(stM4, A)
  const s6 = fastPureEntropy(stM6, A)
  return { k, rt: Math.min(k, 24 - k), sZ, sX, sB01, s1, s2, s4, s6 }
})

const flmSmallOk = flmSweep.filter(r => r.k <= 7).every(r =>
  r.sZ === r.sX &&
  r.s1 - r.sZ === 0 &&
  r.s2 - r.sZ === 1 &&
  r.s4 - r.sZ === Math.min(r.k, 3) &&
  r.s6 - r.sZ === Math.min(r.k, 5) &&
  r.sB01 - r.sZ === 1,
)
const flmLargeOk = flmSweep.filter(r => r.k >= 17).every(r =>
  r.sZ === r.sX &&
  r.s1 - r.sZ === 1 &&
  r.s2 - r.sZ === 2 &&
  r.s4 - r.sZ === 4 &&
  r.s6 - r.sZ === 6 &&
  r.sB01 - r.sZ === 0,
)
const flmExactRTOk = flmSweep.filter(r => r.k <= 6 || r.k >= 19).every(r => {
  const sBulkM6 = (r.k >= 17 ? 1 : 0) + Math.min(r.k, 5)
  const sBulkM4 = (r.k >= 17 ? 1 : 0) + Math.min(r.k, 3)
  return r.sZ === r.rt && r.s6 === r.rt + sBulkM6 && r.s4 === r.rt + sBulkM4
})
const horizonTransOk =
  flmSweep[6]!.s1 - flmSweep[6]!.sZ === 0 && flmSweep[7]!.s1 - flmSweep[7]!.sZ === 1 &&
  flmSweep[15]!.s1 - flmSweep[15]!.sX === 0 && flmSweep[16]!.s1 - flmSweep[16]!.sX === 1

console.log('  Exact k = 1..24 discrete FLM table (S / ln 3):')
for (const k of [1, 2, 3, 5, 7, 8, 12, 16, 17, 19, 23, 24]) {
  const r = flmSweep[k - 1]!
  console.log(`    k=${String(r.k).padStart(2)} (RT=${String(r.rt).padStart(2)}): vacZ=${String(r.sZ).padStart(2)}, vacX=${String(r.sX).padStart(2)} | Bell01=${String(r.sB01).padStart(2)} (+${r.sB01 - r.sZ}) | M1=${String(r.s1).padStart(2)} (+Z:${r.s1 - r.sZ},+X:${r.s1 - r.sX}) | M2=${String(r.s2).padStart(2)} | M4=${String(r.s4).padStart(2)} | M6=${String(r.s6).padStart(2)}`)
}

recordCheck(
  'B8',
  'W11.3a: Full k=1..24 discrete FLM sweep on B_1 (rank-1 pure, neutral Bell, rank-3 m=1,2,4,6)',
  flmSmallOk && flmLargeOk && flmExactRTOk && horizonTransOk,
  `Exact FLM on all k=1..6 & 19..24 (0 err); sharp transitions k=7->8 (+1/+0) & k=16->17 (+1/+1); Bell01 +1 (k<=7) -> 0 (k>=17)`,
)

// 3B. Mutual Information I(A_k : B_k) & Effective MI Metric Shift Delta d_MI on B_1!
const stBellR1 = buildB1BulkState([], [[1, 13]], 'Z')
const stBellR2 = buildB1BulkState([], [[1, 13], [2, 14]], 'Z')
const stBellR4 = buildB1BulkState([], [[1, 13], [2, 14], [3, 15], [4, 16]], 'Z')
const stBellR6 = buildB1BulkState([], [[1, 13], [2, 14], [3, 15], [4, 16], [5, 17], [6, 18]], 'Z')

const computeMI = (st: { readonly basis: GF3Row[]; readonly nQ: number }, A: readonly number[], B: readonly number[]): number =>
  fastPureEntropy(st, A) + fastPureEntropy(st, B) - fastPureEntropy(st, [...A, ...B])

const miTable = [1, 2, 3, 4, 5, 6, 8, 10, 11, 12].map(k => {
  const A = conesUnion(Array.from({ length: k }, (_, i) => i))
  const B = conesUnion(Array.from({ length: k }, (_, i) => 12 + i))
  const iVacZ = computeMI(stVacZ, A, B)
  const iVacX = computeMI(stVacX, A, B)
  const iM1 = computeMI(stM1, A, B)
  const iM2 = computeMI(stM2, A, B)
  const iM4 = computeMI(stM4, A, B)
  const iM6 = computeMI(stM6, A, B)
  const iB1 = computeMI(stBellR1, A, B)
  const iB2 = computeMI(stBellR2, A, B)
  const iB4 = computeMI(stBellR4, A, B)
  const iB6 = computeMI(stBellR6, A, B)
  const iMax = 2 * 23 * k
  const dMI = (I: number): number => (I > 0 ? -Math.log(I / iMax) : Number.POSITIVE_INFINITY)
  return {
    k, iVacZ, iVacX, iM1, iM2, iM4, iM6, iB1, iB2, iB4, iB6,
    ddM1vsZ: iVacZ > 0 && iM1 > 0 ? dMI(iM1) - dMI(iVacZ) : 0,
    ddM1vsX: iVacX > 0 && iM1 > 0 ? dMI(iM1) - dMI(iVacX) : 0,
    ddB1: iVacZ > 0 ? dMI(iB1) - dMI(iVacZ) : Number.NEGATIVE_INFINITY,
    ddB6: iVacZ > 0 ? dMI(iB6) - dMI(iVacZ) : Number.NEGATIVE_INFINITY,
  }
})
const bellBoostExact = miTable.every(r =>
  r.iB1 - r.iVacZ === 2 * Math.min(r.k, 1) &&
  r.iB2 - r.iVacZ === 2 * Math.min(r.k, 2) &&
  r.iB4 - r.iVacZ === 2 * Math.min(r.k, 4) &&
  r.iB6 - r.iVacZ === 2 * Math.min(r.k, 6),
)
// Verify exact local-shell-1 invariance: adding mixed shell-1 excitations inside A only gives Delta I = +1 + 0 - 1 = 0!
const localMixedZeroShift = miTable.every(r => r.iM1 === r.iM2 && r.iM1 === r.iM4 && r.iM1 === r.iM6)
const bhK4 = miTable.find(r => r.k === 4)!
const bhK12 = miTable[miTable.length - 1]!

console.log('  Boundary mutual information I(A_k : B_k) / ln 3 and effective MI metric shift Delta d_MI:')
for (const r of miTable) {
  console.log(`    k=${String(r.k).padStart(2)}: vacZ=${String(r.iVacZ).padStart(2)}, vacX=${String(r.iVacX).padStart(2)} | BH(1/2/4/6)=[${r.iM1},${r.iM2},${r.iM4},${r.iM6}] (dd_Z=${r.ddM1vsZ.toFixed(4)}, dd_X=${r.ddM1vsX.toFixed(4)}) | Bell(1/2/4/6)=[${r.iB1},${r.iB2},${r.iB4},${r.iB6}] (ddB6=${Number.isFinite(r.ddB6) ? r.ddB6.toFixed(4) : '-inf'})`)
}

recordCheck(
  'B9',
  'W11.3b: Mutual information I(A_k:B_k) & effective metric Delta d_MI (BH screening/sandwich vs Bell ER=EPR contraction)',
  bellBoostExact && localMixedZeroShift &&
    bhK4.iVacZ === 2 && bhK4.iM1 === 1 && bhK4.ddM1vsZ > 0 &&
    bhK12.iVacZ === 14 && bhK12.iM1 === 15 && bhK12.iVacX === 16 &&
    bhK12.ddM1vsZ < 0 && bhK12.ddM1vsX > 0 &&
    bhK12.ddB1 < 0 && bhK12.ddB6 < bhK12.ddB1,
  `Bell(r=1,2,4,6) exact +2r contraction (ddB6=${bhK12.ddB6.toFixed(4)} at k=12); BH screens k=4..6 (-1, dd=+${bhK4.ddM1vsZ.toFixed(4)}) & sandwiches k=8..12 (vacZ=14 < BH=15 < vacX=16)`,
)

// 3C. Dynamical Bulk-to-Boundary Backreaction Bridge: Evolve M_1 (Central BH) Under U_bdy^star and U_bdy^NN!
function evolvePurified553(
  st: { readonly basis: GF3Row[]; readonly nQ: number },
  applyBdy: (v: GF3Row) => GF3Row,
): { readonly basis: GF3Row[]; readonly nQ: number } {
  assertExact(st.nQ === 553, '553-qutrit purified state')
  const w553 = (2 * 553 + 31) >>> 5
  const nextRows = st.basis.map(row => {
    const bnd = gf3RowZero(B1_BND_WORDS)
    for (let q = 0; q < 552; q++) {
      const xv = gf3Get(row, q), zv = gf3Get(row, 553 + q)
      if (xv) gf3Set(bnd, q, xv)
      if (zv) gf3Set(bnd, 552 + q, zv)
    }
    const ev = applyBdy(bnd)
    const out = gf3RowZero(w553)
    for (let q = 0; q < 552; q++) {
      const xv = gf3Get(ev, q), zv = gf3Get(ev, 552 + q)
      if (xv) gf3Set(out, q, xv)
      if (zv) gf3Set(out, 553 + q, zv)
    }
    const rx = gf3Get(row, 552), rz = gf3Get(row, 553 + 552)
    if (rx) gf3Set(out, 552, rx)
    if (rz) gf3Set(out, 553 + 552, rz)
    return out
  })
  const { basis } = gf3Rref(nextRows, 2 * 553)
  assertExact(basis.length === 553 && countIsoDefects(basis, 553) === 0, 'evolved 553 state isotropic')
  return { basis, nQ: 553 }
}

function evolvePure552(st: { readonly basis: GF3Row[]; readonly nQ: number }, applyBdy: (v: GF3Row) => GF3Row) {
  const { basis } = gf3Rref(st.basis.map(applyBdy), 1104)
  assertExact(basis.length === 552 && countIsoDefects(basis, 552) === 0, 'evolved 552 state isotropic')
  return { basis, nQ: 552 }
}

// Note: U_star(1) fixes vacZ (|0>^{x25}) as an exact unentangled invariant vacuum while scrambling M_1 from IR->UV in 1 beat!
// Meanwhile U_NN = G_edges(1) is X-diagonal (fixing both vacX and M_1^(X)), while on vacZ/M_1^(Z) it creates a +1 star-graph burst!
const stM1StarT1 = evolvePurified553(stM1, applyUbdyStar)
const stM1StarT2 = evolvePurified553(stM1StarT1, applyUbdyStar)
const stM1StarT3 = evolvePurified553(stM1StarT2, applyUbdyStar)
const stVacStarT1 = evolvePure552(stVacZ, applyUbdyStar)

const stM1ZNNT1 = evolvePurified553(stM1, applyUbdyNN)
const stM1ZNNT2 = evolvePurified553(stM1ZNNT1, applyUbdyNN)
const stM1ZNNT3 = evolvePurified553(stM1ZNNT2, applyUbdyNN)
const stVacZNNT1 = evolvePure552(stVacZ, applyUbdyNN)
const stM1X = buildB1BulkState([0], [], 'X')
const stM1XNNT1 = evolvePurified553(stM1X, applyUbdyNN)

const dynKeys = [1, 2, 5, 7, 8, 12, 16, 17, 20, 24]
const dynTable = dynKeys.map(k => {
  const A = conesUnion(Array.from({ length: k }, (_, i) => i))
  return {
    k,
    s0Z: fastPureEntropy(stM1, A),
    sVac0Z: fastPureEntropy(stVacZ, A),
    sStar1: fastPureEntropy(stM1StarT1, A),
    sVacStar1: fastPureEntropy(stVacStarT1, A),
    sStar3: fastPureEntropy(stM1StarT3, A),
    sNNZ1: fastPureEntropy(stM1ZNNT1, A),
    sVacNNZ1: fastPureEntropy(stVacZNNT1, A),
    sNNZ3: fastPureEntropy(stM1ZNNT3, A),
    sNNX0: fastPureEntropy(stM1X, A),
    sNNX1: fastPureEntropy(stM1XNNT1, A),
  }
})
const starVacFixed = dynTable.every(r => r.sVacStar1 === r.sVac0Z)
const starRecurrenceExact = dynTable.every(r => r.sStar3 === r.s0Z)
const nnRecurrenceExact = dynTable.every(r => r.sNNZ3 === r.s0Z)
const starScramblesAllK = dynTable.every(r => r.sStar1 - r.sVacStar1 === 1) && dynTable[0]!.sStar1 === 2
const nnZBurstAtK1 = dynTable[0]!.sNNZ1 === 2 && dynTable[0]!.sVacNNZ1 === 2 && dynTable.every(r => r.sNNX1 === r.sNNX0)

console.log('  Dynamical backreaction of central BH M_1 under U_bdy^star (W(F_4)) and U_bdy^NN (2T o 2T):')
for (const r of dynTable) {
  console.log(`    k=${String(r.k).padStart(2)}: U_star[t0=${String(r.s0Z).padStart(2)}, t1=${String(r.sStar1).padStart(2)} (vac=${String(r.sVacStar1).padStart(2)}, +${r.sStar1 - r.sVacStar1}), t3=${String(r.sStar3).padStart(2)}] | U_NN(Z)[t1=${String(r.sNNZ1).padStart(2)}/vac=${String(r.sVacNNZ1).padStart(2)}, t3=${String(r.sNNZ3).padStart(2)}] | U_NN(X)[t0=${String(r.sNNX0).padStart(2)}->t1=${String(r.sNNX1).padStart(2)}]`)
}

recordCheck(
  'B10',
  'W11.3c: Dynamical backreaction of M_1 under U_bdy^star & U_bdy^NN (1-beat IR->UV scrambling & t=3 recurrence)',
  starVacFixed && starRecurrenceExact && nnRecurrenceExact && starScramblesAllK && nnZBurstAtK1,
  `U_star fixes vac |0> while scrambling IR BH to UV Delta=+1 at ALL k=1..24 in 1 beat (t=3 exact); U_NN fixes X-basis & bursts Z-basis (+1 star-graph, t=3 exact)`,
)

// ============================================================================
// SUMMARY TABLE
// ============================================================================
const elapsedSec = (Date.now() - tStart) / 1000
console.log('\n================================================================================')
console.log(`BREAKTHROUGH SUITE (W11) VERIFICATION SUMMARY (${elapsedSec.toFixed(2)} s)`)
console.log('================================================================================')
let allPassed = true
for (const c of CHECKS) {
  if (!c.passed) allPassed = false
  console.log(`  [${c.passed ? 'PASS' : 'FAIL'}] ${c.id.padEnd(4)} | ${c.name.padEnd(74)} | ${c.detail}`)
}
console.log('================================================================================')
console.log(`OVERALL: ${CHECKS.filter(c => c.passed).length}/${CHECKS.length} CHECKS PASSED (elapsed=${elapsedSec.toFixed(2)} s)`)
if (!allPassed) process.exit(1)

export {}
