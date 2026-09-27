// The center of SU(3) on its own, under a deterministic reversible rule. Confinement and the
// deconfinement transition of SU(3) are controlled by its center Z3 (Svetitsky and Yaffe 1982), so the
// question for a three-valued base is whether three cyclic values per link, updated by a local rule
// with no randomness, carry that physics.
//
// Each link holds k = 0, 1, 2, the element exp(2 pi i k / 3). The dynamics is a reversible cellular
// automaton, the Z3 form of the Q2R Ising rule: links in eight non-touching classes step to the next
// value of equal local energy. It is deterministic, exactly invertible, and conserves the plaquette
// energy exactly. The energy is set by a fixed sparse pattern of excited links, never a random fill.
// The seeded heatbath of the same Z3 gauge theory is the reference.
//
// Three measured claims, one of them a negative:
//
// - Hot (high energy, the confined phase): the automaton's time averages match the canonical
//   ensemble. The plaquette fixes an effective beta, and at that beta the heatbath must reproduce an
//   independent observable, the area exponent a = ln W(1,2) / ln W(1,1), which is 2 for an area law
//   (confinement) and 3/2 for a perimeter law.
// - Middle energy: the automaton holds a plaquette inside the gap the canonical ensemble jumps across
//   at its first-order transition (between beta 0.60 and 0.65 here), phase coexistence, which only a
//   fixed-energy dynamics can show. The first-order character is the Z3 Potts class that SU(3)
//   deconfinement belongs to.
// - Cold (low energy, the ordered phase): the automaton freezes. An isolated excited link can only
//   swap between its two equal-energy values, so the set of excited plaquettes never changes. With no
//   kinetic variable the deterministic rule cannot reach the ordered phase. E-FRC-0092 shows the same
//   question answered once each link carries a momentum.
//
// Grade L2: Z3 lattice gauge theory (Creutz, Jacobs and Rebbi 1979) and reversible automaton dynamics
// (Vichniac 1984, Pomeau 1984), known constructions. What is measured is where the deterministic rule
// does and does not reproduce the ensemble.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeWeyl } from '@/code/tool/weyl'
import {
  CenterLattice,
  centerHeatbathSweep,
  centerPlaquette,
  centerWilsonLoops,
  makeCenterLattice,
  reversibleSweep,
} from '@/code/dynamics/center-gauge'
import { jackknife } from '@/code/measure/jackknife'
import { bisectThreshold } from '@/code/tool/bisect'

const LENGTHS = [6, 6, 6, 6]
const BIN = 5
// the canonical first-order gap on this box, from the heatbath: the confined branch ends near
// beta 0.60 and the ordered branch starts near 0.65
const GAP_LOW_BETA = 0.6
const GAP_HIGH_BETA = 0.65

type Sample = { plaquette: number; exponent: number }

function sample(lattice: CenterLattice): Sample {
  const table = centerWilsonLoops({ lattice, max: 2 })
  const w11 = table[1]?.[1] ?? 1
  const w12 = table[1]?.[2] ?? 1

  return {
    plaquette: centerPlaquette({ lattice }).plaquette,
    exponent: Math.log(w12) / Math.log(w11),
  }
}

// the plaquette and the area exponent from a list of samples, the exponent from the mean loops
function summarize(samples: readonly Sample[]): {
  plaquette: { value: number; error: number }
  exponent: { value: number; error: number }
} {
  return {
    plaquette: jackknife({
      samples,
      estimator: s => s.reduce((a, b) => a + b.plaquette, 0) / s.length,
      binSize: BIN,
    }),
    exponent: jackknife({
      samples,
      estimator: s => s.reduce((a, b) => a + b.exponent, 0) / s.length,
      binSize: BIN,
    }),
  }
}

function automaton(period: number): {
  samples: Sample[]
  energyDrift: number
  excitedOverlap: number
} {
  const lattice = makeCenterLattice({
    order: 3,
    lengths: LENGTHS,
    pattern: (x, mu) =>
      ((x[0] ?? 0) +
        2 * (x[1] ?? 0) +
        3 * (x[2] ?? 0) +
        5 * (x[3] ?? 0) +
        7 * mu) %
        period ===
      0
        ? 1
        : 0,
  })
  const e0 = centerPlaquette({ lattice }).energy
  const samples: Sample[] = []

  let early = ''

  for (let sweep = 0; sweep < 400; sweep++) {
    reversibleSweep({ lattice })

    if (sweep === 100) {
      early = excitedPattern(lattice)
    }

    if (sweep >= 100 && sweep % 5 === 0) {
      samples.push(sample(lattice))
    }
  }

  return {
    samples,
    energyDrift: Math.abs(centerPlaquette({ lattice }).energy - e0),
    excitedOverlap: overlap(early, excitedPattern(lattice)),
  }
}

// which plaquettes are excited (q != 0), as a string of 0 and 1, the fingerprint of where the energy sits
function excitedPattern(lattice: CenterLattice): string {
  const { dim, sites, up } = lattice.geometry
  const bits: string[] = []

  for (let site = 0; site < sites; site++) {
    for (let mu = 0; mu < dim; mu++) {
      for (let nu = mu + 1; nu < dim; nu++) {
        const q =
          (lattice.links[site * dim + mu] ?? 0) +
          (lattice.links[(up[site * dim + mu] ?? 0) * dim + nu] ?? 0) -
          (lattice.links[(up[site * dim + nu] ?? 0) * dim + mu] ?? 0) -
          (lattice.links[site * dim + nu] ?? 0)

        bits.push(((q % 3) + 3) % 3 === 0 ? '0' : '1')
      }
    }
  }

  return bits.join('')
}

// the share of excited plaquettes that are excited in both patterns
function overlap(a: string, b: string): number {
  let both = 0
  let either = 0

  for (let k = 0; k < a.length; k++) {
    if (a[k] === '1' || b[k] === '1') {
      either += 1

      if (a[k] === '1' && b[k] === '1') {
        both += 1
      }
    }
  }

  return either === 0 ? 1 : both / either
}

function heatbath(beta: number, seed: number): Sample[] {
  const rng = makeWeyl({ start: seed })
  const lattice = makeCenterLattice({ order: 3, lengths: LENGTHS })
  const samples: Sample[] = []

  for (let sweep = 0; sweep < 400; sweep++) {
    centerHeatbathSweep({ lattice, beta, rng })

    if (sweep >= 100 && sweep % 3 === 0) {
      samples.push(sample(lattice))
    }
  }

  return samples
}

export default experiment({
  id: 'gauge/center-automaton',
  code: 'E-FRC-0099',
  title:
    'three cyclic values per link under a deterministic reversible rule reproduce Z3 confinement at high energy and the first-order coexistence of its transition, and freeze at low energy, where the ordered phase needs a kinetic variable',
  category: 'gauge',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const hot = automaton(5)
    const middle = automaton(12)
    const cold = automaton(80)
    const hotSummary = summarize(hot.samples)
    const middleSummary = summarize(middle.samples)
    const coldSummary = summarize(cold.samples)

    // the effective beta: where the heatbath plaquette meets the automaton's, by bisection on the
    // confined branch
    let seed = 990

    const bracket = bisectThreshold({
      low: 0.3,
      high: GAP_LOW_BETA,
      steps: 6,
      isAbove: beta => {
        const s = heatbath(beta, seed++)

        return (
          s.reduce((a, b) => a + b.plaquette, 0) / s.length >
          hotSummary.plaquette.value
        )
      },
    })
    const effectiveBeta = (bracket.low + bracket.high) / 2
    const reference = summarize(heatbath(effectiveBeta, 998))
    const gapLow = summarize(heatbath(GAP_LOW_BETA, 999)).plaquette
      .value
    const gapHigh = summarize(heatbath(GAP_HIGH_BETA, 1000)).plaquette
      .value
    const pull = (
      a: { value: number; error: number },
      b: { value: number; error: number },
    ): number => (a.value - b.value) / Math.hypot(a.error, b.error)
    const exponentPull = pull(hotSummary.exponent, reference.exponent)

    const exact = [hot, middle, cold].every(r => r.energyDrift === 0)
    const confinedMatch = bracket.switched && Math.abs(exponentPull) < 3
    const areaLaw =
      Math.abs(hotSummary.exponent.value - 2) <
      Math.abs(hotSummary.exponent.value - 1.5)
    const coexists =
      middleSummary.plaquette.value > gapLow + 0.05 &&
      middleSummary.plaquette.value < gapHigh - 0.05
    const hotMixes = hot.excitedOverlap < 0.8
    const coldFrozen = cold.excitedOverlap > 0.99
    const ok =
      exact &&
      confinedMatch &&
      areaLaw &&
      coexists &&
      hotMixes &&
      coldFrozen

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the reversible Z3 automaton conserves energy exactly, reproduces the canonical area exponent at the beta its own plaquette picks in the confined phase, holds a plaquette inside the canonical first-order gap at middle energy (coexistence), and freezes at low energy with its excited plaquettes fixed in place',
      metrics: {
        hotPlaquette: hotSummary.plaquette.value,
        hotExponent: hotSummary.exponent.value,
        hotExponentError: hotSummary.exponent.error,
        effectiveBeta,
        heatbathExponent: reference.exponent.value,
        exponentPull,
        middlePlaquette: middleSummary.plaquette.value,
        coldPlaquette: coldSummary.plaquette.value,
        hotExcitedOverlap: hot.excitedOverlap,
        coldExcitedOverlap: cold.excitedOverlap,
      },
      control: {
        canonicalGapLow: gapLow,
        canonicalGapHigh: gapHigh,
        areaLawExponent: 2,
        perimeterLawExponent: 1.5,
        energyDrift: Math.max(
          hot.energyDrift,
          middle.energyDrift,
          cold.energyDrift,
        ),
      },
      notes:
        'L2, known constructions, measured for where a deterministic ternary rule reproduces the ensemble. No random number enters the automaton, and the heatbath is the seeded reference. One 6^4 box. The area exponent is read from 1 x 1 and 1 x 2 loops, the only ones resolved deep in the confined phase. The freezing is the known low-energy non-ergodicity of Q2R-type automata, reported here as the measured limit of the rule, and it says what a three-valued base would need: a kinetic variable per link, as the momenta of E-FRC-0092 provide. The committed vibe rule carries no Z3 at all (E-FRC-0095), so this is what a cyclic tone would buy, not a property of the committed rule.',
    })
  },
})
