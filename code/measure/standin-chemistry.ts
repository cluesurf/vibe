// Stand-in chemistry on the husk: many STAND-IN electrons, fixed stand-in nuclei, the husk lattice Coulomb
// potential, and the solvers that read their energies. Built for E-MTR-0007 to E-MTR-0012.
//
// A STAND-IN is not the electron. The model has not produced a light, stable, charged, spin-one-half
// excitation (roadmap rung 3). The stand-in is the fear walk's token with an Eisenstein charge, as in
// E-FRC-0176, moving on the husk, the 3D cubic horosphere of the {3,4,3,4} cusp, in the husk's own lattice
// Coulomb potential (E-FRC-0179: huskCoulomb is exactly the husk lattice Green's function). Every experiment
// that imports this file labels its electrons and nuclei stand-ins, and none is graded L3.
//
// This is a minimal one-body core of its own. Single-electron stand-in hydrogen is another experiment's
// question (E-MTR-0001 to 0006); nothing here is shared with it, and a difference between the two is a
// measurement of the choices below.
//
// The choices, each stated because each is a construction:
//
// 1. THE STAND-IN'S BAND. The one-dimensional fear walk's band through quasi-energy 0 is
//    e1(q) = arccos(cos(q) / 2) - pi / 3 (E-CMP-0017: eigenphases pi / 3 -+ W, cos W = cos k / 2), rest mass
//    sqrt 3, top pi / 3. On the husk a dock has 9 link directions, 3 axes of weight 2 and 6 face diagonals of
//    weight 1 (code/measure/photon-husk). The stand-in's kinetic quasi-energy is the walk's band along each
//    husk direction, weighed as the husk weighs the link, over 6:
//        T(k) = (1/6) sum_h w_h e1(k . u_h)
//    The 6 is sum_h w_h (k . u_h)^2 = 6 k^2, so T = k^2 / (2 sqrt 3) + O(k^4): the stand-in keeps the walk's
//    mass sqrt 3 and is isotropic at order k^2, and its band top is 2 pi / 3. It is the band of a walk that
//    takes each husk direction in turn, in the limit where those substeps commute (the band-projected,
//    Trotter limit). The walk's second band and its quasi-energy wrap mod 2 pi are left out: a potential
//    deeper than the band gap 2 pi / 3 is outside what the walk itself would do, and every result reports
//    its deepest potential against that gap.
// 2. THE CHARGE. A stand-in nucleus is a fixed column charge +Z at a husk dock (as E-FRC-0169 fixes a love at
//    a dock). A stand-in electron has charge -1. Two charges q, q' at husk separation r have energy
//    kappa q q' G(r), G the husk lattice Green's function (L G = delta, L the husk Laplacian with weights 2
//    and 1), which falls as 1 / (24 pi r). So the stand-in fine-structure constant is alpha = kappa / (24 pi).
//    The model fixes no alpha (roadmap section 9): alpha is CHOSEN, through the stand-in Bohr radius
//    a0 = 1 / (m alpha) in husk spacings. The stand-in Rydberg is Ry = m alpha^2 / 2 = 1 / (2 sqrt 3 a0^2)
//    per beat. Results are read in a0 and Ry, and the lattice error falls as a0 grows.
// 3. G ON THE INFINITE HUSK. The torus Green's function of side M = 128 by FFT, with its image terms
//    removed: G(r) = G_M(r) + 2.837297 / (24 pi M) - r^2 / (36 M^3) (the Madelung constant of a cubic
//    lattice of point charges in a neutralizing background, for the operator -6 del^2 the husk Laplacian
//    becomes at long wavelength). Beyond r = 16 the continuum 1 / (24 pi r) is used, where the lattice
//    correction is under 1e-4 (E-FRC-0179 D3: 24 pi r G(r) - 1 is -0.0006 at r = 4 and falls as r^-2).
// 4. THE BOX. Stand-in electrons live on a periodic side^3 box (side a power of 2), the kinetic term applied
//    by FFT, with every bound density decaying well inside it. Electron-nucleus potentials use the minimum
//    image. Electron-electron potentials are the open-boundary convolution with G (Hockney: the density
//    zero-padded into a (2 side)^3 grid), so no periodic image charge enters.
// 5. THE SOLVERS. The lowest states of H = T + V by Chebyshev-filtered subspace iteration with a
//    Rayleigh-Ritz step (Zhou and Saad 2007), deterministic starts from code/tool/weyl. Mean fields:
//    'none' (independent stand-ins), 'hartree' (the stand-ins' own density, self-interaction kept) and
//    'fermi-amaldi' (the density scaled by (N - 1) / N, Fermi and Amaldi 1934, the cheapest correction that
//    gives an outer stand-in the right far field). With 'fermi-amaldi' and all N stand-ins in one orbital
//    (capacity N) the mean-field energy is EXACTLY the energy of the boson product state, so bosons and
//    fermions differ here only in how many stand-ins one orbital may hold. The fermion Hartree-Fock energy
//    of a determinant is evaluated exactly (every exchange integral) by hartreeFockEnergy.

import { eigSymmetric } from '@/code/algebra/linear/eig-jacobi'
import { HUSK_VECTORS, HUSK_WEIGHTS } from '@/code/measure/photon-husk'
import { huskLaplacianSymbol } from '@/code/measure/photon-symbol'
import { weylUnitVector } from '@/code/tool/weyl'

// the fear walk's rest mass, |1 - omega| (E-CMP-0017)
export const STANDIN_MASS = Math.sqrt(3)
// the stand-in band's top, and the gap to the walk's other band at k = 0
export const BAND_TOP = (2 * Math.PI) / 3
// the cubic Madelung constant of point charges in a neutralizing background
const MADELUNG = 2.837297479
// the torus the infinite Green's function is read from, and the radius past which the continuum is used
const TORUS = 128
const BLEND = 16
// the sum over husk directions of w_h (k . u_h)^2 / k^2
const HUSK_SECOND_MOMENT = 6

export type Units = {
  // the stand-in Bohr radius, in husk spacings
  readonly a0: number
  // the stand-in fine-structure constant, 1 / (m a0)
  readonly alpha: number
  // the coupling of the lattice Green's function, 24 pi alpha
  readonly kappa: number
  // the stand-in Rydberg, m alpha^2 / 2, in quasi-energy per beat
  readonly rydberg: number
}

export function standinUnits(a0: number): Units {
  const alpha = 1 / (STANDIN_MASS * a0)

  return { a0, alpha, kappa: 24 * Math.PI * alpha, rydberg: (STANDIN_MASS * alpha * alpha) / 2 }
}

// the one-dimensional fear walk's band through quasi-energy 0
export function fearBand(q: number): number {
  return Math.acos(Math.cos(q) / 2) - Math.PI / 3
}

// the husk stand-in's band
export function standinBand(k: readonly number[]): number {
  let sum = 0

  for (let h = 0; h < HUSK_VECTORS.length; h++) {
    const u = HUSK_VECTORS[h] ?? [0, 0, 0]

    sum += (HUSK_WEIGHTS[h] ?? 0) * fearBand((u[0] ?? 0) * (k[0] ?? 0) + (u[1] ?? 0) * (k[1] ?? 0) + (u[2] ?? 0) * (k[2] ?? 0))
  }

  return sum / HUSK_SECOND_MOMENT
}

// ---------------------------------------------------------------------------------------------------------
// the FFT: radix 2, in place, on cubic grids

type Plan = { readonly n: number; readonly reverse: Uint32Array; readonly cos: Float64Array; readonly sin: Float64Array; readonly lineRe: Float64Array; readonly lineIm: Float64Array }

const PLANS = new Map<number, Plan>()

function planOf(n: number): Plan {
  const cached = PLANS.get(n)

  if (cached) {
    return cached
  }

  if ((n & (n - 1)) !== 0) {
    throw new Error(`the FFT side ${n} is not a power of 2`)
  }

  const bits = Math.round(Math.log2(n))
  const reverse = new Uint32Array(n)

  for (let i = 0; i < n; i++) {
    let r = 0

    for (let b = 0; b < bits; b++) {
      r |= ((i >> b) & 1) << (bits - 1 - b)
    }

    reverse[i] = r
  }

  const plan: Plan = {
    n,
    reverse,
    cos: Float64Array.from({ length: n / 2 }, (_, j) => Math.cos((2 * Math.PI * j) / n)),
    sin: Float64Array.from({ length: n / 2 }, (_, j) => Math.sin((2 * Math.PI * j) / n)),
    lineRe: new Float64Array(n),
    lineIm: new Float64Array(n),
  }

  PLANS.set(n, plan)

  return plan
}

// the forward transform of one line in place (the inverse is taken by conjugating around it, in fft3). The
// hot loop indexes typed arrays inside their bounds, so it asserts rather than defaults
function fft1(re: Float64Array, im: Float64Array, plan: Plan): void {
  const n = plan.n
  const reverse = plan.reverse
  const cos = plan.cos
  const sin = plan.sin

  for (let i = 0; i < n; i++) {
    const j = reverse[i]!

    if (j > i) {
      const tr = re[i]!
      const ti = im[i]!

      re[i] = re[j]!
      im[i] = im[j]!
      re[j] = tr
      im[j] = ti
    }
  }

  for (let size = 2; size <= n; size <<= 1) {
    const half = size >> 1
    const step = n / size

    for (let j = 0; j < half; j++) {
      const wr = cos[j * step]!
      const wi = -sin[j * step]!

      for (let a = j; a < n; a += size) {
        const b = a + half
        const br = re[b]!
        const bi = im[b]!
        const tr = wr * br - wi * bi
        const ti = wr * bi + wi * br
        const ar = re[a]!
        const ai = im[a]!

        re[b] = ar - tr
        im[b] = ai - ti
        re[a] = ar + tr
        im[a] = ai + ti
      }
    }
  }
}

// the 3D DFT of a side^3 grid (index x + side (y + side z)); the inverse carries the 1 / side^3
export function fft3(re: Float64Array, im: Float64Array, side: number, inverse: boolean): void {
  const plan = planOf(side)
  const n = side
  const size = n * n * n
  const lr = plan.lineRe
  const li = plan.lineIm

  // the inverse is conj(F(conj(x))) / n^3
  if (inverse) {
    for (let i = 0; i < size; i++) {
      im[i] = -im[i]!
    }
  }

  for (let base = 0; base < size; base += n) {
    fft1(re.subarray(base, base + n), im.subarray(base, base + n), plan)
  }

  for (const stride of [n, n * n]) {
    for (let outer = 0; outer < n * n; outer++) {
      // the lines along this axis start at every index whose coordinate on it is 0
      const base = stride === n ? (outer % n) + n * n * Math.floor(outer / n) : outer

      for (let i = 0; i < n; i++) {
        lr[i] = re[base + i * stride]!
        li[i] = im[base + i * stride]!
      }

      fft1(lr, li, plan)

      for (let i = 0; i < n; i++) {
        re[base + i * stride] = lr[i]!
        im[base + i * stride] = li[i]!
      }
    }
  }

  if (inverse) {
    const scale = 1 / size

    for (let i = 0; i < size; i++) {
      re[i] = re[i]! * scale
      im[i] = -im[i]! * scale
    }
  }
}

// ---------------------------------------------------------------------------------------------------------
// the husk Green's function

let TORUS_GREEN: Float64Array | undefined

// G_M on the M^3 husk torus with the zero mode removed, L G = delta - 1 / M^3, at every displacement
export function torusGreen(side: number): Float64Array {
  const re = new Float64Array(side ** 3)
  const im = new Float64Array(side ** 3)
  const step = (2 * Math.PI) / side

  for (let c = 0; c < side; c++) {
    for (let b = 0; b < side; b++) {
      for (let a = 0; a < side; a++) {
        if (a === 0 && b === 0 && c === 0) {
          continue
        }

        re[a + side * (b + side * c)] = 1 / huskLaplacianSymbol([a * step, b * step, c * step])
      }
    }
  }

  fft3(re, im, side, true)

  return re
}

// G on the infinite husk at the displacement (dx, dy, dz)
export function greenInfinite(dx: number, dy: number, dz: number): number {
  const r = Math.hypot(dx, dy, dz)

  if (r > BLEND) {
    return 1 / (24 * Math.PI * r)
  }

  TORUS_GREEN ??= torusGreen(TORUS)

  const m = TORUS
  const wrap = (x: number): number => ((x % m) + m) % m

  return (TORUS_GREEN[wrap(dx) + m * (wrap(dy) + m * wrap(dz))] ?? 0) + MADELUNG / (24 * Math.PI * m) - (r * r) / (36 * m ** 3)
}

// ---------------------------------------------------------------------------------------------------------
// the box

export type Grid = {
  readonly side: number
  readonly size: number
  // T(k) at every wave vector of the box
  readonly kinetic: Float64Array
  readonly re: Float64Array
  readonly im: Float64Array
}

const GRIDS = new Map<number, Grid>()

export function makeGrid(side: number): Grid {
  const cached = GRIDS.get(side)

  if (cached) {
    return cached
  }

  const size = side ** 3
  const kinetic = new Float64Array(size)
  const step = (2 * Math.PI) / side

  for (let c = 0; c < side; c++) {
    for (let b = 0; b < side; b++) {
      for (let a = 0; a < side; a++) {
        kinetic[a + side * (b + side * c)] = standinBand([a * step, b * step, c * step])
      }
    }
  }

  const grid = { side, size, kinetic, re: new Float64Array(size), im: new Float64Array(size) }

  GRIDS.set(side, grid)

  return grid
}

export type Point = readonly [number, number, number]

export const indexOf = (side: number, p: Point): number => p[0] + side * (p[1] + side * p[2])

// the minimum-image displacement from p to the dock i
function displacement(side: number, i: number, p: Point): [number, number, number] {
  const half = side / 2
  const wrap = (d: number): number => (d >= half ? d - side : d < -half ? d + side : d)

  return [wrap((i % side) - p[0]), wrap((Math.floor(i / side) % side) - p[1]), wrap(Math.floor(i / (side * side)) - p[2])]
}

export type Nucleus = { readonly at: Point; readonly charge: number }

// the potential energy of a stand-in electron (charge -1) in the field of the nuclei
export function externalPotential(input: { grid: Grid; units: Units; nuclei: readonly Nucleus[] }): Float64Array {
  const { grid, units, nuclei } = input
  const v = new Float64Array(grid.size)

  for (let i = 0; i < grid.size; i++) {
    let sum = 0

    for (const nucleus of nuclei) {
      const [x, y, z] = displacement(grid.side, i, nucleus.at)

      sum -= nucleus.charge * greenInfinite(x, y, z)
    }

    v[i] = units.kappa * sum
  }

  return v
}

export function nuclearRepulsion(units: Units, nuclei: readonly Nucleus[]): number {
  let sum = 0

  nuclei.forEach((a, i) =>
    nuclei.slice(i + 1).forEach(b => {
      sum += a.charge * b.charge * greenInfinite(a.at[0] - b.at[0], a.at[1] - b.at[1], a.at[2] - b.at[2])
    }),
  )

  return units.kappa * sum
}

// T x and T y for two real vectors at once, packed as the real and imaginary parts of one complex field (T(k)
// is real and even, so it keeps them apart)
function kineticPair(grid: Grid, x: Float64Array, y: Float64Array | undefined, outX: Float64Array, outY: Float64Array | undefined): void {
  const { re, im, kinetic, side } = grid

  re.set(x)

  if (y) {
    im.set(y)
  } else {
    im.fill(0)
  }

  fft3(re, im, side, false)

  for (let i = 0; i < grid.size; i++) {
    re[i] = re[i]! * kinetic[i]!
    im[i] = im[i]! * kinetic[i]!
  }

  fft3(re, im, side, true)
  outX.set(re)

  if (outY) {
    outY.set(im)
  }
}

// H v for every vector of a block
export function applyHamiltonian(grid: Grid, potential: Float64Array, block: readonly Float64Array[]): Float64Array[] {
  const out = block.map(() => new Float64Array(grid.size))

  for (let j = 0; j < block.length; j += 2) {
    kineticPair(grid, block[j] ?? new Float64Array(grid.size), block[j + 1], out[j] ?? new Float64Array(grid.size), out[j + 1])
  }

  block.forEach((v, j) => {
    const o = out[j] ?? new Float64Array(grid.size)

    for (let i = 0; i < grid.size; i++) {
      o[i] = o[i]! + potential[i]! * v[i]!
    }
  })

  return out
}

// <x | T | x>
export function kineticEnergy(grid: Grid, x: Float64Array): number {
  const t = new Float64Array(grid.size)

  kineticPair(grid, x, undefined, t, undefined)

  return dot(x, t)
}

// the largest and smallest entries of a long array (a spread would overflow the call stack)
export function maxOf(a: ArrayLike<number>): number {
  let m = Number.NEGATIVE_INFINITY

  for (let i = 0; i < a.length; i++) {
    m = Math.max(m, a[i] ?? m)
  }

  return m
}

export function minOf(a: ArrayLike<number>): number {
  let m = Number.POSITIVE_INFINITY

  for (let i = 0; i < a.length; i++) {
    m = Math.min(m, a[i] ?? m)
  }

  return m
}

export function dot(a: Float64Array, b: Float64Array): number {
  let s = 0
  const n = Math.min(a.length, b.length)

  for (let i = 0; i < n; i++) {
    s += a[i]! * b[i]!
  }

  return s
}

// y += c x
function axpy(y: Float64Array, c: number, x: Float64Array): void {
  const n = Math.min(x.length, y.length)

  for (let i = 0; i < n; i++) {
    y[i] = y[i]! + c * x[i]!
  }
}

// ---------------------------------------------------------------------------------------------------------
// the eigensolver

function orthonormalize(block: Float64Array[], fresh: (j: number) => Float64Array, project?: (v: Float64Array) => void): void {
  for (let j = 0; j < block.length; j++) {
    for (let attempt = 0; attempt < 3; attempt++) {
      const v = block[j] ?? new Float64Array(0)
      const before = Math.sqrt(dot(v, v))

      for (let pass = 0; pass < 2; pass++) {
        for (let i = 0; i < j; i++) {
          const u = block[i] ?? new Float64Array(0)

          axpy(v, -dot(u, v), u)
        }
      }

      const after = Math.sqrt(dot(v, v))

      if (after > 1e-10 * Math.max(before, 1e-300)) {
        for (let k = 0; k < v.length; k++) {
          v[k] = (v[k] ?? 0) / after
        }

        break
      }

      const replacement = fresh(j + 1000 * (attempt + 1))

      project?.(replacement)
      block[j] = replacement
    }
  }
}

function rayleighRitz(grid: Grid, potential: Float64Array, block: Float64Array[]): { block: Float64Array[]; applied: Float64Array[]; values: number[] } {
  const b = block.length
  const applied = applyHamiltonian(grid, potential, block)
  const data = new Float64Array(b * b)

  for (let i = 0; i < b; i++) {
    for (let j = i; j < b; j++) {
      const s = (dot(block[i] ?? new Float64Array(0), applied[j] ?? new Float64Array(0)) + dot(block[j] ?? new Float64Array(0), applied[i] ?? new Float64Array(0))) / 2

      data[i * b + j] = s
      data[j * b + i] = s
    }
  }

  const eig = eigSymmetric({ matrix: { form: 'dense', rows: b, cols: b, data } })
  const rotate = (vs: Float64Array[]): Float64Array[] =>
    Array.from({ length: b }, (_, j) => {
      const out = new Float64Array(grid.size)

      for (let i = 0; i < b; i++) {
        const c = eig.vectors[i * b + j] ?? 0

        if (c !== 0) {
          axpy(out, c, vs[i] ?? new Float64Array(0))
        }
      }

      return out
    })

  return { block: rotate(block), applied: rotate(applied), values: Array.from(eig.values) }
}

export type States = {
  // ascending, the wanted states first, then the block's buffer
  readonly values: number[]
  readonly vectors: Float64Array[]
  // residual norms |H v - e v| of the wanted states
  readonly residuals: number[]
  readonly iterations: number
}

export function lowestStates(input: {
  grid: Grid
  potential: Float64Array
  count: number
  // buffer vectors beyond the wanted ones
  extra?: number
  start?: readonly Float64Array[]
  tolerance?: number
  maxIterations?: number
  degree?: number
  // a symmetry projector, applied to every vector after each filter
  project?: (v: Float64Array) => void
}): States {
  const { grid, potential, count } = input
  const extra = Math.max(2, input.extra ?? 4)
  const b = count + extra
  const tolerance = input.tolerance ?? 1e-7
  const maxIterations = input.maxIterations ?? 200
  const degree = input.degree ?? 10
  const fresh = (j: number): Float64Array => weylUnitVector({ dimension: grid.size, start: j + 1 })
  const top = maxOf(potential) + BAND_TOP + 1e-9

  let block = Array.from({ length: b }, (_, j) => (input.start?.[j] ? Float64Array.from(input.start[j] ?? []) : fresh(j)))

  block.forEach(v => input.project?.(v))
  orthonormalize(block, fresh, input.project)

  let rr = rayleighRitz(grid, potential, block)
  let residuals: number[] = []
  let iterations = 0

  for (; iterations <= maxIterations; iterations++) {
    residuals = Array.from({ length: count }, (_, j) => {
      const v = rr.block[j] ?? new Float64Array(0)
      const hv = rr.applied[j] ?? new Float64Array(0)
      const e = rr.values[j] ?? 0

      let s = 0

      for (let k = 0; k < grid.size; k++) {
        s += ((hv[k] ?? 0) - e * (v[k] ?? 0)) ** 2
      }

      return Math.sqrt(s)
    })

    if (residuals.every(r => r < tolerance) || iterations === maxIterations) {
      break
    }

    // the Chebyshev filter that damps [cut, top] and amplifies below it, scaled at the lowest Ritz value
    const cut = rr.values[b - 1] ?? 0
    const low = Math.min(rr.values[0] ?? 0, cut - 1e-3)
    const e = (top - cut) / 2
    const c = (top + cut) / 2

    let sigma = e / (low - c)

    const gamma = 2 / sigma

    let previous = rr.block
    let current = rr.applied.map((hv, j) => {
      const v = previous[j] ?? new Float64Array(0)
      const out = new Float64Array(grid.size)

      const f = sigma / e

      for (let k = 0; k < grid.size; k++) {
        out[k] = (hv[k]! - c * v[k]!) * f
      }

      return out
    })

    for (let d = 2; d <= degree; d++) {
      const sigma2 = 1 / (gamma - sigma)
      const hy = applyHamiltonian(grid, potential, current)
      const next = hy.map((h, j) => {
        const y = current[j] ?? new Float64Array(0)
        const x = previous[j] ?? new Float64Array(0)
        const out = new Float64Array(grid.size)
        const f = (2 * sigma2) / e
        const g = sigma * sigma2

        for (let k = 0; k < grid.size; k++) {
          out[k] = f * (h[k]! - c * y[k]!) - g * x[k]!
        }

        return out
      })

      previous = current
      current = next
      sigma = sigma2
    }

    block = current
    block.forEach(v => input.project?.(v))
    orthonormalize(block, fresh, input.project)
    rr = rayleighRitz(grid, potential, block)
  }

  return { values: rr.values, vectors: rr.block, residuals, iterations }
}

// ---------------------------------------------------------------------------------------------------------
// the open-boundary Poisson solve (Hockney)

export type Poisson = { readonly side: number; readonly big: number; readonly kernel: Float64Array; readonly re: Float64Array; readonly im: Float64Array }

const POISSONS = new Map<number, Poisson>()

export function makePoisson(side: number): Poisson {
  const cached = POISSONS.get(side)

  if (cached) {
    return cached
  }

  const big = 2 * side
  const re = new Float64Array(big ** 3)
  const im = new Float64Array(big ** 3)
  const signed = (a: number): number => (a < side ? a : a - big)

  for (let c = 0; c < big; c++) {
    for (let b = 0; b < big; b++) {
      for (let a = 0; a < big; a++) {
        re[a + big * (b + big * c)] = greenInfinite(signed(a), signed(b), signed(c))
      }
    }
  }

  fft3(re, im, big, false)

  const poisson = { side, big, kernel: Float64Array.from(re), re: new Float64Array(big ** 3), im: new Float64Array(big ** 3) }

  POISSONS.set(side, poisson)

  return poisson
}

// phi = G * rho for one or two densities at once (without the coupling kappa)
export function solvePoisson(poisson: Poisson, a: Float64Array, b?: Float64Array): [Float64Array, Float64Array | undefined] {
  const { side, big, re, im, kernel } = poisson

  re.fill(0)
  im.fill(0)

  for (let z = 0; z < side; z++) {
    for (let y = 0; y < side; y++) {
      for (let x = 0; x < side; x++) {
        const i = x + side * (y + side * z)
        const j = x + big * (y + big * z)

        re[j] = a[i] ?? 0
        im[j] = b ? (b[i] ?? 0) : 0
      }
    }
  }

  fft3(re, im, big, false)

  for (let i = 0; i < re.length; i++) {
    re[i] = (re[i] ?? 0) * (kernel[i] ?? 0)
    im[i] = (im[i] ?? 0) * (kernel[i] ?? 0)
  }

  fft3(re, im, big, true)

  const outA = new Float64Array(side ** 3)
  const outB = b ? new Float64Array(side ** 3) : undefined

  for (let z = 0; z < side; z++) {
    for (let y = 0; y < side; y++) {
      for (let x = 0; x < side; x++) {
        const i = x + side * (y + side * z)
        const j = x + big * (y + big * z)

        outA[i] = re[j] ?? 0

        if (outB) {
          outB[i] = im[j] ?? 0
        }
      }
    }
  }

  return [outA, outB]
}

// ---------------------------------------------------------------------------------------------------------
// the mean field

export type MeanField = 'none' | 'hartree' | 'fermi-amaldi'

// the occupations: `electrons` stand-ins into the levels in order, `capacity` per orbital, an exactly or
// nearly degenerate group (within `tolerance`) sharing what reaches it equally
export function occupy(values: readonly number[], electrons: number, capacity: number, tolerance: number): number[] {
  const occupations = values.map(() => 0)

  let left = electrons
  let i = 0

  while (left > 1e-12) {
    if (i >= values.length) {
      throw new Error(`${electrons} stand-ins do not fit in ${values.length} orbitals of capacity ${capacity}`)
    }

    let k = i + 1

    while (k < values.length && Math.abs((values[k] ?? 0) - (values[k - 1] ?? 0)) < tolerance) {
      k++
    }

    const put = Math.min(left, capacity * (k - i))

    for (let j = i; j < k; j++) {
      occupations[j] = put / (k - i)
    }

    left -= put
    i = k
  }

  return occupations
}

export type Scf = {
  readonly values: number[]
  readonly orbitals: Float64Array[]
  readonly occupations: number[]
  readonly density: Float64Array
  // the effective potential of the last cycle, external plus mean field
  readonly potential: Float64Array
  readonly external: Float64Array
  // the mean-field energy: sum f <T + v_ext> + (scale / 2) kappa <n G n> + nuclear
  readonly energy: number
  readonly nuclear: number
  readonly cycles: number
  readonly converged: boolean
  // the residual |n_out - n_in|_1 / N of the last cycle
  readonly residual: number
  // the deepest effective potential, to hold against the band gap 2 pi / 3
  readonly deepest: number
  // the whole block, to warm-start the next run
  readonly block: Float64Array[]
}

export function selfConsistent(input: {
  grid: Grid
  poisson: Poisson
  units: Units
  nuclei: readonly Nucleus[]
  electrons: number
  // stand-ins per orbital: 1 spinless fermions, 2 a two-valued label put in by hand, 3 the role, N bosons
  capacity: number
  field: MeanField
  // orbitals beyond the occupied ones, converged, and buffer beyond those
  spare?: number
  buffer?: number
  start?: readonly Float64Array[]
  maxCycles?: number
  tolerance?: number
  degenerate?: number
}): Scf {
  const { grid, poisson, units, nuclei, electrons, capacity, field } = input
  const external = externalPotential({ grid, units, nuclei })
  const nuclear = nuclearRepulsion(units, nuclei)
  const count = Math.ceil(electrons / capacity - 1e-9) + (input.spare ?? 4)
  const buffer = input.buffer ?? 4
  const scale = field === 'none' ? 0 : field === 'hartree' ? 1 : (electrons - 1) / electrons
  const tolerance = input.tolerance ?? 1e-6
  const maxCycles = input.maxCycles ?? 40
  const degenerate = input.degenerate ?? 1e-6
  const mix = 0.4
  const history: { input: Float64Array; residual: Float64Array }[] = []

  let block: Float64Array[] | undefined = input.start ? input.start.map(v => Float64Array.from(v)) : undefined
  let density = new Float64Array(grid.size)
  let potential = Float64Array.from(external)
  let states: States | undefined
  let occupations: number[] = []
  let residual = Number.POSITIVE_INFINITY
  let cycles = 0
  let converged = false

  // the first density, from the start orbitals if given
  const densityOf = (vectors: readonly Float64Array[], occ: readonly number[]): Float64Array => {
    const n = new Float64Array(grid.size)

    occ.forEach((f, j) => {
      const v = vectors[j] ?? new Float64Array(0)

      if (f > 0) {
        for (let k = 0; k < grid.size; k++) {
          n[k] = (n[k] ?? 0) + f * (v[k] ?? 0) ** 2
        }
      }
    })

    return n
  }

  const meanField = (n: Float64Array): Float64Array => {
    const out = Float64Array.from(external)

    if (scale !== 0) {
      const [phi] = solvePoisson(poisson, n)

      for (let k = 0; k < grid.size; k++) {
        out[k] = (out[k] ?? 0) + scale * units.kappa * (phi[k] ?? 0)
      }
    }

    return out
  }

  if (scale !== 0 && block) {
    const warm = lowestStates({ grid, potential: external, count, extra: buffer, start: block, maxIterations: 0 })

    density = densityOf(warm.vectors, occupy(warm.values.slice(0, count), electrons, capacity, degenerate))
  }

  for (cycles = 1; cycles <= maxCycles; cycles++) {
    potential = meanField(density)
    states = lowestStates({ grid, potential, count, extra: buffer, start: block, maxIterations: scale === 0 ? 400 : 3, degree: 8, tolerance: 1e-6 })
    block = states.vectors
    occupations = occupy(states.values.slice(0, count), electrons, capacity, degenerate)

    const out = densityOf(states.vectors, occupations)
    const r = Float64Array.from(out, (x, k) => x - (density[k] ?? 0))

    residual = r.reduce((s, x) => s + Math.abs(x), 0) / electrons

    if (scale === 0 || (residual < tolerance && states.residuals.every(x => x < 1e-6))) {
      converged = true
      density = out
      break
    }

    // Pulay mixing of the density
    history.push({ input: density, residual: r })

    if (history.length > 8) {
      history.shift()
    }

    const m = history.length
    const a: number[][] = Array.from({ length: m + 1 }, (_, i) =>
      Array.from({ length: m + 1 }, (_, j) => (i < m && j < m ? dot(history[i]?.residual ?? r, history[j]?.residual ?? r) : i === m && j === m ? 0 : 1)),
    )
    const rhs = Array.from({ length: m + 1 }, (_, i) => (i === m ? 1 : 0))
    const c = solveSmall(a, rhs).slice(0, m)
    const next = new Float64Array(grid.size)

    c.forEach((w, i) => {
      const h = history[i]

      if (h) {
        for (let k = 0; k < grid.size; k++) {
          next[k] = (next[k] ?? 0) + w * ((h.input[k] ?? 0) + mix * (h.residual[k] ?? 0))
        }
      }
    })

    for (let k = 0; k < grid.size; k++) {
      next[k] = Math.max(0, next[k] ?? 0)
    }

    density = next
  }

  // a tight final solve in the last potential
  potential = meanField(density)
  states = lowestStates({ grid, potential, count, extra: buffer, start: block, tolerance: 1e-7 })
  occupations = occupy(states.values.slice(0, count), electrons, capacity, degenerate)

  const final = densityOf(states.vectors, occupations)
  const [phi] = scale !== 0 ? solvePoisson(poisson, final) : [new Float64Array(grid.size)]
  const hartree = (scale * units.kappa * dot(final, phi)) / 2

  let oneBody = 0

  occupations.forEach((f, j) => {
    const v = states?.vectors[j] ?? new Float64Array(0)

    if (f > 0) {
      oneBody += f * (kineticEnergy(grid, v) + dot(external, Float64Array.from(v, x => x * x)))
    }
  })

  return {
    values: states.values.slice(0, count),
    orbitals: states.vectors.slice(0, count),
    occupations,
    density: final,
    potential,
    external,
    energy: oneBody + hartree + nuclear,
    nuclear,
    cycles,
    converged,
    residual,
    deepest: minOf(potential),
    block: states.vectors,
  }
}

// Gaussian elimination with partial pivoting on a small dense system
export function solveSmall(matrix: number[][], rhs: number[]): number[] {
  const n = rhs.length
  const a = matrix.map((row, i) => [...row, rhs[i] ?? 0])

  for (let col = 0; col < n; col++) {
    let pivot = col

    for (let r = col + 1; r < n; r++) {
      if (Math.abs(a[r]?.[col] ?? 0) > Math.abs(a[pivot]?.[col] ?? 0)) {
        pivot = r
      }
    }

    const swap = a[col]

    a[col] = a[pivot] ?? []
    a[pivot] = swap ?? []

    const p = a[col]?.[col] ?? 0

    if (Math.abs(p) < 1e-300) {
      continue
    }

    for (let r = 0; r < n; r++) {
      if (r !== col) {
        const f = (a[r]?.[col] ?? 0) / p

        for (let k = col; k <= n; k++) {
          const row = a[r]

          if (row) {
            row[k] = (row[k] ?? 0) - f * (a[col]?.[k] ?? 0)
          }
        }
      }
    }
  }

  return Array.from({ length: n }, (_, i) => (a[i]?.[n] ?? 0) / (a[i]?.[i] || 1))
}

// ---------------------------------------------------------------------------------------------------------
// exact two-body integrals

// (ij|kl) = kappa sum_x sum_y phi_i(x) phi_j(x) G(x - y) phi_k(y) phi_l(y) for every i <= j, k <= l, as a
// K^4 table with all eight symmetries filled
export function pairIntegrals(poisson: Poisson, orbitals: readonly Float64Array[], kappa: number): Float64Array {
  const k = orbitals.length
  const size = orbitals[0]?.length ?? 0
  const pairs: [number, number][] = []

  for (let i = 0; i < k; i++) {
    for (let j = i; j < k; j++) {
      pairs.push([i, j])
    }
  }

  const densities = pairs.map(([i, j]) => {
    const a = orbitals[i] ?? new Float64Array(0)
    const b = orbitals[j] ?? new Float64Array(0)

    return Float64Array.from({ length: size }, (_, x) => (a[x] ?? 0) * (b[x] ?? 0))
  })
  const potentials: Float64Array[] = []

  for (let p = 0; p < densities.length; p += 2) {
    const [a, b] = solvePoisson(poisson, densities[p] ?? new Float64Array(size), densities[p + 1])

    potentials.push(a)

    if (b) {
      potentials.push(b)
    }
  }

  const table = new Float64Array(k ** 4)

  pairs.forEach(([i, j], p) => {
    pairs.forEach(([m, n], q) => {
      if (q < p) {
        return
      }

      const value = (kappa * (dot(densities[q] ?? new Float64Array(0), potentials[p] ?? new Float64Array(0)) + dot(densities[p] ?? new Float64Array(0), potentials[q] ?? new Float64Array(0)))) / 2

      for (const [a, b] of [
        [i, j],
        [j, i],
      ] as const) {
        for (const [c, d] of [
          [m, n],
          [n, m],
        ] as const) {
          table[((a * k + b) * k + c) * k + d] = value
          table[((c * k + d) * k + a) * k + b] = value
        }
      }
    })
  })

  return table
}

// the exact Hartree-Fock energy of the determinant of `orbitals` (each once, one kind of stand-in):
// sum h_ii + 1/2 sum_ij [(ii|jj) - (ij|ij)] + nuclear, an upper bound on the fermion ground state
export function hartreeFockEnergy(input: { grid: Grid; poisson: Poisson; units: Units; external: Float64Array; nuclear: number; orbitals: readonly Float64Array[] }): {
  oneBody: number
  hartree: number
  exchange: number
  total: number
} {
  const { grid, poisson, units, external, orbitals } = input
  const n = orbitals.length

  let oneBody = 0

  for (const v of orbitals) {
    oneBody += kineticEnergy(grid, v) + dot(external, Float64Array.from(v, x => x * x))
  }

  const table = pairIntegrals(poisson, orbitals, units.kappa)

  let hartree = 0
  let exchange = 0

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      hartree += (table[((i * n + i) * n + j) * n + j] ?? 0) / 2
      exchange -= (table[((i * n + j) * n + i) * n + j] ?? 0) / 2
    }
  }

  return { oneBody, hartree, exchange, total: oneBody + hartree + exchange + input.nuclear }
}

// ---------------------------------------------------------------------------------------------------------
// two stand-ins in a basis of K orbitals: the full two-body Hamiltonian, and its symmetric and antisymmetric
// spatial sectors

export function twoBodySpectrum(input: { oneBody: readonly number[]; integrals: Float64Array; k: number }): {
  distinguishable: number[]
  symmetric: number[]
  antisymmetric: number[]
} {
  const { oneBody, integrals, k } = input
  const d = k * k
  const full = new Float64Array(d * d)

  // H_(ab),(cd) = h_ac delta_bd + delta_ac h_bd + (ac|bd), the orbitals being eigenstates of h
  for (let a = 0; a < k; a++) {
    for (let b = 0; b < k; b++) {
      for (let c = 0; c < k; c++) {
        for (let e = 0; e < k; e++) {
          let value = integrals[((a * k + c) * k + b) * k + e] ?? 0

          if (a === c && b === e) {
            value += (oneBody[a] ?? 0) + (oneBody[b] ?? 0)
          }

          full[(a * k + b) * d + (c * k + e)] = value
        }
      }
    }
  }

  const sector = (sign: 1 | -1): number[] => {
    const basis: [number, number][] = []

    for (let a = 0; a < k; a++) {
      for (let b = sign === 1 ? a : a + 1; b < k; b++) {
        basis.push([a, b])
      }
    }

    const m = basis.length
    const data = new Float64Array(m * m)
    const norm = ([a, b]: [number, number]): number => (a === b ? 0.5 : 1 / Math.SQRT2)

    basis.forEach((p, i) =>
      basis.forEach((q, j) => {
        const [a, b] = p
        const [c, e] = q
        const at = (x: number, y: number, z: number, w: number): number => full[(x * k + y) * d + (z * k + w)] ?? 0

        data[i * m + j] = norm(p) * norm(q) * (at(a, b, c, e) + sign * at(a, b, e, c) + sign * at(b, a, c, e) + at(b, a, e, c))
      }),
    )

    return Array.from(eigSymmetric({ matrix: { form: 'dense', rows: m, cols: m, data } }).values)
  }

  return {
    distinguishable: Array.from(eigSymmetric({ matrix: { form: 'dense', rows: d, cols: d, data: full } }).values),
    symmetric: sector(1),
    antisymmetric: sector(-1),
  }
}

// ---------------------------------------------------------------------------------------------------------
// the character of an orbital about a nucleus

const SHELLS = new Map<string, { shell: Int32Array; counts: number[] }>()

// every dock's shell |x - c|^2 about the center (minimum image)
function shellsOf(side: number, center: Point): { shell: Int32Array; counts: number[] } {
  const key = `${side}:${center.join(',')}`
  const cached = SHELLS.get(key)

  if (cached) {
    return cached
  }

  const shell = new Int32Array(side ** 3)
  const counts: number[] = []

  for (let i = 0; i < side ** 3; i++) {
    const [x, y, z] = displacement(side, i, center)
    const s = x * x + y * y + z * z

    shell[i] = s
    counts[s] = (counts[s] ?? 0) + 1
  }

  const out = { shell, counts }

  SHELLS.set(key, out)

  return out
}

export type Character = {
  // <v | v(2c - x)>: +1 even, -1 odd
  readonly parity: number
  // the share of the norm in the spherical average on each shell |x - c|^2 = s: 1 for a pure s orbital in
  // the continuum, 0 for any l > 0
  readonly sFraction: number
  // the orbital's mean radius about the center
  readonly radius: number
}

export function orbitalCharacter(side: number, center: Point, v: Float64Array): Character {
  const { shell, counts } = shellsOf(side, center)
  const sums: number[] = []

  let parity = 0
  let norm = 0
  let radius = 0

  for (let i = 0; i < v.length; i++) {
    const [x, y, z] = displacement(side, i, center)
    const mirror = indexOf(side, [
      (((center[0] - x) % side) + side) % side,
      (((center[1] - y) % side) + side) % side,
      (((center[2] - z) % side) + side) % side,
    ])
    const s = shell[i] ?? 0

    parity += (v[i] ?? 0) * (v[mirror] ?? 0)
    norm += (v[i] ?? 0) ** 2
    radius += (v[i] ?? 0) ** 2 * Math.sqrt(s)
    sums[s] = (sums[s] ?? 0) + (v[i] ?? 0)
  }

  let average = 0

  sums.forEach((sum, s) => {
    average += (sum * sum) / (counts[s] ?? 1)
  })

  return { parity: parity / norm, sFraction: average / norm, radius: radius / norm }
}
