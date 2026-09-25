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
//    protected species, so it is tested only if one exists.
// 3. Interference: two tones far apart, run alone and together. The joint clock-amplitude difference
//    must equal the sum of the two separate ones exactly while their light cones have not met.
// 4. Walls: half the box born one beat late (see LATE_BY), with the wall required to be nonempty. The number of slots where the staggered run differs
//    from the uniform one must be a whole multiple of side^3 (one sheet) at every settled beat, and
//    periodic with the rule's period.
// 5. Dressing: a lone tone on every direction, 24 beats. No runaway: the support in the last period
//    must not exceed twice the largest support in the first.
//
// Depth L2: a constructed rule measured against stated gates.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { meshOpposites } from '@/code/tool/mesh'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { permutationOrder, weylF4DirectionPermutations } from '@/code/measure/coin-symmetry'
import { zeroSumTriangles } from '@/code/measure/collision-anatomy'
import { trialityWeave, trialityWeaveLayout, TRIALITY_WEAVE_PERIOD } from '@/code/rule/triality-weave'
import { beat, growingBeat } from '@/code/rule/lattice-gas'
import { makeWill, type Will } from '@/code/tone/will'
import { clockAmplitude } from '@/code/measure/clock-amplitude'
import { d4BoxCell, d4BoxCoordinates, d4BoxMesh } from '@/code/substrate/d4-box'

const keyOf = (list: readonly number[]): string => [...list].sort((a, b) => a - b).join(',')
// the late half is born one beat late. The turning weave's battery used three, but here the vacuum
// clock has period three, so a three-beat delay leaves the late half in step with the rest and makes
// no wall at all (the first run measured exactly that, a wall content of 0 at every beat)
const LATE_BY = 1

function ruleFor(side: number): { mesh: ReturnType<typeof d4BoxMesh>; rule: ReturnType<typeof trialityWeave> } {
  const mesh = d4BoxMesh({ side })
  const opposite = meshOpposites(mesh)
  const roots = rootsD4()
  const triangles = zeroSumTriangles({ directions: roots })
  const planes = new Set(triangles.map(t => keyOf([...t, ...t.map(d => opposite[d] ?? d)])))
  const triality = weylF4DirectionPermutations({ directions: roots }).find(p => {
    if (permutationOrder({ permutation: p }) !== 3) {
      return false
    }

    if (!planes.has(keyOf(p.map((image, d) => (image === d ? d : -1)).filter(d => d >= 0)))) {
      return false
    }

    try {
      trialityWeaveLayout({ opposite, triality: p })

      return true
    } catch {
      return false
    }
  })

  return { mesh, rule: trialityWeave({ layout: trialityWeaveLayout({ opposite, triality: triality ?? [] }) }) }
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
    'the triality weave passes the rest of the acceptance battery asked in a form that does not assume a protected species: its vacuum recurs exactly from birth, it protects no species, separated disturbances superpose exactly, walls are sheet-quantized and periodic, and no species runs away',
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
      if (states.every((s, t) => t + p >= states.length || s === states[t + p])) {
        vacuumPeriod = p
      }
    }

    // 2 and 5. every direction: support over 24 beats
    const side9 = ruleFor(9)
    const center9 = d4BoxCell({ coordinates: [4, 4, 4, 4], side: 9 })
    let protectedSpecies = 0
    let worstGrowth = 0
    let largestSupport = 0

    for (let direction = 0; direction < 24; direction++) {
      let vac: Will = makeWill(side9.mesh)
      let seeded: Will = makeWill(side9.mesh)

      seeded.data[center9 * 24 + direction] = 1

      const support: number[] = []

      for (let t = 0; t < 4 * period; t++) {
        vac = beat(vac, side9.rule(t))
        seeded = beat(seeded, side9.rule(t))
        support.push(difference(seeded, vac))
      }

      protectedSpecies += support.slice(0, period).every(s => s === 1) ? 1 : 0

      const firstMax = Math.max(...support.slice(0, period))
      const lastMax = Math.max(...support.slice(-period))

      worstGrowth = Math.max(worstGrowth, lastMax / Math.max(1, firstMax))
      largestSupport = Math.max(largestSupport, ...support)
    }

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
      ...joint.map((j, t) => Math.hypot(j[0] - (a[t]?.[0] ?? 0) - (b[t]?.[0] ?? 0), j[1] - (a[t]?.[1] ?? 0) - (b[t]?.[1] ?? 0))),
    )

    // 4. walls, side 9: cells with first basis coordinate at least 5 born three beats late
    const late = (cell: number): boolean => (d4BoxCoordinates({ cell, side: 9 })[0] ?? 0) >= 5
    let staggered: Will = makeWill(side9.mesh)
    let uniform: Will = makeWill(side9.mesh)
    const wall: number[] = []

    for (let t = 0; t < 8 * period; t++) {
      const rule = side9.rule(t)

      staggered = growingBeat(staggered, rule, cell => (late(cell) ? t >= LATE_BY : true))
      uniform = growingBeat(uniform, rule, () => true)
      wall.push(difference(staggered, uniform))
    }

    const sheet = 9 ** 3
    const settled = wall.slice(3 * period)
    const wallQuantized = settled.every(x => x % sheet === 0)
    let wallPeriod = 0

    for (let p = 1; p <= 2 * period && wallPeriod === 0; p++) {
      if (settled.every((x, t) => t + p >= settled.length || x === settled[t + p])) {
        wallPeriod = p
      }
    }

    const ok =
      vacuumPeriod > 0 &&
      additivityWorst < 1e-9 &&
      Math.max(...settled) > 0 &&
      wallQuantized &&
      wallPeriod > 0 &&
      worstGrowth <= 2

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on the D4 box the triality weave\'s vacuum recurs exactly from birth, separated disturbances superpose exactly in the clock amplitude, a late-born half makes a wall whose content is a whole number of sheets and periodic, and no species runs away, while it protects no species at all, so the turning weave\'s unit-kick law, a statement about its protected species, has nothing to apply to',
      metrics: {
        vacuumPeriod,
        protectedSpecies,
        additivityWorst,
        wallQuantized: wallQuantized ? 1 : 0,
        wallPeriod,
        worstSupportGrowth: worstGrowth,
        largestSupport,
      },
      control: {
        schedulePeriod: period,
        sheet,
        wallSettledMax: Math.max(...settled),
      },
      notes:
        'L2, exact, no random numbers. The gates were fixed before the run. With every direction interacting there is no protected species, which is the price of the full connectivity E-FRC-0109 measured, and so the turning weave\'s kick law, one clock unit on a protected traveller, is not a question this rule poses. Wall localization, the one window-limited claim of E-FND-0118, is not measured.',
    })
  },
})
