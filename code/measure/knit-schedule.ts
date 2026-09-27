// The adopted knit's schedule read as a token's schedule (E-SPN-0083). MEASUREMENT and exact checks; no rule code is
// changed. The census's reader is code/measure/g-two-census (E-SPN-0079), used unedited.
//
// WHAT THE KNIT RUNS, read from the code (code/rule/bounce-pair-knit, code/measure/bounce-pair-kernel): every beat
// collides every dock (the pair move P and the coin map, P K on even beats and K P on odd ones, code/rule/living-pair-
// knit collisionOrder), then ONE permutation copies every slot one dock along its own root. The copy's target is a
// function of (dock, slot) alone: the role point rides along and is moved by the link's grid move. So the knit has no
// order among its 24 copies, and the direction of a copy is chosen by the SLOT, never by the role.
//
// THE CENSUS'S READING, and the simultaneous copy. g-two-census reads a schedule's streams in time order; two streams
// of one beat share a frame (m(0) = 0), so their only ordering contribution is the r(0) = 2 of the cross term c, with
// the sign of which is listed first. A copy along two axes at once is exp(-i (A + B)), whose second-order term is the
// AVERAGE of the two orders; so the simultaneous reading of a beat is the census reading averaged over the orders of
// its streams, which is what simultaneousReading returns (as the integer SUM over the orders, with the order count:
// g^2 = 4 z^2 / (4 a b - 3 c^2) is unchanged by the common factor).
//
// Integers only in the census reading. The spin checks use code/rule/spinor-token's 4 x 4 matrices, whose entries
// are 0, +-1 and +-i, so their products are exact in floating point.

import { planeInvariants, epsilonOf, PLANES, type Axis, type PlaneInvariants } from '@/code/measure/g-two-census'
import { bouncePermutation, BOUNCE_TABLE, type CollisionKind } from '@/code/rule/bounce-pair-knit'
import { LINE_FIRSTS, LINE_OF, OPPOSITE } from '@/code/rule/isometric-knit'
import { pairMove, type BounceKernel } from '@/code/measure/bounce-pair-kernel'
import { type Reduced } from '@/code/measure/living-pair-kernel'
import { multiply4, scheduleSymbol, stepGenerator, type Matrix4, type Step } from '@/code/rule/spinor-token'

const LINE_SECONDS: readonly number[] = LINE_FIRSTS.map(f => OPPOSITE[f] ?? f)

function permutationsOf<T>(items: readonly T[]): T[][] {
  if (items.length <= 1) return [[...items]]

  const out: T[][] = []

  items.forEach((item, i) => {
    for (const rest of permutationsOf([...items.slice(0, i), ...items.slice(i + 1)])) out.push([item, ...rest])
  })

  return out
}

export type OrderedReading = { readonly order: string; readonly planes: readonly PlaneInvariants[] }

// every order of the streams inside each beat, read by the census (beats: per beat the axes streamed in it; beat j
// has n_j = j + 1; total = the period's beat count)
export function orderedReadings(beats: readonly (readonly Axis[])[], total: number): OrderedReading[] {
  let orders: Axis[][][] = [[]]

  for (const axes of beats) {
    const next: Axis[][][] = []

    for (const prefix of orders) for (const p of permutationsOf(axes)) next.push([...prefix, p])

    orders = next
  }

  const eps = epsilonOf(total)

  return orders.map(order => {
    const axis: number[] = []
    const beat: number[] = []

    order.forEach((axes, j) => {
      for (const a of axes) {
        axis.push(a)
        beat.push(j + 1)
      }
    })

    return {
      order: order.map(axes => axes.map(a => 'xyz'[a]).join('')).join('|'),
      planes: PLANES.map(plane => planeInvariants({ axis, beat, count: axis.length, eps, plane })),
    }
  })
}

export type SimultaneousReading = {
  readonly orders: number
  // per plane the SUM over the orders of a, b, c, z and of the ordering shares aT, bT, cT, zT
  readonly planes: readonly PlaneInvariants[]
  readonly bowl: boolean[]
  // g^2 per plane as [numerator, denominator] (undefined where not a bowl)
  readonly g2: ([number, number] | undefined)[]
  readonly orderingFree: boolean
}

export function simultaneousReading(beats: readonly (readonly Axis[])[], total: number): SimultaneousReading {
  const readings = orderedReadings(beats, total)
  const planes = PLANES.map((_, p) => {
    const sum = { a: 0, b: 0, c: 0, z: 0, aT: 0, bT: 0, cT: 0, zT: 0 }

    for (const r of readings) {
      const v = r.planes[p] as PlaneInvariants

      sum.a += v.a
      sum.b += v.b
      sum.c += v.c
      sum.z += v.z
      sum.aT += v.aT
      sum.bT += v.bT
      sum.cT += v.cT
      sum.zT += v.zT
    }

    return sum
  })
  const gcd = (x: number, y: number): number => (y === 0 ? Math.abs(x) : gcd(y, x % y))
  const bowl = planes.map(v => 4 * v.a * v.b > 3 * v.c * v.c)
  const g2 = planes.map((v, i): [number, number] | undefined => {
    if (!bowl[i]) return undefined

    const num = 4 * v.z * v.z
    const den = 4 * v.a * v.b - 3 * v.c * v.c
    const d = gcd(num, den) || 1

    return [num / d, den / d]
  })

  return { orders: readings.length, planes, bowl, g2, orderingFree: planes.every(v => v.aT === 0 && v.bT === 0 && v.cT === 0 && v.zT === 0) }
}

// ---- a lone vibe keeps its slot ----
//
// THEOREM. On a dock whose held lines are all full except one line holding one vibe on slot d, every collision the
// knit uses (K, B, L) keeps the vibe on d: each is a slot permutation keeping the occupation momentum P, full lines
// add 0 to P, so P = r_d; K and B act on the non-full lines by w_P, which fixes P = r_d, and d is the only slot of
// root r_d (B may act by the identity instead, which keeps d too). The pair move never touches a line holding one
// vibe. So the knit's free token has no coin: it copies along its own root every beat. And on a dock with every held
// line full, every collision carries each line onto itself (P = 0: w = -1, or -1 on the full lines).

export type LoneCheck = { readonly docks: number; readonly moved: number; readonly fullDocks: number; readonly lineLeaks: number; readonly pairCases: number; readonly pairTouched: number }

export function loneKeepsSlot(kinds: readonly CollisionKind[] = ['isometric', 'bounce', 'lone']): LoneCheck {
  const vibe = new Int8Array(24)
  const out = new Int32Array(24)
  let docks = 0
  let moved = 0
  let fullDocks = 0
  let lineLeaks = 0

  for (const kind of kinds) {
    for (let full = 0; full < 1 << 12; full++) {
      vibe.fill(0)

      for (let l = 0; l < 12; l++) {
        if ((full >> l) & 1) {
          vibe[LINE_FIRSTS[l] as number] = 1
          vibe[LINE_SECONDS[l] as number] = -1
        }
      }

      // every held line full: each line onto itself
      fullDocks++

      if (bouncePermutation(BOUNCE_TABLE, kind, vibe, 0, out) !== 0) {
        for (let d = 0; d < 24; d++) if (LINE_OF[out[d] as number] !== LINE_OF[d]) lineLeaks++
      }

      for (let d = 0; d < 24; d++) {
        if ((full >> (LINE_OF[d] as number)) & 1) continue

        for (const tone of [1, -1]) {
          vibe[d] = tone
          docks++

          const kindOf = bouncePermutation(BOUNCE_TABLE, kind, vibe, 0, out)

          if (kindOf !== 0 && out[d] !== d) moved++

          vibe[d] = 0
        }
      }
    }
  }

  // the pair move on a dock holding one vibe, every store trit, points equal or not
  const kernel: BounceKernel = { cells: 1, table: BOUNCE_TABLE, schedule: 'alternate', veto: true, collision: 'lone', target: new Int32Array(24), move: [] }
  let pairCases = 0
  let pairTouched = 0

  for (let d = 0; d < 24; d++) {
    for (const tone of [1, -1]) {
      for (const tau of [-1, 0, 1]) {
        for (const samePoint of [true, false]) {
          const s: Reduced = { vibe: new Int8Array(24), point: new Int8Array(24), store: new Int8Array(12), spoint: new Int8Array(12) }

          s.vibe[d] = tone
          s.point[d] = 3
          s.store[LINE_OF[d] as number] = tau
          s.spoint[LINE_OF[d] as number] = samePoint ? 3 : 5

          const before = [...s.vibe, ...s.point, ...s.store, ...s.spoint].join(',')

          pairMove(kernel, s, 0)
          pairCases++
          pairTouched += [...s.vibe, ...s.point, ...s.store, ...s.spoint].join(',') === before ? 0 : 1
        }
      }
    }
  }

  return { docks, moved, fullDocks, lineLeaks, pairCases, pairTouched }
}

// ---- who steers a copy: the slot (the knit, spectator) or the spin (the stand-in, locked) ----

const SIGMA: Record<'x' | 'y' | 'z', Matrix4> = {
  // 1 (x) sigma on the index 2 slot + spin
  x: spinOperator([[0, 0], [1, 0], [1, 0], [0, 0]]),
  y: spinOperator([[0, 0], [0, -1], [0, 1], [0, 0]]),
  z: spinOperator([[1, 0], [0, 0], [0, 0], [-1, 0]]),
}

function spinOperator(s: [number, number][]): Matrix4 {
  const out: Matrix4 = Array.from({ length: 16 }, () => [0, 0] as [number, number])

  for (let slot = 0; slot < 2; slot++) {
    for (let a = 0; a < 2; a++) {
      for (let b = 0; b < 2; b++) out[(2 * slot + a) * 4 + (2 * slot + b)] = s[a * 2 + b] as [number, number]
    }
  }

  return out
}

const norm = (m: Matrix4): number => Math.max(...m.map(v => Math.hypot(v[0], v[1])))
const minus = (a: Matrix4, b: Matrix4): Matrix4 => a.map((v, i) => [v[0] - (b[i] as [number, number])[0], v[1] - (b[i] as [number, number])[1]] as [number, number])
const plus = (a: Matrix4, b: Matrix4): Matrix4 => a.map((v, i) => [v[0] + (b[i] as [number, number])[0], v[1] + (b[i] as [number, number])[1]] as [number, number])

export type SteeringCheck = {
  // |Gamma_a Gamma_b + Gamma_b Gamma_a| for the locked generators of two different axes (0: they anticommute)
  readonly lockedAnticommutator: number
  // |[Gamma_a, Gamma_b]| for the locked generators (nonzero: no common eigenbasis)
  readonly lockedCommutator: number
  // |[Gamma_a, Gamma_b]| for the spectator generators (0: they commute)
  readonly spectatorCommutator: number
  // the largest |[U(k), 1 (x) sigma]| over the spectator symbols of the given schedules and k points (0: spin blind)
  readonly spectatorSpinCommutator: number
  // the same for the locked symbols (nonzero: the spin enters the band)
  readonly lockedSpinCommutator: number
}

export function steeringCheck(schedules: readonly (readonly Step[])[], ks: readonly (readonly number[])[]): SteeringCheck {
  const pairs: ['x' | 'y' | 'z', 'x' | 'y' | 'z'][] = [
    ['x', 'y'],
    ['y', 'z'],
    ['z', 'x'],
  ]
  let lockedAnticommutator = 0
  let lockedCommutator = Number.POSITIVE_INFINITY
  let spectatorCommutator = 0

  for (const [a, b] of pairs) {
    const la = stepGenerator(a, 'locked')
    const lb = stepGenerator(b, 'locked')
    const sa = stepGenerator(a, 'spectator')
    const sb = stepGenerator(b, 'spectator')

    lockedAnticommutator = Math.max(lockedAnticommutator, norm(plus(multiply4(la, lb), multiply4(lb, la))))
    lockedCommutator = Math.min(lockedCommutator, norm(minus(multiply4(la, lb), multiply4(lb, la))))
    spectatorCommutator = Math.max(spectatorCommutator, norm(minus(multiply4(sa, sb), multiply4(sb, sa))))
  }

  let spectatorSpinCommutator = 0
  let lockedSpinCommutator = 0

  for (const schedule of schedules) {
    for (const k of ks) {
      const us = scheduleSymbol(schedule, 'spectator', k)
      const ul = scheduleSymbol(schedule, 'locked', k)

      for (const s of Object.values(SIGMA)) {
        spectatorSpinCommutator = Math.max(spectatorSpinCommutator, norm(minus(multiply4(us, s), multiply4(s, us))))
        lockedSpinCommutator = Math.max(lockedSpinCommutator, norm(minus(multiply4(ul, s), multiply4(s, ul))))
      }
    }
  }

  return { lockedAnticommutator, lockedCommutator, spectatorCommutator, spectatorSpinCommutator, lockedSpinCommutator }
}
