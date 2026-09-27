// The overlap fermion's near-zero density on a 2D lattice with a chosen TIME boundary for the fermion, in a
// U(1) or an SU(2) background: the rebuilt free control of E-FRC-0045 and E-FRC-0048.
//
// code/operator/overlap-condensate (U(1)) and code/operator/overlap-su2 (SU(2)) fix the fermion periodic in
// both directions, so the free massless overlap has exact zero modes at p = 0 (E-FRC-0178). A fermion is
// antiperiodic in Euclidean time in the standard construction: every hop across the last time slice carries
// a factor -1, the momenta in time are (2 n + 1) pi / L, p = 0 is never reached, and the free overlap has no
// zero mode at all. The factor is the fermion's, not the gauge field's: the plaquettes, and so the U(1)
// topological charge, are read from the links alone.
//
// The gauge links are drawn exactly as the shared operators draw them, from the same Weyl stream in the
// same order (U(1): per site the direction-1 then the direction-2 angle; SU(2): per site a direction-1 then
// a direction-2 quaternion), so with a periodic time boundary this file reproduces their densities.
//
// Layout: the fermion index is site * 2 nc + spin * nc + color, nc = 1 for U(1) and 2 for SU(2), which is
// each shared operator's own layout. D_W = 2 - (1/2) sum_mu [(1 - gamma_mu) U_mu(x) delta_(x+mu) +
// (1 + gamma_mu) U_mu(x - mu)^dagger delta_(x-mu)], gamma_1 = sigma_x, gamma_2 = sigma_y, gamma_5 = sigma_z,
// H_W = gamma_5 (D_W - m0), H_ov = gamma_5 + sign(H_W). The sign is the Newton iteration of
// code/algebra/linear/eig-hermitian.

import { makeComplexMatrix, type ComplexMatrix } from '@/code/algebra/linear/dense'
import { eigHermitian, hermitianMatrixSign } from '@/code/algebra/linear/eig-hermitian'
import { type Weyl } from '@/code/tool/weyl'

export type TimeBoundary = 'periodic' | 'antiperiodic'
export type OverlapGroup = 'u1' | 'su2'

// a complex nc x nc matrix, row-major
type Link = { re: number[]; im: number[] }

// spin blocks (I -/+ gamma_mu), row-major 2 x 2
const SPIN_MINUS_X: Link = { re: [1, -1, -1, 1], im: [0, 0, 0, 0] }
const SPIN_PLUS_X: Link = { re: [1, 1, 1, 1], im: [0, 0, 0, 0] }
const SPIN_MINUS_Y: Link = { re: [1, 0, 0, 1], im: [0, 1, -1, 0] }
const SPIN_PLUS_Y: Link = { re: [1, 0, 0, 1], im: [0, -1, 1, 0] }

export const EXACT_ZERO = 1e-8

function dagger(u: Link, nc: number): Link {
  const re: number[] = []
  const im: number[] = []

  for (let i = 0; i < nc; i++) {
    for (let j = 0; j < nc; j++) {
      re.push(u.re[j * nc + i]!)
      im.push(-u.im[j * nc + i]!)
    }
  }

  return { re, im }
}

function scale(u: Link, factor: number): Link {
  return { re: u.re.map(x => x * factor), im: u.im.map(x => x * factor) }
}

// the SU(2) matrix of a unit quaternion, U = q0 + i q . sigma, as code/operator/overlap-su2 builds it
function su2(q: readonly number[]): Link {
  const [q0 = 1, q1 = 0, q2 = 0, q3 = 0] = q

  return { re: [q0, q2, -q2, q0], im: [q3, q1, q1, -q3] }
}

function drawLinks(input: { group: OverlapGroup; length: number; disorder: number; rng: Weyl }): { links: [Link, Link][]; angles: [number, number][] } {
  const sites = input.length * input.length
  const links: [Link, Link][] = []
  const angles: [number, number][] = []

  for (let s = 0; s < sites; s++) {
    if (input.group === 'u1') {
      const a1 = (input.rng.next() * 2 - 1) * Math.PI * input.disorder
      const a2 = (input.rng.next() * 2 - 1) * Math.PI * input.disorder

      angles.push([a1, a2])
      links.push([
        { re: [Math.cos(a1)], im: [Math.sin(a1)] },
        { re: [Math.cos(a2)], im: [Math.sin(a2)] },
      ])
    } else {
      const quaternion = (): number[] => {
        const q1 = (input.rng.next() * 2 - 1) * input.disorder
        const q2 = (input.rng.next() * 2 - 1) * input.disorder
        const q3 = (input.rng.next() * 2 - 1) * input.disorder
        const norm = Math.hypot(1, q1, q2, q3)

        return [1 / norm, q1 / norm, q2 / norm, q3 / norm]
      }
      const first = quaternion()
      const second = quaternion()

      links.push([su2(first), su2(second)])
    }
  }

  return { links, angles }
}

// the U(1) topological charge, sum over plaquettes of the principal plaquette angle over 2 pi
export function topologicalChargeU1(angles: readonly [number, number][], length: number): number {
  const site = (a: number, b: number): number => ((a + length) % length) + ((b + length) % length) * length
  let total = 0

  for (let n1 = 0; n1 < length; n1++) {
    for (let n2 = 0; n2 < length; n2++) {
      const theta = angles[site(n1, n2)]![0] + angles[site(n1 + 1, n2)]![1] - angles[site(n1, n2 + 1)]![0] - angles[site(n1, n2)]![1]
      const principal = theta - 2 * Math.PI * Math.round(theta / (2 * Math.PI))

      total += principal
    }
  }

  return Math.round(total / (2 * Math.PI))
}

function addHop(m: ComplexMatrix, nc: number, row: number, col: number, spin: Link, color: Link, coefficient: number): void {
  const n = m.rows
  const width = 2 * nc

  for (let si = 0; si < 2; si++) {
    for (let sj = 0; sj < 2; sj++) {
      const spRe = spin.re[si * 2 + sj]!
      const spIm = spin.im[si * 2 + sj]!

      for (let ci = 0; ci < nc; ci++) {
        for (let cj = 0; cj < nc; cj++) {
          const coRe = color.re[ci * nc + cj]!
          const coIm = color.im[ci * nc + cj]!
          const r = row * width + si * nc + ci
          const c = col * width + sj * nc + cj

          m.re[r * n + c] = (m.re[r * n + c] ?? 0) + coefficient * (spRe * coRe - spIm * coIm)
          m.im[r * n + c] = (m.im[r * n + c] ?? 0) + coefficient * (spRe * coIm + spIm * coRe)
        }
      }
    }
  }
}

// H_W = gamma_5 (D_W - m0) for one background and one time boundary
export function wilsonHermitian(input: { group: OverlapGroup; length: number; links: readonly [Link, Link][]; m0: number; time: TimeBoundary }): ComplexMatrix {
  const L = input.length
  const nc = input.group === 'u1' ? 1 : 2
  const n = 2 * nc * L * L
  const d = makeComplexMatrix({ rows: n, cols: n })
  const site = (a: number, b: number): number => ((a + L) % L) + ((b + L) % L) * L
  const identity: Link = nc === 1 ? { re: [1], im: [0] } : { re: [1, 0, 0, 1], im: [0, 0, 0, 0] }
  const sign = input.time === 'antiperiodic' ? -1 : 1

  for (let n1 = 0; n1 < L; n1++) {
    for (let n2 = 0; n2 < L; n2++) {
      const x = site(n1, n2)

      addHop(d, nc, x, x, { re: [1, 0, 0, 1], im: [0, 0, 0, 0] }, identity, 2 - input.m0)
      addHop(d, nc, x, site(n1 + 1, n2), SPIN_MINUS_X, input.links[x]![0], -0.5)
      addHop(d, nc, x, site(n1 - 1, n2), SPIN_PLUS_X, dagger(input.links[site(n1 - 1, n2)]![0], nc), -0.5)
      // a hop across the last time slice carries the fermion's boundary sign
      addHop(d, nc, x, site(n1, n2 + 1), SPIN_MINUS_Y, scale(input.links[x]![1], n2 === L - 1 ? sign : 1), -0.5)
      addHop(d, nc, x, site(n1, n2 - 1), SPIN_PLUS_Y, scale(dagger(input.links[site(n1, n2 - 1)]![1], nc), n2 === 0 ? sign : 1), -0.5)
    }
  }

  // gamma_5 on the left: negate the spin-down rows
  const width = 2 * nc

  for (let row = 0; row < n; row++) {
    if (row % width >= nc) {
      for (let col = 0; col < n; col++) {
        d.re[row * n + col] = -(d.re[row * n + col] ?? 0)
        d.im[row * n + col] = -(d.im[row * n + col] ?? 0)
      }
    }
  }

  return d
}

export type BoundaryCondensate = {
  readonly nearZeroDensity: number
  // eigenvalues of H_ov with |lambda| < EXACT_ZERO, summed over configurations
  readonly exactZeroModes: number
  // sum over configurations of |Q| (U(1) only, 0 for SU(2))
  readonly absoluteCharge: number
  // the smallest |lambda| over all configurations
  readonly lowestEigenvalue: number
}

export function overlapCondensateWithBoundary(input: {
  group: OverlapGroup
  length: number
  disorder: number
  configs: number
  m0: number
  tolerance: number
  time: TimeBoundary
  rng: Weyl
}): BoundaryCondensate {
  const nc = input.group === 'u1' ? 1 : 2
  const n = 2 * nc * input.length * input.length
  let near = 0
  let total = 0
  let exact = 0
  let charge = 0
  let lowest = Number.POSITIVE_INFINITY

  for (let c = 0; c < input.configs; c++) {
    const { links, angles } = drawLinks(input)
    const hw = wilsonHermitian({ group: input.group, length: input.length, links, m0: input.m0, time: input.time })
    const overlap = hermitianMatrixSign({ matrix: hw })

    for (let i = 0; i < n; i++) {
      overlap.re[i * n + i] = (overlap.re[i * n + i] ?? 0) + (i % (2 * nc) < nc ? 1 : -1)
    }

    for (const value of eigHermitian({ matrix: overlap }).values) {
      const a = Math.abs(value)

      near += a < input.tolerance ? 1 : 0
      exact += a < EXACT_ZERO ? 1 : 0
      lowest = Math.min(lowest, a)
      total++
    }

    if (input.group === 'u1') {
      charge += Math.abs(topologicalChargeU1(angles, input.length))
    }
  }

  return { nearZeroDensity: near / total, exactZeroModes: exact, absoluteCharge: charge, lowestEigenvalue: lowest }
}

// the free overlap's eigenvalues +/- sqrt(2 (1 + a / w)) per momentum, a = sum (1 - cos p) - m0,
// w = sqrt(sum sin^2 p + a^2), with time momenta 2 pi n / L (periodic) or (2 n + 1) pi / L (antiperiodic);
// returns the near-zero density at the tolerance and the smallest |lambda|
export function freeOverlapSpectrum(input: { length: number; m0: number; tolerance: number; time: TimeBoundary }): { density: number; lowest: number } {
  const L = input.length
  let near = 0
  let total = 0
  let lowest = Number.POSITIVE_INFINITY

  for (let k1 = 0; k1 < L; k1++) {
    for (let k2 = 0; k2 < L; k2++) {
      const p = [(2 * Math.PI * k1) / L, ((2 * k2 + (input.time === 'antiperiodic' ? 1 : 0)) * Math.PI) / L]
      const a = p.reduce((s, x) => s + 1 - Math.cos(x), 0) - input.m0
      const w = Math.sqrt(p.reduce((s, x) => s + Math.sin(x) ** 2, 0) + a * a)
      const lambda = Math.sqrt(Math.max(0, 2 * (1 + a / w)))

      near += lambda < input.tolerance ? 2 : 0
      total += 2
      lowest = Math.min(lowest, lambda)
    }
  }

  return { density: near / total, lowest }
}
