// E-FRC-0188. Binding needs pair creation, derived before anything is measured: the paid Z3 string whose vacuum
// makes pairs is the 3-state Potts model in a MAGNETIC FIELD, and the field is what turns the residual between color
// singlets (stand-ins for nucleons) from two strings into one-meson exchange.
//
// E-FRC-0195 proved that singlets of the paid string bind with exactly zero energy and that their residual starts at
// two strings, e^(-2 m r), because the rule could not make a pair from calm (demon capacity 4 below the pair cost 8).
// The cold vacuum does make pairs (E-FLD-0028/0029: dressing is pair creation; E-SPN-0050: pair making sets
// mu_love + mu_fear = 0 through the rest energy). The same move is already in the rule, (0, 0) -> (1, -1) on a link,
// and is payable once the demon capacity reaches the pair cost. This file derives what that changes
// (code/measure/pair-string):
//
// 1. THE DUALITY WITH A FIELD. Summing every free dock's charge (0, +1, -1 with weights 1, y, y; y = e^(-beta mass))
//    turns the divergence constraint into a factor 1 + y (w^theta + w^(-theta)) on the Potts spin: a field
//    h = ln((1 + 2 y) / (1 - y)). Checked exactly, as polynomials in x and y with Eisenstein coefficients, on the
//    6-dock D4 patch of E-FRC-0195 for every one of the 4^6 patterns (each dock free, or static with charge 0, 1, 2)
// 2. THE CENTER THEOREM, on the line (the E-FRC-0129 geometry), exactly by BigInt transfer matrices: with y = 0 the
//    connected ratio C = Z12 Z0 / (Z1 Z2) - 1 of two static mesons is EXACTLY 0 at every gap (no string can join two
//    singlets), and with y > 0 it is positive (attraction) at every gap and falls at the rate ln(lambda0 / lambda1),
//    lambda1 the transfer matrix's flux-sector eigenvalue: one-meson exchange, with the dressed meson's own mass
// 3. THE INERT BARYON of the line: three static loves on consecutive cells multiply to x^2 times the identity, so the
//    line's static baryon couples to nothing, with or without pairs: the (3, 0) + (1, 1) residual on the line is
//    exactly 0 at every gap (the (4, 1) question, E-SPN-0061, is then a D4 question: E-FRC-0202)
// 4. THE PREDICTED m FOR D4, at leading order in x: one string's weight at displacement v is N(v) x^n(v) (n the
//    fewest roots, N the shortest root paths). The meson's own love-fear profile and the one-string residual between
//    two compact singlets are built from the same strings (the residual's string runs from one singlet's love to the
//    other's fear, the two stranded charges ending on pairs made next to them, a factor y^2 (23)^2 from placements), so
//    the prediction registered for E-FRC-0200 is m_residual = m_meson, and m_pred(x) is the Ornstein-Zernike rate
//    of that leading profile over the E-FRC-0200 window (bulk power 3/2, husk power 1, R 2 to 4.5). One string (y^2
//    x^n) overtakes two (x^(2 n)) from n* = 2 ln(1/y) / ln(1/x); for mass 2 and tension 3, y = x^(2/3) and n* = 4/3,
//    so one-meson exchange leads from two links on. m_pred is printed at x = 1/30, near the E-FRC-0200 coupling
//
// Gates, fixed before the first run:
// G1 the duality holds exactly (every coefficient equal, every omega part 0) on all 4,096 patterns
// G2 y = 0 (x = 1/30): C = 0 exactly (as a fraction) for two static mesons at every gap 0 to 30, both orientations
// G3 y = 1/10 (x = 1/30): C > 0 at every gap 0 to 30, and ln(C(29) / C(30)) within 1e-3 (relative) of
//    ln(lambda0 / lambda1)
// G4 the baryon: S+ S+ S+ = x^2 times the identity exactly, and C = 0 exactly for baryon and meson at every gap 0
//    to 30, at y = 0 and y = 1/10
// Pass: all four. Fail: otherwise. Reported: m_pred bulk and husk at x = 1/30, the leading profile's shells, the
// contact C, the rates at every fifth gap.
//
// Depth L1: exact algebra and exact transfer matrices of the constructed paid-string measure; singlets are stand-ins
// for nucleons.
//
// The first run, recorded as it came out (16.9 s, tmp/frc0188.log): fail, on G2 and G4, and both failures were the
// HARNESS, not the statement. G2 and G4 read C on a ring of 120 cells, where the flux winds: every one of the 62
// no-pair values came out at 4.5e-172 and the 93 baryon values near 1e-130, the ring's winding sectors, (x /
// lambda0)^(ring - window), while the gates claim the infinite line. Changed after that run, disclosed: with no
// pairs the free cell is diag(1, x, x) exactly, so the infinite line's vacuum is the flux-0 vector and C is now
// computed there as an exact fraction (no ring); the baryon's C with pairs is read on the infinite line through its
// Perron vectors in floats (under 1e-13), beside the exact identity S+ S+ S+ = x^2 1 that proves it. No threshold
// moved. G1 and G3 held on the first run: 0 mismatches on 4,096 patterns, 0 omega parts; C > 0 at all 31 gaps with
// pairs, 3.35e-4 at contact, rate 3.326472 at gap 29 against ln(lambda0 / lambda1) = 3.325619 (2.6e-4); m_pred =
// 1.620 (bulk) and 1.678 (husk) at x = 1/30.
// The second run (tmp/frc0188-second.log): pass. No pairs: 0 of 62 connected ratios nonzero, exactly. The baryon:
// 0 of 31 nonzero without pairs, exactly, and at most 1.4e-15 with pairs on the infinite line. G1 and G3 repeat the
// first run to the last digit.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { ornsteinZernikeRate } from '@/code/measure/nucleon-gas'
import {
  chainPolynomial,
  exactConnected,
  fluxTable,
  leadingProfile,
  lineBaryon,
  pottsPolynomial,
  rationalLog,
  rationalValue,
  staticPotential,
  transferEigenvalues,
  type Rational,
  type SmallGraph,
} from '@/code/measure/pair-string'

const PATCH = [
  [0, 0, 0, 0],
  [1, 1, 0, 0],
  [1, 0, 1, 0],
  [0, 1, 1, 0],
  [1, 0, 0, 1],
  [2, 1, 1, 0],
]
const X: Rational = { num: 1n, den: 30n }
const Y: Rational = { num: 1n, den: 10n }
const NO_PAIRS: Rational = { num: 0n, den: 1n }
const GAPS = 30
const RING = 120
const RATE_TOLERANCE = 1e-3
const WINDOW = { low: 2, high: 4.5 }
const REACH = 7
const MESON = [1, -1]
const FLIPPED = [-1, 1]
const BARYON = [1, 1, 1]
// a float potential read as zero: rounding of the double ratio of four window weights near 1
const FLOAT_ZERO = 1e-13

export default experiment({
  id: 'gauge/pair-string-derivation',
  code: 'E-FRC-0188',
  title:
    'binding needs pair creation, derived: the paid Z3 string whose vacuum makes pairs is the 3-state Potts model in a magnetic field (exact on a D4 patch), so without pairs two static color singlets (stand-ins for nucleons) are exactly unjoined on the line and with pairs they attract at the dressed meson\'s own mass, the line\'s static baryon is inert, and the leading-order D4 profile gives the predicted meson mass',
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
    const table = fluxTable(patch)

    // 1. the duality with the field
    let patterns = 0
    let mismatches = 0
    let omegaParts = 0

    for (let code = 0; code < 4 ** PATCH.length; code++) {
      const pattern: number[] = []
      let rest = code

      for (let i = 0; i < PATCH.length; i++) {
        pattern.push((rest % 4) - 1)
        rest = Math.floor(rest / 4)
      }

      const chain = chainPolynomial(table, pattern)
      const potts = pottsPolynomial(patch, pattern)

      patterns++

      for (let i = 0; i < chain.a.length; i++) {
        mismatches += chain.a[i] === potts.a[i] ? 0 : 1
        omegaParts += potts.b[i] === 0 ? 0 : 1
      }
    }

    // 2. the center theorem on the line
    const series = (y: Rational, first: readonly number[], second: readonly number[]): Rational[] =>
      Array.from({ length: GAPS + 1 }, (_, gap) => exactConnected({ x: X, y, first, second, gap, ring: RING }))
    const quiet = [...series(NO_PAIRS, MESON, MESON), ...series(NO_PAIRS, MESON, FLIPPED)]
    const paired = series(Y, MESON, MESON)
    const pairedFlipped = series(Y, MESON, FLIPPED)
    const [l0, l1, l2] = transferEigenvalues(1 / 30, 1 / 10)
    const predictedRate = Math.log(l0 / Math.abs(l1))
    const rateAt = (s: Rational[], gap: number): number => rationalLog(s[gap] as Rational) - rationalLog(s[gap + 1] as Rational)
    const measuredRate = rateAt(paired, GAPS - 1)

    // 3. the inert baryon
    const b = lineBaryon(X)
    const scale = (b[0] as bigint)
    const baryonIsIdentity = b.every((v, i) => (i % 4 === 0 ? v === scale : v === 0n)) && scale * 900n === 27000n * 1n
    const baryonQuiet = series(NO_PAIRS, BARYON, MESON)
    // with pairs the infinite line is read in floats through its Perron vectors (the ring's winding would add
    // (lambda1 / lambda0)^90); the exact statement is the matrix identity above
    const baryonPaired = Array.from({ length: GAPS + 1 }, (_, gap) => [
      staticPotential({ x: 1 / 30, y: 1 / 10, first: BARYON, second: MESON, gap }),
      staticPotential({ x: 1 / 30, y: 1 / 10, first: BARYON, second: FLIPPED, gap }),
    ]).flat()
    const baryonPairedWorst = Math.max(...baryonPaired.map(Math.abs))

    // 4. the predicted m
    const profile = leadingProfile({ x: 1 / 30, reach: REACH })
    const inWindow = (s: { r: number }): boolean => s.r >= WINDOW.low - 1e-9 && s.r <= WINDOW.high + 1e-9
    const mBulk = ornsteinZernikeRate({ points: profile.bulk.filter(inWindow), power: 1.5 })
    const mHusk = ornsteinZernikeRate({ points: profile.husk.filter(inWindow), power: 1 })
    const nStar = (2 * Math.log(10)) / Math.log(30)

    const g1 = patterns === 4096 && mismatches === 0 && omegaParts === 0
    const g2 = quiet.every(c => c.num === 0n)
    const g3 = paired.every(c => c.num > 0n && c.den > 0n) && Math.abs(measuredRate / predictedRate - 1) < RATE_TOLERANCE
    const g4 = baryonIsIdentity && baryonQuiet.every(c => c.num === 0n) && baryonPairedWorst < FLOAT_ZERO
    const metrics: Record<string, number> = {
      dualityPatterns: patterns,
      dualityCoefficientMismatches: mismatches,
      dualityOmegaParts: omegaParts,
      patchLinks: links.length,
      quietConnectedNonzero: quiet.filter(c => c.num !== 0n).length,
      pairedConnectedPositive: paired.filter(c => c.num > 0n).length,
      lambda0: l0,
      lambda1: l1,
      lambda2: l2,
      predictedRate,
      measuredRateAtGap29: measuredRate,
      rateRelativeError: measuredRate / predictedRate - 1,
      bareStringRate: Math.log(l0 * 30),
      baryonMatrixIsXSquaredIdentity: baryonIsIdentity ? 1 : 0,
      baryonConnectedNonzero: baryonQuiet.filter(c => c.num !== 0n).length,
      baryonPairedWorstPotential: baryonPairedWorst,
      mPredBulk: mBulk,
      mPredHusk: mHusk,
      oneStringOvertakesAtLinks: nStar,
      gateDuality: g1 ? 1 : 0,
      gateNoPairsNoJoin: g2 ? 1 : 0,
      gatePairsYukawa: g3 ? 1 : 0,
      gateInertBaryon: g4 ? 1 : 0,
    }

    for (const gap of [0, 1, 2, 5, 10, 15, 20, 25]) {
      metrics[`pairedConnectedGap${gap}`] = rationalValue(paired[gap] as Rational)
      metrics[`pairedFlippedConnectedGap${gap}`] = rationalValue(pairedFlipped[gap] as Rational)
      metrics[`pairedRateGap${gap}`] = rateAt(paired, gap)
    }

    profile.bulk.filter(inWindow).forEach(s => (metrics[`leadingBulkR${s.r.toFixed(3)}`] = s.value))
    profile.husk.filter(inWindow).forEach(s => (metrics[`leadingHuskR${s.r.toFixed(3)}`] = s.value))

    const ok = g1 && g2 && g3 && g4

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `pair making is a magnetic field on the dual Potts model (exact on ${patterns} patterns of a D4 patch, ${mismatches} mismatched coefficients, ${omegaParts} omega parts); on the line two static mesons are exactly unjoined without pairs (${quiet.filter(c => c.num !== 0n).length} of ${quiet.length} gaps nonzero) and with pairs (x = 1/30, y = 1/10) attract at every gap, the connected ratio ${rationalValue(paired[0] as Rational).toExponential(3)} at contact falling at ${measuredRate.toFixed(6)} per cell against ln(lambda0 / lambda1) = ${predictedRate.toFixed(6)}; the line's static baryon is x^2 times the identity and couples to nothing; the leading-order D4 string gives m_pred = ${mBulk.toFixed(3)} (bulk) and ${mHusk.toFixed(3)} (husk) at x = 1/30, and one string overtakes two from ${nStar.toFixed(2)} links`,
      metrics,
      control: {
        noPairsConnectedAtContact: rationalValue(quiet[0] as Rational),
        pairedConnectedAtContact: rationalValue(paired[0] as Rational),
      },
      notes:
        'L1. Stand-ins: color singlets of the paid-string measure for nucleons. The duality is checked as exact integer and Eisenstein polynomials (no tolerance). The line is solved by exact BigInt transfer matrices on a ring of 120 cells (x = 1/30, y = 1/10, the whole numbers of each scaled matrix cancel in the double ratio), and its correction to the infinite line is (lambda1 / lambda0)^90, below 1e-130. The rate is read from the exact fractions at gaps 29 and 30, where the second flux eigenvalue lambda2 still contributes (lambda2 / lambda1)^30. The D4 prediction is leading order in x: shortest paths only, no loops, no dressing, no excluded volume, so it predicts the SHAPE (one string, the meson\'s own rate) and a number to test, not a precise mass. A static source cannot be run in the rule itself: the links at an occupied dock change only when a charge crosses them, so a pinned charge freezes its own flux (E-FRC-0196); the static potentials here are those of the measure the demons impose, and E-FRC-0189 checks that the line\'s dynamics samples that measure.',
    })
  },
})
