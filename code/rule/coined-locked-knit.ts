// THE COINED LOCKED KNIT (E-SPN-0091): the doublet-locked knit (code/rule/doublet-locked-knit, unchanged) with one new
// piece, the covariant coin E-SPN-0090 found, and the fermion sign the coin makes visible.
//
// THE COIN. On every line of every dock, C = alpha P+ + beta P- on the doublet (e0, e1), P+- the projectors on
// e0 +- e1, with alpha = 1 and beta = w: 2C = (1 + w) I + (1 - w) X, the stand-in token's coin (E-SPN-0086, 0087), so no
// new number enters. E-SPN-0090: it commutes with W(F4)'s line stabilizer, the comoving frame, C and T, is exact in
// Z[w] over 2, and does not keep the lattice momentum (the one symmetry that forbids a mass). Acting on a
// configuration (the knit's state is a sum of configurations, each vibe on a slot with a point):
//   a line holding one OPEN vibe     keep (1 + w)/2, or copy the vibe (value, point, open) to the line's other slot
//                                    of the same dock with (1 - w)/2. The vibe stays on its line and its dock
//   a line holding two open vibes    the pair's determinant, det C = w, a phase (two fermions on the two slots of one
//                                    line: C (x) C on the antisymmetric pair); points unchanged
//   any line with a closed vibe      untouched (a closed vibe is classical bookkeeping; with no open vibe the coin is
//                                    the identity and the rule is the locked knit bit for bit)
//
// THE FERMION SIGN. The knit stores configurations with no sign on the stream: a vibe copied past another, or a full
// line bounced (its two vibes swap slots), picks up nothing. While positions are classical this is a global phase per
// history (every branch shares one occupation history, E-SPN-0088), so it never mattered. Once the coin superposes
// positions, histories that cross and histories that bounce interfere, and the sign decides the statistics. The
// canonical fermionic lift of a slot permutation (c_d -> c_(w d) on fermion modes) gives each configuration the parity
// of the permutation its occupied modes undergo, in one fixed order of modes. The order used: dock by dock, and in a
// dock line by line, first slot then second (so the coin's copy within a line passes no other mode and carries no
// sign). The meeting's exchange already carries its fermion sign (code/rule/doublet-locked-knit). With `fermion: false`
// the rule is the knit's literal configuration code plus the coin (called 'native' in E-SPN-0091), whose vibes then
// exchange as hard-core bosons.
//
// The fermion sign is computed for love-only and fear-only configurations with no store (the only ones E-SPN-0091
// runs with the sign on). A dock whose collision makes or unmakes a pair would need the store's sign convention, which
// is not written; the code refuses rather than guess.
//
// THE CONTACT (E-SPN-0092, 0093): with tables built on collision 'pass' (code/rule/bounce-pair-knit) a full line of two
// like vibes keeps its slots instead of turning, so under the fermion sign its lift is +1 where the bounce's is -1, and
// the like contact costs the meeting's w alone. Nothing in this file changes: the sign reads the tables' collision.
//
// ONE BEAT t: the coin, then the locked knit's beat (meetings, collision, stream), with the fermion sign of the
// collision and stream of each branch. The inverse: the locked knit's inverse beat, the same sign, the adjoint coin.
//
// NOTHING MOVES: the coin copies a vibe to the other slot of its own line on its own dock, the stream copies each
// slot's value one dock along; a link holds nothing. Exact in Z[w][1/2]; no float, no rounding, no random number.

import {
  LINE_FIRSTS,
  LINE_OF,
  OPPOSITE,
  SIDE,
} from '@/code/rule/isometric-knit'
import {
  bouncePermutation,
  BOUNCE_TABLE,
} from '@/code/rule/bounce-pair-knit'
import { rootsD4 } from '@/code/algebra/group/root-system'
import {
  lockedBeat,
  lockedBeatBack,
  mergeBranches,
  times,
  type Branch,
  type Configuration,
  type LockedState,
  type LockedTables,
  type LockedTally,
} from '@/code/rule/doublet-locked-knit'
import {
  vetoBeat,
  vetoBeatBack,
  type VetoKind,
} from '@/code/rule/occupation-veto-knit'

export const LINE_SECONDS: readonly number[] = LINE_FIRSTS.map(
  f => OPPOSITE[f] ?? f,
)

export type CoinOptions = { readonly fermion: boolean }

// the coin's coefficients over 2 (forward, adjoint): keep (1 + w), adjoint -w; cross (1 - w), adjoint 2 + w; the
// full line's det w (exact, no scale), adjoint w^2 = -1 - w
const KEEP: readonly [bigint, bigint][] = [
  [1n, 1n],
  [0n, -1n],
]
const CROSS: readonly [bigint, bigint][] = [
  [1n, -1n],
  [2n, 1n],
]
const DET: readonly [bigint, bigint][] = [
  [0n, 1n],
  [-1n, -1n],
]

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

export type CoinTally = { splits: number; determinants: number }

export const newCoinTally = (): CoinTally => ({
  splits: 0,
  determinants: 0,
})

// the coin on one branch: the list of branches it becomes
export function coinBranch(
  cells: number,
  br: Branch,
  adjoint: boolean,
  tally?: CoinTally,
): Branch[] {
  const side = adjoint ? 1 : 0
  const halves: { from: number; to: number }[] = []

  for (let x = 0; x < cells; x++) {
    const base = x * 24

    for (let l = 0; l < 12; l++) {
      const i = base + LINE_FIRSTS[l]!
      const j = base + LINE_SECONDS[l]!
      const hi = br.vibe[i] !== 0
      const hj = br.vibe[j] !== 0

      if (hi && hj) {
        if (br.open[i] && br.open[j]) {
          const [u, v] = DET[side]!

          times(br, u, v)

          if (tally) {
            tally.determinants++
          }
        }

        continue
      }

      if (hi && br.open[i]) {
        halves.push({ from: i, to: j })
      } else if (hj && br.open[j]) {
        halves.push({ from: j, to: i })
      }
    }
  }

  if (halves.length === 0) {
    return [br]
  }

  if (halves.length > 20) {
    throw new Error(
      `coined-locked-knit: ${halves.length} half-full open lines in one branch, over the guard 20`,
    )
  }

  if (tally) {
    tally.splits += halves.length
  }

  const [ku, kv] = KEEP[side]!
  const [cu, cv] = CROSS[side]!
  const out: Branch[] = []

  for (let mask = 0; mask < 1 << halves.length; mask++) {
    const b = cloneBranch(br)

    halves.forEach((h, n) => {
      if ((mask >> n) & 1) {
        b.vibe[h.to] = b.vibe[h.from]!
        b.point[h.to] = b.point[h.from]!
        b.open[h.to] = b.open[h.from]!
        b.vibe[h.from] = 0
        b.point[h.from] = 0
        b.open[h.from] = 0
        times(b, cu, cv)
      } else {
        times(b, ku, kv)
      }
    })

    b.k += halves.length
    out.push(b)
  }

  return out
}

// the order of fermion modes: dock-major, and in a dock line by line, the first slot before the second
export function modeIndex(slot: number): number {
  const d = slot % 24

  return slot - d + 2 * LINE_OF[d]! + (SIDE[d] === 1 ? 0 : 1)
}

const PERM = new Int32Array(24)
const VIBE = new Int8Array(24)

// the parity (+1 or -1) of the permutation the collision and stream of beat t give the occupied modes of a
// configuration (its occupation, which the meeting keeps)
export function fermionSign(t: LockedTables, br: Branch): number {
  for (let s = 0; s < br.store.length; s++) {
    if (br.store[s] !== 0) {
      throw new Error(
        'coined-locked-knit: the fermion sign is not written for a configuration holding a store',
      )
    }
  }

  const from: number[] = []
  const to: number[] = []

  let kindSeen = 0

  for (let x = 0; x < t.cells; x++) {
    const base = x * 24

    let held = 0

    for (let d = 0; d < 24; d++) {
      const v = br.vibe[base + d]!

      VIBE[d] = v

      if (v !== 0) {
        held++

        if (kindSeen === 0) {
          kindSeen = v
        } else if (v !== kindSeen) {
          throw new Error(
            'coined-locked-knit: the fermion sign is not written for a configuration holding loves and fears',
          )
        }
      }
    }

    if (held === 0) {
      continue
    }

    const kind = bouncePermutation(
      BOUNCE_TABLE,
      t.collision,
      VIBE,
      0,
      PERM,
    )

    for (let d = 0; d < 24; d++) {
      if (VIBE[d] === 0) {
        continue
      }

      const after = kind === 0 ? d : PERM[d]!

      from.push(modeIndex(base + d))
      to.push(modeIndex(t.target[base + after]!))
    }
  }

  // parity of the sequence `to` read in the order of `from`
  const order = from
    .map((_, i) => i)
    .sort((p, q) => from[p]! - from[q]!)
  const seq = order.map(i => to[i]!)

  let inversions = 0

  for (let p = 0; p < seq.length; p++) {
    for (let q = p + 1; q < seq.length; q++) {
      if (seq[p]! > seq[q]!) {
        inversions++
      }
    }
  }

  return inversions % 2 === 0 ? 1 : -1
}

function signed(t: LockedTables, s: LockedState): LockedState {
  for (const b of s.branches) {
    if (fermionSign(t, b) < 0) {
      b.a = -b.a
      b.b = -b.b
    }
  }

  return s
}

export function coinedBeat(
  t: LockedTables,
  s: LockedState,
  beat: number,
  options: CoinOptions,
  tally?: LockedTally,
  coinTally?: CoinTally,
): LockedState {
  const coined: Branch[] = []

  for (const br of s.branches) {
    coined.push(
      ...coinBranch(t.cells, cloneBranch(br), false, coinTally),
    )
  }

  let mid: LockedState = { branches: mergeBranches(coined) }

  if (options.fermion) {
    mid = signed(t, mid)
  }

  return lockedBeat(t, mid, beat, tally)
}

// THE COIN ON THE NO-VETO STORE (E-RLT-0104, E-RLT-0105): the same composition with the beat of code/rule/
// occupation-veto-knit (a chosen veto, 'none' for the working vacuum) in place of the locked knit's, so the coin, then
// the meetings, the veto's collision and the stream. No fermion sign: it is not written for a configuration holding a
// store (fermionSign refuses), so this is the configuration code plus the coin ('native' in E-SPN-0091).
export function coinedVetoBeat(
  kind: VetoKind,
  t: LockedTables,
  s: LockedState,
  beat: number,
  tally?: LockedTally,
  coinTally?: CoinTally,
): LockedState {
  const coined: Branch[] = []

  for (const br of s.branches) {
    coined.push(
      ...coinBranch(t.cells, cloneBranch(br), false, coinTally),
    )
  }

  return vetoBeat(
    kind,
    t,
    { branches: mergeBranches(coined) },
    beat,
    tally,
  )
}

export function coinedVetoBeatBack(
  kind: VetoKind,
  t: LockedTables,
  s: LockedState,
  beat: number,
): LockedState {
  const out: Branch[] = []

  for (const br of vetoBeatBack(kind, t, s, beat).branches) {
    out.push(...coinBranch(t.cells, cloneBranch(br), true))
  }

  return { branches: mergeBranches(out) }
}

// ---- the frame mixer ----
//
// THE FRAME MIXER (E-SPN-0094, E-SPN-0095): the one piece that lets a vibe change its line. E-SPN-0094 classifies the
// covariant unitaries on a dock's single-vibe space with entries in Z[w][1/2]: none reaches a line at inner product
// +-1, and the ones that mix lines move a vibe only to the six slots orthogonal to its root, the other three lines of
// its FRAME (four mutually orthogonal lines, three frames a dock). The simplest is G = I - 2 |u><u| on each frame, u
// the frame's uniform vector: a vibe on slot s is kept with 3/4 and taken to each of the other seven slots of its frame
// with -1/4 (the opposite slot and the six orthogonal ones). G is real, an involution, and its own adjoint.
//
// AS THE COIN IS ADDED, ON A LONE VIBE: it acts on a frame of a dock holding exactly one vibe, open, and seven empty
// slots; every other frame is untouched (a frame of two or more vibes, a closed vibe, stores). The condition is kept by
// G and by every W(F4) map, so the piece is unitary and covariant. The frame slot q = 2 (the line's place in its frame)
// + (0 first slot, 1 second), so the target of outcome o (0 to 7) is q XOR o: o = 0 keeps, o = 1 is the opposite slot,
// o = 2 to 7 the six orthogonal ones, and each outcome is an involution of the frame's slots.
//
// NOTHING MOVES: the vibe's value, point and open bit are taken by another slot of its own frame on its own dock.

const ROOTS = rootsD4()
const dotRoots = (d: number, e: number): number =>
  ROOTS[d]!.reduce((s, x, k) => s + x * ROOTS[e]![k]!, 0)

function frameTables(): {
  lines: number[][]
  slots: number[][]
  frameOfSlot: number[]
  frameOfLine: number[]
} {
  const lines: number[][] = []
  const seen = new Set<number>()

  for (let l = 0; l < 12; l++) {
    if (seen.has(l)) {
      continue
    }

    const frame = [l]

    for (let m = l + 1; m < 12; m++) {
      if (
        frame.every(
          n => dotRoots(LINE_FIRSTS[n]!, LINE_FIRSTS[m]!) === 0,
        )
      ) {
        frame.push(m)
      }
    }

    frame.forEach(m => seen.add(m))
    lines.push(frame)
  }

  if (lines.length !== 3 || lines.some(f => f.length !== 4)) {
    throw new Error(
      'coined-locked-knit: the lines do not fall into three frames of four',
    )
  }

  const slots = lines.map(f =>
    f.flatMap(m => [LINE_FIRSTS[m]!, LINE_SECONDS[m]!]),
  )
  const frameOfSlot = new Array<number>(24).fill(-1)
  const frameOfLine = new Array<number>(12).fill(-1)

  slots.forEach((ss, f) => ss.forEach(d => (frameOfSlot[d] = f)))
  lines.forEach((ls, f) => ls.forEach(l => (frameOfLine[l] = f)))

  return { lines, slots, frameOfSlot, frameOfLine }
}

const FRAMES = frameTables()

// the three frames' lines (in line order) and slots (frame slot q = 2 place + side), and each slot's and line's frame
export const FRAME_LINES: readonly (readonly number[])[] = FRAMES.lines
export const FRAME_SLOTS: readonly (readonly number[])[] = FRAMES.slots
export const FRAME_OF_SLOT: readonly number[] = FRAMES.frameOfSlot
export const FRAME_OF_LINE: readonly number[] = FRAMES.frameOfLine

export type MixTally = { mixes: number }

export const newMixTally = (): MixTally => ({ mixes: 0 })

// the lone frames of a configuration: every (dock, frame) holding exactly one vibe, open, with its frame slot
export function loneFrames(
  cells: number,
  c: Configuration,
): { base: number; frame: number; q: number }[] {
  const out: { base: number; frame: number; q: number }[] = []

  for (let x = 0; x < cells; x++) {
    const base = x * 24

    for (let f = 0; f < 3; f++) {
      const ss = FRAME_SLOTS[f]!

      let held = 0
      let at = -1

      for (let q = 0; q < 8; q++) {
        if (c.vibe[base + ss[q]!] !== 0) {
          held++
          at = q
        }
      }

      if (held === 1 && c.open[base + ss[at]!]) {
        out.push({ base, frame: f, q: at })
      }
    }
  }

  return out
}

// G on one branch: the list of branches it becomes (keep 3/4, each of the other seven frame slots -1/4)
export function mixBranch(
  cells: number,
  br: Branch,
  tally?: MixTally,
): Branch[] {
  const lone = loneFrames(cells, br)

  if (lone.length === 0) {
    return [br]
  }

  if (lone.length > 4) {
    throw new Error(
      `coined-locked-knit: ${lone.length} lone frames in one branch, over the guard 4`,
    )
  }

  if (tally) {
    tally.mixes += lone.length
  }

  const out: Branch[] = []

  for (let code = 0; code < 8 ** lone.length; code++) {
    const b = cloneBranch(br)

    let rest = code

    for (const { base, frame, q } of lone) {
      const o = rest % 8
      const ss = FRAME_SLOTS[frame]!

      rest = (rest - o) / 8

      if (o === 0) {
        times(b, 3n, 0n)
        continue
      }

      const from = base + ss[q]!
      const to = base + ss[q ^ o]!

      b.vibe[to] = b.vibe[from]!
      b.point[to] = b.point[from]!
      b.open[to] = b.open[from]!
      b.vibe[from] = 0
      b.point[from] = 0
      b.open[from] = 0
      times(b, -1n, 0n)
    }

    b.k += 2 * lone.length
    out.push(b)
  }

  return out
}

// THE WORKING VACUUM WITH THE FRAME MIXER: G, then the coin, then the no-veto beat (coinedVetoBeat). The inverse: the
// coined inverse, then G (its own adjoint). With `coin` false the coin is left out (the mixer alone, a control).
export function mixedVetoBeat(
  kind: VetoKind,
  t: LockedTables,
  s: LockedState,
  beat: number,
  tally?: LockedTally,
  coinTally?: CoinTally,
  mixTally?: MixTally,
  coin = true,
): LockedState {
  const mixed: Branch[] = []

  for (const br of s.branches) {
    mixed.push(...mixBranch(t.cells, cloneBranch(br), mixTally))
  }

  const state: LockedState = { branches: mergeBranches(mixed) }

  return coin
    ? coinedVetoBeat(kind, t, state, beat, tally, coinTally)
    : vetoBeat(kind, t, state, beat, tally)
}

export function mixedVetoBeatBack(
  kind: VetoKind,
  t: LockedTables,
  s: LockedState,
  beat: number,
  coin = true,
): LockedState {
  const back = coin
    ? coinedVetoBeatBack(kind, t, s, beat)
    : vetoBeatBack(kind, t, s, beat)
  const out: Branch[] = []

  for (const br of back.branches) {
    out.push(...mixBranch(t.cells, cloneBranch(br)))
  }

  return { branches: mergeBranches(out) }
}

// ---- the frame mixer lifted to a frame's whole occupation ----
//
// THE LIFT (E-SPN-0096, E-SPN-0097). G = I - 2 |u><u| on one vibe; on a frame's fermion occupation (the knit's own
// statistics: one vibe a slot, the coin's full line kept with its determinant) its second-quantized lift is
// Gamma(G) = 1 - (1/4) sum_(i, j in the frame) c_i^dag c_j = (-1)^(N_u), N_u the occupation of the frame's uniform mode.
// On a frame of n vibes: keep with (4 - n)/4, or take ONE vibe to one empty slot of the frame with -1/4 times the
// fermion sign of the hop ((-1)^(occupied modes strictly between the two slots in the knit's mode order, modeIndex)).
// No term moves two vibes (u ^ u = 0), so a moving vibe takes its value, point and open bit with it. n = 1 is G itself;
// n = 4 is never kept; a full frame is kept with -1.
//
// WHERE IT ACTS: every frame whose vibes are all open and all carry ONE content (value and point). E-SPN-0096: on a
// frame of two contents the content-carrying lift is not unitary, the species-by-species lift leaves the knit's space
// (two vibes on one slot) and the unitary rank-labelled lift is not covariant, so a frame of two contents (the
// vacuum's love and fear, or two loves of unequal points) and a frame with a closed vibe are left alone. The condition
// is kept by the lift (it moves one vibe inside its frame) and by every W(F4) map.
//
// NOTHING MOVES: a vibe's value, point and open bit are taken by an empty slot of its own frame on its own dock.

export type LiftFrame = { base: number; frame: number; held: number[] }

export type LiftTally = { lifts: number; hops: number }

export const newLiftTally = (): LiftTally => ({ lifts: 0, hops: 0 })

// the frames the lift acts on: every (dock, frame) holding at least one vibe, all open, all of one value and point,
// with the frame slots q it holds
export function liftFrames(
  cells: number,
  c: Configuration,
): LiftFrame[] {
  const out: LiftFrame[] = []

  for (let x = 0; x < cells; x++) {
    const base = x * 24

    for (let f = 0; f < 3; f++) {
      const ss = FRAME_SLOTS[f]!
      const held: number[] = []

      let acts = true

      for (let q = 0; q < 8 && acts; q++) {
        const i = base + ss[q]!

        if (c.vibe[i] === 0) {
          continue
        }

        if (!c.open[i]) {
          acts = false
        } else if (held.length > 0) {
          const j = base + ss[held[0]!]!

          if (c.vibe[i] !== c.vibe[j] || c.point[i] !== c.point[j]) {
            acts = false
          }
        }

        held.push(q)
      }

      if (acts && held.length > 0) {
        out.push({ base, frame: f, held })
      }
    }
  }

  return out
}

// the fermion sign of taking the vibe on `from` to the empty `to` of one dock: (-1)^(occupied modes strictly between)
export function hopSign(
  c: Configuration,
  base: number,
  from: number,
  to: number,
): number {
  const a = modeIndex(from)
  const b = modeIndex(to)
  const lo = Math.min(a, b)
  const hi = Math.max(a, b)

  let between = 0

  for (let d = 0; d < 24; d++) {
    if (c.vibe[base + d] === 0) {
      continue
    }

    const m = modeIndex(base + d)

    if (m > lo && m < hi) {
      between++
    }
  }

  return between % 2 === 0 ? 1 : -1
}

// Gamma(G) on one branch: the list of branches it becomes
export function liftBranch(
  cells: number,
  br: Branch,
  tally?: LiftTally,
): Branch[] {
  const frames = liftFrames(cells, br)

  if (frames.length === 0) {
    return [br]
  }

  if (tally) {
    tally.lifts += frames.length
  }

  let branches: Branch[] = [br]

  for (const { base, frame, held } of frames) {
    const ss = FRAME_SLOTS[frame]!
    const n = held.length
    const next: Branch[] = []

    for (const b of branches) {
      if (n !== 4) {
        const k = cloneBranch(b)

        times(k, BigInt(4 - n), 0n)
        k.k += 2
        next.push(k)
      }

      for (const q of held) {
        for (let r = 0; r < 8; r++) {
          if (held.includes(r)) {
            continue
          }

          const from = base + ss[q]!
          const to = base + ss[r]!
          const k = cloneBranch(b)
          const sign = hopSign(k, base, from, to)

          k.vibe[to] = k.vibe[from]!
          k.point[to] = k.point[from]!
          k.open[to] = k.open[from]!
          k.vibe[from] = 0
          k.point[from] = 0
          k.open[from] = 0
          times(k, BigInt(-sign), 0n)
          k.k += 2
          next.push(k)

          if (tally) {
            tally.hops++
          }
        }
      }
    }

    branches = next

    if (branches.length > 1 << 18) {
      throw new Error(
        `coined-locked-knit: the lift makes ${branches.length} branches of one, over the guard 2^18`,
      )
    }
  }

  return branches
}

// THE WORKING VACUUM WITH THE LIFTED MIXER: Gamma(G), then the coin, then the no-veto beat. The inverse: the coined
// inverse, then Gamma(G) (real, symmetric, an involution: its own adjoint).
export function liftedVetoBeat(
  kind: VetoKind,
  t: LockedTables,
  s: LockedState,
  beat: number,
  tally?: LockedTally,
  coinTally?: CoinTally,
  liftTally?: LiftTally,
): LockedState {
  const lifted: Branch[] = []

  for (const br of s.branches) {
    lifted.push(...liftBranch(t.cells, cloneBranch(br), liftTally))
  }

  return coinedVetoBeat(
    kind,
    t,
    { branches: mergeBranches(lifted) },
    beat,
    tally,
    coinTally,
  )
}

export function liftedVetoBeatBack(
  kind: VetoKind,
  t: LockedTables,
  s: LockedState,
  beat: number,
): LockedState {
  const out: Branch[] = []

  for (const br of coinedVetoBeatBack(kind, t, s, beat).branches) {
    out.push(...liftBranch(t.cells, cloneBranch(br)))
  }

  return { branches: mergeBranches(out) }
}

export function coinedBeatBack(
  t: LockedTables,
  s: LockedState,
  beat: number,
  options: CoinOptions,
): LockedState {
  let back = lockedBeatBack(t, s, beat)

  if (options.fermion) {
    back = signed(t, back)
  }

  const out: Branch[] = []

  for (const br of back.branches) {
    out.push(...coinBranch(t.cells, cloneBranch(br), true))
  }

  return { branches: mergeBranches(out) }
}
