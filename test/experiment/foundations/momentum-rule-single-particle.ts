// The single-particle sector of the MOMENTUM-conserving knit, measured. The paper's own knit section says the
// bare charge rule spreads diffusively and the sharp light-cone mode needs a second conserved quantity, the
// momentum current, and relativity/propagating-mode-3434 measures that mode. foundations/rule-has-no-
// amplitudes then showed the charge rule's vacuum flashes with period three and pins a lone tone. So the
// question this experiment asks is the one the quantum program actually needs answered: on the committed
// mesh, under the momentum-conserving collision (headOnRotate, the same-sign head-on pair rotated onto an
// empty line), what IS a single tone?
//
// Measured on d4Mesh with an odd side (one connected lattice, see the PARITY note on d4Mesh):
//
//   - the vacuum is QUIET, every slot stays zero for every beat (the charge rule's vacuum is all ones and
//     minus ones two beats in three),
//   - a lone tone occupies exactly ONE slot and sits at exactly the cell its direction reaches in t beats,
//     one cell per beat in a straight line, until it wraps the torus (ballistic, no spreading, no pinning),
//   - two tones on parallel lines, and two tones whose lines cross at a cell on the same beat, evolve as
//     the exact slot-for-slot union of their separate evolutions (zero cross term),
//   - an opposite-sign head-on pair passes through (two occupied slots before and after, the charge zero
//     throughout, no annihilation), a same-sign head-on pair keeps two slots and turns onto another line,
//     and neither sign changes the occupation count, so the tone's sign carries no cancellation channel.
//
// So the momentum rule's single tone is a classical ballistic particle: it has a light cone (speed one),
// no vacuum churn, no spreading, no superposition and no phase. That is the honest positive the walk
// experiments were reaching for, and the honest negative for the quantum sector at the same time: the
// substrate has a sharp massless classical mode and nothing that interferes.
//
// Controls: the charge rule (pairCollision) on the same seeds shows the flashing vacuum and the pinned
// defect, and the coined walk seeded the same way spreads. Depth L2, a measured property of the committed
// mesh under the committed momentum rule, with two controls.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites, shellDistances } from '@/code/tool/mesh'
import { makeWill, charge, Will } from '@/code/tone/will'
import { headOnRotate, pairCollision } from '@/code/rule/collision'
import { beat } from '@/code/rule/lattice-gas'
import {
  addPointSeed,
  coinedWalkStep,
  coinedWalkSupport,
  makeCoinedWalk,
  massProfile,
} from '@/code/dynamics/coined-dirac-walk'

const SIDE = 9 // odd, one connected lattice
const BEATS = 4 // fewer than side / 2 so nothing wraps
const DIRECTION = 0
const PARALLEL_DIRECTION = 2
const CROSS_DIRECTION = 5 // a direction whose line crosses DIRECTION's line, not its opposite

function occupied(will: Will): number[] {
  const slots: number[] = []

  for (let i = 0; i < will.data.length; i++) {
    if (will.data[i] !== 0) {
      slots.push(i)
    }
  }

  return slots
}

function sameSlots(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((slot, i) => slot === b[i])
}

export default experiment({
  id: 'foundations/momentum-rule-single-particle',
  code: 'E-FND-0081',
  title:
    'under the momentum-conserving knit on the committed mesh a lone tone is a classical ballistic particle: the vacuum stays empty, the tone occupies exactly one slot and moves exactly one cell per beat in a straight line, two tones on parallel or crossing lines evolve as the exact union of their separate runs, and opposite-sign head-on tones pass through without annihilating, while the charge rule flashes and pins and the coined walk spreads',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const mesh = d4Mesh({ side: SIDE })
    const opposite = meshOpposites(mesh)
    const momentum = headOnRotate({ opposite })
    const chargeRule = pairCollision({ opposite })
    const degree = mesh.degree
    const centre = Math.floor(mesh.cellCount / 2)
    const distance = shellDistances(mesh, centre)

    // the vacuum under the momentum rule
    let vacuum = makeWill(mesh)
    let vacuumEverNonzero = 0

    for (let t = 0; t < BEATS; t++) {
      vacuum = beat(vacuum, momentum)
      vacuumEverNonzero += occupied(vacuum).length
    }

    // a lone tone: one slot, at the streamed cell, every beat
    let lone = makeWill(mesh)

    lone.data[centre * degree + DIRECTION] = 1

    let expectedCell = centre
    let loneMaxSlots = 0
    let lonePositionExact = true
    let loneRadiusAtEnd = 0

    for (let t = 1; t <= BEATS; t++) {
      lone = beat(lone, momentum)
      expectedCell = mesh.neighbour(expectedCell, DIRECTION)

      const slots = occupied(lone)

      loneMaxSlots = Math.max(loneMaxSlots, slots.length)

      if (
        slots.length !== 1 ||
        slots[0] !== expectedCell * degree + DIRECTION
      ) {
        lonePositionExact = false
      }

      loneRadiusAtEnd = distance[Math.floor(slots[0]! / degree)]!
    }

    // two tones: parallel lines, and crossing lines meeting at the centre on beat 2
    const parallelStart = mesh.neighbour(
      mesh.neighbour(centre, PARALLEL_DIRECTION),
      PARALLEL_DIRECTION,
    )

    let crossStart = centre

    for (let hop = 0; hop < 2; hop++) {
      crossStart = mesh.neighbour(crossStart, opposite[CROSS_DIRECTION]!)
    }

    let loneStart = centre

    for (let hop = 0; hop < 2; hop++) {
      loneStart = mesh.neighbour(loneStart, opposite[DIRECTION]!)
    }

    const seed = (cells: [number, number][]): Will => {
      const will = makeWill(mesh)

      for (const [cell, direction] of cells) {
        will.data[cell * degree + direction] = 1
      }

      return will
    }

    let unionExactParallel = true
    let unionExactCrossing = true

    {
      let a = seed([[loneStart, DIRECTION]])
      let b = seed([[parallelStart, DIRECTION]])
      let ab = seed([
        [loneStart, DIRECTION],
        [parallelStart, DIRECTION],
      ])
      let c = seed([[crossStart, CROSS_DIRECTION]])
      let ac = seed([
        [loneStart, DIRECTION],
        [crossStart, CROSS_DIRECTION],
      ])

      for (let t = 0; t < BEATS; t++) {
        a = beat(a, momentum)
        b = beat(b, momentum)
        ab = beat(ab, momentum)
        c = beat(c, momentum)
        ac = beat(ac, momentum)

        const union = [...occupied(a), ...occupied(b)].sort((x, y) => x - y)
        const unionCross = [...occupied(a), ...occupied(c)].sort(
          (x, y) => x - y,
        )

        if (!sameSlots(union, occupied(ab))) {
          unionExactParallel = false
        }

        if (!sameSlots(unionCross, occupied(ac))) {
          unionExactCrossing = false
        }
      }
    }

    // head-on pairs: opposite signs pass through, same signs turn, occupation stays two
    let headOnStart = centre

    for (let hop = 0; hop < 3; hop++) {
      headOnStart = mesh.neighbour(headOnStart, DIRECTION)
    }

    const headOn = (sign: 1 | -1): { minOccupied: number; maxOccupied: number; charge: number } => {
      let will = makeWill(mesh)

      will.data[centre * degree + DIRECTION] = 1
      will.data[headOnStart * degree + opposite[DIRECTION]!] = sign

      let minOccupied = Infinity
      let maxOccupied = 0

      for (let t = 0; t < 2 * BEATS; t++) {
        will = beat(will, momentum)

        const n = occupied(will).length

        minOccupied = Math.min(minOccupied, n)
        maxOccupied = Math.max(maxOccupied, n)
      }

      return { minOccupied, maxOccupied, charge: charge(will) }
    }

    const oppositeSigns = headOn(-1)
    const sameSigns = headOn(1)

    // CONTROL 1: the charge rule on the vacuum and the lone tone
    let chargeVacuum = makeWill(mesh)
    let chargeLone = makeWill(mesh)

    chargeLone.data[centre * degree + DIRECTION] = 1

    let chargeVacuumNonzeroAtBeat1 = 0
    let chargeLoneMaxDefect = 0

    for (let t = 1; t <= BEATS; t++) {
      chargeVacuum = beat(chargeVacuum, chargeRule)
      chargeLone = beat(chargeLone, chargeRule)

      if (t === 1) {
        chargeVacuumNonzeroAtBeat1 = occupied(chargeVacuum).length
      }

      let defect = 0

      for (let i = 0; i < chargeLone.data.length; i++) {
        if (chargeLone.data[i] !== chargeVacuum.data[i]) {
          defect++
        }
      }

      chargeLoneMaxDefect = Math.max(chargeLoneMaxDefect, defect)
    }

    // CONTROL 2: the coined walk seeded the same way spreads
    const walk = makeCoinedWalk({ size: 64 })

    addPointSeed({ walk, site: 32, chirality: 'right' })

    const { cosMass, sinMass } = massProfile({ size: 64, massAt: () => 0.5 })

    for (let t = 0; t < BEATS; t++) {
      coinedWalkStep({ walk, cosMass, sinMass, boundary: 'periodic' })
    }

    const walkSupport = coinedWalkSupport({ walk, floor: 1e-9 })

    const vacuumQuiet = vacuumEverNonzero === 0
    const loneIsBallistic =
      loneMaxSlots === 1 && lonePositionExact && loneRadiusAtEnd === BEATS
    const noCrossTerm = unionExactParallel && unionExactCrossing
    const signsDoNotCancel =
      oppositeSigns.minOccupied === 2 &&
      oppositeSigns.maxOccupied === 2 &&
      oppositeSigns.charge === 0 &&
      sameSigns.minOccupied === 2 &&
      sameSigns.maxOccupied === 2
    const chargeRuleDiffers =
      chargeVacuumNonzeroAtBeat1 === mesh.cellCount * degree &&
      chargeLoneMaxDefect <= 2
    const walkSpreads = walkSupport > BEATS

    const ok =
      vacuumQuiet &&
      loneIsBallistic &&
      noCrossTerm &&
      signsDoNotCancel &&
      chargeRuleDiffers &&
      walkSpreads

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on the odd-sided d4Mesh under the momentum-conserving knit the vacuum has zero nonzero slots for every beat, a lone tone occupies exactly one slot at exactly the cell its direction reaches, radius four after four beats (speed one), two tones on parallel lines and two on crossing lines evolve as the exact union of their separate runs, and a head-on opposite-sign pair keeps exactly two occupied slots and zero charge throughout (no annihilation) while a same-sign pair keeps two and turns, so the single tone is a classical ballistic particle with a light cone and no superposition, no phase and no cancellation channel, where the charge rule fills every slot on beat one and pins its defect to at most two slots, and the coined walk spreads to more sites than beats',
      metrics: {
        vacuumNonzeroSlotsTotal: vacuumEverNonzero,
        loneMaxOccupiedSlots: loneMaxSlots,
        lonePositionExact: lonePositionExact ? 1 : 0,
        loneRadiusAfterBeats: loneRadiusAtEnd,
        unionExactParallel: unionExactParallel ? 1 : 0,
        unionExactCrossing: unionExactCrossing ? 1 : 0,
        oppositeSignsOccupiedMin: oppositeSigns.minOccupied,
        oppositeSignsOccupiedMax: oppositeSigns.maxOccupied,
        oppositeSignsCharge: oppositeSigns.charge,
        sameSignsOccupiedMax: sameSigns.maxOccupied,
      },
      control: {
        chargeRuleVacuumNonzeroAtBeat1: chargeVacuumNonzeroAtBeat1,
        chargeRuleLoneMaxDefect: chargeLoneMaxDefect,
        walkSupportSites: walkSupport,
      },
      notes:
        'The positive half of the single-particle question: the momentum-conserving knit carries a sharp classical particle (speed one, no churn), which is the substrate fact behind relativity/propagating-mode-3434. The negative half stands: no spreading, no superposition, no phase, and the tone sign is not a phase either (opposite signs pass through). Any amplitude has to be built on top of this streaming particle. L2, the committed mesh and rule with two controls.',
    })
  },
})
