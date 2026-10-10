// THE SLAB LEAK AS A TWO-PATH EVANESCENT SUM (E-SPN-0198, moving-matter item 0050, key 2 of research/mass-inputs.md).
// E-FRC-0267's chiral slab is periodic in the depth x3, so wall A (the plain/Wilson boundary at class 0) and wall B (the
// Wilson/plain boundary at class nW) are joined through BOTH domains: nW Wilson classes one way, nP plain classes the
// other. Each domain is a bulk gapped at quasienergy pi, so a state at pi decays into it as z^c with |z| < 1, and the leak
// delta is the sum of the two paths' overlaps. This module holds the pieces:
//
//   asymmetricSlab   chiralSlab's slab with profile[c] = c < nW ? 1 : 0 on L = nW + nP classes (1 the Wilson set, 0
//                    the plain), the wall-A window centred on the boundary at nW
//   leakDelta        delta of that slab by wall-g-factor's pairLevels on the dense slabOps path (half +, K = 0)
//   bulkBlocks       the K = 0 one-cycle operator of a periodic chain of one set, as 96 x 96 class blocks U_m (m = -2 .. 2,
//                    U_m maps class m to class 0), read by slabApply on unit vectors of an 8-class chain; the symbol is
//                    U(z) = sum_m U_m z^m on psi_c = z^c phi (the rule's own apply, no hand-built hop)
//   symbolAt         U(z)
//   symbolSpectrum   S1: the union of U(e^(2 pi i m / P)) spectra against the periodic P-class chain's (slabReduced, the
//                    flat states at 1 added), matched in order around the largest gap
//   piRoots          the roots of det(U(z) + 1) = 0 (quasienergy pi): Q(z) = z^2 (U(z) + 1) = sum_k A_k z^k (degree 4),
//                    shifted to w = z - sigma and inverted, mu = 1 / w, so the leading coefficient Q(sigma) is invertible
//                    and the block companion of the monic mu-polynomial is a plain 384 x 384 eigenproblem
//                    (complexEigenvalues); mu = 0 is a root at infinity. Every root with 0.01 < |z| < 100 is witnessed by
//                    the least singular value of U(z) + 1
//   leadingPath      a domain's leading roots (every root at the largest |z| < 1) as real columns e^(-kappa n) x {1,
//                    (-1)^n, cos q n and sin q n}
//   fitPaths         delta = |sum over both paths of their columns times fitted coefficients|, the coefficients (A and phi
//                    per q) the only fitted numbers, by Levenberg-Marquardt on log delta from a fixed grid of starts
//
// DETERMINISM: no random numbers; the fit's starts are a fixed grid. Floats as measurement on the rule's exact pieces.

import { complexEigenvalues } from '@/code/algebra/linear/complex-eigen'
import { makeComplexMatrix } from '@/code/algebra/linear/dense'
import { eigHermitian } from '@/code/algebra/linear/eig-hermitian'
import { DOCK_ROOTS, wrap } from '@/code/measure/dock-mixer'
import {
  denseSolve,
  largestGapMidpoint,
  slabApply,
  slabReduced,
  slabStream,
  unitaryEigen,
  type CVec,
  type Dense,
  type HalfSet,
  type Slab,
} from '@/code/measure/wilson-register'
import { chiralSlab, type ChiralSlab } from '@/code/measure/anomaly-matching-walls'
import { pairLevels, slabOps, wallSpec } from '@/code/measure/wall-g-factor'

const HALF_MODES = 96
const SPAN = 2
const DEGREE = 2 * SPAN

type C = [number, number]
const cm = (a: C, b: C): C => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]
const cinv = (a: C): C => {
  const d = a[0] * a[0] + a[1] * a[1]

  return [a[0] / d, -a[1] / d]
}
const cabs = (a: C): number => Math.hypot(a[0], a[1])
const cpow = (a: C, n: number): C => {
  let r: C = [1, 0]

  for (let k = 0; k < Math.abs(n); k++) {
    r = cm(r, a)
  }

  return n < 0 ? cinv(r) : r
}

// ---- the asymmetric slab ----

export function asymmetricSlab(nW: number, nP: number): ChiralSlab {
  const L = nW + nP
  const cs = chiralSlab(L)
  const slab: Slab = { ...cs.slab, L, profile: Array.from({ length: L }, (_, c) => (c < nW ? 1 : 0)) }
  // E-FRC-0267's six-class wall-A window, centred on the Wilson/plain boundary at nW
  const aDepths = new Set([-3, -2, -1, 0, 1, 2].map(x => (((nW + x) % L) + L) % L))

  return { ...cs, slab, aDepths }
}

export type LeakRead = {
  nW: number
  nP: number
  delta: number
  // the number of in-gap levels (|E| < 0.1) and the bulk gap Lambda pairLevels reads
  inGap: number
  Lambda: number
  // slabReduced's invariance leak |(1 - B B^dag) U B|
  leak: number
}

export function leakDelta(nW: number, nP: number): LeakRead {
  const { ops, leak } = slabOps(wallSpec(asymmetricSlab(nW, nP), 0))
  const p = pairLevels(ops)

  return { nW, nP, delta: p.delta, inGap: p.inGap.length, Lambda: p.Lambda, leak }
}

// ---- the bulk symbol ----

export type BulkBlocks = {
  // blocks[m + 2] = U_m, row-major 96 x 96, U_m maps class m to class 0
  blocks: Dense[]
  // the largest output reaching a class more than 2 away (the band's witness: 0)
  outside: number
}

const chain = (L: number): Slab => ({ L, qa: 1, p: 0, profile: Array.from({ length: L }, () => 0) })

export function bulkBlocks(set: HalfSet, L = 8): BulkBlocks {
  const s = chain(L)
  const sets = [set]
  const st = slabStream(s, [0, 0, 0, 0], DOCK_ROOTS)
  const N = L * HALF_MODES
  const n = HALF_MODES
  const blocks = Array.from({ length: DEGREE + 1 }, () => ({
    re: new Float64Array(n * n),
    im: new Float64Array(n * n),
  }))

  let outside = 0

  for (let j = 0; j < n; j++) {
    // input on class 0, mode j: output at class -m (mod L) is column j of U_m by translation (block from m to 0 equals the
    // block from 0 to -m)
    const v: CVec = { re: new Float64Array(N), im: new Float64Array(N) }

    v.re[j] = 1

    const y = slabApply(s, sets, st, v)

    for (let c = 0; c < L; c++) {
      const off = c > L / 2 ? c - L : c
      const m = -off

      for (let i = 0; i < n; i++) {
        const yr = y.re[c * n + i]!
        const yi = y.im[c * n + i]!

        if (Math.abs(m) > SPAN) {
          outside = Math.max(outside, Math.hypot(yr, yi))
          continue
        }

        blocks[m + SPAN]!.re[i * n + j] = yr
        blocks[m + SPAN]!.im[i * n + j] = yi
      }
    }
  }

  return { blocks, outside }
}

export function symbolAt(b: BulkBlocks, z: C): Dense {
  const n = HALF_MODES
  const out = { re: new Float64Array(n * n), im: new Float64Array(n * n) }

  for (let m = -SPAN; m <= SPAN; m++) {
    const w = cpow(z, m)
    const B = b.blocks[m + SPAN]!

    for (let k = 0; k < n * n; k++) {
      out.re[k]! += w[0] * B.re[k]! - w[1] * B.im[k]!
      out.im[k]! += w[0] * B.im[k]! + w[1] * B.re[k]!
    }
  }

  return out
}

// S1: max |e^(i a) - e^(i b)| between the symbol's eigenphases over the P Bloch points and the periodic P-class chain's
export function symbolSpectrum(set: HalfSet, b: BulkBlocks, P: number, sR: number[][], dR: number[][]): number {
  const fromSymbol: number[] = []

  for (let m = 0; m < P; m++) {
    const t = (2 * Math.PI * m) / P

    fromSymbol.push(...unitaryEigen(symbolAt(b, [Math.cos(t), Math.sin(t)]), HALF_MODES).phases)
  }

  const red = slabReduced(chain(P), [set], [0, 0, 0, 0], DOCK_ROOTS, sR, dR)
  const fromChain = [...unitaryEigen(red.U, red.d).phases]

  while (fromChain.length < P * HALF_MODES) {
    fromChain.push(0)
  }

  const cut = largestGapMidpoint([...fromSymbol, ...fromChain])
  const order = (xs: number[]): number[] => xs.map(x => wrap(x - cut - Math.PI)).sort((a, c) => a - c)
  const a = order(fromSymbol)
  const c = order(fromChain)

  return Math.max(...a.map((x, k) => Math.hypot(Math.cos(x) - Math.cos(c[k]!), Math.sin(x) - Math.sin(c[k]!))))
}

// ---- the roots at quasienergy pi ----

export type PiRoot = {
  z: C
  abs: number
  kappa: number
  q: number
  // the least singular value of U(z) + 1 (0 at a root; well conditioned on a degenerate root, where an eigenvalue of a
  // non-normal U(z) is not), read only for 1e-2 < |z| < 1e2 (NaN outside: the z = 0 and z = infinity clusters, where
  // z^(-+2) overflows the symbol)
  witness: number
}

export function leastSingular(b: BulkBlocks, z: C): number {
  const n = HALF_MODES
  const U = symbolAt(b, z)

  for (let i = 0; i < n; i++) {
    U.re[i * n + i]! += 1
  }

  // M = (U + 1)^dag (U + 1)
  const M = makeComplexMatrix({ rows: n, cols: n })

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let r = 0
      let m = 0

      for (let k = 0; k < n; k++) {
        const ar = U.re[k * n + i]!
        const ai = -U.im[k * n + i]!
        const br = U.re[k * n + j]!
        const bi = U.im[k * n + j]!

        r += ar * br - ai * bi
        m += ar * bi + ai * br
      }

      M.re[i * n + j] = r
      M.im[i * n + j] = m
    }
  }

  return Math.sqrt(Math.max(0, Math.min(...eigHermitian({ matrix: M }).values)))
}

const rootOf = (b: BulkBlocks, z: C): PiRoot => ({
  z,
  abs: cabs(z),
  kappa: -Math.log(cabs(z)),
  q: Math.atan2(z[1], z[0]),
  witness: cabs(z) > 1e-2 && cabs(z) < 1e2 ? leastSingular(b, z) : Number.NaN,
})

export type PiRoots = {
  sigma: C
  // every finite root, |z| descending
  roots: PiRoot[]
  infinite: number
  // the largest witness over the roots it is read on
  worstWitness: number
}

const binom = (n: number, k: number): number => {
  let r = 1

  for (let i = 0; i < k; i++) {
    r = (r * (n - i)) / (i + 1)
  }

  return r
}

export function piRoots(b: BulkBlocks, sigma: C): PiRoots {
  const n = HALF_MODES
  // A_k = U_(k - 2), plus 1 at k = 2
  const A: Dense[] = b.blocks.map((B, k) => {
    const re = Float64Array.from(B.re)
    const im = Float64Array.from(B.im)

    if (k === SPAN) {
      for (let i = 0; i < n; i++) {
        re[i * n + i]! += 1
      }
    }

    return { re, im }
  })
  // Q(sigma + w) = sum_k Bk w^k, Bk = sum_(j >= k) C(j, k) sigma^(j - k) A_j
  const Bk: Dense[] = Array.from({ length: DEGREE + 1 }, (_, k) => {
    const re = new Float64Array(n * n)
    const im = new Float64Array(n * n)

    for (let j = k; j <= DEGREE; j++) {
      const w = cpow(sigma, j - k)
      const c = binom(j, k)
      const Aj = A[j]!

      for (let x = 0; x < n * n; x++) {
        re[x]! += c * (w[0] * Aj.re[x]! - w[1] * Aj.im[x]!)
        im[x]! += c * (w[0] * Aj.im[x]! + w[1] * Aj.re[x]!)
      }
    }

    return { re, im }
  })
  // mu^4 Q(sigma + 1 / mu) = sum_k Bk mu^(4 - k); monic: C_k = B0^-1 Bk
  const Ck = Bk.map(B => denseSolve(Bk[0]!, B, n))
  const D = DEGREE * n
  const re = new Float64Array(D * D)
  const im = new Float64Array(D * D)

  for (let k = 1; k <= DEGREE; k++) {
    const Cm = Ck[k]!

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        re[i * D + (k - 1) * n + j] = -Cm.re[i * n + j]!
        im[i * D + (k - 1) * n + j] = -Cm.im[i * n + j]!
      }
    }
  }

  for (let k = 1; k < DEGREE; k++) {
    for (let i = 0; i < n; i++) {
      re[(k * n + i) * D + (k - 1) * n + i] = 1
    }
  }

  const e = complexEigenvalues({ re, im, n: D })
  const roots: PiRoot[] = []
  let infinite = 0

  for (let k = 0; k < D; k++) {
    const mu: C = [e.re[k]!, e.im[k]!]

    if (cabs(mu) < 1e-9) {
      infinite++
      continue
    }

    const w = cinv(mu)

    roots.push(rootOf(b, [sigma[0] + w[0], sigma[1] + w[1]]))
  }

  roots.sort((x, y) => y.abs - x.abs)

  return { sigma, roots, infinite, worstWitness: Math.max(...roots.map(r => r.witness).filter(w => !Number.isNaN(w))) }
}

// the roots inside the unit circle grouped by |z| and |q| within tol: the leading groups of a set
export type RootGroup = { abs: number; kappa: number; q: number; count: number; conjugate: boolean; witness: number }

export function rootGroups(roots: readonly PiRoot[], tol = 1e-6): RootGroup[] {
  const inside = roots.filter(r => r.abs < 1 - 1e-9)
  const groups: RootGroup[] = []

  for (const r of inside) {
    const g = groups.find(x => Math.abs(x.abs - r.abs) < tol && Math.abs(x.q - Math.abs(r.q)) < tol)

    if (g) {
      g.count++
      g.conjugate ||= r.q < -tol && Math.abs(r.q) < Math.PI - tol
      g.witness = Math.max(g.witness, r.witness)
    } else {
      groups.push({ abs: r.abs, kappa: r.kappa, q: Math.abs(r.q), count: 1, conjugate: false, witness: r.witness })
    }
  }

  return groups
}

// ---- the path fit ----
//
// A path is one domain's leading roots: every root inside the circle whose |z| is within 1e-6 of the largest. Each
// distinct q among them gives the real columns of that path's amplitude: q = 0 gives e^(-kappa n), q = pi gives
// e^(-kappa n) (-1)^n, any other q (a conjugate pair) e^(-kappa n) cos(q n) and e^(-kappa n) sin(q n), the a cos + b sin
// form of A cos(q n + phi). So a path holds two real numbers whenever its leading set is a conjugate pair or two real
// roots +-|z|, and one for a lone real root.

// side 0 crosses the nW Wilson classes, side 1 the nP plain classes
export type Path = { kappa: number; qs: number[]; side: 0 | 1 }

export function leadingPath(groups: readonly RootGroup[], side: 0 | 1, tol = 1e-6): Path {
  const top = groups.filter(g => Math.abs(g.abs - groups[0]!.abs) < tol)

  return { kappa: top[0]!.kappa, qs: top.map(g => g.q).sort((a, b) => a - b), side }
}

const near = (x: number, y: number): boolean => Math.abs(x - y) < 1e-6

export function pathColumns(p: Path, n: number): number[] {
  const e = Math.exp(-p.kappa * n)

  return p.qs.flatMap(q =>
    near(q, 0) ? [e] : near(q, Math.PI) ? [e * (n % 2 === 0 ? 1 : -1)] : [e * Math.cos(q * n), e * Math.sin(q * n)],
  )
}

// the number of real columns a path holds
export const pathWidth = (p: Path): number => pathColumns(p, 0).length

export type PathFit = {
  // the coefficients, the Wilson path's columns first
  x: number[]
  // per path: sum over its q of the q's amplitude (|a| for a real root, hypot(a, b) for a pair)
  amplitudes: number[]
  // rms of log(model / delta) over the fit points
  rmsLog: number
}

export type Placed = { nW: number; nP: number }

const widthOf = (pt: Placed, p: Path): number => (p.side === 0 ? pt.nW : pt.nP)

export function pathRow(paths: readonly Path[], pt: Placed): number[] {
  return paths.flatMap(p => pathColumns(p, widthOf(pt, p)))
}

export function pathModel(fit: PathFit, paths: readonly Path[], pt: Placed): { value: number; envelope: number } {
  const row = pathRow(paths, pt)

  return {
    value: Math.abs(row.reduce((s, r, k) => s + r * fit.x[k]!, 0)),
    envelope: paths.reduce((s, p, k) => s + fit.amplitudes[k]! * Math.exp(-p.kappa * widthOf(pt, p)), 0),
  }
}

function solveSmall(M: number[][], v: number[]): number[] | null {
  const n = v.length
  const A = M.map((row, i) => [...row, v[i]!])

  for (let c = 0; c < n; c++) {
    let p = c

    for (let r = c + 1; r < n; r++) {
      if (Math.abs(A[r]![c]!) > Math.abs(A[p]![c]!)) {
        p = r
      }
    }

    if (Math.abs(A[p]![c]!) < 1e-300) {
      return null
    }

    const t = A[c]!

    A[c] = A[p]!
    A[p] = t

    for (let r = 0; r < n; r++) {
      if (r === c) {
        continue
      }

      const f = A[r]![c]! / A[c]![c]!

      for (let k = c; k <= n; k++) {
        A[r]![k]! -= f * A[c]![k]!
      }
    }
  }

  return A.map((row, i) => row[n]! / row[i]!)
}

// Levenberg-Marquardt on r_i = log |row_i . x| - log delta_i from every start in a fixed grid: each coefficient
// s m scale_k, s = +-1, m = 1, 0.1, scale_k the median of delta / e^(-kappa n) over the points for its path
export function fitPaths(points: readonly (Placed & { delta: number })[], paths: readonly Path[]): PathFit {
  const basis = points.map(p => pathRow(paths, p))
  const logs = points.map(p => Math.log(p.delta))
  const dim = basis[0]!.length
  const cost = (x: number[]): number =>
    basis.reduce((s, row, i) => {
      const f = Math.abs(row.reduce((t, r, k) => t + r * x[k]!, 0))

      return s + (Math.log(Math.max(f, 1e-300)) - logs[i]!) ** 2
    }, 0)
  const lm = (start: number[]): { x: number[]; c: number } => {
    let x = start
    let c = cost(x)
    let lambda = 1e-3

    for (let it = 0; it < 300; it++) {
      const JtJ = Array.from({ length: dim }, () => Array<number>(dim).fill(0))
      const Jtr = Array<number>(dim).fill(0)

      basis.forEach((row, i) => {
        const f = row.reduce((t, r, k) => t + r * x[k]!, 0)
        const r = Math.log(Math.max(Math.abs(f), 1e-300)) - logs[i]!
        const g = row.map(v => v / f)

        for (let a = 0; a < dim; a++) {
          Jtr[a]! += g[a]! * r

          for (let b = 0; b < dim; b++) {
            JtJ[a]![b]! += g[a]! * g[b]!
          }
        }
      })

      const M = JtJ.map((row, a) => row.map((v, b) => (a === b ? v * (1 + lambda) + 1e-300 : v)))
      const step = solveSmall(M, Jtr.map(v => -v))

      if (!step) {
        break
      }

      const y = x.map((v, k) => v + step[k]!)
      const cy = cost(y)

      if (cy < c) {
        const done = c - cy < 1e-14 * Math.max(1e-6, c)

        x = y
        c = cy
        lambda = Math.max(lambda / 10, 1e-12)

        if (done) {
          break
        }
      } else {
        lambda *= 10

        if (lambda > 1e12) {
          break
        }
      }
    }

    return { x, c }
  }
  const median = (xs: number[]): number => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)]!
  const scales = paths.flatMap(p => {
    const s = median(points.map(pt => pt.delta / Math.exp(-p.kappa * widthOf(pt, p))))

    return Array<number>(pathWidth(p)).fill(s)
  })
  const levels = [1, -1, 0.1, -0.1]
  let best = { x: Array<number>(dim).fill(0), c: Infinity }

  for (let code = 0; code < levels.length ** dim; code++) {
    let r = code
    const start = scales.map(s => {
      const l = levels[r % levels.length]!

      r = Math.floor(r / levels.length)

      return l * s
    })
    const got = lm(start)

    if (got.c < best.c) {
      best = got
    }
  }

  let at = 0
  const amplitudes = paths.map(p => {
    let a = 0

    for (const q of p.qs) {
      if (near(q, 0) || near(q, Math.PI)) {
        a += Math.abs(best.x[at]!)
        at += 1
      } else {
        a += Math.hypot(best.x[at]!, best.x[at + 1]!)
        at += 2
      }
    }

    return a
  })

  return { x: best.x, amplitudes, rmsLog: Math.sqrt(best.c / points.length) }
}
