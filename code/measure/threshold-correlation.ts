// The fixed-shift gate (E-MTH-0026): do two reads of one key, taken as two decisions, decide each other?
//
// A deterministic rule reads spread-out values instead of draws. Where it makes TWO decisions from one key
// (the same edge at two beats, or two choices at one beat), the two values must be jointly equidistributed
// over the keys, or a threshold on the first fixes the second. weylCell(key, beat, salt) is linear in all
// three arguments, so any two of its values at one key differ by a FIXED shift delta: the pair lies on one
// line of the torus, and P(u1 < t1, u2 < t2) is the length of an intersection of two arcs, not t1 t2.
//
// THE STATISTIC. Over keys 0 .. K - 1, the largest gap between the joint rate of two threshold decisions and
// the product of their own rates, over the thresholds 1/8, 2/8, ..., 7/8 on each read:
//   D = max over (t1, t2) of | #{u1 < t1, u2 < t2} / K - #{u1 < t1} / K #{u2 < t2} / K |.
// For jointly equidistributed reads D falls like the pair's discrepancy (about 1e-3 at K = 2^14); for a fixed
// shift it stays of order 1/16 for every delta (fixedShiftFloor: the exact minimum over delta of the gap on the
// threshold grid, computed from the arc lengths). A pair is FLAGGED when D > THRESHOLD_GAP.
// Also reported: whether u2 - u1 is the same number mod 1 on every key (the literal signature).

export const THRESHOLDS = [1, 2, 3, 4, 5, 6, 7].map(i => i / 8)
export const THRESHOLD_GAP = 0.02

export type PairReport = { gap: number; constantShift: boolean; shift: number; flagged: boolean }

export function thresholdCorrelation(input: { read1: (key: number) => number; read2: (key: number) => number; keys: number }): PairReport {
  const { read1, read2, keys } = input
  const n = THRESHOLDS.length
  const joint = new Int32Array(n * n)
  const below1 = new Int32Array(n)
  const below2 = new Int32Array(n)
  let first = Number.NaN
  let constantShift = true

  for (let k = 0; k < keys; k++) {
    const u1 = read1(k)
    const u2 = read2(k)
    const d = (((u2 - u1) % 1) + 1) % 1

    if (k === 0) {
      first = d
    } else {
      const gap = Math.abs(d - first)

      constantShift = constantShift && Math.min(gap, 1 - gap) < 1e-9
    }

    for (let i = 0; i < n; i++) {
      const a = u1 < THRESHOLDS[i]!

      below1[i] = (below1[i] ?? 0) + (a ? 1 : 0)

      for (let j = 0; j < n; j++) {
        if (a && u2 < THRESHOLDS[j]!) {
          joint[i * n + j] = (joint[i * n + j] ?? 0) + 1
        }
      }
    }

    for (let j = 0; j < n; j++) {
      below2[j] = (below2[j] ?? 0) + (u2 < THRESHOLDS[j]! ? 1 : 0)
    }
  }

  let gap = 0

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      gap = Math.max(gap, Math.abs((joint[i * n + j] ?? 0) / keys - ((below1[i] ?? 0) / keys) * ((below2[j] ?? 0) / keys)))
    }
  }

  return { gap, constantShift, shift: first, flagged: gap > THRESHOLD_GAP }
}

// the length of [0, t1) intersected with [0, t2) - delta (mod 1): the exact joint rate of a fixed shift
export function shiftedJoint(t1: number, t2: number, delta: number): number {
  // [0, t2) - delta mod 1 is [1 - delta, 1 - delta + t2) mod 1, as up to two intervals in [0, 1)
  const start = (((1 - delta) % 1) + 1) % 1
  const end = start + t2
  const pieces: [number, number][] = end <= 1 ? [[start, end]] : [[start, 1], [0, end - 1]]

  return pieces.reduce((s, [a, b]) => s + Math.max(0, Math.min(b, t1) - Math.max(a, 0)), 0)
}

// the exact smallest threshold-grid gap any fixed shift can have, over delta on a grid of `steps` points and
// the grid's breakpoints (the gap is piecewise linear in delta with kinks at +- t1 +- t2 mod 1)
export function fixedShiftFloor(steps: number): { floor: number; at: number } {
  const deltas = new Set<number>()

  for (let s = 0; s < steps; s++) {
    deltas.add(s / steps)
  }

  for (const t1 of THRESHOLDS) {
    for (const t2 of THRESHOLDS) {
      for (const x of [t1 - t2, t2 - t1, t1 + t2, -t1 - t2, t1, -t1, t2, -t2]) {
        deltas.add((((x % 1) + 1) % 1))
      }
    }
  }

  let floor = Number.POSITIVE_INFINITY
  let at = 0

  for (const delta of deltas) {
    let gap = 0

    for (const t1 of THRESHOLDS) {
      for (const t2 of THRESHOLDS) {
        gap = Math.max(gap, Math.abs(shiftedJoint(t1, t2, delta) - t1 * t2))
      }
    }

    if (gap < floor) {
      floor = gap
      at = delta
    }
  }

  return { floor, at }
}
