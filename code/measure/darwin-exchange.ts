// THE TRANSVERSE EXCHANGE OF THE HUSK LIGHT, READ AGAINST ITS COULOMB EXCHANGE (the experiment spin/darwin-exchange).
// Measurement only: the light's own static operators, in doubles.
//
//   THE TWO KERNELS. The husk light (code/rule/trit-column, E-FRC-0179) has the Lagrangian
//     L = (1/2) Adot^T G^(-1) Adot - (kappa / 2) A^T G^(-1/2) H G^(-1/2) A + J^T G^(-1) A - rho phi
//   G = diag(HUSK_WEIGHTS) (2 on an axis, 1 on a face diagonal), H(k) the Hermitian husk curl-curl (photon-symbol's
//   huskSymbol(...).hermitian), J the link current of the charges (flux units, continuity rho' + div J = 0). The gauge
//   change A -> A + G grad chi is what makes J^T G^(-1) A the gauge-invariant coupling. Statics:
//     Coulomb     eps(k) phi = rho,  eps(k) = sum_h g_h 2 (1 - cos k . u_h)   (E-FRC-0241's operator)
//     Ampere      kappa G^(-1/2) H G^(-1/2) A = G^(-1) J   on the non-gauge modes (Coulomb gauge)
//   so two currents exchange the Lagrangian (1 / kappa) J1^T G^(-1/2) H^+ G^(-1/2) J2 and two charges the energy
//   rho1 rho2 / eps.
//
//   THE CURRENT OF A MOVING CHARGE. A charge density moving with velocity v carries the link current J_h = (g_h / 6)
//   (u_h . v) rho (sum_h g_h u_h u_h^T = 6 I, the same weights as eps = 6 k^2 + ...). At long wave only sum_h J_h u_h =
//   v rho enters: J^T G^(-1) A = (sum_h J_h u_h) . A_vec for A_h = g_h (u_h . A_vec).
//
//   THE RATIO X(k). The velocity-averaged transverse kernel over the Coulomb kernel, times kappa:
//     X(k) = (1/3) sum_i b_i^dag H^+(k) b_i  eps(k),   b_i,h = sqrt(g_h) u_h,i / 6
//   At long wave H has two transverse eigenvalues beta k^2 with the unit modes a_h = sqrt(g_h) (u_h . e) / sqrt 6,
//   each overlapping b_i by e_i / sqrt 6, so X -> (1/3)(2/6) / beta x 6 = 2 / (3 beta), and the light's own speed c^2 =
//   kappa beta (E-FRC-0179: beta = 2/3, c^2 = 2 kappa / 3) gives X -> 1 EXACTLY iff the light's magnetostatics and its
//   electrostatics come from one Maxwell Lagrangian at the speed it propagates at. Then the velocity-averaged transverse
//   exchange is (2/3) / c^2 times the Coulomb one, which is the Darwin term's (the transverse projector's trace is 2).
//   Off long wave, X - 1 is the lattice's correction, and the six optical link modes enter only as contact terms.
//
//   THE BOUND STATE'S S. For a relative density rho(r), <V> = (1/Vol) sum_k rhohat(k) / eps(k) and the averaged
//   transverse exchange (1/Vol) sum_k rhohat(k) X(k) / eps(k) / kappa, so their ratio is S / kappa with
//     S = sum_(k != 0) X(k) rhohat(k) / eps(k)  /  sum_(k != 0) rhohat(k) / eps(k)
//   S -> 1 as the state grows (every k it weights goes to 0), and S - 1 is the lattice's correction to the Darwin
//   inertia -(8/3) E_b S (c_member / c_light)^2.
//
// DETERMINISM: no random numbers; a uniform torus grid of momenta; a separable Gaussian density.

import { hermitianEigen } from '@/code/measure/photon-modes'
import {
  makeHusk,
  HUSK_VECTORS,
  HUSK_WEIGHTS,
  type Husk,
} from '@/code/measure/photon-husk'
import {
  curlSymbol,
  huskLaplacianSymbol,
  huskSymbol,
  plaquetteShapes,
  type PlaquetteShape,
} from '@/code/measure/photon-symbol'
import { photonLatticeD4 } from '@/code/rule/photon-links'

type PhotonLattice = ReturnType<typeof photonLatticeD4>

let lightCache:
  | { bulk: PhotonLattice; husk: Husk; shapes: PlaquetteShape[] }
  | undefined

function light(): {
  bulk: PhotonLattice
  husk: Husk
  shapes: PlaquetteShape[]
} {
  if (!lightCache) {
    const bulk = photonLatticeD4({ side: 4 })

    lightCache = {
      bulk,
      husk: makeHusk(bulk),
      shapes: plaquetteShapes(bulk),
    }
  }

  return lightCache
}

/** The Hermitian husk curl-curl at a husk wave vector: its eigenvalues ascending, with unit eigenvectors (columns). */
export function huskModes(k: readonly number[]): {
  values: number[]
  re: number[][]
  im: number[][]
} {
  const p = light()
  const m = huskSymbol(
    p.husk,
    curlSymbol(p.bulk, p.shapes, [k[0] ?? 0, k[1] ?? 0, k[2] ?? 0, 0]),
  ).hermitian
  const e = hermitianEigen(m)
  const n = m.rows
  const order = Array.from(e.values, (v, i) => [v, i] as const).sort(
    (a, b) => a[0] - b[0],
  )

  return {
    values: order.map(([v]) => v),
    re: order.map(([, i]) =>
      Array.from({ length: n }, (_, a) => e.vectorsRe[a * n + i] ?? 0),
    ),
    im: order.map(([, i]) =>
      Array.from({ length: n }, (_, a) => e.vectorsIm[a * n + i] ?? 0),
    ),
  }
}

/** b_i,h = sqrt(g_h) u_h,i / 6: a unit-velocity current along axis i, in the Hermitian coordinates G^(-1/2) J. */
export const CURRENT_VECTORS: readonly number[][] = [0, 1, 2].map(i =>
  HUSK_VECTORS.map(
    (u, h) => (Math.sqrt(HUSK_WEIGHTS[h] ?? 1) * (u[i] ?? 0)) / 6,
  ),
)

/** The Coulomb symbol eps(k) (E-FRC-0241's operator). */
export const coulombSymbol = (k: readonly number[]): number =>
  huskLaplacianSymbol(k)

/**
 * X(k) = (1/3) sum_i b_i^dag H^+ b_i eps(k): the velocity-averaged transverse exchange over the Coulomb one, times
 * kappa. `gaugeTolerance` (relative to the top eigenvalue) decides which modes are gauge (the pseudo-inverse drops them).
 */
export function darwinRatio(
  k: readonly number[],
  gaugeTolerance = 1e-9,
): { X: number; transverse: number[]; gauge: number } {
  const modes = huskModes(k)
  const top = Math.max(...modes.values.map(Math.abs))

  let sum = 0
  let gauge = 0

  modes.values.forEach((value, j) => {
    if (Math.abs(value) <= gaugeTolerance * top) {
      gauge++

      return
    }

    for (const b of CURRENT_VECTORS) {
      let re = 0
      let im = 0

      b.forEach((x, h) => {
        re += (modes.re[j]?.[h] ?? 0) * x
        im += (modes.im[j]?.[h] ?? 0) * x
      })
      sum += (re * re + im * im) / value
    }
  })

  return {
    X: (sum / 3) * coulombSymbol(k),
    transverse: modes.values.slice(gauge, gauge + 2),
    gauge,
  }
}

/** f(k) = sum over x in the torus of exp(-x^2 / sigma^2) cos(k x): one axis of a separable Gaussian density's transform. */
function gaussianAxis(side: number, sigma: number, k: number): number {
  let s = 0

  for (let x = -side / 2; x < side / 2; x++) {
    s += Math.exp(-(x * x) / (sigma * sigma)) * Math.cos(k * x)
  }

  return s
}

/**
 * S for a Gaussian relative density of width sigma on the side^3 husk torus: the rho-hat / eps weighted mean of X over
 * the nonzero torus momenta. Also returns the weighted mean k^2 (which S - 1 should follow at order k^2).
 */
export function boundStateS(
  sigma: number,
  side: number,
): { S: number; meanK2: number; points: number } {
  const step = (2 * Math.PI) / side
  const axis = Array.from({ length: side }, (_, a) =>
    gaussianAxis(side, sigma, a * step),
  )

  let num = 0
  let den = 0
  let k2 = 0
  let points = 0

  for (let a = 0; a < side; a++) {
    for (let b = 0; b < side; b++) {
      for (let c = 0; c < side; c++) {
        if (a === 0 && b === 0 && c === 0) {
          continue
        }

        const k = [a, b, c].map(x => {
          const y = x * step

          return y > Math.PI ? y - 2 * Math.PI : y
        })
        const weight =
          ((axis[a] ?? 0) * (axis[b] ?? 0) * (axis[c] ?? 0)) /
          coulombSymbol(k)
        const { X } = darwinRatio(k)

        num += X * weight
        den += weight
        k2 += (k[0]! ** 2 + k[1]! ** 2 + k[2]! ** 2) * weight
        points++
      }
    }
  }

  return { S: num / den, meanK2: k2 / den, points }
}

/** E-SPN-0155's static inertia over energy for a pair of members of mass m bound by E_b: (2 tan m + (5/3) E_b) / (2m - E_b). */
export const staticR = (m: number, Eb: number): number =>
  (2 * Math.tan(m) + (5 / 3) * Eb) / (2 * m - Eb)

/**
 * With the transverse exchange: the Darwin inertia -(8/3) E_b S (c_member / c_light)^2 added to the numerator. At
 * S = 1 and one speed it is (2 tan m - E_b) / (2m - E_b), whose excess over tan m / m is E_b (tan m - m) / (m (2m -
 * E_b)): second order.
 */
export const darwinR = (
  m: number,
  Eb: number,
  S: number,
  speedRatio2: number,
): number =>
  (2 * Math.tan(m) + (5 / 3) * Eb - (8 / 3) * Eb * S * speedRatio2) /
  (2 * m - Eb)
