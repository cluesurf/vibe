// Identical vibes: two-vibe amplitudes built from the one-vibe fear walk, exactly, and the slot's rule
// that a slot holds one vibe (E-SPN-0046 to E-SPN-0049).
//
// The fear walk (code/rule/fear-walk, E-QTM-0103) gives a lone vibe a weight on the two slots of a line,
// moved each beat by the coin C = [[a, b], [b, a]] with 2 a = 1 + omega and 2 b = 1 - omega (the swap
// phase at phi = 2 pi / 3), then streamed. Every weight is a whole number of the ring Z[omega] over 2^t.
// This module holds what two such vibes do.
//
// 1. THE BEAM SPLITTER. One dock of a line carries the coin and every other dock only streams (the stay
//    coin, pure copying one dock along). Two packets launched at that dock from the two sides are the
//    Hong-Ou-Mandel set-up: the two-vibe amplitude is phi_A x phi_B plus or minus phi_B x phi_A (bosons,
//    fermions) or the plain product (distinguishable), and the coincidence is the chance of one vibe
//    leaving on each side. All in whole numbers of the ring, so every chance is an exact fraction.
// 2. THE SLOT. A slot holds one vibe, so a two-vibe state is a set of two distinct slots. A two-vibe map
//    built from the one-vibe map U with no interaction is
//
//      M_chi({s1 < s2} -> {t1 < t2}) = U(t1, s1) U(t2, s2) + chi U(t2, s1) U(t1, s2),
//
//    the direct and the exchanged history with a relative phase chi. The history that sends both vibes
//    into one slot has no configuration to go to. chi = -1 is the exterior square of U (Cauchy-Binet), a
//    unitary; any other chi loses norm wherever two vibes share a dock. Measured by column norms, exactly.
// 3. THE HUSK WALK. The fear walk on a 3D husk torus: each beat is a coin and a stream along each husk axis
//    in the palindrome x y z z y x, the 3D form of the plane walk of code/measure/charged-walk.
//
// Weights here are pairs of plain numbers when they stay safe integers (checked, never rounded), and
// bigints where they can grow.

import { type Eisenstein, norm as eisensteinNorm, plus as eisensteinPlus, times as eisensteinTimes, turn } from '@/code/rule/fear-walk'
import { twoRolePoints, type Whole } from '@/code/rule/fear-weave'
import { gridWeights } from '@/code/measure/grid-weights'

// a commutative ring of whole numbers m + n u, with u = omega (Eisenstein) or u = i (Gaussian)
export type Ring = {
  readonly name: 'eisenstein' | 'gaussian'
  mul(p: Eisenstein, q: Eisenstein): Eisenstein
  add(p: Eisenstein, q: Eisenstein): Eisenstein
  norm(p: Eisenstein): bigint
}

export const EISENSTEIN: Ring = {
  name: 'eisenstein',
  mul: eisensteinTimes,
  add: eisensteinPlus,
  norm: eisensteinNorm,
}

export const GAUSSIAN: Ring = {
  name: 'gaussian',
  mul: (p, q) => [p[0] * q[0] - p[1] * q[1], p[0] * q[1] + p[1] * q[0]],
  add: (p, q) => [p[0] + q[0], p[1] + q[1]],
  norm: p => p[0] * p[0] + p[1] * p[1],
}

const ZERO: Eisenstein = [0n, 0n]

// A 2 x 2 coin [[keep, reverse], [reverse, keep]] scaled by 2, in a ring, with its angle phi
export type LineCoin = {
  readonly name: string
  readonly ring: Ring
  readonly keep: Eisenstein
  readonly reverse: Eisenstein
}

// the swap phase at phi = 2 pi / 3 (the fear coin), at pi / 2 (the balanced splitter, in Z[i]), and its two
// classical ends: phi = pi, the committed table's hop, and phi = 0, the bind table's stay
export const FEAR_LINE_COIN: LineCoin = { name: 'fear', ring: EISENSTEIN, keep: [1n, 1n], reverse: [1n, -1n] }
export const BALANCED_LINE_COIN: LineCoin = { name: 'balanced', ring: GAUSSIAN, keep: [1n, 1n], reverse: [1n, -1n] }
export const HOP_LINE_COIN: LineCoin = { name: 'hop', ring: EISENSTEIN, keep: [0n, 0n], reverse: [2n, 0n] }
export const STAY_LINE_COIN: LineCoin = { name: 'stay', ring: EISENSTEIN, keep: [2n, 0n], reverse: [0n, 0n] }

// an exact fraction
export type Fraction = { readonly num: bigint; readonly den: bigint }

export function fraction(num: bigint, den: bigint): Fraction {
  const g = gcd(num, den)

  return g > 1n ? { num: num / g, den: den / g } : { num, den }
}

export function sameFraction(p: Fraction, q: Fraction): boolean {
  return p.num * q.den === q.num * p.den
}

export function fractionValue(p: Fraction): number {
  return Number(p.num) / Number(p.den)
}

function gcd(a: bigint, b: bigint): bigint {
  let x = a < 0n ? -a : a
  let y = b < 0n ? -b : b

  while (y > 0n) {
    ;[x, y] = [y, x % y]
  }

  return x === 0n ? 1n : x
}

// A sparse one-vibe map: for each source slot, its targets and weights (all over one common scale)
export type Columns = readonly (readonly (readonly [number, Eisenstein])[])[]

// One beat of the splitter line: docks 0 .. docks - 1, slot 2 x (moving right) and 2 x + 1 (moving left);
// the coin acts at dock `splitter` only, every other dock streams its slots on (the stay coin, 2 over 2).
// The line is open: a weight streamed past either end is lost, so callers keep the packets inside
export function splitterColumns(input: { docks: number; splitter: number; coin: LineCoin }): Columns {
  const { docks, splitter, coin } = input
  const out: (readonly [number, Eisenstein])[][] = []
  const right = (x: number): number => 2 * x
  const left = (x: number): number => 2 * x + 1
  const add = (list: (readonly [number, Eisenstein])[], slot: number, x: number, weight: Eisenstein): void => {
    if (x >= 0 && x < docks && (weight[0] !== 0n || weight[1] !== 0n)) {
      list.push([slot, weight])
    }
  }

  for (let x = 0; x < docks; x++) {
    for (const moving of [0, 1] as const) {
      const list: (readonly [number, Eisenstein])[] = []

      if (x === splitter) {
        const toRight = moving === 0 ? coin.keep : coin.reverse
        const toLeft = moving === 0 ? coin.reverse : coin.keep

        add(list, right(x + 1), x + 1, toRight)
        add(list, left(x - 1), x - 1, toLeft)
      } else if (moving === 0) {
        add(list, right(x + 1), x + 1, [2n, 0n])
      } else {
        add(list, left(x - 1), x - 1, [2n, 0n])
      }

      out.push(list)
    }
  }

  return out
}

// apply a one-vibe map to a weight vector
export function applyColumns(ring: Ring, columns: Columns, state: readonly Eisenstein[]): Eisenstein[] {
  const out: Eisenstein[] = new Array<Eisenstein>(state.length).fill(ZERO)

  state.forEach((w, s) => {
    if (w[0] === 0n && w[1] === 0n) {
      return
    }

    for (const [t, u] of columns[s] ?? []) {
      out[t] = ring.add(out[t] ?? ZERO, ring.mul(u, w))
    }
  })

  return out
}

export type Statistics = 'boson' | 'fermion' | 'distinguishable'

export type HongOuMandel = {
  readonly boson: Fraction
  // the bosons' chance of both vibes in one slot, the weight the slot has no configuration for
  readonly bosonSameSlot: Fraction
  readonly fermion: Fraction
  readonly distinguishable: Fraction
  // the closed form, from the coin alone: P_dist = p^2 + (1 - p)^2 and P = P_dist -+ 2 p (1 - p) I^2, with
  // p = |a|^2 and I the overlap of the two packets' arrival profiles
  readonly predicted: { readonly boson: Fraction; readonly fermion: Fraction; readonly distinguishable: Fraction }
  // the slot: the hard-core two-vibe walk M_chi from the product start, its final norm and coincidence
  readonly hardCore: readonly { readonly chi: number; readonly norm: Fraction; readonly coincidence: Fraction }[]
  readonly overlap: Fraction
}

// the Eisenstein or Gaussian unit chi = (+-1) omega^k as an element; chi in {1, -1} is shared by both rings
export function unitOf(ring: Ring, chi: number): Eisenstein {
  if (chi === 1) {
    return [1n, 0n]
  }

  if (chi === -1) {
    return [-1n, 0n]
  }

  if (ring.name !== 'eisenstein') {
    throw new Error('only +1 and -1 in the Gaussian ring')
  }

  // chi codes 2, 3 = omega, omega^2; -2, -3 = -omega, -omega^2
  const k = Math.abs(chi) - 1
  const u = turn([1n, 0n], k)

  return chi < 0 ? [-u[0], -u[1]] : u
}

// The Hong-Ou-Mandel run on the splitter line. Packet A is right-moving, its envelope's element u at dock
// splitter - distance - u; packet B is left-moving, its element u at dock splitter + distance + delay + u.
// Element u of A reaches the splitter on beat distance + u, element v of B on beat distance + delay + v
export function hongOuMandel(input: {
  coin: LineCoin
  envelope: readonly bigint[]
  distance: number
  delay: number
  // the pair phases chi of the slot's hard-core walk to run (codes as in unitOf)
  chis?: readonly number[]
}): HongOuMandel {
  const { coin, envelope, distance, delay } = input
  const width = envelope.length
  const reach = distance + delay + width + 2
  const docks = 2 * reach + 3
  const splitter = reach + 1
  const beats = distance + delay + width + 1
  const slots = 2 * docks
  const columns = splitterColumns({ docks, splitter, coin })
  const ring = coin.ring
  let a: Eisenstein[] = new Array<Eisenstein>(slots).fill(ZERO)
  let b: Eisenstein[] = new Array<Eisenstein>(slots).fill(ZERO)

  envelope.forEach((e, u) => {
    a[2 * (splitter - distance - u)] = [e, 0n]
    b[2 * (splitter + distance + delay + u) + 1] = [e, 0n]
  })

  const start = { a, b }

  for (let t = 0; t < beats; t++) {
    a = applyColumns(ring, columns, a)
    b = applyColumns(ring, columns, b)
  }

  // sides after the splitter: right-moving past it, left-moving before it
  const side = (s: number): 'right' | 'left' | 'none' => {
    const x = Math.floor(s / 2)

    if (s % 2 === 0 && x > splitter) {
      return 'right'
    }

    if (s % 2 === 1 && x < splitter) {
      return 'left'
    }

    return 'none'
  }
  const occupied = [...Array(slots).keys()].filter(s => a[s]?.[0] !== 0n || a[s]?.[1] !== 0n || b[s]?.[0] !== 0n || b[s]?.[1] !== 0n)
  const tally = (sign: number): { across: Fraction; same: Fraction } => {
    let across = 0n
    let same = 0n
    let total = 0n

    for (const s1 of occupied) {
      for (const s2 of occupied) {
        const direct = ring.mul(a[s1] ?? ZERO, b[s2] ?? ZERO)
        const swapped = ring.mul(b[s1] ?? ZERO, a[s2] ?? ZERO)
        const amp = sign === 0 ? direct : ring.add(direct, sign > 0 ? swapped : [-swapped[0], -swapped[1]])
        const n = ring.norm(amp)
        const s1Side = side(s1)
        const s2Side = side(s2)

        total += n

        if (s1 === s2) {
          same += n
        }

        if (s1Side !== 'none' && s2Side !== 'none' && s1Side !== s2Side) {
          across += n
        }
      }
    }

    return { across: fraction(across, total), same: fraction(same, total) }
  }
  const coincidence = (sign: number): Fraction => tally(sign).across

  // the closed form
  const p = fraction(ring.norm(coin.keep), 4n)
  const energy = envelope.reduce((sum, e) => sum + e * e, 0n)
  let lag = 0n

  for (let v = 0; v < width; v++) {
    lag += (envelope[v + delay] ?? 0n) * (envelope[v] ?? 0n)
  }

  const overlap = fraction(lag, energy)
  const q = { num: p.den - p.num, den: p.den }
  const pDist = fraction(p.num * p.num + q.num * q.num, p.den * p.den)
  const cross = fraction(2n * p.num * q.num * overlap.num * overlap.num, p.den * p.den * overlap.den * overlap.den)
  const minus = fraction(pDist.num * cross.den - cross.num * pDist.den, pDist.den * cross.den)
  const plus = fraction(pDist.num * cross.den + cross.num * pDist.den, pDist.den * cross.den)

  const hardCore = (input.chis ?? []).map(chi => {
    const phase = unitOf(ring, chi)
    // the start: A's slots all have lower indices than B's, so each pair {sA, sB} is already ordered
    let config = new Map<number, Eisenstein>()

    start.a.forEach((wa, sa) => {
      start.b.forEach((wb, sb) => {
        if ((wa[0] !== 0n || wa[1] !== 0n) && (wb[0] !== 0n || wb[1] !== 0n)) {
          config.set(sa * slots + sb, ring.mul(wa, wb))
        }
      })
    })

    const startNorm = [...config.values()].reduce((sum, w) => sum + ring.norm(w), 0n)

    for (let t = 0; t < beats; t++) {
      config = pairStep({ ring, columns, config, slots, chi: phase })
    }

    let total = 0n
    let across = 0n

    config.forEach((w, key) => {
      const n = ring.norm(w)
      const s1 = Math.floor(key / slots)
      const s2 = key % slots

      total += n

      if (side(s1) !== 'none' && side(s2) !== 'none' && side(s1) !== side(s2)) {
        across += n
      }
    })

    // each beat scales every pair weight by 4, so the norm by 16
    const scale = 16n ** BigInt(beats)

    return { chi, norm: fraction(total, startNorm * scale), coincidence: fraction(across, startNorm * scale) }
  })

  return {
    boson: coincidence(1),
    bosonSameSlot: tally(1).same,
    fermion: coincidence(-1),
    distinguishable: coincidence(0),
    predicted: { boson: minus, fermion: plus, distinguishable: pDist },
    hardCore,
    overlap,
  }
}

// one step of the slot's hard-core two-vibe walk M_chi on configurations {s1 < s2}, keyed s1 * slots + s2.
// The history that puts both vibes in one slot has no configuration and is dropped
export function pairStep(input: {
  ring: Ring
  columns: Columns
  config: ReadonlyMap<number, Eisenstein>
  slots: number
  chi: Eisenstein
}): Map<number, Eisenstein> {
  const { ring, columns, config, slots, chi } = input
  const out = new Map<number, Eisenstein>()
  const add = (key: number, w: Eisenstein): void => {
    out.set(key, ring.add(out.get(key) ?? ZERO, w))
  }

  config.forEach((w, key) => {
    const s1 = Math.floor(key / slots)
    const s2 = key % slots

    for (const [t, u] of columns[s1] ?? []) {
      for (const [t2, v] of columns[s2] ?? []) {
        if (t === t2) {
          continue
        }

        const product = ring.mul(ring.mul(u, v), w)

        if (t < t2) {
          add(t * slots + t2, product)
        } else {
          add(t2 * slots + t, ring.mul(chi, product))
        }
      }
    }
  })

  for (const [key, w] of out) {
    if (w[0] === 0n && w[1] === 0n) {
      out.delete(key)
    }
  }

  return out
}

// The direct and exchanged parts of one start pair's column of M_chi: D(t1, t2) = U(t1, s1) U(t2, s2) and
// X(t1, t2) = U(t2, s1) U(t1, s2) for t1 < t2, so the column is D + chi X; the dropped both-in-one-slot
// weight is B(t) = U(t, s1) U(t, s2). Plain safe-integer Eisenstein pairs
export type PairParts = { direct: Map<number, [number, number]>; exchanged: Map<number, [number, number]>; bunched: Map<number, [number, number]> }

const eTimes = (p: readonly [number, number], q: readonly [number, number]): [number, number] => [p[0] * q[0] - p[1] * q[1], p[0] * q[1] + p[1] * q[0] - p[1] * q[1]]
const eNorm = (p: readonly [number, number]): number => p[0] * p[0] - p[0] * p[1] + p[1] * p[1]

export function pairParts(input: { columns: readonly (readonly (readonly [number, readonly [number, number]])[])[]; s1: number; s2: number; slots: number }): PairParts {
  const { columns, s1, s2, slots } = input
  const direct = new Map<number, [number, number]>()
  const exchanged = new Map<number, [number, number]>()
  const bunched = new Map<number, [number, number]>()
  const add = (map: Map<number, [number, number]>, key: number, w: [number, number]): void => {
    const old = map.get(key) ?? [0, 0]

    map.set(key, [old[0] + w[0], old[1] + w[1]])
  }

  for (const [t, u] of columns[s1] ?? []) {
    for (const [t2, v] of columns[s2] ?? []) {
      const product = eTimes(u, v)

      if (t === t2) {
        add(bunched, t, product)
      } else if (t < t2) {
        add(direct, t * slots + t2, product)
      } else {
        add(exchanged, t2 * slots + t, product)
      }
    }
  }

  return { direct, exchanged, bunched }
}

// |D + chi X|^2 summed, for chi = (+-1) omega^k given as a code (unitOf), in plain integers; throws if a
// number leaves the safe range
export function pairNorm(parts: PairParts, chi: number): number {
  const k = Math.abs(chi) === 1 ? 0 : Math.abs(chi) - 1
  const sign = chi < 0 ? -1 : 1
  const rotate = (p: readonly [number, number]): [number, number] => {
    let out: [number, number] = [p[0], p[1]]

    for (let i = 0; i < k; i++) {
      out = [-out[1], out[0] - out[1]]
    }

    return [sign * out[0], sign * out[1]]
  }
  let total = 0
  const keys = new Set([...parts.direct.keys(), ...parts.exchanged.keys()])

  for (const key of keys) {
    const d = parts.direct.get(key) ?? [0, 0]
    const x = rotate(parts.exchanged.get(key) ?? [0, 0])
    const n = eNorm([d[0] + x[0], d[1] + x[1]])

    total += n
  }

  if (!Number.isSafeInteger(total)) {
    throw new Error('pair norm left the safe integer range')
  }

  return total
}

// the bosons' both-in-one-slot weight: the free symmetric state puts sqrt 2 U U in the doubly occupied
// slot, so its chance is 2 |U(t, s1) U(t, s2)|^2
export function bunchedNorm(parts: PairParts): number {
  let total = 0

  for (const w of parts.bunched.values()) {
    total += 2 * eNorm(w)
  }

  return total
}

// The fear walk's one-beat columns on a ring of `docks` docks (walkBeat's convention), as plain integers
// over 2: slot 2 x moves right, 2 x + 1 left; the coin [keep, reverse] = [1 + omega, 1 - omega]
export function ringColumns(docks: number): [number, [number, number]][][] {
  const keep: [number, number] = [1, 1]
  const reverse: [number, number] = [1, -1]
  const out: [number, [number, number]][][] = []

  for (let x = 0; x < docks; x++) {
    const r = (x + 1) % docks
    const l = (x - 1 + docks) % docks

    out.push([
      [2 * r, keep],
      [2 * l + 1, reverse],
    ])
    out.push([
      [2 * r, reverse],
      [2 * l + 1, keep],
    ])
  }

  return out
}

// compose plain-integer columns: (second after first)
export function composeColumns(
  first: readonly (readonly (readonly [number, readonly [number, number]])[])[],
  second: readonly (readonly (readonly [number, readonly [number, number]])[])[],
): [number, [number, number]][][] {
  return first.map(column => {
    const acc = new Map<number, [number, number]>()

    for (const [mid, u] of column) {
      for (const [t, v] of second[mid] ?? []) {
        const w = eTimes(v, u)
        const old = acc.get(t) ?? [0, 0]

        acc.set(t, [old[0] + w[0], old[1] + w[1]])
      }
    }

    return [...acc.entries()].filter(([, w]) => w[0] !== 0 || w[1] !== 0)
  })
}

// The 3D husk fear walk: an L^3 torus, two slots per dock (0 forward, 1 back along the current axis), a beat
// the coin then a stream along each axis of the order; the palindrome x y z z y x by default. Plain integer
// columns over 2^(order length)
export function huskWalkColumns(input: { side: number; order?: readonly number[] }): [number, [number, number]][][] {
  const side = input.side
  const order = input.order ?? [0, 1, 2, 2, 1, 0]
  const docks = side ** 3
  const step = (x: number, axis: number, by: number): number => {
    const c = [x % side, Math.floor(x / side) % side, Math.floor(x / (side * side))]

    c[axis] = (((c[axis] ?? 0) + by) % side + side) % side

    return (c[0] ?? 0) + side * (c[1] ?? 0) + side * side * (c[2] ?? 0)
  }
  const substep = (axis: number): [number, [number, number]][][] => {
    const out: [number, [number, number]][][] = []

    for (let x = 0; x < docks; x++) {
      const f = step(x, axis, 1)
      const b = step(x, axis, -1)

      out.push([
        [2 * f, [1, 1]],
        [2 * b + 1, [1, -1]],
      ])
      out.push([
        [2 * f, [1, -1]],
        [2 * b + 1, [1, 1]],
      ])
    }

    return out
  }

  let columns = substep(order[0] ?? 0)

  for (const axis of order.slice(1)) {
    columns = composeColumns(columns, substep(axis))
  }

  return columns
}

// A dense complex k x k coin's two-vibe column norms for M_chi, chi = e^(i theta), over every start pair,
// and the largest departure from 1 (the Gram check for chi = -1 is in pairGramDeparture)
export function denseCoinPairDeparture(input: { re: readonly (readonly number[])[]; im: readonly (readonly number[])[]; theta: number }): number {
  const { re, im, theta } = input
  const k = re.length
  const cr = Math.cos(theta)
  const ci = Math.sin(theta)
  let worst = 0

  // U(t, s) = re[t][s] + i im[t][s]
  for (let s1 = 0; s1 < k; s1++) {
    for (let s2 = s1 + 1; s2 < k; s2++) {
      let total = 0

      for (let t1 = 0; t1 < k; t1++) {
        for (let t2 = t1 + 1; t2 < k; t2++) {
          const [dr, di] = cmul(re[t1]?.[s1] ?? 0, im[t1]?.[s1] ?? 0, re[t2]?.[s2] ?? 0, im[t2]?.[s2] ?? 0)
          const [xr0, xi0] = cmul(re[t2]?.[s1] ?? 0, im[t2]?.[s1] ?? 0, re[t1]?.[s2] ?? 0, im[t1]?.[s2] ?? 0)
          const [xr, xi] = cmul(cr, ci, xr0, xi0)

          total += (dr + xr) ** 2 + (di + xi) ** 2
        }
      }

      worst = Math.max(worst, Math.abs(total - 1))
    }
  }

  return worst
}

function cmul(a: number, b: number, c: number, d: number): [number, number] {
  return [a * c - b * d, a * d + b * c]
}

// A two-token whole (code/rule/fear-weave) for the uniform mixture of real pure two-role states, each
// given by its 9 amplitudes on |3 i + j>, in the fewest whole units, with the fear weave's own phase points
export function twoRoleWhole(states: readonly (readonly number[])[]): { whole: Whole; units: bigint } {
  const points = twoRolePoints()
  const sum = new Array<number>(81).fill(0)

  for (const amplitude of states) {
    const w = gridWeights({ re: [...amplitude], im: new Array<number>(9).fill(0), points })

    w.forEach((x, i) => {
      sum[i] = (sum[i] ?? 0) + x / states.length
    })
  }

  for (let n = 1; n <= 10000; n++) {
    if (sum.every(x => Math.abs(n * x - Math.round(n * x)) < 1e-9)) {
      return { whole: { tokens: [0, 1], weight: sum.map(x => BigInt(Math.round(n * x))) }, units: BigInt(n) }
    }
  }

  throw new Error('no whole units under 10000')
}

// the exact chance that the first token holds role i and the second role j: 9 sum_x W(x) W_ij(x), with
// W_ij the weights of the basis product |i j>, which are ninths
export function roleChance(whole: Whole, i: number, j: number): Fraction {
  const amplitude = new Array<number>(9).fill(0)

  amplitude[3 * i + j] = 1

  const w = gridWeights({ re: amplitude, im: new Array<number>(9).fill(0), points: twoRolePoints() })
  let num = 0n

  w.forEach((x, p) => {
    const nine = Math.round(9 * x)

    if (Math.abs(9 * x - nine) > 1e-9) {
      throw new Error('basis weights are not ninths')
    }

    num += BigInt(nine) * (whole.weight[p] ?? 0n)
  })

  return fraction(num, whole.weight.reduce((a, b) => a + b, 0n))
}
