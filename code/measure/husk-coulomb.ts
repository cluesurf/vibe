// The static field of a charge in the husk light, read exactly (E-FRC-0241 to 0243). Measurement only: real
// numbers live here; the rules read (code/rule/trit-column, trit-hop, pair-making-knit, flux-store-line,
// loop-ring) hold integers.
//
// THE OPERATOR. The husk light's static operator is the weighted husk Laplacian with symbol
//   eps(k) = sum_h g_h 2 (1 - cos k . u_h),   g = 2 on the 3 axes, 1 on the 6 face diagonals
// (E-FRC-0179's husk symbol, E-FRC-0212's Green's function). It is EXACTLY the bulk D4 root Laplacian's
// k4 = 0 block: sum over the 24 roots of (1 - cos k . rho) at k4 = 0 counts each axis twice (e_i + e4 and
// e_i - e4 cast it) and each face diagonal once. Its Taylor series, from 2 (1 - cos x) = x^2 - x^4 / 12 +
// x^6 / 360 - ...:
//   sum_h g_h (k . u_h)^2 = 6 k^2,   sum_h g_h (k . u_h)^4 = 6 (k^2)^2   (both EXACT polynomial identities),
//   sum_h g_h (k . u_h)^6 = 30 p4 p2 - 24 p6,   p_n = sum_i k_i^n
// so eps = 6 k^2 - k^4 / 2 + (30 p4 p2 - 24 p6) / 360 + O(k^8). The quartic is ISOTROPIC. The simple cubic
// Laplacian's is not (its quartic is -p4 / 12), which is why its Green's function carries a cubic 1/r^3 term.
//
// THE GREEN'S FUNCTION (eps G = delta on the infinite husk). Its large-r expansion comes only from the non-
// analytic, anisotropic parts of 1/eps (an analytic term is a point term at r = 0; an isotropic k^(2n) over
// k^0 is analytic). 1/eps = 1/(6 k^2) + k^2 / 864 - (30 p4 p2 - 24 p6) / (12960 k^4) + (degree 4), and on the
// unit sphere p4 = 3/5 + K4 and p6 = 3/7 + (15/11) K4 + K6 with K4, K6 the cubic harmonics of degree 4 and 6
// (exact sphere moments: <K4^2> = 16/525, <p6 K4> - (3/7)(3/5) = 16/385). The 3D transform of
// k^2 Y_l(k-hat) is i^l Y_l(r-hat) 2^(mu - 1) Gamma((l + mu + 1)/2) / (2 pi^(3/2) Gamma((l - mu)/2 + 1)) r^-5
// with mu = 4: 105 / (4 pi) for l = 4 and -945 / (8 pi) for l = 6. So
//   G(r) = 1 / (24 pi r) + A(r-hat) / r^5 + O(r^-7),   A = [ (35/6336) K4 - (7/32) K6 ] / pi
//   A(axis) = -1 / (288 pi),   A(face diagonal) = 5 / (576 pi),   A(body diagonal) = -5 / (432 pi)
// THE HUSK'S COULOMB LAW HAS NO 1/r^3 CORRECTION: the lattice first shows at r^-5. The same method gives the
// simple cubic lattice's known tail (5 / (32 pi)) K4 / r^3 (axis 1 / (16 pi), face -1 / (64 pi), body
// -1 / (24 pi)), the control.
//
// THE COEFFICIENT. A +1, -1 pair holds the longitudinal energy (phase per beat per unit of 1/2 E^2 / g) x
// (G(0) - G(r)) -> const - 1 / (24 pi r) x that phase. In the trit light's own units (E-FRC-0212) the phase is
// pi / D: C = 1 / (24 D). In the quantum light's units (the Weyl pair of a column of N = 2D + 1 values, the
// plaquette ladder's drift zeta_M^(-c e^2), E-FRC-0230) the phase is pi s / N per unit of e^2, s the drift's
// share of kappa = s f: C = s / (12 N) = s kappa / 24. See split-coulomb-coupling for the split.

import {
  bulkFlux,
  columnSumLinks,
  placeTritPair,
  TRIT_HUSK_VECTORS,
  type TritLight,
  type TritState,
} from '@/code/rule/trit-column'
import { geometryOfBulk } from '@/code/rule/trit-husk'
import { coulombFlux, G_METRIC } from '@/code/measure/trit-hop-light'

// ---------------------------------------------------------------------------------------------------------
// symbols

const HUSK_G = [2, 2, 2, 1, 1, 1, 1, 1, 1]

export type SymbolKind = 'husk' | 'cubic'

// eps(k) of the husk (weighted, 9 directions) or of the simple cubic lattice (3 axes, weight 1)
export function symbolAt(
  kind: SymbolKind,
  k: readonly number[],
): number {
  const [a = 0, b = 0, c = 0] = k

  if (kind === 'cubic') {
    return 2 * (3 - Math.cos(a) - Math.cos(b) - Math.cos(c))
  }

  let s = 0

  for (let h = 0; h < 9; h++) {
    const u = TRIT_HUSK_VECTORS[h] ?? []

    s +=
      (HUSK_G[h] ?? 1) *
      2 *
      (1 -
        Math.cos(a * (u[0] ?? 0) + b * (u[1] ?? 0) + c * (u[2] ?? 0)))
  }

  return s
}

// the series through k^6: 6 k^2 - k^4 / 2 + (30 p4 p2 - 24 p6) / 360 (husk), k^2 - p4 / 12 + p6 / 360 (cubic)
export function symbolSeries(
  kind: SymbolKind,
  k: readonly number[],
): number {
  const p2 = k.reduce((s, x) => s + x * x, 0)
  const p4 = k.reduce((s, x) => s + x ** 4, 0)
  const p6 = k.reduce((s, x) => s + x ** 6, 0)

  return kind === 'husk'
    ? 6 * p2 - (p2 * p2) / 2 + (30 * p4 * p2 - 24 * p6) / 360
    : p2 - p4 / 12 + p6 / 360
}

// the moment identities, in integers, over every integer vector k in [-range, range]^3: counts of vectors where
// sum g (k . u)^n differs from the claimed polynomial, n = 2, 4, 6
export function momentIdentityFailures(
  kind: SymbolKind,
  range: number,
): {
  quadratic: number
  quartic: number
  sextic: number
  checked: number
} {
  const vectors =
    kind === 'husk'
      ? TRIT_HUSK_VECTORS
      : [
          [1, 0, 0],
          [0, 1, 0],
          [0, 0, 1],
        ]
  const weights = kind === 'husk' ? HUSK_G : [1, 1, 1]
  const out = { quadratic: 0, quartic: 0, sextic: 0, checked: 0 }

  for (let a = -range; a <= range; a++) {
    for (let b = -range; b <= range; b++) {
      for (let c = -range; c <= range; c++) {
        const k = [a, b, c]
        const p2 = a * a + b * b + c * c
        const p4 = a ** 4 + b ** 4 + c ** 4
        const p6 = a ** 6 + b ** 6 + c ** 6

        let m2 = 0
        let m4 = 0
        let m6 = 0

        vectors.forEach((u, h) => {
          const d =
            k[0]! * (u[0] ?? 0) +
            k[1]! * (u[1] ?? 0) +
            k[2]! * (u[2] ?? 0)
          const w = weights[h] ?? 1

          m2 += w * d * d
          m4 += w * d ** 4
          m6 += w * d ** 6
        })

        // husk: 6 p2, 6 p2^2 (isotropic), 30 p4 p2 - 24 p6; cubic: p2, p4, p6
        const [e2, e4, e6] =
          kind === 'husk'
            ? [6 * p2, 6 * p2 * p2, 30 * p4 * p2 - 24 * p6]
            : [p2, p4, p6]

        out.quadratic += m2 === e2 ? 0 : 1
        out.quartic += m4 === e4 ? 0 : 1
        out.sextic += m6 === e6 ? 0 : 1
        out.checked++
      }
    }
  }

  return out
}

// ---------------------------------------------------------------------------------------------------------
// the closed-form tails

// the cubic harmonics on a direction (normalized inside)
export function cubicHarmonics(r: readonly number[]): {
  k4: number
  k6: number
} {
  const n2 = r.reduce((s, x) => s + x * x, 0)
  const p4 = r.reduce((s, x) => s + x ** 4, 0) / n2 ** 2
  const p6 = r.reduce((s, x) => s + x ** 6, 0) / n2 ** 3
  const k4 = p4 - 3 / 5

  return { k4, k6: p6 - 3 / 7 - (15 / 11) * k4 }
}

// the leading tail coefficient: husk A (of r^-5), cubic A (of r^-3)
export function tailCoefficient(
  kind: SymbolKind,
  r: readonly number[],
): number {
  const { k4, k6 } = cubicHarmonics(r)

  return kind === 'husk'
    ? ((35 / 6336) * k4 - (7 / 32) * k6) / Math.PI
    : ((5 / 32) * k4) / Math.PI
}

// the continuum coefficient of 1/r in G: 1 / (4 pi a), eps = a k^2 + ...
export const continuumCoefficient = (kind: SymbolKind): number =>
  1 / (4 * Math.PI * (kind === 'husk' ? 6 : 1))

// the leading power of the tail
export const tailPower = (kind: SymbolKind): number =>
  kind === 'husk' ? 5 : 3

// ---------------------------------------------------------------------------------------------------------
// the Green's function on a torus of side L, summed exactly over the modes: V_L(r) = G_L(0) - G_L(r) =
// (1/V) sum_(k != 0) (1 - cos k . r) / eps(k), for every r in a list at once. cos(k . r) comes from per-axis
// cosine and sine tables, so nothing large is stored

export function torusGreenDifferences(
  kind: SymbolKind,
  side: number,
  points: readonly (readonly number[])[],
): Float64Array {
  const step = (2 * Math.PI) / side

  let reach = 1

  for (const p of points) {
    for (const x of p) {
      reach = Math.max(reach, Math.abs(x))
    }
  }

  const span = 2 * reach + 1
  // cos and sin of m * n * step, for mode index m and offset n in [-reach, reach]
  const ct = new Float64Array(side * span)
  const st = new Float64Array(side * span)

  for (let m = 0; m < side; m++) {
    for (let n = -reach; n <= reach; n++) {
      ct[m * span + n + reach] = Math.cos(step * m * n)
      st[m * span + n + reach] = Math.sin(step * m * n)
    }
  }

  const P = points.length
  const offA = Int32Array.from(points, p => (p[0] ?? 0) + reach)
  const offB = Int32Array.from(points, p => (p[1] ?? 0) + reach)
  const offC = Int32Array.from(points, p => (p[2] ?? 0) + reach)
  const sums = new Float64Array(P)
  // Kahan compensation per point: 1.7e7 terms at side 256
  const carry = new Float64Array(P)
  const cosm = Float64Array.from({ length: side }, (_, m) =>
    Math.cos(step * m),
  )
  // cos(k_i + k_j) and cos(k_i - k_j) from the single-axis tables
  const cosPlus = (i: number, j: number): number =>
    Math.cos(step * (i + j))
  const plus = new Float64Array(side * side)
  const minus = new Float64Array(side * side)

  for (let i = 0; i < side; i++) {
    for (let j = 0; j < side; j++) {
      plus[i * side + j] = cosPlus(i, j)
      minus[i * side + j] = Math.cos(step * (i - j))
    }
  }

  for (let c = 0; c < side; c++) {
    for (let b = 0; b < side; b++) {
      for (let a = 0; a < side; a++) {
        if (a === 0 && b === 0 && c === 0) {
          continue
        }

        let eps: number

        if (kind === 'cubic') {
          eps = 2 * (3 - cosm[a]! - cosm[b]! - cosm[c]!)
        } else {
          eps =
            4 * (3 - cosm[a]! - cosm[b]! - cosm[c]!) +
            2 *
              (6 -
                plus[a * side + b]! -
                minus[a * side + b]! -
                plus[a * side + c]! -
                minus[a * side + c]! -
                plus[b * side + c]! -
                minus[b * side + c]!)
        }

        const inv = 1 / eps
        const ba = a * span
        const bb = b * span
        const bc = c * span

        for (let p = 0; p < P; p++) {
          const ca = ct[ba + offA[p]!]!
          const sa = st[ba + offA[p]!]!
          const cb = ct[bb + offB[p]!]!
          const sb = st[bb + offB[p]!]!
          const cc = ct[bc + offC[p]!]!
          const sc = st[bc + offC[p]!]!
          // cos(x + y + z)
          const cxy = ca * cb - sa * sb
          const sxy = sa * cb + ca * sb

          const y = (1 - (cxy * cc - sxy * sc)) * inv - carry[p]!
          const t = sums[p]! + y

          carry[p] = t - sums[p]! - y
          sums[p] = t
        }
      }
    }
  }

  const volume = side ** 3

  return Float64Array.from(sums, v => v / volume)
}

// the infinite-lattice V(r) = G(0) - G(r) from two tori: each torus value plus its uniform-background term
// r^2 / (6 a V) (eps = a k^2 + ...), then Richardson on the image term, which falls as L^-5 (the first cubic
// image multipole r^4 K4 / L^5): V = (2^5 V_2L - V_L) / 31
export function infiniteGreenDifferences(
  kind: SymbolKind,
  side: number,
  points: readonly (readonly number[])[],
): { value: Float64Array; small: Float64Array; large: Float64Array } {
  const a = kind === 'husk' ? 6 : 1
  const background = (L: number, p: readonly number[]): number =>
    p.reduce((s, x) => s + x * x, 0) / (6 * a * L ** 3)
  const vs = torusGreenDifferences(kind, side, points)
  const vl = torusGreenDifferences(kind, 2 * side, points)
  const small = Float64Array.from(
    vs,
    (v, i) => v + background(side, points[i]!),
  )
  const large = Float64Array.from(
    vl,
    (v, i) => v + background(2 * side, points[i]!),
  )

  return {
    value: Float64Array.from(
      large,
      (v, i) => (32 * v - small[i]!) / 31,
    ),
    small,
    large,
  }
}

// the same from three tori L, 2L, 4L: Richardson removing both the L^-5 and the L^-7 image terms (weights with
// sum 1 annihilating L^-5 and L^-7). Returns the estimate and its change from the two-torus estimate
export function infiniteGreenThree(
  kind: SymbolKind,
  side: number,
  points: readonly (readonly number[])[],
): { value: Float64Array; twoTorus: Float64Array; change: number } {
  const a = kind === 'husk' ? 6 : 1
  const background = (L: number, p: readonly number[]): number =>
    p.reduce((s, x) => s + x * x, 0) / (6 * a * L ** 3)
  const sides = [side, 2 * side, 4 * side]
  const vals = sides.map(L =>
    Float64Array.from(
      torusGreenDifferences(kind, L, points),
      (v, i) => v + background(L, points[i]!),
    ),
  )
  // solve w1 + w2 + w3 = 1, sum w L^-5 = 0, sum w L^-7 = 0 (in units of side)
  const x = [1, 2, 4]
  const m = [x.map(() => 1), x.map(v => v ** -5), x.map(v => v ** -7)]
  const rhs = [1, 0, 0]
  // Cramer's rule, 3 x 3
  const det = (q: number[][]): number =>
    q[0]![0]! * (q[1]![1]! * q[2]![2]! - q[1]![2]! * q[2]![1]!) -
    q[0]![1]! * (q[1]![0]! * q[2]![2]! - q[1]![2]! * q[2]![0]!) +
    q[0]![2]! * (q[1]![0]! * q[2]![1]! - q[1]![1]! * q[2]![0]!)
  const d = det(m)
  const w = [0, 1, 2].map(
    j =>
      det(
        m.map((row, i) => row.map((v, k) => (k === j ? rhs[i]! : v))),
      ) / d,
  )
  const value = Float64Array.from(
    vals[0]!,
    (_, i) =>
      w[0]! * vals[0]![i]! +
      w[1]! * vals[1]![i]! +
      w[2]! * vals[2]![i]!,
  )
  const twoTorus = Float64Array.from(
    vals[2]!,
    (v, i) => (32 * v - vals[1]![i]!) / 31,
  )

  let change = 0

  for (let i = 0; i < value.length; i++) {
    change = Math.max(change, Math.abs(value[i]! - twoTorus[i]!))
  }

  return { value, twoTorus, change }
}

// ---------------------------------------------------------------------------------------------------------
// G(0) of the infinite lattice, from torus sums G_L(0) = (1/V) sum_(k != 0) 1 / eps(k). The zero mode's removal
// and the images leave G_L(0) = G0 - xi / (4 pi a L) + O(L^-3), xi = 2.837297479480619 the simple cubic image
// constant (the regularized sum of 1/|n| over Z^3 with its neutralizing background); a is eps's k^2 coefficient.
// The L^-3 is the images of a lattice 1/r^3 tail (the cubic control has one; the husk should not). Each torus
// value is corrected by xi / (4 pi a L), then Richardson removes L^-3 and L^-5 over L, 2L, 4L
export const CUBIC_IMAGE_CONSTANT = 2.837297479480619

export function torusGreenZero(kind: SymbolKind, side: number): number {
  const step = (2 * Math.PI) / side
  const cosm = Float64Array.from({ length: side }, (_, m) =>
    Math.cos(step * m),
  )

  let sum = 0
  let carry = 0

  for (let c = 0; c < side; c++) {
    for (let b = 0; b < side; b++) {
      for (let a = 0; a < side; a++) {
        if (a === 0 && b === 0 && c === 0) {
          continue
        }

        const eps =
          kind === 'cubic'
            ? 2 * (3 - cosm[a]! - cosm[b]! - cosm[c]!)
            : 4 * (3 - cosm[a]! - cosm[b]! - cosm[c]!) +
              2 *
                (6 -
                  2 * cosm[a]! * cosm[b]! -
                  2 * cosm[a]! * cosm[c]! -
                  2 * cosm[b]! * cosm[c]!)
        const y = 1 / eps - carry
        const t = sum + y

        carry = t - sum - y
        sum = t
      }
    }
  }

  return sum / side ** 3
}

export function infiniteGreenZero(
  kind: SymbolKind,
  side: number,
): { value: number; perSide: number[] } {
  const a = kind === 'husk' ? 6 : 1
  const sides = [side, 2 * side, 4 * side]
  const corrected = sides.map(
    L =>
      torusGreenZero(kind, L) +
      CUBIC_IMAGE_CONSTANT / (4 * Math.PI * a * L),
  )
  // weights with sum 1 annihilating L^-3 and L^-5 at L, 2L, 4L
  const x = [1, 2, 4]
  const m = [x.map(() => 1), x.map(v => v ** -3), x.map(v => v ** -5)]
  const det = (q: number[][]): number =>
    q[0]![0]! * (q[1]![1]! * q[2]![2]! - q[1]![2]! * q[2]![1]!) -
    q[0]![1]! * (q[1]![0]! * q[2]![2]! - q[1]![2]! * q[2]![0]!) +
    q[0]![2]! * (q[1]![0]! * q[2]![1]! - q[1]![1]! * q[2]![0]!)
  const d = det(m)
  const w = [0, 1, 2].map(
    j =>
      det(
        m.map((row, i) =>
          row.map((v, k) => (k === j ? [1, 0, 0][i]! : v)),
        ),
      ) / d,
  )

  return {
    value: w.reduce((s, wj, j) => s + wj * corrected[j]!, 0),
    perSide: corrected,
  }
}

// the leading tail from the last three radii of a direction: s(r) = (G(r) - c / r) r^p = A + B r^-2 + C r^-4,
// solved exactly through the three points (Richardson in r)
export function richardsonTail(
  rs: readonly number[],
  scaled: readonly number[],
): number {
  const n = rs.length
  const r = [rs[n - 3]!, rs[n - 2]!, rs[n - 1]!]
  const y = [scaled[n - 3]!, scaled[n - 2]!, scaled[n - 1]!]
  const m = r.map(v => [1, v ** -2, v ** -4])
  const det = (q: number[][]): number =>
    q[0]![0]! * (q[1]![1]! * q[2]![2]! - q[1]![2]! * q[2]![1]!) -
    q[0]![1]! * (q[1]![0]! * q[2]![2]! - q[1]![2]! * q[2]![0]!) +
    q[0]![2]! * (q[1]![0]! * q[2]![1]! - q[1]![1]! * q[2]![0]!)

  return det(m.map((row, i) => [y[i]!, row[1]!, row[2]!])) / det(m)
}

// ---------------------------------------------------------------------------------------------------------
// a joint fit over several directions sharing one constant G0: group g's data y ~ G0 + sum_j c_(g,j) r^(-q_j).
// Returns G0 and each group's coefficients. The shared constant is what conditions a slowly converging
// direction (the axis) by the fast ones
export function fitJoint(
  groups: readonly { rs: readonly number[]; ys: readonly number[] }[],
  powers: readonly number[],
): { g0: number; coefs: number[][] } {
  const q = powers.length
  const m = 1 + groups.length * q
  const rows: number[][] = []
  const ys: number[] = []

  groups.forEach((g, gi) => {
    g.rs.forEach((r, i) => {
      const row = new Array<number>(m).fill(0)

      row[0] = 1
      powers.forEach((p, j) => {
        row[1 + gi * q + j] = r ** -p
      })
      rows.push(row)
      ys.push(g.ys[i]!)
    })
  })

  const scale = Array.from(
    { length: m },
    (_, j) => Math.max(...rows.map(r => Math.abs(r[j]!))) || 1,
  )
  const ata = Array.from({ length: m }, () =>
    new Array<number>(m).fill(0),
  )
  const atb = new Array<number>(m).fill(0)

  rows.forEach((r, i) => {
    for (let j = 0; j < m; j++) {
      const rj = r[j]! / scale[j]!

      atb[j] = atb[j]! + rj * ys[i]!

      for (let k = 0; k < m; k++) {
        ata[j]![k] = ata[j]![k]! + rj * (r[k]! / scale[k]!)
      }
    }
  })

  for (let j = 0; j < m; j++) {
    let pivot = j

    for (let i = j + 1; i < m; i++) {
      if (Math.abs(ata[i]![j]!) > Math.abs(ata[pivot]![j]!)) {
        pivot = i
      }
    }

    ;[ata[j], ata[pivot]] = [ata[pivot]!, ata[j]!]
    ;[atb[j], atb[pivot]] = [atb[pivot]!, atb[j]!]

    for (let i = j + 1; i < m; i++) {
      const f = ata[i]![j]! / ata[j]![j]!

      for (let k = j; k < m; k++) {
        ata[i]![k] = ata[i]![k]! - f * ata[j]![k]!
      }

      atb[i] = atb[i]! - f * atb[j]!
    }
  }

  const x = new Array<number>(m).fill(0)

  for (let j = m - 1; j >= 0; j--) {
    let s = atb[j]!

    for (let k = j + 1; k < m; k++) {
      s -= ata[j]![k]! * x[k]!
    }

    x[j] = s / ata[j]![j]!
  }

  const out = x.map((v, j) => v / scale[j]!)

  return {
    g0: out[0]!,
    coefs: groups.map((_, gi) =>
      out.slice(1 + gi * q, 1 + (gi + 1) * q),
    ),
  }
}

// ---------------------------------------------------------------------------------------------------------
// least squares for a few powers: y ~ c0 + sum_j c_j r^(-q_j), solved by normal equations in doubles (a
// handful of unknowns, well scaled by dividing each column by its largest entry)
export function fitPowers(
  rs: readonly number[],
  ys: readonly number[],
  powers: readonly number[],
): number[] {
  const m = powers.length + 1
  const cols = rs.map(r => [1, ...powers.map(q => r ** -q)])
  const scale = Array.from({ length: m }, (_, j) =>
    Math.max(...cols.map(c => Math.abs(c[j]!))),
  )
  const ata = Array.from({ length: m }, () =>
    new Array<number>(m).fill(0),
  )
  const atb = new Array<number>(m).fill(0)

  cols.forEach((c, i) => {
    for (let j = 0; j < m; j++) {
      const cj = c[j]! / scale[j]!

      atb[j] = atb[j]! + cj * ys[i]!

      for (let k = 0; k < m; k++) {
        ata[j]![k] = ata[j]![k]! + cj * (c[k]! / scale[k]!)
      }
    }
  })

  // Gaussian elimination with partial pivoting
  for (let j = 0; j < m; j++) {
    let pivot = j

    for (let i = j + 1; i < m; i++) {
      if (Math.abs(ata[i]![j]!) > Math.abs(ata[pivot]![j]!)) {
        pivot = i
      }
    }

    ;[ata[j], ata[pivot]] = [ata[pivot]!, ata[j]!]
    ;[atb[j], atb[pivot]] = [atb[pivot]!, atb[j]!]

    for (let i = j + 1; i < m; i++) {
      const f = ata[i]![j]! / ata[j]![j]!

      for (let k = j; k < m; k++) {
        ata[i]![k] = ata[i]![k]! - f * ata[j]![k]!
      }

      atb[i] = atb[i]! - f * atb[j]!
    }
  }

  const x = new Array<number>(m).fill(0)

  for (let j = m - 1; j >= 0; j--) {
    let s = atb[j]!

    for (let k = j + 1; k < m; k++) {
      s -= ata[j]![k]! * x[k]!
    }

    x[j] = s / ata[j]![j]!
  }

  return x.map((v, j) => v / scale[j]!)
}

// ---------------------------------------------------------------------------------------------------------
// static charges on the trit rule itself (bulk trits, code/rule/trit-column): place, run, read

// the bulk dock of a husk column (a, b, c) at a level of its depth column
export function dockOfColumn(
  light: TritLight,
  column: readonly number[],
  level: number,
): number {
  const L = light.bulk.side
  const m = (v: number): number => ((v % L) + L) % L

  return (
    (m(column[0] ?? 0) +
      L * m(column[1] ?? 0) +
      L * L * m(column[2] ?? 0)) *
      light.bulk.depth +
    level
  )
}

// a +1 at `from` and -1 at the end of a path of first-root steps (0 e1+e4, 1 e1-e4, 2 e2+e4, 3 e2-e4, 4 e3+e4,
// 5 e3-e4), joined by string trits: the path moves `dx`, `dy`, `dz` husk steps forward, the depth sign chosen
// at each step so x4 stays in {0, 1}: every dock on the path is level 0 of its column. `from` must be a level-0
// dock. Returns the far dock
export function placeStrung(
  light: TritLight,
  state: TritState,
  from: number,
  moves: readonly [number, number, number],
  sign: number,
): number {
  const L = light.bulk.side
  const y = Math.floor(from / light.bulk.depth)

  let parity =
    ((y % L) + (Math.floor(y / L) % L) + Math.floor(y / (L * L))) % 2

  const steps: number[] = []

  moves.forEach((count, axis) => {
    for (let i = 0; i < count; i++) {
      // x4 = parity: an even column holds x4 = 0 (step +e4 to 1), an odd one x4 = 1 (step -e4 to 0)
      steps.push(2 * axis + parity)
      parity = 1 - parity
    }
  })

  return placeTritPair(light, state, from, steps, sign)
}

// the longitudinal (Coulomb) energy of the rule's own flux, in the trit light's units (pi / D) 1/2 sum E^2 / g,
// with the charge read off the flux's divergence (E-FRC-0212's reading); and the total field energy beside it
export function longitudinalEnergy(
  light: TritLight,
  state: TritState,
): { longitudinal: number; total: number; charge: Float64Array } {
  const g = geometryOfBulk(light.bulk)
  const e = columnSumLinks(light, bulkFlux(light, state))
  const rho = new Float64Array(g.huskDocks)

  for (let l = 0; l < g.huskLinks; l++) {
    const y = Math.floor(l / 9)
    const z = g.huskNeighbour[l] ?? 0

    rho[y] = (rho[y] ?? 0) + (e[l] ?? 0)
    rho[z] = (rho[z] ?? 0) - (e[l] ?? 0)
  }

  const el = coulombFlux(g, rho)

  let lon = 0
  let total = 0

  for (let l = 0; l < g.huskLinks; l++) {
    lon += (el[l] ?? 0) ** 2 / (2 * (G_METRIC[l % 9] ?? 1))
    total += (e[l] ?? 0) ** 2 / (2 * (G_METRIC[l % 9] ?? 1))
  }

  const scale = Math.PI / light.bulk.depth

  return {
    longitudinal: scale * lon,
    total: scale * total,
    charge: rho,
  }
}
