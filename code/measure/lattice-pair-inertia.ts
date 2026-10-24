// THE KINETIC INERTIA OF A BOUND REGISTER PAIR FROM THE MEMBER'S EXACT BAND (E-SPN-0209).
//
// A pair of members at total momentum K and relative momentum p has energy E_m(K/2 + p) + E_m(K/2 - p) if the pull
// carries no momentum (the static picture of E-SPN-0155's formula). Averaged over the relative-momentum density
// |phi(p)|^2 of the bound level, its band is E(K) = E0 + a K^2 with
//   a = (1/4) < d^2 E_m / dp_x^2 >_phi            (two members, each at K/2: 2 x (1/2)^2 x (1/2))
// E-SPN-0155's formula R = (2 tan m + (5/3) E_b) / (2m - E_b) is this with the continuum's E_m = sqrt(m^2 + p^2)
// expanded to first order in p^2 / m^2 and the virial T = E_b. Here E_m is the member's EXACT cycle band, E-SPN-0160's
// Dirac phase acos(cos M0 - 2 cos^2(M0 / 2) g^2(p)) (code/measure/spinor-register diracPhase), so every order of the
// band's non-quadratic terms and its lattice anisotropy is kept, and the register's partner is in it (the band is the
// register member's own).
//
// THE DENSITY. The level's relative-momentum density is taken hydrogenic, |phi(p)|^2 proportional to 1 / (1 + a^2
// p^2)^4, at a radius a (the reference's a_B, or the radius whose hydrogenic binding equals the level's own measured
// binding). The husk relative coordinate is an integer triple, so p lies in the cube [-pi, pi]^3 (depth momentum 0);
// the average is taken over the inscribed ball |p| <= pi, which leaves out a weight of order (a pi)^-5.
//
// QUADRATURE. Radius: u = a |p| = tan(t), a midpoint grid in t on [0, atan(a pi)], weight u^2 / (1 + u^2)^4 du.
// Directions: a Fibonacci set on the sphere (deterministic), the second derivative along x by a central difference.

import { diracPhase } from '@/code/measure/spinor-register'

export type PairInertia = {
  // the band coefficient a (cycle phase per K^2) and the density's mean p^2
  a: number
  meanP2: number
  points: number
}

const fibonacciSphere = (n: number): [number, number, number][] => {
  const out: [number, number, number][] = []
  const golden = Math.PI * (3 - Math.sqrt(5))

  for (let i = 0; i < n; i++) {
    const z = 1 - (2 * (i + 0.5)) / n
    const r = Math.sqrt(1 - z * z)
    const phi = golden * i

    out.push([r * Math.cos(phi), r * Math.sin(phi), z])
  }

  return out
}

export function latticePairCurvature(input: {
  M0: number
  radius: number
  radial?: number
  directions?: number
  h?: number
}): PairInertia {
  const { M0, radius } = input
  const radial = input.radial ?? 400
  const h = input.h ?? 1e-4
  const dirs = fibonacciSphere(input.directions ?? 200)
  const top = Math.atan(radius * Math.PI)
  const dt = top / radial
  const E = (p: readonly number[]): number => diracPhase(p, M0)

  let w = 0
  let sum = 0
  let p2 = 0

  for (let i = 0; i < radial; i++) {
    const t = (i + 0.5) * dt
    const u = Math.tan(t)
    const weight = ((u * u) / (1 + u * u) ** 4) * (1 + u * u) * dt
    const q = u / radius

    let second = 0

    for (const [x, y, z] of dirs) {
      const p = [q * x, q * y, q * z, 0]

      second +=
        (E([p[0]! + h, p[1]!, p[2]!, 0]) -
          2 * E(p) +
          E([p[0]! - h, p[1]!, p[2]!, 0])) /
        (h * h)
    }

    w += weight
    sum += (weight * second) / dirs.length
    p2 += weight * q * q
  }

  return { a: sum / w / 4, meanP2: p2 / w, points: radial * dirs.length }
}

// THE WHOLE BAND, NOT ONLY ITS CURVATURE (E-MTR-0033): the static pair's energy at total momentum K along a unit
// direction, E_m(K/2 + p) + E_m(K/2 - p) averaged over the same hydrogenic density (the same quadrature), with the
// average at K = 0 subtracted, so only the K-dependence is returned. Every order in K of the members' exact band is
// kept, which is the pair's dispersion if binding added nothing to its motion beyond holding the members together.
export function latticePairBand(input: {
  M0: number
  radius: number
  K: number
  direction?: readonly [number, number, number]
  radial?: number
  directions?: number
}): number {
  const { M0, radius, K } = input
  const d = input.direction ?? [1, 0, 0]
  const radial = input.radial ?? 400
  const dirs = fibonacciSphere(input.directions ?? 200)
  const top = Math.atan(radius * Math.PI)
  const dt = top / radial
  const E = (p: readonly number[]): number => diracPhase(p, M0)
  const half = [(K * d[0]) / 2, (K * d[1]) / 2, (K * d[2]) / 2]

  let w = 0
  let sum = 0

  for (let i = 0; i < radial; i++) {
    const t = (i + 0.5) * dt
    const u = Math.tan(t)
    const weight = ((u * u) / (1 + u * u) ** 4) * (1 + u * u) * dt
    const q = u / radius

    let band = 0

    for (const [x, y, z] of dirs) {
      const p = [q * x, q * y, q * z]

      band +=
        E([half[0]! + p[0]!, half[1]! + p[1]!, half[2]! + p[2]!, 0]) +
        E([half[0]! - p[0]!, half[1]! - p[1]!, half[2]! - p[2]!, 0]) -
        2 * E([p[0]!, p[1]!, p[2]!, 0])
    }

    w += weight
    sum += (weight * band) / dirs.length
  }

  return sum / w
}

// the pair's kinetic inertia over energy, c*^2 / (2 a E), at a bound level of cycle phase E
export const pairR = (a: number, E: number, cStar2 = 0.5): number =>
  cStar2 / (2 * a * E)

// the radius whose continuum hydrogenic binding 1 / (2 mu a^2) equals a measured cycle binding Eb (2M - E)
export const bindingRadius = (mu: number, Eb: number): number =>
  1 / Math.sqrt(2 * mu * Eb)
