// Deterministic, reversible Hamiltonian dynamics for an SU(N) lattice gauge field. Every link U
// gets a conjugate momentum P, a traceless Hermitian N x N matrix, and the system evolves under
//
//   H = sum over links Tr(P^2) + S(U),   S = beta sum over plaquettes (1 - (1 / N) Re Tr U_p)
//
//   dU / dt = i P U,     dP / dt = -(beta / (2N)) (Y - (Tr Y / N) 1),   Y = (U A - (U A)^dag) / (2i)
//
// with A the staple sum of the link. With P = sum_a p_a T_a and Tr(T_a T_b) = delta_ab / 2 the
// kinetic term is (1/2) sum_a p_a^2, one unit of equipartition per colour component.
//
// The integrator is leapfrog (half kick, drift, half kick), which is exactly time-reversible and
// symplectic: flip every momentum and integrate again and the start comes back, to rounding. It
// conserves H to O(epsilon^2) over any length of run. No random number is drawn anywhere here. The
// only nonlinearity is the gauge field's own: in a non-abelian group the force on a link depends on
// the links around it through commutators, and that is what can carry a structured initial state to
// thermal equilibrium, if anything does.

import {
  GaugeLattice,
  linkSlot,
  stapleInto,
} from '@/code/dynamics/gauge-lattice'
import {
  MatrixSlot,
  multiplyInto,
  reunitarize,
} from '@/code/algebra/group/unitary-matrix'
import { averagePlaquette } from '@/code/measure/lattice-gauge-observable'

export type GaugeMomenta = {
  readonly form: 'gauge-momenta'
  readonly n: number
  // momentum of link (site, mu) at offset (site * dim + mu) * 2 n n, a Hermitian matrix
  readonly data: Float64Array
}

export function makeMomenta(input: { lattice: GaugeLattice }): GaugeMomenta {
  return {
    form: 'gauge-momenta',
    n: input.lattice.n,
    data: new Float64Array(input.lattice.links.length),
  }
}

// The generalized Gell-Mann generators T_a of SU(N), normalized Tr(T_a T_b) = delta_ab / 2, as flat
// complex matrices: the N(N - 1) / 2 symmetric and antisymmetric off-diagonal pairs, then the N - 1
// diagonal ones. For N = 3 these are lambda_a / 2 in the standard order up to relabelling.
export function suGenerators(input: { n: number }): Float64Array[] {
  const { n } = input
  const out: Float64Array[] = []
  const at = (i: number, j: number): number => 2 * (i * n + j)

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const symmetric = new Float64Array(2 * n * n)
      const antisymmetric = new Float64Array(2 * n * n)

      symmetric[at(i, j)] = 0.5
      symmetric[at(j, i)] = 0.5
      antisymmetric[at(i, j) + 1] = -0.5
      antisymmetric[at(j, i) + 1] = 0.5
      out.push(symmetric, antisymmetric)
    }
  }

  for (let k = 1; k < n; k++) {
    const diagonal = new Float64Array(2 * n * n)
    const scale = 1 / Math.sqrt(2 * k * (k + 1))

    for (let i = 0; i < k; i++) {
      diagonal[at(i, i)] = scale
    }

    diagonal[at(k, k)] = -k * scale
    out.push(diagonal)
  }

  return out
}

// The components p_a = 2 Tr(T_a P) of one momentum.
export function momentumComponents(input: {
  momenta: GaugeMomenta
  link: number
  generators: readonly Float64Array[]
}): number[] {
  const { momenta, link, generators } = input
  const n = momenta.n
  const offset = link * 2 * n * n

  return generators.map(t => {
    let total = 0

    // Re Tr(T P) = sum_ij Re(T_ij P_ji)
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const tr = t[2 * (i * n + j)] ?? 0
        const ti = t[2 * (i * n + j) + 1] ?? 0
        const pr = momenta.data[offset + 2 * (j * n + i)] ?? 0
        const pi = momenta.data[offset + 2 * (j * n + i) + 1] ?? 0

        total += tr * pr - ti * pi
      }
    }

    return 2 * total
  })
}

// Set one momentum from its components, P = sum_a p_a T_a.
export function setMomentum(input: {
  momenta: GaugeMomenta
  link: number
  generators: readonly Float64Array[]
  components: readonly number[]
}): void {
  const { momenta, link, generators, components } = input
  const size = 2 * momenta.n * momenta.n
  const offset = link * size

  for (let k = 0; k < size; k++) {
    momenta.data[offset + k] = 0
  }

  generators.forEach((t, a) => {
    const p = components[a] ?? 0

    for (let k = 0; k < size; k++) {
      momenta.data[offset + k] = (momenta.data[offset + k] ?? 0) + p * (t[k] ?? 0)
    }
  })
}

// sum over links of Tr(P^2) = (1/2) sum over links and colours of p_a^2
export function kineticEnergy(input: { momenta: GaugeMomenta }): number {
  // Tr(P^2) = sum_ij |P_ij|^2 for Hermitian P
  let total = 0

  for (const value of input.momenta.data) {
    total += value ** 2
  }

  return total
}

// The Wilson action S = beta sum_p (1 - (1/N) Re Tr U_p).
export function wilsonAction(input: { lattice: GaugeLattice; beta: number }): number {
  const { lattice, beta } = input
  const { dim, sites } = lattice.geometry
  const plaquettes = (sites * dim * (dim - 1)) / 2

  return beta * plaquettes * (1 - averagePlaquette({ lattice }))
}

// P += step * F(U) for every link, F the gauge force above, plus an optional extra force (the
// quarks') added through `addForce`, which receives the link index and a Hermitian accumulator.
export function kick(input: {
  lattice: GaugeLattice
  momenta: GaugeMomenta
  beta: number
  step: number
  addForce?: (link: number, out: MatrixSlot) => void
}): void {
  const { lattice, momenta, beta, step } = input
  const { n, geometry } = lattice
  const size = 2 * n * n
  const buffer = new Float64Array(3 * size)
  const staple: MatrixSlot = { data: buffer, offset: 0 }
  const product: MatrixSlot = { data: buffer, offset: size }
  const force: MatrixSlot = { data: buffer, offset: 2 * size }

  for (let site = 0; site < geometry.sites; site++) {
    for (let mu = 0; mu < geometry.dim; mu++) {
      const link = site * geometry.dim + mu

      stapleInto({ lattice, site, mu, out: staple })
      multiplyInto({ n, a: linkSlot({ lattice, site, mu }), b: staple, out: product })

      // Y = (W - W^dag) / (2i), W = U A. Y_ij = (W_ij - conj(W_ji)) / (2i)
      let traceY = 0

      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          const wr = buffer[size + 2 * (i * n + j)] ?? 0
          const wi = buffer[size + 2 * (i * n + j) + 1] ?? 0
          const vr = buffer[size + 2 * (j * n + i)] ?? 0
          const vi = -(buffer[size + 2 * (j * n + i) + 1] ?? 0)
          // (a + ib) / (2i) = (b - ia) / 2, with a + ib = (wr - vr) + i (wi - vi)
          const k = 2 * size + 2 * (i * n + j)

          buffer[k] = ((wi - vi) / 2) * (-beta / (2 * n))
          buffer[k + 1] = (-(wr - vr) / 2) * (-beta / (2 * n))

          if (i === j) {
            traceY += (wi - vi) / 2
          }
        }
      }

      // remove the trace: F -= (-(beta / 2N)) (Tr Y / N) 1
      for (let i = 0; i < n; i++) {
        const k = 2 * size + 2 * (i * n + i)

        buffer[k] = (buffer[k] ?? 0) - (-beta / (2 * n)) * (traceY / n)
      }

      input.addForce?.(link, force)

      const offset = link * size

      for (let k = 0; k < size; k++) {
        momenta.data[offset + k] = (momenta.data[offset + k] ?? 0) + step * (force.data[force.offset + k] ?? 0)
      }
    }
  }
}

// U <- exp(i step P) U for every link. The exponential is a Taylor series carried until the next
// term is below 1e-17 (a handful of terms at these steps), then a reunitarization removes the last
// rounding. exp of i times a Hermitian matrix is unitary, and exp(-i step P) exactly undoes it.
export function drift(input: { lattice: GaugeLattice; momenta: GaugeMomenta; step: number }): void {
  const { lattice, momenta, step } = input
  const { n } = lattice
  const size = 2 * n * n
  const buffer = new Float64Array(4 * size)
  const generator: MatrixSlot = { data: buffer, offset: 0 }
  const term: MatrixSlot = { data: buffer, offset: size }
  const next: MatrixSlot = { data: buffer, offset: 2 * size }
  const sum: MatrixSlot = { data: buffer, offset: 3 * size }
  const scratch = new Float64Array(size)
  const links = lattice.links.length / size

  for (let link = 0; link < links; link++) {
    const offset = link * size

    // generator = i step P
    for (let k = 0; k < size; k += 2) {
      buffer[k] = -step * (momenta.data[offset + k + 1] ?? 0)
      buffer[k + 1] = step * (momenta.data[offset + k] ?? 0)
    }

    // sum = 1, term = 1
    for (let k = 0; k < size; k++) {
      buffer[size + k] = 0
      buffer[3 * size + k] = 0
    }

    for (let i = 0; i < n; i++) {
      buffer[size + 2 * (i * n + i)] = 1
      buffer[3 * size + 2 * (i * n + i)] = 1
    }

    for (let order = 1; order < 30; order++) {
      multiplyInto({ n, a: term, b: generator, out: next })

      let norm = 0

      for (let k = 0; k < size; k++) {
        const value = (buffer[2 * size + k] ?? 0) / order

        buffer[size + k] = value
        buffer[3 * size + k] = (buffer[3 * size + k] ?? 0) + value
        norm += value * value
      }

      if (norm < 1e-34) {
        break
      }
    }

    // U <- exp U
    const target = { data: lattice.links, offset }

    multiplyInto({ n, a: sum, b: target, out: { data: scratch, offset: 0 } })
    lattice.links.set(scratch, offset)
    reunitarize({ n, out: target })
  }
}

// Yoshida's fourth-order composition (1990): three leapfrog substeps of w1, w0, w1 times the step,
// w1 = 1 / (2 - 2^(1/3)), w0 = 1 - 2 w1 (negative). Symmetric, so still exactly reversible, and the
// error in H, and so the bias of the ensemble it samples, falls from O(step^2) to O(step^4).
const YOSHIDA_OUTER = 1 / (2 - 2 ** (1 / 3))
const COMPOSITION: Record<2 | 4, readonly number[]> = {
  2: [1],
  4: [YOSHIDA_OUTER, 1 - 2 * YOSHIDA_OUTER, YOSHIDA_OUTER],
}

// One trajectory of `steps` steps of length `step`, leapfrog (order 2, the default) or its
// fourth-order symmetric composition. Adjacent half kicks are merged, so a leapfrog step costs one
// force evaluation and a fourth-order step three. Reversible: negate the momenta and run it again
// to return to the start.
export function leapfrog(input: {
  lattice: GaugeLattice
  momenta: GaugeMomenta
  beta: number
  step: number
  steps: number
  order?: 2 | 4
  addForce?: (link: number, out: MatrixSlot) => void
  beforeKick?: () => void
}): void {
  const { lattice, momenta, beta, step, steps } = input
  const weights = COMPOSITION[input.order ?? 2]
  const drifts: number[] = []

  for (let s = 0; s < steps; s++) {
    for (const w of weights) {
      drifts.push(w * step)
    }
  }

  const kickBy = (size: number): void => {
    input.beforeKick?.()
    kick({ lattice, momenta, beta, step: size, addForce: input.addForce })
  }

  kickBy((drifts[0] ?? 0) / 2)

  drifts.forEach((size, index) => {
    drift({ lattice, momenta, step: size })
    kickBy((size + (drifts[index + 1] ?? 0)) / 2)
  })
}

// A fixed, structured initial momentum field with no random number in it: every colour component of
// every link is a plane wave,
//
//   p_a(x, mu) = amplitude cos(2 pi sum_{nu != mu} w_nu x_nu / L_nu + 2 pi (3 a + 5 mu) / 16)
//
// with fixed integer weights w = 1, 2, 3, 5. The momentum of a mu-link does not depend on x_mu, so
// on the cold vacuum (every link the identity) its lattice divergence is exactly zero at every site:
// the Gauss law holds and the start carries no colour charge. `colours` limits the excitation to
// the listed colour components (all of them by default), the rest start at zero.
export function structuredMomenta(input: {
  lattice: GaugeLattice
  momenta: GaugeMomenta
  generators: readonly Float64Array[]
  amplitude: number
  colours?: readonly number[]
}): void {
  const { lattice, momenta, generators, amplitude } = input
  const { dim, lengths, sites } = lattice.geometry
  const weights = [1, 2, 3, 5]
  const colours = input.colours ?? generators.map((_, a) => a)

  for (let site = 0; site < sites; site++) {
    let rest = site

    const x: number[] = []

    for (const length of lengths) {
      x.push(rest % length)
      rest = Math.floor(rest / length)
    }

    for (let mu = 0; mu < dim; mu++) {
      let phase = 0

      for (let nu = 0; nu < dim; nu++) {
        if (nu !== mu) {
          phase += (2 * Math.PI * (weights[nu] ?? 1) * (x[nu] ?? 0)) / (lengths[nu] ?? 1)
        }
      }

      const components = generators.map((_, a) =>
        colours.includes(a)
          ? amplitude * Math.cos(phase + (2 * Math.PI * (3 * a + 5 * mu)) / 16)
          : 0,
      )

      setMomentum({ momenta, link: site * dim + mu, generators, components })
    }
  }
}

// The kinetic temperature T = <p_a^2>, the mean square momentum component per physical degree of
// freedom. With the Gauss law holding exactly (the dynamics conserves the colour charge at every
// site, and a structured start sets it to zero), N^2 - 1 combinations of momenta per site are pinned
// at zero, so the kinetic energy spreads over (N^2 - 1)(links - sites) components, not
// (N^2 - 1) links. `count: 'naive'` uses every link component, the alternative a measurement can
// rule out.
export function kineticTemperature(input: {
  lattice: GaugeLattice
  momenta: GaugeMomenta
  count: 'gauss' | 'naive'
}): number {
  const { lattice, momenta } = input
  const { dim, sites } = lattice.geometry
  const colours = lattice.n * lattice.n - 1
  const links = sites * dim
  const components = colours * (input.count === 'gauss' ? links - sites : links)

  return (2 * kineticEnergy({ momenta })) / components
}

// The share of the kinetic energy in each colour component, summed over every link. 1 / (N^2 - 1)
// each at equipartition.
export function colourFractions(input: {
  momenta: GaugeMomenta
  generators: readonly Float64Array[]
}): number[] {
  const { momenta, generators } = input
  const links = momenta.data.length / (2 * momenta.n * momenta.n)
  const totals = generators.map(() => 0)

  for (let link = 0; link < links; link++) {
    momentumComponents({ momenta, link, generators }).forEach((p, a) => {
      totals[a] = (totals[a] ?? 0) + p * p
    })
  }

  const sum = totals.reduce((a, b) => a + b, 0)

  return totals.map(total => (sum === 0 ? 0 : total / sum))
}

// The kurtosis <p^4> / <p^2>^2 of the momentum components over every link, pooled over the colour
// components listed (all by default). 3 for a Gaussian (Maxwell-Boltzmann) distribution, 1.5 for the cosine
// profile of a single plane wave. The approach from 1.5 to 3 is thermalization read off the momenta.
export function momentumKurtosis(input: {
  momenta: GaugeMomenta
  generators: readonly Float64Array[]
  colours?: readonly number[]
}): number {
  const { momenta, generators } = input
  const links = momenta.data.length / (2 * momenta.n * momenta.n)
  const colours = input.colours ?? generators.map((_, a) => a)

  let second = 0
  let fourth = 0
  let count = 0

  for (let link = 0; link < links; link++) {
    momentumComponents({ momenta, link, generators }).forEach((p, a) => {
      if (colours.includes(a)) {
        second += p * p
        fourth += p ** 4
        count += 1
      }
    })
  }

  return fourth / count / (second / count) ** 2
}

// Flip every momentum, the time reversal of the dynamics.
export function negateMomenta(input: { momenta: GaugeMomenta }): void {
  for (let k = 0; k < input.momenta.data.length; k++) {
    input.momenta.data[k] = -(input.momenta.data[k] ?? 0)
  }
}
