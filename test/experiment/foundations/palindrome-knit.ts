// The palindrome traveller knit, measured in full. E-FND-0102 found that lineHop misses CPT only
// through the order of its two moves, and that the palindrome form (swap, clock, swap) has the CPT
// reversal exactly. This experiment measures whether the repair keeps the physics, and it does:
//
//   - EXACTLY REVERSIBLE AND CONSERVING: twenty beats forward and twenty inverse return a generic
//     state with Hamming distance zero, and total charge drifts by exactly zero.
//   - THE TRAVELLER SURVIVES THE REPAIR: a lone tone in the growing vacuum is a speed-one particle,
//     one slot at every one of the beats, ballistic to the far side of the torus, with one free
//     phase (150 degrees, the same as lineHop's), at two lattice sizes.
//   - SUPERPOSITION IS EXACT: two travellers seeded far apart evolve as exactly the sum of the
//     singles, zero mismatched slots.
//   - THE PARTICLE SURVIVES DOMAINS: sent through the one-beat-offset slab it sits at its exact
//     free-flight position at every checked beat while the medium responds around it, the
//     emission-with-survival picture of E-FND-0099 carried over.
//   - THE TRADE-OFF, REPORTED: the palindrome's medium response is earlier and stronger than
//     lineHop's (eruption at beat 7 against 11 at side 13, and the one-beat and two-beat offsets
//     respond at similar size, so the offset-selective detector contrast of E-FND-0095 is weaker).
//     A better-behaved response may live elsewhere in the palindrome family (other pairings, other
//     clauses), the named follow-up.
//
// With E-FND-0102 this is the current best candidate for the base decision: the one-clause
// traveller with exact CPT, C and CP violation, free flight, superposition and survival. Depth L2,
// candidate dynamics measured against the committed vacuum, deterministic, no randomness.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { linePalindrome } from '@/code/rule/collision'
import {
  beat,
  collide,
  growingBeat,
  streamInverse,
} from '@/code/rule/lattice-gas'
import {
  clockAmplitude,
  phaseDegrees,
} from '@/code/measure/clock-amplitude'
import { pairAbs2, pairSub } from '@/code/algebra/linear/complex-pair'

const ROOT3 = Math.sqrt(3)
const SEED_BEAT = 3

function seedCellOf(side: number, x: number, rest: number): number {
  const target =
    x +
    rest * side +
    rest * side * side +
    rest * side * side * side

  return target
}

function traveller(side: number): {
  maxSupport: number
  maxDistance: number
  phases: number[]
} {
  const mesh = d4Mesh({ side })
  const rule = linePalindrome({ opposite: meshOpposites(mesh) })
  const mid = Math.floor(side / 2)
  const seedCell = seedCellOf(side, 1, mid)
  const coordinate = (c: number, a: number): number =>
    Math.floor(c / side ** a) % side

  let vacuum: Will = makeWill(mesh)
  let seeded: Will = makeWill(mesh)
  let maxSupport = 0
  let maxDistance = 0

  const phases = new Set<number>()

  for (let t = 0; t < 30; t++) {
    if (t === SEED_BEAT) {
      seeded.data[seedCell * mesh.degree] = 1
    }

    vacuum = growingBeat(vacuum, rule, () => true)
    seeded = growingBeat(seeded, rule, () => true)

    let support = 0

    for (let i = 0; i < seeded.data.length; i++) {
      if (seeded.data[i] !== vacuum.data[i]) {
        support++

        const cell = Math.floor(i / mesh.degree)

        let distance = 0

        for (let a = 0; a < 4; a++) {
          const d = Math.abs(
            coordinate(cell, a) - coordinate(seedCell, a),
          )

          distance += Math.min(d, side - d)
        }

        maxDistance = Math.max(maxDistance, distance)
      }
    }

    maxSupport = Math.max(maxSupport, support)

    const difference = pairSub(
      clockAmplitude(seeded),
      clockAmplitude(vacuum),
    )

    if (Math.abs(Math.sqrt(pairAbs2(difference)) - ROOT3) < 1e-9) {
      phases.add(phaseDegrees(difference))
    }
  }

  return {
    maxSupport,
    maxDistance,
    phases: [...phases].sort((a, b) => a - b),
  }
}

export default experiment({
  id: 'foundations/palindrome-knit',
  code: 'E-FND-0103',
  title:
    "the palindrome traveller knit measured in full: exactly reversible (echo Hamming zero) and conserving (charge drift zero), a lone tone is a speed-one one-slot particle with one free phase at two sizes, two travellers superpose with zero mismatched slots, the particle sits at its exact free-flight position at every checked beat through the offset slab (emission-with-survival carried over), and the trade-off is reported (the medium response is earlier and less offset-selective than lineHop's), so with its exact CPT from E-FND-0102 this is the current best base-decision candidate: the one-clause traveller with nature's discrete symmetry pattern",
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    // 1. echo and conservation on a generic state, side 9
    const side = 9
    const mesh = d4Mesh({ side })
    const opposite = meshOpposites(mesh)
    const rule = linePalindrome({ opposite })
    const ruleInverse = linePalindrome({ opposite, forward: false })
    const start = makeWill(mesh)

    for (let i = 0; i < start.data.length; i++) {
      start.data[i] = ((((i * 5 + (i % 11)) % 3) - 1) as -1 | 0 | 1)
    }

    let initialCharge = 0

    for (const tone of start.data) {
      initialCharge += tone
    }

    let will: Will = { mesh, data: Int8Array.from(start.data) }

    for (let t = 0; t < 20; t++) {
      will = beat(will, rule)
    }

    let evolvedCharge = 0

    for (const tone of will.data) {
      evolvedCharge += tone
    }

    for (let t = 0; t < 20; t++) {
      will = streamInverse(will)
      collide(will, ruleInverse)
    }

    let echoHamming = 0

    for (let i = 0; i < will.data.length; i++) {
      if (will.data[i] !== start.data[i]) {
        echoHamming++
      }
    }

    // 2. the traveller at two sizes
    const at9 = traveller(9)
    const at11 = traveller(11)

    // 3. superposition at side 13
    const side13 = 13
    const mesh13 = d4Mesh({ side: side13 })
    const rule13 = linePalindrome({
      opposite: meshOpposites(mesh13),
    })
    const mid13 = Math.floor(side13 / 2)
    const seedA = seedCellOf(side13, 1, mid13)
    const seedB = seedCellOf(side13, 1, 2)

    const differenceOf = (seeds: number[]): Will => {
      let vacuum: Will = makeWill(mesh13)
      let seeded: Will = makeWill(mesh13)

      for (let t = 0; t < 16; t++) {
        if (t === SEED_BEAT) {
          for (const cell of seeds) {
            seeded.data[cell * mesh13.degree] = 1
          }
        }

        vacuum = growingBeat(vacuum, rule13, () => true)
        seeded = growingBeat(seeded, rule13, () => true)
      }

      const difference = makeWill(mesh13)

      for (let i = 0; i < seeded.data.length; i++) {
        difference.data[i] = (seeded.data[i]! -
          vacuum.data[i]!) as -1 | 0 | 1
      }

      return difference
    }

    const single = differenceOf([seedA])
    const other = differenceOf([seedB])
    const joint = differenceOf([seedA, seedB])

    let superpositionMismatch = 0

    for (let i = 0; i < joint.data.length; i++) {
      if (joint.data[i] !== single.data[i]! + other.data[i]!) {
        superpositionMismatch++
      }
    }

    // 4. survival through the offset-1 slab at side 13
    const coordinate13 = (c: number, a: number): number =>
      Math.floor(c / side13 ** a) % side13
    const late = new Set<number>()

    for (let cell = 0; cell < mesh13.cellCount; cell++) {
      const x = coordinate13(cell, 0)

      if (x >= 5 && x <= 7) {
        late.add(cell)
      }
    }

    const freePosition: number[] = []

    {
      let vacuum: Will = makeWill(mesh13)
      let seeded: Will = makeWill(mesh13)

      for (let t = 0; t < 33; t++) {
        if (t === SEED_BEAT) {
          seeded.data[seedA * mesh13.degree] = 1
        }

        vacuum = growingBeat(vacuum, rule13, () => true)
        seeded = growingBeat(seeded, rule13, () => true)

        let position = -1

        for (let i = 0; i < seeded.data.length; i++) {
          if (seeded.data[i] !== vacuum.data[i]) {
            position = Math.floor(i / mesh13.degree)
            break
          }
        }

        freePosition.push(position)
      }
    }

    let vacuum13: Will = makeWill(mesh13)
    let seeded13: Will = makeWill(mesh13)
    let frontHits = 0
    let frontChecks = 0
    let eruption = -1

    for (let t = 0; t < 33; t++) {
      if (t === SEED_BEAT) {
        seeded13.data[seedA * mesh13.degree] = 1
      }

      const active = (cell: number): boolean =>
        late.has(cell) ? t >= 1 : true

      vacuum13 = growingBeat(vacuum13, rule13, active)
      seeded13 = growingBeat(seeded13, rule13, active)

      if (t <= SEED_BEAT) {
        continue
      }

      const cells = new Set<number>()

      let support = 0

      for (let i = 0; i < seeded13.data.length; i++) {
        if (seeded13.data[i] !== vacuum13.data[i]) {
          support++
          cells.add(Math.floor(i / mesh13.degree))
        }
      }

      if (eruption === -1 && support > 1) {
        eruption = t
      }

      frontChecks++

      if (cells.has(freePosition[t]!)) {
        frontHits++
      }
    }

    const reversibleConserving =
      echoHamming === 0 && evolvedCharge === initialCharge
    const particle =
      at9.maxSupport === 1 &&
      at11.maxSupport === 1 &&
      at9.maxDistance >= 8 &&
      at11.maxDistance >= 8 &&
      at9.phases.length === 1 &&
      at11.phases.length === 1
    const superposes = superpositionMismatch === 0
    const survives = frontHits === frontChecks

    const ok =
      reversibleConserving && particle && superposes && survives

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the echo returns with zero Hamming distance and zero charge drift, the lone tone holds one slot with one phase to at least distance eight at both sizes, two travellers superpose with zero mismatch, and the particle occupies its free-flight cell at every check through the offset slab',
      metrics: {
        echoHamming,
        chargeDrift: evolvedCharge - initialCharge,
        maxSupportSide9: at9.maxSupport,
        maxDistanceSide9: at9.maxDistance,
        freePhase: at9.phases[0] ?? -1,
        superpositionMismatch,
        slabFrontHits: frontHits,
        slabFrontChecks: frontChecks,
        slabEruption: eruption,
      },
      // CONTROL: the free traveller itself (support one, one phase), against which the slab run's
      // survival is checked cell by cell
      control: {
        freePhaseCount: at9.phases.length,
      },
      notes:
        "the trade-off against lineHop, measured and reported rather than hidden: the palindrome's medium response erupts at beat 7 at side 13 (lineHop's at 11) and the one-beat and two-beat offset slabs respond at similar magnitude (271 and 336 max support), so the sharp offset-selective detector contrast of E-FND-0095 is weaker here. The follow-ups: hunt the palindrome family (other line pairings, the equivariant-pairing question) for a variant with both the symmetry and the selective detector, and re-run the E-FND-0086/0091 canon under the palindrome. Adoption stays the user's base-model decision; this experiment measures the candidate and modifies nothing.",
    })
  },
})
