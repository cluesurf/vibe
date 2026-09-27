// A U(1) link sector, compact U(1) approximated by Z_N, run as Hamiltonian lattice gauge theory on
// integers: light for the knit.
//
// Each link holds an angle A in Z_N (the phase 2 pi A / N) and its conjugate electric flux E, an integer,
// the flow of E-FRC-0123. Each dock holds a vibe (fear -1, calm 0, love +1). Gauss's law: the flux leaving
// a dock is its vibe. The plaquettes are the smallest closed loops of the lattice: the triangles of the D4
// box (three roots summing to zero, 32 per dock), or the squares of the cubic torus (3 per dock), the flat
// 3D space of the horosphere. The magnetic field of a plaquette is B = the oriented sum of A round it,
// mod N, which a frame change A -> A + chi_y - chi_x leaves alone.
//
// The Hamiltonian, in units where a unit of flux carries energy 1/2:
//
//   H = sum over links of E^2 / 2  +  (K N / 2 pi) * sum over plaquettes of (1 - cos(2 pi B / N))
//
// Two forms of the same sector, chosen by `mode`.
//
// `leapfrog` (the light): each beat is two shears, the same shape as flow <- flow + vibe (E-FRC-0116)
//   1. drift: A <- A + E mod N on every link
//   2. kick: E <- E - sum over plaquettes p holding the link of (its orientation in p) * f(B_p), with
//      f(B) = round(K sin(2 pi B / N)) rounded symmetrically, so f is odd
// Each shear adds a function of the other variable only, so a beat is a bijection and runs backward by
// subtracting in the reverse order, exactly. The kick adds a curl, so Gauss's law is untouched, and B is
// frame invariant, so the rule commutes with a Z_N frame change in every dock. Linearized, the beat is the
// leapfrog of the lattice wave equation, 4 sin^2(omega / 2) = kappa lambda(k), kappa = 2 pi K / N and
// lambda the eigenvalues of the curl-curl operator, stable while kappa lambda_max < 4. The energy is not a
// conserved integer: a leapfrog keeps a shadow energy, 1/2 E(-) . E(+) + V with E(-) and E(+) the fluxes
// before and after the last kick, exact for a quadratic V and bounded for this one.
//
// `demon` (exact energy): the moves of code/rule/sigma-links written for Z_N, each an involution given what
// it reads and paid by its link's demon, so the integer energy
//   H2 = sum of E^2 + sum over plaquettes of round((K N / pi)(1 - cos(2 pi B / N))) + sum of demons
// (twice H, in units of one half) is conserved to the unit:
//   1. links: A -> -A - 2 s R, reflecting through one plaquette (B -> -B there), the plaquette turning with
//      the beat, R the rest of that plaquette and s the link's orientation in it. Frame covariant
//   2. flux loops: E round each plaquette by +1 or -1 as the first link's oriented flux is even or odd
// It has no drift: nothing moves A by E, so E and A meet only through the energy they pay the demons.
//
// Both forms carry the matter the same way, as E-FRC-0144 and code/rule/string-graph do: a vibe crosses an
// empty neighbor along a link, one link at a time in a fixed order, changing that link's flux by its charge
// (-e v leaving the first dock), taken only where the link's demon can pay the change in E^2 (units of one
// half) and stay within 0 and its capacity. So a moving charge drags its flux. Then the demons stream, each
// to the next link along its direction. `charge`, the e above, is the flux one vibe carries in the units
// the field resolves: Gauss's law reads divergence = e * vibe. It is 1 by default. A larger e is a
// stronger coupling, and lets a single pair's field stand clear of the rounding of the force.
//
// Switches for controls only: `gauss: false` hops without moving the flux, `kick: 'link'` puts each
// plaquette's force on its first link alone (not a curl, so Gauss's law breaks), `kick: 'angle'` computes
// the force from the link's own angle instead of B (not frame invariant).

import { rootsD4 } from '@/code/algebra/group/root-system'
import { d4BoxCoordinates, d4BoxMesh } from '@/code/substrate/d4-box'
import { cubicMesh, CUBIC_DIRECTIONS, type Mesh } from '@/code/tool/mesh'

const GOLDEN = (Math.sqrt(5) - 1) / 2

// k = (2 pi / side) WAVE n for the D4 box: the rows of the inverse basis, transposed (see code/substrate/d4-box)
const D4_WAVE: readonly (readonly number[])[] = [
  [1, 1, 0.5, 0.5],
  [0, 1, 0.5, 0.5],
  [0, 0, 0.5, 0.5],
  [0, 0, -0.5, 0.5],
]

export type PhotonLattice = {
  readonly id: string
  readonly side: number
  readonly dimension: number
  readonly cells: number
  readonly degree: number
  readonly neighbour: Int32Array
  readonly opposite: readonly number[]
  // the link directions: d < opposite[d]
  readonly firsts: readonly number[]
  readonly firstOf: Int32Array
  // the physical vector of each direction
  readonly vectors: readonly (readonly number[])[]
  // integer lattice coordinates of each dock, cells * dimension, mod side
  readonly coordinates: Int32Array
  // physical wave vector of the integer mode n: k = (2 pi / side) wave n
  readonly wave: readonly (readonly number[])[]
  readonly links: number
  readonly plaquetteSize: number
  readonly plaquetteCount: number
  // plaquette p holds links plaquetteLinks[p * size + j], oriented by plaquetteSigns
  readonly plaquetteLinks: Int32Array
  readonly plaquetteSigns: Int8Array
  // for each link, the entries (p * size + j) of the plaquettes holding it
  readonly linkOffsets: Int32Array
  readonly linkEntries: Int32Array
}

export type PhotonRule = {
  readonly lattice: PhotonLattice
  readonly mode: 'leapfrog' | 'demon'
  readonly n: number
  readonly k: number
  // force[B] = round(K sin(2 pi B / N)), odd
  readonly force: Int32Array
  // level[B] = round((K N / pi)(1 - cos(2 pi B / N))), the demon form's magnetic energy in half units
  readonly level: Int32Array
  readonly capacity: number
  // the flux one vibe carries, e: Gauss's law reads divergence = e * vibe (1 by default)
  readonly charge: number
  readonly hop: boolean
  readonly gauss: boolean
  readonly kick: 'curl' | 'link' | 'angle'
}

export type PhotonState = {
  readonly vibe: Int8Array
  // angle[l] in 0 .. N - 1
  readonly angle: Int32Array
  readonly flux: Int32Array
  // demon[l], in units of one half
  readonly demon: Int32Array
}

export type PhotonMoves = { links: number; loops: number; hops: number }

const modulo = (x: number, m: number): number => ((x % m) + m) % m

// a PhotonLattice from any mesh, its link directions the mesh's first directions, and its plaquettes built by
// the caller (none, for a lattice that is only read, not run)
export function buildPhotonLattice(input: {
  id: string
  side: number
  dimension: number
  mesh: Mesh
  vectors: readonly (readonly number[])[]
  coordinates: (cell: number) => number[]
  wave: readonly (readonly number[])[]
  plaquettes: (lattice: { cells: number; neighbour: Int32Array; firstOf: Int32Array; opposite: readonly number[]; f: number }) => {
    size: number
    links: number[]
    signs: number[]
  }
}): PhotonLattice {
  const { mesh } = input
  const cells = mesh.cellCount
  const degree = mesh.degree
  const neighbour = new Int32Array(cells * degree)

  for (let x = 0; x < cells; x++) {
    for (let d = 0; d < degree; d++) {
      neighbour[x * degree + d] = mesh.neighbour(x, d)
    }
  }

  const opposite = Array.from({ length: degree }, (_, d) => mesh.opposite(d))
  const firsts = opposite.map((o, d) => (d < o ? d : -1)).filter(d => d >= 0)
  const firstOf = new Int32Array(degree).fill(-1)

  firsts.forEach((d, k) => (firstOf[d] = k))

  const coordinates = new Int32Array(cells * input.dimension)

  for (let x = 0; x < cells; x++) {
    input.coordinates(x).forEach((c, i) => (coordinates[x * input.dimension + i] = c))
  }

  const f = firsts.length
  const built = input.plaquettes({ cells, neighbour, firstOf, opposite, f })
  const plaquetteLinks = Int32Array.from(built.links)
  const plaquetteSigns = Int8Array.from(built.signs)
  const links = cells * f
  const counts = new Int32Array(links + 1)

  for (const l of built.links) {
    counts[l + 1] = (counts[l + 1] ?? 0) + 1
  }

  for (let l = 0; l < links; l++) {
    counts[l + 1] = (counts[l + 1] ?? 0) + (counts[l] ?? 0)
  }

  const fill = Int32Array.from(counts)
  const linkEntries = new Int32Array(built.links.length)

  built.links.forEach((l, e) => {
    linkEntries[fill[l] ?? 0] = e
    fill[l] = (fill[l] ?? 0) + 1
  })

  return {
    id: input.id,
    side: input.side,
    dimension: input.dimension,
    cells,
    degree,
    neighbour,
    opposite,
    firsts,
    firstOf,
    vectors: input.vectors,
    coordinates,
    wave: input.wave,
    links,
    plaquetteSize: built.size,
    plaquetteCount: built.links.length / built.size,
    plaquetteLinks,
    plaquetteSigns,
    linkOffsets: counts,
    linkEntries,
  }
}

// the link index and orientation of the step from x along d
function stepLink(input: { neighbour: Int32Array; firstOf: Int32Array; opposite: readonly number[]; f: number; degree: number }, x: number, d: number): [number, number] {
  const k = input.firstOf[d] ?? -1

  if (k >= 0) {
    return [x * input.f + k, 1]
  }

  const o = input.opposite[d] ?? d

  return [(input.neighbour[x * input.degree + d] ?? 0) * input.f + (input.firstOf[o] ?? 0), -1]
}

// The D4 box of code/substrate/d4-box, side^4 docks, 12 links and 32 triangles per dock. A triangle is kept
// once, from the start and orientation whose first step has the smallest direction index of the six.
export function photonLatticeD4(input: { side: number }): PhotonLattice {
  const roots = rootsD4()
  const find = (v: readonly number[]): number => roots.findIndex(r => r.every((x, k) => x === v[k]))
  const degree = 24

  return buildPhotonLattice({
    id: `d4-box-${input.side}`,
    side: input.side,
    dimension: 4,
    mesh: d4BoxMesh({ side: input.side }),
    vectors: roots,
    coordinates: cell => d4BoxCoordinates({ cell, side: input.side }),
    wave: D4_WAVE,
    plaquettes: ({ cells, neighbour, firstOf, opposite, f }) => {
      const links: number[] = []
      const signs: number[] = []
      const ctx = { neighbour, firstOf, opposite, f, degree }

      for (let x = 0; x < cells; x++) {
        for (let a = 0; a < degree; a++) {
          for (let b = 0; b < degree; b++) {
            const c = find(roots[a]!.map((v, k) => -v - (roots[b]![k] ?? 0)))

            if (c < 0 || a >= Math.min(b, c, opposite[a] ?? 0, opposite[b] ?? 0, opposite[c] ?? 0)) {
              continue
            }

            const y = neighbour[x * degree + a] ?? 0
            const z = neighbour[y * degree + b] ?? 0

            for (const [from, d] of [
              [x, a],
              [y, b],
              [z, c],
            ] as const) {
              const [l, s] = stepLink(ctx, from, d)

              links.push(l)
              signs.push(s)
            }
          }
        }
      }

      return { size: 3, links, signs }
    },
  })
}

// The cubic torus side^3, 3 links and 3 squares per dock: the flat 3D space of the horosphere ({4,3,4}).
export function photonLatticeCubic(input: { side: number }): PhotonLattice {
  const degree = 6
  const side = input.side

  return buildPhotonLattice({
    id: `cubic-${side}`,
    side,
    dimension: 3,
    mesh: cubicMesh({ side }),
    vectors: CUBIC_DIRECTIONS,
    coordinates: cell => [cell % side, Math.floor(cell / side) % side, Math.floor(cell / (side * side))],
    wave: [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ],
    plaquettes: ({ cells, neighbour, firstOf, opposite, f }) => {
      const links: number[] = []
      const signs: number[] = []
      const ctx = { neighbour, firstOf, opposite, f, degree }

      for (let x = 0; x < cells; x++) {
        for (const [mu, nu] of [
          [0, 2],
          [0, 4],
          [2, 4],
        ] as const) {
          const y = neighbour[x * degree + mu] ?? 0
          const z = neighbour[y * degree + nu] ?? 0
          const w = neighbour[x * degree + nu] ?? 0

          for (const [from, d] of [
            [x, mu],
            [y, nu],
            [z, opposite[mu] ?? 0],
            [w, opposite[nu] ?? 0],
          ] as const) {
            const [l, s] = stepLink(ctx, from, d)

            links.push(l)
            signs.push(s)
          }
        }
      }

      return { size: 4, links, signs }
    },
  })
}

export function makePhotonRule(input: {
  lattice: PhotonLattice
  mode?: 'leapfrog' | 'demon'
  n: number
  k: number
  capacity: number
  charge?: number
  hop?: boolean
  gauss?: boolean
  kick?: 'curl' | 'link' | 'angle'
}): PhotonRule {
  const { n, k } = input
  const force = new Int32Array(n)
  const level = new Int32Array(n)

  for (let b = 0; b < n; b++) {
    const s = k * Math.sin((2 * Math.PI * b) / n)

    force[b] = Math.sign(s) * Math.round(Math.abs(s))
    level[b] = Math.round(((k * n) / Math.PI) * (1 - Math.cos((2 * Math.PI * b) / n)))
  }

  return {
    lattice: input.lattice,
    mode: input.mode ?? 'leapfrog',
    n,
    k,
    force,
    level,
    capacity: input.capacity,
    charge: input.charge ?? 1,
    hop: input.hop ?? true,
    gauss: input.gauss ?? true,
    kick: input.kick ?? 'curl',
  }
}

// the link of the step from dock x along direction d, and its orientation
export function photonLink(lattice: PhotonLattice, x: number, d: number): [number, number] {
  return stepLink({ ...lattice, f: lattice.firsts.length }, x, d)
}

// B of plaquette p, in 0 .. N - 1
export function plaquetteField(rule: PhotonRule, angle: Int32Array, p: number): number {
  const size = rule.lattice.plaquetteSize

  let b = 0

  for (let j = 0; j < size; j++) {
    b += (rule.lattice.plaquetteSigns[p * size + j] ?? 0) * (angle[rule.lattice.plaquetteLinks[p * size + j] ?? 0] ?? 0)
  }

  return modulo(b, rule.n)
}

function drift(rule: PhotonRule, state: PhotonState, sign: number): void {
  const { angle, flux } = state

  for (let l = 0; l < angle.length; l++) {
    angle[l] = modulo((angle[l] ?? 0) + sign * (flux[l] ?? 0), rule.n)
  }
}

// E <- E - sign * (the force), the force read from the angles, which the kick does not change
function kick(rule: PhotonRule, state: PhotonState, sign: number): void {
  const { lattice } = rule
  const size = lattice.plaquetteSize
  const { angle, flux } = state

  for (let p = 0; p < lattice.plaquetteCount; p++) {
    const first = lattice.plaquetteLinks[p * size] ?? 0
    const b = rule.kick === 'angle' ? modulo(angle[first] ?? 0, rule.n) : plaquetteField(rule, angle, p)
    const f = rule.force[b] ?? 0

    if (f === 0) {
      continue
    }

    if (rule.kick === 'link') {
      flux[first] = (flux[first] ?? 0) - sign * (lattice.plaquetteSigns[p * size] ?? 0) * f

      continue
    }

    for (let j = 0; j < size; j++) {
      const l = lattice.plaquetteLinks[p * size + j] ?? 0

      flux[l] = (flux[l] ?? 0) - sign * (lattice.plaquetteSigns[p * size + j] ?? 0) * f
    }
  }
}

function pay(rule: PhotonRule, state: PhotonState, l: number, cost: number): boolean {
  const next = (state.demon[l] ?? 0) - cost

  if (next < 0 || next > rule.capacity) {
    return false
  }

  state.demon[l] = next

  return true
}

// the magnetic level of every plaquette through link l, with u in its place
function linkLevel(rule: PhotonRule, angle: Int32Array, l: number, u: number): number {
  const { lattice } = rule
  const saved = angle[l] ?? 0

  angle[l] = u

  let total = 0

  for (let i = lattice.linkOffsets[l] ?? 0; i < (lattice.linkOffsets[l + 1] ?? 0); i++) {
    total += rule.level[plaquetteField(rule, angle, Math.floor((lattice.linkEntries[i] ?? 0) / lattice.plaquetteSize))] ?? 0
  }

  angle[l] = saved

  return total
}

// the demon form's link move: reflect through plaquette number s of the link, B -> -B there
function reflectLink(rule: PhotonRule, state: PhotonState, l: number, s: number): boolean {
  const { lattice } = rule
  const through = (lattice.linkOffsets[l + 1] ?? 0) - (lattice.linkOffsets[l] ?? 0)
  const entry = lattice.linkEntries[(lattice.linkOffsets[l] ?? 0) + (s % through)] ?? 0
  const p = Math.floor(entry / lattice.plaquetteSize)
  const own = lattice.plaquetteSigns[entry] ?? 0
  const u = state.angle[l] ?? 0
  const rest = plaquetteField(rule, state.angle, p) - own * u
  const next = modulo(-u - 2 * own * rest, rule.n)

  if (next === u) {
    return false
  }

  if (!pay(rule, state, l, linkLevel(rule, state.angle, l, next) - linkLevel(rule, state.angle, l, u))) {
    return false
  }

  state.angle[l] = next

  return true
}

// the demon form's flux loop round plaquette p, paid by the demon of its first link
function loopMove(rule: PhotonRule, state: PhotonState, p: number): boolean {
  const { lattice } = rule
  const size = lattice.plaquetteSize
  const first = lattice.plaquetteLinks[p * size] ?? 0
  const oriented = (lattice.plaquetteSigns[p * size] ?? 0) * (state.flux[first] ?? 0)
  const step = modulo(oriented, 2) === 0 ? 1 : -1

  let cost = 0

  for (let j = 0; j < size; j++) {
    const l = lattice.plaquetteLinks[p * size + j] ?? 0
    const e = state.flux[l] ?? 0
    const after = e + step * (lattice.plaquetteSigns[p * size + j] ?? 0)

    cost += after * after - e * e
  }

  if (!pay(rule, state, first, cost)) {
    return false
  }

  for (let j = 0; j < size; j++) {
    const l = lattice.plaquetteLinks[p * size + j] ?? 0

    state.flux[l] = (state.flux[l] ?? 0) + step * (lattice.plaquetteSigns[p * size + j] ?? 0)
  }

  return true
}

// a vibe crosses link l (dock x to dock y along first direction), paid in E^2 by the link's demon
function hop(rule: PhotonRule, state: PhotonState, x: number, k: number): boolean {
  const { lattice } = rule
  const l = x * lattice.firsts.length + k
  const y = lattice.neighbour[x * lattice.degree + (lattice.firsts[k] ?? 0)] ?? 0
  const a = state.vibe[x] ?? 0
  const b = state.vibe[y] ?? 0

  if ((a === 0) === (b === 0) || x === y) {
    return false
  }

  // the change of the flux x -> y: -v leaving x, +v coming back
  const change = rule.gauss ? rule.charge * (a !== 0 ? -a : b) : 0
  const e = state.flux[l] ?? 0

  if (!pay(rule, state, l, (e + change) * (e + change) - e * e)) {
    return false
  }

  state.vibe[x] = b
  state.vibe[y] = a
  state.flux[l] = e + change

  return true
}

function hops(rule: PhotonRule, state: PhotonState, forward: boolean): number {
  const { lattice } = rule
  const f = lattice.firsts.length

  let moved = 0

  for (let i = 0; i < lattice.links; i++) {
    const l = forward ? i : lattice.links - 1 - i

    moved += hop(rule, state, Math.floor(l / f), l % f) ? 1 : 0
  }

  return moved
}

function streamDemons(rule: PhotonRule, demon: Int32Array, forward: boolean): void {
  const { lattice } = rule
  const f = lattice.firsts.length
  const old = Int32Array.from(demon)

  for (let x = 0; x < lattice.cells; x++) {
    for (let k = 0; k < f; k++) {
      const y = lattice.neighbour[x * lattice.degree + (lattice.firsts[k] ?? 0)] ?? 0

      if (forward) {
        demon[y * f + k] = old[x * f + k] ?? 0
      } else {
        demon[x * f + k] = old[y * f + k] ?? 0
      }
    }
  }
}

export function copyPhotonState(state: PhotonState): PhotonState {
  return {
    vibe: Int8Array.from(state.vibe),
    angle: Int32Array.from(state.angle),
    flux: Int32Array.from(state.flux),
    demon: Int32Array.from(state.demon),
  }
}

// one beat, in place
export function photonBeatInPlace(rule: PhotonRule, state: PhotonState, t: number): PhotonMoves {
  const moved: PhotonMoves = { links: 0, loops: 0, hops: 0 }

  if (rule.mode === 'leapfrog') {
    drift(rule, state, 1)
    kick(rule, state, 1)
  } else {
    for (let l = 0; l < rule.lattice.links; l++) {
      moved.links += reflectLink(rule, state, l, t) ? 1 : 0
    }

    for (let p = 0; p < rule.lattice.plaquetteCount; p++) {
      moved.loops += loopMove(rule, state, p) ? 1 : 0
    }
  }

  if (rule.hop) {
    moved.hops += hops(rule, state, true)
  }

  streamDemons(rule, state.demon, true)

  return moved
}

// the inverse of one beat, in place
export function photonBeatBackInPlace(rule: PhotonRule, state: PhotonState, t: number): void {
  streamDemons(rule, state.demon, false)

  if (rule.hop) {
    hops(rule, state, false)
  }

  if (rule.mode === 'leapfrog') {
    kick(rule, state, -1)
    drift(rule, state, -1)
  } else {
    for (let p = rule.lattice.plaquetteCount - 1; p >= 0; p--) {
      loopMove(rule, state, p)
    }

    for (let l = rule.lattice.links - 1; l >= 0; l--) {
      reflectLink(rule, state, l, t)
    }
  }
}

export function photonBeat(rule: PhotonRule, input: PhotonState, t: number): { state: PhotonState; moved: PhotonMoves } {
  const state = copyPhotonState(input)
  const moved = photonBeatInPlace(rule, state, t)

  return { state, moved }
}

export function photonBeatBack(rule: PhotonRule, input: PhotonState, t: number): PhotonState {
  const state = copyPhotonState(input)

  photonBeatBackInPlace(rule, state, t)

  return state
}

// the flux the last kick added, recomputed from the angles: E(-) = E(+) + force
export function lastKick(rule: PhotonRule, state: PhotonState): Int32Array {
  const probe = { ...copyPhotonState(state), flux: new Int32Array(state.flux.length) }

  kick(rule, probe, 1)

  return Int32Array.from(probe.flux, v => -v)
}

// sum of (1 - cos(2 pi B / N)) over the plaquettes, and the plaquette mean of cos
export function magneticSum(rule: PhotonRule, angle: Int32Array): { sum: number; meanCos: number } {
  let sum = 0

  for (let p = 0; p < rule.lattice.plaquetteCount; p++) {
    sum += 1 - Math.cos((2 * Math.PI * plaquetteField(rule, angle, p)) / rule.n)
  }

  return { sum, meanCos: 1 - sum / rule.lattice.plaquetteCount }
}

// the leapfrog energy H at the beat boundary, and the shadow energy 1/2 E(-) . E(+) + V, with the demons
export function photonEnergy(rule: PhotonRule, state: PhotonState): { energy: number; shadow: number; electric: number; magnetic: number } {
  const kicked = lastKick(rule, state)

  let electric = 0
  let staggered = 0

  for (let l = 0; l < state.flux.length; l++) {
    const e = state.flux[l] ?? 0

    electric += (e * e) / 2
    staggered += (e * (e + (kicked[l] ?? 0))) / 2
  }

  const magnetic = ((rule.k * rule.n) / (2 * Math.PI)) * magneticSum(rule, state.angle).sum
  const demons = state.demon.reduce((a, b) => a + b, 0) / 2

  return { energy: electric + magnetic + demons, shadow: staggered + magnetic + demons, electric, magnetic }
}

// the demon form's integer energy, in units of one half
export function photonLevelEnergy(rule: PhotonRule, state: PhotonState): number {
  let total = 0

  for (let l = 0; l < state.flux.length; l++) {
    total += (state.flux[l] ?? 0) * (state.flux[l] ?? 0) + (state.demon[l] ?? 0)
  }

  for (let p = 0; p < rule.lattice.plaquetteCount; p++) {
    total += rule.level[plaquetteField(rule, state.angle, p)] ?? 0
  }

  return total
}

export function photonGaussViolations(rule: PhotonRule, state: PhotonState): number {
  const { lattice } = rule
  const f = lattice.firsts.length
  const divergence = new Int32Array(lattice.cells)

  for (let x = 0; x < lattice.cells; x++) {
    for (let k = 0; k < f; k++) {
      const y = lattice.neighbour[x * lattice.degree + (lattice.firsts[k] ?? 0)] ?? 0
      const e = state.flux[x * f + k] ?? 0

      divergence[x] = (divergence[x] ?? 0) + e
      divergence[y] = (divergence[y] ?? 0) - e
    }
  }

  let violations = 0

  for (let x = 0; x < lattice.cells; x++) {
    violations += divergence[x] === rule.charge * (state.vibe[x] ?? 0) ? 0 : 1
  }

  return violations
}

// a change of Z_N frame, chi[x] in every dock: A -> A + chi_y - chi_x, everything else unchanged
export function changePhotonFrame(rule: PhotonRule, state: PhotonState, chi: ArrayLike<number>): PhotonState {
  const { lattice } = rule
  const f = lattice.firsts.length
  const angle = new Int32Array(state.angle.length)

  for (let x = 0; x < lattice.cells; x++) {
    for (let k = 0; k < f; k++) {
      const y = lattice.neighbour[x * lattice.degree + (lattice.firsts[k] ?? 0)] ?? 0

      angle[x * f + k] = modulo((state.angle[x * f + k] ?? 0) + (chi[y] ?? 0) - (chi[x] ?? 0), rule.n)
    }
  }

  return { vibe: Int8Array.from(state.vibe), angle, flux: Int32Array.from(state.flux), demon: Int32Array.from(state.demon) }
}

// the empty state: no vibes, every angle 0, no flux, no demon energy
export function emptyPhotonState(rule: PhotonRule): PhotonState {
  const links = rule.lattice.links

  return {
    vibe: new Int8Array(rule.lattice.cells),
    angle: new Int32Array(links),
    flux: new Int32Array(links),
    demon: new Int32Array(links),
  }
}

// add the curl of a hashed integer field on the plaquettes, each in -amplitude .. amplitude: transverse flux,
// so Gauss's law is untouched
export function addHashedCurl(rule: PhotonRule, state: PhotonState, amplitude: number, hash: number): void {
  const { lattice } = rule
  const size = lattice.plaquetteSize

  for (let p = 0; p < lattice.plaquetteCount; p++) {
    const h = Math.floor((((p + 1) * GOLDEN * hash) % 1) * (2 * amplitude + 1)) - amplitude

    for (let j = 0; j < size; j++) {
      const l = lattice.plaquetteLinks[p * size + j] ?? 0

      state.flux[l] = (state.flux[l] ?? 0) + (lattice.plaquetteSigns[p * size + j] ?? 0) * h
    }
  }
}

// set every angle to a hashed value in -amplitude .. amplitude, mod N
export function setHashedAngles(rule: PhotonRule, state: PhotonState, amplitude: number, hash: number): void {
  for (let l = 0; l < state.angle.length; l++) {
    state.angle[l] = modulo(Math.floor((((l + 7) * GOLDEN * hash) % 1) * (2 * amplitude + 1)) - amplitude, rule.n)
  }
}

// fill each demon with a hashed value in 0 .. top
export function fillHashedDemons(state: PhotonState, top: number, hash: number): void {
  for (let l = 0; l < state.demon.length; l++) {
    state.demon[l] = Math.floor((((l + 5) * GOLDEN * hash) % 1) * (top + 1))
  }
}

// the oriented sum of the angles along a path of directions from dock x (mod nothing: the raw sum)
export function pathAngle(rule: PhotonRule, angle: Int32Array, x: number, dirs: readonly number[]): number {
  const { lattice } = rule

  let sum = 0
  let c = x

  for (const d of dirs) {
    const [l, sign] = photonLink(lattice, c, d)

    sum += sign * (angle[l] ?? 0)
    c = lattice.neighbour[c * lattice.degree + d] ?? 0
  }

  return sum
}

// the links of a path of directions from dock x, each with its orientation
export function pathLinks(lattice: PhotonLattice, x: number, dirs: readonly number[]): [number, number][] {
  const out: [number, number][] = []

  let c = x

  for (const d of dirs) {
    out.push(photonLink(lattice, c, d))
    c = lattice.neighbour[c * lattice.degree + d] ?? 0
  }

  return out
}

// the directions of an r x t rectangle: r steps along a, t along b, r back along a, t back along b
export function rectangle(lattice: PhotonLattice, a: number, r: number, b: number, t: number): number[] {
  return [
    ...Array<number>(r).fill(a),
    ...Array<number>(t).fill(b),
    ...Array<number>(r).fill(lattice.opposite[a] ?? a),
    ...Array<number>(t).fill(lattice.opposite[b] ?? b),
  ]
}

// the Coulomb flux of the vibes: E_L = e (phi_x - phi_y) on each link x -> y, with L phi = vibe, L the
// graph Laplacian of the links, solved by conjugate gradient on the space orthogonal to the constant. The
// longitudinal part of any flux obeying Gauss's law, since the kick and the loops only add curls
export function coulombFlux(rule: PhotonRule, vibe: Int8Array): Float64Array {
  const { lattice } = rule
  const f = lattice.firsts.length
  const cells = lattice.cells
  const laplacian = (v: Float64Array, out: Float64Array): void => {
    out.fill(0)

    for (let x = 0; x < cells; x++) {
      for (let k = 0; k < f; k++) {
        const y = lattice.neighbour[x * lattice.degree + (lattice.firsts[k] ?? 0)] ?? 0
        const diff = (v[x] ?? 0) - (v[y] ?? 0)

        out[x] = (out[x] ?? 0) + diff
        out[y] = (out[y] ?? 0) - diff
      }
    }
  }
  const b = Float64Array.from(vibe, q => q * rule.charge)
  const mean = b.reduce((s, v) => s + v, 0) / cells
  const phi = new Float64Array(cells)
  const r = Float64Array.from(b, v => v - mean)
  const p = Float64Array.from(r)
  const ap = new Float64Array(cells)
  const dot = (u: Float64Array, v: Float64Array): number => u.reduce((s, x, i) => s + x * (v[i] ?? 0), 0)

  let rr = dot(r, r)

  for (let it = 0; it < 10 * cells && rr > 1e-26 * Math.max(1, dot(b, b)); it++) {
    laplacian(p, ap)

    const alpha = rr / dot(p, ap)

    for (let i = 0; i < cells; i++) {
      phi[i] = (phi[i] ?? 0) + alpha * (p[i] ?? 0)
      r[i] = (r[i] ?? 0) - alpha * (ap[i] ?? 0)
    }

    const next = dot(r, r)

    for (let i = 0; i < cells; i++) {
      p[i] = (r[i] ?? 0) + (next / rr) * (p[i] ?? 0)
    }

    rr = next
  }

  const flux = new Float64Array(lattice.links)

  for (let x = 0; x < cells; x++) {
    for (let k = 0; k < f; k++) {
      const y = lattice.neighbour[x * lattice.degree + (lattice.firsts[k] ?? 0)] ?? 0

      flux[x * f + k] = (phi[x] ?? 0) - (phi[y] ?? 0)
    }
  }

  return flux
}

// place a vibe v at dock x and -v at the end of a straight path of `steps` steps along direction d, joined by
// one unit of flux along the path. Returns the far dock
export function placePair(rule: PhotonRule, state: PhotonState, x: number, d: number, steps: number, v: number): number {
  return placePairAlong(rule, state, x, Array<number>(steps).fill(d), v)
}

// the same along any path of directions
export function placePairAlong(rule: PhotonRule, state: PhotonState, x: number, dirs: readonly number[], v: number): number {
  const { lattice } = rule

  let c = x

  for (const d of dirs) {
    const [l, sign] = photonLink(lattice, c, d)

    state.flux[l] = (state.flux[l] ?? 0) + sign * v * rule.charge
    c = lattice.neighbour[c * lattice.degree + d] ?? 0
  }

  state.vibe[x] = (state.vibe[x] ?? 0) + v
  state.vibe[c] = (state.vibe[c] ?? 0) - v

  return c
}
