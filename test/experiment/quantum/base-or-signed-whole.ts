// IS THE ONE BASE CONFIGURATION REAL, OR THE SIGNED WHOLE? (E-QTM-0189, quantum-coverage decision 001, options B and
// C, checks 1 and 2 of model-changes.md). Option B ('t Hooft) says one configuration is real and the superposed layer
// is bookkeeping over it: then the register's states and readings need a non-negative hidden-configuration model, and
// its step needs a basis in which it is a permutation. Option C says the signed whole is real: where no fear acts it
// reads as B (E-QTM-0170), and where a fear makes it negative no non-negative account exists. This file explores
// whether B's two register-layer requirements hold, exactly, on the model's own fear beat.
//
// TEST A, A NON-NEGATIVE MODEL FOR THE STATES AND READINGS THE FEAR BEAT MAKES (code/measure/ontic-register,
// code/measure/exact-cone-lp). One role, in the coordinates Tr(rho A_u) of its signed whole. The fragment always holds
// the twelve stabilizer states and the twelve line readings (E-QTM-0130, 0142), which are tomographically complete on
// a role, so operational equivalences are the true ones and a sub-fragment without a model means the whole family has
// none. Added to it:
//   states    the conditional states the step makes: the step on every product of stabilizer roles (the one-meeting
//             knots, E-QTM-0163's like knot at its first meeting), one role read on a line, the other's state; one per
//             orbit of the one-role Clifford group's 216 point permutations
//   readings  the readings the step makes: the role meets a fresh stabilizer role by the step and the fresh role is
//             line-read (E-QTM-0185's ancilla reading), three effects kept together
// Each state orbit is tried alone, each reading alone, and every (state, reading) pair; a pair holding a part with no
// model alone has none and is not run. The program (identity = sum sigma b a^T over every ray pair, thousands of
// columns) is solved by a floating-point phase I that only guesses the final basis; the answer is then the EXACT
// certificate from that basis (x_B = B^-1 rhs non-negative with the identity rebuilt, or the duals checked on every
// ray pair), and when a certificate does not check, the exact column-generation program decides. The rays are
// checked by duality. Steps: the like meeting U
// (swap phase) and the love-fear meeting V (singlet phase) with the fear on; the control is SUM, the Clifford knit with
// no fear. Read beside it: the two-role signed whole of each one-meeting knot, its negative points counted.
//
// TEST B, A PERMUTATION BASIS FOR THE STEP. Exact spectra by power traces (Newton) and U^L scalar for L = lcm(1..n),
// and the phase-space reading (does the step carry each phase point to one phase point). Steps: U, the rule's meeting
// w U^dag (E-QTM-0171), V, the 2 x 216 beats "a link move on one role, then the meeting", and the exact engine's ten
// phases (the member mixer, the sector string V = 1..8, the contact; E-QTM-0183) each as the step diag(u, 1) of the
// two states it acts on. E-QTM-0183 found those ten u are not roots of unity: then diag(u, 1)^2 is no scalar, the
// eigenvalue ratio u has infinite order, and no basis and no global phase makes that step a permutation.
//
// DERIVED BEFORE THE RUN. U = P_sym + w P_anti has eigenvalues 1 (six times) and w (three), tr U = 6 + 3w with
// |tr U|^2 = 27, not a square, so U is c P for no permutation P and no phase c, though U^3 = 1. V = 1 + (w - 1) P_Phi
// has 1 (eight) and w (one), |tr V|^2 = 57, not a square. w U^dag: |tr|^2 = 27 again. SWAP (the fear off) has 1 (six)
// and -1 (three), a permutation's. Neither U nor V is Clifford (E-QTM-0183), so neither permutes the phase points.
// PREDICTED: test B fails for B on every fear step. Test A: unknown before the probe (a lone negative state with line
// readings alone admits a model, as the strange state does), expected to need a fear state with a fear reading.
//
// PROBES BEFORE THE GATE RUN, disclosed (tmp/probe-0189.ts, probe2, probe3, probe4): the qubit square has a model and
// the hexagon has none; the strange state |1> - |2> (signed whole -1/3 at one point) with line readings alone HAS a
// model, so negativity alone does not decide; of the like meeting's 7 conditional-state orbits, 4 alone have no model
// with the line readings (exact witnesses, rays checked by duality). The exact-cone-lp symmetric program and the exact
// column program were too slow on these fragments (Bland's rule, minutes per program), which is why the float-guided
// certificate is used, and exact-cone-lp feasibility gained an optional Dantzig rule. The gates below are qualitative
// and were written before these probes; none moved.
//
// A FIRST GATE RUN WAS STOPPED WITH NO VERDICT, disclosed (test/record/E-QTM-0189/run1.log and gate-run.log are its
// empty logs): after 2 hours it sat in the exact fallback on one like reading whose first float basis did not
// certify. The float guess now retries four fixed perturbations before the bounded exact fallback; the reading then
// certified on a retry. No gate changed.
//
// GATES, fixed before the gate run.
//  I  INSTRUMENT (failure: open). The linear program finds a model for the stabilizer fragment (exact identity), for
//     the qubit square (exact), and none for the qubit hexagon (Mazurek et al. 2016, exact witness); the float-guided
//     program agrees with the exact programs on the square, the hexagon and the strange state; the rays pass the
//     duality check; every program's answer in this file carries its exact certificate. The spectrum reading passes SWAP and the clock Z =
//     diag(1, w, w^2) (unitarily a 3-cycle) and rejects the phase gate diag(1, 1, w). Each of the 216 one-role Clifford
//     elements permutes the nine phase points.
//  C  CONTROLS, THE FEAR OFF (failure: open). SUM: every state alone, reading alone and pair has a model, and no SUM
//     knot has a negative point. The 216 grid moves, SUM and SWAP each pass the spectrum reading and permute the 81
//     two-role phase points. The base step (E-FND-0082's 49 configurations on d4Mesh side 5, their orbits under the
//     committed rule) passes the spectrum reading as the permutation it is.
//  HA B'S TEST A: for U and for V, every pair has a non-negative model.
//  HB B'S TEST B: U, w U^dag and V each pass the spectrum reading.
// Verdict: open if I or C fails; pass (B alive at the register layer) if HA and HB hold; fail (C stands, B needs a
// finer base) if neither holds; partial if one holds.
//
// GATE RUN (2026-10-24, test/record/E-QTM-0189/gate-run-2.log, 728 s): FAIL, as predicted for test B; test A failed
// too. Instrument and controls held: 294 of 294 programs certified from a float-guessed basis, rays checked by
// duality, square yes, hexagon no, the SUM family 2 of 2 pairs with a model and 0 of 144 SUM knots negative, 216 of
// 216 grid moves, SUM, SWAP and the base step (49 orbits, 241 configurations) passing.
//  - A: the like meeting, 300 of 336 pairs without a non-negative model (4 of 7 state orbits and 36 of 48 readings
//    already alone). The love-fear meeting, 144 of 288 (3 of 6 state orbits alone, and every one of its 48 readings
//    has a model alone and adds nothing). One-meeting knots with a negative point: like 132 of 144 (least -1/12), love-fear
//    108 of 144 (least -1/27), SUM 0 of 144.
//  - B: 0 of 3 fear steps has a permutation basis, read for every global phase, although all 3 have finite order mod
//    phases (U^3 = 1). Each carries only 9 of 81 phase points to phase points, with 216, 216 and 144 negative entries
//    in the signed transition. 0 of 216 like and 0 of 216 love-fear link-then-meet beats has a permutation basis
//    (160 of 216 read for every phase, the rest for the six units), 10 and 81 of them finite mod phases. 0 of the
//    engine's 10 phases has finite order. Reading: 18 of the 216 Clifford elements have a permutation spectrum, yet
//    all 216 permute phase points.
// WHAT IT MEANS. B's two register-layer requirements both fail at the fear and both hold with the fear off, which is
// C's split: the signed whole is a plain count of configurations on the Clifford knit and needs its sign exactly where
// the fear beat acts. Wigner negativity alone does not decide it (the strange state has a model with line readings);
// the model's own fear states and readings do. For B to survive, the configurations must sit on a finer base that is
// not built.
//
// Depth L1: exact algebra and linear programming on the rule's own gates. DETERMINISM: no random numbers.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { cycAdjoint, cycKron, cycMul, cycTimesElement, type CycMatrix } from '@/code/algebra/cyclotomic'
import { noncontextualModel } from '@/code/measure/exact-cone-lp'
import {
  ancillaReadings,
  certifiedModel,
  conditionalStates,
  distinctVectors,
  raysByDuality,
  finiteOrderModPhases,
  oneRoleModelSymmetric,
  signedWhole,
  knotNegativity,
  oneRoleFragment,
  oneRoleModel,
  orbitPermutation,
  orbitRepresentatives,
  permutationMatrix,
  permutationSpectrum,
  permutationTraces,
  phaseSpaceAction,
  phaseStep,
  powerTraces,
  qubitPlaneFragment,
  signedTransition,
  twoRolePhasePoints,
  type OneRoleFragment,
} from '@/code/measure/ontic-register'
import {
  EIS,
  oneRoleGroup,
  projector,
  singletPhaseGate,
  sumGate,
  swapPhaseGate,
} from '@/code/measure/reconstruction-axioms'
import { ringUnit } from '@/code/measure/swap-string'
import { headOnRotate } from '@/code/rule/collision'
import { gridMoves } from '@/code/rule/vibe-weave'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, type Will } from '@/code/tone/will'

const BASE_SIDE = 5
const ORBIT_CAP = 4096
const STRING_CAP = 8

type FamilyRead = {
  stateOrbits: number
  readings: number
  statesAloneFeasible: number
  readingsAloneFeasible: number
  pairs: number
  pairsRun: number
  pairsFeasible: number
  certified: boolean
  guided: number
  programs: number
}

// every state orbit alone, every reading alone, every pair, with each answer's certificate checked
function familyRead(fragment: OneRoleFragment, gate: CycMatrix): FamilyRead {
  const states = orbitRepresentatives(
    conditionalStates({ gate, points: fragment.points }),
    fragment.perms,
  )
  const readings = ancillaReadings({ gate, points: fragment.points })

  let certified = true
  let guided = 0
  let programs = 0

  const feasible = (s: bigint[][], e: bigint[][]): boolean => {
    const m = oneRoleModel(fragment, { states: s, effects: e })

    certified &&= m.certified
    programs++
    guided += m.guided ? 1 : 0

    return m.feasible
  }

  const stateOk = states.map(s => feasible([s], []))
  const readingOk = readings.map(r => feasible([], r))
  const statesAloneFeasible = stateOk.filter(Boolean).length
  const readingsAloneFeasible = readingOk.filter(Boolean).length

  // a pair holding a state or reading with no model alone has none (a model of the pair restricts to one of its
  // part, the line readings and stabilizer states keeping every operational equivalence), so only the rest are run
  let pairs = 0
  let pairsFeasible = 0
  let pairsRun = 0

  states.forEach((s, i) => {
    readings.forEach((r, j) => {
      pairs++

      if (!stateOk[i] || !readingOk[j]) {
        return
      }

      pairsRun++

      if (feasible([s], r)) {
        pairsFeasible++
      }
    })
  })

  return {
    stateOrbits: states.length,
    readings: readings.length,
    statesAloneFeasible,
    readingsAloneFeasible,
    pairs,
    pairsRun,
    pairsFeasible,
    certified,
    guided,
    programs,
  }
}

const spectrumOf = (u: CycMatrix): ReturnType<typeof permutationSpectrum> =>
  permutationSpectrum(powerTraces(u, u.n), u.n)

export default experiment({
  id: 'quantum/base-or-signed-whole',
  code: 'E-QTM-0189',
  title:
    "explores whether option B's two register-layer requirements hold on the fear beat: a non-negative hidden-configuration model for the states and readings it makes, and a basis in which its step is a permutation",
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const group = oneRoleGroup()
    // throws unless each of the 216 elements permutes the nine points (instrument)
    const fragment = oneRoleFragment(group)
    const points2 = twoRolePhasePoints()

    // ---- I: instrument ----
    const stabilizerOnly = oneRoleModel(fragment, { states: [], effects: [] })
    const square = noncontextualModel({
      ...qubitPlaneFragment('square'),
      n: 3,
      perms: [[0, 1, 2]],
    })
    const hexagon = noncontextualModel({
      ...qubitPlaneFragment('hexagon'),
      n: 3,
      perms: [[0, 1, 2]],
    })
    // the column-generation program against exact-cone-lp's full symmetric program, where the full one is fast
    const squareColumns = certifiedModel({ ...qubitPlaneFragment('square'), n: 3 })
    const hexagonColumns = certifiedModel({ ...qubitPlaneFragment('hexagon'), n: 3 })
    const strange = signedWhole(
      projector({ entries: [EIS.zero(), EIS.one(), EIS.scale(EIS.one(), -1n)], den: 1n }),
      fragment.points,
    )
    const strangeColumns = oneRoleModel(fragment, { states: [strange], effects: [] })
    const strangeFull = oneRoleModelSymmetric(fragment, { states: [strange], effects: [] })
    const programsAgree =
      squareColumns.feasible === square.feasible &&
      hexagonColumns.feasible === hexagon.feasible &&
      strangeColumns.feasible === strangeFull.feasible &&
      squareColumns.certified &&
      hexagonColumns.certified &&
      strangeColumns.certified
    // the rays of every fear state's fragment and of the readings, checked by duality
    const likeStates = orbitRepresentatives(
      conditionalStates({ gate: swapPhaseGate(EIS.root(1)), points: fragment.points }),
      fragment.perms,
    )
    const raysChecked =
      raysByDuality(fragment.readings, 9) &&
      likeStates.every(s => raysByDuality(distinctVectors([...fragment.stabilizerStates, s]), 9))
    const lpInstrument =
      raysChecked &&
      stabilizerOnly.feasible &&
      stabilizerOnly.certified &&
      square.feasible &&
      square.identityExact &&
      !hexagon.feasible &&
      hexagon.witnessExact &&
      programsAgree

    const one = EIS.one()
    const w = EIS.root(1)
    const w2 = EIS.root(2)
    const diag3 = (a: bigint[], b: bigint[], c: bigint[]): CycMatrix => ({
      n: 3,
      entries: [a, EIS.zero(), EIS.zero(), EIS.zero(), b, EIS.zero(), EIS.zero(), EIS.zero(), c],
      den: 1n,
    })
    const swap = swapPhaseGate(EIS.scale(one, -1n))
    const clockPasses = spectrumOf(diag3(one, w, w2)).permutation
    const phaseGateRejected = !spectrumOf(diag3(one, one, w)).permutation
    const swapSpectrum = spectrumOf(swap)
    const spectrumInstrument =
      clockPasses && phaseGateRejected && swapSpectrum.permutation

    const instrument = lpInstrument && spectrumInstrument

    // ---- test A ----
    const U = swapPhaseGate(w)
    const V = singletPhaseGate(w)
    const SUM = sumGate()
    const likeFamily = familyRead(fragment, U)
    const unlikeFamily = familyRead(fragment, V)
    const sumFamily = familyRead(fragment, SUM)
    const likeKnots = knotNegativity({ gate: U, points: points2 })
    const unlikeKnots = knotNegativity({ gate: V, points: points2 })
    const sumKnots = knotNegativity({ gate: SUM, points: points2 })

    const allFeasible = (f: FamilyRead): boolean =>
      f.statesAloneFeasible === f.stateOrbits &&
      f.readingsAloneFeasible === f.readings &&
      f.pairsFeasible === f.pairs
    const certified =
      likeFamily.certified && unlikeFamily.certified && sumFamily.certified

    // ---- test B ----
    const meeting = cycTimesElement(EIS, cycAdjoint(EIS, U), w)
    const fearSteps: [string, CycMatrix][] = [
      ['U', U],
      ['w U^dag', meeting],
      ['V', V],
    ]
    const fearRead = fearSteps.map(([name, g]) => ({
      name,
      spectrum: spectrumOf(g),
      finite: finiteOrderModPhases(g),
      phasePoints: phaseSpaceAction(g, points2).filter(v => v >= 0).length,
      transition: signedTransition(g, points2),
    }))
    const hypothesisB = fearRead.every(r => r.spectrum.permutation)

    // the link-then-meet beats: g on the first role, then the meeting
    const id3 = { n: 3, entries: [one, EIS.zero(), EIS.zero(), EIS.zero(), one, EIS.zero(), EIS.zero(), EIS.zero(), one], den: 1n }
    const beatRead = (meet: CycMatrix): { permutation: number; allPhases: number; finite: number; phasePermuting: number } => {
      let permutation = 0
      let allPhases = 0
      let finite = 0
      let phasePermuting = 0

      for (const g of group) {
        const b = cycMul(EIS, meet, cycKron(EIS, g, id3))
        const s = spectrumOf(b)

        permutation += s.permutation ? 1 : 0
        allPhases += s.allPhases ? 1 : 0
        finite += finiteOrderModPhases(b) ? 1 : 0
        phasePermuting += phaseSpaceAction(b, points2).every(v => v >= 0) ? 1 : 0
      }

      return { permutation, allPhases, finite, phasePermuting }
    }
    const likeBeats = beatRead(U)
    const unlikeBeats = beatRead(V)

    // the engine's ten phases, each as diag(u, 1)
    const engineKj: [number, number][] = [
      [-1, 4],
      ...Array.from({ length: STRING_CAP }, (_, i): [number, number] => [-2 * (i + 1), i + 1]),
      [4, 0],
    ]
    const engineRead = engineKj.map(([k, j]) => {
      const u = ringUnit(k, j)
      const step = phaseStep({ num: [u.num[0], u.num[1]], den: u.den })

      return { finite: finiteOrderModPhases(step), spectrum: spectrumOf(step).permutation }
    })
    const engineNone = engineRead.every(r => !r.finite && !r.spectrum)

    // the one-role Clifford group under the spectrum reading (a reading: Clifford lives in phase space)
    const cliffordSpectra = group.filter(g => spectrumOf(g).permutation).length

    // ---- C: controls, the fear off ----
    const moves = gridMoves().act
    const moveRead = moves.map(t => {
      const p = permutationMatrix(t)
      // a grid move acts on the two qutrits (y, x) of one vibe's point; as a two-role step it permutes the basis
      return spectrumOf(p).permutation && phaseSpaceAction(p, points2).every(v => v >= 0)
    })
    const sumStep = spectrumOf(SUM).permutation && phaseSpaceAction(SUM, points2).every(v => v >= 0)
    const swapStep = swapSpectrum.permutation && phaseSpaceAction(swap, points2).every(v => v >= 0)

    const mesh = d4Mesh({ side: BASE_SIDE })
    const opposite = meshOpposites(mesh)
    const centre = Math.floor(mesh.cellCount / 2)
    const seeds: Will[] = [makeWill(mesh)]

    for (let direction = 0; direction < mesh.degree; direction++) {
      for (const tone of [1, -1] as const) {
        const will = makeWill(mesh)

        will.data[centre * mesh.degree + direction] = tone
        seeds.push(will)
      }
    }

    const orbits = orbitPermutation({
      collision: headOnRotate({ opposite }),
      seeds,
      cap: ORBIT_CAP,
    })
    const baseSpectrum = permutationSpectrum(
      permutationTraces(orbits.perm, orbits.perm.length),
      orbits.perm.length,
    )

    const controls =
      allFeasible(sumFamily) &&
      sumKnots.negativeKnots === 0 &&
      moveRead.every(Boolean) &&
      sumStep &&
      swapStep &&
      orbits.open === 0 &&
      baseSpectrum.permutation

    const hypothesisA = allFeasible(likeFamily) && allFeasible(unlikeFamily)

    const status =
      !instrument || !certified || !controls
        ? 'open'
        : hypothesisA && hypothesisB
          ? 'pass'
          : !hypothesisA && !hypothesisB
            ? 'fail'
            : 'partial'

    const fam = (name: string, f: FamilyRead): string =>
      `${name}: ${f.pairs - f.pairsFeasible} of ${f.pairs} pairs (${f.stateOrbits} state orbits x ${f.readings} readings) have no non-negative model, states alone ${f.statesAloneFeasible} of ${f.stateOrbits} and readings alone ${f.readingsAloneFeasible} of ${f.readings} do`

    return verdict({
      status,
      claim: `${status}: test A, ${fam('the like meeting', likeFamily)}; ${fam('the love-fear meeting', unlikeFamily)}; ${fam('SUM, no fear', sumFamily)}; one-meeting knots with a negative point: like ${likeKnots.negativeKnots} of ${likeKnots.knots} (least ${likeKnots.worst.toFixed(4)}), love-fear ${unlikeKnots.negativeKnots} of ${unlikeKnots.knots}, SUM ${sumKnots.negativeKnots} of ${sumKnots.knots}. Test B, the fear steps U, w U^dag, V: ${fearRead.filter(r => r.spectrum.permutation).length} of 3 have a permutation basis (each read for every global phase), ${fearRead.filter(r => r.finite).length} of 3 have finite order mod phases, phase points carried to phase points ${fearRead.map(r => r.phasePoints).join(', ')} of 81, negative signed-transition entries ${fearRead.map(r => r.transition.negative).join(', ')}; link-then-meet beats with a permutation basis: like ${likeBeats.permutation} of ${group.length}, love-fear ${unlikeBeats.permutation} of ${group.length}; the engine's ${engineRead.length} phases: ${engineRead.filter(r => r.finite).length} of finite order; controls: ${moveRead.filter(Boolean).length} of ${moves.length} grid moves, SUM, SWAP and the base step (${orbits.orbits} orbits, ${orbits.perm.length} configurations) pass`,
      metrics: {
        likePairs: likeFamily.pairs,
        likePairsWithoutModel: likeFamily.pairs - likeFamily.pairsFeasible,
        likeStateOrbits: likeFamily.stateOrbits,
        likeStatesAloneFeasible: likeFamily.statesAloneFeasible,
        likeReadings: likeFamily.readings,
        likeReadingsAloneFeasible: likeFamily.readingsAloneFeasible,
        likePairsRun: likeFamily.pairsRun,
        unlikePairsRun: unlikeFamily.pairsRun,
        unlikePairs: unlikeFamily.pairs,
        unlikePairsWithoutModel: unlikeFamily.pairs - unlikeFamily.pairsFeasible,
        unlikeStateOrbits: unlikeFamily.stateOrbits,
        unlikeStatesAloneFeasible: unlikeFamily.statesAloneFeasible,
        unlikeReadings: unlikeFamily.readings,
        unlikeReadingsAloneFeasible: unlikeFamily.readingsAloneFeasible,
        likeKnots: likeKnots.knots,
        likeNegativeKnots: likeKnots.negativeKnots,
        likeLeastPoint: Number(likeKnots.worst.toFixed(6)),
        unlikeKnots: unlikeKnots.knots,
        unlikeNegativeKnots: unlikeKnots.negativeKnots,
        unlikeLeastPoint: Number(unlikeKnots.worst.toFixed(6)),
        fearStepsPermutation: fearRead.filter(r => r.spectrum.permutation).length,
        fearStepsAllPhases: fearRead.filter(r => r.spectrum.allPhases).length,
        fearStepsFiniteModPhases: fearRead.filter(r => r.finite).length,
        likePhasePoints: fearRead[0]!.phasePoints,
        likeTransitionNegative: fearRead[0]!.transition.negative,
        likeTransitionNonzero: fearRead[0]!.transition.nonzero,
        unlikePhasePoints: fearRead[2]!.phasePoints,
        unlikeTransitionNegative: fearRead[2]!.transition.negative,
        likeBeatsPermutation: likeBeats.permutation,
        likeBeatsAllPhases: likeBeats.allPhases,
        likeBeatsFinite: likeBeats.finite,
        likeBeatsPhasePermuting: likeBeats.phasePermuting,
        unlikeBeatsPermutation: unlikeBeats.permutation,
        unlikeBeatsAllPhases: unlikeBeats.allPhases,
        unlikeBeatsFinite: unlikeBeats.finite,
        unlikeBeatsPhasePermuting: unlikeBeats.phasePermuting,
        engineFinite: engineRead.filter(r => r.finite).length,
        enginePermutation: engineRead.filter(r => r.spectrum).length,
        engineNone: engineNone ? 1 : 0,
        cliffordWithPermutationSpectrum: cliffordSpectra,
      },
      control: {
        stabilizerOnlyFeasible: stabilizerOnly.feasible ? 1 : 0,
        squareFeasible: square.feasible ? 1 : 0,
        hexagonInfeasible: hexagon.feasible ? 0 : 1,
        clockPasses: clockPasses ? 1 : 0,
        phaseGateRejected: phaseGateRejected ? 1 : 0,
        sumPairs: sumFamily.pairs,
        sumPairsFeasible: sumFamily.pairsFeasible,
        sumStateOrbits: sumFamily.stateOrbits,
        sumReadings: sumFamily.readings,
        sumNegativeKnots: sumKnots.negativeKnots,
        gridMovesPassing: moveRead.filter(Boolean).length,
        sumStep: sumStep ? 1 : 0,
        swapStep: swapStep ? 1 : 0,
        baseOrbits: orbits.orbits,
        baseOpenOrbits: orbits.open,
        baseConfigurations: orbits.perm.length,
        baseLongestOrbit: orbits.longest,
        baseStepPermutation: baseSpectrum.permutation ? 1 : 0,
        certificatesExact: certified ? 1 : 0,
        raysCheckedByDuality: raysChecked ? 1 : 0,
        programsRun: likeFamily.programs + unlikeFamily.programs + sumFamily.programs,
        programsDecidedFromFloatBasis: likeFamily.guided + unlikeFamily.guided + sumFamily.guided,
      },
      notes:
        "Test A's one-role fragments hold the twelve stabilizer states and line readings, which are tomographically complete, so a pair with no model means no larger family holds one either. A non-negative model of a two-role fragment would induce one for the conditional states a line reading of the partner prepares, so a pair without a model is a two-role knot without one. Test B reads spectra exactly; when tr U = 0 only the six units of Q(w) are tried as global phases, and the allPhases counts say how many reads cover every phase.",
    })
  },
})
