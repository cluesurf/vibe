// Does the light outside the clock horizon see a temperature (E-GRV-0120)? The clock horizon of E-GRV-0111 .. 0118 is
// clean (no slip, bald far out, r_h ~ M with the box taken out). Hawking's T = kappa / 2 pi is the temperature of a
// KILLING horizon, where the lapse N goes to 0. This file derives what the rule's lapse does at the clock horizon, then runs
// the spanned husk light on that background and reads its redshift (route (b) of the brief: the exponential redshift of
// outgoing rays, read from the light's own arrival times).
//
// DERIVED BEFORE THE RUN (code/measure/horizon-temperature has the algebra).
//  - THE LAPSE. E-FRC-0257's minimal coupling reads the metric count q = 2 D_m + 1, D_m = D_0 + e with e the found excess
//    in whole steps; matter's clock runs as q^(-1/2) and the spanned light as q^(-1) (E-GRV-0092). So f = q_0 / q and
//    N = sqrt(f). The clock horizon joins where e reaches CAP and the register holds CAP inside, so
//      N_h = sqrt(q_0 / (q_0 + 2 CAP)) = sqrt(33 / 36) = 0.9574   (D_0 = 16, CAP = 3/2),
//    NOT 0, and no bounded register can make it 0. "The clock stops" is the join, a jump from 0.957 to a torn dock, not a
//    lapse that runs down to zero.
//  - THE SURFACE GRAVITY from the measured profile (E-GRV-0118's box-free unit excess on the lapse stack of 1 layer,
//    side 64, the stack whose slope reached 1): dN/dr at r_h = N_h^3 s CAP / (q_0 r_h), s the local log slope (0.989 ..
//    1.000 at r_h = 6 .. 12). tmp/temp-probe1 read kappa M = c_0 N dN/dr M = 5.53, 5.50, 5.47, 5.45 c_0 (per dock units) at
//    r_h = 6, 8, 10, 12: T = kappa / 2 pi ~ 1 / M to 1.5 percent. So the RATE has Hawking's scaling.
//  - WHAT N_h > 0 COSTS. An outgoing ray leaving from just outside r_h reaches infinity redshifted by 1 / N_h at most, so
//    omega ~ exp(-kappa t) holds for W = ln(1 / N_h) = 0.0435 e-folds and then stops, at every M. A Planck spectrum needs
//    the exponential to run for several e-folds (the mode at omega ~ T is fixed by the last ln(omega / kappa) of them). So
//    T3 below is predicted to FAIL: the clock horizon has a surface gravity with Hawking's 1 / M, but no thermal window.
//  - MODE MIXING (route (a)) on this background is 0 exactly, derived and not run: the background is static and the beat
//    is a fixed map, so every mode keeps its beat frequency and positive and negative frequencies never mix (|beta| = 0).
//    A beta needs a time-dependent background (a lump forming, E-GRV-0112), and its exponential is bounded by the same W.
//  - THE LIGHT CROSSES THE HORIZON. The light reads only the metric register, which holds CAP inside, so inside is a
//    uniform medium of speed c_0 q_0 / q_cap; nothing in the light's rule reads the tear. REPORTED (not a gate).
//
// THE RUN. A plane packet (code/measure/varying-depth-light planarPacket, amp 12, half width 8 half steps) of the fixed-
// resolution spanned light (code/rule/depth-span-light makeMetricSpanMedium, resolution D_0 = 16, 3 levels) on a line of
// 128 x 2 x 2 docks whose metric depth at x is the profile at r = |x - 64|: the radial null rays of the lump (the plane
// packet carries no 1/r^2 spreading, which the eikonal does not see). The metric register counts in 1/12 of a step
// (D_m = 12 D_0 + round(12 e), q_0 = 385): the rule needs integer counts, and at whole steps the whole exterior would be
// two depths (disclosed; the finer register is a stand-in resolution, and N_h at this scale is sqrt(385 / 421) = 0.9563).
// The packet starts at x = 52 (12 docks inside, so its two halves have parted before any detector), detectors on every
// dock at r = 0 .. 30 on the +x side, 1.3 x 42 / c_0 beats, then run back. f on each unit interval = its local speed over
// the flat line's mean speed from r = 4; N_meas = sqrt(f). No profile value enters N_meas.
// THE LIGHT'S kappa: 1 - N_meas on the first 4 intervals wholly outside r_h fitted as A r^(-p), extrapolated to r_h:
// kappa_light = c_flat N dN/dr there, W_light = -ln N(r_h). THE PROFILE'S kappa: the same N dN/dr from the profile at the
// run's own q_0 and register scale, times c_0 = spanSpeed(12 D_0).
// THE MASSES: M = 900, 1150, 1450, 1750 (r_h = 6.2 .. 12.1 on the profile). THE FIELD CRITERION (control): E-GRV-0108's
// horizon on the same profile, where the axis step 2 M |e'| reaches the trit window 3/2 (r_f = 3.6 .. 5.0), the register
// held at e(r_f) inside.
//
// GATES, fixed before the first run of this file.
//  E  every light run reverses bit for bit, 0 wraps, 0 Gauss violations.
//  T1 at each M, the light's T = kappa_light / 2 pi is within 10 percent of the profile's kappa / 2 pi.
//  T2 T_light M is constant across the four M within 10 percent (max over min - 1 <= 0.10).
//  T3 the thermal window: W_light = ln(1 / N_meas(r_h)) >= 1 e-fold at every M. PREDICTED TO FAIL (0.044).
//  K1 flat space (e = 0): every interval from r = 4 reads |ln N_meas| <= 0.1 of the smallest predicted W (no invented
//     redshift).
//  K2 the field criterion's T_light M spreads by more than 10 percent across the four M (T2 can refuse).
// Verdict: pass if all hold; fail otherwise (a rate with no window is not a temperature).
// REPORTED: kappa for E-GRV-0111's placed horizons (side 24, the clock stack of 3 layers, compressed M = 600 .. 1600),
// read on their torn statics along the axes against dock 0 (the box included); the light's N against the profile's at
// every interval; the interior speed; the window in beats, Delta t = W / kappa, against M; the dock scale and the
// trans-Planckian cutoff for a would-be Killing horizon of the same r_h.
//
// FIRST RUN (tmp/temp-run1.log, the record, 425 s): FAIL on T1, T2 and T3; no gate moved.
//  - E holds: all 9 light runs reverse bit for bit, 0 wraps, 0 Gauss violations. K1 holds (flat |ln N| at most 1.27e-3
//    against 4.47e-3). K2 holds (the field criterion's T M spreads 0.790: it grows as about sqrt(M), so T2 could refuse).
//  - THE LAPSE IS NOT 0. The light reads N at the horizon 0.9542, 0.9551, 0.9561, 0.9544 for M = 900 .. 1750, against the
//    derived 0.9563, and inside the horizon it runs at f = 0.9165 against q_0 / q_cap = 0.9145: the light crosses the
//    clock horizon at a finite speed. T3 fails as predicted: the window is 0.0469, 0.0460, 0.0449, 0.0467 e-folds (gate
//    1), the same at every M. In beats it lasts W / kappa = 2367 .. 4671, 2.63 .. 2.67 M: the window's LENGTH grows as M,
//    its e-fold count does not.
//  - THE RATE. The profile's T M is 2.704e-3, 2.694e-3, 2.675e-3, 2.665e-3 (spread 1.5 percent: T ~ 1/M on the profile).
//    The light's T over the profile's is 1.179, 1.079, 0.984, 1.099, so T1 fails at M = 900 (0.179) and the light's T M
//    spreads 0.212 (T2 fails). Where it misses: the light's 1 - N sits within 6.7 .. 13.7 percent of the profile's outside
//    r_h + 1, and the local power law fitted over 4 docks (fit powers 0.92 .. 1.07 against the profile's 0.99 .. 1.00)
//    carries that scatter into the slope at r_h. The register's 1/12 step is 0.8 percent of CAP, so the staircase under
//    a 4-dock fit is the likely source; this run does not test it. The light's rate agrees with the profile's to about
//    10 percent and scales roughly as 1/M, but not to the gates' 10 percent.
//  - E-GRV-0111's side-24 horizons (reported): the axis finite difference across the torn edge gives N dN/dr M = 25, 215,
//    316, 87 (c_0 = 1). Two of the four crossings fall where the axis reading drops into the torn dock's neighbor, so on
//    that box the one-dock difference is not a surface gravity; the box-free profile is the one read for the gates.
//
// Depth L2: a known construction (the eikonal redshift of a static metric) read from an exact integer reversible light on
// a background placed from the rule's linear statics; the medium is a stand-in (nothing in the model makes the depth set
// the light's metric, E-GRV-0071). DETERMINISM: every start and source is placed; nothing is drawn.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { radionMesh } from '@/code/rule/trit-radion'
import { stepRule } from '@/code/rule/step-depth'
import { lapseLinks, openMesh, warpClock } from '@/code/rule/open-husk'
import { horizonRule } from '@/code/rule/horizon-husk'
import { clockHorizonRule } from '@/code/rule/clock-horizon'
import { compressLump } from '@/code/measure/step-depth'
import { stackModes } from '@/code/measure/open-husk'
import {
  axisMean,
  clockStatics,
  spreadSinks,
} from '@/code/measure/clock-horizon'
import {
  boxFreeExcess,
  fieldRadius,
  flatMeanSpeed,
  intervals,
  lapseOf,
  lightChain,
  lightGravity,
  lineCount,
  lineSpeed,
  radiusAt,
  surfaceGravity,
  unitProfile,
  type LightChain,
  type RadialLine,
  type SurfaceGravity,
  type UnitProfile,
} from '@/code/measure/horizon-temperature'

const D0 = 16
const CAP = 1.5
const WINDOW_STEP = 1.5
const SIDE = 64
const SCALE = 12
const LENGTH = 128
const CENTER = 64
const START = 52
const REACH = 30
const LEVELS = 3
const AMP = 12
const WIDTH = 8
const PATH = 42
const SLACK = 1.3
const FLAT_FROM = 4
const NEAR = 4
const MASSES: readonly number[] = [900, 1150, 1450, 1750]
const T1_TOLERANCE = 0.1
const T2_TOLERANCE = 0.1
const WINDOW_GATE = 1
const FLAT_SHARE = 0.1
// E-GRV-0111's lumps, reported
const OLD_SIDE = 24
const OLD_LAYERS = 3
const OLD_MASSES: readonly number[] = [600, 800, 1200, 1600]
const OLD_CENTER = [12, 12, 12]
const OLD_SINKS_FROM = 9

type Horizon = {
  m: number
  kind: 'clock' | 'field'
  radius: number
  inner: number
  predicted: SurfaceGravity
  chain: LightChain
  light: ReturnType<typeof lightGravity>
  worstLapse: number
  interior: number
}

function lineFor(
  profile: UnitProfile,
  m: number,
  radius: number,
  inner: number,
): RadialLine {
  return {
    length: LENGTH,
    center: CENTER,
    scale: SCALE,
    resolution: D0,
    excessAt: r =>
      r < radius ? inner : Math.min(inner, m * profile.at(r)),
  }
}

export default experiment({
  id: 'gravity/clock-horizon-temperature',
  code: 'E-GRV-0120',
  title:
    "the clock horizon has Hawking's 1/M surface gravity but no thermal window, fail on T1, T2 and T3: the register holds the lapse at sqrt(q_0 / q_cap) = 0.956 at the horizon instead of 0, and the spanned light run on the box-free radial profile (M = 900 .. 1750, r_h = 6.2 .. 12.1) reads N_h 0.954 .. 0.956 and crosses the horizon at 0.917 c_0, so an outgoing ray's exponential redshift lasts 0.045 .. 0.047 e-folds at every M (gate 1), 2.6 M beats; the profile's kappa M is constant to 1.5 percent, but the light's T over kappa / 2 pi reads 0.98 .. 1.18 (gate 0.1) and its T M spreads 0.21 (gate 0.1); a static background mixes no frequencies (beta = 0); flat space reads no redshift (1.3e-3) and the field criterion's T M spreads 0.79, so the gates could refuse; exact, reversed bit for bit",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void =>
      console.error(`${what} ${(Date.now() - started) / 1000}s`)
    const metrics: Record<string, number> = {}
    const lines: string[] = []

    // the measured profile (E-GRV-0118's box-free reading)
    const mesh = lapseLinks(openMesh(SIDE, 1, 'shrink'))
    const modes = stackModes(mesh.sides, 'lapse_upper')
    const profile = unitProfile(boxFreeExcess(mesh, modes), modes)

    log('profile')

    const flatLine: RadialLine = {
      length: LENGTH,
      center: CENTER,
      scale: SCALE,
      resolution: D0,
      excessAt: () => 0,
    }
    const c0 = lineSpeed(flatLine)
    const q0 = lineCount(flatLine)
    const window = Math.ceil((SLACK * PATH) / c0)
    const flat = lightChain(
      flatLine,
      START,
      REACH,
      window,
      LEVELS,
      AMP,
      WIDTH,
    )
    const cFlat = flatMeanSpeed(flat, FLAT_FROM)
    const flatIvs = intervals(flat, cFlat, FLAT_FROM)

    log('flat')

    const horizons: Horizon[] = []

    for (const kind of ['clock', 'field'] as const) {
      for (const m of MASSES) {
        const radius =
          kind === 'clock'
            ? radiusAt(profile, m, CAP)
            : fieldRadius(profile, m, WINDOW_STEP)
        const inner = kind === 'clock' ? CAP : m * profile.at(radius)
        const predicted = surfaceGravity(
          profile,
          m * SCALE,
          radius,
          q0,
          c0,
        )
        const line = lineFor(profile, m, radius, inner)
        const chain = lightChain(
          line,
          START,
          REACH,
          window,
          LEVELS,
          AMP,
          WIDTH,
        )
        const ivs = intervals(chain, cFlat, 0)
        const light = lightGravity(ivs, radius, NEAR, cFlat)
        const outside = ivs.filter(iv => iv.mid > radius + 1)
        const worstLapse = Math.max(
          ...outside.map(iv =>
            Math.abs(
              (1 - iv.lapse) /
                (1 - lapseOf(SCALE * m * profile.at(iv.mid), q0)) -
                1,
            ),
          ),
        )
        const deep = ivs.filter(iv => iv.mid < radius - 3)
        const interior =
          deep.length > 0
            ? deep.reduce((t, iv) => t + iv.f, 0) / deep.length
            : NaN

        horizons.push({
          m,
          kind,
          radius,
          inner,
          predicted,
          chain,
          light,
          worstLapse,
          interior,
        })
        log(`${kind} ${m}`)
      }
    }

    const clock = horizons.filter(h => h.kind === 'clock')
    const field = horizons.filter(h => h.kind === 'field')

    const spread = (hs: readonly Horizon[]): number => {
      const tm = hs.map(h => h.light.temperature * h.m)

      return Math.max(...tm) / Math.min(...tm) - 1
    }

    // THE GATES
    const runs = [flat, ...horizons.map(h => h.chain)]
    const e = runs.every(
      c =>
        c.run.reversed &&
        c.run.gauss === 0 &&
        c.run.wraps.angle +
          c.run.wraps.field +
          c.run.wraps.potential ===
          0,
    )
    const t1 = clock.every(
      h =>
        Math.abs(h.light.temperature / h.predicted.temperature - 1) <=
        T1_TOLERANCE,
    )
    const t2 = spread(clock) <= T2_TOLERANCE
    const t3 = clock.every(h => h.light.efolds >= WINDOW_GATE)
    const flatWorst = Math.max(
      ...flatIvs.map(iv => Math.abs(Math.log(iv.lapse))),
    )
    const smallestW = Math.min(...clock.map(h => h.predicted.efolds))
    const k1 = flatWorst <= FLAT_SHARE * smallestW
    const k2 = spread(field) > T2_TOLERANCE
    const status = e && t1 && t2 && t3 && k1 && k2 ? 'pass' : 'fail'

    // REPORTED: E-GRV-0111's placed horizons, kappa on their torn statics (the box included)
    const old = warpClock(openMesh(OLD_SIDE, OLD_LAYERS, 'shrink'))
    const oldRule = clockHorizonRule(
      horizonRule(stepRule(D0, LEVELS), 81),
      CAP,
    )
    const q0Model = 2 * D0 + 1
    const oldRows = OLD_MASSES.map(m => {
      const lump = compressLump(
        radionMesh([OLD_SIDE, OLD_SIDE, OLD_SIDE]),
        OLD_CENTER,
        m,
        1,
        spreadSinks(old, OLD_CENTER, m, OLD_SINKS_FROM),
      )
      const rho = new Int32Array(old.docks)

      rho.set(lump.content)

      const statics = clockStatics(old, oldRule, rho)
      const ex = (r: number): number =>
        axisMean(old, statics.torn, OLD_CENTER, r) - statics.torn[0]!

      let r = 1

      while (ex(r) >= CAP) {
        r++
      }

      const a = ex(r - 1)
      const b = ex(r)
      const radius = r - 1 + (a - CAP) / (a - b)
      const lapse = lapseOf(CAP, q0Model)
      const dLapse = (lapse ** 3 * (a - b)) / q0Model

      log(`E-GRV-0111 M ${m}`)

      return { m, radius, lapse, dLapse, kappaM: lapse * dLapse * m }
    })

    oldRows.forEach(o => {
      metrics[`old_M${o.m}_radius`] = o.radius
      metrics[`old_M${o.m}_dLapse`] = o.dLapse
      metrics[`old_M${o.m}_kappaM`] = o.kappaM
    })

    lines.push(
      `E-GRV-0111's placed horizons (side 24, box included), axis radius / dN/dr per dock / N dN/dr M (c_0 = 1): ${oldRows.map(o => `M ${o.m}: ${o.radius.toFixed(2)} / ${o.dLapse.toExponential(3)} / ${o.kappaM.toFixed(3)}`).join(', ')}`,
    )

    horizons.forEach(h => {
      const key = `${h.kind}_M${h.m}`
      const dt = h.predicted.efolds / h.predicted.kappa

      metrics[`${key}_radius`] = h.radius
      metrics[`${key}_innerExcess`] = h.inner
      metrics[`${key}_lapseProfile`] = h.predicted.lapse
      metrics[`${key}_lapseLight`] = h.light.lapse
      metrics[`${key}_dLapseProfile`] = h.predicted.dLapse
      metrics[`${key}_dLapseLight`] = h.light.dLapse
      metrics[`${key}_TProfile`] = h.predicted.temperature
      metrics[`${key}_TLight`] = h.light.temperature
      metrics[`${key}_TLightOverProfile`] =
        h.light.temperature / h.predicted.temperature
      metrics[`${key}_TLightM`] = h.light.temperature * h.m
      metrics[`${key}_efoldsProfile`] = h.predicted.efolds
      metrics[`${key}_efoldsLight`] = h.light.efolds
      metrics[`${key}_windowBeats`] = dt
      metrics[`${key}_windowBeatsOverM`] = dt / h.m
      metrics[`${key}_worstLapseDeviation`] = h.worstLapse
      metrics[`${key}_interiorF`] = h.interior
      metrics[`${key}_fitPower`] = h.light.power
      // a would-be Killing horizon of the same r_h and kappa: the dock scale leaves ln(r_h) e-folds of peeling from one dock
      // out, and a mode at omega ~ kappa blueshifts to the mesh's top (pi c_0 per dock) after ln(pi c_0 / kappa) e-folds
      metrics[`${key}_killingDockEfolds`] = Math.log(h.radius)
      metrics[`${key}_transPlanckEfolds`] = Math.log(
        (Math.PI * c0) / h.predicted.kappa,
      )

      lines.push(
        `${h.kind} M ${h.m}: r_h ${h.radius.toFixed(3)}, inner e ${h.inner.toFixed(3)}; N_h profile ${h.predicted.lapse.toFixed(5)} light ${h.light.lapse.toFixed(5)}; dN/dr profile ${h.predicted.dLapse.toExponential(4)} light ${h.light.dLapse.toExponential(4)} (fit power ${h.light.power.toFixed(3)}); T profile ${h.predicted.temperature.toExponential(4)} light ${h.light.temperature.toExponential(4)} (ratio ${(h.light.temperature / h.predicted.temperature).toFixed(4)}), T M ${(h.light.temperature * h.m).toExponential(4)}; window ${h.light.efolds.toFixed(4)} e-folds (profile ${h.predicted.efolds.toFixed(4)}), ${dt.toFixed(0)} beats = ${(dt / h.m).toFixed(2)} M; light's 1 - N off the profile's by at most ${(100 * h.worstLapse).toFixed(2)} percent outside r_h + 1; interior f ${h.interior.toFixed(5)} against q_0 / q_in ${(q0 / (q0 + 2 * Math.round(SCALE * h.inner))).toFixed(5)}`,
      )
    })

    metrics.gate_E = e ? 1 : 0
    metrics.gate_T1 = t1 ? 1 : 0
    metrics.gate_T2 = t2 ? 1 : 0
    metrics.gate_T3 = t3 ? 1 : 0
    metrics.control_K1 = k1 ? 1 : 0
    metrics.control_K2 = k2 ? 1 : 0
    metrics.clockSpread = spread(clock)
    metrics.fieldSpread = spread(field)
    metrics.flatWorst = flatWorst
    metrics.smallestW = smallestW
    metrics.q0 = q0
    metrics.c0 = c0
    metrics.cFlat = cFlat
    metrics.splice = profile.splice
    metrics.window = window
    metrics.seconds = (Date.now() - started) / 1000

    const worstT1 = Math.max(
      ...clock.map(h =>
        Math.abs(h.light.temperature / h.predicted.temperature - 1),
      ),
    )

    return verdict({
      status,
      claim: `the spanned light on the clock horizon's radial profile (lapse stack side 64, box free, CAP ${CAP}, register in 1/${SCALE} step, M = ${MASSES.join(', ')}): N at the horizon ${clock.map(h => h.light.lapse.toFixed(4)).join(', ')} (derived ${clock[0]!.predicted.lapse.toFixed(4)}, not 0); T_light over kappa / 2 pi ${clock.map(h => (h.light.temperature / h.predicted.temperature).toFixed(3)).join(', ')} (worst ${worstT1.toFixed(3)}, gate ${T1_TOLERANCE}); T M spread ${spread(clock).toFixed(3)} (gate ${T2_TOLERANCE}); window ${clock.map(h => h.light.efolds.toFixed(4)).join(', ')} e-folds (gate ${WINDOW_GATE}); flat ${flatWorst.toExponential(2)} (gate ${(FLAT_SHARE * smallestW).toExponential(2)}); field criterion T M spread ${spread(field).toFixed(3)}; exact ${e}`,
      metrics,
      control: {
        k1: k1 ? 1 : 0,
        k2: k2 ? 1 : 0,
        flatWorst,
        fieldSpread: spread(field),
      },
      notes: `L2. E ${e}, T1 ${t1}, T2 ${t2}, T3 ${t3}, K1 ${k1}, K2 ${k2}. ${lines.join('. ')}.`,
    })
  },
})
