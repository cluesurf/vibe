// TSIRELSON WITHOUT THE WRAP (E-QTM-0199, objections Q-6, Q2-9, M2-2, Q3-4).
// E-QTM-0163 found that the like pair's knot passes the one-meeting ceiling sqrt 7 and comes within 2.4e-5 of 2 sqrt 2,
// but only on the flat D4 box, where the pair meets again every 3 beats as its line wraps round. On the honeycomb a line
// is an open geodesic and never closes. This file runs the same pair where its line is open and asks whether it still
// meets again, still passes sqrt 7, and still approaches Tsirelson's bound.
//
// THE GATES were fixed in the item's `what` (gate 6c1c3bd9a8e7, 2026-11-17T05:55:20Z) before this file existed, and
// every probe runs through task/pre-register. The item's text is the one in force; the short names here follow it.
//
// THE RULE. coinedVetoBeat (veto 'none', contact 'pass', the coin before the meetings), exact in Z[w][1/2], on sparse
// branches (code/rule/sparse-locked-knit), in the empty vacuum, which is the honeycomb's own (E-RLT-0121). The coin keeps
// a lone open vibe on its line and its dock (keep, or copy to the line's other slot), the meeting and the 'pass'
// contact keep slots, and the stream carries a slot one dock along its own label, so two loves on one line stay on it.
//
// THE START K. Two open loves at the centre dock on the two slots of line LINE_FIRSTS[0], points 0 and 1: the rule's
// first unequal-point like meeting (E-FND-0178's K). The first beat meets them (Schmidt 3/4, 1/4, CHSH sqrt 7).
//
// THE ARMS.
//   BALL  the exact {3,4,3,4} ball of radius 4 (code/substrate/coxeter/exact-ball-mesh), 4 beats: nothing reaches the
//         frontier (gate I4), so every read is the honeycomb's own. 18 link fields: E-MTH-0028's
//         17 starts over the ball's own slots, and the identity
//   LINE  an open line of 71 docks joined only through that line's two slots, identity links, 32 beats. Since the state
//         never leaves the line (I3), the rule on it is the rule on a honeycomb line as long as no vibe reaches an end
//         (I4); I5 checks it against the ball term for term over the ball's 4 beats
//   RING  the empty D4 box of sides 4 and 8, where the same line closes, identity links, 32 beats: the paired wrap
//         comparison (same start, rule and links), reported only
//   C0    E-QTM-0163's own side-4 like pair rerun by its own procedure, the control that the box value is reproduced
//
// THE READINGS, after every beat.
//   meetings  split like meetings, lineage (most split meetings on one record) and cross merges, by E-QTM-0163's record
//             switch (code/measure/kept-branch semantics, carried here on sparse branches): 'on' is the rule, 'off'
//             dephases every like meeting but the last
//   FULL      the two vibes are ordered along the line (left: the smaller key 2 c + (slot is the line's first slot), c
//             the dock's line coordinate, on a ring 0 to P - 1 from the start); each one's register is (key, point).
//             The Schmidt weights of that bipartite pure state give CHSH over all observables (chshFromWeights)
//   POINT     the two-qubit state of the two points, positions traced out, when each vibe's points lie in one pair:
//             Horodecki's 2 sqrt(m1 + m2)
//   RING-MADE dichotomic point observables n.sigma with entries in Z[w][1/6] (z in Z[1/6], x + iy in Z[w][1/6], every
//             denominator 2^a 3^b <= D, D = 6, 36, 216), the best found among the 24 such directions nearest each
//             optimal Horodecki setting: a reached value, not a proven maximum. With the state in Z[w][1/2] it is a
//             rational number (M2-2), so never 2 sqrt 2
//
// FIRST RUN (M3 clone b09-bell, 52 s, test/record/E-QTM-0199/qtm199-run1.log, recorded under gate 6c1c3bd9a8e7):
// partial. I0 to I5, R0 and C0 hold; H1, H2, H3 and RM hold; T fails (the line reaches 2.827297, 1.13e-3 under 2 sqrt 2)
// and C1 fails (the dephased members' FULL CHSH reaches 2.799435 on the ball, 2.824617 on the line, 2.828427 on ring 4:
// with positions in the registers one coherent meeting is not bounded by sqrt 7, so the FULL excess on the ball is not
// the kept branch's interference). No arm, ring or line, reaches Tsirelson within 1e-4; title written after the run.
//
// DETERMINISM: no random number; link starts are E-MTH-0028's family. The rule is exact; Schmidt weights, CHSH values
// and ring-made searches are floats (measurement). Depth L2. NOTHING MOVES.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'
import {
  lockedTables,
  norm,
  type LockedTables,
} from '@/code/rule/doublet-locked-knit'
import {
  coinLines,
  currentCoinPlace,
} from '@/code/rule/coined-locked-knit'
import {
  collideVeto,
  meetBranch,
  toWords,
} from '@/code/rule/occupation-veto-knit'
import {
  cloneSparse,
  lineEntries,
  slotEntries,
  sparseBranchOf,
  sparseKey,
  sparseVetoBeat,
  streamSparse,
  type SparseBranch,
} from '@/code/rule/sparse-locked-knit'
import { makeColorWeave } from '@/code/rule/color-weave'
import { exactBallMesh } from '@/code/substrate/coxeter/exact-ball-mesh'
import { shellDistances, type Mesh } from '@/code/tool/mesh'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import {
  chshFromWeights,
  registerKnot,
  schmidtWeights,
  vacuumConfiguration,
} from '@/code/measure/doublet-locked-readings'
import {
  contactFresh,
  likePairStart,
} from '@/code/measure/occupation-veto-readings'
import {
  keptBeat,
  newKeptTally,
  recordedStart,
  type RecordedBranch,
} from '@/code/measure/kept-branch'

const D0 = LINE_FIRSTS[0]!
const D0_BACK = OPPOSITE[D0]!
const BALL_RADIUS = 4
const BALL_BEATS = 4
const LINE_DOCKS = 71
const LINE_BEATS = 32
const RING_SIDES = [4, 8] as const
const RING_BEATS = 32
const OFF_BEATS_BALL = 4
const OFF_BEATS_LONG = 12
const C0_BEATS = 48
const SQRT7 = Math.sqrt(7)
const TSIRELSON = 2 * Math.SQRT2
const TOLERANCE_T = 1e-4
const HEIGHTS = [6, 36, 216] as const
const NEAREST = 24
const HALF_SQRT3 = Math.sqrt(3) / 2

// E-QTM-0163's side-4 knot CHSH maxima per start (test/record/E-QTM-0163/qtm163-run1.log), integer+0 to +15, golden
const C0_EXPECTED: readonly number[] = [
  2.813788, 2.821942, 2.816462, 2.828403, 2.79455, 2.828403, 2.813788,
  2.828403, 2.815863, 2.815863, 2.816462, 2.821672, 2.825057, 2.825057,
  2.828403, 2.825057, 2.815863,
]

type Mode = 'on' | 'off'

type Recorded = SparseBranch & { record: string }

type Tally = {
  splits: number
  longest: number
  crossWritten: number
}

// ---- the recorded beat on sparse branches (E-QTM-0163's keptBeat, step for step as sparseVetoBeat) ----

const written = (r: string): string => r.slice(0, -1)

const recordKey = (mode: Mode, r: string): string =>
  mode === 'on' ? '' : written(r)

function reduce(b: SparseBranch): void {
  while (b.k > 0 && b.a % 2n === 0n && b.b % 2n === 0n) {
    b.a /= 2n
    b.b /= 2n
    b.k--
  }
}

function mergeRecorded(
  list: Recorded[],
  mode: Mode,
  tally?: Tally,
): Recorded[] {
  const held = new Map<string, Recorded>()
  const out: Recorded[] = []

  for (const b of list) {
    const key = `${sparseKey(b)}#${recordKey(mode, b.record)}`
    const twin = held.get(key)

    if (!twin) {
      held.set(key, b)
      out.push(b)
      continue
    }

    if (tally && written(twin.record) !== written(b.record)) {
      tally.crossWritten++
    }

    const k = Math.max(twin.k, b.k)
    const s1 = 1n << BigInt(k - twin.k)
    const s2 = 1n << BigInt(k - b.k)

    twin.a = twin.a * s1 + b.a * s2
    twin.b = twin.b * s1 + b.b * s2
    twin.k = k
  }

  return out.filter(b => {
    reduce(b)

    return b.a !== 0n || b.b !== 0n
  })
}

function recordedBeat(
  tables: LockedTables,
  state: readonly Recorded[],
  beat: number,
  mode: Mode,
  tally?: Tally,
): Recorded[] {
  const coined: Recorded[] = []

  for (const br of state) {
    const m = br.docks.length

    for (const c of coinLines(m, cloneSparse(br), false)) {
      coined.push(Object.assign(c, { docks: br.docks, record: br.record }))
    }
  }

  const mid = mergeRecorded(coined, mode, tally)
  const next: Recorded[] = []

  for (const br of mid) {
    const m = br.docks.length
    const local: LockedTables = { ...tables, cells: m }
    const kids = meetBranch(cloneSparse(br), m, false)
    const n = Math.round(Math.log2(kids.length))

    if (mode === 'off' && n > 1) {
      throw new Error(
        `open-line-bell: ${n} split meetings on one term in one beat; 'off' is not written for more than one`,
      )
    }

    kids.forEach((kid, mask) => {
      let record = br.record

      for (let q = 0; q < n; q++) {
        record += (mask >> q) & 1 ? 'e' : 'k'
      }

      collideVeto('none', local, kid, beat, false)

      const moved = streamSparse(
        tables,
        Object.assign(kid, { docks: br.docks }),
        false,
      )

      if (tally) {
        tally.longest = Math.max(tally.longest, record.length)
      }

      next.push(Object.assign(moved, { record }))
    })

    if (tally) {
      tally.splits += n
    }
  }

  return mergeRecorded(next, mode, tally)
}

// ---- the arms' geometry ----

type Arm = {
  name: string
  kind: 'ball' | 'line' | 'ring'
  tables: LockedTables
  start: number
  // line coordinate of every dock on the start line
  coord: Map<number, number>
  // the line's end docks (ball and line), where a vibe would next leave
  ends: Set<number>
  // ring period (0 for an open line)
  period: number
  beats: number
  offBeats: number
}

// the start line through `start`: forward through D0, back through D0_BACK, stopping at -1 or a revisit
function lineOf(
  mesh: Mesh,
  start: number,
): { coord: Map<number, number>; period: number; ends: Set<number>; open: boolean } {
  const coord = new Map<number, number>([[start, 0]])

  let x = start
  let c = 0
  let period = 0

  for (;;) {
    const y = mesh.neighbour(x, D0)

    if (y < 0) {
      break
    }

    if (y === start) {
      period = c + 1
      break
    }

    if (coord.has(y)) {
      throw new Error('open-line-bell: the start line revisits a dock other than its start')
    }

    c++
    coord.set(y, c)
    x = y
  }

  const ends = new Set<number>()

  if (period === 0) {
    ends.add(x)
    x = start
    c = 0

    for (;;) {
      const y = mesh.neighbour(x, D0_BACK)

      if (y < 0) {
        break
      }

      if (coord.has(y)) {
        throw new Error('open-line-bell: the open start line revisits a dock')
      }

      c--
      coord.set(y, c)
      x = y
    }

    ends.add(x)
  }

  return { coord, period, ends, open: period === 0 }
}

const identityLinks = (cells: number, identity: number): Int16Array =>
  new Int16Array(cells * 24).fill(identity)

function lineMesh(docks: number): Mesh {
  return {
    id: `open-line-${docks}`,
    degree: 24,
    cellCount: docks,
    neighbour(c, d) {
      if (d === D0) {
        return c + 1 < docks ? c + 1 : -1
      }

      if (d === D0_BACK) {
        return c - 1 >= 0 ? c - 1 : -1
      }

      return -1
    },
    opposite(d) {
      return OPPOSITE[d] ?? d
    },
  }
}

// ---- readings ----

type Vibe = { slot: number; dock: number; key: number; point: number }

// the two vibes of a branch, ordered along the line; undefined when the branch breaks I3
function vibesOf(arm: Arm, b: SparseBranch): [Vibe, Vibe] | undefined {
  const slots = slotEntries(b)

  if (slots.length !== 2 || lineEntries(b).length !== 0) {
    return undefined
  }

  const out: Vibe[] = []

  for (const e of slots) {
    const dock = Math.floor(e.slot / 24)
    const d = e.slot % 24
    const c = arm.coord.get(dock)

    if (e.vibe !== 1 || e.open !== 1 || (d !== D0 && d !== D0_BACK) || c === undefined) {
      return undefined
    }

    out.push({ slot: e.slot, dock, key: 2 * c + (d === D0 ? 1 : 0), point: e.point })
  }

  out.sort((p, q) => p.key - q.key)

  return [out[0]!, out[1]!]
}

const amplitude = (b: { a: bigint; b: bigint; k: number }): [number, number] => {
  const d = 2 ** b.k
  const x = Number(b.a)
  const y = Number(b.b)

  return [(x - y / 2) / d, (y * HALF_SQRT3) / d]
}

function exactNorm(s: readonly SparseBranch[]): boolean {
  const top = Math.max(0, ...s.map(b => b.k))

  let total = 0n

  for (const b of s) {
    total += norm(b.a, b.b) * (1n << BigInt(2 * (top - b.k)))
  }

  return total === 1n << BigInt(2 * top)
}

type Full = { weights: number[]; chsh: number }

// FULL: Schmidt weights of the ordered bipartition, registers (key, point)
function fullReading(arm: Arm, s: readonly SparseBranch[]): Full {
  const rows = new Map<number, number>()
  const cols = new Map<number, number>()
  const cells: [number, number, number, number][] = []

  for (const b of s) {
    const v = vibesOf(arm, b)!
    const r = v[0].key * 9 + v[0].point
    const c = v[1].key * 9 + v[1].point

    if (!rows.has(r)) {
      rows.set(r, rows.size)
    }

    if (!cols.has(c)) {
      cols.set(c, cols.size)
    }

    const [re, im] = amplitude(b)

    cells.push([rows.get(r)!, cols.get(c)!, re, im])
  }

  const flip = cols.size < rows.size
  const n = flip ? cols.size : rows.size
  const m = flip ? rows.size : cols.size
  const re: number[][] = Array.from({ length: n }, () => new Array<number>(m).fill(0))
  const im: number[][] = Array.from({ length: n }, () => new Array<number>(m).fill(0))

  for (const [i, j, x, y] of cells) {
    const p = flip ? j : i
    const q = flip ? i : j

    re[p]![q]! += x
    im[p]![q]! += y
  }

  const w = schmidtWeights(re, im)
  const total = w.reduce((u, v) => u + v, 0)
  const weights = w
    .map(v => v / total)
    .filter(v => v > 1e-15)
    .sort((a, b) => b - a)

  return { weights, chsh: chshFromWeights(weights) }
}

type Vec3 = [number, number, number]

// the two-qubit point state's correlation matrix T, or undefined when a vibe's points leave one pair
function pointCorrelation(arm: Arm, s: readonly SparseBranch[]): number[][] | undefined {
  const leftPoints = new Set<number>()
  const rightPoints = new Set<number>()
  const read = s.map(b => {
    const v = vibesOf(arm, b)!

    leftPoints.add(v[0].point)
    rightPoints.add(v[1].point)

    return { v, amp: amplitude(b) }
  })

  if (leftPoints.size > 2 || rightPoints.size > 2) {
    return undefined
  }

  const lp = [...leftPoints].sort((a, b) => a - b)
  const rp = [...rightPoints].sort((a, b) => a - b)
  // per position pair, the 4 point amplitudes
  const groups = new Map<string, number[]>()

  for (const { v, amp } of read) {
    const key = `${v[0].key},${v[1].key}`
    const g = groups.get(key) ?? new Array<number>(8).fill(0)
    const i = 2 * lp.indexOf(v[0].point) + rp.indexOf(v[1].point)

    g[2 * i]! += amp[0]
    g[2 * i + 1]! += amp[1]
    groups.set(key, g)
  }

  // rho = sum over position pairs of |g><g|, as 4 x 4 complex
  const rr: number[][] = Array.from({ length: 4 }, () => new Array<number>(4).fill(0))
  const ri: number[][] = Array.from({ length: 4 }, () => new Array<number>(4).fill(0))

  for (const g of groups.values()) {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const ar = g[2 * i]!
        const ai = g[2 * i + 1]!
        const br = g[2 * j]!
        const bi = -g[2 * j + 1]!

        rr[i]![j]! += ar * br - ai * bi
        ri[i]![j]! += ar * bi + ai * br
      }
    }
  }

  const trace = rr[0]![0]! + rr[1]![1]! + rr[2]![2]! + rr[3]![3]!
  // Pauli matrices as [re, im] 2 x 2
  const pauli: [number, number][][][] = [
    [
      [[0, 0], [1, 0]],
      [[1, 0], [0, 0]],
    ],
    [
      [[0, 0], [0, -1]],
      [[0, 1], [0, 0]],
    ],
    [
      [[1, 0], [0, 0]],
      [[0, 0], [-1, 0]],
    ],
  ]
  const t: number[][] = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ]

  for (let a = 0; a < 3; a++) {
    for (let b = 0; b < 3; b++) {
      // Tr(rho (sa x sb)) = sum_ij rho_ij (sa x sb)_ji
      let sum = 0

      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          const [ar, ai] = pauli[a]![j >> 1]![i >> 1]!
          const [br, bi] = pauli[b]![j & 1]![i & 1]!
          const or = ar * br - ai * bi
          const oi = ar * bi + ai * br

          sum += rr[i]![j]! * or - ri[i]![j]! * oi
        }
      }

      t[a]![b] = sum / trace
    }
  }

  return t
}

// eigen-decomposition of a symmetric 3 x 3 (Jacobi): values descending with their vectors
function symmetricEigen(a0: number[][]): { values: number[]; vectors: Vec3[] } {
  const a = a0.map(r => [...r])
  const v = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ]

  for (let sweep = 0; sweep < 64; sweep++) {
    let off = 0

    for (let p = 0; p < 3; p++) {
      for (let q = p + 1; q < 3; q++) {
        off += a[p]![q]! ** 2
      }
    }

    if (off < 1e-30) {
      break
    }

    for (let p = 0; p < 3; p++) {
      for (let q = p + 1; q < 3; q++) {
        if (Math.abs(a[p]![q]!) < 1e-300) {
          continue
        }

        const theta = (a[q]![q]! - a[p]![p]!) / (2 * a[p]![q]!)
        const tt =
          Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1))
        const c = 1 / Math.sqrt(tt * tt + 1)
        const s = tt * c

        for (let k = 0; k < 3; k++) {
          const akp = a[k]![p]!
          const akq = a[k]![q]!

          a[k]![p] = c * akp - s * akq
          a[k]![q] = s * akp + c * akq
        }

        for (let k = 0; k < 3; k++) {
          const apk = a[p]![k]!
          const aqk = a[q]![k]!

          a[p]![k] = c * apk - s * aqk
          a[q]![k] = s * apk + c * aqk
        }

        for (let k = 0; k < 3; k++) {
          const vkp = v[k]![p]!
          const vkq = v[k]![q]!

          v[k]![p] = c * vkp - s * vkq
          v[k]![q] = s * vkp + c * vkq
        }
      }
    }
  }

  const order = [0, 1, 2].sort((i, j) => a[j]![j]! - a[i]![i]!)

  return {
    values: order.map(i => a[i]![i]!),
    vectors: order.map(i => [v[0]![i]!, v[1]![i]!, v[2]![i]!] as Vec3),
  }
}

const dot = (x: Vec3, y: Vec3): number => x[0] * y[0] + x[1] * y[1] + x[2] * y[2]

const times = (t: number[][], b: Vec3): Vec3 => [
  dot(t[0] as Vec3, b),
  dot(t[1] as Vec3, b),
  dot(t[2] as Vec3, b),
]

const timesT = (t: number[][], a: Vec3): Vec3 => [
  t[0]![0]! * a[0] + t[1]![0]! * a[1] + t[2]![0]! * a[2],
  t[0]![1]! * a[0] + t[1]![1]! * a[1] + t[2]![1]! * a[2],
  t[0]![2]! * a[0] + t[1]![2]! * a[1] + t[2]![2]! * a[2],
]

const unit = (x: Vec3): Vec3 => {
  const n = Math.hypot(x[0], x[1], x[2])

  return n > 0 ? [x[0] / n, x[1] / n, x[2] / n] : [0, 0, 1]
}

type Point = {
  chsh: number
  settings: { a0: Vec3; a1: Vec3; b0: Vec3; b1: Vec3 }
}

// Horodecki: 2 sqrt(m1 + m2), and the settings that reach it
function horodecki(t: number[][]): Point {
  const tt: number[][] = [0, 1, 2].map(i =>
    [0, 1, 2].map(j => t[0]![i]! * t[0]![j]! + t[1]![i]! * t[1]![j]! + t[2]![i]! * t[2]![j]!),
  )
  const e = symmetricEigen(tt)
  const m1 = Math.max(0, e.values[0]!)
  const m2 = Math.max(0, e.values[1]!)
  const s1 = Math.sqrt(m1)
  const s2 = Math.sqrt(m2)
  const v1 = e.vectors[0]!
  const v2 = e.vectors[1]!
  const r = Math.hypot(s1, s2) || 1
  const b0 = unit([
    (s1 * v1[0] + s2 * v2[0]) / r,
    (s1 * v1[1] + s2 * v2[1]) / r,
    (s1 * v1[2] + s2 * v2[2]) / r,
  ])
  const b1 = unit([
    (s1 * v1[0] - s2 * v2[0]) / r,
    (s1 * v1[1] - s2 * v2[1]) / r,
    (s1 * v1[2] - s2 * v2[2]) / r,
  ])

  return {
    chsh: 2 * Math.sqrt(m1 + m2),
    settings: { a0: unit(times(t, v1)), a1: unit(times(t, v2)), b0, b1 },
  }
}

const chshOf = (t: number[][], a0: Vec3, a1: Vec3, b0: Vec3, b1: Vec3): number =>
  dot(a0, times(t, [b0[0] + b1[0], b0[1] + b1[1], b0[2] + b1[2]])) +
  dot(a1, times(t, [b0[0] - b1[0], b0[1] - b1[1], b0[2] - b1[2]]))

// the ring directions of height D: n with z = s / r, x + i y = (p + q w) / r, r = 2^a 3^b <= D
function ringDirections(height: number): Vec3[] {
  const radii: number[] = []

  for (let two = 1; two <= height; two *= 2) {
    for (let r = two; r <= height; r *= 3) {
      radii.push(r)
    }
  }

  const seen = new Set<string>()
  const out: Vec3[] = []

  for (const r of radii) {
    const span = Math.ceil((2 * r) / Math.sqrt(3)) + 1

    for (let p = -span; p <= span; p++) {
      for (let q = -span; q <= span; q++) {
        const nm = p * p - p * q + q * q
        const rest = r * r - nm

        if (rest < 0) {
          continue
        }

        const s = Math.round(Math.sqrt(rest))

        if (s * s !== rest) {
          continue
        }

        for (const z of s === 0 ? [0] : [s, -s]) {
          const v: Vec3 = [(p - q / 2) / r, (q * HALF_SQRT3) / r, z / r]
          const key = v.map(u => Math.round(u * 1e12)).join(',')

          if (!seen.has(key)) {
            seen.add(key)
            out.push(v)
          }
        }
      }
    }
  }

  return out
}

const RING_DIRECTIONS = HEIGHTS.map(ringDirections)

const nearest = (set: readonly Vec3[], u: Vec3): Vec3[] =>
  [...set].sort((x, y) => dot(y, u) - dot(x, u)).slice(0, NEAREST)

// the best ring-made CHSH found near the optimal settings, at each height
function ringMade(t: number[][], best: Point): number[] {
  return RING_DIRECTIONS.map(set => {
    const a0s = nearest(set, best.settings.a0)
    const a1s = nearest(set, best.settings.a1)
    const b0s = nearest(set, best.settings.b0)
    const b1s = nearest(set, best.settings.b1)

    let top = -Infinity

    for (const a0 of a0s) {
      for (const a1 of a1s) {
        const w0 = timesT(t, [a0[0] + a1[0], a0[1] + a1[1], a0[2] + a1[2]])
        const w1 = timesT(t, [a0[0] - a1[0], a0[1] - a1[1], a0[2] - a1[2]])
        const b0 = b0s.reduce((x, y) => (dot(y, w0) > dot(x, w0) ? y : x))
        const b1 = b1s.reduce((x, y) => (dot(y, w1) > dot(x, w1) ? y : x))

        top = Math.max(top, chshOf(t, a0, a1, b0, b1))
      }
    }

    return top
  })
}

// ---- one arm's run ----

type Reading = {
  beat: number
  full: Full
  point: number
  ringMade: number[]
  knot: number
}

type ArmRun = {
  arm: string
  kind: Arm['kind']
  period: number
  ruleEqual: boolean
  normExact: boolean
  onLine: boolean
  endHits: number
  meets: number[]
  lineage: number
  crossWritten: number
  readings: Reading[]
  offFullMax: number
  offPointMax: number
  ringSound: boolean
  // the 'on' state after each beat, for I5
  states: Recorded[][]
}

function startBranch(arm: Arm): Recorded {
  const b = sparseBranchOf(
    [
      { slot: arm.start * 24 + D0, vibe: 1, point: 0, open: 1 },
      { slot: arm.start * 24 + D0_BACK, vibe: 1, point: 1, open: 1 },
    ],
    [],
  )

  return Object.assign(b, { record: '' })
}

const sameOccupation = (s: readonly SparseBranch[]): boolean => {
  const first = slotEntries(s[0]!).map(e => e.slot).join(',')

  return s.every(b => slotEntries(b).map(e => e.slot).join(',') === first)
}

function sameTerms(a: readonly SparseBranch[], b: readonly SparseBranch[]): boolean {
  if (a.length !== b.length) {
    return false
  }

  const index = new Map<string, SparseBranch>()

  for (const x of b) {
    index.set(sparseKey(x), x)
  }

  return a.every(x => {
    const y = index.get(sparseKey(x))

    return y !== undefined && y.a === x.a && y.b === x.b && y.k === x.k
  })
}

function pointReading(
  arm: Arm,
  s: readonly SparseBranch[],
  withRing: boolean,
): { chsh: number; ringMade: number[] } {
  const t = pointCorrelation(arm, s)

  if (!t) {
    return { chsh: Number.NaN, ringMade: HEIGHTS.map(() => Number.NaN) }
  }

  const h = horodecki(t)

  return {
    chsh: h.chsh,
    ringMade: withRing ? ringMade(t, h) : HEIGHTS.map(() => Number.NaN),
  }
}

function runArm(arm: Arm, log: (what: string) => void): ArmRun {
  let on: Recorded[] = [startBranch(arm)]
  let off: Recorded[] = [startBranch(arm)]
  let rule = { branches: [startBranch(arm)] as SparseBranch[] }

  const tally: Tally = { splits: 0, longest: 0, crossWritten: 0 }
  const out: ArmRun = {
    arm: arm.name,
    kind: arm.kind,
    period: arm.period,
    ruleEqual: true,
    normExact: true,
    onLine: true,
    endHits: 0,
    meets: [],
    lineage: 0,
    crossWritten: 0,
    readings: [],
    offFullMax: 0,
    offPointMax: 0,
    ringSound: true,
    states: [],
  }

  const endCheck = (s: readonly SparseBranch[]): void => {
    for (const b of s) {
      for (const e of slotEntries(b)) {
        if (arm.ends.has(Math.floor(e.slot / 24))) {
          out.endHits++
        }
      }
    }
  }

  for (let t = 0; t < arm.beats; t++) {
    endCheck(on)

    const before = tally.splits

    on = recordedBeat(arm.tables, on, t, 'on', tally)
    rule = sparseVetoBeat('none', arm.tables, rule, t)
    out.ruleEqual &&= sameTerms(on, rule.branches)
    out.normExact &&= exactNorm(on)
    out.onLine &&= on.every(b => vibesOf(arm, b) !== undefined)

    if (tally.splits > before) {
      out.meets.push(t)
    }

    if (t < arm.offBeats) {
      endCheck(off)
      off = recordedBeat(arm.tables, off, t, 'off')
      out.normExact &&= exactNorm(off)
      out.onLine &&= off.every(b => vibesOf(arm, b) !== undefined)

      if (out.onLine) {
        const members = new Map<string, Recorded[]>()

        for (const b of off) {
          const key = written(b.record)

          members.set(key, [...(members.get(key) ?? []), b])
        }

        for (const m of members.values()) {
          out.offFullMax = Math.max(out.offFullMax, fullReading(arm, m).chsh)

          const p = pointReading(arm, m, false).chsh

          if (Number.isFinite(p)) {
            out.offPointMax = Math.max(out.offPointMax, p)
          }
        }
      }
    }

    out.states.push(on)

    if (!out.onLine) {
      log(`${arm.name} left the line at beat ${t}`)
      break
    }

    const full = fullReading(arm, on)
    const point = pointReading(arm, on, true)
    // with one shared occupation the positions factor out and FULL is E-QTM-0163's point knot
    const knotRead = sameOccupation(on) ? full.chsh : Number.NaN

    if (Number.isFinite(point.chsh)) {
      out.ringSound &&= point.ringMade.every(v => v <= point.chsh + 1e-9)
    }

    out.readings.push({
      beat: t,
      full,
      point: point.chsh,
      ringMade: point.ringMade,
      knot: knotRead,
    })
  }

  out.lineage = tally.longest
  out.crossWritten = tally.crossWritten
  log(`${arm.name} done`)

  return out
}

// ---- the arms ----

function ballArms(log: (what: string) => void): {
  runs: ArmRun[]
  open: boolean
  coord: Map<number, number>
} {
  const ball = exactBallMesh({ radius: BALL_RADIUS })
  const line = lineOf(ball.mesh, 0)
  const distance = shellDistances(ball.mesh, 0)
  const open =
    line.open &&
    line.coord.size === 2 * BALL_RADIUS + 1 &&
    [...line.coord].every(([x, c]) => distance[x] === Math.abs(c))

  log(`ball R=${BALL_RADIUS}: ${ball.cells} docks, line open ${open}`)

  const fields: { name: string; links: 'own' | 'identity'; member?: ReturnType<typeof startFamily>[number] }[] = [
    ...startFamily(16).map(m => ({ name: m.name, links: 'own' as const, member: m })),
    { name: 'identity', links: 'identity' as const },
  ]
  const runs = fields.map(f => {
    const make = (): ArmRun => {
      const weave = makeColorWeave({ mesh: ball.mesh, table: 'bind' })
      const tables = lockedTables(
        weave,
        'pass',
        f.links === 'identity' ? identityLinks(ball.cells, weave.moves.identity) : weave.links,
      )

      return runArm(
        {
          name: `ball ${f.name}`,
          kind: 'ball',
          tables,
          start: 0,
          coord: line.coord,
          ends: line.ends,
          period: 0,
          beats: BALL_BEATS,
          offBeats: OFF_BEATS_BALL,
        },
        log,
      )
    }

    return f.member ? withStart(f.member, make) : make()
  })

  return { runs, open, coord: line.coord }
}

function lineArm(log: (what: string) => void): ArmRun {
  const mesh = lineMesh(LINE_DOCKS)
  const start = (LINE_DOCKS - 1) / 2
  const line = lineOf(mesh, start)
  const weave = makeColorWeave({ mesh, table: 'bind' })
  const tables = lockedTables(weave, 'pass', identityLinks(LINE_DOCKS, weave.moves.identity))

  return runArm(
    {
      name: 'line',
      kind: 'line',
      tables,
      start,
      coord: line.coord,
      ends: line.ends,
      period: 0,
      beats: LINE_BEATS,
      offBeats: OFF_BEATS_LONG,
    },
    log,
  )
}

function ringArm(side: number, log: (what: string) => void): ArmRun {
  const weave = makeColorWeave({ side, table: 'bind' })
  const line = lineOf(weave.mesh, 0)
  const tables = lockedTables(
    weave,
    'pass',
    identityLinks(weave.mesh.cellCount, weave.moves.identity),
  )

  return runArm(
    {
      name: `ring ${side}`,
      kind: 'ring',
      tables,
      start: 0,
      coord: line.coord,
      ends: new Set<number>(),
      period: line.period,
      beats: RING_BEATS,
      offBeats: OFF_BEATS_LONG,
    },
    log,
  )
}

// I5: the line run equals the ball's identity run term for term, docks matched by line coordinate
function canonical(arm: { coord: Map<number, number> }, s: readonly SparseBranch[]): string[] {
  return s
    .map(b => {
      const slots = slotEntries(b)
        .map(e => {
          const c = arm.coord.get(Math.floor(e.slot / 24))

          return `${c}:${e.slot % 24}:${e.vibe}:${e.point}:${e.open}`
        })
        .sort()

      return `${slots.join('|')}#${b.a}/${b.b}/${b.k}`
    })
    .sort()
}

// C0: E-QTM-0163's side-4 like pair, its own procedure, 'on' only
function c0(log: (what: string) => void): { meetsOk: number; values: number[] } {
  const values: number[] = []

  let meetsOk = 0

  const expectedMeets = Array.from({ length: 16 }, (_, i) => 1 + 3 * i).join(',')

  for (const m of startFamily(16)) {
    const r = withStart(m, () => {
      const f = contactFresh(4, 'pass')
      const pick = likePairStart('none', f.tables, toWords(vacuumConfiguration(f, 'none')), 12)

      if (!pick) {
        return { meets: '', chsh: 0 }
      }

      let on: RecordedBranch[] = recordedStart(pick.start)

      const tally = newKeptTally()
      const meets: number[] = []

      let chsh = 0

      for (let t = 0; t < C0_BEATS; t++) {
        const before = tally.splits

        on = keptBeat({ kind: 'none', tables: f.tables, state: on, beat: t, mode: 'on', tally })

        if (tally.splits > before) {
          meets.push(t)
        }

        const first = on[0]!
        const open: number[] = []

        for (let i = 0; i < first.vibe.length; i++) {
          if (first.vibe[i] !== 0 && first.open[i]) {
            open.push(i)
          }
        }

        if (open.length === 2) {
          const k = registerKnot({ branches: on }, open[0]!, open[1]!)

          if (k) {
            chsh = Math.max(chsh, k.chsh)
          }
        }
      }

      return { meets: meets.join(','), chsh }
    })

    meetsOk += r.meets === expectedMeets ? 1 : 0
    values.push(r.chsh)
    log(`C0 ${m.name} ${r.chsh.toFixed(6)}`)
  }

  return { meetsOk, values }
}

// RM's reference: Schmidt (1/2, 1/2) on two qubits, T = diag(1, -1, 1)
function reference(): number[] {
  const t = [
    [1, 0, 0],
    [0, -1, 0],
    [0, 0, 1],
  ]

  return ringMade(t, horodecki(t))
}

const maxOf = (xs: readonly number[]): number =>
  xs.filter(Number.isFinite).reduce((a, b) => Math.max(a, b), -Infinity)

export default experiment({
  id: 'quantum/open-line-bell',
  code: 'E-QTM-0199',
  title:
    "Tsirelson without the wrap, partial (gates fixed before the run): on the exact {3,4,3,4} ball (R = 4, 4 beats, no frontier hit) E-QTM-0163's like pair meets again with no wrap (meetings at beats 0, 2, 3, lineage 2, on 18 of 18 link fields) and its two-vibe state reaches CHSH 2.810982 over all observables, above the one-meeting sqrt 7, but the control with every meeting but the last dephased reaches 2.799435 too, so the rise is mostly not the kept branch's interference, and the point-only CHSH never passes sqrt 7; on an open line over 32 beats it reaches 2.827297, 1.1e-3 under 2 sqrt 2 (the 1e-4 Tsirelson gate fails), while the closed rings of the same rule reach 2.815563 (side 4) and 2.826443 (side 8), so no wrap is needed for what is reached; ring-made point CHSH 2.625, 2.638, 2.644 at heights 6, 36, 216 (rational, never 2 sqrt 2); E-QTM-0163's box values reproduced on 17 of 17 starts",
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    if (currentCoinPlace() !== 'before') {
      throw new Error('open-line-bell: the gates fix the coin before the meetings (VIBE_COIN=split refused)')
    }

    const started = Date.now()
    const log = (what: string): void =>
      console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
    const ball = ballArms(log)
    const line = lineArm(log)
    const rings = RING_SIDES.map(side => ringArm(side, log))
    const control = c0(log)
    const ref = reference()
    const all = [...ball.runs, line, ...rings]
    const identityBall = ball.runs[ball.runs.length - 1]!
    const lineCoord = lineOf(lineMesh(LINE_DOCKS), (LINE_DOCKS - 1) / 2).coord
    const ballCoord = ball.coord
    const i5 = identityBall.states.every(
      (s, t) =>
        canonical({ coord: ballCoord }, s).join(';') ===
        canonical({ coord: lineCoord }, line.states[t] ?? []).join(';'),
    )
    const r0 = all.every(r => {
      const first = r.readings[0]

      return (
        first !== undefined &&
        first.full.weights.length === 2 &&
        Math.abs(first.full.weights[0]! - 0.75) < 1e-12 &&
        Math.abs(first.full.weights[1]! - 0.25) < 1e-12 &&
        Math.abs(first.full.chsh - SQRT7) < 1e-9
      )
    })
    const fullMax = (r: ArmRun): number => maxOf(r.readings.map(x => x.full.chsh))
    const lineBest = fullMax(line)
    const ballAbove = ball.runs.filter(r => fullMax(r) > SQRT7 + 1e-6).length
    const g = {
      I0: ball.open && rings.every(r => r.period > 0),
      I1: all.every(r => r.ruleEqual),
      I2: all.every(r => r.normExact),
      I3: all.every(r => r.onLine),
      I4: [...ball.runs, line].every(r => r.endHits === 0),
      I5: i5 && identityBall.states.length === BALL_BEATS,
      R0: r0,
      C0:
        control.meetsOk === C0_EXPECTED.length &&
        control.values.every((v, i) => Math.abs(v - C0_EXPECTED[i]!) <= 1e-6),
      H1: ball.runs.every(r => r.lineage >= 2),
      H2: ballAbove >= 1,
      H3: line.lineage >= 3 && lineBest > SQRT7 + 1e-6,
      T: Math.abs(lineBest - TSIRELSON) <= TOLERANCE_T,
      C1: all.every(r => r.offFullMax <= SQRT7 + 1e-9 && r.offPointMax <= SQRT7 + 1e-9),
      RM:
        all.every(r => r.ringSound) &&
        ref.every((v, i) => v < TSIRELSON && (i === 0 || v > ref[i - 1]!)),
    }
    const instrument = g.I0 && g.I1 && g.I2 && g.I3 && g.I4 && g.I5 && g.R0 && g.C0
    const status = !instrument ? 'fail' : Object.values(g).every(Boolean) ? 'pass' : 'partial'
    const metrics: Record<string, number> = {
      ballRuns: ball.runs.length,
      ballAboveSqrt7: ballAbove,
      ballFullMax: maxOf(ball.runs.map(fullMax)),
      ballFullMin: Math.min(...ball.runs.map(fullMax)),
      ballLineageMin: Math.min(...ball.runs.map(r => r.lineage)),
      ballLineageMax: Math.max(...ball.runs.map(r => r.lineage)),
      ballPointMax: maxOf(ball.runs.flatMap(r => r.readings.map(x => x.point))),
      lineFullMax: lineBest,
      lineTsirelsonGap: TSIRELSON - lineBest,
      linePointMax: maxOf(line.readings.map(x => x.point)),
      lineLineage: line.lineage,
      lineCrossWritten: line.crossWritten,
      c0Min: Math.min(...control.values),
      c0Max: Math.max(...control.values),
      c0MeetsOk: control.meetsOk,
      seconds: 0,
    }

    HEIGHTS.forEach((h, i) => {
      metrics[`reference_ringMade_${h}`] = ref[i]!
      metrics[`line_ringMade_${h}`] = maxOf(line.readings.map(x => x.ringMade[i]!))
      metrics[`ball_ringMade_${h}`] = maxOf(ball.runs.flatMap(r => r.readings.map(x => x.ringMade[i]!)))
    })

    rings.forEach((r, i) => {
      const side = RING_SIDES[i]!

      metrics[`ring${side}_period`] = r.period
      metrics[`ring${side}_fullMax`] = fullMax(r)
      metrics[`ring${side}_pointMax`] = maxOf(r.readings.map(x => x.point))
      metrics[`ring${side}_lineage`] = r.lineage
      metrics[`ring${side}_crossWritten`] = r.crossWritten
      HEIGHTS.forEach((h, j) => {
        metrics[`ring${side}_ringMade_${h}`] = maxOf(r.readings.map(x => x.ringMade[j]!))
      })
    })

    for (const [k, v] of Object.entries(g)) {
      metrics[`gate_${k}`] = v ? 1 : 0
    }

    metrics.seconds = (Date.now() - started) / 1000

    const perBeat = (r: ArmRun): string =>
      r.readings
        .map(
          x =>
            `${x.beat}: full ${x.full.chsh.toFixed(6)} (${x.full.weights.length} weights), point ${Number.isFinite(x.point) ? x.point.toFixed(6) : '-'}${Number.isFinite(x.knot) ? `, knot ${x.knot.toFixed(6)}` : ''}`,
        )
        .join('; ')
    const runLine = (r: ArmRun): string =>
      `${r.arm}: meets ${r.meets.join(',')}, lineage ${r.lineage}, cross merges ${r.crossWritten}, end hits ${r.endHits}, off max full ${r.offFullMax.toFixed(6)} point ${r.offPointMax.toFixed(6)} | ${perBeat(r)}`

    return verdict({
      status,
      claim: `on the exact ball (R = 4, 4 beats, no frontier hit) the like pair meets again with no wrap (lineage ${metrics.ballLineageMin} to ${metrics.ballLineageMax} on ${ball.runs.length} link fields) and its CHSH passes sqrt 7 on ${ballAbove} of ${ball.runs.length} (up to ${metrics.ballFullMax!.toFixed(6)}); on an open line over ${LINE_BEATS} beats (lineage ${line.lineage}) it reaches ${lineBest.toFixed(6)}, ${(TSIRELSON - lineBest).toExponential(2)} under 2 sqrt 2; the closed rings reach ${rings.map(r => fullMax(r).toFixed(6)).join(' and ')}; ring-made point observables reach ${HEIGHTS.map((h, i) => `${metrics[`line_ringMade_${h}`]!.toFixed(6)} at D ${h}`).join(', ')} on the line; E-QTM-0163's box value reproduced ${control.meetsOk} of ${C0_EXPECTED.length}`,
      metrics,
      control: {
        c0Reproduced: g.C0 ? 1 : 0,
        offFullMax: maxOf(all.map(r => r.offFullMax)),
        offPointMax: maxOf(all.map(r => r.offPointMax)),
      },
      notes: `L2. Gates ${Object.entries(g)
        .map(([k, v]) => `${k} ${v}`)
        .join(', ')}. ${all.map(runLine).join(' || ')}. C0 per start ${control.values.map(v => v.toFixed(6)).join(', ')}. Reference ring-made ${ref.map(v => v.toFixed(9)).join(', ')} (heights ${HEIGHTS.join(', ')}, ring directions ${RING_DIRECTIONS.map(s => s.length).join(', ')}). ${metrics.seconds.toFixed(0)} s.`,
    })
  },
})
