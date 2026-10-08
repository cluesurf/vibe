// DOES THE BOUND LEVEL MOVE AS A UNIT, AND IS ITS INERTIA ITS REST ENERGY (E-SPN-0105)? E-SPN-0104 held E-SPN-0093's
// three-love level for 128 beats on the working rule with the drift cost and the fermion sign, placed in one frame. But
// the drift cost also slows the trio's centroid (rms 1.81 against 3.96 without it, E-SPN-0104's confinement reading), so
// "matter that moves as a whole" was not shown. A particle carries momentum as a unit: a band E(K), with the level
// intact at every K. note/project/vibe/roadmap/research/discrete-gravity.md, "Measured, both pieces added" and after.
//
// THE BAND, DERIVED BEFORE THE RUN (code/measure/moving-level, the stand-in's operator, box 12). The line is flat and
// the drift cost's register on a line is one Gauss-fixed trit, so the one-line operator is translation invariant and
// the centroid momentum K is conserved. At each K the level is the eigenvector phi_K of the Bloch operator U(K),
// followed from the K = 0 level in steps of pi/64. From tmp/mb-probe1.log (instrument probe, below):
//   E(K)  0.3300185, 0.3308057, 0.3330395, 0.3407390, 0.3512915, 0.3631354 at K = 0, pi/16, pi/8, pi/4, 3pi/8, pi/2
//   dE/dK 0, 0.00790, 0.01460, 0.02383, 0.02934, 0.02967 (the group velocity, docks a beat)
//   E''(0) 0.041466, so m* = 1 / E''(0) = 24.12
// The level's rest energy (E-SPN-0093) is E_rest = 0.33002. Relativity asks m* = E_rest / c^2: E = sqrt(m^2 + (cK)^2)
// has E''(0) = c^2 / m, so inertia and rest energy are one number. That equality is what falling alike needs: a lump's
// pull on it acts on its energy (E-GRV-0119: the depth is sourced by energy) and its response is its inertia, so the
// two must match for every body to fall the same way. With c = 1 (the stream's light cone, one dock a beat, E-SPN-0104
// gate L) the band gives m* = 24.12, 73 times E_rest. The speed a hyperbola through E_rest would need is
// c = sqrt(E_rest / m*) = 0.117.
// THE LATTICE'S OWN FORM. A lone love (the coin with no pieces) is a Dirac walk: cos(eps) = cos(K) / 2, E = eps - pi/3,
// half-gap m = pi/3, m* = tan(m) = sqrt 3 (code/measure/moving-level loneBand), which goes to m only as m -> 0. The
// trio's m* = 24.12 is the tan of 1.529: as a Dirac walk it would have a half-gap near pi/2, not 0.33. So the bound
// state's inertia is set by how slowly its three loves hop together (a narrow band, 0.043 wide), not by its energy.
//
// WHY THE VELOCITY IS A MEASUREMENT (code/measure/moving-level header): the centroid's step in one beat is (n0 - n1) / 3
// on every branch (label 0 streams forward, label 1 back), so its expectation per beat is read off the rule's own state.
// By Floquet Hellmann-Feynman it equals dE/dK for an eigenstate of the SAME operator; the prediction here is the
// derivative of the stand-in's eigenvalues, the reading is the working rule's transport.
//
// THE COVER (derived in code/measure/moving-level). The ring's holonomy h takes point 0 to 3 and back (tmp/mb-probe1:
// holonomy 327084651, orbit 0, 3), so the one-frame sector lives on a cover of 32 positions and K runs in steps of
// 2 pi / 32. The boosted level is sum_Y e^(iKY) |Y + phi_K> over the 32 lifted anchors, each love in the cover's frame,
// the cut trit keeping the string inside the cluster, rounded into Z[w] / 2^40.
//
// THE RUNS: the side-16 working vacuum's axis line, the working rule with both pieces and the working split meeting
// (E-SPN-0104's WabP rule), the ring form code/measure/bound-line pointBeatWith (E-SPN-0104 checks it against the exact
// rule; here the exact window below checks it again on a boosted start), 128 beats, at the six K above: up to pi/2, a
// quarter of the zone's width, half way from its center to its edge (past about 2.2 the followed level mixes with
// another, least consecutive overlap 0.91 at 3pi/4 in the probe, so it is not a single level there).
//
// GATES, fixed before the first run of this file.
//  M1 the level holds while moving: at every K the fidelity |<start|now>|^2 (every key: positions, labels, points, cut
//     trit) is at least 0.99 at every beat 1 .. 128.
//  M2 the centroid moves at the predicted group velocity: at every K > 0 the transported centroid over 128 beats, divided
//     by 128, is within 5 percent of the stand-in's dE/dK at that K (at K = 0 within 0.05 of the fastest predicted
//     speed, in absolute value); and the density of each two-momentum packet (K, K + pi/8, for K = 0, pi/8, pi/4,
//     3pi/8) moves: the unwrapped angle of its first circular moment on the ring, fitted linear over beats 0 .. 128,
//     gives a speed within 5 percent of the chord [E(K + pi/8) - E(K)] / (pi/8) of the stand-in's band.
//  M3 relativistic inertia: the measured energies (the phase of <start|now>, fitted linear over beats 0 .. 128) at
//     K = 0, pi/16, pi/8, pi/4, fitted E(K) - E(0) = K^2 / (2 m*) + b K^4, give m* within 5 percent of E_rest (c = 1).
//  CONTROLS: (a) the unbound unit (both pieces, the bounce's -1 on a full line, E-SPN-0103's Nab) and (b) the rule
//     without the pieces (E-SPN-0104's K00 rule, the split meeting) each FAIL M1 at K = 0 and at K = pi/2; (c) K = 0
//     reproduces E-SPN-0104: its WabP run (the placed packet at anchor 0, the parallel frame, read as it read it) gives
//     least fidelity 0.9990692989873735 and energy 0.33002027282349655 within 1e-12, and the Bloch state at K = 0 reads
//     energy within 1e-4 of E_rest; (d) the calibration, the lone love (no pieces) at K = pi/8 and pi/2, reads the
//     closed form's energy and velocity within 1e-9 and fidelity at least 1 - 1e-12; (e) the exact window: the piece
//     of the boosted start (K = pi/2) on the anchor just before the cut of every sheet of the side-8 ring's cover (so
//     every placed cluster straddles the cut, carries a cut trit 1 or 2 and has loves on two sheets; the whole Bloch
//     state is too many branches for the exact rule), run 2 beats by the exact superposed rule, equals the ring form
//     (points and energy per husk column within 1e-12), keeps the norm, runs back exactly, leaks nothing, disturbs no
//     vacuum branch, breaks no mesh line and puts no love outside the cone.
//  Verdict: partial if a control fails; pass if M1, M2 and M3 hold; fail otherwise.
// PREDICTED: M1 and M2 hold (the probe's 32 beats at K = 0 and pi/2 read fidelity 0.99999 and 0.99987, velocity
// 0.029667 against 0.029665); M3 FAILS, m* about 24 against 0.33: the bound state moves as a unit, with a band, but it
// is a heavy lattice particle whose inertia is not its rest energy. Every control holds.
//
// FIRST RUN (230 s, tmp/mb-spn-run1.log, the record): fail on M3 alone, as predicted, no gate moved. M1: least
// fidelity 0.99976 to 0.99999 at every K over 128 beats. M2: the transported centroid equals dE/dK to 4e-4 at every K
// (0.007899, 0.014601, 0.023829, 0.029336, 0.029654 against 0.007898, 0.014601, 0.023833, 0.029337, 0.029665), and the
// two-momentum packets' density moves at the band's chord to 2e-4 (0.007693, 0.019605, 0.026867, 0.030159). The measured
// energies match the stand-in's band to 2e-6. M3: m* 24.56 measured (fit to pi/4 with a K^4 term; 24.12 from E''(0) of
// the stand-in), 74 times E_rest 0.33002; the hyperbola through E_rest needs c = 0.116 and still rises 0.047 at pi/2
// where the band rises 0.033 (a narrow band, not a hyperbola); as a Dirac walk m* = tan(1.530). Every control holds:
// the unbound unit and the bare rule fall to fidelity 0.0004 to 0.18; E-SPN-0104's WabP is reproduced bit for bit;
// the lone love reads the closed form to 1e-14; the exact window (336 branches, cut trits 1 and 2, three sheets) matches
// the ring form to 4e-16 and runs back exactly. Title written after the run.
// The run loop and the M3 fit moved to code/measure/moving-level (boostedRun, quarticMass) for E-SPN-0106; rerun after
// the move, every number equal to the record (tmp/cs-spn105-refactor.log).
//
// DISCLOSED PROBES (instrument only, no gate read on them): tmp/mb-probe1.log (the band above, the cover, 32 beats at
// K = 0 and pi/2, the lone love against the closed form; its exact window on the WHOLE Bloch state grew past 9 GB and
// was stopped); tmp/mb-probe2.log (the cut piece of a boosted start on sides 8 and 12: side 8 orbit 0, 6, 3, 336
// branches, 2 beats exact with gaps under 3e-16 and reversed).
//
// Depth L2: the rule's own dynamics on a placed state, with a prediction from the stand-in's band that could be wrong
// and was not tuned. DETERMINISM: no random numbers. The rule is exact per slice in Z[w][1/2]; the band, the placement's
// floats and every reading are measurement. NOTHING MOVES. HUSK FIRST: one husk line's columns.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  lineBasis,
  lineLightest,
  wholeBasis,
  type LineSector,
} from '@/code/measure/coined-line-bloch'
import {
  blochPacket,
  fitRing,
  levelPlacement,
  ringCenter,
  trackRun,
} from '@/code/measure/held-cluster'
import {
  cutDensity,
  pointBeatWith,
  type CutState,
  type PieceOptions,
} from '@/code/measure/bound-line'
import {
  cutRelativeFramed,
  placeCutFramed,
  runWindow,
  windowContext,
} from '@/code/measure/permutation-meeting'
import {
  bandCurvature,
  bandSlope,
  blochEntries,
  boostedRun,
  cutStart,
  exactStart,
  followLevel,
  lineFit,
  loneBand,
  loneEntries,
  pointOrbit,
  quarticMass,
  sumStates,
  type BoostedRun,
} from '@/code/measure/moving-level'

const BOX = 12
const P = 40
const SIDE = 16
const BEATS = 128
const STEP = Math.PI / 64
const NS: readonly number[] = [0, 1, 2, 4, 6, 8]
const PACKETS: readonly (readonly [number, number])[] = [
  [0, 2],
  [2, 4],
  [4, 6],
  [6, 8],
]
const FIT_NS: readonly number[] = [0, 1, 2, 4]
const HOLD = 0.99
const SPEED_TOL = 0.05
const MASS_TOL = 0.05
const SLOPE_D = 1e-3
const CURVE_D = 1e-2
const RECORDED = {
  energy: 0.33001851839229945,
  fidelity: 0.9990692989873735,
  trackEnergy: 0.33002027282349655,
}
const EXACT = 1e-12
const LONE_KS: readonly number[] = [Math.PI / 8, Math.PI / 2]
const LONE_BEATS = 32
const WINDOW = { side: 8, beats: 2, n: 8 }
const RULE: PieceOptions = {
  cost: true,
  sign: true,
  unit: 0,
  flat: false,
}
const UNBOUND: PieceOptions = {
  cost: true,
  sign: true,
  unit: 3,
  flat: false,
}
const BARE: PieceOptions = {
  cost: false,
  sign: false,
  unit: 0,
  flat: false,
}

type Run = BoostedRun

export default experiment({
  id: 'spin/moving-level',
  code: 'E-SPN-0105',
  title:
    "E-SPN-0104's held three-love level carries momentum as a unit, but its inertia is 74 times its rest energy, fail on M3: boosted to K = 0 .. pi/2 on the side-16 axis line's 32-position cover (the ring's holonomy takes point 0 to 3 and back), the working rule with the drift cost and the fermion sign holds it at every K (least fidelity 0.99976 over 128 beats), its energies follow the stand-in's band to 2e-6, its transported centroid moves at dE/dK to 4e-4 (up to 0.0297 docks a beat) and two-momentum packets' density at the band's chord to 2e-4; but m* = 1/E''(0) is 24.6 (stand-in 24.1) against E_rest 0.33002 with c = 1, the hyperbola through E_rest would need c = 0.116, and as a Dirac walk m* = tan(1.530) where a lone love's is tan(pi/3): a heavy narrow-band lattice particle, so falling alike is not yet earned; the unbound unit and the bare rule refused (fidelity 0.0004 to 0.18), E-SPN-0104's run reproduced bit for bit, the lone love on its closed form to 1e-14, the ring form equal to the exact rule on a boosted start across the cut to 4e-16",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void =>
      console.error(
        `${what} ${Math.round((Date.now() - started) / 1000)}s`,
      )

    // ---- the level and its band (the stand-in) ----
    const sector: LineSector = {
      flavors: [0, 0, 0],
      statistics: 'fermion',
      D: 3,
      box: BOX,
      unit: 0,
    }
    const basis = lineBasis(sector)
    const sub = wholeBasis(basis)
    const level = lineLightest(basis, sub).lightest
    const ks = NS.map(n => (2 * Math.PI * n) / 32)
    const band = followLevel(basis, sub, level, ks, STEP)
    const slopes = band.map(b => bandSlope(basis, sub, b, SLOPE_D))
    const curvature = bandCurvature(basis, sub, band[0]!, CURVE_D)
    const mPredicted = 1 / curvature
    const eRest = level.unwrapped

    log('band')

    // ---- the side-16 ring ----
    const ctx = windowContext(SIDE)
    const { f, ring, gauge, L } = ctx
    const orbit = pointOrbit(gauge)
    const cover = orbit.length * L

    if (cover !== 32) {
      throw new Error(
        `moving-level: the cover is ${cover}, the momenta were fixed for 32`,
      )
    }

    // one run: the fidelity with the start at every beat, the energy (minus the slope of the start overlap's unwrapped
    // phase, fitted linear over beats 0 .. beats), the transported centroid per beat, the density's circular angle
    const runOf = (
      options: PieceOptions,
      s0: CutState,
      K: number,
      beats = BEATS,
    ): Run =>
      boostedRun(
        s => pointBeatWith(options, f.tables, ring, s),
        s0,
        K,
        beats,
        s => cutDensity(L, s),
      )
    const placements = band.map(b =>
      blochEntries(gauge, basis, b.vector, b.K, P),
    )
    const starts = placements.map(p => cutStart(p.entries, P))

    // ---- the runs ----
    const runs = band.map((b, i) => {
      const r = runOf(RULE, starts[i]!, b.K)

      log(`K ${b.K.toFixed(4)}`)

      return r
    })

    // ---- the packets: (|K_a> + |K_b>) / sqrt 2, run as a start of its own ----
    const packets = PACKETS.map(([na, nb]) => {
      const r = runOf(
        RULE,
        sumStates(
          starts[NS.indexOf(na)]!,
          starts[NS.indexOf(nb)]!,
          Math.SQRT1_2,
        ),
        Number.NaN,
      )
      const fit = lineFit(
        r.angles.map((_, t) => t),
        r.angles,
      )
      const ea = band[NS.indexOf(na)]!.energy
      const eb = band[NS.indexOf(nb)]!.energy
      const dk = (2 * Math.PI * (nb - na)) / 32

      log(`packet ${na}, ${nb}`)

      return {
        na,
        nb,
        speed: (fit.b * L) / (2 * Math.PI),
        chord: (eb - ea) / dk,
        transported: r.velocity,
        first: r.angles[0]!,
        last: r.angles[BEATS]!,
      }
    })

    // ---- M1, M2, M3 ----
    const vMax = Math.max(...slopes.map(Math.abs))
    const m1 = runs.every(r => r.least >= HOLD)
    const speedOff = runs.map((r, i) =>
      r.K === 0
        ? Math.abs(r.velocity) / vMax
        : Math.abs(r.velocity / slopes[i]! - 1),
    )
    const packetOff = packets.map(p => Math.abs(p.speed / p.chord - 1))
    const m2 =
      speedOff.every(x => x <= SPEED_TOL) &&
      packetOff.every(x => x <= SPEED_TOL)
    const fitRuns = FIT_NS.map(n => runs[NS.indexOf(n)]!)
    const e0 = fitRuns[0]!.energy
    // E(K) - E(0) = alpha K^2 + beta K^4, least squares over the nonzero K
    const { mass: mMeasured, beta } = quarticMass(fitRuns)
    const m3 = Math.abs(mMeasured / eRest - 1) <= MASS_TOL
    const cNeeded = Math.sqrt(eRest / mMeasured)
    const halfGapLattice = Math.atan(mMeasured)
    // the hyperbola through E_rest with that c, against the measured band
    const hyperbola = runs.map(
      r => Math.sqrt(eRest ** 2 + (cNeeded * r.K) ** 2) - eRest,
    )
    const measuredRise = runs.map(r => r.energy - e0)

    log('gates')

    // ---- controls (a), (b) ----
    const controlRuns = [0, NS.indexOf(8)].flatMap(i => {
      const b = band[i]!

      return [
        {
          name: `unbound K ${b.K.toFixed(4)}`,
          r: runOf(UNBOUND, starts[i]!, b.K),
        },
        {
          name: `bare K ${b.K.toFixed(4)}`,
          r: runOf(BARE, starts[i]!, b.K),
        },
      ]
    })
    const controlUnbound = controlRuns.every(c => c.r.least < HOLD)

    log('controls a, b')

    // ---- control (c): E-SPN-0104's WabP, and the Bloch state at K = 0 ----
    const placed = levelPlacement(basis, level.cre, level.cim)
    const kept = fitRing(placed, L).kept
    const a = blochPacket(basis, L, level.cre, level.cim, true)
    const startDensity = a.density()
    const c0 = Math.round(ringCenter(startDensity)) % L

    let wab = placeCutFramed(gauge, kept, P, 'parallel')

    const wabTrack = trackRun({
      L,
      beats: BEATS,
      window: BEATS,
      center: c0,
      startDensity,
      step: () => {
        wab = pointBeatWith(RULE, f.tables, ring, wab)
      },
      density: () => cutDensity(L, wab),
      relative: () => cutRelativeFramed(gauge, wab),
      basis,
      vre: level.cre,
      vim: level.cim,
      shareEvery: 16,
    })
    const wabFidelity = Math.min(...wabTrack.fidelity)
    const restOff = Math.abs(runs[0]!.energy - eRest)
    const controlRest =
      Math.abs(wabFidelity - RECORDED.fidelity) <= EXACT &&
      Math.abs(wabTrack.energy - RECORDED.trackEnergy) <= EXACT &&
      Math.abs(eRest - RECORDED.energy) <= EXACT &&
      restOff <= 1e-4

    log('control c')

    // ---- control (d): the lone love ----
    const lone = LONE_KS.map(K => {
      const r = runOf(
        BARE,
        cutStart(loneEntries(gauge, K, P), P),
        K,
        LONE_BEATS,
      )
      const closed = loneBand(K)

      return {
        K,
        r,
        closed,
        energyOff: Math.abs(r.energy - closed.energy),
        speedOff: Math.abs(r.velocity - closed.slope),
      }
    })
    const controlLone = lone.every(
      x =>
        x.energyOff <= 1e-9 &&
        x.speedOff <= 1e-9 &&
        x.r.least >= 1 - EXACT,
    )
    const loneMass = 1 / (1 / Math.sqrt(3))

    log('control d')

    // ---- control (e): the exact window ----
    const wctx = windowContext(WINDOW.side)
    const wBand = band[NS.indexOf(WINDOW.n)]!
    const wAnchors = pointOrbit(wctx.gauge).map(
      (_, s) => s * wctx.L + wctx.L - 1,
    )
    const wPlaced = blochEntries(
      wctx.gauge,
      basis,
      wBand.vector,
      wBand.K,
      P,
      wAnchors,
    )
    const window = runWindow(
      { cost: true, sign: true },
      wctx,
      exactStart(wctx.vac, wctx.ring, wPlaced.entries, P),
      cutStart(wPlaced.entries, P),
      WINDOW.beats,
    )
    const controlWindow =
      window.reversed &&
      window.beats.every(
        b =>
          b.normKept &&
          b.physicalNormOff <= EXACT &&
          b.leak === 0 &&
          b.disturbed === 0 &&
          b.pointGap <= EXACT &&
          b.energyGap <= EXACT &&
          b.toneBroken === 0 &&
          b.outsideCone === 0,
      )

    log('control e')

    const control =
      controlUnbound && controlRest && controlLone && controlWindow
    const status = !control
      ? 'partial'
      : m1 && m2 && m3
        ? 'pass'
        : 'fail'
    const f4 = (x: number): string => x.toFixed(4)
    const f6 = (x: number): string => x.toFixed(6)
    const e3 = (x: number): string => x.toExponential(3)
    const metrics: Record<string, number> = {
      gate_M1: m1 ? 1 : 0,
      gate_M2: m2 ? 1 : 0,
      gate_M3: m3 ? 1 : 0,
      control: control ? 1 : 0,
      controlUnbound: controlUnbound ? 1 : 0,
      controlRest: controlRest ? 1 : 0,
      controlLone: controlLone ? 1 : 0,
      controlWindow: controlWindow ? 1 : 0,
      restEnergy: eRest,
      curvaturePredicted: curvature,
      massPredicted: mPredicted,
      massMeasured: mMeasured,
      massOverRest: mMeasured / eRest,
      quartic: beta,
      cNeeded,
      halfGapLattice,
      loneMass,
      cover,
      holonomyOrbit: orbit.length,
      wabLeastFidelity: wabFidelity,
      wabEnergy: wabTrack.energy,
      restOff,
      windowReversed: window.reversed ? 1 : 0,
      windowWorstPointGap: Math.max(
        ...window.beats.map(b => b.pointGap),
      ),
      windowWorstEnergyGap: Math.max(
        ...window.beats.map(b => b.energyGap),
      ),
      windowStartBranches: window.startBranches,
      seconds: (Date.now() - started) / 1000,
    }

    runs.forEach((r, i) => {
      const n = NS[i]!

      metrics[`n${n}_K`] = r.K
      metrics[`n${n}_leastFidelity`] = r.least
      metrics[`n${n}_energy`] = r.energy
      metrics[`n${n}_energyPredicted`] = band[i]!.energy
      metrics[`n${n}_velocity`] = r.velocity
      metrics[`n${n}_velocityPredicted`] = slopes[i]!
      metrics[`n${n}_speedOff`] = speedOff[i]!
      metrics[`n${n}_hyperbolaRise`] = hyperbola[i]!
      metrics[`n${n}_measuredRise`] = measuredRise[i]!
    })

    packets.forEach(p => {
      metrics[`packet${p.na}_${p.nb}_speed`] = p.speed
      metrics[`packet${p.na}_${p.nb}_chord`] = p.chord
      metrics[`packet${p.na}_${p.nb}_transported`] = p.transported
    })

    controlRuns.forEach(
      (c, i) => (metrics[`control${i}_leastFidelity`] = c.r.least),
    )

    lone.forEach((x, i) => {
      metrics[`lone${i}_energyOff`] = x.energyOff
      metrics[`lone${i}_speedOff`] = x.speedOff
    })

    const runRow = (r: Run, i: number): string =>
      `K ${f4(r.K)}: least fidelity ${f6(r.least)}, E ${f6(r.energy)} (predicted ${f6(band[i]!.energy)}), v ${e3(r.velocity)} (predicted ${e3(slopes[i]!)}, off ${f4(speedOff[i]!)})`

    return verdict({
      status,
      claim: `E-SPN-0104's level (E_rest ${eRest.toFixed(5)}) boosted on the side-16 axis line's ${cover}-position cover, the working rule with both pieces, ${BEATS} beats: ${runs.map(runRow).join('; ')}; two-momentum packets move at ${packets.map(p => `${e3(p.speed)} against the chord ${e3(p.chord)}`).join(', ')}; m* ${mMeasured.toFixed(3)} measured (${mPredicted.toFixed(3)} predicted) against E_rest ${eRest.toFixed(5)}, ratio ${(mMeasured / eRest).toFixed(1)}; a hyperbola through E_rest needs c = ${cNeeded.toFixed(4)}, and as a Dirac walk m* is tan(${halfGapLattice.toFixed(4)}) where the lone love's is tan(pi/3); M1 ${m1}, M2 ${m2}, M3 ${m3}; controls: ${controlRuns.map(c => `${c.name} least ${f4(c.r.least)}`).join(', ')}; E-SPN-0104's WabP least fidelity ${wabFidelity} energy ${wabTrack.energy}; lone love ${lone.map(x => `K ${f4(x.K)} E off ${x.energyOff.toExponential(1)} v off ${x.speedOff.toExponential(1)}`).join(', ')}; exact window ${controlWindow}`,
      metrics,
      control: {
        unbound: controlUnbound ? 1 : 0,
        rest: controlRest ? 1 : 0,
        lone: controlLone ? 1 : 0,
        window: controlWindow ? 1 : 0,
      },
      notes: `L2. M1 ${m1}, M2 ${m2}, M3 ${m3}; controls unbound ${controlUnbound}, rest ${controlRest}, lone ${controlLone}, window ${controlWindow}. Band (stand-in, steps of pi/64): ${band.map((b, i) => `K ${f4(b.K)} E ${f6(b.energy)} dE/dK ${e3(slopes[i]!)} residual ${b.residual.toExponential(1)} least overlap ${f4(b.overlap)}`).join('; ')}; E''(0) ${curvature.toExponential(5)}. Fit E(K) - E(0) = K^2/(2 m*) + b K^4 over K ${FIT_NS.map(n => f4((2 * Math.PI * n) / 32)).join(', ')}: m* ${mMeasured.toFixed(4)}, b ${beta.toExponential(3)}. Rise E(K) - E(0) measured ${measuredRise.map(e3).join(', ')}, hyperbola with c = ${cNeeded.toFixed(4)} ${hyperbola.map(e3).join(', ')}. Fidelity at beats 1, 16, 64, 128: ${runs.map(r => `K ${f4(r.K)} ${[1, 16, 64, 128].map(t => f6(r.fidelity[t - 1]!)).join(' ')}`).join('; ')}. Largest ring-form states: ${runs.map(r => r.size).join(', ')}. Packets (angle from ${packets.map(p => `${f4(p.first)} to ${f4(p.last)}, transported ${e3(p.transported)}`).join('; ')}). Placements: dropped ${placements.map(p => p.dropped.toExponential(1)).join(', ')}, kept weight ${placements.map(p => p.weight.toFixed(12)).join(', ')}. Controls: ${controlRuns.map(c => `${c.name} fidelity at 1, 16, 128 ${[1, 16, 128].map(t => f4(c.r.fidelity[t - 1]!)).join(' ')}`).join('; ')}. E-SPN-0104 WabP reproduced: least fidelity off ${Math.abs(wabFidelity - RECORDED.fidelity).toExponential(1)}, energy off ${Math.abs(wabTrack.energy - RECORDED.trackEnergy).toExponential(1)}; Bloch K = 0 energy off E_rest ${restOff.toExponential(1)}. Lone love: ${lone.map(x => `K ${f4(x.K)} E ${x.r.energy.toFixed(10)} (closed ${x.closed.energy.toFixed(10)}), v ${x.r.velocity.toFixed(10)} (closed ${x.closed.slope.toFixed(10)}), least fidelity ${x.r.least}`).join('; ')}; lone m* sqrt 3 against half-gap pi/3. Exact window (side ${window.side}, ring ${window.L}, orbit ${pointOrbit(wctx.gauge).join(',')}, ${window.startBranches} branches, slices ${[...new Set(wPlaced.entries.map(e => e.c))].join(',')}): ${window.beats.map((b, t) => `beat ${t + 1} ${b.branches} branches in ${b.slices} slices, norm ${b.normKept}, physical ${b.physicalNormOff.toExponential(1)}, leak ${b.leak}, disturbed ${b.disturbed}, point gap ${b.pointGap.toExponential(1)}, energy gap ${b.energyGap.toExponential(1)}, tone ${b.toneBroken}, cone ${b.outsideCone}`).join('; ')}; reversed ${window.reversed} (${window.seconds.toFixed(0)} s). ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
