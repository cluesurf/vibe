// The convex roof of the two-qutrit concurrence, bounded tighter than the eigen-decomposition (E-QTM-0193).
//
// C(psi) = sqrt(2 (1 - Tr rho_A^2)) for a pure two-qutrit vector (Rungta et al. 2001), and for a mixed state
// C(rho) = min over decompositions rho = sum p_i |psi_i><psi_i| of sum p_i C(psi_i). For an unnormalized
// member psi~ = sqrt(p) psi the summand is g(psi~) = sqrt(2 (<psi~|psi~>^2 - Tr sigma^2)), sigma = M M^dagger,
// M the 3 x 3 reshaping of psi~ (M_ab = psi~[3 a + b]).
//
// Upper bound: every decomposition of rho with K members is psi~_i = sum_j U_ij v_j, v_j = sqrt(lambda_j) e_j
// the scaled eigenvectors and U a K x r isometry (Hughston, Jozsa, Wootters), so sum_i g(psi~_i) is an upper
// bound on C(rho) for EVERY isometry U. It is lowered here by Riemannian gradient descent on the isometries
// (Armijo steps, retraction by Gram-Schmidt), from deterministic starts. K = r^2 + 1 suffices for the roof
// (Uhlmann). The result is a decomposition, returned with its reconstruction residual, so the bound can be
// re-checked by anyone without the descent.
//
// Lower bound (Mintert and Buchleitner 2007, PRL 98 140505): C(rho)^2 >= Tr(rho x rho V_i) for
// V_1 = 4 (P-_A - P+_A) x P-_B and V_2 = 4 P-_A x (P-_B - P+_B), P+- the symmetric and antisymmetric projectors
// on two copies of one role; written out, C^2 >= 2 Tr rho^2 - 2 Tr rho_A^2 and C^2 >= 2 Tr rho^2 - 2 Tr rho_B^2,
// both exact on pure states.
//
// Measurement code in floats. The rule never calls it.

import { type Operator } from '@/code/measure/grid-weights'
import { hermitianEigenvectors } from '@/code/measure/qutrit-clifford'
import { weylUnitary } from '@/code/tool/weyl'

type CVec = { re: Float64Array; im: Float64Array }

// g(psi~) and its gradient d g / d conj(psi~), for a 9-vector
function summand(
  re: Float64Array,
  im: Float64Array,
  wantGradient: boolean,
): { value: number; gre: Float64Array; gim: Float64Array } {
  // sigma = M M^dagger, sigma_ac = sum_b M_ab conj(M_cb)
  const sr = new Float64Array(9)
  const si = new Float64Array(9)

  let norm = 0

  for (let k = 0; k < 9; k++) {
    norm += (re[k] ?? 0) ** 2 + (im[k] ?? 0) ** 2
  }

  for (let a = 0; a < 3; a++) {
    for (let c = 0; c < 3; c++) {
      let r = 0
      let m = 0

      for (let b = 0; b < 3; b++) {
        const xr = re[3 * a + b] ?? 0
        const xi = im[3 * a + b] ?? 0
        const yr = re[3 * c + b] ?? 0
        const yi = -(im[3 * c + b] ?? 0)

        r += xr * yr - xi * yi
        m += xr * yi + xi * yr
      }

      sr[3 * a + c] = r
      si[3 * a + c] = m
    }
  }

  let purity = 0

  for (let k = 0; k < 9; k++) {
    purity += (sr[k] ?? 0) ** 2 + (si[k] ?? 0) ** 2
  }

  const squared = 2 * (norm * norm - purity)
  const value = Math.sqrt(Math.max(0, squared))
  const gre = new Float64Array(9)
  const gim = new Float64Array(9)

  if (!wantGradient || value < 1e-13) {
    return { value, gre, gim }
  }

  // d g / d conj(psi) = 2 (N psi - vec(sigma M)) / g
  for (let a = 0; a < 3; a++) {
    for (let b = 0; b < 3; b++) {
      let r = 0
      let m = 0

      for (let c = 0; c < 3; c++) {
        const xr = sr[3 * a + c] ?? 0
        const xi = si[3 * a + c] ?? 0
        const yr = re[3 * c + b] ?? 0
        const yi = im[3 * c + b] ?? 0

        r += xr * yr - xi * yi
        m += xr * yi + xi * yr
      }

      gre[3 * a + b] = (2 * (norm * (re[3 * a + b] ?? 0) - r)) / value
      gim[3 * a + b] = (2 * (norm * (im[3 * a + b] ?? 0) - m)) / value
    }
  }

  return { value, gre, gim }
}

// the pure-state concurrence of a normalized or unnormalized 9-vector, as p C(psi)
export function scaledConcurrence(v: CVec): number {
  return summand(v.re, v.im, false).value
}

type Isometry = { k: number; r: number; re: Float64Array; im: Float64Array }

function members(u: Isometry, basis: readonly CVec[]): CVec[] {
  return Array.from({ length: u.k }, (_, i) => {
    const re = new Float64Array(9)
    const im = new Float64Array(9)

    for (let j = 0; j < u.r; j++) {
      const ur = u.re[i * u.r + j] ?? 0
      const ui = u.im[i * u.r + j] ?? 0
      const v = basis[j]!

      for (let x = 0; x < 9; x++) {
        re[x] = (re[x] ?? 0) + ur * (v.re[x] ?? 0) - ui * (v.im[x] ?? 0)
        im[x] = (im[x] ?? 0) + ur * (v.im[x] ?? 0) + ui * (v.re[x] ?? 0)
      }
    }

    return { re, im }
  })
}

function objective(u: Isometry, basis: readonly CVec[]): number {
  return members(u, basis).reduce(
    (s, m) => s + summand(m.re, m.im, false).value,
    0,
  )
}

// Gram-Schmidt on the r columns of a K x r matrix
function orthonormalize(u: Isometry): Isometry {
  const { k, r } = u
  const re = Float64Array.from(u.re)
  const im = Float64Array.from(u.im)

  for (let c = 0; c < r; c++) {
    for (let p = 0; p < c; p++) {
      // <col p, col c> = sum conj(u_ip) u_ic
      let dr = 0
      let di = 0

      for (let i = 0; i < k; i++) {
        const a = re[i * r + p] ?? 0
        const b = im[i * r + p] ?? 0
        const x = re[i * r + c] ?? 0
        const y = im[i * r + c] ?? 0

        dr += a * x + b * y
        di += a * y - b * x
      }

      for (let i = 0; i < k; i++) {
        const a = re[i * r + p] ?? 0
        const b = im[i * r + p] ?? 0

        re[i * r + c] = (re[i * r + c] ?? 0) - (dr * a - di * b)
        im[i * r + c] = (im[i * r + c] ?? 0) - (dr * b + di * a)
      }
    }

    let norm = 0

    for (let i = 0; i < k; i++) {
      norm += (re[i * r + c] ?? 0) ** 2 + (im[i * r + c] ?? 0) ** 2
    }

    const s = 1 / Math.sqrt(norm)

    for (let i = 0; i < k; i++) {
      re[i * r + c] = (re[i * r + c] ?? 0) * s
      im[i * r + c] = (im[i * r + c] ?? 0) * s
    }
  }

  return { k, r, re, im }
}

// the Riemannian gradient of the objective at an isometry, embedded metric: G - U (U^dagger G + G^dagger U) / 2
function gradient(u: Isometry, basis: readonly CVec[]): Isometry {
  const { k, r } = u
  const gre = new Float64Array(k * r)
  const gim = new Float64Array(k * r)
  const ms = members(u, basis)

  ms.forEach((m, i) => {
    const s = summand(m.re, m.im, true)

    for (let j = 0; j < r; j++) {
      // <v_j | h_i> = sum conj(v_j) h_i
      const v = basis[j]!

      let dr = 0
      let di = 0

      for (let x = 0; x < 9; x++) {
        const a = v.re[x] ?? 0
        const b = v.im[x] ?? 0
        const c = s.gre[x] ?? 0
        const d = s.gim[x] ?? 0

        dr += a * c + b * d
        di += a * d - b * c
      }

      gre[i * r + j] = dr
      gim[i * r + j] = di
    }
  })

  // H = U^dagger G (r x r), sym = (H + H^dagger) / 2
  const hr = new Float64Array(r * r)
  const hi = new Float64Array(r * r)

  for (let a = 0; a < r; a++) {
    for (let b = 0; b < r; b++) {
      let sr = 0
      let si = 0

      for (let i = 0; i < k; i++) {
        const xr = u.re[i * r + a] ?? 0
        const xi = -(u.im[i * r + a] ?? 0)
        const yr = gre[i * r + b] ?? 0
        const yi = gim[i * r + b] ?? 0

        sr += xr * yr - xi * yi
        si += xr * yi + xi * yr
      }

      hr[a * r + b] = sr
      hi[a * r + b] = si
    }
  }

  const symR = new Float64Array(r * r)
  const symI = new Float64Array(r * r)

  for (let a = 0; a < r; a++) {
    for (let b = 0; b < r; b++) {
      symR[a * r + b] = ((hr[a * r + b] ?? 0) + (hr[b * r + a] ?? 0)) / 2
      symI[a * r + b] = ((hi[a * r + b] ?? 0) - (hi[b * r + a] ?? 0)) / 2
    }
  }

  const re = Float64Array.from(gre)
  const im = Float64Array.from(gim)

  for (let i = 0; i < k; i++) {
    for (let b = 0; b < r; b++) {
      let sr = 0
      let si = 0

      for (let a = 0; a < r; a++) {
        const xr = u.re[i * r + a] ?? 0
        const xi = u.im[i * r + a] ?? 0
        const yr = symR[a * r + b] ?? 0
        const yi = symI[a * r + b] ?? 0

        sr += xr * yr - xi * yi
        si += xr * yi + xi * yr
      }

      re[i * r + b] = (re[i * r + b] ?? 0) - sr
      im[i * r + b] = (im[i * r + b] ?? 0) - si
    }
  }

  return { k, r, re, im }
}

function descend(
  start: Isometry,
  basis: readonly CVec[],
  steps: number,
): { u: Isometry; value: number } {
  let u = orthonormalize(start)
  let value = objective(u, basis)
  let t = 0.5

  for (let s = 0; s < steps; s++) {
    const g = gradient(u, basis)

    let g2 = 0

    for (let x = 0; x < g.re.length; x++) {
      g2 += (g.re[x] ?? 0) ** 2 + (g.im[x] ?? 0) ** 2
    }

    if (g2 < 1e-26) {
      break
    }

    let moved = false

    for (let tries = 0; tries < 40; tries++) {
      const next = orthonormalize({
        k: u.k,
        r: u.r,
        re: u.re.map((x, i) => x - t * (g.re[i] ?? 0)),
        im: u.im.map((x, i) => x - t * (g.im[i] ?? 0)),
      })
      const v = objective(next, basis)

      if (v <= value - 1e-4 * t * g2) {
        u = next
        value = v
        moved = true
        t *= 2
        break
      }

      t /= 2
    }

    if (!moved) {
      break
    }
  }

  return { u, value }
}

export type RoofUpper = {
  upper: number
  eigenUpper: number
  rank: number
  members: number
  residual: number
  droppedMass: number
}

// the least sum_i g(psi~_i) found over decompositions of a two-qutrit density matrix, from the eigen
// decomposition and `starts` Weyl isometries, each descended `steps` steps
export function roofUpper(input: {
  rho: Operator
  starts: number
  steps: number
  seed: number
}): RoofUpper {
  const { rho, starts, steps, seed } = input
  const { values, vectors } = hermitianEigenvectors(rho)
  const basis: CVec[] = []

  let dropped = 0

  values.forEach((p, c) => {
    if (p > 1e-12) {
      const s = Math.sqrt(p)

      basis.push({
        re: Float64Array.from({ length: 9 }, (_, i) => (vectors.re[i * 9 + c] ?? 0) * s),
        im: Float64Array.from({ length: 9 }, (_, i) => (vectors.im[i * 9 + c] ?? 0) * s),
      })
    } else {
      dropped += Math.abs(p)
    }
  })

  const r = basis.length
  const k = r * r + 1
  const identity: Isometry = {
    k,
    r,
    re: Float64Array.from({ length: k * r }, (_, x) =>
      Math.floor(x / r) === x % r ? 1 : 0,
    ),
    im: new Float64Array(k * r),
  }
  const eigenUpper = objective(identity, basis)

  let best = { u: identity, value: eigenUpper }

  for (let s = 0; s <= starts; s++) {
    let start = identity

    if (s > 0) {
      const w = weylUnitary({ dimension: k, start: seed + s })

      start = {
        k,
        r,
        re: Float64Array.from({ length: k * r }, (_, x) => w.re[Math.floor(x / r)]?.[x % r] ?? 0),
        im: Float64Array.from({ length: k * r }, (_, x) => w.im[Math.floor(x / r)]?.[x % r] ?? 0),
      }
    }

    const found = descend(start, basis, steps)

    if (found.value < best.value) {
      best = found
    }
  }

  // the reconstruction residual of the returned decomposition against rho
  const ms = members(best.u, basis)

  let residual = 0

  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      let re = 0
      let im = 0

      for (const m of ms) {
        re += (m.re[i] ?? 0) * (m.re[j] ?? 0) + (m.im[i] ?? 0) * (m.im[j] ?? 0)
        im += (m.im[i] ?? 0) * (m.re[j] ?? 0) - (m.re[i] ?? 0) * (m.im[j] ?? 0)
      }

      residual = Math.max(
        residual,
        Math.hypot(re - (rho.re[i * 9 + j] ?? 0), im - (rho.im[i * 9 + j] ?? 0)),
      )
    }
  }

  return {
    upper: best.value,
    eigenUpper,
    rank: r,
    members: k,
    residual,
    droppedMass: dropped,
  }
}

// Mintert-Buchleitner: the larger of 2 Tr rho^2 - 2 Tr rho_A^2 and 2 Tr rho^2 - 2 Tr rho_B^2, a lower bound on C^2
export function roofLowerSquared(rho: Operator): number {
  let purity = 0

  for (let k = 0; k < 81; k++) {
    purity += (rho.re[k] ?? 0) ** 2 + (rho.im[k] ?? 0) ** 2
  }

  const reduced = (keepA: boolean): number => {
    let s = 0

    for (let a = 0; a < 3; a++) {
      for (let c = 0; c < 3; c++) {
        let r = 0
        let m = 0

        for (let b = 0; b < 3; b++) {
          const row = keepA ? 3 * a + b : 3 * b + a
          const col = keepA ? 3 * c + b : 3 * b + c

          r += rho.re[row * 9 + col] ?? 0
          m += rho.im[row * 9 + col] ?? 0
        }

        s += r * r + m * m
      }
    }

    return s
  }

  return Math.max(2 * purity - 2 * reduced(true), 2 * purity - 2 * reduced(false))
}
