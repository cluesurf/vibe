// What in-flight phase rotation actually is on this substrate, measured, and the question closed.
// The sixth-thing programme's last unsupplied ingredient was in-flight rotation, the e^{i(kx - wt)}
// factor. This experiment measures every road to it on the polarized palindrome traveller and finds
// the discrete truth:
//
//   - THE PHASE CLASS IS INTRINSIC. Seeding the traveller at four consecutive beats gives the SAME
//     phase class (150 degrees) every time: the creation beat does not wind the matter phase,
//     because matter slots do not flash (the defect's clock contribution is the fixed geometry
//     e^{i 2 pi / 3} minus 1, whatever the beat). The omega part of a base-level plane wave is
//     therefore absent from the matter sector by construction, not by accident.
//   - ROTATION IS EVENT-QUANTIZED, ONE UNIT, OFFSET-INDEPENDENT. Crossing a thin coupled wall adds
//     the rotated class (30 degrees, one clock unit down) to the recoherence set, for a
//     one-beat-late wall AND a two-beat-late wall alike: the kick is per event and unit-sized, not
//     proportional to the wall's own offset.
//   - KICKS DO NOT ACCUMULATE IN THIS OBSERVABLE: one, two, and three walls all give the same
//     recoherence set of exactly the two classes (150 and 30), never the third (270), so the
//     coarse amplitude records THAT an interaction happened, not how many.
//   - THE BLIND ORIENTATION IS THE CONTROL: the same traveller crossing walls outside its wire
//     plane keeps exactly the single intrinsic class, and the free run keeps it forever.
//
// The conclusion for the programme: base-level continuous rotation does not exist and cannot (the
// phase is Z_3, matter slots are silent, and the mod-3 scar theorem of E-FND-0105 closes speed-one
// clock coupling), and what the base supplies instead is complete as a discrete kinematics:
// an intrinsic class, unit kicks at selectively-coupled walls, exact blindness elsewhere, exact
// superposition, and CPT. The continuous e^{i(kx - wt)} is a coarse-level object, which is exactly
// where the walk sector already builds it (L2), so the remaining work is the derivation bridging
// the two levels, not a missing base mechanism. Depth L2, deterministic, no randomness.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { growingBeat } from '@/code/rule/lattice-gas'
import {
  couplesFrom,
  linesOf,
  palindromeFor,
} from '@/task/palindrome-hunt'
import {
  clockAmplitude,
  phaseDegrees,
} from '@/code/measure/clock-amplitude'
import { pairAbs2, pairSub } from '@/code/algebra/linear/complex-pair'

const ROOT3 = Math.sqrt(3)
const SIDE = 13
const CROSS_PLANE: number[][] = [
  [0, 6],
  [1, 7],
  [2, 8],
  [3, 9],
  [4, 10],
  [5, 11],
]

function study(input: {
  seedBeat: number
  wallColumns: number[]
  wallAxis: number
  wallOffset: number
  beats: number
}): { phases: number[]; maxSupport: number } {
  const mesh = d4Mesh({ side: SIDE })
  const lines = linesOf(meshOpposites(mesh))
  const rule = palindromeFor(couplesFrom(CROSS_PLANE, lines))
  const coordinate = (c: number, a: number): number =>
    Math.floor(c / SIDE ** a) % SIDE
  const mid = Math.floor(SIDE / 2)

  let seedCell = 0

  for (let c = 0; c < mesh.cellCount; c++) {
    if (
      coordinate(c, 0) === 1 &&
      coordinate(c, 1) === 0 &&
      coordinate(c, 2) === mid &&
      coordinate(c, 3) === mid
    ) {
      seedCell = c
      break
    }
  }

  const late = new Set<number>()

  for (let c = 0; c < mesh.cellCount; c++) {
    if (input.wallColumns.includes(coordinate(c, input.wallAxis))) {
      late.add(c)
    }
  }

  let vacuum: Will = makeWill(mesh)
  let seeded: Will = makeWill(mesh)

  const phases = new Set<number>()

  let maxSupport = 0

  for (let t = 0; t < input.beats; t++) {
    if (t === input.seedBeat) {
      seeded.data[seedCell * 24] = 1
    }

    const active = (c: number): boolean =>
      late.has(c) ? t >= input.wallOffset : true

    vacuum = growingBeat(vacuum, rule, active)
    seeded = growingBeat(seeded, rule, active)

    if (t < input.seedBeat) {
      continue
    }

    let support = 0

    for (let i = 0; i < seeded.data.length; i++) {
      if (seeded.data[i] !== vacuum.data[i]) {
        support++
      }
    }

    maxSupport = Math.max(maxSupport, support)

    const difference = pairSub(
      clockAmplitude(seeded),
      clockAmplitude(vacuum),
    )

    if (
      Math.abs(Math.sqrt(pairAbs2(difference)) - ROOT3) < 1e-9
    ) {
      phases.add(Math.round(phaseDegrees(difference)))
    }
  }

  return {
    phases: [...phases].sort((a, b) => a - b),
    maxSupport,
  }
}

const same = (a: number[], b: number[]): boolean =>
  a.length === b.length && a.every((v, i) => v === b[i])

export default experiment({
  id: 'foundations/unit-kick-phase-law',
  code: 'E-FND-0106',
  title:
    'the unit-kick phase law closes the in-flight rotation question: the polarized traveller keeps the same intrinsic phase class at four consecutive creation beats (matter slots do not flash, so no omega winding exists at the base), a thin coupled wall adds exactly one rotated class to the recoherence set for one-beat AND two-beat wall offsets alike (event-quantized, unit-sized, offset-independent), one, two, and three walls give the identical two-class set (kicks record that, not how many), and the blind orientation and the free run keep the single intrinsic class exactly, so base-level continuous rotation cannot exist on the Z_3 clock and the discrete kinematics is complete, with the continuum e^{i(kx - wt)} a coarse walk-level object and the remaining work a derivation bridge rather than a missing mechanism',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    // 1. the intrinsic class across four creation beats, free flight
    const beats = [3, 4, 5, 6].map(seedBeat =>
      study({
        seedBeat,
        wallColumns: [],
        wallAxis: 1,
        wallOffset: 1,
        beats: 16,
      }),
    )
    const intrinsic = beats.every(
      r => r.phases.length === 1 && r.phases[0] === 150,
    )

    // 2. the unit kick at both wall offsets, coupled orientation (y walls, wire plane y-z)
    const kick1 = study({
      seedBeat: 3,
      wallColumns: [4],
      wallAxis: 1,
      wallOffset: 1,
      beats: 20,
    })
    const kick2 = study({
      seedBeat: 3,
      wallColumns: [4],
      wallAxis: 1,
      wallOffset: 2,
      beats: 20,
    })
    const unitKick =
      same(kick1.phases, [30, 150]) && same(kick2.phases, [30, 150])

    // 3. no accumulation: two and three walls, same two-class set, never 270
    const walls2 = study({
      seedBeat: 3,
      wallColumns: [4, 8],
      wallAxis: 1,
      wallOffset: 1,
      beats: 20,
    })
    const walls3 = study({
      seedBeat: 3,
      wallColumns: [3, 6, 9],
      wallAxis: 1,
      wallOffset: 1,
      beats: 20,
    })
    const noAccumulation =
      same(walls2.phases, [30, 150]) &&
      same(walls3.phases, [30, 150])

    // 4. the blind control: x walls, the same traveller, the single class exactly
    const blind = study({
      seedBeat: 3,
      wallColumns: [4],
      wallAxis: 0,
      wallOffset: 1,
      beats: 20,
    })
    const blindClean =
      same(blind.phases, [150]) && blind.maxSupport === 1

    const ok = intrinsic && unitKick && noAccumulation && blindClean

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'all four creation beats give exactly the class 150, both wall offsets give exactly the set 150 and 30, two and three walls give the same set with 270 never appearing, and the blind crossing keeps the single class at support one',
      metrics: {
        intrinsicClassesSeen: beats.every(r => r.phases.length === 1)
          ? 1
          : 99,
        kickOffset1Classes: kick1.phases.length,
        kickOffset2Classes: kick2.phases.length,
        threeWallClasses: walls3.phases.length,
        kickOffset1Support: kick1.maxSupport,
        kickOffset2Support: kick2.maxSupport,
      },
      // CONTROL: the blind orientation, the same traveller and the same wall geometry with zero
      // effect, and the free run's single intrinsic class
      control: {
        blindMaxSupport: blind.maxSupport,
        blindClassCount: blind.phases.length,
      },
      notes:
        'the wake cost of each coupled crossing is reported in the support metrics, not hidden. The reading that emerges: the matter defect carries position and an intrinsic phase class, the clock sector carries the windable phase (E-FND-0086 domains wind with birth beat, measured there), and the two meet at coupled walls where exactly one unit transfers. A continuous omega would need matter slots that flash, and a continuous k would need a phase with more than three values, so the continuum factor lives one level up by necessity, where the walk sector (the L2 quantum canon) already constructs it. This dissolves the "missing ingredient" into a derivation bridge: show the walk emerges as the coarse theory of dense domain tilings, the named follow-up.',
    })
  },
})
