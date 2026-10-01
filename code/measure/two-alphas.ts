// Measurement for the two alphas (the experiment in test/experiment/gauge/two-alphas): the Coulomb alpha and the
// golden-rule alpha read from one light's own operators, in the long-wave limit, exactly (a Gauss-Legendre
// sphere and a Richardson step in k; nothing is sampled).
//
// ONE LIGHT, THREE LONG-WAVE CONSTANTS. A light whose field energy is (a/2) sum_l e_l^2 / w_l plus its magnetic
// part, with photon eigenvalues mu of its Hermitian symbol (4 sin^2(omega / 2) = kappa mu), has:
//   the speed        c^2 / kappa = lim mu_photon / k^2, over every direction
//   the static eps   eps_C = lim eps(k) / k^2, eps(k) = sum_l w_l |1 - e^(i k . v_l)|^2, the operator Gauss's law
//                    and the minimum field energy give a static charge: a +1, -1 pair then holds a / (4 pi eps_C r)
//   the radiative eps  a one-link dimer on link direction h radiates, by the golden rule into the photon modes, at
//                    omega^3 |d|^2 / (3 pi eps_R c^3) as omega -> 0, with (code/measure/husk-emission's normalization,
//                    coupling F = i omega / (2 w_h), dipole d = |v_h| / 2)
//                        eps_R(h) = 8 pi w_h |v_h|^2 / (3 I_h),   I_h = int dOmega sum_photons |u_(b, h)(k-hat)|^2
//                    u the unit photon eigenvectors of the Hermitian symbol at k -> 0
// Then alpha, the energy between two unit charges times r over hbar c, is a / (4 pi eps_C c) read statically and
// a / (4 pi eps_R c) read from emission. In the quantum light a = 2 pi s / N (the drift's phase per unit of
// 1/2 e^2 / w, E-FRC-0242) and kappa = s f.
//
// THE CUBIC CONTROL. The simple cubic lattice light, one link of weight 1 per axis and square plaquettes: its
// curl-curl in the midpoint frame is |q|^2 I - q q^T, q_l = 2 sin(k_l / 2), so its photons have mu = |q|^2.

import {
  eigenSmall,
  type RayGrid,
  type Symbolizer,
} from '@/code/measure/husk-emission'
import { makeComplexMatrix } from '@/code/algebra/linear/dense'

/** The simple cubic lattice light, as a symbolizer: 3 links of weight 1, squares, photons at mu = |q|^2. */
export function cubicSymbolizer(): Symbolizer {
  const axes = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ]

  return {
    dimension: 3,
    size: 3,
    matrix: k => {
      const m = makeComplexMatrix({ rows: 3, cols: 3 })
      const q = [0, 1, 2].map(i => 2 * Math.sin((k[i] ?? 0) / 2))
      const q2 = q.reduce((s, x) => s + x * x, 0)

      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          m.re[i * 3 + j] = (i === j ? q2 : 0) - (q[i] ?? 0) * (q[j] ?? 0)
        }
      }

      return m
    },
    weight: () => 1,
    vector: h => axes[h] ?? [0, 0, 0],
    exit: r => Math.PI / Math.max(...r.map(Math.abs)),
    first: 1,
    photons: 2,
  }
}

/** eps(k) = sum_l w_l |1 - e^(i k . v_l)|^2, the static operator of a light's links (Gauss's law on its weights). */
export function gaussSymbol(
  symbol: Symbolizer,
  k: readonly number[],
): number {
  let s = 0

  for (let h = 0; h < symbol.size; h++) {
    const v = symbol.vector(h)
    const phase = v.reduce((acc, x, i) => acc + x * (k[i] ?? 0), 0)

    s += symbol.weight(h) * 2 * (1 - Math.cos(phase))
  }

  return s
}

/** The three long-wave readings at one radius: per direction speed and static eps, and I_h per link direction. */
function readingsAt(
  symbol: Symbolizer,
  grid: RayGrid,
  radius: number,
): { speed: number[]; stat: number[]; coupling: number[] } {
  const n = symbol.size
  const speed: number[] = []
  const stat: number[] = []
  const coupling = new Array<number>(n).fill(0)

  grid.directions.forEach((r, ray) => {
    const k = r.map(x => x * radius)
    const eig = eigenSmall(symbol.matrix(k))
    const k2 = radius * radius

    for (let b = symbol.first; b < symbol.first + symbol.photons; b++) {
      speed.push((eig.values[b] ?? 0) / k2)

      for (let h = 0; h < n; h++) {
        const re = eig.re[h * n + b] ?? 0
        const im = eig.im[h * n + b] ?? 0

        coupling[h] =
          (coupling[h] ?? 0) + (grid.weights[ray] ?? 0) * (re * re + im * im)
      }
    }

    stat.push(gaussSymbol(symbol, k) / k2)
  })

  return { speed, stat, coupling }
}

export type LongWave = {
  /** c^2 / kappa, the mean over directions and both photons, Richardson-extrapolated */
  speedSquared: number
  /** the largest departure of any direction's c^2 / kappa from the mean, at the smaller radius */
  speedSpread: number
  /** eps_C, the mean over directions, extrapolated */
  staticPermittivity: number
  staticSpread: number
  /** eps_R per link direction, extrapolated */
  radiativePermittivity: number[]
  /** the gauge mode's eigenvalue, largest over directions at the smaller radius, over k^2 (must be 0) */
  gaugeLeak: number
}

/** The long-wave constants of a light at radii r and r / 2, extrapolated to k = 0 (error O(r^4)). */
export function longWave(
  symbol: Symbolizer,
  grid: RayGrid,
  radius: number,
): LongWave {
  const far = readingsAt(symbol, grid, radius)
  const near = readingsAt(symbol, grid, radius / 2)
  const mean = (xs: number[]): number =>
    xs.reduce((a, b) => a + b, 0) / xs.length
  const extrapolate = (a: number, b: number): number => (4 * b - a) / 3
  const spread = (xs: number[]): number => {
    const m = mean(xs)

    return Math.max(...xs.map(x => Math.abs(x - m)))
  }

  const radiative = far.coupling.map((_, h) => {
    const w = symbol.weight(h)
    const v2 = symbol.vector(h).reduce((s, x) => s + x * x, 0)
    const i = extrapolate(far.coupling[h] ?? 0, near.coupling[h] ?? 0)

    return (8 * Math.PI * w * v2) / (3 * i)
  })

  let gaugeLeak = 0

  grid.directions.forEach(r => {
    const k = r.map(x => (x * radius) / 2)
    const values = eigenSmall(symbol.matrix(k), false).values

    gaugeLeak = Math.max(
      gaugeLeak,
      Math.abs(values[0] ?? 0) / (radius * radius / 4),
    )
  })

  return {
    speedSquared: extrapolate(mean(far.speed), mean(near.speed)),
    speedSpread: spread(near.speed),
    staticPermittivity: extrapolate(mean(far.stat), mean(near.stat)),
    staticSpread: spread(near.stat),
    radiativePermittivity: radiative,
    gaugeLeak,
  }
}

/** alpha from a light's long-wave constants: a / (4 pi eps c), a = 2 pi s / N, c = sqrt(kappa c^2/kappa). */
export function alphaOfLight(input: {
  n: number
  s: number
  kappa: number
  permittivity: number
  speedSquared: number
}): number {
  const a = (2 * Math.PI * input.s) / input.n
  const c = Math.sqrt(input.kappa * input.speedSquared)

  return a / (4 * Math.PI * input.permittivity * c)
}
