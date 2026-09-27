// One Sigma(648) element per link: the link of code/rule/center-links with its grid move replaced by the
// full element, so the gauge field itself feels the center.
//
// In center-links each link holds a grid move U (one of 216) and an integer flux E, and the two meet only
// through the matter: nothing in the field sees the center. Here each link holds a single element g of
// Sigma(648), the 648 3 x 3 unitaries of the classical color group, and the grid move is its quotient
// pi(g), the permutation g makes of the 9 phase points by conjugation (E-FRC-0119). pi forgets exactly the
// center {1, w, w^2}, so pi(g) is g with its center phase divided out, and a role point rides pi(g).
//
// Each triangle is priced on the full element's character, as E-FRC-0110 and 0126 price a plaquette:
//
//   level(g) = round(6 (1 - Re Tr g / 3))
//
// which is 0 for the identity and 9 for a center element w. So a transport round a triangle that is the
// center costs energy where the grid move of center-links saw nothing, and the fundamental Polyakov loop
// Tr P / 3 of the full element can show a quark's free energy directly.
//
// What the flux is. The note asked for the link's center phase to be E mod 3. That is not possible with
// Gauss's law and a frame change by all 648 elements. A center frame change, z_x in every dock, sends g to
// z_y g z_x^-1, moving each link's center phase by z_y - z_x. If the phase were E mod 3, E would move too,
// and the flux out of a dock would change by the sum over its 24 links of (z_y - z_x), which is not 0 in
// general, so Gauss's law would break wherever z is not harmonic. E-FRC-0150 counts those docks. So E is
// kept as the phase's conjugate, gauge invariant, beside g: the center's electric flux, carrying the
// triality with Gauss's law, and g the center's magnetic side, carrying its phase round loops.
//
// The energy, conserved to the unit:
//
//   H = sum over triangles of level(transport)  -  kappa * (matched links between two vibes)
//     + tension * (links with E mod 3 not 0)  +  sum of demons
//
// A beat, every move an involution given what it reads and paid by its link's demon, as center-links:
// 1. links: reflect g through a triangle's staple A, g' = A^-1 g^-1 A^-1. The triangle's transport goes to
//    its inverse, whose Re Tr is the same, and the move is covariant under all 648
// 2. flux loops round one triangle per link and beat, by +1 or -1 as the first link's flux is even or odd
// 3. role points reflect through a neighbor's point carried across by pi(g), p' = 2 q - p
// 4. hops (optional): a lone vibe v crosses with its role point carried by pi(g), and the flux along its
//    path changes by -v, so the string trails behind it
// 5. the demons stream
// Backward runs the inverse stream, then every move in the reverse order.
//
// The conjugate coupling, `couple: 'center'` (E-FRC-0154). In Hamiltonian lattice gauge theory the flux
// and the center phase generate each other's shifts. Here a flux loop move that shifts E round a triangle by
// d = +1 or -1 also multiplies each of the triangle's three links, in its direction of travel, by w^d. The
// center commutes with every element, so h_y (w g) h_x^-1 = w (h_y g h_x^-1): the move is covariant under all
// 648 frame changes. The triangle's own transport gains w^(3d) = 1 and keeps its energy, while every other
// triangle through one of its links turns by w or w^2 and is paid for. d flips with the parity of the first
// link's flux, so a second application undoes the first, flux and phase together. Gauss's law is untouched,
// since the flux change is a closed loop. A hop does the same on the one link it crosses: the flux there
// changes by -v, and the link is twisted by w^-v in the direction of travel. So every change of E on a link
// is a twist of that link by w to the change, and the untwisted part g w^-E of every link changes only when
// the link reflects. That is the lock the note asked for, the center phase counted by E, made covariant:
// the phase is E mod 3 relative to g w^-E, which a frame change moves with it, not relative to a fixed
// section, which is what broke Gauss's law in E-FRC-0150. Off by default, which is the rule of E-FRC-0150 and
// 0151. `scale` sets the level round(scale (1 - Re Tr / 3)), 6 by default. `reflect: false` stops the link
// reflections, to isolate the lock. `ratio` switches the level to the modified action of E-FRC-0103 and
// 0110, round(scale ((1 - Re Tr / 3) + ratio (3 - Re Tr g^2))), whose lowest level is not the identity.
//
// Switches for controls only: `gauss: false` hops without moving the flux, `priceFlux: false` takes flux
// moves without paying the tension, `transport: false` carries role points without the link, `couple:
// 'fixed'` twists by a fixed element outside the center (the frame change then breaks), `priceField: false`
// takes coupled loop moves without paying for the triangles they turn (the energy then leaks).

import { rootsD4 } from '@/code/algebra/group/root-system'
import { SU3_SUBGROUPS } from '@/code/algebra/group/su3-subgroups'
import { generateGroup, type FiniteGroup } from '@/code/dynamics/finite-gauge'
import { actionLevels, mixedActionLevels } from '@/code/dynamics/finite-kinetic'
import { phaseSpaceAction } from '@/code/measure/qutrit-phase-space'
import { d4BoxMesh } from '@/code/substrate/d4-box'
import { gridMoves } from '@/code/rule/vibe-weave'

const GOLDEN = (Math.sqrt(5) - 1) / 2
const DEGREE = 24
const SCALE = 6

export type SigmaLinks = {
  readonly side: number
  readonly cells: number
  readonly neighbour: Int32Array
  readonly opposite: readonly number[]
  readonly firsts: readonly number[]
  readonly staples: readonly (readonly (readonly [number, number])[])[]
  readonly group: FiniteGroup
  readonly order: number
  readonly identity: number
  // level[g] = round(6 (1 - Re Tr g / 3))
  readonly level: Int32Array
  // imaginary part of Tr g
  readonly traceIm: Float64Array
  // quotient[g], the grid move of g, and act[m * 9 + p] the grid move's action on point p = x + 3 y
  readonly quotient: Int16Array
  readonly act: Int8Array
  readonly gridOrder: number
  readonly kappa: number
  readonly tension: number
  readonly capacity: number
  readonly hop: boolean
  readonly roles: boolean
  readonly loops: boolean
  readonly gauss: boolean
  readonly priceFlux: boolean
  // how a flux loop move acts on the links: 'none' leaves them, 'center' multiplies each link of the loop,
  // in its direction of travel, by w to the power of the flux step (the conjugate coupling), 'fixed' by a
  // fixed element outside the center (a control)
  readonly couple: 'none' | 'center' | 'fixed'
  // whether a coupled loop move pays for the triangles it changes (false only for a control)
  readonly priceField: boolean
  // whether links reflect (false only to isolate the coupling)
  readonly reflect: boolean
  // the link moves of a beat, each U -> z V U^-1 V (E-FRC-0162): 'one' reflects through one staple, the
  // staple turning with the beat (E-FRC-0128), 'staples' through all 8 in turn, 'center' through all 8 with
  // z each of 1, w and w^2, 'words' adds 8 words V_i V_j^-1 V_k of three staples, each with the 3 centers,
  // and 'wide' 32 such words in four patterns of (j - i, k - i)
  readonly moves: MoveFamily
  readonly scale: number
  // w, the center element with Tr = 3 w, and its inverse
  readonly omega: number
  readonly omegaInverse: number
  readonly fixedElement: number
  readonly transport: boolean
}

export type SigmaState = {
  readonly vibe: Int8Array
  readonly role: Int8Array
  // links[x * 24 + d], an element of Sigma(648), the reverse link holding its inverse
  readonly links: Int16Array
  // demon[x * 24 + a] and flux[x * 24 + a] along x -> x + a, for first directions a only
  readonly demon: Int32Array
  readonly flux: Int32Array
}

export type MoveFamily = 'one' | 'staples' | 'center' | 'words' | 'wide'

export type SigmaMoves ={ links: number; loops: number; roles: number; hops: number }

export type HopListener = (from: number, to: number, direction: number) => void

const mod3 = (x: number): number => ((x % 3) + 3) % 3

export function makeSigmaLinks(input: {
  side: number
  kappa: number
  tension: number
  capacity: number
  hop?: boolean
  roles?: boolean
  loops?: boolean
  gauss?: boolean
  priceFlux?: boolean
  transport?: boolean
  couple?: 'none' | 'center' | 'fixed'
  priceField?: boolean
  reflect?: boolean
  moves?: MoveFamily
  scale?: number
  // beta1 / beta0 of the modified action of E-FRC-0103: the level then carries a Re Tr U^2 term
  ratio?: number
}): SigmaLinks {
  const mesh = d4BoxMesh({ side: input.side })
  const cells = mesh.cellCount
  const neighbour = new Int32Array(cells * DEGREE)

  for (let x = 0; x < cells; x++) {
    for (let d = 0; d < DEGREE; d++) {
      neighbour[x * DEGREE + d] = mesh.neighbour(x, d)
    }
  }

  const opposite = Array.from({ length: DEGREE }, (_, d) => mesh.opposite(d))
  const firsts = opposite.map((o, d) => (d < o ? d : -1)).filter(d => d >= 0)
  const roots = rootsD4()
  const find = (v: number[]): number => roots.findIndex(r => r.every((x, k) => x === v[k]))
  const staples = roots.map(a =>
    roots.flatMap((b, j) => {
      const c = find(a.map((x, k) => -x - (b[k] ?? 0)))

      return c >= 0 ? [[j, c] as const] : []
    }),
  )

  const group = generateGroup({ generators: [...SU3_SUBGROUPS.sigma648.generators] })
  const grid = gridMoves()
  const act = new Int8Array(grid.act.length * 9)
  const gridIndex = new Map(grid.act.map((table, m) => [table.join(''), m]))

  grid.act.forEach((table, m) => act.set(table, m * 9))

  // the phase point (a, b), index 3 a + b, is the grid point x = a, y = b, index a + 3 b
  const toGrid = (q: number): number => Math.floor(q / 3) + 3 * (q % 3)
  const quotient = Int16Array.from(group.matrices, (matrix, g) => {
    const map = phaseSpaceAction({ unitary: matrix })
    const table = new Int8Array(9)

    if (!map) {
      throw new Error(`element ${g} does not act on the phase points`)
    }

    map.forEach((image, q) => (table[toGrid(q)] = toGrid(image)))

    const m = gridIndex.get(table.join(''))

    if (m === undefined) {
      throw new Error(`element ${g} is not a grid move`)
    }

    return m
  })

  const traceIm = Float64Array.from(group.matrices, m => (m[1] ?? 0) + (m[9] ?? 0) + (m[17] ?? 0))
  // w: the scalar element with Tr = 3 w = -3/2 + i 3 sqrt(3)/2
  const omega = Array.from({ length: group.order }, (_, g) => g).find(
    g => Math.abs((group.trace[g] ?? 0) + 1.5) < 1e-9 && Math.abs((traceIm[g] ?? 0) - 1.5 * Math.sqrt(3)) < 1e-9,
  )

  if (omega === undefined) {
    throw new Error('no center element w')
  }

  // a fixed element with trivial quotient only if central, so any element whose quotient is not the identity
  const fixedElement = Array.from({ length: group.order }, (_, g) => g).find(g => (quotient[g] ?? 0) !== (quotient[group.identity] ?? 0)) ?? 0

  return {
    side: input.side,
    cells,
    neighbour,
    opposite,
    firsts,
    staples,
    group,
    order: group.order,
    identity: group.identity,
    level:
      input.ratio === undefined
        ? actionLevels({ group, scale: input.scale ?? SCALE })
        : mixedActionLevels({ group, scale: input.scale ?? SCALE, ratio: input.ratio }),
    traceIm,
    quotient,
    act,
    gridOrder: grid.act.length,
    kappa: input.kappa,
    tension: input.tension,
    capacity: input.capacity,
    hop: input.hop ?? true,
    roles: input.roles ?? true,
    loops: input.loops ?? true,
    gauss: input.gauss ?? true,
    priceFlux: input.priceFlux ?? true,
    couple: input.couple ?? 'none',
    priceField: input.priceField ?? true,
    reflect: input.reflect ?? true,
    moves: input.moves ?? 'one',
    scale: input.scale ?? SCALE,
    omega,
    omegaInverse: group.inverse[omega] ?? group.identity,
    fixedElement,
    transport: input.transport ?? true,
  }
}

const times = (rule: SigmaLinks, g: number, h: number): number => rule.group.product[g * rule.order + h] ?? 0
const inverse = (rule: SigmaLinks, g: number): number => rule.group.inverse[g] ?? 0

// the grid point p carried by the element g
export function carry(rule: SigmaLinks, g: number, p: number): number {
  return rule.act[(rule.quotient[g] ?? 0) * 9 + p] ?? 0
}

// the hashed start: every link a fixed, frame-generic element
export function hashedSigmaLinks(rule: SigmaLinks, scale = 7.31): Int16Array {
  const links = new Int16Array(rule.cells * DEGREE).fill(-1)

  for (let x = 0; x < rule.cells; x++) {
    for (let d = 0; d < DEGREE; d++) {
      if ((links[x * DEGREE + d] ?? -1) >= 0) {
        continue
      }

      const g = Math.floor((((x * DEGREE + d + 1) * GOLDEN * scale) % 1) * rule.order)

      links[x * DEGREE + d] = g
      links[(rule.neighbour[x * DEGREE + d] ?? 0) * DEGREE + (rule.opposite[d] ?? d)] = inverse(rule, g)
    }
  }

  return links
}

// the identity field with a fraction of its links set as in the hashed start: an ordered start with defects
export function defectSigmaLinks(rule: SigmaLinks, fraction: number, hash = 3.3): Int16Array {
  const hot = hashedSigmaLinks(rule)
  const links = new Int16Array(rule.cells * DEGREE).fill(rule.identity)

  for (let x = 0; x < rule.cells; x++) {
    for (const a of rule.firsts) {
      if (((x * DEGREE + a + 2) * GOLDEN * hash) % 1 < fraction) {
        const g = hot[x * DEGREE + a] ?? 0

        links[x * DEGREE + a] = g
        links[(rule.neighbour[x * DEGREE + a] ?? 0) * DEGREE + (rule.opposite[a] ?? a)] = inverse(rule, g)
      }
    }
  }

  return links
}

// the transport along a path of directions from x, the first link applied first
export function pathTransport(rule: SigmaLinks, links: Int16Array, x: number, dirs: readonly number[]): number {
  let g = rule.identity
  let c = x

  for (const d of dirs) {
    g = times(rule, links[c * DEGREE + d] ?? 0, g)
    c = rule.neighbour[c * DEGREE + d] ?? 0
  }

  return g
}

// the transport round the closed line x, x + a, ... back to x
export function sigmaLine(rule: SigmaLinks, links: Int16Array, x: number, a: number): number {
  let g = rule.identity
  let c = x

  do {
    g = times(rule, links[c * DEGREE + a] ?? 0, g)
    c = rule.neighbour[c * DEGREE + a] ?? 0
  } while (c !== x)

  return g
}

function triangleEnergy(rule: SigmaLinks, links: Int16Array, x: number, a: number, u: number): number {
  const y = rule.neighbour[x * DEGREE + a] ?? 0

  let total = 0

  for (const [b, c] of rule.staples[a] ?? []) {
    const z = rule.neighbour[y * DEGREE + b] ?? 0

    total += rule.level[times(rule, links[z * DEGREE + c] ?? 0, times(rule, links[y * DEGREE + b] ?? 0, u))] ?? 0
  }

  return total
}

function linkMatter(rule: SigmaLinks, state: SigmaState, x: number, d: number, u: number): number {
  const y = rule.neighbour[x * DEGREE + d] ?? 0

  if (state.vibe[x] === 0 || state.vibe[y] === 0) {
    return 0
  }

  const p = state.role[x] ?? 0
  const carried = rule.transport ? carry(rule, u, p) : p

  return carried === state.role[y] ? -rule.kappa : 0
}

function cellMatter(rule: SigmaLinks, state: SigmaState, x: number): number {
  if (state.vibe[x] === 0) {
    return 0
  }

  let total = 0

  for (let d = 0; d < DEGREE; d++) {
    total += linkMatter(rule, state, x, d, state.links[x * DEGREE + d] ?? 0)
  }

  return total
}

function slotOf(rule: SigmaLinks, x: number, d: number): [number, number] {
  const o = rule.opposite[d] ?? d

  return d < o ? [x * DEGREE + d, 1] : [(rule.neighbour[x * DEGREE + d] ?? 0) * DEGREE + o, -1]
}

export function sigmaFluxAlong(rule: SigmaLinks, flux: Int32Array, x: number, d: number): number {
  const [slot, sign] = slotOf(rule, x, d)

  return sign * (flux[slot] ?? 0)
}

export function addSigmaFlux(rule: SigmaLinks, flux: Int32Array, x: number, d: number, amount: number): void {
  const [slot, sign] = slotOf(rule, x, d)

  flux[slot] = (flux[slot] ?? 0) + sign * amount
}

function pay(rule: SigmaLinks, state: SigmaState, slot: number, cost: number): boolean {
  const next = (state.demon[slot] ?? 0) - cost

  if (next < 0 || next > rule.capacity) {
    return false
  }

  state.demon[slot] = next

  return true
}

const tensionOf = (rule: SigmaLinks, e: number): number => (mod3(e) !== 0 ? rule.tension : 0)

// the link-like word of staple i of the link (x, a): the transport x -> x + a round the other two sides
function stapleLink(rule: SigmaLinks, links: Int16Array, x: number, a: number, i: number): number {
  const pairs = rule.staples[a] ?? []
  const [b, c] = pairs[i % pairs.length] ?? [0, 0]
  const y = rule.neighbour[x * DEGREE + a] ?? 0
  const z = rule.neighbour[y * DEGREE + b] ?? 0

  return inverse(rule, times(rule, links[z * DEGREE + c] ?? 0, links[y * DEGREE + b] ?? 0))
}

// the word V of a move: one staple [i], or three [i, j, k] read as V_i V_j^-1 V_k, each a link-like word
function moveWord(rule: SigmaLinks, links: Int16Array, x: number, a: number, word: readonly number[]): number {
  const [i = 0, j, k] = word
  const vi = stapleLink(rule, links, x, a, i)

  if (j === undefined || k === undefined) {
    return vi
  }

  return times(rule, vi, times(rule, inverse(rule, stapleLink(rule, links, x, a, j)), stapleLink(rule, links, x, a, k)))
}

// the move U -> z V U^-1 V, V a link-like word of the staples, z central: covariant, and its own inverse
function wordMove(rule: SigmaLinks, state: SigmaState, x: number, a: number, word: readonly number[], center: number): boolean {
  const links = state.links
  const u = links[x * DEGREE + a] ?? 0
  const v = moveWord(rule, links, x, a, word)
  const next = times(rule, center, times(rule, v, times(rule, inverse(rule, u), v)))

  if (next === u) {
    return false
  }

  const change =
    triangleEnergy(rule, links, x, a, next) - triangleEnergy(rule, links, x, a, u) + linkMatter(rule, state, x, a, next) - linkMatter(rule, state, x, a, u)

  if (!pay(rule, state, x * DEGREE + a, change)) {
    return false
  }

  links[x * DEGREE + a] = next
  links[(rule.neighbour[x * DEGREE + a] ?? 0) * DEGREE + (rule.opposite[a] ?? a)] = inverse(rule, next)

  return true
}

// the moves one link makes in one beat, as (word, center) pairs, by the rule's `moves` family
function linkMoves(rule: SigmaLinks, t: number, k: number): [readonly number[], number][] {
  const staples = (rule.staples[0] ?? []).length
  const centers = rule.moves === 'one' || rule.moves === 'staples' ? [rule.identity] : [rule.identity, rule.omega, rule.omegaInverse]

  if (rule.moves === 'one') {
    return [[[(t + k) % staples], rule.identity]]
  }

  const singles = Array.from({ length: staples }, (_, i) => [(i + t + k) % staples])
  const patterns = rule.moves === 'words' ? [[1, 3]] : rule.moves === 'wide' ? [[1, 3], [2, 5], [1, 2], [3, 4]] : []
  const triples = patterns.flatMap(([p = 0, q = 0]) =>
    Array.from({ length: staples }, (_, i) => [(i + t + k) % staples, (i + t + k + p) % staples, (i + t + k + q) % staples]),
  )

  return [...singles, ...triples].flatMap(word => centers.map(z => [word, z] as [readonly number[], number]))
}

// every move of the link (x, a) at schedule step s, in order forward and in reverse order backward
function reflectLink(rule: SigmaLinks, state: SigmaState, x: number, a: number, s: number, forward = true): number {
  const moves = linkMoves(rule, s, 0)
  const order = forward ? moves : [...moves].reverse()

  let moved = 0

  for (const [word, center] of order) {
    moved += wordMove(rule, state, x, a, word, center) ? 1 : 0
  }

  return moved
}

function loopMove(rule: SigmaLinks, state: SigmaState, x: number, a: number, type: number): boolean {
  const pairs = rule.staples[a] ?? []
  const [b, c] = pairs[type % pairs.length] ?? [0, 0]
  const y = rule.neighbour[x * DEGREE + a] ?? 0
  const z = rule.neighbour[y * DEGREE + b] ?? 0
  const legs: [number, number][] = [
    [x, a],
    [y, b],
    [z, c],
  ]
  const step = ((sigmaFluxAlong(rule, state.flux, x, a) % 2) + 2) % 2 === 0 ? 1 : -1

  let change = 0

  for (const [from, d] of legs) {
    const e = sigmaFluxAlong(rule, state.flux, from, d)

    change += tensionOf(rule, e + step) - tensionOf(rule, e)
  }

  // the coupling: each link of the loop, in its direction of travel, multiplied by m to the step
  const factor =
    rule.couple === 'center'
      ? step > 0
        ? rule.omega
        : rule.omegaInverse
      : rule.couple === 'fixed'
        ? step > 0
          ? rule.fixedElement
          : inverse(rule, rule.fixedElement)
        : rule.identity

  const multiply = (m: number): void => {
    for (const [from, d] of legs) {
      const g = times(rule, m, state.links[from * DEGREE + d] ?? 0)

      state.links[from * DEGREE + d] = g
      state.links[(rule.neighbour[from * DEGREE + d] ?? 0) * DEGREE + (rule.opposite[d] ?? d)] = inverse(rule, g)
    }
  }

  // every triangle through a leg, the loop itself counted once though it holds all three legs
  const local = (): number =>
    legs.reduce((sum, [from, d]) => sum + triangleEnergy(rule, state.links, from, d, state.links[from * DEGREE + d] ?? 0), 0) -
    2 * (rule.level[pathTransport(rule, state.links, x, [a, b, c])] ?? 0)

  let field = 0

  if (factor !== rule.identity) {
    const before = local()

    multiply(factor)
    field = local() - before
  }

  if (!pay(rule, state, x * DEGREE + a, (rule.priceFlux ? change : 0) + (rule.priceField ? field : 0))) {
    if (factor !== rule.identity) {
      multiply(inverse(rule, factor))
    }

    return false
  }

  for (const [from, d] of legs) {
    addSigmaFlux(rule, state.flux, from, d, step)
  }

  return true
}

function reflectRole(rule: SigmaLinks, state: SigmaState, x: number, d: number): boolean {
  const y = rule.neighbour[x * DEGREE + d] ?? 0

  if (state.vibe[x] === 0 || state.vibe[y] === 0 || x === y) {
    return false
  }

  const back = state.links[y * DEGREE + (rule.opposite[d] ?? d)] ?? 0
  const q = rule.transport ? carry(rule, back, state.role[y] ?? 0) : (state.role[y] ?? 0)
  const p = state.role[x] ?? 0
  const next = mod3(2 * (q % 3) - (p % 3)) + 3 * mod3(2 * Math.floor(q / 3) - Math.floor(p / 3))

  if (next === p) {
    return false
  }

  const before = cellMatter(rule, state, x)

  state.role[x] = next

  const after = cellMatter(rule, state, x)
  const [slot] = slotOf(rule, x, d)

  if (!pay(rule, state, slot, after - before)) {
    state.role[x] = p

    return false
  }

  return true
}

function hop(rule: SigmaLinks, state: SigmaState, x: number, a: number, onHop?: HopListener): boolean {
  const y = rule.neighbour[x * DEGREE + a] ?? 0
  const vx = state.vibe[x] ?? 0
  const vy = state.vibe[y] ?? 0

  if ((vx === 0) === (vy === 0) || x === y) {
    return false
  }

  const [from, to, d] = vx !== 0 ? [x, y, a] : [y, x, rule.opposite[a] ?? a]
  const via = state.links[from * DEGREE + d] ?? 0
  const v = state.vibe[from] ?? 0
  const p = state.role[from] ?? 0
  const e = sigmaFluxAlong(rule, state.flux, from, d)
  const moved = rule.gauss ? e - v : e
  const before = cellMatter(rule, state, from)

  state.vibe[from] = 0
  state.role[from] = 0
  state.vibe[to] = v
  state.role[to] = rule.transport ? carry(rule, via, p) : p

  const after = cellMatter(rule, state, to)
  const tension = rule.priceFlux ? tensionOf(rule, moved) - tensionOf(rule, e) : 0
  // the coupling: the crossed link, in the direction of travel, twisted by w to the flux change
  const shift = mod3(moved - e)
  const twisted =
    rule.couple === 'center' && shift !== 0 ? times(rule, shift === 1 ? rule.omega : rule.omegaInverse, via) : via
  const field =
    twisted !== via && rule.priceField ? triangleEnergy(rule, state.links, from, d, twisted) - triangleEnergy(rule, state.links, from, d, via) : 0

  if (!pay(rule, state, x * DEGREE + a, after - before + tension + field)) {
    state.vibe[to] = 0
    state.role[to] = 0
    state.vibe[from] = v
    state.role[from] = p

    return false
  }

  addSigmaFlux(rule, state.flux, from, d, moved - e)
  state.links[from * DEGREE + d] = twisted
  state.links[to * DEGREE + (rule.opposite[d] ?? d)] = inverse(rule, twisted)
  onHop?.(from, to, d)

  return true
}

function streamDemons(rule: SigmaLinks, demon: Int32Array, forward: boolean): void {
  const old = Int32Array.from(demon)

  for (let x = 0; x < rule.cells; x++) {
    for (const a of rule.firsts) {
      const y = rule.neighbour[x * DEGREE + a] ?? 0

      if (forward) {
        demon[y * DEGREE + a] = old[x * DEGREE + a] ?? 0
      } else {
        demon[x * DEGREE + a] = old[y * DEGREE + a] ?? 0
      }
    }
  }
}

function copy(state: SigmaState): SigmaState {
  return {
    vibe: Int8Array.from(state.vibe),
    role: Int8Array.from(state.role),
    links: Int16Array.from(state.links),
    demon: Int32Array.from(state.demon),
    flux: Int32Array.from(state.flux),
  }
}

export function sigmaBeat(rule: SigmaLinks, input: SigmaState, t: number, onHop?: HopListener): { state: SigmaState; moved: SigmaMoves } {
  const state = copy(input)
  const moved: SigmaMoves = { links: 0, loops: 0, roles: 0, hops: 0 }

  rule.firsts.forEach((a, k) => {
    for (let x = 0; x < (rule.reflect ? rule.cells : 0); x++) {
      moved.links += reflectLink(rule, state, x, a, t + k)
    }
  })

  if (rule.loops) {
    rule.firsts.forEach((a, k) => {
      for (let x = 0; x < rule.cells; x++) {
        moved.loops += loopMove(rule, state, x, a, t + k) ? 1 : 0
      }
    })
  }

  for (let x = 0; x < (rule.roles ? rule.cells : 0); x++) {
    if (state.vibe[x] === 0) {
      continue
    }

    for (let d = 0; d < DEGREE; d++) {
      moved.roles += reflectRole(rule, state, x, d) ? 1 : 0
    }
  }

  if (rule.hop) {
    for (let x = 0; x < rule.cells; x++) {
      for (const a of rule.firsts) {
        moved.hops += hop(rule, state, x, a, onHop) ? 1 : 0
      }
    }
  }

  streamDemons(rule, state.demon, true)

  return { state, moved }
}

export function sigmaBeatBack(rule: SigmaLinks, input: SigmaState, t: number): SigmaState {
  const state = copy(input)

  streamDemons(rule, state.demon, false)

  if (rule.hop) {
    for (let x = rule.cells - 1; x >= 0; x--) {
      for (let k = rule.firsts.length - 1; k >= 0; k--) {
        hop(rule, state, x, rule.firsts[k] ?? 0)
      }
    }
  }

  // no vibe moves during the role step, so the docks holding one now are the ones that held one then
  for (let x = rule.roles ? rule.cells - 1 : -1; x >= 0; x--) {
    if (state.vibe[x] === 0) {
      continue
    }

    for (let d = DEGREE - 1; d >= 0; d--) {
      reflectRole(rule, state, x, d)
    }
  }

  for (let k = rule.loops ? rule.firsts.length - 1 : -1; k >= 0; k--) {
    const a = rule.firsts[k] ?? 0

    for (let x = rule.cells - 1; x >= 0; x--) {
      loopMove(rule, state, x, a, t + k)
    }
  }

  for (let k = rule.reflect ? rule.firsts.length - 1 : -1; k >= 0; k--) {
    const a = rule.firsts[k] ?? 0

    for (let x = rule.cells - 1; x >= 0; x--) {
      reflectLink(rule, state, x, a, t + k, false)
    }
  }

  return state
}

export function sigmaFieldEnergy(rule: SigmaLinks, links: Int16Array): number {
  let total = 0

  for (let x = 0; x < rule.cells; x++) {
    for (const a of rule.firsts) {
      total += triangleEnergy(rule, links, x, a, links[x * DEGREE + a] ?? 0)
    }
  }

  return total / 3
}

export function sigmaStringLinks(rule: SigmaLinks, flux: Int32Array): number {
  let count = 0

  for (let x = 0; x < rule.cells; x++) {
    for (const a of rule.firsts) {
      count += mod3(flux[x * DEGREE + a] ?? 0) !== 0 ? 1 : 0
    }
  }

  return count
}

export function sigmaEnergy(rule: SigmaLinks, state: SigmaState): number {
  let matter = 0

  for (let x = 0; x < rule.cells; x++) {
    for (const a of rule.firsts) {
      matter += linkMatter(rule, state, x, a, state.links[x * DEGREE + a] ?? 0)
    }
  }

  return sigmaFieldEnergy(rule, state.links) + matter + rule.tension * sigmaStringLinks(rule, state.flux) + state.demon.reduce((a, b) => a + b, 0)
}

export function sigmaGaussViolations(rule: SigmaLinks, state: SigmaState): number {
  let violations = 0

  for (let x = 0; x < rule.cells; x++) {
    let divergence = 0

    for (let d = 0; d < DEGREE; d++) {
      divergence += sigmaFluxAlong(rule, state.flux, x, d)
    }

    violations += divergence === state.vibe[x] ? 0 : 1
  }

  return violations
}

// whether the link (x, d) carries the role point of x onto its neighbor's
export function sigmaCarries(rule: SigmaLinks, state: SigmaState, x: number, d: number): boolean {
  return carry(rule, state.links[x * DEGREE + d] ?? 0, state.role[x] ?? 0) === state.role[rule.neighbour[x * DEGREE + d] ?? 0]
}

// a change of frame by any of the 648: g -> h_y g h_x^-1 on every link, a vibe's point moved by pi(h_x)
export function changeSigmaFrame(rule: SigmaLinks, state: SigmaState, frame: ArrayLike<number>): SigmaState {
  const links = new Int16Array(state.links.length)

  for (let x = 0; x < rule.cells; x++) {
    for (let d = 0; d < DEGREE; d++) {
      const hy = frame[rule.neighbour[x * DEGREE + d] ?? 0] ?? 0

      links[x * DEGREE + d] = times(rule, times(rule, hy, state.links[x * DEGREE + d] ?? 0), inverse(rule, frame[x] ?? 0))
    }
  }

  return {
    vibe: Int8Array.from(state.vibe),
    role: Int8Array.from(state.role, (p, x) => (state.vibe[x] !== 0 ? carry(rule, frame[x] ?? 0, p) : 0)),
    links,
    demon: Int32Array.from(state.demon),
    flux: Int32Array.from(state.flux),
  }
}

// the summed level of the 8 triangles through the link (x, a) with u in its place
export function linkTriangleEnergy(rule: SigmaLinks, links: Int16Array, x: number, a: number, u: number): number {
  return triangleEnergy(rule, links, x, a, u)
}

// the untwisted part g w^-E of every link (x, a), a a first direction: under the coupling it changes only
// when the link reflects
export function untwistedLinks(rule: SigmaLinks, state: SigmaState): Int16Array {
  const out = new Int16Array(rule.cells * DEGREE)

  for (let x = 0; x < rule.cells; x++) {
    for (const a of rule.firsts) {
      const k = mod3(state.flux[x * DEGREE + a] ?? 0)
      const unwind = k === 0 ? rule.identity : k === 1 ? rule.omegaInverse : rule.omega

      out[x * DEGREE + a] = times(rule, unwind, state.links[x * DEGREE + a] ?? 0)
    }
  }

  return out
}

// the preparation of E-FRC-0110: drain (a beat, then every demon emptied), fill a fraction of the demons to
// capacity, settle. Returns the level where the drain stood halfway and at its end
export function drainFillSettle(
  rule: SigmaLinks,
  links: Int16Array,
  input: { drain: number; fill: number; settle: number },
): { state: SigmaState; drainedLevel: number; halfwayLevel: number; exact: boolean } {
  const triangles = (rule.cells * 12 * 8) / 3

  let s: SigmaState = {
    vibe: new Int8Array(rule.cells),
    role: new Int8Array(rule.cells),
    links,
    demon: new Int32Array(rule.cells * DEGREE),
    flux: new Int32Array(rule.cells * DEGREE),
  }

  let halfwayLevel = 0

  for (let k = 0; k < input.drain; k++) {
    s = sigmaBeat(rule, s, k).state
    s.demon.fill(0)

    if (k === Math.floor(input.drain / 2) - 1) {
      halfwayLevel = sigmaFieldEnergy(rule, s.links) / triangles
    }
  }

  const drainedLevel = sigmaFieldEnergy(rule, s.links) / triangles

  for (let x = 0; x < rule.cells; x++) {
    rule.firsts.forEach((a, k) => {
      s.demon[x * DEGREE + a] = ((x * 12 + k) * GOLDEN) % 1 < input.fill ? rule.capacity : 0
    })
  }

  const e0 = sigmaEnergy(rule, s)

  let exact = true

  for (let t = 0; t < input.settle; t++) {
    s = sigmaBeat(rule, s, input.drain + t).state

    if (t % 100 === 0) {
      exact = exact && sigmaEnergy(rule, s) === e0
    }
  }

  return { state: s, drainedLevel, halfwayLevel, exact: exact && sigmaEnergy(rule, s) === e0 }
}

// a heat-assisted drain (E-FRC-0162): drain, then cycles of a small fill, some beats, and a short drain,
// every demon empty at the end. Only a starting condition: the rule is unchanged
export function coolSigmaLinks(
  rule: SigmaLinks,
  links: Int16Array,
  input: { drain: number; cycles: number; fill: number; beats: number; empties: number },
): { state: SigmaState; beats: number } {
  let s: SigmaState = {
    vibe: new Int8Array(rule.cells),
    role: new Int8Array(rule.cells),
    links,
    demon: new Int32Array(rule.cells * DEGREE),
    flux: new Int32Array(rule.cells * DEGREE),
  }
  let t = 0

  const empty = (n: number): void => {
    for (let k = 0; k < n; k++) {
      s = sigmaBeat(rule, s, t++).state
      s.demon.fill(0)
    }
  }

  empty(input.drain)

  for (let c = 0; c < input.cycles; c++) {
    for (let x = 0; x < rule.cells; x++) {
      rule.firsts.forEach((a, k) => {
        s.demon[x * DEGREE + a] = ((x * 12 + k) * GOLDEN) % 1 < input.fill ? rule.capacity : 0
      })
    }

    for (let k = 0; k < input.beats; k++) {
      s = sigmaBeat(rule, s, t++).state
    }

    empty(input.empties)
  }

  return { state: s, beats: t }
}

// fill a fraction of the demons to capacity, by the fixed golden pattern of E-FRC-0110
export function fillSigmaDemons(rule: SigmaLinks, state: SigmaState, fraction: number): void {
  for (let x = 0; x < rule.cells; x++) {
    rule.firsts.forEach((a, k) => {
      state.demon[x * DEGREE + a] = ((x * 12 + k) * GOLDEN) % 1 < fraction ? rule.capacity : 0
    })
  }
}

// the elements whose quotient is the identity: the center
export function centerElements(rule: SigmaLinks): number[] {
  const still = rule.quotient[rule.identity] ?? 0

  return Array.from({ length: rule.order }, (_, g) => g).filter(g => rule.quotient[g] === still)
}
