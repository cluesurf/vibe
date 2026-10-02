// MOMENTUM BLOCKS OF THE FEW-HOLE REGISTER ENGINE, AND A UNITARY EIGENSOLVER FOR THEM (E-FND-0175). E-FND-0161's engine
// runs n holes of the register sea at one total crystal momentum, which the rule keeps (E-FND-0157). This module writes
// the cycle restricted to one such block as a dense matrix on the antisymmetric n-hole states, in the band basis, and
// diagonalizes it as a unitary: the quasi-energies sit on the circle, so a Hermitian solver is run on a rotated real
// part and the eigenvalues are read back on the circle, with residuals.
//
//   the basis      a one-hole mode is (momentum class j, band state beta): beta 0 .. f/2 - 1 are the positive-phase band's
//                  vectors at j and f/2 .. f - 1 the other band's (register-holes' bandVectors). An antisymmetric state is
//                  a sorted n-tuple of distinct modes whose classes sum to the block's total. Every read used here (the
//                  class, the band level, the band) is diagonal in this basis
//   the matrix     column b is the engine's cycle applied to b's Slater determinant, rotated into the band basis and read at
//                  every sorted tuple a: U_ab = sqrt(n!) psi(a). The weight a column leaves outside the antisymmetric
//                  states is returned (0 for a cycle that keeps fermions)
//   the solver     the matrix is split into the components of its entries above a tolerance (the free cycle is diagonal in
//                  the band basis, so its components are single states). On each component, K = (e^(-i t0) U + e^(i t0)
//                  U^dag) / 2 is Hermitian and commutes with U, with eigenvalue cos(theta - t0); t0 is a Weyl angle, so
//                  only theta and 2 t0 - theta can meet. A cluster of K-values within a tolerance is rediagonalized with a
//                  second angle t1. Then each vector's quasi-energy is read as arg <v|U|v>, and the residual |U v - e^(i
//                  theta) v| is measured on a stride of vectors against the full matrix
//   degeneracy     inside a cluster of equal quasi-energies the eigenbasis is not fixed; it is chosen to diagonalize a given
//                  diagonal read (a Weyl combination of the reads), the standard choice, applied identically to every run
//
// Measurement only (floats), on exact pieces. No random numbers: every spread value is a Weyl value (code/tool/weyl).

import { hermitianEigenRows } from '@/code/algebra/linear/eig-hermitian-householder'
import {
  bandVectors,
  holeCycle,
  slaterStart,
  type HoleEngine,
  type HoleRule,
  type Holes,
  type Vec,
} from '@/code/measure/register-holes'

export type BlockBasis = {
  n: number
  total: number
  // modes a class
  f: number
  N: number
  D: number
  // the sorted mode tuples, [a * n + i]
  modes: Int32Array
  // the flat engine index (tuple * f^n + fiber digits) of each state's identity-ordered entry
  pos: Int32Array
}

// the antisymmetric n-hole states at the engine's total momentum, in the band basis
export function blockBasis(e: HoleEngine): BlockBasis {
  const F = e.frame.fourier
  const N = F.N
  const f = e.frame.fiber
  const n = e.n
  const M = N * f
  const out: number[] = []
  const pos: number[] = []
  const block = f ** n
  const tup = new Int32Array(n)
  const rec = (i: number, from: number, acc: number): void => {
    if (i === n) {
      if (acc !== e.total) {
        return
      }

      let T = 0
      let fb = 0

      for (let k = 0; k < n; k++) {
        if (k < n - 1) {
          T = T * N + Math.floor(tup[k]! / f)
        }

        fb = fb * f + (tup[k]! % f)
      }

      out.push(...tup)
      pos.push(T * block + fb)

      return
    }

    for (let m = from; m < M; m++) {
      tup[i] = m
      rec(i + 1, m + 1, F.sum[acc * N + Math.floor(m / f)]!)
    }
  }

  rec(0, 0, 0)

  return {
    n,
    total: e.total,
    f,
    N,
    D: pos.length,
    modes: Int32Array.from(out),
    pos: Int32Array.from(pos),
  }
}

// each class's band vectors as the columns of an f x f matrix: [j][beta] -> Vec
export function bandFrames(e: HoleEngine): Vec[][] {
  const out: Vec[][] = []

  for (let j = 0; j < e.frame.fourier.N; j++) {
    const b = bandVectors(e.frame, j)

    out.push([...b.up, ...b.down])
  }

  return out
}

// rotate every member's fiber index into the band basis, in place: x'_beta = <v_beta(j_i)|x>
function toBand(e: HoleEngine, V: Vec[][], s: Holes): void {
  const f = e.frame.fiber
  const n = s.n
  const block = f ** n
  const tuples = s.re.length / block
  const xr = new Float64Array(f)
  const xi = new Float64Array(f)

  for (let T = 0; T < tuples; T++) {
    const off = T * block

    for (let i = 0; i < n; i++) {
      const Vj = V[e.mom[T * n + i]!]!
      const st = f ** (n - 1 - i)
      const outer = f ** i

      for (let hi = 0; hi < outer; hi++) {
        for (let lo = 0; lo < st; lo++) {
          const base = off + hi * f * st + lo

          for (let k = 0; k < f; k++) {
            xr[k] = s.re[base + k * st]!
            xi[k] = s.im[base + k * st]!
          }

          for (let beta = 0; beta < f; beta++) {
            const v = Vj[beta]!

            let yr = 0
            let yi = 0

            for (let k = 0; k < f; k++) {
              // conj(v_k) x_k
              yr += v.re[k]! * xr[k]! + v.im[k]! * xi[k]!
              yi += v.re[k]! * xi[k]! - v.im[k]! * xr[k]!
            }

            s.re[base + beta * st] = yr
            s.im[base + beta * st] = yi
          }
        }
      }
    }
  }
}

export type BlockMatrix = {
  D: number
  re: Float64Array
  im: Float64Array
  // the largest weight a column leaves outside the antisymmetric states, and the largest |column norm - 1|
  leak: number
}

// the cycle on one momentum block, column by column through the engine
export function blockMatrix(
  e: HoleEngine,
  B: BlockBasis,
  V: Vec[][],
  rule: HoleRule,
): BlockMatrix {
  const D = B.D
  const n = B.n
  const f = B.f
  const re = new Float64Array(D * D)
  const im = new Float64Array(D * D)

  let fact = 1

  for (let i = 2; i <= n; i++) {
    fact *= i
  }

  const root = Math.sqrt(fact)

  let leak = 0

  for (let b = 0; b < D; b++) {
    const js: number[] = []
    const vs: Vec[] = []

    for (let i = 0; i < n; i++) {
      const m = B.modes[b * n + i]!

      js.push(Math.floor(m / f))
      vs.push(V[Math.floor(m / f)]![m % f]!)
    }

    const s = slaterStart(e, js, vs)

    holeCycle(e, rule, s)
    toBand(e, V, s)

    let kept = 0

    for (let a = 0; a < D; a++) {
      const p = B.pos[a]!
      const xr = root * s.re[p]!
      const xi = root * s.im[p]!

      re[a * D + b] = xr
      im[a * D + b] = xi
      kept += xr * xr + xi * xi
    }

    leak = Math.max(leak, Math.abs(1 - kept))
  }

  return { D, re, im, leak }
}

export type UnitaryEigen = {
  D: number
  // quasi-energies theta in (-pi, pi], one per vector
  theta: Float64Array
  // the vectors as rows, [alpha * D + a]
  vr: Float64Array
  vi: Float64Array
  // the component sizes, the largest residual |U v - e^(i theta) v| and |<v_a|v_b> - delta| on the sampled vectors, how
  // many were sampled, and the K and quasi-energy clusters met
  components: number[]
  residual: number
  // over every vector, the largest spread of its eigenvalue read on its eight largest entries (a residual for all)
  localSpread: number
  orthogonality: number
  sampled: number
  kClusters: number
  degenerateClusters: number
  largestDegenerate: number
}

export type UnitaryOptions = {
  // the angles of the two Hermitian combinations
  t0: number
  t1: number
  // entries at or below this are not links when splitting into components
  linkTolerance: number
  // K-values this close are rediagonalized with t1
  kTolerance: number
  // quasi-energies this close are one degenerate cluster
  thetaTolerance: number
  // the residual is measured on every stride-th vector
  stride: number
  // the diagonal read whose eigenbasis is chosen inside a degenerate cluster (length D)
  read: Float64Array
}

const TOP = 8
// the solver runs on K + SHIFT (K has norm at most 1): its QL test is relative, and eigenvalues near 0 stall it
const SHIFT = 3

const wrap = (x: number): number => {
  let y = x % (2 * Math.PI)

  if (y > Math.PI) {
    y -= 2 * Math.PI
  }

  if (y <= -Math.PI) {
    y += 2 * Math.PI
  }

  return y
}

// rows of X (k rows of length D) times a k x k matrix Z (column c is a new row): new row c = sum_r Z[r][c] X[r]
function rotateRows(
  X: { re: Float64Array; im: Float64Array },
  rows: readonly number[],
  D: number,
  Zr: Float64Array,
  Zi: Float64Array,
  support: readonly number[],
): void {
  const k = rows.length
  const or = new Float64Array(k * support.length)
  const oi = new Float64Array(k * support.length)

  for (let c = 0; c < k; c++) {
    for (let r = 0; r < k; r++) {
      const zr = Zr[r * k + c]!
      const zi = Zi[r * k + c]!

      if (zr === 0 && zi === 0) {
        continue
      }

      const o = rows[r]! * D

      support.forEach((a, s) => {
        const xr = X.re[o + a]!
        const xi = X.im[o + a]!

        or[c * support.length + s]! += zr * xr - zi * xi
        oi[c * support.length + s]! += zr * xi + zi * xr
      })
    }
  }

  for (let c = 0; c < k; c++) {
    const o = rows[c]! * D

    support.forEach((a, s) => {
      X.re[o + a] = or[c * support.length + s]!
      X.im[o + a] = oi[c * support.length + s]!
    })
  }
}

// the eigenvalue of a vector read on its m largest entries, lambda = sum conj(v_a) (U v)_a / sum |v_a|^2 over those a
// (exact for an exact eigenvector, at m D cost instead of D^2), and the largest |(U v)_a / v_a - lambda| among them
function topRayleigh(
  U: BlockMatrix,
  X: { re: Float64Array; im: Float64Array },
  row: number,
  support: readonly number[],
  m: number,
): { re: number; im: number; spread: number } {
  const D = U.D
  const o = row * D
  const top = [...support]
    .sort((a, b) => X.re[o + b]! ** 2 + X.im[o + b]! ** 2 - (X.re[o + a]! ** 2 + X.im[o + a]! ** 2))
    .slice(0, m)
  const ys: [number, number, number, number][] = []

  let sr = 0
  let si = 0
  let w = 0

  for (const a of top) {
    let yr = 0
    let yi = 0

    for (const b of support) {
      const ur = U.re[a * D + b]!
      const ui = U.im[a * D + b]!
      const xr = X.re[o + b]!
      const xi = X.im[o + b]!

      yr += ur * xr - ui * xi
      yi += ur * xi + ui * xr
    }

    const vr = X.re[o + a]!
    const vi = X.im[o + a]!

    ys.push([yr, yi, vr, vi])
    sr += vr * yr + vi * yi
    si += vr * yi - vi * yr
    w += vr * vr + vi * vi
  }

  const lr = sr / w
  const li = si / w

  let spread = 0

  for (const [yr, yi, vr, vi] of ys) {
    const n2 = vr * vr + vi * vi

    if (n2 * D < 1e-6) {
      continue
    }

    // y / v = y conj(v) / |v|^2
    spread = Math.max(
      spread,
      Math.hypot((yr * vr + yi * vi) / n2 - lr, (yi * vr - yr * vi) / n2 - li),
    )
  }

  return { re: lr, im: li, spread }
}

// the k x k Hermitian (e^(-i t) C + e^(i t) C^dag) / 2 with C = V^dag U V over the given rows, or V^dag diag(read) V
function smallHermitian(
  U: BlockMatrix,
  X: { re: Float64Array; im: Float64Array },
  rows: readonly number[],
  support: readonly number[],
  t: number,
  read: Float64Array | null,
): { re: Float64Array; im: Float64Array } {
  const D = U.D
  const k = rows.length
  const Cr = new Float64Array(k * k)
  const Ci = new Float64Array(k * k)
  // W = U V (or read V) on the support, per row
  const Wr = new Float64Array(k * support.length)
  const Wi = new Float64Array(k * support.length)

  rows.forEach((row, c) => {
    const o = row * D

    support.forEach((a, s) => {
      if (read) {
        Wr[c * support.length + s] = read[a]! * X.re[o + a]!
        Wi[c * support.length + s] = read[a]! * X.im[o + a]!
        return
      }

      let yr = 0
      let yi = 0

      for (const b of support) {
        const ur = U.re[a * D + b]!
        const ui = U.im[a * D + b]!

        yr += ur * X.re[o + b]! - ui * X.im[o + b]!
        yi += ur * X.im[o + b]! + ui * X.re[o + b]!
      }

      Wr[c * support.length + s] = yr
      Wi[c * support.length + s] = yi
    })
  })

  rows.forEach((row, r) => {
    const o = row * D

    for (let c = 0; c < k; c++) {
      let sr = 0
      let si = 0

      support.forEach((a, s) => {
        const xr = X.re[o + a]!
        const xi = -X.im[o + a]!
        const yr = Wr[c * support.length + s]!
        const yi = Wi[c * support.length + s]!

        sr += xr * yr - xi * yi
        si += xr * yi + xi * yr
      })

      Cr[r * k + c] = sr
      Ci[r * k + c] = si
    }
  })

  if (read) {
    // symmetrize
    const Hr = new Float64Array(k * k)
    const Hi = new Float64Array(k * k)

    for (let r = 0; r < k; r++) {
      for (let c = 0; c < k; c++) {
        Hr[r * k + c] = (Cr[r * k + c]! + Cr[c * k + r]!) / 2
        Hi[r * k + c] = (Ci[r * k + c]! - Ci[c * k + r]!) / 2
      }
    }

    return { re: Hr, im: Hi }
  }

  const cr = Math.cos(t)
  const sn = Math.sin(t)
  const Hr = new Float64Array(k * k)
  const Hi = new Float64Array(k * k)

  for (let r = 0; r < k; r++) {
    for (let c = 0; c < k; c++) {
      // e^(-i t) C_rc + e^(i t) conj(C_cr)
      const ar = cr * Cr[r * k + c]! + sn * Ci[r * k + c]!
      const ai = cr * Ci[r * k + c]! - sn * Cr[r * k + c]!
      const br = cr * Cr[c * k + r]! + sn * Ci[c * k + r]!
      const bi = -(cr * Ci[c * k + r]! - sn * Cr[c * k + r]!)

      Hr[r * k + c] = (ar + br) / 2
      Hi[r * k + c] = (ai + bi) / 2
    }
  }

  return { re: Hr, im: Hi }
}

// eigenvectors of a small Hermitian as a column matrix Z ([r * k + c] is entry r of vector c)
function smallEigenColumns(k: number, H: { re: Float64Array; im: Float64Array }): {
  Zr: Float64Array
  Zi: Float64Array
} {
  const eig = hermitianEigenRows(k, H.re, H.im, SHIFT)
  const Zr = new Float64Array(k * k)
  const Zi = new Float64Array(k * k)

  for (let c = 0; c < k; c++) {
    for (let r = 0; r < k; r++) {
      Zr[r * k + c] = eig.vectorsRe[c * k + r]!
      Zi[r * k + c] = eig.vectorsIm[c * k + r]!
    }
  }

  return { Zr, Zi }
}

export function unitaryEigen(U: BlockMatrix, opt: UnitaryOptions): UnitaryEigen {
  const D = U.D
  // components by union-find on |U_ab| > linkTolerance (either direction)
  const parent = Int32Array.from({ length: D }, (_, i) => i)
  const find = (x: number): number => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]!]!
      x = parent[x]!
    }

    return x
  }
  const tol2 = opt.linkTolerance ** 2

  for (let a = 0; a < D; a++) {
    for (let b = 0; b < D; b++) {
      if (a !== b && U.re[a * D + b]! ** 2 + U.im[a * D + b]! ** 2 > tol2) {
        const ra = find(a)
        const rb = find(b)

        if (ra !== rb) {
          parent[ra] = rb
        }
      }
    }
  }

  const groups = new Map<number, number[]>()

  for (let a = 0; a < D; a++) {
    const r = find(a)
    const g = groups.get(r)

    if (g) {
      g.push(a)
    } else {
      groups.set(r, [a])
    }
  }

  const X = { re: new Float64Array(D * D), im: new Float64Array(D * D) }
  const theta = new Float64Array(D)
  const supportOf: number[][] = new Array<number[]>(D)
  const components: number[] = []
  const c0 = Math.cos(opt.t0)
  const s0 = Math.sin(opt.t0)

  let row = 0
  let kClusters = 0
  let localSpread = 0

  for (const sup of groups.values()) {
    const k = sup.length

    components.push(k)

    const Kr = new Float64Array(k * k)
    const Ki = new Float64Array(k * k)

    for (let r = 0; r < k; r++) {
      for (let c = 0; c < k; c++) {
        const a = sup[r]!
        const b = sup[c]!
        const ar = c0 * U.re[a * D + b]! + s0 * U.im[a * D + b]!
        const ai = c0 * U.im[a * D + b]! - s0 * U.re[a * D + b]!
        const br = c0 * U.re[b * D + a]! + s0 * U.im[b * D + a]!
        const bi = -(c0 * U.im[b * D + a]! - s0 * U.re[b * D + a]!)

        Kr[r * k + c] = (ar + br) / 2
        Ki[r * k + c] = (ai + bi) / 2
      }
    }

    const eig = hermitianEigenRows(k, Kr, Ki, SHIFT)
    const rows: number[] = []

    for (let c = 0; c < k; c++) {
      const o = (row + c) * D

      for (let r = 0; r < k; r++) {
        X.re[o + sup[r]!] = eig.vectorsRe[c * k + r]!
        X.im[o + sup[r]!] = eig.vectorsIm[c * k + r]!
      }

      supportOf[row + c] = sup
      rows.push(row + c)
    }

    // K clusters: theta and 2 t0 - theta meet in K; split them with t1
    let start = 0

    for (let c = 1; c <= k; c++) {
      if (c === k || eig.values[c]! - eig.values[c - 1]! > opt.kTolerance) {
        if (c - start > 1) {
          kClusters++

          const cl = rows.slice(start, c)
          const H = smallHermitian(U, X, cl, sup, opt.t1, null)
          const Z = smallEigenColumns(cl.length, H)

          rotateRows(X, cl, D, Z.Zr, Z.Zi, sup)
        }

        start = c
      }
    }

    for (const r of rows) {
      const l = topRayleigh(U, X, r, sup, TOP)

      theta[r] = Math.atan2(l.im, l.re)
      localSpread = Math.max(localSpread, l.spread)
    }

    row += k
  }

  // degenerate quasi-energy clusters, per component: the eigenbasis that diagonalizes the read
  const order = Array.from({ length: D }, (_, i) => i).sort((a, b) => theta[a]! - theta[b]!)

  let degenerateClusters = 0
  let largestDegenerate = 1
  let s = 0

  for (let c = 1; c <= D; c++) {
    const close =
      c < D &&
      theta[order[c]!]! - theta[order[c - 1]!]! <= opt.thetaTolerance
    if (close) {
      continue
    }

    if (c - s > 1) {
      // split by component support
      const bySup = new Map<number[], number[]>()

      for (let i = s; i < c; i++) {
        const r = order[i]!
        const g = bySup.get(supportOf[r]!)

        if (g) {
          g.push(r)
        } else {
          bySup.set(supportOf[r]!, [r])
        }
      }

      for (const [sup, cl] of bySup) {
        if (cl.length < 2) {
          continue
        }

        degenerateClusters++
        largestDegenerate = Math.max(largestDegenerate, cl.length)

        const H = smallHermitian(U, X, cl, sup, 0, opt.read)
        const Z = smallEigenColumns(cl.length, H)

        rotateRows(X, cl, D, Z.Zr, Z.Zi, sup)

        // a rotation inside a cluster of one quasi-energy keeps it: the cluster's mean is kept
        const mt = cl.reduce((a, r) => a + theta[r]!, 0) / cl.length

        for (const r of cl) {
          theta[r] = mt
        }
      }
    }

    s = c
  }

  // residuals and orthogonality on every stride-th vector, against the full matrix
  const sample: number[] = []

  for (let r = 0; r < D; r += opt.stride) {
    sample.push(r)
  }

  let residual = 0
  let orthogonality = 0

  for (const r of sample) {
    const o = r * D
    const lr = Math.cos(theta[r]!)
    const li = Math.sin(theta[r]!)

    let w = 0

    for (let a = 0; a < D; a++) {
      let yr = -(lr * X.re[o + a]! - li * X.im[o + a]!)
      let yi = -(lr * X.im[o + a]! + li * X.re[o + a]!)
      const ro = a * D

      for (let b = 0; b < D; b++) {
        const ur = U.re[ro + b]!
        const ui = U.im[ro + b]!

        if (ur === 0 && ui === 0) {
          continue
        }

        yr += ur * X.re[o + b]! - ui * X.im[o + b]!
        yi += ur * X.im[o + b]! + ui * X.re[o + b]!
      }

      w += yr * yr + yi * yi
    }

    residual = Math.max(residual, Math.sqrt(w))

    for (const q of sample) {
      const p = q * D

      let cr = 0
      let ci = 0

      for (let a = 0; a < D; a++) {
        cr += X.re[o + a]! * X.re[p + a]! + X.im[o + a]! * X.im[p + a]!
        ci += X.re[o + a]! * X.im[p + a]! - X.im[o + a]! * X.re[p + a]!
      }

      orthogonality = Math.max(orthogonality, Math.hypot(cr - (r === q ? 1 : 0), ci))
    }
  }

  return {
    D,
    theta: theta.map(wrap),
    vr: X.re,
    vi: X.im,
    components,
    residual,
    orthogonality,
    localSpread,
    sampled: sample.length,
    kClusters,
    degenerateClusters,
    largestDegenerate,
  }
}

// <v_alpha| diag(read) |v_alpha> for every vector
export function diagonalReads(E: UnitaryEigen, read: Float64Array): Float64Array {
  const D = E.D
  const out = new Float64Array(D)

  for (let r = 0; r < D; r++) {
    const o = r * D

    let x = 0

    for (let a = 0; a < D; a++) {
      const w = E.vr[o + a]! ** 2 + E.vi[o + a]! ** 2

      if (w !== 0) {
        x += w * read[a]!
      }
    }

    out[r] = x
  }

  return out
}

export type Scatter = {
  // the pooled rms of each window's residuals from its least-squares line in delta, over windows holding at least
  // `least` states, and the states those windows hold
  windowed: number
  covered: number
  windows: number
  // the rms difference of neighbours in delta order, over sqrt 2
  neighbour: number
  // the read's own rms spread over all states
  total: number
}

// the eigenstate-to-eigenstate scatter of a read against delta, in fixed windows of width w
export function scatter(delta: Float64Array, x: Float64Array, w: number, least: number): Scatter {
  const D = delta.length
  const order = Array.from({ length: D }, (_, i) => i).sort((a, b) => delta[a]! - delta[b]! || a - b)
  const bins = new Map<number, number[]>()

  for (const i of order) {
    const k = Math.floor(delta[i]! / w)
    const g = bins.get(k)

    if (g) {
      g.push(i)
    } else {
      bins.set(k, [i])
    }
  }

  let ss = 0
  let covered = 0
  let windows = 0

  for (const g of bins.values()) {
    if (g.length < least) {
      continue
    }

    windows++

    const m = g.length
    const md = g.reduce((s, i) => s + delta[i]!, 0) / m
    const mx = g.reduce((s, i) => s + x[i]!, 0) / m

    let sxx = 0
    let sxy = 0

    for (const i of g) {
      sxx += (delta[i]! - md) ** 2
      sxy += (delta[i]! - md) * (x[i]! - mx)
    }

    // a window whose deltas all agree (to 1e-12 of its width) fits its mean
    const slope = sxx > (1e-12 * w) ** 2 * m ? sxy / sxx : 0

    for (const i of g) {
      ss += (x[i]! - mx - slope * (delta[i]! - md)) ** 2
    }

    covered += m
  }

  let nb = 0

  for (let k = 1; k < D; k++) {
    nb += (x[order[k]!]! - x[order[k - 1]!]!) ** 2
  }

  const mean = x.reduce((s, y) => s + y, 0) / D
  const total = Math.sqrt(x.reduce((s, y) => s + (y - mean) ** 2, 0) / D)

  return {
    windowed: covered > 0 ? Math.sqrt(ss / covered) : 0,
    covered,
    windows,
    neighbour: D > 1 ? Math.sqrt(nb / (D - 1) / 2) : 0,
    total,
  }
}
