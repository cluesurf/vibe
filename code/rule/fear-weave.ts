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
// The color mode (advanceWhole's color input, fearKernels), the three-trit color law adopted after
// E-QTM-0102: where a love meets a fear the one-third turn is the singlet phase 1 + (omega - 1) P_Phi instead,
// with the fear's conjugate role stored at the reflected point, which keeps love minus fear of the two role
// points in every configuration. Like meetings keep the swap phase. The grain is then 2^a 3^b.
//
// K is in quarters at phi = 2 pi / 3 (E-FRC-0121). In the fixed mode the whole keeps its units and a beat
// that would need a fraction is refused, never rounded. In the grain mode the units are multiplied by 4
// when needed and reduced by the common factor after every step, so the units are always the fewest that
// write the whole exactly: the grain.
//
// Everything is a bijection. The backward beat unstreams (tokens back through the inverse links), then runs
// the backward collision, applying the meeting kernel of U(phi)^dagger (SWAP U(-phi)) at the same
// meetings. Meetings in one beat touch disjoint pairs of tokens, so their order does not matter.
//
// What the whole leaves out, stated: only open tokens carry weight. Every other token holds one classical
// role point. A token outside the whole that meets an open one is exchanged with it, never entangled, so
// the whole stays closed. Letting every token be open is the same rule with every token in the whole, and
// its cost is measured in E-QTM-0099. Positions stay classical: the fear beat acts on roles, never on where
// a vibe is.

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
  // the two vibes of each meeting before the line table acts, love +1 or fear -1, in meeting order
  readonly signs?: readonly (readonly [number, number])[]
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

// A knit: the dock's collision schedule, apart from the turn. Which couples act on beat t, which couple
// swaps, the wire table, when the palindromic swap fires, and how tokens (role points) move at a wire:
// 'meeting' exchanges them wherever both slots held a vibe (the color weave), 'first-sign' wherever the
// first slot's weight changes sign, a calm first slot counting +1 (code/rule/color-local-weave, whose
// knits keep like pairs in place).
export type Knit = {
  readonly lines: readonly (readonly [number, number])[]
  readonly positions: readonly (readonly (readonly [number, number])[])[]
  readonly positionAt: readonly number[]
  readonly swapAt: readonly number[]
  readonly forward: readonly (readonly [number, number])[]
  readonly inverse: readonly (readonly [number, number])[]
  // fires[lineKey * 9 + wireKey], symmetrized, on the state keys of the two lines
  readonly fires: Uint8Array
  readonly exchange: 'meeting' | 'first-sign'
}

const at = (list: readonly number[], t: number): number => list[((t % list.length) + list.length) % list.length] ?? 0

// the color weave's knit: the committed turning schedule, the weave's table, exchange at meetings
export function colorWeaveKnit(weave: ColorWeave): Knit {
  const fires = new Uint8Array(81)
  const lone = (k: number): boolean => Math.floor(k / 3) === 1 && k % 3 !== 1
  const empty = (k: number): boolean => k === 4

  for (let l = 0; l < 9; l++) {
    for (let w = 0; w < 9; w++) {
      fires[l * 9 + w] = (lone(l) && empty(w)) || (lone(w) && empty(l)) ? 1 : 0
    }
  }

  return {
    lines: weave.lines,
    positions: weave.positions,
    positionAt: TURN_POS_MIRROR,
    swapAt: SWAP_MIRROR,
    forward: weave.table === 'bind' ? BIND_MOVE_FORWARD : PAIR_FORWARD,
    inverse: weave.table === 'bind' ? BIND_MOVE_INVERSE : PAIR_INVERSE,
    fires,
    exchange: 'meeting',
  }
}

// a knit from a color-local spec with one wire table (code/rule/color-local-weave): its couples turned
// by its turn, its schedule, its swap condition, and its 'first-sign' exchange. The positions are built
// as that module builds them, the couples sorted after every turn
export function colorLocalKnit(input: {
  opposite: readonly number[]
  couplesZero: readonly (readonly [number, number])[]
  turn: readonly number[]
  positionAt: readonly number[]
  swapAt: readonly number[]
  table: readonly (readonly [number, number])[]
  swapWhen: (line: number, wire: number) => boolean
}): Knit {
  const lines: [number, number][] = []

  for (let d = 0; d < input.opposite.length; d++) {
    const o = input.opposite[d] ?? d

    if (d < o) {
      lines.push([d, o])
    }
  }

  const norm = (a: number, b: number): readonly [number, number] => (a < b ? [a, b] : [b, a])
  const positions: (readonly [number, number])[][] = []
  let current = input.couplesZero.map(([a, b]) => norm(a, b))

  for (let i = 0; i < 12; i++) {
    positions.push(current)
    current = current.map(([a, b]) => norm(input.turn[a] ?? a, input.turn[b] ?? b))
  }

  const inverse = new Array<[number, number]>(9)

  for (let k = 0; k < 9; k++) {
    const out = input.table[k] ?? [0, 0]

    inverse[TABLE_KEY(out[0], out[1])] = [Math.floor(k / 3) - 1, (k % 3) - 1]
  }

  const fires = new Uint8Array(81)

  for (let l = 0; l < 9; l++) {
    for (let w = 0; w < 9; w++) {
      fires[l * 9 + w] = input.swapWhen(l, w) || input.swapWhen(w, l) ? 1 : 0
    }
  }

  return { lines, positions, positionAt: input.positionAt, swapAt: input.swapAt, forward: input.table, inverse, fires, exchange: 'first-sign' }
}

function collideCell(input: {
  knit: Knit
  vibe: Int8Array
  token: Int32Array
  open: Uint8Array
  base: number
  t: number
  forward: boolean
  meetings: [number, number][]
  signs: [number, number][]
}): void {
  const { knit, vibe, token, open, base, t, forward, meetings, signs } = input
  const table = forward ? knit.forward : knit.inverse
  const preimage = knit.inverse
  const couples = knit.positions[at(knit.positionAt, t)] ?? []
  const swapIndex = at(knit.swapAt, t)

  for (let k = 0; k < couples.length; k++) {
    const line = knit.lines[couples[k]?.[0] ?? 0] ?? [0, 0]
    const wire = knit.lines[couples[k]?.[1] ?? 0] ?? [0, 0]

    const swap = (): void => {
      const a0 = vibe[base + line[0]] ?? 0
      const a1 = vibe[base + line[1]] ?? 0
      const w0 = vibe[base + wire[0]] ?? 0
      const w1 = vibe[base + wire[1]] ?? 0

      if (knit.fires[TABLE_KEY(a0, a1) * 9 + TABLE_KEY(w0, w1)] === 1) {
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

      // the first slot's vibe after the forward step
      const after0 = forward ? (image[0] ?? 0) : a
      const weight = (v: number): number => (v !== 0 ? v : 1)
      const exchanged =
        knit.exchange === 'meeting' ? before[0] !== 0 && before[1] !== 0 : weight(before[0] ?? 0) !== weight(after0)
      const ti = token[i] ?? 0
      const tj = token[j] ?? 0

      if (before[0] !== 0 && before[1] !== 0 && open[ti] === 1 && open[tj] === 1) {
        meetings.push([ti, tj])
        // going back, when the forward step exchanged the tokens, ti held the second slot's vibe before it
        signs.push(forward || !exchanged ? [before[0] ?? 0, before[1] ?? 0] : [before[1] ?? 0, before[0] ?? 0])
      }

      if (exchanged) {
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

const KNITS = new WeakMap<ColorWeave, Knit>()

function knitOf(weave: ColorWeave, knit: Knit | undefined): Knit {
  if (knit) {
    return knit
  }

  const known = KNITS.get(weave) ?? colorWeaveKnit(weave)

  KNITS.set(weave, known)

  return known
}

// one beat forward of the classical layer, and what it did to the open tokens. The knit defaults to the
// weave's own (the committed schedule with the weave's table)
export function fearBeat(input: {
  weave: ColorWeave
  links: Int16Array
  lattice: Lattice
  open: Uint8Array
  t: number
  knit?: Knit
}): { lattice: Lattice; record: BeatRecord } {
  const { weave, links, lattice, open, t } = input
  const knit = knitOf(weave, input.knit)
  const { mesh, moves } = weave
  const vibe = Int8Array.from(lattice.vibe)
  const token = Int32Array.from(lattice.token)
  const point = Int8Array.from(lattice.point)
  const meetings: [number, number][] = []
  const signs: [number, number][] = []

  for (let x = 0; x < mesh.cellCount; x++) {
    collideCell({ knit, vibe, token, open, base: x * 24, t, forward: true, meetings, signs })
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
    record: { meetings, crossings, signs },
  }
}

// one beat backward: the exact inverse of fearBeat at beat t
export function fearBeatBack(input: {
  weave: ColorWeave
  links: Int16Array
  lattice: Lattice
  open: Uint8Array
  t: number
  knit?: Knit
}): { lattice: Lattice; record: BeatRecord } {
  const { weave, links, lattice, open, t } = input
  const knit = knitOf(weave, input.knit)
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
  const signs: [number, number][] = []

  for (let x = 0; x < mesh.cellCount; x++) {
    collideCell({ knit, vibe, token, open, base: x * 24, t, forward: false, meetings, signs })
  }

  return { lattice: { vibe, token, point }, record: { meetings, crossings, signs } }
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
  // the kernel is kernel4 / divisor, 4 unless given
  divisor?: number
}): Whole | null {
  const { whole, a, b, kernel4, fixed } = input
  const divisor = BigInt(input.divisor ?? 4)
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
        if (m % divisor !== 0n) {
          return null
        }

        m /= divisor
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
  // a kernel chosen per meeting (by the tokens' signs, say): it acts with order[0] as its first coordinate
  kernelOf?: (
    ta: number,
    tb: number,
  ) => { kernel: readonly (readonly number[])[]; divisor: number; order: readonly [number, number] }
  // the color mode: the kernel chosen by the vibes each meeting recorded, like or love-fear. Every
  // coordinate is then read in the color weave's convention, a fear's conjugate role at the reflected point
  color?: FearKernels
}): Whole | null {
  const { weave, record, fixed, forward, color } = input
  const signs = record.signs ?? []
  let meetingIndex = 0
  const kernelOf =
    input.kernelOf ??
    (color
      ? (ta: number, tb: number) => {
          const [sa, sb] = signs[meetingIndex++] ?? [1, 1]

          return sa === sb
            ? { kernel: color.like, divisor: color.likeDivisor, order: [ta, tb] as const }
            : { kernel: color.unlike, divisor: color.unlikeDivisor, order: (sa > 0 ? [ta, tb] : [tb, ta]) as readonly [number, number] }
        }
      : undefined)
  const { kernel4 } = input
  const coordinate = new Map(input.whole.tokens.map((t, i) => [t, i]))

  let whole: Whole | null = input.whole

  const meet = (): void => {
    for (const [ta, tb] of record.meetings) {
      if (!whole) {
        return
      }

      if (kernelOf) {
        const chosen = kernelOf(ta, tb)

        whole = meetWhole({
          whole,
          a: coordinate.get(chosen.order[0]) ?? 0,
          b: coordinate.get(chosen.order[1]) ?? 0,
          kernel4: chosen.kernel,
          divisor: chosen.divisor,
          fixed,
        })
      } else {
        whole = meetWhole({ whole, a: coordinate.get(ta) ?? 0, b: coordinate.get(tb) ?? 0, kernel4, fixed })
      }
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

// The color mode's kernels, the three-trit color law adopted: the swap phase where like vibes meet (two
// loves, or two fears in the conjugate convention, where U* acts as U does on the reflected points) and the
// singlet phase where a love meets a fear, love first, the fear's coordinate at the reflected point. The
// grain is 2^a 3^b: quarters at like meetings, thirds at love-fear ones (at the cube-root angles).
export type FearKernels = {
  readonly like: readonly (readonly number[])[]
  readonly likeDivisor: number
  readonly unlike: readonly (readonly number[])[]
  readonly unlikeDivisor: number
}

// the color mode at angles like and unlike: the fear beat is (2 pi / 3, 2 pi / 3), the color weave with the
// fear beat off is (pi, 0), and the backward beat of (x, y) is (-x, -y)
// likeExchanged: whether the knit exchanges the tokens of a like meeting (the color weave does, a
// 'first-sign' knit does not); the turn acts on the slots, so the tokens see SWAP U or U. On a knit that
// does not exchange them the fear beat off is like = 0, not pi
export function fearKernels(input: { like: number; unlike: number; likeExchanged?: boolean }): FearKernels | null {
  const u = swapPhase(input.like)
  const like = wholeKernel((input.likeExchanged ?? true) ? multiplyOperators(exchangeOperator(), u) : u, 1000)
  const unlike = wholeKernel(singletPhase(input.unlike), 1000)

  return like && unlike
    ? { like: like.kernel, likeDivisor: like.divisor, unlike: conjugateSecond(unlike.kernel), unlikeDivisor: unlike.divisor }
    : null
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

// The singlet phase for a love meeting a fear, the color-respecting gate of a role and its conjugate:
// V(phi) = 1 + (e^(i phi) - 1) P, P the projector on the whole Phi = sum_j |j j> / sqrt 3, with the fear's
// role in the conjugate representation. Every color move acts on a love as C and on a fear as C*, and
// C x C* fixes Phi, so V commutes with every change of frame; its commutant is span{1, P}.
export function singletPhase(phi: number): Operator {
  const v = operator(9)
  const c = Math.cos(phi) - 1
  const s = Math.sin(phi)

  for (let i = 0; i < 9; i++) {
    v.re[i * 9 + i] = 1
  }

  for (let j = 0; j < 3; j++) {
    for (let k = 0; k < 3; k++) {
      const at = (3 * j + j) * 9 + (3 * k + k)

      v.re[at] = (v.re[at] ?? 0) + c / 3
      v.im[at] = (v.im[at] ?? 0) + s / 3
    }
  }

  return v
}

// the grid point a fear's conjugate role is stored at: (a, b) -> (a, -b), since A(a, b)* = A(a, -b). Stored
// this way, a fear's point moves by the same grid move as a love's, which is the color weave's convention
export const CONJUGATE_POINT: readonly number[] = Array.from({ length: 9 }, (_, p) => 3 * Math.floor(p / 3) + ((3 - (p % 3)) % 3))

// a kernel on (love, fear) with the fear's coordinate in the color weave's convention
export function conjugateSecond(kernel: readonly (readonly number[])[]): number[][] {
  const map = (i: number): number => Math.floor(i / 9) * 9 + (CONJUGATE_POINT[i % 9] ?? 0)

  return Array.from({ length: 81 }, (_, r) => Array.from({ length: 81 }, (__, c) => kernel[map(r)]?.[map(c)] ?? 0))
}

// D K in whole numbers with the smallest D up to a limit, or null
export function wholeKernel(u: Operator, limit: number): { divisor: number; kernel: number[][] } | null {
  const k = wignerKernel(u)

  for (let d = 1; d <= limit; d++) {
    const scaled = k.map(row => row.map(x => Math.round(d * x)))

    if (k.every((row, r) => row.every((x, c) => Math.abs(d * x - (scaled[r]?.[c] ?? 0)) < 1e-9))) {
      return { divisor: d, kernel: scaled }
    }
  }

  return null
}

// 4 K in whole numbers, or null when K is not in quarters
export function quarterKernel(u: Operator): number[][] | null {
  const k = wignerKernel(u)
  const k4 = k.map(row => row.map(x => Math.round(4 * x)))
  const exact = k.every((row, r) => row.every((x, c) => Math.abs(4 * x - (k4[r]?.[c] ?? 0)) < 1e-9))

  return exact ? k4 : null
}
