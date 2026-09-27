// Does a lapse that runs to 0 at the register's bound give the clock horizon a temperature (E-GRV-0122)? E-GRV-0120 found
// the clock horizon's lapse held at sqrt(q_0 / (q_0 + 2 CAP)) = 0.956: light crossed it and the exponential redshift
// lasted 0.045 e-folds. The proposal tested here: the lapse is the metric register's REMAINING ROOM. The register holds
// the found excess e below CAP in counts of CAP / C, and its room k = C - e_count sets the rate h = k / C = (CAP - e) /
// CAP at which the light's metric parts run: a carried accumulator over the room (code/rule/depth-span-light
// makeHeadroomSpanMedium), 0 exactly at the bound.
//
// DERIVED BEFORE ANY RUN.
//  - THE COUPLING. E-GRV-0093's split keeps the clock part (the kick) and the span part (the drift) equal. Both run at h,
//    so the light's speed is c0 h and its metric is ds^2 = -h dt^2 + dx^2 / h: f = h (= -g_tt), N = sqrt(h). Matter's
//    kick reads the room and its rest term none (E-FRC-0257's minimal coupling), so its rest rate runs as sqrt(h): the
//    same exponents in h as E-GRV-0092's in q_0 / q. The literal reading "matter's clock N = h" would make f = h^2, a
//    double zero at r_h: an extremal horizon with f'(r_h) = 0, kappa = 0 and a redshift growing as a power of the time,
//    never exponentially. So the room is the LIGHT's lapse squared, f, and matter's clock is its root.
//  - THE WEAK FIELD. Far out e << CAP: f = 1 - e / CAP, N = 1 - e / (2 CAP), so Phi = -e / (2 CAP). The found depth goes
//    as k_u M / r (E-GRV-0118), so Newton's k / r survives with G = k_u / (2 CAP) in the light's units. The light's index
//    is 1 / h and matter's clock sqrt(h) at EVERY h, so the bending factor (the speed's exponent in h over the rest
//    rate's) is 2, as in E-GRV-0093: the ratio is the split, which the room does not touch.
//  - WHAT FIXES THE CAP. It is now the coupling: G = k_u / (2 CAP), and the horizon at e = CAP sits at r_h = k_u M / CAP
//    = 2 G M, Schwarzschild's radius, with no second number. Under E-GRV-0120's coupling (f = q_0 / (q_0 + 2e)) the weak
//    field was G_old = k_u / q_0 and the cap set r_h separately, r_h = 22 G_old M; the room coupling makes gravity
//    q_0 / (2 CAP) = 11 times stronger at the same CAP. The cap's value (3/2, the trit window of E-GRV-0112's register) is
//    a chosen input, like G: nothing in the rule fixes it.
//  - ALPHA. The room enters only as a rate on the two metric parts; every window and the Peierls root stay at D0. At a
//    uniform room k with q0 C / k an odd whole number q_m, the rule is one linear map with the minimal-coupling light at
//    metric count q_m (drift and kick both k / (q0 C) = 1 / q_m), and the room matter is the span matter at q_m with every
//    term multiplied by k^2 (bit for bit the same field). E-FRC-0257 found alpha_local = sqrt(3) / (48 D0) flat in the
//    metric count, so alpha stays flat: read here at h = 1, 1/3, 1/9 (D_m = 16, 49, 148).
//  - THE SURFACE GRAVITY. f = 1 - (r_h / r)^s near r_h, so f'(r_h) = s / r_h and kappa = c0 f'(r_h) / 2 = c0 s / (2 r_h)
//    = c0 s CAP / (2 k_u M): T = kappa / 2 pi ~ 1 / M, and with s = 1, c0 = 1 it is 1 / (8 pi G M), Hawking's.
//  - WHERE THE DOCK ENDS THE EXPONENTIAL, three ways:
//    (a) THE CONTINUUM's own curvature: the outgoing redshift's local e-folding rate is c0 f'(r) / 2, within 10 percent of
//        kappa only for r - r_h < 0.05 r_h, where ln z > 1.5. Two e-folds inside that band need ln z to 3.5.
//    (b) THE STAIRCASE: the room is constant across a dock, and a link reads its slower end, so the first live interval
//        runs at h_1 ~ s (dock offset) / r_h and ln z <= ln z_1 = -ln(h_1) / 2 ~ ln(2 r_h / s) / 2: 1.4, 1.8, 2.1, 2.4 at
//        r_h = 6.5 .. 48.5.
//    (c) THE WAVE: a packet of frequency omega turns back where f omega_max ~ omega (its blueshifted wavelength reaches
//        the dock), ln z_turn ~ ln(omega_max / omega) / 2; only waves near omega ~ kappa follow the ray to the first dock.
//    So H2 below is PREDICTED TO FAIL at every M reachable here: ln z = 3.5 needs r_h ~ 550 docks. H1 holds by
//    construction (a full register's dock runs at rate 0 exactly); it is a check of the rule, not a finding.
//
// THE RUN. The box-free unit profile of E-GRV-0118 / 0120 (lapse stack of 1 layer, side 64; beyond r = 14 the stack's
// Green's function held to the measured level, E-GRV-0120's splice). Four horizons r_h = 6.5, 12.5, 24.5, 48.5, each
// half a dock from the grid so every M has the same dock offset: M = CAP / unit(r_h). The register counts C = 243 (five
// trits) per CAP, room k(r) = C - floor(C M unit(r) / CAP). The light: resolution D0 = 16, 3 shaped levels, on a line
// of L x 2 x 2 docks, the lump at x = L / 2, the room read at the periodic distance. A smooth plane packet (the bump of
// planarPacket held to 1 / (q0 C) of an angle unit, amplitude AMP, half width WIDTH half steps) starts GAP docks outside
// the horizon; its inward half crosses detectors on every dock from floor(r_h) to floor(r_h) + OUT + 1, read on the
// first passage (code/measure/varying-depth-light firstLobeCentroid). The window is SLACK times the staircase's eikonal
// time (used only for the run's length). A detector is RESOLVED when its summed weight is at least SHARE of the
// outermost's. On each interval between resolved neighbors r, r + 1: f = speed / c_flat (c_flat from the same packet on
// a line of full room), placed at radius r (the interval runs at dock r's room), z = f^(-1/2), u = the time from the
// outermost detector (by exact reversal, the outgoing ray's time to it).
//
// GATES, fixed before the first run of this file. The probes (tmp/room-probe1 logs) sized the packet (width 32 half
// steps, amplitude 2: 0 wraps, flat jitter under 0.02 in ln z), the window and the first-passage reading, and showed
// each interval's f tracks its inner dock's room (so the reading is placed at r, not r + 1 as first written); they
// compared nothing to a gate.
//  E  every run reverses bit for bit, 0 wraps, 0 Gauss violations.
//  H1 the surface traps light: in every M's chain no detector at r <= r_h ever reads weight (the inward packet never
//     reaches a full register), and a packet started at the center (support inside r_h) leaves weight exactly 0 on every
//     detector outside r_h over the same window.
//  H2 the exponential, at every M: over the resolved intervals with ln z >= 1, at least 3 intervals, spanning >= 2
//     e-folds of z, whose least-squares slope of ln z against u is within 10 percent of the profile's kappa.
//  H3 Hawking scaling: T_light M (T_light = kappa_light / 2 pi, kappa_light from the power law 1 - f = (A / r)^p fitted
//     on the NEAR innermost resolved intervals, kappa = c_flat p / 2A) is constant across the four M to 10 percent.
//  H4 the weak field: the bending factor (the light's speed exponent in h over matter's rest-rate exponent, uniform
//     rooms 243, 203, 163, 123) within 5 percent of 2; alpha_local at h = 1, 1/3, 1/9 flat to 1e-6 at every separation;
//     and the reduction it rests on: the room light's arrivals and weights within 1e-4 of the metric light's at q_m =
//     q0 C / k, the room matter's rest rate EQUAL to the span matter's.
//  K1 flat space: the flat chain's every resolved interval reads |ln z| <= FLAT_LNZ (no invented redshift).
//  K2 E-GRV-0120's rule on the smallest M's profile fails H1 (the inside packet reaches the outside detectors) and H2.
// Verdict: pass if E, H1 .. H4, K1 and K2 all hold; fail otherwise. Route (a) (a forming lump's Bogoliubov |beta/alpha|^2)
// runs only if H1 .. H3 hold.
// REPORTED: per M, the dock cutoff in e-folds (the staircase's ln z_1 and the light's largest resolved ln z), the light's
// kappa and T over the profile's, its fitted power p (Newton's 1 / r is p = 1), the exponential's slope over kappa.
//
// FIRST RUN (tmp/room-run1.log, the record, 789 s): FAIL on H2 (as predicted) and H3; no gate moved. Route (a) not run.
//  - E holds: every chain, inside packet, flat and old-rule run, the uniform speeds, rest rates, reductions and alpha
//    pairs reverse bit for bit with 0 wraps and 0 Gauss violations.
//  - H1 holds (by construction): no frozen detector ever reads weight, and the inside packet leaves exactly 0 outside,
//    at every M. The light's speed on the first live interval is 0.053, 0.032, 0.017, 0.010 of c_flat.
//  - H2 fails at every M, on the span: the near zone (ln z >= 1) holds 1, 2, 3, 7 intervals spanning 0, 0.61, 0.86,
//    1.24 e-folds (gate 2), with slope over kappa -, 0.75, 0.79, 0.86, rising toward 1 as r_h grows.
//  - THE DOCK CUTOFF: the light's largest ln z is 1.47, 1.73, 2.04, 2.29 at M = 942, 1804, 3531, 6990 (r_h 6.5 .. 48.5)
//    against the staircase's -ln(h_1) / 2 = 1.30, 1.60, 1.94, 2.20 (first live room 18, 10, 5, 3 of 243). Both grow as
//    about ln(M) / 2 (0.41 and 0.45 per e-fold of M). The light reads 0.1 past the staircase: its first-passage arrival
//    at the wall face is held back by the pile-up there.
//  - H3 fails: T_light M 0.411, 0.436, 0.462, 0.410 (spread 0.127, gate 0.1); T_light over the profile's 1.019, 1.096,
//    1.152, 1.022. The profile's T M is 0.403, 0.397, 0.401, 0.401, constant to 1.5 percent. The misses are the fitted
//    powers 1.09 and 1.16 (profile 0.99, 1.00) at r_h 12.5 and 24.5; at 6.5 and 48.5 the power is 1.00 and 1.02 and T
//    is within 2 percent. The fit's zero sits at 6.37, 12.57, 24.70, 48.53: the light finds the horizon to 0.2 dock.
//  - H4 holds: speed exponent 0.99988, rest exponent 0.50030, bending 1.9985; alpha_local 2.2552745e-3 at h = 1, 1/3,
//    1/9, flat to 8.2e-10 (sqrt(3) / (48 D0) to 1e-9); the reduction is EXACT, arrivals and weights equal the metric
//    light's at D_m = 49 and 148 value for value, the room matter's rest rate equals the span matter's.
//  - K1 holds (flat |ln z| at most 0.017). K2 holds: E-GRV-0120's rule lets the inside packet out (weight 1.4e5 outside)
//    and reads ln z 0.045 at most, f 0.91 .. 0.97, no near zone.
//
// Depth L2: a known construction (a static metric's redshift and its surface gravity) on an exact integer reversible
// light over a background placed from the rule's linear statics; the room coupling is a change made by hand, motivated
// (the register's bound is where the clock should stop) but not produced by the model. DETERMINISM: every start and
// source is placed; nothing is drawn.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { lapseLinks, openMesh } from '@/code/rule/open-husk'
import { stackModes } from '@/code/measure/open-husk'
import { logLogSlope } from '@/code/measure/regression'
import { restRate } from '@/code/measure/depth-arena'
import { boxFreeExcess, lineCount, lineSpeed, radialMedium, unitProfile, type RadialLine } from '@/code/measure/horizon-temperature'
import { LOCAL_LEVELS, LOCAL_SEPARATIONS, localAlpha, localUnits, pairReading } from '@/code/measure/local-alpha'
import {
  chainSpeed,
  exponential,
  lightKappa,
  profileKappa,
  reduction,
  reductionDepth,
  roomChain,
  roomIntervals,
  roomMedium,
  roomOf,
  roomRestRate,
  roomSpeed,
  smoothPacket,
  stairTime,
  uniformRoomSpeed,
  type Chain,
  type RoomInterval,
} from '@/code/measure/headroom-horizon'
import type { SpanMedium } from '@/code/rule/depth-span-light'

const D0 = 16
const CAP = 1.5
const BASE = 243
const LEVELS = 3
const SIDE = 64
const R_H: readonly number[] = [6.5, 12.5, 24.5, 48.5]
const AMP = 2
const WIDTH = 32
const INSIDE_WIDTH = 8
const GAP = 48
const OUT = 14
const SLACK = 1.5
const SHARE = 0.25
const NEAR = 4
const NEAR_ZONE = 1
const H2_SPAN = 2
const H2_TOLERANCE = 0.1
const H3_TOLERANCE = 0.1
const BEND_TOLERANCE = 0.05
const ALPHA_FLAT = 1e-6
const REDUCTION_TOLERANCE = 1e-4
const FLAT_LNZ = 0.05
const SPEED_ROOMS: readonly number[] = [243, 203, 163, 123]
const ALPHA_ROOMS: readonly number[] = [243, 81, 27]
const REDUCTION_ROOMS: readonly number[] = [81, 27]
const REST_TERM = 3
const REST_AMP = 100000
const REST_BEATS = 8192
const OLD_SCALE = 12

type Horizon = {
  rh: number
  m: number
  length: number
  window: number
  chain: Chain
  inside: Chain
  ivs: RoomInterval[]
  frozenWeight: number
  insideWeight: number
  firstRoom: number
  stairEfolds: number
  exp: ReturnType<typeof exponential>
  light: ReturnType<typeof lightKappa>
  profile: ReturnType<typeof profileKappa>
}

const exact = (c: Chain): boolean => c.run.reversed && c.run.gauss === 0 && c.run.wraps.angle + c.run.wraps.field + c.run.wraps.potential === 0
const spreadOf = (xs: readonly number[]): number => Math.max(...xs) / Math.min(...xs) - 1

export default experiment({
  id: 'gravity/headroom-horizon-temperature',
  code: 'E-GRV-0122',
  title:
    "a lapse set by the metric register's remaining room traps light and keeps the weak field, but the dock ends its exponential redshift after 1.5 .. 2.3 e-folds, fail on H2 and H3: with the light's two metric parts running at h = (CAP - e) / CAP (f = h, matter's clock sqrt(h), G = k_u / 2 CAP, r_h = 2 G M) on the box-free profile at r_h = 6.5 .. 48.5 (M = 942 .. 6990), no packet crosses a full register, the light slows to 0.010 .. 0.053 c on the first live dock and finds the horizon to 0.2 dock; its largest redshift is ln z 1.47, 1.73, 2.04, 2.29, the staircase's 1.30 .. 2.20 plus 0.1, growing as ln(M) / 2, so the near zone spans 0 .. 1.24 e-folds (gate 2) at slope 0.75 .. 0.86 of kappa; T_light M spreads 0.127 (gate 0.1) where the profile's is flat to 1.5 percent; bending 1.9985, alpha flat to 8e-10, the room light equal value for value to the minimal-coupling light at q0 C / k; E-GRV-0120's rule lets light out and reads 0.045 e-folds; exact, reversed bit for bit",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${(Date.now() - started) / 1000}s`)
    const metrics: Record<string, number> = {}
    const lines: string[] = []

    // the measured profile (E-GRV-0118's box-free reading)
    const mesh = lapseLinks(openMesh(SIDE, 1, 'shrink'))
    const modes = stackModes(mesh.sides, 'lapse_upper')
    const profile = unitProfile(boxFreeExcess(mesh, modes), modes)
    const c0 = roomSpeed(D0)

    log('profile')

    const geometry = (rh: number): { inner: number; start: number; length: number; center: number; radii: number[] } => {
      const inner = Math.ceil(rh)
      const start = inner + GAP
      const length = 2 * (start + WIDTH / 2 + 8)

      return { inner, start, length, center: length / 2, radii: Array.from({ length: OUT + 2 }, (_, i) => Math.floor(rh) + i) }
    }

    // the flat line: full room everywhere, the smallest horizon's geometry
    const g0 = geometry(R_H[0]!)
    const flatMedium = roomMedium({ length: g0.length, center: g0.center, resolution: D0, base: BASE, room: () => BASE })
    const flat = roomChain(flatMedium, g0.center, smoothPacket(flatMedium, LEVELS, g0.center + g0.start, AMP, WIDTH), g0.radii, Math.ceil((SLACK * (GAP + WIDTH / 2)) / c0))
    const cFlat = chainSpeed(flat)
    const flatIvs = roomIntervals(flat, cFlat, SHARE)
    const flatWorst = Math.max(...flatIvs.map(iv => Math.abs(iv.lnz)))

    log('flat')

    const horizons: Horizon[] = R_H.map(rh => {
      const m = CAP / profile.at(rh)
      const room = roomOf(profile, m, CAP, BASE)
      const g = geometry(rh)
      const window = Math.ceil(SLACK * stairTime(room, BASE, c0, g.inner, g.start + WIDTH / 2))
      const med: SpanMedium = roomMedium({ length: g.length, center: g.center, resolution: D0, base: BASE, room })
      const chain = roomChain(med, g.center, smoothPacket(med, LEVELS, g.center + g.start, AMP, WIDTH), g.radii, window)
      const outside = g.radii.filter(r => r > rh)
      const inside = roomChain(med, g.center, smoothPacket(med, LEVELS, g.center, AMP, INSIDE_WIDTH), outside, window)
      const ivs = roomIntervals(chain, cFlat, SHARE)
      let first = g.inner

      while (room(first) === 0) first++

      log(`r_h ${rh}`)

      return {
        rh,
        m,
        length: g.length,
        window,
        chain,
        inside,
        ivs,
        frozenWeight: g.radii.reduce((a, r, i) => (r <= rh ? a + chain.run.weight[i]! : a), 0),
        insideWeight: inside.run.weight.reduce((a, w) => a + w, 0),
        firstRoom: room(first),
        stairEfolds: -0.5 * Math.log(room(first) / BASE),
        exp: exponential(ivs, NEAR_ZONE),
        light: lightKappa(ivs, NEAR, cFlat),
        profile: profileKappa(profile, rh, c0),
      }
    })

    // K2: E-GRV-0120's rule on the smallest horizon's profile, the same packet, detectors and readings
    const h0 = horizons[0]!
    const oldLine = (excessAt: (r: number) => number): RadialLine => ({ length: h0.length, center: g0.center, scale: OLD_SCALE, resolution: D0, excessAt })
    const oldProfileLine = oldLine(r => (r < h0.rh ? CAP : Math.min(CAP, h0.m * profile.at(r))))
    const oldQ0 = lineCount(oldProfileLine)
    const oldSlowest = (lineSpeed(oldProfileLine) * oldQ0) / (oldQ0 + 2 * Math.round(OLD_SCALE * CAP))
    const oldWindow = Math.ceil((SLACK * (GAP + WIDTH / 2)) / oldSlowest)
    const oldMedium = radialMedium(oldProfileLine)
    const oldFlatMedium = radialMedium(oldLine(() => 0))
    const oldFlat = roomChain(oldFlatMedium, g0.center, smoothPacket(oldFlatMedium, LEVELS, g0.center + g0.start, AMP, WIDTH), g0.radii, oldWindow)
    const oldCFlat = chainSpeed(oldFlat)

    log('old flat')

    const oldChain = roomChain(oldMedium, g0.center, smoothPacket(oldMedium, LEVELS, g0.center + g0.start, AMP, WIDTH), g0.radii, oldWindow)
    const oldOutside = g0.radii.filter(r => r > h0.rh)
    const oldInside = roomChain(oldMedium, g0.center, smoothPacket(oldMedium, LEVELS, g0.center, AMP, INSIDE_WIDTH), oldOutside, oldWindow)
    const oldIvs = roomIntervals(oldChain, oldCFlat, SHARE)
    const oldExp = exponential(oldIvs, NEAR_ZONE)
    const oldInsideWeight = oldInside.run.weight.reduce((a, w) => a + w, 0)

    log('old rule')

    // H4: uniform rooms
    const speeds = SPEED_ROOMS.map(k => uniformRoomSpeed(k, BASE, D0, LEVELS))

    log('speeds')

    const rests = SPEED_ROOMS.map(k => roomRestRate(k, BASE, D0, REST_TERM, REST_AMP, REST_BEATS))
    const hs = SPEED_ROOMS.map(k => k / BASE)
    const speedExponent = logLogSlope(
      hs,
      speeds.map(s => s.speed),
    )
    const restExponent = logLogSlope(
      hs,
      rests.map(r => r.rate),
    )
    const bending = speedExponent / restExponent
    const reductions = REDUCTION_ROOMS.map(k => reduction(k, BASE, D0, LEVELS))
    const matterEqual = REDUCTION_ROOMS.map(k => {
      const depth = reductionDepth(k, BASE, D0)

      return roomRestRate(k, BASE, D0, REST_TERM, REST_AMP, REST_BEATS).rate === restRate(depth, REST_TERM, REST_AMP, REST_BEATS, 'span').rate
    })

    log('reductions')

    const alphaDepths = ALPHA_ROOMS.map(k => reductionDepth(k, BASE, D0))
    const alphas = alphaDepths.map(depth => {
      const units = localUnits('span', depth)

      return LOCAL_SEPARATIONS.map(r => localAlpha(pairReading('span', depth, r, LOCAL_LEVELS, D0), units))
    })
    const alphaSpread = Math.max(...LOCAL_SEPARATIONS.map((_, j) => spreadOf(alphas.map(row => row[j]!.alphaLocal))))
    const alphaExact = alphas.every(row => row.every(a => a.pair.reversed && a.pair.gauss === 0 && a.pair.wraps === 0 && a.units.reversed))

    log('alpha')

    // THE GATES
    const e =
      [flat, oldFlat, oldChain, oldInside, ...horizons.flatMap(h => [h.chain, h.inside])].every(exact) &&
      speeds.every(s => s.run.reversed && s.run.gauss === 0 && s.run.wraps.angle + s.run.wraps.field + s.run.wraps.potential === 0) &&
      rests.every(r => r.reversed) &&
      reductions.every(r => r.room.reversed && r.metric.reversed && r.room.gauss === 0 && r.room.wraps.angle + r.room.wraps.field + r.room.wraps.potential === 0) &&
      alphaExact
    const h1 = horizons.every(h => h.frozenWeight === 0 && h.insideWeight === 0)
    const h2Of = (x: ReturnType<typeof exponential>, kappa: number): boolean => x.count >= 3 && x.span >= H2_SPAN && Math.abs(x.rate / kappa - 1) <= H2_TOLERANCE
    const h2 = horizons.every(h => h2Of(h.exp, h.profile.kappa))
    const tm = horizons.map(h => h.light.temperature * h.m)
    const h3 = spreadOf(tm) <= H3_TOLERANCE
    const reductionOk = reductions.every(r => r.arrivalOff <= REDUCTION_TOLERANCE && r.weightOff <= REDUCTION_TOLERANCE) && matterEqual.every(Boolean)
    const h4 = Math.abs(bending / 2 - 1) <= BEND_TOLERANCE && alphaSpread <= ALPHA_FLAT && reductionOk
    const k1 = flatIvs.length > 0 && flatWorst <= FLAT_LNZ
    const oldH1 = oldInsideWeight === 0
    const oldH2 = h2Of(oldExp, h0.profile.kappa)
    const k2 = !oldH1 && !oldH2
    const status = e && h1 && h2 && h3 && h4 && k1 && k2 ? 'pass' : 'fail'

    horizons.forEach(h => {
      const key = `M${Math.round(h.m)}`

      metrics[`${key}_radius`] = h.rh
      metrics[`${key}_mass`] = h.m
      metrics[`${key}_window`] = h.window
      metrics[`${key}_firstRoom`] = h.firstRoom
      metrics[`${key}_stairEfolds`] = h.stairEfolds
      metrics[`${key}_lightEfolds`] = h.exp.top
      metrics[`${key}_nearCount`] = h.exp.count
      metrics[`${key}_nearSpan`] = h.exp.span
      metrics[`${key}_nearRateOverKappa`] = h.exp.rate / h.profile.kappa
      metrics[`${key}_kappaProfile`] = h.profile.kappa
      metrics[`${key}_kappaLight`] = h.light.kappa
      metrics[`${key}_TLightOverProfile`] = h.light.temperature / h.profile.temperature
      metrics[`${key}_TLightM`] = h.light.temperature * h.m
      metrics[`${key}_TProfileM`] = h.profile.temperature * h.m
      metrics[`${key}_lightRadius`] = h.light.radius
      metrics[`${key}_lightPower`] = h.light.power
      metrics[`${key}_profileSlope`] = h.profile.slope
      metrics[`${key}_resolved`] = h.ivs.length
      lines.push(
        `r_h ${h.rh} (M ${h.m.toFixed(1)}, L ${h.length}, window ${h.window}): first live room ${h.firstRoom}/${BASE}, staircase cutoff ${h.stairEfolds.toFixed(3)} e-folds, light's largest ln z ${h.exp.top.toFixed(3)}; near zone ${h.exp.count} intervals spanning ${h.exp.span.toFixed(3)}, slope over kappa ${(h.exp.rate / h.profile.kappa).toFixed(3)}; kappa profile ${h.profile.kappa.toExponential(4)} light ${h.light.kappa.toExponential(4)} (T ratio ${(h.light.temperature / h.profile.temperature).toFixed(4)}), fit r_0 ${h.light.radius.toFixed(3)} p ${h.light.power.toFixed(3)} (profile s ${h.profile.slope.toFixed(3)}); T M light ${(h.light.temperature * h.m).toExponential(4)} profile ${(h.profile.temperature * h.m).toExponential(4)}; frozen detectors' weight ${h.frozenWeight}, inside packet's weight outside ${h.insideWeight}; intervals ${h.ivs.map(iv => `${iv.mid}:${iv.f.toFixed(4)}/${iv.lnz.toFixed(3)}/${iv.u.toFixed(0)}`).join(' ')}`,
      )
    })

    metrics.gate_E = e ? 1 : 0
    metrics.gate_H1 = h1 ? 1 : 0
    metrics.gate_H2 = h2 ? 1 : 0
    metrics.gate_H3 = h3 ? 1 : 0
    metrics.gate_H4 = h4 ? 1 : 0
    metrics.control_K1 = k1 ? 1 : 0
    metrics.control_K2 = k2 ? 1 : 0
    metrics.TMSpread = spreadOf(tm)
    metrics.TProfileMSpread = spreadOf(horizons.map(h => h.profile.temperature * h.m))
    metrics.cFlat = cFlat
    metrics.c0 = c0
    metrics.flatWorst = flatWorst
    metrics.speedExponent = speedExponent
    metrics.restExponent = restExponent
    metrics.bending = bending
    metrics.alphaSpread = alphaSpread
    metrics.alphaLocal = alphas[0]![0]!.alphaLocal
    metrics.alphaClosed = Math.sqrt(3) / (48 * D0)
    reductions.forEach(r => {
      metrics[`reduction_k${r.k}_arrivalOff`] = r.arrivalOff
      metrics[`reduction_k${r.k}_weightOff`] = r.weightOff
    })
    metrics.matterEqual = matterEqual.every(Boolean) ? 1 : 0
    metrics.oldInsideWeight = oldInsideWeight
    metrics.oldEfolds = oldExp.top
    metrics.oldNearCount = oldExp.count
    metrics.oldCFlat = oldCFlat
    metrics.splice = profile.splice
    metrics.gravityRatio = (2 * D0 + 1) / (2 * CAP)
    metrics.seconds = (Date.now() - started) / 1000

    lines.push(`speeds ${speeds.map(s => `${s.k}:${s.speed.toExponential(6)}`).join(' ')}; rest rates ${rests.map(r => `${r.k}:${r.rate.toExponential(6)}`).join(' ')}`)
    lines.push(`alpha_local ${alphas.map((row, i) => `D_m ${alphaDepths[i]}: ${row.map(a => a.alphaLocal.toExponential(9)).join(' ')}`).join('; ')}`)
    lines.push(`E-GRV-0120's rule at r_h ${h0.rh}: inside packet's weight outside ${oldInsideWeight.toExponential(3)}, largest ln z ${oldExp.top.toFixed(4)}, near zone ${oldExp.count}; intervals ${oldIvs.map(iv => `${iv.mid}:${iv.f.toFixed(4)}`).join(' ')}`)
    lines.push(`flat intervals ln z ${flatIvs.map(iv => iv.lnz.toExponential(2)).join(' ')}`)

    return verdict({
      status,
      claim: `the room coupling (f = h = (CAP - e) / CAP, register C = ${BASE}) on the box-free profile at r_h = ${R_H.join(', ')}: trapped ${h1}; largest resolved ln z ${horizons.map(h => h.exp.top.toFixed(3)).join(', ')} (staircase ${horizons.map(h => h.stairEfolds.toFixed(3)).join(', ')}); near-zone spans ${horizons.map(h => h.exp.span.toFixed(3)).join(', ')} (gate ${H2_SPAN}); T_light M spread ${spreadOf(tm).toFixed(4)} (gate ${H3_TOLERANCE}); bending ${bending.toFixed(4)}, alpha spread ${alphaSpread.toExponential(2)}; flat ${flatWorst.toExponential(2)}; E-GRV-0120's rule inside weight ${oldInsideWeight.toExponential(2)}; exact ${e}`,
      metrics,
      control: { k1: k1 ? 1 : 0, k2: k2 ? 1 : 0, flatWorst, oldInsideWeight, oldEfolds: oldExp.top },
      notes: `L2. E ${e}, H1 ${h1}, H2 ${h2}, H3 ${h3}, H4 ${h4}, K1 ${k1}, K2 ${k2}. ${lines.join('. ')}.`,
    })
  },
})
