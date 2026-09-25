// The acceptance battery on the color weave's vibes. E-FRC-0124 found that color is an exact local law
// only on a wire table with no hop, so the color weave runs the turning weave's schedule with the hop
// removed. Roles never change a vibe, so the vibe side of that rule is exactly turningWeave with the
// 'bind' table, and every test the committed turning weave was adopted by can be asked of it by the same
// code. Each item runs on both tables; the committed table is the reference. Gates, fixed before the run:
// the hop-free table must do at least as well as the committed one on every item the committed one
// passes. Travel and protected species are reported for both, not gated, because they are the known cost.
//
// 1. Reversal and charge: 24 beats forward and back restore a dense state exactly, charge kept every beat
//    (side 5).
// 2. CPT at the collision level: negation with time reversal at a mirror phase, on one cell's 24 slots,
//    400 sparse and dense states per beat (as E-FRC-0109).
// 3. Vacuum: the empty state's period, and that it recurs exactly from birth over three schedule periods
//    (side 7).
// 4. Universality: the line graph a lone tone's disturbance draws over 24 beats, on the vacuum and on a
//    dense background (side 5). Fewer components is better.
// 5. Interference: two tones far apart, run alone and together, the joint clock-amplitude difference
//    equal to the sum of the two while their light cones have not met (side 11).
// 6. Walls: half the box born one beat late, the content a nonzero whole number of sheets (side 9).
// 7. Dressing: a lone tone on every direction for four periods, the worst growth of its support (side 9).
// 8. Travel and protected species, reported (side 13 and side 9).
//
// Depth L2: a constructed rule measured against stated gates.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { meshOpposites } from '@/code/tool/mesh'
import { beat, growingBeat, inverseBeat } from '@/code/rule/lattice-gas'
import { turningWeave, type Collision } from '@/code/rule/collision'
import { makeWill, type Will } from '@/code/tone/will'
import { clockAmplitude } from '@/code/measure/clock-amplitude'
import { d4BoxCell, d4BoxCoordinates, d4BoxDistance, d4BoxMesh } from '@/code/substrate/d4-box'

type Table = 'pair' | 'bind'

const PERIOD = 24
const GOLDEN = (Math.sqrt(5) - 1) / 2
const LATE_BY = 1
const TRAVEL_BEATS = 6

function difference(a: Will, b: Will): number {
  let count = 0

  for (let i = 0; i < a.data.length; i++) {
    count += a.data[i] === b.data[i] ? 0 : 1
  }

  return count
}

function rules(side: number, table: Table): {
  mesh: ReturnType<typeof d4BoxMesh>
  forward: (t: number) => Collision
  backward: (t: number) => Collision
} {
  const mesh = d4BoxMesh({ side })
  const opposite = meshOpposites(mesh)

  return {
    mesh,
    forward: turningWeave({ opposite, table }),
    backward: turningWeave({ opposite, table, forward: false }),
  }
}

function battery(table: Table): {
  reverses: boolean
  chargeKept: boolean
  cptPhase: number
  vacuumPeriod: number
  vacuumComponents: number
  denseComponents: number
  additivityWorst: number
  wallQuantized: boolean
  wallMax: number
  worstGrowth: number
  protectedSpecies: number
  travellers: number
  meanReach: number
} {
  // 1. reversal and charge, side 5
  const five = rules(5, table)
  const dense = (): Will => {
    const will = makeWill(five.mesh)

    for (let i = 0; i < will.data.length; i++) {
      const u = ((i + 1) * GOLDEN * 1.37) % 1

      will.data[i] = u < 0.2 ? -1 : u < 0.8 ? 0 : 1
    }

    return will
  }
  const start = dense()
  const charge = (w: Will): number => w.data.reduce((a, b) => a + b, 0)

  let s = dense()
  let chargeKept = true

  for (let t = 0; t < PERIOD; t++) {
    s = beat(s, five.forward(t))
    chargeKept = chargeKept && charge(s) === charge(start)
  }

  for (let t = PERIOD - 1; t >= 0; t--) {
    s = inverseBeat(s, five.backward(t))
  }

  const reverses = s.data.every((x, i) => x === start.data[i])

  // 2. CPT at the collision level
  const applyCell = (collision: Collision, v: Int8Array): Int8Array => {
    const out = Int8Array.from(v)

    collision(out, 0, 24)

    return out
  }

  let cptPhase = -1

  for (let c = 0; c < PERIOD && cptPhase < 0; c++) {
    let holds = true

    for (let t = 0; t < PERIOD && holds; t++) {
      const mirror = (((c - t) % PERIOD) + PERIOD) % PERIOD

      for (let n = 0; n < 400 && holds; n++) {
        const v = new Int8Array(24)

        for (let i = 0; i < 24; i++) {
          v[i] = ((n * 31 + i * 7 + ((n * i) % 5)) % 3) - 1

          if (n % 2 === 0 && (n + i) % 5 !== 0) {
            v[i] = 0
          }
        }

        const rhs = applyCell(five.forward(t), v)
        const lhs = applyCell(five.backward(mirror), Int8Array.from(v, x => -x))

        holds = lhs.every((x, k) => -x === rhs[k])
      }
    }

    cptPhase = holds ? c : -1
  }

  // 3. vacuum, side 7, three periods
  const seven = rules(7, table)

  let vacuum: Will = makeWill(seven.mesh)

  const states: string[] = [vacuum.data.join('')]

  for (let t = 0; t < 3 * PERIOD; t++) {
    vacuum = beat(vacuum, seven.forward(t))
    states.push(vacuum.data.join(''))
  }

  let vacuumPeriod = 0

  for (let p = 1; p <= PERIOD && vacuumPeriod === 0; p++) {
    vacuumPeriod = states.every((x, t) => t + p >= states.length || x === states[t + p]) ? p : 0
  }

  // 4. universality: the line graph on the vacuum and on a dense background, side 5
  const opposite5 = meshOpposites(five.mesh)
  const lines: [number, number][] = []

  for (let d = 0; d < 24; d++) {
    if (d < (opposite5[d] ?? d)) {
      lines.push([d, opposite5[d] ?? d])
    }
  }

  const lineOf = (d: number): number => lines.findIndex(([a, b]) => a === d || b === d)
  const center5 = 2 * (1 + 5 + 25 + 125)
  const components = (withDense: boolean): number => {
    const parent = Array.from({ length: 12 }, (_, i) => i)
    const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x] ?? x)))

    for (let direction = 0; direction < 24; direction++) {
      let vac: Will = withDense ? dense() : makeWill(five.mesh)
      let seeded: Will = withDense ? dense() : makeWill(five.mesh)
      const slot = center5 * 24 + direction
      const touched = new Set<number>()

      seeded.data[slot] = seeded.data[slot] === 1 ? -1 : 1

      for (let t = 0; t < PERIOD; t++) {
        vac = beat(vac, five.forward(t))
        seeded = beat(seeded, five.forward(t))

        for (let i = 0; i < seeded.data.length; i++) {
          if (seeded.data[i] !== vac.data[i]) {
            touched.add(lineOf(i % 24))
          }
        }
      }

      for (const line of touched) {
        parent[find(line)] = find(lineOf(direction))
      }
    }

    return new Set(Array.from({ length: 12 }, (_, i) => find(i))).size
  }

  const vacuumComponents = components(false)
  const denseComponents = components(true)

  // 5. interference, side 11
  const eleven = rules(11, table)
  const seedA = d4BoxCell({ coordinates: [1, 1, 1, 1], side: 11 })
  const seedB = d4BoxCell({ coordinates: [6, 6, 6, 6], side: 11 })
  const branch = (seeds: number[]): [number, number][] => {
    let vac: Will = makeWill(eleven.mesh)
    let seeded: Will = makeWill(eleven.mesh)
    const out: [number, number][] = []

    for (const cell of seeds) {
      seeded.data[cell * 24] = 1
    }

    for (let t = 0; t < 6; t++) {
      vac = beat(vac, eleven.forward(t))
      seeded = beat(seeded, eleven.forward(t))

      const a = clockAmplitude(seeded)
      const b = clockAmplitude(vac)

      out.push([a[0] - b[0], a[1] - b[1]])
    }

    return out
  }
  const a = branch([seedA])
  const b = branch([seedB])
  const joint = branch([seedA, seedB])
  const additivityWorst = Math.max(
    ...joint.map((j, t) => Math.hypot(j[0] - (a[t]?.[0] ?? 0) - (b[t]?.[0] ?? 0), j[1] - (a[t]?.[1] ?? 0) - (b[t]?.[1] ?? 0))),
  )

  // 6. walls, side 9
  const nine = rules(9, table)
  const late = (cell: number): boolean => (d4BoxCoordinates({ cell, side: 9 })[0] ?? 0) >= 5

  let staggered: Will = makeWill(nine.mesh)
  let uniform: Will = makeWill(nine.mesh)

  const wall: number[] = []

  for (let t = 0; t < 8 * PERIOD; t++) {
    staggered = growingBeat(staggered, nine.forward(t), cell => (late(cell) ? t >= LATE_BY : true))
    uniform = growingBeat(uniform, nine.forward(t), () => true)
    wall.push(difference(staggered, uniform))
  }

  const sheet = 9 ** 3
  const settled = wall.slice(3 * PERIOD)
  const wallQuantized = settled.every(x => x % sheet === 0)
  const wallMax = Math.max(...settled)

  // 7 and 8. dressing and protected species, side 9
  const center9 = d4BoxCell({ coordinates: [4, 4, 4, 4], side: 9 })

  let worstGrowth = 0
  let protectedSpecies = 0

  for (let direction = 0; direction < 24; direction++) {
    let vac: Will = makeWill(nine.mesh)
    let seeded: Will = makeWill(nine.mesh)
    const support: number[] = []

    seeded.data[center9 * 24 + direction] = 1

    for (let t = 0; t < 4 * PERIOD; t++) {
      vac = beat(vac, nine.forward(t))
      seeded = beat(seeded, nine.forward(t))
      support.push(difference(seeded, vac))
    }

    protectedSpecies += support.slice(0, PERIOD).every(x => x === 1) ? 1 : 0
    worstGrowth = Math.max(worstGrowth, Math.max(...support.slice(-PERIOD)) / Math.max(1, Math.max(...support.slice(0, PERIOD))))
  }

  // 8. travel, side 13
  const thirteen = rules(13, table)
  const center13 = d4BoxCell({ coordinates: [6, 6, 6, 6], side: 13 })
  const free = Math.SQRT2 * TRAVEL_BEATS
  const reaches = Array.from({ length: 24 }, (_, direction) => {
    let vac: Will = makeWill(thirteen.mesh)
    let seeded: Will = makeWill(thirteen.mesh)

    seeded.data[center13 * 24 + direction] = 1

    for (let t = 0; t < TRAVEL_BEATS; t++) {
      vac = beat(vac, thirteen.forward(t))
      seeded = beat(seeded, thirteen.forward(t))
    }

    let farthest = 0

    for (let i = 0; i < seeded.data.length; i += 24) {
      for (let d = 0; d < 24; d++) {
        if (seeded.data[i + d] !== vac.data[i + d]) {
          farthest = Math.max(farthest, d4BoxDistance({ a: i / 24, b: center13, side: 13 }))
          break
        }
      }
    }

    return farthest
  })

  return {
    reverses,
    chargeKept,
    cptPhase,
    vacuumPeriod,
    vacuumComponents,
    denseComponents,
    additivityWorst,
    wallQuantized,
    wallMax,
    worstGrowth,
    protectedSpecies,
    travellers: reaches.filter(r => r >= free / 2).length,
    meanReach: reaches.reduce((x, y) => x + y, 0) / reaches.length,
  }
}

export default experiment({
  id: 'gauge/color-weave-acceptance',
  code: 'E-FRC-0125',
  title:
    "the color weave's vibes, the turning weave with the hop removed, against the acceptance battery the committed rule was adopted by, each item run on both tables by the same code: reversal, charge, CPT, the vacuum, universality, interference, walls and dressing, with travel and protected species reported",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const bind = battery('bind')
    const pair = battery('pair')
    const atLeast = (ok: boolean, reference: boolean): boolean => ok || !reference

    const ok =
      atLeast(bind.reverses, pair.reverses) &&
      atLeast(bind.chargeKept, pair.chargeKept) &&
      atLeast(bind.cptPhase >= 0, pair.cptPhase >= 0) &&
      atLeast(bind.vacuumPeriod > 0, pair.vacuumPeriod > 0) &&
      bind.vacuumComponents <= pair.vacuumComponents &&
      bind.denseComponents <= pair.denseComponents &&
      atLeast(bind.additivityWorst < 1e-9, pair.additivityWorst < 1e-9) &&
      atLeast(bind.wallQuantized && bind.wallMax > 0, pair.wallQuantized && pair.wallMax > 0) &&
      bind.worstGrowth <= pair.worstGrowth

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the hop-free table does at least as well as the committed table on every acceptance item the committed table passes: reversal, charge, CPT at a mirror phase, a periodic vacuum, line-graph components on the vacuum and on a dense background, exact superposition, sheet-quantized walls and bounded dressing',
      metrics: {
        reverses: bind.reverses ? 1 : 0,
        chargeConserved: bind.chargeKept ? 1 : 0,
        cptMirrorPhase: bind.cptPhase,
        vacuumPeriod: bind.vacuumPeriod,
        vacuumLineComponents: bind.vacuumComponents,
        denseLineComponents: bind.denseComponents,
        additivityWorst: bind.additivityWorst,
        wallQuantized: bind.wallQuantized ? 1 : 0,
        wallSettledMax: bind.wallMax,
        worstSupportGrowth: bind.worstGrowth,
        protectedSpecies: bind.protectedSpecies,
        travellers: bind.travellers,
        meanReach: bind.meanReach,
      },
      control: {
        committedReverses: pair.reverses ? 1 : 0,
        committedCptMirrorPhase: pair.cptPhase,
        committedVacuumPeriod: pair.vacuumPeriod,
        committedVacuumLineComponents: pair.vacuumComponents,
        committedDenseLineComponents: pair.denseComponents,
        committedAdditivityWorst: pair.additivityWorst,
        committedWallQuantized: pair.wallQuantized ? 1 : 0,
        committedWallSettledMax: pair.wallMax,
        committedWorstSupportGrowth: pair.worstGrowth,
        committedProtectedSpecies: pair.protectedSpecies,
        committedTravellers: pair.travellers,
        committedMeanReach: pair.meanReach,
        freeReach: Math.SQRT2 * TRAVEL_BEATS,
      },
      notes:
        'L2, exact, no random numbers. Roles never change a vibe in the color weave, so its vibe dynamics is turningWeave with the bind table exactly, and this battery is that rule. Gates are comparative: at least as good as the committed table wherever the committed table passes. Travel and protected species are the price of dropping the hop and are reported, not gated.',
    })
  },
})
