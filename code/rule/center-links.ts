// The whole three-trit link: the grid move of code/rule/matter-links and the center flux of
// code/rule/string-graph on the same link, so matter can drag a triality string as well as pull on the
// grid field.
//
// E-FRC-0135 found that the links of matter-links feel the matter only where it touches them, and no
// string forms: the role points see the 216 grid moves, Sigma(648) with its center divided out, and a
// string of that group can break. The note what-the-base-needs says the link of the three-trit model is
// the grid move together with the flow mod 3, the center, which together make the Sigma(648) element. So
// each link here holds both:
// - a grid move U, moved as in matter-links (reflection through a staple, priced with the hopping term)
// - an integer flux E, the center's conjugate, with Gauss's law at every cell: the flux leaving a cell
//   minus the flux entering it equals its vibe (love +1, fear -1). E mod 3 is the triality carried across
//   the link, and a link with E mod 3 not 0 costs the tension
// This is the grid move and the center's electric flux side by side, 216 x 3 labels per link. The center's
// phase itself is not a variable: in a Hamiltonian reading E is its conjugate, so it is what carries energy.
// U and E do not enter one another's energy. They meet only through the matter, which carries a role point
// through U and drags E behind it.
//
// The energy, conserved to the unit:
//
//   H = sum over triangles of (9 - fixed points)  -  kappa * (matched links between two vibes)
//     + tension * (links with E mod 3 not 0)  +  sum of demons
//
// A beat, every move an involution given what it reads and paid by its link's demon:
// 1. links: the reflection of matter-links, unchanged
// 2. flux loops: round one triangle per link and beat, x -a-> y -b-> z -c-> x, the flux on all three links
//    shifts by one step d in the direction of travel, d = +1 when the flux along the first link is even and
//    -1 when it is odd, so a second application undoes it. A closed loop of flux keeps Gauss's law, and this
//    is what lets a string move, bend and straighten between charges that do not move
// 3. role points: the reflection of matter-links, unchanged
// 4. hops (optional): a lone vibe v crosses from `from` to `to` with its role point carried by U, and the
//    flux along from -> to changes by -v, the move of string-graph, so Gauss's law holds and the string
//    trails behind the charge. The price is the matter term's change plus the tension's change
// 5. the demons stream
// Backward is the inverse stream, then every move in the reverse order.
//
// A change of role frame acts on U and the role points and leaves E, the vibes and the demons alone, and
// no step reads U and E together, so it commutes. There is no pair creation: love and fear are each kept.
// Switches for controls only: `gauss: false` hops without moving the flux (Gauss's law then breaks),
// `priceFlux: false` takes flux moves without paying the tension (the energy then leaks).

import {
  cellMatter,
  changeFrame,
  makeMatterLinks,
  pay,
  reflectLink,
  reflectRole,
  streamDemons,
  totalEnergy,
  type MatterLinks,
  type MatterState,
} from '@/code/rule/matter-links'

const DEGREE = 24

export type CenterLinks = {
  readonly matter: MatterLinks
  readonly tension: number
  readonly loops: boolean
  readonly gauss: boolean
  readonly priceFlux: boolean
}

export type CenterState = MatterState & {
  // flux[x * 24 + a] along x -> x + a, for first directions a only
  readonly flux: Int32Array
}

export type CenterMoves = { links: number; loops: number; roles: number; hops: number }

export type HopListener = (from: number, to: number, direction: number) => void

const mod3 = (x: number): number => ((x % 3) + 3) % 3

export function makeCenterLinks(input: {
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
}): CenterLinks {
  const matter = makeMatterLinks({
    side: input.side,
    kappa: input.kappa,
    capacity: input.capacity,
    hop: input.hop,
    roles: input.roles,
    transport: input.transport,
  })

  return {
    matter,
    tension: input.tension,
    loops: input.loops ?? true,
    gauss: input.gauss ?? true,
    priceFlux: input.priceFlux ?? true,
  }
}

// the stored slot of the undirected link (x, d), and the sign of d against the stored direction
function slotOf(matter: MatterLinks, x: number, d: number): [number, number] {
  const o = matter.opposite[d] ?? d

  return d < o ? [x * DEGREE + d, 1] : [(matter.neighbour[x * DEGREE + d] ?? 0) * DEGREE + o, -1]
}

// the flux along x -> x + d
export function fluxAlong(rule: CenterLinks, flux: Int32Array, x: number, d: number): number {
  const [slot, sign] = slotOf(rule.matter, x, d)

  return sign * (flux[slot] ?? 0)
}

// add `amount` of flux along x -> x + d
export function addFlux(rule: CenterLinks, flux: Int32Array, x: number, d: number, amount: number): void {
  const [slot, sign] = slotOf(rule.matter, x, d)

  flux[slot] = (flux[slot] ?? 0) + sign * amount
}

const cost = (rule: CenterLinks, e: number): number => (mod3(e) !== 0 ? rule.tension : 0)

// shift the flux round the triangle x -a-> -b-> -c-> x by one step: an involution
function loopMove(rule: CenterLinks, state: CenterState, x: number, a: number, type: number): boolean {
  const { matter } = rule
  const pairs = matter.staples[a] ?? []
  const [b, c] = pairs[type % pairs.length] ?? [0, 0]
  const y = matter.neighbour[x * DEGREE + a] ?? 0
  const z = matter.neighbour[y * DEGREE + b] ?? 0
  const legs: [number, number][] = [
    [x, a],
    [y, b],
    [z, c],
  ]
  const step = ((fluxAlong(rule, state.flux, x, a) % 2) + 2) % 2 === 0 ? 1 : -1

  let change = 0

  for (const [from, d] of legs) {
    const e = fluxAlong(rule, state.flux, from, d)

    change += cost(rule, e + step) - cost(rule, e)
  }

  if (!pay(matter, state, x * DEGREE + a, rule.priceFlux ? change : 0)) {
    return false
  }

  for (const [from, d] of legs) {
    addFlux(rule, state.flux, from, d, step)
  }

  return true
}

// a lone vibe crosses the link (x, a), its role point carried and its string trailing: an involution
function hop(rule: CenterLinks, state: CenterState, x: number, a: number, onHop?: HopListener): boolean {
  const { matter } = rule
  const y = matter.neighbour[x * DEGREE + a] ?? 0
  const vx = state.vibe[x] ?? 0
  const vy = state.vibe[y] ?? 0

  if ((vx === 0) === (vy === 0) || x === y) {
    return false
  }

  const [from, to, d] = vx !== 0 ? [x, y, a] : [y, x, matter.opposite[a] ?? a]
  const via = state.links[from * DEGREE + d] ?? 0
  const v = state.vibe[from] ?? 0
  const p = state.role[from] ?? 0
  const e = fluxAlong(rule, state.flux, from, d)
  const moved = rule.gauss ? e - v : e
  const before = cellMatter(matter, state, from)

  state.vibe[from] = 0
  state.role[from] = 0
  state.vibe[to] = v
  state.role[to] = matter.transport ? (matter.act[via * 9 + p] ?? 0) : p

  const after = cellMatter(matter, state, to)
  const tension = rule.priceFlux ? cost(rule, moved) - cost(rule, e) : 0

  if (!pay(matter, state, x * DEGREE + a, after - before + tension)) {
    state.vibe[to] = 0
    state.role[to] = 0
    state.vibe[from] = v
    state.role[from] = p

    return false
  }

  addFlux(rule, state.flux, from, d, moved - e)
  onHop?.(from, to, d)

  return true
}

function copy(state: CenterState): CenterState {
  return {
    vibe: Int8Array.from(state.vibe),
    role: Int8Array.from(state.role),
    links: Int16Array.from(state.links),
    demon: Int32Array.from(state.demon),
    flux: Int32Array.from(state.flux),
  }
}

export function centerBeat(rule: CenterLinks, input: CenterState, t: number, onHop?: HopListener): { state: CenterState; moved: CenterMoves } {
  const { matter } = rule
  const state = copy(input)
  const moved: CenterMoves = { links: 0, loops: 0, roles: 0, hops: 0 }

  matter.firsts.forEach((a, k) => {
    for (let x = 0; x < matter.cells; x++) {
      moved.links += reflectLink(matter, state, x, a, t + k) > 0 ? 1 : 0
    }
  })

  if (rule.loops) {
    matter.firsts.forEach((a, k) => {
      for (let x = 0; x < matter.cells; x++) {
        moved.loops += loopMove(rule, state, x, a, t + k) ? 1 : 0
      }
    })
  }

  for (let x = 0; x < (matter.roles ? matter.cells : 0); x++) {
    if (state.vibe[x] === 0) {
      continue
    }

    for (let d = 0; d < DEGREE; d++) {
      moved.roles += reflectRole(matter, state, x, d) ? 1 : 0
    }
  }

  if (matter.hop) {
    for (let x = 0; x < matter.cells; x++) {
      for (const a of matter.firsts) {
        moved.hops += hop(rule, state, x, a, onHop) ? 1 : 0
      }
    }
  }

  streamDemons(matter, state.demon, true)

  return { state, moved }
}

export function centerBeatBack(rule: CenterLinks, input: CenterState, t: number): CenterState {
  const { matter } = rule
  const state = copy(input)

  streamDemons(matter, state.demon, false)

  if (matter.hop) {
    for (let x = matter.cells - 1; x >= 0; x--) {
      for (let k = matter.firsts.length - 1; k >= 0; k--) {
        hop(rule, state, x, matter.firsts[k] ?? 0)
      }
    }
  }

  // no vibe moves during the role step, so the cells holding one now are the ones that held one then
  for (let x = matter.roles ? matter.cells - 1 : -1; x >= 0; x--) {
    if (state.vibe[x] === 0) {
      continue
    }

    for (let d = DEGREE - 1; d >= 0; d--) {
      reflectRole(matter, state, x, d)
    }
  }

  for (let k = rule.loops ? matter.firsts.length - 1 : -1; k >= 0; k--) {
    const a = matter.firsts[k] ?? 0

    for (let x = matter.cells - 1; x >= 0; x--) {
      loopMove(rule, state, x, a, t + k)
    }
  }

  for (let k = matter.firsts.length - 1; k >= 0; k--) {
    const a = matter.firsts[k] ?? 0

    for (let x = matter.cells - 1; x >= 0; x--) {
      reflectLink(matter, state, x, a, t + k)
    }
  }

  return state
}

// how many links carry a triality flux, E mod 3 not 0
export function stringLinks(rule: CenterLinks, flux: Int32Array): number {
  let count = 0

  for (let x = 0; x < rule.matter.cells; x++) {
    for (const a of rule.matter.firsts) {
      count += mod3(flux[x * DEGREE + a] ?? 0) !== 0 ? 1 : 0
    }
  }

  return count
}

export function centerEnergy(rule: CenterLinks, state: CenterState): number {
  return totalEnergy(rule.matter, state) + rule.tension * stringLinks(rule, state.flux)
}

// cells where the flux leaving minus the flux entering differs from the vibe
export function gaussViolations(rule: CenterLinks, state: CenterState): number {
  const { matter } = rule

  let violations = 0

  for (let x = 0; x < matter.cells; x++) {
    let divergence = 0

    for (const a of matter.firsts) {
      divergence += fluxAlong(rule, state.flux, x, a) + fluxAlong(rule, state.flux, x, matter.opposite[a] ?? a)
    }

    violations += divergence === state.vibe[x] ? 0 : 1
  }

  return violations
}

export function changeCenterFrame(rule: CenterLinks, state: CenterState, frame: ArrayLike<number>): CenterState {
  return { ...changeFrame(rule.matter, state, frame), flux: Int32Array.from(state.flux) }
}
