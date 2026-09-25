// The color weave: the vibe weave with color charge as an exact local law.
//
// The three trits of a slot are its vibe (fear, calm, love), and its role point on the 3 x 3 grid (role
// and tilt). The vibe weave (code/rule/vibe-weave) left one seam: a pair made from calm took whatever role
// points its two calm slots held, so color appeared from nothing (3,550 of 3,888 creations, E-FRC-0123).
// The exhaustive search behind E-FRC-0124 found the only way to close it that keeps every frame change a
// symmetry: a calm slot's role point is itself color, signed by the side of its line (plus on the line's
// first slot, minus on its second). It is the color field. Then the color content of a cell,
//
//   Q = sum over its 24 slots of w * p,   w = the vibe, or the side sign for a calm slot,
//
// with its weight W = sum of w, is conserved by the collision, exactly, if and only if the line table has
// no hop (a lone charge jumping to the other slot of its line). So this rule runs the turning weave's
// schedule with the hop removed from the wire table (the bind-and-move table: like signs inert, a lone
// charge left in place, calm makes a pair, the pair flips, then annihilates), and moves each role point
// with its slot:
// - the palindromic swap trades two lines of a couple slot for slot, first slot to first slot, so each
//   role point moves with its vibe and keeps its side
// - on a wire, where both slots hold a vibe before the table acts, the two role points swap (two vibes
//   meeting head-on exchange color). Run backward, the swap applies where both slots held a vibe before
//   the forward step, which makes the step its own exact inverse
// Streaming and the links are the vibe weave's. Passing the committed pair table instead (hop kept) is the
// control: the same code then fails to conserve Q.

import {
  BIND_MOVE_FORWARD,
  BIND_MOVE_INVERSE,
  G_TURN,
  PAIR_FORWARD,
  PAIR_INVERSE,
  TURN_COUPLES_ZERO,
  TURN_POS_MIRROR,
  TURN_SWAP_ORDER,
} from '@/code/rule/collision'
import { stream, streamInverse } from '@/code/rule/lattice-gas'
import { type VibeState, type VibeWeave, makeVibeWeave } from '@/code/rule/vibe-weave'

export type LineTable = 'bind' | 'pair'

export type ColorWeave = VibeWeave & {
  readonly table: LineTable
  // +1 for the first slot of its line, -1 for the second: the sign of a calm slot's color
  readonly side: readonly number[]
  // the couples at each of the four schedule positions, as pairs of line indices
  readonly positions: readonly (readonly (readonly [number, number])[])[]
}

const mod3 = (x: number): number => ((x % 3) + 3) % 3
const key = (a: number, b: number): number => (a + 1) * 3 + (b + 1)
const SWAP_MIRROR = [...TURN_SWAP_ORDER, ...[...TURN_SWAP_ORDER].reverse()]

export function makeColorWeave(input: { side: number; table?: LineTable }): ColorWeave {
  const weave = makeVibeWeave({ side: input.side })
  const side = Array.from({ length: 24 }, (_, d) => (d < (weave.opposite[d] ?? d) ? 1 : -1))
  const norm = (a: number, b: number): [number, number] => (a < b ? [a, b] : [b, a])
  const positions: [number, number][][] = []

  let current = TURN_COUPLES_ZERO.map(([a, b]) => norm(a, b))

  for (let i = 0; i < 4; i++) {
    positions.push(current)
    current = current.map(([a, b]) => norm(G_TURN[a] ?? a, G_TURN[b] ?? b))
  }

  return { ...weave, table: input.table ?? 'bind', side, positions }
}

// one cell's collision on vibes and role points together, forward or its exact inverse
function collideCell(input: {
  weave: ColorWeave
  vibe: Int8Array
  role: Int8Array
  base: number
  t: number
  forward: boolean
}): void {
  const { weave, vibe, role, base, t, forward } = input
  const table = weave.table === 'bind' ? (forward ? BIND_MOVE_FORWARD : BIND_MOVE_INVERSE) : forward ? PAIR_FORWARD : PAIR_INVERSE
  const preimage = weave.table === 'bind' ? BIND_MOVE_INVERSE : PAIR_INVERSE
  const couples = weave.positions[TURN_POS_MIRROR[((t % 8) + 8) % 8] ?? 0] ?? []
  const swapIndex = SWAP_MIRROR[((t % 12) + 12) % 12] ?? 0

  for (let k = 0; k < 6; k++) {
    const line = weave.lines[couples[k]?.[0] ?? 0] ?? [0, 0]
    const wire = weave.lines[couples[k]?.[1] ?? 0] ?? [0, 0]

    const swap = (): void => {
      const a0 = vibe[base + line[0]] ?? 0
      const a1 = vibe[base + line[1]] ?? 0
      const w0 = vibe[base + wire[0]] ?? 0
      const w1 = vibe[base + wire[1]] ?? 0
      const loneAway = (a: number, b: number): boolean => a === 0 && b !== 0
      const empty = (a: number, b: number): boolean => a === 0 && b === 0

      if ((loneAway(a0, a1) && empty(w0, w1)) || (loneAway(w0, w1) && empty(a0, a1))) {
        for (const s of [0, 1] as const) {
          const i = base + line[s]
          const j = base + wire[s]
          const v = vibe[i] ?? 0
          const r = role[i] ?? 0

          vibe[i] = vibe[j] ?? 0
          role[i] = role[j] ?? 0
          vibe[j] = v
          role[j] = r
        }
      }
    }

    const clock = (): void => {
      const i = base + wire[0]
      const j = base + wire[1]
      const a = vibe[i] ?? 0
      const b = vibe[j] ?? 0
      const image = table[key(a, b)] ?? [a, b]
      // the forward step's input: the state itself going forward, its preimage going backward
      const before = forward ? [a, b] : (preimage[key(a, b)] ?? [a, b])

      vibe[i] = image[0]
      vibe[j] = image[1]

      if (before[0] !== 0 && before[1] !== 0) {
        const r = role[i] ?? 0

        role[i] = role[j] ?? 0
        role[j] = r
      }
    }

    if (k === swapIndex) {
      swap()
      clock()
      swap()
    } else {
      clock()
    }
  }
}

export function colorBeat(weave: ColorWeave, state: VibeState, t: number): VibeState {
  const { mesh, moves, links } = weave
  const vibe = Int8Array.from(state.vibe)
  const role = Int8Array.from(state.role)
  const flow = Int32Array.from(state.flow)

  for (let x = 0; x < mesh.cellCount; x++) {
    collideCell({ weave, vibe, role, base: x * 24, t, forward: true })
  }

  const moved = new Int8Array(role.length)

  for (let x = 0; x < mesh.cellCount; x++) {
    for (let d = 0; d < 24; d++) {
      const slot = x * 24 + d

      moved[mesh.neighbour(x, d) * 24 + d] = moves.act[links[slot] ?? moves.identity]?.[role[slot] ?? 0] ?? 0
      flow[slot] = (flow[slot] ?? 0) + (vibe[slot] ?? 0)
    }
  }

  return { vibe: stream({ mesh, data: vibe }).data, role: moved, flow }
}

export function colorBeatBack(weave: ColorWeave, state: VibeState, t: number): VibeState {
  const { mesh, moves, links, opposite } = weave
  const vibe = streamInverse({ mesh, data: Int8Array.from(state.vibe) }).data
  const role = new Int8Array(state.role.length)
  const flow = Int32Array.from(state.flow)

  for (let y = 0; y < mesh.cellCount; y++) {
    for (let d = 0; d < 24; d++) {
      const x = mesh.neighbour(y, opposite[d] ?? d)
      const slot = x * 24 + d

      role[slot] = moves.act[moves.inverse[links[slot] ?? moves.identity] ?? moves.identity]?.[state.role[y * 24 + d] ?? 0] ?? 0
      flow[slot] = (flow[slot] ?? 0) - (vibe[slot] ?? 0)
    }
  }

  for (let x = 0; x < mesh.cellCount; x++) {
    collideCell({ weave, vibe, role, base: x * 24, t, forward: false })
  }

  return { vibe, role, flow }
}

// a cell's color content: [weight, x, y], each mod 3, with w the vibe or, on a calm slot, its side sign
export function cellColor(weave: ColorWeave, vibe: Int8Array, role: Int8Array, x: number): [number, number, number] {
  let w = 0
  let qx = 0
  let qy = 0

  for (let d = 0; d < 24; d++) {
    const v = vibe[x * 24 + d] ?? 0
    const weight = v !== 0 ? v : (weave.side[d] ?? 1)
    const p = role[x * 24 + d] ?? 0

    w += weight
    qx += weight * (p % 3)
    qy += weight * Math.floor(p / 3)
  }

  return [mod3(w), mod3(qx), mod3(qy)]
}

// how many cells the collision alone changes the color content of, at beat t
export function colorLeaks(weave: ColorWeave, state: VibeState, t: number): number {
  const vibe = Int8Array.from(state.vibe)
  const role = Int8Array.from(state.role)

  let leaks = 0

  for (let x = 0; x < weave.mesh.cellCount; x++) {
    const before = cellColor(weave, vibe, role, x)

    collideCell({ weave, vibe, role, base: x * 24, t, forward: true })

    const after = cellColor(weave, vibe, role, x)

    leaks += before.every((c, i) => c === after[i]) ? 0 : 1
  }

  return leaks
}
