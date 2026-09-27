// The fear walk solved in momentum space (E-CMP-0017): its symbol, its exact dispersion, an exact closed-form
// propagator valid at any beat and distance, and the stationary-phase formula for it.
//
// The fear walk (code/rule/fear-walk, E-QTM-0103) is a lone vibe's weight on the two slots of its line: each
// beat the coin [keep, reverse] acts on each dock's (right, left) pair and the right slot streams one dock
// right, the left one dock left. It is linear, local and the same at every dock, so a plane wave e^(i k x)
// is carried to itself times a 2 x 2 matrix, the SYMBOL. Writing the weight as the generating function
// G(z) = sum_x psi_x z^x, a beat multiplies it by
//
//   U(z) = [[K z, R z], [R / z, K / z]] / 2        (rows right', left'; columns right, left)
//
// with K = 2 keep and R = 2 reverse the whole-number coin (for the fear coin, K = 1 + omega, R = 1 - omega).
// Nothing here is typed in by hand: the transfer is read off walkBeat itself by probing it with a unit
// weight on each slot, and every exact claim below is checked against it.
//
// THE DISPERSION. tr U = K (z + 1/z) / 2 and det U = (K^2 - R^2) / 4, exactly, as Laurent polynomials with
// Eisenstein coefficients. For the fear coin K = -omega^2 is a unit and det U = omega, so on z = e^(i k)
// the eigenvalues are e^(i pi / 3) e^(+-i W(k)) with cos W(k) = cos(k) / 2: a lone vibe is a free particle
// of frequency W(k), group velocity W'(k) = sin k / sqrt(4 - cos^2 k) (at most 1/2 dock per beat, at
// k = pi / 2) and, at k = 0, W = pi / 3 + k^2 / (2 sqrt 3): a rest mass of sqrt 3 in beat and dock units.
//
// THE EXACT PROPAGATOR. By Cayley-Hamilton, (2U)^t = P_t (2U) - D P_(t-1), with D = K^2 - R^2 and
// P_(t+1) = T P_t - D P_(t-1), T = K (z + 1/z), P_0 = 0, P_1 = 1. Expanding, the coefficient of z^x is
//
//   [P_t]_x = sum_j C(t - 1 - j, j) (-D)^j K^m C(m, (m - x) / 2),   m = t - 1 - 2 j >= |x|, m = x mod 2
//
// so the weight at (t, x), as whole numbers over 2^t, is a single sum of about t/2 terms: from a unit on the
// right slot, right(x) = K [P_t]_(x-1) - D [P_(t-1)]_x and left(x) = R [P_t]_(x+1). That is exact at any
// beat and any distance with no walk run: at t = 10^5 one weight is a sum of 5 x 10^4 binomial terms, where
// the walk would take 10^10 dock updates.
//
// THE FORMULA. Away from the light cone's edge |x| = t/2, the stationary points of the phase
// t (pi/3 +- W(k)) - k x give the weight to O(t^(-3/2)): four points (two per branch) where +-W'(k) = x/t,
// each contributing Pi(k) e_start e^(i phase) sqrt(2 pi / (t |W''|)) e^(+-i pi/4) / (2 pi), with
// W''(k) = 3 cos k / (4 - cos^2 k)^(3/2). Outside the cone the weight is exponentially small. And the
// weight's spread, in the long run, is the group velocity's distribution: <x^2> / t^2 tends to the average
// of W'(k)^2 over k, which is 1 - sqrt 3 / 2.

import { type Coin, type Eisenstein, walkBeat, walkStart, times, plus, norm, ZERO } from '@/code/rule/fear-walk'

export type Complex = { readonly re: number; readonly im: number }

const SQRT3 = Math.sqrt(3)
const cx = (re: number, im = 0): Complex => ({ re, im })
const add = (a: Complex, b: Complex): Complex => ({ re: a.re + b.re, im: a.im + b.im })
const sub = (a: Complex, b: Complex): Complex => ({ re: a.re - b.re, im: a.im - b.im })
const mul = (a: Complex, b: Complex): Complex => ({ re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re })
const div = (a: Complex, b: Complex): Complex => {
  const d = b.re * b.re + b.im * b.im

  return { re: (a.re * b.re + a.im * b.im) / d, im: (a.im * b.re - a.re * b.im) / d }
}
const expi = (theta: number): Complex => ({ re: Math.cos(theta), im: Math.sin(theta) })

export const complexOf = (z: Eisenstein): Complex => ({ re: Number(z[0]) - Number(z[1]) / 2, im: (Number(z[1]) * SQRT3) / 2 })

// the one-beat transfer, read off walkBeat: entry [to][from][shift + 1] is the whole-number weight landing
// on slot `to` (0 right, 1 left) of dock x + shift from a unit on slot `from` of dock x
export type Transfer = readonly (readonly (readonly Eisenstein[])[])[]

export function transferOf(coin: Coin): Transfer {
  const cells = 7
  const middle = 3

  return [0, 1].map(to =>
    [0, 1].map(from => {
      const moved = walkBeat(walkStart(cells, middle, from === 0), () => coin)

      return [-1, 0, 1].map(shift => (to === 0 ? moved.right : moved.left)[middle + shift] ?? ZERO)
    }),
  )
}

// the symbol at momentum k (G(z) convention, z = e^(i k)), U = sum_shift T_shift z^shift / 2
export function symbolAt(transfer: Transfer, k: number): Complex[][] {
  return [0, 1].map(to =>
    [0, 1].map(from =>
      [-1, 0, 1].reduce((sum, shift) => add(sum, mul(complexOf(transfer[to]?.[from]?.[shift + 1] ?? ZERO), expi(k * shift))), cx(0)),
    ).map(z => ({ re: z.re / 2, im: z.im / 2 })),
  )
}

// exact Laurent polynomials in z, coefficients Eisenstein, keyed by the power
type Laurent = Map<number, Eisenstein>

const laurentOfEntry = (transfer: Transfer, to: number, from: number): Laurent =>
  new Map([-1, 0, 1].map(shift => [shift, transfer[to]?.[from]?.[shift + 1] ?? ZERO] as [number, Eisenstein]).filter(([, w]) => w[0] !== 0n || w[1] !== 0n))

const laurentTimes = (p: Laurent, q: Laurent): Laurent => {
  const out: Laurent = new Map()

  for (const [a, x] of p) {
    for (const [b, y] of q) {
      out.set(a + b, plus(out.get(a + b) ?? ZERO, times(x, y)))
    }
  }

  return new Map([...out].filter(([, w]) => w[0] !== 0n || w[1] !== 0n))
}

const laurentPlus = (p: Laurent, q: Laurent, sign: bigint): Laurent => {
  const out: Laurent = new Map(p)

  for (const [a, y] of q) {
    const x = out.get(a) ?? ZERO

    out.set(a, [x[0] + sign * y[0], x[1] + sign * y[1]])
  }

  return new Map([...out].filter(([, w]) => w[0] !== 0n || w[1] !== 0n))
}

const laurentText = (p: Laurent): string =>
  [...p].sort((a, b) => a[0] - b[0]).map(([a, w]) => `${w[0]}${w[1] >= 0n ? '+' : ''}${w[1]}w z^${a}`).join(' ')

// the exact trace and determinant of the doubled symbol 2U, as Laurent polynomials
export function exactInvariants(transfer: Transfer): { trace: string; determinant: string; keep: Eisenstein; reverse: Eisenstein; det: Eisenstein } {
  const e = (to: number, from: number): Laurent => laurentOfEntry(transfer, to, from)
  const trace = laurentPlus(e(0, 0), e(1, 1), 1n)
  const determinant = laurentPlus(laurentTimes(e(0, 0), e(1, 1)), laurentTimes(e(0, 1), e(1, 0)), -1n)

  return {
    trace: laurentText(trace),
    determinant: laurentText(determinant),
    keep: transfer[0]?.[0]?.[2] ?? ZERO,
    reverse: transfer[0]?.[1]?.[2] ?? ZERO,
    det: determinant.get(0) ?? ZERO,
  }
}

// the dispersion of the fear coin: W(k) with the eigenvalues e^(i pi/3) e^(+-i W(k))
export const frequency = (k: number): number => Math.acos(Math.cos(k) / 2)
export const groupVelocity = (k: number): number => Math.sin(k) / Math.sqrt(4 - Math.cos(k) ** 2)
export const curvature = (k: number): number => (3 * Math.cos(k)) / (4 - Math.cos(k) ** 2) ** 1.5

// the eigenvalues and projectors of the symbol at k, branch s = +1, -1 with lambda_s = e^(i pi/3) e^(i s W)
export function spectrum(transfer: Transfer, k: number): { lambda: Complex[]; projector: Complex[][][] } {
  const u = symbolAt(transfer, k)
  const w = frequency(k)
  const lambda = [1, -1].map(s => expi(Math.PI / 3 + s * w))
  const projector = [0, 1].map(b => {
    const other = lambda[1 - b] ?? cx(0)
    const gap = sub(lambda[b] ?? cx(0), other)

    return [0, 1].map(i => [0, 1].map(j => div(sub(u[i]?.[j] ?? cx(0), i === j ? other : cx(0)), gap)))
  })

  return { lambda, projector }
}

// binomials C(n, i) as bigint
function binomial(n: number, i: number): bigint {
  if (i < 0 || i > n) {
    return 0n
  }

  const r = Math.min(i, n - i)
  let out = 1n

  for (let q = 1; q <= r; q++) {
    out = (out * BigInt(n - r + q)) / BigInt(q)
  }

  return out
}

const powerTable = (z: Eisenstein, n: number): Eisenstein[] => {
  const out: Eisenstein[] = [[1n, 0n]]

  for (let q = 1; q <= n; q++) {
    out.push(times(out[q - 1] ?? ZERO, z))
  }

  return out
}

// [P_t]_x, exactly: sum_j C(t-1-j, j) (-D)^j K^m C(m, (m - x) / 2), m = t - 1 - 2 j
function chebyshevCoefficient(t: number, x: number, powers: { k: (m: number) => Eisenstein; d: Eisenstein }): Eisenstein {
  const n = t - 1
  const ax = Math.abs(x)

  if (n < 0 || ((n - ax) % 2 + 2) % 2 !== 0 || ax > n) {
    return ZERO
  }

  let total: Eisenstein = ZERO
  // j = 0 first: m = n, i = (n - x) / 2
  let m = n
  let i = (n - x) / 2
  // the running term E_j = C(n - j, j) C(m, i) (-D)^j, updated by small factors only: from j to j + 1,
  // C(n - j - 1, j + 1) = C(n - j, j) (n - 2j) (n - 2j - 1) / ((j + 1) (n - j)) and
  // C(m - 2, i - 1) = C(m, i) i (m - i) / (m (m - 1)); the division is exact in each component, since the
  // product is the denominator times an Eisenstein integer
  const first = binomial(m, i)
  let term: Eisenstein = [first, 0n]

  for (let j = 0; m >= ax; j++) {
    total = plus(total, times(term, powers.k(m)))

    if (m - 2 < ax) {
      break
    }

    const numerator = BigInt(n - 2 * j) * BigInt(n - 2 * j - 1) * BigInt(i) * BigInt(m - i)
    const denominator = BigInt(j + 1) * BigInt(n - j) * BigInt(m) * BigInt(m - 1)
    const moved = times(term, powers.d)

    term = [(moved[0] * numerator) / denominator, (moved[1] * numerator) / denominator]
    m -= 2
    i -= 1
  }

  return total
}

export type Propagator = {
  readonly keep: Eisenstein
  readonly reverse: Eisenstein
  readonly det: Eisenstein
  // the whole-number weight (over 2^t) on the right and left slot of dock x after t beats, from a unit on the
  // right (or left) slot of dock 0
  readonly weight: (t: number, x: number, start: 'right' | 'left') => { right: Eisenstein; left: Eisenstein }
}

export function exactPropagator(transfer: Transfer, maxBeat: number): Propagator {
  const keep = transfer[0]?.[0]?.[2] ?? ZERO
  const reverse = transfer[0]?.[1]?.[2] ?? ZERO
  const same = (w: Eisenstein | undefined, z: Eisenstein): boolean => w !== undefined && w[0] === z[0] && w[1] === z[1]
  // the closed form holds for the walk's shape: right' = z (K right + R left), left' = (R right + K left) / z
  const shaped =
    [0, 1].every(to => [0, 1].every(from => (transfer[to]?.[from] ?? []).every((w, q) => (q === (to === 0 ? 2 : 0) ? true : same(w, ZERO))))) &&
    same(transfer[1]?.[1]?.[0], keep) &&
    same(transfer[1]?.[0]?.[0], reverse)

  if (!shaped) {
    throw new Error('exactPropagator: the transfer is not a two-slot walk with one coin')
  }

  const det = exactInvariants(transfer).det
  const minusDet: Eisenstein = [-det[0], -det[1]]
  // K^m: a unit of Z[omega] has order dividing 6, so six powers serve every m; otherwise a table
  const unit = norm(keep) === 1n
  const table = powerTable(keep, unit ? 6 : maxBeat)
  const powers = { k: (m: number): Eisenstein => table[unit ? m % 6 : m] ?? ZERO, d: minusDet }
  const p = (t: number, x: number): Eisenstein => chebyshevCoefficient(t, x, powers)

  return {
    keep,
    reverse,
    det,
    weight: (t, x, start) => {
      if (t === 0) {
        const one: Eisenstein = [x === 0 ? 1n : 0n, 0n]

        return start === 'right' ? { right: one, left: ZERO } : { right: ZERO, left: one }
      }

      // (2U)^t e = P_t (2U) e - D P_(t-1) e
      if (start === 'right') {
        const right = plus(times(keep, p(t, x - 1)), times(minusDet, p(t - 1, x)))

        return { right, left: times(reverse, p(t, x + 1)) }
      }

      return { right: times(reverse, p(t, x - 1)), left: plus(times(keep, p(t, x + 1)), times(minusDet, p(t - 1, x))) }
    },
  }
}

// a nonnegative ratio of big integers as a float, however small
export function bigRatio(num: bigint, den: bigint): number {
  if (num === 0n) {
    return 0
  }

  const shift = BigInt(Math.max(0, den.toString(2).length - num.toString(2).length + 60))
  const scaled = (num << shift) / den

  return Number(scaled) * 2 ** -Number(shift)
}

// the chance on dock x after t beats from a start slot, exactly, as a float
export function exactChance(prop: Propagator, t: number, x: number, start: 'right' | 'left'): number {
  const w = prop.weight(t, x, start)

  return bigRatio(norm(w.right) + norm(w.left), 4n ** BigInt(t))
}

// the stationary-phase weight on dock x after t beats (complex, not scaled), from a start slot
export function stationaryWeight(transfer: Transfer, t: number, x: number, start: 'right' | 'left'): { right: Complex; left: Complex } {
  const v = x / t

  if (Math.abs(v) >= 0.5) {
    return { right: cx(0), left: cx(0) }
  }

  const base = Math.asin((SQRT3 * Math.abs(v)) / Math.sqrt(1 - v * v))
  const e = start === 'right' ? 0 : 1
  let right = cx(0)
  let left = cx(0)

  for (const s of [1, -1]) {
    // s W'(k) = v: sin k has the sign of s v
    const sign = Math.sign(s * v) || 1

    for (const k of [sign * base, sign * (Math.PI - base)]) {
      const { projector } = spectrum(transfer, k)
      const b = s === 1 ? 0 : 1
      const second = s * t * curvature(k)
      const phase = t * (Math.PI / 3 + s * frequency(k)) - k * x + (Math.sign(second) * Math.PI) / 4
      const size = Math.sqrt((2 * Math.PI) / Math.abs(second)) / (2 * Math.PI)
      const factor = mul(expi(phase), cx(size))

      right = add(right, mul(projector[b]?.[0]?.[e] ?? cx(0), factor))
      left = add(left, mul(projector[b]?.[1]?.[e] ?? cx(0), factor))
    }
  }

  return { right, left }
}

// the long-run limit of <x^n> / t^n from the symbol: the group velocity's n-th moment weighted by the start's
// projection on each branch, averaged over k (midpoint rule on `samples` points)
export function limitMoment(transfer: Transfer, n: number, start: 'right' | 'left', samples = 200000): number {
  const e = start === 'right' ? 0 : 1
  let sum = 0

  for (let q = 0; q < samples; q++) {
    const k = -Math.PI + ((q + 0.5) * 2 * Math.PI) / samples
    const { projector } = spectrum(transfer, k)

    for (const [b, s] of [[0, 1], [1, -1]] as const) {
      const r = projector[b]?.[0]?.[e] ?? cx(0)
      const l = projector[b]?.[1]?.[e] ?? cx(0)
      const weight = r.re * r.re + r.im * r.im + l.re * l.re + l.im * l.im

      sum += weight * (s * groupVelocity(k)) ** n
    }
  }

  return sum / samples
}
