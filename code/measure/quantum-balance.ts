// Measurement for E-FRC-0269 (test/experiment/gauge/quantum-balance): which statistic of the register fills the
// seams of a quantum light balance, read on the plaquette ladder's exact quantum light, and the husk's structure
// that the answer is carried to.
//
// THE SPLITS. The ladder's quantum light (code/rule/plaquette-ladder) takes kappa = 2 / N split between the drift
// (s = 2 N c / M) and the force (f = 2 N r / M). With M = 2 N^2 w and c r = 2 N w^2 every split is exact and
// s f = 2 / N; its ratio is f / s = r / c = 2 N w^2 / c^2. `splitNearFraction` picks, among w = 1 .. wMax and the
// divisors c of 2 N w^2, the pair whose ratio is nearest a rational target a / b in the multiplicative sense,
// compared by cross-multiplication in integers (no real enters the choice), ties to the smaller M then the
// smaller c. code/rule/loop-ring's splitNear is the same search for an integer target.
//
// THE PLANCK RATIO of one split: the box's full Floquet spectrum (every momentum sector, dense), each level's
// energy unwrapped against the mode-resolved invariant energy (code/measure/quantum-ladder), the thermal energy of
// all levels above the vacuum at T = x omega_min against Planck's sum over the box's one-quantum band. Doubles:
// this is measurement.

import type { LadderSpec } from '@/code/rule/plaquette-ladder'
import {
  oneQuantumBand,
  planck,
  thermalEnergy,
  unwrapped,
} from '@/code/measure/quantum-ladder'
import { buildTritBulk } from '@/code/rule/trit-column'

export type ExactSplit = {
  readonly root: number
  readonly drift: number
  readonly force: number
  readonly w: number
  /** r / c as a double, for reading only */
  readonly ratio: number
}

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))

/**
 * The exact split of kappa = 2 / n whose ratio r / c is nearest a / b, multiplicatively, in integers. Every exact
 * split has w / c = p / q in lowest terms, and its ratio is 2 n p^2 / q^2; the least w that carries p / q is
 * p g with g = q / gcd(q, 2 n) (then c = q g divides 2 n w^2). The search runs over q = 1 .. qMax and every p,
 * compares 2 n p^2 b with a q^2, and breaks ties toward the smaller root.
 */
export function splitNearFraction(
  n: number,
  target: readonly [number, number],
  qMax: number,
): ExactSplit {
  const [a, b] = target

  let best:
    | { c: number; r: number; w: number; num: number; den: number }
    | undefined

  for (let q = 1; q <= qMax; q++) {
    const g = q / gcd(q, 2 * n)

    for (let p = 1; 2 * n * p * p * b <= 4 * a * q * q; p++) {
      if (gcd(p, q) !== 1) {
        continue
      }

      const w = p * g
      const c = q * g
      const r = (2 * n * w * w) / c
      const x = 2 * n * p * p * b
      const y = a * q * q
      const num = Math.max(x, y)
      const den = Math.min(x, y)

      if (
        best === undefined ||
        num * best.den < best.num * den ||
        (num * best.den === best.num * den && w < best.w)
      ) {
        best = { c, r, w, num, den }
      }
    }
  }

  const s = best!

  return {
    root: 2 * n * n * s.w,
    drift: s.c,
    force: s.r,
    w: s.w,
    ratio: s.r / s.c,
  }
}

/** The ladder spec of one split on a box of `plaquettes` squares. */
export const ladderSpecOf = (
  n: number,
  plaquettes: number,
  split: ExactSplit,
): LadderSpec => ({
  n,
  plaquettes,
  root: split.root,
  drift: split.drift,
  force: split.force,
})

/**
 * The classical light's lowest frequency on a ladder box of two or more squares: the k = 0 mode, K = 2, so
 * 2 - 2 cos omega = 2 kappa. It depends on kappa = 2 / n alone, so every split of one n shares it.
 */
export const ladderOmegaMin = (n: number): number => Math.acos(1 - 2 / n)

/**
 * The Planck ratio of one split at each temperature T: the thermal energy of the box's whole spectrum over
 * Planck's sum over its one-quantum band (the split's own measured omegas). One dense spectrum serves every T.
 */
export function planckRatios(
  spec: LadderSpec,
  temperatures: readonly number[],
): { ratios: number[]; omegas: number[]; residual: number } {
  const { band, levels, residual } = oneQuantumBand(spec)
  const { energies } = unwrapped(levels)
  const omegas = band.map(b => b.omega)

  return {
    ratios: temperatures.map(
      T =>
        thermalEnergy(energies, T) /
        omegas.reduce((acc, w) => acc + planck(w, T), 0),
    ),
    omegas,
    residual,
  }
}

/**
 * The husk's register structure from the trit bulk on a torus of side `side`: for every husk link, how many of
 * its triangles have multiplicity 1 and 2, and the number of connected components of the graph whose vertices are
 * the husk links and whose edges join two links of one triangle. Integers only.
 */
export function huskRegisterGraph(side: number): {
  links: number
  triangles: number
  withOne: number
  withTwo: number
  components: number
} {
  const bulk = buildTritBulk({ side, depth: 2 })
  const L = bulk.huskLinks
  const P = bulk.huskTriangles
  const ones = new Int32Array(L)
  const twos = new Int32Array(L)
  const parent = Int32Array.from({ length: L }, (_, i) => i)
  const find = (x: number): number => {
    let r = x

    while (parent[r] !== r) {
      r = parent[r]!
    }

    let y = x

    while (parent[y] !== r) {
      const next = parent[y]!

      parent[y] = r
      y = next
    }

    return r
  }

  for (let p = 0; p < P; p++) {
    const n = bulk.multiplicity[p] ?? 0
    const ls = [0, 1, 2].map(j => bulk.huskTriLinks[p * 3 + j] ?? 0)

    for (const l of ls) {
      if (n === 1) {
        ones[l] = ones[l]! + 1
      } else if (n === 2) {
        twos[l] = twos[l]! + 1
      }
    }

    const a = find(ls[0]!)

    for (const l of ls.slice(1)) {
      const b = find(l)

      if (a !== b) {
        parent[b] = a
      }
    }
  }

  let components = 0

  for (let l = 0; l < L; l++) {
    if (find(l) === l) {
      components++
    }
  }

  return {
    links: L,
    triangles: P,
    withOne: ones.filter(x => x > 0).length,
    withTwo: twos.filter(x => x > 0).length,
    components,
  }
}
