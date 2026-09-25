// Z_N lattice gauge theory, the center of SU(N) on its own: every link carries one of N values
// k = 0 .. N - 1, the element exp(2 pi i k / N), and a plaquette carries q = the oriented sum of its
// four links mod N. The action is
//
//   S = beta sum over plaquettes of (1 - cos(2 pi q / N))
//
// For N = 3 a link is exactly a three-valued tone read cyclically (charges added mod 3), the center of
// SU(3) that the Svetitsky-Yaffe argument says controls confinement and deconfinement. For N = 3 every
// nontrivial plaquette costs the same, 3/2, so energies are counted in integers: the number of
// plaquettes with q != 0.
//
// Two dynamics:
//
// - reversibleSweep: a reversible cellular automaton, the Z_N generalization of the Q2R rule for Ising
//   spins (Vichniac 1984, Pomeau 1984). Links are updated in eight classes, the direction mu times the
//   parity of the coordinates transverse to mu, and no two links of one class share a plaquette, so a
//   class updates all at once without one link seeing another's move. Each link steps to the next of
//   its values (cyclically) that leaves its own plaquette energy exactly unchanged. That is a
//   permutation of each local level set, so the whole sweep is a bijection of configurations: it is
//   deterministic, invertible, and conserves the total energy exactly, with no random number and no
//   demon. Whether it samples the microcanonical ensemble is the ergodic question, answered by
//   measurement.
// - centerHeatbathSweep: the seeded reference, each link drawn from its exact conditional
//   distribution.

import { Rng } from '@/code/tool/rng'
import { Hypercubic, makeHypercubic } from '@/code/tool/hypercubic'

export type CenterLattice = {
  readonly form: 'center-lattice'
  readonly order: number
  readonly geometry: Hypercubic
  // link (site, mu) at site * dim + mu, a value 0 .. order - 1
  readonly links: Int8Array
}

// Every link starts at `pattern(site, mu)`, a fixed structured assignment, 0 by default (the
// ordered vacuum).
export function makeCenterLattice(input: {
  order: number
  lengths: readonly number[]
  pattern?: (coordinates: readonly number[], mu: number) => number
}): CenterLattice {
  const geometry = makeHypercubic({ lengths: input.lengths })
  const count = geometry.sites * geometry.dim
  const links = new Int8Array(count)

  if (input.pattern !== undefined) {
    for (let site = 0; site < geometry.sites; site++) {
      let rest = site
      const x: number[] = []

      for (const length of geometry.lengths) {
        x.push(rest % length)
        rest = Math.floor(rest / length)
      }

      for (let mu = 0; mu < geometry.dim; mu++) {
        links[site * geometry.dim + mu] = ((input.pattern(x, mu) % input.order) + input.order) % input.order
      }
    }
  }

  return { form: 'center-lattice', order: input.order, geometry, links }
}

function plaquetteCharge(input: {
  lattice: CenterLattice
  site: number
  mu: number
  nu: number
}): number {
  const { lattice, site, mu, nu } = input
  const { dim, up } = lattice.geometry
  const n = lattice.order
  const link = (s: number, d: number): number => lattice.links[s * dim + d] ?? 0
  const q =
    link(site, mu) +
    link(up[site * dim + mu] ?? 0, nu) -
    link(up[site * dim + nu] ?? 0, mu) -
    link(site, nu)

  return ((q % n) + n) % n
}

// The plaquette action 1 - cos(2 pi q / N), rounded to 1e-12 so equal energies compare equal.
function plaquetteEnergy(input: { order: number; charge: number }): number {
  return Math.round((1 - Math.cos((2 * Math.PI * input.charge) / input.order)) * 1e12) / 1e12
}

// The energy of every plaquette that contains link (site, mu), with the link set to `value`.
function localEnergy(input: { lattice: CenterLattice; site: number; mu: number; value: number }): number {
  const { lattice, site, mu, value } = input
  const { dim, down } = lattice.geometry
  const index = site * dim + mu
  const saved = lattice.links[index] ?? 0

  lattice.links[index] = value

  let total = 0

  for (let nu = 0; nu < dim; nu++) {
    if (nu === mu) {
      continue
    }

    total += plaquetteEnergy({ order: lattice.order, charge: plaquetteCharge({ lattice, site, mu, nu }) })
    total += plaquetteEnergy({
      order: lattice.order,
      charge: plaquetteCharge({ lattice, site: down[site * dim + nu] ?? 0, mu, nu }),
    })
  }

  lattice.links[index] = saved

  return total
}

// One sweep of the reversible automaton: the eight classes in a fixed order (or the reverse order,
// with `reverse`, which together with the inverse step undoes a sweep). Returns the moves made.
export function reversibleSweep(input: { lattice: CenterLattice; reverse?: boolean }): number {
  const { lattice } = input
  const { dim, sites, lengths } = lattice.geometry
  const n = lattice.order
  const classes: [number, number][] = []

  for (let mu = 0; mu < dim; mu++) {
    for (let parity = 0; parity < 2; parity++) {
      classes.push([mu, parity])
    }
  }

  if (input.reverse === true) {
    classes.reverse()
  }

  let moves = 0

  for (const [mu, parity] of classes) {
    const updates: [number, number][] = []

    for (let site = 0; site < sites; site++) {
      let rest = site
      let transverse = 0

      for (let nu = 0; nu < dim; nu++) {
        const length = lengths[nu] ?? 1

        if (nu !== mu) {
          transverse += rest % length
        }

        rest = Math.floor(rest / length)
      }

      if (transverse % 2 !== parity) {
        continue
      }

      const index = site * dim + mu
      const current = lattice.links[index] ?? 0
      const energy = localEnergy({ lattice, site, mu, value: current })

      // the next value, cyclically forward (or backward when reversing), with the same energy
      for (let shift = 1; shift < n; shift++) {
        const candidate = input.reverse === true ? (current - shift + n) % n : (current + shift) % n

        if (localEnergy({ lattice, site, mu, value: candidate }) === energy) {
          updates.push([index, candidate])
          break
        }
      }
    }

    for (const [index, value] of updates) {
      lattice.links[index] = value
      moves += 1
    }
  }

  return moves
}

// One heatbath sweep at inverse coupling beta, the seeded reference.
export function centerHeatbathSweep(input: { lattice: CenterLattice; beta: number; rng: Rng }): void {
  const { lattice, beta, rng } = input
  const { dim, sites } = lattice.geometry
  const n = lattice.order
  const weights = new Float64Array(n)

  for (let site = 0; site < sites; site++) {
    for (let mu = 0; mu < dim; mu++) {
      let total = 0

      for (let value = 0; value < n; value++) {
        const w = Math.exp(-beta * localEnergy({ lattice, site, mu, value }))

        weights[value] = w
        total += w
      }

      let pick = rng.next() * total
      let value = 0

      while (value < n - 1 && pick > (weights[value] ?? 0)) {
        pick -= weights[value] ?? 0
        value += 1
      }

      lattice.links[site * dim + mu] = value
    }
  }
}

// The total plaquette energy, and the mean plaquette <cos(2 pi q / N)>.
export function centerPlaquette(input: { lattice: CenterLattice }): { energy: number; plaquette: number } {
  const { lattice } = input
  const { dim, sites } = lattice.geometry

  let energy = 0
  let count = 0

  for (let site = 0; site < sites; site++) {
    for (let mu = 0; mu < dim; mu++) {
      for (let nu = mu + 1; nu < dim; nu++) {
        energy += plaquetteEnergy({ order: lattice.order, charge: plaquetteCharge({ lattice, site, mu, nu }) })
        count += 1
      }
    }
  }

  return { energy, plaquette: 1 - energy / count }
}

// Rectangular Wilson loops W(R, T) = <cos(2 pi (sum of the loop's links) / N)>, averaged over every
// site and ordered pair of directions, for 0 <= R, T <= max.
export function centerWilsonLoops(input: { lattice: CenterLattice; max: number }): number[][] {
  const { lattice, max } = input
  const { dim, sites, up } = lattice.geometry
  const n = lattice.order
  const table = Array.from({ length: max + 1 }, () => new Array<number>(max + 1).fill(1))
  const walk = (site: number, mu: number, steps: number): { end: number; sum: number } => {
    let current = site
    let sum = 0

    for (let k = 0; k < steps; k++) {
      sum += lattice.links[current * dim + mu] ?? 0
      current = up[current * dim + mu] ?? 0
    }

    return { end: current, sum }
  }

  for (let r = 1; r <= max; r++) {
    for (let t = r; t <= max; t++) {
      let total = 0
      let count = 0

      for (let mu = 0; mu < dim; mu++) {
        for (let nu = 0; nu < dim; nu++) {
          if (nu === mu) {
            continue
          }

          for (let site = 0; site < sites; site++) {
            const bottom = walk(site, mu, r)
            const right = walk(bottom.end, nu, t)
            const left = walk(site, nu, t)
            const top = walk(left.end, mu, r)

            total += Math.cos((2 * Math.PI * (bottom.sum + right.sum - top.sum - left.sum)) / n)
            count += 1
          }
        }
      }

      const value = total / count
      const row = table[r]
      const column = table[t]

      if (row !== undefined && column !== undefined) {
        row[t] = value
        column[r] = value
      }
    }
  }

  return table
}
