// Dynamical staggered quarks: the gluons feel the quarks. One staggered field (four tastes) of mass
// m enters the gauge weight through its determinant, det M^dag M = det(m^2 - D^2), written on the
// even sites as a Gaussian integral over a pseudofermion field phi:
//
//   S_f = phi^dag K^-1 phi,   K = (m^2 - D^2) restricted to the even sites
//
// Hybrid Monte Carlo (Duane, Kennedy, Pendleton and Roweth 1987) samples exp(-S_gauge - S_f):
// refresh the momenta and phi, integrate the deterministic reversible dynamics of
// gauge-molecular-dynamics with the quark force added, and accept or reject on the change of H.
// The refresh and the accept step are the only draws. Everything between them is the deterministic
// flow, and the accept step makes the result exact whatever the step size.
//
// The quark force on link U_mu(x). With X = K^-1 phi (even sites) and Y = D X (odd sites), varying
// U -> exp(i eps T_a) U gives dS_f / d eps_a = (s / 2) i Tr(T_a (Z - Z^dag)) with
//
//   Z = U Y(x + mu) X(x)^dag - U X(x + mu) Y(x)^dag,   s = eta_mu(x) with the antiperiodic sign,
//
// so the momentum equation gains dP / dt = -(i s / 4) (W - (Tr W / N) 1), W = Z - Z^dag.

import { Rng } from '@/code/tool/rng'
import { GaugeLattice, linkSlot } from '@/code/dynamics/gauge-lattice'
import {
  StaggeredOperator,
  applyStaggeredHopping,
  makeStaggeredOperator,
} from '@/code/operator/staggered-fermion'
import { multiShiftConjugateGradient } from '@/code/algebra/linear/conjugate-gradient'
import { hermitianLogDeterminant } from '@/code/algebra/linear/complex-cholesky'
import { MatrixSlot } from '@/code/algebra/group/unitary-matrix'
import {
  GaugeMomenta,
  kineticEnergy,
  leapfrog,
  makeMomenta,
  setMomentum,
  suGenerators,
  wilsonAction,
} from '@/code/dynamics/gauge-molecular-dynamics'

// X = K^-1 phi on the even sites, by conjugate gradient.
export function solveEven(input: {
  operator: StaggeredOperator
  phi: Float64Array
  mass: number
  tolerance: number
}): { x: Float64Array; iterations: number } {
  const { operator, phi, mass } = input
  const length = phi.length
  const scratch = new Float64Array(length)
  const solved = multiShiftConjugateGradient({
    apply: ({ from, out }) => {
      applyStaggeredHopping({ operator, from, out: scratch })
      applyStaggeredHopping({ operator, from: scratch, out })

      for (let k = 0; k < length; k++) {
        out[k] = -(out[k] ?? 0)
      }
    },
    source: phi,
    shifts: [mass * mass],
    tolerance: input.tolerance,
    maxIterations: 10000,
  })

  return {
    x: solved.solutions[0] ?? new Float64Array(length),
    iterations: solved.iterations,
  }
}

// S_f = Re phi^dag K^-1 phi.
export function fermionAction(input: {
  operator: StaggeredOperator
  phi: Float64Array
  mass: number
  tolerance: number
}): number {
  const { x } = solveEven(input)

  let total = 0

  for (let k = 0; k < x.length; k++) {
    total += (input.phi[k] ?? 0) * (x[k] ?? 0)
  }

  return total
}

// A pseudofermion drawn from exp(-phi^dag K^-1 phi): phi = (M^dag chi) on the even sites, with chi
// a complex Gaussian on every site, <|chi|^2> = 1 per component. Its covariance is
// m^2 + D_eo D_eo^dag = K.
export function refreshPseudofermion(input: {
  operator: StaggeredOperator
  mass: number
  rng: Rng
}): Float64Array {
  const { operator, mass, rng } = input
  const n = operator.lattice.n
  const length = operator.lattice.geometry.sites * 2 * n
  const chi = new Float64Array(length)
  const hopped = new Float64Array(length)

  for (let k = 0; k < length; k++) {
    chi[k] = rng.nextGaussian() / Math.SQRT2
  }

  applyStaggeredHopping({ operator, from: chi, out: hopped })

  const phi = new Float64Array(length)

  for (let site = 0; site < operator.lattice.geometry.sites; site++) {
    if ((operator.parity[site] ?? 0) !== 1) {
      continue
    }

    for (let k = site * 2 * n; k < (site + 1) * 2 * n; k++) {
      // (M^dag chi) = m chi - D chi
      phi[k] = mass * (chi[k] ?? 0) - (hopped[k] ?? 0)
    }
  }

  return phi
}

// The quark force on every link, as Hermitian matrices laid out like the momenta, from X = K^-1 phi.
export function fermionForce(input: {
  operator: StaggeredOperator
  x: Float64Array
}): Float64Array {
  const { operator, x } = input
  const { lattice, forwardSign } = operator
  const { n, geometry } = lattice
  const { dim, sites, up } = geometry
  const size = 2 * n * n
  const y = new Float64Array(x.length)
  const force = new Float64Array(lattice.links.length)
  const z = new Float64Array(size)
  const outer = new Float64Array(size)

  applyStaggeredHopping({ operator, from: x, out: y })

  // outer = a(p) b(q)^dag, color vectors at sites p and q
  const outerProduct = (
    a: Float64Array,
    p: number,
    b: Float64Array,
    q: number,
    sign: number,
  ): void => {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const ar = a[p * 2 * n + 2 * i] ?? 0
        const ai = a[p * 2 * n + 2 * i + 1] ?? 0
        const br = b[q * 2 * n + 2 * j] ?? 0
        const bi = -(b[q * 2 * n + 2 * j + 1] ?? 0)
        const k = 2 * (i * n + j)

        outer[k] = (outer[k] ?? 0) + sign * (ar * br - ai * bi)
        outer[k + 1] = (outer[k + 1] ?? 0) + sign * (ar * bi + ai * br)
      }
    }
  }

  for (let site = 0; site < sites; site++) {
    for (let mu = 0; mu < dim; mu++) {
      const next = up[site * dim + mu] ?? 0
      const s = forwardSign[site * dim + mu] ?? 0

      outer.fill(0)
      // Y(x + mu) X(x)^dag - X(x + mu) Y(x)^dag
      outerProduct(y, next, x, site, 1)
      outerProduct(x, next, y, site, -1)

      // Z = U outer
      const u = linkSlot({ lattice, site, mu })

      for (let a = 0; a < n; a++) {
        for (let b = 0; b < n; b++) {
          let re = 0
          let im = 0

          for (let c = 0; c < n; c++) {
            const ur = u.data[u.offset + 2 * (a * n + c)] ?? 0
            const ui = u.data[u.offset + 2 * (a * n + c) + 1] ?? 0
            const orr = outer[2 * (c * n + b)] ?? 0
            const oi = outer[2 * (c * n + b) + 1] ?? 0

            re += ur * orr - ui * oi
            im += ur * oi + ui * orr
          }

          z[2 * (a * n + b)] = re
          z[2 * (a * n + b) + 1] = im
        }
      }

      // F = -(i s / 4) (W - Tr W / N), W = Z - Z^dag (anti-Hermitian, so F is Hermitian)
      const offset = (site * dim + mu) * size

      let traceImaginary = 0

      for (let a = 0; a < n; a++) {
        traceImaginary += 2 * (z[2 * (a * n + a) + 1] ?? 0)
      }

      for (let a = 0; a < n; a++) {
        for (let b = 0; b < n; b++) {
          // W_ab = Z_ab - conj(Z_ba)
          const wr =
            (z[2 * (a * n + b)] ?? 0) - (z[2 * (b * n + a)] ?? 0)
          const wi =
            (z[2 * (a * n + b) + 1] ?? 0) +
            (z[2 * (b * n + a) + 1] ?? 0) -
            (a === b ? traceImaginary / n : 0)

          // -(i s / 4)(wr + i wi) = (s / 4)(wi - i wr)
          force[offset + 2 * (a * n + b)] = (s / 4) * wi
          force[offset + 2 * (a * n + b) + 1] = -(s / 4) * wr
        }
      }
    }
  }

  return force
}

// ln det K, K = m^2 - D^2 on the even sites, exactly, by dense Cholesky. The quark weight of a gauge
// configuration is det K, so the difference of this number between two configurations is the log
// of their relative weight in the dynamical theory. Only for small boxes: the matrix is
// (V / 2) N on a side.
export function evenLogDeterminant(input: {
  operator: StaggeredOperator
  mass: number
}): number {
  const { operator, mass } = input
  const n = operator.lattice.n
  const sites = operator.lattice.geometry.sites
  const even = Array.from({ length: sites }, (_, s) => s).filter(
    s => (operator.parity[s] ?? 0) === 1,
  )
  const length = sites * 2 * n
  const unit = new Float64Array(length)
  const once = new Float64Array(length)
  const twice = new Float64Array(length)

  return hermitianLogDeterminant({
    size: even.length * n,
    column: (j, out) => {
      const site = even[Math.floor(j / n)] ?? 0
      const color = j % n

      unit.fill(0)
      unit[site * 2 * n + 2 * color] = 1
      applyStaggeredHopping({ operator, from: unit, out: once })
      applyStaggeredHopping({ operator, from: once, out: twice })

      even.forEach((s, index) => {
        for (let c = 0; c < n; c++) {
          const k = s * 2 * n + 2 * c
          const diagonal = index * n + c === j ? mass * mass : 0

          out[2 * (index * n + c)] = diagonal - (twice[k] ?? 0)
          out[2 * (index * n + c) + 1] = -(twice[k + 1] ?? 0)
        }
      })
    },
  })
}

// The leading large-mass (hopping) term of ln det K on the even sites when the time axis has two
// slices: ln det(m^2 - D^2) = const - Tr_e(D^2) / m^2 + O(1 / m^4), and the only part of Tr_e(D^2)
// that a center rotation can change is the path that winds once around the thermal circle, which
// carries the antiperiodic sign. So m^2 times the change of ln det under a rotation must approach
// the change of (1/2) sum over even x of Re Tr P(x), P the Polyakov loop matrix at x, as m grows.
// The check an exact determinant is held to.
export function hoppingWindingTerm(input: {
  lattice: GaugeLattice
}): number {
  const { lattice } = input
  const { n, geometry } = lattice
  const { dim, sites, up, lengths } = geometry
  const timeAxis = dim - 1
  const size = 2 * n * n
  const product = new Float64Array(size)

  if ((lengths[timeAxis] ?? 0) !== 2) {
    return Number.NaN
  }

  let total = 0

  for (let site = 0; site < sites; site++) {
    let parity = 0
    let rest = site

    for (const length of lengths) {
      parity += rest % length
      rest = Math.floor(rest / length)
    }

    if (parity % 2 !== 0) {
      continue
    }

    const next = up[site * dim + timeAxis] ?? 0
    const a = linkSlot({ lattice, site, mu: timeAxis })
    const b = linkSlot({ lattice, site: next, mu: timeAxis })

    // Re Tr (U_t(x) U_t(x + t))
    for (let i = 0; i < n; i++) {
      for (let k = 0; k < n; k++) {
        const ar = a.data[a.offset + 2 * (i * n + k)] ?? 0
        const ai = a.data[a.offset + 2 * (i * n + k) + 1] ?? 0
        const br = b.data[b.offset + 2 * (k * n + i)] ?? 0
        const bi = b.data[b.offset + 2 * (k * n + i) + 1] ?? 0

        product[0] = (product[0] ?? 0) + ar * br - ai * bi
      }
    }

    total += product[0] ?? 0
    product[0] = 0
  }

  return total / 2
}

export type HmcResult = {
  accepted: boolean
  deltaH: number
  iterations: number
}

// One HMC trajectory of length step * steps, with the momenta and the pseudofermion refreshed
// first. `mass` null runs the pure gauge theory through the same integrator.
export function hmcTrajectory(input: {
  lattice: GaugeLattice
  beta: number
  mass: number | null
  step: number
  steps: number
  tolerance: number
  rng: Rng
}): HmcResult {
  const { lattice, beta, mass, rng } = input
  const generators = suGenerators({ n: lattice.n })
  const momenta: GaugeMomenta = makeMomenta({ lattice })
  const links = lattice.geometry.sites * lattice.geometry.dim

  for (let link = 0; link < links; link++) {
    setMomentum({
      momenta,
      link,
      generators,
      components: generators.map(() => rng.nextGaussian()),
    })
  }

  const saved = new Float64Array(lattice.links)
  const operator =
    mass === null ? null : makeStaggeredOperator({ lattice })
  const phi =
    operator === null || mass === null
      ? null
      : refreshPseudofermion({ operator, mass, rng })
  const fermion = (): number =>
    operator === null || phi === null || mass === null
      ? 0
      : fermionAction({
          operator,
          phi,
          mass,
          tolerance: input.tolerance,
        })
  const h0 =
    kineticEnergy({ momenta }) +
    wilsonAction({ lattice, beta }) +
    fermion()

  let force: Float64Array | null = null
  let iterations = 0

  leapfrog({
    lattice,
    momenta,
    beta,
    step: input.step,
    steps: input.steps,
    beforeKick: () => {
      if (operator === null || phi === null || mass === null) {
        return
      }

      const solved = solveEven({
        operator,
        phi,
        mass,
        tolerance: input.tolerance,
      })

      iterations += solved.iterations
      force = fermionForce({ operator, x: solved.x })
    },
    addForce: (link: number, out: MatrixSlot) => {
      if (force === null) {
        return
      }

      const size = 2 * lattice.n * lattice.n

      for (let k = 0; k < size; k++) {
        out.data[out.offset + k] =
          (out.data[out.offset + k] ?? 0) +
          (force[link * size + k] ?? 0)
      }
    },
  })

  const h1 =
    kineticEnergy({ momenta }) +
    wilsonAction({ lattice, beta }) +
    fermion()
  const deltaH = h1 - h0
  const accepted = deltaH <= 0 || rng.next() < Math.exp(-deltaH)

  if (!accepted) {
    lattice.links.set(saved)
  }

  return { accepted, deltaH, iterations }
}
