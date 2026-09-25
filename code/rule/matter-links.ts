// Links that feel the matter: roles carried on moving links, with a matter term in the links' energy and
// every move paid to a demon, so the field and the matter act on each other both ways.
//
// The last open item of note/experiment/gauge/what-the-base-needs. In E-FRC-0128 (code/rule/moving-links)
// the links move by reflection through a triangle's staple, taken only where the triangles' energy is kept,
// and the roles ride them, but nothing the matter does enters the links' energy. Here it does.
//
// State, on the D4 box:
// - each cell holds a vibe (fear -1, calm 0, love +1) and, when it holds one, a role point p (the 9 points of
//   the role grid). A calm cell's point is always 0 and carries no color. Matter waits in cells, the second
//   route E-FRC-0130 leaves, as in code/rule/string-graph
// - each directed link (x, d) holds a grid move U, the link back holding the inverse
// - each undirected link (x, a), a the first direction of its line, holds a demon, a whole number of units
//   between 0 and a capacity
//
// The energy, conserved to the unit:
//
//   H = sum over triangles of (9 - fixed points of the transport round it)
//     - kappa * (links whose two cells both hold a vibe and U p_x = p_y)
//     + sum of demons
//
// The first term is the links' own energy of E-FRC-0128. The second is the matter term, the classical
// hopping term with the sign of lattice gauge theory's -kappa Re(phi_y^* U phi_x): a link joining two vibes
// lowers the energy by kappa when it carries the one's role point exactly onto the other's, and a vibe with
// no neighbor pays nothing. So a matched pair is bound, by kappa per matched link. A change of frame h in
// every cell sends U to h_y U h_x^-1 and p_x to h_x p_x, so U p_x = p_y is frame-free, and so is H. The
// energy can be negative, and the bookkeeping is exact all the same.
//
// A beat is a sequence of moves. Each move is its own inverse given everything it reads, and is taken only
// where the demon of its link can pay the change in H and stay within 0 and its capacity. A beat runs:
// 1. links: for each line's first direction a, each cell x in index order, reflect U on (x, a) through one
//    triangle's staple A, U' = A^-1 U^-1 A^-1 (the step of E-FRC-0128), paid by the link's demon. The price
//    now includes the change in the matter term on that link, so the links feel the matter
// 2. roles: for each cell holding a vibe, each direction d in order to a cell holding a vibe, reflect p
//    through the neighbor's point brought across the link, q = U^-1 p_y, p' = 2 q - p. An affine combination
//    whose weights sum to 1, so frame-covariant, and an involution. Paid by that link's demon
// 3. hops (optional): for each cell x and first direction a, a lone vibe crosses to an empty neighbor with
//    its role point carried by the link, (v, p | calm) <-> (calm | v, U p), the transport of E-FRC-0128.
//    Paid by the link's demon, as the paid hop of code/rule/string-graph
// 4. the demons stream one link along their own direction, a permutation
// Backward runs the inverse stream, then every move in the reverse order. Moves in index order are the only
// order used, and a frame change does not move cells, so the order is frame-free.
//
// Two switches exist for controls only: `feel: false` prices a link move without the matter term (energy
// then leaks), and `transport: false` compares and carries role points without the link (the frame change
// then breaks).

import { rootsD4 } from '@/code/algebra/group/root-system'
import { d4BoxMesh } from '@/code/substrate/d4-box'
import { gridMoves } from '@/code/rule/vibe-weave'

const GOLDEN = (Math.sqrt(5) - 1) / 2
const DEGREE = 24

export type MatterLinks = {
  readonly side: number
  readonly cells: number
  // neighbour[x * 24 + d]
  readonly neighbour: Int32Array
  readonly opposite: readonly number[]
  // the first direction of each of the 12 lines
  readonly firsts: readonly number[]
  // for each direction a, the 8 (b, c) with a + b + c = 0: the triangles x -a-> x+a -b-> x+a+b -c-> x
  readonly staples: readonly (readonly (readonly [number, number])[])[]
  // act[g * 9 + p], compose[g * 216 + h] = g after h, inverse[g], level[g] = 9 - fixed points of g
  readonly act: Int8Array
  readonly compose: Int16Array
  readonly inverse: Int16Array
  readonly level: Int8Array
  readonly identity: number
  readonly order: number
  readonly kappa: number
  readonly capacity: number
  readonly hop: boolean
  readonly roles: boolean
  readonly feel: boolean
  readonly transport: boolean
}

export type MatterState = {
  readonly vibe: Int8Array
  readonly role: Int8Array
  readonly links: Int16Array
  // demon[x * 24 + a], used only for first directions a
  readonly demon: Int32Array
}

// link moves, link moves that changed the matter term on their link, role moves, hops
export type MoveCount = { links: number; felt: number; roles: number; hops: number }

const mod3 = (x: number): number => ((x % 3) + 3) % 3

export function makeMatterLinks(input: {
  side: number
  kappa: number
  capacity: number
  hop?: boolean
  roles?: boolean
  feel?: boolean
  transport?: boolean
}): MatterLinks {
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

  const moves = gridMoves()
  const order = moves.act.length
  const act = new Int8Array(order * 9)
  const compose = new Int16Array(order * order)
  const index = new Map(moves.act.map((table, g) => [table.join(''), g]))

  moves.act.forEach((table, g) => act.set(table, g * 9))

  for (let g = 0; g < order; g++) {
    for (let h = 0; h < order; h++) {
      const table = new Int8Array(9)

      for (let p = 0; p < 9; p++) {
        table[p] = act[g * 9 + (act[h * 9 + p] ?? 0)] ?? 0
      }

      compose[g * order + h] = index.get(table.join('')) ?? -1
    }
  }

  const inverse = Int16Array.from(moves.inverse)
  const level = Int8Array.from(moves.act, table => 9 - table.reduce((n, image, point) => n + (image === point ? 1 : 0), 0))

  return {
    side: input.side,
    cells,
    neighbour,
    opposite,
    firsts,
    staples,
    act,
    compose,
    inverse,
    level,
    identity: moves.identity,
    order,
    kappa: input.kappa,
    capacity: input.capacity,
    hop: input.hop ?? true,
    roles: input.roles ?? true,
    feel: input.feel ?? true,
    transport: input.transport ?? true,
  }
}

// the hashed link field of the vibe weave: a fixed, frame-generic start
export function hashedLinks(rule: MatterLinks, scale = 7.31): Int16Array {
  const links = new Int16Array(rule.cells * DEGREE).fill(-1)

  for (let x = 0; x < rule.cells; x++) {
    for (let d = 0; d < DEGREE; d++) {
      if ((links[x * DEGREE + d] ?? -1) >= 0) {
        continue
      }

      const g = Math.floor((((x * DEGREE + d + 1) * GOLDEN * scale) % 1) * rule.order)

      links[x * DEGREE + d] = g
      links[(rule.neighbour[x * DEGREE + d] ?? 0) * DEGREE + (rule.opposite[d] ?? d)] = rule.inverse[g] ?? rule.identity
    }
  }

  return links
}

export function coldLinks(rule: MatterLinks): Int16Array {
  return new Int16Array(rule.cells * DEGREE).fill(rule.identity)
}

function setLink(rule: MatterLinks, links: Int16Array, x: number, d: number, g: number): void {
  links[x * DEGREE + d] = g
  links[(rule.neighbour[x * DEGREE + d] ?? 0) * DEGREE + (rule.opposite[d] ?? d)] = rule.inverse[g] ?? rule.identity
}

// the summed level of the 8 triangles through the link (x, a), with u in its place
function triangleEnergy(rule: MatterLinks, links: Int16Array, x: number, a: number, u: number): number {
  const { neighbour, compose, level, order } = rule
  const y = neighbour[x * DEGREE + a] ?? 0

  let total = 0

  for (const [b, c] of rule.staples[a] ?? []) {
    const z = neighbour[y * DEGREE + b] ?? 0
    const gb = links[y * DEGREE + b] ?? 0
    const gc = links[z * DEGREE + c] ?? 0

    total += level[compose[gc * order + (compose[gb * order + u] ?? 0)] ?? 0] ?? 0
  }

  return total
}

// the matter term on the link (x, d) with u in its place
function linkMatter(rule: MatterLinks, state: MatterState, x: number, d: number, u: number): number {
  const y = rule.neighbour[x * DEGREE + d] ?? 0

  if (state.vibe[x] === 0 || state.vibe[y] === 0) {
    return 0
  }

  const p = state.role[x] ?? 0
  const carried = rule.transport ? (rule.act[u * 9 + p] ?? 0) : p

  return carried === state.role[y] ? -rule.kappa : 0
}

// the matter term on every link at cell x
function cellMatter(rule: MatterLinks, state: MatterState, x: number): number {
  if (state.vibe[x] === 0) {
    return 0
  }

  let total = 0

  for (let d = 0; d < DEGREE; d++) {
    total += linkMatter(rule, state, x, d, state.links[x * DEGREE + d] ?? 0)
  }

  return total
}

// the demon of the undirected link (x, d)
function demonSlot(rule: MatterLinks, x: number, d: number): number {
  const o = rule.opposite[d] ?? d

  return d < o ? x * DEGREE + d : (rule.neighbour[x * DEGREE + d] ?? 0) * DEGREE + o
}

// pay `cost` from a demon, or refuse
function pay(rule: MatterLinks, state: MatterState, slot: number, cost: number): boolean {
  const next = (state.demon[slot] ?? 0) - cost

  if (next < 0 || next > rule.capacity) {
    return false
  }

  state.demon[slot] = next

  return true
}

// reflect the link (x, a) through the staple of triangle `type`: an involution. Returns 0 when it does not
// move, 1 when it moves, 2 when it moves and the matter term on it changes
function reflectLink(rule: MatterLinks, state: MatterState, x: number, a: number, type: number): number {
  const { neighbour, compose, inverse, order } = rule
  const links = state.links
  const pairs = rule.staples[a] ?? []
  const [b, c] = pairs[type % pairs.length] ?? [0, 0]
  const u = links[x * DEGREE + a] ?? 0
  const y = neighbour[x * DEGREE + a] ?? 0
  const z = neighbour[y * DEGREE + b] ?? 0
  const staple = compose[(links[z * DEGREE + c] ?? 0) * order + (links[y * DEGREE + b] ?? 0)] ?? 0
  const back = inverse[staple] ?? 0
  const next = compose[back * order + (compose[(inverse[u] ?? 0) * order + back] ?? 0)] ?? 0

  if (next === u) {
    return 0
  }

  const gauge = triangleEnergy(rule, links, x, a, next) - triangleEnergy(rule, links, x, a, u)
  const matter = linkMatter(rule, state, x, a, next) - linkMatter(rule, state, x, a, u)

  if (!pay(rule, state, x * DEGREE + a, gauge + (rule.feel ? matter : 0))) {
    return 0
  }

  setLink(rule, links, x, a, next)

  return matter !== 0 ? 2 : 1
}

// reflect the role point at x through its neighbor across d: p' = 2 q - p, q the neighbor's point brought over
function reflectRole(rule: MatterLinks, state: MatterState, x: number, d: number): boolean {
  const y = rule.neighbour[x * DEGREE + d] ?? 0

  if (state.vibe[x] === 0 || state.vibe[y] === 0 || x === y) {
    return false
  }

  const back = state.links[y * DEGREE + (rule.opposite[d] ?? d)] ?? 0
  const q = rule.transport ? (rule.act[back * 9 + (state.role[y] ?? 0)] ?? 0) : (state.role[y] ?? 0)
  const p = state.role[x] ?? 0
  const next = mod3(2 * (q % 3) - (p % 3)) + 3 * mod3(2 * Math.floor(q / 3) - Math.floor(p / 3))

  if (next === p) {
    return false
  }

  const before = cellMatter(rule, state, x)

  state.role[x] = next

  const after = cellMatter(rule, state, x)

  if (!pay(rule, state, demonSlot(rule, x, d), after - before)) {
    state.role[x] = p

    return false
  }

  return true
}

// a lone vibe crosses the link (x, a) with its role point carried: an involution
function hopAcross(rule: MatterLinks, state: MatterState, x: number, a: number): boolean {
  const y = rule.neighbour[x * DEGREE + a] ?? 0
  const vx = state.vibe[x] ?? 0
  const vy = state.vibe[y] ?? 0

  if ((vx === 0) === (vy === 0) || x === y) {
    return false
  }

  const [from, to, via] = vx !== 0 ? [x, y, state.links[x * DEGREE + a] ?? 0] : [y, x, state.links[y * DEGREE + (rule.opposite[a] ?? a)] ?? 0]
  const before = cellMatter(rule, state, from)
  const v = state.vibe[from] ?? 0
  const p = state.role[from] ?? 0

  state.vibe[from] = 0
  state.role[from] = 0
  state.vibe[to] = v
  state.role[to] = rule.transport ? (rule.act[via * 9 + p] ?? 0) : p

  const after = cellMatter(rule, state, to)

  if (!pay(rule, state, x * DEGREE + a, after - before)) {
    state.vibe[to] = 0
    state.role[to] = 0
    state.vibe[from] = v
    state.role[from] = p

    return false
  }

  return true
}

function copy(state: MatterState): MatterState {
  return {
    vibe: Int8Array.from(state.vibe),
    role: Int8Array.from(state.role),
    links: Int16Array.from(state.links),
    demon: Int32Array.from(state.demon),
  }
}

function streamDemons(rule: MatterLinks, demon: Int32Array, forward: boolean): void {
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

export function matterBeat(rule: MatterLinks, input: MatterState, t: number): { state: MatterState; moved: MoveCount } {
  const state = copy(input)
  const moved: MoveCount = { links: 0, felt: 0, roles: 0, hops: 0 }

  rule.firsts.forEach((a, k) => {
    for (let x = 0; x < rule.cells; x++) {
      const result = reflectLink(rule, state, x, a, t + k)

      moved.links += result > 0 ? 1 : 0
      moved.felt += result === 2 ? 1 : 0
    }
  })

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
        moved.hops += hopAcross(rule, state, x, a) ? 1 : 0
      }
    }
  }

  streamDemons(rule, state.demon, true)

  return { state, moved }
}

export function matterBeatBack(rule: MatterLinks, input: MatterState, t: number): MatterState {
  const state = copy(input)

  streamDemons(rule, state.demon, false)

  if (rule.hop) {
    for (let x = rule.cells - 1; x >= 0; x--) {
      for (let k = rule.firsts.length - 1; k >= 0; k--) {
        hopAcross(rule, state, x, rule.firsts[k] ?? 0)
      }
    }
  }

  // no vibe moves during the role step, so the cells holding one now are the ones that held one then
  for (let x = rule.roles ? rule.cells - 1 : -1; x >= 0; x--) {
    if (state.vibe[x] === 0) {
      continue
    }

    for (let d = DEGREE - 1; d >= 0; d--) {
      reflectRole(rule, state, x, d)
    }
  }

  for (let k = rule.firsts.length - 1; k >= 0; k--) {
    const a = rule.firsts[k] ?? 0

    for (let x = rule.cells - 1; x >= 0; x--) {
      reflectLink(rule, state, x, a, t + k)
    }
  }

  return state
}

// the links' own energy: every triangle once
export function fieldEnergy(rule: MatterLinks, links: Int16Array): number {
  let total = 0

  for (let x = 0; x < rule.cells; x++) {
    for (const a of rule.firsts) {
      total += triangleEnergy(rule, links, x, a, links[x * DEGREE + a] ?? 0)
    }
  }

  return total / 3
}

// the matter term: every link once
export function matterEnergy(rule: MatterLinks, state: MatterState): number {
  let total = 0

  for (let x = 0; x < rule.cells; x++) {
    for (const a of rule.firsts) {
      total += linkMatter(rule, state, x, a, state.links[x * DEGREE + a] ?? 0)
    }
  }

  return total
}

export function totalEnergy(rule: MatterLinks, state: MatterState): number {
  return fieldEnergy(rule, state.links) + matterEnergy(rule, state) + state.demon.reduce((a, b) => a + b, 0)
}

// the mean level of the triangles through each cell's links, per cell: the field's energy density
export function cellFieldLevel(rule: MatterLinks, links: Int16Array): Float64Array {
  const sum = new Float64Array(rule.cells)

  for (let x = 0; x < rule.cells; x++) {
    for (const a of rule.firsts) {
      const e = triangleEnergy(rule, links, x, a, links[x * DEGREE + a] ?? 0)

      sum[x] = (sum[x] ?? 0) + e
      const y = rule.neighbour[x * DEGREE + a] ?? 0

      sum[y] = (sum[y] ?? 0) + e
    }
  }

  // each cell has 24 links, each through 8 triangles
  return sum.map(v => v / (DEGREE * 8))
}

// a change of role frame: h in every cell, links h_y U h_x^-1, a vibe's point h_x p, a calm cell's left at 0
export function changeFrame(rule: MatterLinks, state: MatterState, frame: ArrayLike<number>): MatterState {
  const { compose, inverse, order, act, neighbour } = rule
  const links = new Int16Array(state.links.length)

  for (let x = 0; x < rule.cells; x++) {
    for (let d = 0; d < DEGREE; d++) {
      const hy = frame[neighbour[x * DEGREE + d] ?? 0] ?? 0
      const hx = inverse[frame[x] ?? 0] ?? 0

      links[x * DEGREE + d] = compose[(compose[hy * order + (state.links[x * DEGREE + d] ?? 0)] ?? 0) * order + hx] ?? 0
    }
  }

  const role = Int8Array.from(state.role, (p, x) => (state.vibe[x] !== 0 ? (act[(frame[x] ?? 0) * 9 + p] ?? 0) : 0))

  return { vibe: Int8Array.from(state.vibe), role, links, demon: Int32Array.from(state.demon) }
}

// the transport round the closed line x, x+a, x+2a, ... back to x: the Polyakov product along a
export function lineTransport(rule: MatterLinks, links: Int16Array, x: number, a: number): number {
  const { compose, order, neighbour } = rule

  let product = rule.identity
  let current = x

  do {
    product = compose[(links[current * DEGREE + a] ?? 0) * order + product] ?? 0
    current = neighbour[current * DEGREE + a] ?? 0
  } while (current !== x)

  return product
}

// the mean level of the 8 triangles through the link (x, a)
export function linkLevel(rule: MatterLinks, links: Int16Array, x: number, a: number): number {
  return triangleEnergy(rule, links, x, a, links[x * DEGREE + a] ?? 0) / 8
}

// whether the link (x, d) carries the role point of x onto the role point of its neighbor
export function carries(rule: MatterLinks, state: MatterState, x: number, d: number): boolean {
  const y = rule.neighbour[x * DEGREE + d] ?? 0

  return rule.act[(state.links[x * DEGREE + d] ?? 0) * 9 + (state.role[x] ?? 0)] === state.role[y]
}

// how many grid points a move leaves in place: |Tr U|^2 of its Sigma(648) element (E-FRC-0119)
export function fixedPoints(rule: MatterLinks, g: number): number {
  return 9 - (rule.level[g] ?? 0)
}
