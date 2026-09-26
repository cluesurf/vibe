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
// points in every configuration. Like meetings keep the swap phase. The grain is then 2^a 3^b. Since
// 2026-09-26 the whole carries each coordinate's frame (the sign it is written in) and rewrites a coordinate
// whose token changed sign between meetings before the kernel reads it (E-QTM-0123): no linear map carries
// a love's role to a fear's while commuting with the links (the reflection is antisymplectic, so it is
// antiunitary), and leaving the stored point in place applied a partial conjugation to entangled wholes.
//
// Since 2026-09-26 the fear beat is the COMOVING one, by the user's decision (see advanceWhole): every meeting's
// kernel is read about the two coordinates' own role points, which the whole carries as `own`. The fixed-frame
// beat before it is `comoving: false`.
//
// Grid moves act on the whole through sigma-links' identification of the phase point (a, b), index 3 a + b,
// with the grid point x = a, y = b, index a + 3 b (moveCoordinate, GRID_OF_PHASE; E-QTM-0124).
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
// their 9^k joint role points. The color mode also carries, per coordinate, the FRAME its role is written
// in (+1 a love's, -1 a fear's reflected point, 0 not yet met) and, for the backward beat, the frames it
// held before each of its meetings (see advanceWhole). Every mode carries each coordinate's OWN role point, the
// point the comoving fear beat reads its meetings about (see advanceWhole); a whole without one has every
// coordinate's own point at the origin, where a whole built from role basis states is centered
export type Whole = {
  readonly tokens: readonly number[]
  readonly weight: readonly bigint[]
  readonly frame?: readonly number[]
  readonly trail?: readonly (readonly number[])[]
  // each coordinate's own role point, in the PHASE index 3 a + b
  readonly own?: readonly number[]
}

// a whole with its coordinates' own role points set (phase index 3 a + b), for a whole built about points
// other than the origin
export function withOwn(whole: Whole, own: readonly number[]): Whole {
  return { ...whole, own: [...own] }
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

  return g > 1n ? { ...whole, weight: whole.weight.map(w => w / g) } : whole
}

// THE TWO INDEXINGS OF THE NINE ROLE POINTS, one convention (fixed 2026-09-26, E-QTM-0124). A whole's weights
// are indexed by the PHASE point (a, b) at 3 a + b, the index of code/measure/grid-weights and
// qutrit-phase-space. A grid move (weave.moves.act, code/rule/sigma-links) is a table on the GRID point
// x = a, y = b at a + 3 b, which is sigma-links' toGrid. moveCoordinate takes a grid move and applies it to
// the phase index through that identification. Until 2026-09-26 it applied the grid table to the phase
// index directly, so every link acted by its transpose T g T (T: (a, b) -> (b, a)): still a Clifford move,
// since T reverses the symplectic form twice, but not the element sigma-links assigns the link.
export const GRID_OF_PHASE: readonly number[] = Array.from({ length: 9 }, (_, q) => Math.floor(q / 3) + 3 * (q % 3))

// a grid move (a table on a + 3 b) as a permutation of the phase index 3 a + b
export function phaseMove(grid: ArrayLike<number>): number[] {
  return GRID_OF_PHASE.map(q => GRID_OF_PHASE[grid[q] ?? q] ?? 0)
}

// move one coordinate of the whole by a permutation of its 9 PHASE points (index 3 a + b). The coordinate's own
// point moves with its weights (a whole without own points gets them, every other one at the origin), so every
// move of a coordinate, a crossing, a frame rewrite or a frame change, carries the point the comoving beat reads
export function movePhaseCoordinate(whole: Whole, coordinate: number, perm: ArrayLike<number>): Whole {
  const k = whole.tokens.length
  const stride = 9 ** (k - 1 - coordinate)
  const out = new Array<bigint>(whole.weight.length).fill(0n)

  for (let i = 0; i < whole.weight.length; i++) {
    const c = Math.floor(i / stride) % 9
    const j = i + ((perm[c] ?? c) - c) * stride

    out[j] = whole.weight[i] ?? 0n
  }

  const own = whole.own ? [...whole.own] : new Array<number>(k).fill(0)
  const p = own[coordinate] ?? 0

  own[coordinate] = perm[p] ?? p

  return { ...whole, weight: out, own }
}

// move one coordinate of the whole by a GRID move (a table on the grid index a + 3 b, as weave.moves.act)
export function moveCoordinate(whole: Whole, coordinate: number, grid: ArrayLike<number>): Whole {
  return movePhaseCoordinate(whole, coordinate, phaseMove(grid))
}

// grid moves as permutations of the phase index, cached per table: how an own point moves at a crossing
const PHASE_MOVES = new WeakMap<object, number[]>()

export function phasePermOf(grid: ArrayLike<number>): number[] {
  const known = PHASE_MOVES.get(grid as object)

  if (known) {
    return known
  }

  const made = phaseMove(grid)

  PHASE_MOVES.set(grid as object, made)

  return made
}

// a phase point (index 3 a + b) minus another, componentwise mod 3
export function phaseMinus(p: number, v: number): number {
  const a = (Math.floor(p / 3) - Math.floor(v / 3) + 3) % 3
  const b = ((p % 3) - (v % 3) + 3) % 3

  return 3 * a + b
}

// A meeting kernel (in whole numbers on the 81 joint phase points of two coordinates, index 9 x + y) read in the
// two coordinates' own frames: K'(x, y; x0, y0) = K(x - pa, y - pb; x0 - pa, y0 - pb). Translating a coordinate is
// conjugating it by a displacement, a Clifford move, so K' has the same divisor, is still unital and
// weight-keeping, and its inverse is the inverse kernel translated the same way (E-SPN-0062)
export function translatedKernel(kernel: readonly (readonly number[])[], pa: number, pb: number): number[][] {
  return Array.from({ length: 81 }, (_, r) => {
    const rx = phaseMinus(Math.floor(r / 9), pa)
    const ry = phaseMinus(r % 9, pb)
    const row = kernel[9 * rx + ry] ?? []

    return Array.from({ length: 81 }, (__, c) => row[9 * phaseMinus(Math.floor(c / 9), pa) + phaseMinus(c % 9, pb)] ?? 0)
  })
}

// translatedKernel cached per kernel table and pair of points; the kernel itself where the points coincide at
// the origin
const TRANSLATED = new WeakMap<object, (number[][] | undefined)[]>()

export function translatedOf(kernel: readonly (readonly number[])[], pa: number, pb: number): readonly (readonly number[])[] {
  if (pa === 0 && pb === 0) {
    return kernel
  }

  let row = TRANSLATED.get(kernel)

  if (!row) {
    row = new Array<number[][] | undefined>(81).fill(undefined)
    TRANSLATED.set(kernel, row)
  }

  const known = row[9 * pa + pb]

  if (known) {
    return known
  }

  const made = translatedKernel(kernel, pa, pb)

  row[9 * pa + pb] = made

  return made
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

  const next = { ...whole, weight: out }

  return fixed ? next : reduceWhole(next)
}

// apply one beat's record to the whole: meetings then crossings going forward, crossings then meetings
// going back (the record of fearBeatBack already lists them in that beat's backward order)
//
// THE COMOVING FEAR BEAT, adopted by the user 2026-09-26 (E-SPN-0062, E-SPN-0063, E-SPN-0066), the default.
// Each meeting's kernel is read in the two coordinates' OWN frames: with the coordinates in kernel order (love
// first at a love-fear meeting) and their own points pa and pb, K is replaced by translatedKernel(K, pa, pb).
// The own point is each coordinate's role point, carried beside the weights as `own` (phase index): it moves
// exactly as its coordinate's weights move, by the grid move of every crossing, and it is reflected with them
// whenever the color mode rewrites the coordinate into its token's new frame. So it is a function of the classical
// record alone, never of the weights, and it is what the knit already holds at the dock (a closed token's
// classical role point moves by the same table). The kernel then depends only on pa - pb and is the model's
// wherever the two points coincide, which is every meeting on a pure-gauge field; on live links it keeps the
// role's fermion number at every meeting (E-SPN-0063: 831 of 831), where the fixed-frame beat breaks it.
//
// Where it applies: the color mode with frames, and the grain mode (one kernel4 for every meeting). Two things
// are left as they were, stated: a kernel the caller chooses per meeting (`kernelOf`) is applied as given, since
// such a caller builds its own kernel (E-SPN-0062 hands in kernels already translated), and the color mode with
// `frames: false` stays the law before 2026-09-26, the control E-QTM-0123 keeps. `comoving: false` is the fear
// beat before the adoption, kept so earlier experiments can be reproduced. The own points are tracked in every
// mode either way.
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
  // the color mode's frame tracking (on unless false). Off is the law before 2026-09-26, kept as the
  // control of E-QTM-0123: it is not a physical law, since it leaves non-states
  frames?: boolean
  // the comoving fear beat (on unless false); off is the fixed-frame beat before 2026-09-26, the control
  comoving?: boolean
}): Whole | null {
  const { weave, record, fixed, forward, color } = input
  const comoving = input.comoving !== false
  const signs = record.signs ?? []
  // a kernel read about the two coordinates' own points, as the whole holds them at the meeting (every move of a
  // coordinate moves its own point, movePhaseCoordinate)
  const about = (kernel: readonly (readonly number[])[], c0: number, c1: number): readonly (readonly number[])[] => {
    const own = (whole as Whole | null)?.own

    return comoving && own ? translatedOf(kernel, own[c0] ?? 0, own[c1] ?? 0) : kernel
  }
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

  // The color mode's frames (E-QTM-0123). A coordinate is written in the frame of the sign its token had at
  // its last meeting: a love's point, or a fear's conjugate role at the reflected point. A token's vibe can
  // change sign between its meetings (the line table turns a love into a fear and back), and the kernels read
  // the frame of the signs they are handed, so before a meeting every coordinate whose token now has the
  // other sign is REFLECTED (the same role, rewritten in the new frame). Without this the whole took the
  // change as a partial conjugation of the role, which is not a physical map on an entangled whole (the
  // partial transpose), and 299 of 2,016 two-role wholes stopped being states. A coordinate that has not met
  // yet takes the frame of its first meeting as it stands. Going back, each meeting restores the frames it
  // replaced, from the whole's per-coordinate trail.
  const frames = (): { frame: number[]; trail: number[][] } => {
    const w = whole as Whole
    const k = w.tokens.length

    return {
      frame: w.frame ? [...w.frame] : new Array<number>(k).fill(0),
      trail: w.trail ? w.trail.map(t => [...t]) : Array.from({ length: k }, () => []),
    }
  }

  const reframe = (c: number, to: number, state: { frame: number[] }): void => {
    const from = state.frame[c] ?? 0

    if (from !== 0 && to !== 0 && from !== to) {
      whole = movePhaseCoordinate(whole as Whole, c, CONJUGATE_POINT)
    }

    state.frame[c] = to
  }

  const meet = (): void => {
    for (const [ta, tb] of record.meetings) {
      if (!whole) {
        return
      }

      if (color && !input.kernelOf && input.frames !== false) {
        const [sa, sb] = signs[meetingIndex] ?? [1, 1]
        const ca = coordinate.get(ta) ?? 0
        const cb = coordinate.get(tb) ?? 0
        const state = frames()

        if (forward) {
          state.trail[ca]?.push(state.frame[ca] ?? 0)
          state.trail[cb]?.push(state.frame[cb] ?? 0)
          reframe(ca, sa, state)
          reframe(cb, sb, state)
        }

        const chosen = (kernelOf as NonNullable<typeof kernelOf>)(ta, tb)
        const c0 = coordinate.get(chosen.order[0]) ?? 0
        const c1 = coordinate.get(chosen.order[1]) ?? 0
        const met: Whole | null = meetWhole({
          whole: whole as Whole,
          a: c0,
          b: c1,
          kernel4: about(chosen.kernel, c0, c1),
          divisor: chosen.divisor,
          fixed,
        })

        whole = met

        if (!whole) {
          return
        }

        if (!forward) {
          reframe(ca, state.trail[ca]?.pop() ?? 0, state)
          reframe(cb, state.trail[cb]?.pop() ?? 0, state)
        }

        whole = { ...(whole as Whole), frame: state.frame, trail: state.trail }
        continue
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
        const ca = coordinate.get(ta) ?? 0
        const cb = coordinate.get(tb) ?? 0

        whole = meetWhole({ whole, a: ca, b: cb, kernel4: about(kernel4, ca, cb), fixed })
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

// the same reflection (a, b) -> (a, -b) as a table on the GRID index a + 3 b, for a mover that takes grid
// moves (moveCoordinate, calm-weave's conjugateMove): C g C in grid terms is CONJUGATE_GRID g CONJUGATE_GRID
export const CONJUGATE_GRID: readonly number[] = Array.from({ length: 9 }, (_, g) => (g % 3) + 3 * ((3 - Math.floor(g / 3)) % 3))

// the whole in the love frame on every coordinate: each coordinate a color-mode meeting left in a fear's
// frame reflected back, so the weights are the Wigner function of the roles themselves, in whole units. A
// whole with no frames is returned as it is
export function physicalWhole(whole: Whole): Whole {
  let out: Whole = { tokens: whole.tokens, weight: whole.weight }

  whole.frame?.forEach((f, c) => {
    if (f === -1) {
      out = movePhaseCoordinate(out, c, CONJUGATE_POINT)
    }
  })

  return out
}

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
