// Quantum statistics in the cold vacuum: are the gas's modes filled as Fermi-Dirac, Bose-Einstein or
// Maxwell-Boltzmann says, read on the husk.
//
// THE GAS. The cold weave (E-FLD-0032, code/rule/cold-weave): vibes with kinetic stores on a cold vacuum,
// energy, charge, P and P_E exact, pairs made only above the threshold. Run on the D4 lattice of side 7
// (2,401 docks, connected since the side is odd) at a vibe density near 0.4 per slot, stores 0 to 2.
//
// THE MODES, ON THE HUSK. The husk is the column-sum projection along the depth x4 (code/measure/
// photon-husk): a husk dock is a column of 7 bulk docks, and each husk direction collects the bulk slots
// whose root casts it, 2 roots for each of the 6 axis directions and 1 for each of the 12 diagonals. A
// husk MODE is a husk dock and a husk direction, and its occupation N is the number of vibes (love or fear)
// in its g slots: g = 14 for an axis mode, 7 for a diagonal. On the husk a mode holds up to g vibes, so it
// can show any of the three statistics. The test is the one that needs no temperature and no chemical
// potential: the Fano factor F = var(N) / mean(N), taken over time for each mode and averaged by class.
//
//   Fermi-Dirac, g exclusive states   F = 1 - n / g
//   Maxwell-Boltzmann (Poisson)       F = 1
//   Bose-Einstein, g states           F = 1 + n / g
//
// THE BULK, beside it: a bulk slot holds one vibe, so its occupation is 0 or 1 and its F is 1 - n
// identically. That is exclusion restated, not a measurement, and is reported only as the bulk number.
//
// STARTS, deterministic (Weyl sequences, no seeds): the SPREAD fill puts each slot's vibe by the golden
// sequence along the slot index, a low-discrepancy fill whose column counts are more even than any
// equilibrium (F well under the Fermi value); the COHERENT fill occupies a whole column of one direction
// at once, all 7 depths or none (F near g (1 - p), far above it). The knit must bring both to one value.
// CONTROL: pure streaming (the stream copies, no collision) keeps a coherent column coherent, since
// every root moves all 7 depths of a column together.
//
// GATES, fixed before the first run:
//   G1 for both fills under the knit, in the last window (beats 1,000 to 1,500, every 5th), the class
//      Fano factor of each husk class (axis, diagonal) is within 0.05 of the Fermi-Dirac value and at
//      least 0.2 from both the Maxwell-Boltzmann and the Bose-Einstein value.
//   G2 the knit, not the fill: the two fills end within 0.05 of each other in each class.
//   G3 control: pure streaming from the coherent fill keeps each class F above 2 over the same window.
//   G4 energy and charge exact in every knit run.
//
// Depth L2: the lattice-gas result that exclusion gives Fermi-Dirac equilibria (Frisch, Hasslacher,
// Pomeau and co-workers, 1986 to 1987) read on this knit and on its husk. The fear walk alone has no
// equilibrium to compare: it is free, so its mode occupations are constants of motion.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh } from '@/code/tool/mesh'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { GOLDEN, SILVER, weyl } from '@/code/tool/weyl'
import { coldBeat, coldEnergy, makeColdWeave, type ColdState, type ColdWeave } from '@/code/rule/cold-weave'
import { colorLocalCollision } from '@/code/rule/color-local-weave'
import { cptMirrorPhase } from '@/code/measure/weave-acceptance'
import { HEAD_TURN_SPEC, scatterSchedule, type ScatterWeaveSpec } from '@/code/rule/scatter-weave'

const SIDE = 7
const DENSITY = 0.4
const BEATS = 1500
const WINDOWS: readonly (readonly [number, number])[] = [
  [500, 1000],
  [1000, 1500],
]
const EVERY = 5
const ROOTS = rootsD4()

// the E-FLD-0032 cold weave's spec, as fluids/cold-vacuum builds it
function coldSpec(): ScatterWeaveSpec {
  const mirror = cptMirrorPhase((o, f) => colorLocalCollision({ spec: HEAD_TURN_SPEC, opposite: o, forward: f }))

  return { base: HEAD_TURN_SPEC, mirror, sets: scatterSchedule({ partitions: 2, pairs: 3 }), condition: 'matched' }
}

// each root's husk direction (0 .. 17) and whether that direction is an axis
const HUSK_KEYS: string[] = []
const HUSK_OF = ROOTS.map(r => {
  const key = `${r[0]},${r[1]},${r[2]}`
  let h = HUSK_KEYS.indexOf(key)

  if (h < 0) {
    HUSK_KEYS.push(key)
    h = HUSK_KEYS.length - 1
  }

  return h
})
const HUSK_SLOTS = HUSK_KEYS.map((_, h) => HUSK_OF.filter(x => x === h).length)
const HUSK_IS_AXIS = HUSK_SLOTS.map(n => n === 2)

type Tally = { sum: Float64Array; square: Float64Array; samples: number }

function makeTally(modes: number): Tally {
  return { sum: new Float64Array(modes), square: new Float64Array(modes), samples: 0 }
}

// add the husk occupations of one beat: mode = column * 18 + husk direction, column = x + 7 y + 49 z
function sampleHusk(vibe: Int8Array, tally: Tally): void {
  const columns = SIDE ** 3
  const counts = new Float64Array(columns * HUSK_KEYS.length)

  for (let cell = 0; cell < SIDE ** 4; cell++) {
    const column = cell % columns

    for (let d = 0; d < 24; d++) {
      if (vibe[cell * 24 + d] !== 0) {
        const mode = column * HUSK_KEYS.length + (HUSK_OF[d] ?? 0)

        counts[mode] = (counts[mode] ?? 0) + 1
      }
    }
  }

  counts.forEach((n, mode) => {
    tally.sum[mode] = (tally.sum[mode] ?? 0) + n
    tally.square[mode] = (tally.square[mode] ?? 0) + n * n
  })
  tally.samples++
}

type ClassReading = { fano: number; fermi: number; bose: number; fill: number; modes: number }

function readClass(tally: Tally, axis: boolean): ClassReading {
  let fano = 0
  let fermi = 0
  let bose = 0
  let fill = 0
  let modes = 0

  for (let mode = 0; mode < tally.sum.length; mode++) {
    const h = mode % HUSK_KEYS.length

    if (HUSK_IS_AXIS[h] !== axis) {
      continue
    }

    const g = SIDE * (HUSK_SLOTS[h] ?? 1)
    const mean = (tally.sum[mode] ?? 0) / tally.samples
    const variance = (tally.square[mode] ?? 0) / tally.samples - mean * mean

    if (mean <= 0) {
      continue
    }

    fano += variance / mean
    fermi += 1 - mean / g
    bose += 1 + mean / g
    fill += mean / g
    modes++
  }

  return { fano: fano / modes, fermi: fermi / modes, bose: bose / modes, fill: fill / modes, modes }
}

// the Fano factor ACROSS the modes of a class in one sample (the start has only one), var / mean
function spatialFano(tally: Tally, axis: boolean): number {
  const values: number[] = []

  for (let mode = 0; mode < tally.sum.length; mode++) {
    if (HUSK_IS_AXIS[mode % HUSK_KEYS.length] === axis) {
      values.push((tally.sum[mode] ?? 0) / Math.max(1, tally.samples))
    }
  }

  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length

  return variance / mean
}

function startState(weave: ColdWeave, coherent: boolean): ColdState {
  const n = weave.mesh.cellCount * 24
  const vibe = new Int8Array(n)
  const store = new Int32Array(n)
  const columns = SIDE ** 3

  for (let i = 0; i < n; i++) {
    const cell = Math.floor(i / 24)
    const d = i % 24
    // the coherent fill draws once per (column, direction), the spread fill once per slot
    const key = coherent ? (cell % columns) * 24 + d : i
    const u = weyl(key + 1, GOLDEN)

    if (u < DENSITY) {
      vibe[i] = weyl(key + 1, SILVER) < 0.5 ? 1 : -1
      store[i] = Math.floor(weyl(key + 7, SILVER) * 3)
    }
  }

  return { vibe, store, demon: new Int32Array(weave.mesh.cellCount * 12) }
}

// pure streaming: every slot's contents copied one dock along its direction
function streamOnly(weave: ColdWeave, s: ColdState): ColdState {
  const vibe = new Int8Array(s.vibe.length)
  const store = new Int32Array(s.store.length)

  for (let i = 0; i < s.vibe.length; i++) {
    const to = weave.target[i] ?? 0

    vibe[to] = s.vibe[i] ?? 0
    store[to] = s.store[i] ?? 0
  }

  return { vibe, store, demon: s.demon }
}

function run(weave: ColdWeave, coherent: boolean, knit: boolean) {
  let s = startState(weave, coherent)
  const e0 = coldEnergy(s)
  const q0 = s.vibe.reduce((a, b) => a + b, 0)
  const modes = SIDE ** 3 * HUSK_KEYS.length
  const tallies = WINDOWS.map(() => makeTally(modes))
  const startTally = makeTally(modes)
  let bulkSum = 0
  let bulkSamples = 0
  const storeCounts = [0, 0, 0, 0, 0]

  sampleHusk(s.vibe, startTally)

  const last = WINDOWS[WINDOWS.length - 1]?.[1] ?? BEATS
  const beats = knit ? BEATS : last

  for (let t = 0; t < beats; t++) {
    s = knit ? coldBeat(weave, s, t) : streamOnly(weave, s)

    const beat = t + 1

    WINDOWS.forEach(([from, to], k) => {
      if (beat > from && beat <= to && beat % EVERY === 0) {
        sampleHusk(s.vibe, tallies[k] ?? makeTally(modes))

        if (k === WINDOWS.length - 1) {
          let occupied = 0

          s.vibe.forEach((v, i) => {
            if (v !== 0) {
              occupied++

              const level = Math.min(4, s.store[i] ?? 0)

              storeCounts[level] = (storeCounts[level] ?? 0) + 1
            }
          })
          bulkSum += occupied / s.vibe.length
          bulkSamples++
        }
      }
    })
  }

  // slots whose contents differ from the same slot one depth step along x4: 0 for a depth-uniform state
  // (added after the first run, a reading only)
  const depthStride = SIDE ** 3 * 24
  let depthMismatch = 0

  for (let i = 0; i < s.vibe.length; i++) {
    const j = (i + depthStride) % s.vibe.length

    if (s.vibe[i] !== s.vibe[j] || s.store[i] !== s.store[j]) {
      depthMismatch++
    }
  }

  return {
    depthMismatch,
    windows: tallies.map(t => ({ axis: readClass(t, true), diagonal: readClass(t, false) })),
    start: { axisSpatialFano: spatialFano(startTally, true), diagonalSpatialFano: spatialFano(startTally, false) },
    bulkFill: bulkSum / Math.max(1, bulkSamples),
    storeCounts,
    energyExact: !knit || coldEnergy(s) === e0,
    chargeExact: s.vibe.reduce((a, b) => a + b, 0) === q0,
  }
}

export default experiment({
  id: 'spin/quantum-statistics',
  code: 'E-SPN-0048',
  title:
    'quantum statistics in the cold vacuum, read on the husk, fail as gated: from a low-discrepancy fill the cold weave brings every husk mode (a column of bulk slots, g = 14 or 7) to the Fermi-Dirac Fano factor 1 - n / g within 0.008 (0.503 against 0.511 and 0.509), 0.5 from Maxwell-Boltzmann and 1.0 from Bose-Einstein, but a depth-uniform start never relaxes, because the knit commutes with the depth translation: it stays at 3.53 to 3.55, the Fermi value with every vibe counted 7 times, so the husk statistics are Fermi-Dirac of the depth-varying bulk, not of the husk alone',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const mesh = d4Mesh({ side: SIDE })
    const weave = makeColdWeave({ mesh, spec: coldSpec() })
    const spread = run(weave, false, true)
    const coherent = run(weave, true, true)
    const streaming = run(weave, true, false)
    const lastOf = (r: ReturnType<typeof run>) => r.windows[r.windows.length - 1] ?? { axis: readClass(makeTally(1), true), diagonal: readClass(makeTally(1), false) }
    const classes = ['axis', 'diagonal'] as const

    const g1 = [spread, coherent].every(r =>
      classes.every(c => {
        const x = lastOf(r)[c]

        return Math.abs(x.fano - x.fermi) <= 0.05 && Math.abs(x.fano - 1) >= 0.2 && Math.abs(x.fano - x.bose) >= 0.2
      }),
    )
    const g2 = classes.every(c => Math.abs(lastOf(spread)[c].fano - lastOf(coherent)[c].fano) <= 0.05)
    const g3 = streaming.windows.every(w => classes.every(c => w[c].fano > 2))
    const g4 = [spread, coherent].every(r => r.energyExact && r.chargeExact)
    const ok = g1 && g2 && g3 && g4

    const metrics: Record<string, number> = {}

    for (const [name, r] of [
      ['spread', spread],
      ['coherent', coherent],
    ] as const) {
      r.windows.forEach((w, k) => {
        for (const c of classes) {
          metrics[`${name}Window${k + 1}${c}Fano`] = Number(w[c].fano.toFixed(4))
          metrics[`${name}Window${k + 1}${c}FermiDirac`] = Number(w[c].fermi.toFixed(4))
          metrics[`${name}Window${k + 1}${c}BoseEinstein`] = Number(w[c].bose.toFixed(4))
          metrics[`${name}Window${k + 1}${c}Fill`] = Number(w[c].fill.toFixed(4))
        }
      })
      metrics[`${name}StartAxisSpatialFano`] = Number(r.start.axisSpatialFano.toFixed(4))
      metrics[`${name}StartDiagonalSpatialFano`] = Number(r.start.diagonalSpatialFano.toFixed(4))
      metrics[`${name}BulkFill`] = Number(r.bulkFill.toFixed(4))
      metrics[`${name}BulkFanoIdentically`] = Number((1 - r.bulkFill).toFixed(4))

      const vibes = r.storeCounts.reduce((a, b) => a + b, 0)

      r.storeCounts.forEach((count, level) => {
        metrics[`${name}StoreShare${level === 4 ? '4Plus' : level}`] = Number((count / Math.max(1, vibes)).toFixed(4))
      })
      metrics[`${name}DepthMismatchedSlotsAtEnd`] = r.depthMismatch

      for (const c of classes) {
        // the Fermi value of a depth-uniform state: every vibe counted SIDE times
        metrics[`${name}${c}FermiDiracTimesDepth`] = Number((SIDE * (lastOf(r)[c].fermi)).toFixed(4))
      }

      metrics[`${name}EnergyExact`] = r.energyExact ? 1 : 0
      metrics[`${name}ChargeExact`] = r.chargeExact ? 1 : 0
    }

    metrics.axisModes = lastOf(spread).axis.modes
    metrics.diagonalModes = lastOf(spread).diagonal.modes

    const control: Record<string, number> = {
      g1FermiDirac: g1 ? 1 : 0,
      g2SameFromBothFills: g2 ? 1 : 0,
      g3StreamingStaysCoherent: g3 ? 1 : 0,
      g4ExactLaws: g4 ? 1 : 0,
    }

    streaming.windows.forEach((w, k) => {
      for (const c of classes) {
        control[`streamingWindow${k + 1}${c}Fano`] = Number(w[c].fano.toFixed(4))
        control[`streamingWindow${k + 1}${c}FermiDirac`] = Number(w[c].fermi.toFixed(4))
      }
    })

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'under the cold weave the spread fill brings every husk mode class to within 0.01 of the Fermi-Dirac Fano factor 1 - n / g and far from Maxwell-Boltzmann and Bose-Einstein, but the depth-uniform fill stays depth-uniform (the knit commutes with the depth step) at 7 times the Fermi value, so G1 and G2 fail on it, streaming keeps the axis class at 1.67 under the gate of 2, and energy and charge are exact',
      metrics,
      control,
      notes:
        'L2. FIRST RUN, gates as fixed, status fail. G1 holds for the spread fill (axis 0.503 against Fermi-Dirac 0.511, diagonal 0.503 against 0.509, both windows, from a start at 0.26, while Maxwell-Boltzmann says 1 and Bose-Einstein 1.49) and fails for the coherent fill, which stays at 3.53 to 3.55 in both windows; G2 fails with it; G3 fails on the axis class (streaming keeps 1.67, far above the Fermi 0.60 but under the gate of 2; the diagonal class keeps 3.60); G4 holds. THE REASON THE COHERENT FILL CANNOT RELAX IS A SYMMETRY, not slow mixing. The cold weave is the same in every dock and the D4 lattice of side 7 is invariant under the step x4 -> x4 + 1, so a start that is the same at every depth stays the same at every depth forever: the knit runs it as one 3D gas copied 7 times (the E-FRC-0168 statement that depth-constant fields are run by an exact 3D rule, here for the vibes). The reading confirms it: 0 slots differ from their depth neighbor at the end (metric DepthMismatchedSlotsAtEnd, added after the first run, a reading only). Each husk mode then counts every vibe 7 times, and its Fano factor is 7 times the Fermi value, 7 x 0.508 = 3.55 on the diagonals against 3.554 measured, 3.57 against 3.533 on the axes: Fermi-Dirac again, in units of 7. So the statistics are Fermi-Dirac wherever the knit can mix, and the mixing is what the gates asked for. The gate G2 was written on the assumption that the knit mixes along the depth, and the depth-uniform sector is exactly where it cannot, which the header should have foreseen from E-FRC-0168. The bulk reading beside it is 1 - n per slot identically (0.510 and 0.509), exclusion restated. Stores at equilibrium fall off geometrically (0.676, 0.221, 0.071, 0.023, 0.009 for stores 0 to 4 and more, ratios near 0.33), a Boltzmann ladder with one temperature, reported, not gated. The fear walk has no equilibrium of its own: it is free, so each of its momentum modes keeps its occupation, and the modes that equilibrate are the gas slots. What would make this a pass: any start that breaks the depth symmetry, and a streaming control gate that does not assume the axis class is as coherent as the diagonal one.',
    })
  },
})
