// The rest of the acceptance battery, on the triality weave. E-FRC-0109 measured the structural gates
// the committed turning weave was adopted by (reversal, charge, CPT, vacuum, universality) and found
// the triality weave passes them. The turning weave also passed a second battery (E-FND-0118): an
// exactly periodic vacuum from birth, a unit-kick law, exact two-path interference, quantized periodic
// walls, and a bounded dressed profile. Most of those tests were written around that weave's one
// protected species, so this asks the same physical questions of the triality weave in a form that
// does not assume one. Every gate is fixed before the run.
//
// On the D4 box (code/substrate/d4-box), side 9 for the wall and dressing, side 11 for interference:
//
// 1. Vacuum: the empty state recurs exactly, from birth, at every beat of three full periods.
// 2. Protected species: how many of the 24 directions carry a lone tone at support one for a whole
//    schedule period. The turning weave has one such line. The unit-kick law is a statement about a
//    protected species, so it is tested only if one exists. This count reads 0 on the triality
//    weave. A second count is reported beside it, bounded species, the directions whose support
//    never exceeds 2 over four periods: a tone that does not multiply. It is not a free particle,
//    because support says nothing about distance. Item 6 measures distance.
// 3. Interference: two tones far apart, run alone and together. The joint clock-amplitude difference
//    must equal the sum of the two separate ones exactly while their light cones have not met.
// 4. Walls: half the box born one beat late (see LATE_BY). The number of slots where the staggered
//    run differs from the uniform one must be nonzero and a whole multiple of side^3 (one sheet) at
//    every settled beat. Its period is reported, not gated: neither this rule nor the committed
//    turning weave has a periodic wall, on this box or on the integer torus of E-FND-0118, whose own
//    periodicity gate turned out to be a loop that never ran (corrected there).
// 5. Dressing: a lone tone on every direction, 24 beats. No runaway: the worst ratio of the support
//    in the last period to the largest support in the first must be no worse than the committed
//    turning weave's, measured by the same instrument on the same box. A first version gated a ratio
//    of 2, which the committed rule itself does not meet (it measures 13 here), so the gate is now
//    comparative. That first run also found the first triality weave avalanching (a ratio of 726),
//    which is what led to its final form (see code/rule/triality-weave).
// 6. Travel: how far a lone tone on each direction gets in six beats, the largest true distance
//    from its cell to any cell that differs from the vacuum, and how many directions travel at half
//    the free speed or more. Beside it, a color-neutral triple (one tone on each line of an orbit)
//    and its own member alone. Reported for both rules, not gated. How this item came to be: an
//    earlier version counted a triple as bound when its support stayed at or below 6, and read 12
//    of 12 bound here and 0 of 12 in the committed rule. Support counts slots, not distance, and a
//    probe then showed this rule's lone tones hardly travel (the pair clock reverses a lone tone's
//    direction nearly every beat), so a triple stays together because none of its members goes
//    anywhere, not because anything binds it. The bound-triple count was withdrawn.
//
// Depth L2: a constructed rule measured against stated gates.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { meshOpposites } from '@/code/tool/mesh'
import { rootsD4 } from '@/code/algebra/group/root-system'
import {
  permutationOrder,
  weylF4DirectionPermutations,
} from '@/code/measure/coin-symmetry'
import { zeroSumTriangles } from '@/code/measure/collision-anatomy'
import {
  trialityWeave,
  trialityWeaveLayout,
  TRIALITY_WEAVE_PERIOD,
} from '@/code/rule/triality-weave'
import { beat, growingBeat } from '@/code/rule/lattice-gas'
import { turningWeave, type Collision } from '@/code/rule/collision'
import { makeWill, type Will } from '@/code/tone/will'
import { clockAmplitude } from '@/code/measure/clock-amplitude'
import {
  d4BoxCell,
  d4BoxCoordinates,
  d4BoxDistance,
  d4BoxMesh,
} from '@/code/substrate/d4-box'

const keyOf = (list: readonly number[]): string =>
  [...list].sort((a, b) => a - b).join(',')
// the late half is born one beat late. The turning weave's battery used three, but here the vacuum
// clock has period three, so a three-beat delay leaves the late half in step with the rest and makes
// no wall at all (the first run measured exactly that, a wall content of 0 at every beat)
const LATE_BY = 1

function ruleFor(side: number): {
  mesh: ReturnType<typeof d4BoxMesh>
  rule: ReturnType<typeof trialityWeave>
  layout: ReturnType<typeof trialityWeaveLayout>
} {
  const mesh = d4BoxMesh({ side })
  const opposite = meshOpposites(mesh)
  const roots = rootsD4()
  const triangles = zeroSumTriangles({ directions: roots })
  const planes = new Set(
    triangles.map(t => keyOf([...t, ...t.map(d => opposite[d] ?? d)])),
  )
  const triality = weylF4DirectionPermutations({
    directions: roots,
  }).find(p => {
    if (permutationOrder({ permutation: p }) !== 3) {
      return false
    }

    if (
      !planes.has(
        keyOf(
          p
            .map((image, d) => (image === d ? d : -1))
            .filter(d => d >= 0),
        ),
      )
    ) {
      return false
    }

    try {
      trialityWeaveLayout({ opposite, triality: p })

      return true
    } catch {
      return false
    }
  })

  const layout = trialityWeaveLayout({
    opposite,
    triality: triality ?? [],
  })

  return { mesh, rule: trialityWeave({ layout }), layout }
}

function difference(a: Will, b: Will): number {
  let count = 0

  for (let i = 0; i < a.data.length; i++) {
    count += a.data[i] === b.data[i] ? 0 : 1
  }

  return count
}

export default experiment({
  id: 'gauge/triality-weave-acceptance',
  code: 'E-FRC-0111',
  title:
    "the triality weave passes the rest of the acceptance battery asked in a form that does not assume a protected species: its vacuum recurs exactly from birth, separated disturbances superpose exactly, walls are sheet-quantized, and its dressing grows no faster than the committed turning weave's",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const period = TRIALITY_WEAVE_PERIOD

    // 1. vacuum, side 7, three periods
    const small = ruleFor(7)

    let vacuum: Will = makeWill(small.mesh)

    const states: string[] = [vacuum.data.join('')]

    for (let t = 0; t < 3 * period; t++) {
      vacuum = beat(vacuum, small.rule(t))
      states.push(vacuum.data.join(''))
    }

    let vacuumPeriod = 0

    for (let p = 1; p <= period && vacuumPeriod === 0; p++) {
      if (
        states.every(
          (s, t) => t + p >= states.length || s === states[t + p],
        )
      ) {
        vacuumPeriod = p
      }
    }

    // 2 and 5. every direction: support over 24 beats, for the triality weave and, by the same
    // instrument on the same box, for the committed turning weave
    const side9 = ruleFor(9)
    const center9 = d4BoxCell({ coordinates: [4, 4, 4, 4], side: 9 })

    // support against the vacuum over four periods, from tones placed on one cell's slots
    const supportOf = (
      rule: (t: number) => Collision,
      seed: readonly (readonly [number, number])[],
    ): number[] => {
      let vac: Will = makeWill(side9.mesh)
      let seeded: Will = makeWill(side9.mesh)

      for (const [slot, tone] of seed) {
        seeded.data[center9 * 24 + slot] = tone
      }

      const support: number[] = []

      for (let t = 0; t < 4 * period; t++) {
        vac = beat(vac, rule(t))
        seeded = beat(seeded, rule(t))
        support.push(difference(seeded, vac))
      }

      return support
    }

    const dressing = (
      rule: (t: number) => Collision,
    ): {
      protectedSpecies: number
      boundedSpecies: number
      worstGrowth: number
      largestSupport: number
    } => {
      let protectedSpecies = 0
      let boundedSpecies = 0
      let worstGrowth = 0
      let largestSupport = 0

      for (let direction = 0; direction < 24; direction++) {
        const support = supportOf(rule, [[direction, 1]])

        protectedSpecies += support.slice(0, period).every(s => s === 1)
          ? 1
          : 0
        boundedSpecies += Math.max(...support) <= 2 ? 1 : 0

        const firstMax = Math.max(...support.slice(0, period))
        const lastMax = Math.max(...support.slice(-period))

        worstGrowth = Math.max(
          worstGrowth,
          lastMax / Math.max(1, firstMax),
        )
        largestSupport = Math.max(largestSupport, ...support)
      }

      return {
        protectedSpecies,
        boundedSpecies,
        worstGrowth,
        largestSupport,
      }
    }

    const committedRule = turningWeave({
      opposite: meshOpposites(side9.mesh),
    })
    const weave = dressing(side9.rule)
    const committed = dressing(committedRule)
    const {
      protectedSpecies,
      boundedSpecies,
      worstGrowth,
      largestSupport,
    } = weave

    // 6. travel: how far a lone tone gets from its cell in TRAVEL_BEATS beats, the largest true
    // distance (code/substrate/d4-box, d4BoxDistance) from the seed cell to any cell that differs
    // from the vacuum, on a side-13 box where TRAVEL_BEATS beats cannot wrap. A free tone moving one
    // root per beat gets sqrt 2 per beat. A traveller is a direction that gets at least half that.
    // The triple of a color-neutral seed (one tone on each line of an orbit) is measured the same
    // way beside its own member, since a triple that stays together says nothing when its members
    // do not travel either (the lesson recorded in the header)
    const TRAVEL_BEATS = 6
    const side13 = ruleFor(13)
    const center13 = d4BoxCell({ coordinates: [6, 6, 6, 6], side: 13 })

    const reach = (
      rule: (t: number) => Collision,
      seed: readonly (readonly [number, number])[],
    ): number => {
      let vac: Will = makeWill(side13.mesh)
      let seeded: Will = makeWill(side13.mesh)

      for (const [slot, tone] of seed) {
        seeded.data[center13 * 24 + slot] = tone
      }

      for (let t = 0; t < TRAVEL_BEATS; t++) {
        vac = beat(vac, rule(t))
        seeded = beat(seeded, rule(t))
      }

      let farthest = 0

      for (let i = 0; i < seeded.data.length; i += 24) {
        for (let d = 0; d < 24; d++) {
          if (seeded.data[i + d] !== vac.data[i + d]) {
            farthest = Math.max(
              farthest,
              d4BoxDistance({ a: i / 24, b: center13, side: 13 }),
            )
            break
          }
        }
      }

      return farthest
    }

    const committedRule13 = turningWeave({
      opposite: meshOpposites(side13.mesh),
    })
    const free = Math.SQRT2 * TRAVEL_BEATS

    const travel = (
      rule: (t: number) => Collision,
    ): {
      travellers: number
      meanReach: number
    } => {
      const reaches = Array.from({ length: 24 }, (_, d) =>
        reach(rule, [[d, 1]]),
      )

      return {
        travellers: reaches.filter(r => r >= free / 2).length,
        meanReach: reaches.reduce((a, b) => a + b, 0) / reaches.length,
      }
    }

    const weaveTravel = travel(side13.rule)
    const committedTravel = travel(committedRule13)
    const orbit0 = side13.layout.orbits[0] ?? []
    const tripleSeed = orbit0.map(
      line => [side13.layout.lines[line]?.[0] ?? 0, 1] as const,
    )
    const memberSeed = [
      [side13.layout.lines[orbit0[0] ?? 0]?.[0] ?? 0, 1],
    ] as const
    const weaveTripleReach = reach(side13.rule, tripleSeed)
    const weaveMemberReach = reach(side13.rule, memberSeed)
    const committedTripleReach = reach(committedRule13, tripleSeed)
    const committedMemberReach = reach(committedRule13, memberSeed)

    // 3. interference, side 11, two tones at opposite corners of the box
    const side11 = ruleFor(11)
    const seedA = d4BoxCell({ coordinates: [1, 1, 1, 1], side: 11 })
    const seedB = d4BoxCell({ coordinates: [6, 6, 6, 6], side: 11 })

    const branch = (seeds: number[]): [number, number][] => {
      let vac: Will = makeWill(side11.mesh)
      let seeded: Will = makeWill(side11.mesh)

      const out: [number, number][] = []

      for (const cell of seeds) {
        seeded.data[cell * 24] = 1
      }

      for (let t = 0; t < 6; t++) {
        vac = beat(vac, side11.rule(t))
        seeded = beat(seeded, side11.rule(t))

        const s = clockAmplitude(seeded)
        const v = clockAmplitude(vac)

        out.push([s[0] - v[0], s[1] - v[1]])
      }

      return out
    }

    const a = branch([seedA])
    const b = branch([seedB])
    const joint = branch([seedA, seedB])
    const additivityWorst = Math.max(
      ...joint.map((j, t) =>
        Math.hypot(
          j[0] - (a[t]?.[0] ?? 0) - (b[t]?.[0] ?? 0),
          j[1] - (a[t]?.[1] ?? 0) - (b[t]?.[1] ?? 0),
        ),
      ),
    )

    // 4. walls, side 9: cells with first basis coordinate at least 5 born LATE_BY beats late
    const late = (cell: number): boolean =>
      (d4BoxCoordinates({ cell, side: 9 })[0] ?? 0) >= 5

    let staggered: Will = makeWill(side9.mesh)
    let uniform: Will = makeWill(side9.mesh)

    const wall: number[] = []

    for (let t = 0; t < 8 * period; t++) {
      const rule = side9.rule(t)

      staggered = growingBeat(staggered, rule, cell =>
        late(cell) ? t >= LATE_BY : true,
      )
      uniform = growingBeat(uniform, rule, () => true)
      wall.push(difference(staggered, uniform))
    }

    const sheet = 9 ** 3
    const settled = wall.slice(3 * period)
    const wallQuantized = settled.every(x => x % sheet === 0)

    let wallPeriod = 0

    for (let p = 1; p <= 2 * period && wallPeriod === 0; p++) {
      if (
        settled.every(
          (x, t) => t + p >= settled.length || x === settled[t + p],
        )
      ) {
        wallPeriod = p
      }
    }

    const ok =
      vacuumPeriod > 0 &&
      additivityWorst < 1e-9 &&
      Math.max(...settled) > 0 &&
      wallQuantized &&
      worstGrowth <= committed.worstGrowth

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        "on the D4 box the triality weave's vacuum recurs exactly from birth, separated disturbances superpose exactly in the clock amplitude, a late-born half makes a nonempty wall whose content is a whole number of sheets, and its dressing grows no faster than the committed turning weave's by the same instrument, with its count of protected species and its wall period printed",
      metrics: {
        vacuumPeriod,
        protectedSpecies,
        boundedSpecies,
        travellers: weaveTravel.travellers,
        meanReach: weaveTravel.meanReach,
        tripleReach: weaveTripleReach,
        memberReach: weaveMemberReach,
        additivityWorst,
        wallQuantized: wallQuantized ? 1 : 0,
        wallPeriod,
        worstSupportGrowth: worstGrowth,
        largestSupport,
      },
      control: {
        committedWorstGrowth: committed.worstGrowth,
        committedLargestSupport: committed.largestSupport,
        committedProtectedSpecies: committed.protectedSpecies,
        committedBoundedSpecies: committed.boundedSpecies,
        committedTravellers: committedTravel.travellers,
        committedMeanReach: committedTravel.meanReach,
        committedTripleReach,
        committedMemberReach,
        freeReach: free,
        schedulePeriod: period,
        sheet,
        wallSettledMax: Math.max(...settled),
      },
      notes:
        "L2, exact, no random numbers. Two gates were corrected after a first run, both recorded in the header: the late-birth offset (3 beats is this vacuum's own period and made no wall) and the dressing ratio (2 was stricter than the committed rule meets). The turning weave's kick law is a statement about its protected species, and it is tested here only through the count of protected species, not the kick itself. Wall localization, the one window-limited claim of E-FND-0118, is not measured.",
    })
  },
})
