// The honest negative that grades the whole Dirac-walk family. Until 2026-08-31 thirteen experiments in the
// quantum arena said they measured a result on "the {3,4,3,4} coin's own Dirac walk", the "single-particle
// sector" of the committed rule (their titles and notes now say "the coined Dirac walk model"). This
// experiment asks the direct question: does the committed lattice-gas rule, run on the real
// d4Mesh with the committed pair collision, have a single-particle sector that behaves like a quantum walk
// at all? A quantum walk has three signatures a classical permutation cannot have: its support SPREADS
// (the particle is at many sites at once), two seeded configurations SUPERPOSE with a cross term (the
// probability of the pair is not the sum of the two probabilities, interference), and its state carries a
// PHASE (a complex amplitude). The rule's state is an Int8 ternary slot per direction per cell, and its
// beat is a permutation of those slots.
//
// The first thing the measurement finds is that the committed rule has NO QUIET VACUUM. The pair table's
// create move turns every empty opposite pair (0, 0) into (+1, -1), the next beat flips it to (-1, +1), and
// the third annihilates it back to (0, 0). So the all-zero state is a global period-three flash: every slot
// on the mesh is nonzero at beats one and two and zero at beat three. A "lone tone" therefore has to be
// measured as a DEFECT, the set of slots where the seeded run differs from the vacuum run.
//
// Measured on the rule: that defect is at most two slots for every beat (no spreading, it does not even
// stream freely, the hop move exchanges it with its opposite slot), two defects seeded on parallel lines
// evolve as the exact slot-for-slot union of their separate defects (zero overlap, zero cross term, no
// interference), and the charge is conserved exactly. The state type has no imaginary part, so there is
// no phase to measure.
//
// The control is the coined Dirac walk itself (code/dynamics/coined-dirac-walk), seeded with one point and
// then two, same number of beats: its support grows past the beat count, and the two-seed probability
// departs from the sum of the separate probabilities by a third at some site. So the two objects are
// measurably different, and the walk is not a sector of the rule. Whatever the walk experiments show, they
// show about the walk.
//
// Depth L2: a measured property of the committed rule with a control that behaves the other way. It does
// NOT show that no middle layer on top of the rule could ever produce amplitudes, only that the bare rule's
// single-tone sector is classical, so any amplitude has to be built and its construction has to be shown.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites, shellDistances } from '@/code/tool/mesh'
import { makeWill, charge, Will } from '@/code/tone/will'
import { pairCollision } from '@/code/rule/collision'
import { beat } from '@/code/rule/lattice-gas'
import {
  addPointSeed,
  cloneCoinedWalk,
  coinedWalkInterference,
  coinedWalkStep,
  coinedWalkSupport,
  makeCoinedWalk,
  massProfile,
} from '@/code/dynamics/coined-dirac-walk'

const SIDE = 8 // 4096 cells, 98304 slots
const BEATS = 4
const DIRECTION = 0
const OFFSET_DIRECTION = 2 // the second seed sits SIDE / 2 hops away along another direction
const WALK_SIZE = 64
const WALK_MASS = 0.5
const WALK_SEED_GAP = 4
const SUPPORT_FLOOR = 1e-9

// the slots where a run differs from the vacuum run, the classical defect the seed left
function defectSlots(run: Will, vacuum: Will): number[] {
  const slots: number[] = []

  for (let i = 0; i < run.data.length; i++) {
    if (run.data[i] !== vacuum.data[i]) {
      slots.push(i)
    }
  }

  return slots
}

function nonzeroFraction(will: Will): number {
  let nonzero = 0

  for (const tone of will.data) {
    if (tone !== 0) {
      nonzero++
    }
  }

  return nonzero / will.data.length
}

export default experiment({
  id: 'foundations/rule-has-no-amplitudes',
  code: 'E-FND-0080',
  title:
    'the committed rule has no single-particle quantum sector: its vacuum is a global period-three flash, a seeded tone is a classical defect of at most two slots that never spreads, two defects add exactly as sets with zero cross term, while the coined Dirac walk seeded the same way spreads and interferes',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const mesh = d4Mesh({ side: SIDE })
    const opposite = meshOpposites(mesh)
    const collision = pairCollision({ opposite })
    const degree = mesh.degree

    const centre = Math.floor(mesh.cellCount / 2)
    const distance = shellDistances(mesh, centre)

    let offset = centre

    for (let hop = 0; hop < SIDE / 2; hop++) {
      offset = mesh.neighbour(offset, OFFSET_DIRECTION)
    }

    const seedDistance = distance[offset]!

    const seedA = makeWill(mesh)
    const seedB = makeWill(mesh)
    const seedAB = makeWill(mesh)

    seedA.data[centre * degree + DIRECTION] = 1
    seedB.data[offset * degree + DIRECTION] = 1
    seedAB.data[centre * degree + DIRECTION] = 1
    seedAB.data[offset * degree + DIRECTION] = 1

    let vacuum = makeWill(mesh)
    let a = seedA
    let b = seedB
    let ab = seedAB

    const chargeStart = charge(seedAB)
    const vacuumFill: number[] = []

    let vacuumPeriod = 0
    let maxDefect = 0
    let maxDefectRadius = 0
    let unionExactEveryBeat = true
    let overlapSlots = 0

    for (let t = 1; t <= BEATS; t++) {
      vacuum = beat(vacuum, collision)
      a = beat(a, collision)
      b = beat(b, collision)
      ab = beat(ab, collision)

      // the vacuum: record its fill and the first beat it returns to all-zero (its period)
      const fill = nonzeroFraction(vacuum)

      vacuumFill.push(fill)

      if (vacuumPeriod === 0 && fill === 0) {
        vacuumPeriod = t
      }

      // the defects: their size, their reach, and whether the pair is the exact union of the singles
      const defectA = defectSlots(a, vacuum)
      const defectB = defectSlots(b, vacuum)
      const defectAB = defectSlots(ab, vacuum)

      maxDefect = Math.max(maxDefect, defectA.length, defectB.length)

      for (const slot of defectA) {
        maxDefectRadius = Math.max(
          maxDefectRadius,
          distance[Math.floor(slot / degree)]!,
        )
      }

      const setB = new Set(defectB)

      overlapSlots += defectA.filter(slot => setB.has(slot)).length

      const union = [...new Set([...defectA, ...defectB])].sort(
        (x, y) => x - y,
      )

      if (
        union.length !== defectAB.length ||
        union.some((slot, i) => slot !== defectAB[i])
      ) {
        unionExactEveryBeat = false
      }
    }

    const chargeConserved = charge(ab) === chargeStart

    // CONTROL: the coined Dirac walk seeded the same way, one point seed, then two, same number of beats
    const { cosMass, sinMass } = massProfile({
      size: WALK_SIZE,
      massAt: () => WALK_MASS,
    })

    const walkA = makeCoinedWalk({ size: WALK_SIZE })
    const walkB = makeCoinedWalk({ size: WALK_SIZE })

    addPointSeed({ walk: walkA, site: WALK_SIZE / 2, chirality: 'right' })
    addPointSeed({
      walk: walkB,
      site: WALK_SIZE / 2 + WALK_SEED_GAP,
      chirality: 'right',
    })

    const walkAB = cloneCoinedWalk(walkA)

    addPointSeed({
      walk: walkAB,
      site: WALK_SIZE / 2 + WALK_SEED_GAP,
      chirality: 'right',
    })

    for (let t = 0; t < BEATS; t++) {
      for (const walk of [walkA, walkB, walkAB]) {
        coinedWalkStep({ walk, cosMass, sinMass, boundary: 'periodic' })
      }
    }

    const walkSupport = coinedWalkSupport({
      walk: walkA,
      floor: SUPPORT_FLOOR,
    })

    const walkCrossTerm = coinedWalkInterference({
      together: walkAB,
      a: walkA,
      b: walkB,
    })

    const vacuumFlashes =
      vacuumPeriod === 3 && vacuumFill[0] === 1 && vacuumFill[1] === 1
    const defectStaysLocal = maxDefect <= 2 && maxDefectRadius <= BEATS
    const defectsAddAsSets = unionExactEveryBeat && overlapSlots === 0
    const ruleIsClassical =
      vacuumFlashes && defectStaysLocal && defectsAddAsSets && chargeConserved

    const walkIsQuantum = walkSupport > BEATS && walkCrossTerm > 0.01

    const ok = ruleIsClassical && walkIsQuantum

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on the committed d4Mesh with the committed pair collision the all-zero state is a global period-three flash (every slot nonzero at beats one and two, zero at beat three, the create-flip-annihilate cycle), a seeded tone is a classical defect of at most two slots that stays within the light cone and does not spread, two defects seeded on parallel lines evolve as the exact slot-for-slot union of their separate defects with zero overlap, and the charge is conserved, so the rule has no spreading, no superposition and no phase in its single-tone sector, while the coined Dirac walk seeded the same way spreads over more sites than beats and shows a nonzero site-wise interference term, so the walk is not a sector of the rule and every result on the walk is a result about the walk',
      metrics: {
        vacuumPeriod,
        vacuumFillBeat1: vacuumFill[0]!,
        vacuumFillBeat3: vacuumFill[2]!,
        maxDefectSlots: maxDefect,
        maxDefectRadius,
        seedDistance,
        defectOverlapSlots: overlapSlots,
        unionExact: unionExactEveryBeat ? 1 : 0,
        chargeConserved: chargeConserved ? 1 : 0,
        beats: BEATS,
      },
      control: {
        walkSupportSites: walkSupport,
        walkCrossTerm: Number(walkCrossTerm.toFixed(4)),
      },
      notes:
        'The honest negative behind the 2026-08-31 regrade of the quantum arena. Two facts, both about the committed rule as it stands: its vacuum is not quiet (a global period-three flash from the create move), and a seeded tone on top of it is a classical defect that neither spreads nor superposes. This does not show that no middle layer could ever carry amplitudes, only that any amplitude has to be built on top of this and its construction has to be shown before a walk result counts toward the base.',
    })
  },
})
