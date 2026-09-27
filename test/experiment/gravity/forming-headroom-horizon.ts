// Does a FORMING headroom horizon make particles at Hawking's temperature (remaining-pieces idea 5)? E-GRV-0122 and 0123
// read the static horizon's redshift: it runs at kappa, and the register caps it at ln z = ln(C) / 2. Here the lump
// GROWS: its excess M(t) u(r) fills each dock's register one count at a time, and each count is a sudden change of that
// dock's rate, a small quench that can mix positive and negative frequency. The light is linear, so the Bogoliubov
// coefficients between late outgoing modes and the early vacuum are read by exact projection, with nothing drawn.
//
// THE LIGHT AND ITS SHADOW (code/measure/headroom-bogoliubov). The headroom light's integer rule runs the leapfrog
// A <- A - K C^T U, U <- U + G C W A on A2 = R A + r, exactly up to its carried fraction (tmp/hawk-probe2: the float map
// equals the rule's shadow A2 + k_l C^T f to 1.7e-13 over 200 beats). Both steps are shears keeping Omega = sum_l w_l
// (A_l y'_l - y_l A'_l), y = C^T U, for ANY rates: the KG product survives every quench. On the L x 2 x 2 line with rooms
// that read x only, the transverse-uniform states are invariant, so the radial chain is 9 links a dock (tmp/hawk-probe5:
// the chain's operator equals the full one to 1e-17 on a room gradient; probe4: the chain equals the full float shadow to
// 2e-12 over 300 beats through a room change).
//
// THE MODES. Out: a positive-frequency, right-moving packet of the FLAT chain's acoustic pair (Bloch-projected, so its
// negative-frequency part is exactly 0), frequency weight exp(-(omega - omega0)^2 / (2 sigma^2)), sigma = T / 2, placed
// at r_c in the zone the lump never touches (every room C at every time), normalized to KG norm 1. It is run BACK
// through the history (the static final lump from t_f to t_g, the growth from t_g to 0) to t_0 = 0, where M = 0 and the
// whole ring is flat, and split there into positive and negative frequency of the flat chain, mode by mode (Bloch k, 18
// bands). N+ = sum |alpha|^2 and N- = sum |beta|^2 in KG units, N+ - N- = 1 by the conserved form; |beta / alpha|^2 is
// N- / N+. No sampling and no fit enters these numbers.
//
// THE GROWTH (the stated rate). M(t) = M_f min(1, t / t_g), t_g = 16384 beats, M_f = CAP / u(r_h): dM/dt = M_f / 16384 =
// 0.110 a beat. A dock's room is C - floor(C M u(r) / CAP), 0 once M u reaches CAP; below the profile's first radius the
// excess reads u(2). The final profile (r_h 12.5, C 25) has rooms 1, 3, 5, 6, 7, .. from dock 13 and is flat (room C)
// from r 313. Beat t reads the rooms at M(t).
//
// DERIVED BEFORE ANY RUN (tmp/hawk-probe6, the profile only).
//  - THE SIZE. The register must cap the redshift before the dock does: k_1 = 1 needs C <= 2 r_h + 1 (E-GRV-0123). The
//    zone the lump never reaches starts at r ~ C r_h, and the out packet must sit past it by 8.5 of its widths, so the
//    ring grows as C r_h: r_h 12.5 and C 25 (k_1 = 1, ln z top = ln(25) / 2 = 1.609) keep a run under 20 minutes. D0 = 2
//    as E-GRV-0123 (c0 = 0.2309). kappa = c0 s / (2 r_h) with the profile's slope s = 0.9892: kappa 9.1375e-3, T =
//    kappa / 2 pi = 1.4543e-3 per beat.
//  - THE REGISTER'S CUTOFF. At uniform room k the light is the flat light with both rates k / C, so its band is the flat
//    band scaled: cos omega = 1 - (k / C)^2 lambda / 2. The flat acoustic band tops at omega_top = 0.57351 (lambda_top =
//    0.3200), so a mode of frequency omega can stand on a dock of room k only if omega < omega_top(k). At the register's
//    last count (k = 1) that is omega_C = arccos(1 - lambda_top / (2 C^2)) = 0.022628 = 15.56 T. Below omega_C a mode
//    reaches the room-1 dock and sees the whole ln(C) / 2 window; above it the mode turns back at room k = C omega /
//    omega_top and its window shrinks to ln(omega_top / omega) / 2. In units of T: omega_C / T = 4 pi r_h omega_top /
//    (c0 s C) = 15.6 whenever C = 2 r_h, since omega_top / c0 = 2.483 is the lattice's. So THE PLANCK BAND IS omega < 15.6
//    T AT EVERY REGISTER-LIMITED SIZE, and the prediction for the spectrum above it: a steeper fall than e^(-omega / T).
//  - THE WINDOW IN TIME. A late ray's redshift grows at kappa for at most ln(C) / 2 = 1.61 e-folds, 1.61 / kappa = 176
//    beats, 0.26 of the thermal time 1 / T = 688 beats: less than one period of the modes the Planck law is about. A
//    thermal factor e^(-omega / T) needs the exponential to hold over many periods (Hawking's derivation continues it
//    analytically across the whole v range), so P1 IS PREDICTED TO FAIL; which way the slope departs is not predicted.
//  - THE STATIC CONTROL. A static medium keeps every frequency, so |beta| = 0 there exactly, up to the out packet's tail
//    in the zone that is not flat and float rounding. SIZED (tmp/hawk-probe7, the 4 T packet run back through the static
//    lump, weights only): at r_c 3050 the tail in the zone is 1.2e-24 of the weight at t_f; back at t_0 = 0 the packet
//    has come out (center r 3689) but 2.0e-21 of it still leaks from the slow docks, falling 5000-fold per 5000 beats.
//    So r_c is 3200 (the tail 9.1 widths from the zone) and the control runs 6144 beats further back than t_f, where the
//    residual is projected near 1e-25. The flat split is exact only on content outside the zone; the residual is
//    reported.
//
// THE RUN. Ring L = 16384 docks (8192 Bloch cells), lump at x = 8192. Out packets at omega / T = 4, 5.5, 7, 8.5, 10,
// 11.5, 13 (the band) and omega_C x 1.25, 1.6 (past it), each centered at r_c on the right, at t_f = t_g + the final
// staircase's eikonal time from dock 13 to r_c (the center ray leaves the room-1 dock as growth ends). All run back in
// one batch (18 real columns). The control: the final lump static throughout, packets at 4 T and 13 T at the same r_c,
// run back t_f + 6144 beats.
//
// GATES, fixed before the first run of this file (the probes sized the ring, the packet and the run time; none read a
// Bogoliubov coefficient):
//  P1 over the band's seven frequencies, ln |beta / alpha|^2 fitted as a - ln(e^(omega / T) - 1) (least squares in a and
//     T) gives T within 15 percent of kappa / 2 pi, with rms residual <= 0.25.
//  P2 the static lump: |beta / alpha|^2 <= 1e-24 at 4 T and 13 T (|beta / alpha| <= 1e-12).
//  P3 the INTEGER rule through the same growth schedule (a 128 x 2 x 2 replica, lump at 64, a plane packet amp 0.1 at
//     r 30) forward t_g + 2048 beats and back: bit for bit, 0 Gauss violations.
//  K1 the chain against the full L x 2 x 2 float shadow on the replica over 2048 beats of quenches (t_g - 1024 .. t_g +
//     1024): worst difference <= 1e-9 of the largest value.
//  K2 KG conservation on every out packet: |N+ - N- - 1| <= 1e-9.
// Verdict: pass if P1, P2, P3, K1 and K2 all hold; fail otherwise.
// REPORTED: per frequency N-, N+, |beta / alpha|^2, the negative part's mean in-frequency (its blueshift) and its share
// in the acoustic pair; the plain slope fit of ln |beta / alpha|^2 on the band; the ratio of the two past-cutoff points to
// the band's Planck extrapolation; the control's weight left in the zone that is not flat at t_0; the rule's wraps;
// the float chain's round trip on the replica; the rule-vs-shadow tracking through the quenches (the carried fraction
// jumps by (k' - k) C^T f at a quench, an amplitude-independent term).
//
// Depth L2: a known construction (Bogoliubov coefficients of a time-dependent linear medium) on the exact light of
// E-GRV-0122 over a background placed from the rule's linear statics; the room coupling and the growth law are placed by
// hand. DETERMINISM: every start and source is placed; nothing is drawn.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { lapseLinks, openMesh } from '@/code/rule/open-husk'
import { stackModes } from '@/code/measure/open-husk'
import { linearFit } from '@/code/measure/regression'
import { boxFreeExcess, unitProfile } from '@/code/measure/horizon-temperature'
import { profileKappa, roomSpeed, smoothPacket, stairTime } from '@/code/measure/headroom-horizon'
import { gaussViolations, noWraps } from '@/code/measure/varying-depth-light'
import { copySpan, makeHeadroomSpanMedium, makeSpanScratch, sameSpan, spanBeat, spanBeatBack } from '@/code/rule/depth-span-light'
import {
  chainBeat,
  chainBeatBack,
  curlOfPotential,
  flatModes,
  fullShadowBeat,
  kgNorm,
  makeBatch,
  makeUniformChain,
  outPacket,
  ruleShadow,
  setChainRooms,
  setMediumRooms,
  splitFlat,
  weightShare,
  type Split,
} from '@/code/measure/headroom-bogoliubov'

const D0 = 2
const CAP = 1.5
const C = 25
const RH = 12.5
const SIDE = 64
const L = 16384
const RC = 3200
const TG = 16384
const CONTROL_EXTRA = 6144
const SIGMA_T = 0.5
const BAND: readonly number[] = [4, 5.5, 7, 8.5, 10, 11.5, 13]
const PAST: readonly number[] = [1.25, 1.6]
const CONTROL: readonly number[] = [4, 13]
const P1_TOLERANCE = 0.15
const P1_RESIDUAL = 0.25
const P2_BOUND = 1e-24
const K1_BOUND = 1e-9
const K2_BOUND = 1e-9
const REPLICA = 128
const REPLICA_TAIL = 2048
const REPLICA_AMP = 0.1
const REPLICA_AT = 30
const REPLICA_WIDTH = 16
const LEVELS = 3
const K1_BEATS = 1024

type Column = { omega: number; split: Split; ratio: number; conservation: number }

// the least-squares Planck fit ln r = a - ln(e^(omega / T) - 1): for each T the best a is the mean, T by golden section
// on ln T over a decade each side of the guess
function planckFit(omegas: readonly number[], ratios: readonly number[], guess: number): { temperature: number; offset: number; residual: number } {
  const ys = ratios.map(Math.log)
  const at = (t: number): { a: number; rms: number } => {
    const shape = omegas.map(w => -Math.log(Math.expm1(w / t)))
    const a = ys.reduce((s, y, i) => s + y - shape[i]!, 0) / ys.length
    const rms = Math.sqrt(ys.reduce((s, y, i) => s + (y - a - shape[i]!) ** 2, 0) / ys.length)

    return { a, rms }
  }
  let lo = Math.log(guess / 10)
  let hi = Math.log(guess * 10)
  const phi = (Math.sqrt(5) - 1) / 2

  for (let i = 0; i < 200; i++) {
    const m1 = hi - phi * (hi - lo)
    const m2 = lo + phi * (hi - lo)

    if (at(Math.exp(m1)).rms < at(Math.exp(m2)).rms) hi = m2
    else lo = m1
  }

  const temperature = Math.exp((lo + hi) / 2)
  const best = at(temperature)

  return { temperature, offset: best.a, residual: best.rms }
}

export default experiment({
  id: 'gravity/forming-headroom-horizon',
  code: 'E-GRV-0129',
  title: 'particle production on a forming headroom horizon: exact Bogoliubov projection (first run pending)',
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${(Date.now() - started) / 1000}s`)
    const metrics: Record<string, number> = {}
    const lines: string[] = []

    // the profile, the final lump and its rooms
    const mesh = lapseLinks(openMesh(SIDE, 1, 'shrink'))
    const sm = stackModes(mesh.sides, 'lapse_upper')
    const profile = unitProfile(boxFreeExcess(mesh, sm), sm)
    const c0 = roomSpeed(D0)
    const mFinal = CAP / profile.at(RH)
    const pk = profileKappa(profile, RH, c0)
    const T = pk.kappa / (2 * Math.PI)
    const unit = (r: number): number => profile.at(Math.max(r, profile.first))
    const roomAt = (m: number, r: number): number => {
      const e = m * unit(r)

      return e >= CAP ? 0 : C - Math.floor((C * e) / CAP)
    }
    const finalRoom = (r: number): number => roomAt(mFinal, r)
    let flatFrom = Math.ceil(RH)

    for (let r = Math.ceil(RH); r < L / 2; r++) if (finalRoom(r) < C) flatFrom = r + 1

    const inner = Math.ceil(RH)
    const tf = TG + Math.round(stairTime(finalRoom, C, c0, inner, RC))
    const massAt = (t: number): number => mFinal * Math.min(1, t / TG)

    log(`profile: M ${mFinal} T ${T} flat from ${flatFrom} t_f ${tf}`)

    // the chain and its flat modes
    const xc = L / 2
    const dist = (x: number): number => Math.min(Math.abs(x - xc), L - Math.abs(x - xc))
    const chain = makeUniformChain(L, D0, C)
    const modes = flatModes(chain)
    const lambdaTop = 2 * (1 - Math.cos(modes.top))
    const omegaC = Math.acos(1 - lambdaTop / (2 * C * C))

    log(`modes: omega_top ${modes.top}, omega_C ${omegaC} = ${omegaC / T} T`)

    // the rooms at time t, per dock: only r < flatFrom ever changes
    const near: number[] = []

    for (let x = 0; x < L; x++) if (dist(x) < flatFrom) near.push(x)

    const nearUnit = near.map(x => unit(dist(x)))
    const rooms = new Int32Array(L).fill(C)
    const roomsAt = (t: number): boolean => {
      const m = massAt(t)
      let changed = false

      for (let i = 0; i < near.length; i++) {
        const x = near[i]!
        const e = m * nearUnit[i]!
        const k = e >= CAP ? 0 : C - Math.floor((C * e) / CAP)

        if (k !== rooms[x]) {
          rooms[x] = k
          changed = true
        }
      }

      return changed
    }

    // run a batch back from t_f to 0 under the growth, or `beats` beats through the static final lump
    const runBack = (b: ReturnType<typeof makeBatch>, grow: boolean, beats: number): number => {
      let quenches = 0

      if (!grow) {
        for (const x of near) rooms[x] = finalRoom(dist(x))
        setChainRooms(chain, x => rooms[x]!)
      }

      for (let t = beats; t >= 1; t--) {
        if (grow && roomsAt(t)) quenches += setChainRooms(chain, x => rooms[x]!)
        chainBeatBack(chain, b)
        if (t % 5000 === 0) log(`  back at ${t}`)
      }

      rooms.fill(C)
      setChainRooms(chain, () => C)

      return quenches
    }

    const split = (b: ReturnType<typeof makeBatch>, omegas: readonly number[]): Column[] =>
      omegas.map((omega, i) => {
        const s = splitFlat(chain, modes, b, 2 * i, 2 * i + 1)

        return { omega, split: s, ratio: s.negative / s.positive, conservation: Math.abs(s.positive - s.negative - 1) }
      })

    // THE GROWTH RUN
    const omegas = [...BAND.map(w => w * T), ...PAST.map(f => f * omegaC)]
    const grow = makeBatch(chain, 2 * omegas.length)

    omegas.forEach((w, i) => outPacket(chain, modes, grow, 2 * i, 2 * i + 1, w, SIGMA_T * T, xc + RC))

    const tail = Math.max(...omegas.map((_, i) => weightShare(chain, grow, 2 * i, 2 * i + 1, x => dist(x) < flatFrom)))
    const outNorm = Math.max(...omegas.map((_, i) => Math.abs(kgNorm(chain, grow, 2 * i, 2 * i + 1) - 1)))

    log(`growth: packets built, tail in the lump's zone ${tail}`)

    const quenches = runBack(grow, true, tf)
    const cols = split(grow, omegas)

    log(`growth: split, ${quenches} dock changes`)

    // THE STATIC CONTROL
    const controlOmegas = CONTROL.map(w => w * T)
    const still = makeBatch(chain, 2 * controlOmegas.length)

    controlOmegas.forEach((w, i) => outPacket(chain, modes, still, 2 * i, 2 * i + 1, w, SIGMA_T * T, xc + RC))
    runBack(still, false, tf + CONTROL_EXTRA)

    const controlLeft = Math.max(...controlOmegas.map((_, i) => weightShare(chain, still, 2 * i, 2 * i + 1, x => dist(x) < flatFrom)))
    const control = split(still, controlOmegas)

    log('control: split')

    // THE REPLICA: the integer rule through the growth (P3) and the chain against the full float shadow (K1)
    const rc = REPLICA / 2
    const rdist = (x: number): number => Math.min(Math.abs(x - rc), REPLICA - Math.abs(x - rc))
    const repRoom = (t: number) => (x: number): number => roomAt(massAt(t), rdist(x))
    const rep = makeHeadroomSpanMedium([REPLICA, 2, 2], D0, C, x => repRoom(0)(x))
    const start = smoothPacket(rep, LEVELS, rc + REPLICA_AT, REPLICA_AMP, REPLICA_WIDTH)
    const s = copySpan(start)
    const scratch = makeSpanScratch(rep, LEVELS)
    const wraps = noWraps()
    const repBeats = TG + REPLICA_TAIL
    const repChain = makeUniformChain(REPLICA, D0, C)
    const repBatch = makeBatch(repChain, 1)
    const startShadow = ruleShadow(rep, start)

    for (let i = 0; i < repChain.links; i++) repBatch.a[i] = startShadow[i]!

    let gauss = 0
    let last = ''
    const setRep = (t: number): void => {
      const f = repRoom(t)
      const key = Array.from({ length: REPLICA }, (_, x) => f(x)).join(',')

      if (key !== last) {
        setMediumRooms(rep, f)
        setChainRooms(repChain, f)
        last = key
      }
    }

    for (let t = 1; t <= repBeats; t++) {
      setRep(t)
      spanBeat(rep, s, scratch, LEVELS, wraps)
      chainBeat(repChain, repBatch)
      gauss += gaussViolations(rep, s)
    }

    // the rule against its float shadow after the whole growth
    const endShadow = ruleShadow(rep, s)
    let track = 0
    let trackTop = 0

    for (let i = 0; i < repChain.links; i++) {
      track = Math.max(track, Math.abs(endShadow[i]! - repBatch.a[i]!))
      trackTop = Math.max(trackTop, Math.abs(endShadow[i]!))
    }

    for (let t = repBeats; t >= 1; t--) {
      setRep(t)
      spanBeatBack(rep, s, scratch, LEVELS)
      chainBeatBack(repChain, repBatch)
    }

    const reversed = sameSpan(s, start)
    let floatBack = 0

    for (let i = 0; i < repChain.links; i++) floatBack = Math.max(floatBack, Math.abs(repBatch.a[i]! - startShadow[i]!), Math.abs(repBatch.y[i]!))

    log(`replica: reversed ${reversed}, gauss ${gauss}, wraps ${wraps.angle + wraps.field + wraps.potential}`)

    // K1: the chain against the full float shadow over the quenches around t_g
    const A = Float64Array.from(startShadow)
    const U = new Float64Array(rep.geometry.triangles)
    const k1Batch = makeBatch(repChain, 1)

    for (let i = 0; i < repChain.links; i++) k1Batch.a[i] = startShadow[i]!

    let k1Worst = 0
    let k1Top = 0
    let k1Quenches = 0

    for (let t = TG - K1_BEATS + 1; t <= TG + K1_BEATS; t++) {
      const before = last

      setRep(t)
      if (last !== before) k1Quenches++
      fullShadowBeat(rep, A, U)
      chainBeat(repChain, k1Batch)

      const y = curlOfPotential(rep, U)

      for (let i = 0; i < repChain.links; i++) {
        k1Worst = Math.max(k1Worst, Math.abs(k1Batch.a[i]! - A[i]!), C * Math.abs(k1Batch.y[i]! - y[i]!))
        k1Top = Math.max(k1Top, Math.abs(A[i]!))
      }
    }

    // THE GATES
    const band = cols.slice(0, BAND.length)
    const fit = planckFit(
      band.map(c => c.omega),
      band.map(c => c.ratio),
      T,
    )
    const bandFinite = band.every(c => c.ratio > 0 && Number.isFinite(c.ratio))
    const p1 = bandFinite && Math.abs(fit.temperature / T - 1) <= P1_TOLERANCE && fit.residual <= P1_RESIDUAL
    const p2 = control.every(c => c.ratio <= P2_BOUND)
    const p3 = reversed && gauss === 0
    const k1 = k1Worst <= K1_BOUND * k1Top
    const k2 = cols.every(c => c.conservation <= K2_BOUND) && control.every(c => c.conservation <= K2_BOUND)
    const status = p1 && p2 && p3 && k1 && k2 ? 'pass' : 'fail'

    // REPORTED
    const slope = bandFinite ? linearFit({ xs: band.map(c => c.omega), ys: band.map(c => Math.log(c.ratio)) }).slope : NaN
    const past = cols.slice(BAND.length)
    const extrapolate = (w: number): number => Math.exp(fit.offset - Math.log(Math.expm1(w / fit.temperature)))

    cols.forEach(c => {
      const key = `w${(c.omega / T).toFixed(2)}`
      const acoustic = c.split.negativeByBand.slice(0, 4).reduce((a, v) => a + v, 0)

      metrics[`${key}_ratio`] = c.ratio
      metrics[`${key}_negative`] = c.split.negative
      metrics[`${key}_positive`] = c.split.positive
      metrics[`${key}_blueshift`] = c.split.negativeMeanOmega / c.omega
      metrics[`${key}_acousticShare`] = acoustic / c.split.negative
      metrics[`${key}_conservation`] = c.conservation
      lines.push(
        `omega ${(c.omega / T).toFixed(2)} T (${(c.omega / omegaC).toFixed(3)} omega_C): |beta/alpha|^2 ${c.ratio.toExponential(4)}, N- ${c.split.negative.toExponential(4)}, N+ ${c.split.positive.toFixed(6)}, negative part at ${(c.split.negativeMeanOmega / c.omega).toFixed(2)} x omega, ${(acoustic / c.split.negative).toFixed(3)} of it in the lowest four bands; Planck fit gives ${extrapolate(c.omega).toExponential(4)}; conservation ${c.conservation.toExponential(2)}`,
      )
    })
    control.forEach(c => {
      const key = `control_w${(c.omega / T).toFixed(2)}`

      metrics[`${key}_ratio`] = c.ratio
      metrics[`${key}_conservation`] = c.conservation
      lines.push(`static control at ${(c.omega / T).toFixed(2)} T: |beta/alpha|^2 ${c.ratio.toExponential(3)}, conservation ${c.conservation.toExponential(2)}`)
    })

    metrics.gate_P1 = p1 ? 1 : 0
    metrics.gate_P2 = p2 ? 1 : 0
    metrics.gate_P3 = p3 ? 1 : 0
    metrics.control_K1 = k1 ? 1 : 0
    metrics.control_K2 = k2 ? 1 : 0
    metrics.T = T
    metrics.kappa = pk.kappa
    metrics.slope = pk.slope
    metrics.mass = mFinal
    metrics.growthRate = mFinal / TG
    metrics.omegaTop = modes.top
    metrics.omegaC = omegaC
    metrics.omegaCOverT = omegaC / T
    metrics.flatFrom = flatFrom
    metrics.tf = tf
    metrics.quenches = quenches
    metrics.planckT = fit.temperature
    metrics.planckTOverT = fit.temperature / T
    metrics.planckResidual = fit.residual
    metrics.slopeT = -1 / slope
    metrics.slopeTOverT = -1 / slope / T
    metrics.past125OverPlanck = past[0]!.ratio / extrapolate(past[0]!.omega)
    metrics.past160OverPlanck = past[1]!.ratio / extrapolate(past[1]!.omega)
    metrics.outTail = tail
    metrics.outNormError = outNorm
    metrics.controlLeftInZone = controlLeft
    metrics.replicaReversed = reversed ? 1 : 0
    metrics.replicaGauss = gauss
    metrics.replicaWraps = wraps.angle + wraps.field + wraps.potential
    metrics.replicaTracking = track / trackTop
    metrics.replicaFloatRoundTrip = floatBack / trackTop
    metrics.k1Worst = k1Worst / k1Top
    metrics.k1Quenches = k1Quenches
    metrics.seconds = (Date.now() - started) / 1000

    return verdict({
      status,
      claim: `a lump grown at dM/dt = M_f / ${TG} to r_h ${RH} (C ${C}, kappa ${pk.kappa.toExponential(4)}, T ${T.toExponential(4)}), out packets at ${BAND.join(', ')} T back to the flat vacuum: |beta/alpha|^2 ${band.map(c => c.ratio.toExponential(2)).join(', ')}; Planck fit T ${(fit.temperature / T).toFixed(3)} of kappa / 2 pi, rms ${fit.residual.toFixed(3)}; past omega_C (${(omegaC / T).toFixed(2)} T) ${past.map(c => c.ratio.toExponential(2)).join(', ')}, ${metrics.past125OverPlanck!.toExponential(2)} and ${metrics.past160OverPlanck!.toExponential(2)} of the fit; static lump ${control.map(c => c.ratio.toExponential(2)).join(', ')}; the integer rule reversed ${reversed}`,
      metrics,
      control: { p2Worst: Math.max(...control.map(c => c.ratio)), k1Worst: k1Worst / k1Top, controlLeft },
      notes: `L2. P1 ${p1}, P2 ${p2}, P3 ${p3}, K1 ${k1}, K2 ${k2}. ${lines.join('. ')}.`,
    })
  },
})
