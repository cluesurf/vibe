// The box of a closed periodic husk, exactly (E-GRV-0118): the stack's husk Green's function on a torus of side N, the
// same on the infinite husk, and the difference a finite box makes to the depth excess E-GRV-0117 reads. Theory only, no
// rule: every function takes the stack's modes (code/measure/open-husk stackModes) and returns numbers. Real numbers
// live here only.
//
// THE KERNEL. On the layered stack a unit on the husk at lattice momentum p has the husk depth
//   K(p) = sum_n w_n / (eps(p) + m_n^2),   eps(p) = lambda(p) / 6,
// where lambda(p) = sum_h g_h 2 (1 - cos(u_h . p)) is the husk mesh's own symbol (code/rule/trit-radion's nine
// out-links, weight 2 on an axis and 1 on a face diagonal, 6 |p|^2 at small p) and (w_n, m_n) are the stack's modes
// (code/measure/open-husk layeredModes: [(p^2 S + C)^-1]_00 with p^2 read as eps). The zero mode (the lightest, whose
// mass is 0 up to rounding) is taken with mass 0 exactly, so its part is w_0 / eps: the zero mode's 1/r.
//
// THE PERIODIC GREEN'S FUNCTION (periodicGreen). On a torus of side N the momenta are p = 2 pi k / N, and
//   G_N(d) = N^-3 sum_k K(p) e^(i p.d),
// the zero mode's p = 0 term left out (the torus holds no net content, so a uniform background takes the unit's
// opposite: the Ewald convention). This is the exact finite sum, not an approximation of it: lambda is even in each
// component of p separately (cos(a + b) + cos(a - b) = 2 cos a cos b), so the sum is a product of three cosine
// transforms over k = 0 .. N / 2, done axis by axis.
//
// THE INFINITE HUSK (imageShift). By Poisson summation G_N(d) = sum_L G_inf(d + L) less the neutralizing background,
// L over the lattice N Z^3. At |d + L| >= N / 2 (every L != 0, d in the minimal image) G_inf is its continuum form to
// the husk mesh's anisotropy at distance N / 2, so the images are summed in the continuum:
//   zero mode  w_0 [phi_N(d) - 1 / (4 pi |d|)], phi_N the neutralized periodic Coulomb potential, by Ewald's split
//              (erfc in real space over L in {-2 .. 2}^3 N, a Gaussian-screened sum over k with |k_i| <= 2 pi 24 / N,
//              alpha = 12 / N, so each truncated tail is under 1e-12 of a term);
//   massive    w_n sum_(L != 0) e^(-m_n |d + L|) / (4 pi |d + L|), summed out to m_n |d + L| = 40.
// less the mesh's zero-mean offset w_0 / (12 N^3) (huskQuartic below).
// Then G_inf(d) = G_N(d) - imageShift(d) keeps the husk mesh's short-range form exactly (it is G_N's) and has no box.
//
// THE BOX CORRECTION (E-GRV-0117's reading). The unit at the center c and -1/N_f on each of the N_f far husk docks F
// (distance >= N / 4 from c, dock 0 excluded), read along the six axes at r and against dock 0:
//   E_N(r)   = [G_N(r e) - B(r)] - [G_N(c) - B_0],   B(r) = N_f^-1 sum_(y in F) <G_N(c + r e - y)>_axes,
//                                                    B_0 = N_f^-1 sum_(y in F) G_N(y),
//   E_inf(r) = G_inf(r e)                            (the reference at infinity, no background),
//   Delta(r) = E_N(r) - E_inf(r) = imageShift(r e) - B(r) - G_N(c) + B_0.
// Three parts, none fitted: the husk's images, the far background's own well at r, and the reference dock's depth.
// E-GRV-0117's formula kept only the last and read it as the continuum g(r_ref) / r_ref.
//
// DETERMINISM: nothing is drawn. NOTHING MOVES: this file reads values only.

import { radionWeight } from '@/code/rule/trit-radion'
import { TRIT_HUSK_VECTORS } from '@/code/rule/trit-column'
import type { StackMode } from '@/code/measure/open-husk'

const mod = (x: number, m: number): number => ((x % m) + m) % m

// the husk mesh's symbol lambda(p), 6 |p|^2 at small p
export function huskSymbol(p: readonly number[]): number {
  let s = 0

  TRIT_HUSK_VECTORS.forEach((u, h) => {
    s +=
      2 *
      radionWeight(h) *
      (1 - Math.cos(u[0]! * p[0]! + u[1]! * p[1]! + u[2]! * p[2]!))
  })

  return s
}

// the zero mode (the lightest) and the massive modes, the zero mode's mass taken as 0 exactly
export function splitModes(modes: readonly StackMode[]): {
  w0: number
  massive: StackMode[]
} {
  const lightest = modes.reduce(
    (a, m) => (m.mass < a.mass ? m : a),
    modes[0]!,
  )

  if (lightest.mass >= 1e-6) {
    throw new Error('husk-box: no zero mode')
  }

  return {
    w0: lightest.weight,
    massive: modes.filter(m => m !== lightest),
  }
}

// K(eps) = w_0 / eps + sum_n w_n / (eps + m_n^2); the zero mode's term left out at eps = 0
export function modeKernel(
  modes: readonly StackMode[],
  eps: number,
): number {
  const { w0, massive } = splitModes(modes)

  return (
    (eps > 0 ? w0 / eps : 0) +
    massive.reduce((t, m) => t + m.weight / (eps + m.mass ** 2), 0)
  )
}

// G_N on the reduced grid d_i = 0 .. N / 2 (index a + H (b + H c), H = N / 2 + 1)
export type PeriodicGreen = {
  readonly side: number
  readonly values: Float64Array
}

export function periodicGreen(
  modes: readonly StackMode[],
  side: number,
): PeriodicGreen {
  if (side % 2 !== 0) {
    throw new Error('periodicGreen: an even side')
  }

  const half = side / 2
  const H = half + 1
  const at = (a: number, b: number, c: number): number =>
    a + H * (b + H * c)
  const weight = (k: number): number => (k === 0 || k === half ? 1 : 2)
  const cosine = Float64Array.from(
    { length: H * H },
    (_, i) =>
      Math.cos((2 * Math.PI * Math.floor(i / H) * (i % H)) / side) *
      weight(Math.floor(i / H)),
  )

  let now = new Float64Array(H * H * H)

  for (let a = 0; a < H; a++) {
    for (let b = 0; b < H; b++) {
      for (let c = 0; c < H; c++) {
        now[at(a, b, c)] = modeKernel(
          modes,
          huskSymbol([
            (2 * Math.PI * a) / side,
            (2 * Math.PI * b) / side,
            (2 * Math.PI * c) / side,
          ]) / 6,
        )
      }
    }
  }

  // three passes, each replacing one momentum index k by a distance index d: sum_k weight(k) cos(2 pi k d / N) f(k)
  for (let axis = 0; axis < 3; axis++) {
    const next = new Float64Array(H * H * H)
    const stride = axis === 0 ? 1 : axis === 1 ? H : H * H

    for (let i = 0; i < H * H * H; i++) {
      const k = Math.floor(i / stride) % H

      if (k !== 0) {
        continue
      }

      for (let d = 0; d < H; d++) {
        let s = 0

        for (let q = 0; q < H; q++) {
          s += cosine[q * H + d]! * now[i + q * stride]!
        }

        next[i + d * stride] = s
      }
    }

    now = next
  }

  const scale = 1 / side ** 3

  for (let i = 0; i < now.length; i++) {
    now[i] = now[i]! * scale
  }

  return { side, values: now }
}

// G_N at an integer displacement (any, taken to its minimal image)
export function greenAt(
  g: PeriodicGreen,
  d0: number,
  d1: number,
  d2: number,
): number {
  const n = g.side
  const H = n / 2 + 1

  const fold = (d: number): number => {
    const m = mod(d, n)

    return Math.min(m, n - m)
  }

  return g.values[fold(d0) + H * (fold(d1) + H * fold(d2))]!
}

// erf and erfc to about 1e-14: the Taylor series below 2.5, the continued fraction above
export function erf(x: number): number {
  if (x < 0) {
    return -erf(-x)
  }

  if (x >= 2.5) {
    return 1 - erfc(x)
  }

  let term = x
  let sum = x

  for (let n = 1; n < 400; n++) {
    term *= (-x * x) / n

    const t = term / (2 * n + 1)

    sum += t

    if (Math.abs(t) < 1e-18 * Math.abs(sum)) {
      break
    }
  }

  return (2 / Math.sqrt(Math.PI)) * sum
}

export function erfc(x: number): number {
  if (x < 2.5) {
    return 1 - erf(x)
  }

  let f = x

  for (let k = 80; k >= 1; k--) {
    f = x + k / 2 / f
  }

  return Math.exp(-x * x) / Math.sqrt(Math.PI) / f
}

// the neutralized periodic Coulomb potential less the direct 1 / (4 pi |d|), a unit weight (Ewald), at d != 0 in its
// minimal image
export function coulombImages(
  side: number,
  d: readonly number[],
): number {
  const alpha = 12 / side
  const volume = side ** 3
  const r0 = Math.hypot(d[0]!, d[1]!, d[2]!)

  let real = -erf(alpha * r0) / (4 * Math.PI * r0)

  for (let i = -2; i <= 2; i++) {
    for (let j = -2; j <= 2; j++) {
      for (let k = -2; k <= 2; k++) {
        if (i === 0 && j === 0 && k === 0) {
          continue
        }

        const r = Math.hypot(
          d[0]! + i * side,
          d[1]! + j * side,
          d[2]! + k * side,
        )

        real += erfc(alpha * r) / (4 * Math.PI * r)
      }
    }
  }

  const most = 24

  let reciprocal = 0

  for (let i = -most; i <= most; i++) {
    for (let j = -most; j <= most; j++) {
      for (let k = -most; k <= most; k++) {
        if (i === 0 && j === 0 && k === 0) {
          continue
        }

        const kx = (2 * Math.PI * i) / side
        const ky = (2 * Math.PI * j) / side
        const kz = (2 * Math.PI * k) / side
        const k2 = kx * kx + ky * ky + kz * kz

        reciprocal +=
          (Math.exp(-k2 / (4 * alpha * alpha)) *
            Math.cos(kx * d[0]! + ky * d[1]! + kz * d[2]!)) /
          k2
      }
    }
  }

  return real + reciprocal / volume - 1 / (4 * alpha * alpha * volume)
}

// a Yukawa's images, sum over L != 0 of e^(-m |d + L|) / (4 pi |d + L|), out to m |d + L| = 40
export function yukawaImages(
  side: number,
  mass: number,
  d: readonly number[],
): number {
  const most = Math.ceil(40 / mass / side) + 1

  let s = 0

  for (let i = -most; i <= most; i++) {
    for (let j = -most; j <= most; j++) {
      for (let k = -most; k <= most; k++) {
        if (i === 0 && j === 0 && k === 0) {
          continue
        }

        const r = Math.hypot(
          d[0]! + i * side,
          d[1]! + j * side,
          d[2]! + k * side,
        )

        if (mass * r <= 40) {
          s += Math.exp(-mass * r) / (4 * Math.PI * r)
        }
      }
    }
  }

  return s
}

// THE MESH'S ZERO-MEAN OFFSET. G_N sums over the husk's docks with zero mean over the docks; the continuum phi_N has
// zero mean over the volume. The two differ by the zero-momentum limit of the lattice kernel less the continuum one,
// w_0 lim_(p -> 0) (6 / lambda(p) - 1 / p^2), over the volume. lambda(p) = 6 p^2 - Q p^4 + ..., with
// Q p^4 = (1/12) sum_h g_h (u_h . p)^4 = p^4 / 2 in every direction (the nine links are isotropic at fourth order:
// 2 sum p_i^4 on the axes, 4 sum p_i^4 + 12 sum_(i<j) p_i^2 p_j^2 on the diagonals, 6 |p|^4 together), so the limit is
// Q / 6 = 1/12. The massive modes' kernels agree at p = 0 and add nothing.
export function huskQuartic(): number {
  return (
    TRIT_HUSK_VECTORS.reduce(
      (t, u, h) => t + radionWeight(h) * u[0]! ** 4,
      0,
    ) / 12
  )
}

// G_N(d) - G_inf(d), the stack's images on the torus of side N (the zero mode neutralized); `coulomb` is
// coulombImages(side, d) when the caller has it (it does not depend on the stack)
export function imageShift(
  modes: readonly StackMode[],
  side: number,
  d: readonly number[],
  coulomb = coulombImages(side, d),
): number {
  const { w0, massive } = splitModes(modes)

  return (
    w0 * (coulomb - huskQuartic() / 6 / side ** 3) +
    massive.reduce(
      (t, m) => t + m.weight * yukawaImages(side, m.mass, d),
      0,
    )
  )
}

// the six axis directions
const AXES: readonly (readonly number[])[] = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1],
]

// the response of E-GRV-0117's source (a unit at `center`, -1/N_f on each dock of `far`, given as husk coordinates)
// at the husk point `x`, from G_N
export function backgroundResponse(
  g: PeriodicGreen,
  center: readonly number[],
  far: readonly (readonly number[])[],
  x: readonly number[],
): number {
  let b = 0

  for (const y of far) {
    b += greenAt(g, x[0]! - y[0]!, x[1]! - y[1]!, x[2]! - y[2]!)
  }

  return (
    greenAt(
      g,
      x[0]! - center[0]!,
      x[1]! - center[1]!,
      x[2]! - center[2]!,
    ) -
    b / far.length
  )
}

// E_N(r): the six-axis mean of that response at r from the center, less its value at dock 0 (the origin)
export function periodicExcess(
  g: PeriodicGreen,
  center: readonly number[],
  far: readonly (readonly number[])[],
  r: number,
  reference = backgroundResponse(g, center, far, [0, 0, 0]),
): number {
  const mean =
    AXES.reduce(
      (t, a) =>
        t +
        backgroundResponse(
          g,
          center,
          far,
          a.map((v, i) => center[i]! + v * r),
        ),
      0,
    ) / AXES.length

  return mean - reference
}
