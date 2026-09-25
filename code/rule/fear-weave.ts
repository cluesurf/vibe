// The fear weave: the cube-root swap phase run inside the lattice, as a signed weight on role points.
//
// E-FRC-0127 ran the fear beat as a separate step on a standalone grid of 81 weights. This rule puts it
// inside the color weave's own dynamics (code/rule/color-weave), step 3 of the path in
// note/experiment/gauge/what-the-base-needs.
//
// The classical layer is the color weave, unchanged in what it does to vibes: the turning weave's
// schedule, the palindromic swap, the line table (the committed pair table by default, or the hop-free
// bind table), streaming along links. Each slot carries a TOKEN, the name of the role point it holds.
// Tokens move with their slot's contents exactly as the color weave moves role points: with the
// palindromic swap, with streaming, and, where two vibes meet on a line (both slots hold a vibe before
// the line table acts), by exchange.
//
// The quantum layer is a WHOLE: a set of open tokens and a signed integer weight on every joint point of
// their role grids, 9^k points for k tokens. It is the discrete Wigner function of the tokens' roles in
// whole units: loves are positive units, fears negative, love minus fear the whole's size N. Every
// classical step permutes joint points: a token streaming through link g has its coordinate moved by the
// grid move g, and the whole's loves and fears ride along unchanged. Tokens always move exactly as the
// color weave moves role points, exchange included, so the classical layer never depends on the whole.
// Where two OPEN tokens meet, their two coordinates are also moved by the Wigner kernel of the swap
// phase U(phi) = P_sym + e^(i phi) P_anti, taken on the slots,
//
//   n'(x, y) = sum over (x0, y0) of K(x, y; x0, y0) n(x0, y0),
//
// the one-third turn at phi = 2 pi / 3. Since the tokens have already been exchanged, the kernel applied
// to the tokens' coordinates is that of SWAP U(phi) = U(phi + pi) (meetingKernel). The swap phase fixes
// every joint point with x = y (the part where the two roles are alike) and spreads the rest over the
// points with the same sum x + y, with signs: this is where fear is made. At phi = pi, SWAP U(pi) = 1, so
// the rule with the fear beat switched off is the color weave exactly.
//
// K is in quarters at phi = 2 pi / 3 (E-FRC-0121). In the fixed mode the whole keeps its units and a beat
// that would need a fraction is refused, never rounded. In the grain mode the units are multiplied by 4
// when needed and reduced by the common factor after every step, so the units are always the fewest that
// write the whole exactly: the grain.
//
// Everything is a bijection. The backward beat unstreams (tokens back through the inverse links), then runs
// the backward collision, applying the kernel of U(phi)^dagger at the same meetings. Meetings in one beat
// touch disjoint pairs of tokens, so their order does not matter.
//
// What the whole leaves out, stated: only open tokens carry weight. Every other token holds one classical
// role point. A token outside the whole that meets an open one is exchanged with it, never entangled, so
// the whole stays closed. Positions stay classical: the fear beat acts on roles, never on where a vibe is. Letting every token be open is the same rule with every token in the whole, and
// its cost is measured in E-QTM-0099.

import { type ColorWeave } from '@/code/rule/color-weave'
import {
  BIND_MOVE_FORWARD,
  BIND_MOVE_INVERSE,
  PAIR_FORWARD,
  PAIR_INVERSE,
  TURN_POS_MIRROR,
  TURN_SWAP_ORDER,
} from '@/code/rule/collision'
import {
  adjointOperator,
  multiplyOperators,
  operator,
  phasePointOperators,
  type Operator,
} from '@/code/measure/grid-weights'

const SWAP_MIRROR = [...TURN_SWAP_ORDER, ...[...TURN_SWAP_ORDER].reverse()]
const NEIGHBOURS = new WeakMap<object, Int32Array>()

// the slot each slot streams into, computed once per mesh
function streamTarget(weave: ColorWeave): Int32Array {
  const known = NEIGHBOURS.get(weave.mesh)

  if (known) {
    return known
  }

  const table = new Int32Array(weave.mesh.cellCount * 24)

  for (let x = 0; x < weave.mesh.cellCount; x++) {
    for (let d = 0; d < 24; d++) {
      table[x * 24 + d] = weave.mesh.neighbour(x, d) * 24 + d
    }
  }

  NEIGHBOURS.set(weave.mesh, table)

  return table
}
const TABLE_KEY = (a: number, b: number): number => (a + 1) * 3 + (b + 1)

// the classical layer: a vibe and a token at every slot, and the classical role point of every token
export type Lattice = {
  readonly vibe: Int8Array
  readonly token: Int32Array
  readonly point: Int8Array
}

// what one beat did to the open tokens: the meetings between two of them, as [token on the line's
// first slot, token on its second], and the grid move each crossed
export type BeatRecord = {
  readonly meetings: readonly (readonly [number, number])[]
  readonly crossings: readonly (readonly [number, number])[]
}

// the lattice at rest: every token named by the slot it starts on, at the given role points
export function makeLattice(input: {
  vibe: Int8Array
  point: Int8Array
}): Lattice {
  return {
    vibe: Int8Array.from(input.vibe),
    token: Int32Array.from({ length: input.vibe.length }, (_, i) => i),
    point: Int8Array.from(input.point),
  }
}

function collideCell(input: {
  weave: ColorWeave
  vibe: Int8Array
  token: Int32Array
  open: Uint8Array
  base: number
  t: number
  forward: boolean
  meetings: [number, number][]
}): void {
  const { weave, vibe, token, open, base, t, forward, meetings } = input
  const table =
    weave.table === 'bind'
      ? forward
        ? BIND_MOVE_FORWARD
        : BIND_MOVE_INVERSE
      : forward
        ? PAIR_FORWARD
        : PAIR_INVERSE
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
          const r = token[i] ?? 0

          vibe[i] = vibe[j] ?? 0
          token[i] = token[j] ?? 0
          vibe[j] = v
          token[j] = r
        }
      }
    }

    const clock = (): void => {
      const i = base + wire[0]
      const j = base + wire[1]
      const a = vibe[i] ?? 0
      const b = vibe[j] ?? 0
      const image = table[TABLE_KEY(a, b)] ?? [a, b]
      const before = forward ? [a, b] : (preimage[TABLE_KEY(a, b)] ?? [a, b])

      vibe[i] = image[0]
      vibe[j] = image[1]

      if (before[0] !== 0 && before[1] !== 0) {
        const ti = token[i] ?? 0
        const tj = token[j] ?? 0

        if (open[ti] === 1 && open[tj] === 1) {
          meetings.push([ti, tj])
        }

        token[i] = tj
        token[j] = ti
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

// one beat forward of the classical layer, and what it did to the open tokens
export function fearBeat(input: {
  weave: ColorWeave
  links: Int16Array
  lattice: Lattice
  open: Uint8Array
  t: number
}): { lattice: Lattice; record: BeatRecord } {
  const { weave, links, lattice, open, t } = input
  const { mesh, moves } = weave
  const vibe = Int8Array.from(lattice.vibe)
  const token = Int32Array.from(lattice.token)
  const point = Int8Array.from(lattice.point)
  const meetings: [number, number][] = []

  for (let x = 0; x < mesh.cellCount; x++) {
    collideCell({ weave, vibe, token, open, base: x * 24, t, forward: true, meetings })
  }

  const moved = new Int32Array(token.length)
  const crossings: [number, number][] = []
  const target = streamTarget(weave)
  const streamed = new Int8Array(vibe.length)

  for (let x = 0; x < mesh.cellCount; x++) {
    for (let d = 0; d < 24; d++) {
      const slot = x * 24 + d
      const tk = token[slot] ?? 0
      const g = links[slot] ?? moves.identity

      moved[target[slot] ?? 0] = tk
      streamed[target[slot] ?? 0] = vibe[slot] ?? 0

      if (open[tk] === 1) {
        crossings.push([tk, g])
      } else {
        point[tk] = moves.act[g]?.[point[tk] ?? 0] ?? 0
      }
    }
  }

  return {
    lattice: { vibe: streamed, token: moved, point },
    record: { meetings, crossings },
  }
}

// one beat backward: the exact inverse of fearBeat at beat t
export function fearBeatBack(input: {
  weave: ColorWeave
  links: Int16Array
  lattice: Lattice
  open: Uint8Array
  t: number
}): { lattice: Lattice; record: BeatRecord } {
  const { weave, links, lattice, open, t } = input
  const { mesh, moves } = weave
  const vibe = new Int8Array(lattice.vibe.length)
  const token = new Int32Array(lattice.token.length)
  const point = Int8Array.from(lattice.point)
  const crossings: [number, number][] = []
  const target = streamTarget(weave)

  for (let x = 0; x < mesh.cellCount; x++) {
    for (let d = 0; d < 24; d++) {
      const slot = x * 24 + d
      const from = target[slot] ?? 0
      const tk = lattice.token[from] ?? 0
      const g = moves.inverse[links[slot] ?? moves.identity] ?? moves.identity

      token[slot] = tk
      vibe[slot] = lattice.vibe[from] ?? 0

      if (open[tk] === 1) {
        crossings.push([tk, g])
      } else {
        point[tk] = moves.act[g]?.[point[tk] ?? 0] ?? 0
      }
    }
  }

  const meetings: [number, number][] = []

  for (let x = 0; x < mesh.cellCount; x++) {
    collideCell({ weave, vibe, token, open, base: x * 24, t, forward: false, meetings })
  }

  return { lattice: { vibe, token, point }, record: { meetings, crossings } }
}

// the whole: open tokens (coordinate order, most significant first) and loves minus fears at each of
// their 9^k joint role points
export type Whole = {
  readonly tokens: readonly number[]
  readonly weight: readonly bigint[]
}

export function wholeUnits(whole: Whole): bigint {
  return whole.weight.reduce((a, b) => a + b, 0n)
}

export function wholeLovesAndFears(whole: Whole): { loves: bigint; fears: bigint } {
  let loves = 0n
  let fears = 0n

  for (const w of whole.weight) {
    if (w > 0n) {
      loves += w
    } else {
      fears -= w
    }
  }

  return { loves, fears }
}

function gcd(a: bigint, b: bigint): bigint {
  let x = a < 0n ? -a : a
  let y = b < 0n ? -b : b

  while (y > 0n) {
    ;[x, y] = [y, x % y]
  }

  return x
}

// divide out the common factor, so the units are the fewest that write the whole exactly
export function reduceWhole(whole: Whole): Whole {
  const g = whole.weight.reduce((a, b) => gcd(a, b), 0n)

  return g > 1n ? { tokens: whole.tokens, weight: whole.weight.map(w => w / g) } : whole
}

// move one coordinate of the whole by a permutation of the 9 grid points
export function moveCoordinate(whole: Whole, coordinate: number, perm: ArrayLike<number>): Whole {
  const k = whole.tokens.length
  const stride = 9 ** (k - 1 - coordinate)
  const out = new Array<bigint>(whole.weight.length).fill(0n)

  for (let i = 0; i < whole.weight.length; i++) {
    const c = Math.floor(i / stride) % 9
    const j = i + ((perm[c] ?? c) - c) * stride

    out[j] = whole.weight[i] ?? 0n
  }

  return { tokens: whole.tokens, weight: out }
}

// move two coordinates of the whole by a kernel on their 81 joint points, given as 4 K in whole numbers.
// fixed: keep the units and return null where a fraction would be needed. Otherwise multiply the units
// by 4 and reduce.
export function meetWhole(input: {
  whole: Whole
  a: number
  b: number
  kernel4: readonly (readonly number[])[]
  fixed: boolean
}): Whole | null {
  const { whole, a, b, kernel4, fixed } = input
  const k = whole.tokens.length
  const sa = 9 ** (k - 1 - a)
  const sb = 9 ** (k - 1 - b)
  const out = new Array<bigint>(whole.weight.length).fill(0n)
  const column: bigint[] = new Array<bigint>(81).fill(0n)
  const k4 = kernel4.map(row => row.map(x => BigInt(x)))

  for (let i = 0; i < whole.weight.length; i++) {
    if (Math.floor(i / sa) % 9 !== 0 || Math.floor(i / sb) % 9 !== 0) {
      continue
    }

    let any = false

    for (let x = 0; x < 9; x++) {
      for (let y = 0; y < 9; y++) {
        const w = whole.weight[i + x * sa + y * sb] ?? 0n

        column[x * 9 + y] = w
        any = any || w !== 0n
      }
    }

    if (!any) {
      continue
    }

    for (let r = 0; r < 81; r++) {
      let m = 0n
      const row = k4[r] ?? []

      for (let c = 0; c < 81; c++) {
        const kv = row[c] ?? 0n

        if (kv !== 0n) {
          m += kv * (column[c] ?? 0n)
        }
      }

      if (fixed) {
        if (m % 4n !== 0n) {
          return null
        }

        m /= 4n
      }

      out[i + Math.floor(r / 9) * sa + (r % 9) * sb] = m
    }
  }

  const next = { tokens: whole.tokens, weight: out }

  return fixed ? next : reduceWhole(next)
}

// apply one beat's record to the whole: meetings then crossings going forward, crossings then meetings
// going back (the record of fearBeatBack already lists them in that beat's backward order)
export function advanceWhole(input: {
  weave: ColorWeave
  whole: Whole
  record: BeatRecord
  kernel4: readonly (readonly number[])[]
  fixed: boolean
  forward: boolean
}): Whole | null {
  const { weave, record, kernel4, fixed, forward } = input
  const coordinate = new Map(input.whole.tokens.map((t, i) => [t, i]))

  let whole: Whole | null = input.whole

  const meet = (): void => {
    for (const [ta, tb] of record.meetings) {
      if (!whole) {
        return
      }

      whole = meetWhole({ whole, a: coordinate.get(ta) ?? 0, b: coordinate.get(tb) ?? 0, kernel4, fixed })
    }
  }

  const cross = (): void => {
    for (const [tk, g] of record.crossings) {
      if (!whole) {
        return
      }

      const c = coordinate.get(tk)

      if (c !== undefined && g !== weave.moves.identity) {
        whole = moveCoordinate(whole, c, weave.moves.act[g] ?? [])
      }
    }
  }

  if (forward) {
    meet()
    cross()
  } else {
    cross()
    meet()
  }

  return whole
}

// the swap phase U(phi) = P_sym + e^(i phi) P_anti on two roles, index 3 i + j
export function swapPhase(phi: number): Operator {
  const u = operator(9)
  const c = Math.cos(phi)
  const s = Math.sin(phi)

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const row = 3 * i + j
      const swapped = 3 * j + i

      u.re[row * 9 + row] = (u.re[row * 9 + row] ?? 0) + (1 + c) / 2
      u.im[row * 9 + row] = (u.im[row * 9 + row] ?? 0) + s / 2
      u.re[row * 9 + swapped] = (u.re[row * 9 + swapped] ?? 0) + (1 - c) / 2
      u.im[row * 9 + swapped] = (u.im[row * 9 + swapped] ?? 0) - s / 2
    }
  }

  return u
}

let POINTS: Operator[] | undefined

export function twoRolePoints(): Operator[] {
  POINTS = POINTS ?? phasePointOperators(2)

  return POINTS
}

// K(x, y) = Tr(A(x) U A(y) U^dagger) / 9 on the 81 points of two roles, real for a unitary
export function wignerKernel(u: Operator): number[][] {
  const points = twoRolePoints()
  const ud = adjointOperator(u)
  const moved = points.map(a => multiplyOperators(multiplyOperators(u, a), ud))

  return points.map(ax =>
    moved.map(m => {
      let re = 0

      for (let i = 0; i < 9; i++) {
        for (let k = 0; k < 9; k++) {
          re +=
            (ax.re[i * 9 + k] ?? 0) * (m.re[k * 9 + i] ?? 0) -
            (ax.im[i * 9 + k] ?? 0) * (m.im[k * 9 + i] ?? 0)
        }
      }

      return re / 9
    }),
  )
}

// the exchange of two roles as an operator, index 3 i + j
export function exchangeOperator(): Operator {
  const s = operator(9)

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      s.re[(3 * j + i) * 9 + (3 * i + j)] = 1
    }
  }

  return s
}

// the kernel a meeting applies to the two tokens' coordinates for a two-role step u on the slots: the
// tokens have been exchanged, so it is the kernel of SWAP u, as 4 K, or null when not in quarters
export function meetingKernel(u: Operator): number[][] | null {
  return quarterKernel(multiplyOperators(exchangeOperator(), u))
}

// 4 K in whole numbers, or null when K is not in quarters
export function quarterKernel(u: Operator): number[][] | null {
  const k = wignerKernel(u)
  const k4 = k.map(row => row.map(x => Math.round(4 * x)))
  const exact = k.every((row, r) => row.every((x, c) => Math.abs(4 * x - (k4[r]?.[c] ?? 0)) < 1e-9))

  return exact ? k4 : null
}
