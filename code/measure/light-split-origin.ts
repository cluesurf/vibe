// Measurement for E-FRC-0261: where the husk light's drift/force split comes from, whether one exact speed and
// the balanced split can hold together, how close the balance comes to one speed as the register grows, and the
// coupling alpha at each split. Every existence claim is decided in integers (BigInt where it can grow); floats
// are measurement only.
//
//   the split          rho = f / s, the force's share over the drift's, of kappa = s f (the classical light
//                      fixes only kappa, E-FRC-0207). E-FRC-0234's virial theorem, s sum<e^2> = f sum<B^2> over
//                      a stationary state, makes the average link column and the average plaquette column fill
//                      alike exactly when rho = (link columns) / (plaquette columns): the balance
//   one speed          c_L^2 = 2 kappa / 3 = 1/8 on the husk in D4 coordinates (E-FRC-0260), kappa = 3/16
//   the loop light     kappa = c r / m^2 with integer drift c, force r and register m (code/rule/loop-ring);
//                      s = c / m, f = r / m
//   the joint theorem  kappa = 3/16 and rho = r / c together give c^2 rho = 3 m^2 / 16, so rho / 3 = (m / 4c)^2:
//                      exact one speed at a balanced split needs the balance to lie in 3 Q^2
//   the Pell ladder    at rho = 3/8 (c = 8t, r = 3t) the speed is 4t / m, rational; with t = p, m = 16q for a
//                      Pell pair p^2 - 2q^2 = +-1 the squared speed is 1/8 times p^2 / (2q^2) = 1/8 (1 +- 1/(2q^2))
//                      EXACTLY, so the balanced light meets one speed to any precision as the register grows,
//                      and never exactly
//   alpha              the Coulomb coefficient over the light's speed, alpha = s / (12 N c) (E-FRC-0250, 0251),
//                      = sqrt(3 / (2 rho)) / (12 N) with s = sqrt(kappa / rho) and c = sqrt(2 kappa / 3): free of
//                      kappa, so the one-speed question does not move alpha at all

import { HUSK_WEIGHTS } from '@/code/measure/photon-husk'
import { makeTritLight } from '@/code/rule/trit-column'

/** The register counts that could define the 3D husk light's balance, read off the trit bulk. */
export type RegisterCounts = {
  /** bulk links per bulk dock */
  bulkLinks: number
  /** bulk triangles per bulk dock */
  bulkTriangles: number
  /** distinct husk link directions per husk dock */
  huskLinkDirections: number
  /** bulk links per column dock that cast a husk link (the directions' weights summed) */
  huskLinkWeight: number
  /** distinct husk triangles per husk dock */
  huskTriangles: number
  /** the husk triangles' multiplicities summed, per husk dock */
  huskTriangleMultiplicity: number
}

export function registerCounts(): RegisterCounts {
  const bulk = makeTritLight({ side: 4, depth: 2, form: 'wave' }).bulk

  return {
    bulkLinks: bulk.links / bulk.docks,
    bulkTriangles: bulk.triangles / bulk.docks,
    huskLinkDirections: HUSK_WEIGHTS.length,
    huskLinkWeight: HUSK_WEIGHTS.reduce((sum, w) => sum + w, 0),
    huskTriangles: bulk.huskTriangles / bulk.huskDocks,
    huskTriangleMultiplicity:
      Array.from(bulk.multiplicity).reduce((sum, v) => sum + v, 0) /
      bulk.huskDocks,
  }
}

/** Is a / b (positive, lowest terms or not) three times the square of a rational? Decided in integers. */
export function isThreeRationalSquare(a: number, b: number): boolean {
  // a / (3 b) = (x / y)^2  <=>  3 a b is a perfect square times ... : a / (3b) = a * 3b / (3b)^2, so it is a
  // rational square exactly when a * 3b is a perfect square
  const n = BigInt(a) * 3n * BigInt(b)
  const root = sqrtBig(n)

  return root * root === n
}

/** The integer square root of a non-negative BigInt (floor). */
export function sqrtBig(n: bigint): bigint {
  if (n < 2n) {
    return n
  }

  let x = BigInt(Math.floor(Math.sqrt(Number(n))))

  while (x * x > n) {
    x -= 1n
  }

  while ((x + 1n) * (x + 1n) <= n) {
    x += 1n
  }

  return x
}

/**
 * Every loop-light split with kappa = c r / m^2 = 3/16 and r / c = a / b, m <= mMax, counted in integers:
 * 16 c r = 3 m^2 and b r = a c.
 */
export function jointSplits(
  a: number,
  b: number,
  mMax: number,
): { m: number; c: number; r: number }[] {
  const out: { m: number; c: number; r: number }[] = []

  for (let m = 1; m <= mMax; m++) {
    const product = 3 * m * m

    if (product % 16 !== 0) {
      continue
    }

    const cr = product / 16

    for (let c = 1; c <= cr; c++) {
      if (cr % c !== 0) {
        continue
      }

      const r = cr / c

      if (b * r === a * c) {
        out.push({ m, c, r })
      }
    }
  }

  return out
}

/** The Pell pairs p^2 - 2 q^2 = +-1, (1, 1), (3, 2), (7, 5), ..., while q <= qMax, as BigInts. */
export function pellPairs(
  qMax: bigint,
): { p: bigint; q: bigint; sign: bigint }[] {
  const out: { p: bigint; q: bigint; sign: bigint }[] = []

  let p = 1n
  let q = 1n

  while (q <= qMax) {
    out.push({ p, q, sign: p * p - 2n * q * q })
    ;[p, q] = [p + 2n * q, p + q]
  }

  return out
}

/**
 * The balanced split at a Pell pair: drift c = 8p, force r = 3p, register m = 16q, so r / c = 3/8 exactly, and
 * the exact relative miss of the squared speed from 1/8, as a fraction num / den in integers.
 */
export function pellSplit(pair: { p: bigint; q: bigint }): {
  c: bigint
  r: bigint
  m: bigint
  missNum: bigint
  missDen: bigint
} {
  const c = 8n * pair.p
  const r = 3n * pair.p
  const m = 16n * pair.q
  // squared speed 2 kappa / 3 = 2 c r / (3 m^2); over 1/8: 16 c r / (3 m^2); minus 1
  const num = 16n * c * r - 3n * m * m
  const den = 3n * m * m

  return { c, r, m, missNum: num, missDen: den }
}

/** alpha = s / (12 N c) at a split ratio rho and coupling kappa, the general form (E-FRC-0250). */
export function alphaCoulomb(
  n: number,
  rho: number,
  kappa: number,
): number {
  const s = Math.sqrt(kappa / rho)
  const c = Math.sqrt((2 * kappa) / 3)

  return s / (12 * n * c)
}

/** The same, reduced: sqrt(3 / (2 rho)) / (12 N), free of kappa. */
export const alphaOfBalance = (n: number, rho: number): number =>
  Math.sqrt(3 / (2 * rho)) / (12 * n)

/** E-FRC-0240's golden-rule form, alpha = 1 / (2 N sqrt rho), defined through a stand-in atom's dipole. */
export const alphaGoldenRule = (n: number, rho: number): number =>
  1 / (2 * n * Math.sqrt(rho))

/** The depth D in 1 .. dMax whose 1 / alpha(2D + 1) is nearest the target, relatively, and its miss. */
export function nearestDepth(
  alpha: (n: number) => number,
  target: number,
  dMax: number,
): { d: number; inverse: number; miss: number } {
  let best = { d: 0, inverse: 0, miss: Infinity }

  for (let d = 1; d <= dMax; d++) {
    const inverse = 1 / alpha(2 * d + 1)
    const miss = Math.abs(inverse / target - 1)

    if (miss < best.miss) {
      best = { d, inverse, miss }
    }
  }

  return best
}
