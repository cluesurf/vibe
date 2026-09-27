// Dynamical quarks with the finite color group, under a rule with no random number: the center breaks.
//
// what-the-base-needs, "What this does not show": everything in E-FRC-0103 is pure gauge, with no
// dynamical quarks with a finite color group. E-FRC-0126 measured the deterministic Sigma(648) automaton
// confining, with the fundamental Polyakov loop at zero because the center, the vibe's phase, is unbroken.
// This adds dynamical matter to that same automaton (code/dynamics/finite-matter): color triplets that hop
// along links carrying their color across, are made from calm in pairs of love and fear, and pay the
// gauge-invariant hopping term round(-B Re <phi_x, U phi_y>) and a mass M from the same demons that move
// the links. Every move is a permutation of a level set, so the whole rule reverses exactly and conserves
// the energy to the unit and love minus fear exactly.
//
// The classical triplet is the orbit of e0 under Sigma(648): 216 vectors on 12 rays, 18 phases per ray.
// The center omega I moves a member to another member of its ray, so the triplet carries the center where
// a role point (9 points, the group acting through its 216-element quotient) does not.
//
// The question: dynamical quarks break the center symmetry explicitly, so the Polyakov loop, zero in the
// confined pure gauge theory, becomes nonzero (the lattice fact E-FRC-0090 reproduced for SU(3) with
// Hybrid Monte Carlo). Measured three ways against two controls:
//
// - the Polyakov loop <Re P> with a binned jackknife error, on 6^3 x 4, with fundamental matter, for pure
//   gauge at the E-FRC-0126 energy, and for center-blind matter, whose bond reads
//   round(-B (3 |<phi_x, U phi_y>|^2 - 1) / 2), the adjoint reading a role point feels (E-FRC-0119)
// - the sector weight: on sampled configurations, the change of the matter energy when every time link
//   of one slice is multiplied by omega I. The pure gauge energy changes by exactly zero under it. A
//   positive change means the rule favors one center sector, which is what breaking the center is. It is
//   the classical form of E-FRC-0090's determinant shift
// - exactness: reversal of every link, vibe, color and demon after 20 beats on 4^4, energy and charge on
//   every beat of every run, and the total energy unchanged, to the unit, by a change of frame in every
//   cell
//
// Gates, fixed before the final run: the rule exact in all three; fundamental <Re P> above ten standard
// errors; pure gauge and center-blind |<Re P>| under three standard errors; the fundamental sector weight
// positive on every sampled configuration; the center-blind sector weight exactly zero on every one.
//
// How the parameters were found, and result. A first bond charged B (1 - Re <>), so every bond cost energy
// and matter never formed one (recorded in code/dynamics/finite-matter). A scan then showed the matter
// density jumps: mass 4 at bond 6 fills the lattice (0.998 of sites), mass 12 and above never pays for a
// pair, so no dilute regime exists at this bond scale. The matter fill 0.2 was chosen because its demons
// read beta 0.536 against the pure gauge run's 0.550 at fill 0.35 (fill 0.25 without matter is the ordered
// branch of E-FRC-0126 and was avoided). Result: <Re P> = 0.0853 +- 0.0022 with matter, 0.0005 +- 0.0015
// pure, 0.0009 +- 0.0007 center-blind. A center rotation of one time slice raises the matter energy by at
// least 1,226 units (mean 1,300) on all 10 sampled configurations, and by exactly 0 for blind matter.
// 527 pairs made from calm during the run. Run time about 500 s.
//
// Depth L2: the explicit center breaking by dynamical matter, known lattice physics, reproduced for a
// finite color group by a deterministic reversible rule. The matter is classical and bosonic: a color
// vector per site, not a Grassmann field, so this is the gauge-Higgs form of dynamical matter (Fradkin
// and Shenker 1979 showed it continuous with the confining phase), not staggered quarks.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { generateGroup } from '@/code/dynamics/finite-gauge'
import { SU3_SUBGROUPS } from '@/code/algebra/group/su3-subgroups'
import { actionLevels, unitDemonBeta } from '@/code/dynamics/finite-kinetic'
import { jackknife } from '@/code/measure/jackknife'
import {
  bondLevels,
  centerElement,
  centerRotateSlice,
  changeFrame,
  fillDemons,
  makeMatterState,
  matterBeat,
  matterBeatBack,
  matterEnergy,
  matterEnsemble,
  tripletOrbit,
  type BondReading,
  type MatterModel,
  type MatterSample,
  type MatterState,
} from '@/code/dynamics/finite-matter'

const SCALE = 6
const BOND = 6
const MASS = 4
const LENGTHS = [6, 6, 6, 4]
const PURE_FILL = 0.35
const MATTER_FILL = 0.2
const SWEEPS = 400
const SKIP = 150
const BIN = 25
const SECTOR_EVERY = 25
const REVERSE_BEATS = 20

type Run = {
  samples: MatterSample[]
  sectorShifts: number[]
  energyDrift: number
  chargeDrift: number
  created: number
  final: MatterState
}

function run(model: MatterModel, fill: number, matter: boolean): Run {
  const state = makeMatterState({ model, lengths: LENGTHS })

  fillDemons({ model, state, fill })

  const sectorShifts: number[] = []
  const z = centerElement(model.group)
  const samples: MatterSample[] = []

  let energyDrift = 0
  let chargeDrift = 0
  let created = 0

  // run in chunks, so the sector weight is read on configurations along the same trajectory
  for (let done = 0; done < SWEEPS; done += SECTOR_EVERY) {
    const chunk = matterEnsemble({
      model,
      state,
      sweeps: SECTOR_EVERY,
      skip: Math.max(0, SKIP - done),
      matter,
      correlatorMax: 0,
      firstStep: done,
    })

    samples.push(...chunk.samples)
    energyDrift = Math.max(energyDrift, chunk.energyDrift)
    chargeDrift = Math.max(chargeDrift, chunk.chargeDrift)
    created += chunk.created

    if (done + SECTOR_EVERY > SKIP) {
      const before = matterEnergy({ model, state }).matter
      const rotated: MatterState = {
        ...state,
        lattice: { ...state.lattice, links: Int16Array.from(state.lattice.links) },
      }

      centerRotateSlice({ lattice: rotated.lattice, z })
      sectorShifts.push(matterEnergy({ model, state: rotated }).matter - before)
    }
  }

  return { samples, sectorShifts, energyDrift, chargeDrift, created, final: state }
}

function reverses(model: MatterModel): boolean {
  const state = makeMatterState({ model, lengths: [4, 4, 4, 4] })

  fillDemons({ model, state, fill: MATTER_FILL })

  const copy = (s: MatterState): Int32Array[] => [
    Int32Array.from(s.lattice.links),
    Int32Array.from(s.vibe),
    Int32Array.from(s.color),
    Int32Array.from(s.linkDemons),
    Int32Array.from(s.siteDemons),
  ]
  const start = copy(state)

  for (let t = 0; t < REVERSE_BEATS; t++) {
    matterBeat({ model, state, step: t })
  }

  const moved = copy(state).some((a, k) => a.some((x, i) => x !== start[k]?.[i]))

  for (let t = REVERSE_BEATS - 1; t >= 0; t--) {
    matterBeatBack({ model, state, step: t })
  }

  return moved && copy(state).every((a, k) => a.every((x, i) => x === start[k]?.[i]))
}

// the total energy after a change of frame in every cell, against before, to the unit
function frameInvariant(model: MatterModel, state: MatterState): boolean {
  const before = matterEnergy({ model, state }).total
  const moved: MatterState = {
    ...state,
    lattice: { ...state.lattice, links: Int16Array.from(state.lattice.links) },
    color: Int16Array.from(state.color),
  }
  const frame = Int32Array.from(
    { length: state.vibe.length },
    (_, x) => (x * 97 + 13) % model.group.order,
  )

  changeFrame({ model, state: moved, frame })

  return matterEnergy({ model, state: moved }).total === before
}

function polyakov(samples: MatterSample[]): { value: number; error: number } {
  return jackknife({
    samples,
    estimator: s => s.reduce((a, b) => a + b.re, 0) / s.length,
    binSize: BIN,
  })
}

const mean = (xs: readonly number[]): number =>
  xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length)

export default experiment({
  id: 'gauge/finite-color-quarks',
  code: 'E-FRC-0138',
  title:
    'dynamical color triplets on the deterministic Sigma(648) automaton break the center: with matter that hops, is made from calm in pairs and pays a gauge-invariant hopping term from the demons, the Polyakov loop is nonzero and the rule favors one center sector on every configuration, while pure gauge and center-blind matter keep it at zero, every run reversing exactly with energy and charge conserved',
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
    const modelOf = (reading: BondReading): MatterModel => ({
      group,
      triplet,
      plaquetteLevels,
      bond: bondLevels({ triplet, scale: BOND, reading }),
      mass: MASS,
      capacity,
    })
    const fundamental = modelOf('fundamental')
    const blind = modelOf('blind')
    const z = centerElement(group)
    const n = triplet.size
    const centerMoves = triplet.act[z * n] ?? 0
    const centerSameRay =
      centerMoves !== 0 && Math.abs((triplet.overlapSquared[centerMoves] ?? 0) - 1) < 1e-9

    const pure = run(fundamental, PURE_FILL, false)
    const withMatter = run(fundamental, MATTER_FILL, true)
    const blindMatter = run(blind, MATTER_FILL, true)
    const exactReversal = reverses(fundamental) && reverses(blind)
    const frame =
      frameInvariant(fundamental, withMatter.final) && frameInvariant(blind, blindMatter.final)

    const pP = polyakov(pure.samples)
    const mP = polyakov(withMatter.samples)
    const bP = polyakov(blindMatter.samples)
    const betaOf = (r: Run): number =>
      unitDemonBeta({ meanDemon: mean(r.samples.map(s => s.meanDemon)), capacity })

    const exact =
      exactReversal &&
      frame &&
      [pure, withMatter, blindMatter].every(r => r.energyDrift === 0 && r.chargeDrift === 0) &&
      triplet.size === 216 &&
      triplet.rays === 12 &&
      centerSameRay
    const broken =
      mP.value > 10 * mP.error && withMatter.sectorShifts.every(s => s > 0)
    const controls =
      Math.abs(pP.value) < 3 * pP.error &&
      Math.abs(bP.value) < 3 * bP.error &&
      blindMatter.sectorShifts.every(s => s === 0)
    const ok = exact && broken && controls

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on the deterministic Sigma(648) automaton with dynamical color triplets (the orbit of e0, 216 members on 12 rays, the center moving each along its ray), reversing exactly with energy and love minus fear conserved on every beat and the energy frame-invariant to the unit, the Polyakov loop is above ten standard errors and a center rotation of a time slice raises the matter energy on every sampled configuration, while pure gauge and center-blind matter keep the loop within three standard errors of zero and the blind matter energy exactly unchanged',
      metrics: {
        tripletSize: triplet.size,
        tripletRays: triplet.rays,
        exactReversal: exactReversal ? 1 : 0,
        frameInvariant: frame ? 1 : 0,
        matterPolyakov: mP.value,
        matterPolyakovError: mP.error,
        matterBeta: betaOf(withMatter),
        matterPlaquette: mean(withMatter.samples.map(s => s.plaquette)),
        matterDensity: mean(withMatter.samples.map(s => s.density)),
        matterPairsCreated: withMatter.created,
        matterSectorShiftMean: mean(withMatter.sectorShifts),
        matterSectorShiftSmallest: Math.min(...withMatter.sectorShifts),
        sectorConfigurations: withMatter.sectorShifts.length,
        energyDrift: Math.max(pure.energyDrift, withMatter.energyDrift, blindMatter.energyDrift),
        chargeDrift: Math.max(pure.chargeDrift, withMatter.chargeDrift, blindMatter.chargeDrift),
      },
      control: {
        purePolyakov: pP.value,
        purePolyakovError: pP.error,
        pureBeta: betaOf(pure),
        purePlaquette: mean(pure.samples.map(s => s.plaquette)),
        blindPolyakov: bP.value,
        blindPolyakovError: bP.error,
        blindBeta: betaOf(blindMatter),
        blindPlaquette: mean(blindMatter.samples.map(s => s.plaquette)),
        blindDensity: mean(blindMatter.samples.map(s => s.density)),
        blindSectorShiftLargest: Math.max(...blindMatter.sectorShifts.map(Math.abs)),
      },
      notes: `L2, known physics reproduced for a finite group with no random number. 6^3 x 4, plaquette action at scale ${SCALE}, bond scale ${BOND}, mass ${MASS}, ${SWEEPS - SKIP} measured sweeps per run, jackknife bins of ${BIN}. The matter fill is lower than the pure gauge fill because the bonds release energy into the demons: at the same fill the matter run is hotter (see E-FRC-0139). The matter is a classical color vector per site with an occupation, the gauge-Higgs form of dynamical matter, not a fermion, so no statement about chiral symmetry or the hadron spectrum is made.`,
    })
  },
})
