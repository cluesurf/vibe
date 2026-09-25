// Dynamical color triplets on the deterministic Sigma(648) automaton: matter that hops, is made from
// calm in pairs, and pays for everything it does from the same demons that move the links.
//
// E-FRC-0110 and E-FRC-0126 run the classical color group as pure gauge. This adds matter to that rule
// without adding any random number, so the question "what do dynamical quarks change" can be asked of a
// finite color group under a reversible, exactly conserving dynamics.
//
// The classical triplet. Sigma(648) is a finite group of 3 x 3 unitaries, so the orbit of one vector under
// it is a finite set of vectors, and the group acts on that set by permutations. The orbit of e0 is the
// triplet here: a color is an index into it, a link moves a color by a table lookup, and the center
// omega I sends a color to a different member of the set (the same ray, another phase), so the triplet
// carries the center, the vibe's phase, where a role point on the 3 x 3 grid does not (E-FRC-0119).
//
// The state, on a periodic hypercubic lattice:
// - every link a group element U(x, mu), and a bounded demon
// - every site a vibe (fear -1, calm 0, love +1) and a color, and a bounded demon. A calm site keeps its
//   color as a latent one, which is what a pair made from calm is made of (every calm slot keeps its own,
//   the correction recorded in what-the-base-needs)
//
// The energy, every term an integer:
// - each plaquette pays E(U_p) = round(K (1 - Re Tr U_p / 3)), the action of E-FRC-0110
// - each site that is not calm pays the mass level M
// - each link whose two ends are both not calm pays the bond level of <phi_x, U phi_(x + mu)>, the
//   gauge-invariant hopping term: round(B (1 - Re <phi_x, U phi_y>)) for a fundamental triplet, or, for the
//   center-blind control, round(B (1 - |<phi_x, U phi_y>|^2)), which is what a role point feels
// Under a change of frame g_x in every cell (phi_x -> g_x phi_x, U -> g_x U g_y^-1) every term is
// unchanged.
//
// The moves, each a permutation of a level set of (local energy + one demon), so every sweep is a
// bijection that conserves the total energy exactly:
// - links: the kinetic step of E-FRC-0110 with the bond of the link added to its local energy
// - site colors, in two checkerboard classes: the next admissible color in the orbit's index order
// - a dimer (x, x + mu), one at a time in a fixed order: the local states reachable by the transported
//   swap (vibe and color of x and y exchanged, each color carried across the link, phi_y' = U^-1 phi_x
//   and phi_x' = U phi_y) and by any change of the two vibes that keeps love minus fear, which is a hop,
//   pair creation from calm and pair annihilation into calm. The dimer steps to the next admissible
//   member of that set, paid from the link's demon
// - demons stream and trade as in E-FRC-0102, and each site demon trades with one link demon
// Backward is every move inverted in reverse order.

import {
  FiniteGaugeLattice,
  FiniteGroup,
  Matrix3,
} from '@/code/dynamics/finite-gauge'
import {
  exchangeFiniteDemons,
  quantizedEnergy,
  streamFiniteDemons,
} from '@/code/dynamics/finite-kinetic'

export type Triplet = {
  readonly size: number
  // each vector as 6 numbers, (re, im) of its three components
  readonly vectors: readonly Float64Array[]
  // act[g * size + b] is the index of U_g phi_b
  readonly act: Int16Array
  // Re <a, c> and |<a, c>|^2 for every pair of members, at a * size + c
  readonly overlap: Float64Array
  readonly overlapSquared: Float64Array
  // the number of distinct rays in the orbit
  readonly rays: number
}

function apply(m: Matrix3, v: Float64Array): Float64Array {
  const out = new Float64Array(6)

  for (let i = 0; i < 3; i++) {
    let re = 0
    let im = 0

    for (let k = 0; k < 3; k++) {
      const mr = m[2 * (3 * i + k)] ?? 0
      const mi = m[2 * (3 * i + k) + 1] ?? 0
      const vr = v[2 * k] ?? 0
      const vi = v[2 * k + 1] ?? 0

      re += mr * vr - mi * vi
      im += mr * vi + mi * vr
    }

    out[2 * i] = re
    out[2 * i + 1] = im
  }

  return out
}

function keyOf(v: Float64Array): string {
  return Array.from(v, x => {
    const r = Math.round(x * 1e6)

    return r === 0 ? 0 : r
  }).join(',')
}

// <a, c> = sum conj(a_i) c_i
function inner(a: Float64Array, c: Float64Array): [number, number] {
  let re = 0
  let im = 0

  for (let i = 0; i < 3; i++) {
    const ar = a[2 * i] ?? 0
    const ai = a[2 * i + 1] ?? 0
    const cr = c[2 * i] ?? 0
    const ci = c[2 * i + 1] ?? 0

    re += ar * cr + ai * ci
    im += ar * ci - ai * cr
  }

  return [re, im]
}

// The orbit of e0 under the group, with the permutation each element induces on it.
export function tripletOrbit(group: FiniteGroup): Triplet {
  const start = new Float64Array(6)

  start[0] = 1

  const vectors: Float64Array[] = [start]
  const index = new Map<string, number>([[keyOf(start), 0]])

  for (const v of vectors) {
    for (const m of group.matrices) {
      const w = apply(m, v)
      const key = keyOf(w)

      if (!index.has(key)) {
        index.set(key, vectors.length)
        vectors.push(w)
      }
    }
  }

  const size = vectors.length
  const act = new Int16Array(group.order * size)

  group.matrices.forEach((m, g) => {
    vectors.forEach((v, b) => {
      const found = index.get(keyOf(apply(m, v)))

      if (found === undefined) {
        throw new Error('the orbit is not closed under the group')
      }

      act[g * size + b] = found
    })
  })

  const overlap = new Float64Array(size * size)
  const overlapSquared = new Float64Array(size * size)

  for (let a = 0; a < size; a++) {
    for (let c = 0; c < size; c++) {
      const [re, im] = inner(vectors[a] ?? start, vectors[c] ?? start)

      overlap[a * size + c] = re
      overlapSquared[a * size + c] = re * re + im * im
    }
  }

  // two members are one ray when |<a, c>|^2 = 1
  const rayOf = new Int32Array(size).fill(-1)

  let rays = 0

  for (let a = 0; a < size; a++) {
    if ((rayOf[a] ?? 0) >= 0) {
      continue
    }

    for (let c = a; c < size; c++) {
      if (Math.abs((overlapSquared[a * size + c] ?? 0) - 1) < 1e-9) {
        rayOf[c] = rays
      }
    }

    rays += 1
  }

  return { size, vectors, act, overlap, overlapSquared, rays }
}

export type BondReading = 'fundamental' | 'blind'

// the integer bond level of every pair of members, at a * size + c
export function bondLevels(input: {
  triplet: Triplet
  scale: number
  reading: BondReading
}): Int32Array {
  const { triplet, scale, reading } = input
  const source =
    reading === 'fundamental' ? triplet.overlap : triplet.overlapSquared

  return Int32Array.from(source, x => Math.round(scale * (1 - x)))
}

export type MatterModel = {
  readonly group: FiniteGroup
  readonly triplet: Triplet
  readonly plaquetteLevels: Int32Array
  readonly bond: Int32Array
  readonly mass: number
  readonly capacity: number
}

export type MatterState = {
  readonly lattice: FiniteGaugeLattice
  readonly vibe: Int8Array
  readonly color: Int16Array
  readonly linkDemons: Int32Array
  readonly siteDemons: Int32Array
}

// the bond level of link (x, mu) with u in place, zero unless both ends hold a vibe
function bondOf(
  model: MatterModel,
  state: MatterState,
  x: number,
  mu: number,
  u: number,
): number {
  const { geometry } = state.lattice
  const y = geometry.up[x * geometry.dim + mu] ?? 0

  if (state.vibe[x] === 0 || state.vibe[y] === 0) {
    return 0
  }

  const n = model.triplet.size
  const moved = model.triplet.act[u * n + (state.color[y] ?? 0)] ?? 0

  return model.bond[(state.color[x] ?? 0) * n + moved] ?? 0
}

// the six staples of link (site, mu), U s_k being the six plaquettes through it (as in finite-kinetic)
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

// One kinetic sweep of the links, the bond of each link added to its local energy.
export function matterLinkSweep(input: {
  model: MatterModel
  state: MatterState
  reverse?: boolean
}): number {
  const { model, state } = input
  const { lattice, linkDemons } = state
  const { group, geometry, links } = lattice
  const { dim, sites, lengths } = geometry
  const staple = new Int32Array(2 * (dim - 1))
  const classes: [number, number][] = []
  const reverse = input.reverse === true

  for (let mu = 0; mu < dim; mu++) {
    for (let parity = 0; parity < 2; parity++) {
      classes.push([mu, parity])
    }
  }

  if (reverse) {
    classes.reverse()
  }

  const local = (site: number, mu: number, value: number): number => {
    let sum = bondOf(model, state, site, mu, value)

    for (const s of staple) {
      sum +=
        model.plaquetteLevels[
          group.product[value * group.order + s] ?? 0
        ] ?? 0
    }

    return sum
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
      const total = local(site, mu, current) + (linkDemons[index] ?? 0)

      for (let shift = 1; shift < group.order; shift++) {
        const candidate = reverse
          ? (current - shift + group.order) % group.order
          : (current + shift) % group.order
        const demon = total - local(site, mu, candidate)

        if (demon >= 0 && demon <= model.capacity) {
          updates.push([index, candidate, demon])
          break
        }
      }
    }

    for (const [index, value, demon] of updates) {
      links[index] = value
      linkDemons[index] = demon
      moves += 1
    }
  }

  return moves
}

function siteParity(geometry: FiniteGaugeLattice['geometry'], site: number): number {
  let rest = site
  let sum = 0

  for (const length of geometry.lengths) {
    sum += rest % length
    rest = Math.floor(rest / length)
  }

  return sum % 2
}

// the energy that depends on the state of site x: its mass and its bonds to every neighbour
function siteEnergy(model: MatterModel, state: MatterState, x: number): number {
  const { geometry, links } = state.lattice
  const { dim, down } = geometry

  if (state.vibe[x] === 0) {
    return 0
  }

  let sum = model.mass

  for (let mu = 0; mu < dim; mu++) {
    sum += bondOf(model, state, x, mu, links[x * dim + mu] ?? 0)

    const below = down[x * dim + mu] ?? 0

    sum += bondOf(model, state, below, mu, links[below * dim + mu] ?? 0)
  }

  return sum
}

// One sweep of the site colors, a checkerboard class at a time: the next admissible color in index order.
export function matterColorSweep(input: {
  model: MatterModel
  state: MatterState
  reverse?: boolean
}): number {
  const { model, state } = input
  const { geometry } = state.lattice
  const n = model.triplet.size
  const reverse = input.reverse === true
  const order = reverse ? [1, 0] : [0, 1]

  let moves = 0

  for (const parity of order) {
    for (let x = 0; x < geometry.sites; x++) {
      if (siteParity(geometry, x) !== parity) {
        continue
      }

      const current = state.color[x] ?? 0
      const total = siteEnergy(model, state, x) + (state.siteDemons[x] ?? 0)

      for (let shift = 1; shift < n; shift++) {
        const candidate = reverse
          ? (current - shift + n) % n
          : (current + shift) % n

        state.color[x] = candidate

        const demon = total - siteEnergy(model, state, x)

        if (demon >= 0 && demon <= model.capacity) {
          state.siteDemons[x] = demon
          moves += 1
          break
        }

        state.color[x] = current
      }
    }
  }

  return moves
}

const VIBE_PAIRS: Record<number, readonly (readonly [number, number])[]> = {
  [-2]: [[-1, -1]],
  [-1]: [
    [-1, 0],
    [0, -1],
  ],
  0: [
    [0, 0],
    [1, -1],
    [-1, 1],
  ],
  1: [
    [1, 0],
    [0, 1],
  ],
  2: [[1, 1]],
}

// the energy of every term touching x or y, each counted once
function dimerEnergy(
  model: MatterModel,
  state: MatterState,
  x: number,
  y: number,
  mu: number,
): number {
  const { links, geometry } = state.lattice

  return (
    siteEnergy(model, state, x) +
    siteEnergy(model, state, y) -
    bondOf(model, state, x, mu, links[x * geometry.dim + mu] ?? 0)
  )
}

// One sweep of the dimers, one link at a time in a fixed order, each paid from its link's demon.
export function matterDimerSweep(input: {
  model: MatterModel
  state: MatterState
  reverse?: boolean
}): { hops: number; created: number; annihilated: number } {
  const { model, state } = input
  const { geometry, links, group } = state.lattice
  const { dim, sites, up } = geometry
  const n = model.triplet.size
  const act = model.triplet.act
  const reverse = input.reverse === true
  const count = { hops: 0, created: 0, annihilated: 0 }

  for (let step = 0; step < sites * dim; step++) {
    const k = reverse ? sites * dim - 1 - step : step
    const x = Math.floor(k / dim)
    const mu = k % dim
    const y = up[x * dim + mu] ?? 0
    const u = links[x * dim + mu] ?? 0
    const vx = state.vibe[x] ?? 0
    const vy = state.vibe[y] ?? 0
    const cx = state.color[x] ?? 0
    const cy = state.color[y] ?? 0
    // the two arrangements of color, as found and after the transported swap
    const swapped: [number, number] = [
      act[u * n + cy] ?? 0,
      act[(group.inverse[u] ?? 0) * n + cx] ?? 0,
    ]
    const arrangements: [number, number][] = [[cx, cy]]

    if (swapped[0] !== cx || swapped[1] !== cy) {
      arrangements.push(swapped)
    }

    arrangements.sort((p, q) => p[0] * n + p[1] - (q[0] * n + q[1]))

    const pairs = VIBE_PAIRS[vx + vy] ?? []
    const members: [number, number, number, number][] = []

    for (const [a, b] of arrangements) {
      for (const [p, q] of pairs) {
        members.push([p, a, q, b])
      }
    }

    const at = members.findIndex(
      ([p, a, q, b]) => p === vx && a === cx && q === vy && b === cy,
    )

    if (members.length < 2 || at < 0) {
      continue
    }

    const demonIndex = x * dim + mu
    const total =
      dimerEnergy(model, state, x, y, mu) + (state.linkDemons[demonIndex] ?? 0)

    const place = (member: [number, number, number, number]): void => {
      state.vibe[x] = member[0]
      state.color[x] = member[1]
      state.vibe[y] = member[2]
      state.color[y] = member[3]
    }

    for (let shift = 1; shift < members.length; shift++) {
      const next = reverse
        ? (at - shift + members.length) % members.length
        : (at + shift) % members.length
      const member = members[next] ?? members[at]!

      place(member)

      const demon = total - dimerEnergy(model, state, x, y, mu)

      if (demon >= 0 && demon <= model.capacity) {
        state.linkDemons[demonIndex] = demon

        const before = (vx !== 0 ? 1 : 0) + (vy !== 0 ? 1 : 0)
        const after = (member[0] !== 0 ? 1 : 0) + (member[2] !== 0 ? 1 : 0)

        if (after > before) {
          count.created += 1
        } else if (after < before) {
          count.annihilated += 1
        } else if (member[0] !== vx || member[2] !== vy) {
          count.hops += 1
        }

        break
      }

      place([vx, cx, vy, cy])
    }
  }

  return count
}

// each site demon trades one unit cyclically with the demon of link (x, axis)
export function exchangeSiteDemons(input: {
  model: MatterModel
  state: MatterState
  step: number
  reverse?: boolean
}): void {
  const { model, state, step } = input
  const { dim, sites } = state.lattice.geometry
  const axis = ((step % dim) + dim) % dim
  const capacity = model.capacity

  for (let x = 0; x < sites; x++) {
    const b = x * dim + axis
    const sum = (state.siteDemons[x] ?? 0) + (state.linkDemons[b] ?? 0)
    const low = Math.max(0, sum - capacity)
    const high = Math.min(capacity, sum)
    const span = high - low + 1
    const shift = input.reverse === true ? span - 1 : 1
    const next = low + (((state.siteDemons[x] ?? 0) - low + shift) % span)

    state.siteDemons[x] = next
    state.linkDemons[b] = sum - next
  }
}

export const MATTER_EXCHANGES = 4

// One beat: links, colors, dimers, then the demons stream and trade. `matter: false` skips the matter
// moves, which is the pure gauge automaton with the same demons.
export function matterBeat(input: {
  model: MatterModel
  state: MatterState
  step: number
  matter?: boolean
}): { hops: number; created: number; annihilated: number } {
  const { model, state, step } = input
  const withMatter = input.matter !== false
  const lattice = state.lattice

  matterLinkSweep({ model, state })

  let count = { hops: 0, created: 0, annihilated: 0 }

  if (withMatter) {
    matterColorSweep({ model, state })
    count = matterDimerSweep({ model, state })
  }

  streamFiniteDemons({ lattice, demons: state.linkDemons, step })

  for (let k = 0; k < MATTER_EXCHANGES; k++) {
    exchangeFiniteDemons({
      lattice,
      demons: state.linkDemons,
      capacity: model.capacity,
      step: k,
    })
  }

  if (withMatter) {
    exchangeSiteDemons({ model, state, step })
  }

  return count
}

export function matterBeatBack(input: {
  model: MatterModel
  state: MatterState
  step: number
  matter?: boolean
}): void {
  const { model, state, step } = input
  const withMatter = input.matter !== false
  const lattice = state.lattice

  if (withMatter) {
    exchangeSiteDemons({ model, state, step, reverse: true })
  }

  for (let k = MATTER_EXCHANGES - 1; k >= 0; k--) {
    exchangeFiniteDemons({
      lattice,
      demons: state.linkDemons,
      capacity: model.capacity,
      step: k,
      reverse: true,
    })
  }

  streamFiniteDemons({ lattice, demons: state.linkDemons, step, reverse: true })

  if (withMatter) {
    matterDimerSweep({ model, state, reverse: true })
    matterColorSweep({ model, state, reverse: true })
  }

  matterLinkSweep({ model, state, reverse: true })
}

// The total energy: plaquettes, masses, bonds and every demon.
export function matterEnergy(input: {
  model: MatterModel
  state: MatterState
}): { total: number; gauge: number; matter: number; demons: number } {
  const { model, state } = input
  const { lattice } = state
  const { dim, sites } = lattice.geometry
  const gauge = quantizedEnergy({ lattice, levels: model.plaquetteLevels })

  let matter = 0

  for (let x = 0; x < sites; x++) {
    matter += state.vibe[x] !== 0 ? model.mass : 0

    for (let mu = 0; mu < dim; mu++) {
      matter += bondOf(model, state, x, mu, lattice.links[x * dim + mu] ?? 0)
    }
  }

  let demons = 0

  for (const d of state.linkDemons) {
    demons += d
  }

  for (const d of state.siteDemons) {
    demons += d
  }

  return { total: gauge + matter + demons, gauge, matter, demons }
}

// the matter energy alone: masses and bonds
export function matterOnlyEnergy(input: {
  model: MatterModel
  state: MatterState
}): number {
  return matterEnergy(input).matter
}

// The fundamental Polyakov loop Tr P / 3 at every spatial site, the last axis being time.
export function polyakovField(lattice: FiniteGaugeLattice): {
  re: Float64Array
  im: Float64Array
} {
  const { group, geometry, links } = lattice
  const { dim, sites, up, lengths } = geometry
  const time = dim - 1
  const nt = lengths[time] ?? 1
  const spatial = sites / nt
  const re = new Float64Array(spatial)
  const im = new Float64Array(spatial)

  for (let site = 0; site < spatial; site++) {
    let product = group.identity
    let current = site

    for (let t = 0; t < nt; t++) {
      product =
        group.product[
          product * group.order + (links[current * dim + time] ?? 0)
        ] ?? 0
      current = up[current * dim + time] ?? 0
    }

    const m = group.matrices[product]

    re[site] = ((m?.[0] ?? 0) + (m?.[8] ?? 0) + (m?.[16] ?? 0)) / 3
    im[site] = ((m?.[1] ?? 0) + (m?.[9] ?? 0) + (m?.[17] ?? 0)) / 3
  }

  return { re, im }
}

// The Polyakov loop correlator Re <P(x) P*(x + R e_i)>, averaged over spatial sites and the spatial axes,
// for R = 0 .. max, and the volume mean of P.
export function polyakovCorrelator(input: {
  lattice: FiniteGaugeLattice
  max: number
}): { correlator: number[]; re: number; im: number } {
  const { lattice, max } = input
  const { dim, up } = lattice.geometry
  const { re, im } = polyakovField(lattice)
  const spatial = re.length
  const correlator: number[] = []

  for (let r = 0; r <= max; r++) {
    let sum = 0
    let count = 0

    for (let axis = 0; axis < dim - 1; axis++) {
      for (let site = 0; site < spatial; site++) {
        let other = site

        for (let k = 0; k < r; k++) {
          other = up[other * dim + axis] ?? 0
        }

        sum +=
          (re[site] ?? 0) * (re[other] ?? 0) +
          (im[site] ?? 0) * (im[other] ?? 0)
        count += 1
      }
    }

    correlator.push(sum / count)
  }

  let meanRe = 0
  let meanIm = 0

  for (let site = 0; site < spatial; site++) {
    meanRe += re[site] ?? 0
    meanIm += im[site] ?? 0
  }

  return { correlator, re: meanRe / spatial, im: meanIm / spatial }
}

// the index of the center element omega I
export function centerElement(group: FiniteGroup): number {
  for (let g = 0; g < group.order; g++) {
    const m = group.matrices[g]

    if (
      m !== undefined &&
      Math.abs((m[0] ?? 0) + 0.5) < 1e-9 &&
      Math.abs((m[1] ?? 0) - Math.sqrt(3) / 2) < 1e-9 &&
      Math.abs((m[8] ?? 0) + 0.5) < 1e-9 &&
      Math.abs((m[16] ?? 0) + 0.5) < 1e-9 &&
      Math.abs(m[2] ?? 0) + Math.abs(m[3] ?? 0) < 1e-9
    ) {
      return g
    }
  }

  throw new Error('no center element omega I')
}

// Multiply every time link leaving time slice 0 by the center element z, in place: the pure gauge action
// is unchanged, every Polyakov loop is multiplied by omega.
export function centerRotateSlice(input: {
  lattice: FiniteGaugeLattice
  z: number
}): void {
  const { lattice, z } = input
  const { group, geometry, links } = lattice
  const { dim, sites, lengths } = geometry
  const time = dim - 1
  const spatial = sites / (lengths[time] ?? 1)

  for (let site = 0; site < spatial; site++) {
    const index = site * dim + time

    links[index] = group.product[z * group.order + (links[index] ?? 0)] ?? 0
  }
}

// A change of frame g_x in every cell, in place: links U -> g_x U g_y^-1, colors phi -> g_x phi.
export function changeFrame(input: {
  model: MatterModel
  state: MatterState
  frame: Int32Array
}): void {
  const { model, state, frame } = input
  const { group, geometry, links } = state.lattice
  const { dim, sites, up } = geometry
  const n = model.triplet.size

  for (let x = 0; x < sites; x++) {
    for (let mu = 0; mu < dim; mu++) {
      const y = up[x * dim + mu] ?? 0
      const g = frame[x] ?? 0
      const h = group.inverse[frame[y] ?? 0] ?? 0
      const index = x * dim + mu

      links[index] =
        group.product[
          (group.product[g * group.order + (links[index] ?? 0)] ?? 0) *
            group.order +
            h
        ] ?? 0
    }
  }

  for (let x = 0; x < sites; x++) {
    state.color[x] = model.triplet.act[(frame[x] ?? 0) * n + (state.color[x] ?? 0)] ?? 0
  }
}
