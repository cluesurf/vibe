// Links as vibe-vibe relations. A dock has 24 slots, one per direction, and the edge between docks x and
// y = x + d is shared by two of them: x's slot toward y, (x, d), and y's slot toward x, (y, -d). The
// question is whether a link can be nothing but a relation between what those two slots hold, with no state
// of its own. This module holds the pieces that answer it.
//
// 1. The algebra. A relation f(p, q) of the two slots' contents is a link only if it transforms as one:
//    f(g_x p, g_y q) = g_y f(p, q) g_x^-1 for every change of frame g_x, g_y in the gauged group H.
//    `relationCensus` counts, for a slot content and a gauged group, the orbits of H x H on pairs of slot
//    contents and the link values each admits, by brute force over the stabilizers. A covariant relation
//    exists exactly when H acts freely on the slot contents, so a slot must hold a torsor of H: its frame.
//    `subgroupsFromPairs` enumerates the subgroups of the 216 grid moves, `directionRelation` reads the turn
//    between the two slots of an edge from the coin group, and `centerCocycle` asks whether the center can
//    ride the role points' relation with the flux as its history.
// 2. Curvature from fills: `triangleHolonomies` carries a frame per slot round every triangle of the D4 box.
//    A dock's 24 slots hold independent frames, so the loop is not pure gauge. One frame per dock is.
// 3. The knit, where every slot streams every beat. `relationalColorBeat` runs the color weave with each
//    streaming role point carried by the relation of the two slots that are crossing, which sends it onto
//    its partner's point: nothing crosses.
// 4. The port form of code/rule/sigma-links: each slot of a dock holds a frame P(x, d) of Sigma(648) that
//    stays with the dock's port while matter hops, and the link is P(y, -d) P(x, d)^-1. The flux is the
//    difference of two port counters, each the count of what left through its port. `portBeat` runs the
//    stored-link rule on the derived links and writes the result back into the ports.
// 5. The history form of the U(1) leapfrog of code/rule/photon-links: each port counts the flux that left
//    through it and the time integral of that count, so E is the difference of two counts and the angle A
//    the difference of two integrals, A(t) = A(0) + sum of E, with A(0) = 0. No angle is stored.

import { rootsD4 } from '@/code/algebra/group/root-system'
import { coinGroup } from '@/code/algebra/group/coin-group'
import { colorBeat, type ColorWeave } from '@/code/rule/color-weave'
import { plaquetteField, type PhotonRule } from '@/code/rule/photon-links'
import { sigmaBeat, sigmaBeatBack, sigmaFluxAlong, type SigmaLinks, type SigmaState } from '@/code/rule/sigma-links'
import { gridMoves, type GridMoves, type VibeState } from '@/code/rule/vibe-weave'

const DEGREE = 24

const modulo = (x: number, m: number): number => ((x % m) + m) % m

// 1. The algebra

export type GroupTable = {
  readonly order: number
  // product[g * order + h] = g h
  readonly product: Int16Array
  readonly inverse: Int16Array
  readonly identity: number
}

// the 216 grid moves as a table, in the index order of gridMoves
export function gridTable(moves: GridMoves = gridMoves()): GroupTable {
  const order = moves.act.length
  const product = new Int16Array(order * order)

  for (let g = 0; g < order; g++) {
    for (let h = 0; h < order; h++) {
      product[g * order + h] = moves.compose(g, h)
    }
  }

  return { order, product, inverse: Int16Array.from(moves.inverse), identity: moves.identity }
}

export const times = (table: GroupTable, g: number, h: number): number => table.product[g * table.order + h] ?? 0

// a group acting on a finite set of slot contents
export type SlotAction = {
  readonly table: GroupTable
  readonly points: number
  act(g: number, p: number): number
}

export type RelationCensus = {
  // orbits of the gauged group on the slot contents
  slotOrbits: number
  // orbits of H x H on the pairs of slot contents, and how many admit at least one covariant link value
  pairOrbits: number
  pairOrbitsWithValue: number
  largestStabilizer: number
  smallestStabilizer: number
  covariant: boolean
  // the link values covariant relations can take, over every pair
  values: number
}

// For each orbit representative pair (p, q), the link values U with h U g^-1 = U for every g in Stab(p) and h
// in Stab(q), counted by brute force. A covariant relation is a choice of one such U per orbit, so it exists
// when every orbit admits one.
export function relationCensus(input: { action: SlotAction; gauged: readonly number[] }): RelationCensus {
  const { action, gauged } = input
  const { table } = action
  const seen = new Uint8Array(action.points)
  const representatives: { point: number; stabilizer: number[] }[] = []

  for (let p = 0; p < action.points; p++) {
    if (seen[p] === 1) {
      continue
    }

    for (const g of gauged) {
      seen[action.act(g, p)] = 1
    }

    representatives.push({ point: p, stabilizer: gauged.filter(g => action.act(g, p) === p) })
  }

  const values = new Uint8Array(table.order)

  let pairOrbitsWithValue = 0

  for (const left of representatives) {
    for (const right of representatives) {
      let admitted = 0

      for (let u = 0; u < table.order; u++) {
        let fixed = true

        for (const g of left.stabilizer) {
          const ug = times(table, u, table.inverse[g] ?? 0)

          for (const h of right.stabilizer) {
            if (times(table, h, ug) !== u) {
              fixed = false
              break
            }
          }

          if (!fixed) {
            break
          }
        }

        if (!fixed) {
          continue
        }

        admitted += 1

        // the value this choice takes on the rest of the orbit: h u g^-1
        for (const h of gauged) {
          const hu = times(table, h, u)

          for (const g of gauged) {
            values[times(table, hu, table.inverse[g] ?? 0)] = 1
          }
        }
      }

      pairOrbitsWithValue += admitted > 0 ? 1 : 0
    }
  }

  const sizes = representatives.map(r => r.stabilizer.length)

  return {
    slotOrbits: representatives.length,
    pairOrbits: representatives.length ** 2,
    pairOrbitsWithValue,
    largestStabilizer: Math.max(...sizes),
    smallestStabilizer: Math.min(...sizes),
    covariant: pairOrbitsWithValue === representatives.length ** 2,
    values: values.reduce((a, b) => a + b, 0),
  }
}

// the elements of the group generated by the given ones
export function closure(table: GroupTable, generators: readonly number[]): number[] {
  const inside = new Uint8Array(table.order)
  const queue = [table.identity]

  inside[table.identity] = 1

  while (queue.length > 0) {
    const g = queue.pop() ?? 0

    for (const s of generators) {
      const next = times(table, g, s)

      if (inside[next] === 0) {
        inside[next] = 1
        queue.push(next)
      }
    }
  }

  return Array.from({ length: table.order }, (_, g) => g).filter(g => inside[g] === 1)
}

// every subgroup generated by at most two elements, each once, as a sorted element list
export function subgroupsFromPairs(table: GroupTable): number[][] {
  const found = new Map<string, number[]>()

  for (let g = 0; g < table.order; g++) {
    for (let h = g; h < table.order; h++) {
      const group = closure(table, [g, h])
      const key = group.join(',')

      if (!found.has(key)) {
        found.set(key, group)
      }
    }
  }

  return [...found.values()]
}

// whether every element but the identity moves every slot content
export function actsFreely(action: SlotAction, elements: readonly number[]): boolean {
  return elements.every(g => g === action.table.identity || Array.from({ length: action.points }, (_, p) => p).every(p => action.act(g, p) !== p))
}

// The turn between the two slots of an edge: in the coin group of the 24 directions (x o y = x q y,
// code/algebra/group/coin-group), the element t with t o d = -d, and the element s with d o s = -d, for
// every direction d. Whether they are one element for all 24, and whether it is central and an involution.
export function directionRelation(): {
  leftDistinct: number
  rightDistinct: number
  central: boolean
  involution: boolean
  sameBothSides: boolean
} {
  const roots = rootsD4()
  const coin = coinGroup({ directions: roots })
  const n = roots.length
  const mul = (a: number, b: number): number => coin.product[a * n + b] ?? -1
  const negate = (d: number): number => roots.findIndex(r => r.every((x, k) => x === -(roots[d]?.[k] ?? 0)))
  const left = new Set<number>()
  const right = new Set<number>()

  for (let d = 0; d < n; d++) {
    const target = negate(d)

    for (let t = 0; t < n; t++) {
      if (mul(t, d) === target) {
        left.add(t)
      }

      if (mul(d, t) === target) {
        right.add(t)
      }
    }
  }

  const t = [...left][0] ?? 0

  return {
    leftDistinct: left.size,
    rightDistinct: right.size,
    central: Array.from({ length: n }, (_, g) => g).every(g => mul(t, g) === mul(g, t)),
    involution: mul(t, t) === coin.identity,
    sameBothSides: left.size === 1 && right.size === 1 && [...right][0] === t,
  }
}

// The center with the role points' relation. The relation of two role points is a translation u = q - p, and
// the elements of Sigma(648) over the 9 translations are the Heisenberg group of 27. A link built from the
// relation alone needs a section s choosing one of the 3 elements over each translation, with the center
// phase from a history such as the flux, which no frame change moves. It is covariant under a change of
// frame by translations h_x = s(t_x), h_y = s(t_y) when s(u + t_y - t_x) = s(t_y) s(u) s(t_x)^-1. Counted
// over all 729 triples (u, t_x, t_y) for each of the 3^8 sections with s(0) the identity, and with a local
// center phase in the frame change as well (27 x 27 x 9 triples). The control: each slot holding its own
// Heisenberg element F, the link F_q F_p^-1, over all frame changes.
export function centerCocycle(rule: SigmaLinks): {
  sections: number
  triples: number
  fewestMismatches: number
  mostMismatches: number
  triplesWithCenter: number
  fewestMismatchesWithCenter: number
  torsorMismatches: number
} {
  const moves = gridMoves()
  const table = gridTable(moves)
  const translations = Array.from({ length: table.order }, (_, m) => m).filter(m => {
    const shift = moves.act[m]?.[0] ?? 0

    return Array.from({ length: 9 }, (_, p) => p).every(
      p => moves.act[m]?.[p] === modulo((p % 3) + (shift % 3), 3) + 3 * modulo(Math.floor(p / 3) + Math.floor(shift / 3), 3),
    )
  })
  const heisenberg = Array.from({ length: rule.order }, (_, g) => g).filter(g => translations.includes(rule.quotient[g] ?? -1))
  const fiber = translations.map(u => heisenberg.filter(g => rule.quotient[g] === u))
  const indexOf = new Map(translations.map((u, k) => [u, k]))
  const zero = indexOf.get(table.identity) ?? 0
  const mul = (g: number, h: number): number => rule.group.product[g * rule.order + h] ?? 0
  const inv = (g: number): number => rule.group.inverse[g] ?? 0
  const centers = heisenberg.filter(g => rule.quotient[g] === table.identity)
  const others = translations.map((_, k) => k).filter(k => k !== zero)
  const sections = 3 ** others.length

  let fewest = Number.POSITIVE_INFINITY
  let most = 0
  let fewestWithCenter = Number.POSITIVE_INFINITY

  for (let code = 0; code < sections; code++) {
    const section = new Array<number>(translations.length)

    section[zero] = rule.identity
    others.forEach((k, i) => (section[k] = fiber[k]?.[Math.floor(code / 3 ** i) % 3] ?? 0))

    let mismatches = 0
    let withCenter = 0

    for (let u = 0; u < 9; u++) {
      for (let tx = 0; tx < 9; tx++) {
        for (let ty = 0; ty < 9; ty++) {
          const link = mul(mul(section[ty] ?? 0, section[u] ?? 0), inv(section[tx] ?? 0))
          const relation = section[indexOf.get(rule.quotient[link] ?? 0) ?? 0] ?? 0
          const miss = link !== relation

          mismatches += miss ? 1 : 0

          for (const zx of centers) {
            for (const zy of centers) {
              withCenter += miss || zx !== zy ? 1 : 0
            }
          }
        }
      }
    }

    fewest = Math.min(fewest, mismatches)
    most = Math.max(most, mismatches)
    fewestWithCenter = Math.min(fewestWithCenter, withCenter)
  }

  let torsorMismatches = 0

  for (const p of heisenberg) {
    for (const q of heisenberg) {
      const link = mul(q, inv(p))

      for (const hx of heisenberg) {
        for (const hy of heisenberg) {
          torsorMismatches += mul(mul(hy, q), inv(mul(hx, p))) === mul(mul(hy, link), inv(hx)) ? 0 : 1
        }
      }
    }
  }

  return {
    sections,
    triples: 729,
    fewestMismatches: fewest,
    mostMismatches: most,
    triplesWithCenter: 729 * centers.length ** 2,
    fewestMismatchesWithCenter: fewestWithCenter,
    torsorMismatches,
  }
}

// 2. Curvature from fills

export type TriangleMesh = {
  readonly cells: number
  readonly neighbour: Int32Array
  readonly opposite: readonly number[]
  // staples[a] = the pairs (b, c) with a + b + c = 0
  readonly staples: readonly (readonly (readonly [number, number])[])[]
}

// The holonomy of every triangle x -a-> y -b-> z -c-> x, each oriented triangle once per start, with each
// link the relation of its two slots' frames, U = F(y, -a) F(x, a)^-1. Returns a histogram over the group.
export function triangleHolonomies(input: { mesh: TriangleMesh; frames: Int16Array; table: GroupTable }): Float64Array {
  const { mesh, frames, table } = input
  const counts = new Float64Array(table.order)
  const link = (x: number, d: number): number => {
    const y = mesh.neighbour[x * DEGREE + d] ?? 0

    return times(table, frames[y * DEGREE + (mesh.opposite[d] ?? d)] ?? 0, table.inverse[frames[x * DEGREE + d] ?? 0] ?? 0)
  }

  for (let x = 0; x < mesh.cells; x++) {
    for (let a = 0; a < DEGREE; a++) {
      const y = mesh.neighbour[x * DEGREE + a] ?? 0

      for (const [b, c] of mesh.staples[a] ?? []) {
        const z = mesh.neighbour[y * DEGREE + b] ?? 0

        const g = times(table, link(z, c), times(table, link(y, b), link(x, a)))

        counts[g] = (counts[g] ?? 0) + 1
      }
    }
  }

  return counts
}

// 3. The knit

// The color weave (code/rule/color-weave) with each streaming role point carried by the relation of the two
// slots crossing its edge: the move U that sends x's point p to y's point q, a translation, applied to p.
// Vibes, flows and the collision are the color weave's. The stream is read from a pass with every link the
// identity, which leaves each point as it was, so p and q are the two points just before they cross.
export function relationalColorBeat(weave: ColorWeave, state: VibeState, t: number): VibeState {
  const { mesh, moves, opposite } = weave
  const plain = colorBeat({ ...weave, links: new Int16Array(weave.links.length).fill(moves.identity) }, state, t)
  const translation = (u: number): number =>
    moves.act.findIndex(m => Array.from({ length: 9 }, (_, p) => p).every(p => m[p] === modulo((p % 3) + (u % 3), 3) + 3 * modulo(Math.floor(p / 3) + Math.floor(u / 3), 3)))
  const shifts = Array.from({ length: 9 }, (_, u) => translation(u))
  const role = new Int8Array(plain.role.length)

  for (let y = 0; y < mesh.cellCount; y++) {
    for (let d = 0; d < DEGREE; d++) {
      const back = opposite[d] ?? d
      const x = mesh.neighbour(y, back)
      // the point that crossed x -> y, and the point that crossed y -> x, both before the crossing
      const p = plain.role[y * DEGREE + d] ?? 0
      const q = plain.role[x * DEGREE + back] ?? 0
      const u = modulo((q % 3) - (p % 3), 3) + 3 * modulo(Math.floor(q / 3) - Math.floor(p / 3), 3)
      const move = shifts[u] ?? moves.identity

      role[y * DEGREE + d] = moves.act[move]?.[p] ?? 0
    }
  }

  return { vibe: plain.vibe, role, flow: plain.flow }
}

// 4. The port form of sigma-links

export type PortState = {
  readonly vibe: Int8Array
  readonly role: Int8Array
  // ports[x * 24 + d], the frame P(x, d) of Sigma(648) held by x's slot toward x + d, carrying that slot's
  // own frame to the dock's
  readonly ports: Int16Array
  readonly demon: Int32Array
  // counts[x * 24 + d], what has left x through d: E along x -> x + d is counts(x, d) - counts(x + d, -d)
  readonly counts: Int32Array
}

const sigmaTimes = (rule: SigmaLinks, g: number, h: number): number => rule.group.product[g * rule.order + h] ?? 0
const sigmaInverse = (rule: SigmaLinks, g: number): number => rule.group.inverse[g] ?? 0

// the link of every directed slot, U(x, d) = P(x + d, -d) P(x, d)^-1: the reverse is the inverse by construction
export function linksFromPorts(rule: SigmaLinks, ports: Int16Array): Int16Array {
  const links = new Int16Array(rule.cells * DEGREE)

  for (let x = 0; x < rule.cells; x++) {
    for (let d = 0; d < DEGREE; d++) {
      const y = rule.neighbour[x * DEGREE + d] ?? 0

      links[x * DEGREE + d] = sigmaTimes(rule, ports[y * DEGREE + (rule.opposite[d] ?? d)] ?? 0, sigmaInverse(rule, ports[x * DEGREE + d] ?? 0))
    }
  }

  return links
}

// the flux on first directions, E(x, a) = counts(x, a) - counts(x + a, -a), in sigma-links' layout
export function fluxFromCounts(rule: SigmaLinks, counts: Int32Array): Int32Array {
  const flux = new Int32Array(rule.cells * DEGREE)

  for (let x = 0; x < rule.cells; x++) {
    for (const a of rule.firsts) {
      const y = rule.neighbour[x * DEGREE + a] ?? 0

      flux[x * DEGREE + a] = (counts[x * DEGREE + a] ?? 0) - (counts[y * DEGREE + (rule.opposite[a] ?? a)] ?? 0)
    }
  }

  return flux
}

// the ports of a stored-link state: each second port P(x + a, -a) given (by `anchor`), the first set so the
// relation is the link, and the flux held on the first ports' counts
export function portsFromState(rule: SigmaLinks, state: SigmaState, anchor: (slot: number) => number): PortState {
  const ports = new Int16Array(rule.cells * DEGREE)
  const counts = new Int32Array(rule.cells * DEGREE)

  for (let x = 0; x < rule.cells; x++) {
    for (const a of rule.firsts) {
      const y = rule.neighbour[x * DEGREE + a] ?? 0
      const second = y * DEGREE + (rule.opposite[a] ?? a)
      const frame = anchor(second)

      ports[second] = frame
      ports[x * DEGREE + a] = sigmaTimes(rule, sigmaInverse(rule, state.links[x * DEGREE + a] ?? 0), frame)
      counts[x * DEGREE + a] = state.flux[x * DEGREE + a] ?? 0
    }
  }

  return { vibe: Int8Array.from(state.vibe), role: Int8Array.from(state.role), ports, demon: Int32Array.from(state.demon), counts }
}

export function stateFromPorts(rule: SigmaLinks, state: PortState): SigmaState {
  return {
    vibe: Int8Array.from(state.vibe),
    role: Int8Array.from(state.role),
    links: linksFromPorts(rule, state.ports),
    demon: Int32Array.from(state.demon),
    flux: fluxFromCounts(rule, state.counts),
  }
}

export type PortBeat = {
  state: PortState
  // docks where the part of the flux change not made by hops has a nonzero divergence
  loopDivergence: number
}

// One beat of the port form. The link rule runs on the relations; afterwards each first port takes the frame
// that makes its relation the new link, P(x, a) = U^-1 P(x + a, -a), the second port unchanged. A hop's flux
// change is counted on the port the vibe left by, -v; what is left of the flux change is closed circulation
// (flux loops round triangles) and is counted on the first port.
export function portBeat(rule: SigmaLinks, input: PortState, t: number): PortBeat {
  const before = stateFromPorts(rule, input)
  const vibes = Int8Array.from(input.vibe)
  const counts = Int32Array.from(input.counts)
  const hopChange = new Int32Array(rule.cells * DEGREE)

  const { state: after } = sigmaBeat(rule, before, t, (from, to, d) => {
    const v = vibes[from] ?? 0

    vibes[to] = v
    vibes[from] = 0
    counts[from * DEGREE + d] = (counts[from * DEGREE + d] ?? 0) - v

    const o = rule.opposite[d] ?? d
    const [slot, sign] = d < o ? [from * DEGREE + d, 1] : [to * DEGREE + o, -1]

    hopChange[slot] = (hopChange[slot] ?? 0) - sign * v
  })

  const ports = Int16Array.from(input.ports)
  const loop = new Int32Array(rule.cells)

  for (let x = 0; x < rule.cells; x++) {
    for (const a of rule.firsts) {
      const y = rule.neighbour[x * DEGREE + a] ?? 0
      const second = ports[y * DEGREE + (rule.opposite[a] ?? a)] ?? 0
      const slot = x * DEGREE + a
      const rest = (after.flux[slot] ?? 0) - (before.flux[slot] ?? 0) - (hopChange[slot] ?? 0)

      ports[slot] = sigmaTimes(rule, sigmaInverse(rule, after.links[slot] ?? 0), second)
      counts[slot] = (counts[slot] ?? 0) + rest
      loop[x] = (loop[x] ?? 0) + rest
      loop[y] = (loop[y] ?? 0) - rest
    }
  }

  return {
    state: { vibe: after.vibe, role: after.role, ports, demon: after.demon, counts },
    loopDivergence: loop.reduce((n, v) => n + (v !== 0 ? 1 : 0), 0),
  }
}

// the inverse of one beat of the port form: the ports exactly, and every flux change counted on the first port
export function portBeatBack(rule: SigmaLinks, input: PortState, t: number): PortState {
  const before = stateFromPorts(rule, input)
  const after = sigmaBeatBack(rule, before, t)
  const ports = Int16Array.from(input.ports)
  const counts = Int32Array.from(input.counts)

  for (let x = 0; x < rule.cells; x++) {
    for (const a of rule.firsts) {
      const y = rule.neighbour[x * DEGREE + a] ?? 0
      const slot = x * DEGREE + a

      ports[slot] = sigmaTimes(rule, sigmaInverse(rule, after.links[slot] ?? 0), ports[y * DEGREE + (rule.opposite[a] ?? a)] ?? 0)
      counts[slot] = (counts[slot] ?? 0) + (after.flux[slot] ?? 0) - (before.flux[slot] ?? 0)
    }
  }

  return { vibe: after.vibe, role: after.role, ports, demon: after.demon, counts }
}

// a change of frame in every dock: every port of x turned by g_x, P -> g_x P, and a vibe's point moved by it
export function changePortFrame(rule: SigmaLinks, state: PortState, frame: ArrayLike<number>): PortState {
  return {
    vibe: Int8Array.from(state.vibe),
    role: Int8Array.from(state.role, (p, x) =>
      state.vibe[x] !== 0 ? (rule.act[(rule.quotient[frame[x] ?? 0] ?? 0) * 9 + p] ?? 0) : 0,
    ),
    ports: Int16Array.from(state.ports, (g, slot) => sigmaTimes(rule, frame[Math.floor(slot / DEGREE)] ?? 0, g)),
    demon: Int32Array.from(state.demon),
    counts: Int32Array.from(state.counts),
  }
}

// a change of frame at the middle of every edge, k on edge (x, a): both of its ports P -> P k^-1. Every
// relation is unchanged, so this is the redundancy of holding a link as two frames
export function changePortMiddle(rule: SigmaLinks, state: PortState, middle: (x: number, a: number) => number): PortState {
  const ports = Int16Array.from(state.ports)

  for (let x = 0; x < rule.cells; x++) {
    for (const a of rule.firsts) {
      const k = sigmaInverse(rule, middle(x, a))
      const y = rule.neighbour[x * DEGREE + a] ?? 0
      const second = y * DEGREE + (rule.opposite[a] ?? a)

      ports[x * DEGREE + a] = sigmaTimes(rule, ports[x * DEGREE + a] ?? 0, k)
      ports[second] = sigmaTimes(rule, ports[second] ?? 0, k)
    }
  }

  return { ...state, ports }
}

// the dock form, one frame per dock and every link h_y h_x^-1: the frames read off a spanning tree of the
// links from dock 0, so the tree's links are kept and every other link is the tree's product
export function dockFormLinks(rule: SigmaLinks, links: Int16Array): { frames: Int16Array; links: Int16Array } {
  const frame = new Int16Array(rule.cells).fill(-1)
  const queue = [0]

  frame[0] = rule.identity

  while (queue.length > 0) {
    const x = queue.shift() ?? 0

    for (let d = 0; d < DEGREE; d++) {
      const y = rule.neighbour[x * DEGREE + d] ?? 0

      if (frame[y] === -1) {
        frame[y] = sigmaTimes(rule, links[x * DEGREE + d] ?? 0, frame[x] ?? 0)
        queue.push(y)
      }
    }
  }

  const out = new Int16Array(links.length)

  for (let x = 0; x < rule.cells; x++) {
    for (let d = 0; d < DEGREE; d++) {
      out[x * DEGREE + d] = sigmaTimes(rule, frame[rule.neighbour[x * DEGREE + d] ?? 0] ?? 0, sigmaInverse(rule, frame[x] ?? 0))
    }
  }

  return { frames: frame, links: out }
}

// the flux-carrying links (E mod 3 not 0) in the connected pieces touching one of `sources`, joined through
// shared docks: the string read from the configuration (the instrument of E-FRC-0151)
export function connectedFluxString(rule: SigmaLinks, flux: Int32Array, sources: readonly number[]): number {
  const seen = new Uint8Array(rule.cells)
  const counted = new Uint8Array(rule.cells * DEGREE)
  const queue = [...sources]

  let links = 0

  sources.forEach(x => (seen[x] = 1))

  while (queue.length > 0) {
    const x = queue.pop() ?? 0

    for (let d = 0; d < DEGREE; d++) {
      if (modulo(sigmaFluxAlong(rule, flux, x, d), 3) === 0) {
        continue
      }

      const o = rule.opposite[d] ?? d
      const y = rule.neighbour[x * DEGREE + d] ?? 0
      const slot = d < o ? x * DEGREE + d : y * DEGREE + o

      if (counted[slot] === 0) {
        counted[slot] = 1
        links += 1
      }

      if (seen[y] === 0) {
        seen[y] = 1
        queue.push(y)
      }
    }
  }

  return links
}

// 5. The history form of the U(1) leapfrog

export type HistoryState = {
  readonly vibe: Int8Array
  // count[x * degree + d]: the flux that has left x through d, in units of e, with the kicks' circulation
  // counted on the first port of each link
  readonly count: Int32Array
  // elapsed[x * degree + d]: the sum over past beats of count, mod N
  readonly elapsed: Int32Array
  // demon[l], per link, as in photon-links
  readonly demon: Int32Array
}

function secondPort(rule: PhotonRule, l: number): [number, number] {
  const { lattice } = rule
  const f = lattice.firsts.length
  const x = Math.floor(l / f)
  const a = lattice.firsts[l % f] ?? 0
  const y = lattice.neighbour[x * lattice.degree + a] ?? 0

  return [x * lattice.degree + a, y * lattice.degree + (lattice.opposite[a] ?? a)]
}

// E and A of every link, each the difference of its two ports
export function historyFields(rule: PhotonRule, state: HistoryState): { flux: Int32Array; angle: Int32Array } {
  const links = rule.lattice.links
  const flux = new Int32Array(links)
  const angle = new Int32Array(links)

  for (let l = 0; l < links; l++) {
    const [first, second] = secondPort(rule, l)

    flux[l] = (state.count[first] ?? 0) - (state.count[second] ?? 0)
    angle[l] = modulo((state.elapsed[first] ?? 0) - (state.elapsed[second] ?? 0), rule.n)
  }

  return { flux, angle }
}

// a history state holding the given flux on the first ports, every integral zero (A = 0)
export function historyFromFlux(rule: PhotonRule, input: { vibe: Int8Array; flux: Int32Array; demon: Int32Array }): HistoryState {
  const ports = rule.lattice.cells * rule.lattice.degree
  const count = new Int32Array(ports)

  for (let l = 0; l < rule.lattice.links; l++) {
    count[secondPort(rule, l)[0]] = input.flux[l] ?? 0
  }

  return { vibe: Int8Array.from(input.vibe), count, elapsed: new Int32Array(ports), demon: Int32Array.from(input.demon) }
}

function streamLinkDemons(rule: PhotonRule, demon: Int32Array, forward: boolean): void {
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

function historyDrift(rule: PhotonRule, state: HistoryState, sign: number): void {
  for (let p = 0; p < state.count.length; p++) {
    state.elapsed[p] = modulo((state.elapsed[p] ?? 0) + sign * (state.count[p] ?? 0), rule.n)
  }
}

function historyKick(rule: PhotonRule, state: HistoryState, sign: number): void {
  const { lattice } = rule
  const size = lattice.plaquetteSize
  const { angle } = historyFields(rule, state)

  for (let p = 0; p < lattice.plaquetteCount; p++) {
    const f = rule.force[plaquetteField(rule, angle, p)] ?? 0

    if (f === 0) {
      continue
    }

    for (let j = 0; j < size; j++) {
      const [first] = secondPort(rule, lattice.plaquetteLinks[p * size + j] ?? 0)

      state.count[first] = (state.count[first] ?? 0) - sign * (lattice.plaquetteSigns[p * size + j] ?? 0) * f
    }
  }
}

// the hop of photon-links on link l, the flux change counted on the port the vibe leaves by (forward), or
// taken back off the port it had left by (backward)
function historyHop(rule: PhotonRule, state: HistoryState, l: number, forward: boolean): boolean {
  const { lattice } = rule
  const f = lattice.firsts.length
  const x = Math.floor(l / f)
  const y = lattice.neighbour[x * lattice.degree + (lattice.firsts[l % f] ?? 0)] ?? 0
  const a = state.vibe[x] ?? 0
  const b = state.vibe[y] ?? 0

  if ((a === 0) === (b === 0) || x === y) {
    return false
  }

  const [first, second] = secondPort(rule, l)
  const change = rule.gauss ? rule.charge * (a !== 0 ? -a : b) : 0
  const e = (state.count[first] ?? 0) - (state.count[second] ?? 0)
  const next = (state.demon[l] ?? 0) - ((e + change) * (e + change) - e * e)

  if (next < 0 || next > rule.capacity) {
    return false
  }

  state.demon[l] = next
  state.vibe[x] = b
  state.vibe[y] = a

  // forward the vibe leaves from where it is; backward it returns to the port it had left by, which is
  // where it now arrives
  const leftBy = forward === (a !== 0) ? first : second

  if (leftBy === first) {
    state.count[first] = (state.count[first] ?? 0) + change
  } else {
    state.count[second] = (state.count[second] ?? 0) - change
  }

  return true
}

export function historyBeatInPlace(rule: PhotonRule, state: HistoryState): number {
  historyDrift(rule, state, 1)
  historyKick(rule, state, 1)

  let hops = 0

  for (let l = 0; rule.hop && l < rule.lattice.links; l++) {
    hops += historyHop(rule, state, l, true) ? 1 : 0
  }

  streamLinkDemons(rule, state.demon, true)

  return hops
}

export function historyBeatBackInPlace(rule: PhotonRule, state: HistoryState): void {
  streamLinkDemons(rule, state.demon, false)

  for (let l = rule.hop ? rule.lattice.links - 1 : -1; l >= 0; l--) {
    historyHop(rule, state, l, false)
  }

  historyKick(rule, state, -1)
  historyDrift(rule, state, -1)
}

export function copyHistory(state: HistoryState): HistoryState {
  return {
    vibe: Int8Array.from(state.vibe),
    count: Int32Array.from(state.count),
    elapsed: Int32Array.from(state.elapsed),
    demon: Int32Array.from(state.demon),
  }
}
