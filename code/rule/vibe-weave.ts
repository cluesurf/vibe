// The vibe weave: the pieces of note/experiment/gauge/what-the-base-needs run as one rule.
//
// Each of the 24 slots of a cell holds a vibe (fear, calm, love as -1, 0, +1) and a role point, one
// of the 9 points of the role grid (role and tilt). Each directed link (x, d) holds a grid move, one of
// the 216 affine maps of Z3^2 with determinant one, and a flow: the net vibe that has left x through
// direction d. A beat:
// - collide: where both slots of a line carry a vibe, their role points swap (two vibes meeting
//   head-on), then the committed collision acts on the vibes
// - stream: every slot moves one link along its direction, its role point is moved by that link's
//   grid move, and the vibe it carries is added to that link's flow
// Every step is a bijection, and the backward beat undoes it exactly: unstream (taking the vibe back
// off the flow, the role point back through the inverse move), then the backward collision, then the
// same swap.
//
// Conserved by construction: love minus fear in all (the committed rule), and Gauss's law at every
// cell, the change in its love minus fear equal to the flow arriving minus the flow leaving, since a
// collision never changes a cell's total and a stream moves a vibe across exactly one link. A change
// of role frame, one grid move per cell with the links changed to match, touches neither vibes nor
// flows. The flow's value mod 3 is the triality flux, color's center carried across a link.

import { Mesh } from '@/code/tool/mesh'
import { Collision, turningWeave } from '@/code/rule/collision'
import { collide, stream, streamInverse } from '@/code/rule/lattice-gas'
import { d4BoxMesh } from '@/code/substrate/d4-box-integer'

const mod3 = (x: number): number => ((x % 3) + 3) % 3

// The start of the grid moves: an integer Weyl sequence. Link slot i = 24 x + d gets
// w = (i + 1) * 40503 mod 2^16, and the move with index floor(w * count / 2^16), an exact shift. 40503 is
// the odd integer nearest 2^16 / phi (Fibonacci hashing), so w visits all 2^16 residues before repeating
// and consecutive slots spread like the golden Weyl sequence, with no real number (E-MTH-0027, replacing
// the golden-ratio start of 2026-09-24).
export const LINK_START_RATE = 40503

// The start family (E-MTH-0028): member k adds the phase k * 27145 mod 2^16 to every slot's w, 27145 the odd
// integer nearest 2^16 (sqrt 2 - 1) = 27145.9 (the silver Weyl rate), so the members' phases spread over the
// period with no real number. Member 0 is the committed start, exactly as above.
export const LINK_START_OFFSET_RATE = 27145

export function linkStart(slot: number, count: number, offset = 0): number {
  const w = (Math.imul(slot + 1, LINK_START_RATE) + Math.imul(offset, LINK_START_OFFSET_RATE)) & 0xffff

  return (w * count) >>> 16
}

// the start a weave is built with when its caller names none: one move index per link slot
export type LinkStartOf = (slot: number, count: number) => number

const COMMITTED_START: LinkStartOf = (slot, count) => linkStart(slot, count)
let defaultStart: LinkStartOf = COMMITTED_START

// Replace the start every later makeVibeWeave uses when its caller names none, and return the one it replaced.
// No argument restores the committed start. This is the measurement's handle (E-MTH-0028 reruns whole
// experiments over a family of starts without editing them); the rule itself never calls it.
export function useLinkStart(start?: LinkStartOf): LinkStartOf {
  const previous = defaultStart

  defaultStart = start ?? COMMITTED_START

  return previous
}

export type GridMoves = {
  // act[g][p] is the image of point p = x + 3 y under move g
  readonly act: readonly Int8Array[]
  readonly inverse: readonly number[]
  readonly compose: (g: number, h: number) => number
  readonly identity: number
}

// the 216 grid moves, the affine maps of Z3^2 with determinant one
export function gridMoves(): GridMoves {
  const act: Int8Array[] = []

  for (let m = 0; m < 81; m++) {
    const [a, b, c, d] = [0, 1, 2, 3].map(
      k => Math.floor(m / 3 ** k) % 3,
    ) as [number, number, number, number]

    if (mod3(a * d - b * c) !== 1) {
      continue
    }

    for (let s = 0; s < 9; s++) {
      const table = new Int8Array(9)

      for (let p = 0; p < 9; p++) {
        const x = p % 3
        const y = Math.floor(p / 3)

        table[p] =
          mod3(a * x + b * y + (s % 3)) +
          3 * mod3(c * x + d * y + Math.floor(s / 3))
      }

      act.push(table)
    }
  }

  const key = (table: Int8Array): string => table.join('')
  const index = new Map(act.map((table, i) => [key(table), i]))

  const compose = (g: number, h: number): number => {
    const table = new Int8Array(9)

    for (let p = 0; p < 9; p++) {
      table[p] = act[g]?.[act[h]?.[p] ?? 0] ?? 0
    }

    return index.get(key(table)) ?? -1
  }

  const identity = index.get('012345678') ?? 0
  const inverse = act.map((_, g) =>
    act.findIndex((__, h) => compose(g, h) === identity),
  )

  return { act, inverse, compose, identity }
}

export type VibeWeave = {
  readonly mesh: Mesh
  readonly opposite: readonly number[]
  readonly lines: readonly (readonly [number, number])[]
  readonly moves: GridMoves
  // the grid move on each directed link, a link and its reverse inverse to each other
  readonly links: Int16Array
  readonly forward: (t: number) => Collision
  readonly backward: (t: number) => Collision
}

export type VibeState = {
  readonly vibe: Int8Array
  readonly role: Int8Array
  // net vibe that has left each cell through each direction, as a whole number
  readonly flow: Int32Array
}

export function makeVibeWeave(input: { side: number; start?: LinkStartOf }): VibeWeave {
  const startOf = input.start ?? defaultStart
  const mesh = d4BoxMesh({ side: input.side })
  const opposite = Array.from({ length: 24 }, (_, d) =>
    mesh.opposite(d),
  )
  const moves = gridMoves()
  const slots = mesh.cellCount * 24
  const lines: [number, number][] = []

  for (let d = 0; d < 24; d++) {
    if (d < (opposite[d] ?? d)) {
      lines.push([d, opposite[d] ?? d])
    }
  }

  const links = new Int16Array(slots).fill(-1)

  for (let x = 0; x < mesh.cellCount; x++) {
    for (let d = 0; d < 24; d++) {
      if ((links[x * 24 + d] ?? -1) >= 0) {
        continue
      }

      const g = startOf(x * 24 + d, moves.act.length)
      const y = mesh.neighbour(x, d)

      links[x * 24 + d] = g
      links[y * 24 + (opposite[d] ?? d)] =
        moves.inverse[g] ?? moves.identity
    }
  }

  return {
    mesh,
    opposite,
    lines,
    moves,
    links,
    forward: turningWeave({ opposite }),
    backward: turningWeave({ opposite, forward: false }),
  }
}

function swapMeeting(
  weave: VibeWeave,
  vibe: Int8Array,
  role: Int8Array,
): void {
  for (let x = 0; x < weave.mesh.cellCount; x++) {
    for (const [a, b] of weave.lines) {
      if (vibe[x * 24 + a] !== 0 && vibe[x * 24 + b] !== 0) {
        const t = role[x * 24 + a] ?? 0

        role[x * 24 + a] = role[x * 24 + b] ?? 0
        role[x * 24 + b] = t
      }
    }
  }
}

export function vibeBeat(
  weave: VibeWeave,
  state: VibeState,
  t: number,
): VibeState {
  const { mesh, moves, links } = weave
  const vibe = { mesh, data: Int8Array.from(state.vibe) }
  const role = Int8Array.from(state.role)
  const flow = Int32Array.from(state.flow)

  swapMeeting(weave, vibe.data, role)
  collide(vibe, weave.forward(t))

  const moved = new Int8Array(role.length)

  for (let x = 0; x < mesh.cellCount; x++) {
    for (let d = 0; d < 24; d++) {
      const y = mesh.neighbour(x, d)
      const slot = x * 24 + d

      moved[y * 24 + d] =
        moves.act[links[slot] ?? moves.identity]?.[role[slot] ?? 0] ?? 0
      flow[slot] = (flow[slot] ?? 0) + (vibe.data[slot] ?? 0)
    }
  }

  return { vibe: stream(vibe).data, role: moved, flow }
}

export function vibeBeatBack(
  weave: VibeWeave,
  state: VibeState,
  t: number,
): VibeState {
  const { mesh, moves, links, opposite } = weave
  const back = streamInverse({ mesh, data: Int8Array.from(state.vibe) })
  const role = new Int8Array(state.role.length)
  const flow = Int32Array.from(state.flow)

  for (let y = 0; y < mesh.cellCount; y++) {
    for (let d = 0; d < 24; d++) {
      const x = mesh.neighbour(y, opposite[d] ?? d)
      const slot = x * 24 + d

      role[slot] =
        moves.act[
          moves.inverse[links[slot] ?? moves.identity] ?? moves.identity
        ]?.[state.role[y * 24 + d] ?? 0] ?? 0
      flow[slot] = (flow[slot] ?? 0) - (back.data[slot] ?? 0)
    }
  }

  collide(back, weave.backward(t))
  swapMeeting(weave, back.data, role)

  return { vibe: back.data, role, flow }
}

// Gauss's law at every cell: love minus fear now, minus at the start, equals flow in minus flow out
export function gaussHolds(
  weave: VibeWeave,
  start: VibeState,
  now: VibeState,
): boolean {
  const { mesh, opposite } = weave

  for (let x = 0; x < mesh.cellCount; x++) {
    let charge = 0
    let initial = 0
    let net = 0

    for (let d = 0; d < 24; d++) {
      charge += now.vibe[x * 24 + d] ?? 0
      initial += start.vibe[x * 24 + d] ?? 0
      net -= now.flow[x * 24 + d] ?? 0

      const from = mesh.neighbour(x, opposite[d] ?? d)

      net += now.flow[from * 24 + d] ?? 0
    }

    if (charge - initial !== net) {
      return false
    }
  }

  return true
}

// how many undirected links carry a triality flux, net flow across them not a multiple of 3
export function fluxLinks(weave: VibeWeave, state: VibeState): number {
  const { mesh, opposite } = weave

  let count = 0

  for (let x = 0; x < mesh.cellCount; x++) {
    for (let d = 0; d < 24; d++) {
      if (d > (opposite[d] ?? d)) {
        continue
      }

      const y = mesh.neighbour(x, d)
      const net =
        (state.flow[x * 24 + d] ?? 0) -
        (state.flow[y * 24 + (opposite[d] ?? d)] ?? 0)

      count += mod3(net) === 0 ? 0 : 1
    }
  }

  return count
}
