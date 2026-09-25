// A deterministic, reversible sampler for lattice gauge theory with a finite colour group, the
// finite-group form of the kinetic Z3 automaton (E-FRC-0102).
//
// The obstacle was arithmetic. A reversible microcanonical rule must conserve the energy exactly, and
// the Wilson action Re Tr U / 3 of a group like Sigma(648) takes irrational values, so floating point
// would break exact reversal. The way round it is to use an action whose values are integers: every
// plaquette pays E(U) = round(K (1 - Re Tr U / 3)), a class function of the plaquette with levels
// 0 .. about 1.5 K. Any class function that is smallest at the identity is a legitimate lattice action
// (Wilson's is one choice among many), and this one approaches K times Wilson's as K grows. With
// integer levels the energy bookkeeping is exact.
//
// The rule, per link, in eight non-touching classes (direction mu and the parity of the coordinates
// transverse to mu, so no two links of a class share a plaquette): the local total
// E_local(U) + demon is fixed, the admissible link values are {g : 0 <= total - E_local(g) <= capacity},
// and the link steps to the next admissible value in the group's index order (the previous one when
// reversing), the demon taking the difference. Each step is a permutation of a level set, so a sweep is
// a bijection that conserves the plaquette energy plus the demon energy exactly. Demons stream and
// exchange as in E-FRC-0102, so kinetic energy travels.
//
// The seeded heatbath of the same quantized action is the reference.

import { Rng } from '@/code/tool/rng'
import {
  FiniteGaugeLattice,
  FiniteGroup,
} from '@/code/dynamics/finite-gauge'

// the integer action level of every group element
export function actionLevels(input: {
  group: FiniteGroup
  scale: number
}): Int32Array {
  const { group, scale } = input

  return Int32Array.from(group.trace, trace =>
    Math.round(scale * (1 - trace / 3)),
  )
}

// The integer levels of the modified action of Alexandru et al. (2019),
// -S = sum_p ((beta0 / 3) Re Tr U_p + beta1 Re Tr U_p^2), written as beta0 times the class function
// (1 - Re Tr U / 3) + (beta1 / beta0) (3 - Re Tr U^2), which is 0 at the identity, and quantized as
// round(scale times that). The canonical weight is then exp(-(beta0 / scale) sum_p E), so the demon
// temperature reads beta0 / scale. A level can be negative when beta1 < 0 favours an element over the
// identity, and the bookkeeping holds all the same, since only differences of levels move energy.
export function mixedActionLevels(input: {
  group: FiniteGroup
  scale: number
  ratio: number
}): Int32Array {
  const { group, scale, ratio } = input

  return Int32Array.from({ length: group.order }, (_, g) => {
    const square = group.product[g * group.order + g] ?? 0
    const value =
      1 -
      (group.trace[g] ?? 0) / 3 +
      ratio * (3 - (group.trace[square] ?? 0))

    return Math.round(scale * value)
  })
}

// the six staples of link (site, mu) as group elements, U s_k being the six plaquettes through it
function staples(
  lattice: FiniteGaugeLattice,
  site: number,
  mu: number,
  out: Int32Array,
): void {
  const { group, geometry, links } = lattice
  const { dim, up, down } = geometry
  const { order, product, inverse } = group
  const mul = (a: number, b: number): number =>
    product[a * order + b] ?? 0
  const link = (s: number, d: number): number => links[s * dim + d] ?? 0
  const inv = (g: number): number => inverse[g] ?? 0
  const siteUp = up[site * dim + mu] ?? 0

  let count = 0

  for (let nu = 0; nu < dim; nu++) {
    if (nu === mu) {
      continue
    }

    out[count++] = mul(
      mul(link(siteUp, nu), inv(link(up[site * dim + nu] ?? 0, mu))),
      inv(link(site, nu)),
    )

    const below = down[site * dim + nu] ?? 0

    out[count++] = mul(
      mul(
        inv(link(down[siteUp * dim + nu] ?? 0, nu)),
        inv(link(below, mu)),
      ),
      link(below, nu),
    )
  }
}

function localEnergy(input: {
  group: FiniteGroup
  levels: Int32Array
  staple: Int32Array
  value: number
}): number {
  const { group, levels, staple, value } = input

  let sum = 0

  for (const s of staple) {
    sum += levels[group.product[value * group.order + s] ?? 0] ?? 0
  }

  return sum
}

// One kinetic sweep over the eight link classes (reverse order and the previous admissible value
// when reversing).
export function finiteKineticSweep(input: {
  lattice: FiniteGaugeLattice
  levels: Int32Array
  demons: Int32Array
  capacity: number
  reverse?: boolean
}): number {
  const { lattice, levels, demons, capacity } = input
  const { group, geometry, links } = lattice
  const { dim, sites, lengths } = geometry
  const staple = new Int32Array(2 * (dim - 1))
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
    const updates: [number, number, number][] = []

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

      staples(lattice, site, mu, staple)

      const index = site * dim + mu
      const current = links[index] ?? 0
      const total =
        localEnergy({ group, levels, staple, value: current }) +
        (demons[index] ?? 0)

      for (let shift = 1; shift < group.order; shift++) {
        const candidate =
          input.reverse === true
            ? (current - shift + group.order) % group.order
            : (current + shift) % group.order
        const demon =
          total -
          localEnergy({ group, levels, staple, value: candidate })

        if (demon >= 0 && demon <= capacity) {
          updates.push([index, candidate, demon])
          break
        }
      }
    }

    for (const [index, value, demon] of updates) {
      links[index] = value
      demons[index] = demon
      moves += 1
    }
  }

  return moves
}

// Stream the demons one link along a rotating axis, rotating the link direction too (a permutation).
export function streamFiniteDemons(input: {
  lattice: FiniteGaugeLattice
  demons: Int32Array
  step: number
  reverse?: boolean
}): void {
  const { lattice, demons, step } = input
  const { dim, sites, up } = lattice.geometry
  const axis = ((step % dim) + dim) % dim
  const old = Int32Array.from(demons)

  for (let site = 0; site < sites; site++) {
    const next = up[site * dim + axis] ?? 0

    for (let mu = 0; mu < dim; mu++) {
      const from = site * dim + mu
      const to = next * dim + ((mu + 1) % dim)

      if (input.reverse === true) {
        demons[from] = old[to] ?? 0
      } else {
        demons[to] = old[from] ?? 0
      }
    }
  }
}

// Neighbouring demons trade one unit cyclically within their level set (a permutation).
export function exchangeFiniteDemons(input: {
  lattice: FiniteGaugeLattice
  demons: Int32Array
  capacity: number
  step: number
  reverse?: boolean
}): void {
  const { lattice, demons, capacity, step } = input
  const { dim, sites } = lattice.geometry
  const offset = ((step % 2) + 2) % 2

  for (let site = 0; site < sites; site++) {
    for (let m = 0; m + 1 < dim; m += 2) {
      const a = site * dim + ((m + offset) % dim)
      const b = site * dim + ((m + offset + 1) % dim)
      const sum = (demons[a] ?? 0) + (demons[b] ?? 0)
      const low = Math.max(0, sum - capacity)
      const high = Math.min(capacity, sum)
      const span = high - low + 1
      const shift = input.reverse === true ? span - 1 : 1
      const next = low + (((demons[a] ?? 0) - low + shift) % span)

      demons[a] = next
      demons[b] = sum - next
    }
  }
}

// The total plaquette energy in integer levels.
export function quantizedEnergy(input: {
  lattice: FiniteGaugeLattice
  levels: Int32Array
}): number {
  const { lattice, levels } = input
  const { group, geometry, links } = lattice
  const { dim, sites, up } = geometry
  const { order, product, inverse } = group
  const mul = (a: number, b: number): number =>
    product[a * order + b] ?? 0

  let energy = 0

  for (let site = 0; site < sites; site++) {
    for (let mu = 0; mu < dim; mu++) {
      for (let nu = mu + 1; nu < dim; nu++) {
        const a = links[site * dim + mu] ?? 0
        const b = links[(up[site * dim + mu] ?? 0) * dim + nu] ?? 0
        const c =
          inverse[links[(up[site * dim + nu] ?? 0) * dim + mu] ?? 0] ??
          0
        const d = inverse[links[site * dim + nu] ?? 0] ?? 0

        energy += levels[mul(mul(mul(a, b), c), d)] ?? 0
      }
    }
  }

  return energy
}

// The seeded heatbath of the quantized action exp(-beta sum_p E(U_p)), the reference.
export function quantizedHeatbathSweep(input: {
  lattice: FiniteGaugeLattice
  levels: Int32Array
  beta: number
  rng: Rng
}): void {
  const { lattice, levels, beta, rng } = input
  const { group, geometry, links } = lattice
  const { dim, sites } = geometry
  const staple = new Int32Array(2 * (dim - 1))
  const weights = new Float64Array(group.order)

  for (let site = 0; site < sites; site++) {
    for (let mu = 0; mu < dim; mu++) {
      staples(lattice, site, mu, staple)

      let total = 0

      for (let g = 0; g < group.order; g++) {
        const w = Math.exp(
          -beta * localEnergy({ group, levels, staple, value: g }),
        )

        weights[g] = w
        total += w
      }

      let pick = rng.next() * total
      let chosen = 0

      while (
        chosen < group.order - 1 &&
        pick > (weights[chosen] ?? 0)
      ) {
        pick -= weights[chosen] ?? 0
        chosen += 1
      }

      links[site * dim + mu] = chosen
    }
  }
}

// The seeded microcanonical reference: the same ensemble as the kinetic rule (the lattice and one
// bounded demon per link, total energy fixed) under random dynamics. Each link proposes a uniformly
// random element and takes it when its own demon can pay, then random pairs of demons share their
// sum uniformly within the bounds. Both moves are symmetric and conserve energy, so the stationary
// measure is uniform on the energy shell. Where a fixed energy has no canonical counterpart (the
// back-bent branch of a first-order transition) this, not the heatbath, is the fair comparison.
//
// The link move is a heatbath on the shell: with everything else fixed, the link and its demon can
// take any element whose local energy the pair can pay for, each equally likely, so the link draws
// uniformly among exactly those. A first version proposed a uniformly random element and accepted it
// when it fit, which is also exact but almost never fits a small demon, and left the lattice more
// ordered than its own demons' temperature allows.
export function microcanonicalSweep(input: {
  lattice: FiniteGaugeLattice
  levels: Int32Array
  demons: Int32Array
  capacity: number
  rng: Rng
}): void {
  const { lattice, levels, demons, capacity, rng } = input
  const { group, geometry, links } = lattice
  const { dim, sites } = geometry
  const staple = new Int32Array(2 * (dim - 1))
  const admissible = new Int32Array(group.order)
  const paid = new Int32Array(group.order)

  for (let site = 0; site < sites; site++) {
    for (let mu = 0; mu < dim; mu++) {
      staples(lattice, site, mu, staple)

      const index = site * dim + mu
      const total =
        (demons[index] ?? 0) +
        localEnergy({ group, levels, staple, value: links[index] ?? 0 })

      let count = 0

      for (let g = 0; g < group.order; g++) {
        const demon =
          total - localEnergy({ group, levels, staple, value: g })

        if (demon >= 0 && demon <= capacity) {
          admissible[count] = g
          paid[count] = demon
          count += 1
        }
      }

      const pick = Math.floor(rng.next() * count)

      links[index] = admissible[pick] ?? 0
      demons[index] = paid[pick] ?? 0
    }
  }

  // one random pair redistribution per demon, on average
  for (let round = demons.length; round > 0; round--) {
    const a = Math.floor(rng.next() * demons.length)
    const b = Math.floor(rng.next() * demons.length)
    const sum = (demons[a] ?? 0) + (demons[b] ?? 0)
    const low = Math.max(0, sum - capacity)
    const high = Math.min(capacity, sum)

    if (a !== b) {
      demons[a] = low + Math.floor(rng.next() * (high - low + 1))
      demons[b] = sum - (demons[a] ?? 0)
    }
  }
}

// The inverse coupling of a bounded demon with unit steps, from its mean: weights exp(-beta d),
// d = 0 .. capacity, inverted by bisection.
export function unitDemonBeta(input: {
  meanDemon: number
  capacity: number
}): number {
  const { meanDemon, capacity } = input

  const meanAt = (beta: number): number => {
    let weight = 0
    let sum = 0

    for (let d = 0; d <= capacity; d++) {
      const w = Math.exp(-beta * d)

      weight += w
      sum += d * w
    }

    return sum / weight
  }

  let low = -20
  let high = 20

  for (let step = 0; step < 100; step++) {
    const middle = (low + high) / 2

    if (meanAt(middle) > meanDemon) {
      low = middle
    } else {
      high = middle
    }
  }

  return (low + high) / 2
}
