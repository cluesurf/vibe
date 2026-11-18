// CKW on the knit's three-role knots, decided reading by reading (OPEN-QTM-04).
//
// E-QTM-0153 read Coffman-Kundu-Wootters, tau_(A|BC) >= C_AB^2 + C_AC^2, on 480 readings of the knit's matter
// triple (the committed start over 480 beats and the 16 other start-family members over 120, read every 10
// beats, two fear laws: the swap phase at 2 pi / 3 and the color law). The measure is the one that run used,
// the generalized concurrence of Rungta et al. (2001), C(psi) = sqrt(2 (1 - Tr rho_A^2)), its convex roof
// on the two-role marginals, and tau_(A|BC) = 2 (1 - Tr rho_A^2) on the three-role whole. Its roof was bounded
// only by the eigen-decomposition from above and Chen-Albeverio-Fei from below, which left 377 undecided.
//
// Here the same readings are regenerated and each roof is bounded tighter:
// - above, by the least sum over decompositions found by gradient descent on the isometries of the
//   Hughston-Jozsa-Wootters theorem (code/measure/concurrence-roof), K = r^2 + 1 members, from the eigen
//   decomposition and 8 Weyl isometries, 1,500 steps each. Any decomposition is an upper bound, so the
//   descent can only certify CKW held, never fake it.
// - below, by the larger of Chen-Albeverio-Fei and Mintert-Buchleitner (2007).
// A reading is held when the upper bounds give C_AB^2 + C_AC^2 <= tau - 1e-9, broken when the lower bounds give
// more than tau + 1e-9, and undecided otherwise. When tau < 1e-12 the role A is a product with BC, so both
// concurrences vanish and the reading is held by structure.
//
// Gates, fixed before the first run of this file:
// G1 the same readings: 480 of them, and the eigen-decomposition and Chen-Albeverio-Fei bounds give E-QTM-0153's
//    tally exactly, 103 held, 377 undecided, 0 broken
// G2 the bounds are sound on every reading: each lower bound at most the optimized upper bound plus 1e-9, the
//    optimized upper at most the eigen upper, every returned decomposition reconstructs its marginal within
//    1e-10, and every whole is pure (Tr rho^2 within 1e-9 of 1)
// G3 controls: on the two-qutrit isotropic state of fidelity 0.8, whose roof is known exactly (Rungta and Caves
//    2003, C = sqrt 3 (F - 1/3) = 0.80829), the optimized upper bound lands within 1e-3 above it and the
//    eigen-decomposition bound is above it by more than 0.05; on Ou's antisymmetric stand-in CKW is certified
//    broken (its marginals lie in the antisymmetric subspace, C = 1 exactly, tau = 4/3)
// G4 every one of the 480 readings is decided, and none is broken (the prediction: CKW holds on the knit)
//
// Depth L2: the model's own triples, with a known measure bounded from both sides by certificates.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeColorWeave } from '@/code/rule/color-weave'
import {
  advanceWhole,
  fearKernels,
  meetingKernel,
  physicalWhole,
  swapPhase,
  type BeatRecord,
  type FearKernels,
  type Whole,
} from '@/code/rule/fear-weave'
import {
  classicalRecords,
  weylBackground,
} from '@/code/measure/knit-magic'
import { productWeights } from '@/code/measure/stabilizer-contexts'
import {
  concurrenceBounds,
  densityOf,
  partialTrace,
} from '@/code/measure/knot-entanglement'
import {
  roofLowerSquared,
  roofUpper,
} from '@/code/measure/concurrence-roof'
import { operator, type Operator } from '@/code/measure/grid-weights'
import { startFamily, withStart } from '@/code/measure/start-ensemble'

const OMEGA = (2 * Math.PI) / 3
const BEATS = 480
const FAMILY_BEATS = 120
const SAMPLE = 10
const MATTER_SCALE = 2.11
const STARTS = 8
const STEPS = 1500
const MARGIN = 1e-9

const basis = (j: number): bigint[] =>
  Array.from({ length: 9 }, (_, q) =>
    Math.floor(q / 3) === j ? 1n : 0n,
  )

type Triple = { tokens: [number, number, number]; meetings: number }

function findTriple(records: readonly BeatRecord[]): Triple | null {
  const count = new Map<string, number>()

  for (const r of records) {
    for (const [x, y] of r.meetings) {
      const key = `${Math.min(x, y)},${Math.max(x, y)}`

      count.set(key, (count.get(key) ?? 0) + 1)
    }
  }

  let best: Triple | null = null

  for (let a = 0; a < 24; a++) {
    for (let b = a + 1; b < 24; b++) {
      for (let c = b + 1; c < 24; c++) {
        const m = [
          count.get(`${a},${b}`),
          count.get(`${a},${c}`),
          count.get(`${b},${c}`),
        ]

        if (m.every(x => (x ?? 0) > 0)) {
          const total = m.reduce((s: number, x) => s + (x ?? 0), 0)

          if (!best || total > best.meetings) {
            best = { tokens: [a, b, c], meetings: total }
          }
        }
      }
    }
  }

  return best
}

const purityOf = (rho: Operator): number => {
  let s = 0

  for (let k = 0; k < rho.n * rho.n; k++) {
    s += (rho.re[k] ?? 0) ** 2 + (rho.im[k] ?? 0) ** 2
  }

  return s
}

const tauOf = (rho: Operator): number =>
  2 * (1 - purityOf(partialTrace(rho, 3, [0])))

function pureDensity(re: readonly number[]): Operator {
  const n = re.length
  const out = operator(n)

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      out.re[i * n + j] = (re[i] ?? 0) * (re[j] ?? 0)
    }
  }

  return out
}

export default experiment({
  id: 'quantum/ckw-roof-decided',
  code: 'E-QTM-0193',
  title:
    "CKW on the knit's three-role knots decided reading by reading: E-QTM-0153's 480 readings regenerated, each two-role concurrence roof bounded above by an optimized decomposition and below by Chen-Albeverio-Fei and Mintert-Buchleitner",
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const colorOn = fearKernels({ like: OMEGA, unlike: OMEGA })!
    const kThird = meetingKernel(swapPhase(OMEGA)) ?? []

    let seed = 900000

    const roof = (rho: Operator) => {
      seed += 100

      return roofUpper({ rho, starts: STARTS, steps: STEPS, seed })
    }

    // G3 controls
    const phi = new Array<number>(9).fill(0)

    for (let i = 0; i < 3; i++) {
      phi[4 * i] = 1 / Math.sqrt(3)
    }

    const fidelity = 0.8
    const isotropic = operator(9)
    const projector = pureDensity(phi)

    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        const p = projector.re[i * 9 + j] ?? 0
        const id = i === j ? 1 : 0

        isotropic.re[i * 9 + j] =
          fidelity * p + ((1 - fidelity) * (id - p)) / 8
      }
    }

    const isotropicExact = Math.sqrt(3) * (fidelity - 1 / 3)
    const isotropicRoof = roof(isotropic)
    // diagnosis added after the first run: the same control with 3 times the starts and 8/3 the steps
    const isotropicLarger = roofUpper({
      rho: isotropic,
      starts: 3 * STARTS,
      steps: 4000,
      seed: 950000,
    })
    const isotropicLower = Math.sqrt(
      Math.max(0, roofLowerSquared(isotropic)),
    )
    const g3Isotropic =
      isotropicRoof.upper >= isotropicExact - 1e-9 &&
      isotropicRoof.upper <= isotropicExact + 1e-3 &&
      isotropicRoof.eigenUpper > isotropicExact + 0.05 &&
      isotropicLower <= isotropicExact + 1e-9

    const antisymmetric = new Array<number>(27).fill(0)

    for (const [i, j, k, s] of [
      [0, 1, 2, 1],
      [1, 2, 0, 1],
      [2, 0, 1, 1],
      [0, 2, 1, -1],
      [2, 1, 0, -1],
      [1, 0, 2, -1],
    ] as const) {
      antisymmetric[9 * i + 3 * j + k] = s / Math.sqrt(6)
    }

    const standIn = pureDensity(antisymmetric)
    const standInAB = concurrenceBounds(partialTrace(standIn, 3, [0, 1]))
    const standInAC = concurrenceBounds(partialTrace(standIn, 3, [0, 2]))
    const standInTau = tauOf(standIn)
    const g3StandIn =
      standInAB.exact === 1 &&
      standInAC.exact === 1 &&
      2 > standInTau + MARGIN

    // the knit's readings
    const tally = {
      readings: 0,
      oldHeld: 0,
      oldBroken: 0,
      oldUndecided: 0,
      held: 0,
      heldByStructure: 0,
      broken: 0,
      undecided: 0,
      soundnessFailures: 0,
      worstResidual: 0,
      worstPurityGap: 0,
      leastHeldMargin: Number.POSITIVE_INFINITY,
      largestUndecidedGap: 0,
      largestRatio: 0,
      eigenGainLargest: 0,
      rankThree: 0,
      secondPass: 0,
      lowerAboveUpper: 0,
      lowerExcess: 0,
      lowerAboveRank: 0,
      lowerAboveFromCaf: 0,
      lowerAboveFromMb: 0,
      lowerAboveEigenUpper: 0,
      lowerAboveOldUpper: 0,
      upperAboveEigen: 0,
      leastUndecidedUpperRatio: Number.POSITIVE_INFINITY,
      largestUndecidedLowerRatio: 0,
      pinned: 0,
      openUpperRatioLeast: Number.POSITIVE_INFINITY,
      openLowerRatioMost: 0,
    }

    const readTriples = (beats: number): void => {
      const weave = makeColorWeave({ side: 3, table: 'pair' })
      const slots = weave.mesh.cellCount * 24
      const records = classicalRecords({
        weave,
        links: weave.links,
        background: weylBackground({ slots, scale: MATTER_SCALE }),
        open: Array.from({ length: 24 }, (_, d) => d),
        beats,
      })
      const found = findTriple(records)

      if (!found) {
        return
      }

      const inTriple = (t: number): boolean => found.tokens.includes(t)
      const mine: BeatRecord[] = records.map(r => {
        const keep = r.meetings.map(
          ([x, y]) => inTriple(x) && inTriple(y),
        )

        return {
          meetings: r.meetings.filter((_, k) => keep[k]),
          signs: (r.signs ?? []).filter((_, k) => keep[k]),
          crossings: r.crossings.filter(([tk]) => inTriple(tk)),
        }
      })

      const laws: {
        kernel4: readonly (readonly number[])[]
        color?: FearKernels
      }[] = [{ kernel4: kThird }, { kernel4: [], color: colorOn }]

      for (const law of laws) {
        let whole: Whole = {
          tokens: found.tokens,
          weight: productWeights(
            basis(0),
            productWeights(basis(1), basis(2)),
          ),
        }

        for (let t = 0; t < mine.length; t++) {
          whole = advanceWhole({
            weave,
            whole,
            record: mine[t]!,
            kernel4: law.kernel4,
            color: law.color,
            fixed: false,
            forward: true,
          })!

          if ((t + 1) % SAMPLE !== 0) {
            continue
          }

          const weight = law.color
            ? physicalWhole(whole).weight
            : whole.weight
          const rho = densityOf(weight, 3)
          const ab = partialTrace(rho, 3, [0, 1])
          const ac = partialTrace(rho, 3, [0, 2])
          const tau = tauOf(rho)
          const oldAB = concurrenceBounds(ab)
          const oldAC = concurrenceBounds(ac)

          tally.readings++
          tally.worstPurityGap = Math.max(
            tally.worstPurityGap,
            Math.abs(purityOf(rho) - 1),
          )

          // E-QTM-0153's reading, reproduced
          if (
            (oldAB.exact ?? oldAB.lower) ** 2 +
              (oldAC.exact ?? oldAC.lower) ** 2 >
            tau + 1e-9
          ) {
            tally.oldBroken++
          } else if (
            (oldAB.exact ?? oldAB.upper) ** 2 +
              (oldAC.exact ?? oldAC.upper) ** 2 <=
            tau + 1e-9
          ) {
            tally.oldHeld++
          } else {
            tally.oldUndecided++
          }

          if (tau < 1e-12) {
            tally.held++
            tally.heldByStructure++
            continue
          }

          let upAB = roof(ab)
          let upAC = roof(ac)

          // second pass, added after the first run (disclosed in the notes): a reading the first budget leaves
          // undecided is descended again with 3 times the starts and 8/3 the steps
          if (
            upAB.upper ** 2 + upAC.upper ** 2 > tau - MARGIN &&
            tau >= 1e-12
          ) {
            seed += 100
            upAB = roofUpper({ rho: ab, starts: 3 * STARTS, steps: 4000, seed })
            seed += 100
            upAC = roofUpper({ rho: ac, starts: 3 * STARTS, steps: 4000, seed })
            tally.secondPass++
          }
          const lowAB = Math.max(
            oldAB.lower,
            Math.sqrt(Math.max(0, roofLowerSquared(ab))),
          )
          const lowAC = Math.max(
            oldAC.lower,
            Math.sqrt(Math.max(0, roofLowerSquared(ac))),
          )

          tally.rankThree += upAB.rank === 3 && upAC.rank === 3 ? 1 : 0
          tally.worstResidual = Math.max(
            tally.worstResidual,
            upAB.residual,
            upAC.residual,
          )

          if (
            lowAB > upAB.upper + 1e-9 ||
            lowAC > upAC.upper + 1e-9 ||
            upAB.upper > upAB.eigenUpper + 1e-12 ||
            upAC.upper > upAC.eigenUpper + 1e-12
          ) {
            tally.soundnessFailures++
          }

          // diagnosis of a soundness failure, by kind (added after the first run)
          for (const [low, up, old] of [
            [lowAB, upAB, oldAB],
            [lowAC, upAC, oldAC],
          ] as const) {
            if (low > up.upper + 1e-9) {
              const mb = Math.sqrt(Math.max(0, roofLowerSquared(old === oldAB ? ab : ac)))

              tally.lowerAboveUpper++
              tally.lowerExcess = Math.max(tally.lowerExcess, low - up.upper)
              tally.lowerAboveRank = up.rank
              tally.lowerAboveFromCaf += old.lower > up.upper + 1e-9 ? 1 : 0
              tally.lowerAboveFromMb += mb > up.upper + 1e-9 ? 1 : 0
              tally.lowerAboveEigenUpper = up.eigenUpper
              tally.lowerAboveOldUpper = old.upper
            }

            if (up.upper > up.eigenUpper + 1e-12) {
              tally.upperAboveEigen++
            }
          }

          tally.eigenGainLargest = Math.max(
            tally.eigenGainLargest,
            upAB.eigenUpper - upAB.upper,
            upAC.eigenUpper - upAC.upper,
          )

          const upperSum = upAB.upper ** 2 + upAC.upper ** 2
          const lowerSum = lowAB ** 2 + lowAC ** 2

          tally.largestRatio = Math.max(tally.largestRatio, upperSum / tau)

          if (lowerSum > tau + MARGIN) {
            tally.broken++
          } else if (upperSum <= tau - MARGIN) {
            tally.held++
            tally.leastHeldMargin = Math.min(
              tally.leastHeldMargin,
              tau - upperSum,
            )
          } else {
            tally.undecided++

            // pinned: both bounds meet tau within 1e-6, so C_AB^2 + C_AC^2 = tau to that tolerance (added after
            // the second run, which showed undecided readings with both ratios at 1 to 1e-14)
            if (
              Math.abs(upperSum - tau) < 1e-6 &&
              Math.abs(lowerSum - tau) < 1e-6
            ) {
              tally.pinned++
            } else {
              tally.openUpperRatioLeast = Math.min(
                tally.openUpperRatioLeast,
                upperSum / tau,
              )
              tally.openLowerRatioMost = Math.max(
                tally.openLowerRatioMost,
                lowerSum / tau,
              )
            }

            tally.leastUndecidedUpperRatio = Math.min(
              tally.leastUndecidedUpperRatio,
              upperSum / tau,
            )
            tally.largestUndecidedLowerRatio = Math.max(
              tally.largestUndecidedLowerRatio,
              lowerSum / tau,
            )
            tally.largestUndecidedGap = Math.max(
              tally.largestUndecidedGap,
              upperSum - lowerSum,
            )
          }
        }
      }
    }

    readTriples(BEATS)

    const family = startFamily(16)

    for (const member of family.slice(1)) {
      withStart(member, () => readTriples(FAMILY_BEATS))
    }

    const g1 =
      tally.readings === 480 &&
      tally.oldHeld === 103 &&
      tally.oldUndecided === 377 &&
      tally.oldBroken === 0
    const g2 =
      tally.soundnessFailures === 0 &&
      tally.worstResidual < 1e-10 &&
      tally.worstPurityGap < 1e-9
    const g3 = g3Isotropic && g3StandIn
    const g4 = tally.undecided === 0 && tally.broken === 0

    return verdict({
      status: g1 && g2 && g3 ? (g4 ? 'pass' : 'partial') : 'fail',
      claim: `CKW on the knit's ${tally.readings} three-role readings (E-QTM-0153's, reproduced: ${tally.oldHeld} held, ${tally.oldUndecided} undecided, ${tally.oldBroken} broken by its bounds): with each two-role roof bounded above by an optimized decomposition and below by Chen-Albeverio-Fei and Mintert-Buchleitner, ${tally.held} held (${tally.heldByStructure} by structure, tau = 0), ${tally.broken} broken and ${tally.undecided} undecided; the least held margin tau - (C_AB^2 + C_AC^2) is ${tally.leastHeldMargin.toExponential(3)} and the largest upper ratio (C_AB^2 + C_AC^2) / tau ${tally.largestRatio.toFixed(6)}; controls: the isotropic roof ${isotropicRoof.upper.toFixed(6)} against the exact ${isotropicExact.toFixed(6)} (eigen ${isotropicRoof.eigenUpper.toFixed(6)}), Ou's antisymmetric stand-in broken`,
      metrics: {
        gateSameReadings: g1 ? 1 : 0,
        gateSound: g2 ? 1 : 0,
        gateControls: g3 ? 1 : 0,
        gateAllDecided: g4 ? 1 : 0,
        readings: tally.readings,
        eigenHeld: tally.oldHeld,
        eigenUndecided: tally.oldUndecided,
        eigenBroken: tally.oldBroken,
        held: tally.held,
        heldByStructure: tally.heldByStructure,
        broken: tally.broken,
        undecided: tally.undecided,
        leastHeldMargin: tally.leastHeldMargin,
        largestUpperRatio: tally.largestRatio,
        largestUndecidedGap: tally.largestUndecidedGap,
        largestGainOverEigen: tally.eigenGainLargest,
        readingsBothMarginalsRankThree: tally.rankThree,
        soundnessFailures: tally.soundnessFailures,
        worstDecompositionResidual: tally.worstResidual,
        worstPurityGap: tally.worstPurityGap,
        secondPassReadings: tally.secondPass,
        diagnosisLowerAboveUpper: tally.lowerAboveUpper,
        diagnosisLowerExcess: tally.lowerExcess,
        diagnosisLowerAboveRank: tally.lowerAboveRank,
        diagnosisLowerAboveFromChenAlbeverioFei: tally.lowerAboveFromCaf,
        diagnosisLowerAboveFromMintertBuchleitner: tally.lowerAboveFromMb,
        diagnosisLowerAboveEigenUpper: tally.lowerAboveEigenUpper,
        diagnosisLowerAboveOldUpper: tally.lowerAboveOldUpper,
        diagnosisUpperAboveEigen: tally.upperAboveEigen,
        leastUndecidedUpperRatio: tally.leastUndecidedUpperRatio,
        largestUndecidedLowerRatio: tally.largestUndecidedLowerRatio,
        isotropicLargerBudgetUpper: isotropicLarger.upper,
        undecidedPinnedAtTau: tally.pinned,
        undecidedOpen: tally.undecided - tally.pinned,
        openUpperRatioLeast: tally.openUpperRatioLeast,
        openLowerRatioMost: tally.openLowerRatioMost,
      },
      control: {
        isotropicExact,
        isotropicOptimizedUpper: isotropicRoof.upper,
        isotropicEigenUpper: isotropicRoof.eigenUpper,
        isotropicLower,
        standInTau,
        standInConcurrenceSquaredSum: 2,
      },
      notes: `FIRST RUN 2026-10-27 (test/record/E-QTM-0193/run1.log, 289 s): fail, gates unchanged. G1 passed (the same 480 readings, 103 / 377 / 0 by the old bounds). G4: 448 held (76 by structure), 0 broken, 32 undecided. G2 failed on 1 reading where a lower bound exceeded the optimized upper bound, and G3 failed on the isotropic control (optimized 0.83198 against the formula's 0.80829, eigen 0.97376, Mintert-Buchleitner lower 0.78951). On 60 Weyl-random three-qutrit pure states neither lower bound ever exceeded the optimized upper (tmp/q22-probe-b.ts). The second run adds, without changing a gate, a larger-budget second pass on readings the first budget leaves undecided, the same larger budget on the isotropic control, and diagnosis metrics that name which lower bound exceeded which upper. A held verdict rests on a returned decomposition alone, so it is unaffected by any fault in a lower bound. SECOND RUN (run2.log, 489 s): the same counts, the second pass moved none of the 32. The one soundness failure is Mintert-Buchleitner exceeding a rank-2 upper by 2.6e-8: on a marginal whose roof is near 0, rounding of 1e-16 in C^2 becomes 1e-8 in C through the square root, so the gate tolerance, not the bound, failed. The isotropic control at the larger budget reaches 0.82333, still above 0.80829: either the descent is weak at rank 9 (82 members) or the closed form quoted for the control is not the roof of this measure, which this file does not settle. THIRD RUN (run3.log), the undecided split: 2 are pinned (both bounds meet tau within 1e-6, so C_AB^2 + C_AC^2 = tau and CKW holds with equality) and 30 stay open, where the best decomposition found gives C_AB^2 + C_AC^2 at tau or above (least ratio 0.99999999999999) and the two lower bounds reach at most 0.631 tau. On these 30 the knit sits at CKW saturation or just past it, and the measure's two published lower bounds are too loose to say which. ${STARTS} Weyl starts plus the eigen decomposition, ${STEPS} Armijo steps each, K = r^2 + 1 members, decision margin ${MARGIN}. Held is certified by a returned decomposition (any decomposition bounds the roof from above), broken by the two published lower bounds. Floats throughout: the margins are compared with the decomposition residual and the purity gap, both reported.`,
    })
  },
})
