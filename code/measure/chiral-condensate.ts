// The chiral condensate <psi-bar psi> of staggered quarks on a gauge configuration, the order
// parameter of chiral symmetry breaking. Here it is Sigma(m) = (1 / V) Re Tr M^-1, the trace over
// sites and colors, for the staggered operator M = m + D of one staggered field (four tastes).
//
// No noise is used. The ensemble is translation invariant, so the expected diagonal of the quark
// propagator is the same at every site, and Sigma is the color trace of G(x, x) = M^-1(x, x) at any
// site, averaged over a fixed, deterministic set of source sites and over configurations. One point
// source per color per site, and one multi-shift solve serves every mass. On the free field, which
// is exactly translation invariant, a single site gives the exact answer.
//
// The diagonal needs only the solution of (m^2 - D^2) y = delta_x, since G = (m - D) y and (D y)(x)
// vanishes (D moves y to the other parity), so G(x, x) = m y(x).

import {
  StaggeredOperator,
  staggeredPropagator,
} from '@/code/operator/staggered-fermion'

// Sigma(m) per mass, the color-traced propagator diagonal averaged over `sites`.
export function pointSourceCondensate(input: {
  operator: StaggeredOperator
  masses: readonly number[]
  sites: readonly number[]
  tolerance: number
  maxIterations: number
}): { values: number[]; worstResidual: number } {
  const { operator, masses, sites } = input
  const n = operator.lattice.n
  const totals = masses.map(() => 0)

  let worstResidual = 0

  for (const site of sites) {
    for (let color = 0; color < n; color++) {
      const solved = staggeredPropagator({
        operator,
        site,
        color,
        masses,
        tolerance: input.tolerance,
        maxIterations: input.maxIterations,
      })

      worstResidual = Math.max(worstResidual, ...solved.residuals)

      solved.propagators.forEach((g, index) => {
        totals[index] =
          (totals[index] ?? 0) + (g[site * 2 * n + 2 * color] ?? 0)
      })
    }
  }

  return {
    values: totals.map(total => total / sites.length),
    worstResidual,
  }
}

// The exact condensate of free staggered quarks (every link the identity) on a periodic box with
// antiperiodic time, from the momentum sum Sigma = (N / V) sum_p m / (m^2 + sum_mu sin^2 p_mu),
// the control a measured Sigma is compared to. The staggered D^2 is diagonal in momentum with
// eigenvalue -sum_mu sin^2 p_mu. Spatial momenta 2 pi k / L, temporal (2k + 1) pi / T.
export function freeStaggeredCondensate(input: {
  lengths: readonly number[]
  colors: number
  mass: number
}): number {
  const { lengths, colors, mass } = input
  const dim = lengths.length
  const volume = lengths.reduce((a, b) => a * b, 1)

  let total = 0

  for (let index = 0; index < volume; index++) {
    let rest = index
    let sinSquared = 0

    for (let mu = 0; mu < dim; mu++) {
      const length = lengths[mu] ?? 1
      const k = rest % length

      rest = Math.floor(rest / length)

      const p =
        mu === dim - 1
          ? ((2 * k + 1) * Math.PI) / length
          : (2 * k * Math.PI) / length

      sinSquared += Math.sin(p) ** 2
    }

    total += mass / (mass * mass + sinSquared)
  }

  return (colors * total) / volume
}
