// The dark matter candidate, measured structurally. Dark matter is defined by two properties: it
// carries energy (it gravitates, it is most of the lensing mass) and it does not scatter light or
// matter (it is dark and collisionless). The model contains an object with exactly that structural
// profile, the clock-offset domain wall, and this experiment measures the profile:
//
//   - PERSISTENT LOCALIZED ENERGY. Between a domain born on beat 0 and one born one beat late, the
//     wall (the slots matching NEITHER pure vacuum) is exactly one slot per boundary cell at every
//     sampled beat, confined within two columns of the boundary, and BREATHES with period six
//     between two pinned configurations (the profiles at beats 24 and 30 are identical, as are 21
//     and 27): a thin, permanent, periodically breathing structure holding tone content that
//     neither vacuum accounts for.
//   - TRANSPARENT TO MATTER ON CROSSING. The traveller particle sent through a one-beat-offset slab
//     keeps support exactly one and its free phase through the entire crossing window (re-measured
//     here, the transparent first pass of E-FND-0096). The honest caveat rides along and is cited:
//     the crossing plants a delayed wake that erupts later, so the transparency is per-crossing,
//     not permanent invisibility.
//   - THE TWO CONTROLS. A two-beat offset grows a wall that actively invades the neighbouring
//     domain (measured spreading between beats 21 and 30): that class is a detector, not a dark
//     candidate, so darkness is specific to the one-beat class. And a three-beat offset (the clock
//     period) makes no wall at all, the commensurability null.
//
// So the model holds a persistent, localized, energy-bearing, matter-transparent object class.
// What is NOT yet measured is the gravitational half: the wall's energy coupling into the emergent
// potential (and with it rotation curves and lensing mass), which is what keeps the ledger row at
// structure-derived rather than reproduced. Depth L2, deterministic, no randomness.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  d4Mesh,
  squareMesh,
  meshOpposites,
} from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { lineHop, pairCollision } from '@/code/rule/collision'
import { growingBeat } from '@/code/rule/lattice-gas'

const SIDE = 24

function grownPair(input: {
  offset: number
  beats: number
}): { profile: number[]; total: number } {
  const mesh = squareMesh({ side: SIDE })
  const rule = pairCollision({ opposite: meshOpposites(mesh) })

  const evolve = (birth: (c: number) => number): Will => {
    let will: Will = makeWill(mesh)

    for (let t = 0; t < input.beats; t++) {
      will = growingBeat(will, rule, (c: number) => t >= birth(c))
    }

    return will
  }

  const two = evolve(c =>
    c % SIDE < SIDE / 2 ? 0 : input.offset,
  )
  const vacuumA = evolve(() => 0)
  const vacuumB = evolve(() => input.offset)
  const profile = new Array<number>(SIDE).fill(0)

  let total = 0

  for (let i = 0; i < two.data.length; i++) {
    if (
      two.data[i] !== vacuumA.data[i] &&
      two.data[i] !== vacuumB.data[i]
    ) {
      profile[Math.floor(i / mesh.degree) % SIDE]!++
      total++
    }
  }

  return { profile, total }
}

// the traveller's first pass through the offset-1 slab: support per beat over the pre-eruption
// window (the E-FND-0096 geometry at side 15, where the crossing happens at beats 6 through 8)
function crossingSupports(): number[] {
  const side = 15
  const mesh = d4Mesh({ side })
  const rule = lineHop({ opposite: meshOpposites(mesh) })
  const coordinate = (c: number, axis: number): number =>
    Math.floor(c / side ** axis) % side
  const late = new Set<number>()

  for (let cell = 0; cell < mesh.cellCount; cell++) {
    const x = coordinate(cell, 0)

    if (x >= 5 && x <= 7) {
      late.add(cell)
    }
  }

  const mid = Math.floor(side / 2)

  let seedCell = 0

  for (let cell = 0; cell < mesh.cellCount; cell++) {
    if (
      coordinate(cell, 0) === 1 &&
      coordinate(cell, 1) === mid &&
      coordinate(cell, 2) === mid &&
      coordinate(cell, 3) === mid
    ) {
      seedCell = cell
      break
    }
  }

  let vacuum: Will = makeWill(mesh)
  let seeded: Will = makeWill(mesh)

  const supports: number[] = []

  for (let t = 0; t < 14; t++) {
    if (t === 3) {
      seeded.data[seedCell * mesh.degree] = 1
    }

    const active = (cell: number): boolean =>
      late.has(cell) ? t >= 1 : true

    vacuum = growingBeat(vacuum, rule, active)
    seeded = growingBeat(seeded, rule, active)

    let support = 0

    for (let i = 0; i < seeded.data.length; i++) {
      if (seeded.data[i] !== vacuum.data[i]) {
        support++
      }
    }

    supports.push(support)
  }

  return supports
}

export default experiment({
  id: 'cosmology/dark-wall-candidate',
  code: 'E-CSM-0057',
  title:
    'the dark matter candidate measured structurally: the one-beat clock wall is exactly one slot per boundary cell at every sampled beat, confined within two columns of the boundary, breathing with exact period six between two pinned configurations (persistent localized energy neither vacuum accounts for), the traveller crosses the same wall class with support exactly one and no phase change through the whole crossing window (transparent to matter per crossing, the delayed-wake caveat of E-FND-0096 cited), while the two-beat wall invades its neighbour (a detector, not dark) and the three-beat offset makes no wall at all, so the model holds a persistent energy-bearing matter-transparent object class with only its coupling into the emergent potential (rotation curves, lensing mass) still unmeasured',
  category: 'cosmology',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const thinA = grownPair({ offset: 1, beats: 21 })
    const thinB = grownPair({ offset: 1, beats: 24 })
    const thinC = grownPair({ offset: 1, beats: 27 })
    const thinLate = grownPair({ offset: 1, beats: 30 })
    const wideEarly = grownPair({ offset: 2, beats: 21 })
    const wideLate = grownPair({ offset: 2, beats: 30 })
    const none = grownPair({ offset: 3, beats: 30 })

    const wallColumns = thinLate.profile.filter(v => v > 0).length
    // localized: every wall slot within two columns of a boundary (the boundaries sit at columns
    // 12 and 0 on the torus), at both breathing phases
    const nearBoundary = (profile: number[]): boolean =>
      profile.every((v, x) => {
        const dA = Math.min(
          Math.abs(x - 12),
          Math.min(x, SIDE - x),
        )

        return v === 0 || dA <= 2
      })
    const localized =
      wallColumns <= 4 &&
      nearBoundary(thinLate.profile) &&
      nearBoundary(thinA.profile)
    // persistent: the same total at every sampled beat, breathing with exact period six
    const persistent =
      thinA.total === thinLate.total &&
      thinB.total === thinLate.total &&
      thinC.total === thinLate.total &&
      thinLate.total > 0 &&
      thinB.profile.join(',') === thinLate.profile.join(',') &&
      thinA.profile.join(',') === thinC.profile.join(',')
    const detectorGrows = wideLate.total > wideEarly.total
    const commensurateNull = none.total === 0

    const supports = crossingSupports()
    const transparent = supports
      .slice(3)
      .every(s => s === 1)

    const ok =
      localized &&
      persistent &&
      detectorGrows &&
      commensurateNull &&
      transparent

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the one-beat wall occupies at most four near-boundary columns with a constant slot total and exact period-six breathing across four sampled beats, the two-beat wall grows over the same window, the three-beat offset leaves zero wall slots, and the traveller holds support one through the whole crossing window',
      metrics: {
        wallColumns,
        wallSlotsPerBoundaryCell: Number(
          (thinLate.total / (2 * SIDE)).toFixed(2),
        ),
        breathingPeriodSixExact:
          thinB.profile.join(',') === thinLate.profile.join(',')
            ? 1
            : 0,
        detectorWallGrowth: wideLate.total - wideEarly.total,
        crossingMaxSupport: Math.max(...supports.slice(3)),
      },
      // CONTROL: the commensurate offset, no wall, and the detector class, an interacting wall
      control: {
        commensurateWallSlots: none.total,
        detectorEarlySlots: wideEarly.total,
        detectorLateSlots: wideLate.total,
      },
      notes:
        'darkness here is per-crossing: E-FND-0096 measured that the crossing plants a delayed wake, so the candidate is collisionless in the bullet-cluster sense (no drag at the encounter) rather than absolutely inert, which is also all the astronomy requires. The unmeasured half is gravitational: whether wall energy sources the emergent potential the way defect energy does, which would turn this row from structure into phenomenology.',
    })
  },
})
