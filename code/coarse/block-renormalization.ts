// One block step of the knit: the coarse rule its block sums follow, measured on the knit and predicted
// by its lattice Boltzmann equation (code/coarse/knit-boltzmann).
//
// THE COARSE FIELDS. A density (a left vector on the 48 one-body numbers: charge, a component of P, the
// line sum S, the tone count) summed over each b^4 block of docks, on the coarse torus of side L / b.
//
// THE COARSE RULE. The best local linear rule for a block field over a coarse step of tau beats, in the
// kernel form G(X, t + tau) = a G(X, t) + sum over axes j of c_j (G(X + e_j, t) + G(X - e_j, t)), fitted
// by least squares over every block and a set of start beats (normal equations accumulated, then
// solved). On the equilibrium fluctuations, whose block fields are white at equal time, the kernel is the
// block propagator: a is the share of a block's fluctuation still in the block tau beats later, c_j the
// share in each neighbour along axis j, and s = a + 2 sum c_j the share inside the nearest cross. A
// density that is conserved and moves diffusively keeps s near a fixed point under the diffusive scaling
// tau = b^2 (its spread, sqrt(2 D tau) docks, stays a fixed number of blocks); one that moves
// ballistically escapes the cross (spread tau docks, b blocks), and one that is not conserved decays in
// place (a and every c_j go to zero). How (a, c_j) move with b is the flow of the couplings.
//
// Why not the Laplacian form (G(t + tau) - G(t) = sum D_j second difference): on white fluctuations its
// least-squares couplings are fixed by the block's loss of memory, not by transport. With no memory left
// the normal equations give 6 D + 12 D = 2, D = 1/9 on every axis whatever moves the density, and pure
// streaming measured exactly that on the knit at L = 12 (tmp/bridge-block-probe). The kernel form reads
// the same data without that artifact.
//
// THE COARSE RULE, predicted. The same kernel from the lattice Boltzmann equation on the equilibrium
// fluctuations: at equilibrium the dock one-body states are independent with the product background's
// covariance C (per slot var n+ = p+(1 - p+), var n- = p-(1 - p-), cov(n+, n-) = -p+ p-), and in the
// Boltzmann approximation their deviations evolve by the linear equation. The covariance of block fields
// tau beats apart is R_tau(o) = (1 / N) sum over fine k of c_tau(k) |B(k)|^2 e^{i b k . o}, with c_tau(k) =
// l M_tau(k) C l^T (M_tau the tau-beat Fourier propagator from phase 0) and B the block's form factor,
// prod over axes of sin(b k_j / 2) / sin(k_j / 2). With white equal-time fields, a = R_tau(0) / (b^4 l C l^T)
// and c_j = (R_tau(e_j) + R_tau(-e_j)) / (2 b^4 l C l^T), closed form over the fine Brillouin zone, k and -k
// taken together. On pure streaming the equation is exact and the prediction matches the knit to its
// standard errors (the same probe).
//
// THE HYDRODYNAMIC FIXED POINT. If a density spreads as a Gaussian with variance 2 D_j tau along axis j
// (in docks), its block propagator at tau = b^2 is separable: along one axis the share at offset o of a
// uniform block of unit width is p_j(o) = the integral over u, v in [0, 1) of the Gaussian density of
// o + u - v at variance sigma_j^2 = 2 D_j, so a* = prod p_j(0) and c_j* = p_j(1) prod over i != j of
// p_i(0), the same at every b.

import { rootsD4 } from '@/code/algebra/group/root-system'
import { SLOT_STATES } from '@/code/coarse/knit-boltzmann'

const ROOTS = rootsD4()
const KERNEL = 5

// the block sums of each density, one Float64Array of (L / b)^4 per density, coarse index
// X0 + Lc X1 + Lc^2 X2 + Lc^3 X3
export function blockFields(input: { data: Int8Array; side: number; block: number; lefts: readonly Float64Array[] }): Float64Array[] {
  const { data, side, block, lefts } = input
  const lc = side / block
  const out = lefts.map(() => new Float64Array(lc ** 4))
  const docks = data.length / 24

  for (let dock = 0; dock < docks; dock++) {
    const x0 = Math.floor((dock % side) / block)
    const x1 = Math.floor((Math.floor(dock / side) % side) / block)
    const x2 = Math.floor((Math.floor(dock / side ** 2) % side) / block)
    const x3 = Math.floor((Math.floor(dock / side ** 3) % side) / block)
    const coarse = x0 + lc * (x1 + lc * (x2 + lc * x3))

    for (let d = 0; d < 24; d++) {
      const v = data[dock * 24 + d] ?? 0

      if (v === 0) {
        continue
      }

      const index = d * 2 + (v > 0 ? 0 : 1)

      for (let q = 0; q < lefts.length; q++) {
        const field = out[q] as Float64Array

        field[coarse] = (field[coarse] ?? 0) + (lefts[q]?.[index] ?? 0)
      }
    }
  }

  return out
}

export type KernelSums = { xx: Float64Array; xy: Float64Array; yy: number; count: number }

export function emptyKernel(): KernelSums {
  return { xx: new Float64Array(KERNEL * KERNEL), xy: new Float64Array(KERNEL), yy: 0, count: 0 }
}

// add one (before, after) pair of coarse fields on a coarse torus of side lc to the normal equations;
// regressors: G(X), and G(X + e_j) + G(X - e_j) for j = 0..3; the fields are taken about their means
export function accumulateKernel(sums: KernelSums, before: Float64Array, after: Float64Array, lc: number): void {
  const strides = [1, lc, lc * lc, lc * lc * lc]
  const meanBefore = before.reduce((s, v) => s + v, 0) / before.length
  const meanAfter = after.reduce((s, v) => s + v, 0) / after.length
  const x = new Float64Array(KERNEL)

  for (let i = 0; i < before.length; i++) {
    x[0] = (before[i] ?? 0) - meanBefore

    for (let j = 0; j < 4; j++) {
      const stride = strides[j] ?? 1
      const coordinate = Math.floor(i / stride) % lc
      const up = i + (((coordinate + 1) % lc) - coordinate) * stride
      const down = i + (((coordinate - 1 + lc) % lc) - coordinate) * stride

      x[j + 1] = (before[up] ?? 0) + (before[down] ?? 0) - 2 * meanBefore
    }

    const y = (after[i] ?? 0) - meanAfter

    for (let r = 0; r < KERNEL; r++) {
      for (let c = 0; c < KERNEL; c++) {
        sums.xx[r * KERNEL + c] = (sums.xx[r * KERNEL + c] ?? 0) + (x[r] ?? 0) * (x[c] ?? 0)
      }

      sums.xy[r] = (sums.xy[r] ?? 0) + (x[r] ?? 0) * y
    }

    sums.yy += y * y
    sums.count++
  }
}

function solve(a: Float64Array, b: Float64Array, n: number): Float64Array {
  const m = Array.from({ length: n }, (_, r) => [...Array.from({ length: n }, (__, c) => a[r * n + c] ?? 0), b[r] ?? 0])

  for (let c = 0; c < n; c++) {
    let p = c

    for (let r = c + 1; r < n; r++) {
      if (Math.abs(m[r]?.[c] ?? 0) > Math.abs(m[p]?.[c] ?? 0)) p = r
    }

    ;[m[c], m[p]] = [m[p] ?? [], m[c] ?? []]

    for (let r = 0; r < n; r++) {
      if (r !== c) {
        const f = (m[r]?.[c] ?? 0) / (m[c]?.[c] ?? 1)

        m[r] = (m[r] ?? []).map((v, k) => v - f * (m[c]?.[k] ?? 0))
      }
    }
  }

  return Float64Array.from({ length: n }, (_, i) => (m[i]?.[n] ?? 0) / (m[i]?.[i] ?? 1))
}

export type BlockKernel = {
  // a, then c_0..c_3
  readonly self: number
  readonly neighbours: Float64Array
  // the share inside the nearest cross, a + 2 sum c_j
  readonly cross: number
  // standard errors of a and each c_j under the least-squares model (independent residuals, an
  // optimistic floor when neighbouring residuals are correlated); zero for a prediction
  readonly selfError: number
  readonly neighbourErrors: Float64Array
  // the share of the coarse field's variance tau beats on that the kernel explains
  readonly r2: number
}

function kernelOf(coefficients: Float64Array, errors: Float64Array, r2: number): BlockKernel {
  const neighbours = coefficients.slice(1)

  return {
    self: coefficients[0] ?? 0,
    neighbours,
    cross: (coefficients[0] ?? 0) + 2 * neighbours.reduce((s, v) => s + v, 0),
    selfError: errors[0] ?? 0,
    neighbourErrors: errors.slice(1),
    r2,
  }
}

export function solveKernel(sums: KernelSums): BlockKernel {
  const coefficients = solve(sums.xx, sums.xy, KERNEL)
  const explained = coefficients.reduce((s, d, j) => s + d * (sums.xy[j] ?? 0), 0)
  const residual = (sums.yy - explained) / Math.max(1, sums.count - KERNEL)
  const errors = Float64Array.from({ length: KERNEL }, (_, j) => {
    const unit = Float64Array.from({ length: KERNEL }, (__, i) => (i === j ? 1 : 0))
    const column = solve(sums.xx, unit, KERNEL)

    return Math.sqrt(Math.max(0, residual * (column[j] ?? 0)))
  })

  return kernelOf(coefficients, errors, sums.yy > 0 ? explained / sums.yy : 0)
}

// the one-body covariance of a dock under a product background, applied to a left vector: C l^T
function covarianceTimes(background: Float64Array, left: Float64Array): Float64Array {
  const out = new Float64Array(SLOT_STATES)

  for (let d = 0; d < 24; d++) {
    const p = background[d * 2] ?? 0
    const q = background[d * 2 + 1] ?? 0
    const a = left[d * 2] ?? 0
    const b = left[d * 2 + 1] ?? 0

    out[d * 2] = p * (1 - p) * a - p * q * b
    out[d * 2 + 1] = -p * q * a + q * (1 - q) * b
  }

  return out
}

// The equilibrium covariance of two densities in one dock under a product background, l C m^T
export function densityCovariance(background: Float64Array, left: Float64Array, right: Float64Array): number {
  const c = covarianceTimes(background, right)

  return c.reduce((s, v, i) => s + v * (left[i] ?? 0), 0)
}

type SparseRow = { cols: Int32Array; vals: Float64Array }

// one beat in Fourier, in place: x <- S(k) A x, with A given by its nonzero entries row by row
function propagate(rows: readonly SparseRow[], xr: Float64Array, xi: Float64Array, tr: Float64Array, ti: Float64Array, phaseCos: Float64Array, phaseSin: Float64Array): void {
  for (let r = 0; r < xr.length; r++) {
    const row = rows[r]
    let sr = 0
    let si = 0

    if (row) {
      for (let e = 0; e < row.cols.length; e++) {
        const c = row.cols[e] ?? 0
        const w = row.vals[e] ?? 0

        sr += w * (xr[c] ?? 0)
        si += w * (xi[c] ?? 0)
      }
    }

    tr[r] = (phaseCos[r] ?? 1) * sr - (phaseSin[r] ?? 0) * si
    ti[r] = (phaseCos[r] ?? 1) * si + (phaseSin[r] ?? 0) * sr
  }

  xr.set(tr)
  xi.set(ti)
}

// The Boltzmann prediction of the block kernel of each density at each (block, tau), from the equilibrium
// fluctuations propagated by the linear equation from phase 0, over the whole fine Brillouin zone of side L
export function predictedKernels(input: {
  matrices: readonly Float64Array[]
  background: Float64Array
  lefts: readonly Float64Array[]
  side: number
  steps: readonly { block: number; tau: number }[]
  // the schedule phases the coarse steps start at, averaged (the knit's start beats mod the period)
  phases?: readonly number[]
}): BlockKernel[][] {
  const { matrices, background, lefts, side, steps } = input
  const phases = input.phases ?? [0]
  const n = SLOT_STATES
  const period = matrices.length
  const maxTau = Math.max(...steps.map(s => s.tau))
  const sigma = lefts.map(left => densityCovariance(background, left, left))
  // accumulated sums per density per step: [sum of R_tau(0) terms, sum of R_tau(e_j) + R_tau(-e_j) terms]
  const acc = lefts.map(() => steps.map(() => new Float64Array(5)))
  const tausWanted = new Set(steps.map(s => s.tau))
  const vr = lefts.map(() => new Float64Array(n))
  const vi = lefts.map(() => new Float64Array(n))
  const tr = new Float64Array(n)
  const ti = new Float64Array(n)
  const phaseCos = new Float64Array(n)
  const phaseSin = new Float64Array(n)
  const k = [0, 0, 0, 0]
  const total = side ** 4
  const starts = lefts.map(left => covarianceTimes(background, left))
  // the nonzero entries of each phase's matrix, row by row
  const sparse = matrices.map(a => {
    const rows: SparseRow[] = []

    for (let r = 0; r < n; r++) {
      const cols: number[] = []
      const vals: number[] = []

      for (let c = 0; c < n; c++) {
        const w = a[r * n + c] ?? 0

        if (w !== 0) {
          cols.push(c)
          vals.push(w)
        }
      }

      rows.push({ cols: Int32Array.from(cols), vals: Float64Array.from(vals) })
    }

    return rows
  })

  for (let index = 0; index < total; index++) {
    const m0 = index % side
    const m1 = Math.floor(index / side) % side
    const m2 = Math.floor(index / side ** 2) % side
    const m3 = Math.floor(index / side ** 3) % side
    const negIndex = ((side - m0) % side) + side * (((side - m1) % side) + side * (((side - m2) % side) + side * ((side - m3) % side)))

    // k and -k together: skip the one whose negation comes first
    if (negIndex < index) {
      continue
    }

    const weight = negIndex === index ? 1 : 2

    k[0] = (2 * Math.PI * m0) / side
    k[1] = (2 * Math.PI * m1) / side
    k[2] = (2 * Math.PI * m2) / side
    k[3] = (2 * Math.PI * m3) / side

    for (let i = 0; i < n; i++) {
      const root = ROOTS[Math.floor(i / 2)] ?? []
      const phase = -((root[0] ?? 0) * (k[0] ?? 0) + (root[1] ?? 0) * (k[1] ?? 0) + (root[2] ?? 0) * (k[2] ?? 0) + (root[3] ?? 0) * (k[3] ?? 0))

      phaseCos[i] = Math.cos(phase)
      phaseSin[i] = Math.sin(phase)
    }

    const forms = steps.map(({ block }) => {
      let f = 1

      for (let j = 0; j < 4; j++) {
        const s = Math.sin((k[j] ?? 0) / 2)

        f *= s === 0 ? block * block : (Math.sin((block * (k[j] ?? 0)) / 2) / s) ** 2
      }

      return f
    })

    for (const phase of phases) {
      for (let q = 0; q < lefts.length; q++) {
        ;(vr[q] as Float64Array).set(starts[q] as Float64Array)
        ;(vi[q] as Float64Array).fill(0)
      }

      for (let t = 1; t <= maxTau; t++) {
        const rows = sparse[(phase + t - 1) % period] ?? []

        for (let q = 0; q < lefts.length; q++) {
          propagate(rows, vr[q] as Float64Array, vi[q] as Float64Array, tr, ti, phaseCos, phaseSin)
        }

        if (!tausWanted.has(t)) {
          continue
        }

        steps.forEach((step, s) => {
          if (step.tau !== t) {
            return
          }

          for (let q = 0; q < lefts.length; q++) {
            const left = lefts[q] as Float64Array
            const xr = vr[q] as Float64Array
            let c = 0

            for (let i = 0; i < n; i++) {
              c += (left[i] ?? 0) * (xr[i] ?? 0)
            }

            // the real part of c_tau(k); pairs k and -k add to twice it
            const w = weight * c * (forms[s] ?? 0)
            const row = acc[q]?.[s] as Float64Array

            row[0] = (row[0] ?? 0) + w

            for (let j = 0; j < 4; j++) {
              row[j + 1] = (row[j + 1] ?? 0) + 2 * w * Math.cos(step.block * (k[j] ?? 0))
            }
          }
        })
      }
    }
  }

  return lefts.map((_, q) =>
    steps.map(({ block }, s) => {
      const row = (acc[q]?.[s] ?? new Float64Array(5)).map(v => v / phases.length)
      const white = block ** 4 * (sigma[q] ?? 0)
      const coefficients = Float64Array.from({ length: KERNEL }, (_, j) => (j === 0 ? (row[0] ?? 0) / total / white : (row[j] ?? 0) / total / (2 * white)))
      // r2 of the kernel on white regressors: sum of coefficient times covariance over the variance
      const explained = (coefficients[0] ?? 0) * ((row[0] ?? 0) / total) + [1, 2, 3, 4].reduce((acc2, j) => acc2 + (coefficients[j] ?? 0) * ((row[j] ?? 0) / total), 0)

      return kernelOf(coefficients, new Float64Array(KERNEL), white > 0 ? explained / white : 0)
    }),
  )
}

// the share at integer offset o of a unit block spread by a Gaussian of variance s2, both ends uniform:
// the integral over u, v in [0, 1) of the density of o + u - v, i.e. the Gaussian averaged against the
// triangle of width 2 centred at o, by Simpson's rule on 400 intervals
function blockShare(offset: number, s2: number): number {
  const steps = 400
  const h = 2 / steps
  const sd = Math.sqrt(s2)
  let sum = 0

  for (let i = 0; i <= steps; i++) {
    const x = -1 + i * h
    const tri = 1 - Math.abs(x)
    const g = Math.exp(-((offset + x) ** 2) / (2 * s2)) / (sd * Math.sqrt(2 * Math.PI))
    const w = i === 0 || i === steps ? 1 : i % 2 === 1 ? 4 : 2

    sum += w * tri * g
  }

  return (sum * h) / 3
}

// The diffusivity (in docks^2 per beat) whose fixed-point kernel has neighbour-to-self ratio c_j / a along
// one axis, by bisection on [0.001, 100] (the ratio p(1) / p(0) rises with D): a block kernel's couplings
// read back as the transport coefficient they amount to at that block size. NaN when the ratio is outside
// what a Gaussian spread can give (a self share that is not positive, or a ratio of 1 or more).
export function effectiveDiffusivity(ratio: number): number {
  const f = (d: number): number => blockShare(1, 2 * d) / blockShare(0, 2 * d)

  if (!(ratio > f(0.001)) || !(ratio < f(100))) {
    return Number.NaN
  }

  let lo = 0.001
  let hi = 100

  for (let i = 0; i < 60; i++) {
    const mid = Math.sqrt(lo * hi)

    if (f(mid) < ratio) {
      lo = mid
    } else {
      hi = mid
    }
  }

  return Math.sqrt(lo * hi)
}

// the hydrodynamic fixed point of the block kernel for per-axis diffusivities D_j at tau = b^2
export function diffusiveFixedPoint(diffusivities: readonly number[]): BlockKernel {
  const p0 = diffusivities.map(d => blockShare(0, 2 * d))
  const p1 = diffusivities.map(d => blockShare(1, 2 * d))
  const self = p0.reduce((s, v) => s * v, 1)
  const neighbours = Float64Array.from(diffusivities.map((_, j) => (p1[j] ?? 0) * p0.reduce((s, v, i) => (i === j ? s : s * v), 1)))

  return kernelOf(Float64Array.from([self, ...neighbours]), new Float64Array(KERNEL), 0)
}
