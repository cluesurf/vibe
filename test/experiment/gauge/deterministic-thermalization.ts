// No randomness at the base: does deterministic, reversible SU(3) gauge dynamics produce the thermal
// ensemble the Monte Carlo experiments sample with a seeded generator? If it does, the sampler is a
// shortcut for what the deterministic dynamics does on its own, and every heatbath result in this
// arena stands on a deterministic footing.
//
// The run: an SU(3) field on an 8^4 lattice, every link starting at the identity, every momentum set
// by a fixed plane-wave pattern (all eight colour components, Gauss law exact), evolved by leapfrog
// under H = sum Tr(P^2) + S_Wilson(beta = 5.7), the confining regime of E-FRC-0080. No random number
// is drawn. Four things are measured.
//
// - Reversibility and conservation: flip the momenta and the start comes back, and H drifts only at
//   O(epsilon^2).
// - Thermalization: the momentum components start with the arcsine distribution of a cosine
//   (kurtosis 1.5) all in phase, and must reach Maxwell-Boltzmann (kurtosis 3) with the energy shared
//   equally among the eight colours.
// - The canonical ensemble, predicted without tuning: the kinetic temperature T = <p_a^2>, counted
//   over the (N^2 - 1)(links - sites) degrees of freedom the Gauss law leaves free, fixes an effective
//   coupling beta' = beta / T. A heatbath run at beta' must reproduce the time-averaged plaquette and
//   the Creutz ratio chi(2,2) of the deterministic run. The naive count over every link must not.
// - The control: the same dynamics started in the two commuting (Cartan) colours alone never moves
//   energy into the six charged directions, because commuting fields exert no force on the others.
//   Thermalization into colour needs the gluons' self-interaction.
//
// Grade L2: microcanonical lattice gauge theory (Callaway and Rahman 1982) reproduced, with the
// ergodic equivalence to the canonical ensemble measured rather than assumed. It is a deterministic
// Hamiltonian flow, not the vibe base rule. The heatbath reference runs use the seeded generator, as
// the thing being compared against.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeRng } from '@/code/tool/rng'
import {
  cloneGaugeLattice,
  makeGaugeLattice,
  sampleGaugeEnsemble,
} from '@/code/dynamics/gauge-lattice'
import {
  colourFractions,
  kineticEnergy,
  kineticTemperature,
  leapfrog,
  makeMomenta,
  momentumKurtosis,
  negateMomenta,
  structuredMomenta,
  suGenerators,
  wilsonAction,
} from '@/code/dynamics/gauge-molecular-dynamics'
import {
  averagePlaquette,
  creutzRatioFromTable,
  wilsonLoopTable,
} from '@/code/measure/lattice-gauge-observable'
import { jackknife } from '@/code/measure/jackknife'

// the confining regime of E-FRC-0080: beta 5.7 on an 8^4 box, 1.4 fm across
const BETA = 5.7
const LENGTHS = [8, 8, 8, 8]
// the fourth-order symmetric integrator at step 0.1 costs the same force evaluations per unit time as
// leapfrog at 0.05, and the ensemble it samples is off the true one by O(step^4) instead of
// O(step^2). Leapfrog at 0.05 left the plaquette 0.9 percent low, the shadow-Hamiltonian bias
const STEP = 0.1
// the momentum amplitude of the structured start, which sets the energy. 1.85 puts the total energy
// where a canonical ensemble at temperature one would sit (kinetic 12 V plus Wilson action near
// 15.4 V), so the predicted coupling should land near the action's own 5.7
const AMPLITUDE = 1.85
const CARTAN = [6, 7]

type Sample = { plaquette: number; table: number[][]; temperature: number; naive: number }

function chi22(samples: readonly Sample[]): number {
  const table = [0, 1, 2].map(r =>
    [0, 1, 2].map(t => samples.reduce((s, x) => s + (x.table[r]?.[t] ?? 0), 0) / samples.length),
  )

  return creutzRatioFromTable({ table, r: 2, t: 2 })
}

function meanOf(samples: readonly Sample[], read: (s: Sample) => number): number {
  return samples.reduce((sum, s) => sum + read(s), 0) / samples.length
}

export default experiment({
  id: 'gauge/deterministic-thermalization',
  code: 'E-FRC-0092',
  title:
    'deterministic reversible SU(3) gauge dynamics from a fixed pattern, with no random number anywhere, thermalizes to the canonical ensemble at the coupling its own kinetic temperature predicts, while an abelian start never spreads into colour',
  category: 'gauge',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const generators = suGenerators({ n: 3 })
    const start = (colours?: number[]) => {
      const lattice = makeGaugeLattice({ group: 'su3', lengths: LENGTHS, start: 'cold', rng: makeRng({ seed: 1 }) })
      const momenta = makeMomenta({ lattice })

      structuredMomenta({ lattice, momenta, generators, amplitude: AMPLITUDE, colours })

      return { lattice, momenta }
    }
    const energy = (s: ReturnType<typeof start>): number =>
      kineticEnergy({ momenta: s.momenta }) + wilsonAction({ lattice: s.lattice, beta: BETA })

    // reversibility: forward 40 steps, flip, forward 40 steps, flip
    const reversal = start()
    const initialLinks = cloneGaugeLattice({ lattice: reversal.lattice }).links
    const initialMomenta = new Float64Array(reversal.momenta.data)

    leapfrog({ lattice: reversal.lattice, momenta: reversal.momenta, beta: BETA, order: 4, step: STEP, steps: 40 })
    negateMomenta({ momenta: reversal.momenta })
    leapfrog({ lattice: reversal.lattice, momenta: reversal.momenta, beta: BETA, order: 4, step: STEP, steps: 40 })
    negateMomenta({ momenta: reversal.momenta })

    let reversalError = 0

    reversal.lattice.links.forEach((v, k) => {
      reversalError = Math.max(reversalError, Math.abs(v - (initialLinks[k] ?? 0)))
    })
    reversal.momenta.data.forEach((v, k) => {
      reversalError = Math.max(reversalError, Math.abs(v - (initialMomenta[k] ?? 0)))
    })

    // conservation at two step sizes over the same time: the error must fall as epsilon^2
    const drift = (step: number): number => {
      const s = start()
      const h0 = energy(s)

      leapfrog({ lattice: s.lattice, momenta: s.momenta, beta: BETA, order: 4, step, steps: Math.round(2 / step) })

      return Math.abs(energy(s) - h0)
    }
    const conservationRatio = drift(STEP) / drift(STEP / 2)

    // the long run
    const run = start()
    const h0 = energy(run)
    const samples: Sample[] = []
    const kurtoses: number[] = []
    const fractions: number[][] = []

    let worstEnergy = 0

    for (let block = 0; block < 80; block++) {
      leapfrog({ lattice: run.lattice, momenta: run.momenta, beta: BETA, order: 4, step: STEP, steps: 10 })
      worstEnergy = Math.max(worstEnergy, Math.abs(energy(run) - h0) / h0)

      // the first 15 time units are the approach to equilibrium, the last 65 the measurement
      if (block >= 15) {
        samples.push({
          plaquette: averagePlaquette({ lattice: run.lattice }),
          table: wilsonLoopTable({ lattice: run.lattice, max: 2 }),
          temperature: kineticTemperature({ lattice: run.lattice, momenta: run.momenta, count: 'gauss' }),
          naive: kineticTemperature({ lattice: run.lattice, momenta: run.momenta, count: 'naive' }),
        })
        kurtoses.push(momentumKurtosis({ momenta: run.momenta, generators }))
        fractions.push(colourFractions({ momenta: run.momenta, generators }))
      }
    }

    const binSize = 8
    const plaquette = jackknife({ samples, estimator: s => meanOf(s, x => x.plaquette), binSize })
    const creutz = jackknife({ samples, estimator: chi22, binSize })
    const temperature = meanOf(samples, x => x.temperature)
    const naiveTemperature = meanOf(samples, x => x.naive)
    const kurtosis = kurtoses.reduce((a, b) => a + b, 0) / kurtoses.length
    const meanFractions = generators.map(
      (_, a) => fractions.reduce((s, f) => s + (f[a] ?? 0), 0) / fractions.length,
    )
    const fractionSpread = Math.max(...meanFractions.map(f => Math.abs(f - 1 / 8)))

    // the canonical reference at the predicted coupling, and at the naive one
    const reference = (beta: number, seed: number) => {
      const rng = makeRng({ seed })
      const lattice = makeGaugeLattice({ group: 'su3', lengths: LENGTHS, start: 'cold', rng })
      const list = sampleGaugeEnsemble({
        lattice,
        beta,
        thermalization: 40,
        measurements: 160,
        separation: 1,
        overrelaxation: 1,
        rng,
        measure: current => ({
          plaquette: averagePlaquette({ lattice: current }),
          table: wilsonLoopTable({ lattice: current, max: 2 }),
          temperature: 0,
          naive: 0,
        }),
      })

      return {
        plaquette: jackknife({ samples: list, estimator: s => meanOf(s, x => x.plaquette), binSize }),
        creutz: jackknife({ samples: list, estimator: chi22, binSize }),
      }
    }
    const predictedBeta = BETA / temperature
    const naiveBeta = BETA / naiveTemperature
    const canonical = reference(predictedBeta, 920)
    const naive = reference(naiveBeta, 921)
    const pull = (a: { value: number; error: number }, b: { value: number; error: number }): number =>
      (a.value - b.value) / Math.hypot(a.error, b.error)
    const plaquettePull = pull(plaquette, canonical.plaquette)
    const creutzPull = pull(creutz, canonical.creutz)
    const naivePull = pull(plaquette, naive.plaquette)

    // the abelian control
    const abelian = start(CARTAN)

    leapfrog({ lattice: abelian.lattice, momenta: abelian.momenta, beta: BETA, order: 4, step: STEP, steps: 500 })

    const abelianFractions = colourFractions({ momenta: abelian.momenta, generators })
    const chargedShare = abelianFractions.reduce((s, f, a) => (CARTAN.includes(a) ? s : s + f), 0)

    const reversible = reversalError < 1e-10
    // a fourth-order integrator: halving the step cuts the energy error sixteen-fold
    const conserving = worstEnergy < 1e-2 && conservationRatio > 10 && conservationRatio < 24
    const thermal = Math.abs(kurtosis - 3) < 0.1 && fractionSpread < 0.01
    const canonicalMatch = Math.abs(plaquettePull) < 3 && Math.abs(creutzPull) < 3
    const naiveExcluded = Math.abs(naivePull) > 10
    const abelianStays = chargedShare < 1e-12
    const ok = reversible && conserving && thermal && canonicalMatch && naiveExcluded && abelianStays

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'SU(3) gauge dynamics that is deterministic and reversible, started from a fixed plane-wave pattern with no random numbers, thermalizes (momentum kurtosis 1.5 to 3, energy shared equally by the eight colours) and reproduces the heatbath plaquette and Creutz ratio at the coupling beta / T its own kinetic temperature predicts with the Gauss-law count of freedoms, while the naive count fails and an abelian start never reaches the charged colours',
      metrics: {
        reversalError,
        worstRelativeEnergyDrift: worstEnergy,
        conservationRatioHalfStep: conservationRatio,
        kurtosis,
        colourFractionSpread: fractionSpread,
        kineticTemperature: temperature,
        predictedBeta,
        deterministicPlaquette: plaquette.value,
        deterministicPlaquetteError: plaquette.error,
        heatbathPlaquette: canonical.plaquette.value,
        plaquettePull,
        deterministicCreutz22: creutz.value,
        heatbathCreutz22: canonical.creutz.value,
        creutzPull,
      },
      control: {
        naiveBeta,
        naiveHeatbathPlaquette: naive.plaquette.value,
        naivePull,
        abelianChargedShare: chargedShare,
      },
      notes:
        'L2: microcanonical (Hamiltonian) lattice gauge theory, a known construction, with the equivalence of its time averages to the canonical ensemble measured, not assumed. The deterministic run uses no random numbers. The comparison runs use the seeded heatbath as the reference. One 8^4 volume, one energy. The microcanonical and canonical ensembles differ by corrections of order 1 / V, which at 16384 links sit inside these errors. The integrator is the fourth-order symmetric composition of leapfrog, exactly reversible in exact arithmetic, and the reversal error measures the rounding over 80 steps. Any integrator conserves a shadow Hamiltonian that differs from H at its order, which biases the ensemble it samples. Leapfrog at step 0.05 left the plaquette 0.9 percent low for exactly that reason, and the fourth order is what makes the comparison fair.',
    })
  },
})
