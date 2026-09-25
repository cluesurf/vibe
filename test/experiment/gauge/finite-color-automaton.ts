// A deterministic sampler for the classical color group. E-FRC-0103 measured Sigma(648) gauge theory
// with a seeded heatbath, and the notes left the deterministic version open because the Wilson action
// of a 648-element group takes irrational values, which a reversible energy bookkeeping cannot hold
// exactly in floating point.
//
// The way round it: an action with integer values. Each plaquette pays
// E(U) = round(6 (1 - Re Tr U / 3)), a class function that is 0 at the identity and grows with the
// distance from it (levels 0, 3, 4, 5, 6, 7, 8, 9 on Sigma(648)). Any such class function is a lattice
// gauge action, Wilson's being one choice, and this one is close to 6 times Wilson's. With integer
// levels the reversible kinetic rule of E-FRC-0102 carries over exactly (code/dynamics/finite-kinetic):
// each link steps to the next group element its local energy plus its demon allows, the demons stream
// and trade units, and every step is a permutation, so the energy is conserved to the unit and a run
// reverses to the bit.
//
// Measured on 4^4 at five energies, against the seeded heatbath of the same quantized action at the
// inverse coupling the demons read, run from an ordered and a disordered start: the mean plaquette
// Re Tr U / 3. The quantized theory has a first-order partial freezing, so two of the energies land
// where the canonical ensemble is bistable. There the fixed-energy automaton may sit on either branch
// or between them, and it is required to stay inside their envelope. A first version compared only
// with the ordered start and was wrong for exactly those points, which is recorded here. Controls:
// exact reversal of the whole run, and the same demons without streaming and exchange (reported).
//
// Then the action E-FRC-0103 actually uses, with its Re Tr U^2 term, quantized at scale 12 on its
// trajectory ratio. Its lowest level is not the identity, so each run first drains into the ground
// state (see mixedRun), then fills the demons. Three energies, reaching past that experiment's
// N_t = 4 transition at beta0 = 13. The gate here is the seeded microcanonical reference of
// code/dynamics/finite-kinetic, the same ensemble (the lattice and a bounded demon per link at the
// same total energy) under random dynamics: the automaton must agree with it on the plaquette at
// every energy. The canonical heatbath at the demons' coupling is reported beside it from three
// starts (the ground state, the identity, a random state). It agrees at the two higher energies. At
// the lowest it does not, and that is physics rather than a fault: the energy is too low for the
// melted phase to exist at all, so the run sits on the superheated branch of a first-order
// transition and reads a hotter temperature than a run with more energy (the back-bending of
// E-FRC-0102). A canonical heatbath can borrow energy and melts. Held for 4,000 sweeps in a probe,
// the automaton does not drift, and the microcanonical reference lands on the same plaquette. Its
// demon temperature is reported, not gated: at the lowest energy each demon holds under 0.15 units
// and two seeds read beta0 14.25 and 14.77 around the automaton's 14.27. A first version of that reference proposed uniformly random elements, which almost
// never fit a small demon and did not equilibrate, and it is now a heatbath on the energy shell.
//
// Depth L2: the microcanonical demon method made reversible for a finite gauge group, the part a
// base with classical color links would need to run without dice.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeRng } from '@/code/tool/rng'
import {
  finitePlaquette,
  generateGroup,
  makeFiniteGaugeLattice,
  type FiniteGroup,
} from '@/code/dynamics/finite-gauge'
import { SU3_SUBGROUPS } from '@/code/algebra/group/su3-subgroups'
import {
  actionLevels,
  exchangeFiniteDemons,
  finiteKineticSweep,
  microcanonicalSweep,
  mixedActionLevels,
  quantizedEnergy,
  quantizedHeatbathSweep,
  streamFiniteDemons,
  unitDemonBeta,
} from '@/code/dynamics/finite-kinetic'
import { jackknife } from '@/code/measure/jackknife'

const SCALE = 6
const LENGTHS = [4, 4, 4, 4]
const GOLDEN = (Math.sqrt(5) - 1) / 2
const SWEEPS = 400
const SKIP = 150
const EXCHANGES = 4

type Run = {
  plaquette: { value: number; error: number }
  beta: number
  drift: number
}

function automaton(input: {
  group: FiniteGroup
  levels: Int32Array
  capacity: number
  fill: number
  kinetic: boolean
}): Run {
  const { group, levels, capacity, fill, kinetic } = input
  const lattice = makeFiniteGaugeLattice({
    group,
    lengths: LENGTHS,
    start: 'cold',
    rng: makeRng({ seed: 1 }),
  })
  const demons = new Int32Array(lattice.links.length)

  for (let i = 0; i < demons.length; i++) {
    demons[i] = (i * GOLDEN) % 1 < fill ? capacity : 0
  }

  const total = (): number =>
    quantizedEnergy({ lattice, levels }) +
    demons.reduce((a, b) => a + b, 0)
  const e0 = total()
  const samples: number[] = []

  let demonSum = 0

  for (let sweep = 0; sweep < SWEEPS; sweep++) {
    finiteKineticSweep({ lattice, levels, demons, capacity })

    if (kinetic) {
      streamFiniteDemons({ lattice, demons, step: sweep })

      for (let k = 0; k < EXCHANGES; k++) {
        exchangeFiniteDemons({ lattice, demons, capacity, step: k })
      }
    }

    if (sweep >= SKIP) {
      samples.push(finitePlaquette({ lattice }))
      demonSum += demons.reduce((a, b) => a + b, 0) / demons.length
    }
  }

  return {
    plaquette: jackknife({
      samples,
      estimator: s => s.reduce((a, b) => a + b, 0) / s.length,
      binSize: 25,
    }),
    beta: unitDemonBeta({
      meanDemon: demonSum / samples.length,
      capacity,
    }),
    drift: Math.abs(total() - e0),
  }
}

// The modified action of E-FRC-0103, beta1 / beta0 = -1.835 / 13, quantized at scale 12. Its lowest
// level (-1) is not the identity, so a cold start releases energy into the demons and caps how cold a
// run can get. The preparation is therefore a drain: a sweep, then every demon emptied, DRAIN times,
// which walks the lattice into its ground state deterministically. Then the demons are filled and
// the exactly conserving rule runs. Only the initial condition changes, not the dynamics.
const MIXED_SCALE = 12
const MIXED_RATIO = -1.835 / 13
const DRAIN = 100

type MixedRun = {
  plaquette: number
  beta0: number
  drift: number
  groundEnergy: number
  references: { ground: number; cold: number; hot: number }
  microcanonical: { plaquette: number; beta0: number; drift: number }
}

function mixedRun(
  group: FiniteGroup,
  levels: Int32Array,
  capacity: number,
  fill: number,
  seed: number,
): MixedRun {
  const lattice = makeFiniteGaugeLattice({
    group,
    lengths: LENGTHS,
    start: 'cold',
    rng: makeRng({ seed: 1 }),
  })
  const demons = new Int32Array(lattice.links.length)

  const sweep = (step: number): void => {
    finiteKineticSweep({ lattice, levels, demons, capacity })
    streamFiniteDemons({ lattice, demons, step })

    for (let k = 0; k < EXCHANGES; k++) {
      exchangeFiniteDemons({ lattice, demons, capacity, step: k })
    }
  }

  for (let d = 0; d < DRAIN; d++) {
    sweep(d)
    demons.fill(0)
  }

  const groundEnergy = quantizedEnergy({ lattice, levels })
  const groundLinks = Int16Array.from(lattice.links)

  for (let i = 0; i < demons.length; i++) {
    demons[i] = (i * GOLDEN) % 1 < fill ? capacity : 0
  }

  const startDemons = Int32Array.from(demons)
  const total = (): number =>
    quantizedEnergy({ lattice, levels }) +
    demons.reduce((a, b) => a + b, 0)
  const e0 = total()
  const samples: number[] = []

  let demonSum = 0

  // the seeded microcanonical reference: the same drained lattice, the same demons, the same energy
  const microLattice = makeFiniteGaugeLattice({
    group,
    lengths: LENGTHS,
    start: 'cold',
    rng: makeRng({ seed: 1 }),
  })
  const microDemons = Int32Array.from(startDemons)
  const microRng = makeRng({ seed: seed + 30 })
  const microSamples: number[] = []

  let microDemonSum = 0

  microLattice.links.set(groundLinks)

  for (let s = 0; s < 1200; s++) {
    microcanonicalSweep({
      lattice: microLattice,
      levels,
      demons: microDemons,
      capacity,
      rng: microRng,
    })

    if (s >= 400) {
      microSamples.push(finitePlaquette({ lattice: microLattice }))
      microDemonSum +=
        microDemons.reduce((a, b) => a + b, 0) / microDemons.length
    }
  }

  const microcanonical = {
    plaquette:
      microSamples.reduce((a, b) => a + b, 0) / microSamples.length,
    beta0:
      unitDemonBeta({
        meanDemon: microDemonSum / microSamples.length,
        capacity,
      }) * MIXED_SCALE,
    drift: Math.abs(
      quantizedEnergy({ lattice: microLattice, levels }) +
        microDemons.reduce((a, b) => a + b, 0) -
        e0,
    ),
  }

  for (let s = 0; s < 600; s++) {
    sweep(s)

    if (s >= 200) {
      samples.push(finitePlaquette({ lattice }))
      demonSum += demons.reduce((a, b) => a + b, 0) / demons.length
    }
  }

  const beta = unitDemonBeta({
    meanDemon: demonSum / samples.length,
    capacity,
  })

  const reference = (
    start: 'ground' | 'cold' | 'hot',
    k: number,
  ): number => {
    const rng = makeRng({ seed: seed + k })
    const heat = makeFiniteGaugeLattice({
      group,
      lengths: LENGTHS,
      start: start === 'hot' ? 'hot' : 'cold',
      rng,
    })

    if (start === 'ground') {
      heat.links.set(groundLinks)
    }

    const out: number[] = []

    for (let s = 0; s < 400; s++) {
      quantizedHeatbathSweep({ lattice: heat, levels, beta, rng })

      if (s >= 150) {
        out.push(finitePlaquette({ lattice: heat }))
      }
    }

    return out.reduce((a, b) => a + b, 0) / out.length
  }

  return {
    plaquette: samples.reduce((a, b) => a + b, 0) / samples.length,
    beta0: beta * MIXED_SCALE,
    drift: Math.abs(total() - e0),
    groundEnergy,
    references: {
      ground: reference('ground', 0),
      cold: reference('cold', 10),
      hot: reference('hot', 20),
    },
    microcanonical,
  }
}

function heatbath(
  group: FiniteGroup,
  levels: Int32Array,
  beta: number,
  seed: number,
  start: 'cold' | 'hot',
): { value: number; error: number } {
  const rng = makeRng({ seed })
  const lattice = makeFiniteGaugeLattice({
    group,
    lengths: LENGTHS,
    start,
    rng,
  })
  const samples: number[] = []

  for (let sweep = 0; sweep < 300; sweep++) {
    quantizedHeatbathSweep({ lattice, levels, beta, rng })

    if (sweep >= 100) {
      samples.push(finitePlaquette({ lattice }))
    }
  }

  return jackknife({
    samples,
    estimator: s => s.reduce((a, b) => a + b, 0) / s.length,
    binSize: 20,
  })
}

function reversesExactly(
  group: FiniteGroup,
  levels: Int32Array,
  capacity: number,
): boolean {
  // an even side: the eight link classes are non-touching only when no axis wraps an even coordinate
  // onto an even one, which an odd side does
  const lattice = makeFiniteGaugeLattice({
    group,
    lengths: [4, 4, 4, 4],
    start: 'cold',
    rng: makeRng({ seed: 1 }),
  })
  const demons = new Int32Array(lattice.links.length)

  for (let i = 0; i < demons.length; i++) {
    demons[i] = (i * GOLDEN) % 1 < 0.35 ? capacity : 0
  }

  const links0 = Int16Array.from(lattice.links)

  if (lattice.geometry.lengths.some(length => length % 2 !== 0)) {
    return false
  }

  const demons0 = Int32Array.from(demons)

  for (let sweep = 0; sweep < 20; sweep++) {
    finiteKineticSweep({ lattice, levels, demons, capacity })
    streamFiniteDemons({ lattice, demons, step: sweep })

    for (let k = 0; k < EXCHANGES; k++) {
      exchangeFiniteDemons({ lattice, demons, capacity, step: k })
    }
  }

  const moved = lattice.links.some((v, k) => v !== links0[k])

  for (let sweep = 19; sweep >= 0; sweep--) {
    for (let k = EXCHANGES - 1; k >= 0; k--) {
      exchangeFiniteDemons({
        lattice,
        demons,
        capacity,
        step: k,
        reverse: true,
      })
    }

    streamFiniteDemons({ lattice, demons, step: sweep, reverse: true })
    finiteKineticSweep({
      lattice,
      levels,
      demons,
      capacity,
      reverse: true,
    })
  }

  return (
    moved &&
    lattice.links.every((v, k) => v === links0[k]) &&
    demons.every((v, k) => v === demons0[k])
  )
}

export default experiment({
  id: 'gauge/finite-color-automaton',
  code: 'E-FRC-0110',
  title:
    'the classical color group Sigma(648) runs under a deterministic reversible rule with no random number: with an integer-valued plaquette action the kinetic demon rule conserves energy to the unit, reverses to the bit, and reproduces the heatbath plaquette of the same action at the coupling its demons read',
  category: 'gauge',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const group = generateGroup({
      generators: [...SU3_SUBGROUPS.sigma648.generators],
    })
    const levels = actionLevels({ group, scale: SCALE })
    const lowest = Math.min(
      ...Array.from(levels).filter(level => level > 0),
    )
    const capacity = 6 * lowest + 6
    const fills = [0.9, 0.6, 0.35, 0.2, 0.08]
    const runs = fills.map(fill =>
      automaton({ group, levels, capacity, fill, kinetic: true }),
    )
    // Sigma(648) has a first-order partial freezing near a Wilson coupling of 3.5 to 4 (E-FRC-0103),
    // so the canonical reference is run from both an ordered and a disordered start. Where the two
    // agree the point is single phase and the automaton must match them. Where they split the point
    // is inside the hysteresis, and a fixed-energy dynamics must lie within the envelope the two
    // branches span, anywhere from one branch to the other (coexistence, as in E-FRC-0102)
    const references = runs.map((run, k) =>
      heatbath(group, levels, run.beta, 61 + k, 'cold'),
    )
    const hotReferences = runs.map((run, k) =>
      heatbath(group, levels, run.beta, 71 + k, 'hot'),
    )
    const stranded = automaton({
      group,
      levels,
      capacity,
      fill: 0.2,
      kinetic: false,
    })
    const hysteresis = runs.map((_, k) =>
      Math.abs(
        (references[k]?.value ?? 0) - (hotReferences[k]?.value ?? 0),
      ),
    )
    const singlePhase = hysteresis.map(h => h < 0.02)
    const deviations = runs.map((run, k) =>
      Math.abs(run.plaquette.value - (references[k]?.value ?? 0)),
    )
    const pulls = runs.map(
      (run, k) =>
        deviations[k]! /
        Math.hypot(run.plaquette.error, references[k]?.error ?? 0),
    )
    const withinEnvelope = runs.map((run, k) => {
      const low = Math.min(
        references[k]?.value ?? 0,
        hotReferences[k]?.value ?? 0,
      )
      const high = Math.max(
        references[k]?.value ?? 0,
        hotReferences[k]?.value ?? 0,
      )

      return (
        run.plaquette.value > low - 0.01 &&
        run.plaquette.value < high + 0.01
      )
    })

    const exact =
      runs.every(run => run.drift === 0) &&
      stranded.drift === 0 &&
      reversesExactly(group, levels, capacity)
    const matches = runs.every((_, k) =>
      singlePhase[k] === true
        ? (deviations[k] ?? 1) < 0.01
        : withinEnvelope[k] === true,
    )
    const singlePhaseCount = singlePhase.filter(Boolean).length

    // the modified action of E-FRC-0103
    const mixedLevels = mixedActionLevels({
      group,
      scale: MIXED_SCALE,
      ratio: MIXED_RATIO,
    })
    const mixedCapacity =
      3 * Math.max(...Array.from(mixedLevels).map(Math.abs))
    const mixedFills = [0.01, 0.02, 0.04]
    const mixed = mixedFills.map((fill, k) =>
      mixedRun(group, mixedLevels, mixedCapacity, fill, 81 + 10 * k),
    )
    const mixedExact = mixed.every(
      run => run.drift === 0 && run.microcanonical.drift === 0,
    )
    const mixedMatches = mixed.every(
      run =>
        Math.abs(run.plaquette - run.microcanonical.plaquette) < 0.005,
    )
    const mixedReach = Math.max(...mixed.map(run => run.beta0))
    const ok =
      exact &&
      matches &&
      singlePhaseCount >= 2 &&
      mixedExact &&
      mixedMatches &&
      mixedReach >= 13

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on Sigma(648) with the integer plaquette action round(6 (1 - Re Tr U / 3)) the kinetic demon rule conserves plaquette plus demon energy exactly and reverses exactly, matches the heatbath plaquette of the same action within 0.01 wherever ordered and disordered starts agree, and inside the first-order hysteresis lies within the envelope of the two branches, as a fixed-energy dynamics in coexistence must. On the modified action of E-FRC-0103, drained into its ground state first, it conserves energy exactly, reaches past that transition (beta0 at least 13), and agrees with a seeded microcanonical sampler of the same ensemble within 0.005 at every energy, the superheated branch included',
      metrics: {
        ...Object.fromEntries(
          fills.flatMap((fill, k) => [
            [
              `automatonPlaquetteFill${fill}`,
              runs[k]?.plaquette.value ?? Number.NaN,
            ],
            [
              `heatbathPlaquetteFill${fill}`,
              references[k]?.value ?? Number.NaN,
            ],
            [
              `hotHeatbathPlaquetteFill${fill}`,
              hotReferences[k]?.value ?? Number.NaN,
            ],
            [`hysteresisFill${fill}`, hysteresis[k] ?? Number.NaN],
            [`singlePhaseFill${fill}`, singlePhase[k] === true ? 1 : 0],
            [`quantizedBetaFill${fill}`, runs[k]?.beta ?? Number.NaN],
            [`pullFill${fill}`, pulls[k] ?? Number.NaN],
          ]),
        ),
        ...Object.fromEntries(
          mixedFills.flatMap((fill, k) => [
            [
              `mixedAutomatonPlaquetteFill${fill}`,
              mixed[k]?.plaquette ?? Number.NaN,
            ],
            [
              `mixedMicrocanonicalPlaquetteFill${fill}`,
              mixed[k]?.microcanonical.plaquette ?? Number.NaN,
            ],
            [`mixedBeta0Fill${fill}`, mixed[k]?.beta0 ?? Number.NaN],
            [
              `mixedMicrocanonicalBeta0Fill${fill}`,
              mixed[k]?.microcanonical.beta0 ?? Number.NaN,
            ],
            [
              `mixedHeatbathGroundFill${fill}`,
              mixed[k]?.references.ground ?? Number.NaN,
            ],
            [
              `mixedHeatbathColdFill${fill}`,
              mixed[k]?.references.cold ?? Number.NaN,
            ],
            [
              `mixedHeatbathHotFill${fill}`,
              mixed[k]?.references.hot ?? Number.NaN,
            ],
          ]),
        ),
        mixedReachBeta0: mixedReach,
      },
      control: {
        levelsCount: new Set(levels).size,
        lowestNonzeroLevel: lowest,
        capacity,
        strandedPlaquette: stranded.plaquette.value,
        strandedBeta: stranded.beta,
        energyDrift: Math.max(
          ...runs.map(run => run.drift),
          stranded.drift,
        ),
        reversesExactly: exact ? 1 : 0,
        mixedLowestLevel: Math.min(...Array.from(mixedLevels)),
        mixedLevelsCount: new Set(mixedLevels).size,
        mixedCapacity,
        mixedGroundEnergy: mixed[0]?.groundEnergy ?? Number.NaN,
        mixedEnergyDrift: Math.max(
          ...mixed.map(run =>
            Math.max(run.drift, run.microcanonical.drift),
          ),
        ),
      },
      notes:
        'L2. Closes the deterministic-sampler follow-up of E-FRC-0103 for the group, with a changed action: the plaquette action is quantized to integer levels so the bookkeeping is exact, and the Wilson-like coupling is about 6 times the quantized one. The heatbath is the seeded reference for the same quantized action. Bounded demons can hold a population inversion, so a very full start reads a negative temperature, which the heatbath then matches too. Inside the first-order region the demon temperature is not monotonic in the energy (the lowest-energy run reads a smaller beta than the middle one), the back-bending of a finite-box microcanonical caloric curve, so those points are judged by the envelope, not by a single reference. The modified action is measured too, at scale 12 (levels -1 to 16), with the canonical heatbath reported from three starts and the microcanonical reference as the gate, for the reason in the header.',
    })
  },
})
