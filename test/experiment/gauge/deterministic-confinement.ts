// A whole binds and a part does not, under a rule with no random number.
//
// The three-trit model's links are the classical color group: the 24 turns act on the role grid through
// Sigma(648), whose 216 grid moves are its image with the center (the vibe's phase) divided out. E-FRC-0110
// runs Sigma(648) links under a deterministic reversible rule that conserves energy to the unit, and checks
// it against the heatbath on the plaquette only. Binding is a statement about strings, so this measures
// strings, on that same rule, at two energies:
//
// - the string tension: the Creutz ratio chi(2, 2) = -ln(W(2,2) W(1,1) / W(1,2)^2) from rectangular
//   Wilson loops. Positive means a static color pair pays energy in proportion to its separation.
// - a part: the fundamental Polyakov loop, |<Tr P / 3>| averaged per configuration over the spatial
//   volume. Its value is exp(-F / T) for one static color charge. Near zero means a lone color cannot
//   exist (infinite free energy), which is the vibe's triality, the center Z3, unbroken.
// - a whole: the adjoint Polyakov loop (|Tr P|^2 - 1) / 8, a static source of triality zero, what the grid
//   of the three-trit model carries. It stays finite where the fundamental one vanishes, because gluons
//   screen it: a whole has finite energy where a part has none.
//
// Energies: a high one (a confining coupling) and a low one (past the N_t = 4 transition, deconfined),
// each against the seeded heatbath of the same quantized action at the coupling the demons read, on the
// same lattice, by the same instruments. Gates, fixed before the run: energy conserved exactly, at the
// high energy chi(2, 2) above zero by three standard errors and within 0.1 of the heatbath's, the
// fundamental Polyakov loop at the high energy under half its value at the low energy, and the adjoint
// loop at the high energy above the fundamental one.
//
// Depth L2: lattice gauge theory of a finite group, measured deterministically.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeRng } from '@/code/tool/rng'
import {
  finitePlaquette,
  finiteWilsonLoops,
  generateGroup,
  makeFiniteGaugeLattice,
  type FiniteGaugeLattice,
  type FiniteGroup,
} from '@/code/dynamics/finite-gauge'
import { SU3_SUBGROUPS } from '@/code/algebra/group/su3-subgroups'
import {
  actionLevels,
  exchangeFiniteDemons,
  finiteKineticSweep,
  quantizedEnergy,
  quantizedHeatbathSweep,
  streamFiniteDemons,
  unitDemonBeta,
} from '@/code/dynamics/finite-kinetic'
import { jackknife } from '@/code/measure/jackknife'

const SCALE = 6
const LENGTHS = [6, 6, 6, 4]
const GOLDEN = (Math.sqrt(5) - 1) / 2
const SWEEPS = 500
const SKIP = 150
const EXCHANGES = 4
const HIGH_FILL = 0.9
const LOW_FILL = 0.08

type Sample = { w11: number; w12: number; w22: number; fundamental: number; adjoint: number; plaquette: number }

// fundamental and adjoint Polyakov loops along the last axis, averaged over the spatial volume
function polyakov(lattice: FiniteGaugeLattice): { fundamental: number; adjoint: number } {
  const { group, geometry, links } = lattice
  const { dim, sites, up, lengths } = geometry
  const time = dim - 1
  const nt = lengths[time] ?? 1
  const spatial = sites / nt
  const traceRe = (g: number): number => group.trace[g] ?? 0
  const traceIm = (g: number): number => {
    const m = group.matrices[g]

    return (m?.[1] ?? 0) + (m?.[9] ?? 0) + (m?.[17] ?? 0)
  }

  let re = 0
  let im = 0
  let adjoint = 0

  // sites with time coordinate 0 are the first `spatial` indices, the last axis varying slowest
  for (let site = 0; site < spatial; site++) {
    let product = group.identity
    let current = site

    for (let t = 0; t < nt; t++) {
      product = group.product[product * group.order + (links[current * dim + time] ?? 0)] ?? 0
      current = up[current * dim + time] ?? 0
    }

    const tr = traceRe(product)
    const ti = traceIm(product)

    re += tr / 3
    im += ti / 3
    adjoint += (tr * tr + ti * ti - 1) / 8
  }

  return { fundamental: Math.hypot(re, im) / spatial, adjoint: adjoint / spatial }
}

function measure(lattice: FiniteGaugeLattice): Sample {
  const w = finiteWilsonLoops({ lattice, max: 2 })
  const p = polyakov(lattice)

  return {
    w11: w[1]?.[1] ?? 1,
    w12: w[1]?.[2] ?? 1,
    w22: w[2]?.[2] ?? 1,
    fundamental: p.fundamental,
    adjoint: p.adjoint,
    plaquette: finitePlaquette({ lattice }),
  }
}

type Summary = {
  chi: { value: number; error: number }
  fundamental: number
  adjoint: number
  plaquette: number
}

function summarize(samples: Sample[]): Summary {
  const mean = (xs: number[]): number => xs.reduce((a, b) => a + b, 0) / xs.length
  const chi = jackknife({
    samples: samples.map((_, i) => i),
    estimator: picked => {
      const s = picked.map(i => samples[i]!)
      const w11 = mean(s.map(x => x.w11))
      const w12 = mean(s.map(x => x.w12))
      const w22 = mean(s.map(x => x.w22))

      return -Math.log((w22 * w11) / (w12 * w12))
    },
    binSize: 25,
  })

  return {
    chi,
    fundamental: mean(samples.map(s => s.fundamental)),
    adjoint: mean(samples.map(s => s.adjoint)),
    plaquette: mean(samples.map(s => s.plaquette)),
  }
}

function automaton(group: FiniteGroup, levels: Int32Array, capacity: number, fill: number): Summary & { beta: number; drift: number } {
  const lattice = makeFiniteGaugeLattice({ group, lengths: LENGTHS, start: 'cold', rng: makeRng({ seed: 1 }) })
  const demons = new Int32Array(lattice.links.length)

  for (let i = 0; i < demons.length; i++) {
    demons[i] = (i * GOLDEN) % 1 < fill ? capacity : 0
  }

  const total = (): number => quantizedEnergy({ lattice, levels }) + demons.reduce((a, b) => a + b, 0)
  const e0 = total()
  const samples: Sample[] = []

  let demonSum = 0

  for (let sweep = 0; sweep < SWEEPS; sweep++) {
    finiteKineticSweep({ lattice, levels, demons, capacity })
    streamFiniteDemons({ lattice, demons, step: sweep })

    for (let k = 0; k < EXCHANGES; k++) {
      exchangeFiniteDemons({ lattice, demons, capacity, step: k })
    }

    if (sweep >= SKIP) {
      samples.push(measure(lattice))
      demonSum += demons.reduce((a, b) => a + b, 0) / demons.length
    }
  }

  return {
    ...summarize(samples),
    beta: unitDemonBeta({ meanDemon: demonSum / samples.length, capacity }),
    drift: Math.abs(total() - e0),
  }
}

function heatbath(group: FiniteGroup, levels: Int32Array, beta: number, seed: number): Summary {
  const rng = makeRng({ seed })
  const lattice = makeFiniteGaugeLattice({ group, lengths: LENGTHS, start: 'hot', rng })
  const samples: Sample[] = []

  for (let sweep = 0; sweep < SWEEPS; sweep++) {
    quantizedHeatbathSweep({ lattice, levels, beta, rng })

    if (sweep >= SKIP) {
      samples.push(measure(lattice))
    }
  }

  return summarize(samples)
}

export default experiment({
  id: 'gauge/deterministic-confinement',
  code: 'E-FRC-0126',
  title:
    'the classical color group confines under a rule with no random number: on the kinetic demon automaton of Sigma(648) a static color pair pays a string tension (Creutz ratio above zero, matching the heatbath), a lone color has a vanishing Polyakov loop where a triality-zero whole does not, and past the transition the lone color is freed',
  category: 'gauge',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const group = generateGroup({ generators: [...SU3_SUBGROUPS.sigma648.generators] })
    const levels = actionLevels({ group, scale: SCALE })
    const lowest = Math.min(...Array.from(levels).filter(level => level > 0))
    const capacity = 6 * lowest + 6

    const high = automaton(group, levels, capacity, HIGH_FILL)
    const low = automaton(group, levels, capacity, LOW_FILL)
    const highReference = heatbath(group, levels, high.beta, 91)
    const lowReference = heatbath(group, levels, low.beta, 93)

    const ok =
      high.drift === 0 &&
      low.drift === 0 &&
      high.chi.value > 3 * high.chi.error &&
      Math.abs(high.chi.value - highReference.chi.value) < 0.1 &&
      high.fundamental < 0.5 * low.fundamental &&
      high.adjoint > high.fundamental

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'with energy conserved exactly and no random number, at a confining energy the Creutz ratio chi(2, 2) is above zero by three standard errors and within 0.1 of the heatbath at the same coupling, the fundamental Polyakov loop is under half its value past the transition, and the adjoint loop of a triality-zero source exceeds the fundamental one',
      metrics: {
        highBeta: high.beta,
        highPlaquette: high.plaquette,
        highCreutz22: high.chi.value,
        highCreutz22Error: high.chi.error,
        highFundamentalPolyakov: high.fundamental,
        highAdjointPolyakov: high.adjoint,
        lowBeta: low.beta,
        lowPlaquette: low.plaquette,
        lowCreutz22: low.chi.value,
        lowCreutz22Error: low.chi.error,
        lowFundamentalPolyakov: low.fundamental,
        lowAdjointPolyakov: low.adjoint,
        energyDrift: high.drift + low.drift,
      },
      control: {
        heatbathHighCreutz22: highReference.chi.value,
        heatbathHighCreutz22Error: highReference.chi.error,
        heatbathHighFundamentalPolyakov: highReference.fundamental,
        heatbathHighPlaquette: highReference.plaquette,
        heatbathLowCreutz22: lowReference.chi.value,
        heatbathLowFundamentalPolyakov: lowReference.fundamental,
        heatbathLowPlaquette: lowReference.plaquette,
      },
      notes:
        'L2, a 6^3 x 4 lattice, the integer Wilson-like action of E-FRC-0110 at scale 6. The fundamental Polyakov loop is the magnitude of its spatial average per configuration, so it reads about 1 / sqrt(216) for a vanishing loop on this volume, not 0. The adjoint loop is the grid-carrying, triality-zero representation. A two-energy comparison on one box is evidence of confinement at this spacing, not a continuum statement.',
    })
  },
})
