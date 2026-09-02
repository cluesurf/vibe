// The first coarse amplitude that the rule itself supplies, measured exactly, and what it can and cannot
// do. The ternary tone is the cyclic group Z_3, whose natural complex representation is omega^tone with
// omega = e^{2 pi i / 3}. Summing omega^tone over every slot of the mesh gives a coarse complex amplitude
// A that is MANY-TO-ONE (many configurations share a value), which is the one kind of variable the
// permutation theorem (foundations/permutation-rule-cannot-interfere) leaves open.
//
// Under the charge rule the vacuum is the period-three flash (0,0) -> (+1,-1) -> (-1,+1), and its Z_3
// amplitude per pair over that cycle is 2, then -1, then -1, which sums to EXACTLY ZERO: averaged over
// its own clock the flashing vacuum has no amplitude. A tone born in the empty beat is then a defect
// whose amplitude relative to the vacuum has constant magnitude sqrt(3) at every beat and a PHASE locked
// to the vacuum clock, 30, 30, 150 degrees repeating with period three (the defect itself, hopping between
// a slot and its opposite, returns every six beats). So the rule hands every defect a phase, and the
// phase is dynamical: it is the position of the vacuum clock.
//
// And here is the exact negative: every defect that can be born is born in the empty beat (the vacuum
// leaves no free slot at the other two), so every defect carries the SAME clock phase. Two defects have
// relative phase zero at every beat, their amplitudes add exactly, and the intensity cross term is fixed
// at its maximum. No relative phase, no interference. The clock is a phase, but the single-tone sector
// cannot shift it. Under the momentum rule (the control) the vacuum does not cancel (every empty slot
// contributes one) and a defect's phase is constant, so neither the cancellation nor the clock is there.
//
// Depth L2: a chosen coarse map applied to the committed rule, with a control that fails, giving an exact
// positive (the vacuum cancels, the defect carries the clock) and an exact negative (no relative phase).
// It is not graded L3 because the map is a construction and the intensity |A|^2 has no probability
// meaning yet. What would move it: an interaction that shifts one defect's clock phase against another's.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill } from '@/code/tone/will'
import { Collision, headOnRotate, pairCollision } from '@/code/rule/collision'
import { beat } from '@/code/rule/lattice-gas'
import { ComplexPair, pairAbs2, pairSub } from '@/code/algebra/linear/complex-pair'
import {
  clockAmplitude,
  phaseDegrees,
} from '@/code/measure/clock-amplitude'

const SIDE = 5 // odd, one connected lattice
const BEATS = 12
const DIRECTION = 0
const PARALLEL_DIRECTION = 2
const EXACT = 1e-9

function trace(input: {
  mesh: ReturnType<typeof d4Mesh>
  collision: Collision
  seeds: [number, number][]
}): { vacuum: ComplexPair[]; defect: ComplexPair[] } {
  const { mesh, collision, seeds } = input

  let vacuum = makeWill(mesh)
  let seeded = makeWill(mesh)

  for (const [cell, direction] of seeds) {
    seeded.data[cell * mesh.degree + direction] = 1
  }

  const vacuumTrace: ComplexPair[] = []
  const defectTrace: ComplexPair[] = []

  for (let t = 0; t < BEATS; t++) {
    vacuum = beat(vacuum, collision)
    seeded = beat(seeded, collision)

    const v = clockAmplitude(vacuum)

    vacuumTrace.push(v)
    defectTrace.push(pairSub(clockAmplitude(seeded), v))
  }

  return { vacuum: vacuumTrace, defect: defectTrace }
}

export default experiment({
  id: 'foundations/vacuum-clock-amplitude',
  code: 'E-FND-0084',
  title:
    'the Z_3 coarse amplitude of the charge rule: the flashing vacuum sums to exactly zero over its period, a defect keeps magnitude sqrt 3 with a phase locked to the vacuum clock (30, 30, 150 degrees, period three), and two defects have relative phase zero at every beat so their intensities add without interference, while the momentum rule shows neither the cancellation nor the clock',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const mesh = d4Mesh({ side: SIDE })
    const opposite = meshOpposites(mesh)
    const centre = Math.floor(mesh.cellCount / 2)
    const other = mesh.neighbour(
      mesh.neighbour(centre, PARALLEL_DIRECTION),
      PARALLEL_DIRECTION,
    )

    const chargeRule = pairCollision({ opposite })
    const momentumRule = headOnRotate({ opposite })

    const one = trace({ mesh, collision: chargeRule, seeds: [[centre, DIRECTION]] })
    const second = trace({ mesh, collision: chargeRule, seeds: [[other, DIRECTION]] })
    const both = trace({
      mesh,
      collision: chargeRule,
      seeds: [
        [centre, DIRECTION],
        [other, DIRECTION],
      ],
    })

    // the vacuum cancels over every window of three beats
    let worstVacuumWindow = 0

    for (let t = 0; t + 3 <= BEATS; t++) {
      let re = 0
      let im = 0

      for (let k = t; k < t + 3; k++) {
        re += one.vacuum[k]![0]
        im += one.vacuum[k]![1]
      }

      worstVacuumWindow = Math.max(worstVacuumWindow, Math.hypot(re, im))
    }

    // the defect: constant magnitude sqrt 3, phase sequence with period three
    const magnitudes = one.defect.map(a => Math.sqrt(pairAbs2(a)))
    const phases = one.defect.map(phaseDegrees)
    const magnitudeConstant = magnitudes.every(
      m => Math.abs(m - Math.sqrt(3)) < EXACT,
    )

    const phasePeriodThree = phases.every((p, t) => t < 3 || p === phases[t - 3])
    const distinctPhases = new Set(phases).size

    // two defects: relative phase zero at every beat, amplitudes add exactly
    let worstRelativePhase = 0
    let worstAdditivity = 0

    for (let t = 0; t < BEATS; t++) {
      worstRelativePhase = Math.max(
        worstRelativePhase,
        Math.abs(phaseDegrees(one.defect[t]!) - phaseDegrees(second.defect[t]!)),
      )

      const sum: ComplexPair = [
        one.defect[t]![0] + second.defect[t]![0],
        one.defect[t]![1] + second.defect[t]![1],
      ]

      worstAdditivity = Math.max(
        worstAdditivity,
        Math.sqrt(pairAbs2(pairSub(both.defect[t]!, sum))),
      )
    }

    const intensityOne = pairAbs2(one.defect[0]!)
    const intensityBoth = pairAbs2(both.defect[0]!)
    const crossTerm = intensityBoth - 2 * intensityOne

    // CONTROL: the momentum rule, no cancellation and no clock
    const control = trace({ mesh, collision: momentumRule, seeds: [[centre, DIRECTION]] })
    const controlVacuumMagnitude = Math.sqrt(pairAbs2(control.vacuum[0]!))
    const controlDistinctPhases = new Set(control.defect.map(phaseDegrees)).size

    const vacuumCancels = worstVacuumWindow < EXACT
    const defectCarriesTheClock =
      magnitudeConstant && phasePeriodThree && distinctPhases === 2
    const noRelativePhase = worstRelativePhase === 0 && worstAdditivity < EXACT
    const maximalCrossTerm = Math.abs(crossTerm - 2 * intensityOne) < EXACT
    const controlHasNoClock =
      controlVacuumMagnitude > 1 && controlDistinctPhases === 1

    const ok =
      vacuumCancels &&
      defectCarriesTheClock &&
      noRelativePhase &&
      maximalCrossTerm &&
      controlHasNoClock

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on the odd-sided d4Mesh under the charge rule the coarse Z_3 amplitude of the vacuum sums to zero over every three-beat window to machine precision, a defect born in the empty beat keeps magnitude sqrt 3 at every one of twelve beats with a phase sequence of period three taking exactly two values (30 and 150 degrees), two such defects have relative phase zero at every beat and their amplitudes add exactly so the intensity cross term sits at its maximum 2|A|^2 (no interference), while under the momentum rule the vacuum amplitude does not cancel and the defect phase takes one value, so the rule produces a dynamical clock phase but the single-tone sector cannot put two defects at different phases',
      metrics: {
        worstVacuumWindow: Number(worstVacuumWindow.toExponential(2)),
        defectMagnitude: Number(magnitudes[0]!.toFixed(6)),
        phaseAtBeat1: phases[0]!,
        phaseAtBeat2: phases[1]!,
        phaseAtBeat3: phases[2]!,
        distinctPhases,
        worstRelativePhaseDegrees: worstRelativePhase,
        worstAdditivity: Number(worstAdditivity.toExponential(2)),
        intensityOne: Number(intensityOne.toFixed(6)),
        intensityBoth: Number(intensityBoth.toFixed(6)),
        crossTerm: Number(crossTerm.toFixed(6)),
      },
      control: {
        momentumVacuumMagnitude: controlVacuumMagnitude,
        momentumDistinctPhases: controlDistinctPhases,
      },
      notes:
        'The survivor of the middle-layer search after E-FND-0082 and 0083: a coarse Z_3 amplitude the rule supplies, whose vacuum cancels exactly and whose defects carry the vacuum clock as a phase. The exact negative that comes with it: births happen only in the empty beat, so every defect has the same phase and nothing in the single-tone sector shifts it. The next test is an interaction that shifts one defect clock against another (roadmap quantum-coverage-0006). |A|^2 has no probability meaning yet, which is why this is L2.',
    })
  },
})
