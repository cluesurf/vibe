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
// - a part: the fundamental Polyakov loop <Tr P / 3>, its signed spatial mean averaged over
//   configurations, exp(-F / T) for one static color charge. The center Z3 (the vibe's phase) multiplies it
//   by a cube root of unity, so where that symmetry is unbroken it is zero: a lone color has infinite free
//   energy. A source of triality zero, a whole, is center-neutral, so the symmetry does not forbid it. The
//   adjoint loop (|Tr P|^2 - 1) / 8 is reported beside it.
//
// Energies, chosen from a scan of the demon fill (tmp/probe-confinement-window): two in the melted phase
// below Sigma(648)'s freezing (Wilson couplings about 3.3 and 4.3), and one on the ordered branch, each
// against the seeded heatbath of the same quantized action at the coupling the demons read, on the same
// lattice, by the same instruments. Gates: energy conserved exactly, at both melted energies chi(2, 2) above
// zero by three standard errors and within 0.1 of the heatbath's, and |<P>| under 0.01, and on the ordered
// branch |<P>| above 0.1.
//
// A first version used a fill of 0.9 and one of 0.08. The first put the demons at infinite temperature
// (beta 0.01), where every loop past W(1,1) is noise and chi(2, 2) meant nothing. The second froze the
// automaton into the ordered branch at a coupling where the heatbath melts (E-FRC-0110's superheated branch).
// It also gated the adjoint loop above the magnitude of the fundamental one, which compared a signed mean
// with a magnitude carrying a noise floor of 1 / sqrt(216). The scan, not those guesses, picked the fills.
//
// Depth L2: lattice gauge theory of a finite group, measured deterministically.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeWeyl } from '@/code/tool/weyl'
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
const MELTED_FILLS = [0.35, 0.3]
const ORDERED_FILL = 0.25

type Sample = { w11: number; w12: number; w22: number; re: number; im: number; adjoint: number; plaquette: number }

// fundamental and adjoint Polyakov loops along the last axis, averaged over the spatial volume
function polyakov(lattice: FiniteGaugeLattice): { re: number; im: number; adjoint: number } {
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

  return { re: re / spatial, im: im / spatial, adjoint: adjoint / spatial }
}

function measure(lattice: FiniteGaugeLattice): Sample {
  const w = finiteWilsonLoops({ lattice, max: 2 })
  const p = polyakov(lattice)

  return {
    w11: w[1]?.[1] ?? 1,
    w12: w[1]?.[2] ?? 1,
    w22: w[2]?.[2] ?? 1,
    re: p.re,
    im: p.im,
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
    fundamental: Math.hypot(mean(samples.map(s => s.re)), mean(samples.map(s => s.im))),
    adjoint: mean(samples.map(s => s.adjoint)),
    plaquette: mean(samples.map(s => s.plaquette)),
  }
}

function automaton(group: FiniteGroup, levels: Int32Array, capacity: number, fill: number): Summary & { beta: number; drift: number } {
  const lattice = makeFiniteGaugeLattice({ group, lengths: LENGTHS, start: 'cold', rng: makeWeyl({ start: 1 }) })
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
  const rng = makeWeyl({ start: seed })
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
    'the classical color group confines under a rule with no random number: on the kinetic demon automaton of Sigma(648), at two energies in the melted phase a static color pair pays a string tension (Creutz ratio chi(2, 2) above zero, matching the heatbath) and the fundamental Polyakov loop vanishes (the center, the vibe phase, unbroken, so a lone color has infinite free energy), while on the ordered branch the loop is nonzero and a lone color is freed',
  category: 'gauge',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const group = generateGroup({ generators: [...SU3_SUBGROUPS.sigma648.generators] })
    const levels = actionLevels({ group, scale: SCALE })
    const lowest = Math.min(...Array.from(levels).filter(level => level > 0))
    const capacity = 6 * lowest + 6

    const melted = MELTED_FILLS.map((fill, k) => {
      const run = automaton(group, levels, capacity, fill)

      return { fill, run, reference: heatbath(group, levels, run.beta, 91 + k) }
    })
    const ordered = automaton(group, levels, capacity, ORDERED_FILL)
    const orderedReference = heatbath(group, levels, ordered.beta, 99)

    const ok =
      melted.every(({ run }) => run.drift === 0) &&
      ordered.drift === 0 &&
      melted.every(({ run, reference }) => run.chi.value > 3 * run.chi.error && Math.abs(run.chi.value - reference.chi.value) < 0.1) &&
      melted.every(({ run }) => run.fundamental < 0.01) &&
      ordered.fundamental > 0.1

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'with energy conserved exactly and no random number, at two melted energies chi(2, 2) is above zero by three standard errors and within 0.1 of the heatbath at the coupling the demons read, and |<P>| is under 0.01, while on the ordered branch |<P>| is above 0.1',
      metrics: {
        ...Object.fromEntries(
          melted.flatMap(({ run }, k) => [
            [`meltedBeta${k + 1}`, run.beta],
            [`meltedWilsonCoupling${k + 1}`, SCALE * run.beta],
            [`meltedPlaquette${k + 1}`, run.plaquette],
            [`meltedCreutz22_${k + 1}`, run.chi.value],
            [`meltedCreutz22Error${k + 1}`, run.chi.error],
            [`meltedPolyakov${k + 1}`, run.fundamental],
            [`meltedAdjointPolyakov${k + 1}`, run.adjoint],
          ]),
        ),
        orderedBeta: ordered.beta,
        orderedPlaquette: ordered.plaquette,
        orderedPolyakov: ordered.fundamental,
        orderedAdjointPolyakov: ordered.adjoint,
        energyDrift: melted.reduce((a, { run }) => a + run.drift, 0) + ordered.drift,
      },
      control: {
        ...Object.fromEntries(
          melted.flatMap(({ reference }, k) => [
            [`heatbathCreutz22_${k + 1}`, reference.chi.value],
            [`heatbathCreutz22Error${k + 1}`, reference.chi.error],
            [`heatbathPolyakov${k + 1}`, reference.fundamental],
            [`heatbathPlaquette${k + 1}`, reference.plaquette],
          ]),
        ),
        heatbathAtOrderedBetaPlaquette: orderedReference.plaquette,
        heatbathAtOrderedBetaPolyakov: orderedReference.fundamental,
      },
      notes:
        'L2, a 6^3 x 4 lattice, the integer Wilson-like action of E-FRC-0110 at scale 6, 350 measured sweeps per run. |<P>| is the magnitude of the configuration average of the signed spatial mean. The ordered branch is the frozen phase of a finite group at a demon coupling where the canonical heatbath melts (E-FRC-0110), so it shows the center broken and a lone color freed, not a thermal deconfinement of the continuum theory. Confinement at this spacing, not a continuum statement.',
    })
  },
})
