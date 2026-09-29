// THE RULE'S GATES, read off the working rule bit for bit, and an exact circuit on them (E-QTM-0158 to E-QTM-0162).
// MEASUREMENT: every number is exact in Q(w), w = e^(2 pi i / 3); floats appear only in printed readings.
//
// The working rule (code/rule/coined-locked-knit coinedVetoBeat, veto 'none', tables on the pass contact) acts on open
// vibes through two pieces that superpose, and they are the whole gate set of a quantum circuit on the rule:
//   COIN      a line holding ONE open vibe: keep its slot with k = (1 + w)/2, or cross to the line's other slot with
//             x = (1 - w)/2 (E-SPN-0090's coin). On the vibe's direction (the line's first slot R, the second L) it is
//             C = [[k, x], [x, k]], unitary: |k|^2 = 1/4, |x|^2 = 3/4, k x-bar + x k-bar = 0.
//   LINE OF TWO  a line holding two open like vibes: the coin's determinant w, then the like meeting on their points,
//             keep k, exchange -x (unequal points), or the phase w (equal points). So on the two points it is
//             w U with U = k I - x SWAP = w P_sym + P_anti. U^3 = I exactly, so (w U)^3 = I.
// The stream then copies every slot one dock along (a relabelling), and a link's grid move permutes a point's nine
// values (a relabelling): neither superposes. readRuleGates checks the three splittings on the rule itself, at one
// dock, on the start family member in force (withStart), so every circuit below uses the rule's numbers and no others.
//
// THE CIRCUIT: registers are a direction (R or L) and points (0 to 8); a state is a sparse sum of labels with Q(w)
// amplitudes; a gate maps one label to a list of (label, coefficient). The arrangement of the gates (which vibe meets
// which, on which arm) is chosen by the experiment, which is what makes such a result partial: the gates are the rule's,
// the schedule is arranged, and no mesh configuration that runs the schedule on its own is built here.
//
// NOTHING MOVES: a gate is a take within one line of one dock; the stream's take and the link's point move are
// relabellings. No float in the arithmetic, no rounding, no random number.

import { coinedVetoBeat } from '@/code/rule/coined-locked-knit'
import {
  lockedState,
  type Branch,
  type Configuration,
  type LockedTables,
} from '@/code/rule/doublet-locked-knit'
import { toWords } from '@/code/rule/occupation-veto-knit'
import { OPPOSITE } from '@/code/rule/isometric-knit'
import { contactFresh } from '@/code/measure/occupation-veto-readings'
import { vacuumConfiguration } from '@/code/measure/doublet-locked-readings'
import { centerOf } from '@/code/measure/wall-reading'
import { startFamily, withStart } from '@/code/measure/start-ensemble'

// ---- exact Q(w): (a + b w) / d, d > 0, reduced ----

export type Qw = {
  readonly a: bigint
  readonly b: bigint
  readonly d: bigint
}

const abs = (n: bigint): bigint => (n < 0n ? -n : n)

function gcd(x: bigint, y: bigint): bigint {
  let p = abs(x)
  let q = abs(y)

  while (q !== 0n) {
    ;[p, q] = [q, p % q]
  }

  return p
}

export function qw(a: bigint, b = 0n, d = 1n): Qw {
  if (d === 0n) {
    throw new Error('rule-gates: a zero denominator')
  }

  if (d < 0n) {
    ;[a, b, d] = [-a, -b, -d]
  }

  const g = gcd(gcd(a, b), d)

  return g > 1n ? { a: a / g, b: b / g, d: d / g } : { a, b, d }
}

export const ZERO = qw(0n)
export const ONE = qw(1n)
export const W = qw(0n, 1n)
// k = (1 + w)/2, x = (1 - w)/2
export const K = qw(1n, 1n, 2n)
export const X = qw(1n, -1n, 2n)

export const add = (p: Qw, q: Qw): Qw =>
  qw(p.a * q.d + q.a * p.d, p.b * q.d + q.b * p.d, p.d * q.d)
export const neg = (p: Qw): Qw => qw(-p.a, -p.b, p.d)
export const sub = (p: Qw, q: Qw): Qw => add(p, neg(q))
// (a + b w)(c + e w) = a c - b e + (a e + b c - b e) w, since w^2 = -1 - w
export const mul = (p: Qw, q: Qw): Qw =>
  qw(
    p.a * q.a - p.b * q.b,
    p.a * q.b + p.b * q.a - p.b * q.b,
    p.d * q.d,
  )
// conj(a + b w) = a + b w^2 = (a - b) - b w
export const conj = (p: Qw): Qw => qw(p.a - p.b, -p.b, p.d)
// |a + b w|^2 = (a^2 - a b + b^2) / d^2, a rational (b = 0)
export const norm = (p: Qw): Qw =>
  qw(p.a * p.a - p.a * p.b + p.b * p.b, 0n, p.d * p.d)
export const isZero = (p: Qw): boolean => p.a === 0n && p.b === 0n
export const eq = (p: Qw, q: Qw): boolean => isZero(sub(p, q))

export function div(p: Qw, q: Qw): Qw {
  const n = norm(q)

  if (isZero(n)) {
    throw new Error('rule-gates: division by zero')
  }

  // p / q = p conj(q) / |q|^2
  const t = mul(p, conj(q))

  return qw(t.a * n.d, t.b * n.d, t.d * n.a)
}

export const wPow = (n: number): Qw =>
  [ONE, W, qw(-1n, -1n)][((n % 3) + 3) % 3]!

// a rational (b = 0) compared with another, and read as a float for printing
export const isRational = (p: Qw): boolean => p.b === 0n

export const lessThan = (p: Qw, q: Qw): boolean => {
  if (!isRational(p) || !isRational(q)) {
    throw new Error('rule-gates: ordering needs rationals')
  }

  return p.a * q.d < q.a * p.d
}

export function float(p: Qw): { re: number; im: number } {
  const a = Number(p.a) / Number(p.d)
  const b = Number(p.b) / Number(p.d)

  return { re: a - b / 2, im: (b * Math.sqrt(3)) / 2 }
}

export const show = (p: Qw): string => {
  if (isRational(p)) {
    return p.d === 1n ? `${p.a}` : `${p.a}/${p.d}`
  }

  return `(${p.a}${p.b < 0n ? ' - ' : ' + '}${abs(p.b)}w)${p.d === 1n ? '' : `/${p.d}`}`
}

// ---- reading the gates off the rule ----

const SLOT = 0
const BACK = OPPOSITE[SLOT]!

export type GateReading = {
  // the lone vibe from its first slot and from its second: two branches, keep k and cross x, at the streamed places
  coin: boolean
  // two like vibes on one line, unequal points: two branches, keep w k and exchange -w x, points carried
  meeting: boolean
  // two like vibes on one line, equal points: one branch, w^2
  phase: boolean
  // the amplitudes read, for printing
  read: string[]
}

function lone(
  f: ReturnType<typeof contactFresh>,
  center: number,
  slot: number,
  point: number,
): Configuration {
  const c = toWords(
    vacuumConfiguration(
      {
        cells: f.cells,
        store: new Int8Array(f.store.length),
        layout: f.layout,
      },
      'none',
    ),
  )

  c.vibe[center * 24 + slot] = 1
  c.point[center * 24 + slot] = point
  c.open[center * 24 + slot] = 1

  return c
}

const amp = (b: Branch): Qw => qw(b.a, b.b, 1n << BigInt(b.k))

// the point a vibe on `slot` with point p carries after the stream (the link's grid move)
const streamed = (
  t: LockedTables,
  slot: number,
  p: number,
): { at: number; point: number } => ({
  at: t.target[slot]!,
  point: t.move[slot * 9 + p]!,
})

// read the rule's three splittings at the center dock of a side-4 empty box, under the start in force
export function readRuleGates(side = 4): GateReading {
  const f = contactFresh(side, 'pass')
  const t = f.tables
  const center = centerOf(side)
  const read: string[] = []

  const at = (b: Branch): number[] => {
    const out: number[] = []

    for (let i = 0; i < b.vibe.length; i++) {
      if (b.vibe[i] !== 0) {
        out.push(i)
      }
    }

    return out
  }

  // the coin, from each slot of the line
  let coin = true

  for (const [from, other] of [
    [SLOT, BACK],
    [BACK, SLOT],
  ] as const) {
    const s = coinedVetoBeat(
      'none',
      t,
      lockedState(lone(f, center, from, 3)),
      0,
    )
    const keep = streamed(t, center * 24 + from, 3)
    const cross = streamed(t, center * 24 + other, 3)
    const kept = s.branches.find(b => at(b)[0] === keep.at)
    const crossed = s.branches.find(b => at(b)[0] === cross.at)

    coin &&=
      s.branches.length === 2 &&
      kept !== undefined &&
      crossed !== undefined &&
      kept.point[keep.at] === keep.point &&
      crossed.point[cross.at] === cross.point

    coin &&=
      kept !== undefined &&
      crossed !== undefined &&
      eq(amp(kept), K) &&
      eq(amp(crossed), X)

    if (kept && crossed) {
      read.push(
        `coin from ${from === SLOT ? 'R' : 'L'}: keep ${show(amp(kept))}, cross ${show(amp(crossed))}`,
      )
    }
  }

  // two like vibes on one line: unequal points (2 and 7), then equal (4 and 4)
  const pair = (p: number, q: number): Configuration => {
    const c = lone(f, center, SLOT, p)

    c.vibe[center * 24 + BACK] = 1
    c.point[center * 24 + BACK] = q
    c.open[center * 24 + BACK] = 1

    return c
  }

  const unequal = coinedVetoBeat('none', t, lockedState(pair(2, 7)), 0)
  const r = center * 24 + SLOT
  const l = center * 24 + BACK
  const keepR = streamed(t, r, 2)
  const keepL = streamed(t, l, 7)
  const swapR = streamed(t, r, 7)
  const swapL = streamed(t, l, 2)
  const kept = unequal.branches.find(
    b =>
      b.point[keepR.at] === keepR.point &&
      b.point[keepL.at] === keepL.point,
  )
  const swapped = unequal.branches.find(
    b =>
      b.point[swapR.at] === swapR.point &&
      b.point[swapL.at] === swapL.point,
  )
  const meeting =
    unequal.branches.length === 2 &&
    kept !== undefined &&
    swapped !== undefined &&
    kept !== swapped &&
    at(kept).join() ===
      [keepR.at, keepL.at].sort((a, b) => a - b).join() &&
    eq(amp(kept), mul(W, K)) &&
    eq(amp(swapped), neg(mul(W, X)))

  if (kept && swapped) {
    read.push(
      `two unequal: keep ${show(amp(kept))}, exchange ${show(amp(swapped))}`,
    )
  }

  const equal = coinedVetoBeat('none', t, lockedState(pair(4, 4)), 0)
  const phase =
    equal.branches.length === 1 &&
    eq(amp(equal.branches[0]!), mul(W, W))

  if (equal.branches[0]) {
    read.push(`two equal: ${show(amp(equal.branches[0]))}`)
  }

  return { coin, meeting, phase, read }
}

// the three splittings read on every member of E-MTH-0028's start family: how many members read all three exactly, and
// the first member's readings
export function gatesOnFamily(): {
  passing: number
  of: number
  read: string[]
} {
  const family = startFamily(16)

  let passing = 0
  let read: string[] = []

  for (const member of family) {
    const r = withStart(member, () => readRuleGates(4))

    if (r.coin && r.meeting && r.phase) {
      passing++
    }

    if (read.length === 0) {
      read = r.read
    }
  }

  return { passing, of: family.length, read }
}

// ---- the circuit ----

// a label: the direction first ('R' or 'L', or '-' for none), then the points, comma separated; `dir` and `points`
// read and write it
export type Label = string
export type State = Map<Label, Qw>

export const label = (dir: string, points: readonly number[]): Label =>
  `${dir}|${points.join(',')}`
export const dirOf = (l: Label): string => l.split('|')[0]!
export const pointsOf = (l: Label): number[] =>
  l.split('|')[1]!.split(',').map(Number)

export function start(
  dir: string,
  points: readonly number[],
  amplitude: Qw = ONE,
): State {
  return new Map([[label(dir, points), amplitude]])
}

export type Gate = (l: Label) => [Label, Qw][]

export function apply(s: State, g: Gate): State {
  const out: State = new Map()

  for (const [l, a] of s) {
    for (const [m, c] of g(l)) {
      const v = add(out.get(m) ?? ZERO, mul(a, c))

      if (isZero(v)) {
        out.delete(m)
      } else {
        out.set(m, v)
      }
    }
  }

  return out
}

// the coin on the direction: keep k, cross x
export const coinGate: Gate = l => {
  const d = dirOf(l)
  const p = pointsOf(l)
  const other = d === 'R' ? 'L' : 'R'

  return [
    [label(d, p), K],
    [label(other, p), X],
  ]
}

// a line of two open like vibes, points i and j of the register, ONLY where the direction is `arm` (the vibe on that
// arm shares its line): w U, keep w k and exchange -w x on unequal points, w^2 on equal. Elsewhere nothing.
export function lineOfTwo(
  i: number,
  j: number,
  arm: string | null,
): Gate {
  return l => {
    if (arm !== null && dirOf(l) !== arm) {
      return [[l, ONE]]
    }

    const p = pointsOf(l)

    if (p[i] === p[j]) {
      return [[l, mul(W, W)]]
    }

    const q = [...p]

    q[i] = p[j]!
    q[j] = p[i]!

    return [
      [l, mul(W, K)],
      [label(dirOf(l), q), neg(mul(W, X))],
    ]
  }
}

// a phase w^n on one arm (reachable on the rule as n equal-point partners on that arm's line: each is w^2, so w^0,
// w^2 and w^4 = w cover all three)
export function armPhase(arm: string, n: number): Gate {
  const f = wPow(n)

  return l => [[l, dirOf(l) === arm ? f : ONE]]
}

// the Born weight of every label, and of a coarse reading
export function born(s: State): Map<Label, Qw> {
  const out = new Map<Label, Qw>()

  for (const [l, a] of s) {
    out.set(l, norm(a))
  }

  return out
}

export function weightWhere(s: State, keep: (l: Label) => boolean): Qw {
  let total = ZERO

  for (const [l, a] of s) {
    if (keep(l)) {
      total = add(total, norm(a))
    }
  }

  return total
}

export const totalWeight = (s: State): Qw => weightWhere(s, () => true)

// the visibility of a fringe read at the three phases w^0, w^1, w^2: P(phi) = A + B cos(phi - theta) has harmonics 0
// and 1 only, so three samples fix it exactly; V = 2 |P1| / P0 with P0 = sum P_j and P1 = sum P_j w^(-j). Returned as
// V^2 (a rational, exact) and the phase theta of the fringe (a float, for printing)
export function visibility(p: readonly Qw[]): {
  v2: Qw
  phase: number
} {
  if (p.length !== 3) {
    throw new Error('rule-gates: a fringe needs three phases')
  }

  const p0 = add(add(p[0]!, p[1]!), p[2]!)
  const p1 = add(add(p[0]!, mul(p[1]!, wPow(-1))), mul(p[2]!, wPow(-2)))

  if (isZero(p0)) {
    return { v2: ZERO, phase: 0 }
  }

  const v2 = div(mul(qw(4n), norm(p1)), mul(p0, p0))
  const z = float(p1)

  return { v2, phase: Math.atan2(z.im, z.re) }
}

// a 2x2 matrix over Q(w), rows and columns in the order R, L
export type M2 = readonly [readonly [Qw, Qw], readonly [Qw, Qw]]

export const m2 = (a: Qw, b: Qw, c: Qw, d: Qw): M2 => [
  [a, b],
  [c, d],
]

export const m2add = (p: M2, q: M2): M2 =>
  m2(
    add(p[0][0], q[0][0]),
    add(p[0][1], q[0][1]),
    add(p[1][0], q[1][0]),
    add(p[1][1], q[1][1]),
  )

export const m2mul = (p: M2, q: M2): M2 =>
  m2(
    add(mul(p[0][0], q[0][0]), mul(p[0][1], q[1][0])),
    add(mul(p[0][0], q[0][1]), mul(p[0][1], q[1][1])),
    add(mul(p[1][0], q[0][0]), mul(p[1][1], q[1][0])),
    add(mul(p[1][0], q[0][1]), mul(p[1][1], q[1][1])),
  )

export const m2eq = (p: M2, q: M2): boolean =>
  eq(p[0][0], q[0][0]) &&
  eq(p[0][1], q[0][1]) &&
  eq(p[1][0], q[1][0]) &&
  eq(p[1][1], q[1][1])

export const m2isZero = (p: M2): boolean =>
  m2eq(p, m2(ZERO, ZERO, ZERO, ZERO))

export const m2show = (p: M2): string =>
  `[[${show(p[0][0])}, ${show(p[0][1])}], [${show(p[1][0])}, ${show(p[1][1])}]]`

export const IDENTITY: M2 = m2(ONE, ZERO, ZERO, ONE)

// the trace of a 2x2 matrix
export const m2trace = (p: M2): Qw => add(p[0][0], p[1][1])
