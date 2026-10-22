// THE COUNTING CLOCK AGAINST THE BAND CLOCK (E-MTR-0026). Does a moving vibe's clock slow as the count of its
// cancelling steps says (linear in v), or as its band says (a square root)?
//
// THE QUESTION. One picture of a particle (the "matter as machine" model) draws it as a looped list of unit steps,
// rest mass being the steps that cancel. Plain counting then gives a rest share, and a clock rate, falling as 1 - v / c,
// while nature's clock runs at sqrt(1 - v^2 / c^2). The working rule's lone vibe is exactly such a list: every beat it
// takes one step along its line, forward or back (the coin keeps or crosses its slot, E-QTM-0157), and its amplitude is
// the sum over those take histories (E-QTM-0158). So both clocks can be read off one object.
//
// THE RULE: the working rule's lone open love on the empty box with trivial links (code/rule/coined-locked-knit's
// tables through code/measure/history-sum, no beat called), and its line walk (code/rule/fear-walk, FEAR_COIN), the
// rule's own by E-QTM-0157 and E-QTM-0158 H3a, rechecked here (G0).
//
// THE TWO CLOCKS (code/measure/counting-clock).
//  counting: a history ending at x after T beats has T - |x| cancelling steps, share 1 - |x| / T. Every history that
//    reaches x has this share, so the history weights only choose the ends. On the stationary ray x = v T the counting
//    clock is 1 - |v|, v in docks per beat.
//  band: the symbol read off one walk beat has eigenvalues e^(i theta / 2) e^(-+ i W(q)); the ray x = v T, v = W'(q),
//    carries the phase -(W - q v) T, so the band clock is (W - q v) / W(0) (sqrt(1 - v^2 / c^2) for a Lorentz band).
//
// DERIVED before the first run. cos W = cos q / 2 (E-QTM-0157): W(0) = pi / 3, the top group speed c* = 1 / 2 at
// q = pi / 2, where W = pi / 2 and the band clock is (pi / 2 - pi / 4) / (pi / 3) = 3 / 4 exactly. Near rest
// W = pi / 3 + q^2 / (2 sqrt 3), v = q / sqrt 3, so the band clock is 1 - v^2 / (2 c_rest^2) with c_rest^2 = W(0)
// W''(0) = (pi / 3) / sqrt 3 = 0.6046 (E-MTR-0024's locked-token deficit): quadratic, no linear term. The counting
// clock is 1 - v, linear, and 1 - c* = 1 / 2 at the top speed. The mean |v| over the stationary rays is
// (1 / 2 pi) int |W'| dq = (1 / pi) (W(pi) - W(0)) = 1 / 3, so the history-weighted mean counting share tends to 2 / 3.
// PREDICTION (from the brief): counting linear in v, band a square root. Either coming out the other way is reported.
//
// GATES, fixed before the first run:
//  G0 calibration: on the rule's tables (side 16, trivial links) the history sum's chance of every end along the line
//     equals the walk's exactly at every beat 1..7, no end off the line, and the history-weighted counting share
//     numerators are equal
//  G1 the history weights follow the band's rays: the walk's exact history-weighted mean counting share at T = 1024
//     is within 1e-4 of 1 - (1 / 2 pi) int |W'| dq read from the measured symbol, and that integral is 1 / 3 within 1e-9
//  G2 counting is linear: on the branch q in [0, q*] the counting clock at v = f c* (f = 0.05, 0.1, 0.25, 0.5, 0.75,
//     0.9, 1) is 1 - f c*, slope -1 per dock per beat at rest; it reads 1 / 2, not 0, at the top speed
//  G3 the band clock is not linear: its slope at f = 0.05, (1 - clock) / v, is at most 0.05 in size (counting's is 1),
//     and its rest curvature (1 - clock) / v^2 at f = 0.05 is 1 / (2 c_rest^2) within 1 percent, c_rest^2 = W(0) W''(0)
//     from the band by a 1e-3 difference
//  G4 the band clock is a square root: at every f it is sqrt(1 - v^2 / c_rest^2) within 0.025
//  C0 control, coin off (STAY_COIN, massless): every history ends at x = T (counting share 0 exactly at T = 1024) and
//     the band's phase rate W - q W' is 0 within 1e-9 at q = 0.3, 0.7, 1.1, 1.5 (both clocks read zero)
// Verdict: fail if G0 or C0 fails (the instrument); pass if every gate holds; partial otherwise.
// Reported, never gated: the band clock against sqrt(1 - v^2 / c*^2) (the top speed as c), the band's m / E, the far
// branch q in [q*, pi] (the same speeds, a band clock rising to 2 at q = pi), the walk's mean share at T = 64 and 256.
//
// PROBE before this file, disclosed: tmp/mtr-probe-clock.ts (the band clock 0.999483, 0.946561, 0.750000 at f = 0.05,
// 0.5, 1; counting 0.975, 0.75, 0.5; mean |v| 0.33333; walk mean share 0.666612, 0.666692, 0.666663 at T = 64, 128,
// 256; the coin-off phase rate 1.6e-11).
//
// FIRST RUN (2026-10-19, 14.5 s): PASS, every gate held, no gate moved; the title was written after the run. Band
// clock 0.99948, 0.94656, 0.75000 at f = 0.05, 0.5, 1 against counting 0.975, 0.75, 0.5; within 0.0158 of
// sqrt(1 - v^2 / c_rest^2) (worst at c*), curvature 1.0003 of 1 / (2 c_rest^2); mean counting share 0.666666 at
// T = 1024. Neither surprise happened: the band clock is not linear and the counting does not match the square root.
// BEARING on bound matter's R: counting has no quadratic term at rest, so it carries no inertia; the inertia is the
// band's, R = 1 / c_rest^2 = tan(mu) / mu = 1.654 at the coin's mu = pi / 3.
//
// DETERMINISM: no random number; the walk and the history sum are exact in Z[w][1/2]; floats only in the symbol's
// eigenphases and the readings. Depth L2: a known construction (a coined walk's dispersion and its Legendre transform)
// read on the rule's lone vibe, with an exact calibration (L1) and a control that reads zero.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { centerOf } from '@/code/measure/wall-reading'
import { contactFresh } from '@/code/measure/occupation-veto-readings'
import { lockedTables } from '@/code/rule/doublet-locked-knit'
import {
  FEAR_COIN,
  STAY_COIN,
  walkBeat,
  walkChances,
  walkStart,
  type WalkState,
} from '@/code/rule/fear-walk'
import {
  bandClock,
  historyCounting,
  lineBand,
  lineKernel,
  momentumOfSpeed,
  stationaryMeanSpeed,
  topSpeedMomentum,
  walkCounting,
} from '@/code/measure/counting-clock'

const SIDE = 16
const CALIBRATION_BEATS = 7
const SLOT = 0
const LONG = [64, 256, 1024]
const FRACTIONS = [0.05, 0.1, 0.25, 0.5, 0.75, 0.9, 1]
const CONTROL_MOMENTA = [0.3, 0.7, 1.1, 1.5]

// G0: the rule's history sum against the walk, end for end
function calibrate(): { ok: boolean; offLine: number; histories: number } {
  const f = contactFresh(SIDE, 'pass')
  const tables = lockedTables(
    f.weave,
    'pass',
    new Int16Array(f.cells * 24).fill(f.weave.moves.identity),
  )
  const center = centerOf(SIDE)
  const along: number[] = []

  let x = center

  do {
    along.push(x)
    x = f.weave.mesh.neighbour(x, SLOT)
  } while (x !== center && along.length < 1024)

  const n = along.length
  const lineIndex = new Map<number, number>(
    along.map((dock, i) => [dock, i > n / 2 ? i - n : i]),
  )
  const start = [{ slot: center * 24 + SLOT, point: 0 }]

  let walk: WalkState = walkStart(n, 0, true)
  let ok = true
  let offLine = 0
  let histories = 0

  for (let T = 1; T <= CALIBRATION_BEATS; T++) {
    walk = walkBeat(walk, () => FEAR_COIN)

    const h = historyCounting({ tables, start, beats: T, lineIndex })
    const chances = walkChances(walk)

    let walkShare = 0n

    chances.forEach((p, i) => {
      const at = i > n / 2 ? i - n : i

      walkShare += p * BigInt(T - Math.abs(at))

      if ((h.chances.get(at) ?? 0n) !== p) {
        ok = false
      }
    })

    if (h.unit !== 4n ** BigInt(T) || h.shareNumerator !== walkShare) {
      ok = false
    }

    offLine += h.offLine
    histories = h.histories
  }

  return { ok: ok && offLine === 0, offLine, histories }
}

export default experiment({
  id: 'matter/counting-clock',
  code: 'E-MTR-0026',
  title:
    "the counting clock against the band clock on the working rule's lone vibe, pass: the share of a take history's steps that cancel falls linearly, 1 - v, reading 1/2 at the top group speed c* = 1/2, while the band's clock (W - q W') / W(0) has no linear term, follows sqrt(1 - v^2 / c_rest^2) with the band's own c_rest^2 = W(0) W''(0) = 0.6046 to 0.016 up to c*, and reads 3/4 there; the history weights put the vibe on the band's rays (mean counting share 0.66667 at T = 1024 against 2/3); with the coin off both clocks read 0",
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const metrics: Record<string, number> = {}

    // ---- G0 ----
    const cal = calibrate()

    // ---- the band, read off one walk beat ----
    const kernel = lineKernel(FEAR_COIN)
    const rest = lineBand(kernel, 0)
    const h = 1e-3
    const curvature =
      (lineBand(kernel, h) - 2 * rest + lineBand(kernel, -h)) / (h * h)
    const cRest2 = rest * curvature
    const qTop = topSpeedMomentum(kernel)
    const cStar = bandClock(kernel, qTop).speed

    const rows = FRACTIONS.map(f => {
      const v = f * cStar
      const q = f === 1 ? qTop : momentumOfSpeed(kernel, v, qTop)
      const b = bandClock(kernel, q)
      const counting = 1 - b.speed
      const lorentz = Math.sqrt(Math.max(0, 1 - (b.speed * b.speed) / cRest2))
      const starForm = Math.sqrt(Math.max(0, 1 - f * f))

      return {
        f,
        q,
        v: b.speed,
        counting,
        band: b.clock,
        massOverEnergy: rest / b.energy,
        lorentz,
        starForm,
      }
    })

    // the far branch: the same speeds on q in [q*, pi]
    const far = [0.75, 0.5, 0.25].map(f => {
      let lo = qTop
      let hi = Math.PI

      for (let i = 0; i < 80; i++) {
        const mid = (lo + hi) / 2

        if (bandClock(kernel, mid).speed > f * cStar) {
          lo = mid
        } else {
          hi = mid
        }
      }

      return { f, band: bandClock(kernel, (lo + hi) / 2).clock }
    })
    const farEnd = bandClock(kernel, Math.PI - 1e-6).clock

    // ---- G1: the history weights against the band's rays ----
    const meanSpeed = stationaryMeanSpeed(kernel, 400000)
    const long = LONG.map(T => ({ T, ...walkCounting(FEAR_COIN, T) }))
    const last = long[long.length - 1]!

    // ---- C0: coin off ----
    const off = lineKernel(STAY_COIN)
    const offWalk = walkCounting(STAY_COIN, LONG[LONG.length - 1]!)
    const offRates = CONTROL_MOMENTA.map(q => bandClock(off, q).phaseRate)

    const small = rows[0]!
    const slope = (1 - small.band) / small.v
    const curvatureRatio =
      (1 - small.band) / (small.v * small.v) / (1 / (2 * cRest2))
    const lorentzGap = Math.max(
      ...rows.map(r => Math.abs(r.band - r.lorentz)),
    )

    const g = {
      G0: cal.ok,
      C0:
        offWalk.shareNumerator === 0n &&
        offWalk.normExact &&
        lineBand(off, 0) === 0 &&
        offRates.every(r => Math.abs(r) <= 1e-9),
    }
    const q = {
      G1:
        Math.abs(last.meanShare - (1 - meanSpeed)) <= 1e-4 &&
        Math.abs(meanSpeed - 1 / 3) <= 1e-9 &&
        long.every(r => r.normExact),
      G2:
        rows.every(r => Math.abs(r.counting - (1 - r.f * cStar)) <= 1e-9) &&
        Math.abs(rows[rows.length - 1]!.counting - 0.5) <= 1e-9,
      G3: Math.abs(slope) <= 0.05 && Math.abs(curvatureRatio - 1) <= 0.01,
      G4: lorentzGap <= 0.025,
    }
    const instrument = Object.values(g).every(Boolean)
    const answered = Object.values(q).every(Boolean)
    const status = !instrument ? 'fail' : answered ? 'pass' : 'partial'

    for (const [k, v] of Object.entries({ ...g, ...q })) {
      metrics[`gate_${k}`] = v ? 1 : 0
    }

    metrics.restEnergy = rest
    metrics.cRestSquared = cRest2
    metrics.topSpeed = cStar
    metrics.topSpeedMomentum = qTop
    rows.forEach(r => {
      const tag = `f${r.f}`

      metrics[`counting_${tag}`] = r.counting
      metrics[`band_${tag}`] = r.band
      metrics[`lorentzCRest_${tag}`] = r.lorentz
      metrics[`lorentzCStar_${tag}`] = r.starForm
      metrics[`massOverEnergy_${tag}`] = r.massOverEnergy
    })
    metrics.bandSlopeAtRest = slope
    metrics.bandCurvatureRatio = curvatureRatio
    metrics.bandLorentzGap = lorentzGap
    metrics.stationaryMeanSpeed = meanSpeed
    long.forEach(r => {
      metrics[`meanShare_T${r.T}`] = r.meanShare
    })
    metrics.calibrationHistoriesAtT7 = cal.histories
    metrics.controlMeanShare = offWalk.meanShare
    metrics.controlPhaseRateMax = Math.max(...offRates.map(Math.abs))
    far.forEach(r => {
      metrics[`farBranchBand_f${r.f}`] = r.band
    })
    metrics.farBranchBandAtPi = farEnd
    metrics.seconds = (Date.now() - started) / 1000

    const r4 = (x: number): string => x.toFixed(4)
    const top = rows[rows.length - 1]!
    const half = rows.find(r => r.f === 0.5)!

    return verdict({
      status,
      claim: `on the working rule's lone vibe the counting clock (the share of a take history's steps that cancel) is 1 - v exactly, linear, ${r4(half.counting)} at v = c*/2 and ${r4(top.counting)} at the top group speed c* = ${r4(cStar)}; the band clock (W - q W') / W(0) has slope ${slope.toExponential(2)} at rest (counting: -1), curvature ${r4(curvatureRatio)} of 1 / (2 c_rest^2) with c_rest^2 = ${r4(cRest2)}, reads ${r4(half.band)} and ${r4(top.band)} at c*/2 and c*, within ${r4(lorentzGap)} of sqrt(1 - v^2 / c_rest^2) and far from sqrt(1 - v^2 / c*^2) (${r4(half.starForm)}, 0); so the counting is linear and the band is a square root, with the band's own c, not the top speed; the history weights follow the band's rays (mean counting share ${last.meanShare.toFixed(6)} at T = ${last.T} against 1 - ${meanSpeed.toFixed(9)}); coin off, both clocks read 0`,
      metrics,
      control: {
        coinOffMeanShare: offWalk.meanShare,
        coinOffPhaseRateMax: Math.max(...offRates.map(Math.abs)),
      },
      notes: `L2. Gates ${Object.entries({ ...g, ...q })
        .map(([k, v]) => `${k} ${v}`)
        .join(
          ', ',
        )}. By v / c*: ${rows.map(r => `f ${r.f}: q ${r.q.toFixed(4)}, counting ${r4(r.counting)}, band ${r4(r.band)}, sqrt(1 - v^2 / c_rest^2) ${r4(r.lorentz)}, sqrt(1 - f^2) ${r4(r.starForm)}, m / E ${r4(r.massOverEnergy)}`).join('; ')}. The far branch (q past ${qTop.toFixed(4)}, the same speeds) has band clock ${far.map(r => `${r4(r.band)} at f ${r.f}`).join(', ')} and ${r4(farEnd)} at q = pi: no clock there, the band's top half is not a moving particle. Mean counting share ${long.map(r => `${r.meanShare.toFixed(6)} at T ${r.T}`).join(', ')}. Calibration: ${cal.histories} histories at beat ${CALIBRATION_BEATS}, ${cal.offLine} ends off the line. MEANING: counting the cancelling steps of one history is exactly the linear clock the brief names, and it is not the vibe's clock: a history's steps do not carry the phase. The clock is the phase on the stationary ray, which the amplitudes set, and it is quadratic at rest with the band's rest c (c_rest^2 = mu cot mu = 0.6046 at the coin's mu = pi / 3), not the top speed 1/2. Seconds ${((Date.now() - started) / 1000).toFixed(1)}.`,
    })
  },
})
