// THE COUNTING CLOCK AGAINST THE BAND CLOCK on the lone vibe's line walk (E-MTR-0026). MEASUREMENT code: the walk and
// the history sum are exact (Eisenstein integers over 2^T); floats appear only in the symbol's eigenphases and in the
// printed readings.
//
// Two ways to read how fast a moving vibe's clock runs.
//  - COUNTING: every beat a lone vibe on its line takes one step, forward or back. Over T beats a history that ends at
//    x has taken (T + x) / 2 steps one way and (T - x) / 2 the other, so T - |x| of its steps cancel in opposite pairs.
//    The counting clock is the share of cancelling steps, 1 - |x| / T, the "rest share" of a particle drawn as a loop
//    of unit steps. Every history that reaches x has the same share, so weighting over histories changes nothing at a
//    fixed end; what the history weights set is which ends (which speeds v = x / T) a state reaches.
//  - BAND: the walk's symbol U(q) (read off one beat of the walk itself) has eigenvalues e^(i theta / 2) e^(-+ i W(q)),
//    theta the phase of det U. W(0) is the rest energy, v(q) = dW / dq the group speed, and the stationary-phase ray
//    x = v T carries the phase q x - W T = -(W - q v) T: the band clock is (W - q v) / W(0), the Legendre transform of
//    the band, which is sqrt(1 - v^2 / c^2) exactly for a Lorentz band W = sqrt(m^2 + c^2 q^2).
//
// NOTHING MOVES: a history is a sequence of takes.

import { enumerateHistories, type Vibe } from '@/code/measure/history-sum'
import { type LockedTables } from '@/code/rule/doublet-locked-knit'
import {
  walkBeat,
  walkChances,
  walkStart,
  type Coin,
  type Eisenstein,
  type WalkState,
} from '@/code/rule/fear-walk'

type Complex = { re: number; im: number }

const SQRT3_HALF = Math.sqrt(3) / 2

// an Eisenstein integer a + b w over 2 as a complex number
const fromHalf = (z: Eisenstein): Complex => ({
  re: (Number(z[0]) - Number(z[1]) / 2) / 2,
  im: (Number(z[1]) * SQRT3_HALF) / 2,
})

const mul = (a: Complex, b: Complex): Complex => ({
  re: a.re * b.re - a.im * b.im,
  im: a.re * b.im + a.im * b.re,
})

// one beat's kernel, read off walkBeat from a single slot on a ring of 5: for each start slot (0 right, 1 left), the
// outputs (slot, displacement, coefficient over 2)
export type LineKernel = {
  readonly entries: readonly {
    from: number
    to: number
    shift: number
    weight: Complex
  }[]
}

export function lineKernel(coin: Coin): LineKernel {
  const n = 5
  const c = 2
  const entries: LineKernel['entries'][number][] = []

  for (const from of [0, 1]) {
    const s = walkBeat(walkStart(n, c, from === 0), () => coin)

    for (let x = 0; x < n; x++) {
      const pairs: [number, Eisenstein][] = [
        [0, s.right[x]!],
        [1, s.left[x]!],
      ]

      for (const [to, z] of pairs) {
        if (z[0] !== 0n || z[1] !== 0n) {
          entries.push({ from, to, shift: x - c, weight: fromHalf(z) })
        }
      }
    }
  }

  return { entries }
}

// the 2 x 2 symbol U(q)[to][from] = sum over the kernel's entries of weight e^(-i q shift)
export function lineSymbol(k: LineKernel, q: number): Complex[][] {
  const u: Complex[][] = [
    [
      { re: 0, im: 0 },
      { re: 0, im: 0 },
    ],
    [
      { re: 0, im: 0 },
      { re: 0, im: 0 },
    ],
  ]

  for (const e of k.entries) {
    const p = mul(e.weight, {
      re: Math.cos(-q * e.shift),
      im: Math.sin(-q * e.shift),
    })
    const cell = u[e.to]![e.from]!

    cell.re += p.re
    cell.im += p.im
  }

  return u
}

// the band energy W(q) in [0, pi] about half the determinant's phase: the eigenvalues are e^(i theta / 2) e^(-+ i W)
export function lineBand(k: LineKernel, q: number): number {
  const u = lineSymbol(k, q)
  const a = u[0]![0]!
  const b = u[0]![1]!
  const c = u[1]![0]!
  const d = u[1]![1]!
  const det = {
    re: mul(a, d).re - mul(b, c).re,
    im: mul(a, d).im - mul(b, c).im,
  }
  const half = Math.atan2(det.im, det.re) / 2
  const tr = { re: a.re + d.re, im: a.im + d.im }
  const turned = mul(tr, { re: Math.cos(-half), im: Math.sin(-half) })

  return Math.acos(Math.max(-1, Math.min(1, turned.re / 2)))
}

// the band's group speed by a central difference, and the band clock (W - q v) / W(0); `rest` is W(0)
export function bandClock(
  k: LineKernel,
  q: number,
  step = 1e-6,
): { energy: number; speed: number; clock: number; phaseRate: number } {
  const energy = lineBand(k, q)
  const speed = (lineBand(k, q + step) - lineBand(k, q - step)) / (2 * step)
  const rest = lineBand(k, 0)
  const phaseRate = energy - q * speed

  return {
    energy,
    speed,
    phaseRate,
    clock: rest === 0 ? Number.NaN : phaseRate / rest,
  }
}

// the momentum on the branch q in [0, top] whose group speed is v (bisection; the speed rises monotonically there)
export function momentumOfSpeed(
  k: LineKernel,
  v: number,
  top: number,
): number {
  let lo = 0
  let hi = top

  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2

    if (bandClock(k, mid).speed < v) {
      lo = mid
    } else {
      hi = mid
    }
  }

  return (lo + hi) / 2
}

// the momentum of the top group speed (golden-section search on [0, pi])
export function topSpeedMomentum(k: LineKernel): number {
  let lo = 0
  let hi = Math.PI
  const g = (Math.sqrt(5) - 1) / 2

  for (let i = 0; i < 120; i++) {
    const a = hi - g * (hi - lo)
    const b = lo + g * (hi - lo)

    if (bandClock(k, a).speed < bandClock(k, b).speed) {
      lo = a
    } else {
      hi = b
    }
  }

  return (lo + hi) / 2
}

// the stationary-phase mean of |v| = (1 / 2 pi) int |W'(q)| dq (the same for both bands, so for any start)
export function stationaryMeanSpeed(k: LineKernel, points: number): number {
  let s = 0

  for (let j = 0; j < points; j++) {
    const q = -Math.PI + ((j + 0.5) * 2 * Math.PI) / points

    s += Math.abs(bandClock(k, q).speed)
  }

  return s / points
}

// the exact walk to T beats from a right-moving start on a ring that never wraps: the chance of each end x (over 4^T)
// and the history-weighted counting clock sum_x P(x) (1 - |x| / T), exactly as a ratio of integers, then read
export function walkCounting(
  coin: Coin,
  T: number,
): {
  chances: Map<number, bigint>
  unit: bigint
  meanShare: number
  shareNumerator: bigint
  normExact: boolean
} {
  const n = 2 * T + 3

  let s: WalkState = walkStart(n, 0, true)

  for (let t = 0; t < T; t++) {
    s = walkBeat(s, () => coin)
  }

  const pos = (i: number): number => (i > n / 2 ? i - n : i)
  const chances = new Map<number, bigint>()

  let total = 0n
  let numerator = 0n

  walkChances(s).forEach((p, i) => {
    if (p === 0n) {
      return
    }

    const x = pos(i)

    chances.set(x, p)
    total += p
    numerator += p * BigInt(T - Math.abs(x))
  })

  const unit = 4n ** BigInt(T)
  const scale = unit * BigInt(T)
  const shift = BigInt(Math.max(0, scale.toString(2).length - 60))

  return {
    chances,
    unit,
    shareNumerator: numerator,
    meanShare: Number(numerator >> shift) / Number(scale >> shift),
    normExact: total === unit,
  }
}

// the same counting read from the rule's own history sum (code/measure/history-sum, no beat called): the chance of
// each end x along the vibe's line (over 4^exponent) and every end's counting share. `lineIndex` maps a dock to its
// signed position along the line from the start.
export function historyCounting(input: {
  tables: LockedTables
  start: readonly Vibe[]
  beats: number
  lineIndex: ReadonlyMap<number, number>
}): {
  chances: Map<number, bigint>
  unit: bigint
  histories: number
  offLine: number
  shareNumerator: bigint
} {
  const h = enumerateHistories(input.tables, input.start, input.beats)
  const chances = new Map<number, bigint>()

  let offLine = 0
  let numerator = 0n

  for (const [key, o] of h.sum) {
    const n = o.amp[0] * o.amp[0] - o.amp[0] * o.amp[1] + o.amp[1] * o.amp[1]

    if (n === 0n) {
      continue
    }

    const slot = Number(key.split(':')[0])
    const x = input.lineIndex.get(Math.floor(slot / 24))

    if (x === undefined) {
      offLine++
      continue
    }

    chances.set(x, (chances.get(x) ?? 0n) + n)
    numerator += n * BigInt(input.beats - Math.abs(x))
  }

  return {
    chances,
    unit: 1n << BigInt(2 * h.exponent),
    histories: h.histories,
    offLine,
    shareNumerator: numerator,
  }
}
