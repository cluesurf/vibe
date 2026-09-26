// The fear walk as a charge in two husk dimensions. The one-dimensional fear walk (code/rule/fear-walk,
// E-QTM-0103) carries a lone vibe's weight on two slots, the coin U = a + b HOP with 2 a = 1 + omega and
// 2 b = 1 - omega, then streams slot 0 forward and slot 1 back. Here a beat is a sequence of substeps, each
// the same coin and then a stream along one axis of a husk plane, on an L x L torus. The order matters:
// 'xy' (coin, stream x, coin, stream y) has a saddle at the bottom of its band, and the palindrome 'xyyx'
// has a bowl (tmp/walk-probe.ts, E-FRC-0176). A weight crossing a link is multiplied by e^(i q theta) going
// forward and e^(-i q theta) going back, theta the link's angle and q the walker's charge: the Peierls phase,
// which is how a charge that carries a phase feels the field.
//
// Two carriers of the same walk:
// - exact: weights are Eisenstein integers m + n omega (code/rule/fear-walk), valid when every q theta is a
//   multiple of 2 pi / 3, so each crossing is a turn by omega^k. The weights are over 2 per substep
// - float: complex doubles, for any field, used for the long runs
// The free symbol U(k) is the product of C then diag(e^(-i k_axis), e^(i k_axis)) over the substeps, and the
// band through quasi-energy 0 at k = 0 bends as phase = (k Q k) / 2: its curvature Q is read off here.

import { type Eisenstein, plus, times, turn, TWO_A, TWO_B, ZERO } from '@/code/rule/fear-walk'

type Complex = [number, number]

const A: Complex = [0.25, Math.sqrt(3) / 4] // (1 + omega) / 2
const B: Complex = [0.75, -Math.sqrt(3) / 4] // (1 - omega) / 2

export type Order = readonly ('x' | 'y')[]

export const PALINDROME: Order = ['x', 'y', 'y', 'x']
export const ALTERNATE: Order = ['x', 'y']

export type Field = {
  readonly side: number
  // theta of the link (x, y) -> (x + 1, y) and (x, y) -> (x, y + 1), at index x + side y, in radians
  readonly thetaX: Float64Array
  readonly thetaY: Float64Array
}

// a uniform field of `quanta` flux quanta through the torus, B = 2 pi quanta / side^2 per plaquette, in the
// Landau gauge closed at the seam x = side - 1 -> 0
export function uniformField(side: number, quanta: number): Field {
  const b = (2 * Math.PI * quanta) / (side * side)
  const thetaX = new Float64Array(side * side)
  const thetaY = new Float64Array(side * side)

  for (let y = 0; y < side; y++) {
    for (let x = 0; x < side; x++) {
      thetaY[x + side * y] = b * x
      thetaX[x + side * y] = x === side - 1 ? -b * side * y : 0
    }
  }

  return { side, thetaX, thetaY }
}

export type FloatWalk = { re: [Float64Array, Float64Array]; im: [Float64Array, Float64Array] }

export function emptyWalk(side: number): FloatWalk {
  const n = side * side

  return { re: [new Float64Array(n), new Float64Array(n)], im: [new Float64Array(n), new Float64Array(n)] }
}

function coin(w: FloatWalk): void {
  const n = w.re[0].length

  for (let i = 0; i < n; i++) {
    const r0 = w.re[0][i] ?? 0
    const i0 = w.im[0][i] ?? 0
    const r1 = w.re[1][i] ?? 0
    const i1 = w.im[1][i] ?? 0

    w.re[0][i] = A[0] * r0 - A[1] * i0 + B[0] * r1 - B[1] * i1
    w.im[0][i] = A[0] * i0 + A[1] * r0 + B[0] * i1 + B[1] * r1
    w.re[1][i] = B[0] * r0 - B[1] * i0 + A[0] * r1 - A[1] * i1
    w.im[1][i] = B[0] * i0 + B[1] * r0 + A[0] * i1 + A[1] * r1
  }
}

function stream(w: FloatWalk, field: Field, axis: 'x' | 'y', charge: number): void {
  const side = field.side
  const theta = axis === 'x' ? field.thetaX : field.thetaY
  const next: FloatWalk = emptyWalk(side)

  for (let y = 0; y < side; y++) {
    for (let x = 0; x < side; x++) {
      const i = x + side * y
      const forward = axis === 'x' ? ((x + 1) % side) + side * y : x + side * ((y + 1) % side)
      const back = axis === 'x' ? ((x - 1 + side) % side) + side * y : x + side * ((y - 1 + side) % side)
      // slot 0 crosses the link i -> forward with e^(i q theta_i); slot 1 crosses the link back -> i backward
      const p = charge * (theta[i] ?? 0)
      const q = -charge * (theta[back] ?? 0)

      next.re[0][forward] = (w.re[0][i] ?? 0) * Math.cos(p) - (w.im[0][i] ?? 0) * Math.sin(p)
      next.im[0][forward] = (w.re[0][i] ?? 0) * Math.sin(p) + (w.im[0][i] ?? 0) * Math.cos(p)
      next.re[1][back] = (w.re[1][i] ?? 0) * Math.cos(q) - (w.im[1][i] ?? 0) * Math.sin(q)
      next.im[1][back] = (w.re[1][i] ?? 0) * Math.sin(q) + (w.im[1][i] ?? 0) * Math.cos(q)
    }
  }

  for (const s of [0, 1] as const) {
    w.re[s].set(next.re[s])
    w.im[s].set(next.im[s])
  }
}

// one beat, in place: for each axis of the order, the coin and then a stream along it
export function chargedBeat(w: FloatWalk, field: Field, charge: number, order: Order): void {
  for (const axis of order) {
    coin(w)
    stream(w, field, axis, charge)
  }
}

export type ExactSlots = [Eisenstein[], Eisenstein[]]

// the exact beat, the field given as thirds: kx[i], ky[i] with theta = 2 pi k / 3
export function exactChargedBeat(side: number, slots: ExactSlots, kx: Int32Array, ky: Int32Array, charge: number, order: Order): ExactSlots {
  const coinExact = (s: ExactSlots): ExactSlots => [
    s[0].map((r, i) => plus(times(TWO_A, r), times(TWO_B, s[1][i] ?? ZERO))),
    s[1].map((l, i) => plus(times(TWO_B, s[0][i] ?? ZERO), times(TWO_A, l))),
  ]
  const streamExact = (s: ExactSlots, axis: 'x' | 'y'): ExactSlots => {
    const k = axis === 'x' ? kx : ky
    const out: ExactSlots = [s[0].map(() => ZERO), s[1].map(() => ZERO)]

    for (let y = 0; y < side; y++) {
      for (let x = 0; x < side; x++) {
        const i = x + side * y
        const forward = axis === 'x' ? ((x + 1) % side) + side * y : x + side * ((y + 1) % side)
        const back = axis === 'x' ? ((x - 1 + side) % side) + side * y : x + side * ((y - 1 + side) % side)

        out[0][forward] = turn(s[0][i] ?? ZERO, charge * (k[i] ?? 0))
        out[1][back] = turn(s[1][i] ?? ZERO, -charge * (k[back] ?? 0))
      }
    }

    return out
  }

  let out = slots

  for (const axis of order) {
    out = streamExact(coinExact(out), axis)
  }

  return out
}

const mul = (p: Complex, q: Complex): Complex => [p[0] * q[0] - p[1] * q[1], p[0] * q[1] + p[1] * q[0]]
const add = (p: Complex, q: Complex): Complex => [p[0] + q[0], p[1] + q[1]]
const expi = (t: number): Complex => [Math.cos(t), Math.sin(t)]
const matmul = (m: Complex[][], n: Complex[][]): Complex[][] =>
  [0, 1].map(i => [0, 1].map(j => add(mul(m[i]?.[0] ?? [0, 0], n[0]?.[j] ?? [0, 0]), mul(m[i]?.[1] ?? [0, 0], n[1]?.[j] ?? [0, 0]))))

// the free symbol U(k) of one beat
export function symbol(kx: number, ky: number, order: Order): Complex[][] {
  const coinMatrix: Complex[][] = [
    [A, B],
    [B, A],
  ]

  let u: Complex[][] = [
    [[1, 0], [0, 0]],
    [[0, 0], [1, 0]],
  ]

  for (const axis of order) {
    const k = axis === 'x' ? kx : ky

    u = matmul(
      [
        [expi(-k), [0, 0]],
        [[0, 0], expi(k)],
      ],
      matmul(coinMatrix, u),
    )
  }

  return u
}

// the eigenphases of U(k), each in (-pi, pi]
export function symbolPhases(kx: number, ky: number, order: Order): [number, number] {
  const u = symbol(kx, ky, order)
  const tr = add(u[0]?.[0] ?? [0, 0], u[1]?.[1] ?? [0, 0])
  const det = add(mul(u[0]?.[0] ?? [0, 0], u[1]?.[1] ?? [0, 0]), mul([-1, 0], mul(u[0]?.[1] ?? [0, 0], u[1]?.[0] ?? [0, 0])))
  const disc = add(mul(tr, tr), mul([-4, 0], det))
  const r = Math.sqrt(Math.hypot(disc[0], disc[1]))
  const phi = Math.atan2(disc[1], disc[0]) / 2
  const root: Complex = [r * Math.cos(phi), r * Math.sin(phi)]
  const l1 = add(tr, root)
  const l2 = add(tr, mul([-1, 0], root))

  return [Math.atan2(l1[1], l1[0]), Math.atan2(l2[1], l2[0])]
}

// the eigenvector of U(k) for the eigenphase nearest `target`
export function symbolVector(kx: number, ky: number, target: number, order: Order): { re: [number, number]; im: [number, number] } {
  const [p1, p2] = symbolPhases(kx, ky, order)
  const phase = Math.abs(p1 - target) < Math.abs(p2 - target) ? p1 : p2
  const u = symbol(kx, ky, order)
  // (u00 - lambda) v0 + u01 v1 = 0 -> v = (u01, lambda - u00)
  const v0 = u[0]?.[1] ?? [0, 0]
  const v1 = add(expi(phase), mul([-1, 0], u[0]?.[0] ?? [0, 0]))
  const norm = Math.hypot(v0[0], v0[1], v1[0], v1[1])

  return { re: [v0[0] / norm, v1[0] / norm], im: [v0[1] / norm, v1[1] / norm] }
}

// the curvature Q of the band through phase 0 at k = 0, phase = (k Q k) / 2, as [Qxx, Qyy, Qxy], and its
// eigenvalues: a bowl when both have one sign, a saddle when they differ
export function bandCurvature(order: Order, k = 1e-3): { q: [number, number, number]; eigen: [number, number] } {
  const near = (kx: number, ky: number): number => {
    const p = symbolPhases(kx, ky, order)

    return Math.abs(p[0]) < Math.abs(p[1]) ? p[0] : p[1]
  }
  const qxx = (2 * near(k, 0)) / (k * k)
  const qyy = (2 * near(0, k)) / (k * k)
  const qxy = (near(k, k) - near(k, 0) - near(0, k)) / (k * k)
  const mid = (qxx + qyy) / 2
  const spread = Math.hypot((qxx - qyy) / 2, qxy)

  return { q: [qxx, qyy, qxy], eigen: [mid + spread, mid - spread] }
}

// the centroid of |psi|^2 on the torus by circular means
export function centroid(w: FloatWalk, side: number): [number, number] {
  let cx = 0
  let sx = 0
  let cy = 0
  let sy = 0

  for (let y = 0; y < side; y++) {
    for (let x = 0; x < side; x++) {
      const i = x + side * y
      const p = (w.re[0][i] ?? 0) ** 2 + (w.im[0][i] ?? 0) ** 2 + (w.re[1][i] ?? 0) ** 2 + (w.im[1][i] ?? 0) ** 2

      cx += p * Math.cos((2 * Math.PI * x) / side)
      sx += p * Math.sin((2 * Math.PI * x) / side)
      cy += p * Math.cos((2 * Math.PI * y) / side)
      sy += p * Math.sin((2 * Math.PI * y) / side)
    }
  }

  const wrap = (c: number, s: number): number => ((Math.atan2(s, c) / (2 * Math.PI)) * side + side) % side

  return [wrap(cx, sx), wrap(cy, sy)]
}

// a Gaussian packet of width sigma at (x0, y0) with wave vector (kx, ky) on the band through phase `target`
export function packet(input: { side: number; x0: number; y0: number; sigma: number; kx: number; ky: number; target: number; order: Order }): FloatWalk {
  const { side, x0, y0, sigma, kx, ky } = input
  const w = emptyWalk(side)
  const v = symbolVector(kx, ky, input.target, input.order)

  let norm = 0

  for (let y = 0; y < side; y++) {
    for (let x = 0; x < side; x++) {
      const dx = ((x - x0 + side * 1.5) % side) - side / 2
      const dy = ((y - y0 + side * 1.5) % side) - side / 2
      const g = Math.exp(-(dx * dx + dy * dy) / (4 * sigma * sigma))
      const c = Math.cos(kx * dx + ky * dy)
      const s = Math.sin(kx * dx + ky * dy)
      const i = x + side * y

      for (const slot of [0, 1] as const) {
        const vr = v.re[slot]
        const vi = v.im[slot]

        w.re[slot][i] = g * (vr * c - vi * s)
        w.im[slot][i] = g * (vr * s + vi * c)
        norm += g * g * (vr * vr + vi * vi)
      }
    }
  }

  for (const slot of [0, 1] as const) {
    for (let i = 0; i < side * side; i++) {
      w.re[slot][i] = (w.re[slot][i] ?? 0) / Math.sqrt(norm)
      w.im[slot][i] = (w.im[slot][i] ?? 0) / Math.sqrt(norm)
    }
  }

  return w
}

export function copyWalk(w: FloatWalk): FloatWalk {
  return { re: [Float64Array.from(w.re[0]), Float64Array.from(w.re[1])], im: [Float64Array.from(w.im[0]), Float64Array.from(w.im[1])] }
}

// <a | b>
export function overlapOf(a: FloatWalk, b: FloatWalk): [number, number] {
  let re = 0
  let im = 0

  for (const s of [0, 1] as const) {
    for (let i = 0; i < a.re[s].length; i++) {
      re += (a.re[s][i] ?? 0) * (b.re[s][i] ?? 0) + (a.im[s][i] ?? 0) * (b.im[s][i] ?? 0)
      im += (a.re[s][i] ?? 0) * (b.im[s][i] ?? 0) - (a.im[s][i] ?? 0) * (b.re[s][i] ?? 0)
    }
  }

  return [re, im]
}
