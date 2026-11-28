// THE LOCKED MIXER (future-models.md, new base possibility 5, "locks"). Opt-in only:
// adopting it is the author's base change.
//
// THE QUESTION. The F-G frame mixer (E-FRC-0321's motion pick) moves a lone vibe off its line, but it drains B1's line
// self in one to two beats (E-SLF-0185). A kinetic constraint lets a piece fire only where matter opens it, as the ODD
// piece fires only on dense docks. Here the mixer is locked to an occupied neighbour: does the self keep, does the
// empty vacuum stay exactly still, and does a lone body still move past sqrt 2?
//
// THE LOCK. LF-G = the product over docks x of G_x^o(x): G_x is G on the lone frames of dock x (mixBranch restricted to
// x), o(x) = 1 iff some facet neighbour of x holds a vibe or a nonzero store trit. G_x keeps every dock's vibes count
// and store, so it keeps every o; the G_x of different docks act on different docks and commute; so in each occupation
// sector LF-G is a product of commuting involutions. It is exactly unitary and its own inverse, and the beat U LF-G
// (U the working split beat) inverts as LF-G U^-1. The lock reads all 24 facets, so it is covariant. Which neighbour
// opens it stays the author's call; this is the symmetric any-neighbour lock.
//
// THE INSTRUMENTS. (1) The exact balls (branch code, Z[w][1/2]): X1 reversal, V0 the empty vacuum, V1 a lone love,
// X2L the lock's on-line block. (2) A pair sparse engine on the exact R = 4 ball (one-vibe kernels and the two-vibe
// same-dock kernel read from the code, gated against the branch code, K1P): a comoving pair of loves, the smallest
// body that can open its own locks, read in the cusp chart for its weight past sqrt 2. (3) The line engine
// (code/measure/cone-line lockedMixPass): B1's cluster with the locked block, honeycomb-exact to beat 2 by Lemma W
// (note/line-confinement.md section 4; the lock of a configuration with every vibe on l reads l alone), then the line
// engine's P part to beat 120, a stated projection.
//
// GATES, fixed in the item's what before this file existed (gate 0544fd5a3add, 2026-11-17T07:44:56Z).
//
// PREDICTION (before the first run): every instrument gate holds; a lone love is frozen to its line; the pair moves
// (W_off at beat 3 between 1e-3 and 2e-2); the self does not keep (locked L(2) between 0.22 and 0.45, tau_self < 5,
// L(80) < 0.01); verdict fail.
//
// FULL RUN (M3, 2026-11-17, clone locked-mixer, 593 s, gate 0544fd5a3add): FAIL by the registered bar. Every instrument
// gate holds (K1P diff 6.2e-17, B0 g off 4e-4 rate 0.0433, U0 L(2) 0.2214). The pair moves: W_off 0.0078 0.0067 0.0064,
// msd 0.334 0.310 0.389 (bare W_off 0). The self's L equals the bare rule's (0.9167, 0.9589; 0.949 at beat 80, 0.939 at
// 120), so tau_self 24.3 is bare's and the S clause tau_self >= 80 fails; the prediction for L (0.22 to 0.45) was wrong.
// The excess goes faster than bare (g(2) 0.44 against 0.87): the bath loves beside the cluster open locks and leave.
//
// SETTINGS. Default SMOKE (box 8, W 10, bare to beat 4, locked to beat 20, the R = 3 ball, pair beats 2; seconds).
// LOCKED_SWEEP=full for a large machine (box 12, W 12 k 3 starts 0 1 2, bare to beat 11, locked to beat 120 at cap 1.5e8,
// the R = 4 ball, pair beats 3).
//
// Depth L2: the ball pieces exact; B1's line rule in floats on one line with the locked block from the exact code.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { lineBasis, lineLightest, wholeBasis } from '@/code/measure/coined-line-bloch'
import { fitRing, levelPlacement } from '@/code/measure/held-cluster'
import type { Placed } from '@/code/measure/held-cluster'
import { bathLoves, lineReader, type Coin, type LineReader } from '@/code/measure/cold-line'
import {
  ConeCap,
  coneBeat,
  coneBoundCount,
  coneNorm,
  coneStart,
  coneStore,
  lockedMixPass,
  mixPass,
  type ConeStore,
} from '@/code/measure/cone-line'
import {
  cloneConfiguration,
  lockedNorm,
  lockedState,
  mergeBranches,
  times,
  type Branch,
  type Configuration,
  type LockedState,
} from '@/code/rule/doublet-locked-knit'
import {
  FRAME_SLOTS,
  coinedVetoBeatBack,
  currentCoinPlace,
  loneFrames,
  setCoinPlace,
} from '@/code/rule/coined-locked-knit'
import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'
import {
  BARE,
  MIXERS,
  chartBall,
  keyOf,
  mixerBeat,
  readKernel,
  smallBall,
  sparseBeat,
  type Amplitudes,
  type Chart,
  type Kernel,
  type Mixer,
  type SmallBall,
} from '@/test/experiment/gauge/mixer-link-select'

const SLOTS = 24
const SQ3 = Math.sqrt(3)
const OFF_LINE = Math.SQRT2 + 1e-9
const SUPPORT_TOL = 1e-14
const AMP_TOL = 1e-12
const BLOCK_TOL = 1e-15
const CONTROL_TOL = 1e-12
const UNIT_TOL = 1e-9
const NORM_TOL = 1e-10
const MOTION_FLOOR = 1e-3

const RECORDED = { energy: 0.33001851839229945 }

// 0019's open g at W 12 k 3, beats 0 to 11 (grounding log, 2026-11-15), its loss rate, and E-SLF-0185's F-G L(2)
const G_0019 = [
  1.017, 0.872, 0.872, 0.695, 0.705, 0.582, 0.6, 0.52, 0.563, 0.518, 0.544, 0.541,
]
const RATE_0019 = 0.0433
const L2_0185 = 0.221
const G_TOL = 6e-4
const RATE_TOL = 5e-4
const L2_TOL = 1e-3
const HOLD = 0.9
const HALF = 0.5
const TAU_BAR = 80
const KEEP_AT = 80
const WINDOW = 2

const D0 = LINE_FIRSTS[0]!
const D0_BACK = OPPOSITE[D0]!
const FG = MIXERS.find(m => m.name === 'F-G')!

// F-G's on-line block (note/line-confinement.md section 4)
const FG_LONE: Coin = [
  [0.75, 0],
  [-0.25, 0],
]
const FG_FULL: [number, number] = [1, 0]

// ---- the locked mixer on branches ----

const cloneBranch = (b: Branch): Branch => ({ ...cloneConfiguration(b), a: b.a, b: b.b, k: b.k })

// LF-G on one branch: G on each lone frame of a dock with an occupied facet neighbour (table: dock x 24 + facet to
// the neighbour, -1 off the ball). Its own inverse
export function lockedMixBranch(cells: number, br: Branch, table: Int32Array): Branch[] {
  const held = new Uint8Array(cells)

  for (let x = 0; x < cells; x++) {
    for (let d = 0; d < 24 && !held[x]; d++) {
      if (br.vibe[x * 24 + d] !== 0) {
        held[x] = 1
      }
    }

    for (let s = 0; s < 12 && !held[x]; s++) {
      if (br.store[x * 12 + s] !== 0) {
        held[x] = 1
      }
    }
  }

  const lone = loneFrames(cells, br).filter(f => {
    const x = f.base / 24

    for (let d = 0; d < 24; d++) {
      const y = table[x * 24 + d]!

      if (y >= 0 && held[y]) {
        return true
      }
    }

    return false
  })

  if (lone.length === 0) {
    return [br]
  }

  if (lone.length > 4) {
    throw new Error(`locked-mixer: ${lone.length} unlocked lone frames in one branch, over the guard 4`)
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

const lockedMixer = (table: Int32Array): Mixer => ({
  name: 'LF-G',
  mix: (cells, br) => lockedMixBranch(cells, br, table),
  scale: 1n,
})

function backBeat(m: Mixer, ball: SmallBall, s: LockedState, beat: number): LockedState {
  const back = coinedVetoBeatBack('none', ball.tables, s, beat)

  return { branches: mergeBranches(back.branches.flatMap(b => m.mix(ball.cells, cloneBranch(b)))) }
}

function empty(cells: number): Configuration {
  return {
    vibe: new Int8Array(cells * 24),
    point: new Int8Array(cells * 24),
    open: new Uint8Array(cells * 24),
    store: new Int8Array(cells * 12),
    spoint: new Int8Array(cells * 12),
    sopen: new Uint8Array(cells * 12),
  }
}

// open loves of point 0 on the given (dock, slot)s
function loves(cells: number, at: readonly (readonly [number, number])[]): Configuration {
  const c = empty(cells)

  for (const [x, d] of at) {
    c.vibe[x * 24 + d] = 1
    c.open[x * 24 + d] = 1
  }

  return c
}

// the branches of `a` minus `b`, merged: empty exactly when a = b
function differ(a: readonly Branch[], b: readonly Branch[]): number {
  const neg = b.map(x => {
    const y = cloneBranch(x)

    y.a = -x.a
    y.b = -x.b

    return y
  })

  return mergeBranches([...a.map(cloneBranch), ...neg]).length
}

// n / d as a float, for big exact integers
function ratio(n: bigint, d: bigint): number {
  if (n === 0n) {
    return 0
  }

  const neg = n < 0n
  const q = ((neg ? -n : n) << 160n) / d

  return ((neg ? -1 : 1) * Number(q)) / 2 ** 160
}

const valueOf = (b: Branch): [number, number] => {
  const den = 1n << BigInt(b.k)
  const A = ratio(b.a, den)
  const B = ratio(b.b, den)

  return [A - B / 2, (B * SQ3) / 2]
}

// ---- X1, V0, V1, X2L ----

type Reversal = { start: string; beats: number; equal: boolean; norm: boolean; branches: number }

function reversal(ball: SmallBall, name: string, c: Configuration, beats: number): Reversal {
  const m = lockedMixer(ball.table)

  let s = lockedState(c)
  let branches = 0

  for (let t = 0; t < beats; t++) {
    s = mixerBeat(m, ball.tables, s, t)
    branches = Math.max(branches, s.branches.length)
  }

  const n = lockedNorm(s)
  const norm = n.total === n.unit

  for (let t = beats - 1; t >= 0; t--) {
    s = backBeat(m, ball, s, t)
  }

  return { start: name, beats, equal: differ(s.branches, lockedState(c).branches) === 0, norm, branches }
}

type Block = { case: string; off: number; extra: number }

function lockBlocks(ball: SmallBall): Block[] {
  const m = lockedMixer(ball.table)
  const y = ball.table[D0]!
  const z = ball.table[y * 24 + D0]!
  const onL = new Uint8Array(ball.cells * 24)

  for (const dir of [D0, D0_BACK]) {
    let x = 0

    while (x >= 0) {
      onL[x * 24 + D0] = 1
      onL[x * 24 + D0_BACK] = 1
      x = ball.table[x * 24 + dir]!
    }
  }

  const k = FG_LONE[0][0]
  const h = FG_LONE[1][0]
  const cases: { name: string; at: [number, number][]; want: { at: number[]; v: number }[] }[] = [
    { name: 'lone', at: [[0, D0]], want: [{ at: [D0], v: 1 }] },
    {
      name: 'adjacent',
      at: [
        [0, D0],
        [y, D0],
      ],
      want: [
        { at: [D0, y * 24 + D0], v: k * k },
        { at: [D0_BACK, y * 24 + D0], v: h * k },
        { at: [D0, y * 24 + D0_BACK], v: k * h },
        { at: [D0_BACK, y * 24 + D0_BACK], v: h * h },
      ],
    },
    {
      name: 'two apart',
      at: [
        [0, D0],
        [z, D0],
      ],
      want: [{ at: [D0, z * 24 + D0], v: 1 }],
    },
  ]

  return cases.map(cs => {
    const out = mergeBranches(m.mix(ball.cells, lockedState(loves(ball.cells, cs.at)).branches[0]!))
    const seen = new Set<number>()

    let off = 0
    let extra = 0

    for (const b of out) {
      const at: number[] = []
      let on = true

      for (let i = 0; i < b.vibe.length; i++) {
        if (b.vibe[i] !== 0) {
          at.push(i)
          on &&= onL[i] === 1
        }
      }

      if (!on) {
        continue
      }

      const key = [...at].sort((p, q) => p - q).join(',')
      const row = cs.want.findIndex(w => [...w.at].sort((p, q) => p - q).join(',') === key)

      if (row < 0) {
        extra++
        continue
      }

      seen.add(row)

      const [vr, vi] = valueOf(b)

      off = Math.max(off, Math.hypot(vr - cs.want[row]!.v, vi))
    }

    cs.want.forEach((w, row) => {
      if (!seen.has(row)) {
        off = Math.max(off, Math.abs(w.v))
      }
    })

    return { case: cs.name, off, extra }
  })
}

// ---- the pair sparse engine ----

const unkey = (key: number): { dock: number; slot: number; point: number; open: number } => {
  const open = key % 2
  const rest = (key - open) / 2
  const p = rest % 64
  const ds = (rest - p) / 64

  return { dock: Math.floor(ds / SLOTS), slot: ds % SLOTS, point: p - 32, open }
}

type Pairs = Map<number, Map<number, [number, number]>>

type Tally = { frontier: number; exceptions: number }

function addPair(st: Pairs, k1: number, k2: number, re: number, im: number, tally: Tally): void {
  if (k1 === k2) {
    tally.exceptions++
    return
  }

  const [p, q] = k1 < k2 ? [k1, k2] : [k2, k1]
  let row = st.get(p)

  if (!row) {
    row = new Map()
    st.set(p, row)
  }

  const old = row.get(q) ?? [0, 0]

  row.set(q, [old[0] + re, old[1] + im])
}

type TwoOut = {
  dir: [number, number]
  slot: [number, number]
  point: [number, number]
  open: [number, number]
  re: number
  im: number
}

type TwoKernel = { get: (beat: number, a: number, b: number) => TwoOut[]; exceptions: () => number }

// the two-vibe same-dock kernel, read from the member's code on the base dock of the small ball (a, b: vibe keys on
// dock 0)
function readTwoKernel(m: Mixer, ball: SmallBall): TwoKernel {
  const cache = new Map<string, TwoOut[]>()
  const dirOf = new Map<number, number>()
  const tally = { exceptions: 0 }

  for (let e = 0; e < SLOTS; e++) {
    dirOf.set(ball.table[e]!, e)
  }

  return {
    get(beat, a, b) {
      const id = `${beat}:${a}:${b}`
      const hit = cache.get(id)

      if (hit) {
        return hit
      }

      const c = empty(ball.cells)

      for (const k of [a, b]) {
        const u = unkey(k)

        c.vibe[u.slot] = 1
        c.point[u.slot] = u.point
        c.open[u.slot] = u.open
      }

      const outs: TwoOut[] = []

      for (const [k1, k2, re, im] of pairsOf(mixerBeat(m, ball.tables, lockedState(c), beat), tally)) {
        const u1 = unkey(k1)
        const u2 = unkey(k2)
        const d1 = u1.dock === 0 ? -1 : (dirOf.get(u1.dock) ?? -2)
        const d2 = u2.dock === 0 ? -1 : (dirOf.get(u2.dock) ?? -2)

        if (d1 === -2 || d2 === -2) {
          tally.exceptions++
          continue
        }

        outs.push({
          dir: [d1, d2],
          slot: [u1.slot, u2.slot],
          point: [u1.point, u2.point],
          open: [u1.open, u2.open],
          re,
          im,
        })
      }

      cache.set(id, outs)

      return outs
    },
    exceptions: () => tally.exceptions,
  }
}

// the branch code's two-vibe state as (key, key, re, im), merged; a branch not of two loves and no store is an exception
function pairsOf(s: LockedState, tally: { exceptions: number }): [number, number, number, number][] {
  const out: [number, number, number, number][] = []

  for (const b of s.branches) {
    const held: number[] = []

    for (let i = 0; i < b.vibe.length; i++) {
      if (b.vibe[i] !== 0) {
        held.push(i)
      }
    }

    if (held.length !== 2 || held.some(i => b.vibe[i] !== 1) || !b.store.every(v => v === 0)) {
      tally.exceptions++
      continue
    }

    const [re, im] = valueOf(b)
    const keys = held.map(i => keyOf(Math.floor(i / 24), i % 24, b.point[i]!, b.open[i]!))

    out.push([keys[0]!, keys[1]!, re, im])
  }

  return out
}

function pairsMap(s: LockedState, tally: Tally): Pairs {
  const st: Pairs = new Map()

  for (const [k1, k2, re, im] of pairsOf(s, tally)) {
    addPair(st, k1, k2, re, im, tally)
  }

  return st
}

type PairRule = { open: Kernel; shut: Kernel; two: TwoKernel }

function adjacent(table: Int32Array, x: number, y: number): boolean {
  for (let e = 0; e < SLOTS; e++) {
    if (table[x * SLOTS + e] === y) {
      return true
    }
  }

  return false
}

// one beat of the pair engine on a table
function pairBeat(rule: PairRule, table: Int32Array, st: Pairs, beat: number, tally: Tally): Pairs {
  const next: Pairs = new Map()
  const at = (x: number, dir: number): number => (dir < 0 ? x : table[x * SLOTS + dir]!)

  for (const [k1, row] of st) {
    const u1 = unkey(k1)

    for (const [k2, [re, im]] of row) {
      const u2 = unkey(k2)

      if (u1.dock === u2.dock) {
        const a = keyOf(0, u1.slot, u1.point, u1.open)
        const b = keyOf(0, u2.slot, u2.point, u2.open)

        for (const o of rule.two.get(beat, Math.min(a, b), Math.max(a, b))) {
          const y1 = at(u1.dock, o.dir[0])
          const y2 = at(u1.dock, o.dir[1])

          if (y1 < 0 || y2 < 0) {
            tally.frontier++
            continue
          }

          addPair(
            next,
            keyOf(y1, o.slot[0], o.point[0], o.open[0]),
            keyOf(y2, o.slot[1], o.point[1], o.open[1]),
            re * o.re - im * o.im,
            re * o.im + im * o.re,
            tally,
          )
        }

        continue
      }

      const k = adjacent(table, u1.dock, u2.dock) ? rule.open : rule.shut
      const o1s = k.get(beat, u1.slot, u1.point, u1.open)
      const o2s = k.get(beat, u2.slot, u2.point, u2.open)

      for (const o1 of o1s) {
        const y1 = at(u1.dock, o1.dir)
        const r1 = re * o1.re - im * o1.im
        const i1 = re * o1.im + im * o1.re

        for (const o2 of o2s) {
          const y2 = at(u2.dock, o2.dir)

          if (y1 < 0 || y2 < 0) {
            tally.frontier++
            continue
          }

          addPair(
            next,
            keyOf(y1, o1.slot, o1.point, o1.open),
            keyOf(y2, o2.slot, o2.point, o2.open),
            r1 * o2.re - i1 * o2.im,
            r1 * o2.im + i1 * o2.re,
            tally,
          )
        }
      }
    }
  }

  return next
}

function comparePairs(a: Pairs, b: Pairs): { diff: number; mismatches: number } {
  let diff = 0
  let mismatches = 0

  const visit = (x: Pairs, y: Pairs, both: boolean): void => {
    for (const [k1, row] of x) {
      for (const [k2, v] of row) {
        const w = y.get(k1)?.get(k2)

        if (w && !both) {
          continue
        }

        const u = w ?? [0, 0]

        diff = Math.max(diff, Math.hypot(v[0] - u[0], v[1] - u[1]))

        if (Math.hypot(...v) > SUPPORT_TOL !== Math.hypot(...u) > SUPPORT_TOL) {
          mismatches++
        }
      }
    }
  }

  visit(a, b, true)
  visit(b, a, false)

  return { diff, mismatches }
}

type PairCheck = { diff: number; mismatches: number; runs: number; exceptions: number; frontier: number }

// K1P: the pair engine against the branch code on the small ball
function pairCheck(rule: PairRule, m: Mixer, ball: SmallBall, beatsMax: number): PairCheck {
  let diff = 0
  let mismatches = 0
  let runs = 0

  const tally: Tally = { frontier: 0, exceptions: 0 }
  const run = (c: Configuration, first: number, beats: number): void => {
    let s = lockedState(c)
    let p = pairsMap(s, tally)

    for (let t = first; t < first + beats; t++) {
      s = mixerBeat(m, ball.tables, s, t)
      p = pairBeat(rule, ball.table, p, t, tally)
    }

    const got = comparePairs(pairsMap(s, tally), p)

    diff = Math.max(diff, got.diff)
    mismatches += got.mismatches
    runs++
  }

  for (let d = 0; d < SLOTS; d++) {
    for (let t = 0; t < beatsMax; t++) {
      run(loves(ball.cells, [[0, d], [ball.table[d]!, d]]), t, 1)
    }
  }

  run(loves(ball.cells, [[0, D0], [0, D0_BACK]]), 0, 2)

  return { diff, mismatches, runs, exceptions: tally.exceptions, frontier: tally.frontier }
}

// ---- the motion reads on the chart ----

type MotionBeat = { wOff: number; msd: number; norm: number; maxShadow: number }

const shadowOf = (chart: Chart, x: number): number =>
  Math.hypot(...[0, 1, 2].map(i => chart.pos[x * 3 + i]! - chart.pos[i]!))

function pairMotion(rule: PairRule, chart: Chart, beats: number, tally: Tally): MotionBeat[] {
  const sums: MotionBeat[] = Array.from({ length: beats }, () => ({ wOff: 0, msd: 0, norm: 0, maxShadow: 0 }))

  for (let d = 0; d < SLOTS; d++) {
    let st: Pairs = new Map()

    addPair(st, keyOf(0, d, 0, 1), keyOf(chart.table[d]!, d, 0, 1), 1, 0, tally)

    for (let t = 0; t < beats; t++) {
      st = pairBeat(rule, chart.table, st, t, tally)

      const r = sums[t]!

      for (const [k1, row] of st) {
        const s1 = shadowOf(chart, unkey(k1).dock)

        for (const [k2, [re, im]] of row) {
          const w = re * re + im * im
          const s2 = shadowOf(chart, unkey(k2).dock)

          r.norm += w / SLOTS
          r.msd += (w * (s1 * s1 + s2 * s2)) / 2 / SLOTS
          r.wOff += (w * ((s1 > OFF_LINE ? 1 : 0) + (s2 > OFF_LINE ? 1 : 0))) / 2 / SLOTS

          if (w > SUPPORT_TOL) {
            r.maxShadow = Math.max(r.maxShadow, s1, s2)
          }
        }
      }
    }
  }

  return sums
}

function loneMotion(kernel: Kernel, chart: Chart, beats: number, hits: { frontier: number }): MotionBeat[] {
  const sums: MotionBeat[] = Array.from({ length: beats }, () => ({ wOff: 0, msd: 0, norm: 0, maxShadow: 0 }))

  for (let slot = 0; slot < SLOTS; slot++) {
    let a: Amplitudes = new Map([[keyOf(0, slot, 0, 1), [1, 0]]])

    for (let t = 0; t < beats; t++) {
      a = sparseBeat(kernel, chart.table, a, t, hits)

      const r = sums[t]!

      for (const [key, [re, im]] of a) {
        const w = re * re + im * im
        const s = shadowOf(chart, unkey(key).dock)

        r.norm += w / SLOTS
        r.msd += (w * s * s) / SLOTS
        r.wOff += s > OFF_LINE ? w / SLOTS : 0

        if (w > SUPPORT_TOL) {
          r.maxShadow = Math.max(r.maxShadow, s)
        }
      }
    }
  }

  return sums
}

// ---- the line runs ----

type Setting = {
  name: 'smoke' | 'full'
  box: number
  levelBar: number
  W: number
  starts: number
  bareBeats: number
  longBeats: number
  cap: number
  radius: number
  pairBeats: number
}

const SMOKE: Setting = {
  name: 'smoke',
  box: 8,
  levelBar: 1e-4,
  W: 10,
  starts: 1,
  bareBeats: 4,
  longBeats: 20,
  cap: 2e6,
  radius: 3,
  pairBeats: 2,
}

const FULL: Setting = {
  name: 'full',
  box: 12,
  levelBar: 1e-9,
  W: 12,
  starts: 3,
  bareBeats: 11,
  longBeats: 120,
  cap: 1.5e8,
  radius: 4,
  pairBeats: 3,
}

const widthOf = (W: number, fit: readonly Placed[]): number =>
  W + Math.max(...fit.flatMap(p => p.ts.map(t => t[0])))

const mean = (xs: readonly number[]): number => xs.reduce((s, x) => s + x, 0) / xs.length

type Pass = ((s: ConeStore) => number) | null

type Series = { F: number[]; norm: number[]; reach: number; opened: number[] }

function series(first: ConeStore, pass: Pass, beats: number, rd: LineReader): Series {
  let a = first
  let b = coneStore(a.n, a.line, a.cap)

  const F = [coneBoundCount(a, rd)]
  const norm = [coneNorm(a)]
  const opened: number[] = []

  let reach = 0

  for (let t = 1; t <= beats; t++) {
    if (pass) {
      opened.push(pass(a))
    }

    try {
      coneBeat(a, b, true)
    } catch (err) {
      if (err instanceof ConeCap) {
        break
      }

      throw err
    }

    ;[a, b] = [b, a]
    reach = t
    F.push(coneBoundCount(a, rd))
    norm.push(coneNorm(a))
  }

  return { F, norm, reach, opened }
}

type Reading = {
  name: string
  reach: number
  L: number[]
  g: number[]
  rSelf: number
  tauSelf: number
  rExc: number
  tauExc: number
  normDrift: number
  opened: number[]
}

type Make = (n: number, bath: readonly (readonly [number, number])[], cluster: boolean) => ConeStore

function reading(
  name: string,
  pass: Pass,
  beats: number,
  make: Make,
  baths: readonly (readonly (readonly [number, number])[])[],
  rd: LineReader,
  log: (what: string) => void,
): Reading {
  const lone = series(make(3, [], true), pass, beats, rd)
  const cb = baths.map(bath => series(make(6, bath, true), pass, beats, rd))
  const bt = baths.map(bath => series(make(3, bath, false), pass, beats, rd))
  const reach = Math.min(lone.reach, ...cb.map(s => s.reach), ...bt.map(s => s.reach))
  const L: number[] = []
  const g: number[] = []

  for (let t = 0; t <= reach; t++) {
    L.push(lone.F[t]! / lone.F[0]!)
    g.push((mean(cb.map(s => s.F[t]!)) - mean(bt.map(s => s.F[t]!))) / lone.F[t]!)
  }

  const w = Math.min(WINDOW, reach)
  const rSelf = (1 - L[w]!) / w
  const rExc = (g[0]! - g[w]!) / w
  const normDrift =
    pass === null ? Math.max(...[lone, ...cb, ...bt].flatMap(s => s.norm.map(x => Math.abs(x - 1)))) : 0

  log(`${name}: reach ${reach}, L ${L.map(x => x.toFixed(4)).join(' ')}, g ${g.map(x => x.toFixed(4)).join(' ')}`)

  return {
    name,
    reach,
    L,
    g,
    rSelf,
    tauSelf: rSelf > 0 ? HALF / rSelf : Infinity,
    rExc,
    tauExc: rExc > 0 ? (g[0]! - HALF) / rExc : Infinity,
    normDrift,
    opened: lone.opened,
  }
}

export default experiment({
  id: 'selves/locked-mixer',
  code: 'E-SLF-0190',
  title:
    'the locked mixer: the F-G frame mixer made to fire on a dock only when a facet neighbour is occupied (exactly unitary and its own inverse), read on the exact balls for reversal and a still vacuum, on the R = 4 ball for a two-love body moving past sqrt 2, and on B1\'s line self for its keeping time against the bare rule and the unlocked mixer',
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const setting = process.env.LOCKED_SWEEP === 'full' ? FULL : SMOKE
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
    const place0 = currentCoinPlace()

    setCoinPlace('split')

    try {
      // ---- X1 ----
      const b1 = smallBall(1)
      const y1 = b1.table[D0]!
      const second = LINE_FIRSTS[1]!
      const reversals = [
        reversal(b1, 'a lone love', loves(b1.cells, [[0, D0]]), 2),
        reversal(b1, 'an adjacent pair', loves(b1.cells, [[0, D0], [y1, D0]]), 2),
        reversal(b1, 'the pair and a second line', loves(b1.cells, [[0, D0], [y1, D0], [0, second]]), 1),
      ]
      const gX1 = reversals.every(r => r.equal && r.norm)

      log('X1')

      // ---- V0, V1, X2L ----
      const b2 = smallBall(2)
      const LFG2 = lockedMixer(b2.table)
      const vac = lockedState(empty(b2.cells))
      const vacAfter = mixerBeat(LFG2, b2.tables, lockedState(empty(b2.cells)), 0)
      const gV0 = vacAfter.branches.length === 1 && differ(vacAfter.branches, vac.branches) === 0

      let v1Differ = 0

      for (let slot = 0; slot < SLOTS; slot++) {
        let a = lockedState(loves(b2.cells, [[0, slot]]))
        let b = lockedState(loves(b2.cells, [[0, slot]]))

        for (let t = 0; t < 2; t++) {
          a = mixerBeat(LFG2, b2.tables, a, t)
          b = mixerBeat(BARE, b2.tables, b, t)
        }

        v1Differ += differ(a.branches, b.branches)
      }

      const gV1 = v1Differ === 0
      const blocks = lockBlocks(b2)
      const gX2L = blocks.every(b => b.off <= BLOCK_TOL && b.extra === 0)

      log('V0 V1 X2L')

      // ---- K1P ----
      const kBare = readKernel(BARE, b2)
      const kG = readKernel(FG, b2)
      const twoLocked = readTwoKernel(LFG2, b2)
      const twoBare = readTwoKernel(BARE, b2)
      const locked: PairRule = { open: kG, shut: kBare, two: twoLocked }
      const bare: PairRule = { open: kBare, shut: kBare, two: twoBare }
      const k1p = pairCheck(locked, LFG2, b2, 4)

      log(`K1P diff ${k1p.diff.toExponential(1)} mismatches ${k1p.mismatches} runs ${k1p.runs}`)

      // ---- the chart, H1, the motion ----
      const chart = chartBall(setting.radius)
      const at = (x: number): number[] => [0, 1, 2].map(i => chart.pos[x * 3 + i]! - chart.pos[i]!)
      const unitOff = Math.max(...chart.layerSlots.map(s => Math.abs(Math.hypot(...at(chart.table[s]!)) - 1)))
      const pairOff = Math.max(
        ...chart.axes.map(({ slot, partner }) => {
          const p = at(chart.table[slot]!)
          const q = at(chart.table[partner]!)

          return Math.hypot(p[0]! + q[0]!, p[1]! + q[1]!, p[2]! + q[2]!)
        }),
      )
      const gH1 =
        chart.exact &&
        chart.layerSlots.length === 6 &&
        chart.axes.length === 3 &&
        unitOff <= UNIT_TOL &&
        pairOff <= UNIT_TOL

      log(`R = ${setting.radius} ball ${chart.cells} docks, exact ${chart.exact}`)

      const motionTally: Tally = { frontier: 0, exceptions: 0 }
      const pairLocked = pairMotion(locked, chart, setting.pairBeats, motionTally)
      const pairBare = pairMotion(bare, chart, setting.pairBeats, motionTally)
      const loneHits = { frontier: 0 }
      const loneBeats = setting.radius
      const loneLocked = loneMotion(kBare, chart, loneBeats, loneHits)
      const gK3 = motionTally.frontier === 0 && loneHits.frontier === 0
      const gC0P = pairBare.every(b => b.wOff <= CONTROL_TOL)
      const kernelExceptions =
        kBare.exceptions() + kG.exceptions() + twoLocked.exceptions() + twoBare.exceptions() + k1p.exceptions
      const gK1P =
        k1p.diff <= AMP_TOL &&
        k1p.mismatches === 0 &&
        kernelExceptions === 0 &&
        motionTally.exceptions === 0 &&
        k1p.frontier === 0
      const pairNormOff = Math.max(...[...pairLocked, ...pairBare].map(b => Math.abs(b.norm - 1)))

      log(
        `pair locked W_off ${pairLocked.map(b => b.wOff.toExponential(3)).join(' ')} msd ${pairLocked.map(b => b.msd.toFixed(4)).join(' ')}; bare W_off ${pairBare.map(b => b.wOff.toExponential(1)).join(' ')}`,
      )

      // ---- C1, the level ----
      const basis = lineBasis({ flavors: [0, 0, 0], statistics: 'fermion', D: 3, box: setting.box, unit: 0 })
      const level = lineLightest(basis, wholeBasis(basis)).lightest
      const placed = levelPlacement(basis, level.cre, level.cim)
      const levelOff = Math.abs(level.unwrapped - RECORDED.energy)
      const gC1 = levelOff <= setting.levelBar

      log('C1')

      // ---- the line runs ----
      const { W } = setting
      const read = Math.floor((W - 1) / 2)
      const fit = fitRing(placed, W).kept
      const width = widthOf(W, fit)
      const baths = Array.from({ length: setting.starts }, (_, s) => bathLoves(W, read, 3, s))
      const maker = (beats: number): { make: Make; rd: LineReader } => {
        const line = Math.max(256, width + 2 * beats + 2)
        const offset = beats + 1

        return {
          make: (n, bath, cluster) =>
            coneStart({ n, line, cap: setting.cap, W, placed: cluster ? fit : undefined, bath, offset }).store,
          rd: lineReader(placed, line, read, false),
        }
      }
      const short = maker(setting.bareBeats)
      const lockPass: Pass = s => lockedMixPass(s, FG_LONE, FG_FULL)
      const openPass: Pass = s => {
        mixPass(s, FG_LONE, FG_FULL)
        return 0
      }

      const bareLine = reading('bare', null, setting.bareBeats, short.make, baths, short.rd, log)
      const fgLine = reading('F-G', openPass, WINDOW, short.make, baths, short.rd, log)
      const lfgLine = reading('LF-G', lockPass, WINDOW, short.make, baths, short.rd, log)
      const long = maker(setting.longBeats)
      const lfgLong = series(long.make(3, [], true), lockPass, setting.longBeats, long.rd)
      const Llong = lfgLong.F.map(f => f / lfgLong.F[0]!)

      log(`LF-G long: reach ${lfgLong.reach}, L ${Llong.filter((_, t) => t % 10 === 0 || t <= 4).map(x => x.toExponential(3)).join(' ')}`)

      // ---- B0, U0 ----
      const gOff =
        setting.name === 'full'
          ? Math.max(...G_0019.map((x, t) => (t <= bareLine.reach ? Math.abs(bareLine.g[t]! - x) : Infinity)))
          : NaN
      const rate = bareLine.reach > 0 ? (bareLine.g[0]! - bareLine.g[bareLine.reach]!) / bareLine.reach : NaN
      const gB0 =
        setting.name === 'full' &&
        bareLine.reach >= 11 &&
        gOff <= G_TOL &&
        Math.abs(rate - RATE_0019) <= RATE_TOL &&
        bareLine.normDrift <= NORM_TOL
      const u0Off = Math.abs((fgLine.L[2] ?? NaN) - L2_0185)
      const gU0 = setting.name === 'full' && u0Off <= L2_TOL

      // ---- the physics gates ----
      const L80 = lfgLong.reach >= KEEP_AT ? Llong[KEEP_AT]! : NaN
      const gS =
        lfgLine.L.slice(1, WINDOW + 1).every(x => x >= HOLD) &&
        lfgLine.tauSelf >= TAU_BAR &&
        Number.isFinite(L80) &&
        L80 >= HALF
      const last = pairLocked[setting.pairBeats - 1]!
      const gM = last.wOff >= MOTION_FLOOR && last.msd > pairLocked[0]!.msd
      const instrument =
        gX1 && gV0 && gV1 && gX2L && gK1P && gK3 && gH1 && gC0P && gC1 && (setting.name === 'smoke' || (gB0 && gU0))
      const status: 'pass' | 'fail' | 'open' =
        !instrument || setting.name === 'smoke' ? 'open' : gS && gM ? 'pass' : 'fail'

      const f4 = (x: number): string => (Number.isFinite(x) ? x.toFixed(4) : String(x))
      const e3 = (x: number): string => (Number.isFinite(x) ? x.toExponential(3) : String(x))
      const lineRow = (r: Reading): string =>
        `${r.name}: L ${r.L.map(f4).join(' ')}, g ${r.g.map(f4).join(' ')}, r_self ${f4(r.rSelf)} (tau_self ${f4(r.tauSelf)}), r_exc ${f4(r.rExc)} (tau_exc ${f4(r.tauExc)})`
      const motionRow = (name: string, bs: MotionBeat[]): string =>
        `${name}: W_off ${bs.map(b => e3(b.wOff)).join(' ')}, msd ${bs.map(b => f4(b.msd)).join(' ')}, largest shadow ${bs.map(b => f4(b.maxShadow)).join(' ')}`
      const sampled = Llong.map((x, t) => [t, x] as const).filter(([t]) => t <= 4 || t % 10 === 0)

      const metrics: Record<string, number> = {
        gate_X1: gX1 ? 1 : 0,
        gate_V0: gV0 ? 1 : 0,
        gate_V1: gV1 ? 1 : 0,
        gate_X2L: gX2L ? 1 : 0,
        gate_K1P: gK1P ? 1 : 0,
        gate_K3: gK3 ? 1 : 0,
        gate_H1: gH1 ? 1 : 0,
        gate_C0P: gC0P ? 1 : 0,
        gate_C1: gC1 ? 1 : 0,
        gate_B0: gB0 ? 1 : 0,
        gate_U0: gU0 ? 1 : 0,
        gate_S: gS ? 1 : 0,
        gate_M: gM ? 1 : 0,
        k1pDiff: k1p.diff,
        blockOff: Math.max(...blocks.map(b => b.off)),
        ballCells: chart.cells,
        pairNormOff,
        pairWOff: last.wOff,
        pairMsd: last.msd,
        loneWOff: Math.max(...loneLocked.map(b => b.wOff)),
        loneShadow: Math.max(...loneLocked.map(b => b.maxShadow)),
        lfg_L1: lfgLine.L[1] ?? NaN,
        lfg_L2: lfgLine.L[2] ?? NaN,
        lfg_rSelf: lfgLine.rSelf,
        lfg_tauSelf: lfgLine.tauSelf,
        lfg_rExc: lfgLine.rExc,
        lfg_L80: L80,
        lfg_reach: lfgLong.reach,
        fg_L2: fgLine.L[2] ?? NaN,
        u0Off,
        bare_L2: bareLine.L[2] ?? NaN,
        b0GOff: gOff,
        b0Rate: rate,
        b0NormDrift: bareLine.normDrift,
        levelOff,
        seconds: (Date.now() - started) / 1000,
      }

      return verdict({
        status,
        claim: `${setting.name} setting. SELF (line engine, W ${W} k 3, ${setting.starts} start${setting.starts > 1 ? 's' : ''}, window beats 0 to ${WINDOW} honeycomb-exact by Lemma W): ${lineRow(lfgLine)} || unlocked ${lineRow(fgLine)} || bare ${lineRow(bareLine)}; locked L(t) on the line engine's P part (a projection past beat ${WINDOW}) to beat ${lfgLong.reach}: ${sampled.map(([t, x]) => `${t}: ${e3(x)}`).join(', ')}; locks opened on the lone cluster per beat ${lfgLine.opened.join(' ')}. MOTION (exact R = ${setting.radius} ball, ${chart.cells} docks, 24 starts): the comoving pair ${motionRow('locked', pairLocked)} || ${motionRow('bare', pairBare)} || a lone love under the lock (equal to bare by V1) ${motionRow('lone', loneLocked)}. Gates S ${gS}, M ${gM}`,
        metrics,
        notes: `L2. Gate 0544fd5a3add. Setting ${setting.name}${setting.name === 'smoke' ? ' (proves the file runs; not evidence, status open by rule)' : ''}. X1 ${gX1} (${reversals.map(r => `${r.start} ${r.beats} beats equal ${r.equal} norm ${r.norm}, ${r.branches} branches`).join('; ')}). V0 ${gV0}. V1 ${gV1} (${v1Differ} differing branches over 24 slots, 2 beats). X2L ${gX2L} (${blocks.map(b => `${b.case} off ${b.off.toExponential(1)} extra ${b.extra}`).join('; ')}). K1P ${gK1P} (diff ${k1p.diff.toExponential(1)}, ${k1p.mismatches} mismatches, ${k1p.runs} runs, kernel exceptions ${kernelExceptions}, engine exceptions ${motionTally.exceptions}). K3 ${gK3} (pair frontier ${motionTally.frontier}, lone ${loneHits.frontier}). H1 ${gH1} (unit off ${unitOff.toExponential(1)}, pair off ${pairOff.toExponential(1)}). C0P ${gC0P}. C1 ${gC1} (level off ${levelOff.toExponential(1)}). B0 ${gB0} (g off 0019 ${e3(gOff)}, rate ${f4(rate)} against ${RATE_0019}, reach ${bareLine.reach}, norm drift ${e3(bareLine.normDrift)}). U0 ${gU0} (F-G L(2) ${f4(fgLine.L[2] ?? NaN)} against ${L2_0185}). Pair norm off ${e3(pairNormOff)}. Grades: ball pieces exact; the self's window honeycomb-exact; past beat ${WINDOW} the line engine's P part (no return), a projection; motion honeycomb within the horizon. Opt-in: adoption is the author's base change.`,
      })
    } finally {
      setCoinPlace(place0)
    }
  },
})
