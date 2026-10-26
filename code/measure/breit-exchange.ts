// THE ONE-LIGHT EXCHANGE BETWEEN TWO MOVING MEMBERS, FROM THE RULE'S OWN LIGHT (E-SPN-0218). Measurement only: the
// husk light's operators (code/measure/darwin-exchange), in doubles.
//
//   THE PROPAGATOR. The husk light's Lagrangian (darwin-exchange's header) in Hermitian coordinates B = G^(-1/2) A has
//   the equation (4 sin^2(omega / 2) - kappa H(k)) B = -j per beat (the leapfrog's own symbol, E-FRC-0179), j = G^(-1/2) J.
//   In the Coulomb gauge the gauge mode of H is the constraint (Gauss's law, instantaneous, the count's pull) and the
//   rest is the transverse light, so the one-light exchange between two currents is
//     j1^dag (kappa H - 4 sin^2(omega / 2))^+ j2,  the pseudo-inverse on the non-gauge modes,
//   which at omega = 0 is darwin-exchange's static transverse kernel and grows with omega as 1 + 4 sin^2(omega / 2) /
//   (kappa lambda) + ... mode by mode. For a pair moving together at V the light carries the energy omega = V . k, so the
//   frequency correction is (V . k-hat)^2 / c_l^2: order V^4, beyond the Breit (v^2 / c^2) term.
//
//   THE BREIT STRENGTH OF A BOUND LEVEL. darwin-exchange's S, written in position space: with X(k) the velocity-averaged
//   transverse kernel over the Coulomb one (times kappa), and the level's relative density rho(y) on the husk docks,
//     S - 1 = sum_y rho(y) D_T(y) / sum_y rho(y) G(y),   D_T = FT[(X - 1) / eps],  G = FT[1 / eps]
//   X - 1 = -k^2 / 18 + ... (E-SPN-0169) makes (X - 1) / eps smooth at k = 0, so D_T is short-ranged and a modest
//   torus gives it; G is the engine's own Green function (husk-meson's table, the same operator). The light's speed
//   enters once: the exchange is (2/3) S / c_l^2 of the Coulomb one, so against the member's speed the Breit strength
//   is S_rule = S (c_m / c_l)^2.
//
// DETERMINISM: no random numbers; torus grids and lattice sums.

import { coulombSymbol, darwinRatio, huskModes, CURRENT_VECTORS } from '@/code/measure/darwin-exchange'
import { greenAt, type GreenTable } from '@/code/measure/husk-meson'
import { fft3 } from '@/code/measure/standin-chemistry'

/** A cube [-C, C]^3 of values on the husk docks. */
export type Cube = { C: number; value: Float64Array }

export const cubeAt = (c: Cube, a: number, b: number, d: number): number => {
  const side = 2 * c.C + 1

  if (Math.abs(a) > c.C || Math.abs(b) > c.C || Math.abs(d) > c.C) return 0

  return c.value[a + c.C + side * (b + c.C) + side * side * (d + c.C)]!
}

// the long-wave value of (X - 1) / eps, -1/108 at k -> 0, read by Richardson on the axis (the k = 0 mode of the torus)
const remainderAtZero = (): number => {
  const f = (r: number): number => (darwinRatio([r, 0, 0]).X - 1) / coulombSymbol([r, 0, 0])

  return (4 * f(0.02) - f(0.04)) / 3
}

/**
 * The torus transforms of f(k) on a side-L grid, read back on [-C, C]^3: `transverse` is D_T = FT[(X - 1) / eps] (the
 * k = 0 mode its long-wave limit), `coulomb` is G_L(0) - G_L(y) for the same symbol (zero mode removed), a check of
 * the transform against the engine's Green table. X is cubic-invariant (the rule is O_h symmetric), so it is computed
 * once per orbit of the grid (sorted absolute indices).
 */
export function lightCubes(L: number, C: number): { transverse: Cube; coulomb: Cube; orbits: number } {
  if (2 * C >= L) throw new Error('breit-exchange: the cube must fit inside half the torus')

  const step = (2 * Math.PI) / L
  const n = L * L * L
  const tRe = new Float64Array(n)
  const tIm = new Float64Array(n)
  const gRe = new Float64Array(n)
  const gIm = new Float64Array(n)
  const cache = new Map<string, number>()
  const fold = (a: number): number => Math.min(a, L - a)
  const wave = (a: number): number => (a <= L / 2 ? a : a - L) * step

  for (let c = 0; c < L; c++) {
    for (let b = 0; b < L; b++) {
      for (let a = 0; a < L; a++) {
        const i = a + L * b + L * L * c

        if (a === 0 && b === 0 && c === 0) continue

        const k = [wave(a), wave(b), wave(c)]
        const key = [fold(a), fold(b), fold(c)].sort((x, y) => x - y).join(',')
        let x = cache.get(key)

        if (x === undefined) {
          x = darwinRatio(k).X
          cache.set(key, x)
        }

        const eps = coulombSymbol(k)

        tRe[i] = (x - 1) / eps
        gRe[i] = 1 / eps
      }
    }
  }

  tRe[0] = remainderAtZero()
  fft3(tRe, tIm, L, true)
  fft3(gRe, gIm, L, true)

  const side = 2 * C + 1
  const transverse = new Float64Array(side * side * side)
  const coulomb = new Float64Array(side * side * side)
  const m = (x: number): number => ((x % L) + L) % L

  for (let c = -C; c <= C; c++) {
    for (let b = -C; b <= C; b++) {
      for (let a = -C; a <= C; a++) {
        const o = a + C + side * (b + C) + side * side * (c + C)
        const i = m(a) + L * m(b) + L * L * m(c)

        transverse[o] = tRe[i]!
        coulomb[o] = gRe[0]! - gRe[i]!
      }
    }
  }

  return { transverse: { C, value: transverse }, coulomb: { C, value: coulomb }, orbits: cache.size }
}

export type LevelKind = '1s' | '2s'

/** The hydrogenic relative density of a level at Bohr radius a, unnormalized, at the husk dock offset of length r. */
export const levelDensity = (kind: LevelKind, a: number, r: number): number =>
  kind === '1s' ? Math.exp((-2 * r) / a) : (1 - r / (2 * a)) ** 2 * Math.exp(-r / a)

/**
 * A level's Breit strength S (the light at the member's speed): S - 1 = sum rho D_T / sum rho G over the husk docks,
 * rho the hydrogenic density of radius a, G = g0 - D the engine's Green function. The Coulomb sum runs over the cube
 * |y_i| <= 40 a (the density below e^-40 of its peak beyond), by octants with multiplicities. Also returned: the
 * share of the transverse remainder from the docks at |y|^2 <= 2 (where a softened core would act).
 */
export function levelS(input: { table: GreenTable; transverse: Cube; kind: LevelKind; a: number }): {
  S: number
  coulomb: number
  remainder: number
  coreShare: number
  norm: number
} {
  const { table, transverse, kind, a } = input
  const R = Math.ceil(40 * a)

  let norm = 0
  let coulomb = 0
  let remainder = 0
  let core = 0

  for (let z = 0; z <= R; z++) {
    for (let y = 0; y <= z; y++) {
      for (let x = 0; x <= y; x++) {
        const mult = orbitSize(x, y, z)
        const r = Math.hypot(x, y, z)
        const rho = levelDensity(kind, a, r) * mult

        norm += rho
        coulomb += rho * (table.g0 - greenAt(table, x, y, z))

        if (z <= transverse.C) {
          const t = rho * cubeAt(transverse, x, y, z)

          remainder += t
          if (x * x + y * y + z * z <= 2) core += t
        }
      }
    }
  }

  return { S: 1 + remainder / coulomb, coulomb: coulomb / norm, remainder: remainder / norm, coreShare: core / remainder, norm }
}

// the number of signed permutations of (x, y, z), 0 <= x <= y <= z
function orbitSize(x: number, y: number, z: number): number {
  const signs = (x === 0 ? 1 : 2) * (y === 0 ? 1 : 2) * (z === 0 ? 1 : 2)
  const perms = x === y && y === z ? 1 : x === y || y === z ? 3 : 6

  return signs * perms
}

/**
 * The frequency dependence of the transverse exchange at long wave: the velocity-averaged kernel at frequency omega per
 * beat over its static value, minus 1, against omega^2 / (kappa lambda_T) (the first term of each mode's expansion).
 */
export function retardation(k: readonly number[], kappa: number, omega: number): { relative: number; leading: number } {
  const modes = huskModes(k)
  const top = Math.max(...modes.values.map(Math.abs))
  const w = 4 * Math.sin(omega / 2) ** 2

  let at = 0
  let still = 0
  let lambdaT = 0

  modes.values.forEach((value, j) => {
    if (Math.abs(value) <= 1e-9 * top) return

    for (const b of CURRENT_VECTORS) {
      let re = 0
      let im = 0

      b.forEach((x, h) => {
        re += (modes.re[j]?.[h] ?? 0) * x
        im += (modes.im[j]?.[h] ?? 0) * x
      })

      const o = re * re + im * im

      at += o / (kappa * value - w)
      still += o / (kappa * value)
      if (o > 1e-12 && lambdaT === 0) lambdaT = value
    }
  })

  return { relative: at / still - 1, leading: w / (kappa * lambdaT) }
}

/** The light's speed squared over the member's on the husk, per beat: c_l^2 = 2 kappa / 3, c_m^2 = 1/8 (E-FRC-0260). */
export const speedRatio2 = (kappa: number): number => 1 / 8 / ((2 * kappa) / 3)

/** The trit column's coupling at depth D (p = 1, E-FRC-0207): kappa = 2 / (2D + 1). */
export const tritKappa = (D: number): number => 2 / (2 * D + 1)

/**
 * The transverse exchange's energy for a level moving at total momentum K, first order on its band E(K) = E0 + a K^2 -
 * rho (E0 + a K^2 - sqrt(E0^2 + 2 a E0 K^2)) (pair-boost's quartic-fraction model): the c.m. velocity V = dE/dK, and
 *   Delta E(K) = (4/3) S E_b (V^2 / c_m^2) (1 + (f / 5) V^2 / c_m^2)
 * with S the Breit strength against the member's speed (S_rule), f = (c_m / c_l)^2, E_b the level's binding (the
 * virial |V_C| = 2 E_b) and the frequency correction's angular mean 1/5 (the transverse projector times (V . k-hat)^2).
 * Cycle units, c_m^2 = cStar2.
 */
export function transverseBandShift(input: {
  E0: number
  a: number
  rho: number
  Eb: number
  S: number
  f: number
  K: number
  cStar2?: number
}): number {
  const { E0, a, rho, Eb, S, f, K } = input
  const c2 = input.cStar2 ?? 0.5
  const V = 2 * a * K - rho * (2 * a * K - (2 * a * E0 * K) / Math.sqrt(E0 * E0 + 2 * a * E0 * K * K))
  const v2 = (V * V) / c2

  return (4 / 3) * S * Eb * v2 * (1 + (f / 5) * v2)
}
