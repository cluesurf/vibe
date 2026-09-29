// THE KINEMATICS OF AN ISOLATED BRANCH OF A DOCK WALK (E-SPN-0142). code/measure/dock-mixer builds the one-dock matrix
// P of a lone hole (or a lone love) under the dock-wide mixer and the coin, and U(K) = S(K) P its Bloch beat. This file
// reads one NONDEGENERATE level of P at K = 0 (the mixer's own mode, the staggered z for a hole and the uniform vector
// for a love) and asks whether its branch obeys special relativity for small K:
//     eps(K)^2 = m^2 + c^2 K^2 + d K^4 + ...,   eps measured from the midpoint between the level and its partner,
// with m half the K = 0 gap to the partner (the multiplet the level couples to at first order in K). Energies are
// E = -phase (code/measure/dock-mixer's convention). A Lorentz dispersion has d = 0; eta = d m^2 / c^4 is the
// dimensionless K^4 departure at K ~ m / c.
//
// THE FIT. eps is read at K = s m u for a few s (a node set), y(s) = (eps^2 - m^2) / K^2, and the degree (nodes - 1)
// polynomial in s^2 through the nodes (Newton divided differences, exact interpolation) gives c^2 = y(0) and
// d = y'(0) / m^2. The series in K^2 converges for |K| < m / c (the branch point of sqrt(m^2 + c^2 K^2)), so the nodes
// sit well inside it; a second node set at half the scale checks the fit.
//
// DETERMINISM: no random numbers. Floats, as measurement: the rule's matrices are exact elsewhere
// (code/measure/dock-mixer ruleDockMatrix).

import {
  bandAt,
  multipletPhases,
  multipletsOf,
  wrap,
  type CMatrix,
  type Multiplet,
} from '@/code/measure/dock-mixer'

export type Roots = readonly (readonly number[])[]

// the level structure at K = 0 around one nondegenerate level: `single` its multiplet index (-1 if none), `partner` the
// index of the multiplet of size `partnerSize` nearest it, m half the gap between them, the midpoint's phase, the sign
// that makes eps(0) = +m, the gap to the nearest other level, and whether the level borders the largest circular gap
// of the K = 0 spectrum (a band edge)
export type SingletLevel = {
  multiplets: Multiplet[]
  single: number
  partner: number
  m: number
  midPhase: number
  sign: number
  gap: number
  edge: boolean
}

export function singletLevel(
  P: CMatrix,
  roots: Roots,
  partnerSize: number,
  tol = 1e-9,
): SingletLevel {
  const multiplets = multipletsOf(P, roots, tol)
  const single = multiplets.findIndex(x => x.size === 1)

  if (single < 0) {
    return {
      multiplets,
      single,
      partner: -1,
      m: 0,
      midPhase: 0,
      sign: 0,
      gap: 0,
      edge: false,
    }
  }

  const cs = multiplets[single]!.center

  let partner = -1

  multiplets.forEach((x, i) => {
    if (x.size !== partnerSize) {
      return
    }

    if (
      partner < 0 ||
      Math.abs(wrap(x.center - cs)) <
        Math.abs(wrap(multiplets[partner]!.center - cs))
    ) {
      partner = i
    }
  })

  const cp = partner < 0 ? cs : multiplets[partner]!.center
  const half = wrap(cs - cp) / 2
  const midPhase = cp + half
  // E - E_mid = -(phase - midPhase) = -half at K = 0
  const sign = half > 0 ? -1 : 1
  const gap = Math.min(
    ...multiplets
      .filter((_, i) => i !== single)
      .map(x => Math.abs(wrap(x.center - cs))),
  )
  // the circular order of the centers, the largest gap between neighbors, and whether the singlet is one of its ends
  const order = multiplets
    .map((x, i) => ({
      c: ((x.center % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI),
      i,
    }))
    .sort((a, b) => a.c - b.c)

  let widest = -1
  let ends: [number, number] = [-1, -1]

  order.forEach((o, k) => {
    const next = order[(k + 1) % order.length] as {
      c: number
      i: number
    }
    const width =
      k + 1 < order.length ? next.c - o.c : next.c + 2 * Math.PI - o.c

    if (width > widest + 1e-12) {
      widest = width
      ends = [o.i, next.i]
    }
  })

  return {
    multiplets,
    single,
    partner,
    m: Math.abs(half),
    midPhase,
    sign,
    gap,
    edge: ends.includes(single),
  }
}

// eps(K) of the singlet's branch: its energy from the midpoint, signed so eps(0) = m
export function singletEps(
  P: CMatrix,
  roots: Roots,
  level: SingletLevel,
  K: readonly number[],
): number {
  const offsets = multipletPhases(P, roots, K, level.multiplets)[
    level.single
  ]!
  const phase = level.multiplets[level.single]!.center + offsets[0]!

  return level.sign * -wrap(phase - level.midPhase)
}

// the polynomial through (x_j, y_j): its value and first derivative at x = 0 (Newton divided differences)
export function polynomialAtZero(
  xs: readonly number[],
  ys: readonly number[],
): { value: number; slope: number } {
  const n = xs.length
  const c = [...ys]

  for (let j = 1; j < n; j++) {
    for (let i = n - 1; i >= j; i--) {
      c[i] = (c[i]! - c[i - 1]!) / (xs[i]! - xs[i - j]!)
    }
  }

  // p(x) = sum_i c_i prod_(k < i) (x - x_k); p(0) and p'(0) by Horner with the derivative carried
  let value = c[n - 1]!
  let slope = 0

  for (let i = n - 2; i >= 0; i--) {
    slope = slope * (0 - xs[i]!) + value
    value = value * (0 - xs[i]!) + c[i]!
  }

  return { value, slope }
}

export type Kinematics = { c2: number; d: number; eta: number }

// the relativistic fit along a unit u at K = s m u for s in `scales`
export function singletKinematics(
  P: CMatrix,
  roots: Roots,
  level: SingletLevel,
  u: readonly number[],
  scales: readonly number[],
): Kinematics {
  const m = level.m
  const xs = scales.map(s => s * s)
  const ys = scales.map(s => {
    const K = s * m
    const e = singletEps(
      P,
      roots,
      level,
      u.map(x => x * K),
    )

    return (e * e - m * m) / (K * K)
  })
  const p = polynomialAtZero(xs, ys)
  const c2 = p.value
  const d = p.slope / (m * m)

  return { c2, d, eta: (d * m * m) / (c2 * c2) }
}

// THE MASSLESS PAIR. At an angle where the singlet falls into its partner (a multiplet of partnerSize + 1), the two
// branches linear in K are that multiplet's top and bottom offsets: E_+- = +-c0 K + gamma K^2 + ... along u. c0 and
// gamma from kappa and kappa / 2, Richardson on each (the next terms are K^2 and K^3 relative)
export function masslessPair(
  P: CMatrix,
  roots: Roots,
  size: number,
  u: readonly number[],
  kappa: number,
): { c0: number; gamma: number; size: number } {
  const ms = multipletsOf(P, roots)
  const idx = ms.findIndex(x => x.size === size)

  if (idx < 0) {
    return { c0: NaN, gamma: NaN, size: -1 }
  }

  const read = (k: number): { c: number; g: number } => {
    // E = -phase, so E offsets are the negated phase offsets
    const e = multipletPhases(
      P,
      roots,
      u.map(x => x * k),
      ms,
    )[idx]!.map(x => -x)
    const top = Math.max(...e)
    const bottom = Math.min(...e)

    return {
      c: (top - bottom) / (2 * k),
      g: (top + bottom) / (2 * k * k),
    }
  }

  const a = read(kappa)
  const b = read(kappa / 2)

  return { c0: (4 * b.c - a.c) / 3, gamma: (4 * b.g - a.g) / 3, size }
}

// the singlet's energy along each direction minus along the first, at |K| = kappa (the K^6 anisotropy of a 5-design)
export function singletAnisotropy(
  P: CMatrix,
  roots: Roots,
  level: SingletLevel,
  dirs: readonly (readonly number[])[],
  kappa: number,
): number[] {
  const e = dirs.map(u =>
    singletEps(
      P,
      roots,
      level,
      u.map(x => x * kappa),
    ),
  )

  return e.slice(1).map(x => x - e[0]!)
}

// the largest group speed |v| over every band at the given momenta (Hellmann-Feynman), in coordinate units per beat
export function fastestBand(
  P: CMatrix,
  roots: Roots,
  momenta: readonly (readonly number[])[],
): { speed: number; at: number[] } {
  let speed = 0
  let at: number[] = []

  for (const K of momenta) {
    for (const v of bandAt(P, roots, K).velocity) {
      const s = Math.hypot(...v)

      if (s > speed) {
        speed = s
        at = [...K]
      }
    }
  }

  return { speed, at }
}

// n deterministic momenta filling [-pi, pi)^4 (the additive recurrence on the 4d Kronecker constants 1 / phi_5^k)
export function weylMomenta(n: number): number[][] {
  // phi_5: the real root of x^5 = x + 1, the generalized golden ratio for 4 dimensions
  let g = 1.2

  for (let i = 0; i < 64; i++) {
    g = g - (g ** 5 - g - 1) / (5 * g ** 4 - 1)
  }

  const alpha = [1, 2, 3, 4].map(k => 1 / g ** k)

  return Array.from({ length: n }, (_, j) =>
    alpha.map(a => 2 * Math.PI * (((0.5 + (j + 1) * a) % 1) - 0.5)),
  )
}
