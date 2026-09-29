// Randall-Sundrum's short-range correction on a layered stack, resolved in layers per doubling (E-GRV-0137's theory and
// readings). Theory only, no rule: every function takes a layering (per husk dock lateral stiffnesses s_j and the
// vertical conductances c_j between slab j and j + 1, code/measure/open-husk warpedLayering's shape) and returns numbers.
// Real numbers live here only.
//
// THE CURVATURE. warpedLayering samples RS's static weights at the upper face of each slab, s_j = 6 e^(-2 k y_j),
// c_j = (6 / l^2) e^(-4 k y_j), y_j = j l, l = ln 2 / (L k) for L slabs a doubling. So k is read back from the layering
// itself, twice: k = ln(s_j / s_(j+1)) / (2 l) from the lateral weights and ln(c_j / c_(j+1)) / (4 l) from the vertical.
// E-GRV-0105's stack (one slab a doubling, the lapse in the links, c_0 = 1 so l = sqrt 6) has k = ln 2 / sqrt 6.
//
// THE CONTINUUM COEFFICIENT (one-sided bulk, no brane term, a scalar). In conformal z = e^(ky) / k the bulk equation
// -(e^(-4ky) phi')' + p^2 e^(-2ky) phi = 0 is phi_zz - (3 / z) phi_z - p^2 phi = 0, decaying solution z^2 K_2(p z), and a
// unit source on the brane (z_0 = 1 / k) with bulk stiffness B gives the brane kernel K(p) = K_2(p / k) / (B p K_1(p / k)).
// At small p, K_2 / (x K_1) = (2 / x^2)(1 - (x^2 / 2) ln x + analytic), so K(p) = w_0 / p^2 - (w_0 / 2k^2) ln p + ...,
// w_0 = 2k / B. The Fourier transform of -ln p in three dimensions is 1 / (4 pi r^3), so
//   V(r) = (w_0 / 4 pi r)(1 + c_2 / r^2 + ...),   c_2 = 1 / (2 k^2).
// RS's Newtonian potential 2 / (3 k^2) is 4/3 of it: a massive spin-2 mode couples to a static source as T - T/3 where the
// massless one couples as T - T/2, and (2/3) / (1/2) = 4/3 (Garriga and Tanaka 2000). A scalar depth carries no tensor, so
// its own continuum is c_2 = 1 / (2 k^2) = (3/4) of RS's number.
//
// THE LAYERED COEFFICIENT, exactly. With q = e^(-2kl) and eps = p^2 l^2, row j >= 1 of (p^2 S + C) phi = e_0 reads
// q^2 phi_(j+1) - (1 + q^2) phi_j + phi_(j-1) = eps q^(2 - j) phi_j, which depends on j only through u = eps q^(-j).
// Near the brane (u << 1) phi_j = A (1 + alpha eps q^(-j) + O(eps^2)), alpha = -q^2 / (1 - q)^2 (it also satisfies the
// brane row at this order). Summing every row, 1 = p^2 sum_j s_j phi_j; each near slab adds 6 alpha eps and there are
// ln(1 / eps) / (2 k l) of them before u reaches 1, so A = w_0 / p^2 [1 - 6 alpha eps ln(1 / eps) / (2 k l sum s)] with
// w_0 = 1 / sum s = (1 - q) / 6 on the infinite stack, and the kernel's -a ln p term has a = w_0 q^2 l / ((1 - q) k):
//   c_2(L) = a / w_0 = R(L) / (2 k^2),   R(L) = 2 x q^2 / (1 - q) = x e^(-3x) / sinh x,   x = k l = ln 2 / L,
// R = 1 - 3x + (13/3) x^2 - ... -> 1 as L -> infinity; 0.1155, 0.3466, 0.5916, 0.7701, 0.8778 at L = 1, 2, 4, 8, 16.
// The equation's discrete scale invariance (j -> j + 1, eps -> eps q) makes the rest log-periodic in ln p with period
// x, so a log coefficient read between p and p e^(-n x) holds no oscillation (logCoefficient reads p / 16 = p e^(-4 L x)).
//
// NEWTON'S CONSTANT is w_0 = 1 / sum_j s_j, the whole stack's stiffness: on warpedLayering (every slab a full lattice
// layer) it is (1 - q) / 6 and falls as 1 / L; on the same bulk at a FIXED five-dimensional stiffness (every slab's
// weights times 1 / L, fixedBulkLayering) it is L (1 - q) / 6 -> 2 ln 2 / 6 = 0.2310, which is 0.125 at L = 1. So no
// normalization short of setting sum s by hand holds G fixed from L = 1 to 16: the one-slab stack's sum is a left
// Riemann sum of the bulk's integral with its first term (the husk) at full weight. c_2 is a ratio and blind to it.
//
// A GROWING BULK (the control, E-GRV-0094): lateral 6 e^(+2ky), vertical (6 / l^2) e^(+4ky), and a ground below the last
// slab through one more vertical link. It has no zero mode (K(0) is the husk's finite conductance to ground), so the
// husk's pull is a sum of Yukawas.
//
// DETERMINISM: nothing is drawn. NOTHING MOVES: this file reads values only.

import { makeDense } from '@/code/algebra/linear/dense'
import { eigSymmetric } from '@/code/algebra/linear/eig-jacobi'
import { fitPowers } from '@/code/measure/husk-coulomb'
import {
  warpedLayering,
  type StackMode,
} from '@/code/measure/open-husk'
import { greenAt, type PeriodicGreen } from '@/code/measure/husk-box'

export type Layering = {
  stiff: number[]
  conduct: number[]
  ground: number
}

// warpedLayering down to `floor`, its weights times `scale` (1 / L for a fixed five-dimensional stiffness)
export function fixedBulkLayering(
  curvature: number,
  perDoubling: number,
  floor: number,
  scale = 1 / perDoubling,
): Layering {
  const w = warpedLayering(curvature, perDoubling, floor)

  return {
    stiff: w.stiff.map(s => s * scale),
    conduct: w.conduct.map(c => c * scale),
    ground: 0,
  }
}

// warpedLayering cut after `doublings` doublings below the husk (doublings L + 1 slabs), unscaled: E-GRV-0105's depth
export function shallowLayering(
  curvature: number,
  perDoubling: number,
  doublings: number,
): Layering {
  const w = warpedLayering(
    curvature,
    perDoubling,
    4 ** -doublings * (1 - 1e-9),
  )

  return { stiff: w.stiff, conduct: w.conduct, ground: 0 }
}

// the growing bulk: lateral 6 e^(2ky), vertical (6 / l^2) e^(4ky), doublings L + 1 slabs, grounded below the last
export function growingLayering(
  curvature: number,
  perDoubling: number,
  doublings: number,
): Layering {
  const spacing = Math.LN2 / perDoubling / curvature
  const n = doublings * perDoubling + 1
  const stiff = Array.from(
    { length: n },
    (_, j) => 6 * Math.exp(2 * curvature * j * spacing),
  )
  const vertical = (j: number): number =>
    (6 / spacing ** 2) * Math.exp(4 * curvature * j * spacing)

  return {
    stiff,
    conduct: Array.from({ length: n - 1 }, (_, j) => vertical(j)),
    ground: vertical(n - 1),
  }
}

// k read back from the layering's lateral and vertical ratios, given its slab spacing
export function layeringCurvature(
  layering: Layering,
  spacing: number,
): { lateral: number[]; vertical: number[] } {
  const { stiff, conduct } = layering

  return {
    lateral: stiff
      .slice(0, -1)
      .map((s, j) => Math.log(s / stiff[j + 1]!) / (2 * spacing)),
    vertical: conduct
      .slice(0, -1)
      .map((c, j) => Math.log(c / conduct[j + 1]!) / (4 * spacing)),
  }
}

// the derived ratio R(L) = x e^(-3x) / sinh x, x = ln 2 / L, of the layered c_2 to the continuum's 1 / (2 k^2)
export function layeredShare(perDoubling: number): number {
  const x = Math.LN2 / perDoubling

  return (x * Math.exp(-3 * x)) / Math.sinh(x)
}

// the brane kernel K(p) = [(p^2 S + C)^-1]_00 by the admittance from the bottom up (every term positive, so stable):
// Y_n = p^2 s_n + ground, Y_j = p^2 s_j + c_j Y_(j+1) / (c_j + Y_(j+1)), K = 1 / Y_0
export function braneKernel(layering: Layering, p: number): number {
  const { stiff, conduct, ground } = layering
  const p2 = p * p

  let y = p2 * stiff[stiff.length - 1]! + ground

  for (let j = stiff.length - 2; j >= 0; j--) {
    y = p2 * stiff[j]! + (conduct[j]! * y) / (conduct[j]! + y)
  }

  return 1 / y
}

export const zeroModeWeight = (layering: Layering): number =>
  1 / layering.stiff.reduce((t, s) => t + s, 0)

// the coefficient a of -ln p in K(p) - w_0 / p^2, read between p and p / 16 (a whole number of the log-periodic
// period for every L), and c_2 = a / w_0
export function logCoefficient(
  layering: Layering,
  p: number,
): { a: number; c2: number } {
  const w0 = zeroModeWeight(layering)
  const d = (q: number): number =>
    braneKernel(layering, q) - w0 / (q * q)
  const a = (d(p / 16) - d(p)) / Math.log(16)

  return { a, c2: a / w0 }
}

// the modes of a layering (open-husk layeredModes, with a ground added on the last slab's diagonal)
export function layeringModes(layering: Layering): StackMode[] {
  const { stiff, conduct, ground } = layering
  const n = stiff.length
  const b = makeDense({ rows: n, cols: n })

  const add = (i: number, j: number, v: number): void => {
    b.data[i * n + j] =
      b.data[i * n + j]! + v / Math.sqrt(stiff[i]! * stiff[j]!)
  }

  conduct.forEach((c, k) => {
    add(k, k, c)
    add(k + 1, k + 1, c)
    add(k, k + 1, -c)
    add(k + 1, k, -c)
  })
  add(n - 1, n - 1, ground)

  const eig = eigSymmetric({ matrix: b })

  return Array.from({ length: n }, (_, j) => ({
    mass: Math.sqrt(Math.max(0, eig.values[j]!)),
    weight: eig.vectors[j]! ** 2 / stiff[0]!,
  }))
}

// U(r) = 4 pi r G(r) = w_0 + sum_massive w_n e^(-m_n r), the zero mode (the lightest, whose mass is rounding) taken at
// mass 0 exactly: at r = 256 a rounding mass of 3e-8 would move U by 8e-6, the size of the correction there
export function modeProfile(
  modes: readonly StackMode[],
  r: number,
): number {
  const lightest = modes.reduce(
    (a, m) => (m.mass < a.mass ? m : a),
    modes[0]!,
  )

  return modes.reduce(
    (t, m) =>
      t +
      (m === lightest ? m.weight : m.weight * Math.exp(-m.mass * r)),
    0,
  )
}

// the fit U(r) = G (1 + c_2 / r^2 + c_4 / r^4) over the radii given
export function correctionFit(
  modes: readonly StackMode[],
  rs: readonly number[],
): { G: number; c2: number; c4: number } {
  const [a0, a2, a4] = fitPowers(
    rs,
    rs.map(r => modeProfile(modes, r)),
    [2, 4],
  ) as [number, number, number]

  return { G: a0, c2: a2 / a0, c4: a4 / a0 }
}

// E-GRV-0105's reading on the periodic husk: a unit at the origin and its sink at the antipode (h, h, h), read along an
// axis (the six are equal by the kernel's symmetry), W(r) = G_N(r, 0, 0) - G_N(r - h, -h, -h)
export function antipodeReading(
  g: PeriodicGreen,
  rs: readonly number[],
): number[] {
  const h = g.side / 2

  return rs.map(r => greenAt(g, r, 0, 0) - greenAt(g, r - h, -h, -h))
}

// E-GRV-0105's long-range k: the 1/r coefficient of the fit c0 + a / r + b / r^3 over the radii given
export function inverseCoefficient(
  rs: readonly number[],
  W: readonly number[],
): number {
  return fitPowers(rs, W, [1, 3])[1]!
}
