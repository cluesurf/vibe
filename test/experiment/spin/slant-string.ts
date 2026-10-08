// DOES A STRING PRICED PER PROPER BEAT GIVE THE HELD LEVEL AN INERTIA EQUAL TO ITS REST ENERGY (E-SPN-0106)? E-SPN-0105
// found the held three-love level moves as one particle (fidelity at least 0.99976 at every K up to pi/2) with
// m* = 24.56 against E_rest 0.33002, a ratio of 74, and pointed at the drift cost: charged per link per MESH beat, like a
// static string, where a relativistic string (Nambu-Goto) is priced per unit of its own proper time.
// note/project/vibe/roadmap/research/discrete-gravity.md, "Measured, the trio moving".
//
// DERIVED BEFORE THE RUN.
// 1. THE LONE LOVE FIRST (code/measure/moving-level loneBand). One love, no pieces, is a Dirac walk: its two bands are
//    E = -pi/3 +- eps(K), cos eps = cos(K) / 2, so its center is -pi/3 and its half-gap (the Dirac mass, the rest energy
//    measured from the band center) is m = pi/3. Its curvature is E''(0) = cot m, so m* = tan m = sqrt 3, and its top
//    speed is cos m = 1/2 (at K = pi/2), not the stream's 1. So the walk ITSELF has
//      m* / E_rest = tan(pi/3) / (pi/3) = 1.654,
//    and E-SPN-0105's zero (a love at rest reads 0: the band through 1) gives it E_rest = 0 and a ratio without bound.
//    The ratio 74 therefore mixes two things: a zero at which no free love has any rest energy, and the composite. On the
//    walk's own terms, three free loves sharing K (each at K/3) have E(K) = 3 E_1(K/3), m* = 3 sqrt 3 = 5.196 and rest
//    energy 3 pi/3 = pi above their centers: the same 1.654. The held level's rest energy on those terms is pi + 0.33002 =
//    3.4716, and its m* 24.12 (stand-in) gives 6.947, which is 4.20 times the walk's own 1.654. So the equivalence gap
//    splits: a factor 1.654 is the WALK (tan m against m at a half-gap of pi/3, not small), and the remaining 4.20 is the
//    BINDING (m* 24.12 against the free composite's 5.20: 18.9 of the 24.1 is added by the cost and the contact).
// 2. THE COVARIANT STRING ON A LINE IS THE OLD COST. On a line (1+1) a string has no transverse motion, and Nambu-Goto is
//    sigma times the AREA of its world sheet. A 2d area is boost invariant (det 1). A string whose ends are at x1 < x2
//    and move at v has proper length L0 = gamma (x2 - x1) and ages by dt / gamma, so sigma L0 dtau = sigma (x2 - x1) dt:
//    price per lab length per lab beat IS price per proper length per proper time. The lattice's own area per beat is
//    the trapezoid (n_before + n_after) / 2 links; charging half the cost before the coin and half after the stream is
//    V^(1/2) U' V^(1/2), a conjugate of the old U' V, so it has the SAME spectrum. The old cost was already the
//    covariant one, and no reweighting that keeps the area can move m*.
// 3. THE PROPOSED PROPER-TIME COST, WRITTEN ANYWAY (code/rule/bound-line-pieces slantLinks, the `slant` option), as the
//    test the roadmap asked for: read on the coined labels, a costly gap whose two end docks each hold one love with the
//    same label (the gap taken one position along at the stream's speed, a null world sheet, no proper time) is not
//    charged that beat; every other costly link is charged as before. It is a phase diagonal in the coined
//    configuration and the cut trit, so it keeps the slices' norm exactly; the inverse reads the same coined
//    configuration and undoes it, so it runs back exactly; the vacuum has no open love and pays nothing. It equals the
//    old cost on every beat where no gap's ends co-move; it does NOT reduce to it at K = 0, because the loves' coin
//    makes co-moving ends at rest too (there is no static love on this lattice). By item 2 it is not boost covariant:
//    it prices a null segment at zero where the area does not.
//    PREDICTED from the stand-in (tmp/cs-probe1.log, instrument probe, below): the slant cost lowers the level to
//    E 0.24634 (next level 0.380, closer), leaves m* at 24.9 (not lower), and past K = pi/4 the followed level mixes
//    (least overlap 0.961, the band turns back). The ring form under it holds K = 0 at only 0.9724 over 32 beats and
//    K = pi/2 at 0.41: discounting co-moving strings opens an unconfined channel, it does not lighten the level. So C1
//    and C2 are PREDICTED TO FAIL, and no GRV check follows.
//
// GATES, fixed before the first run of this file. The runs: E-SPN-0105's setup (side-16 axis line, its 32-position
// cover, E-SPN-0104's rule with both pieces and the working split meeting, the ring form code/measure/bound-line
// pointBeatWith, 128 beats, K = 0, pi/16, pi/8, pi/4, 3pi/8, pi/2), the level and band of the stand-in under the SAME
// cost, with (a) the old cost and (b) the slant cost.
//  C1 the level holds with the slant cost: at every K the least fidelity over beats 1 .. 128 is at least 0.99.
//  C2 the equivalence, against the lone love's own ratio (item 1 says the walk itself is off, so the gate is not "1"):
//     R = (m* / E_rest) / (tan(pi/3) / (pi/3)), m* from the measured energies at K = 0, pi/16, pi/8, pi/4 fitted
//     E(K) - E(0) = K^2 / (2 m*) + b K^4 (E-SPN-0105's M3 fit), E_rest = pi + E(0) (three loves' half-gaps plus the
//     level's measured energy at K = 0), with the slant cost; C2 holds iff |R - 1| <= 0.2.
//  C3 the group velocity: with the slant cost the measured centroid velocity is at most 1 dock a beat at every K (the
//     stream moves a love one position a beat, so this cannot fail: a consistency check, stated as one), and it
//     APPROACHES the walk's own limit: at K = pi/2 it is at least 0.8 of the speed three free loves sharing K reach,
//     v_1(pi/6) = 0.27735 (loneBand; the lone love's own top speed is 1/2, not 1, item 1).
//  CONTROLS: (a) the old cost reproduces E-SPN-0105: its measured m* 24.564709334397314 within 1e-9 and its ratio
//     in E-SPN-0105's zero, m* / E(0), 74.4 (within 0.1); (b) the unbound unit (the bounce's -1 on a full line) with the
//     slant cost fails C1 at K = 0 and pi/2; (c) item 2: the area cost's stand-in level and m* equal the old cost's
//     (energy within 1e-12, m* within 1e-6); (d) the lone love's m* from the closed form's second difference is sqrt 3
//     within 1e-5, and the bare rule's ring run of a lone love at K = pi/8 reads the closed form's energy within 1e-9;
//     (e) the exact window with the slant cost: E-SPN-0105's control (e) (the K = pi/2 start's piece on the anchor before
//     the cut of every sheet of the side-8 cover, 2 beats) run by the exact rule with `slant` equals the ring form
//     (points and energy per husk column within 1e-12), keeps the norm, runs back exactly, leaks nothing, disturbs no
//     vacuum branch, breaks no mesh line, puts no love outside the cone.
//  Verdict: partial if a control fails; pass if C1, C2 and C3 hold; fail otherwise.
// PREDICTED: fail on C1, C2 and C3 (the probe below); every control holds.
//
// FIRST RUN (340 s, tmp/cs-spn-run1.log, the record): fail on C1, C2 and C3, as predicted, no gate moved; every control
// holds. C1: under the slant cost the least fidelity over 128 beats is 0.968, 0.962, 0.945 at K = 0, pi/16, pi/8 and
// 0.185, 0.355, 0.125 at pi/4, 3pi/8, pi/2 (where the followed level has mixed, least overlap 0.961). C2: m* 25.33
// measured (stand-in 24.92), E_rest pi + 0.24612, m*/E_rest 7.48, R = 4.52 against the lone love's 1.654 (the old cost
// on the same terms: R 4.28). The slant cost lowered the level (0.33002 to 0.24634) and did not lighten it. C3: the
// fastest centroid is 0.058 docks a beat, and at pi/2 it runs backwards (-0.041) against 0.8 of the free trio's 0.277.
// Controls: the old cost gives m* 24.564709334397314 exactly as E-SPN-0105 recorded, m*/E(0) 74.43; the unbound unit
// falls to 0.033 and 0.052; the area cost's stand-in equals the old (E to 1e-16, m* to 1.3e-9); the lone love's m*
// 1.7320511 (sqrt 3 to 3e-7 by a second difference), its ring energy on the closed form to 2e-16; the exact window
// with the slant cost (336 branches, 2 beats) matches the ring form to 2e-16 and runs back exactly, 0 leak, 0 vacuum
// branches disturbed. No GRV check follows (C1 and C2 fail). Title written after the run.
//
// DISCLOSED PROBE (instrument only, no gate read on it): tmp/cs-probe1.log, the three stand-in bands (old, area, slant),
// the lone love's numbers, and 32 ring beats under the slant cost at K = 0 and pi/2.
//
// Depth L2: the rule's own dynamics under two costs, with predictions from the stand-in that could be wrong. DETERMINISM:
// no random numbers. The rule is exact per slice in Z[w][1/2] with the clock count in Z_14; the band, the placement's
// floats and every reading are measurement. NOTHING MOVES: the cost is a phase, the clock count and the cut trit are
// registers the stream's own takes write. HUSK FIRST: one husk line's columns.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  lineBasis,
  lineLightest,
  wholeBasis,
  type LineSector,
} from '@/code/measure/coined-line-bloch'
import {
  cutDensity,
  pointBeatWith,
  type CutState,
  type PieceOptions,
} from '@/code/measure/bound-line'
import {
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
  loneBand,
  loneEntries,
  pointOrbit,
  quarticMass,
  type BandPoint,
  type BoostedRun,
} from '@/code/measure/moving-level'

const BOX = 12
const P = 40
const SIDE = 16
const BEATS = 128
const STEP = Math.PI / 64
const NS: readonly number[] = [0, 1, 2, 4, 6, 8]
const FIT_NS: readonly number[] = [0, 1, 2, 4]
const HOLD = 0.99
const RATIO_TOL = 0.2
const APPROACH = 0.8
const SLOPE_D = 1e-3
const CURVE_D = 1e-2
const EXACT = 1e-12
// E-SPN-0105's record (tmp/mb-spn-run1.log)
const RECORDED = { mass: 24.564709334397314, ratio: 74.4343361519997 }
const LONE_D = 1e-3
const WINDOW = { side: 8, beats: 2, n: 8 }
const OLD: PieceOptions = {
  cost: true,
  sign: true,
  unit: 0,
  flat: false,
}
const SLANT: PieceOptions = {
  cost: true,
  sign: true,
  unit: 0,
  flat: false,
  slant: true,
}
const UNBOUND: PieceOptions = {
  cost: true,
  sign: true,
  unit: 3,
  flat: false,
  slant: true,
}
const BARE: PieceOptions = {
  cost: false,
  sign: false,
  unit: 0,
  flat: false,
}

export default experiment({
  id: 'spin/slant-string',
  code: 'E-SPN-0106',
  title:
    "a string priced per proper beat does not give the held level an inertia equal to its energy, and the gap is not the string's covariance, fail on C1, C2 and C3: on a line Nambu-Goto is the world sheet's area, which the old per-link-per-beat cost already charges (its trapezoid form is a conjugate: stand-in E and m* equal to 1e-9), and a lone love of the walk has m* = tan(pi/3) = 1.732 against its half-gap pi/3, ratio 1.654, top speed 1/2, so the walk itself is off and E-SPN-0105's 74 was read from a zero where a love at rest weighs nothing; on the walk's own terms (E_rest = pi + E) the held level's ratio is 4.28 times the lone love's with the old cost; the slant cost (a gap whose two single end loves step alike is not charged) is exact, unitary and reversible (exact window to 2e-16, reversed, vacuum untouched), but lowers the level to 0.246 without lightening it (m* 25.3, R 4.52), loses it (fidelity 0.97 at rest over 128 beats, 0.13 at pi/2) and never moves it faster than 0.058 docks a beat; the old cost reproduces E-SPN-0105's m* 24.5647 exactly and the unbound unit is refused",
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
    const ks = NS.map(n => (2 * Math.PI * n) / 32)

    // ---- the lone love (item 1) ----
    const loneCurvature =
      (loneBand(LONE_D).energy +
        loneBand(-LONE_D).energy -
        2 * loneBand(0).energy) /
      LONE_D ** 2
    const loneMass = 1 / loneCurvature
    const loneRest = Math.PI / 3
    const loneRatio = Math.tan(loneRest) / loneRest
    const freeTrioSpeed = loneBand(Math.PI / 6).slope

    // ---- the stand-in under each cost ----
    const standIn = (extra: Partial<LineSector>) => {
      const sector: LineSector = {
        flavors: [0, 0, 0],
        statistics: 'fermion',
        D: 3,
        box: BOX,
        unit: 0,
        ...extra,
      }
      const basis = lineBasis(sector)
      const sub = wholeBasis(basis)
      const light = lineLightest(basis, sub)
      const band = followLevel(basis, sub, light.lightest, ks, STEP)
      const slopes = band.map(b => bandSlope(basis, sub, b, SLOPE_D))
      const curvature = bandCurvature(basis, sub, band[0]!, CURVE_D)

      return {
        basis,
        sub,
        light,
        band,
        slopes,
        curvature,
        mass: 1 / curvature,
        rest: light.lightest.unwrapped,
      }
    }

    const old = standIn({})

    log('stand-in old')

    const area = standIn({ area: true })

    log('stand-in area')

    const slant = standIn({ slant: true })

    log('stand-in slant')

    // ---- the ring ----
    const ctx = windowContext(SIDE)
    const { f, ring, gauge, L } = ctx
    const cover = pointOrbit(gauge).length * L

    if (cover !== 32) {
      throw new Error(
        `slant-string: the cover is ${cover}, the momenta were fixed for 32`,
      )
    }

    const runOf = (
      options: PieceOptions,
      s0: CutState,
      K: number,
      beats = BEATS,
    ): BoostedRun =>
      boostedRun(
        s => pointBeatWith(options, f.tables, ring, s),
        s0,
        K,
        beats,
        s => cutDensity(L, s),
      )
    const startsOf = (
      band: readonly BandPoint[],
      basis: typeof old.basis,
    ): CutState[] =>
      band.map(b =>
        cutStart(
          blochEntries(gauge, basis, b.vector, b.K, P).entries,
          P,
        ),
      )
    const slantStarts = startsOf(slant.band, slant.basis)
    const slantRuns = slant.band.map((b, i) => {
      const r = runOf(SLANT, slantStarts[i]!, b.K)

      log(`slant K ${b.K.toFixed(4)}`)

      return r
    })
    const oldStarts = startsOf(old.band, old.basis)
    const oldRuns = FIT_NS.map(n => {
      const i = NS.indexOf(n)
      const r = runOf(OLD, oldStarts[i]!, old.band[i]!.K)

      log(`old K ${r.K.toFixed(4)}`)

      return r
    })

    // ---- C1, C2, C3 ----
    const c1 = slantRuns.every(r => r.least >= HOLD)
    const slantFit = quarticMass(
      FIT_NS.map(n => slantRuns[NS.indexOf(n)]!),
    )
    const slantE0 = slantRuns[0]!.energy
    const slantRest = Math.PI + slantE0
    const slantRatio = slantFit.mass / slantRest
    const R = slantRatio / loneRatio
    const c2 = Math.abs(R - 1) <= RATIO_TOL
    const topMeasured = Math.max(
      ...slantRuns.map(r => Math.abs(r.velocity)),
    )
    const vHalf = slantRuns[NS.indexOf(8)]!.velocity
    const c3 = topMeasured <= 1 && vHalf >= APPROACH * freeTrioSpeed

    // the same readings with the old cost
    const oldFit = quarticMass(oldRuns)
    const oldE0 = oldRuns[0]!.energy
    const oldRest = Math.PI + oldE0
    const oldR = oldFit.mass / oldRest / loneRatio

    log('gates')

    // ---- controls ----
    const controlOld =
      Math.abs(oldFit.mass - RECORDED.mass) <= 1e-9 &&
      Math.abs(oldFit.mass / oldE0 - RECORDED.ratio) <= 0.1
    const unboundRuns = [0, NS.indexOf(8)].map(i =>
      runOf(UNBOUND, slantStarts[i]!, slant.band[i]!.K),
    )
    const controlUnbound = unboundRuns.every(r => r.least < HOLD)

    log('control b')

    const controlArea =
      Math.abs(area.rest - old.rest) <= EXACT &&
      Math.abs(area.mass - old.mass) <= 1e-6
    const loneRun = runOf(
      BARE,
      cutStart(loneEntries(gauge, Math.PI / 8, P), P),
      Math.PI / 8,
      32,
    )
    const loneEnergyOff = Math.abs(
      loneRun.energy - loneBand(Math.PI / 8).energy,
    )
    const controlLone =
      Math.abs(loneMass - Math.sqrt(3)) <= 1e-5 && loneEnergyOff <= 1e-9

    log('control d')

    const wctx = windowContext(WINDOW.side)
    const wBand = slant.band[NS.indexOf(WINDOW.n)]!
    const wAnchors = pointOrbit(wctx.gauge).map(
      (_, s) => s * wctx.L + wctx.L - 1,
    )
    const wPlaced = blochEntries(
      wctx.gauge,
      slant.basis,
      wBand.vector,
      wBand.K,
      P,
      wAnchors,
    )
    const window = runWindow(
      { cost: true, sign: true, slant: true },
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
      controlOld &&
      controlUnbound &&
      controlArea &&
      controlLone &&
      controlWindow
    const status = !control
      ? 'partial'
      : c1 && c2 && c3
        ? 'pass'
        : 'fail'
    const f4 = (x: number): string => x.toFixed(4)
    const f6 = (x: number): string => x.toFixed(6)
    const e3 = (x: number): string => x.toExponential(3)
    const metrics: Record<string, number> = {
      gate_C1: c1 ? 1 : 0,
      gate_C2: c2 ? 1 : 0,
      gate_C3: c3 ? 1 : 0,
      control: control ? 1 : 0,
      controlOld: controlOld ? 1 : 0,
      controlUnbound: controlUnbound ? 1 : 0,
      controlArea: controlArea ? 1 : 0,
      controlLone: controlLone ? 1 : 0,
      controlWindow: controlWindow ? 1 : 0,
      loneMass,
      loneRest,
      loneRatio,
      freeTrioSpeed,
      loneEnergyOff,
      oldStandInRest: old.rest,
      oldStandInMass: old.mass,
      areaStandInRest: area.rest,
      areaStandInMass: area.mass,
      slantStandInRest: slant.rest,
      slantStandInNext: slant.light.next,
      slantStandInMass: slant.mass,
      slantMeasuredMass: slantFit.mass,
      slantQuartic: slantFit.beta,
      slantE0,
      slantRest,
      slantRatio,
      slantR: R,
      slantRuleZeroRatio: slantFit.mass / slantE0,
      oldMeasuredMass: oldFit.mass,
      oldE0,
      oldRest,
      oldRuleZeroRatio: oldFit.mass / oldE0,
      oldR,
      topMeasured,
      vHalf,
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

    slantRuns.forEach((r, i) => {
      const n = NS[i]!

      metrics[`slant${n}_K`] = r.K
      metrics[`slant${n}_leastFidelity`] = r.least
      metrics[`slant${n}_energy`] = r.energy
      metrics[`slant${n}_energyPredicted`] = slant.band[i]!.energy
      metrics[`slant${n}_velocity`] = r.velocity
      metrics[`slant${n}_velocityPredicted`] = slant.slopes[i]!
      metrics[`slant${n}_bandOverlap`] = slant.band[i]!.overlap
    })

    oldRuns.forEach((r, i) => {
      const n = FIT_NS[i]!

      metrics[`old${n}_leastFidelity`] = r.least
      metrics[`old${n}_energy`] = r.energy
    })

    unboundRuns.forEach(
      (r, i) => (metrics[`unbound${i}_leastFidelity`] = r.least),
    )

    const runRow = (r: BoostedRun, i: number): string =>
      `K ${f4(r.K)}: least fidelity ${f6(r.least)}, E ${f6(r.energy)} (band ${f6(slant.band[i]!.energy)}), v ${e3(r.velocity)} (band ${e3(slant.slopes[i]!)})`

    return verdict({
      status,
      claim: `the lone love (no pieces) has m* ${loneMass.toFixed(6)} = tan(pi/3) against its half-gap pi/3, ratio ${loneRatio.toFixed(4)}, top speed 1/2, so the walk itself is off by that ratio and C2 is read against it; the area (trapezoid) cost is the old cost's conjugate (stand-in E ${area.rest.toFixed(8)} against ${old.rest.toFixed(8)}, m* ${area.mass.toFixed(6)} against ${old.mass.toFixed(6)}); the slant cost (a gap whose two single end loves step alike is not charged), E-SPN-0105's setup, ${BEATS} beats: ${slantRuns.map(runRow).join('; ')}; C1 ${c1} (least ${f4(Math.min(...slantRuns.map(r => r.least)))}); m* ${slantFit.mass.toFixed(3)} measured (stand-in ${slant.mass.toFixed(3)}), E_rest pi + ${slantE0.toFixed(5)}, m*/E_rest ${slantRatio.toFixed(3)}, R ${R.toFixed(3)} against the lone love's ratio, C2 ${c2}; top speed ${e3(topMeasured)}, v(pi/2) ${e3(vHalf)} against 0.8 of the free trio's ${f4(freeTrioSpeed)}, C3 ${c3}; the old cost: m* ${oldFit.mass.toFixed(6)}, m*/E(0) ${(oldFit.mass / oldE0).toFixed(2)}, R ${oldR.toFixed(3)}; controls: old ${controlOld}, unbound ${unboundRuns.map(r => f4(r.least)).join(', ')} (${controlUnbound}), area ${controlArea}, lone ${controlLone}, exact window ${controlWindow}`,
      metrics,
      control: {
        old: controlOld ? 1 : 0,
        unbound: controlUnbound ? 1 : 0,
        area: controlArea ? 1 : 0,
        lone: controlLone ? 1 : 0,
        window: controlWindow ? 1 : 0,
      },
      notes: `L2. C1 ${c1}, C2 ${c2}, C3 ${c3}; controls old ${controlOld}, unbound ${controlUnbound}, area ${controlArea}, lone ${controlLone}, window ${controlWindow}. Stand-in levels: old E ${old.rest} next ${old.light.next} m* ${old.mass}; area E ${area.rest} m* ${area.mass}; slant E ${slant.rest} next ${slant.light.next} particle levels ${slant.light.particleLevels} mean string ${slant.light.lightest.mean} contact ${slant.light.lightest.contact} m* ${slant.mass} (old contact ${old.light.lightest.contact}, mean string ${old.light.lightest.mean}). Slant band (steps of pi/64): ${slant.band.map((b, i) => `K ${f4(b.K)} E ${f6(b.energy)} dE/dK ${e3(slant.slopes[i]!)} residual ${b.residual.toExponential(1)} least overlap ${f4(b.overlap)}`).join('; ')}. Slant fit over K ${FIT_NS.map(n => f4((2 * Math.PI * n) / 32)).join(', ')}: m* ${slantFit.mass.toFixed(4)}, b ${slantFit.beta.toExponential(3)}. Fidelity at beats 1, 16, 64, 128: ${slantRuns.map(r => `K ${f4(r.K)} ${[1, 16, 64, 128].map(t => f6(r.fidelity[t - 1]!)).join(' ')}`).join('; ')}. Old runs: ${oldRuns.map(r => `K ${f4(r.K)} least ${f6(r.least)} E ${f6(r.energy)}`).join('; ')}; m* ${oldFit.mass} (recorded ${RECORDED.mass}), m*/E(0) ${oldFit.mass / oldE0} (recorded ${RECORDED.ratio}), E_rest pi + E(0) ${oldRest}, m*/E_rest ${oldFit.mass / oldRest}. Unbound (slant): ${unboundRuns.map(r => `K ${f4(r.K)} fidelity at 1, 16, 128 ${[1, 16, 128].map(t => f4(r.fidelity[t - 1]!)).join(' ')}`).join('; ')}. Lone love: E''(0) ${loneCurvature} m* ${loneMass}, ring run at pi/8 E ${loneRun.energy.toFixed(10)} (closed ${loneBand(Math.PI / 8).energy.toFixed(10)}) least fidelity ${loneRun.least}; free trio m* 3 sqrt 3 = ${(3 * Math.sqrt(3)).toFixed(4)}, v(pi/2) ${freeTrioSpeed}. Exact window (side ${window.side}, ${window.startBranches} branches): ${window.beats.map((b, t) => `beat ${t + 1} ${b.branches} branches in ${b.slices} slices, norm ${b.normKept}, physical ${b.physicalNormOff.toExponential(1)}, leak ${b.leak}, disturbed ${b.disturbed}, point gap ${b.pointGap.toExponential(1)}, energy gap ${b.energyGap.toExponential(1)}, tone ${b.toneBroken}, cone ${b.outsideCone}`).join('; ')}; reversed ${window.reversed} (${window.seconds.toFixed(0)} s). ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
