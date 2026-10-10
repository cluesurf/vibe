// MOMENTUM TRANSPORT ON THE MANY-HOLE STORE (item 0026 of moving-matter, E-FLD-0035; OPEN-CSM-17, OPEN-FND-03). The
// transverse momentum density at wave vector q is a one-body operator that moves one hole from class k to class k + q,
// so on E-FND-0163's store, which holds one total momentum P, it maps the P store into the P + q store. Its expectation
// in one total-momentum state is 0 (decision 001 of moving-matter, the lead's note for 0026): the wave lives in the
// cross term between the two sectors, which is the Kubo correlation
//
//   C(t) = < g_q U^t A | U^t g_q A >        (U one cycle of the rule, A the P store, g_q A the P + q store)
//
// the overlap of "seed the wave, then run" with "run, then seed the wave". A hydrodynamic transverse mode decays as
// C(t) ~ C(0) e^(-nu q^2 t); this module builds g_q and reads C, the experiment fits the rate.
//
// THE OPERATOR, defined on the rule's pieces only:
//   g_q = sum over k of pbar_e(k) sum over fiber a, b of M_ab(k) c^dag_(k + q, a) c_(k, b)
//   M(k) = W(k + q)^dag W(k)            the identity on the 192 internal modes, read between the moving frames of the two
//                                       momenta (fiber 8, half +); it does not depend on how a frame's complement was
//                                       picked. The part of a moved hole that lands on a flat state at k + q is dropped:
//                                       a flat hole never moves (register-holes), and the store cannot hold it (a gap,
//                                       stated, measured as the lost weight)
//   pbar_e(k) = (p_e(k) + p_e(k + q)) / 2, p_e(k) = (1/12) sum over the 24 D4 roots r of (r . e) sin(2 pi k . r / L)
//                                       the lattice momentum of the D4 mesh (p_e -> k_e at small k, since sum r r^T =
//                                       12). It is a function of the class: the classes identify k with k + (L/2)(1,1,1,
//                                       1), which moves k . r by a multiple of L
// e is a unit vector in the husk (w = 0) orthogonal to q: the TRANSVERSE density.
//
// ON THE STORE. psi(m; b) = sgn(sigma) stored(s; b o sigma) (register-sorted-holes). For a one-body operator O = sum_a O_a
// on antisymmetric wavefunctions, psi'(m'; b) = sum_a sum_c O(m'_a <- m'_a - q)[b_a, c] psi(m' with m'_a - q at a; b with
// c at a), and psi' is antisymmetric with no extra sign. Each target row s' of the P + q store reads, for each position a,
// the source tuple m = s' - q e_a, whose sorted row and stable sort the P store's gather tables already hold (pair.rowOf,
// pair.permOf, indexed by the first n - 1 classes).
//
// DETERMINISM: no random numbers; pure arithmetic on the store.

import type { HoleFrame } from '@/code/measure/register-holes'
import type { Sorted, SortedEngine } from '@/code/measure/register-sorted-holes'

// the 24 D4 roots, +-e_i +- e_j
export const D4_ROOTS: number[][] = (() => {
  const out: number[][] = []

  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      for (const a of [1, -1]) {
        for (const b of [1, -1]) {
          const r = [0, 0, 0, 0]

          r[i] = a
          r[j] = b
          out.push(r)
        }
      }
    }
  }

  return out
})()

// the lattice momentum component along e of class j
export function latticeMomentum(fr: HoleFrame, j: number, e: readonly number[]): number {
  const k = fr.fourier.ints[j]!
  const L = fr.fourier.L

  let x = 0

  for (const r of D4_ROOTS) {
    const re = r[0]! * e[0]! + r[1]! * e[1]! + r[2]! * e[2]! + r[3]! * e[3]!

    if (re === 0) {
      continue
    }

    const kr = k[0]! * r[0]! + k[1]! * r[1]! + k[2]! * r[2]! + k[3]! * r[3]!

    x += re * Math.sin((2 * Math.PI * kr) / L)
  }

  return x / 12
}

// the class of an integer momentum (units of 2 pi / L)
export function classOfInts(fr: HoleFrame, k: readonly number[]): number {
  const F = fr.fourier
  const L = F.L
  const m = (x: number): number => ((x % L) + L) % L
  const g = ((m(k[0]!) * L + m(k[1]!)) * L + m(k[2]!)) * L + m(k[3]!)

  return F.classOfGrid[g]!
}

export type DensityMap = {
  q: number
  // per source class k: the fiber x fiber matrix G(k) = pbar_e(k) M(k), row-major [a * f + b] (a at k + q, b at k)
  re: Float64Array
  im: Float64Array
  // the largest weight a fiber vector at k loses to the flat states at k + q (1 - smallest singular value^2 of M)
  lost: number
}

// G(k) for every class k
export function densityMap(fr: HoleFrame, q: number, e: readonly number[]): DensityMap {
  const F = fr.fourier
  const N = F.N
  const f = fr.fiber
  const re = new Float64Array(N * f * f)
  const im = new Float64Array(N * f * f)
  const modes = fr.W[0]!.re.length / f

  let lost = 0

  for (let k = 0; k < N; k++) {
    const kq = F.sum[k * N + q]!
    const p = (latticeMomentum(fr, k, e) + latticeMomentum(fr, kq, e)) / 2
    const X = fr.W[kq]!
    const Y = fr.W[k]!
    const o = k * f * f

    for (let a = 0; a < f; a++) {
      for (let b = 0; b < f; b++) {
        // (W(k + q)^dag W(k))[a][b] = sum_m conj(X[m][a]) Y[m][b]
        let sr = 0
        let si = 0

        for (let m = 0; m < modes; m++) {
          const xr = X.re[m * f + a]!
          const xi = -X.im[m * f + a]!
          const yr = Y.re[m * f + b]!
          const yi = Y.im[m * f + b]!

          sr += xr * yr - xi * yi
          si += xr * yi + xi * yr
        }

        re[o + a * f + b] = p * sr
        im[o + a * f + b] = p * si
      }
    }

    // the weight lost from fiber vector b: 1 - |M e_b|^2, the largest over b (M without the momentum factor)
    if (p !== 0) {
      for (let b = 0; b < f; b++) {
        let w = 0

        for (let a = 0; a < f; a++) {
          w += (re[o + a * f + b]! ** 2 + im[o + a * f + b]! ** 2) / (p * p)
        }

        lost = Math.max(lost, 1 - w)
      }
    }
  }

  return { q, re, im, lost }
}

const digits = (fb: number, n: number, f: number): number[] => {
  const out = new Array<number>(n)
  let rest = fb

  for (let i = n - 1; i >= 0; i--) {
    out[i] = rest % f
    rest = Math.floor(rest / f)
  }

  return out
}

const index = (b: readonly number[], f: number): number => b.reduce((x, d) => x * f + d, 0)

// out (the P + q store, engine eB) = g_q applied to s (the P store, engine eA)
export function applyDensity(eA: SortedEngine, eB: SortedEngine, g: DensityMap, s: Sorted, out: Sorted): void {
  const n = eA.n
  const f = eA.frame.fiber
  const B = eA.block
  const F = eA.frame.fourier
  const N = F.N
  const negQ = F.neg[g.q]!
  const nperm = eA.perms.length
  // c o sigma for every sigma and c
  const cOf = new Int32Array(nperm * B)
  // the fiber index with digit a replaced by c, for every index, position and c
  const put = new Int32Array(B * n * f)
  // f^(n - 1 - a), the place value of position a
  const place = Array.from({ length: n }, (_, a) => f ** (n - 1 - a))

  eA.perms.forEach((sigma, p) => {
    for (let c = 0; c < B; c++) {
      const cd = digits(c, n, f)

      cOf[p * B + c] = index(
        sigma.map(j => cd[j]!),
        f,
      )
    }
  })

  for (let c = 0; c < B; c++) {
    const cd = digits(c, n, f)

    for (let a = 0; a < n; a++) {
      for (let x = 0; x < f; x++) {
        put[(c * n + a) * f + x] = c + (x - cd[a]!) * place[a]!
      }
    }
  }

  out.re.fill(0)
  out.im.fill(0)

  const m = new Int32Array(n)
  // the source fiber column at the gathered row, as psi(m; c) for every c
  const colRe = new Float64Array(B)
  const colIm = new Float64Array(B)

  for (let r = 0; r < eB.rows; r++) {
    const sB = eB.mom.subarray(r * n, r * n + n)
    const ob = r * B

    for (let a = 0; a < n; a++) {
      for (let i = 0; i < n; i++) {
        m[i] = sB[i]!
      }

      const k = F.sum[sB[a]! * N + negQ]!

      m[a] = k

      let T = 0

      for (let i = 0; i < n - 1; i++) {
        T = T * N + m[i]!
      }

      const rA = eA.pair.rowOf[T]!

      if (rA < 0) {
        continue
      }

      const p = eA.pair.permOf[T]!
      const sg = eA.pair.psign[p]!
      const oa = rA * B
      const cp = p * B

      for (let c = 0; c < B; c++) {
        const at = oa + cOf[cp + c]!

        colRe[c] = sg * s.re[at]!
        colIm[c] = sg * s.im[at]!
      }

      const go = k * f * f

      for (let b = 0; b < B; b++) {
        const ba = Math.floor(b / place[a]!) % f
        const gr = go + ba * f
        const pb = (b * n + a) * f

        let xr = 0
        let xi = 0

        for (let x = 0; x < f; x++) {
          const Gr = g.re[gr + x]!
          const Gi = g.im[gr + x]!
          const c = put[pb + x]!
          const yr = colRe[c]!
          const yi = colIm[c]!

          xr += Gr * yr - Gi * yi
          xi += Gr * yi + Gi * yr
        }

        out.re[ob + b]! += xr
        out.im[ob + b]! += xi
      }
    }
  }
}

// <x|y> on one store: each row stands for weight[r] orderings
export function sortedDot(e: SortedEngine, x: Sorted, y: Sorted): [number, number] {
  let re = 0
  let im = 0

  for (let r = 0; r < e.rows; r++) {
    const w = e.weight[r]!
    let a = 0
    let b = 0

    for (let k = r * e.block; k < (r + 1) * e.block; k++) {
      a += x.re[k]! * y.re[k]! + x.im[k]! * y.im[k]!
      b += x.re[k]! * y.im[k]! - x.im[k]! * y.re[k]!
    }

    re += w * a
    im += w * b
  }

  return [re, im]
}

// the least-squares slope and its standard error of y on x
export function slope(x: readonly number[], y: readonly number[]): { b: number; se: number; r2: number } {
  const n = x.length
  const mx = x.reduce((a, v) => a + v, 0) / n
  const my = y.reduce((a, v) => a + v, 0) / n

  let sxx = 0
  let sxy = 0
  let syy = 0

  for (let i = 0; i < n; i++) {
    sxx += (x[i]! - mx) ** 2
    sxy += (x[i]! - mx) * (y[i]! - my)
    syy += (y[i]! - my) ** 2
  }

  const b = sxy / sxx
  const res = Math.max(0, syy - b * sxy)

  return { b, se: n > 2 ? Math.sqrt(res / (n - 2) / sxx) : NaN, r2: syy > 0 ? (b * sxy) / syy : 1 }
}
