// THE CROSS-LINE PIECES (board proposal 012, item vibe-roadmap-grounding-0021): the fermion sign and the drift cost of
// code/rule/bound-line-pieces written for a state on any number of mesh lines, so a self in the 4D bulk, where the
// collision K = w_P moves vibes between lines (note/line-confinement.md section 2), has both pieces defined. Both are
// OPTIONAL, the status the line pieces have: with both off the beat is the working beat (coinedVetoBeat, veto 'none')
// bit for bit, in either coin place. Proposal 012 is not adopted; nothing here changes the base.
//
// (a) THE SIGN (012 "The sign"). Every open vibe, love or fear, is one fermion field. The beat's slot maps act on the
// Fock state in the order modeIndex (code/rule/coined-locked-knit: dock-major, then line, the first slot before the
// second): each map multiplies a branch by the parity of the reordering it gives the occupied open modes.
//   - The collision's dock permutation (B or K, coinPiece): its parity on the dock's open modes. A dock's modes are
//     contiguous in modeIndex order, so the dock's own reordering is the whole map's.
//   - The pair move (pairPiece) makes or unmakes a love and a fear on the two slots of one line, which are adjacent in
//     modeIndex order: the two-mode hop passes no mode, so it carries +1. A store is an even object (012), so its place
//     in the order is free and it never enters a parity. This removes fermionSign's two refusals (stores, loves beside
//     fears).
//   - The coin, the half coin and the meetings copy within a line, between adjacent modes: no sign.
//   - The stream: the parity of the reordering slot -> t.target[slot] gives the open modes.
//   In 'split' the collision's parity is read on the occupation after the first half coin and the stream's on the
//   occupation after the second, so the beat's sign is the product of the two maps' signs, as it must be.
//   On a one-line state this equals bound-line-pieces' lineSign up to the fixed gauge G(x), the parity of the
//   reordering from line order (position, back slot first) to modeIndex order (gaugeLine below; the experiment checks
//   0 differing configurations).
//
// (b) THE COST, S1, THE LINK REGISTER (012 "S1"). Every honeycomb link holds a trit f in Z_3, stored sparse (a branch
// group's register lists only the links with f != 0). A link is a facet of a dock; it carries exactly one mesh line, and
// its id is first-slot-wise: the link a first slot f of dock x streams across is x * 24 + f, and the second slot -f of
// the dock beyond streams back across the same link. An OPEN vibe of charge q (love +1, fear -1) the stream copies
// across a link writes f - q going forward (a first slot), f + q going back (the recorded hop), so Gauss
// div f = q holds at every dock after every beat if it held at the start (gaussOff checks it). A reflecting frontier
// (a slot streaming into its own dock) crosses no link. Closed vibes record nothing. The beat multiplies a branch by
// zeta_clock^(-n), n the links with f != 0, read on the register before the beat (the register changes only in the
// stream, and the cost is diagonal, so it commutes with every dock-local piece).
//   - The coupling: clock 18 (pi/9 a flux link, N = 2D + 1 at D = 4, exact in Z[zeta9][1/6]) by default, 012's
//     choice; clock 14 (pi/7, bound-line-pieces' CLOCK) for the reduction check.
//   - Exact as bound-line-pieces is: one slice of branches per clock count e (mod clock) and register; each slice runs
//     by the working rule unchanged in Z[w][1/2], the cost moves a slice from e to e - n. The physical amplitude is
//     sum_e A_e zeta_clock^e, read as measurement.
//   - On a state on one open line of the honeycomb the register is Gauss's f_l = Q(l) (the cut trit c of
//     bound-line-pieces stays 0, no ring), so the cost is bound-line-pieces' cost up to the coupling.
//
// ONE BEAT, 'split' (the working place, decision 004): the cost, D, the meetings, the collision with its sign, D, the
// stream with its sign and the register. 'before': the cost, the coin, the meetings, the collision with its sign, the
// stream with its sign and the register. The inverses run each part back in the reverse order.
//
// NOTHING MOVES: the sign is a phase, the register is written by the stream's own copies, the cost is a phase. Exact
// in Z[w][1/2] per slice; no float, no rounding, no random number.

import {
  coinBranch,
  halfCoinBranch,
  modeIndex,
  type CoinPlace,
} from '@/code/rule/coined-locked-knit'
import {
  mergeBranches,
  streamConfiguration,
  type Branch,
  type LockedState,
  type LockedTables,
  type LockedTally,
} from '@/code/rule/doublet-locked-knit'
import {
  coinPiece,
  meetBranch,
  pairPiece,
  type VetoKind,
} from '@/code/rule/occupation-veto-knit'
import { BOUNCE_TABLE, bouncePermutation } from '@/code/rule/bounce-pair-knit'
import { collisionOrder } from '@/code/rule/living-pair-knit'
import {
  LINE_FIRSTS,
  LINE_OF,
  OPPOSITE,
  SIDE,
} from '@/code/rule/isometric-knit'

// 012's coupling: zeta_18^(-1) = e^(-i pi / 9) a flux link
export const CROSS_CLOCK = 18

export type CrossOptions = {
  readonly sign: boolean
  readonly cost: boolean
  // the cost's clock 2N (default CROSS_CLOCK)
  readonly clock?: number
  // the coin's place (default 'split')
  readonly place?: CoinPlace
}

// the register: link id -> trit 1 or 2 (a link holding 0 is absent)
export type Register = ReadonlyMap<number, number>

export type CrossSlice = { e: number; reg: Register; branches: Branch[] }

export type CrossState = Map<string, CrossSlice>

const FIRST = new Uint8Array(24)

for (const f of LINE_FIRSTS) {
  FIRST[f] = 1
}

const mod = (a: number, m: number): number => ((a % m) + m) % m

export const registerKey = (reg: Register): string =>
  [...reg.entries()]
    .sort((p, q) => p[0] - q[0])
    .map(([l, f]) => `${l}:${f}`)
    .join(',')

const sliceKey = (e: number, reg: Register): string =>
  `${e}|${registerKey(reg)}`

// the dock-local mode order of slot d (modeIndex within one dock)
export const localMode = (d: number): number =>
  2 * LINE_OF[d]! + (SIDE[d] === 1 ? 0 : 1)

// THE LINK a stream copy from `slot` crosses: its id and direction (+1 forward along the line, -1 back), or undefined at
// a reflecting frontier (the slot streams into its own dock)
export function linkOf(
  t: LockedTables,
  slot: number,
): { id: number; dir: number } | undefined {
  const to = t.target[slot]!
  const x = Math.floor(slot / 24)
  const y = Math.floor(to / 24)

  if (x === y) {
    return undefined
  }

  const d = slot % 24

  return FIRST[d] === 1
    ? { id: slot, dir: 1 }
    : { id: y * 24 + OPPOSITE[d]!, dir: -1 }
}

// the register after the stream copies the open vibes of `c` (read before the stream)
export function streamRegister(
  t: LockedTables,
  c: { vibe: Int8Array; open: Uint8Array },
  reg: Register,
): Map<number, number> {
  const out = new Map(reg)

  for (let i = 0; i < c.vibe.length; i++) {
    const q = c.vibe[i]!

    if (q === 0 || c.open[i] !== 1) {
      continue
    }

    const link = linkOf(t, i)

    if (!link) {
      continue
    }

    const f = mod((out.get(link.id) ?? 0) - q * link.dir, 3)

    if (f === 0) {
      out.delete(link.id)
    } else {
      out.set(link.id, f)
    }
  }

  return out
}

// the register before the stream, from the open vibes of `c` read AFTER the inverse stream (their sources)
export function unstreamRegister(
  t: LockedTables,
  c: { vibe: Int8Array; open: Uint8Array },
  reg: Register,
): Map<number, number> {
  const out = new Map(reg)

  for (let i = 0; i < c.vibe.length; i++) {
    const q = c.vibe[i]!

    if (q === 0 || c.open[i] !== 1) {
      continue
    }

    const link = linkOf(t, i)

    if (!link) {
      continue
    }

    const f = mod((out.get(link.id) ?? 0) + q * link.dir, 3)

    if (f === 0) {
      out.delete(link.id)
    } else {
      out.set(link.id, f)
    }
  }

  return out
}

// GAUSS: the docks where div f != q (mod 3), q the open charge on the dock (stores are neutral); 0 when Gauss holds
export function gaussOff(
  t: LockedTables,
  c: { vibe: Int8Array; open: Uint8Array },
  reg: Register,
): number {
  return gaussDefect(t, c, reg).size
}

// the defect div f - q (mod 3) of every dock where it is not 0. The recorded hop keeps it dock by dock, so a start
// that is not neutral (a charge with no string) keeps its defect where it was; a neutral start with its strings keeps
// none
export function gaussDefect(
  t: LockedTables,
  c: { vibe: Int8Array; open: Uint8Array },
  reg: Register,
): Map<number, number> {
  const div = new Map<number, number>()
  const add = (x: number, v: number): void => {
    div.set(x, (div.get(x) ?? 0) + v)
  }

  for (const [id, f] of reg) {
    add(Math.floor(id / 24), f)
    add(Math.floor(t.target[id]! / 24), -f)
  }

  for (let i = 0; i < c.vibe.length; i++) {
    if (c.vibe[i] !== 0 && c.open[i] === 1) {
      add(Math.floor(i / 24), -c.vibe[i]!)
    }
  }

  const out = new Map<number, number>()

  for (const [x, v] of div) {
    if (mod(v, 3) !== 0) {
      out.set(x, mod(v, 3))
    }
  }

  return out
}

// parity (0 or 1) of the reordering keys -> images, the list read in the order of its keys
export function reorderParity(keys: readonly number[], images: readonly number[]): number {
  let inversions = 0

  for (let p = 0; p < keys.length; p++) {
    for (let q = p + 1; q < keys.length; q++) {
      if ((keys[p]! - keys[q]!) * (images[p]! - images[q]!) < 0) {
        inversions++
      }
    }
  }

  return inversions & 1
}

const PERM = new Int32Array(24)

// the parity of the dock permutation coinPiece is about to apply at dock x, on the dock's open modes
export function dockParity(t: LockedTables, c: Branch, x: number): number {
  const base = x * 24

  if (bouncePermutation(BOUNCE_TABLE, t.collision, c.vibe, base, PERM) === 0) {
    return 0
  }

  const keys: number[] = []
  const images: number[] = []

  for (let d = 0; d < 24; d++) {
    if (c.vibe[base + d] !== 0 && c.open[base + d] === 1) {
      keys.push(localMode(d))
      images.push(localMode(PERM[d]!))
    }
  }

  return reorderParity(keys, images)
}

// the collision (occupation-veto-knit collideVeto, piece for piece) with its sign's parity returned
export function collideSigned(
  kind: VetoKind,
  t: LockedTables,
  c: Branch,
  beat: number,
  inverse: boolean,
  sign: boolean,
  tally?: LockedTally,
): number {
  const order = collisionOrder('alternate', beat)
  const pieces = inverse ? [...order].reverse() : order

  let parity = 0

  for (let x = 0; x < t.cells; x++) {
    for (const piece of pieces) {
      if (piece === 'P') {
        pairPiece(kind, c, x, inverse ? undefined : tally)
      } else {
        if (sign) {
          parity ^= dockParity(t, c, x)
        }

        coinPiece(t, c, x)
      }
    }
  }

  return parity
}

// the parity of the stream's reordering of the open modes of `c` (read before the stream)
export function streamParity(t: LockedTables, c: Branch): number {
  const keys: number[] = []
  const images: number[] = []

  for (let i = 0; i < c.vibe.length; i++) {
    if (c.vibe[i] !== 0 && c.open[i] === 1) {
      keys.push(modeIndex(i))
      images.push(modeIndex(t.target[i]!))
    }
  }

  return reorderParity(keys, images)
}

const flip = (b: Branch): void => {
  b.a = -b.a
  b.b = -b.b
}

const cloneBranch = (b: Branch): Branch => ({
  vibe: Int8Array.from(b.vibe),
  point: Int8Array.from(b.point),
  open: Uint8Array.from(b.open),
  store: Int8Array.from(b.store),
  spoint: Int8Array.from(b.spoint),
  sopen: Uint8Array.from(b.sopen),
  a: b.a,
  b: b.b,
  k: b.k,
})

type Group = { e: number; reg: Register; list: Branch[] }

function put(out: Map<string, Group>, e: number, reg: Register, b: Branch): void {
  const k = sliceKey(e, reg)
  const o = out.get(k)

  if (o) {
    o.list.push(b)
  } else {
    out.set(k, { e, reg, list: [b] })
  }
}

function sliced(acc: Map<string, Group>): CrossState {
  const out: CrossState = new Map()

  for (const [k, g] of acc) {
    const branches = mergeBranches(g.list)

    if (branches.length > 0) {
      out.set(k, { e: g.e, reg: g.reg, branches })
    }
  }

  return out
}

const clockOf = (o: CrossOptions): number => o.clock ?? CROSS_CLOCK
const placeOf = (o: CrossOptions): CoinPlace => o.place ?? 'split'

export function crossStart(s: LockedState, reg: Register = new Map()): CrossState {
  return new Map([[sliceKey(0, reg), { e: 0, reg, branches: s.branches }]])
}

function halfCoinAll(t: LockedTables, branches: readonly Branch[], adjoint: boolean): Branch[] {
  const out: Branch[] = []

  for (const br of branches) {
    out.push(...halfCoinBranch(t.cells, cloneBranch(br), adjoint))
  }

  return mergeBranches(out)
}

function coinAll(t: LockedTables, branches: readonly Branch[], adjoint: boolean): Branch[] {
  const out: Branch[] = []

  for (const br of branches) {
    out.push(...coinBranch(t.cells, cloneBranch(br), adjoint))
  }

  return mergeBranches(out)
}

// the stream of one branch with its sign and register; returns the register after
function streamOne(
  options: CrossOptions,
  t: LockedTables,
  b: Branch,
  reg: Register,
): Register {
  if (options.sign && streamParity(t, b) === 1) {
    flip(b)
  }

  const next = options.cost ? streamRegister(t, b, reg) : reg

  streamConfiguration(t, b, false)

  return next
}

// ONE BEAT of the working rule (veto `kind`, 'none' for the working vacuum) with the optional pieces
export function crossBeat(
  options: CrossOptions,
  kind: VetoKind,
  t: LockedTables,
  s: CrossState,
  beat: number,
  tally?: LockedTally,
): CrossState {
  const clock = clockOf(options)
  const acc = new Map<string, Group>()

  for (const { e, reg, branches } of s.values()) {
    const e1 = options.cost ? mod(e - reg.size, clock) : e

    if (placeOf(options) === 'split') {
      const collided: Branch[] = []

      for (const br of halfCoinAll(t, branches, false)) {
        for (const b of meetBranch(br, t.cells, false, tally)) {
          if (collideSigned(kind, t, b, beat, false, options.sign, tally) === 1) {
            flip(b)
          }

          collided.push(b)
        }
      }

      for (const b of halfCoinAll(t, mergeBranches(collided, tally), false)) {
        put(acc, e1, streamOne(options, t, b, reg), b)
      }
    } else {
      for (const br of coinAll(t, branches, false)) {
        for (const b of meetBranch(cloneBranch(br), t.cells, false, tally)) {
          if (collideSigned(kind, t, b, beat, false, options.sign, tally) === 1) {
            flip(b)
          }

          put(acc, e1, streamOne(options, t, b, reg), b)
        }
      }
    }
  }

  return sliced(acc)
}

// its exact inverse
export function crossBeatBack(
  options: CrossOptions,
  kind: VetoKind,
  t: LockedTables,
  s: CrossState,
  beat: number,
): CrossState {
  const clock = clockOf(options)
  const unstreamed = new Map<string, Group>()

  for (const { e, reg, branches } of s.values()) {
    for (const br of branches) {
      const b = cloneBranch(br)

      streamConfiguration(t, b, true)

      if (options.sign && streamParity(t, b) === 1) {
        flip(b)
      }

      put(unstreamed, e, options.cost ? unstreamRegister(t, b, reg) : reg, b)
    }
  }

  const acc = new Map<string, Group>()

  for (const { e, reg, list } of unstreamed.values()) {
    const e0 = options.cost ? mod(e + reg.size, clock) : e
    const merged = mergeBranches(list)

    if (placeOf(options) === 'split') {
      const met: Branch[] = []

      for (const b of halfCoinAll(t, merged, true)) {
        if (collideSigned(kind, t, b, beat, true, options.sign) === 1) {
          flip(b)
        }

        met.push(...meetBranch(b, t.cells, true))
      }

      for (const b of halfCoinAll(t, mergeBranches(met), true)) {
        put(acc, e0, reg, b)
      }
    } else {
      const met: Branch[] = []

      for (const b of merged) {
        if (collideSigned(kind, t, b, beat, true, options.sign) === 1) {
          flip(b)
        }

        met.push(...meetBranch(b, t.cells, true))
      }

      for (const b of coinAll(t, mergeBranches(met), true)) {
        put(acc, e0, reg, b)
      }
    }
  }

  return sliced(acc)
}

// sum over slices and branches of N(a + b w) 4^(K - k), and 4^K: equal exactly when the slices' summed norm is 1
export function crossNorm(s: CrossState): { total: bigint; unit: bigint } {
  const all = [...s.values()].flatMap(g => g.branches)
  const K = Math.max(0, ...all.map(b => b.k))

  let total = 0n

  for (const b of all) {
    total += (b.a * b.a - b.a * b.b + b.b * b.b) * (1n << BigInt(2 * (K - b.k)))
  }

  return { total, unit: 1n << BigInt(2 * K) }
}

// the slices and branches where `a` and `b` differ (0 when equal exactly)
export function crossDiffer(a: CrossState, b: CrossState): number {
  let n = 0

  for (const k of new Set([...a.keys(), ...b.keys()])) {
    const x = a.get(k)?.branches ?? []
    const y = b.get(k)?.branches ?? []
    const neg = y.map(v => {
      const c = cloneBranch(v)

      flip(c)

      return c
    })

    n += mergeBranches([...x.map(cloneBranch), ...neg]).length
  }

  return n
}

// THE GAUGE G(x) of a one-line state: the parity of the reordering of its open modes from line order (position along
// the line, the back slot first at one dock: bound-line-pieces' lineKey) to modeIndex order. `position` maps a dock to
// its place on the line, `first` is the line's first slot
export function gaugeLine(
  c: { vibe: Int8Array; open: Uint8Array },
  position: ReadonlyMap<number, number>,
  first: number,
): number {
  const keys: number[] = []
  const images: number[] = []

  for (let i = 0; i < c.vibe.length; i++) {
    if (c.vibe[i] === 0 || c.open[i] !== 1) {
      continue
    }

    const x = position.get(Math.floor(i / 24))

    if (x === undefined) {
      throw new Error('cross-line-pieces: gaugeLine reads a state on its line only')
    }

    keys.push(2 * x + (i % 24 === first ? 1 : 0))
    images.push(modeIndex(i))
  }

  return reorderParity(keys, images)
}
