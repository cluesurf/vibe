// Kogut-Susskind staggered quarks on a lattice gauge field. One colour vector per site, the Dirac
// structure spread across the corners of each 2^d hypercube by the phases
//
//   eta_mu(x) = (-1)^(x_0 + ... + x_{mu - 1})
//
// so the operator is M = m + D with the hopping term
//
//   (D psi)(x) = (1 / 2) sum_mu eta_mu(x) [U_mu(x) psi(x + mu) - U_mu(x - mu)^dag psi(x - mu)]
//
// D is anti-Hermitian and connects only sites of opposite parity, so M^dag M = m^2 - D^2 is
// Hermitian, positive and block diagonal on the even and odd sublattices. At m = 0 the action keeps
// an exact U(1) remnant of chiral symmetry (psi -> exp(i theta epsilon(x)) psi, epsilon the site
// parity), which is what lets the pion be a Goldstone boson on the lattice.
//
// Fermions are antiperiodic in time (the last axis), the boundary condition of a thermal trace
// over fermion states. That sign rides on the time-like hops that wrap around.

import { GaugeLattice, linkSlot } from '@/code/dynamics/gauge-lattice'
import { siteCoordinates } from '@/code/tool/hypercubic'
import {
  LinearMap,
  multiShiftConjugateGradient,
} from '@/code/algebra/linear/conjugate-gradient'

export type StaggeredOperator = {
  readonly form: 'staggered-operator'
  readonly lattice: GaugeLattice
  // eta_mu(x) times the antiperiodic sign, for the forward hop x -> x + mu and the backward hop
  // x -> x - mu
  readonly forwardSign: Int8Array
  readonly backwardSign: Int8Array
  // (-1)^(sum of coordinates)
  readonly parity: Int8Array
}

export function makeStaggeredOperator(input: {
  lattice: GaugeLattice
}): StaggeredOperator {
  const { lattice } = input
  const { geometry } = lattice
  const { dim, sites, lengths } = geometry
  const timeAxis = dim - 1
  const forwardSign = new Int8Array(sites * dim)
  const backwardSign = new Int8Array(sites * dim)
  const parity = new Int8Array(sites)

  for (let site = 0; site < sites; site++) {
    const x = siteCoordinates({ lattice: geometry, site })

    let sum = 0

    for (let mu = 0; mu < dim; mu++) {
      const eta = sum % 2 === 0 ? 1 : -1
      const length = lengths[mu] ?? 1
      const wrapsForward = mu === timeAxis && x[mu] === length - 1
      const wrapsBackward = mu === timeAxis && x[mu] === 0

      forwardSign[site * dim + mu] = wrapsForward ? -eta : eta
      backwardSign[site * dim + mu] = wrapsBackward ? -eta : eta
      sum += x[mu] ?? 0
    }

    parity[site] = sum % 2 === 0 ? 1 : -1
  }

  return {
    form: 'staggered-operator',
    lattice,
    forwardSign,
    backwardSign,
    parity,
  }
}

// out = D from, the hopping term alone (no mass). Colour vectors are 2 * N doubles per site.
export function applyStaggeredHopping(input: {
  operator: StaggeredOperator
  from: Float64Array
  out: Float64Array
}): void {
  const { operator, from, out } = input
  const { lattice, forwardSign, backwardSign } = operator
  const { n, geometry } = lattice
  const { dim, sites, up, down } = geometry
  const links = lattice.links
  const matrix = 2 * n * n
  const vector = 2 * n

  out.fill(0)

  for (let site = 0; site < sites; site++) {
    const o = site * vector

    for (let mu = 0; mu < dim; mu++) {
      const forward = up[site * dim + mu] ?? 0
      const backward = down[site * dim + mu] ?? 0
      const forwardLink = linkSlot({ lattice, site, mu }).offset
      const backwardLink = (backward * dim + mu) * matrix
      const fs = 0.5 * (forwardSign[site * dim + mu] ?? 0)
      const bs = 0.5 * (backwardSign[site * dim + mu] ?? 0)
      const fo = forward * vector
      const bo = backward * vector

      for (let a = 0; a < n; a++) {
        let re = 0
        let im = 0

        for (let b = 0; b < n; b++) {
          // U_mu(x)_ab psi(x + mu)_b
          const u = forwardLink + 2 * (a * n + b)
          const ur = links[u] ?? 0
          const ui = links[u + 1] ?? 0
          const pr = from[fo + 2 * b] ?? 0
          const pi = from[fo + 2 * b + 1] ?? 0

          re += fs * (ur * pr - ui * pi)
          im += fs * (ur * pi + ui * pr)

          // - (U_mu(x - mu)^dag)_ab psi(x - mu)_b = - conj(U_mu(x - mu)_ba) psi(x - mu)_b
          const v = backwardLink + 2 * (b * n + a)
          const vr = links[v] ?? 0
          const vi = -(links[v + 1] ?? 0)
          const qr = from[bo + 2 * b] ?? 0
          const qi = from[bo + 2 * b + 1] ?? 0

          re -= bs * (vr * qr - vi * qi)
          im -= bs * (vr * qi + vi * qr)
        }

        out[o + 2 * a] = (out[o + 2 * a] ?? 0) + re
        out[o + 2 * a + 1] = (out[o + 2 * a + 1] ?? 0) + im
      }
    }
  }
}

// The quark propagator G = M^-1 from one point source (site, colour) for several bare masses at
// once. Solves (m^2 - D^2) y = source by multi-shift conjugate gradient, then G = (m - D) y, which is
// M^-1 because M (m - D) = m^2 - D^2. Returns one full-lattice colour field per mass.
export function staggeredPropagator(input: {
  operator: StaggeredOperator
  site: number
  colour: number
  masses: readonly number[]
  tolerance: number
  maxIterations: number
}): {
  propagators: Float64Array[]
  iterations: number
  residuals: number[]
} {
  const { operator, masses } = input
  const { lattice } = operator
  const vector = 2 * lattice.n
  const length = lattice.geometry.sites * vector
  const scratch = new Float64Array(length)
  const source = new Float64Array(length)

  source[input.site * vector + 2 * input.colour] = 1

  // -D^2, Hermitian and positive
  const minusHoppingSquared: LinearMap = ({ from, out }) => {
    applyStaggeredHopping({ operator, from, out: scratch })
    applyStaggeredHopping({ operator, from: scratch, out })

    for (let k = 0; k < length; k++) {
      out[k] = -(out[k] ?? 0)
    }
  }

  const solved = multiShiftConjugateGradient({
    apply: minusHoppingSquared,
    source,
    shifts: masses.map(mass => mass * mass),
    tolerance: input.tolerance,
    maxIterations: input.maxIterations,
  })

  const propagators = solved.solutions.map((y, index) => {
    const mass = masses[index] ?? 0
    const g = new Float64Array(length)

    applyStaggeredHopping({ operator, from: y, out: g })

    for (let k = 0; k < length; k++) {
      g[k] = mass * (y[k] ?? 0) - (g[k] ?? 0)
    }

    return g
  })

  return {
    propagators,
    iterations: solved.iterations,
    residuals: solved.residuals,
  }
}

// |M G - source| / |source| for a propagator, the independent check that G really inverts M.
export function staggeredResidual(input: {
  operator: StaggeredOperator
  propagator: Float64Array
  mass: number
  site: number
  colour: number
}): number {
  const { operator, propagator, mass } = input
  const vector = 2 * operator.lattice.n
  const out = new Float64Array(propagator.length)

  applyStaggeredHopping({ operator, from: propagator, out })

  let norm = 0

  for (let k = 0; k < out.length; k++) {
    const source = k === input.site * vector + 2 * input.colour ? 1 : 0
    const difference =
      mass * (propagator[k] ?? 0) + (out[k] ?? 0) - source

    norm += difference * difference
  }

  return Math.sqrt(norm)
}
