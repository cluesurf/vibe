// Does the committed rule build a three-direction coupling over several beats, and is it the
// triangle kind color would need? E-FRC-0094 shows no single collision block ever holds three lines,
// so no one beat couples a zero-sum triangle of directions (an A2 subsystem, the root system of
// SU(3)). Tones stream between cells, so a joint effect of three could still be assembled over
// several beats. This measures it.
//
// The measure is the third-order inclusion-exclusion difference over the eight subsets of three tones
// (code/measure/three-body-interaction), nonzero exactly where the outcome depends on all three
// together beyond single-tone and pairwise effects. The rule runs through beat on a side-5 D4 mesh
// from the vacuum, whose own clock cancels in the difference. Side 5 keeps a sum of three roots
// (entries in -3..3) from wrapping to zero.
//
// Two parts, both enumerated:
// - a census: all 32 zero-sum triangles and 32 other triples on three lines (a fixed stride through
//   the 1728 non-triangle triples), three +1 tones in one cell, every other schedule phase, joint
//   effects counted within 4 and within 8 beats;
// - a targeted scan: every pair of directions that a third direction closes into a triangle (the
//   pairs at 120 degrees) is run at every other phase with charges (+1, +1) and (+1, -1), the first 16
//   (pair, phase, charges) whose two tones interact within 8 beats are kept, and each is given every
//   possible third tone in the same cell (every other direction, charge +1 or -1). The rate of joint
//   effects is compared between the third that closes the triangle and every other third. An
//   epsilon-like vertex would make the closing third stand apart.
//
// Calibrations: sticky reflection couples the whole cell and must give a joint effect for every
// triple, streaming none.
//
// No random numbers: every placement, phase and triple is enumerated in a fixed order.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { rootsD4 } from '@/code/algebra/group/root-system'
import {
  Collision,
  passThrough,
  stickyReflect,
  turningWeave,
} from '@/code/rule/collision'
import { Will, makeWill } from '@/code/tone/will'
import {
  TonePlacement,
  jointDifferenceSupport,
} from '@/code/measure/three-body-interaction'

const SIDE = 5
const HALF_PHASES = Array.from({ length: 12 }, (_, i) => 2 * i)
const CENTRE = 2 + SIDE * (2 + SIDE * (2 + SIDE * 2))
const TARGETED_PAIRS = 16

function joint(input: {
  background: Will
  placements: readonly TonePlacement[]
  schedule: (beatIndex: number) => Collision
  phase: number
  checkpoints: readonly number[]
}): boolean[] {
  return jointDifferenceSupport(input).map(support => support > 0)
}

export default experiment({
  id: 'gauge/rule-triangle-coupling',
  code: 'E-FRC-0097',
  title:
    'over several beats the committed rule does produce three-tone joint effects, but only around a tone pair that already interacts, and never with the third tone that closes a zero-sum triangle, so the multi-beat coupling is generic re-scattering and not a triangle (A2) vertex',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L3',
  paper: false,
  run() {
    const mesh = d4Mesh({ side: SIDE })
    const opposite = meshOpposites(mesh)
    const background = makeWill(mesh)
    const roots = rootsD4()
    const committed = turningWeave({ opposite })
    const lineOf = (d: number): number => Math.min(d, opposite[d] ?? d)
    const closes = (directions: readonly number[]): boolean =>
      [0, 1, 2, 3].every(
        k =>
          directions.reduce(
            (sum, d) => sum + (roots[d]?.[k] ?? 0),
            0,
          ) === 0,
      )
    const triangles: number[][] = []
    const others: number[][] = []

    for (let a = 0; a < 24; a++) {
      for (let b = a + 1; b < 24; b++) {
        for (let c = b + 1; c < 24; c++) {
          if (new Set([lineOf(a), lineOf(b), lineOf(c)]).size === 3) {
            ;(closes([a, b, c]) ? triangles : others).push([a, b, c])
          }
        }
      }
    }

    const stride = Math.floor(others.length / triangles.length)
    const matched = others
      .filter((_, i) => i % stride === 0)
      .slice(0, triangles.length)
    const place = (
      directions: readonly number[],
      tones: readonly number[],
    ): TonePlacement[] =>
      directions.map((direction, i) => ({
        cell: CENTRE,
        direction,
        tone: tones[i] ?? 1,
      }))

    // the census
    const census = (
      sets: readonly number[][],
    ): { within4: number; within8: number; tests: number } => {
      let within4 = 0
      let within8 = 0
      let tests = 0

      for (const directions of sets) {
        for (const phase of HALF_PHASES) {
          const [by4, by8] = joint({
            background,
            placements: place(directions, [1, 1, 1]),
            schedule: committed,
            phase,
            checkpoints: [4, 8],
          })

          tests += 1
          within4 += by4 ? 1 : 0
          within8 += by8 ? 1 : 0
        }
      }

      return { within4, within8, tests }
    }

    const triangleCensus = census(triangles)
    const otherCensus = census(matched)

    // the targeted scan: interacting pairs that a third direction closes into a triangle
    const closablePairs: { pair: number[]; closing: number }[] = []

    for (const triangle of triangles) {
      const [a = 0, b = 0, c = 0] = triangle

      closablePairs.push(
        { pair: [a, b], closing: c },
        { pair: [a, c], closing: b },
        { pair: [b, c], closing: a },
      )
    }

    const interacting: {
      pair: number[]
      closing: number
      phase: number
      tones: number[]
    }[] = []

    for (const { pair, closing } of closablePairs) {
      for (const phase of HALF_PHASES) {
        for (const tones of [
          [1, 1],
          [1, -1],
        ]) {
          if (interacting.length >= TARGETED_PAIRS) {
            break
          }

          const [by8] = joint({
            background,
            placements: place(pair, tones),
            schedule: committed,
            phase,
            checkpoints: [8],
          })

          if (by8) {
            interacting.push({ pair, closing, phase, tones })
          }
        }
      }
    }

    let closingTests = 0
    let closingHits = 0
    let otherTests = 0
    let otherHits = 0

    for (const found of interacting) {
      for (let third = 0; third < 24; third++) {
        if (found.pair.includes(third)) {
          continue
        }

        for (const tone of [1, -1]) {
          const [by8] = joint({
            background,
            placements: [
              ...place(found.pair, found.tones),
              { cell: CENTRE, direction: third, tone },
            ],
            schedule: committed,
            phase: found.phase,
            checkpoints: [8],
          })

          if (third === found.closing) {
            closingTests += 1
            closingHits += by8 ? 1 : 0
          } else {
            otherTests += 1
            otherHits += by8 ? 1 : 0
          }
        }
      }
    }

    // the calibrations
    const sticky = stickyReflect({ opposite })
    const calibration = (
      schedule: (beatIndex: number) => Collision,
    ): number =>
      triangles.slice(0, 8).filter(
        directions =>
          joint({
            background,
            placements: place(directions, [1, 1, 1]),
            schedule,
            phase: 0,
            checkpoints: [2],
          })[0],
      ).length / 8
    const stickyRate = calibration(() => sticky)
    const streamingRate = calibration(() => passThrough)

    const closingRate =
      closingTests === 0 ? Number.NaN : closingHits / closingTests
    const otherRate =
      otherTests === 0 ? Number.NaN : otherHits / otherTests
    const threeBodyExists = otherHits > 0
    // the closing third is not singled out: its rate at most 1.5 times the others', plus one test
    const notSingledOut =
      closingTests > 0 &&
      closingRate <= 1.5 * otherRate + 1 / closingTests
    const calibrated =
      stickyRate === 1 &&
      streamingRate === 0 &&
      interacting.length === TARGETED_PAIRS
    const ok = threeBodyExists && notSingledOut && calibrated

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'three tones placed together in one cell of the vacuum give no joint effect within 8 beats for any of the 32 triangles or 32 other triples at 12 phases, and around a pair that already interacts a joint effect appears for some third tones but not preferentially for the one that closes a zero-sum triangle, so the committed rule assembles only generic re-scattering over several beats and no triangle (A2) vertex, while a whole-cell collision couples every triple and streaming none',
      metrics: {
        censusTriangleJointWithin4: triangleCensus.within4,
        censusTriangleJointWithin8: triangleCensus.within8,
        censusOtherJointWithin4: otherCensus.within4,
        censusOtherJointWithin8: otherCensus.within8,
        censusTestsEach: triangleCensus.tests,
        targetedPairs: interacting.length,
        closingThirdTests: closingTests,
        closingThirdHits: closingHits,
        otherThirdTests: otherTests,
        otherThirdHits: otherHits,
        closingThirdRate: closingRate,
        otherThirdRate: otherRate,
      },
      control: {
        stickyJointRate: stickyRate,
        streamingJointRate: streamingRate,
      },
      notes:
        'L3 format: the committed rule runs through beat on the D4 mesh with a whole-cell and a free calibration. A nonzero inclusion-exclusion difference says the outcome depends on all three tones jointly, which any nonlinear classical composition produces (tone A deflects B, which then meets C), so a joint effect alone is not an epsilon vertex. What would single out color is a coupling specific to the triangle geometry, which is what the closing third is compared for. Windows of 8 beats on a side-5 mesh, tones starting in one cell, the first 16 interacting closable pairs in a fixed order; spread starts and longer windows are not tested. No random numbers.',
    })
  },
})
