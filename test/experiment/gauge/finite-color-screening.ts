// Dynamical quarks with the finite color group screen a static color pair, and shift the plaquette.
//
// The companion of E-FRC-0138, on the same deterministic Sigma(648) automaton with dynamical color triplets
// (code/dynamics/finite-matter). Where E-FRC-0138 asks whether matter breaks the center, this asks what that
// does to a static quark and antiquark, and to the gauge field itself:
//
// - screening, string breaking in its thermal form. The Polyakov loop correlator
//   C(R) = Re <P(x) P*(x + R)> is exp(-F(R) / T) for a static pair R apart. In the confined pure gauge
//   theory it falls toward zero as R grows, since the string's energy grows with its length. With matter a
//   pair can be pulled from calm and bind to each static charge, so F(R) stops growing: C(R) levels off at
//   |<P>|^2 and the connected part C(R) - |<P>|^2 goes to zero. Read for R = 0 .. 3 on 6^3 x 4 (the most
//   this box resolves), with binned jackknife errors
// - the plaquette, two ways. At the same demon temperature, against the seeded canonical heatbath of the
//   pure gauge action at the coupling the matter run's demons read: sea quarks make the gauge field more
//   ordered at fixed coupling. And at the same total energy, against the pure gauge automaton with the
//   same demon fill: the bonds release energy into the demons and the gauge field is hotter
// - the quenched limit: the same automaton with a mass so heavy that no pair is ever paid for, where the
//   loop and the long-distance correlator must return to zero
//
// Gates, fixed before the final run: with matter C(3) above ten standard errors and the connected
// correlator at R = 3 within three standard errors of zero; for pure gauge and for heavy matter C(3)
// within three standard errors of zero; the matched-temperature plaquette shift positive by five standard
// errors; energy and charge exact on every beat of every run.
//
// Result, first run (606 s), and the gate that failed. With matter C(R) = 0.1214, 0.00902, 0.00734,
// 0.00660 for R = 0 .. 3 against |<P>|^2 = 0.00728: the correlator levels off at |<P>|^2, and C(3) is 21
// standard errors above zero. Pure gauge and the heavy mass (no pair ever created) read C(3) = -0.00039 and
// -0.00052, within 1.2 and 1.8 standard errors of zero. The plaquette rises by 0.1072 +- 0.0003 over the
// canonical pure gauge value at the matter run's coupling, and falls by 0.0436 at the same total energy.
// Energy and charge exact throughout. The connected correlator is 0.00174 at R = 1, 0.00006 +- 0.00024 at
// R = 2 and -0.00068 +- 0.00023 at R = 3: at R = 3, half the box, it overshoots below zero by 3.02
// standard errors, and the gate asked for under 3. So the experiment fails on that one item, by a hair,
// and the failure stands. Whether R = 3 is a real anticorrelation across half a periodic box or the bias
// of the |<P>|^2 estimator (the square of a mean, taken over 10 bins) is not resolved here. The screening
// itself is carried by R = 2, where the connected part is already zero.
//
// Depth L2: known lattice physics (screening of a static charge by dynamical matter, and the plaquette
// shift of sea quarks) reproduced for a finite color group by a deterministic reversible rule. At N_t = 4
// and R <= 3 this is the thermal form of string breaking, not the zero-temperature breaking of the static
// potential, which needs Wilson loops far larger than this box.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeRng } from '@/code/tool/rng'
import {
  finitePlaquette,
  generateGroup,
  makeFiniteGaugeLattice,
} from '@/code/dynamics/finite-gauge'
import { SU3_SUBGROUPS } from '@/code/algebra/group/su3-subgroups'
import {
  actionLevels,
  quantizedHeatbathSweep,
  unitDemonBeta,
} from '@/code/dynamics/finite-kinetic'
import { jackknife } from '@/code/measure/jackknife'
import {
  bondLevels,
  fillDemons,
  makeMatterState,
  matterEnsemble,
  tripletOrbit,
  type MatterModel,
  type MatterSample,
} from '@/code/dynamics/finite-matter'

const SCALE = 6
const BOND = 6
const MASS = 4
const HEAVY_MASS = 24
const LENGTHS = [6, 6, 6, 4]
const PURE_FILL = 0.35
const MATTER_FILL = 0.2
const SWEEPS = 400
const SKIP = 150
const BIN = 25
const R_MAX = 3

type Run = {
  samples: MatterSample[]
  energyDrift: number
  chargeDrift: number
  created: number
}

function run(model: MatterModel, fill: number, matter: boolean): Run {
  const state = makeMatterState({ model, lengths: LENGTHS })

  fillDemons({ model, state, fill })

  return matterEnsemble({ model, state, sweeps: SWEEPS, skip: SKIP, matter, correlatorMax: R_MAX })
}

const mean = (xs: readonly number[]): number =>
  xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length)

function correlator(samples: MatterSample[], r: number): { value: number; error: number } {
  return jackknife({ samples, estimator: s => mean(s.map(x => x.correlator[r] ?? 0)), binSize: BIN })
}

// C(R) - |<P>|^2, the part that decays when the static charges are screened
function connected(samples: MatterSample[], r: number): { value: number; error: number } {
  return jackknife({
    samples,
    estimator: s => {
      const re = mean(s.map(x => x.re))
      const im = mean(s.map(x => x.im))

      return mean(s.map(x => x.correlator[r] ?? 0)) - (re * re + im * im)
    },
    binSize: BIN,
  })
}

function plaquette(samples: MatterSample[]): { value: number; error: number } {
  return jackknife({ samples, estimator: s => mean(s.map(x => x.plaquette)), binSize: BIN })
}

export default experiment({
  id: 'gauge/finite-color-screening',
  code: 'E-FRC-0139',
  title:
    'dynamical color triplets on the deterministic Sigma(648) automaton screen a static color pair: the Polyakov correlator levels off at |<P>|^2 instead of falling to zero, its connected part vanishing by R = 3, while pure gauge and a quenched heavy mass fall to zero, and at the same demon temperature the matter orders the gauge field (the plaquette rises) where at the same total energy it heats it',
  category: 'gauge',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const group = generateGroup({ generators: [...SU3_SUBGROUPS.sigma648.generators] })
    const triplet = tripletOrbit(group)
    const plaquetteLevels = actionLevels({ group, scale: SCALE })
    const lowest = Math.min(...Array.from(plaquetteLevels).filter(level => level > 0))
    const capacity = 6 * lowest + 6
    const bond = bondLevels({ triplet, scale: BOND, reading: 'fundamental' })
    const light: MatterModel = { group, triplet, plaquetteLevels, bond, mass: MASS, capacity }
    const heavy: MatterModel = { ...light, mass: HEAVY_MASS }

    const pure = run(light, PURE_FILL, false)
    const matter = run(light, MATTER_FILL, true)
    const quenched = run(heavy, PURE_FILL, true)
    const sameEnergy = run(light, PURE_FILL, true)
    const betaOf = (r: Run): number =>
      unitDemonBeta({ meanDemon: mean(r.samples.map(s => s.meanDemon)), capacity })
    const matterBeta = betaOf(matter)

    // the canonical pure gauge reference at the coupling the matter run's demons read
    const rng = makeRng({ seed: 139 })
    const lattice = makeFiniteGaugeLattice({ group, lengths: LENGTHS, start: 'hot', rng })
    const reference: number[] = []

    for (let sweep = 0; sweep < SWEEPS; sweep++) {
      quantizedHeatbathSweep({ lattice, levels: plaquetteLevels, beta: matterBeta, rng })

      if (sweep >= SKIP) {
        reference.push(finitePlaquette({ lattice }))
      }
    }

    const referencePlaquette = jackknife({ samples: reference, estimator: mean, binSize: BIN })
    const matterPlaquette = plaquette(matter.samples)
    const shift = matterPlaquette.value - referencePlaquette.value
    const shiftError = Math.hypot(matterPlaquette.error, referencePlaquette.error)

    const radii = [...Array(R_MAX + 1).keys()]
    const mC = radii.map(r => correlator(matter.samples, r))
    const mConnected = radii.map(r => connected(matter.samples, r))
    const pC = radii.map(r => correlator(pure.samples, r))
    const qC = radii.map(r => correlator(quenched.samples, r))
    const free = (c: { value: number }): number => (c.value > 0 ? -Math.log(c.value) : Number.POSITIVE_INFINITY)
    const last = (list: { value: number; error: number }[]): { value: number; error: number } =>
      list[R_MAX] ?? { value: 0, error: 0 }

    const exact = [pure, matter, quenched, sameEnergy].every(r => r.energyDrift === 0 && r.chargeDrift === 0)
    const screened =
      last(mC).value > 10 * last(mC).error &&
      Math.abs(last(mConnected).value) < 3 * last(mConnected).error
    const confinedControls =
      Math.abs(last(pC).value) < 3 * last(pC).error && Math.abs(last(qC).value) < 3 * last(qC).error
    const ordered = shift > 5 * shiftError
    const ok = exact && screened && confinedControls && ordered

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'with dynamical color triplets the Polyakov correlator at R = 3 is above ten standard errors with its connected part within three of zero, a static pair screened, while for pure gauge and for a mass too heavy to pay for a pair it is within three standard errors of zero, and at the coupling the demons read the matter raises the plaquette above the canonical pure gauge value by five standard errors, every run exact in energy and charge',
      metrics: {
        ...Object.fromEntries(
          radii.flatMap(r => [
            [`matterC${r}`, mC[r]?.value ?? 0],
            [`matterC${r}Error`, mC[r]?.error ?? 0],
            [`matterConnected${r}`, mConnected[r]?.value ?? 0],
            [`matterConnected${r}Error`, mConnected[r]?.error ?? 0],
            [`matterFreeEnergy${r}`, free(mC[r] ?? { value: 0 })],
          ]),
        ),
        matterPolyakovSquared: mean(matter.samples.map(s => s.re)) ** 2 + mean(matter.samples.map(s => s.im)) ** 2,
        matterBeta,
        matterDensity: mean(matter.samples.map(s => s.density)),
        matterPlaquette: matterPlaquette.value,
        matterPlaquetteError: matterPlaquette.error,
        plaquetteShiftSameBeta: shift,
        plaquetteShiftSameBetaError: shiftError,
        sameEnergyPlaquette: mean(sameEnergy.samples.map(s => s.plaquette)),
        sameEnergyBeta: betaOf(sameEnergy),
        sameEnergyDensity: mean(sameEnergy.samples.map(s => s.density)),
        plaquetteShiftSameEnergy:
          mean(sameEnergy.samples.map(s => s.plaquette)) - mean(pure.samples.map(s => s.plaquette)),
        energyDrift: Math.max(...[pure, matter, quenched, sameEnergy].map(r => r.energyDrift)),
        chargeDrift: Math.max(...[pure, matter, quenched, sameEnergy].map(r => r.chargeDrift)),
      },
      control: {
        ...Object.fromEntries(
          radii.flatMap(r => [
            [`pureC${r}`, pC[r]?.value ?? 0],
            [`pureC${r}Error`, pC[r]?.error ?? 0],
            [`quenchedC${r}`, qC[r]?.value ?? 0],
            [`quenchedC${r}Error`, qC[r]?.error ?? 0],
          ]),
        ),
        pureBeta: betaOf(pure),
        purePlaquette: mean(pure.samples.map(s => s.plaquette)),
        heatbathPlaquetteAtMatterBeta: referencePlaquette.value,
        heatbathPlaquetteError: referencePlaquette.error,
        quenchedDensity: mean(quenched.samples.map(s => s.density)),
        quenchedPairsCreated: quenched.created,
        quenchedBeta: betaOf(quenched),
      },
      notes: `L2, known physics for a finite group, deterministic except the canonical heatbath reference, which is seeded. 6^3 x 4, scale ${SCALE}, bond ${BOND}, mass ${MASS} (heavy ${HEAVY_MASS}), fills ${PURE_FILL} and ${MATTER_FILL}, ${SWEEPS - SKIP} measured sweeps, bins of ${BIN}. The light matter condenses: nearly every site holds a vibe, so this is the dense, screening side of a gauge-Higgs system, continuous with confinement (Fradkin and Shenker 1979), not a dilute gas of quarks. A dilute regime was not found at this bond scale: lighter masses fill the lattice and heavier ones make no pair at all, so the density jumps between them. N_t = 4 with R up to 3 is the thermal form of string breaking.`,
    })
  },
})
