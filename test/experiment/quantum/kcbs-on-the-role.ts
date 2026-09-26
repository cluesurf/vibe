// KCBS on the role qutrit: how large is the pentagram violation among the states the knit reaches, and does
// it track fear (Wigner negativity) state by state?
//
// Klyachko, Can, Binicioglu and Shumovsky (2008): five projectors P_k onto unit vectors with v_k orthogonal
// to v_(k+1) (a pentagon of exclusivity) obey sum p_k <= 2 in any noncontextual model (the independence
// number of the 5-cycle), and quantum states reach sqrt 5 (its Lovasz number) with the regular pentagram.
// Howard, Wallman, Veitch and Emerson (2014) proved negativity equivalent to contextuality in odd prime
// dimension, but for contextuality with respect to STABILIZER measurements. KCBS uses five arbitrary
// vectors. Two readings of the question follow, each with its answer derived before the run:
//
// Aligned: the pentagram whose axis is the -1 eigenvector of a phase-point operator A(u) (A(u) = 1 - 2 Pi_u,
// Pi_u rank one). Then p_axis = (1 - 3 W(u)) / 2 and the KCBS value is exactly
//   K_u = (5 - sqrt 5) / 2 + (3 sqrt 5 - 5) / 2 x (1 - 3 W(u)) / 2,
// which passes 2 exactly when W(u) < -sqrt 5 / 15 = -0.149 and reaches sqrt 5 only at W(u) = -1/3, the
// Strange state. So in the grid's own frame a violation IMPLIES fear at u, and fear does not imply a
// violation (a fear shallower than -sqrt 5 / 15 gives none).
//
// Free: the pentagram in its best orientation, whose value depends only on the state's spectrum, r1 sqrt 5 +
// (1 - r1)(5 - sqrt 5) / 2 (von Neumann's trace inequality). It is blind to the grid, so it cannot track
// negativity, which is only Clifford-invariant: a pure stabilizer state, with no fear, reaches sqrt 5.
//
// Why HWVE's theorem does not reach KCBS on one qutrit, checked: the 12 stabilizer states of a qutrit are
// orthogonal only within their own basis, so their exclusivity graph is 4 disjoint triangles, with no
// pentagon at all.
//
// States: every reduced one-role state of every two-role whole the knit reaches (code/measure/knit-magic,
// the same histories as E-QTM-0119: side-3 D4 box, live links, vacuum and matter, 480 beats, every meeting
// pair of dock 0, three starts, swap phase and color law), after every beat, both tokens. The color law
// stores a fear's role at the reflected point, which maps W to the Wigner function of the conjugate state,
// with the same spectrum and the same multiset of weights, so both readings are unchanged by it.
//
// Gates, fixed before the first run:
// - the classical bound is 2 by enumeration of the 32 labelings of the pentagon; the pentagram's consecutive
//   vectors are orthogonal to 1e-12 and its projector sum has eigenvalues (5 - sqrt 5)/2 twice and sqrt 5
// - the 12 stabilizer states form 4 disjoint triangles of orthogonality and contain 0 pentagons
// - on every state, the pentagram built explicitly on A(u)'s axis at the most negative point equals the
//   closed form to 1e-10
// - aligned: 0 states violate without fear, and 0 mismatches between "violates" and "W(u) < -sqrt 5 / 15"
// - free: at least one fear-free reached state reaches sqrt 5 to 1e-9
// Reported: the largest aligned and free values over the reached states, the counts, and the correlation of
// each with the negativity across states.
//
// First run, 2026-09-25: every gate passed as fixed, but the reported maxima, 2.334 aligned and 2.343 free,
// exceed the quantum maximum sqrt 5 and the deepest weight -0.410 is below a qutrit's floor of -1/3. A probe
// (tmp/probe-color-validity.ts) found why: the color law's wholes are not always states. Rebuilt as rho =
// sum W A, 299 of 2,016 sampled color-law wholes have a negative eigenvalue under every fixed reading of the
// fear convention (neither coordinate, either, or both reflected), since a token's sign can change between
// meetings; all 2,016 swap-phase wholes are states. The gates did not move. After that run the maxima were
// split by law and the reduced states outside the state space counted (reported, not gated), and the
// headline numbers are the swap-phase ones. Second run: under the swap phase 0 of 80,808 reduced states lie
// outside the state space, the deepest weight is -1/3, and the largest aligned and free values are both
// sqrt 5 (31,583 aligned violations); under the color law 5,848 of 80,808 lie outside, and they carry the
// values above sqrt 5.
//
// Depth L2: a known inequality evaluated on the states a constructed rule reaches; the two relations are
// derived exactly and the rule's states are checked against them.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeColorWeave } from '@/code/rule/color-weave'
import { fearKernels, meetingKernel, swapPhase, wholeUnits, type Whole } from '@/code/rule/fear-weave'
import {
  classicalRecords,
  meetingPairs,
  pairRecords,
  productWhole,
  runWhole,
  vacuumBackground,
  weylBackground,
  type RoleState,
} from '@/code/measure/knit-magic'
import { displacement, phasePoint } from '@/code/measure/qutrit-phase-space'
import { operator, type Operator } from '@/code/measure/grid-weights'
import {
  hermitianEigenvectors,
  hermitianSpectrum,
  innerProduct,
  KCBS_NEGATIVITY_THRESHOLD,
  kcbsAligned,
  kcbsBestOrientation,
  kcbsVectors,
  operatorFrom3,
  operatorFromWigner,
} from '@/code/measure/qutrit-clifford'

const OMEGA = (2 * Math.PI) / 3
const SIDE = 3
const BEATS = 480
const MATTER_SCALE = 2.11
const SQRT5 = Math.sqrt(5)
const STARTS: readonly (readonly [RoleState, RoleState])[] = [
  ['basis0', 'basis1'],
  ['strange', 'basis0'],
  ['strange', 'strange'],
]
const MIX = 0.371

function pearson(x: readonly number[], y: readonly number[]): number {
  const n = x.length
  const mx = x.reduce((s, v) => s + v, 0) / n
  const my = y.reduce((s, v) => s + v, 0) / n
  let sxy = 0
  let sxx = 0
  let syy = 0

  for (let i = 0; i < n; i++) {
    sxy += ((x[i] ?? 0) - mx) * ((y[i] ?? 0) - my)
    sxx += ((x[i] ?? 0) - mx) ** 2
    syy += ((y[i] ?? 0) - my) ** 2
  }

  return sxx > 0 && syy > 0 ? sxy / Math.sqrt(sxx * syy) : 0
}

// the two one-role marginals of a two-role whole, as weights summing to 1
function marginals(whole: Whole): [number[], number[]] {
  const units = Number(wholeUnits(whole))
  const first = new Array<number>(9).fill(0)
  const second = new Array<number>(9).fill(0)

  whole.weight.forEach((w, i) => {
    const x = Math.floor(i / 9)
    const y = i % 9

    first[x] = (first[x] ?? 0) + Number(w) / units
    second[y] = (second[y] ?? 0) + Number(w) / units
  })

  return [first, second]
}

export default experiment({
  id: 'quantum/kcbs-on-the-role',
  code: 'E-QTM-0120',
  title:
    'KCBS on the role qutrit: in the grid\'s own frame a pentagram violation happens exactly when a role\'s Wigner weight falls below -sqrt 5 / 15, so violation implies fear but fear does not imply violation, while the pentagram in its best orientation sees only the spectrum and is violated maximally by fear-free states; the stabilizer states hold no pentagon, so KCBS is not the contextuality that equals negativity',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // the inequality and the pentagram
    let classicalBound = 0

    for (let mask = 0; mask < 32; mask++) {
      const ok = [0, 1, 2, 3, 4].every(k => !((mask >> k) & 1 && (mask >> ((k + 1) % 5)) & 1))

      if (ok) {
        classicalBound = Math.max(classicalBound, [0, 1, 2, 3, 4].filter(k => (mask >> k) & 1).length)
      }
    }

    const identity3 = operator(3)

    for (let i = 0; i < 3; i++) {
      identity3.re[i * 3 + i] = 1
    }

    const standard = kcbsVectors(identity3)
    let orthogonality = 0

    for (let k = 0; k < 5; k++) {
      const a = standard.vectors[k]
      const b = standard.vectors[(k + 1) % 5]
      let re = 0
      let im = 0

      for (let i = 0; i < 3; i++) {
        re += (a?.re[i] ?? 0) * (b?.re[i] ?? 0) + (a?.im[i] ?? 0) * (b?.im[i] ?? 0)
        im += (a?.re[i] ?? 0) * (b?.im[i] ?? 0) - (a?.im[i] ?? 0) * (b?.re[i] ?? 0)
      }

      orthogonality = Math.max(orthogonality, Math.hypot(re, im))
    }

    const sumSpectrum = hermitianSpectrum(standard.sum)
    const spectrumError = Math.max(
      Math.abs((sumSpectrum[0] ?? 0) - (5 - SQRT5) / 2),
      Math.abs((sumSpectrum[1] ?? 0) - (5 - SQRT5) / 2),
      Math.abs((sumSpectrum[2] ?? 0) - SQRT5),
    )

    // the 12 stabilizer states and their exclusivity graph
    const stabilizer: { re: number[]; im: number[] }[] = []

    for (const [a, b] of [
      [1, 0],
      [0, 1],
      [1, 1],
      [1, 2],
    ] as const) {
      const d = operatorFrom3(displacement(a, b))
      const h = operator(3)

      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const dr = d.re[i * 3 + j] ?? 0
          const di = d.im[i * 3 + j] ?? 0
          const tr = d.re[j * 3 + i] ?? 0
          const ti = -(d.im[j * 3 + i] ?? 0)

          // (d + d^dagger) / 2 + MIX (d - d^dagger) / 2i
          h.re[i * 3 + j] = (dr + tr) / 2 + (MIX * (di - ti)) / 2
          h.im[i * 3 + j] = (di + ti) / 2 - (MIX * (dr - tr)) / 2
        }
      }

      const { vectors } = hermitianEigenvectors(h)

      for (let c = 0; c < 3; c++) {
        stabilizer.push({
          re: [0, 1, 2].map(i => vectors.re[i * 3 + c] ?? 0),
          im: [0, 1, 2].map(i => vectors.im[i * 3 + c] ?? 0),
        })
      }
    }

    const orthogonal = (x: number, y: number): boolean => {
      const a = stabilizer[x]
      const b = stabilizer[y]
      let re = 0
      let im = 0

      for (let i = 0; i < 3; i++) {
        re += (a?.re[i] ?? 0) * (b?.re[i] ?? 0) + (a?.im[i] ?? 0) * (b?.im[i] ?? 0)
        im += (a?.re[i] ?? 0) * (b?.im[i] ?? 0) - (a?.im[i] ?? 0) * (b?.re[i] ?? 0)
      }

      return Math.hypot(re, im) < 1e-9
    }

    let edges = 0
    let edgesWithinBasis = 0

    for (let x = 0; x < 12; x++) {
      for (let y = x + 1; y < 12; y++) {
        if (orthogonal(x, y)) {
          edges++
          edgesWithinBasis += Math.floor(x / 3) === Math.floor(y / 3) ? 1 : 0
        }
      }
    }

    // pentagons: 5-cycles of orthogonality among distinct stabilizer states
    let pentagons = 0

    for (let a = 0; a < 12; a++) {
      for (let b = 0; b < 12; b++) {
        for (let c = 0; c < 12; c++) {
          for (let d = 0; d < 12; d++) {
            for (let e = 0; e < 12; e++) {
              const cycle = [a, b, c, d, e]

              if (new Set(cycle).size === 5 && cycle.every((x, k) => orthogonal(x, cycle[(k + 1) % 5] ?? x))) {
                pentagons++
              }
            }
          }
        }
      }
    }

    // the phase-point axes: the -1 eigenvector of A(u) first, as the frame's first column
    const frames: Operator[] = [0, 1, 2].flatMap(a => [0, 1, 2].map(b => hermitianEigenvectors(operatorFrom3(phasePoint(a, b))).vectors))
    const onePoints = [0, 1, 2].flatMap(a => [0, 1, 2].map(b => operatorFrom3(phasePoint(a, b))))
    const alignedOperators = frames.map(f => kcbsVectors(f).sum)

    // the reached states
    const weave = makeColorWeave({ side: SIDE, table: 'pair' })
    const slots = weave.mesh.cellCount * 24
    const kThird = meetingKernel(swapPhase(OMEGA)) ?? []
    const colorOn = fearKernels({ like: OMEGA, unlike: OMEGA }) ?? undefined
    const dock0 = Array.from({ length: 24 }, (_, d) => d)
    let states = 0
    let fearStates = 0
    let alignedViolations = 0
    let violationWithoutFear = 0
    let fearWithoutViolation = 0
    let equivalenceMismatch = 0
    let closedFormError = 0
    let maxAligned = 0
    let maxFree = 0
    let fearFreeAtSqrt5 = 0
    let freeViolations = 0
    let deepestWeight = 0
    const negativities: number[] = []
    const alignedValues: number[] = []
    const freeValues: number[] = []

    // reported after the first run, not gated: the same maxima split by law, and how many reduced states are
    // outside the state space (a negative eigenvalue), since the color law's wholes are not always states
    const byLaw = [
      { maxAligned: 0, maxFree: 0, violations: 0, states: 0, outside: 0, deepest: 0 },
      { maxAligned: 0, maxFree: 0, violations: 0, states: 0, outside: 0, deepest: 0 },
    ]
    let lawIndex = 0

    const visit = (w: readonly number[]): void => {
      const minimum = Math.min(...w)
      const at = w.indexOf(minimum)
      const negativity = w.reduce((s, x) => s + (x < 0 ? -x : 0), 0)
      const rho = operatorFromWigner(w, onePoints)
      const direct = innerProduct(alignedOperators[at] ?? rho, rho)[0]
      const aligned = kcbsAligned(minimum)
      const spectrum = hermitianSpectrum(rho)
      const free = kcbsBestOrientation(spectrum)
      const hasFear = minimum < -1e-12
      const violates = aligned > 2 + 1e-12
      const tally = byLaw[lawIndex] ?? { maxAligned: 0, maxFree: 0, violations: 0, states: 0, outside: 0, deepest: 0 }

      tally.states++
      tally.outside += (spectrum[0] ?? 0) < -1e-9 ? 1 : 0
      tally.maxAligned = Math.max(tally.maxAligned, aligned)
      tally.maxFree = Math.max(tally.maxFree, free)
      tally.violations += violates ? 1 : 0
      tally.deepest = Math.min(tally.deepest, minimum)

      states++
      fearStates += hasFear ? 1 : 0
      alignedViolations += violates ? 1 : 0
      violationWithoutFear += violates && !hasFear ? 1 : 0
      fearWithoutViolation += hasFear && !violates ? 1 : 0

      if (Math.abs(minimum - KCBS_NEGATIVITY_THRESHOLD) > 1e-12) {
        equivalenceMismatch += violates !== minimum < KCBS_NEGATIVITY_THRESHOLD ? 1 : 0
      }

      closedFormError = Math.max(closedFormError, Math.abs(direct - aligned))
      maxAligned = Math.max(maxAligned, aligned)
      maxFree = Math.max(maxFree, free)
      freeViolations += free > 2 + 1e-12 ? 1 : 0
      fearFreeAtSqrt5 += !hasFear && Math.abs(free - SQRT5) < 1e-9 ? 1 : 0
      deepestWeight = Math.min(deepestWeight, minimum)
      negativities.push(negativity)
      alignedValues.push(aligned)
      freeValues.push(free)
    }

    for (const background of [vacuumBackground(slots), weylBackground({ slots, scale: MATTER_SCALE })]) {
      const records = classicalRecords({ weave, links: weave.links, background, open: dock0, beats: BEATS })

      for (const { a, b } of meetingPairs(records)) {
        const mine = pairRecords(records, a, b)

        for (const start of STARTS) {
          const startWhole = productWhole([a, b], start)

          for (const [li, law] of [{ kernel4: kThird }, { kernel4: [] as number[][], color: colorOn }].entries()) {
            lawIndex = li

            for (const m of marginals(startWhole)) {
              visit(m)
            }

            for (const step of runWhole({ weave, start: startWhole, records: mine, kernel4: law.kernel4, color: law.color })) {
              for (const m of marginals(step.whole)) {
                visit(m)
              }
            }
          }
        }
      }
    }

    const ok =
      classicalBound === 2 &&
      orthogonality < 1e-12 &&
      spectrumError < 1e-12 &&
      edges === 12 &&
      edgesWithinBasis === 12 &&
      pentagons === 0 &&
      closedFormError < 1e-10 &&
      violationWithoutFear === 0 &&
      equivalenceMismatch === 0 &&
      fearFreeAtSqrt5 > 0

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the pentagon\'s classical bound is 2 and the regular pentagram reaches sqrt 5; the 12 stabilizer states form 4 orthogonal triangles with no pentagon; on every reduced role state the knit reaches, the pentagram on a phase point\'s axis equals its closed form in W and violates exactly when W < -sqrt 5 / 15, never without fear, while fear-free states violate the best-oriented pentagram maximally, so KCBS violation tracks fear one way in the grid\'s frame and not at all with free measurements',
      metrics: {
        reducedStates: states,
        statesWithFear: fearStates,
        alignedViolations,
        alignedViolationWithoutFear: violationWithoutFear,
        fearWithoutAlignedViolation: fearWithoutViolation,
        alignedThresholdMismatches: equivalenceMismatch,
        alignedClosedFormError: closedFormError,
        maxAlignedValue: maxAligned,
        deepestReducedWeight: deepestWeight,
        maxFreeValue: maxFree,
        freeViolations,
        fearFreeStatesAtSqrt5: fearFreeAtSqrt5,
        correlationAlignedWithNegativity: pearson(alignedValues, negativities),
        correlationFreeWithNegativity: pearson(freeValues, negativities),
        negativityThreshold: KCBS_NEGATIVITY_THRESHOLD,
        swapLawStates: byLaw[0]?.states ?? 0,
        swapLawStatesOutsideStateSpace: byLaw[0]?.outside ?? 0,
        swapLawMaxAligned: byLaw[0]?.maxAligned ?? 0,
        swapLawMaxFree: byLaw[0]?.maxFree ?? 0,
        swapLawAlignedViolations: byLaw[0]?.violations ?? 0,
        swapLawDeepestWeight: byLaw[0]?.deepest ?? 0,
        colorLawStates: byLaw[1]?.states ?? 0,
        colorLawStatesOutsideStateSpace: byLaw[1]?.outside ?? 0,
        colorLawMaxAligned: byLaw[1]?.maxAligned ?? 0,
        colorLawMaxFree: byLaw[1]?.maxFree ?? 0,
        colorLawAlignedViolations: byLaw[1]?.violations ?? 0,
        colorLawDeepestWeight: byLaw[1]?.deepest ?? 0,
      },
      control: {
        classicalBound,
        pentagramOrthogonality: orthogonality,
        pentagramSpectrumError: spectrumError,
        quantumMaximum: SQRT5,
        stabilizerStates: stabilizer.length,
        stabilizerOrthogonalPairs: edges,
        stabilizerOrthogonalPairsWithinBasis: edgesWithinBasis,
        stabilizerPentagons: pentagons,
      },
      notes:
        'L2. The aligned value is (5 - sqrt 5)/2 + (3 sqrt 5 - 5)/2 x (1 - 3 W)/2, checked against the pentagram built on the -1 eigenvector of A(u) at the most negative point of every state; the free value is the best orientation of the regular pentagram, not the best of all pentagon configurations. Reduced states are the marginals of the two-role wholes of E-QTM-0119\'s histories, starts included, both tokens, both laws. The contextuality HWVE equate with negativity is with respect to stabilizer measurements on many copies or with ancillas; one qutrit\'s stabilizer states hold no pentagon, so no KCBS test lives inside them.',
    })
  },
})
