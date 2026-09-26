// The exact lattice Landau spectrum of the charged fear walk (code/measure/charged-walk), E-FRC-0182.
//
// E-FRC-0176 put the fear walk in a uniform husk field, B per plaquette in the Landau gauge theta_y = B x,
// and read Landau levels spaced 0.909 to 0.770 of the continuum 2 q B. The continuum number comes from the
// band's curvature alone, phase = (k Q k) / 2 with omega_c = q B sqrt(det Q). The lattice answer is the
// spectrum of the walk's own beat in the field, a Hofstadter problem for a two-slot walk. It is computed
// here exactly, with no time evolution:
//
// - In the Landau gauge the y streams carry a phase that depends on x alone, so a state e^(i k_y y) phi(x)
//   stays one: the beat reduces, for each k_y, to a walk on the x line whose y streams multiply slot 0 by
//   e^(i (q B x - k_y)) and slot 1 by its conjugate (the free symbol's diag(e^(-i k), e^(i k)) with the
//   kinetic momentum k = k_y - q B x). The orbit center sits where q B x = k_y. The line is cut to a strip
//   of `width` docks with the center in the middle and a reflecting wall at each end (slot 0 at the last dock
//   turns into slot 1 there, and back at the first), which keeps the beat unitary. A bulk level is one whose
//   eigenvector lies in the middle half of the strip: it is the infinite-plane level up to its tail at the
//   walls, e^(-(width / 4)^2 / (2 l^2)) with l = 1 / sqrt(q B), about e^(-32) at 40 quanta on width 64.
//   Two facts of the walk set the width. The palindrome streams y twice at one x, so the beat is unchanged
//   when q B x moves by pi, and the orbit centers repeat every pi / (q B) docks: a strip wider than about
//   that holds several copies of each level. And the beat moves x by an even number of docks, so every level
//   comes twice, once on the even docks and once on the odd (bulkStates keeps one)
// - The strip's beat U is built column by column from the same coin and streams, and its eigenphases are read
//   through the Cayley transform H = i (I - U)(I + U)^(-1), which is Hermitian with eigenvalue tan(phi / 2)
//   for each eigenphase phi, so phi = 2 atan(lambda), with Hermitian eigenvectors (eigHermitian)
//
// And the semiclassical reading of the same band, to say where the lattice correction comes from: Onsager's
// rule S(E_n) = 2 pi q B (n + 1/2), S(E) the k-space area inside the contour phase(k) = E of the band through
// 0, which is exact in the continuum limit and carries the band's full shape, not its curvature alone. With
// S(E) = (2 pi / w0) |E| (1 + beta |E| + ...), w0 = sqrt(det Q), the n-th spacing falls short of omega_c by
// the relative amount 2 beta omega_c (n + 1) to first order: a deficit linear in B and in n + 1.

import { eigHermitian } from '@/code/algebra/linear/eig-hermitian'
import { makeComplexMatrix } from '@/code/algebra/linear/dense'
import { complexInverse, complexMultiply, type ComplexMatrix } from '@/code/algebra/linear/complex-matrix'
import { chargedBeat, copyWalk, overlapOf, symbolPhases, type Field, type FloatWalk, type Order } from '@/code/measure/charged-walk'

const A: readonly [number, number] = [0.25, Math.sqrt(3) / 4] // (1 + omega) / 2
const B: readonly [number, number] = [0.75, -Math.sqrt(3) / 4] // (1 - omega) / 2

// the fraction of an eigenvector that must lie in the middle half of the strip for it to count as bulk
const BULK_WEIGHT = 0.999

// the strip state: slot 0 and slot 1 on docks 0 .. width - 1
type Strip = { re0: Float64Array; im0: Float64Array; re1: Float64Array; im1: Float64Array }

function coin(s: Strip): void {
  for (let i = 0; i < s.re0.length; i++) {
    const r0 = s.re0[i] as number
    const i0 = s.im0[i] as number
    const r1 = s.re1[i] as number
    const i1 = s.im1[i] as number

    s.re0[i] = A[0] * r0 - A[1] * i0 + B[0] * r1 - B[1] * i1
    s.im0[i] = A[0] * i0 + A[1] * r0 + B[0] * i1 + B[1] * r1
    s.re1[i] = B[0] * r0 - B[1] * i0 + A[0] * r1 - A[1] * i1
    s.im1[i] = B[0] * i0 + B[1] * r0 + A[0] * i1 + A[1] * r1
  }
}

// the x stream: slot 0 one dock forward, slot 1 one dock back, each turning into the other slot at a wall
function streamX(s: Strip): void {
  const w = s.re0.length
  const re0 = new Float64Array(w)
  const im0 = new Float64Array(w)
  const re1 = new Float64Array(w)
  const im1 = new Float64Array(w)

  for (let x = 0; x < w; x++) {
    if (x + 1 < w) {
      re0[x + 1] = s.re0[x] as number
      im0[x + 1] = s.im0[x] as number
    } else {
      re1[x] = s.re0[x] as number
      im1[x] = s.im0[x] as number
    }

    if (x > 0) {
      re1[x - 1] = s.re1[x] as number
      im1[x - 1] = s.im1[x] as number
    } else {
      re0[x] = s.re1[x] as number
      im0[x] = s.im1[x] as number
    }
  }

  s.re0.set(re0)
  s.im0.set(im0)
  s.re1.set(re1)
  s.im1.set(im1)
}

// the y stream at momentum k_y: slot 0 times e^(i theta_x), slot 1 times e^(-i theta_x), theta_x = q B (x - c)
function streamY(s: Strip, theta: Float64Array): void {
  for (let x = 0; x < s.re0.length; x++) {
    const c = Math.cos(theta[x] as number)
    const n = Math.sin(theta[x] as number)
    const r0 = s.re0[x] as number
    const i0 = s.im0[x] as number
    const r1 = s.re1[x] as number
    const i1 = s.im1[x] as number

    s.re0[x] = r0 * c - i0 * n
    s.im0[x] = r0 * n + i0 * c
    s.re1[x] = r1 * c + i1 * n
    s.im1[x] = i1 * c - r1 * n
  }
}

export type LandauStrip = {
  // the beat, a 2 width square unitary on (slot 0 at docks 0 .. width - 1, then slot 1)
  readonly beat: ComplexMatrix
  readonly width: number
  // the orbit center, in docks from the first
  readonly center: number
}

// the strip's one-beat operator for a field of q B per plaquette with the orbit center at `center`
export function landauStrip(input: { width: number; field: number; charge: number; center: number; order: Order }): LandauStrip {
  const { width, center, order } = input
  const qb = input.charge * input.field
  const theta = Float64Array.from({ length: width }, (_, x) => qb * (x - center))
  const n = 2 * width
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)

  for (let column = 0; column < n; column++) {
    const s: Strip = { re0: new Float64Array(width), im0: new Float64Array(width), re1: new Float64Array(width), im1: new Float64Array(width) }

    if (column < width) {
      s.re0[column] = 1
    } else {
      s.re1[column - width] = 1
    }

    for (const axis of order) {
      coin(s)

      if (axis === 'x') {
        streamX(s)
      } else {
        streamY(s, theta)
      }
    }

    for (let x = 0; x < width; x++) {
      re[x * n + column] = s.re0[x] as number
      im[x * n + column] = s.im0[x] as number
      re[(width + x) * n + column] = s.re1[x] as number
      im[(width + x) * n + column] = s.im1[x] as number
    }
  }

  return { beat: { re, im, n }, width, center }
}

// the largest entry of |U U^dagger - I|
export function unitarityError(u: ComplexMatrix): number {
  const n = u.n
  const dagger: ComplexMatrix = { re: new Float64Array(n * n), im: new Float64Array(n * n), n }

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      dagger.re[j * n + i] = u.re[i * n + j] as number
      dagger.im[j * n + i] = -(u.im[i * n + j] as number)
    }
  }

  const p = complexMultiply(u, dagger)

  let worst = 0

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      worst = Math.max(worst, Math.hypot((p.re[i * n + j] as number) - (i === j ? 1 : 0), p.im[i * n + j] as number))
    }
  }

  return worst
}

// one eigenstate of the strip's beat: its eigenphase, the weight of its eigenvector in the middle half of the
// strip, and the eigenvector (slot 0 on docks 0 .. width - 1, then slot 1)
export type StripLevel = { phase: number; bulk: number; re: Float64Array; im: Float64Array }

// every eigenstate of the strip's beat, ascending in phase
export function stripSpectrum(strip: LandauStrip): StripLevel[] {
  const { beat, width } = strip
  const n = beat.n
  // I + U and I - U
  const plus: ComplexMatrix = { re: Float64Array.from(beat.re), im: Float64Array.from(beat.im), n }
  const minus: ComplexMatrix = { re: Float64Array.from(beat.re, x => -x), im: Float64Array.from(beat.im, x => -x), n }

  for (let i = 0; i < n; i++) {
    plus.re[i * n + i] = (plus.re[i * n + i] as number) + 1
    minus.re[i * n + i] = (minus.re[i * n + i] as number) + 1
  }

  // H = i (I - U)(I + U)^(-1), symmetrized against rounding
  const product = complexMultiply(minus, complexInverse(plus))
  const h = makeComplexMatrix({ rows: n, cols: n })

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      // i (a + i b) = -b + i a, then (H + H^dagger) / 2
      const hij = [-(product.im[i * n + j] as number), product.re[i * n + j] as number]
      const hji = [-(product.im[j * n + i] as number), product.re[j * n + i] as number]

      h.re[i * n + j] = ((hij[0] as number) + (hji[0] as number)) / 2
      h.im[i * n + j] = ((hij[1] as number) - (hji[1] as number)) / 2
    }
  }

  const eig = eigHermitian({ matrix: h })
  const lo = Math.floor(width / 4)
  const hi = Math.ceil((3 * width) / 4)

  return Array.from(eig.values, (lambda, i) => {
    let inside = 0
    let total = 0

    for (let a = 0; a < n; a++) {
      const x = a % width
      const p = (eig.vectorsRe[a * n + i] as number) ** 2 + (eig.vectorsIm[a * n + i] as number) ** 2

      total += p
      inside += x >= lo && x < hi ? p : 0
    }

    return {
      phase: 2 * Math.atan(lambda),
      bulk: inside / total,
      re: Float64Array.from({ length: n }, (_, a) => eig.vectorsRe[a * n + i] as number),
      im: Float64Array.from({ length: n }, (_, a) => eig.vectorsIm[a * n + i] as number),
    }
  })
}

// the bulk eigenstates with phase in (bottom, top), highest phase first. The beat moves x by an even number
// of docks (two x streams a beat), so the strip splits into its even and odd docks and every bulk level comes
// twice: states within `same` of a kept one are dropped, one state per level
export function bulkStates(strip: LandauStrip, top = 0.05, bottom = -1, same = 1e-7): StripLevel[] {
  const kept: StripLevel[] = []

  for (const l of stripSpectrum(strip)
    .filter(s => s.bulk >= BULK_WEIGHT && s.phase < top && s.phase > bottom)
    .sort((x, y) => y.phase - x.phase)) {
    if (!kept.some(k => Math.abs(k.phase - l.phase) < same)) {
      kept.push(l)
    }
  }

  return kept
}

// the bulk Landau levels in (bottom, top), highest first (the band through 0 bends down: level n at about
// -omega_c (n + 1/2)), one per level
export function bulkLevels(strip: LandauStrip, top = 0.05, bottom = -1): number[] {
  return bulkStates(strip, top, bottom).map(l => l.phase)
}

// the phase of the band through 0 at k = 0
export function bandPhase(kx: number, ky: number, order: Order): number {
  const [p1, p2] = symbolPhases(kx, ky, order)

  return Math.abs(p1) < Math.abs(p2) ? p1 : p2
}

// the k-space area inside the contour bandPhase = level (level < 0), by rays from k = 0: on each of `rays`
// directions the radius where the phase first reaches the level, by bisection, then S = (1/2) sum r^2 dtheta
export function contourArea(level: number, order: Order, rays = 720): number {
  let area = 0

  for (let j = 0; j < rays; j++) {
    const t = (2 * Math.PI * (j + 0.5)) / rays
    const c = Math.cos(t)
    const s = Math.sin(t)

    let lo = 0
    let hi = 0.05

    while (bandPhase(hi * c, hi * s, order) > level && hi < Math.PI) {
      lo = hi
      hi *= 1.5
    }

    for (let i = 0; i < 60; i++) {
      const mid = (lo + hi) / 2

      if (bandPhase(mid * c, mid * s, order) > level) {
        lo = mid
      } else {
        hi = mid
      }
    }

    area += ((lo + hi) / 2) ** 2 / 2
  }

  return (area * 2 * Math.PI) / rays
}

// Onsager's levels: the n-th solves contourArea(E) = 2 pi q B (n + 1/2), by bisection in E below 0
export function onsagerLevels(input: { field: number; charge: number; count: number; order: Order }): number[] {
  const qb = input.charge * input.field

  return Array.from({ length: input.count }, (_, n) => {
    const target = 2 * Math.PI * qb * (n + 0.5)

    let hi = 0
    let lo = -1

    for (let i = 0; i < 50; i++) {
      const mid = (lo + hi) / 2

      if (contourArea(mid, input.order) < target) {
        hi = mid
      } else {
        lo = mid
      }
    }

    return (lo + hi) / 2
  })
}

// beta of S(E) = (2 pi / w0) |E| (1 + beta |E| + ...), from the areas at two small depths (a Richardson pair)
export function areaNonlinearity(input: { w0: number; order: Order; depth?: number }): number {
  const e = input.depth ?? 0.01
  const ratio = (d: number): number => (contourArea(-d, input.order) * input.w0) / (2 * Math.PI * d) - 1

  // ratio(d) = beta d + gamma d^2: beta = (4 ratio(d) - ratio(2 d)) / (2 d)
  return (4 * ratio(e) - ratio(2 * e)) / (2 * e)
}

// Lift a strip eigenvector onto the side^2 torus of code/measure/charged-walk as e^(i k_y y) phi(x), docks
// x0 .. x0 + width - 1 of the torus holding the strip, with k_y = q B (x0 + center): the state E-FRC-0176's
// torus beat should turn by the strip's eigenphase, as long as phi is far from the torus seam
export function liftToTorus(input: { state: StripLevel; strip: LandauStrip; side: number; x0: number; field: number; charge: number }): FloatWalk {
  const { state, strip, side, x0 } = input
  const w = strip.width
  const ky = input.charge * input.field * (x0 + strip.center)
  const walk: FloatWalk = {
    re: [new Float64Array(side * side), new Float64Array(side * side)],
    im: [new Float64Array(side * side), new Float64Array(side * side)],
  }

  for (let y = 0; y < side; y++) {
    const c = Math.cos(ky * y)
    const s = Math.sin(ky * y)

    for (let x = 0; x < w; x++) {
      const i = x0 + x + side * y

      for (const slot of [0, 1] as const) {
        const re = state.re[slot * w + x] as number
        const im = state.im[slot * w + x] as number

        walk.re[slot][i] = (re * c - im * s) / Math.sqrt(side)
        walk.im[slot][i] = (re * s + im * c) / Math.sqrt(side)
      }
    }
  }

  return walk
}

// the largest |U psi - e^(i phase) psi| entry after one torus beat
export function torusResidual(input: { walk: FloatWalk; field: Field; charge: number; order: Order; phase: number }): number {
  const after = copyWalk(input.walk)
  const c = Math.cos(input.phase)
  const s = Math.sin(input.phase)

  chargedBeat(after, input.field, input.charge, input.order)

  let worst = 0

  for (const slot of [0, 1] as const) {
    for (let i = 0; i < after.re[slot].length; i++) {
      const re = input.walk.re[slot][i] as number
      const im = input.walk.im[slot][i] as number

      worst = Math.max(worst, Math.hypot((after.re[slot][i] as number) - (re * c - im * s), (after.im[slot][i] as number) - (re * s + im * c)))
    }
  }

  return worst
}

// The return spectrum of E-FRC-0176: C(t) = <start | U^t start> over `beats` beats, Hann windowed, its power
// on a grid of phases from `from` to `to` in steps of `step`, and the local maxima above `floor` of the top,
// each refined by a parabola through the grid maximum and its two neighbors. Highest phase first
export function returnSpectrumPeaks(input: {
  start: FloatWalk
  field: Field
  charge: number
  order: Order
  beats: number
  from?: number
  to?: number
  step?: number
  floor?: number
}): { grid: number[]; refined: number[]; power: number[] } {
  const { beats } = input
  const from = input.from ?? -0.6
  const to = input.to ?? 0.05
  const step = input.step ?? 0.0005
  const floor = input.floor ?? 0.02
  const w = copyWalk(input.start)
  const series: [number, number][] = [[1, 0]]

  for (let t = 1; t < beats; t++) {
    chargedBeat(w, input.field, input.charge, input.order)
    series.push(overlapOf(input.start, w))
  }

  const phases: number[] = []
  const power: number[] = []

  for (let k = 0; from + k * step <= to; k++) {
    const omega = from + k * step

    let re = 0
    let im = 0

    for (let t = 0; t < series.length; t++) {
      const [cr, ci] = series[t] as [number, number]
      const hann = 0.5 - 0.5 * Math.cos((2 * Math.PI * t) / (beats - 1))
      const c = Math.cos(omega * t)
      const s = Math.sin(omega * t)

      re += hann * (cr * c + ci * s)
      im += hann * (ci * c - cr * s)
    }

    phases.push(omega)
    power.push(re * re + im * im)
  }

  const top = Math.max(...power)
  const grid: number[] = []
  const refined: number[] = []
  const heights: number[] = []

  for (let i = 1; i + 1 < power.length; i++) {
    const [a, b, c] = [power[i - 1] as number, power[i] as number, power[i + 1] as number]

    if (b > floor * top && b >= a && b >= c) {
      const curvature = a - 2 * b + c

      grid.push(phases[i] as number)
      refined.push((phases[i] as number) + (curvature < 0 ? (step * (a - c)) / (2 * curvature) : 0))
      heights.push(b / top)
    }
  }

  const order = grid.map((_, i) => i).sort((x, y) => (refined[y] as number) - (refined[x] as number))

  return { grid: order.map(i => grid[i] as number), refined: order.map(i => refined[i] as number), power: order.map(i => heights[i] as number) }
}
