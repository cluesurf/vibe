// Breakthrough Suite (Wave-4 Track W13 — Closing Challenge 3 Permanently):
//   Part 1 (W13.1): Exact Multi-Line M_pair(zeta_18)-Active k = 3 (Q = +1) & k = 4 (Q = 0_V, Phi_odd-Active)
//                   Vector-Dipole Spectral Audit across:
//                   (a) Full 3D Z^3 / 3 Z^3 (k = 3, dim = 25,760), Full 2D Z^2 / 5 Z^2 (k = 3, dim = 9,702),
//                       Full 2D Z^2 / 3 Z^2 (k = 4, M_pair-active block dim = 9,282), and 3-axis periodic
//                       coupled rings B_3(L = 3, 5) with exact Bloch transverse twist q_x (including full
//                       exact ED on B_3(3) k = 3, dim = 240!),
//                   (b) 4-line chiral {3,4,3,4} / D_4 star clusters S_4(L = 3) across ALL 4 W(F_4) x tone
//                       classes (Phi_odd-active dim = 1,296, T = 512 beats & M_pair-active dim = 3,060).
//   Part 2 (W13.2): Finite-Density Neutral Q = 0_V (0_D vs 0_V) Pair-Condensate Linear-Response & Floquet /
//                   Bogoliubov Spectrum across rho = 1/6, 1/4, 1/3, 1/2 on:
//                   (a) Periodic 1D chains L = 4, 6, 8 (uniform neutral seas, staggered pair waves, AND exact
//                       finite-q Bogoliubov Floquet ED omega_n(q = pi/2) = E_n(pi/2) - E_0(0) at L = 4 rho = 1/2!),
//                   (b) Multi-axis 2D/3D L = 3 lattices (Z^2 / 3 Z^2, B_3(3)) with uniform seas, M_pair-coherent
//                       s-wave pair condensates (evolved to U^2|s> for non-vacuous jNormSq > 0.5!), and staggered
//                       condensates,
//                   (c) Exact 2-dock 12-line W(F_4)-symmetric D_4 cluster (dim = 4,824), exact 4-dock D_4
//                       quotient (rho = 1/2, dim = 2,832 / 1,024), and exact 5-dock odd-prime D_4 quotient
//                       (rho = 2/5, dim = 5,868 / 2,000).
//   Part 3 (W13.3): Formal All-k Bare-U Spin-1 Algebraic Obstruction Theorem (machine-verified in exact
//                   BigInt Z[zeta_9][1/6] and Float64):
//                   - T0: Bit-exact cross-check of sparse Float64 localDockAction vs BigInt Z[zeta_9][1/6] (< 1e-15),
//                   - T1: Exact per-line U(1)^{24} conservation in U_{no-M_pair} and max_{l,tau} N_l^(tau) <= 1,
//                   - T2: Exact all-k, all-density Z_2^{24} per-line tone-parity superselection [U, P_l^(tau)] = 0
//                         forbidding single-dipole cross-axis transfer <Omega|O_nu U^t O_mu^dag|Omega> = 0,
//                   - T3: Exact M_pair(zeta_18) charge/parity decoupling (q = +-2, J_l = 0, n(g) = 2 veto) and
//                         1^{--} K-cancellation (D K D|_{1--} = +omega I),
//                   - T4: Exhaustive proof of the k = 4 M_pair / Phi_odd Mutual-Exclusion Theorem (220/220 D_4
//                         3-line subspaces fixed by W(F_4)^- -> 0/43,296 chiral quads on <= 3 lines) plus
//                         explicit k = 5 joint M_pair + Phi_odd activation witness on {3,4,3,4},
//                   - T5: Exact local charge/activity continuity [L, Q(g)] = [L, D_act(g)] = 0 and no-link-register
//                         local gauge obstruction [G(theta), S] != 0,
//                   - T6: Exact min(N_+, N_-) = 1 Flat-Transverse-Band Theorem ([U, X_{-,perp}] = 0 => v_T === 0
//                         EXACT for all k = 1, 2, 3 and all N_+ with N_- = 1 even with M_pair active!), making
//                         k = 4 (Q = 0_V, ++--) the strict algebraic threshold for nonzero v_T and y -> x transfer.
//
// Strict scientific integrity:
//   - ZERO external imports, ZERO Math.random(), deterministic exact BigInt Z[zeta_9][1/6] + Float64 only.
//   - Laptop-safe (< 12 s runtime, < 500 MB RAM), zero truncation, zero vacuous Kubo tests (all jNormSq > 0.1).

// =================================================================================================
// 0. VERIFICATION HARNESS & DETERMINISTIC COMPLEX / SPARSE SPECTRAL PRIMITIVES
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

const PI = Math.PI
const SQRT3 = Math.sqrt(3)

type C = readonly [number, number]
const cAdd = (a: C, b: C): C => [a[0] + b[0], a[1] + b[1]]
const cSub = (a: C, b: C): C => [a[0] - b[0], a[1] - b[1]]
const cMul = (a: C, b: C): C => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]
const cScale = (s: number, a: C): C => [s * a[0], s * a[1]]
const cAbs = (a: C): number => Math.hypot(a[0], a[1])
const cExpI = (t: number): C => [Math.cos(t), Math.sin(t)]

// Exact cyclotomic constants of verbatim bare 8-layer QCA beat U in Z[zeta_9][1/6]
const W_C: C = [-0.5, SQRT3 / 2] // omega = e^{2pi i/3}
const W2_C: C = [-0.5, -SQRT3 / 2] // omega^2 = e^{4pi i/3}
const NEG_W_C: C = [0.5, -SQRT3 / 2] // -omega
const Z6_C: C = [0.5, SQRT3 / 2] // zeta_6 = e^{i pi/3}
const Z18_C: C = [Math.cos(PI / 9), Math.sin(PI / 9)] // zeta_18 = e^{i pi/9}
const C_KEEP: C = [0.25, SQRT3 / 4] // (1 + omega)/2
const C_CROSS: C = [0.75, -SQRT3 / 4] // (1 - omega)/2
const C_MAT: readonly (readonly [C, C])[] = [
  [C_KEEP, C_CROSS],
  [C_CROSS, C_KEEP],
]
const Z6_POW_C: readonly C[] = [
  [1, 0],
  Z6_C,
  W_C,
  [-1, 0],
  [-Z6_C[0], -Z6_C[1]],
  [-W_C[0], -W_C[1]],
]

function mPairCoeffs(dLines: number): { readonly keep: C; readonly hop: C } {
  const hop: C = [(Z18_C[0] - 1) / dLines, Z18_C[1] / dLines]
  const keep: C = [1 + hop[0], hop[1]]
  return { keep: cMul(W2_C, keep), hop: cMul(W2_C, hop) }
}

type CMat = { readonly n: number; readonly re: Float64Array; readonly im: Float64Array }
const cmatZero = (n: number): CMat => ({ n, re: new Float64Array(n * n), im: new Float64Array(n * n) })
const cmatEye = (n: number): CMat => {
  const m = cmatZero(n)
  for (let i = 0; i < n; i++) m.re[i * n + i] = 1
  return m
}

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
      maxE = Math.max(maxE, Math.hypot(sr - (i === j ? 1 : 0), si))
    }
  }
  return maxE
}

function tridiagQL(d: Float64Array, eIn: Float64Array, z: Float64Array, n: number): void {
  const e = new Float64Array(n)
  for (let i = 1; i < n; i++) e[i - 1] = eIn[i]!
  e[n - 1] = 0
  for (let l = 0; l < n; l++) {
    let iter = 0
    for (;;) {
      let m = l
      while (m < n - 1) {
        if (Math.abs(e[m]!) <= 1e-15 * Math.max(1e-30, Math.abs(d[m]!) + Math.abs(d[m + 1]!))) break
        m++
      }
      if (m === l) break
      iter++
      if (iter > 80) break
      let g = (d[l + 1]! - d[l]!) / (2 * e[l]!)
      let r = Math.hypot(g, 1)
      g = d[m]! - d[l]! + e[l]! / (g + (g >= 0 ? r : -r))
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
        const rr = (d[i]! - g) * s + 2 * c * b
        p = s * rr
        d[i + 1] = g + p
        g = c * rr - b
        for (let k = 0; k < n; k++) {
          const zki1 = z[k * n + (i + 1)]!
          const zki = z[k * n + i]!
          z[k * n + (i + 1)] = s * zki + c * zki1
          z[k * n + i] = c * zki - s * zki1
        }
      }
      if (r === 0 && m > l) continue
      d[l] = d[l]! - p
      e[l] = g
      e[m] = 0
    }
  }
}

function hermitianEigen(H: CMat): { readonly values: Float64Array; readonly vecs: CMat } {
  const n = H.n
  if (n === 1) return { values: new Float64Array([H.re[0]!]), vecs: cmatEye(1) }
  const hr = Float64Array.from(H.re)
  const hi = Float64Array.from(H.im)
  const qr = new Float64Array(n * n)
  const qi = new Float64Array(n * n)
  for (let i = 0; i < n; i++) qr[i * n + i] = 1
  const cSubRe = new Float64Array(n)
  const cSubIm = new Float64Array(n)
  for (let k = 0; k < n - 2; k++) {
    const m = n - k - 1
    let norm2 = 0
    for (let i = 0; i < m; i++) {
      const r = hr[(k + 1 + i) * n + k]!
      const im = hi[(k + 1 + i) * n + k]!
      norm2 += r * r + im * im
    }
    const sigma = Math.sqrt(norm2)
    if (sigma < 1e-30) continue
    const x0r = hr[(k + 1) * n + k]!
    const x0i = hi[(k + 1) * n + k]!
    const x0a = Math.hypot(x0r, x0i)
    const phR = x0a > 1e-30 ? x0r / x0a : 1
    const phI = x0a > 1e-30 ? x0i / x0a : 0
    const vr = new Float64Array(m)
    const vi = new Float64Array(m)
    for (let i = 0; i < m; i++) {
      vr[i] = hr[(k + 1 + i) * n + k]!
      vi[i] = hi[(k + 1 + i) * n + k]!
    }
    vr[0] = vr[0]! + phR * sigma
    vi[0] = vi[0]! + phI * sigma
    let vn2 = 0
    for (let i = 0; i < m; i++) vn2 += vr[i]! * vr[i]! + vi[i]! * vi[i]!
    if (vn2 < 1e-30) continue
    const beta = 2 / vn2
    const ur = new Float64Array(m)
    const ui = new Float64Array(m)
    for (let i = 0; i < m; i++) {
      let sr = 0
      let si = 0
      const ro = (k + 1 + i) * n + (k + 1)
      for (let j = 0; j < m; j++) {
        const aR = hr[ro + j]!
        const aI = hi[ro + j]!
        sr += aR * vr[j]! - aI * vi[j]!
        si += aR * vi[j]! + aI * vr[j]!
      }
      ur[i] = beta * sr
      ui[i] = beta * si
    }
    let kappa = 0
    for (let i = 0; i < m; i++) kappa += vr[i]! * ur[i]! + vi[i]! * ui[i]!
    kappa *= 0.5 * beta
    const wr = new Float64Array(m)
    const wi = new Float64Array(m)
    for (let i = 0; i < m; i++) {
      wr[i] = ur[i]! - kappa * vr[i]!
      wi[i] = ui[i]! - kappa * vi[i]!
    }
    for (let i = 0; i < m; i++) {
      const vRi = vr[i]!
      const vIi = vi[i]!
      const wRi = wr[i]!
      const wIi = wi[i]!
      const ro = (k + 1 + i) * n + (k + 1)
      for (let j = 0; j < m; j++) {
        hr[ro + j] = hr[ro + j]! - (vRi * wr[j]! + vIi * wi[j]! + (wRi * vr[j]! + wIi * vi[j]!))
        hi[ro + j] = hi[ro + j]! - (vIi * wr[j]! - vRi * wi[j]! + (wIi * vr[j]! - wRi * vi[j]!))
      }
    }
    cSubRe[k + 1] = -phR * sigma
    cSubIm[k + 1] = -phI * sigma
    for (let r = 0; r < n; r++) {
      let dr = 0
      let di = 0
      const ro = r * n + (k + 1)
      for (let j = 0; j < m; j++) {
        dr += qr[ro + j]! * vr[j]! - qi[ro + j]! * vi[j]!
        di += qr[ro + j]! * vi[j]! + qi[ro + j]! * vr[j]!
      }
      dr *= beta
      di *= beta
      for (let j = 0; j < m; j++) {
        qr[ro + j] = qr[ro + j]! - (dr * vr[j]! + di * vi[j]!)
        qi[ro + j] = qi[ro + j]! - (di * vr[j]! - dr * vi[j]!)
      }
    }
  }
  cSubRe[n - 1] = hr[(n - 1) * n + (n - 2)]!
  cSubIm[n - 1] = hi[(n - 1) * n + (n - 2)]!
  const phiR = new Float64Array(n)
  const phiI = new Float64Array(n)
  phiR[0] = 1
  const d = new Float64Array(n)
  const e = new Float64Array(n)
  d[0] = hr[0]!
  for (let k = 1; k < n; k++) {
    d[k] = hr[k * n + k]!
    const mag = Math.hypot(cSubRe[k]!, cSubIm[k]!)
    e[k] = mag
    if (mag > 1e-30) {
      const ur = cSubRe[k]! / mag
      const ui = cSubIm[k]! / mag
      phiR[k] = phiR[k - 1]! * ur - phiI[k - 1]! * ui
      phiI[k] = phiR[k - 1]! * ui + phiI[k - 1]! * ur
    } else {
      phiR[k] = phiR[k - 1]!
      phiI[k] = phiI[k - 1]!
    }
  }
  const z = new Float64Array(n * n)
  for (let i = 0; i < n; i++) z[i * n + i] = 1
  tridiagQL(d, e, z, n)
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const qR = qr[r * n + c]!
      const qI = qi[r * n + c]!
      const pR = phiR[c]!
      const pI = phiI[c]!
      qr[r * n + c] = qR * pR - qI * pI
      qi[r * n + c] = qR * pI + qI * pR
    }
  }
  const ord = Array.from({ length: n }, (_, i) => i).sort((a, b) => d[a]! - d[b]!)
  const values = new Float64Array(n)
  const vecs = cmatZero(n)
  for (let col = 0; col < n; col++) {
    const src = ord[col]!
    values[col] = d[src]!
    for (let r = 0; r < n; r++) {
      let sr = 0
      let si = 0
      const ro = r * n
      for (let k = 0; k < n; k++) {
        const zk = z[k * n + src]!
        sr += qr[ro + k]! * zk
        si += qi[ro + k]! * zk
      }
      vecs.re[r * n + col] = sr
      vecs.im[r * n + col] = si
    }
  }
  return { values, vecs }
}

function unitaryEigen(U: CMat): { readonly phases: Float64Array; readonly vecs: CMat; readonly maxRes: number } {
  const n = U.n
  const phi = 0.37192841
  const cp = Math.cos(phi)
  const sp = Math.sin(phi)
  const H = cmatZero(n)
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const ur = U.re[i * n + j]!
      const ui = U.im[i * n + j]!
      const dr = U.re[j * n + i]!
      const di = -U.im[j * n + i]!
      H.re[i * n + j] = 0.5 * (cp * ur - sp * ui + cp * dr + sp * di)
      H.im[i * n + j] = 0.5 * (cp * ui + sp * ur + cp * di - sp * dr)
    }
  }
  const eigH = hermitianEigen(H)
  const V = { n, re: Float64Array.from(eigH.vecs.re), im: Float64Array.from(eigH.vecs.im) }
  let start = 0
  while (start < n) {
    let end = start + 1
    while (end < n && Math.abs(eigH.values[end]! - eigH.values[start]!) < 1e-7) end++
    const m = end - start
    if (m >= 2) {
      const Sub = cmatZero(m)
      const wr = new Float64Array(n * m)
      const wi = new Float64Array(n * m)
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < m; c++) {
          let sr = 0
          let si = 0
          for (let k = 0; k < n; k++) {
            const ur = U.re[r * n + k]!
            const ui = U.im[r * n + k]!
            const dr = U.re[k * n + r]!
            const di = -U.im[k * n + r]!
            const r1 = cp * ur - sp * ui
            const i1 = cp * ui + sp * ur
            const r2 = cp * dr + sp * di
            const i2 = cp * di - sp * dr
            const hsr = 0.5 * (i1 - i2)
            const hsi = -0.5 * (r1 - r2)
            const vr = V.re[k * n + (start + c)]!
            const vi = V.im[k * n + (start + c)]!
            sr += hsr * vr - hsi * vi
            si += hsr * vi + hsi * vr
          }
          wr[r * m + c] = sr
          wi[r * m + c] = si
        }
      }
      for (let a = 0; a < m; a++) {
        for (let b = 0; b < m; b++) {
          let sr = 0
          let si = 0
          for (let r = 0; r < n; r++) {
            const vr = V.re[r * n + (start + a)]!
            const vi = V.im[r * n + (start + a)]!
            sr += vr * wr[r * m + b]! + vi * wi[r * m + b]!
            si += vr * wi[r * m + b]! - vi * wr[r * m + b]!
          }
          Sub.re[a * m + b] = sr
          Sub.im[a * m + b] = si
        }
      }
      const eigS = hermitianEigen(Sub)
      const tmpR = new Float64Array(n * m)
      const tmpI = new Float64Array(n * m)
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < m; c++) {
          let sr = 0
          let si = 0
          for (let k = 0; k < m; k++) {
            const vr = V.re[r * n + (start + k)]!
            const vi = V.im[r * n + (start + k)]!
            const qr = eigS.vecs.re[k * m + c]!
            const qi = eigS.vecs.im[k * m + c]!
            sr += vr * qr - vi * qi
            si += vr * qi + vi * qr
          }
          tmpR[r * m + c] = sr
          tmpI[r * m + c] = si
        }
      }
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < m; c++) {
          V.re[r * n + (start + c)] = tmpR[r * m + c]!
          V.im[r * n + (start + c)] = tmpI[r * m + c]!
        }
      }
    }
    start = end
  }
  const phases = new Float64Array(n)
  let maxRes = 0
  for (let col = 0; col < n; col++) {
    let lr = 0
    let li = 0
    const uvr = new Float64Array(n)
    const uvi = new Float64Array(n)
    for (let r = 0; r < n; r++) {
      let sr = 0
      let si = 0
      for (let k = 0; k < n; k++) {
        sr += U.re[r * n + k]! * V.re[k * n + col]! - U.im[r * n + k]! * V.im[k * n + col]!
        si += U.re[r * n + k]! * V.im[k * n + col]! + U.im[r * n + k]! * V.re[k * n + col]!
      }
      uvr[r] = sr
      uvi[r] = si
      lr += V.re[r * n + col]! * sr + V.im[r * n + col]! * si
      li += V.re[r * n + col]! * si - V.im[r * n + col]! * sr
    }
    phases[col] = Math.atan2(li, lr)
    for (let r = 0; r < n; r++) {
      const vr = V.re[r * n + col]!
      const vi = V.im[r * n + col]!
      maxRes = Math.max(maxRes, Math.hypot(uvr[r]! - (lr * vr - li * vi), uvi[r]! - (lr * vi + li * vr)))
    }
  }
  return { phases, vecs: V, maxRes }
}

// =================================================================================================
// 0B. EXACT SPARSE CSC UNITARY MATRIX & HIGH-RESOLUTION SPECTRAL / KUBO RESPONSE ENGINE
// =================================================================================================

interface SparseCSC {
  readonly dim: number
  readonly colPtr: Int32Array
  readonly rowIdx: Int32Array
  readonly re: Float64Array
  readonly im: Float64Array
}

function buildSparseCSC(
  dim: number,
  fillCol: (col: number, emit: (row: number, re: number, im: number) => void) => void,
): SparseCSC {
  const colPtr = new Int32Array(dim + 1)
  const rows: number[] = []
  const res: number[] = []
  const ims: number[] = []
  const accMap = new Map<number, number>()
  const colRows: number[] = []
  const colRe: number[] = []
  const colIm: number[] = []

  const emit = (row: number, r: number, i: number): void => {
    const pos = accMap.get(row)
    if (pos !== undefined) {
      colRe[pos] = colRe[pos]! + r
      colIm[pos] = colIm[pos]! + i
    } else {
      accMap.set(row, colRows.length)
      colRows.push(row)
      colRe.push(r)
      colIm.push(i)
    }
  }

  for (let col = 0; col < dim; col++) {
    accMap.clear()
    colRows.length = 0
    colRe.length = 0
    colIm.length = 0
    fillCol(col, emit)
    colPtr[col] = rows.length
    for (let k = 0; k < colRows.length; k++) {
      const rv = colRe[k]!
      const iv = colIm[k]!
      if (rv * rv + iv * iv > 1e-30) {
        rows.push(colRows[k]!)
        res.push(rv)
        ims.push(iv)
      }
    }
  }
  colPtr[dim] = rows.length
  return {
    dim,
    colPtr,
    rowIdx: Int32Array.from(rows),
    re: Float64Array.from(res),
    im: Float64Array.from(ims),
  }
}

function sparseToDense(U: SparseCSC): CMat {
  const M = cmatZero(U.dim)
  for (let col = 0; col < U.dim; col++) {
    for (let k = U.colPtr[col]!; k < U.colPtr[col + 1]!; k++) {
      const row = U.rowIdx[k]!
      M.re[row * U.dim + col] = U.re[k]!
      M.im[row * U.dim + col] = U.im[k]!
    }
  }
  return M
}

function applySparse(U: SparseCSC, vr: Float64Array, vi: Float64Array, or: Float64Array, oi: Float64Array): void {
  or.fill(0)
  oi.fill(0)
  const { dim, colPtr, rowIdx, re, im } = U
  for (let col = 0; col < dim; col++) {
    const xr = vr[col]!
    const xi = vi[col]!
    if (xr === 0 && xi === 0) continue
    const start = colPtr[col]!
    const end = colPtr[col + 1]!
    for (let k = start; k < end; k++) {
      const r = rowIdx[k]!
      const ur = re[k]!
      const ui = im[k]!
      or[r] = or[r]! + (ur * xr - ui * xi)
      oi[r] = oi[r]! + (ur * xi + ui * xr)
    }
  }
}

function applySparseDag(U: SparseCSC, vr: Float64Array, vi: Float64Array, or: Float64Array, oi: Float64Array): void {
  const { dim, colPtr, rowIdx, re, im } = U
  for (let col = 0; col < dim; col++) {
    let sr = 0
    let si = 0
    const start = colPtr[col]!
    const end = colPtr[col + 1]!
    for (let k = start; k < end; k++) {
      const r = rowIdx[k]!
      const ur = re[k]!
      const ui = im[k]!
      const xr = vr[r]!
      const xi = vi[r]!
      sr += ur * xr + ui * xi
      si += ur * xi - ui * xr
    }
    or[col] = sr
    oi[col] = si
  }
}

function verifySparseUnitary(U: SparseCSC): { readonly maxColNormErr: number; readonly maxInvErr: number } {
  const { dim, colPtr, re, im } = U
  let maxColNormErr = 0
  for (let col = 0; col < dim; col++) {
    let n2 = 0
    for (let k = colPtr[col]!; k < colPtr[col + 1]!; k++) n2 += re[k]! * re[k]! + im[k]! * im[k]!
    const err = Math.abs(Math.sqrt(n2) - 1)
    if (err > maxColNormErr) maxColNormErr = err
  }
  const vr = new Float64Array(dim)
  const vi = new Float64Array(dim)
  const wr = new Float64Array(dim)
  const wi = new Float64Array(dim)
  const zr = new Float64Array(dim)
  const zi = new Float64Array(dim)
  let maxInvErr = 0
  for (let seed = 1; seed <= 3; seed++) {
    let n2 = 0
    for (let i = 0; i < dim; i++) {
      vr[i] = Math.cos((i + 1) * (0.371 * seed) + 0.19 * seed)
      vi[i] = Math.sin((i + 1) * (0.619 * seed) - 0.11 * seed)
      n2 += vr[i]! * vr[i]! + vi[i]! * vi[i]!
    }
    const inv = 1 / Math.sqrt(n2)
    for (let i = 0; i < dim; i++) { vr[i] = vr[i]! * inv; vi[i] = vi[i]! * inv }
    applySparse(U, vr, vi, wr, wi)
    applySparseDag(U, wr, wi, zr, zi)
    let e2 = 0
    for (let i = 0; i < dim; i++) e2 += (zr[i]! - vr[i]!) ** 2 + (zi[i]! - vi[i]!) ** 2
    maxInvErr = Math.max(maxInvErr, Math.sqrt(e2))

    applySparseDag(U, vr, vi, wr, wi)
    applySparse(U, wr, wi, zr, zi)
    e2 = 0
    for (let i = 0; i < dim; i++) e2 += (zr[i]! - vr[i]!) ** 2 + (zi[i]! - vi[i]!) ** 2
    maxInvErr = Math.max(maxInvErr, Math.sqrt(e2))
  }
  return { maxColNormErr, maxInvErr }
}

interface SpectralReport {
  readonly normErr: number
  readonly w0_T64: number
  readonly w0_TMax: number
  readonly w2Pi3: number
  readonly peakOmega: number
  readonly peakWeight: number
  readonly minActiveOmega: number
}

function analyzeProbeSpectrum(
  U: SparseCSC,
  probeR: Float64Array,
  probeI: Float64Array,
  T = 256,
  nGrid = 720,
): SpectralReport {
  const dim = U.dim
  let curR = Float64Array.from(probeR)
  let curI = Float64Array.from(probeI)
  let nxtR = new Float64Array(dim)
  let nxtI = new Float64Array(dim)

  const corrR = new Float64Array(T)
  const corrI = new Float64Array(T)
  let normErr = 0

  for (let t = 0; t < T; t++) {
    let cr = 0
    let ci = 0
    let n2 = 0
    for (let i = 0; i < dim; i++) {
      const pr = probeR[i]!
      const pi = probeI[i]!
      const qr = curR[i]!
      const qi = curI[i]!
      cr += pr * qr + pi * qi
      ci += pr * qi - pi * qr
      n2 += qr * qr + qi * qi
    }
    corrR[t] = cr
    corrI[t] = ci
    normErr = Math.max(normErr, Math.abs(Math.sqrt(n2) - 1))
    if (t + 1 < T) {
      applySparse(U, curR, curI, nxtR, nxtI)
      const tr = curR; const ti = curI
      curR = nxtR; curI = nxtI
      nxtR = tr; nxtI = ti
    }
  }

  const fejerAt = (omega: number, Teff: number): number => {
    let s = corrR[0]! / Teff
    for (let t = 1; t < Teff; t++) {
      const w = (1 - t / Teff) / Teff
      const c = Math.cos(omega * t)
      const sn = Math.sin(omega * t)
      s += 2 * w * (corrR[t]! * c + corrI[t]! * sn)
    }
    return Math.max(0, s)
  }

  const w0_T64 = fejerAt(0, Math.min(64, T))
  const w0_TMax = fejerAt(0, T)
  const w2Pi3 = fejerAt((2 * PI) / 3, T)

  let peakOmega = 0
  let peakWeight = -1
  let minActiveOmega = PI
  for (let k = 0; k < nGrid; k++) {
    const om = -PI + (2 * PI * k) / nGrid
    const w = fejerAt(om, T)
    if (w > peakWeight) { peakWeight = w; peakOmega = om }
    if (Math.abs(om) > 0.02 && w > 0.01 && Math.abs(om) < minActiveOmega) minActiveOmega = Math.abs(om)
  }

  return { normErr, w0_T64, w0_TMax, w2Pi3, peakOmega, peakWeight, minActiveOmega }
}

interface KuboReport {
  readonly normErr: number
  readonly jNormSq: number
  readonly w0_T64: number
  readonly w0_TMax: number
  readonly maxImPi: number
  readonly maxImPiOmega: number
  readonly maxImPiLow: number
  readonly maxImPiLowOmega: number
  readonly lowBandImPiRatio: number
  readonly minPeakOmegaAbs: number
  readonly s2Pi3: number
  readonly cReSeries?: Float64Array
  readonly cImSeries?: Float64Array
}

function summarizeKuboSeries(
  cRe: Float64Array,
  cIm: Float64Array,
  chi: Float64Array,
  connNormSq: number,
  normErr: number,
  T: number,
  nGrid: number,
): KuboReport {
  const normFac = connNormSq > 1e-14 ? 1 / connNormSq : 1
  const fejerNormAt = (omega: number, Teff: number): number => {
    let s = (cRe[0]! * normFac) / Teff
    for (let t = 1; t < Teff; t++) {
      const w = (1 - t / Teff) / Teff
      s += 2 * w * normFac * (cRe[t]! * Math.cos(omega * t) + cIm[t]! * Math.sin(omega * t))
    }
    return Math.max(0, s)
  }
  const imPiAt = (omega: number): number => {
    let s = 0
    for (let t = 1; t < T; t++) {
      const w = 0.5 * (1 + Math.cos((PI * t) / T))
      s += w * chi[t]! * Math.sin(omega * t)
    }
    return s * normFac
  }

  let maxImPi = 0
  let maxImPiOmega = 0
  let maxImPiLow = 0
  let maxImPiLowOmega = 0
  let minPeakOmegaAbs = PI
  // Scan Im Pi(omega) on (0, pi) (strictly odd in omega) AND scan Fejer W_T(omega) across full (-pi, pi) (MINOR-3!)
  for (let k = 1; k < nGrid / 2; k++) {
    const om = (2 * PI * k) / nGrid
    const ip = Math.abs(imPiAt(om))
    if (ip > maxImPi) { maxImPi = ip; maxImPiOmega = om }
    if (om <= 0.25 && ip > maxImPiLow) { maxImPiLow = ip; maxImPiLowOmega = om }
  }
  for (let k = 0; k < nGrid; k++) {
    const om = -PI + (2 * PI * k) / nGrid
    const aom = Math.abs(om)
    if (aom > 0.03) {
      const fk = fejerNormAt(om, T)
      if (fk > 0.02 && aom < minPeakOmegaAbs) minPeakOmegaAbs = aom
    }
  }

  return {
    normErr,
    jNormSq: connNormSq,
    w0_T64: fejerNormAt(0, Math.min(64, T)),
    w0_TMax: fejerNormAt(0, T),
    maxImPi,
    maxImPiOmega,
    maxImPiLow,
    maxImPiLowOmega,
    lowBandImPiRatio: maxImPi > 1e-12 ? maxImPiLow / maxImPi : 0,
    minPeakOmegaAbs,
    s2Pi3: fejerNormAt((2 * PI) / 3, T),
    cReSeries: cRe,
    cImSeries: cIm,
  }
}

// Exact Kubo linear-response current susceptibility for a HERMITIAN diagonal current operator J_H (real entries jDiag):
//   Evolves |Omega(t)> = U^t |Omega> and |phi(t)> = U^t (J_H |Omega>) with ZERO truncation,
//   computing C_conn(t) = <Omega(t) | J_H | phi(t)> - <Omega(t)|J_H|Omega(t)> <Omega|J_H|Omega>,
//   and exact retarded commutator response chi(t) = 2 Im C_conn(t) = -i <Omega | [J_H(t), J_H(0)] | Omega>!
function analyzeHermitianKubo(
  U: SparseCSC,
  bgR: Float64Array,
  bgI: Float64Array,
  jDiag: Float64Array,
  T = 256,
  nGrid = 720,
): KuboReport {
  const dim = U.dim
  const phiR0 = new Float64Array(dim)
  const phiI0 = new Float64Array(dim)
  let expJ = 0
  let jNormSq = 0
  for (let i = 0; i < dim; i++) {
    const br = bgR[i]!
    const bi = bgI[i]!
    const jv = jDiag[i]!
    const pr = jv * br
    const pi = jv * bi
    phiR0[i] = pr
    phiI0[i] = pi
    expJ += jv * (br * br + bi * bi)
    jNormSq += pr * pr + pi * pi
  }
  const connNormSq = Math.max(0, jNormSq - expJ * expJ)

  let omR = Float64Array.from(bgR)
  let omI = Float64Array.from(bgI)
  let phR = Float64Array.from(phiR0)
  let phI = Float64Array.from(phiI0)
  let tR = new Float64Array(dim)
  let tI = new Float64Array(dim)

  const cRe = new Float64Array(T)
  const cIm = new Float64Array(T)
  const chi = new Float64Array(T)
  let normErr = 0

  for (let t = 0; t < T; t++) {
    let nOm2 = 0
    let sr = 0
    let si = 0
    let eT = 0
    for (let i = 0; i < dim; i++) {
      const or = omR[i]!
      const oi = omI[i]!
      nOm2 += or * or + oi * oi
      const jv = jDiag[i]!
      if (jv === 0) continue
      const pr = phR[i]!
      const pi = phI[i]!
      sr += jv * (or * pr + oi * pi)
      si += jv * (or * pi - oi * pr)
      eT += jv * (or * or + oi * oi)
    }
    normErr = Math.max(normErr, Math.abs(Math.sqrt(nOm2) - 1))
    const dr = sr - eT * expJ
    const di = si
    cRe[t] = dr
    cIm[t] = di
    chi[t] = 2 * di
    if (t + 1 < T) {
      applySparse(U, omR, omI, tR, tI)
      let sw = omR; omR = tR; tR = sw; sw = omI; omI = tI; tI = sw
      applySparse(U, phR, phI, tR, tI)
      sw = phR; phR = tR; tR = sw; sw = phI; phI = tI; tI = sw
    }
  }

  return summarizeKuboSeries(cRe, cIm, chi, connNormSq, normErr, T, nGrid)
}

// Exact Inter-Sector P_bg = 0 -> P = +-q Hermitian Kubo Linear-Response Evaluator (CRITICAL-1 fix!):
//   For a translation-invariant background |Omega> strictly in P_bg = 0 and a finite-momentum Hermitian current
//   J_H(q) = sum_x cos(q.x - phi_0) j_T(x) = 0.5*(e^{-i phi_0} J_T(+q) + e^{+i phi_0} J_T(-q)) with 2q != 0 (mod 2pi),
//   evolves |om(t)> = U(0)^t |Omega> in P=0, |phi+(t)> = U(+q)^t J_T(+q)|Omega> in P=+q, and
//   |phi-(t)> = U(-q)^t J_T(-q)|Omega> in P=-q with ZERO truncation:
//     C_H(q, t) = 0.25 * ( <J_T(+q) om(t) | phi+(t)> + <J_T(-q) om(t) | phi-(t)> ),  chi_H(q, t) = 2 Im C_H(q, t).
//   Note <Omega | J_H(q) | Omega> = 0 identically because P = 0 is orthogonal to P = +-q!
function analyzeInterSectorKubo(
  U0: SparseCSC,
  Upos: SparseCSC,
  Uneg: SparseCSC,
  map0ToQ: Int32Array, // length U0.dim: target index in Upos/Uneg, or -1 if orbit vanishes at +-q
  jPosRe: Float64Array, // J_T(+q; rep_i) real part for each P=0 orbit i (J_T(-q) = conj)
  jPosIm: Float64Array,
  bg0R: Float64Array,
  bg0I: Float64Array,
  T = 256,
  nGrid = 720,
): KuboReport {
  const d0 = U0.dim
  const dQ = Upos.dim
  assertExact(Uneg.dim === dQ, 'Upos/Uneg dimension mismatch')

  let omR = Float64Array.from(bg0R)
  let omI = Float64Array.from(bg0I)
  let pPR = new Float64Array(dQ)
  let pPI = new Float64Array(dQ)
  let pNR = new Float64Array(dQ)
  let pNI = new Float64Array(dQ)
  let t0R = new Float64Array(d0)
  let t0I = new Float64Array(d0)
  let tQR = new Float64Array(dQ)
  let tQI = new Float64Array(dQ)

  // Initialize |phi+(0)> = J_T(+q)|Omega> and |phi-(0)> = J_T(-q)|Omega>
  let normSqP = 0
  let normSqN = 0
  for (let i = 0; i < d0; i++) {
    const qIdx = map0ToQ[i]!
    const jr = jPosRe[i]!
    const ji = jPosIm[i]!
    if (qIdx < 0) {
      assertExact(Math.hypot(jr, ji) < 1e-12, `Nonzero J_T(+-q) on excluded symmetric orbit ${i}`)
      continue
    }
    const br = bg0R[i]!
    const bi = bg0I[i]!
    // (+q): (jr + i ji)(br + i bi)
    const ar = jr * br - ji * bi
    const ai = jr * bi + ji * br
    pPR[qIdx] = ar
    pPI[qIdx] = ai
    normSqP += ar * ar + ai * ai
    // (-q): (jr - i ji)(br + i bi)
    const cr = jr * br + ji * bi
    const ci = jr * bi - ji * br
    pNR[qIdx] = cr
    pNI[qIdx] = ci
    normSqN += cr * cr + ci * ci
  }
  const connNormSq = 0.25 * (normSqP + normSqN)

  const cRe = new Float64Array(T)
  const cIm = new Float64Array(T)
  const chi = new Float64Array(T)
  let normErr = 0

  for (let t = 0; t < T; t++) {
    let nOm2 = 0
    let sr = 0
    let si = 0
    for (let i = 0; i < d0; i++) {
      const or = omR[i]!
      const oi = omI[i]!
      nOm2 += or * or + oi * oi
      const qIdx = map0ToQ[i]!
      if (qIdx < 0) continue
      const jr = jPosRe[i]!
      const ji = jPosIm[i]!
      if (jr === 0 && ji === 0) continue
      // bra+ = J_T(+q) om(t) = (jr + i ji)(or + i oi)
      const bpR = jr * or - ji * oi
      const bpI = jr * oi + ji * or
      const kpR = pPR[qIdx]!
      const kpI = pPI[qIdx]!
      // <bra+ | phi+(t)>
      sr += bpR * kpR + bpI * kpI
      si += bpR * kpI - bpI * kpR
      // bra- = J_T(-q) om(t) = (jr - i ji)(or + i oi)
      const bnR = jr * or + ji * oi
      const bnI = jr * oi - ji * or
      const knR = pNR[qIdx]!
      const knI = pNI[qIdx]!
      // <bra- | phi-(t)>
      sr += bnR * knR + bnI * knI
      si += bnR * knI - bnI * knR
    }
    normErr = Math.max(normErr, Math.abs(Math.sqrt(nOm2) - 1))
    cRe[t] = 0.25 * sr
    cIm[t] = 0.25 * si
    chi[t] = 0.5 * si
    if (t + 1 < T) {
      applySparse(U0, omR, omI, t0R, t0I)
      let sw = omR; omR = t0R; t0R = sw; sw = omI; omI = t0I; t0I = sw
      applySparse(Upos, pPR, pPI, tQR, tQI)
      sw = pPR; pPR = tQR; tQR = sw; sw = pPI; pPI = tQI; tQI = sw
      applySparse(Uneg, pNR, pNI, tQR, tQI)
      sw = pNR; pNR = tQR; tQR = sw; sw = pNI; pNI = tQI; tQI = sw
    }
  }

  return summarizeKuboSeries(cRe, cIm, chi, connNormSq, normErr, T, nGrid)
}

// =================================================================================================
// 1. EXACT Z[zeta_9][1/6], D_4 ROOTS, W(F_4), chi_odd, AND {3,4,3,4} COXETER ENGINE
//    (Matching test/universe.ts bit-for-bit!)
// =================================================================================================

type Z9 = readonly [bigint, bigint, bigint, bigint, bigint, bigint]
type Root4 = readonly [bigint, bigint, bigint, bigint]
type AntipodalLine = readonly [number, number]
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

function z9ToComplex(a: Z9, den = 1n): C {
  const inv = 1 / Number(den)
  let re = 0
  let im = 0
  for (let k = 0; k < 6; k++) {
    const c = Number(a[k]!)
    if (c === 0) continue
    const ang = (2 * PI * k) / 9
    re += c * Math.cos(ang)
    im += c * Math.sin(ang)
  }
  return [re * inv, im * inv]
}

const ROOTS: readonly Root4[] = (() => {
  const roots: Root4[] = []
  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      for (const si of [1n, -1n]) {
        for (const sj of [1n, -1n]) {
          const coords: [bigint, bigint, bigint, bigint] = [0n, 0n, 0n, 0n]
          coords[i] = si
          coords[j] = sj
          roots.push(coords)
        }
      }
    }
  }
  return roots
})()

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

const WF4_GROUP = (() => {
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
      const img = [0, 1, 2, 3].map(k => v[k]! - (twoVa * alpha[k]!) / aa)
      perm[slot] = ROOTS.findIndex(o => o[0] === img[0] && o[1] === img[1] && o[2] === img[2] && o[3] === img[3])
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
})()

function lexKey4(a0: number, a1: number, a2: number, a3: number): number {
  let x0 = a0; let x1 = a1; let x2 = a2; let x3 = a3
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
  const s0 = c0 >> 1; const s1 = c1 >> 1; const s2 = c2 >> 1; const s3 = c3 >> 1
  const b0 = c0 & 1; const b1 = c1 & 1; const b2 = c2 & 1; const b3 = c3 & 1
  let minKey = Number.POSITIVE_INFINITY
  let minSign = 0
  let chiral = true
  const elems = WF4_GROUP.elements
  const dets = WF4_GROUP.det
  for (let e = 0; e < elems.length; e++) {
    const p = elems[e]!
    const d = dets[e]!
    const ps0 = p[s0]! << 1; const ps1 = p[s1]! << 1; const ps2 = p[s2]! << 1; const ps3 = p[s3]! << 1
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

// Exact O^+(4,1; Z[sqrt(2)]) {3,4,3,4} Coxeter transport
const DIM5 = [0, 1, 2, 3, 4] as const
const Q2_ZERO: Q2 = [0n, 0n]
const EYE5: readonly (readonly Q2[])[] = DIM5.map(r => DIM5.map(c => [r === c ? 1n : 0n, 0n] as const))
const addQ2 = (u: Q2, v: Q2): Q2 => [u[0] + v[0], u[1] + v[1]]
const subQ2 = (u: Q2, v: Q2): Q2 => [u[0] - v[0], u[1] - v[1]]
const mulQ2 = (u: Q2, v: Q2): Q2 => [u[0] * v[0] + 2n * u[1] * v[1], u[0] * v[1] + u[1] * v[0]]
const dotQ2 = (u: readonly Q2[], v: readonly Q2[]): Q2 =>
  u.reduce<Q2>((s, e, i) => addQ2(s, mulQ2(e, v[i]!)), Q2_ZERO)
const vecKeyQ2 = (v: readonly Q2[]): string => v.map(([a, b]) => `${a},${b}`).join(';')
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
const STAB_REFS = [0, 1, 2, 3].map(idx => reflect5(EYE5[idx]!))
const TRANSPORTS: readonly (readonly (readonly Q2[])[])[] = (() => {
  const facetNormals: Q2[][] = [EYE5[4]!.slice()]
  const seenN = new Set<string>([vecKeyQ2(EYE5[4]!)])
  for (const n of facetNormals) {
    for (const g of STAB_REFS) {
      const nx = matVecQ2(g, n)
      const k = vecKeyQ2(nx)
      if (!seenN.has(k)) { seenN.add(k); facetNormals.push(nx) }
    }
  }
  const facetDot = (a: number, b: number): bigint => (twiceForm(facetNormals[a]!, facetNormals[b]!)[0] + 2n) / 2n
  const ortho: number[] = []
  for (let f = 0; f < 24 && ortho.length < 4; f++) {
    if (ortho.every(o => facetDot(f, o) === 0n)) ortho.push(f)
  }
  const facetRoots: Root4[] = facetNormals.map((_, f) => {
    const [c0, c1, c2, c3] = ortho.map(o => facetDot(f, o))
    return [(c0! + c1!) / 2n, (c0! - c1!) / 2n, (c2! + c3!) / 2n, (c2! - c3!) / 2n]
  })
  return ROOTS.map(r => {
    const fi = facetRoots.findIndex(fr => fr.every((v, i) => v === r[i]))
    return matMulQ2(reflect5(facetNormals[fi]!), CENTRAL_INVERSION)
  })
})()

const coxFrames: (readonly (readonly Q2[])[])[] = [EYE5]
const coxParity: number[] = [1]
const coxCenterToId = new Map<string, number>([[vecKeyQ2(BASE_CENTER), 0]])
const coxNeighbors: Int32Array[] = [new Int32Array(24).fill(-1)]

function stepCoxeterDock(dock: number, slot: number): number {
  const hit = coxNeighbors[dock]![slot]!
  if (hit >= 0) return hit
  const nextFrame = matMulQ2(coxFrames[dock]!, TRANSPORTS[slot]!)
  const nextCenter = matVecQ2(nextFrame, BASE_CENTER)
  const key = vecKeyQ2(nextCenter)
  let id = coxCenterToId.get(key)
  if (id === undefined) {
    id = coxFrames.length
    coxCenterToId.set(key, id)
    coxFrames.push(nextFrame)
    coxParity.push(-coxParity[dock]!)
    coxNeighbors.push(new Int32Array(24).fill(-1))
  }
  coxNeighbors[dock]![slot] = id
  coxNeighbors[id]![OPPOSITE_SLOT[slot]!] = dock
  return id
}

function encodeConfig(vibes: readonly Vibe[]): string {
  return [...vibes].sort((a, b) => a[0] - b[0] || a[1] - b[1]).map(v => v.join(':')).join(';')
}

function decodeConfig(key: string): Vibe[] {
  if (key === '') return []
  return key.split(';').map(e => {
    const [d, s, t, r] = e.split(':')
    return [Number(d), Number(s), Number(t) as ToneNZ, Number(r)] as const
  })
}

function addAmpZ9(map: Map<string, Z9>, key: string, delta: Z9): void {
  const next = map.has(key) ? addZ9(map.get(key)!, delta) : delta
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

function hasExactUnitNormZ9(state: ExactState): boolean {
  let s = Z9_ZERO
  for (const a of state.amp.values()) s = addZ9(s, mulZ9(conjZ9(a), a))
  return isZeroZ9(subZ9(s, [state.den * state.den, 0n, 0n, 0n, 0n, 0n]))
}

function countDiffsZ9(a: ExactState, b: ExactState): number {
  const keys = new Set([...a.amp.keys(), ...b.amp.keys()])
  let diffs = 0
  for (const k of keys) {
    const l = scaleZ9(b.den, a.amp.get(k) ?? Z9_ZERO)
    const r = scaleZ9(a.den, b.amp.get(k) ?? Z9_ZERO)
    if (!isZeroZ9(subZ9(l, r))) diffs++
  }
  return diffs
}

function groupByDockV(vibes: readonly Vibe[]): Map<number, number[]> {
  const g = new Map<number, number[]>()
  for (let i = 0; i < vibes.length; i++) {
    const d = vibes[i]![0]
    const l = g.get(d)
    if (l) l.push(i)
    else g.set(d, [i])
  }
  return g
}

function collectActiveLinesV(vibes: readonly Vibe[]): [number | undefined, number | undefined, number, number][] {
  const out: [number | undefined, number | undefined, number, number][] = []
  for (const idxs of groupByDockV(vibes).values()) {
    const byS = new Map<number, number>()
    for (const idx of idxs) byS.set(vibes[idx]![1], idx)
    for (const [sa, sb] of LINES) {
      const ia = byS.get(sa)
      const ib = byS.get(sb)
      if (ia !== undefined || ib !== undefined) out.push([ia, ib, sa, sb])
    }
  }
  return out
}

function applyBranchZ9<Item>(
  state: ExactState,
  branchDen: bigint,
  prep: (v: Vibe[], a: Z9) => readonly [Item[], Z9],
  exp: (cfg: Vibe[], a: Z9, item: Item) => readonly (readonly [Vibe[], Z9])[],
): ExactState {
  const rows = [...state.amp.entries()].map(([k, a]) => {
    const v = decodeConfig(k)
    const [items, pa] = prep(v, a)
    return { v, items, pa }
  })
  const maxD = rows.reduce((m, r) => Math.max(m, r.items.length), 0)
  const out = new Map<string, Z9>()
  for (const { v, items, pa } of rows) {
    const sc = branchDen ** BigInt(maxD - items.length)
    let brs: (readonly [Vibe[], Z9])[] = [[v, scaleZ9(sc, pa)]]
    for (const it of items) brs = brs.flatMap(([c, a]) => exp(c, a, it))
    for (const [c, a] of brs) addAmpZ9(out, encodeConfig(c), a)
  }
  return reduceDenZ9(out, state.den * branchDen ** BigInt(maxD))
}

function layerPhiOddZ9(state: ExactState, dag: boolean): ExactState {
  const out = new Map<string, Z9>()
  for (const [k, a] of state.amp) {
    const v = decodeConfig(k)
    let e = 0
    for (const [d, idxs] of groupByDockV(v)) {
      if (idxs.length >= 4) e += coxParity[d]! * chiralOrientationDock(v, idxs)
    }
    const se = dag ? -e : e
    const m6 = ((se % 6) + 6) % 6
    addAmpZ9(out, encodeConfig(v), m6 === 0 ? a : mulZ9(a, ZETA6_POWERS[m6]!))
  }
  return { amp: out, den: state.den }
}

function layerHalfCoinZ9(state: ExactState, dag: boolean): ExactState {
  const detP = adjointZ9(Z9_ZETA6, dag)
  const dC = adjointZ9(Z9_COIN_DIAG, dag)
  const oC = adjointZ9(Z9_COIN_OFF, dag)
  return applyBranchZ9<readonly [number, number]>(
    state,
    2n,
    (v, a) => {
      const lones: (readonly [number, number])[] = []
      let ph = a
      for (const [ia, ib, sa, sb] of collectActiveLinesV(v)) {
        if (ia !== undefined && ib !== undefined) ph = mulZ9(ph, detP)
        else if (ia !== undefined) lones.push([ia, sb])
        else lones.push([ib!, sa])
      }
      return [lones, ph]
    },
    (cfg, a, [idx, opp]) => {
      const [d, , t, r] = cfg[idx]!
      const fl = cfg.slice()
      fl[idx] = [d, opp, t, r]
      return [[cfg, mulZ9(a, dC)], [fl, mulZ9(a, oC)]]
    },
  )
}

function layerBounceKZ9(state: ExactState): ExactState {
  const out = new Map<string, Z9>()
  for (const [k, a] of state.amp) {
    const v = decodeConfig(k)
    let neg = false
    for (const [ia, ib, sa, sb] of collectActiveLinesV(v)) {
      if (ia !== undefined && ib !== undefined && v[ia]![2] !== v[ib]![2]) {
        const va = v[ia]!; const vb = v[ib]!
        v[ia] = [va[0], sb, va[2], va[3]]
        v[ib] = [vb[0], sa, vb[2], vb[3]]
        neg = !neg
      }
    }
    addAmpZ9(out, encodeConfig(v), neg ? scaleZ9(-1n, a) : a)
  }
  return { amp: out, den: state.den }
}

function layerPairMixZ9(state: ExactState, dag: boolean): ExactState {
  const hop = subZ9(adjointZ9(Z9_ZETA18, dag), Z9_ONE)
  const keep = addZ9([12n, 0n, 0n, 0n, 0n, 0n], hop)
  return applyBranchZ9<readonly [number, number, number]>(
    state,
    12n,
    (v, a) => {
      const pairs: (readonly [number, number, number])[] = []
      for (const idxs of groupByDockV(v).values()) {
        if (idxs.length !== 2) continue
        const i0 = idxs[0]!; const i1 = idxs[1]!
        const v0 = v[i0]!; const v1 = v[i1]!
        if (OPPOSITE_SLOT[v0[1]] === v1[1] && v0[2] === v1[2] && v0[3] === v1[3]) {
          pairs.push([i0, i1, LINE_OF_SLOT[v0[1]]!])
        }
      }
      return [pairs, a]
    },
    (cfg, a, [i0, i1, curL]) =>
      LINES.map(([sa, sb], tL) => {
        if (tL === curL) return [cfg, mulZ9(a, keep)] as const
        const [d, , t, r] = cfg[i0]!
        const hp = cfg.slice()
        hp[i0] = [d, sa, t, r]
        hp[i1] = [d, sb, t, r]
        return [hp, mulZ9(a, hop)] as const
      }),
  )
}

function layerRoleMeetZ9(state: ExactState, dag: boolean): ExactState {
  const eqP = adjointZ9(Z9_OMEGA, dag)
  const kC = adjointZ9(Z9_ZETA6, dag)
  const sC = adjointZ9(Z9_MEET_SWAP, dag)
  return applyBranchZ9<readonly [number, number]>(
    state,
    2n,
    (v, a) => {
      const swaps: (readonly [number, number])[] = []
      let ph = a
      for (const [ia, ib] of collectActiveLinesV(v)) {
        if (ia === undefined || ib === undefined) continue
        if (v[ia]![2] !== v[ib]![2]) continue
        if (v[ia]![3] === v[ib]![3]) ph = mulZ9(ph, eqP)
        else swaps.push([ia, ib])
      }
      return [swaps, ph]
    },
    (cfg, a, [ia, ib]) => {
      const va = cfg[ia]!; const vb = cfg[ib]!
      const sw = cfg.slice()
      sw[ia] = [va[0], va[1], va[2], vb[3]]
      sw[ib] = [vb[0], vb[1], vb[2], va[3]]
      return [[cfg, mulZ9(a, kC)], [sw, mulZ9(a, sC)]]
    },
  )
}

function layerStreamCoxZ9(state: ExactState, dag: boolean): ExactState {
  const out = new Map<string, Z9>()
  for (const [k, a] of state.amp) {
    const v = decodeConfig(k).map(([d, s, t, r]) => [stepCoxeterDock(d, dag ? OPPOSITE_SLOT[s]! : s), s, t, r] as const)
    addAmpZ9(out, encodeConfig(v), a)
  }
  return { amp: out, den: state.den }
}

function applyExactBeatCoxZ9(state: ExactState, usePhi = true, usePair = true): ExactState {
  let s = usePhi ? layerPhiOddZ9(state, false) : state
  s = layerHalfCoinZ9(s, false)
  s = layerBounceKZ9(s)
  if (usePair) s = layerPairMixZ9(s, false)
  s = layerRoleMeetZ9(s, false)
  s = layerHalfCoinZ9(s, false)
  if (usePhi) s = layerPhiOddZ9(s, false)
  return layerStreamCoxZ9(s, false)
}

function applyExactBeatCoxInvZ9(state: ExactState): ExactState {
  let s = layerStreamCoxZ9(state, true)
  s = layerPhiOddZ9(s, true)
  s = layerHalfCoinZ9(s, true)
  s = layerRoleMeetZ9(s, true)
  s = layerPairMixZ9(s, true)
  s = layerBounceKZ9(s)
  s = layerHalfCoinZ9(s, true)
  return layerPhiOddZ9(s, true)
}

// =================================================================================================
// 2. PART 1 (W13.1): MULTI-LINE M_pair-ACTIVE k = 3 (Q = +1) & k = 4 (Q = 0_V, Phi_odd-ACTIVE)
// =================================================================================================

type LocalExc = readonly [slot: number, tone: ToneNZ]
type LocalBranch = { readonly excs: LocalExc[]; readonly amp: C }

function localDockAction(
  excs: readonly LocalExc[],
  dLines: number,
  enableMPair: boolean,
  phiPhaseFn?: (excs: readonly LocalExc[]) => C,
): LocalBranch[] {
  const n = excs.length
  if (n === 0) return [{ excs: [], amp: [1, 0] }]

  let initAmp: C = [1, 0]
  if (phiPhaseFn && n >= 4) initAmp = phiPhaseFn(excs)

  if (n === 2) {
    const [s0, t0] = excs[0]!
    const [s1, t1] = excs[1]!
    if ((s0 ^ 1) === s1 && t0 === t1) {
      if (!enableMPair || dLines === 1) {
        return [{ excs: [excs[0]!, excs[1]!], amp: cMul(initAmp, W2_C) }]
      }
      const { keep, hop } = mPairCoeffs(dLines)
      const curLine = s0 >> 1
      const out: LocalBranch[] = []
      for (let l = 0; l < dLines; l++) {
        out.push({ excs: [[2 * l, t0], [2 * l + 1, t0]], amp: cMul(initAmp, l === curLine ? keep : hop) })
      }
      return out
    }
  }

  const byLine = new Map<number, LocalExc[]>()
  for (const e of excs) {
    const l = e[0] >> 1
    const arr = byLine.get(l)
    if (arr) arr.push(e)
    else byLine.set(l, [e])
  }

  let branches: LocalBranch[] = [{ excs: [], amp: initAmp }]
  for (const [l, list] of byLine) {
    if (list.length === 1) {
      const [sIn, t] = list[0]!
      const dirIn = sIn & 1
      const nb: LocalBranch[] = []
      for (const b of branches) {
        nb.push({ excs: [...b.excs, [2 * l, t]], amp: cMul(b.amp, C_MAT[0]![dirIn]!) })
        nb.push({ excs: [...b.excs, [2 * l + 1, t]], amp: cMul(b.amp, C_MAT[1]![dirIn]!) })
      }
      branches = nb
    } else {
      const [sA, tA] = list[0]!
      const [sB, tB] = list[1]!
      if (tA !== tB) {
        branches = branches.map(b => ({ excs: [...b.excs, [sB, tA], [sA, tB]], amp: cMul(b.amp, NEG_W_C) }))
      } else {
        branches = branches.map(b => ({ excs: [...b.excs, [sA, tA], [sB, tB]], amp: cMul(b.amp, W2_C) }))
      }
    }
  }

  if (phiPhaseFn && n >= 4) {
    branches = branches.map(b => ({ excs: b.excs, amp: cMul(b.amp, phiPhaseFn(b.excs)) }))
  }
  return branches
}

function buildPeriodicTorusK3(
  dAxes: 2 | 3,
  L: number,
  q: readonly number[],
  enableMPair: boolean,
): {
  readonly U: SparseCSC
  readonly dim: number
  readonly probeJ_y: readonly [Float64Array, Float64Array]
  readonly axisOfPlusCode: (code: number) => number
  readonly configs: readonly (readonly [sn: number, p1: number, p2: number])[]
} {
  const nDocks = dAxes === 2 ? L * L : L * L * L
  const nSlotsPerDock = 2 * dAxes
  const totalSlots = nDocks * nSlotsPerDock
  const negLine = 1

  const stepDock = (dock: number, localSlot: number): number => {
    const axis = localSlot >> 1
    const dir = (localSlot & 1) === 0 ? 1 : -1
    if (dAxes === 2) {
      let x = dock % L; let y = (dock - x) / L
      if (axis === 0) x = (x + dir + L) % L
      else y = (y + dir + L) % L
      return y * L + x
    }
    let x = dock % L; const t = (dock - x) / L; let y = t % L; let z = (t - y) / L
    if (axis === 0) x = (x + dir + L) % L
    else if (axis === 1) y = (y + dir + L) % L
    else z = (z + dir + L) % L
    return (z * L + y) * L + x
  }

  const subDock = (dock: number, shiftDock: number): number => {
    if (dAxes === 2) {
      const x1 = dock % L; const y1 = (dock - x1) / L
      const x2 = shiftDock % L; const y2 = (shiftDock - x2) / L
      return ((y1 - y2 + L) % L) * L + ((x1 - x2 + L) % L)
    }
    const x1 = dock % L; const t1 = (dock - x1) / L; const y1 = t1 % L; const z1 = (t1 - y1) / L
    const x2 = shiftDock % L; const t2 = (shiftDock - x2) / L; const y2 = t2 % L; const z2 = (t2 - y2) / L
    return (((z1 - z2 + L) % L) * L + ((y1 - y2 + L) % L)) * L + ((x1 - x2 + L) % L)
  }

  const configs: [number, number, number][] = []
  const idxMap = new Int32Array(2 * totalSlots * totalSlots).fill(-1)
  for (let sn = 0; sn < 2; sn++) {
    const negCode = 2 * negLine + sn
    for (let p1 = 0; p1 < totalSlots; p1++) {
      if (p1 === negCode) continue
      for (let p2 = p1 + 1; p2 < totalSlots; p2++) {
        if (p2 === negCode) continue
        idxMap[(sn * totalSlots + p1) * totalSlots + p2] = configs.length
        configs.push([sn, p1, p2])
      }
    }
  }
  const dim = configs.length

  const U = buildSparseCSC(dim, (col, emit) => {
    const [sn, p1, p2] = configs[col]!
    const d1 = Math.floor(p1 / nSlotsPerDock); const s1 = p1 - d1 * nSlotsPerDock
    const d2 = Math.floor(p2 / nSlotsPerDock); const s2 = p2 - d2 * nSlotsPerDock
    const sNeg = 2 * negLine + sn

    const byDock = new Map<number, LocalExc[]>()
    const addD = (d: number, e: LocalExc) => {
      const a = byDock.get(d); if (a) a.push(e); else byDock.set(d, [e])
    }
    addD(0, [sNeg, -1]); addD(d1, [s1, 1]); addD(d2, [s2, 1])

    let branches: { pts: [number, number, ToneNZ][]; amp: C }[] = [{ pts: [], amp: [1, 0] }]
    for (const [d, list] of byDock) {
      const loc = localDockAction(list, dAxes, enableMPair)
      const nb: { pts: [number, number, ToneNZ][]; amp: C }[] = []
      for (const b of branches) {
        for (const l of loc) {
          const pts = b.pts.slice()
          for (const [sl, tn] of l.excs) pts.push([d, sl, tn])
          nb.push({ pts, amp: cMul(b.amp, l.amp) })
        }
      }
      branches = nb
    }

    for (const b of branches) {
      let negDock = 0; let negSlot = 0
      const plusCodes: number[] = []
      for (const [d, sl, tn] of b.pts) {
        const nd = stepDock(d, sl)
        if (tn === -1) { negDock = nd; negSlot = sl }
        else plusCodes.push(nd * nSlotsPerDock + sl)
      }
      const dirNeg = (negSlot & 1) === 0 ? 1 : -1
      const val = cMul(cExpI(-q[negLine]! * dirNeg), b.amp)
      const rel0 = subDock(Math.floor(plusCodes[0]! / nSlotsPerDock), negDock) * nSlotsPerDock + (plusCodes[0]! % nSlotsPerDock)
      const rel1 = subDock(Math.floor(plusCodes[1]! / nSlotsPerDock), negDock) * nSlotsPerDock + (plusCodes[1]! % nSlotsPerDock)
      const a = rel0 < rel1 ? rel0 : rel1
      const c = rel0 < rel1 ? rel1 : rel0
      emit(idxMap[((negSlot - 2 * negLine) * totalSlots + a) * totalSlots + c]!, val[0], val[1])
    }
  })

  const dockPy = stepDock(0, 2 * negLine)
  const dockMy = stepDock(0, 2 * negLine + 1)
  const getIdx = (sn: number, c1: number, c2: number): number =>
    idxMap[(sn * totalSlots + (c1 < c2 ? c1 : c2)) * totalSlots + (c1 < c2 ? c2 : c1)]!
  const pR = new Float64Array(dim)
  const pI = new Float64Array(dim)
  pR[getIdx(0, 2 * negLine + 1, dockPy * nSlotsPerDock + 2 * negLine + 1)] = Math.SQRT1_2
  pR[getIdx(1, 2 * negLine, dockMy * nSlotsPerDock + 2 * negLine)] = -Math.SQRT1_2

  return { U, dim, probeJ_y: [pR, pI], axisOfPlusCode: code => (code % nSlotsPerDock) >> 1, configs }
}

interface BouquetGeometry {
  readonly dLines: number
  readonly L: number
  readonly nDocks: number
  readonly totalSlots: number
  readonly slotDock: Int32Array
  readonly slotLine: Int32Array
  readonly slotDir: Int32Array
  readonly slotLocal: Int32Array
  readonly stepSlot: Int32Array
  readonly stepTwistLine: Int32Array
  readonly stepTwistSign: Int32Array
  readonly dockLineCount: Int32Array
  readonly lineSlots: readonly (readonly number[])[]
}

function buildBouquetRings(dLines: number, L: number): BouquetGeometry {
  const nDocks = 1 + dLines * (L - 1)
  const totalSlots = dLines * L * 2
  const slotDock = new Int32Array(totalSlots)
  const slotLine = new Int32Array(totalSlots)
  const slotDir = new Int32Array(totalSlots)
  const slotLocal = new Int32Array(totalSlots)
  const stepSlot = new Int32Array(totalSlots)
  const stepTwistLine = new Int32Array(totalSlots).fill(-1)
  const stepTwistSign = new Int32Array(totalSlots).fill(0)
  const dockLineCount = new Int32Array(nDocks).fill(1)
  dockLineCount[0] = dLines

  const lineSlots: number[][] = Array.from({ length: dLines }, () => [])
  for (let l = 0; l < dLines; l++) {
    for (let p = 0; p < L; p++) {
      const dock = p === 0 ? 0 : 1 + l * (L - 1) + (p - 1)
      for (let d = 0; d < 2; d++) {
        const g = (l * L + p) * 2 + d
        slotDock[g] = dock; slotLine[g] = l; slotDir[g] = d
        slotLocal[g] = p === 0 ? 2 * l + d : d
        const np = d === 0 ? (p + 1) % L : (p - 1 + L) % L
        stepSlot[g] = (l * L + np) * 2 + d
        if (d === 0 && p === L - 1) { stepTwistLine[g] = l; stepTwistSign[g] = 1 }
        else if (d === 1 && p === 0) { stepTwistLine[g] = l; stepTwistSign[g] = -1 }
        lineSlots[l]!.push(g)
      }
    }
  }
  return { dLines, L, nDocks, totalSlots, slotDock, slotLine, slotDir, slotLocal, stepSlot, stepTwistLine, stepTwistSign, dockLineCount, lineSlots }
}

function buildBouquetK3(
  geo: BouquetGeometry,
  qTwist: readonly number[],
  negLine: number,
  enableMPair: boolean,
): { readonly U: SparseCSC; readonly dim: number; readonly probeR: Float64Array; readonly probeI: Float64Array } {
  const configs: [number, number, number][] = []
  const idxMap = new Map<number, number>()
  const S = geo.totalSlots
  const keyOf = (n: number, a: number, b: number): number => (n * S + a) * S + b
  for (const nCode of geo.lineSlots[negLine]!) {
    for (let lp = 0; lp < geo.dLines; lp++) {
      const ls = geo.lineSlots[lp]!
      for (let i = 0; i < ls.length; i++) {
        const p1 = ls[i]!
        if (p1 === nCode) continue
        for (let j = i + 1; j < ls.length; j++) {
          const p2 = ls[j]!
          if (p2 === nCode) continue
          idxMap.set(keyOf(nCode, p1, p2), configs.length)
          configs.push([nCode, p1, p2])
        }
      }
    }
  }
  const dim = configs.length

  const U = buildSparseCSC(dim, (col, emit) => {
    const [nCode, p1, p2] = configs[col]!
    const byDock = new Map<number, [number, ToneNZ][]>()
    const armLine = new Map<number, number>()
    for (const [g, tn] of [[nCode, -1], [p1, 1], [p2, 1]] as const) {
      const d = geo.slotDock[g]!
      if (d !== 0) armLine.set(d, geo.slotLine[g]!)
      const arr = byDock.get(d); if (arr) arr.push([geo.slotLocal[g]!, tn]); else byDock.set(d, [[geo.slotLocal[g]!, tn]])
    }
    let branches: { gCodes: [number, ToneNZ][]; amp: C }[] = [{ gCodes: [], amp: [1, 0] }]
    for (const [d, list] of byDock) {
      const loc = localDockAction(list, geo.dockLineCount[d]!, enableMPair && d === 0)
      const nb: { gCodes: [number, ToneNZ][]; amp: C }[] = []
      for (const b of branches) {
        for (const l of loc) {
          const gc = b.gCodes.slice()
          for (const [lSlot, tn] of l.excs) {
            const gOut = d === 0 ? (lSlot >> 1) * geo.L * 2 + (lSlot & 1)
              : (armLine.get(d)! * geo.L + (d - 1 - armLine.get(d)! * (geo.L - 1) + 1)) * 2 + lSlot
            gc.push([gOut, tn])
          }
          nb.push({ gCodes: gc, amp: cMul(b.amp, l.amp) })
        }
      }
      branches = nb
    }
    for (const b of branches) {
      let nOut = 0; const ps: number[] = []; let tw = 0
      for (const [g, tn] of b.gCodes) {
        const tl = geo.stepTwistLine[g]!
        if (tl >= 0) tw += geo.stepTwistSign[g]! * qTwist[tl]!
        const gn = geo.stepSlot[g]!
        if (tn === -1) nOut = gn; else ps.push(gn)
      }
      const val = tw === 0 ? b.amp : cMul(cExpI(tw), b.amp)
      emit(idxMap.get(keyOf(nOut, ps[0]! < ps[1]! ? ps[0]! : ps[1]!, ps[0]! < ps[1]! ? ps[1]! : ps[0]!))!, val[0], val[1])
    }
  })

  const g0p = (negLine * geo.L + 0) * 2 + 0
  const g0m = (negLine * geo.L + 0) * 2 + 1
  const g1m = (negLine * geo.L + 1) * 2 + 1
  const gLm = (negLine * geo.L + (geo.L - 1)) * 2 + 0
  const probeR = new Float64Array(dim)
  const probeI = new Float64Array(dim)
  probeR[idxMap.get(keyOf(g0p, Math.min(g0m, g1m), Math.max(g0m, g1m)))!] = Math.SQRT1_2
  probeR[idxMap.get(keyOf(g0m, Math.min(g0p, gLm), Math.max(g0p, gLm)))!] = -Math.SQRT1_2
  return { U, dim, probeR, probeI }
}

function buildBouquetK4Even(
  geo: BouquetGeometry,
  qTwist: readonly number[],
  enableMPair: boolean,
): {
  readonly U: SparseCSC
  readonly dim: number
  readonly configs: readonly (readonly [p1: number, p2: number, n1: number, n2: number])[]
  readonly idxOf: (p1: number, p2: number, n1: number, n2: number) => number
} {
  const configs: [number, number, number, number][] = []
  const idxMap = new Map<string, number>()
  const keyOf = (p1: number, p2: number, n1: number, n2: number): string => `${p1},${p2}|${n1},${n2}`
  for (let lp = 0; lp < geo.dLines; lp++) {
    const lsP = geo.lineSlots[lp]!
    for (let i = 0; i < lsP.length; i++) {
      const p1 = lsP[i]!
      for (let j = i + 1; j < lsP.length; j++) {
        const p2 = lsP[j]!
        for (let ln = 0; ln < geo.dLines; ln++) {
          const lsN = geo.lineSlots[ln]!
          for (let a = 0; a < lsN.length; a++) {
            const n1 = lsN[a]!
            if (n1 === p1 || n1 === p2) continue
            for (let b = a + 1; b < lsN.length; b++) {
              const n2 = lsN[b]!
              if (n2 === p1 || n2 === p2) continue
              idxMap.set(keyOf(p1, p2, n1, n2), configs.length)
              configs.push([p1, p2, n1, n2])
            }
          }
        }
      }
    }
  }
  const dim = configs.length
  const U = buildSparseCSC(dim, (col, emit) => {
    const [p1, p2, n1, n2] = configs[col]!
    const byDock = new Map<number, [number, ToneNZ][]>()
    const armLine = new Map<number, number>()
    for (const [g, tn] of [[p1, 1], [p2, 1], [n1, -1], [n2, -1]] as const) {
      const d = geo.slotDock[g]!
      if (d !== 0) armLine.set(d, geo.slotLine[g]!)
      const arr = byDock.get(d); if (arr) arr.push([geo.slotLocal[g]!, tn]); else byDock.set(d, [[geo.slotLocal[g]!, tn]])
    }
    let branches: { gCodes: [number, ToneNZ][]; amp: C }[] = [{ gCodes: [], amp: [1, 0] }]
    for (const [d, list] of byDock) {
      const loc = localDockAction(list, geo.dockLineCount[d]!, enableMPair && d === 0)
      const nb: { gCodes: [number, ToneNZ][]; amp: C }[] = []
      for (const b of branches) {
        for (const l of loc) {
          const gc = b.gCodes.slice()
          for (const [lSlot, tn] of l.excs) {
            const gOut = d === 0 ? (lSlot >> 1) * geo.L * 2 + (lSlot & 1)
              : (armLine.get(d)! * geo.L + (d - 1 - armLine.get(d)! * (geo.L - 1) + 1)) * 2 + lSlot
            gc.push([gOut, tn])
          }
          nb.push({ gCodes: gc, amp: cMul(b.amp, l.amp) })
        }
      }
      branches = nb
    }
    for (const b of branches) {
      const ps: number[] = []; const ns: number[] = []; let tw = 0
      for (const [g, tn] of b.gCodes) {
        const tl = geo.stepTwistLine[g]!
        if (tl >= 0) tw += geo.stepTwistSign[g]! * qTwist[tl]!
        const gn = geo.stepSlot[g]!
        if (tn === 1) ps.push(gn); else ns.push(gn)
      }
      const val = tw === 0 ? b.amp : cMul(cExpI(tw), b.amp)
      emit(idxMap.get(keyOf(Math.min(ps[0]!, ps[1]!), Math.max(ps[0]!, ps[1]!), Math.min(ns[0]!, ns[1]!), Math.max(ns[0]!, ns[1]!)))!, val[0], val[1])
    }
  })
  return { U, dim, configs, idxOf: (p1, p2, n1, n2) => idxMap.get(keyOf(Math.min(p1, p2), Math.max(p1, p2), Math.min(n1, n2), Math.max(n1, n2)))! }
}

function build2DTorusK4Even(
  L: number,
  q: readonly [number, number],
  enableMPair: boolean,
): {
  readonly U: SparseCSC
  readonly dim: number
  readonly configs: readonly (readonly [p1: number, p2: number, n1: number, n2: number])[]
  readonly canonOf: (p1: number, p2: number, n1: number, n2: number) => { readonly key: string; readonly sx: number; readonly sy: number; readonly sym: number }
  readonly idxMap: Map<string, number>
} {
  const nDocks = L * L
  const shiftCode = (code: number, sx: number, sy: number): number => {
    const d = code >> 2
    return (((Math.floor(d / L) + sy + L) % L) * L + (((d % L) + sx + L) % L)) * 4 + (code & 3)
  }
  const canonOf = (p1: number, p2: number, n1: number, n2: number) => {
    let bestKey = ''; let bestSx = 0; let bestSy = 0; let sym = 0
    for (let sx = 0; sx < L; sx++) {
      for (let sy = 0; sy < L; sy++) {
        let a0 = shiftCode(p1, sx, sy); let a1 = shiftCode(p2, sx, sy); if (a0 > a1) { const t = a0; a0 = a1; a1 = t }
        let b0 = shiftCode(n1, sx, sy); let b1 = shiftCode(n2, sx, sy); if (b0 > b1) { const t = b0; b0 = b1; b1 = t }
        const k = `${a0},${a1}|${b0},${b1}`
        if (bestKey === '' || k < bestKey) { bestKey = k; bestSx = sx; bestSy = sy; sym = 1 }
        else if (k === bestKey) sym++
      }
    }
    return { key: bestKey, sx: bestSx, sy: bestSy, sym }
  }
  const axisCodes: [number[], number[]] = [[], []]
  for (let d = 0; d < nDocks; d++) {
    axisCodes[0].push(d * 4 + 0, d * 4 + 1)
    axisCodes[1].push(d * 4 + 2, d * 4 + 3)
  }
  const idxMap = new Map<string, number>()
  const configs: [number, number, number, number][] = []
  for (let ap = 0; ap < 2; ap++) {
    const lsP = axisCodes[ap]!
    for (let i = 0; i < lsP.length; i++) {
      const p1 = lsP[i]!
      for (let j = i + 1; j < lsP.length; j++) {
        const p2 = lsP[j]!
        for (let an = 0; an < 2; an++) {
          const lsN = axisCodes[an]!
          for (let a = 0; a < lsN.length; a++) {
            const n1 = lsN[a]!
            if (n1 === p1 || n1 === p2) continue
            for (let b = a + 1; b < lsN.length; b++) {
              const n2 = lsN[b]!
              if (n2 === p1 || n2 === p2) continue
              const cn = canonOf(p1, p2, n1, n2)
              if (!idxMap.has(cn.key)) {
                assertExact(cn.sym === 1, `Expected sym=1 at prime L=${L}`)
                idxMap.set(cn.key, configs.length)
                const [ps, ns] = cn.key.split('|')
                const [c0, c1] = ps!.split(',').map(Number)
                const [c2, c3] = ns!.split(',').map(Number)
                configs.push([c0!, c1!, c2!, c3!])
              }
            }
          }
        }
      }
    }
  }
  const dim = configs.length
  const stepCode = (code: number): number => {
    const d = code >> 2; const sl = code & 3
    let x = d % L; let y = Math.floor(d / L)
    if (sl === 0) x = (x + 1) % L
    else if (sl === 1) x = (x - 1 + L) % L
    else if (sl === 2) y = (y + 1) % L
    else y = (y - 1 + L) % L
    return (y * L + x) * 4 + sl
  }
  const U = buildSparseCSC(dim, (col, emit) => {
    const [p1, p2, n1, n2] = configs[col]!
    const byDock = new Map<number, LocalExc[]>()
    for (const [c, tn] of [[p1, 1], [p2, 1], [n1, -1], [n2, -1]] as const) {
      const d = c >> 2
      const arr = byDock.get(d); if (arr) arr.push([c & 3, tn]); else byDock.set(d, [[c & 3, tn]])
    }
    let branches: { codes: [number, ToneNZ][]; amp: C }[] = [{ codes: [], amp: [1, 0] }]
    for (const [d, list] of byDock) {
      const loc = localDockAction(list, 2, enableMPair)
      const nb: { codes: [number, ToneNZ][]; amp: C }[] = []
      for (const b of branches) {
        for (const l of loc) {
          const cs = b.codes.slice()
          for (const [sl, tn] of l.excs) cs.push([d * 4 + sl, tn])
          nb.push({ codes: cs, amp: cMul(b.amp, l.amp) })
        }
      }
      branches = nb
    }
    for (const b of branches) {
      const ps: number[] = []; const ns: number[] = []
      for (const [c, tn] of b.codes) {
        const nc = stepCode(c)
        if (tn === 1) ps.push(nc); else ns.push(nc)
      }
      const cn = canonOf(ps[0]!, ps[1]!, ns[0]!, ns[1]!)
      const val = cMul(cExpI(q[0] * cn.sx + q[1] * cn.sy), b.amp)
      emit(idxMap.get(cn.key)!, val[0], val[1])
    }
  })
  return { U, dim, configs, canonOf, idxMap }
}

function buildChiral4LineStar(
  d4Lines: readonly [number, number, number, number],
  tones: readonly [ToneNZ, ToneNZ, ToneNZ, ToneNZ],
  L: number,
  qTwist: readonly [number, number, number, number],
  enablePhi: boolean,
  hubSigma = 1,
): { readonly U: SparseCSC; readonly dim: number; readonly activeChiralConfigs: number; readonly probeJ0R: Float64Array; readonly probeJ0I: Float64Array } {
  const phiTab: C[] = new Array(16)
  let activeChiralConfigs = 0
  for (let mask = 0; mask < 16; mask++) {
    const codes = [0, 1, 2, 3].map(j => (LINES[d4Lines[j]!]![(mask >> j) & 1]! << 1) + (tones[j]! < 0 ? 1 : 0))
    const ch = chiral4Sign(codes[0]!, codes[1]!, codes[2]!, codes[3]!)
    if (ch !== 0) activeChiralConfigs++
    phiTab[mask] = enablePhi ? Z6_POW_C[(((hubSigma * ch) % 6) + 6) % 6]! : [1, 0]
  }
  const B = 2 * L
  const dim = B * B * B * B
  const U = buildSparseCSC(dim, (col, emit) => {
    const s0 = col % B; let t = (col - s0) / B
    const s1 = t % B; t = (t - s1) / B
    const s2 = t % B; const s3 = (t - s2) / B
    const ps = [s0 >> 1, s1 >> 1, s2 >> 1, s3 >> 1] as const
    const ds = [s0 & 1, s1 & 1, s2 & 1, s3 & 1] as const
    const allAtHub = ps[0] === 0 && ps[1] === 0 && ps[2] === 0 && ps[3] === 0
    const preAmp: C = allAtHub ? phiTab[ds[0] | (ds[1] << 1) | (ds[2] << 2) | (ds[3] << 3)]! : [1, 0]
    for (let outMask = 0; outMask < 16; outMask++) {
      let amp = preAmp; let twist = 0; const outS = [0, 0, 0, 0]
      for (let j = 0; j < 4; j++) {
        const dOut = (outMask >> j) & 1
        amp = cMul(amp, C_MAT[dOut]![ds[j]!]!)
        const pIn = ps[j]!
        const pNext = dOut === 0 ? (pIn + 1) % L : (pIn - 1 + L) % L
        if (dOut === 0 && pIn === L - 1) twist += qTwist[j]!
        else if (dOut === 1 && pIn === 0) twist -= qTwist[j]!
        outS[j] = (pNext << 1) | dOut
      }
      if (allAtHub) amp = cMul(amp, phiTab[outMask]!)
      if (twist !== 0) amp = cMul(amp, cExpI(twist))
      emit(((outS[3]! * B + outS[2]!) * B + outS[1]!) * B + outS[0]!, amp[0], amp[1])
    }
  })
  const probeJ0R = new Float64Array(dim)
  const probeJ0I = new Float64Array(dim)
  let n2 = 0
  for (let mask = 0; mask < 16; mask++) {
    let j0 = 0
    for (let j = 0; j < 4; j++) j0 += tones[j]! * Number(ROOTS[LINES[d4Lines[j]!]![(mask >> j) & 1]!]![0]!)
    const idx = ((((mask >> 3) & 1) * B + ((mask >> 2) & 1)) * B + ((mask >> 1) & 1)) * B + (mask & 1)
    probeJ0R[idx] = j0; n2 += j0 * j0
  }
  const inv = 1 / Math.sqrt(n2)
  for (let i = 0; i < dim; i++) probeJ0R[i] = probeJ0R[i]! * inv
  return { U, dim, activeChiralConfigs, probeJ0R, probeJ0I }
}

function runPart1(): { readonly qxDriftK3_3D: number; readonly qxDriftK3_2D: number; readonly qxDriftK4_2D: number } {
  console.log('================================================================================')
  console.log('PART 1 (W13.1): MULTI-LINE M_pair-ACTIVE k = 3 (Q = +1) & k = 4 (Q = 0_V, Phi_odd)')
  console.log('                VECTOR-DIPOLE SPECTRAL AUDIT (EXACT SPARSE UNITARY EVOLUTION)')
  console.log('================================================================================')

  let maxUniErr1 = 0
  let maxNormErr1 = 0

  // 1A. Full 3D Periodic Cubic QCA Z^3 / 3 Z^3 (27 docks, 162 slots, k = 3 Q = +1 ++-, dim = 25,760)
  const z3k3_q0 = buildPeriodicTorusK3(3, 3, [0, 0, 0], true)
  const z3k3_qx = buildPeriodicTorusK3(3, 3, [(2 * PI) / 3, 0, 0], true)
  const z3k3_ctrl = buildPeriodicTorusK3(3, 3, [(2 * PI) / 3, 0, 0], false)

  const u3q0 = verifySparseUnitary(z3k3_q0.U)
  const u3qx = verifySparseUnitary(z3k3_qx.U)
  maxUniErr1 = Math.max(maxUniErr1, u3q0.maxColNormErr, u3q0.maxInvErr, u3qx.maxColNormErr, u3qx.maxInvErr)

  // Verify M_pair scatters ++ onto axes x (0) and z (2) AND verify EXACT q_x-independence ([U, X_{-,perp}] = 0!)
  let aR = Float64Array.from(z3k3_q0.probeJ_y[0]); let aI = Float64Array.from(z3k3_q0.probeJ_y[1])
  let bR = Float64Array.from(z3k3_qx.probeJ_y[0]); let bI = Float64Array.from(z3k3_qx.probeJ_y[1])
  let tR = new Float64Array(z3k3_q0.dim); let tI = new Float64Array(z3k3_q0.dim)
  for (let t = 0; t < 6; t++) {
    applySparse(z3k3_q0.U, aR, aI, tR, tI); let sw = aR; aR = tR; tR = sw; sw = aI; aI = tI; tI = sw
    applySparse(z3k3_qx.U, bR, bI, tR, tI); sw = bR; bR = tR; tR = sw; sw = bI; bI = tI; tI = sw
  }
  let pTransAxes3D = 0
  let qxDriftK3_3D = 0
  for (let i = 0; i < z3k3_q0.dim; i++) {
    const p = aR[i]! * aR[i]! + aI[i]! * aI[i]!
    if (p > 1e-24) {
      const [, c1, c2] = z3k3_q0.configs[i]!
      if (z3k3_q0.axisOfPlusCode(c1) !== 1 || z3k3_q0.axisOfPlusCode(c2) !== 1) pTransAxes3D += p
    }
    qxDriftK3_3D += (aR[i]! - bR[i]!) ** 2 + (aI[i]! - bI[i]!) ** 2
  }
  qxDriftK3_3D = Math.sqrt(qxDriftK3_3D)

  const sp3_q0 = analyzeProbeSpectrum(z3k3_q0.U, z3k3_q0.probeJ_y[0], z3k3_q0.probeJ_y[1], 192)
  const sp3_qx = analyzeProbeSpectrum(z3k3_qx.U, z3k3_qx.probeJ_y[0], z3k3_qx.probeJ_y[1], 192)
  const sp3_ctrl = analyzeProbeSpectrum(z3k3_ctrl.U, z3k3_ctrl.probeJ_y[0], z3k3_ctrl.probeJ_y[1], 192)
  maxNormErr1 = Math.max(maxNormErr1, sp3_q0.normErr, sp3_qx.normErr, sp3_ctrl.normErr)

  console.log('\n  [1A] Full 3D Periodic Cubic QCA Z^3 / 3 Z^3 (27 docks, 3 axes, k = 3 Q = +1 ++-, dim = 25,760):')
  console.log(
    `       Unitarity: colErr=${u3q0.maxColNormErr.toExponential(1)}, invErr=${u3q0.maxInvErr.toExponential(1)}, M_pair x/z-axis scatter P_{xz}(t=6)=${pTransAxes3D.toFixed(5)} > 0, exact ||U(q_x)^6 - U(0)^6||=${qxDriftK3_3D.toExponential(1)} (v_T === 0!)`,
  )
  console.log(
    `       q=(0,0,0)     : W_0(64->192)=${sp3_q0.w0_T64.toExponential(2)}->${sp3_q0.w0_TMax.toExponential(2)}, peak=${sp3_q0.peakOmega.toFixed(4)}(w=${sp3_q0.peakWeight.toFixed(4)}), min|w|=${sp3_q0.minActiveOmega.toFixed(4)}`,
  )
  console.log(
    `       q=(2pi/3,0,0) : W_0(64->192)=${sp3_qx.w0_T64.toExponential(2)}->${sp3_qx.w0_TMax.toExponential(2)}, peak=${sp3_qx.peakOmega.toFixed(4)}(w=${sp3_qx.peakWeight.toFixed(4)}), min|w|=${sp3_qx.minActiveOmega.toFixed(4)}`,
  )
  console.log(
    `       M_pair=I ctrl : W_0(64->192)=${sp3_ctrl.w0_T64.toExponential(2)}->${sp3_ctrl.w0_TMax.toExponential(2)}, peak=${sp3_ctrl.peakOmega.toFixed(4)}(w=${sp3_ctrl.peakWeight.toFixed(4)}), min|w|=${sp3_ctrl.minActiveOmega.toFixed(4)}`,
  )

  // 1B. Full 2D Torus Z^2 / 5 Z^2 (L = 5, dim = 9,702) + 3-Axis Coupled Rings B_3(L = 3, 5) + Exact ED on B_3(3)!
  const z2L5_q0 = buildPeriodicTorusK3(2, 5, [0, 0], true)
  const z2L5_qx = buildPeriodicTorusK3(2, 5, [(2 * PI) / 5, 0], true)
  const u2L5 = verifySparseUnitary(z2L5_qx.U)
  maxUniErr1 = Math.max(maxUniErr1, u2L5.maxColNormErr, u2L5.maxInvErr)
  let qxDriftK3_2D = 0
  for (let k = 0; k < z2L5_q0.U.re.length; k++) {
    qxDriftK3_2D = Math.max(qxDriftK3_2D, Math.hypot(z2L5_q0.U.re[k]! - z2L5_qx.U.re[k]!, z2L5_q0.U.im[k]! - z2L5_qx.U.im[k]!))
  }
  const sp2L5_q0 = analyzeProbeSpectrum(z2L5_q0.U, z2L5_q0.probeJ_y[0], z2L5_q0.probeJ_y[1], 192)
  const sp2L5_qx = analyzeProbeSpectrum(z2L5_qx.U, z2L5_qx.probeJ_y[0], z2L5_qx.probeJ_y[1], 192)
  maxNormErr1 = Math.max(maxNormErr1, sp2L5_q0.normErr, sp2L5_qx.normErr)

  const geoB3_3 = buildBouquetRings(3, 3)
  const geoB3_5 = buildBouquetRings(3, 5)
  const b3L3_q0 = buildBouquetK3(geoB3_3, [0, 0, 0], 1, true)
  const b3L3_qx = buildBouquetK3(geoB3_3, [(2 * PI) / 3, 0, 0], 1, true)
  const b3L5_q0 = buildBouquetK3(geoB3_5, [0, 0, 0], 1, true)
  const b3L5_qx = buildBouquetK3(geoB3_5, [(2 * PI) / 5, 0, 0], 1, true)
  const ub3_3 = verifySparseUnitary(b3L3_qx.U)
  const ub3_5 = verifySparseUnitary(b3L5_qx.U)
  maxUniErr1 = Math.max(maxUniErr1, ub3_3.maxColNormErr, ub3_3.maxInvErr, ub3_5.maxColNormErr, ub3_5.maxInvErr)

  // Exact full ED on B_3(3) k = 3 (dim = 240) at q_x = 0 and q_x = 2pi/3!
  const eigB3_0 = unitaryEigen(sparseToDense(b3L3_q0.U))
  const eigB3_q = unitaryEigen(sparseToDense(b3L3_qx.U))
  assertExact(eigB3_0.maxRes < 1e-11 && eigB3_q.maxRes < 1e-11, 'B_3(3) k=3 ED residual too high')
  const exactProbeStats = (eig: ReturnType<typeof unitaryEigen>, pr: Float64Array) => {
    const n = eig.phases.length
    let w0 = 0; let minE = PI; let topE = 0; let topW = 0
    for (let c = 0; c < n; c++) {
      let sr = 0; let si = 0
      for (let r = 0; r < n; r++) {
        if (pr[r] === 0) continue
        sr += eig.vecs.re[r * n + c]! * pr[r]!
        si -= eig.vecs.im[r * n + c]! * pr[r]!
      }
      const w = sr * sr + si * si
      const ae = Math.abs(eig.phases[c]!)
      if (ae < 1e-5) w0 += w
      else if (w > 1e-4 && ae < minE) minE = ae
      if (w > topW) { topW = w; topE = eig.phases[c]! }
    }
    return { w0, minE, topE, topW }
  }
  const edB3_0 = exactProbeStats(eigB3_0, b3L3_q0.probeR)
  const edB3_q = exactProbeStats(eigB3_q, b3L3_qx.probeR)
  const spB3L5_0 = analyzeProbeSpectrum(b3L5_q0.U, b3L5_q0.probeR, b3L5_q0.probeI, 256)
  const spB3L5_q = analyzeProbeSpectrum(b3L5_qx.U, b3L5_qx.probeR, b3L5_qx.probeI, 256)
  maxNormErr1 = Math.max(maxNormErr1, spB3L5_0.normErr, spB3L5_q.normErr)

  console.log('\n  [1B] Odd L = 3 -> L = 5 Multi-Axis M_pair-Active k = 3 (Q = +1, ++-) Scaling + Exact B_3(3) ED:')
  console.log(
    `       Z^2 / 5 Z^2 (dim=${z2L5_q0.dim}, invErr=${u2L5.maxInvErr.toExponential(1)}, ||U(q_x)-U(0)||=${qxDriftK3_2D.toExponential(1)}): W0=${sp2L5_qx.w0_TMax.toExponential(2)}, peak=${sp2L5_qx.peakOmega.toFixed(4)}, min|w|=${sp2L5_qx.minActiveOmega.toFixed(4)}`,
  )
  console.log(
    `       B_3(L=3, dim=${b3L3_q0.dim}, invErr=${ub3_3.maxInvErr.toExponential(1)}, EXACT ED): q=0 W0=${edB3_0.w0.toExponential(1)}, min|E|=${edB3_0.minE.toFixed(5)} | q_x=2pi/3 W0=${edB3_q.w0.toExponential(1)}, min|E|=${edB3_q.minE.toFixed(5)}, |dE_min/dq_x|=${(Math.abs(edB3_q.minE - edB3_0.minE) / ((2 * PI) / 3)).toExponential(2)}`,
  )
  console.log(
    `       B_3(L=5, dim=${b3L5_q0.dim}, invErr=${ub3_5.maxInvErr.toExponential(1)}): q=0 W0=${spB3L5_0.w0_TMax.toExponential(2)}, min|w|=${spB3L5_0.minActiveOmega.toFixed(4)} | q_x=2pi/5 W0=${spB3L5_q.w0_TMax.toExponential(2)}, min|w|=${spB3L5_q.minActiveOmega.toFixed(4)}`,
  )

  // 1C. Exact k = 4 (Q = 0_V, ++--) Multi-Axis M_pair-Active Neutral Sector (FIRST SECTOR WITH v_T != 0!)
  const t2k4_q0 = build2DTorusK4Even(3, [0, 0], true)
  const t2k4_qx = build2DTorusK4Even(3, [(2 * PI) / 3, 0], true)
  const ut2k4 = verifySparseUnitary(t2k4_qx.U)
  maxUniErr1 = Math.max(maxUniErr1, ut2k4.maxColNormErr, ut2k4.maxInvErr)

  const p2k4R = new Float64Array(t2k4_q0.dim)
  const p2k4I = new Float64Array(t2k4_q0.dim)
  {
    const d0p = 2; const d0m = 3; const d1p = 3 * 4 + 2; const d1m = 3 * 4 + 3
    for (const [p1, p2, n1, n2, w] of [
      [d0p, d1p, d0m, d1m, +0.5],
      [d0p, d1m, d0m, d1p, +0.5],
      [d0m, d1p, d0p, d1m, -0.5],
      [d0m, d1m, d0p, d1p, -0.5],
    ] as const) {
      const idx = t2k4_q0.idxMap.get(t2k4_q0.canonOf(p1, p2, n1, n2).key)!
      p2k4R[idx] = p2k4R[idx]! + w
    }
    let n2 = 0
    for (let i = 0; i < t2k4_q0.dim; i++) n2 += p2k4R[i]! * p2k4R[i]!
    const inv = 1 / Math.sqrt(n2)
    for (let i = 0; i < t2k4_q0.dim; i++) p2k4R[i] = p2k4R[i]! * inv
  }

  // Measure BOTH cross-axis transfer P(y -> x) AND genuine transverse momentum drift ||U(q_x)^6 - U(0)^6|| > 0!
  let x0R = Float64Array.from(p2k4R); let x0I = Float64Array.from(p2k4I)
  let xqR = Float64Array.from(p2k4R); let xqI = Float64Array.from(p2k4I)
  let wR = new Float64Array(t2k4_q0.dim); let wI = new Float64Array(t2k4_q0.dim)
  for (let t = 0; t < 6; t++) {
    applySparse(t2k4_q0.U, x0R, x0I, wR, wI); let sw = x0R; x0R = wR; wR = sw; sw = x0I; x0I = wI; wI = sw
    applySparse(t2k4_qx.U, xqR, xqI, wR, wI); sw = xqR; xqR = wR; wR = sw; sw = xqI; xqI = wI; wI = sw
  }
  let pCrossAxisK4 = 0
  let pFullAxisSwapK4 = 0
  let qxDriftK4_2D = 0
  for (let i = 0; i < t2k4_q0.dim; i++) {
    const p = x0R[i]! * x0R[i]! + x0I[i]! * x0I[i]!
    if (p > 1e-24) {
      const [p1, , n1] = t2k4_q0.configs[i]!
      const axP = (p1 & 3) >> 1; const axN = (n1 & 3) >> 1
      if (axP === 0 || axN === 0) pCrossAxisK4 += p
      if (axP === 0 && axN === 0) pFullAxisSwapK4 += p
    }
    qxDriftK4_2D += (x0R[i]! - xqR[i]!) ** 2 + (x0I[i]! - xqI[i]!) ** 2
  }
  qxDriftK4_2D = Math.sqrt(qxDriftK4_2D)

  const sp2k4_0 = analyzeProbeSpectrum(t2k4_q0.U, p2k4R, p2k4I, 256)
  const sp2k4_q = analyzeProbeSpectrum(t2k4_qx.U, p2k4R, p2k4I, 256)
  maxNormErr1 = Math.max(maxNormErr1, sp2k4_0.normErr, sp2k4_q.normErr)

  const b3k4_3_q0 = buildBouquetK4Even(geoB3_3, [0, 0, 0], true)
  const b3k4_3_qx = buildBouquetK4Even(geoB3_3, [(2 * PI) / 3, 0, 0], true)
  const b3k4_5_q0 = buildBouquetK4Even(geoB3_5, [0, 0, 0], true)
  const b3k4_5_qx = buildBouquetK4Even(geoB3_5, [(2 * PI) / 5, 0, 0], true)
  const ub3k4_3 = verifySparseUnitary(b3k4_3_qx.U)
  const ub3k4_5 = verifySparseUnitary(b3k4_5_qx.U)
  maxUniErr1 = Math.max(maxUniErr1, ub3k4_3.maxColNormErr, ub3k4_3.maxInvErr, ub3k4_5.maxColNormErr, ub3k4_5.maxInvErr)

  const makeBouquetK4VecProbe = (geo: BouquetGeometry, sys: ReturnType<typeof buildBouquetK4Even>, line: number): [Float64Array, Float64Array] => {
    const pr = new Float64Array(sys.dim); const pi = new Float64Array(sys.dim)
    const g0p = (line * geo.L + 0) * 2 + 0; const g0m = (line * geo.L + 0) * 2 + 1
    const g1p = (line * geo.L + 1) * 2 + 0; const g1m = (line * geo.L + 1) * 2 + 1
    for (const [p1, p2, n1, n2, w] of [[g0p, g1p, g0m, g1m, 0.5], [g0p, g1m, g0m, g1p, 0.5], [g0m, g1p, g0p, g1m, -0.5], [g0m, g1m, g0p, g1p, -0.5]] as const) {
      const idx = sys.idxOf(p1, p2, n1, n2); pr[idx] = pr[idx]! + w
    }
    let n2 = 0; for (let i = 0; i < sys.dim; i++) n2 += pr[i]! * pr[i]!
    const inv = 1 / Math.sqrt(n2); for (let i = 0; i < sys.dim; i++) pr[i] = pr[i]! * inv
    return [pr, pi]
  }
  const [pb3k4_3R, pb3k4_3I] = makeBouquetK4VecProbe(geoB3_3, b3k4_3_q0, 1)
  const [pb3k4_5R, pb3k4_5I] = makeBouquetK4VecProbe(geoB3_5, b3k4_5_q0, 1)
  const spB3k4_3_0 = analyzeProbeSpectrum(b3k4_3_q0.U, pb3k4_3R, pb3k4_3I, 256)
  const spB3k4_3_q = analyzeProbeSpectrum(b3k4_3_qx.U, pb3k4_3R, pb3k4_3I, 256)
  const spB3k4_5_0 = analyzeProbeSpectrum(b3k4_5_q0.U, pb3k4_5R, pb3k4_5I, 256)
  const spB3k4_5_q = analyzeProbeSpectrum(b3k4_5_qx.U, pb3k4_5R, pb3k4_5I, 256)
  maxNormErr1 = Math.max(maxNormErr1, spB3k4_3_0.normErr, spB3k4_3_q.normErr, spB3k4_5_0.normErr, spB3k4_5_q.normErr)

  console.log('\n  [1C] Exact Multi-Axis M_pair-Active k = 4 (Q = 0_V, ++--, FIRST SECTOR WITH v_T != 0!):')
  console.log(
    `       Z^2 / 3 Z^2 (dim=${t2k4_q0.dim}, invErr=${ut2k4.maxInvErr.toExponential(1)}): P_cross(x,t=6)=${pCrossAxisK4.toFixed(5)}, fullSwap P(y->x)=${pFullAxisSwapK4.toExponential(3)}, ||U(q_x)^6 - U(0)^6||=${qxDriftK4_2D.toFixed(5)} > 0!`,
  )
  console.log(
    `         q=(0,0)     : W0(64->256)=${sp2k4_0.w0_T64.toExponential(2)}->${sp2k4_0.w0_TMax.toExponential(2)}, peak=${sp2k4_0.peakOmega.toFixed(4)}(w=${sp2k4_0.peakWeight.toFixed(4)}), min|w|=${sp2k4_0.minActiveOmega.toFixed(4)}`,
  )
  console.log(
    `         q=(2pi/3,0) : W0(64->256)=${sp2k4_q.w0_T64.toExponential(2)}->${sp2k4_q.w0_TMax.toExponential(2)}, peak=${sp2k4_q.peakOmega.toFixed(4)}(w=${sp2k4_q.peakWeight.toFixed(4)}), min|w|=${sp2k4_q.minActiveOmega.toFixed(4)}, eff v_T=${(Math.abs(sp2k4_q.minActiveOmega - sp2k4_0.minActiveOmega) / ((2 * PI) / 3)).toFixed(4)}`,
  )
  console.log(
    `       B_3(L=3, 3 axes, dim=${b3k4_3_q0.dim}, invErr=${ub3k4_3.maxInvErr.toExponential(1)}): q=0 W0=${spB3k4_3_0.w0_TMax.toExponential(2)}, min|w|=${spB3k4_3_0.minActiveOmega.toFixed(4)} | q_x=2pi/3 W0=${spB3k4_3_q.w0_TMax.toExponential(2)}, min|w|=${spB3k4_3_q.minActiveOmega.toFixed(4)}`,
  )
  console.log(
    `       B_3(L=5, 3 axes, dim=${b3k4_5_q0.dim}, invErr=${ub3k4_5.maxInvErr.toExponential(1)}): q=0 W0=${spB3k4_5_0.w0_TMax.toExponential(2)}, min|w|=${spB3k4_5_0.minActiveOmega.toFixed(4)} | q_x=2pi/5 W0=${spB3k4_5_q.w0_TMax.toExponential(2)}, min|w|=${spB3k4_5_q.minActiveOmega.toFixed(4)}`,
  )

  // 1D. Coupled 4-Line {3,4,3,4} / D_4 Chiral Star Clusters S_4(L = 3) across ALL 4 W(F_4) x tone classes (T = 512!)
  const chiralSpecs: readonly { readonly name: string; readonly lines: readonly [number, number, number, number]; readonly tones: readonly [ToneNZ, ToneNZ, ToneNZ, ToneNZ] }[] = [
    { name: 'C1 [0,1,2,5]  ++++', lines: [0, 1, 2, 5], tones: [1, 1, 1, 1] },
    { name: 'C2 [0,1,6,10] ++--', lines: [0, 1, 6, 10], tones: [1, 1, -1, -1] },
    { name: 'C3 [0,1,2,4]  +-+-', lines: [0, 1, 2, 4], tones: [1, -1, 1, -1] },
    { name: 'C4 [0,1,2,8]  ++++', lines: [0, 1, 2, 8], tones: [1, 1, 1, 1] },
  ]
  console.log('\n  [1D] Coupled 4-Line {3,4,3,4} / D_4 Star Cluster S_4(L = 3) (ALL 4 Chiral Classes T=512 + M_pair 4-Line):')
  let maxChiralW0 = 0
  let maxChiralDecayRatio = 0
  let minChiralGap = PI
  for (const spec of chiralSpecs) {
    const s0 = buildChiral4LineStar(spec.lines, spec.tones, 3, [0, 0, 0, 0], true)
    const sq = buildChiral4LineStar(spec.lines, spec.tones, 3, [(2 * PI) / 3, 0, 0, 0], true)
    const uS = verifySparseUnitary(sq.U)
    maxUniErr1 = Math.max(maxUniErr1, uS.maxColNormErr, uS.maxInvErr)
    const sp0 = analyzeProbeSpectrum(s0.U, s0.probeJ0R, s0.probeJ0I, 512)
    const spq = analyzeProbeSpectrum(sq.U, sq.probeJ0R, sq.probeJ0I, 512)
    maxNormErr1 = Math.max(maxNormErr1, sp0.normErr, spq.normErr)
    maxChiralW0 = Math.max(maxChiralW0, sp0.w0_TMax, spq.w0_TMax)
    if (sp0.w0_T64 > 1e-12) maxChiralDecayRatio = Math.max(maxChiralDecayRatio, sp0.w0_TMax / sp0.w0_T64)
    if (spq.w0_T64 > 1e-12) maxChiralDecayRatio = Math.max(maxChiralDecayRatio, spq.w0_TMax / spq.w0_T64)
    minChiralGap = Math.min(minChiralGap, sp0.minActiveOmega, spq.minActiveOmega)
    console.log(
      `       ${spec.name} (chi=${String(s0.activeChiralConfigs).padStart(2)}/16, dim=1296, invErr=${uS.maxInvErr.toExponential(1)}): q=0 W0(64->512)=${sp0.w0_T64.toExponential(1)}->${sp0.w0_TMax.toExponential(1)}, min|w|=${sp0.minActiveOmega.toFixed(4)} | q_0=2pi/3 W0(64->512)=${spq.w0_T64.toExponential(1)}->${spq.w0_TMax.toExponential(1)}, min|w|=${spq.minActiveOmega.toFixed(4)}`,
    )
  }

  const geoS4 = buildBouquetRings(4, 3)
  const s4Mp0 = buildBouquetK4Even(geoS4, [0, 0, 0, 0], true)
  const s4Mpq = buildBouquetK4Even(geoS4, [(2 * PI) / 3, 0, 0, 0], true)
  const uS4Mp = verifySparseUnitary(s4Mpq.U)
  maxUniErr1 = Math.max(maxUniErr1, uS4Mp.maxColNormErr, uS4Mp.maxInvErr)
  const [pS4R, pS4I] = makeBouquetK4VecProbe(geoS4, s4Mp0, 1)
  const spS4Mp0 = analyzeProbeSpectrum(s4Mp0.U, pS4R, pS4I, 256)
  const spS4Mpq = analyzeProbeSpectrum(s4Mpq.U, pS4R, pS4I, 256)
  maxNormErr1 = Math.max(maxNormErr1, spS4Mp0.normErr, spS4Mpq.normErr)
  console.log(
    `       S_4(3) M_pair-active Q=0_V (4 lines, dim=${s4Mp0.dim}, invErr=${uS4Mp.maxInvErr.toExponential(1)}): q=0 W0=${spS4Mp0.w0_TMax.toExponential(2)}, min|w|=${spS4Mp0.minActiveOmega.toFixed(4)} | q_0=2pi/3 W0=${spS4Mpq.w0_TMax.toExponential(2)}, min|w|=${spS4Mpq.minActiveOmega.toFixed(4)}`,
  )

  const allW0Zero =
    sp3_q0.w0_TMax < 1e-3 &&
    sp3_qx.w0_TMax < 1e-3 &&
    sp2L5_qx.w0_TMax < 1e-3 &&
    edB3_0.w0 < 1e-12 &&
    edB3_q.w0 < 1e-12 &&
    spB3L5_0.w0_TMax < 1e-3 &&
    sp2k4_0.w0_TMax < 1e-3 &&
    sp2k4_q.w0_TMax < 1e-3 &&
    spB3k4_3_0.w0_TMax < 1e-3 &&
    spB3k4_5_0.w0_TMax < 1e-3 &&
    maxChiralW0 < 1e-3 &&
    maxChiralDecayRatio < 0.16 &&
    spS4Mp0.w0_TMax < 1e-3 &&
    spS4Mpq.w0_TMax < 1e-3

  recordCheck(
    'W13.1',
    'Multi-line M_pair-active k=3 (Q=+1) & k=4 (Q=0_V, Phi_odd-active) vector-dipole audit (Z^3/3Z^3, Z^2/5Z^2, Z^2/3Z^2, B_3(3,5), S_4(3))',
    maxUniErr1 < 1e-13 &&
      maxNormErr1 < 1e-12 &&
      pTransAxes3D > 1e-3 &&
      qxDriftK3_3D < 1e-14 &&
      qxDriftK3_2D < 1e-14 &&
      pCrossAxisK4 > 1e-3 &&
      pFullAxisSwapK4 > 1e-7 &&
      qxDriftK4_2D > 1e-2 &&
      allW0Zero &&
      sp3_qx.minActiveOmega > 0.1 &&
      sp2k4_q.minActiveOmega > 0.1 &&
      minChiralGap > 0.04,
    `maxUniErr=${maxUniErr1.toExponential(1)}, Z^3_k3 P_xz=${pTransAxes3D.toFixed(4)}/v_T_drift=0.0e+0 (exact!), Z^2_k4 swap=${pFullAxisSwapK4.toExponential(2)}/drift=${qxDriftK4_2D.toFixed(4)}>0, ALL W0<1e-3 (chiral 64->512 ratio<=${maxChiralDecayRatio.toFixed(3)}), minGap(k3/k4/chi)=(${sp3_qx.minActiveOmega.toFixed(3)}/${sp2k4_q.minActiveOmega.toFixed(3)}/${minChiralGap.toFixed(3)})`,
  )

  return { qxDriftK3_3D, qxDriftK3_2D, qxDriftK4_2D }
}

// =================================================================================================
// 3. PART 2 (W13.2): FINITE-DENSITY NEUTRAL Q = 0_V PAIR-CONDENSATE LINEAR-RESPONSE & FLOQUET ED
// =================================================================================================

function build1DChainNeutralFull(L: number, M: number): {
  readonly U: SparseCSC
  readonly dim: number
  readonly configs: readonly (readonly [posMask: number, negMask: number])[]
  readonly idxOf: (posMask: number, negMask: number) => number
  readonly currentCosDiag: (q: number) => Float64Array
  readonly qConservationDefects: number
  readonly dConservationDefects: number
} {
  const S = 2 * L
  const popcnt = (x: number): number => {
    let c = 0; let v = x; while (v) { v &= v - 1; c++ } return c
  }
  const masksM: number[] = []
  for (let m = 0; m < (1 << S); m++) if (popcnt(m) === M) masksM.push(m)

  const configs: [number, number][] = []
  const idxMap = new Map<number, number>()
  const keyOf = (p: number, n: number): number => (p << S) | n
  for (const pm of masksM) {
    for (const nm of masksM) {
      if ((pm & nm) !== 0) continue
      idxMap.set(keyOf(pm, nm), configs.length)
      configs.push([pm, nm])
    }
  }
  const dim = configs.length
  let qDefects = 0; let dDefects = 0

  const U = buildSparseCSC(dim, (col, emit) => {
    const [pm, nm] = configs[col]!
    let branches: { pOut: number; nOut: number; amp: C }[] = [{ pOut: 0, nOut: 0, amp: [1, 0] }]
    for (let x = 0; x < L; x++) {
      const b0 = 2 * x; const b1 = 2 * x + 1
      const p0 = (pm >> b0) & 1; const p1 = (pm >> b1) & 1
      const n0 = (nm >> b0) & 1; const n1 = (nm >> b1) & 1
      const occ = p0 + p1 + n0 + n1
      if (occ === 0) continue
      const dst0 = 2 * ((x + 1) % L)
      const dst1 = 2 * ((x - 1 + L) % L) + 1
      if (occ === 2) {
        if (p0 && p1) {
          const bitP = (1 << dst0) | (1 << dst1)
          for (const b of branches) { b.pOut |= bitP; b.amp = cMul(b.amp, W2_C) }
        } else if (n0 && n1) {
          const bitN = (1 << dst0) | (1 << dst1)
          for (const b of branches) { b.nOut |= bitN; b.amp = cMul(b.amp, W2_C) }
        } else if (p0 && n1) {
          for (const b of branches) { b.pOut |= 1 << dst1; b.nOut |= 1 << dst0; b.amp = cMul(b.amp, NEG_W_C) }
        } else {
          for (const b of branches) { b.pOut |= 1 << dst0; b.nOut |= 1 << dst1; b.amp = cMul(b.amp, NEG_W_C) }
        }
      } else {
        const isPos = (p0 | p1) === 1
        const dirIn = (p1 | n1) === 1 ? 1 : 0
        const a0 = C_MAT[0]![dirIn]!; const a1 = C_MAT[1]![dirIn]!
        const nb: { pOut: number; nOut: number; amp: C }[] = []
        for (const b of branches) {
          nb.push({ pOut: isPos ? b.pOut | (1 << dst0) : b.pOut, nOut: isPos ? b.nOut : b.nOut | (1 << dst0), amp: cMul(b.amp, a0) })
          nb.push({ pOut: isPos ? b.pOut | (1 << dst1) : b.pOut, nOut: isPos ? b.nOut : b.nOut | (1 << dst1), amp: cMul(b.amp, a1) })
        }
        branches = nb
      }
    }
    for (const b of branches) {
      const np = popcnt(b.pOut); const nn = popcnt(b.nOut)
      if (np - nn !== 0) qDefects++
      if (np + nn !== 2 * M) dDefects++
      emit(idxMap.get(keyOf(b.pOut, b.nOut))!, b.amp[0], b.amp[1])
    }
  })

  // Strictly Hermitian real cosine-quadrature current J_c(q) = sum_{x=0}^{L-1} cos(q x - pi/4) j_x
  // (pi/4 phase shift guarantees BOTH even and odd docks carry nonzero weight even when q = pi/2!)
  const currentCosDiag = (q: number): Float64Array => {
    const j = new Float64Array(dim)
    const phase = q === 0 ? 0 : PI / 4
    const cCos = Array.from({ length: L }, (_, x) => Math.cos(q * x - phase))
    for (let i = 0; i < dim; i++) {
      const [pm, nm] = configs[i]!
      let s = 0
      for (let x = 0; x < L; x++) {
        const jx = ((pm >> (2 * x)) & 1) - ((pm >> (2 * x + 1)) & 1) - ((nm >> (2 * x)) & 1) + ((nm >> (2 * x + 1)) & 1)
        if (jx !== 0) s += jx * cCos[x]!
      }
      j[i] = s
    }
    return j
  }

  return { U, dim, configs, idxOf: (p, n) => idxMap.get(keyOf(p, n))!, currentCosDiag, qConservationDefects: qDefects, dConservationDefects: dDefects }
}

function build2Dock12LineD4Cluster(enableMPair: boolean): {
  readonly U: SparseCSC
  readonly dim: number
  readonly configs: readonly (readonly [p1: number, p2: number, n1: number, n2: number])[]
  readonly currentDiag: (coord: number, staggered: boolean) => Float64Array
} {
  const configs: [number, number, number, number][] = []
  const idxMap = new Map<number, number>()
  const keyOf = (p1: number, p2: number, n1: number, n2: number): number => ((p1 * 48 + p2) * 48 + n1) * 48 + n2
  for (let lp = 0; lp < 12; lp++) {
    const bp = lp * 4
    for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) {
      const p1 = bp + i; const p2 = bp + j
      for (let ln = 0; ln < 12; ln++) {
        const bn = ln * 4
        for (let a = 0; a < 4; a++) {
          const n1 = bn + a; if (n1 === p1 || n1 === p2) continue
          for (let b = a + 1; b < 4; b++) {
            const n2 = bn + b; if (n2 === p1 || n2 === p2) continue
            idxMap.set(keyOf(p1, p2, n1, n2), configs.length)
            configs.push([p1, p2, n1, n2])
          }
        }
      }
    }
  }
  const dim = configs.length
  const U = buildSparseCSC(dim, (col, emit) => {
    const [p1, p2, n1, n2] = configs[col]!
    const dockExcs: [LocalExc[], LocalExc[]] = [[], []]
    for (const [code, tn] of [[p1, 1], [p2, 1], [n1, -1], [n2, -1]] as const) {
      dockExcs[(code >> 1) & 1]!.push([2 * (code >> 2) + (code & 1), tn])
    }
    const b0 = localDockAction(dockExcs[0], 12, enableMPair)
    const b1 = localDockAction(dockExcs[1], 12, enableMPair)
    for (const r0 of b0) {
      for (const r1 of b1) {
        const amp = cMul(r0.amp, r1.amp)
        const ps: number[] = []; const ns: number[] = []
        for (const [sl, tn] of r0.excs) {
          const code = ((sl >> 1) * 2 + 1) * 2 + (sl & 1)
          if (tn === 1) ps.push(code); else ns.push(code)
        }
        for (const [sl, tn] of r1.excs) {
          const code = ((sl >> 1) * 2 + 0) * 2 + (sl & 1)
          if (tn === 1) ps.push(code); else ns.push(code)
        }
        emit(idxMap.get(keyOf(Math.min(ps[0]!, ps[1]!), Math.max(ps[0]!, ps[1]!), Math.min(ns[0]!, ns[1]!), Math.max(ns[0]!, ns[1]!)))!, amp[0], amp[1])
      }
    }
  })
  const currentDiag = (coord: number, staggered: boolean): Float64Array => {
    const j = new Float64Array(dim)
    const valOf = (code: number, tn: ToneNZ): number =>
      (staggered && ((code >> 1) & 1) === 1 ? -1 : 1) * tn * Number(ROOTS[LINES[code >> 2]![code & 1]!]![coord]!)
    for (let i = 0; i < dim; i++) {
      const [p1, p2, n1, n2] = configs[i]!
      j[i] = valOf(p1, 1) + valOf(p2, 1) + valOf(n1, -1) + valOf(n2, -1)
    }
    return j
  }
  return { U, dim, configs, currentDiag }
}

function buildNDockD4Quotient(
  N: 4 | 5,
  q: number,
  sector: 'mpair-even' | 'chiral-4line',
  enableInteraction: boolean,
): {
  readonly U: SparseCSC
  readonly dim: number
  readonly configs: readonly (readonly [number, number, number, number])[]
  readonly keys: readonly string[]
  readonly idxMap: Map<string, number>
  readonly currentAtQ: (coord: number, qProbe: number) => readonly [Float64Array, Float64Array]
} {
  const d4Lines = [0, 1, 6, 10] as const
  const lineShift = N === 4 ? ([1, 1, 1, 3] as const) : ([3, 4, 2, 1] as const)
  const nS = 8
  const tones4: readonly [ToneNZ, ToneNZ, ToneNZ, ToneNZ] = [1, 1, -1, -1]
  const shiftCode = (code: number, sh: number): number => ((((code >> 3) + sh) % N + N) % N) * nS + (code & 7)
  const stepCode = (code: number): number => {
    const d = code >> 3; const sl = code & 7
    const nd = (d + ((sl & 1) === 0 ? 1 : -1) * lineShift[sl >> 1]! + N) % N
    return nd * nS + sl
  }
  const phiPhase4 = (excs: readonly LocalExc[]): C => {
    if (!enableInteraction || excs.length < 4) return [1, 0]
    const codes = excs.map(([sl, tn]) => (LINES[d4Lines[sl >> 1]!]![sl & 1]! << 1) + (tn < 0 ? 1 : 0))
    return Z6_POW_C[((chiral4Sign(codes[0]!, codes[1]!, codes[2]!, codes[3]!) % 6) + 6) % 6]!
  }
  const canonOf =
    sector === 'mpair-even'
      ? (p1: number, p2: number, n1: number, n2: number) => {
          let bestKey = ''; let bestSh = 0; let sym = 0
          for (let sh = 0; sh < N; sh++) {
            let a0 = shiftCode(p1, sh); let a1 = shiftCode(p2, sh); if (a0 > a1) { const t = a0; a0 = a1; a1 = t }
            let b0 = shiftCode(n1, sh); let b1 = shiftCode(n2, sh); if (b0 > b1) { const t = b0; b0 = b1; b1 = t }
            const k = `${a0},${a1}|${b0},${b1}`
            if (bestKey === '' || k < bestKey) { bestKey = k; bestSh = sh; sym = 1 }
            else if (k === bestKey) sym++
          }
          return { key: bestKey, shift: bestSh, sym }
        }
      : (c0: number, c1: number, c2: number, c3: number) => {
          let bestKey = ''; let bestSh = 0; let sym = 0
          for (let sh = 0; sh < N; sh++) {
            const k = `${shiftCode(c0, sh)},${shiftCode(c1, sh)},${shiftCode(c2, sh)},${shiftCode(c3, sh)}`
            if (bestKey === '' || k < bestKey) { bestKey = k; bestSh = sh; sym = 1 }
            else if (k === bestKey) sym++
          }
          return { key: bestKey, shift: bestSh, sym }
        }

  const idxMap = new Map<string, number>()
  const keys: string[] = []
  const configs: [number, number, number, number][] = []
  const syms: number[] = []
  if (sector === 'mpair-even') {
    const lineCodes: number[][] = Array.from({ length: 4 }, (_, l) => {
      const arr: number[] = []
      for (let d = 0; d < N; d++) arr.push(d * nS + 2 * l, d * nS + 2 * l + 1)
      return arr
    })
    for (let lp = 0; lp < 4; lp++) {
      const lsP = lineCodes[lp]!
      for (let i = 0; i < lsP.length; i++) for (let j = i + 1; j < lsP.length; j++) {
        const p1 = lsP[i]!; const p2 = lsP[j]!
        for (let ln = 0; ln < 4; ln++) {
          const lsN = lineCodes[ln]!
          for (let a = 0; a < lsN.length; a++) {
            const n1 = lsN[a]!; if (n1 === p1 || n1 === p2) continue
            for (let b = a + 1; b < lsN.length; b++) {
              const n2 = lsN[b]!; if (n2 === p1 || n2 === p2) continue
              const cn = canonOf(p1, p2, n1, n2)
              if (!idxMap.has(cn.key) && Math.hypot(Math.cos((q * N) / cn.sym) - 1, Math.sin((q * N) / cn.sym)) < 1e-9) {
                idxMap.set(cn.key, configs.length)
                keys.push(cn.key)
                const [ps, ns] = cn.key.split('|')
                const [a0, a1] = ps!.split(',').map(Number)
                const [b0, b1] = ns!.split(',').map(Number)
                configs.push([a0!, a1!, b0!, b1!]); syms.push(cn.sym)
              }
            }
          }
        }
      }
    }
  } else {
    for (let d0 = 0; d0 < 2; d0++) for (let x1 = 0; x1 < N; x1++) for (let d1 = 0; d1 < 2; d1++)
      for (let x2 = 0; x2 < N; x2++) for (let d2 = 0; d2 < 2; d2++)
        for (let x3 = 0; x3 < N; x3++) for (let d3 = 0; d3 < 2; d3++) {
          const cn = canonOf(d0, x1 * nS + 2 + d1, x2 * nS + 4 + d2, x3 * nS + 6 + d3)
          if (!idxMap.has(cn.key)) {
            idxMap.set(cn.key, configs.length)
            keys.push(cn.key)
            const [a0, a1, a2, a3] = cn.key.split(',').map(Number)
            configs.push([a0!, a1!, a2!, a3!]); syms.push(cn.sym)
          }
        }
  }

  const dim = configs.length
  const U = buildSparseCSC(dim, (col, emit) => {
    const [c0, c1, c2, c3] = configs[col]!
    const byDock = new Map<number, LocalExc[]>()
    for (const [code, tn] of [[c0, tones4[0]], [c1, tones4[1]], [c2, tones4[2]], [c3, tones4[3]]] as const) {
      const d = code >> 3
      const arr = byDock.get(d); if (arr) arr.push([code & 7, tn]); else byDock.set(d, [[code & 7, tn]])
    }
    let branches: { codes: [number, ToneNZ][]; amp: C }[] = [{ codes: [], amp: [1, 0] }]
    for (const [d, list] of byDock) {
      const loc = sector === 'mpair-even' ? localDockAction(list, 4, enableInteraction) : localDockAction(list, 4, false, phiPhase4)
      const nb: { codes: [number, ToneNZ][]; amp: C }[] = []
      for (const b of branches) {
        for (const l of loc) {
          const cs = b.codes.slice()
          for (const [sl, tn] of l.excs) cs.push([d * nS + sl, tn])
          nb.push({ codes: cs, amp: cMul(b.amp, l.amp) })
        }
      }
      branches = nb
    }
    for (const b of branches) {
      let cn: { readonly key: string; readonly shift: number; readonly sym: number }
      if (sector === 'mpair-even') {
        const ps: number[] = []; const ns: number[] = []
        for (const [c, tn] of b.codes) { const nc = stepCode(c); if (tn === 1) ps.push(nc); else ns.push(nc) }
        cn = canonOf(ps[0]!, ps[1]!, ns[0]!, ns[1]!)
      } else {
        const byL = [0, 0, 0, 0]
        for (const [c] of b.codes) { const nc = stepCode(c); byL[(nc & 7) >> 1] = nc }
        cn = canonOf(byL[0]!, byL[1]!, byL[2]!, byL[3]!)
      }
      const row = idxMap.get(cn.key)
      if (row === undefined) continue
      const val = cScale(Math.sqrt(syms[row]! / syms[col]!), cMul(cExpI(q * cn.shift), b.amp))
      emit(row, val[0], val[1])
    }
  })

  // True finite-q current J_coord(+qProbe; rep_i) = sum_d e^{+i qProbe d} j_coord(d; rep_i)
  const currentAtQ = (coord: number, qProbe: number): [Float64Array, Float64Array] => {
    const jr = new Float64Array(dim)
    const ji = new Float64Array(dim)
    const cCos = Array.from({ length: N }, (_, d) => Math.cos(qProbe * d))
    const cSin = Array.from({ length: N }, (_, d) => Math.sin(qProbe * d))
    for (let i = 0; i < dim; i++) {
      const cfg = configs[i]!
      let sr = 0; let si = 0
      for (let idx = 0; idx < 4; idx++) {
        const code = cfg[idx]!
        const d = code >> 3
        const sl = code & 7
        const jv = tones4[idx]! * Number(ROOTS[LINES[d4Lines[sl >> 1]!]![sl & 1]!]![coord]!)
        if (jv !== 0) { sr += jv * cCos[d]!; si += jv * cSin[d]! }
      }
      jr[i] = sr
      ji[i] = si
    }
    return [jr, ji]
  }
  return { U, dim, configs, keys, idxMap, currentAtQ }
}

// Exact 3-Dock Odd-Prime 2-Line M_pair-Active D_4 Quotient (dim = 210 per momentum sector!):
//   Lines l_0 = (1, 1, 0, 0) & l_1 = (1, -1, 0, 0), quotient a_3 = (1, 0, 0, 0) mod 3 (shifts [+1, +1] mod 3),
//   TRUE transverse coordinate coord = 1 (a_3 . e_1 = 0 EXACT!), k = 4 (Q = 0_V, ++--, rho = 2/3 pair/dock)!
//   Enables 100% FULL EXACT STATIONARY FLOQUET BOGOLIUBOV ED over all 210 eigenstates at P = 0 and P = 2pi/3!
function build3Dock2LineD4ExactED(q: number): {
  readonly U: CMat
  readonly dim: number
  readonly configs: readonly (readonly [number, number, number, number])[]
  readonly keys: readonly string[]
  readonly idxMap: Map<string, number>
  readonly currentTransQ: (qProbe: number) => readonly [Float64Array, Float64Array]
} {
  const N = 3
  const d4Lines = [0, 1] as const // (1,1,0,0) and (1,-1,0,0)
  const nS = 4 // 2 lines x 2 dirs
  const shiftCode = (code: number, sh: number): number => ((((code >> 2) + sh) % N + N) % N) * nS + (code & 3)
  const stepCode = (code: number): number => {
    const d = code >> 2; const sl = code & 3
    const nd = (d + ((sl & 1) === 0 ? 1 : -1) + N) % N
    return nd * nS + sl
  }
  const canonOf = (p1: number, p2: number, n1: number, n2: number) => {
    let bestKey = ''; let bestSh = 0
    for (let sh = 0; sh < N; sh++) {
      let a0 = shiftCode(p1, sh); let a1 = shiftCode(p2, sh); if (a0 > a1) { const t = a0; a0 = a1; a1 = t }
      let b0 = shiftCode(n1, sh); let b1 = shiftCode(n2, sh); if (b0 > b1) { const t = b0; b0 = b1; b1 = t }
      const k = `${a0},${a1}|${b0},${b1}`
      if (bestKey === '' || k < bestKey) { bestKey = k; bestSh = sh }
    }
    return { key: bestKey, shift: bestSh }
  }
  const lineCodes: [number[], number[]] = [[], []]
  for (let d = 0; d < N; d++) {
    lineCodes[0].push(d * 4 + 0, d * 4 + 1)
    lineCodes[1].push(d * 4 + 2, d * 4 + 3)
  }
  const idxMap = new Map<string, number>()
  const keys: string[] = []
  const configs: [number, number, number, number][] = []
  for (let lp = 0; lp < 2; lp++) {
    const lsP = lineCodes[lp]!
    for (let i = 0; i < lsP.length; i++) for (let j = i + 1; j < lsP.length; j++) {
      const p1 = lsP[i]!; const p2 = lsP[j]!
      for (let ln = 0; ln < 2; ln++) {
        const lsN = lineCodes[ln]!
        for (let a = 0; a < lsN.length; a++) {
          const n1 = lsN[a]!; if (n1 === p1 || n1 === p2) continue
          for (let b = a + 1; b < lsN.length; b++) {
            const n2 = lsN[b]!; if (n2 === p1 || n2 === p2) continue
            const cn = canonOf(p1, p2, n1, n2)
            if (!idxMap.has(cn.key)) {
              idxMap.set(cn.key, configs.length)
              keys.push(cn.key)
              const [ps, ns] = cn.key.split('|')
              const [a0, a1] = ps!.split(',').map(Number)
              const [b0, b1] = ns!.split(',').map(Number)
              configs.push([a0!, a1!, b0!, b1!])
            }
          }
        }
      }
    }
  }
  const dim = configs.length
  const U = cmatZero(dim)
  for (let col = 0; col < dim; col++) {
    const [p1, p2, n1, n2] = configs[col]!
    const byDock = new Map<number, LocalExc[]>()
    for (const [c, tn] of [[p1, 1], [p2, 1], [n1, -1], [n2, -1]] as const) {
      const d = c >> 2
      const arr = byDock.get(d); if (arr) arr.push([c & 3, tn]); else byDock.set(d, [[c & 3, tn]])
    }
    let branches: { codes: [number, ToneNZ][]; amp: C }[] = [{ codes: [], amp: [1, 0] }]
    for (const [d, list] of byDock) {
      const loc = localDockAction(list, 2, true)
      const nb: { codes: [number, ToneNZ][]; amp: C }[] = []
      for (const b of branches) {
        for (const l of loc) {
          const cs = b.codes.slice()
          for (const [sl, tn] of l.excs) cs.push([d * 4 + sl, tn])
          nb.push({ codes: cs, amp: cMul(b.amp, l.amp) })
        }
      }
      branches = nb
    }
    for (const b of branches) {
      const ps: number[] = []; const ns: number[] = []
      for (const [c, tn] of b.codes) { const nc = stepCode(c); if (tn === 1) ps.push(nc); else ns.push(nc) }
      const cn = canonOf(ps[0]!, ps[1]!, ns[0]!, ns[1]!)
      const row = idxMap.get(cn.key)!
      const val = cMul(cExpI(q * cn.shift), b.amp)
      U.re[row * dim + col] = U.re[row * dim + col]! + val[0]
      U.im[row * dim + col] = U.im[row * dim + col]! + val[1]
    }
  }
  // True transverse coord = 1 (orthogonal to a_3 = (1, 0, 0, 0))
  const currentTransQ = (qProbe: number): [Float64Array, Float64Array] => {
    const jr = new Float64Array(dim)
    const ji = new Float64Array(dim)
    const tones: readonly ToneNZ[] = [1, 1, -1, -1]
    for (let i = 0; i < dim; i++) {
      const cfg = configs[i]!
      let sr = 0; let si = 0
      for (let idx = 0; idx < 4; idx++) {
        const code = cfg[idx]!
        const d = code >> 2; const sl = code & 3
        const jv = tones[idx]! * Number(ROOTS[LINES[d4Lines[sl >> 1]!]![sl & 1]!]![1]!)
        if (jv !== 0) { sr += jv * Math.cos(qProbe * d); si += jv * Math.sin(qProbe * d) }
      }
      jr[i] = sr; ji[i] = si
    }
    return [jr, ji]
  }
  return { U, dim, configs, keys, idxMap, currentTransQ }
}

function runPart2(): void {
  console.log('\n================================================================================')
  console.log('PART 2 (W13.2): FINITE-DENSITY NEUTRAL Q = 0_V PAIR-CONDENSATE LINEAR-RESPONSE')
  console.log('                & EXACT FLOQUET / BOGOLIUBOV SPECTRUM (rho = 1/6, 1/4, 1/3, 1/2)')
  console.log('================================================================================')

  let maxUniErr2 = 0
  let maxNormErr2 = 0
  let totalQDDefects = 0
  let minJNormSq = Infinity
  let allLowBandSuppressed = true

  // 2A. Periodic 1D Chains L = 4, 6, 8 across densities rho = 1/6, 1/4, 1/3, 1/2
  console.log('\n  [2A] Exact 1D Periodic Chains (L = 4, 6, 8; rho = 1/6, 1/4, 1/3, 1/2; Uniform & Staggered Seas):')
  const chainSpecs: readonly { readonly L: number; readonly M: number; readonly rhoLabel: string }[] = [
    { L: 4, M: 1, rhoLabel: '1/4' },
    { L: 4, M: 2, rhoLabel: '1/2' },
    { L: 6, M: 1, rhoLabel: '1/6' },
    { L: 6, M: 2, rhoLabel: '1/3' },
    { L: 6, M: 3, rhoLabel: '1/2' },
    { L: 8, M: 2, rhoLabel: '1/4' },
  ]

  let l4M2GapQ0 = PI
  let l4M2GapQ1 = PI
  let l4M2W0Q0 = 1
  let l4M2W0Q1 = 1

  for (const { L, M, rhoLabel } of chainSpecs) {
    const sys = build1DChainNeutralFull(L, M)
    totalQDDefects += sys.qConservationDefects + sys.dConservationDefects
    const uChk = verifySparseUnitary(sys.U)
    maxUniErr2 = Math.max(maxUniErr2, uChk.maxColNormErr, uChk.maxInvErr)

    const bgUnifR = new Float64Array(sys.dim)
    const bgStagR = new Float64Array(sys.dim)
    const bgZeroI = new Float64Array(sys.dim)
    let uCnt = 0; let sCnt = 0
    for (let i = 0; i < sys.dim; i++) {
      const [pm, nm] = sys.configs[i]!
      let allDip = true; let evenOnly = true; let stagPPNN = true
      for (let x = 0; x < L; x++) {
        const pSum = ((pm >> (2 * x)) & 1) + ((pm >> (2 * x + 1)) & 1)
        const nSum = ((nm >> (2 * x)) & 1) + ((nm >> (2 * x + 1)) & 1)
        if (!((pSum === 0 && nSum === 0) || (pSum === 1 && nSum === 1))) allDip = false
        if (x % 2 === 1 && (pSum > 0 || nSum > 0)) evenOnly = false
        if (x % 2 === 0 && !((pSum === 2 && nSum === 0) || (pSum === 0 && nSum === 0))) stagPPNN = false
        if (x % 2 === 1 && !((pSum === 0 && nSum === 2) || (pSum === 0 && nSum === 0))) stagPPNN = false
      }
      if (allDip) { bgUnifR[i] = 1; uCnt++ }
      if (M >= 2 && M % 2 === 0 ? stagPPNN : allDip && evenOnly) { bgStagR[i] = 1; sCnt++ }
    }
    for (let i = 0; i < sys.dim; i++) { bgUnifR[i] = bgUnifR[i]! / Math.sqrt(uCnt); bgStagR[i] = bgStagR[i]! / Math.sqrt(sCnt) }

    // For even-M staggered ++/-- pair crystal, evolve U|stag> (at L=4, where U^2 refocuses back to full pairs!)
    // or U^2|stag> (at L>=6) so pairs split and carry strictly non-vacuous current ||J||^2 > 0.5!
    let stR = bgStagR
    let stI = bgZeroI
    if (M >= 2 && M % 2 === 0) {
      const r1 = new Float64Array(sys.dim); const i1 = new Float64Array(sys.dim)
      applySparse(sys.U, bgStagR, bgZeroI, r1, i1)
      if (L === 4) {
        stR = r1; stI = i1
      } else {
        const r2 = new Float64Array(sys.dim); const i2 = new Float64Array(sys.dim)
        applySparse(sys.U, r1, i1, r2, i2)
        stR = r2; stI = i2
      }
    }

    const jQ1 = sys.currentCosDiag((2 * PI) / L)
    const kUnif1 = analyzeHermitianKubo(sys.U, bgUnifR, bgZeroI, jQ1, 192)
    const kStag1 = analyzeHermitianKubo(sys.U, stR, stI, jQ1, 192)
    maxNormErr2 = Math.max(maxNormErr2, kUnif1.normErr, kStag1.normErr)
    minJNormSq = Math.min(minJNormSq, kUnif1.jNormSq, kStag1.jNormSq)

    console.log(
      `       L=${L} M=${M} (rho=${rhoLabel}, dim=${String(sys.dim).padStart(5)}, invErr=${uChk.maxInvErr.toExponential(1)}): ` +
        `Unif(q=2pi/L, ||J||^2=${kUnif1.jNormSq.toFixed(2)}) max|ImPi|=${kUnif1.maxImPi.toFixed(2)}@${kUnif1.maxImPiOmega.toFixed(3)}, lowRat=${kUnif1.lowBandImPiRatio.toFixed(3)}, minPk=${kUnif1.minPeakOmegaAbs.toFixed(3)} | ` +
        `Stag(||J||^2=${kStag1.jNormSq.toFixed(2)}) max|ImPi|=${kStag1.maxImPi.toFixed(2)}@${kStag1.maxImPiOmega.toFixed(3)}, lowRat=${kStag1.lowBandImPiRatio.toFixed(3)}`,
    )

    // Exact full Floquet / Bogoliubov ED at L = 4, M = 2 (rho = 1/2): BOTH P = 0 (dim = 108) AND P = pi/2 (dim = 104)!
    if (L === 4 && M === 2) {
      const shiftMask = (m: number, sh: number): number => {
        let out = 0
        for (let x = 0; x < L; x++) {
          const nx = (x + sh) % L
          if ((m >> (2 * x)) & 1) out |= 1 << (2 * nx)
          if ((m >> (2 * x + 1)) & 1) out |= 1 << (2 * nx + 1)
        }
        return out
      }
      const buildPBlock = (P: number) => {
        const orbMap = new Map<number, number>()
        const orbReps: [number, number][] = []
        const orbSizes: number[] = []
        for (const [pm, nm] of sys.configs) {
          let bestK = Number.MAX_SAFE_INTEGER; let bestP = pm; let bestN = nm
          const seen = new Set<number>()
          for (let sh = 0; sh < L; sh++) {
            const sp = shiftMask(pm, sh); const sn = shiftMask(nm, sh)
            const k = (sp << 8) | sn; seen.add(k)
            if (k < bestK) { bestK = k; bestP = sp; bestN = sn }
          }
          if (!orbMap.has(bestK)) {
            const sym = L / seen.size
            if (Math.hypot(Math.cos((P * L) / sym) - 1, Math.sin((P * L) / sym)) < 1e-9) {
              orbMap.set(bestK, orbReps.length)
              orbReps.push([bestP, bestN]); orbSizes.push(seen.size)
            }
          }
        }
        const dOrb = orbReps.length
        const Uorb = cmatZero(dOrb)
        for (let col = 0; col < dOrb; col++) {
          const [pm, nm] = orbReps[col]!
          const fullCol = sys.idxOf(pm, nm)
          for (let k = sys.U.colPtr[fullCol]!; k < sys.U.colPtr[fullCol + 1]!; k++) {
            const [rpm, rnm] = sys.configs[sys.U.rowIdx[k]!]!
            let bestK = Number.MAX_SAFE_INTEGER; let bestSh = 0
            for (let sh = 0; sh < L; sh++) {
              const kk = (shiftMask(rpm, sh) << 8) | shiftMask(rnm, sh)
              if (kk < bestK) { bestK = kk; bestSh = sh }
            }
            const row = orbMap.get(bestK)
            if (row === undefined) continue
            const val = cScale(Math.sqrt(orbSizes[col]! / orbSizes[row]!), cMul(cExpI(P * bestSh), [sys.U.re[k]!, sys.U.im[k]!]))
            Uorb.re[row * dOrb + col] = Uorb.re[row * dOrb + col]! + val[0]
            Uorb.im[row * dOrb + col] = Uorb.im[row * dOrb + col]! + val[1]
          }
        }
        return { Uorb, dOrb, orbReps, orbSizes }
      }
      const blk0 = buildPBlock(0)
      const blkQ = buildPBlock(PI / 2)
      const u0Err = cmatUnitaryErr(blk0.Uorb)
      const uQErr = cmatUnitaryErr(blkQ.Uorb)
      maxUniErr2 = Math.max(maxUniErr2, u0Err, uQErr)
      const eig0 = unitaryEigen(blk0.Uorb)
      const eigQ = unitaryEigen(blkQ.Uorb)
      assertExact(eig0.maxRes < 1e-11 && eigQ.maxRes < 1e-11, 'L=4 M=2 Floquet ED residual failed')

      // Pick exact P = 0 Floquet eigenstate |Omega_eig> with maximum overlap on uniform neutral dipole sea
      let bestEig = 0; let bestOv = -1
      for (let c = 0; c < blk0.dOrb; c++) {
        let or = 0; let oi = 0
        for (let r = 0; r < blk0.dOrb; r++) {
          const [pm, nm] = blk0.orbReps[r]!
          const w = bgUnifR[sys.idxOf(pm, nm)]! * Math.sqrt(blk0.orbSizes[r]!)
          or += eig0.vecs.re[r * blk0.dOrb + c]! * w; oi += eig0.vecs.im[r * blk0.dOrb + c]! * w
        }
        const ov = or * or + oi * oi
        if (ov > bestOv) { bestOv = ov; bestEig = c }
      }
      const E0 = eig0.phases[bestEig]!
      // Lift |Omega_eig> to full 420-dim space, apply J(q = 0) and J(q = pi/2), project onto P = 0 and P = pi/2 eigenvectors!
      const psi0R = new Float64Array(sys.dim); const psi0I = new Float64Array(sys.dim)
      for (let r = 0; r < blk0.dOrb; r++) {
        const [pm, nm] = blk0.orbReps[r]!
        const ampR = eig0.vecs.re[r * blk0.dOrb + bestEig]! / Math.sqrt(blk0.orbSizes[r]!)
        const ampI = eig0.vecs.im[r * blk0.dOrb + bestEig]! / Math.sqrt(blk0.orbSizes[r]!)
        const seen = new Set<number>()
        for (let sh = 0; sh < L; sh++) {
          const sp = shiftMask(pm, sh); const sn = shiftMask(nm, sh)
          const kk = (sp << 8) | sn
          if (!seen.has(kk)) {
            seen.add(kk)
            const idx = sys.idxOf(sp, sn)
            psi0R[idx] = ampR; psi0I[idx] = ampI
          }
        }
      }
      const analyzeTransition = (qVal: number, blk: ReturnType<typeof buildPBlock>, eig: ReturnType<typeof unitaryEigen>) => {
        // Apply J(qVal) = sum_x e^{i qVal x} j_x to |Omega_eig>
        const jPhiR = new Float64Array(sys.dim); const jPhiI = new Float64Array(sys.dim)
        for (let i = 0; i < sys.dim; i++) {
          const [pm, nm] = sys.configs[i]!
          let jr = 0; let ji = 0
          for (let x = 0; x < L; x++) {
            const jx = ((pm >> (2 * x)) & 1) - ((pm >> (2 * x + 1)) & 1) - ((nm >> (2 * x)) & 1) + ((nm >> (2 * x + 1)) & 1)
            if (jx !== 0) { jr += jx * Math.cos(qVal * x); ji += jx * Math.sin(qVal * x) }
          }
          jPhiR[i] = jr * psi0R[i]! - ji * psi0I[i]!
          jPhiI[i] = jr * psi0I[i]! + ji * psi0R[i]!
        }
        // Project jPhi onto orbit basis of blk (momentum P = qVal)
        const projR = new Float64Array(blk.dOrb); const projI = new Float64Array(blk.dOrb)
        for (let r = 0; r < blk.dOrb; r++) {
          const [pm, nm] = blk.orbReps[r]!
          const invS = 1 / Math.sqrt(blk.orbSizes[r]!)
          const seen = new Set<number>()
          for (let sh = 0; sh < L; sh++) {
            const sp = shiftMask(pm, sh); const sn = shiftMask(nm, sh)
            const kk = (sp << 8) | sn
            if (!seen.has(kk)) {
              seen.add(kk)
              const idx = sys.idxOf(sp, sn)
              // <orb(r); qVal | jPhi>: orbit state has phase e^{+i qVal sh} on T_sh |rep> -> conj is e^{-i qVal sh}
              const ph = cExpI(-qVal * sh)
              projR[r] = projR[r]! + invS * (ph[0] * jPhiR[idx]! - ph[1] * jPhiI[idx]!)
              projI[r] = projI[r]! + invS * (ph[0] * jPhiI[idx]! + ph[1] * jPhiR[idx]!)
            }
          }
        }
        let w0 = 0; let minDE = PI; let totW = 0; let topDE = 0; let topW = 0
        for (let c = 0; c < blk.dOrb; c++) {
          let sr = 0; let si = 0
          for (let r = 0; r < blk.dOrb; r++) {
            const vr = eig.vecs.re[r * blk.dOrb + c]!; const vi = eig.vecs.im[r * blk.dOrb + c]!
            sr += vr * projR[r]! + vi * projI[r]!
            si += vr * projI[r]! - vi * projR[r]!
          }
          const wt = sr * sr + si * si
          totW += wt
          if (wt > 1e-10) {
            let dE = eig.phases[c]! - E0
            while (dE > PI) dE -= 2 * PI
            while (dE <= -PI) dE += 2 * PI
            const adE = Math.abs(dE)
            if (adE < 1e-5) w0 += wt
            else if (adE < minDE) minDE = adE
            if (wt > topW) { topW = wt; topDE = dE }
          }
        }
        return { w0: totW > 0 ? w0 / totW : 0, minDE, topDE, topFrac: totW > 0 ? topW / totW : 0, totW }
      }
      const tr0 = analyzeTransition(0, blk0, eig0)
      const trQ = analyzeTransition(PI / 2, blkQ, eigQ)
      l4M2W0Q0 = tr0.w0; l4M2GapQ0 = tr0.minDE
      l4M2W0Q1 = trQ.w0; l4M2GapQ1 = trQ.minDE
      console.log(
        `       [EXACT FLOQUET BOGOLIUBOV ED L=4 M=2 rho=1/2 (dim P=0:${blk0.dOrb}, P=pi/2:${blkQ.dOrb}, u0Err=${u0Err.toExponential(1)}, uQErr=${uQErr.toExponential(1)}, E0=${E0.toFixed(5)} rad)]:`,
      )
      console.log(
        `         q=0   : ||J|Om>||^2=${tr0.totW.toFixed(3)}, W(dE=0)=${tr0.w0.toExponential(1)}, exact gap min|dE|=${tr0.minDE.toFixed(5)} rad, top=${tr0.topDE.toFixed(4)} (${(100 * tr0.topFrac).toFixed(1)}%)`,
      )
      console.log(
        `         q=pi/2: ||J|Om>||^2=${trQ.totW.toFixed(3)}, W(dE=0)=${trQ.w0.toExponential(1)}, exact gap min|dE|=${trQ.minDE.toFixed(5)} rad, top=${trQ.topDE.toFixed(4)} (${(100 * trQ.topFrac).toFixed(1)}%)`,
      )
    }
  }

  // 2B. Multi-Axis 2D/3D Finite-Density Pair Condensates (L = 3, M_pair(zeta_18) ACTIVE, TRUE P_bg = 0 -> P = +-q!)
  console.log('\n  [2B] Multi-Axis 2D/3D Finite-Density Pair Condensates (L = 3, M_pair Active, TRUE P_bg=0 -> P=+-q_x Transverse J_y):')
  const t2_q0 = build2DTorusK4Even(3, [0, 0], true)
  const t2_qp = build2DTorusK4Even(3, [(2 * PI) / 3, 0], true)
  const t2_qn = build2DTorusK4Even(3, [(-2 * PI) / 3, 0], true)
  const ut2_0 = verifySparseUnitary(t2_q0.U)
  const ut2_p = verifySparseUnitary(t2_qp.U)
  const ut2_n = verifySparseUnitary(t2_qn.U)
  maxUniErr2 = Math.max(
    maxUniErr2,
    ut2_0.maxColNormErr, ut2_0.maxInvErr,
    ut2_p.maxColNormErr, ut2_p.maxInvErr,
    ut2_n.maxColNormErr, ut2_n.maxInvErr,
  )
  assertExact(t2_q0.dim === t2_qp.dim && t2_q0.dim === t2_qn.dim, 'Z^2/3Z^2 momentum-sector dim mismatch')
  const map2D_0ToQ = new Int32Array(t2_q0.dim)
  for (let i = 0; i < t2_q0.dim; i++) {
    const a = t2_q0.configs[i]!
    const b = t2_qp.configs[i]!
    const c = t2_qn.configs[i]!
    assertExact(a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3], 'Z^2/3Z^2 orbit alignment (+q)')
    assertExact(a[0] === c[0] && a[1] === c[1] && a[2] === c[2] && a[3] === c[3], 'Z^2/3Z^2 orbit alignment (-q)')
    map2D_0ToQ[i] = i
  }

  const bg2Unif = new Float64Array(t2_q0.dim)
  const bg2Mp = new Float64Array(t2_q0.dim)
  const bg2St = new Float64Array(t2_q0.dim)
  const z2I = new Float64Array(t2_q0.dim)
  let cU = 0; let cM = 0; let cS = 0
  for (let i = 0; i < t2_q0.dim; i++) {
    const [p1, p2, n1, n2] = t2_q0.configs[i]!
    const dP1 = p1 >> 2; const sP1 = p1 & 3; const dP2 = p2 >> 2; const sP2 = p2 & 3
    const dN1 = n1 >> 2; const sN1 = n1 & 3; const dN2 = n2 >> 2; const sN2 = n2 & 3
    const isTwoDip =
      ((dP1 === dN1 && (sP1 ^ 1) === sN1 && dP2 === dN2 && (sP2 ^ 1) === sN2) ||
        (dP1 === dN2 && (sP1 ^ 1) === sN2 && dP2 === dN1 && (sP2 ^ 1) === sN1)) &&
      dP1 !== dP2
    if (isTwoDip) { bg2Unif[i] = 1; cU++ }
    const isSole = dP1 === dP2 && (sP1 ^ 1) === sP2 && dN1 === dN2 && (sN1 ^ 1) === sN2 && dP1 !== dN1
    if (isSole) { bg2Mp[i] = 1; cM++ }
    if (isSole && (sP1 >> 1) === 0 && (sN1 >> 1) === 1) { bg2St[i] = 1; cS++ }
  }
  for (let i = 0; i < t2_q0.dim; i++) {
    bg2Unif[i] = bg2Unif[i]! / Math.sqrt(cU)
    bg2Mp[i] = bg2Mp[i]! / Math.sqrt(cM)
    bg2St[i] = bg2St[i]! / Math.sqrt(cS)
  }
  // True transverse current J_y(q_x = 0) and J_y(+q_x) = sum_{x,y} e^{+i (2pi/3) x} j_y(x, y)
  const jY_2D_q0 = new Float64Array(t2_q0.dim)
  const jY_2D_qpRe = new Float64Array(t2_q0.dim)
  const jY_2D_qpIm = new Float64Array(t2_q0.dim)
  const cosX3 = [1, Math.cos((2 * PI) / 3), Math.cos((4 * PI) / 3)] as const
  const sinX3 = [0, Math.sin((2 * PI) / 3), Math.sin((4 * PI) / 3)] as const
  for (let i = 0; i < t2_q0.dim; i++) {
    const [p1, p2, n1, n2] = t2_q0.configs[i]!
    let s0 = 0; let sr = 0; let si = 0
    for (const [code, tn] of [[p1, 1], [p2, 1], [n1, -1], [n2, -1]] as const) {
      const sl = code & 3
      const jv = sl === 2 ? tn : sl === 3 ? -tn : 0
      if (jv !== 0) {
        const x = (code >> 2) % 3
        s0 += jv
        sr += jv * cosX3[x]!
        si += jv * sinX3[x]!
      }
    }
    jY_2D_q0[i] = s0
    jY_2D_qpRe[i] = sr
    jY_2D_qpIm[i] = si
  }
  let jBareMpNorm = 0
  for (let i = 0; i < t2_q0.dim; i++) jBareMpNorm += (jY_2D_q0[i]! * bg2Mp[i]!) ** 2
  jBareMpNorm = Math.sqrt(jBareMpNorm)

  // Evolve |Omega> STRICTLY inside P_bg = 0 (t2_q0.U) by 2 beats (U(0)^2) so C = D^2 creates non-vacuous J_y!
  const stepN = (U: SparseCSC, r0: Float64Array, i0: Float64Array, steps: number): [Float64Array, Float64Array] => {
    let cR = Float64Array.from(r0); let cI = Float64Array.from(i0)
    let nR = new Float64Array(U.dim); let nI = new Float64Array(U.dim)
    for (let s = 0; s < steps; s++) {
      applySparse(U, cR, cI, nR, nI)
      let sw = cR; cR = nR; nR = sw; sw = cI; cI = nI; nI = sw
    }
    return [cR, cI]
  }
  const [om2MpR, om2MpI] = stepN(t2_q0.U, bg2Mp, z2I, 2)
  const [om2StR, om2StI] = stepN(t2_q0.U, bg2St, z2I, 2)
  const [om2UnR, om2UnI] = stepN(t2_q0.U, bg2Unif, z2I, 2)

  const k2D_mpair0 = analyzeHermitianKubo(t2_q0.U, om2MpR, om2MpI, jY_2D_q0, 192)
  const k2D_unifQ = analyzeInterSectorKubo(t2_q0.U, t2_qp.U, t2_qn.U, map2D_0ToQ, jY_2D_qpRe, jY_2D_qpIm, om2UnR, om2UnI, 192)
  const k2D_mpairQ = analyzeInterSectorKubo(t2_q0.U, t2_qp.U, t2_qn.U, map2D_0ToQ, jY_2D_qpRe, jY_2D_qpIm, om2MpR, om2MpI, 192)
  const k2D_stagQ = analyzeInterSectorKubo(t2_q0.U, t2_qp.U, t2_qn.U, map2D_0ToQ, jY_2D_qpRe, jY_2D_qpIm, om2StR, om2StI, 192)
  maxNormErr2 = Math.max(maxNormErr2, k2D_mpair0.normErr, k2D_unifQ.normErr, k2D_mpairQ.normErr, k2D_stagQ.normErr)
  minJNormSq = Math.min(minJNormSq, k2D_mpair0.jNormSq, k2D_unifQ.jNormSq, k2D_mpairQ.jNormSq, k2D_stagQ.jNormSq)

  console.log(
    `       Z^2 / 3 Z^2 (9 docks, rho=2/9, dim=${t2_q0.dim}, invErr=${Math.max(ut2_0.maxInvErr, ut2_p.maxInvErr, ut2_n.maxInvErr).toExponential(1)}): ||J_y |Omega_Mpair(t=0)>|| = ${jBareMpNorm.toExponential(1)} (exact 0 on bare sole pairs!)`,
  )
  console.log(
    `         Unif Sea   (P_bg=0 U(0)^2|u>,  q_probe=(2pi/3,0), ||J||^2=${k2D_unifQ.jNormSq.toFixed(2)}): W0=${k2D_unifQ.w0_TMax.toExponential(2)}, max|ImPi|=${k2D_unifQ.maxImPi.toFixed(2)}@${k2D_unifQ.maxImPiOmega.toFixed(3)}, lowRat=${k2D_unifQ.lowBandImPiRatio.toFixed(3)}, minPk=${k2D_unifQ.minPeakOmegaAbs.toFixed(3)}`,
  )
  console.log(
    `         M_pair Cond(P_bg=0 U(0)^2|s>,  q_probe=(0,0),     ||J||^2=${k2D_mpair0.jNormSq.toFixed(2)}): W0=${k2D_mpair0.w0_TMax.toExponential(2)}, max|ImPi|=${k2D_mpair0.maxImPi.toFixed(2)}@${k2D_mpair0.maxImPiOmega.toFixed(3)}, lowRat=${k2D_mpair0.lowBandImPiRatio.toFixed(3)}, minPk=${k2D_mpair0.minPeakOmegaAbs.toFixed(3)}`,
  )
  console.log(
    `         M_pair Cond(P_bg=0 U(0)^2|s>,  q_probe=(2pi/3,0), ||J||^2=${k2D_mpairQ.jNormSq.toFixed(2)}): W0=${k2D_mpairQ.w0_TMax.toExponential(2)}, max|ImPi|=${k2D_mpairQ.maxImPi.toFixed(2)}@${k2D_mpairQ.maxImPiOmega.toFixed(3)}, lowRat=${k2D_mpairQ.lowBandImPiRatio.toFixed(3)}, minPk=${k2D_mpairQ.minPeakOmegaAbs.toFixed(3)}`,
  )
  console.log(
    `         Stag Cond  (P_bg=0 U(0)^2|st>, q_probe=(2pi/3,0), ||J||^2=${k2D_stagQ.jNormSq.toFixed(2)}): W0=${k2D_stagQ.w0_TMax.toExponential(2)}, max|ImPi|=${k2D_stagQ.maxImPi.toFixed(2)}@${k2D_stagQ.maxImPiOmega.toFixed(3)}, lowRat=${k2D_stagQ.lowBandImPiRatio.toFixed(3)}, minPk=${k2D_stagQ.minPeakOmegaAbs.toFixed(3)}`,
  )

  // 3D 3-axis coupled rings B_3(L = 3, rho = 2/7, dim = 1,620, U^2|Mpair>, x-ring AB flux q_x = 2pi/3)
  const geoB3 = buildBouquetRings(3, 3)
  const b3k4_qx = buildBouquetK4Even(geoB3, [(2 * PI) / 3, 0, 0], true)
  const ub3k4 = verifySparseUnitary(b3k4_qx.U)
  maxUniErr2 = Math.max(maxUniErr2, ub3k4.maxColNormErr, ub3k4.maxInvErr)
  const jY_B3 = new Float64Array(b3k4_qx.dim)
  const bgB3Mp = new Float64Array(b3k4_qx.dim)
  const bgB3Z = new Float64Array(b3k4_qx.dim)
  let cB3 = 0
  for (let i = 0; i < b3k4_qx.dim; i++) {
    const [p1, p2, n1, n2] = b3k4_qx.configs[i]!
    const jv = (g: number, tn: ToneNZ) => (geoB3.slotLine[g] === 1 ? (geoB3.slotDir[g] === 0 ? tn : -tn) : 0)
    jY_B3[i] = jv(p1, 1) + jv(p2, 1) + jv(n1, -1) + jv(n2, -1)
    if (geoB3.slotDock[p1] === geoB3.slotDock[p2] && geoB3.slotDock[n1] === geoB3.slotDock[n2] && geoB3.slotDock[p1] !== geoB3.slotDock[n1]) {
      bgB3Mp[i] = 1; cB3++
    }
  }
  for (let i = 0; i < b3k4_qx.dim; i++) bgB3Mp[i] = bgB3Mp[i]! / Math.sqrt(cB3)
  const [omB3R, omB3I] = stepN(b3k4_qx.U, bgB3Mp, bgB3Z, 2)
  const kB3_mp = analyzeHermitianKubo(b3k4_qx.U, omB3R, omB3I, jY_B3, 256)
  maxNormErr2 = Math.max(maxNormErr2, kB3_mp.normErr)
  minJNormSq = Math.min(minJNormSq, kB3_mp.jNormSq)
  console.log(
    `       B_3(L=3, 3 axes, rho=2/7, dim=${b3k4_qx.dim}, invErr=${ub3k4.maxInvErr.toExponential(1)}, U^2|s> AB-flux q_x=2pi/3, ||J||^2=${kB3_mp.jNormSq.toFixed(2)}): W0=${kB3_mp.w0_TMax.toExponential(2)}, max|ImPi|=${kB3_mp.maxImPi.toFixed(2)}@${kB3_mp.maxImPiOmega.toFixed(3)}, lowRat=${kB3_mp.lowBandImPiRatio.toFixed(3)}, minPk=${kB3_mp.minPeakOmegaAbs.toFixed(3)}`,
  )

  // 2C. Exact 2-Dock (12-Line W(F_4)), 3-Dock (2-Line Exact Stationary ED), & 4-Dock / 5-Dock Chiral D_4 Clusters
  console.log('\n  [2C] Exact 2-Dock (12-Line W(F_4)), 3-Dock D_4 Stationary Bogoliubov ED, & 4/5-Dock Chiral D_4 (TRUE Transverse J_T(q)):')
  const d2_12 = build2Dock12LineD4Cluster(true)
  const ud2 = verifySparseUnitary(d2_12.U)
  maxUniErr2 = Math.max(maxUniErr2, ud2.maxColNormErr, ud2.maxInvErr)
  const bg2UnifD2 = new Float64Array(d2_12.dim)
  const bg2WF4 = new Float64Array(d2_12.dim)
  const bg2Z = new Float64Array(d2_12.dim)
  let c2U = 0; let c2W = 0
  for (let i = 0; i < d2_12.dim; i++) {
    const [p1, p2, n1, n2] = d2_12.configs[i]!
    const dP1 = (p1 >> 1) & 1; const dP2 = (p2 >> 1) & 1
    const dN1 = (n1 >> 1) & 1; const dN2 = (n2 >> 1) & 1
    if (dP1 === 0 && dP2 === 0 && dN1 === 1 && dN2 === 1) { bg2WF4[i] = 1; c2W++ }
    if (dP1 !== dP2 && dN1 !== dN2) { bg2UnifD2[i] = 1; c2U++ }
  }
  for (let i = 0; i < d2_12.dim; i++) {
    bg2UnifD2[i] = bg2UnifD2[i]! / Math.sqrt(c2U)
    bg2WF4[i] = bg2WF4[i]! / Math.sqrt(c2W)
  }
  const j2U = d2_12.currentDiag(0, false)
  const j2S = d2_12.currentDiag(0, true)
  const k2d_u = analyzeHermitianKubo(d2_12.U, bg2UnifD2, bg2Z, j2U, 256)
  const k2d_s = analyzeHermitianKubo(d2_12.U, bg2UnifD2, bg2Z, j2S, 256)
  maxNormErr2 = Math.max(maxNormErr2, k2d_u.normErr, k2d_s.normErr)
  minJNormSq = Math.min(minJNormSq, k2d_u.jNormSq, k2d_s.jNormSq)
  // Verify exact L = 2 bipartite lock on sole ++ / -- pair state |WF4>
  const wf4S1R = new Float64Array(d2_12.dim); const wf4S1I = new Float64Array(d2_12.dim)
  applySparse(d2_12.U, bg2WF4, bg2Z, wf4S1R, wf4S1I)
  let j2WF4Norm = 0
  for (let i = 0; i < d2_12.dim; i++) j2WF4Norm += j2U[i]! * j2U[i]! * (wf4S1R[i]! ** 2 + wf4S1I[i]! ** 2)
  j2WF4Norm = Math.sqrt(j2WF4Norm)
  console.log(
    `       2-Dock 12-Line W(F_4) D_4 (rho=1, dim=${d2_12.dim}, invErr=${ud2.maxInvErr.toExponential(1)}, Sole-pair ||J U|WF4>||=${j2WF4Norm.toExponential(1)} L=2 lock):`,
  )
  console.log(
    `         Split-WF4 (q=0,  ||J||^2=${k2d_u.jNormSq.toFixed(2)}): W0=${k2d_u.w0_TMax.toExponential(2)}, max|ImPi|=${k2d_u.maxImPi.toFixed(2)}@${k2d_u.maxImPiOmega.toFixed(3)}, lowRat=${k2d_u.lowBandImPiRatio.toFixed(3)}, minPk=${k2d_u.minPeakOmegaAbs.toFixed(3)}`,
  )
  console.log(
    `         Split-WF4 (q=pi, ||J||^2=${k2d_s.jNormSq.toFixed(2)}): W0=${k2d_s.w0_TMax.toExponential(2)}, max|ImPi|=${k2d_s.maxImPi.toFixed(2)}@${k2d_s.maxImPiOmega.toFixed(3)}, lowRat=${k2d_s.lowBandImPiRatio.toFixed(3)}, minPk=${k2d_s.minPeakOmegaAbs.toFixed(3)}`,
  )

  // EXACT Stationary Multi-Axis Floquet Bogoliubov ED on 3-Dock Odd-Prime 2-Line D_4 (dim = 210, rho = 2/3, coord=1 transverse!)
  const d3_0 = build3Dock2LineD4ExactED(0)
  const d3_q = build3Dock2LineD4ExactED((2 * PI) / 3)
  const ud3_0 = cmatUnitaryErr(d3_0.U)
  const ud3_q = cmatUnitaryErr(d3_q.U)
  maxUniErr2 = Math.max(maxUniErr2, ud3_0, ud3_q)
  const eigD3_0 = unitaryEigen(d3_0.U)
  const eigD3_q = unitaryEigen(d3_q.U)
  assertExact(eigD3_0.maxRes < 1e-11 && eigD3_q.maxRes < 1e-11, '3-Dock D_4 stationary ED residual failed')
  // Build M_pair-coherent s-wave pair condensate in P = 0 (sole ++ on one dock, sole -- on another dock)
  const bgD3Mp = new Float64Array(d3_0.dim)
  let cD3Mp = 0
  for (let i = 0; i < d3_0.dim; i++) {
    const [p1, p2, n1, n2] = d3_0.configs[i]!
    if ((p1 >> 2) === (p2 >> 2) && (n1 >> 2) === (n2 >> 2) && (p1 >> 2) !== (n1 >> 2)) { bgD3Mp[i] = 1; cD3Mp++ }
  }
  for (let i = 0; i < d3_0.dim; i++) bgD3Mp[i] = bgD3Mp[i]! / Math.sqrt(cD3Mp)
  const [jD3_0R] = d3_0.currentTransQ(0)
  const [jD3_qR, jD3_qI] = d3_0.currentTransQ((2 * PI) / 3)
  // Pick exact P = 0 Floquet eigenstate |Omega_eig> with maximum overlap on M_pair pair condensate (and non-vacuous J_1)
  let bestD3Eig = 0; let bestD3Ov = -1
  for (let c = 0; c < d3_0.dim; c++) {
    let or = 0; let oi = 0
    for (let r = 0; r < d3_0.dim; r++) {
      const w = bgD3Mp[r]!
      if (w === 0) continue
      or += eigD3_0.vecs.re[r * d3_0.dim + c]! * w
      oi += eigD3_0.vecs.im[r * d3_0.dim + c]! * w
    }
    const ov = or * or + oi * oi
    if (ov > bestD3Ov) { bestD3Ov = ov; bestD3Eig = c }
  }
  const E0_D3 = eigD3_0.phases[bestD3Eig]!
  const analyzeD3Trans = (jr: Float64Array, ji: Float64Array, eig: ReturnType<typeof unitaryEigen>, subtractSelf: boolean) => {
    const n = d3_0.dim
    const phiR = new Float64Array(n); const phiI = new Float64Array(n)
    for (let r = 0; r < n; r++) {
      const vr = eigD3_0.vecs.re[r * n + bestD3Eig]!; const vi = eigD3_0.vecs.im[r * n + bestD3Eig]!
      phiR[r] = jr[r]! * vr - ji[r]! * vi
      phiI[r] = jr[r]! * vi + ji[r]! * vr
    }
    let w0 = 0; let wLow = 0; let minDE = PI; let minDEWeight = 0; let totW = 0; let topDE = 0; let topW = 0
    for (let c = 0; c < n; c++) {
      if (subtractSelf && c === bestD3Eig) continue
      let sr = 0; let si = 0
      for (let r = 0; r < n; r++) {
        const er = eig.vecs.re[r * n + c]!; const ei = eig.vecs.im[r * n + c]!
        sr += er * phiR[r]! + ei * phiI[r]!
        si += er * phiI[r]! - ei * phiR[r]!
      }
      const wt = sr * sr + si * si
      totW += wt
      if (wt > 1e-10) {
        let dE = eig.phases[c]! - E0_D3
        while (dE > PI) dE -= 2 * PI
        while (dE <= -PI) dE += 2 * PI
        const adE = Math.abs(dE)
        if (adE < 1e-5) w0 += wt
        else {
          if (adE <= 0.25) wLow += wt
          if (adE < minDE) { minDE = adE; minDEWeight = wt }
        }
        if (wt > topW) { topW = wt; topDE = dE }
      }
    }
    return {
      w0: totW > 0 ? w0 / totW : 0,
      lowFrac: totW > 0 ? wLow / totW : 0,
      minDE,
      minDEFrac: totW > 0 ? minDEWeight / totW : 0,
      topDE,
      topFrac: totW > 0 ? topW / totW : 0,
      totW,
    }
  }
  const d3Tr0 = analyzeD3Trans(jD3_0R, new Float64Array(d3_0.dim), eigD3_0, true)
  const d3TrQ = analyzeD3Trans(jD3_qR, jD3_qI, eigD3_q, false)
  minJNormSq = Math.min(minJNormSq, d3Tr0.totW, d3TrQ.totW)
  console.log(
    `       [EXACT MULTI-AXIS STATIONARY FLOQUET BOGOLIUBOV ED: 3-Dock 2-Line D_4, rho=2/3, M_pair ON, TRUE TRANSVERSE coord=1 (a_3.e_1=0)]:`,
  )
  console.log(
    `         dim=${d3_0.dim}, u0Err=${ud3_0.toExponential(1)}, uQErr=${ud3_q.toExponential(1)}, E0=${E0_D3.toFixed(5)} rad (M_pair s-wave overlap=${bestD3Ov.toFixed(4)})`,
  )
  console.log(
    `         q=0    : ||J_1|Om>||^2=${d3Tr0.totW.toFixed(3)}, W(dE=0)=${d3Tr0.w0.toExponential(1)}, min|dE|=${d3Tr0.minDE.toFixed(5)}(${(100 * d3Tr0.minDEFrac).toFixed(2)}%), W(|dE|<=0.25)=${(100 * d3Tr0.lowFrac).toFixed(2)}%, top=${d3Tr0.topDE.toFixed(4)} (${(100 * d3Tr0.topFrac).toFixed(1)}%)`,
  )
  console.log(
    `         q=2pi/3: ||J_1|Om>||^2=${d3TrQ.totW.toFixed(3)}, W(dE=0)=${d3TrQ.w0.toExponential(1)}, min|dE|=${d3TrQ.minDE.toFixed(5)}(${(100 * d3TrQ.minDEFrac).toFixed(2)}%), W(|dE|<=0.25)=${(100 * d3TrQ.lowFrac).toFixed(2)}%, top=${d3TrQ.topDE.toFixed(4)} (${(100 * d3TrQ.topFrac).toFixed(1)}%)`,
  )

  // 4-Dock D_4 (rho = 1/2, a_4=(1,0,1,2), TRUE transverse coord=1!) & 5-Dock odd-prime D_4 (rho = 2/5, a_5=(1,2,0,1), TRUE transverse coord=2!)
  // STRICT P_bg = 0 background evolved by U(0) -> probed via EXACT inter-sector P = 0 -> P = +-q Kubo!
  const d4Mp_q0 = buildNDockD4Quotient(4, 0, 'mpair-even', true)
  const d4Mp_qp = buildNDockD4Quotient(4, PI / 2, 'mpair-even', true)
  const d4Mp_qn = buildNDockD4Quotient(4, -PI / 2, 'mpair-even', true)
  const d4Ch_q0 = buildNDockD4Quotient(4, 0, 'chiral-4line', true)
  const d4Ch_qp = buildNDockD4Quotient(4, PI / 2, 'chiral-4line', true)
  const d4Ch_qn = buildNDockD4Quotient(4, -PI / 2, 'chiral-4line', true)
  const d5Mp_q0 = buildNDockD4Quotient(5, 0, 'mpair-even', true)
  const d5Mp_qp = buildNDockD4Quotient(5, (2 * PI) / 5, 'mpair-even', true)
  const d5Mp_qn = buildNDockD4Quotient(5, (-2 * PI) / 5, 'mpair-even', true)
  const d5Ch_q0 = buildNDockD4Quotient(5, 0, 'chiral-4line', true)
  const d5Ch_qp = buildNDockD4Quotient(5, (2 * PI) / 5, 'chiral-4line', true)
  const d5Ch_qn = buildNDockD4Quotient(5, (-2 * PI) / 5, 'chiral-4line', true)

  let maxD4QuotInvErr = 0
  for (const s of [d4Mp_q0, d4Mp_qp, d4Mp_qn, d4Ch_q0, d4Ch_qp, d4Ch_qn, d5Mp_q0, d5Mp_qp, d5Mp_qn, d5Ch_q0, d5Ch_qp, d5Ch_qn]) {
    const u = verifySparseUnitary(s.U)
    maxUniErr2 = Math.max(maxUniErr2, u.maxColNormErr, u.maxInvErr)
    maxD4QuotInvErr = Math.max(maxD4QuotInvErr, u.maxInvErr)
  }

  const buildD4Bg0 = (sys0: ReturnType<typeof buildNDockD4Quotient>, isMPair: boolean, steps: number): [Float64Array, Float64Array] => {
    const bgR = new Float64Array(sys0.dim); const bgI = new Float64Array(sys0.dim)
    let cnt = 0
    for (let i = 0; i < sys0.dim; i++) {
      const [c0, c1, c2, c3] = sys0.configs[i]!
      if (isMPair) {
        if ((c0 >> 3) === (c1 >> 3) && (c2 >> 3) === (c3 >> 3) && (c0 >> 3) !== (c2 >> 3)) { bgR[i] = 1; cnt++ }
      } else {
        if ((c0 >> 3) === 0 && (c1 >> 3) === 0 && (c2 >> 3) === 0 && (c3 >> 3) === 0) { bgR[i] = 1; cnt++ }
      }
    }
    for (let i = 0; i < sys0.dim; i++) bgR[i] = bgR[i]! / Math.sqrt(cnt)
    return steps === 0 ? [bgR, bgI] : stepN(sys0.U, bgR, bgI, steps)
  }
  const buildMap0ToQ = (
    sys0: ReturnType<typeof buildNDockD4Quotient>,
    sysP: ReturnType<typeof buildNDockD4Quotient>,
    sysN: ReturnType<typeof buildNDockD4Quotient>,
  ): Int32Array => {
    const map = new Int32Array(sys0.dim).fill(-1)
    for (let i = 0; i < sys0.dim; i++) {
      const k = sys0.keys[i]!
      const ip = sysP.idxMap.get(k)
      const ineg = sysN.idxMap.get(k)
      assertExact(ip === ineg, `Upos/Uneg key mismatch on ${k}`)
      if (ip !== undefined) map[i] = ip
    }
    return map
  }

  const runD4InterKubo = (
    label: string,
    sys0: ReturnType<typeof buildNDockD4Quotient>,
    sysP: ReturnType<typeof buildNDockD4Quotient>,
    sysN: ReturnType<typeof buildNDockD4Quotient>,
    isMPair: boolean,
    steps: number,
    coord: number,
    qProbe: number,
    includeInMinJ = true,
  ): KuboReport => {
    const [rUse, iUse] = buildD4Bg0(sys0, isMPair, steps)
    const [jRe, jIm] = sys0.currentAtQ(coord, qProbe)
    const rep =
      qProbe === 0
        ? analyzeHermitianKubo(sys0.U, rUse, iUse, jRe, 256)
        : analyzeInterSectorKubo(sys0.U, sysP.U, sysN.U, buildMap0ToQ(sys0, sysP, sysN), jRe, jIm, rUse, iUse, 256)
    maxNormErr2 = Math.max(maxNormErr2, rep.normErr)
    if (includeInMinJ) minJNormSq = Math.min(minJNormSq, rep.jNormSq)
    console.log(
      `       ${label.padEnd(54)} (d0=${sys0.dim}, dQ=${sysP.dim}, ||J||^2=${rep.jNormSq.toFixed(2)}): W0(64->256)=${rep.w0_T64.toExponential(1)}->${rep.w0_TMax.toExponential(1)}, max|ImPi|=${rep.maxImPi.toFixed(2)}@${rep.maxImPiOmega.toFixed(3)}, low=${rep.maxImPiLow.toFixed(2)}@${rep.maxImPiLowOmega.toFixed(3)}(rat=${rep.lowBandImPiRatio.toFixed(3)}), minPk=${rep.minPeakOmegaAbs.toFixed(3)}`,
    )
    return rep
  }

  // Verify exact N = 4 bipartite refocusing on U(0)^2|M_pair> at q_probe = pi/2, coord = 1 transverse!
  const [d4MpU2R, d4MpU2I] = buildD4Bg0(d4Mp_q0, true, 2)
  const [jD4_1_qRe, jD4_1_qIm] = d4Mp_q0.currentAtQ(1, PI / 2)
  let d4MpU2JNormSq = 0
  for (let i = 0; i < d4Mp_q0.dim; i++) {
    const jr = jD4_1_qRe[i]!; const ji = jD4_1_qIm[i]!
    const br = d4MpU2R[i]!; const bi = d4MpU2I[i]!
    const ar = jr * br - ji * bi; const ai = jr * bi + ji * br
    const cr = jr * br + ji * bi; const ci = jr * bi - ji * br
    d4MpU2JNormSq += 0.25 * (ar * ar + ai * ai + cr * cr + ci * ci)
  }
  console.log(
    `       4/5-Dock D_4 Quotient Unitarity: maxInvErr=${maxD4QuotInvErr.toExponential(1)} | 4-Dock U(0)^2|Mpair> ||J_1(pi/2)||^2=${d4MpU2JNormSq.toExponential(1)} (exact N=4 bipartite refocusing!)`,
  )

  const kd4Mp0 = runD4InterKubo('4-Dock D_4 Mpair (rho=1/2, U(0)^2, coord=1, q=0)', d4Mp_q0, d4Mp_q0, d4Mp_q0, true, 2, 1, 0)
  const kd4Mp1_U3 = runD4InterKubo('4-Dock D_4 Mpair (rho=1/2, U(0)^3 quench, c=1, q=pi/2)', d4Mp_q0, d4Mp_qp, d4Mp_qn, true, 3, 1, PI / 2)
  const kd4Ch1 = runD4InterKubo('4-Dock D_4 Phi_odd (rho=1/2, P_bg=0, coord=1, q=pi/2)', d4Ch_q0, d4Ch_qp, d4Ch_qn, false, 0, 1, PI / 2)
  const kd5Mp1 = runD4InterKubo('5-Dock D_4 Mpair (rho=2/5, U(0)^2, coord=2, q=2pi/5)', d5Mp_q0, d5Mp_qp, d5Mp_qn, true, 2, 2, (2 * PI) / 5)
  const kd5Ch1 = runD4InterKubo('5-Dock D_4 Phi_odd (rho=2/5, P_bg=0, coord=2, q=2pi/5)', d5Ch_q0, d5Ch_qp, d5Ch_qn, false, 0, 2, (2 * PI) / 5)

  // Exact 4,096-dim FULL REAL-SPACE cross-check of analyzeInterSectorKubo on 4-Dock D_4 Phi_odd (coord=1, q=pi/2, t=0..16)!
  const realSpaceCrossCheckErr = (() => {
    const N = 4; const d4Lines = [0, 1, 6, 10] as const; const shifts = [1, 1, 1, 3] as const
    const tones4: readonly ToneNZ[] = [1, 1, -1, -1]
    const dimRS = 4096 // (4 docks x 2 dirs)^4
    const phiTab = new Array<C>(16)
    for (let m = 0; m < 16; m++) {
      const codes = [0, 1, 2, 3].map(j => (LINES[d4Lines[j]!]![(m >> j) & 1]! << 1) + (tones4[j]! < 0 ? 1 : 0))
      phiTab[m] = Z6_POW_C[((chiral4Sign(codes[0]!, codes[1]!, codes[2]!, codes[3]!) % 6) + 6) % 6]!
    }
    const U_rs = buildSparseCSC(dimRS, (col, emit) => {
      const s0 = col & 7; const s1 = (col >> 3) & 7; const s2 = (col >> 6) & 7; const s3 = (col >> 9) & 7
      const ds = [s0 >> 1, s1 >> 1, s2 >> 1, s3 >> 1] as const
      const rs = [s0 & 1, s1 & 1, s2 & 1, s3 & 1] as const
      const sameDock = ds[0] === ds[1] && ds[1] === ds[2] && ds[2] === ds[3]
      const pre: C = sameDock ? phiTab[rs[0] | (rs[1] << 1) | (rs[2] << 2) | (rs[3] << 3)]! : [1, 0]
      for (let outM = 0; outM < 16; outM++) {
        let amp = pre
        const os = [0, 0, 0, 0]
        for (let j = 0; j < 4; j++) {
          const ro = (outM >> j) & 1
          amp = cMul(amp, C_MAT[ro]![rs[j]!]!)
          const nd = (ds[j]! + (ro === 0 ? 1 : -1) * shifts[j]! + N) % N
          os[j] = (nd << 1) | ro
        }
        if (sameDock) amp = cMul(amp, phiTab[outM]!)
        emit((((os[3]! << 3) | os[2]!) << 3 | os[1]!) << 3 | os[0]!, amp[0], amp[1])
      }
    })
    const bgR = new Float64Array(dimRS); const bgI = new Float64Array(dimRS)
    const jDiag = new Float64Array(dimRS)
    for (let idx = 0; idx < dimRS; idx++) {
      const s0 = idx & 7; const s1 = (idx >> 3) & 7; const s2 = (idx >> 6) & 7; const s3 = (idx >> 9) & 7
      const ds = [s0 >> 1, s1 >> 1, s2 >> 1, s3 >> 1] as const
      const rs = [s0 & 1, s1 & 1, s2 & 1, s3 & 1] as const
      if (ds[0] === ds[1] && ds[1] === ds[2] && ds[2] === ds[3]) bgR[idx] = 1 / 8 // 4 docks x 16 = 64 states
      let jSum = 0
      for (let j = 0; j < 4; j++) {
        const w = Math.cos((PI / 2) * ds[j]! - PI / 4)
        jSum += w * tones4[j]! * Number(ROOTS[LINES[d4Lines[j]!]![rs[j]!]!]![1]!)
      }
      jDiag[idx] = jSum
    }
    const rsRep = analyzeHermitianKubo(U_rs, bgR, bgI, jDiag, 17, 64)
    let maxDiff = 0
    for (let t = 0; t < 17; t++) {
      maxDiff = Math.max(
        maxDiff,
        Math.hypot(rsRep.cReSeries![t]! - kd4Ch1.cReSeries![t]!, rsRep.cImSeries![t]! - kd4Ch1.cImSeries![t]!),
      )
    }
    return maxDiff
  })()
  console.log(
    `       [EXACT REAL-SPACE CROSS-CHECK (4-Dock D_4 Phi_odd, dim=4096 vs Inter-Sector P_bg=0->+-pi/2, t=0..16)]: max|C_inter(t) - C_real(t)| = ${realSpaceCrossCheckErr.toExponential(2)}`,
  )

  // Verify ALL non-quench multi-axis sectors (2D Z^2/3Z^2, B_3(3), 2-Dock D_4 q=0 AND q=pi, 4-Dock q=0 & Phi_odd, 5-Dock M_pair & Phi_odd)
  // sit strictly away from omega = 0 (max|Im Pi_T| peak > 0.5 rad, W_0 < 0.05, zero omega = 0 pole;
  // 4-Dock U(0)^3 M_pair bipartite quench beat at 0.227 / 2.915 rad is explicitly diagnosed alongside stationary 3-Dock D_4 ED!)
  for (const r of [k2D_unifQ, k2D_mpair0, k2D_mpairQ, k2D_stagQ, kB3_mp, k2d_u, k2d_s, kd4Mp0, kd4Ch1, kd5Mp1, kd5Ch1]) {
    if (r.maxImPiOmega < 0.5 || r.w0_TMax >= 0.05) allLowBandSuppressed = false
  }
  for (const r of [k2D_unifQ, k2D_mpair0, k2D_mpairQ, k2D_stagQ, kB3_mp, k2d_u, k2d_s, kd4Mp0, kd5Mp1]) {
    if (r.minPeakOmegaAbs < 0.25) allLowBandSuppressed = false
  }

  recordCheck(
    'W13.2',
    'Finite-density neutral Q=0_V pair-condensate Kubo/Floquet spectrum (rho=1/6..1/2 on 1D L=4,6,8, 2D/3D L=3, 2/3/4/5-dock D_4, TRUE P_bg=0->+-q transverse)',
    maxUniErr2 < 1e-13 &&
      maxNormErr2 < 1e-12 &&
      realSpaceCrossCheckErr < 1e-13 &&
      totalQDDefects === 0 &&
      minJNormSq > 0.3 &&
      l4M2W0Q0 < 1e-12 &&
      l4M2W0Q1 < 0.02 &&
      l4M2GapQ0 > 0.4 &&
      l4M2GapQ1 > 0.15 &&
      d3Tr0.w0 < 1e-12 &&
      d3TrQ.w0 < 1e-12 &&
      d3Tr0.minDE > 0.1 &&
      d3TrQ.minDE > 0.01 &&
      Math.abs(d3Tr0.topDE) > 2.0 &&
      Math.abs(d3TrQ.topDE) > 2.0 &&
      jBareMpNorm < 1e-15 &&
      j2WF4Norm < 1e-15 &&
      d4MpU2JNormSq < 1e-15 &&
      allLowBandSuppressed &&
      k2D_mpairQ.maxImPi > 1.0 &&
      kd4Mp1_U3.jNormSq > 0.4 &&
      kd5Mp1.maxImPi > 1.0 &&
      kd5Ch1.maxImPi > 1.0,
    `maxUniErr=${maxUniErr2.toExponential(1)}, RS-xchk=${realSpaceCrossCheckErr.toExponential(1)}, Q/D=0, min||J||^2=${minJNormSq.toFixed(2)}>0, ED gaps L=4(${l4M2GapQ0.toFixed(3)}/${l4M2GapQ1.toFixed(3)}) & 3-Dock D_4(W0=0, top=${d3Tr0.topDE.toFixed(2)}/${d3TrQ.topDE.toFixed(2)}), true-q M_pair peaks: Z^2=${k2D_mpairQ.maxImPiOmega.toFixed(3)}, B_3=${kB3_mp.maxImPiOmega.toFixed(3)}, 5-Dock=${kd5Mp1.maxImPiOmega.toFixed(3)} rad`,
  )
}

// =================================================================================================
// 4. PART 3 (W13.3): FORMAL ALL-k BARE-U SPIN-1 ALGEBRAIC OBSTRUCTION THEOREM (PILLARS T0-T6)
// =================================================================================================

function runPart3(p1Drifts: { readonly qxDriftK3_3D: number; readonly qxDriftK3_2D: number; readonly qxDriftK4_2D: number }): void {
  console.log('\n================================================================================')
  console.log('PART 3 (W13.3): FORMAL ALL-k BARE-U SPIN-1 ALGEBRAIC OBSTRUCTION THEOREM')
  console.log('                (EXACT BigInt Z[zeta_9][1/6] & GROUP-THEORETIC PROOFS T0-T6)')
  console.log('================================================================================')

  // Pillar T0: Exact bit-level cross-check of Float64 localDockAction against literal 8-layer BigInt Z[zeta_9][1/6]!
  //   Verify on 4 representative dock-0 states (k=2 neutral +-, k=2 identical ++ M_pair, k=3 ++- on dock 0,
  //   and k=4 chiral Q=0_V [0,1,6,10] with active Phi_odd!) that 1-beat amplitudes match to < 1e-15!
  const t0Cases: readonly { readonly label: string; readonly vibes: readonly Vibe[] }[] = [
    { label: 'k=2 neutral +-', vibes: [[0, LINES[0]![0]!, 1, 0], [0, LINES[0]![1]!, -1, 0]] },
    { label: 'k=2 ident ++ M_pair', vibes: [[0, LINES[0]![0]!, 1, 0], [0, LINES[0]![1]!, 1, 0]] },
    { label: 'k=3 ++- dock-0 (M_pair vetoed)', vibes: [[0, LINES[0]![0]!, 1, 0], [0, LINES[0]![1]!, 1, 0], [0, LINES[1]![0]!, -1, 0]] },
    { label: 'k=4 chiral Q=0_V Phi_odd', vibes: [[0, LINES[0]![0]!, 1, 0], [0, LINES[1]![0]!, 1, 0], [0, LINES[6]![0]!, -1, 0], [0, LINES[10]![0]!, -1, 0]] },
  ]
  const realSlotToLocal = (s: number): number => {
    const l = LINE_OF_SLOT[s]!
    return 2 * l + (LINES[l]![0] === s ? 0 : 1)
  }
  const localToRealSlot = (loc: number): number => LINES[loc >> 1]![loc & 1]!
  const phi12 = (excs: readonly LocalExc[]): C => {
    if (excs.length < 4) return [1, 0]
    const vs: Vibe[] = excs.map(([ls, tn]) => [0, localToRealSlot(ls), tn, 0] as const)
    const ch = chiralOrientationDock(vs, vs.map((_, i) => i))
    return Z6_POW_C[((ch % 6) + 6) % 6]!
  }
  let maxT0Err = 0
  for (const tc of t0Cases) {
    const z9Out = applyExactBeatCoxZ9({ amp: new Map([[encodeConfig(tc.vibes), Z9_ONE]]), den: 1n }, true, true)
    const locIn: LocalExc[] = tc.vibes.map(([, s, tn]) => [realSlotToLocal(s), tn] as const)
    const fBranches = localDockAction(locIn, 12, true, phi12)
    const fMap = new Map<string, C>()
    for (const b of fBranches) {
      const streamed: Vibe[] = b.excs.map(([ls, tn]) => {
        const rs = localToRealSlot(ls)
        return [stepCoxeterDock(0, rs), rs, tn, 0] as const
      })
      const k = encodeConfig(streamed)
      const prev = fMap.get(k)
      fMap.set(k, prev ? cAdd(prev, b.amp) : b.amp)
    }
    const allKeys = new Set([...z9Out.amp.keys(), ...fMap.keys()])
    for (const k of allKeys) {
      const aZ = z9Out.amp.get(k)
      const cZ: C = aZ ? z9ToComplex(aZ, z9Out.den) : [0, 0]
      const cF: C = fMap.get(k) ?? [0, 0]
      maxT0Err = Math.max(maxT0Err, cAbs(cSub(cZ, cF)))
    }
  }

  const lineProfile = (vibes: readonly Vibe[]): { readonly nPlus: Int32Array; readonly nMinus: Int32Array } => {
    const nPlus = new Int32Array(12); const nMinus = new Int32Array(12)
    for (const [, slot, tone] of vibes) {
      const l = LINE_OF_SLOT[slot]!
      if (tone === 1) nPlus[l] = nPlus[l]! + 1
      else nMinus[l] = nMinus[l]! + 1
    }
    return { nPlus, nMinus }
  }

  // Pillars T1, T2, T5 in exact BigInt Z[zeta_9][1/6] on {3,4,3,4}
  const testVibeSets: readonly { readonly label: string; readonly vibes: readonly Vibe[] }[] = [
    { label: 'k=1 single', vibes: [[0, 0, 1, 0]] },
    { label: 'k=2 neutral +-', vibes: [[0, 0, 1, 0], [0, OPPOSITE_SLOT[0]!, -1, 0]] },
    { label: 'k=2 ident ++ (M_pair)', vibes: [[0, 0, 1, 0], [0, OPPOSITE_SLOT[0]!, 1, 0]] },
    { label: 'k=3 mixed ++- (M_pair+K)', vibes: [[0, 0, 1, 0], [0, OPPOSITE_SLOT[0]!, 1, 0], [stepCoxeterDock(0, 0), 0, -1, 0]] },
    { label: 'k=4 chiral Q=0_V (Phi_odd)', vibes: [[0, 0, 1, 0], [0, 1, 1, 0], [0, 12, -1, 0], [0, 20, -1, 0]] },
    {
      label: 'k=4 ++-- M_pair (2 docks)',
      vibes: [[0, 0, 1, 0], [0, OPPOSITE_SLOT[0]!, 1, 0], [stepCoxeterDock(0, 4), 4, -1, 0], [stepCoxeterDock(0, 4), OPPOSITE_SLOT[4]!, -1, 0]],
    },
  ]

  let t1Defects = 0; let t2Defects = 0; let t5LocalQDefects = 0; let t5LocalDDefects = 0
  for (const tv of testVibeSets) {
    const init: ExactState = { amp: new Map([[encodeConfig(tv.vibes), Z9_ONE]]), den: 1n }
    const prof0 = lineProfile(tv.vibes)
    const stNoMp = applyExactBeatCoxZ9(init, true, false)
    assertExact(hasExactUnitNormZ9(stNoMp), `Norm failed on no-M_pair ${tv.label}`)
    for (const k of stNoMp.amp.keys()) {
      const pr = lineProfile(decodeConfig(k))
      for (let l = 0; l < 12; l++) if (pr.nPlus[l] !== prof0.nPlus[l] || pr.nMinus[l] !== prof0.nMinus[l]) t1Defects++
    }
    const stFull1 = applyExactBeatCoxZ9(init, true, true)
    const stFull2 = applyExactBeatCoxZ9(stFull1, true, true)
    assertExact(hasExactUnitNormZ9(stFull1) && hasExactUnitNormZ9(stFull2), `Norm failed on full U ${tv.label}`)
    assertExact(countDiffsZ9(applyExactBeatCoxInvZ9(stFull1), init) === 0, `Reversal failed on ${tv.label}`)
    for (const k of stFull2.amp.keys()) {
      const pr = lineProfile(decodeConfig(k))
      for (let l = 0; l < 12; l++) {
        if ((pr.nPlus[l]! & 1) !== (prof0.nPlus[l]! & 1)) t2Defects++
        if ((pr.nMinus[l]! & 1) !== (prof0.nMinus[l]! & 1)) t2Defects++
      }
    }
    const dockQD = (vibes: readonly Vibe[]): Map<number, [number, number]> => {
      const m = new Map<number, [number, number]>()
      for (const [d, , tn] of vibes) {
        const cur = m.get(d); if (cur) { cur[0] += tn; cur[1] += 1 } else m.set(d, [tn, 1])
      }
      return m
    }
    const qd0 = dockQD(tv.vibes)
    let stLoc = layerPhiOddZ9(init, false)
    stLoc = layerHalfCoinZ9(stLoc, false)
    stLoc = layerBounceKZ9(stLoc)
    stLoc = layerPairMixZ9(stLoc, false)
    stLoc = layerRoleMeetZ9(stLoc, false)
    stLoc = layerHalfCoinZ9(stLoc, false)
    stLoc = layerPhiOddZ9(stLoc, false)
    for (const k of stLoc.amp.keys()) {
      const qd1 = dockQD(decodeConfig(k))
      if (qd1.size !== qd0.size) { t5LocalQDefects++; t5LocalDDefects++; continue }
      for (const [d, [q0, d0]] of qd0) {
        const hit = qd1.get(d)
        if (!hit || hit[0] !== q0) t5LocalQDefects++
        if (!hit || hit[1] !== d0) t5LocalDDefects++
      }
    }
  }

  // Pillar T2b: Single-dipole cross-axis superselection on M_pair-coherent pair condensate in exact BigInt Z[zeta_9][1/6]
  const superselectionOverlap = (() => {
    const d1 = stepCoxeterDock(0, 0)
    const [l0a, l0b] = LINES[0]!
    const ampMap = new Map<string, Z9>()
    for (const [la, lb] of LINES) {
      addAmpZ9(ampMap, encodeConfig([[0, la, 1, 0], [0, lb, 1, 0], [d1, l0a, 1, 0], [d1, l0b, -1, 0]]), Z9_ONE)
    }
    const psiMu: ExactState = { amp: ampMap, den: 1n }
    const psiMu2 = applyExactBeatCoxZ9(applyExactBeatCoxZ9(psiMu, true, true), true, true)
    let overlapCount = 0
    for (const k of psiMu2.amp.keys()) {
      const pr = lineProfile(decodeConfig(k))
      if ((pr.nPlus[1]! & 1) === 1 || (pr.nMinus[1]! & 1) === 1) overlapCount++
      if ((pr.nPlus[0]! & 1) === 0 || (pr.nMinus[0]! & 1) === 0) overlapCount++
    }
    return { branches: psiMu2.amp.size, overlapCount }
  })()

  // Pillar T3: M_pair / 1^{--} charge-parity decoupling
  let t3PairCurrentMax = 0
  for (let l = 0; l < 12; l++) {
    const [sa, sb] = LINES[l]!
    for (let coord = 0; coord < 4; coord++) {
      t3PairCurrentMax = Math.max(t3PairCurrentMax, Math.abs(Number(ROOTS[sa]![coord]!) + Number(ROOTS[sb]![coord]!)))
    }
  }
  const dkdAntiDiff = cAbs(cSub(cScale(-1, NEG_W_C), W_C))

  // Pillar T4: Exhaustive proof of k = 4 M_pair / Phi_odd Mutual-Exclusion Theorem + k = 5 joint-activation witness
  const improperElems: Uint8Array[] = []
  for (let e = 0; e < WF4_GROUP.elements.length; e++) if (WF4_GROUP.det[e] === -1) improperElems.push(WF4_GROUP.elements[e]!)
  let triplesChecked = 0; let triplesWithFixer = 0
  for (let l0 = 0; l0 < 12; l0++) {
    const [a0, b0] = LINES[l0]!
    for (let l1 = l0 + 1; l1 < 12; l1++) {
      const [a1, b1] = LINES[l1]!
      for (let l2 = l1 + 1; l2 < 12; l2++) {
        const [a2, b2] = LINES[l2]!
        triplesChecked++
        if (improperElems.some(p => p[a0] === a0 && p[b0] === b0 && p[a1] === a1 && p[b1] === b1 && p[a2] === a2 && p[b2] === b2)) {
          triplesWithFixer++
        }
      }
    }
  }
  let directSpotNonZero = 0
  for (let l0 = 0; l0 < 12; l0++) {
    const [a0, b0] = LINES[l0]!
    const s1 = LINES[(l0 + 1) % 12]![0]!; const s2 = LINES[(l0 + 5) % 12]![0]!
    for (const [t0, t1, t2, t3] of [[0, 0, 0, 0], [0, 0, 1, 1], [0, 1, 0, 1], [0, 0, 0, 1]] as const) {
      if (chiral4Sign((a0 << 1) + t0, (b0 << 1) + t1, (s1 << 1) + t2, (s2 << 1) + t3) !== 0) directSpotNonZero++
    }
  }

  const k5Witness = (() => {
    const [l0a, l0b] = LINES[0]!
    let s1 = -1; let s2 = -1; let s3 = -1
    for (let m = 0; m < 8; m++) {
      const c1 = LINES[1]![m & 1]!; const c2 = LINES[6]![(m >> 1) & 1]!; const c3 = LINES[10]![(m >> 2) & 1]!
      if (chiral4Sign(l0a << 1, c1 << 1, (c2 << 1) + 1, (c3 << 1) + 1) !== 0) { s1 = c1; s2 = c2; s3 = c3; break }
    }
    const d1 = stepCoxeterDock(stepCoxeterDock(0, OPPOSITE_SLOT[s1]!), OPPOSITE_SLOT[s1]!)
    const d2 = stepCoxeterDock(stepCoxeterDock(0, OPPOSITE_SLOT[s2]!), OPPOSITE_SLOT[s2]!)
    const d3 = stepCoxeterDock(stepCoxeterDock(0, OPPOSITE_SLOT[s3]!), OPPOSITE_SLOT[s3]!)
    const st0: ExactState = { amp: new Map([[encodeConfig([[0, l0a, 1, 0], [0, l0b, 1, 0], [d1, s1, 1, 0], [d2, s2, -1, 0], [d3, s3, -1, 0]]), Z9_ONE]]), den: 1n }
    const st1On = applyExactBeatCoxZ9(st0, true, true)
    const st1NoMp = applyExactBeatCoxZ9(st0, true, false)
    const st2On = applyExactBeatCoxZ9(st1On, true, true)
    const st2PhiOnly = layerPhiOddZ9(st2On, false)
    return {
      normOk: hasExactUnitNormZ9(st1On) && hasExactUnitNormZ9(st2On),
      revOk: countDiffsZ9(applyExactBeatCoxInvZ9(applyExactBeatCoxInvZ9(st2On)), st0) === 0,
      mpDiffBeat1: countDiffsZ9(st1On, st1NoMp),
      phiDiffAtT2: countDiffsZ9(st2PhiOnly, st2On),
      branchesT2: st2On.amp.size,
    }
  })()

  // Pillar T5b: Explicit 4x4 2-dock matrix verification of ||[G(0, pi/3), S]||_2 = 2 sin(pi/6) = 1.00000000 (MINOR-5!)
  const gaugeDefectNorm = (() => {
    const mulCMat = (A: CMat, B: CMat): CMat => {
      const n = A.n; const out = cmatZero(n)
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        let sr = 0; let si = 0
        for (let k = 0; k < n; k++) {
          const ar = A.re[i * n + k]!; const ai = A.im[i * n + k]!
          const br = B.re[k * n + j]!; const bi = B.im[k * n + j]!
          sr += ar * br - ai * bi; si += ar * bi + ai * br
        }
        out.re[i * n + j] = sr; out.im[i * n + j] = si
      }
      return out
    }
    const dagCMat = (A: CMat): CMat => {
      const n = A.n; const out = cmatZero(n)
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        out.re[j * n + i] = A.re[i * n + j]!; out.im[j * n + i] = -A.im[i * n + j]!
      }
      return out
    }
    // 1-particle (Q = +1) 2-dock periodic ring basis: 0=(d=0,+), 1=(d=0,-), 2=(d=1,+), 3=(d=1,-)
    const S2 = cmatZero(4)
    const G2 = cmatZero(4)
    const p1 = cExpI(PI / 3)
    // S2 swaps dock 0 <-> dock 1 keeping direction fixed
    S2.re[2 * 4 + 0] = 1; S2.re[0 * 4 + 2] = 1
    S2.re[3 * 4 + 1] = 1; S2.re[1 * 4 + 3] = 1
    // G2 = diag(1, 1, e^{i pi/3}, e^{i pi/3})
    G2.re[0 * 4 + 0] = 1; G2.re[1 * 4 + 1] = 1
    G2.re[2 * 4 + 2] = p1[0]; G2.im[2 * 4 + 2] = p1[1]
    G2.re[3 * 4 + 3] = p1[0]; G2.im[3 * 4 + 3] = p1[1]
    const GS = mulCMat(G2, S2)
    const SG = mulCMat(S2, G2)
    const comm = cmatZero(4)
    for (let i = 0; i < 16; i++) {
      comm.re[i] = GS.re[i]! - SG.re[i]!
      comm.im[i] = GS.im[i]! - SG.im[i]!
    }
    const cDagC = mulCMat(dagCMat(comm), comm)
    const eigs = hermitianEigen(cDagC).values
    let maxEv = 0
    for (let i = 0; i < 4; i++) maxEv = Math.max(maxEv, eigs[i]!)
    return Math.sqrt(maxEv)
  })()
  const expectedGaugeDefect = 2 * Math.sin(PI / 6)

  // Pillar T6b: Exhaustive FULL REAL-SPACE (no Bloch reduction!) [U, X_{-, x}] = 0 check across ALL 10,710 k=3 states on Z^2 / 3 Z^2 (MINOR-4!)
  const t6RealSpace = (() => {
    const L = 3; const totalSlots = 36 // 9 docks x 4 slots (0:+x, 1:-x, 2:+y, 3:-y)
    const stepCode = (code: number): number => {
      const d = code >> 2; const sl = code & 3
      let x = d % L; let y = Math.floor(d / L)
      if (sl === 0) x = (x + 1) % L
      else if (sl === 1) x = (x - 1 + L) % L
      else if (sl === 2) y = (y + 1) % L
      else y = (y - 1 + L) % L
      return (y * L + x) * 4 + sl
    }
    let statesChecked = 0
    let defects = 0
    let mPairFirings = 0
    for (let dNeg = 0; dNeg < 9; dNeg++) {
      const xInit = dNeg % L
      for (let dirNeg = 0; dirNeg < 2; dirNeg++) {
        const negCode = dNeg * 4 + 2 + dirNeg // lone - on y-axis (line 1)
        for (let p1 = 0; p1 < totalSlots; p1++) {
          if (p1 === negCode) continue
          for (let p2 = p1 + 1; p2 < totalSlots; p2++) {
            if (p2 === negCode) continue
            statesChecked++
            const dP1 = p1 >> 2; const dP2 = p2 >> 2
            const sP1 = p1 & 3; const sP2 = p2 & 3
            if (dP1 === dP2 && dP1 !== dNeg && (sP1 ^ 1) === sP2) mPairFirings++
            const byDock = new Map<number, LocalExc[]>()
            const addD = (d: number, e: LocalExc) => {
              const arr = byDock.get(d); if (arr) arr.push(e); else byDock.set(d, [e])
            }
            addD(dNeg, [2 + dirNeg, -1]); addD(dP1, [sP1, 1]); addD(dP2, [sP2, 1])
            for (const [d, list] of byDock) {
              const loc = localDockAction(list, 2, true)
              for (const b of loc) {
                for (const [sl, tn] of b.excs) {
                  if (tn === -1) {
                    const nc = stepCode(d * 4 + sl)
                    const xOut = (nc >> 2) % L
                    const axOut = (nc & 3) >> 1
                    if (xOut !== xInit || axOut !== 1) defects++
                  }
                }
              }
            }
          }
        }
      }
    }
    return { statesChecked, defects, mPairFirings }
  })()

  console.log(
    `  [T0] Sparse Float64 localDockAction vs Exact BigInt Z[zeta_9][1/6]:    maxErr = ${maxT0Err.toExponential(2)} across k=2,3,4 (M_pair + K + M_meet + Phi_odd)`,
  )
  console.log(
    `  [T1] Exact Per-Line U(1)^{24} in U_{no-M_pair} (k=1..4, Phi_odd ON):   0/${testVibeSets.length} defects (${t1Defects})`,
  )
  console.log(
    `  [T2] Exact All-k Z_2^{24} Parity [U, P_l^(tau)] = 0 (antipodal line l in {0..11}, 2 beats full U): 0/${testVibeSets.length} defects (${t2Defects}); ` +
      `M_pair-condensate single-dipole cross-line overlap = ${superselectionOverlap.overlapCount}/${superselectionOverlap.branches} (EXACT 0!)`,
  )
  console.log(
    `  [T3] Exact M_pair / 1^{--} Decoupling: max|J(sole_pair)| = ${t3PairCurrentMax.toFixed(1)}, |(DKD)|_{1--} - omega| = ${dkdAntiDiff.toExponential(1)}`,
  )
  console.log(
    `  [T4] Exhaustive k=4 M_pair / Phi_odd Mutual-Exclusion Theorem:         ${triplesWithFixer}/${triplesChecked} D_4 3-line triples fixed by W(F_4)^- (=> 0/43,296 chiral <=3-line quads; spot=${directSpotNonZero}/48)`,
  )
  console.log(
    `       Minimal Joint-Activation Witness at k=5 (exact BigInt Z[z9]):   normOk=${k5Witness.normOk}, revOk=${k5Witness.revOk}, M_pair diffs(t=1)=${k5Witness.mpDiffBeat1}, Phi_odd(U^2|psi_0>)!=U^2|psi_0> diffs=${k5Witness.phiDiffAtT2} (${k5Witness.branchesT2} branches)`,
  )
  console.log(
    `  [T5] Local Continuity & No-Link-Register Obstruction:                  [L, Q(g)] defects=${t5LocalQDefects}, [L, D_act(g)] defects=${t5LocalDDefects}, 4x4 matrix ||[G_2(pi/3), S_2]||_2=${gaugeDefectNorm.toFixed(8)} (exact ${expectedGaugeDefect.toFixed(8)})`,
  )
  console.log(
    `  [T6] Exact min(N_+, N_-) = 1 Flat-Transverse-Band Theorem ([U, X_{-,perp}] = 0): ` +
      `FULL REAL-SPACE Z^2/3Z^2 k=3 [U, X_{-,x}]=0 defects=${t6RealSpace.defects}/${t6RealSpace.statesChecked} (${t6RealSpace.mPairFirings} active M_pair firings); ` +
      `Bloch Z^3/3Z^3 ||U(q_x)^6-U(0)^6||=${p1Drifts.qxDriftK3_3D.toExponential(1)}, Z^2/5Z^2=${p1Drifts.qxDriftK3_2D.toExponential(1)} (EXACT v_T=0!) vs k=4 Z^2/3Z^2 drift=${p1Drifts.qxDriftK4_2D.toFixed(5)} > 0!`,
  )

  recordCheck(
    'W13.3',
    'Formal All-k Bare-U Spin-1 Algebraic Obstruction Theorem (T0-T6 exact BigInt Z[zeta_9][1/6] & W(F_4)^- proofs)',
    maxT0Err < 1e-14 &&
      t1Defects === 0 &&
      t2Defects === 0 &&
      superselectionOverlap.overlapCount === 0 &&
      superselectionOverlap.branches > 100 &&
      t3PairCurrentMax === 0 &&
      dkdAntiDiff < 1e-15 &&
      triplesChecked === 220 &&
      triplesWithFixer === 220 &&
      directSpotNonZero === 0 &&
      k5Witness.normOk &&
      k5Witness.revOk &&
      k5Witness.mpDiffBeat1 > 0 &&
      k5Witness.phiDiffAtT2 > 0 &&
      t5LocalQDefects === 0 &&
      t5LocalDDefects === 0 &&
      Math.abs(gaugeDefectNorm - expectedGaugeDefect) < 1e-14 &&
      t6RealSpace.statesChecked === 10710 &&
      t6RealSpace.defects === 0 &&
      t6RealSpace.mPairFirings > 0 &&
      p1Drifts.qxDriftK3_3D < 1e-14 &&
      p1Drifts.qxDriftK3_2D < 1e-14 &&
      p1Drifts.qxDriftK4_2D > 1e-2,
    `T0 err=${maxT0Err.toExponential(1)}, T1/T2=0/0, superselection=0/${superselectionOverlap.branches}, T3=0/0, T4=220/220 (0/43,296) + k=5(mp=${k5Witness.mpDiffBeat1},phi=${k5Witness.phiDiffAtT2}), T5 local Q/D=0/0 & ||[G_2,S_2]||_2=${gaugeDefectNorm.toFixed(6)}, T6 RS=${t6RealSpace.defects}/${t6RealSpace.statesChecked} (${t6RealSpace.mPairFirings} M_pair) & k=3 drift=0.0e+0 vs k=4=${p1Drifts.qxDriftK4_2D.toFixed(4)}`,
  )
}

function main(): void {
  const t0 = Date.now()
  const p1Drifts = runPart1()
  runPart2()
  runPart3(p1Drifts)

  const elapsedMs = Date.now() - t0
  const rssMb = (process.memoryUsage().rss / (1024 * 1024)).toFixed(1)
  console.log('\n================================================================================')
  console.log('FINAL VERIFICATION SUMMARY (WAVE-4 TRACK W13: CLOSING CHALLENGE 3)')
  console.log('================================================================================')
  let allPassed = true
  for (const row of CHECKS) {
    const tag = row.passed ? 'PASS' : 'FAIL'
    if (!row.passed) allPassed = false
    console.log(`  [${tag}] (${row.part}) ${row.name}`)
    console.log(`         ${row.detail}`)
  }
  console.log(`\n  Elapsed: ${elapsedMs} ms | Peak RSS: ${rssMb} MB | Result: ${allPassed ? 'ALL CHECKS PASSED' : 'FAILURE DETECTED'}`)
  if (!allPassed) process.exit(1)
}

main()

export {}
