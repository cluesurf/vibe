// The numbers nature fixes, read against the model: what sets the U(1) coupling of the link sector, and how a
// candidate value for alpha or m_p / m_e is judged (E-MTH-0020 to E-MTH-0023).
//
// Three tools.
//
// 1. THE COLUMN GREEN'S FUNCTION. The link sector (code/rule/photon-links, E-FRC-0164) stores the flux E on
//    the D4 links with energy (a / 2) sum E^2, a = 2 pi / N, in units where the angle theta = 2 pi A / N and
//    the integer flux are a conjugate pair (hbar = 1 per beat). Gauss's law makes the static field of point
//    vibes the gradient of phi with L phi = q, L the graph Laplacian of D4 (24 roots), so a +1, -1 pair at
//    separation x costs U(x) = a (G(0) - G(x)). On a D4 torus with husk period P along x1, x2, x3 and depth
//    period 2 D along x4, each husk dock is a column of D bulk docks (code/measure/photon-husk). G is summed
//    over the torus's modes: the dual grid k = 2 pi (n1 / P, n2 / P, n3 / P, n4 / 2D) covers every mode twice
//    (D4 has index 2 in Z^4), and the symbol is lambda(k) = sum over roots (1 - cos e.k) = 24 - 4 sum_{i<j}
//    cos k_i cos k_j, zero at k = 0 and k = pi (1, 1, 1, 1). So
//       G(x) - G(0) = (1 / M) sum over the grid with lambda > 0 of (cos k.x - 1) / lambda(k),  M = 2 D P^3.
//    Past the column (r >> D) a column-constant field sees the husk Laplacian, whose symbol is 6 k^2 (the 24
//    roots' shadows have second moment 12 I), so G(r) -> 1 / (24 pi D r): THE HUSK COUPLING IS THE BULK
//    COUPLING DIVIDED BY THE COLUMN DEPTH. The torus adds r^2 / (36 D P^3) (the neutralizing background),
//    which is subtracted.
//
// 2. THE D4 PLAQUETTE NORMALIZATION. Every triangle of D4 through a dock is a pair of roots a, b with
//    a . b = 1 (96 per dock, 32 triangles each counted from its 3 corners). A smooth field F gives the
//    triangle the flux F(a, b) / 2, so per dock (1/3) sum over the 96 of (F(a, b) / 2)^2 = gamma_2 sum_{mu<nu}
//    F_{mu nu}^2 with gamma_2 = 4 (checked, isotropic on all of Lambda^2). A dock has volume 2, so a Wilson
//    weight exp(-beta sum (1 - cos B)) is the continuum exp(-(1 / 2 e^2) integral sum F^2) with 1 / e^2 =
//    2 beta: alpha = e^2 / 4 pi = 1 / (8 pi beta) on D4, against 1 / (4 pi beta) on the hypercubic lattice.
//
// 3. THE JUDGE. A candidate value v for a target t (known to delta) with its own uncertainty u is IDENTIFIED
//    only if (a) |v - t| <= 3 sqrt(delta^2 + u^2), a match at the precision both are known to, or (b) it
//    carries a real uncertainty, |v - t| <= 2 u, and at the tolerance max(|v - t|, u) both null rates are
//    under 0.01: the E-MTH-0010 budget null (the share of golden-Weyl numbers near t that some budget form
//    reaches) and the named-form chance times the number of candidates registered for that target
//    (look-elsewhere, Bonferroni). An exact number (u = 0) can only pass by (a). Everything else is REFUSED.
//
// Deterministic throughout: the null points are the golden Weyl sequence of code/measure/integer-relation.

import { namedFormChance, nullMatchRate, relationHits } from '@/code/measure/integer-relation'
import { rootsD4 } from '@/code/algebra/group/root-system'

// CODATA 2022
export const INVERSE_ALPHA = 137.035999177
export const INVERSE_ALPHA_DELTA = 2.1e-8
export const PROTON_ELECTRON = 1836.152673426
export const PROTON_ELECTRON_DELTA = 3.2e-8

// the warp factor, the Perron root of lambda^3 - 21 lambda^2 + 51 lambda - 23 (E-MTH-0007)
export function warpFactor(): number {
  let x = 18.3

  for (let i = 0; i < 60; i++) {
    x -= (x ** 3 - 21 * x ** 2 + 51 * x - 23) / (3 * x ** 2 - 42 * x + 51)
  }

  return x
}

// the pair energy per unit a, G(0) - G(r e1), for each separation r (even, so r e1 is a D4 dock) on the D4
// torus with husk period p and depth period 2 depth; with the torus background r^2 / (36 depth p^3) removed
export function columnPairEnergy(input: { p: number; depth: number; separations: readonly number[] }): number[] {
  const { p, depth, separations } = input
  const q = 2 * depth
  const axis = Float64Array.from({ length: p }, (_, n) => Math.cos((2 * Math.PI * n) / p))
  const deep = Float64Array.from({ length: q }, (_, n) => Math.cos((2 * Math.PI * n) / q))
  const along = separations.map(r => Float64Array.from({ length: p }, (_, n) => 1 - Math.cos((2 * Math.PI * n * r) / p)))
  const sums = new Float64Array(separations.length)

  for (let n1 = 0; n1 < p; n1++) {
    const c1 = axis[n1] ?? 0

    for (let n2 = 0; n2 < p; n2++) {
      const c2 = axis[n2] ?? 0

      for (let n3 = 0; n3 < p; n3++) {
        const c3 = axis[n3] ?? 0
        const pairs123 = c1 * c2 + c1 * c3 + c2 * c3

        for (let n4 = 0; n4 < q; n4++) {
          const c4 = deep[n4] ?? 0
          const lambda = 24 - 4 * (pairs123 + c4 * (c1 + c2 + c3))

          if (lambda < 1e-12) {
            continue
          }

          for (let s = 0; s < separations.length; s++) {
            sums[s] = (sums[s] ?? 0) + (along[s]?.[n1] ?? 0) / lambda
          }
        }
      }
    }
  }

  const m = q * p ** 3

  return separations.map((r, s) => (sums[s] ?? 0) / m + (r * r) / (36 * depth * p ** 3))
}

// the quadratic form (1/3) sum over the 96 root pairs a . b = 1 of (F(a, b) / 2)^2 on Lambda^2, as a 6 x 6
// matrix in the basis (12, 13, 14, 23, 24, 34)
export function d4PlaquetteForm(): number[][] {
  const roots = rootsD4()
  const index: [number, number][] = [
    [0, 1],
    [0, 2],
    [0, 3],
    [1, 2],
    [1, 3],
    [2, 3],
  ]
  const form = index.map(() => index.map(() => 0))
  let pairs = 0

  for (let i = 0; i < roots.length; i++) {
    for (let j = i + 1; j < roots.length; j++) {
      const a = roots[i]!
      const b = roots[j]!

      if (a.reduce((s, x, k) => s + x * b[k]!, 0) !== 1) {
        continue
      }

      pairs++

      const wedge = index.map(([m, n]) => a[m]! * b[n]! - a[n]! * b[m]!)

      for (let u = 0; u < 6; u++) {
        for (let v = 0; v < 6; v++) {
          form[u]![v]! += (wedge[u]! * wedge[v]!) / 12
        }
      }
    }
  }

  return pairs === 96 ? form : []
}

export type Judged = {
  readonly value: number
  readonly deviation: number
  readonly relative: number
  readonly exact: boolean
  readonly budgetNull: number
  readonly namedNull: number
  readonly identified: boolean
}

export const NULL_SAMPLES = 5000

export function judge(input: { value: number; uncertainty: number; target: number; delta: number; trials: number }): Judged {
  const { value, uncertainty, target, delta, trials } = input
  const deviation = value - target
  const tolerance = Math.max(Math.abs(deviation), uncertainty)
  const exact = Math.abs(deviation) <= 3 * Math.hypot(delta, uncertainty)
  const budgetNull = tolerance >= 0.1 * Math.abs(target) ? 1 : nullMatchRate(target, tolerance, NULL_SAMPLES)
  const namedNull = Math.min(1, trials * namedFormChance(target, tolerance))
  const loose = uncertainty > 0 && Math.abs(deviation) <= 2 * uncertainty && budgetNull < 0.01 && namedNull < 0.01

  return { value, deviation, relative: deviation / target, exact, budgetNull, namedNull, identified: exact || loose }
}

// how many budget forms reach the target at its own precision (the budget is not trivially full there)
export function targetBudgetHits(target: number, delta: number): number {
  return relationHits(target, delta).length
}
