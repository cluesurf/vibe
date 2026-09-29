// A COMPOSITE HELD BY BOUNCE MEETINGS AT A HUB (E-SPN-0118). A STAND-IN for the question of
// note/research/vibe/roadmap/remaining-pieces.md, "Parallel lineons, and the bounce that changes lines" (E-SPN-0117):
// the bounce K fires only on a dock holding two or more singles and carries vibes between lines, so can a composite
// held by repeated K meetings move in 3d?
//
// THE GEOMETRY. n vibes, each on a mesh line through one dock X (the hub), read as (line class l, signed position s
// along the line's first root, slot j: 0 the first root, streaming to s + 1, 1 the opposite, streaming to s - 1). A
// vibe's dock is X + s r_l. Two distinct lines through X share only X, so two vibes on different lines share a dock
// only at s = 0; `run` still reads every dock's occupation and counts any other shared dock (it must stay 0).
//
// THE PIECES, the working rule's own, in bound-line-pieces' order (as code/measure/crossing-lines):
//  - THE COST: every link holding a nonzero center-flux trit multiplies the amplitude by e^(-i pi / 7) per beat. The
//    flux is the stream's record (f - q forward, f + q back). A vibe enters or leaves a line only at a dock where the
//    contact acts, and here that is only X, so every closed excursion from X cancels on its links and the flux on line
//    l's link k (between s = k and k + 1) is the sum over the vibes now on l of -q for 0 <= k < s and +q for s <= k < 0:
//    the string walked out from X to each vibe. `stringOf` computes exactly that, mod 3, line by line.
//  - THE COIN: on the line of each vibe, keep (1 + w)/2 or flip to the line's other slot (1 - w)/2, w = e^(2 pi i/3).
//  - THE CONTACT at X: bouncePermutation (code/rule/bounce-pair-knit, the working 'pass' kind, the committed
//    BOUNCE_TABLE) on the dock's occupation, read on every branch; with two or more singles it is K = w_P. `keep` (the
//    control) leaves every vibe on its own slot, the line-keeping contact: on a dock with no full line B's formula is
//    w_P too, so the line-keeping control has to be the identity.
//  - THE STREAM: every vibe one dock along its slot's root.
// Vibes are held as an OCCUPATION: a configuration is the sorted set of vibe codes (like vibes are not labeled), with
// no exchange sign, the stand-in convention of code/measure/crossing-lines.
//
// Floats, as measurement: a stand-in, not the exact rule. DETERMINISM: no random numbers; starts are placed.
// NOTHING MOVES: the cost is a phase, the contact a slot permutation, the stream takes each value one dock along.

import {
  bouncePermutation,
  BOUNCE_TABLE,
} from '@/code/rule/bounce-pair-knit'
import {
  LINE_FIRSTS,
  LINE_OF,
  OPPOSITE,
} from '@/code/rule/isometric-knit'
import { rootsD4 } from '@/code/algebra/group/integer-roots'
import {
  decode as crossDecode,
  signedPosition,
  walkedFlux,
  type Amp,
  type CrossSpec,
  type CrossState,
} from '@/code/measure/crossing-lines'
import {
  type Configuration,
  type LockedTables,
} from '@/code/rule/doublet-locked-knit'
import {
  keyedRunner,
  type PathKey,
} from '@/code/measure/full-key-paths'

const ROOTS = rootsD4()
const W: Amp = [-0.5, Math.sqrt(3) / 2]
const KEEP: Amp = [(1 + W[0]) / 2, W[1] / 2]
const FLIP: Amp = [(1 - W[0]) / 2, -W[1] / 2]
const CLOCK_HALF = 7

// positions -REACH .. REACH are held; a branch past them is counted and dropped
export const HUB_REACH = 40

const SPAN = 2 * HUB_REACH + 1
const BITS = 4096

export type HubBody = { l: number; s: number; j: number; q: number }
export type HubSpec = {
  readonly n: number
  readonly cost: boolean
  readonly contact: 'rule' | 'keep'
}
export type HubState = Map<number, Amp>

const mod = (a: number, m: number): number => ((a % m) + m) % m
const cmul = (a: Amp, b: Amp): Amp => [
  a[0] * b[0] - a[1] * b[1],
  a[0] * b[1] + a[1] * b[0],
]

export const slotOfBody = (b: HubBody): number =>
  b.j === 0 ? LINE_FIRSTS[b.l]! : OPPOSITE[LINE_FIRSTS[b.l]!]!

const codeOf = (b: HubBody): number =>
  ((b.l * SPAN + (b.s + HUB_REACH)) * 2 + b.j) * 2 + (b.q > 0 ? 0 : 1)

function bodyOf(c: number): HubBody {
  const q = c % 2 === 0 ? 1 : -1
  const r = Math.floor(c / 2)
  const j = r % 2
  const r2 = Math.floor(r / 2)

  return { l: Math.floor(r2 / SPAN), s: (r2 % SPAN) - HUB_REACH, j, q }
}

export function hubKey(bodies: readonly HubBody[]): number {
  const codes = bodies.map(codeOf).sort((a, b) => a - b)

  return codes.reduce((k, c) => k * BITS + c, 0)
}

export function hubDecode(key: number, n: number): HubBody[] {
  const out: HubBody[] = []

  let k = key

  for (let i = 0; i < n; i++) {
    out.push(bodyOf(k % BITS))
    k = Math.floor(k / BITS)
  }

  return out.reverse()
}

// the number of links holding a nonzero trit: per line, the string walked out from X to each vibe on it
export function stringOf(bodies: readonly HubBody[]): number {
  const byLine = new Map<number, HubBody[]>()

  for (const b of bodies) {
    byLine.set(b.l, [...(byLine.get(b.l) ?? []), b])
  }

  let n = 0

  for (const on of byLine.values()) {
    if (on.length === 1) {
      n += Math.abs(on[0]!.s)
      continue
    }

    const lo = Math.min(0, ...on.map(b => b.s))
    const hi = Math.max(0, ...on.map(b => b.s))

    for (let k = lo; k < hi; k++) {
      const f = on.reduce(
        (a, b) =>
          a + (k >= 0 && k < b.s ? -b.q : k < 0 && k >= b.s ? b.q : 0),
        0,
      )

      if (mod(f, 3) !== 0) {
        n++
      }
    }
  }

  return n
}

// the 4d dock of a vibe (in dock steps along the unit line direction r / sqrt 2, root frame)
export const lineDirection = (l: number): number[] =>
  ROOTS[LINE_FIRSTS[l]!]!.map(x => x / Math.SQRT2)

export type HubRun = {
  overlap: Amp[]
  fidelity: number[]
  tail: number[]
  dropped: number
  escaped: number
  size: number
  norm: number
  // weight carried through a contact that changed the occupied line set, summed over beats
  lineChange: number
  // contacts on a dock other than X, and branches with two vibes on one slot or one line at one dock (both must be 0)
  offHub: number
  clash: number
  // the line classes held with weight above the floor at some beat
  lines: Set<number>
}

const PERM = new Int32Array(24)
const VIBE = new Int8Array(24)

// one beat: cost, coin, contact at X, stream
function hubBeat(
  spec: HubSpec,
  s: HubState,
  tally: {
    lineChange: number
    offHub: number
    clash: number
    escaped: number
  },
): HubState {
  const out: HubState = new Map()
  const n = spec.n

  for (const [key, a0] of s) {
    const bodies = hubDecode(key, n)
    const phase = spec.cost
      ? (-Math.PI * stringOf(bodies)) / CLOCK_HALF
      : 0
    const a = cmul(a0, [Math.cos(phase), Math.sin(phase)])
    const w0 = a[0] * a[0] + a[1] * a[1]

    for (let mask = 0; mask < 1 << n; mask++) {
      let amp: Amp = a

      const coined = bodies.map((b, i) => {
        const flip = ((mask >> i) & 1) === 1

        amp = cmul(amp, flip ? FLIP : KEEP)

        return { ...b, j: flip ? 1 - b.j : b.j }
      })

      // docks shared off X (impossible for distinct lines through X; one line at one dock is a clash here)
      for (let u = 0; u < n; u++) {
        for (let v = u + 1; v < n; v++) {
          const bu = coined[u] as HubBody
          const bv = coined[v] as HubBody

          if (bu.l === bv.l && bu.s === bv.s) {
            tally.clash += w0
          } else if (bu.s !== 0 && bv.s !== 0 && bu.l !== bv.l) {
            const du = lineDirection(bu.l).map(x => x * bu.s)
            const dv = lineDirection(bv.l).map(x => x * bv.s)

            if (du.every((x, c) => Math.abs(x - dv[c]!) < 1e-9)) {
              tally.offHub += w0
            }
          }
        }
      }

      let hit = coined

      const at = coined
        .map((b, i) => ({ b, i }))
        .filter(t => t.b.s === 0)

      if (spec.contact === 'rule' && at.length > 0) {
        VIBE.fill(0)

        for (const t of at) {
          VIBE[slotOfBody(t.b)] = t.b.q
        }

        if (
          bouncePermutation(BOUNCE_TABLE, 'pass', VIBE, 0, PERM) !== 0
        ) {
          hit = coined.map(b => ({ ...b }))

          for (const t of at) {
            const d = PERM[slotOfBody(t.b)]!
            const l = LINE_OF[d]!

            hit[t.i] = {
              l,
              s: 0,
              j: d === LINE_FIRSTS[l] ? 0 : 1,
              q: t.b.q,
            }
          }

          const before = new Set(coined.map(b => b.l))
          const after = new Set(hit.map(b => b.l))

          if (
            before.size !== after.size ||
            [...after].some(l => !before.has(l))
          ) {
            tally.lineChange += amp[0] * amp[0] + amp[1] * amp[1]
          }
        }
      }

      const moved = hit.map(b => ({
        ...b,
        s: b.s + (b.j === 0 ? 1 : -1),
      }))

      if (moved.some(b => Math.abs(b.s) > HUB_REACH)) {
        tally.escaped += amp[0] * amp[0] + amp[1] * amp[1]
        continue
      }

      const k = hubKey(moved)
      const o = out.get(k)

      if (o) {
        o[0] += amp[0]
        o[1] += amp[1]
      } else {
        out.set(k, [amp[0], amp[1]])
      }
    }
  }

  return out
}

const weightOf = (s: HubState): number => {
  let w = 0

  for (const a of s.values()) {
    w += a[0] * a[0] + a[1] * a[1]
  }

  return w
}

// `beats` beats from `start`: overlap and fidelity with the start, the weight with any vibe more than `reach` docks
// from X, entries under `floor` dropped every beat
export function runHub(
  spec: HubSpec,
  start: HubState,
  beats: number,
  reach: number,
  floor: number,
): HubRun {
  let s: HubState = new Map(
    [...start].map(([k, a]) => [k, [a[0], a[1]] as Amp]),
  )

  const w0 = weightOf(start)
  const tally = { lineChange: 0, offHub: 0, clash: 0, escaped: 0 }
  const overlap: Amp[] = [[1, 0]]
  const fidelity: number[] = []
  const tail: number[] = []
  const lines = new Set<number>()

  let dropped = 0
  let size = s.size

  for (let t = 1; t <= beats; t++) {
    s = hubBeat(spec, s, tally)

    let far = 0
    let r = 0
    let i = 0

    for (const [k, a] of s) {
      const w = a[0] * a[0] + a[1] * a[1]

      if (w < floor) {
        dropped += w
        s.delete(k)
        continue
      }

      const bodies = hubDecode(k, spec.n)

      for (const b of bodies) {
        lines.add(b.l)
      }

      if (bodies.some(b => Math.abs(b.s) > reach)) {
        far += w
      }

      const x = start.get(k)

      if (x) {
        r += x[0] * a[0] + x[1] * a[1]
        i += x[0] * a[1] - x[1] * a[0]
      }
    }

    size = Math.max(size, s.size)
    overlap.push([r / w0, i / w0])
    fidelity.push((r * r + i * i) / (w0 * w0))
    tail.push(far / w0)
  }

  return {
    overlap,
    fidelity,
    tail,
    dropped,
    escaped: tally.escaped,
    size,
    norm: weightOf(s) / w0,
    lineChange: tally.lineChange / w0,
    offHub: tally.offHub,
    clash: tally.clash,
    lines,
  }
}

// the one-vibe level of code/measure/crossing-lines (a ring of L, the string's other end at X) as amplitudes on
// (signed position, slot); `mismatch` is the level's weight whose flux is not the string walked out from X (a
// winding on the ring), which this stand-in cannot hold
export function oneVibeProfile(
  spec: CrossSpec,
  level: CrossState,
): { profile: Map<string, Amp>; mismatch: number } {
  const profile = new Map<string, Amp>()

  let mismatch = 0

  for (const [k, a] of level) {
    const d = crossDecode(k)
    const b = d.bodies[0] as { line: number; p: number; j: number }
    const walked = walkedFlux(spec, d.bodies)

    if (walked.some((f, i) => f !== d.flux[i])) {
      mismatch += a[0] * a[0] + a[1] * a[1]
      continue
    }

    profile.set(`${signedPosition(spec.L, b.p)}.${b.j}`, [a[0], a[1]])
  }

  return { profile, mismatch }
}

// the product of one one-vibe profile on each of `lines` (charges `charges`), normalized: an exact level of the beat
// with the contact off, since the cost is then a sum of one term per line
export function hubProduct(
  profile: Map<string, Amp>,
  lines: readonly number[],
  charges: readonly number[],
): HubState {
  const entries = [...profile.entries()].map(([k, a]) => {
    const [s, j] = k.split('.').map(Number) as [number, number]

    return { s, j, a }
  })
  const out: HubState = new Map()

  const choose = (v: number, acc: HubBody[], amp: Amp): void => {
    if (v === lines.length) {
      const k = hubKey(acc)
      const o = out.get(k)

      if (o) {
        o[0] += amp[0]
        o[1] += amp[1]
      } else {
        out.set(k, [amp[0], amp[1]])
      }

      return
    }

    for (const e of entries) {
      choose(
        v + 1,
        [...acc, { l: lines[v]!, s: e.s, j: e.j, q: charges[v]! }],
        cmul(amp, e.a),
      )
    }
  }

  choose(0, [], [1, 0])

  const w = Math.sqrt(weightOf(out))

  for (const a of out.values()) {
    a[0] /= w
    a[1] /= w
  }

  return out
}

// the equal sum of the products on every line set of `sets` (a K orbit), normalized
export function hubOrbit(
  profile: Map<string, Amp>,
  sets: readonly (readonly number[])[],
  charges: readonly number[],
): HubState {
  const out: HubState = new Map()

  for (const set of sets) {
    for (const [k, a] of hubProduct(profile, set, charges)) {
      const o = out.get(k)

      if (o) {
        o[0] += a[0]
        o[1] += a[1]
      } else {
        out.set(k, [a[0], a[1]])
      }
    }
  }

  const w = Math.sqrt(weightOf(out))

  for (const a of out.values()) {
    a[0] /= w
    a[1] /= w
  }

  return out
}

// e^(i K . centroid) on every configuration, the centroid the mean of the vibes' 4d docks
export function hubBoost(
  s: HubState,
  n: number,
  K: readonly number[],
): HubState {
  const out: HubState = new Map()

  for (const [key, a] of s) {
    const phase = hubDecode(key, n).reduce(
      (acc, b) =>
        acc +
        (lineDirection(b.l).reduce((x, u, c) => x + u * K[c]!, 0) *
          b.s) /
          n,
      0,
    )

    out.set(key, cmul(a, [Math.cos(phase), Math.sin(phase)]))
  }

  return out
}

// the line classes whose slots K sends three singles on distinct lines to, and the line sets reached from `start`
// by K at X over every choice of slot on each line (a breadth-first walk on line sets)
export function lineSetGraph(start: readonly number[]): {
  sets: number[][]
  edges: number
} {
  const key = (ls: readonly number[]): string =>
    ls
      .slice()
      .sort((x, y) => x - y)
      .join(',')
  const seen = new Map<string, number[]>([
    [key(start), start.slice().sort((x, y) => x - y)],
  ])
  const queue = [start.slice()]

  let edges = 0

  while (queue.length > 0) {
    const ls = queue.shift()!

    for (let mask = 0; mask < 1 << ls.length; mask++) {
      const slots = ls.map((l, i) =>
        (mask >> i) & 1 ? OPPOSITE[LINE_FIRSTS[l]!]! : LINE_FIRSTS[l]!,
      )

      VIBE.fill(0)

      for (const d of slots) {
        VIBE[d] = 1
      }

      if (
        bouncePermutation(BOUNCE_TABLE, 'pass', VIBE, 0, PERM) === 0
      ) {
        continue
      }

      const next = slots.map(d => LINE_OF[PERM[d]!]!)
      const k = key(next)

      if (k !== key(ls)) {
        edges++
      }

      if (!seen.has(k)) {
        seen.set(
          k,
          next.slice().sort((x, y) => x - y),
        )
        queue.push(next)
      }
    }
  }

  return { sets: [...seen.values()], edges }
}

// K on every dock holding exactly two singles on distinct lines and any set of full lines among the other ten: how
// many docks carry a single off its own two lines (w_P fixes P = r_1 + r_2, and the census of E-SPN-0110 says it keeps
// or swaps the two), and how many carry a full line onto a line that was not full (a vacuum pair recruited onto a new
// line: the only line change a two-single meeting makes)
export function twoSinglesCensus(): {
  docks: number
  singlesLeft: number
  fullMoved: number
} {
  const out = { docks: 0, singlesLeft: 0, fullMoved: 0 }

  for (let a = 0; a < 24; a++) {
    for (let b = a + 1; b < 24; b++) {
      if (LINE_OF[a] === LINE_OF[b]) {
        continue
      }

      const others = Array.from({ length: 12 }, (_, l) => l).filter(
        l => l !== LINE_OF[a] && l !== LINE_OF[b],
      )

      for (let mask = 0; mask < 1 << others.length; mask++) {
        const full = others.filter((_, i) => ((mask >> i) & 1) === 1)

        VIBE.fill(0)
        VIBE[a] = 1
        VIBE[b] = 1

        for (const l of full) {
          VIBE[LINE_FIRSTS[l]!] = 1
          VIBE[OPPOSITE[LINE_FIRSTS[l]!]!] = 1
        }

        out.docks++

        if (
          bouncePermutation(BOUNCE_TABLE, 'pass', VIBE, 0, PERM) === 0
        ) {
          continue
        }

        const own = new Set([LINE_OF[a], LINE_OF[b]])

        if (
          !own.has(LINE_OF[PERM[a]!]) ||
          !own.has(LINE_OF[PERM[b]!])
        ) {
          out.singlesLeft++
        }

        if (
          full.some(
            l => !full.includes(LINE_OF[PERM[LINE_FIRSTS[l]!]!]!),
          )
        ) {
          out.fullMoved++
        }
      }
    }
  }

  return out
}

// the slot and store readings where two runs of one start on two tables (two contacts) differ, summed over beats,
// and the first beat they differ (-1 if never); points and open bits are read only where a vibe is
export function contactAgreement(
  a: LockedTables,
  b: LockedTables,
  start: Configuration,
  key: PathKey,
  threshold: number,
  beats: number,
): { differ: number; first: number } {
  const p = keyedRunner(a, start, { key, threshold })
  const q = keyedRunner(b, start, { key, threshold })

  let differ = 0
  let first = -1

  for (let t = 1; t <= beats; t++) {
    p.beat()
    q.beat()

    const x = p.state()
    const y = q.state()

    let n = 0

    for (let i = 0; i < x.vibe.length; i++) {
      if (
        x.vibe[i] !== y.vibe[i] ||
        (x.vibe[i] !== 0 &&
          (x.point[i] !== y.point[i] || x.open[i] !== y.open[i]))
      ) {
        n++
      }
    }

    for (let s = 0; s < x.store.length; s++) {
      if (
        x.store[s] !== y.store[s] ||
        (x.store[s] !== 0 &&
          (x.spoint[s] !== y.spoint[s] || x.sopen[s] !== y.sopen[s]))
      ) {
        n++
      }
    }

    differ += n

    if (n > 0 && first < 0) {
      first = t
    }
  }

  return { differ, first }
}

// K on every unordered set of `m` slots on m distinct lines of one dock (all loves): how many keep the line set, change
// it, or are left alone, and how many images put two vibes on one line
export function singlesCensus(m: number): {
  keep: number
  change: number
  identity: number
  clash: number
  total: number
} {
  const out = { keep: 0, change: 0, identity: 0, clash: 0, total: 0 }

  const pick = (from: number, acc: number[]): void => {
    if (acc.length === m) {
      const lines = new Set(acc.map(d => LINE_OF[d]))

      if (lines.size < m) {
        return
      }

      out.total++
      VIBE.fill(0)

      for (const d of acc) {
        VIBE[d] = 1
      }

      if (
        bouncePermutation(BOUNCE_TABLE, 'pass', VIBE, 0, PERM) === 0
      ) {
        out.identity++

        return
      }

      const after = new Set(acc.map(d => LINE_OF[PERM[d]!]))

      if (after.size < m) {
        out.clash++
      }

      if ([...after].every(l => lines.has(l))) {
        out.keep++
      } else {
        out.change++
      }

      return
    }

    for (let d = from; d < 24; d++) {
      pick(d + 1, [...acc, d])
    }
  }

  pick(0, [])

  return out
}
