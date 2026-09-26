// What the history of the string predicts for color singlets (STAND-INS for nucleons), derived before any
// residual was measured: the paid string is a 3-state Potts model, and what that fixes.
//
// E-FRC-0175 found the flux string to be pure history: the flux on a link is the net count of charges the stream
// has copied across it. The paid-string rule of E-FRC-0129 and 0131 (code/rule/string-graph: matter waits in
// docks, a hop pays tension when it leaves its link's flux not 0 mod 3, demons of capacity 4 pay) reads that
// history only mod 3. So in the canonical measure its demons impose, a set of charges is weighed by the sum over
// Z3 flux histories of x^(paid links), x = exp(-beta tension). code/measure/string-potts derives the identity
//
//   sum over Z3 chains with div = rho of x^(support) = the 3-state Potts model at K = ln((1 + 2x) / (1 - x)),
//   each love an insertion of omega^(-theta), each fear of omega^(theta)
//
// so a meson's profile is the Potts spin correlator and a pair of singlets is weighed by its energy-energy
// correlator. The rule's dynamics is a deterministic worm algorithm for that model.
//
// What this file establishes, exactly or by counting:
// 1. the duality, checked by brute force on a 6-dock D4 patch (11 links, all 177,147 Z3 chains against all 729
//    Potts states) for every charge pattern, at x = 0.03 and 0.3
// 2. two ground-energy theorems, proven in the notes and checked on every charge pattern of the patch:
//    k loves and k fears need at least k paid links, 3k loves need at least 2k. So N mesons or N baryons
//    together cost exactly what they cost apart: THE BINDING ENERGY OF ANY NUMBER OF SINGLETS IS ZERO at the
//    lowest level, and a deuteron can only be held by entropy, never by energy
// 3. the ideal-gas identity at the lowest level: two loves and two fears at their least cost (2 paid links) have
//    exactly as many chains as perfect love-fear matchings on adjacent pairs, which is the count an ideal gas of
//    dimers gives the same charges. Swapping partners adds no entropy (nothing moves, a love has no partner of
//    its own). Every residual force therefore comes from the excited levels, where strings overlap
// 4. the levels of one singlet on the infinite D4 lattice, counted: Omega(n), the number of Z3 chains with n paid
//    links, for a meson (24, 552, ...) and a baryon of three loves, n up to 4, with the mean love-fear distance
//    at each level. Omega(1) = 24 and Omega(2) = 24 x 23 = 552 are checked against the hand count, and the
//    baryon's Omega(2) against 552 + 276 = 828 (the origin at an end of the two-link path or in its middle)
// 5. from the levels alone, the meson's mean love-fear distance at fill 0.02, against the dynamics measured
//    here on the side-7 box (one meson, 20,000 beats) and E-FRC-0131's 1.72
//
// The predictions registered for E-FRC-0196 to 0198:
// - the Yukawa shape belongs to the meson itself: its profile is the Potts spin correlator,
//   e^(-m1 r) / r^(3/2) in the bulk and, column-summed, e^(-m1 r) / r on the husk
// - a singlet has net flux 0 mod 3, so no single string joins two singlets: the residual is at least two strings,
//   e^(-2 m1 r), the Potts energy-energy threshold, not one-meson exchange e^(-m1 r). One-meson exchange would
//   need a pair made from calm, which capacity 4 below the pair cost 8 forbids
// - no bound state of any number of singlets at zero temperature (theorem 2), and none from partner exchange
//   (identity 3): whatever binds is excited-level string overlap, and its sign is not fixed by these counts
//
// Gates, fixed before the run:
// - the duality holds to 1e-12 (relative) on every charge pattern at both x, with the Potts imaginary part under
//   1e-12
// - both lower bounds hold on every pattern of the patch, and the least-cost chain count equals the matching count
//   on every two-love two-fear pattern at cost 2
// - Omega(1), Omega(2) and the baryon's Omega(2) equal the hand counts
// - the predicted mean love-fear distance lies within 10 percent of the measured one
//
// Depth L1 for the duality and the theorems (exact algebra and counting), L2 for the level prediction against
// the constructed rule's dynamics. The singlets are stand-ins for nucleons.
//
// The first run, recorded as it came out (427.5 s, 2026-09-25): fail, on the duality gate alone. The float
// evaluation of both sides agreed to 4.4e-12 relative on the worst of 486 patterns, above the 1e-12 gate, with
// the Potts imaginary part at 9.7e-17. Every other gate held: both bounds on every pattern (140 meson, 21
// baryon), the ideal-gas identity on 64 cases, Omega(1) = 24, Omega(2) = 552 and the baryon's 828 against the
// hand counts, and the predicted mean love-fear distance 1.824 against 1.808 measured (0.9 percent; the level
// sum cut at n = 4 gives 1.752).
// Changed after that run, disclosed: the gate now reads an EXACT check of the same identity, as integer
// polynomials in x (code/measure/string-potts exactDuality: 2 3^V c(x) = 2 P_0 - P_1 - P_2 and P_1 = P_2,
// coefficient by coefficient, every coefficient below 2^53). The failure was the rounding of a 729-term float
// sum, not the identity, and an identity is better settled exactly than by a tolerance. The float numbers are
// still reported beside it (floatWithinTolerance). The gate's threshold did not move.
// The second run, 2026-09-26 (46.5 s, tmp/frc0195-second.log): pass. The exact check holds on all 243 charge
// patterns with 0 coefficient mismatches and 0 imaginary mismatches; the float numbers are unchanged (4.4e-12,
// floatWithinTolerance 0), and every other number repeats the first run to the last digit.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { d4BoxMesh } from '@/code/substrate/d4-box'
import { makeStringGraph } from '@/code/rule/string-graph'
import { unitDemonBeta } from '@/code/dynamics/finite-kinetic'
import { chainSums, exactDuality, pottsSum, type SmallGraph } from '@/code/measure/string-potts'
import { linkAnimals, singletLevels } from '@/code/measure/string-levels'
import { boxDisplacement, bulkLength, makeBoxGeometry, runGas, singletPieces } from '@/code/measure/nucleon-gas'

const PATCH = [
  [0, 0, 0, 0],
  [1, 1, 0, 0],
  [1, 0, 1, 0],
  [0, 1, 1, 0],
  [1, 0, 0, 1],
  [2, 1, 1, 0],
]
const XS = [0.03, 0.3]
const LEVELS = 4
const GAP_SIDE = 7
const GAP_FILL = 0.02
const GAP_SETTLE = 300
const GAP_BEATS = 20000
const CAPACITY = 4
const DUALITY_TOLERANCE = 1e-12
const GAP_TOLERANCE = 0.1

// perfect matchings of loves to fears over adjacent pairs, by brute force over permutations
function matchings(loves: number[], fears: number[], adjacent: (a: number, b: number) => boolean): number {
  if (loves.length === 0) {
    return 1
  }

  const [first, ...rest] = loves

  return fears.reduce((sum, f, k) => sum + (adjacent(first ?? 0, f) ? matchings(rest, fears.filter((_, j) => j !== k), adjacent) : 0), 0)
}

export default experiment({
  id: 'gauge/nucleon-string-potts',
  code: 'E-FRC-0195',
  title:
    'what the history of the string predicts for color singlets (stand-ins for nucleons): the paid Z3 string is the 3-state Potts model (exact on a D4 patch), any number of singlets binds with exactly zero energy, partner exchange adds no entropy, and the counted singlet levels predict the meson size the dynamics shows',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const roots = rootsD4()
    const isRoot = (v: number[]): boolean => roots.some(r => r.every((x, i) => x === v[i]))
    const links: [number, number][] = []

    PATCH.forEach((a, i) =>
      PATCH.forEach((b, j) => {
        if (i < j && isRoot(a.map((x, k) => x - (b[k] ?? 0)))) {
          links.push([i, j])
        }
      }),
    )

    const patch: SmallGraph = { docks: PATCH.length, links }
    const adjacent = (a: number, b: number): boolean => links.some(([p, q]) => (p === a && q === b) || (p === b && q === a))

    // 1. the duality
    let dualityWorst = 0
    let imaginaryWorst = 0
    let patterns = 0

    for (const x of XS) {
      const sums = chainSums(patch, x)
      const vacuum = sums.get('0'.repeat(PATCH.length))?.weight ?? 1
      const pottsVacuum = pottsSum(patch, x, new Array<number>(PATCH.length).fill(0)).re

      for (const [key, entry] of sums) {
        const rho = key.split('').map(Number)
        const potts = pottsSum(patch, x, rho)
        const left = entry.weight / vacuum
        const right = potts.re / pottsVacuum

        dualityWorst = Math.max(dualityWorst, Math.abs(left - right) / Math.max(Math.abs(left), 1e-300))
        imaginaryWorst = Math.max(imaginaryWorst, Math.abs(potts.im) / Math.abs(pottsVacuum))
        patterns += 1
      }
    }

    // 1, exactly: the same identity as integer polynomials in x (added after the first run, see the header)
    const exact = exactDuality(patch)

    // 2 and 3. the ground-energy bounds and the ideal-gas identity
    const sums = chainSums(patch, XS[0] ?? 0)

    let mesonBoundHolds = true
    let baryonBoundHolds = true
    let identityHolds = true
    let identityCases = 0
    let mesonPatterns = 0
    let baryonPatterns = 0

    for (const [key, entry] of sums) {
      const rho = key.split('').map(Number)
      const loves = rho.flatMap((r, i) => (r === 1 ? [i] : []))
      const fears = rho.flatMap((r, i) => (r === 2 ? [i] : []))

      if (loves.length > 0 && loves.length === fears.length) {
        mesonPatterns += 1
        mesonBoundHolds = mesonBoundHolds && entry.least >= loves.length

        if (loves.length === 2 && entry.least === 2) {
          identityCases += 1
          identityHolds = identityHolds && entry.atLeast === matchings(loves, fears, adjacent)
        }
      }

      if (fears.length === 0 && loves.length > 0 && loves.length % 3 === 0) {
        baryonPatterns += 1
        baryonBoundHolds = baryonBoundHolds && entry.least >= (2 * loves.length) / 3
      }
    }

    // 4. the levels
    const animals = linkAnimals(LEVELS)
    const meson = singletLevels({ boundary: 'meson', maxSize: LEVELS, animals })
    const baryon = singletLevels({ boundary: 'baryon', maxSize: LEVELS, animals })
    const handCounts = meson[0]?.count === 24 && meson[1]?.count === 24 * 23 && baryon[1]?.count === 24 * 23 + (24 * 23) / 2

    // 5. the meson's mean love-fear distance: measured, then predicted from the levels at the measured x
    const graph = makeStringGraph({ mesh: d4BoxMesh({ side: GAP_SIDE }), mass: 4, tension: 1, capacity: CAPACITY })
    const geometry = makeBoxGeometry(GAP_SIDE)

    let distanceSum = 0
    let samples = 0

    const out = runGas({
      graph,
      mesons: 1,
      baryons: 0,
      fill: GAP_FILL,
      settle: GAP_SETTLE,
      beats: GAP_BEATS,
      every: 1,
      look: state => {
        for (const p of singletPieces(graph, state)) {
          if (p.loves.length === 1 && p.fears.length === 1) {
            distanceSum += bulkLength(boxDisplacement(geometry, p.fears[0] ?? 0, p.loves[0] ?? 0))
            samples += 1
          }
        }
      },
    })
    const measured = distanceSum / Math.max(1, samples)
    const x = Math.exp(-unitDemonBeta({ meanDemon: out.meanDemon, capacity: CAPACITY }))
    const weights = meson.map((l, k) => l.count * x ** (k + 1))
    const means = meson.map(l => l.distanceSum / l.count)
    // the tail past the last counted level: its weights continue the last ratio geometrically and its mean
    // distance the last step linearly, summed to convergence
    const ratio = (weights[LEVELS - 1] ?? 0) / (weights[LEVELS - 2] ?? 1)
    const step = (means[LEVELS - 1] ?? 0) - (means[LEVELS - 2] ?? 0)

    let top = weights.reduce((a, w, k) => a + w * (means[k] ?? 0), 0)
    let bottom = weights.reduce((a, w) => a + w, 0)
    let w = weights[LEVELS - 1] ?? 0
    let d = means[LEVELS - 1] ?? 0

    for (let k = 0; k < 400; k++) {
      w *= ratio
      d += step
      top += w * d
      bottom += w
    }

    const predicted = top / bottom
    const truncated = weights.reduce((a, wt, k) => a + wt * (means[k] ?? 0), 0) / weights.reduce((a, wt) => a + wt, 0)

    // the gate reads the exact check: 0 mismatched coefficients is a relative error of 0, under 1e-12
    const dualityHolds = exact.mismatches === 0 && exact.imaginaryMismatches === 0 && exact.patterns > 0
    const ok =
      dualityHolds &&
      mesonBoundHolds &&
      baryonBoundHolds &&
      identityHolds &&
      identityCases > 0 &&
      handCounts &&
      out.exact &&
      out.agrees &&
      Math.abs(predicted / measured - 1) < GAP_TOLERANCE

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        "the Z3 paid-string sum equals the 3-state Potts model on every charge pattern of a D4 patch, k loves and k fears need k paid links and 3k loves need 2k (so any number of singlets binds with zero energy), at least cost partner exchange adds no chains beyond an ideal gas of dimers, the counted singlet levels match the hand counts, and they predict the meson's mean size within 10 percent of the rule's dynamics",
      metrics: {
        patchLinks: links.length,
        dualityPatterns: patterns,
        dualityWorstRelative: dualityWorst,
        pottsImaginaryWorst: imaginaryWorst,
        dualityExactPatterns: exact.patterns,
        dualityExactCoefficientMismatches: exact.mismatches,
        dualityExactImaginaryMismatches: exact.imaginaryMismatches,
        floatWithinTolerance: dualityWorst < DUALITY_TOLERANCE && imaginaryWorst < DUALITY_TOLERANCE ? 1 : 0,
        mesonBoundHolds: mesonBoundHolds ? 1 : 0,
        mesonPatterns,
        baryonBoundHolds: baryonBoundHolds ? 1 : 0,
        baryonPatterns,
        idealGasIdentityHolds: identityHolds ? 1 : 0,
        idealGasIdentityCases: identityCases,
        ...Object.fromEntries(meson.map((l, k) => [`mesonOmega${k + 1}`, l.count])),
        ...Object.fromEntries(meson.map((l, k) => [`mesonMeanDistanceLevel${k + 1}`, l.distanceSum / l.count])),
        ...Object.fromEntries(meson.map((l, k) => [`mesonMeanHuskDistanceLevel${k + 1}`, l.huskSum / l.count])),
        ...Object.fromEntries(baryon.slice(1).map((l, k) => [`baryonOmega${k + 2}`, l.count])),
        ...Object.fromEntries(baryon.slice(1).map((l, k) => [`baryonMeanSpreadLevel${k + 2}`, l.distanceSum / l.count])),
        measuredX: x,
        levelRatioAtLastLevel: ratio,
        predictedMeanDistance: predicted,
        predictedMeanDistanceTruncated: truncated,
        measuredMeanDistance: measured,
        exactAndKernel: out.exact && out.agrees ? 1 : 0,
      },
      control: {
        potts3Coupling: Math.log((1 + 2 * x) / (1 - x)),
        mesonGapE0131ColdestFill: 1.72,
        handOmega1: 24,
        handOmega2: 24 * 23,
        handBaryonOmega2: 24 * 23 + (24 * 23) / 2,
      },
      notes:
        'Proof of the bounds: the paid support splits into connected pieces, and a piece whose boundary links are all unpaid has charge 0 mod 3 (Gauss mod 3), so every piece is a singlet. A connected piece holding n charges spans at least n - 1 links. With k loves and k fears a piece holds at least 2 charges, so the links are at least sum (n - 1) >= sum n / 2 = k. With 3k loves and no fears a piece holds at least 3, so there are at most k pieces and the links are at least 3k - k = 2k. Both are reached by singlets apart, so binding energy is exactly zero at the lowest level for any number of singlets. The level counts are exact on the infinite lattice to n = 4; the mean-distance prediction continues the last level ratio and distance step past n = 4, an estimate stated as such (the truncated value is reported beside it). The vacuum loops of the rest of the box shift the level weights at relative order x^3 times the triangles touching a chain, not modeled. L1 for items 1 to 4, L2 for item 5. The singlets are stand-ins for nucleons.',
    })
  },
})
